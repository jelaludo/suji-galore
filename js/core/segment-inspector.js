import {explainSegment} from './segment-explanation.js';
const NS='http://www.w3.org/2000/svg';
const inspectors=new WeakMap();
let sequence=0;
let activeHide=null;

export function inspectSegments(stage,system,value,parts,enabled){
  let inspector=inspectors.get(stage);
  if(!enabled){
    inspector?.hide();
    stage.querySelector('[data-layer="inspector"]')?.remove();
    if(inspector)stage.querySelector('svg')?.setAttribute('role','img');
    return;
  }
  if(!inspector){inspector=createInspector(stage);inspectors.set(stage,inspector);}
  inspector.update(system,value,parts);
}

function createInspector(stage){
  const tooltip=document.createElement('div');
  tooltip.className='segment-tooltip';tooltip.id=`segment-tooltip-${++sequence}`;
  tooltip.setAttribute('role','tooltip');tooltip.setAttribute('popover','manual');tooltip.hidden=true;
  const eyebrow=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('p'),equation=document.createElement('div'),context=document.createElement('div');
  eyebrow.className='segment-tooltip-eyebrow';equation.className='segment-tooltip-equation';context.className='segment-tooltip-context';
  tooltip.append(eyebrow,title,detail,equation,context);
  (stage.closest('dialog')||document.body).append(tooltip);
  let system,value,current=null,anchor=null,pointer=null,dismissed=false;
  const hits=new Map();
  function hide(){
    if(!tooltip.hidden){tooltip.hidePopover?.();tooltip.hidden=true;}
    if(current){current.removeAttribute('aria-describedby');stage.querySelector(`[data-layer="active"][data-part="${current.dataset.part}"]`)?.classList.remove('inspected-part');}
    current=null;
    if(activeHide===hide)activeHide=null;
  }
  function position(){
    const rect=anchor.getBoundingClientRect(),box=tooltip.getBoundingClientRect(),gap=16;
    const x=pointer?.x??rect.right,y=pointer?.y??rect.top;
    const left=x+gap+box.width>innerWidth-12?x-box.width-gap:x+gap;
    const top=y+gap+box.height>innerHeight-12?y-box.height-gap:y+gap;
    tooltip.style.left=`${Math.max(12,Math.min(left,innerWidth-box.width-12))}px`;
    tooltip.style.top=`${Math.max(12,Math.min(top,innerHeight-box.height-12))}px`;
  }
  function show(hit){
    if(dismissed)return;
    if(activeHide!==hide)activeHide?.();
    if(current!==hit)hide();current=hit;anchor=hit;
    activeHide=hide;
    const info=explainSegment(system,value,hit.dataset.part);
    eyebrow.textContent=`${system.name} · part of ${value.toLocaleString('en-US')}`;
    title.textContent=info.title;detail.textContent=info.detail;equation.textContent=info.equation;equation.hidden=!info.equation;context.textContent=info.context;
    hit.setAttribute('aria-describedby',tooltip.id);
    stage.querySelector(`[data-layer="active"][data-part="${hit.dataset.part}"]`)?.classList.add('inspected-part');
    tooltip.hidden=false;
    if(tooltip.showPopover&&!tooltip.matches(':popover-open'))tooltip.showPopover();
    position();
  }
  stage.addEventListener('pointerover',event=>{
    if(event.pointerType==='touch')return;
    const hit=event.target.closest('.segment-hit');if(!hit)return;
    pointer={x:event.clientX,y:event.clientY};dismissed=false;show(hit);
  });
  stage.addEventListener('pointermove',event=>{if(current&&event.pointerType!=='touch'){pointer={x:event.clientX,y:event.clientY};position();}});
  stage.addEventListener('pointerout',event=>{if(event.target===current&&!current.contains(event.relatedTarget))hide();});
  stage.addEventListener('focusin',event=>{if(event.target.matches('.segment-hit')){pointer=null;dismissed=false;show(event.target);}});
  stage.addEventListener('focusout',event=>{if(event.target===current)hide();});
  stage.addEventListener('pointerdown',()=>{dismissed=true;hide();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&current){event.preventDefault();event.stopPropagation();dismissed=true;hide();}},true);
  window.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);
  stage.closest('dialog')?.addEventListener('close',hide);
  return {hide,update(nextSystem,nextValue,parts){
    if(system!==nextSystem){hide();dismissed=false;}
    system=nextSystem;value=nextValue;
    const svg=stage.querySelector('svg');
    if(!svg){hide();hits.clear();return;}
    svg.setAttribute('role',stage.closest('button')?'img':'group');
    let layer=svg.querySelector('[data-layer="inspector"]');
    if(!layer){layer=document.createElementNS(NS,'g');layer.dataset.layer='inspector';svg.append(layer);hits.clear();}
    // Keep the targets above animated strokes without changing their geometry.
    svg.append(layer);
    const remaining=new Set(hits.keys());
    for(const part of parts){
      let hit=hits.get(part.id);
      if(!hit){hit=document.createElementNS(NS,'path');hit.classList.add('segment-hit');hit.dataset.part=part.id;hit.setAttribute('vector-effect','non-scaling-stroke');layer.append(hit);hits.set(part.id,hit);}
      remaining.delete(part.id);hit.setAttribute('d',part.d);hit.classList.toggle('filled',!!part.fill);
      if(!stage.closest('button')){hit.setAttribute('tabindex','0');hit.setAttribute('role','img');}
      const info=explainSegment(system,value,part.id);hit.setAttribute('aria-label',`${info.title}. ${info.detail} ${info.equation}. ${info.context}`);
    }
    for(const id of remaining){const hit=hits.get(id);if(current===hit)hide();hit.remove();hits.delete(id);}
    if(current)show(current);
  }};
}
