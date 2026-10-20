import {questions} from './questions.mjs?v=20261020-daypo1';
import {shuffle} from './engine.mjs?v=20261020-daypo1';

export const PRACTICE_KEY='s2ktux-lpic-daypo-practice-v1';
export const LEGACY_KEY='s2ktux-practice-progress-v1:lpic-1';
export function hasAnswer(value){return typeof value==='number'||typeof value==='string'&&value.trim()!==''||Array.isArray(value)&&value.length>0;}
export function practiceState(code,saved,legacy={}, {fresh=false}={}){
 const pool=questions.filter(q=>q.exam===code),valid=new Set(pool.map(q=>q.id));
 const ordered=!fresh&&Array.isArray(saved?.ids)&&saved.ids.length===valid.size&&new Set(saved.ids).size===valid.size&&saved.ids.every(id=>valid.has(id));
 const ids=ordered?[...saved.ids]:shuffle(pool.map(q=>q.id));
 const answers={},checks={};
 for(const q of pool){
  const value=saved?.answers?.[q.id];
  if(q.type==='written'&&typeof value==='string')answers[q.id]=value;
  if(q.type==='single'&&Number.isInteger(value)&&q.choices[value]!==undefined)answers[q.id]=value;
  if(q.type==='multiple'&&Array.isArray(value)&&value.every(n=>Number.isInteger(n)&&q.choices[n]!==undefined))answers[q.id]=[...new Set(value)];
  const state=saved&&typeof saved==='object'?saved.checks?.[q.id]:legacy?.[q.id]?.state;
  if(['passed','failed'].includes(state))checks[q.id]=state;
 }
 return {ids,index:ordered&&Number.isInteger(saved.index)?Math.min(ids.length-1,Math.max(0,saved.index)):0,answers,checks};
}
export function practiceStatus(state,id){return state.checks[id]||(hasAnswer(state.answers[id])?'answered':'pending');}
