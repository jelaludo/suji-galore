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
    description:'Four decimal places share one stem. Read units at the upper right, tens at the upper left, hundreds at the lower right, and thousands at the lower left. A bare stem represents zero in this playground.',
    source:'https://github.com/kai-denrei/CistercianWeave/blob/main/src/cistercian/digitMap.js',
    layout(n){ const parts=[line('stem',50,10,50,130)]; const groups=[];
      ['u','t','h','k'].forEach((p,i)=>{const digit=Math.floor(n/10**i)%10;groups.push(`${digit} × ${10**i}`);for(const s of strokes[digit]){const g=geometry[s]; const x=v=>50+(i%2?-1:1)*v*40;const y=v=>i>=2?130-v*40:10+v*40;parts.push(line(`${p}:${s}`,x(g[0]),y(g[1]),x(g[2]),y(g[3]),i));}});
      return layout(parts,100,140,groups); },
    decode(ids){return ['u','t','h','k'].reduce((n,p,i)=>n+10**i*strokes.indexOf(ids.filter(id=>id.startsWith(p+':')).map(id=>id.split(':')[1]).sort().join('')),0);}
  }),
  system({id:'seg7',name:'Seven-segment',ja:'七セグメント',base:10,min:-MAX,origin:'Modern',structure:'Segments',
    description:'The familiar control: seven reusable segments form each decimal digit. Its shape changes are learned rather than proportional to quantity. Compare the almost-empty 1 with the fully lit 8.',source:'https://en.wikipedia.org/wiki/Seven-segment_display',
    layout(n){const ds=digits(Math.abs(n),10),parts=[],groups=[];ds.forEach((d,i)=>{const x=(ds.length-1-i)*75+12;groups.push(`${d} × ${10**i}`);for(const s of segments[d]){const g=segGeometry[s];parts.push(line(`${i}:${s}`,x+g[0]*45,12+g[1]*52,x+g[2]*45,12+g[3]*52,i%4));}});if(n<0){for(const p of parts)p.d=p.d.replace(/([ML])([\d.]+),/g,(_,c,x)=>c+(Number(x)+60)+',');parts.push(line('negative',5,64,40,64));}return layout(parts,ds.length*75+(n<0?60:0),128,groups);},
    decode(ids){const count=Math.max(...ids.filter(x=>x!=='negative').map(x=>Number(x.split(':')[0])))+1;let n=0;for(let i=0;i<count;i++)n+=10**i*segments.indexOf(ids.filter(x=>x.startsWith(i+':')).map(x=>x.split(':')[1]).sort().join(''));return ids.includes('negative')?-n:n;}
  }),
  system({id:'kado',name:'Kado',ja:'角 · corner bits',base:16,origin:'Invented',structure:'Corners',
    description:'Each square holds four bits: upper left = 1, upper right = 2, lower left = 4, lower right = 8. Add the lit corners. Multiple squares read like hexadecimal digits, most significant on the left. Zero is an empty frame.',source:null,
    layout(n){const ds=digits(n,16),parts=[],groups=[];ds.forEach((d,i)=>{const x=(ds.length-1-i)*110+5;parts.push(path(`${i}:frame`,`M${x},5h90v90h-90Z`,i%4));const shapes=[`M${x},5h45l-45,45Z`,`M${x+90},5v45l-45,-45Z`,`M${x},95v-45l45,45Z`,`M${x+90},95h-45l45,-45Z`];for(let b=0;b<4;b++)if(d&(1<<b))parts.push(path(`${i}:bit${b}`,shapes[b],b,true));groups.push(`${d} × ${16**i}`);});return layout(parts,ds.length*110,100,groups);},
    decode(ids){return ids.reduce((n,id)=>{const m=id.match(/^(\d+):bit(\d)$/);return n+(m?16**Number(m[1])*2**Number(m[2]):0);},0);}
  }),
  system({id:'ko',name:'Ko',ja:'弧 · arc bits',base:16,origin:'Invented',structure:'Concentric',
    description:'Each ring holds a hexadecimal digit. The outermost ring is the units place; each step inward multiplies by 16. Arc weights: upper left 1, upper right 2, lower left 4, lower right 8. A short radial tick at the top marks an empty ring; zero alone is a centre dot.',source:null,
    layout(n){if(n===0)return layout([path('zero','M79,80a1,1 0 1,0 2,0a1,1 0 1,0 -2,0',0,true)],160,160,['0']);const ds=digits(n,16),parts=[],groups=[];ds.forEach((d,i)=>{const r=70-i*12;const arc=[`M${80-r},80A${r},${r} 0 0,1 80,${80-r}`,`M80,${80-r}A${r},${r} 0 0,1 ${80+r},80`,`M80,${80+r}A${r},${r} 0 0,1 ${80-r},80`,`M${80+r},80A${r},${r} 0 0,1 80,${80+r}`];for(let b=0;b<4;b++)if(d&(1<<b))parts.push(path(`${i}:bit${b}`,arc[b],b));if(!d)parts.push(line(`${i}:zero`,80,80-r-2,80,80-r+2,i%4));groups.push(`${d} × ${16**i}${i===0?' · outer':''}`);});return layout(parts,160,160,groups);},
    decode(ids){return systems.find(s=>s.id==='kado').decode(ids);}
  }),
  system({id:'tally-gate',name:'Tally',ja:'五本の束 · groups of five',base:1,max:200,origin:'Historical',structure:'Cumulative',
    description:'Four upright strokes, then a diagonal fifth. Every added mark contributes one. Groups wrap after fifty, making growth visible while giving up compactness. Zero is shown as an empty field.',source:'https://en.wikipedia.org/wiki/Tally_marks',
    layout(n){const parts=[];for(let i=0;i<n;i++){const group=Math.floor(i/5),bit=i%5,x=(group%10)*36+5,y=Math.floor(group/10)*46+8;parts.push(bit===4?line(`mark:${i}`,x-2,y+29,x+26,y+1,group%4):line(`mark:${i}`,x+bit*7,y,x+bit*7,y+30,group%4));}return layout(parts,Math.max(36,Math.min(10,Math.ceil(n/5))*36),Math.max(46,Math.ceil(n/50)*46),[`${Math.floor(n/5)} groups of 5 + ${n%5}`]);},decode(ids){return ids.length;}
  }),
  system({id:'binary',name:'Binary',ja:'二進数 · powers of two',base:2,origin:'Modern',structure:'Bit row',
    description:'Lit positions are powers of two, starting at 1 on the right. A small baseline tick keeps every zero position visible. Watch 15 become 16: four lit bits disappear as the next power switches on.',source:'https://en.wikipedia.org/wiki/Binary_number',
    layout(n){const ds=digits(n,2),parts=[],groups=[];ds.forEach((d,i)=>{const x=(ds.length-1-i)*25+12;parts.push(line(`${i}:slot`,x-3,36,x+3,36,i%4));if(d)parts.push(path(`${i}:bit0`,`M${x-6},20a6,6 0 1,0 12,0a6,6 0 1,0 -12,0`,i%4,true));groups.push(`${d} × ${2**i}`);});return layout(parts,ds.length*25,48,groups);},decode(ids){return ids.reduce((n,id)=>n+(id.endsWith(':bit0')?2**Number(id.split(':')[0]):0),0);}
  })
];
