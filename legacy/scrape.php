<?php
header('Content-Type: application/json; charset=UTF-8');

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$url   = trim($input['url'] ?? '');

if (!filter_var($url, FILTER_VALIDATE_URL) || !preg_match('/^https?:\/\//i', $url)) {
    http_response_code(400);
    echo json_encode(['error' => 'URL invalide. Utilisez une URL commençant par http:// ou https://']);
    exit;
}

/* Block private/local IPs (security) */
$host = parse_url($url, PHP_URL_HOST);
if (preg_match('/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/', $host)) {
    http_response_code(403);
    echo json_encode(['error' => 'URL locale non autorisée']);
    exit;
}

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS      => 5,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    CURLOPT_HTTPHEADER     => [
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language: fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    ],
    CURLOPT_ENCODING       => '',       // auto-decode gzip/br
    CURLOPT_SSL_VERIFYPEER => true,
]);

$html = curl_exec($ch);
$err  = curl_error($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($html === false || $err) {
    http_response_code(502);
    echo json_encode(['error' => "Impossible de charger cette page : $err"]);
    exit;
}
if ($code >= 400) {
    http_response_code(502);
    echo json_encode(['error' => "La page a retourné une erreur HTTP $code. Elle est peut-être protégée (LinkedIn, etc.)"]);
    exit;
}

/* ── Extract readable text from HTML ── */
// Remove non-content blocks
$html = preg_replace('/<(script|style|noscript|nav|header|footer|aside|iframe|svg|figure)[^>]*>[\s\S]*?<\/\1>/i', '', $html);
// Block-level tags → newlines
$html = preg_replace('/<br\s*\/?>/i',   "\n",   $html);
$html = preg_replace('/<\/p>/i',        "\n\n",  $html);
$html = preg_replace('/<\/h[1-6]>/i',   "\n\n",  $html);
$html = preg_replace('/<\/li>/i',       "\n",    $html);
$html = preg_replace('/<\/div>/i',      "\n",    $html);
$html = preg_replace('/<\/section>/i',  "\n\n",  $html);
// Strip remaining tags
$text = strip_tags($html);
// Decode entities
$text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
// Normalise whitespace
$text = preg_replace('/[ \t]+/', ' ', $text);
$lines = array_map('trim', explode("\n", $text));
$lines = array_filter($lines, fn($l) => strlen($l) > 0);
// Remove very short or duplicate lines (menus, breadcrumbs, etc.)
$seen  = [];
$clean = [];
foreach ($lines as $l) {
    if (strlen($l) < 3) continue;
    $key = mb_strtolower(preg_replace('/\s+/', '', $l));
    if (isset($seen[$key])) continue;
    $seen[$key] = true;
    $clean[] = $l;
}
$text = implode("\n", $clean);
$text = preg_replace('/\n{3,}/', "\n\n", $text);
$text = trim($text);
// Limit to 8000 chars for Ollama context
$text = mb_substr($text, 0, 8000);

if (mb_strlen($text) < 100) {
    http_response_code(422);
    echo json_encode(['error' => 'Texte trop court extrait — cette page est peut-être dynamique (JS requis) ou protégée.']);
    exit;
}

echo json_encode(['text' => $text], JSON_UNESCAPED_UNICODE);
