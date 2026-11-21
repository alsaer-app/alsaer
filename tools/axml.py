"""محرّر بسيط لملفات Android binary XML (AXML): تعديل السلاسل وإضافة صلاحيات وتعديل versionCode/versionName.
يعمل دون أدوات Android. التحقق: أعد التحليل وقارن (round-trip)."""
import struct

RES_XML=0x0003; RES_STRING_POOL=0x0001; RES_XML_RESOURCE_MAP=0x0180
START=0x0102; END=0x0103
ATTR_VERSION_CODE=0x0101021b; ATTR_VERSION_NAME=0x0101021c; ATTR_NAME=0x01010003

class AXML:
    def __init__(self,data):
        t,hs,sz=struct.unpack_from('<HHI',data,0); assert t==RES_XML and hs==8 and sz==len(data)
        self.chunks=[]; off=8
        while off<len(data):
            ct,chs,csz=struct.unpack_from('<HHI',data,off); self.chunks.append([ct,bytearray(data[off:off+csz])]); off+=csz
        assert self.chunks[0][0]==RES_STRING_POOL
        self._parse_pool(self.chunks[0][1])
    def _parse_pool(self,c):
        _,_,_,sc,stc,flags,ss,sts=struct.unpack_from('<HHIIIIII',c,0)
        assert stc==0 and sts==0
        self.utf8=bool(flags&0x100); offs=struct.unpack_from('<%dI'%sc,c,28); self.strings=[]
        for o in offs:
            p=ss+o
            if self.utf8:
                n=c[p]; p+=1
                if n&0x80: n=((n&0x7f)<<8)|c[p]; p+=1
                b=c[p]; p+=1
                if b&0x80: b=((b&0x7f)<<8)|c[p]; p+=1
                self.strings.append(bytes(c[p:p+b]).decode('utf-8'))
            else:
                n=struct.unpack_from('<H',c,p)[0]; p+=2
                if n&0x8000: n=((n&0x7fff)<<16)|struct.unpack_from('<H',c,p)[0]; p+=2
                self.strings.append(bytes(c[p:p+n*2]).decode('utf-16-le'))
    def _build_pool(self):
        body=bytearray(); offs=[]
        for s in self.strings:
            offs.append(len(body))
            if self.utf8:
                b=s.encode('utf-8'); n=len(s)
                body+= (bytes([n]) if n<0x80 else bytes([0x80|(n>>8),n&0xff]))
                body+= (bytes([len(b)]) if len(b)<0x80 else bytes([0x80|(len(b)>>8),len(b)&0xff]))
                body+=b+b'\0'
            else:
                n=len(s); u=s.encode('utf-16-le')
                body+= struct.pack('<H',n)+u+b'\0\0'
        while len(body)%4: body+=b'\0'
        ss=28+4*len(self.strings)
        hdr=struct.pack('<HHIIIIII',RES_STRING_POOL,28,ss+len(body),len(self.strings),0,0x100 if self.utf8 else 0,ss,0)
        self.chunks[0][1]=bytearray(hdr+struct.pack('<%dI'%len(offs),*offs)+body)
    def sidx(self,s):
        if s not in self.strings: self.strings.append(s)
        return self.strings.index(s)
    def resmap(self):
        for c in self.chunks:
            if c[0]==RES_XML_RESOURCE_MAP: return list(struct.unpack_from('<%dI'%((len(c[1])-8)//4),c[1],8))
        return []
    def _attr_id(self,name_idx):
        rm=self.resmap(); return rm[name_idx] if name_idx<len(rm) else None
    def elements(self):
        for i,(t,b) in enumerate(self.chunks):
            if t==START: yield i
    def elem_name(self,i): return self.strings[struct.unpack_from('<I',self.chunks[i][1],20)[0]]
    def attrs(self,i):
        b=self.chunks[i][1]; ac=struct.unpack_from('<H',b,28)[0]; res=[]
        for k in range(ac):
            o=36+20*k; ns,nm,raw,sz,r0,dt,data=struct.unpack_from('<IIIHBBI',b,o); res.append((o,ns,nm,raw,dt,data))
        return res
    def set_attr_int(self,i,attr_id,val):
        for o,ns,nm,raw,dt,data in self.attrs(i):
            if self._attr_id(nm)==attr_id:
                assert dt==0x10; struct.pack_into('<I',self.chunks[i][1],o+16,val); return True
        return False
    def set_attr_str(self,i,attr_id,val):
        for o,ns,nm,raw,dt,data in self.attrs(i):
            if self._attr_id(nm)==attr_id:
                idx=self.sidx(val); struct.pack_into('<I',self.chunks[i][1],o+8,idx); struct.pack_into('<I',self.chunks[i][1],o+16,idx); return True
        return False
    def set_attr_bool(self,i,attr_id,val):
        for o,ns,nm,raw,dt,data in self.attrs(i):
            if self._attr_id(nm)==attr_id:
                assert dt==0x12; struct.pack_into('<I',self.chunks[i][1],o+16,0xFFFFFFFF if val else 0); return True
        return False
    def get_attr_str(self,i,attr_id):
        for o,ns,nm,raw,dt,data in self.attrs(i):
            if self._attr_id(nm)==attr_id and dt==3: return self.strings[data]
    def add_permission(self,name):
        have=[self.get_attr_str(i,ATTR_NAME) for i in self.elements() if self.elem_name(i)=='uses-permission']
        if name in have: return False
        last=max(i for i in self.elements() if self.elem_name(i)=='uses-permission')
        assert self.chunks[last+1][0]==END
        st=bytearray(self.chunks[last][1]); en=bytearray(self.chunks[last+1][1])
        tmp=[[START,st]]; save=self.chunks[last]; self.chunks[last]=tmp[0]
        self.set_attr_str(last,ATTR_NAME,name); self.chunks[last]=save
        self.chunks[last+2:last+2]=[[START,st],[END,en]]
        return True
    def dump(self):
        self._build_pool(); body=b''.join(bytes(b) for _,b in self.chunks)
        return struct.pack('<HHI',RES_XML,8,8+len(body))+body

if __name__=='__main__':
    import sys; d=open(sys.argv[1],'rb').read(); a=AXML(d); out=a.dump(); print('roundtrip identical:',out==d, len(d),len(out))
