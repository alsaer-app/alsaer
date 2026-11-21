package androidx.core.app;
import android.app.*; import android.content.Context; import android.net.Uri;
public class NotificationCompat {
 public static final int PRIORITY_HIGH=1; public static final String CATEGORY_REMINDER="reminder";
 public static class Style {}
 public static class BigTextStyle extends Style { public BigTextStyle bigText(CharSequence s){return this;} }
 public static class Builder { public Builder(Context c,String ch){}
  public Builder setLargeIcon(android.graphics.Bitmap b){return this;} public Builder setSmallIcon(int i){return this;} public Builder setContentTitle(CharSequence s){return this;} public Builder setContentText(CharSequence s){return this;}
  public Builder setStyle(Style s){return this;} public Builder setAutoCancel(boolean b){return this;} public Builder setContentIntent(PendingIntent p){return this;}
  public Builder setPriority(int p){return this;} public Builder setCategory(String s){return this;} public Builder setSound(Uri u){return this;} public Builder setVibrate(long[] v){return this;}
  public Builder addAction(int i,CharSequence t,PendingIntent p){return this;} public Notification build(){return null;} } }
