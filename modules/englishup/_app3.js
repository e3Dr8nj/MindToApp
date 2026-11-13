/* ---------- Import: AI prompt, JSON / CSV / plain text, validation & preview ---------- */
const AI_PROMPT = `Ты — преподаватель английского и составитель учебных словарей. Подготовь список английских слов для русскоязычного ученика.

ТЕМА: [впиши тему, например «Путешествия», «IT», «Медицина»]
КОЛИЧЕСТВО СЛОВ: [например, 30]
УРОВЕНЬ УЧЕНИКА: [A1 / A2 / B1 / B2 / C1]

Верни ТОЛЬКО валидный JSON в кодировке UTF-8. Без Markdown, без пояснений, без комментариев и без запятых после последнего элемента. Структура должна быть совместима с EnglishUp Import v1:

{
  "schemaVersion": 1,
  "categories": ["Путешествия"],
  "words": [
    {
      "word": "boarding pass",
      "translation": "посадочный талон",
      "category": "Путешествия",
      "ipa": "/ˈbɔː.dɪŋ ˌpɑːs/",
      "examples": [
        {"en": "Please show your boarding pass at the gate.", "ru": "Пожалуйста, покажите посадочный талон у выхода на посадку."},
        {"en": "I saved my boarding pass on my phone.", "ru": "Я сохранил посадочный талон в телефоне."}
      ],
      "level": 1
    }
  ]
}

Правила:
1. Каждый элемент words — одно слово или устойчивое выражение на английском. Не повторяй word в разных регистрах.
2. translation — короткий точный перевод на русский.
3. category — одна категория на русском. Разбей список по смыслу, если тема широкая. Все использованные категории перечисли в categories.
4. examples — ровно 2 естественных примера использования слова в контексте. Каждый пример: объект с непустыми строками en и ru. Слово должно встречаться в en (допустима грамматическая форма).
5. ipa — британская или американская транскрипция в slashes. Если не уверен, используй пустую строку, не выдумывай.
6. level — целое число от 1 до 10: степень знания для нового списка. Если я не указал оценки, ставь 1. Не используй строки, дроби и значения вне диапазона.
7. Экранируй кавычки и переносы строк по правилам JSON. Используй только двойные кавычки.
8. Не добавляй другие поля. Не оборачивай JSON в код или текст. Количество элементов words должно точно соответствовать запрошенному.

Перед ответом проверь: JSON парсится, все обязательные поля заполнены, категории совпадают, примеры содержат en и ru, level — целое 1–10.`;
const SAMPLE_IMPORT={schemaVersion:1,categories:['Саморазвитие'],words:[{word:'curious',translation:'любопытный',category:'Саморазвитие',ipa:'/ˈkjʊə.ri.əs/',examples:[{en:"I'm curious about how memory works.",ru:'Мне любопытно, как работает память.'},{en:'Curious people ask a lot of questions.',ru:'Любопытные люди задают много вопросов.'}],level:1},{word:'habit',translation:'привычка',category:'Саморазвитие',ipa:'/ˈhæb.ɪt/',examples:[{en:'Reading every evening is a good habit.',ru:'Читать каждый вечер — хорошая привычка.'},{en:'It takes time to build a new habit.',ru:'Чтобы выработать новую привычку, нужно время.'}],level:2}]};
function currentPromptText(){const topic=($('#promptTopic')?.value.trim()||'Повседневный английский');const count=clamp(Math.round(+($('#promptCount')?.value)||20),1,200);const level=$('#promptLevel')?.value||'A2';return AI_PROMPT.replace('[впиши тему, например «Путешествия», «IT», «Медицина»]',topic).replace('[например, 30]',String(count)).replace('[A1 / A2 / B1 / B2 / C1]',level);}
function renderPrompt(){$('#aiPrompt').value=currentPromptText();}
async function copyPrompt(){const text=currentPromptText();try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);}else{const ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;left:-9999px;top:0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();if(!ok)throw new Error('copy');}toast('Промпт скопирован. Вставь его в ИИ и укажи свою тему.');$('#copyPromptBtn').innerHTML=icon('check','sm')+'Скопировано';setTimeout(()=>$('#copyPromptBtn').innerHTML=icon('copy','sm')+'Скопировать промпт',2200);}catch(e){const ta=$('#aiPrompt');ta.focus();ta.select();toast('Выделил промпт. Нажми Ctrl+C или Cmd+C, чтобы скопировать.');}}
function parseCSV(text){const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const ch=text[i];if(quoted){if(ch==='"'){if(text[i+1]==='"'){field+='"';i++;}else quoted=false;}else field+=ch;}else{if(ch==='"')quoted=true;else if(ch===','){row.push(field);field='';}else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(field);field='';if(row.some(x=>x.trim()))rows.push(row);row=[];}else field+=ch;}}if(quoted)throw new Error('В CSV не закрыта двойная кавычка.');row.push(field);if(row.some(x=>x.trim()))rows.push(row);if(rows.length<2)throw new Error('CSV должен содержать заголовок и хотя бы одну строку.');const head=rows.shift().map(h=>h.trim().toLowerCase().replace(/^\ufeff/,''));return rows.map((r,i)=>{const o={_line:i+2};head.forEach((h,j)=>o[h]=r[j]??'');return o;});}
function normalizeImportRow(raw,index){
  const line=raw._line||index+1;if(!raw||typeof raw!=='object')throw new Error(`строка ${line}: ожидался объект слова`);
  const word=String(raw.word??raw.english??raw.en??'').trim().replace(/\s+/g,' ');const translation=String(raw.translation??raw.russian??raw.ru??'').trim();
  if(!word)throw new Error(`строка ${line}: нет слова (word)`);if(!translation)throw new Error(`строка ${line}: нет перевода (translation)`);if(word.length>120)throw new Error(`строка ${line}: слово длиннее 120 символов`);if(translation.length>300)throw new Error(`строка ${line}: перевод длиннее 300 символов`);
  const category=String(raw.category??raw['категория']??'Без категории').trim()||'Без категории';if(category.length>60)throw new Error(`строка ${line}: название категории длиннее 60 символов`);
  let level=1,hasLevel=raw.level!==undefined&&raw.level!==null&&raw.level!=='';if(hasLevel){const n=Number(raw.level);if(!Number.isInteger(n)||n<1||n>10)throw new Error(`строка ${line}: level должен быть целым числом от 1 до 10`);level=n;}
  let examples=[];const ex=raw.examples??raw.example??[];if(Array.isArray(ex))examples=ex.map(e=>typeof e==='string'?{en:e.trim(),ru:''}:{en:String(e?.en??'').trim(),ru:String(e?.ru??'').trim()}).filter(e=>e.en);else if(typeof ex==='string'&&ex.trim())examples=[{en:ex.trim(),ru:''}];
  if(raw.example_en||raw.example1_en){examples=[{en:String(raw.example_en||raw.example1_en).trim(),ru:String(raw.example_ru||raw.example1_ru||'').trim()}];if(raw.example2_en)examples.push({en:String(raw.example2_en).trim(),ru:String(raw.example2_ru||'').trim()});}
  examples=examples.slice(0,6).map(e=>({en:e.en.slice(0,500),ru:e.ru.slice(0,500)}));
  const ipa=String(raw.ipa??raw.transcription??'').trim().slice(0,120);
  return {word,translation,category,ipa,examples,level,hasLevel,line};
}
function parseImport(text){
  text=text.replace(/^\ufeff/,'').trim();if(!text)return {rows:[],errors:[],format:''};
  text=text.replace(/^```(?:json|csv|text)?\s*\n?/i,'').replace(/\n?```\s*$/,'').trim();
  let raws=[],format='Текст';
  if(text.startsWith('{')||text.startsWith('[')){format='JSON';let data;try{data=JSON.parse(text);}catch(e){throw new Error('JSON не читается: '+e.message.slice(0,140)+'. Проверь кавычки и запятые.');}if(Array.isArray(data))raws=data;else if(data&&Array.isArray(data.words))raws=data.words;else throw new Error('В JSON нужен массив words: [{"word":"…","translation":"…"}].');if(data.schemaVersion!==undefined&&Number(data.schemaVersion)!==1&&Number(data.schemaVersion)!==2)throw new Error('Поддерживается schemaVersion 1 (Import v1).');}
  else if(/^\s*"?word"?\s*,/i.test(text)||/^\s*"?english"?\s*,/i.test(text)){format='CSV';raws=parseCSV(text);}
  else {format='Текст';raws=text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('#')).map((l,i)=>{const parts=l.split(/\s+[—–]\s+|\t+|\s*\|\s*|\s*;\s*/).map(s=>s.trim());if(parts.length<2)throw new Error(`строка ${i+1}: используй «слово — перевод — категория»`);return {word:parts[0],translation:parts[1],category:parts[2]||'Без категории',level:parts[3]||1,_line:i+1};});}
  if(raws.length>2000)throw new Error('За один раз можно импортировать до 2 000 слов. Раздели список на части.');
  const rows=[],errors=[],seen=new Set();raws.forEach((raw,i)=>{try{const row=normalizeImportRow(raw,i);const k=norm(row.word);if(seen.has(k))throw new Error(`строка ${row.line}: «${row.word}» повторяется внутри списка`);seen.add(k);const existing=state.words.find(w=>norm(w.word)===k);row.existingId=existing?.id||null;row.status=existing?($('#importUpdate').checked?'update':'duplicate'):'new';rows.push(row);}catch(e){errors.push(e.message);}});
  return {rows,errors,format};
}
function validateImport(){const text=$('#importText').value;try{importPlan=parseImport(text);}catch(e){importPlan={rows:[],errors:[e.message],format:''};}renderImportPreview();}
function renderImportPreview(){
  const box=$('#importValidation'),preview=$('#importPreview'),btn=$('#importBtn');if(!importPlan||!$('#importText').value.trim()){box.className='validation';preview.className='preview-table';btn.disabled=true;$('#importBtnText').textContent='Добавить слова';return;}
  const {rows,errors,format}=importPlan,add=rows.filter(r=>r.status==='new').length,upd=rows.filter(r=>r.status==='update').length,dup=rows.filter(r=>r.status==='duplicate').length,cats=new Set(rows.map(r=>norm(r.category))).size;
  box.className='validation show '+(errors.length?'warn':rows.length?'ok':'err');
  box.innerHTML=`<b>${esc(format||'Проверка')}</b> · ${add} новых · ${upd} к обновлению · ${dup} дубликатов · ${cats} категорий${errors.length?`<ul>${errors.slice(0,6).map(e=>`<li>${esc(e)}</li>`).join('')}${errors.length>6?`<li>…и ещё ${errors.length-6} ошибок</li>`:''}</ul>`:''}${dup?'<div style="margin-top:6px;font-size:11px">Дубликаты пропущены — их оценки и прогресс сохранены.</div>':''}${upd?'<div style="margin-top:6px;font-size:11px">Обновление меняет перевод, примеры и категорию. Оценка меняется только если level явно указан.</div>':''}`;
  if(rows.length){preview.className='preview-table show';preview.innerHTML=`<table><thead><tr><th>Слово</th><th>Перевод</th><th>Категория</th><th>1–10</th><th>Статус</th></tr></thead><tbody>${rows.slice(0,100).map(r=>`<tr><td><b>${esc(r.word)}</b></td><td>${esc(r.translation)}</td><td>${esc(r.category)}</td><td>${r.level}</td><td><span class="status-chip ${r.status==='new'?'new':r.status==='update'?'upd':'dup'}">${r.status==='new'?'Новое':r.status==='update'?'Обновить':'Пропуск'}</span></td></tr>`).join('')}</tbody></table>${rows.length>100?`<div class="hint" style="padding:10px">Показаны первые 100 из ${rows.length} строк.</div>`:''}`;}else preview.className='preview-table';
  btn.disabled=!add&&!upd;$('#importBtnText').textContent=add||upd?`Добавить ${add} · обновить ${upd}`:'Нечего импортировать';
}
function commitImport(){
  if(!importPlan)return;const rows=importPlan.rows.filter(r=>r.status!=='duplicate');if(!rows.length)return;
  const added=[],updated=[];const now=Date.now();
  rows.forEach(r=>{let cat=state.categories.find(c=>norm(c.name)===norm(r.category));if(!cat){cat={id:uid(),name:r.category,color:PALETTE[state.categories.length%PALETTE.length]};state.categories.push(cat);}
    if(r.existingId){const w=getWord(r.existingId);if(!w)return;updated.push({id:w.id,before:{translation:w.translation,category:w.category,ipa:w.ipa,examples:w.examples.map(e=>({...e})),level:w.level,nextReview:w.nextReview,updatedAt:w.updatedAt}});w.translation=r.translation;w.category=cat.id;w.ipa=r.ipa;w.examples=r.examples;w.updatedAt=now;if(r.hasLevel&&r.level!==w.level){w.level=r.level;w.nextReview=now+intervalMs(r.level);}}
    else{const w={id:uid(),word:r.word,translation:r.translation,category:cat.id,ipa:r.ipa,examples:r.examples,level:r.level,createdAt:now,updatedAt:now,nextReview:now+intervalMs(r.level),lastReview:null,reviewCount:0};state.words.push(w);added.push(w.id);}
  });
  const emptyCats=state.categories.filter(c=>!state.words.some(w=>w.category===c.id)&&rows.some(r=>norm(r.category)===norm(c.name))).map(c=>c.id);
  refreshAll();$('#importText').value='';importPlan=null;renderImportPreview();
  toast(`Импорт завершён: +${added.length} слов, обновлено ${updated.length}.`,()=>{state.words=state.words.filter(w=>!added.includes(w.id));updated.forEach(u=>{const w=getWord(u.id);if(w)Object.assign(w,u.before);});state.categories=state.categories.filter(c=>!emptyCats.includes(c.id)||state.words.some(w=>w.category===c.id));refreshAll();toast('Импорт отменён.');});
  if(added.length){const box=$('#importValidation');box.className='validation show ok';box.innerHTML=`<b>Готово!</b> ${added.length} новых слов в словаре. <button class="btn btn-ghost btn-xs" id="importToWords" style="color:inherit;text-decoration:underline">Открыть словарь</button>`;$('#importToWords').onclick=()=>{dictFilters={search:'',category:'all',level:'all',sort:'recent'};dictPage=1;showView('words');};}
}
function handleFile(file){if(!file)return;if(file.size>2*1024*1024){toast('Файл больше 2 МБ. Раздели список на части.');return;}const reader=new FileReader();reader.onload=()=>{$('#importText').value=String(reader.result);validateImport();toast(`Файл «${file.name}» загружен. Проверь предпросмотр.`);};reader.onerror=()=>toast('Не удалось прочитать файл.');reader.readAsText(file,'UTF-8');}
function bindImport(){
  renderPrompt();['promptTopic','promptCount','promptLevel'].forEach(id=>$('#'+id).addEventListener('input',renderPrompt));$('#copyPromptBtn').onclick=copyPrompt;$('#downloadPromptBtn').onclick=()=>{download('englishup-ai-prompt.txt',currentPromptText(),'text/plain;charset=utf-8');toast('Промпт сохранён в .txt.');};
  $('#sampleBtn').onclick=()=>{$('#importText').value=JSON.stringify(SAMPLE_IMPORT,null,2);validateImport();};$('#clearImportBtn').onclick=()=>{$('#importText').value='';importPlan=null;renderImportPreview();};
  let timer;$('#importText').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(validateImport,220);});$('#importUpdate').onchange=validateImport;$('#importBtn').onclick=commitImport;
  const dz=$('#dropzone');dz.onclick=()=>$('#fileInput').click();dz.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#fileInput').click();}};$('#fileInput').onchange=e=>{handleFile(e.target.files[0]);e.target.value='';};
  ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag');}));['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag');if(ev==='drop')handleFile(e.dataTransfer.files[0]);}));
  $$('[data-import-tab]').forEach(b=>b.onclick=()=>{importTab=b.dataset.importTab;$$('[data-import-tab]').forEach(x=>x.classList.toggle('active',x===b));$('#importListPane').style.display=importTab==='list'?'':'none';$('#importManualPane').classList.toggle('show',importTab==='manual');if(importTab==='manual')bindManualForm();});
  bindManualForm();
}

