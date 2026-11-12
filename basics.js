const format = value => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value);
const matrix = (values, cols, options = {}) => `<div class="matrix" style="--cols:${cols};--cell-size:${options.size || 35}px" ${options.label ? `role="group" aria-label="${options.label}"` : ''}>${values.map((value, i) => options.buttons
  ? `<button class="cell interactive-cell" type="button" data-cell="${i}" aria-label="Ligne ${Math.floor(i / cols) + 1}, colonne ${i % cols + 1}, valeur ${value}" aria-pressed="${!!value}">${value}</button>`
  : `<span class="cell ${value < 0 ? 'negative' : value > 0 ? 'positive' : ''}" data-index="${i}">${value}</span>`).join('')}</div>`;

export function mountBasic(type, container) {
  const handlers = { neuron, mlp, pixels, params, local, rgb, flatten };
  if (!handlers[type]) return () => {};
  const controller = new AbortController();
  const on = (target, event, callback) => target.addEventListener(event, callback, { signal: controller.signal });
  const $ = selector => container.querySelector(selector);
  const $$ = selector => [...container.querySelectorAll(selector)];
  handlers[type]({ container, on, $, $$ });
  return () => controller.abort();
}

function neuron({ container, on, $, $$ }) {
  const controls = [
    ['x1', 'x₁ · luminosité à gauche', 0, 1, .8, .1],
    ['x2', 'x₂ · luminosité à droite', 0, 1, .2, .1],
    ['w1', 'Poids w₁', -2, 2, 1, .1],
    ['w2', 'Poids w₂', -2, 2, -1, .1],
    ['bias', 'Biais b', -2, 2, 0, .1]
  ];
  container.innerHTML = `<div class="lab-toolbar"><span class="pill">Essayez : augmentez un poids, puis le biais</span><button type="button" class="btn small" data-reset>Réinitialiser</button></div><div class="lab-columns neuron-demo"><div class="input-card" style="flex:1;min-width:230px">${controls.map(([key, label, min, max, value, step]) => `<div class="range-row"><label for="basic-${key}">${label}</label><input id="basic-${key}" type="range" min="${min}" max="${max}" value="${value}" step="${step}" data-param="${key}"><output for="basic-${key}" data-value="${key}">${format(value)}</output></div>`).join('')}</div><div class="neuron-diagram"><div class="signal-list"><div class="signal"><span class="signal-dot" data-signal="x1"></span><span>× <b data-signal="w1"></b></span><i class="signal-wire"></i></div><div class="signal"><span class="signal-dot" data-signal="x2"></span><span>× <b data-signal="w2"></b></span><i class="signal-wire"></i></div></div><div class="neuron-circle"><b>Σ</b><small>+ biais</small></div><span class="operator">→</span><div class="output-block"><small>Après ReLU</small><strong data-output></strong></div></div></div><div class="equation" aria-live="polite" data-equation></div><p class="lab-note">Exemple réduit à deux luminosités pour comprendre le calcul d’un neurone. Ces poids sont choisis à la main ; ce n’est pas un modèle de reconnaissance d’objets.</p>`;
  const render = () => {
    const values = Object.fromEntries($$('[data-param]').map(input => [input.dataset.param, +input.value]));
    for (const [key, value] of Object.entries(values)) {
      $(`[data-value="${key}"]`).textContent = format(value);
      const signal = $(`[data-signal="${key}"]`);
      if (signal) signal.textContent = format(value);
    }
    const z = values.x1 * values.w1 + values.x2 * values.w2 + values.bias;
    $('[data-output]').textContent = format(Math.max(0, z));
    $('[data-equation]').innerHTML = `z = (${format(values.x1)} × ${format(values.w1)}) + (${format(values.x2)} × ${format(values.w2)}) + (${format(values.bias)}) = <strong>${format(z)}</strong><br>ReLU(z) = max(0, ${format(z)}) = <strong>${format(Math.max(0, z))}</strong>`;
  };
  $$('[data-param]').forEach(input => on(input, 'input', render));
  on($('[data-reset]'), 'click', () => { controls.forEach(([key, , , , value]) => { $(`[data-param="${key}"]`).value = value; }); render(); });
  render();
}

