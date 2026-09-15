import { digits, MAX } from '../core/numbers.js';
const line = (id, x1, y1, x2, y2, group = 0) => ({ id, d: `M${x1},${y1}L${x2},${y2}`, group });
const path = (id, d, group = 0, fill = false) => ({ id, d, group, fill });
const layout = (parts, w, h, groups) => ({ parts, box: { w, h }, groups });
const strokes = ['', 'a', 'b', 'c', 'd', 'ad', 'e', 'ae', 'be', 'abe'];
const geometry = { a: [0,0,1,0], b: [0,1,1,1], c: [0,0,1,1], d: [0,1,1,0], e: [1,0,1,1] };
const segments = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
const segGeometry = { a:[0,0,1,0],b:[1,0,1,1],c:[1,1,1,2],d:[0,2,1,2],e:[0,1,0,2],f:[0,0,0,1],g:[0,1,1,1] };
function system(spec) {
  return { min:0, max:MAX, ...spec, canRender(n) { return Number.isInteger(n) && n >= this.min && n <= this.max; } };
}
export const systems = [
  system({id:'cistercian',name:'Cistercian',ja:'シトー会数字',base:10,max:9999,origin:'Historical',structure:'Quadrant',
    quizMax:9999,composeMax:9999,composeSeeds:[0,1,2,3,4,5,6,7,8,9,10,20,30,40,50,60,70,80,90,100,200,300,400,500,600,700,800,900,1000,2000,3000,4000,5000,6000,7000,8000,9000],
    description:'Four decimal places share one stem. Read units at the upper right, tens at the upper left, hundreds at the lower right, and thousands at the lower left. A bare stem represents zero in this playground.',
    source:'https://github.com/kai-denrei/CistercianWeave/blob/main/src/cistercian/digitMap.js',
    layout(n){ const parts=[line('stem',50,10,50,130)]; const groups=[];
      ['u','t','h','k'].forEach((p,i)=>{const digit=Math.floor(n/10**i)%10;groups.push(`${digit} × ${10**i}`);for(const s of strokes[digit]){const g=geometry[s]; const x=v=>50+(i%2?-1:1)*v*40;const y=v=>i>=2?130-v*40:10+v*40;parts.push(line(`${p}:${s}`,x(g[0]),y(g[1]),x(g[2]),y(g[3]),i));}});
      return layout(parts,100,140,groups); },
    decode(ids){return ['u','t','h','k'].reduce((n,p,i)=>n+10**i*strokes.indexOf(ids.filter(id=>id.startsWith(p+':')).map(id=>id.split(':')[1]).sort().join('')),0);}
  }),
  // VERIFY: geometry is an original straight-stroke interpretation checked against
  // the supplied 0–19 reference sheet and Unicode's non-prescriptive U+1D2C0 chart.
  system({id:'kaktovik',name:'Kaktovik',ja:'イヌピアック数字',base:20,origin:'Unicode',structure:'Cumulative positional',
    quizMax:399,composeMax:19,composeSeeds:Array.from({length:20},(_,i)=>i),
    description:'A base-20 system organized around groups of five. Up to three upper strokes count fives; the lower zigzag counts ones. Inside a digit, counting from 0 to 19 reveals arithmetic through added strokes. Multiple digits read from left to right.',
    source:'https://www.unicode.org/charts/PDF/U1D2C0.pdf',
    layout(n){const ds=digits(n,20),parts=[],groups=[];ds.forEach((d,i)=>{const x=(ds.length-1-i)*112+6;const f=Math.floor(d/5),o=d%5;
      if(d===0)parts.push(path(`${i}:zero`,`M${x+50},31C${x+31},40 ${x+31},68 ${x+48},76C${x+66},83 ${x+77},60 ${x+63},48M${x+48},48L${x+72},30`,0));
      const five=f===1?[[15,28,82,10]]:[[15,10,82,27],[82,27,15,44],[15,44,82,61]];for(let j=0;j<f;j++){const g=five[j];parts.push(line(`${i}:f${j+1}`,x+g[0],g[1],x+g[2],g[3],0));}
      const [unitX,unitY]=f===0?[28,10]:f===1?[15,28]:[15,44],unitReturnY=f===0?12:unitY+9;
      const one=[[unitX,unitY,38,108],[38,108,62,unitReturnY],[62,unitReturnY,78,108],[78,108,94,unitReturnY]];for(let j=0;j<o;j++){const g=one[j];parts.push(line(`${i}:o${j+1}`,x+g[0],g[1],x+g[2],g[3],1));}
      groups.push(`${d} × ${20**i} · ${f} fives + ${o}`);});return layout(parts,ds.length*112,112,groups);},
    decode(ids){let n=0;const positions=new Set(ids.map(id=>Number(id.split(':')[0])));if(!positions.size)return NaN;for(const i of positions){const own=ids.filter(id=>id.startsWith(`${i}:`));const d=own.some(id=>id.endsWith(':zero'))?0:own.filter(id=>/:f\d$/.test(id)).length*5+own.filter(id=>/:o\d$/.test(id)).length;n+=d*20**i;}return n;}
  }),
  // VERIFY: the shell is an original minimal symbol; proportions should receive human review.
  system({id:'maya',name:'Maya',ja:'マヤ数字',base:20,origin:'Historical',structure:'Vertical stack',
    quizMax:399,
    description:'Dots mean one, bars mean five, and a shell marks zero. Base-20 places stack vertically with the largest place on top. This playground uses the regular arithmetic form; the calendar variation is reserved for a later experiment.',
    source:'https://www.unicode.org/charts/PDF/U1D2E0.pdf',
    layout(n){const ds=digits(n,20),parts=[],groups=[];ds.forEach((d,i)=>{const y=(ds.length-1-i)*78+4,bars=Math.floor(d/5),dots=d%5;
      if(d===0){parts.push(path(`${i}:shell`,`M22,${y+46}C28,${y+25} 72,${y+25} 78,${y+46}C70,${y+61} 30,${y+61} 22,${y+46}ZM32,${y+44}Q50,${y+32} 68,${y+44}Q50,${y+53} 32,${y+44}`,0));}
      for(let j=0;j<bars;j++)parts.push(line(`${i}:bar${j+1}`,20,y+64-j*11,80,y+64-j*11,0));
      const start=50-(dots-1)*9;for(let j=0;j<dots;j++)parts.push(path(`${i}:dot${j+1}`,`M${start+j*18-4},${y+18}a4,4 0 1,0 8,0a4,4 0 1,0 -8,0`,1,true));
      groups.push(`${d} × ${20**i} · ${bars} bars + ${dots} dots`);});return layout(parts,100,ds.length*78,groups);},
    decode(ids){let n=0;const positions=new Set(ids.map(id=>Number(id.split(':')[0])));for(const i of positions){const own=ids.filter(id=>id.startsWith(`${i}:`));n+=(own.some(id=>id.endsWith(':shell'))?0:own.filter(id=>/:bar\d$/.test(id)).length*5+own.filter(id=>/:dot\d$/.test(id)).length)*20**i;}return n;}
  }),
  system({id:'seg7',name:'Seven-segment',ja:'七セグメント',base:10,min:-MAX,origin:'Modern',structure:'Segments',
    quizMax:999,
    description:'The familiar control: seven reusable segments form each decimal digit. Its shape changes are learned rather than proportional to quantity. Compare the almost-empty 1 with the fully lit 8.',source:'https://en.wikipedia.org/wiki/Seven-segment_display',
    layout(n){const ds=digits(Math.abs(n),10),parts=[],groups=[];ds.forEach((d,i)=>{const x=(ds.length-1-i)*75+12;groups.push(`${d} × ${10**i}`);for(const s of segments[d]){const g=segGeometry[s];parts.push(line(`${i}:${s}`,x+g[0]*45,12+g[1]*52,x+g[2]*45,12+g[3]*52,i%4));}});if(n<0){for(const p of parts)p.d=p.d.replace(/([ML])([\d.]+),/g,(_,c,x)=>c+(Number(x)+60)+',');parts.push(line('negative',5,64,40,64));}return layout(parts,ds.length*75+(n<0?60:0),128,groups);},
    decode(ids){const count=Math.max(...ids.filter(x=>x!=='negative').map(x=>Number(x.split(':')[0])))+1;let n=0;for(let i=0;i<count;i++)n+=10**i*segments.indexOf(ids.filter(x=>x.startsWith(i+':')).map(x=>x.split(':')[1]).sort().join(''));return ids.includes('negative')?-n:n;}
  }),
  system({id:'kado',name:'Kado',ja:'角 · corner bits',base:16,origin:'Invented',structure:'Corners',
    quizMax:15,composeMax:15,composeSeeds:Array.from({length:16},(_,i)=>i),
    description:'Each square holds four bits: upper left = 1, upper right = 2, lower left = 4, lower right = 8. Add the lit corners. Multiple squares read like hexadecimal digits, most significant on the left. Zero is an empty frame.',source:null,
    layout(n){const ds=digits(n,16),parts=[],groups=[];ds.forEach((d,i)=>{const x=(ds.length-1-i)*110+5;parts.push(path(`${i}:frame`,`M${x},5h90v90h-90Z`,i%4));const shapes=[`M${x},5h45l-45,45Z`,`M${x+90},5v45l-45,-45Z`,`M${x},95v-45l45,45Z`,`M${x+90},95h-45l45,-45Z`];for(let b=0;b<4;b++)if(d&(1<<b))parts.push(path(`${i}:bit${b}`,shapes[b],b,true));groups.push(`${d} × ${16**i}`);});return layout(parts,ds.length*110,100,groups);},
    decode(ids){return ids.reduce((n,id)=>{const m=id.match(/^(\d+):bit(\d)$/);return n+(m?16**Number(m[1])*2**Number(m[2]):0);},0);}
  }),
  system({id:'ko',name:'Ko',ja:'弧 · arc bits',base:16,origin:'Invented',structure:'Concentric',
    quizMax:15,
    description:'Each ring holds a hexadecimal digit. The outermost ring is the units place; each step inward multiplies by 16. Arc weights: upper left 1, upper right 2, lower left 4, lower right 8. A short radial tick at the top marks an empty ring; zero alone is a centre dot.',source:null,
    layout(n){if(n===0)return layout([path('zero','M79,80a1,1 0 1,0 2,0a1,1 0 1,0 -2,0',0,true)],160,160,['0']);const ds=digits(n,16),parts=[],groups=[];ds.forEach((d,i)=>{const r=70-i*12;const arc=[`M${80-r},80A${r},${r} 0 0,1 80,${80-r}`,`M80,${80-r}A${r},${r} 0 0,1 ${80+r},80`,`M80,${80+r}A${r},${r} 0 0,1 ${80-r},80`,`M${80+r},80A${r},${r} 0 0,1 80,${80+r}`];for(let b=0;b<4;b++)if(d&(1<<b))parts.push(path(`${i}:bit${b}`,arc[b],b));if(!d)parts.push(line(`${i}:zero`,80,80-r-2,80,80-r+2,i%4));groups.push(`${d} × ${16**i}${i===0?' · outer':''}`);});return layout(parts,160,160,groups);},
    decode(ids){return systems.find(s=>s.id==='kado').decode(ids);}
  }),
  system({id:'tally-gate',name:'Tally',ja:'五本の束 · groups of five',base:1,max:200,origin:'Historical',structure:'Cumulative',
    quizMax:50,
    description:'Four upright strokes, then a diagonal fifth. Every added mark contributes one. Groups wrap after fifty, making growth visible while giving up compactness. Zero is shown as an empty field.',source:'https://en.wikipedia.org/wiki/Tally_marks',
    layout(n){const parts=[];for(let i=0;i<n;i++){const group=Math.floor(i/5),bit=i%5,x=(group%10)*36+5,y=Math.floor(group/10)*46+8;parts.push(bit===4?line(`mark:${i}`,x-2,y+29,x+26,y+1,group%4):line(`mark:${i}`,x+bit*7,y,x+bit*7,y+30,group%4));}return layout(parts,Math.max(36,Math.min(10,Math.ceil(n/5))*36),Math.max(46,Math.ceil(n/50)*46),[`${Math.floor(n/5)} groups of 5 + ${n%5}`]);},decode(ids){return ids.length;}
  }),
  system({id:'tally-sei',name:'Sei tally',ja:'正の字',base:1,max:200,origin:'Historical',structure:'Stroke order',
    quizMax:20,composeMax:9,composeSeeds:Array.from({length:10},(_, i)=>i),
    description:'The five strokes of 正 form one group of five in canonical writing order: top horizontal, centre vertical, middle horizontal, left vertical, then bottom horizontal. A partial character preserves the history of the count.',source:'https://en.wikipedia.org/wiki/Tally_marks',
    layout(n){const parts=[];for(let i=0;i<n;i++){const cell=Math.floor(i/5),s=i%5,x=(cell%10)*48+5,y=Math.floor(cell/10)*55+4;const strokesSei=[[6,5,38,5],[23,3,23,43],[23,24,39,24],[7,17,7,43],[5,43,41,43]];const g=strokesSei[s];parts.push(line(`mark:${i}`,x+g[0],y+g[1],x+g[2],y+g[3],s%4));}return layout(parts,Math.max(48,Math.min(10,Math.ceil(n/5))*48),Math.max(55,Math.ceil(n/50)*55),[`${Math.floor(n/5)} complete 正 + ${n%5} strokes`]);},decode(ids){return ids.length;}
  }),
  system({id:'binary',name:'Binary',ja:'二進数 · powers of two',base:2,origin:'Modern',structure:'Bit row',
    quizMax:63,
    description:'Lit positions are powers of two, starting at 1 on the right. A small baseline tick keeps every zero position visible. Watch 15 become 16: four lit bits disappear as the next power switches on.',source:'https://en.wikipedia.org/wiki/Binary_number',
    layout(n){const ds=digits(n,2),parts=[],groups=[];ds.forEach((d,i)=>{const x=(ds.length-1-i)*25+12;parts.push(line(`${i}:slot`,x-3,36,x+3,36,i%4));if(d)parts.push(path(`${i}:bit0`,`M${x-6},20a6,6 0 1,0 12,0a6,6 0 1,0 -12,0`,i%4,true));groups.push(`${d} × ${2**i}`);});return layout(parts,ds.length*25,48,groups);},decode(ids){return ids.reduce((n,id)=>n+(id.endsWith(':bit0')?2**Number(id.split(':')[0]):0),0);}
  })
];
