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
  which: ['どの','dono','Which. Used before a noun when asking someone to choose.','どの'],
  to: ['に','ni','Marks what someone chooses in the expression にする.','に'],
  choose: ['されます','saremasu','A respectful form of する. Here it asks what the customer will choose.','されます'],
  this: ['この','kono','This. Points to a nearby item and comes before a noun.','この'],
  large: ['大きい','ōkii','Large or big.','おおきい'],
  table: ['テーブル','tēburu','A table. Written in katakana.','てーぶる'],
};
export const scenes = [
  {title:'Place your order',icon:'cup',image:'cafe',bar:['welcome','。'],barSound:'welcome',bRom:'Irasshaimase.',bEn:'Welcome!',you:['coffee','object','please'],youSound:'coffee-order',rom:'Kōhī o kudasai.',en:'Coffee, please.'},
  {title:'Choose a size',icon:'size',image:'scene-2',bar:['which','size','to','choose','question','？'],barSound:'bar1',bRom:'Dono saizu ni saremasu ka?',bEn:'Which size would you like?',you:['this','large','one','、','request'],youSound:'you1',rom:'Kono ōkii no, onegaishimasu.',en:'This large one, please.'},
  {title:'Choose a table',icon:'store',image:'scene-3',bar:['this','table','at','alright','is','question','？'],barSound:'bar2',bRom:'Kono tēburu de yoroshii desu ka?',bEn:'Would this table be all right?',you:['yes','、','request'],youSound:'you2',rom:'Hai, onegaishimasu.',en:'Yes, please.'},
  {title:'Say thank you',icon:'chat',image:'scene-4',bar:['here','。'],barSound:'here',bRom:'Dōzo.',bEn:'Here you are.',you:['thanks','polite'],youSound:'you3',rom:'Arigatō gozaimasu.',en:'Thank you very much.'}
];
export const levels = ['Beginner','Intermediate','Advanced'];
export const quizzes = [
  [
    {q:'What does コーヒー (kōhī) mean?',choices:['Coffee','Tea','Milk'],a:0},
    {q:'How do you say ありがとう (arigatō)?',audio:['please','thanks','here'],a:1},
    {q:'What does 大きい (ōkii) mean?',choices:['Hot','Small','Large'],a:2}
  ],[
    {q:'In この大きいの、お願いします, what does 大きい describe?',choices:['The size of the drink','The price of the drink','The location of the café'],a:0},
    {q:'Which recording says お願いします?',audio:['request','polite','alright'],a:0},
    {q:'What does the barista offer with このテーブルでよろしいですか？',choices:['Another drink','A place to sit','A takeaway cup'],a:1}
  ],[
    {q:'「このテーブルでよろしいですか」で、店員は何を確認していますか。',choices:['飲み物の大きさ','支払い方法','お客様の席'],a:2},
    {q:'「よろしい」の読み方として正しいものを選んでください。',audio:['alright','large','how'],a:0},
    {q:'「この大きいの」の「の」は何を指していますか。',choices:['店内の席','注文する飲み物','店員のおすすめ'],a:1}
  ]
];