function mlp({ container, on, $, $$ }) {
  let selected = 0;
  const layers = [
    { name: 'Les entrées', label: '2 valeurs', x: 100, ys: [95, 185], text: 'Deux informations entrent dans le réseau. Chaque neurone de la couche suivante reçoit ces deux valeurs.' },
    { name: 'La couche cachée', label: '3 neurones', x: 330, ys: [65, 140, 215], text: 'Chaque neurone calcule sa propre somme pondérée, ajoute son biais et applique une activation. Les trois neurones peuvent ainsi construire trois combinaisons différentes des entrées.' },
    { name: 'La sortie', label: '2 neurones', x: 560, ys: [95, 185], text: 'Les neurones de sortie combinent les trois résultats précédents. Le réseau compose ainsi des transformations ; ses poids sont appris à partir d’exemples.' }
  ];
  container.innerHTML = `<div class="lab-caption"><span>Un petit réseau dense : 2 → 3 → 2</span><span>Schéma des connexions</span></div><div class="network-figure" data-network></div><div class="layer-buttons">${layers.map((layer, i) => `<button class="btn small" type="button" data-layer="${i}" aria-pressed="${i === 0}">${i + 1}. ${layer.name}</button>`).join('')}</div><p class="layer-info" data-info aria-live="polite"></p><p class="hint">Chaque trait est une connexion possédant son propre poids. Le schéma explique la structure, sans simuler une prédiction.</p>`;
  function render() {
    let edges = '';
    for (let layer = 0; layer < 2; layer++) for (const y1 of layers[layer].ys) for (const y2 of layers[layer + 1].ys) {
      const active = layer + 1 === selected;
      edges += `<line x1="${layers[layer].x + 23}" y1="${y1}" x2="${layers[layer + 1].x - 23}" y2="${y2}" stroke="${active ? '#58824e' : '#d3dfca'}" stroke-width="${active ? 2 : 1.2}" />`;
    }
    const nodes = layers.map((layer, i) => layer.ys.map((y, j) => `<circle cx="${layer.x}" cy="${y}" r="24" fill="${i === selected ? '#d9ef94' : '#f4f7ed'}" stroke="${i === selected ? '#527447' : '#a6bf93'}" stroke-width="1.5"/><text x="${layer.x}" y="${y + 4}" text-anchor="middle" class="svg-label-dark">${i ? 'Σ' : `x${j + 1}`}</text>`).join('') + `<text x="${layer.x}" y="272" text-anchor="middle" class="svg-label">${layer.label}</text>`).join('');
    $('[data-network]').innerHTML = `<svg viewBox="0 0 660 295" role="img" aria-label="Réseau dense : deux entrées reliées à trois neurones cachés, reliés à deux neurones de sortie">${edges}${nodes}</svg>`;
    $('[data-info]').textContent = layers[selected].text;
    $$('[data-layer]').forEach(button => { const active = +button.dataset.layer === selected; button.classList.toggle('primary', active); button.setAttribute('aria-pressed', active); });
  }
  $$('[data-layer]').forEach(button => on(button, 'click', () => { selected = +button.dataset.layer; render(); }));
  render();
}