/* ---------- Reference ---------- */
function renderReference(){
  const q=norm($('#refSearch').value);$$('[data-ref-tab]').forEach(b=>b.classList.toggle('active',b.dataset.refTab===refTab));
  if(refTab==='verbs'){const vs=VERBS.filter(v=>!q||v.some(x=>norm(x).includes(q)));$('#refContent').innerHTML=`<div class="card table-card"><div class="table-scroll"><table><thead><tr><th>V1 · Infinitive</th><th>V2 · Past Simple</th><th>V3 · Participle</th><th>Перевод</th><th></th></tr></thead><tbody>${vs.map(v=>`<tr><td><b style="color:var(--blue)">${esc(v[0])}</b></td><td>${esc(v[1])}</td><td>${esc(v[2])}</td><td style="color:var(--muted)">${esc(v[3])}</td><td><button class="icon-btn" data-speak="${esc(v[0])}, ${esc(v[1])}, ${esc(v[2])}" aria-label="Озвучить ${esc(v[0])}">${icon('sound','sm')}</button></td></tr>`).join('')||'<tr><td colspan="5"><div class="empty"><p>Ничего не найдено. Попробуй другой запрос.</p></div></td></tr>'}</tbody></table></div><div class="table-foot"><span>${vs.length} из ${VERBS.length} глаголов</span><span class="hint">${icon('sound','sm')}Нажми на динамик, чтобы услышать формы</span></div></div>`;}
  else{const gs=GRAMMAR.filter(g=>!q||norm(g.join(' ')).includes(q));$('#refContent').innerHTML=gs.map(([title,level,body],i)=>`<div class="gram-item"><button class="gram-head" aria-expanded="false"><span>${esc(title)}<span class="tag">${level}</span></span><span class="chev">${icon('chev','sm')}</span></button><div class="gram-body">${body}</div></div>`).join('')||'<div class="empty"><h3>Ничего не найдено</h3><p>Попробуй «артикли», «прошедшее» или «условные».</p></div>';$$('.gram-head').forEach(b=>b.onclick=()=>{const open=b.parentElement.classList.toggle('open');b.setAttribute('aria-expanded',String(open));});}
}

