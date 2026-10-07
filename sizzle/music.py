# Synthesizes a 128 BPM upbeat track (58 beats) -> music.wav
import numpy as np, wave
SR=44100; BPM=128; B=60/BPM; BEATS=58; N=int(SR*(BEATS*B+0.5))
rng=np.random.default_rng(7); out=np.zeros((N,2))
def add(sig,t,pan=0.0,g=1.0):
    i=int(t*SR); sig=sig[:max(0,N-i)]
    out[i:i+len(sig),0]+=sig*g*(1-max(pan,0)); out[i:i+len(sig),1]+=sig*g*(1+min(pan,0))
def env(n,a,d): 
    t=np.arange(n)/SR; return np.minimum(t/a,1)*np.exp(-t/d)
def lp(x,k):  # one-pole lowpass
    y=np.zeros_like(x); a=k
    for i in range(1,len(x)): y[i]=y[i-1]+a*(x[i]-y[i-1])
    return y
def kick():
    n=int(.35*SR); t=np.arange(n)/SR; f=45+110*np.exp(-t*28)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*9)*1.0
def clap():
    n=int(.25*SR); x=rng.standard_normal(n)*env(n,.001,.05)
    return (x-lp(x,.15))*0.55
def hat(d=.04,g=.3):
    n=int(.2*SR); x=rng.standard_normal(n)*env(n,.0005,d); return (x-lp(x,.5))*g
def note(f,n_s,wave_='saw',a=.005,d=.2):
    n=int(n_s*SR); t=np.arange(n)/SR
    if wave_=='saw': x=2*((t*f)%1)-1; x=.5*x+.5*(2*((t*f*1.005)%1)-1)
    else: x=np.sign(np.sin(2*np.pi*f*t))*.6+np.sin(2*np.pi*f*t)*.4
    return x*env(n,a,d)
mid=lambda m:440*2**((m-69)/12)
prog=[(45,[57,60,64]),(41,[53,57,60]),(48,[55,60,64]),(43,[55,59,62])]  # Am F C G
for beat in range(BEATS):
    t=beat*B; bar=beat//4; root,ch=prog[bar%4]
    hush = beat<4 and False
    add(kick(),t,0,1.0)
    if beat%2==1: add(clap(),t,0,.8)
    add(hat(),t+B/2,.2,.9)               # off-beat hat
    add(hat(.015,.18),t+B/4,-.2); add(hat(.015,.18),t+3*B/4,.2)
    for e in range(2):                   # driving eighth bass (sidechain-ish gap on kick)
        tt=t+e*B/2
        b=lp(note(mid(root+(12 if e else 0)-12+12),B/2,'saw',.004,.12),.12)*.55
        add(b,tt+.02,0,1.0)
    if beat%2==0 and beat>=4:            # chord stabs
        for m in ch: add(lp(note(mid(m+12),B*.9,'sq',.003,.18),.35)*.17,t+B*.5,(m%3-1)*.4)
    for s in range(4):                   # 16th arp
        if beat>=8:
            m=ch[(s+beat)%3]+24; add(lp(note(mid(m),B/4,'sq',.002,.07),.5)*.1,t+s*B/4,(s%2)*.6-.3)
# riser into CTA (beats 40-44) + impact at CTA
n=int(4*B*SR); x=rng.standard_normal(n); sw=np.linspace(0,1,n)**2
add((x-lp(x,.02))*sw*.35,42*B,0)
n=int(1.2*SR); imp=np.sin(2*np.pi*np.cumsum(60*np.exp(-np.arange(n)/SR*2))/SR)*np.exp(-np.arange(n)/SR*3)
add(imp*.9,46*B,0)
for bt in (6,12,18,28,34,40,46):          # scene-cut whooshes
    n=int(.3*SR); x=rng.standard_normal(n)*np.linspace(0,1,n)**3*np.exp(-np.linspace(0,3,n)); add((x-lp(x,.05))*.4,bt*B-.28,0)
out*= (1/np.abs(out).max())*.9
f=int(1.5*SR); out[-f:]*=np.linspace(1,0,f)[:,None]
pcm=(out*32767).astype('<i2')
w=wave.open('music.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
