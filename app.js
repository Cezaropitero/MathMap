const $=s=>document.querySelector(s),esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>s.toLowerCase().replace(/ł/g,'l').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
let D,S={g:5,view:'A',prev:false};
const T=g=>D.topics.filter(t=>t.g===g);
const acc=(cls,head,body,id)=>`<div class="acc ${cls}" id="${id}"><button class="head" aria-expanded="${/open/.test(cls)}">${head}</button><div class="wrap"><div class="body">${body}</div></div></div>`;
const dzId=t=>`dz-${t.g}-${T(t.g).find(x=>x.d===t.d).id}`;
function topic(t,badge){
 const e=D.topics.filter(x=>x.k===t.k&&x.g<t.g).map(x=>x.g);
 return acc('topic',`<span>${esc(t.t)}</span>${badge?`<i class="b">kl. ${t.g}</i>`:''}`,
 `<p>${esc(t.e)}</p><h4>Umiejętności</h4><ul>${t.s.split(';').map(s=>`<li>${esc(s)}</li>`).join('')}</ul><div class="ex"><b>Zadanie:</b> ${esc(t.x[0])}<br><b>Odpowiedź:</b> ${esc(t.x[1])}</div><p class="tag ${e.length?'dev':'new'}">${e.length?'Rozwijany z klasy '+e.join(', ')+'.':'Wprowadzany po raz pierwszy.'}</p>`,'t'+t.id);}
function grade(g,open){const m={};T(g).forEach(t=>(m[t.d]=m[t.d]||[]).push(t));
 return Object.values(m).map(a=>acc('dz'+(open?' open':''),`${esc(a[0].d)}<i class="b">${a.length}</i>`,a.map(t=>topic(t)).join(''),dzId(a[0]))).join('');}
function render(){const g=S.g;let h='';
 if(S.view==='A'){h=`<h2>Klasa ${g}</h2>`+grade(g,true);
  if(g>1){h+=`<button class="more" id="prev">${S.prev?'Ukryj poprzednie klasy':`Pokaż poprzednie klasy (1–${g-1})`}</button>`;
   if(S.prev)for(let i=g-1;i>=1;i--)h+=acc('kl',`Klasa ${i}`,grade(i,false),'kl'+i);}
 }else for(const [c,name] of Object.entries(D.cats)){
  const L=D.topics.filter(t=>t.c===c&&t.g<=g);if(!L.length)continue;
  const ks=[...new Set(L.map(t=>t.k))];
  h+=acc('kl',`${name}<i class="b">${L.length}</i>`,ks.map(k=>{const a=L.filter(t=>t.k===k);
   return `<div class="trail">Rozwój: kl. ${a.map(t=>t.g).join(' → ')}</div>`+a.map(t=>topic(t,1)).join('');}).join(''),'cat'+c);}
 $('#app').innerHTML=h;$('#vA').classList.toggle('on',S.view==='A');$('#vB').classList.toggle('on',S.view==='B');}
function search(){const q=norm($('#q').value.trim());const r=$('#results');
 if(!q){r.innerHTML='';return;}
 const L=D.topics.filter(t=>t.g<=S.g&&norm([t.t,t.d,t.e,t.s].join(' ')).includes(q)).slice(0,30);
 r.innerHTML=L.length?L.map(t=>`<button class="res" data-id="${t.id}">${esc(t.t)}<br><small>Klasa ${t.g} › ${esc(t.d)}</small></button>`).join(''):'<p class="tag">Brak wyników w klasach 1–'+S.g+'.</p>';}
function go(t){S.view='A';S.prev=t.g!==S.g;$('#q').value='';search();render();
 [t.g!==S.g&&'kl'+t.g,dzId(t),'t'+t.id].filter(Boolean).forEach(i=>{const el=document.getElementById(i);el.classList.add('open');el.firstElementChild.setAttribute('aria-expanded','true');});
 setTimeout(()=>document.getElementById('t'+t.id).scrollIntoView({behavior:'smooth',block:'center'}),320);}
function theme(d){document.documentElement.dataset.theme=d;try{localStorage.setItem('mm-theme',d)}catch(e){}}
fetch('data.json').then(r=>r.json()).then(d=>{D=d;D.topics.forEach((t,i)=>t.id=i);
 $('#note').textContent=D.meta.note;
 $('#grade').innerHTML=[1,2,3,4,5,6,7,8].map(n=>`<option value="${n}"${n===S.g?' selected':''}>${n}</option>`).join('');
 let th;try{th=localStorage.getItem('mm-theme')}catch(e){}theme(th||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));
 $('#grade').onchange=e=>{S.g=+e.target.value;S.prev=false;$('#q').value='';search();render();};
 $('#q').oninput=search;$('#vA').onclick=()=>{S.view='A';render();};$('#vB').onclick=()=>{S.view='B';render();};
 $('#theme').onclick=()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark');
 $('#results').onclick=e=>{const b=e.target.closest('.res');if(b)go(D.topics[b.dataset.id]);};
 $('#app').onclick=e=>{if(e.target.id==='prev'){S.prev=!S.prev;render();return;}
  const h=e.target.closest('.head');if(h){const a=h.parentElement;a.classList.toggle('open');h.setAttribute('aria-expanded',a.classList.contains('open'));}};
 render();}).catch(()=>$('#app').textContent='Nie udało się wczytać data.json. Uruchom przez serwer (np. GitHub Pages lub "python -m http.server").');