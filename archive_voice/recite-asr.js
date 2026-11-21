/* ===== مصدر الصوت لشاشة «التلاوة» =====
   يلتقط الميكروفون، يقطّع الكلام عند فترات الصمت، ويرسل كل مقطع إلى نموذج Whisper يعمل داخل الجهاز (transformers.js + onnxruntime-web).
   المكتبة والنموذج يُنزَّلان من الإنترنت عند أول استخدام فقط ثم يُحفظان في ذاكرة المتصفح. غيّر RC_MODEL لتبديل النموذج. */
var RC_LIB='https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2',RC_MODEL='onnx-community/whisper-base';
var rcAsr={p:null,pipe:null,rec:null};
function rcAsrLoad(say){
  if(window.__RC_TRANSCRIBE)return Promise.resolve(window.__RC_TRANSCRIBE);
  if(rcAsr.pipe)return Promise.resolve(rcAsr.pipe);
  if(rcAsr.p)return rcAsr.p;
  say('جارٍ تجهيز محرّك التعرّف…',true);
  rcAsr.p=import(RC_LIB).then(function(T){
    T.env.allowLocalModels=false;T.env.useBrowserCache=true;
    var files={};
    return T.pipeline('automatic-speech-recognition',RC_MODEL,{dtype:'q8',device:'wasm',progress_callback:function(p){
      try{if(p&&p.file&&p.total){files[p.file]=[p.loaded||0,p.total];var l=0,t=0;for(var k in files){l+=files[k][0];t+=files[k][1]}
        say('جارٍ تنزيل نموذج التعرّف (مرة واحدة)… '+ar(Math.round(l/t*100))+'٪',true)}}catch(e){}}});
  }).then(function(pipe){
    rcAsr.pipe=function(a){return pipe(a,{language:'arabic',task:'transcribe',chunk_length_s:30}).then(function(r){return String(r&&r.text||'')})};
    return rcAsr.pipe;
  }).catch(function(e){rcAsr.p=null;throw e});
  return rcAsr.p;
}
function rcAsrStop(){
  var r=rcAsr.rec;rcAsr.rec=null;if(!r)return;r.dead=true;
  try{r.node.disconnect()}catch(e){}try{r.src.disconnect()}catch(e){}
  try{r.stream.getTracks().forEach(function(t){t.stop()})}catch(e){}try{r.ctx.close()}catch(e){}
}
window.ReciteASR={
  start:function(onText,onErr,say){
    say=say||function(){};
    rcAsrStop();
    var gen={dead:false,id:Math.random()};rcAsr.rec=gen;
    var md=navigator.mediaDevices;
    if(!md||!md.getUserMedia){onErr('الميكروفون غير متاح على هذا الجهاز.');return}
    Promise.all([rcAsrLoad(say),md.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,channelCount:1}})]).then(function(rs){
      var tx=rs[0],stream=rs[1];
      if(rcAsr.rec!==gen||gen.dead){stream.getTracks().forEach(function(t){t.stop()});return}
      var C=window.AudioContext||window.webkitAudioContext,ctx=new C(),sr=ctx.sampleRate,src=ctx.createMediaStreamSource(stream),node=ctx.createScriptProcessor(4096,1,1),mute=ctx.createGain();
      mute.gain.value=0;src.connect(node);node.connect(mute);mute.connect(ctx.destination);
      try{ctx.resume()}catch(e){}
      gen.ctx=ctx;gen.stream=stream;gen.src=src;gen.node=node;
      var buf=[],len=0,speech=0,quiet=0,floor=0.008,pre=[],q=[],busy=false;
      function down(a){if(sr===16000)return a;var f=sr/16000,n=Math.floor(a.length/f),o=new Float32Array(n),i,j,s,c,k;
        for(i=0;i<n;i++){s=0;c=0;for(j=Math.floor(i*f);j<Math.floor((i+1)*f)&&j<a.length;j++){s+=a[j];c++}o[i]=c?s/c:0}return o}
      function cut(){
        if(!len)return;var all=new Float32Array(len),o=0;buf.forEach(function(b){all.set(b,o);o+=b.length});buf=[];len=0;speech=0;quiet=0;
        if(q.length<3)q.push(all);run()
      }
      function run(){
        if(busy||!q.length||gen.dead)return;busy=true;var a=q.shift();say('جارٍ التعرّف على التلاوة…',true);
        Promise.resolve(tx(a)).then(function(t){if(gen.dead)return;say('',false);if(t&&t.trim())onText(t)}).catch(function(e){if(!gen.dead)say('تعذّر التعرّف على هذا المقطع.',false)}).then(function(){busy=false;run()});
      }
      node.onaudioprocess=function(ev){
        if(gen.dead)return;
        var raw=ev.inputBuffer.getChannelData(0),x=down(new Float32Array(raw)),s=0,i;
        for(i=0;i<x.length;i++)s+=x[i]*x[i];var rms=Math.sqrt(s/x.length),dur=x.length/16000;
        if(rms<floor*2.2)floor=floor*0.95+rms*0.05;var th=Math.max(0.02,floor*3);
        if(rms>th){speech+=dur;quiet=0;if(pre.length){pre.forEach(function(b){buf.push(b);len+=b.length});pre=[]}buf.push(x);len+=x.length}
        else{
          if(speech>0){quiet+=dur;buf.push(x);len+=x.length;if(quiet>=0.8){if(speech>=0.35)cut();else{buf=[];len=0;speech=0;quiet=0}}}
          else{pre.push(x);if(pre.length>2)pre.shift()}
        }
        if(len>16000*12)cut();
      };
      say('',false);
    }).catch(function(e){
      var n=e&&e.name,m=String(e&&e.message||e||'');
      if(n==='NotAllowedError'||n==='SecurityError')onErr('لم يُسمح بالميكروفون. فعّله من إعدادات الهاتف ← التطبيقات ← السائر ← الأذونات.');
      else if(/fetch|network|load|import|Failed|Unauthorized|404/i.test(m))onErr('تعذّر تنزيل نموذج التعرّف. تأكد من الإنترنت وأعد المحاولة.');
      else onErr('تعذّر تشغيل التعرّف على الصوت.');
    });
  },
  stop:function(){rcAsrStop()}
};
document.addEventListener('visibilitychange',function(){if(document.hidden&&rcAsr.rec){try{rcStop();render()}catch(e){}}});
