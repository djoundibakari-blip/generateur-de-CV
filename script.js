document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".champ-cv").forEach(champ => {
        champ.addEventListener("input", mettreAJourApercu);
    });

    document.getElementById("btn-ajout-experience").addEventListener("click", ajouterExperience);
    document.getElementById("btn-ajout-formation").addEventListener("click", ajouterFormation);
    document.getElementById("btn-ajout-competence").addEventListener("click", ajouterCompetence);

    mettreAJourApercu();
});

function get(name) {
    return document.querySelector(`[name="${name}"]`)?.value || "";
}

function mettreAJourApercu() {
    document.getElementById("apercu-nom").textContent =
        (get("prenom") + " " + get("nom")).trim() || "Prénom Nom";

    document.getElementById("apercu-titre").textContent =
        get("headline") || "Titre professionnel";

    document.getElementById("apercu-contact").textContent =
        [get("email"), get("telephone")].filter(Boolean).join(" | ");

    document.getElementById("apercu-resume").textContent =
        get("resume") || "Votre résumé professionnel apparaîtra ici...";

    afficherExperiences();
    afficherFormations();
    afficherCompetences();
}

/* AJOUTS */

function ajouterExperience() {
    ajouterBloc("bloc-experiences", `
        <input class="form-control mb-1 champ-cv" name="poste[]" placeholder="Poste">
        <input class="form-control mb-1 champ-cv" name="entreprise[]" placeholder="Entreprise">
        <input class="form-control mb-1 champ-cv" name="debut_exp[]" placeholder="Début">
        <input class="form-control mb-1 champ-cv" name="fin_exp[]" placeholder="Fin">
        <textarea class="form-control mb-1 champ-cv" name="description_exp[]" placeholder="Description"></textarea>
    `, "Supprimer l’expérience");
}

function ajouterFormation() {
    ajouterBloc("bloc-formations", `
        <input class="form-control mb-1 champ-cv" name="diplome[]" placeholder="Diplôme">
        <input class="form-control mb-1 champ-cv" name="ecole[]" placeholder="Établissement">
        <input class="form-control mb-1 champ-cv" name="debut_form[]" placeholder="Début">
        <input class="form-control mb-1 champ-cv" name="fin_form[]" placeholder="Fin">
    `, "Supprimer la formation");
}

function ajouterCompetence() {
    ajouterBloc("bloc-competences", `
        <input class="form-control mb-1 champ-cv" name="competence[]" placeholder="Compétence">
        <input class="form-control mb-1 champ-cv" name="niveau[]" placeholder="Niveau">
    `, "Supprimer la compétence");
}

/* BLOC GÉNÉRIQUE */

function ajouterBloc(containerId, champsHTML, labelBtn) {
    document.getElementById(containerId).insertAdjacentHTML("beforeend", `
        <div class="border rounded p-2 mb-2 bloc-cv bg-white">
            ${champsHTML}
            <button type="button" class="btn btn-danger btn-sm mt-1" onclick="supprimerBloc(this)">
                ${labelBtn}
            </button>
        </div>
    `);
    activerEcouteurs();
}

function supprimerBloc(btn) {
    btn.closest(".bloc-cv").remove();
    mettreAJourApercu();
}

/* AFFICHAGE APERÇU */

function afficherExperiences() {
    const postes = document.querySelectorAll('[name="poste[]"]');
    const entreprises = document.querySelectorAll('[name="entreprise[]"]');
    const debuts = document.querySelectorAll('[name="debut_exp[]"]');
    const fins = document.querySelectorAll('[name="fin_exp[]"]');
    const descriptions = document.querySelectorAll('[name="description_exp[]"]');

    document.getElementById("apercu-experiences").innerHTML = [...postes].map((_, i) =>
        postes[i].value ? `
        <div class="mb-2">
            <strong>${postes[i].value}</strong> – ${entreprises[i].value}<br>
            <small>${debuts[i].value} - ${fins[i].value}</small><br>
            ${descriptions[i].value}
        </div>` : ""
    ).join("");
}

function afficherFormations() {
    const diplomes = document.querySelectorAll('[name="diplome[]"]');
    const ecoles = document.querySelectorAll('[name="ecole[]"]');
    const debuts = document.querySelectorAll('[name="debut_form[]"]');
    const fins = document.querySelectorAll('[name="fin_form[]"]');

    document.getElementById("apercu-formations").innerHTML = [...diplomes].map((_, i) =>
        diplomes[i].value ? `
        <div class="mb-2">
            <strong>${diplomes[i].value}</strong> – ${ecoles[i].value}<br>
            <small>${debuts[i].value} - ${fins[i].value}</small>
        </div>` : ""
    ).join("");
}

function afficherCompetences() {
    const competences = document.querySelectorAll('[name="competence[]"]');
    const niveaux = document.querySelectorAll('[name="niveau[]"]');

    document.getElementById("apercu-competences").innerHTML = [...competences].map((_, i) =>
        competences[i].value ? `<li>${competences[i].value} (${niveaux[i].value})</li>` : ""
    ).join("");
}

function activerEcouteurs() {
    document.querySelectorAll(".champ-cv").forEach(champ => {
        champ.removeEventListener("input", mettreAJourApercu);
        champ.addEventListener("input", mettreAJourApercu);
    });
}
