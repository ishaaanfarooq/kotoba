import {cafe, levels} from './story.js?v=2';
import {sketchbook} from './stories/sketchbook/lesson.js?v=recorded';
import {icon} from './icons.js';

const $=s=>document.querySelector(s);
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
const dialog=$('#detail');
const lesson=$('#lesson');
function read(key,fallback){try{return JSON.parse(localStorage.getItem('kotoba.'+key))??fallback}catch{return fallback}}
function save(key,value){try{localStorage.setItem('kotoba.'+key,JSON.stringify(value))}catch{}}
let level=levels.includes(read('level',''))?read('level','Beginner'):'Beginner';
let index=0,phase='story',audio=null;
let question=0,score=0,answer=null,submitted=false;
const stories = [cafe, sketchbook];
const storySelect = $('#stories');
for (const item of stories) storySelect.add(new Option(item.title, item.id));
let story, words, scenes, viewed;
const scene = () => scenes[index];
const bank = () => story.quizzes[levels.indexOf(level)];
const wordbookKey = () => story.id === 'cafe' ? 'words' : story.id + '.words';
const twoDigits = n => String(n).padStart(2, '0');

function selectStory(id) {
  story = stories.find(item => item.id === id) || cafe;
  scenes = story.scenes;
  words = {...story.previousWords, ...story.words};
  const saved = read(wordbookKey(), []);
  viewed = new Set((Array.isArray(saved) ? saved : []).filter(key => Object.hasOwn(words, key)));
  storySelect.value = story.id;
  $('#storyNumber').textContent = 'STORY ' + twoDigits(stories.indexOf(story) + 1);
  $('#storyTitle').textContent = story.title;
  $('#storyDescription').textContent = story.description;
  document.title = story.title + ' · Kotoba';
  reset();
}

