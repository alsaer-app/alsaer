package com.ahmedalajmi.alsaer;

import java.util.Calendar;
import org.json.JSONObject;

/** Same local solar calculation as prayer-times.js, evaluated for each alarm date. */
final class PrayerClock {
    static double rad(double x){return x*Math.PI/180;}
    static double deg(double x){return x*180/Math.PI;}
    static double fix(double x,double n){return x-n*Math.floor(x/n);}
    static double[] sun(double jd){
        double d=jd-2451545,g=fix(357.529+0.98560028*d,360),q=fix(280.459+0.98564736*d,360),l=fix(q+1.915*Math.sin(rad(g))+.02*Math.sin(rad(2*g)),360),e=23.439-.00000036*d;
        double ra=fix(deg(Math.atan2(Math.cos(rad(e))*Math.sin(rad(l)),Math.cos(rad(l)))),360)/15;
        return new double[]{deg(Math.asin(Math.sin(rad(e))*Math.sin(rad(l)))),q/15-ra};
    }
    static double mid(double j,double t){return fix(12-sun(j+t)[1],24);}
    static double angle(double j,double lat,double a,double t,boolean before){
        double dc=sun(j+t)[0],x=(-Math.sin(rad(a))-Math.sin(rad(dc))*Math.sin(rad(lat)))/(Math.cos(rad(dc))*Math.cos(rad(lat)));
        if(x>1||x< -1)return Double.NaN;
        return mid(j,t)+(before?-1:1)*deg(Math.acos(x))/15;
    }
    static int minutes(Calendar date,JSONObject cfg){
        double lat=cfg.optDouble("lat"),lng=cfg.optDouble("lng");
        int y=date.get(Calendar.YEAR),m=date.get(Calendar.MONTH)+1,d=date.get(Calendar.DAY_OF_MONTH);
        if(m<=2){y--;m+=12;}double a=Math.floor(y/100.0),b=2-a+Math.floor(a/4);
        double j=Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+b-1524.5-lng/360;
        String method=cfg.optString("method","egypt"),key=cfg.optString("key");
        double fa=19.5,ia=17.5,im=0;
        if("mwl".equals(method)){fa=18;ia=17;}else if("karachi".equals(method)){fa=18;ia=18;}else if("makkah".equals(method)){fa=18.5;im=90;}
        double rise=angle(j,lat,.833,6.0/24,true),set=angle(j,lat,.833,18.0/24,false),v;
        if("fajr".equals(key))v=angle(j,lat,fa,5.0/24,true);
        else if("dhuhr".equals(key))v=mid(j,12.0/24)+1.0/60;
        else if("asr".equals(key)){double dc=sun(j+13.0/24)[0],an=-deg(Math.atan(1/(cfg.optInt("asr",1)+Math.tan(rad(Math.abs(lat-dc))))));v=angle(j,lat,an,13.0/24,false);}
        else if("maghrib".equals(key))v=set;
        else if("sunrise".equals(key))v=rise;
        else {
            if(im>0){try{android.icu.util.IslamicCalendar hi=new android.icu.util.IslamicCalendar();hi.setCalculationType(android.icu.util.IslamicCalendar.CalculationType.ISLAMIC_UMALQURA);hi.setTimeInMillis(date.getTimeInMillis());if(hi.get(android.icu.util.Calendar.MONTH)==8)im=120;}catch(Throwable ignored){} }
            v=im>0?set+im/60:angle(j,lat,ia,18.0/24,false);
        }
        if(Double.isNaN(v)&&!Double.isNaN(rise)&&!Double.isNaN(set)&&("fajr".equals(key)||"isha".equals(key)))v=fix(set+fix(rise-set+24,24)/2,24);
        if(Double.isNaN(v))return -1;
        double tz=(date.getTimeZone().getOffset(date.getTimeInMillis())/3600000.0),hours=fix(v+tz-lng/15+.5/60,24);
        return (int)Math.floor(hours*60)-cfg.optInt("pre",0);
    }
}
