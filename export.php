<?php
require 'vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;

function e($v) {
    return htmlspecialchars($v ?? '', ENT_QUOTES, 'UTF-8');
}

$prenom = e($_POST['prenom'] ?? '');
$nom = e($_POST['nom'] ?? '');
$headline = e($_POST['headline'] ?? '');
$email = e($_POST['email'] ?? '');
$telephone = e($_POST['telephone'] ?? '');
$resume = e($_POST['resume'] ?? '');

$postes = $_POST['poste'] ?? [];
$entreprises = $_POST['entreprise'] ?? [];
$debut_exp = $_POST['debut_exp'] ?? [];
$fin_exp = $_POST['fin_exp'] ?? [];
$description_exp = $_POST['description_exp'] ?? [];

$diplomes = $_POST['diplome'] ?? [];
$ecoles = $_POST['ecole'] ?? [];
$debut_form = $_POST['debut_form'] ?? [];
$fin_form = $_POST['fin_form'] ?? [];

$competences = $_POST['competence'] ?? [];
$niveaux = $_POST['niveau'] ?? [];

ob_start();
include 'cv.php';
$html = ob_get_clean();

$options = new Options();
$options->set('defaultFont', 'DejaVu Sans');

$pdf = new Dompdf($options);
$pdf->loadHtml($html);
$pdf->setPaper('A4');
$pdf->render();
$pdf->stream("cv.pdf", ["Attachment" => true]);