storySelect.onchange = () => {
  const url = new URL(location.href);
  url.searchParams.set('story', storySelect.value);
  history.pushState(null, '', url);
  selectStory(storySelect.value);
  playBarista();
};
window.addEventListener('popstate', () => selectStory(new URLSearchParams(location.search).get('story')));
const isAdvanced=()=>level==='Advanced';
$('#level').value=level;
function speak(id,btn){
  stopAudio();
  const extension=id==='coffee-order'?'mp3':'wav';
  const clip=new Audio(story.audioDirectory+'/'+id+'.'+extension);
  audio=clip;
  clip.dataset.inDialog=String(Boolean(btn && dialog.contains(btn)));
  const end=()=>{btn?.classList.remove('playing');if(audio===clip)audio=null};
  clip.onended=end;clip.onpause=end;
  clip.play().then(()=>{if(audio===clip)btn?.classList.add('playing')}).catch(()=>{end()});
}
function stopAudio(){if(audio){const old=audio;audio=null;old.pause()}}
function hideDialog(){if(dialog.open)dialog.close()}
function modal(title,content){
  stopAudio();
  $('#dialogContent').innerHTML='<div class="dialogHead"><h2 id="modalTitle">'+title+'</h2><button class="iconbtn" data-close aria-label="Close">'+icon('x')+'</button></div>'+content;
  dialog.setAttribute('aria-labelledby','modalTitle');
  if(!dialog.open)dialog.showModal();
}
dialog.addEventListener('close',()=>{if(audio?.dataset.inDialog==='true')stopAudio()});
dialog.addEventListener('click',e=>{if(e.target===dialog&&!e.target.closest('#dialogContent'))hideDialog()});
function meaning(k){
  if(!Object.hasOwn(words,k))return;
  viewed.add(k);save(wordbookKey(),[...viewed]);
  const [jp,roman,definition,kana]=words[k];
  const recording = Object.hasOwn(story.words, k) ? k : Object.keys(story.words).find(key =>
    story.words[key][0] === jp && story.words[key][3] === kana);
  const listen = recording ? '<button class="secondary" data-sound="'+recording+'">'+icon('volume')+' Hear pronunciation</button>' : '';
  modal('Word meaning','<div class="definition"><b lang="ja">'+jp+'</b><span>'+kana+' · '+roman+'</span><p>'+definition+'</p>'+listen+'</div>');
}
function wordbook(){
  modal('Wordbook','<p class="sub">Words you’ve opened in this story.</p>'+(viewed.size?'<div class="wordlist">'+[...viewed].map(k=>'<button data-word="'+k+'"><b lang="ja">'+words[k][0]+'</b><span>'+words[k][1]+'</span></button>').join('')+'</div>':'<p>Tap any Japanese word in the conversation to add it here.</p>'));
}
function tokens(list){
  return list.map(key=>words[key]
    ? '<button lang="ja" data-word="'+key+'" class="token">'+words[key][0]+'</button>'
    : '<span>'+key+'</span>').join('');
}
function path(){
  const count = scenes.length;
  const completed = phase === 'story' ? index : count;
  const steps = [...scenes, {title:'Story quiz', icon:'quiz'}].map((step, i) => {
    const past = i < completed || phase === 'done';
    const status = past ? 'past' : i === completed ? 'current' : 'future';
    const label = i === count ? 'FINISH' : 'SCENE ' + twoDigits(i + 1);
    return '<li class="'+status+'"><span class="stepicon">'+icon(past?'check':step.icon)+'</span><span><small>'+label+'</small><b>'+step.title+'</b></span></li>';
  });
  return '<section class="path"><div class="pathhead"><h2>'+icon('route')+'Story path</h2><span>'+completed+' of '+count+' scenes complete</span></div><ol>'+steps.join('')+'</ol></section>';
}
function stage(){
  const s=scene();
  return '<section class="stage" aria-label="Café scene"><img class="sceneart" src="'+s.image+'.webp" alt="'+(s.imageAlt || 'Yui at the café in Tokyo.')+'"><div class="scenetag">'+icon('film')+' Scene '+twoDigits(index+1)+' <span>/ '+twoDigits(scenes.length)+'</span></div><div class="location">'+icon('pin')+' Tokyo, Japan</div><div class="dialogue"><div class="speaker"><span class="speakerlabel">'+icon('wave')+' YUI <span>·</span> BARISTA</span><button class="replay" data-sound="'+s.barSound+'" aria-label="Hear the barista">'+icon('volume')+'</button></div><div class="barline" lang="ja">'+tokens(s.bar)+'</div>'+(level==='Beginner'?'<div class="barrom">'+s.bRom+'</div>':'')+(!isAdvanced()?'<div class="baren">'+s.bEn+'</div>':'')+'</div></section>';
}
function response(){
  const s=scene();
  return '<section class="response"><div class="turnhead"><span class="turnchip">'+icon('book')+' YOUR TURN</span><span class="role">Customer</span></div><h2>Read your line</h2><p class="hint">'+icon('hand')+' Tap a word to explore its meaning.</p><div class="sentence"><div class="yourline">'+tokens(s.you)+'</div>'+(level==='Beginner'?'<p class="roman">'+s.rom+'</p>':'')+(!isAdvanced()?'<p class="translation">'+s.en+'</p>':'')+'</div>'+(level==='Beginner'?'<button class="listen" data-sound="'+s.youSound+'">'+icon('volume')+' Listen to line</button>':'')+'<div class="actions"><button class="primary" id="nextLine">'+(index===scenes.length-1?'Start quiz':'Next line')+'</button></div></section>';
}
function playBarista(){speak(scene().barSound,$('.replay'))}
function renderStory(){
  $('#storyDescription').textContent = scene().context || story.description;
  lesson.innerHTML='<div class="workarea">'+stage()+response()+'</div>'+path();
}
function advance(){
  stopAudio();
  if(index===scenes.length-1){phase='quiz';question=0;score=0;answer=null;submitted=false;renderQuiz();return}
  index++;renderStory();playBarista();
}
function reset(){
  hideDialog(); stopAudio(); index=0; phase='story'; question=0; score=0; answer=null; submitted=false; renderStory();
}
function renderQuiz(){
  $('#storyDescription').textContent = story.description;
  const q=bank()[question],jp=isAdvanced();
  const content=phase==='done'?'<div class="quizbox"><span class="turnchip">'+icon('check')+' '+(jp?'完了':'STORY COMPLETE')+'</span><h2>'+(jp?'お疲れさまでした！':'Story complete!')+'</h2><p>'+(jp?'正解数':'Quiz score')+' <b>'+score+' / '+bank().length+'</b></p><button class="primary" id="restart">'+(jp?'もう一度練習する':'Practice again')+'</button></div>':'<div class="quizbox"><span class="turnchip">'+icon('quiz')+' '+(jp?'クイズ':'STORY QUIZ')+'</span><div class="qnum">'+(jp?'問題':'Question')+' '+(question+1)+' / '+bank().length+'</div><h2>'+q.q+'</h2><div class="choices">'+(q.audio||q.choices).map((v,i)=>'<div class="choice '+(submitted&&i===q.a?'correct':submitted&&i===answer?'missed':i===answer?'selected':'')+'"><button data-choice="'+i+'" aria-pressed="'+(i===answer)+'" '+(submitted?'disabled':'')+'><span>'+String.fromCharCode(65+i)+'</span> '+(q.audio?(jp?'音声':'Recording')+' '+(i+1):v)+'</button>'+(q.audio?'<button class="preview" data-sound="'+v+'" aria-label="'+(jp?'音声を聞く':'Play recording')+' '+(i+1)+'">'+icon('volume')+'</button>':'')+'</div>').join('')+'</div><p role="status">'+(submitted?(answer===q.a?(jp?'正解です！':'Correct!'):(jp?'正解は ':'Correct answer: ')+String.fromCharCode(65+q.a)):'')+'</p><button class="primary" id="submit" '+(answer===null?'disabled':'')+'>'+(submitted?(question===bank().length-1?(jp?'結果を見る':'See results'):(jp?'次の問題':'Next question')):(jp?'答えを確認':'Check answer'))+'</button></div>';
  lesson.innerHTML='<div class="quizarea"><img src="'+story.quizImage+'.webp" alt="'+story.quizAlt+'">'+content+'</div>'+path();
}
lesson.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.word)meaning(b.dataset.word);
  else if(b.dataset.sound)speak(b.dataset.sound,b);
  else if(b.id==='nextLine')advance();
  else if(b.id==='restart'){reset();playBarista()}
  else if(b.dataset.choice!==undefined&&!submitted){answer=+b.dataset.choice;renderQuiz();const clip=bank()[question].audio?.[answer];if(clip)speak(clip)}
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
  stopAudio();level=e.target.value;save('level',level);
  if(phase==='story')renderStory();
  else{phase='quiz';question=0;score=0;answer=null;submitted=false;renderQuiz()}
};
$('#wordsNav').onclick=wordbook;
$('#practiceNav').onclick=()=>{hideDialog();window.scrollTo({top:0,behavior:'smooth'})};
$('#credits').onclick=()=>modal('Audio credits',
  '<p><b>The missing sketchbook.</b> The Japanese dialogue, vocabulary, and quiz audio use recordings of the same speaker heard in the café lesson, from the University of Tokyo’s <a href="https://sites.google.com/site/shinnosuketakamichi/publication/jsut">JSUT corpus</a>. Clips are trimmed excerpts. The window-seat reply combines three recordings. Sources include BASIC5000 (0345, 0591, 0800, 1135, 1725, 2619, 4516) and TRAVEL1000 (0082, 0097, 0124, 0148, 0612, 0636, 0643, 0714, 0781), along with the café clips below. Excerpt timings use <a href="https://github.com/sarulab-speech/jsut-label">JSUT labels</a> and <a href="https://github.com/r9y9/jsut-lab">JSUT Lab</a>.</p>'+
  '<p><b>At the café.</b> The greeting is a recording by <a href="https://hinanogimaya.com/862/">Maya Hinanogi</a>. The coffee order was recorded by <a href="https://tatoeba.org/en/user/profile/huizi99">Rieko (huizi99)</a> for <a href="https://tatoeba.org/en/sentences/show/224884">Tatoeba</a> and is used under <a href="https://creativecommons.org/licenses/by-nc/4.0/">CC BY-NC 4.0</a>.</p>'+
  '<p>Other dialogue and pronunciation clips are excerpts from the <a href="https://sites.google.com/site/shinnosuketakamichi/publication/jsut">JSUT corpus</a>, University of Tokyo. The recordings were trimmed and volume-adjusted. Two replies combine excerpts from the same speaker. This private lesson uses the corpus under its personal-use terms. Commercial use requires separate permission.</p>'+
  '<p>JSUT source recordings: travel1000 (0011, 0022, 0067, 0170, 0550, 0611, 0755, 0810, 0819) and utparaphrase512 (sent124, phrase1). Travel text is adapted from English–Japanese Translation Alignment Data, <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>. The saved-word excerpts from SNOW E4 use <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> for the text.</p>');
selectStory(new URLSearchParams(location.search).get('story'));
playBarista();
