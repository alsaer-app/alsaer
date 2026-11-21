/* محرك تلوين أحكام التجويد لنص رواية ورش (KFGQPC Uthmanic Warsh v10).
   يقرأ علامات النص نفسه (السكون، الشدة، التنوين المركّب، الإقلاب ۢ، ألف الوصل، المدّ ٓ، الألف الخنجرية، صلة الهاء…)
   ويُرجع لكل حرف رقم لون: 0 أخضر (غنّة/إخفاء/إدغام بغنة/إقلاب) · 1 رمادي (لا يُنطق/إدغام بلا غنة)
   2 أحمر (مد لازم) · 3 برتقالي (مد متصل/منفصل/صلة) · 4 كهرماني (مد طبيعي/بدل/عارض/لين) · 5 أزرق (قلقلة)
   الاستخدام: WTJ.analyze(نص_الآية, نص_الآية_التالية_أو_'') ← Int8Array بطول النص (-1 = بلا لون). */
var WTJ=(function(){
  var RANK=[3,5,0,1,4,2]; /* أولوية عند تداخل حكمين: الأحمر ثم البرتقالي ثم الأزرق ثم الأخضر ثم الكهرماني ثم الرمادي */
  var HAMZA={0x621:1,0x623:1,0x624:1,0x625:1,0x626:1};
  var SUN={0x62A:1,0x62B:1,0x62F:1,0x630:1,0x631:1,0x632:1,0x633:1,0x634:1,0x635:1,0x636:1,0x637:1,0x638:1,0x644:1,0x646:1};
  var IKHFA={0x62A:1,0x62B:1,0x62C:1,0x62F:1,0x630:1,0x632:1,0x633:1,0x634:1,0x635:1,0x636:1,0x637:1,0x638:1,0x641:1,0x642:1,0x643:1};
  var QALQ={0x642:1,0x637:1,0x628:1,0x62C:1,0x62F:1};
  var PREFIX={0x648:1,0x641:1,0x628:1,0x643:1,0x644:1};
  var NOON=0x646,MEEM=0x645,ALEF=0x627,WAW=0x648,YEH=0x64A,MAKS=0x649,BARREE=0x6D2,LAM=0x644,BAA=0x628,RAA=0x631;
  function isBase(c){return (c>=0x621&&c<=0x63A)||(c>=0x641&&c<=0x64A)}
  function isMark(c){return (c>=0x64B&&c<=0x65F)||c===0x670||(c>=0x6D6&&c<=0x6ED&&c!==0x6DE&&c!==0x6E9)}
  function isMaddLetter(b){return b===ALEF||b===WAW||b===YEH||b===MAKS||b===BARREE}

  function parse(s){
    var cl=[],cur=null,word=0,nw=true,i,c,j,d;
    for(i=0;i<s.length;i++){
      c=s.charCodeAt(i);
      if(c===32||c===0xA0||c===0x200F){nw=true;continue}
      if(c>=0x660&&c<=0x669)break; /* رقم الآية: نهاية النص */
      if(c===0x6DE||c===0x6E9)continue;
      if(isBase(c)||c===0x6D2){
        if(nw){word++;nw=false}
        cur=mk(c,i,word);cl.push(cur);continue;
      }
      if(c===0x640){ /* التطويل: حامل للعلامات؛ إن حمل همزة فهو همزة وإلا ضُمّت علاماته للحرف السابق */
        j=i+1;var hz=false;
        while(j<s.length&&isMark(s.charCodeAt(j))){d=s.charCodeAt(j);if(d===0x654||d===0x655)hz=true;j++}
        if(hz){if(nw){word++;nw=false}cur=mk(0x621,i,word);cl.push(cur)}
        continue;
      }
      if(isMark(c)&&cur)addMark(cur,c,i);
    }
    return cl;
  }
  function mk(b,i,w){return {b:b,s:i,e:i+1,w:w,sh:0,sk:0,fa:0,da:0,ki:0,tz:0,ts:-1,mad:-1,dg:-1,sw:-1,sy:-1,iq:-1,wasl:0,ext:0,art:0}}
  function addMark(C,c,i){
    if(c>=0x6D6&&c<=0x6DC)return; /* علامات الوقف لا تُلوَّن */
    C.e=i+1;
    switch(c){
      case 0x64E:C.fa=1;break;case 0x64F:C.da=1;break;case 0x650:C.ki=1;break;
      case 0x64B:case 0x64C:case 0x64D:C.tz=1;break; /* تنوين ظاهر = إظهار */
      case 0x657:case 0x65E:case 0x656:C.ts=i;break; /* تنوين مركّب = إدغام/إخفاء */
      case 0x651:C.sh=1;break;case 0x652:C.sk=1;break;
      case 0x653:C.mad=i;break;
      case 0x670:C.dg=i;break;
      case 0x6E5:C.sw=i;break;case 0x6E6:C.sy=i;break;
      case 0x6E2:C.iq=i;break;
      case 0x6EC:case 0x6EA:case 0x6DF:C.wasl=1;break;
    }
  }
  function bare(C){return !C.sh&&!C.sk&&!C.fa&&!C.da&&!C.ki&&!C.tz&&C.ts<0&&C.iq<0}

  function analyze(text,next){
    var A=parse(text),nA=A.length,cl=A,res=new Int8Array(text.length),i,k;
    for(i=0;i<res.length;i++)res[i]=-1;
    if(!nA)return res;
    if(next){
      var B=parse(next),off=A[nA-1].w+1;
      for(i=0;i<B.length;i++){B[i].w+=off;B[i].ext=1}
      cl=A.concat(B);
    }
    function paint(a,b,k){for(var x=a;x<b;x++){if(res[x]<0||RANK[k]<RANK[res[x]])res[x]=k}}
    function cluster(C,k){paint(C.s,C.e,k)}
    function sameWord(a,b){return a&&b&&a.w===b.w}
    function prevOf(i){return (i>0&&cl[i-1].w===cl[i].w)?cl[i-1]:null}
    function lastInWord(i){return !cl[i+1]||cl[i+1].w!==cl[i].w}
    /* الحرف التالي مع تخطي الألف الساكنة غير المنطوقة بعد واو الجماعة */
    function nextOf(i){var j=i+1;while(cl[j]&&cl[j].b===ALEF&&cl[j].sk&&!cl[j].wasl)j++;return cl[j]||null}
    function silentAlef(C){return C.b===ALEF&&C.sk&&!C.wasl}

    /* مرحلة أولى: ال التعريف (ألف الوصل + لام شمسية/قمرية) */
    for(i=1;i<cl.length;i++){
      var L=cl[i],P=cl[i-1];
      if(L.b!==LAM||P.w!==L.w||P.b!==ALEF||L.da||L.ki||L.tz||L.ts>=0||L.sh)continue;
      if(P.sh||P.sk||P.tz)continue;
      var naql=!!L.fa; /* لام بالفتح بعد ألف التعريف: نقل حركة الهمزة (بِالَاخِرَةِ، اِ۬لَارْضِ) */
      if(naql&&!(cl[i+1]&&cl[i+1].w===L.w&&cl[i+1].b===ALEF&&bare(cl[i+1])))continue;
      /* الألف يسبقها بادئات (و ف ب ك ل) فقط، بحد أقصى اثنتان، لكل منها حركة */
      var j=i-2,np=0,ok=true;
      while(j>=0&&cl[j].w===L.w){if(!PREFIX[cl[j].b]||cl[j].sk||cl[j].sh)ok=false;np++;j--}
      if(!ok||np>2)continue;
      var nx=cl[i+1];
      if(naql){P.art=1;nx.art=1;if(!P.ext&&(i-1>0))cluster(P,1);continue}
      if(L.sk){P.art=1;if(!P.ext&&(i-1>0))cluster(P,1);continue} /* قمرية: تُحذف الألف وصلًا */
      if(nx&&nx.w===L.w&&(SUN[nx.b]||nx.sh)){P.art=1;if(!L.ext)cluster(L,1);if(!P.ext&&(i-1>0))cluster(P,1)}
    }

    for(i=0;i<nA;i++){
      var C=cl[i],P2=prevOf(i),N0=cl[i+1]||null,N=N0,isLastCl=(i===nA-1);

      /* ألف الوصل بعلامات ورش */
      if(C.b===ALEF&&C.wasl&&!C.art&&i>0)cluster(C,1);
      /* ألف ساكنة بعد واو الجماعة لا تُنطق */
      if(silentAlef(C))cluster(C,1);

      /* غنّة: نون أو ميم مشدّدة */
      if((C.b===NOON||C.b===MEEM)&&C.sh)cluster(C,0);

      /* إقلاب: علامة الميم الصغيرة ۢ */
      if(C.iq>=0){if(C.b===NOON)cluster(C,0);else paint(C.iq,C.iq+1,0)}

      /* تنوين مركّب: إدغام/إخفاء حسب الحرف التالي */
      var TN=nextOf(i);
      if(TN&&TN.b===ALEF&&TN.wasl)TN=cl[cl.indexOf(TN)+1]||null; /* ألف الوصل تُسقَط: العبرة بما بعدها (عَاداٗ اَ۬لُّولَىٰ) */
      if(C.ts>=0&&TN&&TN.b!==ALEF){
        var t=TN.b;N=TN;
        if(t===YEH||t===NOON||t===MEEM||t===WAW){paint(C.ts,C.ts+1,0);if(!N.ext)cluster(N,0)}
        else if(t===LAM||t===RAA)paint(C.ts,C.ts+1,1);
        else if(t===BAA||IKHFA[t])paint(C.ts,C.ts+1,0);
      }

      N=N0;
      /* نون ساكنة (بالسكون أو بلا علامة) */
      if(C.b===NOON&&C.iq<0&&!C.sh&&!C.fa&&!C.da&&!C.ki&&!C.tz&&C.ts<0&&N&&N.b!==ALEF){
        var sw=sameWord(C,N),t2=N.b;
        if(sw){if(IKHFA[t2]||t2===BAA)cluster(C,0)}
        else if(t2===YEH||t2===NOON||t2===MEEM||t2===WAW){cluster(C,0);if(!N.ext)cluster(N,0)}
        else if(t2===LAM||t2===RAA)cluster(C,1);
        else if(t2===BAA||IKHFA[t2])cluster(C,0);
      }

      /* ميم ساكنة آخر الكلمة: إخفاء شفوي قبل الباء، وإدغام مثلين قبل الميم */
      if(C.b===MEEM&&!C.sh&&!C.fa&&!C.da&&!C.ki&&!C.tz&&C.ts<0&&C.iq<0&&lastInWord(i)&&N&&!sameWord(C,N)){
        if(N.b===BAA)cluster(C,0);
        else if(N.b===MEEM&&N.sh){cluster(C,0);if(!N.ext)cluster(N,0)}
      }

      /* إدغام حرف ساكن آخر الكلمة في مثله/مقاربه (الحرف التالي مشدّد) */
      if(bare(C)&&C.mad<0&&C.dg<0&&C.sw<0&&C.sy<0&&!isMaddLetter(C.b)&&C.b!==NOON&&C.b!==MEEM&&!HAMZA[C.b]&&!C.wasl&&
         lastInWord(i)&&N&&!sameWord(C,N)&&N.sh){cluster(C,1)}

      /* قلقلة */
      if(QALQ[C.b]&&(C.sk||isLastCl))cluster(C,5);

      /* المدود */
      var madd=-1; /* موضع الحرف/العلامة الملوّنة */
      if(isMaddLetter(C.b)&&!C.art&&!C.wasl&&!silentAlef(C)&&C.dg<0&&C.sw<0&&C.sy<0&&P2&&!C.sh&&!C.sk&&!C.fa&&!C.da&&!C.ki&&!C.tz&&C.ts<0&&C.iq<0){
        var okm=false;
        if(C.b===ALEF)okm=!!P2.fa;
        else if(C.b===WAW)okm=!!P2.da;
        else if(C.b===MAKS)okm=!!(P2.ki||P2.fa);
        else okm=!!P2.ki; /* ي ، ے */
        if(okm){
          var kk=maddClass(C,nextOf(i),C.mad>=0,nA);
          cluster(C,kk);
        }
      }
      if(C.dg>=0){ /* ألف خنجرية */
        var k1=maddClass(C,nextOf(i),C.mad>=0,nA);
        paint(C.dg,C.dg+1,k1);if(C.mad>=0)paint(C.mad,C.mad+1,k1);
      }
      if(C.sw>=0||C.sy>=0){ /* صلة هاء الضمير ۥ ۦ */
        var k2=maddClass(C,nextOf(i),C.mad>=0,nA),pos=C.sw>=0?C.sw:C.sy;
        paint(pos,pos+1,k2);if(C.mad>=0)paint(C.mad,C.mad+1,k2);
      }
      /* حروف المقطّعات: حرف حامل لعلامة المد (مد لازم حرفي) */
      if(C.mad>=0&&!isMaddLetter(C.b)&&!HAMZA[C.b]&&C.dg<0&&C.sw<0&&C.sy<0)cluster(C,2);
      /* مد اللين عند الوقف: واو/ياء ساكنة بعد فتح ثم حرف أخير */
      if((C.b===WAW||C.b===YEH||C.b===MAKS)&&C.sk&&P2&&P2.fa&&i===nA-2)cluster(C,4);
    }
    return res;
  }
  /* نوع المد حسب ما يليه */
  function maddClass(C,Nx,hasMaddah,nA){
    var k=4;
    if(Nx){
      if(HAMZA[Nx.b])k=3;
      else if(Nx.w===C.w&&(Nx.sh||Nx.sk))k=2;
    }
    if(k===4&&hasMaddah)k=3;
    return k;
  }
  return {analyze:analyze};
})();
if(typeof module!=='undefined')module.exports=WTJ;
