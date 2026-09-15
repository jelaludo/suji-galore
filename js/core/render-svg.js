import {templateFor} from './template.js';
import {carryDelay} from './transition.js';
const NS='http://www.w3.org/2000/svg';
const reduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function animateIn(el,skin,delay){if(reduced()||!el.animate)return;let frames=[{opacity:0},{opacity:1}];
  if(!el.classList.contains('filled')){try{const len=el.getTotalLength();el.style.strokeDasharray=String(len);frames=[{opacity:0,strokeDashoffset:len},{opacity:1,strokeDashoffset:0}];}catch{}}
  const clear=()=>{el.style.strokeDasharray='';el.style.strokeDashoffset='';};el.animate(frames,{duration:skin==='nixie'?240:200,delay,easing:'ease-out',fill:'backwards'}).finished.then(clear,clear);
}
function animateOut(el,skin,delay){const clone=el.cloneNode(true);clone.removeAttribute('data-layer');el.after(clone);el.remove();if(reduced()||!clone.animate){clone.remove();return;}
  let frames=skin==='nixie'?[{opacity:1},{opacity:.55,offset:.45},{opacity:0,filter:'blur(4px)'}]:[{opacity:1},{opacity:0,strokeDashoffset:40}];
  const remove=()=>clone.remove();clone.animate(frames,{duration:skin==='nixie'?340:220,delay,easing:'ease-in',fill:'forwards'}).finished.then(remove,remove);
}
export function render(stage,system,value,{skin='nixie',explain=false}={}) {
  stage.dataset.skin=skin;
  stage.classList.toggle('explaining',explain);
  if(!system.canRender(value)) {stage.replaceChildren();const p=document.createElement('p');p.className='reason';p.textContent=value<system.min?'No negative values':`Range: ${system.min}–${system.max.toLocaleString()}`;stage.append(p);return null;}
  const next=system.layout(value);const previous=Number(stage.dataset.value);stage.dataset.value=String(value);let svg=stage.querySelector('svg');
  if(!svg){stage.replaceChildren();svg=document.createElementNS(NS,'svg');svg.setAttribute('role','img');stage.append(svg);}
  svg.setAttribute('aria-label',`${value} in ${system.name}`);
  svg.setAttribute('viewBox',`-6 -6 ${next.box.w+12} ${next.box.h+12}`);
  let ghost=svg.querySelector(':scope > g[data-layer="ghost"]');if(!ghost){ghost=document.createElementNS(NS,'g');ghost.dataset.layer='ghost';svg.prepend(ghost);}
  ghost.replaceChildren();const template=templateFor(system);if(template&&template.box.w===next.box.w&&template.box.h===next.box.h){for(const part of template.parts){const el=document.createElementNS(NS,'path');el.setAttribute('d',part.d);el.setAttribute('class',`part ghost group-${part.group}${part.fill?' filled':''}`);el.setAttribute('vector-effect','non-scaling-stroke');ghost.append(el);}}
  const old=new Map([...svg.querySelectorAll(':scope > [data-layer="active"]')].map(el=>[el.dataset.part,el]));
  for(const part of next.parts){let el=old.get(part.id);const added=!el;
    if(!el){el=document.createElementNS(NS,'path');el.dataset.part=part.id;el.dataset.layer='active';svg.append(el);}
    old.delete(part.id);const changed=!added&&el.getAttribute('d')!==part.d;el.setAttribute('d',part.d);el.setAttribute('class',`part active-part group-${part.group}${part.fill?' filled':''}`);el.setAttribute('vector-effect','non-scaling-stroke');
    const delay=carryDelay(part.id,previous,value);if(added)animateIn(el,skin,delay);else if(changed&&!reduced()&&el.animate)el.animate([{opacity:.55},{opacity:1}],{duration:180,delay});
  }
  for(const el of old.values())animateOut(el,skin,carryDelay(el.dataset.part,previous,value));
  return next;
}
