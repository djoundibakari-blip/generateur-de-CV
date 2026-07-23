<?php
/**
 * @var string $prenom
 * @var string $nom
 * @var string $headline
 * @var string $email
 * @var string $telephone
 * @var string $resume
 * @var string $localisation
 * @var string $github
 * @var array  $experiences  [['poste','entreprise','debut','fin','description'], …]
 * @var array  $formations   [['diplome','ecole','debut','fin','description'], …]
 * @var array  $competences  [['nom','niveau'], …]
 * @var array  $qualites     string[]
 * @var array  $langues      [['nom','niveau'], …]
 * @var array  $passions     string[]
 */

function fmtDate(string $raw): string {
    if ($raw === '') return '';
    $parts = explode('-', $raw);
    if (count($parts) === 2) {
        $months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
        $m = (int)$parts[1] - 1;
        return (isset($months[$m]) ? $months[$m] . ' ' : '') . $parts[0];
    }
    return $raw;
}

function dateRange(string $debut, string $fin): string {
    $s = fmtDate($debut);
    $e = $fin !== '' ? fmtDate($fin) : 'En cours';
    return $s !== '' ? "$s – $e" : $e;
}

function renderDesc(string $desc): string {
    if ($desc === '') return '';
    $lines = array_filter(array_map('trim', explode("\n", $desc)));
    if (count($lines) <= 1) {
        return '<p class="entry-desc">' . htmlspecialchars($desc, ENT_QUOTES, 'UTF-8') . '</p>';
    }
    $html = '<ul class="entry-list">';
    foreach ($lines as $line) {
        $line = preg_replace('/^[•\-\*]\s*/', '', $line);
        $html .= '<li>' . htmlspecialchars($line, ENT_QUOTES, 'UTF-8') . '</li>';
    }
    return $html . '</ul>';
}
/* Variables injected by export.php — defaults silence static analysis */
$prenom       ??= '';
$nom          ??= '';
$headline     ??= '';
$email        ??= '';
$telephone    ??= '';
$resume       ??= '';
$localisation ??= '';
$github       ??= '';
$experiences  ??= [];
$formations   ??= [];
$competences  ??= [];
$qualites     ??= [];
$langues      ??= [];
$passions     ??= [];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: DejaVu Sans, sans-serif; font-size:10px; color:#1a1a1a; }

/* ── Header full-width ── */
.cv-header {
  background:#1B2744; color:#fff;
  padding:18px 24px 14px;
  width:100%;
}
.header-name {
  font-size:22px; font-weight:700;
  text-transform:uppercase; letter-spacing:2px;
  line-height:1.15; margin-bottom:4px;
}
.header-title {
  font-size:9px; text-transform:uppercase;
  letter-spacing:2.5px; color:rgba(255,255,255,.65);
}

