
"use strict";
/* EnglishUp — self-contained application. No network, accounts or dependencies. */
const INTERVALS = [5,30,120,480,1440,2880,5760,10080,20160,43200];
const INTERVAL_LABELS = ['5 минут','30 минут','2 часа','8 часов','1 день','2 дня','4 дня','7 дней','14 дней','30 дней'];
const PALETTE = ['#2459EB','#17845B','#E5A62B','#E56B55','#8B7CF6','#2399B5','#D45D91','#65748B'];
const LEVEL_COLORS = ['#FF7A66','#FF7A66','#FF9A66','#FFC857','#FFC857','#E8C447','#58C99B','#39B98A','#2459EB','#2459EB'];
const CATEGORY_SEED = [
  {id:'food',name:'Еда и кухня',color:'#E5A62B',icon:'🍎'},
  {id:'travel',name:'Путешествия',color:'#2459EB',icon:'✈️'},
  {id:'work',name:'Работа',color:'#8B7CF6',icon:'💼'},
  {id:'home',name:'Дом и семья',color:'#E56B55',icon:'🏠'},
  {id:'feelings',name:'Чувства',color:'#D45D91',icon:'💛'},
  {id:'nature',name:'Природа',color:'#17845B',icon:'🌿'}
];
/* word, translation, IPA, two contextual example pairs, initial self-assessment */
const SEED_WORDS = {
food:[
 ['apple','яблоко','/ˈæp.əl/',"An apple a day keeps the doctor away.","Яблоко в день — и доктор не нужен.","She sliced an apple for the salad.","Она нарезала яблоко для салата.",8],
 ['bread','хлеб','/bred/',"I bought fresh bread this morning.","Сегодня утром я купил свежий хлеб.","Could you pass me the bread?","Не мог бы ты передать мне хлеб?",7],
 ['cheese','сыр','/tʃiːz/',"Would you like some cheese?","Хотите немного сыра?","This pasta needs more cheese.","В эту пасту нужно добавить ещё сыра.",6],
 ['chicken','курица','/ˈtʃɪk.ɪn/',"We had chicken for dinner.","На ужин у нас была курица.","The chicken is cooked perfectly.","Курица приготовлена идеально.",9],
 ['sugar','сахар','/ˈʃʊɡ.ər/',"No sugar in my tea, please.","Без сахара в моём чае, пожалуйста.","Add a little sugar to the sauce.","Добавь немного сахара в соус.",5],
 ['vegetable','овощ','/ˈvedʒ.tə.bəl/',"Eat more vegetables.","Ешьте больше овощей.","Which vegetable do you like most?","Какой овощ тебе нравится больше всего?",4],
 ['breakfast','завтрак','/ˈbrek.fəst/',"Breakfast is ready!","Завтрак готов!","I usually have breakfast at eight.","Обычно я завтракаю в восемь.",10],
 ['delicious','вкусный','/dɪˈlɪʃ.əs/',"This cake is delicious!","Этот торт очень вкусный!","Thank you for a delicious meal.","Спасибо за вкусный ужин.",7],
 ['recipe','рецепт','/ˈres.ə.pi/',"She shared her secret recipe.","Она поделилась своим секретным рецептом.","Follow the recipe step by step.","Следуй рецепту шаг за шагом.",3],
 ['hungry','голодный','/ˈhʌŋ.ɡri/',"I'm so hungry right now.","Я сейчас очень голоден.","Are you hungry after the walk?","Ты проголодался после прогулки?",6]
],
travel:[
 ['airport','аэропорт','/ˈeə.pɔːt/',"The airport is far from the city.","Аэропорт далеко от города.","Let's meet at the airport entrance.","Давай встретимся у входа в аэропорт.",9],
 ['flight','рейс, полёт','/flaɪt/',"Our flight was delayed.","Наш рейс задержали.","What time is your flight?","Во сколько твой рейс?",7],
 ['ticket','билет','/ˈtɪk.ɪt/',"I booked a ticket online.","Я забронировал билет онлайн.","Keep your ticket until the end of the trip.","Сохраняй билет до конца поездки.",8],
 ['luggage','багаж','/ˈlʌɡ.ɪdʒ/',"Don't forget your luggage.","Не забудь свой багаж.","My luggage is too heavy.","Мой багаж слишком тяжёлый.",4],
 ['hotel','отель','/həʊˈtel/',"The hotel has a beautiful view.","Из отеля открывается прекрасный вид.","We stayed at a small hotel.","Мы остановились в небольшом отеле.",10],
 ['abroad','за границей','/əˈbrɔːd/',"She often travels abroad.","Она часто ездит за границу.","Have you ever lived abroad?","Ты когда-нибудь жил за границей?",3],
 ['journey','путешествие','/ˈdʒɜː.ni/',"It was a long journey.","Это было долгое путешествие.","The journey taught me a lot.","Путешествие многому меня научило.",5],
 ['departure','отправление','/dɪˈpɑː.tʃər/',"Check the departure time.","Проверь время отправления.","Our departure is delayed by an hour.","Наше отправление задерживается на час.",2],
 ['souvenir','сувенир','/ˌsuː.vənˈɪər/',"I bought a souvenir for my mom.","Я купил сувенир для мамы.","This souvenir reminds me of Paris.","Этот сувенир напоминает мне о Париже.",6],
 ['adventure','приключение','/ədˈven.tʃər/',"Traveling is a great adventure.","Путешествие — большое приключение.","Are you ready for your next adventure?","Ты готов к своему следующему приключению?",4]
],
work:[
 ['meeting','встреча, совещание','/ˈmiː.tɪŋ/',"The meeting starts at ten.","Совещание начинается в десять.","Let's discuss it after the meeting.","Давай обсудим это после совещания.",8],
 ['deadline','крайний срок','/ˈded.laɪn/',"We missed the deadline.","Мы не уложились в крайний срок.","The deadline is next Friday.","Крайний срок — следующая пятница.",5],
 ['salary','зарплата','/ˈsæl.ər.i/',"Her salary increased last year.","В прошлом году её зарплата выросла.","They discussed the salary during the interview.","Они обсудили зарплату на собеседовании.",6],
 ['colleague','коллега','/ˈkɒl.iːɡ/',"My colleague helped me a lot.","Мой коллега очень мне помог.","She is a new colleague of mine.","Она моя новая коллега.",7],
 ['interview','собеседование','/ˈɪn.tə.vjuː/',"He passed the interview successfully.","Он успешно прошёл собеседование.","I have an interview tomorrow.","Завтра у меня собеседование.",3],
 ['boss','начальник','/bɒs/',"My boss is very supportive.","Мой начальник очень поддерживает меня.","Ask your boss for a day off.","Попроси у начальника выходной.",9],
 ['employee','сотрудник','/ɪmˈplɔɪ.iː/',"The company hired a new employee.","Компания наняла нового сотрудника.","Every employee gets a laptop.","Каждый сотрудник получает ноутбук.",4],
 ['office','офис','/ˈɒf.ɪs/',"Our office is downtown.","Наш офис находится в центре города.","I work from the office on Mondays.","По понедельникам я работаю из офиса.",10],
 ['career','карьера','/kəˈrɪər/',"She built a great career.","Она построила отличную карьеру.","What matters most in your career?","Что важнее всего в твоей карьере?",6],
 ['skill','навык','/skɪl/',"Communication is a key skill.","Общение — ключевой навык.","You can learn this skill with practice.","Этот навык можно освоить практикой.",7]
],
home:[
 ['kitchen','кухня','/ˈkɪtʃ.ɪn/',"Mom is cooking in the kitchen.","Мама готовит на кухне.","The kitchen is my favourite room.","Кухня — моя любимая комната.",10],
 ['bedroom','спальня','/ˈbed.ruːm/',"My bedroom is upstairs.","Моя спальня наверху.","Let's paint the bedroom blue.","Давай покрасим спальню в синий.",8],
 ['furniture','мебель','/ˈfɜː.nɪ.tʃər/',"We bought new furniture.","Мы купили новую мебель.","The furniture fits the room well.","Мебель хорошо подходит комнате.",4],
 ['neighbour','сосед','/ˈneɪ.bər/',"Our neighbour is very friendly.","Наш сосед очень дружелюбный.","A new neighbour moved in yesterday.","Вчера въехал новый сосед.",5],
 ['parents','родители','/ˈpeə.rənts/',"My parents live in another city.","Мои родители живут в другом городе.","I call my parents every weekend.","Я звоню родителям каждые выходные.",9],
 ['daughter','дочь','/ˈdɔ.tər/',"Their daughter is five years old.","Их дочери пять лет.","She picked up her daughter from school.","Она забрала дочь из школы.",7],
 ['relative','родственник','/ˈrel.ə.tɪv/',"Many relatives came to the wedding.","На свадьбу пришло много родственников.","He is a distant relative of mine.","Он мой дальний родственник.",2],
 ['cozy','уютный','/ˈkəʊ.zi/',"What a cozy little house!","Какой уютный маленький дом!","The room feels warm and cozy.","Комната кажется тёплой и уютной.",6],
 ['garden','сад','/ˈɡɑː.dən/',"Grandma works in the garden.","Бабушка работает в саду.","We had tea in the garden.","Мы пили чай в саду.",8],
 ['apartment','квартира','/əˈpɑːt.mənt/',"They rent an apartment.","Они снимают квартиру.","The apartment has two balconies.","В квартире два балкона.",5]
],
feelings:[
 ['happy','счастливый','/ˈhæp.i/',"I'm happy to see you!","Я счастлив тебя видеть!","She looks happy today.","Сегодня она выглядит счастливой.",10],
 ['sad','грустный','/sæd/',"Don't be sad.","Не грусти.","The film made me feel sad.","Фильм меня опечалил.",9],
 ['angry','злой, сердитый','/ˈæŋ.ɡri/',"He was angry about the mistake.","Он сердился из-за ошибки.","Try not to get angry.","Постарайся не злиться.",7],
 ['excited','радостно взволнованный','/ɪkˈsaɪ.tɪd/',"She's excited about the trip.","Она в радостном предвкушении поездки.","I'm excited to start my new job.","Я радостно жду начала новой работы.",5],
 ['tired','уставший','/taɪəd/',"I'm too tired to go out.","Я слишком устал, чтобы куда-то идти.","You look tired after work.","Ты выглядишь уставшим после работы.",8],
 ['proud','гордый','/praʊd/',"We are proud of you!","Мы тобой гордимся!","He felt proud of his work.","Он гордился своей работой.",6],
 ['surprised','удивлённый','/səˈpraɪzd/',"I was surprised by the news.","Я был удивлён новостями.","She looked surprised to see us.","Она выглядела удивлённой, увидев нас.",4],
 ['worried','обеспокоенный','/ˈwʌr.id/',"I'm worried about the exam.","Я беспокоюсь об экзамене.","Don't look so worried.","Не выгляди таким обеспокоенным.",3],
 ['lonely','одинокий','/ˈləʊn.li/',"He felt lonely in a big city.","Он чувствовал себя одиноким в большом городе.","A lonely evening can feel long.","Одинокий вечер может казаться долгим.",2],
 ['grateful','благодарный','/ˈɡreɪt.fəl/',"I'm grateful for your help.","Я благодарен за твою помощь.","We are grateful for your support.","Мы благодарны за вашу поддержку.",1]
],
nature:[
 ['forest','лес','/ˈfɒr.ɪst/',"We walked through the forest.","Мы шли через лес.","The forest is quiet in winter.","Зимой лес тихий.",8],
 ['mountain','гора','/ˈmaʊn.tɪn/',"The mountains were covered with snow.","Горы были покрыты снегом.","We climbed the mountain at sunrise.","Мы поднялись на гору на рассвете.",6],
 ['river','река','/ˈrɪv.ər/',"The river flows into the sea.","Река впадает в море.","Let's follow the river upstream.","Давай пойдём вверх по реке.",9],
 ['weather','погода','/ˈweð.ər/',"The weather is lovely today.","Сегодня прекрасная погода.","Check the weather before you leave.","Проверь погоду перед выходом.",10],
 ['storm','шторм, гроза','/stɔːm/',"A storm is coming.","Приближается гроза.","The storm broke a few branches.","Гроза сломала несколько веток.",3],
 ['sunset','закат','/ˈsʌn.set/',"We watched a beautiful sunset.","Мы смотрели на прекрасный закат.","The sunset turned the sky pink.","Закат окрасил небо в розовый.",7],
 ['rainbow','радуга','/ˈreɪn.bəʊ/',"A rainbow appeared after the rain.","После дождя появилась радуга.","The rainbow looked like a bridge.","Радуга была похожа на мост.",4],
 ['ocean','океан','/ˈəʊ.ʃən/',"The ocean is deep and mysterious.","Океан глубок и загадочен.","They sailed across the ocean.","Они пересекли океан на паруснике.",5],
 ['field','поле','/fiːld/',"Wheat grows in this field.","В этом поле растёт пшеница.","Children were running across the field.","Дети бежали по полю.",6],
 ['star','звезда','/stɑːr/',"The stars are bright tonight.","Сегодня звёзды яркие.","She wished on a falling star.","Она загадала желание на падающую звезду.",8]
]};
const VERBS = [
 ['be','was/were','been','быть'],['begin','began','begun','начинать'],['break','broke','broken','ломать'],['bring','brought','brought','приносить'],['build','built','built','строить'],['buy','bought','bought','покупать'],['catch','caught','caught','ловить'],['choose','chose','chosen','выбирать'],['come','came','come','приходить'],['cost','cost','cost','стоить'],['cut','cut','cut','резать'],['do','did','done','делать'],['draw','drew','drawn','рисовать'],['drink','drank','drunk','пить'],['drive','drove','driven','водить'],['eat','ate','eaten','есть'],['fall','fell','fallen','падать'],['feel','felt','felt','чувствовать'],['find','found','found','находить'],['fly','flew','flown','летать'],['forget','forgot','forgotten','забывать'],['get','got','got/gotten','получать'],['give','gave','given','давать'],['go','went','gone','идти'],['grow','grew','grown','расти'],['have','had','had','иметь'],['hear','heard','heard','слышать'],['hold','held','held','держать'],['keep','kept','kept','хранить'],['know','knew','known','знать'],['learn','learnt/learned','learnt/learned','учить(ся)'],['leave','left','left','покидать'],['lose','lost','lost','терять'],['make','made','made','делать, создавать'],['meet','met','met','встречать'],['pay','paid','paid','платить'],['put','put','put','класть'],['read','read','read','читать'],['ride','rode','ridden','ездить верхом'],['run','ran','run','бежать'],['say','said','said','говорить'],['see','saw','seen','видеть'],['sell','sold','sold','продавать'],['send','sent','sent','отправлять'],['show','showed','shown','показывать'],['sing','sang','sung','петь'],['sit','sat','sat','сидеть'],['sleep','slept','slept','спать'],['speak','spoke','spoken','говорить'],['spend','spent','spent','тратить'],['stand','stood','stood','стоять'],['swim','swam','swum','плавать'],['take','took','taken','брать'],['teach','taught','taught','преподавать'],['tell','told','told','рассказывать'],['think','thought','thought','думать'],['understand','understood','understood','понимать'],['wake','woke','woken','просыпаться'],['wear','wore','worn','носить (одежду)'],['write','wrote','written','писать']
];
const GRAMMAR = [
 ['Present Simple — простое настоящее','A1','Регулярные действия, факты и привычки. <b>I/you/we/they + V</b>, <b>he/she/it + V-s</b>. Вопросы: do/does. Отрицания: don’t/doesn’t.<div class="ex">She <b>works</b> every day. · <b>Do</b> you like coffee? · He <b>doesn’t</b> drink tea.</div>Маркеры: always, usually, often, sometimes, never, every day.'],
 ['Present Continuous — сейчас в процессе','A1','Действие происходит прямо сейчас или в текущий период. <b>am/is/are + V-ing</b>.<div class="ex">I <b>am reading</b> now. · They <b>are playing</b> football. · Is she <b>working</b> today?</div>Маркеры: now, right now, at the moment, this week.'],
 ['Past Simple — завершённое прошлое','A1','Завершённое действие в прошлом. Правильные глаголы: <b>V-ed</b>; неправильные: вторая форма (V2). Вопросы и отрицания: <b>did + V</b> / <b>didn’t + V</b>.<div class="ex">I <b>visited</b> Paris last year. · She <b>went</b> home. · <b>Did</b> you <b>see</b> it? · We <b>didn’t wait</b>.</div>Маркеры: yesterday, last week, two days ago, in 2020.'],
 ['Will или going to','A2','<b>Will</b> — спонтанное решение, обещание или предсказание. <b>Be going to</b> — заранее принятый план или предсказание по очевидным признакам.<div class="ex">I<b>’ll</b> help you! · We<b>’re going to</b> travel in July. · Look at those clouds — it<b>’s going to</b> rain.</div>'],
 ['Present Perfect — результат и опыт','B1','<b>Have/has + V3</b>. Важен результат сейчас, жизненный опыт или действие, начавшееся в прошлом и продолжающееся до сих пор.<div class="ex">I <b>have lost</b> my keys. · She <b>has never been</b> to London. · We <b>have lived</b> here for five years.</div>Маркеры: already, yet, just, ever, never, for, since. С точным временем в прошлом (yesterday) используйте Past Simple.'],
 ['Артикли a / an / the','A1','<b>A/an</b> — один из многих, первое упоминание. <b>The</b> — конкретный или уже известный предмет. <b>An</b> — перед гласным звуком: an apple, an hour.<div class="ex">I saw <b>a</b> dog. <b>The</b> dog was friendly. · <b>The</b> sun is bright. · I love music.</div>Обычно без артикля: общие понятия во множественном числе, неисчисляемые вещества, имена и большинство стран. Исключения: the USA, the UK.'],
 ['Модальные глаголы','A2','<b>Can</b> — умение или возможность; <b>must</b> — обязанность; <b>should</b> — совет; <b>may/might</b> — разрешение или вероятность. После них — инфинитив без to.<div class="ex">I <b>can swim</b>. · You <b>should rest</b>. · You <b>must stop</b> here. · <b>May</b> I come in?</div>'],
 ['Условные предложения','B1','<b>Zero:</b> if + present, present — факт. <b>First:</b> if + present, will + V — реальное будущее. <b>Second:</b> if + past, would + V — гипотеза. <b>Third:</b> if + past perfect, would have + V3 — нереальное прошлое.<div class="ex">If you heat ice, it <b>melts</b>. · If it rains, I <b>will stay</b> home. · If I had money, I <b>would travel</b>. · If I had studied, I <b>would have passed</b>.</div>В if-части первого условия не используйте will: If it rains, а не If it will rain.'],
 ['Пассивный залог','B1','<b>Be + V3</b>: важен объект или результат, а не исполнитель. Форма be меняется по времени.<div class="ex">This play <b>was written</b> by Shakespeare. · The room <b>is cleaned</b> every day. · The bridge <b>has been built</b>.</div>Исполнитель действия, если он важен, вводится предлогом by.']
];