function pixels({ container, on, $, $$ }) {
  const patterns = {
    digit: ['00011000', '00111000', '01011000', '00011000', '00011000', '00011000', '01111110', '00000000'],
    arrow: ['00010000', '00011000', '11111100', '11111110', '11111100', '00011000', '00010000', '00000000'],
    blank: Array(8).fill('00000000')
  };
  let values = patterns.digit.join('').split('').map(Number);
  container.innerHTML = `<div class="lab-toolbar"><label class="control">Dessin de départ <select data-pattern><option value="digit">Un chiffre 1</option><option value="arrow">Une flèche</option><option value="blank">Une grille vide</option></select></label><button class="btn small" type="button" data-clear>Tout effacer</button><span class="pill">Cliquez sur les pixels pour dessiner</span></div><div class="pixel-demo"><div class="matrix-group"><div class="matrix-label">Les 64 valeurs de l’image</div>${matrix(values, 8, { buttons: true, size: 28, label: 'Dessin modifiable de huit lignes et huit colonnes' })}</div><div class="pixel-preview"><div><div class="matrix-label">Le même tableau, vu comme une image</div><div data-preview style="margin-top:14px"></div></div><div class="pixel-readout"><h3>8 × 8 = 64 pixels</h3><p>0 = noir<br>1 = blanc</p><p data-pixel-info aria-live="polite">Choisissez une case pour inverser sa valeur.</p></div></div></div><p class="lab-note">Image binaire : chaque pixel vaut 0 ou 1. Une image en niveaux de gris utilise davantage de valeurs, souvent de 0 à 255 avant normalisation.</p>`;
  const render = () => {
    $$('[data-cell]').forEach((button, i) => {
      button.textContent = values[i];
      button.style.background = values[i] ? '#fff' : '#000';
      button.style.color = values[i] ? '#17392f' : '#fff';
      button.setAttribute('aria-pressed', !!values[i]);
      button.setAttribute('aria-label', `Ligne ${Math.floor(i / 8) + 1}, colonne ${i % 8 + 1}, valeur ${values[i]}. Cliquer pour inverser.`);
    });
    $('[data-preview]').innerHTML = `<svg viewBox="0 0 8 8" role="img" aria-label="Aperçu du dessin composé des 64 pixels" style="display:block;image-rendering:pixelated;border:1px solid #dce3d7;border-radius:4px">${values.map((v, i) => `<rect x="${i % 8}" y="${Math.floor(i / 8)}" width="1" height="1" fill="${v ? '#fff' : '#000'}"/>`).join('')}</svg>`;
  };
  $$('[data-cell]').forEach(button => on(button, 'click', () => {
    const i = +button.dataset.cell;
    values[i] = 1 - values[i];
    $('[data-pixel-info]').textContent = `Pixel ligne ${Math.floor(i / 8) + 1}, colonne ${i % 8 + 1} : ${values[i]}.`;
    render();
  }));
  on($('[data-pattern]'), 'change', event => { values = patterns[event.target.value].join('').split('').map(Number); $('[data-pixel-info]').textContent = 'Choisissez une case pour inverser sa valeur.'; render(); });
  on($('[data-clear]'), 'click', () => { values = Array(64).fill(0); $('[data-pattern]').value = 'blank'; $('[data-pixel-info]').textContent = 'Grille effacée. Dessinez votre propre motif.'; render(); });
  render();
}

function params({ container, on, $, $$ }) {
  container.innerHTML = `<div class="lab-toolbar"><label class="control">Image <select data-n><option value="32">32 × 32 × 3</option><option value="64">64 × 64 × 3</option></select></label><label class="control">Neurones denses <select data-h><option value="100">100</option><option value="32">32</option></select></label><label class="control">Filtres 3 × 3 <select data-k><option value="16">16</option><option value="8">8</option></select></label></div><div class="params-compare"><div class="params-card"><span>COUCHE DENSE APRÈS FLATTEN</span><strong data-dense-count></strong><p>paramètres, biais inclus</p><code data-dense-calc></code><p data-dense-shape style="margin:15px 0 0"></p></div><div class="params-card"><span>COUCHE CONVOLUTIVE</span><strong data-conv-count></strong><p>paramètres, biais inclus</p><code data-conv-calc></code><p data-conv-shape style="margin:15px 0 0"></p></div></div><div class="feedback" data-params-message aria-live="polite"></div><p class="lab-note">On compare ici les connexions de deux couches aux sorties différentes, pas deux réseaux complets ni leur précision. Convolution standard : stride 1, padding 1, un biais par filtre.</p>`;
  function render() {
    const n = +$('[data-n]').value, h = +$('[data-h]').value, k = +$('[data-k]').value;
    const dense = (n * n * 3 + 1) * h, conv = (3 * 3 * 3 + 1) * k;
    $('[data-dense-count]').textContent = format(dense);
    $('[data-conv-count]').textContent = format(conv);
    $('[data-dense-calc]').textContent = `(${n} × ${n} × 3 + 1) × ${h}`;
    $('[data-conv-calc]').textContent = `(3 × 3 × 3 + 1) × ${k}`;
    $('[data-dense-shape]').textContent = `Sortie : ${h} valeurs.`;
    $('[data-conv-shape]').textContent = `Sortie : ${n} × ${n} × ${k}.`;
    $('[data-params-message]').textContent = `Les ${k} filtres réutilisent leurs ${format(conv)} paramètres à chaque position. Agrandir l’image ne change pas ce nombre ; le volume de sortie et le travail de calcul augmentent.`;
  }
  $$('select').forEach(select => on(select, 'change', render));
  render();
}