/* ── Body: display:table two-column ── */
.body-table { display:table; width:100%; }
.sidebar    { display:table-cell; width:190px; background:#1B2744; color:#fff; padding:18px 12px; vertical-align:top; }
.main       { display:table-cell; padding:16px 18px; vertical-align:top; background:#fff; }

/* Sidebar elements */
.avatar {
  width:80px; height:80px; border-radius:40px;
  background:rgba(255,255,255,.12); border:3px solid rgba(255,255,255,.25);
  margin:0 auto 14px; display:block;
  text-align:center; line-height:74px;
  font-size:22px; font-weight:700; color:#fff;
  overflow:hidden;
}
.avatar img { width:80px; height:80px; border-radius:40px; display:block; }

.sb-section { margin-bottom:14px; }
.sb-label {
  font-size:7.5px; text-transform:uppercase; letter-spacing:1.3px;
  color:rgba(255,255,255,.48); font-weight:700;
  border-bottom:1px solid rgba(255,255,255,.14);
  padding-bottom:4px; margin-bottom:6px;
}
.sb-item  { font-size:8.5px; color:rgba(255,255,255,.82); margin-bottom:4px; line-height:1.5; word-wrap:break-word; }
.sb-bullet { font-size:8.5px; color:rgba(255,255,255,.85); margin-bottom:3px; line-height:1.45; }

/* Main sections */
.section { margin-bottom:16px; }
.sec-heading {
  font-size:9.5px; text-transform:uppercase; letter-spacing:1.4px;
  font-weight:700; color:#1B2744; margin-bottom:4px;
}
.sec-rule { height:2px; background:#4BAFC8; border-radius:1px; margin-bottom:10px; }

.profile-txt { font-size:9.5px; line-height:1.75; color:#374151; }

.entry { margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #EEF0F4; }
.entry:last-child { border-bottom:none; margin-bottom:0; padding-bottom:0; }

.entry-head  { display:table; width:100%; margin-bottom:2px; }
.entry-title { display:table-cell; font-size:10px; font-weight:700; color:#111827; }
.entry-date  { display:table-cell; text-align:right; font-size:8px; color:#4BAFC8; font-weight:600; white-space:nowrap; }

.entry-desc { font-size:9px; color:#4B5563; line-height:1.65; margin-top:3px; }
.entry-list { margin-top:4px; padding-left:12px; font-size:9px; color:#4B5563; line-height:1.65; }
.entry-list li { margin-bottom:1px; }
</style>
</head>
<body>

<!-- Header -->
<div class="cv-header">
  <div class="header-name"><?= $prenom ?> <?= $nom ?></div>
  <?php if ($headline !== ''): ?>
    <div class="header-title"><?= $headline ?></div>
  <?php endif; ?>
</div>

<!-- Body -->
<div class="body-table">

  <!-- Sidebar -->
  <div class="sidebar">
    <div class="avatar">
      <?php if (isset($photo_data) && $photo_data !== ''): ?>
        <img src="<?= $photo_data ?>" alt="">
      <?php else: ?>
        <?= mb_strtoupper(mb_substr($prenom,0,1) . mb_substr($nom,0,1)) ?>
      <?php endif; ?>
    </div>

    <?php if ($email !== '' || $telephone !== '' || $localisation !== '' || $github !== ''): ?>
    <div class="sb-section">
      <div class="sb-label">Contact</div>
      <?php if ($telephone    !== ''): ?><div class="sb-item">📞 <?= $telephone ?></div><?php endif; ?>
      <?php if ($email        !== ''): ?><div class="sb-item">✉ <?= $email ?></div><?php endif; ?>
      <?php if ($localisation !== ''): ?><div class="sb-item">📍 <?= $localisation ?></div><?php endif; ?>
      <?php if ($github       !== ''): ?><div class="sb-item">🔗 <?= $github ?></div><?php endif; ?>
    </div>
    <?php endif; ?>

    <?php if (!empty($competences)): ?>
    <div class="sb-section">
      <div class="sb-label">Compétences</div>
      <?php foreach ($competences as $c): ?>
        <div class="sb-bullet">• <?= $c['nom'] ?></div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <?php if (!empty($qualites)): ?>
    <div class="sb-section">
      <div class="sb-label">Qualités</div>
      <?php foreach ($qualites as $q): ?>
        <div class="sb-bullet">• <?= $q ?></div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <?php if (!empty($langues)): ?>
    <div class="sb-section">
      <div class="sb-label">Langues</div>
      <?php foreach ($langues as $l): ?>
        <div class="sb-bullet">• <?= $l['nom'] ?><?= $l['niveau'] !== '' ? ' (' . $l['niveau'] . ')' : '' ?></div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <?php if (!empty($passions)): ?>
    <div class="sb-section">
      <div class="sb-label">Passions</div>
      <?php foreach ($passions as $p): ?>
        <div class="sb-bullet">• <?= $p ?></div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>
  </div>

  <!-- Main -->
  <div class="main">

    <?php if ($resume !== ''): ?>
    <div class="section">
      <div class="sec-heading">Profil</div>
      <div class="sec-rule"></div>
      <p class="profile-txt"><?= nl2br($resume) ?></p>
    </div>
    <?php endif; ?>

    <?php if (!empty($experiences)): ?>
    <div class="section">
      <div class="sec-heading">Expérience Professionnelle</div>
      <div class="sec-rule"></div>
      <?php foreach ($experiences as $e): ?>
        <?php if ($e['poste'] === '' && $e['entreprise'] === '') continue; ?>
        <div class="entry">
          <div class="entry-head">
            <div class="entry-title"><?= $e['poste'] ?><?= $e['entreprise'] !== '' ? ' — ' . $e['entreprise'] : '' ?></div>
            <?php if ($e['debut'] !== '' || $e['fin'] !== ''): ?>
              <div class="entry-date"><?= dateRange($e['debut'], $e['fin']) ?></div>
            <?php endif; ?>
          </div>
          <?= renderDesc($e['description']) ?>
        </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <?php if (!empty($formations)): ?>
    <div class="section">
      <div class="sec-heading">Formation</div>
      <div class="sec-rule"></div>
      <?php foreach ($formations as $f): ?>
        <?php if ($f['diplome'] === '' && $f['ecole'] === '') continue; ?>
        <div class="entry">
          <div class="entry-head">
            <div class="entry-title"><?= $f['diplome'] ?><?= $f['ecole'] !== '' ? ' — ' . $f['ecole'] : '' ?></div>
            <?php if ($f['debut'] !== '' || $f['fin'] !== ''): ?>
              <div class="entry-date"><?= dateRange($f['debut'], $f['fin']) ?></div>
            <?php endif; ?>
          </div>
          <?= renderDesc($f['description']) ?>
        </div>
      <?php endforeach; ?>
    </div>
    <?php endif; ?>

  </div>
</div>
</body>
</html>