/* ---------- Utilities & persistent state ---------- */
const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const esc = v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = (name,cls='')=>`<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const uid = ()=> (globalThis.crypto?.randomUUID?.() || 'id-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10));
const clamp = (n,min,max)=>Math.min(max,Math.max(min,Number(n)||min));
const norm = s=>String(s||'').trim().toLocaleLowerCase('en-US').replace(/\s+/g,' ');
const DAY = 86400000;
const intervalMs = level=>INTERVALS[clamp(Math.round(level),1,10)-1]*60000;
const levelColor = level=>LEVEL_COLORS[clamp(Math.round(level),1,10)-1];
const levelText = level=>level<=3?'Новое':level<=6?'Учу':level<=8?'Уверенно':'Знаю';
const dayKey = t=>{const d=new Date(t);return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;};
const fmtDate = t=>new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(new Date(t));
const fmtTime = t=>new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit'}).format(new Date(t));
function dueLabel(t){const diff=new Date(t).getTime()-Date.now();if(diff<=0)return 'Сейчас';if(diff<60000)return '< 1 мин';if(diff<3600000)return `Через ${Math.ceil(diff/60000)} мин`;if(diff<DAY)return `Через ${Math.ceil(diff/3600000)} ч`;if(diff<2*DAY)return 'Завтра';return fmtDate(t);}
function download(name,content,type='application/json'){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function mulberry(seed){return ()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let storageOK=true;
const STORAGE_KEY='englishup.v2';
function seedState(){
  const now=Date.now(), rnd=mulberry(42), words=[], history=[];
  Object.entries(SEED_WORDS).forEach(([cat,rows],ci)=>rows.forEach((r,i)=>{
    const level=r[7], future=level>=7;
    const nextReview=now+(future?intervalMs(level)*(0.35+rnd()*0.65):-(rnd()*intervalMs(level)+60000));
    const lastReview=nextReview-intervalMs(level);
    const w={id:`seed-${cat}-${i}`,word:r[0],translation:r[1],category:cat,ipa:r[2],examples:[{en:r[3],ru:r[4]},{en:r[5],ru:r[6]}],level,createdAt:now-(60-words.length)*3600000,updatedAt:now-7*DAY,nextReview,lastReview,reviewCount:level*2};
    words.push(w);
  }));
  const daily=[4,7,5,9,6,8,3];
  daily.forEach((count,di)=>{for(let j=0;j<count;j++){const w=words[Math.floor(rnd()*words.length)];const at=new Date(now-(6-di)*DAY);at.setHours(9+Math.floor(rnd()*10),Math.floor(rnd()*60),0,0);if(at.getTime()<=now)history.push({id:uid(),wordId:w.id,level:w.level,at:at.getTime()});}});
  return {version:2,categories:CATEGORY_SEED.map(c=>({...c})),words,history:history.sort((a,b)=>a.at-b.at),sessions:3,savedViews:[],settings:{sound:true},exam:null};
}
function loadState(){
  try{const raw=localStorage.getItem(STORAGE_KEY);if(raw){const s=JSON.parse(raw);if(s.version===2&&Array.isArray(s.words)&&Array.isArray(s.categories)&&s.categories.length){s.history=Array.isArray(s.history)?s.history:[];s.savedViews=Array.isArray(s.savedViews)?s.savedViews:[];s.settings=s.settings||{sound:true};s.sessions=Number(s.sessions)||0;return s;}}}catch(e){storageOK=false;}
  const s=seedState();
  try{const old=JSON.parse(localStorage.getItem('englishup')||'null');if(old?.learned){s.words.forEach(w=>{if(old.learned[w.word])w.level=Math.max(w.level,8);});s.sessions=Math.max(s.sessions,Number(old.quizzes)||0);}}catch(e){}
  return s;
}
let state=loadState();
let currentView='home', selectedIds=new Set(), dictPage=1, pageSize=12, drawerWordId=null, lastFocus=null, modalFocus=null;
let dictFilters={search:'',category:'all',level:'all',sort:'manual'};
let refTab='verbs', importTab='list', importPlan=null, mapCtl={category:'all',minLevel:1,nodeSize:100,spread:100,colorMode:'level',labels:'smart',edges:true,motion:!reducedMotion,zoom:1,panX:0,panY:0,seed:42};
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));storageOK=true;}catch(e){storageOK=false;}$('#storageBanner').classList.toggle('show',!storageOK);$('#storageNote').innerHTML=storageOK?'Прогресс сохраняется<br>в этом браузере':'Только эта вкладка.<br>Сделай экспорт.';}
const getWord=id=>state.words.find(w=>w.id===id);
const getCat=id=>state.categories.find(c=>c.id===id)||state.categories[0];
const dueWords=()=>state.words.filter(w=>w.nextReview<=Date.now());
function toast(msg,action=null,actionLabel='Отменить'){
  const el=document.createElement('div');el.className='toast';el.innerHTML=`${icon('check','sm')}<span>${esc(msg)}</span>${action?`<button class="toast-action">${esc(actionLabel)}</button>`:''}<button class="close-toast" aria-label="Закрыть уведомление">${icon('close','sm')}</button>`;
  $('#toastStack').appendChild(el);let done=false;const remove=()=>{if(done)return;done=true;el.classList.add('out');setTimeout(()=>el.remove(),260);};
  $('.close-toast',el).onclick=remove;if(action)$('.toast-action',el).onclick=()=>{action();remove();};setTimeout(remove,action?9000:4500);while($('#toastStack').children.length>3)$('#toastStack').firstElementChild.remove();
}
function openModal(title,html,mount){modalFocus=document.activeElement;$('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;$('#modalOverlay').classList.add('show');document.body.style.overflow='hidden';if(mount)mount($('#modalBody'));setTimeout(()=>($('#modalBody input:not([type=hidden]),#modalBody textarea,#modalBody select,#modalBody button')||$('#modalClose')).focus(),30);}
function closeModal(){$('#modalOverlay').classList.remove('show');if(!$('#drawer').classList.contains('show'))document.body.style.overflow='';if(modalFocus?.isConnected)modalFocus.focus();modalFocus=null;}
function openDrawer(id){const w=getWord(id);if(!w)return;lastFocus=document.activeElement;drawerWordId=id;renderDrawer();$('#drawer').classList.add('show');$('#drawerOverlay').classList.add('show');document.body.style.overflow='hidden';setTimeout(()=>$('#drawerClose').focus(),30);}
function closeDrawer(){$('#drawer').classList.remove('show');$('#drawerOverlay').classList.remove('show');drawerWordId=null;if(!$('#modalOverlay').classList.contains('show'))document.body.style.overflow='';if(lastFocus?.isConnected)lastFocus.focus();lastFocus=null;}
function confirmAction(title,text,label,fn){openModal(title,`<p style="color:var(--muted);line-height:1.7">${esc(text)}</p><div class="modal-foot"><button class="btn btn-outline" id="confirmCancel">Отмена</button><button class="btn btn-danger" id="confirmYes">${esc(label)}</button></div>`,root=>{$('#confirmCancel',root).onclick=closeModal;$('#confirmYes',root).onclick=()=>{closeModal();fn();};});}
function speak(text){if(!state.settings.sound){toast('Озвучка выключена. Включи её кнопкой в верхней панели.');return;}if(!('speechSynthesis' in window)){toast('Этот браузер не поддерживает озвучку.');return;}try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.85;const voice=speechSynthesis.getVoices().find(v=>v.lang==='en-US')||speechSynthesis.getVoices().find(v=>v.lang.startsWith('en'));if(voice)u.voice=voice;u.onerror=e=>{if(e.error!=='interrupted'&&e.error!=='canceled')toast('Не удалось воспроизвести слово. Проверь английские голоса в системе.');};speechSynthesis.speak(u);}catch(e){toast('Озвучка недоступна в этом браузере.');}}
function updateSound(){$('#soundToggle').innerHTML=icon(state.settings.sound?'sound':'mute');$('#soundToggle').setAttribute('aria-pressed',String(state.settings.sound));$('#soundToggle').setAttribute('aria-label',state.settings.sound?'Выключить озвучку':'Включить озвучку');$('#soundToggle').title=state.settings.sound?'Озвучка включена':'Озвучка выключена';$('#soundToggle').classList.toggle('active',!state.settings.sound);}
function categoryOptions(selected='all',allLabel=null){return (allLabel?`<option value="all">${esc(allLabel)}</option>`:'')+state.categories.map(c=>`<option value="${esc(c.id)}" ${c.id===selected?'selected':''}>${esc(c.name)}</option>`).join('');}
function fillCategorySelects(){
  $('#dictCategory').innerHTML=categoryOptions(dictFilters.category,'Все категории');$('#examCategory').innerHTML=categoryOptions($('#examCategory').value||'all','Все категории');$('#mapCategory').innerHTML=categoryOptions(mapCtl.category,'Все категории');$('#bulkCategory').innerHTML='<option value="">Переместить в…</option>'+categoryOptions('');
}
function masteryHTML(level){return `<div class="mastery" style="--mc:${levelColor(level)}"><div class="mastery-segments">${Array.from({length:10},(_,i)=>`<i class="${i<level?'on':''}"></i>`).join('')}</div><b>${level}<small>/10</small></b></div>`;}
function catChip(w){const c=getCat(w.category);return `<span class="cat-chip"><i style="background:${esc(c.color)}"></i>${esc(c.name)}</span>`;}
function highlight(text,word){const safe=esc(text);const q=esc(word).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');try{return safe.replace(new RegExp(`\\b(${q}(?:s|es)?)\\b`,'gi'),'<mark>$1</mark>');}catch(e){return safe;}}
function examplesHTML(w,context='ex'){return w.examples?.length?w.examples.map((ex,i)=>`<div class="example"><div class="en">${highlight(ex.en,w.word)}</div>${ex.ru?`<div class="ru">${esc(ex.ru)}</div>`:''}<button class="icon-btn speak-ex" data-speak="${esc(ex.en)}" aria-label="Озвучить пример ${i+1}">${icon('sound','sm')}</button></div>`).join(''):`<div class="hint">${icon('info','sm')}Примеров пока нет — добавь их при редактировании слова.</div>`;}
function refreshAll(){fillCategorySelects();renderHome();renderWords();renderExam();renderSessionStats();renderDrawer();renderImportPreview();updateNavCounts();updateSound();if(currentView==='map')buildMap();save();}
function updateNavCounts(){$('#navWordCount').textContent=state.words.length;$('#navDueCount').textContent=dueWords().length;}
function showView(name){
  if(!$('#view-'+name))name='home';if(currentView==='map'&&name!=='map')stopMap();currentView=name;
  $$('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+name));$$('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));
  $('#crumbCurrent').textContent=({home:'ОБЗОР',words:'МОЙ СЛОВАРЬ',exam:'ЭКЗАМЕН',map:'КАРТА НЕЙРОНОВ',import:'ДОБАВИТЬ СЛОВА',reference:'СПРАВОЧНИК'})[name];
  closeSidebar();fillCategorySelects();if(name==='home')renderHome();if(name==='words')renderWords();if(name==='exam')renderExam();if(name==='map'){syncMapControls();buildMap();startMap();}if(name==='reference')renderReference();if(name==='import')renderPrompt();updateNavCounts();window.scrollTo({top:0,behavior:'instant'});
}
function closeSidebar(){$('#sidebar').classList.remove('open');$('#sidebarScrim').classList.remove('show');}

/* ---------- Overview ---------- */
function renderHome(){
  const words=state.words,due=dueWords(),avg=words.length?words.reduce((s,w)=>s+w.level,0)/words.length:0;
  $('#homeDate').textContent=new Intl.DateTimeFormat('ru-RU',{weekday:'long',day:'numeric',month:'long'}).format(new Date())+' · Твоя практика, твой темп.';
  $('#heroKicker').textContent=due.length?`${due.length} СЛОВ ЖДУТ ПОВТОРЕНИЯ`:'ВСЁ ПОВТОРЕНО ВОВРЕМЯ';
  $('#heroText').textContent=words.length?(due.length?'Низкие оценки возвращаются чаще, высокие — реже. Так память работает на тебя.':'Сроки повторения ещё не наступили. Можно добавить слова или пройти свободную тренировку.'):'Начни с собственного списка слов. ИИ-промпт поможет подготовить его за минуту.';
  $('#heroStart').innerHTML=(state.exam&&!state.exam.finished?'Продолжить экзамен':due.length?'Начать повторение':'Свободная тренировка')+icon('arrow','sm');
  $('#heroNote').textContent=due.length?`≈ ${Math.max(1,Math.ceil(Math.min(due.length,10)*.5))} минут`:'Без ожидания';
  const metrics=[['book','blue',words.length,'слов в словаре',''],['target','green',avg.toFixed(1),'среднее знание','из 10'],['clock','amber',due.length,'к повторению','сейчас'],['flame','coral',state.sessions,'сессий завершено','']];
  $('#homeMetrics').innerHTML=metrics.map(([ic,col,num,label,small])=>`<div class="card metric"><div class="metric-icon ${col}">${icon(ic)}</div><div><b>${num}</b><span>${label}</span>${small?`<small>${small}</small>`:''}</div></div>`).join('');
  $('#homeCategories').innerHTML=state.categories.map(c=>{const ws=words.filter(w=>w.category===c.id),pct=ws.length?Math.round(ws.reduce((s,w)=>s+w.level,0)/ws.length*10):0;return `<div class="category-row" role="button" tabindex="0" data-cat-open="${esc(c.id)}"><i class="cat-dot" style="background:${esc(c.color)}"></i><div><div class="name">${esc(c.name)}</div><div class="meta">${ws.length} слов · ${ws.filter(w=>w.nextReview<=Date.now()).length} к повторению</div></div><div class="bar"><i style="width:${pct}%;background:${esc(c.color)}"></i></div><span class="pct">${pct}%</span><span class="go">${icon('right','sm')}</span></div>`;}).join('')||'<div class="empty"><p>Категории появятся вместе с первым словом.</p></div>';
  const queue=due.sort((a,b)=>a.level-b.level||a.nextReview-b.nextReview).slice(0,5);
  $('#homeQueue').innerHTML=queue.length?queue.map(w=>`<div class="queue-row"><div><button class="queue-word" data-word-open="${esc(w.id)}">${esc(w.word)}</button><div class="meta">${esc(getCat(w.category).name)}</div></div><span class="level-pill" style="background:${levelColor(w.level)}22;color:${w.level>=4&&w.level<=6?'#8A6510':levelColor(w.level)}">${w.level}/10</span><span class="due-pill">${dueLabel(w.nextReview)}</span></div>`).join(''):`<div class="empty">${icon('check')}<h3>Всё повторено</h3><p>Новые повторения появятся по расписанию. Или потренируй любые слова.</p><button class="btn btn-outline btn-sm" id="freePracticeBtn">Свободная тренировка</button></div>`;
  if($('#freePracticeBtn'))$('#freePracticeBtn').onclick=()=>startExam('all','all',10);
  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d;});const counts=days.map(d=>state.history.filter(h=>dayKey(h.at)===dayKey(d)).length);const max=Math.max(1,...counts);
  $('#activityChart').innerHTML=days.map((d,i)=>`<div class="activity-day ${i===6?'today':''}" title="${fmtDate(d)}: ${counts[i]} повторений"><b>${counts[i]||''}</b><div class="bar-v" style="height:${Math.max(5,counts[i]/max*58)}px"></div><span>${i===6?'Сегодня':new Intl.DateTimeFormat('ru-RU',{weekday:'short'}).format(d)}</span></div>`).join('');
  $('#weekReviews').textContent=counts.reduce((a,b)=>a+b,0);let streak=0;for(let i=0;i<3650;i++){const d=new Date();d.setDate(d.getDate()-i);if(state.history.some(h=>dayKey(h.at)===dayKey(d)))streak++;else if(i>0)break;}$('#streakPill').textContent=`🔥 ${streak} дней подряд`;
  const todayCount=state.history.filter(h=>dayKey(h.at)===dayKey(Date.now())).length;$('#dailyGoalText').textContent=`${Math.min(todayCount,10)} / 10`;$('#dailyGoalBar').style.width=Math.min(100,todayCount*10)+'%';
  renderHeroMap();
}
function renderHeroMap(){
  const rnd=mulberry(7), nodes=[], edges=[];const labels=['connect','journey','curious','memory','language','growth'];
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2,r=70+rnd()*85;nodes.push({x:250+Math.cos(a)*r*1.25,y:155+Math.sin(a)*r*.82,r:3+rnd()*5,c:i%5===0?'#BFF2D2':i%3===0?'#FFC857':'#CFE3FF'});}
  nodes.forEach((n,i)=>{const near=nodes.map((m,j)=>({j,d:Math.hypot(n.x-m.x,n.y-m.y)})).filter(o=>o.j!==i).sort((a,b)=>a.d-b.d).slice(0,2);near.forEach(o=>{if(o.j>i)edges.push([i,o.j]);});});
  $('#heroMap').innerHTML=`<svg viewBox="0 0 500 320" aria-hidden="true"><g opacity=".45" stroke="#CFE3FF" stroke-width="1">${edges.map(([a,b])=>`<line x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}"/>`).join('')}</g>${nodes.map((n,i)=>`<g><circle cx="${n.x}" cy="${n.y}" r="${n.r+5}" fill="${n.c}" opacity=".08"/><circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${n.c}" opacity="${.55+rnd()*.45}"/>${i<6?`<text x="${n.x+10}" y="${n.y+4}" fill="#E8EEFF" font-size="10" font-family="Segoe UI, sans-serif">${labels[i]}</text>`:''}</g>`).join('')}<circle cx="250" cy="155" r="31" fill="#BFF2D2" opacity=".1"/><circle cx="250" cy="155" r="17" fill="#BFF2D2" opacity=".2"/><circle cx="250" cy="155" r="8" fill="#BFF2D2"/><text x="250" y="193" text-anchor="middle" fill="#fff" font-size="12" font-weight="700" font-family="Segoe UI, sans-serif">твоя память</text></svg><div class="hero-map-label"><i></i>${state.words.length} слов · ${state.categories.length} категорий</div>`;
}

/* ---------- Dictionary: search, filter, sort, selection, CRUD, saved views ---------- */
function filteredWords(){
  let ws=state.words.filter(w=>{const q=norm(dictFilters.search);const hay=norm([w.word,w.translation,w.ipa,getCat(w.category).name,...(w.examples||[]).flatMap(e=>[e.en,e.ru])].join(' '));return (!q||hay.includes(q))&&(dictFilters.category==='all'||w.category===dictFilters.category)&&(dictFilters.level==='all'||(dictFilters.level==='new'&&w.level<=3)||(dictFilters.level==='learning'&&w.level>=4&&w.level<=7)||(dictFilters.level==='strong'&&w.level>=8)||(dictFilters.level==='due'&&w.nextReview<=Date.now()));});
  const s=dictFilters.sort;if(s==='alpha')ws.sort((a,b)=>a.word.localeCompare(b.word,'en'));if(s==='levelAsc')ws.sort((a,b)=>a.level-b.level||a.word.localeCompare(b.word,'en'));if(s==='levelDesc')ws.sort((a,b)=>b.level-a.level);if(s==='due')ws.sort((a,b)=>a.nextReview-b.nextReview);if(s==='recent')ws.sort((a,b)=>b.createdAt-a.createdAt);return ws;
}
function renderWords(){
  $('#dictSearch').value=dictFilters.search;$('#dictLevel').value=dictFilters.level;$('#dictSort').value=dictFilters.sort;fillCategorySelects();
  const ws=filteredWords(),pages=Math.max(1,Math.ceil(ws.length/pageSize));dictPage=clamp(dictPage,1,pages);const page=ws.slice((dictPage-1)*pageSize,dictPage*pageSize);
  $('#dictCount').textContent=`· ${state.words.length}`;
  $('#wordTableBody').innerHTML=page.length?page.map(w=>`<tr data-id="${esc(w.id)}" draggable="${dictFilters.sort==='manual'}" class="${selectedIds.has(w.id)?'selected':''}"><td><input type="checkbox" class="check row-check" data-id="${esc(w.id)}" ${selectedIds.has(w.id)?'checked':''} aria-label="Выбрать ${esc(w.word)}"></td><td><div class="word-cell"><span class="drag-handle" title="Перетащи для изменения порядка">${icon('grip','sm')}</span><button class="word-main" data-word-open="${esc(w.id)}" style="text-align:left">${esc(w.word)}${w.ipa?`<span class="word-ipa">${esc(w.ipa)}</span>`:''}</button></div><div class="word-tr" style="padding-left:26px">${esc(w.translation)}</div></td><td>${catChip(w)}</td><td>${masteryHTML(w.level)}</td><td><span class="${w.nextReview<=Date.now()?'due-pill':''}" style="font-size:11px;color:${w.nextReview<=Date.now()?'':'var(--muted)'}">${dueLabel(w.nextReview)}</span><div style="font-size:10px;color:var(--muted);margin-top:3px">${levelText(w.level)}</div></td><td><div class="row-actions"><button class="icon-btn" data-speak="${esc(w.word)}" title="Озвучить" aria-label="Озвучить ${esc(w.word)}">${icon('sound','sm')}</button><button class="icon-btn" data-edit="${esc(w.id)}" title="Редактировать" aria-label="Редактировать ${esc(w.word)}">${icon('edit','sm')}</button><button class="icon-btn" data-delete="${esc(w.id)}" title="Удалить" aria-label="Удалить ${esc(w.word)}">${icon('trash','sm')}</button></div></td></tr>`).join(''):`<tr><td colspan="6"><div class="empty">${icon('search')}<h3>Ничего не найдено</h3><p>Измени фильтры или добавь первое слово в эту категорию.</p><button class="btn btn-outline btn-sm" id="resetFiltersBtn">Сбросить фильтры</button></div></td></tr>`;
  if($('#resetFiltersBtn'))$('#resetFiltersBtn').onclick=()=>{dictFilters={search:'',category:'all',level:'all',sort:'manual'};dictPage=1;renderWords();};
  $('#tableInfo').textContent=ws.length?`${(dictPage-1)*pageSize+1}–${Math.min(dictPage*pageSize,ws.length)} из ${ws.length} слов`:'0 слов';
  let pager=`<button data-page="${dictPage-1}" ${dictPage===1?'disabled':''} aria-label="Предыдущая страница">${icon('left','sm')}</button>`;for(let p=1;p<=pages;p++){if(pages<=7||p===1||p===pages||Math.abs(p-dictPage)<=1)pager+=`<button data-page="${p}" class="${p===dictPage?'active':''}">${p}</button>`;else if(p===2&&dictPage>3||p===pages-1&&dictPage<pages-2)pager+='<span>…</span>';}pager+=`<button data-page="${dictPage+1}" ${dictPage===pages?'disabled':''} aria-label="Следующая страница">${icon('right','sm')}</button>`;$('#pager').innerHTML=pager;
  const all=page.length&&page.every(w=>selectedIds.has(w.id));$('#selectAll').checked=!!all;$('#selectAll').indeterminate=!all&&page.some(w=>selectedIds.has(w.id));
  $('#bulkBar').classList.toggle('show',selectedIds.size>0);$('#bulkCount').textContent=`Выбрано: ${selectedIds.size}`;renderSavedViews();bindDrag();
}
function renderSavedViews(){$('#savedViewSelect').innerHTML='<option value="">Представления</option>'+state.savedViews.map(v=>`<option value="${esc(v.id)}">${esc(v.name)}</option>`).join('');}
function bindDrag(){let dragId=null;$$('#wordTableBody tr[draggable="true"]').forEach(row=>{row.ondragstart=e=>{dragId=row.dataset.id;row.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',dragId);};row.ondragend=()=>{row.classList.remove('dragging');$$('.drag-over').forEach(r=>r.classList.remove('drag-over'));};row.ondragover=e=>{e.preventDefault();row.classList.add('drag-over');};row.ondragleave=()=>row.classList.remove('drag-over');row.ondrop=e=>{e.preventDefault();const target=row.dataset.id;if(!dragId||dragId===target)return;const from=state.words.findIndex(w=>w.id===dragId),to=state.words.findIndex(w=>w.id===target);if(from<0||to<0)return;const [w]=state.words.splice(from,1);state.words.splice(to,0,w);save();renderWords();toast('Порядок слов изменён.');};});}
function moveWord(id,delta){const i=state.words.findIndex(w=>w.id===id),j=i+delta;if(i<0||j<0||j>=state.words.length)return;const [w]=state.words.splice(i,1);state.words.splice(j,0,w);dictFilters.sort='manual';save();renderWords();renderDrawer();toast('Порядок изменён.');}
function deleteWords(ids){
  const removed=state.words.filter(w=>ids.includes(w.id)),removedHistory=state.history.filter(h=>ids.includes(h.wordId));if(!removed.length)return;
  const currentId=state.exam?.queue[state.exam.index];state.words=state.words.filter(w=>!ids.includes(w.id));state.history=state.history.filter(h=>!ids.includes(h.wordId));ids.forEach(id=>selectedIds.delete(id));
  if(state.exam&&!state.exam.finished){state.exam.queue=state.exam.queue.filter(id=>!ids.includes(id));state.exam.results=state.exam.results.filter(r=>!ids.includes(r.id));state.exam.index=state.exam.queue.includes(currentId)?state.exam.queue.indexOf(currentId):Math.min(state.exam.index,state.exam.queue.length);if(!state.exam.queue.length)state.exam=null;}
  if(ids.includes(drawerWordId))closeDrawer();refreshAll();toast(`Удалено слов: ${removed.length}.`,()=>{state.words.push(...removed.filter(w=>!getWord(w.id)));state.history.push(...removedHistory);refreshAll();toast('Слова восстановлены.');});
}
function wordFormHTML(prefix,w=null){const level=w?.level||1;return `<div class="form-grid"><div class="form-field"><label for="${prefix}-word">Английское слово *</label><input class="input" id="${prefix}-word" required maxlength="120" value="${esc(w?.word||'')}" placeholder="например, curious"></div><div class="form-field"><label for="${prefix}-translation">Перевод *</label><input class="input" id="${prefix}-translation" required maxlength="300" value="${esc(w?.translation||'')}" placeholder="любопытный"></div><div class="form-field"><label for="${prefix}-category">Категория</label><select class="select" id="${prefix}-category">${categoryOptions(w?.category||state.categories[0]?.id)}</select></div><div class="form-field"><label for="${prefix}-newcat">Или новая категория</label><input class="input" id="${prefix}-newcat" maxlength="60" placeholder="Название новой категории"></div><div class="form-field full"><label for="${prefix}-ipa">Транскрипция</label><input class="input" id="${prefix}-ipa" maxlength="120" value="${esc(w?.ipa||'')}" placeholder="/ˈkjʊə.ri.əs/"></div><div class="form-field full"><label for="${prefix}-level">Степень знания · <span id="${prefix}-level-label">${level} — ${levelText(level)}</span></label><div class="level-range-row"><input type="range" class="range" id="${prefix}-level" min="1" max="10" value="${level}"><output id="${prefix}-level-out">${level}</output></div><span class="help" id="${prefix}-interval">Следующее повторение: ${INTERVAL_LABELS[level-1]}</span></div></div><div class="drawer-section"><h3>Примеры использования</h3><div id="${prefix}-examples"></div><button type="button" class="btn btn-ghost btn-sm" id="${prefix}-add-example">${icon('plus','sm')}Добавить пример</button></div><div class="form-error" id="${prefix}-error" role="alert"></div><div class="modal-foot"><button type="button" class="btn btn-outline" id="${prefix}-cancel">Отмена</button><button type="submit" class="btn btn-primary">${icon('check','sm')}${w?'Сохранить':'Добавить слово'}</button></div>`;}
function bindWordForm(root,prefix,w,onSave){
  const examples=(w?.examples?.length?w.examples:[{en:'',ru:''}]).map(e=>({...e}));
  const drawExamples=()=>{const box=$(`#${prefix}-examples`,root);box.innerHTML=examples.map((e,i)=>`<div class="example-edit"><div class="row"><b>Пример ${i+1}</b><button type="button" class="icon-btn" data-remove-ex="${i}" aria-label="Удалить пример ${i+1}">${icon('trash','sm')}</button></div><div class="form-field"><label for="${prefix}-en-${i}">English</label><input class="input" id="${prefix}-en-${i}" data-ex-en="${i}" value="${esc(e.en)}" maxlength="500" placeholder="I'm curious about how it works."></div><div class="form-field" style="margin-top:8px"><label for="${prefix}-ru-${i}">Русский</label><input class="input" id="${prefix}-ru-${i}" data-ex-ru="${i}" value="${esc(e.ru)}" maxlength="500" placeholder="Мне любопытно, как это работает."></div></div>`).join('');$$('[data-ex-en]',box).forEach(inp=>inp.oninput=()=>examples[+inp.dataset.exEn].en=inp.value);$$('[data-ex-ru]',box).forEach(inp=>inp.oninput=()=>examples[+inp.dataset.exRu].ru=inp.value);$$('[data-remove-ex]',box).forEach(btn=>btn.onclick=()=>{examples.splice(+btn.dataset.removeEx,1);drawExamples();});};drawExamples();
  $(`#${prefix}-add-example`,root).onclick=()=>{if(examples.length>=6){toast('Максимум 6 примеров на слово.');return;}examples.push({en:'',ru:''});drawExamples();};
  const range=$(`#${prefix}-level`,root);range.oninput=()=>{$(`#${prefix}-level-out`,root).textContent=range.value;$(`#${prefix}-level-label`,root).textContent=`${range.value} — ${levelText(+range.value)}`;$(`#${prefix}-interval`,root).textContent=`Следующее повторение: ${INTERVAL_LABELS[+range.value-1]}`;};
  $(`#${prefix}-cancel`,root).onclick=()=>{if(prefix==='manual'){$('#manualForm').reset();bindManualForm();}else closeModal();};
  root.onsubmit=e=>{e.preventDefault();const word=$(`#${prefix}-word`,root).value.trim(),translation=$(`#${prefix}-translation`,root).value.trim(),err=$(`#${prefix}-error`,root);const fail=msg=>{err.textContent=msg;err.classList.add('show');};err.classList.remove('show');if(!word||!translation)return fail('Заполни слово и перевод.');if(state.words.some(x=>norm(x.word)===norm(word)&&x.id!==w?.id))return fail('Это слово уже есть в словаре. Открой существующую карточку или измени написание.');
    let category=$(`#${prefix}-category`,root).value;const newcat=$(`#${prefix}-newcat`,root).value.trim();if(newcat){let c=state.categories.find(c=>norm(c.name)===norm(newcat));if(!c){c={id:uid(),name:newcat,color:PALETTE[state.categories.length%PALETTE.length]};state.categories.push(c);}category=c.id;}
    const level=+range.value, oldLevel=w?.level;const data={word,translation,category,ipa:$(`#${prefix}-ipa`,root).value.trim(),examples:examples.filter(e=>e.en.trim()).map(e=>({en:e.en.trim(),ru:e.ru.trim()})),level,updatedAt:Date.now()};let savedWord;
    if(w){Object.assign(w,data);if(oldLevel!==level){w.nextReview=Date.now()+intervalMs(level);w.lastReview=Date.now();}savedWord=w;}else{savedWord={id:uid(),...data,createdAt:Date.now(),nextReview:Date.now()+intervalMs(level),lastReview:null,reviewCount:0};state.words.push(savedWord);}
    refreshAll();onSave(savedWord);};
}
function openWordModal(id=null){const w=id?getWord(id):null;openModal(w?'Редактировать слово':'Новое слово',`<form id="wordModalForm">${wordFormHTML('modalword',w)}</form>`,root=>{bindWordForm($('#wordModalForm',root),'modalword',w,saved=>{closeModal();toast(w?'Слово обновлено.':'Слово добавлено в словарь.');if(drawerWordId===saved.id)renderDrawer();});});}
function bindManualForm(){const form=$('#manualForm');form.innerHTML=wordFormHTML('manual');bindWordForm(form,'manual',null,w=>{toast(`«${w.word}» добавлено.`,()=>{showView('words');dictFilters.search=w.word;dictPage=1;renderWords();},'Открыть');bindManualForm();});}
function renderDrawer(){
  if(!drawerWordId)return;const w=getWord(drawerWordId);if(!w){closeDrawer();return;}const c=getCat(w.category);
  $('#drawerBody').innerHTML=`<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px"><div><div class="drawer-word">${esc(w.word)}</div><div class="drawer-ipa">${esc(w.ipa||'Транскрипция не указана')}</div></div><button class="icon-btn" data-speak="${esc(w.word)}" aria-label="Озвучить слово">${icon('sound')}</button></div>${catChip(w)}<div class="drawer-tr">${esc(w.translation)}</div><div class="drawer-section"><h3>Примеры использования</h3>${examplesHTML(w,'drawer')}</div><div class="drawer-section"><h3>Степень знания</h3><div class="level-range-row"><input type="range" class="range" id="drawerLevel" min="1" max="10" value="${w.level}" aria-label="Степень знания слова"><output id="drawerLevelOut">${w.level}</output></div><div class="interval-preview" id="drawerInterval">${icon('clock','sm')}Повторение: <b>${INTERVAL_LABELS[w.level-1]}</b></div><p class="hint" style="margin-top:8px">Изменение оценки сразу переносит срок следующего повторения.</p></div><div class="drawer-section"><h3>Прогресс</h3><div class="drawer-meta"><div><span>Следующее повторение</span><b>${dueLabel(w.nextReview)}</b></div><div><span>Повторений в экзамене</span><b>${w.reviewCount||0}</b></div><div><span>Добавлено</span><b>${fmtDate(w.createdAt)}</b></div><div><span>Последняя оценка</span><b>${w.lastReview?fmtDate(w.lastReview):'Ещё не было'}</b></div></div></div><div class="drawer-section"><h3>Порядок в словаре</h3><div class="head-actions"><button class="btn btn-outline btn-sm" id="drawerUp">${icon('left','sm')}Выше</button><button class="btn btn-outline btn-sm" id="drawerDown">${icon('right','sm')}Ниже</button></div></div>`;
  $('#drawerFoot').innerHTML=`<button class="btn btn-primary" id="drawerPractice">${icon('exam','sm')}Тренировать</button><button class="btn btn-outline" id="drawerEdit">${icon('edit','sm')}Изменить</button><button class="btn btn-danger" id="drawerDelete" aria-label="Удалить слово">${icon('trash','sm')}</button>`;
  $('#drawerLevel').oninput=e=>{const l=+e.target.value;$('#drawerLevelOut').textContent=l;$('#drawerInterval').innerHTML=`${icon('clock','sm')}Повторение: <b>${INTERVAL_LABELS[l-1]}</b>`;};
  $('#drawerLevel').onchange=e=>{setWordLevel(w.id,+e.target.value,false);toast(`Оценка «${w.word}»: ${e.target.value}/10. Повторение ${INTERVAL_LABELS[+e.target.value-1].toLowerCase()}.`);};
  $('#drawerEdit').onclick=()=>openWordModal(w.id);$('#drawerDelete').onclick=()=>confirmAction('Удалить слово?',`«${w.word}» будет удалено из словаря. После удаления можно отменить действие в уведомлении.`,'Удалить',()=>deleteWords([w.id]));
  $('#drawerPractice').onclick=()=>{closeDrawer();startExam('all',w.category,'all',[w.id]);};$('#drawerUp').onclick=()=>moveWord(w.id,-1);$('#drawerDown').onclick=()=>moveWord(w.id,1);
}
function setWordLevel(id,level,fromExam=false){const w=getWord(id);if(!w)return;const before={level:w.level,nextReview:w.nextReview,lastReview:w.lastReview,reviewCount:w.reviewCount||0};w.level=clamp(Math.round(level),1,10);w.nextReview=Date.now()+intervalMs(w.level);w.lastReview=Date.now();w.updatedAt=Date.now();if(fromExam){w.reviewCount=before.reviewCount+1;state.history.push({id:uid(),wordId:id,level:w.level,at:Date.now()});}refreshAll();return before;}
function openCategoryManager(){
  const html=`<p class="hint" style="margin-bottom:14px">Название и цвет меняются сразу. При удалении категории слова переезжают в «Без категории».</p><div id="catRows"></div><form id="newCatForm" style="display:flex;gap:8px;margin-top:18px"><input class="input" id="newCatName" placeholder="Новая категория" maxlength="60" required aria-label="Название новой категории"><input type="color" id="newCatColor" value="#2459EB" aria-label="Цвет категории" style="width:44px;border:0;background:none;cursor:pointer"><button class="btn btn-primary btn-sm" type="submit">${icon('plus','sm')}</button></form>`;
  openModal('Категории',html,root=>{const draw=()=>{$('#catRows',root).innerHTML=state.categories.map(c=>`<div class="cat-manage-row"><input type="color" value="${esc(c.color)}" data-cat-color="${esc(c.id)}" aria-label="Цвет ${esc(c.name)}"><input class="input" value="${esc(c.name)}" data-cat-name="${esc(c.id)}" maxlength="60" aria-label="Название категории"><small>${state.words.filter(w=>w.category===c.id).length} слов</small><button class="icon-btn" data-cat-delete="${esc(c.id)}" aria-label="Удалить категорию ${esc(c.name)}">${icon('trash','sm')}</button></div>`).join('');
    $$('[data-cat-color]',root).forEach(inp=>inp.onchange=()=>{getCat(inp.dataset.catColor).color=inp.value;refreshAll();});
    $$('[data-cat-name]',root).forEach(inp=>inp.onchange=()=>{const name=inp.value.trim();if(!name){inp.value=getCat(inp.dataset.catName).name;return;}if(state.categories.some(c=>c.id!==inp.dataset.catName&&norm(c.name)===norm(name))){toast('Категория с таким названием уже есть.');inp.value=getCat(inp.dataset.catName).name;return;}getCat(inp.dataset.catName).name=name;refreshAll();draw();});
    $$('[data-cat-delete]',root).forEach(btn=>btn.onclick=()=>{const id=btn.dataset.catDelete,c=getCat(id),affected=state.words.filter(w=>w.category===id).map(w=>w.id);let inbox=state.categories.find(c=>c.name==='Без категории'&&c.id!==id);if(!inbox){inbox={id:uid(),name:'Без категории',color:'#65748B'};state.categories.push(inbox);}state.words.forEach(w=>{if(w.category===id)w.category=inbox.id;});state.categories=state.categories.filter(c=>c.id!==id);if(dictFilters.category===id)dictFilters.category='all';if(mapCtl.category===id)mapCtl.category='all';refreshAll();draw();toast(`Категория «${c.name}» удалена, слова сохранены.`,()=>{if(!state.categories.some(x=>x.id===id))state.categories.push(c);state.words.forEach(w=>{if(affected.includes(w.id))w.category=id;});refreshAll();draw();});});};draw();
    $('#newCatForm',root).onsubmit=e=>{e.preventDefault();const name=$('#newCatName',root).value.trim();if(!name)return;if(state.categories.some(c=>norm(c.name)===norm(name))){toast('Такая категория уже есть.');return;}state.categories.push({id:uid(),name,color:$('#newCatColor',root).value});$('#newCatName',root).value='';refreshAll();draw();toast('Категория создана.');};});
}
function openSavedViews(){openModal('Сохранённые представления',`<p class="hint" style="margin-bottom:14px">Сохраняют поиск, категорию, уровень и сортировку.</p><div id="savedList"></div><form id="saveViewForm" style="display:flex;gap:8px;margin-top:18px"><input class="input" id="viewName" required maxlength="50" placeholder="Например: Слабые слова" aria-label="Название представления"><button class="btn btn-primary btn-sm" type="submit">Сохранить</button></form>`,root=>{const draw=()=>{$('#savedList',root).innerHTML=state.savedViews.length?state.savedViews.map(v=>`<div class="cat-manage-row"><button class="btn btn-ghost btn-sm" data-apply-view="${esc(v.id)}" style="flex:1;text-align:left">${icon('layers','sm')}${esc(v.name)}</button><button class="icon-btn" data-delete-view="${esc(v.id)}" aria-label="Удалить представление">${icon('trash','sm')}</button></div>`).join(''):'<div class="empty" style="padding:16px"><p>Пока нет сохранённых представлений.</p></div>';$$('[data-apply-view]',root).forEach(b=>b.onclick=()=>{const v=state.savedViews.find(x=>x.id===b.dataset.applyView);dictFilters={...v.filters};dictPage=1;closeModal();showView('words');});$$('[data-delete-view]',root).forEach(b=>b.onclick=()=>{state.savedViews=state.savedViews.filter(v=>v.id!==b.dataset.deleteView);save();renderSavedViews();draw();});};draw();$('#saveViewForm',root).onsubmit=e=>{e.preventDefault();const name=$('#viewName',root).value.trim();if(!name)return;state.savedViews.push({id:uid(),name,filters:{...dictFilters}});save();renderSavedViews();closeModal();toast('Представление сохранено.');};});}

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
    g.addEventListener('pointerdown',ev=>{ev.stopPropagation();ev.preventDefault();hideMapTooltip();const p=mapPoint(ev);mapDrag={type:'node',node,startX:p.x,startY:p.y,origX:node.bx,origY:node.by,moved:false,pointerId:ev.pointerId};svg.setPointerCapture(ev.pointerId);});
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
  const endDrag=ev=>{if(!mapDrag||ev.pointerId!==mapDrag.pointerId)return;const d=mapDrag;mapDrag=null;svg.classList.remove('panning');hideMapTooltip();if(svg.hasPointerCapture(ev.pointerId))svg.releasePointerCapture(ev.pointerId);if(d.type==='node'&&!d.moved&&ev.type==='pointerup')openDrawer(d.node.id);};
  svg.addEventListener('pointerup',endDrag);svg.addEventListener('pointercancel',endDrag);
  svg.addEventListener('wheel',ev=>{ev.preventDefault();const before=mapPoint(ev);mapCtl.zoom=clamp(mapCtl.zoom*(ev.deltaY<0?1.08:.925),.4,2.5);const z=mapCtl.zoom;mapCtl.panX=before.rawX-before.x*z-500*(1-z);mapCtl.panY=before.rawY-before.y*z-320*(1-z);applyMapTransform();},{passive:false});
}

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

