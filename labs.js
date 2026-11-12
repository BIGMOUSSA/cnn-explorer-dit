/* Interactive numerical laboratories. All calculations run locally. */
const fmt = (n, digits = 2) => Number.isInteger(n) ? String(n) : Number(n.toFixed(digits)).toLocaleString('fr-FR');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const matrix = (values, cols, label, cellClass = () => '', attrs = () => '', text = v => fmt(v)) => `<div class="matrix-group"><div class="matrix-label">${label}</div><div class="matrix" role="group" aria-label="${esc(label)}" style="--cols:${cols}">${values.map((v, i) => `<button type="button" class="cell ${cellClass(v, i)}" ${attrs(v, i)} aria-label="Ligne ${Math.floor(i / cols) + 1}, colonne ${i % cols + 1} : ${esc(text(v, i))}">${text(v, i)}</button>`).join('')}</div></div>`;
const button = (action, label, primary = false) => `<button type="button" class="btn${primary ? ' primary' : ''}" data-action="${action}">${label}</button>`;

function convolutionLab(type, el) {
  const input = Array.from({length:25}, (_, i) => [0,0,1,1,0][i % 5]);
  const filters = {
    vertical: {label:'Bords verticaux', values:[-1,0,1,-1,0,1,-1,0,1]},
    horizontal: {label:'Bords horizontaux', values:[-1,-1,-1,0,0,0,1,1,1]},
    average: {label:'Moyenne (flou)', values:Array(9).fill(1 / 9)}
  };
  let stride = type === 'stride' ? 2 : 1;
  let padding = type === 'padding' ? 1 : 0;
  let filter = 'vertical', position = 0, visited = new Set([0]), timer = null;
  const size = () => Math.floor((5 - 3 + 2 * padding) / stride) + 1;
  const sample = (r, c) => r >= 0 && r < 5 && c >= 0 && c < 5 ? input[r * 5 + c] : 0;
  const patchAt = index => {
    const n = size(), row = Math.floor(index / n) * stride - padding, col = index % n * stride - padding;
    return Array.from({length:9}, (_, i) => sample(row + Math.floor(i / 3), col + i % 3));
  };
  const valueAt = index => patchAt(index).reduce((sum, value, i) => sum + value * filters[filter].values[i], 0);
  const stop = () => { if (timer) clearInterval(timer); timer = null; };
  function render() {
    const n = size(), width = 5 + 2 * padding, startR = Math.floor(position / n) * stride, startC = position % n * stride;
    const padded = Array.from({length:width * width}, (_, i) => sample(Math.floor(i / width) - padding, i % width - padding));
    const patch = patchAt(position), weights = filters[filter].values, terms = patch.map((v,i) => `${fmt(v)} × (${fmt(weights[i])})`);
    el.innerHTML = `<div class="lab lab-convolution">
      <div class="lab-toolbar">
        <label class="control">Filtre <select data-control="filter" aria-label="Choisir le filtre">${Object.entries(filters).map(([key,v]) => `<option value="${key}" ${key === filter ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
        <label class="control">Pas S <select data-control="stride" aria-label="Pas du filtre"><option ${stride === 1 ? 'selected' : ''}>1</option><option ${stride === 2 ? 'selected' : ''}>2</option></select></label>
        <label class="control">Padding P <select data-control="padding" aria-label="Bordure de zéros"><option ${padding === 0 ? 'selected' : ''}>0</option><option ${padding === 1 ? 'selected' : ''}>1</option></select></label>
        <span class="pill">Position ${position + 1} / ${n * n}</span>
      </div>
      <div class="lab-columns">
        ${matrix(padded, width, `Entrée ${width} × ${width}${padding ? ' · zéros ajoutés' : ''}`, (_,i) => {const r=Math.floor(i/width),c=i%width;return `${r>=startR&&r<startR+3&&c>=startC&&c<startC+3?'selected':''} ${padding&&(r===0||c===0||r===width-1||c===width-1)?'zero-pad':''}`;})}
        ${matrix(weights,3,'Filtre 3 × 3 · partagé',v => v < 0 ? 'negative' : v > 0 ? 'positive' : '')}
        ${matrix(Array.from({length:n*n},(_,i)=>valueAt(i)), n, `Carte ${n} × ${n}`, (_,i) => i === position ? 'active' : visited.has(i) ? 'positive' : '', (_,i) => `data-output="${i}"`, (v,i) => visited.has(i) ? fmt(v) : '·')}
      </div>
      <div class="equation" aria-live="polite">${terms.join(' + ')} + 0 (biais) <strong>= ${fmt(valueAt(position))}</strong></div>
      <div class="lab-toolbar">${button('previous','← Position')}${button('next','Position suivante →',true)}${button('play',timer?'Pause':'▶ Animer')}${button('reset','Recommencer')}${button('all','Tout révéler')}</div>
      <p class="lab-note">${type === 'stride' ? `Le filtre avance de ${stride} pixel${stride>1?'s':''}. Un pas plus grand donne moins de positions.` : type === 'padding' ? `P = ${padding} : ${padding ? 'une bordure de zéros protège la taille spatiale pour S = 1 et F = 3.' : 'aucun zéro ajouté : le filtre doit rester dans l’image.'}` : 'La fenêtre encadrée est multipliée case par case par le même filtre. On additionne les neuf produits et le biais.'} Cliquez sur une case de sortie pour examiner son calcul.</p>
      <p class="hint">Sortie : ⌊(5 − 3 + 2 × ${padding}) / ${stride}⌋ + 1 = ${n}. Les filtres ci-dessus sont choisis à la main pour comprendre ; un CNN apprend leurs poids.</p>
    </div>`;
  }
  const click = event => {
    const output = event.target.closest('[data-output]');
    if (output) {stop();position=Number(output.dataset.output);visited.add(position);render();return;}
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'next' || action === 'previous') {stop();position=(position+(action==='next'?1:-1)+size()**2)%(size()**2);visited.add(position);}
    if (action === 'reset') {stop();position=0;visited=new Set([0]);}
    if (action === 'all') {stop();visited=new Set(Array.from({length:size()**2},(_,i)=>i));}
    if (action === 'play') {
      if (timer) stop();
      else timer=setInterval(()=>{position=(position+1)%(size()**2);visited.add(position);if(position===size()**2-1)stop();render();},750);
    }
    render();
  };
  const change = event => {const key=event.target.dataset.control;if(!key)return;stop();if(key==='filter')filter=event.target.value;if(key==='stride')stride=Number(event.target.value);if(key==='padding')padding=Number(event.target.value);position=0;visited=new Set([0]);render();};
  el.addEventListener('click',click);el.addEventListener('change',change);render();
  return ()=>{stop();el.removeEventListener('click',click);el.removeEventListener('change',change);};
}

function shapeLab(el) {
  const values={N:32,F:3,S:1,P:1,C:3,K:12};
  const select=(key,options,label)=>`<label class="control">${label}<select data-shape="${key}">${options.map(n=>`<option value="${n}" ${n===values[key]?'selected':''}>${n}</option>`).join('')}</select></label>`;
  el.innerHTML=`<div class="lab"><div class="lab-toolbar">
    <label class="control">Largeur / hauteur N<input aria-label="Taille de l’entrée" data-shape="N" type="number" min="5" max="256" step="1" value="32"></label>
    ${select('F',[1,3,5,7],'Taille du filtre F')}${select('S',[1,2,3],'Pas S')}${select('P',[0,1,2,3],'Padding P')}${select('C',[1,3],'Canaux d’entrée C')}
    <label class="control">Nombre de filtres K<input aria-label="Nombre de filtres" data-shape="K" type="number" min="1" max="32" value="12"></label>
    </div><div data-shape-result aria-live="polite"></div><p class="lab-note">Hypothèse : image carrée, filtres carrés, convolution standard avec un biais par filtre. ⌊x⌋ signifie « prendre l’entier inférieur ».</p></div>`;
  function update(){
    const result=el.querySelector('[data-shape-result]');
    const valid=Number.isInteger(values.N)&&values.N>=5&&values.N<=256&&Number.isInteger(values.K)&&values.K>=1&&values.K<=32;
    const raw=(values.N-values.F+2*values.P)/values.S, output=Math.floor(raw)+1;
    if(!valid || output<1){result.innerHTML='<p class="feedback">Choisissez N entre 5 et 256, K entre 1 et 32 et un filtre qui tient dans l’entrée complétée.</p>';return;}
    const params=(values.F**2*values.C+1)*values.K;
    result.innerHTML=`<div class="equation">⌊(${values.N} − ${values.F} + 2 × ${values.P}) / ${values.S}⌋ + 1<br><strong>⌊${fmt(raw,4)}⌋ + 1 = ${output}</strong></div><div class="lab-columns"><div class="stat"><small>Entrée</small><strong>${values.N} × ${values.N} × ${values.C}</strong></div><div class="stat"><small>Sortie</small><strong>${output} × ${output} × ${values.K}</strong></div><div class="stat"><small>Paramètres appris</small><strong>${params.toLocaleString('fr-FR')}</strong></div></div><p class="hint">${values.K} filtres donnent ${values.K} cartes. Paramètres : (${values.F} × ${values.F} × ${values.C} + 1 biais) × ${values.K} = ${params.toLocaleString('fr-FR')}. Leur nombre ne dépend pas de N.</p>`;
  }
  const onInput=e=>{if(e.target.dataset.shape){values[e.target.dataset.shape]=Number(e.target.value);update();}};
  el.addEventListener('input',onInput);update();
  return()=>el.removeEventListener('input',onInput);
}

function reluLab(el) {
  const input=[-3,2,-1,0,5,-4,3,-2,1];let enabled=false;
  function render(){el.innerHTML=`<div class="lab"><div class="lab-columns">${matrix(input,3,'Avant ReLU',v=>v<0?'negative':'positive')}${matrix(input.map(v=>enabled?Math.max(0,v):v),3,enabled?'Après ReLU':'Même carte · ReLU désactivée',v=>v<0?'negative':v>0?'positive':'')}</div><div class="equation">ReLU(x) = max(0, x)<br><strong>${enabled?'Les valeurs négatives deviennent 0. Les positives restent identiques.':'Observez les valeurs négatives avant d’activer ReLU.'}</strong></div><div class="lab-toolbar">${button('toggle',enabled?'Désactiver ReLU':'Appliquer ReLU',true)}${button('reset','Recommencer')}</div><p class="lab-note">La forme reste 3 × 3. ReLU n’apprend aucun poids ; elle introduit une non-linéarité entre les couches.</p></div>`;}
  const click=e=>{const action=e.target.closest('[data-action]')?.dataset.action;if(action){enabled=action==='reset'?false:!enabled;render();}};
  el.addEventListener('click',click);render();return()=>el.removeEventListener('click',click);
}

function poolingLab(type,el) {
  const input=[1,3,2,1,5,6,1,2,4,2,8,3,1,0,4,9];let mode=type==='average'?'average':'max',position=0;
  const patch=i=>{const r=Math.floor(i/2)*2,c=i%2*2;return [input[r*4+c],input[r*4+c+1],input[(r+1)*4+c],input[(r+1)*4+c+1]];};
  const result=i=>mode==='max'?Math.max(...patch(i)):patch(i).reduce((a,b)=>a+b,0)/4;
  function render(){const current=patch(position);el.innerHTML=`<div class="lab"><div class="lab-toolbar"><label class="control">Opération<select data-pooling><option value="max" ${mode==='max'?'selected':''}>Max pooling</option><option value="average" ${mode==='average'?'selected':''}>Average pooling</option></select></label><span class="pill">Fenêtre 2 × 2 · pas 2 · padding 0</span></div><div class="lab-columns">${matrix(input,4,'Entrée 4 × 4',(_,i)=>Math.floor(Math.floor(i/4)/2)*2+Math.floor((i%4)/2)===position?'selected':'',(_,i)=>`data-window="${Math.floor(Math.floor(i/4)/2)*2+Math.floor((i%4)/2)}"`)}${matrix(Array.from({length:4},(_,i)=>result(i)),2,'Sortie 2 × 2',(_,i)=>i===position?'active':'',(_,i)=>`data-window="${i}"`)}</div><div class="equation" aria-live="polite">${mode==='max'?`max(${current.join(', ')})`:`(${current.join(' + ')}) / 4`} <strong>= ${fmt(result(position))}</strong></div><div class="lab-toolbar">${Array.from({length:4},(_,i)=>`<button type="button" class="btn ${i===position?'primary':''}" data-window="${i}">Bloc ${i+1}</button>`).join('')}${button('next','Bloc suivant →')}</div><p class="lab-note">${mode==='max'?'On conserve la réponse la plus forte de chaque bloc.':'On conserve la valeur moyenne de chaque bloc.'} Le pooling ne possède aucun poids appris. Chaque canal est traité séparément : le nombre de canaux reste identique.</p><p class="hint">De petits déplacements peuvent garder le même maximum dans un bloc ; cette tolérance locale n’est pas une invariance garantie pour tous les déplacements.</p></div>`;}
  const click=e=>{const target=e.target.closest('[data-window]');if(target){position=Number(target.dataset.window);render();}else if(e.target.closest('[data-action="next"]')){position=(position+1)%4;render();}};
  const change=e=>{if(e.target.hasAttribute('data-pooling')){mode=e.target.value;render();}};
  el.addEventListener('click',click);el.addEventListener('change',change);render();return()=>{el.removeEventListener('click',click);el.removeEventListener('change',change);};
}

function learningLab(el) {
  const vertical=[0,1,0,0,1,0,0,1,0],horizontal=[0,0,0,1,1,1,0,0,0];
  const samples=[];
  for(const [pattern,y] of [[vertical,1],[horizontal,0]]){
    for(const scale of [.5,.7,.85,1])samples.push({x:pattern.map((v,i)=>v*scale+(v===0&&i===0?.08:0)),y});
  }
  let weights=Array(9).fill(0),bias=0,epoch=0,timer=null,selected=0;
  const sigmoid=z=>1/(1+Math.exp(-z));
  const predict=x=>sigmoid(x.reduce((sum,v,i)=>sum+v*weights[i],bias));
  const stop=()=>{if(timer)clearInterval(timer);timer=null;};
  function metrics(){let loss=0,correct=0;for(const sample of samples){const p=predict(sample.x);loss-=sample.y*Math.log(Math.max(1e-12,p))+(1-sample.y)*Math.log(Math.max(1e-12,1-p));if(Number(p>=.5)===sample.y)correct++;}return{loss:loss/samples.length,accuracy:correct/samples.length};}
  function step(){const gradient=Array(9).fill(0);let db=0;for(const sample of samples){const error=predict(sample.x)-sample.y;db+=error;sample.x.forEach((v,i)=>gradient[i]+=error*v);}weights=weights.map((v,i)=>v-.5*gradient[i]/samples.length);bias-=.5*db/samples.length;epoch++;}
  function render(){const m=metrics(),sample=samples[selected],p=predict(sample.x);el.innerHTML=`<div class="lab"><div class="lab-toolbar"><span class="pill">Vrai calcul de gradient · 8 petits exemples artificiels</span><label class="control">Patch observé<select data-sample>${samples.map((s,i)=>`<option value="${i}" ${i===selected?'selected':''}>${s.y?'Vertical':'Horizontal'} · exemple ${i%4+1}</option>`).join('')}</select></label></div><div class="lab-columns">${matrix(sample.x,3,`Patch · cible ${sample.y?'verticale (1)':'horizontale (0)'}`,v=>v>0?'positive':'')}${matrix(weights,3,'Poids du filtre · appris',v=>v<-.01?'negative':v>.01?'positive':'')}<div class="stat"><small>Probabilité « vertical »</small><strong>${fmt(p*100,1)} %</strong><small>Cible : ${sample.y*100} %</small></div></div><div class="lab-columns"><div class="mini-stat"><small>Époques</small><strong>${epoch} / 100</strong></div><div class="mini-stat"><small>Erreur moyenne (entropie croisée)</small><strong>${fmt(m.loss,4)}</strong></div><div class="mini-stat"><small>Réussite sur ces 8 exemples</small><strong>${fmt(m.accuracy*100,1)} %</strong></div></div><div class="lab-toolbar">${button('train',timer?'Pause':epoch>=100?'Entraînement terminé':'▶ Apprendre',true)}${button('step','1 époque')}${button('reset','Réinitialiser')}</div><p class="equation">9 poids + 1 biais → score → sigmoïde → probabilité<br><strong>Biais appris : ${fmt(bias,4)}</strong></p><p class="lab-note">À chaque époque : prédire les 8 cibles, calculer l’erreur puis ajuster les poids avec un pas de 0,5. Le même filtre voit tous les exemples ; il apprend à séparer ces deux motifs.</p><p class="hint">Ce laboratoire entraîne réellement un seul filtre sur des patchs 3 × 3. Il ne constitue pas un CNN complet. La réussite affichée concerne uniquement les 8 exemples d’entraînement ; elle ne mesure pas la généralisation.</p></div>`;}
  const click=e=>{const action=e.target.closest('[data-action]')?.dataset.action;if(!action)return;if(action==='reset'){stop();weights=Array(9).fill(0);bias=0;epoch=0;}if(action==='step'){stop();if(epoch<100)step();}if(action==='train'){if(timer)stop();else if(epoch<100)timer=setInterval(()=>{step();if(epoch>=100)stop();render();},110);}render();};
  const change=e=>{if(e.target.hasAttribute('data-sample')){selected=Number(e.target.value);render();}};
  el.addEventListener('click',click);el.addEventListener('change',change);render();return()=>{stop();el.removeEventListener('click',click);el.removeEventListener('change',change);};
}

export function mountLab(type,container) {
  if(['convolution','stride','padding'].includes(type))return convolutionLab(type,container);
  if(type==='shapes')return shapeLab(container);
  if(type==='relu')return reluLab(container);
  if(['pooling','average'].includes(type))return poolingLab(type,container);
  if(type==='learning')return learningLab(container);
  return()=>{};
}