function local({ container, on, $, $$ }) {
  let position = 0;
  const image = Array.from({ length: 49 }, (_, i) => i % 7 >= 3 ? 1 : 0);
  const filter = [1, 0, -1, 1, 0, -1, 1, 0, -1];
  container.innerHTML = `<div class="lab-toolbar"><button class="btn primary small" type="button" data-move>Déplacer le filtre d’une case →</button><span class="pill" data-position></span></div><div class="local-graphic"><div class="matrix-group"><div class="matrix-label">Une petite zone de l’image</div>${matrix(image, 7, { size: 31, label: 'Image 7 par 7 avec une fenêtre de 3 par 3' })}</div><span class="operator">×</span><div class="matrix-group"><div class="matrix-label">Toujours les mêmes 9 poids</div><div data-kernel>${matrix(filter, 3, { size: 40 })}</div></div><div class="local-detail"><h3>La fenêtre bouge.<br>Les poids restent.</h3><p>Le filtre inspecte seulement 3 × 3 pixels à la fois. À la position suivante, il réutilise les mêmes poids.</p></div></div><div class="equation" data-local-output aria-live="polite"></div><p class="lab-note">Quand on translate un motif, sa carte de réponses se déplace aussi dans des conditions adaptées. Une classification finale n’est pas automatiquement invariante à tous les déplacements.</p>`;
  function render() {
    const row = 2, col = 1 + position;
    const cells = [...container.querySelectorAll('.local-graphic > .matrix-group:first-child .cell')];
    cells.forEach((cell, i) => {
      const r = Math.floor(i / 7), c = i % 7;
      const active = r >= row && r < row + 3 && c >= col && c < col + 3;
      cell.classList.toggle('window', active);
      cell.setAttribute('aria-label', `${image[i]}${active ? ', dans la fenêtre' : ''}`);
    });
    const patch = Array.from({ length: 9 }, (_, i) => image[(row + Math.floor(i / 3)) * 7 + col + i % 3]);
    const result = patch.reduce((sum, value, i) => sum + value * filter[i], 0);
    $('[data-position]').textContent = `Position ${position + 1} sur 2 · fenêtre 3 × 3`;
    $('[data-local-output]').innerHTML = `Réponse à cette position : <strong>${result}</strong> · biais = 0<br>9 poids utilisés ici, puis réutilisés à la position suivante.`;
    $('[data-move]').textContent = position ? '← Revenir à la première position' : 'Déplacer le filtre d’une case →';
  }
  on($('[data-move]'), 'click', () => { position = 1 - position; render(); });
  render();
}

