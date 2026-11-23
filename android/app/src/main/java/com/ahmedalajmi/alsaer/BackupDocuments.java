package com.ahmedalajmi.alsaer;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import org.json.JSONObject;
import java.io.*;
import java.nio.charset.StandardCharsets;

/** User-selected documents only. No broad storage permission or folder scanning. */
final class BackupDocuments {
    private static final int SAVE=48120, OPEN=48121, MAX=16*1024*1024;
    private final MainActivity activity;
    private String pending;
    private volatile boolean busy;
    BackupDocuments(MainActivity a){ activity=a; }
    void launch(boolean save,String content,String name){
        if(busy){reply("busy","", "",0);return;}
        busy=true; pending=content;
        try {
            Intent i=new Intent(save?Intent.ACTION_CREATE_DOCUMENT:Intent.ACTION_OPEN_DOCUMENT);
            i.addCategory(Intent.CATEGORY_OPENABLE);i.setType(save?"application/octet-stream":"*/*");
            if(save)i.putExtra(Intent.EXTRA_TITLE,name);
            activity.startActivityForResult(i,save?SAVE:OPEN);
        }catch(Exception e){busy=false;pending=null;reply("picker-failed","","",0);}
    }
    boolean onResult(int code,int result,Intent data){
        if(code!=SAVE&&code!=OPEN)return false;
        final String text=pending;pending=null;
        if(result!=Activity.RESULT_OK||data==null||data.getData()==null){busy=false;reply("cancelled","","",0);return true;}
        final Uri uri=data.getData();
        new Thread(()->{
            try {
                String name="backup";
                try(Cursor c=activity.getContentResolver().query(uri,new String[]{OpenableColumns.DISPLAY_NAME},null,null,null)){
                    if(c!=null&&c.moveToFirst())name=c.getString(0);
                }
                byte[] bytes;
                if(code==SAVE){
                    if(text==null)throw new IOException("interrupted");
                    bytes=text.getBytes(StandardCharsets.UTF_8);if(bytes.length>MAX)throw new IOException("size");
                    try(OutputStream out=activity.getContentResolver().openOutputStream(uri,"wt")){
                        if(out==null)throw new IOException("stream");out.write(bytes);out.flush();
                    }
                    reply("saved","",name,bytes.length);
                }else{
                    try(InputStream in=activity.getContentResolver().openInputStream(uri);ByteArrayOutputStream out=new ByteArrayOutputStream()){
                        if(in==null)throw new IOException("stream");byte[] buf=new byte[8192];int n;
                        while((n=in.read(buf))!=-1){if(out.size()+n>MAX)throw new IOException("size");out.write(buf,0,n);}bytes=out.toByteArray();
                    }
                    reply("opened",new String(bytes,StandardCharsets.UTF_8),name,bytes.length);
                }
            }catch(Exception e){reply("file-failed","","",0);}
            finally{busy=false;}
        },"alsaer-backup-document").start();
        return true;
    }
    private void reply(String status,String content,String name,long size){
        final String js="window.gdriveOnDocument&&window.gdriveOnDocument("+JSONObject.quote(status)+","+JSONObject.quote(content)+","+JSONObject.quote(name)+","+size+")";
        activity.runOnUiThread(()->{if(activity.getBridge()!=null&&activity.getBridge().getWebView()!=null)activity.getBridge().getWebView().evaluateJavascript(js,null);});
    }
}
