(()=>{var kr=["a","b","x","y","lb","rb","lt","rt","view","menu","ls","rs","up","down","left","right","guide"],Rp={solo:{up:["KeyW","ArrowUp"],down:["KeyS","ArrowDown"],left:["KeyA","ArrowLeft"],right:["KeyD","ArrowRight"],jump:["Space","KeyK"],boost:["ShiftLeft","ShiftRight","KeyL"],slide:["ControlLeft","KeyC","KeyJ"],rollL:["KeyQ","KeyU"],rollR:["KeyE","KeyO"],cam:["KeyR","KeyI"],pause:["Escape","KeyP"]},p1:{up:["KeyW"],down:["KeyS"],left:["KeyA"],right:["KeyD"],jump:["Space"],boost:["ShiftLeft"],slide:["ControlLeft","KeyC"],rollL:["KeyQ"],rollR:["KeyE"],cam:["KeyR"],pause:["Escape"]},p2:{up:["ArrowUp"],down:["ArrowDown"],left:["ArrowLeft"],right:["ArrowRight"],jump:["KeyK","Numpad0"],boost:["KeyL","NumpadDecimal"],slide:["KeyJ","Numpad1"],rollL:["KeyU"],rollR:["KeyO"],cam:["KeyI","Numpad2"],pause:["KeyP"]}},Cp=new Set(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab","ShiftLeft","ShiftRight","ControlLeft"]);function lo(s,t,e=.16){let n=Math.hypot(s,t);if(n<e)return[0,0];let i=Math.min(1,(n-e)/(1-e))/n;return[s*i,t*i]}var Oc=class{constructor(t){this.index=t,this.id="",this.connected=!1,this.b={},this.prev={};for(let e of kr)this.b[e]=0,this.prev[e]=0;this.lx=0,this.ly=0,this.rx=0,this.ry=0,this.triggerSeenNeg=[!1,!1],this.navRepeat={dir:"",t:0},this.raw=null}pressed(t){return this.b[t]>.5&&this.prev[t]<=.5}down(t){return this.b[t]>.5}},co=class{constructor(){this.keys=new Set,this.keysPressed=new Set,this.pads=[],this.onActivity=null,this.onPadConnect=null,this.kbNav={dir:"",t:0},this.lastFrame=performance.now();try{navigator.gamepadInputEmulation="gamepad"}catch{}window.addEventListener("keydown",t=>{Cp.has(t.code)&&!(t.target&&t.target.tagName==="INPUT")&&t.preventDefault(),t.repeat||this.keysPressed.add(t.code),this.keys.add(t.code),this.onActivity&&this.onActivity()}),window.addEventListener("keyup",t=>{this.keys.delete(t.code)}),window.addEventListener("blur",()=>this.keys.clear()),window.addEventListener("pointerdown",()=>{this.onActivity&&this.onActivity()}),window.addEventListener("gamepadconnected",t=>{this.onPadConnect&&this.onPadConnect(t.gamepad,!0)}),window.addEventListener("gamepaddisconnected",t=>{let e=this.pads[t.gamepad.index];e&&(e.connected=!1),this.onPadConnect&&this.onPadConnect(t.gamepad,!1)})}update(){let t=performance.now();this.dt=Math.min(.1,(t-this.lastFrame)/1e3),this.lastFrame=t;let e=[];try{e=navigator.getGamepads?navigator.getGamepads():[]}catch{e=[]}for(let n of this.pads)n&&(n.connected=!1);for(let n=0;n<e.length;n++){let i=e[n];if(!i||!i.connected)continue;let r=this.pads[i.index]||(this.pads[i.index]=new Oc(i.index));r.connected=!0,r.id=i.id,r.raw=i;for(let a of kr)r.prev[a]=r.b[a];if(this.readPad(r,i),this.onActivity){for(let a of kr)if(r.pressed(a)){this.onActivity();break}}}}readPad(t,e){let n=r=>e.buttons[r]?typeof e.buttons[r]=="object"?e.buttons[r].value||(e.buttons[r].pressed?1:0):e.buttons[r]:0,i=r=>e.axes[r]!==void 0?e.axes[r]:0;if(e.mapping==="standard"||e.axes.length<6)kr.forEach((r,a)=>{t.b[r]=n(a)}),[t.lx,t.ly]=lo(i(0),i(1)),[t.rx,t.ry]=lo(i(2),i(3));else{let r={a:0,b:1,x:2,y:3,lb:4,rb:5,view:6,menu:7,guide:8,ls:9,rs:10};for(let o of kr)t.b[o]=0;for(let o in r)t.b[o]=n(r[o]);let a=(o,l)=>{let c=i(o);return c<-.5&&(t.triggerSeenNeg[l]=!0),t.triggerSeenNeg[l]?(c+1)/2:Math.max(0,c)};t.b.lt=a(2,0),t.b.rt=a(5,1),t.b.left=i(6)<-.5?1:0,t.b.right=i(6)>.5?1:0,t.b.up=i(7)<-.5?1:0,t.b.down=i(7)>.5?1:0,[t.lx,t.ly]=lo(i(0),i(1)),[t.rx,t.ry]=lo(i(3),i(4))}}endFrame(){this.keysPressed.clear()}connectedPads(){return this.pads.filter(t=>t&&t.connected)}anyKey(t){for(let e of t)if(this.keys.has(e))return!0;return!1}anyKeyPressed(t){for(let e of t)if(this.keysPressed.has(e))return!0;return!1}keyboardControls(t){let e=Rp[t],n=this.anyKey(e.up)?1:0,i=this.anyKey(e.down)?1:0,r=this.anyKey(e.left)?1:0,a=this.anyKey(e.right)?1:0;return{throttle:n-i,steer:a-r,pitch:i-n,yaw:a-r,roll:(this.anyKey(e.rollR)?1:0)-(this.anyKey(e.rollL)?1:0),jump:this.anyKey(e.jump),boost:this.anyKey(e.boost),powerslide:this.anyKey(e.slide),ballCam:this.anyKeyPressed(e.cam),pause:this.anyKeyPressed(e.pause),lookX:0,lookY:0,skip:this.anyKeyPressed(e.jump)}}padControls(t){let e=t.b.right-t.b.left,n=t.b.down-t.b.up,i=Math.abs(t.lx)>Math.abs(e)?t.lx:e,r=Math.abs(t.ly)>Math.abs(n)?t.ly:n;return{throttle:t.b.rt-t.b.lt,steer:i,pitch:r,yaw:i,roll:t.b.rb-t.b.lb,jump:t.down("a"),boost:t.down("b"),powerslide:t.down("x"),ballCam:t.pressed("y"),pause:t.pressed("menu"),lookX:t.rx,lookY:t.ry,skip:t.pressed("a")}}controls(t){if(t.type==="kb")return this.keyboardControls(t.layout);if(t.type==="pad"){let n=this.pads[t.index];return!n||!n.connected?Pp():this.padControls(n)}let e=this.keyboardControls("solo");for(let n of this.connectedPads()){let i=this.padControls(n);for(let r in i)typeof i[r]=="boolean"?e[r]=e[r]||i[r]:Math.abs(i[r])>Math.abs(e[r])&&(e[r]=i[r])}return e}menu(){let t={up:!1,down:!1,left:!1,right:!1,confirm:!1,back:!1,start:!1,source:null},e=n=>this.anyKeyPressed(n);e(["ArrowUp","KeyW"])&&(t.up=!0),e(["ArrowDown","KeyS"])&&(t.down=!0),e(["ArrowLeft","KeyA"])&&(t.left=!0),e(["ArrowRight","KeyD"])&&(t.right=!0),e(["Enter","NumpadEnter","Space"])&&(t.confirm=!0,t.source={type:"kb"}),e(["Escape","Backspace"])&&(t.back=!0);for(let n of this.connectedPads()){n.pressed("up")&&(t.up=!0),n.pressed("down")&&(t.down=!0),n.pressed("left")&&(t.left=!0),n.pressed("right")&&(t.right=!0),n.pressed("a")&&(t.confirm=!0,t.source={type:"pad",index:n.index}),n.pressed("b")&&(t.back=!0),n.pressed("menu")&&(t.start=!0);let i="";n.ly<-.6?i="up":n.ly>.6?i="down":n.lx<-.6?i="left":n.lx>.6&&(i="right");let r=n.navRepeat;i&&i!==r.dir?(t[i]=!0,r.t=.38):i&&(r.t-=this.dt||.016,r.t<=0&&(t[i]=!0,r.t=.13)),r.dir=i}return t}rumble(t,e,n,i){let r=t.type==="pad"?[this.pads[t.index]]:t.type==="any"?this.connectedPads():[];for(let a of r){let o=a&&a.raw;if(o)try{o.vibrationActuator&&o.vibrationActuator.playEffect?o.vibrationActuator.playEffect("dual-rumble",{startDelay:0,duration:i,weakMagnitude:Math.min(1,n),strongMagnitude:Math.min(1,e)}).catch(()=>{}):o.hapticActuators&&o.hapticActuators[0]&&o.hapticActuators[0].pulse(Math.min(1,Math.max(e,n)),i)}catch{}}}};function Pp(){return{throttle:0,steer:0,pitch:0,yaw:0,roll:0,jump:!1,boost:!1,powerslide:!1,ballCam:!1,pause:!1,lookX:0,lookY:0,skip:!1}}function Bc(s){if(!s)return"Controller";let t=s.toLowerCase();return t.includes("xbox")||t.includes("xinput")||t.includes("045e")?"Xbox Controller":t.includes("dualsense")||t.includes("dualshock")||t.includes("054c")?"PlayStation Controller":"Controller"}var ho=class{constructor(){this.ctx=null,this.volume=.7,this.engines=[]}init(){if(this.ctx)return!0;let t=window.AudioContext||window.webkitAudioContext;if(!t)return!1;try{this.ctx=new t}catch{return!1}let e=this.ctx;this.master=e.createGain(),this.master.gain.value=this.volume;let n=e.createDynamicsCompressor();n.threshold.value=-14,n.ratio.value=4,this.master.connect(n).connect(e.destination);let i=e.sampleRate*2;this.noise=e.createBuffer(1,i,e.sampleRate);let r=this.noise.getChannelData(0),a=0;for(let u=0;u<i;u++){let d=Math.random()*2-1;a=(a+.02*d)/1.02,r[u]=d*.6+a*3}let o=this.loopNoise(),l=e.createBiquadFilter();l.type="bandpass",l.frequency.value=700,l.Q.value=.6;let c=e.createOscillator();c.frequency.value=.23;let h=e.createGain();return h.gain.value=.015,this.crowdGain=e.createGain(),this.crowdGain.gain.value=.05,c.connect(h).connect(this.crowdGain.gain),o.connect(l).connect(this.crowdGain).connect(this.master),c.start(),!0}resume(){this.init()&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{})}get ready(){return this.ctx&&this.ctx.state==="running"}setVolume(t){this.volume=t,this.master&&this.master.gain.setTargetAtTime(t,this.ctx.currentTime,.05)}loopNoise(){let t=this.ctx.createBufferSource();return t.buffer=this.noise,t.loop=!0,t.loopStart=Math.random(),t.start(0,Math.random()*1.5),t}burst({dur:t=.2,gain:e=.5,freq:n=1200,endFreq:i=null,type:r="lowpass",q:a=.7,pan:o=0,delay:l=0}){if(!this.ready)return;let c=this.ctx,h=c.currentTime+l,u=c.createBufferSource();u.buffer=this.noise;let d=c.createBiquadFilter();d.type=r,d.frequency.setValueAtTime(n,h),i&&d.frequency.exponentialRampToValueAtTime(i,h+t),d.Q.value=a;let f=c.createGain();f.gain.setValueAtTime(1e-4,h),f.gain.exponentialRampToValueAtTime(e,h+.008),f.gain.exponentialRampToValueAtTime(1e-4,h+t);let m=c.createStereoPanner?c.createStereoPanner():null,v=u.connect(d).connect(f);m&&(m.pan.value=o,v=v.connect(m)),v.connect(this.master),u.start(h,Math.random()*1.5),u.stop(h+t+.05)}tone({freq:t=440,endFreq:e=null,dur:n=.2,gain:i=.3,type:r="sine",delay:a=0,attack:o=.005}){if(!this.ready)return;let l=this.ctx,c=l.currentTime+a,h=l.createOscillator();h.type=r,h.frequency.setValueAtTime(t,c),e&&h.frequency.exponentialRampToValueAtTime(e,c+n);let u=l.createGain();u.gain.setValueAtTime(1e-4,c),u.gain.exponentialRampToValueAtTime(i,c+o),u.gain.exponentialRampToValueAtTime(1e-4,c+n),h.connect(u).connect(this.master),h.start(c),h.stop(c+n+.05)}createEngine(t=0){if(!this.ctx)return null;let e=this.ctx,n=e.createGain();n.gain.value=0;let i=e.createStereoPanner?e.createStereoPanner():null;i?(i.pan.value=t,n.connect(i).connect(this.master)):n.connect(this.master);let r=e.createOscillator();r.type="sawtooth";let a=e.createOscillator();a.type="square";let o=e.createBiquadFilter();o.type="lowpass",o.Q.value=2;let l=e.createGain();l.gain.value=.5,r.connect(o),a.connect(l).connect(o),o.connect(n),r.start(),a.start();let c=this.loopNoise(),h=e.createBiquadFilter();h.type="bandpass",h.frequency.value=900,h.Q.value=.5;let u=e.createGain();u.gain.value=0,c.connect(h).connect(u),i?u.connect(i):u.connect(this.master);let d={out:n,o1:r,o2:a,lp:o,bg:u,bf:h,nodes:[r,a,c]};return this.engines.push(d),d}updateEngine(t,e,n,i,r,a){if(!t||!this.ctx)return;let o=this.ctx.currentTime,l=Math.abs(n),c=38+e*.05+l*14;t.o1.frequency.setTargetAtTime(c,o,.06),t.o2.frequency.setTargetAtTime(c*.5,o,.06),t.lp.frequency.setTargetAtTime(240+e*.9+l*700,o,.08),t.out.gain.setTargetAtTime(a?.05+l*.06+(r?.02:0):0,o,.1),t.bg.gain.setTargetAtTime(a&&i?.22:0,o,.04),t.bf.frequency.setTargetAtTime(i?700+e*.4:900,o,.1)}stopEngines(){for(let t of this.engines)try{t.out.gain.value=0,t.bg.gain.value=0;for(let e of t.nodes)e.stop()}catch{}this.engines=[]}hit(t,e=0){let n=Math.min(1,t/3500);this.burst({dur:.12+n*.15,gain:.25+n*.6,freq:900+n*3e3,endFreq:200,pan:e}),this.tone({freq:140,endFreq:45,dur:.18+n*.15,gain:.25+n*.5}),n>.6&&this.burst({dur:.35,gain:.25*n,freq:4e3,endFreq:800,type:"highpass",pan:e})}bounce(t){let e=Math.min(1,t/2500);this.tone({freq:90,endFreq:40,dur:.15,gain:.08+e*.2}),this.burst({dur:.08,gain:.05+e*.15,freq:600,endFreq:150})}bump(){this.burst({dur:.18,gain:.5,freq:1500,endFreq:200}),this.tone({freq:220,endFreq:70,dur:.15,gain:.3,type:"triangle"})}demo(){this.burst({dur:.9,gain:.9,freq:3e3,endFreq:80}),this.tone({freq:90,endFreq:30,dur:.7,gain:.7}),this.burst({dur:.5,gain:.3,freq:6e3,endFreq:1500,type:"highpass",delay:.05})}goal(){this.burst({dur:1.8,gain:1,freq:4e3,endFreq:60}),this.tone({freq:70,endFreq:25,dur:1.2,gain:.9}),this.burst({dur:.6,gain:.4,freq:7e3,endFreq:2e3,type:"highpass",delay:.05}),this.cheer(1)}cheer(t){if(!this.ready)return;let e=this.ctx.currentTime,n=this.crowdGain.gain;n.cancelScheduledValues(e),n.setValueAtTime(n.value,e),n.linearRampToValueAtTime(.05+.35*t,e+.4),n.linearRampToValueAtTime(.05+.25*t,e+2.5),n.linearRampToValueAtTime(.05,e+6);for(let i=0;i<6;i++)this.burst({dur:1.2+Math.random(),gain:.06*t,freq:500+Math.random()*900,type:"bandpass",q:4,delay:Math.random()*1.2,pan:Math.random()*2-1})}boostPickup(t){t?(this.tone({freq:520,endFreq:1200,dur:.18,gain:.12,type:"triangle"}),this.tone({freq:780,endFreq:1600,dur:.2,gain:.08,type:"triangle",delay:.06})):this.tone({freq:1100,endFreq:1500,dur:.07,gain:.06,type:"triangle"})}jump(){this.burst({dur:.16,gain:.12,freq:700,endFreq:2400,type:"bandpass",q:1.2})}dodge(){this.burst({dur:.25,gain:.16,freq:1800,endFreq:500,type:"bandpass",q:1})}land(t){this.tone({freq:70,endFreq:40,dur:.12,gain:Math.min(.25,t/3e3)})}beep(t){this.tone({freq:t?880:523,dur:t?.5:.18,gain:.25,type:"square"}),this.tone({freq:t?1760:1046,dur:t?.45:.15,gain:.08,type:"sine"})}horn(){for(let t of[220,277,330])this.tone({freq:t,dur:1.4,gain:.12,type:"sawtooth",attack:.04})}click(){this.tone({freq:1400,dur:.04,gain:.05,type:"square"})}select(){this.tone({freq:900,endFreq:1400,dur:.09,gain:.08,type:"triangle"})}};var yd=0,Mh=1,Md=2;var ws=1,Sd=2,mr=3,es=0,sn=1,Ie=2,Gn=0,ns=1,_n=2,Sh=3,bh=4,bd=5;var As=100,Ed=101,Td=102,wd=103,Ad=104,Rd=200,Cd=201,Pd=202,Id=203,Eh=204,Th=205,Ld=206,Dd=207,Nd=208,Ud=209,Fd=210,Od=211,Bd=212,zd=213,Hd=214,Fo=0,Oo=1,Bo=2,er=3,zo=4,Ho=5,Vo=6,ko=7,wh=0,Vd=1,kd=2,ii=0,Ia=1,La=2,Da=3,Rs=4,Na=5,Ua=6,Fa=7;var Ah=300,is=301,Cs=302,xl=303,_l=304,Oa=306,nr=1e3,ci=1001,Go=1002,ke=1003,Gd=1004;var Ba=1005;var nn=1006,vl=1007;var ss=1008;var Tn=1009,Rh=1010,Ch=1011,gr=1012,yl=1013,si=1014,Wn=1015,Ye=1016,Ml=1017,Sl=1018,xr=1020,Ph=35902,Ih=35899,Lh=1021,Dh=1022,Xn=1023,ui=1026,rs=1027,bl=1028,El=1029,as=1030,Tl=1031;var wl=1033,za=33776,Ha=33777,Va=33778,ka=33779,Al=35840,Rl=35841,Cl=35842,Pl=35843,Il=36196,Ll=37492,Dl=37496,Nl=37488,Ul=37489,Ga=37490,Fl=37491,Ol=37808,Bl=37809,zl=37810,Hl=37811,Vl=37812,kl=37813,Gl=37814,Wl=37815,Xl=37816,ql=37817,Yl=37818,Zl=37819,Jl=37820,Kl=37821,$l=36492,jl=36494,Ql=36495,tc=36283,ec=36284,Wa=36285,nc=36286;var ta=2300,Wo=2301,No=2302,ch=2303,hh=2400,uh=2401,dh=2402;var Wd=3200;var ic=0,Xd=1,Li="",tn="srgb",ea="srgb-linear",na="linear",de="srgb";var Uo=7680;var qd=519,Yd=512,Zd=513,Jd=514,sc=515,Kd=516,$d=517,rc=518,jd=519,Qd=35044,Xa=35048;var Nh="300 es",ni=2e3,ir=2001;function Ip(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function Lp(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function ia(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function tf(){let s=ia("canvas");return s.style.display="block",s}var Wu={},sr=null;function Uh(...s){let t="THREE."+s.shift();sr?sr("log",t,...s):console.log(t,...s)}function ef(s){let t=s[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=s[1];e&&e.isStackTrace?s[0]+=" "+e.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function Gt(...s){s=ef(s);let t="THREE."+s.shift();if(sr)sr("warn",t,...s);else{let e=s[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...s)}}function Wt(...s){s=ef(s);let t="THREE."+s.shift();if(sr)sr("error",t,...s);else{let e=s[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...s)}}function Ms(...s){let t=s.join(" ");t in Wu||(Wu[t]=!0,Gt(...s))}function nf(s,t,e){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var sf={[Fo]:Oo,[Bo]:Vo,[zo]:ko,[er]:Ho,[Oo]:Fo,[Vo]:Bo,[ko]:zo,[Ho]:er},di=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let i=n[t];if(i!==void 0){let r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,t);t.target=null}}},ln=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Xu=1234567,Kr=Math.PI/180,rr=180/Math.PI;function Ps(){let s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(ln[s&255]+ln[s>>8&255]+ln[s>>16&255]+ln[s>>24&255]+"-"+ln[t&255]+ln[t>>8&255]+"-"+ln[t>>16&15|64]+ln[t>>24&255]+"-"+ln[e&63|128]+ln[e>>8&255]+"-"+ln[e>>16&255]+ln[e>>24&255]+ln[n&255]+ln[n>>8&255]+ln[n>>16&255]+ln[n>>24&255]).toLowerCase()}function ee(s,t,e){return Math.max(t,Math.min(e,s))}function Fh(s,t){return(s%t+t)%t}function Dp(s,t,e,n,i){return n+(s-t)*(i-n)/(e-t)}function Np(s,t,e){return s!==t?(e-s)/(t-s):0}function $r(s,t,e){return(1-e)*s+e*t}function Up(s,t,e,n){return $r(s,t,1-Math.exp(-e*n))}function Fp(s,t=1){return t-Math.abs(Fh(s,t*2)-t)}function Op(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function Bp(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function zp(s,t){return s+Math.floor(Math.random()*(t-s+1))}function Hp(s,t){return s+Math.random()*(t-s)}function Vp(s){return s*(.5-Math.random())}function kp(s){s!==void 0&&(Xu=s);let t=Xu+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Gp(s){return s*Kr}function Wp(s){return s*rr}function Xp(s){return s>0&&Number.isInteger(s)&&2**Math.round(Math.log2(s))===s}function qp(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Yp(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Zp(s,t,e,n,i){let r=Math.cos,a=Math.sin,o=r(e/2),l=a(e/2),c=r((t+n)/2),h=a((t+n)/2),u=r((t-n)/2),d=a((t-n)/2),f=r((n-t)/2),m=a((n-t)/2);switch(i){case"XYX":s.set(o*h,l*u,l*d,o*c);break;case"YZY":s.set(l*d,o*h,l*u,o*c);break;case"ZXZ":s.set(l*u,l*d,o*h,o*c);break;case"XZX":s.set(o*h,l*m,l*f,o*c);break;case"YXY":s.set(l*f,o*h,l*m,o*c);break;case"ZYZ":s.set(l*m,l*f,o*h,o*c);break;default:Gt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function Qs(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:case Uint8ClampedArray:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function mn(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var xe={DEG2RAD:Kr,RAD2DEG:rr,generateUUID:Ps,clamp:ee,euclideanModulo:Fh,mapLinear:Dp,inverseLerp:Np,lerp:$r,damp:Up,pingpong:Fp,smoothstep:Op,smootherstep:Bp,randInt:zp,randFloat:Hp,randFloatSpread:Vp,seededRandom:kp,degToRad:Gp,radToDeg:Wp,isPowerOfTwo:Xp,ceilPowerOfTwo:qp,floorPowerOfTwo:Yp,setQuaternionFromProperEuler:Zp,normalize:mn,denormalize:Qs},kh=class kh{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=ee(this.x,t.x,e.x),this.y=ee(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=ee(this.x,t,e),this.y=ee(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ee(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(ee(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*i+t.x,this.y=r*i+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};kh.prototype.isVector2=!0;var lt=kh,pe=class{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3],d=r[a+0],f=r[a+1],m=r[a+2],v=r[a+3];if(u!==v||l!==d||c!==f||h!==m){let p=l*d+c*f+h*m+u*v;p<0&&(d=-d,f=-f,m=-m,v=-v,p=-p);let g=1-o;if(p<.9995){let x=Math.acos(p),T=Math.sin(x);g=Math.sin(g*x)/T,o=Math.sin(o*x)/T,l=l*g+d*o,c=c*g+f*o,h=h*g+m*o,u=u*g+v*o}else{l=l*g+d*o,c=c*g+f*o,h=h*g+m*o,u=u*g+v*o;let x=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=x,c*=x,h*=x,u*=x}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,i,r,a){let o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[a],d=r[a+1],f=r[a+2],m=r[a+3];return t[e]=o*m+h*u+l*f-c*d,t[e+1]=l*m+h*d+c*u-o*f,t[e+2]=c*m+h*f+o*d-l*u,t[e+3]=h*m-o*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,i=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(r/2),d=l(n/2),f=l(i/2),m=l(r/2);switch(a){case"XYZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"YXZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"ZXY":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"ZYX":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"YZX":this._x=d*h*u+c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u-d*f*m;break;case"XZY":this._x=d*h*u-c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u+d*f*m;break;default:Gt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],i=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=n+o+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(a-i)*f}else if(n>o&&n>u){let f=2*Math.sqrt(1+n-o-u);this._w=(h-l)/f,this._x=.25*f,this._y=(i+a)/f,this._z=(r+c)/f}else if(o>u){let f=2*Math.sqrt(1+o-n-u);this._w=(r-c)/f,this._x=(i+a)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-n-o);this._w=(a-i)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ee(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,i=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+i*c-r*l,this._y=i*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,i=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,i=-i,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+n*e,this._y=this._y*l+i*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+i*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Gh=class Gh{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(qu.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(qu.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,i=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*i-o*n),h=2*(o*e-r*i),u=2*(r*n-a*e);return this.x=e+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=i+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=ee(this.x,t.x,e.x),this.y=ee(this.y,t.y,e.y),this.z=ee(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=ee(this.x,t,e),this.y=ee(this.y,t,e),this.z=ee(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ee(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,i=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=i*l-r*o,this.y=r*a-n*l,this.z=n*o-i*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return zc.copy(this).projectOnVector(t),this.sub(zc)}reflect(t){return this.sub(zc.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(ee(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Gh.prototype.isVector3=!0;var w=Gh,zc=new w,qu=new pe,Wh=class Wh{constructor(t,e,n,i,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c)}set(t,e,n,i,r,a,o,l,c){let h=this.elements;return h[0]=t,h[1]=i,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],m=n[8],v=i[0],p=i[3],g=i[6],x=i[1],T=i[4],M=i[7],b=i[2],E=i[5],P=i[8];return r[0]=a*v+o*x+l*b,r[3]=a*p+o*T+l*E,r[6]=a*g+o*M+l*P,r[1]=c*v+h*x+u*b,r[4]=c*p+h*T+u*E,r[7]=c*g+h*M+u*P,r[2]=d*v+f*x+m*b,r[5]=d*p+f*T+m*E,r[8]=d*g+f*M+m*P,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+i*r*c-i*a*l}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,d=o*l-h*r,f=c*r-a*l,m=e*u+n*d+i*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/m;return t[0]=u*v,t[1]=(i*c-h*n)*v,t[2]=(o*n-i*a)*v,t[3]=d*v,t[4]=(h*e-i*l)*v,t[5]=(i*r-o*e)*v,t[6]=f*v,t[7]=(n*l-c*e)*v,t[8]=(a*e-n*r)*v,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-i*c,i*l,-i*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return Ms("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Hc.makeScale(t,e)),this}rotate(t){return Ms("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Hc.makeRotation(-t)),this}translate(t,e){return Ms("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Hc.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Wh.prototype.isMatrix3=!0;var Zt=Wh,Hc=new Zt,Yu=new Zt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Zu=new Zt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Jp(){let s={enabled:!0,workingColorSpace:ea,spaces:{},convert:function(i,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===de&&(i.r=Ai(i.r),i.g=Ai(i.g),i.b=Ai(i.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===de&&(i.r=tr(i.r),i.g=tr(i.g),i.b=tr(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Li?na:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,a){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return Ms("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return Ms("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[ea]:{primaries:t,whitePoint:n,transfer:na,toXYZ:Yu,fromXYZ:Zu,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:tn},outputColorSpaceConfig:{drawingBufferColorSpace:tn}},[tn]:{primaries:t,whitePoint:n,transfer:de,toXYZ:Yu,fromXYZ:Zu,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:tn}}}),s}var ne=Jp();function Ai(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function tr(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var zs,Xo=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{zs===void 0&&(zs=ia("canvas")),zs.width=t.width,zs.height=t.height;let i=zs.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),n=zs}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=ia("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=Ai(r[a]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Ai(e[n]/255)*255):e[n]=Ai(e[n]);return{data:e,width:t.width,height:t.height}}else return Gt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Kp=0,ar=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Kp++}),this.uuid=Ps(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(Vc(i[a].image)):r.push(Vc(i[a]))}else r=Vc(i);n.url=r}return e||(t.images[this.uuid]=n),n}};function Vc(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Xo.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(Gt("Texture: Unable to serialize Texture."),{})}var $p=0,kc=new w,gn=class s extends di{constructor(t=s.DEFAULT_IMAGE,e=s.DEFAULT_MAPPING,n=ci,i=ci,r=nn,a=ss,o=Xn,l=Tn,c=s.DEFAULT_ANISOTROPY,h=Li){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:$p++}),this.uuid=Ps(),this.name="",this.source=new ar(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new lt(0,0),this.repeat=new lt(1,1),this.center=new lt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Zt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(kc).x}get height(){return this.source.getSize(kc).y}get depth(){return this.source.getSize(kc).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Gt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){Gt(`Texture.setValues(): property '${e}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Ah)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case nr:t.x=t.x-Math.floor(t.x);break;case ci:t.x=t.x<0?0:1;break;case Go:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case nr:t.y=t.y-Math.floor(t.y);break;case ci:t.y=t.y<0?0:1;break;case Go:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};gn.DEFAULT_IMAGE=null;gn.DEFAULT_MAPPING=Ah;gn.DEFAULT_ANISOTROPY=1;var Xh=class Xh{constructor(t=0,e=0,n=0,i=1){this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*i+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r,l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],m=l[9],v=l[2],p=l[6],g=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-v)<.01&&Math.abs(m-p)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+v)<.1&&Math.abs(m+p)<.1&&Math.abs(c+f+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let T=(c+1)/2,M=(f+1)/2,b=(g+1)/2,E=(h+d)/4,P=(u+v)/4,y=(m+p)/4;return T>M&&T>b?T<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(T),i=E/n,r=P/n):M>b?M<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(M),n=E/i,r=y/i):b<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(b),n=P/r,i=y/r),this.set(n,i,r,e),this}let x=Math.sqrt((p-m)*(p-m)+(u-v)*(u-v)+(d-h)*(d-h));return Math.abs(x)<.001&&(x=1),this.x=(p-m)/x,this.y=(u-v)/x,this.z=(d-h)/x,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=ee(this.x,t.x,e.x),this.y=ee(this.y,t.y,e.y),this.z=ee(this.z,t.z,e.z),this.w=ee(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=ee(this.x,t,e),this.y=ee(this.y,t,e),this.z=ee(this.z,t,e),this.w=ee(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ee(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Xh.prototype.isVector4=!0;var Re=Xh,qo=class extends di{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:nn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Re(0,0,t,e),this.scissorTest=!1,this.viewport=new Re(0,0,t,e),this.textures=[];let i={width:t,height:e,depth:n.depth},r=new gn(i),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:nn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let i=Object.assign({},t.textures[e].image);this.textures[e].source=new ar(i)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ue=class extends qo{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},sa=class extends gn{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=ke,this.minFilter=ke,this.wrapR=ci,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Yo=class extends gn{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=ke,this.minFilter=ke,this.wrapR=ci,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var gl=class gl{constructor(t,e,n,i,r,a,o,l,c,h,u,d,f,m,v,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c,h,u,d,f,m,v,p)}set(t,e,n,i,r,a,o,l,c,h,u,d,f,m,v,p){let g=this.elements;return g[0]=t,g[4]=e,g[8]=n,g[12]=i,g[1]=r,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=h,g[10]=u,g[14]=d,g[3]=f,g[7]=m,g[11]=v,g[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new gl().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,i=1/Hs.setFromMatrixColumn(t,0).length(),r=1/Hs.setFromMatrixColumn(t,1).length(),a=1/Hs.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,i=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let d=a*h,f=a*u,m=o*h,v=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+m*c,e[5]=d-v*c,e[9]=-o*l,e[2]=v-d*c,e[6]=m+f*c,e[10]=a*l}else if(t.order==="YXZ"){let d=l*h,f=l*u,m=c*h,v=c*u;e[0]=d+v*o,e[4]=m*o-f,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=f*o-m,e[6]=v+d*o,e[10]=a*l}else if(t.order==="ZXY"){let d=l*h,f=l*u,m=c*h,v=c*u;e[0]=d-v*o,e[4]=-a*u,e[8]=m+f*o,e[1]=f+m*o,e[5]=a*h,e[9]=v-d*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let d=a*h,f=a*u,m=o*h,v=o*u;e[0]=l*h,e[4]=m*c-f,e[8]=d*c+v,e[1]=l*u,e[5]=v*c+d,e[9]=f*c-m,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let d=a*l,f=a*c,m=o*l,v=o*c;e[0]=l*h,e[4]=v-d*u,e[8]=m*u+f,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=f*u+m,e[10]=d-v*u}else if(t.order==="XZY"){let d=a*l,f=a*c,m=o*l,v=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+v,e[5]=a*h,e[9]=f*u-m,e[2]=m*u-f,e[6]=o*h,e[10]=v*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(jp,t,Qp)}lookAt(t,e,n){let i=this.elements;return Rn.subVectors(t,e),Rn.lengthSq()===0&&(Rn.z=1),Rn.normalize(),ki.crossVectors(n,Rn),ki.lengthSq()===0&&(Math.abs(n.z)===1?Rn.x+=1e-4:Rn.z+=1e-4,Rn.normalize(),ki.crossVectors(n,Rn)),ki.normalize(),uo.crossVectors(Rn,ki),i[0]=ki.x,i[4]=uo.x,i[8]=Rn.x,i[1]=ki.y,i[5]=uo.y,i[9]=Rn.y,i[2]=ki.z,i[6]=uo.z,i[10]=Rn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],m=n[2],v=n[6],p=n[10],g=n[14],x=n[3],T=n[7],M=n[11],b=n[15],E=i[0],P=i[4],y=i[8],A=i[12],I=i[1],N=i[5],F=i[9],H=i[13],D=i[2],z=i[6],J=i[10],Y=i[14],rt=i[3],Z=i[7],tt=i[11],it=i[15];return r[0]=a*E+o*I+l*D+c*rt,r[4]=a*P+o*N+l*z+c*Z,r[8]=a*y+o*F+l*J+c*tt,r[12]=a*A+o*H+l*Y+c*it,r[1]=h*E+u*I+d*D+f*rt,r[5]=h*P+u*N+d*z+f*Z,r[9]=h*y+u*F+d*J+f*tt,r[13]=h*A+u*H+d*Y+f*it,r[2]=m*E+v*I+p*D+g*rt,r[6]=m*P+v*N+p*z+g*Z,r[10]=m*y+v*F+p*J+g*tt,r[14]=m*A+v*H+p*Y+g*it,r[3]=x*E+T*I+M*D+b*rt,r[7]=x*P+T*N+M*z+b*Z,r[11]=x*y+T*F+M*J+b*tt,r[15]=x*A+T*H+M*Y+b*it,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],m=t[3],v=t[7],p=t[11],g=t[15],x=l*f-c*d,T=o*f-c*u,M=o*d-l*u,b=a*f-c*h,E=a*d-l*h,P=a*u-o*h;return e*(v*x-p*T+g*M)-n*(m*x-p*b+g*E)+i*(m*T-v*b+g*P)-r*(m*M-v*E+p*P)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],i=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],h=t[10];return e*(a*h-o*c)-n*(r*h-o*l)+i*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],m=t[12],v=t[13],p=t[14],g=t[15],x=e*o-n*a,T=e*l-i*a,M=e*c-r*a,b=n*l-i*o,E=n*c-r*o,P=i*c-r*l,y=h*v-u*m,A=h*p-d*m,I=h*g-f*m,N=u*p-d*v,F=u*g-f*v,H=d*g-f*p,D=x*H-T*F+M*N+b*I-E*A+P*y;if(D===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let z=1/D;return t[0]=(o*H-l*F+c*N)*z,t[1]=(i*F-n*H-r*N)*z,t[2]=(v*P-p*E+g*b)*z,t[3]=(d*E-u*P-f*b)*z,t[4]=(l*I-a*H-c*A)*z,t[5]=(e*H-i*I+r*A)*z,t[6]=(p*M-m*P-g*T)*z,t[7]=(h*P-d*M+f*T)*z,t[8]=(a*F-o*I+c*y)*z,t[9]=(n*I-e*F-r*y)*z,t[10]=(m*E-v*M+g*x)*z,t[11]=(u*M-h*E-f*x)*z,t[12]=(o*A-a*N-l*y)*z,t[13]=(e*N-n*A+i*y)*z,t[14]=(v*T-m*b-p*x)*z,t[15]=(h*b-u*T+d*x)*z,this}scale(t){let e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),i=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,a){return this.set(1,n,r,0,t,1,a,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){let i=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,d=r*c,f=r*h,m=r*u,v=a*h,p=a*u,g=o*u,x=l*c,T=l*h,M=l*u,b=n.x,E=n.y,P=n.z;return i[0]=(1-(v+g))*b,i[1]=(f+M)*b,i[2]=(m-T)*b,i[3]=0,i[4]=(f-M)*E,i[5]=(1-(d+g))*E,i[6]=(p+x)*E,i[7]=0,i[8]=(m+T)*P,i[9]=(p-x)*P,i[10]=(1-(d+v))*P,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){let i=this.elements;t.x=i[12],t.y=i[13],t.z=i[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=Hs.set(i[0],i[1],i[2]).length(),o=Hs.set(i[4],i[5],i[6]).length(),l=Hs.set(i[8],i[9],i[10]).length();r<0&&(a=-a),jn.copy(this);let c=1/a,h=1/o,u=1/l;return jn.elements[0]*=c,jn.elements[1]*=c,jn.elements[2]*=c,jn.elements[4]*=h,jn.elements[5]*=h,jn.elements[6]*=h,jn.elements[8]*=u,jn.elements[9]*=u,jn.elements[10]*=u,e.setFromRotationMatrix(jn),n.x=a,n.y=o,n.z=l,this}makePerspective(t,e,n,i,r,a,o=ni,l=!1){let c=this.elements,h=2*r/(e-t),u=2*r/(n-i),d=(e+t)/(e-t),f=(n+i)/(n-i),m,v;if(l)m=r/(a-r),v=a*r/(a-r);else if(o===ni)m=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===ir)m=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,i,r,a,o=ni,l=!1){let c=this.elements,h=2/(e-t),u=2/(n-i),d=-(e+t)/(e-t),f=-(n+i)/(n-i),m,v;if(l)m=1/(a-r),v=a/(a-r);else if(o===ni)m=-2/(a-r),v=-(a+r)/(a-r);else if(o===ir)m=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=m,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};gl.prototype.isMatrix4=!0;var me=gl,Hs=new w,jn=new me,jp=new w(0,0,0),Qp=new w(1,1,1),ki=new w,uo=new w,Rn=new w,Ju=new me,Ku=new pe,Ri=class s{constructor(t=0,e=0,n=0,i=s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let i=t.elements,r=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(e){case"XYZ":this._y=Math.asin(ee(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ee(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(ee(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ee(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(ee(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-ee(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Gt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Ju.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Ju,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Ku.setFromEuler(this),this.setFromQuaternion(Ku,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ri.DEFAULT_ORDER="XYZ";var ra=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},tm=0,$u=new w,Vs=new pe,Si=new me,fo=new w,Gr=new w,em=new w,nm=new pe,ju=new w(1,0,0),Qu=new w(0,1,0),td=new w(0,0,1),ed={type:"added"},im={type:"removed"},ks={type:"childadded",child:null},Gc={type:"childremoved",child:null},hn=class s extends di{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:tm++}),this.uuid=Ps(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let t=new w,e=new Ri,n=new pe,i=new w(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new me},normalMatrix:{value:new Zt}}),this.matrix=new me,this.matrixWorld=new me,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ra,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Vs.setFromAxisAngle(t,e),this.quaternion.multiply(Vs),this}rotateOnWorldAxis(t,e){return Vs.setFromAxisAngle(t,e),this.quaternion.premultiply(Vs),this}rotateX(t){return this.rotateOnAxis(ju,t)}rotateY(t){return this.rotateOnAxis(Qu,t)}rotateZ(t){return this.rotateOnAxis(td,t)}translateOnAxis(t,e){return $u.copy(t).applyQuaternion(this.quaternion),this.position.add($u.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(ju,t)}translateY(t){return this.translateOnAxis(Qu,t)}translateZ(t){return this.translateOnAxis(td,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Si.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?fo.copy(t):fo.set(t,e,n);let i=this.parent;this.updateWorldMatrix(!0,!1),Gr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Si.lookAt(Gr,fo,this.up):Si.lookAt(fo,Gr,this.up),this.quaternion.setFromRotationMatrix(Si),i&&(Si.extractRotation(i.matrixWorld),Vs.setFromRotationMatrix(Si),this.quaternion.premultiply(Vs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Wt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(ed),ks.child=t,this.dispatchEvent(ks),ks.child=null):Wt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(im),Gc.child=t,this.dispatchEvent(Gc),Gc.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Si.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Si.multiply(t.parent.matrixWorld)),t.applyMatrix4(Si),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(ed),ks.child=t,this.dispatchEvent(ks),ks.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gr,t,em),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gr,nm,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,i=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*i,r[13]+=n-r[1]*e-r[5]*n-r[9]*i,r[14]+=i-r[2]*e-r[6]*n-r[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,i.name=this.name,i.castShadow=this.castShadow,i.receiveShadow=this.receiveShadow,i.visible=this.visible,i.frustumCulled=this.frustumCulled,i.renderOrder=this.renderOrder,i.static=this.static,i.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null&&(i.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(i.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(o=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(t),i.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));i.material=o}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];i.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),d=a(t.skeletons),f=a(t.animations),m=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),m.length>0&&(n.nodes=m)}return n.object=i,n;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let i=t.children[n];this.add(i.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};hn.DEFAULT_UP=new w(0,1,0);hn.DEFAULT_MATRIX_AUTO_UPDATE=!0;hn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var qe=class extends hn{constructor(){super(),this.isGroup=!0,this.type="Group"}},sm={type:"move"},or=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new qe,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new qe,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new w,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new w),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new qe,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new w,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new w,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let v of t.hand.values()){let p=e.getJointPose(v,n),g=this._getHandJoint(c,v);p!==null&&(g.matrix.fromArray(p.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=p.radius),g.visible=p!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,m=.005;c.inputState.pinching&&d>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(sm)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new qe;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},rf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Gi={h:0,s:0,l:0},po={h:0,s:0,l:0};function Wc(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}var Ct=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=tn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ne.colorSpaceToWorking(this,e),this}setRGB(t,e,n,i=ne.workingColorSpace){return this.r=t,this.g=e,this.b=n,ne.colorSpaceToWorking(this,i),this}setHSL(t,e,n,i=ne.workingColorSpace){if(t=Fh(t,1),e=ee(e,0,1),n=ee(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Wc(a,r,t+1/3),this.g=Wc(a,r,t),this.b=Wc(a,r,t-1/3)}return ne.colorSpaceToWorking(this,i),this}setStyle(t,e=tn){function n(r){r!==void 0&&parseFloat(r)<1&&Gt("Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Gt("Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Gt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=tn){let n=rf[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Gt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ai(t.r),this.g=Ai(t.g),this.b=Ai(t.b),this}copyLinearToSRGB(t){return this.r=tr(t.r),this.g=tr(t.g),this.b=tr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=tn){return ne.workingToColorSpace(cn.copy(this),t),Math.round(ee(cn.r*255,0,255))*65536+Math.round(ee(cn.g*255,0,255))*256+Math.round(ee(cn.b*255,0,255))}getHexString(t=tn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ne.workingColorSpace){ne.workingToColorSpace(cn.copy(this),e);let n=cn.r,i=cn.g,r=cn.b,a=Math.max(n,i,r),o=Math.min(n,i,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=ne.workingColorSpace){return ne.workingToColorSpace(cn.copy(this),e),t.r=cn.r,t.g=cn.g,t.b=cn.b,t}getStyle(t=tn){ne.workingToColorSpace(cn.copy(this),t);let e=cn.r,n=cn.g,i=cn.b;return t!==tn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(Gi),this.setHSL(Gi.h+t,Gi.s+e,Gi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Gi),t.getHSL(po);let n=$r(Gi.h,po.h,e),i=$r(Gi.s,po.s,e),r=$r(Gi.l,po.l,e);return this.setHSL(n,i,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,i=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*i,this.g=r[1]*e+r[4]*n+r[7]*i,this.b=r[2]*e+r[5]*n+r[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},cn=new Ct;Ct.NAMES=rf;var aa=class s{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ct(t),this.density=e}clone(){return new s(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Ss=class extends hn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ri,this.environmentIntensity=1,this.environmentRotation=new Ri,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},Qn=new w,bi=new w,Xc=new w,Ei=new w,Gs=new w,Ws=new w,nd=new w,qc=new w,Yc=new w,Zc=new w,Jc=new Re,Kc=new Re,$c=new Re,Yi=class s{constructor(t=new w,e=new w,n=new w){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),Qn.subVectors(t,e),i.cross(Qn);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){Qn.subVectors(i,e),bi.subVectors(n,e),Xc.subVectors(t,e);let a=Qn.dot(Qn),o=Qn.dot(bi),l=Qn.dot(Xc),c=bi.dot(bi),h=bi.dot(Xc),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(c*l-o*h)*d,m=(a*h-o*l)*d;return r.set(1-f-m,m,f)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,Ei)===null?!1:Ei.x>=0&&Ei.y>=0&&Ei.x+Ei.y<=1}static getInterpolation(t,e,n,i,r,a,o,l){return this.getBarycoord(t,e,n,i,Ei)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ei.x),l.addScaledVector(a,Ei.y),l.addScaledVector(o,Ei.z),l)}static getInterpolatedAttribute(t,e,n,i,r,a){return Jc.setScalar(0),Kc.setScalar(0),$c.setScalar(0),Jc.fromBufferAttribute(t,e),Kc.fromBufferAttribute(t,n),$c.fromBufferAttribute(t,i),a.setScalar(0),a.addScaledVector(Jc,r.x),a.addScaledVector(Kc,r.y),a.addScaledVector($c,r.z),a}static isFrontFacing(t,e,n,i){return Qn.subVectors(n,e),bi.subVectors(t,e),Qn.cross(bi).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Qn.subVectors(this.c,this.b),bi.subVectors(this.a,this.b),Qn.cross(bi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return s.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return s.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,r){return s.getInterpolation(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return s.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return s.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,i=this.b,r=this.c,a,o;Gs.subVectors(i,n),Ws.subVectors(r,n),qc.subVectors(t,n);let l=Gs.dot(qc),c=Ws.dot(qc);if(l<=0&&c<=0)return e.copy(n);Yc.subVectors(t,i);let h=Gs.dot(Yc),u=Ws.dot(Yc);if(h>=0&&u<=h)return e.copy(i);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(Gs,a);Zc.subVectors(t,r);let f=Gs.dot(Zc),m=Ws.dot(Zc);if(m>=0&&f<=m)return e.copy(r);let v=f*c-l*m;if(v<=0&&c>=0&&m<=0)return o=c/(c-m),e.copy(n).addScaledVector(Ws,o);let p=h*m-f*u;if(p<=0&&u-h>=0&&f-m>=0)return nd.subVectors(r,i),o=(u-h)/(u-h+(f-m)),e.copy(i).addScaledVector(nd,o);let g=1/(p+v+d);return a=v*g,o=d*g,e.copy(n).addScaledVector(Gs,a).addScaledVector(Ws,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},fi=class{constructor(t=new w(1/0,1/0,1/0),e=new w(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(ti.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(ti.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=ti.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,ti):ti.fromBufferAttribute(r,a),ti.applyMatrix4(t.matrixWorld),this.expandByPoint(ti);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),mo.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),mo.copy(n.boundingBox)),mo.applyMatrix4(t.matrixWorld),this.union(mo)}let i=t.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,ti),ti.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Wr),go.subVectors(this.max,Wr),Xs.subVectors(t.a,Wr),qs.subVectors(t.b,Wr),Ys.subVectors(t.c,Wr),Wi.subVectors(qs,Xs),Xi.subVectors(Ys,qs),xs.subVectors(Xs,Ys);let e=[0,-Wi.z,Wi.y,0,-Xi.z,Xi.y,0,-xs.z,xs.y,Wi.z,0,-Wi.x,Xi.z,0,-Xi.x,xs.z,0,-xs.x,-Wi.y,Wi.x,0,-Xi.y,Xi.x,0,-xs.y,xs.x,0];return!jc(e,Xs,qs,Ys,go)||(e=[1,0,0,0,1,0,0,0,1],!jc(e,Xs,qs,Ys,go))?!1:(xo.crossVectors(Wi,Xi),e=[xo.x,xo.y,xo.z],jc(e,Xs,qs,Ys,go))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,ti).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(ti).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Ti[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Ti[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Ti[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Ti[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Ti[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Ti[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Ti[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Ti[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Ti),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Ti=[new w,new w,new w,new w,new w,new w,new w,new w],ti=new w,mo=new fi,Xs=new w,qs=new w,Ys=new w,Wi=new w,Xi=new w,xs=new w,Wr=new w,go=new w,xo=new w,_s=new w;function jc(s,t,e,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){_s.fromArray(s,r);let o=i.x*Math.abs(_s.x)+i.y*Math.abs(_s.y)+i.z*Math.abs(_s.z),l=t.dot(_s),c=e.dot(_s),h=n.dot(_s);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Ve=new w,_o=new lt,rm=0,en=class extends di{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:rm++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Qd,this.updateRanges=[],this.gpuType=Wn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)_o.fromBufferAttribute(this,e),_o.applyMatrix3(t),this.setXY(e,_o.x,_o.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ve.fromBufferAttribute(this,e),Ve.applyMatrix3(t),this.setXYZ(e,Ve.x,Ve.y,Ve.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ve.fromBufferAttribute(this,e),Ve.applyMatrix4(t),this.setXYZ(e,Ve.x,Ve.y,Ve.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ve.fromBufferAttribute(this,e),Ve.applyNormalMatrix(t),this.setXYZ(e,Ve.x,Ve.y,Ve.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ve.fromBufferAttribute(this,e),Ve.transformDirection(t),this.setXYZ(e,Ve.x,Ve.y,Ve.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Qs(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=mn(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Qs(e,this.array)),e}setX(t,e){return this.normalized&&(e=mn(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Qs(e,this.array)),e}setY(t,e){return this.normalized&&(e=mn(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Qs(e,this.array)),e}setZ(t,e){return this.normalized&&(e=mn(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Qs(e,this.array)),e}setW(t,e){return this.normalized&&(e=mn(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=mn(e,this.array),n=mn(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=mn(e,this.array),n=mn(n,this.array),i=mn(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=mn(e,this.array),n=mn(n,this.array),i=mn(i,this.array),r=mn(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var oa=class extends en{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var la=class extends en{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var re=class extends en{constructor(t,e,n){super(new Float32Array(t),e,n)}},am=new fi,Xr=new w,Qc=new w,Zi=class{constructor(t=new w,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):am.setFromPoints(t).getCenter(n);let i=0;for(let r=0,a=t.length;r<a;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Xr.subVectors(t,this.center);let e=Xr.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(Xr,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Qc.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Xr.copy(t.center).add(Qc)),this.expandByPoint(Xr.copy(t.center).sub(Qc))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},om=0,kn=new me,th=new hn,Zs=new w,Cn=new fi,qr=new fi,$e=new w,Ne=class s extends di{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:om++}),this.uuid=Ps(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Ip(t)?la:oa)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Zt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return kn.makeRotationFromQuaternion(t),this.applyMatrix4(kn),this}rotateX(t){return kn.makeRotationX(t),this.applyMatrix4(kn),this}rotateY(t){return kn.makeRotationY(t),this.applyMatrix4(kn),this}rotateZ(t){return kn.makeRotationZ(t),this.applyMatrix4(kn),this}translate(t,e,n){return kn.makeTranslation(t,e,n),this.applyMatrix4(kn),this}scale(t,e,n){return kn.makeScale(t,e,n),this.applyMatrix4(kn),this}lookAt(t){return th.lookAt(t),th.updateMatrix(),this.applyMatrix4(th.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Zs).negate(),this.translate(Zs.x,Zs.y,Zs.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let i=0,r=t.length;i<r;i++){let a=t[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new re(n,3))}else{let n=Math.min(t.length,e.count);for(let i=0;i<n;i++){let r=t[i];e.setXYZ(i,r.x,r.y,r.z||0)}t.length>e.count&&Gt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new fi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Wt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new w(-1/0,-1/0,-1/0),new w(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){let r=e[n];Cn.setFromBufferAttribute(r),this.morphTargetsRelative?($e.addVectors(this.boundingBox.min,Cn.min),this.boundingBox.expandByPoint($e),$e.addVectors(this.boundingBox.max,Cn.max),this.boundingBox.expandByPoint($e)):(this.boundingBox.expandByPoint(Cn.min),this.boundingBox.expandByPoint(Cn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Wt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Zi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Wt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new w,1/0);return}if(t){let n=this.boundingSphere.center;if(Cn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];qr.setFromBufferAttribute(o),this.morphTargetsRelative?($e.addVectors(Cn.min,qr.min),Cn.expandByPoint($e),$e.addVectors(Cn.max,qr.max),Cn.expandByPoint($e)):(Cn.expandByPoint(qr.min),Cn.expandByPoint(qr.max))}Cn.getCenter(n);let i=0;for(let r=0,a=t.count;r<a;r++)$e.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared($e));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)$e.fromBufferAttribute(o,c),l&&(Zs.fromBufferAttribute(t,c),$e.add(Zs)),i=Math.max(i,n.distanceToSquared($e))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&Wt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Wt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,i=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new en(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let y=0;y<n.count;y++)o[y]=new w,l[y]=new w;let c=new w,h=new w,u=new w,d=new lt,f=new lt,m=new lt,v=new w,p=new w;function g(y,A,I){c.fromBufferAttribute(n,y),h.fromBufferAttribute(n,A),u.fromBufferAttribute(n,I),d.fromBufferAttribute(r,y),f.fromBufferAttribute(r,A),m.fromBufferAttribute(r,I),h.sub(c),u.sub(c),f.sub(d),m.sub(d);let N=1/(f.x*m.y-m.x*f.y);isFinite(N)&&(v.copy(h).multiplyScalar(m.y).addScaledVector(u,-f.y).multiplyScalar(N),p.copy(u).multiplyScalar(f.x).addScaledVector(h,-m.x).multiplyScalar(N),o[y].add(v),o[A].add(v),o[I].add(v),l[y].add(p),l[A].add(p),l[I].add(p))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let y=0,A=x.length;y<A;++y){let I=x[y],N=I.start,F=I.count;for(let H=N,D=N+F;H<D;H+=3)g(t.getX(H+0),t.getX(H+1),t.getX(H+2))}let T=new w,M=new w,b=new w,E=new w;function P(y){b.fromBufferAttribute(i,y),E.copy(b);let A=o[y];T.copy(A),T.sub(b.multiplyScalar(b.dot(A))).normalize(),M.crossVectors(E,A);let N=M.dot(l[y])<0?-1:1;a.setXYZW(y,T.x,T.y,T.z,N)}for(let y=0,A=x.length;y<A;++y){let I=x[y],N=I.start,F=I.count;for(let H=N,D=N+F;H<D;H+=3)P(t.getX(H+0)),P(t.getX(H+1)),P(t.getX(H+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new en(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let i=new w,r=new w,a=new w,o=new w,l=new w,c=new w,h=new w,u=new w;if(t)for(let d=0,f=t.count;d<f;d+=3){let m=t.getX(d+0),v=t.getX(d+1),p=t.getX(d+2);i.fromBufferAttribute(e,m),r.fromBufferAttribute(e,v),a.fromBufferAttribute(e,p),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),o.fromBufferAttribute(n,m),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,p),o.add(h),l.add(h),c.add(h),n.setXYZ(m,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)i.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),a.fromBufferAttribute(e,d+2),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)$e.fromBufferAttribute(t,e),$e.normalize(),t.setXYZ(e,$e.x,$e.y,$e.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h),f=0,m=0;for(let v=0,p=l.length;v<p;v++){o.isInterleavedBufferAttribute?f=l[v]*o.data.stride+o.offset:f=l[v]*h;for(let g=0;g<h;g++)d[m++]=c[f++]}return new en(d,h,u)}if(this.index===null)return Gt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new s,n=this.index.array,i=this.attributes;for(let o in i){let l=i[o],c=t(l,n);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=t(d,n);l.push(f)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let i={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(i[l]=h,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let i=t.attributes;for(let c in i){let h=i[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,h=a.length;c<h;c++){let u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var eh=new w,lm=new w,cm=new Zt,ei=class{constructor(t=new w(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let i=eh.subVectors(n,e).cross(lm.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let i=t.delta(eh),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(i,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||cm.getNormalMatrix(t),i=this.coplanarPoint(eh).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},hm=0,Ji=class extends di{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:hm++}),this.uuid=Ps(),this.name="",this.type="Material",this.blending=ns,this.side=es,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Eh,this.blendDst=Th,this.blendEquation=As,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ct(0,0,0),this.blendAlpha=0,this.depthFunc=er,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=qd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Uo,this.stencilZFail=Uo,this.stencilZPass=Uo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Gt(`Material: parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){Gt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector2&&n&&n.isVector2||i&&i.isEuler&&n&&n.isEuler||i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=i(t.textures),a=i(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Ct().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new ei().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new lt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new lt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let i=e.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var wi=new w,nh=new w,vo=new w,yo=new w,Zo=class{constructor(t=new w,e=new w(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,wi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=wi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(wi.copy(this.origin).addScaledVector(this.direction,e),wi.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){nh.copy(t).add(e).multiplyScalar(.5),vo.copy(e).sub(t).normalize(),yo.copy(this.origin).sub(nh);let r=t.distanceTo(e)*.5,a=-this.direction.dot(vo),o=yo.dot(this.direction),l=-yo.dot(vo),c=yo.lengthSq(),h=Math.abs(1-a*a),u,d,f,m;if(h>0)if(u=a*l-o,d=a*o-l,m=r*h,u>=0)if(d>=-m)if(d<=m){let v=1/h;u*=v,d*=v,f=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d<=-m?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=m?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(nh).addScaledVector(vo,d),f}intersectSphere(t,e){if(t.radius<0)return null;wi.subVectors(t.center,this.origin);let n=wi.dot(this.direction),i=wi.dot(wi)-n*n,r=t.radius*t.radius;if(i>r)return null;let a=Math.sqrt(r-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,i=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,i=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,a=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,a=(t.min.y-d.y)*h),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),u>=0?(o=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(o=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,wi)!==null}intersectTriangle(t,e,n,i,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,u=t.x-a.x,d=t.y-a.y,f=t.z-a.z,m=e.x-a.x,v=e.y-a.y,p=e.z-a.z,g=n.x-a.x,x=n.y-a.y,T=n.z-a.z,M=Math.abs(l),b=Math.abs(c),E=Math.abs(h),P,y,A,I,N,F,H,D,z,J,Y,rt;if(M>=b&&M>=E?(A=l,F=u,z=m,rt=g,l>=0?(P=c,y=h,I=d,N=f,H=v,D=p,J=x,Y=T):(P=h,y=c,I=f,N=d,H=p,D=v,J=T,Y=x)):b>=E?(A=c,F=d,z=v,rt=x,c>=0?(P=h,y=l,I=f,N=u,H=p,D=m,J=T,Y=g):(P=l,y=h,I=u,N=f,H=m,D=p,J=g,Y=T)):(A=h,F=f,z=p,rt=T,h>=0?(P=l,y=c,I=u,N=d,H=m,D=v,J=g,Y=x):(P=c,y=l,I=d,N=u,H=v,D=m,J=x,Y=g)),A===0)return null;let Z=P/A,tt=y/A,it=1/A,Et=I-Z*F,St=N-tt*F,jt=H-Z*z,Jt=D-tt*z,$t=J-Z*rt,X=Y-tt*rt,Q=$t*Jt-X*jt,mt=Et*X-St*$t,Bt=jt*St-Jt*Et;if(i){if(Q<0||mt<0||Bt<0)return null}else if((Q<0||mt<0||Bt<0)&&(Q>0||mt>0||Bt>0))return null;let _t=Q+mt+Bt;if(_t===0)return null;let Ht=it*(Q*F+mt*z+Bt*rt);return(_t>0?Ht<0:Ht>0)?null:this.at(Ht/_t,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ce=class extends Ji{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ct(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ri,this.combine=wh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},id=new me,vs=new Zo,Mo=new Zi,sd=new w,So=new w,bo=new w,Eo=new w,ih=new w,To=new w,rd=new w,wo=new w,bt=class extends hn{constructor(t=new Ne,e=new Ce){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){let o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(i,t);let o=this.morphTargetInfluences;if(r&&o){To.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],u=r[l];h!==0&&(ih.fromBufferAttribute(u,t),a?To.addScaledVector(ih,h):To.addScaledVector(ih.sub(e),h))}e.add(To)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Mo.copy(n.boundingSphere),Mo.applyMatrix4(r),vs.copy(t.ray).recast(t.near),!(Mo.containsPoint(vs.origin)===!1&&(vs.intersectSphere(Mo,sd)===null||vs.origin.distanceToSquared(sd)>(t.far-t.near)**2))&&(id.copy(r).invert(),vs.copy(t.ray).applyMatrix4(id),!(n.boundingBox!==null&&vs.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,vs)))}_computeIntersections(t,e,n){let i,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,v=d.length;m<v;m++){let p=d[m],g=a[p.materialIndex],x=Math.max(p.start,f.start),T=Math.min(o.count,Math.min(p.start+p.count,f.start+f.count));for(let M=x,b=T;M<b;M+=3){let E=o.getX(M),P=o.getX(M+1),y=o.getX(M+2);i=Ao(this,g,t,n,c,h,u,E,P,y),i&&(i.faceIndex=Math.floor(M/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{let m=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let p=m,g=v;p<g;p+=3){let x=o.getX(p),T=o.getX(p+1),M=o.getX(p+2);i=Ao(this,a,t,n,c,h,u,x,T,M),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,v=d.length;m<v;m++){let p=d[m],g=a[p.materialIndex],x=Math.max(p.start,f.start),T=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let M=x,b=T;M<b;M+=3){let E=M,P=M+1,y=M+2;i=Ao(this,g,t,n,c,h,u,E,P,y),i&&(i.faceIndex=Math.floor(M/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{let m=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let p=m,g=v;p<g;p+=3){let x=p,T=p+1,M=p+2;i=Ao(this,a,t,n,c,h,u,x,T,M),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}}};function um(s,t,e,n,i,r,a,o){let l;if(t.side===sn?l=n.intersectTriangle(a,r,i,!0,o):l=n.intersectTriangle(i,r,a,t.side===es,o),l===null)return null;wo.copy(o),wo.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(wo);return c<e.near||c>e.far?null:{distance:c,point:wo.clone(),object:s}}function Ao(s,t,e,n,i,r,a,o,l,c){s.getVertexPosition(o,So),s.getVertexPosition(l,bo),s.getVertexPosition(c,Eo);let h=um(s,t,e,n,So,bo,Eo,rd);if(h){let u=new w;Yi.getBarycoord(rd,So,bo,Eo,u),i&&(h.uv=Yi.getInterpolatedAttribute(i,o,l,c,u,new lt)),r&&(h.uv1=Yi.getInterpolatedAttribute(r,o,l,c,u,new lt)),a&&(h.normal=Yi.getInterpolatedAttribute(a,o,l,c,u,new w),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new w,materialIndex:0};Yi.getNormal(So,bo,Eo,d.normal),h.face=d,h.barycoord=u}return h}var ca=class extends gn{constructor(t=null,e=1,n=1,i,r,a,o,l,c=ke,h=ke,u,d){super(null,a,o,l,c,h,i,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ci=class extends en{constructor(t,e,n,i=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Js=new me,ad=new me,Ro=[],od=new fi,dm=new me,Yr=new bt,Zr=new Zi,lr=class extends bt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Ci(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,dm)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new fi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Js),od.copy(t.boundingBox).applyMatrix4(Js),this.boundingBox.union(od)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Zi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Js),Zr.copy(t.boundingSphere).applyMatrix4(Js),this.boundingSphere.union(Zr)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(t,e){let n=this.matrixWorld,i=this.count;if(Yr.geometry=this.geometry,Yr.material=this.material,Yr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Zr.copy(this.boundingSphere),Zr.applyMatrix4(n),t.ray.intersectsSphere(Zr)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Js),ad.multiplyMatrices(n,Js),Yr.matrixWorld=ad,Yr.raycast(t,Ro);for(let a=0,o=Ro.length;a<o;a++){let l=Ro[a];l.instanceId=r,l.object=this,e.push(l)}Ro.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Ci(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new ca(new Float32Array(i*this.count),i,this.count,bl,Wn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=i*t;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},ys=new Zi,fm=new lt(.5,.5),Co=new w,cr=class{constructor(t=new ei,e=new ei,n=new ei,i=new ei,r=new ei,a=new ei){this.planes=[t,e,n,i,r,a]}set(t,e,n,i,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=ni,n=!1){let i=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],m=r[8],v=r[9],p=r[10],g=r[11],x=r[12],T=r[13],M=r[14],b=r[15];if(i[0].setComponents(c-a,f-h,g-m,b-x).normalize(),i[1].setComponents(c+a,f+h,g+m,b+x).normalize(),i[2].setComponents(c+o,f+u,g+v,b+T).normalize(),i[3].setComponents(c-o,f-u,g-v,b-T).normalize(),n)i[4].setComponents(l,d,p,M).normalize(),i[5].setComponents(c-l,f-d,g-p,b-M).normalize();else if(i[4].setComponents(c-l,f-d,g-p,b-M).normalize(),e===ni)i[5].setComponents(c+l,f+d,g+p,b+M).normalize();else if(e===ir)i[5].setComponents(l,d,p,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ys.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ys.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ys)}intersectsSprite(t){ys.center.set(0,0,0);let e=fm.distanceTo(t.center);return ys.radius=.7071067811865476+e,ys.applyMatrix4(t.matrixWorld),this.intersectsSphere(ys)}intersectsSphere(t){let e=this.planes,n=t.center,i=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let i=e[n];if(Co.x=i.normal.x>0?t.max.x:t.min.x,Co.y=i.normal.y>0?t.max.y:t.min.y,Co.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(Co)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ha=class extends gn{constructor(t=[],e=is,n,i,r,a,o,l,c,h){super(t,e,n,i,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},bs=class extends gn{constructor(t,e,n,i,r,a,o,l,c){super(t,e,n,i,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Ki=class extends gn{constructor(t,e,n=si,i,r,a,o=ke,l=ke,c,h=ui,u=1){if(h!==ui&&h!==rs)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:u};super(d,i,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new ar(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Jo=class extends Ki{constructor(t,e=si,n=is,i,r,a=ke,o=ke,l,c=ui){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,n,i,r,a,o,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},ua=class extends gn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Pe=class s extends Ne{constructor(t=1,e=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};let o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],u=[],d=0,f=0;m("z","y","x",-1,-1,n,e,t,a,r,0),m("z","y","x",1,-1,n,e,-t,a,r,1),m("x","z","y",1,1,t,n,e,i,a,2),m("x","z","y",1,-1,t,n,-e,i,a,3),m("x","y","z",1,-1,t,e,n,i,r,4),m("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new re(c,3)),this.setAttribute("normal",new re(h,3)),this.setAttribute("uv",new re(u,2));function m(v,p,g,x,T,M,b,E,P,y,A){let I=M/P,N=b/y,F=M/2,H=b/2,D=E/2,z=P+1,J=y+1,Y=0,rt=0,Z=new w;for(let tt=0;tt<J;tt++){let it=tt*N-H;for(let Et=0;Et<z;Et++){let St=Et*I-F;Z[v]=St*x,Z[p]=it*T,Z[g]=D,c.push(Z.x,Z.y,Z.z),Z[v]=0,Z[p]=0,Z[g]=E>0?1:-1,h.push(Z.x,Z.y,Z.z),u.push(Et/P),u.push(1-tt/y),Y+=1}}for(let tt=0;tt<y;tt++)for(let it=0;it<P;it++){let Et=d+it+z*tt,St=d+it+z*(tt+1),jt=d+(it+1)+z*(tt+1),Jt=d+(it+1)+z*tt;l.push(Et,St,Jt),l.push(St,jt,Jt),rt+=6}o.addGroup(f,rt,A),f+=rt,d+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Pi=class s extends Ne{constructor(t=1,e=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:i},e=Math.max(3,e);let r=[],a=[],o=[],l=[],c=new w,h=new lt;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=e;u++,d+=3){let f=n+u/e*i;c.x=t*Math.cos(f),c.y=t*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[d]/t+1)/2,h.y=(a[d+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new re(a,3)),this.setAttribute("normal",new re(o,3)),this.setAttribute("uv",new re(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.segments,t.thetaStart,t.thetaLength)}},xn=class s extends Ne{constructor(t=1,e=1,n=1,i=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;i=Math.floor(i),r=Math.floor(r);let h=[],u=[],d=[],f=[],m=0,v=[],p=n/2,g=0;x(),a===!1&&(t>0&&T(!0),e>0&&T(!1)),this.setIndex(h),this.setAttribute("position",new re(u,3)),this.setAttribute("normal",new re(d,3)),this.setAttribute("uv",new re(f,2));function x(){let M=new w,b=new w,E=0,P=(e-t)/n;for(let y=0;y<=r;y++){let A=[],I=y/r,N=I*(e-t)+t;for(let F=0;F<=i;F++){let H=F/i,D=H*l+o,z=Math.sin(D),J=Math.cos(D);b.x=N*z,b.y=-I*n+p,b.z=N*J,u.push(b.x,b.y,b.z),M.set(z,P,J).normalize(),d.push(M.x,M.y,M.z),f.push(H,1-I),A.push(m++)}v.push(A)}for(let y=0;y<i;y++)for(let A=0;A<r;A++){let I=v[A][y],N=v[A+1][y],F=v[A+1][y+1],H=v[A][y+1];(t>0||A!==0)&&(h.push(I,N,H),E+=3),(e>0||A!==r-1)&&(h.push(N,F,H),E+=3)}c.addGroup(g,E,0),g+=E}function T(M){let b=m,E=new lt,P=new w,y=0,A=M===!0?t:e,I=M===!0?1:-1;for(let F=1;F<=i;F++)u.push(0,p*I,0),d.push(0,I,0),f.push(.5,.5),m++;let N=m;for(let F=0;F<=i;F++){let D=F/i*l+o,z=Math.cos(D),J=Math.sin(D);P.x=A*J,P.y=p*I,P.z=A*z,u.push(P.x,P.y,P.z),d.push(0,I,0),E.x=z*.5+.5,E.y=J*.5*I+.5,f.push(E.x,E.y),m++}for(let F=0;F<i;F++){let H=b+F,D=N+F;M===!0?h.push(D,D+1,H):h.push(D+1,D,H),y+=3}c.addGroup(g,y,M===!0?1:2),g+=y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},hr=class s extends xn{constructor(t=1,e=1,n=32,i=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,i,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new s(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var Pn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Gt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,i=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(i),e.push(r),i=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),i=0,r=n.length,a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(i=Math.floor(o+(l-o)/2),c=n[i]-a,c<0)o=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===a)return i/(r-1);let h=n[i],d=n[i+1]-h,f=(a-h)/d;return(i+f)/(r-1)}getTangent(t,e){let i=t-1e-4,r=t+1e-4;i<0&&(i=0),r>1&&(r=1);let a=this.getPoint(i),o=this.getPoint(r),l=e||(a.isVector2?new lt:new w);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new w,i=[],r=[],a=[],o=new w,l=new me;for(let f=0;f<=t;f++){let m=f/t;i[f]=this.getTangentAt(m,new w)}r[0]=new w,a[0]=new w;let c=Number.MAX_VALUE,h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],o),a[0].crossVectors(i[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(i[f-1],i[f]),o.length()>Number.EPSILON){o.normalize();let m=Math.acos(ee(i[f-1].dot(i[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,m))}a[f].crossVectors(i[f],r[f])}if(e===!0){let f=Math.acos(ee(r[0].dot(r[t]),-1,1));f/=t,i[0].dot(o.crossVectors(r[0],r[t]))>0&&(f=-f);for(let m=1;m<=t;m++)r[m].applyMatrix4(l.makeRotationAxis(i[m],f*m)),a[m].crossVectors(i[m],r[m])}return{tangents:i,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},ur=class extends Pn{constructor(t=0,e=0,n=1,i=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new lt){let n=e,i=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(a?r=0:r=i),this.aClockwise===!0&&!a&&(r===i?r=-i:r=r-i);let o=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Ko=class extends ur{constructor(t,e,n,i,r,a){super(t,e,n,n,i,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Oh(){let s=0,t=0,e=0,n=0;function i(r,a,o,l){s=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){i(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let d=(a-r)/c-(o-r)/(c+h)+(o-a)/h,f=(o-a)/h-(l-a)/(h+u)+(l-o)/u;d*=h,f*=h,i(a,o,d,f)},calc:function(r){let a=r*r,o=a*r;return s+t*r+e*a+n*o}}}var ld=new w,cd=new w,sh=new Oh,rh=new Oh,ah=new Oh,$o=class extends Pn{constructor(t=[],e=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=i}getPoint(t,e=new w){let n=e,i=this.points,r=i.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=i[(o-1)%r]:(cd.subVectors(i[0],i[1]).add(i[0]),c=cd);let u=i[o%r],d=i[(o+1)%r];if(this.closed||o+2<r?h=i[(o+2)%r]:(ld.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=ld),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(u),f),v=Math.pow(u.distanceToSquared(d),f),p=Math.pow(d.distanceToSquared(h),f);v<1e-4&&(v=1),m<1e-4&&(m=v),p<1e-4&&(p=v),sh.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,m,v,p),rh.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,m,v,p),ah.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,m,v,p)}else this.curveType==="catmullrom"&&(sh.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),rh.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),ah.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(sh.calc(l),rh.calc(l),ah.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(i.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let i=this.points[e];t.points.push(i.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(new w().fromArray(i))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function hd(s,t,e,n,i){let r=(n-t)*.5,a=(i-e)*.5,o=s*s,l=s*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*s+e}function pm(s,t){let e=1-s;return e*e*t}function mm(s,t){return 2*(1-s)*s*t}function gm(s,t){return s*s*t}function jr(s,t,e,n){return pm(s,t)+mm(s,e)+gm(s,n)}function xm(s,t){let e=1-s;return e*e*e*t}function _m(s,t){let e=1-s;return 3*e*e*s*t}function vm(s,t){return 3*(1-s)*s*s*t}function ym(s,t){return s*s*s*t}function Qr(s,t,e,n,i){return xm(s,t)+_m(s,e)+vm(s,n)+ym(s,i)}var da=class extends Pn{constructor(t=new lt,e=new lt,n=new lt,i=new lt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new lt){let n=e,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Qr(t,i.x,r.x,a.x,o.x),Qr(t,i.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},jo=class extends Pn{constructor(t=new w,e=new w,n=new w,i=new w){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new w){let n=e,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Qr(t,i.x,r.x,a.x,o.x),Qr(t,i.y,r.y,a.y,o.y),Qr(t,i.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},fa=class extends Pn{constructor(t=new lt,e=new lt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new lt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new lt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Qo=class extends Pn{constructor(t=new w,e=new w){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new w){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new w){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},pa=class extends Pn{constructor(t=new lt,e=new lt,n=new lt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new lt){let n=e,i=this.v0,r=this.v1,a=this.v2;return n.set(jr(t,i.x,r.x,a.x),jr(t,i.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},tl=class extends Pn{constructor(t=new w,e=new w,n=new w){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new w){let n=e,i=this.v0,r=this.v1,a=this.v2;return n.set(jr(t,i.x,r.x,a.x),jr(t,i.y,r.y,a.y),jr(t,i.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ma=class extends Pn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new lt){let n=e,i=this.points,r=(i.length-1)*t,a=Math.floor(r),o=r-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(hd(o,l.x,c.x,h.x,u.x),hd(o,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(i.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let i=this.points[e];t.points.push(i.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(new lt().fromArray(i))}return this}},fh=Object.freeze({__proto__:null,ArcCurve:Ko,CatmullRomCurve3:$o,CubicBezierCurve:da,CubicBezierCurve3:jo,EllipseCurve:ur,LineCurve:fa,LineCurve3:Qo,QuadraticBezierCurve:pa,QuadraticBezierCurve3:tl,SplineCurve:ma}),el=class extends Pn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new fh[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),i=this.getCurveLengths(),r=0;for(;r<i.length;){if(i[r]>=n){let a=i[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,i=this.curves.length;n<i;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let i=0,r=this.curves;i<r.length;i++){let a=r[i],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let i=t.curves[e];this.curves.push(i.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let i=this.curves[e];t.curves.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let i=t.curves[e];this.curves.push(new fh[i.type]().fromJSON(i))}return this}},ga=class extends el{constructor(t){super(),this.type="Path",this.currentPoint=new lt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new fa(this.currentPoint.clone(),new lt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,i){let r=new pa(this.currentPoint.clone(),new lt(t,e),new lt(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(t,e,n,i,r,a){let o=new da(this.currentPoint.clone(),new lt(t,e),new lt(n,i),new lt(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new ma(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,i,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,n,i,r,a),this}absarc(t,e,n,i,r,a){return this.absellipse(t,e,n,n,i,r,a),this}ellipse(t,e,n,i,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,i,r,a,o,l),this}absellipse(t,e,n,i,r,a,o,l){let c=new ur(t,e,n,i,r,a,o,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Ii=class extends ga{constructor(t){super(t),this.uuid=Ps(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,i=this.holes.length;n<i;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let i=t.holes[e];this.holes.push(i.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let i=this.holes[e];t.holes.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let i=t.holes[e];this.holes.push(new ga().fromJSON(i))}return this}};function Mm(s,t,e=2){let n=t&&t.length,i=n?t[0]*e:s.length,r=af(s,0,i,e,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=wm(s,t,r,e)),s.length>80*e){o=s[0],l=s[1];let h=o,u=l;for(let d=e;d<i;d+=e){let f=s[d],m=s[d+1];f<o&&(o=f),m<l&&(l=m),f>h&&(h=f),m>u&&(u=m)}c=Math.max(h-o,u-l),c=c!==0?32767/c:0}return xa(r,a,e,o,l,c,0),a}function af(s,t,e,n,i){let r;if(i===Om(s,t,e,n)>0)for(let a=t;a<e;a+=n)r=ud(a/n|0,s[a],s[a+1],r);else for(let a=e-n;a>=t;a-=n)r=ud(a/n|0,s[a],s[a+1],r);return r&&dr(r,r.next)&&(va(r),r=r.next),r}function Es(s,t){if(!s)return s;t||(t=s);let e=s,n;do if(n=!1,!e.steiner&&(dr(e,e.next)||De(e.prev,e,e.next)===0)){if(va(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function xa(s,t,e,n,i,r,a){if(!s)return;!a&&r&&Im(s,n,i,r);let o=s;for(;s.prev!==s.next;){let l=s.prev,c=s.next;if(r?bm(s,n,i,r):Sm(s)){t.push(l.i,s.i,c.i),va(s),s=c.next,o=c.next;continue}if(s=c,s===o){a?a===1?(s=Em(Es(s),t),xa(s,t,e,n,i,r,2)):a===2&&Tm(s,t,e,n,i,r):xa(Es(s),t,e,n,i,r,1);break}}}function Sm(s){let t=s.prev,e=s,n=s.next;if(De(t,e,n)>=0)return!1;let i=t.x,r=e.x,a=n.x,o=t.y,l=e.y,c=n.y,h=Math.min(i,r,a),u=Math.min(o,l,c),d=Math.max(i,r,a),f=Math.max(o,l,c),m=n.next;for(;m!==t;){if(m.x>=h&&m.x<=d&&m.y>=u&&m.y<=f&&Jr(i,o,r,l,a,c,m.x,m.y)&&De(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function bm(s,t,e,n){let i=s.prev,r=s,a=s.next;if(De(i,r,a)>=0)return!1;let o=i.x,l=r.x,c=a.x,h=i.y,u=r.y,d=a.y,f=Math.min(o,l,c),m=Math.min(h,u,d),v=Math.max(o,l,c),p=Math.max(h,u,d),g=ph(f,m,t,e,n),x=ph(v,p,t,e,n),T=s.prevZ,M=s.nextZ;for(;T&&T.z>=g&&M&&M.z<=x;){if(T.x>=f&&T.x<=v&&T.y>=m&&T.y<=p&&T!==i&&T!==a&&Jr(o,h,l,u,c,d,T.x,T.y)&&De(T.prev,T,T.next)>=0||(T=T.prevZ,M.x>=f&&M.x<=v&&M.y>=m&&M.y<=p&&M!==i&&M!==a&&Jr(o,h,l,u,c,d,M.x,M.y)&&De(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;T&&T.z>=g;){if(T.x>=f&&T.x<=v&&T.y>=m&&T.y<=p&&T!==i&&T!==a&&Jr(o,h,l,u,c,d,T.x,T.y)&&De(T.prev,T,T.next)>=0)return!1;T=T.prevZ}for(;M&&M.z<=x;){if(M.x>=f&&M.x<=v&&M.y>=m&&M.y<=p&&M!==i&&M!==a&&Jr(o,h,l,u,c,d,M.x,M.y)&&De(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function Em(s,t){let e=s;do{let n=e.prev,i=e.next.next;!dr(n,i)&&lf(n,e,e.next,i)&&_a(n,i)&&_a(i,n)&&(t.push(n.i,e.i,i.i),va(e),va(e.next),e=s=i),e=e.next}while(e!==s);return Es(e)}function Tm(s,t,e,n,i,r){let a=s;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Nm(a,o)){let l=cf(a,o);a=Es(a,a.next),l=Es(l,l.next),xa(a,t,e,n,i,r,0),xa(l,t,e,n,i,r,0);return}o=o.next}a=a.next}while(a!==s)}function wm(s,t,e,n){let i=[];for(let r=0,a=t.length;r<a;r++){let o=t[r]*n,l=r<a-1?t[r+1]*n:s.length,c=af(s,o,l,n,!1);c===c.next&&(c.steiner=!0),i.push(Dm(c))}i.sort(Am);for(let r=0;r<i.length;r++)e=Rm(i[r],e);return e}function Am(s,t){let e=s.x-t.x;if(e===0&&(e=s.y-t.y,e===0)){let n=(s.next.y-s.y)/(s.next.x-s.x),i=(t.next.y-t.y)/(t.next.x-t.x);e=n-i}return e}function Rm(s,t){let e=Cm(s,t);if(!e)return t;let n=cf(e,s);return Es(n,n.next),Es(e,e.next)}function Cm(s,t){let e=t,n=s.x,i=s.y,r=-1/0,a;if(dr(s,e))return e;do{if(dr(s,e.next))return e.next;if(i<=e.y&&i>=e.next.y&&e.next.y!==e.y){let u=e.x+(i-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(u<=n&&u>r&&(r=u,a=e.x<e.next.x?e:e.next,u===n))return a}e=e.next}while(e!==t);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;e=a;do{if(n>=e.x&&e.x>=l&&n!==e.x&&of(i<c?n:r,i,l,c,i<c?r:n,i,e.x,e.y)){let u=Math.abs(i-e.y)/(n-e.x);_a(e,s)&&(u<h||u===h&&(e.x>a.x||e.x===a.x&&Pm(a,e)))&&(a=e,h=u)}e=e.next}while(e!==o);return a}function Pm(s,t){return De(s.prev,s,t.prev)<0&&De(t.next,s,s.next)<0}function Im(s,t,e,n){let i=s;do i.z===0&&(i.z=ph(i.x,i.y,t,e,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,Lm(i)}function Lm(s){let t,e=1;do{let n=s,i;s=null;let r=null;for(t=0;n;){t++;let a=n,o=0;for(let c=0;c<e&&(o++,a=a.nextZ,!!a);c++);let l=e;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(i=n,n=n.nextZ,o--):(i=a,a=a.nextZ,l--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;n=a}r.nextZ=null,e*=2}while(t>1);return s}function ph(s,t,e,n,i){return s=(s-e)*i|0,t=(t-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,s|t<<1}function Dm(s){let t=s,e=s;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==s);return e}function of(s,t,e,n,i,r,a,o){return(i-a)*(t-o)>=(s-a)*(r-o)&&(s-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(i-a)*(n-o)}function Jr(s,t,e,n,i,r,a,o){return!(s===a&&t===o)&&of(s,t,e,n,i,r,a,o)}function Nm(s,t){return s.next.i!==t.i&&s.prev.i!==t.i&&!Um(s,t)&&(_a(s,t)&&_a(t,s)&&Fm(s,t)&&(De(s.prev,s,t.prev)||De(s,t.prev,t))||dr(s,t)&&De(s.prev,s,s.next)>0&&De(t.prev,t,t.next)>0)}function De(s,t,e){return(t.y-s.y)*(e.x-t.x)-(t.x-s.x)*(e.y-t.y)}function dr(s,t){return s.x===t.x&&s.y===t.y}function lf(s,t,e,n){let i=Io(De(s,t,e)),r=Io(De(s,t,n)),a=Io(De(e,n,s)),o=Io(De(e,n,t));return!!(i!==r&&a!==o||i===0&&Po(s,e,t)||r===0&&Po(s,n,t)||a===0&&Po(e,s,n)||o===0&&Po(e,t,n))}function Po(s,t,e){return t.x<=Math.max(s.x,e.x)&&t.x>=Math.min(s.x,e.x)&&t.y<=Math.max(s.y,e.y)&&t.y>=Math.min(s.y,e.y)}function Io(s){return s>0?1:s<0?-1:0}function Um(s,t){let e=s;do{if(e.i!==s.i&&e.next.i!==s.i&&e.i!==t.i&&e.next.i!==t.i&&lf(e,e.next,s,t))return!0;e=e.next}while(e!==s);return!1}function _a(s,t){return De(s.prev,s,s.next)<0?De(s,t,s.next)>=0&&De(s,s.prev,t)>=0:De(s,t,s.prev)<0||De(s,s.next,t)<0}function Fm(s,t){let e=s,n=!1,i=(s.x+t.x)/2,r=(s.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&i<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==s);return n}function cf(s,t){let e=mh(s.i,s.x,s.y),n=mh(t.i,t.x,t.y),i=s.next,r=t.prev;return s.next=t,t.prev=s,e.next=i,i.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function ud(s,t,e,n){let i=mh(s,t,e);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function va(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function mh(s,t,e){return{i:s,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Om(s,t,e,n){let i=0;for(let r=t,a=e-n;r<e;r+=n)i+=(s[a]-s[r])*(s[r+1]+s[a+1]),a=r;return i}var gh=class{static triangulate(t,e,n=2){return Mm(t,e,n)}},hi=class s{static area(t){let e=t.length,n=0;for(let i=e-1,r=0;r<e;i=r++)n+=t[i].x*t[r].y-t[r].x*t[i].y;return n*.5}static isClockWise(t){return s.area(t)<0}static triangulateShape(t,e){let n=[],i=[],r=[];dd(t),fd(n,t);let a=t.length;e.forEach(dd);for(let l=0;l<e.length;l++)i.push(a),a+=e[l].length,fd(n,e[l]);let o=gh.triangulate(n,i);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function dd(s){let t=s.length;t>2&&s[t-1].equals(s[0])&&s.pop()}function fd(s,t){for(let e=0;e<t.length;e++)s.push(t[e].x),s.push(t[e].y)}var ya=class s extends Ne{constructor(t=new Ii([new lt(.5,.5),new lt(-.5,.5),new lt(-.5,-.5),new lt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,i=[],r=[];for(let o=0,l=t.length;o<l;o++){let c=t[o];a(c)}this.setAttribute("position",new re(i,3)),this.setAttribute("uv",new re(r,2)),this.computeVertexNormals();function a(o){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,m=e.bevelSize!==void 0?e.bevelSize:f-.1,v=e.bevelOffset!==void 0?e.bevelOffset:0,p=e.bevelSegments!==void 0?e.bevelSegments:3,g=e.extrudePath,x=e.UVGenerator!==void 0?e.UVGenerator:Bm,T,M=!1,b,E,P,y;if(g){T=g.getSpacedPoints(h),M=!0,d=!1;let st=g.isCatmullRomCurve3?g.closed:!1;b=g.computeFrenetFrames(h,st),E=new w,P=new w,y=new w}d||(p=0,f=0,m=0,v=0);let A=o.extractPoints(c),I=A.shape,N=A.holes;if(!hi.isClockWise(I)){I=I.reverse();for(let st=0,ot=N.length;st<ot;st++){let ct=N[st];hi.isClockWise(ct)&&(N[st]=ct.reverse())}}function H(st){let ct=10000000000000001e-36,ht=st[0];for(let ft=1;ft<=st.length;ft++){let Vt=ft%st.length,zt=st[Vt],kt=zt.x-ht.x,Yt=zt.y-ht.y,L=kt*kt+Yt*Yt,oe=Math.max(Math.abs(zt.x),Math.abs(zt.y),Math.abs(ht.x),Math.abs(ht.y)),Kt=ct*oe*oe;if(L<=Kt){st.splice(Vt,1),ft--;continue}ht=zt}}H(I),N.forEach(H);let D=N.length,z=I;for(let st=0;st<D;st++){let ot=N[st];I=I.concat(ot)}function J(st,ot,ct){return ot||Wt("ExtrudeGeometry: vec does not exist"),st.clone().addScaledVector(ot,ct)}let Y=I.length;function rt(st,ot,ct){let ht,ft,Vt,zt=st.x-ot.x,kt=st.y-ot.y,Yt=ct.x-st.x,L=ct.y-st.y,oe=zt*zt+kt*kt,Kt=zt*L-kt*Yt;if(Math.abs(Kt)>Number.EPSILON){let C=Math.sqrt(oe),_=Math.sqrt(Yt*Yt+L*L),O=ot.x-kt/C,W=ot.y+zt/C,K=ct.x-L/_,ut=ct.y+Yt/_,dt=((K-O)*L-(ut-W)*Yt)/(zt*L-kt*Yt);ht=O+zt*dt-st.x,ft=W+kt*dt-st.y;let $=ht*ht+ft*ft;if($<=2)return new lt(ht,ft);Vt=Math.sqrt($/2)}else{let C=!1;zt>Number.EPSILON?Yt>Number.EPSILON&&(C=!0):zt<-Number.EPSILON?Yt<-Number.EPSILON&&(C=!0):Math.sign(kt)===Math.sign(L)&&(C=!0),C?(ht=-kt,ft=zt,Vt=Math.sqrt(oe)):(ht=zt,ft=kt,Vt=Math.sqrt(oe/2))}return new lt(ht/Vt,ft/Vt)}let Z=[];for(let st=0,ot=z.length,ct=ot-1,ht=st+1;st<ot;st++,ct++,ht++)ct===ot&&(ct=0),ht===ot&&(ht=0),Z[st]=rt(z[st],z[ct],z[ht]);let tt=[],it,Et=Z.concat();for(let st=0,ot=D;st<ot;st++){let ct=N[st];it=[];for(let ht=0,ft=ct.length,Vt=ft-1,zt=ht+1;ht<ft;ht++,Vt++,zt++)Vt===ft&&(Vt=0),zt===ft&&(zt=0),it[ht]=rt(ct[ht],ct[Vt],ct[zt]);tt.push(it),Et=Et.concat(it)}let St;if(p===0)St=hi.triangulateShape(z,N);else{let st=[],ot=[];for(let ct=0;ct<p;ct++){let ht=ct/p,ft=f*Math.cos(ht*Math.PI/2),Vt=m*Math.sin(ht*Math.PI/2)+v;for(let zt=0,kt=z.length;zt<kt;zt++){let Yt=J(z[zt],Z[zt],Vt);mt(Yt.x,Yt.y,-ft),ht===0&&st.push(Yt)}for(let zt=0,kt=D;zt<kt;zt++){let Yt=N[zt];it=tt[zt];let L=[];for(let oe=0,Kt=Yt.length;oe<Kt;oe++){let C=J(Yt[oe],it[oe],Vt);mt(C.x,C.y,-ft),ht===0&&L.push(C)}ht===0&&ot.push(L)}}St=hi.triangulateShape(st,ot)}let jt=St.length,Jt=m+v;for(let st=0;st<Y;st++){let ot=d?J(I[st],Et[st],Jt):I[st];M?(P.copy(b.normals[0]).multiplyScalar(ot.x),E.copy(b.binormals[0]).multiplyScalar(ot.y),y.copy(T[0]).add(P).add(E),mt(y.x,y.y,y.z)):mt(ot.x,ot.y,0)}for(let st=1;st<=h;st++)for(let ot=0;ot<Y;ot++){let ct=d?J(I[ot],Et[ot],Jt):I[ot];M?(P.copy(b.normals[st]).multiplyScalar(ct.x),E.copy(b.binormals[st]).multiplyScalar(ct.y),y.copy(T[st]).add(P).add(E),mt(y.x,y.y,y.z)):mt(ct.x,ct.y,u/h*st)}for(let st=p-1;st>=0;st--){let ot=st/p,ct=f*Math.cos(ot*Math.PI/2),ht=m*Math.sin(ot*Math.PI/2)+v;for(let ft=0,Vt=z.length;ft<Vt;ft++){let zt=J(z[ft],Z[ft],ht);mt(zt.x,zt.y,u+ct)}for(let ft=0,Vt=N.length;ft<Vt;ft++){let zt=N[ft];it=tt[ft];for(let kt=0,Yt=zt.length;kt<Yt;kt++){let L=J(zt[kt],it[kt],ht);M?mt(L.x,L.y+T[h-1].y,T[h-1].x+ct):mt(L.x,L.y,u+ct)}}}$t(),X();function $t(){let st=i.length/3;if(d){let ot=0,ct=Y*ot;for(let ht=0;ht<jt;ht++){let ft=St[ht];Bt(ft[2]+ct,ft[1]+ct,ft[0]+ct)}ot=h+p*2,ct=Y*ot;for(let ht=0;ht<jt;ht++){let ft=St[ht];Bt(ft[0]+ct,ft[1]+ct,ft[2]+ct)}}else{for(let ot=0;ot<jt;ot++){let ct=St[ot];Bt(ct[2],ct[1],ct[0])}for(let ot=0;ot<jt;ot++){let ct=St[ot];Bt(ct[0]+Y*h,ct[1]+Y*h,ct[2]+Y*h)}}n.addGroup(st,i.length/3-st,0)}function X(){let st=i.length/3,ot=0;Q(z,ot),ot+=z.length;for(let ct=0,ht=N.length;ct<ht;ct++){let ft=N[ct];Q(ft,ot),ot+=ft.length}n.addGroup(st,i.length/3-st,1)}function Q(st,ot){let ct=st.length;for(;--ct>=0;){let ht=ct,ft=ct-1;ft<0&&(ft=st.length-1);for(let Vt=0,zt=h+p*2;Vt<zt;Vt++){let kt=Y*Vt,Yt=Y*(Vt+1),L=ot+ht+kt,oe=ot+ft+kt,Kt=ot+ft+Yt,C=ot+ht+Yt;_t(L,oe,Kt,C)}}}function mt(st,ot,ct){l.push(st),l.push(ot),l.push(ct)}function Bt(st,ot,ct){Ht(st),Ht(ot),Ht(ct);let ht=i.length/3,ft=x.generateTopUV(n,i,ht-3,ht-2,ht-1);ie(ft[0]),ie(ft[1]),ie(ft[2])}function _t(st,ot,ct,ht){Ht(st),Ht(ot),Ht(ht),Ht(ot),Ht(ct),Ht(ht);let ft=i.length/3,Vt=x.generateSideWallUV(n,i,ft-6,ft-3,ft-2,ft-1);ie(Vt[0]),ie(Vt[1]),ie(Vt[3]),ie(Vt[1]),ie(Vt[2]),ie(Vt[3])}function Ht(st){i.push(l[st*3+0]),i.push(l[st*3+1]),i.push(l[st*3+2])}function ie(st){r.push(st.x),r.push(st.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return zm(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,a=t.shapes.length;r<a;r++){let o=e[t.shapes[r]];n.push(o)}let i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new fh[i.type]().fromJSON(i)),new s(n,t.options)}},Bm={generateTopUV:function(s,t,e,n,i){let r=t[e*3],a=t[e*3+1],o=t[n*3],l=t[n*3+1],c=t[i*3],h=t[i*3+1];return[new lt(r,a),new lt(o,l),new lt(c,h)]},generateSideWallUV:function(s,t,e,n,i,r){let a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],u=t[n*3+2],d=t[i*3],f=t[i*3+1],m=t[i*3+2],v=t[r*3],p=t[r*3+1],g=t[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new lt(a,1-l),new lt(c,1-u),new lt(d,1-m),new lt(v,1-g)]:[new lt(o,1-l),new lt(h,1-u),new lt(f,1-m),new lt(p,1-g)]}};function zm(s,t,e){if(e.shapes=[],Array.isArray(s))for(let n=0,i=s.length;n<i;n++){let r=s[n];e.shapes.push(r.uuid)}else e.shapes.push(s.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var En=class s extends Ne{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};let r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=t/o,d=e/l,f=[],m=[],v=[],p=[];for(let g=0;g<h;g++){let x=g*d-a;for(let T=0;T<c;T++){let M=T*u-r;m.push(M,-x,0),v.push(0,0,1),p.push(T/o),p.push(1-g/l)}}for(let g=0;g<l;g++)for(let x=0;x<o;x++){let T=x+c*g,M=x+c*(g+1),b=x+1+c*(g+1),E=x+1+c*g;f.push(T,M,E),f.push(M,b,E)}this.setIndex(f),this.setAttribute("position",new re(m,3)),this.setAttribute("normal",new re(v,3)),this.setAttribute("uv",new re(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.widthSegments,t.heightSegments)}},Ma=class s extends Ne{constructor(t=.5,e=1,n=32,i=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:a},n=Math.max(3,n),i=Math.max(1,i);let o=[],l=[],c=[],h=[],u=t,d=(e-t)/i,f=new w,m=new lt;for(let v=0;v<=i;v++){for(let p=0;p<=n;p++){let g=r+p/n*a;f.x=u*Math.cos(g),f.y=u*Math.sin(g),l.push(f.x,f.y,f.z),c.push(0,0,1),m.x=(f.x/e+1)/2,m.y=(f.y/e+1)/2,h.push(m.x,m.y)}u+=d}for(let v=0;v<i;v++){let p=v*(n+1);for(let g=0;g<n;g++){let x=g+p,T=x,M=x+n+1,b=x+n+2,E=x+1;o.push(T,M,E),o.push(M,b,E)}}this.setIndex(o),this.setAttribute("position",new re(l,3)),this.setAttribute("normal",new re(c,3)),this.setAttribute("uv",new re(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Sa=class s extends Ne{constructor(t=new Ii([new lt(0,.5),new lt(-.5,-.5),new lt(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};let n=[],i=[],r=[],a=[],o=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let h=0;h<t.length;h++)c(t[h]),this.addGroup(o,l,h),o+=l,l=0;this.setIndex(n),this.setAttribute("position",new re(i,3)),this.setAttribute("normal",new re(r,3)),this.setAttribute("uv",new re(a,2));function c(h){let u=i.length/3,d=h.extractPoints(e),f=d.shape,m=d.holes;hi.isClockWise(f)===!1&&(f=f.reverse());for(let p=0,g=m.length;p<g;p++){let x=m[p];hi.isClockWise(x)===!0&&(m[p]=x.reverse())}let v=hi.triangulateShape(f,m);for(let p=0,g=m.length;p<g;p++){let x=m[p];f=f.concat(x)}for(let p=0,g=f.length;p<g;p++){let x=f[p];i.push(x.x,x.y,0),r.push(0,0,1),a.push(x.x,x.y)}for(let p=0,g=v.length;p<g;p++){let x=v[p],T=x[0]+u,M=x[1]+u,b=x[2]+u;n.push(T,M,b),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes;return Hm(e,t)}static fromJSON(t,e){let n=[];for(let i=0,r=t.shapes.length;i<r;i++){let a=e[t.shapes[i]];n.push(a)}return new s(n,t.curveSegments)}};function Hm(s,t){if(t.shapes=[],Array.isArray(s))for(let e=0,n=s.length;e<n;e++){let i=s[e];t.shapes.push(i.uuid)}else t.shapes.push(s.uuid);return t}var In=class s extends Ne{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,h=[],u=new w,d=new w,f=[],m=[],v=[],p=[];for(let g=0;g<=n;g++){let x=[],T=g/n,M=a+T*o,b=t*Math.cos(M),E=Math.sqrt(t*t-b*b),P=0;g===0&&a===0?P=.5/e:g===n&&l===Math.PI&&(P=-.5/e);for(let y=0;y<=e;y++){let A=y/e,I=i+A*r;u.x=-E*Math.cos(I),u.y=b,u.z=E*Math.sin(I),m.push(u.x,u.y,u.z),d.copy(u).normalize(),v.push(d.x,d.y,d.z),p.push(A+P,1-T),x.push(c++)}h.push(x)}for(let g=0;g<n;g++)for(let x=0;x<e;x++){let T=h[g][x+1],M=h[g][x],b=h[g+1][x],E=h[g+1][x+1];(g!==0||a>0)&&f.push(T,M,E),(g!==n-1||l<Math.PI)&&f.push(M,b,E)}this.setIndex(f),this.setAttribute("position",new re(m,3)),this.setAttribute("normal",new re(v,3)),this.setAttribute("uv",new re(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var pi=class s extends Ne{constructor(t=1,e=.4,n=12,i=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:i,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),i=Math.floor(i);let l=[],c=[],h=[],u=[],d=new w,f=new w,m=new w;for(let v=0;v<=n;v++){let p=a+v/n*o;for(let g=0;g<=i;g++){let x=g/i*r;f.x=(t+e*Math.cos(p))*Math.cos(x),f.y=(t+e*Math.cos(p))*Math.sin(x),f.z=e*Math.sin(p),c.push(f.x,f.y,f.z),d.x=t*Math.cos(x),d.y=t*Math.sin(x),m.subVectors(f,d).normalize(),h.push(m.x,m.y,m.z),u.push(g/i),u.push(v/n)}}for(let v=1;v<=n;v++)for(let p=1;p<=i;p++){let g=(i+1)*v+p-1,x=(i+1)*(v-1)+p-1,T=(i+1)*(v-1)+p,M=(i+1)*v+p;l.push(g,x,M),l.push(x,T,M)}this.setIndex(l),this.setAttribute("position",new re(c,3)),this.setAttribute("normal",new re(h,3)),this.setAttribute("uv",new re(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function Is(s){let t={};for(let e in s){t[e]={};for(let n in s[e]){let i=s[e][n];if(pd(i))i.isRenderTargetTexture?(Gt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone();else if(Array.isArray(i))if(pd(i[0])){let r=[];for(let a=0,o=i.length;a<o;a++)r[a]=i[a].clone();t[e][n]=r}else t[e][n]=i.slice();else t[e][n]=i}}return t}function un(s){let t={};for(let e=0;e<s.length;e++){let n=Is(s[e]);for(let i in n)t[i]=n[i]}return t}function pd(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function Vm(s){let t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Bh(s){let t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ne.workingColorSpace}var Di={clone:Is,merge:un},km=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Gm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Me=class extends Ji{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=km,this.fragmentShader=Gm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Is(t.uniforms),this.uniformsGroups=Vm(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let i in this.uniforms){let a=this.uniforms[i].value;a&&a.isTexture?e.uniforms[i]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[i]={type:"m4",value:a.toArray()}:e.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let i=t.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=e[i.value]||null;break;case"c":this.uniforms[n].value=new Ct().setHex(i.value);break;case"v2":this.uniforms[n].value=new lt().fromArray(i.value);break;case"v3":this.uniforms[n].value=new w().fromArray(i.value);break;case"v4":this.uniforms[n].value=new Re().fromArray(i.value);break;case"m3":this.uniforms[n].value=new Zt().fromArray(i.value);break;case"m4":this.uniforms[n].value=new me().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},fr=class extends Me{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},le=class extends Ji{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ct(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ct(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ic,this.normalScale=new lt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ri,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Ts=class extends le{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new lt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ee(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ct(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ct(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ct(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var nl=class extends Ji{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Wd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},il=class extends Ji{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Ks(s,t){return!s||s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function oh(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}var $i=class{constructor(t,e,n,i){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,i=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<i)){for(let o=n+2;;){if(i===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=i,i=e[++n],t<i)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(i=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,t,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=t*i;for(let a=0;a!==i;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},sl=class extends $i{constructor(t,e,n,i){super(t,e,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:hh,endingEnd:hh}}intervalChanged_(t,e,n){let i=this.parameterPositions,r=t-2,a=t+1,o=i[r],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case uh:r=t,o=2*e-n;break;case dh:r=i.length-2,o=e+i[r]-i[r+1];break;default:r=t,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case uh:a=t,l=2*n-e;break;case dh:a=1,l=n+i[1]-i[0];break;default:a=t-1,l=e}let c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(t,e,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,m=(n-e)/(i-e),v=m*m,p=v*m,g=-d*p+2*d*v-d*m,x=(1+d)*p+(-1.5-2*d)*v+(-.5+d)*m+1,T=(-1-f)*p+(1.5+f)*v+.5*m,M=f*p-f*v;for(let b=0;b!==o;++b)r[b]=g*a[h+b]+x*a[c+b]+T*a[l+b]+M*a[u+b];return r}},rl=class extends $i{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=(n-e)/(i-e),u=1-h;for(let d=0;d!==o;++d)r[d]=a[c+d]*u+a[l+d]*h;return r}},al=class extends $i{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t){return this.copySampleValue_(t-1)}},ol=class extends $i{interpolate_(t,e,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this.inTangents,u=this.outTangents;if(!h||!u){let m=(n-e)/(i-e),v=1-m;for(let p=0;p!==o;++p)r[p]=a[c+p]*v+a[l+p]*m;return r}let d=o*2,f=t-1;for(let m=0;m!==o;++m){let v=a[c+m],p=a[l+m],g=f*d+m*2,x=u[g],T=u[g+1],M=t*d+m*2,b=h[M],E=h[M+1],P=Xm(n,e,x,b,i);r[m]=hf(P,v,T,E,p)}return r}};function hf(s,t,e,n,i){let r=1-s;return r*r*r*t+3*r*r*s*e+3*r*s*s*n+s*s*s*i}function Wm(s,t,e,n,i){let r=1-s;return 3*r*r*(e-t)+6*r*s*(n-e)+3*s*s*(i-n)}function Xm(s,t,e,n,i){let r=(s-t)/(i-t);for(let a=0;a<8;a++){let o=hf(r,t,e,n,i)-s;if(Math.abs(o)<1e-10)break;let l=Wm(r,t,e,n,i);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var Ln=class{constructor(t,e,n,i){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Ks(e,this.TimeBufferType),this.values=Ks(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Ks(t.times,Array),values:Ks(t.values,Array)};let i=t.getInterpolation();i!==t.DefaultInterpolation&&(n.interpolation=i),oh(t.settings)&&(n.settings={inTangents:Ks(t.settings.inTangents,Array),outTangents:Ks(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new al(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new rl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new sl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new ol(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case ta:e=this.InterpolantFactoryMethodDiscrete;break;case Wo:e=this.InterpolantFactoryMethodLinear;break;case No:e=this.InterpolantFactoryMethodSmooth;break;case ch:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Gt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ta;case this.InterpolantFactoryMethodLinear:return Wo;case this.InterpolantFactoryMethodSmooth:return No;case this.InterpolantFactoryMethodBezier:return ch}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]*=t;oh(this.settings)&&(md(this.settings.inTangents,t),md(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,i=n.length,r=0,a=i-1;for(;r!==i&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==i){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Wt("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,i=this.values,r=n.length;r===0&&(Wt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Wt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){Wt("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(i!==void 0&&Lp(i))for(let o=0,l=i.length;o!==l;++o){let c=i[o];if(isNaN(c)){Wt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===No,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],h=t[o+1];if(c!==h&&(o!==1||c!==t[0]))if(i)l=!0;else{let u=o*n,d=u-n,f=u+n;for(let m=0;m!==n;++m){let v=e[u+m];if(v!==e[d+m]||v!==e[f+m]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let u=o*n,d=a*n;for(let f=0;f!==n;++f)e[d+f]=e[u+f]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,i=new n(this.name,t,e);return i.createInterpolant=this.createInterpolant,oh(this.settings)&&(i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),i}};function md(s,t){for(let e=0,n=s.length;e!==n;e+=2)s[e]*=t}Ln.prototype.ValueTypeName="";Ln.prototype.TimeBufferType=Float32Array;Ln.prototype.ValueBufferType=Float32Array;Ln.prototype.DefaultInterpolation=Wo;var ji=class extends Ln{constructor(t,e,n){super(t,e,n)}};ji.prototype.ValueTypeName="bool";ji.prototype.ValueBufferType=Array;ji.prototype.DefaultInterpolation=ta;ji.prototype.InterpolantFactoryMethodLinear=void 0;ji.prototype.InterpolantFactoryMethodSmooth=void 0;var ll=class extends Ln{constructor(t,e,n,i){super(t,e,n,i)}};ll.prototype.ValueTypeName="color";var cl=class extends Ln{constructor(t,e,n,i){super(t,e,n,i)}};cl.prototype.ValueTypeName="number";var hl=class extends $i{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-e)/(i-e),c=t*o;for(let h=c+o;c!==h;c+=4)pe.slerpFlat(r,0,a,c-o,a,c,l);return r}},ba=class extends Ln{constructor(t,e,n,i){super(t,e,n,i)}InterpolantFactoryMethodLinear(t){return new hl(this.times,this.values,this.getValueSize(),t)}};ba.prototype.ValueTypeName="quaternion";ba.prototype.InterpolantFactoryMethodSmooth=void 0;var Qi=class extends Ln{constructor(t,e,n){super(t,e,n)}};Qi.prototype.ValueTypeName="string";Qi.prototype.ValueBufferType=Array;Qi.prototype.DefaultInterpolation=ta;Qi.prototype.InterpolantFactoryMethodLinear=void 0;Qi.prototype.InterpolantFactoryMethodSmooth=void 0;var ul=class extends Ln{constructor(t,e,n,i){super(t,e,n,i)}};ul.prototype.ValueTypeName="vector";var dl=class{constructor(t,e,n){let i=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(h){o++,r===!1&&i.onStart!==void 0&&i.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],m=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},uf=new dl,fl=class{constructor(t){this.manager=t!==void 0?t:uf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(i,r){n.load(t,i,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};fl.DEFAULT_MATERIAL_NAME="__DEFAULT";var pr=class extends hn{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Ct(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Ea=class extends pr{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(hn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ct(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},lh=new me,gd=new w,xd=new w,Ta=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new lt(512,512),this.mapType=Tn,this.map=null,this.mapPass=null,this.matrix=new me,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new cr,this._frameExtents=new lt(1,1),this._viewportCount=1,this._viewports=[new Re(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;gd.setFromMatrixPosition(t.matrixWorld),e.position.copy(gd),xd.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(xd),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,i){lh.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(lh,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=i?i.z/r.x:1,o=i?i.w/r.y:1,l=i?i.x/r.x:0,c=i?i.y/r.y:0;t.coordinateSystem===ir||t.reversedDepth?e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(lh)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Lo=new w,Do=new pe,li=new w,wa=class extends hn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new me,this.projectionMatrix=new me,this.projectionMatrixInverse=new me,this.coordinateSystem=ni,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Lo,Do,li),li.x===1&&li.y===1&&li.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Lo,Do,li.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Lo,Do,li),li.x===1&&li.y===1&&li.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Lo,Do,li.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},qi=new w,_d=new lt,vd=new lt,Xe=class extends wa{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=rr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Kr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return rr*2*Math.atan(Math.tan(Kr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){qi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(qi.x,qi.y).multiplyScalar(-t/qi.z),qi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(qi.x,qi.y).multiplyScalar(-t/qi.z)}getViewSize(t,e){return this.getViewBounds(t,_d,vd),e.subVectors(vd,_d)}setViewOffset(t,e,n,i,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Kr*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,r=-.5*i,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*i/l,e-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var xh=class extends Ta{constructor(){super(new Xe(90,1,.5,500)),this.isPointLightShadow=!0}},Aa=class extends pr{constructor(t,e,n=0,i=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new xh}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},ts=class extends wa{constructor(t=-1,e=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,r=n-t,a=n+t,o=i+e,l=i-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},_h=class extends Ta{constructor(){super(new ts(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ra=class extends pr{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(hn.DEFAULT_UP),this.updateMatrix(),this.target=new hn,this.shadow=new _h}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Ca=class extends Ne{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}};var $s=-90,js=1,pl=class extends hn{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new Xe($s,js,t,e);i.layers=this.layers,this.add(i);let r=new Xe($s,js,t,e);r.layers=this.layers,this.add(r);let a=new Xe($s,js,t,e);a.layers=this.layers,this.add(a);let o=new Xe($s,js,t,e);o.layers=this.layers,this.add(o);let l=new Xe($s,js,t,e);l.layers=this.layers,this.add(l);let c=new Xe($s,js,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,i,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===ni)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===ir)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;let v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;t.isWebGLRenderer===!0?p=t.state.buffers.depth.getReversed():p=t.reversedDepthBuffer,t.setRenderTarget(n,0,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=m,n.texture.needsPMREMUpdate=!0}},ml=class extends Xe{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}},Pa=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(t){this._document=t,t.hidden!==void 0&&(this._pageVisibilityHandler=qm.bind(this),t.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(t){return this._timescale=t,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(t){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(t!==void 0?t:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function qm(){this._document.hidden===!1&&this.reset()}var zh="\\[\\]\\.:\\/",Ym=new RegExp("["+zh+"]","g"),Hh="[^"+zh+"]",Zm="[^"+zh.replace("\\.","")+"]",Jm=/((?:WC+[\/:])*)/.source.replace("WC",Hh),Km=/(WCOD+)?/.source.replace("WCOD",Zm),$m=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Hh),jm=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Hh),Qm=new RegExp("^"+Jm+Km+$m+jm+"$"),t0=["material","materials","bones","map"],vh=class{constructor(t,e,n){let i=n||Te.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,i)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},Te=class s{constructor(t,e,n){this.path=e,this.parsedPath=n||s.parseTrackName(e),this.node=s.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new s.Composite(t,e,n):new s(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Ym,"")}static parseTrackName(t){let e=Qm.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let r=n.nodeName.substring(i+1);t0.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=n(o.children);if(l)return l}return null},i=n(t.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)t[e++]=n[i]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,i=e.propertyName,r=e.propertyIndex;if(t||(t=s.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Gt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){Wt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Wt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Wt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Wt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Wt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Wt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){Wt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[i];if(a===void 0){let c=e.nodeName;Wt("PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!t.geometry){Wt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Wt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Te.Composite=vh;Te.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Te.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Te.prototype.GetterByBindingType=[Te.prototype._getValue_direct,Te.prototype._getValue_array,Te.prototype._getValue_arrayElement,Te.prototype._getValue_toArray];Te.prototype.SetterByBindingTypeAndVersioning=[[Te.prototype._setValue_direct,Te.prototype._setValue_direct_setNeedsUpdate,Te.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Te.prototype._setValue_array,Te.prototype._setValue_array_setNeedsUpdate,Te.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Te.prototype._setValue_arrayElement,Te.prototype._setValue_arrayElement_setNeedsUpdate,Te.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Te.prototype._setValue_fromArray,Te.prototype._setValue_fromArray_setNeedsUpdate,Te.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Cy=new Float32Array(1);var qh=class qh{constructor(t,e,n,i){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,i){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=i,this}};qh.prototype.isMatrix2=!0;var yh=qh;function Vh(s,t,e,n){let i=e0(n);switch(e){case Lh:return s*t;case bl:return s*t/i.components*i.byteLength;case El:return s*t/i.components*i.byteLength;case as:return s*t*2/i.components*i.byteLength;case Tl:return s*t*2/i.components*i.byteLength;case Dh:return s*t*3/i.components*i.byteLength;case Xn:return s*t*4/i.components*i.byteLength;case wl:return s*t*4/i.components*i.byteLength;case za:case Ha:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Va:case ka:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Rl:case Pl:return Math.max(s,16)*Math.max(t,8)/4;case Al:case Cl:return Math.max(s,8)*Math.max(t,8)/2;case Il:case Ll:case Nl:case Ul:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Dl:case Ga:case Fl:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Ol:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Bl:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case zl:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case Hl:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case Vl:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case kl:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case Gl:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case Wl:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case Xl:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case ql:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case Yl:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case Zl:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case Jl:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case Kl:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case $l:case jl:case Ql:return Math.ceil(s/4)*Math.ceil(t/4)*16;case tc:case ec:return Math.ceil(s/4)*Math.ceil(t/4)*8;case Wa:case nc:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function e0(s){switch(s){case Tn:case Rh:return{byteLength:1,components:1};case gr:case Ch:case Ye:return{byteLength:2,components:1};case Ml:case Sl:return{byteLength:2,components:4};case si:case yl:case Wn:return{byteLength:4,components:1};case Ph:case Ih:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Gt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Df(){let s=null,t=!1,e=null,n=null;function i(r,a){n=s.requestAnimationFrame(i),e(r,a)}return{start:function(){t!==!0&&e!==null&&s!==null&&(n=s.requestAnimationFrame(i),t=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function i0(s){let t=new WeakMap;function e(o,l){let c=o.array,h=o.usage,u=c.byteLength,d=s.createBuffer();s.bindBuffer(l,d),s.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=s.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){let h=l.array,u=l.updateRanges;if(s.bindBuffer(c,o),u.length===0)s.bufferSubData(c,0,h);else{u.sort((f,m)=>f.start-m.start);let d=0;for(let f=1;f<u.length;f++){let m=u[d],v=u[f];v.start<=m.start+m.count+1?m.count=Math.max(m.count,v.start+v.count-m.start):(++d,u[d]=v)}u.length=d+1;for(let f=0,m=u.length;f<m;f++){let v=u[f];s.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(s.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:r,update:a}}var s0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,r0=`#ifdef USE_ALPHAHASH
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
#endif`,a0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,o0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,l0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,c0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,h0=`#ifdef USE_AOMAP
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
#endif`,u0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,d0=`#ifdef USE_BATCHING
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
#endif`,f0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,p0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,m0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,g0=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,x0=`#ifdef USE_IRIDESCENCE
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
#endif`,_0=`#ifdef USE_BUMPMAP
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
#endif`,v0=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,y0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,M0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,S0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,b0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,E0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,T0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,w0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,A0=`#define PI 3.141592653589793
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
} // validated`,R0=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,C0=`vec3 transformedNormal = objectNormal;
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
#endif`,P0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,I0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,L0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,D0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,N0="gl_FragColor = linearToOutputTexel( gl_FragColor );",U0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,F0=`#ifdef USE_ENVMAP
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
#endif`,O0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,B0=`#ifdef USE_ENVMAP
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
#endif`,z0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,H0=`#ifdef USE_ENVMAP
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
#endif`,V0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,k0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,G0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,W0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,X0=`#ifdef USE_GRADIENTMAP
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
}`,q0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Y0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Z0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,J0=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,K0=`#ifdef USE_ENVMAP
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
#endif`,$0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,j0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Q0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,tg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,eg=`PhysicalMaterial material;
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
#endif`,ng=`uniform sampler2D dfgLUT;
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
}`,ig=`
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
#endif`,sg=`#if defined( RE_IndirectDiffuse )
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
#endif`,rg=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ag=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,og=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,lg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,cg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,ug=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,dg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,fg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,pg=`#if defined( USE_POINTS_UV )
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
#endif`,mg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,gg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,xg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,_g=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,vg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,yg=`#ifdef USE_MORPHTARGETS
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
#endif`,Mg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Sg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,bg=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Eg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Tg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,wg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Ag=`#ifdef USE_NORMALMAP
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
#endif`,Rg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Cg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Pg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ig=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Lg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Dg=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Ng=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ug=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Fg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Og=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Bg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,zg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Hg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Vg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,kg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Gg=`float getShadowMask() {
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
}`,Wg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Xg=`#ifdef USE_SKINNING
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
#endif`,qg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Yg=`#ifdef USE_SKINNING
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
#endif`,Zg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Jg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Kg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,$g=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,jg=`#ifdef USE_TRANSMISSION
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
#endif`,Qg=`#ifdef USE_TRANSMISSION
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
#endif`,tx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ex=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,nx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ix=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,sx=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,rx=`uniform sampler2D t2D;
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
}`,ax=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ox=`#ifdef ENVMAP_TYPE_CUBE
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
}`,lx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cx=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hx=`#include <common>
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
}`,ux=`#if DEPTH_PACKING == 3200
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
}`,dx=`#define DISTANCE
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
}`,fx=`#define DISTANCE
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
}`,px=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,mx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gx=`uniform float scale;
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
}`,xx=`uniform vec3 diffuse;
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
}`,_x=`#include <common>
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
}`,vx=`uniform vec3 diffuse;
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
}`,yx=`#define LAMBERT
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
}`,Mx=`#define LAMBERT
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
}`,Sx=`#define MATCAP
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
}`,bx=`#define MATCAP
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
}`,Ex=`#define NORMAL
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
}`,Tx=`#define NORMAL
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
}`,wx=`#define PHONG
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
}`,Ax=`#define PHONG
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
}`,Rx=`#define STANDARD
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
}`,Cx=`#define STANDARD
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
}`,Px=`#define TOON
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
}`,Ix=`#define TOON
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
}`,Lx=`uniform float size;
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
}`,Dx=`uniform vec3 diffuse;
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
}`,Nx=`#include <common>
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
}`,Ux=`uniform vec3 color;
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
}`,Fx=`uniform float rotation;
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
}`,Ox=`uniform vec3 diffuse;
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
}`,te={alphahash_fragment:s0,alphahash_pars_fragment:r0,alphamap_fragment:a0,alphamap_pars_fragment:o0,alphatest_fragment:l0,alphatest_pars_fragment:c0,aomap_fragment:h0,aomap_pars_fragment:u0,batching_pars_vertex:d0,batching_vertex:f0,begin_vertex:p0,beginnormal_vertex:m0,bsdfs:g0,iridescence_fragment:x0,bumpmap_pars_fragment:_0,clipping_planes_fragment:v0,clipping_planes_pars_fragment:y0,clipping_planes_pars_vertex:M0,clipping_planes_vertex:S0,color_fragment:b0,color_pars_fragment:E0,color_pars_vertex:T0,color_vertex:w0,common:A0,cube_uv_reflection_fragment:R0,defaultnormal_vertex:C0,displacementmap_pars_vertex:P0,displacementmap_vertex:I0,emissivemap_fragment:L0,emissivemap_pars_fragment:D0,colorspace_fragment:N0,colorspace_pars_fragment:U0,envmap_fragment:F0,envmap_common_pars_fragment:O0,envmap_pars_fragment:B0,envmap_pars_vertex:z0,envmap_physical_pars_fragment:K0,envmap_vertex:H0,fog_vertex:V0,fog_pars_vertex:k0,fog_fragment:G0,fog_pars_fragment:W0,gradientmap_pars_fragment:X0,lightmap_pars_fragment:q0,lights_lambert_fragment:Y0,lights_lambert_pars_fragment:Z0,lights_pars_begin:J0,lights_toon_fragment:$0,lights_toon_pars_fragment:j0,lights_phong_fragment:Q0,lights_phong_pars_fragment:tg,lights_physical_fragment:eg,lights_physical_pars_fragment:ng,lights_fragment_begin:ig,lights_fragment_maps:sg,lights_fragment_end:rg,lightprobes_pars_fragment:ag,logdepthbuf_fragment:og,logdepthbuf_pars_fragment:lg,logdepthbuf_pars_vertex:cg,logdepthbuf_vertex:hg,map_fragment:ug,map_pars_fragment:dg,map_particle_fragment:fg,map_particle_pars_fragment:pg,metalnessmap_fragment:mg,metalnessmap_pars_fragment:gg,morphinstance_vertex:xg,morphcolor_vertex:_g,morphnormal_vertex:vg,morphtarget_pars_vertex:yg,morphtarget_vertex:Mg,normal_fragment_begin:Sg,normal_fragment_maps:bg,normal_pars_fragment:Eg,normal_pars_vertex:Tg,normal_vertex:wg,normalmap_pars_fragment:Ag,clearcoat_normal_fragment_begin:Rg,clearcoat_normal_fragment_maps:Cg,clearcoat_pars_fragment:Pg,iridescence_pars_fragment:Ig,opaque_fragment:Lg,packing:Dg,premultiplied_alpha_fragment:Ng,project_vertex:Ug,dithering_fragment:Fg,dithering_pars_fragment:Og,roughnessmap_fragment:Bg,roughnessmap_pars_fragment:zg,shadowmap_pars_fragment:Hg,shadowmap_pars_vertex:Vg,shadowmap_vertex:kg,shadowmask_pars_fragment:Gg,skinbase_vertex:Wg,skinning_pars_vertex:Xg,skinning_vertex:qg,skinnormal_vertex:Yg,specularmap_fragment:Zg,specularmap_pars_fragment:Jg,tonemapping_fragment:Kg,tonemapping_pars_fragment:$g,transmission_fragment:jg,transmission_pars_fragment:Qg,uv_pars_fragment:tx,uv_pars_vertex:ex,uv_vertex:nx,worldpos_vertex:ix,background_vert:sx,background_frag:rx,backgroundCube_vert:ax,backgroundCube_frag:ox,cube_vert:lx,cube_frag:cx,depth_vert:hx,depth_frag:ux,distance_vert:dx,distance_frag:fx,equirect_vert:px,equirect_frag:mx,linedashed_vert:gx,linedashed_frag:xx,meshbasic_vert:_x,meshbasic_frag:vx,meshlambert_vert:yx,meshlambert_frag:Mx,meshmatcap_vert:Sx,meshmatcap_frag:bx,meshnormal_vert:Ex,meshnormal_frag:Tx,meshphong_vert:wx,meshphong_frag:Ax,meshphysical_vert:Rx,meshphysical_frag:Cx,meshtoon_vert:Px,meshtoon_frag:Ix,points_vert:Lx,points_frag:Dx,shadow_vert:Nx,shadow_frag:Ux,sprite_vert:Fx,sprite_frag:Ox},vt={common:{diffuse:{value:new Ct(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Zt}},envmap:{envMap:{value:null},envMapRotation:{value:new Zt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Zt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Zt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Zt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Zt},normalScale:{value:new lt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Zt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Zt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Zt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Zt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ct(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new w},probesMax:{value:new w},probesResolution:{value:new w}},points:{diffuse:{value:new Ct(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0},uvTransform:{value:new Zt}},sprite:{diffuse:{value:new Ct(16777215)},opacity:{value:1},center:{value:new lt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}}},gi={basic:{uniforms:un([vt.common,vt.specularmap,vt.envmap,vt.aomap,vt.lightmap,vt.fog]),vertexShader:te.meshbasic_vert,fragmentShader:te.meshbasic_frag},lambert:{uniforms:un([vt.common,vt.specularmap,vt.envmap,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.fog,vt.lights,{emissive:{value:new Ct(0)},envMapIntensity:{value:1}}]),vertexShader:te.meshlambert_vert,fragmentShader:te.meshlambert_frag},phong:{uniforms:un([vt.common,vt.specularmap,vt.envmap,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.fog,vt.lights,{emissive:{value:new Ct(0)},specular:{value:new Ct(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:te.meshphong_vert,fragmentShader:te.meshphong_frag},standard:{uniforms:un([vt.common,vt.envmap,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.roughnessmap,vt.metalnessmap,vt.fog,vt.lights,{emissive:{value:new Ct(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:te.meshphysical_vert,fragmentShader:te.meshphysical_frag},toon:{uniforms:un([vt.common,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.gradientmap,vt.fog,vt.lights,{emissive:{value:new Ct(0)}}]),vertexShader:te.meshtoon_vert,fragmentShader:te.meshtoon_frag},matcap:{uniforms:un([vt.common,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.fog,{matcap:{value:null}}]),vertexShader:te.meshmatcap_vert,fragmentShader:te.meshmatcap_frag},points:{uniforms:un([vt.points,vt.fog]),vertexShader:te.points_vert,fragmentShader:te.points_frag},dashed:{uniforms:un([vt.common,vt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:te.linedashed_vert,fragmentShader:te.linedashed_frag},depth:{uniforms:un([vt.common,vt.displacementmap]),vertexShader:te.depth_vert,fragmentShader:te.depth_frag},normal:{uniforms:un([vt.common,vt.bumpmap,vt.normalmap,vt.displacementmap,{opacity:{value:1}}]),vertexShader:te.meshnormal_vert,fragmentShader:te.meshnormal_frag},sprite:{uniforms:un([vt.sprite,vt.fog]),vertexShader:te.sprite_vert,fragmentShader:te.sprite_frag},background:{uniforms:{uvTransform:{value:new Zt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:te.background_vert,fragmentShader:te.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Zt}},vertexShader:te.backgroundCube_vert,fragmentShader:te.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:te.cube_vert,fragmentShader:te.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:te.equirect_vert,fragmentShader:te.equirect_frag},distance:{uniforms:un([vt.common,vt.displacementmap,{referencePosition:{value:new w},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:te.distance_vert,fragmentShader:te.distance_frag},shadow:{uniforms:un([vt.lights,vt.fog,{color:{value:new Ct(0)},opacity:{value:1}}]),vertexShader:te.shadow_vert,fragmentShader:te.shadow_frag}};gi.physical={uniforms:un([gi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Zt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Zt},clearcoatNormalScale:{value:new lt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Zt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Zt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Zt},sheen:{value:0},sheenColor:{value:new Ct(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Zt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Zt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Zt},transmissionSamplerSize:{value:new lt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Zt},attenuationDistance:{value:0},attenuationColor:{value:new Ct(0)},specularColor:{value:new Ct(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Zt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Zt},anisotropyVector:{value:new lt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Zt}}]),vertexShader:te.meshphysical_vert,fragmentShader:te.meshphysical_frag};var ac={r:0,b:0,g:0},Bx=new me,Nf=new Zt;Nf.set(-1,0,0,0,1,0,0,0,1);function zx(s,t,e,n,i,r){let a=new Ct(0),o=i===!0?0:1,l,c,h=null,u=0,d=null;function f(x){let T=x.isScene===!0?x.background:null;if(T&&T.isTexture){let M=x.backgroundBlurriness>0;T=t.get(T,M)}return T}function m(x){let T=!1,M=f(x);M===null?p(a,o):M&&M.isColor&&(p(M,1),T=!0);let b=s.xr.getEnvironmentBlendMode();b==="additive"?e.buffers.color.setClear(0,0,0,1,r):b==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(s.autoClear||T)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function v(x,T){let M=f(T);M&&(M.isCubeTexture||M.mapping===Oa)?(c===void 0&&(c=new bt(new Pe(1,1,1),new Me({name:"BackgroundCubeMaterial",uniforms:Is(gi.backgroundCube.uniforms),vertexShader:gi.backgroundCube.vertexShader,fragmentShader:gi.backgroundCube.fragmentShader,side:sn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(b,E,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=M,c.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Bx.makeRotationFromEuler(T.backgroundRotation)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Nf),c.material.toneMapped=ne.getTransfer(M.colorSpace)!==de,(h!==M||u!==M.version||d!==s.toneMapping)&&(c.material.needsUpdate=!0,h=M,u=M.version,d=s.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)):M&&M.isTexture&&(l===void 0&&(l=new bt(new En(2,2),new Me({name:"BackgroundMaterial",uniforms:Is(gi.background.uniforms),vertexShader:gi.background.vertexShader,fragmentShader:gi.background.fragmentShader,side:es,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=M,l.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,l.material.toneMapped=ne.getTransfer(M.colorSpace)!==de,M.matrixAutoUpdate===!0&&M.updateMatrix(),l.material.uniforms.uvTransform.value.copy(M.matrix),(h!==M||u!==M.version||d!==s.toneMapping)&&(l.material.needsUpdate=!0,h=M,u=M.version,d=s.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function p(x,T){x.getRGB(ac,Bh(s)),e.buffers.color.setClear(ac.r,ac.g,ac.b,T,r)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(x,T=1){a.set(x),o=T,p(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(x){o=x,p(a,o)},render:m,addToRenderList:v,dispose:g}}function Hx(s,t){let e=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=d(null),r=i,a=!1;function o(N,F,H,D,z){let J=!1,Y=u(N,D,H,F);r!==Y&&(r=Y,c(r.object)),J=f(N,D,H,z),J&&m(N,D,H,z),z!==null&&t.update(z,s.ELEMENT_ARRAY_BUFFER),(J||a)&&(a=!1,M(N,F,H,D),z!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(z).buffer))}function l(){return s.createVertexArray()}function c(N){return s.bindVertexArray(N)}function h(N){return s.deleteVertexArray(N)}function u(N,F,H,D){let z=D.wireframe===!0,J=n[F.id];J===void 0&&(J={},n[F.id]=J);let Y=N.isInstancedMesh===!0?N.id:0,rt=J[Y];rt===void 0&&(rt={},J[Y]=rt);let Z=rt[H.id];Z===void 0&&(Z={},rt[H.id]=Z);let tt=Z[z];return tt===void 0&&(tt=d(l()),Z[z]=tt),tt}function d(N){let F=[],H=[],D=[];for(let z=0;z<e;z++)F[z]=0,H[z]=0,D[z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:H,attributeDivisors:D,object:N,attributes:{},index:null}}function f(N,F,H,D){let z=r.attributes,J=F.attributes,Y=0,rt=H.getAttributes();for(let Z in rt)if(rt[Z].location>=0){let it=z[Z],Et=J[Z];if(Et===void 0&&(Z==="instanceMatrix"&&N.instanceMatrix&&(Et=N.instanceMatrix),Z==="instanceColor"&&N.instanceColor&&(Et=N.instanceColor)),it===void 0||it.attribute!==Et||Et&&it.data!==Et.data)return!0;Y++}return r.attributesNum!==Y||r.index!==D}function m(N,F,H,D){let z={},J=F.attributes,Y=0,rt=H.getAttributes();for(let Z in rt)if(rt[Z].location>=0){let it=J[Z];it===void 0&&(Z==="instanceMatrix"&&N.instanceMatrix&&(it=N.instanceMatrix),Z==="instanceColor"&&N.instanceColor&&(it=N.instanceColor));let Et={};Et.attribute=it,it&&it.data&&(Et.data=it.data),z[Z]=Et,Y++}r.attributes=z,r.attributesNum=Y,r.index=D}function v(){let N=r.newAttributes;for(let F=0,H=N.length;F<H;F++)N[F]=0}function p(N){g(N,0)}function g(N,F){let H=r.newAttributes,D=r.enabledAttributes,z=r.attributeDivisors;H[N]=1,D[N]===0&&(s.enableVertexAttribArray(N),D[N]=1),z[N]!==F&&(s.vertexAttribDivisor(N,F),z[N]=F)}function x(){let N=r.newAttributes,F=r.enabledAttributes;for(let H=0,D=F.length;H<D;H++)F[H]!==N[H]&&(s.disableVertexAttribArray(H),F[H]=0)}function T(N,F,H,D,z,J,Y){Y===!0?s.vertexAttribIPointer(N,F,H,z,J):s.vertexAttribPointer(N,F,H,D,z,J)}function M(N,F,H,D){v();let z=D.attributes,J=H.getAttributes(),Y=F.defaultAttributeValues;for(let rt in J){let Z=J[rt];if(Z.location>=0){let tt=z[rt];if(tt===void 0&&(rt==="instanceMatrix"&&N.instanceMatrix&&(tt=N.instanceMatrix),rt==="instanceColor"&&N.instanceColor&&(tt=N.instanceColor)),tt!==void 0){let it=tt.normalized,Et=tt.itemSize,St=t.get(tt);if(St===void 0)continue;let jt=St.buffer,Jt=St.type,$t=St.bytesPerElement,X=Jt===s.INT||Jt===s.UNSIGNED_INT||tt.gpuType===yl;if(tt.isInterleavedBufferAttribute){let Q=tt.data,mt=Q.stride,Bt=tt.offset;if(Q.isInstancedInterleavedBuffer){for(let _t=0;_t<Z.locationSize;_t++)g(Z.location+_t,Q.meshPerAttribute);N.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let _t=0;_t<Z.locationSize;_t++)p(Z.location+_t);s.bindBuffer(s.ARRAY_BUFFER,jt);for(let _t=0;_t<Z.locationSize;_t++)T(Z.location+_t,Et/Z.locationSize,Jt,it,mt*$t,(Bt+Et/Z.locationSize*_t)*$t,X)}else{if(tt.isInstancedBufferAttribute){for(let Q=0;Q<Z.locationSize;Q++)g(Z.location+Q,tt.meshPerAttribute);N.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=tt.meshPerAttribute*tt.count)}else for(let Q=0;Q<Z.locationSize;Q++)p(Z.location+Q);s.bindBuffer(s.ARRAY_BUFFER,jt);for(let Q=0;Q<Z.locationSize;Q++)T(Z.location+Q,Et/Z.locationSize,Jt,it,Et*$t,Et/Z.locationSize*Q*$t,X)}}else if(Y!==void 0){let it=Y[rt];if(it!==void 0)switch(it.length){case 2:s.vertexAttrib2fv(Z.location,it);break;case 3:s.vertexAttrib3fv(Z.location,it);break;case 4:s.vertexAttrib4fv(Z.location,it);break;default:s.vertexAttrib1fv(Z.location,it)}}}}x()}function b(){A();for(let N in n){let F=n[N];for(let H in F){let D=F[H];for(let z in D){let J=D[z];for(let Y in J)h(J[Y].object),delete J[Y];delete D[z]}}delete n[N]}}function E(N){if(n[N.id]===void 0)return;let F=n[N.id];for(let H in F){let D=F[H];for(let z in D){let J=D[z];for(let Y in J)h(J[Y].object),delete J[Y];delete D[z]}}delete n[N.id]}function P(N){for(let F in n){let H=n[F];for(let D in H){let z=H[D];if(z[N.id]===void 0)continue;let J=z[N.id];for(let Y in J)h(J[Y].object),delete J[Y];delete z[N.id]}}}function y(N){for(let F in n){let H=n[F],D=N.isInstancedMesh===!0?N.id:0,z=H[D];if(z!==void 0){for(let J in z){let Y=z[J];for(let rt in Y)h(Y[rt].object),delete Y[rt];delete z[J]}delete H[D],Object.keys(H).length===0&&delete n[F]}}}function A(){I(),a=!0,r!==i&&(r=i,c(r.object))}function I(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:A,resetDefaultState:I,dispose:b,releaseStatesOfGeometry:E,releaseStatesOfObject:y,releaseStatesOfProgram:P,initAttributes:v,enableAttribute:p,disableUnusedAttributes:x}}function Vx(s,t,e){let n;function i(l){n=l}function r(l,c){s.drawArrays(n,l,c),e.update(c,n,1)}function a(l,c,h){h!==0&&(s.drawArraysInstanced(n,l,c,h),e.update(c,n,h))}function o(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];e.update(d,n,1)}this.setMode=i,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function kx(s,t,e,n){let i;function r(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){let P=t.get("EXT_texture_filter_anisotropic");i=s.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(P){return!(P!==Xn&&n.convert(P)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(P){let y=P===Ye&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(P!==Tn&&P!==Wn&&!y&&n.convert(P)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(P){if(P==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Gt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&d===!1&&Gt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),m=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=s.getParameter(s.MAX_TEXTURE_SIZE),p=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),g=s.getParameter(s.MAX_VERTEX_ATTRIBS),x=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),T=s.getParameter(s.MAX_VARYING_VECTORS),M=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),b=s.getParameter(s.MAX_SAMPLES),E=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:m,maxTextureSize:v,maxCubemapSize:p,maxAttributes:g,maxVertexUniforms:x,maxVaryings:T,maxFragmentUniforms:M,maxSamples:b,samples:E}}function Gx(s){let t=this,e=null,n=0,i=!1,r=!1,a=new ei,o=new Zt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){let m=u.clippingPlanes,v=u.clipIntersection,p=u.clipShadows,g=s.get(u);if(!i||m===null||m.length===0||r&&!p)r?h(null):c();else{let x=r?0:n,T=x*4,M=g.clippingState||null;l.value=M,M=h(m,d,T,f);for(let b=0;b!==T;++b)M[b]=e[b];g.clippingState=M,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,d,f,m){let v=u!==null?u.length:0,p=null;if(v!==0){if(p=l.value,m!==!0||p===null){let g=f+v*4,x=d.matrixWorldInverse;o.getNormalMatrix(x),(p===null||p.length<g)&&(p=new Float32Array(g));for(let T=0,M=f;T!==v;++T,M+=4)a.copy(u[T]).applyMatrix4(x,o),a.normal.toArray(p,M),p[M+3]=a.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,p}}var vr=4,Wx=6,Xx=20,qx=256,qa=new ts,df=new Ct,Yh=null,Zh=0,Jh=0,Kh=!1,Yx=new w,Ls=new w,Mr=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,i=100,r={}){let{size:a=256,position:o=Yx}=r;Yh=this._renderer.getRenderTarget(),Zh=this._renderer.getActiveCubeFace(),Jh=this._renderer.getActiveMipmapLevel(),Kh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,i,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=mf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=pf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Yh,Zh,Jh),this._renderer.xr.enabled=Kh,t.scissorTest=!1,_r(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===is||t.mapping===Cs?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Yh=this._renderer.getRenderTarget(),Zh=this._renderer.getActiveCubeFace(),Jh=this._renderer.getActiveMipmapLevel(),Kh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:nn,minFilter:nn,generateMipmaps:!1,type:Ye,format:Xn,colorSpace:ea,depthBuffer:!1},i=ff(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ff(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Zx(r)),this._blurMaterial=Kx(r,t,e),this._ggxMaterial=Jx(r,t,e)}return i}_compileMaterial(t){let e=new bt(new Ne,t);this._renderer.compile(e,qa)}_sceneToCubeUV(t,e,n,i,r){let l=new Xe(90,1,e,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(df),u.toneMapping=ii,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(i),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new bt(new Pe,new Ce({name:"PMREM.Background",side:sn,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,p=v.material,g=!1,x=t.background;x?x.isColor&&(p.color.copy(x),t.background=null,g=!0):(p.color.copy(df),g=!0);for(let T=0;T<6;T++){let M=T%3;M===0?(l.up.set(0,c[T],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[T],r.y,r.z)):M===1?(l.up.set(0,0,c[T]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[T],r.z)):(l.up.set(0,c[T],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[T]));let b=this._cubeSize;_r(i,M*b,T>2?b:0,b,b),u.setRenderTarget(i),g&&u.render(v,l),u.render(t,l)}u.toneMapping=f,u.autoClear=d,t.background=x}_textureToCubeUV(t,e){let n=this._renderer,i=t.mapping===is||t.mapping===Cs;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=mf()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=pf());let r=i?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;_r(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,qa)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let i=this._lodMeshes.length;for(let r=1;r<i;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let i=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=c*1.25,f=u*d,{_lodMax:m}=this,v=this._sizeLods[n],p=3*v*(n>m-vr?n-m+vr:0),g=4*(this._cubeSize-v);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=m-e,_r(r,p,g,3*v,2*v),i.setRenderTarget(r),i.render(o,qa),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-n,_r(t,p,g,3*v,2*v),i.setRenderTarget(t),i.render(o,qa)}_blur(t,e,n,i){let r=this._pingPongRenderTarget,a=Math.min(i,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,a),this._blurPass(r,t,n,n,a)}_blurPass(t,e,n,i,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[i];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let h=this._sizeLods[i],u=3*h*(i>this._lodMax-vr?i-this._lodMax+vr:0),d=4*(this._cubeSize-h);_r(e,u,d,3*h,2*h),a.setRenderTarget(e),a.render(l,qa)}};function Zx(s){let t=[],e=[],n=s,i=s-vr+1+Wx;for(let r=0;r<i;r++){let a=Math.pow(2,n);t.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,f=3,m=new Float32Array(f*d*u),v=new Float32Array(f*d*u);for(let g=0;g<u;g++){let x=g%3*2/3-1,T=g>2?0:-1,M=[x,T,0,x+2/3,T,0,x+2/3,T+1,0,x,T,0,x+2/3,T+1,0,x,T+1,0];m.set(M,f*d*g);for(let b=0;b<d;b++){let E=h[b*2]*2-1,P=h[b*2+1]*2-1;g===0?Ls.set(1,P,E):g===1?Ls.set(-E,1,-P):g===2?Ls.set(-E,P,1):g===3?Ls.set(-1,P,-E):g===4?Ls.set(-E,-1,P):Ls.set(E,P,-1),Ls.toArray(v,(g*d+b)*f)}}let p=new Ne;p.setAttribute("position",new en(m,f)),p.setAttribute("outputDirection",new en(v,f)),e.push(new bt(p,null)),n>vr&&n--}return{lodMeshes:e,sizeLods:t}}function ff(s,t,e){let n=new Ue(s,t,e);return n.texture.mapping=Oa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function _r(s,t,e,n,i){s.viewport.set(t,e,n,i),s.scissor.set(t,e,n,i)}function Jx(s,t,e){return new Me({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:qx,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:hc(),fragmentShader:`

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
		`,blending:Gn,depthTest:!1,depthWrite:!1})}function Kx(s,t,e){return new Me({name:"SphericalGaussianBlur",defines:{SAMPLES:Xx,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:hc(),fragmentShader:`

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
		`,blending:Gn,depthTest:!1,depthWrite:!1})}function pf(){return new Me({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:hc(),fragmentShader:`

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
		`,blending:Gn,depthTest:!1,depthWrite:!1})}function mf(){return new Me({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:hc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Gn,depthTest:!1,depthWrite:!1})}function hc(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var lc=class extends Ue{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new ha(i),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new Pe(5,5,5),r=new Me({name:"CubemapFromEquirect",uniforms:Is(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:sn,blending:Gn});r.uniforms.tEquirect.value=e;let a=new bt(i,r),o=e.minFilter;return e.minFilter===ss&&(e.minFilter=nn),new pl(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,i=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,i);t.setRenderTarget(r)}};function $x(s){let t=new WeakMap,e=new WeakMap,n=null;function i(d,f=!1){return d==null?null:f?a(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===xl||f===_l)if(t.has(d)){let m=t.get(d).texture;return o(m,d.mapping)}else{let m=d.image;if(m&&m.height>0){let v=new lc(m.height);return v.fromEquirectangularTexture(s,d),t.set(d,v),d.addEventListener("dispose",c),o(v.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture){let f=d.mapping,m=f===xl||f===_l,v=f===is||f===Cs;if(m||v){let p=e.get(d),g=p!==void 0?p.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==g)return n===null&&(n=new Mr(s)),p=m?n.fromEquirectangular(d,p):n.fromCubemap(d,p),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),p.texture;if(p!==void 0)return p.texture;{let x=d.image;return m&&x&&x.height>0||v&&x&&l(x)?(n===null&&(n=new Mr(s)),p=m?n.fromEquirectangular(d):n.fromCubemap(d),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),d.addEventListener("dispose",h),p.texture):null}}}return d}function o(d,f){return f===xl?d.mapping=is:f===_l&&(d.mapping=Cs),d}function l(d){let f=0,m=6;for(let v=0;v<m;v++)d[v]!==void 0&&f++;return f===m}function c(d){let f=d.target;f.removeEventListener("dispose",c);let m=t.get(f);m!==void 0&&(t.delete(f),m.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let m=e.get(f);m!==void 0&&(e.delete(f),m.dispose())}function u(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:u}}function jx(s){let t={};function e(n){if(t[n]!==void 0)return t[n];let i=s.getExtension(n);return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let i=e(n);return i===null&&Ms("WebGLRenderer: "+n+" extension not supported."),i}}}function Qx(s,t,e,n){let i={},r=new WeakMap;function a(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let m in d.attributes)t.remove(d.attributes[m]);d.removeEventListener("dispose",a),delete i[d.id];let f=r.get(d);f&&(t.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function o(u,d){return i[d.id]===!0||(d.addEventListener("dispose",a),i[d.id]=!0,e.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)t.update(d[f],s.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,m=u.attributes.position,v=0;if(m===void 0)return;if(f!==null){let x=f.array;v=f.version;for(let T=0,M=x.length;T<M;T+=3){let b=x[T+0],E=x[T+1],P=x[T+2];d.push(b,E,E,P,P,b)}}else{let x=m.array;v=m.version;for(let T=0,M=x.length/3-1;T<M;T+=3){let b=T+0,E=T+1,P=T+2;d.push(b,E,E,P,P,b)}}let p=new(m.count>=65535?la:oa)(d,1);p.version=v;let g=r.get(u);g&&t.remove(g),r.set(u,p)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function t_(s,t,e){let n;function i(u){n=u}let r,a;function o(u){r=u.type,a=u.bytesPerElement}function l(u,d){s.drawElements(n,d,r,u*a),e.update(d,n,1)}function c(u,d,f){f!==0&&(s.drawElementsInstanced(n,d,r,u*a,f),e.update(d,n,f))}function h(u,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,u,0,f);let v=0;for(let p=0;p<f;p++)v+=d[p];e.update(v,n,1)}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function e_(s){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case s.TRIANGLES:e.triangles+=o*(r/3);break;case s.LINES:e.lines+=o*(r/2);break;case s.LINE_STRIP:e.lines+=o*(r-1);break;case s.LINE_LOOP:e.lines+=o*r;break;case s.POINTS:e.points+=o*r;break;default:Wt("WebGLInfo: Unknown draw mode:",a);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function n_(s,t,e){let n=new WeakMap,i=new Re;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(o);if(d===void 0||d.count!==u){let A=function(){P.dispose(),n.delete(o),o.removeEventListener("dispose",A)};d!==void 0&&d.texture.dispose();let f=o.morphAttributes.position!==void 0,m=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],x=o.morphAttributes.color||[],T=0;f===!0&&(T=1),m===!0&&(T=2),v===!0&&(T=3);let M=o.attributes.position.count*T,b=1;M>t.maxTextureSize&&(b=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);let E=new Float32Array(M*b*4*u),P=new sa(E,M,b,u);P.type=Wn,P.needsUpdate=!0;let y=T*4;for(let I=0;I<u;I++){let N=p[I],F=g[I],H=x[I],D=M*b*4*I;for(let z=0;z<N.count;z++){let J=z*y;f===!0&&(i.fromBufferAttribute(N,z),E[D+J+0]=i.x,E[D+J+1]=i.y,E[D+J+2]=i.z,E[D+J+3]=0),m===!0&&(i.fromBufferAttribute(F,z),E[D+J+4]=i.x,E[D+J+5]=i.y,E[D+J+6]=i.z,E[D+J+7]=0),v===!0&&(i.fromBufferAttribute(H,z),E[D+J+8]=i.x,E[D+J+9]=i.y,E[D+J+10]=i.z,E[D+J+11]=H.itemSize===4?i.w:1)}}d={count:u,texture:P,size:new lt(M,b)},n.set(o,d),o.addEventListener("dispose",A)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,e);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];let m=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(s,"morphTargetBaseInfluence",m),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function i_(s,t,e,n,i){let r=new WeakMap;function a(c){let h=i.render.frame,u=c.geometry,d=t.get(c,u);if(r.get(d)!==h&&(t.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:a,dispose:o}}var s_={[Ia]:"LINEAR_TONE_MAPPING",[La]:"REINHARD_TONE_MAPPING",[Da]:"CINEON_TONE_MAPPING",[Rs]:"ACES_FILMIC_TONE_MAPPING",[Ua]:"AGX_TONE_MAPPING",[Fa]:"NEUTRAL_TONE_MAPPING",[Na]:"CUSTOM_TONE_MAPPING"};function r_(s,t,e,n,i,r){let a=new Ue(t,e,{type:s,depthBuffer:i,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Ne;c.setAttribute("position",new re([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new re([0,2,0,0,2,0],2));let h=new fr({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new bt(c,h),d=new ts(-1,1,1,-1,0,1),f=null,m=null,v=!1,p,g=null,x=[],T=!1;this.setSize=function(M,b){a.setSize(M,b),o!==null&&o.setSize(M,b),l!==null&&l.setSize(M,b);for(let E=0;E<x.length;E++){let P=x[E];P.setSize&&P.setSize(M,b)}},this.setEffects=function(M){x=M,T=x.length>0&&x[0].isRenderPass===!0;let b=a.width,E=a.height;x.length>0&&o===null&&(o=new Ue(b,E,{type:Ye,depthBuffer:!1,stencilBuffer:!1}),l=new Ue(b,E,{type:Ye,depthBuffer:!1,stencilBuffer:!1}));for(let P=0;P<x.length;P++){let y=x[P];y.setSize&&y.setSize(b,E)}},this.begin=function(M,b){if(v||M.toneMapping===ii&&x.length===0)return!1;if(g=b,b!==null){let E=b.width,P=b.height;(a.width!==E||a.height!==P)&&this.setSize(E,P)}return T===!1&&M.setRenderTarget(a),p=M.toneMapping,M.toneMapping=ii,!0},this.hasRenderPass=function(){return T},this.end=function(M,b){M.toneMapping=p,v=!0;let E=a,P=o;for(let y=0;y<x.length;y++){let A=x[y];A.enabled!==!1&&(A.render(M,P,E,b),A.needsSwap!==!1&&(E=P,P=P===o?l:o))}if(f!==M.outputColorSpace||m!==M.toneMapping){f=M.outputColorSpace,m=M.toneMapping,h.defines={},ne.getTransfer(f)===de&&(h.defines.SRGB_TRANSFER="");let y=s_[m];y&&(h.defines[y]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=E.texture,M.setRenderTarget(g),M.render(u,d),g=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var Uf=new gn,Qh=new Ki(1,1),Ff=new sa,Of=new Yo,Bf=new ha,gf=[],xf=[],_f=new Float32Array(16),vf=new Float32Array(9),yf=new Float32Array(4);function Sr(s,t,e){let n=s[0];if(n<=0||n>0)return s;let i=t*e,r=gf[i];if(r===void 0&&(r=new Float32Array(i),gf[i]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,s[a].toArray(r,o)}return r}function Ze(s,t){if(s.length!==t.length)return!1;for(let e=0,n=s.length;e<n;e++)if(s[e]!==t[e])return!1;return!0}function Je(s,t){for(let e=0,n=t.length;e<n;e++)s[e]=t[e]}function uc(s,t){let e=xf[t];e===void 0&&(e=new Int32Array(t),xf[t]=e);for(let n=0;n!==t;++n)e[n]=s.allocateTextureUnit();return e}function a_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function o_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ze(e,t))return;s.uniform2fv(this.addr,t),Je(e,t)}}function l_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ze(e,t))return;s.uniform3fv(this.addr,t),Je(e,t)}}function c_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ze(e,t))return;s.uniform4fv(this.addr,t),Je(e,t)}}function h_(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ze(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),Je(e,t)}else{if(Ze(e,n))return;yf.set(n),s.uniformMatrix2fv(this.addr,!1,yf),Je(e,n)}}function u_(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ze(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),Je(e,t)}else{if(Ze(e,n))return;vf.set(n),s.uniformMatrix3fv(this.addr,!1,vf),Je(e,n)}}function d_(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ze(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),Je(e,t)}else{if(Ze(e,n))return;_f.set(n),s.uniformMatrix4fv(this.addr,!1,_f),Je(e,n)}}function f_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function p_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ze(e,t))return;s.uniform2iv(this.addr,t),Je(e,t)}}function m_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ze(e,t))return;s.uniform3iv(this.addr,t),Je(e,t)}}function g_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ze(e,t))return;s.uniform4iv(this.addr,t),Je(e,t)}}function x_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function __(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ze(e,t))return;s.uniform2uiv(this.addr,t),Je(e,t)}}function v_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ze(e,t))return;s.uniform3uiv(this.addr,t),Je(e,t)}}function y_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ze(e,t))return;s.uniform4uiv(this.addr,t),Je(e,t)}}function M_(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(Qh.compareFunction=e.isReversedDepthBuffer()?rc:sc,r=Qh):r=Uf,e.setTexture2D(t||r,i)}function S_(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||Of,i)}function b_(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||Bf,i)}function E_(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||Ff,i)}function T_(s){switch(s){case 5126:return a_;case 35664:return o_;case 35665:return l_;case 35666:return c_;case 35674:return h_;case 35675:return u_;case 35676:return d_;case 5124:case 35670:return f_;case 35667:case 35671:return p_;case 35668:case 35672:return m_;case 35669:case 35673:return g_;case 5125:return x_;case 36294:return __;case 36295:return v_;case 36296:return y_;case 35678:case 36198:case 36298:case 36306:case 35682:return M_;case 35679:case 36299:case 36307:return S_;case 35680:case 36300:case 36308:case 36293:return b_;case 36289:case 36303:case 36311:case 36292:return E_}}function w_(s,t){s.uniform1fv(this.addr,t)}function A_(s,t){let e=Sr(t,this.size,2);s.uniform2fv(this.addr,e)}function R_(s,t){let e=Sr(t,this.size,3);s.uniform3fv(this.addr,e)}function C_(s,t){let e=Sr(t,this.size,4);s.uniform4fv(this.addr,e)}function P_(s,t){let e=Sr(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function I_(s,t){let e=Sr(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function L_(s,t){let e=Sr(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function D_(s,t){s.uniform1iv(this.addr,t)}function N_(s,t){s.uniform2iv(this.addr,t)}function U_(s,t){s.uniform3iv(this.addr,t)}function F_(s,t){s.uniform4iv(this.addr,t)}function O_(s,t){s.uniform1uiv(this.addr,t)}function B_(s,t){s.uniform2uiv(this.addr,t)}function z_(s,t){s.uniform3uiv(this.addr,t)}function H_(s,t){s.uniform4uiv(this.addr,t)}function V_(s,t,e){let n=this.cache,i=t.length,r=uc(e,i);Ze(n,r)||(s.uniform1iv(this.addr,r),Je(n,r));let a;this.type===s.SAMPLER_2D_SHADOW?a=Qh:a=Uf;for(let o=0;o!==i;++o)e.setTexture2D(t[o]||a,r[o])}function k_(s,t,e){let n=this.cache,i=t.length,r=uc(e,i);Ze(n,r)||(s.uniform1iv(this.addr,r),Je(n,r));for(let a=0;a!==i;++a)e.setTexture3D(t[a]||Of,r[a])}function G_(s,t,e){let n=this.cache,i=t.length,r=uc(e,i);Ze(n,r)||(s.uniform1iv(this.addr,r),Je(n,r));for(let a=0;a!==i;++a)e.setTextureCube(t[a]||Bf,r[a])}function W_(s,t,e){let n=this.cache,i=t.length,r=uc(e,i);Ze(n,r)||(s.uniform1iv(this.addr,r),Je(n,r));for(let a=0;a!==i;++a)e.setTexture2DArray(t[a]||Ff,r[a])}function X_(s){switch(s){case 5126:return w_;case 35664:return A_;case 35665:return R_;case 35666:return C_;case 35674:return P_;case 35675:return I_;case 35676:return L_;case 5124:case 35670:return D_;case 35667:case 35671:return N_;case 35668:case 35672:return U_;case 35669:case 35673:return F_;case 5125:return O_;case 36294:return B_;case 36295:return z_;case 36296:return H_;case 35678:case 36198:case 36298:case 36306:case 35682:return V_;case 35679:case 36299:case 36307:return k_;case 35680:case 36300:case 36308:case 36293:return G_;case 36289:case 36303:case 36311:case 36292:return W_}}var tu=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=T_(e.type)}},eu=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=X_(e.type)}},nu=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let i=this.seq;for(let r=0,a=i.length;r!==a;++r){let o=i[r];o.setValue(t,e[o.id],n)}}},$h=/(\w+)(\])?(\[|\.)?/g;function Mf(s,t){s.seq.push(t),s.map[t.id]=t}function q_(s,t,e){let n=s.name,i=n.length;for($h.lastIndex=0;;){let r=$h.exec(n),a=$h.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){Mf(e,c===void 0?new tu(o,s,t):new eu(o,s,t));break}else{let u=e.map[o];u===void 0&&(u=new nu(o),Mf(e,u)),e=u}}}var yr=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);q_(o,l,this)}let i=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?i.push(a):r.push(a);i.length>0&&(this.seq=i.concat(r))}setValue(t,e,n,i){let r=this.map[e];r!==void 0&&r.setValue(t,n,i)}setOptional(t,e,n){let i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,i)}}static seqWithValue(t,e){let n=[];for(let i=0,r=t.length;i!==r;++i){let a=t[i];a.id in e&&n.push(a)}return n}};function Sf(s,t,e){let n=s.createShader(t);return s.shaderSource(n,e),s.compileShader(n),n}var Y_=37297,Z_=0;function J_(s,t){let e=s.split(`
`),n=[],i=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=i;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var bf=new Zt;function K_(s){ne._getMatrix(bf,ne.workingColorSpace,s);let t=`mat3( ${bf.elements.map(e=>e.toFixed(4))} )`;switch(ne.getTransfer(s)){case na:return[t,"LinearTransferOETF"];case de:return[t,"sRGBTransferOETF"];default:return Gt("WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function Ef(s,t,e){let n=s.getShaderParameter(t,s.COMPILE_STATUS),r=(s.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+J_(s.getShaderSource(t),o)}else return r}function $_(s,t){let e=K_(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var j_={[Ia]:"Linear",[La]:"Reinhard",[Da]:"Cineon",[Rs]:"ACESFilmic",[Ua]:"AgX",[Fa]:"Neutral",[Na]:"Custom"};function Q_(s,t){let e=j_[t];return e===void 0?(Gt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var oc=new w;function tv(){ne.getLuminanceCoefficients(oc);let s=oc.x.toFixed(4),t=oc.y.toFixed(4),e=oc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function ev(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Za).join(`
`)}function nv(s){let t=[];for(let e in s){let n=s[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function iv(s,t){let e={},n=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let r=s.getActiveAttrib(t,i),a=r.name,o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:s.getAttribLocation(t,a),locationSize:o}}return e}function Za(s){return s!==""}function Tf(s,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function wf(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var sv=/^[ \t]*#include +<([\w\d./]+)>/gm;function iu(s){return s.replace(sv,av)}var rv=new Map;function av(s,t){let e=te[t];if(e===void 0){let n=rv.get(t);if(n!==void 0)e=te[n],Gt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return iu(e)}var ov=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Af(s){return s.replace(ov,lv)}function lv(s,t,e,n){let i="";for(let r=parseInt(t);r<parseInt(e);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function Rf(s){let t=`precision ${s.precision} float;
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
#define LOW_PRECISION`),t}var cv={[ws]:"SHADOWMAP_TYPE_PCF",[mr]:"SHADOWMAP_TYPE_VSM"};function hv(s){return cv[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var uv={[is]:"ENVMAP_TYPE_CUBE",[Cs]:"ENVMAP_TYPE_CUBE",[Oa]:"ENVMAP_TYPE_CUBE_UV"};function dv(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":uv[s.envMapMode]||"ENVMAP_TYPE_CUBE"}var fv={[Cs]:"ENVMAP_MODE_REFRACTION"};function pv(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":fv[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var mv={[wh]:"ENVMAP_BLENDING_MULTIPLY",[Vd]:"ENVMAP_BLENDING_MIX",[kd]:"ENVMAP_BLENDING_ADD"};function gv(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":mv[s.combine]||"ENVMAP_BLENDING_NONE"}function xv(s){let t=s.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function _v(s,t,e,n){let i=s.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=hv(e),c=dv(e),h=pv(e),u=gv(e),d=xv(e),f=ev(e),m=nv(r),v=i.createProgram(),p,g,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Za).join(`
`),p.length>0&&(p+=`
`),g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Za).join(`
`),g.length>0&&(g+=`
`)):(p=[Rf(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Za).join(`
`),g=[Rf(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ii?"#define TONE_MAPPING":"",e.toneMapping!==ii?te.tonemapping_pars_fragment:"",e.toneMapping!==ii?Q_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",te.colorspace_pars_fragment,$_("linearToOutputTexel",e.outputColorSpace),tv(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Za).join(`
`)),a=iu(a),a=Tf(a,e),a=wf(a,e),o=iu(o),o=Tf(o,e),o=wf(o,e),a=Af(a),o=Af(o),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,g=["#define varying in",e.glslVersion===Nh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Nh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let T=x+p+a,M=x+g+o,b=Sf(i,i.VERTEX_SHADER,T),E=Sf(i,i.FRAGMENT_SHADER,M);i.attachShader(v,b),i.attachShader(v,E),e.index0AttributeName!==void 0?i.bindAttribLocation(v,0,e.index0AttributeName):e.hasPositionAttribute===!0&&i.bindAttribLocation(v,0,"position"),i.linkProgram(v);function P(N){if(s.debug.checkShaderErrors){let F=i.getProgramInfoLog(v)||"",H=i.getShaderInfoLog(b)||"",D=i.getShaderInfoLog(E)||"",z=F.trim(),J=H.trim(),Y=D.trim(),rt=!0,Z=!0;if(i.getProgramParameter(v,i.LINK_STATUS)===!1)if(rt=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,v,b,E);else{let tt=Ef(i,b,"vertex"),it=Ef(i,E,"fragment");Wt("WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(v,i.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+z+`
`+tt+`
`+it)}else z!==""?Gt("WebGLProgram: Program Info Log:",z):(J===""||Y==="")&&(Z=!1);Z&&(N.diagnostics={runnable:rt,programLog:z,vertexShader:{log:J,prefix:p},fragmentShader:{log:Y,prefix:g}})}i.deleteShader(b),i.deleteShader(E),y=new yr(i,v),A=iv(i,v)}let y;this.getUniforms=function(){return y===void 0&&P(this),y};let A;this.getAttributes=function(){return A===void 0&&P(this),A};let I=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return I===!1&&(I=i.getProgramParameter(v,Y_)),I},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Z_++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=b,this.fragmentShader=E,this}var vv=0,su=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let i=this._getShaderCacheForMaterial(t);return i.has(e)===!1&&(i.add(e),e.usedTimes++),i.has(n)===!1&&(i.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new ru(t),e.set(t,n)),n}},ru=class{constructor(t){this.id=vv++,this.code=t,this.usedTimes=0}};function yv(s){return s===as||s===Ga||s===Wa}function Mv(s,t,e,n,i,r){let a=new ra,o=new su,l=new Set,c=[],h=new Map,u=n.logarithmicDepthBuffer,d=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(y){return l.add(y),y===0?"uv":`uv${y}`}function v(y,A,I,N,F,H){let D=N.fog,z=F.geometry,J=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?N.environment:null,Y=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap,rt=t.get(y.envMap||J,Y),Z=rt&&rt.mapping===Oa?rt.image.height:null,tt=f[y.type];y.precision!==null&&(d=n.getMaxPrecision(y.precision),d!==y.precision&&Gt("WebGLProgram.getParameters:",y.precision,"not supported, using",d,"instead."));let it=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Et=it!==void 0?it.length:0,St=0;z.morphAttributes.position!==void 0&&(St=1),z.morphAttributes.normal!==void 0&&(St=2),z.morphAttributes.color!==void 0&&(St=3);let jt,Jt,$t,X;if(tt){let ce=gi[tt];jt=ce.vertexShader,Jt=ce.fragmentShader}else{jt=y.vertexShader,Jt=y.fragmentShader;let ce=o.getVertexShaderStage(y),he=o.getFragmentShaderStage(y);o.update(y,ce,he),$t=ce.id,X=he.id}let Q=s.getRenderTarget(),mt=s.state.buffers.depth.getReversed(),Bt=F.isInstancedMesh===!0,_t=F.isBatchedMesh===!0,Ht=!!y.map,ie=!!y.matcap,st=!!rt,ot=!!y.aoMap,ct=!!y.lightMap,ht=!!y.bumpMap&&y.wireframe===!1,ft=!!y.normalMap,Vt=!!y.displacementMap,zt=!!y.emissiveMap,kt=!!y.metalnessMap,Yt=!!y.roughnessMap,L=y.anisotropy>0,oe=y.clearcoat>0,Kt=y.dispersion>0,C=y.retroreflectivity>0,_=y.iridescence>0,O=y.sheen>0,W=y.transmission>0,K=L&&!!y.anisotropyMap,ut=oe&&!!y.clearcoatMap,dt=oe&&!!y.clearcoatNormalMap,$=oe&&!!y.clearcoatRoughnessMap,nt=_&&!!y.iridescenceMap,pt=_&&!!y.iridescenceThicknessMap,Nt=O&&!!y.sheenColorMap,xt=O&&!!y.sheenRoughnessMap,gt=!!y.specularMap,Dt=!!y.specularColorMap,Ft=!!y.specularIntensityMap,qt=W&&!!y.transmissionMap,R=W&&!!y.thicknessMap,V=!!y.gradientMap,B=!!y.alphaMap,j=y.alphaTest>0,at=!!y.alphaHash,et=!!y.extensions,wt=ii;y.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(wt=s.toneMapping);let At={shaderID:tt,shaderType:y.type,shaderName:y.name,vertexShader:jt,fragmentShader:Jt,defines:y.defines,customVertexShaderID:$t,customFragmentShaderID:X,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:d,batching:_t,batchingColor:_t&&F._colorsTexture!==null,instancing:Bt,instancingColor:Bt&&F.instanceColor!==null,instancingMorph:Bt&&F.morphTexture!==null,outputColorSpace:Q===null?s.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:ne.workingColorSpace,alphaToCoverage:!!y.alphaToCoverage,map:Ht,matcap:ie,envMap:st,envMapMode:st&&rt.mapping,envMapCubeUVHeight:Z,aoMap:ot,lightMap:ct,bumpMap:ht,normalMap:ft,displacementMap:Vt,emissiveMap:zt,normalMapObjectSpace:ft&&y.normalMapType===Xd,normalMapTangentSpace:ft&&y.normalMapType===ic,packedNormalMap:ft&&y.normalMapType===ic&&yv(y.normalMap.format),metalnessMap:kt,roughnessMap:Yt,anisotropy:L,anisotropyMap:K,clearcoat:oe,clearcoatMap:ut,clearcoatNormalMap:dt,clearcoatRoughnessMap:$,dispersion:Kt,retroreflection:C,iridescence:_,iridescenceMap:nt,iridescenceThicknessMap:pt,sheen:O,sheenColorMap:Nt,sheenRoughnessMap:xt,specularMap:gt,specularColorMap:Dt,specularIntensityMap:Ft,transmission:W,transmissionMap:qt,thicknessMap:R,gradientMap:V,opaque:y.transparent===!1&&y.blending===ns&&y.alphaToCoverage===!1,alphaMap:B,alphaTest:j,alphaHash:at,combine:y.combine,mapUv:Ht&&m(y.map.channel),aoMapUv:ot&&m(y.aoMap.channel),lightMapUv:ct&&m(y.lightMap.channel),bumpMapUv:ht&&m(y.bumpMap.channel),normalMapUv:ft&&m(y.normalMap.channel),displacementMapUv:Vt&&m(y.displacementMap.channel),emissiveMapUv:zt&&m(y.emissiveMap.channel),metalnessMapUv:kt&&m(y.metalnessMap.channel),roughnessMapUv:Yt&&m(y.roughnessMap.channel),anisotropyMapUv:K&&m(y.anisotropyMap.channel),clearcoatMapUv:ut&&m(y.clearcoatMap.channel),clearcoatNormalMapUv:dt&&m(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:$&&m(y.clearcoatRoughnessMap.channel),iridescenceMapUv:nt&&m(y.iridescenceMap.channel),iridescenceThicknessMapUv:pt&&m(y.iridescenceThicknessMap.channel),sheenColorMapUv:Nt&&m(y.sheenColorMap.channel),sheenRoughnessMapUv:xt&&m(y.sheenRoughnessMap.channel),specularMapUv:gt&&m(y.specularMap.channel),specularColorMapUv:Dt&&m(y.specularColorMap.channel),specularIntensityMapUv:Ft&&m(y.specularIntensityMap.channel),transmissionMapUv:qt&&m(y.transmissionMap.channel),thicknessMapUv:R&&m(y.thicknessMap.channel),alphaMapUv:B&&m(y.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(ft||L),vertexNormals:!!z.attributes.normal,vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!z.attributes.uv&&(Ht||B),fog:!!D,useFog:y.fog===!0,fogExp2:!!D&&D.isFogExp2,flatShading:y.wireframe===!1&&(y.flatShading===!0||z.attributes.normal===void 0&&ft===!1&&(y.isMeshLambertMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isMeshPhysicalMaterial)),sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:mt,skinning:F.isSkinnedMesh===!0,hasPositionAttribute:z.attributes.position!==void 0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:Et,morphTextureStride:St,numSunLights:A.sun.length,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numSunLightShadows:A.sunShadowMap.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:H.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:y.dithering,shadowMapEnabled:s.shadowMap.enabled&&I.length>0,shadowMapType:s.shadowMap.type,toneMapping:wt,decodeVideoTexture:Ht&&y.map.isVideoTexture===!0&&ne.getTransfer(y.map.colorSpace)===de,decodeVideoTextureEmissive:zt&&y.emissiveMap.isVideoTexture===!0&&ne.getTransfer(y.emissiveMap.colorSpace)===de,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Ie,flipSided:y.side===sn,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:et&&y.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(et&&y.extensions.multiDraw===!0||_t)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return At.vertexUv1s=l.has(1),At.vertexUv2s=l.has(2),At.vertexUv3s=l.has(3),l.clear(),At}function p(y){let A=[];if(y.shaderID?A.push(y.shaderID):(A.push(y.customVertexShaderID),A.push(y.customFragmentShaderID)),y.defines!==void 0)for(let I in y.defines)A.push(I),A.push(y.defines[I]);return y.isRawShaderMaterial===!1&&(g(A,y),x(A,y),A.push(s.outputColorSpace)),A.push(y.customProgramCacheKey),A.join()}function g(y,A){y.push(A.precision),y.push(A.outputColorSpace),y.push(A.envMapMode),y.push(A.envMapCubeUVHeight),y.push(A.mapUv),y.push(A.alphaMapUv),y.push(A.lightMapUv),y.push(A.aoMapUv),y.push(A.bumpMapUv),y.push(A.normalMapUv),y.push(A.displacementMapUv),y.push(A.emissiveMapUv),y.push(A.metalnessMapUv),y.push(A.roughnessMapUv),y.push(A.anisotropyMapUv),y.push(A.clearcoatMapUv),y.push(A.clearcoatNormalMapUv),y.push(A.clearcoatRoughnessMapUv),y.push(A.iridescenceMapUv),y.push(A.iridescenceThicknessMapUv),y.push(A.sheenColorMapUv),y.push(A.sheenRoughnessMapUv),y.push(A.specularMapUv),y.push(A.specularColorMapUv),y.push(A.specularIntensityMapUv),y.push(A.transmissionMapUv),y.push(A.thicknessMapUv),y.push(A.combine),y.push(A.fogExp2),y.push(A.sizeAttenuation),y.push(A.morphTargetsCount),y.push(A.morphAttributeCount),y.push(A.numSunLights),y.push(A.numDirLights),y.push(A.numPointLights),y.push(A.numSpotLights),y.push(A.numSpotLightMaps),y.push(A.numHemiLights),y.push(A.numRectAreaLights),y.push(A.numSunLightShadows),y.push(A.numDirLightShadows),y.push(A.numPointLightShadows),y.push(A.numSpotLightShadows),y.push(A.numSpotLightShadowsWithMaps),y.push(A.numLightProbes),y.push(A.shadowMapType),y.push(A.toneMapping),y.push(A.numClippingPlanes),y.push(A.numClipIntersection),y.push(A.depthPacking)}function x(y,A){a.disableAll(),A.instancing&&a.enable(0),A.instancingColor&&a.enable(1),A.instancingMorph&&a.enable(2),A.matcap&&a.enable(3),A.envMap&&a.enable(4),A.normalMapObjectSpace&&a.enable(5),A.normalMapTangentSpace&&a.enable(6),A.clearcoat&&a.enable(7),A.iridescence&&a.enable(8),A.alphaTest&&a.enable(9),A.vertexColors&&a.enable(10),A.vertexAlphas&&a.enable(11),A.vertexUv1s&&a.enable(12),A.vertexUv2s&&a.enable(13),A.vertexUv3s&&a.enable(14),A.vertexTangents&&a.enable(15),A.anisotropy&&a.enable(16),A.alphaHash&&a.enable(17),A.batching&&a.enable(18),A.dispersion&&a.enable(19),A.retroreflection&&a.enable(24),A.batchingColor&&a.enable(20),A.gradientMap&&a.enable(21),A.packedNormalMap&&a.enable(22),A.vertexNormals&&a.enable(23),y.push(a.mask),a.disableAll(),A.fog&&a.enable(0),A.useFog&&a.enable(1),A.flatShading&&a.enable(2),A.logarithmicDepthBuffer&&a.enable(3),A.reversedDepthBuffer&&a.enable(4),A.skinning&&a.enable(5),A.morphTargets&&a.enable(6),A.morphNormals&&a.enable(7),A.morphColors&&a.enable(8),A.premultipliedAlpha&&a.enable(9),A.shadowMapEnabled&&a.enable(10),A.doubleSided&&a.enable(11),A.flipSided&&a.enable(12),A.useDepthPacking&&a.enable(13),A.dithering&&a.enable(14),A.transmission&&a.enable(15),A.sheen&&a.enable(16),A.opaque&&a.enable(17),A.pointsUvs&&a.enable(18),A.decodeVideoTexture&&a.enable(19),A.decodeVideoTextureEmissive&&a.enable(20),A.alphaToCoverage&&a.enable(21),A.numLightProbeGrids>0&&a.enable(22),A.hasPositionAttribute&&a.enable(23),y.push(a.mask)}function T(y){let A=f[y.type],I;if(A){let N=gi[A];I=Di.clone(N.uniforms)}else I=y.uniforms;return I}function M(y,A){let I=h.get(A);return I!==void 0?++I.usedTimes:(I=new _v(s,A,y,i),c.push(I),h.set(A,I)),I}function b(y){if(--y.usedTimes===0){let A=c.indexOf(y);c[A]=c[c.length-1],c.pop(),h.delete(y.cacheKey),y.destroy()}}function E(y){o.remove(y)}function P(){o.dispose()}return{getParameters:v,getProgramCacheKey:p,getUniforms:T,acquireProgram:M,releaseProgram:b,releaseShaderCache:E,programs:c,dispose:P}}function Sv(){let s=new WeakMap;function t(a){return s.has(a)}function e(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function n(a){s.delete(a)}function i(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:r}}function bv(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.materialVariant!==t.materialVariant?s.materialVariant-t.materialVariant:s.z!==t.z?s.z-t.z:s.id-t.id}function Cf(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function Pf(){let s=[],t=0,e=[],n=[],i=[];function r(){t=0,e.length=0,n.length=0,i.length=0}function a(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function o(d,f,m,v,p,g){let x=s[t];return x===void 0?(x={id:d.id,object:d,geometry:f,material:m,materialVariant:a(d),groupOrder:v,renderOrder:d.renderOrder,z:p,group:g},s[t]=x):(x.id=d.id,x.object=d,x.geometry=f,x.material=m,x.materialVariant=a(d),x.groupOrder=v,x.renderOrder=d.renderOrder,x.z=p,x.group=g),t++,x}function l(d,f,m,v,p,g,x){x.reversedDepth===!0&&(p=-p);let T=o(d,f,m,v,p,g);m.transmission>0?n.push(T):m.transparent===!0?i.push(T):e.push(T)}function c(d,f,m,v,p,g){let x=o(d,f,m,v,p,g);m.transmission>0?n.unshift(x):m.transparent===!0?i.unshift(x):e.unshift(x)}function h(d,f){e.length>1&&e.sort(d||bv),n.length>1&&n.sort(f||Cf),i.length>1&&i.sort(f||Cf)}function u(){for(let d=t,f=s.length;d<f;d++){let m=s[d];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:e,transmissive:n,transparent:i,init:r,push:l,unshift:c,finish:u,sort:h}}function Ev(){let s=new WeakMap;function t(n,i){let r=s.get(n),a;return r===void 0?(a=new Pf,s.set(n,[a])):i>=r.length?(a=new Pf,r.push(a)):a=r[i],a}function e(){s=new WeakMap}return{get:t,dispose:e}}function Tv(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new w,color:new Ct};break;case"SpotLight":e={position:new w,direction:new w,color:new Ct,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new w,color:new Ct,distance:0,decay:0};break;case"HemisphereLight":e={direction:new w,skyColor:new Ct,groundColor:new Ct};break;case"RectAreaLight":e={color:new Ct,position:new w,halfWidth:new w,halfHeight:new w};break}return s[t.id]=e,e}}}function wv(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new lt,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}var Av=0;function Rv(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function Cv(s){let t=new Tv,e=wv(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new w);let i=new w,r=new me,a=new me;function o(c){let h=0,u=0,d=0;for(let F=0;F<9;F++)n.probe[F].set(0,0,0);let f=0,m=0,v=0,p=0,g=0,x=0,T=0,M=0,b=0,E=0,P=0,y=0,A=0,I=0;c.sort(Rv);for(let F=0,H=c.length;F<H;F++){let D=c[F],z=D.color,J=D.intensity,Y=D.distance,rt=null;if(D.shadow&&D.shadow.map&&(D.shadow.map.texture.format===as?rt=D.shadow.map.texture:rt=D.shadow.map.depthTexture||D.shadow.map.texture),D.isAmbientLight)h+=z.r*J,u+=z.g*J,d+=z.b*J;else if(D.isLightProbe){for(let Z=0;Z<9;Z++)n.probe[Z].addScaledVector(D.sh.coefficients[Z],J);I++}else if(D.isSunLight){let Z=t.get(D);if(Z.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let tt=D.shadow,it=e.get(D);it.shadowIntensity=tt.intensity,it.shadowBias=tt.bias,it.shadowNormalBias=tt.normalBias,it.shadowRadius=tt.radius,it.shadowMapSize.copy(tt.mapSize).multiply(tt.getFrameExtents()),n.sunShadow[m]=it,n.sunShadowMap[m]=rt;let Et=tt.getViewportCount();for(let St=0;St<Et;St++)n.sunShadowMatrix[v+St]=tt.getMatrix(St),n.sunShadowCascade[v+St]=tt._cascadeData[St];v+=Et,m++}n.sun[f]=Z,f++}else if(D.isDirectionalLight){let Z=t.get(D);if(Z.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let tt=D.shadow,it=e.get(D);it.shadowIntensity=tt.intensity,it.shadowBias=tt.bias,it.shadowNormalBias=tt.normalBias,it.shadowRadius=tt.radius,it.shadowMapSize=tt.mapSize,n.directionalShadow[p]=it,n.directionalShadowMap[p]=rt,n.directionalShadowMatrix[p]=D.shadow.matrix,b++}n.directional[p]=Z,p++}else if(D.isSpotLight){let Z=t.get(D);Z.position.setFromMatrixPosition(D.matrixWorld),Z.color.copy(z).multiplyScalar(J),Z.distance=Y,Z.coneCos=Math.cos(D.angle),Z.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),Z.decay=D.decay,n.spot[x]=Z;let tt=D.shadow;if(D.map&&(n.spotLightMap[y]=D.map,y++,tt.updateMatrices(D),D.castShadow&&A++),n.spotLightMatrix[x]=tt.matrix,D.castShadow){let it=e.get(D);it.shadowIntensity=tt.intensity,it.shadowBias=tt.bias,it.shadowNormalBias=tt.normalBias,it.shadowRadius=tt.radius,it.shadowMapSize=tt.mapSize,n.spotShadow[x]=it,n.spotShadowMap[x]=rt,P++}x++}else if(D.isRectAreaLight){let Z=t.get(D);Z.color.copy(z).multiplyScalar(J),Z.halfWidth.set(D.width*.5,0,0),Z.halfHeight.set(0,D.height*.5,0),n.rectArea[T]=Z,T++}else if(D.isPointLight){let Z=t.get(D);if(Z.color.copy(D.color).multiplyScalar(D.intensity),Z.distance=D.distance,Z.decay=D.decay,D.castShadow){let tt=D.shadow,it=e.get(D);it.shadowIntensity=tt.intensity,it.shadowBias=tt.bias,it.shadowNormalBias=tt.normalBias,it.shadowRadius=tt.radius,it.shadowMapSize=tt.mapSize,it.shadowCameraNear=tt.camera.near,it.shadowCameraFar=tt.camera.far,n.pointShadow[g]=it,n.pointShadowMap[g]=rt,n.pointShadowMatrix[g]=D.shadow.matrix,E++}n.point[g]=Z,g++}else if(D.isHemisphereLight){let Z=t.get(D);Z.skyColor.copy(D.color).multiplyScalar(J),Z.groundColor.copy(D.groundColor).multiplyScalar(J),n.hemi[M]=Z,M++}}T>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=vt.LTC_FLOAT_1,n.rectAreaLTC2=vt.LTC_FLOAT_2):(n.rectAreaLTC1=vt.LTC_HALF_1,n.rectAreaLTC2=vt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let N=n.hash;(N.sunLength!==f||N.directionalLength!==p||N.pointLength!==g||N.spotLength!==x||N.rectAreaLength!==T||N.hemiLength!==M||N.numSunShadows!==m||N.numDirectionalShadows!==b||N.numPointShadows!==E||N.numSpotShadows!==P||N.numSpotMaps!==y||N.numLightProbes!==I)&&(n.sun.length=f,n.directional.length=p,n.spot.length=x,n.rectArea.length=T,n.point.length=g,n.hemi.length=M,n.sunShadow.length=m,n.sunShadowMap.length=m,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.directionalShadowMatrix.length=b,n.pointShadow.length=E,n.pointShadowMap.length=E,n.pointShadowMatrix.length=E,n.spotShadow.length=P,n.spotShadowMap.length=P,n.spotLightMatrix.length=P+y-A,n.spotLightMap.length=y,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=I,N.sunLength=f,N.directionalLength=p,N.pointLength=g,N.spotLength=x,N.rectAreaLength=T,N.hemiLength=M,N.numSunShadows=m,N.numDirectionalShadows=b,N.numPointShadows=E,N.numSpotShadows=P,N.numSpotMaps=y,N.numLightProbes=I,n.version=Av++)}function l(c,h){let u=0,d=0,f=0,m=0,v=0,p=0,g=h.matrixWorldInverse;for(let x=0,T=c.length;x<T;x++){let M=c[x];if(M.isSunLight){let b=n.sun[u];b.direction.setFromMatrixPosition(M.matrixWorld),b.direction.transformDirection(g),u++}else if(M.isDirectionalLight){let b=n.directional[d];b.direction.setFromMatrixPosition(M.matrixWorld),i.setFromMatrixPosition(M.target.matrixWorld),b.direction.sub(i),b.direction.transformDirection(g),d++}else if(M.isSpotLight){let b=n.spot[m];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(g),b.direction.setFromMatrixPosition(M.matrixWorld),i.setFromMatrixPosition(M.target.matrixWorld),b.direction.sub(i),b.direction.transformDirection(g),m++}else if(M.isRectAreaLight){let b=n.rectArea[v];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(g),a.identity(),r.copy(M.matrixWorld),r.premultiply(g),a.extractRotation(r),b.halfWidth.set(M.width*.5,0,0),b.halfHeight.set(0,M.height*.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),v++}else if(M.isPointLight){let b=n.point[f];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(g),f++}else if(M.isHemisphereLight){let b=n.hemi[p];b.direction.setFromMatrixPosition(M.matrixWorld),b.direction.transformDirection(g),p++}}}return{setup:o,setupView:l,state:n}}function If(s){let t=new Cv(s),e=[],n=[],i=[];function r(d){u.camera=d,e.length=0,n.length=0,i.length=0}function a(d){e.push(d)}function o(d){n.push(d)}function l(d){i.push(d)}function c(){t.setup(e)}function h(d){t.setupView(e,d)}let u={lightsArray:e,shadowsArray:n,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function Pv(s){let t=new WeakMap;function e(i,r=0){let a=t.get(i),o;return a===void 0?(o=new If(s),t.set(i,[o])):r>=a.length?(o=new If(s),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var Iv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Lv=`uniform sampler2D shadow_pass;
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
}`,Dv=[new w(1,0,0),new w(-1,0,0),new w(0,1,0),new w(0,-1,0),new w(0,0,1),new w(0,0,-1)],Nv=[new w(0,-1,0),new w(0,-1,0),new w(0,0,1),new w(0,0,-1),new w(0,-1,0),new w(0,-1,0)],Lf=new me,Ya=new w,jh=new w;function Uv(s,t,e){let n=new cr,i=new lt,r=new lt,a=new Re,o=new nl,l=new il,c={},h=e.maxTextureSize,u={[es]:sn,[sn]:es,[Ie]:Ie},d=new Me({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new lt},radius:{value:4}},vertexShader:Iv,fragmentShader:Lv}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let m=new Ne;m.setAttribute("position",new en(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new bt(m,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ws;let g=this.type;this.render=function(E,P,y){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||E.length===0)return;this.type===Sd&&(Gt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=ws);let A=s.getRenderTarget(),I=s.getActiveCubeFace(),N=s.getActiveMipmapLevel(),F=s.state;F.setBlending(Gn),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let H=g!==this.type;H&&P.traverse(function(D){D.material&&(Array.isArray(D.material)?D.material.forEach(z=>z.needsUpdate=!0):D.material.needsUpdate=!0)});for(let D=0,z=E.length;D<z;D++){let J=E[D],Y=J.shadow;if(Y===void 0){Gt("WebGLShadowMap:",J,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;i.copy(Y.mapSize);let rt=Y.getFrameExtents();i.multiply(rt),r.copy(Y.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/rt.x),i.x=r.x*rt.x,Y.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/rt.y),i.y=r.y*rt.y,Y.mapSize.y=r.y));let Z=s.state.buffers.depth.getReversed();if(Y.camera._reversedDepth=Z,Y.map===null||H===!0){if(Y.map!==null&&(Y.map.depthTexture!==null&&(Y.map.depthTexture.dispose(),Y.map.depthTexture=null),Y.map.dispose()),this.type===mr){if(J.isPointLight){Gt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Y.map=new Ue(i.x,i.y,{format:as,type:Ye,minFilter:nn,magFilter:nn,generateMipmaps:!1}),Y.map.texture.name=J.name+".shadowMap",Y.map.depthTexture=new Ki(i.x,i.y,Wn),Y.map.depthTexture.name=J.name+".shadowMapDepth",Y.map.depthTexture.format=ui,Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=ke,Y.map.depthTexture.magFilter=ke}else J.isPointLight?(Y.map=new lc(i.x),Y.map.depthTexture=new Jo(i.x,si)):(Y.map=new Ue(i.x,i.y),Y.map.depthTexture=new Ki(i.x,i.y,si)),Y.map.depthTexture.name=J.name+".shadowMap",Y.map.depthTexture.format=ui,this.type===ws?(Y.map.depthTexture.compareFunction=Z?rc:sc,Y.map.depthTexture.minFilter=nn,Y.map.depthTexture.magFilter=nn):(Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=ke,Y.map.depthTexture.magFilter=ke);Y.camera.updateProjectionMatrix()}Y.map.isWebGLCubeRenderTarget!==!0&&(Y.map.width!==i.x||Y.map.height!==i.y)&&Y.map.setSize(i.x,i.y);let tt=Y.map.isWebGLCubeRenderTarget?6:Y.getViewportCount();J.isPointLight!==!0&&Y.updateMatrices(J,y);for(let it=0;it<tt;it++){let Et=Y.getCamera(it);if(J.isPointLight){let St=Y.camera,jt=Y.matrix,Jt=J.distance||St.far;Jt!==St.far&&(St.far=Jt,St.updateProjectionMatrix()),Ya.setFromMatrixPosition(J.matrixWorld),St.position.copy(Ya),jh.copy(St.position),jh.add(Dv[it]),St.up.copy(Nv[it]),St.lookAt(jh),St.updateMatrixWorld(),jt.makeTranslation(-Ya.x,-Ya.y,-Ya.z),Lf.multiplyMatrices(St.projectionMatrix,St.matrixWorldInverse),Y._frustum.setFromProjectionMatrix(Lf,St.coordinateSystem,St.reversedDepth)}if(Y.map.isWebGLCubeRenderTarget)s.setRenderTarget(Y.map,it),s.clear();else{it===0&&(s.setRenderTarget(Y.map),s.clear());let St=Y.getViewport(it);a.set(r.x*St.x,r.y*St.y,r.x*St.z,r.y*St.w),F.viewport(a)}n=Y.getFrustum(it),M(P,y,Et,J,this.type)}Y.isPointLightShadow!==!0&&this.type===mr&&x(Y,y),Y.needsUpdate=!1}g=this.type,p.needsUpdate=!1,s.setRenderTarget(A,I,N)};function x(E,P){let y=t.update(v);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null?E.mapPass=new Ue(i.x,i.y,{format:as,type:Ye}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),d.uniforms.shadow_pass.value=E.map.depthTexture,d.uniforms.resolution.value.set(E.map.width,E.map.height),d.uniforms.radius.value=E.radius,s.setRenderTarget(E.mapPass),s.clear(),s.renderBufferDirect(P,null,y,d,v,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value.set(E.map.width,E.map.height),f.uniforms.radius.value=E.radius,s.setRenderTarget(E.map),s.clear(),s.renderBufferDirect(P,null,y,f,v,null)}function T(E,P,y,A){let I=null,N=y.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(N!==void 0)I=N;else if(I=y.isPointLight===!0?l:o,s.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){let F=I.uuid,H=P.uuid,D=c[F];D===void 0&&(D={},c[F]=D);let z=D[H];z===void 0&&(z=I.clone(),D[H]=z,P.addEventListener("dispose",b)),I=z}if(I.visible=P.visible,I.wireframe=P.wireframe,A===mr?I.side=P.shadowSide!==null?P.shadowSide:P.side:I.side=P.shadowSide!==null?P.shadowSide:u[P.side],I.alphaMap=P.alphaMap,I.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,I.map=P.map,I.clipShadows=P.clipShadows,I.clippingPlanes=P.clippingPlanes,I.clipIntersection=P.clipIntersection,I.displacementMap=P.displacementMap,I.displacementScale=P.displacementScale,I.displacementBias=P.displacementBias,I.wireframeLinewidth=P.wireframeLinewidth,I.linewidth=P.linewidth,y.isPointLight===!0&&I.isMeshDistanceMaterial===!0){let F=s.properties.get(I);F.light=y}return I}function M(E,P,y,A,I){if(E.visible===!1)return;if(E.layers.test(P.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&I===mr)&&(!E.frustumCulled||E.intersectsFrustum(n))){E.modelViewMatrix.multiplyMatrices(y.matrixWorldInverse,E.matrixWorld);let H=t.update(E),D=E.material;if(Array.isArray(D)){let z=H.groups;for(let J=0,Y=z.length;J<Y;J++){let rt=z[J],Z=D[rt.materialIndex];if(Z&&Z.visible){let tt=T(E,Z,A,I);E.onBeforeShadow(s,E,P,y,H,tt,rt),s.renderBufferDirect(y,null,H,tt,E,rt),E.onAfterShadow(s,E,P,y,H,tt,rt)}}}else if(D.visible){let z=T(E,D,A,I);E.onBeforeShadow(s,E,P,y,H,z,null),s.renderBufferDirect(y,null,H,z,E,null),E.onAfterShadow(s,E,P,y,H,z,null)}}let F=E.children;for(let H=0,D=F.length;H<D;H++)M(F[H],P,y,A,I)}function b(E){E.target.removeEventListener("dispose",b);for(let y in c){let A=c[y],I=E.target.uuid;I in A&&(A[I].dispose(),delete A[I])}}}function Fv(s,t){function e(){let R=!1,V=new Re,B=null,j=new Re(0,0,0,0);return{setMask:function(at){B!==at&&!R&&(s.colorMask(at,at,at,at),B=at)},setLocked:function(at){R=at},setClear:function(at,et,wt,At,ce){ce===!0&&(at*=At,et*=At,wt*=At),V.set(at,et,wt,At),j.equals(V)===!1&&(s.clearColor(at,et,wt,At),j.copy(V))},reset:function(){R=!1,B=null,j.set(-1,0,0,0)}}}function n(){let R=!1,V=!1,B=null,j=null,at=null;return{setReversed:function(et){if(V!==et){let wt=t.get("EXT_clip_control");et?wt.clipControlEXT(wt.LOWER_LEFT_EXT,wt.ZERO_TO_ONE_EXT):wt.clipControlEXT(wt.LOWER_LEFT_EXT,wt.NEGATIVE_ONE_TO_ONE_EXT),V=et;let At=at;at=null,this.setClear(At)}},getReversed:function(){return V},setTest:function(et){et?Q(s.DEPTH_TEST):mt(s.DEPTH_TEST)},setMask:function(et){B!==et&&!R&&(s.depthMask(et),B=et)},setFunc:function(et){if(V&&(et=sf[et]),j!==et){switch(et){case Fo:s.depthFunc(s.NEVER);break;case Oo:s.depthFunc(s.ALWAYS);break;case Bo:s.depthFunc(s.LESS);break;case er:s.depthFunc(s.LEQUAL);break;case zo:s.depthFunc(s.EQUAL);break;case Ho:s.depthFunc(s.GEQUAL);break;case Vo:s.depthFunc(s.GREATER);break;case ko:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}j=et}},setLocked:function(et){R=et},setClear:function(et){at!==et&&(at=et,V&&(et=1-et),s.clearDepth(et))},reset:function(){R=!1,B=null,j=null,at=null,V=!1}}}function i(){let R=!1,V=null,B=null,j=null,at=null,et=null,wt=null,At=null,ce=null;return{setTest:function(he){R||(he?Q(s.STENCIL_TEST):mt(s.STENCIL_TEST))},setMask:function(he){V!==he&&!R&&(s.stencilMask(he),V=he)},setFunc:function(he,Sn,bn){(B!==he||j!==Sn||at!==bn)&&(s.stencilFunc(he,Sn,bn),B=he,j=Sn,at=bn)},setOp:function(he,Sn,bn){(et!==he||wt!==Sn||At!==bn)&&(s.stencilOp(he,Sn,bn),et=he,wt=Sn,At=bn)},setLocked:function(he){R=he},setClear:function(he){ce!==he&&(s.clearStencil(he),ce=he)},reset:function(){R=!1,V=null,B=null,j=null,at=null,et=null,wt=null,At=null,ce=null}}}let r=new e,a=new n,o=new i,l=new WeakMap,c=new WeakMap,h={},u={},d={},f=new WeakMap,m=[],v=null,p=!1,g=null,x=null,T=null,M=null,b=null,E=null,P=null,y=new Ct(0,0,0),A=0,I=!1,N=null,F=null,H=null,D=null,z=null,J=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,rt=0,Z=s.getParameter(s.VERSION);Z.indexOf("WebGL")!==-1?(rt=parseFloat(/^WebGL (\d)/.exec(Z)[1]),Y=rt>=1):Z.indexOf("OpenGL ES")!==-1&&(rt=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),Y=rt>=2);let tt=null,it={},Et=s.getParameter(s.SCISSOR_BOX),St=s.getParameter(s.VIEWPORT),jt=new Re().fromArray(Et),Jt=new Re().fromArray(St);function $t(R,V,B,j){let at=new Uint8Array(4),et=s.createTexture();s.bindTexture(R,et),s.texParameteri(R,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(R,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let wt=0;wt<B;wt++)R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY?s.texImage3D(V,0,s.RGBA,1,1,j,0,s.RGBA,s.UNSIGNED_BYTE,at):s.texImage2D(V+wt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,at);return et}let X={};X[s.TEXTURE_2D]=$t(s.TEXTURE_2D,s.TEXTURE_2D,1),X[s.TEXTURE_CUBE_MAP]=$t(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),X[s.TEXTURE_2D_ARRAY]=$t(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),X[s.TEXTURE_3D]=$t(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),Q(s.DEPTH_TEST),a.setFunc(er),ht(!1),ft(Mh),Q(s.CULL_FACE),ot(Gn);function Q(R){h[R]!==!0&&(s.enable(R),h[R]=!0)}function mt(R){h[R]!==!1&&(s.disable(R),h[R]=!1)}function Bt(R,V){return d[R]!==V?(s.bindFramebuffer(R,V),d[R]=V,R===s.DRAW_FRAMEBUFFER&&(d[s.FRAMEBUFFER]=V),R===s.FRAMEBUFFER&&(d[s.DRAW_FRAMEBUFFER]=V),!0):!1}function _t(R,V){let B=m,j=!1;if(R){B=f.get(V),B===void 0&&(B=[],f.set(V,B));let at=R.textures;if(B.length!==at.length||B[0]!==s.COLOR_ATTACHMENT0){for(let et=0,wt=at.length;et<wt;et++)B[et]=s.COLOR_ATTACHMENT0+et;B.length=at.length,j=!0}}else B[0]!==s.BACK&&(B[0]=s.BACK,j=!0);j&&s.drawBuffers(B)}function Ht(R){return v!==R?(s.useProgram(R),v=R,!0):!1}let ie={[As]:s.FUNC_ADD,[Ed]:s.FUNC_SUBTRACT,[Td]:s.FUNC_REVERSE_SUBTRACT};ie[wd]=s.MIN,ie[Ad]=s.MAX;let st={[Rd]:s.ZERO,[Cd]:s.ONE,[Pd]:s.SRC_COLOR,[Eh]:s.SRC_ALPHA,[Fd]:s.SRC_ALPHA_SATURATE,[Nd]:s.DST_COLOR,[Ld]:s.DST_ALPHA,[Id]:s.ONE_MINUS_SRC_COLOR,[Th]:s.ONE_MINUS_SRC_ALPHA,[Ud]:s.ONE_MINUS_DST_COLOR,[Dd]:s.ONE_MINUS_DST_ALPHA,[Od]:s.CONSTANT_COLOR,[Bd]:s.ONE_MINUS_CONSTANT_COLOR,[zd]:s.CONSTANT_ALPHA,[Hd]:s.ONE_MINUS_CONSTANT_ALPHA};function ot(R,V,B,j,at,et,wt,At,ce,he){if(R===Gn){p===!0&&(mt(s.BLEND),p=!1);return}if(p===!1&&(Q(s.BLEND),p=!0),R!==bd){if(R!==g||he!==I){if((x!==As||b!==As)&&(s.blendEquation(s.FUNC_ADD),x=As,b=As),he)switch(R){case ns:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case _n:s.blendFunc(s.ONE,s.ONE);break;case Sh:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case bh:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:Wt("WebGLState: Invalid blending: ",R);break}else switch(R){case ns:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case _n:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case Sh:Wt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case bh:Wt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Wt("WebGLState: Invalid blending: ",R);break}T=null,M=null,E=null,P=null,y.set(0,0,0),A=0,g=R,I=he}return}at=at||V,et=et||B,wt=wt||j,(V!==x||at!==b)&&(s.blendEquationSeparate(ie[V],ie[at]),x=V,b=at),(B!==T||j!==M||et!==E||wt!==P)&&(s.blendFuncSeparate(st[B],st[j],st[et],st[wt]),T=B,M=j,E=et,P=wt),(At.equals(y)===!1||ce!==A)&&(s.blendColor(At.r,At.g,At.b,ce),y.copy(At),A=ce),g=R,I=!1}function ct(R,V){R.side===Ie?mt(s.CULL_FACE):Q(s.CULL_FACE);let B=R.side===sn;V&&(B=!B),ht(B),R.blending===ns&&R.transparent===!1?ot(Gn):ot(R.blending,R.blendEquation,R.blendSrc,R.blendDst,R.blendEquationAlpha,R.blendSrcAlpha,R.blendDstAlpha,R.blendColor,R.blendAlpha,R.premultipliedAlpha),a.setFunc(R.depthFunc),a.setTest(R.depthTest),a.setMask(R.depthWrite),r.setMask(R.colorWrite);let j=R.stencilWrite;o.setTest(j),j&&(o.setMask(R.stencilWriteMask),o.setFunc(R.stencilFunc,R.stencilRef,R.stencilFuncMask),o.setOp(R.stencilFail,R.stencilZFail,R.stencilZPass)),zt(R.polygonOffset,R.polygonOffsetFactor,R.polygonOffsetUnits),R.alphaToCoverage===!0?Q(s.SAMPLE_ALPHA_TO_COVERAGE):mt(s.SAMPLE_ALPHA_TO_COVERAGE)}function ht(R){N!==R&&(R?s.frontFace(s.CW):s.frontFace(s.CCW),N=R)}function ft(R){R!==yd?(Q(s.CULL_FACE),R!==F&&(R===Mh?s.cullFace(s.BACK):R===Md?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):mt(s.CULL_FACE),F=R}function Vt(R){R!==H&&(Y&&s.lineWidth(R),H=R)}function zt(R,V,B){R?(Q(s.POLYGON_OFFSET_FILL),(D!==V||z!==B)&&(D=V,z=B,a.getReversed()&&(V=-V),s.polygonOffset(V,B))):mt(s.POLYGON_OFFSET_FILL)}function kt(R){R?Q(s.SCISSOR_TEST):mt(s.SCISSOR_TEST)}function Yt(R){R===void 0&&(R=s.TEXTURE0+J-1),tt!==R&&(s.activeTexture(R),tt=R)}function L(R,V,B){B===void 0&&(tt===null?B=s.TEXTURE0+J-1:B=tt);let j=it[B];j===void 0&&(j={type:void 0,texture:void 0},it[B]=j),(j.type!==R||j.texture!==V)&&(tt!==B&&(s.activeTexture(B),tt=B),s.bindTexture(R,V||X[R]),j.type=R,j.texture=V)}function oe(){let R=it[tt];R!==void 0&&R.type!==void 0&&(s.bindTexture(R.type,null),R.type=void 0,R.texture=void 0)}function Kt(){try{s.compressedTexImage2D(...arguments)}catch(R){Wt("WebGLState:",R)}}function C(){try{s.compressedTexImage3D(...arguments)}catch(R){Wt("WebGLState:",R)}}function _(){try{s.texSubImage2D(...arguments)}catch(R){Wt("WebGLState:",R)}}function O(){try{s.texSubImage3D(...arguments)}catch(R){Wt("WebGLState:",R)}}function W(){try{s.compressedTexSubImage2D(...arguments)}catch(R){Wt("WebGLState:",R)}}function K(){try{s.compressedTexSubImage3D(...arguments)}catch(R){Wt("WebGLState:",R)}}function ut(){try{s.texStorage2D(...arguments)}catch(R){Wt("WebGLState:",R)}}function dt(){try{s.texStorage3D(...arguments)}catch(R){Wt("WebGLState:",R)}}function $(){try{s.texImage2D(...arguments)}catch(R){Wt("WebGLState:",R)}}function nt(){try{s.texImage3D(...arguments)}catch(R){Wt("WebGLState:",R)}}function pt(R){return u[R]!==void 0?u[R]:s.getParameter(R)}function Nt(R,V){u[R]!==V&&(s.pixelStorei(R,V),u[R]=V)}function xt(R){jt.equals(R)===!1&&(s.scissor(R.x,R.y,R.z,R.w),jt.copy(R))}function gt(R){Jt.equals(R)===!1&&(s.viewport(R.x,R.y,R.z,R.w),Jt.copy(R))}function Dt(R,V){let B=c.get(V);B===void 0&&(B=new WeakMap,c.set(V,B));let j=B.get(R);j===void 0&&(j=s.getUniformBlockIndex(V,R.name),B.set(R,j))}function Ft(R,V){let j=c.get(V).get(R);l.get(V)!==j&&(s.uniformBlockBinding(V,j,R.__bindingPointIndex),l.set(V,j))}function qt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),h={},u={},tt=null,it={},d={},f=new WeakMap,m=[],v=null,p=!1,g=null,x=null,T=null,M=null,b=null,E=null,P=null,y=new Ct(0,0,0),A=0,I=!1,N=null,F=null,H=null,D=null,z=null,jt.set(0,0,s.canvas.width,s.canvas.height),Jt.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:Q,disable:mt,bindFramebuffer:Bt,drawBuffers:_t,useProgram:Ht,setBlending:ot,setMaterial:ct,setFlipSided:ht,setCullFace:ft,setLineWidth:Vt,setPolygonOffset:zt,setScissorTest:kt,activeTexture:Yt,bindTexture:L,unbindTexture:oe,compressedTexImage2D:Kt,compressedTexImage3D:C,texImage2D:$,texImage3D:nt,pixelStorei:Nt,getParameter:pt,updateUBOMapping:Dt,uniformBlockBinding:Ft,texStorage2D:ut,texStorage3D:dt,texSubImage2D:_,texSubImage3D:O,compressedTexSubImage2D:W,compressedTexSubImage3D:K,scissor:xt,viewport:gt,reset:qt}}function Ov(s,t,e,n,i,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new lt,h=new WeakMap,u=new Set,d,f=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(C,_){return m?new OffscreenCanvas(C,_):ia("canvas")}function p(C,_,O){let W=1,K=Kt(C);if((K.width>O||K.height>O)&&(W=O/Math.max(K.width,K.height)),W<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let ut=Math.floor(W*K.width),dt=Math.floor(W*K.height);d===void 0&&(d=v(ut,dt));let $=_?v(ut,dt):d;return $.width=ut,$.height=dt,$.getContext("2d").drawImage(C,0,0,ut,dt),Gt("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+ut+"x"+dt+")."),$}else return"data"in C&&Gt("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),C;return C}function g(C){return C.generateMipmaps}function x(C){s.generateMipmap(C)}function T(C){return C.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?s.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function M(C,_,O,W,K,ut=!1){if(C!==null){if(s[C]!==void 0)return s[C];Gt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let dt;W&&(dt=t.get("EXT_texture_norm16"),dt||Gt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let $=_;if(_===s.RED&&(O===s.FLOAT&&($=s.R32F),O===s.HALF_FLOAT&&($=s.R16F),O===s.UNSIGNED_BYTE&&($=s.R8),O===s.UNSIGNED_SHORT&&dt&&($=dt.R16_EXT),O===s.SHORT&&dt&&($=dt.R16_SNORM_EXT)),_===s.RED_INTEGER&&(O===s.UNSIGNED_BYTE&&($=s.R8UI),O===s.UNSIGNED_SHORT&&($=s.R16UI),O===s.UNSIGNED_INT&&($=s.R32UI),O===s.BYTE&&($=s.R8I),O===s.SHORT&&($=s.R16I),O===s.INT&&($=s.R32I)),_===s.RG&&(O===s.FLOAT&&($=s.RG32F),O===s.HALF_FLOAT&&($=s.RG16F),O===s.UNSIGNED_BYTE&&($=s.RG8),O===s.UNSIGNED_SHORT&&dt&&($=dt.RG16_EXT),O===s.SHORT&&dt&&($=dt.RG16_SNORM_EXT)),_===s.RG_INTEGER&&(O===s.UNSIGNED_BYTE&&($=s.RG8UI),O===s.UNSIGNED_SHORT&&($=s.RG16UI),O===s.UNSIGNED_INT&&($=s.RG32UI),O===s.BYTE&&($=s.RG8I),O===s.SHORT&&($=s.RG16I),O===s.INT&&($=s.RG32I)),_===s.RGB_INTEGER&&(O===s.UNSIGNED_BYTE&&($=s.RGB8UI),O===s.UNSIGNED_SHORT&&($=s.RGB16UI),O===s.UNSIGNED_INT&&($=s.RGB32UI),O===s.BYTE&&($=s.RGB8I),O===s.SHORT&&($=s.RGB16I),O===s.INT&&($=s.RGB32I)),_===s.RGBA_INTEGER&&(O===s.UNSIGNED_BYTE&&($=s.RGBA8UI),O===s.UNSIGNED_SHORT&&($=s.RGBA16UI),O===s.UNSIGNED_INT&&($=s.RGBA32UI),O===s.BYTE&&($=s.RGBA8I),O===s.SHORT&&($=s.RGBA16I),O===s.INT&&($=s.RGBA32I)),_===s.RGB&&(O===s.UNSIGNED_SHORT&&dt&&($=dt.RGB16_EXT),O===s.SHORT&&dt&&($=dt.RGB16_SNORM_EXT),O===s.UNSIGNED_INT_5_9_9_9_REV&&($=s.RGB9_E5),O===s.UNSIGNED_INT_10F_11F_11F_REV&&($=s.R11F_G11F_B10F)),_===s.RGBA){let nt=ut?na:ne.getTransfer(K);O===s.FLOAT&&($=s.RGBA32F),O===s.HALF_FLOAT&&($=s.RGBA16F),O===s.UNSIGNED_BYTE&&($=nt===de?s.SRGB8_ALPHA8:s.RGBA8),O===s.UNSIGNED_SHORT&&dt&&($=dt.RGBA16_EXT),O===s.SHORT&&dt&&($=dt.RGBA16_SNORM_EXT),O===s.UNSIGNED_SHORT_4_4_4_4&&($=s.RGBA4),O===s.UNSIGNED_SHORT_5_5_5_1&&($=s.RGB5_A1)}return($===s.R16F||$===s.R32F||$===s.RG16F||$===s.RG32F||$===s.RGBA16F||$===s.RGBA32F)&&t.get("EXT_color_buffer_float"),$}function b(C,_){let O;return C?_===null||_===si||_===xr?O=s.DEPTH24_STENCIL8:_===Wn?O=s.DEPTH32F_STENCIL8:_===gr&&(O=s.DEPTH24_STENCIL8,Gt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===si||_===xr?O=s.DEPTH_COMPONENT24:_===Wn?O=s.DEPTH_COMPONENT32F:_===gr&&(O=s.DEPTH_COMPONENT16),O}function E(C,_){return g(C)===!0||C.isFramebufferTexture&&C.minFilter!==ke&&C.minFilter!==nn?Math.log2(Math.max(_.width,_.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?_.mipmaps.length:1}function P(C){let _=C.target;_.removeEventListener("dispose",P),A(_),_.isVideoTexture&&h.delete(_),_.isHTMLTexture&&u.delete(_)}function y(C){let _=C.target;_.removeEventListener("dispose",y),N(_)}function A(C){let _=n.get(C);if(_.__webglInit===void 0)return;let O=C.source,W=f.get(O);if(W){let K=W[_.__cacheKey];K.usedTimes--,K.usedTimes===0&&I(C),Object.keys(W).length===0&&f.delete(O)}n.remove(C)}function I(C){let _=n.get(C);s.deleteTexture(_.__webglTexture);let O=C.source,W=f.get(O);delete W[_.__cacheKey],a.memory.textures--}function N(C){let _=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(_.__webglFramebuffer[W]))for(let K=0;K<_.__webglFramebuffer[W].length;K++)s.deleteFramebuffer(_.__webglFramebuffer[W][K]);else s.deleteFramebuffer(_.__webglFramebuffer[W]);_.__webglDepthbuffer&&s.deleteRenderbuffer(_.__webglDepthbuffer[W])}else{if(Array.isArray(_.__webglFramebuffer))for(let W=0;W<_.__webglFramebuffer.length;W++)s.deleteFramebuffer(_.__webglFramebuffer[W]);else s.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&s.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&s.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let W=0;W<_.__webglColorRenderbuffer.length;W++)_.__webglColorRenderbuffer[W]&&s.deleteRenderbuffer(_.__webglColorRenderbuffer[W]);_.__webglDepthRenderbuffer&&s.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let O=C.textures;for(let W=0,K=O.length;W<K;W++){let ut=n.get(O[W]);ut.__webglTexture&&(s.deleteTexture(ut.__webglTexture),a.memory.textures--),n.remove(O[W])}n.remove(C)}let F=0;function H(){F=0}function D(){return F}function z(C){F=C}function J(){let C=F;return C>=i.maxTextures&&Gt("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+i.maxTextures),F+=1,C}function Y(C){let _=[];return _.push(C.wrapS),_.push(C.wrapT),_.push(C.wrapR||0),_.push(C.magFilter),_.push(C.minFilter),_.push(C.anisotropy),_.push(C.internalFormat),_.push(C.format),_.push(C.type),_.push(C.generateMipmaps),_.push(C.premultiplyAlpha),_.push(C.flipY),_.push(C.unpackAlignment),_.push(C.colorSpace),_.join()}function rt(C,_){let O=n.get(C);if(C.isVideoTexture&&L(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&O.__version!==C.version){let W=C.image;if(W===null)Gt("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Gt("WebGLRenderer: Texture marked for update but image is incomplete");else{mt(O,C,_);return}}else C.isExternalTexture&&(O.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(s.TEXTURE_2D,O.__webglTexture,s.TEXTURE0+_)}function Z(C,_){let O=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&O.__version!==C.version){mt(O,C,_);return}else C.isExternalTexture&&(O.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(s.TEXTURE_2D_ARRAY,O.__webglTexture,s.TEXTURE0+_)}function tt(C,_){let O=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&O.__version!==C.version){mt(O,C,_);return}e.bindTexture(s.TEXTURE_3D,O.__webglTexture,s.TEXTURE0+_)}function it(C,_){let O=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&O.__version!==C.version){Bt(O,C,_);return}e.bindTexture(s.TEXTURE_CUBE_MAP,O.__webglTexture,s.TEXTURE0+_)}let Et={[nr]:s.REPEAT,[ci]:s.CLAMP_TO_EDGE,[Go]:s.MIRRORED_REPEAT},St={[ke]:s.NEAREST,[Gd]:s.NEAREST_MIPMAP_NEAREST,[Ba]:s.NEAREST_MIPMAP_LINEAR,[nn]:s.LINEAR,[vl]:s.LINEAR_MIPMAP_NEAREST,[ss]:s.LINEAR_MIPMAP_LINEAR},jt={[Yd]:s.NEVER,[jd]:s.ALWAYS,[Zd]:s.LESS,[sc]:s.LEQUAL,[Jd]:s.EQUAL,[rc]:s.GEQUAL,[Kd]:s.GREATER,[$d]:s.NOTEQUAL};function Jt(C,_){if(_.type===Wn&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===nn||_.magFilter===vl||_.magFilter===Ba||_.magFilter===ss||_.minFilter===nn||_.minFilter===vl||_.minFilter===Ba||_.minFilter===ss)&&Gt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(C,s.TEXTURE_WRAP_S,Et[_.wrapS]),s.texParameteri(C,s.TEXTURE_WRAP_T,Et[_.wrapT]),(C===s.TEXTURE_3D||C===s.TEXTURE_2D_ARRAY)&&s.texParameteri(C,s.TEXTURE_WRAP_R,Et[_.wrapR]),s.texParameteri(C,s.TEXTURE_MAG_FILTER,St[_.magFilter]),s.texParameteri(C,s.TEXTURE_MIN_FILTER,St[_.minFilter]),_.compareFunction&&(s.texParameteri(C,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(C,s.TEXTURE_COMPARE_FUNC,jt[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===ke||_.minFilter!==Ba&&_.minFilter!==ss||_.type===Wn&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){let O=t.get("EXT_texture_filter_anisotropic");s.texParameterf(C,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,i.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function $t(C,_){let O=!1;C.__webglInit===void 0&&(C.__webglInit=!0,_.addEventListener("dispose",P));let W=_.source,K=f.get(W);K===void 0&&(K={},f.set(W,K));let ut=Y(_);if(ut!==C.__cacheKey){K[ut]===void 0&&(K[ut]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,O=!0),K[ut].usedTimes++;let dt=K[C.__cacheKey];dt!==void 0&&(K[C.__cacheKey].usedTimes--,dt.usedTimes===0&&I(_)),C.__cacheKey=ut,C.__webglTexture=K[ut].texture}return O}function X(C,_,O){return Math.floor(Math.floor(C/O)/_)}function Q(C,_,O,W){let ut=C.updateRanges;if(ut.length===0)e.texSubImage2D(s.TEXTURE_2D,0,0,0,_.width,_.height,O,W,_.data);else{ut.sort((Nt,xt)=>Nt.start-xt.start);let dt=0;for(let Nt=1;Nt<ut.length;Nt++){let xt=ut[dt],gt=ut[Nt],Dt=xt.start+xt.count,Ft=X(gt.start,_.width,4),qt=X(xt.start,_.width,4);gt.start<=Dt+1&&Ft===qt&&X(gt.start+gt.count-1,_.width,4)===Ft?xt.count=Math.max(xt.count,gt.start+gt.count-xt.start):(++dt,ut[dt]=gt)}ut.length=dt+1;let $=e.getParameter(s.UNPACK_ROW_LENGTH),nt=e.getParameter(s.UNPACK_SKIP_PIXELS),pt=e.getParameter(s.UNPACK_SKIP_ROWS);e.pixelStorei(s.UNPACK_ROW_LENGTH,_.width);for(let Nt=0,xt=ut.length;Nt<xt;Nt++){let gt=ut[Nt],Dt=Math.floor(gt.start/4),Ft=Math.ceil(gt.count/4),qt=Dt%_.width,R=Math.floor(Dt/_.width),V=Ft,B=1;e.pixelStorei(s.UNPACK_SKIP_PIXELS,qt),e.pixelStorei(s.UNPACK_SKIP_ROWS,R),e.texSubImage2D(s.TEXTURE_2D,0,qt,R,V,B,O,W,_.data)}C.clearUpdateRanges(),e.pixelStorei(s.UNPACK_ROW_LENGTH,$),e.pixelStorei(s.UNPACK_SKIP_PIXELS,nt),e.pixelStorei(s.UNPACK_SKIP_ROWS,pt)}}function mt(C,_,O){let W=s.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(W=s.TEXTURE_2D_ARRAY),_.isData3DTexture&&(W=s.TEXTURE_3D);let K=$t(C,_),ut=_.source;e.bindTexture(W,C.__webglTexture,s.TEXTURE0+O);let dt=n.get(ut);if(ut.version!==dt.__version||K===!0){if(e.activeTexture(s.TEXTURE0+O),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let B=ne.getPrimaries(ne.workingColorSpace),j=_.colorSpace===Li?null:ne.getPrimaries(_.colorSpace),at=_.colorSpace===Li||B===j?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,at)}e.pixelStorei(s.UNPACK_ALIGNMENT,_.unpackAlignment);let nt=p(_.image,!1,i.maxTextureSize);nt=oe(_,nt);let pt=r.convert(_.format,_.colorSpace),Nt=r.convert(_.type),xt=M(_.internalFormat,pt,Nt,_.normalized,_.colorSpace,_.isVideoTexture);Jt(W,_);let gt,Dt=_.mipmaps,Ft=_.isVideoTexture!==!0,qt=dt.__version===void 0||K===!0,R=ut.dataReady,V=E(_,nt);if(_.isDepthTexture)xt=b(_.format===rs,_.type),qt&&(Ft?e.texStorage2D(s.TEXTURE_2D,1,xt,nt.width,nt.height):e.texImage2D(s.TEXTURE_2D,0,xt,nt.width,nt.height,0,pt,Nt,null));else if(_.isDataTexture)if(Dt.length>0){Ft&&qt&&e.texStorage2D(s.TEXTURE_2D,V,xt,Dt[0].width,Dt[0].height);for(let B=0,j=Dt.length;B<j;B++)gt=Dt[B],Ft?R&&e.texSubImage2D(s.TEXTURE_2D,B,0,0,gt.width,gt.height,pt,Nt,gt.data):e.texImage2D(s.TEXTURE_2D,B,xt,gt.width,gt.height,0,pt,Nt,gt.data);_.generateMipmaps=!1}else Ft?(qt&&e.texStorage2D(s.TEXTURE_2D,V,xt,nt.width,nt.height),R&&Q(_,nt,pt,Nt)):e.texImage2D(s.TEXTURE_2D,0,xt,nt.width,nt.height,0,pt,Nt,nt.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Ft&&qt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,V,xt,Dt[0].width,Dt[0].height,nt.depth);for(let B=0,j=Dt.length;B<j;B++)if(gt=Dt[B],_.format!==Xn)if(pt!==null)if(Ft){if(R)if(_.layerUpdates.size>0){let at=Vh(gt.width,gt.height,_.format,_.type);for(let et of _.layerUpdates){let wt=gt.data.subarray(et*at/gt.data.BYTES_PER_ELEMENT,(et+1)*at/gt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,B,0,0,et,gt.width,gt.height,1,pt,wt)}}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,B,0,0,0,gt.width,gt.height,nt.depth,pt,gt.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,B,xt,gt.width,gt.height,nt.depth,0,gt.data,0,0);else Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ft?R&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,B,0,0,0,gt.width,gt.height,nt.depth,pt,Nt,gt.data):e.texImage3D(s.TEXTURE_2D_ARRAY,B,xt,gt.width,gt.height,nt.depth,0,pt,Nt,gt.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{Ft&&qt&&e.texStorage2D(s.TEXTURE_2D,V,xt,Dt[0].width,Dt[0].height);for(let B=0,j=Dt.length;B<j;B++)gt=Dt[B],_.format!==Xn?pt!==null?Ft?R&&e.compressedTexSubImage2D(s.TEXTURE_2D,B,0,0,gt.width,gt.height,pt,gt.data):e.compressedTexImage2D(s.TEXTURE_2D,B,xt,gt.width,gt.height,0,gt.data):Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ft?R&&e.texSubImage2D(s.TEXTURE_2D,B,0,0,gt.width,gt.height,pt,Nt,gt.data):e.texImage2D(s.TEXTURE_2D,B,xt,gt.width,gt.height,0,pt,Nt,gt.data)}else if(_.isDataArrayTexture)if(Ft){if(qt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,V,xt,nt.width,nt.height,nt.depth),R)if(_.layerUpdates.size>0){let B=Vh(nt.width,nt.height,_.format,_.type);for(let j of _.layerUpdates){let at=nt.data.subarray(j*B/nt.data.BYTES_PER_ELEMENT,(j+1)*B/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,j,nt.width,nt.height,1,pt,Nt,at)}_.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,pt,Nt,nt.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,xt,nt.width,nt.height,nt.depth,0,pt,Nt,nt.data);else if(_.isData3DTexture)Ft?(qt&&e.texStorage3D(s.TEXTURE_3D,V,xt,nt.width,nt.height,nt.depth),R&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,pt,Nt,nt.data)):e.texImage3D(s.TEXTURE_3D,0,xt,nt.width,nt.height,nt.depth,0,pt,Nt,nt.data);else if(_.isFramebufferTexture){if(qt)if(Ft)e.texStorage2D(s.TEXTURE_2D,V,xt,nt.width,nt.height);else{let B=nt.width,j=nt.height;for(let at=0;at<V;at++)e.texImage2D(s.TEXTURE_2D,at,xt,B,j,0,pt,Nt,null),B>>=1,j>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in s){let B=s.canvas;if(B.hasAttribute("layoutsubtree")||B.setAttribute("layoutsubtree","true"),nt.parentNode!==B){B.appendChild(nt),u.add(_),B.onpaint=j=>{let at=j.changedElements;for(let et of u)at.includes(et.image)&&(et.needsUpdate=!0)},B.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,nt);else{let at=s.RGBA,et=s.RGBA,wt=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,at,et,wt,nt)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(Dt.length>0){if(Ft&&qt){let B=Kt(Dt[0]);e.texStorage2D(s.TEXTURE_2D,V,xt,B.width,B.height)}for(let B=0,j=Dt.length;B<j;B++)gt=Dt[B],Ft?R&&e.texSubImage2D(s.TEXTURE_2D,B,0,0,pt,Nt,gt):e.texImage2D(s.TEXTURE_2D,B,xt,pt,Nt,gt);_.generateMipmaps=!1}else if(Ft){if(qt){let B=Kt(nt);e.texStorage2D(s.TEXTURE_2D,V,xt,B.width,B.height)}R&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,pt,Nt,nt)}else e.texImage2D(s.TEXTURE_2D,0,xt,pt,Nt,nt);g(_)&&x(W),dt.__version=ut.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function Bt(C,_,O){if(_.image.length!==6)return;let W=$t(C,_),K=_.source;e.bindTexture(s.TEXTURE_CUBE_MAP,C.__webglTexture,s.TEXTURE0+O);let ut=n.get(K);if(K.version!==ut.__version||W===!0){e.activeTexture(s.TEXTURE0+O);let dt=ne.getPrimaries(ne.workingColorSpace),$=_.colorSpace===Li?null:ne.getPrimaries(_.colorSpace),nt=_.colorSpace===Li||dt===$?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(s.UNPACK_ALIGNMENT,_.unpackAlignment),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,nt);let pt=_.isCompressedTexture||_.image[0].isCompressedTexture,Nt=_.image[0]&&_.image[0].isDataTexture,xt=[];for(let et=0;et<6;et++)!pt&&!Nt?xt[et]=p(_.image[et],!0,i.maxCubemapSize):xt[et]=Nt?_.image[et].image:_.image[et],xt[et]=oe(_,xt[et]);let gt=xt[0],Dt=r.convert(_.format,_.colorSpace),Ft=r.convert(_.type),qt=M(_.internalFormat,Dt,Ft,_.normalized,_.colorSpace),R=_.isVideoTexture!==!0,V=ut.__version===void 0||W===!0,B=K.dataReady,j=E(_,gt);Jt(s.TEXTURE_CUBE_MAP,_);let at;if(pt){R&&V&&e.texStorage2D(s.TEXTURE_CUBE_MAP,j,qt,gt.width,gt.height);for(let et=0;et<6;et++){at=xt[et].mipmaps;for(let wt=0;wt<at.length;wt++){let At=at[wt];_.format!==Xn?Dt!==null?R?B&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+et,wt,0,0,At.width,At.height,Dt,At.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+et,wt,qt,At.width,At.height,0,At.data):Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):R?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+et,wt,0,0,At.width,At.height,Dt,Ft,At.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+et,wt,qt,At.width,At.height,0,Dt,Ft,At.data)}}}else{if(at=_.mipmaps,R&&V){at.length>0&&j++;let et=Kt(xt[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,j,qt,et.width,et.height)}for(let et=0;et<6;et++)if(Nt){R?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,0,0,xt[et].width,xt[et].height,Dt,Ft,xt[et].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,qt,xt[et].width,xt[et].height,0,Dt,Ft,xt[et].data);for(let wt=0;wt<at.length;wt++){let ce=at[wt].image[et].image;R?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+et,wt+1,0,0,ce.width,ce.height,Dt,Ft,ce.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+et,wt+1,qt,ce.width,ce.height,0,Dt,Ft,ce.data)}}else{R?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,0,0,Dt,Ft,xt[et]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+et,0,qt,Dt,Ft,xt[et]);for(let wt=0;wt<at.length;wt++){let At=at[wt];R?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+et,wt+1,0,0,Dt,Ft,At.image[et]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+et,wt+1,qt,Dt,Ft,At.image[et])}}}g(_)&&x(s.TEXTURE_CUBE_MAP),ut.__version=K.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function _t(C,_,O,W,K,ut){let dt=r.convert(O.format,O.colorSpace),$=r.convert(O.type),nt=M(O.internalFormat,dt,$,O.normalized,O.colorSpace),pt=n.get(_),Nt=n.get(O);if(Nt.__renderTarget=_,!pt.__hasExternalTextures){let xt=Math.max(1,_.width>>ut),gt=Math.max(1,_.height>>ut);K===s.TEXTURE_3D||K===s.TEXTURE_2D_ARRAY?e.texImage3D(K,ut,nt,xt,gt,_.depth,0,dt,$,null):e.texImage2D(K,ut,nt,xt,gt,0,dt,$,null)}e.bindFramebuffer(s.FRAMEBUFFER,C),Yt(_)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,W,K,Nt.__webglTexture,0,kt(_)):(K===s.TEXTURE_2D||K>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,W,K,Nt.__webglTexture,ut),e.bindFramebuffer(s.FRAMEBUFFER,null)}function Ht(C,_,O){if(s.bindRenderbuffer(s.RENDERBUFFER,C),_.depthBuffer){let W=_.depthTexture,K=W&&W.isDepthTexture?W.type:null,ut=b(_.stencilBuffer,K),dt=_.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;Yt(_)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,kt(_),ut,_.width,_.height):O?s.renderbufferStorageMultisample(s.RENDERBUFFER,kt(_),ut,_.width,_.height):s.renderbufferStorage(s.RENDERBUFFER,ut,_.width,_.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,dt,s.RENDERBUFFER,C)}else{let W=_.textures;for(let K=0;K<W.length;K++){let ut=W[K],dt=r.convert(ut.format,ut.colorSpace),$=r.convert(ut.type),nt=M(ut.internalFormat,dt,$,ut.normalized,ut.colorSpace);Yt(_)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,kt(_),nt,_.width,_.height):O?s.renderbufferStorageMultisample(s.RENDERBUFFER,kt(_),nt,_.width,_.height):s.renderbufferStorage(s.RENDERBUFFER,nt,_.width,_.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function ie(C,_,O){let W=_.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(s.FRAMEBUFFER,C),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let K=n.get(_.depthTexture);if(K.__renderTarget=_,(!K.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),W){if(K.__webglInit===void 0&&(K.__webglInit=!0,_.depthTexture.addEventListener("dispose",P)),K.__webglTexture===void 0){K.__webglTexture=s.createTexture(),e.bindTexture(s.TEXTURE_CUBE_MAP,K.__webglTexture),Jt(s.TEXTURE_CUBE_MAP,_.depthTexture);let pt=r.convert(_.depthTexture.format),Nt=r.convert(_.depthTexture.type),xt;_.depthTexture.format===ui?xt=s.DEPTH_COMPONENT24:_.depthTexture.format===rs&&(xt=s.DEPTH24_STENCIL8);for(let gt=0;gt<6;gt++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,xt,_.width,_.height,0,pt,Nt,null)}}else rt(_.depthTexture,0);let ut=K.__webglTexture,dt=kt(_),$=W?s.TEXTURE_CUBE_MAP_POSITIVE_X+O:s.TEXTURE_2D,nt=_.depthTexture.format===rs?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(_.depthTexture.format===ui)Yt(_)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,nt,$,ut,0,dt):s.framebufferTexture2D(s.FRAMEBUFFER,nt,$,ut,0);else if(_.depthTexture.format===rs)Yt(_)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,nt,$,ut,0,dt):s.framebufferTexture2D(s.FRAMEBUFFER,nt,$,ut,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function st(C){let _=n.get(C),O=C.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==C.depthTexture){let W=C.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),W){let K=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,W.removeEventListener("dispose",K)};W.addEventListener("dispose",K),_.__depthDisposeCallback=K}_.__boundDepthTexture=W}if(C.depthTexture&&!_.__autoAllocateDepthBuffer)if(O)for(let W=0;W<6;W++)ie(_.__webglFramebuffer[W],C,W);else{let W=C.texture.mipmaps;W&&W.length>0?ie(_.__webglFramebuffer[0],C,0):ie(_.__webglFramebuffer,C,0)}else if(O){_.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(e.bindFramebuffer(s.FRAMEBUFFER,_.__webglFramebuffer[W]),_.__webglDepthbuffer[W]===void 0)_.__webglDepthbuffer[W]=s.createRenderbuffer(),Ht(_.__webglDepthbuffer[W],C,!1);else{let K=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ut=_.__webglDepthbuffer[W];s.bindRenderbuffer(s.RENDERBUFFER,ut),s.framebufferRenderbuffer(s.FRAMEBUFFER,K,s.RENDERBUFFER,ut)}}else{let W=C.texture.mipmaps;if(W&&W.length>0?e.bindFramebuffer(s.FRAMEBUFFER,_.__webglFramebuffer[0]):e.bindFramebuffer(s.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=s.createRenderbuffer(),Ht(_.__webglDepthbuffer,C,!1);else{let K=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ut=_.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,ut),s.framebufferRenderbuffer(s.FRAMEBUFFER,K,s.RENDERBUFFER,ut)}}e.bindFramebuffer(s.FRAMEBUFFER,null)}function ot(C,_,O){let W=n.get(C);_!==void 0&&_t(W.__webglFramebuffer,C,C.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),O!==void 0&&st(C)}function ct(C){let _=C.texture,O=n.get(C),W=n.get(_);C.addEventListener("dispose",y);let K=C.textures,ut=C.isWebGLCubeRenderTarget===!0,dt=K.length>1;if(dt||(W.__webglTexture===void 0&&(W.__webglTexture=s.createTexture()),W.__version=_.version,a.memory.textures++),ut){O.__webglFramebuffer=[];for(let $=0;$<6;$++)if(_.mipmaps&&_.mipmaps.length>0){O.__webglFramebuffer[$]=[];for(let nt=0;nt<_.mipmaps.length;nt++)O.__webglFramebuffer[$][nt]=s.createFramebuffer()}else O.__webglFramebuffer[$]=s.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){O.__webglFramebuffer=[];for(let $=0;$<_.mipmaps.length;$++)O.__webglFramebuffer[$]=s.createFramebuffer()}else O.__webglFramebuffer=s.createFramebuffer();if(dt)for(let $=0,nt=K.length;$<nt;$++){let pt=n.get(K[$]);pt.__webglTexture===void 0&&(pt.__webglTexture=s.createTexture(),a.memory.textures++)}if(C.samples>0&&Yt(C)===!1){O.__webglMultisampledFramebuffer=s.createFramebuffer(),O.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let $=0;$<K.length;$++){let nt=K[$];O.__webglColorRenderbuffer[$]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,O.__webglColorRenderbuffer[$]);let pt=r.convert(nt.format,nt.colorSpace),Nt=r.convert(nt.type),xt=M(nt.internalFormat,pt,Nt,nt.normalized,nt.colorSpace,C.isXRRenderTarget===!0),gt=kt(C);s.renderbufferStorageMultisample(s.RENDERBUFFER,gt,xt,C.width,C.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+$,s.RENDERBUFFER,O.__webglColorRenderbuffer[$])}s.bindRenderbuffer(s.RENDERBUFFER,null),C.depthBuffer&&(O.__webglDepthRenderbuffer=s.createRenderbuffer(),Ht(O.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(ut){e.bindTexture(s.TEXTURE_CUBE_MAP,W.__webglTexture),Jt(s.TEXTURE_CUBE_MAP,_);for(let $=0;$<6;$++)if(_.mipmaps&&_.mipmaps.length>0)for(let nt=0;nt<_.mipmaps.length;nt++)_t(O.__webglFramebuffer[$][nt],C,_,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+$,nt);else _t(O.__webglFramebuffer[$],C,_,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+$,0);g(_)&&x(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(dt){for(let $=0,nt=K.length;$<nt;$++){let pt=K[$],Nt=n.get(pt),xt=s.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(xt=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(xt,Nt.__webglTexture),Jt(xt,pt),_t(O.__webglFramebuffer,C,pt,s.COLOR_ATTACHMENT0+$,xt,0),g(pt)&&x(xt)}e.unbindTexture()}else{let $=s.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&($=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture($,W.__webglTexture),Jt($,_),_.mipmaps&&_.mipmaps.length>0)for(let nt=0;nt<_.mipmaps.length;nt++)_t(O.__webglFramebuffer[nt],C,_,s.COLOR_ATTACHMENT0,$,nt);else _t(O.__webglFramebuffer,C,_,s.COLOR_ATTACHMENT0,$,0);g(_)&&x($),e.unbindTexture()}C.depthBuffer&&st(C)}function ht(C){let _=C.textures;for(let O=0,W=_.length;O<W;O++){let K=_[O];if(g(K)){let ut=T(C),dt=n.get(K).__webglTexture;e.bindTexture(ut,dt),x(ut),e.unbindTexture()}}}let ft=[],Vt=[];function zt(C){if(C.samples>0){if(Yt(C)===!1){let _=C.textures,O=C.width,W=C.height,K=s.COLOR_BUFFER_BIT,ut=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,dt=n.get(C),$=_.length>1;if($)for(let pt=0;pt<_.length;pt++)e.bindFramebuffer(s.FRAMEBUFFER,dt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+pt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,dt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+pt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,dt.__webglMultisampledFramebuffer);let nt=C.texture.mipmaps;nt&&nt.length>0?e.bindFramebuffer(s.DRAW_FRAMEBUFFER,dt.__webglFramebuffer[0]):e.bindFramebuffer(s.DRAW_FRAMEBUFFER,dt.__webglFramebuffer);for(let pt=0;pt<_.length;pt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(K|=s.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(K|=s.STENCIL_BUFFER_BIT)),$){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,dt.__webglColorRenderbuffer[pt]);let Nt=n.get(_[pt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Nt,0)}s.blitFramebuffer(0,0,O,W,0,0,O,W,K,s.NEAREST),l===!0&&(ft.length=0,Vt.length=0,ft.push(s.COLOR_ATTACHMENT0+pt),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(ft.push(ut),Vt.push(ut),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Vt)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,ft))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),$)for(let pt=0;pt<_.length;pt++){e.bindFramebuffer(s.FRAMEBUFFER,dt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+pt,s.RENDERBUFFER,dt.__webglColorRenderbuffer[pt]);let Nt=n.get(_[pt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,dt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+pt,s.TEXTURE_2D,Nt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,dt.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let _=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[_])}}}function kt(C){return Math.min(i.maxSamples,C.samples)}function Yt(C){let _=n.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function L(C){let _=a.render.frame;h.get(C)!==_&&(h.set(C,_),C.update())}function oe(C,_){let O=C.colorSpace,W=C.format,K=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||O!==ea&&O!==Li&&(ne.getTransfer(O)===de?(W!==Xn||K!==Tn)&&Gt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Wt("WebGLTextures: Unsupported texture color space:",O)),_}function Kt(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=J,this.resetTextureUnits=H,this.getTextureUnits=D,this.setTextureUnits=z,this.setTexture2D=rt,this.setTexture2DArray=Z,this.setTexture3D=tt,this.setTextureCube=it,this.rebindTextures=ot,this.setupRenderTarget=ct,this.updateRenderTargetMipmap=ht,this.updateMultisampleRenderTarget=zt,this.setupDepthRenderbuffer=st,this.setupFrameBufferTexture=_t,this.useMultisampledRTT=Yt,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function Bv(s,t){function e(n,i=Li){let r,a=ne.getTransfer(i);if(n===Tn)return s.UNSIGNED_BYTE;if(n===Ml)return s.UNSIGNED_SHORT_4_4_4_4;if(n===Sl)return s.UNSIGNED_SHORT_5_5_5_1;if(n===Ph)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===Ih)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===Rh)return s.BYTE;if(n===Ch)return s.SHORT;if(n===gr)return s.UNSIGNED_SHORT;if(n===yl)return s.INT;if(n===si)return s.UNSIGNED_INT;if(n===Wn)return s.FLOAT;if(n===Ye)return s.HALF_FLOAT;if(n===Lh)return s.ALPHA;if(n===Dh)return s.RGB;if(n===Xn)return s.RGBA;if(n===ui)return s.DEPTH_COMPONENT;if(n===rs)return s.DEPTH_STENCIL;if(n===bl)return s.RED;if(n===El)return s.RED_INTEGER;if(n===as)return s.RG;if(n===Tl)return s.RG_INTEGER;if(n===wl)return s.RGBA_INTEGER;if(n===za||n===Ha||n===Va||n===ka)if(a===de)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===za)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ha)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Va)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ka)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===za)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ha)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Va)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ka)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Al||n===Rl||n===Cl||n===Pl)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Al)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Rl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Cl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Pl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Il||n===Ll||n===Dl||n===Nl||n===Ul||n===Ga||n===Fl)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Il||n===Ll)return a===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Dl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Nl)return r.COMPRESSED_R11_EAC;if(n===Ul)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Ga)return r.COMPRESSED_RG11_EAC;if(n===Fl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ol||n===Bl||n===zl||n===Hl||n===Vl||n===kl||n===Gl||n===Wl||n===Xl||n===ql||n===Yl||n===Zl||n===Jl||n===Kl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ol)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Bl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===zl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Hl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Vl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===kl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Gl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Wl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Xl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ql)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Yl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Zl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Jl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Kl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===$l||n===jl||n===Ql)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===$l)return a===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===jl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ql)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===tc||n===ec||n===Wa||n===nc)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===tc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ec)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Wa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===nc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===xr?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:e}}var zv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Hv=`
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

}`,au=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new ua(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new Me({vertexShader:zv,fragmentShader:Hv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new bt(new En(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ou=class extends di{constructor(t,e){super();let n=this,i=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,m=null,v=typeof XRWebGLBinding<"u",p=new au,g={},x=e.getContextAttributes(),T=null,M=null,b=[],E=[],P=new lt,y=null,A=null,I=new Xe;I.viewport=new Re;let N=new Xe;N.viewport=new Re;let F=[I,N],H=new ml,D=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let Q=b[X];return Q===void 0&&(Q=new or,b[X]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(X){let Q=b[X];return Q===void 0&&(Q=new or,b[X]=Q),Q.getGripSpace()},this.getHand=function(X){let Q=b[X];return Q===void 0&&(Q=new or,b[X]=Q),Q.getHandSpace()};function J(X){let Q=E.indexOf(X.inputSource);if(Q===-1)return;let mt=b[Q];mt!==void 0&&(mt.update(X.inputSource,X.frame,c||a),mt.dispatchEvent({type:X.type,data:X.inputSource}))}function Y(){i.removeEventListener("select",J),i.removeEventListener("selectstart",J),i.removeEventListener("selectend",J),i.removeEventListener("squeeze",J),i.removeEventListener("squeezestart",J),i.removeEventListener("squeezeend",J),i.removeEventListener("end",Y),i.removeEventListener("inputsourceschange",rt);for(let X=0;X<b.length;X++){let Q=E[X];Q!==null&&(E[X]=null,b[X].disconnect(Q))}D=null,z=null,p.reset();for(let X in g)delete g[X];if(t.setRenderTarget(T),f=null,d=null,u=null,i=null,M=null,$t.stop(),n.isPresenting=!1,t.setPixelRatio(y),t.setSize(P.width,P.height,!1),A!==null){let X=A.camera;X.fov=A.fov,X.zoom=A.zoom,X.updateProjectionMatrix(),A=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,n.isPresenting===!0&&Gt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){o=X,n.isPresenting===!0&&Gt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&v&&(u=new XRWebGLBinding(i,e)),u},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(X){if(i=X,i!==null){if(T=t.getRenderTarget(),i.addEventListener("select",J),i.addEventListener("selectstart",J),i.addEventListener("selectend",J),i.addEventListener("squeeze",J),i.addEventListener("squeezestart",J),i.addEventListener("squeezeend",J),i.addEventListener("end",Y),i.addEventListener("inputsourceschange",rt),x.xrCompatible!==!0&&await e.makeXRCompatible(),y=t.getPixelRatio(),t.getSize(P),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let mt=null,Bt=null,_t=null;x.depth&&(_t=x.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,mt=x.stencil?rs:ui,Bt=x.stencil?xr:si);let Ht={colorFormat:e.RGBA8,depthFormat:_t,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Ht),i.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),M=new Ue(d.textureWidth,d.textureHeight,{format:Xn,type:Tn,depthTexture:new Ki(d.textureWidth,d.textureHeight,Bt,void 0,void 0,void 0,void 0,void 0,void 0,mt),stencilBuffer:x.stencil,colorSpace:t.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let mt={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,e,mt),i.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),M=new Ue(f.framebufferWidth,f.framebufferHeight,{format:Xn,type:Tn,colorSpace:t.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),$t.setContext(i),$t.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function rt(X){for(let Q=0;Q<X.removed.length;Q++){let mt=X.removed[Q],Bt=E.indexOf(mt);Bt>=0&&(E[Bt]=null,b[Bt].disconnect(mt))}for(let Q=0;Q<X.added.length;Q++){let mt=X.added[Q],Bt=E.indexOf(mt);if(Bt===-1){for(let Ht=0;Ht<b.length;Ht++)if(Ht>=E.length){E.push(mt),Bt=Ht;break}else if(E[Ht]===null){E[Ht]=mt,Bt=Ht;break}if(Bt===-1)break}let _t=b[Bt];_t&&_t.connect(mt)}}let Z=new w,tt=new w;function it(X,Q,mt){Z.setFromMatrixPosition(Q.matrixWorld),tt.setFromMatrixPosition(mt.matrixWorld);let Bt=Z.distanceTo(tt),_t=Q.projectionMatrix.elements,Ht=mt.projectionMatrix.elements,ie=_t[14]/(_t[10]-1),st=_t[14]/(_t[10]+1),ot=(_t[9]+1)/_t[5],ct=(_t[9]-1)/_t[5],ht=(_t[8]-1)/_t[0],ft=(Ht[8]+1)/Ht[0],Vt=ie*ht,zt=ie*ft,kt=Bt/(-ht+ft),Yt=kt*-ht;if(Q.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(Yt),X.translateZ(kt),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),_t[10]===-1)X.projectionMatrix.copy(Q.projectionMatrix),X.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{let L=ie+kt,oe=st+kt,Kt=Vt-Yt,C=zt+(Bt-Yt),_=ot*st/oe*L,O=ct*st/oe*L;X.projectionMatrix.makePerspective(Kt,C,_,O,L,oe),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function Et(X,Q){Q===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(Q.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(i===null)return;let Q=X.near,mt=X.far;p.texture!==null&&(p.depthNear>0&&(Q=p.depthNear),p.depthFar>0&&(mt=p.depthFar)),H.near=N.near=I.near=Q,H.far=N.far=I.far=mt,(D!==H.near||z!==H.far)&&(i.updateRenderState({depthNear:H.near,depthFar:H.far}),D=H.near,z=H.far),H.layers.mask=X.layers.mask|6,I.layers.mask=H.layers.mask&-5,N.layers.mask=H.layers.mask&-3;let Bt=X.parent,_t=H.cameras;Et(H,Bt);for(let Ht=0;Ht<_t.length;Ht++)Et(_t[Ht],Bt);_t.length===2?it(H,I,N):H.projectionMatrix.copy(I.projectionMatrix),A===null&&X.isPerspectiveCamera&&(A={camera:X,fov:X.fov,zoom:X.zoom}),St(X,H,Bt)};function St(X,Q,mt){mt===null?X.matrix.copy(Q.matrixWorld):(X.matrix.copy(mt.matrixWorld),X.matrix.invert(),X.matrix.multiply(Q.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(Q.projectionMatrix),X.projectionMatrixInverse.copy(Q.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=rr*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return H},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(X){l=X,d!==null&&(d.fixedFoveation=X),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=X)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(H)},this.getCameraTexture=function(X){return g[X]};let jt=null;function Jt(X,Q){if(h=Q.getViewerPose(c||a),m=Q,h!==null){let mt=h.views;f!==null&&(t.setRenderTargetFramebuffer(M,f.framebuffer),t.setRenderTarget(M));let Bt=!1;mt.length!==H.cameras.length&&(H.cameras.length=0,Bt=!0);for(let st=0;st<mt.length;st++){let ot=mt[st],ct=null;if(f!==null)ct=f.getViewport(ot);else{let ft=u.getViewSubImage(d,ot);ct=ft.viewport,st===0&&(t.setRenderTargetTextures(M,ft.colorTexture,ft.depthStencilTexture),t.setRenderTarget(M))}let ht=F[st];ht===void 0&&(ht=new Xe,ht.layers.enable(st),ht.viewport=new Re,F[st]=ht),ht.matrix.fromArray(ot.transform.matrix),ht.matrix.decompose(ht.position,ht.quaternion,ht.scale),ht.projectionMatrix.fromArray(ot.projectionMatrix),ht.projectionMatrixInverse.copy(ht.projectionMatrix).invert(),ht.viewport.set(ct.x,ct.y,ct.width,ct.height),st===0&&(H.matrix.copy(ht.matrix),H.matrix.decompose(H.position,H.quaternion,H.scale)),Bt===!0&&H.cameras.push(ht)}let _t=i.enabledFeatures;if(_t&&_t.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&v){u=n.getBinding();let st=u.getDepthInformation(mt[0]);st&&st.isValid&&st.texture&&p.init(st,i.renderState)}if(_t&&_t.includes("camera-access")&&v){t.state.unbindTexture(),u=n.getBinding();for(let st=0;st<mt.length;st++){let ot=mt[st].camera;if(ot){let ct=g[ot];ct||(ct=new ua,g[ot]=ct);let ht=u.getCameraImage(ot);ct.sourceTexture=ht}}}}for(let mt=0;mt<b.length;mt++){let Bt=E[mt],_t=b[mt];Bt!==null&&_t!==void 0&&_t.update(Bt,Q,c||a)}jt&&jt(X,Q),Q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Q}),m=null}let $t=new Df;$t.setAnimationLoop(Jt),this.setAnimationLoop=function(X){jt=X},this.dispose=function(){}}},Vv=new me,zf=new Zt;zf.set(-1,0,0,0,1,0,0,0,1);function kv(s,t){function e(p,g){p.matrixAutoUpdate===!0&&p.updateMatrix(),g.value.copy(p.matrix)}function n(p,g){g.color.getRGB(p.fogColor.value,Bh(s)),g.isFog?(p.fogNear.value=g.near,p.fogFar.value=g.far):g.isFogExp2&&(p.fogDensity.value=g.density)}function i(p,g,x,T,M){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(p,g):g.isMeshLambertMaterial?(r(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(p,g),u(p,g)):g.isMeshPhongMaterial?(r(p,g),h(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(p,g),d(p,g),g.isMeshPhysicalMaterial&&f(p,g,M)):g.isMeshMatcapMaterial?(r(p,g),m(p,g)):g.isMeshDepthMaterial?r(p,g):g.isMeshDistanceMaterial?(r(p,g),v(p,g)):g.isMeshNormalMaterial?r(p,g):g.isLineBasicMaterial?(a(p,g),g.isLineDashedMaterial&&o(p,g)):g.isPointsMaterial?l(p,g,x,T):g.isSpriteMaterial?c(p,g):g.isShadowMaterial?(p.color.value.copy(g.color),p.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(p,g){p.opacity.value=g.opacity,g.color&&p.diffuse.value.copy(g.color),g.emissive&&p.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(p.map.value=g.map,e(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,e(g.alphaMap,p.alphaMapTransform)),g.bumpMap&&(p.bumpMap.value=g.bumpMap,e(g.bumpMap,p.bumpMapTransform),p.bumpScale.value=g.bumpScale,g.side===sn&&(p.bumpScale.value*=-1)),g.normalMap&&(p.normalMap.value=g.normalMap,e(g.normalMap,p.normalMapTransform),p.normalScale.value.copy(g.normalScale),g.side===sn&&p.normalScale.value.negate()),g.displacementMap&&(p.displacementMap.value=g.displacementMap,e(g.displacementMap,p.displacementMapTransform),p.displacementScale.value=g.displacementScale,p.displacementBias.value=g.displacementBias),g.emissiveMap&&(p.emissiveMap.value=g.emissiveMap,e(g.emissiveMap,p.emissiveMapTransform)),g.specularMap&&(p.specularMap.value=g.specularMap,e(g.specularMap,p.specularMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest);let x=t.get(g),T=x.envMap,M=x.envMapRotation;T&&(p.envMap.value=T,p.envMapRotation.value.setFromMatrix4(Vv.makeRotationFromEuler(M)).transpose(),T.isCubeTexture&&T.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(zf),p.reflectivity.value=g.reflectivity,p.ior.value=g.ior,p.refractionRatio.value=g.refractionRatio),g.lightMap&&(p.lightMap.value=g.lightMap,p.lightMapIntensity.value=g.lightMapIntensity,e(g.lightMap,p.lightMapTransform)),g.aoMap&&(p.aoMap.value=g.aoMap,p.aoMapIntensity.value=g.aoMapIntensity,e(g.aoMap,p.aoMapTransform))}function a(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,g.map&&(p.map.value=g.map,e(g.map,p.mapTransform))}function o(p,g){p.dashSize.value=g.dashSize,p.totalSize.value=g.dashSize+g.gapSize,p.scale.value=g.scale}function l(p,g,x,T){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.size.value=g.size*x,p.scale.value=T*.5,g.map&&(p.map.value=g.map,e(g.map,p.uvTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,e(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function c(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.rotation.value=g.rotation,g.map&&(p.map.value=g.map,e(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,e(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function h(p,g){p.specular.value.copy(g.specular),p.shininess.value=Math.max(g.shininess,1e-4)}function u(p,g){g.gradientMap&&(p.gradientMap.value=g.gradientMap)}function d(p,g){p.metalness.value=g.metalness,g.metalnessMap&&(p.metalnessMap.value=g.metalnessMap,e(g.metalnessMap,p.metalnessMapTransform)),p.roughness.value=g.roughness,g.roughnessMap&&(p.roughnessMap.value=g.roughnessMap,e(g.roughnessMap,p.roughnessMapTransform)),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)}function f(p,g,x){p.ior.value=g.ior,g.sheen>0&&(p.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),p.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(p.sheenColorMap.value=g.sheenColorMap,e(g.sheenColorMap,p.sheenColorMapTransform)),g.sheenRoughnessMap&&(p.sheenRoughnessMap.value=g.sheenRoughnessMap,e(g.sheenRoughnessMap,p.sheenRoughnessMapTransform))),g.clearcoat>0&&(p.clearcoat.value=g.clearcoat,p.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(p.clearcoatMap.value=g.clearcoatMap,e(g.clearcoatMap,p.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,e(g.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(p.clearcoatNormalMap.value=g.clearcoatNormalMap,e(g.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===sn&&p.clearcoatNormalScale.value.negate())),g.dispersion>0&&(p.dispersion.value=g.dispersion),g.retroreflectivity>0&&(p.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(p.iridescence.value=g.iridescence,p.iridescenceIOR.value=g.iridescenceIOR,p.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(p.iridescenceMap.value=g.iridescenceMap,e(g.iridescenceMap,p.iridescenceMapTransform)),g.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=g.iridescenceThicknessMap,e(g.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),g.transmission>0&&(p.transmission.value=g.transmission,p.transmissionSamplerMap.value=x.texture,p.transmissionSamplerSize.value.set(x.width,x.height),g.transmissionMap&&(p.transmissionMap.value=g.transmissionMap,e(g.transmissionMap,p.transmissionMapTransform)),p.thickness.value=g.thickness,g.thicknessMap&&(p.thicknessMap.value=g.thicknessMap,e(g.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=g.attenuationDistance,p.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(p.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(p.anisotropyMap.value=g.anisotropyMap,e(g.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=g.specularIntensity,p.specularColor.value.copy(g.specularColor),g.specularColorMap&&(p.specularColorMap.value=g.specularColorMap,e(g.specularColorMap,p.specularColorMapTransform)),g.specularIntensityMap&&(p.specularIntensityMap.value=g.specularIntensityMap,e(g.specularIntensityMap,p.specularIntensityMapTransform))}function m(p,g){g.matcap&&(p.matcap.value=g.matcap)}function v(p,g){let x=t.get(g).light;p.referencePosition.value.setFromMatrixPosition(x.matrixWorld),p.nearDistance.value=x.shadow.camera.near,p.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function Gv(s,t,e,n){let i={},r={},a=[],o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,b){let E=b.program;n.uniformBlockBinding(M,E)}function c(M,b){let E=i[M.id];E===void 0&&(p(M),E=h(M),i[M.id]=E,M.addEventListener("dispose",x));let P=b.program;n.updateUBOMapping(M,P);let y=t.render.frame;r[M.id]!==y&&(d(M),r[M.id]=y)}function h(M){let b=u();M.__bindingPointIndex=b;let E=s.createBuffer(),P=M.__size,y=M.usage;return s.bindBuffer(s.UNIFORM_BUFFER,E),s.bufferData(s.UNIFORM_BUFFER,P,y),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,b,E),E}function u(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return Wt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(M){let b=i[M.id],E=M.uniforms,P=M.__cache;s.bindBuffer(s.UNIFORM_BUFFER,b);for(let y=0,A=E.length;y<A;y++){let I=E[y];if(Array.isArray(I))for(let N=0,F=I.length;N<F;N++)f(I[N],y,N,P);else f(I,y,0,P)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(M,b,E,P){if(v(M,b,E,P)===!0){let y=M.__offset,A=M.value;if(Array.isArray(A)){let I=0;for(let N=0;N<A.length;N++){let F=A[N],H=g(F);m(F,M.__data,I),typeof F!="number"&&typeof F!="boolean"&&!F.isMatrix3&&!ArrayBuffer.isView(F)&&(I+=H.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(A,M.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,y,M.__data)}}function m(M,b,E){typeof M=="number"||typeof M=="boolean"?b[0]=M:M.isMatrix3?(b[0]=M.elements[0],b[1]=M.elements[1],b[2]=M.elements[2],b[3]=0,b[4]=M.elements[3],b[5]=M.elements[4],b[6]=M.elements[5],b[7]=0,b[8]=M.elements[6],b[9]=M.elements[7],b[10]=M.elements[8],b[11]=0):ArrayBuffer.isView(M)?b.set(new M.constructor(M.buffer,M.byteOffset,b.length)):M.toArray(b,E)}function v(M,b,E,P){let y=M.value,A=b+"_"+E;if(P[A]===void 0)return typeof y=="number"||typeof y=="boolean"?P[A]=y:ArrayBuffer.isView(y)?P[A]=y.slice():P[A]=y.clone(),!0;{let I=P[A];if(typeof y=="number"||typeof y=="boolean"){if(I!==y)return P[A]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(I.equals(y)===!1)return I.copy(y),!0}}return!1}function p(M){let b=M.uniforms,E=0,P=16;for(let A=0,I=b.length;A<I;A++){let N=Array.isArray(b[A])?b[A]:[b[A]];for(let F=0,H=N.length;F<H;F++){let D=N[F],z=Array.isArray(D.value)?D.value:[D.value];for(let J=0,Y=z.length;J<Y;J++){let rt=z[J],Z=g(rt),tt=E%P,it=tt%Z.boundary,Et=tt+it;E+=it,Et!==0&&P-Et<Z.storage&&(E+=P-Et),D.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),D.__offset=E,E+=Z.storage}}}let y=E%P;return y>0&&(E+=P-y),M.__size=E,M.__cache={},this}function g(M){let b={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(b.boundary=4,b.storage=4):M.isVector2?(b.boundary=8,b.storage=8):M.isVector3||M.isColor?(b.boundary=16,b.storage=12):M.isVector4?(b.boundary=16,b.storage=16):M.isMatrix3?(b.boundary=48,b.storage=48):M.isMatrix4?(b.boundary=64,b.storage=64):M.isTexture?Gt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(M)?(b.boundary=16,b.storage=M.byteLength):Gt("WebGLRenderer: Unsupported uniform value type.",M),b}function x(M){let b=M.target;b.removeEventListener("dispose",x);let E=a.indexOf(b.__bindingPointIndex);a.splice(E,1),s.deleteBuffer(i[b.id]),delete i[b.id],delete r[b.id]}function T(){for(let M in i)s.deleteBuffer(i[M]);a=[],i={},r={}}return{bind:l,update:c,dispose:T}}var Wv=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),mi=null;function Xv(){return mi===null&&(mi=new ca(Wv,16,16,as,Ye),mi.name="DFG_LUT",mi.minFilter=nn,mi.magFilter=nn,mi.wrapS=ci,mi.wrapT=ci,mi.generateMipmaps=!1,mi.needsUpdate=!0),mi}var cc=class{constructor(t={}){let{canvas:e=tf(),context:n=null,depth:i=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Tn}=t;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=a;let v=f,p=new Set([wl,Tl,El]),g=new Set([Tn,si,gr,xr,Ml,Sl]),x=new Uint32Array(4),T=new Int32Array(4),M=new w,b=null,E=null,P=[],y=[],A=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ii,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let I=this,N=!1,F=null,H=null,D=null,z=null;this._outputColorSpace=tn;let J=0,Y=0,rt=null,Z=-1,tt=null,it=new Re,Et=new Re,St=null,jt=new Ct(0),Jt=0,$t=e.width,X=e.height,Q=1,mt=null,Bt=null,_t=new Re(0,0,$t,X),Ht=new Re(0,0,$t,X),ie=!1,st=new cr,ot=!1,ct=!1,ht=new me,ft=new w,Vt=new Re,zt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},kt=!1;function Yt(){return rt===null?Q:1}let L=n;function oe(S,U){return e.getContext(S,U)}let Kt,C,_,O,W,K,ut,dt,$,nt,pt,Nt,xt,gt,Dt,Ft,qt,R,V,B,j,at,et;try{let S={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",ce,!1),e.addEventListener("webglcontextrestored",he,!1),e.addEventListener("webglcontextcreationerror",Sn,!1),L===null){let U="webgl2";if(L=oe(U,S),L===null)throw oe(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}wt()}catch(S){throw e.removeEventListener("webglcontextlost",ce,!1),e.removeEventListener("webglcontextrestored",he,!1),e.removeEventListener("webglcontextcreationerror",Sn,!1),Wt("WebGLRenderer: "+S.message),S}function wt(){Kt=new jx(L),Kt.init(),j=new Bv(L,Kt),C=new kx(L,Kt,t,j),_=new Fv(L,Kt),C.reversedDepthBuffer&&d&&_.buffers.depth.setReversed(!0),H=L.createFramebuffer(),D=L.createFramebuffer(),z=L.createFramebuffer(),O=new e_(L),W=new Sv,K=new Ov(L,Kt,_,W,C,j,O),ut=new $x(I),dt=new i0(L),at=new Hx(L,dt),$=new Qx(L,dt,O,at),nt=new i_(L,$,dt,at,O),R=new n_(L,C,K),Dt=new Gx(W),pt=new Mv(I,ut,Kt,C,at,Dt),Nt=new kv(I,W),xt=new Ev,gt=new Pv(Kt),qt=new zx(I,ut,_,nt,m,l),Ft=new Uv(I,nt,C),et=new Gv(L,O,C,_),V=new Vx(L,Kt,O),B=new t_(L,Kt,O),O.programs=pt.programs,I.capabilities=C,I.extensions=Kt,I.properties=W,I.renderLists=xt,I.shadowMap=Ft,I.state=_,I.info=O}v!==Tn&&(A=new r_(v,e.width,e.height,o,i,r));let At=new ou(I,L);this.xr=At,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let S=Kt.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){let S=Kt.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(S){S!==void 0&&(Q=S,this.setSize($t,X,!1))},this.getSize=function(S){return S.set($t,X)},this.setSize=function(S,U,q=!0){if(At.isPresenting){Gt("WebGLRenderer: Can't change size while VR device is presenting.");return}$t=S,X=U,e.width=Math.floor(S*Q),e.height=Math.floor(U*Q),q===!0&&(e.style.width=S+"px",e.style.height=U+"px"),A!==null&&A.setSize(e.width,e.height),this.setViewport(0,0,S,U)},this.getDrawingBufferSize=function(S){return S.set($t*Q,X*Q).floor()},this.setDrawingBufferSize=function(S,U,q){$t=S,X=U,Q=q,e.width=Math.floor(S*q),e.height=Math.floor(U*q),this.setViewport(0,0,S,U)},this.setEffects=function(S){if(v===Tn){Wt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let U=0;U<S.length;U++)if(S[U].isOutputPass===!0){Gt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(it)},this.getViewport=function(S){return S.copy(_t)},this.setViewport=function(S,U,q,k){S.isVector4?_t.set(S.x,S.y,S.z,S.w):_t.set(S,U,q,k),_.viewport(it.copy(_t).multiplyScalar(Q).round())},this.getScissor=function(S){return S.copy(Ht)},this.setScissor=function(S,U,q,k){S.isVector4?Ht.set(S.x,S.y,S.z,S.w):Ht.set(S,U,q,k),_.scissor(Et.copy(Ht).multiplyScalar(Q).round())},this.getScissorTest=function(){return ie},this.setScissorTest=function(S){_.setScissorTest(ie=S)},this.setOpaqueSort=function(S){mt=S},this.setTransparentSort=function(S){Bt=S},this.getClearColor=function(S){return S.copy(qt.getClearColor())},this.setClearColor=function(){qt.setClearColor(...arguments)},this.getClearAlpha=function(){return qt.getClearAlpha()},this.setClearAlpha=function(){qt.setClearAlpha(...arguments)},this.clear=function(S=!0,U=!0,q=!0){let k=0;if(S){let G=!1;if(rt!==null){let Mt=rt.texture.format;G=p.has(Mt)}if(G){let Mt=rt.texture.type,Rt=g.has(Mt),yt=qt.getClearColor(),Pt=qt.getClearAlpha(),Ut=yt.r,Qt=yt.g,se=yt.b;Rt?(x[0]=Ut,x[1]=Qt,x[2]=se,x[3]=Pt,L.clearBufferuiv(L.COLOR,0,x)):(T[0]=Ut,T[1]=Qt,T[2]=se,T[3]=Pt,L.clearBufferiv(L.COLOR,0,T))}else k|=L.COLOR_BUFFER_BIT}U&&(k|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(k|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k!==0&&L.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),F=S},this.dispose=function(){e.removeEventListener("webglcontextlost",ce,!1),e.removeEventListener("webglcontextrestored",he,!1),e.removeEventListener("webglcontextcreationerror",Sn,!1),qt.dispose(),xt.dispose(),gt.dispose(),W.dispose(),ut.dispose(),nt.dispose(),at.dispose(),et.dispose(),pt.dispose(),At.dispose(),At.removeEventListener("sessionstart",Br),At.removeEventListener("sessionend",zr),ai.stop()};function ce(S){S.preventDefault(),Uh("WebGLRenderer: Context Lost."),N=!0}function he(){Uh("WebGLRenderer: Context Restored."),N=!1;let S=O.autoReset,U=Ft.enabled,q=Ft.autoUpdate,k=Ft.needsUpdate,G=Ft.type;wt(),O.autoReset=S,Ft.enabled=U,Ft.autoUpdate=q,Ft.needsUpdate=k,Ft.type=G}function Sn(S){Wt("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function bn(S){let U=S.target;U.removeEventListener("dispose",bn),Ns(U)}function Ns(S){Or(S),W.remove(S)}function Or(S){let U=W.get(S).programs;U!==void 0&&(U.forEach(function(q){pt.releaseProgram(q)}),S.isShaderMaterial&&pt.releaseShaderCache(S))}this.renderBufferDirect=function(S,U,q,k,G,Mt){U===null&&(U=zt);let Rt=G.isMesh&&G.matrixWorld.determinantAffine()<0,yt=Tp(S,U,q,k,G);_.setMaterial(k,Rt);let Pt=q.index,Ut=1;if(k.wireframe===!0){if(Pt=$.getWireframeAttribute(q),Pt===void 0)return;Ut=2}let Qt=q.drawRange,se=q.attributes.position,It=Qt.start*Ut,fe=(Qt.start+Qt.count)*Ut;Mt!==null&&(It=Math.max(It,Mt.start*Ut),fe=Math.min(fe,(Mt.start+Mt.count)*Ut)),Pt!==null?(It=Math.max(It,0),fe=Math.min(fe,Pt.count)):se!=null&&(It=Math.max(It,0),fe=Math.min(fe,se.count));let He=fe-It;if(He<0||He===1/0)return;at.setup(G,k,yt,q,Pt);let Ee,ve=V;if(Pt!==null&&(Ee=dt.get(Pt),ve=B,ve.setIndex(Ee)),G.isMesh)k.wireframe===!0?(_.setLineWidth(k.wireframeLinewidth*Yt()),ve.setMode(L.LINES)):ve.setMode(L.TRIANGLES);else if(G.isLine){let on=k.linewidth;on===void 0&&(on=1),_.setLineWidth(on*Yt()),G.isLineSegments?ve.setMode(L.LINES):G.isLineLoop?ve.setMode(L.LINE_LOOP):ve.setMode(L.LINE_STRIP)}else G.isPoints?ve.setMode(L.POINTS):G.isSprite&&ve.setMode(L.TRIANGLES);if(G.isBatchedMesh)if(Kt.get("WEBGL_multi_draw"))ve.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{let on=G._multiDrawStarts,Tt=G._multiDrawCounts,pn=G._multiDrawCount,ue=Pt?dt.get(Pt).bytesPerElement:1,Vn=W.get(k).currentProgram.getUniforms();for(let oi=0;oi<pn;oi++)Vn.setValue(L,"_gl_DrawID",oi),ve.render(on[oi]/ue,Tt[oi])}else if(G.isInstancedMesh)ve.renderInstances(It,He,G.count);else if(q.isInstancedBufferGeometry){let on=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,Tt=Math.min(q.instanceCount,on);ve.renderInstances(It,He,Tt)}else ve.render(It,He)};function Us(S,U,q,k){F!==null&&S.isNodeMaterial&&F.setObject(k,S),ot===!0&&Dt.setState(S,q,!1),S.transparent===!0&&S.side===Ie&&S.forceSinglePass===!1?(S.side=sn,S.needsUpdate=!0,oo(S,U,k),S.side=es,S.needsUpdate=!0,oo(S,U,k),S.side=Ie):oo(S,U,k)}this.compile=function(S,U,q=null){q===null&&(q=S),F!==null&&F.renderStart(S,U,q),E=gt.get(q),E.init(U),y.push(E),q.traverseVisible(function(G){G.isLight&&G.layers.test(U.layers)&&(E.pushLight(G),G.castShadow&&E.pushShadow(G))}),S!==q&&S.traverseVisible(function(G){G.isLight&&G.layers.test(U.layers)&&(E.pushLight(G),G.castShadow&&E.pushShadow(G))}),E.setupLights(),F!==null&&F.updateLights(E.state.lightsArray),ct=this.localClippingEnabled,ot=Dt.init(this.clippingPlanes,ct),ot===!0&&Dt.setGlobalState(this.clippingPlanes,U),F!==null&&Ft.render(E.state.shadowsArray,q,U);let k=new Set;return S.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;let Mt=G.material;if(Mt)if(Array.isArray(Mt))for(let Rt=0;Rt<Mt.length;Rt++){let yt=Mt[Rt];Us(yt,q,U,G),k.add(yt)}else Us(Mt,q,U,G),k.add(Mt)}),E=y.pop(),F!==null&&F.renderEnd(),k},this.compileAsync=function(S,U,q=null){let k=this.compile(S,U,q);return new Promise(G=>{function Mt(){if(k.forEach(function(Rt){let Pt=W.get(Rt).currentProgram;(Pt===void 0||Pt.isReady())&&k.delete(Rt)}),k.size===0){G(S);return}setTimeout(Mt,10)}Kt.get("KHR_parallel_shader_compile")!==null?Mt():setTimeout(Mt,10)})};let Bi=null;function Fc(S){Bi&&Bi(S)}function Br(){ai.stop()}function zr(){ai.start()}let ai=new Df;ai.setAnimationLoop(Fc),typeof self<"u"&&ai.setContext(self),this.setAnimationLoop=function(S){Bi=S,At.setAnimationLoop(S),S===null?ai.stop():ai.start()},At.addEventListener("sessionstart",Br),At.addEventListener("sessionend",zr),this.render=function(S,U){if(U!==void 0&&U.isCamera!==!0){Wt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;F!==null&&F.renderStart(S,U);let q=At.enabled===!0&&At.isPresenting===!0,k=A!==null&&(rt===null||q)&&A.begin(I,rt);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),At.enabled===!0&&At.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(At.cameraAutoUpdate===!0&&At.updateCamera(U),U=At.getCamera()),S.isScene===!0&&S.onBeforeRender(I,S,U,rt),E=gt.get(S,y.length),E.init(U),E.state.textureUnits=K.getTextureUnits(),y.push(E),ht.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),st.setFromProjectionMatrix(ht,ni,U.reversedDepth),ct=this.localClippingEnabled,ot=Dt.init(this.clippingPlanes,ct),b=xt.get(S,P.length),b.init(),P.push(b),At.enabled===!0&&At.isPresenting===!0){let Rt=I.xr.getDepthSensingMesh();Rt!==null&&ms(Rt,U,-1/0,I.sortObjects)}ms(S,U,0,I.sortObjects),b.finish(),F!==null&&F.updateLights(E.state.lightsArray),I.sortObjects===!0&&b.sort(mt,Bt),kt=At.enabled===!1||At.isPresenting===!1||At.hasDepthSensing()===!1,kt&&qt.addToRenderList(b,S),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ot===!0&&Dt.beginShadows();let G=E.state.shadowsArray;if(Ft.render(G,S,U),ot===!0&&Dt.endShadows(),(k&&A.hasRenderPass())===!1){let Rt=b.opaque,yt=b.transmissive;if(E.setupLights(),U.isArrayCamera){let Pt=U.cameras;if(yt.length>0)for(let Ut=0,Qt=Pt.length;Ut<Qt;Ut++){let se=Pt[Ut];Hr(Rt,yt,S,se)}kt&&qt.render(S);for(let Ut=0,Qt=Pt.length;Ut<Qt;Ut++){let se=Pt[Ut];Fs(b,S,se,se.viewport)}}else yt.length>0&&Hr(Rt,yt,S,U),kt&&qt.render(S),Fs(b,S,U)}rt!==null&&Y===0&&(K.updateMultisampleRenderTarget(rt),K.updateRenderTargetMipmap(rt)),k&&A.end(I),S.isScene===!0&&S.onAfterRender(I,S,U),at.resetDefaultState(),Z=-1,tt=null,y.pop(),y.length>0?(E=y[y.length-1],K.setTextureUnits(E.state.textureUnits),ot===!0&&Dt.setGlobalState(I.clippingPlanes,E.state.camera)):E=null,P.pop(),P.length>0?b=P[P.length-1]:b=null,F!==null&&F.renderEnd()};function ms(S,U,q,k){if(S.visible===!1)return;if(S.layers.test(U.layers)){if(S.isGroup)q=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(U);else if(S.isLightProbeGrid)E.pushLightProbeGrid(S);else if(S.isLight)E.pushLight(S),S.castShadow&&E.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||S.intersectsFrustum(st)){k&&Vt.setFromMatrixPosition(S.matrixWorld).applyMatrix4(ht);let Rt=nt.update(S),yt=S.material;yt.visible&&b.push(S,Rt,yt,q,Vt.z,null,U)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||S.intersectsFrustum(st))){let Rt=nt.update(S),yt=S.material;if(k&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Vt.copy(S.boundingSphere.center)):(Rt.boundingSphere===null&&Rt.computeBoundingSphere(),Vt.copy(Rt.boundingSphere.center)),Vt.applyMatrix4(S.matrixWorld).applyMatrix4(ht)),Array.isArray(yt)){let Pt=Rt.groups;for(let Ut=0,Qt=Pt.length;Ut<Qt;Ut++){let se=Pt[Ut],It=yt[se.materialIndex];It&&It.visible&&b.push(S,Rt,It,q,Vt.z,se,U)}}else yt.visible&&b.push(S,Rt,yt,q,Vt.z,null,U)}}let Mt=S.children;for(let Rt=0,yt=Mt.length;Rt<yt;Rt++)ms(Mt[Rt],U,q,k)}function Fs(S,U,q,k){let{opaque:G,transmissive:Mt,transparent:Rt}=S;E.setupLightsView(q),ot===!0&&Dt.setGlobalState(I.clippingPlanes,q),k&&_.viewport(it.copy(k)),G.length>0&&gs(G,U,q),Mt.length>0&&gs(Mt,U,q),Rt.length>0&&gs(Rt,U,q),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function Hr(S,U,q,k){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[k.id]===void 0){let It=Kt.has("EXT_color_buffer_half_float")||Kt.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[k.id]=new Ue(1,1,{generateMipmaps:!0,type:It?Ye:Tn,minFilter:ss,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ne.workingColorSpace})}let Mt=E.state.transmissionRenderTarget[k.id],Rt=k.viewport||it;Mt.setSize(Rt.z*I.transmissionResolutionScale,Rt.w*I.transmissionResolutionScale);let yt=I.getRenderTarget(),Pt=I.getActiveCubeFace(),Ut=I.getActiveMipmapLevel();I.setRenderTarget(Mt),I.getClearColor(jt),Jt=I.getClearAlpha(),Jt<1&&I.setClearColor(16777215,.5),I.clear(),kt&&qt.render(q);let Qt=I.toneMapping;I.toneMapping=ii;let se=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),E.setupLightsView(k),ot===!0&&Dt.setGlobalState(I.clippingPlanes,k),gs(S,q,k),K.updateMultisampleRenderTarget(Mt),K.updateRenderTargetMipmap(Mt),Kt.has("WEBGL_multisampled_render_to_texture")===!1){let It=!1;for(let fe=0,He=U.length;fe<He;fe++){let Ee=U[fe],{object:ve,geometry:on,material:Tt,group:pn}=Ee;if(Tt.side===Ie&&ve.layers.test(k.layers)){let ue=Tt.side;Tt.side=sn,Tt.needsUpdate=!0,Vr(ve,q,k,on,Tt,pn),Tt.side=ue,Tt.needsUpdate=!0,It=!0}}It===!0&&(K.updateMultisampleRenderTarget(Mt),K.updateRenderTargetMipmap(Mt))}I.setRenderTarget(yt,Pt,Ut),I.setClearColor(jt,Jt),se!==void 0&&(k.viewport=se),I.toneMapping=Qt}function gs(S,U,q){let k=U.isScene===!0?U.overrideMaterial:null;for(let G=0,Mt=S.length;G<Mt;G++){let Rt=S[G],{object:yt,geometry:Pt,group:Ut}=Rt,Qt=Rt.material;Qt.allowOverride===!0&&k!==null&&(Qt=k),yt.layers.test(q.layers)&&Vr(yt,U,q,Pt,Qt,Ut)}}function Vr(S,U,q,k,G,Mt){F!==null&&G.isNodeMaterial&&F.setObject(S,G),S.onBeforeRender(I,U,q,k,G,Mt),S.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),G.onBeforeRender(I,U,q,k,S,Mt),G.transparent===!0&&G.side===Ie&&G.forceSinglePass===!1?(G.side=sn,G.needsUpdate=!0,I.renderBufferDirect(q,U,k,G,S,Mt),G.side=es,G.needsUpdate=!0,I.renderBufferDirect(q,U,k,G,S,Mt),G.side=Ie):I.renderBufferDirect(q,U,k,G,S,Mt),S.onAfterRender(I,U,q,k,G,Mt)}function oo(S,U,q){U.isScene!==!0&&(U=zt);let k=W.get(S),G=E.state.lights,Mt=E.state.shadowsArray,Rt=G.state.version,yt=pt.getParameters(S,G.state,Mt,U,q,E.state.lightProbeGridArray),Pt=pt.getProgramCacheKey(yt),Ut=k.programs;k.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?U.environment:null,k.fog=U.fog;let Qt=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;k.envMap=ut.get(S.envMap||k.environment,Qt),k.envMapRotation=k.environment!==null&&S.envMap===null?U.environmentRotation:S.envMapRotation,Ut===void 0&&(S.addEventListener("dispose",bn),Ut=new Map,k.programs=Ut);let se=Ut.get(Pt);if(se!==void 0){if(k.currentProgram===se&&k.lightsStateVersion===Rt)return Vu(S,yt),se}else yt.uniforms=pt.getUniforms(S),F!==null&&S.isNodeMaterial&&F.build(S,q,yt),S.onBeforeCompile(yt,I),se=pt.acquireProgram(yt,Pt),Ut.set(Pt,se),k.uniforms=yt.uniforms;let It=k.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(It.clippingPlanes=Dt.uniform),Vu(S,yt),k.needsLights=Ap(S),k.lightsStateVersion=Rt,k.needsLights&&(It.ambientLightColor.value=G.state.ambient,It.lightProbe.value=G.state.probe,It.sunLights.value=G.state.sun,It.sunLightShadows.value=G.state.sunShadow,It.directionalLights.value=G.state.directional,It.directionalLightShadows.value=G.state.directionalShadow,It.spotLights.value=G.state.spot,It.spotLightShadows.value=G.state.spotShadow,It.rectAreaLights.value=G.state.rectArea,It.ltc_1.value=G.state.rectAreaLTC1,It.ltc_2.value=G.state.rectAreaLTC2,It.pointLights.value=G.state.point,It.pointLightShadows.value=G.state.pointShadow,It.hemisphereLights.value=G.state.hemi,It.sunShadowMatrix.value=G.state.sunShadowMatrix,It.sunShadowCascade.value=G.state.sunShadowCascade,It.directionalShadowMatrix.value=G.state.directionalShadowMatrix,It.spotLightMatrix.value=G.state.spotLightMatrix,It.spotLightMap.value=G.state.spotLightMap,It.pointShadowMatrix.value=G.state.pointShadowMatrix),k.lightProbeGrid=E.state.lightProbeGridArray.length>0,k.currentProgram=se,k.uniformsList=null,se}function Hu(S){if(S.uniformsList===null){let U=S.currentProgram.getUniforms();S.uniformsList=yr.seqWithValue(U.seq,S.uniforms)}return S.uniformsList}function Vu(S,U){let q=W.get(S);q.outputColorSpace=U.outputColorSpace,q.batching=U.batching,q.batchingColor=U.batchingColor,q.instancing=U.instancing,q.instancingColor=U.instancingColor,q.instancingMorph=U.instancingMorph,q.skinning=U.skinning,q.morphTargets=U.morphTargets,q.morphNormals=U.morphNormals,q.morphColors=U.morphColors,q.morphTargetsCount=U.morphTargetsCount,q.numClippingPlanes=U.numClippingPlanes,q.numIntersection=U.numClipIntersection,q.vertexAlphas=U.vertexAlphas,q.vertexTangents=U.vertexTangents,q.toneMapping=U.toneMapping}function Ep(S,U){if(S.length===0)return null;if(S.length===1)return S[0].texture!==null?S[0]:null;M.setFromMatrixPosition(U.matrixWorld);for(let q=0,k=S.length;q<k;q++){let G=S[q];if(G.texture!==null&&G.boundingBox.containsPoint(M))return G}return null}function Tp(S,U,q,k,G){U.isScene!==!0&&(U=zt),K.resetTextureUnits();let Mt=U.fog,Rt=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?U.environment:null,yt=rt===null?I.outputColorSpace:rt.isXRRenderTarget===!0?rt.texture.colorSpace:ne.workingColorSpace,Pt=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap,Ut=ut.get(k.envMap||Rt,Pt),Qt=k.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,se=!!q.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),It=!!q.morphAttributes.position,fe=!!q.morphAttributes.normal,He=!!q.morphAttributes.color,Ee=ii;k.toneMapped&&(rt===null||rt.isXRRenderTarget===!0)&&(Ee=I.toneMapping);let ve=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,on=ve!==void 0?ve.length:0,Tt=W.get(k),pn=E.state.lights;if(ot===!0&&(ct===!0||S!==tt)){let ye=S===tt&&k.id===Z;Dt.setState(k,S,ye)}let ue=!1;k.version===Tt.__version?(Tt.needsLights&&Tt.lightsStateVersion!==pn.state.version||Tt.outputColorSpace!==yt||G.isBatchedMesh&&Tt.batching===!1||!G.isBatchedMesh&&Tt.batching===!0||G.isBatchedMesh&&Tt.batchingColor===!0&&G._colorsTexture===null||G.isBatchedMesh&&Tt.batchingColor===!1&&G._colorsTexture!==null||G.isInstancedMesh&&Tt.instancing===!1||!G.isInstancedMesh&&Tt.instancing===!0||G.isSkinnedMesh&&Tt.skinning===!1||!G.isSkinnedMesh&&Tt.skinning===!0||G.isInstancedMesh&&Tt.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&Tt.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&Tt.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&Tt.instancingMorph===!1&&G.morphTexture!==null||Tt.envMap!==Ut||k.fog===!0&&Tt.fog!==Mt||Tt.numClippingPlanes!==void 0&&(Tt.numClippingPlanes!==Dt.numPlanes||Tt.numIntersection!==Dt.numIntersection)||Tt.vertexAlphas!==Qt||Tt.vertexTangents!==se||Tt.morphTargets!==It||Tt.morphNormals!==fe||Tt.morphColors!==He||Tt.toneMapping!==Ee||Tt.morphTargetsCount!==on||!!Tt.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(ue=!0):(ue=!0,Tt.__version=k.version);let Vn=Tt.currentProgram;ue===!0&&(Vn=oo(k,U,G),F&&k.isNodeMaterial&&F.onUpdateProgram(k,Vn,Tt));let oi=!1,zi=!1,Os=!1,ge=Vn.getUniforms(),Be=Tt.uniforms;if(_.useProgram(Vn.program)&&(oi=!0,zi=!0,Os=!0),k.id!==Z&&(Z=k.id,zi=!0),Tt.needsLights){let ye=Ep(E.state.lightProbeGridArray,G);Tt.lightProbeGrid!==ye&&(Tt.lightProbeGrid=ye,zi=!0)}if(oi||tt!==S){_.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),ge.setValue(L,"projectionMatrix",S.projectionMatrix),ge.setValue(L,"viewMatrix",S.matrixWorldInverse);let Vi=ge.map.cameraPosition;Vi!==void 0&&Vi.setValue(L,ft.setFromMatrixPosition(S.matrixWorld)),C.logarithmicDepthBuffer&&ge.setValue(L,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&ge.setValue(L,"isOrthographic",S.isOrthographicCamera===!0),tt!==S&&(tt=S,zi=!0,Os=!0)}if(Tt.needsLights&&(pn.state.sunShadowMap.length>0&&ge.setValue(L,"sunShadowMap",pn.state.sunShadowMap,K),pn.state.directionalShadowMap.length>0&&ge.setValue(L,"directionalShadowMap",pn.state.directionalShadowMap,K),pn.state.spotShadowMap.length>0&&ge.setValue(L,"spotShadowMap",pn.state.spotShadowMap,K),pn.state.pointShadowMap.length>0&&ge.setValue(L,"pointShadowMap",pn.state.pointShadowMap,K)),G.isSkinnedMesh){ge.setOptional(L,G,"bindMatrix"),ge.setOptional(L,G,"bindMatrixInverse");let ye=G.skeleton;ye&&(ye.boneTexture===null&&ye.computeBoneTexture(),ge.setValue(L,"boneTexture",ye.boneTexture,K))}G.isBatchedMesh&&(ge.setOptional(L,G,"batchingTexture"),ge.setValue(L,"batchingTexture",G._matricesTexture,K),ge.setOptional(L,G,"batchingIdTexture"),ge.setValue(L,"batchingIdTexture",G._indirectTexture,K),ge.setOptional(L,G,"batchingColorTexture"),G._colorsTexture!==null&&ge.setValue(L,"batchingColorTexture",G._colorsTexture,K));let Hi=q.morphAttributes;if((Hi.position!==void 0||Hi.normal!==void 0||Hi.color!==void 0)&&R.update(G,q,Vn),(zi||Tt.receiveShadow!==G.receiveShadow)&&(Tt.receiveShadow=G.receiveShadow,ge.setValue(L,"receiveShadow",G.receiveShadow)),(k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial)&&k.envMap===null&&U.environment!==null&&(Be.envMapIntensity.value=U.environmentIntensity),Be.dfgLUT!==void 0&&(Be.dfgLUT.value=Xv()),zi){if(ge.setValue(L,"toneMappingExposure",I.toneMappingExposure),Tt.needsLights&&wp(Be,Os),Mt&&k.fog===!0&&Nt.refreshFogUniforms(Be,Mt),Nt.refreshMaterialUniforms(Be,k,Q,X,E.state.transmissionRenderTarget[S.id]),Tt.needsLights&&Tt.lightProbeGrid){let ye=Tt.lightProbeGrid;Be.probesSH.value=ye.texture,Be.probesMin.value.copy(ye.boundingBox.min),Be.probesMax.value.copy(ye.boundingBox.max),Be.probesResolution.value.copy(ye.resolution)}yr.upload(L,Hu(Tt),Be,K)}if(k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(yr.upload(L,Hu(Tt),Be,K),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&ge.setValue(L,"center",G.center),ge.setValue(L,"modelViewMatrix",G.modelViewMatrix),ge.setValue(L,"normalMatrix",G.normalMatrix),ge.setValue(L,"modelMatrix",G.matrixWorld),k.uniformsGroups!==void 0){let ye=k.uniformsGroups;for(let Vi=0,Bs=ye.length;Vi<Bs;Vi++){let Gu=ye[Vi];et.update(Gu,Vn),et.bind(Gu,Vn)}}return Vn}function wp(S,U){S.ambientLightColor.needsUpdate=U,S.lightProbe.needsUpdate=U,S.sunLights.needsUpdate=U,S.sunLightShadows.needsUpdate=U,S.directionalLights.needsUpdate=U,S.directionalLightShadows.needsUpdate=U,S.pointLights.needsUpdate=U,S.pointLightShadows.needsUpdate=U,S.spotLights.needsUpdate=U,S.spotLightShadows.needsUpdate=U,S.rectAreaLights.needsUpdate=U,S.hemisphereLights.needsUpdate=U}function Ap(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return J},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return rt},this.setRenderTargetTextures=function(S,U,q){let k=W.get(S);k.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),W.get(S.texture).__webglTexture=U,W.get(S.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:q,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,U){let q=W.get(S);q.__webglFramebuffer=U,q.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(S,U=0,q=0){rt=S,J=U,Y=q;let k=null,G=!1,Mt=!1;if(S){let yt=W.get(S);if(yt.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(L.FRAMEBUFFER,yt.__webglFramebuffer),it.copy(S.viewport),Et.copy(S.scissor),St=S.scissorTest,_.viewport(it),_.scissor(Et),_.setScissorTest(St),Z=-1;return}else if(yt.__webglFramebuffer===void 0)K.setupRenderTarget(S);else if(yt.__hasExternalTextures)K.rebindTextures(S,W.get(S.texture).__webglTexture,W.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){let Qt=S.depthTexture;if(yt.__boundDepthTexture!==Qt){if(Qt!==null&&W.has(Qt)&&(S.width!==Qt.image.width||S.height!==Qt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");K.setupDepthRenderbuffer(S)}}let Pt=S.texture;(Pt.isData3DTexture||Pt.isDataArrayTexture||Pt.isCompressedArrayTexture)&&(Mt=!0);let Ut=W.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Ut[U])?k=Ut[U][q]:k=Ut[U],G=!0):S.samples>0&&K.useMultisampledRTT(S)===!1?k=W.get(S).__webglMultisampledFramebuffer:Array.isArray(Ut)?k=Ut[q]:k=Ut,it.copy(S.viewport),Et.copy(S.scissor),St=S.scissorTest}else it.copy(_t).multiplyScalar(Q).floor(),Et.copy(Ht).multiplyScalar(Q).floor(),St=ie;if(q!==0&&(k=H),_.bindFramebuffer(L.FRAMEBUFFER,k)&&_.drawBuffers(S,k),_.viewport(it),_.scissor(Et),_.setScissorTest(St),G){let yt=W.get(S.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+U,yt.__webglTexture,q)}else if(Mt){let yt=U;for(let Pt=0;Pt<S.textures.length;Pt++){let Ut=W.get(S.textures[Pt]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Pt,Ut.__webglTexture,q,yt)}}else if(S!==null&&q!==0){let yt=W.get(S.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,yt.__webglTexture,q)}Z=-1};function ku(S){let U=W.get(S);return(U.__readFormat!==S.format||U.__readType!==S.type)&&(U.__readFormat=S.format,U.__readType=S.type,U.__formatReadable=C.textureFormatReadable(S.format),U.__typeReadable=C.textureTypeReadable(S.type)),U}this.readRenderTargetPixels=function(S,U,q,k,G,Mt,Rt,yt=0){if(!(S&&S.isWebGLRenderTarget)){Wt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Pt=W.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Rt!==void 0&&(Pt=Pt[Rt]),Pt){_.bindFramebuffer(L.FRAMEBUFFER,Pt);try{let Ut=S.textures[yt],Qt=Ut.format,se=Ut.type;S.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+yt);let It=ku(Ut);if(It.__formatReadable===!1){Wt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(It.__typeReadable===!1){Wt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=S.width-k&&q>=0&&q<=S.height-G&&L.readPixels(U,q,k,G,j.convert(Qt),j.convert(se),Mt)}finally{let Ut=rt!==null?W.get(rt).__webglFramebuffer:null;_.bindFramebuffer(L.FRAMEBUFFER,Ut)}}},this.readRenderTargetPixelsAsync=async function(S,U,q,k,G,Mt,Rt,yt=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Pt=W.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Rt!==void 0&&(Pt=Pt[Rt]),Pt)if(U>=0&&U<=S.width-k&&q>=0&&q<=S.height-G){_.bindFramebuffer(L.FRAMEBUFFER,Pt);let Ut=S.textures[yt],Qt=Ut.format,se=Ut.type;S.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+yt);let It=ku(Ut);if(It.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(It.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let fe=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,fe),L.bufferData(L.PIXEL_PACK_BUFFER,Mt.byteLength,L.STREAM_READ),L.readPixels(U,q,k,G,j.convert(Qt),j.convert(se),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let He=rt!==null?W.get(rt).__webglFramebuffer:null;_.bindFramebuffer(L.FRAMEBUFFER,He);let Ee=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await nf(L,Ee,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,fe),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,Mt),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(fe),L.deleteSync(Ee),Mt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,U=null,q=0){let k=Math.pow(2,-q),G=Math.floor(S.image.width*k),Mt=Math.floor(S.image.height*k),Rt=U!==null?U.x:0,yt=U!==null?U.y:0;K.setTexture2D(S,0),L.copyTexSubImage2D(L.TEXTURE_2D,q,0,0,Rt,yt,G,Mt),_.unbindTexture()},this.copyTextureToTexture=function(S,U,q=null,k=null,G=0,Mt=0){let Rt,yt,Pt,Ut,Qt,se,It,fe,He,Ee=S.isCompressedTexture?S.mipmaps[Mt]:S.image;if(q!==null)Rt=q.max.x-q.min.x,yt=q.max.y-q.min.y,Pt=q.isBox3?q.max.z-q.min.z:1,Ut=q.min.x,Qt=q.min.y,se=q.isBox3?q.min.z:0;else{let Be=Math.pow(2,-G);Rt=Math.floor(Ee.width*Be),yt=Math.floor(Ee.height*Be),S.isDataArrayTexture?Pt=Ee.depth:S.isData3DTexture?Pt=Math.floor(Ee.depth*Be):Pt=1,Ut=0,Qt=0,se=0}k!==null?(It=k.x,fe=k.y,He=k.z):(It=0,fe=0,He=0);let ve=j.convert(U.format),on=j.convert(U.type),Tt;U.isData3DTexture?(K.setTexture3D(U,0),Tt=L.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(K.setTexture2DArray(U,0),Tt=L.TEXTURE_2D_ARRAY):(K.setTexture2D(U,0),Tt=L.TEXTURE_2D),_.activeTexture(L.TEXTURE0),_.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,U.flipY),_.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),_.pixelStorei(L.UNPACK_ALIGNMENT,U.unpackAlignment);let pn=_.getParameter(L.UNPACK_ROW_LENGTH),ue=_.getParameter(L.UNPACK_IMAGE_HEIGHT),Vn=_.getParameter(L.UNPACK_SKIP_PIXELS),oi=_.getParameter(L.UNPACK_SKIP_ROWS),zi=_.getParameter(L.UNPACK_SKIP_IMAGES);_.pixelStorei(L.UNPACK_ROW_LENGTH,Ee.width),_.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Ee.height),_.pixelStorei(L.UNPACK_SKIP_PIXELS,Ut),_.pixelStorei(L.UNPACK_SKIP_ROWS,Qt),_.pixelStorei(L.UNPACK_SKIP_IMAGES,se);let Os=S.isDataArrayTexture||S.isData3DTexture,ge=U.isDataArrayTexture||U.isData3DTexture;if(S.isDepthTexture){let Be=W.get(S),Hi=W.get(U),ye=W.get(Be.__renderTarget),Vi=W.get(Hi.__renderTarget);_.bindFramebuffer(L.READ_FRAMEBUFFER,ye.__webglFramebuffer),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,Vi.__webglFramebuffer);for(let Bs=0;Bs<Pt;Bs++)Os&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,W.get(S).__webglTexture,G,se+Bs),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,W.get(U).__webglTexture,Mt,He+Bs)),L.blitFramebuffer(Ut,Qt,Rt,yt,It,fe,Rt,yt,L.DEPTH_BUFFER_BIT,L.NEAREST);_.bindFramebuffer(L.READ_FRAMEBUFFER,null),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(G!==0||S.isRenderTargetTexture||W.has(S)){let Be=W.get(S),Hi=W.get(U);_.bindFramebuffer(L.READ_FRAMEBUFFER,D),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,z);for(let ye=0;ye<Pt;ye++)Os?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Be.__webglTexture,G,se+ye):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Be.__webglTexture,G),ge?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Hi.__webglTexture,Mt,He+ye):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Hi.__webglTexture,Mt),G!==0?L.blitFramebuffer(Ut,Qt,Rt,yt,It,fe,Rt,yt,L.COLOR_BUFFER_BIT,L.NEAREST):ge?L.copyTexSubImage3D(Tt,Mt,It,fe,He+ye,Ut,Qt,Rt,yt):L.copyTexSubImage2D(Tt,Mt,It,fe,Ut,Qt,Rt,yt);_.bindFramebuffer(L.READ_FRAMEBUFFER,null),_.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else ge?S.isDataTexture||S.isData3DTexture?L.texSubImage3D(Tt,Mt,It,fe,He,Rt,yt,Pt,ve,on,Ee.data):U.isCompressedArrayTexture?L.compressedTexSubImage3D(Tt,Mt,It,fe,He,Rt,yt,Pt,ve,Ee.data):L.texSubImage3D(Tt,Mt,It,fe,He,Rt,yt,Pt,ve,on,Ee):S.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,Mt,It,fe,Rt,yt,ve,on,Ee.data):S.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,Mt,It,fe,Ee.width,Ee.height,ve,Ee.data):L.texSubImage2D(L.TEXTURE_2D,Mt,It,fe,Rt,yt,ve,on,Ee);_.pixelStorei(L.UNPACK_ROW_LENGTH,pn),_.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ue),_.pixelStorei(L.UNPACK_SKIP_PIXELS,Vn),_.pixelStorei(L.UNPACK_SKIP_ROWS,oi),_.pixelStorei(L.UNPACK_SKIP_IMAGES,zi),Mt===0&&U.generateMipmaps&&L.generateMipmap(Tt),_.unbindTexture()},this.initRenderTarget=function(S){W.get(S).__webglFramebuffer===void 0&&K.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?K.setTextureCube(S,0):S.isData3DTexture?K.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?K.setTexture2DArray(S,0):K.setTexture2D(S,0),_.unbindTexture()},this.resetState=function(){J=0,Y=0,rt=null,_.reset(),at.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ni}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=ne._getDrawingBufferColorSpace(t),e.unpackColorSpace=ne._getUnpackColorSpace()}};var Ja=.008333333333333333,ri=650,Ot={halfX:4096,halfZ:5120,height:2044,chamfer:1150,cornerR:400,rampR:280,goalHalfW:893,goalH:642,goalDepth:880},we={radius:93,mass:30,maxSpeed:6e3,maxSpin:6,drag:.0305,restitution:.6,friction:.285},Lt={mass:180,restHeight:17,hitboxHalf:{x:42.1,y:18.08,z:59},hitboxOffset:{x:0,y:20.75,z:13.88},wheels:[{x:25.9,z:51.25,r:12.5,front:!0},{x:-25.9,z:51.25,r:12.5,front:!0},{x:29.5,z:-33.75,r:15,front:!1},{x:-29.5,z:-33.75,r:15,front:!1}],maxSpeed:2300,maxDriveSpeed:1410,supersonic:2200,boostAccelGround:991.67,boostAccelAir:1058.33,boostUsePerSec:33.3,brakeAccel:3500,coastDecel:525,airThrottleAccel:66.67,jumpImpulse:291.67,jumpHoldAccel:1458.33,jumpHoldTime:.2,doubleJumpWindow:1.25,dodgeImpulse:500,dodgeTime:.65,stickyAccel:325,maxAngVel:5.5,airRoll:36.08,airPitch:12.15,airYaw:8.92,dampRoll:4.47,dampPitch:2.8,dampYaw:1.89},lu=33,dc=[[-3584,0],[3584,0],[-3072,-4096],[3072,-4096],[-3072,4096],[3072,4096]],fc=[[0,-4240],[-1792,-4184],[1792,-4184],[-940,-3308],[940,-3308],[0,-2816],[-3584,-2484],[3584,-2484],[-1788,-2300],[1788,-2300],[-2048,-1036],[0,-1024],[2048,-1036],[-1024,0],[1024,0],[-2048,1036],[0,1024],[2048,1036],[-1788,2300],[1788,2300],[-3584,2484],[3584,2484],[0,2816],[-940,3310],[940,3308],[-1792,4184],[1792,4184],[0,4240]],Hf=[[-2048,-2560,Math.PI/4],[2048,-2560,-Math.PI/4],[-256,-3840,0],[256,-3840,0],[0,-4608,0]],cu=[[-2304,-4608,0],[-2688,-4608,0],[2304,-4608,0],[2688,-4608,0]],je={0:{main:1010687,light:6272255,dark:670362,css:"#2f7bff",flame:[.55,.85,1],flameEnd:[.1,.3,1]},1:{main:16738834,light:16756832,dark:9054720,css:"#ff7a1a",flame:[1,.85,.45],flameEnd:[1,.28,.04]}};var hu=30,os=new w;function Ge(s,t,e,n){let i=document.createElement(s);return t&&(i.className=t),n!==void 0&&(i.innerHTML=n),e&&e.appendChild(i),i}function qv(){let r=270/hu,a="";for(let o=0;o<hu;o++){let l=(135+o*r+.8)*Math.PI/180,c=(135+(o+1)*r-.8)*Math.PI/180,h=100+Math.cos(l)*84,u=100+Math.sin(l)*84,d=100+Math.cos(c)*84,f=100+Math.sin(c)*84;a+=`<path class="seg" d="M${h.toFixed(2)} ${u.toFixed(2)} A84 84 0 0 1 ${d.toFixed(2)} ${f.toFixed(2)}"/>`}return`<svg viewBox="0 0 200 200" class="boost-svg">
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
  </svg>`}var pc=class{constructor(t){this.root=t,t.innerHTML="";let e=Ge("div","scoreboard",t);this.sbBlue=Ge("div","sb-team sb-blue",e,"<span>0</span>");let n=Ge("div","sb-clock",e);this.sbTime=Ge("div","sb-time",n,"5:00"),this.sbOT=Ge("div","sb-ot",n,""),this.sbOrange=Ge("div","sb-team sb-orange",e,"<span>0</span>"),this.viewsEl=Ge("div","hud-views",t),this.banner=Ge("div","banner",t),this.bannerMain=Ge("div","banner-main",this.banner),this.bannerSub=Ge("div","banner-sub",this.banner),this.feed=Ge("div","feed",t),this.fps=Ge("div","fps",t),this.views=[],this.bannerTimer=0,this.lastScores=[-1,-1],this.lastTime=""}show(t){this.root.classList.toggle("hidden",!t)}setup(t){this.viewsEl.innerHTML="",this.views=t.map(e=>{let n=Ge("div","hud-view",this.viewsEl);n.style.left=e.rect[0]*100+"%",n.style.top=e.rect[1]*100+"%",n.style.width=e.rect[2]*100+"%",n.style.height=e.rect[3]*100+"%",t.length>1&&n.classList.add("split");let i=Ge("div","boost-gauge",n,qv()),r=t.length>1?Ge("div","player-tag",n,e.label):null;r&&(r.style.color=je[e.team].css);let a=Ge("div","view-status",n),o=Ge("div","view-center",n),l=Ge("div","plates",n);return{box:n,gauge:i,status:a,center:o,plates:l,plateMap:new Map,segs:Array.from(i.querySelectorAll(".seg")),num:i.querySelector(".boost-num"),lastBoost:-1,statusTimer:0,centerTimer:0}})}setScore(t,e){t!==this.lastScores[0]&&(this.sbBlue.firstChild.textContent=t,this.pulse(this.sbBlue)),e!==this.lastScores[1]&&(this.sbOrange.firstChild.textContent=e,this.pulse(this.sbOrange)),this.lastScores=[t,e]}pulse(t){this.lastScores[0]<0||(t.classList.remove("pulse"),t.offsetWidth,t.classList.add("pulse"))}setClock(t,e,n){let i;if(n)i="\u221E";else{let r=Math.max(0,e?Math.floor(t):Math.ceil(t));i=`${e?"+":""}${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`}i!==this.lastTime&&(this.sbTime.textContent=i,this.lastTime=i),this.sbOT.textContent=e?"OVERTIME":""}setBoost(t,e){let n=this.views[t];if(!n)return;let i=Math.round(e);if(i===n.lastBoost)return;n.lastBoost=i,n.num.textContent=i;let r=Math.ceil(e/100*hu-.001);n.segs.forEach((a,o)=>a.classList.toggle("on",o<r)),n.gauge.classList.toggle("empty",i===0),n.gauge.classList.toggle("full",i===100)}viewStatus(t,e,n=1.6){let i=this.views[t];i&&(i.status.textContent=e,i.status.classList.add("visible"),i.statusTimer=n)}viewCenter(t,e,n=2){let i=this.views[t];i&&(i.center.textContent=e,i.center.classList.add("visible"),i.centerTimer=n)}showBanner(t,e="",n="",i=2){this.bannerMain.textContent=t,this.bannerSub.textContent=e,this.banner.className="banner visible "+n,this.bannerTimer=i}hideBanner(){this.banner.className="banner",this.bannerTimer=0}addFeed(t,e=-1){let n=Ge("div","feed-item"+(e>=0?" team"+e:""),this.feed,t);for(setTimeout(()=>n.classList.add("fade"),3500),setTimeout(()=>n.remove(),4200);this.feed.children.length>5;)this.feed.firstChild.remove()}updatePlates(t,e,n,i){let r=this.views[t];if(!r)return;let a=r.box.clientWidth,o=r.box.clientHeight,l=new Set;for(let c of n){if(c.car===i||c.car.demolished||(os.set(c.pos.x*.01,(c.pos.y+95)*.01,c.pos.z*.01).project(e),os.z>1||os.z<-1||Math.abs(os.x)>1.1||Math.abs(os.y)>1.1))continue;let h=r.plateMap.get(c.car.id);h||(h=Ge("div","plate team"+c.car.team,r.plates,c.name),r.plateMap.set(c.car.id,h));let u=(os.x+1)/2*a,d=(1-os.y)/2*o,f=e.position.distanceTo(os.set(c.pos.x*.01,c.pos.y*.01,c.pos.z*.01));h.style.transform=`translate(${u.toFixed(1)}px, ${d.toFixed(1)}px) translate(-50%, -100%) scale(${Math.max(.55,Math.min(1,12/f)).toFixed(3)})`,h.style.display="",l.add(c.car.id)}for(let[c,h]of r.plateMap)l.has(c)||(h.style.display="none")}update(t){this.bannerTimer>0&&(this.bannerTimer-=t,this.bannerTimer<=0&&this.banner.classList.remove("visible"));for(let e of this.views)e.statusTimer>0&&(e.statusTimer-=t,e.statusTimer<=0&&e.status.classList.remove("visible")),e.centerTimer>0&&(e.centerTimer-=t,e.centerTimer<=0&&e.center.classList.remove("visible"))}setFps(t){this.fps.textContent=t}};function ze(s,t,e,n){let i=document.createElement(s);return t&&(i.className=t),n!==void 0&&(i.innerHTML=n),e&&e.appendChild(i),i}var Yv={solo:{title:"PLAY vs CPU",humans:1},versus:{title:"2 PLAYERS \u2014 VERSUS",humans:2},coop:{title:"2 PLAYERS \u2014 CO-OP vs CPU",humans:2}},Vf=`
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
      <tr><td><span class="btn stick">R-Stick</span></td><td>Look around</td></tr>
      <tr><td><span class="btn menu">\u2630</span></td><td>Pause</td></tr>
    </table>
  </div>
  <div class="ctrl-col">
    <h3>\u2328\uFE0F Keyboard</h3>
    <table>
      <tr><th></th><th>Player 1</th><th>Player 2</th></tr>
      <tr><td>Drive / steer</td><td>W A S D</td><td>Arrow keys</td></tr>
      <tr><td>Jump / flip</td><td>Space</td><td>K</td></tr>
      <tr><td>Boost</td><td>Left Shift</td><td>L</td></tr>
      <tr><td>Powerslide / air roll</td><td>C or Ctrl</td><td>J</td></tr>
      <tr><td>Air roll L / R</td><td>Q / E</td><td>U / O</td></tr>
      <tr><td>Ball cam</td><td>R</td><td>I</td></tr>
      <tr><td>Pause</td><td>Esc</td><td>P</td></tr>
    </table>
    <p class="hint">In single player both key sets work. Flip = jump, then jump again while holding a direction.</p>
  </div>
</div>`,mc=class{constructor(t,e){this.app=t,this.root=e,this.visible=!1,this.items=[],this.focus=0,this.screen=null,this.joinSlots=[null,null],e.addEventListener("mousemove",()=>{this.mouse=!0})}hide(){this.visible=!1,this.root.classList.add("hidden"),this.root.innerHTML="",this.screen=null}show(t,e){this.visible=!0,this.root.classList.remove("hidden"),this.root.innerHTML="",this.root.className="menu screen-"+t,this.screen=t,this.data=e,this.items=[],this.focus=0,this.onBack=null,this.custom=null,this["screen_"+t].call(this,e),this.refreshFocus()}panel(t,e){let n=ze("div","panel",this.root);return t&&ze("div","panel-title",n,t),e&&ze("div","panel-sub",n,e),n}button(t,e,n,i=""){let r=ze("div","item button "+i,t,`<span>${e}</span>`),a={el:r,type:"button",action:n};return r.addEventListener("click",()=>{this.focus=this.items.indexOf(a),this.activate()}),r.addEventListener("mouseenter",()=>{this.focus=this.items.indexOf(a),this.refreshFocus()}),this.items.push(a),a}option(t,e,n,i,r){let a=ze("div","item option",t);ze("span","opt-label",a,e);let o=ze("span","opt-ctl",a),l=ze("span","arrow",o,"\u25C0"),c=ze("span","opt-value",o),h=ze("span","arrow",o,"\u25B6"),u={el:a,type:"option",values:n,get:i,set:r,val:c},d=()=>{let f=i(),m=n.find(v=>v.value===f)||n[0];c.textContent=m.label};return u.render=d,u.change=f=>{let m=i(),v=n.findIndex(p=>p.value===m);v=(v+f+n.length)%n.length,r(n[v].value),d(),this.app.audio.click(),this.onOptionChange&&this.onOptionChange()},l.addEventListener("click",f=>{f.stopPropagation(),u.change(-1)}),h.addEventListener("click",f=>{f.stopPropagation(),u.change(1)}),a.addEventListener("click",()=>u.change(1)),a.addEventListener("mouseenter",()=>{this.focus=this.items.indexOf(u),this.refreshFocus()}),d(),this.items.push(u),u}refreshFocus(){this.items.forEach((t,e)=>t.el.classList.toggle("focused",e===this.focus))}activate(){let t=this.items[this.focus];t&&(t.type==="button"?(this.app.audio.select(),t.action()):t.type==="option"&&t.change(1))}update(t){if(!this.visible||this.custom&&this.custom(t))return;let e=this.items.length;t.up&&e&&(this.focus=(this.focus-1+e)%e,this.refreshFocus(),this.app.audio.click()),t.down&&e&&(this.focus=(this.focus+1)%e,this.refreshFocus(),this.app.audio.click());let n=this.items[this.focus];n&&n.type==="option"&&(t.left&&n.change(-1),t.right&&n.change(1)),t.confirm&&this.activate(),t.back&&this.onBack&&(this.app.audio.click(),this.onBack()),t.start&&this.onStart&&this.onStart()}screen_main(){let t=ze("div","logo",this.root);t.innerHTML='<div class="logo-top">ROCKET</div><div class="logo-bottom">ARENA</div><div class="logo-tag">supersonic car soccer</div>';let e=this.panel();e.classList.add("main-panel"),this.button(e,"\u25B6  PLAY vs CPU",()=>this.show("setup","solo"),"primary"),this.button(e,"\u{1F465}  2 PLAYERS \u2014 VERSUS",()=>this.show("setup","versus")),this.button(e,"\u{1F91D}  2 PLAYERS \u2014 CO-OP vs CPU",()=>this.show("setup","coop")),this.button(e,"\u2699  SETTINGS",()=>this.show("settings")),this.button(e,"\u{1F3AE}  CONTROLS",()=>this.show("controls")),this.button(e,"\u26F6  FULLSCREEN",()=>this.app.toggleFullscreen());let n=ze("div","footer",this.root);this.padStatus(n)}padStatus(t){let e=()=>{let n=this.app.input.connectedPads();t.innerHTML=n.length?n.map((i,r)=>`<span class="pad-chip">\u{1F3AE} ${Bc(i.id)} ${r+1}</span>`).join("")+'<span class="footer-hint">\u24B6 select \xB7 \u24B7 back</span>':'<span class="footer-hint">Connect an Xbox controller and press any button \xB7 or use mouse / keyboard (Enter to select)</span>'};e(),this.footerTimer=setInterval(()=>{t.isConnected?e():clearInterval(this.footerTimer)},1e3)}screen_setup(t){let e=this.app.settings,n=Yv[t],i=this.panel(n.title,t==="solo"?"You (blue) vs CPU (orange)":t==="versus"?"Player 1 (blue) vs Player 2 (orange) \xB7 split screen":"Player 1 & Player 2 (blue) vs CPU (orange) \xB7 split screen"),r=t==="coop"?[{label:"2 vs 2",value:2},{label:"3 vs 3",value:3}]:[{label:"1 vs 1",value:1},{label:"2 vs 2",value:2},{label:"3 vs 3",value:3}],a="teamSize_"+t;r.some(l=>l.value===e[a])||(e[a]=r[0].value),this.option(i,"Team size",r,()=>e[a],l=>{e[a]=l}),this.option(i,"Match length",[{label:"3 minutes",value:180},{label:"5 minutes",value:300},{label:"7 minutes",value:420},{label:"1 minute",value:60},{label:"Unlimited",value:0}],()=>e.duration,l=>{e.duration=l}),this.option(i,"CPU skill",[{label:"Rookie",value:"rookie"},{label:"Pro",value:"pro"},{label:"All-Star",value:"allstar"}],()=>e.difficulty,l=>{e.difficulty=l}),this.option(i,"Stadium",[{label:"Night",value:"night"},{label:"Sunset",value:"sunset"}],()=>e.timeOfDay,l=>{e.timeOfDay=l}),t!=="solo"&&this.option(i,"Split screen",[{label:"Top / Bottom",value:"horizontal"},{label:"Side by side",value:"vertical"}],()=>e.split,l=>{e.split=l});let o=()=>{this.app.saveSettings(),t==="solo"?this.app.startMatch({mode:t,teamSize:e[a],duration:e.duration,difficulty:e.difficulty,split:e.split,humans:[{device:{type:"any"},team:0,name:"You"}]}):this.show("join",t)};this.button(i,t==="solo"?"\u25B6  KICK OFF":"\u25B6  CONTINUE",o,"primary"),this.button(i,"\u25C0  BACK",()=>this.show("main")),this.onBack=()=>this.show("main"),this.focus=this.items.length-2}screen_join(t){let e=this.app.settings,n=this.panel("PRESS TO JOIN","Each player presses <b>A</b> on their own controller"),i=ze("div","join-slots",n);this.joinSlots=[null,null];let r=[0,1].map(u=>{let d=t==="versus"?u:0,f=ze("div","join-slot team"+d,i);ze("div","join-title",f,`PLAYER ${u+1}`);let m=ze("div","join-body",f);return{box:f,body:m,team:d}}),a=ze("div","join-status",n),o=()=>{r.forEach((d,f)=>{let m=this.joinSlots[f];d.box.classList.toggle("joined",!!m),m?d.body.innerHTML=`<div class="join-device">${m.type==="pad"?"\u{1F3AE} "+Bc(this.app.input.pads[m.index]?.id):"\u2328\uFE0F Keyboard ("+(m.layout==="p1"?"WASD":"Arrows")+")"}</div><div class="join-team" style="color:${je[d.team].css}">${d.team===0?"BLUE":"ORANGE"} TEAM</div><div class="join-leave">\u24B7 / Backspace to leave</div>`:d.body.innerHTML=`<div class="join-wait">Press <b>\u24B6</b> on a controller<br><span>or ${f===0?"<b>Space</b> for keyboard (WASD)":"<b>Enter</b> for keyboard (Arrows)"}</span></div>`});let u=this.joinSlots[0]&&this.joinSlots[1];a.innerHTML=u?"<b>Ready!</b> Press <b>\u24B6</b> / <b>\u2630 Start</b> / <b>Enter</b> to kick off":"Waiting for players\u2026",a.classList.toggle("ready",!!u)};o();let l=()=>{let u=this.joinSlots.map((f,m)=>({device:f,team:t==="versus"?m:0,name:`Player ${m+1}`})),d=e["teamSize_"+t];this.app.startMatch({mode:t,teamSize:d,duration:e.duration,difficulty:e.difficulty,split:e.split,humans:u})},c=(u,d)=>u&&d&&u.type===d.type&&(u.type==="pad"?u.index===d.index:u.layout===d.layout),h=this.button(n,"\u25C0  BACK",()=>this.show("setup",t));this.custom=u=>{let d=this.app.input,f=this.joinSlots[0]&&this.joinSlots[1];for(let p of d.connectedPads()){let g={type:"pad",index:p.index},x=this.joinSlots.findIndex(T=>c(T,g));if(p.pressed("a")||p.pressed("menu")){if(x<0){let T=this.joinSlots.findIndex(M=>!M);T>=0&&(this.joinSlots[T]=g,this.app.audio.select(),d.rumble(g,.5,.5,150),o())}else if(f)return l(),!0}if(p.pressed("b"))if(x>=0)this.joinSlots[x]=null,this.app.audio.click(),o();else return this.show("setup",t),!0}let m=p=>d.keysPressed.has(p),v=(p,g)=>{let x={type:"kb",layout:p};if(this.joinSlots.findIndex(b=>c(b,x))>=0)return f?(l(),!0):!1;let M=this.joinSlots[g]?this.joinSlots.findIndex(b=>!b):g;return M>=0&&(this.joinSlots[M]=x,this.app.audio.select(),o()),!1};if(m("Space")&&v("p1",0)||(m("Enter")||m("NumpadEnter"))&&v("p2",1))return!0;if(m("Backspace")){for(let p=1;p>=0;p--)if(this.joinSlots[p]&&this.joinSlots[p].type==="kb"){this.joinSlots[p]=null,o();break}}return m("Escape")&&this.show("setup",t),!0}}screen_settings(){let t=this.app.settings,e=this.panel("SETTINGS");this.option(e,"Graphics",[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low (fast)",value:"low"}],()=>t.quality,i=>{t.quality=i}),this.option(e,"Default camera",[{label:"Ball cam",value:!0},{label:"Car cam",value:!1}],()=>t.ballCam,i=>{t.ballCam=i}),this.option(e,"Field of view",[90,95,100,105,110].map(i=>({label:i+"\xB0",value:i})),()=>t.fov,i=>{t.fov=i}),this.option(e,"Goal replays",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.replays,i=>{t.replays=i}),this.option(e,"Controller rumble",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.rumble,i=>{t.rumble=i}),this.option(e,"Volume",[0,1,2,3,4,5,6,7,8,9,10].map(i=>({label:i===0?"Off":String(i),value:i/10})),()=>Math.round(t.volume*10)/10,i=>{t.volume=i,this.app.audio.setVolume(i)}),this.option(e,"Show FPS",[{label:"Off",value:!1},{label:"On",value:!0}],()=>t.showFps,i=>{t.showFps=i});let n=()=>{this.app.applySettings(),this.show("main")};this.button(e,"\u25C0  BACK",n,"primary"),this.onBack=n}screen_controls(){let t=this.panel("CONTROLS");t.classList.add("wide"),ze("div","controls",t,Vf),this.button(t,"\u25C0  BACK",()=>this.show("main"),"primary"),this.onBack=()=>this.show("main")}screen_pause(){let t=this.panel("PAUSED");this.button(t,"\u25B6  RESUME",()=>this.app.resume(),"primary"),this.button(t,"\u21BB  RESTART MATCH",()=>this.app.restartMatch()),this.button(t,"\u{1F3AE}  CONTROLS",()=>this.show("pauseControls")),this.button(t,"\u23CF  QUIT TO MENU",()=>this.app.quitToMenu()),this.onBack=()=>this.app.resume(),this.onStart=()=>this.app.resume()}screen_pauseControls(){let t=this.panel("CONTROLS");t.classList.add("wide"),ze("div","controls",t,Vf),this.button(t,"\u25C0  BACK",()=>this.show("pause"),"primary"),this.onBack=()=>this.show("pause")}screen_results(t){let e=this.panel(t.winner===0?"BLUE TEAM WINS":"ORANGE TEAM WINS");e.classList.add("wide","results",t.winner===0?"win-blue":"win-orange"),ze("div","final-score",e,`<span class="b">${t.scores[0]}</span><span class="dash">\u2013</span><span class="o">${t.scores[1]}</span>`);let n=t.rows.map(i=>`<tr class="team${i.team}"><td class="nm">${i.name===t.mvp?'<span class="mvp">MVP</span> ':""}${i.name}${i.human?"":' <span class="cpu">CPU</span>'}</td><td>${i.score}</td><td>${i.goals}</td><td>${i.assists}</td><td>${i.saves}</td><td>${i.shots}</td><td>${i.demos}</td></tr>`).join("");ze("table","stats",e,`<tr><th>Player</th><th>Score</th><th>Goals</th><th>Assists</th><th>Saves</th><th>Shots</th><th>Demos</th></tr>${n}`),this.button(e,"\u21BB  REMATCH",()=>this.app.restartMatch(),"primary"),this.button(e,"\u23CF  MAIN MENU",()=>this.app.quitToMenu()),this.onBack=()=>this.app.quitToMenu()}};var Xf=Ot.halfX,pu=Ot.halfZ,kf=Ot.height,Zv=Ot.chamfer,ls=Ot.cornerR,uu=Ot.rampR,fu=Ot.goalHalfW,Jv=Ot.goalH,Kv=Ot.goalDepth,cs=Xf-ls,hs=pu-ls,mu=Xf+pu-Zv-ls*Math.SQRT2,Gf=cs,br=mu-cs,Er=mu-hs,Wf=hs;function du(s,t,e,n,i,r){let a=i-e,o=r-n,l=((s-e)*a+(t-n)*o)/(a*a+o*o);l=l<0?0:l>1?1:l;let c=s-e-a*l,h=t-n-o*l;return c*c+h*h}function gu(s,t){let e=s<0?-s:s,n=t<0?-t:t,i=Math.min(du(e,n,cs,0,Gf,br),du(e,n,Gf,br,Er,Wf),du(e,n,Er,Wf,0,hs)),r=e<cs&&n<hs&&e+n<mu,a=Math.sqrt(i);return(r?-a:a)-ls}function $v(s,t,e){let n=gu(s,e),i=Math.abs(t-kf/2)-kf/2,r=n+uu,a=i+uu,o=r>0?r:0,l=a>0?a:0;return-(Math.sqrt(o*o+l*l)+Math.min(Math.max(r,a),0)-uu)}function jv(s,t,e){return Math.min(fu-Math.abs(s),t,Jv-t,pu+Kv-Math.abs(e))}function Dn(s,t,e){let n=$v(s,t,e),i=jv(s,t,e);return n>i?n:i}function Ni(s,t,e,n){let r=Dn(s+1,t,e)-Dn(s-1,t,e),a=Dn(s,t+1,e)-Dn(s,t-1,e),o=Dn(s,t,e+1)-Dn(s,t,e-1),l=Math.hypot(r,a,o)||1;return n.x=r/l,n.y=a/l,n.z=o/l,n}function qf(s,t,e,n,i,r,a){let o=0;for(let l=0;l<32;l++){let c=Dn(s+n*o,t+i*o,e+r*o);if(c<.5)return o;if(o+=c,o>a)return-1}return o<=a?o:-1}function Ka(s=220,t=5){let e=[[cs,-br],[cs,br],[Er,hs],[-Er,hs],[-cs,br],[-cs,-br],[-Er,-hs],[Er,-hs]],n=[],i=(a,o,l,c,h)=>{let u=n[n.length-1];u&&Math.abs(u.x-a)<1e-6&&Math.abs(u.z-o)<1e-6||n.push({x:a,z:o,nx:-l,nz:-c,wall:h})};for(let a=0;a<8;a++){let o=e[a],l=e[(a+1)%8],c=e[(a+2)%8],h=l[0]-o[0],u=l[1]-o[1],d=Math.hypot(h,u),f=[u/d,-h/d],m=a===2?"orange":a===6?"blue":a%2===0?"side":"corner",v=[],p=Math.max(1,Math.ceil(d/s));for(let P=0;P<=p;P++)v.push(P/p);if(m==="orange"||m==="blue"){for(let P of[fu,-fu]){let y=(P-o[0])/h;y>0&&y<1&&v.push(y)}v.sort((P,y)=>P-y)}for(let P of v)i(o[0]+h*P+f[0]*ls,o[1]+u*P+f[1]*ls,f[0],f[1],m);let g=c[0]-l[0],x=c[1]-l[1],T=Math.hypot(g,x),M=[x/T,-g/T],b=Math.atan2(f[1],f[0]),E=Math.atan2(M[1],M[0]);for(;E<b;)E+=Math.PI*2;for(let P=1;P<t;P++){let y=b+(E-b)*(P/t);i(l[0]+Math.cos(y)*ls,l[1]+Math.sin(y)*ls,Math.cos(y),Math.sin(y),"arc")}}let r=0;for(let a=0;a<n.length;a++)a>0&&(r+=Math.hypot(n[a].x-n[a-1].x,n[a].z-n[a-1].z)),n[a].s=r;return n.total=r+Math.hypot(n[0].x-n[n.length-1].x,n[0].z-n[n.length-1].z),n}var Tr=new w,xu=new w,Yf=new w,_u=new w,vu=new w,yu=new w,Qv=we.friction,ty=2,ey=3e-4;function Jf(s,t){let e=we.radius;s.vel.y-=ri*t,s.vel.multiplyScalar(1-we.drag*t);let n=s.vel.length();n>we.maxSpeed&&s.vel.multiplyScalar(we.maxSpeed/n),s.pos.addScaledVector(s.vel,t);let i=0;for(let a=0;a<2;a++){let o=Dn(s.pos.x,s.pos.y,s.pos.z);if(o>=e)break;Ni(s.pos.x,s.pos.y,s.pos.z,Tr),s.pos.addScaledVector(Tr,e-o);let l=s.vel.dot(Tr);if(l<0){xu.copy(Tr).multiplyScalar(l),Yf.copy(s.vel).sub(xu),_u.crossVectors(Tr,s.angVel).multiplyScalar(e),vu.copy(Yf).add(_u);let c=Math.max(vu.length(),1e-4),h=-l/c,u=-l<40?0:we.restitution,d=yu.copy(vu).multiplyScalar(-Math.min(1,ty*h)*Qv);s.vel.addScaledVector(xu,-(1+u)),s.vel.add(d),s.angVel.add(_u.crossVectors(d,Tr).multiplyScalar(ey*e)),i=Math.max(i,-l)}}let r=s.angVel.length();return r>we.maxSpin&&s.angVel.multiplyScalar(we.maxSpin/r),i}var gc=class{constructor(){this.pos=new w(0,we.radius,0),this.vel=new w,this.angVel=new w,this.quat=new pe,this.prevPos=this.pos.clone(),this.prevQuat=this.quat.clone(),this.lastTouch=null,this.prevTouch=null,this.lastTouchTime=-10,this.frozen=!1}reset(){this.pos.set(0,we.radius,0),this.vel.set(0,0,0),this.angVel.set(0,0,0),this.prevPos.copy(this.pos),this.lastTouch=null,this.prevTouch=null,this.frozen=!0}step(t){if(this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.frozen)return 0;let e=Jf(this,t),n=this.angVel.length();return n>1e-4&&(yu.copy(this.angVel).divideScalar(n),Zf.setFromAxisAngle(yu,n*t),this.quat.premultiply(Zf).normalize()),e}goalState(){let t=we.radius;if(Math.abs(this.pos.x)<Ot.goalHalfW&&this.pos.y<Ot.goalH){if(this.pos.z>Ot.halfZ+t)return 1;if(this.pos.z<-Ot.halfZ-t)return 0}return-1}},Zf=new pe;function Mu(s,t,e,n){let i={pos:s.pos.clone(),vel:s.vel.clone(),angVel:s.angVel.clone()},r=Math.round(t/e);if(n.length=0,s.frozen){for(let a=0;a<=r;a++)n.push({t:a*e,pos:i.pos.clone(),vel:new w});return n}for(let a=0;a<=r;a++)n.push({t:a*e,pos:i.pos.clone(),vel:i.vel.clone()}),Jf(i,e);return n}var xc=new w,Nn=new w,Ae=new w,Su=new w,$a=new w,bu=new w,Yn=new w,Ds=new w,us=new w,Kf=new pe,Eu=new w,Tu=new w,$f=new w,jf=new w,Qf=new w,wu=new w,xi=Lt.hitboxHalf;function ny(s){return s<=500?.65:s<=2300?.65-.1*(s-500)/1800:Math.max(.3,.55-.25*(s-2300)/2300)}function iy(s,t,e,n){if(s.demolished||t.frozen)return!1;let i=we.radius;s.hitboxCenter(xc),Kf.copy(s.quat).invert(),Nn.copy(t.pos).sub(xc).applyQuaternion(Kf);let r=Math.max(-xi.x,Math.min(xi.x,Nn.x)),a=Math.max(-xi.y,Math.min(xi.y,Nn.y)),o=Math.max(-xi.z,Math.min(xi.z,Nn.z)),l=Nn.x-r,c=Nn.y-a,h=Nn.z-o,u=Math.hypot(l,c,h);if(u>=i)return!1;if(u<.001){let b=xi.x-Math.abs(Nn.x),E=xi.y-Math.abs(Nn.y),P=xi.z-Math.abs(Nn.z);l=c=h=0,b<E&&b<P?l=Math.sign(Nn.x)||1:E<P?c=Math.sign(Nn.y)||1:h=Math.sign(Nn.z)||1,u=0}else l/=u,c/=u,h/=u;Ae.set(l,c,h).applyQuaternion(s.quat);let d=i-u;Su.set(r,a,o).applyQuaternion(s.quat).add(xc);let f=we.mass,m=Lt.mass;t.pos.addScaledVector(Ae,d*(m/(f+m))),s.pos.addScaledVector(Ae,-d*(f/(f+m)));let v=Math.min(4600,Yn.copy(s.vel).sub(t.vel).length());$a.copy(Su).sub(s.pos),bu.crossVectors(s.angVel,$a).add(s.vel);let p=Yn.copy(t.vel).sub(bu).dot(Ae);if(p>=0)return!0;Yn.crossVectors($a,Ae),s.applyInvInertia(Yn),Ds.crossVectors(Yn,$a);let g=1/f+1/m+Ae.dot(Ds),x=-p/g;t.vel.addScaledVector(Ae,x/f),s.vel.addScaledVector(Ae,-x/m),s.onGround||(Yn.crossVectors($a,Ae).multiplyScalar(-x*.5),s.angVel.add(s.applyInvInertia(Yn))),Yn.copy(bu).sub(t.vel),Yn.addScaledVector(Ae,-Yn.dot(Ae)),t.angVel.addScaledVector(us.crossVectors(Ae,Yn),-.6/i);let T=-p;e-s.lastBallHit>.1&&(s.forward(Ds),us.copy(t.pos).sub(xc),us.y*=.35,us.addScaledVector(Ds,-.35*us.dot(Ds)),us.normalize(),t.vel.addScaledVector(us,v*ny(v)),T=Math.max(T,v)),s.lastBallHit=e;let M=t.vel.length();return M>we.maxSpeed&&t.vel.multiplyScalar(we.maxSpeed/M),n&&n.push({type:"ballHit",car:s,strength:T,point:Su.clone()}),!0}function sy(s,t,e,n,i,r,a){let o=s.x-t.x*i,l=s.y-t.y*i,c=s.z-t.z*i,h=e.x-n.x*i,u=e.y-n.y*i,d=e.z-n.z*i,f=t.x*2*i,m=t.y*2*i,v=t.z*2*i,p=n.x*2*i,g=n.y*2*i,x=n.z*2*i,T=o-h,M=l-u,b=c-d,E=f*f+m*m+v*v,P=f*p+m*g+v*x,y=p*p+g*g+x*x,A=f*T+m*M+v*b,I=p*T+g*M+x*b,N=E*y-P*P,F=N>1e-6?(P*I-y*A)/N:0;F=Math.max(0,Math.min(1,F));let H=(P*F+I)/y;H<0?(H=0,F=Math.max(0,Math.min(1,-A/E))):H>1&&(H=1,F=Math.max(0,Math.min(1,(P-A)/E))),r.set(o+f*F,l+m*F,c+v*F),a.set(h+p*H,u+g*H,d+x*H)}function ry(s,t,e,n,i){if(s.demolished||t.demolished||(s.hitboxCenter(Eu),t.hitboxCenter(Tu),Eu.distanceToSquared(Tu)>62500))return;s.forward($f),t.forward(jf);let r=36;sy(Eu,$f,Tu,jf,xi.z-r*.6,Qf,wu),Ae.copy(wu).sub(Qf);let a=Ae.length();if(a>=r*2)return;a<.001?(Ae.set(1,0,0),a=0):Ae.divideScalar(a);let o=r*2-a;s.pos.addScaledVector(Ae,-o/2),t.pos.addScaledVector(Ae,o/2);let l=Yn.copy(t.vel).sub(s.vel).dot(Ae);if(l>=0)return;let c=s.id<t.id?s.id*1e3+t.id:t.id*1e3+s.id,h=i.get(c)??-10,u=s.vel.dot(Ae),d=-t.vel.dot(Ae),f=u>=d?s:t,m=f===s?t:s,v=f===s?Ae:us.copy(Ae).negate();f.forward(Ds);let p=Ds.dot(v)>.55;if(p&&f.supersonic&&f.team!==m.team){m.demolish(),f.stats.demos++,n&&n.push({type:"demo",car:m,by:f,point:m.pos.clone()});return}let g=-(1+.3)*l/2;s.vel.addScaledVector(Ae,-g),t.vel.addScaledVector(Ae,g);let x=-l;p&&x>350&&e-h>.25&&(m.vel.addScaledVector(v,x*.55),m.vel.y+=Math.min(600,x*.28),m.noGround=.15,m.onGround=!1,i.set(c,e),n&&n.push({type:"bump",car:m,by:f,strength:x,point:wu.clone()}))}var _c=class{constructor(){this.ball=new gc,this.cars=[],this.time=0,this.events=[],this.bumpTimes=new Map,this.pads=[];for(let[t,e]of dc)this.pads.push({x:t,z:e,big:!0,active:!0,timer:0});for(let[t,e]of fc)this.pads.push({x:t,z:e,big:!1,active:!0,timer:0});this.respawnIndex=0}addCar(t){return t.events=this.events,this.cars.push(t),t}resetPads(){for(let t of this.pads)t.active=!0,t.timer=0}respawn(t){let e=cu[this.respawnIndex++%cu.length],n=t.team===0?1:-1,i=t.team===0?e[2]:Math.PI-e[2];t.place(e[0]*n,e[1]*n,i),this.events.push({type:"respawn",car:t})}step(t){this.time+=t;let{ball:e,cars:n}=this;for(let r of n){if(r.demolished){r.respawnTimer-=t,r.prevPos.copy(r.pos),r.respawnTimer<=0&&this.respawn(r);continue}r.step(t)}let i=e.step(t);i>250&&this.events.push({type:"bounce",strength:i,point:e.pos.clone()});for(let r of n)iy(r,e,this.time,this.events)&&(e.lastTouch!==r&&(e.prevTouch=e.lastTouch,e.lastTouch=r),e.lastTouchTime=this.time);for(let r=0;r<n.length;r++)for(let a=r+1;a<n.length;a++)ry(n[r],n[a],this.time,this.events,this.bumpTimes);for(let r of this.pads){if(!r.active){r.timer-=t,r.timer<=0&&(r.active=!0);continue}let a=r.big?208:144;for(let o of n){if(o.demolished||o.boost>=100||o.pos.y>180)continue;let l=o.pos.x-r.x,c=o.pos.z-r.z;if(l*l+c*c<a*a){o.boost=r.big?100:Math.min(100,o.boost+12),r.active=!1,r.timer=r.big?10:4,this.events.push({type:"boostPickup",car:o,big:r.big,pad:r});break}}}}};var tp=new w(0,1,0),Se=new w,Fe=new w,vc=new w,_i=new w,Ke=new w,Au=new w,We=new w,ja=new w,be=new w,yc=new w,Mc=new w,Ru=new w,wr=new pe,Sc=new pe,ep=new pe,vn=Lt.hitboxHalf,Le=Lt.hitboxOffset,Cu=new w(12/(Lt.mass*((2*vn.y)**2+(2*vn.z)**2)),12/(Lt.mass*((2*vn.x)**2+(2*vn.z)**2)),12/(Lt.mass*((2*vn.x)**2+(2*vn.y)**2))),Qa=[];for(let s of[-1,1])for(let t of[-1,1])for(let e of[-1,1])Qa.push(new w(Le.x+s*vn.x,Le.y+t*vn.y,Le.z+e*vn.z));Qa.push(new w(Le.x,Le.y+vn.y,Le.z),new w(Le.x,Le.y-vn.y,Le.z),new w(Le.x+vn.x,Le.y,Le.z),new w(Le.x-vn.x,Le.y,Le.z),new w(Le.x,Le.y,Le.z+vn.z),new w(Le.x,Le.y,Le.z-vn.z));function ay(s){return s<1400?1600-1440*s/1400:s<1410?160*(1-(s-1400)/10):0}var Ar=[[0,.0069],[500,.00398],[1e3,.00235],[1500,.001375],[1750,.0011],[2500,88e-5]];function oy(s){s=Math.abs(s);for(let t=1;t<Ar.length;t++)if(s<=Ar[t][0]){let e=Ar[t-1],n=Ar[t],i=(s-e[0])/(n[0]-e[0]);return e[1]+(n[1]-e[1])*i}return Ar[Ar.length-1][1]}function ly(){return{throttle:0,steer:0,pitch:0,yaw:0,roll:0,jump:!1,boost:!1,powerslide:!1}}var cy=0,bc=class{constructor(t,e="Player"){this.id=cy++,this.team=t,this.name=e,this.pos=new w,this.vel=new w,this.angVel=new w,this.quat=new pe,this.prevPos=new w,this.prevQuat=new pe,this.input=ly(),this.prevJump=!1,this.boost=lu,this.onGround=!1,this.groundNormal=new w(0,1,0),this.wheelContacts=0,this.wheelDist=[0,0,0,0],this.hasJumped=!1,this.canDodge=!1,this.jumpHold=0,this.noGround=0,this.sinceJump=10,this.dodgeTime=0,this.dodgeAxis=new w,this.dodgePitchSign=0,this.boosting=!1,this.supersonic=!1,this.demolished=!1,this.respawnTimer=0,this.frozen=!1,this.turtleTime=0,this.selfRight=0,this.yawRate=0,this.steerVisual=0,this.wheelSpin=0,this.lastBallHit=-10,this.bodyHit=0,this.events=null,this.stats={goals:0,assists:0,shots:0,saves:0,demos:0,score:0}}forward(t){return t.set(0,0,1).applyQuaternion(this.quat)}up(t){return t.set(0,1,0).applyQuaternion(this.quat)}left(t){return t.set(1,0,0).applyQuaternion(this.quat)}hitboxCenter(t){return t.set(Le.x,Le.y,Le.z).applyQuaternion(this.quat).add(this.pos)}place(t,e,n,i=lu){this.pos.set(t,Lt.restHeight,e),this.vel.set(0,0,0),this.angVel.set(0,0,0),this.quat.setFromAxisAngle(tp,n),this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.boost=i,this.onGround=!0,this.groundNormal.set(0,1,0),this.hasJumped=!1,this.canDodge=!1,this.jumpHold=0,this.noGround=0,this.dodgeTime=0,this.demolished=!1,this.supersonic=!1,this.boosting=!1,this.turtleTime=0,this.yawRate=0}demolish(){this.demolished=!0,this.respawnTimer=3,this.vel.set(0,0,0),this.angVel.set(0,0,0),this.boosting=!1}speed(){return this.vel.length()}applyInvInertia(t){return ep.copy(this.quat).invert(),t.applyQuaternion(ep),t.x*=Cu.x,t.y*=Cu.y,t.z*=Cu.z,t.applyQuaternion(this.quat)}step(t){if(this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.demolished||this.frozen){this.boosting=!1,this.prevJump=this.input.jump;return}let e=this.input,n=e.jump&&!this.prevJump;this.prevJump=e.jump,this.sinceJump+=t,this.noGround>0&&(this.noGround-=t),this.forward(Se),this.up(Fe),this.left(vc);let i=0,r=0;if(Au.set(0,0,0),this.noGround<=0){let c=Lt.restHeight+14;for(let h=0;h<4;h++){let u=Lt.wheels[h];We.copy(this.pos).addScaledVector(vc,u.x).addScaledVector(Se,u.z);let d=qf(We.x,We.y,We.z,-Fe.x,-Fe.y,-Fe.z,c);this.wheelDist[h]=d,d>=0&&(i++,r+=d,We.addScaledVector(Fe,-d+2),Ni(We.x,We.y,We.z,Ke),Au.add(Ke))}}else this.wheelDist.fill(-1);this.wheelContacts=i;let a=!1;i>=2&&(Ke.copy(Au).normalize(),Ke.dot(Fe)>.55&&(a=!0,-ri*Ke.y>Lt.stickyAccel&&(a=!1,i>=3&&(this.hasJumped=!1,this.canDodge=!0,this.sinceJump=0))));let o=n;a&&n&&(o=!1,this.vel.addScaledVector(Fe,Lt.jumpImpulse),this.jumpHold=Lt.jumpHoldTime,this.hasJumped=!0,this.leftWithoutJump=!1,this.canDodge=!0,this.sinceJump=0,this.noGround=.12,a=!1,this.onGround=!1,this.events&&this.events.push({type:"jump",car:this})),a?this.groundStep(t,Ke,r/i):this.airStep(t,o),this.bodyCollide(t,a);let l=this.vel.length();l>Lt.maxSpeed&&this.vel.multiplyScalar(Lt.maxSpeed/l),l>=Lt.supersonic?this.supersonic=!0:l<Lt.supersonic-100&&(this.supersonic=!1),this.steerVisual+=(e.steer-this.steerVisual)*Math.min(1,t*12),this.forward(Se),this.wheelSpin+=this.vel.dot(Se)/14*t}groundStep(t,e,n){let i=this.input,r=!this.onGround;if(this.onGround=!0,this.groundNormal.copy(e),this.hasJumped=!1,this.leftWithoutJump=!1,this.canDodge=!1,this.jumpHold=0,this.dodgeTime=0,this.turtleTime=0,this.selfRight=0,r){let g=-this.vel.dot(e);this.events&&g>250&&this.events.push({type:"land",car:this,strength:g})}this.up(Fe),wr.setFromUnitVectors(Fe,e),Sc.identity().slerp(wr,1-Math.exp(-t*28)),this.quat.premultiply(Sc).normalize(),this.vel.y-=ri*t;let a=this.vel.dot(e);a<40&&this.vel.addScaledVector(e,-a),this.forward(Se),Se.addScaledVector(e,-Se.dot(e)).normalize(),_i.crossVectors(Se,e).normalize();let o=this.vel.dot(Se),l=i.throttle,c=i.boost&&this.boost>0;c&&(l=1);let h=0;if(l!==0)o*l>=0||Math.abs(o)<25?h=ay(Math.abs(o))*l:(h=Lt.brakeAccel*Math.sign(l),Math.abs(o)<Lt.brakeAccel*t&&(h=-o/t));else if(Math.abs(o)>0){let g=Math.min(Lt.coastDecel,Math.abs(o)/t);h=-Math.sign(o)*g}this.vel.addScaledVector(Se,h*t),c&&(this.vel.addScaledVector(Se,Lt.boostAccelGround*t),this.boost=Math.max(0,this.boost-Lt.boostUsePerSec*t)),this.boosting=c;let u=this.vel.dot(Se),d=-i.steer*oy(u)*u;i.powerslide&&(d*=1.35),this.yawRate+=(d-this.yawRate)*(1-Math.exp(-t*18)),Math.abs(this.yawRate)>1e-5&&(wr.setFromAxisAngle(e,this.yawRate*t),this.quat.premultiply(wr).normalize());let f=Math.min(1,Math.max(.3,(ri*Math.max(0,e.y)+Lt.stickyAccel)/(ri+Lt.stickyAccel))),m=(i.powerslide?2.2:14)*f;this.forward(Se),Se.addScaledVector(e,-Se.dot(e)).normalize(),_i.crossVectors(Se,e).normalize();let v=this.vel.dot(_i);this.vel.addScaledVector(_i,-v*(1-Math.exp(-t*m))),this.pos.addScaledVector(this.vel,t);let p=Lt.restHeight-n;this.pos.addScaledVector(e,p*(1-Math.exp(-t*30))),this.angVel.copy(e).multiplyScalar(this.yawRate)}airStep(t,e){let n=this.input;this.onGround&&(this.onGround=!1,this.hasJumped||(this.canDodge=!0,this.sinceJump=0,this.hasJumped=!0,this.leftWithoutJump=!0)),this.onGround=!1,this.yawRate=0,this.forward(Se),this.up(Fe),this.left(vc),_i.copy(vc).negate(),this.vel.y-=ri*t,this.jumpHold>0&&(n.jump?(this.vel.addScaledVector(Fe,Lt.jumpHoldAccel*t),this.jumpHold-=t):this.jumpHold=0);let i=this.leftWithoutJump?1e9:Lt.doubleJumpWindow;if(e&&this.canDodge&&this.sinceJump<i){this.canDodge=!1,this.jumpHold=0;let l=-n.pitch,c=n.yaw;if(Math.abs(l)+Math.abs(c)>=.5){let h=l,u=c,d=Math.hypot(h,u);d>1&&(h/=d,u/=d),be.set(Se.x,0,Se.z),be.lengthSq()<1e-4&&be.set(-Fe.x,0,-Fe.z),be.normalize(),yc.set(-be.z,0,be.x);let f=h>=0?Lt.dodgeImpulse:Lt.dodgeImpulse*1.066,m=this.vel.length(),v=Lt.dodgeImpulse*(1+.9*Math.min(1,m/Lt.maxSpeed));this.vel.addScaledVector(be,h*f).addScaledVector(yc,u*v*.9),this.vel.y*=.35,this.angVel.copy(_i).multiplyScalar(-h*Lt.maxAngVel).addScaledVector(Se,u*Lt.maxAngVel),this.dodgeTime=Lt.dodgeTime,this.dodgeAxis.copy(this.angVel),this.dodgePitchSign=Math.sign(-h),this.events&&this.events.push({type:"dodge",car:this})}else this.vel.addScaledVector(Fe,Lt.jumpImpulse),this.events&&this.events.push({type:"jump",car:this})}if(this.selfRight>0)this.selfRight-=t,be.set(Se.x,0,Se.z),be.lengthSq()<.001&&be.set(-Fe.x,0,-Fe.z),be.lengthSq()<1e-6&&be.set(0,0,1),be.normalize(),Sc.setFromAxisAngle(tp,Math.atan2(be.x,be.z)),this.quat.slerp(Sc,1-Math.exp(-t*9)),this.angVel.set(0,0,0);else if(this.dodgeTime>0){if(this.dodgeTime-=t,this.dodgePitchSign!==0&&Math.sign(n.pitch)===this.dodgePitchSign&&Math.abs(n.pitch)>.5){let c=this.angVel.dot(_i);this.angVel.addScaledVector(_i,-c*Math.min(1,t*20))}}else{let l=n.pitch,c=n.yaw,h=n.roll;n.powerslide&&(h=Math.max(-1,Math.min(1,h+n.yaw)),c=0);let u=this.angVel.dot(_i),d=this.angVel.dot(Fe),f=this.angVel.dot(Se);u+=(Lt.airPitch*l-Lt.dampPitch*u*(1-Math.abs(l)))*t,d+=(-Lt.airYaw*c-Lt.dampYaw*d*(1-Math.abs(c)))*t,f+=(Lt.airRoll*h-Lt.dampRoll*f)*t,this.angVel.copy(_i).multiplyScalar(u).addScaledVector(Fe,d).addScaledVector(Se,f)}let r=this.angVel.length();r>Lt.maxAngVel&&this.angVel.multiplyScalar(Lt.maxAngVel/r);let a=n.boost&&this.boost>0;a?(this.vel.addScaledVector(Se,Lt.boostAccelAir*t),this.boost=Math.max(0,this.boost-Lt.boostUsePerSec*t)):n.throttle!==0&&this.vel.addScaledVector(Se,Lt.airThrottleAccel*n.throttle*t),this.boosting=a,this.pos.addScaledVector(this.vel,t);let o=this.angVel.length();o>1e-6&&(be.copy(this.angVel).divideScalar(o),wr.setFromAxisAngle(be,o*t),this.quat.premultiply(wr).normalize()),this.up(Fe),Ni(this.pos.x,this.pos.y,this.pos.z,Ke),this.turtled=this.bodyHit>0&&this.vel.lengthSq()<300*300&&Fe.dot(Ke)<.5,this.turtled?(this.turtleTime+=t,(e&&this.turtleTime>.15||this.turtleTime>2.5)&&(this.vel.y+=340,this.selfRight=.6,this.turtleTime=0,this.canDodge=!1)):this.turtleTime=0}bodyCollide(t,e){this.bodyHit=Math.max(0,this.bodyHit-t);for(let n=0;n<3;n++){let i=0,r=-1;for(let u=0;u<Qa.length;u++){We.copy(Qa[u]).applyQuaternion(this.quat).add(this.pos);let d=Dn(We.x,We.y,We.z);if(d<i){if(e&&(Ni(We.x,We.y,We.z,Ke),this.up(Fe),Math.abs(Ke.dot(Fe))>.6))continue;i=d,r=u}}if(r<0)return;if(We.copy(Qa[r]).applyQuaternion(this.quat).add(this.pos),Ni(We.x,We.y,We.z,Ke),this.pos.addScaledVector(Ke,-i+.1),this.bodyHit=.2,ja.copy(We).sub(this.pos),e){let u=this.vel.dot(Ke);u<0&&this.vel.addScaledVector(Ke,-u*1.2);continue}Ru.crossVectors(this.angVel,ja).add(this.vel);let a=Ru.dot(Ke);if(a>=0)continue;be.crossVectors(ja,Ke),this.applyInvInertia(be),yc.crossVectors(be,ja);let o=1/Lt.mass+Ke.dot(yc),c=-(1+(a<-350?.3:0))*a/o;Mc.copy(Ke).multiplyScalar(c),be.copy(Ru).addScaledVector(Ke,-a);let h=be.length();if(h>.001){be.divideScalar(h);let u=Math.min(.6*c,h*Lt.mass/2);Mc.addScaledVector(be,-u)}this.vel.addScaledVector(Mc,1/Lt.mass),be.crossVectors(ja,Mc),this.angVel.add(this.applyInvInertia(be))}}};var np={rookie:{replan:.32,aimError:650,boost:.35,dodge:!1,kickoffFlip:!1,jumpReach:200,aerial:!1,maxSpeed:1900,wrongSideCare:.4},pro:{replan:.14,aimError:260,boost:.85,dodge:!0,kickoffFlip:!0,jumpReach:420,aerial:!1,maxSpeed:2300,wrongSideCare:.8},allstar:{replan:.05,aimError:90,boost:1,dodge:!0,kickoffFlip:!0,jumpReach:1300,aerial:!0,maxSpeed:2300,wrongSideCare:1}},dn=new w,Ec=new w,ds=new w,Rr=new w,_e=new w,Zn=new w,Un=new w,hy=new w(0,-ri,0),ip=new w,vi=we.radius,Fn=Ot.halfZ,Ui=Ot.goalHalfW;function sp(s){if(s<=0)return 0;let t=(Lt.jumpHoldAccel-ri)/2;if(s<=74.6)return(-Lt.jumpImpulse+Math.sqrt(Lt.jumpImpulse**2+4*t*s))/(2*t);let e=453.3,i=e*e-4*325*(s-74.6);return i<0?1/0:.2+(e-Math.sqrt(i))/650}function uy(s){if(s<=96)return sp(s);let t=712,n=t*t-4*325*(s-96);return n<0?1/0:.25+(t-Math.sqrt(n))/650}var Cr=[[0,.0069],[500,.00398],[1e3,.00235],[1500,.001375],[1750,.0011],[2500,88e-5]];function dy(s){for(let t=1;t<Cr.length;t++)if(s<=Cr[t][0]){let e=Cr[t-1],n=Cr[t];return e[1]+(n[1]-e[1])*(s-e[0])/(n[0]-e[0])}return Cr[Cr.length-1][1]}function fy(s,t,e,n){t=Math.max(0,Math.min(t,e));let i=(e-t)/n,r=(t+e)/2*i;return s<=r?(-t+Math.sqrt(t*t+2*n*s))/n:i+(s-r)/e}var Tc=class{constructor(t,e="pro"){this.car=t,this.cfg=np[e]||np.pro,this.replanT=Math.random()*.1,this.target=new w,this.ballTarget=new w,this.desiredSpeed=2300,this.interceptT=1,this.mode="chase",this.seq=null,this.seqT=0,this.stuckT=0,this.reverseT=0,this.aimOffset=(Math.random()-.5)*this.cfg.aimError,this.aerialing=!1,this.lastJumpAt=-10,this.careT=0,this.cares=!0,this.retreatStart=-10}get attackSign(){return this.car.team===0?1:-1}startSeq(t){this.seq=t,this.seqT=0}update(t,e){let n=this.car,i=n.input;if(!n.demolished){if(this.replanT-=t,this.replanT<=0&&(this.replanT=this.cfg.replan*(.7+Math.random()*.6),this.plan(e)),i.throttle=0,i.steer=0,i.pitch=0,i.yaw=0,i.roll=0,i.boost=!1,i.powerslide=!1,this.seq){this.seqT+=t;let r=null;for(let a of this.seq)this.seqT>=a.t&&(r=a);if(!r||this.seqT>this.seq[this.seq.length-1].t+.05||r.end&&this.seqT>=r.t)this.seq=null;else{i.jump=!!r.jump,i.pitch=r.pitch||0,i.yaw=r.yaw||0,i.steer=r.yaw||0,i.throttle=r.throttle??1,i.boost=!!r.boost&&n.boost>0,r.aerial&&this.aerialControl(t,e);return}}if(i.jump=!1,!n.onGround){if(n.turtled){this.turtleTap=(this.turtleTap||0)+1,i.jump=this.turtleTap%8<4;return}this.aerialing?this.aerialControl(t,e):this.recover();return}this.aerialing=!1,this.drive(t,e)}}plan(t){let e=this.car,n=t.world.ball,i=this.attackSign,r=t.pred;e.forward(dn);let a=e.vel.length(),o=e.boost>8&&this.cfg.boost>.3,l=o?Math.min(this.cfg.maxSpeed,2200):1400,c=o?1900:1e3;if(t.kickoff){if(this.isClosest(t,n.pos)){this.mode="kickoff",this.target.copy(n.pos).add(Un.set(0,0,-i*40)),this.ballTarget.copy(n.pos),this.desiredSpeed=2300;return}this.mode="support",this.setSupportTarget(t,!0);return}let h=this.cfg.jumpReach,u=null,d=null;for(let x=2;x<r.length;x+=2){let T=r[x];if(!d&&T.pos.z*i<-(Fn+vi*.5)&&Math.abs(T.pos.x)<Ui+100&&(d=T),u||T.pos.y>h+vi)continue;this.shotDir(T.pos,d||t.threatOwn,Zn),Un.copy(T.pos).addScaledVector(Zn,-(vi+70)),_e.copy(Un).sub(e.pos).setY(0);let M=_e.length();_e.normalize();let b=Math.acos(xe.clamp(_e.dot(dn.clone().setY(0).normalize()),-1,1)),E=e.vel.dot(_e),P=fy(Math.max(0,M-60),E,l,c)+b*.32;if(T.pos.y>150&&(P+=.1),P<=T.t+.02){u=T;break}}u||(u=r[r.length-1]),this.interceptT=u.t,this.ballTarget.copy(u.pos);let f=!0;for(let x of t.teammates){if(x===e||x.demolished)continue;let T=x.pos.distanceTo(u.pos)/Math.max(800,x.vel.length()*.8+600),M=e.pos.distanceTo(u.pos)/Math.max(800,a*.8+600),b=(u.pos.z-x.pos.z)*i>0;if(T+(b?0:.6)<M-.15){f=!1;break}}let m=(e.pos.z-u.pos.z)*i,v=u.pos.z*i<0;if(!!d&&(m>-200||f)){if(m>300){this.mode="retreat",this.setRetreatTarget(u.pos),this.desiredSpeed=2300;return}this.mode="save",this.setHitTarget(u,d);return}if(!f){if(e.boost<30&&Math.random()<this.cfg.boost&&this.setBoostTarget(t)){this.mode="boost";return}this.mode="support",this.setSupportTarget(t,!1);return}this.careT-=this.cfg.replan,this.careT<=0&&(this.careT=2,this.cares=Math.random()<this.cfg.wrongSideCare);let g=this.mode==="retreat"&&m>-150&&t.time-this.retreatStart<3;if(m>250&&this.cares||g){this.mode!=="retreat"&&(this.retreatStart=t.time),this.mode="retreat",v||m>1500?this.setRetreatTarget(u.pos):this.target.set(u.pos.x*.5+(e.pos.x>u.pos.x?900:-900),0,u.pos.z-i*1300),this.clampTarget(),this.desiredSpeed=2300;return}if(e.boost<15&&!v&&u.t>2.2&&this.setBoostTarget(t)){this.mode="boost";return}this.mode="attack",this.setHitTarget(u,null)}aimPoint(t,e){let n=this.attackSign;return e?ip.set(t.x>=0?4e3:-4e3,0,t.z+n*3e3):ip.set(xe.clamp(t.x*.25+this.aimOffset,-Ui+150,Ui-150),0,n*(Fn+300))}shotDir(t,e,n){let i=this.aimPoint(t,e);if(n.copy(i).sub(t).setY(0).normalize(),ds.copy(t).sub(this.car.pos).setY(0),ds.lengthSq()<1)return n;ds.normalize();let r=Math.acos(xe.clamp(n.dot(ds),-1,1)),a=xe.clamp((r-.6)/1.6,0,.75);return a>0&&n.lerp(ds,a).normalize(),n}setHitTarget(t,e){let n=this.car;this.shotDir(t.pos,e,Zn);let i=Un.copy(t.pos).sub(n.pos).setY(0).length(),r=xe.clamp(i*.45,vi+40,1200);for(;r>vi+40&&(Un.copy(t.pos).addScaledVector(Zn,-r),!(gu(Un.x,Un.z)<-320&&Math.abs(Un.z)<Fn-250));)r-=80;r=Math.max(r,vi+40),this.target.copy(t.pos).addScaledVector(Zn,-r),this.target.y=0,this.clampTarget();let a=n.pos.distanceTo(this.target)+r,o=Math.max(.05,t.t),l=t.pos.y>180;this.desiredSpeed=l?xe.clamp(a/o,300,2300):2300,n.forward(dn),dn.setY(0).normalize();let c=Math.acos(xe.clamp(dn.dot(Zn),-1,1));i<1100&&c>.6&&!e&&(this.desiredSpeed=Math.min(this.desiredSpeed,700+(1100-Math.min(1100,c*500))))}setRetreatTarget(t){let e=this.attackSign,n=t.x>0?-Ui*.8:Ui*.8;this.target.set(n,0,-e*(Fn-350))}setSupportTarget(t,e){let n=this.car,i=t.world.ball,r=this.attackSign,a=t.teammates.indexOf(n),o=a%2===0?-1:1;if(e)n.boost<60&&Math.abs(n.pos.x)>1e3?this.target.set(Math.sign(n.pos.x)*3072,0,-r*4096):this.target.set(0,0,-r*(Fn-500));else{let c=i.pos.z-r*(2200+a*900);this.target.set(i.pos.x*.35+o*1100,0,Math.max(-Fn+400,Math.min(Fn-400,c*r))*r)}this.clampTarget();let l=n.pos.distanceTo(this.target);this.desiredSpeed=l>1500?2300:l>400?1400:300}setBoostTarget(t){let e=this.car,n=this.attackSign,i=null,r=1/0;for(let a of t.world.pads){if(!a.big||!a.active||a.z*n>1500)continue;let o=Math.hypot(a.x-e.pos.x,a.z-e.pos.z);o<r&&(r=o,i=a)}return!i||r>4500?!1:(this.target.set(i.x,0,i.z),this.desiredSpeed=2300,!0)}clampTarget(){this.target.x=xe.clamp(this.target.x,-Ot.halfX+250,Ot.halfX-250),this.target.z=xe.clamp(this.target.z,-Fn+150,Fn-150)}isClosest(t,e){let n=this.car.pos.distanceTo(e);for(let i of t.teammates){if(i===this.car)continue;let r=i.pos.distanceTo(e);if(r<n-5||Math.abs(r-n)<=5&&i.pos.x*this.attackSign<this.car.pos.x*this.attackSign)return!1}return!0}drive(t,e){let n=this.car,i=n.input,r=n.groundNormal;n.forward(dn),Rr.crossVectors(dn,r).normalize();let a=n.vel.length(),o=n.vel.dot(dn),l=e.world.ball,c=this.target,h=n.pos.distanceTo(l.pos);if((this.mode==="attack"||this.mode==="save"||this.mode==="kickoff")&&h<650&&l.pos.y<260&&(this.shotDir(l.pos,this.mode==="save",Zn),Un.copy(l.pos).addScaledVector(Zn,-(vi*.6)),_e.copy(l.pos).sub(n.pos).setY(0).normalize(),_e.dot(Zn)>.2&&(c=Un)),Math.abs(n.pos.z)>Fn-60&&(Math.abs(c.x)>Ui-100||Math.abs(c.z)<Fn-200)){let I=Math.sign(n.pos.z);(Math.abs(n.pos.z)>Fn+60||Math.abs(n.pos.x)>Ui-80)&&(c=Un.set(xe.clamp(c.x,-Ui+250,Ui-250),0,I*(Fn-500)))}_e.copy(c).sub(n.pos),_e.addScaledVector(r,-_e.dot(r));let u=_e.length(),d=Math.atan2(_e.dot(Rr),_e.dot(dn)),f=xe.clamp(d*3.2,-1,1),m=1,v=Math.abs(d)>1.6&&a>500,p=this.desiredSpeed;(this.mode==="support"||this.mode==="boost")&&(p=Math.min(p,u>1200?2300:Math.max(300,u*1.2)));let g=1/dy(Math.max(o,0));if(Math.abs(d)>.3&&u<2*g*Math.sin(Math.min(Math.abs(d),Math.PI/2))*1.05&&(p=Math.min(p,Math.max(250,o*.5)),Math.abs(d)>1&&(v=a>350)),o>p+250&&(m=o>p+600?-1:0),this.reverseT>0){this.reverseT-=t,i.throttle=-1,i.steer=-f;return}a<120&&m>0?(this.stuckT+=t,this.stuckT>1.2&&(this.reverseT=.8,this.stuckT=0)):this.stuckT=0;let x=!1;if(n.boost>0&&Math.abs(d)<.3&&o<Math.min(this.cfg.maxSpeed,p)-80&&u>400){let I=this.mode==="kickoff"||this.mode==="save"||this.mode==="retreat"?0:this.cfg.boost<1?20:8;x=n.boost>I&&Math.random()<this.cfg.boost+.1}if(o>this.cfg.maxSpeed-50&&(x=!1),i.throttle=m,i.steer=f,i.powerslide=v,i.boost=x,this.mode==="kickoff"&&this.cfg.kickoffFlip&&h<520+a*.12&&a>1100&&Math.abs(d)<.25){this.startSeq([{t:0,jump:!0,boost:!0},{t:.07,jump:!1,boost:!0},{t:.1,jump:!0,pitch:-1,yaw:xe.clamp(d*2,-.4,.4)},{t:.2,jump:!1,pitch:-1,end:!0}]);return}let T=e.time;if(T-this.lastJumpAt<1.2)return;let M=l.pos.y;_e.copy(l.pos).sub(n.pos);let b=Math.hypot(_e.x,_e.z),E=n.vel.clone().sub(l.vel),P=Math.max(1,E.dot(_e.clone().setY(0).normalize())),y=Math.max(0,b-110)/P,A=_e.clone().setY(0).normalize().dot(dn.clone().setY(0).normalize());if(this.cfg.dodge&&M<220&&b<360&&A>.85&&a>600&&y<.2&&(this.mode==="attack"||this.mode==="save")){let I=xe.clamp(_e.dot(Rr)/120,-.6,.6);this.lastJumpAt=T,this.startSeq([{t:0,jump:!0},{t:.06,jump:!1},{t:.09,jump:!0,pitch:-1,yaw:I},{t:.19,jump:!1,pitch:-.4,end:!0}]);return}if(M>190&&M<this.cfg.jumpReach+100&&A>.8&&b<1400){let I=M-110,N=I<230,F=N?sp(I):uy(I),H=l.vel.y<0?(M-110-vi)/Math.max(1,-l.vel.y):1/0,D=Math.min(y,H+.3);Number.isFinite(F)&&Math.abs(D-F)<.06&&(N||this.cfg.jumpReach>350)&&(this.lastJumpAt=T,N?this.startSeq([{t:0,jump:!0},{t:Math.min(.2,F),jump:!0},{t:F+.02,jump:!1,end:!0}]):this.cfg.aerial&&I>520?(this.aerialing=!0,this.startSeq([{t:0,jump:!0,aerial:!0},{t:.2,jump:!1,aerial:!0},{t:.24,jump:!0,aerial:!0,boost:!0},{t:.3,jump:!1,aerial:!0,boost:!0,end:!0}])):this.startSeq([{t:0,jump:!0},{t:.2,jump:!1},{t:.24,jump:!0},{t:.3,jump:!1,end:!0}]))}else if(this.cfg.aerial&&M>520&&M<1500&&A>.9&&b<1500&&n.boost>30&&a>400){let I=this.interceptT,N=(M-120)/600+.3;Math.abs(I-N)<.25&&this.ballTarget.y>450&&(this.lastJumpAt=T,this.aerialing=!0,this.startSeq([{t:0,jump:!0,aerial:!0,boost:!0},{t:.2,jump:!1,aerial:!0,boost:!0},{t:.24,jump:!0,aerial:!0,boost:!0},{t:.3,jump:!1,aerial:!0,boost:!0,end:!0}]))}}orient(t,e){let n=this.car,i=n.input;n.forward(dn),n.up(Ec),n.left(ds),Rr.copy(ds).negate();let r=n.angVel,a=Math.atan2(t.dot(Ec),t.dot(dn)),o=Math.atan2(t.dot(Rr),t.dot(dn)),l=r.dot(Rr),c=-r.dot(Ec),h=r.dot(dn);i.pitch=xe.clamp(a*3.5-l*.55,-1,1),i.yaw=xe.clamp(o*3.5-c*.55,-1,1);let u=Math.atan2(ds.dot(e),Ec.dot(e));i.roll=xe.clamp(u*2.5-h*.4,-1,1),i.steer=i.yaw,i.powerslide=!1}aerialControl(t,e){let n=this.car,i=n.input,r=e.world.ball,a=e.pred,o=a[a.length-1];for(let h=1;h<a.length;h++){let u=a[h],d=u.pos.distanceTo(n.pos)-vi-40,f=n.vel.length();if(d/Math.max(900,f+500*u.t)<=u.t){o=u;break}}let l=Math.max(.1,o.t);Zn.copy(o.pos).sub(n.pos).addScaledVector(n.vel,-l).multiplyScalar(2/(l*l)).sub(hy);let c=Zn.length();(c>1500||n.boost<=0||n.pos.distanceTo(r.pos)<vi+60)&&c>1500&&!this.seq&&(this.aerialing=!1),_e.copy(Zn).normalize(),this.orient(_e,Un.set(0,1,0)),n.forward(dn),i.boost=n.boost>0&&dn.dot(_e)>.75&&c>250,i.throttle=1}recover(){let t=this.car,e=t.input;_e.set(t.vel.x,0,t.vel.z),_e.lengthSq()<100&&(t.forward(_e),_e.y=0),_e.normalize(),this.orient(_e,Un.set(0,1,0)),e.throttle=1,e.boost=!1}};var to=new w;function Jn(s,t,e,n,i,r){let a=2*Math.PI*i/4,o=Math.max(r-2*i,0),l=Math.PI/4;to.copy(t),to[n]=0,to.normalize();let c=.5*a/(a+o),h=1-to.angleTo(s)/l;return Math.sign(to[e])===1?h*c:o/(a+o)+c+c*(1-h)}var fn=class s extends Pe{constructor(t=1,e=1,n=1,i=2,r=.1){let a=i*2+1;if(r=Math.min(t/2,e/2,n/2,r),super(1,1,1,a,a,a),this.type="RoundedBoxGeometry",this.parameters={width:t,height:e,depth:n,segments:i,radius:r},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let l=new w,c=new w,h=new w(t,e,n).divideScalar(2).subScalar(r),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,m=u.length/6,v=new w,p=.5/a;for(let g=0,x=0;g<u.length;g+=3,x+=2)switch(l.fromArray(u,g),c.copy(l),c.x-=Math.sign(c.x)*p,c.y-=Math.sign(c.y)*p,c.z-=Math.sign(c.z)*p,c.normalize(),u[g+0]=h.x*Math.sign(l.x)+c.x*r,u[g+1]=h.y*Math.sign(l.y)+c.y*r,u[g+2]=h.z*Math.sign(l.z)+c.z*r,d[g+0]=c.x,d[g+1]=c.y,d[g+2]=c.z,Math.floor(g/m)){case 0:v.set(1,0,0),f[x+0]=Jn(v,c,"z","y",r,n),f[x+1]=1-Jn(v,c,"y","z",r,e);break;case 1:v.set(-1,0,0),f[x+0]=1-Jn(v,c,"z","y",r,n),f[x+1]=1-Jn(v,c,"y","z",r,e);break;case 2:v.set(0,1,0),f[x+0]=1-Jn(v,c,"x","z",r,t),f[x+1]=Jn(v,c,"z","x",r,n);break;case 3:v.set(0,-1,0),f[x+0]=1-Jn(v,c,"x","z",r,t),f[x+1]=1-Jn(v,c,"z","x",r,n);break;case 4:v.set(0,0,1),f[x+0]=1-Jn(v,c,"x","y",r,t),f[x+1]=1-Jn(v,c,"y","x",r,e);break;case 5:v.set(0,0,-1),f[x+0]=Jn(v,c,"x","y",r,t),f[x+1]=1-Jn(v,c,"y","x",r,e);break}}static fromJSON(t){return new s(t.width,t.height,t.depth,t.segments,t.radius)}};function fs(s,t){let e=document.createElement("canvas");return e.width=s,e.height=t,e}function yi(s,{srgb:t=!0,repeat:e=!1,aniso:n=8}={}){let i=new bs(s);return t&&(i.colorSpace=tn),e&&(i.wrapS=i.wrapT=nr),i.anisotropy=n,i}function Pr(s=1){let t=s>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var On={minZ:-(Ot.halfZ+Ot.goalDepth),maxZ:Ot.halfZ+Ot.goalDepth,halfX:Ot.halfX};function rp(s){let t=s==="low"?8:5.3333,e=Math.round(2*Ot.halfX/t),n=Math.round((On.maxZ-On.minZ)/t),i=fs(e,n),r=i.getContext("2d"),a=x=>(x+Ot.halfX)/t,o=x=>(On.maxZ-x)/t,l=x=>x/t,c=512;for(let x=On.minZ;x<On.maxZ;x+=c){let T=Math.floor((x-On.minZ)/c);r.fillStyle=T%2?"#3f7f2c":"#356f25",r.fillRect(0,o(x+c),e,l(c)+1)}let h=r.createLinearGradient(0,o(-Ot.halfZ),0,o(0));h.addColorStop(0,"rgba(40,110,255,0.10)"),h.addColorStop(1,"rgba(40,110,255,0)"),r.fillStyle=h,r.fillRect(0,o(0),e,o(On.minZ)-o(0)),h=r.createLinearGradient(0,o(Ot.halfZ),0,o(0)),h.addColorStop(0,"rgba(255,120,30,0.10)"),h.addColorStop(1,"rgba(255,120,30,0)"),r.fillStyle=h,r.fillRect(0,0,e,o(0));let u=r.getImageData(0,0,e,n),d=u.data,f=Pr(7);for(let x=0;x<d.length;x+=4){let T=(f()-.5)*26+(f()<.04?-18:0);d[x]=Math.max(0,Math.min(255,d[x]+T*.6)),d[x+1]=Math.max(0,Math.min(255,d[x+1]+T)),d[x+2]=Math.max(0,Math.min(255,d[x+2]+T*.4))}r.putImageData(u,0,0);for(let x of[1,-1]){r.fillStyle="rgba(10,20,10,0.45)";let T=x*Ot.halfZ,M=x*(Ot.halfZ+Ot.goalDepth);r.fillRect(a(-Ot.goalHalfW),Math.min(o(T),o(M)),l(2*Ot.goalHalfW),Math.abs(o(M)-o(T)))}let m=(x,T)=>{r.lineWidth=l(x),r.strokeStyle=T};r.lineCap="round",r.lineJoin="round";let v="rgba(245,250,255,0.85)",p=Ka(160,6);m(34,v),r.beginPath(),p.forEach((x,T)=>{let M=x.x+x.nx*(Ot.rampR+60),b=x.z+x.nz*(Ot.rampR+60);T===0?r.moveTo(a(M),o(b)):r.lineTo(a(M),o(b))}),r.closePath(),r.stroke(),r.beginPath(),r.moveTo(a(-Ot.halfX+340),o(0)),r.lineTo(a(Ot.halfX-340),o(0)),r.stroke(),r.beginPath(),r.arc(a(0),o(0),l(1e3),0,Math.PI*2),r.stroke(),r.fillStyle=v,r.beginPath(),r.arc(a(0),o(0),l(60),0,Math.PI*2),r.fill();for(let x of[-1,1]){let T=x<0?"rgba(70,150,255,0.95)":"rgba(255,140,50,0.95)",M=x*(Ot.halfZ-340);m(40,T),r.beginPath(),r.moveTo(a(-Ot.goalHalfW),o(x*Ot.halfZ)),r.lineTo(a(Ot.goalHalfW),o(x*Ot.halfZ)),r.stroke(),m(30,v),r.beginPath(),r.moveTo(a(-1800),o(M)),r.lineTo(a(-1800),o(x*(Ot.halfZ-1500))),r.lineTo(a(1800),o(x*(Ot.halfZ-1500))),r.lineTo(a(1800),o(M)),r.stroke(),m(26,T),r.beginPath(),r.moveTo(a(-1150),o(M)),r.lineTo(a(-1150),o(x*(Ot.halfZ-800))),r.lineTo(a(1150),o(x*(Ot.halfZ-800))),r.lineTo(a(1150),o(M)),r.stroke(),m(30,v),r.beginPath();let b=o(x*(Ot.halfZ-1500));x<0?r.arc(a(0),b,l(700),Math.PI,0,!1):r.arc(a(0),b,l(700),0,Math.PI,!1),r.stroke(),m(26,x<0?"rgba(70,150,255,0.55)":"rgba(255,140,50,0.55)");for(let E of[-2600,2600])for(let P=0;P<3;P++){let y=x*(2e3+P*260);r.beginPath(),r.moveTo(a(E-220),o(y+x*160)),r.lineTo(a(E),o(y)),r.lineTo(a(E+220),o(y+x*160)),r.stroke()}}return yi(i,{aniso:16})}function ap(){let t=fs(256,256),e=t.getContext("2d"),n=e.createImageData(256,256),i=Pr(11),r=new Float32Array(256*256);for(let o=0;o<9e3;o++){let l=Math.floor(i()*256),c=Math.floor(i()*256),h=.35+i()*.65,u=1+Math.floor(i()*3);for(let d=0;d<u;d++){let f=(c+d)%256;r[f*256+l]=Math.max(r[f*256+l],h*(1-d*.2))}}for(let o=0;o<256*256;o++){let l=Math.round(r[o]*255);n.data[o*4]=l,n.data[o*4+1]=l,n.data[o*4+2]=l,n.data[o*4+3]=255}e.putImageData(n,0,0);let a=yi(t,{srgb:!1,repeat:!0});return a.magFilter=ke,a}function Pu(s=3,t=512){let e=t/6,n=t,i=Math.round(Math.sqrt(3)*e*4),r=fs(n,i),a=r.getContext("2d");a.fillStyle="#000",a.fillRect(0,0,n,i),a.strokeStyle="#fff",a.lineWidth=s;let o=Math.sqrt(3)*e;for(let l=-1;l<=5;l++)for(let c=-1;c<=5;c++){let h=1.5*e*l,u=o*(c+(l%2?.5:0));a.beginPath();for(let d=0;d<=6;d++){let f=Math.PI/3*d,m=h+e*Math.cos(f),v=u+e*Math.sin(f);d===0?a.moveTo(m,v):a.lineTo(m,v)}a.stroke()}return yi(r,{srgb:!1,repeat:!0})}function Iu(){let e=fs(2048,128),n=e.getContext("2d"),i=n.createLinearGradient(0,0,0,128);i.addColorStop(0,"#05070c"),i.addColorStop(1,"#0b1220"),n.fillStyle=i,n.fillRect(0,0,2048,128);let r=["ROCKET ARENA","SUPERSONIC","ROCKET ARENA","BOOST","ROCKET ARENA","AERIAL CUP"],a=2048/r.length;return r.forEach((o,l)=>{let c=l*a;n.fillStyle="rgba(120,180,255,0.18)",n.fillRect(c+4,8,a-8,112),n.fillStyle=l%2?"#ff8a2a":"#4aa8ff",n.beginPath(),n.arc(c+58,128/2,30,0,Math.PI*2),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(c+58,128/2,18,0,Math.PI*2),n.fill(),n.fillStyle=l%2?"#ff8a2a":"#4aa8ff",n.beginPath(),n.arc(c+64,128/2-4,9,0,Math.PI*2),n.fill(),n.fillStyle="#f4f8ff",n.font="bold italic 54px Arial, Helvetica, sans-serif",n.textBaseline="middle",n.fillText(o,c+104,128/2+2,a-120)}),yi(e,{repeat:!0})}function op(){let e=fs(1024,512),n=e.getContext("2d");n.fillStyle="#14161c",n.fillRect(0,0,1024,512);let i=Pr(23),r=8,a=512/r,o=["#c8641c","#2a62c4","#9aa3ad","#1c1c1c","#8a2a2a","#b89a3a","#2a6a3a","#3a3f4a","#c8641c","#2a62c4","#30343c","#5a6070","#20232a"],l=["#c9a185","#b08060","#8a5a3c","#5a3a26","#d2b096"];for(let u=0;u<r;u++){let d=u*a;n.fillStyle=u%2?"#20232b":"#1a1d24",n.fillRect(0,d+a*.62,1024,a*.38),n.fillStyle="#2b3140",n.fillRect(0,d+a*.6,1024,3);for(let f=4;f<1020;f+=15+i()*4){if(i()<.12)continue;let m=o[Math.floor(i()*o.length)],v=l[Math.floor(i()*l.length)],p=d+a*(.32+i()*.08);n.fillStyle=m,n.fillRect(f-6,p,12,a*.36),n.fillStyle=v,n.beginPath(),n.arc(f,p-6,5.5,0,Math.PI*2),n.fill(),i()<.18&&(n.fillStyle=v,n.fillRect(f-9,p-18,3,16),n.fillRect(f+6,p-18,3,16)),i()<.06&&(n.fillStyle=i()<.5?"#ff7a1a":"#2f7bff",n.fillRect(f-10,p-26,20,10))}}let c=fs(1024,512),h=c.getContext("2d");return h.filter="blur(1.2px) saturate(0.8)",h.drawImage(e,0,0),yi(c,{repeat:!0})}function lp(s=1024){let t=s,e=s/2,n=(1+Math.sqrt(5))/2,i=[],r=(b,E,P,y)=>{let A=Math.hypot(b,E,P);i.push([b/A,E/A,P/A,y])};for(let b of[-1,1])for(let E of[-1,1])r(0,b,E*n,1),r(b,E*n,0,1),r(b*n,0,E,1);for(let b of[-1,1])for(let E of[-1,1])for(let P of[-1,1])r(b,E,P,0);for(let b of[-1,1])for(let E of[-1,1])r(0,b/n,E*n,0),r(b/n,E*n,0,0),r(b*n,0,E/n,0);let a=()=>{let b=fs(t,e);return[b,b.getContext("2d")]},[o,l]=a(),[c,h]=a(),[u,d]=a(),[f,m]=a(),v=l.createImageData(t,e),p=h.createImageData(t,e),g=d.createImageData(t,e),x=m.createImageData(t,e),T=Pr(5),M=new Float32Array(2048);for(let b=0;b<M.length;b++)M[b]=T();for(let b=0;b<e;b++){let E=(b+.5)/e,P=Math.sin(Math.PI*E),y=Math.cos(Math.PI*E);for(let A=0;A<t;A++){let I=(A+.5)/t,N=-Math.cos(2*Math.PI*I)*P,F=y,H=Math.sin(2*Math.PI*I)*P,D=-2,z=-2,J=0;for(let _t=0;_t<32;_t++){let Ht=i[_t],ie=N*Ht[0]+F*Ht[1]+H*Ht[2];ie>D?(z=D,D=ie,J=_t):ie>z&&(z=ie)}let Y=i[J][3],rt=D-z,Z=rt<.006?1:rt<.014?1-(rt-.006)/.008:0,tt=Math.acos(Math.min(1,D)),it=M[(b>>4)%32*64+(A>>4)%64]*.08,Et,St,jt;Y?(Et=52,St=58,jt=66):(Et=128,St=134,jt=140);let Jt=rt<.03?.85:1,$t=(1-Z*.85)*Jt*(1+it),X=(b*t+A)*4;v.data[X]=Et*$t,v.data[X+1]=St*$t,v.data[X+2]=jt*$t,v.data[X+3]=255;let Q=0;Y&&(tt<.07?Q=1:tt>.12&&tt<.15&&(Q=.9)),p.data[X]=60*Q,p.data[X+1]=170*Q,p.data[X+2]=255*Q,p.data[X+3]=255;let mt=Z>0?200:Y?95:120;g.data[X]=mt,g.data[X+1]=mt,g.data[X+2]=mt,g.data[X+3]=255;let Bt=255*(1-Z)*(rt<.03?.6+rt*13:1);x.data[X]=Bt,x.data[X+1]=Bt,x.data[X+2]=Bt,x.data[X+3]=255}}return l.putImageData(v,0,0),h.putImageData(p,0,0),d.putImageData(g,0,0),m.putImageData(x,0,0),{map:yi(o),emissiveMap:yi(c),roughnessMap:yi(u,{srgb:!1}),bumpMap:yi(f,{srgb:!1})}}function cp(){let s=fs(256,64),t=s.getContext("2d");t.fillStyle="#1b1b1d",t.fillRect(0,0,256,64),t.strokeStyle="#0a0a0b",t.lineWidth=6;for(let e=-64;e<320;e+=18)t.beginPath(),t.moveTo(e,0),t.lineTo(e+14,30),t.lineTo(e,64),t.stroke();return t.fillStyle="#0c0c0d",t.fillRect(0,30,256,4),yi(s,{repeat:!0})}var wc=null;function my(){if(wc)return wc;let s=cp();return s.repeat.set(3,1),wc={tireMat:new le({color:2763308,map:s,roughness:.85,metalness:0}),tireSideMat:new le({color:1447447,roughness:.75}),rimMat:new le({color:10133672,roughness:.25,metalness:1}),darkMat:new le({color:1316120,roughness:.45,metalness:.5}),trimMat:new le({color:2237738,roughness:.6,metalness:.3}),glassMat:new Ts({color:724758,roughness:.05,metalness:.9,clearcoat:1,clearcoatRoughness:.03}),chromeMat:new le({color:14212580,roughness:.12,metalness:1}),tailMat:new le({color:4194304,emissive:16715808,emissiveIntensity:3.5}),headMat:new le({color:3355443,emissive:16773848,emissiveIntensity:2.2})},wc}function hp(s,t,e){let n=new Ii(s.map(([r,a])=>new lt(r,a))),i=new ya(n,{depth:t*2-e*2,bevelEnabled:!0,bevelThickness:e,bevelSize:e*.8,bevelSegments:4,curveSegments:8});return i.translate(0,0,-(t-e)),i.rotateY(-Math.PI/2),i}function up(s,t,e,n){let i=s.attributes.position;for(let r=0;r<i.count;r++){let a=Math.min(1,Math.max(0,(i.getY(r)-t)/(e-t)));i.setX(r,i.getX(r)*(1-n*a*a))}s.computeVertexNormals()}var Ac=class{constructor(t){let e=my(),n=je[t];this.team=t,this.root=new qe,this.body=new qe,this.body.scale.setScalar(.01),this.root.add(this.body);let i=new Ts({color:n.main,metalness:.55,roughness:.32,clearcoat:1,clearcoatRoughness:.06}),r=new Ts({color:n.dark,metalness:.6,roughness:.35,clearcoat:1,clearcoatRoughness:.1});this.paint=i;let a=(x,T,M=0,b=0,E=0,P=this.body)=>{let y=new bt(x,T);return y.position.set(M,b,E),y.castShadow=!0,y.receiveShadow=!0,P.add(y),y},l=hp([[-46,3],[-48,18],[-43,26],[-20,29],[10,27],[38,22],[60,17],[71,11],[72,4],[64,-1],[-40,-1]],31,6);up(l,8,30,.2),a(l,i);let h=hp([[-30,26],[-24,41],[-6,45],[8,42],[22,27]],24,4);up(h,27,45,.22),a(h,e.glassMat),a(new fn(40,3,22,2,1.5),i,0,45.2,-9);for(let x of[-1,1]){let T=a(new Pe(2.5,18,3),i,x*22.5,36,15);T.rotation.x=-.75}a(new Pe(10,1.2,40),e.darkMat,0,26.4,40).rotation.x=.17,a(new fn(18,6,14,2,2),e.darkMat,0,27.5,22);for(let x of Lt.wheels){let T=Math.sign(x.x),M=-Lt.restHeight+x.r,b=new xn(x.r+5,x.r+5,17,20,1,!1,-Math.PI/2,Math.PI);b.rotateZ(Math.PI/2);let E=a(b,r,T*(Math.abs(x.x)+7),M+1,x.z);E.rotation.x=0;let P=new pi(x.r+5,1.6,6,20,Math.PI);P.rotateY(Math.PI/2),a(P,e.trimMat,T*(Math.abs(x.x)+15.5),M+1,x.z)}a(new fn(66,2.5,14,2,1),e.darkMat,0,-2.5,64),a(new fn(56,4,9,2,1.5),e.darkMat,0,2,-47);for(let x of[-1,1])a(new fn(5,7,52,2,2),e.trimMat,x*31,2,9);a(new fn(50,9,6,2,2.5),e.darkMat,0,5,70),a(new fn(62,4,10,2,1.5),e.trimMat,0,-1,66);for(let x of[-1,1])a(new fn(10,4,3,2,1.2),e.headMat,x*21,13,70.5);a(new fn(46,16,10,2,3),e.darkMat,0,14,-46),a(new fn(34,10,14,2,3),e.chromeMat,0,30,-34);let u=new xn(4.2,4.8,12,16);u.rotateX(Math.PI/2);let d=new Pi(3,16);for(let x of[-1,1]){a(u,e.chromeMat,x*13,9,-50);let T=a(d,e.darkMat,x*13,9,-56.1);T.rotation.y=Math.PI,T.castShadow=!1}for(let x of[-1,1]){let T=a(new fn(17,3.2,2,2,1),e.tailMat,x*26,21.5,-48.3);T.castShadow=!1}for(let x of[-1,1]){let T=a(new Pe(3,26,7),e.darkMat,x*17,40,-40);T.rotation.x=-.35}let f=a(new fn(80,3.5,20,2,1.5),i,0,53,-45);f.rotation.x=.12;for(let x of[-1,1])a(new fn(2.5,15,24,2,1),e.darkMat,x*40,50,-45);a(new xn(.6,.6,22,6),e.darkMat,-16,56,-24),a(new In(2.4,10,8),i,-16,67,-24),this.wheels=[];let m={};for(let x of Lt.wheels){let T=Math.sign(x.x),M=new qe;M.position.set(T*(Math.abs(x.x)+7),-Lt.restHeight+x.r,x.z);let b=new qe;M.add(b);let E=x.r;if(!m[E]){let y=new xn(x.r,x.r,12,28,1,!0);y.rotateZ(Math.PI/2);let A=new Ma(x.r*.62,x.r,28),I=new xn(x.r*.64,x.r*.64,11,6);I.rotateZ(Math.PI/2);let N=new xn(x.r*.22,x.r*.22,12.5,12);N.rotateZ(Math.PI/2),m[E]={tg:y,side:A,rim:I,hub:N}}let P=m[E];a(P.tg,e.tireMat,0,0,0,b);for(let y of[-1,1]){let A=a(P.side,e.tireSideMat,y*6,0,0,b);A.rotation.y=y*Math.PI/2}a(P.rim,e.rimMat,0,0,0,b),a(P.hub,e.chromeMat,0,0,0,b),this.body.add(M),this.wheels.push({pivot:M,spin:b,front:x.front,r:x.r,baseY:M.position.y})}let v=new Ct(...n.flame),p=new hr(7,46,16,1,!0);p.translate(0,-23,0),p.rotateX(-Math.PI/2),this.flame=new bt(p,new Ce({color:v.clone().multiplyScalar(1.4),transparent:!0,opacity:.75,blending:_n,depthWrite:!1,fog:!1})),this.flame.position.set(0,12,-50);let g=new hr(3.6,26,12,1,!0);g.translate(0,-13,0),g.rotateX(-Math.PI/2),this.flameCore=new bt(g,new Ce({color:new Ct(2.2,2.2,2.2),transparent:!0,opacity:.9,blending:_n,depthWrite:!1,fog:!1})),this.flame.add(this.flameCore),this.body.add(this.flame),this.flame.visible=!1,this.exhaustGlow=new bt(new Pi(6,16),new Ce({color:v.clone().multiplyScalar(1.5),transparent:!0,opacity:.7,blending:_n,depthWrite:!1})),this.exhaustGlow.position.set(0,12,-51.5),this.exhaustGlow.rotation.y=Math.PI,this.body.add(this.exhaustGlow),this.flicker=0}update(t,e,n,i){if(this.root.visible=!t.demolished,t.demolished)return;this.root.position.set(e.x*.01,e.y*.01,e.z*.01),this.root.quaternion.copy(n);for(let a of this.wheels)a.spin.rotation.x=t.wheelSpin*(12.5/a.r),a.front&&(a.pivot.rotation.y=-t.steerVisual*.42);for(let a=0;a<4;a++){let o=this.wheels[a],l=t.wheelDist[a],c=l>=0?o.baseY+(Lt.restHeight-l)*.6:o.baseY-4;o.pivot.position.y+=(Math.max(o.baseY-6,Math.min(o.baseY+6,c))-o.pivot.position.y)*Math.min(1,i*20)}this.flicker+=i*40;let r=t.boosting;if(this.flame.visible=r,r){let a=.85+Math.sin(this.flicker)*.12+Math.random()*.15;this.flame.scale.set(a,a,a*(t.supersonic?1.35:1))}this.exhaustGlow.material.opacity=r?1:.45}};var Rc=class{constructor(t,e){this.max=t,this.count=0,this.p=new Float32Array(t*3),this.v=new Float32Array(t*3),this.life=new Float32Array(t),this.maxLife=new Float32Array(t),this.size=new Float32Array(t*2),this.c0=new Float32Array(t*4),this.c1=new Float32Array(t*4),this.phys=new Float32Array(t*4);let n=new Ca,i=new En(1,1);n.index=i.index,n.setAttribute("position",i.attributes.position),n.setAttribute("uv",i.attributes.uv),this.aPos=new Ci(new Float32Array(t*3),3).setUsage(Xa),this.aCol=new Ci(new Float32Array(t*4),4).setUsage(Xa),this.aSR=new Ci(new Float32Array(t*2),2).setUsage(Xa),n.setAttribute("iPos",this.aPos),n.setAttribute("iCol",this.aCol),n.setAttribute("iSR",this.aSR),n.instanceCount=0,this.geo=n;let r=new Me({transparent:!0,depthWrite:!1,blending:e?_n:ns,uniforms:{},vertexShader:`
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
        }`});this.mesh=new bt(n,r),this.mesh.frustumCulled=!1,this.mesh.renderOrder=e?5:4}emit(t,e,n,i,r,a,o,l,c,h,u,d=0,f=0,m=0){let v;this.count<this.max?v=this.count++:v=Math.floor(Math.random()*this.max),this.p[v*3]=t,this.p[v*3+1]=e,this.p[v*3+2]=n,this.v[v*3]=i,this.v[v*3+1]=r,this.v[v*3+2]=a,this.life[v]=o,this.maxLife[v]=o,this.size[v*2]=l,this.size[v*2+1]=c,this.c0.set(h,v*4),this.c1.set(u,v*4),this.phys[v*4]=d,this.phys[v*4+1]=f,this.phys[v*4+2]=Math.random()*6.28,this.phys[v*4+3]=m}update(t){let{p:e,v:n,life:i,maxLife:r,size:a,c0:o,c1:l,phys:c}=this,h=this.aPos.array,u=this.aCol.array,d=this.aSR.array,f=this.count;for(let m=0;m<f;m++){if(i[m]-=t,i[m]<=0){f--,m!==f&&(e.copyWithin(m*3,f*3,f*3+3),n.copyWithin(m*3,f*3,f*3+3),i[m]=i[f],r[m]=r[f],a.copyWithin(m*2,f*2,f*2+2),o.copyWithin(m*4,f*4,f*4+4),l.copyWithin(m*4,f*4,f*4+4),c.copyWithin(m*4,f*4,f*4+4),m--);continue}let v=Math.max(0,1-c[m*4]*t);n[m*3]*=v,n[m*3+1]=n[m*3+1]*v-c[m*4+1]*t,n[m*3+2]*=v,e[m*3]+=n[m*3]*t,e[m*3+1]+=n[m*3+1]*t,e[m*3+2]+=n[m*3+2]*t,c[m*4+2]+=c[m*4+3]*t}this.count=f;for(let m=0;m<f;m++){let v=1-i[m]/r[m];h[m*3]=e[m*3],h[m*3+1]=e[m*3+1],h[m*3+2]=e[m*3+2];for(let p=0;p<4;p++)u[m*4+p]=o[m*4+p]+(l[m*4+p]-o[m*4+p])*v;d[m*2]=a[m*2]+(a[m*2+1]-a[m*2])*v,d[m*2+1]=c[m*4+2]}this.geo.instanceCount=f,f>0&&(this.aPos.clearUpdateRanges(),this.aPos.addUpdateRange(0,f*3),this.aPos.needsUpdate=!0,this.aCol.clearUpdateRanges(),this.aCol.addUpdateRange(0,f*4),this.aCol.needsUpdate=!0,this.aSR.clearUpdateRanges(),this.aSR.addUpdateRange(0,f*2),this.aSR.needsUpdate=!0)}clear(){this.count=0,this.geo.instanceCount=0}},Bn=new w,wn=new w,Lu=new w,dp=new w,rn=new w,Xt=(s,t)=>s+Math.random()*(t-s),Cc=class{constructor(t,e){this.scene=t,this.mult=e==="low"?.45:e==="medium"?.75:1,this.glow=new Rc(e==="low"?1500:4e3,!0),this.smoke=new Rc(e==="low"?600:1800,!1),t.add(this.glow.mesh,this.smoke.mesh),this.flashes=[],this.sphereGeo=new In(1,32,16),this.ringGeo=new pi(1,.06,8,64)}clear(){this.glow.clear(),this.smoke.clear();for(let t of this.flashes)this.scene.remove(t.mesh);this.flashes.length=0}carTrail(t,e,n,i){if(t.demolished)return;let r=je[t.team];if(wn.set(0,0,1).applyQuaternion(n),Lu.set(0,1,0).applyQuaternion(n),dp.set(1,0,0).applyQuaternion(n),t.boosting){rn.copy(e).addScaledVector(wn,-54).addScaledVector(Lu,12).multiplyScalar(.01);let a=Bn.copy(t.vel).multiplyScalar(.01),o=Math.max(1,Math.round(i*150*this.mult)),l=r.flame,c=r.flameEnd;for(let h=0;h<o;h++){let u=Xt(7,12),d=Math.random()*i;this.glow.emit(rn.x-wn.x*u*d+Xt(-.03,.03),rn.y-wn.y*u*d+Xt(-.03,.03),rn.z-wn.z*u*d+Xt(-.03,.03),a.x*.2-wn.x*u+Xt(-.5,.5),a.y*.2-wn.y*u+Xt(-.5,.5),a.z*.2-wn.z*u+Xt(-.5,.5),Xt(.1,.2),Xt(.12,.2),Xt(.3,.55),[l[0]*1.1,l[1]*1.1,l[2]*1.1,.55],[c[0],c[1],c[2],0],2,0)}if(Math.random()<i*40*this.mult){let h=[c[0]*.9+.1,c[1]*.9+.1,c[2]*.9+.1];this.smoke.emit(rn.x-wn.x*.4,rn.y-wn.y*.4,rn.z-wn.z*.4,a.x*.25-wn.x*2+Xt(-.4,.4),a.y*.25+Xt(0,.6),a.z*.25-wn.z*2+Xt(-.4,.4),Xt(.7,1.1),.35,Xt(1.4,2.2),[h[0],h[1],h[2],.22],[.25,.25,.28,0],1.2,-.3,Xt(-1,1))}}if(t.supersonic)for(let a of[-1,1])Math.random()>.8*this.mult||(rn.copy(e).addScaledVector(dp,a*30).addScaledVector(wn,-36).addScaledVector(Lu,5).multiplyScalar(.01),this.glow.emit(rn.x,rn.y,rn.z,0,0,0,.28,.12,.04,[1.6,1.7,1.8,.8],[.8,.9,1,0],0,0))}ballTrail(t,e){let n=t.vel.length();n<2600||Math.random()>(n-2600)/2e3*this.mult||(rn.copy(e).multiplyScalar(.01),this.glow.emit(rn.x+Xt(-.3,.3),rn.y+Xt(-.3,.3),rn.z+Xt(-.3,.3),0,0,0,.35,1,.2,[.6,.85,1.4,.35],[.2,.4,1,0],0,0))}hit(t,e){let n=rn.copy(t).multiplyScalar(.01),i=Math.round(Math.min(40,e/60)*this.mult);for(let r=0;r<i;r++){let a=Xt(3,9)*Math.min(2,e/1500);Bn.set(Xt(-1,1),Xt(-.2,1),Xt(-1,1)).normalize().multiplyScalar(a),this.glow.emit(n.x,n.y,n.z,Bn.x,Bn.y,Bn.z,Xt(.15,.35),Xt(.06,.12),.02,[3,2.6,1.8,1],[2,.8,.2,0],2,6)}e>1800&&this.flash(n,12575743,1.6,.18,2.5)}boostPickup(t){let e=Math.round((t.big?40:12)*this.mult);for(let n=0;n<e;n++)this.glow.emit(t.x*.01+Xt(-.6,.6),Xt(.1,.4),t.z*.01+Xt(-.6,.6),Xt(-1,1),Xt(2,6),Xt(-1,1),Xt(.3,.6),Xt(.1,.25),.02,[3,1.8,.4,1],[2,.6,.05,0],1,2)}flash(t,e,n,i,r=3){let a=new Ce({color:new Ct(e).multiplyScalar(r),transparent:!0,blending:_n,depthWrite:!1,fog:!1}),o=new bt(this.sphereGeo,a);o.position.copy(t),o.scale.setScalar(.01),this.scene.add(o),this.flashes.push({mesh:o,t:0,dur:i,size:n,kind:"sphere"})}ring(t,e,n,i){let r=new Ce({color:new Ct(e).multiplyScalar(4),transparent:!0,blending:_n,depthWrite:!1,fog:!1}),a=new bt(this.ringGeo,r);a.position.copy(t),a.rotation.x=Math.PI/2,this.scene.add(a),this.flashes.push({mesh:a,t:0,dur:i,size:n,kind:"ring"})}explosion(t,e,n){let i=je[e],r=rn.copy(t).multiplyScalar(.01).clone(),a=i.flame,o=i.flameEnd,l=Math.round((n?420:140)*this.mult),c=n?28:12;for(let u=0;u<l;u++)Bn.set(Xt(-1,1),Xt(-.3,1),Xt(-1,1)).normalize().multiplyScalar(Xt(.2,1)*c),this.glow.emit(r.x,r.y,r.z,Bn.x,Bn.y,Bn.z,Xt(.5,n?1.6:.9),Xt(.3,.8),Xt(.1,.4),[a[0]*3,a[1]*3,a[2]*3,1],[o[0]*2,o[1]*2,o[2]*2,0],2.2,n?3:4);let h=Math.round((n?90:40)*this.mult);for(let u=0;u<h;u++)Bn.set(Xt(-1,1),Xt(0,1),Xt(-1,1)).normalize().multiplyScalar(Xt(1,n?10:5)),this.smoke.emit(r.x,r.y,r.z,Bn.x,Bn.y,Bn.z,Xt(1.2,2.4),Xt(.8,1.4),Xt(2.5,n?6:3.5),[.3,.3,.33,.55],[.12,.12,.14,0],1.6,-.6,Xt(-1,1));this.flash(r,i.main,n?9:3,n?.55:.3,4),this.ring(r,i.light,n?26:8,n?.9:.5)}update(t){this.glow.update(t),this.smoke.update(t);for(let e=this.flashes.length-1;e>=0;e--){let n=this.flashes[e];n.t+=t;let i=n.t/n.dur;if(i>=1){this.scene.remove(n.mesh),n.mesh.material.dispose(),this.flashes.splice(e,1);continue}let r=1-Math.pow(1-i,3);n.mesh.scale.setScalar(Math.max(.01,n.size*r)),n.mesh.material.opacity=1-i}}};var gy=new w(0,1,0),an=new w,zn=new w,Du=new w,xy=new w,Kn=new w,fp=new pe,Ir=new w,pp=new pe;function eo(s,t,e,n){return xe.clamp(t.dot(e),-1,1)>.99999?s.copy(e):(fp.setFromUnitVectors(t,e),pp.identity().slerp(fp,n),s.copy(t).applyQuaternion(pp))}var Lr=class{constructor(t){this.camera=t,this.dir=new w(0,0,1),this.camUp=new w(0,1,0),this.look=new w(0,0,1),this.pos=new w,this.ballCam=!0,this.shake=0,this.first=!0,this.distance=280,this.height=105,this.lookYaw=0}snap(){this.first=!0}addShake(t){this.shake=Math.min(1.5,this.shake+t)}update(t,e,n,i,r,a=0,o=0){let l=e.onGround&&e.groundNormal.y>-.2,c=l?e.groundNormal:gy;this.first?this.camUp.copy(c):eo(this.camUp,this.camUp,c,1-Math.exp(-t*(l?9:4)));let h=this.camUp;this.ballCam&&r?an.copy(r).sub(n):(an.set(0,0,1).applyQuaternion(i),!e.onGround&&e.vel.lengthSq()>500*500&&an.lerp(zn.copy(e.vel).normalize(),.5)),an.addScaledVector(c,-an.dot(c)),an.lengthSq()<1&&(an.set(0,0,1).applyQuaternion(i),an.addScaledVector(c,-an.dot(c)),an.lengthSq()<1e-4&&an.copy(this.dir)),an.normalize();let u=this.dir.dot(an);this.first?this.dir.copy(an):u<-.95?(zn.crossVectors(h,this.dir).normalize(),this.dir.addScaledVector(zn,.25).normalize()):eo(this.dir,this.dir,an,this.ballCam?1-Math.exp(-t*7.5):1-Math.exp(-t*6)),zn.copy(this.dir).addScaledVector(h,-this.dir.dot(h)),zn.lengthSq()<.001&&zn.copy(an).addScaledVector(h,-an.dot(h)),zn.lengthSq()>1e-6&&this.dir.copy(zn).normalize(),this.lookYaw+=(a*Math.PI*.95-this.lookYaw)*Math.min(1,t*10);let d=xy.copy(this.dir);Math.abs(this.lookYaw)>.001&&d.applyAxisAngle(h,-this.lookYaw);let f=e.vel.length(),m=this.distance+Math.min(60,f*.02),v=zn.copy(n).addScaledVector(d,-m).addScaledVector(h,this.height+o*-60);this.first?this.pos.copy(v):this.pos.lerp(v,1-Math.exp(-t*14));for(let g=0;g<2;g++){let x=Dn(this.pos.x,this.pos.y,this.pos.z);x<40&&(Ni(this.pos.x,this.pos.y,this.pos.z,Du),this.pos.addScaledVector(Du,40-x))}if(Ir.copy(n).addScaledVector(h,70).addScaledVector(d,260),Kn.copy(Ir).sub(this.pos).normalize(),this.ballCam&&r&&Math.abs(this.lookYaw)<.3){let g=zn.copy(r).sub(this.pos).normalize();Kn.copy(g);let x=Du.copy(n).addScaledVector(h,10).sub(this.pos).normalize(),T=xe.degToRad(this.camera.fov*.5)*.82,M=Math.acos(xe.clamp(x.dot(Kn),-1,1));M>T&&eo(Kn,x,Kn,T/M);let b=Kn.dot(h);b<-.35&&Kn.addScaledVector(h,-.35-b).normalize()}this.first?this.look.copy(Kn):eo(this.look,this.look,Kn,1-Math.exp(-t*12)),this.first=!1,this.shake=Math.max(0,this.shake-t*2.2);let p=this.shake*this.shake*14;this.camera.up.copy(h),this.camera.position.set((this.pos.x+(Math.random()-.5)*p)*.01,(this.pos.y+(Math.random()-.5)*p)*.01,(this.pos.z+(Math.random()-.5)*p)*.01),Ir.copy(this.pos).addScaledVector(this.look,1e3).multiplyScalar(.01),this.camera.lookAt(Ir)}updateReplay(t,e,n,i){let r=Math.sign(e.x||1);zn.set(r*2600+Math.sin(i*.3)*400,900,n*.55),this.first&&this.pos.copy(zn),this.pos.lerp(zn,1-Math.exp(-t*1.5)),Kn.copy(e).sub(this.pos).normalize(),this.first?this.look.copy(Kn):eo(this.look,this.look,Kn,1-Math.exp(-t*6)),this.first=!1,this.camera.up.set(0,1,0),this.camera.position.copy(this.pos).multiplyScalar(.01),Ir.copy(this.pos).addScaledVector(this.look,1e3).multiplyScalar(.01),this.camera.lookAt(Ir)}};var _y=["Atlas","Blitz","Comet","Dash","Echo","Flare","Ghost","Havoc","Jinx","Nova","Rex","Zippy","Vortex","Turbo"],vy=6,no=60,Dr=null;function yy(){Dr||(Dr=lp(1024));let s=new le({map:Dr.map,emissive:16777215,emissiveMap:Dr.emissiveMap,emissiveIntensity:2.4,roughness:1,roughnessMap:Dr.roughnessMap,metalness:.65,bumpMap:Dr.bumpMap,bumpScale:1.2}),t=new bt(new In(we.radius*.01,64,40),s);return t.castShadow=!0,t}var Fi=new w,Oi=new pe,Mi=new w,Nr=new pe;function mp(s){for(let t=s.length-1;t>0;t--){let e=Math.floor(Math.random()*(t+1));[s[t],s[e]]=[s[e],s[t]]}return s}var io=class s{constructor(t,e){this.app=t,this.cfg=e,this.attract=e.mode==="attract",this.world=new _c,this.group=new qe,t.gfx.scene.add(this.group),this.effects=new Cc(this.group,t.settings.quality),this.ball=yy(),this.group.add(this.ball),t.settings.quality==="low"&&(this.ballBlob=this.addBlob(1.7,1.7)),this.players=[];let n=mp(_y.slice());for(let r of[0,1]){let a=e.humans.filter(o=>o.team===r);for(let o=0;o<e.teamSize;o++){let l=a[o],c=this.world.addCar(new bc(r,l?l.name:n.pop())),h=new Ac(r);this.group.add(h.root),t.settings.quality==="low"&&(h.blob=this.addBlob(1.6,2.2));let u={car:c,model:h,human:!!l,device:l?l.device:null,bot:l?null:new Tc(c,e.difficulty),name:c.name};this.players.push(u)}}this.humans=this.players.filter(r=>r.human),this.views=[];let i=this.humans.length;if(this.attract||i===0){let r=new Xe(60,1,.1,3e3);this.views.push({camera:r,rect:[0,0,1,1],hfov:90,rig:new Lr(r)})}else this.humans.forEach((r,a)=>{let o=new Xe(70,1,.05,3e3),l=[0,0,1,1];i===2&&(l=e.split==="vertical"?[a*.5,0,.5,1]:[0,a*.5,1,.5]);let c=new Lr(o);c.ballCam=t.settings.ballCam,i===2&&e.split!=="vertical"&&(c.distance=310,c.height=120);let h={camera:o,rect:l,hfov:t.settings.fov,rig:c,player:r,label:r.name,team:r.car.team};r.view=h,r.viewIndex=a,this.views.push(h)});this.replayCam=new Xe(55,1,.1,3e3),this.replayRig=new Lr(this.replayCam),this.replayView={camera:this.replayCam,rect:[0,0,1,1],hfov:80},t.gfx.setViews(this.views),this.attract?this.engines=[]:(t.hud.setup(this.views),t.hud.show(!0),this.engines=this.humans.map((r,a)=>t.audio.createEngine(i===2&&e.split==="vertical"?a===0?-.5:.5:0))),this.scores=[0,0],this.clock=e.duration||0,this.unlimited=!e.duration,this.overtime=!1,this.state="countdown",this.stateT=0,this.acc=0,this.pred=[],this.predFrame=0,this.threat=-1,this.frame=0,this.time=0,this.snapSize=9+13*this.players.length,this.snapCount=vy*no,this.snaps=new Float32Array(this.snapSize*this.snapCount),this.snapHead=0,this.snapFilled=0,this.stepIndex=0,this.fakeCars=this.players.map(r=>({team:r.car.team,vel:new w,boosting:!1,supersonic:!1,demolished:!1,steerVisual:0,wheelSpin:0,wheelDist:[17,17,17,17],onGround:!0})),this.kickoff()}addBlob(t,e){if(!s.blobTex){let i=document.createElement("canvas");i.width=i.height=64;let r=i.getContext("2d"),a=r.createRadialGradient(32,32,0,32,32,32);a.addColorStop(0,"rgba(0,0,0,0.55)"),a.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=a,r.fillRect(0,0,64,64),s.blobTex=new bs(i)}let n=new bt(new En(t,e),new Ce({map:s.blobTex,transparent:!0,depthWrite:!1}));return n.rotation.x=-Math.PI/2,n.renderOrder=1,this.group.add(n),n}placeBlob(t,e,n,i){if(!t)return;let r=e.y-i;t.visible=r<600,t.position.set(e.x*.01,.03,e.z*.01);let a=Math.max(.4,1-r/800);t.scale.setScalar(a),t.material.opacity=a,n&&(t.rotation.z=Math.atan2(2*(n.w*n.y+n.x*n.z),1-2*(n.y*n.y+n.z*n.z)))}dispose(){this.app.gfx.scene.remove(this.group),this.group.traverse(t=>{if(t.geometry&&!t.geometry.userData.shared&&t.geometry.dispose(),t.material&&t.material!==this.ball.material){let e=Array.isArray(t.material)?t.material:[t.material];for(let n of e)n.dispose()}}),this.app.audio.stopEngines()}kickoff(){let t=this.world;t.ball.reset(),t.resetPads(),this.ball.visible=!0;let e=mp([0,1,2,3,4]);for(let n of[0,1]){let i=this.players.filter(a=>a.car.team===n),r=n===0?1:-1;i.forEach((a,o)=>{let l=Hf[e[o%5]];a.car.place(l[0]*r,l[1]*r,n===0?l[2]:l[2]+Math.PI),a.car.frozen=!0,a.car.input.jump=!1,a.car.prevJump=!1})}for(let n of this.views)n.rig&&n.rig.snap();this.state="countdown",this.stateT=this.attract?1.2:3,this.lastBeep=4,this.threat=-1,this.acc=0,this.attract||this.app.hud.hideBanner()}startPlay(){this.state="playing";for(let t of this.players)t.car.frozen=!1;this.world.ball.frozen=!1,this.attract||(this.app.hud.showBanner("GO!","","go",.8),this.app.audio.beep(!0))}scored(t){let e=1-t,i=this.world.ball;this.scores[e]++;let r=i.lastTouch,a=i.prevTouch,o=r&&r.team===e?r:a&&a.team===e?a:null,l=o&&a&&a!==o&&a.team===e&&r===o?a:null;o&&(o.stats.goals++,o.stats.score+=100),l&&(l.stats.assists++,l.stats.score+=50);let c=i.pos.clone();this.goalTime=this.time,this.goalTeam=e,this.goalOf=t,this.effects.explosion(c,e,!0),this.app.stadium.goalFlash(t),this.app.stadium.cheer(1);for(let h of this.players){let u=h.car;if(u.demolished)continue;let d=u.pos.distanceTo(c);if(d<2600){let f=u.pos.clone().sub(c).setY(0).normalize().multiplyScalar((1-d/2600)*1800);u.vel.add(f),u.vel.y+=(1-d/2600)*700,u.noGround=.15,u.onGround=!1}}i.frozen=!0,i.vel.set(0,0,0),this.ball.visible=!1;for(let h of this.views)h.rig&&h.rig.addShake(1);if(!this.attract){this.app.audio.goal();for(let d of this.humans)this.app.input.rumble(d.device,1,1,700);let h=je[e],u=o?o.name:e===0?"Blue":"Orange";this.app.hud.showBanner("GOAL!",o?`${u} scored${l?" \u2022 assist: "+l.name:""}`:"Own goal",e===0?"blue":"orange",2.6),this.app.hud.addFeed(`<b style="color:${h.css}">${u}</b> scored!`,e)}this.state="goal",this.stateT=2.8,this.endAfterGoal=this.overtime||!this.unlimited&&this.clock<=0}startReplay(){if(this.attract||this.snapFilled<no*2||!this.app.settings.replays){this.afterReplay();return}this.state="replay";let t=this.snapFilled/no,e=this.time-this.goalTime;this.replayEnd=Math.max(0,e-.35),this.replayStart=Math.min(t-.05,e+4.2),this.replayT=this.replayStart,this.replayExploded=!1,this.app.gfx.setViews([this.replayView]),this.replayRig.snap(),this.app.hud.setup([]),this.app.hud.showBanner("REPLAY","Press A / Space to skip","replay",99),this.ball.visible=!0,this.effects.clear()}afterReplay(){if(this.state==="replay"&&(this.app.gfx.setViews(this.views),this.app.hud.setup(this.views),this.app.hud.hideBanner()),this.endAfterGoal){this.finish();return}this.kickoff()}finish(){this.state="over",this.stateT=3;for(let e of this.players)e.car.frozen=!0,e.car.boosting=!1;this.world.ball.frozen=!0;let t=this.scores[0]>this.scores[1]?0:1;this.winner=t,this.app.audio.horn(),this.app.stadium.cheer(.8),this.app.hud.showBanner(t===0?"BLUE WINS!":"ORANGE WINS!",`${this.scores[0]} - ${this.scores[1]}`,t===0?"blue":"orange",99)}results(){let t=this.players.map(n=>({name:n.name,team:n.car.team,human:n.human,...n.car.stats}));t.sort((n,i)=>i.score-n.score);let e=t.filter(n=>n.team===this.winner).sort((n,i)=>i.score-n.score)[0];return{scores:this.scores.slice(),winner:this.winner,rows:t,mvp:e?e.name:""}}update(t){t=Math.min(t,.1),this.time+=t,this.frame++;let e=this.app,n=e.input,i=!1;for(let a of this.humans){let o=n.controls(a.device);if(a.controls=o,o.pause&&this.state!=="over"&&e.frames!==e.resumeFrame){e.pauseMatch(a);return}o.skip&&(i=!0),o.ballCam&&a.view&&(a.view.rig.ballCam=!a.view.rig.ballCam,e.hud.viewStatus(a.viewIndex,a.view.rig.ballCam?"BALL CAM":"CAR CAM"));let l=a.car.input;l.throttle=o.throttle,l.steer=o.steer,l.pitch=o.pitch,l.yaw=o.yaw,l.roll=o.roll,l.jump=o.jump,l.boost=o.boost,l.powerslide=o.powerslide}(this.frame%3===0||this.pred.length===0)&&(Mu(this.world.ball,3.5,1/60,this.pred),this.threat=this.goalIn(this.pred));let r=this.world.ball.lastTouch===null&&this.state==="playing";for(let a of this.players)a.bot&&a.bot.update(t,{world:this.world,pred:this.pred,time:this.world.time,kickoff:r,teammates:this.players.filter(o=>o.car.team===a.car.team).map(o=>o.car),opponents:this.players.filter(o=>o.car.team!==a.car.team).map(o=>o.car)});switch(this.state){case"countdown":{this.stateT-=t;let a=Math.ceil(this.stateT);!this.attract&&a<this.lastBeep&&a>0&&(this.lastBeep=a,e.hud.showBanner(String(a),this.overtime?"OVERTIME":"","count",1),e.audio.beep(!1)),this.stateT<=0&&this.startPlay();break}case"playing":this.unlimited||(this.overtime?this.clock+=t:this.clock>0&&(this.clock=Math.max(0,this.clock-t)));break;case"goal":this.stateT-=t,this.stateT<=0&&this.startReplay();break;case"replay":this.replayT-=t,(i||this.replayT<=this.replayEnd)&&this.afterReplay();break;case"over":this.stateT-=t,this.stateT<=0&&!this.resultsShown&&(this.resultsShown=!0,e.showResults(this.results()));break;default:break}if(this.state==="replay"){this.renderReplay(t);return}{this.acc+=t;let a=0;for(;this.acc>=Ja&&a<12;)if(this.world.step(Ja),this.acc-=Ja,a++,this.stepIndex++%(120/no)===0&&this.recordSnap(),this.state==="playing"){let o=this.world.ball.goalState();if(o>=0){this.scored(o);break}}a>=12&&(this.acc=0)}if(this.state==="playing"&&!this.unlimited&&!this.overtime&&this.clock<=0){let a=this.world.ball;(a.pos.y<we.radius+25||a.frozen)&&(this.scores[0]===this.scores[1]?(this.overtime=!0,this.clock=0,e.hud.showBanner("OVERTIME","Next goal wins","ot",2.5),e.audio.horn(),this.kickoff(),this.stateT=4):this.finish())}this.processEvents(),this.renderFrame(t)}goalIn(t){for(let e of t)if(Math.abs(e.pos.x)<Ot.goalHalfW&&e.pos.y<Ot.goalH){if(e.pos.z>Ot.halfZ+we.radius)return 1;if(e.pos.z<-Ot.halfZ-we.radius)return 0}return-1}processEvents(){let t=this.app,e=this.world.events,n=this.humans.map(r=>r.car),i=r=>{if(!r||n.length===0)return .6;let a=1/0;for(let o of n)a=Math.min(a,o.pos.distanceTo(r));return Math.max(.15,1-a/7e3)};for(let r of e){let a=r.car?this.humans.find(o=>o.car===r.car):null;switch(r.type){case"ballHit":r.strength>350&&this.effects.hit(r.point,r.strength),this.attract||(r.strength>250&&t.audio.hit(r.strength*i(r.point)),a&&(t.input.rumble(a.device,Math.min(1,r.strength/2500),.4,120),r.strength>1500&&a.view.rig.addShake(Math.min(.45,r.strength/7e3))),this.onTouch(r.car,a));break;case"bounce":!this.attract&&r.strength>400&&t.audio.bounce(r.strength*i(r.point));break;case"jump":a&&t.audio.jump();break;case"dodge":a&&t.audio.dodge();break;case"land":a&&(t.audio.land(r.strength),t.input.rumble(a.device,.15,.2,60));break;case"bump":if(!this.attract){t.audio.bump();let o=this.humans.find(l=>l.car===r.by);a&&t.input.rumble(a.device,.7,.5,200),o&&t.input.rumble(o.device,.4,.3,120)}break;case"demo":if(this.effects.explosion(r.point,r.car.team,!1),r.by.stats.score+=25,!this.attract){t.audio.demo(),t.hud.addFeed(`<b style="color:${je[r.by.team].css}">${r.by.name}</b> \u{1F4A5} <b style="color:${je[r.car.team].css}">${r.car.name}</b>`),a&&(t.input.rumble(a.device,1,1,450),t.hud.viewCenter(a.viewIndex,"DEMOLISHED",2.8));let o=this.humans.find(l=>l.car===r.by);o&&(t.input.rumble(o.device,.6,.6,200),t.hud.viewCenter(o.viewIndex,"DEMOLITION!",1.5))}break;case"boostPickup":this.effects.boostPickup(r.pad),a&&(t.audio.boostPickup(r.big),r.big&&t.input.rumble(a.device,.1,.3,80));break;default:break}}e.length=0}onTouch(t,e){if(this.state!=="playing"||this.world.time-(t.lastShotCheck||-10)<.4)return;t.lastShotCheck=this.world.time;let n=this.threat,i=this._shotBuf||(this._shotBuf=[]);Mu(this.world.ball,3,1/40,i);let r=this.goalIn(i);this.threat=r,n===t.team&&r!==t.team&&(t.stats.saves++,t.stats.score+=50,this.app.hud.addFeed(`<b style="color:${je[t.team].css}">${t.name}</b> made a save!`),e&&this.app.hud.viewCenter(e.viewIndex,"SAVE!",1.5)),r===1-t.team&&n!==r&&(t.stats.shots++,t.stats.score+=20,this.app.audio.cheer(.35),e&&this.app.hud.viewCenter(e.viewIndex,"SHOT ON GOAL",1.2))}recordSnap(){let t=this.snapHead*this.snapSize,e=this.snaps,n=this.world.ball;e[t]=this.time,e[t+1]=n.pos.x,e[t+2]=n.pos.y,e[t+3]=n.pos.z,e[t+4]=n.quat.x,e[t+5]=n.quat.y,e[t+6]=n.quat.z,e[t+7]=n.quat.w,e[t+8]=this.ball.visible?1:0;let i=t+9;for(let r of this.players){let a=r.car;e[i]=a.pos.x,e[i+1]=a.pos.y,e[i+2]=a.pos.z,e[i+3]=a.quat.x,e[i+4]=a.quat.y,e[i+5]=a.quat.z,e[i+6]=a.quat.w,e[i+7]=a.vel.x,e[i+8]=a.vel.y,e[i+9]=a.vel.z,e[i+10]=(a.boosting?1:0)|(a.supersonic?2:0)|(a.demolished?4:0)|(a.onGround?8:0),e[i+11]=a.steerVisual,e[i+12]=a.wheelSpin,i+=13}this.snapHead=(this.snapHead+1)%this.snapCount,this.snapFilled=Math.min(this.snapCount,this.snapFilled+1)}snapAt(t){let e=Math.min(this.snapFilled-1,Math.max(0,t*no)),n=Math.floor(e),i=e-n,r=(this.snapHead-1-n+this.snapCount*2)%this.snapCount,a=(r-1+this.snapCount)%this.snapCount;return{a:r*this.snapSize,b:a*this.snapSize,t:i}}renderReplay(t){let{a:e,b:n,t:i}=this.snapAt(this.replayT),r=this.snaps,a=l=>r[e+l]+(r[n+l]-r[e+l])*i;Mi.set(a(1),a(2),a(3)),Nr.set(r[e+4],r[e+5],r[e+6],r[e+7]),this.ball.position.copy(Mi).multiplyScalar(.01),this.ball.quaternion.copy(Nr),this.ball.visible=r[e+8]>.5;let o=9;this.players.forEach((l,c)=>{let h=this.fakeCars[c];Fi.set(a(o),a(o+1),a(o+2)),Oi.set(r[e+o+3],r[e+o+4],r[e+o+5],r[e+o+6]),Nr.set(r[n+o+3],r[n+o+4],r[n+o+5],r[n+o+6]),Oi.slerp(Nr,i),h.vel.set(r[e+o+7],r[e+o+8],r[e+o+9]);let u=r[e+o+10];h.boosting=!!(u&1),h.supersonic=!!(u&2),h.demolished=!!(u&4),h.steerVisual=r[e+o+11],h.wheelSpin=r[e+o+12],l.model.update(h,Fi,Oi,t),this.effects.carTrail(h,Fi,Oi,t),o+=13}),!this.replayExploded&&this.ball.visible===!1&&(this.replayExploded=!0,this.effects.explosion(Mi,this.goalTeam,!0)),this.replayRig.updateReplay(t,Mi,this.goalOf===1?Ot.halfZ:-Ot.halfZ,this.replayT),this.effects.update(t),this.app.stadium.update(t),this.app.hud.update(t),this.app.gfx.render()}renderFrame(t){let e=this.app,n=this.acc/Ja,i=this.world.ball;Mi.lerpVectors(i.prevPos,i.pos,n),Nr.slerpQuaternions(i.prevQuat,i.quat,n),this.ball.position.copy(Mi).multiplyScalar(.01),this.ball.quaternion.copy(Nr),this.ball.visible&&this.effects.ballTrail(i,Mi),this.placeBlob(this.ballBlob,Mi,null,we.radius),this.ballBlob&&(this.ballBlob.visible=this.ballBlob.visible&&this.ball.visible);let r=[];for(let a of this.players){let o=a.car;Fi.lerpVectors(o.prevPos,o.pos,n),Oi.slerpQuaternions(o.prevQuat,o.quat,n),a.ipos=(a.ipos||new w).copy(Fi),a.iquat=(a.iquat||new pe).copy(Oi),a.model.update(o,Fi,Oi,t),this.placeBlob(a.model.blob,Fi,Oi,17),a.model.blob&&(a.model.blob.visible=a.model.blob.visible&&!o.demolished),this.effects.carTrail(o,Fi,Oi,t),r.push({car:o,pos:a.ipos,name:a.name})}if(this.attract){let a=this.views[0],o=this.time*.05,l=a.camera,c=62;l.position.set(Math.cos(o)*c*.62,13+Math.sin(o*.7)*4,Math.sin(o)*c*.8),l.up.set(0,1,0);let h=Fi.copy(Mi).multiplyScalar(.01*.6);l.lookAt(h.x,2,h.z)}else{for(let a of this.humans){let o=a.view,l=a.controls||{};o.rig.update(t,a.car,a.ipos,a.iquat,this.ball.visible?Mi:null,l.lookX||0,l.lookY||0),e.hud.setBoost(a.viewIndex,a.car.boost),e.hud.updatePlates(a.viewIndex,o.camera,r,a.car)}this.humans.forEach((a,o)=>{let l=a.car;e.audio.updateEngine(this.engines[o],l.vel.length(),l.input.throttle,l.boosting,l.onGround,!l.demolished&&!l.frozen)}),e.hud.setScore(this.scores[0],this.scores[1]),e.hud.setClock(this.clock,this.overtime,this.unlimited),e.hud.update(t)}this.effects.update(t),e.stadium.update(t),e.gfx.render()}renderPaused(){this.app.gfx.render()}};var Ur={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var Hn=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},My=new ts(-1,1,1,-1,0,1),Nu=class extends Ne{constructor(){super(),this.setAttribute("position",new re([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new re([0,2,0,0,2,0],2))}},Sy=new Nu,ps=class{constructor(t){this._mesh=new bt(Sy,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,My)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var Pc=class extends Hn{constructor(t,e="tDiffuse"){super(),this.textureID=e,this.uniforms=null,this.material=null,t instanceof Me?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=Di.clone(t.uniforms),this.material=new Me({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new ps(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var so=class extends Hn{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){let i=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),r.buffers.stencil.setFunc(i.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(i.EQUAL,1,4294967295),r.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),r.buffers.stencil.setLocked(!0)}},Ic=class extends Hn{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var Lc=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let n=t.getSize(new lt);this._width=n.width,this._height=n.height,e=new Ue(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Ye}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Pc(Ur),this.copyPass.material.blending=Gn,this.timer=new Pa}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){this.timer.update(),t===void 0&&(t=this.timer.getDelta());let e=this.renderer.getRenderTarget(),n=!1;for(let i=0,r=this.passes.length;i<r;i++){let a=this.passes[i];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),a.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),a.needsSwap){if(n){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}so!==void 0&&(a instanceof so?n=!0:a instanceof Ic&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new lt);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let n=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(n,i),this.renderTarget2.setSize(n,i);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,i)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var gp={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ct(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var Fr=class s extends Hn{constructor(t,e=1,n,i){super(),this.strength=e,this.radius=n,this.threshold=i,this.resolution=t!==void 0?new lt(t.x,t.y):new lt(256,256),this.clearColor=new Ct(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Ue(r,a,{type:Ye,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new Ue(r,a,{type:Ye,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let d=new Ue(r,a,{type:Ye,depthBuffer:!1});d.texture.name="UnrealBloomPass.v"+h,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),a=Math.round(a/2)}let o=gp;this.highPassUniforms=Di.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Me({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new lt(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new w(1,1,1),new w(1,1,1),new w(1,1,1),new w(1,1,1),new w(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Di.clone(Ur.uniforms),this.blendMaterial=new Me({uniforms:this.copyUniforms,vertexShader:Ur.vertexShader,fragmentShader:Ur.fragmentShader,premultipliedAlpha:!0,blending:_n,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Ct,this._oldClearAlpha=1,this._basic=new Ce,this._fsQuad=new ps(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(t,e){let n=Math.round(t/2),i=Math.round(e/2);this.renderTargetBright.setSize(n,i);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,i),this.renderTargetsVertical[r].setSize(n,i),this.separableBlurMaterials[r].uniforms.invSize.value=new lt(1/n,1/i),n=Math.round(n/2),i=Math.round(i/2)}render(t,e,n,i,r){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let a=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=n.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this._fsQuad.render(t),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(n),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=a}_getSeparableBlurMaterial(t){let e=[],n=t/3;for(let a=0;a<t;a++)e.push(.39894*Math.exp(-.5*a*a/(n*n))/n);let i=[],r=[];for(let a=1;a<t;a+=2){let o=e[a],l=a+1<t?e[a+1]:0,c=o+l;i.push((a*o+(a+1)*l)/c),r.push(c)}return new Me({defines:{KERNEL_PAIRS:i.length},uniforms:{colorTexture:{value:null},invSize:{value:new lt(.5,.5)},direction:{value:new lt(.5,.5)},centerWeight:{value:e[0]},gaussianOffsets:{value:i},gaussianWeights:{value:r}},vertexShader:`

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

				}`})}_getCompositeMaterial(t){return new Me({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

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

				}`})}};Fr.BlurDirectionX=new lt(1,0);Fr.BlurDirectionY=new lt(0,1);var ro={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};var Dc=class extends Hn{constructor(){super(),this.isOutputPass=!0,this.uniforms=Di.clone(ro.uniforms),this.material=new fr({name:ro.name,uniforms:this.uniforms,vertexShader:ro.vertexShader,fragmentShader:ro.fragmentShader}),this._fsQuad=new ps(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},ne.getTransfer(this._outputColorSpace)===de&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Ia?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===La?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Da?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Rs?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Ua?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Fa?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Na&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Uu=class extends Hn{constructor(t){super(),this.owner=t,this.needsSwap=!1}render(t,e,n){let i=this.renderToScreen?null:n;this.owner.renderViews(i)}},Nc=class{constructor(t,e){this.quality=e,this.container=t;let n=new cc({antialias:e!=="low",powerPreference:"high-performance",stencil:!1});if(n.toneMapping=Rs,n.toneMappingExposure=1,n.outputColorSpace=tn,n.shadowMap.enabled=e!=="low",n.shadowMap.type=ws,n.autoClear=!1,t.appendChild(n.domElement),this.renderer=n,this.scene=new Ss,this.views=[],this.pixelRatio=Math.min(window.devicePixelRatio||1,e==="high"?1.75:e==="medium"?1.25:1),n.setPixelRatio(this.pixelRatio),e!=="low"){let i=new Ue(1,1,{type:Ye,samples:e==="high"?4:0});this.composer=new Lc(n,i),this.composer.addPass(new Uu(this)),this.bloom=new Fr(new lt(256,256),.5,.35,.92),this.composer.addPass(this.bloom),this.composer.addPass(new Dc)}this.resize(),this.onResize=()=>this.resize(),window.addEventListener("resize",this.onResize)}setExposure(t){this.renderer.toneMappingExposure=t}setViews(t){this.views=t,this.updateCameras()}resize(){let t=window.innerWidth,e=window.innerHeight;this.width=t,this.height=e,this.renderer.setSize(t,e),this.composer&&(this.composer.setPixelRatio(this.pixelRatio),this.composer.setSize(t,e)),this.updateCameras()}updateCameras(){for(let t of this.views){let e=t.rect[2]*this.width/Math.max(1,t.rect[3]*this.height),n=xe.degToRad(t.hfov||100),i=xe.radToDeg(2*Math.atan(Math.tan(n/2)/e));i=xe.clamp(i,47,78),t.camera.fov=i,t.camera.aspect=e,t.camera.updateProjectionMatrix()}}renderViews(t){let e=this.renderer;e.setRenderTarget(t),e.setClearColor(0,1),e.clear(!0,!0,!1);let n=t?t.width:this.width*this.pixelRatio,i=t?t.height:this.height*this.pixelRatio,r=t?1:1/this.pixelRatio;for(let a of this.views){let o=Math.round(a.rect[0]*n),l=Math.round(a.rect[2]*n),c=Math.round(a.rect[3]*i),h=Math.round((1-a.rect[1]-a.rect[3])*i);t?(t.viewport.set(o,h,l,c),t.scissor.set(o,h,l,c),t.scissorTest=!0,e.setRenderTarget(t)):(e.setViewport(o*r,h*r,l*r,c*r),e.setScissor(o*r,h*r,l*r,c*r),e.setScissorTest(!0)),e.render(this.scene,a.camera)}t?(t.viewport.set(0,0,t.width,t.height),t.scissor.set(0,0,t.width,t.height),t.scissorTest=!1,e.setRenderTarget(t)):(e.setViewport(0,0,this.width,this.height),e.setScissorTest(!1))}render(){this.composer?this.composer.render():this.renderViews(null)}dispose(){window.removeEventListener("resize",this.onResize),this.composer&&this.composer.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}};var{halfX:Uc,halfZ:Mn,height:Fu,rampR:yn,goalHalfW:Qe,goalH:Oe,goalDepth:An}=Ot,xp={night:{skyTop:132623,skyHorizon:1781594,skyBottom:263949,sunDir:[.25,.75,-.6],sunColor:10467583,sunGlow:0,stars:1,hemiSky:10467583,hemiGround:2042392,hemi:.75,key:15134463,keyI:2.4,keyDir:[.35,1,.25],fog:726320,fogDensity:.0011,envI:.75,exposure:1.05,winLit:.55,bldg:461330},sunset:{skyTop:2112120,skyHorizon:16754282,skyBottom:2759200,sunDir:[.78,.07,.62],sunColor:16756848,sunGlow:1,stars:0,hemiSky:16767416,hemiGround:2892055,hemi:.85,key:16760970,keyI:3.2,keyDir:[.75,.32,.58],fog:11565672,fogDensity:.0012,envI:.9,exposure:1,winLit:.3,bldg:1709600}};function _p(s){return new Me({side:sn,depthWrite:!1,fog:!1,uniforms:{uTop:{value:new Ct(s.skyTop)},uHorizon:{value:new Ct(s.skyHorizon)},uBottom:{value:new Ct(s.skyBottom)},uSunDir:{value:new w(...s.sunDir).normalize()},uSunColor:{value:new Ct(s.sunColor)},uSunGlow:{value:s.sunGlow},uStars:{value:s.stars}},vertexShader:`
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
      }`})}function by(s){return new Me({uniforms:{uBase:{value:new Ct(s.bldg)},uWin:{value:new Ct(1,.82,.55)},uLit:{value:s.winLit},uFog:{value:new Ct(s.fog)},uFogD:{value:s.fogDensity*.55},uSunDir:{value:new w(...s.sunDir).normalize()},uSunColor:{value:new Ct(s.sunColor).multiplyScalar(s.sunGlow)}},vertexShader:`
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
      }`})}function $n(s,t,{uLen:e=1e3,vOf:n=(a,o)=>o/1e3,skip:i=null,colorOf:r=null}={}){let a=s.concat([{...s[0],s:s.total}]),o=a.length,l=t.length,c=new Float32Array(o*l*3),h=new Float32Array(o*l*2),u=r?new Float32Array(o*l*3):null,d=new Float32Array(l),f=[];for(let p=0;p<o;p++){let g=a[p];for(let x=0;x<l;x++){let[T,M]=t[x],b=g.x+g.nx*T,E=g.z+g.nz*T;p>0&&(d[x]+=Math.hypot(b-f[x][0],E-f[x][1])),f[x]=[b,E];let P=p*l+x;if(c[P*3]=b,c[P*3+1]=M,c[P*3+2]=E,h[P*2]=d[x]/e,h[P*2+1]=n(x,M),u){let y=r(b,M,E);u[P*3]=y[0],u[P*3+1]=y[1],u[P*3+2]=y[2]}}}let m=[];for(let p=0;p<o-1;p++)for(let g=0;g<l-1;g++){if(i&&i(a[p],a[p+1],t[g],t[g+1]))continue;let x=p*l+g,T=(p+1)*l+g,M=(p+1)*l+g+1,b=p*l+g+1;m.push(x,b,T,T,b,M)}let v=new Ne;return v.setAttribute("position",new en(c,3)),v.setAttribute("uv",new en(h,2)),u&&v.setAttribute("color",new en(u,3)),v.setIndex(m),v.computeVertexNormals(),v}var Bu=s=>s.wall==="orange"||s.wall==="blue";function ao(s,t=.5){return(e,n,i,r)=>Bu(e)&&Bu(n)&&Math.abs(e.x)<=Qe+t&&Math.abs(n.x)<=Qe+t&&Math.max(i[1],r[1])<=s+.5}function Ou(s,t=1){let e=xe.smoothstep(s,-2500,2500),n=new Ct(je[0].main),i=new Ct(je[1].main),r=n.lerp(i,e);return[r.r*t,r.g*t,r.b*t]}function vp(s,t){let e=[];for(let o of s){let l=o.x+o.nx*t,c=o.z+o.nz*t;if(Bu(o)){let h=o.wall==="orange"?1:-1,u=h>0?Qe:-Qe;if(Math.abs(o.x-u)<.5){e.push([l,c],[u,h*(Mn+An)],[-u,h*(Mn+An)]);continue}if(Math.abs(o.x)<Qe-.5)continue}e.push([l,c])}let n=new Ii(e.map(([o,l])=>new lt(o,-l))),i=new Sa(n);i.rotateX(-Math.PI/2);let r=i.attributes.position,a=i.attributes.uv;for(let o=0;o<r.count;o++)a.setXY(o,(r.getX(o)+On.halfX)/(2*On.halfX),(r.getZ(o)-On.minZ)/(On.maxZ-On.minZ));return i}function yp(s,t,e){let n=xp[e.timeOfDay]||xp.night,i=e.quality,r=new qe,a=new qe;a.scale.setScalar(.01),r.add(a),t.add(r);let o=[];t.fog=new aa(n.fog,n.fogDensity*.35);let l=new bt(new In(2500,48,24),_p(n));l.renderOrder=-10,l.frustumCulled=!1,r.add(l);let c=Pr(42),h=new Pe(1,1,1);h.translate(0,.5,0);let u=190,d=new lr(h,by(n),u),f=new me;for(let R=0;R<u;R++){let V=c()*Math.PI*2,B=170+c()*380+(c()<.3?250:0),j=18+c()*40,at=18+c()*40,et=30+Math.pow(c(),2)*260+(B>400?60:0);f.compose(new w(Math.cos(V)*B,-5,Math.sin(V)*B*1.2),new pe().setFromAxisAngle(new w(0,1,0),c()*.6),new w(j,et,at)),d.setMatrixAt(R,f)}r.add(d);let m=new bt(new Pi(1400,48),new le({color:855826,roughness:1}));m.rotation.x=-Math.PI/2,m.position.y=-6,r.add(m);let v=new Ea(n.hemiSky,n.hemiGround,n.hemi);r.add(v);let p=new Ra(n.key,n.keyI),g=new w(...n.keyDir).normalize();if(p.position.copy(g).multiplyScalar(90),p.target.position.set(0,0,0),r.add(p,p.target),i!=="low"){p.castShadow=!0;let R=i==="high"?2048:1024;p.shadow.mapSize.set(R,R);let V=p.shadow.camera;V.left=-60,V.right=60,V.top=70,V.bottom=-70,V.near=10,V.far=220,p.shadow.bias=-4e-4,p.shadow.normalBias=.02}let x=Ka(200,6),T=rp(i),M=ap(),b=M.clone();b.repeat.set(40,58),b.needsUpdate=!0;let E=vp(x,yn),P=new le({map:T,roughness:.92,metalness:0,bumpMap:b,bumpScale:.6}),y=new bt(E,P);if(y.receiveShadow=!0,a.add(y),i==="high"){let R=M.clone();R.repeat.set(32,47),R.needsUpdate=!0;let V=5;for(let B=1;B<=V;B++){let j=new le({map:T,alphaMap:R,alphaTest:.25+B/V*.55,roughness:.95,color:new Ct().setScalar(.85+B*.05)}),at=new bt(E,j);at.position.y=B*1.4,at.receiveShadow=!0,a.add(at)}}let A=[];for(let R=0;R<=10;R++){let V=Math.PI/2*(1-R/10);A.push([yn-yn*Math.cos(V),yn-yn*Math.sin(V)])}let I=new le({color:1777703,roughness:.55,metalness:.35,vertexColors:!0,side:Ie}),N=new bt($n(x,A,{uLen:400,skip:ao(Oe),colorOf:(R,V,B)=>{let j=Ou(B,.35);return[.55+j[0],.55+j[1],.55+j[2]]}}),I);N.receiveShadow=!0,a.add(N);let F=[[0,yn-4],[0,yn+14]],H=new bt($n(x,F,{skip:ao(Oe),colorOf:(R,V,B)=>Ou(B,4)}),new Ce({vertexColors:!0,side:Ie,fog:!1}));a.add(H);let D=Iu(),z=yn+230,J=new bt($n(x,[[0,yn+14],[0,z]],{uLen:4200,vOf:R=>R,skip:ao(Oe)}),new le({color:1118481,emissive:16777215,emissiveMap:D,emissiveIntensity:1.1,map:D,roughness:.4,side:Ie}));a.add(J),o.push(R=>{D.offset.x=(D.offset.x+R*.012)%1});let Y=Pu(3),rt=[[0,z],[0,Oe],[0,1100],[0,Fu-yn]];for(let R=1;R<=8;R++){let V=Math.PI/2*(R/8);rt.push([yn-yn*Math.cos(V),Fu-yn+yn*Math.sin(V)])}let Z=new le({color:8365784,emissive:10275071,emissiveMap:Y,emissiveIntensity:.16,alphaMap:Y,transparent:!0,opacity:.32,depthWrite:!1,roughness:.1,metalness:.2,side:Ie});Y.repeat.set(1,1);let tt=new bt($n(x,rt,{uLen:900,vOf:(R,V)=>V/1040,skip:ao(Oe)}),Z);tt.renderOrder=2,a.add(tt);let it=new bt(tt.geometry,new Ce({color:4880568,transparent:!0,opacity:.045,depthWrite:!1,side:Ie}));it.renderOrder=1,a.add(it);let Et=vp(x.map(R=>({...R,wall:"side"})),yn);Et.translate(0,Fu,0);let St=Et.attributes.uv;for(let R=0;R<St.count;R++)St.setXY(R,Et.attributes.position.getX(R)/900,Et.attributes.position.getZ(R)/1040);let jt=new bt(Et,Z.clone());jt.material.opacity=.07,jt.material.emissiveIntensity=.05,jt.renderOrder=2,a.add(jt);let Jt=[];for(let R of[1,-1])for(let V of[1,-1]){let B=V*Qe,j=[B,0,R*Mn];for(let at=0;at<A.length-1;at++){let[et,wt]=A[at],[At,ce]=A[at+1];Jt.push(...j,B,wt,R*(Mn-et),B,ce,R*(Mn-At))}}let $t=new Ne;$t.setAttribute("position",new re(Jt,3)),$t.computeVertexNormals(),a.add(new bt($t,new le({color:2764856,roughness:.6,metalness:.3,side:Ie})));let X=[];for(let R of[0,1]){let V=R===0?-1:1,B=je[R],j=new qe,at=Pu(4,256);at.repeat.set(An/300,Oe/300);let et=new le({color:658448,emissive:B.main,emissiveMap:at,emissiveIntensity:1.4,roughness:.6,metalness:.2,side:Ie}),wt=at.clone();wt.repeat.set(2*Qe/300,Oe/300),wt.needsUpdate=!0;let At=et.clone();At.emissiveMap=wt;let ce=new bt(new En(An,Oe),et);ce.rotation.y=Math.PI/2,ce.position.set(Qe,Oe/2,V*(Mn+An/2));let he=ce.clone();he.position.x=-Qe;let Sn=new bt(new En(2*Qe,Oe),At);Sn.position.set(0,Oe/2,V*(Mn+An));let bn=at.clone();bn.repeat.set(2*Qe/300,An/300),bn.needsUpdate=!0;let Ns=et.clone();Ns.emissiveMap=bn,Ns.emissiveIntensity=.8;let Or=new bt(new En(2*Qe,An),Ns);Or.rotation.x=Math.PI/2,Or.position.set(0,Oe,V*(Mn+An/2)),j.add(ce,he,Sn,Or);let Us=new le({color:2236962,emissive:B.main,emissiveIntensity:4.5,roughness:.3,metalness:.6}),Bi=new le({color:2764083,emissive:B.main,emissiveIntensity:1.2,roughness:.4,metalness:.7}),Fc=new Pe(46,Oe+46,46);for(let Fs of[-1,1]){let Hr=new bt(Fc,Us);Hr.position.set(Fs*(Qe+23),(Oe+46)/2,V*(Mn+23)),j.add(Hr);let gs=new bt(new Pe(36,Oe,36),Bi);gs.position.set(Fs*(Qe+18),Oe/2,V*(Mn+An)),j.add(gs);let Vr=new bt(new Pe(30,30,An),Bi);Vr.position.set(Fs*(Qe+15),Oe+15,V*(Mn+An/2)),j.add(Vr)}let Br=new bt(new Pe(2*Qe+92,46,46),Us);Br.position.set(0,Oe+23,V*(Mn+23));let zr=new bt(new Pe(2*Qe+72,30,30),Bi);zr.position.set(0,Oe+15,V*(Mn+An)),j.add(Br,zr);let ai=new bt(new Pe(2*Qe+500,70,80),Bi);ai.position.set(0,Oe+260,V*(Mn+60)),j.add(ai),a.add(j);let ms=new Aa(B.main,0,40,2);ms.position.set(0,3.5,V*(Mn+An*.6)*.01),r.add(ms),X.push({light:ms,frameMat:Us,netMat:[et,At,Ns],base:4.5})}let Q=op(),mt=new le({map:Q,roughness:.95,emissive:16777215,emissiveMap:Q,emissiveIntensity:.07,side:Ie}),Bt=new le({color:1382430,roughness:.8,metalness:.3,side:Ie}),_t=[[-60,720],[-1200,1240],[-2300,1760],[-3300,2300]],Ht=[[-3300,2780],[-4200,3250],[-5100,3720],[-5900,4150]],ie=R=>{let V=0,B=[0];for(let j=1;j<R.length;j++)V+=Math.hypot(R[j][0]-R[j-1][0],R[j][1]-R[j-1][1]),B.push(V);return j=>B[j]/900};a.add(new bt($n(x,_t,{uLen:3400,vOf:ie(_t)}),mt)),a.add(new bt($n(x,Ht,{uLen:3400,vOf:ie(Ht)}),mt));let st=new bt($n(x,[[-60,0],[-60,Oe+40],[-60,720]],{uLen:4200,vOf:R=>R===0?0:R===1?.5:1,skip:ao(Oe+40,60)}),Bt);a.add(st);let ot=Iu(),ct=new bt($n(x,[[-3300,2300],[-3300,2780]],{uLen:5200,vOf:R=>R}),new le({color:328965,emissive:16777215,emissiveMap:ot,emissiveIntensity:1.6,side:Ie}));a.add(ct),o.push(R=>{ot.offset.x=(ot.offset.x-R*.02)%1}),a.add(new bt($n(x,[[-5900,4150],[-5900,4650]],{uLen:2e3}),Bt));let ht=new Ce({vertexColors:!0,fog:!1,side:Ie});a.add(new bt($n(x,[[-5900,4650],[-5900,4700]],{colorOf:(R,V,B)=>Ou(B,2.2)}),ht));let ft=new le({color:921620,roughness:.8,metalness:.4,side:Ie});a.add(new bt($n(x,[[-6500,5350],[-4200,5220],[-1900,5120]],{uLen:2e3}),ft)),a.add(new bt($n(x,[[-1900,5120],[-1900,5020]],{uLen:2e3}),Bt));let Vt=new le({color:1711394,roughness:.6,metalness:.7}),zt=new Ce({color:new Ct(4.2,4.2,4),fog:!1}),kt=[-3700,-1250,1250,3700],Yt=new Pe(150,14,60),L=kt.length*30+160,oe=new lr(Yt,zt,L),Kt=0;for(let R of kt){let V=new bt(new Pe(2*Uc+4400,200,140),Vt);V.position.set(0,5560,R),a.add(V);let B=new bt(new Pe(2*Uc+4400,60,60),Vt);B.position.set(0,5180,R),a.add(B);for(let j=0;j<30;j++){let at=-Uc-1300+j*(2*Uc+2600)/29;f.makeTranslation(at,5140,R),oe.setMatrixAt(Kt++,f)}}let C=Ka(420,3);for(let R of C){if(Kt>=L)break;let V=R.x-R.nx*1950,B=R.z-R.nz*1950;f.makeRotationY(Math.atan2(R.nx,R.nz)),f.setPosition(V,5010,B),oe.setMatrixAt(Kt++,f)}oe.count=Kt,a.add(oe);let _=[],O=new le({color:2764598,roughness:.4,metalness:.7}),W=new xn(70,80,6,32),K=new xn(150,175,14,40),ut=new pi(64,7,8,40),dt=new pi(140,10,8,48),$=new In(52,24,16),nt=new xn(70,150,260,32,1,!0);for(let R of e.pads){let V=new qe;V.position.set(R.x,0,R.z);let B=new le({color:3348992,emissive:16753183,emissiveIntensity:R.big?2.6:1.4});if(B.userData.base=R.big?2.6:1.4,R.big){let j=new bt(K,O);j.position.y=4;let at=new bt(dt,B);at.rotation.x=Math.PI/2,at.position.y=12;let et=new bt($,new le({color:16752672,emissive:16747536,emissiveIntensity:3.5,roughness:.2}));et.position.y=110;let wt=new bt(nt,new Ce({color:16751152,transparent:!0,opacity:.13,blending:_n,depthWrite:!1,side:Ie}));wt.position.y=135,V.add(j,at,et,wt),_.push({pad:R,grp:V,ring:at,orb:et,cone:wt,glowMat:B})}else{let j=new bt(W,O);j.position.y=2;let at=new bt(ut,B);at.rotation.x=Math.PI/2,at.position.y=6;let et=new bt(new Pi(40,24),B);et.rotation.x=-Math.PI/2,et.position.y=6,V.add(j,at,et),_.push({pad:R,grp:V,ring:at,glowMat:B})}a.add(V)}let pt=new Ss;pt.add(new bt(new In(100,32,16),_p(n)));let Nt=new Ce({color:new Ct(12,12,11)});for(let R=0;R<10;R++){let V=R/10*Math.PI*2,B=new bt(new Pe(14,2,4),Nt);B.position.set(Math.cos(V)*30,30,Math.sin(V)*36),B.lookAt(0,0,0),pt.add(B)}let xt=new bt(new En(200,200),new Ce({color:1915416}));xt.rotation.x=-Math.PI/2,xt.position.y=-2,pt.add(xt);let gt=new Mr(s),Dt=gt.fromScene(pt,.03).texture;gt.dispose(),t.environment=Dt,t.environmentIntensity=n.envI;let Ft=0,qt=0;return o.push(R=>{qt+=R,Ft=Math.max(0,Ft-R*.18),Q.offset.y=Ft>0?Math.abs(Math.sin(qt*14))*.012*Math.min(1,Ft*2):0;for(let V of _){let B=V.pad.active;V.orb&&(V.orb.visible=B,V.cone.visible=B,V.orb.position.y=110+Math.sin(qt*2.2+V.pad.x)*12,V.orb.rotation.y+=R);let j=V.glowMat.userData.base;V.glowMat.emissiveIntensity=B?j*(1+Math.sin(qt*4+V.pad.z)*.18):.12}for(let V of X)V.light.intensity=Math.max(0,V.light.intensity-R*900),V.frameMat.emissiveIntensity+=(V.base-V.frameMat.emissiveIntensity)*Math.min(1,R*1.5)}),{root:r,exposure:n.exposure,bindPads(R){_.forEach((V,B)=>{R[B]&&(V.pad=R[B])})},dispose(){t.remove(r);let R=new Set;r.traverse(V=>{V.geometry&&!R.has(V.geometry)&&(R.add(V.geometry),V.geometry.dispose());let B=V.material?Array.isArray(V.material)?V.material:[V.material]:[];for(let j of B)if(!R.has(j)){R.add(j);for(let at in j)j[at]&&j[at].isTexture&&!R.has(j[at])&&(R.add(j[at]),j[at].dispose());j.dispose()}}),Dt.dispose(),t.environment=null,t.fog=null},update(R){for(let V of o)V(R)},cheer(R=1){Ft=Math.max(Ft,R)},goalFlash(R){let V=X[R];V.light.intensity=2500,V.frameMat.emissiveIntensity=14}}}var Sp="rocketArena.settings.v1";function Ey(){let s=navigator.userAgent||"";return/Xbox/i.test(s)?"medium":/Android|iPhone|iPad|Mobile/i.test(s)?"low":"high"}function Ty(){let s={quality:Ey(),volume:.7,rumble:!0,ballCam:!0,fov:100,replays:!0,showFps:!1,timeOfDay:"night",split:"horizontal",duration:300,difficulty:"pro",teamSize_solo:1,teamSize_versus:1,teamSize_coop:2};try{let t=JSON.parse(localStorage.getItem(Sp)||"{}");return{...s,...t}}catch{return s}}var zu=class{constructor(){this.settings=Ty();let t=new URLSearchParams(location.search);t.get("quality")&&(this.settings.quality=t.get("quality")),this.input=new co,this.audio=new ho,this.audio.volume=this.settings.volume,this.input.onActivity=()=>this.audio.resume();let e=this.input.rumble.bind(this.input);this.input.rumble=(...n)=>{this.settings.rumble&&e(...n)},this.input.onPadConnect=(n,i)=>this.toast(i?"\u{1F3AE} Controller connected":"Controller disconnected"),this.hud=new pc(document.getElementById("hud")),this.hud.show(!1),this.menu=new mc(this,document.getElementById("menu")),this.container=document.getElementById("game"),this.paused=!1,this.match=null,this.buildGraphics(),this.startAttract(),this.last=performance.now(),this.fpsT=0,this.fpsN=0,document.getElementById("loading")?.remove(),requestAnimationFrame(n=>this.loop(n)),window.__app=this}buildGraphics(){this.gfx&&this.gfx.dispose(),this.gfx=new Nc(this.container,this.settings.quality),this.builtQuality=this.settings.quality,this.buildStadium()}buildStadium(){this.stadium&&this.stadium.dispose();let t=dc.map(([e,n])=>({x:e,z:n,big:!0,active:!0})).concat(fc.map(([e,n])=>({x:e,z:n,big:!1,active:!0})));this.stadium=yp(this.gfx.renderer,this.gfx.scene,{quality:this.settings.quality,timeOfDay:this.settings.timeOfDay,pads:t}),this.gfx.setExposure(this.stadium.exposure),this.builtTime=this.settings.timeOfDay}saveSettings(){try{localStorage.setItem(Sp,JSON.stringify(this.settings))}catch{}}applySettings(){this.saveSettings(),this.audio.setVolume(this.settings.volume),this.settings.quality!==this.builtQuality&&(this.disposeMatch(),this.buildGraphics(),this.startAttract(!1))}ensureStadium(){this.settings.timeOfDay!==this.builtTime&&this.buildStadium()}disposeMatch(){this.match&&this.match.dispose(),this.match=null}startAttract(t=!0){this.disposeMatch(),this.paused=!1,this.hud.show(!1),this.match=new io(this,{mode:"attract",teamSize:2,duration:0,difficulty:"pro",humans:[]}),this.stadium.bindPads(this.match.world.pads),t&&this.menu.show("main")}startMatch(t){this.audio.resume(),this.lastCfg=t,this.disposeMatch(),this.ensureStadium(),this.menu.hide(),this.paused=!1,this.match=new io(this,t),this.stadium.bindPads(this.match.world.pads)}restartMatch(){this.lastCfg&&this.startMatch(this.lastCfg)}pauseMatch(){this.paused||(this.paused=!0,this.menu.show("pause"))}resume(){if(this.paused=!1,this.menu.hide(),this.resumeFrame=this.frames,this.match){this.match.acc=0;for(let t of this.match.humans)t.car.prevJump=!0}}quitToMenu(){this.startAttract(!0)}showResults(t){this.menu.show("results",t)}toggleFullscreen(){bp()}toast(t){let e=document.createElement("div");e.className="toast",e.textContent=t,document.body.appendChild(e),setTimeout(()=>e.classList.add("out"),2200),setTimeout(()=>e.remove(),2800)}loop(t){requestAnimationFrame(i=>this.loop(i));let e=Math.min(.1,Math.max(0,(t-this.last)/1e3));this.last=t,this.input.update();let n=this.input.menu();if(this.menu.visible&&this.menu.update(n),this.match)if(this.paused){for(let i of this.match.engines)this.audio.updateEngine(i,0,0,!1,!1,!1);this.match.renderPaused()}else this.match.update(e);if(this.fpsT+=e,this.fpsN++,this.fpsT>.5){let i=this.fpsN/this.fpsT;this.hud.setFps(this.settings.showFps?`${Math.round(i)} FPS`:"");let r=this.match&&!this.match.attract&&!this.paused;this.slowT=r&&i<32&&this.settings.quality!=="low"?(this.slowT||0)+this.fpsT:0,this.slowT>6&&!this.slowHinted&&(this.slowHinted=!0,this.toast("Running slowly? Lower Graphics in Settings for a smoother game")),this.fpsT=0,this.fpsN=0}this.input.endFrame(),this.frames=(this.frames||0)+1}};function wy(){try{history.pushState({game:1},""),window.addEventListener("popstate",()=>history.pushState({game:1},""))}catch{}}function bp(){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen({navigationUI:"hide"}).catch(()=>{})}catch{}}function Mp(){wy(),window.addEventListener("keydown",s=>{s.code==="KeyF"&&!s.repeat&&window.__app&&window.__app.menu.visible&&bp()});try{new zu}catch(s){console.error(s);let t=document.getElementById("loading");t&&(t.innerHTML=`<div class="err">Could not start the game: ${s.message}<br>Your browser needs WebGL 2 support.</div>`)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Mp):Mp();})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
