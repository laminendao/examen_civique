/* « Liens utiles » : l'examen en bref et les liens officiels, regroupés par besoin. */
import { page, render, help } from "../ui/layout.js";
import { EXAMS, EXAM_ORDER } from "../core/data.js";

const link = (href, title, desc) => `<li><a class="lrow" href="${href}" target="_blank" rel="noopener">
  <span><b>${title}</b><small>${desc}</small></span><i class='ic' data-i='external'></i></a></li>`;

const group = (icon, title, intro, links) => `<section class="lgroup">
  <h2><i class='ic' data-i='${icon}'></i> ${title}</h2>
  <ul>${links.join("")}</ul></section>`;

export function showInfo(){
  render(page("<i class='ic' data-i='link'></i>", "Liens utiles", help("Informations officielles vérifiées en octobre 2026. En cas de doute, le site du ministère fait foi."), `<div class="useful-page">

    <section class="facts card">
      <h2><i class='ic' data-i='compass'></i> L'examen en bref</h2>
      <dl>
        <div><dt>Format</dt><dd><b>40 questions</b> en QCM : 28 de connaissance et 12 mises en situation</dd></div>
        <div><dt>Durée</dt><dd><b>45 minutes</b> au maximum, sur tablette ou ordinateur</dd></div>
        <div><dt>Réussite</dt><dd><b>32 bonnes réponses sur 40</b> (80 %)</dd></div>
        <div><dt>Depuis</dt><dd>le <b>1ᵉʳ janvier 2026</b> pour une première carte pluriannuelle, une carte de résident ou une naturalisation</dd></div>
        <div><dt>Organismes</dt><dd><b>2 agréés</b> : France Éducation international et CCI Paris Île-de-France</dd></div>
        <div><dt>Tentatives</dt><dd><b>illimitées</b> : on peut repasser l'examen autant que nécessaire</dd></div>
        <div><dt>Attestation</dt><dd>valable <b>sans limite de durée</b></dd></div>
        <div><dt>Prix</dt><dd><b>fixé par chaque centre</b> : renseigne-toi avant de t'inscrire</dd></div>
      </dl>
    </section>

    <div class="lgroups">
      ${group("book", "Réviser les questions officielles", "Les listes publiées par le ministère, une par examen.",
        EXAM_ORDER.map(s => link(EXAMS[s].list, EXAMS[s].label, "Liste officielle des questions de connaissance")))}
      ${group("pin", "S'inscrire et passer l'examen", "Choisis un centre agréé, puis inscris-toi à une session.", [
        link("https://www.france-education-international.fr/centres-d-examen/carte?type-centre=examen_civique", "Trouver un centre (France Éducation international)", "Carte des centres de passation"),
        link("https://test-civique.fr/inscription", "S'inscrire auprès de France Éducation international", "test-civique.fr"),
        link("https://francais.cci-paris-idf.fr/candidat?produit=21", "S'inscrire auprès de la CCI Paris Île-de-France", "Le Français des affaires : centres et inscription"),
      ])}
      ${group("institution", "Comprendre l'examen", "Les règles officielles : programme, déroulement, public concerné.", [
        link("https://formation-civique.interieur.gouv.fr/examen-civique/", "Site officiel de l'examen civique", "Ministère de l'Intérieur : programme, modalités, fiches de révision"),
        link("https://formation-civique.interieur.gouv.fr/examen-civique/informations-g%C3%A9n%C3%A9rales-sur-lexamen-civique/", "Informations générales", "Public concerné, dispenses, déroulement, préparation gratuite"),
        link("https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052381620", "Arrêté du 10 octobre 2025", "Le texte officiel qui fixe le programme et les épreuves"),
      ])}
      ${group("idcard", "Après l'examen : ta demande", "L'attestation de réussite se joint au dossier de titre de séjour ou de naturalisation.", [
        link("https://administration-etrangers-en-france.interieur.gouv.fr/", "Déposer ta demande en ligne (ANEF)", "Titres de séjour et naturalisation"),
        link("https://www.immigration.interieur.gouv.fr/", "Actualités immigration et intégration", "Les dernières informations du ministère de l'Intérieur"),
      ])}
    </div>

    <p class="warnbox"><i class='ic' data-i='warning'></i> Certains publics sont dispensés de l'examen : vérifie ta situation sur le site officiel. Méfie-toi des sites payants qui se présentent comme officiels : la préparation peut être entièrement gratuite.</p>
  </div>`));
}
