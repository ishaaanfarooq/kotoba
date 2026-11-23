export const words = {
  welcome: ['いらっしゃいませ','irasshaimase','Welcome! A greeting used by shop staff.','いらっしゃいませ'],
  order: ['ご注文','gochūmon','Your order. ご makes the word more polite.','ごちゅうもん'],
  topic: ['は','wa','Marks the topic of the sentence.','わ','は'],
  coffee: ['コーヒー','kōhī','Coffee. A loanword written in katakana.','こーひー','珈琲'],
  object: ['を','o','Marks what you are asking for.','お','を'],
  please: ['ください','kudasai','Please give me. Used to request an item.','ください','下さい'],
  size: ['サイズ','saizu','Size.','さいず'],
  how: ['いかが','ikaga','How? A polite way to ask about a choice.','いかが'],
  is: ['です','desu','A polite sentence ending.','です'],
  question: ['か','ka','Turns a statement into a question.','か'],
  small: ['小さい','chiisai','Small.','ちいさい'],
  one: ['の','no','Stands in for the item already being discussed.','の'],
  inside: ['店内','tennai','Inside the café or shop.','てんない'],
  at: ['で','de','Marks a location or a choice.','で'],
  alright: ['よろしい','yoroshii','All right or acceptable. A polite way to confirm.','よろしい','宜しい'],
  yes: ['はい','hai','Yes.','はい'],
  request: ['お願いします','onegaishimasu','Please. Politely asks for your chosen option.','おねがいします','お願い致します'],
  here: ['どうぞ','dōzo','Here you are. Used when offering something.','どうぞ'],
  thanks: ['ありがとう','arigatō','Thank you.','ありがとう','有難う'],
  polite: ['ございます','gozaimasu','Adds politeness to this expression of thanks.','ございます'],
};
export const scenes = [
  {title:'Place your order',icon:'cup',image:'cafe',bar:['welcome','。','order','topic','？'],bRom:'Irasshaimase. Gochūmon wa?',bEn:'Welcome! What would you like to order?',you:['coffee','object','please'],rom:'Kōhī o kudasai.',en:'Coffee, please.'},
  {title:'Choose a size',icon:'size',image:'scene-2',bar:['size','topic','how','is','question','？'],bRom:'Saizu wa ikaga desu ka?',bEn:'What size would you like?',you:['small','one','object','please'],rom:'Chiisai no o kudasai.',en:'The small one, please.'},
  {title:'For here or to go',icon:'store',image:'scene-3',bar:['inside','at','alright','is','question','？'],bRom:'Tennai de yoroshii desu ka?',bEn:'Will you be having it here?',you:['yes','、','inside','at','request'],rom:'Hai, tennai de onegaishimasu.',en:'Yes, for here, please.'},
  {title:'Say thank you',icon:'chat',image:'scene-4',bar:['coffee','is','。','here','。'],bRom:'Kōhī desu. Dōzo.',bEn:'Here’s your coffee. Enjoy!',you:['thanks','polite'],rom:'Arigatō gozaimasu.',en:'Thank you very much.'}
];
export const levels = ['Beginner','Intermediate','Advanced'];
export const quizzes = [
  [
    {q:'What does コーヒー (kōhī) mean?',choices:['Coffee','Tea','Milk'],a:0},
    {q:'How do you say ありがとう (arigatō)?',audio:['kudasai','arigatou','douzo'],read:['ください','ありがとう','どうぞ'],a:1},
    {q:'What does 小さい (chiisai) mean?',choices:['Hot','Large','Small'],a:2}
  ],[
    {q:'In 店内でお願いします, what does 店内 mean?',choices:['Inside the café','The counter','Takeaway'],a:0},
    {q:'Which reading matches ご注文?',audio:['gochuumon','gozaimasu','onegaishimasu'],read:['ごちゅうもん','ございます','おねがいします'],a:0},
    {q:'What is the customer requesting with 小さいのをください?',choices:['A smaller table','The small size','Another drink'],a:1}
  ],[
    {q:'「店内でよろしいですか」で店員が確認しているのはどれですか。',choices:['飲み物の大きさ','支払い方法','店内で飲むかどうか'],a:2},
    {q:'「ご注文は？」の読み方として正しいものを選んでください。',audio:['gochuumonwa','gochuumonga','gochuumono'],read:['ごちゅうもんわ','ごちゅうもんが','ごちゅうもんを'],a:0},
    {q:'「小さいのをください」の「の」は何を指していますか。',choices:['店内の席','注文する飲み物','店員のおすすめ'],a:1}
  ]
];
export const phrase = keys => keys.map(k=>words[k]?.[0] ?? k).join('');
