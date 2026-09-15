import {systems} from '../js/systems/index.js';
import {parseNumber} from '../js/core/numbers.js';
export function runTests(){
  let checks=0;const assert=(condition,message)=>{checks++;if(!condition)throw new Error(message);};
  for(const [text,want] of [['0',0],['0xFF',255],['-0b11',-3],['+42',42],['',null],['1e3',null],['2.2',null],['9999999999999999',null]])assert(parseNumber(text)===want,`Parse ${text}`);
  for(const s of systems){const seen=new Set();const values=s.max<=10000?Array.from({length:s.max+1},(_,i)=>i):Array.from({length:5000},(_,i)=>(i*7919)%1000000);values.push(s.max,0);if(s.min<0)values.push(-1,s.min,-100);
    for(const n of new Set(values)){const a=s.layout(n),ids=a.parts.map(p=>p.id);assert(s.canRender(n),`${s.id} range ${n}`);assert(JSON.stringify(a)===JSON.stringify(s.layout(n)),`${s.id} deterministic ${n}`);assert(ids.length===new Set(ids).size,`${s.id} duplicate parts ${n}`);assert(s.decode(ids)===n,`${s.id} decode ${n}`);const key=ids.sort().join('|');assert(!seen.has(key),`${s.id} collision ${n}`);seen.add(key);assert(a.parts.every(p=>!p.d.includes('NaN')),`${s.id} geometry ${n}`);}
    assert(!s.canRender(s.max+1)&&!s.canRender(s.min-1)&&!s.canRender(.5),`${s.id} boundaries`);
  }
  const c=systems[0];assert(c.layout(9999).parts.length===13,'Cistercian 9999 has 12 strokes and stem');
  assert(c.layout(1993).parts.map(p=>p.id).sort().join(',')==='h:a,h:b,h:e,k:a,stem,t:a,t:b,t:e,u:c','Cistercian 1993');
  const k=systems.find(s=>s.id==='kado');assert(k.layout(3).parts.filter(p=>p.fill).length===2,'Kado 3 has two corners');
  const binary=systems.find(s=>s.id==='binary');assert(binary.layout(15).parts.filter(p=>p.fill).length===4&&binary.layout(16).parts.filter(p=>p.fill).length===1,'Binary carry changes active mass');
  return `${checks.toLocaleString()} checks passed across ${systems.length} systems.`;
}
if(typeof document==='undefined')console.log(runTests());
