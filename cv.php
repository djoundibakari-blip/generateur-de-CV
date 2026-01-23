<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
</head>
<body>

<h1><?= htmlspecialchars($prenom) ?> <?= htmlspecialchars($nom) ?></h1>
<div class="headline"><?= htmlspecialchars($headline) ?></div>
<div><?= htmlspecialchars($email) ?> | <?= htmlspecialchars($telephone) ?></div>

<div class="section">Profil</div>
<p><?= nl2br(htmlspecialchars($resume)) ?></p>

<div class="secsectiontion">Expériences</div>
<?php foreach ($experiences as $e): ?>
    <p>
        <strong><?= htmlspecialchars($e['poste']) ?></strong> - <?= htmlspecialchars($e['entreprise']) ?><br>
        <?= htmlspecialchars($e['debut']) ?> - <?= htmlspecialchars($e['fin']) ?><br>
        <?= nl2br(htmlspecialchars($e['description'])) ?>
    </p>
<?php endforeach; ?>

<div class="section">Formations</div>
<?php foreach ($formations as $f): ?>
    <p>
        <strong><?= htmlspecialchars($f['diplome']) ?></strong> - <?= htmlspecialchars($f['ecole']) ?><br>
        <?= htmlspecialchars($f['debut']) ?> - <?= htmlspecialchars($f['fin']) ?>
    </p>
<?php endforeach; ?>


<div class="section">Compétences</div>
<ul>
    <?php foreach ($competences as $c): ?>
        <li><?= htmlspecialchars($c['nom']) ?> (<?= htmlspecialchars($c['niveau']) ?>)</li>
    <?php endforeach ; ?>
</ul>

</body>
</html>

