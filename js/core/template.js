const cache=new WeakMap();

export function templateFor(system){
  if(!system.composeSeeds)return null;
  if(cache.has(system))return cache.get(system);
  const parts=new Map();let w=0,h=0;
  for(const value of system.composeSeeds){const glyph=system.layout(value);w=Math.max(w,glyph.box.w);h=Math.max(h,glyph.box.h);for(const part of glyph.parts)if(!parts.has(part.id))parts.set(part.id,{...part});}
  const template={parts:[...parts.values()],box:{w,h}};
  cache.set(system,template);return template;
}

export function isStructuralPart(id){return id==='stem'||id.endsWith(':frame')||id.endsWith(':slot');}
