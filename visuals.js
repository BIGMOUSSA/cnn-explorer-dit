const fmt=(n,d=2)=>Number.isInteger(n)?String(n):Number(n.toFixed(d)).toLocaleString('fr-FR');
const kernels=[
  {id:'vertical',name:'Bords verticaux',w:[-1,0,1,-1,0,1,-1,0,1]},
  {id:'horizontal',name:'Bords horizontaux',w:[-1,-1,-1,0,0,0,1,1,1]},
  {id:'blur',name:'Moyenne · flou',w:Array(9).fill(1/9)}
];
const grid=(values,cols,label,pixels=false)=>`<div class="matrix-group"><div class="matrix-label">${label}</div><div class="matrix" role="img" aria-label="${label} : ${values.map(v=>fmt(v)).join(', ')}" style="--cols:${cols}">${values.map(v=>`<span class="cell ${v>0?'positive':v<0?'negative':''}" ${pixels?`style="background:${v?'#28523e':'#edf2e7'};color:${v?'#fff':'#92a28e'}"`:''}>${fmt(v)}</span>`).join('')}</div></div>`;
function image(pattern){return Array.from({length:49},(_,i)=>{const r=Math.floor(i/7),c=i%7;return Number(pattern==='horizontal'?r===3:pattern==='corner'?r>=3&&c>=3:c===3);});}
function convolve(input,weights){return Array.from({length:25},(_,i)=>{const r=Math.floor(i/5),c=i%5;return weights.reduce((sum,w,j)=>sum+w*input[(r+Math.floor(j/3))*7+c+j%3],0);});}

function filtersLab(type,el){
  let pattern='vertical',selected=0;
  function render(){const values=image(pattern);el.innerHTML=`<div class="lab"><div class="lab-toolbar"><span class="matrix-label">Image à examiner</span>${[['vertical','Trait vertical'],['horizontal','Trait horizontal'],['corner','Coin']].map(([key,name])=>`<button type="button" class="btn ${pattern===key?'primary':''}" data-pattern="${key}" aria-pressed="${pattern===key}">${name}</button>`).join('')}</div>
    ${type==='filters'?`<div class="lab-toolbar"><label class="control">Filtre<select data-filter aria-label="Choisir un filtre">${kernels.map((k,i)=>`<option value="${i}" ${selected===i?'selected':''}>${k.name}</option>`).join('')}</select></label><span class="pill">F = 3 · S = 1 · P = 0 · biais = 0</span></div><div class="lab-columns">${grid(values,7,'Image 7 × 7',true)}<span class="operator" aria-hidden="true">×</span>${grid(kernels[selected].w,3,kernels[selected].name)}<span class="operator" aria-hidden="true">→</span>${grid(convolve(values,kernels[selected].w),5,'Carte 5 × 5')}</div>`:`<div style="display:flex;justify-content:center;margin:8px 0 24px">${grid(values,7,'Une seule image · 7 × 7 × 1',true)}</div><div class="filter-results">${kernels.map(k=>`<div class="filter-panel"><h3>${k.name}</h3>${grid(k.w,3,'Noyau 3 × 3')}<span class="operator" aria-hidden="true">↓</span>${grid(convolve(values,k.w),5,'Carte 5 × 5')}</div>`).join('')}</div><div class="equation"><strong>3 filtres → 3 cartes → volume 5 × 5 × 3</strong></div>`}
    <p class="hint"><span class="pill green">Positif</span> réponse dans un sens · <span class="pill orange">Négatif</span> sens opposé · 0 : aucune réponse à cet endroit.</p><p class="lab-note">Ces noyaux sont choisis à la main pour rendre le calcul visible. Les valeurs des cartes sont réellement calculées. Dans un CNN entraîné, les poids sont appris. Un filtre de bords peut répondre positivement ou négativement selon le sens de variation.</p></div>`;}
  const click=e=>{const button=e.target.closest('[data-pattern]');if(button){pattern=button.dataset.pattern;render();el.querySelector(`[data-pattern="${pattern}"]`)?.focus({preventScroll:true});}};
  const change=e=>{if(e.target.hasAttribute('data-filter')){selected=Number(e.target.value);render();el.querySelector('[data-filter]')?.focus({preventScroll:true});}};
  el.addEventListener('click',click);el.addEventListener('change',change);render();return()=>{el.removeEventListener('click',click);el.removeEventListener('change',change);};
}

