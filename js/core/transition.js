const placeNames={u:0,t:1,h:2,k:3};
export function placeOf(id){const prefix=id.split(':')[0];if(/^\d+$/.test(prefix))return Number(prefix);return placeNames[prefix]??0;}
export function diffParts(previous,next){const before=new Set(previous.parts.map(part=>part.id)),after=new Set(next.parts.map(part=>part.id));return{added:[...after].filter(id=>!before.has(id)),removed:[...before].filter(id=>!after.has(id)),kept:[...after].filter(id=>before.has(id))};}
export function carryDelay(id,previousValue,nextValue){return Number.isInteger(previousValue)&&Math.abs(nextValue-previousValue)===1?placeOf(id)*40:0;}
