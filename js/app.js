import {systems} from './systems/index.js';
import {parseNumber,MAX} from './core/numbers.js';
import {render} from './core/render-svg.js';
import {devlog,roadmap} from './notebook.js';
import {initQuiz} from './quiz.js';
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
let value=parseNumber(params.get('v')??'42')??42,skin='nixie',explain=false,direction=0,timer=null,selected=null;
try{const saved=JSON.parse(localStorage.getItem('suji-settings'));if(['ink','nixie','blueprint'].includes(saved?.skin))skin=saved.skin;}catch{}
if(['ink','nixie','blueprint'].includes(params.get('skin')))skin=params.get('skin');
$('skin').value=skin;$('number').value=String(value);
const cards=systems.map(system=>{const card=document.createElement('button');card.className='card';card.innerHTML=`<span class="card-head"><span>${system.origin.toUpperCase()}</span><span class="base">${system.base===1?'UNARY':`BASE ${system.base}`}</span></span><span class="stage"></span><span class="card-label"><span><b>${system.name}</b><small>${system.ja}</small></span><span class="arrow" aria-hidden="true">↗</span></span>`;card.setAttribute('aria-label',`Explore ${system.name}`);card.onclick=()=>openDetail(system);$('gallery').append(card);return{system,card,stage:card.querySelector('.stage'),visible:true};});
const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{for(const e of entries){const item=cards.find(c=>c.card===e.target);item.visible=e.isIntersecting;if(item.visible)render(item.stage,item.system,value,{skin,explain});}}):null;
cards.forEach(c=>observer?.observe(c.card));
function update(){for(const c of cards){c.card.classList.toggle('unavailable',!c.system.canRender(value));if(c.visible)render(c.stage,c.system,value,{skin,explain});}if(selected)updateDetail();$('status').textContent=`${direction===0?'Paused at':direction>0?'Counting up from':'Counting down from'} ${value.toLocaleString()}`;}
function setValue(next){if(!Number.isSafeInteger(next)||Math.abs(next)>MAX)return false;value=next;$('number').value=String(value);$('number').removeAttribute('aria-invalid');$('input-help').textContent='Decimal, 0x hex, or 0b binary · ↑ / ↓ to step';update();return true;}
function pause(){direction=0;clearInterval(timer);timer=null;for(const id of ['down','up','pause'])$(id).setAttribute('aria-pressed',String(id==='pause'));update();}
function run(dir){pause();direction=dir;for(const id of ['down','up','pause'])$(id).setAttribute('aria-pressed',String(id===(dir>0?'up':'down')));timer=setInterval(()=>{if(document.hidden)return;const next=value+direction;if(direction<0&&next<0||Math.abs(next)>MAX){pause();return;}setValue(next);if(direction<0&&value===0)pause();},1000/Number($('rate').value));update();}
function step(by){pause();setValue(value+by);}
$('number').addEventListener('input',()=>{pause();const n=parseNumber($('number').value);if(n===null){$('number').setAttribute('aria-invalid','true');$('input-help').textContent='Enter a whole number from −999999 to 999999. Displays keep the last valid value.';}else{value=n;$('number').removeAttribute('aria-invalid');$('input-help').textContent='Decimal, 0x hex, or 0b binary · ↑ / ↓ to step';update();}});
$('minus').onclick=()=>step(-1);$('plus').onclick=()=>step(1);$('random').onclick=()=>{pause();setValue(Math.floor(Math.random()*201));};
$('up').onclick=()=>run(1);$('down').onclick=()=>run(-1);$('pause').onclick=pause;
$('rate').oninput=()=>{$('rate-value').textContent=`${$('rate').value} / sec`;if(direction)run(direction);};
let quiz;
$('skin').onchange=()=>{skin=$('skin').value;try{localStorage.setItem('suji-settings',JSON.stringify({skin}));}catch{}update();quiz?.refresh();};
function toggleExplain(){explain=!explain;$('explain').checked=explain;$('detail-explain').setAttribute('aria-pressed',String(explain));update();}
$('explain').onchange=toggleExplain;$('detail-explain').onclick=toggleExplain;
document.querySelectorAll('[data-example]').forEach(b=>b.onclick=()=>{pause();setValue(Number(b.dataset.example));$('playground-tools').open=false;});
function updateDetail(){const next=render($('detail-stage'),selected,value,{skin,explain});$('detail-value').textContent=value.toLocaleString();$('detail-groups').replaceChildren();$('detail-groups').hidden=!explain;if(next)next.groups.forEach(label=>{const s=document.createElement('span');s.textContent=label;$('detail-groups').append(s);});}
function openDetail(system){pause();selected=system;$('detail-name').textContent=`${system.name} · ${system.ja}`;$('detail-category').textContent=`${system.origin} / ${system.structure}`;$('detail-description').textContent=system.description;$('detail-source').replaceChildren();if(system.source){const a=document.createElement('a');a.href=system.source;a.textContent=system.source;a.target='_blank';a.rel='noopener noreferrer';$('detail-source').append(a);}else $('detail-source').textContent='Original experimental notation from the sūji-galore brief.';updateDetail();$('detail').showModal();}
$('close').onclick=()=>$('detail').close();$('detail').addEventListener('close',()=>{selected=null;});$('detail-minus').onclick=()=>step(-1);$('detail-plus').onclick=()=>step(1);
document.addEventListener('pointerdown',e=>{const tools=$('playground-tools');if(tools.open&&!tools.contains(e.target))tools.open=false;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('playground-tools').open){$('playground-tools').open=false;$('playground-tools').querySelector('summary').focus();return;}if(e.target.matches('input,select,textarea')||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();step(e.key==='ArrowUp'?1:-1);}});
for(const entry of devlog){const article=document.createElement('article');article.className='entry';const time=document.createElement('time');time.dateTime=entry.date;time.textContent=entry.date;const body=document.createElement('div');const title=document.createElement('h3');title.textContent=entry.title;body.append(title);entry.paragraphs.forEach((text,i)=>{const p=document.createElement('p');p.textContent=text;if(i===1)p.className='finding';body.append(p);});article.append(time,body);$('devlog-content').append(article);}
for(const item of roadmap){const article=document.createElement('article');article.className='roadmap-item';const tag=document.createElement('span');tag.className='tag';tag.textContent=item.status;const h=document.createElement('h3');h.textContent=item.title;const ul=document.createElement('ul');item.items.forEach(text=>{const li=document.createElement('li');li.textContent=text;ul.append(li);});article.append(tag,h,ul);$('roadmap-content').append(article);}
quiz=initQuiz(systems,()=>skin);
update();
const context=document.modelContext;
if(context?.registerTool){const lifecycle=new AbortController();try{Promise.resolve(context.registerTool({name:'set_playground_number',description:'Set the shared number displayed by every numeral system and pause counting.',inputSchema:{type:'object',properties:{value:{type:'integer',minimum:-MAX,maximum:MAX}},required:['value'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!Number.isInteger(input.value)||Math.abs(input.value)>MAX)throw new Error('Expected an integer from -999999 to 999999');pause();setValue(input.value);return{value,systems:systems.filter(s=>s.canRender(value)).map(s=>s.id)};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}
