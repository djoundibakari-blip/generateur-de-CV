document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".champ-cv").forEach(champ => {
        champ.addEventListener("input", mettreAJourApercu);
    });

    document.getElementById("btn-ajout-experience").addEventListener("click", ajouterExperience);
    document.getElementById("btn-ajout-formation").addEventListener("click", ajouterFormation);
    document.getElementById("btn-ajout-competence").addEventListener("click", ajouterCompetence);
});



function mettreAJourApercu() {
    const get = name => document.querySelector(`[name="${name}"]`)?.value || "";

    document.getElementById("apercu-nom").textContent =
        get("prenom") + " " + get("nom");

    document.getElementById("apercu-titre").textContent = get("headline");
    document.getElementById("apercu-contact").textContent =
        get("email") + " | " + get("telephone");

    document.getElementById("apercu-resume").textContent = get("resume");

    afficherExperiences();
    afficherFormations();
    afficherCompetences();
}


function ajouterExperience() {
    document.getElementById("bloc-experiences").insertAdjacentHTML("beforeend", `
        <div class="border p-2 mb-2">
            <input class="form-control mb-1 champ-cv" name="poste[]" placeholder="Poste">
            <input class="form-control mb-1 champ-cv" name="entreprise[]" placeholder="Entreprise">
            <input class="form-control mb-1 champ-cv" name="debut_exp[]" placeholder="Début">
            <input class="form-control mb-1 champ-cv" name="fin_exp[]" placeholder="Fin">
            <textarea class="form-control champ-cv" name="description_exp[]" placeholder="Description"></textarea>
        </div>
    `);

    activerEcouteurs();
}

function ajouterFormation() {
    document.getElementById("bloc-formations").insertAdjacentHTML("beforeend", `
        <div class="border p-2 mb-2">
            <input class="form-control mb-1 champ-cv" name="diplome[]" placeholder="Diplôme">
            <input class="form-control mb-1 champ-cv" name="ecole[]" placeholder="Établissement">
            <input class="form-control mb-1 champ-cv" name="debut_form[]" placeholder="Début">
            <input class="form-control champ-cv" name="fin_form[]" placeholder="Fin">
        </div>
    `);

    activerEcouteurs();
}

function ajouterCompetence() {
    document.getElementById("bloc-competences").insertAdjacentHTML("beforeend", `
        <div class="border p-2 mb-2">
            <input class="form-control mb-1 champ-cv" name="competence[]" placeholder="Compétence">
            <input class="form-control champ-cv" name="niveau[]" placeholder="Niveau">
        </div>
    `);

    activerEcouteurs();
}


function afficherExperiences() {
    const postes = document.querySelectorAll('[name="poste[]"]');
    const entreprises = document.querySelectorAll('[name="entreprise[]"]');
    const debuts = document.querySelectorAll('[name="debut_exp[]"]');
    const fins = document.querySelectorAll('[name="fin_exp[]"]');
    const descriptions = document.querySelectorAll('[name="description_exp[]"]');

    let html = "";
    postes.forEach((_, i) => {
        html += `<div>
            <strong>${postes[i].value}</strong> - ${entreprises[i].value}
            (${debuts[i].value} - ${fins[i].value})<br>
            ${descriptions[i].value}
        </div>`;
    });

    document.getElementById("apercu-experiences").innerHTML = html;
}

function afficherFormations() {
    const diplomes = document.querySelectorAll('[name="diplome[]"]');
    const ecoles = document.querySelectorAll('[name="ecole[]"]');
    const debuts = document.querySelectorAll('[name="debut_form[]"]');
    const fins = document.querySelectorAll('[name="fin_form[]"]');

    let html = "";
    diplomes.forEach((_, i) => {
        html += `<div>
            <strong>${diplomes[i].value}</strong> - ${ecoles[i].value}
            (${debuts[i].value} - ${fins[i].value})
        </div>`;
    });

    document.getElementById("apercu-formations").innerHTML = html;
}

function afficherCompetences() {
    const competences = document.querySelectorAll('[name="competence[]"]');
    const niveaux = document.querySelectorAll('[name="niveau[]"]');

    let html = "";
    competences.forEach((_, i) => {
        html += `<li>${competences[i].value} (${niveaux[i].value})</li>`;
    });

    document.getElementById("apercu-competences").innerHTML = html;
}


function activerEcouteurs() {
    document.querySelectorAll(".champ-cv").forEach(champ => {
        champ.removeEventListener("input", mettreAJourApercu);
        champ.addEventListener("input", mettreAJourApercu);
    });
}