function rgb({ container, on, $, $$ }) {
  const channels = [['r', 'Rouge', 190], ['g', 'Vert', 120], ['b', 'Bleu', 70]];
  container.innerHTML = `<div class="lab-caption"><span>Un pixel couleur = trois intensités</span><span>Déplacez les curseurs</span></div><div class="rgb-planes">${channels.map(([key, label, value]) => `<div class="rgb-plane"><label for="rgb-${key}">${label} · <output for="rgb-${key}" data-value="${key}">${value}</output></label><input id="rgb-${key}" type="range" min="0" max="255" step="1" value="${value}" data-channel="${key}"></div>`).join('')}<span class="operator">→</span><div class="rgb-swatch" data-swatch role="img"></div></div><div class="equation" data-rgb-label aria-live="polite"></div><div class="mini-stats"><div class="mini-stat"><strong>3</strong><span>canaux en entrée : RGB</span></div><div class="mini-stat"><strong>3 × 3 × 3</strong><span>27 poids pour un filtre 3 × 3</span></div><div class="mini-stat"><strong>1</strong><span>carte produite par ce filtre</span></div></div><p class="lab-note">Un filtre standard possède une tranche 3 × 3 par canal. Il additionne leurs contributions et ajoute un biais pour produire une seule carte. Avec K filtres, on obtient K cartes, pas 3 × K.</p>`;
  function render() {
    const values = Object.fromEntries($$('[data-channel]').map(input => [input.dataset.channel, +input.value]));
    for (const [key, value] of Object.entries(values)) $(`[data-value="${key}"]`).textContent = value;
    $('[data-swatch]').style.background = `rgb(${values.r},${values.g},${values.b})`;
    $('[data-swatch]').setAttribute('aria-label', `Couleur résultante : rouge ${values.r}, vert ${values.g}, bleu ${values.b}`);
    $('[data-rgb-label]').textContent = `Ce pixel : [${values.r}, ${values.g}, ${values.b}] · Chaque position de l’image contient ses trois valeurs.`;
  }
  $$('[data-channel]').forEach(input => on(input, 'input', render));
  render();
}

function flatten({ container, on, $, $$ }) {
  let selected = -1;
  const values = Array.from({ length: 18 }, (_, i) => i + 1);
  container.innerHTML = `<div class="lab-toolbar"><button class="btn primary small" type="button" data-next>Suivre la première valeur →</button><button class="btn small" type="button" data-reset>Réinitialiser</button><span class="pill">Cliquez aussi sur une valeur</span></div><div class="lab-columns"><div><div class="matrix-label">Volume : 3 × 3 × 2</div><div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center">${[0, 1].map(channel => `<div><p class="channel-label" style="margin:12px 0 0">Canal ${channel + 1}</p><div class="matrix" style="--cols:3;--cell-size:34px">${values.slice(channel * 9, channel * 9 + 9).map((v, i) => `<button class="cell positive" data-source="${channel * 9 + i}" type="button" aria-label="Valeur ${v}, canal ${channel + 1}, ligne ${Math.floor(i / 3) + 1}, colonne ${i % 3 + 1}">${v}</button>`).join('')}</div></div>`).join('')}</div></div><span class="operator">→</span><div class="matrix-group"><div class="matrix-label">Vecteur : 18 valeurs</div><div class="flatten-vector" style="margin:18px auto">${values.map((v, i) => `<button class="cell positive" type="button" data-target="${i}" aria-label="Position ${i + 1} dans le vecteur : valeur ${v}">${v}</button>`).join('')}</div></div></div><div class="equation" data-flatten-info aria-live="polite">3 × 3 × 2 = <strong>18 éléments avant et après flatten</strong></div><p class="lab-note">Ordre choisi ici : toutes les valeurs du canal 1, puis celles du canal 2. D’autres bibliothèques peuvent utiliser un autre ordre. Flatten conserve les valeurs et leur nombre, sans apprendre de poids.</p>`;
  function render() {
    $$('[data-source], [data-target]').forEach(button => {
      const index = +(button.dataset.source ?? button.dataset.target);
      const active = index === selected;
      button.classList.toggle('focus-cell', active);
      button.setAttribute('aria-pressed', active);
    });
    $('[data-flatten-info]').innerHTML = selected < 0 ? '3 × 3 × 2 = <strong>18 éléments avant et après flatten</strong>' : `Valeur <strong>${values[selected]}</strong> du canal ${Math.floor(selected / 9) + 1} → position <strong>${selected + 1}</strong> dans la liste. Aucun élément n’est supprimé.`;
    $('[data-next]').textContent = selected < 0 ? 'Suivre la première valeur →' : selected === 17 ? 'Revenir à la première valeur →' : 'Suivre la valeur suivante →';
  }
  $$('[data-source], [data-target]').forEach(button => on(button, 'click', () => { selected = +(button.dataset.source ?? button.dataset.target); render(); }));
  on($('[data-next]'), 'click', () => { selected = (selected + 1) % 18; render(); });
  on($('[data-reset]'), 'click', () => { selected = -1; render(); });
  render();
}
