import {systems} from '../js/systems/index.js';
import {parseNumber} from '../js/core/numbers.js';
import {diffParts,carryDelay} from '../js/core/transition.js';
import {templateFor} from '../js/core/template.js';
import {choiceOptions,structuralDistance} from '../js/core/quiz-options.js';
export function runTests(){
  let checks=0;const assert=(condition,message)=>{checks++;if(!condition)throw new Error(message);};
  for(const [text,want] of [['0',0],['0xFF',255],['-0b11',-3],['+42',42],['',null],['1e3',null],['2.2',null],['9999999999999999',null]])assert(parseNumber(text)===want,`Parse ${text}`);
  for(const s of systems){const seen=new Set();const values=s.max<=10000?Array.from({length:s.max+1},(_,i)=>i):Array.from({length:5000},(_,i)=>(i*7919)%1000000);values.push(s.max,0);if(s.min<0)values.push(-1,s.min,-100);
    for(const n of new Set(values)){const a=s.layout(n),ids=a.parts.map(p=>p.id);assert(s.canRender(n),`${s.id} range ${n}`);assert(JSON.stringify(a)===JSON.stringify(s.layout(n)),`${s.id} deterministic ${n}`);assert(ids.length===new Set(ids).size,`${s.id} duplicate parts ${n}`);assert(s.decode(ids)===n,`${s.id} decode ${n}`);const key=ids.sort().join('|');assert(!seen.has(key),`${s.id} collision ${n}`);seen.add(key);assert(a.parts.every(p=>!p.d.includes('NaN')),`${s.id} geometry ${n}`);}
    assert(!s.canRender(s.max+1)&&!s.canRender(s.min-1)&&!s.canRender(.5),`${s.id} boundaries`);
    if(s.composeSeeds){const ids=new Set(templateFor(s).parts.map(p=>p.id));for(let n=0;n<=s.composeMax;n++)assert(s.layout(n).parts.every(p=>ids.has(p.id)),`${s.id} compose template covers ${n}`);}
  }
  const c=systems[0];assert(c.layout(9999).parts.length===13,'Cistercian 9999 has 12 strokes and stem');
  assert(c.layout(1993).parts.map(p=>p.id).sort().join(',')==='h:a,h:b,h:e,k:a,stem,t:a,t:b,t:e,u:c','Cistercian 1993');
  const k=systems.find(s=>s.id==='kado');assert(k.layout(3).parts.filter(p=>p.fill).length===2,'Kado 3 has two corners');
  assert(c.composeSeeds&&c.composeMax===9999,'Cistercian supports the complete single-glyph Build study');
  const quarter=systems.find(s=>s.id==='ko');assert(quarter.name==='Quarter-Circle B16'&&quarter.composeMax===15,'Quarter-Circle B16 supports Build study');assert(quarter.layout(15).parts.length===4&&quarter.decode(quarter.layout(15).parts.map(p=>p.id))===15,'Quarter-Circle B16 complete ring is 15');assert(Number.isNaN(quarter.decode(['zero','0:bit0'])),'Quarter-Circle B16 rejects zero mixed with active arcs');
  const binary=systems.find(s=>s.id==='binary');assert(binary.layout(15).parts.filter(p=>p.fill).length===4&&binary.layout(16).parts.filter(p=>p.fill).length===1,'Binary carry changes active mass');
  const kaktovik=systems.find(s=>s.id==='kaktovik');assert(kaktovik.layout(19).parts.map(p=>p.id).sort().join(',')==='0:f1,0:f2,0:f3,0:o1,0:o2,0:o3,0:o4','Kaktovik 19 has 3 five strokes and 4 one strokes');assert(kaktovik.layout(20).parts.map(p=>p.id).sort().join(',')==='0:zero,1:o1','Kaktovik 20 is [1][0]');
  const coords=part=>[...part.d.matchAll(/-?\d+(?:\.\d+)?/g)].map(m=>Number(m[0])),partFor=(n,id)=>kaktovik.layout(n).parts.find(p=>p.id===id);
  const ten=coords(partFor(10,'0:f1'));assert(ten[0]<ten[2]&&coords(partFor(10,'0:f2'))[0]>coords(partFor(10,'0:f2'))[2],'Kaktovik 10 points right');
  for(const [small,big] of [[5,10],[10,15]]){const a=kaktovik.layout(small).parts,b=kaktovik.layout(big).parts;assert(a.every(p=>partFor(big,p.id)?.d===p.d)&&b.length===a.length+1,`Kaktovik ${big} preserves ${small} and adds one five-stroke above`);}
  for(const n of [6,11,16]){const fp=coords(partFor(n,'0:f1')),op=coords(partFor(n,'0:o1'));assert(fp.slice(0,2).join(',')===op.slice(0,2).join(','),`Kaktovik ${n} joins its five and one components`);}
  assert(coords(partFor(1,'0:o1'))[1]===coords(partFor(16,'0:o1'))[1],'Kaktovik unit strokes stay in the lower region');
  const choices=choiceOptions(kaktovik,17,4,()=>.5);assert(choices.length===4&&new Set(choices).size===4&&choices.includes(17),'Choice quiz returns one target and three unique distractors');assert(choices.filter(n=>n!==17).every(n=>structuralDistance(kaktovik,17,n)===1),'Kaktovik distractors are nearest structural neighbours');
  const maya=systems.find(s=>s.id==='maya');assert(maya.layout(19).parts.filter(p=>p.id.includes(':bar')).length===3&&maya.layout(19).parts.filter(p=>p.id.includes(':dot')).length===4,'Maya 19 has 3 bars and 4 dots');
  const sei=systems.find(s=>s.id==='tally-sei');assert(sei.layout(7).parts.length===7&&sei.decode(sei.layout(7).parts.map(p=>p.id))===7,'Sei tally preserves stroke count');
  const transition=diffParts(c.layout(1999),c.layout(2000));assert(transition.added.join(',')==='k:b'&&transition.removed.length===10&&transition.kept.join(',')==='stem','Cistercian 1999 to 2000 diff');assert(carryDelay('h:a',1999,2000)===80&&carryDelay('u:a',1999,2000)===0,'Carry delay is least significant first');
  return `${checks.toLocaleString()} checks passed across ${systems.length} systems.`;
}
if(typeof document==='undefined')console.log(runTests());
