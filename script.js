document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".champ-cv").forEach(c =>
        c.addEventListener("input", mettreAJourApercu)
    );

    document.getElementById("btn-ajout-experience").onclick = ajouterExperience;
    document.getElementById("btn-ajout-formation").onclick = ajouterFormation;
    document.getElementById("btn-ajout-competence").onclick = ajouterCompetence;

    mettreAJourApercu();
});

const get = name => document.querySelector(`[name="${name}"]`)?.value || "";

function mettreAJourApercu() {
    document.getElementById("apercu-nom").textContent =
        (get("prenom") + " " + get("nom")).trim() || "Prénom Nom";

    document.getElementById("apercu-titre").textContent = get("headline");
    document.getElementById("apercu-contact").textContent =
        [get("email"), get("telephone")].filter(Boolean).join(" | ");

    document.getElementById("apercu-resume").textContent = get("resume");

    afficherExperiences();
    afficherFormations();
    afficherCompetences();
}

function ajouterBloc(id, html) {
    document.getElementById(id).insertAdjacentHTML("beforeend", `
        <div class="border rounded p-2 mb-2 bloc-cv bg-white">
            ${html}
            <button type="button" class="btn btn-danger btn-sm mt-1" onclick="supprimerBloc(this)">
                Supprimer
            </button>
        </div>
    `);
    activerEcouteurs();
}

function supprimerBloc(btn) {
    btn.closest(".bloc-cv").remove();
    mettreAJourApercu();
}

function ajouterExperience() {
    ajouterBloc("bloc-experiences", `
        <input class="form-control mb-1 champ-cv" name="poste[]" placeholder="Poste">
        <input class="form-control mb-1 champ-cv" name="entreprise[]" placeholder="Entreprise">
        <input class="form-control mb-1 champ-cv" name="debut_exp[]" placeholder="Début">
        <input class="form-control mb-1 champ-cv" name="fin_exp[]" placeholder="Fin">
        <textarea class="form-control champ-cv" name="description_exp[]" placeholder="Description"></textarea>
    `);
}

function ajouterFormation() {
    ajouterBloc("bloc-formations", `
        <input class="form-control mb-1 champ-cv" name="diplome[]" placeholder="Diplôme">
        <input class="form-control mb-1 champ-cv" name="ecole[]" placeholder="École">
        <input class="form-control mb-1 champ-cv" name="debut_form[]" placeholder="Début">
        <input class="form-control champ-cv" name="fin_form[]" placeholder="Fin">
    `);
}

function ajouterCompetence() {
    ajouterBloc("bloc-competences", `
        <input class="form-control mb-1 champ-cv" name="competence[]" placeholder="Compétence">
        <input class="form-control champ-cv" name="niveau[]" placeholder="Niveau">
    `);
}

function afficherExperiences() {
    const postes = document.querySelectorAll('[name="poste[]"]');
    const entreprises = document.querySelectorAll('[name="entreprise[]"]');
    const debuts = document.querySelectorAll('[name="debut_exp[]"]');
    const fins = document.querySelectorAll('[name="fin_exp[]"]');
    const desc = document.querySelectorAll('[name="description_exp[]"]');

    document.getElementById("apercu-experiences").innerHTML =
        [...postes].map((_, i) =>
            postes[i].value ? `
            <div>
                <strong>${postes[i].value}</strong> – ${entreprises[i].value}<br>
                <small>${debuts[i].value} - ${fins[i].value}</small>
                <p>${desc[i].value}</p>
            </div>` : ""
        ).join("");
}

function afficherFormations() {
    const d = document.querySelectorAll('[name="diplome[]"]');
    const e = document.querySelectorAll('[name="ecole[]"]');
    const db = document.querySelectorAll('[name="debut_form[]"]');
    const f = document.querySelectorAll('[name="fin_form[]"]');

    document.getElementById("apercu-formations").innerHTML =
        [...d].map((_, i) =>
            d[i].value ? `
            <div>
                <strong>${d[i].value}</strong> – ${e[i].value}<br>
                <small>${db[i].value} - ${f[i].value}</small>
            </div>` : ""
        ).join("");
}

function afficherCompetences() {
    const c = document.querySelectorAll('[name="competence[]"]');
    const n = document.querySelectorAll('[name="niveau[]"]');

    document.getElementById("apercu-competences").innerHTML =
        [...c].map((_, i) =>
            c[i].value ? `<li>${c[i].value} (${n[i].value})</li>` : ""
        ).join("");
}

function activerEcouteurs() {
    document.querySelectorAll(".champ-cv").forEach(c => {
        c.removeEventListener("input", mettreAJourApercu);
        c.addEventListener("input", mettreAJourApercu);
    });
}
