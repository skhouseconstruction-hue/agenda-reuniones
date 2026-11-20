/* Módulo Literatura - Agenda Reuniones */
(function(){
'use strict';
const ROWS='agenda_literatura_rows_v1', DB='agenda_literatura_files_v1', STORE='files';
let rows=[]; try{const x=JSON.parse(localStorage.getItem(ROWS)||'[]');if(Array.isArray(x))rows=x}catch(e){}
let selected=null, editing=null, dbp=null;
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function persist(){try{localStorage.setItem(ROWS,JSON.stringify(rows));const s=$('litStatus');if(s)s.textContent='Cambios guardados en este dispositivo.';return true}catch(e){alert('No se pudieron guardar los datos.');return false}}
function db(){if(dbp)return dbp;dbp=new Promise((resolve,reject)=>{const q=indexedDB.open(DB,1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(STORE))q.result.createObjectStore(STORE)};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});return dbp}
async function filePut(id,file){const d=await db();return new Promise((res,rej)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).put({blob:file,name:file.name,type:file.type||'',size:file.size},id);t.oncomplete=res;t.onerror=()=>rej(t.error)})}
async function fileGet(id){const d=await db();return new Promise((res,rej)=>{const q=d.transaction(STORE).objectStore(STORE).get(id);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)})}
async function fileDel(id){const d=await db();return new Promise((res,rej)=>{const t=d.transaction(STORE,'readwrite');t.objectStore(STORE).delete(id);t.oncomplete=res;t.onerror=()=>rej(t.error)})}
function ensurePanel(){let p=$('literaturaPanel');if(p)return p;p=document.createElement('section');p.id='literaturaPanel';p.className='panel hidden';p.innerHTML=`
<style>
#literaturaPanel .lit-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}
#literaturaPanel .lit-card{background:#fff;border:1px solid #e3eaf3;border-radius:14px;padding:14px;margin:12px 0}
#literaturaPanel .lit-table-wrap{overflow:auto;background:#fff;border:1px solid #e2eaf2;border-radius:13px}
#literaturaPanel table{width:100%;border-collapse:collapse;min-width:680px}
#literaturaPanel th,#literaturaPanel td{padding:12px 10px;border-bottom:1px solid #edf1f6;text-align:left;font-size:13px}
#literaturaPanel th{background:#f4f7fb;color:#405675}
#literaturaPanel tr.lit-selected{background:#edf5ff}
#literaturaPanel .lit-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
#literaturaPanel label{display:block;font-weight:700;font-size:13px;margin-bottom:5px}
#literaturaPanel input,#literaturaPanel select{width:100%;min-width:0;padding:10px;border:1px solid #ccd7e5;border-radius:9px;font:14px Arial}
#literaturaPanel .lit-preview{display:grid;grid-template-columns:minmax(240px,.8fr) minmax(0,1.5fr);gap:14px}
#literaturaPanel .lit-viewer{min-height:400px;background:#f0f3f8;border:1px solid #dfe6ef;border-radius:12px;display:grid;place-items:center;overflow:hidden}
#literaturaPanel .lit-viewer iframe{width:100%;height:520px;border:0}
#literaturaPanel .lit-viewer img{max-width:100%;max-height:520px;object-fit:contain}
#literaturaPanel .lit-actions{display:flex;gap:7px;flex-wrap:wrap}
#literaturaPanel .lit-btn{border:0;border-radius:9px;padding:10px 13px;font-weight:700;cursor:pointer;background:#eaf1fb;color:#214d82}
#literaturaPanel .lit-btn.primary{background:#1d4ed8;color:white}
#literaturaPanel .lit-btn.danger{background:#fff0f0;color:#a32b2b}
@media(max-width:760px){#literaturaPanel .lit-fields{grid-template-columns:1fr}#literaturaPanel .lit-preview{grid-template-columns:1fr}#literaturaPanel .lit-viewer{min-height:300px}}
</style>
<div class="lit-head"><div><h2 style="margin:0;color:#173e70">📚 Manejo de Literatura</h2><div style="color:#64748b;font-size:13px;margin-top:5px">Control de cargamentos y programas por congregación</div></div><div class="lit-actions"><button class="lit-btn" id="litNew">＋ Nuevo cargamento</button><button class="lit-btn" id="litClose">← Inicio</button></div></div>
<div class="lit-card"><div style="font-weight:800;margin-bottom:8px">Me toca</div><div id="litMeToca" style="font-size:19px;font-weight:800;color:#17613b">Selecciona un registro</div><div id="litMeTocaDate" style="font-size:12px;color:#64748b;margin-top:4px"></div></div>
<div class="lit-table-wrap"><table><thead><tr><th>Fecha de llegada</th><th>Fecha para recoger</th><th>Congregación responsable</th><th>Programa</th><th>Acciones</th></tr></thead><tbody id="litRows"></tbody></table></div>
<div id="litEditor" class="lit-card" hidden><h3 id="litEditorTitle" style="margin-top:0">Nuevo cargamento</h3><div class="lit-fields"><div><label for="litArrival">¿Qué día llegó?</label><input id="litArrival" type="date"></div><div><label for="litPickup">¿Cuándo se puede recoger?</label><input id="litPickup" type="date"></div><div><label for="litCong">Congregación que lo lleva al resguardo</label><input id="litCong" type="text" placeholder="Nombre de la congregación"></div></div><div style="margin-top:12px"><label for="litFile">Programa (PDF o imagen)</label><input id="litFile" type="file" accept="application/pdf,image/*"></div><div class="lit-actions" style="margin-top:14px"><button class="lit-btn primary" id="litSave">Guardar registro</button><button class="lit-btn" id="litCancel">Cancelar</button></div></div>
<div class="lit-preview" style="margin-top:16px"><div class="lit-card"><h3 style="margin-top:0">Registro seleccionado</h3><div id="litDetails" style="color:#52657d;font-size:14px">Selecciona una fila para consultar sus datos y su programa.</div><div class="lit-actions" style="margin-top:14px"><button class="lit-btn" id="litEdit" disabled>✏️ Editar</button><button class="lit-btn danger" id="litDelete" disabled>Eliminar</button></div></div><div class="lit-card"><h3 style="margin-top:0">Vista previa del programa</h3><div id="litViewer" class="lit-viewer"><div style="text-align:center;color:#748399;padding:24px">📄<br>Selecciona un registro con documento adjunto.</div></div></div></div>
<div id="litStatus" style="font-size:12px;color:#64748b;margin-top:12px">Los datos se guardan en este dispositivo.</div>`;
const main=$('appRedesignMain')||document.querySelector('.app');main.appendChild(p);
$('litClose').onclick=()=>{p.classList.add('hidden');$('home')?.classList.remove('hidden')};
$('litNew').onclick=()=>openEditor();
$('litCancel').onclick=()=>{$('litEditor').hidden=true;editing=null};
$('litSave').onclick=saveRow;
$('litEdit').onclick=()=>{const r=rows.find(x=>x.id===selected);if(r)openEditor(r)};
$('litDelete').onclick=deleteRow;
render();return p}
function open(){const p=ensurePanel();['home','agendaPanel','servicePanel','serviceMonthPanel','configPanel','formPanel','nextVisitPanel','pastoreoPanel','personalAgendaPanel','pastHistoryPanel'].forEach(id=>$(id)?.classList.add('hidden'));p.classList.remove('hidden');render();window.scrollTo(0,0)}
function openEditor(r){editing=r?.id||null;$('litEditor').hidden=false;$('litEditorTitle').textContent=r?'Editar cargamento':'Nuevo cargamento';$('litArrival').value=r?.arrival||'';$('litPickup').value=r?.pickup||'';$('litCong').value=r?.congregation||'';$('litFile').value=''}
async function saveRow(){const arrival=$('litArrival').value,pickup=$('litPickup').value,congregation=$('litCong').value.trim();if(!arrival||!pickup||!congregation){alert('Completa las fechas y la congregación.');return}let r=rows.find(x=>x.id===editing);if(!r){r={id:'lit_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),fileName:'',hasFile:false};rows.unshift(r)}r.arrival=arrival;r.pickup=pickup;r.congregation=congregation;const f=$('litFile').files?.[0];if(f){if(!/application\/pdf|image\//.test(f.type)){alert('Adjunta un PDF o una imagen.');return}try{await filePut(r.id,f);r.hasFile=true;r.fileName=f.name}catch(e){alert('No se pudo guardar el archivo: '+e.message);return}}if(!persist())return;selected=r.id;$('litEditor').hidden=true;editing=null;render()}
async function deleteRow(){const r=rows.find(x=>x.id===selected);if(!r||!confirm('¿Eliminar este cargamento y su documento adjunto?'))return;rows=rows.filter(x=>x.id!==selected);try{await fileDel(r.id)}catch(e){}selected=null;persist();render()}
async function render(){const body=$('litRows');if(!body)return;body.innerHTML=rows.map(r=>`<tr data-lit-id="${esc(r.id)}" class="${r.id===selected?'lit-selected':''}"><td>${esc(r.arrival||'—')}</td><td>${esc(r.pickup||'—')}</td><td>${esc(r.congregation||'—')}</td><td>${r.hasFile?'📎 '+esc(r.fileName||'Adjunto'):'Sin documento'}</td><td><button class="lit-btn" data-lit-view="${esc(r.id)}">Ver</button></td></tr>`).join('')||'<tr><td colspan="5" style="text-align:center;padding:24px;color:#718096">Todavía no hay cargamentos registrados.</td></tr>';body.querySelectorAll('[data-lit-view]').forEach(b=>b.onclick=()=>select(b.dataset.litView));body.querySelectorAll('tr[data-lit-id]').forEach(tr=>tr.addEventListener('click',e=>{if(!e.target.closest('button'))select(tr.dataset.litId)}));if(selected)await select(selected,false)}
async function select(id,rerender=true){selected=id;const r=rows.find(x=>x.id===id);if(!r)return;if(rerender){await render();return}const me=$('litMeToca');if(me)me.textContent=r.congregation||'Sin asignar';$('litMeTocaDate').textContent='Recoger: '+(r.pickup||'Sin fecha');$('litDetails').innerHTML='<b>Llegada:</b> '+esc(r.arrival)+'<br><b>Recogida:</b> '+esc(r.pickup)+'<br><b>Congregación:</b> '+esc(r.congregation);$('litEdit').disabled=false;$('litDelete').disabled=false;const viewer=$('litViewer');viewer.innerHTML='';if(!r.hasFile){viewer.textContent='Este cargamento no tiene programa adjunto.';return}try{const f=await fileGet(id);if(!f){viewer.textContent='No se encontró el documento de este registro.';return}const url=URL.createObjectURL(f.blob);if(f.type==='application/pdf'||/\.pdf$/i.test(f.name)){const frame=document.createElement('iframe');frame.src=url;frame.title='Programa '+f.name;viewer.appendChild(frame)}else{const img=document.createElement('img');img.src=url;img.alt='Programa '+f.name;viewer.appendChild(img)}}catch(e){viewer.textContent='No se pudo abrir el documento: '+e.message}}
window.openLiterature=open;
})();
