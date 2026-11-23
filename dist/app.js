import {words,scenes,levels,quizzes} from './story.js';
import {icon} from './icons.js';
import {matchWords} from './match.js';

const $=s=>document.querySelector(s);
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
const dialog=$('#detail');
const lesson=$('#lesson');
function read(key,fallback){try{return JSON.parse(localStorage.getItem('kotoba.'+key))??fallback}catch{return fallback}}
function save(key,value){try{localStorage.setItem('kotoba.'+key,JSON.stringify(value))}catch{}}
let level=levels.includes(read('level',''))?read('level','Beginner'):'Beginner';
let index=0,phase='story',statuses=[],retry=null,recognizer=null,audio=null,timer=0;
let question=0,score=0,answer=null,submitted=false;
let viewed=new Set((Array.isArray(read('words',[]))?read('words',[]):[]).filter(k=>Object.hasOwn(words,k)));
const scene=()=>scenes[index];
const keys=()=>scene().you.filter(k=>words[k]);
const bank=()=>quizzes[levels.indexOf(level)];
const isAdvanced=()=>level==='Advanced';
$('#level').value=level;
function speak(id,btn){
  stopAudio();
  if(recognizer)stopRecording();
  const clip=new Audio('assets/voice/'+id+'.wav');
  audio=clip;
  clip.dataset.inDialog=String(Boolean(btn && dialog.contains(btn)));
  const end=()=>{btn?.classList.remove('playing');if(audio===clip)audio=null};
  clip.onended=end;clip.onpause=end;
  clip.play().then(()=>{if(audio===clip)btn?.classList.add('playing')}).catch(()=>{end()});
}
function stopAudio(){if(audio){const old=audio;audio=null;old.pause()}}
function hideDialog(){if(dialog.open)dialog.close()}
function modal(title,content){
  stopAudio();stopRecording();
  $('#dialogContent').innerHTML='<div class="dialogHead"><h2 id="modalTitle">'+title+'</h2><button class="iconbtn" data-close aria-label="Close">'+icon('x')+'</button></div>'+content;
  dialog.setAttribute('aria-labelledby','modalTitle');
  if(!dialog.open)dialog.showModal();
}
dialog.addEventListener('close',()=>{if(audio?.dataset.inDialog==='true')stopAudio();if(phase==='story' && statuses.length && statuses.every(v=>v==='correct'||v==='skipped'))scheduleNext()});
dialog.addEventListener('click',e=>{if(e.target===dialog&&!e.target.closest('#dialogContent'))hideDialog()});
function meaning(k){
  if(!Object.hasOwn(words,k))return;
  viewed.add(k);save('words',[...viewed]);
  const [jp,roman,definition,kana]=words[k];
  modal('Word meaning','<div class="definition"><b lang="ja">'+jp+'</b><span>'+kana+' · '+roman+'</span><p>'+definition+'</p><button class="secondary" data-sound="'+k+'">'+icon('volume')+' Hear pronunciation</button></div>');
}
function wordbook(){
  modal('Wordbook','<p class="sub">Words you’ve opened in this story.</p>'+(viewed.size?'<div class="wordlist">'+[...viewed].map(k=>'<button data-word="'+k+'"><b lang="ja">'+words[k][0]+'</b><span>'+words[k][1]+'</span></button>').join('')+'</div>':'<p>Tap any Japanese word in the conversation to add it here.</p>'));
}
function tokens(list,learner=false){
  let i=0;
  return list.map(key=>{
    if(!words[key])return '<span>'+key+'</span>';
    const state=learner?statuses[i]||'':'';
    const attrs=learner?' data-token="'+i+++'"':'';
    return '<button lang="ja" data-word="'+key+'"'+attrs+' class="token '+state+'">'+words[key][0]+'</button>';
  }).join('');
}
function path(){
  const n=phase==='story'?index:4;
  return '<section class="path"><div class="pathhead"><h2>'+icon('route')+'Story path</h2><span>'+ (phase==='story'?index+' of 4 scenes complete':'4 of 4 scenes complete')+'</span></div><ol>'+[...scenes,{title:'Story quiz',icon:'quiz'}].map((s,i)=>'<li class="'+(i<n||phase==='done'?'past':i===n?'current':'future')+'"><span class="stepicon">'+icon(i<n||phase==='done'?'check':s.icon)+'</span><span><small>'+(i===4?'FINISH':'SCENE 0'+(i+1))+'</small><b>'+s.title+'</b></span></li>').join('')+'</ol></section>';
}
function stage(){
  const s=scene();
  return '<section class="stage" aria-label="Café scene"><img class="sceneart" src="assets/'+s.image+'.webp" alt="An illustrated Japanese barista in a sunlit Tokyo café"><div class="scenetag">'+icon('film')+' Scene 0'+(index+1)+' <span>/ 04</span></div><div class="location">'+icon('pin')+' Tokyo, Japan</div><div class="dialogue"><div class="speaker"><span class="speakerlabel">'+icon('wave')+' YUI <span>·</span> BARISTA</span><button class="replay" data-sound="bar'+index+'" aria-label="Hear the barista">'+icon('volume')+'</button></div><div class="barline" lang="ja">'+tokens(s.bar)+'</div>'+(level==='Beginner'?'<div class="barrom">'+s.bRom+'</div>':'')+(!isAdvanced()?'<div class="baren">'+s.bEn+'</div>':'')+'</div></section>';
}
function response(){
  const s=scene();
  return '<section class="response"><div class="turnhead"><span class="turnchip">'+icon('mic')+' YOUR TURN</span><span class="role">Customer</span></div><h2>Read your line</h2><p class="hint">'+icon('hand')+' Tap a word to explore its meaning.</p><div class="sentence"><div class="yourline">'+tokens(s.you,true)+'<span>。</span></div>'+(level==='Beginner'?'<p class="roman">'+s.rom+'</p>':'')+(!isAdvanced()?'<p class="translation">'+s.en+'</p>':'')+'</div>'+(level==='Beginner'?'<button class="listen" data-sound="you'+index+'">'+icon('volume')+' Listen to line</button>':'')+'<div class="actions"><p id="feedback" role="status"></p><button class="primary" id="record">'+icon('mic')+' Start speaking</button><button class="skip" id="skip">Skip line '+icon('skip')+'</button></div></section>';
}
function renderStory(){lesson.innerHTML='<div class="workarea">'+stage()+response()+'</div>'+path()}
function notice(t){const p=$('#feedback');if(p)p.textContent=t}
function stopRecording(){
  if(!recognizer)return;
  const r=recognizer;recognizer=null;
  r.onresult=r.onerror=r.onend=null;
  try{r.abort()}catch{}
  recordLabel();paint();
}
function paint(temp=[]){
  document.querySelectorAll('[data-token]').forEach(el=>{
    const i=+el.dataset.token;
    el.className='token '+(temp.includes(i)?'correct':statuses[i]||'');
    el.setAttribute('aria-label',words[keys()[i]][0]+(statuses[i]?' — '+statuses[i]:''));
  });
}
function recordLabel(){
  const b=$('#record');if(!b)return;
  b.innerHTML=icon(recognizer?'wave':'mic')+' '+(recognizer?'Listening…':retry!==null?'Retry word':'Start speaking');
  b.classList.toggle('listening',!!recognizer);
  $('#skip').innerHTML=(retry===null?'Skip line':'Skip word')+' '+icon('skip');
}
function scheduleNext(){clearTimeout(timer);timer=setTimeout(()=>{if(!dialog.open)advance()},850)}
function afterFinal(){
  retry=statuses.indexOf('missed');if(retry<0)retry=null;
  paint();recordLabel();
  if(retry!==null){notice('Try just 「'+words[keys()[retry]][0]+'」 again.');return}
  notice('Line complete.');$('#record').disabled=true;$('#skip').disabled=true;scheduleNext();
}
function startRecording(){
  if(recognizer){stopRecording();notice('Microphone paused.');return}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){notice('Speech recognition is unavailable in this browser. Use Chrome for speaking practice, or skip this line.');return}
  stopAudio();
  const r=new SR();recognizer=r;r.lang='ja-JP';r.interimResults=true;r.continuous=false;r.maxAlternatives=3;
  const ids=retry===null?keys().map((_,i)=>i):[retry];
  notice(retry===null?'Read the Japanese line aloud.':'Say 「'+words[keys()[retry]][0]+'」.');recordLabel();
  r.onresult=e=>{
    if(r!==recognizer)return;
    const results=Array.from(e.results);
    const last=results.at(-1);
    const prefix=results.slice(0,-1).map(item=>item[0].transcript).join('');
    const aligned=Array.from(last).map(alt=>matchWords(ids.map(i=>keys()[i]),prefix+alt.transcript)).sort((a,b)=>b.length-a.length)[0].map(i=>ids[i]);
    paint(aligned);
    if(!last.isFinal)return;
    stopRecording();
    ids.forEach(i=>statuses[i]=aligned.includes(i)?'correct':'missed');afterFinal();
  };
  r.onerror=e=>{
    if(r!==recognizer)return;
    stopRecording();
    const msgs={'not-allowed':'Microphone access was blocked. Allow it in your browser or skip this line.','audio-capture':'No microphone was found. Connect one or skip this line.','no-speech':'No speech was heard. Tap the microphone to try again.',network:'The speech service is unavailable. Try again or skip.'};
    notice(msgs[e.error]||'Speech recognition stopped. Try again or skip.');
  };
  r.onend=()=>{if(r===recognizer){recognizer=null;paint();recordLabel();notice('No final reading received. Try again or skip.')}};
  try{r.start()}catch{stopRecording();notice('Microphone unavailable. Try again or skip.')}
}
function advance(){
  clearTimeout(timer);stopRecording();stopAudio();retry=null;statuses=[];
  if(index===scenes.length-1){phase='quiz';question=0;score=0;answer=null;submitted=false;renderQuiz();return}
  index++;renderStory();speak('bar'+index,$('[data-sound="bar'+index+'"]'));
}
function reset(){
  clearTimeout(timer);stopRecording();stopAudio();index=0;phase='story';statuses=[];retry=null;answer=null;submitted=false;renderStory();
}
function renderQuiz(){
  const q=bank()[question],jp=isAdvanced();
  const content=phase==='done'?'<div class="quizbox"><span class="turnchip">'+icon('check')+' '+(jp?'完了':'STORY COMPLETE')+'</span><h2>'+(jp?'お疲れさまでした！':'Story complete!')+'</h2><p>'+(jp?'正解数':'Quiz score')+' <b>'+score+' / '+bank().length+'</b></p><button class="primary" id="restart">'+(jp?'もう一度練習する':'Practice again')+'</button></div>':'<div class="quizbox"><span class="turnchip">'+icon('quiz')+' '+(jp?'クイズ':'STORY QUIZ')+'</span><div class="qnum">'+(jp?'問題':'Question')+' '+(question+1)+' / '+bank().length+'</div><h2>'+q.q+'</h2><div class="choices">'+(q.audio||q.choices).map((v,i)=>'<div class="choice '+(submitted&&i===q.a?'correct':submitted&&i===answer?'missed':i===answer?'selected':'')+'"><button data-choice="'+i+'" aria-pressed="'+(i===answer)+'" '+(submitted?'disabled':'')+'><span>'+String.fromCharCode(65+i)+'</span> '+(q.audio?(jp?'音声':'Recording')+' '+(i+1):v)+'</button>'+(q.audio?'<button class="preview" data-sound="quiz-'+v+'" aria-label="'+(jp?'音声を聞く':'Play recording')+' '+(i+1)+'">'+icon('volume')+'</button>':'')+'</div>').join('')+'</div><p role="status">'+(submitted?(answer===q.a?(jp?'正解です！':'Correct!'):(jp?'正解は ':'Correct answer: ')+String.fromCharCode(65+q.a)):'')+'</p><button class="primary" id="submit" '+(answer===null?'disabled':'')+'>'+(submitted?(question===bank().length-1?(jp?'結果を見る':'See results'):(jp?'次の問題':'Next question')):(jp?'答えを確認':'Check answer'))+'</button></div>';
  lesson.innerHTML='<div class="quizarea"><img src="assets/scene-5.webp" alt="A finished cup of coffee in the café">'+content+'</div>'+path();
}
lesson.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.word)meaning(b.dataset.word);
  else if(b.dataset.sound)speak(b.dataset.sound,b);
  else if(b.id==='record')startRecording();
  else if(b.id==='skip'){if(retry===null)advance();else{stopRecording();statuses[retry]='skipped';afterFinal()}}
  else if(b.id==='restart'){reset();speak('bar0')}
  else if(b.dataset.choice!==undefined&&!submitted){answer=+b.dataset.choice;renderQuiz();const clip=bank()[question].audio?.[answer];if(clip)speak('quiz-'+clip)}
  else if(b.id==='submit'){
    stopAudio();
    if(!submitted){submitted=true;if(answer===bank()[question].a)score++}
    else if(question===bank().length-1){phase='done'}
    else{question++;answer=null;submitted=false}
    renderQuiz();
  }
});
dialog.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-close'))hideDialog();
  else if(b.dataset.word)meaning(b.dataset.word);
  else if(b.dataset.sound)speak(b.dataset.sound,b)
});
$('#level').onchange=e=>{
  stopRecording();stopAudio();level=e.target.value;save('level',level);
  if(phase==='story'){renderStory();if(statuses.includes('missed'))afterFinal()}
  else{phase='quiz';question=0;score=0;answer=null;submitted=false;renderQuiz()}
};
$('#wordsNav').onclick=wordbook;
$('#practiceNav').onclick=()=>{hideDialog();window.scrollTo({top:0,behavior:'smooth'})};
$('#credits').onclick=()=>modal('Audio credits','<p>Japanese audio was synthesized with Open JTalk and the Nitech Japanese ATR503 M001 voice by Nagoya Institute of Technology and Tokyo Institute of Technology. Voice licensed under <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.</p>');
renderStory();
speak('bar0',$('[data-sound="bar0"]'));
