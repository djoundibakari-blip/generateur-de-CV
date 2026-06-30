<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$OLLAMA = 'http://localhost:11434';

/* ── Models list ── */
if (($_GET['action'] ?? '') === 'models') {
    $raw = @file_get_contents("$OLLAMA/api/tags");
    if ($raw === false) {
        http_response_code(503);
        echo json_encode(['error' => 'Ollama non disponible. Lancez : ollama serve']);
        exit;
    }
    $data   = json_decode($raw, true);
    $models = array_values(array_map(fn($m) => $m['name'], $data['models'] ?? []));
    echo json_encode(['models' => $models]);
    exit;
}

/* ── Helper: call Ollama chat → parsed JSON or null ── */
function ollamaChat(
    string $base, string $model, array $messages,
    int $numPredict, int $numCtx, int $timeout,
    float $temperature = 0.15
): ?array {
    $payload = json_encode([
        'model'      => $model,
        'messages'   => $messages,
        'stream'     => false,
        'keep_alive' => 0,
        'options'    => ['temperature' => $temperature, 'num_predict' => $numPredict, 'num_ctx' => $numCtx],
    ], JSON_UNESCAPED_UNICODE);

    $ctx = stream_context_create(['http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/json\r\n",
        'content' => $payload,
        'timeout' => $timeout,
    ]]);

    $raw = @file_get_contents("$base/api/chat", false, $ctx);
    if ($raw === false) return null;

    $resp    = json_decode($raw, true);
    $content = $resp['message']['content'] ?? '';
    $content = preg_replace('/^```(?:json)?\s*/m', '', $content);
    $content = preg_replace('/\s*```$/m', '',          $content);
    if (preg_match('/\{[\s\S]+\}/u', $content, $m)) $content = $m[0];

    $parsed = json_decode($content, true);
    return json_last_error() === JSON_ERROR_NONE ? $parsed : null;
}

/* ── Helper: slim CV (remove photo + keep only useful fields) ── */
function slimCV(array $cv): array {
    return [
        'personal'    => array_diff_key($cv['personal'] ?? [], ['photo' => 1, 'photoUrl' => 1, 'photoFile' => 1]),
        'experiences' => array_map(
            fn($e) => array_intersect_key($e, array_flip(['id','poste','entreprise','debut','fin','description'])),
            $cv['experiences'] ?? []
        ),
        'competences' => array_map(
            fn($c) => array_intersect_key($c, array_flip(['id','nom','niveau'])),
            $cv['competences'] ?? []
        ),
        'formations'  => array_map(
            fn($f) => array_intersect_key($f, array_flip(['id','diplome','ecole','debut','fin'])),
            $cv['formations'] ?? []
        ),
        'langues'  => $cv['langues']  ?? [],
        'qualites' => $cv['qualites'] ?? [],
    ];
}

$input  = json_decode(file_get_contents('php://input'), true) ?? [];
$cv     = $input['cv']    ?? [];
$model  = trim($input['model'] ?? 'mistral');
$action = trim($input['action'] ?? ($_GET['action'] ?? 'adapt'));

/* ════════════════════════════════════════════════════════
   AGENT 1 — parse : CV texte brut → JSON structuré
   Modèle conseillé : qwen2.5:3b (rapide, extraction pure)
   ════════════════════════════════════════════════════════ */