/* ---------- Global events & initialization ---------- */
function bindGlobal(){
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-nav]');if(nav){e.preventDefault();showView(nav.dataset.nav);return;}
    const open=e.target.closest('[data-word-open]');if(open){openDrawer(open.dataset.wordOpen);return;}
    const sp=e.target.closest('[data-speak]');if(sp){e.stopPropagation();speak(sp.dataset.speak);return;}
    const ed=e.target.closest('[data-edit]');if(ed){openWordModal(ed.dataset.edit);return;}
    const del=e.target.closest('[data-delete]');if(del){const w=getWord(del.dataset.delete);confirmAction('Удалить слово?',`«${w.word}» будет удалено. Действие можно отменить в уведомлении.`,'Удалить',()=>deleteWords([w.id]));return;}
    const cat=e.target.closest('[data-cat-open]');if(cat){dictFilters.category=cat.dataset.catOpen;dictFilters.search='';dictPage=1;showView('words');return;}
    const pg=e.target.closest('[data-page]');if(pg&&!pg.disabled){dictPage=+pg.dataset.page;renderWords();return;}
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){if($('#modalOverlay').classList.contains('show'))closeModal();else if($('#drawer').classList.contains('show'))closeDrawer();else closeSidebar();return;}
    const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)||document.activeElement?.isContentEditable;
    if(e.key==='/'&&!typing&&!$('#modalOverlay').classList.contains('show')&&!$('#drawer').classList.contains('show')){e.preventDefault();$('#globalSearch').focus();return;}
    if(currentView==='exam'&&!typing&&!$('#modalOverlay').classList.contains('show')&&!$('#drawer').classList.contains('show')){const ex=state.exam;if(ex&&!ex.finished){if(e.code==='Space'&&!ex.revealed&&document.activeElement?.id!=='revealArea'){e.preventDefault();revealExam();}else if(/^[0-9]$/.test(e.key)&&ex.revealed&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();rateExam(e.key==='0'?10:+e.key);}}}
    if(e.key==='Tab'){const container=$('#modalOverlay').classList.contains('show')?$('#modal'):$('#drawer').classList.contains('show')?$('#drawer'):null;if(container){const focusables=$$('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',container).filter(el=>el.offsetParent!==null);if(!focusables.length)return;const first=focusables[0],last=focusables[focusables.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}
    if((e.key==='Enter'||e.key===' ')&&document.activeElement?.dataset?.catOpen){e.preventDefault();dictFilters.category=document.activeElement.dataset.catOpen;dictPage=1;showView('words');}
    if((e.key==='Enter'||e.key===' ')&&document.activeElement?.id==='heroMap'){e.preventDefault();showView('map');}
  });
  $('#menuBtn').onclick=()=>{$('#sidebar').classList.add('open');$('#sidebarScrim').classList.add('show');};$('#sidebarScrim').onclick=closeSidebar;
  $('#soundToggle').onclick=()=>{state.settings.sound=!state.settings.sound;if(!state.settings.sound&&'speechSynthesis' in window)speechSynthesis.cancel();save();updateSound();toast(state.settings.sound?'Озвучка включена.':'Озвучка выключена.');};
  $('#globalSearch').addEventListener('input',e=>{dictFilters.search=e.target.value;dictPage=1;if(currentView!=='words')showView('words');else renderWords();});$('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();showView('words');$('#dictSearch').focus();}});
  $('#dictSearch').addEventListener('input',e=>{dictFilters.search=e.target.value;dictPage=1;renderWords();});$('#dictCategory').onchange=e=>{dictFilters.category=e.target.value;dictPage=1;renderWords();};$('#dictLevel').onchange=e=>{dictFilters.level=e.target.value;dictPage=1;renderWords();};$('#dictSort').onchange=e=>{dictFilters.sort=e.target.value;dictPage=1;renderWords();};
  $('#savedViewSelect').onchange=e=>{const v=state.savedViews.find(x=>x.id===e.target.value);if(v){dictFilters={...v.filters};dictPage=1;renderWords();toast(`Представление «${v.name}» применено.`);}};$('#saveViewBtn').onclick=openSavedViews;
  $('#selectAll').onchange=e=>{const ws=filteredWords().slice((dictPage-1)*pageSize,dictPage*pageSize);ws.forEach(w=>e.target.checked?selectedIds.add(w.id):selectedIds.delete(w.id));renderWords();};
  $('#wordTableBody').addEventListener('change',e=>{if(e.target.classList.contains('row-check')){e.target.checked?selectedIds.add(e.target.dataset.id):selectedIds.delete(e.target.dataset.id);renderWords();}});
  $('#bulkClear').onclick=()=>{selectedIds.clear();renderWords();};$('#bulkDelete').onclick=()=>confirmAction('Удалить выбранные слова?',`Будет удалено ${selectedIds.size} слов. Прогресс этих слов тоже удалится. Можно отменить сразу после действия.`,'Удалить',()=>deleteWords([...selectedIds]));
  $('#bulkCategory').onchange=e=>{const id=e.target.value;if(!id)return;const before=[...selectedIds].map(wid=>({id:wid,cat:getWord(wid)?.category}));state.words.forEach(w=>{if(selectedIds.has(w.id))w.category=id;});refreshAll();e.target.value='';toast(`Перемещено в «${getCat(id).name}»: ${before.length}.`,()=>{before.forEach(b=>{const w=getWord(b.id);if(w)w.category=b.cat;});refreshAll();});};
  const exportSelected=(ids=null)=>{const ws=ids?state.words.filter(w=>ids.includes(w.id)):filteredWords();if(!ws.length){toast('Нет слов для экспорта.');return;}const cats=state.categories.filter(c=>ws.some(w=>w.category===c.id));const data={schemaVersion:1,exportedAt:new Date().toISOString(),categories:cats.map(c=>c.name),words:ws.map(w=>({word:w.word,translation:w.translation,category:getCat(w.category).name,ipa:w.ipa,examples:w.examples,level:w.level}))};download('englishup-words.json',JSON.stringify(data,null,2));toast(`Экспортировано слов: ${ws.length}.`);};
  $('#exportWordsBtn').onclick=()=>exportSelected();$('#bulkExport').onclick=()=>exportSelected([...selectedIds]);
  $('#addWordBtn').onclick=()=>openWordModal();$('#manageCatsBtn').onclick=openCategoryManager;
  $('#heroStart').onclick=()=>{if(state.exam&&!state.exam.finished)showView('exam');else startExam(dueWords().length?'due':'all','all',10);};$('#heroMap').onclick=()=>showView('map');
  const beginFromControls=()=>{const run=()=>startExam($('#examSource').value,$('#examCategory').value,$('#examLength').value);if(state.exam&&!state.exam.finished&&state.exam.results.length)confirmAction('Начать новую сессию?','Оценки текущей сессии сохранены, но она не будет засчитана как завершённая.','Начать новую',run);else run();};
  $('#examStartBtn').onclick=beginFromControls;$('#examRestart').onclick=beginFromControls;
  $('#drawerClose').onclick=closeDrawer;$('#drawerOverlay').onclick=closeDrawer;$('#modalClose').onclick=closeModal;$('#modalOverlay').onclick=e=>{if(e.target===$('#modalOverlay'))closeModal();};
  $$('[data-ref-tab]').forEach(b=>b.onclick=()=>{refTab=b.dataset.refTab;$('#refSearch').value='';renderReference();});$('#refSearch').addEventListener('input',renderReference);
  bindMapControls();bindImport();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMap();else if(currentView==='map')startMap();});
  window.addEventListener('beforeunload',()=>{save();stopMap();});
}
function init(){
  fillCategorySelects();bindGlobal();renderHome();renderWords();renderSessionStats();renderReference();updateNavCounts();updateSound();save();
  if(state.exam&&!state.exam.finished&&!state.exam.queue.length)state.exam=null;
  showView('home');
}
init();
