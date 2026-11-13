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
