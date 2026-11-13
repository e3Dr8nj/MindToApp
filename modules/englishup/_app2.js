/* ---------- Exam: honest self-assessment and level-driven repetition ---------- */
function weightedSample(words,count,seed=Date.now()){
  const rnd=mulberry(seed>>>0), pool=words.map(w=>({w,key:Math.pow(rnd(),1/Math.max(1,11-w.level))}));
  pool.sort((a,b)=>b.key-a.key);return pool.slice(0,count).map(o=>o.w);
}
function startExam(source='due',category='all',length=10,forcedIds=null){
  let pool=state.words.filter(w=>(category==='all'||w.category===category)&&(source==='all'||source==='weak'&&w.level<=4||source==='due'&&w.nextReview<=Date.now()));
  if(forcedIds)pool=forcedIds.map(getWord).filter(Boolean);
  if(!pool.length){toast(source==='due'?'В этой выборке нет слов к повторению. Выбери «Все слова» или добави новые.':'В этой выборке пока нет слов.');showView('exam');renderExam();return;}
  const count=length==='all'?pool.length:Math.min(+length||10,pool.length);
  const chosen=source==='due'&&!forcedIds?pool.sort((a,b)=>a.level-b.level||a.nextReview-b.nextReview).slice(0,count):weightedSample(pool,count);
  state.exam={queue:chosen.map(w=>w.id),index:0,revealed:false,results:[],skipped:0,startedAt:Date.now(),finished:false,counted:false,source,category,length};
  save();showView('exam');renderExam();
}
function currentExamWord(){const e=state.exam;return e&&!e.finished?getWord(e.queue[e.index]):null;}
function renderExam(){
  const e=state.exam,box=$('#examContent');const active=e&&!e.finished&&e.queue.length;
  $('#examStartBtn').innerHTML=(active?'Новая сессия':'Начать')+icon('arrow','sm');
  if(e){$('#examSource').value=e.source;$('#examCategory').value=e.category;$('#examLength').value=String(e.length);}
  if(!e){box.innerHTML=`<div class="card exam-complete"><div class="complete-icon">${icon('exam')}</div><h2>Проверим, что осталось в памяти?</h2><p>Выбери слова и количество карточек сверху. Сначала вспомни перевод сам, затем раскрой ответ и поставь честную оценку.</p><div class="hint" style="justify-content:center">${icon('info','sm')}Подсказка: пробел — раскрыть карточку, 1–9 и 0 — оценка.</div></div>`;renderSessionStats();return;}
  if(e.finished){renderExamComplete();renderSessionStats();return;}
  const w=currentExamWord();if(!w){e.finished=true;save();renderExamComplete();return;}
  const c=getCat(w.category),done=e.results.length,total=e.queue.length;
  box.innerHTML=`<div class="card exam-card ${e.revealed?'revealed':''}" id="examCard"><div class="exam-top">${catChip(w)}<span class="hint">${icon('layers','sm')}Карточка ${done+1} из ${total}</span></div><div class="exam-progress"><i style="width:${done/total*100}%"></i></div><div class="exam-word" id="revealArea" role="button" tabindex="0" aria-expanded="${e.revealed}" aria-label="Показать перевод и примеры"><h2>${esc(w.word)}</h2><div class="ipa">${esc(w.ipa||'')} <button class="icon-btn" data-speak="${esc(w.word)}" style="display:inline-flex;vertical-align:middle;width:30px;height:30px" aria-label="Озвучить слово">${icon('sound','sm')}</button></div><span class="reveal-hint">${icon('eye','sm')}Показать перевод и примеры</span></div><div class="exam-answer" id="examAnswer"><div class="exam-translation">${esc(w.translation)}</div>${examplesHTML(w,'exam')}</div></div><div class="card rating-panel"><div class="rating-head"><h3>Насколько хорошо ты знаешь это слово?</h3><span>${e.revealed?'Оцени честно — это меняет расписание':'Сначала вспомни и раскрой карточку'}</span></div><div class="rating-grid">${Array.from({length:10},(_,i)=>{const l=i+1;return `<button class="rate-btn ${w.level===l?'current':''}" data-rate="${l}" style="--rc:${levelColor(l)}" ${!e.revealed?'disabled':''} title="${l}/10 · повторить через ${INTERVAL_LABELS[i]}" aria-label="Оценка ${l} из 10, повторить через ${INTERVAL_LABELS[i]}">${l}</button>`;}).join('')}</div><div class="rate-labels"><span>1 · совсем не знаю</span><span>10 · знаю отлично</span></div><div class="interval-preview" id="ratingPreview">${icon('clock','sm')}Текущая оценка: <b>${w.level}/10</b> · повторение через ${INTERVAL_LABELS[w.level-1]}</div></div><div class="exam-controls"><button class="btn btn-ghost btn-sm" id="examUndo" ${!e.results.length?'disabled':''}>${icon('undo','sm')}Отменить оценку</button><div class="head-actions"><button class="btn btn-outline btn-sm" id="examSkip">${icon('skip','sm')}Позже</button><button class="btn btn-ghost btn-sm" id="examEnd">Завершить</button></div></div>`;
  $('#revealArea').onclick=ev=>{if(ev.target.closest('[data-speak]'))return;revealExam();};
  $('#revealArea').onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();revealExam();}};
  $$('[data-rate]',box).forEach(btn=>{btn.onmouseenter=()=>{$('#ratingPreview').innerHTML=`${icon('clock','sm')}Оценка <b>${btn.dataset.rate}/10</b> → следующее слово через <b>${INTERVAL_LABELS[+btn.dataset.rate-1]}</b>`;};btn.onmouseleave=()=>{const cw=currentExamWord();if(cw)$('#ratingPreview').innerHTML=`${icon('clock','sm')}Текущая оценка: <b>${cw.level}/10</b> · повторение через ${INTERVAL_LABELS[cw.level-1]}`;};btn.onclick=()=>rateExam(+btn.dataset.rate);});
  $('#examSkip').onclick=skipExam;$('#examUndo').onclick=undoExam;$('#examEnd').onclick=()=>confirmAction('Завершить сессию?',e.results.length?`Оценки ${e.results.length} слов уже сохранены. Остальные слова останутся в очереди повторений.`:'Пока нет ни одной оценки. Сессия не будет засчитана.','Завершить',finishExam);
  renderSessionStats();
}
function revealExam(){const e=state.exam;if(!e||e.finished||e.revealed)return;e.revealed=true;save();$('#examCard')?.classList.add('revealed');$('#revealArea')?.setAttribute('aria-expanded','true');$$('[data-rate]').forEach(b=>b.disabled=false);$('.rating-head span').textContent='Оцени честно — это меняет расписание';}
function rateExam(level){
  const e=state.exam,w=currentExamWord();if(!e||e.finished||!w||!e.revealed)return;
  const before=setWordLevel(w.id,level,true);const historyId=state.history[state.history.length-1].id;
  e.results.push({id:w.id,before,after:level,at:Date.now(),historyId});e.index++;e.revealed=false;
  if(e.index>=e.queue.length){finishExam(false);}else{save();renderExam();}
}
function skipExam(){const e=state.exam;if(!e||e.finished)return;const remaining=e.queue.length-e.index;if(remaining<=1){toast('Это последняя карточка. Оцени её или заверши сессию.');return;}const [id]=e.queue.splice(e.index,1);e.queue.push(id);e.skipped++;e.revealed=false;save();renderExam();toast('Карточка вернётся в конце сессии.');}
function undoExam(){const e=state.exam;if(!e||e.finished||!e.results.length)return;const r=e.results.pop(),w=getWord(r.id);if(w)Object.assign(w,r.before);state.history=state.history.filter(h=>h.id!==r.historyId);e.index=Math.max(0,e.queue.indexOf(r.id));e.revealed=true;refreshAll();toast('Последняя оценка отменена.');}
function finishExam(notify=true){const e=state.exam;if(!e)return;if(e.results.length&&!e.counted){state.sessions++;e.counted=true;}e.finished=true;e.finishedAt=Date.now();save();refreshAll();if(notify&&currentView==='exam')renderExam();if(e.results.length&&!reducedMotion)confetti();}
function renderExamComplete(){const e=state.exam,results=e.results,avg=results.length?results.reduce((s,r)=>s+r.after,0)/results.length:0,improved=results.filter(r=>r.after>r.before.level).length,mins=Math.max(1,Math.round(((e.finishedAt||Date.now())-e.startedAt)/60000));
  $('#examContent').innerHTML=`<div class="card exam-complete"><div class="complete-icon">${icon('check')}</div><div class="eyebrow">СЕССИЯ ЗАВЕРШЕНА</div><h2>${results.length?'Связи стали крепче.':'Сессия закрыта'}</h2><p>${results.length?'Оценки сохранены. Слабые слова вернутся раньше, сильные — позже.':'В этот раз без оценок. Начни новую сессию, когда будешь готов.'}</p><div class="complete-stats"><div><b>${results.length}</b><span>слов оценено</span></div><div><b>${avg.toFixed(1)}</b><span>средняя оценка</span></div><div><b>${mins} мин</b><span>в практике</span></div></div><p class="hint" style="justify-content:center">${icon('target','sm')}Оценка выросла у ${improved} слов · пропущено карточек: ${e.skipped}</p><div class="head-actions" style="justify-content:center;margin-top:22px"><button class="btn btn-primary" id="examAgain">${icon('reset','sm')}Ещё сессия</button><button class="btn btn-outline" id="examToMap">${icon('network','sm')}Посмотреть карту</button></div></div>`;
  $('#examAgain').onclick=()=>startExam($('#examSource').value,$('#examCategory').value,$('#examLength').value);$('#examToMap').onclick=()=>showView('map');renderSessionStats();
}
function renderSessionStats(){const e=state.exam,results=e?.results||[],avg=results.length?results.reduce((s,r)=>s+r.after,0)/results.length:0;const remaining=e&&!e.finished?e.queue.length-e.index:0;
  $('#sessionStats').innerHTML=`<div class="session-stat"><span>Оценено</span><b>${results.length} / ${e?.queue.length||0}</b></div><div class="session-stat"><span>Средняя оценка</span><b>${avg?avg.toFixed(1)+' / 10':'—'}</b></div><div class="session-stat"><span>Осталось</span><b>${remaining}</b></div><div class="session-stat"><span>Отложено</span><b>${e?.skipped||0}</b></div><div class="hint" style="margin-top:12px">${icon('save','sm')}Сессия сохраняется автоматически</div>`;
  $('#scheduleList').innerHTML=INTERVALS.map((_,i)=>`<div class="schedule-row"><span class="n" style="background:${levelColor(i+1)};color:${i+1>=4&&i+1<=6?'#5C4300':'#fff'}">${i+1}</span><span>${levelText(i+1)}</span><span class="t">${INTERVAL_LABELS[i]}</span></div>`).join('');
}
function confetti(){const colors=['#2459EB','#BFF2D2','#FFC857','#FF7A66','#8B7CF6'];for(let i=0;i<28;i++){const p=document.createElement('i');p.className='confetti';p.style.cssText=`left:${45+Math.random()*10}%;top:35%;background:${colors[i%colors.length]};--dx:${(Math.random()-.5)*420}px;--dy:${120+Math.random()*260}px;--rot:${Math.random()*720}deg;animation-delay:${Math.random()*.15}s`;document.body.appendChild(p);setTimeout(()=>p.remove(),1600);}}

