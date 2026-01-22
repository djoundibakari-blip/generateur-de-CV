<?php

require __DIR__ . '/vendor/autoload.php';

use Dompdf\Dompdf;

$prenom = $_POST['prenom'] ?? '';
$nom = $_POST['nom'] ?? '';
$headline = $_POST['headline'] ?? '';
$email = $_POST['email'] ?? '';
$telephone = $_POST['telephone'] ?? '';
$resume = $_POST['resume'] ?? '';

$experiences = [];
if (!empty($_POST['poste'])) {
    for ($i = 0; $i < count($_POST['poste']); $i++) {
        $experiences[] = [
            'poste' => $_POST[' poste'][$i] ?? '',
            'entreprise' => $_POST['entreprise'][$i] ?? '',
            'debut' => $_POST['debut_exp'][$i] ?? '',
            'fin' => $_POST['fin_exp'][$i] ?? '',
            'description' => $_POST['description_exp'][$i] ?? ''
        ];
    }
}

$formations = [];
if (!empty($_POST['diplome'])) {
    for ($i = 0; $i < count($_POST['diplome']); $i++) {
        $formations[] = [
            'diplome' => $_POST['diplome'][$i] ?? '',
            'ecole' => $_POST['ecole'][$i] ?? '',
            'debut' => $_POST['debut_form'][$i] ?? '',
            'fin' => $_POST['fin_form'][$i] ?? ''
        ];
    }
}

$competences = [];
if (!empty($_POST['competence'])) {
    for ($i = 0; $i < count($_POST['competence']); $i++) {
        $competences[] = [
            'nom' => $_POST['competence'][$i] ?? '',
            'niveau' => $_POST['niveau'][$i] ?? ''
        ];
    }
}


foreach ($experiences as $key => $exp) {
    if (empty(array_filter($exp))) {
        unset($experiences[$key]);
    }
}
foreach ($formations as $key => $form) {
    if (empty(array_filter($form))) {
        unset($formations[$key]);
    }
}
foreach ($competences as $key => $comp) {
    if (empty(array_filter($comp))) {
        unset($competences[$key]);
    }
}

ob_start();
include 'cv.php';
$html = ob_get_clean();
$dompdf = new Dompdf();
$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();
$dompdf->stream("cv.pdf", ["Attachment" => true]);