function architectureLab(el){
  const blocks=[
    {title:'Image',shape:'32 × 32 × 3',text:'Une image couleur possède deux dimensions spatiales et trois canaux : rouge, vert et bleu. Les valeurs des pixels sont les entrées du réseau.'},
    {title:'Conv · 16 filtres',shape:'32 × 32 × 16',text:'Chaque filtre 3 × 3 traverse les 3 canaux et produit une carte. Avec S = 1 et P = 1, la hauteur et la largeur restent 32. Les 16 filtres donnent 16 cartes. Paramètres appris : (3 × 3 × 3 + 1) × 16 = 448.'},
    {title:'ReLU',shape:'32 × 32 × 16',text:'ReLU remplace les valeurs négatives par zéro et conserve les positives. Elle ajoute une non-linéarité, sans changer la forme et sans apprendre de paramètre.'},
    {title:'MaxPool · 2 × 2',shape:'16 × 16 × 16',text:'Avec une fenêtre 2 × 2, un pas de 2 et aucun padding, chaque carte est divisée par 2 en hauteur et en largeur. Le nombre de cartes reste 16. Aucun poids n’est appris.'},
    {title:'Flatten',shape:'4 096 valeurs',text:'Les 16 × 16 × 16 = 4 096 valeurs sont réorganisées en un seul vecteur. Flatten ne supprime aucune valeur et ne réalise aucun calcul appris.'},
    {title:'Dense · 3 classes',shape:'3 scores',text:'La couche dense combine les 4 096 caractéristiques pour produire un score par classe. Elle apprend (4 096 + 1) × 3 = 12 291 paramètres. Une softmax peut ensuite convertir les scores en probabilités.'}
  ];let selected=0;
  function render(){el.innerHTML=`<div class="lab"><div class="lab-caption"><span>Un exemple de CNN pour 3 classes</span><span>Les formes après chaque opération</span></div><div class="architecture-flow">${blocks.map((b,i)=>`${i?'<span class="flow-arrow" aria-hidden="true">→</span>':''}<button type="button" class="flow-block ${i===selected?'active':''}" data-block="${i}" aria-pressed="${i===selected}"><strong>${b.title}</strong><small>${b.shape}</small></button>`).join('')}</div><div class="feedback" aria-live="polite"><strong>${blocks[selected].title}</strong><br>${blocks[selected].text}</div><div class="lab-toolbar" style="margin-top:20px;margin-bottom:0"><button type="button" class="btn primary" data-next>Suivre le signal →</button><span class="pill">Cliquez sur chaque couche</span></div><p class="lab-note">C’est une architecture pédagogique possible. On peut répéter les convolutions, utiliser d’autres activations et remplacer Flatten + Dense par d’autres têtes de classification.</p></div>`;}
  const click=e=>{const block=e.target.closest('[data-block]'),next=e.target.closest('[data-next]');if(!block&&!next)return;selected=block?Number(block.dataset.block):(selected+1)%blocks.length;render();el.querySelector(next?'[data-next]':`[data-block="${selected}"]`)?.focus({preventScroll:true});};
  el.addEventListener('click',click);render();return()=>el.removeEventListener('click',click);
}

function classifierLab(el){
  const labels=['Chat','Chien','Autre'],scores=[1.2,.4,-.8];
  el.innerHTML=`<div class="lab"><div class="lab-caption"><span>Une couche de sortie à 3 classes</span><span class="pill orange">Scores fictifs pour l’explication</span></div><div class="lab-toolbar">${labels.map((label,i)=>`<label class="control">Score « ${label} » <input type="range" min="-3" max="3" step="0.1" value="${scores[i]}" data-score="${i}" aria-label="Score de la classe ${label}"><output data-score-value="${i}">${fmt(scores[i],1)}</output></label>`).join('')}</div><div data-probabilities aria-live="polite"></div><p class="lab-note">Les scores, appelés logits, seraient produits par la couche dense d’un vrai modèle. Ici vous les réglez vous-même : aucune image n’est classifiée. La softmax transforme ces scores en probabilités dont la somme vaut 1.</p><p class="hint">Une grande probabilité indique la préférence du modèle parmi ces classes. Elle ne garantit pas que sa prédiction est correcte.</p></div>`;
  function update(){const max=Math.max(...scores),exp=scores.map(v=>Math.exp(v-max)),sum=exp.reduce((a,b)=>a+b,0),prob=exp.map(v=>v/sum),winner=prob.indexOf(Math.max(...prob));el.querySelector('[data-probabilities]').innerHTML=`${labels.map((label,i)=>`<div class="prob-row"><strong>${label}</strong><div class="bar-track" role="meter" aria-label="Probabilité ${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${(prob[i]*100).toFixed(2)}"><div class="bar-fill ${i===winner?'win':''}" style="width:${prob[i]*100}%"></div></div><span>${fmt(prob[i]*100,1)} %</span></div>`).join('')}<div class="equation">pᵢ = exp(scoreᵢ) / Σ exp(scoreⱼ)<br><strong>Classe préférée : ${labels[winner]} · somme = ${fmt(prob.reduce((a,b)=>a+b,0)*100,2)} %</strong></div>`;scores.forEach((v,i)=>el.querySelector(`[data-score-value="${i}"]`).textContent=fmt(v,1));}
  const input=e=>{if(e.target.dataset.score!==undefined){scores[Number(e.target.dataset.score)]=Number(e.target.value);update();}};
  el.addEventListener('input',input);update();return()=>el.removeEventListener('input',input);
}

