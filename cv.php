<?php
/**
 * Template CV — inclus par export.php qui injecte les variables suivantes.
 *
 * @var string   $prenom
 * @var string   $nom
 * @var string   $headline
 * @var string   $email
 * @var string   $telephone
 * @var string   $resume
 * @var array    $experiences  [['poste','entreprise','debut','fin','description'], …]
 * @var array    $formations   [['diplome','ecole','debut','fin','description'], …]
 * @var array    $competences  [['nom','niveau'], …]
 * @var string   $photo_data   data URI optionnelle (bonus photo)
 */

/* Helper: format YYYY-MM to "Mois AAAA" */
function fmtDate(string $raw): string {
    if ($raw === '') return '';
    $parts = explode('-', $raw);
    if (count($parts) === 2) {
        $months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
        $m = (int)$parts[1] - 1;
        $label = isset($months[$m]) ? $months[$m] . ' ' . $parts[0] : $raw;
    } else {
        $label = $raw;
    }
    return $label;
}

function dateRange(string $debut, string $fin): string {
    $s = fmtDate($debut);
    $e = $fin !== '' ? fmtDate($fin) : 'En cours';
    if ($s === '') return $e;
    return $s . ' → ' . $e;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  /* Moon palette: #F5D5E0 · #6667AB · #7B337E · #420D4B · #210635 */
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #210635; }

  /* Two-column layout via table */
  .layout      { display:table; width:100%; min-height:842px; }
  .sidebar     { display:table-cell; width:220px; background:#210635; color:#fff; padding:28px 18px; vertical-align:top; }
  .main        { display:table-cell; padding:28px 22px; vertical-align:top; background:#fff; }

  /* Sidebar */
  .avatar {
    width:70px; height:70px; border-radius:35px;
    background:rgba(245,213,224,.15); border:3px solid rgba(245,213,224,.3);
    margin:0 auto 14px; display:block;
    text-align:center; line-height:64px;
    font-size:24px; font-weight:700; color:#F5D5E0;
    overflow:hidden;
  }
  .avatar img { width:70px; height:70px; border-radius:35px; display:block; }

  .sb-name     { font-size:15px; font-weight:700; text-align:center; line-height:1.3; margin-bottom:4px; word-wrap:break-word; color:#F5D5E0; }
  .sb-headline { font-size:10px; color:rgba(245,213,224,.65); text-align:center; line-height:1.4; margin-bottom:16px; }

  .sb-section  { margin-bottom:18px; }
  .sb-label    { font-size:8px; text-transform:uppercase; letter-spacing:1.2px; color:rgba(102,103,171,.7); border-bottom:1px solid rgba(102,103,171,.25); padding-bottom:5px; margin-bottom:8px; }

  .contact-row { font-size:10px; color:rgba(245,213,224,.8); margin-bottom:5px; word-wrap:break-word; }

  .skill-row   { margin-bottom:7px; }
  .skill-name  { font-size:10px; color:rgba(245,213,224,.9); }
  .skill-level { font-size:8px; color:#6667AB; background:rgba(102,103,171,.15); padding:1px 5px; border-radius:3px; }

  /* Main content */
  .section     { margin-bottom:20px; }
  .sec-title   { font-size:10px; text-transform:uppercase; letter-spacing:1.5px; font-weight:700; color:#420D4B; margin-bottom:5px; }
  .sec-rule    { height:2px; background:#7B337E; border-radius:1px; margin-bottom:12px; }
  .profile-txt { font-size:11px; line-height:1.7; color:#3D1A45; }

  .entry       { margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #EDE0F0; }
  .entry:last-child { border-bottom:none; padding-bottom:0; margin-bottom:0; }

  .entry-head  { display:table; width:100%; margin-bottom:2px; }
  .entry-title { display:table-cell; font-size:12px; font-weight:700; color:#210635; }
  .entry-date  { display:table-cell; text-align:right; font-size:9px; color:#6667AB; font-weight:600; white-space:nowrap; }
  .entry-org   { font-size:10px; color:#7B337E; font-weight:500; margin-bottom:3px; }
  .entry-desc  { font-size:10px; color:#5C3063; line-height:1.65; margin-top:4px; }
</style>
</head>
<body>
<div class="layout">

  <!-- Sidebar -->
  <div class="sidebar">
    <div class="avatar">
      <?php if (isset($photo_data) && $photo_data !== ''): ?>
        <img src="<?= $photo_data ?>" alt="">
      <?php else: ?>
        <?= mb_strtoupper(mb_substr($prenom,0,1) . mb_substr($nom,0,1)) ?>
      <?php endif; ?>
    </div>

    <?php if ($prenom !== '' || $nom !== ''): ?>
      <div class="sb-name"><?= $prenom ?> <?= $nom ?></div>
    <?php endif; ?>
    <?php if ($headline !== ''): ?>
      <div class="sb-headline"><?= $headline ?></div>
    <?php endif; ?>

    <?php if ($email !== '' || $telephone !== ''): ?>
    <div class="sb-section">
      <div class="sb-label">Contact</div>
      <?php if ($email     !== ''): ?><div class="contact-row"><?= $email ?></div><?php endif; ?>
      <?php if ($telephone !== ''): ?><div class="contact-row"><?= $telephone ?></div><?php endif; ?>
    </div>
    <?php endif; ?>

    <?php if (!empty($competences)): ?>
    <div class="sb-section">
      <div class="sb-label">Compétences</div>
      <?php foreach ($competences as $c): ?>
        <div class="skill-row">
          <div class="skill-name"><?= $c['nom'] ?></div>
          <?php if ($c['niveau'] !== ''): ?>
            <span class="skill-level"><?= $c['niveau'] ?></span>
          <?php endif; ?>
        </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
  </div>

  <!-- Main content -->
  <div class="main">

    <?php if ($resume !== ''): ?>
    <div class="section">
      <div class="sec-title">Profil</div>
      <div class="sec-rule"></div>
      <p class="profile-txt"><?= nl2br($resume) ?></p>
    </div>
    <?php endif; ?>

    <?php if (!empty($experiences)): ?>
    <div class="section">
      <div class="sec-title">Expériences</div>
      <div class="sec-rule"></div>
      <?php foreach ($experiences as $e): ?>
        <?php if ($e['poste'] === '' && $e['entreprise'] === '') continue; ?>
        <div class="entry">
          <div class="entry-head">
            <div class="entry-title"><?= $e['poste'] ?></div>
            <?php if ($e['debut'] !== '' || $e['fin'] !== ''): ?>
              <div class="entry-date"><?= dateRange($e['debut'], $e['fin']) ?></div>
            <?php endif; ?>
          </div>
          <?php if ($e['entreprise'] !== ''): ?>
            <div class="entry-org"><?= $e['entreprise'] ?></div>
          <?php endif; ?>
          <?php if ($e['description'] !== ''): ?>
            <div class="entry-desc"><?= nl2br($e['description']) ?></div>
          <?php endif; ?>
        </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <?php if (!empty($formations)): ?>
    <div class="section">
      <div class="sec-title">Formations</div>
      <div class="sec-rule"></div>
      <?php foreach ($formations as $f): ?>
        <?php if ($f['diplome'] === '' && $f['ecole'] === '') continue; ?>
        <div class="entry">
          <div class="entry-head">
            <div class="entry-title"><?= $f['diplome'] ?></div>
            <?php if ($f['debut'] !== '' || $f['fin'] !== ''): ?>
              <div class="entry-date"><?= dateRange($f['debut'], $f['fin']) ?></div>
            <?php endif; ?>
          </div>
          <?php if ($f['ecole'] !== ''): ?>
            <div class="entry-org"><?= $f['ecole'] ?></div>
          <?php endif; ?>
          <?php if ($f['description'] !== ''): ?>
            <div class="entry-desc"><?= nl2br($f['description']) ?></div>
          <?php endif; ?>
        </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

  </div>
</div>
</body>
</html>
