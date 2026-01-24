document.addEventListener("DOMContentLoaded", function () {

  // Mise à jour aperçu
  document.querySelectorAll(".champ-cv").forEach(champ =>
    champ.addEventListener("input", mettreAJourApercu)
  );

  // Boutons ajout
  document.getElementById("btn-ajout-experience").onclick = ajouterExperience;
  document.getElementById("btn-ajout-formation").onclick = ajouterFormation;
  document.getElementById("btn-ajout-competence").onclick = ajouterCompetence;

  // Onglets
  document.querySelectorAll("#cv-tabs a").forEach(tab => {
    tab.addEventListener("click", function (e) {
      e.preventDefault();

      document.querySelectorAll("#cv-tabs li").forEach(li =>
        li.classList.remove("active")
      );
      this.parentElement.classList.add("active");

      document.querySelectorAll(".tab-content-cv").forEach(c =>
        c.style.display = "none"
      );

      document.getElementById("tab-" + this.dataset.tab).style.display = "block";
    });
  });

  mettreAJourApercu();
});

const get = name => document.querySelector(`[name="${name}"]`)?.value || "";

function mettreAJourApercu() {
  document.getElementById("apercu-nom").textContent =
    (get("prenom") + " " + get("nom")).trim();

  document.getElementById("apercu-titre").textContent = get("headline");
  document.getElementById("apercu-contact").textContent =
    [get("email"), get("telephone")].filter(Boolean).join(" | ");

  document.getElementById("apercu-resume").textContent = get("resume");

  afficherExperiences();
  afficherFormations();
  afficherCompetences();
}

function ajouterBloc(containerId, html) {
  document.getElementById(containerId).insertAdjacentHTML("beforeend", `
    <div class="well">
      ${html}
      <button type="button" class="btn btn-danger btn-xs" onclick="supprimerBloc(this)">
        Supprimer
      </button>
    </div>
  `);
  activerEcouteurs();
}

function supprimerBloc(btn) {
  btn.parentElement.remove();
  mettreAJourApercu();
}

function ajouterExperience() {
  ajouterBloc("bloc-experiences", `
    <input class="form-control champ-cv" name="poste[]" placeholder="Poste">
    <input class="form-control champ-cv" name="entreprise[]" placeholder="Entreprise">
    <input class="form-control champ-cv" name="debut_exp[]" placeholder="Début">
    <input class="form-control champ-cv" name="fin_exp[]" placeholder="Fin">
    <textarea class="form-control champ-cv" name="description_exp[]" placeholder="Description"></textarea>
  `);
}

function ajouterFormation() {
  ajouterBloc("bloc-formations", `
    <input class="form-control champ-cv" name="diplome[]" placeholder="Diplôme">
    <input class="form-control champ-cv" name="ecole[]" placeholder="Établissement">
    <input class="form-control champ-cv" name="debut_form[]" placeholder="Début">
    <input class="form-control champ-cv" name="fin_form[]" placeholder="Fin">
  `);
}

function ajouterCompetence() {
  ajouterBloc("bloc-competences", `
    <input class="form-control champ-cv" name="competence[]" placeholder="Compétence">
    <input class="form-control champ-cv" name="niveau[]" placeholder="Niveau">
  `);
}

function afficherExperiences() {
  const postes = document.querySelectorAll('[name="poste[]"]');
  const entreprises = document.querySelectorAll('[name="entreprise[]"]');

  document.getElementById("apercu-experiences").innerHTML =
    [...postes].map((_, i) =>
      postes[i].value
        ? `<p><strong>${postes[i].value}</strong> – ${entreprises[i].value}</p>`
        : ""
    ).join("");
}

function afficherFormations() {
  const diplomes = document.querySelectorAll('[name="diplome[]"]');
  const ecoles = document.querySelectorAll('[name="ecole[]"]');

  document.getElementById("apercu-formations").innerHTML =
    [...diplomes].map((_, i) =>
      diplomes[i].value
        ? `<p><strong>${diplomes[i].value}</strong> – ${ecoles[i].value}</p>`
        : ""
    ).join("");
}

function afficherCompetences() {
  const competences = document.querySelectorAll('[name="competence[]"]');
  const niveaux = document.querySelectorAll('[name="niveau[]"]');

  document.getElementById("apercu-competences").innerHTML =
    [...competences].map((_, i) =>
      competences[i].value
        ? `<li>${competences[i].value} (${niveaux[i].value})</li>`
        : ""
    ).join("");
}

function activerEcouteurs() {
  document.querySelectorAll(".champ-cv").forEach(c => {
    c.removeEventListener("input", mettreAJourApercu);
    c.addEventListener("input", mettreAJourApercu);
  });
}

