const CACHE = 'mi-agenda-v3-literatura';
const ASSETS = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./literatura.js'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin===self.location.origin&&(url.pathname.endsWith('/index.html')||url.pathname.endsWith('/'))){
  event.respondWith(fetch(event.request).then(async response=>{
   if(!response.ok)return response;
   let body=await response.text();
   if(!body.includes('literatura.js'))body=body.replace(/<\\/body>/i,'<script src="./literatura.js"></script>\\n</body>');
   const headers=new Headers(response.headers);headers.delete('content-length');
   const enhanced=new Response(body,{status:response.status,statusText:response.statusText,headers});
   caches.open(CACHE).then(cache=>cache.put(event.request,enhanced.clone()));
   return enhanced;
  }).catch(()=>caches.match(event.request)));
  return;
 }
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
});
