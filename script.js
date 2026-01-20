document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".champ-cv").forEach(champ => {
        champ.addEventListener("input", mettreAJourApercu);
    });

    const btnExp = document.getElementById("btn-ajout-experience");
    const btnForm = document.getElementById("btn-ajout-formation");
    const btnComp = document.getElementById("btn-ajout-competence");

    if (btnExp) btnExp.addEventListener("click", ajouterExperience);
    if (btnForm) btnForm.addEventListener("click", ajouterFormation);
    if (btnComp) btnComp.addEventListener("click", ajouterCompetence);

    mettreAJourApercu();
});

function mettreAJourApercu() {
    const get = name => document.querySelector(`[name="${name}"]`)?.value || "";

    document.getElementById("apercu-nom").textContent =
        (get("prenom") + " " + get("nom")).trim() || "Prénom Nom";

    document.getElementById("apercu-titre").textContent =
        get("headline") || "Titre professionnel";

    document.getElementById("apercu-contact").textContent =
        (get("email") + " | " + get("telephone")).trim();

    document.getElementById("apercu-resume").textContent =
        get("resume") || "Votre résumé apparaîtra ici";

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
            <textarea class="form-control champ-cv mb-2" name="description_exp[]" placeholder="Description"></textarea>

            <button type="button" class="btn btn-sm btn-danger w-100 btn-supprimer">
                Supprimer cette expérience
            </button>
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
            <input class="form-control champ-cv mb-2" name="fin_form[]" placeholder="Fin">

            <button type="button" class="btn btn-sm btn-danger w-100 btn-supprimer">
                Supprimer cette formation
            </button>
        </div>
    `);

    activerEcouteurs();
}

function ajouterCompetence() {
    document.getElementById("bloc-competences").insertAdjacentHTML("beforeend", `
        <div class="border p-2 mb-2">
            <input class="form-control mb-1 champ-cv" name="competence[]" placeholder="Compétence">
            <input class="form-control champ-cv mb-2" name="niveau[]" placeholder="Niveau">

            <button type="button" class="btn btn-sm btn-danger w-100 btn-supprimer">
                Supprimer cette compétence
            </button>
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
        if (postes[i].value || entreprises[i].value || descriptions[i].value) {
            html += `
                <div>
                    <strong>${postes[i].value}</strong> - ${entreprises[i].value}<br>
                    ${debuts[i].value} - ${fins[i].value}<br>
                    ${descriptions[i].value}
                </div>
            `;
        }
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
        if (diplomes[i].value || ecoles[i].value) {
            html += `
                <div>
                    <strong>${diplomes[i].value}</strong> - ${ecoles[i].value}<br>
                    ${debuts[i].value} - ${fins[i].value}
                </div>
            `;
        }
    });

    document.getElementById("apercu-formations").innerHTML = html;
}

function afficherCompetences() {
    const competences = document.querySelectorAll('[name="competence[]"]');
    const niveaux = document.querySelectorAll('[name="niveau[]"]');

    let html = "";

    competences.forEach((_, i) => {
        if (competences[i].value) {
            html += `<li>${competences[i].value} (${niveaux[i].value})</li>`;
        }
    });

    document.getElementById("apercu-competences").innerHTML = html;
}

function activerEcouteurs() {
    document.querySelectorAll(".champ-cv").forEach(champ => {java
        champ.removeEventListener("input", mettreAJourApercu);
        champ.addEventListener("input", mettreAJourApercu);
    });
}

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-supprimer")) {
        e.target.closest(".border").remove();
        mettreAJourApercu();
    }
});
