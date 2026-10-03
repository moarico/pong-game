(()=>{var ta=["a","b","x","y","lb","rb","lt","rt","view","menu","ls","rs","up","down","left","right","guide"],rm={solo:{up:["KeyW","ArrowUp"],down:["KeyS","ArrowDown"],left:["KeyA","ArrowLeft"],right:["KeyD","ArrowRight"],jump:["Space","KeyK"],boost:["ShiftLeft","ShiftRight","KeyL"],slide:["ControlLeft","KeyC","KeyJ"],rollL:["KeyQ","KeyU"],rollR:["KeyE","KeyO"],cam:["KeyR","KeyI"],pause:["Escape","KeyP"],item:["KeyF","KeyH"],mouse:{boost:0,jump:2,cam:1}},p1:{up:["KeyW"],down:["KeyS"],left:["KeyA"],right:["KeyD"],jump:["Space"],boost:["ShiftLeft"],slide:["ControlLeft","KeyC"],rollL:["KeyQ"],rollR:["KeyE"],cam:["KeyR"],pause:["Escape"],item:["KeyF"],mouse:{boost:0,jump:2,cam:1}},p2:{up:["ArrowUp"],down:["ArrowDown"],left:["ArrowLeft"],right:["ArrowRight"],jump:["KeyK","Numpad0"],boost:["KeyL","NumpadDecimal"],slide:["KeyJ","Numpad1"],rollL:["KeyU"],rollR:["KeyO"],cam:["KeyI","Numpad2"],pause:["KeyP"],item:["KeyH","Numpad3"]}},am=new Set(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab","ShiftLeft","ShiftRight","ControlLeft"]);function Eo(s,t,e=.16){let n=Math.hypot(s,t);if(n<e)return[0,0];let i=Math.min(1,(n-e)/(1-e))/n;return[s*i,t*i]}var nh=class{constructor(t){this.index=t,this.id="",this.connected=!1,this.b={},this.prev={};for(let e of ta)this.b[e]=0,this.prev[e]=0;this.lx=0,this.ly=0,this.rx=0,this.ry=0,this.triggerSeenNeg=[!1,!1],this.navRepeat={dir:"",t:0},this.raw=null}pressed(t){return this.b[t]>.5&&this.prev[t]<=.5}down(t){return this.b[t]>.5}},wo=class{constructor(){this.keys=new Set,this.keysPressed=new Set,this.mouse=new Set,this.mousePressed=new Set,this.gamepadBlocked=!1,this.rbIsItem=!1,this.pads=[],this.onActivity=null,this.onPadConnect=null,this.kbNav={dir:"",t:0},this.lastFrame=performance.now();try{navigator.gamepadInputEmulation="gamepad"}catch{}window.addEventListener("keydown",t=>{am.has(t.code)&&!(t.target&&t.target.tagName==="INPUT")&&t.preventDefault(),t.repeat||this.keysPressed.add(t.code),this.keys.add(t.code),this.onActivity&&this.onActivity()}),window.addEventListener("keyup",t=>{this.keys.delete(t.code)}),window.addEventListener("blur",()=>{this.keys.clear(),this.mouse.clear()}),window.addEventListener("pointerdown",()=>{this.onActivity&&this.onActivity()}),window.addEventListener("mousedown",t=>{this.mouse.has(t.button)||this.mousePressed.add(t.button),this.mouse.add(t.button),t.button===1&&t.preventDefault()}),window.addEventListener("mouseup",t=>{this.mouse.delete(t.button)}),window.addEventListener("mousemove",t=>{t.buttons&1||this.mouse.delete(0),t.buttons&2||this.mouse.delete(2),t.buttons&4||this.mouse.delete(1)}),window.addEventListener("contextmenu",t=>t.preventDefault()),window.addEventListener("gamepadconnected",t=>{this.onPadConnect&&this.onPadConnect(t.gamepad,!0)}),window.addEventListener("gamepaddisconnected",t=>{let e=this.pads[t.gamepad.index];e&&(e.connected=!1),this.onPadConnect&&this.onPadConnect(t.gamepad,!1)})}update(){let t=performance.now();this.dt=Math.min(.1,(t-this.lastFrame)/1e3),this.lastFrame=t;let e=[];try{e=navigator.getGamepads?navigator.getGamepads():[]}catch{e=[],this.gamepadBlocked=!0}for(let n of this.pads)n&&(n.connected=!1);for(let n=0;n<e.length;n++){let i=e[n];if(!i||!i.connected)continue;let r=this.pads[i.index]||(this.pads[i.index]=new nh(i.index));r.connected=!0,r.id=i.id,r.raw=i;for(let a of ta)r.prev[a]=r.b[a];if(this.readPad(r,i),this.onActivity){for(let a of ta)if(r.pressed(a)){this.onActivity();break}}}}readPad(t,e){let n=r=>e.buttons[r]?typeof e.buttons[r]=="object"?e.buttons[r].value||(e.buttons[r].pressed?1:0):e.buttons[r]:0,i=r=>e.axes[r]!==void 0?e.axes[r]:0;if(e.mapping==="standard"||e.axes.length<6)ta.forEach((r,a)=>{t.b[r]=n(a)}),[t.lx,t.ly]=Eo(i(0),i(1)),[t.rx,t.ry]=Eo(i(2),i(3));else{let r={a:0,b:1,x:2,y:3,lb:4,rb:5,view:6,menu:7,guide:8,ls:9,rs:10};for(let o of ta)t.b[o]=0;for(let o in r)t.b[o]=n(r[o]);let a=(o,l)=>{let c=i(o);return c<-.5&&(t.triggerSeenNeg[l]=!0),t.triggerSeenNeg[l]?(c+1)/2:Math.max(0,c)};t.b.lt=a(2,0),t.b.rt=a(5,1),t.b.left=i(6)<-.5?1:0,t.b.right=i(6)>.5?1:0,t.b.up=i(7)<-.5?1:0,t.b.down=i(7)>.5?1:0,[t.lx,t.ly]=Eo(i(0),i(1)),[t.rx,t.ry]=Eo(i(3),i(4))}}endFrame(){this.keysPressed.clear(),this.mousePressed.clear()}connectedPads(){return this.pads.filter(t=>t&&t.connected)}anyKey(t){for(let e of t)if(this.keys.has(e))return!0;return!1}anyKeyPressed(t){for(let e of t)if(this.keysPressed.has(e))return!0;return!1}keyboardControls(t){let e=rm[t],n=e.mouse,i=this.anyKey(e.up)?1:0,r=this.anyKey(e.down)?1:0,a=this.anyKey(e.left)?1:0,o=this.anyKey(e.right)?1:0,l=h=>!!n&&this.mouse.has(n[h]),c=h=>!!n&&this.mousePressed.has(n[h]);return{throttle:i-r,steer:o-a,pitch:r-i,yaw:o-a,roll:(this.anyKey(e.rollR)?1:0)-(this.anyKey(e.rollL)?1:0),jump:this.anyKey(e.jump)||l("jump"),boost:this.anyKey(e.boost)||l("boost"),powerslide:this.anyKey(e.slide),ballCam:this.anyKeyPressed(e.cam)||c("cam"),pause:this.anyKeyPressed(e.pause),lookX:0,lookY:0,skip:this.anyKeyPressed(e.jump)||c("jump"),itemDown:this.anyKey(e.item),digitalSteer:!0}}padControls(t){let e=t.b.right-t.b.left,n=t.b.down-t.b.up,i=Math.abs(t.lx)>Math.abs(e)?t.lx:e,r=Math.abs(t.ly)>Math.abs(n)?t.ly:n;return{throttle:t.b.rt-t.b.lt,steer:i,pitch:r,yaw:i,roll:(this.rbIsItem?0:t.b.rb)-t.b.lb,itemDown:this.rbIsItem&&t.down("rb"),jump:t.down("a"),boost:t.down("b"),powerslide:t.down("x"),ballCam:t.pressed("y"),pause:t.pressed("menu"),lookX:t.rx,lookY:t.ry,skip:t.pressed("a"),digitalSteer:Math.abs(t.lx)<.01&&Math.abs(e)>0}}controls(t){if(t.type==="kb")return this.keyboardControls(t.layout);if(t.type==="pad"){let n=this.pads[t.index];return!n||!n.connected?om():this.padControls(n)}let e=this.keyboardControls("solo");for(let n of this.connectedPads()){let i=this.padControls(n);for(let r in i)r!=="digitalSteer"&&(typeof i[r]=="boolean"?e[r]=e[r]||i[r]:Math.abs(i[r])>Math.abs(e[r])&&(e[r]=i[r],r==="steer"&&(e.digitalSteer=i.digitalSteer)))}return e}menu(){let t={up:!1,down:!1,left:!1,right:!1,confirm:!1,back:!1,start:!1,source:null},e=n=>this.anyKeyPressed(n);e(["ArrowUp","KeyW"])&&(t.up=!0),e(["ArrowDown","KeyS"])&&(t.down=!0),e(["ArrowLeft","KeyA"])&&(t.left=!0),e(["ArrowRight","KeyD"])&&(t.right=!0),e(["Enter","NumpadEnter","Space"])&&(t.confirm=!0,t.source={type:"kb"}),e(["Escape","Backspace"])&&(t.back=!0);for(let n of this.connectedPads()){n.pressed("up")&&(t.up=!0),n.pressed("down")&&(t.down=!0),n.pressed("left")&&(t.left=!0),n.pressed("right")&&(t.right=!0),n.pressed("a")&&(t.confirm=!0,t.source={type:"pad",index:n.index}),n.pressed("b")&&(t.back=!0),n.pressed("menu")&&(t.start=!0);let i="";n.ly<-.6?i="up":n.ly>.6?i="down":n.lx<-.6?i="left":n.lx>.6&&(i="right");let r=n.navRepeat;i&&i!==r.dir?(t[i]=!0,r.t=.38):i&&(r.t-=this.dt||.016,r.t<=0&&(t[i]=!0,r.t=.13)),r.dir=i}return t}rumble(t,e,n,i){let r=t.type==="pad"?[this.pads[t.index]]:t.type==="any"?this.connectedPads():[];for(let a of r){let o=a&&a.raw;if(o)try{o.vibrationActuator&&o.vibrationActuator.playEffect?o.vibrationActuator.playEffect("dual-rumble",{startDelay:0,duration:i,weakMagnitude:Math.min(1,n),strongMagnitude:Math.min(1,e)}).catch(()=>{}):o.hapticActuators&&o.hapticActuators[0]&&o.hapticActuators[0].pulse(Math.min(1,Math.max(e,n)),i)}catch{}}}};function om(){return{throttle:0,steer:0,pitch:0,yaw:0,roll:0,jump:!1,boost:!1,powerslide:!1,ballCam:!1,pause:!1,lookX:0,lookY:0,skip:!1,itemDown:!1}}function ih(s){if(!s)return"Controller";let t=s.toLowerCase();return t.includes("xbox")||t.includes("xinput")||t.includes("045e")?"Xbox Controller":t.includes("dualsense")||t.includes("dualshock")||t.includes("054c")?"PlayStation Controller":"Controller"}var To=class{constructor(){this.ctx=null,this.volume=.7,this.engines=[]}init(){if(this.ctx)return!0;let t=window.AudioContext||window.webkitAudioContext;if(!t)return!1;try{this.ctx=new t}catch{return!1}let e=this.ctx;this.master=e.createGain(),this.master.gain.value=this.volume;let n=e.createDynamicsCompressor();n.threshold.value=-14,n.ratio.value=4,this.master.connect(n).connect(e.destination);let i=e.sampleRate*2;this.noise=e.createBuffer(1,i,e.sampleRate);let r=this.noise.getChannelData(0),a=0;for(let u=0;u<i;u++){let d=Math.random()*2-1;a=(a+.02*d)/1.02,r[u]=d*.6+a*3}let o=this.loopNoise(),l=e.createBiquadFilter();l.type="bandpass",l.frequency.value=700,l.Q.value=.6;let c=e.createOscillator();c.frequency.value=.23;let h=e.createGain();return h.gain.value=.015,this.crowdGain=e.createGain(),this.crowdGain.gain.value=.05,c.connect(h).connect(this.crowdGain.gain),o.connect(l).connect(this.crowdGain).connect(this.master),c.start(),!0}resume(){this.init()&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{})}get ready(){return this.ctx&&this.ctx.state==="running"}setVolume(t){this.volume=t,this.master&&this.master.gain.setTargetAtTime(t,this.ctx.currentTime,.05)}loopNoise(){let t=this.ctx.createBufferSource();return t.buffer=this.noise,t.loop=!0,t.loopStart=Math.random(),t.start(0,Math.random()*1.5),t}burst({dur:t=.2,gain:e=.5,freq:n=1200,endFreq:i=null,type:r="lowpass",q:a=.7,pan:o=0,delay:l=0}){if(!this.ready)return;let c=this.ctx,h=c.currentTime+l,u=c.createBufferSource();u.buffer=this.noise;let d=c.createBiquadFilter();d.type=r,d.frequency.setValueAtTime(n,h),i&&d.frequency.exponentialRampToValueAtTime(i,h+t),d.Q.value=a;let f=c.createGain();f.gain.setValueAtTime(1e-4,h),f.gain.exponentialRampToValueAtTime(e,h+.008),f.gain.exponentialRampToValueAtTime(1e-4,h+t);let g=c.createStereoPanner?c.createStereoPanner():null,_=u.connect(d).connect(f);g&&(g.pan.value=o,_=_.connect(g)),_.connect(this.master),u.start(h,Math.random()*1.5),u.stop(h+t+.05)}tone({freq:t=440,endFreq:e=null,dur:n=.2,gain:i=.3,type:r="sine",delay:a=0,attack:o=.005}){if(!this.ready)return;let l=this.ctx,c=l.currentTime+a,h=l.createOscillator();h.type=r,h.frequency.setValueAtTime(t,c),e&&h.frequency.exponentialRampToValueAtTime(e,c+n);let u=l.createGain();u.gain.setValueAtTime(1e-4,c),u.gain.exponentialRampToValueAtTime(i,c+o),u.gain.exponentialRampToValueAtTime(1e-4,c+n),h.connect(u).connect(this.master),h.start(c),h.stop(c+n+.05)}createEngine(t=0){if(!this.ctx)return null;let e=this.ctx,n=e.createGain();n.gain.value=0;let i=e.createStereoPanner?e.createStereoPanner():null;i?(i.pan.value=t,n.connect(i).connect(this.master)):n.connect(this.master);let r=e.createOscillator();r.type="sawtooth";let a=e.createOscillator();a.type="square";let o=e.createBiquadFilter();o.type="lowpass",o.Q.value=2;let l=e.createGain();l.gain.value=.5,r.connect(o),a.connect(l).connect(o),o.connect(n),r.start(),a.start();let c=this.loopNoise(),h=e.createBiquadFilter();h.type="bandpass",h.frequency.value=900,h.Q.value=.5;let u=e.createGain();u.gain.value=0,c.connect(h).connect(u),i?u.connect(i):u.connect(this.master);let d={out:n,o1:r,o2:a,lp:o,bg:u,bf:h,nodes:[r,a,c]};return this.engines.push(d),d}updateEngine(t,e,n,i,r,a){if(!t||!this.ctx)return;let o=this.ctx.currentTime,l=Math.abs(n),c=38+e*.05+l*14;t.o1.frequency.setTargetAtTime(c,o,.06),t.o2.frequency.setTargetAtTime(c*.5,o,.06),t.lp.frequency.setTargetAtTime(240+e*.9+l*700,o,.08),t.out.gain.setTargetAtTime(a?.05+l*.06+(r?.02:0):0,o,.1),t.bg.gain.setTargetAtTime(a&&i?.22:0,o,.04),t.bf.frequency.setTargetAtTime(i?700+e*.4:900,o,.1)}stopEngines(){for(let t of this.engines)try{t.out.gain.value=0,t.bg.gain.value=0;for(let e of t.nodes)e.stop()}catch{}this.engines=[]}hit(t,e=0){let n=Math.min(1,t/3500);this.burst({dur:.12+n*.15,gain:.25+n*.6,freq:900+n*3e3,endFreq:200,pan:e}),this.tone({freq:140,endFreq:45,dur:.18+n*.15,gain:.25+n*.5}),n>.6&&this.burst({dur:.35,gain:.25*n,freq:4e3,endFreq:800,type:"highpass",pan:e})}bounce(t){let e=Math.min(1,t/2500);this.tone({freq:90,endFreq:40,dur:.15,gain:.08+e*.2}),this.burst({dur:.08,gain:.05+e*.15,freq:600,endFreq:150})}bump(){this.burst({dur:.18,gain:.5,freq:1500,endFreq:200}),this.tone({freq:220,endFreq:70,dur:.15,gain:.3,type:"triangle"})}demo(){this.burst({dur:.9,gain:.9,freq:3e3,endFreq:80}),this.tone({freq:90,endFreq:30,dur:.7,gain:.7}),this.burst({dur:.5,gain:.3,freq:6e3,endFreq:1500,type:"highpass",delay:.05})}goal(){this.burst({dur:1.8,gain:1,freq:4e3,endFreq:60}),this.tone({freq:70,endFreq:25,dur:1.2,gain:.9}),this.burst({dur:.6,gain:.4,freq:7e3,endFreq:2e3,type:"highpass",delay:.05}),this.cheer(1)}cheer(t){if(!this.ready)return;let e=this.ctx.currentTime,n=this.crowdGain.gain;n.cancelScheduledValues(e),n.setValueAtTime(n.value,e),n.linearRampToValueAtTime(.05+.35*t,e+.4),n.linearRampToValueAtTime(.05+.25*t,e+2.5),n.linearRampToValueAtTime(.05,e+6);for(let i=0;i<6;i++)this.burst({dur:1.2+Math.random(),gain:.06*t,freq:500+Math.random()*900,type:"bandpass",q:4,delay:Math.random()*1.2,pan:Math.random()*2-1})}boostPickup(t){t?(this.tone({freq:520,endFreq:1200,dur:.18,gain:.12,type:"triangle"}),this.tone({freq:780,endFreq:1600,dur:.2,gain:.08,type:"triangle",delay:.06})):this.tone({freq:1100,endFreq:1500,dur:.07,gain:.06,type:"triangle"})}jump(){this.burst({dur:.16,gain:.12,freq:700,endFreq:2400,type:"bandpass",q:1.2})}dodge(){this.burst({dur:.25,gain:.16,freq:1800,endFreq:500,type:"bandpass",q:1})}land(t){this.tone({freq:70,endFreq:40,dur:.12,gain:Math.min(.25,t/3e3)})}beep(t){this.tone({freq:t?880:523,dur:t?.5:.18,gain:.25,type:"square"}),this.tone({freq:t?1760:1046,dur:t?.45:.15,gain:.08,type:"sine"})}horn(){for(let t of[220,277,330])this.tone({freq:t,dur:1.4,gain:.12,type:"sawtooth",attack:.04})}itemGet(){this.tone({freq:660,endFreq:990,dur:.12,gain:.08,type:"triangle"}),this.tone({freq:990,endFreq:1320,dur:.14,gain:.07,type:"triangle",delay:.08})}itemUse(t,e=1){let n=Math.max(.2,e);switch(t){case"grapple":case"plunger":this.burst({dur:.25,gain:.25*n,freq:2500,endFreq:700,type:"bandpass",q:2});break;case"tornado":this.burst({dur:2.5,gain:.35*n,freq:300,endFreq:1400,type:"bandpass",q:.8}),this.burst({dur:3,gain:.2*n,freq:900,endFreq:400,type:"bandpass",q:3,delay:.3});break;case"freezer":this.tone({freq:1800,endFreq:3200,dur:.4,gain:.12*n,type:"sine"}),this.burst({dur:.5,gain:.25*n,freq:6e3,endFreq:3e3,type:"highpass"});break;case"curveball":this.tone({freq:300,endFreq:1200,dur:.5,gain:.15*n,type:"sawtooth"});break;case"power":case"spikes":this.tone({freq:140,endFreq:420,dur:.35,gain:.25*n,type:"square"});break;default:this.burst({dur:.2,gain:.3*n,freq:1200,endFreq:200})}}hook(t=1){this.tone({freq:900,endFreq:500,dur:.12,gain:.2*Math.max(.2,t),type:"square"}),this.burst({dur:.1,gain:.2*Math.max(.2,t),freq:4e3,endFreq:1500,type:"highpass"})}click(){this.tone({freq:1400,dur:.04,gain:.05,type:"square"})}select(){this.tone({freq:900,endFreq:1400,dur:.09,gain:.08,type:"triangle"})}};var Gd=0,Hh=1,Wd=2;var ks=1,Xd=2,Ar=3,_s=0,yn=1,ve=2,ni=0,Di=1,ln=2,kh=3,Vh=4,qd=5;var Vs=100,Yd=101,Zd=102,Jd=103,Kd=104,$d=200,jd=201,Qd=202,tf=203,Gh=204,Wh=205,ef=206,nf=207,sf=208,rf=209,af=210,of=211,lf=212,cf=213,hf=214,$o=0,jo=1,Qo=2,gr=3,tl=4,el=5,nl=6,il=7,Xh=0,uf=1,df=2,pi=0,Wa=1,Xa=2,qa=3,Gs=4,Ya=5,Za=6,Ja=7;var qh=300,vs=301,Ws=302,Dl=303,Nl=304,Ka=306,Ti=1e3,Ei=1001,sl=1002,rn=1003,ff=1004;var $a=1005;var vn=1006,Ul=1007;var ys=1008;var zn=1009,Yh=1010,Zh=1011,Rr=1012,Fl=1013,mi=1014,ii=1015,cn=1016,Bl=1017,Ol=1018,Cr=1020,Jh=35902,Kh=35899,$h=1021,jh=1022,si=1023,Ai=1026,Ms=1027,zl=1028,Hl=1029,bs=1030,kl=1031;var Vl=1033,ja=33776,Qa=33777,to=33778,eo=33779,Gl=35840,Wl=35841,Xl=35842,ql=35843,Yl=36196,Zl=37492,Jl=37496,Kl=37488,$l=37489,no=37490,jl=37491,Ql=37808,tc=37809,ec=37810,nc=37811,ic=37812,sc=37813,rc=37814,ac=37815,oc=37816,lc=37817,cc=37818,hc=37819,uc=37820,dc=37821,fc=36492,pc=36494,mc=36495,gc=36283,xc=36284,io=36285,_c=36286;var da=2300,rl=2301,Jo=2302,Rh=2303,Ch=2400,Ph=2401,Ih=2402;var pf=3200;var vc=0,mf=1,Ki="",Ke="srgb",fa="srgb-linear",pa="linear",ge="srgb";var Ko=7680;var gf=519,xf=512,_f=513,vf=514,yc=515,yf=516,Mf=517,Mc=518,bf=519,Sf=35044,Ss=35048;var Qh="300 es",fi=2e3,xr=2001;function lm(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function cm(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function ma(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Ef(){let s=ma("canvas");return s.style.display="block",s}var fd={},_r=null;function tu(...s){let t="THREE."+s.shift();_r?_r("log",t,...s):console.log(t,...s)}function wf(s){let t=s[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=s[1];e&&e.isStackTrace?s[0]+=" "+e.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function Jt(...s){s=wf(s);let t="THREE."+s.shift();if(_r)_r("warn",t,...s);else{let e=s[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...s)}}function Kt(...s){s=wf(s);let t="THREE."+s.shift();if(_r)_r("error",t,...s);else{let e=s[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...s)}}function Fs(...s){let t=s.join(" ");t in fd||(fd[t]=!0,Jt(...s))}function Tf(s,t,e){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var Af={[$o]:jo,[Qo]:nl,[tl]:il,[gr]:el,[jo]:$o,[nl]:Qo,[il]:tl,[el]:gr},Ri=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let i=n[t];if(i!==void 0){let r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,t);t.target=null}}},En=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],pd=1234567,la=Math.PI/180,vr=180/Math.PI;function Xs(){let s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(En[s&255]+En[s>>8&255]+En[s>>16&255]+En[s>>24&255]+"-"+En[t&255]+En[t>>8&255]+"-"+En[t>>16&15|64]+En[t>>24&255]+"-"+En[e&63|128]+En[e>>8&255]+"-"+En[e>>16&255]+En[e>>24&255]+En[n&255]+En[n>>8&255]+En[n>>16&255]+En[n>>24&255]).toLowerCase()}function le(s,t,e){return Math.max(t,Math.min(e,s))}function eu(s,t){return(s%t+t)%t}function hm(s,t,e,n,i){return n+(s-t)*(i-n)/(e-t)}function um(s,t,e){return s!==t?(e-s)/(t-s):0}function ca(s,t,e){return(1-e)*s+e*t}function dm(s,t,e,n){return ca(s,t,1-Math.exp(-e*n))}function fm(s,t=1){return t-Math.abs(eu(s,t*2)-t)}function pm(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function mm(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function gm(s,t){return s+Math.floor(Math.random()*(t-s+1))}function xm(s,t){return s+Math.random()*(t-s)}function _m(s){return s*(.5-Math.random())}function vm(s){s!==void 0&&(pd=s);let t=pd+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function ym(s){return s*la}function Mm(s){return s*vr}function bm(s){return s>0&&Number.isInteger(s)&&2**Math.round(Math.log2(s))===s}function Sm(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Em(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function wm(s,t,e,n,i){let r=Math.cos,a=Math.sin,o=r(e/2),l=a(e/2),c=r((t+n)/2),h=a((t+n)/2),u=r((t-n)/2),d=a((t-n)/2),f=r((n-t)/2),g=a((n-t)/2);switch(i){case"XYX":s.set(o*h,l*u,l*d,o*c);break;case"YZY":s.set(l*d,o*h,l*u,o*c);break;case"ZXZ":s.set(l*u,l*d,o*h,o*c);break;case"XZX":s.set(o*h,l*g,l*f,o*c);break;case"YXY":s.set(l*f,o*h,l*g,o*c);break;case"ZYZ":s.set(l*g,l*f,o*h,o*c);break;default:Jt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function pr(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:case Uint8ClampedArray:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Ln(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Te={DEG2RAD:la,RAD2DEG:vr,generateUUID:Xs,clamp:le,euclideanModulo:eu,mapLinear:hm,inverseLerp:um,lerp:ca,damp:dm,pingpong:fm,smoothstep:pm,smootherstep:mm,randInt:gm,randFloat:xm,randFloatSpread:_m,seededRandom:vm,degToRad:ym,radToDeg:Mm,isPowerOfTwo:bm,ceilPowerOfTwo:Sm,floorPowerOfTwo:Em,setQuaternionFromProperEuler:wm,normalize:Ln,denormalize:pr},ou=class ou{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=le(this.x,t.x,e.x),this.y=le(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=le(this.x,t,e),this.y=le(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(le(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(le(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*i+t.x,this.y=r*i+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};ou.prototype.isVector2=!0;var at=ou,xe=class{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3],d=r[a+0],f=r[a+1],g=r[a+2],_=r[a+3];if(u!==_||l!==d||c!==f||h!==g){let p=l*d+c*f+h*g+u*_;p<0&&(d=-d,f=-f,g=-g,_=-_,p=-p);let m=1-o;if(p<.9995){let x=Math.acos(p),b=Math.sin(x);m=Math.sin(m*x)/b,o=Math.sin(o*x)/b,l=l*m+d*o,c=c*m+f*o,h=h*m+g*o,u=u*m+_*o}else{l=l*m+d*o,c=c*m+f*o,h=h*m+g*o,u=u*m+_*o;let x=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=x,c*=x,h*=x,u*=x}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,i,r,a){let o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[a],d=r[a+1],f=r[a+2],g=r[a+3];return t[e]=o*g+h*u+l*f-c*d,t[e+1]=l*g+h*d+c*u-o*f,t[e+2]=c*g+h*f+o*d-l*u,t[e+3]=h*g-o*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,i=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(r/2),d=l(n/2),f=l(i/2),g=l(r/2);switch(a){case"XYZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"YZX":this._x=d*h*u+c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u-d*f*g;break;case"XZY":this._x=d*h*u-c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u+d*f*g;break;default:Jt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],i=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=n+o+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(a-i)*f}else if(n>o&&n>u){let f=2*Math.sqrt(1+n-o-u);this._w=(h-l)/f,this._x=.25*f,this._y=(i+a)/f,this._z=(r+c)/f}else if(o>u){let f=2*Math.sqrt(1+o-n-u);this._w=(r-c)/f,this._x=(i+a)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-n-o);this._w=(a-i)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(le(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,i=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+i*c-r*l,this._y=i*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,i=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,i=-i,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+n*e,this._y=this._y*l+i*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+i*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},lu=class lu{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(md.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(md.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,i=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*i-o*n),h=2*(o*e-r*i),u=2*(r*n-a*e);return this.x=e+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=i+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=le(this.x,t.x,e.x),this.y=le(this.y,t.y,e.y),this.z=le(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=le(this.x,t,e),this.y=le(this.y,t,e),this.z=le(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(le(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,i=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=i*l-r*o,this.y=r*a-n*l,this.z=n*o-i*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return sh.copy(this).projectOnVector(t),this.sub(sh)}reflect(t){return this.sub(sh.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(le(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};lu.prototype.isVector3=!0;var T=lu,sh=new T,md=new xe,cu=class cu{constructor(t,e,n,i,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c)}set(t,e,n,i,r,a,o,l,c){let h=this.elements;return h[0]=t,h[1]=i,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],_=i[0],p=i[3],m=i[6],x=i[1],b=i[4],v=i[7],S=i[2],w=i[5],R=i[8];return r[0]=a*_+o*x+l*S,r[3]=a*p+o*b+l*w,r[6]=a*m+o*v+l*R,r[1]=c*_+h*x+u*S,r[4]=c*p+h*b+u*w,r[7]=c*m+h*v+u*R,r[2]=d*_+f*x+g*S,r[5]=d*p+f*b+g*w,r[8]=d*m+f*v+g*R,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+i*r*c-i*a*l}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,d=o*l-h*r,f=c*r-a*l,g=e*u+n*d+i*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return t[0]=u*_,t[1]=(i*c-h*n)*_,t[2]=(o*n-i*a)*_,t[3]=d*_,t[4]=(h*e-i*l)*_,t[5]=(i*r-o*e)*_,t[6]=f*_,t[7]=(n*l-c*e)*_,t[8]=(a*e-n*r)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-i*c,i*l,-i*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return Fs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(rh.makeScale(t,e)),this}rotate(t){return Fs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(rh.makeRotation(-t)),this}translate(t,e){return Fs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(rh.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};cu.prototype.isMatrix3=!0;var jt=cu,rh=new jt,gd=new jt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),xd=new jt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Tm(){let s={enabled:!0,workingColorSpace:fa,spaces:{},convert:function(i,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===ge&&(i.r=qi(i.r),i.g=qi(i.g),i.b=qi(i.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ge&&(i.r=mr(i.r),i.g=mr(i.g),i.b=mr(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Ki?pa:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,a){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return Fs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return Fs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[fa]:{primaries:t,whitePoint:n,transfer:pa,toXYZ:gd,fromXYZ:xd,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Ke},outputColorSpaceConfig:{drawingBufferColorSpace:Ke}},[Ke]:{primaries:t,whitePoint:n,transfer:ge,toXYZ:gd,fromXYZ:xd,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Ke}}}),s}var ce=Tm();function qi(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function mr(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var tr,al=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{tr===void 0&&(tr=ma("canvas")),tr.width=t.width,tr.height=t.height;let i=tr.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),n=tr}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=ma("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=qi(r[a]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(qi(e[n]/255)*255):e[n]=qi(e[n]);return{data:e,width:t.width,height:t.height}}else return Jt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Am=0,yr=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Am++}),this.uuid=Xs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(ah(i[a].image)):r.push(ah(i[a]))}else r=ah(i);n.url=r}return e||(t.images[this.uuid]=n),n}};function ah(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?al.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(Jt("Texture: Unable to serialize Texture."),{})}var Rm=0,oh=new T,Dn=class s extends Ri{constructor(t=s.DEFAULT_IMAGE,e=s.DEFAULT_MAPPING,n=Ei,i=Ei,r=vn,a=ys,o=si,l=zn,c=s.DEFAULT_ANISOTROPY,h=Ki){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Rm++}),this.uuid=Xs(),this.name="",this.source=new yr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new at(0,0),this.repeat=new at(1,1),this.center=new at(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new jt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(oh).x}get height(){return this.source.getSize(oh).y}get depth(){return this.source.getSize(oh).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Jt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){Jt(`Texture.setValues(): property '${e}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==qh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ti:t.x=t.x-Math.floor(t.x);break;case Ei:t.x=t.x<0?0:1;break;case sl:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ti:t.y=t.y-Math.floor(t.y);break;case Ei:t.y=t.y<0?0:1;break;case sl:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Dn.DEFAULT_IMAGE=null;Dn.DEFAULT_MAPPING=qh;Dn.DEFAULT_ANISOTROPY=1;var hu=class hu{constructor(t=0,e=0,n=0,i=1){this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*i+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r,l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],g=l[9],_=l[2],p=l[6],m=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(g+p)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let b=(c+1)/2,v=(f+1)/2,S=(m+1)/2,w=(h+d)/4,R=(u+_)/4,y=(g+p)/4;return b>v&&b>S?b<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(b),i=w/n,r=R/n):v>S?v<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(v),n=w/i,r=y/i):S<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(S),n=R/r,i=y/r),this.set(n,i,r,e),this}let x=Math.sqrt((p-g)*(p-g)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(x)<.001&&(x=1),this.x=(p-g)/x,this.y=(u-_)/x,this.z=(d-h)/x,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=le(this.x,t.x,e.x),this.y=le(this.y,t.y,e.y),this.z=le(this.z,t.z,e.z),this.w=le(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=le(this.x,t,e),this.y=le(this.y,t,e),this.z=le(this.z,t,e),this.w=le(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(le(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};hu.prototype.isVector4=!0;var Ve=hu,ol=class extends Ri{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:vn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Ve(0,0,t,e),this.scissorTest=!1,this.viewport=new Ve(0,0,t,e),this.textures=[];let i={width:t,height:e,depth:n.depth},r=new Dn(i),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:vn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let i=Object.assign({},t.textures[e].image);this.textures[e].source=new yr(i)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},$e=class extends ol{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},ga=class extends Dn{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=rn,this.minFilter=rn,this.wrapR=Ei,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var ll=class extends Dn{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=rn,this.minFilter=rn,this.wrapR=Ei,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Ll=class Ll{constructor(t,e,n,i,r,a,o,l,c,h,u,d,f,g,_,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c,h,u,d,f,g,_,p)}set(t,e,n,i,r,a,o,l,c,h,u,d,f,g,_,p){let m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=i,m[1]=r,m[5]=a,m[9]=o,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=d,m[3]=f,m[7]=g,m[11]=_,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ll().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,i=1/er.setFromMatrixColumn(t,0).length(),r=1/er.setFromMatrixColumn(t,1).length(),a=1/er.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,i=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let d=a*h,f=a*u,g=o*h,_=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+g*c,e[5]=d-_*c,e[9]=-o*l,e[2]=_-d*c,e[6]=g+f*c,e[10]=a*l}else if(t.order==="YXZ"){let d=l*h,f=l*u,g=c*h,_=c*u;e[0]=d+_*o,e[4]=g*o-f,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=f*o-g,e[6]=_+d*o,e[10]=a*l}else if(t.order==="ZXY"){let d=l*h,f=l*u,g=c*h,_=c*u;e[0]=d-_*o,e[4]=-a*u,e[8]=g+f*o,e[1]=f+g*o,e[5]=a*h,e[9]=_-d*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let d=a*h,f=a*u,g=o*h,_=o*u;e[0]=l*h,e[4]=g*c-f,e[8]=d*c+_,e[1]=l*u,e[5]=_*c+d,e[9]=f*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let d=a*l,f=a*c,g=o*l,_=o*c;e[0]=l*h,e[4]=_-d*u,e[8]=g*u+f,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=f*u+g,e[10]=d-_*u}else if(t.order==="XZY"){let d=a*l,f=a*c,g=o*l,_=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+_,e[5]=a*h,e[9]=f*u-g,e[2]=g*u-f,e[6]=o*h,e[10]=_*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Cm,t,Pm)}lookAt(t,e,n){let i=this.elements;return Vn.subVectors(t,e),Vn.lengthSq()===0&&(Vn.z=1),Vn.normalize(),rs.crossVectors(n,Vn),rs.lengthSq()===0&&(Math.abs(n.z)===1?Vn.x+=1e-4:Vn.z+=1e-4,Vn.normalize(),rs.crossVectors(n,Vn)),rs.normalize(),Ao.crossVectors(Vn,rs),i[0]=rs.x,i[4]=Ao.x,i[8]=Vn.x,i[1]=rs.y,i[5]=Ao.y,i[9]=Vn.y,i[2]=rs.z,i[6]=Ao.z,i[10]=Vn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],_=n[6],p=n[10],m=n[14],x=n[3],b=n[7],v=n[11],S=n[15],w=i[0],R=i[4],y=i[8],A=i[12],P=i[1],L=i[5],F=i[9],k=i[13],N=i[2],z=i[6],J=i[10],Y=i[14],rt=i[3],Z=i[7],tt=i[11],it=i[15];return r[0]=a*w+o*P+l*N+c*rt,r[4]=a*R+o*L+l*z+c*Z,r[8]=a*y+o*F+l*J+c*tt,r[12]=a*A+o*k+l*Y+c*it,r[1]=h*w+u*P+d*N+f*rt,r[5]=h*R+u*L+d*z+f*Z,r[9]=h*y+u*F+d*J+f*tt,r[13]=h*A+u*k+d*Y+f*it,r[2]=g*w+_*P+p*N+m*rt,r[6]=g*R+_*L+p*z+m*Z,r[10]=g*y+_*F+p*J+m*tt,r[14]=g*A+_*k+p*Y+m*it,r[3]=x*w+b*P+v*N+S*rt,r[7]=x*R+b*L+v*z+S*Z,r[11]=x*y+b*F+v*J+S*tt,r[15]=x*A+b*k+v*Y+S*it,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],g=t[3],_=t[7],p=t[11],m=t[15],x=l*f-c*d,b=o*f-c*u,v=o*d-l*u,S=a*f-c*h,w=a*d-l*h,R=a*u-o*h;return e*(_*x-p*b+m*v)-n*(g*x-p*S+m*w)+i*(g*b-_*S+m*R)-r*(g*v-_*w+p*R)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],i=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],h=t[10];return e*(a*h-o*c)-n*(r*h-o*l)+i*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],g=t[12],_=t[13],p=t[14],m=t[15],x=e*o-n*a,b=e*l-i*a,v=e*c-r*a,S=n*l-i*o,w=n*c-r*o,R=i*c-r*l,y=h*_-u*g,A=h*p-d*g,P=h*m-f*g,L=u*p-d*_,F=u*m-f*_,k=d*m-f*p,N=x*k-b*F+v*L+S*P-w*A+R*y;if(N===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let z=1/N;return t[0]=(o*k-l*F+c*L)*z,t[1]=(i*F-n*k-r*L)*z,t[2]=(_*R-p*w+m*S)*z,t[3]=(d*w-u*R-f*S)*z,t[4]=(l*P-a*k-c*A)*z,t[5]=(e*k-i*P+r*A)*z,t[6]=(p*v-g*R-m*b)*z,t[7]=(h*R-d*v+f*b)*z,t[8]=(a*F-o*P+c*y)*z,t[9]=(n*P-e*F-r*y)*z,t[10]=(g*w-_*v+m*x)*z,t[11]=(u*v-h*w-f*x)*z,t[12]=(o*A-a*L-l*y)*z,t[13]=(e*L-n*A+i*y)*z,t[14]=(_*b-g*S-p*x)*z,t[15]=(h*S-u*b+d*x)*z,this}scale(t){let e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),i=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,a){return this.set(1,n,r,0,t,1,a,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){let i=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,d=r*c,f=r*h,g=r*u,_=a*h,p=a*u,m=o*u,x=l*c,b=l*h,v=l*u,S=n.x,w=n.y,R=n.z;return i[0]=(1-(_+m))*S,i[1]=(f+v)*S,i[2]=(g-b)*S,i[3]=0,i[4]=(f-v)*w,i[5]=(1-(d+m))*w,i[6]=(p+x)*w,i[7]=0,i[8]=(g+b)*R,i[9]=(p-x)*R,i[10]=(1-(d+_))*R,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){let i=this.elements;t.x=i[12],t.y=i[13],t.z=i[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=er.set(i[0],i[1],i[2]).length(),o=er.set(i[4],i[5],i[6]).length(),l=er.set(i[8],i[9],i[10]).length();r<0&&(a=-a),ci.copy(this);let c=1/a,h=1/o,u=1/l;return ci.elements[0]*=c,ci.elements[1]*=c,ci.elements[2]*=c,ci.elements[4]*=h,ci.elements[5]*=h,ci.elements[6]*=h,ci.elements[8]*=u,ci.elements[9]*=u,ci.elements[10]*=u,e.setFromRotationMatrix(ci),n.x=a,n.y=o,n.z=l,this}makePerspective(t,e,n,i,r,a,o=fi,l=!1){let c=this.elements,h=2*r/(e-t),u=2*r/(n-i),d=(e+t)/(e-t),f=(n+i)/(n-i),g,_;if(l)g=r/(a-r),_=a*r/(a-r);else if(o===fi)g=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===xr)g=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,i,r,a,o=fi,l=!1){let c=this.elements,h=2/(e-t),u=2/(n-i),d=-(e+t)/(e-t),f=-(n+i)/(n-i),g,_;if(l)g=1/(a-r),_=a/(a-r);else if(o===fi)g=-2/(a-r),_=-(a+r)/(a-r);else if(o===xr)g=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};Ll.prototype.isMatrix4=!0;var we=Ll,er=new T,ci=new we,Cm=new T(0,0,0),Pm=new T(1,1,1),rs=new T,Ao=new T,Vn=new T,_d=new we,vd=new xe,Yi=class s{constructor(t=0,e=0,n=0,i=s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let i=t.elements,r=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(e){case"XYZ":this._y=Math.asin(le(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-le(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(le(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-le(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(le(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-le(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Jt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return _d.makeRotationFromQuaternion(t),this.setFromRotationMatrix(_d,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return vd.setFromEuler(this),this.setFromQuaternion(vd,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Yi.DEFAULT_ORDER="XYZ";var xa=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Im=0,yd=new T,nr=new xe,ki=new we,Ro=new T,ea=new T,Lm=new T,Dm=new xe,Md=new T(1,0,0),bd=new T(0,1,0),Sd=new T(0,0,1),Ed={type:"added"},Nm={type:"removed"},ir={type:"childadded",child:null},lh={type:"childremoved",child:null},Tn=class s extends Ri{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Im++}),this.uuid=Xs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let t=new T,e=new Yi,n=new xe,i=new T(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new we},normalMatrix:{value:new jt}}),this.matrix=new we,this.matrixWorld=new we,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new xa,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return nr.setFromAxisAngle(t,e),this.quaternion.multiply(nr),this}rotateOnWorldAxis(t,e){return nr.setFromAxisAngle(t,e),this.quaternion.premultiply(nr),this}rotateX(t){return this.rotateOnAxis(Md,t)}rotateY(t){return this.rotateOnAxis(bd,t)}rotateZ(t){return this.rotateOnAxis(Sd,t)}translateOnAxis(t,e){return yd.copy(t).applyQuaternion(this.quaternion),this.position.add(yd.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Md,t)}translateY(t){return this.translateOnAxis(bd,t)}translateZ(t){return this.translateOnAxis(Sd,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ki.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Ro.copy(t):Ro.set(t,e,n);let i=this.parent;this.updateWorldMatrix(!0,!1),ea.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ki.lookAt(ea,Ro,this.up):ki.lookAt(Ro,ea,this.up),this.quaternion.setFromRotationMatrix(ki),i&&(ki.extractRotation(i.matrixWorld),nr.setFromRotationMatrix(ki),this.quaternion.premultiply(nr.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Kt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Ed),ir.child=t,this.dispatchEvent(ir),ir.child=null):Kt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Nm),lh.child=t,this.dispatchEvent(lh),lh.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ki.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ki.multiply(t.parent.matrixWorld)),t.applyMatrix4(ki),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Ed),ir.child=t,this.dispatchEvent(ir),ir.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ea,t,Lm),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ea,Dm,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,i=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*i,r[13]+=n-r[1]*e-r[5]*n-r[9]*i,r[14]+=i-r[2]*e-r[6]*n-r[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,i.name=this.name,i.castShadow=this.castShadow,i.receiveShadow=this.receiveShadow,i.visible=this.visible,i.frustumCulled=this.frustumCulled,i.renderOrder=this.renderOrder,i.static=this.static,i.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null&&(i.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(i.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(o=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(t),i.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));i.material=o}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];i.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),d=a(t.skeletons),f=a(t.animations),g=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=i,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let i=t.children[n];this.add(i.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Tn.DEFAULT_UP=new T(0,1,0);Tn.DEFAULT_MATRIX_AUTO_UPDATE=!0;Tn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Xe=class extends Tn{constructor(){super(),this.isGroup=!0,this.type="Group"}},Um={type:"move"},Mr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Xe,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Xe,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new T,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new T),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Xe,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new T,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new T,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let _ of t.hand.values()){let p=e.getJointPose(_,n),m=this._getHandJoint(c,_);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Um)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Xe;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Rf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},as={h:0,s:0,l:0},Co={h:0,s:0,l:0};function ch(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}var Pt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ke){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ce.colorSpaceToWorking(this,e),this}setRGB(t,e,n,i=ce.workingColorSpace){return this.r=t,this.g=e,this.b=n,ce.colorSpaceToWorking(this,i),this}setHSL(t,e,n,i=ce.workingColorSpace){if(t=eu(t,1),e=le(e,0,1),n=le(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=ch(a,r,t+1/3),this.g=ch(a,r,t),this.b=ch(a,r,t-1/3)}return ce.colorSpaceToWorking(this,i),this}setStyle(t,e=Ke){function n(r){r!==void 0&&parseFloat(r)<1&&Jt("Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Jt("Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Jt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ke){let n=Rf[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Jt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=qi(t.r),this.g=qi(t.g),this.b=qi(t.b),this}copyLinearToSRGB(t){return this.r=mr(t.r),this.g=mr(t.g),this.b=mr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ke){return ce.workingToColorSpace(wn.copy(this),t),Math.round(le(wn.r*255,0,255))*65536+Math.round(le(wn.g*255,0,255))*256+Math.round(le(wn.b*255,0,255))}getHexString(t=Ke){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ce.workingColorSpace){ce.workingToColorSpace(wn.copy(this),e);let n=wn.r,i=wn.g,r=wn.b,a=Math.max(n,i,r),o=Math.min(n,i,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=ce.workingColorSpace){return ce.workingToColorSpace(wn.copy(this),e),t.r=wn.r,t.g=wn.g,t.b=wn.b,t}getStyle(t=Ke){ce.workingToColorSpace(wn.copy(this),t);let e=wn.r,n=wn.g,i=wn.b;return t!==Ke?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(as),this.setHSL(as.h+t,as.s+e,as.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(as),t.getHSL(Co);let n=ca(as.h,Co.h,e),i=ca(as.s,Co.s,e),r=ca(as.l,Co.l,e);return this.setHSL(n,i,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,i=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*i,this.g=r[1]*e+r[4]*n+r[7]*i,this.b=r[2]*e+r[5]*n+r[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},wn=new Pt;Pt.NAMES=Rf;var _a=class s{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Pt(t),this.density=e}clone(){return new s(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Bs=class extends Tn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Yi,this.environmentIntensity=1,this.environmentRotation=new Yi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},hi=new T,Vi=new T,hh=new T,Gi=new T,sr=new T,rr=new T,wd=new T,uh=new T,dh=new T,fh=new T,ph=new Ve,mh=new Ve,gh=new Ve,hs=class s{constructor(t=new T,e=new T,n=new T){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),hi.subVectors(t,e),i.cross(hi);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){hi.subVectors(i,e),Vi.subVectors(n,e),hh.subVectors(t,e);let a=hi.dot(hi),o=hi.dot(Vi),l=hi.dot(hh),c=Vi.dot(Vi),h=Vi.dot(hh),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(c*l-o*h)*d,g=(a*h-o*l)*d;return r.set(1-f-g,g,f)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,Gi)===null?!1:Gi.x>=0&&Gi.y>=0&&Gi.x+Gi.y<=1}static getInterpolation(t,e,n,i,r,a,o,l){return this.getBarycoord(t,e,n,i,Gi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Gi.x),l.addScaledVector(a,Gi.y),l.addScaledVector(o,Gi.z),l)}static getInterpolatedAttribute(t,e,n,i,r,a){return ph.setScalar(0),mh.setScalar(0),gh.setScalar(0),ph.fromBufferAttribute(t,e),mh.fromBufferAttribute(t,n),gh.fromBufferAttribute(t,i),a.setScalar(0),a.addScaledVector(ph,r.x),a.addScaledVector(mh,r.y),a.addScaledVector(gh,r.z),a}static isFrontFacing(t,e,n,i){return hi.subVectors(n,e),Vi.subVectors(t,e),hi.cross(Vi).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return hi.subVectors(this.c,this.b),Vi.subVectors(this.a,this.b),hi.cross(Vi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return s.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return s.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,r){return s.getInterpolation(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return s.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return s.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,i=this.b,r=this.c,a,o;sr.subVectors(i,n),rr.subVectors(r,n),uh.subVectors(t,n);let l=sr.dot(uh),c=rr.dot(uh);if(l<=0&&c<=0)return e.copy(n);dh.subVectors(t,i);let h=sr.dot(dh),u=rr.dot(dh);if(h>=0&&u<=h)return e.copy(i);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(sr,a);fh.subVectors(t,r);let f=sr.dot(fh),g=rr.dot(fh);if(g>=0&&f<=g)return e.copy(r);let _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(n).addScaledVector(rr,o);let p=h*g-f*u;if(p<=0&&u-h>=0&&f-g>=0)return wd.subVectors(r,i),o=(u-h)/(u-h+(f-g)),e.copy(i).addScaledVector(wd,o);let m=1/(p+_+d);return a=_*m,o=d*m,e.copy(n).addScaledVector(sr,a).addScaledVector(rr,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Ci=class{constructor(t=new T(1/0,1/0,1/0),e=new T(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(ui.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(ui.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=ui.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,ui):ui.fromBufferAttribute(r,a),ui.applyMatrix4(t.matrixWorld),this.expandByPoint(ui);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Po.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Po.copy(n.boundingBox)),Po.applyMatrix4(t.matrixWorld),this.union(Po)}let i=t.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,ui),ui.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(na),Io.subVectors(this.max,na),ar.subVectors(t.a,na),or.subVectors(t.b,na),lr.subVectors(t.c,na),os.subVectors(or,ar),ls.subVectors(lr,or),Ls.subVectors(ar,lr);let e=[0,-os.z,os.y,0,-ls.z,ls.y,0,-Ls.z,Ls.y,os.z,0,-os.x,ls.z,0,-ls.x,Ls.z,0,-Ls.x,-os.y,os.x,0,-ls.y,ls.x,0,-Ls.y,Ls.x,0];return!xh(e,ar,or,lr,Io)||(e=[1,0,0,0,1,0,0,0,1],!xh(e,ar,or,lr,Io))?!1:(Lo.crossVectors(os,ls),e=[Lo.x,Lo.y,Lo.z],xh(e,ar,or,lr,Io))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,ui).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(ui).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Wi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Wi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Wi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Wi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Wi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Wi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Wi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Wi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Wi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Wi=[new T,new T,new T,new T,new T,new T,new T,new T],ui=new T,Po=new Ci,ar=new T,or=new T,lr=new T,os=new T,ls=new T,Ls=new T,na=new T,Io=new T,Lo=new T,Ds=new T;function xh(s,t,e,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){Ds.fromArray(s,r);let o=i.x*Math.abs(Ds.x)+i.y*Math.abs(Ds.y)+i.z*Math.abs(Ds.z),l=t.dot(Ds),c=e.dot(Ds),h=n.dot(Ds);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var sn=new T,Do=new at,Fm=0,qe=class extends Ri{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Fm++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Sf,this.updateRanges=[],this.gpuType=ii,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Do.fromBufferAttribute(this,e),Do.applyMatrix3(t),this.setXY(e,Do.x,Do.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)sn.fromBufferAttribute(this,e),sn.applyMatrix3(t),this.setXYZ(e,sn.x,sn.y,sn.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)sn.fromBufferAttribute(this,e),sn.applyMatrix4(t),this.setXYZ(e,sn.x,sn.y,sn.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)sn.fromBufferAttribute(this,e),sn.applyNormalMatrix(t),this.setXYZ(e,sn.x,sn.y,sn.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)sn.fromBufferAttribute(this,e),sn.transformDirection(t),this.setXYZ(e,sn.x,sn.y,sn.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=pr(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Ln(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=pr(e,this.array)),e}setX(t,e){return this.normalized&&(e=Ln(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=pr(e,this.array)),e}setY(t,e){return this.normalized&&(e=Ln(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=pr(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Ln(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=pr(e,this.array)),e}setW(t,e){return this.normalized&&(e=Ln(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Ln(e,this.array),n=Ln(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=Ln(e,this.array),n=Ln(n,this.array),i=Ln(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=Ln(e,this.array),n=Ln(n,this.array),i=Ln(i,this.array),r=Ln(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var va=class extends qe{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var ya=class extends qe{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var se=class extends qe{constructor(t,e,n){super(new Float32Array(t),e,n)}},Bm=new Ci,ia=new T,_h=new T,us=class{constructor(t=new T,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Bm.setFromPoints(t).getCenter(n);let i=0;for(let r=0,a=t.length;r<a;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ia.subVectors(t,this.center);let e=ia.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(ia,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(_h.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ia.copy(t.center).add(_h)),this.expandByPoint(ia.copy(t.center).sub(_h))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Om=0,ei=new we,vh=new Tn,cr=new T,Gn=new Ci,sa=new Ci,mn=new T,Re=class s extends Ri{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Om++}),this.uuid=Xs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(lm(t)?ya:va)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new jt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return ei.makeRotationFromQuaternion(t),this.applyMatrix4(ei),this}rotateX(t){return ei.makeRotationX(t),this.applyMatrix4(ei),this}rotateY(t){return ei.makeRotationY(t),this.applyMatrix4(ei),this}rotateZ(t){return ei.makeRotationZ(t),this.applyMatrix4(ei),this}translate(t,e,n){return ei.makeTranslation(t,e,n),this.applyMatrix4(ei),this}scale(t,e,n){return ei.makeScale(t,e,n),this.applyMatrix4(ei),this}lookAt(t){return vh.lookAt(t),vh.updateMatrix(),this.applyMatrix4(vh.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(cr).negate(),this.translate(cr.x,cr.y,cr.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let i=0,r=t.length;i<r;i++){let a=t[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new se(n,3))}else{let n=Math.min(t.length,e.count);for(let i=0;i<n;i++){let r=t[i];e.setXYZ(i,r.x,r.y,r.z||0)}t.length>e.count&&Jt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ci);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Kt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new T(-1/0,-1/0,-1/0),new T(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){let r=e[n];Gn.setFromBufferAttribute(r),this.morphTargetsRelative?(mn.addVectors(this.boundingBox.min,Gn.min),this.boundingBox.expandByPoint(mn),mn.addVectors(this.boundingBox.max,Gn.max),this.boundingBox.expandByPoint(mn)):(this.boundingBox.expandByPoint(Gn.min),this.boundingBox.expandByPoint(Gn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Kt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new us);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Kt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new T,1/0);return}if(t){let n=this.boundingSphere.center;if(Gn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];sa.setFromBufferAttribute(o),this.morphTargetsRelative?(mn.addVectors(Gn.min,sa.min),Gn.expandByPoint(mn),mn.addVectors(Gn.max,sa.max),Gn.expandByPoint(mn)):(Gn.expandByPoint(sa.min),Gn.expandByPoint(sa.max))}Gn.getCenter(n);let i=0;for(let r=0,a=t.count;r<a;r++)mn.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(mn));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)mn.fromBufferAttribute(o,c),l&&(cr.fromBufferAttribute(t,c),mn.add(cr)),i=Math.max(i,n.distanceToSquared(mn))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&Kt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Kt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,i=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new qe(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let y=0;y<n.count;y++)o[y]=new T,l[y]=new T;let c=new T,h=new T,u=new T,d=new at,f=new at,g=new at,_=new T,p=new T;function m(y,A,P){c.fromBufferAttribute(n,y),h.fromBufferAttribute(n,A),u.fromBufferAttribute(n,P),d.fromBufferAttribute(r,y),f.fromBufferAttribute(r,A),g.fromBufferAttribute(r,P),h.sub(c),u.sub(c),f.sub(d),g.sub(d);let L=1/(f.x*g.y-g.x*f.y);isFinite(L)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(L),p.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(L),o[y].add(_),o[A].add(_),o[P].add(_),l[y].add(p),l[A].add(p),l[P].add(p))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let y=0,A=x.length;y<A;++y){let P=x[y],L=P.start,F=P.count;for(let k=L,N=L+F;k<N;k+=3)m(t.getX(k+0),t.getX(k+1),t.getX(k+2))}let b=new T,v=new T,S=new T,w=new T;function R(y){S.fromBufferAttribute(i,y),w.copy(S);let A=o[y];b.copy(A),b.sub(S.multiplyScalar(S.dot(A))).normalize(),v.crossVectors(w,A);let L=v.dot(l[y])<0?-1:1;a.setXYZW(y,b.x,b.y,b.z,L)}for(let y=0,A=x.length;y<A;++y){let P=x[y],L=P.start,F=P.count;for(let k=L,N=L+F;k<N;k+=3)R(t.getX(k+0)),R(t.getX(k+1)),R(t.getX(k+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new qe(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let i=new T,r=new T,a=new T,o=new T,l=new T,c=new T,h=new T,u=new T;if(t)for(let d=0,f=t.count;d<f;d+=3){let g=t.getX(d+0),_=t.getX(d+1),p=t.getX(d+2);i.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),a.fromBufferAttribute(e,p),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,p),o.add(h),l.add(h),c.add(h),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)i.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),a.fromBufferAttribute(e,d+2),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)mn.fromBufferAttribute(t,e),mn.normalize(),t.setXYZ(e,mn.x,mn.y,mn.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h),f=0,g=0;for(let _=0,p=l.length;_<p;_++){o.isInterleavedBufferAttribute?f=l[_]*o.data.stride+o.offset:f=l[_]*h;for(let m=0;m<h;m++)d[g++]=c[f++]}return new qe(d,h,u)}if(this.index===null)return Jt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new s,n=this.index.array,i=this.attributes;for(let o in i){let l=i[o],c=t(l,n);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=t(d,n);l.push(f)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let i={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(i[l]=h,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let i=t.attributes;for(let c in i){let h=i[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,h=a.length;c<h;c++){let u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var yh=new T,zm=new T,Hm=new jt,di=class{constructor(t=new T(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let i=yh.subVectors(n,e).cross(zm.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let i=t.delta(yh),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(i,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Hm.getNormalMatrix(t),i=this.coplanarPoint(yh).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},km=0,ds=class extends Ri{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:km++}),this.uuid=Xs(),this.name="",this.type="Material",this.blending=Di,this.side=_s,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Gh,this.blendDst=Wh,this.blendEquation=Vs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Pt(0,0,0),this.blendAlpha=0,this.depthFunc=gr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=gf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ko,this.stencilZFail=Ko,this.stencilZPass=Ko,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Jt(`Material: parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){Jt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector2&&n&&n.isVector2||i&&i.isEuler&&n&&n.isEuler||i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=i(t.textures),a=i(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Pt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new di().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new at().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new at().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let i=e.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Xi=new T,Mh=new T,No=new T,Uo=new T,cl=class{constructor(t=new T,e=new T(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Xi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Xi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Xi.copy(this.origin).addScaledVector(this.direction,e),Xi.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){Mh.copy(t).add(e).multiplyScalar(.5),No.copy(e).sub(t).normalize(),Uo.copy(this.origin).sub(Mh);let r=t.distanceTo(e)*.5,a=-this.direction.dot(No),o=Uo.dot(this.direction),l=-Uo.dot(No),c=Uo.lengthSq(),h=Math.abs(1-a*a),u,d,f,g;if(h>0)if(u=a*l-o,d=a*o-l,g=r*h,u>=0)if(d>=-g)if(d<=g){let _=1/h;u*=_,d*=_,f=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(Mh).addScaledVector(No,d),f}intersectSphere(t,e){if(t.radius<0)return null;Xi.subVectors(t.center,this.origin);let n=Xi.dot(this.direction),i=Xi.dot(Xi)-n*n,r=t.radius*t.radius;if(i>r)return null;let a=Math.sqrt(r-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,i=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,i=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,a=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,a=(t.min.y-d.y)*h),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),u>=0?(o=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(o=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,Xi)!==null}intersectTriangle(t,e,n,i,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,u=t.x-a.x,d=t.y-a.y,f=t.z-a.z,g=e.x-a.x,_=e.y-a.y,p=e.z-a.z,m=n.x-a.x,x=n.y-a.y,b=n.z-a.z,v=Math.abs(l),S=Math.abs(c),w=Math.abs(h),R,y,A,P,L,F,k,N,z,J,Y,rt;if(v>=S&&v>=w?(A=l,F=u,z=g,rt=m,l>=0?(R=c,y=h,P=d,L=f,k=_,N=p,J=x,Y=b):(R=h,y=c,P=f,L=d,k=p,N=_,J=b,Y=x)):S>=w?(A=c,F=d,z=_,rt=x,c>=0?(R=h,y=l,P=f,L=u,k=p,N=g,J=b,Y=m):(R=l,y=h,P=u,L=f,k=g,N=p,J=m,Y=b)):(A=h,F=f,z=p,rt=b,h>=0?(R=l,y=c,P=u,L=d,k=g,N=_,J=m,Y=x):(R=c,y=l,P=d,L=u,k=_,N=g,J=x,Y=m)),A===0)return null;let Z=R/A,tt=y/A,it=1/A,It=P-Z*F,Rt=L-tt*F,re=k-Z*z,ee=N-tt*z,ie=J-Z*rt,X=Y-tt*rt,Q=ie*ee-X*re,_t=It*X-Rt*ie,Vt=re*Rt-ee*It;if(i){if(Q<0||_t<0||Vt<0)return null}else if((Q<0||_t<0||Vt<0)&&(Q>0||_t>0||Vt>0))return null;let St=Q+_t+Vt;if(St===0)return null;let Xt=it*(Q*F+_t*z+Vt*rt);return(St>0?Xt<0:Xt>0)?null:this.at(Xt/St,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},_e=class extends ds{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Pt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yi,this.combine=Xh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Td=new we,Ns=new cl,Fo=new us,Ad=new T,Bo=new T,Oo=new T,zo=new T,bh=new T,Ho=new T,Rd=new T,ko=new T,gt=class extends Tn{constructor(t=new Re,e=new _e){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){let o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(i,t);let o=this.morphTargetInfluences;if(r&&o){Ho.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],u=r[l];h!==0&&(bh.fromBufferAttribute(u,t),a?Ho.addScaledVector(bh,h):Ho.addScaledVector(bh.sub(e),h))}e.add(Ho)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Fo.copy(n.boundingSphere),Fo.applyMatrix4(r),Ns.copy(t.ray).recast(t.near),!(Fo.containsPoint(Ns.origin)===!1&&(Ns.intersectSphere(Fo,Ad)===null||Ns.origin.distanceToSquared(Ad)>(t.far-t.near)**2))&&(Td.copy(r).invert(),Ns.copy(t.ray).applyMatrix4(Td),!(n.boundingBox!==null&&Ns.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Ns)))}_computeIntersections(t,e,n){let i,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){let p=d[g],m=a[p.materialIndex],x=Math.max(p.start,f.start),b=Math.min(o.count,Math.min(p.start+p.count,f.start+f.count));for(let v=x,S=b;v<S;v+=3){let w=o.getX(v),R=o.getX(v+1),y=o.getX(v+2);i=Vo(this,m,t,n,c,h,u,w,R,y),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{let g=Math.max(0,f.start),_=Math.min(o.count,f.start+f.count);for(let p=g,m=_;p<m;p+=3){let x=o.getX(p),b=o.getX(p+1),v=o.getX(p+2);i=Vo(this,a,t,n,c,h,u,x,b,v),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){let p=d[g],m=a[p.materialIndex],x=Math.max(p.start,f.start),b=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let v=x,S=b;v<S;v+=3){let w=v,R=v+1,y=v+2;i=Vo(this,m,t,n,c,h,u,w,R,y),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{let g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let p=g,m=_;p<m;p+=3){let x=p,b=p+1,v=p+2;i=Vo(this,a,t,n,c,h,u,x,b,v),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}}};function Vm(s,t,e,n,i,r,a,o){let l;if(t.side===yn?l=n.intersectTriangle(a,r,i,!0,o):l=n.intersectTriangle(i,r,a,t.side===_s,o),l===null)return null;ko.copy(o),ko.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(ko);return c<e.near||c>e.far?null:{distance:c,point:ko.clone(),object:s}}function Vo(s,t,e,n,i,r,a,o,l,c){s.getVertexPosition(o,Bo),s.getVertexPosition(l,Oo),s.getVertexPosition(c,zo);let h=Vm(s,t,e,n,Bo,Oo,zo,Rd);if(h){let u=new T;hs.getBarycoord(Rd,Bo,Oo,zo,u),i&&(h.uv=hs.getInterpolatedAttribute(i,o,l,c,u,new at)),r&&(h.uv1=hs.getInterpolatedAttribute(r,o,l,c,u,new at)),a&&(h.normal=hs.getInterpolatedAttribute(a,o,l,c,u,new T),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new T,materialIndex:0};hs.getNormal(Bo,Oo,zo,d.normal),h.face=d,h.barycoord=u}return h}var Ma=class extends Dn{constructor(t=null,e=1,n=1,i,r,a,o,l,c=rn,h=rn,u,d){super(null,a,o,l,c,h,i,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Pi=class extends qe{constructor(t,e,n,i=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},hr=new we,Cd=new we,Go=[],Pd=new Ci,Gm=new we,ra=new gt,aa=new us,Os=class extends gt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Pi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Gm)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Ci),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,hr),Pd.copy(t.boundingBox).applyMatrix4(hr),this.boundingBox.union(Pd)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new us),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,hr),aa.copy(t.boundingSphere).applyMatrix4(hr),this.boundingSphere.union(aa)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(t,e){let n=this.matrixWorld,i=this.count;if(ra.geometry=this.geometry,ra.material=this.material,ra.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),aa.copy(this.boundingSphere),aa.applyMatrix4(n),t.ray.intersectsSphere(aa)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,hr),Cd.multiplyMatrices(n,hr),ra.matrixWorld=Cd,ra.raycast(t,Go);for(let a=0,o=Go.length;a<o;a++){let l=Go[a];l.instanceId=r,l.object=this,e.push(l)}Go.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Pi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ma(new Float32Array(i*this.count),i,this.count,zl,ii));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=i*t;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Us=new us,Wm=new at(.5,.5),Wo=new T,br=class{constructor(t=new di,e=new di,n=new di,i=new di,r=new di,a=new di){this.planes=[t,e,n,i,r,a]}set(t,e,n,i,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=fi,n=!1){let i=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],g=r[8],_=r[9],p=r[10],m=r[11],x=r[12],b=r[13],v=r[14],S=r[15];if(i[0].setComponents(c-a,f-h,m-g,S-x).normalize(),i[1].setComponents(c+a,f+h,m+g,S+x).normalize(),i[2].setComponents(c+o,f+u,m+_,S+b).normalize(),i[3].setComponents(c-o,f-u,m-_,S-b).normalize(),n)i[4].setComponents(l,d,p,v).normalize(),i[5].setComponents(c-l,f-d,m-p,S-v).normalize();else if(i[4].setComponents(c-l,f-d,m-p,S-v).normalize(),e===fi)i[5].setComponents(c+l,f+d,m+p,S+v).normalize();else if(e===xr)i[5].setComponents(l,d,p,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Us.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Us.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Us)}intersectsSprite(t){Us.center.set(0,0,0);let e=Wm.distanceTo(t.center);return Us.radius=.7071067811865476+e,Us.applyMatrix4(t.matrixWorld),this.intersectsSphere(Us)}intersectsSphere(t){let e=this.planes,n=t.center,i=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let i=e[n];if(Wo.x=i.normal.x>0?t.max.x:t.min.x,Wo.y=i.normal.y>0?t.max.y:t.min.y,Wo.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(Wo)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ba=class extends Dn{constructor(t=[],e=vs,n,i,r,a,o,l,c,h){super(t,e,n,i,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},An=class extends Dn{constructor(t,e,n,i,r,a,o,l,c){super(t,e,n,i,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var fs=class extends Dn{constructor(t,e,n=mi,i,r,a,o=rn,l=rn,c,h=Ai,u=1){if(h!==Ai&&h!==Ms)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:u};super(d,i,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new yr(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},hl=class extends fs{constructor(t,e=mi,n=vs,i,r,a=rn,o=rn,l,c=Ai){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,n,i,r,a,o,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Sa=class extends Dn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Ne=class s extends Re{constructor(t=1,e=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};let o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],u=[],d=0,f=0;g("z","y","x",-1,-1,n,e,t,a,r,0),g("z","y","x",1,-1,n,e,-t,a,r,1),g("x","z","y",1,1,t,n,e,i,a,2),g("x","z","y",1,-1,t,n,-e,i,a,3),g("x","y","z",1,-1,t,e,n,i,r,4),g("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new se(c,3)),this.setAttribute("normal",new se(h,3)),this.setAttribute("uv",new se(u,2));function g(_,p,m,x,b,v,S,w,R,y,A){let P=v/R,L=S/y,F=v/2,k=S/2,N=w/2,z=R+1,J=y+1,Y=0,rt=0,Z=new T;for(let tt=0;tt<J;tt++){let it=tt*L-k;for(let It=0;It<z;It++){let Rt=It*P-F;Z[_]=Rt*x,Z[p]=it*b,Z[m]=N,c.push(Z.x,Z.y,Z.z),Z[_]=0,Z[p]=0,Z[m]=w>0?1:-1,h.push(Z.x,Z.y,Z.z),u.push(It/R),u.push(1-tt/y),Y+=1}}for(let tt=0;tt<y;tt++)for(let it=0;it<R;it++){let It=d+it+z*tt,Rt=d+it+z*(tt+1),re=d+(it+1)+z*(tt+1),ee=d+(it+1)+z*tt;l.push(It,Rt,ee),l.push(Rt,re,ee),rt+=6}o.addGroup(f,rt,A),f+=rt,d+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Ii=class s extends Re{constructor(t=1,e=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:i},e=Math.max(3,e);let r=[],a=[],o=[],l=[],c=new T,h=new at;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=e;u++,d+=3){let f=n+u/e*i;c.x=t*Math.cos(f),c.y=t*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[d]/t+1)/2,h.y=(a[d+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new se(a,3)),this.setAttribute("normal",new se(o,3)),this.setAttribute("uv",new se(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Ye=class s extends Re{constructor(t=1,e=1,n=1,i=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;i=Math.floor(i),r=Math.floor(r);let h=[],u=[],d=[],f=[],g=0,_=[],p=n/2,m=0;x(),a===!1&&(t>0&&b(!0),e>0&&b(!1)),this.setIndex(h),this.setAttribute("position",new se(u,3)),this.setAttribute("normal",new se(d,3)),this.setAttribute("uv",new se(f,2));function x(){let v=new T,S=new T,w=0,R=(e-t)/n;for(let y=0;y<=r;y++){let A=[],P=y/r,L=P*(e-t)+t;for(let F=0;F<=i;F++){let k=F/i,N=k*l+o,z=Math.sin(N),J=Math.cos(N);S.x=L*z,S.y=-P*n+p,S.z=L*J,u.push(S.x,S.y,S.z),v.set(z,R,J).normalize(),d.push(v.x,v.y,v.z),f.push(k,1-P),A.push(g++)}_.push(A)}for(let y=0;y<i;y++)for(let A=0;A<r;A++){let P=_[A][y],L=_[A+1][y],F=_[A+1][y+1],k=_[A][y+1];(t>0||A!==0)&&(h.push(P,L,k),w+=3),(e>0||A!==r-1)&&(h.push(L,F,k),w+=3)}c.addGroup(m,w,0),m+=w}function b(v){let S=g,w=new at,R=new T,y=0,A=v===!0?t:e,P=v===!0?1:-1;for(let F=1;F<=i;F++)u.push(0,p*P,0),d.push(0,P,0),f.push(.5,.5),g++;let L=g;for(let F=0;F<=i;F++){let N=F/i*l+o,z=Math.cos(N),J=Math.sin(N);R.x=A*J,R.y=p*P,R.z=A*z,u.push(R.x,R.y,R.z),d.push(0,P,0),w.x=z*.5+.5,w.y=J*.5*P+.5,f.push(w.x,w.y),g++}for(let F=0;F<i;F++){let k=S+F,N=L+F;v===!0?h.push(N,N+1,k):h.push(N+1,N,k),y+=3}c.addGroup(m,y,v===!0?1:2),m+=y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Zi=class s extends Ye{constructor(t=1,e=1,n=32,i=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,i,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new s(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ul=class s extends Re{constructor(t=[],e=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:i};let r=[],a=[];o(i),c(n),h(),this.setAttribute("position",new se(r,3)),this.setAttribute("normal",new se(r.slice(),3)),this.setAttribute("uv",new se(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function o(x){let b=new T,v=new T,S=new T;for(let w=0;w<e.length;w+=3)f(e[w+0],b),f(e[w+1],v),f(e[w+2],S),l(b,v,S,x)}function l(x,b,v,S){let w=S+1,R=[];for(let y=0;y<=w;y++){R[y]=[];let A=x.clone().lerp(v,y/w),P=b.clone().lerp(v,y/w),L=w-y;for(let F=0;F<=L;F++)F===0&&y===w?R[y][F]=A:R[y][F]=A.clone().lerp(P,F/L)}for(let y=0;y<w;y++)for(let A=0;A<2*(w-y)-1;A++){let P=Math.floor(A/2);A%2===0?(d(R[y][P+1]),d(R[y+1][P]),d(R[y][P])):(d(R[y][P+1]),d(R[y+1][P+1]),d(R[y+1][P]))}}function c(x){let b=new T;for(let v=0;v<r.length;v+=3)b.x=r[v+0],b.y=r[v+1],b.z=r[v+2],b.normalize().multiplyScalar(x),r[v+0]=b.x,r[v+1]=b.y,r[v+2]=b.z}function h(){let x=new T;for(let b=0;b<r.length;b+=3){x.x=r[b+0],x.y=r[b+1],x.z=r[b+2];let v=p(x)/2/Math.PI+.5,S=m(x)/Math.PI+.5;a.push(v,1-S)}g(),u()}function u(){for(let x=0;x<a.length;x+=6){let b=a[x+0],v=a[x+2],S=a[x+4],w=Math.max(b,v,S),R=Math.min(b,v,S);w>.9&&R<.1&&(b<.2&&(a[x+0]+=1),v<.2&&(a[x+2]+=1),S<.2&&(a[x+4]+=1))}}function d(x){r.push(x.x,x.y,x.z)}function f(x,b){let v=x*3;b.x=t[v+0],b.y=t[v+1],b.z=t[v+2]}function g(){let x=new T,b=new T,v=new T,S=new T,w=new at,R=new at,y=new at;for(let A=0,P=0;A<r.length;A+=9,P+=6){x.set(r[A+0],r[A+1],r[A+2]),b.set(r[A+3],r[A+4],r[A+5]),v.set(r[A+6],r[A+7],r[A+8]),w.set(a[P+0],a[P+1]),R.set(a[P+2],a[P+3]),y.set(a[P+4],a[P+5]),S.copy(x).add(b).add(v).divideScalar(3);let L=p(S);_(w,P+0,x,L),_(R,P+2,b,L),_(y,P+4,v,L)}}function _(x,b,v,S){S<0&&x.x===1&&(a[b]=x.x-1),v.x===0&&v.z===0&&(a[b]=S/2/Math.PI+.5)}function p(x){return Math.atan2(x.z,-x.x)}function m(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.vertices,t.indices,t.radius,t.detail)}};var Wn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Jt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,i=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(i),e.push(r),i=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),i=0,r=n.length,a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(i=Math.floor(o+(l-o)/2),c=n[i]-a,c<0)o=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===a)return i/(r-1);let h=n[i],d=n[i+1]-h,f=(a-h)/d;return(i+f)/(r-1)}getTangent(t,e){let i=t-1e-4,r=t+1e-4;i<0&&(i=0),r>1&&(r=1);let a=this.getPoint(i),o=this.getPoint(r),l=e||(a.isVector2?new at:new T);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new T,i=[],r=[],a=[],o=new T,l=new we;for(let f=0;f<=t;f++){let g=f/t;i[f]=this.getTangentAt(g,new T)}r[0]=new T,a[0]=new T;let c=Number.MAX_VALUE,h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],o),a[0].crossVectors(i[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(i[f-1],i[f]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(le(i[f-1].dot(i[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,g))}a[f].crossVectors(i[f],r[f])}if(e===!0){let f=Math.acos(le(r[0].dot(r[t]),-1,1));f/=t,i[0].dot(o.crossVectors(r[0],r[t]))>0&&(f=-f);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(i[g],f*g)),a[g].crossVectors(i[g],r[g])}return{tangents:i,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Sr=class extends Wn{constructor(t=0,e=0,n=1,i=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new at){let n=e,i=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(a?r=0:r=i),this.aClockwise===!0&&!a&&(r===i?r=-i:r=r-i);let o=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},dl=class extends Sr{constructor(t,e,n,i,r,a){super(t,e,n,n,i,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function nu(){let s=0,t=0,e=0,n=0;function i(r,a,o,l){s=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){i(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let d=(a-r)/c-(o-r)/(c+h)+(o-a)/h,f=(o-a)/h-(l-a)/(h+u)+(l-o)/u;d*=h,f*=h,i(a,o,d,f)},calc:function(r){let a=r*r,o=a*r;return s+t*r+e*a+n*o}}}var Id=new T,Ld=new T,Sh=new nu,Eh=new nu,wh=new nu,fl=class extends Wn{constructor(t=[],e=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=i}getPoint(t,e=new T){let n=e,i=this.points,r=i.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=i[(o-1)%r]:(Ld.subVectors(i[0],i[1]).add(i[0]),c=Ld);let u=i[o%r],d=i[(o+1)%r];if(this.closed||o+2<r?h=i[(o+2)%r]:(Id.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=Id),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(u),f),_=Math.pow(u.distanceToSquared(d),f),p=Math.pow(d.distanceToSquared(h),f);_<1e-4&&(_=1),g<1e-4&&(g=_),p<1e-4&&(p=_),Sh.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,_,p),Eh.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,_,p),wh.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,_,p)}else this.curveType==="catmullrom"&&(Sh.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),Eh.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),wh.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(Sh.calc(l),Eh.calc(l),wh.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(i.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let i=this.points[e];t.points.push(i.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(new T().fromArray(i))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function Dd(s,t,e,n,i){let r=(n-t)*.5,a=(i-e)*.5,o=s*s,l=s*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*s+e}function Xm(s,t){let e=1-s;return e*e*t}function qm(s,t){return 2*(1-s)*s*t}function Ym(s,t){return s*s*t}function ha(s,t,e,n){return Xm(s,t)+qm(s,e)+Ym(s,n)}function Zm(s,t){let e=1-s;return e*e*e*t}function Jm(s,t){let e=1-s;return 3*e*e*s*t}function Km(s,t){return 3*(1-s)*s*s*t}function $m(s,t){return s*s*s*t}function ua(s,t,e,n,i){return Zm(s,t)+Jm(s,e)+Km(s,n)+$m(s,i)}var Ea=class extends Wn{constructor(t=new at,e=new at,n=new at,i=new at){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new at){let n=e,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(ua(t,i.x,r.x,a.x,o.x),ua(t,i.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},pl=class extends Wn{constructor(t=new T,e=new T,n=new T,i=new T){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new T){let n=e,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(ua(t,i.x,r.x,a.x,o.x),ua(t,i.y,r.y,a.y,o.y),ua(t,i.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},wa=class extends Wn{constructor(t=new at,e=new at){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new at){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new at){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ml=class extends Wn{constructor(t=new T,e=new T){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new T){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new T){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Ta=class extends Wn{constructor(t=new at,e=new at,n=new at){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new at){let n=e,i=this.v0,r=this.v1,a=this.v2;return n.set(ha(t,i.x,r.x,a.x),ha(t,i.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},gl=class extends Wn{constructor(t=new T,e=new T,n=new T){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new T){let n=e,i=this.v0,r=this.v1,a=this.v2;return n.set(ha(t,i.x,r.x,a.x),ha(t,i.y,r.y,a.y),ha(t,i.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Aa=class extends Wn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new at){let n=e,i=this.points,r=(i.length-1)*t,a=Math.floor(r),o=r-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(Dd(o,l.x,c.x,h.x,u.x),Dd(o,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(i.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let i=this.points[e];t.points.push(i.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(new at().fromArray(i))}return this}},Lh=Object.freeze({__proto__:null,ArcCurve:dl,CatmullRomCurve3:fl,CubicBezierCurve:Ea,CubicBezierCurve3:pl,EllipseCurve:Sr,LineCurve:wa,LineCurve3:ml,QuadraticBezierCurve:Ta,QuadraticBezierCurve3:gl,SplineCurve:Aa}),xl=class extends Wn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Lh[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),i=this.getCurveLengths(),r=0;for(;r<i.length;){if(i[r]>=n){let a=i[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,i=this.curves.length;n<i;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let i=0,r=this.curves;i<r.length;i++){let a=r[i],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let i=t.curves[e];this.curves.push(i.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let i=this.curves[e];t.curves.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let i=t.curves[e];this.curves.push(new Lh[i.type]().fromJSON(i))}return this}},Ra=class extends xl{constructor(t){super(),this.type="Path",this.currentPoint=new at,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new wa(this.currentPoint.clone(),new at(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,i){let r=new Ta(this.currentPoint.clone(),new at(t,e),new at(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(t,e,n,i,r,a){let o=new Ea(this.currentPoint.clone(),new at(t,e),new at(n,i),new at(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new Aa(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,i,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,n,i,r,a),this}absarc(t,e,n,i,r,a){return this.absellipse(t,e,n,n,i,r,a),this}ellipse(t,e,n,i,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,i,r,a,o,l),this}absellipse(t,e,n,i,r,a,o,l){let c=new Sr(t,e,n,i,r,a,o,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Ji=class extends Ra{constructor(t){super(t),this.uuid=Xs(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,i=this.holes.length;n<i;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let i=t.holes[e];this.holes.push(i.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let i=this.holes[e];t.holes.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let i=t.holes[e];this.holes.push(new Ra().fromJSON(i))}return this}};function jm(s,t,e=2){let n=t&&t.length,i=n?t[0]*e:s.length,r=Cf(s,0,i,e,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=i0(s,t,r,e)),s.length>80*e){o=s[0],l=s[1];let h=o,u=l;for(let d=e;d<i;d+=e){let f=s[d],g=s[d+1];f<o&&(o=f),g<l&&(l=g),f>h&&(h=f),g>u&&(u=g)}c=Math.max(h-o,u-l),c=c!==0?32767/c:0}return Ca(r,a,e,o,l,c,0),a}function Cf(s,t,e,n,i){let r;if(i===p0(s,t,e,n)>0)for(let a=t;a<e;a+=n)r=Nd(a/n|0,s[a],s[a+1],r);else for(let a=e-n;a>=t;a-=n)r=Nd(a/n|0,s[a],s[a+1],r);return r&&Er(r,r.next)&&(Ia(r),r=r.next),r}function zs(s,t){if(!s)return s;t||(t=s);let e=s,n;do if(n=!1,!e.steiner&&(Er(e,e.next)||We(e.prev,e,e.next)===0)){if(Ia(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Ca(s,t,e,n,i,r,a){if(!s)return;!a&&r&&l0(s,n,i,r);let o=s;for(;s.prev!==s.next;){let l=s.prev,c=s.next;if(r?t0(s,n,i,r):Qm(s)){t.push(l.i,s.i,c.i),Ia(s),s=c.next,o=c.next;continue}if(s=c,s===o){a?a===1?(s=e0(zs(s),t),Ca(s,t,e,n,i,r,2)):a===2&&n0(s,t,e,n,i,r):Ca(zs(s),t,e,n,i,r,1);break}}}function Qm(s){let t=s.prev,e=s,n=s.next;if(We(t,e,n)>=0)return!1;let i=t.x,r=e.x,a=n.x,o=t.y,l=e.y,c=n.y,h=Math.min(i,r,a),u=Math.min(o,l,c),d=Math.max(i,r,a),f=Math.max(o,l,c),g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=d&&g.y>=u&&g.y<=f&&oa(i,o,r,l,a,c,g.x,g.y)&&We(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function t0(s,t,e,n){let i=s.prev,r=s,a=s.next;if(We(i,r,a)>=0)return!1;let o=i.x,l=r.x,c=a.x,h=i.y,u=r.y,d=a.y,f=Math.min(o,l,c),g=Math.min(h,u,d),_=Math.max(o,l,c),p=Math.max(h,u,d),m=Dh(f,g,t,e,n),x=Dh(_,p,t,e,n),b=s.prevZ,v=s.nextZ;for(;b&&b.z>=m&&v&&v.z<=x;){if(b.x>=f&&b.x<=_&&b.y>=g&&b.y<=p&&b!==i&&b!==a&&oa(o,h,l,u,c,d,b.x,b.y)&&We(b.prev,b,b.next)>=0||(b=b.prevZ,v.x>=f&&v.x<=_&&v.y>=g&&v.y<=p&&v!==i&&v!==a&&oa(o,h,l,u,c,d,v.x,v.y)&&We(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;b&&b.z>=m;){if(b.x>=f&&b.x<=_&&b.y>=g&&b.y<=p&&b!==i&&b!==a&&oa(o,h,l,u,c,d,b.x,b.y)&&We(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;v&&v.z<=x;){if(v.x>=f&&v.x<=_&&v.y>=g&&v.y<=p&&v!==i&&v!==a&&oa(o,h,l,u,c,d,v.x,v.y)&&We(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function e0(s,t){let e=s;do{let n=e.prev,i=e.next.next;!Er(n,i)&&If(n,e,e.next,i)&&Pa(n,i)&&Pa(i,n)&&(t.push(n.i,e.i,i.i),Ia(e),Ia(e.next),e=s=i),e=e.next}while(e!==s);return zs(e)}function n0(s,t,e,n,i,r){let a=s;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&u0(a,o)){let l=Lf(a,o);a=zs(a,a.next),l=zs(l,l.next),Ca(a,t,e,n,i,r,0),Ca(l,t,e,n,i,r,0);return}o=o.next}a=a.next}while(a!==s)}function i0(s,t,e,n){let i=[];for(let r=0,a=t.length;r<a;r++){let o=t[r]*n,l=r<a-1?t[r+1]*n:s.length,c=Cf(s,o,l,n,!1);c===c.next&&(c.steiner=!0),i.push(h0(c))}i.sort(s0);for(let r=0;r<i.length;r++)e=r0(i[r],e);return e}function s0(s,t){let e=s.x-t.x;if(e===0&&(e=s.y-t.y,e===0)){let n=(s.next.y-s.y)/(s.next.x-s.x),i=(t.next.y-t.y)/(t.next.x-t.x);e=n-i}return e}function r0(s,t){let e=a0(s,t);if(!e)return t;let n=Lf(e,s);return zs(n,n.next),zs(e,e.next)}function a0(s,t){let e=t,n=s.x,i=s.y,r=-1/0,a;if(Er(s,e))return e;do{if(Er(s,e.next))return e.next;if(i<=e.y&&i>=e.next.y&&e.next.y!==e.y){let u=e.x+(i-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(u<=n&&u>r&&(r=u,a=e.x<e.next.x?e:e.next,u===n))return a}e=e.next}while(e!==t);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;e=a;do{if(n>=e.x&&e.x>=l&&n!==e.x&&Pf(i<c?n:r,i,l,c,i<c?r:n,i,e.x,e.y)){let u=Math.abs(i-e.y)/(n-e.x);Pa(e,s)&&(u<h||u===h&&(e.x>a.x||e.x===a.x&&o0(a,e)))&&(a=e,h=u)}e=e.next}while(e!==o);return a}function o0(s,t){return We(s.prev,s,t.prev)<0&&We(t.next,s,s.next)<0}function l0(s,t,e,n){let i=s;do i.z===0&&(i.z=Dh(i.x,i.y,t,e,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,c0(i)}function c0(s){let t,e=1;do{let n=s,i;s=null;let r=null;for(t=0;n;){t++;let a=n,o=0;for(let c=0;c<e&&(o++,a=a.nextZ,!!a);c++);let l=e;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(i=n,n=n.nextZ,o--):(i=a,a=a.nextZ,l--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;n=a}r.nextZ=null,e*=2}while(t>1);return s}function Dh(s,t,e,n,i){return s=(s-e)*i|0,t=(t-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,s|t<<1}function h0(s){let t=s,e=s;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==s);return e}function Pf(s,t,e,n,i,r,a,o){return(i-a)*(t-o)>=(s-a)*(r-o)&&(s-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(i-a)*(n-o)}function oa(s,t,e,n,i,r,a,o){return!(s===a&&t===o)&&Pf(s,t,e,n,i,r,a,o)}function u0(s,t){return s.next.i!==t.i&&s.prev.i!==t.i&&!d0(s,t)&&(Pa(s,t)&&Pa(t,s)&&f0(s,t)&&(We(s.prev,s,t.prev)||We(s,t.prev,t))||Er(s,t)&&We(s.prev,s,s.next)>0&&We(t.prev,t,t.next)>0)}function We(s,t,e){return(t.y-s.y)*(e.x-t.x)-(t.x-s.x)*(e.y-t.y)}function Er(s,t){return s.x===t.x&&s.y===t.y}function If(s,t,e,n){let i=qo(We(s,t,e)),r=qo(We(s,t,n)),a=qo(We(e,n,s)),o=qo(We(e,n,t));return!!(i!==r&&a!==o||i===0&&Xo(s,e,t)||r===0&&Xo(s,n,t)||a===0&&Xo(e,s,n)||o===0&&Xo(e,t,n))}function Xo(s,t,e){return t.x<=Math.max(s.x,e.x)&&t.x>=Math.min(s.x,e.x)&&t.y<=Math.max(s.y,e.y)&&t.y>=Math.min(s.y,e.y)}function qo(s){return s>0?1:s<0?-1:0}function d0(s,t){let e=s;do{if(e.i!==s.i&&e.next.i!==s.i&&e.i!==t.i&&e.next.i!==t.i&&If(e,e.next,s,t))return!0;e=e.next}while(e!==s);return!1}function Pa(s,t){return We(s.prev,s,s.next)<0?We(s,t,s.next)>=0&&We(s,s.prev,t)>=0:We(s,t,s.prev)<0||We(s,s.next,t)<0}function f0(s,t){let e=s,n=!1,i=(s.x+t.x)/2,r=(s.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&i<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==s);return n}function Lf(s,t){let e=Nh(s.i,s.x,s.y),n=Nh(t.i,t.x,t.y),i=s.next,r=t.prev;return s.next=t,t.prev=s,e.next=i,i.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Nd(s,t,e,n){let i=Nh(s,t,e);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function Ia(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Nh(s,t,e){return{i:s,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function p0(s,t,e,n){let i=0;for(let r=t,a=e-n;r<e;r+=n)i+=(s[a]-s[r])*(s[r+1]+s[a+1]),a=r;return i}var Uh=class{static triangulate(t,e,n=2){return jm(t,e,n)}},wi=class s{static area(t){let e=t.length,n=0;for(let i=e-1,r=0;r<e;i=r++)n+=t[i].x*t[r].y-t[r].x*t[i].y;return n*.5}static isClockWise(t){return s.area(t)<0}static triangulateShape(t,e){let n=[],i=[],r=[];Ud(t),Fd(n,t);let a=t.length;e.forEach(Ud);for(let l=0;l<e.length;l++)i.push(a),a+=e[l].length,Fd(n,e[l]);let o=Uh.triangulate(n,i);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function Ud(s){let t=s.length;t>2&&s[t-1].equals(s[0])&&s.pop()}function Fd(s,t){for(let e=0;e<t.length;e++)s.push(t[e].x),s.push(t[e].y)}var La=class s extends Re{constructor(t=new Ji([new at(.5,.5),new at(-.5,.5),new at(-.5,-.5),new at(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,i=[],r=[];for(let o=0,l=t.length;o<l;o++){let c=t[o];a(c)}this.setAttribute("position",new se(i,3)),this.setAttribute("uv",new se(r,2)),this.computeVertexNormals();function a(o){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:f-.1,_=e.bevelOffset!==void 0?e.bevelOffset:0,p=e.bevelSegments!==void 0?e.bevelSegments:3,m=e.extrudePath,x=e.UVGenerator!==void 0?e.UVGenerator:m0,b,v=!1,S,w,R,y;if(m){b=m.getSpacedPoints(h),v=!0,d=!1;let st=m.isCatmullRomCurve3?m.closed:!1;S=m.computeFrenetFrames(h,st),w=new T,R=new T,y=new T}d||(p=0,f=0,g=0,_=0);let A=o.extractPoints(c),P=A.shape,L=A.holes;if(!wi.isClockWise(P)){P=P.reverse();for(let st=0,lt=L.length;st<lt;st++){let ct=L[st];wi.isClockWise(ct)&&(L[st]=ct.reverse())}}function k(st){let ct=10000000000000001e-36,ht=st[0];for(let xt=1;xt<=st.length;xt++){let qt=xt%st.length,Gt=st[qt],Zt=Gt.x-ht.x,$t=Gt.y-ht.y,D=Zt*Zt+$t*$t,fe=Math.max(Math.abs(Gt.x),Math.abs(Gt.y),Math.abs(ht.x),Math.abs(ht.y)),ne=ct*fe*fe;if(D<=ne){st.splice(qt,1),xt--;continue}ht=Gt}}k(P),L.forEach(k);let N=L.length,z=P;for(let st=0;st<N;st++){let lt=L[st];P=P.concat(lt)}function J(st,lt,ct){return lt||Kt("ExtrudeGeometry: vec does not exist"),st.clone().addScaledVector(lt,ct)}let Y=P.length;function rt(st,lt,ct){let ht,xt,qt,Gt=st.x-lt.x,Zt=st.y-lt.y,$t=ct.x-st.x,D=ct.y-st.y,fe=Gt*Gt+Zt*Zt,ne=Gt*D-Zt*$t;if(Math.abs(ne)>Number.EPSILON){let C=Math.sqrt(fe),M=Math.sqrt($t*$t+D*D),O=lt.x-Zt/C,W=lt.y+Gt/C,$=ct.x-D/M,dt=ct.y+$t/M,ft=(($-O)*D-(dt-W)*$t)/(Gt*D-Zt*$t);ht=O+Gt*ft-st.x,xt=W+Zt*ft-st.y;let j=ht*ht+xt*xt;if(j<=2)return new at(ht,xt);qt=Math.sqrt(j/2)}else{let C=!1;Gt>Number.EPSILON?$t>Number.EPSILON&&(C=!0):Gt<-Number.EPSILON?$t<-Number.EPSILON&&(C=!0):Math.sign(Zt)===Math.sign(D)&&(C=!0),C?(ht=-Zt,xt=Gt,qt=Math.sqrt(fe)):(ht=Gt,xt=Zt,qt=Math.sqrt(fe/2))}return new at(ht/qt,xt/qt)}let Z=[];for(let st=0,lt=z.length,ct=lt-1,ht=st+1;st<lt;st++,ct++,ht++)ct===lt&&(ct=0),ht===lt&&(ht=0),Z[st]=rt(z[st],z[ct],z[ht]);let tt=[],it,It=Z.concat();for(let st=0,lt=N;st<lt;st++){let ct=L[st];it=[];for(let ht=0,xt=ct.length,qt=xt-1,Gt=ht+1;ht<xt;ht++,qt++,Gt++)qt===xt&&(qt=0),Gt===xt&&(Gt=0),it[ht]=rt(ct[ht],ct[qt],ct[Gt]);tt.push(it),It=It.concat(it)}let Rt;if(p===0)Rt=wi.triangulateShape(z,L);else{let st=[],lt=[];for(let ct=0;ct<p;ct++){let ht=ct/p,xt=f*Math.cos(ht*Math.PI/2),qt=g*Math.sin(ht*Math.PI/2)+_;for(let Gt=0,Zt=z.length;Gt<Zt;Gt++){let $t=J(z[Gt],Z[Gt],qt);_t($t.x,$t.y,-xt),ht===0&&st.push($t)}for(let Gt=0,Zt=N;Gt<Zt;Gt++){let $t=L[Gt];it=tt[Gt];let D=[];for(let fe=0,ne=$t.length;fe<ne;fe++){let C=J($t[fe],it[fe],qt);_t(C.x,C.y,-xt),ht===0&&D.push(C)}ht===0&&lt.push(D)}}Rt=wi.triangulateShape(st,lt)}let re=Rt.length,ee=g+_;for(let st=0;st<Y;st++){let lt=d?J(P[st],It[st],ee):P[st];v?(R.copy(S.normals[0]).multiplyScalar(lt.x),w.copy(S.binormals[0]).multiplyScalar(lt.y),y.copy(b[0]).add(R).add(w),_t(y.x,y.y,y.z)):_t(lt.x,lt.y,0)}for(let st=1;st<=h;st++)for(let lt=0;lt<Y;lt++){let ct=d?J(P[lt],It[lt],ee):P[lt];v?(R.copy(S.normals[st]).multiplyScalar(ct.x),w.copy(S.binormals[st]).multiplyScalar(ct.y),y.copy(b[st]).add(R).add(w),_t(y.x,y.y,y.z)):_t(ct.x,ct.y,u/h*st)}for(let st=p-1;st>=0;st--){let lt=st/p,ct=f*Math.cos(lt*Math.PI/2),ht=g*Math.sin(lt*Math.PI/2)+_;for(let xt=0,qt=z.length;xt<qt;xt++){let Gt=J(z[xt],Z[xt],ht);_t(Gt.x,Gt.y,u+ct)}for(let xt=0,qt=L.length;xt<qt;xt++){let Gt=L[xt];it=tt[xt];for(let Zt=0,$t=Gt.length;Zt<$t;Zt++){let D=J(Gt[Zt],it[Zt],ht);v?_t(D.x,D.y+b[h-1].y,b[h-1].x+ct):_t(D.x,D.y,u+ct)}}}ie(),X();function ie(){let st=i.length/3;if(d){let lt=0,ct=Y*lt;for(let ht=0;ht<re;ht++){let xt=Rt[ht];Vt(xt[2]+ct,xt[1]+ct,xt[0]+ct)}lt=h+p*2,ct=Y*lt;for(let ht=0;ht<re;ht++){let xt=Rt[ht];Vt(xt[0]+ct,xt[1]+ct,xt[2]+ct)}}else{for(let lt=0;lt<re;lt++){let ct=Rt[lt];Vt(ct[2],ct[1],ct[0])}for(let lt=0;lt<re;lt++){let ct=Rt[lt];Vt(ct[0]+Y*h,ct[1]+Y*h,ct[2]+Y*h)}}n.addGroup(st,i.length/3-st,0)}function X(){let st=i.length/3,lt=0;Q(z,lt),lt+=z.length;for(let ct=0,ht=L.length;ct<ht;ct++){let xt=L[ct];Q(xt,lt),lt+=xt.length}n.addGroup(st,i.length/3-st,1)}function Q(st,lt){let ct=st.length;for(;--ct>=0;){let ht=ct,xt=ct-1;xt<0&&(xt=st.length-1);for(let qt=0,Gt=h+p*2;qt<Gt;qt++){let Zt=Y*qt,$t=Y*(qt+1),D=lt+ht+Zt,fe=lt+xt+Zt,ne=lt+xt+$t,C=lt+ht+$t;St(D,fe,ne,C)}}}function _t(st,lt,ct){l.push(st),l.push(lt),l.push(ct)}function Vt(st,lt,ct){Xt(st),Xt(lt),Xt(ct);let ht=i.length/3,xt=x.generateTopUV(n,i,ht-3,ht-2,ht-1);he(xt[0]),he(xt[1]),he(xt[2])}function St(st,lt,ct,ht){Xt(st),Xt(lt),Xt(ht),Xt(lt),Xt(ct),Xt(ht);let xt=i.length/3,qt=x.generateSideWallUV(n,i,xt-6,xt-3,xt-2,xt-1);he(qt[0]),he(qt[1]),he(qt[3]),he(qt[1]),he(qt[2]),he(qt[3])}function Xt(st){i.push(l[st*3+0]),i.push(l[st*3+1]),i.push(l[st*3+2])}function he(st){r.push(st.x),r.push(st.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return g0(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,a=t.shapes.length;r<a;r++){let o=e[t.shapes[r]];n.push(o)}let i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new Lh[i.type]().fromJSON(i)),new s(n,t.options)}},m0={generateTopUV:function(s,t,e,n,i){let r=t[e*3],a=t[e*3+1],o=t[n*3],l=t[n*3+1],c=t[i*3],h=t[i*3+1];return[new at(r,a),new at(o,l),new at(c,h)]},generateSideWallUV:function(s,t,e,n,i,r){let a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],u=t[n*3+2],d=t[i*3],f=t[i*3+1],g=t[i*3+2],_=t[r*3],p=t[r*3+1],m=t[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new at(a,1-l),new at(c,1-u),new at(d,1-g),new at(_,1-m)]:[new at(o,1-l),new at(h,1-u),new at(f,1-g),new at(p,1-m)]}};function g0(s,t,e){if(e.shapes=[],Array.isArray(s))for(let n=0,i=s.length;n<i;n++){let r=s[n];e.shapes.push(r.uuid)}else e.shapes.push(s.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Da=class s extends ul{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new s(t.radius,t.detail)}};var gn=class s extends Re{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};let r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=t/o,d=e/l,f=[],g=[],_=[],p=[];for(let m=0;m<h;m++){let x=m*d-a;for(let b=0;b<c;b++){let v=b*u-r;g.push(v,-x,0),_.push(0,0,1),p.push(b/o),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let x=0;x<o;x++){let b=x+c*m,v=x+c*(m+1),S=x+1+c*(m+1),w=x+1+c*m;f.push(b,v,w),f.push(v,S,w)}this.setIndex(f),this.setAttribute("position",new se(g,3)),this.setAttribute("normal",new se(_,3)),this.setAttribute("uv",new se(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.widthSegments,t.heightSegments)}},Na=class s extends Re{constructor(t=.5,e=1,n=32,i=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:a},n=Math.max(3,n),i=Math.max(1,i);let o=[],l=[],c=[],h=[],u=t,d=(e-t)/i,f=new T,g=new at;for(let _=0;_<=i;_++){for(let p=0;p<=n;p++){let m=r+p/n*a;f.x=u*Math.cos(m),f.y=u*Math.sin(m),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/e+1)/2,g.y=(f.y/e+1)/2,h.push(g.x,g.y)}u+=d}for(let _=0;_<i;_++){let p=_*(n+1);for(let m=0;m<n;m++){let x=m+p,b=x,v=x+n+1,S=x+n+2,w=x+1;o.push(b,v,w),o.push(v,S,w)}}this.setIndex(o),this.setAttribute("position",new se(l,3)),this.setAttribute("normal",new se(c,3)),this.setAttribute("uv",new se(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Ua=class s extends Re{constructor(t=new Ji([new at(0,.5),new at(-.5,-.5),new at(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};let n=[],i=[],r=[],a=[],o=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let h=0;h<t.length;h++)c(t[h]),this.addGroup(o,l,h),o+=l,l=0;this.setIndex(n),this.setAttribute("position",new se(i,3)),this.setAttribute("normal",new se(r,3)),this.setAttribute("uv",new se(a,2));function c(h){let u=i.length/3,d=h.extractPoints(e),f=d.shape,g=d.holes;wi.isClockWise(f)===!1&&(f=f.reverse());for(let p=0,m=g.length;p<m;p++){let x=g[p];wi.isClockWise(x)===!0&&(g[p]=x.reverse())}let _=wi.triangulateShape(f,g);for(let p=0,m=g.length;p<m;p++){let x=g[p];f=f.concat(x)}for(let p=0,m=f.length;p<m;p++){let x=f[p];i.push(x.x,x.y,0),r.push(0,0,1),a.push(x.x,x.y)}for(let p=0,m=_.length;p<m;p++){let x=_[p],b=x[0]+u,v=x[1]+u,S=x[2]+u;n.push(b,v,S),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes;return x0(e,t)}static fromJSON(t,e){let n=[];for(let i=0,r=t.shapes.length;i<r;i++){let a=e[t.shapes[i]];n.push(a)}return new s(n,t.curveSegments)}};function x0(s,t){if(t.shapes=[],Array.isArray(s))for(let e=0,n=s.length;e<n;e++){let i=s[e];t.shapes.push(i.uuid)}else t.shapes.push(s.uuid);return t}var Xn=class s extends Re{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],u=new T,d=new T,f=[],g=[],_=[],p=[];for(let m=0;m<=n;m++){let x=[],b=m/n,v=a+b*o,S=t*Math.cos(v),w=Math.sqrt(t*t-S*S),R=0;m===0&&a===0?R=.5/e:m===n&&l===Math.PI&&(R=-.5/e);for(let y=0;y<=e;y++){let A=y/e,P=i+A*r;u.x=-w*Math.cos(P),u.y=S,u.z=w*Math.sin(P),g.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),p.push(A+R,1-b),x.push(c++)}h.push(x)}for(let m=0;m<n;m++)for(let x=0;x<e;x++){let b=h[m][x+1],v=h[m][x],S=h[m+1][x],w=h[m+1][x+1];(m!==0||a>0)&&f.push(b,v,w),(m!==n-1||l<Math.PI)&&f.push(v,S,w)}this.setIndex(f),this.setAttribute("position",new se(g,3)),this.setAttribute("normal",new se(_,3)),this.setAttribute("uv",new se(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var Li=class s extends Re{constructor(t=1,e=.4,n=12,i=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:i,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),i=Math.floor(i);let l=[],c=[],h=[],u=[],d=new T,f=new T,g=new T;for(let _=0;_<=n;_++){let p=a+_/n*o;for(let m=0;m<=i;m++){let x=m/i*r;f.x=(t+e*Math.cos(p))*Math.cos(x),f.y=(t+e*Math.cos(p))*Math.sin(x),f.z=e*Math.sin(p),c.push(f.x,f.y,f.z),d.x=t*Math.cos(x),d.y=t*Math.sin(x),g.subVectors(f,d).normalize(),h.push(g.x,g.y,g.z),u.push(m/i),u.push(_/n)}}for(let _=1;_<=n;_++)for(let p=1;p<=i;p++){let m=(i+1)*_+p-1,x=(i+1)*(_-1)+p-1,b=(i+1)*(_-1)+p,v=(i+1)*_+p;l.push(m,x,v),l.push(x,b,v)}this.setIndex(l),this.setAttribute("position",new se(c,3)),this.setAttribute("normal",new se(h,3)),this.setAttribute("uv",new se(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function qs(s){let t={};for(let e in s){t[e]={};for(let n in s[e]){let i=s[e][n];if(Bd(i))i.isRenderTargetTexture?(Jt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone();else if(Array.isArray(i))if(Bd(i[0])){let r=[];for(let a=0,o=i.length;a<o;a++)r[a]=i[a].clone();t[e][n]=r}else t[e][n]=i.slice();else t[e][n]=i}}return t}function Rn(s){let t={};for(let e=0;e<s.length;e++){let n=qs(s[e]);for(let i in n)t[i]=n[i]}return t}function Bd(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function _0(s){let t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function iu(s){let t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ce.workingColorSpace}var $i={clone:qs,merge:Rn},v0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,y0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ue=class extends ds{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=v0,this.fragmentShader=y0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=qs(t.uniforms),this.uniformsGroups=_0(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let i in this.uniforms){let a=this.uniforms[i].value;a&&a.isTexture?e.uniforms[i]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[i]={type:"m4",value:a.toArray()}:e.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let i=t.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=e[i.value]||null;break;case"c":this.uniforms[n].value=new Pt().setHex(i.value);break;case"v2":this.uniforms[n].value=new at().fromArray(i.value);break;case"v3":this.uniforms[n].value=new T().fromArray(i.value);break;case"v4":this.uniforms[n].value=new Ve().fromArray(i.value);break;case"m3":this.uniforms[n].value=new jt().fromArray(i.value);break;case"m4":this.uniforms[n].value=new we().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},wr=class extends Ue{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},te=class extends ds{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Pt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Pt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vc,this.normalScale=new at(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Hs=class extends te{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new at(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return le(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Pt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Pt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Pt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var _l=class extends ds{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=pf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},vl=class extends ds{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function ur(s,t){return!s||s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function Th(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}var ps=class{constructor(t,e,n,i){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,i=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<i)){for(let o=n+2;;){if(i===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=i,i=e[++n],t<i)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(i=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,t,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=t*i;for(let a=0;a!==i;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},yl=class extends ps{constructor(t,e,n,i){super(t,e,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ch,endingEnd:Ch}}intervalChanged_(t,e,n){let i=this.parameterPositions,r=t-2,a=t+1,o=i[r],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case Ph:r=t,o=2*e-n;break;case Ih:r=i.length-2,o=e+i[r]-i[r+1];break;default:r=t,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ph:a=t,l=2*n-e;break;case Ih:a=1,l=n+i[1]-i[0];break;default:a=t-1,l=e}let c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(t,e,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-e)/(i-e),_=g*g,p=_*g,m=-d*p+2*d*_-d*g,x=(1+d)*p+(-1.5-2*d)*_+(-.5+d)*g+1,b=(-1-f)*p+(1.5+f)*_+.5*g,v=f*p-f*_;for(let S=0;S!==o;++S)r[S]=m*a[h+S]+x*a[c+S]+b*a[l+S]+v*a[u+S];return r}},Ml=class extends ps{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=(n-e)/(i-e),u=1-h;for(let d=0;d!==o;++d)r[d]=a[c+d]*u+a[l+d]*h;return r}},bl=class extends ps{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t){return this.copySampleValue_(t-1)}},Sl=class extends ps{interpolate_(t,e,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this.inTangents,u=this.outTangents;if(!h||!u){let g=(n-e)/(i-e),_=1-g;for(let p=0;p!==o;++p)r[p]=a[c+p]*_+a[l+p]*g;return r}let d=o*2,f=t-1;for(let g=0;g!==o;++g){let _=a[c+g],p=a[l+g],m=f*d+g*2,x=u[m],b=u[m+1],v=t*d+g*2,S=h[v],w=h[v+1],R=b0(n,e,x,S,i);r[g]=Df(R,_,b,w,p)}return r}};function Df(s,t,e,n,i){let r=1-s;return r*r*r*t+3*r*r*s*e+3*r*s*s*n+s*s*s*i}function M0(s,t,e,n,i){let r=1-s;return 3*r*r*(e-t)+6*r*s*(n-e)+3*s*s*(i-n)}function b0(s,t,e,n,i){let r=(s-t)/(i-t);for(let a=0;a<8;a++){let o=Df(r,t,e,n,i)-s;if(Math.abs(o)<1e-10)break;let l=M0(r,t,e,n,i);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var qn=class{constructor(t,e,n,i){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=ur(e,this.TimeBufferType),this.values=ur(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:ur(t.times,Array),values:ur(t.values,Array)};let i=t.getInterpolation();i!==t.DefaultInterpolation&&(n.interpolation=i),Th(t.settings)&&(n.settings={inTangents:ur(t.settings.inTangents,Array),outTangents:ur(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new bl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Ml(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new yl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new Sl(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case da:e=this.InterpolantFactoryMethodDiscrete;break;case rl:e=this.InterpolantFactoryMethodLinear;break;case Jo:e=this.InterpolantFactoryMethodSmooth;break;case Rh:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Jt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return da;case this.InterpolantFactoryMethodLinear:return rl;case this.InterpolantFactoryMethodSmooth:return Jo;case this.InterpolantFactoryMethodBezier:return Rh}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]*=t;Th(this.settings)&&(Od(this.settings.inTangents,t),Od(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,i=n.length,r=0,a=i-1;for(;r!==i&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==i){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Kt("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,i=this.values,r=n.length;r===0&&(Kt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Kt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){Kt("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(i!==void 0&&cm(i))for(let o=0,l=i.length;o!==l;++o){let c=i[o];if(isNaN(c)){Kt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Jo,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],h=t[o+1];if(c!==h&&(o!==1||c!==t[0]))if(i)l=!0;else{let u=o*n,d=u-n,f=u+n;for(let g=0;g!==n;++g){let _=e[u+g];if(_!==e[d+g]||_!==e[f+g]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let u=o*n,d=a*n;for(let f=0;f!==n;++f)e[d+f]=e[u+f]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,i=new n(this.name,t,e);return i.createInterpolant=this.createInterpolant,Th(this.settings)&&(i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),i}};function Od(s,t){for(let e=0,n=s.length;e!==n;e+=2)s[e]*=t}qn.prototype.ValueTypeName="";qn.prototype.TimeBufferType=Float32Array;qn.prototype.ValueBufferType=Float32Array;qn.prototype.DefaultInterpolation=rl;var ms=class extends qn{constructor(t,e,n){super(t,e,n)}};ms.prototype.ValueTypeName="bool";ms.prototype.ValueBufferType=Array;ms.prototype.DefaultInterpolation=da;ms.prototype.InterpolantFactoryMethodLinear=void 0;ms.prototype.InterpolantFactoryMethodSmooth=void 0;var El=class extends qn{constructor(t,e,n,i){super(t,e,n,i)}};El.prototype.ValueTypeName="color";var wl=class extends qn{constructor(t,e,n,i){super(t,e,n,i)}};wl.prototype.ValueTypeName="number";var Tl=class extends ps{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-e)/(i-e),c=t*o;for(let h=c+o;c!==h;c+=4)xe.slerpFlat(r,0,a,c-o,a,c,l);return r}},Fa=class extends qn{constructor(t,e,n,i){super(t,e,n,i)}InterpolantFactoryMethodLinear(t){return new Tl(this.times,this.values,this.getValueSize(),t)}};Fa.prototype.ValueTypeName="quaternion";Fa.prototype.InterpolantFactoryMethodSmooth=void 0;var gs=class extends qn{constructor(t,e,n){super(t,e,n)}};gs.prototype.ValueTypeName="string";gs.prototype.ValueBufferType=Array;gs.prototype.DefaultInterpolation=da;gs.prototype.InterpolantFactoryMethodLinear=void 0;gs.prototype.InterpolantFactoryMethodSmooth=void 0;var Al=class extends qn{constructor(t,e,n,i){super(t,e,n,i)}};Al.prototype.ValueTypeName="vector";var Rl=class{constructor(t,e,n){let i=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&i.onStart!==void 0&&i.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Nf=new Rl,Cl=class{constructor(t){this.manager=t!==void 0?t:Nf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(i,r){n.load(t,i,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Cl.DEFAULT_MATERIAL_NAME="__DEFAULT";var Tr=class extends Tn{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Pt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Ba=class extends Tr{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Tn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Pt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Ah=new we,zd=new T,Hd=new T,Oa=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new at(512,512),this.mapType=zn,this.map=null,this.mapPass=null,this.matrix=new we,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new br,this._frameExtents=new at(1,1),this._viewportCount=1,this._viewports=[new Ve(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;zd.setFromMatrixPosition(t.matrixWorld),e.position.copy(zd),Hd.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Hd),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,i){Ah.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(Ah,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=i?i.z/r.x:1,o=i?i.w/r.y:1,l=i?i.x/r.x:0,c=i?i.y/r.y:0;t.coordinateSystem===xr||t.reversedDepth?e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(Ah)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Yo=new T,Zo=new xe,Si=new T,za=class extends Tn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new we,this.projectionMatrix=new we,this.projectionMatrixInverse=new we,this.coordinateSystem=fi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Yo,Zo,Si),Si.x===1&&Si.y===1&&Si.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Yo,Zo,Si.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Yo,Zo,Si),Si.x===1&&Si.y===1&&Si.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Yo,Zo,Si.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},cs=new T,kd=new at,Vd=new at,on=class extends za{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=vr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(la*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return vr*2*Math.atan(Math.tan(la*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){cs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(cs.x,cs.y).multiplyScalar(-t/cs.z),cs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(cs.x,cs.y).multiplyScalar(-t/cs.z)}getViewSize(t,e){return this.getViewBounds(t,kd,Vd),e.subVectors(Vd,kd)}setViewOffset(t,e,n,i,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(la*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,r=-.5*i,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*i/l,e-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Fh=class extends Oa{constructor(){super(new on(90,1,.5,500)),this.isPointLightShadow=!0}},Ha=class extends Tr{constructor(t,e,n=0,i=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Fh}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},xs=class extends za{constructor(t=-1,e=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,r=n-t,a=n+t,o=i+e,l=i-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Bh=class extends Oa{constructor(){super(new xs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ka=class extends Tr{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Tn.DEFAULT_UP),this.updateMatrix(),this.target=new Tn,this.shadow=new Bh}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Va=class extends Re{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}};var dr=-90,fr=1,Pl=class extends Tn{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new on(dr,fr,t,e);i.layers=this.layers,this.add(i);let r=new on(dr,fr,t,e);r.layers=this.layers,this.add(r);let a=new on(dr,fr,t,e);a.layers=this.layers,this.add(a);let o=new on(dr,fr,t,e);o.layers=this.layers,this.add(o);let l=new on(dr,fr,t,e);l.layers=this.layers,this.add(l);let c=new on(dr,fr,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,i,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===fi)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===xr)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;t.isWebGLRenderer===!0?p=t.state.buffers.depth.getReversed():p=t.reversedDepthBuffer,t.setRenderTarget(n,0,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Il=class extends on{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}},Ga=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(t){this._document=t,t.hidden!==void 0&&(this._pageVisibilityHandler=S0.bind(this),t.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(t){return this._timescale=t,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(t){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(t!==void 0?t:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function S0(){this._document.hidden===!1&&this.reset()}var su="\\[\\]\\.:\\/",E0=new RegExp("["+su+"]","g"),ru="[^"+su+"]",w0="[^"+su.replace("\\.","")+"]",T0=/((?:WC+[\/:])*)/.source.replace("WC",ru),A0=/(WCOD+)?/.source.replace("WCOD",w0),R0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ru),C0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ru),P0=new RegExp("^"+T0+A0+R0+C0+"$"),I0=["material","materials","bones","map"],Oh=class{constructor(t,e,n){let i=n||He.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,i)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},He=class s{constructor(t,e,n){this.path=e,this.parsedPath=n||s.parseTrackName(e),this.node=s.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new s.Composite(t,e,n):new s(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(E0,"")}static parseTrackName(t){let e=P0.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let r=n.nodeName.substring(i+1);I0.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=n(o.children);if(l)return l}return null},i=n(t.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)t[e++]=n[i]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,i=e.propertyName,r=e.propertyIndex;if(t||(t=s.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Jt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){Kt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Kt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Kt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Kt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Kt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Kt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){Kt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[i];if(a===void 0){let c=e.nodeName;Kt("PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!t.geometry){Kt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Kt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};He.Composite=Oh;He.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};He.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};He.prototype.GetterByBindingType=[He.prototype._getValue_direct,He.prototype._getValue_array,He.prototype._getValue_arrayElement,He.prototype._getValue_toArray];He.prototype.SetterByBindingTypeAndVersioning=[[He.prototype._setValue_direct,He.prototype._setValue_direct_setNeedsUpdate,He.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[He.prototype._setValue_array,He.prototype._setValue_array_setNeedsUpdate,He.prototype._setValue_array_setMatrixWorldNeedsUpdate],[He.prototype._setValue_arrayElement,He.prototype._setValue_arrayElement_setNeedsUpdate,He.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[He.prototype._setValue_fromArray,He.prototype._setValue_fromArray_setNeedsUpdate,He.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var _M=new Float32Array(1);var uu=class uu{constructor(t,e,n,i){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,i){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=i,this}};uu.prototype.isMatrix2=!0;var zh=uu;function au(s,t,e,n){let i=L0(n);switch(e){case $h:return s*t;case zl:return s*t/i.components*i.byteLength;case Hl:return s*t/i.components*i.byteLength;case bs:return s*t*2/i.components*i.byteLength;case kl:return s*t*2/i.components*i.byteLength;case jh:return s*t*3/i.components*i.byteLength;case si:return s*t*4/i.components*i.byteLength;case Vl:return s*t*4/i.components*i.byteLength;case ja:case Qa:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case to:case eo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Wl:case ql:return Math.max(s,16)*Math.max(t,8)/4;case Gl:case Xl:return Math.max(s,8)*Math.max(t,8)/2;case Yl:case Zl:case Kl:case $l:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Jl:case no:case jl:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Ql:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case tc:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case ec:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case nc:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case ic:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case sc:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case rc:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case ac:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case oc:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case lc:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case cc:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case hc:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case uc:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case dc:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case fc:case pc:case mc:return Math.ceil(s/4)*Math.ceil(t/4)*16;case gc:case xc:return Math.ceil(s/4)*Math.ceil(t/4)*8;case io:case _c:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function L0(s){switch(s){case zn:case Yh:return{byteLength:1,components:1};case Rr:case Zh:case cn:return{byteLength:2,components:1};case Bl:case Ol:return{byteLength:2,components:4};case mi:case Fl:case ii:return{byteLength:4,components:1};case Jh:case Kh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Jt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function np(){let s=null,t=!1,e=null,n=null;function i(r,a){n=s.requestAnimationFrame(i),e(r,a)}return{start:function(){t!==!0&&e!==null&&s!==null&&(n=s.requestAnimationFrame(i),t=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function z0(s){let t=new WeakMap;function e(o,l){let c=o.array,h=o.usage,u=c.byteLength,d=s.createBuffer();s.bindBuffer(l,d),s.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=s.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){let h=l.array,u=l.updateRanges;if(s.bindBuffer(c,o),u.length===0)s.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){let g=u[d],_=u[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,u[d]=_)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){let _=u[f];s.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(s.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:r,update:a}}var H0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,k0=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,V0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,G0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,W0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,X0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,q0=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Y0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Z0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,J0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,K0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,$0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,j0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Q0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,tg=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,eg=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,ng=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ig=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,sg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,rg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,ag=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,og=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,lg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,cg=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,hg=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,ug=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,dg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,fg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,pg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,mg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,gg="gl_FragColor = linearToOutputTexel( gl_FragColor );",xg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,_g=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,vg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,yg=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Mg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,bg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Sg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Eg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,wg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Tg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ag=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Rg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Cg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Pg=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Ig=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Lg=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Dg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ng=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ug=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Fg=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Bg=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Og=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,zg=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Hg=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,kg=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Vg=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Gg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Wg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Xg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Yg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Zg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Jg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Kg=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,$g=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,jg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Qg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,tx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,ex=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,nx=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,ix=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,sx=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,rx=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,ax=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ox=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,lx=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,cx=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,hx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ux=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,dx=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,fx=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,px=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,mx=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,gx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,xx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,_x=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,vx=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,yx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Mx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,bx=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Sx=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Ex=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,wx=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Tx=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ax=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Rx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Cx=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Px=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Ix=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Lx=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Dx=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Nx=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Ux=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Fx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Bx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ox=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,zx=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Hx=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,kx=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Vx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Gx=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Xx=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,qx=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Yx=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Zx=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Jx=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Kx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,$x=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jx=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Qx=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,t_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,e_=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,n_=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,i_=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,s_=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,r_=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,a_=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,o_=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,l_=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,c_=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,h_=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,u_=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,d_=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,f_=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,p_=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,m_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,g_=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,x_=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,__=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,v_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,oe={alphahash_fragment:H0,alphahash_pars_fragment:k0,alphamap_fragment:V0,alphamap_pars_fragment:G0,alphatest_fragment:W0,alphatest_pars_fragment:X0,aomap_fragment:q0,aomap_pars_fragment:Y0,batching_pars_vertex:Z0,batching_vertex:J0,begin_vertex:K0,beginnormal_vertex:$0,bsdfs:j0,iridescence_fragment:Q0,bumpmap_pars_fragment:tg,clipping_planes_fragment:eg,clipping_planes_pars_fragment:ng,clipping_planes_pars_vertex:ig,clipping_planes_vertex:sg,color_fragment:rg,color_pars_fragment:ag,color_pars_vertex:og,color_vertex:lg,common:cg,cube_uv_reflection_fragment:hg,defaultnormal_vertex:ug,displacementmap_pars_vertex:dg,displacementmap_vertex:fg,emissivemap_fragment:pg,emissivemap_pars_fragment:mg,colorspace_fragment:gg,colorspace_pars_fragment:xg,envmap_fragment:_g,envmap_common_pars_fragment:vg,envmap_pars_fragment:yg,envmap_pars_vertex:Mg,envmap_physical_pars_fragment:Lg,envmap_vertex:bg,fog_vertex:Sg,fog_pars_vertex:Eg,fog_fragment:wg,fog_pars_fragment:Tg,gradientmap_pars_fragment:Ag,lightmap_pars_fragment:Rg,lights_lambert_fragment:Cg,lights_lambert_pars_fragment:Pg,lights_pars_begin:Ig,lights_toon_fragment:Dg,lights_toon_pars_fragment:Ng,lights_phong_fragment:Ug,lights_phong_pars_fragment:Fg,lights_physical_fragment:Bg,lights_physical_pars_fragment:Og,lights_fragment_begin:zg,lights_fragment_maps:Hg,lights_fragment_end:kg,lightprobes_pars_fragment:Vg,logdepthbuf_fragment:Gg,logdepthbuf_pars_fragment:Wg,logdepthbuf_pars_vertex:Xg,logdepthbuf_vertex:qg,map_fragment:Yg,map_pars_fragment:Zg,map_particle_fragment:Jg,map_particle_pars_fragment:Kg,metalnessmap_fragment:$g,metalnessmap_pars_fragment:jg,morphinstance_vertex:Qg,morphcolor_vertex:tx,morphnormal_vertex:ex,morphtarget_pars_vertex:nx,morphtarget_vertex:ix,normal_fragment_begin:sx,normal_fragment_maps:rx,normal_pars_fragment:ax,normal_pars_vertex:ox,normal_vertex:lx,normalmap_pars_fragment:cx,clearcoat_normal_fragment_begin:hx,clearcoat_normal_fragment_maps:ux,clearcoat_pars_fragment:dx,iridescence_pars_fragment:fx,opaque_fragment:px,packing:mx,premultiplied_alpha_fragment:gx,project_vertex:xx,dithering_fragment:_x,dithering_pars_fragment:vx,roughnessmap_fragment:yx,roughnessmap_pars_fragment:Mx,shadowmap_pars_fragment:bx,shadowmap_pars_vertex:Sx,shadowmap_vertex:Ex,shadowmask_pars_fragment:wx,skinbase_vertex:Tx,skinning_pars_vertex:Ax,skinning_vertex:Rx,skinnormal_vertex:Cx,specularmap_fragment:Px,specularmap_pars_fragment:Ix,tonemapping_fragment:Lx,tonemapping_pars_fragment:Dx,transmission_fragment:Nx,transmission_pars_fragment:Ux,uv_pars_fragment:Fx,uv_pars_vertex:Bx,uv_vertex:Ox,worldpos_vertex:zx,background_vert:Hx,background_frag:kx,backgroundCube_vert:Vx,backgroundCube_frag:Gx,cube_vert:Wx,cube_frag:Xx,depth_vert:qx,depth_frag:Yx,distance_vert:Zx,distance_frag:Jx,equirect_vert:Kx,equirect_frag:$x,linedashed_vert:jx,linedashed_frag:Qx,meshbasic_vert:t_,meshbasic_frag:e_,meshlambert_vert:n_,meshlambert_frag:i_,meshmatcap_vert:s_,meshmatcap_frag:r_,meshnormal_vert:a_,meshnormal_frag:o_,meshphong_vert:l_,meshphong_frag:c_,meshphysical_vert:h_,meshphysical_frag:u_,meshtoon_vert:d_,meshtoon_frag:f_,points_vert:p_,points_frag:m_,shadow_vert:g_,shadow_frag:x_,sprite_vert:__,sprite_frag:v_},wt={common:{diffuse:{value:new Pt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new jt},alphaMap:{value:null},alphaMapTransform:{value:new jt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new jt}},envmap:{envMap:{value:null},envMapRotation:{value:new jt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new jt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new jt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new jt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new jt},normalScale:{value:new at(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new jt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new jt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new jt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new jt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Pt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new T},probesMax:{value:new T},probesResolution:{value:new T}},points:{diffuse:{value:new Pt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new jt},alphaTest:{value:0},uvTransform:{value:new jt}},sprite:{diffuse:{value:new Pt(16777215)},opacity:{value:1},center:{value:new at(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new jt},alphaMap:{value:null},alphaMapTransform:{value:new jt},alphaTest:{value:0}}},Ui={basic:{uniforms:Rn([wt.common,wt.specularmap,wt.envmap,wt.aomap,wt.lightmap,wt.fog]),vertexShader:oe.meshbasic_vert,fragmentShader:oe.meshbasic_frag},lambert:{uniforms:Rn([wt.common,wt.specularmap,wt.envmap,wt.aomap,wt.lightmap,wt.emissivemap,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.fog,wt.lights,{emissive:{value:new Pt(0)},envMapIntensity:{value:1}}]),vertexShader:oe.meshlambert_vert,fragmentShader:oe.meshlambert_frag},phong:{uniforms:Rn([wt.common,wt.specularmap,wt.envmap,wt.aomap,wt.lightmap,wt.emissivemap,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.fog,wt.lights,{emissive:{value:new Pt(0)},specular:{value:new Pt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:oe.meshphong_vert,fragmentShader:oe.meshphong_frag},standard:{uniforms:Rn([wt.common,wt.envmap,wt.aomap,wt.lightmap,wt.emissivemap,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.roughnessmap,wt.metalnessmap,wt.fog,wt.lights,{emissive:{value:new Pt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:oe.meshphysical_vert,fragmentShader:oe.meshphysical_frag},toon:{uniforms:Rn([wt.common,wt.aomap,wt.lightmap,wt.emissivemap,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.gradientmap,wt.fog,wt.lights,{emissive:{value:new Pt(0)}}]),vertexShader:oe.meshtoon_vert,fragmentShader:oe.meshtoon_frag},matcap:{uniforms:Rn([wt.common,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.fog,{matcap:{value:null}}]),vertexShader:oe.meshmatcap_vert,fragmentShader:oe.meshmatcap_frag},points:{uniforms:Rn([wt.points,wt.fog]),vertexShader:oe.points_vert,fragmentShader:oe.points_frag},dashed:{uniforms:Rn([wt.common,wt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:oe.linedashed_vert,fragmentShader:oe.linedashed_frag},depth:{uniforms:Rn([wt.common,wt.displacementmap]),vertexShader:oe.depth_vert,fragmentShader:oe.depth_frag},normal:{uniforms:Rn([wt.common,wt.bumpmap,wt.normalmap,wt.displacementmap,{opacity:{value:1}}]),vertexShader:oe.meshnormal_vert,fragmentShader:oe.meshnormal_frag},sprite:{uniforms:Rn([wt.sprite,wt.fog]),vertexShader:oe.sprite_vert,fragmentShader:oe.sprite_frag},background:{uniforms:{uvTransform:{value:new jt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:oe.background_vert,fragmentShader:oe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new jt}},vertexShader:oe.backgroundCube_vert,fragmentShader:oe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:oe.cube_vert,fragmentShader:oe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:oe.equirect_vert,fragmentShader:oe.equirect_frag},distance:{uniforms:Rn([wt.common,wt.displacementmap,{referencePosition:{value:new T},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:oe.distance_vert,fragmentShader:oe.distance_frag},shadow:{uniforms:Rn([wt.lights,wt.fog,{color:{value:new Pt(0)},opacity:{value:1}}]),vertexShader:oe.shadow_vert,fragmentShader:oe.shadow_frag}};Ui.physical={uniforms:Rn([Ui.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new jt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new jt},clearcoatNormalScale:{value:new at(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new jt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new jt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new jt},sheen:{value:0},sheenColor:{value:new Pt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new jt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new jt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new jt},transmissionSamplerSize:{value:new at},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new jt},attenuationDistance:{value:0},attenuationColor:{value:new Pt(0)},specularColor:{value:new Pt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new jt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new jt},anisotropyVector:{value:new at},anisotropyMap:{value:null},anisotropyMapTransform:{value:new jt}}]),vertexShader:oe.meshphysical_vert,fragmentShader:oe.meshphysical_frag};var bc={r:0,b:0,g:0},y_=new we,ip=new jt;ip.set(-1,0,0,0,1,0,0,0,1);function M_(s,t,e,n,i,r){let a=new Pt(0),o=i===!0?0:1,l,c,h=null,u=0,d=null;function f(x){let b=x.isScene===!0?x.background:null;if(b&&b.isTexture){let v=x.backgroundBlurriness>0;b=t.get(b,v)}return b}function g(x){let b=!1,v=f(x);v===null?p(a,o):v&&v.isColor&&(p(v,1),b=!0);let S=s.xr.getEnvironmentBlendMode();S==="additive"?e.buffers.color.setClear(0,0,0,1,r):S==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(s.autoClear||b)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function _(x,b){let v=f(b);v&&(v.isCubeTexture||v.mapping===Ka)?(c===void 0&&(c=new gt(new Ne(1,1,1),new Ue({name:"BackgroundCubeMaterial",uniforms:qs(Ui.backgroundCube.uniforms),vertexShader:Ui.backgroundCube.vertexShader,fragmentShader:Ui.backgroundCube.fragmentShader,side:yn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(S,w,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=v,c.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(y_.makeRotationFromEuler(b.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(ip),c.material.toneMapped=ce.getTransfer(v.colorSpace)!==ge,(h!==v||u!==v.version||d!==s.toneMapping)&&(c.material.needsUpdate=!0,h=v,u=v.version,d=s.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)):v&&v.isTexture&&(l===void 0&&(l=new gt(new gn(2,2),new Ue({name:"BackgroundMaterial",uniforms:qs(Ui.background.uniforms),vertexShader:Ui.background.vertexShader,fragmentShader:Ui.background.fragmentShader,side:_s,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=v,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.toneMapped=ce.getTransfer(v.colorSpace)!==ge,v.matrixAutoUpdate===!0&&v.updateMatrix(),l.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||u!==v.version||d!==s.toneMapping)&&(l.material.needsUpdate=!0,h=v,u=v.version,d=s.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function p(x,b){x.getRGB(bc,iu(s)),e.buffers.color.setClear(bc.r,bc.g,bc.b,b,r)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(x,b=1){a.set(x),o=b,p(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(x){o=x,p(a,o)},render:g,addToRenderList:_,dispose:m}}function b_(s,t){let e=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=d(null),r=i,a=!1;function o(L,F,k,N,z){let J=!1,Y=u(L,N,k,F);r!==Y&&(r=Y,c(r.object)),J=f(L,N,k,z),J&&g(L,N,k,z),z!==null&&t.update(z,s.ELEMENT_ARRAY_BUFFER),(J||a)&&(a=!1,v(L,F,k,N),z!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(z).buffer))}function l(){return s.createVertexArray()}function c(L){return s.bindVertexArray(L)}function h(L){return s.deleteVertexArray(L)}function u(L,F,k,N){let z=N.wireframe===!0,J=n[F.id];J===void 0&&(J={},n[F.id]=J);let Y=L.isInstancedMesh===!0?L.id:0,rt=J[Y];rt===void 0&&(rt={},J[Y]=rt);let Z=rt[k.id];Z===void 0&&(Z={},rt[k.id]=Z);let tt=Z[z];return tt===void 0&&(tt=d(l()),Z[z]=tt),tt}function d(L){let F=[],k=[],N=[];for(let z=0;z<e;z++)F[z]=0,k[z]=0,N[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:k,attributeDivisors:N,object:L,attributes:{},index:null}}function f(L,F,k,N){let z=r.attributes,J=F.attributes,Y=0,rt=k.getAttributes();for(let Z in rt)if(rt[Z].location>=0){let it=z[Z],It=J[Z];if(It===void 0&&(Z==="instanceMatrix"&&L.instanceMatrix&&(It=L.instanceMatrix),Z==="instanceColor"&&L.instanceColor&&(It=L.instanceColor)),it===void 0||it.attribute!==It||It&&it.data!==It.data)return!0;Y++}return r.attributesNum!==Y||r.index!==N}function g(L,F,k,N){let z={},J=F.attributes,Y=0,rt=k.getAttributes();for(let Z in rt)if(rt[Z].location>=0){let it=J[Z];it===void 0&&(Z==="instanceMatrix"&&L.instanceMatrix&&(it=L.instanceMatrix),Z==="instanceColor"&&L.instanceColor&&(it=L.instanceColor));let It={};It.attribute=it,it&&it.data&&(It.data=it.data),z[Z]=It,Y++}r.attributes=z,r.attributesNum=Y,r.index=N}function _(){let L=r.newAttributes;for(let F=0,k=L.length;F<k;F++)L[F]=0}function p(L){m(L,0)}function m(L,F){let k=r.newAttributes,N=r.enabledAttributes,z=r.attributeDivisors;k[L]=1,N[L]===0&&(s.enableVertexAttribArray(L),N[L]=1),z[L]!==F&&(s.vertexAttribDivisor(L,F),z[L]=F)}function x(){let L=r.newAttributes,F=r.enabledAttributes;for(let k=0,N=F.length;k<N;k++)F[k]!==L[k]&&(s.disableVertexAttribArray(k),F[k]=0)}function b(L,F,k,N,z,J,Y){Y===!0?s.vertexAttribIPointer(L,F,k,z,J):s.vertexAttribPointer(L,F,k,N,z,J)}function v(L,F,k,N){_();let z=N.attributes,J=k.getAttributes(),Y=F.defaultAttributeValues;for(let rt in J){let Z=J[rt];if(Z.location>=0){let tt=z[rt];if(tt===void 0&&(rt==="instanceMatrix"&&L.instanceMatrix&&(tt=L.instanceMatrix),rt==="instanceColor"&&L.instanceColor&&(tt=L.instanceColor)),tt!==void 0){let it=tt.normalized,It=tt.itemSize,Rt=t.get(tt);if(Rt===void 0)continue;let re=Rt.buffer,ee=Rt.type,ie=Rt.bytesPerElement,X=ee===s.INT||ee===s.UNSIGNED_INT||tt.gpuType===Fl;if(tt.isInterleavedBufferAttribute){let Q=tt.data,_t=Q.stride,Vt=tt.offset;if(Q.isInstancedInterleavedBuffer){for(let St=0;St<Z.locationSize;St++)m(Z.location+St,Q.meshPerAttribute);L.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let St=0;St<Z.locationSize;St++)p(Z.location+St);s.bindBuffer(s.ARRAY_BUFFER,re);for(let St=0;St<Z.locationSize;St++)b(Z.location+St,It/Z.locationSize,ee,it,_t*ie,(Vt+It/Z.locationSize*St)*ie,X)}else{if(tt.isInstancedBufferAttribute){for(let Q=0;Q<Z.locationSize;Q++)m(Z.location+Q,tt.meshPerAttribute);L.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=tt.meshPerAttribute*tt.count)}else for(let Q=0;Q<Z.locationSize;Q++)p(Z.location+Q);s.bindBuffer(s.ARRAY_BUFFER,re);for(let Q=0;Q<Z.locationSize;Q++)b(Z.location+Q,It/Z.locationSize,ee,it,It*ie,It/Z.locationSize*Q*ie,X)}}else if(Y!==void 0){let it=Y[rt];if(it!==void 0)switch(it.length){case 2:s.vertexAttrib2fv(Z.location,it);break;case 3:s.vertexAttrib3fv(Z.location,it);break;case 4:s.vertexAttrib4fv(Z.location,it);break;default:s.vertexAttrib1fv(Z.location,it)}}}}x()}function S(){A();for(let L in n){let F=n[L];for(let k in F){let N=F[k];for(let z in N){let J=N[z];for(let Y in J)h(J[Y].object),delete J[Y];delete N[z]}}delete n[L]}}function w(L){if(n[L.id]===void 0)return;let F=n[L.id];for(let k in F){let N=F[k];for(let z in N){let J=N[z];for(let Y in J)h(J[Y].object),delete J[Y];delete N[z]}}delete n[L.id]}function R(L){for(let F in n){let k=n[F];for(let N in k){let z=k[N];if(z[L.id]===void 0)continue;let J=z[L.id];for(let Y in J)h(J[Y].object),delete J[Y];delete z[L.id]}}}function y(L){for(let F in n){let k=n[F],N=L.isInstancedMesh===!0?L.id:0,z=k[N];if(z!==void 0){for(let J in z){let Y=z[J];for(let rt in Y)h(Y[rt].object),delete Y[rt];delete z[J]}delete k[N],Object.keys(k).length===0&&delete n[F]}}}function A(){P(),a=!0,r!==i&&(r=i,c(r.object))}function P(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:A,resetDefaultState:P,dispose:S,releaseStatesOfGeometry:w,releaseStatesOfObject:y,releaseStatesOfProgram:R,initAttributes:_,enableAttribute:p,disableUnusedAttributes:x}}function S_(s,t,e){let n;function i(l){n=l}function r(l,c){s.drawArrays(n,l,c),e.update(c,n,1)}function a(l,c,h){h!==0&&(s.drawArraysInstanced(n,l,c,h),e.update(c,n,h))}function o(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];e.update(d,n,1)}this.setMode=i,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function E_(s,t,e,n){let i;function r(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){let R=t.get("EXT_texture_filter_anisotropic");i=s.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(R){return!(R!==si&&n.convert(R)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){let y=R===cn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==zn&&R!==ii&&!y&&n.convert(R)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(R){if(R==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Jt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&d===!1&&Jt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),p=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),x=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),b=s.getParameter(s.MAX_VARYING_VECTORS),v=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),S=s.getParameter(s.MAX_SAMPLES),w=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:x,maxVaryings:b,maxFragmentUniforms:v,maxSamples:S,samples:w}}function w_(s){let t=this,e=null,n=0,i=!1,r=!1,a=new di,o=new jt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){let g=u.clippingPlanes,_=u.clipIntersection,p=u.clipShadows,m=s.get(u);if(!i||g===null||g.length===0||r&&!p)r?h(null):c();else{let x=r?0:n,b=x*4,v=m.clippingState||null;l.value=v,v=h(g,d,b,f);for(let S=0;S!==b;++S)v[S]=e[S];m.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,d,f,g){let _=u!==null?u.length:0,p=null;if(_!==0){if(p=l.value,g!==!0||p===null){let m=f+_*4,x=d.matrixWorldInverse;o.getNormalMatrix(x),(p===null||p.length<m)&&(p=new Float32Array(m));for(let b=0,v=f;b!==_;++b,v+=4)a.copy(u[b]).applyMatrix4(x,o),a.normal.toArray(p,v),p[v+3]=a.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,p}}var Ir=4,T_=6,A_=20,R_=256,so=new xs,Uf=new Pt,du=null,fu=0,pu=0,mu=!1,C_=new T,Ys=new T,Dr=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,i=100,r={}){let{size:a=256,position:o=C_}=r;du=this._renderer.getRenderTarget(),fu=this._renderer.getActiveCubeFace(),pu=this._renderer.getActiveMipmapLevel(),mu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,i,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Of(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Bf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(du,fu,pu),this._renderer.xr.enabled=mu,t.scissorTest=!1,Pr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===vs||t.mapping===Ws?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),du=this._renderer.getRenderTarget(),fu=this._renderer.getActiveCubeFace(),pu=this._renderer.getActiveMipmapLevel(),mu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:vn,minFilter:vn,generateMipmaps:!1,type:cn,format:si,colorSpace:fa,depthBuffer:!1},i=Ff(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ff(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=P_(r)),this._blurMaterial=L_(r,t,e),this._ggxMaterial=I_(r,t,e)}return i}_compileMaterial(t){let e=new gt(new Re,t);this._renderer.compile(e,so)}_sceneToCubeUV(t,e,n,i,r){let l=new on(90,1,e,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(Uf),u.toneMapping=pi,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(i),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new gt(new Ne,new _e({name:"PMREM.Background",side:yn,depthWrite:!1,depthTest:!1})));let _=this._backgroundBox,p=_.material,m=!1,x=t.background;x?x.isColor&&(p.color.copy(x),t.background=null,m=!0):(p.color.copy(Uf),m=!0);for(let b=0;b<6;b++){let v=b%3;v===0?(l.up.set(0,c[b],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[b],r.y,r.z)):v===1?(l.up.set(0,0,c[b]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[b],r.z)):(l.up.set(0,c[b],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[b]));let S=this._cubeSize;Pr(i,v*S,b>2?S:0,S,S),u.setRenderTarget(i),m&&u.render(_,l),u.render(t,l)}u.toneMapping=f,u.autoClear=d,t.background=x}_textureToCubeUV(t,e){let n=this._renderer,i=t.mapping===vs||t.mapping===Ws;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Of()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Bf());let r=i?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;Pr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,so)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let i=this._lodMeshes.length;for(let r=1;r<i;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let i=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=c*1.25,f=u*d,{_lodMax:g}=this,_=this._sizeLods[n],p=3*_*(n>g-Ir?n-g+Ir:0),m=4*(this._cubeSize-_);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=g-e,Pr(r,p,m,3*_,2*_),i.setRenderTarget(r),i.render(o,so),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,Pr(t,p,m,3*_,2*_),i.setRenderTarget(t),i.render(o,so)}_blur(t,e,n,i){let r=this._pingPongRenderTarget,a=Math.min(i,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,a),this._blurPass(r,t,n,n,a)}_blurPass(t,e,n,i,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[i];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let h=this._sizeLods[i],u=3*h*(i>this._lodMax-Ir?i-this._lodMax+Ir:0),d=4*(this._cubeSize-h);Pr(e,u,d,3*h,2*h),a.setRenderTarget(e),a.render(l,so)}};function P_(s){let t=[],e=[],n=s,i=s-Ir+1+T_;for(let r=0;r<i;r++){let a=Math.pow(2,n);t.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,f=3,g=new Float32Array(f*d*u),_=new Float32Array(f*d*u);for(let m=0;m<u;m++){let x=m%3*2/3-1,b=m>2?0:-1,v=[x,b,0,x+2/3,b,0,x+2/3,b+1,0,x,b,0,x+2/3,b+1,0,x,b+1,0];g.set(v,f*d*m);for(let S=0;S<d;S++){let w=h[S*2]*2-1,R=h[S*2+1]*2-1;m===0?Ys.set(1,R,w):m===1?Ys.set(-w,1,-R):m===2?Ys.set(-w,R,1):m===3?Ys.set(-1,R,-w):m===4?Ys.set(-w,-1,R):Ys.set(w,R,-1),Ys.toArray(_,(m*d+S)*f)}}let p=new Re;p.setAttribute("position",new qe(g,f)),p.setAttribute("outputDirection",new qe(_,f)),e.push(new gt(p,null)),n>Ir&&n--}return{lodMeshes:e,sizeLods:t}}function Ff(s,t,e){let n=new $e(s,t,e);return n.texture.mapping=Ka,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Pr(s,t,e,n,i){s.viewport.set(t,e,n,i),s.scissor.set(t,e,n,i)}function I_(s,t,e){return new Ue({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:R_,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Tc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:ni,depthTest:!1,depthWrite:!1})}function L_(s,t,e){return new Ue({name:"SphericalGaussianBlur",defines:{SAMPLES:A_,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Tc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:ni,depthTest:!1,depthWrite:!1})}function Bf(){return new Ue({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Tc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ni,depthTest:!1,depthWrite:!1})}function Of(){return new Ue({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Tc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ni,depthTest:!1,depthWrite:!1})}function Tc(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Ec=class extends $e{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new ba(i),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Ne(5,5,5),r=new Ue({name:"CubemapFromEquirect",uniforms:qs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:yn,blending:ni});r.uniforms.tEquirect.value=e;let a=new gt(i,r),o=e.minFilter;return e.minFilter===ys&&(e.minFilter=vn),new Pl(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,i=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,i);t.setRenderTarget(r)}};function D_(s){let t=new WeakMap,e=new WeakMap,n=null;function i(d,f=!1){return d==null?null:f?a(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===Dl||f===Nl)if(t.has(d)){let g=t.get(d).texture;return o(g,d.mapping)}else{let g=d.image;if(g&&g.height>0){let _=new Ec(g.height);return _.fromEquirectangularTexture(s,d),t.set(d,_),d.addEventListener("dispose",c),o(_.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture){let f=d.mapping,g=f===Dl||f===Nl,_=f===vs||f===Ws;if(g||_){let p=e.get(d),m=p!==void 0?p.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==m)return n===null&&(n=new Dr(s)),p=g?n.fromEquirectangular(d,p):n.fromCubemap(d,p),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),p.texture;if(p!==void 0)return p.texture;{let x=d.image;return g&&x&&x.height>0||_&&x&&l(x)?(n===null&&(n=new Dr(s)),p=g?n.fromEquirectangular(d):n.fromCubemap(d),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),d.addEventListener("dispose",h),p.texture):null}}}return d}function o(d,f){return f===Dl?d.mapping=vs:f===Nl&&(d.mapping=Ws),d}function l(d){let f=0,g=6;for(let _=0;_<g;_++)d[_]!==void 0&&f++;return f===g}function c(d){let f=d.target;f.removeEventListener("dispose",c);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function u(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:u}}function N_(s){let t={};function e(n){if(t[n]!==void 0)return t[n];let i=s.getExtension(n);return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let i=e(n);return i===null&&Fs("WebGLRenderer: "+n+" extension not supported."),i}}}function U_(s,t,e,n){let i={},r=new WeakMap;function a(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let g in d.attributes)t.remove(d.attributes[g]);d.removeEventListener("dispose",a),delete i[d.id];let f=r.get(d);f&&(t.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function o(u,d){return i[d.id]===!0||(d.addEventListener("dispose",a),i[d.id]=!0,e.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)t.update(d[f],s.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,g=u.attributes.position,_=0;if(g===void 0)return;if(f!==null){let x=f.array;_=f.version;for(let b=0,v=x.length;b<v;b+=3){let S=x[b+0],w=x[b+1],R=x[b+2];d.push(S,w,w,R,R,S)}}else{let x=g.array;_=g.version;for(let b=0,v=x.length/3-1;b<v;b+=3){let S=b+0,w=b+1,R=b+2;d.push(S,w,w,R,R,S)}}let p=new(g.count>=65535?ya:va)(d,1);p.version=_;let m=r.get(u);m&&t.remove(m),r.set(u,p)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function F_(s,t,e){let n;function i(u){n=u}let r,a;function o(u){r=u.type,a=u.bytesPerElement}function l(u,d){s.drawElements(n,d,r,u*a),e.update(d,n,1)}function c(u,d,f){f!==0&&(s.drawElementsInstanced(n,d,r,u*a,f),e.update(d,n,f))}function h(u,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,u,0,f);let _=0;for(let p=0;p<f;p++)_+=d[p];e.update(_,n,1)}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function B_(s){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case s.TRIANGLES:e.triangles+=o*(r/3);break;case s.LINES:e.lines+=o*(r/2);break;case s.LINE_STRIP:e.lines+=o*(r-1);break;case s.LINE_LOOP:e.lines+=o*r;break;case s.POINTS:e.points+=o*r;break;default:Kt("WebGLInfo: Unknown draw mode:",a);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function O_(s,t,e){let n=new WeakMap,i=new Ve;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(o);if(d===void 0||d.count!==u){let A=function(){R.dispose(),n.delete(o),o.removeEventListener("dispose",A)};d!==void 0&&d.texture.dispose();let f=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],m=o.morphAttributes.normal||[],x=o.morphAttributes.color||[],b=0;f===!0&&(b=1),g===!0&&(b=2),_===!0&&(b=3);let v=o.attributes.position.count*b,S=1;v>t.maxTextureSize&&(S=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);let w=new Float32Array(v*S*4*u),R=new ga(w,v,S,u);R.type=ii,R.needsUpdate=!0;let y=b*4;for(let P=0;P<u;P++){let L=p[P],F=m[P],k=x[P],N=v*S*4*P;for(let z=0;z<L.count;z++){let J=z*y;f===!0&&(i.fromBufferAttribute(L,z),w[N+J+0]=i.x,w[N+J+1]=i.y,w[N+J+2]=i.z,w[N+J+3]=0),g===!0&&(i.fromBufferAttribute(F,z),w[N+J+4]=i.x,w[N+J+5]=i.y,w[N+J+6]=i.z,w[N+J+7]=0),_===!0&&(i.fromBufferAttribute(k,z),w[N+J+8]=i.x,w[N+J+9]=i.y,w[N+J+10]=i.z,w[N+J+11]=k.itemSize===4?i.w:1)}}d={count:u,texture:R,size:new at(v,S)},n.set(o,d),o.addEventListener("dispose",A)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,e);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];let g=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(s,"morphTargetBaseInfluence",g),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function z_(s,t,e,n,i){let r=new WeakMap;function a(c){let h=i.render.frame,u=c.geometry,d=t.get(c,u);if(r.get(d)!==h&&(t.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:a,dispose:o}}var H_={[Wa]:"LINEAR_TONE_MAPPING",[Xa]:"REINHARD_TONE_MAPPING",[qa]:"CINEON_TONE_MAPPING",[Gs]:"ACES_FILMIC_TONE_MAPPING",[Za]:"AGX_TONE_MAPPING",[Ja]:"NEUTRAL_TONE_MAPPING",[Ya]:"CUSTOM_TONE_MAPPING"};function k_(s,t,e,n,i,r){let a=new $e(t,e,{type:s,depthBuffer:i,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Re;c.setAttribute("position",new se([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new se([0,2,0,0,2,0],2));let h=new wr({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new gt(c,h),d=new xs(-1,1,1,-1,0,1),f=null,g=null,_=!1,p,m=null,x=[],b=!1;this.setSize=function(v,S){a.setSize(v,S),o!==null&&o.setSize(v,S),l!==null&&l.setSize(v,S);for(let w=0;w<x.length;w++){let R=x[w];R.setSize&&R.setSize(v,S)}},this.setEffects=function(v){x=v,b=x.length>0&&x[0].isRenderPass===!0;let S=a.width,w=a.height;x.length>0&&o===null&&(o=new $e(S,w,{type:cn,depthBuffer:!1,stencilBuffer:!1}),l=new $e(S,w,{type:cn,depthBuffer:!1,stencilBuffer:!1}));for(let R=0;R<x.length;R++){let y=x[R];y.setSize&&y.setSize(S,w)}},this.begin=function(v,S){if(_||v.toneMapping===pi&&x.length===0)return!1;if(m=S,S!==null){let w=S.width,R=S.height;(a.width!==w||a.height!==R)&&this.setSize(w,R)}return b===!1&&v.setRenderTarget(a),p=v.toneMapping,v.toneMapping=pi,!0},this.hasRenderPass=function(){return b},this.end=function(v,S){v.toneMapping=p,_=!0;let w=a,R=o;for(let y=0;y<x.length;y++){let A=x[y];A.enabled!==!1&&(A.render(v,R,w,S),A.needsSwap!==!1&&(w=R,R=R===o?l:o))}if(f!==v.outputColorSpace||g!==v.toneMapping){f=v.outputColorSpace,g=v.toneMapping,h.defines={},ce.getTransfer(f)===ge&&(h.defines.SRGB_TRANSFER="");let y=H_[g];y&&(h.defines[y]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=w.texture,v.setRenderTarget(m),v.render(u,d),m=null,_=!1},this.isCompositing=function(){return _},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var sp=new Dn,_u=new fs(1,1),rp=new ga,ap=new ll,op=new ba,zf=[],Hf=[],kf=new Float32Array(16),Vf=new Float32Array(9),Gf=new Float32Array(4);function Nr(s,t,e){let n=s[0];if(n<=0||n>0)return s;let i=t*e,r=zf[i];if(r===void 0&&(r=new Float32Array(i),zf[i]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,s[a].toArray(r,o)}return r}function hn(s,t){if(s.length!==t.length)return!1;for(let e=0,n=s.length;e<n;e++)if(s[e]!==t[e])return!1;return!0}function un(s,t){for(let e=0,n=t.length;e<n;e++)s[e]=t[e]}function Ac(s,t){let e=Hf[t];e===void 0&&(e=new Int32Array(t),Hf[t]=e);for(let n=0;n!==t;++n)e[n]=s.allocateTextureUnit();return e}function V_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function G_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(hn(e,t))return;s.uniform2fv(this.addr,t),un(e,t)}}function W_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(hn(e,t))return;s.uniform3fv(this.addr,t),un(e,t)}}function X_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(hn(e,t))return;s.uniform4fv(this.addr,t),un(e,t)}}function q_(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(hn(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),un(e,t)}else{if(hn(e,n))return;Gf.set(n),s.uniformMatrix2fv(this.addr,!1,Gf),un(e,n)}}function Y_(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(hn(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),un(e,t)}else{if(hn(e,n))return;Vf.set(n),s.uniformMatrix3fv(this.addr,!1,Vf),un(e,n)}}function Z_(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(hn(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),un(e,t)}else{if(hn(e,n))return;kf.set(n),s.uniformMatrix4fv(this.addr,!1,kf),un(e,n)}}function J_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function K_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(hn(e,t))return;s.uniform2iv(this.addr,t),un(e,t)}}function $_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(hn(e,t))return;s.uniform3iv(this.addr,t),un(e,t)}}function j_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(hn(e,t))return;s.uniform4iv(this.addr,t),un(e,t)}}function Q_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function tv(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(hn(e,t))return;s.uniform2uiv(this.addr,t),un(e,t)}}function ev(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(hn(e,t))return;s.uniform3uiv(this.addr,t),un(e,t)}}function nv(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(hn(e,t))return;s.uniform4uiv(this.addr,t),un(e,t)}}function iv(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(_u.compareFunction=e.isReversedDepthBuffer()?Mc:yc,r=_u):r=sp,e.setTexture2D(t||r,i)}function sv(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||ap,i)}function rv(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||op,i)}function av(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||rp,i)}function ov(s){switch(s){case 5126:return V_;case 35664:return G_;case 35665:return W_;case 35666:return X_;case 35674:return q_;case 35675:return Y_;case 35676:return Z_;case 5124:case 35670:return J_;case 35667:case 35671:return K_;case 35668:case 35672:return $_;case 35669:case 35673:return j_;case 5125:return Q_;case 36294:return tv;case 36295:return ev;case 36296:return nv;case 35678:case 36198:case 36298:case 36306:case 35682:return iv;case 35679:case 36299:case 36307:return sv;case 35680:case 36300:case 36308:case 36293:return rv;case 36289:case 36303:case 36311:case 36292:return av}}function lv(s,t){s.uniform1fv(this.addr,t)}function cv(s,t){let e=Nr(t,this.size,2);s.uniform2fv(this.addr,e)}function hv(s,t){let e=Nr(t,this.size,3);s.uniform3fv(this.addr,e)}function uv(s,t){let e=Nr(t,this.size,4);s.uniform4fv(this.addr,e)}function dv(s,t){let e=Nr(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function fv(s,t){let e=Nr(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function pv(s,t){let e=Nr(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function mv(s,t){s.uniform1iv(this.addr,t)}function gv(s,t){s.uniform2iv(this.addr,t)}function xv(s,t){s.uniform3iv(this.addr,t)}function _v(s,t){s.uniform4iv(this.addr,t)}function vv(s,t){s.uniform1uiv(this.addr,t)}function yv(s,t){s.uniform2uiv(this.addr,t)}function Mv(s,t){s.uniform3uiv(this.addr,t)}function bv(s,t){s.uniform4uiv(this.addr,t)}function Sv(s,t,e){let n=this.cache,i=t.length,r=Ac(e,i);hn(n,r)||(s.uniform1iv(this.addr,r),un(n,r));let a;this.type===s.SAMPLER_2D_SHADOW?a=_u:a=sp;for(let o=0;o!==i;++o)e.setTexture2D(t[o]||a,r[o])}function Ev(s,t,e){let n=this.cache,i=t.length,r=Ac(e,i);hn(n,r)||(s.uniform1iv(this.addr,r),un(n,r));for(let a=0;a!==i;++a)e.setTexture3D(t[a]||ap,r[a])}function wv(s,t,e){let n=this.cache,i=t.length,r=Ac(e,i);hn(n,r)||(s.uniform1iv(this.addr,r),un(n,r));for(let a=0;a!==i;++a)e.setTextureCube(t[a]||op,r[a])}function Tv(s,t,e){let n=this.cache,i=t.length,r=Ac(e,i);hn(n,r)||(s.uniform1iv(this.addr,r),un(n,r));for(let a=0;a!==i;++a)e.setTexture2DArray(t[a]||rp,r[a])}function Av(s){switch(s){case 5126:return lv;case 35664:return cv;case 35665:return hv;case 35666:return uv;case 35674:return dv;case 35675:return fv;case 35676:return pv;case 5124:case 35670:return mv;case 35667:case 35671:return gv;case 35668:case 35672:return xv;case 35669:case 35673:return _v;case 5125:return vv;case 36294:return yv;case 36295:return Mv;case 36296:return bv;case 35678:case 36198:case 36298:case 36306:case 35682:return Sv;case 35679:case 36299:case 36307:return Ev;case 35680:case 36300:case 36308:case 36293:return wv;case 36289:case 36303:case 36311:case 36292:return Tv}}var vu=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=ov(e.type)}},yu=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Av(e.type)}},Mu=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let i=this.seq;for(let r=0,a=i.length;r!==a;++r){let o=i[r];o.setValue(t,e[o.id],n)}}},gu=/(\w+)(\])?(\[|\.)?/g;function Wf(s,t){s.seq.push(t),s.map[t.id]=t}function Rv(s,t,e){let n=s.name,i=n.length;for(gu.lastIndex=0;;){let r=gu.exec(n),a=gu.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){Wf(e,c===void 0?new vu(o,s,t):new yu(o,s,t));break}else{let u=e.map[o];u===void 0&&(u=new Mu(o),Wf(e,u)),e=u}}}var Lr=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);Rv(o,l,this)}let i=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?i.push(a):r.push(a);i.length>0&&(this.seq=i.concat(r))}setValue(t,e,n,i){let r=this.map[e];r!==void 0&&r.setValue(t,n,i)}setOptional(t,e,n){let i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,i)}}static seqWithValue(t,e){let n=[];for(let i=0,r=t.length;i!==r;++i){let a=t[i];a.id in e&&n.push(a)}return n}};function Xf(s,t,e){let n=s.createShader(t);return s.shaderSource(n,e),s.compileShader(n),n}var Cv=37297,Pv=0;function Iv(s,t){let e=s.split(`
`),n=[],i=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=i;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var qf=new jt;function Lv(s){ce._getMatrix(qf,ce.workingColorSpace,s);let t=`mat3( ${qf.elements.map(e=>e.toFixed(4))} )`;switch(ce.getTransfer(s)){case pa:return[t,"LinearTransferOETF"];case ge:return[t,"sRGBTransferOETF"];default:return Jt("WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function Yf(s,t,e){let n=s.getShaderParameter(t,s.COMPILE_STATUS),r=(s.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+Iv(s.getShaderSource(t),o)}else return r}function Dv(s,t){let e=Lv(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var Nv={[Wa]:"Linear",[Xa]:"Reinhard",[qa]:"Cineon",[Gs]:"ACESFilmic",[Za]:"AgX",[Ja]:"Neutral",[Ya]:"Custom"};function Uv(s,t){let e=Nv[t];return e===void 0?(Jt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Sc=new T;function Fv(){ce.getLuminanceCoefficients(Sc);let s=Sc.x.toFixed(4),t=Sc.y.toFixed(4),e=Sc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Bv(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ao).join(`
`)}function Ov(s){let t=[];for(let e in s){let n=s[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function zv(s,t){let e={},n=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let r=s.getActiveAttrib(t,i),a=r.name,o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:s.getAttribLocation(t,a),locationSize:o}}return e}function ao(s){return s!==""}function Zf(s,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Jf(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Hv=/^[ \t]*#include +<([\w\d./]+)>/gm;function bu(s){return s.replace(Hv,Vv)}var kv=new Map;function Vv(s,t){let e=oe[t];if(e===void 0){let n=kv.get(t);if(n!==void 0)e=oe[n],Jt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return bu(e)}var Gv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Kf(s){return s.replace(Gv,Wv)}function Wv(s,t,e,n){let i="";for(let r=parseInt(t);r<parseInt(e);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function $f(s){let t=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var Xv={[ks]:"SHADOWMAP_TYPE_PCF",[Ar]:"SHADOWMAP_TYPE_VSM"};function qv(s){return Xv[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Yv={[vs]:"ENVMAP_TYPE_CUBE",[Ws]:"ENVMAP_TYPE_CUBE",[Ka]:"ENVMAP_TYPE_CUBE_UV"};function Zv(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":Yv[s.envMapMode]||"ENVMAP_TYPE_CUBE"}var Jv={[Ws]:"ENVMAP_MODE_REFRACTION"};function Kv(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":Jv[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var $v={[Xh]:"ENVMAP_BLENDING_MULTIPLY",[uf]:"ENVMAP_BLENDING_MIX",[df]:"ENVMAP_BLENDING_ADD"};function jv(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":$v[s.combine]||"ENVMAP_BLENDING_NONE"}function Qv(s){let t=s.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function ty(s,t,e,n){let i=s.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=qv(e),c=Zv(e),h=Kv(e),u=jv(e),d=Qv(e),f=Bv(e),g=Ov(r),_=i.createProgram(),p,m,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(ao).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(ao).join(`
`),m.length>0&&(m+=`
`)):(p=[$f(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ao).join(`
`),m=[$f(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==pi?"#define TONE_MAPPING":"",e.toneMapping!==pi?oe.tonemapping_pars_fragment:"",e.toneMapping!==pi?Uv("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",oe.colorspace_pars_fragment,Dv("linearToOutputTexel",e.outputColorSpace),Fv(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(ao).join(`
`)),a=bu(a),a=Zf(a,e),a=Jf(a,e),o=bu(o),o=Zf(o,e),o=Jf(o,e),a=Kf(a),o=Kf(o),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===Qh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Qh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let b=x+p+a,v=x+m+o,S=Xf(i,i.VERTEX_SHADER,b),w=Xf(i,i.FRAGMENT_SHADER,v);i.attachShader(_,S),i.attachShader(_,w),e.index0AttributeName!==void 0?i.bindAttribLocation(_,0,e.index0AttributeName):e.hasPositionAttribute===!0&&i.bindAttribLocation(_,0,"position"),i.linkProgram(_);function R(L){if(s.debug.checkShaderErrors){let F=i.getProgramInfoLog(_)||"",k=i.getShaderInfoLog(S)||"",N=i.getShaderInfoLog(w)||"",z=F.trim(),J=k.trim(),Y=N.trim(),rt=!0,Z=!0;if(i.getProgramParameter(_,i.LINK_STATUS)===!1)if(rt=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,_,S,w);else{let tt=Yf(i,S,"vertex"),it=Yf(i,w,"fragment");Kt("WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(_,i.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+z+`
`+tt+`
`+it)}else z!==""?Jt("WebGLProgram: Program Info Log:",z):(J===""||Y==="")&&(Z=!1);Z&&(L.diagnostics={runnable:rt,programLog:z,vertexShader:{log:J,prefix:p},fragmentShader:{log:Y,prefix:m}})}i.deleteShader(S),i.deleteShader(w),y=new Lr(i,_),A=zv(i,_)}let y;this.getUniforms=function(){return y===void 0&&R(this),y};let A;this.getAttributes=function(){return A===void 0&&R(this),A};let P=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=i.getProgramParameter(_,Cv)),P},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Pv++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=S,this.fragmentShader=w,this}var ey=0,Su=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let i=this._getShaderCacheForMaterial(t);return i.has(e)===!1&&(i.add(e),e.usedTimes++),i.has(n)===!1&&(i.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Eu(t),e.set(t,n)),n}},Eu=class{constructor(t){this.id=ey++,this.code=t,this.usedTimes=0}};function ny(s){return s===bs||s===no||s===io}function iy(s,t,e,n,i,r){let a=new xa,o=new Su,l=new Set,c=[],h=new Map,u=n.logarithmicDepthBuffer,d=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(y){return l.add(y),y===0?"uv":`uv${y}`}function _(y,A,P,L,F,k){let N=L.fog,z=F.geometry,J=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?L.environment:null,Y=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap,rt=t.get(y.envMap||J,Y),Z=rt&&rt.mapping===Ka?rt.image.height:null,tt=f[y.type];y.precision!==null&&(d=n.getMaxPrecision(y.precision),d!==y.precision&&Jt("WebGLProgram.getParameters:",y.precision,"not supported, using",d,"instead."));let it=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,It=it!==void 0?it.length:0,Rt=0;z.morphAttributes.position!==void 0&&(Rt=1),z.morphAttributes.normal!==void 0&&(Rt=2),z.morphAttributes.color!==void 0&&(Rt=3);let re,ee,ie,X;if(tt){let ut=Ui[tt];re=ut.vertexShader,ee=ut.fragmentShader}else{re=y.vertexShader,ee=y.fragmentShader;let ut=o.getVertexShaderStage(y),mt=o.getFragmentShaderStage(y);o.update(y,ut,mt),ie=ut.id,X=mt.id}let Q=s.getRenderTarget(),_t=s.state.buffers.depth.getReversed(),Vt=F.isInstancedMesh===!0,St=F.isBatchedMesh===!0,Xt=!!y.map,he=!!y.matcap,st=!!rt,lt=!!y.aoMap,ct=!!y.lightMap,ht=!!y.bumpMap&&y.wireframe===!1,xt=!!y.normalMap,qt=!!y.displacementMap,Gt=!!y.emissiveMap,Zt=!!y.metalnessMap,$t=!!y.roughnessMap,D=y.anisotropy>0,fe=y.clearcoat>0,ne=y.dispersion>0,C=y.retroreflectivity>0,M=y.iridescence>0,O=y.sheen>0,W=y.transmission>0,$=D&&!!y.anisotropyMap,dt=fe&&!!y.clearcoatMap,ft=fe&&!!y.clearcoatNormalMap,j=fe&&!!y.clearcoatRoughnessMap,nt=M&&!!y.iridescenceMap,yt=M&&!!y.iridescenceThicknessMap,zt=O&&!!y.sheenColorMap,bt=O&&!!y.sheenRoughnessMap,Mt=!!y.specularMap,Ht=!!y.specularColorMap,Wt=!!y.specularIntensityMap,Qt=W&&!!y.transmissionMap,B=W&&!!y.thicknessMap,vt=!!y.gradientMap,et=!!y.alphaMap,pt=y.alphaTest>0,Et=!!y.alphaHash,I=!!y.extensions,H=pi;y.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(H=s.toneMapping);let K={shaderID:tt,shaderType:y.type,shaderName:y.name,vertexShader:re,fragmentShader:ee,defines:y.defines,customVertexShaderID:ie,customFragmentShaderID:X,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:d,batching:St,batchingColor:St&&F._colorsTexture!==null,instancing:Vt,instancingColor:Vt&&F.instanceColor!==null,instancingMorph:Vt&&F.morphTexture!==null,outputColorSpace:Q===null?s.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:ce.workingColorSpace,alphaToCoverage:!!y.alphaToCoverage,map:Xt,matcap:he,envMap:st,envMapMode:st&&rt.mapping,envMapCubeUVHeight:Z,aoMap:lt,lightMap:ct,bumpMap:ht,normalMap:xt,displacementMap:qt,emissiveMap:Gt,normalMapObjectSpace:xt&&y.normalMapType===mf,normalMapTangentSpace:xt&&y.normalMapType===vc,packedNormalMap:xt&&y.normalMapType===vc&&ny(y.normalMap.format),metalnessMap:Zt,roughnessMap:$t,anisotropy:D,anisotropyMap:$,clearcoat:fe,clearcoatMap:dt,clearcoatNormalMap:ft,clearcoatRoughnessMap:j,dispersion:ne,retroreflection:C,iridescence:M,iridescenceMap:nt,iridescenceThicknessMap:yt,sheen:O,sheenColorMap:zt,sheenRoughnessMap:bt,specularMap:Mt,specularColorMap:Ht,specularIntensityMap:Wt,transmission:W,transmissionMap:Qt,thicknessMap:B,gradientMap:vt,opaque:y.transparent===!1&&y.blending===Di&&y.alphaToCoverage===!1,alphaMap:et,alphaTest:pt,alphaHash:Et,combine:y.combine,mapUv:Xt&&g(y.map.channel),aoMapUv:lt&&g(y.aoMap.channel),lightMapUv:ct&&g(y.lightMap.channel),bumpMapUv:ht&&g(y.bumpMap.channel),normalMapUv:xt&&g(y.normalMap.channel),displacementMapUv:qt&&g(y.displacementMap.channel),emissiveMapUv:Gt&&g(y.emissiveMap.channel),metalnessMapUv:Zt&&g(y.metalnessMap.channel),roughnessMapUv:$t&&g(y.roughnessMap.channel),anisotropyMapUv:$&&g(y.anisotropyMap.channel),clearcoatMapUv:dt&&g(y.clearcoatMap.channel),clearcoatNormalMapUv:ft&&g(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:j&&g(y.clearcoatRoughnessMap.channel),iridescenceMapUv:nt&&g(y.iridescenceMap.channel),iridescenceThicknessMapUv:yt&&g(y.iridescenceThicknessMap.channel),sheenColorMapUv:zt&&g(y.sheenColorMap.channel),sheenRoughnessMapUv:bt&&g(y.sheenRoughnessMap.channel),specularMapUv:Mt&&g(y.specularMap.channel),specularColorMapUv:Ht&&g(y.specularColorMap.channel),specularIntensityMapUv:Wt&&g(y.specularIntensityMap.channel),transmissionMapUv:Qt&&g(y.transmissionMap.channel),thicknessMapUv:B&&g(y.thicknessMap.channel),alphaMapUv:et&&g(y.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(xt||D),vertexNormals:!!z.attributes.normal,vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!z.attributes.uv&&(Xt||et),fog:!!N,useFog:y.fog===!0,fogExp2:!!N&&N.isFogExp2,flatShading:y.wireframe===!1&&(y.flatShading===!0||z.attributes.normal===void 0&&xt===!1&&(y.isMeshLambertMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isMeshPhysicalMaterial)),sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:_t,skinning:F.isSkinnedMesh===!0,hasPositionAttribute:z.attributes.position!==void 0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:It,morphTextureStride:Rt,numSunLights:A.sun.length,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numSunLightShadows:A.sunShadowMap.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:k.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:y.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:H,decodeVideoTexture:Xt&&y.map.isVideoTexture===!0&&ce.getTransfer(y.map.colorSpace)===ge,decodeVideoTextureEmissive:Gt&&y.emissiveMap.isVideoTexture===!0&&ce.getTransfer(y.emissiveMap.colorSpace)===ge,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===ve,flipSided:y.side===yn,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:I&&y.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(I&&y.extensions.multiDraw===!0||St)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return K.vertexUv1s=l.has(1),K.vertexUv2s=l.has(2),K.vertexUv3s=l.has(3),l.clear(),K}function p(y){let A=[];if(y.shaderID?A.push(y.shaderID):(A.push(y.customVertexShaderID),A.push(y.customFragmentShaderID)),y.defines!==void 0)for(let P in y.defines)A.push(P),A.push(y.defines[P]);return y.isRawShaderMaterial===!1&&(m(A,y),x(A,y),A.push(s.outputColorSpace)),A.push(y.customProgramCacheKey),A.join()}function m(y,A){y.push(A.precision),y.push(A.outputColorSpace),y.push(A.envMapMode),y.push(A.envMapCubeUVHeight),y.push(A.mapUv),y.push(A.alphaMapUv),y.push(A.lightMapUv),y.push(A.aoMapUv),y.push(A.bumpMapUv),y.push(A.normalMapUv),y.push(A.displacementMapUv),y.push(A.emissiveMapUv),y.push(A.metalnessMapUv),y.push(A.roughnessMapUv),y.push(A.anisotropyMapUv),y.push(A.clearcoatMapUv),y.push(A.clearcoatNormalMapUv),y.push(A.clearcoatRoughnessMapUv),y.push(A.iridescenceMapUv),y.push(A.iridescenceThicknessMapUv),y.push(A.sheenColorMapUv),y.push(A.sheenRoughnessMapUv),y.push(A.specularMapUv),y.push(A.specularColorMapUv),y.push(A.specularIntensityMapUv),y.push(A.transmissionMapUv),y.push(A.thicknessMapUv),y.push(A.combine),y.push(A.fogExp2),y.push(A.sizeAttenuation),y.push(A.morphTargetsCount),y.push(A.morphAttributeCount),y.push(A.numSunLights),y.push(A.numDirLights),y.push(A.numPointLights),y.push(A.numSpotLights),y.push(A.numSpotLightMaps),y.push(A.numHemiLights),y.push(A.numRectAreaLights),y.push(A.numSunLightShadows),y.push(A.numDirLightShadows),y.push(A.numPointLightShadows),y.push(A.numSpotLightShadows),y.push(A.numSpotLightShadowsWithMaps),y.push(A.numLightProbes),y.push(A.shadowMapType),y.push(A.toneMapping),y.push(A.numClippingPlanes),y.push(A.numClipIntersection),y.push(A.depthPacking)}function x(y,A){a.disableAll(),A.instancing&&a.enable(0),A.instancingColor&&a.enable(1),A.instancingMorph&&a.enable(2),A.matcap&&a.enable(3),A.envMap&&a.enable(4),A.normalMapObjectSpace&&a.enable(5),A.normalMapTangentSpace&&a.enable(6),A.clearcoat&&a.enable(7),A.iridescence&&a.enable(8),A.alphaTest&&a.enable(9),A.vertexColors&&a.enable(10),A.vertexAlphas&&a.enable(11),A.vertexUv1s&&a.enable(12),A.vertexUv2s&&a.enable(13),A.vertexUv3s&&a.enable(14),A.vertexTangents&&a.enable(15),A.anisotropy&&a.enable(16),A.alphaHash&&a.enable(17),A.batching&&a.enable(18),A.dispersion&&a.enable(19),A.retroreflection&&a.enable(24),A.batchingColor&&a.enable(20),A.gradientMap&&a.enable(21),A.packedNormalMap&&a.enable(22),A.vertexNormals&&a.enable(23),y.push(a.mask),a.disableAll(),A.fog&&a.enable(0),A.useFog&&a.enable(1),A.flatShading&&a.enable(2),A.logarithmicDepthBuffer&&a.enable(3),A.reversedDepthBuffer&&a.enable(4),A.skinning&&a.enable(5),A.morphTargets&&a.enable(6),A.morphNormals&&a.enable(7),A.morphColors&&a.enable(8),A.premultipliedAlpha&&a.enable(9),A.shadowMapEnabled&&a.enable(10),A.doubleSided&&a.enable(11),A.flipSided&&a.enable(12),A.useDepthPacking&&a.enable(13),A.dithering&&a.enable(14),A.transmission&&a.enable(15),A.sheen&&a.enable(16),A.opaque&&a.enable(17),A.pointsUvs&&a.enable(18),A.decodeVideoTexture&&a.enable(19),A.decodeVideoTextureEmissive&&a.enable(20),A.alphaToCoverage&&a.enable(21),A.numLightProbeGrids>0&&a.enable(22),A.hasPositionAttribute&&a.enable(23),y.push(a.mask)}function b(y){let A=f[y.type],P;if(A){let L=Ui[A];P=$i.clone(L.uniforms)}else P=y.uniforms;return P}function v(y,A){let P=h.get(A);return P!==void 0?++P.usedTimes:(P=new ty(s,A,y,i),c.push(P),h.set(A,P)),P}function S(y){if(--y.usedTimes===0){let A=c.indexOf(y);c[A]=c[c.length-1],c.pop(),h.delete(y.cacheKey),y.destroy()}}function w(y){o.remove(y)}function R(){o.dispose()}return{getParameters:_,getProgramCacheKey:p,getUniforms:b,acquireProgram:v,releaseProgram:S,releaseShaderCache:w,programs:c,dispose:R}}function sy(){let s=new WeakMap;function t(a){return s.has(a)}function e(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function n(a){s.delete(a)}function i(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:r}}function ry(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.materialVariant!==t.materialVariant?s.materialVariant-t.materialVariant:s.z!==t.z?s.z-t.z:s.id-t.id}function jf(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function Qf(){let s=[],t=0,e=[],n=[],i=[];function r(){t=0,e.length=0,n.length=0,i.length=0}function a(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function o(d,f,g,_,p,m){let x=s[t];return x===void 0?(x={id:d.id,object:d,geometry:f,material:g,materialVariant:a(d),groupOrder:_,renderOrder:d.renderOrder,z:p,group:m},s[t]=x):(x.id=d.id,x.object=d,x.geometry=f,x.material=g,x.materialVariant=a(d),x.groupOrder=_,x.renderOrder=d.renderOrder,x.z=p,x.group=m),t++,x}function l(d,f,g,_,p,m,x){x.reversedDepth===!0&&(p=-p);let b=o(d,f,g,_,p,m);g.transmission>0?n.push(b):g.transparent===!0?i.push(b):e.push(b)}function c(d,f,g,_,p,m){let x=o(d,f,g,_,p,m);g.transmission>0?n.unshift(x):g.transparent===!0?i.unshift(x):e.unshift(x)}function h(d,f){e.length>1&&e.sort(d||ry),n.length>1&&n.sort(f||jf),i.length>1&&i.sort(f||jf)}function u(){for(let d=t,f=s.length;d<f;d++){let g=s[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:n,transparent:i,init:r,push:l,unshift:c,finish:u,sort:h}}function ay(){let s=new WeakMap;function t(n,i){let r=s.get(n),a;return r===void 0?(a=new Qf,s.set(n,[a])):i>=r.length?(a=new Qf,r.push(a)):a=r[i],a}function e(){s=new WeakMap}return{get:t,dispose:e}}function oy(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new T,color:new Pt};break;case"SpotLight":e={position:new T,direction:new T,color:new Pt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new T,color:new Pt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new T,skyColor:new Pt,groundColor:new Pt};break;case"RectAreaLight":e={color:new Pt,position:new T,halfWidth:new T,halfHeight:new T};break}return s[t.id]=e,e}}}function ly(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}var cy=0;function hy(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function uy(s){let t=new oy,e=ly(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new T);let i=new T,r=new we,a=new we;function o(c){let h=0,u=0,d=0;for(let F=0;F<9;F++)n.probe[F].set(0,0,0);let f=0,g=0,_=0,p=0,m=0,x=0,b=0,v=0,S=0,w=0,R=0,y=0,A=0,P=0;c.sort(hy);for(let F=0,k=c.length;F<k;F++){let N=c[F],z=N.color,J=N.intensity,Y=N.distance,rt=null;if(N.shadow&&N.shadow.map&&(N.shadow.map.texture.format===bs?rt=N.shadow.map.texture:rt=N.shadow.map.depthTexture||N.shadow.map.texture),N.isAmbientLight)h+=z.r*J,u+=z.g*J,d+=z.b*J;else if(N.isLightProbe){for(let Z=0;Z<9;Z++)n.probe[Z].addScaledVector(N.sh.coefficients[Z],J);P++}else if(N.isSunLight){let Z=t.get(N);if(Z.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){let tt=N.shadow,it=e.get(N);it.shadowIntensity=tt.intensity,it.shadowBias=tt.bias,it.shadowNormalBias=tt.normalBias,it.shadowRadius=tt.radius,it.shadowMapSize.copy(tt.mapSize).multiply(tt.getFrameExtents()),n.sunShadow[g]=it,n.sunShadowMap[g]=rt;let It=tt.getViewportCount();for(let Rt=0;Rt<It;Rt++)n.sunShadowMatrix[_+Rt]=tt.getMatrix(Rt),n.sunShadowCascade[_+Rt]=tt._cascadeData[Rt];_+=It,g++}n.sun[f]=Z,f++}else if(N.isDirectionalLight){let Z=t.get(N);if(Z.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){let tt=N.shadow,it=e.get(N);it.shadowIntensity=tt.intensity,it.shadowBias=tt.bias,it.shadowNormalBias=tt.normalBias,it.shadowRadius=tt.radius,it.shadowMapSize=tt.mapSize,n.directionalShadow[p]=it,n.directionalShadowMap[p]=rt,n.directionalShadowMatrix[p]=N.shadow.matrix,S++}n.directional[p]=Z,p++}else if(N.isSpotLight){let Z=t.get(N);Z.position.setFromMatrixPosition(N.matrixWorld),Z.color.copy(z).multiplyScalar(J),Z.distance=Y,Z.coneCos=Math.cos(N.angle),Z.penumbraCos=Math.cos(N.angle*(1-N.penumbra)),Z.decay=N.decay,n.spot[x]=Z;let tt=N.shadow;if(N.map&&(n.spotLightMap[y]=N.map,y++,tt.updateMatrices(N),N.castShadow&&A++),n.spotLightMatrix[x]=tt.matrix,N.castShadow){let it=e.get(N);it.shadowIntensity=tt.intensity,it.shadowBias=tt.bias,it.shadowNormalBias=tt.normalBias,it.shadowRadius=tt.radius,it.shadowMapSize=tt.mapSize,n.spotShadow[x]=it,n.spotShadowMap[x]=rt,R++}x++}else if(N.isRectAreaLight){let Z=t.get(N);Z.color.copy(z).multiplyScalar(J),Z.halfWidth.set(N.width*.5,0,0),Z.halfHeight.set(0,N.height*.5,0),n.rectArea[b]=Z,b++}else if(N.isPointLight){let Z=t.get(N);if(Z.color.copy(N.color).multiplyScalar(N.intensity),Z.distance=N.distance,Z.decay=N.decay,N.castShadow){let tt=N.shadow,it=e.get(N);it.shadowIntensity=tt.intensity,it.shadowBias=tt.bias,it.shadowNormalBias=tt.normalBias,it.shadowRadius=tt.radius,it.shadowMapSize=tt.mapSize,it.shadowCameraNear=tt.camera.near,it.shadowCameraFar=tt.camera.far,n.pointShadow[m]=it,n.pointShadowMap[m]=rt,n.pointShadowMatrix[m]=N.shadow.matrix,w++}n.point[m]=Z,m++}else if(N.isHemisphereLight){let Z=t.get(N);Z.skyColor.copy(N.color).multiplyScalar(J),Z.groundColor.copy(N.groundColor).multiplyScalar(J),n.hemi[v]=Z,v++}}b>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=wt.LTC_FLOAT_1,n.rectAreaLTC2=wt.LTC_FLOAT_2):(n.rectAreaLTC1=wt.LTC_HALF_1,n.rectAreaLTC2=wt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let L=n.hash;(L.sunLength!==f||L.directionalLength!==p||L.pointLength!==m||L.spotLength!==x||L.rectAreaLength!==b||L.hemiLength!==v||L.numSunShadows!==g||L.numDirectionalShadows!==S||L.numPointShadows!==w||L.numSpotShadows!==R||L.numSpotMaps!==y||L.numLightProbes!==P)&&(n.sun.length=f,n.directional.length=p,n.spot.length=x,n.rectArea.length=b,n.point.length=m,n.hemi.length=v,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=_,n.sunShadowCascade.length=_,n.directionalShadow.length=S,n.directionalShadowMap.length=S,n.directionalShadowMatrix.length=S,n.pointShadow.length=w,n.pointShadowMap.length=w,n.pointShadowMatrix.length=w,n.spotShadow.length=R,n.spotShadowMap.length=R,n.spotLightMatrix.length=R+y-A,n.spotLightMap.length=y,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=P,L.sunLength=f,L.directionalLength=p,L.pointLength=m,L.spotLength=x,L.rectAreaLength=b,L.hemiLength=v,L.numSunShadows=g,L.numDirectionalShadows=S,L.numPointShadows=w,L.numSpotShadows=R,L.numSpotMaps=y,L.numLightProbes=P,n.version=cy++)}function l(c,h){let u=0,d=0,f=0,g=0,_=0,p=0,m=h.matrixWorldInverse;for(let x=0,b=c.length;x<b;x++){let v=c[x];if(v.isSunLight){let S=n.sun[u];S.direction.setFromMatrixPosition(v.matrixWorld),S.direction.transformDirection(m),u++}else if(v.isDirectionalLight){let S=n.directional[d];S.direction.setFromMatrixPosition(v.matrixWorld),i.setFromMatrixPosition(v.target.matrixWorld),S.direction.sub(i),S.direction.transformDirection(m),d++}else if(v.isSpotLight){let S=n.spot[g];S.position.setFromMatrixPosition(v.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(v.matrixWorld),i.setFromMatrixPosition(v.target.matrixWorld),S.direction.sub(i),S.direction.transformDirection(m),g++}else if(v.isRectAreaLight){let S=n.rectArea[_];S.position.setFromMatrixPosition(v.matrixWorld),S.position.applyMatrix4(m),a.identity(),r.copy(v.matrixWorld),r.premultiply(m),a.extractRotation(r),S.halfWidth.set(v.width*.5,0,0),S.halfHeight.set(0,v.height*.5,0),S.halfWidth.applyMatrix4(a),S.halfHeight.applyMatrix4(a),_++}else if(v.isPointLight){let S=n.point[f];S.position.setFromMatrixPosition(v.matrixWorld),S.position.applyMatrix4(m),f++}else if(v.isHemisphereLight){let S=n.hemi[p];S.direction.setFromMatrixPosition(v.matrixWorld),S.direction.transformDirection(m),p++}}}return{setup:o,setupView:l,state:n}}function tp(s){let t=new uy(s),e=[],n=[],i=[];function r(d){u.camera=d,e.length=0,n.length=0,i.length=0}function a(d){e.push(d)}function o(d){n.push(d)}function l(d){i.push(d)}function c(){t.setup(e)}function h(d){t.setupView(e,d)}let u={lightsArray:e,shadowsArray:n,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function dy(s){let t=new WeakMap;function e(i,r=0){let a=t.get(i),o;return a===void 0?(o=new tp(s),t.set(i,[o])):r>=a.length?(o=new tp(s),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var fy=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,py=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,my=[new T(1,0,0),new T(-1,0,0),new T(0,1,0),new T(0,-1,0),new T(0,0,1),new T(0,0,-1)],gy=[new T(0,-1,0),new T(0,-1,0),new T(0,0,1),new T(0,0,-1),new T(0,-1,0),new T(0,-1,0)],ep=new we,ro=new T,xu=new T;function xy(s,t,e){let n=new br,i=new at,r=new at,a=new Ve,o=new _l,l=new vl,c={},h=e.maxTextureSize,u={[_s]:yn,[yn]:_s,[ve]:ve},d=new Ue({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new at},radius:{value:4}},vertexShader:fy,fragmentShader:py}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new Re;g.setAttribute("position",new qe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new gt(g,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ks;let m=this.type;this.render=function(w,R,y){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||w.length===0)return;this.type===Xd&&(Jt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=ks);let A=s.getRenderTarget(),P=s.getActiveCubeFace(),L=s.getActiveMipmapLevel(),F=s.state;F.setBlending(ni),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let k=m!==this.type;k&&R.traverse(function(N){N.material&&(Array.isArray(N.material)?N.material.forEach(z=>z.needsUpdate=!0):N.material.needsUpdate=!0)});for(let N=0,z=w.length;N<z;N++){let J=w[N],Y=J.shadow;if(Y===void 0){Jt("WebGLShadowMap:",J,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;i.copy(Y.mapSize);let rt=Y.getFrameExtents();i.multiply(rt),r.copy(Y.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/rt.x),i.x=r.x*rt.x,Y.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/rt.y),i.y=r.y*rt.y,Y.mapSize.y=r.y));let Z=s.state.buffers.depth.getReversed();if(Y.camera._reversedDepth=Z,Y.map===null||k===!0){if(Y.map!==null&&(Y.map.depthTexture!==null&&(Y.map.depthTexture.dispose(),Y.map.depthTexture=null),Y.map.dispose()),this.type===Ar){if(J.isPointLight){Jt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Y.map=new $e(i.x,i.y,{format:bs,type:cn,minFilter:vn,magFilter:vn,generateMipmaps:!1}),Y.map.texture.name=J.name+".shadowMap",Y.map.depthTexture=new fs(i.x,i.y,ii),Y.map.depthTexture.name=J.name+".shadowMapDepth",Y.map.depthTexture.format=Ai,Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=rn,Y.map.depthTexture.magFilter=rn}else J.isPointLight?(Y.map=new Ec(i.x),Y.map.depthTexture=new hl(i.x,mi)):(Y.map=new $e(i.x,i.y),Y.map.depthTexture=new fs(i.x,i.y,mi)),Y.map.depthTexture.name=J.name+".shadowMap",Y.map.depthTexture.format=Ai,this.type===ks?(Y.map.depthTexture.compareFunction=Z?Mc:yc,Y.map.depthTexture.minFilter=vn,Y.map.depthTexture.magFilter=vn):(Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=rn,Y.map.depthTexture.magFilter=rn);Y.camera.updateProjectionMatrix()}Y.map.isWebGLCubeRenderTarget!==!0&&(Y.map.width!==i.x||Y.map.height!==i.y)&&Y.map.setSize(i.x,i.y);let tt=Y.map.isWebGLCubeRenderTarget?6:Y.getViewportCount();J.isPointLight!==!0&&Y.updateMatrices(J,y);for(let it=0;it<tt;it++){let It=Y.getCamera(it);if(J.isPointLight){let Rt=Y.camera,re=Y.matrix,ee=J.distance||Rt.far;ee!==Rt.far&&(Rt.far=ee,Rt.updateProjectionMatrix()),ro.setFromMatrixPosition(J.matrixWorld),Rt.position.copy(ro),xu.copy(Rt.position),xu.add(my[it]),Rt.up.copy(gy[it]),Rt.lookAt(xu),Rt.updateMatrixWorld(),re.makeTranslation(-ro.x,-ro.y,-ro.z),ep.multiplyMatrices(Rt.projectionMatrix,Rt.matrixWorldInverse),Y._frustum.setFromProjectionMatrix(ep,Rt.coordinateSystem,Rt.reversedDepth)}if(Y.map.isWebGLCubeRenderTarget)s.setRenderTarget(Y.map,it),s.clear();else{it===0&&(s.setRenderTarget(Y.map),s.clear());let Rt=Y.getViewport(it);a.set(r.x*Rt.x,r.y*Rt.y,r.x*Rt.z,r.y*Rt.w),F.viewport(a)}n=Y.getFrustum(it),v(R,y,It,J,this.type)}Y.isPointLightShadow!==!0&&this.type===Ar&&x(Y,y),Y.needsUpdate=!1}m=this.type,p.needsUpdate=!1,s.setRenderTarget(A,P,L)};function x(w,R){let y=t.update(_);d.defines.VSM_SAMPLES!==w.blurSamples&&(d.defines.VSM_SAMPLES=w.blurSamples,f.defines.VSM_SAMPLES=w.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),w.mapPass===null?w.mapPass=new $e(i.x,i.y,{format:bs,type:cn}):(w.mapPass.width!==w.map.width||w.mapPass.height!==w.map.height)&&w.mapPass.setSize(w.map.width,w.map.height),d.uniforms.shadow_pass.value=w.map.depthTexture,d.uniforms.resolution.value.set(w.map.width,w.map.height),d.uniforms.radius.value=w.radius,s.setRenderTarget(w.mapPass),s.clear(),s.renderBufferDirect(R,null,y,d,_,null),f.uniforms.shadow_pass.value=w.mapPass.texture,f.uniforms.resolution.value.set(w.map.width,w.map.height),f.uniforms.radius.value=w.radius,s.setRenderTarget(w.map),s.clear(),s.renderBufferDirect(R,null,y,f,_,null)}function b(w,R,y,A){let P=null,L=y.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(L!==void 0)P=L;else if(P=y.isPointLight===!0?l:o,s.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){let F=P.uuid,k=R.uuid,N=c[F];N===void 0&&(N={},c[F]=N);let z=N[k];z===void 0&&(z=P.clone(),N[k]=z,R.addEventListener("dispose",S)),P=z}if(P.visible=R.visible,P.wireframe=R.wireframe,A===Ar?P.side=R.shadowSide!==null?R.shadowSide:R.side:P.side=R.shadowSide!==null?R.shadowSide:u[R.side],P.alphaMap=R.alphaMap,P.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,P.map=R.map,P.clipShadows=R.clipShadows,P.clippingPlanes=R.clippingPlanes,P.clipIntersection=R.clipIntersection,P.displacementMap=R.displacementMap,P.displacementScale=R.displacementScale,P.displacementBias=R.displacementBias,P.wireframeLinewidth=R.wireframeLinewidth,P.linewidth=R.linewidth,y.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let F=s.properties.get(P);F.light=y}return P}function v(w,R,y,A,P){if(w.visible===!1)return;if(w.layers.test(R.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&P===Ar)&&(!w.frustumCulled||w.intersectsFrustum(n))){w.modelViewMatrix.multiplyMatrices(y.matrixWorldInverse,w.matrixWorld);let k=t.update(w),N=w.material;if(Array.isArray(N)){let z=k.groups;for(let J=0,Y=z.length;J<Y;J++){let rt=z[J],Z=N[rt.materialIndex];if(Z&&Z.visible){let tt=b(w,Z,A,P);w.onBeforeShadow(s,w,R,y,k,tt,rt),s.renderBufferDirect(y,null,k,tt,w,rt),w.onAfterShadow(s,w,R,y,k,tt,rt)}}}else if(N.visible){let z=b(w,N,A,P);w.onBeforeShadow(s,w,R,y,k,z,null),s.renderBufferDirect(y,null,k,z,w,null),w.onAfterShadow(s,w,R,y,k,z,null)}}let F=w.children;for(let k=0,N=F.length;k<N;k++)v(F[k],R,y,A,P)}function S(w){w.target.removeEventListener("dispose",S);for(let y in c){let A=c[y],P=w.target.uuid;P in A&&(A[P].dispose(),delete A[P])}}}function _y(s,t){function e(){let B=!1,vt=new Ve,et=null,pt=new Ve(0,0,0,0);return{setMask:function(Et){et!==Et&&!B&&(s.colorMask(Et,Et,Et,Et),et=Et)},setLocked:function(Et){B=Et},setClear:function(Et,I,H,K,ut){ut===!0&&(Et*=K,I*=K,H*=K),vt.set(Et,I,H,K),pt.equals(vt)===!1&&(s.clearColor(Et,I,H,K),pt.copy(vt))},reset:function(){B=!1,et=null,pt.set(-1,0,0,0)}}}function n(){let B=!1,vt=!1,et=null,pt=null,Et=null;return{setReversed:function(I){if(vt!==I){let H=t.get("EXT_clip_control");I?H.clipControlEXT(H.LOWER_LEFT_EXT,H.ZERO_TO_ONE_EXT):H.clipControlEXT(H.LOWER_LEFT_EXT,H.NEGATIVE_ONE_TO_ONE_EXT),vt=I;let K=Et;Et=null,this.setClear(K)}},getReversed:function(){return vt},setTest:function(I){I?Q(s.DEPTH_TEST):_t(s.DEPTH_TEST)},setMask:function(I){et!==I&&!B&&(s.depthMask(I),et=I)},setFunc:function(I){if(vt&&(I=Af[I]),pt!==I){switch(I){case $o:s.depthFunc(s.NEVER);break;case jo:s.depthFunc(s.ALWAYS);break;case Qo:s.depthFunc(s.LESS);break;case gr:s.depthFunc(s.LEQUAL);break;case tl:s.depthFunc(s.EQUAL);break;case el:s.depthFunc(s.GEQUAL);break;case nl:s.depthFunc(s.GREATER);break;case il:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}pt=I}},setLocked:function(I){B=I},setClear:function(I){Et!==I&&(Et=I,vt&&(I=1-I),s.clearDepth(I))},reset:function(){B=!1,et=null,pt=null,Et=null,vt=!1}}}function i(){let B=!1,vt=null,et=null,pt=null,Et=null,I=null,H=null,K=null,ut=null;return{setTest:function(mt){B||(mt?Q(s.STENCIL_TEST):_t(s.STENCIL_TEST))},setMask:function(mt){vt!==mt&&!B&&(s.stencilMask(mt),vt=mt)},setFunc:function(mt,Yt,Ct){(et!==mt||pt!==Yt||Et!==Ct)&&(s.stencilFunc(mt,Yt,Ct),et=mt,pt=Yt,Et=Ct)},setOp:function(mt,Yt,Ct){(I!==mt||H!==Yt||K!==Ct)&&(s.stencilOp(mt,Yt,Ct),I=mt,H=Yt,K=Ct)},setLocked:function(mt){B=mt},setClear:function(mt){ut!==mt&&(s.clearStencil(mt),ut=mt)},reset:function(){B=!1,vt=null,et=null,pt=null,Et=null,I=null,H=null,K=null,ut=null}}}let r=new e,a=new n,o=new i,l=new WeakMap,c=new WeakMap,h={},u={},d={},f=new WeakMap,g=[],_=null,p=!1,m=null,x=null,b=null,v=null,S=null,w=null,R=null,y=new Pt(0,0,0),A=0,P=!1,L=null,F=null,k=null,N=null,z=null,J=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,rt=0,Z=s.getParameter(s.VERSION);Z.indexOf("WebGL")!==-1?(rt=parseFloat(/^WebGL (\d)/.exec(Z)[1]),Y=rt>=1):Z.indexOf("OpenGL ES")!==-1&&(rt=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),Y=rt>=2);let tt=null,it={},It=s.getParameter(s.SCISSOR_BOX),Rt=s.getParameter(s.VIEWPORT),re=new Ve().fromArray(It),ee=new Ve().fromArray(Rt);function ie(B,vt,et,pt){let Et=new Uint8Array(4),I=s.createTexture();s.bindTexture(B,I),s.texParameteri(B,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(B,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let H=0;H<et;H++)B===s.TEXTURE_3D||B===s.TEXTURE_2D_ARRAY?s.texImage3D(vt,0,s.RGBA,1,1,pt,0,s.RGBA,s.UNSIGNED_BYTE,Et):s.texImage2D(vt+H,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,Et);return I}let X={};X[s.TEXTURE_2D]=ie(s.TEXTURE_2D,s.TEXTURE_2D,1),X[s.TEXTURE_CUBE_MAP]=ie(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),X[s.TEXTURE_2D_ARRAY]=ie(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),X[s.TEXTURE_3D]=ie(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),Q(s.DEPTH_TEST),a.setFunc(gr),ht(!1),xt(Hh),Q(s.CULL_FACE),lt(ni);function Q(B){h[B]!==!0&&(s.enable(B),h[B]=!0)}function _t(B){h[B]!==!1&&(s.disable(B),h[B]=!1)}function Vt(B,vt){return d[B]!==vt?(s.bindFramebuffer(B,vt),d[B]=vt,B===s.DRAW_FRAMEBUFFER&&(d[s.FRAMEBUFFER]=vt),B===s.FRAMEBUFFER&&(d[s.DRAW_FRAMEBUFFER]=vt),!0):!1}function St(B,vt){let et=g,pt=!1;if(B){et=f.get(vt),et===void 0&&(et=[],f.set(vt,et));let Et=B.textures;if(et.length!==Et.length||et[0]!==s.COLOR_ATTACHMENT0){for(let I=0,H=Et.length;I<H;I++)et[I]=s.COLOR_ATTACHMENT0+I;et.length=Et.length,pt=!0}}else et[0]!==s.BACK&&(et[0]=s.BACK,pt=!0);pt&&s.drawBuffers(et)}function Xt(B){return _!==B?(s.useProgram(B),_=B,!0):!1}let he={[Vs]:s.FUNC_ADD,[Yd]:s.FUNC_SUBTRACT,[Zd]:s.FUNC_REVERSE_SUBTRACT};he[Jd]=s.MIN,he[Kd]=s.MAX;let st={[$d]:s.ZERO,[jd]:s.ONE,[Qd]:s.SRC_COLOR,[Gh]:s.SRC_ALPHA,[af]:s.SRC_ALPHA_SATURATE,[sf]:s.DST_COLOR,[ef]:s.DST_ALPHA,[tf]:s.ONE_MINUS_SRC_COLOR,[Wh]:s.ONE_MINUS_SRC_ALPHA,[rf]:s.ONE_MINUS_DST_COLOR,[nf]:s.ONE_MINUS_DST_ALPHA,[of]:s.CONSTANT_COLOR,[lf]:s.ONE_MINUS_CONSTANT_COLOR,[cf]:s.CONSTANT_ALPHA,[hf]:s.ONE_MINUS_CONSTANT_ALPHA};function lt(B,vt,et,pt,Et,I,H,K,ut,mt){if(B===ni){p===!0&&(_t(s.BLEND),p=!1);return}if(p===!1&&(Q(s.BLEND),p=!0),B!==qd){if(B!==m||mt!==P){if((x!==Vs||S!==Vs)&&(s.blendEquation(s.FUNC_ADD),x=Vs,S=Vs),mt)switch(B){case Di:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case ln:s.blendFunc(s.ONE,s.ONE);break;case kh:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Vh:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:Kt("WebGLState: Invalid blending: ",B);break}else switch(B){case Di:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case ln:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case kh:Kt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Vh:Kt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Kt("WebGLState: Invalid blending: ",B);break}b=null,v=null,w=null,R=null,y.set(0,0,0),A=0,m=B,P=mt}return}Et=Et||vt,I=I||et,H=H||pt,(vt!==x||Et!==S)&&(s.blendEquationSeparate(he[vt],he[Et]),x=vt,S=Et),(et!==b||pt!==v||I!==w||H!==R)&&(s.blendFuncSeparate(st[et],st[pt],st[I],st[H]),b=et,v=pt,w=I,R=H),(K.equals(y)===!1||ut!==A)&&(s.blendColor(K.r,K.g,K.b,ut),y.copy(K),A=ut),m=B,P=!1}function ct(B,vt){B.side===ve?_t(s.CULL_FACE):Q(s.CULL_FACE);let et=B.side===yn;vt&&(et=!et),ht(et),B.blending===Di&&B.transparent===!1?lt(ni):lt(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),a.setFunc(B.depthFunc),a.setTest(B.depthTest),a.setMask(B.depthWrite),r.setMask(B.colorWrite);let pt=B.stencilWrite;o.setTest(pt),pt&&(o.setMask(B.stencilWriteMask),o.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),o.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),Gt(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?Q(s.SAMPLE_ALPHA_TO_COVERAGE):_t(s.SAMPLE_ALPHA_TO_COVERAGE)}function ht(B){L!==B&&(B?s.frontFace(s.CW):s.frontFace(s.CCW),L=B)}function xt(B){B!==Gd?(Q(s.CULL_FACE),B!==F&&(B===Hh?s.cullFace(s.BACK):B===Wd?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):_t(s.CULL_FACE),F=B}function qt(B){B!==k&&(Y&&s.lineWidth(B),k=B)}function Gt(B,vt,et){B?(Q(s.POLYGON_OFFSET_FILL),(N!==vt||z!==et)&&(N=vt,z=et,a.getReversed()&&(vt=-vt),s.polygonOffset(vt,et))):_t(s.POLYGON_OFFSET_FILL)}function Zt(B){B?Q(s.SCISSOR_TEST):_t(s.SCISSOR_TEST)}function $t(B){B===void 0&&(B=s.TEXTURE0+J-1),tt!==B&&(s.activeTexture(B),tt=B)}function D(B,vt,et){et===void 0&&(tt===null?et=s.TEXTURE0+J-1:et=tt);let pt=it[et];pt===void 0&&(pt={type:void 0,texture:void 0},it[et]=pt),(pt.type!==B||pt.texture!==vt)&&(tt!==et&&(s.activeTexture(et),tt=et),s.bindTexture(B,vt||X[B]),pt.type=B,pt.texture=vt)}function fe(){let B=it[tt];B!==void 0&&B.type!==void 0&&(s.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function ne(){try{s.compressedTexImage2D(...arguments)}catch(B){Kt("WebGLState:",B)}}function C(){try{s.compressedTexImage3D(...arguments)}catch(B){Kt("WebGLState:",B)}}function M(){try{s.texSubImage2D(...arguments)}catch(B){Kt("WebGLState:",B)}}function O(){try{s.texSubImage3D(...arguments)}catch(B){Kt("WebGLState:",B)}}function W(){try{s.compressedTexSubImage2D(...arguments)}catch(B){Kt("WebGLState:",B)}}function $(){try{s.compressedTexSubImage3D(...arguments)}catch(B){Kt("WebGLState:",B)}}function dt(){try{s.texStorage2D(...arguments)}catch(B){Kt("WebGLState:",B)}}function ft(){try{s.texStorage3D(...arguments)}catch(B){Kt("WebGLState:",B)}}function j(){try{s.texImage2D(...arguments)}catch(B){Kt("WebGLState:",B)}}function nt(){try{s.texImage3D(...arguments)}catch(B){Kt("WebGLState:",B)}}function yt(B){return u[B]!==void 0?u[B]:s.getParameter(B)}function zt(B,vt){u[B]!==vt&&(s.pixelStorei(B,vt),u[B]=vt)}function bt(B){re.equals(B)===!1&&(s.scissor(B.x,B.y,B.z,B.w),re.copy(B))}function Mt(B){ee.equals(B)===!1&&(s.viewport(B.x,B.y,B.z,B.w),ee.copy(B))}function Ht(B,vt){let et=c.get(vt);et===void 0&&(et=new WeakMap,c.set(vt,et));let pt=et.get(B);pt===void 0&&(pt=s.getUniformBlockIndex(vt,B.name),et.set(B,pt))}function Wt(B,vt){let pt=c.get(vt).get(B);l.get(vt)!==pt&&(s.uniformBlockBinding(vt,pt,B.__bindingPointIndex),l.set(vt,pt))}function Qt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),h={},u={},tt=null,it={},d={},f=new WeakMap,g=[],_=null,p=!1,m=null,x=null,b=null,v=null,S=null,w=null,R=null,y=new Pt(0,0,0),A=0,P=!1,L=null,F=null,k=null,N=null,z=null,re.set(0,0,s.canvas.width,s.canvas.height),ee.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:Q,disable:_t,bindFramebuffer:Vt,drawBuffers:St,useProgram:Xt,setBlending:lt,setMaterial:ct,setFlipSided:ht,setCullFace:xt,setLineWidth:qt,setPolygonOffset:Gt,setScissorTest:Zt,activeTexture:$t,bindTexture:D,unbindTexture:fe,compressedTexImage2D:ne,compressedTexImage3D:C,texImage2D:j,texImage3D:nt,pixelStorei:zt,getParameter:yt,updateUBOMapping:Ht,uniformBlockBinding:Wt,texStorage2D:dt,texStorage3D:ft,texSubImage2D:M,texSubImage3D:O,compressedTexSubImage2D:W,compressedTexSubImage3D:$,scissor:bt,viewport:Mt,reset:Qt}}function vy(s,t,e,n,i,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new at,h=new WeakMap,u=new Set,d,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(C,M){return g?new OffscreenCanvas(C,M):ma("canvas")}function p(C,M,O){let W=1,$=ne(C);if(($.width>O||$.height>O)&&(W=O/Math.max($.width,$.height)),W<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let dt=Math.floor(W*$.width),ft=Math.floor(W*$.height);d===void 0&&(d=_(dt,ft));let j=M?_(dt,ft):d;return j.width=dt,j.height=ft,j.getContext("2d").drawImage(C,0,0,dt,ft),Jt("WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+dt+"x"+ft+")."),j}else return"data"in C&&Jt("WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),C;return C}function m(C){return C.generateMipmaps}function x(C){s.generateMipmap(C)}function b(C){return C.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?s.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function v(C,M,O,W,$,dt=!1){if(C!==null){if(s[C]!==void 0)return s[C];Jt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let ft;W&&(ft=t.get("EXT_texture_norm16"),ft||Jt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let j=M;if(M===s.RED&&(O===s.FLOAT&&(j=s.R32F),O===s.HALF_FLOAT&&(j=s.R16F),O===s.UNSIGNED_BYTE&&(j=s.R8),O===s.UNSIGNED_SHORT&&ft&&(j=ft.R16_EXT),O===s.SHORT&&ft&&(j=ft.R16_SNORM_EXT)),M===s.RED_INTEGER&&(O===s.UNSIGNED_BYTE&&(j=s.R8UI),O===s.UNSIGNED_SHORT&&(j=s.R16UI),O===s.UNSIGNED_INT&&(j=s.R32UI),O===s.BYTE&&(j=s.R8I),O===s.SHORT&&(j=s.R16I),O===s.INT&&(j=s.R32I)),M===s.RG&&(O===s.FLOAT&&(j=s.RG32F),O===s.HALF_FLOAT&&(j=s.RG16F),O===s.UNSIGNED_BYTE&&(j=s.RG8),O===s.UNSIGNED_SHORT&&ft&&(j=ft.RG16_EXT),O===s.SHORT&&ft&&(j=ft.RG16_SNORM_EXT)),M===s.RG_INTEGER&&(O===s.UNSIGNED_BYTE&&(j=s.RG8UI),O===s.UNSIGNED_SHORT&&(j=s.RG16UI),O===s.UNSIGNED_INT&&(j=s.RG32UI),O===s.BYTE&&(j=s.RG8I),O===s.SHORT&&(j=s.RG16I),O===s.INT&&(j=s.RG32I)),M===s.RGB_INTEGER&&(O===s.UNSIGNED_BYTE&&(j=s.RGB8UI),O===s.UNSIGNED_SHORT&&(j=s.RGB16UI),O===s.UNSIGNED_INT&&(j=s.RGB32UI),O===s.BYTE&&(j=s.RGB8I),O===s.SHORT&&(j=s.RGB16I),O===s.INT&&(j=s.RGB32I)),M===s.RGBA_INTEGER&&(O===s.UNSIGNED_BYTE&&(j=s.RGBA8UI),O===s.UNSIGNED_SHORT&&(j=s.RGBA16UI),O===s.UNSIGNED_INT&&(j=s.RGBA32UI),O===s.BYTE&&(j=s.RGBA8I),O===s.SHORT&&(j=s.RGBA16I),O===s.INT&&(j=s.RGBA32I)),M===s.RGB&&(O===s.UNSIGNED_SHORT&&ft&&(j=ft.RGB16_EXT),O===s.SHORT&&ft&&(j=ft.RGB16_SNORM_EXT),O===s.UNSIGNED_INT_5_9_9_9_REV&&(j=s.RGB9_E5),O===s.UNSIGNED_INT_10F_11F_11F_REV&&(j=s.R11F_G11F_B10F)),M===s.RGBA){let nt=dt?pa:ce.getTransfer($);O===s.FLOAT&&(j=s.RGBA32F),O===s.HALF_FLOAT&&(j=s.RGBA16F),O===s.UNSIGNED_BYTE&&(j=nt===ge?s.SRGB8_ALPHA8:s.RGBA8),O===s.UNSIGNED_SHORT&&ft&&(j=ft.RGBA16_EXT),O===s.SHORT&&ft&&(j=ft.RGBA16_SNORM_EXT),O===s.UNSIGNED_SHORT_4_4_4_4&&(j=s.RGBA4),O===s.UNSIGNED_SHORT_5_5_5_1&&(j=s.RGB5_A1)}return(j===s.R16F||j===s.R32F||j===s.RG16F||j===s.RG32F||j===s.RGBA16F||j===s.RGBA32F)&&t.get("EXT_color_buffer_float"),j}function S(C,M){let O;return C?M===null||M===mi||M===Cr?O=s.DEPTH24_STENCIL8:M===ii?O=s.DEPTH32F_STENCIL8:M===Rr&&(O=s.DEPTH24_STENCIL8,Jt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===mi||M===Cr?O=s.DEPTH_COMPONENT24:M===ii?O=s.DEPTH_COMPONENT32F:M===Rr&&(O=s.DEPTH_COMPONENT16),O}function w(C,M){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==rn&&C.minFilter!==vn?Math.log2(Math.max(M.width,M.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?M.mipmaps.length:1}function R(C){let M=C.target;M.removeEventListener("dispose",R),A(M),M.isVideoTexture&&h.delete(M),M.isHTMLTexture&&u.delete(M)}function y(C){let M=C.target;M.removeEventListener("dispose",y),L(M)}function A(C){let M=n.get(C);if(M.__webglInit===void 0)return;let O=C.source,W=f.get(O);if(W){let $=W[M.__cacheKey];$.usedTimes--,$.usedTimes===0&&P(C),Object.keys(W).length===0&&f.delete(O)}n.remove(C)}function P(C){let M=n.get(C);s.deleteTexture(M.__webglTexture);let O=C.source,W=f.get(O);delete W[M.__cacheKey],a.memory.textures--}function L(C){let M=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(M.__webglFramebuffer[W]))for(let $=0;$<M.__webglFramebuffer[W].length;$++)s.deleteFramebuffer(M.__webglFramebuffer[W][$]);else s.deleteFramebuffer(M.__webglFramebuffer[W]);M.__webglDepthbuffer&&s.deleteRenderbuffer(M.__webglDepthbuffer[W])}else{if(Array.isArray(M.__webglFramebuffer))for(let W=0;W<M.__webglFramebuffer.length;W++)s.deleteFramebuffer(M.__webglFramebuffer[W]);else s.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&s.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&s.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let W=0;W<M.__webglColorRenderbuffer.length;W++)M.__webglColorRenderbuffer[W]&&s.deleteRenderbuffer(M.__webglColorRenderbuffer[W]);M.__webglDepthRenderbuffer&&s.deleteRenderbuffer(M.__webglDepthRenderbuffer)}let O=C.textures;for(let W=0,$=O.length;W<$;W++){let dt=n.get(O[W]);dt.__webglTexture&&(s.deleteTexture(dt.__webglTexture),a.memory.textures--),n.remove(O[W])}n.remove(C)}let F=0;function k(){F=0}function N(){return F}function z(C){F=C}function J(){let C=F;return C>=i.maxTextures&&Jt("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+i.maxTextures),F+=1,C}function Y(C){let M=[];return M.push(C.wrapS),M.push(C.wrapT),M.push(C.wrapR||0),M.push(C.magFilter),M.push(C.minFilter),M.push(C.anisotropy),M.push(C.internalFormat),M.push(C.format),M.push(C.type),M.push(C.generateMipmaps),M.push(C.premultiplyAlpha),M.push(C.flipY),M.push(C.unpackAlignment),M.push(C.colorSpace),M.join()}function rt(C,M){let O=n.get(C);if(C.isVideoTexture&&D(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&O.__version!==C.version){let W=C.image;if(W===null)Jt("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Jt("WebGLRenderer: Texture marked for update but image is incomplete");else{_t(O,C,M);return}}else C.isExternalTexture&&(O.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(s.TEXTURE_2D,O.__webglTexture,s.TEXTURE0+M)}function Z(C,M){let O=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&O.__version!==C.version){_t(O,C,M);return}else C.isExternalTexture&&(O.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(s.TEXTURE_2D_ARRAY,O.__webglTexture,s.TEXTURE0+M)}function tt(C,M){let O=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&O.__version!==C.version){_t(O,C,M);return}e.bindTexture(s.TEXTURE_3D,O.__webglTexture,s.TEXTURE0+M)}function it(C,M){let O=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&O.__version!==C.version){Vt(O,C,M);return}e.bindTexture(s.TEXTURE_CUBE_MAP,O.__webglTexture,s.TEXTURE0+M)}let It={[Ti]:s.REPEAT,[Ei]:s.CLAMP_TO_EDGE,[sl]:s.MIRRORED_REPEAT},Rt={[rn]:s.NEAREST,[ff]:s.NEAREST_MIPMAP_NEAREST,[$a]:s.NEAREST_MIPMAP_LINEAR,[vn]:s.LINEAR,[Ul]:s.LINEAR_MIPMAP_NEAREST,[ys]:s.LINEAR_MIPMAP_LINEAR},re={[xf]:s.NEVER,[bf]:s.ALWAYS,[_f]:s.LESS,[yc]:s.LEQUAL,[vf]:s.EQUAL,[Mc]:s.GEQUAL,[yf]:s.GREATER,[Mf]:s.NOTEQUAL};function ee(C,M){if(M.type===ii&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===vn||M.magFilter===Ul||M.magFilter===$a||M.magFilter===ys||M.minFilter===vn||M.minFilter===Ul||M.minFilter===$a||M.minFilter===ys)&&Jt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(C,s.TEXTURE_WRAP_S,It[M.wrapS]),s.texParameteri(C,s.TEXTURE_WRAP_T,It[M.wrapT]),(C===s.TEXTURE_3D||C===s.TEXTURE_2D_ARRAY)&&s.texParameteri(C,s.TEXTURE_WRAP_R,It[M.wrapR]),s.texParameteri(C,s.TEXTURE_MAG_FILTER,Rt[M.magFilter]),s.texParameteri(C,s.TEXTURE_MIN_FILTER,Rt[M.minFilter]),M.compareFunction&&(s.texParameteri(C,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(C,s.TEXTURE_COMPARE_FUNC,re[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===rn||M.minFilter!==$a&&M.minFilter!==ys||M.type===ii&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){let O=t.get("EXT_texture_filter_anisotropic");s.texParameterf(C,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,i.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function ie(C,M){let O=!1;C.__webglInit===void 0&&(C.__webglInit=!0,M.addEventListener("dispose",R));let W=M.source,$=f.get(W);$===void 0&&($={},f.set(W,$));let dt=Y(M);if(dt!==C.__cacheKey){$[dt]===void 0&&($[dt]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,O=!0),$[dt].usedTimes++;let ft=$[C.__cacheKey];ft!==void 0&&($[C.__cacheKey].usedTimes--,ft.usedTimes===0&&P(M)),C.__cacheKey=dt,C.__webglTexture=$[dt].texture}return O}function X(C,M,O){return Math.floor(Math.floor(C/O)/M)}function Q(C,M,O,W){let dt=C.updateRanges;if(dt.length===0)e.texSubImage2D(s.TEXTURE_2D,0,0,0,M.width,M.height,O,W,M.data);else{dt.sort((zt,bt)=>zt.start-bt.start);let ft=0;for(let zt=1;zt<dt.length;zt++){let bt=dt[ft],Mt=dt[zt],Ht=bt.start+bt.count,Wt=X(Mt.start,M.width,4),Qt=X(bt.start,M.width,4);Mt.start<=Ht+1&&Wt===Qt&&X(Mt.start+Mt.count-1,M.width,4)===Wt?bt.count=Math.max(bt.count,Mt.start+Mt.count-bt.start):(++ft,dt[ft]=Mt)}dt.length=ft+1;let j=e.getParameter(s.UNPACK_ROW_LENGTH),nt=e.getParameter(s.UNPACK_SKIP_PIXELS),yt=e.getParameter(s.UNPACK_SKIP_ROWS);e.pixelStorei(s.UNPACK_ROW_LENGTH,M.width);for(let zt=0,bt=dt.length;zt<bt;zt++){let Mt=dt[zt],Ht=Math.floor(Mt.start/4),Wt=Math.ceil(Mt.count/4),Qt=Ht%M.width,B=Math.floor(Ht/M.width),vt=Wt,et=1;e.pixelStorei(s.UNPACK_SKIP_PIXELS,Qt),e.pixelStorei(s.UNPACK_SKIP_ROWS,B),e.texSubImage2D(s.TEXTURE_2D,0,Qt,B,vt,et,O,W,M.data)}C.clearUpdateRanges(),e.pixelStorei(s.UNPACK_ROW_LENGTH,j),e.pixelStorei(s.UNPACK_SKIP_PIXELS,nt),e.pixelStorei(s.UNPACK_SKIP_ROWS,yt)}}function _t(C,M,O){let W=s.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(W=s.TEXTURE_2D_ARRAY),M.isData3DTexture&&(W=s.TEXTURE_3D);let $=ie(C,M),dt=M.source;e.bindTexture(W,C.__webglTexture,s.TEXTURE0+O);let ft=n.get(dt);if(dt.version!==ft.__version||$===!0){if(e.activeTexture(s.TEXTURE0+O),(typeof ImageBitmap<"u"&&M.image instanceof ImageBitmap)===!1){let et=ce.getPrimaries(ce.workingColorSpace),pt=M.colorSpace===Ki?null:ce.getPrimaries(M.colorSpace),Et=M.colorSpace===Ki||et===pt?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,M.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Et)}e.pixelStorei(s.UNPACK_ALIGNMENT,M.unpackAlignment);let nt=p(M.image,!1,i.maxTextureSize);nt=fe(M,nt);let yt=r.convert(M.format,M.colorSpace),zt=r.convert(M.type),bt=v(M.internalFormat,yt,zt,M.normalized,M.colorSpace,M.isVideoTexture);ee(W,M);let Mt,Ht=M.mipmaps,Wt=M.isVideoTexture!==!0,Qt=ft.__version===void 0||$===!0,B=dt.dataReady,vt=w(M,nt);if(M.isDepthTexture)bt=S(M.format===Ms,M.type),Qt&&(Wt?e.texStorage2D(s.TEXTURE_2D,1,bt,nt.width,nt.height):e.texImage2D(s.TEXTURE_2D,0,bt,nt.width,nt.height,0,yt,zt,null));else if(M.isDataTexture)if(Ht.length>0){Wt&&Qt&&e.texStorage2D(s.TEXTURE_2D,vt,bt,Ht[0].width,Ht[0].height);for(let et=0,pt=Ht.length;et<pt;et++)Mt=Ht[et],Wt?B&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,Mt.width,Mt.height,yt,zt,Mt.data):e.texImage2D(s.TEXTURE_2D,et,bt,Mt.width,Mt.height,0,yt,zt,Mt.data);M.generateMipmaps=!1}else Wt?(Qt&&e.texStorage2D(s.TEXTURE_2D,vt,bt,nt.width,nt.height),B&&Q(M,nt,yt,zt)):e.texImage2D(s.TEXTURE_2D,0,bt,nt.width,nt.height,0,yt,zt,nt.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Wt&&Qt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,vt,bt,Ht[0].width,Ht[0].height,nt.depth);for(let et=0,pt=Ht.length;et<pt;et++)if(Mt=Ht[et],M.format!==si)if(yt!==null)if(Wt){if(B)if(M.layerUpdates.size>0){let Et=au(Mt.width,Mt.height,M.format,M.type);for(let I of M.layerUpdates){let H=Mt.data.subarray(I*Et/Mt.data.BYTES_PER_ELEMENT,(I+1)*Et/Mt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,I,Mt.width,Mt.height,1,yt,H)}}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,0,Mt.width,Mt.height,nt.depth,yt,Mt.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,et,bt,Mt.width,Mt.height,nt.depth,0,Mt.data,0,0);else Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Wt?B&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,0,Mt.width,Mt.height,nt.depth,yt,zt,Mt.data):e.texImage3D(s.TEXTURE_2D_ARRAY,et,bt,Mt.width,Mt.height,nt.depth,0,yt,zt,Mt.data);M.layerUpdates.size>0&&M.clearLayerUpdates()}else{Wt&&Qt&&e.texStorage2D(s.TEXTURE_2D,vt,bt,Ht[0].width,Ht[0].height);for(let et=0,pt=Ht.length;et<pt;et++)Mt=Ht[et],M.format!==si?yt!==null?Wt?B&&e.compressedTexSubImage2D(s.TEXTURE_2D,et,0,0,Mt.width,Mt.height,yt,Mt.data):e.compressedTexImage2D(s.TEXTURE_2D,et,bt,Mt.width,Mt.height,0,Mt.data):Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Wt?B&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,Mt.width,Mt.height,yt,zt,Mt.data):e.texImage2D(s.TEXTURE_2D,et,bt,Mt.width,Mt.height,0,yt,zt,Mt.data)}else if(M.isDataArrayTexture)if(Wt){if(Qt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,vt,bt,nt.width,nt.height,nt.depth),B)if(M.layerUpdates.size>0){let et=au(nt.width,nt.height,M.format,M.type);for(let pt of M.layerUpdates){let Et=nt.data.subarray(pt*et/nt.data.BYTES_PER_ELEMENT,(pt+1)*et/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,pt,nt.width,nt.height,1,yt,zt,Et)}M.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,yt,zt,nt.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,bt,nt.width,nt.height,nt.depth,0,yt,zt,nt.data);else if(M.isData3DTexture)Wt?(Qt&&e.texStorage3D(s.TEXTURE_3D,vt,bt,nt.width,nt.height,nt.depth),B&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,yt,zt,nt.data)):e.texImage3D(s.TEXTURE_3D,0,bt,nt.width,nt.height,nt.depth,0,yt,zt,nt.data);else if(M.isFramebufferTexture){if(Qt)if(Wt)e.texStorage2D(s.TEXTURE_2D,vt,bt,nt.width,nt.height);else{let et=nt.width,pt=nt.height;for(let Et=0;Et<vt;Et++)e.texImage2D(s.TEXTURE_2D,Et,bt,et,pt,0,yt,zt,null),et>>=1,pt>>=1}}else if(M.isHTMLTexture){if("texElementImage2D"in s){let et=s.canvas;if(et.hasAttribute("layoutsubtree")||et.setAttribute("layoutsubtree","true"),nt.parentNode!==et){et.appendChild(nt),u.add(M),et.onpaint=pt=>{let Et=pt.changedElements;for(let I of u)Et.includes(I.image)&&(I.needsUpdate=!0)},et.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,nt);else{let Et=s.RGBA,I=s.RGBA,H=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,Et,I,H,nt)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(Ht.length>0){if(Wt&&Qt){let et=ne(Ht[0]);e.texStorage2D(s.TEXTURE_2D,vt,bt,et.width,et.height)}for(let et=0,pt=Ht.length;et<pt;et++)Mt=Ht[et],Wt?B&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,yt,zt,Mt):e.texImage2D(s.TEXTURE_2D,et,bt,yt,zt,Mt);M.generateMipmaps=!1}else if(Wt){if(Qt){let et=ne(nt);e.texStorage2D(s.TEXTURE_2D,vt,bt,et.width,et.height)}B&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,yt,zt,nt)}else e.texImage2D(s.TEXTURE_2D,0,bt,yt,zt,nt);m(M)&&x(W),ft.__version=dt.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function Vt(C,M,O){if(M.image.length!==6)return;let W=ie(C,M),$=M.source;e.bindTexture(s.TEXTURE_CUBE_MAP,C.__webglTexture,s.TEXTURE0+O);let dt=n.get($);if($.version!==dt.__version||W===!0){e.activeTexture(s.TEXTURE0+O);let ft=ce.getPrimaries(ce.workingColorSpace),j=M.colorSpace===Ki?null:ce.getPrimaries(M.colorSpace),nt=M.colorSpace===Ki||ft===j?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,M.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),e.pixelStorei(s.UNPACK_ALIGNMENT,M.unpackAlignment),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,nt);let yt=M.isCompressedTexture||M.image[0].isCompressedTexture,zt=M.image[0]&&M.image[0].isDataTexture,bt=[];for(let I=0;I<6;I++)!yt&&!zt?bt[I]=p(M.image[I],!0,i.maxCubemapSize):bt[I]=zt?M.image[I].image:M.image[I],bt[I]=fe(M,bt[I]);let Mt=bt[0],Ht=r.convert(M.format,M.colorSpace),Wt=r.convert(M.type),Qt=v(M.internalFormat,Ht,Wt,M.normalized,M.colorSpace),B=M.isVideoTexture!==!0,vt=dt.__version===void 0||W===!0,et=$.dataReady,pt=w(M,Mt);ee(s.TEXTURE_CUBE_MAP,M);let Et;if(yt){B&&vt&&e.texStorage2D(s.TEXTURE_CUBE_MAP,pt,Qt,Mt.width,Mt.height);for(let I=0;I<6;I++){Et=bt[I].mipmaps;for(let H=0;H<Et.length;H++){let K=Et[H];M.format!==si?Ht!==null?B?et&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+I,H,0,0,K.width,K.height,Ht,K.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+I,H,Qt,K.width,K.height,0,K.data):Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):B?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+I,H,0,0,K.width,K.height,Ht,Wt,K.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+I,H,Qt,K.width,K.height,0,Ht,Wt,K.data)}}}else{if(Et=M.mipmaps,B&&vt){Et.length>0&&pt++;let I=ne(bt[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,pt,Qt,I.width,I.height)}for(let I=0;I<6;I++)if(zt){B?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+I,0,0,0,bt[I].width,bt[I].height,Ht,Wt,bt[I].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+I,0,Qt,bt[I].width,bt[I].height,0,Ht,Wt,bt[I].data);for(let H=0;H<Et.length;H++){let ut=Et[H].image[I].image;B?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+I,H+1,0,0,ut.width,ut.height,Ht,Wt,ut.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+I,H+1,Qt,ut.width,ut.height,0,Ht,Wt,ut.data)}}else{B?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+I,0,0,0,Ht,Wt,bt[I]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+I,0,Qt,Ht,Wt,bt[I]);for(let H=0;H<Et.length;H++){let K=Et[H];B?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+I,H+1,0,0,Ht,Wt,K.image[I]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+I,H+1,Qt,Ht,Wt,K.image[I])}}}m(M)&&x(s.TEXTURE_CUBE_MAP),dt.__version=$.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function St(C,M,O,W,$,dt){let ft=r.convert(O.format,O.colorSpace),j=r.convert(O.type),nt=v(O.internalFormat,ft,j,O.normalized,O.colorSpace),yt=n.get(M),zt=n.get(O);if(zt.__renderTarget=M,!yt.__hasExternalTextures){let bt=Math.max(1,M.width>>dt),Mt=Math.max(1,M.height>>dt);$===s.TEXTURE_3D||$===s.TEXTURE_2D_ARRAY?e.texImage3D($,dt,nt,bt,Mt,M.depth,0,ft,j,null):e.texImage2D($,dt,nt,bt,Mt,0,ft,j,null)}e.bindFramebuffer(s.FRAMEBUFFER,C),$t(M)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,W,$,zt.__webglTexture,0,Zt(M)):($===s.TEXTURE_2D||$>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,W,$,zt.__webglTexture,dt),e.bindFramebuffer(s.FRAMEBUFFER,null)}function Xt(C,M,O){if(s.bindRenderbuffer(s.RENDERBUFFER,C),M.depthBuffer){let W=M.depthTexture,$=W&&W.isDepthTexture?W.type:null,dt=S(M.stencilBuffer,$),ft=M.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;$t(M)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Zt(M),dt,M.width,M.height):O?s.renderbufferStorageMultisample(s.RENDERBUFFER,Zt(M),dt,M.width,M.height):s.renderbufferStorage(s.RENDERBUFFER,dt,M.width,M.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,ft,s.RENDERBUFFER,C)}else{let W=M.textures;for(let $=0;$<W.length;$++){let dt=W[$],ft=r.convert(dt.format,dt.colorSpace),j=r.convert(dt.type),nt=v(dt.internalFormat,ft,j,dt.normalized,dt.colorSpace);$t(M)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Zt(M),nt,M.width,M.height):O?s.renderbufferStorageMultisample(s.RENDERBUFFER,Zt(M),nt,M.width,M.height):s.renderbufferStorage(s.RENDERBUFFER,nt,M.width,M.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function he(C,M,O){let W=M.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(s.FRAMEBUFFER,C),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let $=n.get(M.depthTexture);if($.__renderTarget=M,(!$.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),W){if($.__webglInit===void 0&&($.__webglInit=!0,M.depthTexture.addEventListener("dispose",R)),$.__webglTexture===void 0){$.__webglTexture=s.createTexture(),e.bindTexture(s.TEXTURE_CUBE_MAP,$.__webglTexture),ee(s.TEXTURE_CUBE_MAP,M.depthTexture);let yt=r.convert(M.depthTexture.format),zt=r.convert(M.depthTexture.type),bt;M.depthTexture.format===Ai?bt=s.DEPTH_COMPONENT24:M.depthTexture.format===Ms&&(bt=s.DEPTH24_STENCIL8);for(let Mt=0;Mt<6;Mt++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,0,bt,M.width,M.height,0,yt,zt,null)}}else rt(M.depthTexture,0);let dt=$.__webglTexture,ft=Zt(M),j=W?s.TEXTURE_CUBE_MAP_POSITIVE_X+O:s.TEXTURE_2D,nt=M.depthTexture.format===Ms?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(M.depthTexture.format===Ai)$t(M)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,nt,j,dt,0,ft):s.framebufferTexture2D(s.FRAMEBUFFER,nt,j,dt,0);else if(M.depthTexture.format===Ms)$t(M)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,nt,j,dt,0,ft):s.framebufferTexture2D(s.FRAMEBUFFER,nt,j,dt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function st(C){let M=n.get(C),O=C.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==C.depthTexture){let W=C.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),W){let $=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,W.removeEventListener("dispose",$)};W.addEventListener("dispose",$),M.__depthDisposeCallback=$}M.__boundDepthTexture=W}if(C.depthTexture&&!M.__autoAllocateDepthBuffer)if(O)for(let W=0;W<6;W++)he(M.__webglFramebuffer[W],C,W);else{let W=C.texture.mipmaps;W&&W.length>0?he(M.__webglFramebuffer[0],C,0):he(M.__webglFramebuffer,C,0)}else if(O){M.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(e.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer[W]),M.__webglDepthbuffer[W]===void 0)M.__webglDepthbuffer[W]=s.createRenderbuffer(),Xt(M.__webglDepthbuffer[W],C,!1);else{let $=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,dt=M.__webglDepthbuffer[W];s.bindRenderbuffer(s.RENDERBUFFER,dt),s.framebufferRenderbuffer(s.FRAMEBUFFER,$,s.RENDERBUFFER,dt)}}else{let W=C.texture.mipmaps;if(W&&W.length>0?e.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer[0]):e.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=s.createRenderbuffer(),Xt(M.__webglDepthbuffer,C,!1);else{let $=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,dt=M.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,dt),s.framebufferRenderbuffer(s.FRAMEBUFFER,$,s.RENDERBUFFER,dt)}}e.bindFramebuffer(s.FRAMEBUFFER,null)}function lt(C,M,O){let W=n.get(C);M!==void 0&&St(W.__webglFramebuffer,C,C.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),O!==void 0&&st(C)}function ct(C){let M=C.texture,O=n.get(C),W=n.get(M);C.addEventListener("dispose",y);let $=C.textures,dt=C.isWebGLCubeRenderTarget===!0,ft=$.length>1;if(ft||(W.__webglTexture===void 0&&(W.__webglTexture=s.createTexture()),W.__version=M.version,a.memory.textures++),dt){O.__webglFramebuffer=[];for(let j=0;j<6;j++)if(M.mipmaps&&M.mipmaps.length>0){O.__webglFramebuffer[j]=[];for(let nt=0;nt<M.mipmaps.length;nt++)O.__webglFramebuffer[j][nt]=s.createFramebuffer()}else O.__webglFramebuffer[j]=s.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){O.__webglFramebuffer=[];for(let j=0;j<M.mipmaps.length;j++)O.__webglFramebuffer[j]=s.createFramebuffer()}else O.__webglFramebuffer=s.createFramebuffer();if(ft)for(let j=0,nt=$.length;j<nt;j++){let yt=n.get($[j]);yt.__webglTexture===void 0&&(yt.__webglTexture=s.createTexture(),a.memory.textures++)}if(C.samples>0&&$t(C)===!1){O.__webglMultisampledFramebuffer=s.createFramebuffer(),O.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let j=0;j<$.length;j++){let nt=$[j];O.__webglColorRenderbuffer[j]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,O.__webglColorRenderbuffer[j]);let yt=r.convert(nt.format,nt.colorSpace),zt=r.convert(nt.type),bt=v(nt.internalFormat,yt,zt,nt.normalized,nt.colorSpace,C.isXRRenderTarget===!0),Mt=Zt(C);s.renderbufferStorageMultisample(s.RENDERBUFFER,Mt,bt,C.width,C.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+j,s.RENDERBUFFER,O.__webglColorRenderbuffer[j])}s.bindRenderbuffer(s.RENDERBUFFER,null),C.depthBuffer&&(O.__webglDepthRenderbuffer=s.createRenderbuffer(),Xt(O.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(dt){e.bindTexture(s.TEXTURE_CUBE_MAP,W.__webglTexture),ee(s.TEXTURE_CUBE_MAP,M);for(let j=0;j<6;j++)if(M.mipmaps&&M.mipmaps.length>0)for(let nt=0;nt<M.mipmaps.length;nt++)St(O.__webglFramebuffer[j][nt],C,M,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+j,nt);else St(O.__webglFramebuffer[j],C,M,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0);m(M)&&x(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ft){for(let j=0,nt=$.length;j<nt;j++){let yt=$[j],zt=n.get(yt),bt=s.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(bt=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(bt,zt.__webglTexture),ee(bt,yt),St(O.__webglFramebuffer,C,yt,s.COLOR_ATTACHMENT0+j,bt,0),m(yt)&&x(bt)}e.unbindTexture()}else{let j=s.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(j=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(j,W.__webglTexture),ee(j,M),M.mipmaps&&M.mipmaps.length>0)for(let nt=0;nt<M.mipmaps.length;nt++)St(O.__webglFramebuffer[nt],C,M,s.COLOR_ATTACHMENT0,j,nt);else St(O.__webglFramebuffer,C,M,s.COLOR_ATTACHMENT0,j,0);m(M)&&x(j),e.unbindTexture()}C.depthBuffer&&st(C)}function ht(C){let M=C.textures;for(let O=0,W=M.length;O<W;O++){let $=M[O];if(m($)){let dt=b(C),ft=n.get($).__webglTexture;e.bindTexture(dt,ft),x(dt),e.unbindTexture()}}}let xt=[],qt=[];function Gt(C){if(C.samples>0){if($t(C)===!1){let M=C.textures,O=C.width,W=C.height,$=s.COLOR_BUFFER_BIT,dt=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ft=n.get(C),j=M.length>1;if(j)for(let yt=0;yt<M.length;yt++)e.bindFramebuffer(s.FRAMEBUFFER,ft.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+yt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,ft.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+yt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,ft.__webglMultisampledFramebuffer);let nt=C.texture.mipmaps;nt&&nt.length>0?e.bindFramebuffer(s.DRAW_FRAMEBUFFER,ft.__webglFramebuffer[0]):e.bindFramebuffer(s.DRAW_FRAMEBUFFER,ft.__webglFramebuffer);for(let yt=0;yt<M.length;yt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&($|=s.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&($|=s.STENCIL_BUFFER_BIT)),j){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,ft.__webglColorRenderbuffer[yt]);let zt=n.get(M[yt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,zt,0)}s.blitFramebuffer(0,0,O,W,0,0,O,W,$,s.NEAREST),l===!0&&(xt.length=0,qt.length=0,xt.push(s.COLOR_ATTACHMENT0+yt),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(xt.push(dt),qt.push(dt),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,qt)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,xt))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),j)for(let yt=0;yt<M.length;yt++){e.bindFramebuffer(s.FRAMEBUFFER,ft.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+yt,s.RENDERBUFFER,ft.__webglColorRenderbuffer[yt]);let zt=n.get(M[yt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,ft.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+yt,s.TEXTURE_2D,zt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,ft.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let M=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[M])}}}function Zt(C){return Math.min(i.maxSamples,C.samples)}function $t(C){let M=n.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function D(C){let M=a.render.frame;h.get(C)!==M&&(h.set(C,M),C.update())}function fe(C,M){let O=C.colorSpace,W=C.format,$=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||O!==fa&&O!==Ki&&(ce.getTransfer(O)===ge?(W!==si||$!==zn)&&Jt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Kt("WebGLTextures: Unsupported texture color space:",O)),M}function ne(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=J,this.resetTextureUnits=k,this.getTextureUnits=N,this.setTextureUnits=z,this.setTexture2D=rt,this.setTexture2DArray=Z,this.setTexture3D=tt,this.setTextureCube=it,this.rebindTextures=lt,this.setupRenderTarget=ct,this.updateRenderTargetMipmap=ht,this.updateMultisampleRenderTarget=Gt,this.setupDepthRenderbuffer=st,this.setupFrameBufferTexture=St,this.useMultisampledRTT=$t,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function yy(s,t){function e(n,i=Ki){let r,a=ce.getTransfer(i);if(n===zn)return s.UNSIGNED_BYTE;if(n===Bl)return s.UNSIGNED_SHORT_4_4_4_4;if(n===Ol)return s.UNSIGNED_SHORT_5_5_5_1;if(n===Jh)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===Kh)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===Yh)return s.BYTE;if(n===Zh)return s.SHORT;if(n===Rr)return s.UNSIGNED_SHORT;if(n===Fl)return s.INT;if(n===mi)return s.UNSIGNED_INT;if(n===ii)return s.FLOAT;if(n===cn)return s.HALF_FLOAT;if(n===$h)return s.ALPHA;if(n===jh)return s.RGB;if(n===si)return s.RGBA;if(n===Ai)return s.DEPTH_COMPONENT;if(n===Ms)return s.DEPTH_STENCIL;if(n===zl)return s.RED;if(n===Hl)return s.RED_INTEGER;if(n===bs)return s.RG;if(n===kl)return s.RG_INTEGER;if(n===Vl)return s.RGBA_INTEGER;if(n===ja||n===Qa||n===to||n===eo)if(a===ge)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===ja)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Qa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===to)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===eo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===ja)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Qa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===to)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===eo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Gl||n===Wl||n===Xl||n===ql)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Gl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Wl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Xl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ql)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Yl||n===Zl||n===Jl||n===Kl||n===$l||n===no||n===jl)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Yl||n===Zl)return a===ge?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Jl)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Kl)return r.COMPRESSED_R11_EAC;if(n===$l)return r.COMPRESSED_SIGNED_R11_EAC;if(n===no)return r.COMPRESSED_RG11_EAC;if(n===jl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ql||n===tc||n===ec||n===nc||n===ic||n===sc||n===rc||n===ac||n===oc||n===lc||n===cc||n===hc||n===uc||n===dc)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ql)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===tc)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===ec)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===nc)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ic)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===sc)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===rc)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ac)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===oc)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===lc)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===cc)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===hc)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===uc)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===dc)return a===ge?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===fc||n===pc||n===mc)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===fc)return a===ge?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===pc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===mc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===gc||n===xc||n===io||n===_c)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===gc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===xc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===io)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===_c)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Cr?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:e}}var My=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,by=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,wu=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new Sa(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new Ue({vertexShader:My,fragmentShader:by,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new gt(new gn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Tu=class extends Ri{constructor(t,e){super();let n=this,i=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,g=null,_=typeof XRWebGLBinding<"u",p=new wu,m={},x=e.getContextAttributes(),b=null,v=null,S=[],w=[],R=new at,y=null,A=null,P=new on;P.viewport=new Ve;let L=new on;L.viewport=new Ve;let F=[P,L],k=new Il,N=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let Q=S[X];return Q===void 0&&(Q=new Mr,S[X]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(X){let Q=S[X];return Q===void 0&&(Q=new Mr,S[X]=Q),Q.getGripSpace()},this.getHand=function(X){let Q=S[X];return Q===void 0&&(Q=new Mr,S[X]=Q),Q.getHandSpace()};function J(X){let Q=w.indexOf(X.inputSource);if(Q===-1)return;let _t=S[Q];_t!==void 0&&(_t.update(X.inputSource,X.frame,c||a),_t.dispatchEvent({type:X.type,data:X.inputSource}))}function Y(){i.removeEventListener("select",J),i.removeEventListener("selectstart",J),i.removeEventListener("selectend",J),i.removeEventListener("squeeze",J),i.removeEventListener("squeezestart",J),i.removeEventListener("squeezeend",J),i.removeEventListener("end",Y),i.removeEventListener("inputsourceschange",rt);for(let X=0;X<S.length;X++){let Q=w[X];Q!==null&&(w[X]=null,S[X].disconnect(Q))}N=null,z=null,p.reset();for(let X in m)delete m[X];if(t.setRenderTarget(b),f=null,d=null,u=null,i=null,v=null,ie.stop(),n.isPresenting=!1,t.setPixelRatio(y),t.setSize(R.width,R.height,!1),A!==null){let X=A.camera;X.fov=A.fov,X.zoom=A.zoom,X.updateProjectionMatrix(),A=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,n.isPresenting===!0&&Jt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){o=X,n.isPresenting===!0&&Jt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(i,e)),u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(X){if(i=X,i!==null){if(b=t.getRenderTarget(),i.addEventListener("select",J),i.addEventListener("selectstart",J),i.addEventListener("selectend",J),i.addEventListener("squeeze",J),i.addEventListener("squeezestart",J),i.addEventListener("squeezeend",J),i.addEventListener("end",Y),i.addEventListener("inputsourceschange",rt),x.xrCompatible!==!0&&await e.makeXRCompatible(),y=t.getPixelRatio(),t.getSize(R),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let _t=null,Vt=null,St=null;x.depth&&(St=x.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,_t=x.stencil?Ms:Ai,Vt=x.stencil?Cr:mi);let Xt={colorFormat:e.RGBA8,depthFormat:St,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Xt),i.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),v=new $e(d.textureWidth,d.textureHeight,{format:si,type:zn,depthTexture:new fs(d.textureWidth,d.textureHeight,Vt,void 0,void 0,void 0,void 0,void 0,void 0,_t),stencilBuffer:x.stencil,colorSpace:t.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let _t={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,e,_t),i.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new $e(f.framebufferWidth,f.framebufferHeight,{format:si,type:zn,colorSpace:t.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),ie.setContext(i),ie.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function rt(X){for(let Q=0;Q<X.removed.length;Q++){let _t=X.removed[Q],Vt=w.indexOf(_t);Vt>=0&&(w[Vt]=null,S[Vt].disconnect(_t))}for(let Q=0;Q<X.added.length;Q++){let _t=X.added[Q],Vt=w.indexOf(_t);if(Vt===-1){for(let Xt=0;Xt<S.length;Xt++)if(Xt>=w.length){w.push(_t),Vt=Xt;break}else if(w[Xt]===null){w[Xt]=_t,Vt=Xt;break}if(Vt===-1)break}let St=S[Vt];St&&St.connect(_t)}}let Z=new T,tt=new T;function it(X,Q,_t){Z.setFromMatrixPosition(Q.matrixWorld),tt.setFromMatrixPosition(_t.matrixWorld);let Vt=Z.distanceTo(tt),St=Q.projectionMatrix.elements,Xt=_t.projectionMatrix.elements,he=St[14]/(St[10]-1),st=St[14]/(St[10]+1),lt=(St[9]+1)/St[5],ct=(St[9]-1)/St[5],ht=(St[8]-1)/St[0],xt=(Xt[8]+1)/Xt[0],qt=he*ht,Gt=he*xt,Zt=Vt/(-ht+xt),$t=Zt*-ht;if(Q.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX($t),X.translateZ(Zt),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),St[10]===-1)X.projectionMatrix.copy(Q.projectionMatrix),X.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{let D=he+Zt,fe=st+Zt,ne=qt-$t,C=Gt+(Vt-$t),M=lt*st/fe*D,O=ct*st/fe*D;X.projectionMatrix.makePerspective(ne,C,M,O,D,fe),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function It(X,Q){Q===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(Q.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(i===null)return;let Q=X.near,_t=X.far;p.texture!==null&&(p.depthNear>0&&(Q=p.depthNear),p.depthFar>0&&(_t=p.depthFar)),k.near=L.near=P.near=Q,k.far=L.far=P.far=_t,(N!==k.near||z!==k.far)&&(i.updateRenderState({depthNear:k.near,depthFar:k.far}),N=k.near,z=k.far),k.layers.mask=X.layers.mask|6,P.layers.mask=k.layers.mask&-5,L.layers.mask=k.layers.mask&-3;let Vt=X.parent,St=k.cameras;It(k,Vt);for(let Xt=0;Xt<St.length;Xt++)It(St[Xt],Vt);St.length===2?it(k,P,L):k.projectionMatrix.copy(P.projectionMatrix),A===null&&X.isPerspectiveCamera&&(A={camera:X,fov:X.fov,zoom:X.zoom}),Rt(X,k,Vt)};function Rt(X,Q,_t){_t===null?X.matrix.copy(Q.matrixWorld):(X.matrix.copy(_t.matrixWorld),X.matrix.invert(),X.matrix.multiply(Q.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(Q.projectionMatrix),X.projectionMatrixInverse.copy(Q.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=vr*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(X){l=X,d!==null&&(d.fixedFoveation=X),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=X)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(k)},this.getCameraTexture=function(X){return m[X]};let re=null;function ee(X,Q){if(h=Q.getViewerPose(c||a),g=Q,h!==null){let _t=h.views;f!==null&&(t.setRenderTargetFramebuffer(v,f.framebuffer),t.setRenderTarget(v));let Vt=!1;_t.length!==k.cameras.length&&(k.cameras.length=0,Vt=!0);for(let st=0;st<_t.length;st++){let lt=_t[st],ct=null;if(f!==null)ct=f.getViewport(lt);else{let xt=u.getViewSubImage(d,lt);ct=xt.viewport,st===0&&(t.setRenderTargetTextures(v,xt.colorTexture,xt.depthStencilTexture),t.setRenderTarget(v))}let ht=F[st];ht===void 0&&(ht=new on,ht.layers.enable(st),ht.viewport=new Ve,F[st]=ht),ht.matrix.fromArray(lt.transform.matrix),ht.matrix.decompose(ht.position,ht.quaternion,ht.scale),ht.projectionMatrix.fromArray(lt.projectionMatrix),ht.projectionMatrixInverse.copy(ht.projectionMatrix).invert(),ht.viewport.set(ct.x,ct.y,ct.width,ct.height),st===0&&(k.matrix.copy(ht.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),Vt===!0&&k.cameras.push(ht)}let St=i.enabledFeatures;if(St&&St.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&_){u=n.getBinding();let st=u.getDepthInformation(_t[0]);st&&st.isValid&&st.texture&&p.init(st,i.renderState)}if(St&&St.includes("camera-access")&&_){t.state.unbindTexture(),u=n.getBinding();for(let st=0;st<_t.length;st++){let lt=_t[st].camera;if(lt){let ct=m[lt];ct||(ct=new Sa,m[lt]=ct);let ht=u.getCameraImage(lt);ct.sourceTexture=ht}}}}for(let _t=0;_t<S.length;_t++){let Vt=w[_t],St=S[_t];Vt!==null&&St!==void 0&&St.update(Vt,Q,c||a)}re&&re(X,Q),Q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Q}),g=null}let ie=new np;ie.setAnimationLoop(ee),this.setAnimationLoop=function(X){re=X},this.dispose=function(){}}},Sy=new we,lp=new jt;lp.set(-1,0,0,0,1,0,0,0,1);function Ey(s,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function n(p,m){m.color.getRGB(p.fogColor.value,iu(s)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function i(p,m,x,b,v){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(p,m):m.isMeshLambertMaterial?(r(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(p,m),u(p,m)):m.isMeshPhongMaterial?(r(p,m),h(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(p,m),d(p,m),m.isMeshPhysicalMaterial&&f(p,m,v)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),_(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(a(p,m),m.isLineDashedMaterial&&o(p,m)):m.isPointsMaterial?l(p,m,x,b):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===yn&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===yn&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let x=t.get(m),b=x.envMap,v=x.envMapRotation;b&&(p.envMap.value=b,p.envMapRotation.value.setFromMatrix4(Sy.makeRotationFromEuler(v)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(lp),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function a(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function o(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,x,b){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*x,p.scale.value=b*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function u(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function d(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,x){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===yn&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.retroreflectivity>0&&(p.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=x.texture,p.transmissionSamplerSize.value.set(x.width,x.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function _(p,m){let x=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(x.matrixWorld),p.nearDistance.value=x.shadow.camera.near,p.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function wy(s,t,e,n){let i={},r={},a=[],o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,S){let w=S.program;n.uniformBlockBinding(v,w)}function c(v,S){let w=i[v.id];w===void 0&&(p(v),w=h(v),i[v.id]=w,v.addEventListener("dispose",x));let R=S.program;n.updateUBOMapping(v,R);let y=t.render.frame;r[v.id]!==y&&(d(v),r[v.id]=y)}function h(v){let S=u();v.__bindingPointIndex=S;let w=s.createBuffer(),R=v.__size,y=v.usage;return s.bindBuffer(s.UNIFORM_BUFFER,w),s.bufferData(s.UNIFORM_BUFFER,R,y),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,S,w),w}function u(){for(let v=0;v<o;v++)if(a.indexOf(v)===-1)return a.push(v),v;return Kt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(v){let S=i[v.id],w=v.uniforms,R=v.__cache;s.bindBuffer(s.UNIFORM_BUFFER,S);for(let y=0,A=w.length;y<A;y++){let P=w[y];if(Array.isArray(P))for(let L=0,F=P.length;L<F;L++)f(P[L],y,L,R);else f(P,y,0,R)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(v,S,w,R){if(_(v,S,w,R)===!0){let y=v.__offset,A=v.value;if(Array.isArray(A)){let P=0;for(let L=0;L<A.length;L++){let F=A[L],k=m(F);g(F,v.__data,P),typeof F!="number"&&typeof F!="boolean"&&!F.isMatrix3&&!ArrayBuffer.isView(F)&&(P+=k.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(A,v.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,y,v.__data)}}function g(v,S,w){typeof v=="number"||typeof v=="boolean"?S[0]=v:v.isMatrix3?(S[0]=v.elements[0],S[1]=v.elements[1],S[2]=v.elements[2],S[3]=0,S[4]=v.elements[3],S[5]=v.elements[4],S[6]=v.elements[5],S[7]=0,S[8]=v.elements[6],S[9]=v.elements[7],S[10]=v.elements[8],S[11]=0):ArrayBuffer.isView(v)?S.set(new v.constructor(v.buffer,v.byteOffset,S.length)):v.toArray(S,w)}function _(v,S,w,R){let y=v.value,A=S+"_"+w;if(R[A]===void 0)return typeof y=="number"||typeof y=="boolean"?R[A]=y:ArrayBuffer.isView(y)?R[A]=y.slice():R[A]=y.clone(),!0;{let P=R[A];if(typeof y=="number"||typeof y=="boolean"){if(P!==y)return R[A]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(P.equals(y)===!1)return P.copy(y),!0}}return!1}function p(v){let S=v.uniforms,w=0,R=16;for(let A=0,P=S.length;A<P;A++){let L=Array.isArray(S[A])?S[A]:[S[A]];for(let F=0,k=L.length;F<k;F++){let N=L[F],z=Array.isArray(N.value)?N.value:[N.value];for(let J=0,Y=z.length;J<Y;J++){let rt=z[J],Z=m(rt),tt=w%R,it=tt%Z.boundary,It=tt+it;w+=it,It!==0&&R-It<Z.storage&&(w+=R-It),N.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=w,w+=Z.storage}}}let y=w%R;return y>0&&(w+=R-y),v.__size=w,v.__cache={},this}function m(v){let S={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(S.boundary=4,S.storage=4):v.isVector2?(S.boundary=8,S.storage=8):v.isVector3||v.isColor?(S.boundary=16,S.storage=12):v.isVector4?(S.boundary=16,S.storage=16):v.isMatrix3?(S.boundary=48,S.storage=48):v.isMatrix4?(S.boundary=64,S.storage=64):v.isTexture?Jt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(S.boundary=16,S.storage=v.byteLength):Jt("WebGLRenderer: Unsupported uniform value type.",v),S}function x(v){let S=v.target;S.removeEventListener("dispose",x);let w=a.indexOf(S.__bindingPointIndex);a.splice(w,1),s.deleteBuffer(i[S.id]),delete i[S.id],delete r[S.id]}function b(){for(let v in i)s.deleteBuffer(i[v]);a=[],i={},r={}}return{bind:l,update:c,dispose:b}}var Ty=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Ni=null;function Ay(){return Ni===null&&(Ni=new Ma(Ty,16,16,bs,cn),Ni.name="DFG_LUT",Ni.minFilter=vn,Ni.magFilter=vn,Ni.wrapS=Ei,Ni.wrapT=Ei,Ni.generateMipmaps=!1,Ni.needsUpdate=!0),Ni}var wc=class{constructor(t={}){let{canvas:e=Ef(),context:n=null,depth:i=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=zn}=t;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;let _=f,p=new Set([Vl,kl,Hl]),m=new Set([zn,mi,Rr,Cr,Bl,Ol]),x=new Uint32Array(4),b=new Int32Array(4),v=new T,S=null,w=null,R=[],y=[],A=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=pi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,L=!1,F=null,k=null,N=null,z=null;this._outputColorSpace=Ke;let J=0,Y=0,rt=null,Z=-1,tt=null,it=new Ve,It=new Ve,Rt=null,re=new Pt(0),ee=0,ie=e.width,X=e.height,Q=1,_t=null,Vt=null,St=new Ve(0,0,ie,X),Xt=new Ve(0,0,ie,X),he=!1,st=new br,lt=!1,ct=!1,ht=new we,xt=new T,qt=new Ve,Gt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Zt=!1;function $t(){return rt===null?Q:1}let D=n;function fe(E,U){return e.getContext(E,U)}let ne,C,M,O,W,$,dt,ft,j,nt,yt,zt,bt,Mt,Ht,Wt,Qt,B,vt,et,pt,Et,I;try{let E={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",ut,!1),e.addEventListener("webglcontextrestored",mt,!1),e.addEventListener("webglcontextcreationerror",Yt,!1),D===null){let U="webgl2";if(D=fe(U,E),D===null)throw fe(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}H()}catch(E){throw e.removeEventListener("webglcontextlost",ut,!1),e.removeEventListener("webglcontextrestored",mt,!1),e.removeEventListener("webglcontextcreationerror",Yt,!1),Kt("WebGLRenderer: "+E.message),E}function H(){ne=new N_(D),ne.init(),pt=new yy(D,ne),C=new E_(D,ne,t,pt),M=new _y(D,ne),C.reversedDepthBuffer&&d&&M.buffers.depth.setReversed(!0),k=D.createFramebuffer(),N=D.createFramebuffer(),z=D.createFramebuffer(),O=new B_(D),W=new sy,$=new vy(D,ne,M,W,C,pt,O),dt=new D_(P),ft=new z0(D),Et=new b_(D,ft),j=new U_(D,ft,O,Et),nt=new z_(D,j,ft,Et,O),B=new O_(D,C,$),Ht=new w_(W),yt=new iy(P,dt,ne,C,Et,Ht),zt=new Ey(P,W),bt=new ay,Mt=new dy(ne),Qt=new M_(P,dt,M,nt,g,l),Wt=new xy(P,nt,C),I=new wy(D,O,C,M),vt=new S_(D,ne,O),et=new F_(D,ne,O),O.programs=yt.programs,P.capabilities=C,P.extensions=ne,P.properties=W,P.renderLists=bt,P.shadowMap=Wt,P.state=M,P.info=O}_!==zn&&(A=new k_(_,e.width,e.height,o,i,r));let K=new Tu(P,D);this.xr=K,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let E=ne.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=ne.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(E){E!==void 0&&(Q=E,this.setSize(ie,X,!1))},this.getSize=function(E){return E.set(ie,X)},this.setSize=function(E,U,q=!0){if(K.isPresenting){Jt("WebGLRenderer: Can't change size while VR device is presenting.");return}ie=E,X=U,e.width=Math.floor(E*Q),e.height=Math.floor(U*Q),q===!0&&(e.style.width=E+"px",e.style.height=U+"px"),A!==null&&A.setSize(e.width,e.height),this.setViewport(0,0,E,U)},this.getDrawingBufferSize=function(E){return E.set(ie*Q,X*Q).floor()},this.setDrawingBufferSize=function(E,U,q){ie=E,X=U,Q=q,e.width=Math.floor(E*q),e.height=Math.floor(U*q),this.setViewport(0,0,E,U)},this.setEffects=function(E){if(_===zn){Kt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(E){for(let U=0;U<E.length;U++)if(E[U].isOutputPass===!0){Jt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(E||[])},this.getCurrentViewport=function(E){return E.copy(it)},this.getViewport=function(E){return E.copy(St)},this.setViewport=function(E,U,q,V){E.isVector4?St.set(E.x,E.y,E.z,E.w):St.set(E,U,q,V),M.viewport(it.copy(St).multiplyScalar(Q).round())},this.getScissor=function(E){return E.copy(Xt)},this.setScissor=function(E,U,q,V){E.isVector4?Xt.set(E.x,E.y,E.z,E.w):Xt.set(E,U,q,V),M.scissor(It.copy(Xt).multiplyScalar(Q).round())},this.getScissorTest=function(){return he},this.setScissorTest=function(E){M.setScissorTest(he=E)},this.setOpaqueSort=function(E){_t=E},this.setTransparentSort=function(E){Vt=E},this.getClearColor=function(E){return E.copy(Qt.getClearColor())},this.setClearColor=function(){Qt.setClearColor(...arguments)},this.getClearAlpha=function(){return Qt.getClearAlpha()},this.setClearAlpha=function(){Qt.setClearAlpha(...arguments)},this.clear=function(E=!0,U=!0,q=!0){let V=0;if(E){let G=!1;if(rt!==null){let At=rt.texture.format;G=p.has(At)}if(G){let At=rt.texture.type,Dt=m.has(At),Tt=Qt.getClearColor(),Ut=Qt.getClearAlpha(),kt=Tt.r,ae=Tt.g,ue=Tt.b;Dt?(x[0]=kt,x[1]=ae,x[2]=ue,x[3]=Ut,D.clearBufferuiv(D.COLOR,0,x)):(b[0]=kt,b[1]=ae,b[2]=ue,b[3]=Ut,D.clearBufferiv(D.COLOR,0,b))}else V|=D.COLOR_BUFFER_BIT}U&&(V|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(V|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&D.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),F=E},this.dispose=function(){e.removeEventListener("webglcontextlost",ut,!1),e.removeEventListener("webglcontextrestored",mt,!1),e.removeEventListener("webglcontextcreationerror",Yt,!1),Qt.dispose(),bt.dispose(),Mt.dispose(),W.dispose(),dt.dispose(),nt.dispose(),Et.dispose(),I.dispose(),yt.dispose(),K.dispose(),K.removeEventListener("sessionstart",Bn),K.removeEventListener("sessionend",vi),On.stop()};function ut(E){E.preventDefault(),tu("WebGLRenderer: Context Lost."),L=!0}function mt(){tu("WebGLRenderer: Context Restored."),L=!1;let E=O.autoReset,U=Wt.enabled,q=Wt.autoUpdate,V=Wt.needsUpdate,G=Wt.type;H(),O.autoReset=E,Wt.enabled=U,Wt.autoUpdate=q,Wt.needsUpdate=V,Wt.type=G}function Yt(E){Kt("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Ct(E){let U=E.target;U.removeEventListener("dispose",Ct),Se(U)}function Se(E){pe(E),W.remove(E)}function pe(E){let U=W.get(E).programs;U!==void 0&&(U.forEach(function(q){yt.releaseProgram(q)}),E.isShaderMaterial&&yt.releaseShaderCache(E))}this.renderBufferDirect=function(E,U,q,V,G,At){U===null&&(U=Gt);let Dt=G.isMesh&&G.matrixWorld.determinantAffine()<0,Tt=So(E,U,q,V,G);M.setMaterial(V,Dt);let Ut=q.index,kt=1;if(V.wireframe===!0){if(Ut=j.getWireframeAttribute(q),Ut===void 0)return;kt=2}let ae=q.drawRange,ue=q.attributes.position,Ft=ae.start*kt,ye=(ae.start+ae.count)*kt;At!==null&&(Ft=Math.max(Ft,At.start*kt),ye=Math.min(ye,(At.start+At.count)*kt)),Ut!==null?(Ft=Math.max(Ft,0),ye=Math.min(ye,Ut.count)):ue!=null&&(Ft=Math.max(Ft,0),ye=Math.min(ye,ue.count));let nn=ye-Ft;if(nn<0||nn===1/0)return;Et.setup(G,V,Tt,q,Ut);let ze,Pe=vt;if(Ut!==null&&(ze=ft.get(Ut),Pe=et,Pe.setIndex(ze)),G.isMesh)V.wireframe===!0?(M.setLineWidth(V.wireframeLinewidth*$t()),Pe.setMode(D.LINES)):Pe.setMode(D.TRIANGLES);else if(G.isLine){let Sn=V.linewidth;Sn===void 0&&(Sn=1),M.setLineWidth(Sn*$t()),G.isLineSegments?Pe.setMode(D.LINES):G.isLineLoop?Pe.setMode(D.LINE_LOOP):Pe.setMode(D.LINE_STRIP)}else G.isPoints?Pe.setMode(D.POINTS):G.isSprite&&Pe.setMode(D.TRIANGLES);if(G.isBatchedMesh)if(ne.get("WEBGL_multi_draw"))Pe.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{let Sn=G._multiDrawStarts,Lt=G._multiDrawCounts,In=G._multiDrawCount,me=Ut?ft.get(Ut).bytesPerElement:1,ti=W.get(V).currentProgram.getUniforms();for(let bi=0;bi<In;bi++)ti.setValue(D,"_gl_DrawID",bi),Pe.render(Sn[bi]/me,Lt[bi])}else if(G.isInstancedMesh)Pe.renderInstances(Ft,nn,G.count);else if(q.isInstancedBufferGeometry){let Sn=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,Lt=Math.min(q.instanceCount,Sn);Pe.renderInstances(Ft,nn,Lt)}else Pe.render(Ft,nn)};function Ee(E,U,q,V){F!==null&&E.isNodeMaterial&&F.setObject(V,E),lt===!0&&Ht.setState(E,q,!1),E.transparent===!0&&E.side===ve&&E.forceSinglePass===!1?(E.side=yn,E.needsUpdate=!0,es(E,U,V),E.side=_s,E.needsUpdate=!0,es(E,U,V),E.side=ve):es(E,U,V)}this.compile=function(E,U,q=null){q===null&&(q=E),F!==null&&F.renderStart(E,U,q),w=Mt.get(q),w.init(U),y.push(w),q.traverseVisible(function(G){G.isLight&&G.layers.test(U.layers)&&(w.pushLight(G),G.castShadow&&w.pushShadow(G))}),E!==q&&E.traverseVisible(function(G){G.isLight&&G.layers.test(U.layers)&&(w.pushLight(G),G.castShadow&&w.pushShadow(G))}),w.setupLights(),F!==null&&F.updateLights(w.state.lightsArray),ct=this.localClippingEnabled,lt=Ht.init(this.clippingPlanes,ct),lt===!0&&Ht.setGlobalState(this.clippingPlanes,U),F!==null&&Wt.render(w.state.shadowsArray,q,U);let V=new Set;return E.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;let At=G.material;if(At)if(Array.isArray(At))for(let Dt=0;Dt<At.length;Dt++){let Tt=At[Dt];Ee(Tt,q,U,G),V.add(Tt)}else Ee(At,q,U,G),V.add(At)}),w=y.pop(),F!==null&&F.renderEnd(),V},this.compileAsync=function(E,U,q=null){let V=this.compile(E,U,q);return new Promise(G=>{function At(){if(V.forEach(function(Dt){let Ut=W.get(Dt).currentProgram;(Ut===void 0||Ut.isReady())&&V.delete(Dt)}),V.size===0){G(E);return}setTimeout(At,10)}ne.get("KHR_parallel_shader_compile")!==null?At():setTimeout(At,10)})};let Le=null;function Qn(E){Le&&Le(E)}function Bn(){On.stop()}function vi(){On.start()}let On=new np;On.setAnimationLoop(Qn),typeof self<"u"&&On.setContext(self),this.setAnimationLoop=function(E){Le=E,K.setAnimationLoop(E),E===null?On.stop():On.start()},K.addEventListener("sessionstart",Bn),K.addEventListener("sessionend",vi),this.render=function(E,U){if(U!==void 0&&U.isCamera!==!0){Kt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;F!==null&&F.renderStart(E,U);let q=K.enabled===!0&&K.isPresenting===!0,V=A!==null&&(rt===null||q)&&A.begin(P,rt);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),K.enabled===!0&&K.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(K.cameraAutoUpdate===!0&&K.updateCamera(U),U=K.getCamera()),E.isScene===!0&&E.onBeforeRender(P,E,U,rt),w=Mt.get(E,y.length),w.init(U),w.state.textureUnits=$.getTextureUnits(),y.push(w),ht.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),st.setFromProjectionMatrix(ht,fi,U.reversedDepth),ct=this.localClippingEnabled,lt=Ht.init(this.clippingPlanes,ct),S=bt.get(E,R.length),S.init(),R.push(S),K.enabled===!0&&K.isPresenting===!0){let Dt=P.xr.getDepthSensingMesh();Dt!==null&&yi(Dt,U,-1/0,P.sortObjects)}yi(E,U,0,P.sortObjects),S.finish(),F!==null&&F.updateLights(w.state.lightsArray),P.sortObjects===!0&&S.sort(_t,Vt),Zt=K.enabled===!1||K.isPresenting===!1||K.hasDepthSensing()===!1,Zt&&Qt.addToRenderList(S,E),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),lt===!0&&Ht.beginShadows();let G=w.state.shadowsArray;if(Wt.render(G,E,U),lt===!0&&Ht.endShadows(),(V&&A.hasRenderPass())===!1){let Dt=S.opaque,Tt=S.transmissive;if(w.setupLights(),U.isArrayCamera){let Ut=U.cameras;if(Tt.length>0)for(let kt=0,ae=Ut.length;kt<ae;kt++){let ue=Ut[kt];ts(Dt,Tt,E,ue)}Zt&&Qt.render(E);for(let kt=0,ae=Ut.length;kt<ae;kt++){let ue=Ut[kt];Mi(S,E,ue,ue.viewport)}}else Tt.length>0&&ts(Dt,Tt,E,U),Zt&&Qt.render(E),Mi(S,E,U)}rt!==null&&Y===0&&($.updateMultisampleRenderTarget(rt),$.updateRenderTargetMipmap(rt)),V&&A.end(P),E.isScene===!0&&E.onAfterRender(P,E,U),Et.resetDefaultState(),Z=-1,tt=null,y.pop(),y.length>0?(w=y[y.length-1],$.setTextureUnits(w.state.textureUnits),lt===!0&&Ht.setGlobalState(P.clippingPlanes,w.state.camera)):w=null,R.pop(),R.length>0?S=R[R.length-1]:S=null,F!==null&&F.renderEnd()};function yi(E,U,q,V){if(E.visible===!1)return;if(E.layers.test(U.layers)){if(E.isGroup)q=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(U);else if(E.isLightProbeGrid)w.pushLightProbeGrid(E);else if(E.isLight)w.pushLight(E),E.castShadow&&w.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||E.intersectsFrustum(st)){V&&qt.setFromMatrixPosition(E.matrixWorld).applyMatrix4(ht);let Dt=nt.update(E),Tt=E.material;Tt.visible&&S.push(E,Dt,Tt,q,qt.z,null,U)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||E.intersectsFrustum(st))){let Dt=nt.update(E),Tt=E.material;if(V&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),qt.copy(E.boundingSphere.center)):(Dt.boundingSphere===null&&Dt.computeBoundingSphere(),qt.copy(Dt.boundingSphere.center)),qt.applyMatrix4(E.matrixWorld).applyMatrix4(ht)),Array.isArray(Tt)){let Ut=Dt.groups;for(let kt=0,ae=Ut.length;kt<ae;kt++){let ue=Ut[kt],Ft=Tt[ue.materialIndex];Ft&&Ft.visible&&S.push(E,Dt,Ft,q,qt.z,ue,U)}}else Tt.visible&&S.push(E,Dt,Tt,q,qt.z,null,U)}}let At=E.children;for(let Dt=0,Tt=At.length;Dt<Tt;Dt++)yi(At[Dt],U,q,V)}function Mi(E,U,q,V){let{opaque:G,transmissive:At,transparent:Dt}=E;w.setupLightsView(q),lt===!0&&Ht.setGlobalState(P.clippingPlanes,q),V&&M.viewport(it.copy(V)),G.length>0&&Is(G,U,q),At.length>0&&Is(At,U,q),Dt.length>0&&Is(Dt,U,q),M.buffers.depth.setTest(!0),M.buffers.depth.setMask(!0),M.buffers.color.setMask(!0),M.setPolygonOffset(!1)}function ts(E,U,q,V){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[V.id]===void 0){let Ft=ne.has("EXT_color_buffer_half_float")||ne.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[V.id]=new $e(1,1,{generateMipmaps:!0,type:Ft?cn:zn,minFilter:ys,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ce.workingColorSpace})}let At=w.state.transmissionRenderTarget[V.id],Dt=V.viewport||it;At.setSize(Dt.z*P.transmissionResolutionScale,Dt.w*P.transmissionResolutionScale);let Tt=P.getRenderTarget(),Ut=P.getActiveCubeFace(),kt=P.getActiveMipmapLevel();P.setRenderTarget(At),P.getClearColor(re),ee=P.getClearAlpha(),ee<1&&P.setClearColor(16777215,.5),P.clear(),Zt&&Qt.render(q);let ae=P.toneMapping;P.toneMapping=pi;let ue=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),w.setupLightsView(V),lt===!0&&Ht.setGlobalState(P.clippingPlanes,V),Is(E,q,V),$.updateMultisampleRenderTarget(At),$.updateRenderTargetMipmap(At),ne.has("WEBGL_multisampled_render_to_texture")===!1){let Ft=!1;for(let ye=0,nn=U.length;ye<nn;ye++){let ze=U[ye],{object:Pe,geometry:Sn,material:Lt,group:In}=ze;if(Lt.side===ve&&Pe.layers.test(V.layers)){let me=Lt.side;Lt.side=yn,Lt.needsUpdate=!0,jr(Pe,q,V,Sn,Lt,In),Lt.side=me,Lt.needsUpdate=!0,Ft=!0}}Ft===!0&&($.updateMultisampleRenderTarget(At),$.updateRenderTargetMipmap(At))}P.setRenderTarget(Tt,Ut,kt),P.setClearColor(re,ee),ue!==void 0&&(V.viewport=ue),P.toneMapping=ae}function Is(E,U,q){let V=U.isScene===!0?U.overrideMaterial:null;for(let G=0,At=E.length;G<At;G++){let Dt=E[G],{object:Tt,geometry:Ut,group:kt}=Dt,ae=Dt.material;ae.allowOverride===!0&&V!==null&&(ae=V),Tt.layers.test(q.layers)&&jr(Tt,U,q,Ut,ae,kt)}}function jr(E,U,q,V,G,At){F!==null&&G.isNodeMaterial&&F.setObject(E,G),E.onBeforeRender(P,U,q,V,G,At),E.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),G.onBeforeRender(P,U,q,V,E,At),G.transparent===!0&&G.side===ve&&G.forceSinglePass===!1?(G.side=yn,G.needsUpdate=!0,P.renderBufferDirect(q,U,V,G,E,At),G.side=_s,G.needsUpdate=!0,P.renderBufferDirect(q,U,V,G,E,At),G.side=ve):P.renderBufferDirect(q,U,V,G,E,At),E.onAfterRender(P,U,q,V,G,At)}function es(E,U,q){U.isScene!==!0&&(U=Gt);let V=W.get(E),G=w.state.lights,At=w.state.shadowsArray,Dt=G.state.version,Tt=yt.getParameters(E,G.state,At,U,q,w.state.lightProbeGridArray),Ut=yt.getProgramCacheKey(Tt),kt=V.programs;V.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?U.environment:null,V.fog=U.fog;let ae=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;V.envMap=dt.get(E.envMap||V.environment,ae),V.envMapRotation=V.environment!==null&&E.envMap===null?U.environmentRotation:E.envMapRotation,kt===void 0&&(E.addEventListener("dispose",Ct),kt=new Map,V.programs=kt);let ue=kt.get(Ut);if(ue!==void 0){if(V.currentProgram===ue&&V.lightsStateVersion===Dt)return Qr(E,Tt),ue}else Tt.uniforms=yt.getUniforms(E),F!==null&&E.isNodeMaterial&&F.build(E,q,Tt),E.onBeforeCompile(Tt,P),ue=yt.acquireProgram(Tt,Ut),kt.set(Ut,ue),V.uniforms=Tt.uniforms;let Ft=V.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ft.clippingPlanes=Ht.uniform),Qr(E,Tt),V.needsLights=sm(E),V.lightsStateVersion=Dt,V.needsLights&&(Ft.ambientLightColor.value=G.state.ambient,Ft.lightProbe.value=G.state.probe,Ft.sunLights.value=G.state.sun,Ft.sunLightShadows.value=G.state.sunShadow,Ft.directionalLights.value=G.state.directional,Ft.directionalLightShadows.value=G.state.directionalShadow,Ft.spotLights.value=G.state.spot,Ft.spotLightShadows.value=G.state.spotShadow,Ft.rectAreaLights.value=G.state.rectArea,Ft.ltc_1.value=G.state.rectAreaLTC1,Ft.ltc_2.value=G.state.rectAreaLTC2,Ft.pointLights.value=G.state.point,Ft.pointLightShadows.value=G.state.pointShadow,Ft.hemisphereLights.value=G.state.hemi,Ft.sunShadowMatrix.value=G.state.sunShadowMatrix,Ft.sunShadowCascade.value=G.state.sunShadowCascade,Ft.directionalShadowMatrix.value=G.state.directionalShadowMatrix,Ft.spotLightMatrix.value=G.state.spotLightMatrix,Ft.spotLightMap.value=G.state.spotLightMap,Ft.pointShadowMatrix.value=G.state.pointShadowMatrix),V.lightProbeGrid=w.state.lightProbeGridArray.length>0,V.currentProgram=ue,V.uniformsList=null,ue}function $s(E){if(E.uniformsList===null){let U=E.currentProgram.getUniforms();E.uniformsList=Lr.seqWithValue(U.seq,E.uniforms)}return E.uniformsList}function Qr(E,U){let q=W.get(E);q.outputColorSpace=U.outputColorSpace,q.batching=U.batching,q.batchingColor=U.batchingColor,q.instancing=U.instancing,q.instancingColor=U.instancingColor,q.instancingMorph=U.instancingMorph,q.skinning=U.skinning,q.morphTargets=U.morphTargets,q.morphNormals=U.morphNormals,q.morphColors=U.morphColors,q.morphTargetsCount=U.morphTargetsCount,q.numClippingPlanes=U.numClippingPlanes,q.numIntersection=U.numClipIntersection,q.vertexAlphas=U.vertexAlphas,q.vertexTangents=U.vertexTangents,q.toneMapping=U.toneMapping}function bo(E,U){if(E.length===0)return null;if(E.length===1)return E[0].texture!==null?E[0]:null;v.setFromMatrixPosition(U.matrixWorld);for(let q=0,V=E.length;q<V;q++){let G=E[q];if(G.texture!==null&&G.boundingBox.containsPoint(v))return G}return null}function So(E,U,q,V,G){U.isScene!==!0&&(U=Gt),$.resetTextureUnits();let At=U.fog,Dt=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?U.environment:null,Tt=rt===null?P.outputColorSpace:rt.isXRRenderTarget===!0?rt.texture.colorSpace:ce.workingColorSpace,Ut=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,kt=dt.get(V.envMap||Dt,Ut),ae=V.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,ue=!!q.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Ft=!!q.morphAttributes.position,ye=!!q.morphAttributes.normal,nn=!!q.morphAttributes.color,ze=pi;V.toneMapped&&(rt===null||rt.isXRRenderTarget===!0)&&(ze=P.toneMapping);let Pe=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,Sn=Pe!==void 0?Pe.length:0,Lt=W.get(V),In=w.state.lights;if(lt===!0&&(ct===!0||E!==tt)){let De=E===tt&&V.id===Z;Ht.setState(V,E,De)}let me=!1;V.version===Lt.__version?(Lt.needsLights&&Lt.lightsStateVersion!==In.state.version||Lt.outputColorSpace!==Tt||G.isBatchedMesh&&Lt.batching===!1||!G.isBatchedMesh&&Lt.batching===!0||G.isBatchedMesh&&Lt.batchingColor===!0&&G._colorsTexture===null||G.isBatchedMesh&&Lt.batchingColor===!1&&G._colorsTexture!==null||G.isInstancedMesh&&Lt.instancing===!1||!G.isInstancedMesh&&Lt.instancing===!0||G.isSkinnedMesh&&Lt.skinning===!1||!G.isSkinnedMesh&&Lt.skinning===!0||G.isInstancedMesh&&Lt.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&Lt.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&Lt.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&Lt.instancingMorph===!1&&G.morphTexture!==null||Lt.envMap!==kt||V.fog===!0&&Lt.fog!==At||Lt.numClippingPlanes!==void 0&&(Lt.numClippingPlanes!==Ht.numPlanes||Lt.numIntersection!==Ht.numIntersection)||Lt.vertexAlphas!==ae||Lt.vertexTangents!==ue||Lt.morphTargets!==Ft||Lt.morphNormals!==ye||Lt.morphColors!==nn||Lt.toneMapping!==ze||Lt.morphTargetsCount!==Sn||!!Lt.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(me=!0):(me=!0,Lt.__version=V.version);let ti=Lt.currentProgram;me===!0&&(ti=es(V,U,G),F&&V.isNodeMaterial&&F.onUpdateProgram(V,ti,Lt));let bi=!1,ns=!1,js=!1,Ae=ti.getUniforms(),tn=Lt.uniforms;if(M.useProgram(ti.program)&&(bi=!0,ns=!0,js=!0),V.id!==Z&&(Z=V.id,ns=!0),Lt.needsLights){let De=bo(w.state.lightProbeGridArray,G);Lt.lightProbeGrid!==De&&(Lt.lightProbeGrid=De,ns=!0)}if(bi||tt!==E){M.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),Ae.setValue(D,"projectionMatrix",E.projectionMatrix),Ae.setValue(D,"viewMatrix",E.matrixWorldInverse);let ss=Ae.map.cameraPosition;ss!==void 0&&ss.setValue(D,xt.setFromMatrixPosition(E.matrixWorld)),C.logarithmicDepthBuffer&&Ae.setValue(D,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&Ae.setValue(D,"isOrthographic",E.isOrthographicCamera===!0),tt!==E&&(tt=E,ns=!0,js=!0)}if(Lt.needsLights&&(In.state.sunShadowMap.length>0&&Ae.setValue(D,"sunShadowMap",In.state.sunShadowMap,$),In.state.directionalShadowMap.length>0&&Ae.setValue(D,"directionalShadowMap",In.state.directionalShadowMap,$),In.state.spotShadowMap.length>0&&Ae.setValue(D,"spotShadowMap",In.state.spotShadowMap,$),In.state.pointShadowMap.length>0&&Ae.setValue(D,"pointShadowMap",In.state.pointShadowMap,$)),G.isSkinnedMesh){Ae.setOptional(D,G,"bindMatrix"),Ae.setOptional(D,G,"bindMatrixInverse");let De=G.skeleton;De&&(De.boneTexture===null&&De.computeBoneTexture(),Ae.setValue(D,"boneTexture",De.boneTexture,$))}G.isBatchedMesh&&(Ae.setOptional(D,G,"batchingTexture"),Ae.setValue(D,"batchingTexture",G._matricesTexture,$),Ae.setOptional(D,G,"batchingIdTexture"),Ae.setValue(D,"batchingIdTexture",G._indirectTexture,$),Ae.setOptional(D,G,"batchingColorTexture"),G._colorsTexture!==null&&Ae.setValue(D,"batchingColorTexture",G._colorsTexture,$));let is=q.morphAttributes;if((is.position!==void 0||is.normal!==void 0||is.color!==void 0)&&B.update(G,q,ti),(ns||Lt.receiveShadow!==G.receiveShadow)&&(Lt.receiveShadow=G.receiveShadow,Ae.setValue(D,"receiveShadow",G.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&U.environment!==null&&(tn.envMapIntensity.value=U.environmentIntensity),tn.dfgLUT!==void 0&&(tn.dfgLUT.value=Ay()),ns){if(Ae.setValue(D,"toneMappingExposure",P.toneMappingExposure),Lt.needsLights&&im(tn,js),At&&V.fog===!0&&zt.refreshFogUniforms(tn,At),zt.refreshMaterialUniforms(tn,V,Q,X,w.state.transmissionRenderTarget[E.id]),Lt.needsLights&&Lt.lightProbeGrid){let De=Lt.lightProbeGrid;tn.probesSH.value=De.texture,tn.probesMin.value.copy(De.boundingBox.min),tn.probesMax.value.copy(De.boundingBox.max),tn.probesResolution.value.copy(De.resolution)}Lr.upload(D,$s(Lt),tn,$)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(Lr.upload(D,$s(Lt),tn,$),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&Ae.setValue(D,"center",G.center),Ae.setValue(D,"modelViewMatrix",G.modelViewMatrix),Ae.setValue(D,"normalMatrix",G.normalMatrix),Ae.setValue(D,"modelMatrix",G.matrixWorld),V.uniformsGroups!==void 0){let De=V.uniformsGroups;for(let ss=0,Qs=De.length;ss<Qs;ss++){let dd=De[ss];I.update(dd,ti),I.bind(dd,ti)}}return ti}function im(E,U){E.ambientLightColor.needsUpdate=U,E.lightProbe.needsUpdate=U,E.sunLights.needsUpdate=U,E.sunLightShadows.needsUpdate=U,E.directionalLights.needsUpdate=U,E.directionalLightShadows.needsUpdate=U,E.pointLights.needsUpdate=U,E.pointLightShadows.needsUpdate=U,E.spotLights.needsUpdate=U,E.spotLightShadows.needsUpdate=U,E.rectAreaLights.needsUpdate=U,E.hemisphereLights.needsUpdate=U}function sm(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return J},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return rt},this.setRenderTargetTextures=function(E,U,q){let V=W.get(E);V.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),W.get(E.texture).__webglTexture=U,W.get(E.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:q,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,U){let q=W.get(E);q.__webglFramebuffer=U,q.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(E,U=0,q=0){rt=E,J=U,Y=q;let V=null,G=!1,At=!1;if(E){let Tt=W.get(E);if(Tt.__useDefaultFramebuffer!==void 0){M.bindFramebuffer(D.FRAMEBUFFER,Tt.__webglFramebuffer),it.copy(E.viewport),It.copy(E.scissor),Rt=E.scissorTest,M.viewport(it),M.scissor(It),M.setScissorTest(Rt),Z=-1;return}else if(Tt.__webglFramebuffer===void 0)$.setupRenderTarget(E);else if(Tt.__hasExternalTextures)$.rebindTextures(E,W.get(E.texture).__webglTexture,W.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let ae=E.depthTexture;if(Tt.__boundDepthTexture!==ae){if(ae!==null&&W.has(ae)&&(E.width!==ae.image.width||E.height!==ae.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");$.setupDepthRenderbuffer(E)}}let Ut=E.texture;(Ut.isData3DTexture||Ut.isDataArrayTexture||Ut.isCompressedArrayTexture)&&(At=!0);let kt=W.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(kt[U])?V=kt[U][q]:V=kt[U],G=!0):E.samples>0&&$.useMultisampledRTT(E)===!1?V=W.get(E).__webglMultisampledFramebuffer:Array.isArray(kt)?V=kt[q]:V=kt,it.copy(E.viewport),It.copy(E.scissor),Rt=E.scissorTest}else it.copy(St).multiplyScalar(Q).floor(),It.copy(Xt).multiplyScalar(Q).floor(),Rt=he;if(q!==0&&(V=k),M.bindFramebuffer(D.FRAMEBUFFER,V)&&M.drawBuffers(E,V),M.viewport(it),M.scissor(It),M.setScissorTest(Rt),G){let Tt=W.get(E.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+U,Tt.__webglTexture,q)}else if(At){let Tt=U;for(let Ut=0;Ut<E.textures.length;Ut++){let kt=W.get(E.textures[Ut]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Ut,kt.__webglTexture,q,Tt)}}else if(E!==null&&q!==0){let Tt=W.get(E.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Tt.__webglTexture,q)}Z=-1};function ud(E){let U=W.get(E);return(U.__readFormat!==E.format||U.__readType!==E.type)&&(U.__readFormat=E.format,U.__readType=E.type,U.__formatReadable=C.textureFormatReadable(E.format),U.__typeReadable=C.textureTypeReadable(E.type)),U}this.readRenderTargetPixels=function(E,U,q,V,G,At,Dt,Tt=0){if(!(E&&E.isWebGLRenderTarget)){Kt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ut=W.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Dt!==void 0&&(Ut=Ut[Dt]),Ut){M.bindFramebuffer(D.FRAMEBUFFER,Ut);try{let kt=E.textures[Tt],ae=kt.format,ue=kt.type;E.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Tt);let Ft=ud(kt);if(Ft.__formatReadable===!1){Kt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ft.__typeReadable===!1){Kt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=E.width-V&&q>=0&&q<=E.height-G&&D.readPixels(U,q,V,G,pt.convert(ae),pt.convert(ue),At)}finally{let kt=rt!==null?W.get(rt).__webglFramebuffer:null;M.bindFramebuffer(D.FRAMEBUFFER,kt)}}},this.readRenderTargetPixelsAsync=async function(E,U,q,V,G,At,Dt,Tt=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ut=W.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Dt!==void 0&&(Ut=Ut[Dt]),Ut)if(U>=0&&U<=E.width-V&&q>=0&&q<=E.height-G){M.bindFramebuffer(D.FRAMEBUFFER,Ut);let kt=E.textures[Tt],ae=kt.format,ue=kt.type;E.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Tt);let Ft=ud(kt);if(Ft.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ft.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ye=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,ye),D.bufferData(D.PIXEL_PACK_BUFFER,At.byteLength,D.STREAM_READ),D.readPixels(U,q,V,G,pt.convert(ae),pt.convert(ue),0),D.bindBuffer(D.PIXEL_PACK_BUFFER,null);let nn=rt!==null?W.get(rt).__webglFramebuffer:null;M.bindFramebuffer(D.FRAMEBUFFER,nn);let ze=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await Tf(D,ze,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,ye),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,At),D.bindBuffer(D.PIXEL_PACK_BUFFER,null),D.deleteBuffer(ye),D.deleteSync(ze),At}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,U=null,q=0){let V=Math.pow(2,-q),G=Math.floor(E.image.width*V),At=Math.floor(E.image.height*V),Dt=U!==null?U.x:0,Tt=U!==null?U.y:0;$.setTexture2D(E,0),D.copyTexSubImage2D(D.TEXTURE_2D,q,0,0,Dt,Tt,G,At),M.unbindTexture()},this.copyTextureToTexture=function(E,U,q=null,V=null,G=0,At=0){let Dt,Tt,Ut,kt,ae,ue,Ft,ye,nn,ze=E.isCompressedTexture?E.mipmaps[At]:E.image;if(q!==null)Dt=q.max.x-q.min.x,Tt=q.max.y-q.min.y,Ut=q.isBox3?q.max.z-q.min.z:1,kt=q.min.x,ae=q.min.y,ue=q.isBox3?q.min.z:0;else{let tn=Math.pow(2,-G);Dt=Math.floor(ze.width*tn),Tt=Math.floor(ze.height*tn),E.isDataArrayTexture?Ut=ze.depth:E.isData3DTexture?Ut=Math.floor(ze.depth*tn):Ut=1,kt=0,ae=0,ue=0}V!==null?(Ft=V.x,ye=V.y,nn=V.z):(Ft=0,ye=0,nn=0);let Pe=pt.convert(U.format),Sn=pt.convert(U.type),Lt;U.isData3DTexture?($.setTexture3D(U,0),Lt=D.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?($.setTexture2DArray(U,0),Lt=D.TEXTURE_2D_ARRAY):($.setTexture2D(U,0),Lt=D.TEXTURE_2D),M.activeTexture(D.TEXTURE0),M.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),M.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),M.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);let In=M.getParameter(D.UNPACK_ROW_LENGTH),me=M.getParameter(D.UNPACK_IMAGE_HEIGHT),ti=M.getParameter(D.UNPACK_SKIP_PIXELS),bi=M.getParameter(D.UNPACK_SKIP_ROWS),ns=M.getParameter(D.UNPACK_SKIP_IMAGES);M.pixelStorei(D.UNPACK_ROW_LENGTH,ze.width),M.pixelStorei(D.UNPACK_IMAGE_HEIGHT,ze.height),M.pixelStorei(D.UNPACK_SKIP_PIXELS,kt),M.pixelStorei(D.UNPACK_SKIP_ROWS,ae),M.pixelStorei(D.UNPACK_SKIP_IMAGES,ue);let js=E.isDataArrayTexture||E.isData3DTexture,Ae=U.isDataArrayTexture||U.isData3DTexture;if(E.isDepthTexture){let tn=W.get(E),is=W.get(U),De=W.get(tn.__renderTarget),ss=W.get(is.__renderTarget);M.bindFramebuffer(D.READ_FRAMEBUFFER,De.__webglFramebuffer),M.bindFramebuffer(D.DRAW_FRAMEBUFFER,ss.__webglFramebuffer);for(let Qs=0;Qs<Ut;Qs++)js&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,W.get(E).__webglTexture,G,ue+Qs),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,W.get(U).__webglTexture,At,nn+Qs)),D.blitFramebuffer(kt,ae,Dt,Tt,Ft,ye,Dt,Tt,D.DEPTH_BUFFER_BIT,D.NEAREST);M.bindFramebuffer(D.READ_FRAMEBUFFER,null),M.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(G!==0||E.isRenderTargetTexture||W.has(E)){let tn=W.get(E),is=W.get(U);M.bindFramebuffer(D.READ_FRAMEBUFFER,N),M.bindFramebuffer(D.DRAW_FRAMEBUFFER,z);for(let De=0;De<Ut;De++)js?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,tn.__webglTexture,G,ue+De):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,tn.__webglTexture,G),Ae?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,is.__webglTexture,At,nn+De):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,is.__webglTexture,At),G!==0?D.blitFramebuffer(kt,ae,Dt,Tt,Ft,ye,Dt,Tt,D.COLOR_BUFFER_BIT,D.NEAREST):Ae?D.copyTexSubImage3D(Lt,At,Ft,ye,nn+De,kt,ae,Dt,Tt):D.copyTexSubImage2D(Lt,At,Ft,ye,kt,ae,Dt,Tt);M.bindFramebuffer(D.READ_FRAMEBUFFER,null),M.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else Ae?E.isDataTexture||E.isData3DTexture?D.texSubImage3D(Lt,At,Ft,ye,nn,Dt,Tt,Ut,Pe,Sn,ze.data):U.isCompressedArrayTexture?D.compressedTexSubImage3D(Lt,At,Ft,ye,nn,Dt,Tt,Ut,Pe,ze.data):D.texSubImage3D(Lt,At,Ft,ye,nn,Dt,Tt,Ut,Pe,Sn,ze):E.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,At,Ft,ye,Dt,Tt,Pe,Sn,ze.data):E.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,At,Ft,ye,ze.width,ze.height,Pe,ze.data):D.texSubImage2D(D.TEXTURE_2D,At,Ft,ye,Dt,Tt,Pe,Sn,ze);M.pixelStorei(D.UNPACK_ROW_LENGTH,In),M.pixelStorei(D.UNPACK_IMAGE_HEIGHT,me),M.pixelStorei(D.UNPACK_SKIP_PIXELS,ti),M.pixelStorei(D.UNPACK_SKIP_ROWS,bi),M.pixelStorei(D.UNPACK_SKIP_IMAGES,ns),At===0&&U.generateMipmaps&&D.generateMipmap(Lt),M.unbindTexture()},this.initRenderTarget=function(E){W.get(E).__webglFramebuffer===void 0&&$.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?$.setTextureCube(E,0):E.isData3DTexture?$.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?$.setTexture2DArray(E,0):$.setTexture2D(E,0),M.unbindTexture()},this.resetState=function(){J=0,Y=0,rt=null,M.reset(),Et.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return fi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=ce._getDrawingBufferColorSpace(t),e.unpackColorSpace=ce._getUnpackColorSpace()}};var oo=.008333333333333333,Cn=650,Bt={halfX:4096,halfZ:5120,height:2044,chamfer:1150,cornerR:400,rampR:280,goalHalfW:893,goalH:642,goalDepth:880},Me={radius:93,mass:30,maxSpeed:6e3,maxSpin:6,drag:.0305,restitution:.6,friction:.285},Nt={mass:180,restHeight:17,hitboxHalf:{x:42.1,y:18.08,z:59},hitboxOffset:{x:0,y:20.75,z:13.88},wheels:[{x:25.9,z:51.25,r:12.5,front:!0},{x:-25.9,z:51.25,r:12.5,front:!0},{x:29.5,z:-33.75,r:15,front:!1},{x:-29.5,z:-33.75,r:15,front:!1}],maxSpeed:2300,maxDriveSpeed:1410,supersonic:2200,boostAccelGround:991.67,boostAccelAir:1058.33,boostUsePerSec:33.3,brakeAccel:3500,coastDecel:525,airThrottleAccel:66.67,jumpImpulse:291.67,jumpHoldAccel:1458.33,jumpHoldTime:.2,doubleJumpWindow:1.25,dodgeImpulse:500,dodgeTime:.65,stickyAccel:325,maxAngVel:5.5,airRoll:36.08,airPitch:12.15,airYaw:8.92,dampRoll:4.47,dampPitch:2.8,dampYaw:1.89},Au=33,Rc=[[-3584,0],[3584,0],[-3072,-4096],[3072,-4096],[-3072,4096],[3072,4096]],Cc=[[0,-4240],[-1792,-4184],[1792,-4184],[-940,-3308],[940,-3308],[0,-2816],[-3584,-2484],[3584,-2484],[-1788,-2300],[1788,-2300],[-2048,-1036],[0,-1024],[2048,-1036],[-1024,0],[1024,0],[-2048,1036],[0,1024],[2048,1036],[-1788,2300],[1788,2300],[-3584,2484],[3584,2484],[0,2816],[-940,3310],[940,3308],[-1792,4184],[1792,4184],[0,4240]],cp=[[-2048,-2560,Math.PI/4],[2048,-2560,-Math.PI/4],[-256,-3840,0],[256,-3840,0],[0,-4608,0]],Ru=[[-2304,-4608,0],[-2688,-4608,0],[2304,-4608,0],[2688,-4608,0]],ke={0:{main:1010687,light:6272255,dark:670362,css:"#2f7bff",flame:[.55,.85,1],flameEnd:[.1,.3,1]},1:{main:16738834,light:16756832,dark:9054720,css:"#ff7a1a",flame:[1,.85,.45],flameEnd:[1,.28,.04]}};var Cu=30,Es=new T;function en(s,t,e,n){let i=document.createElement(s);return t&&(i.className=t),n!==void 0&&(i.innerHTML=n),e&&e.appendChild(i),i}function Ry(){let r=270/Cu,a="";for(let o=0;o<Cu;o++){let l=(135+o*r+.8)*Math.PI/180,c=(135+(o+1)*r-.8)*Math.PI/180,h=100+Math.cos(l)*84,u=100+Math.sin(l)*84,d=100+Math.cos(c)*84,f=100+Math.sin(c)*84;a+=`<path class="seg" d="M${h.toFixed(2)} ${u.toFixed(2)} A84 84 0 0 1 ${d.toFixed(2)} ${f.toFixed(2)}"/>`}return`<svg viewBox="0 0 200 200" class="boost-svg">
    <defs>
      <radialGradient id="bg-grad" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#0d2a5c" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="#040a1c" stop-opacity="0.92"/>
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="72" fill="url(#bg-grad)" stroke="#2c74ff" stroke-width="2.5" stroke-opacity="0.8"/>
    <circle cx="100" cy="100" r="64" fill="none" stroke="#5fb4ff" stroke-width="1" stroke-opacity="0.25"/>
    <g class="segs">${a}</g>
    <text x="100" y="114" text-anchor="middle" class="boost-num">33</text>
    <text x="100" y="144" text-anchor="middle" class="boost-label">BOOST</text>
  </svg>`}var Pc=class{constructor(t){this.root=t,t.innerHTML="";let e=en("div","scoreboard",t);this.sbBlue=en("div","sb-team sb-blue",e,"<span>0</span>");let n=en("div","sb-clock",e);this.sbTime=en("div","sb-time",n,"5:00"),this.sbOT=en("div","sb-ot",n,""),this.sbOrange=en("div","sb-team sb-orange",e,"<span>0</span>"),this.viewsEl=en("div","hud-views",t),this.banner=en("div","banner",t),this.bannerMain=en("div","banner-main",this.banner),this.bannerSub=en("div","banner-sub",this.banner),this.feed=en("div","feed",t),this.fps=en("div","fps",t),this.views=[],this.bannerTimer=0,this.lastScores=[-1,-1],this.lastTime=""}show(t){this.root.classList.toggle("hidden",!t)}setup(t){this.viewsEl.innerHTML="",this.views=t.map(e=>{let n=en("div","hud-view",this.viewsEl);n.style.left=e.rect[0]*100+"%",n.style.top=e.rect[1]*100+"%",n.style.width=e.rect[2]*100+"%",n.style.height=e.rect[3]*100+"%",t.length>1&&n.classList.add("split");let i=en("div","boost-gauge",n,Ry()),r=t.length>1?en("div","player-tag",n,e.label):null;r&&(r.style.color=ke[e.team].css);let a=en("div","item-slot hidden",n);a.innerHTML='<div class="item-icon"></div><div class="item-text"><div class="item-name"></div><div class="item-key"></div></div><div class="item-bar"><div></div></div>';let o=en("div","view-status",n),l=en("div","view-center",n),c=en("div","plates",n);return{box:n,gauge:i,status:o,center:l,plates:c,plateMap:new Map,item:a,itemIcon:a.querySelector(".item-icon"),itemName:a.querySelector(".item-name"),itemKey:a.querySelector(".item-key"),itemBar:a.querySelector(".item-bar div"),itemSig:"",segs:Array.from(i.querySelectorAll(".seg")),num:i.querySelector(".boost-num"),lastBoost:-1,statusTimer:0,centerTimer:0}})}setScore(t,e){t!==this.lastScores[0]&&(this.sbBlue.firstChild.textContent=t,this.pulse(this.sbBlue)),e!==this.lastScores[1]&&(this.sbOrange.firstChild.textContent=e,this.pulse(this.sbOrange)),this.lastScores=[t,e]}pulse(t){this.lastScores[0]<0||(t.classList.remove("pulse"),t.offsetWidth,t.classList.add("pulse"))}setClock(t,e,n){let i;if(n)i="\u221E";else{let r=Math.max(0,e?Math.floor(t):Math.ceil(t));i=`${e?"+":""}${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`}i!==this.lastTime&&(this.sbTime.textContent=i,this.lastTime=i),this.sbOT.textContent=e?"OVERTIME":""}setBoost(t,e){let n=this.views[t];if(!n)return;let i=Math.round(e);if(i===n.lastBoost)return;n.lastBoost=i,n.num.textContent=i;let r=Math.ceil(e/100*Cu-.001);n.segs.forEach((a,o)=>a.classList.toggle("on",o<r)),n.gauge.classList.toggle("empty",i===0),n.gauge.classList.toggle("full",i===100)}setItem(t,e,n,i){let r=this.views[t];if(!r)return;if(!e){r.item.classList.add("hidden");return}r.item.classList.remove("hidden");let a=`${e.item}|${e.active}|${i}|${e.item?"":Math.ceil(e.next||0)}`;if(a!==r.itemSig){r.itemSig=a;let o=e.item?n[e.item]:null;r.item.classList.toggle("ready",!!e.item&&!e.active),r.item.classList.toggle("active",!!e.active),r.item.classList.toggle("empty",!e.item),r.itemIcon.textContent=o?o.icon:"\u23F3",r.itemName.textContent=o?o.name:"Power-up",r.itemKey.innerHTML=e.item?e.active?"active":`press <b>${i}</b>`:`next in ${Math.ceil(e.next||0)}s`}r.itemBar.style.transform=`scaleX(${e.active?e.frac:e.item?1:0})`}viewStatus(t,e,n=1.6){let i=this.views[t];i&&(i.status.textContent=e,i.status.classList.add("visible"),i.statusTimer=n)}viewCenter(t,e,n=2){let i=this.views[t];i&&(i.center.textContent=e,i.center.classList.add("visible"),i.centerTimer=n)}showBanner(t,e="",n="",i=2){this.bannerMain.textContent=t,this.bannerSub.textContent=e,this.banner.className="banner visible "+n,this.bannerTimer=i}hideBanner(){this.banner.className="banner",this.bannerTimer=0}addFeed(t,e=-1){let n=en("div","feed-item"+(e>=0?" team"+e:""),this.feed,t);for(setTimeout(()=>n.classList.add("fade"),3500),setTimeout(()=>n.remove(),4200);this.feed.children.length>5;)this.feed.firstChild.remove()}updatePlates(t,e,n,i){let r=this.views[t];if(!r)return;let a=r.box.clientWidth,o=r.box.clientHeight,l=new Set;for(let c of n){if(c.car===i||c.car.demolished||(Es.set(c.pos.x*.01,(c.pos.y+95)*.01,c.pos.z*.01).project(e),Es.z>1||Es.z<-1||Math.abs(Es.x)>1.1||Math.abs(Es.y)>1.1))continue;let h=r.plateMap.get(c.car.id);h||(h=en("div","plate team"+c.car.team,r.plates,c.name),r.plateMap.set(c.car.id,h));let u=(Es.x+1)/2*a,d=(1-Es.y)/2*o,f=e.position.distanceTo(Es.set(c.pos.x*.01,c.pos.y*.01,c.pos.z*.01));h.style.transform=`translate(${u.toFixed(1)}px, ${d.toFixed(1)}px) translate(-50%, -100%) scale(${Math.max(.55,Math.min(1,12/f)).toFixed(3)})`,h.style.display="",l.add(c.car.id)}for(let[c,h]of r.plateMap)l.has(c)||(h.style.display="none")}update(t){this.bannerTimer>0&&(this.bannerTimer-=t,this.bannerTimer<=0&&this.banner.classList.remove("visible"));for(let e of this.views)e.statusTimer>0&&(e.statusTimer-=t,e.statusTimer<=0&&e.status.classList.remove("visible")),e.centerTimer>0&&(e.centerTimer-=t,e.centerTimer<=0&&e.center.classList.remove("visible"))}setFps(t){this.fps.textContent=t}};var pp=Bt.halfZ,Cy=Bt.goalHalfW,Py=Bt.goalH,Pu=Me.radius,Ce=new T,hp=new T,up=new T,dp=new xe,Iu=s=>(s===0?1:-1)*(pp+450),Ic=class{reset(){}preStep(){}preBall(){}onTouch(){}postStep(){}},Lu=class extends Ic{constructor(t){super(),this.world=t,this.name="heatseeker",this.reset(),t.ball.force=(e,n)=>this.force(e,n)}reset(){this.team=-1,this.speed=0,this.lastBoost=-10,this.lastFlip=-10}onTouch(t){let e=this.world.time;(t.team!==this.team||e-this.lastBoost>.5)&&(this.speed=Math.min(4200,Math.max(1500,this.speed+160)),this.lastBoost=e),this.team=t.team}force(t,e){if(this.team<0)return;Ce.set(0,330,Iu(this.team)).sub(t.pos);let n=Ce.length();n<1||(Ce.multiplyScalar(this.speed/n),t.vel.y+=Cn*e*.92,t.vel.lerp(Ce,1-Math.exp(-e*1.5)))}postStep(){if(this.team<0)return;let t=this.world.ball,e=(this.team===0?1:-1)*pp,n=Math.abs(t.pos.z-e)<Pu+40,i=Math.abs(t.pos.x)<Cy&&t.pos.y<Py;n&&!i&&this.world.time-this.lastFlip>.6&&(this.team=1-this.team,this.lastFlip=this.world.time,this.world.events.push({type:"heatseekFlip",point:t.pos.clone()}))}},lo={grapple:{name:"Grappling Hook",icon:"\u{1FA9D}",hint:"Pulls you to the ball"},plunger:{name:"Plunger",icon:"\u{1FAA0}",hint:"Pulls the ball to you"},tornado:{name:"Tornado",icon:"\u{1F32A}\uFE0F",hint:"Spins up everything near you"},curveball:{name:"Curveball",icon:"\u{1F300}",hint:"Curves the ball into their goal"},spikes:{name:"Spikes",icon:"\u{1F4CC}",hint:"The ball sticks to your car"},boot:{name:"Boot",icon:"\u{1F462}",hint:"Kicks the nearest opponent away"},power:{name:"Power Hitter",icon:"\u{1F4A5}",hint:"Huge hits and demolish on contact"},freezer:{name:"Freezer",icon:"\u2744\uFE0F",hint:"Freezes the ball in place"}},Ur=Object.keys(lo),fp={grapple:4200,plunger:4200,curveball:5e3,freezer:6e3,boot:4500},Du=class extends Ic{constructor(t,e=Ur){super(),this.world=t,this.name="rumble",this.pool=e.length?e:Ur,this.state=new Map,this.curve=null,this.reset()}st(t){let e=this.state.get(t);return e||(e={item:null,timer:3,held:0,active:null,prevUse:!1},this.state.set(t,e)),e}reset(){for(let t of this.world.cars){let e=this.st(t);this.endActive(t,e),e.item=null,e.timer=2+Math.random()*3,e.prevUse=!!t.input.useItem}this.curve=null,this.world.ball.iceTimer=0,this.world.ball.attachedTo=null}give(t,e){e.item=this.pool[Math.floor(Math.random()*this.pool.length)],e.held=0,this.world.events.push({type:"itemGet",car:t,item:e.item})}inRange(t,e){let n=fp[e];return n?e==="boot"?!!this.nearestOpponent(t,n):t.pos.distanceTo(this.world.ball.pos)<n:!0}nearestOpponent(t,e){let n=null,i=e;for(let r of this.world.cars){if(r.team===t.team||r.demolished)continue;let a=r.pos.distanceTo(t.pos);a<i&&(i=a,n=r)}return n}use(t){let e=this.st(t);if(!e.item||e.active||t.demolished||this.world.ball.frozen)return!1;let n=e.item;if(!this.inRange(t,n))return this.world.events.push({type:"itemFail",car:t,item:n}),!1;e.item=null;let i=this.world,r=i.ball;switch(n){case"grapple":case"plunger":e.active={type:n,phase:"shoot",t:0,hook:t.pos.clone()};break;case"tornado":e.active={type:"tornado",t:0,dur:5.5};break;case"spikes":e.active={type:"spikes",t:0,dur:10,offset:null};break;case"power":e.active={type:"power",t:0,dur:8},t.hitPower=1.8;break;case"curveball":this.curve={team:t.team,t:4},r.vel.length()<1200&&(r.vel.addScaledVector(Ce.set(0,0,Math.sign(Iu(t.team))),900),r.vel.y+=250),e.timer=9;break;case"freezer":r.iceTimer=3.5,r.vel.set(0,0,0),e.timer=9;break;case"boot":{let a=this.nearestOpponent(t,fp.boot);Ce.copy(a.pos).sub(t.pos).setY(0).normalize(),a.vel.addScaledVector(Ce,1700),a.vel.y+=1050,a.noGround=.25,a.onGround=!1,a.angVel.set(Math.random()-.5,0,Math.random()-.5).multiplyScalar(8),i.events.push({type:"boot",car:a,by:t,point:a.pos.clone()}),e.timer=9;break}default:break}return i.events.push({type:"itemUse",car:t,item:n}),!0}endActive(t,e){let n=e.active;n&&(n.type==="power"&&(t.hitPower=1),n.type==="spikes"&&this.world.ball.attachedTo===t&&this.release(t,!1),e.active=null,e.timer=8+Math.random()*3)}release(t,e){let n=this.world.ball;n.attachedTo===t&&(n.attachedTo=null,e&&(t.forward(up),n.vel.copy(t.vel).addScaledVector(up,950),n.vel.y+=250))}preStep(t){let e=this.world,n=e.ball;for(let i of e.cars){let r=this.st(i),a=!!i.input.useItem&&!r.prevUse;if(r.prevUse=!!i.input.useItem,i.demolished){r.active&&this.endActive(i,r);continue}a&&this.use(i),!r.item&&!r.active&&(r.timer-=t,r.timer<=0&&!n.frozen&&this.give(i,r)),r.item&&(r.held+=t);let o=r.active;if(o)switch(o.t+=t,o.type){case"grapple":case"plunger":{if(o.phase==="shoot"){Ce.copy(n.pos).sub(o.hook);let l=Ce.length(),c=6e3*t;l<=c+Pu?(o.hook.copy(n.pos),o.phase="pull",o.pullT=0,e.events.push({type:"hooked",car:i,item:o.type,point:n.pos.clone()})):o.hook.addScaledVector(Ce,c/l),o.t>1&&o.phase==="shoot"&&this.endActive(i,r)}else{o.pullT+=t,o.hook.copy(n.pos),Ce.copy(n.pos).sub(i.pos);let l=Ce.length();Ce.divideScalar(Math.max(1,l)),o.type==="grapple"?(i.vel.addScaledVector(Ce,5400*t),i.vel.y+=Cn*.6*t,i.noGround=.12,(l<230||o.pullT>2)&&this.endActive(i,r)):(n.vel.addScaledVector(Ce,-6800*t),n.vel.y+=Cn*.5*t,(l<380||o.pullT>1.8)&&this.endActive(i,r))}break}case"tornado":{let c=(h,u)=>{Ce.copy(h.pos).sub(i.pos);let d=Math.hypot(Ce.x,Ce.z);if(d>1050||h.pos.y>2200)return!1;let f=1-d/1050;return hp.set(-Ce.z,0,Ce.x).normalize(),h.vel.addScaledVector(hp,2e3*f*t*u),h.vel.y+=(Cn+900*f+150)*t*u,d>1&&h.vel.addScaledVector(Ce.set(Ce.x/d,0,Ce.z/d),-700*f*t*u),!0};!n.attachedTo&&n.iceTimer<=0&&c(n,1);for(let h of e.cars)h===i||h.demolished||c(h,.85)&&(h.noGround=.1,h.onGround=!1);o.t>o.dur&&this.endActive(i,r);break}case"spikes":case"power":o.t>o.dur&&this.endActive(i,r);break;default:break}}if(this.curve&&!n.attachedTo&&n.iceTimer<=0){this.curve.t-=t;let i=Math.hypot(n.vel.x,n.vel.z);Ce.set(-n.pos.x,0,Iu(this.curve.team)-n.pos.z).normalize();let r=Math.atan2(n.vel.x,n.vel.z),o=Math.atan2(Ce.x,Ce.z)-r;for(;o>Math.PI;)o-=Math.PI*2;for(;o<-Math.PI;)o+=Math.PI*2;let l=Math.sign(o)*Math.min(Math.abs(o),2.2*t),c=Math.max(i,1500);n.vel.x=Math.sin(r+l)*c,n.vel.z=Math.cos(r+l)*c,this.curve.t<=0&&(this.curve=null)}}preBall(){let t=this.world.ball,e=t.attachedTo;if(!e)return;let n=this.st(e);if(!n.active||n.active.type!=="spikes"||e.demolished){this.release(e,!1);return}t.prevPos.copy(t.pos),Ce.copy(n.active.offset).applyQuaternion(e.quat),t.pos.copy(e.pos).add(Ce),t.vel.copy(e.vel)}onTouch(t){let e=this.world.ball;e.iceTimer>0&&(e.iceTimer=0),this.curve&&this.curve.team!==t.team&&(this.curve=null),e.attachedTo&&e.attachedTo!==t&&this.release(e.attachedTo,!1);let n=this.st(t);if(n.active&&n.active.type==="spikes"&&!e.attachedTo){dp.copy(t.quat).invert();let i=e.pos.clone().sub(t.pos).applyQuaternion(dp);i.setLength(Math.max(i.length(),Pu+52)),n.active.offset=i,e.attachedTo=t,e.lastTouch=t}}postStep(){let t=this.world.ball;if(t.attachedTo)for(let e of this.world.events){if(e.type==="dodge"&&e.car===t.attachedTo){this.release(e.car,!0);break}if(e.type==="bump"&&e.car===t.attachedTo){this.release(e.car,!1);break}}}status(t){let e=this.st(t);if(e.active){let n=e.active,i=n.dur?Math.max(0,1-n.t/n.dur):1;return{item:n.type,active:!0,frac:i}}return e.item?{item:e.item,active:!1,frac:1}:{item:null,active:!1,frac:0,next:Math.max(0,e.timer)}}};function mp(s,t,e){return t==="heatseeker"?new Lu(s):t==="rumble"?new Du(s,e):null}function je(s,t,e,n){let i=document.createElement(s);return t&&(i.className=t),n!==void 0&&(i.innerHTML=n),e&&e.appendChild(i),i}var Iy={solo:{title:"PLAY vs CPU",humans:1},versus:{title:"2 PLAYERS \u2014 VERSUS",humans:2},coop:{title:"2 PLAYERS \u2014 CO-OP vs CPU",humans:2}},gp=`
<div class="controls-grid">
  <div class="ctrl-col">
    <h3><span class="pad-icon">\u{1F3AE}</span> Xbox Controller</h3>
    <table>
      <tr><td><span class="btn rt">RT</span></td><td>Accelerate</td></tr>
      <tr><td><span class="btn lt">LT</span></td><td>Brake / Reverse</td></tr>
      <tr><td><span class="btn stick">L-Stick</span></td><td>Steer \xB7 Pitch &amp; yaw in the air</td></tr>
      <tr><td><span class="btn a">A</span></td><td>Jump \xB7 press again to double jump / flip (with stick)</td></tr>
      <tr><td><span class="btn b">B</span></td><td>Boost</td></tr>
      <tr><td><span class="btn x">X</span></td><td>Powerslide \xB7 Air roll (hold)</td></tr>
      <tr><td><span class="btn y">Y</span></td><td>Ball cam on/off</td></tr>
      <tr><td><span class="btn lb">LB</span> <span class="btn lb">RB</span></td><td>Air roll left / right</td></tr>
      <tr><td><span class="btn lb">RB</span></td><td>Use power-up (Rumble mode)</td></tr>
      <tr><td><span class="btn stick">R-Stick</span></td><td>Look around</td></tr>
      <tr><td><span class="btn menu">\u2630</span></td><td>Pause</td></tr>
    </table>
  </div>
  <div class="ctrl-col">
    <h3>\u2328\uFE0F\u{1F5B1}\uFE0F Keyboard &amp; Mouse</h3>
    <table>
      <tr><th></th><th>Player 1</th><th>Player 2</th></tr>
      <tr><td>Drive / steer</td><td>W A S D</td><td>Arrow keys</td></tr>
      <tr><td>Jump / flip</td><td>Space or Right mouse</td><td>K</td></tr>
      <tr><td>Boost</td><td>Left Shift or Left mouse</td><td>L</td></tr>
      <tr><td>Powerslide / air roll</td><td>C or Ctrl</td><td>J</td></tr>
      <tr><td>Air roll L / R</td><td>Q / E</td><td>U / O</td></tr>
      <tr><td>Ball cam</td><td>R or Middle mouse</td><td>I</td></tr>
      <tr><td>Use power-up (Rumble)</td><td>F</td><td>H</td></tr>
      <tr><td>Pause</td><td>Esc</td><td>P</td></tr>
    </table>
    <p class="hint">In single player both key sets work. Flip = jump, then jump again while holding a direction.</p>
  </div>
</div>`,Lc=class{constructor(t,e){this.app=t,this.root=e,this.visible=!1,this.items=[],this.focus=0,this.screen=null,this.joinSlots=[null,null],e.addEventListener("mousemove",()=>{this.mouse=!0})}hide(){this.visible=!1,this.root.classList.add("hidden"),this.root.innerHTML="",this.screen=null}show(t,e){this.visible=!0,this.root.classList.remove("hidden"),this.root.innerHTML="",this.root.className="menu screen-"+t,this.screen=t,this.data=e,this.items=[],this.focus=0,this.onBack=null,this.custom=null,this["screen_"+t].call(this,e),this.refreshFocus()}panel(t,e){let n=je("div","panel",this.root);return t&&je("div","panel-title",n,t),e&&je("div","panel-sub",n,e),n}button(t,e,n,i=""){let r=je("div","item button "+i,t,`<span>${e}</span>`),a={el:r,type:"button",action:n};return r.addEventListener("click",()=>{this.focus=this.items.indexOf(a),this.activate()}),r.addEventListener("mouseenter",()=>{this.focus=this.items.indexOf(a),this.refreshFocus()}),this.items.push(a),a}option(t,e,n,i,r){let a=je("div","item option",t);je("span","opt-label",a,e);let o=je("span","opt-ctl",a),l=je("span","arrow",o,"\u25C0"),c=je("span","opt-value",o),h=je("span","arrow",o,"\u25B6"),u={el:a,type:"option",values:n,get:i,set:r,val:c},d=()=>{let f=i(),g=n.find(_=>_.value===f)||n[0];c.textContent=g.label};return u.render=d,u.change=f=>{let g=i(),_=n.findIndex(p=>p.value===g);_=(_+f+n.length)%n.length,r(n[_].value),d(),this.app.audio.click(),this.onOptionChange&&this.onOptionChange()},l.addEventListener("click",f=>{f.stopPropagation(),u.change(-1)}),h.addEventListener("click",f=>{f.stopPropagation(),u.change(1)}),a.addEventListener("click",()=>u.change(1)),a.addEventListener("mouseenter",()=>{this.focus=this.items.indexOf(u),this.refreshFocus()}),d(),this.items.push(u),u}refreshFocus(){this.items.forEach((t,e)=>t.el.classList.toggle("focused",e===this.focus))}activate(){let t=this.items[this.focus];t&&(t.type==="button"?(this.app.audio.select(),t.action()):t.type==="option"&&t.change(1))}update(t){if(!this.visible||this.custom&&this.custom(t))return;let e=this.items.length;t.up&&e&&(this.focus=(this.focus-1+e)%e,this.refreshFocus(),this.app.audio.click()),t.down&&e&&(this.focus=(this.focus+1)%e,this.refreshFocus(),this.app.audio.click());let n=this.items[this.focus];n&&n.type==="option"&&(t.left&&n.change(-1),t.right&&n.change(1)),t.confirm&&this.activate(),t.back&&this.onBack&&(this.app.audio.click(),this.onBack()),t.start&&this.onStart&&this.onStart()}screen_main(){let t=je("div","logo",this.root);t.innerHTML='<div class="logo-top">ROCKET</div><div class="logo-bottom">ARENA</div><div class="logo-tag">supersonic car soccer</div>';let e=this.panel();e.classList.add("main-panel"),this.button(e,"\u25B6  PLAY vs CPU",()=>this.show("setup","solo"),"primary"),this.button(e,"\u{1F465}  2 PLAYERS \u2014 VERSUS",()=>this.show("setup","versus")),this.button(e,"\u{1F91D}  2 PLAYERS \u2014 CO-OP vs CPU",()=>this.show("setup","coop")),this.button(e,"\u2699  SETTINGS",()=>this.show("settings")),this.button(e,"\u{1F3AE}  CONTROLS",()=>this.show("controls")),this.button(e,"\u26F6  FULLSCREEN",()=>this.app.toggleFullscreen());let n=je("div","footer",this.root);this.padStatus(n)}padStatus(t){let e=()=>{let n=this.app.input.connectedPads();if(this.app.input.gamepadBlocked){t.innerHTML='<span class="footer-hint warn">\u26A0\uFE0F Controllers are blocked on this page. Keyboard &amp; mouse work. For controllers, open the game from its own web address.</span>';return}t.innerHTML=n.length?n.map((i,r)=>`<span class="pad-chip">\u{1F3AE} ${ih(i.id)} ${r+1}</span>`).join("")+'<span class="footer-hint">\u24B6 select \xB7 \u24B7 back</span>':'<span class="footer-hint">Connect an Xbox controller and press any button \xB7 or use mouse / keyboard (Enter to select)</span>'};e(),this.footerTimer=setInterval(()=>{t.isConnected?e():clearInterval(this.footerTimer)},1e3)}screen_setup(t){let e=this.app.settings,n=Iy[t],i=this.panel(n.title,t==="solo"?"You (blue) vs CPU (orange)":t==="versus"?"Player 1 (blue) vs Player 2 (orange) \xB7 split screen":"Player 1 & Player 2 (blue) vs CPU (orange) \xB7 split screen"),r=t==="coop"?[{label:"2 vs 2",value:2},{label:"3 vs 3",value:3}]:[{label:"1 vs 1",value:1},{label:"2 vs 2",value:2},{label:"3 vs 3",value:3}],a="teamSize_"+t;r.some(l=>l.value===e[a])||(e[a]=r[0].value),this.option(i,"Game mode",[{label:"Soccar",value:"soccar"},{label:"Heatseeker (ball homes in)",value:"heatseeker"},{label:"Rumble (power-ups)",value:"rumble"}],()=>e.gameMode,l=>{e.gameMode=l}),this.option(i,"Power-ups (Rumble)",[{label:"All, random",value:"all"}].concat(Ur.map(l=>({label:`${lo[l].name} only`,value:l}))),()=>e.items,l=>{e.items=l}),this.option(i,"Team size",r,()=>e[a],l=>{e[a]=l}),this.option(i,"Match length",[{label:"3 minutes",value:180},{label:"5 minutes",value:300},{label:"7 minutes",value:420},{label:"1 minute",value:60},{label:"Unlimited",value:0}],()=>e.duration,l=>{e.duration=l}),this.option(i,"CPU skill",[{label:"Rookie",value:"rookie"},{label:"Pro",value:"pro"},{label:"All-Star",value:"allstar"}],()=>e.difficulty,l=>{e.difficulty=l}),this.option(i,"Stadium",[{label:"Night",value:"night"},{label:"Sunset",value:"sunset"}],()=>e.timeOfDay,l=>{e.timeOfDay=l}),t!=="solo"&&this.option(i,"Split screen",[{label:"Top / Bottom",value:"horizontal"},{label:"Side by side",value:"vertical"}],()=>e.split,l=>{e.split=l});let o=()=>{this.app.saveSettings(),t==="solo"?this.app.startMatch({mode:t,gameMode:e.gameMode,items:e.items,teamSize:e[a],duration:e.duration,difficulty:e.difficulty,split:e.split,humans:[{device:{type:"any"},team:0,name:"You"}]}):this.show("join",t)};this.button(i,t==="solo"?"\u25B6  KICK OFF":"\u25B6  CONTINUE",o,"primary"),this.button(i,"\u25C0  BACK",()=>this.show("main")),this.onBack=()=>this.show("main"),this.focus=this.items.length-2}screen_join(t){let e=this.app.settings,n=this.app.input,i=this.panel("PRESS TO JOIN","Controller players press <b>\u24B6</b>. The keyboard &amp; mouse player clicks a slot or presses <b>Space</b>."),r=je("div","join-blocked",i),a=je("div","join-slots",i);this.joinSlots=[null,null];let o=(p,m)=>p&&m&&p.type===m.type&&(p.type==="pad"?p.index===m.index:p.layout===m.layout),l=p=>p.type==="pad"?"\u{1F3AE} "+ih(n.pads[p.index]?.id):p.layout==="p1"?"\u2328\uFE0F\u{1F5B1}\uFE0F Keyboard &amp; Mouse":"\u2328\uFE0F Keyboard (arrow keys)",c=()=>!!(this.joinSlots[0]&&this.joinSlots[1]),h=()=>{},u=(p,m)=>{if(this.joinSlots.some(b=>o(b,p)))return!1;let x=m>=0&&!this.joinSlots[m]?m:this.joinSlots.findIndex(b=>!b);return x<0?!1:(this.joinSlots[x]=p,this.app.audio.select(),p.type==="pad"&&n.rumble(p,.5,.5,150),h(),!0)},d=[0,1].map(p=>{let m=t==="versus"?p:0,x=je("div","join-slot team"+m,a);je("div","join-title",x,`PLAYER ${p+1}`);let b=je("div","join-body",x);return x.addEventListener("click",()=>{this.joinSlots[p]||u({type:"kb",layout:"p1"},p)||u({type:"kb",layout:"p2"},p)}),{box:x,body:b,team:m}}),f=je("div","join-status",i),g=()=>{if(!c())return;let p=this.joinSlots.map((x,b)=>({device:x,team:t==="versus"?b:0,name:`Player ${b+1}`})),m=e["teamSize_"+t];this.app.startMatch({mode:t,gameMode:e.gameMode,items:e.items,teamSize:m,duration:e.duration,difficulty:e.difficulty,split:e.split,humans:p})},_=this.button(i,"\u25B6  START MATCH",g,"primary");this.button(i,"\u25C0  BACK",()=>this.show("setup",t)),h=()=>{d.forEach((p,m)=>{let x=this.joinSlots[m];if(p.box.classList.toggle("joined",!!x),p.box.classList.toggle("clickable",!x),x){let b=x.type==="pad"?"Press \u24B7 to leave":"Press Backspace to leave";p.body.innerHTML=`<div class="join-device">${l(x)}</div><div class="join-team" style="color:${ke[p.team].css}">${p.team===0?"BLUE":"ORANGE"} TEAM</div><div class="join-leave">${b}</div>`}else p.body.innerHTML='<div class="join-wait">Press <b>\u24B6</b> on a controller<br><span><b>Click here</b> or press <b>Space</b> for keyboard &amp; mouse</span></div>'}),f.innerHTML=c()?"<b>Ready!</b> Press <b>\u24B6</b>, <b>Start</b>, <b>Enter</b> or click <b>Start match</b>":"Waiting for players\u2026",f.classList.toggle("ready",c()),_.el.classList.toggle("hidden",!c()),r.innerHTML=n.gamepadBlocked?"\u26A0\uFE0F This page is not allowed to read game controllers, so only keyboard &amp; mouse work here. To play with a controller, open the game from its own web address (GitHub Pages) or from the downloaded <b>index.html</b>.":"",r.classList.toggle("hidden",!n.gamepadBlocked)},h(),this.custom=p=>{for(let x of n.connectedPads()){let b={type:"pad",index:x.index},v=this.joinSlots.findIndex(S=>o(S,b));if(x.pressed("a")||x.pressed("menu")){if(v<0)u(b,-1);else if(c())return g(),!0}if(x.pressed("b"))if(v>=0)this.joinSlots[v]=null,this.app.audio.click(),h();else return this.show("setup",t),!0}let m=x=>n.keysPressed.has(x);if(c()&&(m("Space")||m("Enter")||m("NumpadEnter")))return g(),!0;if(m("Space")&&u({type:"kb",layout:"p1"},-1),(m("Enter")||m("NumpadEnter"))&&u({type:"kb",layout:"p2"},-1),m("Backspace")){for(let x=1;x>=0;x--)if(this.joinSlots[x]&&this.joinSlots[x].type==="kb"){this.joinSlots[x]=null,h();break}}return m("Escape")?(this.show("setup",t),!0):(n.gamepadBlocked&&!this.blockedShown&&(this.blockedShown=!0,h()),!0)}}screen_settings(){let t=this.app.settings,e=this.panel("SETTINGS");this.option(e,"Graphics",[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low (fast)",value:"low"}],()=>t.quality,i=>{t.quality=i}),this.option(e,"Handling",[{label:"Easy (recommended)",value:"easy"},{label:"Realistic (Rocket League)",value:"realistic"}],()=>t.handling,i=>{t.handling=i}),this.option(e,"Default camera",[{label:"Ball cam",value:!0},{label:"Car cam",value:!1}],()=>t.ballCam,i=>{t.ballCam=i}),this.option(e,"Field of view",[90,95,100,105,110].map(i=>({label:i+"\xB0",value:i})),()=>t.fov,i=>{t.fov=i}),this.option(e,"Goal replays",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.replays,i=>{t.replays=i}),this.option(e,"Controller rumble",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.rumble,i=>{t.rumble=i}),this.option(e,"Volume",[0,1,2,3,4,5,6,7,8,9,10].map(i=>({label:i===0?"Off":String(i),value:i/10})),()=>Math.round(t.volume*10)/10,i=>{t.volume=i,this.app.audio.setVolume(i)}),this.option(e,"Show FPS",[{label:"Off",value:!1},{label:"On",value:!0}],()=>t.showFps,i=>{t.showFps=i});let n=()=>{this.app.applySettings(),this.show("main")};this.button(e,"\u25C0  BACK",n,"primary"),this.onBack=n}screen_controls(){let t=this.panel("CONTROLS");t.classList.add("wide"),je("div","controls",t,gp),this.button(t,"\u25C0  BACK",()=>this.show("main"),"primary"),this.onBack=()=>this.show("main")}screen_pause(){let t=this.panel("PAUSED");this.button(t,"\u25B6  RESUME",()=>this.app.resume(),"primary"),this.button(t,"\u21BB  RESTART MATCH",()=>this.app.restartMatch()),this.button(t,"\u{1F3AE}  CONTROLS",()=>this.show("pauseControls")),this.button(t,"\u23CF  QUIT TO MENU",()=>this.app.quitToMenu()),this.onBack=()=>this.app.resume(),this.onStart=()=>this.app.resume()}screen_pauseControls(){let t=this.panel("CONTROLS");t.classList.add("wide"),je("div","controls",t,gp),this.button(t,"\u25C0  BACK",()=>this.show("pause"),"primary"),this.onBack=()=>this.show("pause")}screen_results(t){let e=this.panel(t.winner===0?"BLUE TEAM WINS":"ORANGE TEAM WINS");e.classList.add("wide","results",t.winner===0?"win-blue":"win-orange"),je("div","final-score",e,`<span class="b">${t.scores[0]}</span><span class="dash">\u2013</span><span class="o">${t.scores[1]}</span>`);let n=t.rows.map(i=>`<tr class="team${i.team}"><td class="nm">${i.name===t.mvp?'<span class="mvp">MVP</span> ':""}${i.name}${i.human?"":' <span class="cpu">CPU</span>'}</td><td>${i.score}</td><td>${i.goals}</td><td>${i.assists}</td><td>${i.saves}</td><td>${i.shots}</td><td>${i.demos}</td></tr>`).join("");je("table","stats",e,`<tr><th>Player</th><th>Score</th><th>Goals</th><th>Assists</th><th>Saves</th><th>Shots</th><th>Demos</th></tr>${n}`),this.button(e,"\u21BB  REMATCH",()=>this.app.restartMatch(),"primary"),this.button(e,"\u23CF  MAIN MENU",()=>this.app.quitToMenu()),this.onBack=()=>this.app.quitToMenu()}};var yp=Bt.halfX,Bu=Bt.halfZ,xp=Bt.height,Ly=Bt.chamfer,ws=Bt.cornerR,Nu=Bt.rampR,Fu=Bt.goalHalfW,Dy=Bt.goalH,Ny=Bt.goalDepth,Ts=yp-ws,As=Bu-ws,Ou=yp+Bu-Ly-ws*Math.SQRT2,_p=Ts,Fr=Ou-Ts,Br=Ou-As,vp=As;function Uu(s,t,e,n,i,r){let a=i-e,o=r-n,l=((s-e)*a+(t-n)*o)/(a*a+o*o);l=l<0?0:l>1?1:l;let c=s-e-a*l,h=t-n-o*l;return c*c+h*h}function zu(s,t){let e=s<0?-s:s,n=t<0?-t:t,i=Math.min(Uu(e,n,Ts,0,_p,Fr),Uu(e,n,_p,Fr,Br,vp),Uu(e,n,Br,vp,0,As)),r=e<Ts&&n<As&&e+n<Ou,a=Math.sqrt(i);return(r?-a:a)-ws}function Uy(s,t,e){let n=zu(s,e),i=Math.abs(t-xp/2)-xp/2,r=n+Nu,a=i+Nu,o=r>0?r:0,l=a>0?a:0;return-(Math.sqrt(o*o+l*l)+Math.min(Math.max(r,a),0)-Nu)}function Fy(s,t,e){return Math.min(Fu-Math.abs(s),t,Dy-t,Bu+Ny-Math.abs(e))}function Yn(s,t,e){let n=Uy(s,t,e),i=Fy(s,t,e);return n>i?n:i}function ji(s,t,e,n){let r=Yn(s+1,t,e)-Yn(s-1,t,e),a=Yn(s,t+1,e)-Yn(s,t-1,e),o=Yn(s,t,e+1)-Yn(s,t,e-1),l=Math.hypot(r,a,o)||1;return n.x=r/l,n.y=a/l,n.z=o/l,n}function Mp(s,t,e,n,i,r,a){let o=0;for(let l=0;l<32;l++){let c=Yn(s+n*o,t+i*o,e+r*o);if(c<.5)return o;if(o+=c,o>a)return-1}return o<=a?o:-1}function Or(s=220,t=5){let e=[[Ts,-Fr],[Ts,Fr],[Br,As],[-Br,As],[-Ts,Fr],[-Ts,-Fr],[-Br,-As],[Br,-As]],n=[],i=(a,o,l,c,h)=>{let u=n[n.length-1];u&&Math.abs(u.x-a)<1e-6&&Math.abs(u.z-o)<1e-6||n.push({x:a,z:o,nx:-l,nz:-c,wall:h})};for(let a=0;a<8;a++){let o=e[a],l=e[(a+1)%8],c=e[(a+2)%8],h=l[0]-o[0],u=l[1]-o[1],d=Math.hypot(h,u),f=[u/d,-h/d],g=a===2?"orange":a===6?"blue":a%2===0?"side":"corner",_=[],p=Math.max(1,Math.ceil(d/s));for(let R=0;R<=p;R++)_.push(R/p);if(g==="orange"||g==="blue"){for(let R of[Fu,-Fu]){let y=(R-o[0])/h;y>0&&y<1&&_.push(y)}_.sort((R,y)=>R-y)}for(let R of _)i(o[0]+h*R+f[0]*ws,o[1]+u*R+f[1]*ws,f[0],f[1],g);let m=c[0]-l[0],x=c[1]-l[1],b=Math.hypot(m,x),v=[x/b,-m/b],S=Math.atan2(f[1],f[0]),w=Math.atan2(v[1],v[0]);for(;w<S;)w+=Math.PI*2;for(let R=1;R<t;R++){let y=S+(w-S)*(R/t);i(l[0]+Math.cos(y)*ws,l[1]+Math.sin(y)*ws,Math.cos(y),Math.sin(y),"arc")}}let r=0;for(let a=0;a<n.length;a++)a>0&&(r+=Math.hypot(n[a].x-n[a-1].x,n[a].z-n[a-1].z)),n[a].s=r;return n.total=r+Math.hypot(n[0].x-n[n.length-1].x,n[0].z-n[n.length-1].z),n}var zr=new T,Hu=new T,bp=new T,ku=new T,Vu=new T,Gu=new T,By=Me.friction,Oy=2,zy=3e-4;function Ep(s,t,e){let n=Me.radius;s.vel.y-=Cn*t,e&&e(s,t),s.vel.multiplyScalar(1-Me.drag*t);let i=s.vel.length();i>Me.maxSpeed&&s.vel.multiplyScalar(Me.maxSpeed/i),s.pos.addScaledVector(s.vel,t);let r=0;for(let o=0;o<2;o++){let l=Yn(s.pos.x,s.pos.y,s.pos.z);if(l>=n)break;ji(s.pos.x,s.pos.y,s.pos.z,zr),s.pos.addScaledVector(zr,n-l);let c=s.vel.dot(zr);if(c<0){Hu.copy(zr).multiplyScalar(c),bp.copy(s.vel).sub(Hu),ku.crossVectors(zr,s.angVel).multiplyScalar(n),Vu.copy(bp).add(ku);let h=Math.max(Vu.length(),1e-4),u=-c/h,d=-c<40?0:Me.restitution,f=Gu.copy(Vu).multiplyScalar(-Math.min(1,Oy*u)*By);s.vel.addScaledVector(Hu,-(1+d)),s.vel.add(f),s.angVel.add(ku.crossVectors(f,zr).multiplyScalar(zy*n)),r=Math.max(r,-c)}}let a=s.angVel.length();return a>Me.maxSpin&&s.angVel.multiplyScalar(Me.maxSpin/a),r}var Dc=class{constructor(){this.pos=new T(0,Me.radius,0),this.vel=new T,this.angVel=new T,this.quat=new xe,this.prevPos=this.pos.clone(),this.prevQuat=this.quat.clone(),this.lastTouch=null,this.prevTouch=null,this.lastTouchTime=-10,this.frozen=!1,this.force=null,this.iceTimer=0,this.attachedTo=null}reset(){this.pos.set(0,Me.radius,0),this.vel.set(0,0,0),this.angVel.set(0,0,0),this.prevPos.copy(this.pos),this.lastTouch=null,this.prevTouch=null,this.frozen=!0,this.iceTimer=0,this.attachedTo=null}step(t){if(this.attachedTo||(this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.frozen))return 0;if(this.iceTimer>0)return this.iceTimer-=t,this.vel.set(0,0,0),this.angVel.multiplyScalar(.95),0;let e=Ep(this,t,this.force),n=this.angVel.length();return n>1e-4&&(Gu.copy(this.angVel).divideScalar(n),Sp.setFromAxisAngle(Gu,n*t),this.quat.premultiply(Sp).normalize()),e}goalState(){let t=Me.radius;if(Math.abs(this.pos.x)<Bt.goalHalfW&&this.pos.y<Bt.goalH){if(this.pos.z>Bt.halfZ+t)return 1;if(this.pos.z<-Bt.halfZ-t)return 0}return-1}},Sp=new xe;function Wu(s,t,e,n){let i={pos:s.pos.clone(),vel:s.vel.clone(),angVel:s.angVel.clone()},r=Math.round(t/e);if(n.length=0,s.frozen||s.attachedTo||s.iceTimer>0){for(let a=0;a<=r;a++)n.push({t:a*e,pos:i.pos.clone(),vel:s.frozen?new T:i.vel.clone()});return n}for(let a=0;a<=r;a++)n.push({t:a*e,pos:i.pos.clone(),vel:i.vel.clone()}),Ep(i,e,s.force);return n}var Nc=new T,Zn=new T,Fe=new T,Xu=new T,co=new T,qu=new T,ri=new T,Zs=new T,Bi=new T,wp=new xe,Yu=new T,Zu=new T,Tp=new T,Ap=new T,Rp=new T,Ju=new T,Fi=Nt.hitboxHalf;function Hy(s){return s<=500?.65:s<=2300?.65-.1*(s-500)/1800:Math.max(.3,.55-.25*(s-2300)/2300)}function ky(s,t,e,n){if(s.demolished||t.frozen)return!1;let i=Me.radius;s.hitboxCenter(Nc),wp.copy(s.quat).invert(),Zn.copy(t.pos).sub(Nc).applyQuaternion(wp);let r=Math.max(-Fi.x,Math.min(Fi.x,Zn.x)),a=Math.max(-Fi.y,Math.min(Fi.y,Zn.y)),o=Math.max(-Fi.z,Math.min(Fi.z,Zn.z)),l=Zn.x-r,c=Zn.y-a,h=Zn.z-o,u=Math.hypot(l,c,h);if(u>=i)return!1;if(u<.001){let S=Fi.x-Math.abs(Zn.x),w=Fi.y-Math.abs(Zn.y),R=Fi.z-Math.abs(Zn.z);l=c=h=0,S<w&&S<R?l=Math.sign(Zn.x)||1:w<R?c=Math.sign(Zn.y)||1:h=Math.sign(Zn.z)||1,u=0}else l/=u,c/=u,h/=u;Fe.set(l,c,h).applyQuaternion(s.quat);let d=i-u;Xu.set(r,a,o).applyQuaternion(s.quat).add(Nc);let f=Me.mass,g=Nt.mass;t.pos.addScaledVector(Fe,d*(g/(f+g))),s.pos.addScaledVector(Fe,-d*(f/(f+g)));let _=Math.min(4600,ri.copy(s.vel).sub(t.vel).length());co.copy(Xu).sub(s.pos),qu.crossVectors(s.angVel,co).add(s.vel);let p=ri.copy(t.vel).sub(qu).dot(Fe);if(p>=0)return!0;ri.crossVectors(co,Fe),s.applyInvInertia(ri),Zs.crossVectors(ri,co);let m=1/f+1/g+Fe.dot(Zs),x=-p/m;t.vel.addScaledVector(Fe,x/f),s.vel.addScaledVector(Fe,-x/g),s.onGround||(ri.crossVectors(co,Fe).multiplyScalar(-x*.5),s.angVel.add(s.applyInvInertia(ri))),ri.copy(qu).sub(t.vel),ri.addScaledVector(Fe,-ri.dot(Fe)),t.angVel.addScaledVector(Bi.crossVectors(Fe,ri),-.6/i);let b=-p;e-s.lastBallHit>.1&&(s.forward(Zs),Bi.copy(t.pos).sub(Nc),Bi.y*=.35,Bi.addScaledVector(Zs,-.35*Bi.dot(Zs)),Bi.normalize(),t.vel.addScaledVector(Bi,_*Hy(_)*(s.hitPower||1)),b=Math.max(b,_)),s.lastBallHit=e;let v=t.vel.length();return v>Me.maxSpeed&&t.vel.multiplyScalar(Me.maxSpeed/v),n&&n.push({type:"ballHit",car:s,strength:b,point:Xu.clone()}),!0}function Vy(s,t,e,n,i,r,a){let o=s.x-t.x*i,l=s.y-t.y*i,c=s.z-t.z*i,h=e.x-n.x*i,u=e.y-n.y*i,d=e.z-n.z*i,f=t.x*2*i,g=t.y*2*i,_=t.z*2*i,p=n.x*2*i,m=n.y*2*i,x=n.z*2*i,b=o-h,v=l-u,S=c-d,w=f*f+g*g+_*_,R=f*p+g*m+_*x,y=p*p+m*m+x*x,A=f*b+g*v+_*S,P=p*b+m*v+x*S,L=w*y-R*R,F=L>1e-6?(R*P-y*A)/L:0;F=Math.max(0,Math.min(1,F));let k=(R*F+P)/y;k<0?(k=0,F=Math.max(0,Math.min(1,-A/w))):k>1&&(k=1,F=Math.max(0,Math.min(1,(R-A)/w))),r.set(o+f*F,l+g*F,c+_*F),a.set(h+p*k,u+m*k,d+x*k)}var Gy=1100,Ku=new T;function Cp(s,t,e){if(s.team===t.team||s.demolished)return!1;s.forward(Ku);let n=s.vel.dot(e)-t.vel.dot(e);return s.hitPower>1?Ku.dot(e)>.25&&n>150:Ku.dot(e)<.5?!1:s.supersonic?n>300:s.boosting&&s.vel.length()>Gy&&n>700}function Wy(s,t,e,n,i){if(s.demolished||t.demolished||(s.hitboxCenter(Yu),t.hitboxCenter(Zu),Yu.distanceToSquared(Zu)>62500))return;s.forward(Tp),t.forward(Ap);let r=36;Vy(Yu,Tp,Zu,Ap,Fi.z-r*.6,Rp,Ju),Fe.copy(Ju).sub(Rp);let a=Fe.length();if(a>=r*2)return;a<.001?(Fe.set(1,0,0),a=0):Fe.divideScalar(a);let o=r*2-a;s.pos.addScaledVector(Fe,-o/2),t.pos.addScaledVector(Fe,o/2);let l=ri.copy(t.vel).sub(s.vel).dot(Fe);if(l>=0)return;Bi.copy(Fe).negate();let c=Cp(s,t,Fe),h=Cp(t,s,Bi);if(c||h){for(let[S,w]of[[s,t],[t,s]]){if(S===s?!c:!h)continue;let R=w.pos.clone();w.demolish(),S.stats.demos++,n&&n.push({type:"demo",car:w,by:S,point:R})}return}let u=s.id<t.id?s.id*1e3+t.id:t.id*1e3+s.id,d=i.get(u)??-10,f=s.vel.dot(Fe),g=-t.vel.dot(Fe),_=f>=g?s:t,p=_===s?t:s,m=_===s?Fe:Bi;_.forward(Zs);let x=Zs.dot(m)>.55,b=-(1+.3)*l/2;s.vel.addScaledVector(Fe,-b),t.vel.addScaledVector(Fe,b);let v=-l;x&&v>350&&e-d>.25&&(p.vel.addScaledVector(m,v*.55),p.vel.y+=Math.min(600,v*.28),p.noGround=.15,p.onGround=!1,i.set(u,e),n&&n.push({type:"bump",car:p,by:_,strength:v,point:Ju.clone()}))}var Uc=class{constructor(){this.ball=new Dc,this.cars=[],this.time=0,this.events=[],this.bumpTimes=new Map,this.pads=[];for(let[t,e]of Rc)this.pads.push({x:t,z:e,big:!0,active:!0,timer:0});for(let[t,e]of Cc)this.pads.push({x:t,z:e,big:!1,active:!0,timer:0});this.respawnIndex=0,this.mode=null}addCar(t){return t.events=this.events,this.cars.push(t),t}resetPads(){for(let t of this.pads)t.active=!0,t.timer=0}respawn(t){let e=Ru[this.respawnIndex++%Ru.length],n=t.team===0?1:-1,i=t.team===0?e[2]:Math.PI-e[2];t.place(e[0]*n,e[1]*n,i),this.events.push({type:"respawn",car:t})}step(t){this.time+=t;let{ball:e,cars:n,mode:i}=this;i&&i.preStep(t);for(let a of n){if(a.demolished){a.respawnTimer-=t,a.prevPos.copy(a.pos),a.respawnTimer<=0&&this.respawn(a);continue}a.step(t)}i&&i.preBall(t);let r=e.step(t);r>250&&this.events.push({type:"bounce",strength:r,point:e.pos.clone()});for(let a of n)e.attachedTo!==a&&ky(a,e,this.time,this.events)&&(e.lastTouch!==a&&(e.prevTouch=e.lastTouch,e.lastTouch=a),e.lastTouchTime=this.time,i&&i.onTouch(a));for(let a=0;a<n.length;a++)for(let o=a+1;o<n.length;o++)Wy(n[a],n[o],this.time,this.events,this.bumpTimes);for(let a of this.pads){if(!a.active){a.timer-=t,a.timer<=0&&(a.active=!0);continue}let o=a.big?208:144;for(let l of n){if(l.demolished||l.boost>=100||l.pos.y>180)continue;let c=l.pos.x-a.x,h=l.pos.z-a.z;if(c*c+h*h<o*o){l.boost=a.big?100:Math.min(100,l.boost+12),a.active=!1,a.timer=a.big?10:4,this.events.push({type:"boostPickup",car:l,big:a.big,pad:a});break}}}i&&i.postStep(t)}};var Pp=new T(0,1,0),Be=new T,Qe=new T,Fc=new T,Oi=new T,dn=new T,$u=new T,an=new T,ho=new T,Oe=new T,Bc=new T,Oc=new T,ju=new T,Js=new xe,uo=new xe,Ip=new xe,Un=Nt.hitboxHalf,Ge=Nt.hitboxOffset,Qu=new T(12/(Nt.mass*((2*Un.y)**2+(2*Un.z)**2)),12/(Nt.mass*((2*Un.x)**2+(2*Un.z)**2)),12/(Nt.mass*((2*Un.x)**2+(2*Un.y)**2))),fo=[];for(let s of[-1,1])for(let t of[-1,1])for(let e of[-1,1])fo.push(new T(Ge.x+s*Un.x,Ge.y+t*Un.y,Ge.z+e*Un.z));fo.push(new T(Ge.x,Ge.y+Un.y,Ge.z),new T(Ge.x,Ge.y-Un.y,Ge.z),new T(Ge.x+Un.x,Ge.y,Ge.z),new T(Ge.x-Un.x,Ge.y,Ge.z),new T(Ge.x,Ge.y,Ge.z+Un.z),new T(Ge.x,Ge.y,Ge.z-Un.z));function Xy(s){return s<1400?1600-1440*s/1400:s<1410?160*(1-(s-1400)/10):0}var Hr=[[0,.0069],[500,.00398],[1e3,.00235],[1500,.001375],[1750,.0011],[2500,88e-5]];function qy(s){s=Math.abs(s);for(let t=1;t<Hr.length;t++)if(s<=Hr[t][0]){let e=Hr[t-1],n=Hr[t],i=(s-e[0])/(n[0]-e[0]);return e[1]+(n[1]-e[1])*i}return Hr[Hr.length-1][1]}function Yy(){return{throttle:0,steer:0,pitch:0,yaw:0,roll:0,jump:!1,boost:!1,powerslide:!1,useItem:!1}}var Zy=0,zc=class{constructor(t,e="Player"){this.id=Zy++,this.team=t,this.name=e,this.pos=new T,this.vel=new T,this.angVel=new T,this.quat=new xe,this.prevPos=new T,this.prevQuat=new xe,this.input=Yy(),this.hitPower=1,this.handling="easy",this.prevJump=!1,this.boost=Au,this.onGround=!1,this.groundNormal=new T(0,1,0),this.wheelContacts=0,this.wheelDist=[0,0,0,0],this.hasJumped=!1,this.canDodge=!1,this.jumpHold=0,this.noGround=0,this.sinceJump=10,this.dodgeTime=0,this.dodgeAxis=new T,this.dodgePitchSign=0,this.boosting=!1,this.supersonic=!1,this.demolished=!1,this.respawnTimer=0,this.frozen=!1,this.turtleTime=0,this.selfRight=0,this.yawRate=0,this.steerVisual=0,this.wheelSpin=0,this.lastBallHit=-10,this.bodyHit=0,this.events=null,this.stats={goals:0,assists:0,shots:0,saves:0,demos:0,score:0}}forward(t){return t.set(0,0,1).applyQuaternion(this.quat)}up(t){return t.set(0,1,0).applyQuaternion(this.quat)}left(t){return t.set(1,0,0).applyQuaternion(this.quat)}hitboxCenter(t){return t.set(Ge.x,Ge.y,Ge.z).applyQuaternion(this.quat).add(this.pos)}place(t,e,n,i=Au){this.pos.set(t,Nt.restHeight,e),this.vel.set(0,0,0),this.angVel.set(0,0,0),this.quat.setFromAxisAngle(Pp,n),this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.boost=i,this.onGround=!0,this.groundNormal.set(0,1,0),this.hasJumped=!1,this.canDodge=!1,this.jumpHold=0,this.noGround=0,this.dodgeTime=0,this.demolished=!1,this.supersonic=!1,this.boosting=!1,this.turtleTime=0,this.yawRate=0}demolish(){this.demolished=!0,this.respawnTimer=3,this.vel.set(0,0,0),this.angVel.set(0,0,0),this.boosting=!1}speed(){return this.vel.length()}applyInvInertia(t){return Ip.copy(this.quat).invert(),t.applyQuaternion(Ip),t.x*=Qu.x,t.y*=Qu.y,t.z*=Qu.z,t.applyQuaternion(this.quat)}step(t){if(this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.demolished||this.frozen){this.boosting=!1,this.prevJump=this.input.jump;return}let e=this.input,n=e.jump&&!this.prevJump;this.prevJump=e.jump,this.sinceJump+=t,this.noGround>0&&(this.noGround-=t),this.forward(Be),this.up(Qe),this.left(Fc);let i=0,r=0;if($u.set(0,0,0),this.noGround<=0){let c=Nt.restHeight+14;for(let h=0;h<4;h++){let u=Nt.wheels[h];an.copy(this.pos).addScaledVector(Fc,u.x).addScaledVector(Be,u.z);let d=Mp(an.x,an.y,an.z,-Qe.x,-Qe.y,-Qe.z,c);this.wheelDist[h]=d,d>=0&&(i++,r+=d,an.addScaledVector(Qe,-d+2),ji(an.x,an.y,an.z,dn),$u.add(dn))}}else this.wheelDist.fill(-1);this.wheelContacts=i;let a=!1;i>=2&&(dn.copy($u).normalize(),dn.dot(Qe)>.55&&(a=!0,-Cn*dn.y>Nt.stickyAccel&&(a=!1,i>=3&&(this.hasJumped=!1,this.canDodge=!0,this.sinceJump=0))));let o=n;a&&n&&(o=!1,this.vel.addScaledVector(Qe,Nt.jumpImpulse),this.jumpHold=Nt.jumpHoldTime,this.hasJumped=!0,this.leftWithoutJump=!1,this.canDodge=!0,this.sinceJump=0,this.noGround=.12,a=!1,this.onGround=!1,this.events&&this.events.push({type:"jump",car:this})),a?this.groundStep(t,dn,r/i):this.airStep(t,o),this.bodyCollide(t,a);let l=this.vel.length();l>Nt.maxSpeed&&this.vel.multiplyScalar(Nt.maxSpeed/l),l>=Nt.supersonic?this.supersonic=!0:l<Nt.supersonic-100&&(this.supersonic=!1),this.steerVisual+=(e.steer-this.steerVisual)*Math.min(1,t*12),this.forward(Be),this.wheelSpin+=this.vel.dot(Be)/14*t}groundStep(t,e,n){let i=this.input,r=!this.onGround;if(this.onGround=!0,this.groundNormal.copy(e),this.hasJumped=!1,this.leftWithoutJump=!1,this.canDodge=!1,this.jumpHold=0,this.dodgeTime=0,this.turtleTime=0,this.selfRight=0,r){let b=-this.vel.dot(e);this.events&&b>250&&this.events.push({type:"land",car:this,strength:b})}this.up(Qe),Js.setFromUnitVectors(Qe,e),uo.identity().slerp(Js,1-Math.exp(-t*28)),this.quat.premultiply(uo).normalize(),this.vel.y-=Cn*t;let a=this.vel.dot(e);a<40&&this.vel.addScaledVector(e,-a),this.forward(Be),Be.addScaledVector(e,-Be.dot(e)).normalize(),Oi.crossVectors(Be,e).normalize();let o=this.vel.dot(Be),l=i.throttle,c=i.boost&&this.boost>0;c&&(l=1);let h=0;if(l!==0)o*l>=0||Math.abs(o)<25?h=Xy(Math.abs(o))*l:(h=Nt.brakeAccel*Math.sign(l),Math.abs(o)<Nt.brakeAccel*t&&(h=-o/t));else if(Math.abs(o)>0){let b=Math.min(Nt.coastDecel,Math.abs(o)/t);h=-Math.sign(o)*b}this.vel.addScaledVector(Be,h*t),c&&(this.vel.addScaledVector(Be,Nt.boostAccelGround*t),this.boost=Math.max(0,this.boost-Nt.boostUsePerSec*t)),this.boosting=c;let u=this.handling!=="realistic",d=this.vel.dot(Be),f=qy(d);u&&(f*=1+.55*Math.min(1,Math.max(0,(Math.abs(d)-400)/1600)));let g=-i.steer*f*d;i.powerslide&&(g*=1.35),this.yawRate+=(g-this.yawRate)*(1-Math.exp(-t*(u?26:18))),Math.abs(this.yawRate)>1e-5&&(Js.setFromAxisAngle(e,this.yawRate*t),this.quat.premultiply(Js).normalize(),u&&!i.powerslide&&this.vel.applyQuaternion(uo.identity().slerp(Js,.85)));let _=Math.min(1,Math.max(.3,(Cn*Math.max(0,e.y)+Nt.stickyAccel)/(Cn+Nt.stickyAccel))),p=(i.powerslide?2.2:u?30:14)*_;this.forward(Be),Be.addScaledVector(e,-Be.dot(e)).normalize(),Oi.crossVectors(Be,e).normalize();let m=this.vel.dot(Oi);this.vel.addScaledVector(Oi,-m*(1-Math.exp(-t*p))),this.pos.addScaledVector(this.vel,t);let x=Nt.restHeight-n;this.pos.addScaledVector(e,x*(1-Math.exp(-t*30))),this.angVel.copy(e).multiplyScalar(this.yawRate)}airStep(t,e){let n=this.input;this.onGround&&(this.onGround=!1,this.hasJumped||(this.canDodge=!0,this.sinceJump=0,this.hasJumped=!0,this.leftWithoutJump=!0)),this.onGround=!1,this.yawRate=0,this.forward(Be),this.up(Qe),this.left(Fc),Oi.copy(Fc).negate(),this.vel.y-=Cn*t,this.jumpHold>0&&(n.jump?(this.vel.addScaledVector(Qe,Nt.jumpHoldAccel*t),this.jumpHold-=t):this.jumpHold=0);let i=this.leftWithoutJump?1e9:Nt.doubleJumpWindow;if(e&&this.canDodge&&this.sinceJump<i){this.canDodge=!1,this.jumpHold=0;let l=-n.pitch,c=n.yaw;if(Math.abs(l)+Math.abs(c)>=.5){let h=l,u=c,d=Math.hypot(h,u);d>1&&(h/=d,u/=d),Oe.set(Be.x,0,Be.z),Oe.lengthSq()<1e-4&&Oe.set(-Qe.x,0,-Qe.z),Oe.normalize(),Bc.set(-Oe.z,0,Oe.x);let f=h>=0?Nt.dodgeImpulse:Nt.dodgeImpulse*1.066,g=this.vel.length(),_=Nt.dodgeImpulse*(1+.9*Math.min(1,g/Nt.maxSpeed));this.vel.addScaledVector(Oe,h*f).addScaledVector(Bc,u*_*.9),this.vel.y*=.35,this.angVel.copy(Oi).multiplyScalar(-h*Nt.maxAngVel).addScaledVector(Be,u*Nt.maxAngVel),this.dodgeTime=Nt.dodgeTime,this.dodgeAxis.copy(this.angVel),this.dodgePitchSign=Math.sign(-h),this.events&&this.events.push({type:"dodge",car:this})}else this.vel.addScaledVector(Qe,Nt.jumpImpulse),this.events&&this.events.push({type:"jump",car:this})}if(this.selfRight>0)this.selfRight-=t,Oe.set(Be.x,0,Be.z),Oe.lengthSq()<.001&&Oe.set(-Qe.x,0,-Qe.z),Oe.lengthSq()<1e-6&&Oe.set(0,0,1),Oe.normalize(),uo.setFromAxisAngle(Pp,Math.atan2(Oe.x,Oe.z)),this.quat.slerp(uo,1-Math.exp(-t*9)),this.angVel.set(0,0,0);else if(this.dodgeTime>0){if(this.dodgeTime-=t,this.dodgePitchSign!==0&&Math.sign(n.pitch)===this.dodgePitchSign&&Math.abs(n.pitch)>.5){let c=this.angVel.dot(Oi);this.angVel.addScaledVector(Oi,-c*Math.min(1,t*20))}}else{let l=n.pitch,c=n.yaw,h=n.roll;n.powerslide&&(h=Math.max(-1,Math.min(1,h+n.yaw)),c=0);let u=this.angVel.dot(Oi),d=this.angVel.dot(Qe),f=this.angVel.dot(Be);u+=(Nt.airPitch*l-Nt.dampPitch*u*(1-Math.abs(l)))*t,d+=(-Nt.airYaw*c-Nt.dampYaw*d*(1-Math.abs(c)))*t,f+=(Nt.airRoll*h-Nt.dampRoll*f)*t,this.angVel.copy(Oi).multiplyScalar(u).addScaledVector(Qe,d).addScaledVector(Be,f)}let r=this.angVel.length();r>Nt.maxAngVel&&this.angVel.multiplyScalar(Nt.maxAngVel/r);let a=n.boost&&this.boost>0;a?(this.vel.addScaledVector(Be,Nt.boostAccelAir*t),this.boost=Math.max(0,this.boost-Nt.boostUsePerSec*t)):n.throttle!==0&&this.vel.addScaledVector(Be,Nt.airThrottleAccel*n.throttle*t),this.boosting=a,this.pos.addScaledVector(this.vel,t);let o=this.angVel.length();o>1e-6&&(Oe.copy(this.angVel).divideScalar(o),Js.setFromAxisAngle(Oe,o*t),this.quat.premultiply(Js).normalize()),this.up(Qe),ji(this.pos.x,this.pos.y,this.pos.z,dn),this.turtled=this.bodyHit>0&&this.vel.lengthSq()<300*300&&Qe.dot(dn)<.5,this.turtled?(this.turtleTime+=t,(e&&this.turtleTime>.15||this.turtleTime>2.5)&&(this.vel.y+=340,this.selfRight=.6,this.turtleTime=0,this.canDodge=!1)):this.turtleTime=0}bodyCollide(t,e){this.bodyHit=Math.max(0,this.bodyHit-t);for(let n=0;n<3;n++){let i=0,r=-1;for(let u=0;u<fo.length;u++){an.copy(fo[u]).applyQuaternion(this.quat).add(this.pos);let d=Yn(an.x,an.y,an.z);if(d<i){if(e&&(ji(an.x,an.y,an.z,dn),this.up(Qe),Math.abs(dn.dot(Qe))>.6))continue;i=d,r=u}}if(r<0)return;if(an.copy(fo[r]).applyQuaternion(this.quat).add(this.pos),ji(an.x,an.y,an.z,dn),this.pos.addScaledVector(dn,-i+.1),this.bodyHit=.2,ho.copy(an).sub(this.pos),e){let u=this.vel.dot(dn);u<0&&this.vel.addScaledVector(dn,-u*1.2);continue}ju.crossVectors(this.angVel,ho).add(this.vel);let a=ju.dot(dn);if(a>=0)continue;Oe.crossVectors(ho,dn),this.applyInvInertia(Oe),Bc.crossVectors(Oe,ho);let o=1/Nt.mass+dn.dot(Bc),c=-(1+(a<-350?.3:0))*a/o;Oc.copy(dn).multiplyScalar(c),Oe.copy(ju).addScaledVector(dn,-a);let h=Oe.length();if(h>.001){Oe.divideScalar(h);let u=Math.min(.6*c,h*Nt.mass/2);Oc.addScaledVector(Oe,-u)}this.vel.addScaledVector(Oc,1/Nt.mass),Oe.crossVectors(ho,Oc),this.angVel.add(this.applyInvInertia(Oe))}}};var Lp={rookie:{itemDelay:2.5,replan:.32,aimError:650,boost:.35,dodge:!1,kickoffFlip:!1,jumpReach:200,aerial:!1,maxSpeed:1900,wrongSideCare:.4},pro:{itemDelay:1,replan:.14,aimError:260,boost:.85,dodge:!0,kickoffFlip:!0,jumpReach:420,aerial:!1,maxSpeed:2300,wrongSideCare:.8},allstar:{itemDelay:.4,replan:.05,aimError:90,boost:1,dodge:!0,kickoffFlip:!0,jumpReach:1300,aerial:!0,maxSpeed:2300,wrongSideCare:1}},fn=new T,Hc=new T,Rs=new T,Ks=new T,de=new T,ai=new T,Fn=new T,Jy=new T(0,-Cn,0),Dp=new T,zi=Me.radius,Hn=Bt.halfZ,Qi=Bt.goalHalfW;function Np(s){if(s<=0)return 0;let t=(Nt.jumpHoldAccel-Cn)/2;if(s<=74.6)return(-Nt.jumpImpulse+Math.sqrt(Nt.jumpImpulse**2+4*t*s))/(2*t);let e=453.3,i=e*e-4*325*(s-74.6);return i<0?1/0:.2+(e-Math.sqrt(i))/650}function Ky(s){if(s<=96)return Np(s);let t=712,n=t*t-4*325*(s-96);return n<0?1/0:.25+(t-Math.sqrt(n))/650}var kr=[[0,.0069],[500,.00398],[1e3,.00235],[1500,.001375],[1750,.0011],[2500,88e-5]];function $y(s){for(let t=1;t<kr.length;t++)if(s<=kr[t][0]){let e=kr[t-1],n=kr[t];return e[1]+(n[1]-e[1])*(s-e[0])/(n[0]-e[0])}return kr[kr.length-1][1]}function jy(s,t,e,n){t=Math.max(0,Math.min(t,e));let i=(e-t)/n,r=(t+e)/2*i;return s<=r?(-t+Math.sqrt(t*t+2*n*s))/n:i+(s-r)/e}var kc=class{constructor(t,e="pro"){this.car=t,this.cfg=Lp[e]||Lp.pro,this.replanT=Math.random()*.1,this.target=new T,this.ballTarget=new T,this.desiredSpeed=2300,this.interceptT=1,this.mode="chase",this.seq=null,this.seqT=0,this.stuckT=0,this.reverseT=0,this.aimOffset=(Math.random()-.5)*this.cfg.aimError,this.aerialing=!1,this.lastJumpAt=-10,this.careT=0,this.cares=!0,this.retreatStart=-10}get attackSign(){return this.car.team===0?1:-1}startSeq(t){this.seq=t,this.seqT=0}wantItem(t){let e=t.rumble;if(!e)return!1;let n=e.st(this.car);if(!n.item||n.active||n.held<this.cfg.itemDelay)return!1;let i=this.car,r=t.world.ball,a=this.attackSign,o=i.pos.distanceTo(r.pos);i.forward(fn),de.copy(r.pos).sub(i.pos).normalize();let l=de.dot(fn),c=r.vel.z*a<-500,h=!1;switch(n.item){case"grapple":h=o>900&&o<3800&&l>.6&&r.pos.y<1500;break;case"plunger":h=o>900&&o<3800&&(c||r.pos.z*a<-2500);break;case"tornado":h=o<700;break;case"curveball":h=o<4500&&r.vel.z*a>300&&r.pos.z*a>-500;break;case"spikes":case"power":h=!0;break;case"boot":h=!!e.nearestOpponent(i,2200);break;case"freezer":h=c&&r.pos.z*a<-1500&&o<6e3;break;default:break}return!h&&n.held>12&&(h=e.inRange(i,n.item)),h}update(t,e){let n=this.car,i=n.input;if(n.demolished)return;let r=this.wantItem(e);if(i.useItem=r&&!this.itemTap,this.itemTap=i.useItem,this.replanT-=t,this.replanT<=0&&(this.replanT=this.cfg.replan*(.7+Math.random()*.6),this.plan(e)),i.throttle=0,i.steer=0,i.pitch=0,i.yaw=0,i.roll=0,i.boost=!1,i.powerslide=!1,this.seq){this.seqT+=t;let a=null;for(let o of this.seq)this.seqT>=o.t&&(a=o);if(!a||this.seqT>this.seq[this.seq.length-1].t+.05||a.end&&this.seqT>=a.t)this.seq=null;else{i.jump=!!a.jump,i.pitch=a.pitch||0,i.yaw=a.yaw||0,i.steer=a.yaw||0,i.throttle=a.throttle??1,i.boost=!!a.boost&&n.boost>0,a.aerial&&this.aerialControl(t,e);return}}if(i.jump=!1,!n.onGround){if(n.turtled){this.turtleTap=(this.turtleTap||0)+1,i.jump=this.turtleTap%8<4;return}this.aerialing?this.aerialControl(t,e):this.recover();return}this.aerialing=!1,this.drive(t,e)}plan(t){let e=this.car,n=t.world.ball,i=this.attackSign,r=t.pred;e.forward(fn);let a=e.vel.length(),o=e.boost>8&&this.cfg.boost>.3,l=o?Math.min(this.cfg.maxSpeed,2200):1400,c=o?1900:1e3;if(t.kickoff){if(this.isClosest(t,n.pos)){this.mode="kickoff",this.target.copy(n.pos).add(Fn.set(0,0,-i*40)),this.ballTarget.copy(n.pos),this.desiredSpeed=2300;return}this.mode="support",this.setSupportTarget(t,!0);return}let h=this.cfg.jumpReach,u=null,d=null;for(let x=2;x<r.length;x+=2){let b=r[x];if(!d&&b.pos.z*i<-(Hn+zi*.5)&&Math.abs(b.pos.x)<Qi+100&&(d=b),u||b.pos.y>h+zi)continue;this.shotDir(b.pos,d||t.threatOwn,ai),Fn.copy(b.pos).addScaledVector(ai,-(zi+70)),de.copy(Fn).sub(e.pos).setY(0);let v=de.length();de.normalize();let S=Math.acos(Te.clamp(de.dot(fn.clone().setY(0).normalize()),-1,1)),w=e.vel.dot(de),R=jy(Math.max(0,v-60),w,l,c)+S*.32;if(b.pos.y>150&&(R+=.1),R<=b.t+.02){u=b;break}}u||(u=r[r.length-1]),this.interceptT=u.t,this.ballTarget.copy(u.pos);let f=!0;for(let x of t.teammates){if(x===e||x.demolished)continue;let b=x.pos.distanceTo(u.pos)/Math.max(800,x.vel.length()*.8+600),v=e.pos.distanceTo(u.pos)/Math.max(800,a*.8+600),S=(u.pos.z-x.pos.z)*i>0;if(b+(S?0:.6)<v-.15){f=!1;break}}let g=(e.pos.z-u.pos.z)*i,_=u.pos.z*i<0;if(!!d&&(g>-200||f)){if(g>300){this.mode="retreat",this.setRetreatTarget(u.pos),this.desiredSpeed=2300;return}this.mode="save",this.setHitTarget(u,d);return}if(!f){if(e.boost<30&&Math.random()<this.cfg.boost&&this.setBoostTarget(t)){this.mode="boost";return}this.mode="support",this.setSupportTarget(t,!1);return}this.careT-=this.cfg.replan,this.careT<=0&&(this.careT=2,this.cares=Math.random()<this.cfg.wrongSideCare);let m=this.mode==="retreat"&&g>-150&&t.time-this.retreatStart<3;if(g>250&&this.cares||m){this.mode!=="retreat"&&(this.retreatStart=t.time),this.mode="retreat",_||g>1500?this.setRetreatTarget(u.pos):this.target.set(u.pos.x*.5+(e.pos.x>u.pos.x?900:-900),0,u.pos.z-i*1300),this.clampTarget(),this.desiredSpeed=2300;return}if(e.boost<15&&!_&&u.t>2.2&&this.setBoostTarget(t)){this.mode="boost";return}this.mode="attack",this.setHitTarget(u,null)}aimPoint(t,e){let n=this.attackSign;return e?Dp.set(t.x>=0?4e3:-4e3,0,t.z+n*3e3):Dp.set(Te.clamp(t.x*.25+this.aimOffset,-Qi+150,Qi-150),0,n*(Hn+300))}shotDir(t,e,n){let i=this.aimPoint(t,e);if(n.copy(i).sub(t).setY(0).normalize(),Rs.copy(t).sub(this.car.pos).setY(0),Rs.lengthSq()<1)return n;Rs.normalize();let r=Math.acos(Te.clamp(n.dot(Rs),-1,1)),a=Te.clamp((r-.6)/1.6,0,.75);return a>0&&n.lerp(Rs,a).normalize(),n}setHitTarget(t,e){let n=this.car;this.shotDir(t.pos,e,ai);let i=Fn.copy(t.pos).sub(n.pos).setY(0).length(),r=Te.clamp(i*.45,zi+40,1200);for(;r>zi+40&&(Fn.copy(t.pos).addScaledVector(ai,-r),!(zu(Fn.x,Fn.z)<-320&&Math.abs(Fn.z)<Hn-250));)r-=80;r=Math.max(r,zi+40),this.target.copy(t.pos).addScaledVector(ai,-r),this.target.y=0,this.clampTarget();let a=n.pos.distanceTo(this.target)+r,o=Math.max(.05,t.t),l=t.pos.y>180;this.desiredSpeed=l?Te.clamp(a/o,300,2300):2300,n.forward(fn),fn.setY(0).normalize();let c=Math.acos(Te.clamp(fn.dot(ai),-1,1));i<1100&&c>.6&&!e&&(this.desiredSpeed=Math.min(this.desiredSpeed,700+(1100-Math.min(1100,c*500))))}setRetreatTarget(t){let e=this.attackSign,n=t.x>0?-Qi*.8:Qi*.8;this.target.set(n,0,-e*(Hn-350))}setSupportTarget(t,e){let n=this.car,i=t.world.ball,r=this.attackSign,a=t.teammates.indexOf(n),o=a%2===0?-1:1;if(e)n.boost<60&&Math.abs(n.pos.x)>1e3?this.target.set(Math.sign(n.pos.x)*3072,0,-r*4096):this.target.set(0,0,-r*(Hn-500));else{let c=i.pos.z-r*(2200+a*900);this.target.set(i.pos.x*.35+o*1100,0,Math.max(-Hn+400,Math.min(Hn-400,c*r))*r)}this.clampTarget();let l=n.pos.distanceTo(this.target);this.desiredSpeed=l>1500?2300:l>400?1400:300}setBoostTarget(t){let e=this.car,n=this.attackSign,i=null,r=1/0;for(let a of t.world.pads){if(!a.big||!a.active||a.z*n>1500)continue;let o=Math.hypot(a.x-e.pos.x,a.z-e.pos.z);o<r&&(r=o,i=a)}return!i||r>4500?!1:(this.target.set(i.x,0,i.z),this.desiredSpeed=2300,!0)}clampTarget(){this.target.x=Te.clamp(this.target.x,-Bt.halfX+250,Bt.halfX-250),this.target.z=Te.clamp(this.target.z,-Hn+150,Hn-150)}isClosest(t,e){let n=this.car.pos.distanceTo(e);for(let i of t.teammates){if(i===this.car)continue;let r=i.pos.distanceTo(e);if(r<n-5||Math.abs(r-n)<=5&&i.pos.x*this.attackSign<this.car.pos.x*this.attackSign)return!1}return!0}drive(t,e){let n=this.car,i=n.input,r=n.groundNormal;n.forward(fn),Ks.crossVectors(fn,r).normalize();let a=n.vel.length(),o=n.vel.dot(fn),l=e.world.ball;if(l.attachedTo===n){Fn.set(0,0,this.attackSign*(Hn-300)),de.copy(Fn).sub(n.pos),de.addScaledVector(r,-de.dot(r));let P=Math.atan2(de.dot(Ks),de.dot(fn));i.throttle=1,i.steer=Te.clamp(P*3,-1,1),i.boost=Math.abs(P)<.4&&n.boost>0,de.length()<2600&&Math.abs(P)<.3&&e.time-this.lastJumpAt>1.2&&(this.lastJumpAt=e.time,this.startSeq([{t:0,jump:!0},{t:.06,jump:!1},{t:.09,jump:!0,pitch:-1},{t:.19,jump:!1,end:!0}]));return}let c=this.target,h=n.pos.distanceTo(l.pos);if((this.mode==="attack"||this.mode==="save"||this.mode==="kickoff")&&h<650&&l.pos.y<260&&(this.shotDir(l.pos,this.mode==="save",ai),Fn.copy(l.pos).addScaledVector(ai,-(zi*.6)),de.copy(l.pos).sub(n.pos).setY(0).normalize(),de.dot(ai)>.2&&(c=Fn)),Math.abs(n.pos.z)>Hn-60&&(Math.abs(c.x)>Qi-100||Math.abs(c.z)<Hn-200)){let P=Math.sign(n.pos.z);(Math.abs(n.pos.z)>Hn+60||Math.abs(n.pos.x)>Qi-80)&&(c=Fn.set(Te.clamp(c.x,-Qi+250,Qi-250),0,P*(Hn-500)))}de.copy(c).sub(n.pos),de.addScaledVector(r,-de.dot(r));let u=de.length(),d=Math.atan2(de.dot(Ks),de.dot(fn)),f=Te.clamp(d*3.2,-1,1),g=1,_=Math.abs(d)>1.6&&a>500,p=this.desiredSpeed;(this.mode==="support"||this.mode==="boost")&&(p=Math.min(p,u>1200?2300:Math.max(300,u*1.2)));let m=1/$y(Math.max(o,0));if(Math.abs(d)>.3&&u<2*m*Math.sin(Math.min(Math.abs(d),Math.PI/2))*1.05&&(p=Math.min(p,Math.max(250,o*.5)),Math.abs(d)>1&&(_=a>350)),o>p+250&&(g=o>p+600?-1:0),this.reverseT>0){this.reverseT-=t,i.throttle=-1,i.steer=-f;return}a<120&&g>0?(this.stuckT+=t,this.stuckT>1.2&&(this.reverseT=.8,this.stuckT=0)):this.stuckT=0;let x=!1;if(n.boost>0&&Math.abs(d)<.3&&o<Math.min(this.cfg.maxSpeed,p)-80&&u>400){let P=this.mode==="kickoff"||this.mode==="save"||this.mode==="retreat"?0:this.cfg.boost<1?20:8;x=n.boost>P&&Math.random()<this.cfg.boost+.1}if(o>this.cfg.maxSpeed-50&&(x=!1),i.throttle=g,i.steer=f,i.powerslide=_,i.boost=x,this.mode==="kickoff"&&this.cfg.kickoffFlip&&h<520+a*.12&&a>1100&&Math.abs(d)<.25){this.startSeq([{t:0,jump:!0,boost:!0},{t:.07,jump:!1,boost:!0},{t:.1,jump:!0,pitch:-1,yaw:Te.clamp(d*2,-.4,.4)},{t:.2,jump:!1,pitch:-1,end:!0}]);return}let b=e.time;if(b-this.lastJumpAt<1.2)return;let v=l.pos.y;de.copy(l.pos).sub(n.pos);let S=Math.hypot(de.x,de.z),w=n.vel.clone().sub(l.vel),R=Math.max(1,w.dot(de.clone().setY(0).normalize())),y=Math.max(0,S-110)/R,A=de.clone().setY(0).normalize().dot(fn.clone().setY(0).normalize());if(this.cfg.dodge&&v<220&&S<360&&A>.85&&a>600&&y<.2&&(this.mode==="attack"||this.mode==="save")){let P=Te.clamp(de.dot(Ks)/120,-.6,.6);this.lastJumpAt=b,this.startSeq([{t:0,jump:!0},{t:.06,jump:!1},{t:.09,jump:!0,pitch:-1,yaw:P},{t:.19,jump:!1,pitch:-.4,end:!0}]);return}if(v>190&&v<this.cfg.jumpReach+100&&A>.8&&S<1400){let P=v-110,L=P<230,F=L?Np(P):Ky(P),k=l.vel.y<0?(v-110-zi)/Math.max(1,-l.vel.y):1/0,N=Math.min(y,k+.3);Number.isFinite(F)&&Math.abs(N-F)<.06&&(L||this.cfg.jumpReach>350)&&(this.lastJumpAt=b,L?this.startSeq([{t:0,jump:!0},{t:Math.min(.2,F),jump:!0},{t:F+.02,jump:!1,end:!0}]):this.cfg.aerial&&P>520?(this.aerialing=!0,this.startSeq([{t:0,jump:!0,aerial:!0},{t:.2,jump:!1,aerial:!0},{t:.24,jump:!0,aerial:!0,boost:!0},{t:.3,jump:!1,aerial:!0,boost:!0,end:!0}])):this.startSeq([{t:0,jump:!0},{t:.2,jump:!1},{t:.24,jump:!0},{t:.3,jump:!1,end:!0}]))}else if(this.cfg.aerial&&v>520&&v<1500&&A>.9&&S<1500&&n.boost>30&&a>400){let P=this.interceptT,L=(v-120)/600+.3;Math.abs(P-L)<.25&&this.ballTarget.y>450&&(this.lastJumpAt=b,this.aerialing=!0,this.startSeq([{t:0,jump:!0,aerial:!0,boost:!0},{t:.2,jump:!1,aerial:!0,boost:!0},{t:.24,jump:!0,aerial:!0,boost:!0},{t:.3,jump:!1,aerial:!0,boost:!0,end:!0}]))}}orient(t,e){let n=this.car,i=n.input;n.forward(fn),n.up(Hc),n.left(Rs),Ks.copy(Rs).negate();let r=n.angVel,a=Math.atan2(t.dot(Hc),t.dot(fn)),o=Math.atan2(t.dot(Ks),t.dot(fn)),l=r.dot(Ks),c=-r.dot(Hc),h=r.dot(fn);i.pitch=Te.clamp(a*3.5-l*.55,-1,1),i.yaw=Te.clamp(o*3.5-c*.55,-1,1);let u=Math.atan2(Rs.dot(e),Hc.dot(e));i.roll=Te.clamp(u*2.5-h*.4,-1,1),i.steer=i.yaw,i.powerslide=!1}aerialControl(t,e){let n=this.car,i=n.input,r=e.world.ball,a=e.pred,o=a[a.length-1];for(let h=1;h<a.length;h++){let u=a[h],d=u.pos.distanceTo(n.pos)-zi-40,f=n.vel.length();if(d/Math.max(900,f+500*u.t)<=u.t){o=u;break}}let l=Math.max(.1,o.t);ai.copy(o.pos).sub(n.pos).addScaledVector(n.vel,-l).multiplyScalar(2/(l*l)).sub(Jy);let c=ai.length();(c>1500||n.boost<=0||n.pos.distanceTo(r.pos)<zi+60)&&c>1500&&!this.seq&&(this.aerialing=!1),de.copy(ai).normalize(),this.orient(de,Fn.set(0,1,0)),n.forward(fn),i.boost=n.boost>0&&fn.dot(de)>.75&&c>250,i.throttle=1}recover(){let t=this.car,e=t.input;de.set(t.vel.x,0,t.vel.z),de.lengthSq()<100&&(t.forward(de),de.y=0),de.normalize(),this.orient(de,Fn.set(0,1,0)),e.throttle=1,e.boost=!1}};var po=new T;function oi(s,t,e,n,i,r){let a=2*Math.PI*i/4,o=Math.max(r-2*i,0),l=Math.PI/4;po.copy(t),po[n]=0,po.normalize();let c=.5*a/(a+o),h=1-po.angleTo(s)/l;return Math.sign(po[e])===1?h*c:o/(a+o)+c+c*(1-h)}var xn=class s extends Ne{constructor(t=1,e=1,n=1,i=2,r=.1){let a=i*2+1;if(r=Math.min(t/2,e/2,n/2,r),super(1,1,1,a,a,a),this.type="RoundedBoxGeometry",this.parameters={width:t,height:e,depth:n,segments:i,radius:r},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let l=new T,c=new T,h=new T(t,e,n).divideScalar(2).subScalar(r),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,g=u.length/6,_=new T,p=.5/a;for(let m=0,x=0;m<u.length;m+=3,x+=2)switch(l.fromArray(u,m),c.copy(l),c.x-=Math.sign(c.x)*p,c.y-=Math.sign(c.y)*p,c.z-=Math.sign(c.z)*p,c.normalize(),u[m+0]=h.x*Math.sign(l.x)+c.x*r,u[m+1]=h.y*Math.sign(l.y)+c.y*r,u[m+2]=h.z*Math.sign(l.z)+c.z*r,d[m+0]=c.x,d[m+1]=c.y,d[m+2]=c.z,Math.floor(m/g)){case 0:_.set(1,0,0),f[x+0]=oi(_,c,"z","y",r,n),f[x+1]=1-oi(_,c,"y","z",r,e);break;case 1:_.set(-1,0,0),f[x+0]=1-oi(_,c,"z","y",r,n),f[x+1]=1-oi(_,c,"y","z",r,e);break;case 2:_.set(0,1,0),f[x+0]=1-oi(_,c,"x","z",r,t),f[x+1]=oi(_,c,"z","x",r,n);break;case 3:_.set(0,-1,0),f[x+0]=1-oi(_,c,"x","z",r,t),f[x+1]=1-oi(_,c,"z","x",r,n);break;case 4:_.set(0,0,1),f[x+0]=1-oi(_,c,"x","y",r,t),f[x+1]=1-oi(_,c,"y","x",r,e);break;case 5:_.set(0,0,-1),f[x+0]=oi(_,c,"x","y",r,t),f[x+1]=1-oi(_,c,"y","x",r,e);break}}static fromJSON(t){return new s(t.width,t.height,t.depth,t.segments,t.radius)}};function Cs(s,t){let e=document.createElement("canvas");return e.width=s,e.height=t,e}function Hi(s,{srgb:t=!0,repeat:e=!1,aniso:n=8}={}){let i=new An(s);return t&&(i.colorSpace=Ke),e&&(i.wrapS=i.wrapT=Ti),i.anisotropy=n,i}function Vr(s=1){let t=s>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var Jn={minZ:-(Bt.halfZ+Bt.goalDepth),maxZ:Bt.halfZ+Bt.goalDepth,halfX:Bt.halfX};function Up(s){let t=s==="low"?8:5.3333,e=Math.round(2*Bt.halfX/t),n=Math.round((Jn.maxZ-Jn.minZ)/t),i=Cs(e,n),r=i.getContext("2d"),a=x=>(x+Bt.halfX)/t,o=x=>(Jn.maxZ-x)/t,l=x=>x/t,c=512;for(let x=Jn.minZ;x<Jn.maxZ;x+=c){let b=Math.floor((x-Jn.minZ)/c);r.fillStyle=b%2?"#3f7f2c":"#356f25",r.fillRect(0,o(x+c),e,l(c)+1)}let h=r.createLinearGradient(0,o(-Bt.halfZ),0,o(0));h.addColorStop(0,"rgba(40,110,255,0.10)"),h.addColorStop(1,"rgba(40,110,255,0)"),r.fillStyle=h,r.fillRect(0,o(0),e,o(Jn.minZ)-o(0)),h=r.createLinearGradient(0,o(Bt.halfZ),0,o(0)),h.addColorStop(0,"rgba(255,120,30,0.10)"),h.addColorStop(1,"rgba(255,120,30,0)"),r.fillStyle=h,r.fillRect(0,0,e,o(0));let u=r.getImageData(0,0,e,n),d=u.data,f=Vr(7);for(let x=0;x<d.length;x+=4){let b=(f()-.5)*26+(f()<.04?-18:0);d[x]=Math.max(0,Math.min(255,d[x]+b*.6)),d[x+1]=Math.max(0,Math.min(255,d[x+1]+b)),d[x+2]=Math.max(0,Math.min(255,d[x+2]+b*.4))}r.putImageData(u,0,0);for(let x of[1,-1]){r.fillStyle="rgba(10,20,10,0.45)";let b=x*Bt.halfZ,v=x*(Bt.halfZ+Bt.goalDepth);r.fillRect(a(-Bt.goalHalfW),Math.min(o(b),o(v)),l(2*Bt.goalHalfW),Math.abs(o(v)-o(b)))}let g=(x,b)=>{r.lineWidth=l(x),r.strokeStyle=b};r.lineCap="round",r.lineJoin="round";let _="rgba(245,250,255,0.85)",p=Or(160,6);g(34,_),r.beginPath(),p.forEach((x,b)=>{let v=x.x+x.nx*(Bt.rampR+60),S=x.z+x.nz*(Bt.rampR+60);b===0?r.moveTo(a(v),o(S)):r.lineTo(a(v),o(S))}),r.closePath(),r.stroke(),r.beginPath(),r.moveTo(a(-Bt.halfX+340),o(0)),r.lineTo(a(Bt.halfX-340),o(0)),r.stroke(),r.beginPath(),r.arc(a(0),o(0),l(1e3),0,Math.PI*2),r.stroke(),r.fillStyle=_,r.beginPath(),r.arc(a(0),o(0),l(60),0,Math.PI*2),r.fill();for(let x of[-1,1]){let b=x<0?"rgba(70,150,255,0.95)":"rgba(255,140,50,0.95)",v=x*(Bt.halfZ-340);g(40,b),r.beginPath(),r.moveTo(a(-Bt.goalHalfW),o(x*Bt.halfZ)),r.lineTo(a(Bt.goalHalfW),o(x*Bt.halfZ)),r.stroke(),g(30,_),r.beginPath(),r.moveTo(a(-1800),o(v)),r.lineTo(a(-1800),o(x*(Bt.halfZ-1500))),r.lineTo(a(1800),o(x*(Bt.halfZ-1500))),r.lineTo(a(1800),o(v)),r.stroke(),g(26,b),r.beginPath(),r.moveTo(a(-1150),o(v)),r.lineTo(a(-1150),o(x*(Bt.halfZ-800))),r.lineTo(a(1150),o(x*(Bt.halfZ-800))),r.lineTo(a(1150),o(v)),r.stroke(),g(30,_),r.beginPath();let S=o(x*(Bt.halfZ-1500));x<0?r.arc(a(0),S,l(700),Math.PI,0,!1):r.arc(a(0),S,l(700),0,Math.PI,!1),r.stroke(),g(26,x<0?"rgba(70,150,255,0.55)":"rgba(255,140,50,0.55)");for(let w of[-2600,2600])for(let R=0;R<3;R++){let y=x*(2e3+R*260);r.beginPath(),r.moveTo(a(w-220),o(y+x*160)),r.lineTo(a(w),o(y)),r.lineTo(a(w+220),o(y+x*160)),r.stroke()}}return Hi(i,{aniso:16})}function Fp(){let t=Cs(256,256),e=t.getContext("2d"),n=e.createImageData(256,256),i=Vr(11),r=new Float32Array(256*256);for(let o=0;o<9e3;o++){let l=Math.floor(i()*256),c=Math.floor(i()*256),h=.35+i()*.65,u=1+Math.floor(i()*3);for(let d=0;d<u;d++){let f=(c+d)%256;r[f*256+l]=Math.max(r[f*256+l],h*(1-d*.2))}}for(let o=0;o<256*256;o++){let l=Math.round(r[o]*255);n.data[o*4]=l,n.data[o*4+1]=l,n.data[o*4+2]=l,n.data[o*4+3]=255}e.putImageData(n,0,0);let a=Hi(t,{srgb:!1,repeat:!0});return a.magFilter=rn,a}function td(s=3,t=512){let e=t/6,n=t,i=Math.round(Math.sqrt(3)*e*4),r=Cs(n,i),a=r.getContext("2d");a.fillStyle="#000",a.fillRect(0,0,n,i),a.strokeStyle="#fff",a.lineWidth=s;let o=Math.sqrt(3)*e;for(let l=-1;l<=5;l++)for(let c=-1;c<=5;c++){let h=1.5*e*l,u=o*(c+(l%2?.5:0));a.beginPath();for(let d=0;d<=6;d++){let f=Math.PI/3*d,g=h+e*Math.cos(f),_=u+e*Math.sin(f);d===0?a.moveTo(g,_):a.lineTo(g,_)}a.stroke()}return Hi(r,{srgb:!1,repeat:!0})}function ed(){let e=Cs(2048,128),n=e.getContext("2d"),i=n.createLinearGradient(0,0,0,128);i.addColorStop(0,"#05070c"),i.addColorStop(1,"#0b1220"),n.fillStyle=i,n.fillRect(0,0,2048,128);let r=["ROCKET ARENA","SUPERSONIC","ROCKET ARENA","BOOST","ROCKET ARENA","AERIAL CUP"],a=2048/r.length;return r.forEach((o,l)=>{let c=l*a;n.fillStyle="rgba(120,180,255,0.18)",n.fillRect(c+4,8,a-8,112),n.fillStyle=l%2?"#ff8a2a":"#4aa8ff",n.beginPath(),n.arc(c+58,128/2,30,0,Math.PI*2),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(c+58,128/2,18,0,Math.PI*2),n.fill(),n.fillStyle=l%2?"#ff8a2a":"#4aa8ff",n.beginPath(),n.arc(c+64,128/2-4,9,0,Math.PI*2),n.fill(),n.fillStyle="#f4f8ff",n.font="bold italic 54px Arial, Helvetica, sans-serif",n.textBaseline="middle",n.fillText(o,c+104,128/2+2,a-120)}),Hi(e,{repeat:!0})}function Bp(){let e=Cs(1024,512),n=e.getContext("2d");n.fillStyle="#14161c",n.fillRect(0,0,1024,512);let i=Vr(23),r=8,a=512/r,o=["#c8641c","#2a62c4","#9aa3ad","#1c1c1c","#8a2a2a","#b89a3a","#2a6a3a","#3a3f4a","#c8641c","#2a62c4","#30343c","#5a6070","#20232a"],l=["#c9a185","#b08060","#8a5a3c","#5a3a26","#d2b096"];for(let u=0;u<r;u++){let d=u*a;n.fillStyle=u%2?"#20232b":"#1a1d24",n.fillRect(0,d+a*.62,1024,a*.38),n.fillStyle="#2b3140",n.fillRect(0,d+a*.6,1024,3);for(let f=4;f<1020;f+=15+i()*4){if(i()<.12)continue;let g=o[Math.floor(i()*o.length)],_=l[Math.floor(i()*l.length)],p=d+a*(.32+i()*.08);n.fillStyle=g,n.fillRect(f-6,p,12,a*.36),n.fillStyle=_,n.beginPath(),n.arc(f,p-6,5.5,0,Math.PI*2),n.fill(),i()<.18&&(n.fillStyle=_,n.fillRect(f-9,p-18,3,16),n.fillRect(f+6,p-18,3,16)),i()<.06&&(n.fillStyle=i()<.5?"#ff7a1a":"#2f7bff",n.fillRect(f-10,p-26,20,10))}}let c=Cs(1024,512),h=c.getContext("2d");return h.filter="blur(1.2px) saturate(0.8)",h.drawImage(e,0,0),Hi(c,{repeat:!0})}function Op(s=1024){let t=s,e=s/2,n=(1+Math.sqrt(5))/2,i=[],r=(S,w,R,y)=>{let A=Math.hypot(S,w,R);i.push([S/A,w/A,R/A,y])};for(let S of[-1,1])for(let w of[-1,1])r(0,S,w*n,1),r(S,w*n,0,1),r(S*n,0,w,1);for(let S of[-1,1])for(let w of[-1,1])for(let R of[-1,1])r(S,w,R,0);for(let S of[-1,1])for(let w of[-1,1])r(0,S/n,w*n,0),r(S/n,w*n,0,0),r(S*n,0,w/n,0);let a=()=>{let S=Cs(t,e);return[S,S.getContext("2d")]},[o,l]=a(),[c,h]=a(),[u,d]=a(),[f,g]=a(),_=l.createImageData(t,e),p=h.createImageData(t,e),m=d.createImageData(t,e),x=g.createImageData(t,e),b=Vr(5),v=new Float32Array(2048);for(let S=0;S<v.length;S++)v[S]=b();for(let S=0;S<e;S++){let w=(S+.5)/e,R=Math.sin(Math.PI*w),y=Math.cos(Math.PI*w);for(let A=0;A<t;A++){let P=(A+.5)/t,L=-Math.cos(2*Math.PI*P)*R,F=y,k=Math.sin(2*Math.PI*P)*R,N=-2,z=-2,J=0;for(let St=0;St<32;St++){let Xt=i[St],he=L*Xt[0]+F*Xt[1]+k*Xt[2];he>N?(z=N,N=he,J=St):he>z&&(z=he)}let Y=i[J][3],rt=N-z,Z=rt<.006?1:rt<.014?1-(rt-.006)/.008:0,tt=Math.acos(Math.min(1,N)),it=v[(S>>4)%32*64+(A>>4)%64]*.08,It,Rt,re;Y?(It=52,Rt=58,re=66):(It=128,Rt=134,re=140);let ee=rt<.03?.85:1,ie=(1-Z*.85)*ee*(1+it),X=(S*t+A)*4;_.data[X]=It*ie,_.data[X+1]=Rt*ie,_.data[X+2]=re*ie,_.data[X+3]=255;let Q=0;Y&&(tt<.07?Q=1:tt>.12&&tt<.15&&(Q=.9)),p.data[X]=60*Q,p.data[X+1]=170*Q,p.data[X+2]=255*Q,p.data[X+3]=255;let _t=Z>0?200:Y?95:120;m.data[X]=_t,m.data[X+1]=_t,m.data[X+2]=_t,m.data[X+3]=255;let Vt=255*(1-Z)*(rt<.03?.6+rt*13:1);x.data[X]=Vt,x.data[X+1]=Vt,x.data[X+2]=Vt,x.data[X+3]=255}}return l.putImageData(_,0,0),h.putImageData(p,0,0),d.putImageData(m,0,0),g.putImageData(x,0,0),{map:Hi(o),emissiveMap:Hi(c),roughnessMap:Hi(u,{srgb:!1}),bumpMap:Hi(f,{srgb:!1})}}function zp(){let s=Cs(256,64),t=s.getContext("2d");t.fillStyle="#1b1b1d",t.fillRect(0,0,256,64),t.strokeStyle="#0a0a0b",t.lineWidth=6;for(let e=-64;e<320;e+=18)t.beginPath(),t.moveTo(e,0),t.lineTo(e+14,30),t.lineTo(e,64),t.stroke();return t.fillStyle="#0c0c0d",t.fillRect(0,30,256,4),Hi(s,{repeat:!0})}var Vc=null;function Hp(){if(Vc)return Vc;let s=zp();return s.repeat.set(3,1),Vc={tireMat:new te({color:2763308,map:s,roughness:.85,metalness:0}),tireSideMat:new te({color:1447447,roughness:.75}),rimMat:new te({color:10133672,roughness:.25,metalness:1}),darkMat:new te({color:1316120,roughness:.45,metalness:.5}),trimMat:new te({color:2237738,roughness:.6,metalness:.3}),glassMat:new Hs({color:724758,roughness:.05,metalness:.9,clearcoat:1,clearcoatRoughness:.03}),chromeMat:new te({color:14212580,roughness:.12,metalness:1}),tailMat:new te({color:4194304,emissive:16715808,emissiveIntensity:3.5}),headMat:new te({color:3355443,emissive:16773848,emissiveIntensity:2.2}),engineMat:new te({color:11735580,roughness:.35,metalness:.6}),spikeMat:new te({color:2830134,roughness:.3,metalness:.9,emissive:5246984,emissiveIntensity:.6})},Vc}function kp(s,t,e){let n=new Ji(s.map(([r,a])=>new at(r,a))),i=new La(n,{depth:t*2-e*2,bevelEnabled:!0,bevelThickness:e,bevelSize:e*.8,bevelSegments:4,curveSegments:8});return i.translate(0,0,-(t-e)),i.rotateY(-Math.PI/2),i}function Vp(s,t,e,n){let i=s.attributes.position;for(let r=0;r<i.count;r++){let a=Math.min(1,Math.max(0,(i.getY(r)-t)/(e-t)));i.setX(r,i.getX(r)*(1-n*a*a))}s.computeVertexNormals()}function tM(s,t){let e=document.createElement("canvas");e.width=256,e.height=160;let n=e.getContext("2d");n.font="italic 900 132px Arial Black, Arial, sans-serif",n.textAlign="center",n.textBaseline="middle",n.lineJoin="round",n.lineWidth=18,n.strokeStyle="#101216",n.strokeText(String(s),128,84),n.fillStyle="#f4f6fa",n.fillText(String(s),128,84),n.lineWidth=4,n.strokeStyle=t,n.strokeText(String(s),128,84);let i=new An(e);return i.colorSpace=Ke,i}var Gc=class{constructor(t,e=0){let n=Hp(),i=ke[t];this.team=t,this.root=new Xe,this.body=new Xe,this.body.scale.setScalar(.01),this.root.add(this.body);let r=new Hs({color:i.main,metalness:.55,roughness:.32,clearcoat:1,clearcoatRoughness:.06}),a=new Hs({color:i.dark,metalness:.6,roughness:.35,clearcoat:1,clearcoatRoughness:.1});this.paint=r;let o=(b,v,S=0,w=0,R=0,y=this.body)=>{let A=new gt(b,v);return A.position.set(S,w,R),A.castShadow=!0,A.receiveShadow=!0,y.add(A),A},c=kp([[-46,3],[-48,18],[-43,26],[-20,29],[10,27],[38,22],[60,17],[71,11],[72,4],[64,-1],[-40,-1]],31,6);Vp(c,8,30,.2),o(c,r);let u=kp([[-30,26],[-24,41],[-6,45],[8,42],[22,27]],24,4);Vp(u,27,45,.22),o(u,n.glassMat),o(new xn(40,3,22,2,1.5),r,0,45.2,-9);for(let b of[-1,1]){let v=o(new Ne(2.5,18,3),r,b*22.5,36,15);v.rotation.x=-.75}o(new Ne(10,1.2,40),n.darkMat,0,26.4,40).rotation.x=.17,o(new xn(18,6,14,2,2),n.darkMat,0,27.5,22);for(let b of Nt.wheels){let v=Math.sign(b.x),S=-Nt.restHeight+b.r,w=new Ye(b.r+5,b.r+5,17,20,1,!1,-Math.PI/2,Math.PI);w.rotateZ(Math.PI/2);let R=o(w,a,v*(Math.abs(b.x)+7),S+1,b.z);R.rotation.x=0;let y=new Li(b.r+5,1.6,6,20,Math.PI);y.rotateY(Math.PI/2),o(y,n.trimMat,v*(Math.abs(b.x)+15.5),S+1,b.z)}o(new xn(66,2.5,14,2,1),n.darkMat,0,-2.5,64),o(new xn(56,4,9,2,1.5),n.darkMat,0,2,-47);for(let b of[-1,1])o(new xn(5,7,52,2,2),n.trimMat,b*31,2,9);o(new xn(50,9,6,2,2.5),n.darkMat,0,5,70),o(new xn(62,4,10,2,1.5),n.trimMat,0,-1,66);for(let b of[-1,1])o(new xn(10,4,3,2,1.2),n.headMat,b*21,13,70.5);o(new xn(46,16,10,2,3),n.darkMat,0,14,-46),o(new xn(30,9,16,2,2.5),n.engineMat,0,32,-33),o(new xn(22,3,13,2,1),n.chromeMat,0,37.5,-33);for(let b of[-1,1]){let v=o(new Ye(3.4,4,8,14),n.chromeMat,b*7,42,-31);v.castShadow=!1,o(new Ii(2.8,14),n.darkMat,b*7,46.05,-31).rotation.x=-Math.PI/2}o(new xn(4,12,18,2,1.5),n.darkMat,16,31,-33);let d=new Ye(4.2,4.8,12,16);d.rotateX(Math.PI/2);let f=new Ii(3,16);for(let b of[-1,1]){o(d,n.chromeMat,b*13,9,-50);let v=o(f,n.darkMat,b*13,9,-56.1);v.rotation.y=Math.PI,v.castShadow=!1}for(let b of[-1,1]){let v=o(new xn(17,3.2,2,2,1),n.tailMat,b*26,21.5,-48.3);v.castShadow=!1}for(let b of[-1,1]){let v=o(new Ne(3,26,7),n.darkMat,b*17,40,-40);v.rotation.x=-.35}let g=o(new xn(80,3.5,20,2,1.5),r,0,53,-45);g.rotation.x=.12;for(let b of[-1,1])o(new xn(2.5,15,24,2,1),n.darkMat,b*40,50,-45);o(new Ye(.6,.6,22,6),n.darkMat,-16,56,-24),o(new Xn(2.4,10,8),r,-16,67,-24),this.wheels=[];let _={};for(let b of Nt.wheels){let v=Math.sign(b.x),S=new Xe;S.position.set(v*(Math.abs(b.x)+7),-Nt.restHeight+b.r,b.z);let w=new Xe;S.add(w);let R=b.r;if(!_[R]){let A=new Ye(b.r,b.r,12,28,1,!0);A.rotateZ(Math.PI/2);let P=new Na(b.r*.62,b.r,28),L=new Ye(b.r*.64,b.r*.64,11,6);L.rotateZ(Math.PI/2);let F=new Ye(b.r*.22,b.r*.22,12.5,12);F.rotateZ(Math.PI/2),_[R]={tg:A,side:P,rim:L,hub:F}}let y=_[R];o(y.tg,n.tireMat,0,0,0,w);for(let A of[-1,1]){let P=o(y.side,n.tireSideMat,A*6,0,0,w);P.rotation.y=A*Math.PI/2}o(y.rim,n.rimMat,0,0,0,w),o(y.hub,n.chromeMat,0,0,0,w),this.body.add(S),this.wheels.push({pivot:S,spin:w,front:b.front,r:b.r,baseY:S.position.y})}let p=new Pt(...i.flame),m=new Zi(7,46,16,1,!0);m.translate(0,-23,0),m.rotateX(-Math.PI/2),this.flame=new gt(m,new _e({color:p.clone().multiplyScalar(1.4),transparent:!0,opacity:.75,blending:ln,depthWrite:!1,fog:!1})),this.flame.position.set(0,12,-50);let x=new Zi(3.6,26,12,1,!0);if(x.translate(0,-13,0),x.rotateX(-Math.PI/2),this.flameCore=new gt(x,new _e({color:new Pt(2.2,2.2,2.2),transparent:!0,opacity:.9,blending:ln,depthWrite:!1,fog:!1})),this.flame.add(this.flameCore),this.body.add(this.flame),this.flame.visible=!1,this.exhaustGlow=new gt(new Ii(6,16),new _e({color:p.clone().multiplyScalar(1.5),transparent:!0,opacity:.7,blending:ln,depthWrite:!1})),this.exhaustGlow.position.set(0,12,-51.5),this.exhaustGlow.rotation.y=Math.PI,this.body.add(this.exhaustGlow),this.flicker=0,e){let b=tM(e,i.css),v=new te({map:b,transparent:!0,roughness:.35,metalness:.2,polygonOffset:!0,polygonOffsetFactor:-2});for(let S of[-1,1]){let w=new gt(new gn(26,15),v);w.position.set(S*31.2,15,8),w.rotation.y=S*Math.PI/2,this.body.add(w)}}this.spikes=null,this.powerOn=!1}setSpikes(t){if(t&&!this.spikes){let e=Hp();this.spikes=new Xe;let n=new Zi(3.2,13,6),i=[[0,47,-9],[12,45,-2],[-12,45,-2],[12,45,-16],[-12,45,-16],[0,29,30],[14,25,44],[-14,25,44],[0,20,66],[33,22,30],[-33,22,30],[33,22,-14],[-33,22,-14],[0,26,-47]];for(let[r,a,o]of i){let l=new gt(n,e.spikeMat);l.position.set(r,a,o);let c=new T(r,a-18,o-10).normalize();l.quaternion.setFromUnitVectors(new T(0,1,0),c),this.spikes.add(l)}this.body.add(this.spikes)}this.spikes&&(this.spikes.visible=t)}setPower(t,e){t?(this.paint.emissive.setRGB(1,.08,.02),this.paint.emissiveIntensity=.5+Math.sin(e*14)*.25):this.powerOn&&(this.paint.emissive.setRGB(0,0,0),this.paint.emissiveIntensity=1),this.powerOn=t}update(t,e,n,i){if(this.root.visible=!t.demolished,t.demolished)return;this.root.position.set(e.x*.01,e.y*.01,e.z*.01),this.root.quaternion.copy(n);for(let a of this.wheels)a.spin.rotation.x=t.wheelSpin*(12.5/a.r),a.front&&(a.pivot.rotation.y=-t.steerVisual*.42);for(let a=0;a<4;a++){let o=this.wheels[a],l=t.wheelDist[a],c=l>=0?o.baseY+(Nt.restHeight-l)*.6:o.baseY-4;o.pivot.position.y+=(Math.max(o.baseY-6,Math.min(o.baseY+6,c))-o.pivot.position.y)*Math.min(1,i*20)}this.flicker+=i*40;let r=t.boosting;if(this.flame.visible=r,r){let a=.85+Math.sin(this.flicker)*.12+Math.random()*.15;this.flame.scale.set(a,a,a*(t.supersonic?1.35:1))}this.exhaustGlow.material.opacity=r?1:.45}};var Wc=class{constructor(t,e){this.max=t,this.count=0,this.p=new Float32Array(t*3),this.v=new Float32Array(t*3),this.life=new Float32Array(t),this.maxLife=new Float32Array(t),this.size=new Float32Array(t*2),this.c0=new Float32Array(t*4),this.c1=new Float32Array(t*4),this.phys=new Float32Array(t*4);let n=new Va,i=new gn(1,1);n.index=i.index,n.setAttribute("position",i.attributes.position),n.setAttribute("uv",i.attributes.uv),this.aPos=new Pi(new Float32Array(t*3),3).setUsage(Ss),this.aCol=new Pi(new Float32Array(t*4),4).setUsage(Ss),this.aSR=new Pi(new Float32Array(t*2),2).setUsage(Ss),n.setAttribute("iPos",this.aPos),n.setAttribute("iCol",this.aCol),n.setAttribute("iSR",this.aSR),n.instanceCount=0,this.geo=n;let r=new Ue({transparent:!0,depthWrite:!1,blending:e?ln:Di,uniforms:{},vertexShader:`
        attribute vec3 iPos; attribute vec4 iCol; attribute vec2 iSR;
        varying vec2 vUv; varying vec4 vCol; varying float vSeed;
        void main() {
          vec4 mv = viewMatrix * vec4(iPos, 1.0);
          float c = cos(iSR.y), s = sin(iSR.y);
          vec2 p = vec2(c * position.x - s * position.y, s * position.x + c * position.y) * iSR.x;
          mv.xy += p;
          vUv = uv;
          vCol = iCol;
          vSeed = fract(iPos.x * 3.17 + iPos.z * 1.31);
          gl_Position = projectionMatrix * mv;
        }`,fragmentShader:e?`
        varying vec2 vUv; varying vec4 vCol;
        void main() {
          float r = length(vUv - 0.5) * 2.0;
          float a = 1.0 - smoothstep(0.0, 1.0, r);
          a *= a;
          gl_FragColor = vec4(vCol.rgb, vCol.a * a);
          #include <colorspace_fragment>
        }`:`
        varying vec2 vUv; varying vec4 vCol; varying float vSeed;
        float h(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
        float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
        void main() {
          vec2 d = vUv - 0.5;
          float r = length(d) * 2.0;
          float puff = n(vUv * 4.0 + vSeed * 17.0) * 0.6 + n(vUv * 9.0 - vSeed * 5.0) * 0.4;
          float a = (1.0 - smoothstep(0.35, 1.0, r + (puff - 0.5) * 0.5));
          gl_FragColor = vec4(vCol.rgb * (0.8 + puff * 0.4), vCol.a * a);
          #include <colorspace_fragment>
        }`});this.mesh=new gt(n,r),this.mesh.frustumCulled=!1,this.mesh.renderOrder=e?5:4}emit(t,e,n,i,r,a,o,l,c,h,u,d=0,f=0,g=0){let _;this.count<this.max?_=this.count++:_=Math.floor(Math.random()*this.max),this.p[_*3]=t,this.p[_*3+1]=e,this.p[_*3+2]=n,this.v[_*3]=i,this.v[_*3+1]=r,this.v[_*3+2]=a,this.life[_]=o,this.maxLife[_]=o,this.size[_*2]=l,this.size[_*2+1]=c,this.c0.set(h,_*4),this.c1.set(u,_*4),this.phys[_*4]=d,this.phys[_*4+1]=f,this.phys[_*4+2]=Math.random()*6.28,this.phys[_*4+3]=g}update(t){let{p:e,v:n,life:i,maxLife:r,size:a,c0:o,c1:l,phys:c}=this,h=this.aPos.array,u=this.aCol.array,d=this.aSR.array,f=this.count;for(let g=0;g<f;g++){if(i[g]-=t,i[g]<=0){f--,g!==f&&(e.copyWithin(g*3,f*3,f*3+3),n.copyWithin(g*3,f*3,f*3+3),i[g]=i[f],r[g]=r[f],a.copyWithin(g*2,f*2,f*2+2),o.copyWithin(g*4,f*4,f*4+4),l.copyWithin(g*4,f*4,f*4+4),c.copyWithin(g*4,f*4,f*4+4),g--);continue}let _=Math.max(0,1-c[g*4]*t);n[g*3]*=_,n[g*3+1]=n[g*3+1]*_-c[g*4+1]*t,n[g*3+2]*=_,e[g*3]+=n[g*3]*t,e[g*3+1]+=n[g*3+1]*t,e[g*3+2]+=n[g*3+2]*t,c[g*4+2]+=c[g*4+3]*t}this.count=f;for(let g=0;g<f;g++){let _=1-i[g]/r[g];h[g*3]=e[g*3],h[g*3+1]=e[g*3+1],h[g*3+2]=e[g*3+2];for(let p=0;p<4;p++)u[g*4+p]=o[g*4+p]+(l[g*4+p]-o[g*4+p])*_;d[g*2]=a[g*2]+(a[g*2+1]-a[g*2])*_,d[g*2+1]=c[g*4+2]}this.geo.instanceCount=f,f>0&&(this.aPos.clearUpdateRanges(),this.aPos.addUpdateRange(0,f*3),this.aPos.needsUpdate=!0,this.aCol.clearUpdateRanges(),this.aCol.addUpdateRange(0,f*4),this.aCol.needsUpdate=!0,this.aSR.clearUpdateRanges(),this.aSR.addUpdateRange(0,f*2),this.aSR.needsUpdate=!0)}clear(){this.count=0,this.geo.instanceCount=0}},be=new T,Ze=new T,nd=new T,Gr=new T,Ie=new T,ot=(s,t)=>s+Math.random()*(t-s),Xc=class{constructor(t,e){this.scene=t,this.mult=e==="low"?.45:e==="medium"?.75:1,this.glow=new Wc(e==="low"?1500:4e3,!0),this.smoke=new Wc(e==="low"?600:1800,!1),t.add(this.glow.mesh,this.smoke.mesh),this.flashes=[],this.sphereGeo=new Xn(1,32,16),this.ringGeo=new Li(1,.06,8,64)}clear(){this.glow.clear(),this.smoke.clear();for(let t of this.flashes)this.scene.remove(t.mesh);this.flashes.length=0}carTrail(t,e,n,i){if(t.demolished)return;let r=ke[t.team];if(Ze.set(0,0,1).applyQuaternion(n),nd.set(0,1,0).applyQuaternion(n),Gr.set(1,0,0).applyQuaternion(n),t.boosting){Ie.copy(e).addScaledVector(Ze,-54).addScaledVector(nd,12).multiplyScalar(.01);let a=be.copy(t.vel).multiplyScalar(.01),o=Math.max(1,Math.round(i*150*this.mult)),l=r.flame,c=r.flameEnd;for(let h=0;h<o;h++){let u=ot(7,12),d=Math.random()*i;this.glow.emit(Ie.x-Ze.x*u*d+ot(-.03,.03),Ie.y-Ze.y*u*d+ot(-.03,.03),Ie.z-Ze.z*u*d+ot(-.03,.03),a.x*.2-Ze.x*u+ot(-.5,.5),a.y*.2-Ze.y*u+ot(-.5,.5),a.z*.2-Ze.z*u+ot(-.5,.5),ot(.1,.2),ot(.12,.2),ot(.3,.55),[l[0]*1.1,l[1]*1.1,l[2]*1.1,.55],[c[0],c[1],c[2],0],2,0)}if(Math.random()<i*40*this.mult){let h=[c[0]*.9+.1,c[1]*.9+.1,c[2]*.9+.1];this.smoke.emit(Ie.x-Ze.x*.4,Ie.y-Ze.y*.4,Ie.z-Ze.z*.4,a.x*.25-Ze.x*2+ot(-.4,.4),a.y*.25+ot(0,.6),a.z*.25-Ze.z*2+ot(-.4,.4),ot(.7,1.1),.35,ot(1.4,2.2),[h[0],h[1],h[2],.22],[.25,.25,.28,0],1.2,-.3,ot(-1,1))}}if(t.boosting&&Math.random()<i*60*this.mult){let a=r.flame,o=be.copy(t.vel).multiplyScalar(.01*.3);for(let l=0;l<2;l++)this.glow.emit(Ie.x,Ie.y,Ie.z,o.x-Ze.x*ot(4,9)+ot(-2.5,2.5),o.y+ot(-1,3),o.z-Ze.z*ot(4,9)+ot(-2.5,2.5),ot(.25,.55),ot(.05,.09),.02,[a[0]*3,a[1]*3,a[2]*3,1],[a[0],a[1]*.6,a[2]*.4,0],1.5,7)}if(t.supersonic)for(let a of[-1,1])Math.random()>.8*this.mult||(Ie.copy(e).addScaledVector(Gr,a*30).addScaledVector(Ze,-36).addScaledVector(nd,5).multiplyScalar(.01),this.glow.emit(Ie.x,Ie.y,Ie.z,0,0,0,.28,.12,.04,[1.6,1.7,1.8,.8],[.8,.9,1,0],0,0))}dirt(t,e,n,i,r){if(i<=0)return;Ze.set(0,0,1).applyQuaternion(n),Gr.set(1,0,0).applyQuaternion(n);let a=Math.round(r*70*i*this.mult+Math.random());for(let o=0;o<a;o++){let l=o%2?1:-1;Ie.copy(e).addScaledVector(Gr,l*34).addScaledVector(Ze,-36).multiplyScalar(.01);let c=ot(2,6),u=Math.random()<.45?[.12,.22,.06,1]:[.16,.11,.06,1];this.smoke.emit(Ie.x,.12,Ie.z,t.vel.x*.01*.2-Ze.x*c+Gr.x*l*ot(0,2),ot(2.5,5.5),t.vel.z*.01*.2-Ze.z*c+Gr.z*l*ot(0,2),ot(.5,.9),ot(.05,.11),ot(.04,.08),u,[u[0],u[1],u[2],.7],.3,13,ot(-10,10))}Math.random()<r*10*i*this.mult&&(Ie.copy(e).addScaledVector(Ze,-40).multiplyScalar(.01),this.smoke.emit(Ie.x,.15,Ie.z,-Ze.x*1.5,ot(.3,.9),-Ze.z*1.5,ot(.7,1.2),.3,ot(1,1.6),[.36,.33,.25,.3],[.3,.28,.24,0],1,-.2,ot(-1,1)))}pyro(t,e,n){let i=ke[e];for(let r of t){let a=Math.round(n*110*this.mult);for(let o=0;o<a;o++){let l=Math.random()<.5;this.glow.emit(r.x*.01+ot(-.3,.3),r.y*.01,r.z*.01+ot(-.3,.3),ot(-.8,.8),ot(14,22),ot(-.8,.8),ot(.35,.7),ot(.5,.9),ot(1.1,1.9),l?[2.1,1,.25,.85]:[i.flame[0]*1.6,i.flame[1]*1.1,i.flame[2]*.9,.8],[.9,.18,.03,0],1.2,2)}}}ballTrail(t,e){let n=t.vel.length();n<2600||Math.random()>(n-2600)/2e3*this.mult||(Ie.copy(e).multiplyScalar(.01),this.glow.emit(Ie.x+ot(-.3,.3),Ie.y+ot(-.3,.3),Ie.z+ot(-.3,.3),0,0,0,.35,1,.2,[.6,.85,1.4,.35],[.2,.4,1,0],0,0))}hit(t,e){let n=Ie.copy(t).multiplyScalar(.01),i=Math.round(Math.min(40,e/60)*this.mult);for(let r=0;r<i;r++){let a=ot(3,9)*Math.min(2,e/1500);be.set(ot(-1,1),ot(-.2,1),ot(-1,1)).normalize().multiplyScalar(a),this.glow.emit(n.x,n.y,n.z,be.x,be.y,be.z,ot(.15,.35),ot(.06,.12),.02,[3,2.6,1.8,1],[2,.8,.2,0],2,6)}e>1800&&this.flash(n,12575743,1.6,.18,2.5)}boostPickup(t){let e=Math.round((t.big?40:12)*this.mult);for(let n=0;n<e;n++)this.glow.emit(t.x*.01+ot(-.6,.6),ot(.1,.4),t.z*.01+ot(-.6,.6),ot(-1,1),ot(2,6),ot(-1,1),ot(.3,.6),ot(.1,.25),.02,[3,1.8,.4,1],[2,.6,.05,0],1,2)}flash(t,e,n,i,r=3){let a=new _e({color:new Pt(e).multiplyScalar(r),transparent:!0,blending:ln,depthWrite:!1,fog:!1}),o=new gt(this.sphereGeo,a);o.position.copy(t),o.scale.setScalar(.01),this.scene.add(o),this.flashes.push({mesh:o,t:0,dur:i,size:n,kind:"sphere"})}ring(t,e,n,i){let r=new _e({color:new Pt(e).multiplyScalar(4),transparent:!0,blending:ln,depthWrite:!1,fog:!1}),a=new gt(this.ringGeo,r);a.position.copy(t),a.rotation.x=Math.PI/2,this.scene.add(a),this.flashes.push({mesh:a,t:0,dur:i,size:n,kind:"ring"})}explosion(t,e,n){let i=ke[e],r=Ie.copy(t).multiplyScalar(.01).clone(),a=i.flame,o=i.flameEnd,l=Math.round((n?420:140)*this.mult),c=n?28:12;for(let u=0;u<l;u++)be.set(ot(-1,1),ot(-.3,1),ot(-1,1)).normalize().multiplyScalar(ot(.2,1)*c),this.glow.emit(r.x,r.y,r.z,be.x,be.y,be.z,ot(.5,n?1.6:.9),ot(.3,.8),ot(.1,.4),[a[0]*3,a[1]*3,a[2]*3,1],[o[0]*2,o[1]*2,o[2]*2,0],2.2,n?3:4);let h=Math.round((n?90:40)*this.mult);for(let u=0;u<h;u++)be.set(ot(-1,1),ot(0,1),ot(-1,1)).normalize().multiplyScalar(ot(1,n?10:5)),this.smoke.emit(r.x,r.y,r.z,be.x,be.y,be.z,ot(1.2,2.4),ot(.8,1.4),ot(2.5,n?6:3.5),[.3,.3,.33,.55],[.12,.12,.14,0],1.6,-.6,ot(-1,1));this.flash(r,i.main,n?9:3,n?.55:.3,4),this.ring(r,i.light,n?26:8,n?.9:.5)}demolition(t,e){let n=ke[e],i=Ie.copy(t).multiplyScalar(.01).clone();i.y+=.3;let r=Math.round(170*this.mult);for(let c=0;c<r;c++){be.set(ot(-1,1),ot(-.2,1),ot(-1,1)).normalize().multiplyScalar(ot(2,11));let h=Math.random()<.35;this.glow.emit(i.x,i.y,i.z,be.x,be.y,be.z,ot(.3,.8),ot(.3,.7),ot(.1,.35),h?[1.8,1.3,.7,.7]:[1.6,.6,.12,.7],[.8,.15,.02,0],2.5,-1.5)}let a=Math.round(60*this.mult);for(let c=0;c<a;c++)be.set(ot(-1,1),ot(0,1.2),ot(-1,1)).normalize().multiplyScalar(ot(6,16)),this.glow.emit(i.x,i.y,i.z,be.x,be.y,be.z,ot(.4,.8),ot(.08,.16),.03,[n.flame[0]*3,n.flame[1]*3,n.flame[2]*3,1],[n.flameEnd[0],n.flameEnd[1],n.flameEnd[2],0],1,9);let o=Math.round(40*this.mult);for(let c=0;c<o;c++)be.set(ot(-1,1),ot(.4,1.4),ot(-1,1)).normalize().multiplyScalar(ot(5,13)),this.smoke.emit(i.x,i.y,i.z,be.x,be.y,be.z,ot(.8,1.5),ot(.12,.25),ot(.08,.15),[.05,.05,.06,1],[.05,.05,.06,.8],.4,14,ot(-12,12));let l=Math.round(70*this.mult);for(let c=0;c<l;c++)be.set(ot(-1,1),ot(.2,1),ot(-1,1)).normalize().multiplyScalar(ot(1,5)),this.smoke.emit(i.x,i.y,i.z,be.x,be.y,be.z,ot(1.6,3),ot(.8,1.4),ot(3,5.5),[.12,.1,.1,.75],[.05,.05,.06,0],1.3,-.8,ot(-1,1));this.flash(i,16747056,3,.25,2),this.ring(i,16756832,10,.55)}update(t){this.glow.update(t),this.smoke.update(t);for(let e=this.flashes.length-1;e>=0;e--){let n=this.flashes[e];n.t+=t;let i=n.t/n.dur;if(i>=1){this.scene.remove(n.mesh),n.mesh.material.dispose(),this.flashes.splice(e,1);continue}let r=1-Math.pow(1-i,3);n.mesh.scale.setScalar(Math.max(.01,n.size*r)),n.mesh.material.opacity=1-i}}};var eM=new T(0,1,0),Mn=new T,Kn=new T,id=new T,nM=new T,li=new T,Gp=new xe,Wr=new T,Wp=new xe;function mo(s,t,e,n){return Te.clamp(t.dot(e),-1,1)>.99999?s.copy(e):(Gp.setFromUnitVectors(t,e),Wp.identity().slerp(Gp,n),s.copy(t).applyQuaternion(Wp))}var Xr=class{constructor(t){this.camera=t,this.dir=new T(0,0,1),this.camUp=new T(0,1,0),this.look=new T(0,0,1),this.pos=new T,this.ballCam=!0,this.shake=0,this.first=!0,this.distance=280,this.height=105,this.lookYaw=0}snap(){this.first=!0}addShake(t){this.shake=Math.min(1.5,this.shake+t)}update(t,e,n,i,r,a=0,o=0){let l=e.onGround&&e.groundNormal.y>-.2,c=l?e.groundNormal:eM;this.first?this.camUp.copy(c):mo(this.camUp,this.camUp,c,1-Math.exp(-t*(l?9:4)));let h=this.camUp;this.ballCam&&r?Mn.copy(r).sub(n):(Mn.set(0,0,1).applyQuaternion(i),!e.onGround&&e.vel.lengthSq()>500*500&&Mn.lerp(Kn.copy(e.vel).normalize(),.5)),Mn.addScaledVector(c,-Mn.dot(c)),Mn.lengthSq()<1&&(Mn.set(0,0,1).applyQuaternion(i),Mn.addScaledVector(c,-Mn.dot(c)),Mn.lengthSq()<1e-4&&Mn.copy(this.dir)),Mn.normalize();let u=this.dir.dot(Mn);this.first?this.dir.copy(Mn):u<-.95?(Kn.crossVectors(h,this.dir).normalize(),this.dir.addScaledVector(Kn,.25).normalize()):mo(this.dir,this.dir,Mn,this.ballCam?1-Math.exp(-t*7.5):1-Math.exp(-t*6)),Kn.copy(this.dir).addScaledVector(h,-this.dir.dot(h)),Kn.lengthSq()<.001&&Kn.copy(Mn).addScaledVector(h,-Mn.dot(h)),Kn.lengthSq()>1e-6&&this.dir.copy(Kn).normalize(),this.lookYaw+=(a*Math.PI*.95-this.lookYaw)*Math.min(1,t*10);let d=nM.copy(this.dir);Math.abs(this.lookYaw)>.001&&d.applyAxisAngle(h,-this.lookYaw);let f=e.vel.length(),g=this.distance+Math.min(60,f*.02),_=Kn.copy(n).addScaledVector(d,-g).addScaledVector(h,this.height+o*-60);this.first?this.pos.copy(_):this.pos.lerp(_,1-Math.exp(-t*14));for(let m=0;m<2;m++){let x=Yn(this.pos.x,this.pos.y,this.pos.z);x<40&&(ji(this.pos.x,this.pos.y,this.pos.z,id),this.pos.addScaledVector(id,40-x))}if(Wr.copy(n).addScaledVector(h,70).addScaledVector(d,260),li.copy(Wr).sub(this.pos).normalize(),this.ballCam&&r&&Math.abs(this.lookYaw)<.3){let m=Kn.copy(r).sub(this.pos).normalize();li.copy(m);let x=id.copy(n).addScaledVector(h,10).sub(this.pos).normalize(),b=Te.degToRad(this.camera.fov*.5)*.82,v=Math.acos(Te.clamp(x.dot(li),-1,1));v>b&&mo(li,x,li,b/v);let S=li.dot(h);S<-.35&&li.addScaledVector(h,-.35-S).normalize()}this.first?this.look.copy(li):mo(this.look,this.look,li,1-Math.exp(-t*12)),this.first=!1,this.shake=Math.max(0,this.shake-t*2.2);let p=this.shake*this.shake*14;this.camera.up.copy(h),this.camera.position.set((this.pos.x+(Math.random()-.5)*p)*.01,(this.pos.y+(Math.random()-.5)*p)*.01,(this.pos.z+(Math.random()-.5)*p)*.01),Wr.copy(this.pos).addScaledVector(this.look,1e3).multiplyScalar(.01),this.camera.lookAt(Wr)}updateReplay(t,e,n,i){let r=Math.sign(e.x||1);Kn.set(r*2600+Math.sin(i*.3)*400,900,n*.55),this.first&&this.pos.copy(Kn),this.pos.lerp(Kn,1-Math.exp(-t*1.5)),li.copy(e).sub(this.pos).normalize(),this.first?this.look.copy(li):mo(this.look,this.look,li,1-Math.exp(-t*6)),this.first=!1,this.camera.up.set(0,1,0),this.camera.position.copy(this.pos).multiplyScalar(.01),Wr.copy(this.pos).addScaledVector(this.look,1e3).multiplyScalar(.01),this.camera.lookAt(Wr)}};var iM=new T(0,1,0),go=new T,qr=new T,Xp=new T,qp=new T,Pn=(s,t)=>s+Math.random()*(t-s);function sM(){let s=document.createElement("canvas");s.width=s.height=256;let t=s.getContext("2d");t.fillStyle="rgba(255,255,255,0.22)",t.fillRect(0,0,256,256);for(let n=0;n<80;n++){let i=Math.random()*256,r=6+Math.random()*26,a=t.createLinearGradient(i,0,i+r,0),o=.35+Math.random()*.6;a.addColorStop(0,"rgba(255,255,255,0)"),a.addColorStop(.5,`rgba(255,255,255,${o})`),a.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=a,t.save(),t.translate(i,128),t.transform(1,0,-.6,1,0,0),t.fillRect(-r/2,-160,r,320),t.restore()}let e=new An(s);return e.wrapS=e.wrapT=Ti,e}var qc=class{constructor(t,e,n){this.group=t,this.effects=e,this.mode=n,this.time=0,this.cableGeo=new Ye(1,1,1,6,1,!0),this.cableGeo.translate(0,.5,0),this.cableMat=new _e({color:new Pt(1.4,1.5,1.7)}),this.clawGeo=new Zi(.22,.5,8),this.clawMat=new te({color:13620960,metalness:1,roughness:.25,emissive:3820128}),this.cables=new Map,this.swirl=sM(),this.funnelGeos=[new Ye(9.5,1.4,21,40,1,!0),new Ye(7,1,19,40,1,!0),new Ye(4.5,.7,17,32,1,!0)].map(i=>(i.translate(0,i.parameters.height/2,0),i)),this.tornados=new Map,this.ice=new gt(new Da(Me.radius*.01*1.15,1),new te({color:13496063,emissive:4890584,emissiveIntensity:.6,roughness:.08,metalness:.1,transparent:!0,opacity:.55,flatShading:!0,depthWrite:!1})),this.ice.visible=!1,t.add(this.ice)}cableFor(t){let e=this.cables.get(t);if(!e){let n=new gt(this.cableGeo,this.cableMat),i=new gt(this.clawGeo,this.clawMat);n.frustumCulled=!1,this.group.add(n,i),e={cable:n,claw:i},this.cables.set(t,e)}return e}tornadoFor(t){let e=this.tornados.get(t);if(!e){let n=new Xe,i=this.funnelGeos.map((r,a)=>{let o=this.swirl.clone();o.needsUpdate=!0,o.repeat.set(3+a,1);let l=new gt(r,new _e({map:o,color:a===2?15789284:13813942,transparent:!0,opacity:[.62,.7,.45][a],depthWrite:!1,side:ve,blending:a===2?ln:Di}));return l.renderOrder=6,n.add(l),{m:l,tex:o,speed:[2.2,-3.1,4.5][a]}});this.group.add(n),e={g:n,parts:i,grow:0},this.tornados.set(t,e)}return e}update(t,e,n,i){this.time+=t;let r=this.mode,a=r.world.ball,o=this.effects,l=-1;if(r.name==="heatseeker"&&r.team>=0&&(l=r.team),r.name==="rumble"&&r.curve&&(l=r.curve.team),l>=0&&n.visible){let d=ke[l],f=Math.max(1,Math.round(t*90*o.mult));for(let g=0;g<f;g++)o.glow.emit(i.x*.01+Pn(-.4,.4),i.y*.01+Pn(-.4,.4),i.z*.01+Pn(-.4,.4),0,Pn(0,.5),0,Pn(.3,.55),Pn(.7,1.1),.15,[d.flame[0]*1.6,d.flame[1]*1.6,d.flame[2]*1.6,.6],[d.flameEnd[0],d.flameEnd[1],d.flameEnd[2],0],1.5,0);n.material.emissiveIntensity=3.2+Math.sin(this.time*12)*.6}else n.material.emissiveIntensity=2.4;let c=a.iceTimer>0;if(this.ice.visible=c&&n.visible,c&&(this.ice.position.copy(n.position),this.ice.rotation.y+=t*.4,Math.random()<t*20&&o.glow.emit(n.position.x+Pn(-1,1),n.position.y+Pn(-1,1),n.position.z+Pn(-1,1),0,-.3,0,.6,.12,.02,[1.6,2,2.4,.8],[.6,.9,1.4,0],0,0)),r.name!=="rumble")return;let h=new Set,u=new Set;for(let d of e){let f=d.car,_=r.st(f).active;if(d.model.setPower(!!_&&_.type==="power",this.time),d.model.setSpikes(!!_&&_.type==="spikes"),!(!_||f.demolished)){if((_.type==="grapple"||_.type==="plunger")&&d.ipos){let p=this.cableFor(f);h.add(f),Xp.set(0,0,1).applyQuaternion(d.iquat),qp.set(0,1,0).applyQuaternion(d.iquat),go.copy(d.ipos).addScaledVector(Xp,55).addScaledVector(qp,28).multiplyScalar(.01);let m=_.phase==="pull"?i:_.hook;qr.copy(m).multiplyScalar(.01),_.phase==="pull"&&qr.addScaledVector(go.clone().sub(qr).normalize(),Me.radius*.01*.9);let x=go.distanceTo(qr);p.cable.position.copy(go),p.cable.quaternion.setFromUnitVectors(iM,qr.clone().sub(go).normalize()),p.cable.scale.set(.05,Math.max(.01,x),.05),p.claw.position.copy(qr),p.claw.quaternion.copy(p.cable.quaternion),p.cable.visible=p.claw.visible=!0}if(_.type==="tornado"&&d.ipos){let p=this.tornadoFor(f);u.add(f);let m=Math.min(1,_.t/.5)*Math.min(1,(_.dur-_.t)/.6);p.grow=m,p.g.visible=!0,p.g.position.set(d.ipos.x*.01,0,d.ipos.z*.01),p.g.scale.set(.3+.7*m,m,.3+.7*m);for(let b of p.parts)b.m.rotation.y+=b.speed*t,b.tex.offset.y-=t*.6;let x=Math.round(t*70*o.mult);for(let b=0;b<x;b++){let v=Math.random()*Math.PI*2,S=Pn(1,6),w=p.g.position.x+Math.cos(v)*S,R=p.g.position.z+Math.sin(v)*S;o.smoke.emit(w,Pn(0,1.5),R,-Math.sin(v)*9,Pn(3,9),Math.cos(v)*9,Pn(.8,1.6),Pn(.8,1.4),Pn(2.4,4),[.45,.4,.33,.45],[.3,.28,.25,0],.8,-1,Pn(-2,2))}}}}for(let[d,f]of this.cables)h.has(d)||(f.cable.visible=f.claw.visible=!1);for(let[d,f]of this.tornados)u.has(d)||(f.g.visible=!1)}};var Yc=new T,Zc=new T,rM=new T,sd=new T,xo=class{constructor(t,e=2400,n=.02){this.max=e,this.height=n,this.head=0,this.pos=new Float32Array(e*4*3),this.col=new Float32Array(e*4*4);let i=new Uint32Array(e*6);for(let a=0;a<e;a++){let o=a*4;i.set([o,o+1,o+2,o+2,o+1,o+3],a*6)}let r=new Re;this.posAttr=new qe(this.pos,3).setUsage(Ss),this.colAttr=new qe(this.col,4).setUsage(Ss),r.setAttribute("position",this.posAttr),r.setAttribute("color",this.colAttr),r.setIndex(new qe(i,1)),r.setDrawRange(0,0),this.geo=r,this.mesh=new gt(r,new _e({vertexColors:!0,transparent:!0,depthWrite:!1,side:ve,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2})),this.mesh.frustumCulled=!1,this.mesh.renderOrder=1,t.add(this.mesh),this.prev=new Map,this.used=0,this.dirty=!1}clear(){this.used=0,this.head=0,this.prev.clear(),this.geo.setDrawRange(0,0)}static skid(t){if(!t.onGround||t.demolished||t.groundNormal.y<.95||t.pos.y>45)return 0;t.forward(Yc),t.left(Zc);let e=t.vel.length(),n=Math.abs(t.vel.dot(Zc)),i=t.vel.dot(Yc),r=t.input,a=0;return r.powerslide&&e>250&&(a=Math.max(a,.9)),n>140&&(a=Math.max(a,Math.min(1,(n-140)/400))),(r.throttle>.5||t.boosting)&&Math.abs(i)<650&&(a=Math.max(a,.7)),r.throttle*i<0&&Math.abs(i)>450&&(a=Math.max(a,.8)),a}update(t,e,n,i){Yc.set(0,0,1).applyQuaternion(n),Zc.set(1,0,0).applyQuaternion(n),rM.set(0,1,0).applyQuaternion(n);for(let r=0;r<4;r++){let a=t.id*4+r;if(i<=0||Nt.wheels[r].front&&i<.75){this.prev.delete(a);continue}let o=Nt.wheels[r];sd.copy(e).addScaledVector(Zc,o.x+Math.sign(o.x)*7).addScaledVector(Yc,o.z);let l=sd.x*.01,c=sd.z*.01,h=this.prev.get(a);if(!h){this.prev.set(a,{x:l,z:c});continue}let u=l-h.x,d=c-h.z,f=Math.hypot(u,d);if(!(f<.08)){if(f>4){this.prev.set(a,{x:l,z:c});continue}this.addQuad(h.x,h.z,l,c,u/f,d/f,.72*i),h.x=l,h.z=c}}}addQuad(t,e,n,i,r,a,o){let c=-a*.07,h=r*.07,u=this.height,d=this.head,f=d*12,g=this.pos;g[f]=t+c,g[f+1]=u,g[f+2]=e+h,g[f+3]=t-c,g[f+4]=u,g[f+5]=e-h,g[f+6]=n+c,g[f+7]=u,g[f+8]=i+h,g[f+9]=n-c,g[f+10]=u,g[f+11]=i-h;let _=d*16;for(let p=0;p<4;p++)this.col.set([.045,.035,.018,o],_+p*4);this.head=(this.head+1)%this.max,this.used=Math.min(this.max,this.used+1),this.dirty=!0}flush(){this.dirty&&(this.dirty=!1,this.posAttr.needsUpdate=!0,this.colAttr.needsUpdate=!0,this.geo.setDrawRange(0,this.used*6))}};var aM=["Atlas","Blitz","Comet","Dash","Echo","Flare","Ghost","Havoc","Jinx","Nova","Rex","Zippy","Vortex","Turbo"],oM=6,_o=60,Yr=null;function lM(){Yr||(Yr=Op(1024));let s=new te({map:Yr.map,emissive:16777215,emissiveMap:Yr.emissiveMap,emissiveIntensity:2.4,roughness:1,roughnessMap:Yr.roughnessMap,metalness:.65,bumpMap:Yr.bumpMap,bumpScale:1.2}),t=new gt(new Xn(Me.radius*.01,64,40),s);return t.castShadow=!0,t}var gi=new T,xi=new xe,_i=new T,Zr=new xe;function cM(s){return!s||s.type==="any"?"RB / F":s.type==="pad"?"RB":s.layout==="p2"?"H":"F"}function rd(s){for(let t=s.length-1;t>0;t--){let e=Math.floor(Math.random()*(t+1));[s[t],s[e]]=[s[e],s[t]]}return s}var vo=class s{constructor(t,e){this.app=t,this.cfg=e,this.attract=e.mode==="attract",this.world=new Uc,this.group=new Xe,t.gfx.scene.add(this.group),this.effects=new Xc(this.group,t.settings.quality),this.tireMarks=new xo(this.group,t.settings.quality==="low"?900:2400,t.settings.quality==="high"?.075:.02),this.ball=lM(),this.group.add(this.ball),t.settings.quality==="low"&&(this.ballBlob=this.addBlob(1.7,1.7)),this.players=[];let n=rd(aM.slice()),i=rd([7,9,11,17,21,24,33,42,55,73,88,99]);for(let o of[0,1]){let l=e.humans.filter(c=>c.team===o);for(let c=0;c<e.teamSize;c++){let h=l[c],u=this.world.addCar(new zc(o,h?h.name:n.pop()));u.handling=t.settings.handling==="realistic"?"realistic":"easy";let d=new Gc(o,i.pop());this.group.add(d.root),t.settings.quality==="low"&&(d.blob=this.addBlob(1.6,2.2));let f={car:u,model:d,human:!!h,device:h?h.device:null,bot:h?null:new kc(u,e.difficulty),name:u.name};this.players.push(f)}}this.humans=this.players.filter(o=>o.human),this.gameMode=e.gameMode||"soccar";let r=!e.items||e.items==="all"?Ur:[e.items];this.world.mode=mp(this.world,this.gameMode,r),this.modeFx=this.world.mode?new qc(this.group,this.effects,this.world.mode):null,t.input.rbIsItem=this.gameMode==="rumble",this.views=[];let a=this.humans.length;if(this.attract||a===0){let o=new on(60,1,.1,3e3);this.views.push({camera:o,rect:[0,0,1,1],hfov:90,rig:new Xr(o)})}else this.humans.forEach((o,l)=>{let c=new on(70,1,.05,3e3),h=[0,0,1,1];a===2&&(h=e.split==="vertical"?[l*.5,0,.5,1]:[0,l*.5,1,.5]);let u=new Xr(c);u.ballCam=t.settings.ballCam,a===2&&e.split!=="vertical"&&(u.distance=310,u.height=120);let d={camera:c,rect:h,hfov:t.settings.fov,rig:u,player:o,label:o.name,team:o.car.team};o.view=d,o.viewIndex=l,this.views.push(d)});this.replayCam=new on(55,1,.1,3e3),this.replayRig=new Xr(this.replayCam),this.replayView={camera:this.replayCam,rect:[0,0,1,1],hfov:80},t.gfx.setViews(this.views),this.attract?this.engines=[]:(t.hud.setup(this.views),t.hud.show(!0),this.engines=this.humans.map((o,l)=>t.audio.createEngine(a===2&&e.split==="vertical"?l===0?-.5:.5:0))),this.scores=[0,0],this.clock=e.duration||0,this.unlimited=!e.duration,this.overtime=!1,this.state="countdown",this.stateT=0,this.acc=0,this.pred=[],this.predFrame=0,this.threat=-1,this.frame=0,this.time=0,this.snapSize=9+13*this.players.length,this.snapCount=oM*_o,this.snaps=new Float32Array(this.snapSize*this.snapCount),this.snapHead=0,this.snapFilled=0,this.stepIndex=0,this.fakeCars=this.players.map(o=>({team:o.car.team,vel:new T,boosting:!1,supersonic:!1,demolished:!1,steerVisual:0,wheelSpin:0,wheelDist:[17,17,17,17],onGround:!0})),this.kickoff()}addBlob(t,e){if(!s.blobTex){let i=document.createElement("canvas");i.width=i.height=64;let r=i.getContext("2d"),a=r.createRadialGradient(32,32,0,32,32,32);a.addColorStop(0,"rgba(0,0,0,0.55)"),a.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=a,r.fillRect(0,0,64,64),s.blobTex=new An(i)}let n=new gt(new gn(t,e),new _e({map:s.blobTex,transparent:!0,depthWrite:!1}));return n.rotation.x=-Math.PI/2,n.renderOrder=1,this.group.add(n),n}placeBlob(t,e,n,i){if(!t)return;let r=e.y-i;t.visible=r<600,t.position.set(e.x*.01,.03,e.z*.01);let a=Math.max(.4,1-r/800);t.scale.setScalar(a),t.material.opacity=a,n&&(t.rotation.z=Math.atan2(2*(n.w*n.y+n.x*n.z),1-2*(n.y*n.y+n.z*n.z)))}dispose(){this.app.gfx.scene.remove(this.group),this.group.traverse(t=>{if(t.geometry&&!t.geometry.userData.shared&&t.geometry.dispose(),t.material&&t.material!==this.ball.material){let e=Array.isArray(t.material)?t.material:[t.material];for(let n of e)n.dispose()}}),this.app.audio.stopEngines(),this.app.input.rbIsItem=!1}kickoff(){let t=this.world;t.ball.reset(),t.resetPads(),this.ball.visible=!0;let e=rd([0,1,2,3,4]);for(let n of[0,1]){let i=this.players.filter(a=>a.car.team===n),r=n===0?1:-1;i.forEach((a,o)=>{let l=cp[e[o%5]];a.car.place(l[0]*r,l[1]*r,n===0?l[2]:l[2]+Math.PI),a.car.frozen=!0,a.car.input.jump=!1,a.car.prevJump=!1})}for(let n of this.views)n.rig&&n.rig.snap();this.world.mode&&this.world.mode.reset(),this.state="countdown",this.stateT=this.attract?1.2:3,this.lastBeep=4,this.threat=-1,this.acc=0,this.attract||this.app.hud.hideBanner()}startPlay(){this.state="playing";for(let t of this.players)t.car.frozen=!1;this.world.ball.frozen=!1,this.attract||(this.app.hud.showBanner("GO!","","go",.8),this.app.audio.beep(!0))}scored(t){let e=1-t,i=this.world.ball;this.scores[e]++;let r=i.lastTouch,a=i.prevTouch,o=r&&r.team===e?r:a&&a.team===e?a:null,l=o&&a&&a!==o&&a.team===e&&r===o?a:null;o&&(o.stats.goals++,o.stats.score+=100),l&&(l.stats.assists++,l.stats.score+=50);let c=i.pos.clone();this.goalTime=this.time,this.goalTeam=e,this.goalOf=t,this.effects.explosion(c,e,!0),this.app.stadium.goalFlash(t),this.app.stadium.cheer(1);for(let h of this.players){let u=h.car;if(u.demolished)continue;let d=u.pos.distanceTo(c);if(d<2600){let f=u.pos.clone().sub(c).setY(0).normalize().multiplyScalar((1-d/2600)*1800);u.vel.add(f),u.vel.y+=(1-d/2600)*700,u.noGround=.15,u.onGround=!1}}i.frozen=!0,i.vel.set(0,0,0),this.ball.visible=!1;for(let h of this.views)h.rig&&h.rig.addShake(1);if(!this.attract){this.app.audio.goal();for(let d of this.humans)this.app.input.rumble(d.device,1,1,700);let h=ke[e],u=o?o.name:e===0?"Blue":"Orange";this.app.hud.showBanner("GOAL!",o?`${u} scored${l?" \u2022 assist: "+l.name:""}`:"Own goal",e===0?"blue":"orange",2.6),this.app.hud.addFeed(`<b style="color:${h.css}">${u}</b> scored!`,e)}this.state="goal",this.stateT=2.8,this.endAfterGoal=this.overtime||!this.unlimited&&this.clock<=0}startReplay(){if(this.attract||this.snapFilled<_o*2||!this.app.settings.replays){this.afterReplay();return}this.state="replay";let t=this.snapFilled/_o,e=this.time-this.goalTime;this.replayEnd=Math.max(0,e-.35),this.replayStart=Math.min(t-.05,e+4.2),this.replayT=this.replayStart,this.replayExploded=!1,this.app.gfx.setViews([this.replayView]),this.replayRig.snap(),this.app.hud.setup([]),this.app.hud.showBanner("REPLAY","Press A / Space to skip","replay",99),this.ball.visible=!0,this.effects.clear()}afterReplay(){if(this.state==="replay"&&(this.app.gfx.setViews(this.views),this.app.hud.setup(this.views),this.app.hud.hideBanner()),this.endAfterGoal){this.finish();return}this.kickoff()}finish(){this.state="over",this.stateT=3;for(let e of this.players)e.car.frozen=!0,e.car.boosting=!1;this.world.ball.frozen=!0;let t=this.scores[0]>this.scores[1]?0:1;this.winner=t,this.app.audio.horn(),this.app.stadium.cheer(.8),this.app.hud.showBanner(t===0?"BLUE WINS!":"ORANGE WINS!",`${this.scores[0]} - ${this.scores[1]}`,t===0?"blue":"orange",99)}results(){let t=this.players.map(n=>({name:n.name,team:n.car.team,human:n.human,...n.car.stats}));t.sort((n,i)=>i.score-n.score);let e=t.filter(n=>n.team===this.winner).sort((n,i)=>i.score-n.score)[0];return{scores:this.scores.slice(),winner:this.winner,rows:t,mvp:e?e.name:""}}update(t){t=Math.min(t,.1),this.time+=t,this.frame++;let e=this.app,n=e.input,i=!1;for(let a of this.humans){let o=n.controls(a.device);if(a.controls=o,o.pause&&this.state!=="over"&&e.frames!==e.resumeFrame){e.pauseMatch(a);return}o.skip&&(i=!0),o.ballCam&&a.view&&(a.view.rig.ballCam=!a.view.rig.ballCam,e.hud.viewStatus(a.viewIndex,a.view.rig.ballCam?"BALL CAM":"CAR CAM"));let l=a.car.input;l.throttle=o.throttle,l.pitch=o.pitch,l.yaw=o.yaw,l.roll=o.roll,l.jump=o.jump,l.boost=o.boost,l.powerslide=o.powerslide,l.steer=this.shapeSteer(a,o,t),l.useItem=!!o.itemDown}(this.frame%3===0||this.pred.length===0)&&(Wu(this.world.ball,3.5,1/60,this.pred),this.threat=this.goalIn(this.pred));let r=this.world.ball.lastTouch===null&&this.state==="playing";for(let a of this.players)a.bot&&a.bot.update(t,{world:this.world,pred:this.pred,time:this.world.time,kickoff:r,rumble:this.gameMode==="rumble"?this.world.mode:null,teammates:this.players.filter(o=>o.car.team===a.car.team).map(o=>o.car),opponents:this.players.filter(o=>o.car.team!==a.car.team).map(o=>o.car)});switch(this.state){case"countdown":{this.stateT-=t;let a=Math.ceil(this.stateT);!this.attract&&a<this.lastBeep&&a>0&&(this.lastBeep=a,e.hud.showBanner(String(a),this.overtime?"OVERTIME":"","count",1),e.audio.beep(!1)),this.stateT<=0&&this.startPlay();break}case"playing":this.unlimited||(this.overtime?this.clock+=t:this.clock>0&&(this.clock=Math.max(0,this.clock-t)));break;case"goal":this.stateT-=t,this.stateT<=0&&this.startReplay();break;case"replay":this.replayT-=t,(i||this.replayT<=this.replayEnd)&&this.afterReplay();break;case"over":this.stateT-=t,this.stateT<=0&&!this.resultsShown&&(this.resultsShown=!0,e.showResults(this.results()));break;default:break}if(this.state==="replay"){this.renderReplay(t);return}{this.acc+=t;let a=0;for(;this.acc>=oo&&a<12;)if(this.world.step(oo),this.acc-=oo,a++,this.stepIndex++%(120/_o)===0&&this.recordSnap(),this.state==="playing"){let o=this.world.ball.goalState();if(o>=0){this.scored(o);break}}a>=12&&(this.acc=0)}if(this.state==="playing"&&!this.unlimited&&!this.overtime&&this.clock<=0){let a=this.world.ball;(a.pos.y<Me.radius+25||a.frozen)&&(this.scores[0]===this.scores[1]?(this.overtime=!0,this.clock=0,e.hud.showBanner("OVERTIME","Next goal wins","ot",2.5),e.audio.horn(),this.kickoff(),this.stateT=4):this.finish())}this.processEvents(),this.renderFrame(t)}shapeSteer(t,e,n){let i=e.steer;if(this.app.settings.handling==="realistic")return t.steerS=i,i;if(e.digitalSteer){let r=t.steerS||0,o=Math.sign(i)!==Math.sign(r)||Math.abs(i)<Math.abs(r)?14:6;t.steerS=r+Math.max(-o*n,Math.min(o*n,i-r))}else t.steerS=Math.sign(i)*Math.pow(Math.abs(i),1.5);return t.steerS}clockText(){if(this.unlimited)return"\u221E";let t=Math.max(0,this.overtime?Math.floor(this.clock):Math.ceil(this.clock));return`${this.overtime?"+":""}${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}goalIn(t){for(let e of t)if(Math.abs(e.pos.x)<Bt.goalHalfW&&e.pos.y<Bt.goalH){if(e.pos.z>Bt.halfZ+Me.radius)return 1;if(e.pos.z<-Bt.halfZ-Me.radius)return 0}return-1}processEvents(){let t=this.app,e=this.world.events,n=this.humans.map(r=>r.car),i=r=>{if(!r||n.length===0)return .6;let a=1/0;for(let o of n)a=Math.min(a,o.pos.distanceTo(r));return Math.max(.15,1-a/7e3)};for(let r of e){let a=r.car?this.humans.find(o=>o.car===r.car):null;switch(r.type){case"ballHit":r.strength>350&&this.effects.hit(r.point,r.strength),this.attract||(r.strength>250&&t.audio.hit(r.strength*i(r.point)),a&&(t.input.rumble(a.device,Math.min(1,r.strength/2500),.4,120),r.strength>1500&&a.view.rig.addShake(Math.min(.45,r.strength/7e3))),this.onTouch(r.car,a));break;case"bounce":!this.attract&&r.strength>400&&t.audio.bounce(r.strength*i(r.point));break;case"jump":a&&t.audio.jump();break;case"dodge":a&&t.audio.dodge();break;case"land":a&&(t.audio.land(r.strength),t.input.rumble(a.device,.15,.2,60));break;case"bump":if(!this.attract){t.audio.bump();let o=this.humans.find(l=>l.car===r.by);a&&t.input.rumble(a.device,.7,.5,200),o&&t.input.rumble(o.device,.4,.3,120)}break;case"demo":if(this.effects.demolition(r.point,r.car.team),r.by.stats.score+=25,!this.attract){t.audio.demo();for(let l of this.humans){let c=l.car.pos.distanceTo(r.point);c<3e3&&l.view&&l.view.rig.addShake(l.car===r.car||l.car===r.by?.9:.6*(1-c/3e3))}t.hud.addFeed(`<b style="color:${ke[r.by.team].css}">${r.by.name}</b> \u{1F4A5} <b style="color:${ke[r.car.team].css}">${r.car.name}</b>`),a&&(t.input.rumble(a.device,1,1,450),t.hud.viewCenter(a.viewIndex,"DEMOLISHED",2.8));let o=this.humans.find(l=>l.car===r.by);o&&(t.input.rumble(o.device,.6,.6,200),t.hud.viewCenter(o.viewIndex,"DEMOLITION!",1.5))}break;case"itemGet":a&&(t.audio.itemGet(),t.input.rumble(a.device,.15,.3,90));break;case"itemUse":this.attract||t.audio.itemUse(r.item,i(r.car.pos)),r.item==="freezer"&&this.effects.flash(this.ball.position.clone(),10477823,2.6,.35,2.5),r.item==="curveball"&&this.effects.ring(this.ball.position.clone(),ke[r.car.team].light,5,.5);break;case"itemFail":a&&t.hud.viewStatus(a.viewIndex,r.item==="boot"?"NO OPPONENT IN RANGE":"BALL OUT OF RANGE",1.2);break;case"hooked":this.attract||t.audio.hook(i(r.point));break;case"boot":this.effects.flash(r.point.clone().multiplyScalar(.01),16765056,2.2,.3,2.5),this.effects.hit(r.point,2600),this.attract||(t.audio.bump(),t.hud.addFeed(`<b style="color:${ke[r.by.team].css}">${r.by.name}</b> \u{1F462} <b style="color:${ke[r.car.team].css}">${r.car.name}</b>`),a&&(t.input.rumble(a.device,.9,.7,300),t.hud.viewCenter(a.viewIndex,"BOOTED!",1.4)));break;case"heatseekFlip":this.effects.hit(r.point,2200);break;case"boostPickup":this.effects.boostPickup(r.pad),a&&(t.audio.boostPickup(r.big),r.big&&t.input.rumble(a.device,.1,.3,80));break;default:break}}e.length=0}onTouch(t,e){if(this.state!=="playing"||this.world.time-(t.lastShotCheck||-10)<.4)return;t.lastShotCheck=this.world.time;let n=this.threat,i=this._shotBuf||(this._shotBuf=[]);Wu(this.world.ball,3,1/40,i);let r=this.goalIn(i);this.threat=r,n===t.team&&r!==t.team&&(t.stats.saves++,t.stats.score+=50,this.app.hud.addFeed(`<b style="color:${ke[t.team].css}">${t.name}</b> made a save!`),e&&this.app.hud.viewCenter(e.viewIndex,"SAVE!",1.5)),r===1-t.team&&n!==r&&(t.stats.shots++,t.stats.score+=20,this.app.audio.cheer(.35),e&&this.app.hud.viewCenter(e.viewIndex,"SHOT ON GOAL",1.2))}recordSnap(){let t=this.snapHead*this.snapSize,e=this.snaps,n=this.world.ball;e[t]=this.time,e[t+1]=n.pos.x,e[t+2]=n.pos.y,e[t+3]=n.pos.z,e[t+4]=n.quat.x,e[t+5]=n.quat.y,e[t+6]=n.quat.z,e[t+7]=n.quat.w,e[t+8]=this.ball.visible?1:0;let i=t+9;for(let r of this.players){let a=r.car;e[i]=a.pos.x,e[i+1]=a.pos.y,e[i+2]=a.pos.z,e[i+3]=a.quat.x,e[i+4]=a.quat.y,e[i+5]=a.quat.z,e[i+6]=a.quat.w,e[i+7]=a.vel.x,e[i+8]=a.vel.y,e[i+9]=a.vel.z,e[i+10]=(a.boosting?1:0)|(a.supersonic?2:0)|(a.demolished?4:0)|(a.onGround?8:0),e[i+11]=a.steerVisual,e[i+12]=a.wheelSpin,i+=13}this.snapHead=(this.snapHead+1)%this.snapCount,this.snapFilled=Math.min(this.snapCount,this.snapFilled+1)}snapAt(t){let e=Math.min(this.snapFilled-1,Math.max(0,t*_o)),n=Math.floor(e),i=e-n,r=(this.snapHead-1-n+this.snapCount*2)%this.snapCount,a=(r-1+this.snapCount)%this.snapCount;return{a:r*this.snapSize,b:a*this.snapSize,t:i}}renderReplay(t){let{a:e,b:n,t:i}=this.snapAt(this.replayT),r=this.snaps,a=l=>r[e+l]+(r[n+l]-r[e+l])*i;_i.set(a(1),a(2),a(3)),Zr.set(r[e+4],r[e+5],r[e+6],r[e+7]),this.ball.position.copy(_i).multiplyScalar(.01),this.ball.quaternion.copy(Zr),this.ball.visible=r[e+8]>.5;let o=9;this.players.forEach((l,c)=>{let h=this.fakeCars[c];gi.set(a(o),a(o+1),a(o+2)),xi.set(r[e+o+3],r[e+o+4],r[e+o+5],r[e+o+6]),Zr.set(r[n+o+3],r[n+o+4],r[n+o+5],r[n+o+6]),xi.slerp(Zr,i),h.vel.set(r[e+o+7],r[e+o+8],r[e+o+9]);let u=r[e+o+10];h.boosting=!!(u&1),h.supersonic=!!(u&2),h.demolished=!!(u&4),h.steerVisual=r[e+o+11],h.wheelSpin=r[e+o+12],l.model.update(h,gi,xi,t),this.effects.carTrail(h,gi,xi,t),o+=13}),!this.replayExploded&&this.ball.visible===!1&&(this.replayExploded=!0,this.effects.explosion(_i,this.goalTeam,!0)),this.replayRig.updateReplay(t,_i,this.goalOf===1?Bt.halfZ:-Bt.halfZ,this.replayT),this.effects.update(t),this.app.stadium.update(t),this.app.hud.update(t),this.app.gfx.render()}renderFrame(t){let e=this.app,n=this.acc/oo,i=this.world.ball;_i.lerpVectors(i.prevPos,i.pos,n),Zr.slerpQuaternions(i.prevQuat,i.quat,n),this.ball.position.copy(_i).multiplyScalar(.01),this.ball.quaternion.copy(Zr),this.ball.visible&&this.effects.ballTrail(i,_i),this.placeBlob(this.ballBlob,_i,null,Me.radius),this.ballBlob&&(this.ballBlob.visible=this.ballBlob.visible&&this.ball.visible);let r=[];for(let o of this.players){let l=o.car;gi.lerpVectors(l.prevPos,l.pos,n),xi.slerpQuaternions(l.prevQuat,l.quat,n),o.ipos=(o.ipos||new T).copy(gi),o.iquat=(o.iquat||new xe).copy(xi),o.model.update(l,gi,xi,t),this.placeBlob(o.model.blob,gi,xi,17);let c=this.state==="replay"?0:xo.skid(l);this.tireMarks.update(l,gi,xi,c),this.effects.dirt(l,gi,xi,c,t),o.model.blob&&(o.model.blob.visible=o.model.blob.visible&&!l.demolished),this.effects.carTrail(l,gi,xi,t),r.push({car:l,pos:o.ipos,name:o.name})}if(this.attract){let o=this.views[0],l=this.time*.05,c=o.camera,h=62;c.position.set(Math.cos(l)*h*.62,13+Math.sin(l*.7)*4,Math.sin(l)*h*.8),c.up.set(0,1,0);let u=gi.copy(_i).multiplyScalar(.01*.6);c.lookAt(u.x,2,u.z)}else{for(let o of this.humans){let l=o.view,c=o.controls||{};l.rig.update(t,o.car,o.ipos,o.iquat,this.ball.visible?_i:null,c.lookX||0,c.lookY||0),e.hud.setBoost(o.viewIndex,o.car.boost),this.gameMode==="rumble"&&e.hud.setItem(o.viewIndex,this.world.mode.status(o.car),lo,cM(o.device)),e.hud.updatePlates(o.viewIndex,l.camera,r,o.car)}this.humans.forEach((o,l)=>{let c=o.car;e.audio.updateEngine(this.engines[l],c.vel.length(),c.input.throttle,c.boosting,c.onGround,!c.demolished&&!c.frozen)}),e.hud.setScore(this.scores[0],this.scores[1]),e.hud.setClock(this.clock,this.overtime,this.unlimited),e.hud.update(t)}this.modeFx&&this.modeFx.update(t,this.players,this.ball,_i),this.tireMarks.flush();let a=this.state==="goal";a&&this.stateT>1.2&&this.effects.pyro(e.stadium.pyroPoints[this.goalOf],this.goalTeam,t),e.stadium.setScreens(this.scores[0],this.scores[1],this.clockText(),a?this.goalTeam===0?"blue":"orange":null),this.effects.update(t),e.stadium.update(t),e.gfx.render()}renderPaused(){this.app.gfx.render()}};var Jr={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var $n=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},hM=new xs(-1,1,1,-1,0,1),ad=class extends Re{constructor(){super(),this.setAttribute("position",new se([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new se([0,2,0,0,2,0],2))}},uM=new ad,Ps=class{constructor(t){this._mesh=new gt(uM,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,hM)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var Jc=class extends $n{constructor(t,e="tDiffuse"){super(),this.textureID=e,this.uniforms=null,this.material=null,t instanceof Ue?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=$i.clone(t.uniforms),this.material=new Ue({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new Ps(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var yo=class extends $n{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){let i=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),r.buffers.stencil.setFunc(i.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(i.EQUAL,1,4294967295),r.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),r.buffers.stencil.setLocked(!0)}},Kc=class extends $n{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var $c=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let n=t.getSize(new at);this._width=n.width,this._height=n.height,e=new $e(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:cn}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Jc(Jr),this.copyPass.material.blending=ni,this.timer=new Ga}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){this.timer.update(),t===void 0&&(t=this.timer.getDelta());let e=this.renderer.getRenderTarget(),n=!1;for(let i=0,r=this.passes.length;i<r;i++){let a=this.passes[i];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),a.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),a.needsSwap){if(n){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}yo!==void 0&&(a instanceof yo?n=!0:a instanceof Kc&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new at);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let n=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(n,i),this.renderTarget2.setSize(n,i);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,i)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Yp={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Pt(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var Kr=class s extends $n{constructor(t,e=1,n,i){super(),this.strength=e,this.radius=n,this.threshold=i,this.resolution=t!==void 0?new at(t.x,t.y):new at(256,256),this.clearColor=new Pt(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new $e(r,a,{type:cn,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new $e(r,a,{type:cn,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let d=new $e(r,a,{type:cn,depthBuffer:!1});d.texture.name="UnrealBloomPass.v"+h,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),a=Math.round(a/2)}let o=Yp;this.highPassUniforms=$i.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Ue({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new at(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=$i.clone(Jr.uniforms),this.blendMaterial=new Ue({uniforms:this.copyUniforms,vertexShader:Jr.vertexShader,fragmentShader:Jr.fragmentShader,premultipliedAlpha:!0,blending:ln,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Pt,this._oldClearAlpha=1,this._basic=new _e,this._fsQuad=new Ps(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(t,e){let n=Math.round(t/2),i=Math.round(e/2);this.renderTargetBright.setSize(n,i);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,i),this.renderTargetsVertical[r].setSize(n,i),this.separableBlurMaterials[r].uniforms.invSize.value=new at(1/n,1/i),n=Math.round(n/2),i=Math.round(i/2)}render(t,e,n,i,r){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let a=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=n.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this._fsQuad.render(t),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(n),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=a}_getSeparableBlurMaterial(t){let e=[],n=t/3;for(let a=0;a<t;a++)e.push(.39894*Math.exp(-.5*a*a/(n*n))/n);let i=[],r=[];for(let a=1;a<t;a+=2){let o=e[a],l=a+1<t?e[a+1]:0,c=o+l;i.push((a*o+(a+1)*l)/c),r.push(c)}return new Ue({defines:{KERNEL_PAIRS:i.length},uniforms:{colorTexture:{value:null},invSize:{value:new at(.5,.5)},direction:{value:new at(.5,.5)},centerWeight:{value:e[0]},gaussianOffsets:{value:i},gaussianWeights:{value:r}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(t){return new Ue({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};Kr.BlurDirectionX=new at(1,0);Kr.BlurDirectionY=new at(0,1);var Mo={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var jc=class extends $n{constructor(){super(),this.isOutputPass=!0,this.uniforms=$i.clone(Mo.uniforms),this.material=new wr({name:Mo.name,uniforms:this.uniforms,vertexShader:Mo.vertexShader,fragmentShader:Mo.fragmentShader}),this._fsQuad=new Ps(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},ce.getTransfer(this._outputColorSpace)===ge&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Wa?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Xa?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===qa?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Gs?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Za?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Ja?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Ya&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var od=class extends $n{constructor(t){super(),this.owner=t,this.needsSwap=!1}render(t,e,n){let i=this.renderToScreen?null:n;this.owner.renderViews(i)}},Qc=class{constructor(t,e){this.quality=e,this.container=t;let n=new wc({antialias:e!=="low",powerPreference:"high-performance",stencil:!1});if(n.toneMapping=Gs,n.toneMappingExposure=1,n.outputColorSpace=Ke,n.shadowMap.enabled=e!=="low",n.shadowMap.type=ks,n.autoClear=!1,t.appendChild(n.domElement),this.renderer=n,this.scene=new Bs,this.views=[],this.pixelRatio=Math.min(window.devicePixelRatio||1,e==="high"?1.75:e==="medium"?1.25:1),n.setPixelRatio(this.pixelRatio),e!=="low"){let i=new $e(1,1,{type:cn,samples:e==="high"?4:0});this.composer=new $c(n,i),this.composer.addPass(new od(this)),this.bloom=new Kr(new at(256,256),.5,.35,.92),this.composer.addPass(this.bloom),this.composer.addPass(new jc)}this.resize(),this.onResize=()=>this.resize(),window.addEventListener("resize",this.onResize)}setExposure(t){this.renderer.toneMappingExposure=t}setViews(t){this.views=t,this.updateCameras()}resize(){let t=window.innerWidth,e=window.innerHeight;this.width=t,this.height=e,this.renderer.setSize(t,e),this.composer&&(this.composer.setPixelRatio(this.pixelRatio),this.composer.setSize(t,e)),this.updateCameras()}updateCameras(){for(let t of this.views){let e=t.rect[2]*this.width/Math.max(1,t.rect[3]*this.height),n=Te.degToRad(t.hfov||100),i=Te.radToDeg(2*Math.atan(Math.tan(n/2)/e));i=Te.clamp(i,47,78),t.camera.fov=i,t.camera.aspect=e,t.camera.updateProjectionMatrix()}}renderViews(t){let e=this.renderer;e.setRenderTarget(t),e.setClearColor(0,1),e.clear(!0,!0,!1);let n=t?t.width:this.width*this.pixelRatio,i=t?t.height:this.height*this.pixelRatio,r=t?1:1/this.pixelRatio;for(let a of this.views){let o=Math.round(a.rect[0]*n),l=Math.round(a.rect[2]*n),c=Math.round(a.rect[3]*i),h=Math.round((1-a.rect[1]-a.rect[3])*i);t?(t.viewport.set(o,h,l,c),t.scissor.set(o,h,l,c),t.scissorTest=!0,e.setRenderTarget(t)):(e.setViewport(o*r,h*r,l*r,c*r),e.setScissor(o*r,h*r,l*r,c*r),e.setScissorTest(!0)),e.render(this.scene,a.camera)}t?(t.viewport.set(0,0,t.width,t.height),t.scissor.set(0,0,t.width,t.height),t.scissorTest=!1,e.setRenderTarget(t)):(e.setViewport(0,0,this.width,this.height),e.setScissorTest(!1))}render(){this.composer?this.composer.render():this.renderViews(null)}dispose(){window.removeEventListener("resize",this.onResize),this.composer&&this.composer.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}};function Jp(s,t=!1){let e=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},a={},o=s[0].morphTargetsRelative,l=new Re,c=0;for(let h=0;h<s.length;++h){let u=s[h],d=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in u.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in u.morphAttributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;a[f]===void 0&&(a[f]=[]),a[f].push(u.morphAttributes[f])}if(t){let f;if(e)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(e){let h=0,u=[];for(let d=0;d<s.length;++d){let f=s[d].index;for(let g=0;g<f.count;++g)u.push(f.getX(g)+h);h+=s[d].attributes.position.count}l.setIndex(u)}for(let h in r){let u=Zp(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in a){let u=a[h][0].length;if(u!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){let f=[];for(let _=0;_<a[h].length;++_)f.push(a[h][_][d]);let g=Zp(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}}return l}function Zp(s){let t,e,n,i=-1,r=0;for(let c=0;c<s.length;++c){let h=s[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}let a=new t(r),o=new qe(a,e,n),l=0;for(let c=0;c<s.length;++c){let h=s[c];if(h.isInterleavedBufferAttribute){let u=l/e;for(let d=0,f=h.count;d<f;d++)for(let g=0;g<e;g++){let _=h.getComponent(d,g);o.setComponent(d+u,g,_)}}else a.set(h.array,l);l+=h.count*e}return i!==void 0&&(o.gpuType=i),o}var{halfX:th,halfZ:bn,height:ld,rampR:pn,goalHalfW:_n,goalH:Je,goalDepth:kn}=Bt,Kp={night:{skyTop:132623,skyHorizon:1781594,skyBottom:263949,sunDir:[.25,.75,-.6],sunColor:10467583,sunGlow:0,stars:1,hemiSky:10467583,hemiGround:2042392,hemi:.75,key:15134463,keyI:2.4,keyDir:[.35,1,.25],fog:726320,fogDensity:.0011,envI:.75,exposure:1.05,winLit:.55,bldg:461330},sunset:{skyTop:2112120,skyHorizon:16754282,skyBottom:2759200,sunDir:[.78,.07,.62],sunColor:16756848,sunGlow:1,stars:0,hemiSky:16767416,hemiGround:2892055,hemi:.85,key:16760970,keyI:3.2,keyDir:[.75,.32,.58],fog:11565672,fogDensity:.0012,envI:.9,exposure:1,winLit:.3,bldg:1709600}};function $p(s){return new Ue({side:yn,depthWrite:!1,fog:!1,uniforms:{uTop:{value:new Pt(s.skyTop)},uHorizon:{value:new Pt(s.skyHorizon)},uBottom:{value:new Pt(s.skyBottom)},uSunDir:{value:new T(...s.sunDir).normalize()},uSunColor:{value:new Pt(s.sunColor)},uSunGlow:{value:s.sunGlow},uStars:{value:s.stars}},vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,fragmentShader:`
      uniform vec3 uTop, uHorizon, uBottom, uSunDir, uSunColor;
      uniform float uSunGlow, uStars;
      varying vec3 vDir;
      float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.42));
        if (h < 0.0) col = mix(uHorizon, uBottom, clamp(-h * 5.0, 0.0, 1.0));
        float sd = max(dot(d, uSunDir), 0.0);
        col += uSunColor * (pow(sd, 900.0) * 40.0 + pow(sd, 18.0) * 0.6 + pow(sd, 4.0) * 0.25) * uSunGlow;
        // thin streaky clouds
        vec2 cp = d.xz / max(h + 0.12, 0.05);
        float cl = sin(cp.x * 1.7 + sin(cp.y * 0.9) * 2.0) * sin(cp.y * 2.3 + cp.x * 0.4);
        cl = smoothstep(0.55, 1.0, cl) * smoothstep(0.02, 0.25, h) * (1.0 - smoothstep(0.4, 0.9, h));
        col = mix(col, mix(uHorizon * 1.15, uSunColor, 0.4 * uSunGlow), cl * 0.35);
        vec3 sp = d * 420.0;
        float star = step(0.9982, hash(floor(sp))) * uStars * smoothstep(0.05, 0.35, h);
        col += vec3(star) * (0.6 + 0.4 * hash(floor(sp) + 3.1));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`})}function dM(s){return new Ue({uniforms:{uBase:{value:new Pt(s.bldg)},uWin:{value:new Pt(1,.82,.55)},uLit:{value:s.winLit},uFog:{value:new Pt(s.fog)},uFogD:{value:s.fogDensity*.55},uSunDir:{value:new T(...s.sunDir).normalize()},uSunColor:{value:new Pt(s.sunColor).multiplyScalar(s.sunGlow)}},vertexShader:`
      varying vec3 vWorld; varying vec3 vN; varying float vSeed;
      void main() {
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        vSeed = instanceMatrix[3].x * 0.013 + instanceMatrix[3].z * 0.071;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,fragmentShader:`
      uniform vec3 uBase, uWin, uFog, uSunDir, uSunColor; uniform float uLit, uFogD;
      varying vec3 vWorld; varying vec3 vN; varying float vSeed;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec3 n = normalize(vN);
        vec3 col = uBase;
        if (abs(n.y) < 0.5) {
          vec2 f = abs(n.x) > 0.5 ? vWorld.zy : vWorld.xy;
          vec2 cell = f / vec2(3.4, 3.8);
          vec2 id = floor(cell);
          vec2 fr = fract(cell);
          float win = step(0.16, fr.x) * step(fr.x, 0.84) * step(0.22, fr.y) * step(fr.y, 0.82);
          float lit = step(1.0 - uLit, hash(id + vSeed));
          float floorLit = step(0.25, hash(vec2(id.y, vSeed)));
          col += win * (lit * floorLit * uWin * (0.5 + hash(id * 1.7 + vSeed) * 1.2) + vec3(0.015, 0.02, 0.03));
          col += uSunColor * max(dot(n, uSunDir), 0.0) * 0.18 * (0.4 + win);
        } else {
          col *= 0.7;
        }
        float dist = length(vWorld - cameraPosition);
        float fogF = 1.0 - exp(-uFogD * uFogD * dist * dist);
        col = mix(col, uFog, clamp(fogF, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`})}function jn(s,t,{uLen:e=1e3,vOf:n=(a,o)=>o/1e3,skip:i=null,colorOf:r=null}={}){let a=s.concat([{...s[0],s:s.total}]),o=a.length,l=t.length,c=new Float32Array(o*l*3),h=new Float32Array(o*l*2),u=r?new Float32Array(o*l*3):null,d=new Float32Array(l),f=[];for(let p=0;p<o;p++){let m=a[p];for(let x=0;x<l;x++){let[b,v]=t[x],S=m.x+m.nx*b,w=m.z+m.nz*b;p>0&&(d[x]+=Math.hypot(S-f[x][0],w-f[x][1])),f[x]=[S,w];let R=p*l+x;if(c[R*3]=S,c[R*3+1]=v,c[R*3+2]=w,h[R*2]=d[x]/e,h[R*2+1]=n(x,v),u){let y=r(S,v,w);u[R*3]=y[0],u[R*3+1]=y[1],u[R*3+2]=y[2]}}}let g=[];for(let p=0;p<o-1;p++)for(let m=0;m<l-1;m++){if(i&&i(a[p],a[p+1],t[m],t[m+1]))continue;let x=p*l+m,b=(p+1)*l+m,v=(p+1)*l+m+1,S=p*l+m+1;g.push(x,S,b,b,S,v)}let _=new Re;return _.setAttribute("position",new qe(c,3)),_.setAttribute("uv",new qe(h,2)),u&&_.setAttribute("color",new qe(u,3)),_.setIndex(g),_.computeVertexNormals(),_}var cd=s=>s.wall==="orange"||s.wall==="blue";function $r(s,t=.5){return(e,n,i,r)=>cd(e)&&cd(n)&&Math.abs(e.x)<=_n+t&&Math.abs(n.x)<=_n+t&&Math.max(i[1],r[1])<=s+.5}function eh(s,t=1){let e=Te.smoothstep(s,-2500,2500),n=new Pt(ke[0].main),i=new Pt(ke[1].main),r=n.lerp(i,e);return[r.r*t,r.g*t,r.b*t]}function jp(s,t){let e=[];for(let o of s){let l=o.x+o.nx*t,c=o.z+o.nz*t;if(cd(o)){let h=o.wall==="orange"?1:-1,u=h>0?_n:-_n;if(Math.abs(o.x-u)<.5){e.push([l,c],[u,h*(bn+kn)],[-u,h*(bn+kn)]);continue}if(Math.abs(o.x)<_n-.5)continue}e.push([l,c])}let n=new Ji(e.map(([o,l])=>new at(o,-l))),i=new Ua(n);i.rotateX(-Math.PI/2);let r=i.attributes.position,a=i.attributes.uv;for(let o=0;o<r.count;o++)a.setXY(o,(r.getX(o)+Jn.halfX)/(2*Jn.halfX),(r.getZ(o)-Jn.minZ)/(Jn.maxZ-Jn.minZ));return i}function Qp(s,t,e){let n=Kp[e.timeOfDay]||Kp.night,i=e.quality,r=new Xe,a=new Xe;a.scale.setScalar(.01),r.add(a),t.add(r);let o=[];t.fog=new _a(n.fog,n.fogDensity*.35);let l=new gt(new Xn(2500,48,24),$p(n));l.renderOrder=-10,l.frustumCulled=!1,r.add(l);let c=Vr(42),h=new Ne(1,1,1);h.translate(0,.5,0);let u=190,d=new Os(h,dM(n),u),f=new we;for(let I=0;I<u;I++){let H=c()*Math.PI*2,K=170+c()*380+(c()<.3?250:0),ut=18+c()*40,mt=18+c()*40,Yt=30+Math.pow(c(),2)*260+(K>400?60:0);f.compose(new T(Math.cos(H)*K,-5,Math.sin(H)*K*1.2),new xe().setFromAxisAngle(new T(0,1,0),c()*.6),new T(ut,Yt,mt)),d.setMatrixAt(I,f)}r.add(d);let g=new gt(new Ii(1400,48),new te({color:855826,roughness:1}));g.rotation.x=-Math.PI/2,g.position.y=-6,r.add(g);let _=new Ba(n.hemiSky,n.hemiGround,n.hemi);r.add(_);let p=new ka(n.key,n.keyI),m=new T(...n.keyDir).normalize();if(p.position.copy(m).multiplyScalar(90),p.target.position.set(0,0,0),r.add(p,p.target),i!=="low"){p.castShadow=!0;let I=i==="high"?2048:1024;p.shadow.mapSize.set(I,I);let H=p.shadow.camera;H.left=-60,H.right=60,H.top=70,H.bottom=-70,H.near=10,H.far=220,p.shadow.bias=-4e-4,p.shadow.normalBias=.02}let x=Or(200,6),b=Up(i),v=Fp(),S=v.clone();S.repeat.set(40,58),S.needsUpdate=!0;let w=jp(x,pn),R=new te({map:b,roughness:.92,metalness:0,bumpMap:S,bumpScale:.6}),y=new gt(w,R);if(y.receiveShadow=!0,a.add(y),i==="high"){let I=v.clone();I.repeat.set(32,47),I.needsUpdate=!0;let H=5;for(let K=1;K<=H;K++){let ut=new te({map:b,alphaMap:I,alphaTest:.25+K/H*.55,roughness:.95,color:new Pt().setScalar(.85+K*.05)}),mt=new gt(w,ut);mt.position.y=K*1.4,mt.receiveShadow=!0,a.add(mt)}}let A=[];for(let I=0;I<=10;I++){let H=Math.PI/2*(1-I/10);A.push([pn-pn*Math.cos(H),pn-pn*Math.sin(H)])}let P=new te({color:1777703,roughness:.55,metalness:.35,vertexColors:!0,side:ve}),L=new gt(jn(x,A,{uLen:400,skip:$r(Je),colorOf:(I,H,K)=>{let ut=eh(K,.35);return[.55+ut[0],.55+ut[1],.55+ut[2]]}}),P);L.receiveShadow=!0,a.add(L);let F=[[0,pn-4],[0,pn+14]],k=new gt(jn(x,F,{skip:$r(Je),colorOf:(I,H,K)=>eh(K,4)}),new _e({vertexColors:!0,side:ve,fog:!1}));a.add(k);let N=ed(),z=pn+230,J=new gt(jn(x,[[0,pn+14],[0,z]],{uLen:4200,vOf:I=>I,skip:$r(Je)}),new te({color:1118481,emissive:16777215,emissiveMap:N,emissiveIntensity:1.1,map:N,roughness:.4,side:ve}));a.add(J),o.push(I=>{N.offset.x=(N.offset.x+I*.012)%1});let Y=td(3),rt=[[0,z],[0,Je],[0,1100],[0,ld-pn]];for(let I=1;I<=8;I++){let H=Math.PI/2*(I/8);rt.push([pn-pn*Math.cos(H),ld-pn+pn*Math.sin(H)])}let Z=new te({color:8365784,emissive:10275071,emissiveMap:Y,emissiveIntensity:.16,alphaMap:Y,transparent:!0,opacity:.32,depthWrite:!1,roughness:.1,metalness:.2,side:ve});Y.repeat.set(1,1);let tt=new gt(jn(x,rt,{uLen:900,vOf:(I,H)=>H/1040,skip:$r(Je)}),Z);tt.renderOrder=2,a.add(tt);let it=new gt(tt.geometry,new _e({color:4880568,transparent:!0,opacity:.045,depthWrite:!1,side:ve}));it.renderOrder=1,a.add(it);let It=jp(x.map(I=>({...I,wall:"side"})),pn);It.translate(0,ld,0);let Rt=It.attributes.uv;for(let I=0;I<Rt.count;I++)Rt.setXY(I,It.attributes.position.getX(I)/900,It.attributes.position.getZ(I)/1040);let re=new gt(It,Z.clone());re.material.opacity=.07,re.material.emissiveIntensity=.05,re.renderOrder=2,a.add(re);let ee=[];for(let I of[1,-1])for(let H of[1,-1]){let K=H*_n,ut=[K,0,I*bn];for(let mt=0;mt<A.length-1;mt++){let[Yt,Ct]=A[mt],[Se,pe]=A[mt+1];ee.push(...ut,K,Ct,I*(bn-Yt),K,pe,I*(bn-Se))}}let ie=new Re;ie.setAttribute("position",new se(ee,3)),ie.computeVertexNormals(),a.add(new gt(ie,new te({color:2764856,roughness:.6,metalness:.3,side:ve})));let X=[];for(let I of[0,1]){let H=I===0?-1:1,K=ke[I],ut=new Xe,mt=td(4,256);mt.repeat.set(kn/300,Je/300);let Yt=new te({color:658448,emissive:K.main,emissiveMap:mt,emissiveIntensity:1.4,roughness:.6,metalness:.2,side:ve}),Ct=mt.clone();Ct.repeat.set(2*_n/300,Je/300),Ct.needsUpdate=!0;let Se=Yt.clone();Se.emissiveMap=Ct;let pe=new gt(new gn(kn,Je),Yt);pe.rotation.y=Math.PI/2,pe.position.set(_n,Je/2,H*(bn+kn/2));let Ee=pe.clone();Ee.position.x=-_n;let Le=new gt(new gn(2*_n,Je),Se);Le.position.set(0,Je/2,H*(bn+kn));let Qn=mt.clone();Qn.repeat.set(2*_n/300,kn/300),Qn.needsUpdate=!0;let Bn=Yt.clone();Bn.emissiveMap=Qn,Bn.emissiveIntensity=.8;let vi=new gt(new gn(2*_n,kn),Bn);vi.rotation.x=Math.PI/2,vi.position.set(0,Je,H*(bn+kn/2)),ut.add(pe,Ee,Le,vi);let On=new te({color:2236962,emissive:K.main,emissiveIntensity:4.5,roughness:.3,metalness:.6}),yi=new te({color:2764083,emissive:K.main,emissiveIntensity:1.2,roughness:.4,metalness:.7}),Mi=new Ne(46,Je+46,46);for(let $s of[-1,1]){let Qr=new gt(Mi,On);Qr.position.set($s*(_n+23),(Je+46)/2,H*(bn+23)),ut.add(Qr);let bo=new gt(new Ne(36,Je,36),yi);bo.position.set($s*(_n+18),Je/2,H*(bn+kn)),ut.add(bo);let So=new gt(new Ne(30,30,kn),yi);So.position.set($s*(_n+15),Je+15,H*(bn+kn/2)),ut.add(So)}let ts=new gt(new Ne(2*_n+92,46,46),On);ts.position.set(0,Je+23,H*(bn+23));let Is=new gt(new Ne(2*_n+72,30,30),yi);Is.position.set(0,Je+15,H*(bn+kn)),ut.add(ts,Is);let jr=new gt(new Ne(2*_n+500,70,80),yi);jr.position.set(0,Je+260,H*(bn+60)),ut.add(jr),a.add(ut);let es=new Ha(K.main,0,40,2);es.position.set(0,3.5,H*(bn+kn*.6)*.01),r.add(es),X.push({light:es,frameMat:On,netMat:[Yt,Se,Bn],base:4.5})}let Q=Bp(),_t=new te({map:Q,roughness:.95,emissive:16777215,emissiveMap:Q,emissiveIntensity:.07,side:ve}),Vt=new te({color:1382430,roughness:.8,metalness:.3,side:ve}),St=[[-60,720],[-1200,1240],[-2300,1760],[-3300,2300]],Xt=[[-3300,2780],[-4200,3250],[-5100,3720],[-5900,4150]],he=I=>{let H=0,K=[0];for(let ut=1;ut<I.length;ut++)H+=Math.hypot(I[ut][0]-I[ut-1][0],I[ut][1]-I[ut-1][1]),K.push(H);return ut=>K[ut]/900};a.add(new gt(jn(x,St,{uLen:3400,vOf:he(St)}),_t)),a.add(new gt(jn(x,Xt,{uLen:3400,vOf:he(Xt)}),_t));let st=new gt(jn(x,[[-60,0],[-60,Je+40],[-60,720]],{uLen:4200,vOf:I=>I===0?0:I===1?.5:1,skip:$r(Je+40,60)}),Vt);a.add(st);let lt=ed(),ct=new gt(jn(x,[[-3300,2300],[-3300,2780]],{uLen:5200,vOf:I=>I}),new te({color:328965,emissive:16777215,emissiveMap:lt,emissiveIntensity:1.6,side:ve}));a.add(ct),o.push(I=>{lt.offset.x=(lt.offset.x-I*.02)%1}),a.add(new gt(jn(x,[[-5900,4150],[-5900,4650]],{uLen:2e3}),Vt));let ht=new _e({vertexColors:!0,fog:!1,side:ve});a.add(new gt(jn(x,[[-5900,4650],[-5900,4700]],{colorOf:(I,H,K)=>eh(K,2.2)}),ht));let xt=new te({color:921620,roughness:.8,metalness:.4,side:ve});a.add(new gt(jn(x,[[-6500,5350],[-4200,5220],[-1900,5120]],{uLen:2e3}),xt)),a.add(new gt(jn(x,[[-1900,5120],[-1900,5020]],{uLen:2e3}),Vt));let qt=new te({color:1711394,roughness:.6,metalness:.7}),Gt=new _e({color:new Pt(4.2,4.2,4),fog:!1}),Zt=[-3700,-1250,1250,3700],$t=new Ne(150,14,60),D=Zt.length*30+160,fe=new Os($t,Gt,D),ne=0;for(let I of Zt){let H=new gt(new Ne(2*th+4400,200,140),qt);H.position.set(0,5560,I),a.add(H);let K=new gt(new Ne(2*th+4400,60,60),qt);K.position.set(0,5180,I),a.add(K);for(let ut=0;ut<30;ut++){let mt=-th-1300+ut*(2*th+2600)/29;f.makeTranslation(mt,5140,I),fe.setMatrixAt(ne++,f)}}let C=Or(420,3);for(let I of C){if(ne>=D)break;let H=I.x-I.nx*1950,K=I.z-I.nz*1950;f.makeRotationY(Math.atan2(I.nx,I.nz)),f.setPosition(H,5010,K),fe.setMatrixAt(ne++,f)}fe.count=ne,a.add(fe);let M=[];{let I=new te({color:1316636,roughness:.5,metalness:.8});for(let H of[1,-1]){let K=document.createElement("canvas");K.width=1024,K.height=480;let ut=new An(K);ut.colorSpace=Ke;let mt=new Xe,Yt=3600,Ct=1690,Se=new gt(new gn(Yt,Ct),new _e({map:ut,color:new Pt(1.5,1.5,1.5),fog:!1})),pe=new gt(new Ne(Yt+160,Ct+160,120),I);pe.position.z=-70,mt.add(pe,Se);for(let Ee of[-1,1]){let Le=new gt(new Ne(120,2e3,120),I);Le.position.set(Ee*Yt*.35,-Ct/2-1e3,-60),mt.add(Le)}mt.position.set(0,4300,H*(bn+4e3)),mt.rotation.order="YXZ",mt.rotation.y=H>0?Math.PI:0,mt.rotation.x=.12,a.add(mt),M.push({c:K,tex:ut,ctx:K.getContext("2d")})}}let O="";function W(I,H,K,ut){let mt=`${I}|${H}|${K}|${ut}`;if(mt!==O){O=mt;for(let Yt of M){let Ct=Yt.ctx,Se=Yt.c.width,pe=Yt.c.height,Ee=Ct.createLinearGradient(0,0,0,pe);Ee.addColorStop(0,"#0a1430"),Ee.addColorStop(1,"#03060f"),Ct.fillStyle=Ee,Ct.fillRect(0,0,Se,pe),Ct.textAlign="center",Ct.textBaseline="middle",ut?(Ct.fillStyle=ut==="blue"?"#2f7bff":"#ff7a1a",Ct.fillRect(0,0,Se,pe),Ct.fillStyle="#fff",Ct.font="italic 900 220px Arial Black, Arial, sans-serif",Ct.fillText("GOAL!!",Se/2,pe/2+10)):(Ct.fillStyle="#9fc4ff",Ct.font="bold 44px Arial, sans-serif",Ct.fillText("ROCKET ARENA",Se/2,52),Ct.fillStyle="#1f5fe0",Ct.fillRect(70,110,330,250),Ct.fillStyle="#e8621a",Ct.fillRect(Se-400,110,330,250),Ct.fillStyle="#fff",Ct.font="italic 900 190px Arial Black, Arial, sans-serif",Ct.fillText(String(I),235,245),Ct.fillText(String(H),Se-235,245),Ct.font="bold 40px Arial, sans-serif",Ct.fillText("BLUE",235,400),Ct.fillText("ORANGE",Se-235,400),Ct.font="bold 110px Arial, sans-serif",Ct.fillText(K,Se/2,245)),Ct.fillStyle="rgba(0,0,0,0.18)";for(let Le=0;Le<pe;Le+=4)Ct.fillRect(0,Le,Se,1);Yt.tex.needsUpdate=!0}}}W(0,0,"5:00",null);let $={value:0};{let I=[["#1f5fe0","#ffffff","#e8621a"],["#c8102e","#ffffff","#003da5"],["#009246","#ffffff","#ce2b37"],["#000000","#dd0000","#ffce00"],["#ff7a1a","#ffffff","#2f7bff"],["#0055a4","#ffffff","#ef4135"],["#ffcc00","#00843d","#00843d"],["#2f7bff","#2f7bff","#ffffff"]],ut=new te({color:10133930,metalness:.9,roughness:.3}),mt=Or(1100,2),Yt=new Ye(9,9,520,6),Ct=new Os(Yt,ut,mt.length),Se=I.map(()=>[]);mt.forEach((pe,Ee)=>{let Le=pe.x-pe.nx*5950,Qn=pe.z-pe.nz*5950;f.makeTranslation(Le,4910,Qn),Ct.setMatrixAt(Ee,f);let Bn=new gn(300,190,8,1);Bn.translate(300/2,0,0),Bn.rotateY(Math.atan2(pe.nx,pe.nz)),Bn.translate(Le,5070,Qn),Se[Ee%I.length].push(Bn)}),a.add(Ct),I.forEach((pe,Ee)=>{if(!Se[Ee].length)return;let Le=document.createElement("canvas");Le.width=96,Le.height=64;let Qn=Le.getContext("2d"),Bn=Ee%2===0;pe.forEach((Mi,ts)=>{Qn.fillStyle=Mi,Bn?Qn.fillRect(ts*32,0,32,64):Qn.fillRect(0,ts*21.4,96,21.4)});let vi=new An(Le);vi.colorSpace=Ke;let On=new te({map:vi,side:ve,roughness:.9,emissive:16777215,emissiveMap:vi,emissiveIntensity:.15});On.onBeforeCompile=Mi=>{Mi.uniforms.uTime=$,Mi.vertexShader=`uniform float uTime;
`+Mi.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
          float wave = sin(uTime * 3.0 + position.x * 0.01 + position.z * 0.01 + uv.x * 5.0) * 45.0 * uv.x;
          transformed.y += wave * 0.6;
          transformed.x += wave * 0.4;
          transformed.z += wave * 0.4;`)};let yi=Jp(Se[Ee]);a.add(new gt(yi,On))})}if(o.push(I=>{$.value+=I}),n.stars){let I=document.createElement("canvas");I.width=4,I.height=256;let H=I.getContext("2d"),K=H.createLinearGradient(0,0,0,256);K.addColorStop(0,"rgba(255,255,255,0)"),K.addColorStop(.7,"rgba(255,255,255,0.35)"),K.addColorStop(1,"rgba(255,255,255,1)"),H.fillStyle=K,H.fillRect(0,0,4,256);let ut=new An(I),mt=new Ye(9,.8,420,24,1,!0);mt.translate(0,210,0);let Yt=new _e({map:ut,color:9418495,transparent:!0,opacity:.07,blending:ln,depthWrite:!1,side:ve,fog:!1}),Ct=[];for(let pe=0;pe<6;pe++){let Ee=pe/6*Math.PI*2+.3,Le=new gt(mt,Yt);Le.position.set(Math.cos(Ee)*125,5,Math.sin(Ee)*150),Le.renderOrder=3,r.add(Le),Ct.push({beam:Le,a:Ee,phase:pe*1.7})}let Se=0;o.push(pe=>{Se+=pe;for(let Ee of Ct)Ee.beam.rotation.set(0,0,0),Ee.beam.rotateY(Ee.a+Math.sin(Se*.25+Ee.phase)*.6),Ee.beam.rotateZ(-.55-Math.sin(Se*.31+Ee.phase)*.2)})}{let I=document.createElement("canvas");I.width=256,I.height=64;let H=I.getContext("2d");H.fillStyle="#fff";for(let Yt=0;Yt<3;Yt++){let Ct=30+Yt*70;H.beginPath(),H.moveTo(Ct,8),H.lineTo(Ct+34,32),H.lineTo(Ct,56),H.lineTo(Ct+18,56),H.lineTo(Ct+52,32),H.lineTo(Ct+18,8),H.closePath(),H.fill()}let K=new An(I);K.wrapS=Ti;let ut=[];for(let Yt=0;Yt<=3;Yt++){let Ct=.42*(1-Yt/3);ut.push([pn-(pn-3)*Math.cos(Ct),pn-(pn-3)*Math.sin(Ct)])}let mt=new gt(jn(x,ut,{uLen:500,vOf:Yt=>Yt/3,skip:$r(Je),colorOf:(Yt,Ct,Se)=>eh(Se,2.2)}),new _e({map:K,vertexColors:!0,transparent:!0,blending:ln,depthWrite:!1,side:ve,fog:!1}));mt.renderOrder=2,a.add(mt),o.push(Yt=>{K.offset.x=(K.offset.x-Yt*.25)%1})}let dt={0:[],1:[]};for(let I of[0,1]){let H=I===0?-1:1;for(let K of[-2700,-1500,1500,2700])dt[I].push(new T(K,520,H*(bn-30)))}let ft=[],j=new te({color:2764598,roughness:.4,metalness:.7}),nt=new Ye(70,80,6,32),yt=new Ye(150,175,14,40),zt=new Li(64,7,8,40),bt=new Li(140,10,8,48),Mt=new Xn(52,24,16),Ht=new Ye(70,150,260,32,1,!0);for(let I of e.pads){let H=new Xe;H.position.set(I.x,0,I.z);let K=new te({color:3348992,emissive:16753183,emissiveIntensity:I.big?2.6:1.4});if(K.userData.base=I.big?2.6:1.4,I.big){let ut=new gt(yt,j);ut.position.y=4;let mt=new gt(bt,K);mt.rotation.x=Math.PI/2,mt.position.y=12;let Yt=new gt(Mt,new te({color:16752672,emissive:16747536,emissiveIntensity:3.5,roughness:.2}));Yt.position.y=110;let Ct=new gt(Ht,new _e({color:16751152,transparent:!0,opacity:.13,blending:ln,depthWrite:!1,side:ve}));Ct.position.y=135,H.add(ut,mt,Yt,Ct),ft.push({pad:I,grp:H,ring:mt,orb:Yt,cone:Ct,glowMat:K})}else{let ut=new gt(nt,j);ut.position.y=2;let mt=new gt(zt,K);mt.rotation.x=Math.PI/2,mt.position.y=6;let Yt=new gt(new Ii(40,24),K);Yt.rotation.x=-Math.PI/2,Yt.position.y=6,H.add(ut,mt,Yt),ft.push({pad:I,grp:H,ring:mt,glowMat:K})}a.add(H)}let Wt=new Bs;Wt.add(new gt(new Xn(100,32,16),$p(n)));let Qt=new _e({color:new Pt(12,12,11)});for(let I=0;I<10;I++){let H=I/10*Math.PI*2,K=new gt(new Ne(14,2,4),Qt);K.position.set(Math.cos(H)*30,30,Math.sin(H)*36),K.lookAt(0,0,0),Wt.add(K)}let B=new gt(new gn(200,200),new _e({color:1915416}));B.rotation.x=-Math.PI/2,B.position.y=-2,Wt.add(B);let vt=new Dr(s),et=vt.fromScene(Wt,.03).texture;vt.dispose(),t.environment=et,t.environmentIntensity=n.envI;let pt=0,Et=0;return o.push(I=>{Et+=I,pt=Math.max(0,pt-I*.18),Q.offset.y=pt>0?Math.abs(Math.sin(Et*14))*.012*Math.min(1,pt*2):0;for(let H of ft){let K=H.pad.active;H.orb&&(H.orb.visible=K,H.cone.visible=K,H.orb.position.y=110+Math.sin(Et*2.2+H.pad.x)*12,H.orb.rotation.y+=I);let ut=H.glowMat.userData.base;H.glowMat.emissiveIntensity=K?ut*(1+Math.sin(Et*4+H.pad.z)*.18):.12}for(let H of X)H.light.intensity=Math.max(0,H.light.intensity-I*900),H.frameMat.emissiveIntensity+=(H.base-H.frameMat.emissiveIntensity)*Math.min(1,I*1.5)}),{root:r,exposure:n.exposure,bindPads(I){ft.forEach((H,K)=>{I[K]&&(H.pad=I[K])})},dispose(){t.remove(r);let I=new Set;r.traverse(H=>{H.geometry&&!I.has(H.geometry)&&(I.add(H.geometry),H.geometry.dispose());let K=H.material?Array.isArray(H.material)?H.material:[H.material]:[];for(let ut of K)if(!I.has(ut)){I.add(ut);for(let mt in ut)ut[mt]&&ut[mt].isTexture&&!I.has(ut[mt])&&(I.add(ut[mt]),ut[mt].dispose());ut.dispose()}}),et.dispose(),t.environment=null,t.fog=null},update(I){for(let H of o)H(I)},cheer(I=1){pt=Math.max(pt,I)},pyroPoints:dt,setScreens(I,H,K,ut){W(I,H,K,ut)},goalFlash(I){let H=X[I];H.light.intensity=2500,H.frameMat.emissiveIntensity=14}}}var em="rocketArena.settings.v1";function fM(){let s=navigator.userAgent||"";return/Xbox/i.test(s)?"medium":/Android|iPhone|iPad|Mobile/i.test(s)?"low":"high"}function pM(){let s={quality:fM(),volume:.7,rumble:!0,ballCam:!0,fov:100,replays:!0,showFps:!1,timeOfDay:"night",split:"horizontal",duration:300,difficulty:"pro",teamSize_solo:1,teamSize_versus:1,teamSize_coop:2,handling:"easy",gameMode:"soccar",items:"all"};try{let t=JSON.parse(localStorage.getItem(em)||"{}");return{...s,...t}}catch{return s}}var hd=class{constructor(){this.settings=pM();let t=new URLSearchParams(location.search);t.get("quality")&&(this.settings.quality=t.get("quality")),this.input=new wo,this.audio=new To,this.audio.volume=this.settings.volume,this.input.onActivity=()=>this.audio.resume();let e=this.input.rumble.bind(this.input);this.input.rumble=(...n)=>{this.settings.rumble&&e(...n)},this.input.onPadConnect=(n,i)=>this.toast(i?"\u{1F3AE} Controller connected":"Controller disconnected"),this.hud=new Pc(document.getElementById("hud")),this.hud.show(!1),this.menu=new Lc(this,document.getElementById("menu")),this.container=document.getElementById("game"),this.paused=!1,this.match=null,this.buildGraphics(),this.startAttract(),this.last=performance.now(),this.fpsT=0,this.fpsN=0,document.getElementById("loading")?.remove(),requestAnimationFrame(n=>this.loop(n)),window.__app=this}buildGraphics(){this.gfx&&this.gfx.dispose(),this.gfx=new Qc(this.container,this.settings.quality),this.builtQuality=this.settings.quality,this.buildStadium()}buildStadium(){this.stadium&&this.stadium.dispose();let t=Rc.map(([e,n])=>({x:e,z:n,big:!0,active:!0})).concat(Cc.map(([e,n])=>({x:e,z:n,big:!1,active:!0})));this.stadium=Qp(this.gfx.renderer,this.gfx.scene,{quality:this.settings.quality,timeOfDay:this.settings.timeOfDay,pads:t}),this.gfx.setExposure(this.stadium.exposure),this.builtTime=this.settings.timeOfDay}saveSettings(){try{localStorage.setItem(em,JSON.stringify(this.settings))}catch{}}applySettings(){this.saveSettings(),this.audio.setVolume(this.settings.volume),this.settings.quality!==this.builtQuality&&(this.disposeMatch(),this.buildGraphics(),this.startAttract(!1))}ensureStadium(){this.settings.timeOfDay!==this.builtTime&&this.buildStadium()}disposeMatch(){this.match&&this.match.dispose(),this.match=null}startAttract(t=!0){this.disposeMatch(),this.paused=!1,this.hud.show(!1),this.attractCount=(this.attractCount||0)+1;let e=this.attractCount%2===0?"rumble":"soccar";this.match=new vo(this,{mode:"attract",gameMode:e,items:"all",teamSize:2,duration:0,difficulty:"pro",humans:[]}),this.stadium.bindPads(this.match.world.pads),t&&this.menu.show("main")}startMatch(t){this.audio.resume(),this.lastCfg=t,this.disposeMatch(),this.ensureStadium(),this.menu.hide(),this.paused=!1,this.match=new vo(this,t),this.stadium.bindPads(this.match.world.pads)}restartMatch(){this.lastCfg&&this.startMatch(this.lastCfg)}pauseMatch(){this.paused||(this.paused=!0,this.menu.show("pause"))}resume(){if(this.paused=!1,this.menu.hide(),this.resumeFrame=this.frames,this.match){this.match.acc=0;for(let t of this.match.humans)t.car.prevJump=!0}}quitToMenu(){this.startAttract(!0)}showResults(t){this.menu.show("results",t)}toggleFullscreen(){nm()}toast(t){let e=document.createElement("div");e.className="toast",e.textContent=t,document.body.appendChild(e),setTimeout(()=>e.classList.add("out"),2200),setTimeout(()=>e.remove(),2800)}loop(t){requestAnimationFrame(i=>this.loop(i));let e=Math.min(.1,Math.max(0,(t-this.last)/1e3));this.last=t,this.input.update();let n=this.input.menu();if(this.menu.visible&&this.menu.update(n),this.match)if(this.paused){for(let i of this.match.engines)this.audio.updateEngine(i,0,0,!1,!1,!1);this.match.renderPaused()}else this.match.update(e);if(this.fpsT+=e,this.fpsN++,this.fpsT>.5){let i=this.fpsN/this.fpsT;this.hud.setFps(this.settings.showFps?`${Math.round(i)} FPS`:"");let r=this.match&&!this.match.attract&&!this.paused;this.slowT=r&&i<32&&this.settings.quality!=="low"?(this.slowT||0)+this.fpsT:0,this.slowT>6&&!this.slowHinted&&(this.slowHinted=!0,this.toast("Running slowly? Lower Graphics in Settings for a smoother game")),this.fpsT=0,this.fpsN=0}this.input.endFrame(),this.frames=(this.frames||0)+1}};function mM(){try{history.pushState({game:1},""),window.addEventListener("popstate",()=>history.pushState({game:1},""))}catch{}}function nm(){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen({navigationUI:"hide"}).catch(()=>{})}catch{}}function tm(){mM(),window.addEventListener("keydown",s=>{s.code==="KeyF"&&!s.repeat&&window.__app&&window.__app.menu.visible&&nm()});try{new hd}catch(s){console.error(s);let t=document.getElementById("loading");t&&(t.innerHTML=`<div class="err">Could not start the game: ${s.message}<br>Your browser needs WebGL 2 support.</div>`)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",tm):tm();})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
