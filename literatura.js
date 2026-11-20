(function(){
'use strict';
const KEY='miAgendaLiteraturaRows_v1', DB='miAgendaLiteraturaFiles_v1', STORE='attachments', $=id=>document.getElementById(id);
let rows=[], selectedId=null, previewUrl=null, dbPromise=null;
try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');rows=Array.isArray(v)?v:[]}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(rows));const s=$('litSaveStatus');if(s)s.textContent='Guardado automáticamente en este dispositivo.';return true}catch(e){const s=$('litSaveStatus');if(s)s.textContent='No se pudo guardar: almacenamiento del navegador lleno.';return false}}
function db(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{if(!window.indexedDB){reject(new Error('IndexedDB no disponible'));return}const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>{dbPromise=null;reject(r.error)}});return dbPromise}
async function filePut(id,file){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).put(file,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function fileGet(id){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction(STORE).objectStore(STORE).get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
async function fileDelete(id){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function newRow(){return{id:'lit_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),arrivalDate:'',pickupDate:'',congregation:'',fileName:'',hasFile:false}}
function current(){return rows.find(r=>r.id===selectedId)||null}
function fmt(v){if(!v)return'Fecha de recogida pendiente';const p=v.split('-');return p.length===3?'Recogida: '+p[2]+'/'+p[1]+'/'+p[0]:'Recogida: '+v}
function displayDate(v){if(!v)return'Pendiente';const p=v.split('-');if(p.length!==3)return v;const months=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];return Number(p[2])+' '+(months[Number(p[1])-1]||p[1])+' '+p[0]}
function closePreview(){if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null}
function render(){
 const body=$('litRows');if(!body)return;body.innerHTML='';
 rows.forEach((r,i)=>{const tr=document.createElement('tr');tr.className=r.id===selectedId?'lit-selected-row':'';tr.dataset.litRow=r.id;
 tr.innerHTML='<td class="lit-number">'+(i+1)+'</td><td><input aria-label="Fecha de llegada" type="date" data-lit-field="arrivalDate" data-id="'+esc(r.id)+'" value="'+esc(r.arrivalDate)+'"></td><td><input aria-label="Fecha de recogida" type="date" data-lit-field="pickupDate" data-id="'+esc(r.id)+'" value="'+esc(r.pickupDate)+'"></td><td><input aria-label="Congregación responsable" type="text" maxlength="120" placeholder="Nombre de congregación" data-lit-field="congregation" data-id="'+esc(r.id)+'" value="'+esc(r.congregation)+'"></td><td class="lit-actions"><button type="button" class="lit-delete-btn" data-lit-delete="'+esc(r.id)+'" aria-label="Eliminar registro">🗑</button></td>';body.appendChild(tr)});
 if(!rows.length){const tr=document.createElement('tr');tr.innerHTML='<td colspan="5" class="lit-empty">Todavía no hay cargamentos. Selecciona «Nuevo Registro» para comenzar.</td>';body.appendChild(tr)}
 const r=current();$('litMeToca').textContent=r&&r.congregation?r.congregation:'Selecciona un registro y asigna una congregación';$('litMeTocaDate').textContent=r?fmt(r.pickupDate):'Fecha de recogida pendiente';if(!r||!r.hasFile)closePreview();
 save();
}

function openLiteratura(){const panel=$('literaturaPanel');if(!panel)return;['home','formPanel','agendaPanel','servicePanel','configPanel','serviceMonthPanel','nextVisitPanel','pastoreoPanel','pastHistoryPanel','personalAgendaPanel','miOrganizerPanel'].forEach(id=>{const el=$(id);if(el){if(id==='miOrganizerPanel')el.style.display='none';else el.classList.add('hidden')}});panel.style.display='block';render();window.scrollTo(0,0)}
window.openLiteratura=openLiteratura;
function installMenuItem(){const nav=$('appRedesignNav'),brand=$('appRedesignBrandText');if(!nav||!brand||brand.textContent.trim()!=='Mi Agenda'||document.body.classList.contains('personal-agenda-mode')||nav.querySelector('[data-label="Literatura"]'))return;const mainMenu=nav.querySelector('[data-label="Mi organizador"],[data-label="Próxima visita"],[data-label="Conmemoración"],[data-label="Cartas y Anuncios"],[data-label="Visita de pastoreo"],[data-label="Asignación"],[data-label="Mi servicio"],[data-label="Configuración"]');if(!mainMenu)return;const b=document.createElement('button');b.type='button';b.className='redesign-nav-btn';b.dataset.label='Literatura';b.innerHTML='<span class="redesign-nav-icon" aria-hidden="true">📚</span><span>Literatura</span>';b.addEventListener('click',()=>{nav.querySelectorAll('.redesign-nav-btn').forEach(x=>x.classList.toggle('active',x===b));const t=$('appRedesignMobileTitle');if(t)t.textContent='Literatura';document.body.classList.remove('redesign-menu-open');openLiteratura()});const config=nav.querySelector('[data-label="Configuración"]');if(config)nav.insertBefore(b,config);else nav.appendChild(b)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#appRedesignNav .redesign-nav-btn');if(b&&b.dataset.label!=='Literatura'){const p=$('literaturaPanel');if(p)p.style.display='none';closePreview()}},true);
new MutationObserver(installMenuItem).observe(document.body,{childList:true,subtree:true});installMenuItem();
document.addEventListener('input',e=>{const el=e.target;if(!el.matches('#literaturaPanel [data-lit-field]'))return;const r=rows.find(x=>x.id===el.dataset.id);if(!r)return;selectedId=r.id;r[el.dataset.litField]=el.value;save();$('litMeToca').textContent=r.congregation||'Asigna una congregación';$('litMeTocaDate').textContent=fmt(r.pickupDate)});
document.addEventListener('click',async e=>{const row=e.target.closest&&e.target.closest('#literaturaPanel tr[data-lit-row]');if(row&&!e.target.closest('button,label,input,a')){selectedId=row.dataset.litRow;render();const selected=current();return}const add=e.target.closest&&e.target.closest('#literaturaAdd');if(add){const r=newRow();rows.push(r);selectedId=r.id;render();document.querySelector('#literaturaPanel input[data-id="'+r.id+'"]')?.focus();return}const del=e.target.closest&&e.target.closest('#literaturaPanel [data-lit-delete]');if(del){const id=del.dataset.litDelete;if(!confirm('¿Eliminar este registro y su documento adjunto?'))return;try{await fileDelete(id)}catch(err){}rows=rows.filter(x=>x.id!==id);if(selectedId===id){selectedId=rows[0]?rows[0].id:null;closePreview()}save();render()}});
const style=document.createElement('style');
style.textContent="#literaturaPanel{display:none;width:100%;max-width:1500px;min-width:0;margin:0 auto;padding:8px;background:#f4f7fb;color:#132c50;overflow-x:hidden;font-family:Arial,sans-serif}#literaturaPanel *{box-sizing:border-box}#literaturaPanel .lit-layout{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;align-items:stretch;width:100%;min-width:0}#literaturaPanel .lit-left-column{display:flex;flex-direction:column;gap:16px;min-width:0}#literaturaPanel .lit-card{min-width:0;border:1px solid #d6deea;border-radius:16px;background:#fff;box-shadow:0 3px 9px rgba(19,48,82,.12);overflow:hidden}#literaturaPanel .lit-control-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 18px;border-bottom:1px solid #e3e8ef}#literaturaPanel .lit-heading-group{display:flex;align-items:center;gap:13px;min-width:0}#literaturaPanel .lit-round-icon{width:48px;height:48px;flex:0 0 48px;display:grid;place-items:center;border-radius:50%;background:#123d68;color:#fff;font-size:25px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.12)}#literaturaPanel h2{margin:0;color:#102b52;font-size:clamp(20px,2vw,27px);line-height:1.12;font-weight:800}#literaturaPanel .lit-sub{margin-top:5px;color:#52647b;font-size:14px;line-height:1.35}#literaturaPanel button,#literaturaPanel input{font:inherit}#literaturaPanel .lit-add{flex:0 0 auto;border:0;border-radius:10px;background:#15965e;color:#fff;padding:12px 17px;font-weight:800;cursor:pointer;box-shadow:0 3px 7px rgba(21,150,94,.2);white-space:nowrap}#literaturaPanel .lit-card-head{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid #e4e9f0;color:#102b52;font-size:18px;font-weight:800}#literaturaPanel .lit-table-wrap{display:block;width:100%;min-width:0;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;scrollbar-width:auto;scrollbar-color:#315b86 #e1e8f0}#literaturaPanel .lit-table-wrap::-webkit-scrollbar{display:block;height:12px}#literaturaPanel .lit-table-wrap::-webkit-scrollbar-track{background:#e1e8f0;border-radius:9px}#literaturaPanel .lit-table-wrap::-webkit-scrollbar-thumb{background:#315b86;border:2px solid #e1e8f0;border-radius:9px}#literaturaPanel table{width:100%;min-width:760px;border-collapse:collapse;table-layout:auto}#literaturaPanel th{background:#12395f;color:#fff;padding:12px 10px;text-align:center;font-size:14px;font-weight:800;line-height:1.2;white-space:normal;border-right:1px solid rgba(255,255,255,.18)}#literaturaPanel td{padding:9px 8px;border-bottom:1px solid #dfe5ed;vertical-align:middle;text-align:center;color:#101c2e;font-size:14px}#literaturaPanel tr.lit-selected-row td{background:#fff0bd}#literaturaPanel tr[data-lit-row]{cursor:pointer}#literaturaPanel td input{width:100%;min-width:112px;padding:7px 6px;border:1px solid transparent;border-radius:6px;background:transparent;color:#14243b;font-size:13px;text-align:center}#literaturaPanel td input:focus{outline:2px solid #7ba6d5;border-color:#7ba6d5;background:#fff}#literaturaPanel td input[type=text]{min-width:130px;font-weight:700}#literaturaPanel .lit-number{font-weight:800;text-align:center}#literaturaPanel .lit-file-cell{min-width:118px}#literaturaPanel .lit-upload-label{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:8px 10px;border:1px dashed #91afd1;border-radius:9px;color:#315b8b;background:#f5f9ff;font-size:12px;font-weight:800;cursor:pointer;white-space:nowrap}#literaturaPanel .lit-upload-label input{display:none}#literaturaPanel .lit-file-actions{display:flex;gap:5px;align-items:center;justify-content:center}#literaturaPanel .lit-file-view{border:1px solid #d4e0ee;border-radius:9px;background:#f4f8fe;color:#24558e;padding:8px 10px;font-size:12px;font-weight:700;max-width:135px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}#literaturaPanel .lit-file-view::first-letter{color:#d33}#literaturaPanel .lit-file-remove,#literaturaPanel .lit-delete-btn{border:0;border-radius:8px;background:#fff0f0;color:#b43c3c;padding:8px 10px;font-weight:900;cursor:pointer}#literaturaPanel .lit-select-btn{width:38px;height:38px;border:1px solid #d7e2ef;border-radius:9px;background:#f3f7fc;color:#15558b;font-size:20px;font-weight:900;cursor:pointer}#literaturaPanel .lit-delete-btn{width:38px;height:38px;font-size:18px}#literaturaPanel .lit-actions{white-space:nowrap}#literaturaPanel .lit-empty{text-align:center;padding:28px 12px;color:#718096;font-size:15px}#literaturaPanel .lit-details{border:1px solid #d6deea;border-radius:16px;background:#fff;box-shadow:0 3px 9px rgba(19,48,82,.12);overflow:hidden}#literaturaPanel .lit-detail-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;padding:0 10px 12px}#literaturaPanel .lit-detail{display:flex;align-items:center;gap:11px;padding:16px 12px;min-width:0;border-right:1px solid #e4e9f0}#literaturaPanel .lit-detail:last-child{border-right:0}#literaturaPanel .lit-detail-icon{flex:0 0 auto;color:#14558b;font-size:29px}#literaturaPanel .lit-detail small{display:block;color:#31425a;font-size:12px;margin-bottom:7px;line-height:1.25}#literaturaPanel .lit-detail strong{display:inline-block;color:#102b52;font-size:15px;font-weight:800;overflow-wrap:anywhere}#literaturaPanel .lit-detail:last-child strong{background:#ffe28b;padding:7px 10px;border-radius:10px}#literaturaPanel .lit-me-toca{display:flex;align-items:center;gap:16px;margin-top:0;padding:15px 20px;border:1px solid #edca73;border-radius:13px;background:linear-gradient(105deg,#fff0c5,#fff8e8);color:#163d66;box-shadow:0 2px 5px rgba(19,48,82,.06);min-width:0}#literaturaPanel .lit-me-toca .lit-truck{font-size:42px;flex:0 0 auto}#literaturaPanel .lit-me-copy{min-width:0;flex:1 1 auto}#literaturaPanel .lit-me-copy small{display:block;font-size:16px;font-weight:800;color:#8a6821;margin-bottom:5px}#literaturaPanel .lit-me-copy strong{display:block;font-size:clamp(18px,2vw,24px);color:#102b52;overflow-wrap:anywhere}#literaturaPanel .lit-me-copy em{display:block;font-style:normal;font-size:15px;color:#273d59;margin-top:4px}#literaturaPanel .lit-me-copy span{display:block;margin-top:4px;font-size:12px;color:#6f5c36}#literaturaPanel #litSaveStatus{padding:0 4px;color:#718096;font-size:11px}#literaturaPanel .lit-preview{display:flex;flex-direction:column;min-height:660px;height:100%}#literaturaPanel .lit-preview-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 15px;border-bottom:1px solid #e4e9f0}#literaturaPanel .lit-preview-title{display:flex;align-items:center;gap:12px;min-width:0}#literaturaPanel .lit-preview-title strong{display:block;color:#102b52;font-size:18px;line-height:1.2}#literaturaPanel .lit-preview-title small{display:block;color:#52647b;font-size:13px;margin-top:4px}#literaturaPanel .lit-expand{width:42px;height:42px;flex:0 0 42px;border:1px solid #d8e1ec;border-radius:9px;background:#f7f9fc;color:#102b52;font-size:23px;cursor:pointer}#literaturaPanel .lit-preview-meta{padding:8px 13px;color:#64748b;font-size:12px;overflow-wrap:anywhere}#literaturaPanel .lit-preview-stage{position:relative;flex:1;min-height:540px;background:#e9edf2;display:flex;align-items:stretch;justify-content:center;overflow:auto;-webkit-overflow-scrolling:touch}#literaturaPanel .lit-preview-placeholder{text-align:center;color:#718096;padding:24px;align-self:center}#literaturaPanel .lit-preview-placeholder b{display:block;font-size:42px;margin-bottom:9px}#literaturaPanel .lit-preview-frame{display:block;width:100%;height:100%;min-height:540px;border:0;background:#fff}#literaturaPanel .lit-preview-image{display:block;max-width:100%;max-height:850px;object-fit:contain;margin:auto}#literaturaPanel .lit-preview-download{padding:12px 18px;border-radius:9px;background:#fff;color:#24558e;font-weight:800;align-self:center}#literaturaPanel .lit-scroll-controls{display:none;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:#f1f6fc;border-bottom:1px solid #dce6f1;color:#315b86;font-size:12px}#literaturaPanel .lit-scroll-controls button{width:38px;height:36px;flex:0 0 38px;border:1px solid #b8cbe0;border-radius:8px;background:#fff;color:#173f72;font-size:24px;line-height:1;cursor:pointer}#literaturaPanel.lit-preview-expanded{position:fixed!important;inset:12px!important;z-index:99999!important;width:auto!important;max-width:none!important;height:auto!important;overflow:auto!important;background:#f4f7fb!important;box-shadow:0 0 0 100vmax rgba(0,0,0,.55)!important}#literaturaPanel.lit-preview-expanded .lit-layout{grid-template-columns:minmax(0,1fr)!important}#literaturaPanel.lit-preview-expanded .lit-left-column{display:none}#literaturaPanel.lit-preview-expanded .lit-preview{height:calc(100vh - 40px);min-height:0}#literaturaPanel.lit-preview-expanded .lit-preview-stage{min-height:0}#literaturaPanel.lit-preview-expanded .lit-preview-frame{height:calc(100vh - 150px);min-height:0}@media(min-width:1200px){#literaturaPanel .lit-layout{grid-template-columns:minmax(0,1fr);gap:16px}#literaturaPanel .lit-preview{min-height:690px}#literaturaPanel .lit-preview-stage{min-height:590px}}@media(min-width:768px) and (max-width:1199px){#literaturaPanel{padding:12px}#literaturaPanel .lit-layout{grid-template-columns:minmax(0,1fr)}#literaturaPanel .lit-preview{min-height:540px}#literaturaPanel .lit-preview-stage{min-height:460px}#literaturaPanel .lit-preview-frame{min-height:460px}#literaturaPanel .lit-detail-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:767px){#literaturaPanel{padding:8px!important;margin:0!important;width:100%!important;max-width:100%!important;border-radius:12px}#literaturaPanel .lit-layout{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:12px}#literaturaPanel .lit-control-head{align-items:stretch;flex-direction:column;padding:13px}#literaturaPanel .lit-heading-group{align-items:flex-start}#literaturaPanel .lit-round-icon{width:42px;height:42px;flex-basis:42px;font-size:22px}#literaturaPanel h2{font-size:19px}#literaturaPanel .lit-sub{font-size:12px}#literaturaPanel .lit-add{width:100%;min-height:44px}#literaturaPanel .lit-card-head{font-size:16px;padding:12px}#literaturaPanel .lit-scroll-controls{display:flex}#literaturaPanel table{width:790px;min-width:790px}#literaturaPanel th{font-size:12px;padding:10px 8px}#literaturaPanel td{padding:7px 6px;font-size:12px}#literaturaPanel .lit-detail-grid{grid-template-columns:minmax(0,1fr);padding:0 10px 8px}#literaturaPanel .lit-detail{border-right:0;border-bottom:1px solid #e4e9f0;padding:11px 8px}#literaturaPanel .lit-detail:last-child{border-bottom:0}#literaturaPanel .lit-detail-icon{font-size:25px}#literaturaPanel .lit-me-toca{align-items:flex-start;padding:13px;gap:10px}#literaturaPanel .lit-me-toca .lit-truck{font-size:30px}#literaturaPanel .lit-me-copy{flex:1 1 0;width:auto}#literaturaPanel .lit-me-copy small{font-size:13px}#literaturaPanel .lit-me-copy strong{font-size:17px}#literaturaPanel .lit-me-copy em{font-size:12px}#literaturaPanel .lit-preview{min-height:420px;height:auto}#literaturaPanel .lit-preview-stage{min-height:340px}#literaturaPanel .lit-preview-frame{min-height:420px;height:65vh}#literaturaPanel .lit-preview-image{max-height:65vh}#literaturaPanel .lit-preview-title strong{font-size:16px}#literaturaPanel .lit-preview-title small{font-size:12px}}@media(max-width:380px){#literaturaPanel .lit-detail{gap:8px}#literaturaPanel .lit-me-toca{gap:8px;padding:11px}#literaturaPanel .lit-preview-frame{height:58vh;min-height:300px}}";
document.head.appendChild(style);
const attachStyle=document.createElement('style');attachStyle.textContent='#literaturaPanel .lit-preview{display:flex;align-items:center;justify-content:center;min-height:0;height:auto;padding:18px;overflow:visible}#literaturaPanel .lit-preview-attach{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:54px;width:100%;max-width:360px;padding:14px 24px;border:0;border-radius:10px;background:#15965e;color:#fff;font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 3px 8px rgba(21,150,94,.2)}#literaturaPanel #litPreviewFileInput{display:none}@media(max-width:767px){#literaturaPanel .lit-preview{min-height:0;height:auto;padding:14px}#literaturaPanel .lit-preview-attach{max-width:none;min-height:50px;font-size:16px}}';document.head.appendChild(attachStyle);
const panel=document.createElement('section');panel.id='literaturaPanel';
panel.innerHTML="<div class=\"lit-layout\"><div class=\"lit-left-column\"><div class=\"lit-card lit-control-card\"><div class=\"lit-control-head\"><div class=\"lit-heading-group\"><span class=\"lit-round-icon\" aria-hidden=\"true\">⬡</span><div><h2>Control de Cargamentos de Literatura</h2><div class=\"lit-sub\">Registro de llegadas, recogidas y congregación responsable.</div></div></div><button id=\"literaturaAdd\" class=\"lit-add\" type=\"button\">＋ Nuevo Registro</button></div><div class=\"lit-table-wrap\"><table><thead><tr><th>#</th><th>▣ Fecha de Llegada</th><th>▣ Fecha de Recogida</th><th>♧ Congregación Responsable</th><th>Acciones</th></tr></thead><tbody id=\"litRows\"></tbody></table></div></div><div class=\"lit-me-toca\"><span class=\"lit-truck\" aria-hidden=\"true\">🚚</span><div class=\"lit-me-copy\"><small>ME TOCA:</small><strong id=\"litMeToca\">Selecciona un registro y asigna una congregación</strong><em>Llevar la literatura al resguardo.</em><span id=\"litMeTocaDate\">Fecha de recogida pendiente</span></div></div><div id=\"litSaveStatus\">Guardado automáticamente en este dispositivo.</div></div></div>";

const tableWrap=panel.querySelector('.lit-table-wrap');
if(tableWrap){
 const bar=document.createElement('div');
 bar.className='lit-scroll-controls';
 bar.innerHTML='<button type="button" data-lit-scroll="-1" aria-label="Desplazar tabla a la izquierda">‹</button><span>Desliza la tabla para ver todas las columnas</span><button type="button" data-lit-scroll="1" aria-label="Desplazar tabla a la derecha">›</button>';
 tableWrap.parentNode.insertBefore(bar,tableWrap);
 bar.addEventListener('click',e=>{const btn=e.target.closest('[data-lit-scroll]');if(!btn)return;tableWrap.scrollBy({left:Number(btn.dataset.litScroll)*260,behavior:'smooth'})});

}


/* PROGRAMAS ADJUNTOS: módulo independiente del formulario y de la tabla */
const PROGRAMAS_KEY='miAgendaLiteraturaProgramas_v1';
let programas=[];
try{const p=JSON.parse(localStorage.getItem(PROGRAMAS_KEY)||'[]');programas=Array.isArray(p)?p:[]}catch(e){}
const programaUrls=new Map();
let programasRenderToken=0;
function saveProgramas(){try{localStorage.setItem(PROGRAMAS_KEY,JSON.stringify(programas));return true}catch(e){const s=$('litProgramasStatus');if(s)s.textContent='No se pudo guardar la lista de programas.';return false}}
function clearProgramaUrls(){programaUrls.forEach(url=>URL.revokeObjectURL(url));programaUrls.clear()}
function programaPreviewMarkup(meta,url){
 const type=String(meta.type||'').toLowerCase();
 if(type==='application/pdf'||/\.pdf$/i.test(meta.name||''))return '<iframe class="lit-programa-frame" title="Vista previa de '+esc(meta.name)+'" src="'+url+'"></iframe>';
 if(type.startsWith('image/'))return '<img class="lit-programa-image" alt="'+esc(meta.name)+'" src="'+url+'">';
 if(type.startsWith('video/'))return '<video class="lit-programa-media" controls playsinline src="'+url+'"></video>';
 if(type.startsWith('audio/'))return '<audio class="lit-programa-audio" controls src="'+url+'"></audio>';
 if(type.startsWith('text/'))return '<iframe class="lit-programa-frame" title="Vista previa de '+esc(meta.name)+'" src="'+url+'"></iframe>';
 return '<div class="lit-programa-no-preview"><span>📄</span><strong>Vista previa no disponible para este formato</strong><a href="'+url+'" target="_blank" rel="noopener">Abrir archivo</a></div>';
}
async function renderProgramas(){
 const list=$('litProgramasList');if(!list)return;
 const token=++programasRenderToken;clearProgramaUrls();list.innerHTML='';
 if(!programas.length){list.innerHTML='<div class="lit-programas-empty">Todavía no hay programas adjuntos. Utiliza el botón verde para agregar uno.</div>';return}
 for(const meta of programas){
  let file=null;try{file=await fileGet(meta.id)}catch(e){}
  if(token!==programasRenderToken)return;
  const card=document.createElement('article');card.className='lit-programa-item';
  const head=document.createElement('div');head.className='lit-programa-item-head';
  const info=document.createElement('div');info.className='lit-programa-file-info';
  const name=document.createElement('strong');name.textContent=meta.name||'Programa adjunto';
  const detail=document.createElement('small');detail.textContent=(meta.size?((meta.size/1024/1024).toFixed(2)+' MB · '):'')+'Guardado en este dispositivo';
  info.append(name,detail);
  const del=document.createElement('button');del.type='button';del.className='lit-programa-delete';del.dataset.litProgramaDelete=meta.id;del.textContent='🗑 Eliminar';del.setAttribute('aria-label','Eliminar '+(meta.name||'programa'));
  head.append(info,del);card.appendChild(head);
  const stage=document.createElement('div');stage.className='lit-programa-preview';
  if(file){
   const url=URL.createObjectURL(file);programaUrls.set(meta.id,url);
   stage.innerHTML=programaPreviewMarkup(meta,url);
  }else{
   stage.innerHTML='<div class="lit-programa-no-preview"><span>⚠️</span><strong>No se encontró el archivo guardado</strong></div>';
  }
  card.appendChild(stage);list.appendChild(card);
 }
}
const programasCard=document.createElement('section');
programasCard.className='lit-card lit-programas-card';
programasCard.innerHTML='<div class="lit-programas-head"><div><h3>Programas adjuntos</h3><p>Los archivos se conservan aquí, independientes de los registros.</p></div></div><div class="lit-programas-action"><label class="lit-programa-add" for="litProgramasInput">＋ Adjuntar programa</label><input id="litProgramasInput" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.mp4,.webm,.mp3,.wav,.doc,.docx,.ppt,.pptx"></div><div id="litProgramasList" class="lit-programas-list"></div><div id="litProgramasStatus" class="lit-programas-status">Los programas adjuntos se guardan automáticamente en este dispositivo.</div>';
const programasStyle=document.createElement('style');
programasStyle.textContent=`
#literaturaPanel .lit-programas-card{padding:16px;overflow:visible}
#literaturaPanel .lit-programas-head h3{margin:0;color:#102b52;font-size:19px;font-weight:800}
#literaturaPanel .lit-programas-head p{margin:5px 0 14px;color:#64748b;font-size:13px;line-height:1.4}
#literaturaPanel .lit-programas-action{padding:0 0 14px}
#literaturaPanel .lit-programa-add{display:flex;align-items:center;justify-content:center;min-height:54px;width:100%;padding:13px 18px;border:0;border-radius:11px;background:#15965e;color:#fff;font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 3px 8px rgba(21,150,94,.2)}
#literaturaPanel #litProgramasInput{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
#literaturaPanel .lit-programas-list{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}
#literaturaPanel .lit-programas-empty{padding:18px 12px;border:1px dashed #cbd7e5;border-radius:10px;color:#718096;text-align:center;font-size:13px}
#literaturaPanel .lit-programa-item{min-width:0;border:1px solid #d6deea;border-radius:12px;background:#fff;overflow:hidden}
#literaturaPanel .lit-programa-item-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;border-bottom:1px solid #e5eaf1}
#literaturaPanel .lit-programa-file-info{display:flex;flex-direction:column;gap:4px;min-width:0}
#literaturaPanel .lit-programa-file-info strong{color:#1b3b61;font-size:14px;overflow-wrap:anywhere}
#literaturaPanel .lit-programa-file-info small{color:#718096;font-size:11px}
#literaturaPanel .lit-programa-delete{flex:0 0 auto;border:0;border-radius:8px;background:#fff0f0;color:#b43c3c;padding:9px 11px;font-size:12px;font-weight:800;cursor:pointer}
#literaturaPanel .lit-programa-preview{display:flex;align-items:center;justify-content:center;min-height:120px;max-height:650px;overflow:auto;background:#eef2f7}
#literaturaPanel .lit-programa-frame{display:block;width:100%;height:620px;border:0;background:#fff}
#literaturaPanel .lit-programa-image{display:block;max-width:100%;max-height:620px;object-fit:contain}
#literaturaPanel .lit-programa-media{display:block;width:100%;max-height:520px}
#literaturaPanel .lit-programa-audio{width:calc(100% - 24px);margin:20px 12px}
#literaturaPanel .lit-programa-no-preview{display:flex;flex-direction:column;align-items:center;gap:9px;padding:25px;text-align:center;color:#64748b;font-size:13px}
#literaturaPanel .lit-programa-no-preview span{font-size:34px}
#literaturaPanel .lit-programa-no-preview a{color:#24558e;font-weight:800}
#literaturaPanel .lit-programas-status{padding-top:10px;color:#718096;font-size:11px}
@media(max-width:767px){#literaturaPanel .lit-programas-card{padding:13px}#literaturaPanel .lit-programa-add{min-height:52px;font-size:16px}#literaturaPanel .lit-programa-frame{height:65vh;min-height:360px}#literaturaPanel .lit-programa-image{max-height:65vh}#literaturaPanel .lit-programa-item-head{align-items:flex-start}}
`;
document.head.appendChild(programasStyle);
panel.appendChild(programasCard);
document.addEventListener('change',async e=>{
 const input=e.target;if(!input||input.id!=='litProgramasInput')return;
 const files=Array.from(input.files||[]);input.value='';
 if(!files.length)return;
 const status=$('litProgramasStatus');
 for(const file of files){
  const id='programa_'+Date.now()+'_'+Math.random().toString(36).slice(2,9);
  try{
   await filePut(id,file);
   programas.push({id,name:file.name,type:file.type||'',size:file.size||0,addedAt:Date.now()});
   saveProgramas();
  }catch(err){if(status)status.textContent='No se pudo guardar '+file.name+'. Revisa el espacio disponible del navegador.'}
 }
 await renderProgramas();
});
document.addEventListener('click',async e=>{
 const btn=e.target.closest&&e.target.closest('#literaturaPanel [data-lit-programa-delete]');
 if(!btn)return;
 const id=btn.dataset.litProgramaDelete;
 const meta=programas.find(x=>x.id===id);
 if(!meta||!confirm('¿Eliminar el programa adjunto "'+meta.name+'"?'))return;
 try{await fileDelete(id)}catch(err){}
 programas=programas.filter(x=>x.id!==id);saveProgramas();await renderProgramas();
});

const main=$('appRedesignMain');if(main)main.appendChild(panel);
renderProgramas();
window.addEventListener('beforeunload',closePreview);
})();