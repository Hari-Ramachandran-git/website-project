// Build a self-contained preview for environments that cannot bind a local port.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
const assets = 'frontend/dist/assets';
const js = readFileSync(`${assets}/${readdirSync(assets).find(f=>f.endsWith('.js'))}`, 'utf8');
const css = readFileSync(`${assets}/${readdirSync(assets).find(f=>f.endsWith('.css'))}`, 'utf8');
let script=js;
for (const name of ['hero','emerald','rose','gold']) {
 const data=`data:image/webp;base64,${readFileSync(`frontend/public/images/${name}.webp`).toString('base64')}`;
 script=script.replaceAll(`/images/${name}.webp`,data);
 // The occasion cards generate their image paths at runtime.
}
const imageMap=Object.fromEntries(['hero','emerald','rose','gold'].map(n=>[`/images/${n}.webp`,`data:image/webp;base64,${readFileSync(`frontend/public/images/${n}.webp`).toString('base64')}`]));
const imageLoader=`const imageMap=${JSON.stringify(imageMap)}; const imageDescriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(HTMLImageElement.prototype,'src',{...imageDescriptor,set(value){imageDescriptor.set.call(this,imageMap[value]||value)}}); const originalSet=Element.prototype.setAttribute;Element.prototype.setAttribute=function(name,value){return originalSet.call(this,name,name==='src'&&imageMap[value]?imageMap[value]:value)};`;
const head=readFileSync('frontend/index.html','utf8').split('</head>')[0].replace('<!doctype html>','');
mkdirSync('artifacts',{recursive:true});
writeFileSync('artifacts/preview.html',`<!doctype html>${head}<style>${css}</style></head><body><div id="root"></div><script>${imageLoader}</script><script type="module">${script}</script></body></html>`);
console.log('Standalone preview: artifacts/preview.html');
