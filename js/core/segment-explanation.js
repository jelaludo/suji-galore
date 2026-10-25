const format=n=>n.toLocaleString('en-US');
const corners=['Upper left','Upper right','Lower left','Lower right'];
const segmentNames={a:'Top',b:'Upper right',c:'Lower right',d:'Bottom',e:'Lower left',f:'Upper left',g:'Middle'};
const placeName=place=>place===1?'units place':`${format(place)}s place`;

// A stroke is not always an additive unit: some notations encode a whole digit.
export function explainSegment(system,value,id){
  const [position,shape]=id.split(':');
  const index=system.id==='cistercian'?['u','t','h','k'].indexOf(position):Number(position);
  const place=system.base===1?1:system.base**(Number.isFinite(index)?Math.max(0,index):0);
  const digit=Math.floor(Math.abs(value)/place)%system.base;
  let title,detail,amount=null,equation='';
  const digitValue=()=>{
    amount=digit===0?0:digit*place*(value<0?-1:1);
    equation=`${digit} × ${format(place)}${value<0?' × (−1)':''} = ${format(amount)}`;
  };

  if(id==='stem'){
    title='Shared stem';detail='The four decimal quadrants share this stem. It adds no value by itself; a bare stem represents zero.';
  }else if(id==='negative'){
    title='Minus sign';detail='This sign makes the entire number negative. It is not a separate amount to add.';equation=`−${format(Math.abs(value))} = ${format(value)}`;
  }else if(system.base===1){
    title=system.id==='tally-sei'?`${['Top horizontal','Centre vertical','Middle horizontal','Left vertical','Bottom horizontal'][Number(shape)%5]} stroke`:'One tally mark';
    detail=`Each stroke adds 1. This is mark ${Number(shape)+1} in group ${Math.floor(Number(shape)/5)+1}; five strokes complete a group.`;amount=1;equation='1 mark = 1';
  }else if(id==='zero'||shape==='zero'||shape==='shell'){
    title=id==='zero'?'Zero':`Zero · ${placeName(place)}`;detail=id==='zero'?'The centre marker represents zero. No value is added.':`This marker keeps an empty ${placeName(place)} visible. Its contribution is zero.`;amount=0;equation=`0 × ${format(place)} = 0`;
  }else if(shape==='frame'||shape==='slot'){
    title=`${shape==='frame'?'Digit frame':'Position marker'} · ${placeName(place)}`;
    detail=`This ${shape==='frame'?'frame':'baseline tick'} adds no value by itself. ${shape==='frame'?'The lit corners':'A lit dot'} in this position ${shape==='frame'?'encode':'encodes'} ${digit}, worth ${format(digit*place)} in the total.`;
    equation=`${digit} × ${format(place)} = ${format(digit*place)}`;
  }else if(shape?.startsWith('bit')){
    const bit=Number(shape.slice(3)),weight=2**bit;
    title=system.id==='binary'?`Lit bit · ${placeName(place)}`:`${corners[bit]} · ${weight}`;
    detail=`${system.id==='binary'?'A lit bit counts as 1':`This ${system.id==='kado'?'corner':system.id==='ko'?'arc':system.id==='square-b16'?'pair of bars':'side'} counts as ${weight}`} in the ${placeName(place)}.${['ko','square-b16','rhombus-b16'].includes(system.id)?` ${index===0?'The outermost shape is units.':`This is nested place ${index+1}, counting inward.`}`:''}`;
    amount=weight*place;equation=`${weight} × ${format(place)} = ${format(amount)}`;
  }else if(system.id==='maya'||system.id==='kaktovik'){
    const five=shape.startsWith('bar')||shape.startsWith('f'),weight=five?5:1;
    title=system.id==='maya'?(five?'Five bar':'One dot'):(five?'Five stroke':'One stroke');
    detail=`This ${system.id==='maya'?(five?'bar':'dot'):'stroke'} counts as ${weight} in the ${placeName(place)}. Multiply by ${format(place)} to get its contribution to the total.`;
    amount=weight*place;equation=`${weight} × ${format(place)} = ${format(amount)}`;
  }else if(system.id==='cistercian'){
    title=`${['Upper right','Upper left','Lower right','Lower left'][index]} · ${placeName(place)}`;
    detail=`The strokes in this quadrant together encode ${digit}. This individual stroke has no fixed additive value.`;digitValue();
  }else if(system.id==='seg7'){
    title=`${segmentNames[shape]} segment · ${placeName(place)}`;
    detail=`All lit segments in this position together form the digit ${digit}. This individual segment has no fixed additive value.`;digitValue();
  }

  const remainder=amount===null?null:value-amount;
  const context=amount===null?`Total: ${format(value)}`:`${format(remainder)} ${amount<0?'−':'+'} ${format(Math.abs(amount))} = ${format(value)}`;
  return {title,detail,equation,context,amount};
}
