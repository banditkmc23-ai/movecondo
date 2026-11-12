// usage: node tr.js < strings.json  -> prints translations json
const fs=require('fs');
const noop=()=>{};
const cl={add:noop,remove:noop,contains:()=>false,toggle:noop};
const el={classList:cl,setAttribute:noop,getAttribute:()=>null,lang:'th',appendChild:noop,style:{}};
global.location={search:'?lang=en',href:'https://x/?lang=en',pathname:'/',hash:''};
global.localStorage={getItem:()=>null,setItem:noop};
global.URLSearchParams=URLSearchParams;
global.MutationObserver=function(){return{observe:noop,disconnect:noop}};
global.document={readyState:'loading',documentElement:el,addEventListener:noop,querySelectorAll:()=>[],querySelector:()=>null,body:el,title:'',createElement:()=>el,head:el};
global.window=global;
global.addEventListener=noop;
const src=fs.readFileSync(process.argv[2],'utf8');
(new Function('window',src.replace(/\}\)\(\s*(typeof window[^)]*|window|this)\s*\);?\s*$/,'})(window);')))(global);
const t=global.MC_I18N.t;
const inp=JSON.parse(fs.readFileSync(0,'utf8'));
const out={};for(const s of inp) out[s]=t(s);
process.stdout.write(JSON.stringify(out));