/* ---------- Neural map: one lifecycle, live controls, drag/pan/zoom, SVG export ---------- */
let mapNodes=[],mapEdges=[],mapRAF=0,mapDrag=null,mapBuiltKey='',mapLastFrame=0;
const svgNS='http://www.w3.org/2000/svg';
function svgEl(tag,attrs={}){const el=document.createElementNS(svgNS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));return el;}
function stopMap(){if(mapRAF)cancelAnimationFrame(mapRAF);mapRAF=0;mapDrag=null;}
function syncMapControls(){['mapCategory','mapMinLevel','mapNodeSize','mapSpread','mapColorMode','mapLabels'].forEach(id=>{const key=id.replace('map','');const k=key.charAt(0).toLowerCase()+key.slice(1);$('#'+id).value=mapCtl[k];});$('#mapEdges').checked=mapCtl.edges;$('#mapMotion').checked=mapCtl.motion;updateMapOutputs();}
function updateMapOutputs(){$('#mapMinLevelOut').textContent=mapCtl.minLevel;$('#mapNodeSizeOut').textContent=mapCtl.nodeSize+'%';$('#mapSpreadOut').textContent=mapCtl.spread+'%';$('#mapZoomOut').textContent=Math.round(mapCtl.zoom*100)+'%';}
function mapFiltered(){return state.words.filter(w=>(mapCtl.category==='all'||w.category===mapCtl.category)&&w.level>=mapCtl.minLevel);}
function buildMap(){
  const words=mapFiltered(),key=words.map(w=>w.id).join('|')+':'+mapCtl.seed+':'+state.categories.map(c=>c.id).join('|');
  const svg=$('#neuralSvg');svg.innerHTML='';mapNodes=[];mapEdges=[];
  const defs=svgEl('defs');const glow=svgEl('filter',{id:'nodeGlow',x:'-80%',y:'-80%',width:'260%',height:'260%'});glow.appendChild(svgEl('feGaussianBlur',{stdDeviation:'3',result:'blur'}));const merge=svgEl('feMerge');merge.appendChild(svgEl('feMergeNode',{in:'blur'}));merge.appendChild(svgEl('feMergeNode',{in:'SourceGraphic'}));glow.appendChild(merge);defs.appendChild(glow);svg.appendChild(defs);
  const bg=svgEl('rect',{width:1000,height:640,fill:'#FAFAF7'});svg.appendChild(bg);
  const viewport=svgEl('g',{id:'mapViewport'});svg.appendChild(viewport);const edgeLayer=svgEl('g',{id:'mapEdgeLayer'}),nodeLayer=svgEl('g',{id:'mapNodeLayer'}),labelLayer=svgEl('g',{id:'mapCatLabels'});viewport.append(edgeLayer,nodeLayer,labelLayer);
  const cats=state.categories.filter(c=>words.some(w=>w.category===c.id));const rnd=mulberry(mapCtl.seed);
  const centers=cats.map((c,i)=>{if(cats.length===1)return {c,x:500,y:320};const a=-Math.PI/2+i/cats.length*Math.PI*2;return {c,x:500+Math.cos(a)*300,y:320+Math.sin(a)*195};});
  centers.forEach(({c,x,y},ci)=>{const ws=words.filter(w=>w.category===c.id);ws.forEach((w,i)=>{const a=i*2.39996+ci*.7+rnd()*.5,r=28+Math.sqrt(i+1)*24+rnd()*14;const bx=clamp(x+Math.cos(a)*r,55,945),by=clamp(y+Math.sin(a)*r*.78,65,585);const g=svgEl('g',{class:'node',tabindex:'0',role:'button','data-node':w.id,'aria-label':`${w.word}, знание ${w.level} из 10. Открыть карточку`});const halo=svgEl('circle',{class:'halo',fill:levelColor(w.level),opacity:.1});const core=svgEl('circle',{class:'core',fill:levelColor(w.level),stroke:'#fff','stroke-width':2});const text=svgEl('text',{x:0,y:0,'text-anchor':'middle'});text.textContent=w.word;g.append(halo,core,text);nodeLayer.appendChild(g);const node={id:w.id,w,g,halo,core,text,bx,by,x:bx,y:by,phase:rnd()*Math.PI*2,cat:c,ci};mapNodes.push(node);
    g.addEventListener('pointerdown',ev=>{ev.stopPropagation();ev.preventDefault();const p=mapPoint(ev);mapDrag={type:'node',node,startX:p.x,startY:p.y,origX:node.bx,origY:node.by,moved:false,pointerId:ev.pointerId};svg.setPointerCapture(ev.pointerId);});
    g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();openDrawer(w.id);}});
    g.addEventListener('pointerenter',ev=>showMapTooltip(node,ev));g.addEventListener('pointermove',ev=>{if(!mapDrag)showMapTooltip(node,ev);});g.addEventListener('pointerleave',hideMapTooltip);
  });
    const label=svgEl('text',{class:'cat-label',x,y:y-82,'text-anchor':'middle'});label.textContent=c.name;labelLayer.appendChild(label);const ring=svgEl('ellipse',{cx:x,cy:y,rx:112,ry:82,fill:'none',stroke:c.color,'stroke-width':1,'stroke-dasharray':'3 7',opacity:.18});labelLayer.insertBefore(ring,label);
  });
  const byId=new Map(mapNodes.map(n=>[n.id,n]));
  mapNodes.forEach(n=>{const same=mapNodes.filter(m=>m.cat.id===n.cat.id&&m.id!==n.id).sort((a,b)=>Math.hypot(a.bx-n.bx,a.by-n.by)-Math.hypot(b.bx-n.bx,b.by-n.by)).slice(0,2);same.forEach(m=>{const k=[n.id,m.id].sort().join('|');if(!mapEdges.some(e=>e.k===k))mapEdges.push({k,a:n,b:m,cross:false});});});
  for(let i=0;i<centers.length;i++){const a=mapNodes.filter(n=>n.ci===i).sort((a,b)=>b.w.level-a.w.level)[0],b=mapNodes.filter(n=>n.ci===(i+1)%centers.length).sort((a,b)=>b.w.level-a.w.level)[0];if(a&&b&&a!==b)mapEdges.push({k:'cross'+i,a,b,cross:true});}
  mapEdges.forEach(e=>{e.el=svgEl('line',{class:'edge'});edgeLayer.appendChild(e.el);});
  if(!words.length){const t=svgEl('text',{x:500,y:320,'text-anchor':'middle',fill:'#6E7687','font-size':16,'font-family':'Segoe UI, sans-serif'});t.textContent='Нет слов под эти фильтры. Снизь минимальный уровень или добавь слова.';viewport.appendChild(t);}
  applyMapStyles();applyMapTransform();updateMapFrame(0);updateMapStats();
}
function applyMapStyles(){
  mapNodes.forEach(n=>{const l=n.w.level,col=mapCtl.colorMode==='category'?n.cat.color:levelColor(l),r=(5+l*.95)*mapCtl.nodeSize/100;n.core.setAttribute('fill',col);n.core.setAttribute('r',r);n.core.setAttribute('opacity',.55+l*.045);n.halo.setAttribute('fill',col);n.halo.setAttribute('r',r+5+l*.5);n.halo.setAttribute('opacity',.05+l*.012);const show=mapCtl.labels==='all'||mapCtl.labels==='smart'&&(l>=8||n.w.reviewCount>=12);n.text.style.display=show?'':'none';n.text.setAttribute('y',r+15);});
  mapEdges.forEach(e=>{const avg=(e.a.w.level+e.b.w.level)/2;e.el.setAttribute('stroke',e.cross?'#8B7CF6':e.a.cat.color);e.el.setAttribute('stroke-width',e.cross?1.1:.7+avg*.12);e.el.setAttribute('opacity',mapCtl.edges?(e.cross?.18:.08+avg*.035):0);e.el.setAttribute('stroke-dasharray',e.cross?'4 6':'none');});
}
function applyMapTransform(){const z=mapCtl.zoom;$('#mapViewport')?.setAttribute('transform',`translate(${mapCtl.panX+500*(1-z)} ${mapCtl.panY+320*(1-z)}) scale(${z})`);updateMapOutputs();}
function updateMapFrame(t){
  const spread=mapCtl.spread/100;mapNodes.forEach(n=>{const drift=mapCtl.motion&&!reducedMotion&&mapDrag?.node!==n?Math.sin(t*.00045+n.phase)*2.2:0;n.x=500+(n.bx-500)*spread+drift;n.y=320+(n.by-320)*spread+drift*.6;n.g.setAttribute('transform',`translate(${n.x.toFixed(2)} ${n.y.toFixed(2)})`);});
  mapEdges.forEach(e=>{e.el.setAttribute('x1',e.a.x.toFixed(2));e.el.setAttribute('y1',e.a.y.toFixed(2));e.el.setAttribute('x2',e.b.x.toFixed(2));e.el.setAttribute('y2',e.b.y.toFixed(2));});
}
function startMap(){stopMap();if(currentView!=='map')return;const loop=t=>{if(currentView!=='map'){mapRAF=0;return;}if(t-mapLastFrame>30){updateMapFrame(t);mapLastFrame=t;}mapRAF=requestAnimationFrame(loop);};mapRAF=requestAnimationFrame(loop);}
function mapPoint(ev){const svg=$('#neuralSvg'),pt=svg.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;const p=pt.matrixTransform(svg.getScreenCTM().inverse());const z=mapCtl.zoom;return {x:(p.x-mapCtl.panX-500*(1-z))/z,y:(p.y-mapCtl.panY-320*(1-z))/z,rawX:p.x,rawY:p.y};}
function showMapTooltip(n,ev){if(mapDrag)return;const tip=$('#mapTooltip'),stage=$('#mapStage'),r=stage.getBoundingClientRect();tip.innerHTML=`<b>${esc(n.w.word)}</b> · ${n.w.level}/10<small>${esc(n.w.translation)}</small><small>${esc(n.cat.name)} · ${dueLabel(n.w.nextReview)}</small>`;tip.style.display='block';const x=clamp(ev.clientX-r.left+14,8,r.width-240),y=clamp(ev.clientY-r.top+14,8,r.height-90);tip.style.left=x+'px';tip.style.top=y+'px';}
function hideMapTooltip(){$('#mapTooltip').style.display='none';}
function updateMapStats(){const ws=mapFiltered(),avg=ws.length?ws.reduce((s,w)=>s+w.level,0)/ws.length:0;$('#mapStats').innerHTML=`<span><b>${ws.length}</b> узлов</span><span><b>${mapCtl.edges?mapEdges.length:0}</b> связей</span><span>среднее <b>${avg.toFixed(1)}</b></span>`;}
function exportMap(){const clone=$('#neuralSvg').cloneNode(true);clone.setAttribute('xmlns',svgNS);clone.setAttribute('width','1000');clone.setAttribute('height','640');clone.removeAttribute('role');const style=svgEl('style');style.textContent='.node text{font-family:Segoe UI,sans-serif;font-size:11px;font-weight:700;fill:#182238;paint-order:stroke;stroke:#FAFAF7;stroke-width:3px;stroke-linejoin:round}.cat-label{font-family:Segoe UI,sans-serif;font-size:12px;font-weight:800;fill:#6E7687}.edge{stroke-linecap:round}';clone.insertBefore(style,clone.firstChild);clone.querySelectorAll('[tabindex]').forEach(n=>{n.removeAttribute('tabindex');n.removeAttribute('role');});download('englishup-neural-map.svg',new XMLSerializer().serializeToString(clone),'image/svg+xml');toast('Карта сохранена в текущем виде.');}
function bindMapControls(){
  const rebuild=()=>{buildMap();updateMapStats();};
  $('#mapCategory').onchange=e=>{mapCtl.category=e.target.value;rebuild();};$('#mapMinLevel').oninput=e=>{mapCtl.minLevel=+e.target.value;updateMapOutputs();rebuild();};
  $('#mapNodeSize').oninput=e=>{mapCtl.nodeSize=+e.target.value;updateMapOutputs();applyMapStyles();};$('#mapSpread').oninput=e=>{mapCtl.spread=+e.target.value;updateMapOutputs();updateMapFrame(performance.now());};
  $('#mapColorMode').onchange=e=>{mapCtl.colorMode=e.target.value;applyMapStyles();};$('#mapLabels').onchange=e=>{mapCtl.labels=e.target.value;applyMapStyles();};
  $('#mapEdges').onchange=e=>{mapCtl.edges=e.target.checked;applyMapStyles();updateMapStats();};$('#mapMotion').onchange=e=>{mapCtl.motion=e.target.checked;updateMapFrame(performance.now());};
  const zoom=d=>{mapCtl.zoom=clamp(mapCtl.zoom+d,.4,2.5);applyMapTransform();};$('#mapZoomInBtn').onclick=()=>zoom(.15);$('#mapZoomOutBtn').onclick=()=>zoom(-.15);
  $('#mapResetBtn').onclick=()=>{mapCtl={category:'all',minLevel:1,nodeSize:100,spread:100,colorMode:'level',labels:'smart',edges:true,motion:!reducedMotion,zoom:1,panX:0,panY:0,seed:42};syncMapControls();fillCategorySelects();rebuild();toast('Карта сброшена к исходному виду.');};
  $('#mapShuffleBtn').onclick=()=>{mapCtl.seed=Math.floor(Math.random()*1e6);rebuild();toast('Узлы перемешаны. Знания и связи сохранены.');};$('#mapExportBtn').onclick=exportMap;
  const svg=$('#neuralSvg');
  svg.addEventListener('pointerdown',ev=>{if(ev.target.closest('.node'))return;const p=mapPoint(ev);mapDrag={type:'pan',startX:p.rawX,startY:p.rawY,origX:mapCtl.panX,origY:mapCtl.panY,moved:false,pointerId:ev.pointerId};svg.setPointerCapture(ev.pointerId);svg.classList.add('panning');hideMapTooltip();});
  svg.addEventListener('pointermove',ev=>{if(!mapDrag||ev.pointerId!==mapDrag.pointerId)return;const p=mapPoint(ev);if(mapDrag.type==='node'){const dx=p.x-mapDrag.startX,dy=p.y-mapDrag.startY;if(Math.hypot(dx,dy)>3)mapDrag.moved=true;const s=mapCtl.spread/100;mapDrag.node.bx=clamp(500+(mapDrag.origX+dx-500)/s,30,970);mapDrag.node.by=clamp(320+(mapDrag.origY+dy-320)/s,30,610);updateMapFrame(performance.now());}else{const dx=p.rawX-mapDrag.startX,dy=p.rawY-mapDrag.startY;if(Math.hypot(dx,dy)>3)mapDrag.moved=true;mapCtl.panX=mapDrag.origX+dx;mapCtl.panY=mapDrag.origY+dy;applyMapTransform();}});
  const endDrag=ev=>{if(!mapDrag||ev.pointerId!==mapDrag.pointerId)return;const d=mapDrag;mapDrag=null;svg.classList.remove('panning');if(svg.hasPointerCapture(ev.pointerId))svg.releasePointerCapture(ev.pointerId);if(d.type==='node'&&!d.moved&&ev.type==='pointerup')openDrawer(d.node.id);};
  svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);
  svg.addEventListener('wheel',ev=>{ev.preventDefault();const before=mapPoint(ev);mapCtl.zoom=clamp(mapCtl.zoom*(ev.deltaY<0?1.08:.925),.4,2.5);const z=mapCtl.zoom;mapCtl.panX=before.rawX-before.x*z-500*(1-z);mapCtl.panY=before.rawY-before.y*z-320*(1-z);applyMapTransform();},{passive:false});
}
