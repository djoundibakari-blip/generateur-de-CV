

Ce projet consiste a concevoir un generateur de CV en ligne permettant a un utilisateur de concevoir, personnaliser et exporter son CV professionnel au format PDF. L'application offre une interface interactive avec une previsualisation en temps reel avant la generation du document final.





ARCHITECTURE TECHNIQUE

L'application repose sur un projet web complet separant les responsabilites entre le client et le serveur.

Front-End (Interface Utilisateur) La partie front-end est concue pour etre responsive, lisible et accessible.



Technologies : Utilisation de HTML, CSS, Bootstrap et JavaScript.


Gestion Dynamique : JavaScript permet l'ajout et la suppression dynamique des experiences, formations et competences via des formulaires structures.


Apercu Temps Reel : Au fur et a mesure de la saisie, le CV s'affiche en temps reel sur la page pour permettre une verification immediate.


Navigation : L'interface utilise un systeme d'onglets pour organiser la saisie des donnees (Personnel, Experience, Formation, Competences).

Back-End (Traitement et Export) Le back-end assure la securite et la transformation du contenu en document officiel.

Technologie : PHP est utilise pour le traitement serveur et la generation du PDF.


Securite : Toutes les donnees sont validees cote client et cote serveur pour garantir un code securise avant la generation.


Moteur de Rendu : Utilisation de la bibliotheque Dompdf pour convertir le HTML dynamique en un document PDF fidele a la version affichee.



Template : Le fichier cv.php sert de structure de rendu pour l'exportation finale.

INSTALLATION ET UTILISATION

Prerequis

Un serveur local (ex: XAMPP, WAMP, MAMP) avec PHP.

Composer installe pour gerer les dependances.

Installation

Clonez ce depot dans votre repertoire de travail.

Installez la bibliotheque Dompdf via le terminal a la racine du projet avec la commande : composer require dompdf/dompdf.

Utilisation

Ouvrez l'application via votre serveur local sur le fichier index.html.

Remplissez les informations dans le formulaire.

Ajoutez des blocs pour vos experiences et diplomes.

Visualisez le rendu instantanement dans la colonne Apercu.

Cliquez sur le bouton de telechargement pour recuperer le fichier PDF final.



LIVRABLES

Code complet comprenant les fichiers HTML, CSS, JS et PHP.

Un fichier README expliquant l'installation et l'utilisation.

Projet realise dans le cadre du cursus EPITECH.


/projet-cv
│
├── index.html        ← interface + formulaire
├── script.js         ← logique JS (ajout, suppression, aperçu)
├── export.php        ← génération du PDF
├── cv.php            ← template HTML du CV pour Dompdf
├── vendor/           ← Dompdf (composer)
