// The inline script the root layout puts in <head>, run synchronously before
// anything else on the page. It is Meta's standard fbq stub (defines
// window.fbq and queues every call until fbevents.js arrives), plus the two
// things that must not wait for the SDK: the _fbp/_fbc cookies, and the
// first PageView with the event id its server copy will share.
//
// fbevents.js itself is loaded later, by MetaPixel.tsx, after hydration and on
// the first interaction or a short timer. Nothing here touches the network.
//
// Plain ES5 by hand: this string is not compiled by the bundler, and it runs
// on whatever browser opened the page. Cookie logic mirrors meta-cookies.ts.

/** The script body for a given pixel id. Empty string when there is no pixel. */
export function pixelBootstrap(pixelId: string): string {
  if (!pixelId) return "";
  const id = JSON.stringify(pixelId);
  return `(function(w,d,l){
if(l.pathname.indexOf('/admin')===0)return;
if(!w.fbq){var n=w.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!w._fbq)w._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];}
function read(k){var parts=d.cookie.split(';');for(var i=0;i<parts.length;i++){var p=parts[i].replace(/^\\s+/,'');var eq=p.indexOf('=');if(p.slice(0,eq)===k)return decodeURIComponent(p.slice(eq+1));}return null;}
function write(k,v){var s=k+'='+encodeURIComponent(v)+'; path=/; SameSite=Lax; max-age=7776000';var h=l.hostname;if(h.indexOf('.')>-1&&!/^\\d+\\.\\d+\\.\\d+\\.\\d+$/.test(h))s+='; domain='+h;d.cookie=s;}
var now=Date.now();
if(!read('_fbp')){var r='';for(var i=0;i<10;i++)r+=Math.floor(Math.random()*10);write('_fbp','fb.1.'+now+'.'+r);}
var m=/[?&]fbclid=([^&#]+)/.exec(l.search);
if(m&&!read('_fbc'))write('_fbc','fb.1.'+now+'.'+decodeURIComponent(m[1]));
var id=(w.crypto&&w.crypto.randomUUID)?w.crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var q=Math.random()*16|0;return(c==='x'?q:(q&3|8)).toString(16);});
w.fbq('init',${id});
w.fbq('track','PageView',{},{eventID:id});
w.__nbPageView={id:id,url:l.href};
})(window,document,location);`;
}
