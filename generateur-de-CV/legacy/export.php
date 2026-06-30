<?php
require 'vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

function clean(string $v): string {
    return htmlspecialchars(trim($v), ENT_QUOTES, 'UTF-8');
}

/* ── Personal ── */
$prenom       = clean($_POST['prenom']       ?? '');
$nom          = clean($_POST['nom']          ?? '');
$headline     = clean($_POST['headline']     ?? '');
$email        = clean($_POST['email']        ?? '');
$telephone    = clean($_POST['telephone']    ?? '');
$resume       = clean($_POST['resume']       ?? '');
$localisation = clean($_POST['localisation'] ?? '');
$github       = clean($_POST['github']       ?? '');

/* ── Arrays ── */
$postes         = $_POST['poste']           ?? [];
$entreprises    = $_POST['entreprise']      ?? [];
$debut_exp_arr  = $_POST['debut_exp']       ?? [];
$fin_exp_arr    = $_POST['fin_exp']         ?? [];
$desc_exp_arr   = $_POST['description_exp'] ?? [];

$diplomes       = $_POST['diplome']           ?? [];
$ecoles         = $_POST['ecole']             ?? [];
$debut_form_arr = $_POST['debut_form']        ?? [];
$fin_form_arr   = $_POST['fin_form']          ?? [];
$desc_form_arr  = $_POST['description_form']  ?? [];

$comp_arr        = $_POST['competence']    ?? [];
$niveau_arr      = $_POST['niveau']        ?? [];
$qualite_arr     = $_POST['qualite']       ?? [];
$langue_arr      = $_POST['langue']        ?? [];
$langue_niv_arr  = $_POST['langue_niveau'] ?? [];
$passion_arr     = $_POST['passion']       ?? [];

/* ── Build structured data ── */
$experiences = [];
foreach ($postes as $i => $poste) {
    $experiences[] = [
        'poste'       => clean($poste),
        'entreprise'  => clean($entreprises[$i]  ?? ''),
        'debut'       => clean($debut_exp_arr[$i] ?? ''),
        'fin'         => clean($fin_exp_arr[$i]   ?? ''),
        'description' => clean($desc_exp_arr[$i]  ?? ''),
    ];
}

$formations = [];
foreach ($diplomes as $i => $diplome) {
    $formations[] = [
        'diplome'     => clean($diplome),
        'ecole'       => clean($ecoles[$i]          ?? ''),
        'debut'       => clean($debut_form_arr[$i]  ?? ''),
        'fin'         => clean($fin_form_arr[$i]    ?? ''),
        'description' => clean($desc_form_arr[$i]   ?? ''),
    ];
}

$competences = [];
foreach ($comp_arr as $i => $nom_c) {
    if (trim($nom_c) === '') continue;
    $competences[] = ['nom' => clean($nom_c), 'niveau' => clean($niveau_arr[$i] ?? '')];
}

$qualites = [];
foreach ($qualite_arr as $q) {
    if (trim($q) !== '') $qualites[] = clean($q);
}

$langues = [];
foreach ($langue_arr as $i => $lang) {
    if (trim($lang) === '') continue;
    $langues[] = ['nom' => clean($lang), 'niveau' => clean($langue_niv_arr[$i] ?? '')];
}

$passions = [];
foreach ($passion_arr as $p) {
    if (trim($p) !== '') $passions[] = clean($p);
}

/* ── Render HTML ── */
ob_start();
include 'cv.php';
$html = ob_get_clean();

/* ── Generate PDF ── */
$options = new Options();
$options->set('defaultFont', 'DejaVu Sans');
$options->set('isRemoteEnabled', false);

$pdf = new Dompdf($options);
$pdf->loadHtml($html);
$pdf->setPaper('A4', 'portrait');
$pdf->render();
$pdf->stream('cv.pdf', ['Attachment' => true]);
