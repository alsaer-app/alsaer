package com.ahmedalajmi.alsaer;

/** Full-key persistent request IDs, with no probabilistic hash collision. */
final class AlarmRequestIds {
    interface Store {
        int get(String key,int fallback);
        boolean save(String key,int value,int next);
    }
    static synchronized int allocate(Store store,String id,String purpose){
        // Length prefix distinguishes id/purpose boundaries even when either contains separators.
        String key="request-v2:"+id.length()+":"+id+purpose;
        int value=store.get(key,0);if(value>0)return value;
        int next=store.get("request-v2-next",1000000000);
        if(next<1000000000||next>=Integer.MAX_VALUE)throw new IllegalStateException("request ids exhausted or corrupt");
        if(!store.save(key,next,next+1))throw new IllegalStateException("request ids not saved");
        return next;
    }
}
