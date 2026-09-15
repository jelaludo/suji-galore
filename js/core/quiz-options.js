function partIds(system,value){return new Set(system.layout(value).parts.map(part=>part.id));}

export function structuralDistance(system,a,b){
  const left=partIds(system,a),right=partIds(system,b);let distance=0;
  for(const id of left)if(!right.has(id))distance++;
  for(const id of right)if(!left.has(id))distance++;
  return distance;
}

export function choiceOptions(system,target,count=4,random=Math.random){
  const wanted=partIds(system,target),ranked=[];
  for(let value=0;value<=system.quizMax;value++){
    if(value===target)continue;
    const candidate=partIds(system,value);let distance=0;
    for(const id of wanted)if(!candidate.has(id))distance++;
    for(const id of candidate)if(!wanted.has(id))distance++;
    ranked.push({value,distance,numericDistance:Math.abs(value-target),tie:random()});
  }
  ranked.sort((a,b)=>a.distance-b.distance||a.numericDistance-b.numericDistance||a.tie-b.tie||a.value-b.value);
  const options=[target,...ranked.slice(0,Math.max(0,count-1)).map(item=>item.value)];
  return options.map(value=>({value,order:random()})).sort((a,b)=>a.order-b.order).map(item=>item.value);
}