if ($action === 'parse') {
    $cvText = mb_substr(trim($input['cvText'] ?? ''), 0, 5000);
    if (mb_strlen($cvText) < 30) {
        http_response_code(400); echo json_encode(['error' => 'Texte trop court.']); exit;
    }

    $system = <<<'SYS'
Tu es un expert en lecture et extraction de CV professionnels.
Tu réponds UNIQUEMENT avec du JSON valide, sans markdown, sans texte avant ou après.

Règles strictes :
- Le texte peut être désordonné (PDF 2 colonnes) : cherche l'info partout dans le texte
- Sépare TOUJOURS prénom et nom de famille en deux champs distincts
- Le prénom est généralement en MAJUSCULES ou avant le nom de famille
- Ne génère JAMAIS d'information absente du texte source
- Si un champ est absent : chaîne vide "" — jamais null
- Niveaux compétences selon contexte : "Débutant" | "Intermédiaire" | "Avancé" | "Expert"
- Dates : normalise en "2022" ou "jan. 2022" ou "présent"
- Le résumé/profil est le paragraphe descriptif de présentation, reproduis-le fidèlement
- Compétences : liste TOUS les outils, langages, frameworks mentionnés
- Si une ligne contient plusieurs compétences séparées par des virgules ou des tirets, crée une entrée par compétence
- Qualités : extrais les soft skills et qualités personnelles
- Passions/hobbies : liste les centres d'intérêt
SYS;

    $result = ollamaChat($OLLAMA, $model, [
        ['role' => 'system', 'content' => $system],
        ['role' => 'user',   'content' => <<<PROMPT
## TEXTE BRUT DU CV (peut être désordonné si PDF 2 colonnes)
$cvText

## FORMAT JSON STRICT — RIEN D'AUTRE
{
  "personal": {"prenom":"","nom":"","headline":"","email":"","telephone":"","resume":"","localisation":"","github":""},
  "experiences": [{"poste":"","entreprise":"","debut":"","fin":"","description":""}],
  "formations":  [{"diplome":"","ecole":"","debut":"","fin":"","description":""}],
  "competences": [{"nom":"","niveau":""}],
  "qualites":    [{"nom":""}],
  "langues":     [{"nom":"","niveau":""}],
  "passions":    [{"nom":""}]
}
PROMPT],
    ], numPredict: 1000, numCtx: 4096, timeout: 360, temperature: 0.1);

    if ($result === null) {
        http_response_code(503); echo json_encode(['error' => 'Ollama ne répond pas (parse).']); exit;
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

/* ════════════════════════════════════════════════════════
   AGENT 2 — extract_job : offre texte → exigences JSON
   Modèle conseillé : qwen2.5:3b (extraction structurée)
   ════════════════════════════════════════════════════════ */
if ($action === 'extract_job') {
    $offerText = mb_substr(trim($input['jobOffer'] ?? ''), 0, 3000);
    if (mb_strlen($offerText) < 20) {
        http_response_code(400); echo json_encode(['error' => 'Texte de l\'offre trop court.']); exit;
    }

    $system = <<<'SYS'
Tu es un recruteur senior expert en analyse d'offres d'emploi.
Tu réponds UNIQUEMENT avec du JSON valide, sans markdown, sans texte avant ou après.

Règles strictes :
- Distingue compétences OBLIGATOIRES (stack_obligatoire) et SOUHAITÉES (stack_souhaitee)
- Extrais UNIQUEMENT les informations EXPLICITEMENT présentes dans l'offre
- Ne déduis PAS de compétences implicites (si React est mentionné, n'ajoute pas JS sauf si écrit)
- Garde le wording EXACT de l'offre pour experience_requise
- Si une info est absente : chaîne vide ""
SYS;

    $result = ollamaChat($OLLAMA, $model, [
        ['role' => 'system', 'content' => $system],
        ['role' => 'user',   'content' => <<<PROMPT
## OFFRE D'EMPLOI
$offerText

## FORMAT JSON STRICT — RIEN D'AUTRE
{
  "poste": "",
  "entreprise": "",
  "secteur": "",
  "contrat": "",
  "localisation": "",
  "experience_requise": "",
  "niveau_etudes": "",
  "stack_obligatoire": [],
  "stack_souhaitee": [],
  "soft_skills": [],
  "missions_principales": []
}
PROMPT],
    ], numPredict: 400, numCtx: 2048, timeout: 240, temperature: 0.1);

    if ($result === null) {
        http_response_code(503); echo json_encode(['error' => 'Ollama ne répond pas (extract_job).']); exit;
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

/* ════════════════════════════════════════════════════════
   AGENT 2b — analyze : qualité CV (sans offre)
   ════════════════════════════════════════════════════════ */
if ($action === 'analyze') {
    $cvSlim = slimCV($cv);
    $cvJson = json_encode($cvSlim, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    $system = <<<'SYS'
Tu es un expert RH senior et coach carrière.
Tu réponds UNIQUEMENT avec du JSON valide, sans markdown, sans texte avant ou après.
SYS;

    $result = ollamaChat($OLLAMA, $model, [
        ['role' => 'system', 'content' => $system],
        ['role' => 'user',   'content' => <<<PROMPT
## CV À ANALYSER (JSON)
$cvJson

## MISSION
1. Score de qualité global (0–100) : clarté, exhaustivité, impact des descriptions, cohérence.
2. 3 à 5 points forts (ce qui est bien fait).
3. 3 à 5 points faibles ou axes d'amélioration concrets.
4. 3 à 5 suggestions d'amélioration actionnables et précises.
5. Sections importantes manquantes ou trop courtes.

## FORMAT JSON STRICT — RIEN D'AUTRE
{
  "score": 68,
  "points_forts": [],
  "points_faibles": [],
  "suggestions": [],
  "sections_manquantes": []
}
PROMPT],
    ], numPredict: 512, numCtx: 3072, timeout: 300, temperature: 0.3);

    if ($result === null) {
        http_response_code(503); echo json_encode(['error' => 'Ollama ne répond pas (analyze).']); exit;
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

/* ════════════════════════════════════════════════════════
   AGENT 3 — adapt : CV + exigences → CV adapté
   Modèle conseillé : qwen2.5:7b (raisonnement + réécriture)
   Accepte :
     - jobRequirements (JSON pré-extrait par Agent 2)  ← nouveau
     - jobOffer (texte brut) + fait l'extraction seul  ← fallback
   ════════════════════════════════════════════════════════ */
if ($action === 'adapt') {
    $jobRequirements = $input['jobRequirements'] ?? null;
    $jobOfferRaw     = trim($input['jobOffer'] ?? '');

    if ($jobRequirements === null && $jobOfferRaw === '') {
        http_response_code(400);
        echo json_encode(['error' => 'jobRequirements ou jobOffer requis.']);
        exit;
    }

    /* Si exigences pas encore extraites → extraction inline (fallback) */
    if ($jobRequirements === null) {
        $offerText = mb_substr($jobOfferRaw, 0, 3000);
        $jobRequirements = ollamaChat($OLLAMA, $model, [
            ['role' => 'system', 'content' => 'Tu es un recruteur expert. JSON uniquement, sans markdown.'],
            ['role' => 'user',   'content' => "## OFFRE\n{$offerText}\n\n## FORMAT JSON\n{\"poste\":\"\",\"stack_obligatoire\":[],\"stack_souhaitee\":[],\"soft_skills\":[],\"experience_requise\":\"\",\"niveau_etudes\":\"\",\"missions_principales\":[]}"],
        ], numPredict: 350, numCtx: 2048, timeout: 240, temperature: 0.1);

        if ($jobRequirements === null) {
            http_response_code(503);
            echo json_encode(['error' => 'Échec extraction offre (Agent 2 fallback).']);
            exit;
        }
    }

    $cvSlim       = slimCV($cv);
    $cvJson       = json_encode($cvSlim,          JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    $exigencesJson = json_encode($jobRequirements, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    $system = <<<'SYS'
Tu es un expert en optimisation de CV et en marketing personnel.
Tu réponds UNIQUEMENT avec du JSON valide, sans markdown, sans texte avant ou après.

RÈGLES ABSOLUES — HALLUCINATION INTERDITE :
1. Ne JAMAIS inventer une expérience, un diplôme, une compétence ou une date absente du CV source
2. Tu peux UNIQUEMENT : reformuler, réordonner, mettre en avant, adapter le vocabulaire
3. Pour chaque expérience reformulée : même entreprise, mêmes dates, mêmes faits — seule la formulation change
4. Compétences absentes → missing_skills UNIQUEMENT, jamais ajoutées au CV
5. Score honnête (0-100) basé sur la réelle correspondance, pas optimiste
6. Utilise les mots-clés EXACTS de l'offre dans les reformulations quand c'est justifié
SYS;

    $result = ollamaChat($OLLAMA, $model, [
        ['role' => 'system', 'content' => $system],
        ['role' => 'user',   'content' => <<<PROMPT
## EXIGENCES DU POSTE (JSON — extrait par Agent 2)
$exigencesJson

## CV DU CANDIDAT (JSON)
$cvJson

## MISSION
1. Réécris personal.resume : mets en avant les points qui matchent l'offre (max 500 car.).
2. Adapte personal.headline au poste si pertinent, sinon conserve-le.
3. Pour chaque expérience : reformule description avec les mots-clés du poste (garde les faits).
4. Réordonne competences : stack_obligatoire en premier, puis stack_souhaitee, puis reste.
5. Score de correspondance (0–100) honnête.
6. Compétences du poste absentes du CV → missing_skills (max 8).
7. Pour chaque item de stack_obligatoire, stack_souhaitee, soft_skills, experience_requise :
   indique si couvert par le CV avec une courte explication.

## FORMAT JSON STRICT — RIEN D'AUTRE
{
  "score": 72,
  "missing_skills": [],
  "headline": "",
  "resume": "",
  "experiences": [{"id":"ID_EXACT_DU_CV","description":""}],
  "competences":  [{"id":"ID_EXACT_DU_CV","nom":"","niveau":""}],
  "comparaison":  [{"exigence":"","present":true,"detail":""}]
}
PROMPT],
    ], numPredict: 900, numCtx: 4096, timeout: 540, temperature: 0.2);

    if ($result === null) {
        http_response_code(500);
        echo json_encode(['error' => 'Agent 3 (adapt) : JSON invalide ou timeout.']);
        exit;
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(400);
echo json_encode(['error' => "Action inconnue : $action"]);
