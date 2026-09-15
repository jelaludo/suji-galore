const NS='http://www.w3.org/2000/svg';
const reduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
export function render(stage,system,value,{skin='nixie',explain=false}={}) {
  stage.dataset.skin=skin;
  stage.classList.toggle('explaining',explain);
  if(!system.canRender(value)) {stage.replaceChildren();const p=document.createElement('p');p.className='reason';p.textContent=value<system.min?'No negative values':`Range: ${system.min}–${system.max.toLocaleString()}`;stage.append(p);return null;}
  const next=system.layout(value);let svg=stage.querySelector('svg');
  if(!svg){stage.replaceChildren();svg=document.createElementNS(NS,'svg');svg.setAttribute('role','img');stage.append(svg);}
  svg.setAttribute('aria-label',`${value} in ${system.name}`);
  svg.setAttribute('viewBox',`-6 -6 ${next.box.w+12} ${next.box.h+12}`);
  const old=new Map([...svg.children].map(el=>[el.dataset.part,el]));
  for(const part of next.parts){let el=old.get(part.id);const added=!el;
    if(!el){el=document.createElementNS(NS,'path');el.dataset.part=part.id;svg.append(el);}
    old.delete(part.id);el.setAttribute('d',part.d);el.setAttribute('class',`part group-${part.group}${part.fill?' filled':''}`);el.setAttribute('vector-effect','non-scaling-stroke');
    if(added&&!reduced()&&el.animate)el.animate([{opacity:0},{opacity:1}],{duration:180});
  }
  for(const el of old.values())el.remove();
  return next;
}
