import { slides } from './content.js';
import { mountLab } from './labs.js';
import { mountBasic } from './basics.js';
import { mountVisual } from './visuals.js';

const $ = (selector, root = document) => root.querySelector(selector);
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STORE_KEY = 'cnn-explorer-dit-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch {}
if (typeof saved !== 'object' || Array.isArray(saved)) saved = {};
const state = { index:0, visited:new Set(Array.isArray(saved.visited) ? saved.visited : []), notes:false, quiz:saved.quiz || {answers:[],position:0}, exercise:Array.isArray(saved.exercise) ? saved.exercise : Array(12).fill('') };
if (!Array.isArray(state.quiz.answers) || !Number.isInteger(state.quiz.position) || state.quiz.position < 0 || state.quiz.position > 5) state.quiz = {answers:[],position:0};
const sections = [...new Set(slides.map(s => s.section))];
const expanded = new Set();
let cleanup = () => {};
const save = () => {try {localStorage.setItem(STORE_KEY, JSON.stringify({slide:slides[state.index].id,visited:[...state.visited],quiz:state.quiz,exercise:state.exercise}));}catch{}};
function indexFromHash() {let id;try{id=decodeURIComponent(location.hash.replace(/^#\/?/,''));}catch{return -1;}return slides.findIndex(s=>s.id===id);}
const initial = indexFromHash();
state.index = initial >= 0 ? initial : Math.max(0,slides.findIndex(s=>s.id===saved.slide));
if(initial<0)history.replaceState(null,'','#/'+slides[state.index].id);
function go(index) {
  index = Math.min(slides.length-1,Math.max(0,index));
  if (index === state.index) {closeMenu(); return;}
  state.index = index;
  history.pushState(null,'','#/'+slides[index].id);
  render();
  closeMenu();
  window.scrollTo({top:0,behavior:'instant'});
  $('#lesson').focus({preventScroll:true});
}
function closeMenu(){document.body.classList.remove('menu-open');$('#menu-button').setAttribute('aria-expanded','false');$('#scrim').hidden=true;}
function renderNav(){
  const activeSection=slides[state.index].section;expanded.add(activeSection);
  $('#course-nav').innerHTML=sections.map((section,j)=>`<div class="nav-section"><button class="section-title" data-section="${j}" aria-expanded="${expanded.has(section)}" aria-controls="section-${j}"><span class="section-number">${section.slice(0,2)}</span>${escapeHTML(section.slice(3))}<span class="chevron" aria-hidden="true">${expanded.has(section)?'−':'+'}</span></button><div class="section-items" id="section-${j}" ${expanded.has(section)?'':'hidden'}>${slides.map((s,i)=>s.section===section?`<button class="nav-link ${state.visited.has(s.id)?'visited':''}" data-slide="${i}" ${i===state.index?'aria-current="step"':''}><span class="nav-dot" aria-hidden="true"></span><span>${escapeHTML(s.demo==='hero'?'Bienvenue au laboratoire':s.title)}</span></button>`:'').join('')}</div></div>`).join('');
  const nav=$('#course-nav'),current=$('[aria-current="step"]',nav);
  if(current){const top=current.offsetTop-nav.offsetTop;if(top<nav.scrollTop||top+current.offsetHeight>nav.scrollTop+nav.clientHeight)nav.scrollTop=Math.max(0,top-nav.clientHeight/2);}
}
function notesMarkup(slide){return `<aside class="teacher-notes" ${state.notes?'':'hidden'}><strong>Question à poser · ${slide.duration} min environ</strong><p>${escapeHTML(slide.prompt)}</p><p>${escapeHTML(slide.notes)}</p><p class="source-note">${escapeHTML(slide.source)}</p></aside>`;}
function render(){
  cleanup();cleanup=()=>{};
  const slide=slides[state.index];state.visited.add(slide.id);save();renderNav();
  const number=String(state.index+1).padStart(2,'0');
  $('#slide-count').textContent=`${number} / ${slides.length}`;
  $('#progress-fill').style.width=`${(state.index+1)/slides.length*100}%`;
  $('.progress-track').setAttribute('aria-valuenow',String(state.index+1));
  $('#previous').disabled=state.index===0;
  $('#next').innerHTML=state.index===slides.length-1?'Revenir au début ↺':'Suivant <span aria-hidden="true">→</span>';
  document.title=`${number} · ${slide.title} — CNN Explorer`;
  $('#announcement').textContent=`Diapositive ${state.index+1} sur ${slides.length}. ${slide.title}`;
  if(slide.demo==='hero'){
    $('#lesson').innerHTML=heroMarkup()+notesMarkup(slide);
    $('#start-course').addEventListener('click',()=>go(1));
    return;
  }
  $('#lesson').innerHTML=`<div class="lesson-topline"><span class="eyebrow">${escapeHTML(slide.kicker)}</span><span class="divider"></span><span class="time">${slide.duration} min</span></div><div class="lesson-header"><h1>${escapeHTML(slide.title)}</h1><p class="lesson-intro">${escapeHTML(slide.intro)}</p></div><div id="demo-mount"></div><div class="takeaway"><span class="bulb" aria-hidden="true">✦</span><p><strong>À retenir.</strong> ${escapeHTML(slide.takeaway)}</p></div>${notesMarkup(slide)}`;
  const container=$('#demo-mount');
  if(['convolution','stride','padding','shapes','relu','pooling','average','learning'].includes(slide.demo))cleanup=mountLab(slide.demo,container);
  else if(['neuron','mlp','pixels','params','local','rgb','flatten'].includes(slide.demo)){container.classList.add('lab');cleanup=mountBasic(slide.demo,container);}
  else if(['filters','filterbank','architecture','classifier','lenet'].includes(slide.demo))cleanup=mountVisual(slide.demo,container);
  else if(slide.demo==='dotquiz')mountDotQuiz(container,slide.question);
  else if(slide.demo==='exercise')mountExercise(container);
  else if(slide.demo==='quiz')mountQuiz(container);
  else if(slide.demo==='recap')mountRecap(container);
  else if(slide.demo==='challenge')mountChallenge(container);
  else if(slide.demo==='finish')mountFinish(container);
}

function heroIllustration(){
  const shape=['00111000','01101100','11000110','00001100','00011000','00110000','01111110','00000000'].join('');
  const cells=[...shape].map((v,i)=>{const r=Math.floor(i/8),c=i%8;return `<rect x="${c*22+9}" y="${r*22+9}" width="19" height="19" rx="2.5" fill="${v==='1'?'#5c8263':'#d9e4cd'}" opacity="${v==='1'?'.95':'.7'}"/>`;}).join('');
  const kernel=[-1,0,1,-1,0,1,-1,0,1].map((v,i)=>`<rect x="${i%3*20+6}" y="${Math.floor(i/3)*20+6}" width="17" height="17" rx="2" fill="${v>0?'#90b54d':v<0?'#d9e4bc':'#e8efdb'}"/><text x="${i%3*20+14.5}" y="${Math.floor(i/3)*20+18}" text-anchor="middle" font-family="monospace" font-size="8" fill="#4d6939">${v}</text>`).join('');
  const outputs=Array.from({length:25},(_,i)=>`<rect x="${i%5*18+6}" y="${Math.floor(i/5)*18+6}" width="15" height="15" rx="2" fill="${['#e9eddc','#bed5a4','#8eae70','#d4e1bc','#537c51'][(i*7+Math.floor(i/5))%5]}"/>`).join('');
  return `<svg viewBox="0 0 460 390" role="img" aria-label="Une image représentée par une grille de pixels, un filtre de trois par trois et une carte de caractéristiques reliés par des flèches"><defs><filter id="plate-shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#385b28" flood-opacity=".11"/></filter><marker id="arrow-tip" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="none" stroke="#9db58b" stroke-width="1.1"/></marker></defs><g transform="translate(72 91) matrix(.94,.29,-.34,.86,0,0)" filter="url(#plate-shadow)"><rect x="5" y="8" width="189" height="189" rx="9" fill="#d3dfc8"/><rect width="189" height="189" rx="9" fill="#f7f9f0" stroke="#d9e2d2"/>${cells}<rect x="28" y="28" width="66" height="66" rx="4" fill="#d3ed75" fill-opacity=".37" stroke="#75a045" stroke-width="2"/><text x="5" y="213" fill="#64815c" font-size="10" font-family="Arial,sans-serif">01 / IMAGE D’ENTRÉE</text></g><path d="M209 130 C240 100 252 93 278 98" fill="none" stroke="#9db58b" stroke-dasharray="4 5" marker-end="url(#arrow-tip)"/><g transform="translate(286 73) matrix(.94,.29,-.34,.86,0,0)" filter="url(#plate-shadow)"><rect width="70" height="70" rx="6" fill="#f5fae7" stroke="#bfd39b"/>${kernel}<text x="-3" y="91" fill="#64815c" font-size="10" font-family="Arial,sans-serif">02 / FILTRE</text></g><path d="M322 159 C356 184 355 204 336 227" fill="none" stroke="#9db58b" stroke-dasharray="4 5" marker-end="url(#arrow-tip)"/><g transform="translate(290 228) matrix(.94,.29,-.34,.86,0,0)" filter="url(#plate-shadow)"><rect width="101" height="101" rx="7" fill="#f9fbf2" stroke="#ceddc1"/>${outputs}<text x="-4" y="125" fill="#64815c" font-size="10" font-family="Arial,sans-serif">03 / CARTE DE MOTIFS</text></g><g transform="translate(250 23)"><rect width="132" height="24" rx="12" fill="#f5f8ee" stroke="#d9e6cc"/><circle cx="12" cy="12" r="3" fill="#89a85c"/><text x="24" y="16" fill="#7b8b71" font-size="9" font-family="Arial,sans-serif">De l’image aux nombres</text></g><circle cx="65" cy="300" r="3" fill="#d3aa82"/><path d="M91 43h10m-5-5v10" stroke="#bdd0a4"/><path d="M402 190h10m-5-5v10" stroke="#bdd0a4"/></svg>`;
}
function heroMarkup(){return `<section class="hero"><div class="lesson-topline"><span class="eyebrow">DU PERCEPTRON À LA VISION</span><span class="divider"></span><span class="time">Première année IA</span></div><div class="hero-main"><div class="hero-copy"><div class="eyebrow"><span class="eyebrow-dot"></span>CHAPITRE 03 · RÉSEAUX CONVOLUTIFS</div><h1>Comment une IA<br>apprend à <em>voir.</em></h1><p>Une image devient des nombres. Des filtres y cherchent des motifs. Explorons ensemble ce qui se passe, une étape à la fois.</p><div class="hero-actions"><button class="btn primary" id="start-course">Entrer dans le laboratoire <span aria-hidden="true">↗</span></button><small>27 étapes, à votre rythme</small></div></div><div class="hero-visual">${heroIllustration()}<span class="visual-tag">UNE IDÉE À OBSERVER, PUIS À MANIPULER.</span></div></div><div class="hero-method"><div class="method-step"><span aria-hidden="true">◎</span><div><strong>01. Observer</strong><p>Voir les nombres devenir des motifs.</p></div></div><div class="method-step"><span aria-hidden="true">↔</span><div><strong>02. Manipuler</strong><p>Changer un réglage et voir son effet.</p></div></div><div class="method-step"><span aria-hidden="true">✦</span><div><strong>03. Comprendre</strong><p>Expliquer avec vos propres mots.</p></div></div></div><div class="hero-bottom"><div><span class="mission-icon" aria-hidden="true">⌁</span><p><strong>Votre mission : suivre une image, du pixel à la prédiction.</strong>Des rappels, des expériences, puis un défi à résoudre.</p></div><span class="hero-tag"><span class="mini-dot"></span>Aucun prérequis en vision</span></div></section>`;}

function mountDotQuiz(el,q){
  const signal=renewActivity();
  el.innerHTML=`<div class="lab"><div class="lab-columns"><div class="matrix-group"><div class="matrix-label">Patch 2 × 2</div><div class="matrix" style="--cols:2">${[1,2,3,4].map(v=>`<span class="cell positive">${v}</span>`).join('')}</div></div><span class="operator" aria-hidden="true">⊙</span><div class="matrix-group"><div class="matrix-label">Filtre 2 × 2</div><div class="matrix" style="--cols:2">${[1,0,0,-1].map(v=>`<span class="cell ${v<0?'negative':''}">${v}</span>`).join('')}</div></div></div><p class="question-label" style="margin-top:22px">Quelle est la somme des produits ? Biais = 0.</p><div class="choices">${q.options.map((o,i)=>`<button class="choice" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${escapeHTML(o)}</button>`).join('')}</div><div class="feedback" role="status" hidden></div><button class="btn small" data-retry hidden style="margin-top:12px">Réessayer</button></div>`;
  let locked=false;
  el.addEventListener('click',e=>{
    if(e.target.closest('[data-retry]')){mountDotQuiz(el,q);return;}
    const target=e.target.closest('[data-answer]');if(!target||locked)return;locked=true;
    const answer=Number(target.dataset.answer),feedback=$('.feedback',el);feedback.hidden=false;feedback.classList.toggle('error',answer!==q.answer);feedback.textContent=(answer===q.answer?'Exact. ':'Reprenons le calcul. ')+q.explanation;
    el.querySelectorAll('[data-answer]').forEach(b=>{b.classList.toggle('correct',Number(b.dataset.answer)===q.answer);b.classList.toggle('wrong',b===target&&answer!==q.answer);b.disabled=true;});$('[data-retry]',el).hidden=false;
  },{signal});
}

const exerciseLayers=[
 {name:'Convolution 1',description:'16 filtres · F = 3 · S = 1 · P = 1',shape:[256,256,16],explain:'⌊(256 − 3 + 2 × 1) / 1⌋ + 1 = 256. Les 16 filtres donnent 16 canaux.'},
 {name:'Max pooling 1',description:'F = 2 · S = 2 · P = 0',shape:[128,128,16],explain:'⌊(256 − 2) / 2⌋ + 1 = 128. Le pooling garde les 16 canaux.'},
 {name:'Convolution 2',description:'8 filtres · F = 7 · S = 1 · P = 3',shape:[128,128,8],explain:'⌊(128 − 7 + 2 × 3) / 1⌋ + 1 = 128. Les 8 filtres donnent 8 canaux.'},
 {name:'Max pooling 2',description:'F = 2 · S = 2 · P = 0',shape:[64,64,8],explain:'⌊(128 − 2) / 2⌋ + 1 = 64. Les 8 canaux sont conservés.'}
];
function mountExercise(el){
  const signal=renewActivity();
  el.innerHTML=`<form class="lab" id="exercise-form"><div class="lab-caption"><span>ENTRÉE : 256 × 256 × 3</span><span>À vous de remplir les 12 cases</span></div><div class="exercise-row exercise-header"><span>Couche</span><span>Hauteur</span><span>Largeur</span><span>Canaux</span></div>${exerciseLayers.map((l,r)=>`<div class="exercise-row" data-row="${r}"><div><strong>${l.name}</strong><span class="layer-description">${l.description}</span></div>${l.shape.map((_,c)=>`<input type="number" inputmode="numeric" min="1" max="4096" step="1" required data-dimension="${r*3+c}" aria-label="${l.name}, ${['hauteur','largeur','canaux'][c]}" placeholder="?" value="${escapeHTML(state.exercise[r*3+c]??'')}">`).join('')}</div>`).join('')}<div class="exercise-actions"><button type="submit" class="btn primary">Vérifier mes dimensions</button><button type="button" class="btn" id="reveal-exercise">Voir la correction</button><button type="button" class="btn ghost" id="clear-exercise">Effacer</button></div><div class="feedback" id="exercise-feedback" role="status" hidden></div><div id="exercise-solution" hidden></div></form>`;
  el.addEventListener('input',e=>{if(e.target.hasAttribute('data-dimension')){state.exercise[Number(e.target.dataset.dimension)]=e.target.value;save();}},{signal});
  $('#exercise-form',el).addEventListener('submit',e=>{e.preventDefault();let correct=0;exerciseLayers.forEach((l,r)=>{const ok=l.shape.every((v,c)=>Number(state.exercise[r*3+c])===v);const row=$(`[data-row="${r}"]`,el);row.classList.toggle('correct-row',ok);row.classList.toggle('wrong-row',!ok);if(ok)correct++;});const feedback=$('#exercise-feedback',el);feedback.hidden=false;feedback.classList.toggle('error',correct!==4);feedback.textContent=correct===4?'Les quatre formes sont correctes. La sortie finale est 64 × 64 × 8. Expliquez maintenant pourquoi le nombre de canaux ne change pas au pooling.':`${correct} couche${correct>1?'s':''} sur 4 correcte${correct>1?'s':''}. Reprenez les lignes orangées. Astuce : le pooling conserve les canaux ; la convolution les fixe par le nombre de filtres.`;},{signal});
  $('#reveal-exercise',el).addEventListener('click',()=>{const box=$('#exercise-solution',el);box.hidden=!box.hidden;$('#reveal-exercise',el).textContent=box.hidden?'Voir la correction':'Masquer la correction';box.innerHTML=exerciseLayers.map(l=>`<div class="challenge-answer"><strong>${l.name} → ${l.shape.join(' × ')}</strong><br>${l.explain}</div>`).join('');},{signal});
  $('#clear-exercise',el).addEventListener('click',()=>{state.exercise=Array(12).fill('');save();mountExercise(el);},{signal});
}

const quizQuestions=[
 {text:'Pourquoi parle-t-on de « partage des poids » ?',options:['Tous les filtres ont les mêmes valeurs.','Un même filtre réutilise ses poids à toutes les positions.','Les poids sont supprimés après chaque calcul.'],answer:1,explanation:'Un filtre conserve ses valeurs lorsqu’il glisse. Deux filtres différents possèdent en revanche leurs propres poids.'},
 {text:'Entrée 7 × 7, filtre 3 × 3, stride 2, padding 0 : quelle taille de sortie ?',options:['2 × 2','5 × 5','3 × 3'],answer:2,explanation:'⌊(7 − 3 + 0) / 2⌋ + 1 = 3. Le filtre démarre aux positions 0, 2 et 4 sur chaque axe.'},
 {text:'Pour le bloc [1, 7 ; 3, 5], quelles sont les sorties max et average pooling ?',options:['7 et 4','7 et 5','5 et 4'],answer:0,explanation:'Le maximum est 7. La moyenne vaut (1 + 7 + 3 + 5) / 4 = 4. Ces deux opérations n’apprennent aucun poids.'},
 {text:'Après flatten, que devient un volume 4 × 4 × 8 ?',options:['Une liste de 16 valeurs.','Une liste de 128 valeurs, toutes conservées.','Une liste de 8 valeurs moyennes.'],answer:1,explanation:'4 × 4 × 8 = 128 valeurs. Flatten change l’organisation, sans supprimer les nombres.'},
 {text:'Une convolution applique 12 filtres à une image RGB. Combien de canaux possède la sortie ?',options:['3','36','12'],answer:2,explanation:'Chaque filtre combine les trois canaux d’entrée pour produire une seule carte. Douze filtres donnent donc douze canaux de sortie.'}
];
function mountQuiz(el){
  const signal=renewActivity();
  const qstate=state.quiz;
  if(qstate.position>=quizQuestions.length){
    const score=quizQuestions.reduce((sum,q,i)=>sum+(qstate.answers[i]===q.answer?1:0),0);
    el.innerHTML=`<div class="lab"><div class="quiz-summary"><span class="eyebrow">VOTRE POINT D’ÉTAPE</span><strong>${score} / ${quizQuestions.length}</strong><p>${score===5?'Les notions sont en place. Essayez maintenant de les expliquer à un camarade.':'Repérez les notions à revoir, puis refaites le quiz après une manipulation.'}</p><button class="btn primary" id="retry-quiz">Refaire le quiz</button><div class="quiz-review">${quizQuestions.map((q,i)=>`<p><strong>${qstate.answers[i]===q.answer?'✓':'↺'} ${escapeHTML(q.text)}</strong><br>${escapeHTML(q.explanation)}</p>`).join('')}</div></div></div>`;
    $('#retry-quiz',el).addEventListener('click',()=>{state.quiz={answers:[],position:0};save();mountQuiz(el);$('.quiz-title',el)?.focus();},{signal});return;
  }
  const q=quizQuestions[qstate.position],answered=Number.isInteger(qstate.answers[qstate.position]);
  el.innerHTML=`<div class="lab"><div class="quiz-progress"><span>QUESTION ${qstate.position+1} / ${quizQuestions.length}</span><span>Une réponse, puis une explication</span></div><h2 class="quiz-title" tabindex="-1">${escapeHTML(q.text)}</h2><div class="choices">${q.options.map((o,i)=>`<button class="choice ${answered&&i===q.answer?'correct':''} ${answered&&qstate.answers[qstate.position]===i&&i!==q.answer?'wrong':''}" data-quiz-answer="${i}" ${answered?'disabled':''}><span>${String.fromCharCode(65+i)}</span>${escapeHTML(o)}</button>`).join('')}</div><div class="feedback ${answered&&qstate.answers[qstate.position]!==q.answer?'error':''}" role="status" ${answered?'':'hidden'}>${answered?escapeHTML(q.explanation):''}</div><div style="margin-top:18px"><button class="btn primary" id="next-question" ${answered?'':'hidden'}>${qstate.position===4?'Voir mon résultat':'Question suivante →'}</button></div></div>`;
  el.addEventListener('click',e=>{const button=e.target.closest('[data-quiz-answer]');if(button&&!Number.isInteger(state.quiz.answers[state.quiz.position])){state.quiz.answers[state.quiz.position]=Number(button.dataset.quizAnswer);save();mountQuiz(el);$('#next-question',el)?.focus();}},{signal});
  $('#next-question',el).addEventListener('click',()=>{state.quiz.position++;save();mountQuiz(el);$('.quiz-title',el)?.focus();},{signal});
}
function mountRecap(el){const cards=[['01','Convolution','Des connexions locales ; les mêmes poids utilisés partout. Les filtres s’apprennent.'],['02','Dimensions','Le stride et le padding règlent la taille. Le nombre de filtres fixe les canaux de sortie.'],['03','ReLU','max(0, x) : les valeurs négatives deviennent nulles. La forme ne change pas.'],['04','Pooling','Résumer chaque région par un maximum ou une moyenne. Les canaux sont conservés.'],['05','Flatten','Dérouler les valeurs en une liste, sans en perdre et sans apprendre de poids.'],['06','Classification','Combiner les caractéristiques et produire des scores. Vérifier sur des exemples nouveaux.']];el.innerHTML=`<div class="recap-grid">${cards.map(([n,t,p])=>`<article class="recap-card"><span>${n}</span><h3>${t}</h3><p>${p}</p></article>`).join('')}</div><div class="equation">Image → motifs → caractéristiques → scores → prédiction</div>`;}
function mountChallenge(el){
  el.innerHTML=`<div class="lab"><span class="pill orange">EN BINÔME · 5 MINUTES</span><h2 style="margin-top:20px;font-family:Georgia,serif;font-weight:400">Construisez le chemin d’un chiffre.</h2><p style="font-size:13px;color:#788974">Votre entrée est une image en niveaux de gris de <strong>28 × 28 × 1</strong>.</p><ol class="challenge-tasks"><li>Convolution : 8 filtres 3 × 3, stride 1, padding 1. Donnez la sortie.</li><li>ReLU, puis max pooling 2 × 2, stride 2. Donnez la sortie.</li><li>Flatten, puis une couche dense de 10 sorties. Combien de valeurs entrent dans la couche dense ?</li><li>Expliquez à votre binôme quelles étapes apprennent des poids.</li></ol><button class="btn primary" id="challenge-reveal" aria-expanded="false">Comparer avec la solution</button><div class="challenge-answer" id="challenge-solution" hidden><p><strong>1.</strong> 28 × 28 × 8 : taille conservée, huit cartes.</p><p><strong>2.</strong> ReLU conserve 28 × 28 × 8 ; le pooling donne 14 × 14 × 8.</p><p><strong>3.</strong> Flatten donne 14 × 14 × 8 = <strong>1 568 valeurs</strong>. La couche dense produit 10 scores.</p><p style="margin-bottom:0"><strong>4.</strong> La convolution et la couche dense apprennent des poids et des biais. ReLU, max pooling et flatten n’en apprennent pas.</p></div><p class="lab-note">Défi supplémentaire : combien de paramètres possède la convolution ? (3 × 3 × 1 + 1 biais) × 8 = 80.</p></div>`;
  $('#challenge-reveal',el).addEventListener('click',()=>{const box=$('#challenge-solution',el);box.hidden=!box.hidden;$('#challenge-reveal',el).setAttribute('aria-expanded',String(!box.hidden));$('#challenge-reveal',el).textContent=box.hidden?'Comparer avec la solution':'Masquer la solution';},{signal:lessonController.signal});
}
function mountFinish(el){
  el.innerHTML=`<div class="lab finish"><div class="finish-symbol" aria-hidden="true">✦</div><span class="eyebrow">VOUS AVEZ SUIVI LE CHEMIN</span><h2 style="margin-top:15px">Maintenant, racontez-le.</h2><p>Expliquez en une minute comment une image traverse un CNN. Utilisez les mots pixel, filtre, activation, pooling et classification.</p><div class="finish-actions"><button class="btn primary" id="back-to-convolution">Refaire une convolution →</button><a href="fiche-memo.html" target="_blank" rel="noopener" class="btn">Ouvrir la fiche mémo ↗</a><a href="cours-hors-ligne.zip" class="btn" download>Version hors ligne ↓</a><button class="btn ghost" id="reset-progress">Recommencer le parcours</button></div><p class="source-links">Cours de Moussa Diallo · Dakar Institute of Technology<br>Adapté de « CHAPITRE 3_CNN » · Support original conservé<br>Pour approfondir : <a href="https://leon.bottou.org/publications/pdf/ieee-1998.pdf" target="_blank" rel="noopener">article original LeNet-5</a> · <a href="https://docs.pytorch.org/docs/2.15/generated/torch.nn.modules.conv.Conv2d.html" target="_blank" rel="noopener">définition de Conv2d</a><br>Votre position, vos réponses au quiz et vos dimensions sont mémorisées uniquement dans ce navigateur.</p></div>`;
  $('#back-to-convolution',el).addEventListener('click',()=>go(7),{signal:lessonController.signal});
  $('#reset-progress',el).addEventListener('click',resetProgress,{signal:lessonController.signal});
}
function resetProgress(){state.visited.clear();state.exercise=Array(12).fill('');state.quiz={answers:[],position:0};expanded.clear();state.index=0;history.pushState(null,'','#/'+slides[0].id);save();render();window.scrollTo({top:0,behavior:'instant'});}

const glossary=[['Pixel','Une case de l’image. En niveaux de gris, elle porte une valeur ; en RGB, trois composantes de couleur.'],['Poids et biais','Des nombres ajustés pendant l’apprentissage. Un poids multiplie une entrée ; un biais décale la somme.'],['Filtre ou noyau','Un petit ensemble de poids réutilisé à différentes positions. Dans une convolution standard, il couvre tous les canaux d’entrée.'],['Carte de caractéristiques','Le tableau de réponses d’un filtre aux différentes positions de l’image. Un filtre produit une carte.'],['Canal','Une tranche du volume de données. RGB a trois canaux ; une couche à 16 filtres produit 16 canaux.'],['Stride ou pas','L’écart entre deux positions successives du filtre. Un pas plus grand calcule généralement moins de sorties.'],['Padding','Une bordure ajoutée autour de l’entrée, souvent constituée de zéros.'],['ReLU','La fonction max(0, x), appliquée séparément à chaque valeur. Elle introduit une non-linéarité.'],['Pooling','Une opération qui résume chaque fenêtre par son maximum ou sa moyenne. Le pooling standard n’apprend aucun poids.'],['Flatten','Une réorganisation en une liste. Le nombre total de valeurs reste identique.'],['Softmax','Une transformation des scores en valeurs positives dont la somme vaut 1. Une forte sortie ne garantit pas une prédiction correcte.'],['Entraînement et test','L’entraînement ajuste les poids. Le test utilise des exemples tenus à part pour évaluer la généralisation.']];
$('#glossary-content').innerHTML='<dl>'+glossary.map(([t,d])=>`<dt>${t}</dt><dd>${d}</dd>`).join('')+'</dl>';
$('#glossary-button').addEventListener('click',()=>$('#glossary-dialog').showModal());
$('[data-close]').addEventListener('click',()=>$('#glossary-dialog').close());
$('#glossary-dialog').addEventListener('click',e=>{if(e.target===$('#glossary-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#notes-button').addEventListener('click',()=>{state.notes=!state.notes;$('#notes-button').setAttribute('aria-pressed',String(state.notes));$('.teacher-notes').hidden=!state.notes;});
function togglePresentation(){const enabled=document.body.classList.toggle('presenting');$('#present-button').setAttribute('aria-pressed',String(enabled));$('#present-button').setAttribute('aria-label',enabled?'Quitter le mode présentation':'Activer le mode présentation');closeMenu();}
$('#present-button').addEventListener('click',togglePresentation);
$('#previous').addEventListener('click',()=>go(state.index-1));
$('#next').addEventListener('click',()=>state.index===slides.length-1?go(0):go(state.index+1));
$('#menu-button').addEventListener('click',()=>{const opened=document.body.classList.toggle('menu-open');$('#menu-button').setAttribute('aria-expanded',String(opened));$('#scrim').hidden=!opened;});
$('#scrim').addEventListener('click',closeMenu);
$('#course-nav').addEventListener('click',e=>{const link=e.target.closest('[data-slide]');if(link)go(Number(link.dataset.slide));const section=e.target.closest('[data-section]');if(section){const name=sections[Number(section.dataset.section)];expanded.has(name)?expanded.delete(name):expanded.add(name);const panel=$('#section-'+section.dataset.section);panel.hidden=!expanded.has(name);section.setAttribute('aria-expanded',String(expanded.has(name)));$('.chevron',section).textContent=expanded.has(name)?'−':'+';}});
$('.brand').addEventListener('click',e=>{e.preventDefault();go(0);});
window.addEventListener('popstate',()=>{const index=indexFromHash();if(index>=0){state.index=index;render();window.scrollTo({top:0,behavior:'instant'});}});
window.addEventListener('hashchange',()=>{const index=indexFromHash();if(index>=0&&index!==state.index){state.index=index;render();window.scrollTo({top:0,behavior:'instant'});}});
window.addEventListener('keydown',e=>{
  if($('#glossary-dialog').open)return;
  if(e.key==='Escape'){closeMenu();if(document.body.classList.contains('presenting'))togglePresentation();return;}
  if(e.target.closest('input,select,textarea,[contenteditable="true"]')||e.ctrlKey||e.metaKey||e.altKey)return;
  if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();go(state.index+1);}
  if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(state.index-1);}
  if(e.key==='Home'){e.preventDefault();go(0);}
  if(e.key==='End'){e.preventDefault();go(slides.length-1);}
  if(e.key.toLowerCase()==='f'){e.preventDefault();togglePresentation();}
});
let lessonController = new AbortController();
let activityController = new AbortController();
function renewActivity(){activityController.abort();activityController=new AbortController();return activityController.signal;}
const originalRender=render;
render=()=>{lessonController.abort();lessonController=new AbortController();activityController.abort();originalRender();};
render();
