<?php
require 'vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

function clean(string $v): string {
    return htmlspecialchars(trim($v), ENT_QUOTES, 'UTF-8');
}

/* ── Personal ── */
$prenom    = clean($_POST['prenom']    ?? '');
$nom       = clean($_POST['nom']       ?? '');
$headline  = clean($_POST['headline']  ?? '');
$email     = clean($_POST['email']     ?? '');
$telephone = clean($_POST['telephone'] ?? '');
$resume    = clean($_POST['resume']    ?? '');

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

$comp_arr   = $_POST['competence'] ?? [];
$niveau_arr = $_POST['niveau']     ?? [];

/* ── Build structured data for the template ── */
$experiences = [];
foreach ($postes as $i => $poste) {
    $experiences[] = [
        'poste'       => clean($poste),
        'entreprise'  => clean($entreprises[$i]   ?? ''),
        'debut'       => clean($debut_exp_arr[$i]  ?? ''),
        'fin'         => clean($fin_exp_arr[$i]    ?? ''),
        'description' => clean($desc_exp_arr[$i]  ?? ''),
    ];
}

$formations = [];
foreach ($diplomes as $i => $diplome) {
    $formations[] = [
        'diplome'     => clean($diplome),
        'ecole'       => clean($ecoles[$i]         ?? ''),
        'debut'       => clean($debut_form_arr[$i] ?? ''),
        'fin'         => clean($fin_form_arr[$i]   ?? ''),
        'description' => clean($desc_form_arr[$i] ?? ''),
    ];
}

$competences = [];
foreach ($comp_arr as $i => $nom) {
    if (trim($nom) === '') continue;
    $competences[] = [
        'nom'    => clean($nom),
        'niveau' => clean($niveau_arr[$i] ?? ''),
    ];
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
