import {words} from './story.js';
const normalize = text => text.normalize('NFKC').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96)).replace(/[\s\p{P}]/gu,'');
// Align entire words in order, allowing a missed word in the middle of a line.
export function matchWords(keys, transcript) {
  const text = normalize(transcript);
  if(keys.length===1){
    const entry=words[keys[0]];
    return [entry[0],...entry.slice(3)].some(form=>normalize(form)===text)?[0]:[];
  }
  const cache = new Map();
  function align(i, pos) {
    if(i===keys.length)return {score:0,matched:[]};
    const key=i+','+pos;
    if(cache.has(key))return cache.get(key);
    let best=align(i+1,pos);
    const word=words[keys[i]];
    for(const form of new Set([word[0],...word.slice(3)].map(normalize))){
      const at=text.indexOf(form,pos);
      if(at<0)continue;
      const next=align(i+1,at+form.length);
      const score=next.score+form.length;
      if(score>best.score)best={score,matched:[i,...next.matched]};
    }
    cache.set(key,best);
    return best;
  }
  return align(0,0).matched;
}
