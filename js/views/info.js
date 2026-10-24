/* « Liens utiles » : chiffres clés de l'examen et liens officiels. */
import { page, render } from "../ui/layout.js";
import { EXAMS, EXAM_ORDER } from "../core/data.js";

export function showInfo(){
  render(page("<i class='ic' data-i='link'></i>", "Liens utiles et chiffres clés", "Informations officielles vérifiées en octobre 2026. En cas de doute, le site du ministère fait foi.", `<div class="useful-page"><div class="figs">
      <div class="fig"><b>40</b><span>questions : 28 de connaissance + 12 mises en situation</span></div>
      <div class="fig"><b>45 min</b><span>durée maximale, sur tablette ou ordinateur</span></div>
      <div class="fig"><b>32 / 40</b><span>bonnes réponses pour réussir (80 %)</span></div>
      <div class="fig"><b>1ᵉʳ janv. 2026</b><span>date depuis laquelle l'attestation est exigée</span></div>
      <div class="fig"><b>2</b><span>organismes agréés : France Éducation international et CCI Paris IDF</span></div>
      <div class="fig"><b>Illimité</b><span>nombre de tentatives : on peut repasser l'examen autant que nécessaire</span></div>
      <div class="fig"><b>Sans limite</b><span>de validité pour l'attestation de réussite</span></div>
      <div class="fig"><b>Variable</b><span>prix fixé par chaque centre agréé : renseigne-toi auprès du centre</span></div>
    </div>
    <div class="links-grid">
      <a class="ulink" href="https://formation-civique.interieur.gouv.fr/examen-civique/" target="_blank" rel="noopener"><span class="e"><i class='ic' data-i='institution'></i></span><span><b>Site officiel de l'examen civique</b><small>Ministère de l'Intérieur : programme, modalités, fiches de révision</small></span><span class="ext"><i class='ic' data-i='external'></i></span></a>
      <a class="ulink" href="https://formation-civique.interieur.gouv.fr/examen-civique/informations-g%C3%A9n%C3%A9rales-sur-lexamen-civique/" target="_blank" rel="noopener"><span class="e"><i class='ic' data-i='info'></i></span><span><b>Informations générales et inscription</b><small>Public concerné, déroulement, organismes agréés, préparation gratuite</small></span><span class="ext"><i class='ic' data-i='external'></i></span></a>
      ${EXAM_ORDER.map(s => `<a class="ulink" href="${EXAMS[s].list}" target="_blank" rel="noopener"><span class="e"><i class='ic' data-i='list'></i></span><span><b>Questions officielles : ${EXAMS[s].label.toLowerCase()}</b><small>Liste des questions de connaissance publiée par le ministère</small></span><span class="ext"><i class='ic' data-i='external'></i></span></a>`).join("")}
      <a class="ulink" href="https://www.france-education-international.fr/centres-d-examen/carte?type-centre=examen_civique" target="_blank" rel="noopener"><span class="e"><i class='ic' data-i='pin'></i></span><span><b>Centres agréés France Éducation international</b><small>Carte des centres de passation de l'examen civique</small></span><span class="ext"><i class='ic' data-i='external'></i></span></a>
      <a class="ulink" href="https://test-civique.fr/inscription" target="_blank" rel="noopener"><span class="e"><i class='ic' data-i='pen'></i></span><span><b>Inscription FEI (test-civique.fr)</b><small>S'inscrire à une session auprès de France Éducation international</small></span><span class="ext"><i class='ic' data-i='external'></i></span></a>
      <a class="ulink" href="https://francais.cci-paris-idf.fr/candidat?produit=21" target="_blank" rel="noopener"><span class="e"><i class='ic' data-i='building'></i></span><span><b>Inscription CCI Paris Île-de-France</b><small>Le Français des affaires : inscription et centres agréés</small></span><span class="ext"><i class='ic' data-i='external'></i></span></a>
      <a class="ulink" href="https://administration-etrangers-en-france.interieur.gouv.fr/" target="_blank" rel="noopener"><span class="e"><i class='ic' data-i='idcard'></i></span><span><b>Demande de titre de séjour (ANEF)</b><small>Déposer sa demande de titre de séjour ou de naturalisation en ligne</small></span><span class="ext"><i class='ic' data-i='external'></i></span></a>
      <a class="ulink" href="https://www.immigration.interieur.gouv.fr/" target="_blank" rel="noopener"><span class="e"><i class='ic' data-i='news'></i></span><span><b>Actualités immigration et intégration</b><small>Site du ministère de l'Intérieur (DGEF) : dernières informations</small></span><span class="ext"><i class='ic' data-i='external'></i></span></a>
      <a class="ulink" href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000052381620" target="_blank" rel="noopener"><span class="e"><i class='ic' data-i='scale'></i></span><span><b>Arrêté du 10 octobre 2025</b><small>Texte officiel : programme, épreuves et modalités de l'examen</small></span><span class="ext"><i class='ic' data-i='external'></i></span></a>
    </div>
    <p class="warnbox"><i class='ic' data-i='warning'></i> Trois examens existent, du plus accessible au plus exigeant : carte de séjour pluriannuelle, carte de résident, naturalisation. Certains publics en sont dispensés : vérifie ta situation sur le site officiel. Méfie-toi des sites payants qui se présentent comme officiels : la préparation peut être entièrement gratuite.</p></div>`));
}
