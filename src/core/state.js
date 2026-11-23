var S=load(), tab='home', unlocked=!S.pin, draft=null, draftTrig=null, covered=false, confirmRelapse=false, confirmReset=false;
var secMethod='pin',secStage='choose',secOldOk=false,secOk='';
var calD=new Date(), calSel=null, group='morning', qi=new Date().getDate(), secs=null, tmr=null, timerDeadline=0, msg='', toastT=null;
var lastTab=null,navTrail=['home'],backPopHandling=false,backHistoryReady=false,pressKey=null,pressXY=null,splash=true, obStep=1, obGender='male', per='week', addingHabit=false, addingHabitType='good', addingWorship=false, showPrivacy=false, showLog=false,  rd=null, setOpen=null;
var app=document.getElementById('app'), tabs=document.getElementById('tabs'), top=document.getElementById('top'), toastEl=document.getElementById('toast');
var NAV=[['home','الرئيسية','home'],['calendar','التقويم','cal'],['progress','التقدم','chart'],['more','المزيد','menu']];
var PARENT={asma:'more',msb:'more',hisn:'more',ahadith:'more',month:'more',sacred:'more',chal:'more',muh:'more',floatfeed:'settings',floatset:'settings',widgetset:'settings',books:'more',occasions:'more',cards:'more',hifz:'more',khushu:'more',ramadan:'more',khatma:'more',weekly:'more',notes:'more',zakat:'more',qada:'more',backup:'settings',tasbih:'more',worship:'home',reminders:'settings',fasting:'home',reader:'quran',prayers:'home',quran:'home',adhkar:'home',habits:'home',boost:'more',ach:'more',developer:'settings',ptloc:'prayers',settings:'more'};
var TITLES={asma:'أسماء الله الحسنى',msb:'المسبحة',hisn:'حصن المسلم',ahadith:'الأحاديث النبوية',month:'ملخص الشهر',sacred:'الأوقات المستحبة',chal:'تحدّي ٣٠ يومًا',muh:'محاسبة النفس',floatfeed:'جدولة النوافذ العائمة',floatset:'شكل النوافذ العائمة',widgetset:'الودجت',books:'كتابي',occasions:'المناسبات الهجرية',cards:'بطاقات المشاركة',hifz:'متابعة الحفظ',khushu:'الخشوع والتركيز',ramadan:'وضع رمضان',khatma:'ختمة القرآن',weekly:'إحصاءاتي',notes:'ملاحظاتي ومفضلتي',zakat:'حاسبة الزكاة',qada:'قضاء ما فاتك',backup:'النسخ الاحتياطي',tasbih:'المسبحة',worship:'عباداتي اليوم',reminders:'تذكيرات اليوم',fasting:'الصيام والتذكير',reader:'المصحف الشريف',calendar:'التقويم والمتابعة',progress:'التقدم والتقييم',more:'المزيد',prayers:'الصلوات',quran:'القرآن الكريم',adhkar:'الأذكار',habits:'العادات والتغيير',boost:'محفزات ولحظة الرغبة',ach:'الإنجازات والشارات',developer:'المطوّر وحقوق التطبيق',ptloc:'الموقع والمواقيت',settings:'الإعدادات'};
var TICON={asma:'star',msb:'beads',hisn:'beads',ahadith:'book',month:'chart',sacred:'moon',chal:'target',muh:'check',floatfeed:'bell',floatset:'sparkles',widgetset:'sparkles',books:'book',occasions:'cal',cards:'sparkles',hifz:'book',khushu:'beads',ramadan:'moon',khatma:'book',weekly:'chart',notes:'pen',zakat:'star',qada:'check',backup:'shield',tasbih:'beads',worship:'sparkles',reminders:'bell',fasting:'moon',reader:'book',calendar:'cal',progress:'chart',more:'menu',prayers:'mosque',quran:'book',adhkar:'beads',habits:'target',boost:'shield',ach:'trophy',developer:'star',ptloc:'mosque',settings:'gear'};