function lenetLab(el){
  const blocks=[
    ['Entrée','32 × 32 × 1','Une image en niveaux de gris de 32 × 32 pixels entre dans LeNet-5. L’architecture a été conçue pour la reconnaissance de caractères.'],
    ['C1 · convolution','28 × 28 × 6','Six filtres 5 × 5 sans padding : (32 − 5) + 1 = 28. Chaque filtre produit une carte de 28 × 28.'],
    ['S2 · sous-échant.','14 × 14 × 6','Le sous-échantillonnage réduit chaque carte de moitié. Dans LeNet-5 original, il comporte des coefficients appris ; ce n’est pas le max pooling moderne.'],
    ['C3 · convolution','10 × 10 × 16','Des filtres 5 × 5 donnent 16 cartes de 10 × 10. Le réseau original utilise des connexions partielles entre les cartes, ce qui réduit les paramètres.'],
    ['S4 · sous-échant.','5 × 5 × 16','Une nouvelle réduction de moitié donne 16 cartes de 5 × 5.'],
    ['C5 · convolution','120 valeurs','Les filtres 5 × 5 couvrent les cartes de 5 × 5 : sortie 1 × 1 × 120, soit 120 valeurs. C5 est une couche convolutive, même si elle ressemble ici à une couche dense.'],
    ['F6 · dense','84 valeurs','Une couche entièrement connectée transforme les 120 valeurs en 84 activations.'],
    ['Sortie','10 classes','La version originale utilise une sortie à fonctions de base radiale pour reconnaître 10 chiffres. Elle ne se termine pas par une softmax.']
  ];let selected=0;
  function render(){el.innerHTML=`<div class="lab"><div class="lab-caption"><span>LeNet-5 · LeCun et collaborateurs, 1998</span><span>Une architecture historique</span></div><div class="architecture-flow">${blocks.map(([name,shape],i)=>`${i?'<span class="flow-arrow" aria-hidden="true">→</span>':''}<button type="button" class="flow-block ${selected===i?'active':''}" data-lenet="${i}" aria-pressed="${selected===i}"><strong>${name}</strong><small>${shape}</small></button>`).join('')}</div><div class="feedback" aria-live="polite"><strong>${blocks[selected][0]}</strong><br>${blocks[selected][2]}</div><p class="lenet-caption">Le principe reste reconnaissable : des filtres, des cartes de plus en plus petites, puis une décision. Les opérations précises diffèrent de notre CNN pédagogique.</p><p class="lab-note">Version originale : fonctions d’activation sigmoïdes de type tanh, sous-échantillonnage avec paramètres appris et sortie à bases radiales. Les reproductions modernes ReLU / max pooling / softmax sont des adaptations.</p><p class="source-links">Source : <a href="https://leon.bottou.org/publications/pdf/ieee-1998.pdf" target="_blank" rel="noopener noreferrer">LeCun et al., Gradient-Based Learning Applied to Document Recognition (1998)</a>.</p></div>`;}
  const click=e=>{const block=e.target.closest('[data-lenet]');if(block){selected=Number(block.dataset.lenet);render();el.querySelector(`[data-lenet="${selected}"]`)?.focus({preventScroll:true});}};
  el.addEventListener('click',click);render();return()=>el.removeEventListener('click',click);
}

export function mountVisual(type,container){
  if(type==='filters'||type==='filterbank')return filtersLab(type,container);
  if(type==='architecture')return architectureLab(container);
  if(type==='classifier')return classifierLab(container);
  if(type==='lenet')return lenetLab(container);
  return()=>{};
}