var ACC=[{id:'maleem',n:'الأصلي',l:'#017D84',l2:'#00535F',d:'#0E8A86',d2:'#0A4A51',g:'#5FCFC1'},
{id:'green',n:'أخضر',l:'#0E6B57',l2:'#0A5243',d:'#2FA586',d2:'#13574A'},{id:'blue',n:'أزرق',l:'#1D5FBF',l2:'#164A94',d:'#4C8DF0',d2:'#1B3F78'},
{id:'purple',n:'بنفسجي',l:'#6D3FC0',l2:'#532F96',d:'#9B7BEA',d2:'#43287A'},{id:'pink',n:'وردي',l:'#C2366E',l2:'#962A56',d:'#EC6A9C',d2:'#7A2348'},
{id:'orange',n:'برتقالي',l:'#C2571A',l2:'#964314',d:'#F08A4B',d2:'#7A3912'},{id:'teal',n:'تركواز',l:'#0E7490',l2:'#0B5A70',d:'#2BB3D3',d2:'#0E4C5E'},
{id:'terracotta',n:'طوبي',l:'#B5532A',l2:'#8E3F1F',d:'#E08A5C',d2:'#6E301A'},{id:'ocean',n:'محيط',l:'#0B5C86',l2:'#084664',d:'#4FB0E0',d2:'#0E4560'},
{id:'gold',n:'ذهبي',l:'#9A7410',l2:'#7A5C0C',d:'#B38B1C',d2:'#6B5410'},
{id:'lamsa',n:'أُرجوانية',l:'#A63FC4',l2:'#7E2A99',d:'#D58BEA',d2:'#6B2C85',g:'#EBC4F7'}];
var STY={calm:{n:'هادئ',dark:false,pv:['#EEF6F6','#FFFFFF','#017D84']},midnight:{n:'منتصف الليل',dark:true,pv:['#000000','#1A1A1F','#4C8DF0']},paper:{n:'ورقي دافئ',dark:false,pv:['#F6F1E7','#FFFBF3','#B5532A']},royal:{n:'ملكي',dark:true,pv:['#0A1020','#1B2540','#D4AF37']},ocean:{n:'محيط',dark:false,pv:['#EAF3F8','#FFFFFF','#0B5C86']},lamsa:{n:'لمسة',dark:false,pv:['#FBF3FF','#FFFFFF','#A63FC4']},fajr:{n:'فجر',dark:true,pv:['#0E1626','#1B2A47','#FFB067']},rose:{n:'وردي',dark:false,pv:['#FFF1F5','#FFFFFF','#D6336C']}};
var LOOKS=[['classic','كلاسيك','الشكل الأصلي'],['flat','مسطح','حدود رفيعة بلا ظلال'],['compact','مضغوط','مسافات أقل وخط أصغر'],['comfy','مريح','خط وأزرار أكبر'],['soft','ناعم','حواف دائرية'],['noor','شروق','زجاجي هادئ بلمسات ذهبية']];
var HAPS=[['off','بلا'],['light','خفيف'],['mid','متوسط'],['strong','قوي']];
function hapGo(p){var l=(U().hap)||'mid';if(l==='off'||!navigator.vibrate)return false;var k={light:.6,mid:1,strong:2.4}[l]||1;try{return navigator.vibrate(p.map(function(x,i){return i%2?x:Math.round(x*k)}))}catch(e){return false}}
var FONTS=[['plex','الأصلي'],['cairo','كايرو'],['tajawal','تجوّل'],['almarai','المراعي'],['alexandria','الإسكندرية'],['readex','ريدكس']];
var PRESSES=[['bounce','نابضة','ينضغط الزر ويرتد قليلًا'],['soft','هادئة','ضغطة خفيفة بلا ارتداد'],['ripple','موجة','دائرة تمتد من مكان لمسك'],['glow','توهّج','حلقة بلون التطبيق حول الزر'],['none','بلا','بلا أي حركة']];
var TRANSES=[['rise','ناعمة','تظهر الشاشة وترتفع قليلًا'],['slide','انزلاق','تدخل الشاشة من الجانب'],['zoom','تكبير','تكبر الشاشة وهي تظهر'],['flow','تدفّق','تنساب الشاشة بنعومة مع تلاشٍ خفيف'],['fade','تلاشٍ','تظهر بهدوء في مكانها'],['none','فورية','بلا حركة']];
function pick(list,v,def){for(var i=0;i<list.length;i++){var id=Array.isArray(list[i])?list[i][0]:list[i];if(id===v)return v}return def}
function U(){var u=S.ui||(S.ui={});return u}
function uiMode(){var m=U().mode;if(m!=='light'&&m!=='dark'&&m!=='system'){try{m=localStorage.getItem(TKEY)==='light'?'light':'dark'}catch(e){m='dark'}}return m}
function isDark(){return document.documentElement.getAttribute('data-theme')!=='light'}
function mix(h,w,p){var c=function(s,i){return parseInt(s.substr(i,2),16)};var o='#';for(var i=1;i<7;i+=2){var v=Math.round(c(h,i)*(1-p)+c(w,i)*p);o+=(v<16?'0':'')+v.toString(16)}return o}
/* ---- English UI (runtime translation of Arabic UI strings; religious texts stay Arabic) ---- */

/* ---- نظام الساعة الموحّد: auto | 12 | 24 ---- */
function clkMode(){var m=S&&S.clockMode;if(m==='12'||m==='24'||m==='auto')return m;if(S&&S.clock12===false)return '24';if(S&&S.clock12===true)return '12';return 'auto'}
function clk12(){var m=clkMode();if(m==='12')return true;if(m==='24')return false;try{var o=new Intl.DateTimeFormat(undefined,{hour:'numeric'}).resolvedOptions();if(o.hourCycle)return o.hourCycle==='h12'||o.hourCycle==='h11';return !!o.hour12}catch(e){return false}}
function setClockMode(v){if(v!=='12'&&v!=='24')v='auto';S.clockMode=v;if(v==='auto')delete S.clock12;else S.clock12=(v==='12');
  try{var rc=JSON.parse(localStorage.getItem('alsaer_daily_reminders_v1')||'{}');if(v==='auto')delete rc.clock;else rc.clock=v;localStorage.setItem('alsaer_daily_reminders_v1',JSON.stringify(rc))}catch(x){}save()}
function hmFmt(hm){var m=/^(\d{1,2}):(\d{2})$/.exec(hm||'');if(!m)return '';var h=+m[1],L=typeof lang==='function'?lang():'ar',n=function(x){return L==='ar'?ar(x):String(x)};
  if(clk12())return n((h%12||12)+':'+m[2])+' '+(L==='ar'?(h<12?'ص':'م'):(h<12?'AM':'PM'));return n((h<10?'0':'')+h+':'+m[2])}
function clkSeg(attr){var m=clk12()?'12':'24',L=typeof lang==='function'?lang():'ar',T=L==='ar'?['١٢ ساعة','٢٤ ساعة']:['12-hour','24-hour'];
  return '<div class="rm-clock clk-seg">'+[['12',T[0]],['24',T[1]]].map(function(x){return '<label class="'+(m===x[0]?'on':'')+'"><input type="radio" name="clk-'+attr+'" '+(attr==='rem'?'data-rem-clock="'+x[0]+'"':'data-loc="clk" value="'+x[0]+'"')+' '+(m===x[0]?'checked':'')+'><b>'+x[1]+'</b></label>'}).join('')+'</div>'}
