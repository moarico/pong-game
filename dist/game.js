(()=>{var ma=["a","b","x","y","lb","rb","lt","rt","view","menu","ls","rs","up","down","left","right","guide"],sv={solo:{up:["KeyW","ArrowUp"],down:["KeyS","ArrowDown"],left:["KeyA","ArrowLeft"],right:["KeyD","ArrowRight"],jump:["Space","KeyK"],boost:["ShiftLeft","ShiftRight","KeyL"],slide:["ControlLeft","KeyC","KeyJ"],rollL:["KeyQ","KeyU"],rollR:["KeyE","KeyO"],cam:["KeyR","KeyI"],pause:["Escape","KeyP"],item:["KeyF","KeyH"],mouse:{boost:0,jump:2,cam:1}},p1:{up:["KeyW"],down:["KeyS"],left:["KeyA"],right:["KeyD"],jump:["Space"],boost:["ShiftLeft"],slide:["ControlLeft","KeyC"],rollL:["KeyQ"],rollR:["KeyE"],cam:["KeyR"],pause:["Escape"],item:["KeyF"],mouse:{boost:0,jump:2,cam:1}},p2:{up:["ArrowUp"],down:["ArrowDown"],left:["ArrowLeft"],right:["ArrowRight"],jump:["KeyK","Numpad0"],boost:["KeyL","NumpadDecimal"],slide:["KeyJ","Numpad1"],rollL:["KeyU"],rollR:["KeyO"],cam:["KeyI","Numpad2"],pause:["KeyP"],item:["KeyH","Numpad3"]}},rv=new Set(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab","ShiftLeft","ShiftRight","ControlLeft"]);function Ql(s,t,e=.16){let n=Math.hypot(s,t);if(n<e)return[0,0];let i=Math.min(1,(n-e)/(1-e))/n;return[s*i,t*i]}var $u=class{constructor(t){this.index=t,this.id="",this.connected=!1,this.b={},this.prev={};for(let e of ma)this.b[e]=0,this.prev[e]=0;this.lx=0,this.ly=0,this.rx=0,this.ry=0,this.triggerSeenNeg=[!1,!1],this.navRepeat={dir:"",t:0},this.raw=null}pressed(t){return this.b[t]>.5&&this.prev[t]<=.5}down(t){return this.b[t]>.5}},tc=class{constructor(){this.keys=new Set,this.keysPressed=new Set,this.mouse=new Set,this.mousePressed=new Set,this.gamepadBlocked=!1,this.rbIsItem=!1,this.pads=[],this.onActivity=null,this.onPadConnect=null,this.kbNav={dir:"",t:0},this.lastFrame=performance.now();try{navigator.gamepadInputEmulation="gamepad"}catch{}window.addEventListener("keydown",t=>{rv.has(t.code)&&!(t.target&&t.target.tagName==="INPUT")&&t.preventDefault(),t.repeat||this.keysPressed.add(t.code),this.keys.add(t.code),this.onActivity&&this.onActivity()}),window.addEventListener("keyup",t=>{this.keys.delete(t.code)}),window.addEventListener("blur",()=>{this.keys.clear(),this.mouse.clear()}),window.addEventListener("pointerdown",()=>{this.onActivity&&this.onActivity()}),window.addEventListener("mousedown",t=>{this.mouse.has(t.button)||this.mousePressed.add(t.button),this.mouse.add(t.button),t.button===1&&t.preventDefault()}),window.addEventListener("mouseup",t=>{this.mouse.delete(t.button)}),window.addEventListener("mousemove",t=>{t.buttons&1||this.mouse.delete(0),t.buttons&2||this.mouse.delete(2),t.buttons&4||this.mouse.delete(1)}),window.addEventListener("contextmenu",t=>t.preventDefault()),window.addEventListener("gamepadconnected",t=>{this.onPadConnect&&this.onPadConnect(t.gamepad,!0)}),window.addEventListener("gamepaddisconnected",t=>{let e=this.pads[t.gamepad.index];e&&(e.connected=!1),this.onPadConnect&&this.onPadConnect(t.gamepad,!1)})}update(){let t=performance.now();this.dt=Math.min(.1,(t-this.lastFrame)/1e3),this.lastFrame=t;let e=[];try{e=navigator.getGamepads?navigator.getGamepads():[]}catch{e=[],this.gamepadBlocked=!0}for(let n of this.pads)n&&(n.connected=!1);for(let n=0;n<e.length;n++){let i=e[n];if(!i||!i.connected)continue;let r=this.pads[i.index]||(this.pads[i.index]=new $u(i.index));r.connected=!0,r.id=i.id,r.raw=i;for(let o of ma)r.prev[o]=r.b[o];if(this.readPad(r,i),this.onActivity){for(let o of ma)if(r.pressed(o)){this.onActivity();break}}}}readPad(t,e){let n=r=>e.buttons[r]?typeof e.buttons[r]=="object"?e.buttons[r].value||(e.buttons[r].pressed?1:0):e.buttons[r]:0,i=r=>e.axes[r]!==void 0?e.axes[r]:0;if(e.mapping==="standard"||e.axes.length<6)ma.forEach((r,o)=>{t.b[r]=n(o)}),[t.lx,t.ly]=Ql(i(0),i(1)),[t.rx,t.ry]=Ql(i(2),i(3));else{let r={a:0,b:1,x:2,y:3,lb:4,rb:5,view:6,menu:7,guide:8,ls:9,rs:10};for(let a of ma)t.b[a]=0;for(let a in r)t.b[a]=n(r[a]);let o=(a,l)=>{let c=i(a);return c<-.5&&(t.triggerSeenNeg[l]=!0),t.triggerSeenNeg[l]?(c+1)/2:Math.max(0,c)};t.b.lt=o(2,0),t.b.rt=o(5,1),t.b.left=i(6)<-.5?1:0,t.b.right=i(6)>.5?1:0,t.b.up=i(7)<-.5?1:0,t.b.down=i(7)>.5?1:0,[t.lx,t.ly]=Ql(i(0),i(1)),[t.rx,t.ry]=Ql(i(3),i(4))}}endFrame(){this.keysPressed.clear(),this.mousePressed.clear()}connectedPads(){return this.pads.filter(t=>t&&t.connected)}anyKey(t){for(let e of t)if(this.keys.has(e))return!0;return!1}anyKeyPressed(t){for(let e of t)if(this.keysPressed.has(e))return!0;return!1}keyboardControls(t){let e=sv[t],n=e.mouse,i=this.anyKey(e.up)?1:0,r=this.anyKey(e.down)?1:0,o=this.anyKey(e.left)?1:0,a=this.anyKey(e.right)?1:0,l=h=>!!n&&this.mouse.has(n[h]),c=h=>!!n&&this.mousePressed.has(n[h]);return{throttle:i-r,steer:a-o,pitch:r-i,yaw:a-o,roll:(this.anyKey(e.rollR)?1:0)-(this.anyKey(e.rollL)?1:0),jump:this.anyKey(e.jump)||l("jump"),boost:this.anyKey(e.boost)||l("boost"),powerslide:this.anyKey(e.slide),ballCam:this.anyKeyPressed(e.cam)||c("cam"),pause:this.anyKeyPressed(e.pause),lookX:0,lookY:0,skip:this.anyKeyPressed(e.jump)||c("jump"),itemDown:this.anyKey(e.item),digitalSteer:!0}}padControls(t){let e=t.b.right-t.b.left,n=t.b.down-t.b.up,i=Math.abs(t.lx)>Math.abs(e)?t.lx:e,r=Math.abs(t.ly)>Math.abs(n)?t.ly:n;return{throttle:t.b.rt-t.b.lt,steer:i,pitch:r,yaw:i,roll:(this.rbIsItem?0:t.b.rb)-t.b.lb,itemDown:this.rbIsItem&&t.down("rb"),jump:t.down("a"),boost:t.down("b"),powerslide:t.down("x"),ballCam:t.pressed("y"),pause:t.pressed("menu"),lookX:t.rx,lookY:t.ry,skip:t.pressed("a"),digitalSteer:Math.abs(t.lx)<.01&&Math.abs(e)>0}}controls(t){if(t.type==="kb")return this.keyboardControls(t.layout);if(t.type==="pad"){let n=this.pads[t.index];return!n||!n.connected?ov():this.padControls(n)}let e=this.keyboardControls("solo");for(let n of this.connectedPads()){let i=this.padControls(n);for(let r in i)r!=="digitalSteer"&&(typeof i[r]=="boolean"?e[r]=e[r]||i[r]:Math.abs(i[r])>Math.abs(e[r])&&(e[r]=i[r],r==="steer"&&(e.digitalSteer=i.digitalSteer)))}return e}menu(){let t={up:!1,down:!1,left:!1,right:!1,confirm:!1,back:!1,start:!1,source:null},e=n=>this.anyKeyPressed(n);e(["ArrowUp","KeyW"])&&(t.up=!0),e(["ArrowDown","KeyS"])&&(t.down=!0),e(["ArrowLeft","KeyA"])&&(t.left=!0),e(["ArrowRight","KeyD"])&&(t.right=!0),e(["Enter","NumpadEnter","Space"])&&(t.confirm=!0,t.source={type:"kb"}),e(["Escape","Backspace"])&&(t.back=!0);for(let n of this.connectedPads()){n.pressed("up")&&(t.up=!0),n.pressed("down")&&(t.down=!0),n.pressed("left")&&(t.left=!0),n.pressed("right")&&(t.right=!0),n.pressed("a")&&(t.confirm=!0,t.source={type:"pad",index:n.index}),n.pressed("b")&&(t.back=!0),n.pressed("menu")&&(t.start=!0);let i="";n.ly<-.6?i="up":n.ly>.6?i="down":n.lx<-.6?i="left":n.lx>.6&&(i="right");let r=n.navRepeat;i&&i!==r.dir?(t[i]=!0,r.t=.38):i&&(r.t-=this.dt||.016,r.t<=0&&(t[i]=!0,r.t=.13)),r.dir=i}return t}rumble(t,e,n,i){let r=t.type==="pad"?[this.pads[t.index]]:t.type==="any"?this.connectedPads():[];for(let o of r){let a=o&&o.raw;if(a)try{a.vibrationActuator&&a.vibrationActuator.playEffect?a.vibrationActuator.playEffect("dual-rumble",{startDelay:0,duration:i,weakMagnitude:Math.min(1,n),strongMagnitude:Math.min(1,e)}).catch(()=>{}):a.hapticActuators&&a.hapticActuators[0]&&a.hapticActuators[0].pulse(Math.min(1,Math.max(e,n)),i)}catch{}}}};function ov(){return{throttle:0,steer:0,pitch:0,yaw:0,roll:0,jump:!1,boost:!1,powerslide:!1,ballCam:!1,pause:!1,lookX:0,lookY:0,skip:!1,itemDown:!1}}function Ku(s){if(!s)return"Controller";let t=s.toLowerCase();return t.includes("xbox")||t.includes("xinput")||t.includes("045e")?"Xbox Controller":t.includes("dualsense")||t.includes("dualshock")||t.includes("054c")?"PlayStation Controller":"Controller"}var ec=class{constructor(){this.ctx=null,this.volume=.7,this.engines=[],this.cineNodes=[]}init(){if(this.ctx)return!0;let t=window.AudioContext||window.webkitAudioContext;if(!t)return!1;try{this.ctx=new t}catch{return!1}let e=this.ctx;this.master=e.createGain(),this.master.gain.value=this.volume;let n=e.createDynamicsCompressor();n.threshold.value=-14,n.ratio.value=4,this.master.connect(n).connect(e.destination);let i=e.sampleRate*2;this.noise=e.createBuffer(1,i,e.sampleRate);let r=this.noise.getChannelData(0),o=0;for(let u=0;u<i;u++){let d=Math.random()*2-1;o=(o+.02*d)/1.02,r[u]=d*.6+o*3}let a=this.loopNoise(),l=e.createBiquadFilter();l.type="bandpass",l.frequency.value=700,l.Q.value=.6;let c=e.createOscillator();c.frequency.value=.23;let h=e.createGain();return h.gain.value=.015,this.crowdGain=e.createGain(),this.crowdGain.gain.value=.05,c.connect(h).connect(this.crowdGain.gain),a.connect(l).connect(this.crowdGain).connect(this.master),c.start(),this.applyRain(),!0}setRain(t){this.rainAmount=t,this.ctx&&this.applyRain()}applyRain(){let t=this.rainAmount||0;if(!t&&!this.rainGain)return;let e=this.ctx;if(!this.rainGain){let n=this.loopNoise(),i=e.createBiquadFilter();i.type="highpass",i.frequency.value=1100;let r=e.createBiquadFilter();r.type="lowpass",r.frequency.value=7e3,this.rainGain=e.createGain(),this.rainGain.gain.value=0,n.connect(i).connect(r).connect(this.rainGain).connect(this.master)}this.rainGain.gain.setTargetAtTime(t*.11,e.currentTime,.6)}thunder(t=1,e=1.5){if(!this.ready)return;let n=Math.max(.2,Math.min(1,t));this.burst({dur:.45,gain:.45*n,freq:3200,endFreq:260,delay:e}),this.burst({dur:3.8+Math.random()*2,gain:.85*n,freq:300,endFreq:38,q:.5,delay:e+.06}),this.burst({dur:2.6,gain:.55*n,freq:140,endFreq:32,delay:e+.45+Math.random()*.6,pan:Math.random()*1.2-.6})}resume(){this.init()&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{})}get ready(){return this.ctx&&this.ctx.state==="running"}setVolume(t){this.volume=t,this.master&&this.master.gain.setTargetAtTime(t,this.ctx.currentTime,.05)}loopNoise(){let t=this.ctx.createBufferSource();return t.buffer=this.noise,t.loop=!0,t.loopStart=Math.random(),t.start(0,Math.random()*1.5),t}burst({dur:t=.2,gain:e=.5,freq:n=1200,endFreq:i=null,type:r="lowpass",q:o=.7,pan:a=0,delay:l=0}){if(!this.ready)return;let c=this.ctx,h=c.currentTime+l,u=c.createBufferSource();u.buffer=this.noise;let d=c.createBiquadFilter();d.type=r,d.frequency.setValueAtTime(n,h),i&&d.frequency.exponentialRampToValueAtTime(i,h+t),d.Q.value=o;let f=c.createGain();f.gain.setValueAtTime(1e-4,h),f.gain.exponentialRampToValueAtTime(e,h+.008),f.gain.exponentialRampToValueAtTime(1e-4,h+t);let m=c.createStereoPanner?c.createStereoPanner():null,v=u.connect(d).connect(f);m&&(m.pan.value=a,v=v.connect(m)),v.connect(this.master),u.start(h,Math.random()*1.5),u.stop(h+t+.05)}tone({freq:t=440,endFreq:e=null,dur:n=.2,gain:i=.3,type:r="sine",delay:o=0,attack:a=.005}){if(!this.ready)return;let l=this.ctx,c=l.currentTime+o,h=l.createOscillator();h.type=r,h.frequency.setValueAtTime(t,c),e&&h.frequency.exponentialRampToValueAtTime(e,c+n);let u=l.createGain();u.gain.setValueAtTime(1e-4,c),u.gain.exponentialRampToValueAtTime(i,c+a),u.gain.exponentialRampToValueAtTime(1e-4,c+n),h.connect(u).connect(this.master),h.start(c),h.stop(c+n+.05)}createEngine(t=0){if(!this.ctx)return null;let e=this.ctx,n=e.createGain();n.gain.value=0;let i=e.createStereoPanner?e.createStereoPanner():null;i?(i.pan.value=t,n.connect(i).connect(this.master)):n.connect(this.master);let r=e.createOscillator();r.type="sawtooth";let o=e.createOscillator();o.type="square";let a=e.createBiquadFilter();a.type="lowpass",a.Q.value=2;let l=e.createGain();l.gain.value=.5,r.connect(a),o.connect(l).connect(a),a.connect(n),r.start(),o.start();let c=this.loopNoise(),h=e.createBiquadFilter();h.type="bandpass",h.frequency.value=900,h.Q.value=.5;let u=e.createGain();u.gain.value=0,c.connect(h).connect(u),i?u.connect(i):u.connect(this.master);let d={out:n,o1:r,o2:o,lp:a,bg:u,bf:h,nodes:[r,o,c]};return this.engines.push(d),d}updateEngine(t,e,n,i,r,o){if(!t||!this.ctx)return;let a=this.ctx.currentTime,l=Math.abs(n),c=38+e*.05+l*14;t.o1.frequency.setTargetAtTime(c,a,.06),t.o2.frequency.setTargetAtTime(c*.5,a,.06),t.lp.frequency.setTargetAtTime(240+e*.9+l*700,a,.08),t.out.gain.setTargetAtTime(o?.05+l*.06+(r?.02:0):0,a,.1),t.bg.gain.setTargetAtTime(o&&i?.22:0,a,.04),t.bf.frequency.setTargetAtTime(i?700+e*.4:900,a,.1)}stopEngine(t){if(t){try{t.out.gain.value=0,t.bg.gain.value=0;for(let e of t.nodes)e.stop()}catch{}this.engines=this.engines.filter(e=>e!==t)}}stopEngines(){for(let t of this.engines)try{t.out.gain.value=0,t.bg.gain.value=0;for(let e of t.nodes)e.stop()}catch{}this.engines=[]}hit(t,e=0){let n=Math.min(1,t/3500);this.burst({dur:.12+n*.15,gain:.25+n*.6,freq:900+n*3e3,endFreq:200,pan:e}),this.tone({freq:140,endFreq:45,dur:.18+n*.15,gain:.25+n*.5}),n>.6&&this.burst({dur:.35,gain:.25*n,freq:4e3,endFreq:800,type:"highpass",pan:e})}bounce(t){let e=Math.min(1,t/2500);this.tone({freq:90,endFreq:40,dur:.15,gain:.08+e*.2}),this.burst({dur:.08,gain:.05+e*.15,freq:600,endFreq:150})}bump(){this.burst({dur:.18,gain:.5,freq:1500,endFreq:200}),this.tone({freq:220,endFreq:70,dur:.15,gain:.3,type:"triangle"})}demo(){this.burst({dur:.9,gain:.9,freq:3e3,endFreq:80}),this.tone({freq:90,endFreq:30,dur:.7,gain:.7}),this.burst({dur:.5,gain:.3,freq:6e3,endFreq:1500,type:"highpass",delay:.05})}goal(){this.burst({dur:1.8,gain:1,freq:4e3,endFreq:60}),this.tone({freq:70,endFreq:25,dur:1.2,gain:.9}),this.burst({dur:.6,gain:.4,freq:7e3,endFreq:2e3,type:"highpass",delay:.05}),this.cheer(1)}cheer(t){if(!this.ready)return;let e=this.ctx.currentTime,n=this.crowdGain.gain;n.cancelScheduledValues(e),n.setValueAtTime(n.value,e),n.linearRampToValueAtTime(.05+.35*t,e+.4),n.linearRampToValueAtTime(.05+.25*t,e+2.5),n.linearRampToValueAtTime(.05,e+6);for(let i=0;i<6;i++)this.burst({dur:1.2+Math.random(),gain:.06*t,freq:500+Math.random()*900,type:"bandpass",q:4,delay:Math.random()*1.2,pan:Math.random()*2-1})}boostPickup(t){t?(this.tone({freq:520,endFreq:1200,dur:.18,gain:.12,type:"triangle"}),this.tone({freq:780,endFreq:1600,dur:.2,gain:.08,type:"triangle",delay:.06})):this.tone({freq:1100,endFreq:1500,dur:.07,gain:.06,type:"triangle"})}jump(){this.burst({dur:.16,gain:.12,freq:700,endFreq:2400,type:"bandpass",q:1.2})}dodge(){this.burst({dur:.25,gain:.16,freq:1800,endFreq:500,type:"bandpass",q:1})}land(t){this.tone({freq:70,endFreq:40,dur:.12,gain:Math.min(.25,t/3e3)})}beep(t){this.tone({freq:t?880:523,dur:t?.5:.18,gain:.25,type:"square"}),this.tone({freq:t?1760:1046,dur:t?.45:.15,gain:.08,type:"sine"})}horn(){for(let t of[220,277,330])this.tone({freq:t,dur:1.4,gain:.12,type:"sawtooth",attack:.04})}itemGet(){this.tone({freq:660,endFreq:990,dur:.12,gain:.08,type:"triangle"}),this.tone({freq:990,endFreq:1320,dur:.14,gain:.07,type:"triangle",delay:.08})}itemUse(t,e=1){let n=Math.max(.2,e);switch(t){case"grapple":case"plunger":this.burst({dur:.25,gain:.25*n,freq:2500,endFreq:700,type:"bandpass",q:2});break;case"tornado":this.burst({dur:2.5,gain:.35*n,freq:300,endFreq:1400,type:"bandpass",q:.8}),this.burst({dur:3,gain:.2*n,freq:900,endFreq:400,type:"bandpass",q:3,delay:.3});break;case"freezer":this.tone({freq:1800,endFreq:3200,dur:.4,gain:.12*n,type:"sine"}),this.burst({dur:.5,gain:.25*n,freq:6e3,endFreq:3e3,type:"highpass"});break;case"curveball":this.tone({freq:300,endFreq:1200,dur:.5,gain:.15*n,type:"sawtooth"});break;case"power":case"spikes":this.tone({freq:140,endFreq:420,dur:.35,gain:.25*n,type:"square"});break;default:this.burst({dur:.2,gain:.3*n,freq:1200,endFreq:200})}}hook(t=1){this.tone({freq:900,endFreq:500,dur:.12,gain:.2*Math.max(.2,t),type:"square"}),this.burst({dur:.1,gain:.2*Math.max(.2,t),freq:4e3,endFreq:1500,type:"highpass"})}cine(t){if(!this.ready)return;let e=this.ctx;switch(t){case"rise":[523,659,784,1046].forEach((n,i)=>this.tone({freq:n,dur:.9,gain:.09,type:"triangle",delay:i*.11,attack:.02})),this.tone({freq:131,dur:1.6,gain:.18,type:"sawtooth",attack:.05});break;case"flap":this.burst({dur:1,gain:.25,freq:3e3,endFreq:500,type:"bandpass",q:1.5}),this.tone({freq:160,endFreq:70,dur:.6,gain:.25,type:"square"});break;case"clunk":this.tone({freq:70,endFreq:30,dur:.5,gain:.7}),this.burst({dur:.4,gain:.6,freq:1500,endFreq:100});break;case"build":this.tone({freq:90,endFreq:900,dur:2.6,gain:.12,type:"sawtooth",attack:.3});for(let n=0;n<12;n++)this.tone({freq:700+n*90,dur:.12,gain:.05,type:"square",delay:n*.2});break;case"launch":this.burst({dur:1.4,gain:.7,freq:500,endFreq:3e3,type:"bandpass",q:.7}),this.tone({freq:60,endFreq:120,dur:1.2,gain:.4,type:"sawtooth"});break;case"whoosh":this.burst({dur:1.3,gain:.5,freq:300,endFreq:4e3,type:"bandpass",q:1.2});break;case"boom":this.burst({dur:2.6,gain:1,freq:3500,endFreq:40}),this.tone({freq:60,endFreq:18,dur:2.4,gain:1}),this.burst({dur:.8,gain:.5,freq:7e3,endFreq:1500,type:"highpass",delay:.03});break;case"tear":this.burst({dur:3,gain:.8,freq:200,endFreq:1200,type:"lowpass"});for(let n=0;n<8;n++)this.burst({dur:.3,gain:.35,freq:2500,endFreq:300,delay:Math.random()*2.5});break;case"drone":this.startDrone(32,.55);break;case"space":{this.stopCine(1.5),this.startDrone(24,.45);let n=e.currentTime,i=e.createGain();i.gain.setValueAtTime(1e-4,n),i.gain.exponentialRampToValueAtTime(.06,n+3),i.connect(this.master);let r=[110,164.8,220.5,329.6].map((o,a)=>{let l=e.createOscillator();return l.type="sine",l.frequency.value=o*(1+(a%2?.003:-.002)),l.connect(i),l.start(n),l});this.cineNodes.push({out:i,srcs:r});break}case"gulp":this.tone({freq:180,endFreq:20,dur:1.6,gain:.8}),this.burst({dur:1.5,gain:.6,freq:1200,endFreq:60});break;case"bigboom":this.stopCine(.2),this.burst({dur:5,gain:1,freq:5e3,endFreq:30}),this.tone({freq:50,endFreq:15,dur:4.5,gain:1}),this.tone({freq:100,endFreq:25,dur:3,gain:.6,type:"sawtooth"}),this.burst({dur:1.5,gain:.6,freq:8e3,endFreq:2e3,type:"highpass",delay:.05}),this.burst({dur:4,gain:.5,freq:600,endFreq:80,delay:.6});break;case"stop":this.stopCine(.6);break;default:break}}startDrone(t,e){let n=this.ctx,i=n.currentTime,r=n.createGain();r.gain.setValueAtTime(1e-4,i),r.gain.exponentialRampToValueAtTime(e,i+1.5);let o=n.createBiquadFilter();o.type="lowpass",o.frequency.setValueAtTime(140,i),o.frequency.linearRampToValueAtTime(700,i+9),o.Q.value=3,o.connect(r).connect(this.master);let a=[1,1.012,.5].map(h=>{let u=n.createOscillator();return u.type="sawtooth",u.frequency.setValueAtTime(t*h,i),u.frequency.linearRampToValueAtTime(t*h*1.8,i+10),u.connect(o),u.start(i),u}),l=this.loopNoise(),c=n.createGain();c.gain.value=.6,l.connect(c).connect(o),a.push(l),this.cineNodes=this.cineNodes||[],this.cineNodes.push({out:r,srcs:a})}stopCine(t=.5){if(!this.ctx||!this.cineNodes)return;let e=this.ctx.currentTime;for(let n of this.cineNodes)try{n.out.gain.cancelScheduledValues(e),n.out.gain.setValueAtTime(Math.max(1e-4,n.out.gain.value),e),n.out.gain.exponentialRampToValueAtTime(1e-4,e+t);for(let i of n.srcs)i.stop(e+t+.05)}catch{}this.cineNodes=[]}click(){this.tone({freq:1400,dur:.04,gain:.05,type:"square"})}select(){this.tone({freq:900,endFreq:1400,dur:.09,gain:.08,type:"triangle"})}};var l0=0,Nd=1,c0=2;var Cr=1,h0=2,Po=3,ls=0,fn=1,Zt=2,Si=0,Ei=1,de=2,Ud=3,Fd=4,u0=5;var Pr=100,d0=101,f0=102,p0=103,m0=104,g0=200,v0=201,x0=202,y0=203,Bd=204,Od=205,_0=206,M0=207,b0=208,S0=209,E0=210,w0=211,T0=212,R0=213,A0=214,Ic=0,Lc=1,Dc=2,fo=3,Nc=4,Uc=5,Fc=6,Bc=7,Hd=0,C0=1,P0=2,Gi=0,ol=1,al=2,ll=3,Ir=4,cl=5,hl=6,ul=7;var kd=300,$s=301,Lr=302,hh=303,uh=304,dl=306,bn=1e3,Qi=1001,Oc=1002,en=1003,I0=1004;var fl=1005;var cn=1006,dh=1007;var ti=1008;var On=1009,zd=1010,Vd=1011,Io=1012,fh=1013,Wi=1014,wi=1015,tn=1016,ph=1017,mh=1018,Lo=1020,Gd=35902,Wd=35899,qd=1021,Xd=1022,Ti=1023,ns=1026,Ks=1027,gh=1028,vh=1029,Js=1030,xh=1031;var yh=1033,pl=33776,ml=33777,gl=33778,vl=33779,_h=35840,Mh=35841,bh=35842,Sh=35843,Eh=36196,wh=37492,Th=37496,Rh=37488,Ah=37489,xl=37490,Ch=37491,Ph=37808,Ih=37809,Lh=37810,Dh=37811,Nh=37812,Uh=37813,Fh=37814,Bh=37815,Oh=37816,Hh=37817,kh=37818,zh=37819,Vh=37820,Gh=37821,Wh=36492,qh=36494,Xh=36495,Yh=36283,Zh=36284,yl=36285,$h=36286;var Pa=2300,Hc=2301,Cc=2302,bd=2303,Sd=2400,Ed=2401,wd=2402;var L0=3200;var Kh=0,D0=1,Cs="",Te="srgb",Ia="srgb-linear",La="linear",Pe="srgb";var Pc=7680;var N0=519,U0=512,F0=513,B0=514,Jh=515,O0=516,H0=517,jh=518,k0=519,Yd=35044,ei=35048;var Zd="300 es",Oi=2e3,po=2001;function av(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function lv(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Da(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function z0(){let s=Da("canvas");return s.style.display="block",s}var Ap={},mo=null;function Na(...s){let t="THREE."+s.shift();mo?mo("log",t,...s):console.log(t,...s)}function V0(s){let t=s[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=s[1];e&&e.isStackTrace?s[0]+=" "+e.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function Qt(...s){s=V0(s);let t="THREE."+s.shift();if(mo)mo("warn",t,...s);else{let e=s[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...s)}}function ne(...s){s=V0(s);let t="THREE."+s.shift();if(mo)mo("error",t,...s);else{let e=s[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...s)}}function _r(...s){let t=s.join(" ");t in Ap||(Ap[t]=!0,Qt(...s))}function G0(s,t,e){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var W0={[Ic]:Lc,[Dc]:Fc,[Nc]:Bc,[fo]:Uc,[Lc]:Ic,[Fc]:Dc,[Bc]:Nc,[Uc]:fo},is=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let i=n[t];if(i!==void 0){let r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,t);t.target=null}}},Fn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Cp=1234567,Ta=Math.PI/180,go=180/Math.PI;function es(){let s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Fn[s&255]+Fn[s>>8&255]+Fn[s>>16&255]+Fn[s>>24&255]+"-"+Fn[t&255]+Fn[t>>8&255]+"-"+Fn[t>>16&15|64]+Fn[t>>24&255]+"-"+Fn[e&63|128]+Fn[e>>8&255]+"-"+Fn[e>>16&255]+Fn[e>>24&255]+Fn[n&255]+Fn[n>>8&255]+Fn[n>>16&255]+Fn[n>>24&255]).toLowerCase()}function xe(s,t,e){return Math.max(t,Math.min(e,s))}function $d(s,t){return(s%t+t)%t}function cv(s,t,e,n,i){return n+(s-t)*(i-n)/(e-t)}function hv(s,t,e){return s!==t?(e-s)/(t-s):0}function Ra(s,t,e){return(1-e)*s+e*t}function uv(s,t,e,n){return Ra(s,t,1-Math.exp(-e*n))}function dv(s,t=1){return t-Math.abs($d(s,t*2)-t)}function fv(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function pv(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function mv(s,t){return s+Math.floor(Math.random()*(t-s+1))}function gv(s,t){return s+Math.random()*(t-s)}function vv(s){return s*(.5-Math.random())}function xv(s){s!==void 0&&(Cp=s);let t=Cp+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function yv(s){return s*Ta}function _v(s){return s*go}function Mv(s){return s>0&&Number.isInteger(s)&&2**Math.round(Math.log2(s))===s}function bv(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Sv(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Ev(s,t,e,n,i){let r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+n)/2),h=o((t+n)/2),u=r((t-n)/2),d=o((t-n)/2),f=r((n-t)/2),m=o((n-t)/2);switch(i){case"XYX":s.set(a*h,l*u,l*d,a*c);break;case"YZY":s.set(l*d,a*h,l*u,a*c);break;case"ZXZ":s.set(l*u,l*d,a*h,a*c);break;case"XZX":s.set(a*h,l*m,l*f,a*c);break;case"YXY":s.set(l*f,a*h,l*m,a*c);break;case"ZYZ":s.set(l*m,l*f,a*h,a*c);break;default:Qt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function Bi(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:case Uint8ClampedArray:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Ue(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var pe={DEG2RAD:Ta,RAD2DEG:go,generateUUID:es,clamp:xe,euclideanModulo:$d,mapLinear:cv,inverseLerp:hv,lerp:Ra,damp:uv,pingpong:dv,smoothstep:fv,smootherstep:pv,randInt:mv,randFloat:gv,randFloatSpread:vv,seededRandom:xv,degToRad:yv,radToDeg:_v,isPowerOfTwo:Mv,ceilPowerOfTwo:bv,floorPowerOfTwo:Sv,setQuaternionFromProperEuler:Ev,normalize:Ue,denormalize:Bi},ef=class ef{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=xe(this.x,t.x,e.x),this.y=xe(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=xe(this.x,t,e),this.y=xe(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(xe(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(xe(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*i+t.x,this.y=r*i+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};ef.prototype.isVector2=!0;var nt=ef,re=class{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,o,a){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3],d=r[o+0],f=r[o+1],m=r[o+2],v=r[o+3];if(u!==v||l!==d||c!==f||h!==m){let p=l*d+c*f+h*m+u*v;p<0&&(d=-d,f=-f,m=-m,v=-v,p=-p);let g=1-a;if(p<.9995){let x=Math.acos(p),_=Math.sin(x);g=Math.sin(g*x)/_,a=Math.sin(a*x)/_,l=l*g+d*a,c=c*g+f*a,h=h*g+m*a,u=u*g+v*a}else{l=l*g+d*a,c=c*g+f*a,h=h*g+m*a,u=u*g+v*a;let x=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=x,c*=x,h*=x,u*=x}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,i,r,o){let a=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[o],d=r[o+1],f=r[o+2],m=r[o+3];return t[e]=a*m+h*u+l*f-c*d,t[e+1]=l*m+h*d+c*u-a*f,t[e+2]=c*m+h*f+a*d-l*u,t[e+3]=h*m-a*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,i=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(i/2),u=a(r/2),d=l(n/2),f=l(i/2),m=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"YXZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"ZXY":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"ZYX":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"YZX":this._x=d*h*u+c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u-d*f*m;break;case"XZY":this._x=d*h*u-c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u+d*f*m;break;default:Qt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],i=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=n+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-i)*f}else if(n>a&&n>u){let f=2*Math.sqrt(1+n-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(r+c)/f}else if(a>u){let f=2*Math.sqrt(1+a-n-u);this._w=(r-c)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-n-a);this._w=(o-i)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(xe(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,i=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+i*c-r*l,this._y=i*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-i*a,this._w=o*h-n*a-i*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,i=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,i=-i,r=-r,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+n*e,this._y=this._y*l+i*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+i*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},nf=class nf{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Pp.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Pp.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,i=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*i-a*n),h=2*(a*e-r*i),u=2*(r*n-o*e);return this.x=e+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=i+l*u+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=xe(this.x,t.x,e.x),this.y=xe(this.y,t.y,e.y),this.z=xe(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=xe(this.x,t,e),this.y=xe(this.y,t,e),this.z=xe(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(xe(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,i=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=i*l-r*a,this.y=r*o-n*l,this.z=n*a-i*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Ju.copy(this).projectOnVector(t),this.sub(Ju)}reflect(t){return this.sub(Ju.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(xe(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};nf.prototype.isVector3=!0;var E=nf,Ju=new E,Pp=new re,sf=class sf{constructor(t,e,n,i,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,o,a,l,c)}set(t,e,n,i,r,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=i,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],m=n[8],v=i[0],p=i[3],g=i[6],x=i[1],_=i[4],y=i[7],b=i[2],S=i[5],T=i[8];return r[0]=o*v+a*x+l*b,r[3]=o*p+a*_+l*S,r[6]=o*g+a*y+l*T,r[1]=c*v+h*x+u*b,r[4]=c*p+h*_+u*S,r[7]=c*g+h*y+u*T,r[2]=d*v+f*x+m*b,r[5]=d*p+f*_+m*S,r[8]=d*g+f*y+m*T,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*r*h+n*a*l+i*r*c-i*o*l}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,m=e*u+n*d+i*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/m;return t[0]=u*v,t[1]=(i*c-h*n)*v,t[2]=(a*n-i*o)*v,t[3]=d*v,t[4]=(h*e-i*l)*v,t[5]=(i*r-a*e)*v,t[6]=f*v,t[7]=(n*l-c*e)*v,t[8]=(o*e-n*r)*v,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-i*c,i*l,-i*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return _r("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ju.makeScale(t,e)),this}rotate(t){return _r("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ju.makeRotation(-t)),this}translate(t,e){return _r("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ju.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};sf.prototype.isMatrix3=!0;var oe=sf,ju=new oe,Ip=new oe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Lp=new oe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function wv(){let s={enabled:!0,workingColorSpace:Ia,spaces:{},convert:function(i,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Pe&&(i.r=Ts(i.r),i.g=Ts(i.g),i.b=Ts(i.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Pe&&(i.r=uo(i.r),i.g=uo(i.g),i.b=uo(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Cs?La:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,o){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return _r("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return _r("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[Ia]:{primaries:t,whitePoint:n,transfer:La,toXYZ:Ip,fromXYZ:Lp,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Te},outputColorSpaceConfig:{drawingBufferColorSpace:Te}},[Te]:{primaries:t,whitePoint:n,transfer:Pe,toXYZ:Ip,fromXYZ:Lp,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Te}}}),s}var Me=wv();function Ts(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function uo(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var Yr,kc=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{Yr===void 0&&(Yr=Da("canvas")),Yr.width=t.width,Yr.height=t.height;let i=Yr.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),n=Yr}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Da("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=Ts(r[o]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Ts(e[n]/255)*255):e[n]=Ts(e[n]);return{data:e,width:t.width,height:t.height}}else return Qt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Tv=0,vo=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Tv++}),this.uuid=es(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(Qu(i[o].image)):r.push(Qu(i[o]))}else r=Qu(i);n.url=r}return e||(t.images[this.uuid]=n),n}};function Qu(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?kc.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(Qt("Texture: Unable to serialize Texture."),{})}var Rv=0,td=new E,Xn=class s extends is{constructor(t=s.DEFAULT_IMAGE,e=s.DEFAULT_MAPPING,n=Qi,i=Qi,r=cn,o=ti,a=Ti,l=On,c=s.DEFAULT_ANISOTROPY,h=Cs){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Rv++}),this.uuid=es(),this.name="",this.source=new vo(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new nt(0,0),this.repeat=new nt(1,1),this.center=new nt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new oe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(td).x}get height(){return this.source.getSize(td).y}get depth(){return this.source.getSize(td).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Qt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){Qt(`Texture.setValues(): property '${e}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==kd)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case bn:t.x=t.x-Math.floor(t.x);break;case Qi:t.x=t.x<0?0:1;break;case Oc:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case bn:t.y=t.y-Math.floor(t.y);break;case Qi:t.y=t.y<0?0:1;break;case Oc:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Xn.DEFAULT_IMAGE=null;Xn.DEFAULT_MAPPING=kd;Xn.DEFAULT_ANISOTROPY=1;var rf=class rf{constructor(t=0,e=0,n=0,i=1){this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*i+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r,l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],m=l[9],v=l[2],p=l[6],g=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-v)<.01&&Math.abs(m-p)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+v)<.1&&Math.abs(m+p)<.1&&Math.abs(c+f+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let _=(c+1)/2,y=(f+1)/2,b=(g+1)/2,S=(h+d)/4,T=(u+v)/4,M=(m+p)/4;return _>y&&_>b?_<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(_),i=S/n,r=T/n):y>b?y<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(y),n=S/i,r=M/i):b<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(b),n=T/r,i=M/r),this.set(n,i,r,e),this}let x=Math.sqrt((p-m)*(p-m)+(u-v)*(u-v)+(d-h)*(d-h));return Math.abs(x)<.001&&(x=1),this.x=(p-m)/x,this.y=(u-v)/x,this.z=(d-h)/x,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=xe(this.x,t.x,e.x),this.y=xe(this.y,t.y,e.y),this.z=xe(this.z,t.z,e.z),this.w=xe(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=xe(this.x,t,e),this.y=xe(this.y,t,e),this.z=xe(this.z,t,e),this.w=xe(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(xe(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};rf.prototype.isVector4=!0;var Ve=rf,zc=class extends is{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:cn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Ve(0,0,t,e),this.scissorTest=!1,this.viewport=new Ve(0,0,t,e),this.textures=[];let i={width:t,height:e,depth:n.depth},r=new Xn(i),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:cn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let i=Object.assign({},t.textures[e].image);this.textures[e].source=new vo(i)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},qe=class extends zc{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},Mr=class extends Xn{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=en,this.minFilter=en,this.wrapR=Qi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Vc=class extends Xn{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=en,this.minFilter=en,this.wrapR=Qi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var ch=class ch{constructor(t,e,n,i,r,o,a,l,c,h,u,d,f,m,v,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,o,a,l,c,h,u,d,f,m,v,p)}set(t,e,n,i,r,o,a,l,c,h,u,d,f,m,v,p){let g=this.elements;return g[0]=t,g[4]=e,g[8]=n,g[12]=i,g[1]=r,g[5]=o,g[9]=a,g[13]=l,g[2]=c,g[6]=h,g[10]=u,g[14]=d,g[3]=f,g[7]=m,g[11]=v,g[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ch().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,i=1/Zr.setFromMatrixColumn(t,0).length(),r=1/Zr.setFromMatrixColumn(t,1).length(),o=1/Zr.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,i=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let d=o*h,f=o*u,m=a*h,v=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+m*c,e[5]=d-v*c,e[9]=-a*l,e[2]=v-d*c,e[6]=m+f*c,e[10]=o*l}else if(t.order==="YXZ"){let d=l*h,f=l*u,m=c*h,v=c*u;e[0]=d+v*a,e[4]=m*a-f,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-m,e[6]=v+d*a,e[10]=o*l}else if(t.order==="ZXY"){let d=l*h,f=l*u,m=c*h,v=c*u;e[0]=d-v*a,e[4]=-o*u,e[8]=m+f*a,e[1]=f+m*a,e[5]=o*h,e[9]=v-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let d=o*h,f=o*u,m=a*h,v=a*u;e[0]=l*h,e[4]=m*c-f,e[8]=d*c+v,e[1]=l*u,e[5]=v*c+d,e[9]=f*c-m,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let d=o*l,f=o*c,m=a*l,v=a*c;e[0]=l*h,e[4]=v-d*u,e[8]=m*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*u+m,e[10]=d-v*u}else if(t.order==="XZY"){let d=o*l,f=o*c,m=a*l,v=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+v,e[5]=o*h,e[9]=f*u-m,e[2]=m*u-f,e[6]=a*h,e[10]=v*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Av,t,Cv)}lookAt(t,e,n){let i=this.elements;return ai.subVectors(t,e),ai.lengthSq()===0&&(ai.z=1),ai.normalize(),Hs.crossVectors(n,ai),Hs.lengthSq()===0&&(Math.abs(n.z)===1?ai.x+=1e-4:ai.z+=1e-4,ai.normalize(),Hs.crossVectors(n,ai)),Hs.normalize(),nc.crossVectors(ai,Hs),i[0]=Hs.x,i[4]=nc.x,i[8]=ai.x,i[1]=Hs.y,i[5]=nc.y,i[9]=ai.y,i[2]=Hs.z,i[6]=nc.z,i[10]=ai.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],m=n[2],v=n[6],p=n[10],g=n[14],x=n[3],_=n[7],y=n[11],b=n[15],S=i[0],T=i[4],M=i[8],R=i[12],C=i[1],I=i[5],L=i[9],k=i[13],N=i[2],O=i[6],V=i[10],q=i[14],rt=i[3],G=i[7],X=i[11],Q=i[15];return r[0]=o*S+a*C+l*N+c*rt,r[4]=o*T+a*I+l*O+c*G,r[8]=o*M+a*L+l*V+c*X,r[12]=o*R+a*k+l*q+c*Q,r[1]=h*S+u*C+d*N+f*rt,r[5]=h*T+u*I+d*O+f*G,r[9]=h*M+u*L+d*V+f*X,r[13]=h*R+u*k+d*q+f*Q,r[2]=m*S+v*C+p*N+g*rt,r[6]=m*T+v*I+p*O+g*G,r[10]=m*M+v*L+p*V+g*X,r[14]=m*R+v*k+p*q+g*Q,r[3]=x*S+_*C+y*N+b*rt,r[7]=x*T+_*I+y*O+b*G,r[11]=x*M+_*L+y*V+b*X,r[15]=x*R+_*k+y*q+b*Q,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],m=t[3],v=t[7],p=t[11],g=t[15],x=l*f-c*d,_=a*f-c*u,y=a*d-l*u,b=o*f-c*h,S=o*d-l*h,T=o*u-a*h;return e*(v*x-p*_+g*y)-n*(m*x-p*b+g*S)+i*(m*_-v*b+g*T)-r*(m*y-v*S+p*T)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],i=t[8],r=t[1],o=t[5],a=t[9],l=t[2],c=t[6],h=t[10];return e*(o*h-a*c)-n*(r*h-a*l)+i*(r*c-o*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],m=t[12],v=t[13],p=t[14],g=t[15],x=e*a-n*o,_=e*l-i*o,y=e*c-r*o,b=n*l-i*a,S=n*c-r*a,T=i*c-r*l,M=h*v-u*m,R=h*p-d*m,C=h*g-f*m,I=u*p-d*v,L=u*g-f*v,k=d*g-f*p,N=x*k-_*L+y*I+b*C-S*R+T*M;if(N===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let O=1/N;return t[0]=(a*k-l*L+c*I)*O,t[1]=(i*L-n*k-r*I)*O,t[2]=(v*T-p*S+g*b)*O,t[3]=(d*S-u*T-f*b)*O,t[4]=(l*C-o*k-c*R)*O,t[5]=(e*k-i*C+r*R)*O,t[6]=(p*y-m*T-g*_)*O,t[7]=(h*T-d*y+f*_)*O,t[8]=(o*L-a*C+c*M)*O,t[9]=(n*C-e*L-r*M)*O,t[10]=(m*S-v*y+g*x)*O,t[11]=(u*y-h*S-f*x)*O,t[12]=(a*R-o*I-l*M)*O,t[13]=(e*I-n*R+i*M)*O,t[14]=(v*_-m*b-p*x)*O,t[15]=(h*b-u*_+d*x)*O,this}scale(t){let e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),i=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,h*a+n,h*l-i*o,0,c*l-i*a,h*l+i*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,o){return this.set(1,n,r,0,t,1,o,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){let i=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,m=r*u,v=o*h,p=o*u,g=a*u,x=l*c,_=l*h,y=l*u,b=n.x,S=n.y,T=n.z;return i[0]=(1-(v+g))*b,i[1]=(f+y)*b,i[2]=(m-_)*b,i[3]=0,i[4]=(f-y)*S,i[5]=(1-(d+g))*S,i[6]=(p+x)*S,i[7]=0,i[8]=(m+_)*T,i[9]=(p-x)*T,i[10]=(1-(d+v))*T,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){let i=this.elements;t.x=i[12],t.y=i[13],t.z=i[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let o=Zr.set(i[0],i[1],i[2]).length(),a=Zr.set(i[4],i[5],i[6]).length(),l=Zr.set(i[8],i[9],i[10]).length();r<0&&(o=-o),Ni.copy(this);let c=1/o,h=1/a,u=1/l;return Ni.elements[0]*=c,Ni.elements[1]*=c,Ni.elements[2]*=c,Ni.elements[4]*=h,Ni.elements[5]*=h,Ni.elements[6]*=h,Ni.elements[8]*=u,Ni.elements[9]*=u,Ni.elements[10]*=u,e.setFromRotationMatrix(Ni),n.x=o,n.y=a,n.z=l,this}makePerspective(t,e,n,i,r,o,a=Oi,l=!1){let c=this.elements,h=2*r/(e-t),u=2*r/(n-i),d=(e+t)/(e-t),f=(n+i)/(n-i),m,v;if(l)m=r/(o-r),v=o*r/(o-r);else if(a===Oi)m=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===po)m=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,i,r,o,a=Oi,l=!1){let c=this.elements,h=2/(e-t),u=2/(n-i),d=-(e+t)/(e-t),f=-(n+i)/(n-i),m,v;if(l)m=1/(o-r),v=o/(o-r);else if(a===Oi)m=-2/(o-r),v=-(o+r)/(o-r);else if(a===po)m=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=m,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};ch.prototype.isMatrix4=!0;var le=ch,Zr=new E,Ni=new le,Av=new E(0,0,0),Cv=new E(1,1,1),Hs=new E,nc=new E,ai=new E,Dp=new le,Np=new re,ci=class s{constructor(t=0,e=0,n=0,i=s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let i=t.elements,r=i[0],o=i[4],a=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(e){case"XYZ":this._y=Math.asin(xe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-xe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(xe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-xe(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(xe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-xe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Qt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Dp.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Dp,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Np.setFromEuler(this),this.setFromQuaternion(Np,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ci.DEFAULT_ORDER="XYZ";var Ua=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Pv=0,Up=new E,$r=new re,_s=new le,ic=new E,ga=new E,Iv=new E,Lv=new re,Fp=new E(1,0,0),Bp=new E(0,1,0),Op=new E(0,0,1),Hp={type:"added"},Dv={type:"removed"},Kr={type:"childadded",child:null},ed={type:"childremoved",child:null},xn=class s extends is{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Pv++}),this.uuid=es(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let t=new E,e=new ci,n=new re,i=new E(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new le},normalMatrix:{value:new oe}}),this.matrix=new le,this.matrixWorld=new le,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ua,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return $r.setFromAxisAngle(t,e),this.quaternion.multiply($r),this}rotateOnWorldAxis(t,e){return $r.setFromAxisAngle(t,e),this.quaternion.premultiply($r),this}rotateX(t){return this.rotateOnAxis(Fp,t)}rotateY(t){return this.rotateOnAxis(Bp,t)}rotateZ(t){return this.rotateOnAxis(Op,t)}translateOnAxis(t,e){return Up.copy(t).applyQuaternion(this.quaternion),this.position.add(Up.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Fp,t)}translateY(t){return this.translateOnAxis(Bp,t)}translateZ(t){return this.translateOnAxis(Op,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(_s.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?ic.copy(t):ic.set(t,e,n);let i=this.parent;this.updateWorldMatrix(!0,!1),ga.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?_s.lookAt(ga,ic,this.up):_s.lookAt(ic,ga,this.up),this.quaternion.setFromRotationMatrix(_s),i&&(_s.extractRotation(i.matrixWorld),$r.setFromRotationMatrix(_s),this.quaternion.premultiply($r.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(ne("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Hp),Kr.child=t,this.dispatchEvent(Kr),Kr.child=null):ne("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Dv),ed.child=t,this.dispatchEvent(ed),ed.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),_s.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),_s.multiply(t.parent.matrixWorld)),t.applyMatrix4(_s),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Hp),Kr.child=t,this.dispatchEvent(Kr),Kr.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ga,t,Iv),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ga,Lv,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,i=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*i,r[13]+=n-r[1]*e-r[5]*n-r[9]*i,r[14]+=i-r[2]*e-r[6]*n-r[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,i.name=this.name,i.castShadow=this.castShadow,i.receiveShadow=this.receiveShadow,i.visible=this.visible,i.frustumCulled=this.frustumCulled,i.renderOrder=this.renderOrder,i.static=this.static,i.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null&&(i.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(i.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(a=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(t),i.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));i.material=a}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];i.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),m=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),m.length>0&&(n.nodes=m)}return n.object=i,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let i=t.children[n];this.add(i.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};xn.DEFAULT_UP=new E(0,1,0);xn.DEFAULT_MATRIX_AUTO_UPDATE=!0;xn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var se=class extends xn{constructor(){super(),this.isGroup=!0,this.type="Group"}},Nv={type:"move"},xo=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new se,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new se,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new E,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new E),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new se,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new E,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new E,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let v of t.hand.values()){let p=e.getJointPose(v,n),g=this._getHandJoint(c,v);p!==null&&(g.matrix.fromArray(p.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=p.radius),g.visible=p!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,m=.005;c.inputState.pinching&&d>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Nv)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new se;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},q0={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ks={h:0,s:0,l:0},sc={h:0,s:0,l:0};function nd(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}var mt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Te){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Me.colorSpaceToWorking(this,e),this}setRGB(t,e,n,i=Me.workingColorSpace){return this.r=t,this.g=e,this.b=n,Me.colorSpaceToWorking(this,i),this}setHSL(t,e,n,i=Me.workingColorSpace){if(t=$d(t,1),e=xe(e,0,1),n=xe(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=nd(o,r,t+1/3),this.g=nd(o,r,t),this.b=nd(o,r,t-1/3)}return Me.colorSpaceToWorking(this,i),this}setStyle(t,e=Te){function n(r){r!==void 0&&parseFloat(r)<1&&Qt("Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Qt("Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);Qt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Te){let n=q0[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Qt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ts(t.r),this.g=Ts(t.g),this.b=Ts(t.b),this}copyLinearToSRGB(t){return this.r=uo(t.r),this.g=uo(t.g),this.b=uo(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Te){return Me.workingToColorSpace(Bn.copy(this),t),Math.round(xe(Bn.r*255,0,255))*65536+Math.round(xe(Bn.g*255,0,255))*256+Math.round(xe(Bn.b*255,0,255))}getHexString(t=Te){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Me.workingColorSpace){Me.workingToColorSpace(Bn.copy(this),e);let n=Bn.r,i=Bn.g,r=Bn.b,o=Math.max(n,i,r),a=Math.min(n,i,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=Me.workingColorSpace){return Me.workingToColorSpace(Bn.copy(this),e),t.r=Bn.r,t.g=Bn.g,t.b=Bn.b,t}getStyle(t=Te){Me.workingToColorSpace(Bn.copy(this),t);let e=Bn.r,n=Bn.g,i=Bn.b;return t!==Te?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(ks),this.setHSL(ks.h+t,ks.s+e,ks.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(ks),t.getHSL(sc);let n=Ra(ks.h,sc.h,e),i=Ra(ks.s,sc.s,e),r=Ra(ks.l,sc.l,e);return this.setHSL(n,i,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,i=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*i,this.g=r[1]*e+r[4]*n+r[7]*i,this.b=r[2]*e+r[5]*n+r[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Bn=new mt;mt.NAMES=q0;var Fa=class s{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new mt(t),this.density=e}clone(){return new s(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var bi=class extends xn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ci,this.environmentIntensity=1,this.environmentRotation=new ci,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},Ui=new E,Ms=new E,id=new E,bs=new E,Jr=new E,jr=new E,kp=new E,sd=new E,rd=new E,od=new E,ad=new Ve,ld=new Ve,cd=new Ve,ws=class s{constructor(t=new E,e=new E,n=new E){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),Ui.subVectors(t,e),i.cross(Ui);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){Ui.subVectors(i,e),Ms.subVectors(n,e),id.subVectors(t,e);let o=Ui.dot(Ui),a=Ui.dot(Ms),l=Ui.dot(id),c=Ms.dot(Ms),h=Ms.dot(id),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(c*l-a*h)*d,m=(o*h-a*l)*d;return r.set(1-f-m,m,f)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,bs)===null?!1:bs.x>=0&&bs.y>=0&&bs.x+bs.y<=1}static getInterpolation(t,e,n,i,r,o,a,l){return this.getBarycoord(t,e,n,i,bs)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,bs.x),l.addScaledVector(o,bs.y),l.addScaledVector(a,bs.z),l)}static getInterpolatedAttribute(t,e,n,i,r,o){return ad.setScalar(0),ld.setScalar(0),cd.setScalar(0),ad.fromBufferAttribute(t,e),ld.fromBufferAttribute(t,n),cd.fromBufferAttribute(t,i),o.setScalar(0),o.addScaledVector(ad,r.x),o.addScaledVector(ld,r.y),o.addScaledVector(cd,r.z),o}static isFrontFacing(t,e,n,i){return Ui.subVectors(n,e),Ms.subVectors(t,e),Ui.cross(Ms).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Ui.subVectors(this.c,this.b),Ms.subVectors(this.a,this.b),Ui.cross(Ms).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return s.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return s.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,r){return s.getInterpolation(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return s.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return s.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,i=this.b,r=this.c,o,a;Jr.subVectors(i,n),jr.subVectors(r,n),sd.subVectors(t,n);let l=Jr.dot(sd),c=jr.dot(sd);if(l<=0&&c<=0)return e.copy(n);rd.subVectors(t,i);let h=Jr.dot(rd),u=jr.dot(rd);if(h>=0&&u<=h)return e.copy(i);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(Jr,o);od.subVectors(t,r);let f=Jr.dot(od),m=jr.dot(od);if(m>=0&&f<=m)return e.copy(r);let v=f*c-l*m;if(v<=0&&c>=0&&m<=0)return a=c/(c-m),e.copy(n).addScaledVector(jr,a);let p=h*m-f*u;if(p<=0&&u-h>=0&&f-m>=0)return kp.subVectors(r,i),a=(u-h)/(u-h+(f-m)),e.copy(i).addScaledVector(kp,a);let g=1/(p+v+d);return o=v*g,a=d*g,e.copy(n).addScaledVector(Jr,o).addScaledVector(jr,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},ss=class{constructor(t=new E(1/0,1/0,1/0),e=new E(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Fi.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Fi.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Fi.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Fi):Fi.fromBufferAttribute(r,o),Fi.applyMatrix4(t.matrixWorld),this.expandByPoint(Fi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),rc.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),rc.copy(n.boundingBox)),rc.applyMatrix4(t.matrixWorld),this.union(rc)}let i=t.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Fi),Fi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(va),oc.subVectors(this.max,va),Qr.subVectors(t.a,va),to.subVectors(t.b,va),eo.subVectors(t.c,va),zs.subVectors(to,Qr),Vs.subVectors(eo,to),gr.subVectors(Qr,eo);let e=[0,-zs.z,zs.y,0,-Vs.z,Vs.y,0,-gr.z,gr.y,zs.z,0,-zs.x,Vs.z,0,-Vs.x,gr.z,0,-gr.x,-zs.y,zs.x,0,-Vs.y,Vs.x,0,-gr.y,gr.x,0];return!hd(e,Qr,to,eo,oc)||(e=[1,0,0,0,1,0,0,0,1],!hd(e,Qr,to,eo,oc))?!1:(ac.crossVectors(zs,Vs),e=[ac.x,ac.y,ac.z],hd(e,Qr,to,eo,oc))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Fi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Fi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Ss[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Ss[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Ss[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Ss[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Ss[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Ss[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Ss[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Ss[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Ss),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Ss=[new E,new E,new E,new E,new E,new E,new E,new E],Fi=new E,rc=new ss,Qr=new E,to=new E,eo=new E,zs=new E,Vs=new E,gr=new E,va=new E,oc=new E,ac=new E,vr=new E;function hd(s,t,e,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){vr.fromArray(s,r);let a=i.x*Math.abs(vr.x)+i.y*Math.abs(vr.y)+i.z*Math.abs(vr.z),l=t.dot(vr),c=e.dot(vr),h=n.dot(vr);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var vn=new E,lc=new nt,Uv=0,ce=class extends is{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Uv++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Yd,this.updateRanges=[],this.gpuType=wi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)lc.fromBufferAttribute(this,e),lc.applyMatrix3(t),this.setXY(e,lc.x,lc.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)vn.fromBufferAttribute(this,e),vn.applyMatrix3(t),this.setXYZ(e,vn.x,vn.y,vn.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)vn.fromBufferAttribute(this,e),vn.applyMatrix4(t),this.setXYZ(e,vn.x,vn.y,vn.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)vn.fromBufferAttribute(this,e),vn.applyNormalMatrix(t),this.setXYZ(e,vn.x,vn.y,vn.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)vn.fromBufferAttribute(this,e),vn.transformDirection(t),this.setXYZ(e,vn.x,vn.y,vn.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Bi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Ue(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Bi(e,this.array)),e}setX(t,e){return this.normalized&&(e=Ue(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Bi(e,this.array)),e}setY(t,e){return this.normalized&&(e=Ue(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Bi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Ue(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Bi(e,this.array)),e}setW(t,e){return this.normalized&&(e=Ue(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Ue(e,this.array),n=Ue(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=Ue(e,this.array),n=Ue(n,this.array),i=Ue(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=Ue(e,this.array),n=Ue(n,this.array),i=Ue(i,this.array),r=Ue(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var br=class extends ce{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Sr=class extends ce{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var zt=class extends ce{constructor(t,e,n){super(new Float32Array(t),e,n)}},Fv=new ss,xa=new E,ud=new E,Rs=class{constructor(t=new E,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Fv.setFromPoints(t).getCenter(n);let i=0;for(let r=0,o=t.length;r<o;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;xa.subVectors(t,this.center);let e=xa.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(xa,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(ud.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(xa.copy(t.center).add(ud)),this.expandByPoint(xa.copy(t.center).sub(ud))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Bv=0,Mi=new le,dd=new xn,no=new E,li=new ss,ya=new ss,An=new E,ae=class s extends is{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Bv++}),this.uuid=es(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(av(t)?Sr:br)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new oe().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Mi.makeRotationFromQuaternion(t),this.applyMatrix4(Mi),this}rotateX(t){return Mi.makeRotationX(t),this.applyMatrix4(Mi),this}rotateY(t){return Mi.makeRotationY(t),this.applyMatrix4(Mi),this}rotateZ(t){return Mi.makeRotationZ(t),this.applyMatrix4(Mi),this}translate(t,e,n){return Mi.makeTranslation(t,e,n),this.applyMatrix4(Mi),this}scale(t,e,n){return Mi.makeScale(t,e,n),this.applyMatrix4(Mi),this}lookAt(t){return dd.lookAt(t),dd.updateMatrix(),this.applyMatrix4(dd.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(no).negate(),this.translate(no.x,no.y,no.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let i=0,r=t.length;i<r;i++){let o=t[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new zt(n,3))}else{let n=Math.min(t.length,e.count);for(let i=0;i<n;i++){let r=t[i];e.setXYZ(i,r.x,r.y,r.z||0)}t.length>e.count&&Qt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ss);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){ne("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new E(-1/0,-1/0,-1/0),new E(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){let r=e[n];li.setFromBufferAttribute(r),this.morphTargetsRelative?(An.addVectors(this.boundingBox.min,li.min),this.boundingBox.expandByPoint(An),An.addVectors(this.boundingBox.max,li.max),this.boundingBox.expandByPoint(An)):(this.boundingBox.expandByPoint(li.min),this.boundingBox.expandByPoint(li.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ne('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Rs);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){ne("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new E,1/0);return}if(t){let n=this.boundingSphere.center;if(li.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];ya.setFromBufferAttribute(a),this.morphTargetsRelative?(An.addVectors(li.min,ya.min),li.expandByPoint(An),An.addVectors(li.max,ya.max),li.expandByPoint(An)):(li.expandByPoint(ya.min),li.expandByPoint(ya.max))}li.getCenter(n);let i=0;for(let r=0,o=t.count;r<o;r++)An.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(An));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)An.fromBufferAttribute(a,c),l&&(no.fromBufferAttribute(t,c),An.add(no)),i=Math.max(i,n.distanceToSquared(An))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&ne('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){ne("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,i=e.normal,r=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new ce(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let M=0;M<n.count;M++)a[M]=new E,l[M]=new E;let c=new E,h=new E,u=new E,d=new nt,f=new nt,m=new nt,v=new E,p=new E;function g(M,R,C){c.fromBufferAttribute(n,M),h.fromBufferAttribute(n,R),u.fromBufferAttribute(n,C),d.fromBufferAttribute(r,M),f.fromBufferAttribute(r,R),m.fromBufferAttribute(r,C),h.sub(c),u.sub(c),f.sub(d),m.sub(d);let I=1/(f.x*m.y-m.x*f.y);isFinite(I)&&(v.copy(h).multiplyScalar(m.y).addScaledVector(u,-f.y).multiplyScalar(I),p.copy(u).multiplyScalar(f.x).addScaledVector(h,-m.x).multiplyScalar(I),a[M].add(v),a[R].add(v),a[C].add(v),l[M].add(p),l[R].add(p),l[C].add(p))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let M=0,R=x.length;M<R;++M){let C=x[M],I=C.start,L=C.count;for(let k=I,N=I+L;k<N;k+=3)g(t.getX(k+0),t.getX(k+1),t.getX(k+2))}let _=new E,y=new E,b=new E,S=new E;function T(M){b.fromBufferAttribute(i,M),S.copy(b);let R=a[M];_.copy(R),_.sub(b.multiplyScalar(b.dot(R))).normalize(),y.crossVectors(S,R);let I=y.dot(l[M])<0?-1:1;o.setXYZW(M,_.x,_.y,_.z,I)}for(let M=0,R=x.length;M<R;++M){let C=x[M],I=C.start,L=C.count;for(let k=I,N=I+L;k<N;k+=3)T(t.getX(k+0)),T(t.getX(k+1)),T(t.getX(k+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new ce(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let i=new E,r=new E,o=new E,a=new E,l=new E,c=new E,h=new E,u=new E;if(t)for(let d=0,f=t.count;d<f;d+=3){let m=t.getX(d+0),v=t.getX(d+1),p=t.getX(d+2);i.fromBufferAttribute(e,m),r.fromBufferAttribute(e,v),o.fromBufferAttribute(e,p),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),a.fromBufferAttribute(n,m),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,p),a.add(h),l.add(h),c.add(h),n.setXYZ(m,a.x,a.y,a.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)i.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)An.fromBufferAttribute(t,e),An.normalize(),t.setXYZ(e,An.x,An.y,An.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h),f=0,m=0;for(let v=0,p=l.length;v<p;v++){a.isInterleavedBufferAttribute?f=l[v]*a.data.stride+a.offset:f=l[v]*h;for(let g=0;g<h;g++)d[m++]=c[f++]}return new ce(d,h,u)}if(this.index===null)return Qt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new s,n=this.index.array,i=this.attributes;for(let a in i){let l=i[a],c=t(l,n);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=t(d,n);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let i={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(i[l]=h,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let i=t.attributes;for(let c in i){let h=i[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ba=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Yd,this.updateRanges=[],this.version=0,this.uuid=es()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let i=0,r=this.stride;i<r;i++)this.array[t+i]=e.array[n+i];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=es()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=es()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}},qn=new E,yo=class s{constructor(t,e,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)qn.fromBufferAttribute(this,e),qn.applyMatrix4(t),this.setXYZ(e,qn.x,qn.y,qn.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)qn.fromBufferAttribute(this,e),qn.applyNormalMatrix(t),this.setXYZ(e,qn.x,qn.y,qn.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)qn.fromBufferAttribute(this,e),qn.transformDirection(t),this.setXYZ(e,qn.x,qn.y,qn.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=Bi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Ue(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=Ue(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=Ue(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=Ue(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=Ue(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Bi(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Bi(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Bi(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Bi(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=Ue(e,this.array),n=Ue(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=Ue(e,this.array),n=Ue(n,this.array),i=Ue(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=Ue(e,this.array),n=Ue(n,this.array),i=Ue(i,this.array),r=Ue(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this.data.array[t+3]=r,this}clone(t){if(t===void 0){Na("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return new ce(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new s(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){Na("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},fd=new E,Ov=new E,Hv=new oe,Ln=class{constructor(t=new E(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let i=fd.subVectors(n,e).cross(Ov.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let i=t.delta(fd),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(i,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Hv.getNormalMatrix(t),i=this.coplanarPoint(fd).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},kv=0,rs=class extends is{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:kv++}),this.uuid=es(),this.name="",this.type="Material",this.blending=Ei,this.side=ls,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Bd,this.blendDst=Od,this.blendEquation=Pr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new mt(0,0,0),this.blendAlpha=0,this.depthFunc=fo,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=N0,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Pc,this.stencilZFail=Pc,this.stencilZPass=Pc,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Qt(`Material: parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){Qt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector2&&n&&n.isVector2||i&&i.isEuler&&n&&n.isEuler||i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(e){let r=i(t.textures),o=i(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new mt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new Ln().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new nt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new nt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let i=e.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},os=class extends rs{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new mt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},io,_a=new E,so=new E,ro=new E,oo=new nt,Ma=new nt,X0=new le,cc=new E,ba=new E,hc=new E,zp=new nt,pd=new nt,Vp=new nt,As=class extends xn{constructor(t=new os){if(super(),this.isSprite=!0,this.type="Sprite",io===void 0){io=new ae;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Ba(e,5);io.setIndex([0,1,2,0,2,3]),io.setAttribute("position",new yo(n,3,0,!1)),io.setAttribute("uv",new yo(n,2,3,!1))}this.geometry=io,this.material=t,this.center=new nt(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&ne('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),so.setFromMatrixScale(this.matrixWorld),X0.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),ro.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&so.multiplyScalar(-ro.z);let n=this.material.rotation,i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));let o=this.center;uc(cc.set(-.5,-.5,0),ro,o,so,i,r),uc(ba.set(.5,-.5,0),ro,o,so,i,r),uc(hc.set(.5,.5,0),ro,o,so,i,r),zp.set(0,0),pd.set(1,0),Vp.set(1,1);let a=t.ray.intersectTriangle(cc,ba,hc,!1,_a);if(a===null&&(uc(ba.set(-.5,.5,0),ro,o,so,i,r),pd.set(0,1),a=t.ray.intersectTriangle(cc,hc,ba,!1,_a),a===null))return;let l=t.ray.origin.distanceTo(_a);l<t.near||l>t.far||e.push({distance:l,point:_a.clone(),uv:ws.getInterpolation(_a,cc,ba,hc,zp,pd,Vp,new nt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function uc(s,t,e,n,i,r){oo.subVectors(s,e).addScalar(.5).multiply(n),i!==void 0?(Ma.x=r*oo.x-i*oo.y,Ma.y=i*oo.x+r*oo.y):Ma.copy(oo),s.copy(t),s.x+=Ma.x,s.y+=Ma.y,s.applyMatrix4(X0)}var Es=new E,md=new E,dc=new E,fc=new E,Oa=class{constructor(t=new E,e=new E(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Es)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Es.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Es.copy(this.origin).addScaledVector(this.direction,e),Es.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){md.copy(t).add(e).multiplyScalar(.5),dc.copy(e).sub(t).normalize(),fc.copy(this.origin).sub(md);let r=t.distanceTo(e)*.5,o=-this.direction.dot(dc),a=fc.dot(this.direction),l=-fc.dot(dc),c=fc.lengthSq(),h=Math.abs(1-o*o),u,d,f,m;if(h>0)if(u=o*l-a,d=o*a-l,m=r*h,u>=0)if(d>=-m)if(d<=m){let v=1/h;u*=v,d*=v,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-m?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=m?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(md).addScaledVector(dc,d),f}intersectSphere(t,e){if(t.radius<0)return null;Es.subVectors(t.center,this.origin);let n=Es.dot(this.direction),i=Es.dot(Es)-n*n,r=t.radius*t.radius;if(i>r)return null;let o=Math.sqrt(r-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,i=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,i=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),u>=0?(a=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,Es)!==null}intersectTriangle(t,e,n,i,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,u=t.x-o.x,d=t.y-o.y,f=t.z-o.z,m=e.x-o.x,v=e.y-o.y,p=e.z-o.z,g=n.x-o.x,x=n.y-o.y,_=n.z-o.z,y=Math.abs(l),b=Math.abs(c),S=Math.abs(h),T,M,R,C,I,L,k,N,O,V,q,rt;if(y>=b&&y>=S?(R=l,L=u,O=m,rt=g,l>=0?(T=c,M=h,C=d,I=f,k=v,N=p,V=x,q=_):(T=h,M=c,C=f,I=d,k=p,N=v,V=_,q=x)):b>=S?(R=c,L=d,O=v,rt=x,c>=0?(T=h,M=l,C=f,I=u,k=p,N=m,V=_,q=g):(T=l,M=h,C=u,I=f,k=m,N=p,V=g,q=_)):(R=h,L=f,O=p,rt=_,h>=0?(T=l,M=c,C=u,I=d,k=m,N=v,V=g,q=x):(T=c,M=l,C=d,I=u,k=v,N=m,V=x,q=g)),R===0)return null;let G=T/R,X=M/R,Q=1/R,_t=C-G*L,St=I-X*L,Ht=k-G*O,Vt=N-X*O,ee=V-G*rt,J=q-X*rt,lt=ee*Vt-J*Ht,wt=_t*J-St*ee,Xt=Ht*St-Vt*_t;if(i){if(lt<0||wt<0||Xt<0)return null}else if((lt<0||wt<0||Xt<0)&&(lt>0||wt>0||Xt>0))return null;let Ct=lt+wt+Xt;if(Ct===0)return null;let Kt=Q*(lt*L+wt*O+Xt*rt);return(Ct>0?Kt<0:Kt>0)?null:this.at(Kt/Ct,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ue=class extends rs{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new mt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ci,this.combine=Hd,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Gp=new le,xr=new Oa,pc=new Rs,Wp=new E,mc=new E,gc=new E,vc=new E,gd=new E,xc=new E,qp=new E,yc=new E,et=class extends xn{constructor(t=new ae,e=new ue){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(i,t);let a=this.morphTargetInfluences;if(r&&a){xc.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(gd.fromBufferAttribute(u,t),o?xc.addScaledVector(gd,h):xc.addScaledVector(gd.sub(e),h))}e.add(xc)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),pc.copy(n.boundingSphere),pc.applyMatrix4(r),xr.copy(t.ray).recast(t.near),!(pc.containsPoint(xr.origin)===!1&&(xr.intersectSphere(pc,Wp)===null||xr.origin.distanceToSquared(Wp)>(t.far-t.near)**2))&&(Gp.copy(r).invert(),xr.copy(t.ray).applyMatrix4(Gp),!(n.boundingBox!==null&&xr.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,xr)))}_computeIntersections(t,e,n){let i,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,v=d.length;m<v;m++){let p=d[m],g=o[p.materialIndex],x=Math.max(p.start,f.start),_=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let y=x,b=_;y<b;y+=3){let S=a.getX(y),T=a.getX(y+1),M=a.getX(y+2);i=_c(this,g,t,n,c,h,u,S,T,M),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{let m=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let p=m,g=v;p<g;p+=3){let x=a.getX(p),_=a.getX(p+1),y=a.getX(p+2);i=_c(this,o,t,n,c,h,u,x,_,y),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,v=d.length;m<v;m++){let p=d[m],g=o[p.materialIndex],x=Math.max(p.start,f.start),_=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let y=x,b=_;y<b;y+=3){let S=y,T=y+1,M=y+2;i=_c(this,g,t,n,c,h,u,S,T,M),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=p.materialIndex,e.push(i))}}else{let m=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let p=m,g=v;p<g;p+=3){let x=p,_=p+1,y=p+2;i=_c(this,o,t,n,c,h,u,x,_,y),i&&(i.faceIndex=Math.floor(p/3),e.push(i))}}}};function zv(s,t,e,n,i,r,o,a){let l;if(t.side===fn?l=n.intersectTriangle(o,r,i,!0,a):l=n.intersectTriangle(i,r,o,t.side===ls,a),l===null)return null;yc.copy(a),yc.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(yc);return c<e.near||c>e.far?null:{distance:c,point:yc.clone(),object:s}}function _c(s,t,e,n,i,r,o,a,l,c){s.getVertexPosition(a,mc),s.getVertexPosition(l,gc),s.getVertexPosition(c,vc);let h=zv(s,t,e,n,mc,gc,vc,qp);if(h){let u=new E;ws.getBarycoord(qp,mc,gc,vc,u),i&&(h.uv=ws.getInterpolatedAttribute(i,a,l,c,u,new nt)),r&&(h.uv1=ws.getInterpolatedAttribute(r,a,l,c,u,new nt)),o&&(h.normal=ws.getInterpolatedAttribute(o,a,l,c,u,new E),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new E,materialIndex:0};ws.getNormal(mc,gc,vc,d.normal),h.face=d,h.barycoord=u}return h}var Er=class extends Xn{constructor(t=null,e=1,n=1,i,r,o,a,l,c=en,h=en,u,d){super(null,o,a,l,c,h,i,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Hi=class extends ce{constructor(t,e,n,i=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},ao=new le,Xp=new le,Mc=[],Yp=new ss,Vv=new le,Sa=new et,Ea=new Rs,hi=class extends et{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Hi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Vv)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new ss),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ao),Yp.copy(t.boundingBox).applyMatrix4(ao),this.boundingBox.union(Yp)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Rs),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ao),Ea.copy(t.boundingSphere).applyMatrix4(ao),this.boundingSphere.union(Ea)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(t,e){let n=this.matrixWorld,i=this.count;if(Sa.geometry=this.geometry,Sa.material=this.material,Sa.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ea.copy(this.boundingSphere),Ea.applyMatrix4(n),t.ray.intersectsSphere(Ea)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,ao),Xp.multiplyMatrices(n,ao),Sa.matrixWorld=Xp,Sa.raycast(t,Mc);for(let o=0,a=Mc.length;o<a;o++){let l=Mc[o];l.instanceId=r,l.object=this,e.push(l)}Mc.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Hi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Er(new Float32Array(i*this.count),i,this.count,gh,wi));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=i*t;return r[l]=a,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},yr=new Rs,Gv=new nt(.5,.5),bc=new E,_o=class{constructor(t=new Ln,e=new Ln,n=new Ln,i=new Ln,r=new Ln,o=new Ln){this.planes=[t,e,n,i,r,o]}set(t,e,n,i,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Oi,n=!1){let i=this.planes,r=t.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],m=r[8],v=r[9],p=r[10],g=r[11],x=r[12],_=r[13],y=r[14],b=r[15];if(i[0].setComponents(c-o,f-h,g-m,b-x).normalize(),i[1].setComponents(c+o,f+h,g+m,b+x).normalize(),i[2].setComponents(c+a,f+u,g+v,b+_).normalize(),i[3].setComponents(c-a,f-u,g-v,b-_).normalize(),n)i[4].setComponents(l,d,p,y).normalize(),i[5].setComponents(c-l,f-d,g-p,b-y).normalize();else if(i[4].setComponents(c-l,f-d,g-p,b-y).normalize(),e===Oi)i[5].setComponents(c+l,f+d,g+p,b+y).normalize();else if(e===po)i[5].setComponents(l,d,p,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),yr.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),yr.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(yr)}intersectsSprite(t){yr.center.set(0,0,0);let e=Gv.distanceTo(t.center);return yr.radius=.7071067811865476+e,yr.applyMatrix4(t.matrixWorld),this.intersectsSphere(yr)}intersectsSphere(t){let e=this.planes,n=t.center,i=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let i=e[n];if(bc.x=i.normal.x>0?t.max.x:t.min.x,bc.y=i.normal.y>0?t.max.y:t.min.y,bc.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(bc)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Gc=class extends rs{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new mt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Zp=new le,Td=new Oa,Sc=new Rs,Ec=new E,Mo=class extends xn{constructor(t=new ae,e=new Gc){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.matrixWorld,r=t.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Sc.copy(n.boundingSphere),Sc.applyMatrix4(i),Sc.radius+=r,t.ray.intersectsSphere(Sc)===!1)return;Zp.copy(i).invert(),Td.copy(t.ray).applyMatrix4(Zp);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,u=n.attributes.position;if(c!==null){let d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let m=d,v=f;m<v;m++){let p=c.getX(m);Ec.fromBufferAttribute(u,p),$p(Ec,p,l,i,t,e,this)}}else{let d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let m=d,v=f;m<v;m++)Ec.fromBufferAttribute(u,m),$p(Ec,m,l,i,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){let a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function $p(s,t,e,n,i,r,o){let a=Td.distanceSqToPoint(s);if(a<e){let l=new E;Td.closestPointToPoint(s,l),l.applyMatrix4(n);let c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Ha=class extends Xn{constructor(t=[],e=$s,n,i,r,o,a,l,c,h){super(t,e,n,i,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Xe=class extends Xn{constructor(t,e,n,i,r,o,a,l,c){super(t,e,n,i,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Ws=class extends Xn{constructor(t,e,n=Wi,i,r,o,a=en,l=en,c,h=ns,u=1){if(h!==ns&&h!==Ks)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:u};super(d,i,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new vo(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Wc=class extends Ws{constructor(t,e=Wi,n=$s,i,r,o=en,a=en,l,c=ns){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,n,i,r,o,a,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},ka=class extends Xn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},De=class s extends ae{constructor(t=1,e=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};let a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],d=0,f=0;m("z","y","x",-1,-1,n,e,t,o,r,0),m("z","y","x",1,-1,n,e,-t,o,r,1),m("x","z","y",1,1,t,n,e,i,o,2),m("x","z","y",1,-1,t,n,-e,i,o,3),m("x","y","z",1,-1,t,e,n,i,r,4),m("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new zt(c,3)),this.setAttribute("normal",new zt(h,3)),this.setAttribute("uv",new zt(u,2));function m(v,p,g,x,_,y,b,S,T,M,R){let C=y/T,I=b/M,L=y/2,k=b/2,N=S/2,O=T+1,V=M+1,q=0,rt=0,G=new E;for(let X=0;X<V;X++){let Q=X*I-k;for(let _t=0;_t<O;_t++){let St=_t*C-L;G[v]=St*x,G[p]=Q*_,G[g]=N,c.push(G.x,G.y,G.z),G[v]=0,G[p]=0,G[g]=S>0?1:-1,h.push(G.x,G.y,G.z),u.push(_t/T),u.push(1-X/M),q+=1}}for(let X=0;X<M;X++)for(let Q=0;Q<T;Q++){let _t=d+Q+O*X,St=d+Q+O*(X+1),Ht=d+(Q+1)+O*(X+1),Vt=d+(Q+1)+O*X;l.push(_t,St,Vt),l.push(St,Ht,Vt),rt+=6}a.addGroup(f,rt,R),f+=rt,d+=q}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var ki=class s extends ae{constructor(t=1,e=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:i},e=Math.max(3,e);let r=[],o=[],a=[],l=[],c=new E,h=new nt;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=e;u++,d+=3){let f=n+u/e*i;c.x=t*Math.cos(f),c.y=t*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[d]/t+1)/2,h.y=(o[d+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new zt(o,3)),this.setAttribute("normal",new zt(a,3)),this.setAttribute("uv",new zt(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Fe=class s extends ae{constructor(t=1,e=1,n=1,i=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;i=Math.floor(i),r=Math.floor(r);let h=[],u=[],d=[],f=[],m=0,v=[],p=n/2,g=0;x(),o===!1&&(t>0&&_(!0),e>0&&_(!1)),this.setIndex(h),this.setAttribute("position",new zt(u,3)),this.setAttribute("normal",new zt(d,3)),this.setAttribute("uv",new zt(f,2));function x(){let y=new E,b=new E,S=0,T=(e-t)/n;for(let M=0;M<=r;M++){let R=[],C=M/r,I=C*(e-t)+t;for(let L=0;L<=i;L++){let k=L/i,N=k*l+a,O=Math.sin(N),V=Math.cos(N);b.x=I*O,b.y=-C*n+p,b.z=I*V,u.push(b.x,b.y,b.z),y.set(O,T,V).normalize(),d.push(y.x,y.y,y.z),f.push(k,1-C),R.push(m++)}v.push(R)}for(let M=0;M<i;M++)for(let R=0;R<r;R++){let C=v[R][M],I=v[R+1][M],L=v[R+1][M+1],k=v[R][M+1];(t>0||R!==0)&&(h.push(C,I,k),S+=3),(e>0||R!==r-1)&&(h.push(I,L,k),S+=3)}c.addGroup(g,S,0),g+=S}function _(y){let b=m,S=new nt,T=new E,M=0,R=y===!0?t:e,C=y===!0?1:-1;for(let L=1;L<=i;L++)u.push(0,p*C,0),d.push(0,C,0),f.push(.5,.5),m++;let I=m;for(let L=0;L<=i;L++){let N=L/i*l+a,O=Math.cos(N),V=Math.sin(N);T.x=R*V,T.y=p*C,T.z=R*O,u.push(T.x,T.y,T.z),d.push(0,C,0),S.x=O*.5+.5,S.y=V*.5*C+.5,f.push(S.x,S.y),m++}for(let L=0;L<i;L++){let k=b+L,N=I+L;y===!0?h.push(N,N+1,k):h.push(N+1,N,k),M+=3}c.addGroup(g,M,y===!0?1:2),g+=M}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},zi=class s extends Fe{constructor(t=1,e=1,n=32,i=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,i,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new s(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},qc=class s extends ae{constructor(t=[],e=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:i};let r=[],o=[];a(i),c(n),h(),this.setAttribute("position",new zt(r,3)),this.setAttribute("normal",new zt(r.slice(),3)),this.setAttribute("uv",new zt(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(x){let _=new E,y=new E,b=new E;for(let S=0;S<e.length;S+=3)f(e[S+0],_),f(e[S+1],y),f(e[S+2],b),l(_,y,b,x)}function l(x,_,y,b){let S=b+1,T=[];for(let M=0;M<=S;M++){T[M]=[];let R=x.clone().lerp(y,M/S),C=_.clone().lerp(y,M/S),I=S-M;for(let L=0;L<=I;L++)L===0&&M===S?T[M][L]=R:T[M][L]=R.clone().lerp(C,L/I)}for(let M=0;M<S;M++)for(let R=0;R<2*(S-M)-1;R++){let C=Math.floor(R/2);R%2===0?(d(T[M][C+1]),d(T[M+1][C]),d(T[M][C])):(d(T[M][C+1]),d(T[M+1][C+1]),d(T[M+1][C]))}}function c(x){let _=new E;for(let y=0;y<r.length;y+=3)_.x=r[y+0],_.y=r[y+1],_.z=r[y+2],_.normalize().multiplyScalar(x),r[y+0]=_.x,r[y+1]=_.y,r[y+2]=_.z}function h(){let x=new E;for(let _=0;_<r.length;_+=3){x.x=r[_+0],x.y=r[_+1],x.z=r[_+2];let y=p(x)/2/Math.PI+.5,b=g(x)/Math.PI+.5;o.push(y,1-b)}m(),u()}function u(){for(let x=0;x<o.length;x+=6){let _=o[x+0],y=o[x+2],b=o[x+4],S=Math.max(_,y,b),T=Math.min(_,y,b);S>.9&&T<.1&&(_<.2&&(o[x+0]+=1),y<.2&&(o[x+2]+=1),b<.2&&(o[x+4]+=1))}}function d(x){r.push(x.x,x.y,x.z)}function f(x,_){let y=x*3;_.x=t[y+0],_.y=t[y+1],_.z=t[y+2]}function m(){let x=new E,_=new E,y=new E,b=new E,S=new nt,T=new nt,M=new nt;for(let R=0,C=0;R<r.length;R+=9,C+=6){x.set(r[R+0],r[R+1],r[R+2]),_.set(r[R+3],r[R+4],r[R+5]),y.set(r[R+6],r[R+7],r[R+8]),S.set(o[C+0],o[C+1]),T.set(o[C+2],o[C+3]),M.set(o[C+4],o[C+5]),b.copy(x).add(_).add(y).divideScalar(3);let I=p(b);v(S,C+0,x,I),v(T,C+2,_,I),v(M,C+4,y,I)}}function v(x,_,y,b){b<0&&x.x===1&&(o[_]=x.x-1),y.x===0&&y.z===0&&(o[_]=b/2/Math.PI+.5)}function p(x){return Math.atan2(x.z,-x.x)}function g(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.vertices,t.indices,t.radius,t.detail)}};var ui=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Qt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,i=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(i),e.push(r),i=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),i=0,r=n.length,o;e?o=e:o=t*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(i=Math.floor(a+(l-a)/2),c=n[i]-o,c<0)a=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===o)return i/(r-1);let h=n[i],d=n[i+1]-h,f=(o-h)/d;return(i+f)/(r-1)}getTangent(t,e){let i=t-1e-4,r=t+1e-4;i<0&&(i=0),r>1&&(r=1);let o=this.getPoint(i),a=this.getPoint(r),l=e||(o.isVector2?new nt:new E);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new E,i=[],r=[],o=[],a=new E,l=new le;for(let f=0;f<=t;f++){let m=f/t;i[f]=this.getTangentAt(m,new E)}r[0]=new E,o[0]=new E;let c=Number.MAX_VALUE,h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],a),o[0].crossVectors(i[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(i[f-1],i[f]),a.length()>Number.EPSILON){a.normalize();let m=Math.acos(xe(i[f-1].dot(i[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,m))}o[f].crossVectors(i[f],r[f])}if(e===!0){let f=Math.acos(xe(r[0].dot(r[t]),-1,1));f/=t,i[0].dot(a.crossVectors(r[0],r[t]))>0&&(f=-f);for(let m=1;m<=t;m++)r[m].applyMatrix4(l.makeRotationAxis(i[m],f*m)),o[m].crossVectors(i[m],r[m])}return{tangents:i,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},bo=class extends ui{constructor(t=0,e=0,n=1,i=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new nt){let n=e,i=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(o?r=0:r=i),this.aClockwise===!0&&!o&&(r===i?r=-i:r=r-i);let a=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Xc=class extends bo{constructor(t,e,n,i,r,o){super(t,e,n,n,i,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Kd(){let s=0,t=0,e=0,n=0;function i(r,o,a,l){s=r,t=a,e=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){i(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,f*=h,i(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return s+t*r+e*o+n*a}}}var Kp=new E,Jp=new E,vd=new Kd,xd=new Kd,yd=new Kd,So=class extends ui{constructor(t=[],e=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=i}getPoint(t,e=new E){let n=e,i=this.points,r=i.length,o=(r-(this.closed?0:1))*t,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=i[(a-1)%r]:(Jp.subVectors(i[0],i[1]).add(i[0]),c=Jp);let u=i[a%r],d=i[(a+1)%r];if(this.closed||a+2<r?h=i[(a+2)%r]:(Kp.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=Kp),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(u),f),v=Math.pow(u.distanceToSquared(d),f),p=Math.pow(d.distanceToSquared(h),f);v<1e-4&&(v=1),m<1e-4&&(m=v),p<1e-4&&(p=v),vd.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,m,v,p),xd.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,m,v,p),yd.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,m,v,p)}else this.curveType==="catmullrom"&&(vd.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),xd.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),yd.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(vd.calc(l),xd.calc(l),yd.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(i.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let i=this.points[e];t.points.push(i.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(new E().fromArray(i))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function jp(s,t,e,n,i){let r=(n-t)*.5,o=(i-e)*.5,a=s*s,l=s*a;return(2*e-2*n+r+o)*l+(-3*e+3*n-2*r-o)*a+r*s+e}function Wv(s,t){let e=1-s;return e*e*t}function qv(s,t){return 2*(1-s)*s*t}function Xv(s,t){return s*s*t}function Aa(s,t,e,n){return Wv(s,t)+qv(s,e)+Xv(s,n)}function Yv(s,t){let e=1-s;return e*e*e*t}function Zv(s,t){let e=1-s;return 3*e*e*s*t}function $v(s,t){return 3*(1-s)*s*s*t}function Kv(s,t){return s*s*s*t}function Ca(s,t,e,n,i){return Yv(s,t)+Zv(s,e)+$v(s,n)+Kv(s,i)}var za=class extends ui{constructor(t=new nt,e=new nt,n=new nt,i=new nt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new nt){let n=e,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Ca(t,i.x,r.x,o.x,a.x),Ca(t,i.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Yc=class extends ui{constructor(t=new E,e=new E,n=new E,i=new E){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new E){let n=e,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Ca(t,i.x,r.x,o.x,a.x),Ca(t,i.y,r.y,o.y,a.y),Ca(t,i.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Va=class extends ui{constructor(t=new nt,e=new nt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new nt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new nt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Eo=class extends ui{constructor(t=new E,e=new E){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new E){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new E){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Ga=class extends ui{constructor(t=new nt,e=new nt,n=new nt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new nt){let n=e,i=this.v0,r=this.v1,o=this.v2;return n.set(Aa(t,i.x,r.x,o.x),Aa(t,i.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Wa=class extends ui{constructor(t=new E,e=new E,n=new E){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new E){let n=e,i=this.v0,r=this.v1,o=this.v2;return n.set(Aa(t,i.x,r.x,o.x),Aa(t,i.y,r.y,o.y),Aa(t,i.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},qa=class extends ui{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new nt){let n=e,i=this.points,r=(i.length-1)*t,o=Math.floor(r),a=r-o,l=i[o===0?o:o-1],c=i[o],h=i[o>i.length-2?i.length-1:o+1],u=i[o>i.length-3?i.length-1:o+2];return n.set(jp(a,l.x,c.x,h.x,u.x),jp(a,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(i.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let i=this.points[e];t.points.push(i.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let i=t.points[e];this.points.push(new nt().fromArray(i))}return this}},Zc=Object.freeze({__proto__:null,ArcCurve:Xc,CatmullRomCurve3:So,CubicBezierCurve:za,CubicBezierCurve3:Yc,EllipseCurve:bo,LineCurve:Va,LineCurve3:Eo,QuadraticBezierCurve:Ga,QuadraticBezierCurve3:Wa,SplineCurve:qa}),wo=class extends ui{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Zc[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),i=this.getCurveLengths(),r=0;for(;r<i.length;){if(i[r]>=n){let o=i[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,i=this.curves.length;n<i;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let i=0,r=this.curves;i<r.length;i++){let o=r[i],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let i=t.curves[e];this.curves.push(i.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let i=this.curves[e];t.curves.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let i=t.curves[e];this.curves.push(new Zc[i.type]().fromJSON(i))}return this}},Xa=class extends wo{constructor(t){super(),this.type="Path",this.currentPoint=new nt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new Va(this.currentPoint.clone(),new nt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,i){let r=new Ga(this.currentPoint.clone(),new nt(t,e),new nt(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(t,e,n,i,r,o){let a=new za(this.currentPoint.clone(),new nt(t,e),new nt(n,i),new nt(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new qa(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,i,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,n,i,r,o),this}absarc(t,e,n,i,r,o){return this.absellipse(t,e,n,n,i,r,o),this}ellipse(t,e,n,i,r,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,i,r,o,a,l),this}absellipse(t,e,n,i,r,o,a,l){let c=new bo(t,e,n,i,r,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Vi=class extends Xa{constructor(t){super(t),this.uuid=es(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,i=this.holes.length;n<i;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let i=t.holes[e];this.holes.push(i.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let i=this.holes[e];t.holes.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let i=t.holes[e];this.holes.push(new Xa().fromJSON(i))}return this}};function Jv(s,t,e=2){let n=t&&t.length,i=n?t[0]*e:s.length,r=Y0(s,0,i,e,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=nx(s,t,r,e)),s.length>80*e){a=s[0],l=s[1];let h=a,u=l;for(let d=e;d<i;d+=e){let f=s[d],m=s[d+1];f<a&&(a=f),m<l&&(l=m),f>h&&(h=f),m>u&&(u=m)}c=Math.max(h-a,u-l),c=c!==0?32767/c:0}return Ya(r,o,e,a,l,c,0),o}function Y0(s,t,e,n,i){let r;if(i===fx(s,t,e,n)>0)for(let o=t;o<e;o+=n)r=Qp(o/n|0,s[o],s[o+1],r);else for(let o=e-n;o>=t;o-=n)r=Qp(o/n|0,s[o],s[o+1],r);return r&&To(r,r.next)&&($a(r),r=r.next),r}function wr(s,t){if(!s)return s;t||(t=s);let e=s,n;do if(n=!1,!e.steiner&&(To(e,e.next)||rn(e.prev,e,e.next)===0)){if($a(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Ya(s,t,e,n,i,r,o){if(!s)return;!o&&r&&ax(s,n,i,r);let a=s;for(;s.prev!==s.next;){let l=s.prev,c=s.next;if(r?Qv(s,n,i,r):jv(s)){t.push(l.i,s.i,c.i),$a(s),s=c.next,a=c.next;continue}if(s=c,s===a){o?o===1?(s=tx(wr(s),t),Ya(s,t,e,n,i,r,2)):o===2&&ex(s,t,e,n,i,r):Ya(wr(s),t,e,n,i,r,1);break}}}function jv(s){let t=s.prev,e=s,n=s.next;if(rn(t,e,n)>=0)return!1;let i=t.x,r=e.x,o=n.x,a=t.y,l=e.y,c=n.y,h=Math.min(i,r,o),u=Math.min(a,l,c),d=Math.max(i,r,o),f=Math.max(a,l,c),m=n.next;for(;m!==t;){if(m.x>=h&&m.x<=d&&m.y>=u&&m.y<=f&&wa(i,a,r,l,o,c,m.x,m.y)&&rn(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function Qv(s,t,e,n){let i=s.prev,r=s,o=s.next;if(rn(i,r,o)>=0)return!1;let a=i.x,l=r.x,c=o.x,h=i.y,u=r.y,d=o.y,f=Math.min(a,l,c),m=Math.min(h,u,d),v=Math.max(a,l,c),p=Math.max(h,u,d),g=Rd(f,m,t,e,n),x=Rd(v,p,t,e,n),_=s.prevZ,y=s.nextZ;for(;_&&_.z>=g&&y&&y.z<=x;){if(_.x>=f&&_.x<=v&&_.y>=m&&_.y<=p&&_!==i&&_!==o&&wa(a,h,l,u,c,d,_.x,_.y)&&rn(_.prev,_,_.next)>=0||(_=_.prevZ,y.x>=f&&y.x<=v&&y.y>=m&&y.y<=p&&y!==i&&y!==o&&wa(a,h,l,u,c,d,y.x,y.y)&&rn(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;_&&_.z>=g;){if(_.x>=f&&_.x<=v&&_.y>=m&&_.y<=p&&_!==i&&_!==o&&wa(a,h,l,u,c,d,_.x,_.y)&&rn(_.prev,_,_.next)>=0)return!1;_=_.prevZ}for(;y&&y.z<=x;){if(y.x>=f&&y.x<=v&&y.y>=m&&y.y<=p&&y!==i&&y!==o&&wa(a,h,l,u,c,d,y.x,y.y)&&rn(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function tx(s,t){let e=s;do{let n=e.prev,i=e.next.next;!To(n,i)&&$0(n,e,e.next,i)&&Za(n,i)&&Za(i,n)&&(t.push(n.i,e.i,i.i),$a(e),$a(e.next),e=s=i),e=e.next}while(e!==s);return wr(e)}function ex(s,t,e,n,i,r){let o=s;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&hx(o,a)){let l=K0(o,a);o=wr(o,o.next),l=wr(l,l.next),Ya(o,t,e,n,i,r,0),Ya(l,t,e,n,i,r,0);return}a=a.next}o=o.next}while(o!==s)}function nx(s,t,e,n){let i=[];for(let r=0,o=t.length;r<o;r++){let a=t[r]*n,l=r<o-1?t[r+1]*n:s.length,c=Y0(s,a,l,n,!1);c===c.next&&(c.steiner=!0),i.push(cx(c))}i.sort(ix);for(let r=0;r<i.length;r++)e=sx(i[r],e);return e}function ix(s,t){let e=s.x-t.x;if(e===0&&(e=s.y-t.y,e===0)){let n=(s.next.y-s.y)/(s.next.x-s.x),i=(t.next.y-t.y)/(t.next.x-t.x);e=n-i}return e}function sx(s,t){let e=rx(s,t);if(!e)return t;let n=K0(e,s);return wr(n,n.next),wr(e,e.next)}function rx(s,t){let e=t,n=s.x,i=s.y,r=-1/0,o;if(To(s,e))return e;do{if(To(s,e.next))return e.next;if(i<=e.y&&i>=e.next.y&&e.next.y!==e.y){let u=e.x+(i-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(u<=n&&u>r&&(r=u,o=e.x<e.next.x?e:e.next,u===n))return o}e=e.next}while(e!==t);if(!o)return null;let a=o,l=o.x,c=o.y,h=1/0;e=o;do{if(n>=e.x&&e.x>=l&&n!==e.x&&Z0(i<c?n:r,i,l,c,i<c?r:n,i,e.x,e.y)){let u=Math.abs(i-e.y)/(n-e.x);Za(e,s)&&(u<h||u===h&&(e.x>o.x||e.x===o.x&&ox(o,e)))&&(o=e,h=u)}e=e.next}while(e!==a);return o}function ox(s,t){return rn(s.prev,s,t.prev)<0&&rn(t.next,s,s.next)<0}function ax(s,t,e,n){let i=s;do i.z===0&&(i.z=Rd(i.x,i.y,t,e,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,lx(i)}function lx(s){let t,e=1;do{let n=s,i;s=null;let r=null;for(t=0;n;){t++;let o=n,a=0;for(let c=0;c<e&&(a++,o=o.nextZ,!!o);c++);let l=e;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(i=n,n=n.nextZ,a--):(i=o,o=o.nextZ,l--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;n=o}r.nextZ=null,e*=2}while(t>1);return s}function Rd(s,t,e,n,i){return s=(s-e)*i|0,t=(t-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,s|t<<1}function cx(s){let t=s,e=s;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==s);return e}function Z0(s,t,e,n,i,r,o,a){return(i-o)*(t-a)>=(s-o)*(r-a)&&(s-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(i-o)*(n-a)}function wa(s,t,e,n,i,r,o,a){return!(s===o&&t===a)&&Z0(s,t,e,n,i,r,o,a)}function hx(s,t){return s.next.i!==t.i&&s.prev.i!==t.i&&!ux(s,t)&&(Za(s,t)&&Za(t,s)&&dx(s,t)&&(rn(s.prev,s,t.prev)||rn(s,t.prev,t))||To(s,t)&&rn(s.prev,s,s.next)>0&&rn(t.prev,t,t.next)>0)}function rn(s,t,e){return(t.y-s.y)*(e.x-t.x)-(t.x-s.x)*(e.y-t.y)}function To(s,t){return s.x===t.x&&s.y===t.y}function $0(s,t,e,n){let i=Tc(rn(s,t,e)),r=Tc(rn(s,t,n)),o=Tc(rn(e,n,s)),a=Tc(rn(e,n,t));return!!(i!==r&&o!==a||i===0&&wc(s,e,t)||r===0&&wc(s,n,t)||o===0&&wc(e,s,n)||a===0&&wc(e,t,n))}function wc(s,t,e){return t.x<=Math.max(s.x,e.x)&&t.x>=Math.min(s.x,e.x)&&t.y<=Math.max(s.y,e.y)&&t.y>=Math.min(s.y,e.y)}function Tc(s){return s>0?1:s<0?-1:0}function ux(s,t){let e=s;do{if(e.i!==s.i&&e.next.i!==s.i&&e.i!==t.i&&e.next.i!==t.i&&$0(e,e.next,s,t))return!0;e=e.next}while(e!==s);return!1}function Za(s,t){return rn(s.prev,s,s.next)<0?rn(s,t,s.next)>=0&&rn(s,s.prev,t)>=0:rn(s,t,s.prev)<0||rn(s,s.next,t)<0}function dx(s,t){let e=s,n=!1,i=(s.x+t.x)/2,r=(s.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&i<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==s);return n}function K0(s,t){let e=Ad(s.i,s.x,s.y),n=Ad(t.i,t.x,t.y),i=s.next,r=t.prev;return s.next=t,t.prev=s,e.next=i,i.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Qp(s,t,e,n){let i=Ad(s,t,e);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function $a(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Ad(s,t,e){return{i:s,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function fx(s,t,e,n){let i=0;for(let r=t,o=e-n;r<e;r+=n)i+=(s[o]-s[r])*(s[r+1]+s[o+1]),o=r;return i}var Cd=class{static triangulate(t,e,n=2){return Jv(t,e,n)}},ts=class s{static area(t){let e=t.length,n=0;for(let i=e-1,r=0;r<e;i=r++)n+=t[i].x*t[r].y-t[r].x*t[i].y;return n*.5}static isClockWise(t){return s.area(t)<0}static triangulateShape(t,e){let n=[],i=[],r=[];t0(t),e0(n,t);let o=t.length;e.forEach(t0);for(let l=0;l<e.length;l++)i.push(o),o+=e[l].length,e0(n,e[l]);let a=Cd.triangulate(n,i);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function t0(s){let t=s.length;t>2&&s[t-1].equals(s[0])&&s.pop()}function e0(s,t){for(let e=0;e<t.length;e++)s.push(t[e].x),s.push(t[e].y)}var Tr=class s extends ae{constructor(t=new Vi([new nt(.5,.5),new nt(-.5,.5),new nt(-.5,-.5),new nt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,i=[],r=[];for(let a=0,l=t.length;a<l;a++){let c=t[a];o(c)}this.setAttribute("position",new zt(i,3)),this.setAttribute("uv",new zt(r,2)),this.computeVertexNormals();function o(a){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,m=e.bevelSize!==void 0?e.bevelSize:f-.1,v=e.bevelOffset!==void 0?e.bevelOffset:0,p=e.bevelSegments!==void 0?e.bevelSegments:3,g=e.extrudePath,x=e.UVGenerator!==void 0?e.UVGenerator:px,_,y=!1,b,S,T,M;if(g){_=g.getSpacedPoints(h),y=!0,d=!1;let ct=g.isCatmullRomCurve3?g.closed:!1;b=g.computeFrenetFrames(h,ct),S=new E,T=new E,M=new E}d||(p=0,f=0,m=0,v=0);let R=a.extractPoints(c),C=R.shape,I=R.holes;if(!ts.isClockWise(C)){C=C.reverse();for(let ct=0,yt=I.length;ct<yt;ct++){let bt=I[ct];ts.isClockWise(bt)&&(I[ct]=bt.reverse())}}function k(ct){let bt=10000000000000001e-36,Mt=ct[0];for(let Rt=1;Rt<=ct.length;Rt++){let Jt=Rt%ct.length,$t=ct[Jt],jt=$t.x-Mt.x,ie=$t.y-Mt.y,B=jt*jt+ie*ie,Ce=Math.max(Math.abs($t.x),Math.abs($t.y),Math.abs(Mt.x),Math.abs(Mt.y)),_e=bt*Ce*Ce;if(B<=_e){ct.splice(Jt,1),Rt--;continue}Mt=$t}}k(C),I.forEach(k);let N=I.length,O=C;for(let ct=0;ct<N;ct++){let yt=I[ct];C=C.concat(yt)}function V(ct,yt,bt){return yt||ne("ExtrudeGeometry: vec does not exist"),ct.clone().addScaledVector(yt,bt)}let q=C.length;function rt(ct,yt,bt){let Mt,Rt,Jt,$t=ct.x-yt.x,jt=ct.y-yt.y,ie=bt.x-ct.x,B=bt.y-ct.y,Ce=$t*$t+jt*jt,_e=$t*B-jt*ie;if(Math.abs(_e)>Number.EPSILON){let P=Math.sqrt(Ce),w=Math.sqrt(ie*ie+B*B),z=yt.x-jt/P,K=yt.y+$t/P,it=bt.x-B/w,Et=bt.y+ie/w,At=((it-z)*B-(Et-K)*ie)/($t*B-jt*ie);Mt=z+$t*At-ct.x,Rt=K+jt*At-ct.y;let ot=Mt*Mt+Rt*Rt;if(ot<=2)return new nt(Mt,Rt);Jt=Math.sqrt(ot/2)}else{let P=!1;$t>Number.EPSILON?ie>Number.EPSILON&&(P=!0):$t<-Number.EPSILON?ie<-Number.EPSILON&&(P=!0):Math.sign(jt)===Math.sign(B)&&(P=!0),P?(Mt=-jt,Rt=$t,Jt=Math.sqrt(Ce)):(Mt=$t,Rt=jt,Jt=Math.sqrt(Ce/2))}return new nt(Mt/Jt,Rt/Jt)}let G=[];for(let ct=0,yt=O.length,bt=yt-1,Mt=ct+1;ct<yt;ct++,bt++,Mt++)bt===yt&&(bt=0),Mt===yt&&(Mt=0),G[ct]=rt(O[ct],O[bt],O[Mt]);let X=[],Q,_t=G.concat();for(let ct=0,yt=N;ct<yt;ct++){let bt=I[ct];Q=[];for(let Mt=0,Rt=bt.length,Jt=Rt-1,$t=Mt+1;Mt<Rt;Mt++,Jt++,$t++)Jt===Rt&&(Jt=0),$t===Rt&&($t=0),Q[Mt]=rt(bt[Mt],bt[Jt],bt[$t]);X.push(Q),_t=_t.concat(Q)}let St;if(p===0)St=ts.triangulateShape(O,I);else{let ct=[],yt=[];for(let bt=0;bt<p;bt++){let Mt=bt/p,Rt=f*Math.cos(Mt*Math.PI/2),Jt=m*Math.sin(Mt*Math.PI/2)+v;for(let $t=0,jt=O.length;$t<jt;$t++){let ie=V(O[$t],G[$t],Jt);wt(ie.x,ie.y,-Rt),Mt===0&&ct.push(ie)}for(let $t=0,jt=N;$t<jt;$t++){let ie=I[$t];Q=X[$t];let B=[];for(let Ce=0,_e=ie.length;Ce<_e;Ce++){let P=V(ie[Ce],Q[Ce],Jt);wt(P.x,P.y,-Rt),Mt===0&&B.push(P)}Mt===0&&yt.push(B)}}St=ts.triangulateShape(ct,yt)}let Ht=St.length,Vt=m+v;for(let ct=0;ct<q;ct++){let yt=d?V(C[ct],_t[ct],Vt):C[ct];y?(T.copy(b.normals[0]).multiplyScalar(yt.x),S.copy(b.binormals[0]).multiplyScalar(yt.y),M.copy(_[0]).add(T).add(S),wt(M.x,M.y,M.z)):wt(yt.x,yt.y,0)}for(let ct=1;ct<=h;ct++)for(let yt=0;yt<q;yt++){let bt=d?V(C[yt],_t[yt],Vt):C[yt];y?(T.copy(b.normals[ct]).multiplyScalar(bt.x),S.copy(b.binormals[ct]).multiplyScalar(bt.y),M.copy(_[ct]).add(T).add(S),wt(M.x,M.y,M.z)):wt(bt.x,bt.y,u/h*ct)}for(let ct=p-1;ct>=0;ct--){let yt=ct/p,bt=f*Math.cos(yt*Math.PI/2),Mt=m*Math.sin(yt*Math.PI/2)+v;for(let Rt=0,Jt=O.length;Rt<Jt;Rt++){let $t=V(O[Rt],G[Rt],Mt);wt($t.x,$t.y,u+bt)}for(let Rt=0,Jt=I.length;Rt<Jt;Rt++){let $t=I[Rt];Q=X[Rt];for(let jt=0,ie=$t.length;jt<ie;jt++){let B=V($t[jt],Q[jt],Mt);y?wt(B.x,B.y+_[h-1].y,_[h-1].x+bt):wt(B.x,B.y,u+bt)}}}ee(),J();function ee(){let ct=i.length/3;if(d){let yt=0,bt=q*yt;for(let Mt=0;Mt<Ht;Mt++){let Rt=St[Mt];Xt(Rt[2]+bt,Rt[1]+bt,Rt[0]+bt)}yt=h+p*2,bt=q*yt;for(let Mt=0;Mt<Ht;Mt++){let Rt=St[Mt];Xt(Rt[0]+bt,Rt[1]+bt,Rt[2]+bt)}}else{for(let yt=0;yt<Ht;yt++){let bt=St[yt];Xt(bt[2],bt[1],bt[0])}for(let yt=0;yt<Ht;yt++){let bt=St[yt];Xt(bt[0]+q*h,bt[1]+q*h,bt[2]+q*h)}}n.addGroup(ct,i.length/3-ct,0)}function J(){let ct=i.length/3,yt=0;lt(O,yt),yt+=O.length;for(let bt=0,Mt=I.length;bt<Mt;bt++){let Rt=I[bt];lt(Rt,yt),yt+=Rt.length}n.addGroup(ct,i.length/3-ct,1)}function lt(ct,yt){let bt=ct.length;for(;--bt>=0;){let Mt=bt,Rt=bt-1;Rt<0&&(Rt=ct.length-1);for(let Jt=0,$t=h+p*2;Jt<$t;Jt++){let jt=q*Jt,ie=q*(Jt+1),B=yt+Mt+jt,Ce=yt+Rt+jt,_e=yt+Rt+ie,P=yt+Mt+ie;Ct(B,Ce,_e,P)}}}function wt(ct,yt,bt){l.push(ct),l.push(yt),l.push(bt)}function Xt(ct,yt,bt){Kt(ct),Kt(yt),Kt(bt);let Mt=i.length/3,Rt=x.generateTopUV(n,i,Mt-3,Mt-2,Mt-1);me(Rt[0]),me(Rt[1]),me(Rt[2])}function Ct(ct,yt,bt,Mt){Kt(ct),Kt(yt),Kt(Mt),Kt(yt),Kt(bt),Kt(Mt);let Rt=i.length/3,Jt=x.generateSideWallUV(n,i,Rt-6,Rt-3,Rt-2,Rt-1);me(Jt[0]),me(Jt[1]),me(Jt[3]),me(Jt[1]),me(Jt[2]),me(Jt[3])}function Kt(ct){i.push(l[ct*3+0]),i.push(l[ct*3+1]),i.push(l[ct*3+2])}function me(ct){r.push(ct.x),r.push(ct.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return mx(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,o=t.shapes.length;r<o;r++){let a=e[t.shapes[r]];n.push(a)}let i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new Zc[i.type]().fromJSON(i)),new s(n,t.options)}},px={generateTopUV:function(s,t,e,n,i){let r=t[e*3],o=t[e*3+1],a=t[n*3],l=t[n*3+1],c=t[i*3],h=t[i*3+1];return[new nt(r,o),new nt(a,l),new nt(c,h)]},generateSideWallUV:function(s,t,e,n,i,r){let o=t[e*3],a=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],u=t[n*3+2],d=t[i*3],f=t[i*3+1],m=t[i*3+2],v=t[r*3],p=t[r*3+1],g=t[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new nt(o,1-l),new nt(c,1-u),new nt(d,1-m),new nt(v,1-g)]:[new nt(a,1-l),new nt(h,1-u),new nt(f,1-m),new nt(p,1-g)]}};function mx(s,t,e){if(e.shapes=[],Array.isArray(s))for(let n=0,i=s.length;n<i;n++){let r=s[n];e.shapes.push(r.uuid)}else e.shapes.push(s.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Ka=class s extends qc{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new s(t.radius,t.detail)}},qs=class s extends ae{constructor(t=[new nt(0,-.5),new nt(.5,0),new nt(0,.5)],e=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:i},e=Math.floor(e),i=xe(i,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],h=1/e,u=new E,d=new nt,f=new E,m=new E,v=new E,p=0,g=0;for(let x=0;x<=t.length-1;x++)switch(x){case 0:p=t[x+1].x-t[x].x,g=t[x+1].y-t[x].y,f.x=g*1,f.y=-p,f.z=g*0,v.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case t.length-1:l.push(v.x,v.y,v.z);break;default:p=t[x+1].x-t[x].x,g=t[x+1].y-t[x].y,f.x=g*1,f.y=-p,f.z=g*0,m.copy(f),f.x+=v.x,f.y+=v.y,f.z+=v.z,f.normalize(),l.push(f.x,f.y,f.z),v.copy(m)}for(let x=0;x<=e;x++){let _=n+x*h*i,y=Math.sin(_),b=Math.cos(_);for(let S=0;S<=t.length-1;S++){u.x=t[S].x*y,u.y=t[S].y,u.z=t[S].x*b,o.push(u.x,u.y,u.z),d.x=x/e,d.y=S/(t.length-1),a.push(d.x,d.y);let T=l[3*S+0]*y,M=l[3*S+1],R=l[3*S+0]*b;c.push(T,M,R)}}for(let x=0;x<e;x++)for(let _=0;_<t.length-1;_++){let y=_+x*t.length,b=y,S=y+t.length,T=y+t.length+1,M=y+1;r.push(b,S,M),r.push(T,M,S)}this.setIndex(r),this.setAttribute("position",new zt(o,3)),this.setAttribute("uv",new zt(a,2)),this.setAttribute("normal",new zt(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.points,t.segments,t.phiStart,t.phiLength)}};var Be=class s extends ae{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};let r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(i),c=a+1,h=l+1,u=t/a,d=e/l,f=[],m=[],v=[],p=[];for(let g=0;g<h;g++){let x=g*d-o;for(let _=0;_<c;_++){let y=_*u-r;m.push(y,-x,0),v.push(0,0,1),p.push(_/a),p.push(1-g/l)}}for(let g=0;g<l;g++)for(let x=0;x<a;x++){let _=x+c*g,y=x+c*(g+1),b=x+1+c*(g+1),S=x+1+c*g;f.push(_,y,S),f.push(y,b,S)}this.setIndex(f),this.setAttribute("position",new zt(m,3)),this.setAttribute("normal",new zt(v,3)),this.setAttribute("uv",new zt(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.widthSegments,t.heightSegments)}},Rr=class s extends ae{constructor(t=.5,e=1,n=32,i=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:o},n=Math.max(3,n),i=Math.max(1,i);let a=[],l=[],c=[],h=[],u=t,d=(e-t)/i,f=new E,m=new nt;for(let v=0;v<=i;v++){for(let p=0;p<=n;p++){let g=r+p/n*o;f.x=u*Math.cos(g),f.y=u*Math.sin(g),l.push(f.x,f.y,f.z),c.push(0,0,1),m.x=(f.x/e+1)/2,m.y=(f.y/e+1)/2,h.push(m.x,m.y)}u+=d}for(let v=0;v<i;v++){let p=v*(n+1);for(let g=0;g<n;g++){let x=g+p,_=x,y=x+n+1,b=x+n+2,S=x+1;a.push(_,y,S),a.push(y,b,S)}}this.setIndex(a),this.setAttribute("position",new zt(l,3)),this.setAttribute("normal",new zt(c,3)),this.setAttribute("uv",new zt(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Ja=class s extends ae{constructor(t=new Vi([new nt(0,.5),new nt(-.5,-.5),new nt(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};let n=[],i=[],r=[],o=[],a=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let h=0;h<t.length;h++)c(t[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(n),this.setAttribute("position",new zt(i,3)),this.setAttribute("normal",new zt(r,3)),this.setAttribute("uv",new zt(o,2));function c(h){let u=i.length/3,d=h.extractPoints(e),f=d.shape,m=d.holes;ts.isClockWise(f)===!1&&(f=f.reverse());for(let p=0,g=m.length;p<g;p++){let x=m[p];ts.isClockWise(x)===!0&&(m[p]=x.reverse())}let v=ts.triangulateShape(f,m);for(let p=0,g=m.length;p<g;p++){let x=m[p];f=f.concat(x)}for(let p=0,g=f.length;p<g;p++){let x=f[p];i.push(x.x,x.y,0),r.push(0,0,1),o.push(x.x,x.y)}for(let p=0,g=v.length;p<g;p++){let x=v[p],_=x[0]+u,y=x[1]+u,b=x[2]+u;n.push(_,y,b),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes;return gx(e,t)}static fromJSON(t,e){let n=[];for(let i=0,r=t.shapes.length;i<r;i++){let o=e[t.shapes[i]];n.push(o)}return new s(n,t.curveSegments)}};function gx(s,t){if(t.shapes=[],Array.isArray(s))for(let e=0,n=s.length;e<n;e++){let i=s[e];t.shapes.push(i.uuid)}else t.shapes.push(s.uuid);return t}var yn=class s extends ae{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new E,d=new E,f=[],m=[],v=[],p=[];for(let g=0;g<=n;g++){let x=[],_=g/n,y=o+_*a,b=t*Math.cos(y),S=Math.sqrt(t*t-b*b),T=0;g===0&&o===0?T=.5/e:g===n&&l===Math.PI&&(T=-.5/e);for(let M=0;M<=e;M++){let R=M/e,C=i+R*r;u.x=-S*Math.cos(C),u.y=b,u.z=S*Math.sin(C),m.push(u.x,u.y,u.z),d.copy(u).normalize(),v.push(d.x,d.y,d.z),p.push(R+T,1-_),x.push(c++)}h.push(x)}for(let g=0;g<n;g++)for(let x=0;x<e;x++){let _=h[g][x+1],y=h[g][x],b=h[g+1][x],S=h[g+1][x+1];(g!==0||o>0)&&f.push(_,y,S),(g!==n-1||l<Math.PI)&&f.push(y,b,S)}this.setIndex(f),this.setAttribute("position",new zt(m,3)),this.setAttribute("normal",new zt(v,3)),this.setAttribute("uv",new zt(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var Yn=class s extends ae{constructor(t=1,e=.4,n=12,i=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:i,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),i=Math.floor(i);let l=[],c=[],h=[],u=[],d=new E,f=new E,m=new E;for(let v=0;v<=n;v++){let p=o+v/n*a;for(let g=0;g<=i;g++){let x=g/i*r;f.x=(t+e*Math.cos(p))*Math.cos(x),f.y=(t+e*Math.cos(p))*Math.sin(x),f.z=e*Math.sin(p),c.push(f.x,f.y,f.z),d.x=t*Math.cos(x),d.y=t*Math.sin(x),m.subVectors(f,d).normalize(),h.push(m.x,m.y,m.z),u.push(g/i),u.push(v/n)}}for(let v=1;v<=n;v++)for(let p=1;p<=i;p++){let g=(i+1)*v+p-1,x=(i+1)*(v-1)+p-1,_=(i+1)*(v-1)+p,y=(i+1)*v+p;l.push(g,x,y),l.push(x,_,y)}this.setIndex(l),this.setAttribute("position",new zt(c,3)),this.setAttribute("normal",new zt(h,3)),this.setAttribute("uv",new zt(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};var ja=class s extends ae{constructor(t=new Wa(new E(-1,-1,0),new E(-1,1,0),new E(1,1,0)),e=64,n=1,i=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:n,radialSegments:i,closed:r};let o=t.computeFrenetFrames(e,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new E,l=new E,c=new nt,h=new E,u=[],d=[],f=[],m=[];v(),this.setIndex(m),this.setAttribute("position",new zt(u,3)),this.setAttribute("normal",new zt(d,3)),this.setAttribute("uv",new zt(f,2));function v(){for(let _=0;_<e;_++)p(_);p(r===!1?e:0),x(),g()}function p(_){h=t.getPointAt(_/e,h);let y=o.normals[_],b=o.binormals[_];for(let S=0;S<=i;S++){let T=S/i*Math.PI*2,M=Math.sin(T),R=-Math.cos(T);l.x=R*y.x+M*b.x,l.y=R*y.y+M*b.y,l.z=R*y.z+M*b.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=h.x+n*l.x,a.y=h.y+n*l.y,a.z=h.z+n*l.z,u.push(a.x,a.y,a.z)}}function g(){for(let _=1;_<=e;_++)for(let y=1;y<=i;y++){let b=(i+1)*(_-1)+(y-1),S=(i+1)*_+(y-1),T=(i+1)*_+y,M=(i+1)*(_-1)+y;m.push(b,S,M),m.push(S,T,M)}}function x(){for(let _=0;_<=e;_++)for(let y=0;y<=i;y++)c.x=_/e,c.y=y/i,f.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new s(new Zc[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};function Dr(s){let t={};for(let e in s){t[e]={};for(let n in s[e]){let i=s[e][n];if(n0(i))i.isRenderTargetTexture?(Qt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone();else if(Array.isArray(i))if(n0(i[0])){let r=[];for(let o=0,a=i.length;o<a;o++)r[o]=i[o].clone();t[e][n]=r}else t[e][n]=i.slice();else t[e][n]=i}}return t}function Hn(s){let t={};for(let e=0;e<s.length;e++){let n=Dr(s[e]);for(let i in n)t[i]=n[i]}return t}function n0(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function vx(s){let t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Jd(s){let t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Me.workingColorSpace}var qi={clone:Dr,merge:Hn},xx=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,yx=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,te=class extends rs{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=xx,this.fragmentShader=yx,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Dr(t.uniforms),this.uniformsGroups=vx(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let i in this.uniforms){let o=this.uniforms[i].value;o&&o.isTexture?e.uniforms[i]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[i]={type:"m4",value:o.toArray()}:e.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let i=t.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=e[i.value]||null;break;case"c":this.uniforms[n].value=new mt().setHex(i.value);break;case"v2":this.uniforms[n].value=new nt().fromArray(i.value);break;case"v3":this.uniforms[n].value=new E().fromArray(i.value);break;case"v4":this.uniforms[n].value=new Ve().fromArray(i.value);break;case"m3":this.uniforms[n].value=new oe().fromArray(i.value);break;case"m4":this.uniforms[n].value=new le().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Ro=class extends te{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Ft=class extends rs{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new mt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new mt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Kh,this.normalScale=new nt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ci,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Ar=class extends Ft{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new nt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return xe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new mt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new mt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new mt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var $c=class extends rs{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=L0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Kc=class extends rs{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function lo(s,t){return!s||s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function _d(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}var Xs=class{constructor(t,e,n,i){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,i=e[n],r=e[n-1];t:{e:{let o;n:{i:if(!(t<i)){for(let a=n+2;;){if(i===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=e[++n],t<i)break e}o=e.length;break n}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=e[--n-1],t>=r)break e}o=n,n=0;break n}break t}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(i=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,t,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=t*i;for(let o=0;o!==i;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Jc=class extends Xs{constructor(t,e,n,i){super(t,e,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Sd,endingEnd:Sd}}intervalChanged_(t,e,n){let i=this.parameterPositions,r=t-2,o=t+1,a=i[r],l=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case Ed:r=t,a=2*e-n;break;case wd:r=i.length-2,a=e+i[r]-i[r+1];break;default:r=t,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ed:o=t,l=2*n-e;break;case wd:o=1,l=n+i[1]-i[0];break;default:o=t-1,l=e}let c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,m=(n-e)/(i-e),v=m*m,p=v*m,g=-d*p+2*d*v-d*m,x=(1+d)*p+(-1.5-2*d)*v+(-.5+d)*m+1,_=(-1-f)*p+(1.5+f)*v+.5*m,y=f*p-f*v;for(let b=0;b!==a;++b)r[b]=g*o[h+b]+x*o[c+b]+_*o[l+b]+y*o[u+b];return r}},jc=class extends Xs{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(n-e)/(i-e),u=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*u+o[l+d]*h;return r}},Qc=class extends Xs{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t){return this.copySampleValue_(t-1)}},th=class extends Xs{interpolate_(t,e,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this.inTangents,u=this.outTangents;if(!h||!u){let m=(n-e)/(i-e),v=1-m;for(let p=0;p!==a;++p)r[p]=o[c+p]*v+o[l+p]*m;return r}let d=a*2,f=t-1;for(let m=0;m!==a;++m){let v=o[c+m],p=o[l+m],g=f*d+m*2,x=u[g],_=u[g+1],y=t*d+m*2,b=h[y],S=h[y+1],T=Mx(n,e,x,b,i);r[m]=J0(T,v,_,S,p)}return r}};function J0(s,t,e,n,i){let r=1-s;return r*r*r*t+3*r*r*s*e+3*r*s*s*n+s*s*s*i}function _x(s,t,e,n,i){let r=1-s;return 3*r*r*(e-t)+6*r*s*(n-e)+3*s*s*(i-n)}function Mx(s,t,e,n,i){let r=(s-t)/(i-t);for(let o=0;o<8;o++){let a=J0(r,t,e,n,i)-s;if(Math.abs(a)<1e-10)break;let l=_x(r,t,e,n,i);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var di=class{constructor(t,e,n,i){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=lo(e,this.TimeBufferType),this.values=lo(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:lo(t.times,Array),values:lo(t.values,Array)};let i=t.getInterpolation();i!==t.DefaultInterpolation&&(n.interpolation=i),_d(t.settings)&&(n.settings={inTangents:lo(t.settings.inTangents,Array),outTangents:lo(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Qc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new jc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Jc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new th(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Pa:e=this.InterpolantFactoryMethodDiscrete;break;case Hc:e=this.InterpolantFactoryMethodLinear;break;case Cc:e=this.InterpolantFactoryMethodSmooth;break;case bd:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Qt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Pa;case this.InterpolantFactoryMethodLinear:return Hc;case this.InterpolantFactoryMethodSmooth:return Cc;case this.InterpolantFactoryMethodBezier:return bd}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]*=t;_d(this.settings)&&(i0(this.settings.inTangents,t),i0(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,i=n.length,r=0,o=i-1;for(;r!==i&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(ne("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,i=this.values,r=n.length;r===0&&(ne("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){ne("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){ne("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(i!==void 0&&lv(i))for(let a=0,l=i.length;a!==l;++a){let c=i[a];if(isNaN(c)){ne("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Cc,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(i)l=!0;else{let u=a*n,d=u-n,f=u+n;for(let m=0;m!==n;++m){let v=e[u+m];if(v!==e[d+m]||v!==e[f+m]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let u=a*n,d=o*n;for(let f=0;f!==n;++f)e[d+f]=e[u+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,i=new n(this.name,t,e);return i.createInterpolant=this.createInterpolant,_d(this.settings)&&(i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),i}};function i0(s,t){for(let e=0,n=s.length;e!==n;e+=2)s[e]*=t}di.prototype.ValueTypeName="";di.prototype.TimeBufferType=Float32Array;di.prototype.ValueBufferType=Float32Array;di.prototype.DefaultInterpolation=Hc;var Ys=class extends di{constructor(t,e,n){super(t,e,n)}};Ys.prototype.ValueTypeName="bool";Ys.prototype.ValueBufferType=Array;Ys.prototype.DefaultInterpolation=Pa;Ys.prototype.InterpolantFactoryMethodLinear=void 0;Ys.prototype.InterpolantFactoryMethodSmooth=void 0;var eh=class extends di{constructor(t,e,n,i){super(t,e,n,i)}};eh.prototype.ValueTypeName="color";var nh=class extends di{constructor(t,e,n,i){super(t,e,n,i)}};nh.prototype.ValueTypeName="number";var ih=class extends Xs{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-e)/(i-e),c=t*a;for(let h=c+a;c!==h;c+=4)re.slerpFlat(r,0,o,c-a,o,c,l);return r}},Qa=class extends di{constructor(t,e,n,i){super(t,e,n,i)}InterpolantFactoryMethodLinear(t){return new ih(this.times,this.values,this.getValueSize(),t)}};Qa.prototype.ValueTypeName="quaternion";Qa.prototype.InterpolantFactoryMethodSmooth=void 0;var Zs=class extends di{constructor(t,e,n){super(t,e,n)}};Zs.prototype.ValueTypeName="string";Zs.prototype.ValueBufferType=Array;Zs.prototype.DefaultInterpolation=Pa;Zs.prototype.InterpolantFactoryMethodLinear=void 0;Zs.prototype.InterpolantFactoryMethodSmooth=void 0;var sh=class extends di{constructor(t,e,n,i){super(t,e,n,i)}};sh.prototype.ValueTypeName="vector";var rh=class{constructor(t,e,n){let i=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(h){a++,r===!1&&i.onStart!==void 0&&i.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,i.onProgress!==void 0&&i.onProgress(h,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],m=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},j0=new rh,oh=class{constructor(t){this.manager=t!==void 0?t:j0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(i,r){n.load(t,i,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};oh.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ao=class extends xn{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new mt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},tl=class extends Ao{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(xn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new mt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Md=new le,s0=new E,r0=new E,el=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new nt(512,512),this.mapType=On,this.map=null,this.mapPass=null,this.matrix=new le,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new _o,this._frameExtents=new nt(1,1),this._viewportCount=1,this._viewports=[new Ve(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;s0.setFromMatrixPosition(t.matrixWorld),e.position.copy(s0),r0.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(r0),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,i){Md.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(Md,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,o=i?i.z/r.x:1,a=i?i.w/r.y:1,l=i?i.x/r.x:0,c=i?i.y/r.y:0;t.coordinateSystem===po||t.reversedDepth?e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),e.multiply(Md)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Rc=new E,Ac=new re,ji=new E,nl=class extends xn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new le,this.projectionMatrix=new le,this.projectionMatrixInverse=new le,this.coordinateSystem=Oi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Rc,Ac,ji),ji.x===1&&ji.y===1&&ji.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Rc,Ac,ji.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Rc,Ac,ji),ji.x===1&&ji.y===1&&ji.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Rc,Ac,ji.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Gs=new E,o0=new nt,a0=new nt,Qe=class extends nl{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=go*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Ta*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return go*2*Math.atan(Math.tan(Ta*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Gs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Gs.x,Gs.y).multiplyScalar(-t/Gs.z),Gs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Gs.x,Gs.y).multiplyScalar(-t/Gs.z)}getViewSize(t,e){return this.getViewBounds(t,o0,a0),e.subVectors(a0,o0)}setViewOffset(t,e,n,i,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Ta*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,r=-.5*i,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*i/l,e-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Pd=class extends el{constructor(){super(new Qe(90,1,.5,500)),this.isPointLightShadow=!0}},il=class extends Ao{constructor(t,e,n=0,i=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Pd}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},as=class extends nl{constructor(t=-1,e=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,r=n-t,o=n+t,a=i+e,l=i-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Id=class extends el{constructor(){super(new as(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Co=class extends Ao{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(xn.DEFAULT_UP),this.updateMatrix(),this.target=new xn,this.shadow=new Id}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var sl=class extends ae{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}};var co=-90,ho=1,ah=class extends xn{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new Qe(co,ho,t,e);i.layers=this.layers,this.add(i);let r=new Qe(co,ho,t,e);r.layers=this.layers,this.add(r);let o=new Qe(co,ho,t,e);o.layers=this.layers,this.add(o);let a=new Qe(co,ho,t,e);a.layers=this.layers,this.add(a);let l=new Qe(co,ho,t,e);l.layers=this.layers,this.add(l);let c=new Qe(co,ho,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,i,r,o,a,l]=e;for(let c of e)this.remove(c);if(t===Oi)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===po)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;let v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let p=!1;t.isWebGLRenderer===!0?p=t.state.buffers.depth.getReversed():p=t.reversedDepthBuffer,t.setRenderTarget(n,0,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,2,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,3,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,i),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=m,n.texture.needsPMREMUpdate=!0}},lh=class extends Qe{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}},rl=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(t){this._document=t,t.hidden!==void 0&&(this._pageVisibilityHandler=bx.bind(this),t.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(t){return this._timescale=t,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(t){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(t!==void 0?t:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function bx(){this._document.hidden===!1&&this.reset()}var jd="\\[\\]\\.:\\/",Sx=new RegExp("["+jd+"]","g"),Qd="[^"+jd+"]",Ex="[^"+jd.replace("\\.","")+"]",wx=/((?:WC+[\/:])*)/.source.replace("WC",Qd),Tx=/(WCOD+)?/.source.replace("WCOD",Ex),Rx=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Qd),Ax=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Qd),Cx=new RegExp("^"+wx+Tx+Rx+Ax+"$"),Px=["material","materials","bones","map"],Ld=class{constructor(t,e,n){let i=n||je.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,i)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},je=class s{constructor(t,e,n){this.path=e,this.parsedPath=n||s.parseTrackName(e),this.node=s.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new s.Composite(t,e,n):new s(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Sx,"")}static parseTrackName(t){let e=Cx.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let r=n.nodeName.substring(i+1);Px.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=n(a.children);if(l)return l}return null},i=n(t.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)t[e++]=n[i]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,i=e.propertyName,r=e.propertyIndex;if(t||(t=s.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Qt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){ne("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){ne("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){ne("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){ne("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){ne("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){ne("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){ne("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[i];if(o===void 0){let c=e.nodeName;ne("PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!t.geometry){ne("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){ne("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};je.Composite=Ld;je.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};je.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};je.prototype.GetterByBindingType=[je.prototype._getValue_direct,je.prototype._getValue_array,je.prototype._getValue_arrayElement,je.prototype._getValue_toArray];je.prototype.SetterByBindingTypeAndVersioning=[[je.prototype._setValue_direct,je.prototype._setValue_direct_setNeedsUpdate,je.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[je.prototype._setValue_array,je.prototype._setValue_array_setNeedsUpdate,je.prototype._setValue_array_setMatrixWorldNeedsUpdate],[je.prototype._setValue_arrayElement,je.prototype._setValue_arrayElement_setNeedsUpdate,je.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[je.prototype._setValue_fromArray,je.prototype._setValue_fromArray_setNeedsUpdate,je.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var WE=new Float32Array(1);var of=class of{constructor(t,e,n,i){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,i){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=i,this}};of.prototype.isMatrix2=!0;var Dd=of;function tf(s,t,e,n){let i=Ix(n);switch(e){case qd:return s*t;case gh:return s*t/i.components*i.byteLength;case vh:return s*t/i.components*i.byteLength;case Js:return s*t*2/i.components*i.byteLength;case xh:return s*t*2/i.components*i.byteLength;case Xd:return s*t*3/i.components*i.byteLength;case Ti:return s*t*4/i.components*i.byteLength;case yh:return s*t*4/i.components*i.byteLength;case pl:case ml:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case gl:case vl:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Mh:case Sh:return Math.max(s,16)*Math.max(t,8)/4;case _h:case bh:return Math.max(s,8)*Math.max(t,8)/2;case Eh:case wh:case Rh:case Ah:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Th:case xl:case Ch:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Ph:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Ih:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case Lh:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case Dh:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case Nh:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case Uh:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case Fh:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case Bh:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case Oh:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case Hh:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case kh:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case zh:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case Vh:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case Gh:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case Wh:case qh:case Xh:return Math.ceil(s/4)*Math.ceil(t/4)*16;case Yh:case Zh:return Math.ceil(s/4)*Math.ceil(t/4)*8;case yl:case $h:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Ix(s){switch(s){case On:case zd:return{byteLength:1,components:1};case Io:case Vd:case tn:return{byteLength:2,components:1};case ph:case mh:return{byteLength:2,components:4};case Wi:case fh:case wi:return{byteLength:4,components:1};case Gd:case Wd:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Qt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function _m(){let s=null,t=!1,e=null,n=null;function i(r,o){n=s.requestAnimationFrame(i),e(r,o)}return{start:function(){t!==!0&&e!==null&&s!==null&&(n=s.requestAnimationFrame(i),t=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function Fx(s){let t=new WeakMap;function e(a,l){let c=a.array,h=a.usage,u=c.byteLength,d=s.createBuffer();s.bindBuffer(l,d),s.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=s.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){let h=l.array,u=l.updateRanges;if(s.bindBuffer(c,a),u.length===0)s.bufferSubData(c,0,h);else{u.sort((f,m)=>f.start-m.start);let d=0;for(let f=1;f<u.length;f++){let m=u[d],v=u[f];v.start<=m.start+m.count+1?m.count=Math.max(m.count,v.start+v.count-m.start):(++d,u[d]=v)}u.length=d+1;for(let f=0,m=u.length;f<m;f++){let v=u[f];s.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(s.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:i,remove:r,update:o}}var Bx=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ox=`#ifdef USE_ALPHAHASH
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
#endif`,Hx=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,kx=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,zx=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Vx=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Gx=`#ifdef USE_AOMAP
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
#endif`,Wx=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,qx=`#ifdef USE_BATCHING
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
#endif`,Xx=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Yx=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Zx=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,$x=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Kx=`#ifdef USE_IRIDESCENCE
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
#endif`,Jx=`#ifdef USE_BUMPMAP
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
#endif`,jx=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Qx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ty=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ey=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,ny=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,iy=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,sy=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,ry=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,oy=`#define PI 3.141592653589793
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
} // validated`,ay=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,ly=`vec3 transformedNormal = objectNormal;
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
#endif`,cy=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,hy=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,uy=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,dy=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,fy="gl_FragColor = linearToOutputTexel( gl_FragColor );",py=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,my=`#ifdef USE_ENVMAP
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
#endif`,gy=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,vy=`#ifdef USE_ENVMAP
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
#endif`,xy=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,yy=`#ifdef USE_ENVMAP
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
#endif`,_y=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,My=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,by=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Sy=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ey=`#ifdef USE_GRADIENTMAP
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
}`,wy=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Ty=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ry=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Ay=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Cy=`#ifdef USE_ENVMAP
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
#endif`,Py=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Iy=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ly=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Dy=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ny=`PhysicalMaterial material;
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
#endif`,Uy=`uniform sampler2D dfgLUT;
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
}`,Fy=`
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
#endif`,By=`#if defined( RE_IndirectDiffuse )
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
#endif`,Oy=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Hy=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,ky=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,zy=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Vy=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Gy=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Wy=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,qy=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Xy=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Yy=`#if defined( USE_POINTS_UV )
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
#endif`,Zy=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,$y=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ky=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Jy=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,jy=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Qy=`#ifdef USE_MORPHTARGETS
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
#endif`,t1=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,e1=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,n1=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,i1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,s1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,r1=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,o1=`#ifdef USE_NORMALMAP
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
#endif`,a1=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,l1=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,c1=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,h1=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,u1=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,d1=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,f1=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,p1=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,m1=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,g1=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,v1=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,x1=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,y1=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,_1=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,M1=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,b1=`float getShadowMask() {
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
}`,S1=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,E1=`#ifdef USE_SKINNING
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
#endif`,w1=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,T1=`#ifdef USE_SKINNING
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
#endif`,R1=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,A1=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,C1=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,P1=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,I1=`#ifdef USE_TRANSMISSION
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
#endif`,L1=`#ifdef USE_TRANSMISSION
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
#endif`,D1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,N1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,U1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,F1=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,B1=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,O1=`uniform sampler2D t2D;
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
}`,H1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,k1=`#ifdef ENVMAP_TYPE_CUBE
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
}`,z1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,V1=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,G1=`#include <common>
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
}`,W1=`#if DEPTH_PACKING == 3200
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
}`,q1=`#define DISTANCE
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
}`,X1=`#define DISTANCE
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
}`,Y1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Z1=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$1=`uniform float scale;
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
}`,K1=`uniform vec3 diffuse;
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
}`,J1=`#include <common>
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
}`,j1=`uniform vec3 diffuse;
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
}`,Q1=`#define LAMBERT
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
}`,t_=`#define LAMBERT
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
}`,e_=`#define MATCAP
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
}`,n_=`#define MATCAP
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
}`,i_=`#define NORMAL
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
}`,s_=`#define NORMAL
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
}`,r_=`#define PHONG
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
}`,o_=`#define PHONG
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
}`,a_=`#define STANDARD
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
}`,l_=`#define STANDARD
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
}`,c_=`#define TOON
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
}`,h_=`#define TOON
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
}`,u_=`uniform float size;
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
}`,d_=`uniform vec3 diffuse;
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
}`,f_=`#include <common>
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
}`,p_=`uniform vec3 color;
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
}`,m_=`uniform float rotation;
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
}`,g_=`uniform vec3 diffuse;
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
}`,ye={alphahash_fragment:Bx,alphahash_pars_fragment:Ox,alphamap_fragment:Hx,alphamap_pars_fragment:kx,alphatest_fragment:zx,alphatest_pars_fragment:Vx,aomap_fragment:Gx,aomap_pars_fragment:Wx,batching_pars_vertex:qx,batching_vertex:Xx,begin_vertex:Yx,beginnormal_vertex:Zx,bsdfs:$x,iridescence_fragment:Kx,bumpmap_pars_fragment:Jx,clipping_planes_fragment:jx,clipping_planes_pars_fragment:Qx,clipping_planes_pars_vertex:ty,clipping_planes_vertex:ey,color_fragment:ny,color_pars_fragment:iy,color_pars_vertex:sy,color_vertex:ry,common:oy,cube_uv_reflection_fragment:ay,defaultnormal_vertex:ly,displacementmap_pars_vertex:cy,displacementmap_vertex:hy,emissivemap_fragment:uy,emissivemap_pars_fragment:dy,colorspace_fragment:fy,colorspace_pars_fragment:py,envmap_fragment:my,envmap_common_pars_fragment:gy,envmap_pars_fragment:vy,envmap_pars_vertex:xy,envmap_physical_pars_fragment:Cy,envmap_vertex:yy,fog_vertex:_y,fog_pars_vertex:My,fog_fragment:by,fog_pars_fragment:Sy,gradientmap_pars_fragment:Ey,lightmap_pars_fragment:wy,lights_lambert_fragment:Ty,lights_lambert_pars_fragment:Ry,lights_pars_begin:Ay,lights_toon_fragment:Py,lights_toon_pars_fragment:Iy,lights_phong_fragment:Ly,lights_phong_pars_fragment:Dy,lights_physical_fragment:Ny,lights_physical_pars_fragment:Uy,lights_fragment_begin:Fy,lights_fragment_maps:By,lights_fragment_end:Oy,lightprobes_pars_fragment:Hy,logdepthbuf_fragment:ky,logdepthbuf_pars_fragment:zy,logdepthbuf_pars_vertex:Vy,logdepthbuf_vertex:Gy,map_fragment:Wy,map_pars_fragment:qy,map_particle_fragment:Xy,map_particle_pars_fragment:Yy,metalnessmap_fragment:Zy,metalnessmap_pars_fragment:$y,morphinstance_vertex:Ky,morphcolor_vertex:Jy,morphnormal_vertex:jy,morphtarget_pars_vertex:Qy,morphtarget_vertex:t1,normal_fragment_begin:e1,normal_fragment_maps:n1,normal_pars_fragment:i1,normal_pars_vertex:s1,normal_vertex:r1,normalmap_pars_fragment:o1,clearcoat_normal_fragment_begin:a1,clearcoat_normal_fragment_maps:l1,clearcoat_pars_fragment:c1,iridescence_pars_fragment:h1,opaque_fragment:u1,packing:d1,premultiplied_alpha_fragment:f1,project_vertex:p1,dithering_fragment:m1,dithering_pars_fragment:g1,roughnessmap_fragment:v1,roughnessmap_pars_fragment:x1,shadowmap_pars_fragment:y1,shadowmap_pars_vertex:_1,shadowmap_vertex:M1,shadowmask_pars_fragment:b1,skinbase_vertex:S1,skinning_pars_vertex:E1,skinning_vertex:w1,skinnormal_vertex:T1,specularmap_fragment:R1,specularmap_pars_fragment:A1,tonemapping_fragment:C1,tonemapping_pars_fragment:P1,transmission_fragment:I1,transmission_pars_fragment:L1,uv_pars_fragment:D1,uv_pars_vertex:N1,uv_vertex:U1,worldpos_vertex:F1,background_vert:B1,background_frag:O1,backgroundCube_vert:H1,backgroundCube_frag:k1,cube_vert:z1,cube_frag:V1,depth_vert:G1,depth_frag:W1,distance_vert:q1,distance_frag:X1,equirect_vert:Y1,equirect_frag:Z1,linedashed_vert:$1,linedashed_frag:K1,meshbasic_vert:J1,meshbasic_frag:j1,meshlambert_vert:Q1,meshlambert_frag:t_,meshmatcap_vert:e_,meshmatcap_frag:n_,meshnormal_vert:i_,meshnormal_frag:s_,meshphong_vert:r_,meshphong_frag:o_,meshphysical_vert:a_,meshphysical_frag:l_,meshtoon_vert:c_,meshtoon_frag:h_,points_vert:u_,points_frag:d_,shadow_vert:f_,shadow_frag:p_,sprite_vert:m_,sprite_frag:g_},Pt={common:{diffuse:{value:new mt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new oe},alphaMap:{value:null},alphaMapTransform:{value:new oe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new oe}},envmap:{envMap:{value:null},envMapRotation:{value:new oe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new oe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new oe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new oe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new oe},normalScale:{value:new nt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new oe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new oe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new oe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new oe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new mt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new E},probesMax:{value:new E},probesResolution:{value:new E}},points:{diffuse:{value:new mt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new oe},alphaTest:{value:0},uvTransform:{value:new oe}},sprite:{diffuse:{value:new mt(16777215)},opacity:{value:1},center:{value:new nt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new oe},alphaMap:{value:null},alphaMapTransform:{value:new oe},alphaTest:{value:0}}},hs={basic:{uniforms:Hn([Pt.common,Pt.specularmap,Pt.envmap,Pt.aomap,Pt.lightmap,Pt.fog]),vertexShader:ye.meshbasic_vert,fragmentShader:ye.meshbasic_frag},lambert:{uniforms:Hn([Pt.common,Pt.specularmap,Pt.envmap,Pt.aomap,Pt.lightmap,Pt.emissivemap,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.fog,Pt.lights,{emissive:{value:new mt(0)},envMapIntensity:{value:1}}]),vertexShader:ye.meshlambert_vert,fragmentShader:ye.meshlambert_frag},phong:{uniforms:Hn([Pt.common,Pt.specularmap,Pt.envmap,Pt.aomap,Pt.lightmap,Pt.emissivemap,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.fog,Pt.lights,{emissive:{value:new mt(0)},specular:{value:new mt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ye.meshphong_vert,fragmentShader:ye.meshphong_frag},standard:{uniforms:Hn([Pt.common,Pt.envmap,Pt.aomap,Pt.lightmap,Pt.emissivemap,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.roughnessmap,Pt.metalnessmap,Pt.fog,Pt.lights,{emissive:{value:new mt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ye.meshphysical_vert,fragmentShader:ye.meshphysical_frag},toon:{uniforms:Hn([Pt.common,Pt.aomap,Pt.lightmap,Pt.emissivemap,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.gradientmap,Pt.fog,Pt.lights,{emissive:{value:new mt(0)}}]),vertexShader:ye.meshtoon_vert,fragmentShader:ye.meshtoon_frag},matcap:{uniforms:Hn([Pt.common,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.fog,{matcap:{value:null}}]),vertexShader:ye.meshmatcap_vert,fragmentShader:ye.meshmatcap_frag},points:{uniforms:Hn([Pt.points,Pt.fog]),vertexShader:ye.points_vert,fragmentShader:ye.points_frag},dashed:{uniforms:Hn([Pt.common,Pt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ye.linedashed_vert,fragmentShader:ye.linedashed_frag},depth:{uniforms:Hn([Pt.common,Pt.displacementmap]),vertexShader:ye.depth_vert,fragmentShader:ye.depth_frag},normal:{uniforms:Hn([Pt.common,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,{opacity:{value:1}}]),vertexShader:ye.meshnormal_vert,fragmentShader:ye.meshnormal_frag},sprite:{uniforms:Hn([Pt.sprite,Pt.fog]),vertexShader:ye.sprite_vert,fragmentShader:ye.sprite_frag},background:{uniforms:{uvTransform:{value:new oe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ye.background_vert,fragmentShader:ye.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new oe}},vertexShader:ye.backgroundCube_vert,fragmentShader:ye.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ye.cube_vert,fragmentShader:ye.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ye.equirect_vert,fragmentShader:ye.equirect_frag},distance:{uniforms:Hn([Pt.common,Pt.displacementmap,{referencePosition:{value:new E},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ye.distance_vert,fragmentShader:ye.distance_frag},shadow:{uniforms:Hn([Pt.lights,Pt.fog,{color:{value:new mt(0)},opacity:{value:1}}]),vertexShader:ye.shadow_vert,fragmentShader:ye.shadow_frag}};hs.physical={uniforms:Hn([hs.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new oe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new oe},clearcoatNormalScale:{value:new nt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new oe},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new oe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new oe},sheen:{value:0},sheenColor:{value:new mt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new oe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new oe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new oe},transmissionSamplerSize:{value:new nt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new oe},attenuationDistance:{value:0},attenuationColor:{value:new mt(0)},specularColor:{value:new mt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new oe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new oe},anisotropyVector:{value:new nt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new oe}}]),vertexShader:ye.meshphysical_vert,fragmentShader:ye.meshphysical_frag};var Qh={r:0,b:0,g:0},v_=new le,Mm=new oe;Mm.set(-1,0,0,0,1,0,0,0,1);function x_(s,t,e,n,i,r){let o=new mt(0),a=i===!0?0:1,l,c,h=null,u=0,d=null;function f(x){let _=x.isScene===!0?x.background:null;if(_&&_.isTexture){let y=x.backgroundBlurriness>0;_=t.get(_,y)}return _}function m(x){let _=!1,y=f(x);y===null?p(o,a):y&&y.isColor&&(p(y,1),_=!0);let b=s.xr.getEnvironmentBlendMode();b==="additive"?e.buffers.color.setClear(0,0,0,1,r):b==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(s.autoClear||_)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function v(x,_){let y=f(_);y&&(y.isCubeTexture||y.mapping===dl)?(c===void 0&&(c=new et(new De(1,1,1),new te({name:"BackgroundCubeMaterial",uniforms:Dr(hs.backgroundCube.uniforms),vertexShader:hs.backgroundCube.vertexShader,fragmentShader:hs.backgroundCube.fragmentShader,side:fn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(b,S,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=_.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(v_.makeRotationFromEuler(_.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Mm),c.material.toneMapped=Me.getTransfer(y.colorSpace)!==Pe,(h!==y||u!==y.version||d!==s.toneMapping)&&(c.material.needsUpdate=!0,h=y,u=y.version,d=s.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new et(new Be(2,2),new te({name:"BackgroundMaterial",uniforms:Dr(hs.background.uniforms),vertexShader:hs.background.vertexShader,fragmentShader:hs.background.fragmentShader,side:ls,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,l.material.toneMapped=Me.getTransfer(y.colorSpace)!==Pe,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||u!==y.version||d!==s.toneMapping)&&(l.material.needsUpdate=!0,h=y,u=y.version,d=s.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function p(x,_){x.getRGB(Qh,Jd(s)),e.buffers.color.setClear(Qh.r,Qh.g,Qh.b,_,r)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,_=1){o.set(x),a=_,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(x){a=x,p(o,a)},render:m,addToRenderList:v,dispose:g}}function y_(s,t){let e=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=d(null),r=i,o=!1;function a(I,L,k,N,O){let V=!1,q=u(I,N,k,L);r!==q&&(r=q,c(r.object)),V=f(I,N,k,O),V&&m(I,N,k,O),O!==null&&t.update(O,s.ELEMENT_ARRAY_BUFFER),(V||o)&&(o=!1,y(I,L,k,N),O!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(O).buffer))}function l(){return s.createVertexArray()}function c(I){return s.bindVertexArray(I)}function h(I){return s.deleteVertexArray(I)}function u(I,L,k,N){let O=N.wireframe===!0,V=n[L.id];V===void 0&&(V={},n[L.id]=V);let q=I.isInstancedMesh===!0?I.id:0,rt=V[q];rt===void 0&&(rt={},V[q]=rt);let G=rt[k.id];G===void 0&&(G={},rt[k.id]=G);let X=G[O];return X===void 0&&(X=d(l()),G[O]=X),X}function d(I){let L=[],k=[],N=[];for(let O=0;O<e;O++)L[O]=0,k[O]=0,N[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:k,attributeDivisors:N,object:I,attributes:{},index:null}}function f(I,L,k,N){let O=r.attributes,V=L.attributes,q=0,rt=k.getAttributes();for(let G in rt)if(rt[G].location>=0){let Q=O[G],_t=V[G];if(_t===void 0&&(G==="instanceMatrix"&&I.instanceMatrix&&(_t=I.instanceMatrix),G==="instanceColor"&&I.instanceColor&&(_t=I.instanceColor)),Q===void 0||Q.attribute!==_t||_t&&Q.data!==_t.data)return!0;q++}return r.attributesNum!==q||r.index!==N}function m(I,L,k,N){let O={},V=L.attributes,q=0,rt=k.getAttributes();for(let G in rt)if(rt[G].location>=0){let Q=V[G];Q===void 0&&(G==="instanceMatrix"&&I.instanceMatrix&&(Q=I.instanceMatrix),G==="instanceColor"&&I.instanceColor&&(Q=I.instanceColor));let _t={};_t.attribute=Q,Q&&Q.data&&(_t.data=Q.data),O[G]=_t,q++}r.attributes=O,r.attributesNum=q,r.index=N}function v(){let I=r.newAttributes;for(let L=0,k=I.length;L<k;L++)I[L]=0}function p(I){g(I,0)}function g(I,L){let k=r.newAttributes,N=r.enabledAttributes,O=r.attributeDivisors;k[I]=1,N[I]===0&&(s.enableVertexAttribArray(I),N[I]=1),O[I]!==L&&(s.vertexAttribDivisor(I,L),O[I]=L)}function x(){let I=r.newAttributes,L=r.enabledAttributes;for(let k=0,N=L.length;k<N;k++)L[k]!==I[k]&&(s.disableVertexAttribArray(k),L[k]=0)}function _(I,L,k,N,O,V,q){q===!0?s.vertexAttribIPointer(I,L,k,O,V):s.vertexAttribPointer(I,L,k,N,O,V)}function y(I,L,k,N){v();let O=N.attributes,V=k.getAttributes(),q=L.defaultAttributeValues;for(let rt in V){let G=V[rt];if(G.location>=0){let X=O[rt];if(X===void 0&&(rt==="instanceMatrix"&&I.instanceMatrix&&(X=I.instanceMatrix),rt==="instanceColor"&&I.instanceColor&&(X=I.instanceColor)),X!==void 0){let Q=X.normalized,_t=X.itemSize,St=t.get(X);if(St===void 0)continue;let Ht=St.buffer,Vt=St.type,ee=St.bytesPerElement,J=Vt===s.INT||Vt===s.UNSIGNED_INT||X.gpuType===fh;if(X.isInterleavedBufferAttribute){let lt=X.data,wt=lt.stride,Xt=X.offset;if(lt.isInstancedInterleavedBuffer){for(let Ct=0;Ct<G.locationSize;Ct++)g(G.location+Ct,lt.meshPerAttribute);I.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=lt.meshPerAttribute*lt.count)}else for(let Ct=0;Ct<G.locationSize;Ct++)p(G.location+Ct);s.bindBuffer(s.ARRAY_BUFFER,Ht);for(let Ct=0;Ct<G.locationSize;Ct++)_(G.location+Ct,_t/G.locationSize,Vt,Q,wt*ee,(Xt+_t/G.locationSize*Ct)*ee,J)}else{if(X.isInstancedBufferAttribute){for(let lt=0;lt<G.locationSize;lt++)g(G.location+lt,X.meshPerAttribute);I.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let lt=0;lt<G.locationSize;lt++)p(G.location+lt);s.bindBuffer(s.ARRAY_BUFFER,Ht);for(let lt=0;lt<G.locationSize;lt++)_(G.location+lt,_t/G.locationSize,Vt,Q,_t*ee,_t/G.locationSize*lt*ee,J)}}else if(q!==void 0){let Q=q[rt];if(Q!==void 0)switch(Q.length){case 2:s.vertexAttrib2fv(G.location,Q);break;case 3:s.vertexAttrib3fv(G.location,Q);break;case 4:s.vertexAttrib4fv(G.location,Q);break;default:s.vertexAttrib1fv(G.location,Q)}}}}x()}function b(){R();for(let I in n){let L=n[I];for(let k in L){let N=L[k];for(let O in N){let V=N[O];for(let q in V)h(V[q].object),delete V[q];delete N[O]}}delete n[I]}}function S(I){if(n[I.id]===void 0)return;let L=n[I.id];for(let k in L){let N=L[k];for(let O in N){let V=N[O];for(let q in V)h(V[q].object),delete V[q];delete N[O]}}delete n[I.id]}function T(I){for(let L in n){let k=n[L];for(let N in k){let O=k[N];if(O[I.id]===void 0)continue;let V=O[I.id];for(let q in V)h(V[q].object),delete V[q];delete O[I.id]}}}function M(I){for(let L in n){let k=n[L],N=I.isInstancedMesh===!0?I.id:0,O=k[N];if(O!==void 0){for(let V in O){let q=O[V];for(let rt in q)h(q[rt].object),delete q[rt];delete O[V]}delete k[N],Object.keys(k).length===0&&delete n[L]}}}function R(){C(),o=!0,r!==i&&(r=i,c(r.object))}function C(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:R,resetDefaultState:C,dispose:b,releaseStatesOfGeometry:S,releaseStatesOfObject:M,releaseStatesOfProgram:T,initAttributes:v,enableAttribute:p,disableUnusedAttributes:x}}function __(s,t,e){let n;function i(l){n=l}function r(l,c){s.drawArrays(n,l,c),e.update(c,n,1)}function o(l,c,h){h!==0&&(s.drawArraysInstanced(n,l,c,h),e.update(c,n,h))}function a(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];e.update(d,n,1)}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function M_(s,t,e,n){let i;function r(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){let T=t.get("EXT_texture_filter_anisotropic");i=s.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(T){return!(T!==Ti&&n.convert(T)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(T){let M=T===tn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(T!==On&&T!==wi&&!M&&n.convert(T)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(T){if(T==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Qt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&d===!1&&Qt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),m=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=s.getParameter(s.MAX_TEXTURE_SIZE),p=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),g=s.getParameter(s.MAX_VERTEX_ATTRIBS),x=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),_=s.getParameter(s.MAX_VARYING_VECTORS),y=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),b=s.getParameter(s.MAX_SAMPLES),S=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:m,maxTextureSize:v,maxCubemapSize:p,maxAttributes:g,maxVertexUniforms:x,maxVaryings:_,maxFragmentUniforms:y,maxSamples:b,samples:S}}function b_(s){let t=this,e=null,n=0,i=!1,r=!1,o=new Ln,a=new oe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){let m=u.clippingPlanes,v=u.clipIntersection,p=u.clipShadows,g=s.get(u);if(!i||m===null||m.length===0||r&&!p)r?h(null):c();else{let x=r?0:n,_=x*4,y=g.clippingState||null;l.value=y,y=h(m,d,_,f);for(let b=0;b!==_;++b)y[b]=e[b];g.clippingState=y,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,d,f,m){let v=u!==null?u.length:0,p=null;if(v!==0){if(p=l.value,m!==!0||p===null){let g=f+v*4,x=d.matrixWorldInverse;a.getNormalMatrix(x),(p===null||p.length<g)&&(p=new Float32Array(g));for(let _=0,y=f;_!==v;++_,y+=4)o.copy(u[_]).applyMatrix4(x,a),o.normal.toArray(p,y),p[y+3]=o.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,p}}var No=4,S_=6,E_=20,w_=256,_l=new as,Q0=new mt,af=null,lf=0,cf=0,hf=!1,T_=new E,Nr=new E,js=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,i=100,r={}){let{size:o=256,position:a=T_}=r;af=this._renderer.getRenderTarget(),lf=this._renderer.getActiveCubeFace(),cf=this._renderer.getActiveMipmapLevel(),hf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,i,l,a),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=nm(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=em(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(af,lf,cf),this._renderer.xr.enabled=hf,t.scissorTest=!1,Do(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===$s||t.mapping===Lr?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),af=this._renderer.getRenderTarget(),lf=this._renderer.getActiveCubeFace(),cf=this._renderer.getActiveMipmapLevel(),hf=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:cn,minFilter:cn,generateMipmaps:!1,type:tn,format:Ti,colorSpace:Ia,depthBuffer:!1},i=tm(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=tm(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=R_(r)),this._blurMaterial=C_(r,t,e),this._ggxMaterial=A_(r,t,e)}return i}_compileMaterial(t){let e=new et(new ae,t);this._renderer.compile(e,_l)}_sceneToCubeUV(t,e,n,i,r){let l=new Qe(90,1,e,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(Q0),u.toneMapping=Gi,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(i),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new et(new De,new ue({name:"PMREM.Background",side:fn,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,p=v.material,g=!1,x=t.background;x?x.isColor&&(p.color.copy(x),t.background=null,g=!0):(p.color.copy(Q0),g=!0);for(let _=0;_<6;_++){let y=_%3;y===0?(l.up.set(0,c[_],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[_],r.y,r.z)):y===1?(l.up.set(0,0,c[_]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[_],r.z)):(l.up.set(0,c[_],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[_]));let b=this._cubeSize;Do(i,y*b,_>2?b:0,b,b),u.setRenderTarget(i),g&&u.render(v,l),u.render(t,l)}u.toneMapping=f,u.autoClear=d,t.background=x}_textureToCubeUV(t,e){let n=this._renderer,i=t.mapping===$s||t.mapping===Lr;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=nm()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=em());let r=i?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=t;let l=this._cubeSize;Do(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,_l)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let i=this._lodMeshes.length;for(let r=1;r<i;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let i=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let l=o.uniforms,c=n/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=c*1.25,f=u*d,{_lodMax:m}=this,v=this._sizeLods[n],p=3*v*(n>m-No?n-m+No:0),g=4*(this._cubeSize-v);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=m-e,Do(r,p,g,3*v,2*v),i.setRenderTarget(r),i.render(a,_l),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-n,Do(t,p,g,3*v,2*v),i.setRenderTarget(t),i.render(a,_l)}_blur(t,e,n,i){let r=this._pingPongRenderTarget,o=Math.min(i,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,o),this._blurPass(r,t,n,n,o)}_blurPass(t,e,n,i,r){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[i];l.material=a;let c=a.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let h=this._sizeLods[i],u=3*h*(i>this._lodMax-No?i-this._lodMax+No:0),d=4*(this._cubeSize-h);Do(e,u,d,3*h,2*h),o.setRenderTarget(e),o.render(l,_l)}};function R_(s){let t=[],e=[],n=s,i=s-No+1+S_;for(let r=0;r<i;r++){let o=Math.pow(2,n);t.push(o);let a=1/(o-2),l=-a,c=1+a,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,f=3,m=new Float32Array(f*d*u),v=new Float32Array(f*d*u);for(let g=0;g<u;g++){let x=g%3*2/3-1,_=g>2?0:-1,y=[x,_,0,x+2/3,_,0,x+2/3,_+1,0,x,_,0,x+2/3,_+1,0,x,_+1,0];m.set(y,f*d*g);for(let b=0;b<d;b++){let S=h[b*2]*2-1,T=h[b*2+1]*2-1;g===0?Nr.set(1,T,S):g===1?Nr.set(-S,1,-T):g===2?Nr.set(-S,T,1):g===3?Nr.set(-1,T,-S):g===4?Nr.set(-S,-1,T):Nr.set(S,T,-1),Nr.toArray(v,(g*d+b)*f)}}let p=new ae;p.setAttribute("position",new ce(m,f)),p.setAttribute("outputDirection",new ce(v,f)),e.push(new et(p,null)),n>No&&n--}return{lodMeshes:e,sizeLods:t}}function tm(s,t,e){let n=new qe(s,t,e);return n.texture.mapping=dl,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Do(s,t,e,n,i){s.viewport.set(t,e,n,i),s.scissor.set(t,e,n,i)}function A_(s,t,e){return new te({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:w_,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:nu(),fragmentShader:`

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
		`,blending:Si,depthTest:!1,depthWrite:!1})}function C_(s,t,e){return new te({name:"SphericalGaussianBlur",defines:{SAMPLES:E_,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:nu(),fragmentShader:`

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
		`,blending:Si,depthTest:!1,depthWrite:!1})}function em(){return new te({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:nu(),fragmentShader:`

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
		`,blending:Si,depthTest:!1,depthWrite:!1})}function nm(){return new te({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:nu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Si,depthTest:!1,depthWrite:!1})}function nu(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Fo=class extends qe{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new Ha(i),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new De(5,5,5),r=new te({name:"CubemapFromEquirect",uniforms:Dr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:fn,blending:Si});r.uniforms.tEquirect.value=e;let o=new et(i,r),a=e.minFilter;return e.minFilter===ti&&(e.minFilter=cn),new ah(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,i=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,i);t.setRenderTarget(r)}};function P_(s){let t=new WeakMap,e=new WeakMap,n=null;function i(d,f=!1){return d==null?null:f?o(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===hh||f===uh)if(t.has(d)){let m=t.get(d).texture;return a(m,d.mapping)}else{let m=d.image;if(m&&m.height>0){let v=new Fo(m.height);return v.fromEquirectangularTexture(s,d),t.set(d,v),d.addEventListener("dispose",c),a(v.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,m=f===hh||f===uh,v=f===$s||f===Lr;if(m||v){let p=e.get(d),g=p!==void 0?p.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==g)return n===null&&(n=new js(s)),p=m?n.fromEquirectangular(d,p):n.fromCubemap(d,p),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),p.texture;if(p!==void 0)return p.texture;{let x=d.image;return m&&x&&x.height>0||v&&x&&l(x)?(n===null&&(n=new js(s)),p=m?n.fromEquirectangular(d):n.fromCubemap(d),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),d.addEventListener("dispose",h),p.texture):null}}}return d}function a(d,f){return f===hh?d.mapping=$s:f===uh&&(d.mapping=Lr),d}function l(d){let f=0,m=6;for(let v=0;v<m;v++)d[v]!==void 0&&f++;return f===m}function c(d){let f=d.target;f.removeEventListener("dispose",c);let m=t.get(f);m!==void 0&&(t.delete(f),m.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let m=e.get(f);m!==void 0&&(e.delete(f),m.dispose())}function u(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:u}}function I_(s){let t={};function e(n){if(t[n]!==void 0)return t[n];let i=s.getExtension(n);return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let i=e(n);return i===null&&_r("WebGLRenderer: "+n+" extension not supported."),i}}}function L_(s,t,e,n){let i={},r=new WeakMap;function o(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let m in d.attributes)t.remove(d.attributes[m]);d.removeEventListener("dispose",o),delete i[d.id];let f=r.get(d);f&&(t.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return i[d.id]===!0||(d.addEventListener("dispose",o),i[d.id]=!0,e.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)t.update(d[f],s.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,m=u.attributes.position,v=0;if(m===void 0)return;if(f!==null){let x=f.array;v=f.version;for(let _=0,y=x.length;_<y;_+=3){let b=x[_+0],S=x[_+1],T=x[_+2];d.push(b,S,S,T,T,b)}}else{let x=m.array;v=m.version;for(let _=0,y=x.length/3-1;_<y;_+=3){let b=_+0,S=_+1,T=_+2;d.push(b,S,S,T,T,b)}}let p=new(m.count>=65535?Sr:br)(d,1);p.version=v;let g=r.get(u);g&&t.remove(g),r.set(u,p)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function D_(s,t,e){let n;function i(u){n=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function l(u,d){s.drawElements(n,d,r,u*o),e.update(d,n,1)}function c(u,d,f){f!==0&&(s.drawElementsInstanced(n,d,r,u*o,f),e.update(d,n,f))}function h(u,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,u,0,f);let v=0;for(let p=0;p<f;p++)v+=d[p];e.update(v,n,1)}this.setMode=i,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function N_(s){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case s.TRIANGLES:e.triangles+=a*(r/3);break;case s.LINES:e.lines+=a*(r/2);break;case s.LINE_STRIP:e.lines+=a*(r-1);break;case s.LINE_LOOP:e.lines+=a*r;break;case s.POINTS:e.points+=a*r;break;default:ne("WebGLInfo: Unknown draw mode:",o);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function U_(s,t,e){let n=new WeakMap,i=new Ve;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(a);if(d===void 0||d.count!==u){let R=function(){T.dispose(),n.delete(a),a.removeEventListener("dispose",R)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,m=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],x=a.morphAttributes.color||[],_=0;f===!0&&(_=1),m===!0&&(_=2),v===!0&&(_=3);let y=a.attributes.position.count*_,b=1;y>t.maxTextureSize&&(b=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let S=new Float32Array(y*b*4*u),T=new Mr(S,y,b,u);T.type=wi,T.needsUpdate=!0;let M=_*4;for(let C=0;C<u;C++){let I=p[C],L=g[C],k=x[C],N=y*b*4*C;for(let O=0;O<I.count;O++){let V=O*M;f===!0&&(i.fromBufferAttribute(I,O),S[N+V+0]=i.x,S[N+V+1]=i.y,S[N+V+2]=i.z,S[N+V+3]=0),m===!0&&(i.fromBufferAttribute(L,O),S[N+V+4]=i.x,S[N+V+5]=i.y,S[N+V+6]=i.z,S[N+V+7]=0),v===!0&&(i.fromBufferAttribute(k,O),S[N+V+8]=i.x,S[N+V+9]=i.y,S[N+V+10]=i.z,S[N+V+11]=k.itemSize===4?i.w:1)}}d={count:u,texture:T,size:new nt(y,b)},n.set(a,d),a.addEventListener("dispose",R)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,e);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];let m=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(s,"morphTargetBaseInfluence",m),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function F_(s,t,e,n,i){let r=new WeakMap;function o(c){let h=i.render.frame,u=c.geometry,d=t.get(c,u);if(r.get(d)!==h&&(t.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function a(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var B_={[ol]:"LINEAR_TONE_MAPPING",[al]:"REINHARD_TONE_MAPPING",[ll]:"CINEON_TONE_MAPPING",[Ir]:"ACES_FILMIC_TONE_MAPPING",[hl]:"AGX_TONE_MAPPING",[ul]:"NEUTRAL_TONE_MAPPING",[cl]:"CUSTOM_TONE_MAPPING"};function O_(s,t,e,n,i,r){let o=new qe(t,e,{type:s,depthBuffer:i,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new ae;c.setAttribute("position",new zt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new zt([0,2,0,0,2,0],2));let h=new Ro({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new et(c,h),d=new as(-1,1,1,-1,0,1),f=null,m=null,v=!1,p,g=null,x=[],_=!1;this.setSize=function(y,b){o.setSize(y,b),a!==null&&a.setSize(y,b),l!==null&&l.setSize(y,b);for(let S=0;S<x.length;S++){let T=x[S];T.setSize&&T.setSize(y,b)}},this.setEffects=function(y){x=y,_=x.length>0&&x[0].isRenderPass===!0;let b=o.width,S=o.height;x.length>0&&a===null&&(a=new qe(b,S,{type:tn,depthBuffer:!1,stencilBuffer:!1}),l=new qe(b,S,{type:tn,depthBuffer:!1,stencilBuffer:!1}));for(let T=0;T<x.length;T++){let M=x[T];M.setSize&&M.setSize(b,S)}},this.begin=function(y,b){if(v||y.toneMapping===Gi&&x.length===0)return!1;if(g=b,b!==null){let S=b.width,T=b.height;(o.width!==S||o.height!==T)&&this.setSize(S,T)}return _===!1&&y.setRenderTarget(o),p=y.toneMapping,y.toneMapping=Gi,!0},this.hasRenderPass=function(){return _},this.end=function(y,b){y.toneMapping=p,v=!0;let S=o,T=a;for(let M=0;M<x.length;M++){let R=x[M];R.enabled!==!1&&(R.render(y,T,S,b),R.needsSwap!==!1&&(S=T,T=T===a?l:a))}if(f!==y.outputColorSpace||m!==y.toneMapping){f=y.outputColorSpace,m=y.toneMapping,h.defines={},Me.getTransfer(f)===Pe&&(h.defines.SRGB_TRANSFER="");let M=B_[m];M&&(h.defines[M]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=S.texture,y.setRenderTarget(g),y.render(u,d),g=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var bm=new Xn,ff=new Ws(1,1),Sm=new Mr,Em=new Vc,wm=new Ha,im=[],sm=[],rm=new Float32Array(16),om=new Float32Array(9),am=new Float32Array(4);function Bo(s,t,e){let n=s[0];if(n<=0||n>0)return s;let i=t*e,r=im[i];if(r===void 0&&(r=new Float32Array(i),im[i]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,s[o].toArray(r,a)}return r}function Sn(s,t){if(s.length!==t.length)return!1;for(let e=0,n=s.length;e<n;e++)if(s[e]!==t[e])return!1;return!0}function En(s,t){for(let e=0,n=t.length;e<n;e++)s[e]=t[e]}function iu(s,t){let e=sm[t];e===void 0&&(e=new Int32Array(t),sm[t]=e);for(let n=0;n!==t;++n)e[n]=s.allocateTextureUnit();return e}function H_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function k_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Sn(e,t))return;s.uniform2fv(this.addr,t),En(e,t)}}function z_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Sn(e,t))return;s.uniform3fv(this.addr,t),En(e,t)}}function V_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Sn(e,t))return;s.uniform4fv(this.addr,t),En(e,t)}}function G_(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(Sn(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),En(e,t)}else{if(Sn(e,n))return;am.set(n),s.uniformMatrix2fv(this.addr,!1,am),En(e,n)}}function W_(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(Sn(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),En(e,t)}else{if(Sn(e,n))return;om.set(n),s.uniformMatrix3fv(this.addr,!1,om),En(e,n)}}function q_(s,t){let e=this.cache,n=t.elements;if(n===void 0){if(Sn(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),En(e,t)}else{if(Sn(e,n))return;rm.set(n),s.uniformMatrix4fv(this.addr,!1,rm),En(e,n)}}function X_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function Y_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Sn(e,t))return;s.uniform2iv(this.addr,t),En(e,t)}}function Z_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Sn(e,t))return;s.uniform3iv(this.addr,t),En(e,t)}}function $_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Sn(e,t))return;s.uniform4iv(this.addr,t),En(e,t)}}function K_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function J_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Sn(e,t))return;s.uniform2uiv(this.addr,t),En(e,t)}}function j_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Sn(e,t))return;s.uniform3uiv(this.addr,t),En(e,t)}}function Q_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Sn(e,t))return;s.uniform4uiv(this.addr,t),En(e,t)}}function tM(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(ff.compareFunction=e.isReversedDepthBuffer()?jh:Jh,r=ff):r=bm,e.setTexture2D(t||r,i)}function eM(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||Em,i)}function nM(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||wm,i)}function iM(s,t,e){let n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||Sm,i)}function sM(s){switch(s){case 5126:return H_;case 35664:return k_;case 35665:return z_;case 35666:return V_;case 35674:return G_;case 35675:return W_;case 35676:return q_;case 5124:case 35670:return X_;case 35667:case 35671:return Y_;case 35668:case 35672:return Z_;case 35669:case 35673:return $_;case 5125:return K_;case 36294:return J_;case 36295:return j_;case 36296:return Q_;case 35678:case 36198:case 36298:case 36306:case 35682:return tM;case 35679:case 36299:case 36307:return eM;case 35680:case 36300:case 36308:case 36293:return nM;case 36289:case 36303:case 36311:case 36292:return iM}}function rM(s,t){s.uniform1fv(this.addr,t)}function oM(s,t){let e=Bo(t,this.size,2);s.uniform2fv(this.addr,e)}function aM(s,t){let e=Bo(t,this.size,3);s.uniform3fv(this.addr,e)}function lM(s,t){let e=Bo(t,this.size,4);s.uniform4fv(this.addr,e)}function cM(s,t){let e=Bo(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function hM(s,t){let e=Bo(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function uM(s,t){let e=Bo(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function dM(s,t){s.uniform1iv(this.addr,t)}function fM(s,t){s.uniform2iv(this.addr,t)}function pM(s,t){s.uniform3iv(this.addr,t)}function mM(s,t){s.uniform4iv(this.addr,t)}function gM(s,t){s.uniform1uiv(this.addr,t)}function vM(s,t){s.uniform2uiv(this.addr,t)}function xM(s,t){s.uniform3uiv(this.addr,t)}function yM(s,t){s.uniform4uiv(this.addr,t)}function _M(s,t,e){let n=this.cache,i=t.length,r=iu(e,i);Sn(n,r)||(s.uniform1iv(this.addr,r),En(n,r));let o;this.type===s.SAMPLER_2D_SHADOW?o=ff:o=bm;for(let a=0;a!==i;++a)e.setTexture2D(t[a]||o,r[a])}function MM(s,t,e){let n=this.cache,i=t.length,r=iu(e,i);Sn(n,r)||(s.uniform1iv(this.addr,r),En(n,r));for(let o=0;o!==i;++o)e.setTexture3D(t[o]||Em,r[o])}function bM(s,t,e){let n=this.cache,i=t.length,r=iu(e,i);Sn(n,r)||(s.uniform1iv(this.addr,r),En(n,r));for(let o=0;o!==i;++o)e.setTextureCube(t[o]||wm,r[o])}function SM(s,t,e){let n=this.cache,i=t.length,r=iu(e,i);Sn(n,r)||(s.uniform1iv(this.addr,r),En(n,r));for(let o=0;o!==i;++o)e.setTexture2DArray(t[o]||Sm,r[o])}function EM(s){switch(s){case 5126:return rM;case 35664:return oM;case 35665:return aM;case 35666:return lM;case 35674:return cM;case 35675:return hM;case 35676:return uM;case 5124:case 35670:return dM;case 35667:case 35671:return fM;case 35668:case 35672:return pM;case 35669:case 35673:return mM;case 5125:return gM;case 36294:return vM;case 36295:return xM;case 36296:return yM;case 35678:case 36198:case 36298:case 36306:case 35682:return _M;case 35679:case 36299:case 36307:return MM;case 35680:case 36300:case 36308:case 36293:return bM;case 36289:case 36303:case 36311:case 36292:return SM}}var pf=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=sM(e.type)}},mf=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=EM(e.type)}},gf=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let i=this.seq;for(let r=0,o=i.length;r!==o;++r){let a=i[r];a.setValue(t,e[a.id],n)}}},uf=/(\w+)(\])?(\[|\.)?/g;function lm(s,t){s.seq.push(t),s.map[t.id]=t}function wM(s,t,e){let n=s.name,i=n.length;for(uf.lastIndex=0;;){let r=uf.exec(n),o=uf.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){lm(e,c===void 0?new pf(a,s,t):new mf(a,s,t));break}else{let u=e.map[a];u===void 0&&(u=new gf(a),lm(e,u)),e=u}}}var Uo=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);wM(a,l,this)}let i=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?i.push(o):r.push(o);i.length>0&&(this.seq=i.concat(r))}setValue(t,e,n,i){let r=this.map[e];r!==void 0&&r.setValue(t,n,i)}setOptional(t,e,n){let i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let r=0,o=e.length;r!==o;++r){let a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,i)}}static seqWithValue(t,e){let n=[];for(let i=0,r=t.length;i!==r;++i){let o=t[i];o.id in e&&n.push(o)}return n}};function cm(s,t,e){let n=s.createShader(t);return s.shaderSource(n,e),s.compileShader(n),n}var TM=37297,RM=0;function AM(s,t){let e=s.split(`
`),n=[],i=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=i;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}var hm=new oe;function CM(s){Me._getMatrix(hm,Me.workingColorSpace,s);let t=`mat3( ${hm.elements.map(e=>e.toFixed(4))} )`;switch(Me.getTransfer(s)){case La:return[t,"LinearTransferOETF"];case Pe:return[t,"sRGBTransferOETF"];default:return Qt("WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function um(s,t,e){let n=s.getShaderParameter(t,s.COMPILE_STATUS),r=(s.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+AM(s.getShaderSource(t),a)}else return r}function PM(s,t){let e=CM(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var IM={[ol]:"Linear",[al]:"Reinhard",[ll]:"Cineon",[Ir]:"ACESFilmic",[hl]:"AgX",[ul]:"Neutral",[cl]:"Custom"};function LM(s,t){let e=IM[t];return e===void 0?(Qt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var tu=new E;function DM(){Me.getLuminanceCoefficients(tu);let s=tu.x.toFixed(4),t=tu.y.toFixed(4),e=tu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function NM(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(bl).join(`
`)}function UM(s){let t=[];for(let e in s){let n=s[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function FM(s,t){let e={},n=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){let r=s.getActiveAttrib(t,i),o=r.name,a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:s.getAttribLocation(t,o),locationSize:a}}return e}function bl(s){return s!==""}function dm(s,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function fm(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var BM=/^[ \t]*#include +<([\w\d./]+)>/gm;function vf(s){return s.replace(BM,HM)}var OM=new Map;function HM(s,t){let e=ye[t];if(e===void 0){let n=OM.get(t);if(n!==void 0)e=ye[n],Qt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return vf(e)}var kM=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function pm(s){return s.replace(kM,zM)}function zM(s,t,e,n){let i="";for(let r=parseInt(t);r<parseInt(e);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function mm(s){let t=`precision ${s.precision} float;
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
#define LOW_PRECISION`),t}var VM={[Cr]:"SHADOWMAP_TYPE_PCF",[Po]:"SHADOWMAP_TYPE_VSM"};function GM(s){return VM[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var WM={[$s]:"ENVMAP_TYPE_CUBE",[Lr]:"ENVMAP_TYPE_CUBE",[dl]:"ENVMAP_TYPE_CUBE_UV"};function qM(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":WM[s.envMapMode]||"ENVMAP_TYPE_CUBE"}var XM={[Lr]:"ENVMAP_MODE_REFRACTION"};function YM(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":XM[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var ZM={[Hd]:"ENVMAP_BLENDING_MULTIPLY",[C0]:"ENVMAP_BLENDING_MIX",[P0]:"ENVMAP_BLENDING_ADD"};function $M(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":ZM[s.combine]||"ENVMAP_BLENDING_NONE"}function KM(s){let t=s.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function JM(s,t,e,n){let i=s.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,l=GM(e),c=qM(e),h=YM(e),u=$M(e),d=KM(e),f=NM(e),m=UM(r),v=i.createProgram(),p,g,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(bl).join(`
`),p.length>0&&(p+=`
`),g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(bl).join(`
`),g.length>0&&(g+=`
`)):(p=[mm(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(bl).join(`
`),g=[mm(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Gi?"#define TONE_MAPPING":"",e.toneMapping!==Gi?ye.tonemapping_pars_fragment:"",e.toneMapping!==Gi?LM("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",ye.colorspace_pars_fragment,PM("linearToOutputTexel",e.outputColorSpace),DM(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(bl).join(`
`)),o=vf(o),o=dm(o,e),o=fm(o,e),a=vf(a),a=dm(a,e),a=fm(a,e),o=pm(o),a=pm(a),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,g=["#define varying in",e.glslVersion===Zd?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Zd?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let _=x+p+o,y=x+g+a,b=cm(i,i.VERTEX_SHADER,_),S=cm(i,i.FRAGMENT_SHADER,y);i.attachShader(v,b),i.attachShader(v,S),e.index0AttributeName!==void 0?i.bindAttribLocation(v,0,e.index0AttributeName):e.hasPositionAttribute===!0&&i.bindAttribLocation(v,0,"position"),i.linkProgram(v);function T(I){if(s.debug.checkShaderErrors){let L=i.getProgramInfoLog(v)||"",k=i.getShaderInfoLog(b)||"",N=i.getShaderInfoLog(S)||"",O=L.trim(),V=k.trim(),q=N.trim(),rt=!0,G=!0;if(i.getProgramParameter(v,i.LINK_STATUS)===!1)if(rt=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,v,b,S);else{let X=um(i,b,"vertex"),Q=um(i,S,"fragment");ne("WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(v,i.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+O+`
`+X+`
`+Q)}else O!==""?Qt("WebGLProgram: Program Info Log:",O):(V===""||q==="")&&(G=!1);G&&(I.diagnostics={runnable:rt,programLog:O,vertexShader:{log:V,prefix:p},fragmentShader:{log:q,prefix:g}})}i.deleteShader(b),i.deleteShader(S),M=new Uo(i,v),R=FM(i,v)}let M;this.getUniforms=function(){return M===void 0&&T(this),M};let R;this.getAttributes=function(){return R===void 0&&T(this),R};let C=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=i.getProgramParameter(v,TM)),C},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=RM++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=b,this.fragmentShader=S,this}var jM=0,xf=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let i=this._getShaderCacheForMaterial(t);return i.has(e)===!1&&(i.add(e),e.usedTimes++),i.has(n)===!1&&(i.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new yf(t),e.set(t,n)),n}},yf=class{constructor(t){this.id=jM++,this.code=t,this.usedTimes=0}};function QM(s){return s===Js||s===xl||s===yl}function tb(s,t,e,n,i,r){let o=new Ua,a=new xf,l=new Set,c=[],h=new Map,u=n.logarithmicDepthBuffer,d=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(M){return l.add(M),M===0?"uv":`uv${M}`}function v(M,R,C,I,L,k){let N=I.fog,O=L.geometry,V=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?I.environment:null,q=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap,rt=t.get(M.envMap||V,q),G=rt&&rt.mapping===dl?rt.image.height:null,X=f[M.type];M.precision!==null&&(d=n.getMaxPrecision(M.precision),d!==M.precision&&Qt("WebGLProgram.getParameters:",M.precision,"not supported, using",d,"instead."));let Q=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,_t=Q!==void 0?Q.length:0,St=0;O.morphAttributes.position!==void 0&&(St=1),O.morphAttributes.normal!==void 0&&(St=2),O.morphAttributes.color!==void 0&&(St=3);let Ht,Vt,ee,J;if(X){let ge=hs[X];Ht=ge.vertexShader,Vt=ge.fragmentShader}else{Ht=M.vertexShader,Vt=M.fragmentShader;let ge=a.getVertexShaderStage(M),fe=a.getFragmentShaderStage(M);a.update(M,ge,fe),ee=ge.id,J=fe.id}let lt=s.getRenderTarget(),wt=s.state.buffers.depth.getReversed(),Xt=L.isInstancedMesh===!0,Ct=L.isBatchedMesh===!0,Kt=!!M.map,me=!!M.matcap,ct=!!rt,yt=!!M.aoMap,bt=!!M.lightMap,Mt=!!M.bumpMap&&M.wireframe===!1,Rt=!!M.normalMap,Jt=!!M.displacementMap,$t=!!M.emissiveMap,jt=!!M.metalnessMap,ie=!!M.roughnessMap,B=M.anisotropy>0,Ce=M.clearcoat>0,_e=M.dispersion>0,P=M.retroreflectivity>0,w=M.iridescence>0,z=M.sheen>0,K=M.transmission>0,it=B&&!!M.anisotropyMap,Et=Ce&&!!M.clearcoatMap,At=Ce&&!!M.clearcoatNormalMap,ot=Ce&&!!M.clearcoatRoughnessMap,dt=w&&!!M.iridescenceMap,Tt=w&&!!M.iridescenceThicknessMap,Gt=z&&!!M.sheenColorMap,F=z&&!!M.sheenRoughnessMap,U=!!M.specularMap,st=!!M.specularColorMap,ht=!!M.specularIntensityMap,gt=K&&!!M.transmissionMap,D=K&&!!M.thicknessMap,j=!!M.gradientMap,W=!!M.alphaMap,pt=M.alphaTest>0,xt=!!M.alphaHash,at=!!M.extensions,Nt=Gi;M.toneMapped&&(lt===null||lt.isXRRenderTarget===!0)&&(Nt=s.toneMapping);let It={shaderID:X,shaderType:M.type,shaderName:M.name,vertexShader:Ht,fragmentShader:Vt,defines:M.defines,customVertexShaderID:ee,customFragmentShaderID:J,isRawShaderMaterial:M.isRawShaderMaterial===!0,glslVersion:M.glslVersion,precision:d,batching:Ct,batchingColor:Ct&&L._colorsTexture!==null,instancing:Xt,instancingColor:Xt&&L.instanceColor!==null,instancingMorph:Xt&&L.morphTexture!==null,outputColorSpace:lt===null?s.outputColorSpace:lt.isXRRenderTarget===!0?lt.texture.colorSpace:Me.workingColorSpace,alphaToCoverage:!!M.alphaToCoverage,map:Kt,matcap:me,envMap:ct,envMapMode:ct&&rt.mapping,envMapCubeUVHeight:G,aoMap:yt,lightMap:bt,bumpMap:Mt,normalMap:Rt,displacementMap:Jt,emissiveMap:$t,normalMapObjectSpace:Rt&&M.normalMapType===D0,normalMapTangentSpace:Rt&&M.normalMapType===Kh,packedNormalMap:Rt&&M.normalMapType===Kh&&QM(M.normalMap.format),metalnessMap:jt,roughnessMap:ie,anisotropy:B,anisotropyMap:it,clearcoat:Ce,clearcoatMap:Et,clearcoatNormalMap:At,clearcoatRoughnessMap:ot,dispersion:_e,retroreflection:P,iridescence:w,iridescenceMap:dt,iridescenceThicknessMap:Tt,sheen:z,sheenColorMap:Gt,sheenRoughnessMap:F,specularMap:U,specularColorMap:st,specularIntensityMap:ht,transmission:K,transmissionMap:gt,thicknessMap:D,gradientMap:j,opaque:M.transparent===!1&&M.blending===Ei&&M.alphaToCoverage===!1,alphaMap:W,alphaTest:pt,alphaHash:xt,combine:M.combine,mapUv:Kt&&m(M.map.channel),aoMapUv:yt&&m(M.aoMap.channel),lightMapUv:bt&&m(M.lightMap.channel),bumpMapUv:Mt&&m(M.bumpMap.channel),normalMapUv:Rt&&m(M.normalMap.channel),displacementMapUv:Jt&&m(M.displacementMap.channel),emissiveMapUv:$t&&m(M.emissiveMap.channel),metalnessMapUv:jt&&m(M.metalnessMap.channel),roughnessMapUv:ie&&m(M.roughnessMap.channel),anisotropyMapUv:it&&m(M.anisotropyMap.channel),clearcoatMapUv:Et&&m(M.clearcoatMap.channel),clearcoatNormalMapUv:At&&m(M.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ot&&m(M.clearcoatRoughnessMap.channel),iridescenceMapUv:dt&&m(M.iridescenceMap.channel),iridescenceThicknessMapUv:Tt&&m(M.iridescenceThicknessMap.channel),sheenColorMapUv:Gt&&m(M.sheenColorMap.channel),sheenRoughnessMapUv:F&&m(M.sheenRoughnessMap.channel),specularMapUv:U&&m(M.specularMap.channel),specularColorMapUv:st&&m(M.specularColorMap.channel),specularIntensityMapUv:ht&&m(M.specularIntensityMap.channel),transmissionMapUv:gt&&m(M.transmissionMap.channel),thicknessMapUv:D&&m(M.thicknessMap.channel),alphaMapUv:W&&m(M.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(Rt||B),vertexNormals:!!O.attributes.normal,vertexColors:M.vertexColors,vertexAlphas:M.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!O.attributes.uv&&(Kt||W),fog:!!N,useFog:M.fog===!0,fogExp2:!!N&&N.isFogExp2,flatShading:M.wireframe===!1&&(M.flatShading===!0||O.attributes.normal===void 0&&Rt===!1&&(M.isMeshLambertMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isMeshPhysicalMaterial)),sizeAttenuation:M.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:wt,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:O.attributes.position!==void 0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:_t,morphTextureStride:St,numSunLights:R.sun.length,numDirLights:R.directional.length,numPointLights:R.point.length,numSpotLights:R.spot.length,numSpotLightMaps:R.spotLightMap.length,numRectAreaLights:R.rectArea.length,numHemiLights:R.hemi.length,numSunLightShadows:R.sunShadowMap.length,numDirLightShadows:R.directionalShadowMap.length,numPointLightShadows:R.pointShadowMap.length,numSpotLightShadows:R.spotShadowMap.length,numSpotLightShadowsWithMaps:R.numSpotLightShadowsWithMaps,numLightProbes:R.numLightProbes,numLightProbeGrids:k.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:M.dithering,shadowMapEnabled:s.shadowMap.enabled&&C.length>0,shadowMapType:s.shadowMap.type,toneMapping:Nt,decodeVideoTexture:Kt&&M.map.isVideoTexture===!0&&Me.getTransfer(M.map.colorSpace)===Pe,decodeVideoTextureEmissive:$t&&M.emissiveMap.isVideoTexture===!0&&Me.getTransfer(M.emissiveMap.colorSpace)===Pe,premultipliedAlpha:M.premultipliedAlpha,doubleSided:M.side===Zt,flipSided:M.side===fn,useDepthPacking:M.depthPacking>=0,depthPacking:M.depthPacking||0,index0AttributeName:M.index0AttributeName,extensionClipCullDistance:at&&M.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(at&&M.extensions.multiDraw===!0||Ct)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:M.customProgramCacheKey()};return It.vertexUv1s=l.has(1),It.vertexUv2s=l.has(2),It.vertexUv3s=l.has(3),l.clear(),It}function p(M){let R=[];if(M.shaderID?R.push(M.shaderID):(R.push(M.customVertexShaderID),R.push(M.customFragmentShaderID)),M.defines!==void 0)for(let C in M.defines)R.push(C),R.push(M.defines[C]);return M.isRawShaderMaterial===!1&&(g(R,M),x(R,M),R.push(s.outputColorSpace)),R.push(M.customProgramCacheKey),R.join()}function g(M,R){M.push(R.precision),M.push(R.outputColorSpace),M.push(R.envMapMode),M.push(R.envMapCubeUVHeight),M.push(R.mapUv),M.push(R.alphaMapUv),M.push(R.lightMapUv),M.push(R.aoMapUv),M.push(R.bumpMapUv),M.push(R.normalMapUv),M.push(R.displacementMapUv),M.push(R.emissiveMapUv),M.push(R.metalnessMapUv),M.push(R.roughnessMapUv),M.push(R.anisotropyMapUv),M.push(R.clearcoatMapUv),M.push(R.clearcoatNormalMapUv),M.push(R.clearcoatRoughnessMapUv),M.push(R.iridescenceMapUv),M.push(R.iridescenceThicknessMapUv),M.push(R.sheenColorMapUv),M.push(R.sheenRoughnessMapUv),M.push(R.specularMapUv),M.push(R.specularColorMapUv),M.push(R.specularIntensityMapUv),M.push(R.transmissionMapUv),M.push(R.thicknessMapUv),M.push(R.combine),M.push(R.fogExp2),M.push(R.sizeAttenuation),M.push(R.morphTargetsCount),M.push(R.morphAttributeCount),M.push(R.numSunLights),M.push(R.numDirLights),M.push(R.numPointLights),M.push(R.numSpotLights),M.push(R.numSpotLightMaps),M.push(R.numHemiLights),M.push(R.numRectAreaLights),M.push(R.numSunLightShadows),M.push(R.numDirLightShadows),M.push(R.numPointLightShadows),M.push(R.numSpotLightShadows),M.push(R.numSpotLightShadowsWithMaps),M.push(R.numLightProbes),M.push(R.shadowMapType),M.push(R.toneMapping),M.push(R.numClippingPlanes),M.push(R.numClipIntersection),M.push(R.depthPacking)}function x(M,R){o.disableAll(),R.instancing&&o.enable(0),R.instancingColor&&o.enable(1),R.instancingMorph&&o.enable(2),R.matcap&&o.enable(3),R.envMap&&o.enable(4),R.normalMapObjectSpace&&o.enable(5),R.normalMapTangentSpace&&o.enable(6),R.clearcoat&&o.enable(7),R.iridescence&&o.enable(8),R.alphaTest&&o.enable(9),R.vertexColors&&o.enable(10),R.vertexAlphas&&o.enable(11),R.vertexUv1s&&o.enable(12),R.vertexUv2s&&o.enable(13),R.vertexUv3s&&o.enable(14),R.vertexTangents&&o.enable(15),R.anisotropy&&o.enable(16),R.alphaHash&&o.enable(17),R.batching&&o.enable(18),R.dispersion&&o.enable(19),R.retroreflection&&o.enable(24),R.batchingColor&&o.enable(20),R.gradientMap&&o.enable(21),R.packedNormalMap&&o.enable(22),R.vertexNormals&&o.enable(23),M.push(o.mask),o.disableAll(),R.fog&&o.enable(0),R.useFog&&o.enable(1),R.flatShading&&o.enable(2),R.logarithmicDepthBuffer&&o.enable(3),R.reversedDepthBuffer&&o.enable(4),R.skinning&&o.enable(5),R.morphTargets&&o.enable(6),R.morphNormals&&o.enable(7),R.morphColors&&o.enable(8),R.premultipliedAlpha&&o.enable(9),R.shadowMapEnabled&&o.enable(10),R.doubleSided&&o.enable(11),R.flipSided&&o.enable(12),R.useDepthPacking&&o.enable(13),R.dithering&&o.enable(14),R.transmission&&o.enable(15),R.sheen&&o.enable(16),R.opaque&&o.enable(17),R.pointsUvs&&o.enable(18),R.decodeVideoTexture&&o.enable(19),R.decodeVideoTextureEmissive&&o.enable(20),R.alphaToCoverage&&o.enable(21),R.numLightProbeGrids>0&&o.enable(22),R.hasPositionAttribute&&o.enable(23),M.push(o.mask)}function _(M){let R=f[M.type],C;if(R){let I=hs[R];C=qi.clone(I.uniforms)}else C=M.uniforms;return C}function y(M,R){let C=h.get(R);return C!==void 0?++C.usedTimes:(C=new JM(s,R,M,i),c.push(C),h.set(R,C)),C}function b(M){if(--M.usedTimes===0){let R=c.indexOf(M);c[R]=c[c.length-1],c.pop(),h.delete(M.cacheKey),M.destroy()}}function S(M){a.remove(M)}function T(){a.dispose()}return{getParameters:v,getProgramCacheKey:p,getUniforms:_,acquireProgram:y,releaseProgram:b,releaseShaderCache:S,programs:c,dispose:T}}function eb(){let s=new WeakMap;function t(o){return s.has(o)}function e(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:r}}function nb(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.materialVariant!==t.materialVariant?s.materialVariant-t.materialVariant:s.z!==t.z?s.z-t.z:s.id-t.id}function gm(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function vm(){let s=[],t=0,e=[],n=[],i=[];function r(){t=0,e.length=0,n.length=0,i.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,m,v,p,g){let x=s[t];return x===void 0?(x={id:d.id,object:d,geometry:f,material:m,materialVariant:o(d),groupOrder:v,renderOrder:d.renderOrder,z:p,group:g},s[t]=x):(x.id=d.id,x.object=d,x.geometry=f,x.material=m,x.materialVariant=o(d),x.groupOrder=v,x.renderOrder=d.renderOrder,x.z=p,x.group=g),t++,x}function l(d,f,m,v,p,g,x){x.reversedDepth===!0&&(p=-p);let _=a(d,f,m,v,p,g);m.transmission>0?n.push(_):m.transparent===!0?i.push(_):e.push(_)}function c(d,f,m,v,p,g){let x=a(d,f,m,v,p,g);m.transmission>0?n.unshift(x):m.transparent===!0?i.unshift(x):e.unshift(x)}function h(d,f){e.length>1&&e.sort(d||nb),n.length>1&&n.sort(f||gm),i.length>1&&i.sort(f||gm)}function u(){for(let d=t,f=s.length;d<f;d++){let m=s[d];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:e,transmissive:n,transparent:i,init:r,push:l,unshift:c,finish:u,sort:h}}function ib(){let s=new WeakMap;function t(n,i){let r=s.get(n),o;return r===void 0?(o=new vm,s.set(n,[o])):i>=r.length?(o=new vm,r.push(o)):o=r[i],o}function e(){s=new WeakMap}return{get:t,dispose:e}}function sb(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new E,color:new mt};break;case"SpotLight":e={position:new E,direction:new E,color:new mt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new E,color:new mt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new E,skyColor:new mt,groundColor:new mt};break;case"RectAreaLight":e={color:new mt,position:new E,halfWidth:new E,halfHeight:new E};break}return s[t.id]=e,e}}}function rb(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new nt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new nt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new nt,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}var ob=0;function ab(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function lb(s){let t=new sb,e=rb(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new E);let i=new E,r=new le,o=new le;function a(c){let h=0,u=0,d=0;for(let L=0;L<9;L++)n.probe[L].set(0,0,0);let f=0,m=0,v=0,p=0,g=0,x=0,_=0,y=0,b=0,S=0,T=0,M=0,R=0,C=0;c.sort(ab);for(let L=0,k=c.length;L<k;L++){let N=c[L],O=N.color,V=N.intensity,q=N.distance,rt=null;if(N.shadow&&N.shadow.map&&(N.shadow.map.texture.format===Js?rt=N.shadow.map.texture:rt=N.shadow.map.depthTexture||N.shadow.map.texture),N.isAmbientLight)h+=O.r*V,u+=O.g*V,d+=O.b*V;else if(N.isLightProbe){for(let G=0;G<9;G++)n.probe[G].addScaledVector(N.sh.coefficients[G],V);C++}else if(N.isSunLight){let G=t.get(N);if(G.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){let X=N.shadow,Q=e.get(N);Q.shadowIntensity=X.intensity,Q.shadowBias=X.bias,Q.shadowNormalBias=X.normalBias,Q.shadowRadius=X.radius,Q.shadowMapSize.copy(X.mapSize).multiply(X.getFrameExtents()),n.sunShadow[m]=Q,n.sunShadowMap[m]=rt;let _t=X.getViewportCount();for(let St=0;St<_t;St++)n.sunShadowMatrix[v+St]=X.getMatrix(St),n.sunShadowCascade[v+St]=X._cascadeData[St];v+=_t,m++}n.sun[f]=G,f++}else if(N.isDirectionalLight){let G=t.get(N);if(G.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){let X=N.shadow,Q=e.get(N);Q.shadowIntensity=X.intensity,Q.shadowBias=X.bias,Q.shadowNormalBias=X.normalBias,Q.shadowRadius=X.radius,Q.shadowMapSize=X.mapSize,n.directionalShadow[p]=Q,n.directionalShadowMap[p]=rt,n.directionalShadowMatrix[p]=N.shadow.matrix,b++}n.directional[p]=G,p++}else if(N.isSpotLight){let G=t.get(N);G.position.setFromMatrixPosition(N.matrixWorld),G.color.copy(O).multiplyScalar(V),G.distance=q,G.coneCos=Math.cos(N.angle),G.penumbraCos=Math.cos(N.angle*(1-N.penumbra)),G.decay=N.decay,n.spot[x]=G;let X=N.shadow;if(N.map&&(n.spotLightMap[M]=N.map,M++,X.updateMatrices(N),N.castShadow&&R++),n.spotLightMatrix[x]=X.matrix,N.castShadow){let Q=e.get(N);Q.shadowIntensity=X.intensity,Q.shadowBias=X.bias,Q.shadowNormalBias=X.normalBias,Q.shadowRadius=X.radius,Q.shadowMapSize=X.mapSize,n.spotShadow[x]=Q,n.spotShadowMap[x]=rt,T++}x++}else if(N.isRectAreaLight){let G=t.get(N);G.color.copy(O).multiplyScalar(V),G.halfWidth.set(N.width*.5,0,0),G.halfHeight.set(0,N.height*.5,0),n.rectArea[_]=G,_++}else if(N.isPointLight){let G=t.get(N);if(G.color.copy(N.color).multiplyScalar(N.intensity),G.distance=N.distance,G.decay=N.decay,N.castShadow){let X=N.shadow,Q=e.get(N);Q.shadowIntensity=X.intensity,Q.shadowBias=X.bias,Q.shadowNormalBias=X.normalBias,Q.shadowRadius=X.radius,Q.shadowMapSize=X.mapSize,Q.shadowCameraNear=X.camera.near,Q.shadowCameraFar=X.camera.far,n.pointShadow[g]=Q,n.pointShadowMap[g]=rt,n.pointShadowMatrix[g]=N.shadow.matrix,S++}n.point[g]=G,g++}else if(N.isHemisphereLight){let G=t.get(N);G.skyColor.copy(N.color).multiplyScalar(V),G.groundColor.copy(N.groundColor).multiplyScalar(V),n.hemi[y]=G,y++}}_>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Pt.LTC_FLOAT_1,n.rectAreaLTC2=Pt.LTC_FLOAT_2):(n.rectAreaLTC1=Pt.LTC_HALF_1,n.rectAreaLTC2=Pt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let I=n.hash;(I.sunLength!==f||I.directionalLength!==p||I.pointLength!==g||I.spotLength!==x||I.rectAreaLength!==_||I.hemiLength!==y||I.numSunShadows!==m||I.numDirectionalShadows!==b||I.numPointShadows!==S||I.numSpotShadows!==T||I.numSpotMaps!==M||I.numLightProbes!==C)&&(n.sun.length=f,n.directional.length=p,n.spot.length=x,n.rectArea.length=_,n.point.length=g,n.hemi.length=y,n.sunShadow.length=m,n.sunShadowMap.length=m,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.directionalShadowMatrix.length=b,n.pointShadow.length=S,n.pointShadowMap.length=S,n.pointShadowMatrix.length=S,n.spotShadow.length=T,n.spotShadowMap.length=T,n.spotLightMatrix.length=T+M-R,n.spotLightMap.length=M,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=C,I.sunLength=f,I.directionalLength=p,I.pointLength=g,I.spotLength=x,I.rectAreaLength=_,I.hemiLength=y,I.numSunShadows=m,I.numDirectionalShadows=b,I.numPointShadows=S,I.numSpotShadows=T,I.numSpotMaps=M,I.numLightProbes=C,n.version=ob++)}function l(c,h){let u=0,d=0,f=0,m=0,v=0,p=0,g=h.matrixWorldInverse;for(let x=0,_=c.length;x<_;x++){let y=c[x];if(y.isSunLight){let b=n.sun[u];b.direction.setFromMatrixPosition(y.matrixWorld),b.direction.transformDirection(g),u++}else if(y.isDirectionalLight){let b=n.directional[d];b.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),b.direction.sub(i),b.direction.transformDirection(g),d++}else if(y.isSpotLight){let b=n.spot[m];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(g),b.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),b.direction.sub(i),b.direction.transformDirection(g),m++}else if(y.isRectAreaLight){let b=n.rectArea[v];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(g),o.identity(),r.copy(y.matrixWorld),r.premultiply(g),o.extractRotation(r),b.halfWidth.set(y.width*.5,0,0),b.halfHeight.set(0,y.height*.5,0),b.halfWidth.applyMatrix4(o),b.halfHeight.applyMatrix4(o),v++}else if(y.isPointLight){let b=n.point[f];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(g),f++}else if(y.isHemisphereLight){let b=n.hemi[p];b.direction.setFromMatrixPosition(y.matrixWorld),b.direction.transformDirection(g),p++}}}return{setup:a,setupView:l,state:n}}function xm(s){let t=new lb(s),e=[],n=[],i=[];function r(d){u.camera=d,e.length=0,n.length=0,i.length=0}function o(d){e.push(d)}function a(d){n.push(d)}function l(d){i.push(d)}function c(){t.setup(e)}function h(d){t.setupView(e,d)}let u={lightsArray:e,shadowsArray:n,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function cb(s){let t=new WeakMap;function e(i,r=0){let o=t.get(i),a;return o===void 0?(a=new xm(s),t.set(i,[a])):r>=o.length?(a=new xm(s),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var hb=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ub=`uniform sampler2D shadow_pass;
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
}`,db=[new E(1,0,0),new E(-1,0,0),new E(0,1,0),new E(0,-1,0),new E(0,0,1),new E(0,0,-1)],fb=[new E(0,-1,0),new E(0,-1,0),new E(0,0,1),new E(0,0,-1),new E(0,-1,0),new E(0,-1,0)],ym=new le,Ml=new E,df=new E;function pb(s,t,e){let n=new _o,i=new nt,r=new nt,o=new Ve,a=new $c,l=new Kc,c={},h=e.maxTextureSize,u={[ls]:fn,[fn]:ls,[Zt]:Zt},d=new te({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new nt},radius:{value:4}},vertexShader:hb,fragmentShader:ub}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let m=new ae;m.setAttribute("position",new ce(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new et(m,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Cr;let g=this.type;this.render=function(S,T,M){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||S.length===0)return;this.type===h0&&(Qt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Cr);let R=s.getRenderTarget(),C=s.getActiveCubeFace(),I=s.getActiveMipmapLevel(),L=s.state;L.setBlending(Si),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let k=g!==this.type;k&&T.traverse(function(N){N.material&&(Array.isArray(N.material)?N.material.forEach(O=>O.needsUpdate=!0):N.material.needsUpdate=!0)});for(let N=0,O=S.length;N<O;N++){let V=S[N],q=V.shadow;if(q===void 0){Qt("WebGLShadowMap:",V,"has no shadow.");continue}if(q.autoUpdate===!1&&q.needsUpdate===!1)continue;i.copy(q.mapSize);let rt=q.getFrameExtents();i.multiply(rt),r.copy(q.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/rt.x),i.x=r.x*rt.x,q.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/rt.y),i.y=r.y*rt.y,q.mapSize.y=r.y));let G=s.state.buffers.depth.getReversed();if(q.camera._reversedDepth=G,q.map===null||k===!0){if(q.map!==null&&(q.map.depthTexture!==null&&(q.map.depthTexture.dispose(),q.map.depthTexture=null),q.map.dispose()),this.type===Po){if(V.isPointLight){Qt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}q.map=new qe(i.x,i.y,{format:Js,type:tn,minFilter:cn,magFilter:cn,generateMipmaps:!1}),q.map.texture.name=V.name+".shadowMap",q.map.depthTexture=new Ws(i.x,i.y,wi),q.map.depthTexture.name=V.name+".shadowMapDepth",q.map.depthTexture.format=ns,q.map.depthTexture.compareFunction=null,q.map.depthTexture.minFilter=en,q.map.depthTexture.magFilter=en}else V.isPointLight?(q.map=new Fo(i.x),q.map.depthTexture=new Wc(i.x,Wi)):(q.map=new qe(i.x,i.y),q.map.depthTexture=new Ws(i.x,i.y,Wi)),q.map.depthTexture.name=V.name+".shadowMap",q.map.depthTexture.format=ns,this.type===Cr?(q.map.depthTexture.compareFunction=G?jh:Jh,q.map.depthTexture.minFilter=cn,q.map.depthTexture.magFilter=cn):(q.map.depthTexture.compareFunction=null,q.map.depthTexture.minFilter=en,q.map.depthTexture.magFilter=en);q.camera.updateProjectionMatrix()}q.map.isWebGLCubeRenderTarget!==!0&&(q.map.width!==i.x||q.map.height!==i.y)&&q.map.setSize(i.x,i.y);let X=q.map.isWebGLCubeRenderTarget?6:q.getViewportCount();V.isPointLight!==!0&&q.updateMatrices(V,M);for(let Q=0;Q<X;Q++){let _t=q.getCamera(Q);if(V.isPointLight){let St=q.camera,Ht=q.matrix,Vt=V.distance||St.far;Vt!==St.far&&(St.far=Vt,St.updateProjectionMatrix()),Ml.setFromMatrixPosition(V.matrixWorld),St.position.copy(Ml),df.copy(St.position),df.add(db[Q]),St.up.copy(fb[Q]),St.lookAt(df),St.updateMatrixWorld(),Ht.makeTranslation(-Ml.x,-Ml.y,-Ml.z),ym.multiplyMatrices(St.projectionMatrix,St.matrixWorldInverse),q._frustum.setFromProjectionMatrix(ym,St.coordinateSystem,St.reversedDepth)}if(q.map.isWebGLCubeRenderTarget)s.setRenderTarget(q.map,Q),s.clear();else{Q===0&&(s.setRenderTarget(q.map),s.clear());let St=q.getViewport(Q);o.set(r.x*St.x,r.y*St.y,r.x*St.z,r.y*St.w),L.viewport(o)}n=q.getFrustum(Q),y(T,M,_t,V,this.type)}q.isPointLightShadow!==!0&&this.type===Po&&x(q,M),q.needsUpdate=!1}g=this.type,p.needsUpdate=!1,s.setRenderTarget(R,C,I)};function x(S,T){let M=t.update(v);d.defines.VSM_SAMPLES!==S.blurSamples&&(d.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null?S.mapPass=new qe(i.x,i.y,{format:Js,type:tn}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),d.uniforms.shadow_pass.value=S.map.depthTexture,d.uniforms.resolution.value.set(S.map.width,S.map.height),d.uniforms.radius.value=S.radius,s.setRenderTarget(S.mapPass),s.clear(),s.renderBufferDirect(T,null,M,d,v,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value.set(S.map.width,S.map.height),f.uniforms.radius.value=S.radius,s.setRenderTarget(S.map),s.clear(),s.renderBufferDirect(T,null,M,f,v,null)}function _(S,T,M,R){let C=null,I=M.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(I!==void 0)C=I;else if(C=M.isPointLight===!0?l:a,s.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0||T.alphaToCoverage===!0){let L=C.uuid,k=T.uuid,N=c[L];N===void 0&&(N={},c[L]=N);let O=N[k];O===void 0&&(O=C.clone(),N[k]=O,T.addEventListener("dispose",b)),C=O}if(C.visible=T.visible,C.wireframe=T.wireframe,R===Po?C.side=T.shadowSide!==null?T.shadowSide:T.side:C.side=T.shadowSide!==null?T.shadowSide:u[T.side],C.alphaMap=T.alphaMap,C.alphaTest=T.alphaToCoverage===!0?.5:T.alphaTest,C.map=T.map,C.clipShadows=T.clipShadows,C.clippingPlanes=T.clippingPlanes,C.clipIntersection=T.clipIntersection,C.displacementMap=T.displacementMap,C.displacementScale=T.displacementScale,C.displacementBias=T.displacementBias,C.wireframeLinewidth=T.wireframeLinewidth,C.linewidth=T.linewidth,M.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let L=s.properties.get(C);L.light=M}return C}function y(S,T,M,R,C){if(S.visible===!1)return;if(S.layers.test(T.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&C===Po)&&(!S.frustumCulled||S.intersectsFrustum(n))){S.modelViewMatrix.multiplyMatrices(M.matrixWorldInverse,S.matrixWorld);let k=t.update(S),N=S.material;if(Array.isArray(N)){let O=k.groups;for(let V=0,q=O.length;V<q;V++){let rt=O[V],G=N[rt.materialIndex];if(G&&G.visible){let X=_(S,G,R,C);S.onBeforeShadow(s,S,T,M,k,X,rt),s.renderBufferDirect(M,null,k,X,S,rt),S.onAfterShadow(s,S,T,M,k,X,rt)}}}else if(N.visible){let O=_(S,N,R,C);S.onBeforeShadow(s,S,T,M,k,O,null),s.renderBufferDirect(M,null,k,O,S,null),S.onAfterShadow(s,S,T,M,k,O,null)}}let L=S.children;for(let k=0,N=L.length;k<N;k++)y(L[k],T,M,R,C)}function b(S){S.target.removeEventListener("dispose",b);for(let M in c){let R=c[M],C=S.target.uuid;C in R&&(R[C].dispose(),delete R[C])}}}function mb(s,t){function e(){let D=!1,j=new Ve,W=null,pt=new Ve(0,0,0,0);return{setMask:function(xt){W!==xt&&!D&&(s.colorMask(xt,xt,xt,xt),W=xt)},setLocked:function(xt){D=xt},setClear:function(xt,at,Nt,It,ge){ge===!0&&(xt*=It,at*=It,Nt*=It),j.set(xt,at,Nt,It),pt.equals(j)===!1&&(s.clearColor(xt,at,Nt,It),pt.copy(j))},reset:function(){D=!1,W=null,pt.set(-1,0,0,0)}}}function n(){let D=!1,j=!1,W=null,pt=null,xt=null;return{setReversed:function(at){if(j!==at){let Nt=t.get("EXT_clip_control");at?Nt.clipControlEXT(Nt.LOWER_LEFT_EXT,Nt.ZERO_TO_ONE_EXT):Nt.clipControlEXT(Nt.LOWER_LEFT_EXT,Nt.NEGATIVE_ONE_TO_ONE_EXT),j=at;let It=xt;xt=null,this.setClear(It)}},getReversed:function(){return j},setTest:function(at){at?lt(s.DEPTH_TEST):wt(s.DEPTH_TEST)},setMask:function(at){W!==at&&!D&&(s.depthMask(at),W=at)},setFunc:function(at){if(j&&(at=W0[at]),pt!==at){switch(at){case Ic:s.depthFunc(s.NEVER);break;case Lc:s.depthFunc(s.ALWAYS);break;case Dc:s.depthFunc(s.LESS);break;case fo:s.depthFunc(s.LEQUAL);break;case Nc:s.depthFunc(s.EQUAL);break;case Uc:s.depthFunc(s.GEQUAL);break;case Fc:s.depthFunc(s.GREATER);break;case Bc:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}pt=at}},setLocked:function(at){D=at},setClear:function(at){xt!==at&&(xt=at,j&&(at=1-at),s.clearDepth(at))},reset:function(){D=!1,W=null,pt=null,xt=null,j=!1}}}function i(){let D=!1,j=null,W=null,pt=null,xt=null,at=null,Nt=null,It=null,ge=null;return{setTest:function(fe){D||(fe?lt(s.STENCIL_TEST):wt(s.STENCIL_TEST))},setMask:function(fe){j!==fe&&!D&&(s.stencilMask(fe),j=fe)},setFunc:function(fe,Mn,he){(W!==fe||pt!==Mn||xt!==he)&&(s.stencilFunc(fe,Mn,he),W=fe,pt=Mn,xt=he)},setOp:function(fe,Mn,he){(at!==fe||Nt!==Mn||It!==he)&&(s.stencilOp(fe,Mn,he),at=fe,Nt=Mn,It=he)},setLocked:function(fe){D=fe},setClear:function(fe){ge!==fe&&(s.clearStencil(fe),ge=fe)},reset:function(){D=!1,j=null,W=null,pt=null,xt=null,at=null,Nt=null,It=null,ge=null}}}let r=new e,o=new n,a=new i,l=new WeakMap,c=new WeakMap,h={},u={},d={},f=new WeakMap,m=[],v=null,p=!1,g=null,x=null,_=null,y=null,b=null,S=null,T=null,M=new mt(0,0,0),R=0,C=!1,I=null,L=null,k=null,N=null,O=null,V=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),q=!1,rt=0,G=s.getParameter(s.VERSION);G.indexOf("WebGL")!==-1?(rt=parseFloat(/^WebGL (\d)/.exec(G)[1]),q=rt>=1):G.indexOf("OpenGL ES")!==-1&&(rt=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),q=rt>=2);let X=null,Q={},_t=s.getParameter(s.SCISSOR_BOX),St=s.getParameter(s.VIEWPORT),Ht=new Ve().fromArray(_t),Vt=new Ve().fromArray(St);function ee(D,j,W,pt){let xt=new Uint8Array(4),at=s.createTexture();s.bindTexture(D,at),s.texParameteri(D,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(D,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Nt=0;Nt<W;Nt++)D===s.TEXTURE_3D||D===s.TEXTURE_2D_ARRAY?s.texImage3D(j,0,s.RGBA,1,1,pt,0,s.RGBA,s.UNSIGNED_BYTE,xt):s.texImage2D(j+Nt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,xt);return at}let J={};J[s.TEXTURE_2D]=ee(s.TEXTURE_2D,s.TEXTURE_2D,1),J[s.TEXTURE_CUBE_MAP]=ee(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[s.TEXTURE_2D_ARRAY]=ee(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),J[s.TEXTURE_3D]=ee(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),lt(s.DEPTH_TEST),o.setFunc(fo),Mt(!1),Rt(Nd),lt(s.CULL_FACE),yt(Si);function lt(D){h[D]!==!0&&(s.enable(D),h[D]=!0)}function wt(D){h[D]!==!1&&(s.disable(D),h[D]=!1)}function Xt(D,j){return d[D]!==j?(s.bindFramebuffer(D,j),d[D]=j,D===s.DRAW_FRAMEBUFFER&&(d[s.FRAMEBUFFER]=j),D===s.FRAMEBUFFER&&(d[s.DRAW_FRAMEBUFFER]=j),!0):!1}function Ct(D,j){let W=m,pt=!1;if(D){W=f.get(j),W===void 0&&(W=[],f.set(j,W));let xt=D.textures;if(W.length!==xt.length||W[0]!==s.COLOR_ATTACHMENT0){for(let at=0,Nt=xt.length;at<Nt;at++)W[at]=s.COLOR_ATTACHMENT0+at;W.length=xt.length,pt=!0}}else W[0]!==s.BACK&&(W[0]=s.BACK,pt=!0);pt&&s.drawBuffers(W)}function Kt(D){return v!==D?(s.useProgram(D),v=D,!0):!1}let me={[Pr]:s.FUNC_ADD,[d0]:s.FUNC_SUBTRACT,[f0]:s.FUNC_REVERSE_SUBTRACT};me[p0]=s.MIN,me[m0]=s.MAX;let ct={[g0]:s.ZERO,[v0]:s.ONE,[x0]:s.SRC_COLOR,[Bd]:s.SRC_ALPHA,[E0]:s.SRC_ALPHA_SATURATE,[b0]:s.DST_COLOR,[_0]:s.DST_ALPHA,[y0]:s.ONE_MINUS_SRC_COLOR,[Od]:s.ONE_MINUS_SRC_ALPHA,[S0]:s.ONE_MINUS_DST_COLOR,[M0]:s.ONE_MINUS_DST_ALPHA,[w0]:s.CONSTANT_COLOR,[T0]:s.ONE_MINUS_CONSTANT_COLOR,[R0]:s.CONSTANT_ALPHA,[A0]:s.ONE_MINUS_CONSTANT_ALPHA};function yt(D,j,W,pt,xt,at,Nt,It,ge,fe){if(D===Si){p===!0&&(wt(s.BLEND),p=!1);return}if(p===!1&&(lt(s.BLEND),p=!0),D!==u0){if(D!==g||fe!==C){if((x!==Pr||b!==Pr)&&(s.blendEquation(s.FUNC_ADD),x=Pr,b=Pr),fe)switch(D){case Ei:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case de:s.blendFunc(s.ONE,s.ONE);break;case Ud:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Fd:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:ne("WebGLState: Invalid blending: ",D);break}else switch(D){case Ei:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case de:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case Ud:ne("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Fd:ne("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ne("WebGLState: Invalid blending: ",D);break}_=null,y=null,S=null,T=null,M.set(0,0,0),R=0,g=D,C=fe}return}xt=xt||j,at=at||W,Nt=Nt||pt,(j!==x||xt!==b)&&(s.blendEquationSeparate(me[j],me[xt]),x=j,b=xt),(W!==_||pt!==y||at!==S||Nt!==T)&&(s.blendFuncSeparate(ct[W],ct[pt],ct[at],ct[Nt]),_=W,y=pt,S=at,T=Nt),(It.equals(M)===!1||ge!==R)&&(s.blendColor(It.r,It.g,It.b,ge),M.copy(It),R=ge),g=D,C=!1}function bt(D,j){D.side===Zt?wt(s.CULL_FACE):lt(s.CULL_FACE);let W=D.side===fn;j&&(W=!W),Mt(W),D.blending===Ei&&D.transparent===!1?yt(Si):yt(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),o.setFunc(D.depthFunc),o.setTest(D.depthTest),o.setMask(D.depthWrite),r.setMask(D.colorWrite);let pt=D.stencilWrite;a.setTest(pt),pt&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),$t(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?lt(s.SAMPLE_ALPHA_TO_COVERAGE):wt(s.SAMPLE_ALPHA_TO_COVERAGE)}function Mt(D){I!==D&&(D?s.frontFace(s.CW):s.frontFace(s.CCW),I=D)}function Rt(D){D!==l0?(lt(s.CULL_FACE),D!==L&&(D===Nd?s.cullFace(s.BACK):D===c0?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):wt(s.CULL_FACE),L=D}function Jt(D){D!==k&&(q&&s.lineWidth(D),k=D)}function $t(D,j,W){D?(lt(s.POLYGON_OFFSET_FILL),(N!==j||O!==W)&&(N=j,O=W,o.getReversed()&&(j=-j),s.polygonOffset(j,W))):wt(s.POLYGON_OFFSET_FILL)}function jt(D){D?lt(s.SCISSOR_TEST):wt(s.SCISSOR_TEST)}function ie(D){D===void 0&&(D=s.TEXTURE0+V-1),X!==D&&(s.activeTexture(D),X=D)}function B(D,j,W){W===void 0&&(X===null?W=s.TEXTURE0+V-1:W=X);let pt=Q[W];pt===void 0&&(pt={type:void 0,texture:void 0},Q[W]=pt),(pt.type!==D||pt.texture!==j)&&(X!==W&&(s.activeTexture(W),X=W),s.bindTexture(D,j||J[D]),pt.type=D,pt.texture=j)}function Ce(){let D=Q[X];D!==void 0&&D.type!==void 0&&(s.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function _e(){try{s.compressedTexImage2D(...arguments)}catch(D){ne("WebGLState:",D)}}function P(){try{s.compressedTexImage3D(...arguments)}catch(D){ne("WebGLState:",D)}}function w(){try{s.texSubImage2D(...arguments)}catch(D){ne("WebGLState:",D)}}function z(){try{s.texSubImage3D(...arguments)}catch(D){ne("WebGLState:",D)}}function K(){try{s.compressedTexSubImage2D(...arguments)}catch(D){ne("WebGLState:",D)}}function it(){try{s.compressedTexSubImage3D(...arguments)}catch(D){ne("WebGLState:",D)}}function Et(){try{s.texStorage2D(...arguments)}catch(D){ne("WebGLState:",D)}}function At(){try{s.texStorage3D(...arguments)}catch(D){ne("WebGLState:",D)}}function ot(){try{s.texImage2D(...arguments)}catch(D){ne("WebGLState:",D)}}function dt(){try{s.texImage3D(...arguments)}catch(D){ne("WebGLState:",D)}}function Tt(D){return u[D]!==void 0?u[D]:s.getParameter(D)}function Gt(D,j){u[D]!==j&&(s.pixelStorei(D,j),u[D]=j)}function F(D){Ht.equals(D)===!1&&(s.scissor(D.x,D.y,D.z,D.w),Ht.copy(D))}function U(D){Vt.equals(D)===!1&&(s.viewport(D.x,D.y,D.z,D.w),Vt.copy(D))}function st(D,j){let W=c.get(j);W===void 0&&(W=new WeakMap,c.set(j,W));let pt=W.get(D);pt===void 0&&(pt=s.getUniformBlockIndex(j,D.name),W.set(D,pt))}function ht(D,j){let pt=c.get(j).get(D);l.get(j)!==pt&&(s.uniformBlockBinding(j,pt,D.__bindingPointIndex),l.set(j,pt))}function gt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),h={},u={},X=null,Q={},d={},f=new WeakMap,m=[],v=null,p=!1,g=null,x=null,_=null,y=null,b=null,S=null,T=null,M=new mt(0,0,0),R=0,C=!1,I=null,L=null,k=null,N=null,O=null,Ht.set(0,0,s.canvas.width,s.canvas.height),Vt.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:lt,disable:wt,bindFramebuffer:Xt,drawBuffers:Ct,useProgram:Kt,setBlending:yt,setMaterial:bt,setFlipSided:Mt,setCullFace:Rt,setLineWidth:Jt,setPolygonOffset:$t,setScissorTest:jt,activeTexture:ie,bindTexture:B,unbindTexture:Ce,compressedTexImage2D:_e,compressedTexImage3D:P,texImage2D:ot,texImage3D:dt,pixelStorei:Gt,getParameter:Tt,updateUBOMapping:st,uniformBlockBinding:ht,texStorage2D:Et,texStorage3D:At,texSubImage2D:w,texSubImage3D:z,compressedTexSubImage2D:K,compressedTexSubImage3D:it,scissor:F,viewport:U,reset:gt}}function gb(s,t,e,n,i,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new nt,h=new WeakMap,u=new Set,d,f=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(P,w){return m?new OffscreenCanvas(P,w):Da("canvas")}function p(P,w,z){let K=1,it=_e(P);if((it.width>z||it.height>z)&&(K=z/Math.max(it.width,it.height)),K<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){let Et=Math.floor(K*it.width),At=Math.floor(K*it.height);d===void 0&&(d=v(Et,At));let ot=w?v(Et,At):d;return ot.width=Et,ot.height=At,ot.getContext("2d").drawImage(P,0,0,Et,At),Qt("WebGLRenderer: Texture has been resized from ("+it.width+"x"+it.height+") to ("+Et+"x"+At+")."),ot}else return"data"in P&&Qt("WebGLRenderer: Image in DataTexture is too big ("+it.width+"x"+it.height+")."),P;return P}function g(P){return P.generateMipmaps}function x(P){s.generateMipmap(P)}function _(P){return P.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?s.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function y(P,w,z,K,it,Et=!1){if(P!==null){if(s[P]!==void 0)return s[P];Qt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let At;K&&(At=t.get("EXT_texture_norm16"),At||Qt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ot=w;if(w===s.RED&&(z===s.FLOAT&&(ot=s.R32F),z===s.HALF_FLOAT&&(ot=s.R16F),z===s.UNSIGNED_BYTE&&(ot=s.R8),z===s.UNSIGNED_SHORT&&At&&(ot=At.R16_EXT),z===s.SHORT&&At&&(ot=At.R16_SNORM_EXT)),w===s.RED_INTEGER&&(z===s.UNSIGNED_BYTE&&(ot=s.R8UI),z===s.UNSIGNED_SHORT&&(ot=s.R16UI),z===s.UNSIGNED_INT&&(ot=s.R32UI),z===s.BYTE&&(ot=s.R8I),z===s.SHORT&&(ot=s.R16I),z===s.INT&&(ot=s.R32I)),w===s.RG&&(z===s.FLOAT&&(ot=s.RG32F),z===s.HALF_FLOAT&&(ot=s.RG16F),z===s.UNSIGNED_BYTE&&(ot=s.RG8),z===s.UNSIGNED_SHORT&&At&&(ot=At.RG16_EXT),z===s.SHORT&&At&&(ot=At.RG16_SNORM_EXT)),w===s.RG_INTEGER&&(z===s.UNSIGNED_BYTE&&(ot=s.RG8UI),z===s.UNSIGNED_SHORT&&(ot=s.RG16UI),z===s.UNSIGNED_INT&&(ot=s.RG32UI),z===s.BYTE&&(ot=s.RG8I),z===s.SHORT&&(ot=s.RG16I),z===s.INT&&(ot=s.RG32I)),w===s.RGB_INTEGER&&(z===s.UNSIGNED_BYTE&&(ot=s.RGB8UI),z===s.UNSIGNED_SHORT&&(ot=s.RGB16UI),z===s.UNSIGNED_INT&&(ot=s.RGB32UI),z===s.BYTE&&(ot=s.RGB8I),z===s.SHORT&&(ot=s.RGB16I),z===s.INT&&(ot=s.RGB32I)),w===s.RGBA_INTEGER&&(z===s.UNSIGNED_BYTE&&(ot=s.RGBA8UI),z===s.UNSIGNED_SHORT&&(ot=s.RGBA16UI),z===s.UNSIGNED_INT&&(ot=s.RGBA32UI),z===s.BYTE&&(ot=s.RGBA8I),z===s.SHORT&&(ot=s.RGBA16I),z===s.INT&&(ot=s.RGBA32I)),w===s.RGB&&(z===s.UNSIGNED_SHORT&&At&&(ot=At.RGB16_EXT),z===s.SHORT&&At&&(ot=At.RGB16_SNORM_EXT),z===s.UNSIGNED_INT_5_9_9_9_REV&&(ot=s.RGB9_E5),z===s.UNSIGNED_INT_10F_11F_11F_REV&&(ot=s.R11F_G11F_B10F)),w===s.RGBA){let dt=Et?La:Me.getTransfer(it);z===s.FLOAT&&(ot=s.RGBA32F),z===s.HALF_FLOAT&&(ot=s.RGBA16F),z===s.UNSIGNED_BYTE&&(ot=dt===Pe?s.SRGB8_ALPHA8:s.RGBA8),z===s.UNSIGNED_SHORT&&At&&(ot=At.RGBA16_EXT),z===s.SHORT&&At&&(ot=At.RGBA16_SNORM_EXT),z===s.UNSIGNED_SHORT_4_4_4_4&&(ot=s.RGBA4),z===s.UNSIGNED_SHORT_5_5_5_1&&(ot=s.RGB5_A1)}return(ot===s.R16F||ot===s.R32F||ot===s.RG16F||ot===s.RG32F||ot===s.RGBA16F||ot===s.RGBA32F)&&t.get("EXT_color_buffer_float"),ot}function b(P,w){let z;return P?w===null||w===Wi||w===Lo?z=s.DEPTH24_STENCIL8:w===wi?z=s.DEPTH32F_STENCIL8:w===Io&&(z=s.DEPTH24_STENCIL8,Qt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===Wi||w===Lo?z=s.DEPTH_COMPONENT24:w===wi?z=s.DEPTH_COMPONENT32F:w===Io&&(z=s.DEPTH_COMPONENT16),z}function S(P,w){return g(P)===!0||P.isFramebufferTexture&&P.minFilter!==en&&P.minFilter!==cn?Math.log2(Math.max(w.width,w.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?w.mipmaps.length:1}function T(P){let w=P.target;w.removeEventListener("dispose",T),R(w),w.isVideoTexture&&h.delete(w),w.isHTMLTexture&&u.delete(w)}function M(P){let w=P.target;w.removeEventListener("dispose",M),I(w)}function R(P){let w=n.get(P);if(w.__webglInit===void 0)return;let z=P.source,K=f.get(z);if(K){let it=K[w.__cacheKey];it.usedTimes--,it.usedTimes===0&&C(P),Object.keys(K).length===0&&f.delete(z)}n.remove(P)}function C(P){let w=n.get(P);s.deleteTexture(w.__webglTexture);let z=P.source,K=f.get(z);delete K[w.__cacheKey],o.memory.textures--}function I(P){let w=n.get(P);if(P.depthTexture&&(P.depthTexture.dispose(),n.remove(P.depthTexture)),P.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(w.__webglFramebuffer[K]))for(let it=0;it<w.__webglFramebuffer[K].length;it++)s.deleteFramebuffer(w.__webglFramebuffer[K][it]);else s.deleteFramebuffer(w.__webglFramebuffer[K]);w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer[K])}else{if(Array.isArray(w.__webglFramebuffer))for(let K=0;K<w.__webglFramebuffer.length;K++)s.deleteFramebuffer(w.__webglFramebuffer[K]);else s.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&s.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let K=0;K<w.__webglColorRenderbuffer.length;K++)w.__webglColorRenderbuffer[K]&&s.deleteRenderbuffer(w.__webglColorRenderbuffer[K]);w.__webglDepthRenderbuffer&&s.deleteRenderbuffer(w.__webglDepthRenderbuffer)}let z=P.textures;for(let K=0,it=z.length;K<it;K++){let Et=n.get(z[K]);Et.__webglTexture&&(s.deleteTexture(Et.__webglTexture),o.memory.textures--),n.remove(z[K])}n.remove(P)}let L=0;function k(){L=0}function N(){return L}function O(P){L=P}function V(){let P=L;return P>=i.maxTextures&&Qt("WebGLTextures: Trying to use "+(P+1)+" texture units while this GPU supports only "+i.maxTextures),L+=1,P}function q(P){let w=[];return w.push(P.wrapS),w.push(P.wrapT),w.push(P.wrapR||0),w.push(P.magFilter),w.push(P.minFilter),w.push(P.anisotropy),w.push(P.internalFormat),w.push(P.format),w.push(P.type),w.push(P.generateMipmaps),w.push(P.premultiplyAlpha),w.push(P.flipY),w.push(P.unpackAlignment),w.push(P.colorSpace),w.join()}function rt(P,w){let z=n.get(P);if(P.isVideoTexture&&B(P),P.isRenderTargetTexture===!1&&P.isExternalTexture!==!0&&P.version>0&&z.__version!==P.version){let K=P.image;if(K===null)Qt("WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)Qt("WebGLRenderer: Texture marked for update but image is incomplete");else{wt(z,P,w);return}}else P.isExternalTexture&&(z.__webglTexture=P.sourceTexture?P.sourceTexture:null);e.bindTexture(s.TEXTURE_2D,z.__webglTexture,s.TEXTURE0+w)}function G(P,w){let z=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&z.__version!==P.version){wt(z,P,w);return}else P.isExternalTexture&&(z.__webglTexture=P.sourceTexture?P.sourceTexture:null);e.bindTexture(s.TEXTURE_2D_ARRAY,z.__webglTexture,s.TEXTURE0+w)}function X(P,w){let z=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&z.__version!==P.version){wt(z,P,w);return}e.bindTexture(s.TEXTURE_3D,z.__webglTexture,s.TEXTURE0+w)}function Q(P,w){let z=n.get(P);if(P.isCubeDepthTexture!==!0&&P.version>0&&z.__version!==P.version){Xt(z,P,w);return}e.bindTexture(s.TEXTURE_CUBE_MAP,z.__webglTexture,s.TEXTURE0+w)}let _t={[bn]:s.REPEAT,[Qi]:s.CLAMP_TO_EDGE,[Oc]:s.MIRRORED_REPEAT},St={[en]:s.NEAREST,[I0]:s.NEAREST_MIPMAP_NEAREST,[fl]:s.NEAREST_MIPMAP_LINEAR,[cn]:s.LINEAR,[dh]:s.LINEAR_MIPMAP_NEAREST,[ti]:s.LINEAR_MIPMAP_LINEAR},Ht={[U0]:s.NEVER,[k0]:s.ALWAYS,[F0]:s.LESS,[Jh]:s.LEQUAL,[B0]:s.EQUAL,[jh]:s.GEQUAL,[O0]:s.GREATER,[H0]:s.NOTEQUAL};function Vt(P,w){if(w.type===wi&&t.has("OES_texture_float_linear")===!1&&(w.magFilter===cn||w.magFilter===dh||w.magFilter===fl||w.magFilter===ti||w.minFilter===cn||w.minFilter===dh||w.minFilter===fl||w.minFilter===ti)&&Qt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(P,s.TEXTURE_WRAP_S,_t[w.wrapS]),s.texParameteri(P,s.TEXTURE_WRAP_T,_t[w.wrapT]),(P===s.TEXTURE_3D||P===s.TEXTURE_2D_ARRAY)&&s.texParameteri(P,s.TEXTURE_WRAP_R,_t[w.wrapR]),s.texParameteri(P,s.TEXTURE_MAG_FILTER,St[w.magFilter]),s.texParameteri(P,s.TEXTURE_MIN_FILTER,St[w.minFilter]),w.compareFunction&&(s.texParameteri(P,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(P,s.TEXTURE_COMPARE_FUNC,Ht[w.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===en||w.minFilter!==fl&&w.minFilter!==ti||w.type===wi&&t.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||n.get(w).__currentAnisotropy){let z=t.get("EXT_texture_filter_anisotropic");s.texParameterf(P,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,i.getMaxAnisotropy())),n.get(w).__currentAnisotropy=w.anisotropy}}}function ee(P,w){let z=!1;P.__webglInit===void 0&&(P.__webglInit=!0,w.addEventListener("dispose",T));let K=w.source,it=f.get(K);it===void 0&&(it={},f.set(K,it));let Et=q(w);if(Et!==P.__cacheKey){it[Et]===void 0&&(it[Et]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,z=!0),it[Et].usedTimes++;let At=it[P.__cacheKey];At!==void 0&&(it[P.__cacheKey].usedTimes--,At.usedTimes===0&&C(w)),P.__cacheKey=Et,P.__webglTexture=it[Et].texture}return z}function J(P,w,z){return Math.floor(Math.floor(P/z)/w)}function lt(P,w,z,K){let Et=P.updateRanges;if(Et.length===0)e.texSubImage2D(s.TEXTURE_2D,0,0,0,w.width,w.height,z,K,w.data);else{Et.sort((Gt,F)=>Gt.start-F.start);let At=0;for(let Gt=1;Gt<Et.length;Gt++){let F=Et[At],U=Et[Gt],st=F.start+F.count,ht=J(U.start,w.width,4),gt=J(F.start,w.width,4);U.start<=st+1&&ht===gt&&J(U.start+U.count-1,w.width,4)===ht?F.count=Math.max(F.count,U.start+U.count-F.start):(++At,Et[At]=U)}Et.length=At+1;let ot=e.getParameter(s.UNPACK_ROW_LENGTH),dt=e.getParameter(s.UNPACK_SKIP_PIXELS),Tt=e.getParameter(s.UNPACK_SKIP_ROWS);e.pixelStorei(s.UNPACK_ROW_LENGTH,w.width);for(let Gt=0,F=Et.length;Gt<F;Gt++){let U=Et[Gt],st=Math.floor(U.start/4),ht=Math.ceil(U.count/4),gt=st%w.width,D=Math.floor(st/w.width),j=ht,W=1;e.pixelStorei(s.UNPACK_SKIP_PIXELS,gt),e.pixelStorei(s.UNPACK_SKIP_ROWS,D),e.texSubImage2D(s.TEXTURE_2D,0,gt,D,j,W,z,K,w.data)}P.clearUpdateRanges(),e.pixelStorei(s.UNPACK_ROW_LENGTH,ot),e.pixelStorei(s.UNPACK_SKIP_PIXELS,dt),e.pixelStorei(s.UNPACK_SKIP_ROWS,Tt)}}function wt(P,w,z){let K=s.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(K=s.TEXTURE_2D_ARRAY),w.isData3DTexture&&(K=s.TEXTURE_3D);let it=ee(P,w),Et=w.source;e.bindTexture(K,P.__webglTexture,s.TEXTURE0+z);let At=n.get(Et);if(Et.version!==At.__version||it===!0){if(e.activeTexture(s.TEXTURE0+z),(typeof ImageBitmap<"u"&&w.image instanceof ImageBitmap)===!1){let W=Me.getPrimaries(Me.workingColorSpace),pt=w.colorSpace===Cs?null:Me.getPrimaries(w.colorSpace),xt=w.colorSpace===Cs||W===pt?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,xt)}e.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment);let dt=p(w.image,!1,i.maxTextureSize);dt=Ce(w,dt);let Tt=r.convert(w.format,w.colorSpace),Gt=r.convert(w.type),F=y(w.internalFormat,Tt,Gt,w.normalized,w.colorSpace,w.isVideoTexture);Vt(K,w);let U,st=w.mipmaps,ht=w.isVideoTexture!==!0,gt=At.__version===void 0||it===!0,D=Et.dataReady,j=S(w,dt);if(w.isDepthTexture)F=b(w.format===Ks,w.type),gt&&(ht?e.texStorage2D(s.TEXTURE_2D,1,F,dt.width,dt.height):e.texImage2D(s.TEXTURE_2D,0,F,dt.width,dt.height,0,Tt,Gt,null));else if(w.isDataTexture)if(st.length>0){ht&&gt&&e.texStorage2D(s.TEXTURE_2D,j,F,st[0].width,st[0].height);for(let W=0,pt=st.length;W<pt;W++)U=st[W],ht?D&&e.texSubImage2D(s.TEXTURE_2D,W,0,0,U.width,U.height,Tt,Gt,U.data):e.texImage2D(s.TEXTURE_2D,W,F,U.width,U.height,0,Tt,Gt,U.data);w.generateMipmaps=!1}else ht?(gt&&e.texStorage2D(s.TEXTURE_2D,j,F,dt.width,dt.height),D&&lt(w,dt,Tt,Gt)):e.texImage2D(s.TEXTURE_2D,0,F,dt.width,dt.height,0,Tt,Gt,dt.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){ht&&gt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,j,F,st[0].width,st[0].height,dt.depth);for(let W=0,pt=st.length;W<pt;W++)if(U=st[W],w.format!==Ti)if(Tt!==null)if(ht){if(D)if(w.layerUpdates.size>0){let xt=tf(U.width,U.height,w.format,w.type);for(let at of w.layerUpdates){let Nt=U.data.subarray(at*xt/U.data.BYTES_PER_ELEMENT,(at+1)*xt/U.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,W,0,0,at,U.width,U.height,1,Tt,Nt)}}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,W,0,0,0,U.width,U.height,dt.depth,Tt,U.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,W,F,U.width,U.height,dt.depth,0,U.data,0,0);else Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ht?D&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,W,0,0,0,U.width,U.height,dt.depth,Tt,Gt,U.data):e.texImage3D(s.TEXTURE_2D_ARRAY,W,F,U.width,U.height,dt.depth,0,Tt,Gt,U.data);w.layerUpdates.size>0&&w.clearLayerUpdates()}else{ht&&gt&&e.texStorage2D(s.TEXTURE_2D,j,F,st[0].width,st[0].height);for(let W=0,pt=st.length;W<pt;W++)U=st[W],w.format!==Ti?Tt!==null?ht?D&&e.compressedTexSubImage2D(s.TEXTURE_2D,W,0,0,U.width,U.height,Tt,U.data):e.compressedTexImage2D(s.TEXTURE_2D,W,F,U.width,U.height,0,U.data):Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ht?D&&e.texSubImage2D(s.TEXTURE_2D,W,0,0,U.width,U.height,Tt,Gt,U.data):e.texImage2D(s.TEXTURE_2D,W,F,U.width,U.height,0,Tt,Gt,U.data)}else if(w.isDataArrayTexture)if(ht){if(gt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,j,F,dt.width,dt.height,dt.depth),D)if(w.layerUpdates.size>0){let W=tf(dt.width,dt.height,w.format,w.type);for(let pt of w.layerUpdates){let xt=dt.data.subarray(pt*W/dt.data.BYTES_PER_ELEMENT,(pt+1)*W/dt.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,pt,dt.width,dt.height,1,Tt,Gt,xt)}w.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,dt.width,dt.height,dt.depth,Tt,Gt,dt.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,F,dt.width,dt.height,dt.depth,0,Tt,Gt,dt.data);else if(w.isData3DTexture)ht?(gt&&e.texStorage3D(s.TEXTURE_3D,j,F,dt.width,dt.height,dt.depth),D&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,dt.width,dt.height,dt.depth,Tt,Gt,dt.data)):e.texImage3D(s.TEXTURE_3D,0,F,dt.width,dt.height,dt.depth,0,Tt,Gt,dt.data);else if(w.isFramebufferTexture){if(gt)if(ht)e.texStorage2D(s.TEXTURE_2D,j,F,dt.width,dt.height);else{let W=dt.width,pt=dt.height;for(let xt=0;xt<j;xt++)e.texImage2D(s.TEXTURE_2D,xt,F,W,pt,0,Tt,Gt,null),W>>=1,pt>>=1}}else if(w.isHTMLTexture){if("texElementImage2D"in s){let W=s.canvas;if(W.hasAttribute("layoutsubtree")||W.setAttribute("layoutsubtree","true"),dt.parentNode!==W){W.appendChild(dt),u.add(w),W.onpaint=pt=>{let xt=pt.changedElements;for(let at of u)xt.includes(at.image)&&(at.needsUpdate=!0)},W.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,dt);else{let xt=s.RGBA,at=s.RGBA,Nt=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,xt,at,Nt,dt)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(st.length>0){if(ht&&gt){let W=_e(st[0]);e.texStorage2D(s.TEXTURE_2D,j,F,W.width,W.height)}for(let W=0,pt=st.length;W<pt;W++)U=st[W],ht?D&&e.texSubImage2D(s.TEXTURE_2D,W,0,0,Tt,Gt,U):e.texImage2D(s.TEXTURE_2D,W,F,Tt,Gt,U);w.generateMipmaps=!1}else if(ht){if(gt){let W=_e(dt);e.texStorage2D(s.TEXTURE_2D,j,F,W.width,W.height)}D&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,Tt,Gt,dt)}else e.texImage2D(s.TEXTURE_2D,0,F,Tt,Gt,dt);g(w)&&x(K),At.__version=Et.version,w.onUpdate&&w.onUpdate(w)}P.__version=w.version}function Xt(P,w,z){if(w.image.length!==6)return;let K=ee(P,w),it=w.source;e.bindTexture(s.TEXTURE_CUBE_MAP,P.__webglTexture,s.TEXTURE0+z);let Et=n.get(it);if(it.version!==Et.__version||K===!0){e.activeTexture(s.TEXTURE0+z);let At=Me.getPrimaries(Me.workingColorSpace),ot=w.colorSpace===Cs?null:Me.getPrimaries(w.colorSpace),dt=w.colorSpace===Cs||At===ot?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),e.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,dt);let Tt=w.isCompressedTexture||w.image[0].isCompressedTexture,Gt=w.image[0]&&w.image[0].isDataTexture,F=[];for(let at=0;at<6;at++)!Tt&&!Gt?F[at]=p(w.image[at],!0,i.maxCubemapSize):F[at]=Gt?w.image[at].image:w.image[at],F[at]=Ce(w,F[at]);let U=F[0],st=r.convert(w.format,w.colorSpace),ht=r.convert(w.type),gt=y(w.internalFormat,st,ht,w.normalized,w.colorSpace),D=w.isVideoTexture!==!0,j=Et.__version===void 0||K===!0,W=it.dataReady,pt=S(w,U);Vt(s.TEXTURE_CUBE_MAP,w);let xt;if(Tt){D&&j&&e.texStorage2D(s.TEXTURE_CUBE_MAP,pt,gt,U.width,U.height);for(let at=0;at<6;at++){xt=F[at].mipmaps;for(let Nt=0;Nt<xt.length;Nt++){let It=xt[Nt];w.format!==Ti?st!==null?D?W&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt,0,0,It.width,It.height,st,It.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt,gt,It.width,It.height,0,It.data):Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?W&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt,0,0,It.width,It.height,st,ht,It.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt,gt,It.width,It.height,0,st,ht,It.data)}}}else{if(xt=w.mipmaps,D&&j){xt.length>0&&pt++;let at=_e(F[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,pt,gt,at.width,at.height)}for(let at=0;at<6;at++)if(Gt){D?W&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,F[at].width,F[at].height,st,ht,F[at].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,gt,F[at].width,F[at].height,0,st,ht,F[at].data);for(let Nt=0;Nt<xt.length;Nt++){let ge=xt[Nt].image[at].image;D?W&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt+1,0,0,ge.width,ge.height,st,ht,ge.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt+1,gt,ge.width,ge.height,0,st,ht,ge.data)}}else{D?W&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,st,ht,F[at]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,gt,st,ht,F[at]);for(let Nt=0;Nt<xt.length;Nt++){let It=xt[Nt];D?W&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt+1,0,0,st,ht,It.image[at]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Nt+1,gt,st,ht,It.image[at])}}}g(w)&&x(s.TEXTURE_CUBE_MAP),Et.__version=it.version,w.onUpdate&&w.onUpdate(w)}P.__version=w.version}function Ct(P,w,z,K,it,Et){let At=r.convert(z.format,z.colorSpace),ot=r.convert(z.type),dt=y(z.internalFormat,At,ot,z.normalized,z.colorSpace),Tt=n.get(w),Gt=n.get(z);if(Gt.__renderTarget=w,!Tt.__hasExternalTextures){let F=Math.max(1,w.width>>Et),U=Math.max(1,w.height>>Et);it===s.TEXTURE_3D||it===s.TEXTURE_2D_ARRAY?e.texImage3D(it,Et,dt,F,U,w.depth,0,At,ot,null):e.texImage2D(it,Et,dt,F,U,0,At,ot,null)}e.bindFramebuffer(s.FRAMEBUFFER,P),ie(w)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,K,it,Gt.__webglTexture,0,jt(w)):(it===s.TEXTURE_2D||it>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&it<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,K,it,Gt.__webglTexture,Et),e.bindFramebuffer(s.FRAMEBUFFER,null)}function Kt(P,w,z){if(s.bindRenderbuffer(s.RENDERBUFFER,P),w.depthBuffer){let K=w.depthTexture,it=K&&K.isDepthTexture?K.type:null,Et=b(w.stencilBuffer,it),At=w.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;ie(w)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,jt(w),Et,w.width,w.height):z?s.renderbufferStorageMultisample(s.RENDERBUFFER,jt(w),Et,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,Et,w.width,w.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,At,s.RENDERBUFFER,P)}else{let K=w.textures;for(let it=0;it<K.length;it++){let Et=K[it],At=r.convert(Et.format,Et.colorSpace),ot=r.convert(Et.type),dt=y(Et.internalFormat,At,ot,Et.normalized,Et.colorSpace);ie(w)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,jt(w),dt,w.width,w.height):z?s.renderbufferStorageMultisample(s.RENDERBUFFER,jt(w),dt,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,dt,w.width,w.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function me(P,w,z){let K=w.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(s.FRAMEBUFFER,P),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let it=n.get(w.depthTexture);if(it.__renderTarget=w,(!it.__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),K){if(it.__webglInit===void 0&&(it.__webglInit=!0,w.depthTexture.addEventListener("dispose",T)),it.__webglTexture===void 0){it.__webglTexture=s.createTexture(),e.bindTexture(s.TEXTURE_CUBE_MAP,it.__webglTexture),Vt(s.TEXTURE_CUBE_MAP,w.depthTexture);let Tt=r.convert(w.depthTexture.format),Gt=r.convert(w.depthTexture.type),F;w.depthTexture.format===ns?F=s.DEPTH_COMPONENT24:w.depthTexture.format===Ks&&(F=s.DEPTH24_STENCIL8);for(let U=0;U<6;U++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+U,0,F,w.width,w.height,0,Tt,Gt,null)}}else rt(w.depthTexture,0);let Et=it.__webglTexture,At=jt(w),ot=K?s.TEXTURE_CUBE_MAP_POSITIVE_X+z:s.TEXTURE_2D,dt=w.depthTexture.format===Ks?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(w.depthTexture.format===ns)ie(w)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,dt,ot,Et,0,At):s.framebufferTexture2D(s.FRAMEBUFFER,dt,ot,Et,0);else if(w.depthTexture.format===Ks)ie(w)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,dt,ot,Et,0,At):s.framebufferTexture2D(s.FRAMEBUFFER,dt,ot,Et,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ct(P){let w=n.get(P),z=P.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==P.depthTexture){let K=P.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),K){let it=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,K.removeEventListener("dispose",it)};K.addEventListener("dispose",it),w.__depthDisposeCallback=it}w.__boundDepthTexture=K}if(P.depthTexture&&!w.__autoAllocateDepthBuffer)if(z)for(let K=0;K<6;K++)me(w.__webglFramebuffer[K],P,K);else{let K=P.texture.mipmaps;K&&K.length>0?me(w.__webglFramebuffer[0],P,0):me(w.__webglFramebuffer,P,0)}else if(z){w.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(e.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer[K]),w.__webglDepthbuffer[K]===void 0)w.__webglDepthbuffer[K]=s.createRenderbuffer(),Kt(w.__webglDepthbuffer[K],P,!1);else{let it=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Et=w.__webglDepthbuffer[K];s.bindRenderbuffer(s.RENDERBUFFER,Et),s.framebufferRenderbuffer(s.FRAMEBUFFER,it,s.RENDERBUFFER,Et)}}else{let K=P.texture.mipmaps;if(K&&K.length>0?e.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer[0]):e.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=s.createRenderbuffer(),Kt(w.__webglDepthbuffer,P,!1);else{let it=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Et=w.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,Et),s.framebufferRenderbuffer(s.FRAMEBUFFER,it,s.RENDERBUFFER,Et)}}e.bindFramebuffer(s.FRAMEBUFFER,null)}function yt(P,w,z){let K=n.get(P);w!==void 0&&Ct(K.__webglFramebuffer,P,P.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),z!==void 0&&ct(P)}function bt(P){let w=P.texture,z=n.get(P),K=n.get(w);P.addEventListener("dispose",M);let it=P.textures,Et=P.isWebGLCubeRenderTarget===!0,At=it.length>1;if(At||(K.__webglTexture===void 0&&(K.__webglTexture=s.createTexture()),K.__version=w.version,o.memory.textures++),Et){z.__webglFramebuffer=[];for(let ot=0;ot<6;ot++)if(w.mipmaps&&w.mipmaps.length>0){z.__webglFramebuffer[ot]=[];for(let dt=0;dt<w.mipmaps.length;dt++)z.__webglFramebuffer[ot][dt]=s.createFramebuffer()}else z.__webglFramebuffer[ot]=s.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){z.__webglFramebuffer=[];for(let ot=0;ot<w.mipmaps.length;ot++)z.__webglFramebuffer[ot]=s.createFramebuffer()}else z.__webglFramebuffer=s.createFramebuffer();if(At)for(let ot=0,dt=it.length;ot<dt;ot++){let Tt=n.get(it[ot]);Tt.__webglTexture===void 0&&(Tt.__webglTexture=s.createTexture(),o.memory.textures++)}if(P.samples>0&&ie(P)===!1){z.__webglMultisampledFramebuffer=s.createFramebuffer(),z.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let ot=0;ot<it.length;ot++){let dt=it[ot];z.__webglColorRenderbuffer[ot]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,z.__webglColorRenderbuffer[ot]);let Tt=r.convert(dt.format,dt.colorSpace),Gt=r.convert(dt.type),F=y(dt.internalFormat,Tt,Gt,dt.normalized,dt.colorSpace,P.isXRRenderTarget===!0),U=jt(P);s.renderbufferStorageMultisample(s.RENDERBUFFER,U,F,P.width,P.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ot,s.RENDERBUFFER,z.__webglColorRenderbuffer[ot])}s.bindRenderbuffer(s.RENDERBUFFER,null),P.depthBuffer&&(z.__webglDepthRenderbuffer=s.createRenderbuffer(),Kt(z.__webglDepthRenderbuffer,P,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(Et){e.bindTexture(s.TEXTURE_CUBE_MAP,K.__webglTexture),Vt(s.TEXTURE_CUBE_MAP,w);for(let ot=0;ot<6;ot++)if(w.mipmaps&&w.mipmaps.length>0)for(let dt=0;dt<w.mipmaps.length;dt++)Ct(z.__webglFramebuffer[ot][dt],P,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,dt);else Ct(z.__webglFramebuffer[ot],P,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0);g(w)&&x(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(At){for(let ot=0,dt=it.length;ot<dt;ot++){let Tt=it[ot],Gt=n.get(Tt),F=s.TEXTURE_2D;(P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(F=P.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(F,Gt.__webglTexture),Vt(F,Tt),Ct(z.__webglFramebuffer,P,Tt,s.COLOR_ATTACHMENT0+ot,F,0),g(Tt)&&x(F)}e.unbindTexture()}else{let ot=s.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(ot=P.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(ot,K.__webglTexture),Vt(ot,w),w.mipmaps&&w.mipmaps.length>0)for(let dt=0;dt<w.mipmaps.length;dt++)Ct(z.__webglFramebuffer[dt],P,w,s.COLOR_ATTACHMENT0,ot,dt);else Ct(z.__webglFramebuffer,P,w,s.COLOR_ATTACHMENT0,ot,0);g(w)&&x(ot),e.unbindTexture()}P.depthBuffer&&ct(P)}function Mt(P){let w=P.textures;for(let z=0,K=w.length;z<K;z++){let it=w[z];if(g(it)){let Et=_(P),At=n.get(it).__webglTexture;e.bindTexture(Et,At),x(Et),e.unbindTexture()}}}let Rt=[],Jt=[];function $t(P){if(P.samples>0){if(ie(P)===!1){let w=P.textures,z=P.width,K=P.height,it=s.COLOR_BUFFER_BIT,Et=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,At=n.get(P),ot=w.length>1;if(ot)for(let Tt=0;Tt<w.length;Tt++)e.bindFramebuffer(s.FRAMEBUFFER,At.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Tt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,At.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Tt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,At.__webglMultisampledFramebuffer);let dt=P.texture.mipmaps;dt&&dt.length>0?e.bindFramebuffer(s.DRAW_FRAMEBUFFER,At.__webglFramebuffer[0]):e.bindFramebuffer(s.DRAW_FRAMEBUFFER,At.__webglFramebuffer);for(let Tt=0;Tt<w.length;Tt++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(it|=s.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(it|=s.STENCIL_BUFFER_BIT)),ot){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,At.__webglColorRenderbuffer[Tt]);let Gt=n.get(w[Tt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Gt,0)}s.blitFramebuffer(0,0,z,K,0,0,z,K,it,s.NEAREST),l===!0&&(Rt.length=0,Jt.length=0,Rt.push(s.COLOR_ATTACHMENT0+Tt),P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&(Rt.push(Et),Jt.push(Et),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Jt)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,Rt))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),ot)for(let Tt=0;Tt<w.length;Tt++){e.bindFramebuffer(s.FRAMEBUFFER,At.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Tt,s.RENDERBUFFER,At.__webglColorRenderbuffer[Tt]);let Gt=n.get(w[Tt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,At.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Tt,s.TEXTURE_2D,Gt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,At.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&l){let w=P.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[w])}}}function jt(P){return Math.min(i.maxSamples,P.samples)}function ie(P){let w=n.get(P);return P.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function B(P){let w=o.render.frame;h.get(P)!==w&&(h.set(P,w),P.update())}function Ce(P,w){let z=P.colorSpace,K=P.format,it=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||z!==Ia&&z!==Cs&&(Me.getTransfer(z)===Pe?(K!==Ti||it!==On)&&Qt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ne("WebGLTextures: Unsupported texture color space:",z)),w}function _e(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(c.width=P.naturalWidth||P.width,c.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(c.width=P.displayWidth,c.height=P.displayHeight):(c.width=P.width,c.height=P.height),c}this.allocateTextureUnit=V,this.resetTextureUnits=k,this.getTextureUnits=N,this.setTextureUnits=O,this.setTexture2D=rt,this.setTexture2DArray=G,this.setTexture3D=X,this.setTextureCube=Q,this.rebindTextures=yt,this.setupRenderTarget=bt,this.updateRenderTargetMipmap=Mt,this.updateMultisampleRenderTarget=$t,this.setupDepthRenderbuffer=ct,this.setupFrameBufferTexture=Ct,this.useMultisampledRTT=ie,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function vb(s,t){function e(n,i=Cs){let r,o=Me.getTransfer(i);if(n===On)return s.UNSIGNED_BYTE;if(n===ph)return s.UNSIGNED_SHORT_4_4_4_4;if(n===mh)return s.UNSIGNED_SHORT_5_5_5_1;if(n===Gd)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===Wd)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===zd)return s.BYTE;if(n===Vd)return s.SHORT;if(n===Io)return s.UNSIGNED_SHORT;if(n===fh)return s.INT;if(n===Wi)return s.UNSIGNED_INT;if(n===wi)return s.FLOAT;if(n===tn)return s.HALF_FLOAT;if(n===qd)return s.ALPHA;if(n===Xd)return s.RGB;if(n===Ti)return s.RGBA;if(n===ns)return s.DEPTH_COMPONENT;if(n===Ks)return s.DEPTH_STENCIL;if(n===gh)return s.RED;if(n===vh)return s.RED_INTEGER;if(n===Js)return s.RG;if(n===xh)return s.RG_INTEGER;if(n===yh)return s.RGBA_INTEGER;if(n===pl||n===ml||n===gl||n===vl)if(o===Pe)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===pl)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ml)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===gl)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===vl)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===pl)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ml)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===gl)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===vl)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===_h||n===Mh||n===bh||n===Sh)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===_h)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Mh)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===bh)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Sh)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Eh||n===wh||n===Th||n===Rh||n===Ah||n===xl||n===Ch)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Eh||n===wh)return o===Pe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Th)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Rh)return r.COMPRESSED_R11_EAC;if(n===Ah)return r.COMPRESSED_SIGNED_R11_EAC;if(n===xl)return r.COMPRESSED_RG11_EAC;if(n===Ch)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ph||n===Ih||n===Lh||n===Dh||n===Nh||n===Uh||n===Fh||n===Bh||n===Oh||n===Hh||n===kh||n===zh||n===Vh||n===Gh)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ph)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ih)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Lh)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Dh)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Nh)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Uh)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Fh)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Bh)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Oh)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Hh)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===kh)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===zh)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Vh)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Gh)return o===Pe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Wh||n===qh||n===Xh)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Wh)return o===Pe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===qh)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Xh)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Yh||n===Zh||n===yl||n===$h)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Yh)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Zh)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===yl)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===$h)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Lo?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:e}}var xb=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,yb=`
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

}`,_f=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new ka(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new te({vertexShader:xb,fragmentShader:yb,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new et(new Be(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Mf=class extends is{constructor(t,e){super();let n=this,i=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,m=null,v=typeof XRWebGLBinding<"u",p=new _f,g={},x=e.getContextAttributes(),_=null,y=null,b=[],S=[],T=new nt,M=null,R=null,C=new Qe;C.viewport=new Ve;let I=new Qe;I.viewport=new Ve;let L=[C,I],k=new lh,N=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let lt=b[J];return lt===void 0&&(lt=new xo,b[J]=lt),lt.getTargetRaySpace()},this.getControllerGrip=function(J){let lt=b[J];return lt===void 0&&(lt=new xo,b[J]=lt),lt.getGripSpace()},this.getHand=function(J){let lt=b[J];return lt===void 0&&(lt=new xo,b[J]=lt),lt.getHandSpace()};function V(J){let lt=S.indexOf(J.inputSource);if(lt===-1)return;let wt=b[lt];wt!==void 0&&(wt.update(J.inputSource,J.frame,c||o),wt.dispatchEvent({type:J.type,data:J.inputSource}))}function q(){i.removeEventListener("select",V),i.removeEventListener("selectstart",V),i.removeEventListener("selectend",V),i.removeEventListener("squeeze",V),i.removeEventListener("squeezestart",V),i.removeEventListener("squeezeend",V),i.removeEventListener("end",q),i.removeEventListener("inputsourceschange",rt);for(let J=0;J<b.length;J++){let lt=S[J];lt!==null&&(S[J]=null,b[J].disconnect(lt))}N=null,O=null,p.reset();for(let J in g)delete g[J];if(t.setRenderTarget(_),f=null,d=null,u=null,i=null,y=null,ee.stop(),n.isPresenting=!1,t.setPixelRatio(M),t.setSize(T.width,T.height,!1),R!==null){let J=R.camera;J.fov=R.fov,J.zoom=R.zoom,J.updateProjectionMatrix(),R=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,n.isPresenting===!0&&Qt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){a=J,n.isPresenting===!0&&Qt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&v&&(u=new XRWebGLBinding(i,e)),u},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(J){if(i=J,i!==null){if(_=t.getRenderTarget(),i.addEventListener("select",V),i.addEventListener("selectstart",V),i.addEventListener("selectend",V),i.addEventListener("squeeze",V),i.addEventListener("squeezestart",V),i.addEventListener("squeezeend",V),i.addEventListener("end",q),i.addEventListener("inputsourceschange",rt),x.xrCompatible!==!0&&await e.makeXRCompatible(),M=t.getPixelRatio(),t.getSize(T),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let wt=null,Xt=null,Ct=null;x.depth&&(Ct=x.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,wt=x.stencil?Ks:ns,Xt=x.stencil?Lo:Wi);let Kt={colorFormat:e.RGBA8,depthFormat:Ct,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Kt),i.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),y=new qe(d.textureWidth,d.textureHeight,{format:Ti,type:On,depthTexture:new Ws(d.textureWidth,d.textureHeight,Xt,void 0,void 0,void 0,void 0,void 0,void 0,wt),stencilBuffer:x.stencil,colorSpace:t.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let wt={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,e,wt),i.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new qe(f.framebufferWidth,f.framebufferHeight,{format:Ti,type:On,colorSpace:t.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),ee.setContext(i),ee.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function rt(J){for(let lt=0;lt<J.removed.length;lt++){let wt=J.removed[lt],Xt=S.indexOf(wt);Xt>=0&&(S[Xt]=null,b[Xt].disconnect(wt))}for(let lt=0;lt<J.added.length;lt++){let wt=J.added[lt],Xt=S.indexOf(wt);if(Xt===-1){for(let Kt=0;Kt<b.length;Kt++)if(Kt>=S.length){S.push(wt),Xt=Kt;break}else if(S[Kt]===null){S[Kt]=wt,Xt=Kt;break}if(Xt===-1)break}let Ct=b[Xt];Ct&&Ct.connect(wt)}}let G=new E,X=new E;function Q(J,lt,wt){G.setFromMatrixPosition(lt.matrixWorld),X.setFromMatrixPosition(wt.matrixWorld);let Xt=G.distanceTo(X),Ct=lt.projectionMatrix.elements,Kt=wt.projectionMatrix.elements,me=Ct[14]/(Ct[10]-1),ct=Ct[14]/(Ct[10]+1),yt=(Ct[9]+1)/Ct[5],bt=(Ct[9]-1)/Ct[5],Mt=(Ct[8]-1)/Ct[0],Rt=(Kt[8]+1)/Kt[0],Jt=me*Mt,$t=me*Rt,jt=Xt/(-Mt+Rt),ie=jt*-Mt;if(lt.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(ie),J.translateZ(jt),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),Ct[10]===-1)J.projectionMatrix.copy(lt.projectionMatrix),J.projectionMatrixInverse.copy(lt.projectionMatrixInverse);else{let B=me+jt,Ce=ct+jt,_e=Jt-ie,P=$t+(Xt-ie),w=yt*ct/Ce*B,z=bt*ct/Ce*B;J.projectionMatrix.makePerspective(_e,P,w,z,B,Ce),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function _t(J,lt){lt===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(lt.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(i===null)return;let lt=J.near,wt=J.far;p.texture!==null&&(p.depthNear>0&&(lt=p.depthNear),p.depthFar>0&&(wt=p.depthFar)),k.near=I.near=C.near=lt,k.far=I.far=C.far=wt,(N!==k.near||O!==k.far)&&(i.updateRenderState({depthNear:k.near,depthFar:k.far}),N=k.near,O=k.far),k.layers.mask=J.layers.mask|6,C.layers.mask=k.layers.mask&-5,I.layers.mask=k.layers.mask&-3;let Xt=J.parent,Ct=k.cameras;_t(k,Xt);for(let Kt=0;Kt<Ct.length;Kt++)_t(Ct[Kt],Xt);Ct.length===2?Q(k,C,I):k.projectionMatrix.copy(C.projectionMatrix),R===null&&J.isPerspectiveCamera&&(R={camera:J,fov:J.fov,zoom:J.zoom}),St(J,k,Xt)};function St(J,lt,wt){wt===null?J.matrix.copy(lt.matrixWorld):(J.matrix.copy(wt.matrixWorld),J.matrix.invert(),J.matrix.multiply(lt.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(lt.projectionMatrix),J.projectionMatrixInverse.copy(lt.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=go*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(J){l=J,d!==null&&(d.fixedFoveation=J),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=J)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(k)},this.getCameraTexture=function(J){return g[J]};let Ht=null;function Vt(J,lt){if(h=lt.getViewerPose(c||o),m=lt,h!==null){let wt=h.views;f!==null&&(t.setRenderTargetFramebuffer(y,f.framebuffer),t.setRenderTarget(y));let Xt=!1;wt.length!==k.cameras.length&&(k.cameras.length=0,Xt=!0);for(let ct=0;ct<wt.length;ct++){let yt=wt[ct],bt=null;if(f!==null)bt=f.getViewport(yt);else{let Rt=u.getViewSubImage(d,yt);bt=Rt.viewport,ct===0&&(t.setRenderTargetTextures(y,Rt.colorTexture,Rt.depthStencilTexture),t.setRenderTarget(y))}let Mt=L[ct];Mt===void 0&&(Mt=new Qe,Mt.layers.enable(ct),Mt.viewport=new Ve,L[ct]=Mt),Mt.matrix.fromArray(yt.transform.matrix),Mt.matrix.decompose(Mt.position,Mt.quaternion,Mt.scale),Mt.projectionMatrix.fromArray(yt.projectionMatrix),Mt.projectionMatrixInverse.copy(Mt.projectionMatrix).invert(),Mt.viewport.set(bt.x,bt.y,bt.width,bt.height),ct===0&&(k.matrix.copy(Mt.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),Xt===!0&&k.cameras.push(Mt)}let Ct=i.enabledFeatures;if(Ct&&Ct.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&v){u=n.getBinding();let ct=u.getDepthInformation(wt[0]);ct&&ct.isValid&&ct.texture&&p.init(ct,i.renderState)}if(Ct&&Ct.includes("camera-access")&&v){t.state.unbindTexture(),u=n.getBinding();for(let ct=0;ct<wt.length;ct++){let yt=wt[ct].camera;if(yt){let bt=g[yt];bt||(bt=new ka,g[yt]=bt);let Mt=u.getCameraImage(yt);bt.sourceTexture=Mt}}}}for(let wt=0;wt<b.length;wt++){let Xt=S[wt],Ct=b[wt];Xt!==null&&Ct!==void 0&&Ct.update(Xt,lt,c||o)}Ht&&Ht(J,lt),lt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:lt}),m=null}let ee=new _m;ee.setAnimationLoop(Vt),this.setAnimationLoop=function(J){Ht=J},this.dispose=function(){}}},_b=new le,Tm=new oe;Tm.set(-1,0,0,0,1,0,0,0,1);function Mb(s,t){function e(p,g){p.matrixAutoUpdate===!0&&p.updateMatrix(),g.value.copy(p.matrix)}function n(p,g){g.color.getRGB(p.fogColor.value,Jd(s)),g.isFog?(p.fogNear.value=g.near,p.fogFar.value=g.far):g.isFogExp2&&(p.fogDensity.value=g.density)}function i(p,g,x,_,y){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(p,g):g.isMeshLambertMaterial?(r(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(p,g),u(p,g)):g.isMeshPhongMaterial?(r(p,g),h(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(p,g),d(p,g),g.isMeshPhysicalMaterial&&f(p,g,y)):g.isMeshMatcapMaterial?(r(p,g),m(p,g)):g.isMeshDepthMaterial?r(p,g):g.isMeshDistanceMaterial?(r(p,g),v(p,g)):g.isMeshNormalMaterial?r(p,g):g.isLineBasicMaterial?(o(p,g),g.isLineDashedMaterial&&a(p,g)):g.isPointsMaterial?l(p,g,x,_):g.isSpriteMaterial?c(p,g):g.isShadowMaterial?(p.color.value.copy(g.color),p.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(p,g){p.opacity.value=g.opacity,g.color&&p.diffuse.value.copy(g.color),g.emissive&&p.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(p.map.value=g.map,e(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,e(g.alphaMap,p.alphaMapTransform)),g.bumpMap&&(p.bumpMap.value=g.bumpMap,e(g.bumpMap,p.bumpMapTransform),p.bumpScale.value=g.bumpScale,g.side===fn&&(p.bumpScale.value*=-1)),g.normalMap&&(p.normalMap.value=g.normalMap,e(g.normalMap,p.normalMapTransform),p.normalScale.value.copy(g.normalScale),g.side===fn&&p.normalScale.value.negate()),g.displacementMap&&(p.displacementMap.value=g.displacementMap,e(g.displacementMap,p.displacementMapTransform),p.displacementScale.value=g.displacementScale,p.displacementBias.value=g.displacementBias),g.emissiveMap&&(p.emissiveMap.value=g.emissiveMap,e(g.emissiveMap,p.emissiveMapTransform)),g.specularMap&&(p.specularMap.value=g.specularMap,e(g.specularMap,p.specularMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest);let x=t.get(g),_=x.envMap,y=x.envMapRotation;_&&(p.envMap.value=_,p.envMapRotation.value.setFromMatrix4(_b.makeRotationFromEuler(y)).transpose(),_.isCubeTexture&&_.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Tm),p.reflectivity.value=g.reflectivity,p.ior.value=g.ior,p.refractionRatio.value=g.refractionRatio),g.lightMap&&(p.lightMap.value=g.lightMap,p.lightMapIntensity.value=g.lightMapIntensity,e(g.lightMap,p.lightMapTransform)),g.aoMap&&(p.aoMap.value=g.aoMap,p.aoMapIntensity.value=g.aoMapIntensity,e(g.aoMap,p.aoMapTransform))}function o(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,g.map&&(p.map.value=g.map,e(g.map,p.mapTransform))}function a(p,g){p.dashSize.value=g.dashSize,p.totalSize.value=g.dashSize+g.gapSize,p.scale.value=g.scale}function l(p,g,x,_){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.size.value=g.size*x,p.scale.value=_*.5,g.map&&(p.map.value=g.map,e(g.map,p.uvTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,e(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function c(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.rotation.value=g.rotation,g.map&&(p.map.value=g.map,e(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,e(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function h(p,g){p.specular.value.copy(g.specular),p.shininess.value=Math.max(g.shininess,1e-4)}function u(p,g){g.gradientMap&&(p.gradientMap.value=g.gradientMap)}function d(p,g){p.metalness.value=g.metalness,g.metalnessMap&&(p.metalnessMap.value=g.metalnessMap,e(g.metalnessMap,p.metalnessMapTransform)),p.roughness.value=g.roughness,g.roughnessMap&&(p.roughnessMap.value=g.roughnessMap,e(g.roughnessMap,p.roughnessMapTransform)),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)}function f(p,g,x){p.ior.value=g.ior,g.sheen>0&&(p.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),p.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(p.sheenColorMap.value=g.sheenColorMap,e(g.sheenColorMap,p.sheenColorMapTransform)),g.sheenRoughnessMap&&(p.sheenRoughnessMap.value=g.sheenRoughnessMap,e(g.sheenRoughnessMap,p.sheenRoughnessMapTransform))),g.clearcoat>0&&(p.clearcoat.value=g.clearcoat,p.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(p.clearcoatMap.value=g.clearcoatMap,e(g.clearcoatMap,p.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,e(g.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(p.clearcoatNormalMap.value=g.clearcoatNormalMap,e(g.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===fn&&p.clearcoatNormalScale.value.negate())),g.dispersion>0&&(p.dispersion.value=g.dispersion),g.retroreflectivity>0&&(p.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(p.iridescence.value=g.iridescence,p.iridescenceIOR.value=g.iridescenceIOR,p.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(p.iridescenceMap.value=g.iridescenceMap,e(g.iridescenceMap,p.iridescenceMapTransform)),g.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=g.iridescenceThicknessMap,e(g.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),g.transmission>0&&(p.transmission.value=g.transmission,p.transmissionSamplerMap.value=x.texture,p.transmissionSamplerSize.value.set(x.width,x.height),g.transmissionMap&&(p.transmissionMap.value=g.transmissionMap,e(g.transmissionMap,p.transmissionMapTransform)),p.thickness.value=g.thickness,g.thicknessMap&&(p.thicknessMap.value=g.thicknessMap,e(g.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=g.attenuationDistance,p.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(p.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(p.anisotropyMap.value=g.anisotropyMap,e(g.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=g.specularIntensity,p.specularColor.value.copy(g.specularColor),g.specularColorMap&&(p.specularColorMap.value=g.specularColorMap,e(g.specularColorMap,p.specularColorMapTransform)),g.specularIntensityMap&&(p.specularIntensityMap.value=g.specularIntensityMap,e(g.specularIntensityMap,p.specularIntensityMapTransform))}function m(p,g){g.matcap&&(p.matcap.value=g.matcap)}function v(p,g){let x=t.get(g).light;p.referencePosition.value.setFromMatrixPosition(x.matrixWorld),p.nearDistance.value=x.shadow.camera.near,p.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function bb(s,t,e,n){let i={},r={},o=[],a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,b){let S=b.program;n.uniformBlockBinding(y,S)}function c(y,b){let S=i[y.id];S===void 0&&(p(y),S=h(y),i[y.id]=S,y.addEventListener("dispose",x));let T=b.program;n.updateUBOMapping(y,T);let M=t.render.frame;r[y.id]!==M&&(d(y),r[y.id]=M)}function h(y){let b=u();y.__bindingPointIndex=b;let S=s.createBuffer(),T=y.__size,M=y.usage;return s.bindBuffer(s.UNIFORM_BUFFER,S),s.bufferData(s.UNIFORM_BUFFER,T,M),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,b,S),S}function u(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return ne("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){let b=i[y.id],S=y.uniforms,T=y.__cache;s.bindBuffer(s.UNIFORM_BUFFER,b);for(let M=0,R=S.length;M<R;M++){let C=S[M];if(Array.isArray(C))for(let I=0,L=C.length;I<L;I++)f(C[I],M,I,T);else f(C,M,0,T)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(y,b,S,T){if(v(y,b,S,T)===!0){let M=y.__offset,R=y.value;if(Array.isArray(R)){let C=0;for(let I=0;I<R.length;I++){let L=R[I],k=g(L);m(L,y.__data,C),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(C+=k.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(R,y.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,M,y.__data)}}function m(y,b,S){typeof y=="number"||typeof y=="boolean"?b[0]=y:y.isMatrix3?(b[0]=y.elements[0],b[1]=y.elements[1],b[2]=y.elements[2],b[3]=0,b[4]=y.elements[3],b[5]=y.elements[4],b[6]=y.elements[5],b[7]=0,b[8]=y.elements[6],b[9]=y.elements[7],b[10]=y.elements[8],b[11]=0):ArrayBuffer.isView(y)?b.set(new y.constructor(y.buffer,y.byteOffset,b.length)):y.toArray(b,S)}function v(y,b,S,T){let M=y.value,R=b+"_"+S;if(T[R]===void 0)return typeof M=="number"||typeof M=="boolean"?T[R]=M:ArrayBuffer.isView(M)?T[R]=M.slice():T[R]=M.clone(),!0;{let C=T[R];if(typeof M=="number"||typeof M=="boolean"){if(C!==M)return T[R]=M,!0}else{if(ArrayBuffer.isView(M))return!0;if(C.equals(M)===!1)return C.copy(M),!0}}return!1}function p(y){let b=y.uniforms,S=0,T=16;for(let R=0,C=b.length;R<C;R++){let I=Array.isArray(b[R])?b[R]:[b[R]];for(let L=0,k=I.length;L<k;L++){let N=I[L],O=Array.isArray(N.value)?N.value:[N.value];for(let V=0,q=O.length;V<q;V++){let rt=O[V],G=g(rt),X=S%T,Q=X%G.boundary,_t=X+Q;S+=Q,_t!==0&&T-_t<G.storage&&(S+=T-_t),N.__data=new Float32Array(G.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=S,S+=G.storage}}}let M=S%T;return M>0&&(S+=T-M),y.__size=S,y.__cache={},this}function g(y){let b={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(b.boundary=4,b.storage=4):y.isVector2?(b.boundary=8,b.storage=8):y.isVector3||y.isColor?(b.boundary=16,b.storage=12):y.isVector4?(b.boundary=16,b.storage=16):y.isMatrix3?(b.boundary=48,b.storage=48):y.isMatrix4?(b.boundary=64,b.storage=64):y.isTexture?Qt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(b.boundary=16,b.storage=y.byteLength):Qt("WebGLRenderer: Unsupported uniform value type.",y),b}function x(y){let b=y.target;b.removeEventListener("dispose",x);let S=o.indexOf(b.__bindingPointIndex);o.splice(S,1),s.deleteBuffer(i[b.id]),delete i[b.id],delete r[b.id]}function _(){for(let y in i)s.deleteBuffer(i[y]);o=[],i={},r={}}return{bind:l,update:c,dispose:_}}var Sb=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),cs=null;function Eb(){return cs===null&&(cs=new Er(Sb,16,16,Js,tn),cs.name="DFG_LUT",cs.minFilter=cn,cs.magFilter=cn,cs.wrapS=Qi,cs.wrapT=Qi,cs.generateMipmaps=!1,cs.needsUpdate=!0),cs}var eu=class{constructor(t={}){let{canvas:e=z0(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=On}=t;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=o;let v=f,p=new Set([yh,xh,vh]),g=new Set([On,Wi,Io,Lo,ph,mh]),x=new Uint32Array(4),_=new Int32Array(4),y=new E,b=null,S=null,T=[],M=[],R=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Gi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,I=!1,L=null,k=null,N=null,O=null;this._outputColorSpace=Te;let V=0,q=0,rt=null,G=-1,X=null,Q=new Ve,_t=new Ve,St=null,Ht=new mt(0),Vt=0,ee=e.width,J=e.height,lt=1,wt=null,Xt=null,Ct=new Ve(0,0,ee,J),Kt=new Ve(0,0,ee,J),me=!1,ct=new _o,yt=!1,bt=!1,Mt=new le,Rt=new E,Jt=new Ve,$t={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},jt=!1;function ie(){return rt===null?lt:1}let B=n;function Ce(A,H){return e.getContext(A,H)}let _e,P,w,z,K,it,Et,At,ot,dt,Tt,Gt,F,U,st,ht,gt,D,j,W,pt,xt,at;try{let A={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",ge,!1),e.addEventListener("webglcontextrestored",fe,!1),e.addEventListener("webglcontextcreationerror",Mn,!1),B===null){let H="webgl2";if(B=Ce(H,A),B===null)throw Ce(H)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Nt()}catch(A){throw e.removeEventListener("webglcontextlost",ge,!1),e.removeEventListener("webglcontextrestored",fe,!1),e.removeEventListener("webglcontextcreationerror",Mn,!1),ne("WebGLRenderer: "+A.message),A}function Nt(){_e=new I_(B),_e.init(),pt=new vb(B,_e),P=new M_(B,_e,t,pt),w=new mb(B,_e),P.reversedDepthBuffer&&d&&w.buffers.depth.setReversed(!0),k=B.createFramebuffer(),N=B.createFramebuffer(),O=B.createFramebuffer(),z=new N_(B),K=new eb,it=new gb(B,_e,w,K,P,pt,z),Et=new P_(C),At=new Fx(B),xt=new y_(B,At),ot=new L_(B,At,z,xt),dt=new F_(B,ot,At,xt,z),D=new U_(B,P,it),st=new b_(K),Tt=new tb(C,Et,_e,P,xt,st),Gt=new Mb(C,K),F=new ib,U=new cb(_e),gt=new x_(C,Et,w,dt,m,l),ht=new pb(C,dt,P),at=new bb(B,z,P,w),j=new __(B,_e,z),W=new D_(B,_e,z),z.programs=Tt.programs,C.capabilities=P,C.extensions=_e,C.properties=K,C.renderLists=F,C.shadowMap=ht,C.state=w,C.info=z}v!==On&&(R=new O_(v,e.width,e.height,a,i,r));let It=new Mf(C,B);this.xr=It,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let A=_e.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){let A=_e.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return lt},this.setPixelRatio=function(A){A!==void 0&&(lt=A,this.setSize(ee,J,!1))},this.getSize=function(A){return A.set(ee,J)},this.setSize=function(A,H,tt=!0){if(It.isPresenting){Qt("WebGLRenderer: Can't change size while VR device is presenting.");return}ee=A,J=H,e.width=Math.floor(A*lt),e.height=Math.floor(H*lt),tt===!0&&(e.style.width=A+"px",e.style.height=H+"px"),R!==null&&R.setSize(e.width,e.height),this.setViewport(0,0,A,H)},this.getDrawingBufferSize=function(A){return A.set(ee*lt,J*lt).floor()},this.setDrawingBufferSize=function(A,H,tt){ee=A,J=H,lt=tt,e.width=Math.floor(A*tt),e.height=Math.floor(H*tt),this.setViewport(0,0,A,H)},this.setEffects=function(A){if(v===On){ne("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(A){for(let H=0;H<A.length;H++)if(A[H].isOutputPass===!0){Qt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}R.setEffects(A||[])},this.getCurrentViewport=function(A){return A.copy(Q)},this.getViewport=function(A){return A.copy(Ct)},this.setViewport=function(A,H,tt,Z){A.isVector4?Ct.set(A.x,A.y,A.z,A.w):Ct.set(A,H,tt,Z),w.viewport(Q.copy(Ct).multiplyScalar(lt).round())},this.getScissor=function(A){return A.copy(Kt)},this.setScissor=function(A,H,tt,Z){A.isVector4?Kt.set(A.x,A.y,A.z,A.w):Kt.set(A,H,tt,Z),w.scissor(_t.copy(Kt).multiplyScalar(lt).round())},this.getScissorTest=function(){return me},this.setScissorTest=function(A){w.setScissorTest(me=A)},this.setOpaqueSort=function(A){wt=A},this.setTransparentSort=function(A){Xt=A},this.getClearColor=function(A){return A.copy(gt.getClearColor())},this.setClearColor=function(){gt.setClearColor(...arguments)},this.getClearAlpha=function(){return gt.getClearAlpha()},this.setClearAlpha=function(){gt.setClearAlpha(...arguments)},this.clear=function(A=!0,H=!0,tt=!0){let Z=0;if(A){let $=!1;if(rt!==null){let Dt=rt.texture.format;$=p.has(Dt)}if($){let Dt=rt.texture.type,Ot=g.has(Dt),Lt=gt.getClearColor(),Wt=gt.getClearAlpha(),Yt=Lt.r,ve=Lt.g,be=Lt.b;Ot?(x[0]=Yt,x[1]=ve,x[2]=be,x[3]=Wt,B.clearBufferuiv(B.COLOR,0,x)):(_[0]=Yt,_[1]=ve,_[2]=be,_[3]=Wt,B.clearBufferiv(B.COLOR,0,_))}else Z|=B.COLOR_BUFFER_BIT}H&&(Z|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),tt&&(Z|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Z!==0&&B.clear(Z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(A){A.setRenderer(this),L=A},this.dispose=function(){e.removeEventListener("webglcontextlost",ge,!1),e.removeEventListener("webglcontextrestored",fe,!1),e.removeEventListener("webglcontextcreationerror",Mn,!1),gt.dispose(),F.dispose(),U.dispose(),K.dispose(),Et.dispose(),dt.dispose(),xt.dispose(),at.dispose(),Tt.dispose(),It.dispose(),It.removeEventListener("sessionstart",Gr),It.removeEventListener("sessionend",pa),Ki.stop()};function ge(A){A.preventDefault(),Na("WebGLRenderer: Context Lost."),I=!0}function fe(){Na("WebGLRenderer: Context Restored."),I=!1;let A=z.autoReset,H=ht.enabled,tt=ht.autoUpdate,Z=ht.needsUpdate,$=ht.type;Nt(),z.autoReset=A,ht.enabled=H,ht.autoUpdate=tt,ht.needsUpdate=Z,ht.type=$}function Mn(A){ne("WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function he(A){let H=A.target;H.removeEventListener("dispose",he),Gn(H)}function Gn(A){Qn(A),K.remove(A)}function Qn(A){let H=K.get(A).programs;H!==void 0&&(H.forEach(function(tt){Tt.releaseProgram(tt)}),A.isShaderMaterial&&Tt.releaseShaderCache(A))}this.renderBufferDirect=function(A,H,tt,Z,$,Dt){H===null&&(H=$t);let Ot=$.isMesh&&$.matrixWorld.determinantAffine()<0,Lt=ev(A,H,tt,Z,$);w.setMaterial(Z,Ot);let Wt=tt.index,Yt=1;if(Z.wireframe===!0){if(Wt=ot.getWireframeAttribute(tt),Wt===void 0)return;Yt=2}let ve=tt.drawRange,be=tt.attributes.position,qt=ve.start*Yt,Le=(ve.start+ve.count)*Yt;Dt!==null&&(qt=Math.max(qt,Dt.start*Yt),Le=Math.min(Le,(Dt.start+Dt.count)*Yt)),Wt!==null?(qt=Math.max(qt,0),Le=Math.min(Le,Wt.count)):be!=null&&(qt=Math.max(qt,0),Le=Math.min(Le,be.count));let gn=Le-qt;if(gn<0||gn===1/0)return;xt.setup($,Z,Lt,tt,Wt);let Je,ze=j;if(Wt!==null&&(Je=At.get(Wt),ze=W,ze.setIndex(Je)),$.isMesh)Z.wireframe===!0?(w.setLineWidth(Z.wireframeLinewidth*ie()),ze.setMode(B.LINES)):ze.setMode(B.TRIANGLES);else if($.isLine){let Un=Z.linewidth;Un===void 0&&(Un=1),w.setLineWidth(Un*ie()),$.isLineSegments?ze.setMode(B.LINES):$.isLineLoop?ze.setMode(B.LINE_LOOP):ze.setMode(B.LINE_STRIP)}else $.isPoints?ze.setMode(B.POINTS):$.isSprite&&ze.setMode(B.TRIANGLES);if($.isBatchedMesh)if(_e.get("WEBGL_multi_draw"))ze.renderMultiDraw($._multiDrawStarts,$._multiDrawCounts,$._multiDrawCount);else{let Un=$._multiDrawStarts,Bt=$._multiDrawCounts,Wn=$._multiDrawCount,Ae=Wt?At.get(Wt).bytesPerElement:1,_i=K.get(Z).currentProgram.getUniforms();for(let Ji=0;Ji<Wn;Ji++)_i.setValue(B,"_gl_DrawID",Ji),ze.render(Un[Ji]/Ae,Bt[Ji])}else if($.isInstancedMesh)ze.renderInstances(qt,gn,$.count);else if(tt.isInstancedBufferGeometry){let Un=tt._maxInstanceCount!==void 0?tt._maxInstanceCount:1/0,Bt=Math.min(tt.instanceCount,Un);ze.renderInstances(qt,gn,Bt)}else ze.render(qt,gn)};function Rn(A,H,tt,Z){L!==null&&A.isNodeMaterial&&L.setObject(Z,A),yt===!0&&st.setState(A,tt,!1),A.transparent===!0&&A.side===Zt&&A.forceSinglePass===!1?(A.side=fn,A.needsUpdate=!0,jl(A,H,Z),A.side=ls,A.needsUpdate=!0,jl(A,H,Z),A.side=Zt):jl(A,H,Z)}this.compile=function(A,H,tt=null){tt===null&&(tt=A),L!==null&&L.renderStart(A,H,tt),S=U.get(tt),S.init(H),M.push(S),tt.traverseVisible(function($){$.isLight&&$.layers.test(H.layers)&&(S.pushLight($),$.castShadow&&S.pushShadow($))}),A!==tt&&A.traverseVisible(function($){$.isLight&&$.layers.test(H.layers)&&(S.pushLight($),$.castShadow&&S.pushShadow($))}),S.setupLights(),L!==null&&L.updateLights(S.state.lightsArray),bt=this.localClippingEnabled,yt=st.init(this.clippingPlanes,bt),yt===!0&&st.setGlobalState(this.clippingPlanes,H),L!==null&&ht.render(S.state.shadowsArray,tt,H);let Z=new Set;return A.traverse(function($){if(!($.isMesh||$.isPoints||$.isLine||$.isSprite))return;let Dt=$.material;if(Dt)if(Array.isArray(Dt))for(let Ot=0;Ot<Dt.length;Ot++){let Lt=Dt[Ot];Rn(Lt,tt,H,$),Z.add(Lt)}else Rn(Dt,tt,H,$),Z.add(Dt)}),S=M.pop(),L!==null&&L.renderEnd(),Z},this.compileAsync=function(A,H,tt=null){let Z=this.compile(A,H,tt);return new Promise($=>{function Dt(){if(Z.forEach(function(Ot){let Wt=K.get(Ot).currentProgram;(Wt===void 0||Wt.isReady())&&Z.delete(Ot)}),Z.size===0){$(A);return}setTimeout(Dt,10)}_e.get("KHR_parallel_shader_compile")!==null?Dt():setTimeout(Dt,10)})};let Us=null;function fa(A){Us&&Us(A)}function Gr(){Ki.stop()}function pa(){Ki.start()}let Ki=new _m;Ki.setAnimationLoop(fa),typeof self<"u"&&Ki.setContext(self),this.setAnimationLoop=function(A){Us=A,It.setAnimationLoop(A),A===null?Ki.stop():Ki.start()},It.addEventListener("sessionstart",Gr),It.addEventListener("sessionend",pa),this.render=function(A,H){if(H!==void 0&&H.isCamera!==!0){ne("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;L!==null&&L.renderStart(A,H);let tt=It.enabled===!0&&It.isPresenting===!0,Z=R!==null&&(rt===null||tt)&&R.begin(C,rt);if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),H.parent===null&&H.matrixWorldAutoUpdate===!0&&H.updateMatrixWorld(),It.enabled===!0&&It.isPresenting===!0&&(R===null||R.isCompositing()===!1)&&(It.cameraAutoUpdate===!0&&It.updateCamera(H),H=It.getCamera()),A.isScene===!0&&A.onBeforeRender(C,A,H,rt),S=U.get(A,M.length),S.init(H),S.state.textureUnits=it.getTextureUnits(),M.push(S),Mt.multiplyMatrices(H.projectionMatrix,H.matrixWorldInverse),ct.setFromProjectionMatrix(Mt,Oi,H.reversedDepth),bt=this.localClippingEnabled,yt=st.init(this.clippingPlanes,bt),b=F.get(A,T.length),b.init(),T.push(b),It.enabled===!0&&It.isPresenting===!0){let Ot=C.xr.getDepthSensingMesh();Ot!==null&&Wr(Ot,H,-1/0,C.sortObjects)}Wr(A,H,0,C.sortObjects),b.finish(),L!==null&&L.updateLights(S.state.lightsArray),C.sortObjects===!0&&b.sort(wt,Xt),jt=It.enabled===!1||It.isPresenting===!1||It.hasDepthSensing()===!1,jt&&gt.addToRenderList(b,A),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),yt===!0&&st.beginShadows();let $=S.state.shadowsArray;if(ht.render($,A,H),yt===!0&&st.endShadows(),(Z&&R.hasRenderPass())===!1){let Ot=b.opaque,Lt=b.transmissive;if(S.setupLights(),H.isArrayCamera){let Wt=H.cameras;if(Lt.length>0)for(let Yt=0,ve=Wt.length;Yt<ve;Yt++){let be=Wt[Yt];bp(Ot,Lt,A,be)}jt&&gt.render(A);for(let Yt=0,ve=Wt.length;Yt<ve;Yt++){let be=Wt[Yt];Mp(b,A,be,be.viewport)}}else Lt.length>0&&bp(Ot,Lt,A,H),jt&&gt.render(A),Mp(b,A,H)}rt!==null&&q===0&&(it.updateMultisampleRenderTarget(rt),it.updateRenderTargetMipmap(rt)),Z&&R.end(C),A.isScene===!0&&A.onAfterRender(C,A,H),xt.resetDefaultState(),G=-1,X=null,M.pop(),M.length>0?(S=M[M.length-1],it.setTextureUnits(S.state.textureUnits),yt===!0&&st.setGlobalState(C.clippingPlanes,S.state.camera)):S=null,T.pop(),T.length>0?b=T[T.length-1]:b=null,L!==null&&L.renderEnd()};function Wr(A,H,tt,Z){if(A.visible===!1)return;if(A.layers.test(H.layers)){if(A.isGroup)tt=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(H);else if(A.isLightProbeGrid)S.pushLightProbeGrid(A);else if(A.isLight)S.pushLight(A),A.castShadow&&S.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||A.intersectsFrustum(ct)){Z&&Jt.setFromMatrixPosition(A.matrixWorld).applyMatrix4(Mt);let Ot=dt.update(A),Lt=A.material;Lt.visible&&b.push(A,Ot,Lt,tt,Jt.z,null,H)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||A.intersectsFrustum(ct))){let Ot=dt.update(A),Lt=A.material;if(Z&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Jt.copy(A.boundingSphere.center)):(Ot.boundingSphere===null&&Ot.computeBoundingSphere(),Jt.copy(Ot.boundingSphere.center)),Jt.applyMatrix4(A.matrixWorld).applyMatrix4(Mt)),Array.isArray(Lt)){let Wt=Ot.groups;for(let Yt=0,ve=Wt.length;Yt<ve;Yt++){let be=Wt[Yt],qt=Lt[be.materialIndex];qt&&qt.visible&&b.push(A,Ot,qt,tt,Jt.z,be,H)}}else Lt.visible&&b.push(A,Ot,Lt,tt,Jt.z,null,H)}}let Dt=A.children;for(let Ot=0,Lt=Dt.length;Ot<Lt;Ot++)Wr(Dt[Ot],H,tt,Z)}function Mp(A,H,tt,Z){let{opaque:$,transmissive:Dt,transparent:Ot}=A;S.setupLightsView(tt),yt===!0&&st.setGlobalState(C.clippingPlanes,tt),Z&&w.viewport(Q.copy(Z)),$.length>0&&Jl($,H,tt),Dt.length>0&&Jl(Dt,H,tt),Ot.length>0&&Jl(Ot,H,tt),w.buffers.depth.setTest(!0),w.buffers.depth.setMask(!0),w.buffers.color.setMask(!0),w.setPolygonOffset(!1)}function bp(A,H,tt,Z){if((tt.isScene===!0?tt.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[Z.id]===void 0){let qt=_e.has("EXT_color_buffer_half_float")||_e.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[Z.id]=new qe(1,1,{generateMipmaps:!0,type:qt?tn:On,minFilter:ti,samples:Math.max(4,P.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Me.workingColorSpace})}let Dt=S.state.transmissionRenderTarget[Z.id],Ot=Z.viewport||Q;Dt.setSize(Ot.z*C.transmissionResolutionScale,Ot.w*C.transmissionResolutionScale);let Lt=C.getRenderTarget(),Wt=C.getActiveCubeFace(),Yt=C.getActiveMipmapLevel();C.setRenderTarget(Dt),C.getClearColor(Ht),Vt=C.getClearAlpha(),Vt<1&&C.setClearColor(16777215,.5),C.clear(),jt&&gt.render(tt);let ve=C.toneMapping;C.toneMapping=Gi;let be=Z.viewport;if(Z.viewport!==void 0&&(Z.viewport=void 0),S.setupLightsView(Z),yt===!0&&st.setGlobalState(C.clippingPlanes,Z),Jl(A,tt,Z),it.updateMultisampleRenderTarget(Dt),it.updateRenderTargetMipmap(Dt),_e.has("WEBGL_multisampled_render_to_texture")===!1){let qt=!1;for(let Le=0,gn=H.length;Le<gn;Le++){let Je=H[Le],{object:ze,geometry:Un,material:Bt,group:Wn}=Je;if(Bt.side===Zt&&ze.layers.test(Z.layers)){let Ae=Bt.side;Bt.side=fn,Bt.needsUpdate=!0,Sp(ze,tt,Z,Un,Bt,Wn),Bt.side=Ae,Bt.needsUpdate=!0,qt=!0}}qt===!0&&(it.updateMultisampleRenderTarget(Dt),it.updateRenderTargetMipmap(Dt))}C.setRenderTarget(Lt,Wt,Yt),C.setClearColor(Ht,Vt),be!==void 0&&(Z.viewport=be),C.toneMapping=ve}function Jl(A,H,tt){let Z=H.isScene===!0?H.overrideMaterial:null;for(let $=0,Dt=A.length;$<Dt;$++){let Ot=A[$],{object:Lt,geometry:Wt,group:Yt}=Ot,ve=Ot.material;ve.allowOverride===!0&&Z!==null&&(ve=Z),Lt.layers.test(tt.layers)&&Sp(Lt,H,tt,Wt,ve,Yt)}}function Sp(A,H,tt,Z,$,Dt){L!==null&&$.isNodeMaterial&&L.setObject(A,$),A.onBeforeRender(C,H,tt,Z,$,Dt),A.modelViewMatrix.multiplyMatrices(tt.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),$.onBeforeRender(C,H,tt,Z,A,Dt),$.transparent===!0&&$.side===Zt&&$.forceSinglePass===!1?($.side=fn,$.needsUpdate=!0,C.renderBufferDirect(tt,H,Z,$,A,Dt),$.side=ls,$.needsUpdate=!0,C.renderBufferDirect(tt,H,Z,$,A,Dt),$.side=Zt):C.renderBufferDirect(tt,H,Z,$,A,Dt),A.onAfterRender(C,H,tt,Z,$,Dt)}function jl(A,H,tt){H.isScene!==!0&&(H=$t);let Z=K.get(A),$=S.state.lights,Dt=S.state.shadowsArray,Ot=$.state.version,Lt=Tt.getParameters(A,$.state,Dt,H,tt,S.state.lightProbeGridArray),Wt=Tt.getProgramCacheKey(Lt),Yt=Z.programs;Z.environment=A.isMeshStandardMaterial||A.isMeshLambertMaterial||A.isMeshPhongMaterial?H.environment:null,Z.fog=H.fog;let ve=A.isMeshStandardMaterial||A.isMeshLambertMaterial&&!A.envMap||A.isMeshPhongMaterial&&!A.envMap;Z.envMap=Et.get(A.envMap||Z.environment,ve),Z.envMapRotation=Z.environment!==null&&A.envMap===null?H.environmentRotation:A.envMapRotation,Yt===void 0&&(A.addEventListener("dispose",he),Yt=new Map,Z.programs=Yt);let be=Yt.get(Wt);if(be!==void 0){if(Z.currentProgram===be&&Z.lightsStateVersion===Ot)return wp(A,Lt),be}else Lt.uniforms=Tt.getUniforms(A),L!==null&&A.isNodeMaterial&&L.build(A,tt,Lt),A.onBeforeCompile(Lt,C),be=Tt.acquireProgram(Lt,Wt),Yt.set(Wt,be),Z.uniforms=Lt.uniforms;let qt=Z.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(qt.clippingPlanes=st.uniform),wp(A,Lt),Z.needsLights=iv(A),Z.lightsStateVersion=Ot,Z.needsLights&&(qt.ambientLightColor.value=$.state.ambient,qt.lightProbe.value=$.state.probe,qt.sunLights.value=$.state.sun,qt.sunLightShadows.value=$.state.sunShadow,qt.directionalLights.value=$.state.directional,qt.directionalLightShadows.value=$.state.directionalShadow,qt.spotLights.value=$.state.spot,qt.spotLightShadows.value=$.state.spotShadow,qt.rectAreaLights.value=$.state.rectArea,qt.ltc_1.value=$.state.rectAreaLTC1,qt.ltc_2.value=$.state.rectAreaLTC2,qt.pointLights.value=$.state.point,qt.pointLightShadows.value=$.state.pointShadow,qt.hemisphereLights.value=$.state.hemi,qt.sunShadowMatrix.value=$.state.sunShadowMatrix,qt.sunShadowCascade.value=$.state.sunShadowCascade,qt.directionalShadowMatrix.value=$.state.directionalShadowMatrix,qt.spotLightMatrix.value=$.state.spotLightMatrix,qt.spotLightMap.value=$.state.spotLightMap,qt.pointShadowMatrix.value=$.state.pointShadowMatrix),Z.lightProbeGrid=S.state.lightProbeGridArray.length>0,Z.currentProgram=be,Z.uniformsList=null,be}function Ep(A){if(A.uniformsList===null){let H=A.currentProgram.getUniforms();A.uniformsList=Uo.seqWithValue(H.seq,A.uniforms)}return A.uniformsList}function wp(A,H){let tt=K.get(A);tt.outputColorSpace=H.outputColorSpace,tt.batching=H.batching,tt.batchingColor=H.batchingColor,tt.instancing=H.instancing,tt.instancingColor=H.instancingColor,tt.instancingMorph=H.instancingMorph,tt.skinning=H.skinning,tt.morphTargets=H.morphTargets,tt.morphNormals=H.morphNormals,tt.morphColors=H.morphColors,tt.morphTargetsCount=H.morphTargetsCount,tt.numClippingPlanes=H.numClippingPlanes,tt.numIntersection=H.numClipIntersection,tt.vertexAlphas=H.vertexAlphas,tt.vertexTangents=H.vertexTangents,tt.toneMapping=H.toneMapping}function tv(A,H){if(A.length===0)return null;if(A.length===1)return A[0].texture!==null?A[0]:null;y.setFromMatrixPosition(H.matrixWorld);for(let tt=0,Z=A.length;tt<Z;tt++){let $=A[tt];if($.texture!==null&&$.boundingBox.containsPoint(y))return $}return null}function ev(A,H,tt,Z,$){H.isScene!==!0&&(H=$t),it.resetTextureUnits();let Dt=H.fog,Ot=Z.isMeshStandardMaterial||Z.isMeshLambertMaterial||Z.isMeshPhongMaterial?H.environment:null,Lt=rt===null?C.outputColorSpace:rt.isXRRenderTarget===!0?rt.texture.colorSpace:Me.workingColorSpace,Wt=Z.isMeshStandardMaterial||Z.isMeshLambertMaterial&&!Z.envMap||Z.isMeshPhongMaterial&&!Z.envMap,Yt=Et.get(Z.envMap||Ot,Wt),ve=Z.vertexColors===!0&&!!tt.attributes.color&&tt.attributes.color.itemSize===4,be=!!tt.attributes.tangent&&(!!Z.normalMap||Z.anisotropy>0),qt=!!tt.morphAttributes.position,Le=!!tt.morphAttributes.normal,gn=!!tt.morphAttributes.color,Je=Gi;Z.toneMapped&&(rt===null||rt.isXRRenderTarget===!0)&&(Je=C.toneMapping);let ze=tt.morphAttributes.position||tt.morphAttributes.normal||tt.morphAttributes.color,Un=ze!==void 0?ze.length:0,Bt=K.get(Z),Wn=S.state.lights;if(yt===!0&&(bt===!0||A!==X)){let We=A===X&&Z.id===G;st.setState(Z,A,We)}let Ae=!1;Z.version===Bt.__version?(Bt.needsLights&&Bt.lightsStateVersion!==Wn.state.version||Bt.outputColorSpace!==Lt||$.isBatchedMesh&&Bt.batching===!1||!$.isBatchedMesh&&Bt.batching===!0||$.isBatchedMesh&&Bt.batchingColor===!0&&$._colorsTexture===null||$.isBatchedMesh&&Bt.batchingColor===!1&&$._colorsTexture!==null||$.isInstancedMesh&&Bt.instancing===!1||!$.isInstancedMesh&&Bt.instancing===!0||$.isSkinnedMesh&&Bt.skinning===!1||!$.isSkinnedMesh&&Bt.skinning===!0||$.isInstancedMesh&&Bt.instancingColor===!0&&$.instanceColor===null||$.isInstancedMesh&&Bt.instancingColor===!1&&$.instanceColor!==null||$.isInstancedMesh&&Bt.instancingMorph===!0&&$.morphTexture===null||$.isInstancedMesh&&Bt.instancingMorph===!1&&$.morphTexture!==null||Bt.envMap!==Yt||Z.fog===!0&&Bt.fog!==Dt||Bt.numClippingPlanes!==void 0&&(Bt.numClippingPlanes!==st.numPlanes||Bt.numIntersection!==st.numIntersection)||Bt.vertexAlphas!==ve||Bt.vertexTangents!==be||Bt.morphTargets!==qt||Bt.morphNormals!==Le||Bt.morphColors!==gn||Bt.toneMapping!==Je||Bt.morphTargetsCount!==Un||!!Bt.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(Ae=!0):(Ae=!0,Bt.__version=Z.version);let _i=Bt.currentProgram;Ae===!0&&(_i=jl(Z,H,$),L&&Z.isNodeMaterial&&L.onUpdateProgram(Z,_i,Bt));let Ji=!1,Fs=!1,qr=!1,He=_i.getUniforms(),dn=Bt.uniforms;if(w.useProgram(_i.program)&&(Ji=!0,Fs=!0,qr=!0),Z.id!==G&&(G=Z.id,Fs=!0),Bt.needsLights){let We=tv(S.state.lightProbeGridArray,$);Bt.lightProbeGrid!==We&&(Bt.lightProbeGrid=We,Fs=!0)}if(Ji||X!==A){w.buffers.depth.getReversed()&&A.reversedDepth!==!0&&(A._reversedDepth=!0,A.updateProjectionMatrix()),He.setValue(B,"projectionMatrix",A.projectionMatrix),He.setValue(B,"viewMatrix",A.matrixWorldInverse);let Os=He.map.cameraPosition;Os!==void 0&&Os.setValue(B,Rt.setFromMatrixPosition(A.matrixWorld)),P.logarithmicDepthBuffer&&He.setValue(B,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(Z.isMeshPhongMaterial||Z.isMeshToonMaterial||Z.isMeshLambertMaterial||Z.isMeshBasicMaterial||Z.isMeshStandardMaterial||Z.isShaderMaterial)&&He.setValue(B,"isOrthographic",A.isOrthographicCamera===!0),X!==A&&(X=A,Fs=!0,qr=!0)}if(Bt.needsLights&&(Wn.state.sunShadowMap.length>0&&He.setValue(B,"sunShadowMap",Wn.state.sunShadowMap,it),Wn.state.directionalShadowMap.length>0&&He.setValue(B,"directionalShadowMap",Wn.state.directionalShadowMap,it),Wn.state.spotShadowMap.length>0&&He.setValue(B,"spotShadowMap",Wn.state.spotShadowMap,it),Wn.state.pointShadowMap.length>0&&He.setValue(B,"pointShadowMap",Wn.state.pointShadowMap,it)),$.isSkinnedMesh){He.setOptional(B,$,"bindMatrix"),He.setOptional(B,$,"bindMatrixInverse");let We=$.skeleton;We&&(We.boneTexture===null&&We.computeBoneTexture(),He.setValue(B,"boneTexture",We.boneTexture,it))}$.isBatchedMesh&&(He.setOptional(B,$,"batchingTexture"),He.setValue(B,"batchingTexture",$._matricesTexture,it),He.setOptional(B,$,"batchingIdTexture"),He.setValue(B,"batchingIdTexture",$._indirectTexture,it),He.setOptional(B,$,"batchingColorTexture"),$._colorsTexture!==null&&He.setValue(B,"batchingColorTexture",$._colorsTexture,it));let Bs=tt.morphAttributes;if((Bs.position!==void 0||Bs.normal!==void 0||Bs.color!==void 0)&&D.update($,tt,_i),(Fs||Bt.receiveShadow!==$.receiveShadow)&&(Bt.receiveShadow=$.receiveShadow,He.setValue(B,"receiveShadow",$.receiveShadow)),(Z.isMeshStandardMaterial||Z.isMeshLambertMaterial||Z.isMeshPhongMaterial)&&Z.envMap===null&&H.environment!==null&&(dn.envMapIntensity.value=H.environmentIntensity),dn.dfgLUT!==void 0&&(dn.dfgLUT.value=Eb()),Fs){if(He.setValue(B,"toneMappingExposure",C.toneMappingExposure),Bt.needsLights&&nv(dn,qr),Dt&&Z.fog===!0&&Gt.refreshFogUniforms(dn,Dt),Gt.refreshMaterialUniforms(dn,Z,lt,J,S.state.transmissionRenderTarget[A.id]),Bt.needsLights&&Bt.lightProbeGrid){let We=Bt.lightProbeGrid;dn.probesSH.value=We.texture,dn.probesMin.value.copy(We.boundingBox.min),dn.probesMax.value.copy(We.boundingBox.max),dn.probesResolution.value.copy(We.resolution)}Uo.upload(B,Ep(Bt),dn,it)}if(Z.isShaderMaterial&&Z.uniformsNeedUpdate===!0&&(Uo.upload(B,Ep(Bt),dn,it),Z.uniformsNeedUpdate=!1),Z.isSpriteMaterial&&He.setValue(B,"center",$.center),He.setValue(B,"modelViewMatrix",$.modelViewMatrix),He.setValue(B,"normalMatrix",$.normalMatrix),He.setValue(B,"modelMatrix",$.matrixWorld),Z.uniformsGroups!==void 0){let We=Z.uniformsGroups;for(let Os=0,Xr=We.length;Os<Xr;Os++){let Rp=We[Os];at.update(Rp,_i),at.bind(Rp,_i)}}return _i}function nv(A,H){A.ambientLightColor.needsUpdate=H,A.lightProbe.needsUpdate=H,A.sunLights.needsUpdate=H,A.sunLightShadows.needsUpdate=H,A.directionalLights.needsUpdate=H,A.directionalLightShadows.needsUpdate=H,A.pointLights.needsUpdate=H,A.pointLightShadows.needsUpdate=H,A.spotLights.needsUpdate=H,A.spotLightShadows.needsUpdate=H,A.rectAreaLights.needsUpdate=H,A.hemisphereLights.needsUpdate=H}function iv(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return V},this.getActiveMipmapLevel=function(){return q},this.getRenderTarget=function(){return rt},this.setRenderTargetTextures=function(A,H,tt){let Z=K.get(A);Z.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,Z.__autoAllocateDepthBuffer===!1&&(Z.__useRenderToTexture=!1),K.get(A.texture).__webglTexture=H,K.get(A.depthTexture).__webglTexture=Z.__autoAllocateDepthBuffer?void 0:tt,Z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,H){let tt=K.get(A);tt.__webglFramebuffer=H,tt.__useDefaultFramebuffer=H===void 0},this.setRenderTarget=function(A,H=0,tt=0){rt=A,V=H,q=tt;let Z=null,$=!1,Dt=!1;if(A){let Lt=K.get(A);if(Lt.__useDefaultFramebuffer!==void 0){w.bindFramebuffer(B.FRAMEBUFFER,Lt.__webglFramebuffer),Q.copy(A.viewport),_t.copy(A.scissor),St=A.scissorTest,w.viewport(Q),w.scissor(_t),w.setScissorTest(St),G=-1;return}else if(Lt.__webglFramebuffer===void 0)it.setupRenderTarget(A);else if(Lt.__hasExternalTextures)it.rebindTextures(A,K.get(A.texture).__webglTexture,K.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){let ve=A.depthTexture;if(Lt.__boundDepthTexture!==ve){if(ve!==null&&K.has(ve)&&(A.width!==ve.image.width||A.height!==ve.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");it.setupDepthRenderbuffer(A)}}let Wt=A.texture;(Wt.isData3DTexture||Wt.isDataArrayTexture||Wt.isCompressedArrayTexture)&&(Dt=!0);let Yt=K.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Yt[H])?Z=Yt[H][tt]:Z=Yt[H],$=!0):A.samples>0&&it.useMultisampledRTT(A)===!1?Z=K.get(A).__webglMultisampledFramebuffer:Array.isArray(Yt)?Z=Yt[tt]:Z=Yt,Q.copy(A.viewport),_t.copy(A.scissor),St=A.scissorTest}else Q.copy(Ct).multiplyScalar(lt).floor(),_t.copy(Kt).multiplyScalar(lt).floor(),St=me;if(tt!==0&&(Z=k),w.bindFramebuffer(B.FRAMEBUFFER,Z)&&w.drawBuffers(A,Z),w.viewport(Q),w.scissor(_t),w.setScissorTest(St),$){let Lt=K.get(A.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+H,Lt.__webglTexture,tt)}else if(Dt){let Lt=H;for(let Wt=0;Wt<A.textures.length;Wt++){let Yt=K.get(A.textures[Wt]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+Wt,Yt.__webglTexture,tt,Lt)}}else if(A!==null&&tt!==0){let Lt=K.get(A.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Lt.__webglTexture,tt)}G=-1};function Tp(A){let H=K.get(A);return(H.__readFormat!==A.format||H.__readType!==A.type)&&(H.__readFormat=A.format,H.__readType=A.type,H.__formatReadable=P.textureFormatReadable(A.format),H.__typeReadable=P.textureTypeReadable(A.type)),H}this.readRenderTargetPixels=function(A,H,tt,Z,$,Dt,Ot,Lt=0){if(!(A&&A.isWebGLRenderTarget)){ne("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Wt=K.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Ot!==void 0&&(Wt=Wt[Ot]),Wt){w.bindFramebuffer(B.FRAMEBUFFER,Wt);try{let Yt=A.textures[Lt],ve=Yt.format,be=Yt.type;A.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Lt);let qt=Tp(Yt);if(qt.__formatReadable===!1){ne("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(qt.__typeReadable===!1){ne("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}H>=0&&H<=A.width-Z&&tt>=0&&tt<=A.height-$&&B.readPixels(H,tt,Z,$,pt.convert(ve),pt.convert(be),Dt)}finally{let Yt=rt!==null?K.get(rt).__webglFramebuffer:null;w.bindFramebuffer(B.FRAMEBUFFER,Yt)}}},this.readRenderTargetPixelsAsync=async function(A,H,tt,Z,$,Dt,Ot,Lt=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Wt=K.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Ot!==void 0&&(Wt=Wt[Ot]),Wt)if(H>=0&&H<=A.width-Z&&tt>=0&&tt<=A.height-$){w.bindFramebuffer(B.FRAMEBUFFER,Wt);let Yt=A.textures[Lt],ve=Yt.format,be=Yt.type;A.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Lt);let qt=Tp(Yt);if(qt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(qt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Le=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,Le),B.bufferData(B.PIXEL_PACK_BUFFER,Dt.byteLength,B.STREAM_READ),B.readPixels(H,tt,Z,$,pt.convert(ve),pt.convert(be),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);let gn=rt!==null?K.get(rt).__webglFramebuffer:null;w.bindFramebuffer(B.FRAMEBUFFER,gn);let Je=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await G0(B,Je,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,Le),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,Dt),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(Le),B.deleteSync(Je),Dt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,H=null,tt=0){let Z=Math.pow(2,-tt),$=Math.floor(A.image.width*Z),Dt=Math.floor(A.image.height*Z),Ot=H!==null?H.x:0,Lt=H!==null?H.y:0;it.setTexture2D(A,0),B.copyTexSubImage2D(B.TEXTURE_2D,tt,0,0,Ot,Lt,$,Dt),w.unbindTexture()},this.copyTextureToTexture=function(A,H,tt=null,Z=null,$=0,Dt=0){let Ot,Lt,Wt,Yt,ve,be,qt,Le,gn,Je=A.isCompressedTexture?A.mipmaps[Dt]:A.image;if(tt!==null)Ot=tt.max.x-tt.min.x,Lt=tt.max.y-tt.min.y,Wt=tt.isBox3?tt.max.z-tt.min.z:1,Yt=tt.min.x,ve=tt.min.y,be=tt.isBox3?tt.min.z:0;else{let dn=Math.pow(2,-$);Ot=Math.floor(Je.width*dn),Lt=Math.floor(Je.height*dn),A.isDataArrayTexture?Wt=Je.depth:A.isData3DTexture?Wt=Math.floor(Je.depth*dn):Wt=1,Yt=0,ve=0,be=0}Z!==null?(qt=Z.x,Le=Z.y,gn=Z.z):(qt=0,Le=0,gn=0);let ze=pt.convert(H.format),Un=pt.convert(H.type),Bt;H.isData3DTexture?(it.setTexture3D(H,0),Bt=B.TEXTURE_3D):H.isDataArrayTexture||H.isCompressedArrayTexture?(it.setTexture2DArray(H,0),Bt=B.TEXTURE_2D_ARRAY):(it.setTexture2D(H,0),Bt=B.TEXTURE_2D),w.activeTexture(B.TEXTURE0),w.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,H.flipY),w.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,H.premultiplyAlpha),w.pixelStorei(B.UNPACK_ALIGNMENT,H.unpackAlignment);let Wn=w.getParameter(B.UNPACK_ROW_LENGTH),Ae=w.getParameter(B.UNPACK_IMAGE_HEIGHT),_i=w.getParameter(B.UNPACK_SKIP_PIXELS),Ji=w.getParameter(B.UNPACK_SKIP_ROWS),Fs=w.getParameter(B.UNPACK_SKIP_IMAGES);w.pixelStorei(B.UNPACK_ROW_LENGTH,Je.width),w.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Je.height),w.pixelStorei(B.UNPACK_SKIP_PIXELS,Yt),w.pixelStorei(B.UNPACK_SKIP_ROWS,ve),w.pixelStorei(B.UNPACK_SKIP_IMAGES,be);let qr=A.isDataArrayTexture||A.isData3DTexture,He=H.isDataArrayTexture||H.isData3DTexture;if(A.isDepthTexture){let dn=K.get(A),Bs=K.get(H),We=K.get(dn.__renderTarget),Os=K.get(Bs.__renderTarget);w.bindFramebuffer(B.READ_FRAMEBUFFER,We.__webglFramebuffer),w.bindFramebuffer(B.DRAW_FRAMEBUFFER,Os.__webglFramebuffer);for(let Xr=0;Xr<Wt;Xr++)qr&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,K.get(A).__webglTexture,$,be+Xr),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,K.get(H).__webglTexture,Dt,gn+Xr)),B.blitFramebuffer(Yt,ve,Ot,Lt,qt,Le,Ot,Lt,B.DEPTH_BUFFER_BIT,B.NEAREST);w.bindFramebuffer(B.READ_FRAMEBUFFER,null),w.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if($!==0||A.isRenderTargetTexture||K.has(A)){let dn=K.get(A),Bs=K.get(H);w.bindFramebuffer(B.READ_FRAMEBUFFER,N),w.bindFramebuffer(B.DRAW_FRAMEBUFFER,O);for(let We=0;We<Wt;We++)qr?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,dn.__webglTexture,$,be+We):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,dn.__webglTexture,$),He?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Bs.__webglTexture,Dt,gn+We):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Bs.__webglTexture,Dt),$!==0?B.blitFramebuffer(Yt,ve,Ot,Lt,qt,Le,Ot,Lt,B.COLOR_BUFFER_BIT,B.NEAREST):He?B.copyTexSubImage3D(Bt,Dt,qt,Le,gn+We,Yt,ve,Ot,Lt):B.copyTexSubImage2D(Bt,Dt,qt,Le,Yt,ve,Ot,Lt);w.bindFramebuffer(B.READ_FRAMEBUFFER,null),w.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else He?A.isDataTexture||A.isData3DTexture?B.texSubImage3D(Bt,Dt,qt,Le,gn,Ot,Lt,Wt,ze,Un,Je.data):H.isCompressedArrayTexture?B.compressedTexSubImage3D(Bt,Dt,qt,Le,gn,Ot,Lt,Wt,ze,Je.data):B.texSubImage3D(Bt,Dt,qt,Le,gn,Ot,Lt,Wt,ze,Un,Je):A.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,Dt,qt,Le,Ot,Lt,ze,Un,Je.data):A.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,Dt,qt,Le,Je.width,Je.height,ze,Je.data):B.texSubImage2D(B.TEXTURE_2D,Dt,qt,Le,Ot,Lt,ze,Un,Je);w.pixelStorei(B.UNPACK_ROW_LENGTH,Wn),w.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Ae),w.pixelStorei(B.UNPACK_SKIP_PIXELS,_i),w.pixelStorei(B.UNPACK_SKIP_ROWS,Ji),w.pixelStorei(B.UNPACK_SKIP_IMAGES,Fs),Dt===0&&H.generateMipmaps&&B.generateMipmap(Bt),w.unbindTexture()},this.initRenderTarget=function(A){K.get(A).__webglFramebuffer===void 0&&it.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?it.setTextureCube(A,0):A.isData3DTexture?it.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?it.setTexture2DArray(A,0):it.setTexture2D(A,0),w.unbindTexture()},this.resetState=function(){V=0,q=0,rt=null,w.reset(),xt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Oi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=Me._getDrawingBufferColorSpace(t),e.unpackColorSpace=Me._getUnpackColorSpace()}};var Sl=.008333333333333333,kn=650,kt={halfX:4096,halfZ:5120,height:2044,chamfer:1150,cornerR:400,rampR:280,goalHalfW:893,goalH:642,goalDepth:880},Re={radius:93,mass:30,maxSpeed:6e3,maxSpin:6,drag:.0305,restitution:.6,friction:.285},Ut={mass:180,restHeight:17,hitboxHalf:{x:42.1,y:18.08,z:59},hitboxOffset:{x:0,y:20.75,z:13.88},wheels:[{x:25.9,z:51.25,r:12.5,front:!0},{x:-25.9,z:51.25,r:12.5,front:!0},{x:29.5,z:-33.75,r:15,front:!1},{x:-29.5,z:-33.75,r:15,front:!1}],maxSpeed:2300,maxDriveSpeed:1410,supersonic:2200,boostAccelGround:991.67,boostAccelAir:1058.33,boostUsePerSec:33.3,brakeAccel:3500,coastDecel:525,airThrottleAccel:66.67,jumpImpulse:291.67,jumpHoldAccel:1458.33,jumpHoldTime:.2,doubleJumpWindow:1.25,dodgeImpulse:500,dodgeTime:.65,stickyAccel:325,maxAngVel:5.5,airRoll:36.08,airPitch:12.15,airYaw:8.92,dampRoll:4.47,dampPitch:2.8,dampYaw:1.89},bf=33,su=[[-3584,0],[3584,0],[-3072,-4096],[3072,-4096],[-3072,4096],[3072,4096]],ru=[[0,-4240],[-1792,-4184],[1792,-4184],[-940,-3308],[940,-3308],[0,-2816],[-3584,-2484],[3584,-2484],[-1788,-2300],[1788,-2300],[-2048,-1036],[0,-1024],[2048,-1036],[-1024,0],[1024,0],[-2048,1036],[0,1024],[2048,1036],[-1788,2300],[1788,2300],[-3584,2484],[3584,2484],[0,2816],[-940,3310],[940,3308],[-1792,4184],[1792,4184],[0,4240]],Rm=[[-2048,-2560,Math.PI/4],[2048,-2560,-Math.PI/4],[-256,-3840,0],[256,-3840,0],[0,-4608,0]],Sf=[[-2304,-4608,0],[-2688,-4608,0],[2304,-4608,0],[2688,-4608,0]],Se={0:{main:1010687,light:6272255,dark:670362,css:"#2f7bff",flame:[.55,.85,1],flameEnd:[.1,.3,1]},1:{main:16738834,light:16756832,dark:9054720,css:"#ff7a1a",flame:[1,.85,.45],flameEnd:[1,.28,.04]}};var Ef=30,Qs=new E;function pn(s,t,e,n){let i=document.createElement(s);return t&&(i.className=t),n!==void 0&&(i.innerHTML=n),e&&e.appendChild(i),i}function wb(){let r=270/Ef,o="";for(let a=0;a<Ef;a++){let l=(135+a*r+.8)*Math.PI/180,c=(135+(a+1)*r-.8)*Math.PI/180,h=100+Math.cos(l)*84,u=100+Math.sin(l)*84,d=100+Math.cos(c)*84,f=100+Math.sin(c)*84;o+=`<path class="seg" d="M${h.toFixed(2)} ${u.toFixed(2)} A84 84 0 0 1 ${d.toFixed(2)} ${f.toFixed(2)}"/>`}return`<svg viewBox="0 0 200 200" class="boost-svg">
    <defs>
      <radialGradient id="bg-grad" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#0d2a5c" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="#040a1c" stop-opacity="0.92"/>
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="72" fill="url(#bg-grad)" stroke="#2c74ff" stroke-width="2.5" stroke-opacity="0.8"/>
    <circle cx="100" cy="100" r="64" fill="none" stroke="#5fb4ff" stroke-width="1" stroke-opacity="0.25"/>
    <g class="segs">${o}</g>
    <text x="100" y="114" text-anchor="middle" class="boost-num">33</text>
    <text x="100" y="144" text-anchor="middle" class="boost-label">BOOST</text>
  </svg>`}var ou=class{constructor(t){this.root=t,t.innerHTML="";let e=pn("div","scoreboard",t);this.sbBlue=pn("div","sb-team sb-blue",e,"<span>0</span>");let n=pn("div","sb-clock",e);this.sbTime=pn("div","sb-time",n,"5:00"),this.sbOT=pn("div","sb-ot",n,""),this.sbOrange=pn("div","sb-team sb-orange",e,"<span>0</span>"),this.viewsEl=pn("div","hud-views",t),this.banner=pn("div","banner",t),this.bannerMain=pn("div","banner-main",this.banner),this.bannerSub=pn("div","banner-sub",this.banner),this.feed=pn("div","feed",t),this.fps=pn("div","fps",t),this.views=[],this.bannerTimer=0,this.lastScores=[-1,-1],this.lastTime=""}show(t){this.root.classList.toggle("hidden",!t)}setup(t){this.viewsEl.innerHTML="",this.views=t.map(e=>{let n=pn("div","hud-view",this.viewsEl);n.style.left=e.rect[0]*100+"%",n.style.top=e.rect[1]*100+"%",n.style.width=e.rect[2]*100+"%",n.style.height=e.rect[3]*100+"%",t.length>1&&n.classList.add("split");let i=pn("div","boost-gauge",n,wb()),r=t.length>1?pn("div","player-tag",n,e.label):null;r&&(r.style.color=Se[e.team].css);let o=pn("div","item-slot hidden",n);o.innerHTML='<div class="item-icon"></div><div class="item-text"><div class="item-name"></div><div class="item-key"></div></div><div class="item-bar"><div></div></div>';let a=pn("div","view-status",n),l=pn("div","view-center",n),c=pn("div","plates",n);return{box:n,gauge:i,status:a,center:l,plates:c,plateMap:new Map,item:o,itemIcon:o.querySelector(".item-icon"),itemName:o.querySelector(".item-name"),itemKey:o.querySelector(".item-key"),itemBar:o.querySelector(".item-bar div"),itemSig:"",segs:Array.from(i.querySelectorAll(".seg")),num:i.querySelector(".boost-num"),lastBoost:-1,statusTimer:0,centerTimer:0}})}setScore(t,e){t!==this.lastScores[0]&&(this.sbBlue.firstChild.textContent=t,this.pulse(this.sbBlue)),e!==this.lastScores[1]&&(this.sbOrange.firstChild.textContent=e,this.pulse(this.sbOrange)),this.lastScores=[t,e]}pulse(t){this.lastScores[0]<0||(t.classList.remove("pulse"),t.offsetWidth,t.classList.add("pulse"))}setClock(t,e,n){let i;if(n)i="\u221E";else{let r=Math.max(0,e?Math.floor(t):Math.ceil(t));i=`${e?"+":""}${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`}i!==this.lastTime&&(this.sbTime.textContent=i,this.lastTime=i),this.sbOT.textContent=e?"OVERTIME":""}setBoost(t,e){let n=this.views[t];if(!n)return;let i=Math.round(e);if(i===n.lastBoost)return;n.lastBoost=i,n.num.textContent=i;let r=Math.ceil(e/100*Ef-.001);n.segs.forEach((o,a)=>o.classList.toggle("on",a<r)),n.gauge.classList.toggle("empty",i===0),n.gauge.classList.toggle("full",i===100)}setItem(t,e,n,i){let r=this.views[t];if(!r)return;if(!e){r.item.classList.add("hidden");return}r.item.classList.remove("hidden");let o=`${e.item}|${e.active}|${i}|${e.item?"":Math.ceil(e.next||0)}`;if(o!==r.itemSig){r.itemSig=o;let a=e.item?n[e.item]:null;r.item.classList.toggle("ready",!!e.item&&!e.active),r.item.classList.toggle("active",!!e.active),r.item.classList.toggle("empty",!e.item),r.itemIcon.textContent=a?a.icon:"\u23F3",r.itemName.textContent=a?a.name:"Power-up",r.itemKey.innerHTML=e.item?e.active?"active":`press <b>${i}</b>`:`next in ${Math.ceil(e.next||0)}s`}r.itemBar.style.transform=`scaleX(${e.active?e.frac:e.item?1:0})`}viewStatus(t,e,n=1.6){let i=this.views[t];i&&(i.status.textContent=e,i.status.classList.add("visible"),i.statusTimer=n)}viewCenter(t,e,n=2){let i=this.views[t];i&&(i.center.textContent=e,i.center.classList.add("visible"),i.centerTimer=n)}showBanner(t,e="",n="",i=2){this.bannerMain.textContent=t,this.bannerSub.textContent=e,this.banner.className="banner visible "+n,this.bannerTimer=i}hideBanner(){this.banner.className="banner",this.bannerTimer=0}addFeed(t,e=-1){let n=pn("div","feed-item"+(e>=0?" team"+e:""),this.feed,t);for(setTimeout(()=>n.classList.add("fade"),3500),setTimeout(()=>n.remove(),4200);this.feed.children.length>5;)this.feed.firstChild.remove()}updatePlates(t,e,n,i){let r=this.views[t];if(!r)return;let o=r.box.clientWidth,a=r.box.clientHeight,l=new Set;for(let c of n){if(c.car===i||c.car.demolished||(Qs.set(c.pos.x*.01,(c.pos.y+95)*.01,c.pos.z*.01).project(e),Qs.z>1||Qs.z<-1||Math.abs(Qs.x)>1.1||Math.abs(Qs.y)>1.1))continue;let h=r.plateMap.get(c.car.id);h||(h=pn("div","plate team"+c.car.team,r.plates,c.name),r.plateMap.set(c.car.id,h));let u=(Qs.x+1)/2*o,d=(1-Qs.y)/2*a,f=e.position.distanceTo(Qs.set(c.pos.x*.01,c.pos.y*.01,c.pos.z*.01));h.style.transform=`translate(${u.toFixed(1)}px, ${d.toFixed(1)}px) translate(-50%, -100%) scale(${Math.max(.55,Math.min(1,12/f)).toFixed(3)})`,h.style.display="",l.add(c.car.id)}for(let[c,h]of r.plateMap)l.has(c)||(h.style.display="none")}update(t){this.bannerTimer>0&&(this.bannerTimer-=t,this.bannerTimer<=0&&this.banner.classList.remove("visible"));for(let e of this.views)e.statusTimer>0&&(e.statusTimer-=t,e.statusTimer<=0&&e.status.classList.remove("visible")),e.centerTimer>0&&(e.centerTimer-=t,e.centerTimer<=0&&e.center.classList.remove("visible"))}setFps(t){this.fps.textContent=t}};var Lm=kt.halfZ,Tb=kt.goalHalfW,Rb=kt.goalH,wf=Re.radius,ke=new E,Am=new E,Cm=new E,Pm=new re,Tf=s=>(s===0?1:-1)*(Lm+450),au=class{reset(){}preStep(){}preBall(){}onTouch(){}postStep(){}},Rf=class extends au{constructor(t){super(),this.world=t,this.name="heatseeker",this.reset(),t.ball.force=(e,n)=>this.force(e,n)}reset(){this.team=-1,this.speed=0,this.lastBoost=-10,this.lastFlip=-10}onTouch(t){let e=this.world.time;(t.team!==this.team||e-this.lastBoost>.5)&&(this.speed=Math.min(4200,Math.max(1500,this.speed+160)),this.lastBoost=e),this.team=t.team}force(t,e){if(this.team<0)return;ke.set(0,330,Tf(this.team)).sub(t.pos);let n=ke.length();n<1||(ke.multiplyScalar(this.speed/n),t.vel.y+=kn*e*.92,t.vel.lerp(ke,1-Math.exp(-e*1.5)))}postStep(){if(this.team<0)return;let t=this.world.ball,e=(this.team===0?1:-1)*Lm,n=Math.abs(t.pos.z-e)<wf+40,i=Math.abs(t.pos.x)<Tb&&t.pos.y<Rb;n&&!i&&this.world.time-this.lastFlip>.6&&(this.team=1-this.team,this.lastFlip=this.world.time,this.world.events.push({type:"heatseekFlip",point:t.pos.clone()}))}},El={grapple:{name:"Grappling Hook",icon:"\u{1FA9D}",hint:"Pulls you to the ball"},plunger:{name:"Plunger",icon:"\u{1FAA0}",hint:"Pulls the ball to you"},tornado:{name:"Tornado",icon:"\u{1F32A}\uFE0F",hint:"Spins up everything near you"},curveball:{name:"Curveball",icon:"\u{1F300}",hint:"Curves the ball into their goal"},spikes:{name:"Spikes",icon:"\u{1F4CC}",hint:"The ball sticks to your car"},boot:{name:"Boot",icon:"\u{1F462}",hint:"Kicks the nearest opponent away"},power:{name:"Power Hitter",icon:"\u{1F4A5}",hint:"Huge hits and demolish on contact"},freezer:{name:"Freezer",icon:"\u2744\uFE0F",hint:"Freezes the ball in place"}},Oo=Object.keys(El),Im={grapple:4200,plunger:4200,curveball:5e3,freezer:6e3,boot:4500},Af=class extends au{constructor(t,e=Oo){super(),this.world=t,this.name="rumble",this.pool=e.length?e:Oo,this.state=new Map,this.curve=null,this.reset()}st(t){let e=this.state.get(t);return e||(e={item:null,timer:3,held:0,active:null,prevUse:!1},this.state.set(t,e)),e}reset(){for(let t of this.world.cars){let e=this.st(t);this.endActive(t,e),e.item=null,e.timer=2+Math.random()*3,e.prevUse=!!t.input.useItem}this.curve=null,this.world.ball.iceTimer=0,this.world.ball.attachedTo=null}give(t,e){e.item=this.pool[Math.floor(Math.random()*this.pool.length)],e.held=0,this.world.events.push({type:"itemGet",car:t,item:e.item})}inRange(t,e){let n=Im[e];return n?e==="boot"?!!this.nearestOpponent(t,n):t.pos.distanceTo(this.world.ball.pos)<n:!0}nearestOpponent(t,e){let n=null,i=e;for(let r of this.world.cars){if(r.team===t.team||r.demolished)continue;let o=r.pos.distanceTo(t.pos);o<i&&(i=o,n=r)}return n}use(t){let e=this.st(t);if(!e.item||e.active||t.demolished||this.world.ball.frozen)return!1;let n=e.item;if(!this.inRange(t,n))return this.world.events.push({type:"itemFail",car:t,item:n}),!1;e.item=null;let i=this.world,r=i.ball;switch(n){case"grapple":case"plunger":e.active={type:n,phase:"shoot",t:0,hook:t.pos.clone()};break;case"tornado":e.active={type:"tornado",t:0,dur:5.5};break;case"spikes":e.active={type:"spikes",t:0,dur:10,offset:null};break;case"power":e.active={type:"power",t:0,dur:8},t.hitPower=1.8;break;case"curveball":this.curve={team:t.team,t:4},r.vel.length()<1200&&(r.vel.addScaledVector(ke.set(0,0,Math.sign(Tf(t.team))),900),r.vel.y+=250),e.timer=9;break;case"freezer":r.iceTimer=3.5,r.vel.set(0,0,0),e.timer=9;break;case"boot":{let o=this.nearestOpponent(t,Im.boot);ke.copy(o.pos).sub(t.pos).setY(0).normalize(),o.vel.addScaledVector(ke,1700),o.vel.y+=1050,o.noGround=.25,o.onGround=!1,o.angVel.set(Math.random()-.5,0,Math.random()-.5).multiplyScalar(8),i.events.push({type:"boot",car:o,by:t,point:o.pos.clone()}),e.timer=9;break}default:break}return i.events.push({type:"itemUse",car:t,item:n}),!0}endActive(t,e){let n=e.active;n&&(n.type==="power"&&(t.hitPower=1),n.type==="spikes"&&this.world.ball.attachedTo===t&&this.release(t,!1),e.active=null,e.timer=8+Math.random()*3)}release(t,e){let n=this.world.ball;n.attachedTo===t&&(n.attachedTo=null,e&&(t.forward(Cm),n.vel.copy(t.vel).addScaledVector(Cm,950),n.vel.y+=250))}preStep(t){let e=this.world,n=e.ball;for(let i of e.cars){let r=this.st(i),o=!!i.input.useItem&&!r.prevUse;if(r.prevUse=!!i.input.useItem,i.demolished){r.active&&this.endActive(i,r);continue}o&&this.use(i),!r.item&&!r.active&&(r.timer-=t,r.timer<=0&&!n.frozen&&this.give(i,r)),r.item&&(r.held+=t);let a=r.active;if(a)switch(a.t+=t,a.type){case"grapple":case"plunger":{if(a.phase==="shoot"){ke.copy(n.pos).sub(a.hook);let l=ke.length(),c=6e3*t;l<=c+wf?(a.hook.copy(n.pos),a.phase="pull",a.pullT=0,e.events.push({type:"hooked",car:i,item:a.type,point:n.pos.clone()})):a.hook.addScaledVector(ke,c/l),a.t>1&&a.phase==="shoot"&&this.endActive(i,r)}else{a.pullT+=t,a.hook.copy(n.pos),ke.copy(n.pos).sub(i.pos);let l=ke.length();ke.divideScalar(Math.max(1,l)),a.type==="grapple"?(i.vel.addScaledVector(ke,5400*t),i.vel.y+=kn*.6*t,i.noGround=.12,(l<230||a.pullT>2)&&this.endActive(i,r)):(n.vel.addScaledVector(ke,-6800*t),n.vel.y+=kn*.5*t,(l<380||a.pullT>1.8)&&this.endActive(i,r))}break}case"tornado":{let c=(h,u)=>{ke.copy(h.pos).sub(i.pos);let d=Math.hypot(ke.x,ke.z);if(d>1050||h.pos.y>2200)return!1;let f=1-d/1050;return Am.set(-ke.z,0,ke.x).normalize(),h.vel.addScaledVector(Am,2e3*f*t*u),h.vel.y+=(kn+900*f+150)*t*u,d>1&&h.vel.addScaledVector(ke.set(ke.x/d,0,ke.z/d),-700*f*t*u),!0};!n.attachedTo&&n.iceTimer<=0&&c(n,1);for(let h of e.cars)h===i||h.demolished||c(h,.85)&&(h.noGround=.1,h.onGround=!1);a.t>a.dur&&this.endActive(i,r);break}case"spikes":case"power":a.t>a.dur&&this.endActive(i,r);break;default:break}}if(this.curve&&!n.attachedTo&&n.iceTimer<=0){this.curve.t-=t;let i=Math.hypot(n.vel.x,n.vel.z);ke.set(-n.pos.x,0,Tf(this.curve.team)-n.pos.z).normalize();let r=Math.atan2(n.vel.x,n.vel.z),a=Math.atan2(ke.x,ke.z)-r;for(;a>Math.PI;)a-=Math.PI*2;for(;a<-Math.PI;)a+=Math.PI*2;let l=Math.sign(a)*Math.min(Math.abs(a),2.2*t),c=Math.max(i,1500);n.vel.x=Math.sin(r+l)*c,n.vel.z=Math.cos(r+l)*c,this.curve.t<=0&&(this.curve=null)}}preBall(){let t=this.world.ball,e=t.attachedTo;if(!e)return;let n=this.st(e);if(!n.active||n.active.type!=="spikes"||e.demolished){this.release(e,!1);return}t.prevPos.copy(t.pos),ke.copy(n.active.offset).applyQuaternion(e.quat),t.pos.copy(e.pos).add(ke),t.vel.copy(e.vel)}onTouch(t){let e=this.world.ball;e.iceTimer>0&&(e.iceTimer=0),this.curve&&this.curve.team!==t.team&&(this.curve=null),e.attachedTo&&e.attachedTo!==t&&this.release(e.attachedTo,!1);let n=this.st(t);if(n.active&&n.active.type==="spikes"&&!e.attachedTo){Pm.copy(t.quat).invert();let i=e.pos.clone().sub(t.pos).applyQuaternion(Pm);i.setLength(Math.max(i.length(),wf+52)),n.active.offset=i,e.attachedTo=t,e.lastTouch=t}}postStep(){let t=this.world.ball;if(t.attachedTo)for(let e of this.world.events){if(e.type==="dodge"&&e.car===t.attachedTo){this.release(e.car,!0);break}if(e.type==="bump"&&e.car===t.attachedTo){this.release(e.car,!1);break}}}status(t){let e=this.st(t);if(e.active){let n=e.active,i=n.dur?Math.max(0,1-n.t/n.dur):1;return{item:n.type,active:!0,frac:i}}return e.item?{item:e.item,active:!1,frac:1}:{item:null,active:!1,frac:0,next:Math.max(0,e.timer)}}};function Dm(s,t,e){return t==="heatseeker"?new Rf(s):t==="rumble"?new Af(s,e):null}function hn(s,t,e,n){let i=document.createElement(s);return t&&(i.className=t),n!==void 0&&(i.innerHTML=n),e&&e.appendChild(i),i}var Ab={solo:{title:"PLAY vs CPU",humans:1},versus:{title:"2 PLAYERS \u2014 VERSUS",humans:2},coop:{title:"2 PLAYERS \u2014 CO-OP vs CPU",humans:2}},Nm=`
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
</div>`,lu=class{constructor(t,e){this.app=t,this.root=e,this.visible=!1,this.items=[],this.focus=0,this.screen=null,this.joinSlots=[null,null],e.addEventListener("mousemove",()=>{this.mouse=!0})}hide(){this.visible=!1,this.root.classList.add("hidden"),this.root.innerHTML="",this.screen=null}show(t,e){this.visible=!0,this.root.classList.remove("hidden"),this.root.innerHTML="",this.root.className="menu screen-"+t,this.screen=t,this.data=e,this.items=[],this.focus=0,this.onBack=null,this.custom=null,this["screen_"+t].call(this,e),this.refreshFocus()}panel(t,e){let n=hn("div","panel",this.root);return t&&hn("div","panel-title",n,t),e&&hn("div","panel-sub",n,e),n}button(t,e,n,i=""){let r=hn("div","item button "+i,t,`<span>${e}</span>`),o={el:r,type:"button",action:n};return r.addEventListener("click",()=>{this.focus=this.items.indexOf(o),this.activate()}),r.addEventListener("mouseenter",()=>{this.focus=this.items.indexOf(o),this.refreshFocus()}),this.items.push(o),o}option(t,e,n,i,r){let o=hn("div","item option",t);hn("span","opt-label",o,e);let a=hn("span","opt-ctl",o),l=hn("span","arrow",a,"\u25C0"),c=hn("span","opt-value",a),h=hn("span","arrow",a,"\u25B6"),u={el:o,type:"option",values:n,get:i,set:r,val:c},d=()=>{let f=i(),m=n.find(v=>v.value===f)||n[0];c.textContent=m.label};return u.render=d,u.change=f=>{let m=i(),v=n.findIndex(p=>p.value===m);v=(v+f+n.length)%n.length,r(n[v].value),d(),this.app.audio.click(),this.onOptionChange&&this.onOptionChange()},l.addEventListener("click",f=>{f.stopPropagation(),u.change(-1)}),h.addEventListener("click",f=>{f.stopPropagation(),u.change(1)}),o.addEventListener("click",()=>u.change(1)),o.addEventListener("mouseenter",()=>{this.focus=this.items.indexOf(u),this.refreshFocus()}),d(),this.items.push(u),u}refreshFocus(){this.items.forEach((t,e)=>t.el.classList.toggle("focused",e===this.focus))}activate(){let t=this.items[this.focus];t&&(t.type==="button"?(this.app.audio.select(),t.action()):t.type==="option"&&t.change(1))}update(t){if(!this.visible||this.custom&&this.custom(t))return;let e=this.items.length;t.up&&e&&(this.focus=(this.focus-1+e)%e,this.refreshFocus(),this.app.audio.click()),t.down&&e&&(this.focus=(this.focus+1)%e,this.refreshFocus(),this.app.audio.click());let n=this.items[this.focus];n&&n.type==="option"&&(t.left&&n.change(-1),t.right&&n.change(1)),t.confirm&&this.activate(),t.back&&this.onBack&&(this.app.audio.click(),this.onBack()),t.start&&this.onStart&&this.onStart()}screen_main(){let t=hn("div","logo",this.root);t.innerHTML='<div class="logo-top">ROCKET</div><div class="logo-bottom">ARENA</div><div class="logo-tag">supersonic car soccer</div>';let e=this.panel();e.classList.add("main-panel"),this.button(e,"\u25B6  PLAY vs CPU",()=>this.show("setup","solo"),"primary"),this.button(e,"\u{1F465}  2 PLAYERS \u2014 VERSUS",()=>this.show("setup","versus")),this.button(e,"\u{1F91D}  2 PLAYERS \u2014 CO-OP vs CPU",()=>this.show("setup","coop")),this.button(e,"\u2699  SETTINGS",()=>this.show("settings")),this.button(e,"\u{1F3AE}  CONTROLS",()=>this.show("controls")),this.button(e,"\u26F6  FULLSCREEN",()=>this.app.toggleFullscreen());let n=hn("div","footer",this.root);this.padStatus(n)}padStatus(t){let e=()=>{let n=this.app.input.connectedPads();if(this.app.input.gamepadBlocked){t.innerHTML='<span class="footer-hint warn">\u26A0\uFE0F Controllers are blocked on this page. Keyboard &amp; mouse work. For controllers, open the game from its own web address.</span>';return}t.innerHTML=n.length?n.map((i,r)=>`<span class="pad-chip">\u{1F3AE} ${Ku(i.id)} ${r+1}</span>`).join("")+'<span class="footer-hint">\u24B6 select \xB7 \u24B7 back</span>':'<span class="footer-hint">Connect an Xbox controller and press any button \xB7 or use mouse / keyboard (Enter to select)</span>'};e(),this.footerTimer=setInterval(()=>{t.isConnected?e():clearInterval(this.footerTimer)},1e3)}screen_setup(t){let e=this.app.settings,n=Ab[t],i=this.panel(n.title,t==="solo"?"You (blue) vs CPU (orange)":t==="versus"?"Player 1 (blue) vs Player 2 (orange) \xB7 split screen":"Player 1 & Player 2 (blue) vs CPU (orange) \xB7 split screen"),r=t==="coop"?[{label:"2 vs 2",value:2},{label:"3 vs 3",value:3}]:[{label:"1 vs 1",value:1},{label:"2 vs 2",value:2},{label:"3 vs 3",value:3}],o="teamSize_"+t;r.some(l=>l.value===e[o])||(e[o]=r[0].value),this.option(i,"Game mode",[{label:"Soccar",value:"soccar"},{label:"Heatseeker (ball homes in)",value:"heatseeker"},{label:"Rumble (power-ups)",value:"rumble"}],()=>e.gameMode,l=>{e.gameMode=l}),this.option(i,"Power-ups (Rumble)",[{label:"All, random",value:"all"}].concat(Oo.map(l=>({label:`${El[l].name} only`,value:l}))),()=>e.items,l=>{e.items=l}),this.option(i,"Team size",r,()=>e[o],l=>{e[o]=l}),this.option(i,"Match length",[{label:"3 minutes",value:180},{label:"5 minutes",value:300},{label:"7 minutes",value:420},{label:"1 minute",value:60},{label:"Unlimited",value:0}],()=>e.duration,l=>{e.duration=l}),this.option(i,"CPU skill",[{label:"Rookie",value:"rookie"},{label:"Pro",value:"pro"},{label:"All-Star",value:"allstar"}],()=>e.difficulty,l=>{e.difficulty=l}),this.worldOptions(i),t!=="solo"&&this.option(i,"Split screen",[{label:"Top / Bottom",value:"horizontal"},{label:"Side by side",value:"vertical"}],()=>e.split,l=>{e.split=l});let a=()=>{this.app.saveSettings(),t==="solo"?this.app.startMatch({mode:t,gameMode:e.gameMode,items:e.items,teamSize:e[o],duration:e.duration,difficulty:e.difficulty,split:e.split,humans:[{device:{type:"any"},team:0,name:"You"}]}):this.show("join",t)};this.button(i,t==="solo"?"\u25B6  KICK OFF":"\u25B6  CONTINUE",a,"primary"),this.button(i,"\u25C0  BACK",()=>this.show("main")),this.onBack=()=>this.show("main"),this.focus=this.items.length-2}worldOptions(t){let e=this.app.settings;this.option(t,"World",[{label:"Blocky voxel world",value:"blocky"},{label:"Classic night city",value:"classic"}],()=>e.world,n=>{e.world=n}),this.option(t,"Time of day",[{label:"Sunset",value:"sunset"},{label:"Day",value:"day"},{label:"Night",value:"night"},{label:"Day\u2013night cycle",value:"cycle"}],()=>e.timeOfDay,n=>{e.timeOfDay=n}),this.option(t,"Weather",[{label:"Clear",value:"clear"},{label:"Cloudy",value:"cloudy"},{label:"Rain",value:"rain"},{label:"Thunderstorm",value:"storm"},{label:"Fog",value:"fog"}],()=>e.weather,n=>{e.weather=n})}screen_join(t){let e=this.app.settings,n=this.app.input,i=this.panel("PRESS TO JOIN","Controller players press <b>\u24B6</b>. The keyboard &amp; mouse player clicks a slot or presses <b>Space</b>."),r=hn("div","join-blocked",i),o=hn("div","join-slots",i);this.joinSlots=[null,null];let a=(p,g)=>p&&g&&p.type===g.type&&(p.type==="pad"?p.index===g.index:p.layout===g.layout),l=p=>p.type==="pad"?"\u{1F3AE} "+Ku(n.pads[p.index]?.id):p.layout==="p1"?"\u2328\uFE0F\u{1F5B1}\uFE0F Keyboard &amp; Mouse":"\u2328\uFE0F Keyboard (arrow keys)",c=()=>!!(this.joinSlots[0]&&this.joinSlots[1]),h=()=>{},u=(p,g)=>{if(this.joinSlots.some(_=>a(_,p)))return!1;let x=g>=0&&!this.joinSlots[g]?g:this.joinSlots.findIndex(_=>!_);return x<0?!1:(this.joinSlots[x]=p,this.app.audio.select(),p.type==="pad"&&n.rumble(p,.5,.5,150),h(),!0)},d=[0,1].map(p=>{let g=t==="versus"?p:0,x=hn("div","join-slot team"+g,o);hn("div","join-title",x,`PLAYER ${p+1}`);let _=hn("div","join-body",x);return x.addEventListener("click",()=>{this.joinSlots[p]||u({type:"kb",layout:"p1"},p)||u({type:"kb",layout:"p2"},p)}),{box:x,body:_,team:g}}),f=hn("div","join-status",i),m=()=>{if(!c())return;let p=this.joinSlots.map((x,_)=>({device:x,team:t==="versus"?_:0,name:`Player ${_+1}`})),g=e["teamSize_"+t];this.app.startMatch({mode:t,gameMode:e.gameMode,items:e.items,teamSize:g,duration:e.duration,difficulty:e.difficulty,split:e.split,humans:p})},v=this.button(i,"\u25B6  START MATCH",m,"primary");this.button(i,"\u25C0  BACK",()=>this.show("setup",t)),h=()=>{d.forEach((p,g)=>{let x=this.joinSlots[g];if(p.box.classList.toggle("joined",!!x),p.box.classList.toggle("clickable",!x),x){let _=x.type==="pad"?"Press \u24B7 to leave":"Press Backspace to leave";p.body.innerHTML=`<div class="join-device">${l(x)}</div><div class="join-team" style="color:${Se[p.team].css}">${p.team===0?"BLUE":"ORANGE"} TEAM</div><div class="join-leave">${_}</div>`}else p.body.innerHTML='<div class="join-wait">Press <b>\u24B6</b> on a controller<br><span><b>Click here</b> or press <b>Space</b> for keyboard &amp; mouse</span></div>'}),f.innerHTML=c()?"<b>Ready!</b> Press <b>\u24B6</b>, <b>Start</b>, <b>Enter</b> or click <b>Start match</b>":"Waiting for players\u2026",f.classList.toggle("ready",c()),v.el.classList.toggle("hidden",!c()),r.innerHTML=n.gamepadBlocked?"\u26A0\uFE0F This page is not allowed to read game controllers, so only keyboard &amp; mouse work here. To play with a controller, open the game from its own web address (GitHub Pages) or from the downloaded <b>index.html</b>.":"",r.classList.toggle("hidden",!n.gamepadBlocked)},h(),this.custom=p=>{for(let x of n.connectedPads()){let _={type:"pad",index:x.index},y=this.joinSlots.findIndex(b=>a(b,_));if(x.pressed("a")||x.pressed("menu")){if(y<0)u(_,-1);else if(c())return m(),!0}if(x.pressed("b"))if(y>=0)this.joinSlots[y]=null,this.app.audio.click(),h();else return this.show("setup",t),!0}let g=x=>n.keysPressed.has(x);if(c()&&(g("Space")||g("Enter")||g("NumpadEnter")))return m(),!0;if(g("Space")&&u({type:"kb",layout:"p1"},-1),(g("Enter")||g("NumpadEnter"))&&u({type:"kb",layout:"p2"},-1),g("Backspace")){for(let x=1;x>=0;x--)if(this.joinSlots[x]&&this.joinSlots[x].type==="kb"){this.joinSlots[x]=null,h();break}}return g("Escape")?(this.show("setup",t),!0):(n.gamepadBlocked&&!this.blockedShown&&(this.blockedShown=!0,h()),!0)}}screen_settings(){let t=this.app.settings,e=this.panel("SETTINGS");this.option(e,"Graphics",[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low (fast)",value:"low"}],()=>t.quality,i=>{t.quality=i}),this.worldOptions(e),this.option(e,"Handling",[{label:"Easy (recommended)",value:"easy"},{label:"Realistic (Rocket League)",value:"realistic"}],()=>t.handling,i=>{t.handling=i}),this.option(e,"Default camera",[{label:"Ball cam",value:!0},{label:"Car cam",value:!1}],()=>t.ballCam,i=>{t.ballCam=i}),this.option(e,"Field of view",[90,95,100,105,110].map(i=>({label:i+"\xB0",value:i})),()=>t.fov,i=>{t.fov=i}),this.option(e,"Goal replays",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.replays,i=>{t.replays=i}),this.option(e,"Victory cinematic",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.victoryFx!==!1,i=>{t.victoryFx=i}),this.option(e,"Controller rumble",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.rumble,i=>{t.rumble=i}),this.option(e,"Volume",[0,1,2,3,4,5,6,7,8,9,10].map(i=>({label:i===0?"Off":String(i),value:i/10})),()=>Math.round(t.volume*10)/10,i=>{t.volume=i,this.app.audio.setVolume(i)}),this.option(e,"Show FPS",[{label:"Off",value:!1},{label:"On",value:!0}],()=>t.showFps,i=>{t.showFps=i});let n=()=>{this.app.applySettings(),this.show("main")};this.button(e,"\u25C0  BACK",n,"primary"),this.onBack=n}screen_controls(){let t=this.panel("CONTROLS");t.classList.add("wide"),hn("div","controls",t,Nm),this.button(t,"\u25C0  BACK",()=>this.show("main"),"primary"),this.onBack=()=>this.show("main")}screen_pause(){let t=this.panel("PAUSED");this.button(t,"\u25B6  RESUME",()=>this.app.resume(),"primary"),this.button(t,"\u21BB  RESTART MATCH",()=>this.app.restartMatch()),this.button(t,"\u{1F3AE}  CONTROLS",()=>this.show("pauseControls")),this.button(t,"\u23CF  QUIT TO MENU",()=>this.app.quitToMenu()),this.onBack=()=>this.app.resume(),this.onStart=()=>this.app.resume()}screen_pauseControls(){let t=this.panel("CONTROLS");t.classList.add("wide"),hn("div","controls",t,Nm),this.button(t,"\u25C0  BACK",()=>this.show("pause"),"primary"),this.onBack=()=>this.show("pause")}screen_results(t){let e=this.panel(t.winner===0?"BLUE TEAM WINS":"ORANGE TEAM WINS");e.classList.add("wide","results",t.winner===0?"win-blue":"win-orange"),hn("div","final-score",e,`<span class="b">${t.scores[0]}</span><span class="dash">\u2013</span><span class="o">${t.scores[1]}</span>`);let n=t.rows.map(i=>`<tr class="team${i.team}"><td class="nm">${i.name===t.mvp?'<span class="mvp">MVP</span> ':""}${i.name}${i.human?"":' <span class="cpu">CPU</span>'}</td><td>${i.score}</td><td>${i.goals}</td><td>${i.assists}</td><td>${i.saves}</td><td>${i.shots}</td><td>${i.demos}</td></tr>`).join("");hn("table","stats",e,`<tr><th>Player</th><th>Score</th><th>Goals</th><th>Assists</th><th>Saves</th><th>Shots</th><th>Demos</th></tr>${n}`),this.button(e,"\u21BB  REMATCH",()=>this.app.restartMatch(),"primary"),this.button(e,"\u23CF  MAIN MENU",()=>this.app.quitToMenu()),this.onBack=()=>this.app.quitToMenu()}};var Om=kt.halfX,Lf=kt.halfZ,Um=kt.height,Cb=kt.chamfer,tr=kt.cornerR,Cf=kt.rampR,If=kt.goalHalfW,Pb=kt.goalH,Ib=kt.goalDepth,er=Om-tr,nr=Lf-tr,Df=Om+Lf-Cb-tr*Math.SQRT2,Fm=er,Ho=Df-er,ko=Df-nr,Bm=nr;function Pf(s,t,e,n,i,r){let o=i-e,a=r-n,l=((s-e)*o+(t-n)*a)/(o*o+a*a);l=l<0?0:l>1?1:l;let c=s-e-o*l,h=t-n-a*l;return c*c+h*h}function Nf(s,t){let e=s<0?-s:s,n=t<0?-t:t,i=Math.min(Pf(e,n,er,0,Fm,Ho),Pf(e,n,Fm,Ho,ko,Bm),Pf(e,n,ko,Bm,0,nr)),r=e<er&&n<nr&&e+n<Df,o=Math.sqrt(i);return(r?-o:o)-tr}function Lb(s,t,e){let n=Nf(s,e),i=Math.abs(t-Um/2)-Um/2,r=n+Cf,o=i+Cf,a=r>0?r:0,l=o>0?o:0;return-(Math.sqrt(a*a+l*l)+Math.min(Math.max(r,o),0)-Cf)}function Db(s,t,e){return Math.min(If-Math.abs(s),t,Pb-t,Lf+Ib-Math.abs(e))}function fi(s,t,e){let n=Lb(s,t,e),i=Db(s,t,e);return n>i?n:i}function Ps(s,t,e,n){let r=fi(s+1,t,e)-fi(s-1,t,e),o=fi(s,t+1,e)-fi(s,t-1,e),a=fi(s,t,e+1)-fi(s,t,e-1),l=Math.hypot(r,o,a)||1;return n.x=r/l,n.y=o/l,n.z=a/l,n}function Hm(s,t,e,n,i,r,o){let a=0;for(let l=0;l<32;l++){let c=fi(s+n*a,t+i*a,e+r*a);if(c<.5)return a;if(a+=c,a>o)return-1}return a<=o?a:-1}function zo(s=220,t=5){let e=[[er,-Ho],[er,Ho],[ko,nr],[-ko,nr],[-er,Ho],[-er,-Ho],[-ko,-nr],[ko,-nr]],n=[],i=(o,a,l,c,h)=>{let u=n[n.length-1];u&&Math.abs(u.x-o)<1e-6&&Math.abs(u.z-a)<1e-6||n.push({x:o,z:a,nx:-l,nz:-c,wall:h})};for(let o=0;o<8;o++){let a=e[o],l=e[(o+1)%8],c=e[(o+2)%8],h=l[0]-a[0],u=l[1]-a[1],d=Math.hypot(h,u),f=[u/d,-h/d],m=o===2?"orange":o===6?"blue":o%2===0?"side":"corner",v=[],p=Math.max(1,Math.ceil(d/s));for(let T=0;T<=p;T++)v.push(T/p);if(m==="orange"||m==="blue"){for(let T of[If,-If]){let M=(T-a[0])/h;M>0&&M<1&&v.push(M)}v.sort((T,M)=>T-M)}for(let T of v)i(a[0]+h*T+f[0]*tr,a[1]+u*T+f[1]*tr,f[0],f[1],m);let g=c[0]-l[0],x=c[1]-l[1],_=Math.hypot(g,x),y=[x/_,-g/_],b=Math.atan2(f[1],f[0]),S=Math.atan2(y[1],y[0]);for(;S<b;)S+=Math.PI*2;for(let T=1;T<t;T++){let M=b+(S-b)*(T/t);i(l[0]+Math.cos(M)*tr,l[1]+Math.sin(M)*tr,Math.cos(M),Math.sin(M),"arc")}}let r=0;for(let o=0;o<n.length;o++)o>0&&(r+=Math.hypot(n[o].x-n[o-1].x,n[o].z-n[o-1].z)),n[o].s=r;return n.total=r+Math.hypot(n[0].x-n[n.length-1].x,n[0].z-n[n.length-1].z),n}var Vo=new E,Uf=new E,km=new E,Ff=new E,Bf=new E,Of=new E,Nb=Re.friction,Ub=2,Fb=3e-4;function Vm(s,t,e){let n=Re.radius;s.vel.y-=kn*t,e&&e(s,t),s.vel.multiplyScalar(1-Re.drag*t);let i=s.vel.length();i>Re.maxSpeed&&s.vel.multiplyScalar(Re.maxSpeed/i),s.pos.addScaledVector(s.vel,t);let r=0;for(let a=0;a<2;a++){let l=fi(s.pos.x,s.pos.y,s.pos.z);if(l>=n)break;Ps(s.pos.x,s.pos.y,s.pos.z,Vo),s.pos.addScaledVector(Vo,n-l);let c=s.vel.dot(Vo);if(c<0){Uf.copy(Vo).multiplyScalar(c),km.copy(s.vel).sub(Uf),Ff.crossVectors(Vo,s.angVel).multiplyScalar(n),Bf.copy(km).add(Ff);let h=Math.max(Bf.length(),1e-4),u=-c/h,d=-c<40?0:Re.restitution,f=Of.copy(Bf).multiplyScalar(-Math.min(1,Ub*u)*Nb);s.vel.addScaledVector(Uf,-(1+d)),s.vel.add(f),s.angVel.add(Ff.crossVectors(f,Vo).multiplyScalar(Fb*n)),r=Math.max(r,-c)}}let o=s.angVel.length();return o>Re.maxSpin&&s.angVel.multiplyScalar(Re.maxSpin/o),r}var cu=class{constructor(){this.pos=new E(0,Re.radius,0),this.vel=new E,this.angVel=new E,this.quat=new re,this.prevPos=this.pos.clone(),this.prevQuat=this.quat.clone(),this.lastTouch=null,this.prevTouch=null,this.lastTouchTime=-10,this.frozen=!1,this.force=null,this.iceTimer=0,this.attachedTo=null}reset(){this.pos.set(0,Re.radius,0),this.vel.set(0,0,0),this.angVel.set(0,0,0),this.prevPos.copy(this.pos),this.lastTouch=null,this.prevTouch=null,this.frozen=!0,this.iceTimer=0,this.attachedTo=null}step(t){if(this.attachedTo||(this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.frozen))return 0;if(this.iceTimer>0)return this.iceTimer-=t,this.vel.set(0,0,0),this.angVel.multiplyScalar(.95),0;let e=Vm(this,t,this.force),n=this.angVel.length();return n>1e-4&&(Of.copy(this.angVel).divideScalar(n),zm.setFromAxisAngle(Of,n*t),this.quat.premultiply(zm).normalize()),e}goalState(){let t=Re.radius;if(Math.abs(this.pos.x)<kt.goalHalfW&&this.pos.y<kt.goalH){if(this.pos.z>kt.halfZ+t)return 1;if(this.pos.z<-kt.halfZ-t)return 0}return-1}},zm=new re;function Hf(s,t,e,n){let i={pos:s.pos.clone(),vel:s.vel.clone(),angVel:s.angVel.clone()},r=Math.round(t/e);if(n.length=0,s.frozen||s.attachedTo||s.iceTimer>0){for(let o=0;o<=r;o++)n.push({t:o*e,pos:i.pos.clone(),vel:s.frozen?new E:i.vel.clone()});return n}for(let o=0;o<=r;o++)n.push({t:o*e,pos:i.pos.clone(),vel:i.vel.clone()}),Vm(i,e,s.force);return n}var hu=new E,pi=new E,Ze=new E,kf=new E,wl=new E,zf=new E,Ri=new E,Ur=new E,ds=new E,Gm=new re,Vf=new E,Gf=new E,Wm=new E,qm=new E,Xm=new E,Wf=new E,us=Ut.hitboxHalf;function Bb(s){return s<=500?.65:s<=2300?.65-.1*(s-500)/1800:Math.max(.3,.55-.25*(s-2300)/2300)}function Ob(s,t,e,n){if(s.demolished||t.frozen)return!1;let i=Re.radius;s.hitboxCenter(hu),Gm.copy(s.quat).invert(),pi.copy(t.pos).sub(hu).applyQuaternion(Gm);let r=Math.max(-us.x,Math.min(us.x,pi.x)),o=Math.max(-us.y,Math.min(us.y,pi.y)),a=Math.max(-us.z,Math.min(us.z,pi.z)),l=pi.x-r,c=pi.y-o,h=pi.z-a,u=Math.hypot(l,c,h);if(u>=i)return!1;if(u<.001){let b=us.x-Math.abs(pi.x),S=us.y-Math.abs(pi.y),T=us.z-Math.abs(pi.z);l=c=h=0,b<S&&b<T?l=Math.sign(pi.x)||1:S<T?c=Math.sign(pi.y)||1:h=Math.sign(pi.z)||1,u=0}else l/=u,c/=u,h/=u;Ze.set(l,c,h).applyQuaternion(s.quat);let d=i-u;kf.set(r,o,a).applyQuaternion(s.quat).add(hu);let f=Re.mass,m=Ut.mass;t.pos.addScaledVector(Ze,d*(m/(f+m))),s.pos.addScaledVector(Ze,-d*(f/(f+m)));let v=Math.min(4600,Ri.copy(s.vel).sub(t.vel).length());wl.copy(kf).sub(s.pos),zf.crossVectors(s.angVel,wl).add(s.vel);let p=Ri.copy(t.vel).sub(zf).dot(Ze);if(p>=0)return!0;Ri.crossVectors(wl,Ze),s.applyInvInertia(Ri),Ur.crossVectors(Ri,wl);let g=1/f+1/m+Ze.dot(Ur),x=-p/g;t.vel.addScaledVector(Ze,x/f),s.vel.addScaledVector(Ze,-x/m),s.onGround||(Ri.crossVectors(wl,Ze).multiplyScalar(-x*.5),s.angVel.add(s.applyInvInertia(Ri))),Ri.copy(zf).sub(t.vel),Ri.addScaledVector(Ze,-Ri.dot(Ze)),t.angVel.addScaledVector(ds.crossVectors(Ze,Ri),-.6/i);let _=-p;e-s.lastBallHit>.1&&(s.forward(Ur),ds.copy(t.pos).sub(hu),ds.y*=.35,ds.addScaledVector(Ur,-.35*ds.dot(Ur)),ds.normalize(),t.vel.addScaledVector(ds,v*Bb(v)*(s.hitPower||1)),_=Math.max(_,v)),s.lastBallHit=e;let y=t.vel.length();return y>Re.maxSpeed&&t.vel.multiplyScalar(Re.maxSpeed/y),n&&n.push({type:"ballHit",car:s,strength:_,point:kf.clone()}),!0}function Hb(s,t,e,n,i,r,o){let a=s.x-t.x*i,l=s.y-t.y*i,c=s.z-t.z*i,h=e.x-n.x*i,u=e.y-n.y*i,d=e.z-n.z*i,f=t.x*2*i,m=t.y*2*i,v=t.z*2*i,p=n.x*2*i,g=n.y*2*i,x=n.z*2*i,_=a-h,y=l-u,b=c-d,S=f*f+m*m+v*v,T=f*p+m*g+v*x,M=p*p+g*g+x*x,R=f*_+m*y+v*b,C=p*_+g*y+x*b,I=S*M-T*T,L=I>1e-6?(T*C-M*R)/I:0;L=Math.max(0,Math.min(1,L));let k=(T*L+C)/M;k<0?(k=0,L=Math.max(0,Math.min(1,-R/S))):k>1&&(k=1,L=Math.max(0,Math.min(1,(T-R)/S))),r.set(a+f*L,l+m*L,c+v*L),o.set(h+p*k,u+g*k,d+x*k)}var kb=1100,qf=new E;function Ym(s,t,e){if(s.team===t.team||s.demolished)return!1;s.forward(qf);let n=s.vel.dot(e)-t.vel.dot(e);return s.hitPower>1?qf.dot(e)>.25&&n>150:qf.dot(e)<.5?!1:s.supersonic?n>300:s.boosting&&s.vel.length()>kb&&n>700}function zb(s,t,e,n,i){if(s.demolished||t.demolished||(s.hitboxCenter(Vf),t.hitboxCenter(Gf),Vf.distanceToSquared(Gf)>62500))return;s.forward(Wm),t.forward(qm);let r=36;Hb(Vf,Wm,Gf,qm,us.z-r*.6,Xm,Wf),Ze.copy(Wf).sub(Xm);let o=Ze.length();if(o>=r*2)return;o<.001?(Ze.set(1,0,0),o=0):Ze.divideScalar(o);let a=r*2-o;s.pos.addScaledVector(Ze,-a/2),t.pos.addScaledVector(Ze,a/2);let l=Ri.copy(t.vel).sub(s.vel).dot(Ze);if(l>=0)return;ds.copy(Ze).negate();let c=Ym(s,t,Ze),h=Ym(t,s,ds);if(c||h){for(let[b,S]of[[s,t],[t,s]]){if(b===s?!c:!h)continue;let T=S.pos.clone();S.demolish(),b.stats.demos++,n&&n.push({type:"demo",car:S,by:b,point:T})}return}let u=s.id<t.id?s.id*1e3+t.id:t.id*1e3+s.id,d=i.get(u)??-10,f=s.vel.dot(Ze),m=-t.vel.dot(Ze),v=f>=m?s:t,p=v===s?t:s,g=v===s?Ze:ds;v.forward(Ur);let x=Ur.dot(g)>.55,_=-(1+.3)*l/2;s.vel.addScaledVector(Ze,-_),t.vel.addScaledVector(Ze,_);let y=-l;x&&y>350&&e-d>.25&&(p.vel.addScaledVector(g,y*.55),p.vel.y+=Math.min(600,y*.28),p.noGround=.15,p.onGround=!1,i.set(u,e),n&&n.push({type:"bump",car:p,by:v,strength:y,point:Wf.clone()}))}var uu=class{constructor(){this.ball=new cu,this.cars=[],this.time=0,this.events=[],this.bumpTimes=new Map,this.pads=[];for(let[t,e]of su)this.pads.push({x:t,z:e,big:!0,active:!0,timer:0});for(let[t,e]of ru)this.pads.push({x:t,z:e,big:!1,active:!0,timer:0});this.respawnIndex=0,this.mode=null}addCar(t){return t.events=this.events,this.cars.push(t),t}resetPads(){for(let t of this.pads)t.active=!0,t.timer=0}respawn(t){let e=Sf[this.respawnIndex++%Sf.length],n=t.team===0?1:-1,i=t.team===0?e[2]:Math.PI-e[2];t.place(e[0]*n,e[1]*n,i),this.events.push({type:"respawn",car:t})}step(t){this.time+=t;let{ball:e,cars:n,mode:i}=this;i&&i.preStep(t);for(let o of n){if(o.demolished){o.respawnTimer-=t,o.prevPos.copy(o.pos),o.respawnTimer<=0&&this.respawn(o);continue}o.step(t)}i&&i.preBall(t);let r=e.step(t);r>250&&this.events.push({type:"bounce",strength:r,point:e.pos.clone()});for(let o of n)e.attachedTo!==o&&Ob(o,e,this.time,this.events)&&(e.lastTouch!==o&&(e.prevTouch=e.lastTouch,e.lastTouch=o),e.lastTouchTime=this.time,i&&i.onTouch(o));for(let o=0;o<n.length;o++)for(let a=o+1;a<n.length;a++)zb(n[o],n[a],this.time,this.events,this.bumpTimes);for(let o of this.pads){if(!o.active){o.timer-=t,o.timer<=0&&(o.active=!0);continue}let a=o.big?208:144;for(let l of n){if(l.demolished||l.boost>=100||l.pos.y>180)continue;let c=l.pos.x-o.x,h=l.pos.z-o.z;if(c*c+h*h<a*a){l.boost=o.big?100:Math.min(100,l.boost+12),o.active=!1,o.timer=o.big?10:4,this.events.push({type:"boostPickup",car:l,big:o.big,pad:o});break}}}i&&i.postStep(t)}};var Zm=new E(0,1,0),$e=new E,un=new E,du=new E,fs=new E,wn=new E,Xf=new E,_n=new E,Tl=new E,Ke=new E,fu=new E,pu=new E,Yf=new E,Fr=new re,Rl=new re,$m=new re,Zn=Ut.hitboxHalf,nn=Ut.hitboxOffset,Zf=new E(12/(Ut.mass*((2*Zn.y)**2+(2*Zn.z)**2)),12/(Ut.mass*((2*Zn.x)**2+(2*Zn.z)**2)),12/(Ut.mass*((2*Zn.x)**2+(2*Zn.y)**2))),Al=[];for(let s of[-1,1])for(let t of[-1,1])for(let e of[-1,1])Al.push(new E(nn.x+s*Zn.x,nn.y+t*Zn.y,nn.z+e*Zn.z));Al.push(new E(nn.x,nn.y+Zn.y,nn.z),new E(nn.x,nn.y-Zn.y,nn.z),new E(nn.x+Zn.x,nn.y,nn.z),new E(nn.x-Zn.x,nn.y,nn.z),new E(nn.x,nn.y,nn.z+Zn.z),new E(nn.x,nn.y,nn.z-Zn.z));function Vb(s){return s<1400?1600-1440*s/1400:s<1410?160*(1-(s-1400)/10):0}var Go=[[0,.0069],[500,.00398],[1e3,.00235],[1500,.001375],[1750,.0011],[2500,88e-5]];function Gb(s){s=Math.abs(s);for(let t=1;t<Go.length;t++)if(s<=Go[t][0]){let e=Go[t-1],n=Go[t],i=(s-e[0])/(n[0]-e[0]);return e[1]+(n[1]-e[1])*i}return Go[Go.length-1][1]}function Wb(){return{throttle:0,steer:0,pitch:0,yaw:0,roll:0,jump:!1,boost:!1,powerslide:!1,useItem:!1}}var qb=0,mu=class{constructor(t,e="Player"){this.id=qb++,this.team=t,this.name=e,this.pos=new E,this.vel=new E,this.angVel=new E,this.quat=new re,this.prevPos=new E,this.prevQuat=new re,this.input=Wb(),this.hitPower=1,this.handling="easy",this.prevJump=!1,this.boost=bf,this.onGround=!1,this.groundNormal=new E(0,1,0),this.wheelContacts=0,this.wheelDist=[0,0,0,0],this.hasJumped=!1,this.canDodge=!1,this.jumpHold=0,this.noGround=0,this.sinceJump=10,this.dodgeTime=0,this.dodgeAxis=new E,this.dodgePitchSign=0,this.boosting=!1,this.supersonic=!1,this.demolished=!1,this.respawnTimer=0,this.frozen=!1,this.turtleTime=0,this.selfRight=0,this.yawRate=0,this.steerVisual=0,this.wheelSpin=0,this.lastBallHit=-10,this.bodyHit=0,this.events=null,this.stats={goals:0,assists:0,shots:0,saves:0,demos:0,score:0}}forward(t){return t.set(0,0,1).applyQuaternion(this.quat)}up(t){return t.set(0,1,0).applyQuaternion(this.quat)}left(t){return t.set(1,0,0).applyQuaternion(this.quat)}hitboxCenter(t){return t.set(nn.x,nn.y,nn.z).applyQuaternion(this.quat).add(this.pos)}place(t,e,n,i=bf){this.pos.set(t,Ut.restHeight,e),this.vel.set(0,0,0),this.angVel.set(0,0,0),this.quat.setFromAxisAngle(Zm,n),this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.boost=i,this.onGround=!0,this.groundNormal.set(0,1,0),this.hasJumped=!1,this.canDodge=!1,this.jumpHold=0,this.noGround=0,this.dodgeTime=0,this.demolished=!1,this.supersonic=!1,this.boosting=!1,this.turtleTime=0,this.yawRate=0}demolish(){this.demolished=!0,this.respawnTimer=3,this.vel.set(0,0,0),this.angVel.set(0,0,0),this.boosting=!1}speed(){return this.vel.length()}applyInvInertia(t){return $m.copy(this.quat).invert(),t.applyQuaternion($m),t.x*=Zf.x,t.y*=Zf.y,t.z*=Zf.z,t.applyQuaternion(this.quat)}step(t){if(this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.demolished||this.frozen){this.boosting=!1,this.prevJump=this.input.jump;return}let e=this.input,n=e.jump&&!this.prevJump;this.prevJump=e.jump,this.sinceJump+=t,this.noGround>0&&(this.noGround-=t),this.forward($e),this.up(un),this.left(du);let i=0,r=0;if(Xf.set(0,0,0),this.noGround<=0){let c=Ut.restHeight+14;for(let h=0;h<4;h++){let u=Ut.wheels[h];_n.copy(this.pos).addScaledVector(du,u.x).addScaledVector($e,u.z);let d=Hm(_n.x,_n.y,_n.z,-un.x,-un.y,-un.z,c);this.wheelDist[h]=d,d>=0&&(i++,r+=d,_n.addScaledVector(un,-d+2),Ps(_n.x,_n.y,_n.z,wn),Xf.add(wn))}}else this.wheelDist.fill(-1);this.wheelContacts=i;let o=!1;i>=2&&(wn.copy(Xf).normalize(),wn.dot(un)>.55&&(o=!0,-kn*wn.y>Ut.stickyAccel&&(o=!1,i>=3&&(this.hasJumped=!1,this.canDodge=!0,this.sinceJump=0))));let a=n;o&&n&&(a=!1,this.vel.addScaledVector(un,Ut.jumpImpulse),this.jumpHold=Ut.jumpHoldTime,this.hasJumped=!0,this.leftWithoutJump=!1,this.canDodge=!0,this.sinceJump=0,this.noGround=.12,o=!1,this.onGround=!1,this.events&&this.events.push({type:"jump",car:this})),o?this.groundStep(t,wn,r/i):this.airStep(t,a),this.bodyCollide(t,o);let l=this.vel.length();l>Ut.maxSpeed&&this.vel.multiplyScalar(Ut.maxSpeed/l),l>=Ut.supersonic?this.supersonic=!0:l<Ut.supersonic-100&&(this.supersonic=!1),this.steerVisual+=(e.steer-this.steerVisual)*Math.min(1,t*12),this.forward($e),this.wheelSpin+=this.vel.dot($e)/14*t}groundStep(t,e,n){let i=this.input,r=!this.onGround;if(this.onGround=!0,this.groundNormal.copy(e),this.hasJumped=!1,this.leftWithoutJump=!1,this.canDodge=!1,this.jumpHold=0,this.dodgeTime=0,this.turtleTime=0,this.selfRight=0,r){let _=-this.vel.dot(e);this.events&&_>250&&this.events.push({type:"land",car:this,strength:_})}this.up(un),Fr.setFromUnitVectors(un,e),Rl.identity().slerp(Fr,1-Math.exp(-t*28)),this.quat.premultiply(Rl).normalize(),this.vel.y-=kn*t;let o=this.vel.dot(e);o<40&&this.vel.addScaledVector(e,-o),this.forward($e),$e.addScaledVector(e,-$e.dot(e)).normalize(),fs.crossVectors($e,e).normalize();let a=this.vel.dot($e),l=i.throttle,c=i.boost&&this.boost>0;c&&(l=1);let h=0;if(l!==0)a*l>=0||Math.abs(a)<25?h=Vb(Math.abs(a))*l:(h=Ut.brakeAccel*Math.sign(l),Math.abs(a)<Ut.brakeAccel*t&&(h=-a/t));else if(Math.abs(a)>0){let _=Math.min(Ut.coastDecel,Math.abs(a)/t);h=-Math.sign(a)*_}this.vel.addScaledVector($e,h*t),c&&(this.vel.addScaledVector($e,Ut.boostAccelGround*t),this.boost=Math.max(0,this.boost-Ut.boostUsePerSec*t)),this.boosting=c;let u=this.handling!=="realistic",d=this.vel.dot($e),f=Gb(d);u&&(f*=1+.55*Math.min(1,Math.max(0,(Math.abs(d)-400)/1600)));let m=-i.steer*f*d;i.powerslide&&(m*=1.35),this.yawRate+=(m-this.yawRate)*(1-Math.exp(-t*(u?26:18))),Math.abs(this.yawRate)>1e-5&&(Fr.setFromAxisAngle(e,this.yawRate*t),this.quat.premultiply(Fr).normalize(),u&&!i.powerslide&&this.vel.applyQuaternion(Rl.identity().slerp(Fr,.85)));let v=Math.min(1,Math.max(.3,(kn*Math.max(0,e.y)+Ut.stickyAccel)/(kn+Ut.stickyAccel))),p=(i.powerslide?2.2:u?30:14)*v;this.forward($e),$e.addScaledVector(e,-$e.dot(e)).normalize(),fs.crossVectors($e,e).normalize();let g=this.vel.dot(fs);this.vel.addScaledVector(fs,-g*(1-Math.exp(-t*p))),this.pos.addScaledVector(this.vel,t);let x=Ut.restHeight-n;this.pos.addScaledVector(e,x*(1-Math.exp(-t*30))),this.angVel.copy(e).multiplyScalar(this.yawRate)}airStep(t,e){let n=this.input;this.onGround&&(this.onGround=!1,this.hasJumped||(this.canDodge=!0,this.sinceJump=0,this.hasJumped=!0,this.leftWithoutJump=!0)),this.onGround=!1,this.yawRate=0,this.forward($e),this.up(un),this.left(du),fs.copy(du).negate(),this.vel.y-=kn*t,this.jumpHold>0&&(n.jump?(this.vel.addScaledVector(un,Ut.jumpHoldAccel*t),this.jumpHold-=t):this.jumpHold=0);let i=this.leftWithoutJump?1e9:Ut.doubleJumpWindow;if(e&&this.canDodge&&this.sinceJump<i){this.canDodge=!1,this.jumpHold=0;let l=-n.pitch,c=n.yaw;if(Math.abs(l)+Math.abs(c)>=.5){let h=l,u=c,d=Math.hypot(h,u);d>1&&(h/=d,u/=d),Ke.set($e.x,0,$e.z),Ke.lengthSq()<1e-4&&Ke.set(-un.x,0,-un.z),Ke.normalize(),fu.set(-Ke.z,0,Ke.x);let f=h>=0?Ut.dodgeImpulse:Ut.dodgeImpulse*1.066,m=this.vel.length(),v=Ut.dodgeImpulse*(1+.9*Math.min(1,m/Ut.maxSpeed));this.vel.addScaledVector(Ke,h*f).addScaledVector(fu,u*v*.9),this.vel.y*=.35,this.angVel.copy(fs).multiplyScalar(-h*Ut.maxAngVel).addScaledVector($e,u*Ut.maxAngVel),this.dodgeTime=Ut.dodgeTime,this.dodgeAxis.copy(this.angVel),this.dodgePitchSign=Math.sign(-h),this.events&&this.events.push({type:"dodge",car:this})}else this.vel.addScaledVector(un,Ut.jumpImpulse),this.events&&this.events.push({type:"jump",car:this})}if(this.selfRight>0)this.selfRight-=t,Ke.set($e.x,0,$e.z),Ke.lengthSq()<.001&&Ke.set(-un.x,0,-un.z),Ke.lengthSq()<1e-6&&Ke.set(0,0,1),Ke.normalize(),Rl.setFromAxisAngle(Zm,Math.atan2(Ke.x,Ke.z)),this.quat.slerp(Rl,1-Math.exp(-t*9)),this.angVel.set(0,0,0);else if(this.dodgeTime>0){if(this.dodgeTime-=t,this.dodgePitchSign!==0&&Math.sign(n.pitch)===this.dodgePitchSign&&Math.abs(n.pitch)>.5){let c=this.angVel.dot(fs);this.angVel.addScaledVector(fs,-c*Math.min(1,t*20))}}else{let l=n.pitch,c=n.yaw,h=n.roll;n.powerslide&&(h=Math.max(-1,Math.min(1,h+n.yaw)),c=0);let u=this.angVel.dot(fs),d=this.angVel.dot(un),f=this.angVel.dot($e);u+=(Ut.airPitch*l-Ut.dampPitch*u*(1-Math.abs(l)))*t,d+=(-Ut.airYaw*c-Ut.dampYaw*d*(1-Math.abs(c)))*t,f+=(Ut.airRoll*h-Ut.dampRoll*f)*t,this.angVel.copy(fs).multiplyScalar(u).addScaledVector(un,d).addScaledVector($e,f)}let r=this.angVel.length();r>Ut.maxAngVel&&this.angVel.multiplyScalar(Ut.maxAngVel/r);let o=n.boost&&this.boost>0;o?(this.vel.addScaledVector($e,Ut.boostAccelAir*t),this.boost=Math.max(0,this.boost-Ut.boostUsePerSec*t)):n.throttle!==0&&this.vel.addScaledVector($e,Ut.airThrottleAccel*n.throttle*t),this.boosting=o,this.pos.addScaledVector(this.vel,t);let a=this.angVel.length();a>1e-6&&(Ke.copy(this.angVel).divideScalar(a),Fr.setFromAxisAngle(Ke,a*t),this.quat.premultiply(Fr).normalize()),this.up(un),Ps(this.pos.x,this.pos.y,this.pos.z,wn),this.turtled=this.bodyHit>0&&this.vel.lengthSq()<300*300&&un.dot(wn)<.5,this.turtled?(this.turtleTime+=t,(e&&this.turtleTime>.15||this.turtleTime>2.5)&&(this.vel.y+=340,this.selfRight=.6,this.turtleTime=0,this.canDodge=!1)):this.turtleTime=0}bodyCollide(t,e){this.bodyHit=Math.max(0,this.bodyHit-t);for(let n=0;n<3;n++){let i=0,r=-1;for(let u=0;u<Al.length;u++){_n.copy(Al[u]).applyQuaternion(this.quat).add(this.pos);let d=fi(_n.x,_n.y,_n.z);if(d<i){if(e&&(Ps(_n.x,_n.y,_n.z,wn),this.up(un),Math.abs(wn.dot(un))>.6))continue;i=d,r=u}}if(r<0)return;if(_n.copy(Al[r]).applyQuaternion(this.quat).add(this.pos),Ps(_n.x,_n.y,_n.z,wn),this.pos.addScaledVector(wn,-i+.1),this.bodyHit=.2,Tl.copy(_n).sub(this.pos),e){let u=this.vel.dot(wn);u<0&&this.vel.addScaledVector(wn,-u*1.2);continue}Yf.crossVectors(this.angVel,Tl).add(this.vel);let o=Yf.dot(wn);if(o>=0)continue;Ke.crossVectors(Tl,wn),this.applyInvInertia(Ke),fu.crossVectors(Ke,Tl);let a=1/Ut.mass+wn.dot(fu),c=-(1+(o<-350?.3:0))*o/a;pu.copy(wn).multiplyScalar(c),Ke.copy(Yf).addScaledVector(wn,-o);let h=Ke.length();if(h>.001){Ke.divideScalar(h);let u=Math.min(.6*c,h*Ut.mass/2);pu.addScaledVector(Ke,-u)}this.vel.addScaledVector(pu,1/Ut.mass),Ke.crossVectors(Tl,pu),this.angVel.add(this.applyInvInertia(Ke))}}};var Km={rookie:{itemDelay:2.5,replan:.32,aimError:650,boost:.35,dodge:!1,kickoffFlip:!1,jumpReach:200,aerial:!1,maxSpeed:1900,wrongSideCare:.4},pro:{itemDelay:1,replan:.14,aimError:260,boost:.85,dodge:!0,kickoffFlip:!0,jumpReach:420,aerial:!1,maxSpeed:2300,wrongSideCare:.8},allstar:{itemDelay:.4,replan:.05,aimError:90,boost:1,dodge:!0,kickoffFlip:!0,jumpReach:1300,aerial:!0,maxSpeed:2300,wrongSideCare:1}},Tn=new E,gu=new E,ir=new E,Br=new E,Ee=new E,Ai=new E,$n=new E,Xb=new E(0,-kn,0),Jm=new E,ps=Re.radius,ni=kt.halfZ,Is=kt.goalHalfW;function jm(s){if(s<=0)return 0;let t=(Ut.jumpHoldAccel-kn)/2;if(s<=74.6)return(-Ut.jumpImpulse+Math.sqrt(Ut.jumpImpulse**2+4*t*s))/(2*t);let e=453.3,i=e*e-4*325*(s-74.6);return i<0?1/0:.2+(e-Math.sqrt(i))/650}function Yb(s){if(s<=96)return jm(s);let t=712,n=t*t-4*325*(s-96);return n<0?1/0:.25+(t-Math.sqrt(n))/650}var Wo=[[0,.0069],[500,.00398],[1e3,.00235],[1500,.001375],[1750,.0011],[2500,88e-5]];function Zb(s){for(let t=1;t<Wo.length;t++)if(s<=Wo[t][0]){let e=Wo[t-1],n=Wo[t];return e[1]+(n[1]-e[1])*(s-e[0])/(n[0]-e[0])}return Wo[Wo.length-1][1]}function $b(s,t,e,n){t=Math.max(0,Math.min(t,e));let i=(e-t)/n,r=(t+e)/2*i;return s<=r?(-t+Math.sqrt(t*t+2*n*s))/n:i+(s-r)/e}var vu=class{constructor(t,e="pro"){this.car=t,this.cfg=Km[e]||Km.pro,this.replanT=Math.random()*.1,this.target=new E,this.ballTarget=new E,this.desiredSpeed=2300,this.interceptT=1,this.mode="chase",this.seq=null,this.seqT=0,this.stuckT=0,this.reverseT=0,this.aimOffset=(Math.random()-.5)*this.cfg.aimError,this.aerialing=!1,this.lastJumpAt=-10,this.careT=0,this.cares=!0,this.retreatStart=-10}get attackSign(){return this.car.team===0?1:-1}startSeq(t){this.seq=t,this.seqT=0}wantItem(t){let e=t.rumble;if(!e)return!1;let n=e.st(this.car);if(!n.item||n.active||n.held<this.cfg.itemDelay)return!1;let i=this.car,r=t.world.ball,o=this.attackSign,a=i.pos.distanceTo(r.pos);i.forward(Tn),Ee.copy(r.pos).sub(i.pos).normalize();let l=Ee.dot(Tn),c=r.vel.z*o<-500,h=!1;switch(n.item){case"grapple":h=a>900&&a<3800&&l>.6&&r.pos.y<1500;break;case"plunger":h=a>900&&a<3800&&(c||r.pos.z*o<-2500);break;case"tornado":h=a<700;break;case"curveball":h=a<4500&&r.vel.z*o>300&&r.pos.z*o>-500;break;case"spikes":case"power":h=!0;break;case"boot":h=!!e.nearestOpponent(i,2200);break;case"freezer":h=c&&r.pos.z*o<-1500&&a<6e3;break;default:break}return!h&&n.held>12&&(h=e.inRange(i,n.item)),h}update(t,e){let n=this.car,i=n.input;if(n.demolished)return;let r=this.wantItem(e);if(i.useItem=r&&!this.itemTap,this.itemTap=i.useItem,this.replanT-=t,this.replanT<=0&&(this.replanT=this.cfg.replan*(.7+Math.random()*.6),this.plan(e)),i.throttle=0,i.steer=0,i.pitch=0,i.yaw=0,i.roll=0,i.boost=!1,i.powerslide=!1,this.seq){this.seqT+=t;let o=null;for(let a of this.seq)this.seqT>=a.t&&(o=a);if(!o||this.seqT>this.seq[this.seq.length-1].t+.05||o.end&&this.seqT>=o.t)this.seq=null;else{i.jump=!!o.jump,i.pitch=o.pitch||0,i.yaw=o.yaw||0,i.steer=o.yaw||0,i.throttle=o.throttle??1,i.boost=!!o.boost&&n.boost>0,o.aerial&&this.aerialControl(t,e);return}}if(i.jump=!1,!n.onGround){if(n.turtled){this.turtleTap=(this.turtleTap||0)+1,i.jump=this.turtleTap%8<4;return}this.aerialing?this.aerialControl(t,e):this.recover();return}this.aerialing=!1,this.drive(t,e)}plan(t){let e=this.car,n=t.world.ball,i=this.attackSign,r=t.pred;e.forward(Tn);let o=e.vel.length(),a=e.boost>8&&this.cfg.boost>.3,l=a?Math.min(this.cfg.maxSpeed,2200):1400,c=a?1900:1e3;if(t.kickoff){if(this.isClosest(t,n.pos)){this.mode="kickoff",this.target.copy(n.pos).add($n.set(0,0,-i*40)),this.ballTarget.copy(n.pos),this.desiredSpeed=2300;return}this.mode="support",this.setSupportTarget(t,!0);return}let h=this.cfg.jumpReach,u=null,d=null;for(let x=2;x<r.length;x+=2){let _=r[x];if(!d&&_.pos.z*i<-(ni+ps*.5)&&Math.abs(_.pos.x)<Is+100&&(d=_),u||_.pos.y>h+ps)continue;this.shotDir(_.pos,d||t.threatOwn,Ai),$n.copy(_.pos).addScaledVector(Ai,-(ps+70)),Ee.copy($n).sub(e.pos).setY(0);let y=Ee.length();Ee.normalize();let b=Math.acos(pe.clamp(Ee.dot(Tn.clone().setY(0).normalize()),-1,1)),S=e.vel.dot(Ee),T=$b(Math.max(0,y-60),S,l,c)+b*.32;if(_.pos.y>150&&(T+=.1),T<=_.t+.02){u=_;break}}u||(u=r[r.length-1]),this.interceptT=u.t,this.ballTarget.copy(u.pos);let f=!0;for(let x of t.teammates){if(x===e||x.demolished)continue;let _=x.pos.distanceTo(u.pos)/Math.max(800,x.vel.length()*.8+600),y=e.pos.distanceTo(u.pos)/Math.max(800,o*.8+600),b=(u.pos.z-x.pos.z)*i>0;if(_+(b?0:.6)<y-.15){f=!1;break}}let m=(e.pos.z-u.pos.z)*i,v=u.pos.z*i<0;if(!!d&&(m>-200||f)){if(m>300){this.mode="retreat",this.setRetreatTarget(u.pos),this.desiredSpeed=2300;return}this.mode="save",this.setHitTarget(u,d);return}if(!f){if(e.boost<30&&Math.random()<this.cfg.boost&&this.setBoostTarget(t)){this.mode="boost";return}this.mode="support",this.setSupportTarget(t,!1);return}this.careT-=this.cfg.replan,this.careT<=0&&(this.careT=2,this.cares=Math.random()<this.cfg.wrongSideCare);let g=this.mode==="retreat"&&m>-150&&t.time-this.retreatStart<3;if(m>250&&this.cares||g){this.mode!=="retreat"&&(this.retreatStart=t.time),this.mode="retreat",v||m>1500?this.setRetreatTarget(u.pos):this.target.set(u.pos.x*.5+(e.pos.x>u.pos.x?900:-900),0,u.pos.z-i*1300),this.clampTarget(),this.desiredSpeed=2300;return}if(e.boost<15&&!v&&u.t>2.2&&this.setBoostTarget(t)){this.mode="boost";return}this.mode="attack",this.setHitTarget(u,null)}aimPoint(t,e){let n=this.attackSign;return e?Jm.set(t.x>=0?4e3:-4e3,0,t.z+n*3e3):Jm.set(pe.clamp(t.x*.25+this.aimOffset,-Is+150,Is-150),0,n*(ni+300))}shotDir(t,e,n){let i=this.aimPoint(t,e);if(n.copy(i).sub(t).setY(0).normalize(),ir.copy(t).sub(this.car.pos).setY(0),ir.lengthSq()<1)return n;ir.normalize();let r=Math.acos(pe.clamp(n.dot(ir),-1,1)),o=pe.clamp((r-.6)/1.6,0,.75);return o>0&&n.lerp(ir,o).normalize(),n}setHitTarget(t,e){let n=this.car;this.shotDir(t.pos,e,Ai);let i=$n.copy(t.pos).sub(n.pos).setY(0).length(),r=pe.clamp(i*.45,ps+40,1200);for(;r>ps+40&&($n.copy(t.pos).addScaledVector(Ai,-r),!(Nf($n.x,$n.z)<-320&&Math.abs($n.z)<ni-250));)r-=80;r=Math.max(r,ps+40),this.target.copy(t.pos).addScaledVector(Ai,-r),this.target.y=0,this.clampTarget();let o=n.pos.distanceTo(this.target)+r,a=Math.max(.05,t.t),l=t.pos.y>180;this.desiredSpeed=l?pe.clamp(o/a,300,2300):2300,n.forward(Tn),Tn.setY(0).normalize();let c=Math.acos(pe.clamp(Tn.dot(Ai),-1,1));i<1100&&c>.6&&!e&&(this.desiredSpeed=Math.min(this.desiredSpeed,700+(1100-Math.min(1100,c*500))))}setRetreatTarget(t){let e=this.attackSign,n=t.x>0?-Is*.8:Is*.8;this.target.set(n,0,-e*(ni-350))}setSupportTarget(t,e){let n=this.car,i=t.world.ball,r=this.attackSign,o=t.teammates.indexOf(n),a=o%2===0?-1:1;if(e)n.boost<60&&Math.abs(n.pos.x)>1e3?this.target.set(Math.sign(n.pos.x)*3072,0,-r*4096):this.target.set(0,0,-r*(ni-500));else{let c=i.pos.z-r*(2200+o*900);this.target.set(i.pos.x*.35+a*1100,0,Math.max(-ni+400,Math.min(ni-400,c*r))*r)}this.clampTarget();let l=n.pos.distanceTo(this.target);this.desiredSpeed=l>1500?2300:l>400?1400:300}setBoostTarget(t){let e=this.car,n=this.attackSign,i=null,r=1/0;for(let o of t.world.pads){if(!o.big||!o.active||o.z*n>1500)continue;let a=Math.hypot(o.x-e.pos.x,o.z-e.pos.z);a<r&&(r=a,i=o)}return!i||r>4500?!1:(this.target.set(i.x,0,i.z),this.desiredSpeed=2300,!0)}clampTarget(){this.target.x=pe.clamp(this.target.x,-kt.halfX+250,kt.halfX-250),this.target.z=pe.clamp(this.target.z,-ni+150,ni-150)}isClosest(t,e){let n=this.car.pos.distanceTo(e);for(let i of t.teammates){if(i===this.car)continue;let r=i.pos.distanceTo(e);if(r<n-5||Math.abs(r-n)<=5&&i.pos.x*this.attackSign<this.car.pos.x*this.attackSign)return!1}return!0}drive(t,e){let n=this.car,i=n.input,r=n.groundNormal;n.forward(Tn),Br.crossVectors(Tn,r).normalize();let o=n.vel.length(),a=n.vel.dot(Tn),l=e.world.ball;if(l.attachedTo===n){$n.set(0,0,this.attackSign*(ni-300)),Ee.copy($n).sub(n.pos),Ee.addScaledVector(r,-Ee.dot(r));let C=Math.atan2(Ee.dot(Br),Ee.dot(Tn));i.throttle=1,i.steer=pe.clamp(C*3,-1,1),i.boost=Math.abs(C)<.4&&n.boost>0,Ee.length()<2600&&Math.abs(C)<.3&&e.time-this.lastJumpAt>1.2&&(this.lastJumpAt=e.time,this.startSeq([{t:0,jump:!0},{t:.06,jump:!1},{t:.09,jump:!0,pitch:-1},{t:.19,jump:!1,end:!0}]));return}let c=this.target,h=n.pos.distanceTo(l.pos);if((this.mode==="attack"||this.mode==="save"||this.mode==="kickoff")&&h<650&&l.pos.y<260&&(this.shotDir(l.pos,this.mode==="save",Ai),$n.copy(l.pos).addScaledVector(Ai,-(ps*.6)),Ee.copy(l.pos).sub(n.pos).setY(0).normalize(),Ee.dot(Ai)>.2&&(c=$n)),Math.abs(n.pos.z)>ni-60&&(Math.abs(c.x)>Is-100||Math.abs(c.z)<ni-200)){let C=Math.sign(n.pos.z);(Math.abs(n.pos.z)>ni+60||Math.abs(n.pos.x)>Is-80)&&(c=$n.set(pe.clamp(c.x,-Is+250,Is-250),0,C*(ni-500)))}Ee.copy(c).sub(n.pos),Ee.addScaledVector(r,-Ee.dot(r));let u=Ee.length(),d=Math.atan2(Ee.dot(Br),Ee.dot(Tn)),f=pe.clamp(d*3.2,-1,1),m=1,v=Math.abs(d)>1.6&&o>500,p=this.desiredSpeed;(this.mode==="support"||this.mode==="boost")&&(p=Math.min(p,u>1200?2300:Math.max(300,u*1.2)));let g=1/Zb(Math.max(a,0));if(Math.abs(d)>.3&&u<2*g*Math.sin(Math.min(Math.abs(d),Math.PI/2))*1.05&&(p=Math.min(p,Math.max(250,a*.5)),Math.abs(d)>1&&(v=o>350)),a>p+250&&(m=a>p+600?-1:0),this.reverseT>0){this.reverseT-=t,i.throttle=-1,i.steer=-f;return}o<120&&m>0?(this.stuckT+=t,this.stuckT>1.2&&(this.reverseT=.8,this.stuckT=0)):this.stuckT=0;let x=!1;if(n.boost>0&&Math.abs(d)<.3&&a<Math.min(this.cfg.maxSpeed,p)-80&&u>400){let C=this.mode==="kickoff"||this.mode==="save"||this.mode==="retreat"?0:this.cfg.boost<1?20:8;x=n.boost>C&&Math.random()<this.cfg.boost+.1}if(a>this.cfg.maxSpeed-50&&(x=!1),i.throttle=m,i.steer=f,i.powerslide=v,i.boost=x,this.mode==="kickoff"&&this.cfg.kickoffFlip&&h<520+o*.12&&o>1100&&Math.abs(d)<.25){this.startSeq([{t:0,jump:!0,boost:!0},{t:.07,jump:!1,boost:!0},{t:.1,jump:!0,pitch:-1,yaw:pe.clamp(d*2,-.4,.4)},{t:.2,jump:!1,pitch:-1,end:!0}]);return}let _=e.time;if(_-this.lastJumpAt<1.2)return;let y=l.pos.y;Ee.copy(l.pos).sub(n.pos);let b=Math.hypot(Ee.x,Ee.z),S=n.vel.clone().sub(l.vel),T=Math.max(1,S.dot(Ee.clone().setY(0).normalize())),M=Math.max(0,b-110)/T,R=Ee.clone().setY(0).normalize().dot(Tn.clone().setY(0).normalize());if(this.cfg.dodge&&y<220&&b<360&&R>.85&&o>600&&M<.2&&(this.mode==="attack"||this.mode==="save")){let C=pe.clamp(Ee.dot(Br)/120,-.6,.6);this.lastJumpAt=_,this.startSeq([{t:0,jump:!0},{t:.06,jump:!1},{t:.09,jump:!0,pitch:-1,yaw:C},{t:.19,jump:!1,pitch:-.4,end:!0}]);return}if(y>190&&y<this.cfg.jumpReach+100&&R>.8&&b<1400){let C=y-110,I=C<230,L=I?jm(C):Yb(C),k=l.vel.y<0?(y-110-ps)/Math.max(1,-l.vel.y):1/0,N=Math.min(M,k+.3);Number.isFinite(L)&&Math.abs(N-L)<.06&&(I||this.cfg.jumpReach>350)&&(this.lastJumpAt=_,I?this.startSeq([{t:0,jump:!0},{t:Math.min(.2,L),jump:!0},{t:L+.02,jump:!1,end:!0}]):this.cfg.aerial&&C>520?(this.aerialing=!0,this.startSeq([{t:0,jump:!0,aerial:!0},{t:.2,jump:!1,aerial:!0},{t:.24,jump:!0,aerial:!0,boost:!0},{t:.3,jump:!1,aerial:!0,boost:!0,end:!0}])):this.startSeq([{t:0,jump:!0},{t:.2,jump:!1},{t:.24,jump:!0},{t:.3,jump:!1,end:!0}]))}else if(this.cfg.aerial&&y>520&&y<1500&&R>.9&&b<1500&&n.boost>30&&o>400){let C=this.interceptT,I=(y-120)/600+.3;Math.abs(C-I)<.25&&this.ballTarget.y>450&&(this.lastJumpAt=_,this.aerialing=!0,this.startSeq([{t:0,jump:!0,aerial:!0,boost:!0},{t:.2,jump:!1,aerial:!0,boost:!0},{t:.24,jump:!0,aerial:!0,boost:!0},{t:.3,jump:!1,aerial:!0,boost:!0,end:!0}]))}}orient(t,e){let n=this.car,i=n.input;n.forward(Tn),n.up(gu),n.left(ir),Br.copy(ir).negate();let r=n.angVel,o=Math.atan2(t.dot(gu),t.dot(Tn)),a=Math.atan2(t.dot(Br),t.dot(Tn)),l=r.dot(Br),c=-r.dot(gu),h=r.dot(Tn);i.pitch=pe.clamp(o*3.5-l*.55,-1,1),i.yaw=pe.clamp(a*3.5-c*.55,-1,1);let u=Math.atan2(ir.dot(e),gu.dot(e));i.roll=pe.clamp(u*2.5-h*.4,-1,1),i.steer=i.yaw,i.powerslide=!1}aerialControl(t,e){let n=this.car,i=n.input,r=e.world.ball,o=e.pred,a=o[o.length-1];for(let h=1;h<o.length;h++){let u=o[h],d=u.pos.distanceTo(n.pos)-ps-40,f=n.vel.length();if(d/Math.max(900,f+500*u.t)<=u.t){a=u;break}}let l=Math.max(.1,a.t);Ai.copy(a.pos).sub(n.pos).addScaledVector(n.vel,-l).multiplyScalar(2/(l*l)).sub(Xb);let c=Ai.length();(c>1500||n.boost<=0||n.pos.distanceTo(r.pos)<ps+60)&&c>1500&&!this.seq&&(this.aerialing=!1),Ee.copy(Ai).normalize(),this.orient(Ee,$n.set(0,1,0)),n.forward(Tn),i.boost=n.boost>0&&Tn.dot(Ee)>.75&&c>250,i.throttle=1}recover(){let t=this.car,e=t.input;Ee.set(t.vel.x,0,t.vel.z),Ee.lengthSq()<100&&(t.forward(Ee),Ee.y=0),Ee.normalize(),this.orient(Ee,$n.set(0,1,0)),e.throttle=1,e.boost=!1}};function sr(s,t){let e=document.createElement("canvas");return e.width=s,e.height=t,e}function ms(s,{srgb:t=!0,repeat:e=!1,aniso:n=8}={}){let i=new Xe(s);return t&&(i.colorSpace=Te),e&&(i.wrapS=i.wrapT=bn),i.anisotropy=n,i}function qo(s=1){let t=s>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var mi={minZ:-(kt.halfZ+kt.goalDepth),maxZ:kt.halfZ+kt.goalDepth,halfX:kt.halfX};function Qm(s){let t=s==="low"?8:5.3333,e=Math.round(2*kt.halfX/t),n=Math.round((mi.maxZ-mi.minZ)/t),i=sr(e,n),r=i.getContext("2d"),o=x=>(x+kt.halfX)/t,a=x=>(mi.maxZ-x)/t,l=x=>x/t,c=512;for(let x=mi.minZ;x<mi.maxZ;x+=c){let _=Math.floor((x-mi.minZ)/c);r.fillStyle=_%2?"#3f7f2c":"#356f25",r.fillRect(0,a(x+c),e,l(c)+1)}let h=r.createLinearGradient(0,a(-kt.halfZ),0,a(0));h.addColorStop(0,"rgba(40,110,255,0.10)"),h.addColorStop(1,"rgba(40,110,255,0)"),r.fillStyle=h,r.fillRect(0,a(0),e,a(mi.minZ)-a(0)),h=r.createLinearGradient(0,a(kt.halfZ),0,a(0)),h.addColorStop(0,"rgba(255,120,30,0.10)"),h.addColorStop(1,"rgba(255,120,30,0)"),r.fillStyle=h,r.fillRect(0,0,e,a(0));let u=r.getImageData(0,0,e,n),d=u.data,f=qo(7);for(let x=0;x<d.length;x+=4){let _=(f()-.5)*26+(f()<.04?-18:0);d[x]=Math.max(0,Math.min(255,d[x]+_*.6)),d[x+1]=Math.max(0,Math.min(255,d[x+1]+_)),d[x+2]=Math.max(0,Math.min(255,d[x+2]+_*.4))}r.putImageData(u,0,0);for(let x of[1,-1]){r.fillStyle="rgba(10,20,10,0.45)";let _=x*kt.halfZ,y=x*(kt.halfZ+kt.goalDepth);r.fillRect(o(-kt.goalHalfW),Math.min(a(_),a(y)),l(2*kt.goalHalfW),Math.abs(a(y)-a(_)))}let m=(x,_)=>{r.lineWidth=l(x),r.strokeStyle=_};r.lineCap="round",r.lineJoin="round";let v="rgba(245,250,255,0.85)",p=zo(160,6);m(34,v),r.beginPath(),p.forEach((x,_)=>{let y=x.x+x.nx*(kt.rampR+60),b=x.z+x.nz*(kt.rampR+60);_===0?r.moveTo(o(y),a(b)):r.lineTo(o(y),a(b))}),r.closePath(),r.stroke(),r.beginPath(),r.moveTo(o(-kt.halfX+340),a(0)),r.lineTo(o(kt.halfX-340),a(0)),r.stroke(),r.beginPath(),r.arc(o(0),a(0),l(1e3),0,Math.PI*2),r.stroke(),r.fillStyle=v,r.beginPath(),r.arc(o(0),a(0),l(60),0,Math.PI*2),r.fill();for(let x of[-1,1]){let _=x<0?"rgba(70,150,255,0.95)":"rgba(255,140,50,0.95)",y=x*(kt.halfZ-340);m(40,_),r.beginPath(),r.moveTo(o(-kt.goalHalfW),a(x*kt.halfZ)),r.lineTo(o(kt.goalHalfW),a(x*kt.halfZ)),r.stroke(),m(30,v),r.beginPath(),r.moveTo(o(-1800),a(y)),r.lineTo(o(-1800),a(x*(kt.halfZ-1500))),r.lineTo(o(1800),a(x*(kt.halfZ-1500))),r.lineTo(o(1800),a(y)),r.stroke(),m(26,_),r.beginPath(),r.moveTo(o(-1150),a(y)),r.lineTo(o(-1150),a(x*(kt.halfZ-800))),r.lineTo(o(1150),a(x*(kt.halfZ-800))),r.lineTo(o(1150),a(y)),r.stroke(),m(30,v),r.beginPath();let b=a(x*(kt.halfZ-1500));x<0?r.arc(o(0),b,l(700),Math.PI,0,!1):r.arc(o(0),b,l(700),0,Math.PI,!1),r.stroke(),m(26,x<0?"rgba(70,150,255,0.55)":"rgba(255,140,50,0.55)");for(let S of[-2600,2600])for(let T=0;T<3;T++){let M=x*(2e3+T*260);r.beginPath(),r.moveTo(o(S-220),a(M+x*160)),r.lineTo(o(S),a(M)),r.lineTo(o(S+220),a(M+x*160)),r.stroke()}}return ms(i,{aniso:16})}function tg(){let t=sr(256,256),e=t.getContext("2d"),n=e.createImageData(256,256),i=qo(11),r=new Float32Array(256*256);for(let a=0;a<9e3;a++){let l=Math.floor(i()*256),c=Math.floor(i()*256),h=.35+i()*.65,u=1+Math.floor(i()*3);for(let d=0;d<u;d++){let f=(c+d)%256;r[f*256+l]=Math.max(r[f*256+l],h*(1-d*.2))}}for(let a=0;a<256*256;a++){let l=Math.round(r[a]*255);n.data[a*4]=l,n.data[a*4+1]=l,n.data[a*4+2]=l,n.data[a*4+3]=255}e.putImageData(n,0,0);let o=ms(t,{srgb:!1,repeat:!0});return o.magFilter=en,o}function $f(s=3,t=512){let e=t/6,n=t,i=Math.round(Math.sqrt(3)*e*4),r=sr(n,i),o=r.getContext("2d");o.fillStyle="#000",o.fillRect(0,0,n,i),o.strokeStyle="#fff",o.lineWidth=s;let a=Math.sqrt(3)*e;for(let l=-1;l<=5;l++)for(let c=-1;c<=5;c++){let h=1.5*e*l,u=a*(c+(l%2?.5:0));o.beginPath();for(let d=0;d<=6;d++){let f=Math.PI/3*d,m=h+e*Math.cos(f),v=u+e*Math.sin(f);d===0?o.moveTo(m,v):o.lineTo(m,v)}o.stroke()}return ms(r,{srgb:!1,repeat:!0})}function xu(){let e=sr(2048,128),n=e.getContext("2d"),i=n.createLinearGradient(0,0,0,128);i.addColorStop(0,"#05070c"),i.addColorStop(1,"#0b1220"),n.fillStyle=i,n.fillRect(0,0,2048,128);let r=["ROCKET ARENA","SUPERSONIC","ROCKET ARENA","BOOST","ROCKET ARENA","AERIAL CUP"],o=2048/r.length;return r.forEach((a,l)=>{let c=l*o;n.fillStyle="rgba(120,180,255,0.18)",n.fillRect(c+4,8,o-8,112),n.fillStyle=l%2?"#ff8a2a":"#4aa8ff",n.beginPath(),n.arc(c+58,128/2,30,0,Math.PI*2),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(c+58,128/2,18,0,Math.PI*2),n.fill(),n.fillStyle=l%2?"#ff8a2a":"#4aa8ff",n.beginPath(),n.arc(c+64,128/2-4,9,0,Math.PI*2),n.fill(),n.fillStyle="#f4f8ff",n.font="bold italic 54px Arial, Helvetica, sans-serif",n.textBaseline="middle",n.fillText(a,c+104,128/2+2,o-120)}),ms(e,{repeat:!0})}function eg(){let e=sr(1024,512),n=e.getContext("2d");n.fillStyle="#14161c",n.fillRect(0,0,1024,512);let i=qo(23),r=8,o=512/r,a=["#c8641c","#2a62c4","#9aa3ad","#1c1c1c","#8a2a2a","#b89a3a","#2a6a3a","#3a3f4a","#c8641c","#2a62c4","#30343c","#5a6070","#20232a"],l=["#c9a185","#b08060","#8a5a3c","#5a3a26","#d2b096"];for(let u=0;u<r;u++){let d=u*o;n.fillStyle=u%2?"#20232b":"#1a1d24",n.fillRect(0,d+o*.62,1024,o*.38),n.fillStyle="#2b3140",n.fillRect(0,d+o*.6,1024,3);for(let f=4;f<1020;f+=15+i()*4){if(i()<.12)continue;let m=a[Math.floor(i()*a.length)],v=l[Math.floor(i()*l.length)],p=d+o*(.32+i()*.08);n.fillStyle=m,n.fillRect(f-6,p,12,o*.36),n.fillStyle=v,n.beginPath(),n.arc(f,p-6,5.5,0,Math.PI*2),n.fill(),i()<.18&&(n.fillStyle=v,n.fillRect(f-9,p-18,3,16),n.fillRect(f+6,p-18,3,16)),i()<.06&&(n.fillStyle=i()<.5?"#ff7a1a":"#2f7bff",n.fillRect(f-10,p-26,20,10))}}let c=sr(1024,512),h=c.getContext("2d");return h.filter="blur(1.2px) saturate(0.8)",h.drawImage(e,0,0),ms(c,{repeat:!0})}function ng(s=1024){let t=s,e=s/2,n=(1+Math.sqrt(5))/2,i=[],r=(b,S,T,M)=>{let R=Math.hypot(b,S,T);i.push([b/R,S/R,T/R,M])};for(let b of[-1,1])for(let S of[-1,1])r(0,b,S*n,1),r(b,S*n,0,1),r(b*n,0,S,1);for(let b of[-1,1])for(let S of[-1,1])for(let T of[-1,1])r(b,S,T,0);for(let b of[-1,1])for(let S of[-1,1])r(0,b/n,S*n,0),r(b/n,S*n,0,0),r(b*n,0,S/n,0);let o=()=>{let b=sr(t,e);return[b,b.getContext("2d")]},[a,l]=o(),[c,h]=o(),[u,d]=o(),[f,m]=o(),v=l.createImageData(t,e),p=h.createImageData(t,e),g=d.createImageData(t,e),x=m.createImageData(t,e),_=qo(5),y=new Float32Array(2048);for(let b=0;b<y.length;b++)y[b]=_();for(let b=0;b<e;b++){let S=(b+.5)/e,T=Math.sin(Math.PI*S),M=Math.cos(Math.PI*S);for(let R=0;R<t;R++){let C=(R+.5)/t,I=-Math.cos(2*Math.PI*C)*T,L=M,k=Math.sin(2*Math.PI*C)*T,N=-2,O=-2,V=0;for(let Ct=0;Ct<32;Ct++){let Kt=i[Ct],me=I*Kt[0]+L*Kt[1]+k*Kt[2];me>N?(O=N,N=me,V=Ct):me>O&&(O=me)}let q=i[V][3],rt=N-O,G=rt<.006?1:rt<.014?1-(rt-.006)/.008:0,X=Math.acos(Math.min(1,N)),Q=y[(b>>4)%32*64+(R>>4)%64]*.08,_t,St,Ht;q?(_t=52,St=58,Ht=66):(_t=128,St=134,Ht=140);let Vt=rt<.03?.85:1,ee=(1-G*.85)*Vt*(1+Q),J=(b*t+R)*4;v.data[J]=_t*ee,v.data[J+1]=St*ee,v.data[J+2]=Ht*ee,v.data[J+3]=255;let lt=0;q&&(X<.07?lt=1:X>.12&&X<.15&&(lt=.9)),p.data[J]=60*lt,p.data[J+1]=170*lt,p.data[J+2]=255*lt,p.data[J+3]=255;let wt=G>0?200:q?95:120;g.data[J]=wt,g.data[J+1]=wt,g.data[J+2]=wt,g.data[J+3]=255;let Xt=255*(1-G)*(rt<.03?.6+rt*13:1);x.data[J]=Xt,x.data[J+1]=Xt,x.data[J+2]=Xt,x.data[J+3]=255}}return l.putImageData(v,0,0),h.putImageData(p,0,0),d.putImageData(g,0,0),m.putImageData(x,0,0),{map:ms(a),emissiveMap:ms(c),roughnessMap:ms(u,{srgb:!1}),bumpMap:ms(f,{srgb:!1})}}function ig(){let s=sr(256,64),t=s.getContext("2d");t.fillStyle="#1b1b1d",t.fillRect(0,0,256,64),t.strokeStyle="#0a0a0b",t.lineWidth=6;for(let e=-64;e<320;e+=18)t.beginPath(),t.moveTo(e,0),t.lineTo(e+14,30),t.lineTo(e,64),t.stroke();return t.fillStyle="#0c0c0d",t.fillRect(0,30,256,4),ms(s,{repeat:!0})}var Cl=new E;function Ci(s,t,e,n,i,r){let o=2*Math.PI*i/4,a=Math.max(r-2*i,0),l=Math.PI/4;Cl.copy(t),Cl[n]=0,Cl.normalize();let c=.5*o/(o+a),h=1-Cl.angleTo(s)/l;return Math.sign(Cl[e])===1?h*c:a/(o+a)+c+c*(1-h)}var rr=class s extends De{constructor(t=1,e=1,n=1,i=2,r=.1){let o=i*2+1;if(r=Math.min(t/2,e/2,n/2,r),super(1,1,1,o,o,o),this.type="RoundedBoxGeometry",this.parameters={width:t,height:e,depth:n,segments:i,radius:r},o===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let l=new E,c=new E,h=new E(t,e,n).divideScalar(2).subScalar(r),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,m=u.length/6,v=new E,p=.5/o;for(let g=0,x=0;g<u.length;g+=3,x+=2)switch(l.fromArray(u,g),c.copy(l),c.x-=Math.sign(c.x)*p,c.y-=Math.sign(c.y)*p,c.z-=Math.sign(c.z)*p,c.normalize(),u[g+0]=h.x*Math.sign(l.x)+c.x*r,u[g+1]=h.y*Math.sign(l.y)+c.y*r,u[g+2]=h.z*Math.sign(l.z)+c.z*r,d[g+0]=c.x,d[g+1]=c.y,d[g+2]=c.z,Math.floor(g/m)){case 0:v.set(1,0,0),f[x+0]=Ci(v,c,"z","y",r,n),f[x+1]=1-Ci(v,c,"y","z",r,e);break;case 1:v.set(-1,0,0),f[x+0]=1-Ci(v,c,"z","y",r,n),f[x+1]=1-Ci(v,c,"y","z",r,e);break;case 2:v.set(0,1,0),f[x+0]=1-Ci(v,c,"x","z",r,t),f[x+1]=Ci(v,c,"z","x",r,n);break;case 3:v.set(0,-1,0),f[x+0]=1-Ci(v,c,"x","z",r,t),f[x+1]=1-Ci(v,c,"z","x",r,n);break;case 4:v.set(0,0,1),f[x+0]=1-Ci(v,c,"x","y",r,t),f[x+1]=1-Ci(v,c,"y","x",r,e);break;case 5:v.set(0,0,-1),f[x+0]=Ci(v,c,"x","y",r,t),f[x+1]=1-Ci(v,c,"y","x",r,e);break}}static fromJSON(t){return new s(t.width,t.height,t.depth,t.segments,t.radius)}};var yu=class extends ae{constructor(t=new et,e=new E,n=new ci,i=new E(1,1,1)){super();let r=[],o=[],a=[],l=new E,c=new oe().getNormalMatrix(t.matrixWorld),h=new le;h.makeRotationFromEuler(n),h.setPosition(e);let u=new le;u.copy(h).invert(),d(),this.setAttribute("position",new zt(r,3)),this.setAttribute("uv",new zt(a,2)),o.length>0&&this.setAttribute("normal",new zt(o,3));function d(){let p=[],g=new E,x=new E,_=t.geometry,y=_.attributes.position,b=_.attributes.normal;if(_.index!==null){let S=_.index;for(let T=0;T<S.count;T++)g.fromBufferAttribute(y,S.getX(T)),b?(x.fromBufferAttribute(b,S.getX(T)),f(p,g,x)):f(p,g)}else{if(y===void 0)return;for(let S=0;S<y.count;S++)g.fromBufferAttribute(y,S),b?(x.fromBufferAttribute(b,S),f(p,g,x)):f(p,g)}p=m(p,l.set(1,0,0)),p=m(p,l.set(-1,0,0)),p=m(p,l.set(0,1,0)),p=m(p,l.set(0,-1,0)),p=m(p,l.set(0,0,1)),p=m(p,l.set(0,0,-1));for(let S=0;S<p.length;S++){let T=p[S];a.push(.5+T.position.x/i.x,.5+T.position.y/i.y),T.position.applyMatrix4(h),r.push(T.position.x,T.position.y,T.position.z),T.normal!==null&&o.push(T.normal.x,T.normal.y,T.normal.z)}}function f(p,g,x=null){g.applyMatrix4(t.matrixWorld),g.applyMatrix4(u),x?(x.applyNormalMatrix(c),p.push(new Pl(g.clone(),x.clone()))):p.push(new Pl(g.clone()))}function m(p,g){let x=[],_=.5*Math.abs(i.dot(g));for(let y=0;y<p.length;y+=3){let b=0,S,T,M,R,C=p[y+0].position.dot(g)-_,I=p[y+1].position.dot(g)-_,L=p[y+2].position.dot(g)-_,k=C>0,N=I>0,O=L>0;switch(b=(k?1:0)+(N?1:0)+(O?1:0),b){case 0:{x.push(p[y]),x.push(p[y+1]),x.push(p[y+2]);break}case 1:{if(k&&(S=p[y+1],T=p[y+2],M=v(p[y],S,g,_),R=v(p[y],T,g,_)),N){S=p[y],T=p[y+2],M=v(p[y+1],S,g,_),R=v(p[y+1],T,g,_),x.push(M),x.push(T.clone()),x.push(S.clone()),x.push(T.clone()),x.push(M.clone()),x.push(R);break}O&&(S=p[y],T=p[y+1],M=v(p[y+2],S,g,_),R=v(p[y+2],T,g,_)),x.push(S.clone()),x.push(T.clone()),x.push(M),x.push(R),x.push(M.clone()),x.push(T.clone());break}case 2:{k||(S=p[y].clone(),T=v(S,p[y+1],g,_),M=v(S,p[y+2],g,_),x.push(S),x.push(T),x.push(M)),N||(S=p[y+1].clone(),T=v(S,p[y+2],g,_),M=v(S,p[y],g,_),x.push(S),x.push(T),x.push(M)),O||(S=p[y+2].clone(),T=v(S,p[y],g,_),M=v(S,p[y+1],g,_),x.push(S),x.push(T),x.push(M));break}case 3:break}}return x}function v(p,g,x,_){let y=p.position.dot(x)-_,b=g.position.dot(x)-_,S=y/(y-b),T=new E(p.position.x+S*(g.position.x-p.position.x),p.position.y+S*(g.position.y-p.position.y),p.position.z+S*(g.position.z-p.position.z)),M=null;return p.normal!==null&&g.normal!==null&&(M=new E(p.normal.x+S*(g.normal.x-p.normal.x),p.normal.y+S*(g.normal.y-p.normal.y),p.normal.z+S*(g.normal.z-p.normal.z))),new Pl(T,M)}}},Pl=class{constructor(t,e=null){this.position=t,this.normal=e}clone(){let t=this.position.clone(),e=this.normal!==null?this.normal.clone():null;return new this.constructor(t,e)}};var Kn=[-46.2,-45.5,-44.4,-40,-34,-26,-18,-8,4,16,26,34,44,51,58,65,70,73,74.4],Jb=[13,18.5,21,21.8,22.2,21.5,19.5,17.6,16.8,16.4,16.2,16,16.4,16.6,15.4,11.6,7.4,3.8,.8],jb=[2,0,-1.5,-2.5,-3,-3,-3.2,-3.2,-3.2,-3.2,-3.2,-3.2,-3,-2.8,-2.4,-2,-1.6,-1.2,-.8],Qb=[8,11,12.5,13.5,14,13,11,9.5,8.8,8.6,8.6,9,9.8,10.2,9.4,7,4.4,1.8,0],tS=[30,34.5,36.5,37.5,38,37,35,34,34,34.5,36.2,38.8,40.6,41,39.8,36,30.5,24,17],eS=[0,0,0,0,0,0,0,0,0,0,1,3.4,5,5.4,4.6,3.2,1.8,.6,0],nS=[3.4,4,4.6,5,5.2,5.4,5.6,5.8,5.8,5.8,5.6,5,4.6,4.6,4.4,4,3.4,3,2.6],iS=[3.4,4.5,5.5,6,6,6,6,6,6,6,6,6,5.5,5,4.8,4.4,4,3.4,3],gs=[-22.5,-19,-14,-8,-1,6,11,16.5,21.5,25.5,28.5],sS=[21,26.4,31.6,34.6,35.4,35.4,34.6,30.6,25.6,20.8,16.4],rS=[27.5,28.5,29.5,30,30,29.8,29.5,29,28,27,25.5];function Ls(s,t){let e=s.length,n=[],i=new Array(e);for(let r=0;r<e-1;r++)n.push((t[r+1]-t[r])/(s[r+1]-s[r]));i[0]=n[0],i[e-1]=n[e-2];for(let r=1;r<e-1;r++)i[r]=n[r-1]*n[r]<=0?0:(n[r-1]+n[r])/2;for(let r=0;r<e-1;r++){if(n[r]===0){i[r]=0,i[r+1]=0;continue}let o=i[r]/n[r],a=i[r+1]/n[r],l=o*o+a*a;if(l>9){let c=3/Math.sqrt(l);i[r]=c*o*n[r],i[r+1]=c*a*n[r]}}return r=>{if(r<=s[0])return t[0];if(r>=s[e-1])return t[e-1];let o=0;for(;r>s[o+1];)o++;let a=s[o+1]-s[o],l=(r-s[o])/a,c=l*l,h=c*l;return(2*h-3*c+1)*t[o]+(h-2*c+l)*a*i[o]+(-2*h+3*c)*t[o+1]+(h-c)*a*i[o+1]}}var Or={top:Ls(Kn,Jb),bot:Ls(Kn,jb),cy:Ls(Kn,Qb),a:Ls(Kn,tS),dip:Ls(Kn,eS),nt:Ls(Kn,nS),nb:Ls(Kn,iS)},Il={roof:Ls(gs,sS),half:Ls(gs,rS)};function Ll(s){return{z:s,top:Or.top(s),bot:Or.bot(s),cy:Or.cy(s),a:Or.a(s),dip:Or.dip(s),nt:Or.nt(s),nb:Or.nb(s)}}function gi(s,t){let e=Math.max(0,Math.sin(t)),n=Math.cos(t),i,r;if(t<=Math.PI/2){let o=2/s.nt;i=s.a*Math.pow(e,o),r=s.cy+(s.top-s.cy)*Math.pow(Math.max(0,n),o);let a=i/s.a;r-=s.dip*Math.pow(Math.max(0,1-a*a*1.15),2)}else{let o=2/s.nb;i=s.a*Math.pow(e,o),r=s.cy-(s.cy-s.bot)*Math.pow(Math.max(0,-n),o)}return[i,r]}var $o=s=>s<14?6.5:8,Kf=Ut.wheels.filter(s=>s.x>0).map(s=>{let t=$o(s.r),e=Math.abs(s.x)+7;return{z:s.z,cy:-Ut.restHeight+s.r,R:s.r+(s.front?3.4:5.2),inner:e-t-2.2}});function rg(s){for(let t of Kf){let e=s-t.z;if(Math.abs(e)<t.R)return{...t,y:t.cy+Math.sqrt(t.R*t.R-e*e)}}return null}function Xo(s,t,e,n,i=120){let r=[],o=[0];for(let h=0;h<=i;h++){let u=s(t+(e-t)*h/i);h>0&&o.push(o[h-1]+Math.hypot(u[0]-r[h-1][0],u[1]-r[h-1][1])),r.push(u)}let a=o[i],l=[],c=0;for(let h=0;h<=n;h++){let u=a*h/n;for(;c<i-1&&o[c+1]<u;)c++;let d=o[c+1]-o[c],f=d>1e-9?(u-o[c])/d:0;l.push([r[c][0]+(r[c+1][0]-r[c][0])*f,r[c][1]+(r[c+1][1]-r[c][1])*f])}return l}function oS(s,t){let e=0,n=Math.PI;for(let i=0;i<40;i++){let r=(e+n)/2;gi(s,r)[1]>t?e=r:n=r}return(e+n)/2}function aS(s,t){let e=Math.PI/2,n=Math.PI;for(let i=0;i<40;i++){let r=(e+n)/2;gi(s,r)[0]>t?e=r:n=r}return(e+n)/2}function lS(s){let t=s.ringA,e=s.ringB,n=s.ringC,i=t+e+n,r=i*2,o=[];for(let v=Kn[0];v<Kn[Kn.length-1];v+=s.step)o.push(v);o.push(Kn[Kn.length-1]);for(let v of Kf)for(let p of[-1,1])o.push(v.z+p*(v.R-.04),v.z+p*(v.R+.04));o.sort((v,p)=>v-p);let a=[],l=[];for(let v of o){let p=Ll(v),g=rg(v),x=g?g.y:Math.min(p.cy-1,-.5),_=oS(p,x),y=Xo(R=>gi(p,R),0,_,t),b,S;if(g){let R=y[t][0],C=Math.min(g.inner,R-.5);b=Xo(V=>[R+(C-R)*V,g.y],0,1,e);let I=aS(p,C),L=gi(p,I)[1],k=Math.max(.01,g.y-L),N=(()=>{let V=0,q=gi(p,I);for(let rt=1;rt<=30;rt++){let G=gi(p,I+(Math.PI-I)*rt/30);V+=Math.hypot(G[0]-q[0],G[1]-q[1]),q=G}return V})(),O=k/(k+N);S=Xo(V=>V<O?[C,g.y-k*(V/O)]:gi(p,I+(Math.PI-I)*((V-O)/(1-O))),0,1,n,200)}else b=Xo(()=>y[t],0,1,e,2),S=Xo(R=>gi(p,R),_,Math.PI,n);let T=y.concat(b.slice(1),S.slice(1)),M=(R,C,I,L)=>R>t+(g?0:e)||L<-44.6?1:0;for(let R=0;R<=i;R++){let[C,I]=T[R];a.push(-C,I,v),l.push(M(R,C,I,v))}for(let R=i-1;R>=1;R--){let[C,I]=T[R];a.push(C,I,v),l.push(M(R,C,I,v))}}let c=o.length,h=[],u=[];for(let v=0;v<c-1;v++)for(let p=0;p<r;p++){let g=v*r+p,x=v*r+(p+1)%r,_=(v+1)*r+p,y=(v+1)*r+(p+1)%r,b=l[g]&&l[x]&&l[_]&&l[y]?1:0;h.push(g,x,_,x,y,_),u.push(b,b)}let d=v=>{let p=0;for(let g=0;g<r;g++)p+=a[(v*r+g)*3+1];return p/r},f=a.length/3;a.push(0,d(0),o[0]-.3),l.push(0);let m=a.length/3;a.push(0,d(c-1),o[c-1]+.3),l.push(0);for(let v=0;v<r;v++){let p=(v+1)%r;h.push(f,v,p),u.push(1),h.push(m,(c-1)*r+p,(c-1)*r+v),u.push(1)}return og(a,h,u.map(v=>v?1:0),2)}function og(s,t,e,n){let i=new ae;i.setAttribute("position",new zt(s,3));let r=[];for(let o=0;o<n;o++){let a=r.length;for(let l=0;l<e.length;l++)e[l]===o&&r.push(t[l*3],t[l*3+1],t[l*3+2]);i.addGroup(a,r.length-a,o)}return i.setIndex(r),i.computeVertexNormals(),i}function Jf(s,t){let e=Ll(s),n=0,i=Math.PI/2;for(let r=0;r<40;r++){let o=(n+i)/2;gi(e,o)[0]<t?n=o:i=o}return gi(e,(n+i)/2)[1]}function cS(s){let t=s.ringG,e=[];for(let f=gs[0];f<gs[gs.length-1];f+=s.step)e.push(f);e.push(gs[gs.length-1]);let n=2*t+1,i=[],r=[],o=e.map(f=>{let m=Il.half(f),v=Jf(f,m)-.7,p=Math.max(.25,Il.roof(f)-v),g=Xo(x=>{let _=Math.sin(x),y=Math.cos(x),b=v+p*Math.pow(Math.max(0,y),2/5),S=1-.2*Math.pow((b-v)/p,1.2);return[m*Math.pow(Math.max(0,_),2/5)*S,b]},0,Math.PI/2,t);return{z:f,h:p,pts:g}}),a=o.reduce((f,m)=>m.h>f.h?m:f),l=t;for(let f=0;f<t;f++){let m=a.pts;if(Math.abs(m[f+1][1]-m[f][1])>Math.abs(m[f+1][0]-m[f][0])){l=f;break}}let c=f=>f>=t-1?3:f>l+1?2:f>=l-1?1:0;for(let{z:f,pts:m}of o){for(let v=t;v>=0;v--)i.push(m[v][0],m[v][1],f),r.push(c(v));for(let v=1;v<=t;v++)i.push(-m[v][0],m[v][1],f),r.push(c(v))}let h=e.length,u=[];for(let f=0;f<h-1;f++)for(let m=0;m<n-1;m++){let v=f*n+m,p=f*n+m+1,g=(f+1)*n+m,x=(f+1)*n+m+1;u.push(v,p,g,p,x,g)}let d=[];for(let f=0;f<u.length/3;f+=2){let m=u[f*3],v=u[f*3+1],p=Math.max(r[m],r[v]),g=i[m*3+2],x;p===3?x=2:p===2?x=g>-3.2&&g<.8?2:1:p===1?x=0:x=g>11||g<-9?1:0,d.push(x,x)}return og(i,u,d,3)}function Yo(s,t){let e=document.createElement("canvas");return e.width=s,e.height=t,e}function Zo(s,t=!0){let e=new Xe(s);return t&&(e.colorSpace=Te),e.anisotropy=4,e}function hS(s,t,e,n,i,r){s.beginPath(),s.moveTo(t+r,e),s.arcTo(t+n,e,t+n,e+i,r),s.arcTo(t+n,e+i,t,e+i,r),s.arcTo(t,e+i,t,e,r),s.arcTo(t,e,t+n,e,r),s.closePath()}function uS(){let e=Yo(256,112),n=Yo(256,112),i=e.getContext("2d"),r=n.getContext("2d"),o=l=>{l.beginPath(),l.moveTo(8,70),l.bezierCurveTo(40,20,150,8,248,14),l.lineTo(240,52),l.bezierCurveTo(170,60,90,80,30,104),l.closePath()};o(i);let a=i.createLinearGradient(0,0,0,112);a.addColorStop(0,"#2a3038"),a.addColorStop(1,"#0b0d10"),i.fillStyle=a,i.fill(),i.save(),i.clip();for(let[l,c,h]of[[150,38,17],[196,32,14]]){let u=i.createRadialGradient(l-4,c-4,1,l,c,h);u.addColorStop(0,"#ffffff"),u.addColorStop(.35,"#c9d2dc"),u.addColorStop(1,"#3a414a"),i.fillStyle=u,i.beginPath(),i.arc(l,c,h,0,Math.PI*2),i.fill()}i.restore(),i.lineWidth=3,i.strokeStyle="#8b939c",o(i),i.stroke(),r.fillStyle="#000",r.fillRect(0,0,256,112),r.strokeStyle="#fff",r.lineWidth=7,r.lineCap="round",r.beginPath(),r.moveTo(36,80),r.bezierCurveTo(70,50,120,62,232,44),r.stroke();for(let[l,c,h]of[[150,38,7],[196,32,6]])r.fillStyle="#c8ccd0",r.beginPath(),r.arc(l,c,h,0,Math.PI*2),r.fill();return{map:Zo(e),emissiveMap:Zo(n)}}function dS(){let s=Yo(64,64),t=s.getContext("2d"),e=t.createRadialGradient(32,32,2,32,32,31);return e.addColorStop(0,"#4a0a0c"),e.addColorStop(.45,"#c01822"),e.addColorStop(.62,"#ffffff"),e.addColorStop(.75,"#ff3a40"),e.addColorStop(1,"#5a0306"),t.fillStyle=e,t.fillRect(0,0,64,64),Zo(s)}function fS(){let e=Yo(512,320),n=e.getContext("2d");return n.clearRect(0,0,512,320),n.strokeStyle="rgba(0,0,0,0.9)",n.lineWidth=5,n.beginPath(),n.moveTo(470,40),n.lineTo(476,250),n.quadraticCurveTo(476,290,430,292),n.lineTo(80,292),n.quadraticCurveTo(40,290,38,250),n.lineTo(46,40),n.stroke(),hS(n,120,108,70,14,7),n.fillStyle="rgba(0,0,0,0.55)",n.fill(),n.strokeStyle="rgba(255,255,255,0.18)",n.lineWidth=2,n.beginPath(),n.moveTo(124,107),n.lineTo(186,107),n.stroke(),Zo(e)}function pS(){let e=Yo(256,128),n=e.getContext("2d");n.clearRect(0,0,256,128);for(let i of[22,140]){n.beginPath(),n.moveTo(i,100),n.lineTo(i+94,100),n.lineTo(i+80,30),n.lineTo(i+14,30),n.closePath(),n.fillStyle="#08090b",n.fill(),n.strokeStyle="rgba(255,255,255,0.12)",n.lineWidth=2,n.stroke();for(let r=40;r<96;r+=11)n.fillStyle="#25282d",n.fillRect(i+12+(100-r)*.2,r,70-(100-r)*.4,4)}return Zo(e)}function mS(){let s=Yo(64,64),t=s.getContext("2d");return t.beginPath(),t.arc(32,32,30,0,Math.PI*2),t.fillStyle="#c9ced6",t.fill(),t.beginPath(),t.arc(32,32,24,0,Math.PI*2),t.fillStyle="#121418",t.fill(),t.fillStyle="#e8ecf2",t.font="italic 900 26px Arial Black, Arial, sans-serif",t.textAlign="center",t.textBaseline="middle",t.fillText("RA",32,34),Zo(s)}var _u=new xn;function or(s,t,e,n,i=null,r=!1){_u.position.copy(t),_u.up.copy(i||new E(0,1,0)),_u.lookAt(t.clone().add(e));let o=new yu(s,t,_u.rotation.clone(),n);if(r){let a=o.attributes.uv;for(let l=0;l<a.count;l++)a.setX(l,1-a.getX(l))}return o}function gS(s,t,e){let n=e.wheelSeg,i=s*.6,r=x=>x.rotateZ(-Math.PI/2),o=new qs([new nt(s*.975,-t*.93),new nt(s,-t*.72),new nt(s,t*.72),new nt(s*.975,t*.93)],n);r(o);let a=x=>{let _=[new nt(s*.975,x*t*.93),new nt(s*.93,x*t),new nt(s*.84,x*t*1.02),new nt(s*.75,x*t*.97),new nt(i+.4,x*t*.9),new nt(i,x*t*.84)];x<0&&_.reverse();let y=new qs(_,n);return r(y),y},l=new Fe(i-.2,i-.2,t*1.6,n,1,!0);l.rotateZ(Math.PI/2),l.translate(-t*.1,0,0);let c=new Yn(i-.1,.42,6,n);c.rotateY(Math.PI/2),c.translate(t*.8,0,0);let h=[],u=6;for(let x=0;x<u;x++){let _=new De(1.4,i-s*.2,2.6,1,4,1);_.translate(0,(i+s*.2)/2-.2,0);let y=_.attributes.position;for(let b=0;b<y.count;b++){let T=(y.getY(b)-s*.2)/(i-s*.2);y.setZ(b,y.getZ(b)*(1.25-.45*T)),y.setX(b,y.getX(b)+t*(.48+.3*T))}_.rotateX(x/u*Math.PI*2+.3),h.push(_)}let d=new Fe(s*.22,s*.24,1.6,20);d.rotateZ(Math.PI/2),d.translate(t*.5,0,0);let f=new ki(s*.12,20);f.rotateY(Math.PI/2),f.translate(t*.5+.82,0,0);let m=[];for(let x=0;x<5;x++){let _=new Fe(.45,.45,.9,6);_.rotateZ(Math.PI/2);let y=x/5*Math.PI*2;_.translate(t*.5+.9,Math.cos(y)*s*.165,Math.sin(y)*s*.165),m.push(_)}let v=new Fe(s*.6,s*.6,1.2,n);v.rotateZ(Math.PI/2),v.translate(-t*.05,0,0);let p=new Yn(s*.55,1.15,6,10,1);p.scale(1,1,1.9),p.rotateY(Math.PI/2),p.rotateX(Math.PI*.62),p.translate(t*.08,0,0);let g=x=>{let _=vS(x);for(let y of x)y.dispose();return _};return{tread:o,sideOut:a(1),sideIn:a(-1),barrel:l,lip:c,spokes:g(h.concat([d])),nuts:g(m),cap:f,disc:v,caliper:p}}function vS(s){let t=s.map(l=>l.index?l.toNonIndexed():l),e=0;for(let l of t)e+=l.attributes.position.count;let n=new Float32Array(e*3),i=new Float32Array(e*3),r=new Float32Array(e*2),o=0;for(let l of t)n.set(l.attributes.position.array,o*3),l.attributes.normal&&i.set(l.attributes.normal.array,o*3),l.attributes.uv&&r.set(l.attributes.uv.array,o*2),o+=l.attributes.position.count;let a=new ae;return a.setAttribute("position",new ce(n,3)),a.setAttribute("normal",new ce(i,3)),a.setAttribute("uv",new ce(r,2)),a}var sg={high:{step:1.1,ringA:26,ringB:5,ringC:12,ringG:18,wheelSeg:40},medium:{step:1.6,ringA:20,ringB:4,ringC:9,ringG:14,wheelSeg:28},low:{step:2.6,ringA:14,ringB:3,ringC:6,ringG:9,wheelSeg:18}},Mu={};function ag(s="high"){if(Mu[s])return Mu[s];let t=sg[s]||sg.high,e=lS(t),n=cS(t),i=new et(e);i.updateMatrixWorld(!0),new et(n).updateMatrixWorld(!0);let o=(h,u,d)=>new E(h,u,d),a={headR:or(i,o(-23,7,69),o(-.45,.55,.7).normalize(),o(13,6,10)),headL:or(i,o(23,7,69),o(.45,.55,.7).normalize(),o(13,6,10)),doorR:or(i,o(-34.5,7,8),o(-1,0,0),o(40,21,9)),doorL:or(i,o(34.5,7,8),o(1,0,0),o(40,21,9)),numR:or(i,o(-34.5,7.5,5),o(-1,0,0),o(19,11.5,9)),numL:or(i,o(34.5,7.5,5),o(1,0,0),o(19,11.5,9)),hoodVents:or(i,o(0,11.5,50),o(0,1,.25).normalize(),o(24,13,8),o(0,0,1)),badge:or(i,o(0,4,72.6),o(0,.6,.8).normalize(),o(4.5,4.5,6))},l={};for(let h of Ut.wheels)l[h.r]||(l[h.r]=gS(h.r,$o(h.r),t));let c=[e,n,...Object.values(a)];for(let h of Object.values(l))c.push(...Object.values(h));for(let h of c)h.userData.shared=!0;return Mu[s]={body:e,greenhouse:n,decals:a,wheels:l,arches:Kf},Mu[s]}var bu=null;function lg(){return bu||(bu={head:uS(),lamp:dS(),panel:fS(),vents:pS(),badge:mS()},bu)}function Hr(s,t,e){let n=Ll(s),[i,r]=gi(n,e);return new E(t*i,r,s)}function xS(s,t){let e=Ll(s),n=Math.PI/2,i=Math.PI;for(let r=0;r<30;r++){let o=(n+i)/2;gi(e,o)[0]>t?n=o:i=o}return gi(e,(n+i)/2)[1]}function cg(s,t,e){if(e<Kn[0]||e>Kn[Kn.length-1])return!1;let n=Ll(e),i=Math.abs(s);if(i>n.a||t>n.top+.5||t<n.bot-.5||t>Jf(e,i)||t<xS(e,i))return!1;let r=rg(e);return!(r&&i>r.inner&&t<r.y)}function hg(s,t,e){if(e<gs[0]||e>gs[gs.length-1])return-1;let n=Il.half(e),i=Jf(e,n)-.7,r=Math.max(.25,Il.roof(e)-i);if(t<i-1.5||t>i+r)return-1;let o=Math.min(1,Math.max(0,(t-i)/r)),a=Math.pow(o,2.5),l=Math.sqrt(Math.max(0,1-a*a)),c=n*Math.pow(l,2/5)*(1-.2*Math.pow(o,1.2));return Math.abs(s)<=c?o:-1}function ug(s,t){let e=Il.half(s),n=Math.pow(t,2.5);return e*Math.pow(Math.sqrt(Math.max(0,1-n*n)),2/5)*(1-.2*Math.pow(t,1.2))}var Y={AIR:0,GRASS:1,DIRT:2,STONE:3,SAND:4,SNOW:5,LOG:6,LEAVES:7,PLANKS:8,COBBLE:9,BRICK:10,GRAVEL:11,GLOW:12,WOOL_BLUE:13,WOOL_ORANGE:14,CONCRETE:15,DARK:16,QUARTZ:17,GLASS:18,ROOF:19,LAMP:20,SPRUCE:21,SPRUCE_LOG:22,CLAY:23,DEEPSLATE:24,IRON:25,WATER:26,WOOL_WHITE:27,OBSIDIAN:28,PAINT:29,TINT_GLASS:30,CHROME:31,HEADLIGHT:32,TAILLIGHT:33,RUBBER:34,CARBON:35,BOOSTLIGHT:36},ut={grassTop:0,grassSide:1,dirt:2,stone:3,sand:4,snow:5,snowSide:6,logSide:7,logTop:8,leaves:9,planks:10,cobble:11,brick:12,gravel:13,glow:14,woolBlue:15,woolOrange:16,concrete:17,dark:18,quartz:19,glass:20,roof:21,lamp:22,spruce:23,spruceLog:24,clay:25,deepslate:26,iron:27,water:28,woolWhite:29,obsidian:30,paint:31,tint:32,rubber:33,carbon:34,light:35},dg=36,Ko=[];function we(s,t,e=t,n=t,i=0,r=.85,o=0){Ko[s]={top:t,side:e,bottom:n,emit:i,rough:r,metal:o}}we(Y.GRASS,ut.grassTop,ut.grassSide,ut.dirt);we(Y.DIRT,ut.dirt);we(Y.STONE,ut.stone);we(Y.SAND,ut.sand);we(Y.SNOW,ut.snow,ut.snowSide,ut.dirt);we(Y.LOG,ut.logTop,ut.logSide,ut.logTop);we(Y.LEAVES,ut.leaves);we(Y.PLANKS,ut.planks);we(Y.COBBLE,ut.cobble);we(Y.BRICK,ut.brick);we(Y.GRAVEL,ut.gravel);we(Y.GLOW,ut.glow,ut.glow,ut.glow,1.6,.6);we(Y.WOOL_BLUE,ut.woolBlue,ut.woolBlue,ut.woolBlue,0,.95);we(Y.WOOL_ORANGE,ut.woolOrange,ut.woolOrange,ut.woolOrange,0,.95);we(Y.CONCRETE,ut.concrete,ut.concrete,ut.concrete,0,.7);we(Y.DARK,ut.dark,ut.dark,ut.dark,0,.5,.3);we(Y.QUARTZ,ut.quartz,ut.quartz,ut.quartz,0,.45);we(Y.GLASS,ut.glass,ut.glass,ut.glass,0,.1,.2);we(Y.ROOF,ut.roof);we(Y.LAMP,ut.lamp,ut.lamp,ut.lamp,3.2,.3);we(Y.SPRUCE,ut.spruce);we(Y.SPRUCE_LOG,ut.logTop,ut.spruceLog,ut.logTop);we(Y.CLAY,ut.clay);we(Y.DEEPSLATE,ut.deepslate);we(Y.IRON,ut.iron,ut.iron,ut.iron,0,.35,.8);we(Y.WATER,ut.water,ut.water,ut.water,0,.1);we(Y.WOOL_WHITE,ut.woolWhite,ut.woolWhite,ut.woolWhite,0,.95);we(Y.OBSIDIAN,ut.obsidian,ut.obsidian,ut.obsidian,0,.3,.2);we(Y.PAINT,ut.paint,ut.paint,ut.paint,0,.26,.45);we(Y.TINT_GLASS,ut.tint,ut.tint,ut.tint,0,.05,.4);we(Y.CHROME,ut.iron,ut.iron,ut.iron,0,.14,1);we(Y.HEADLIGHT,ut.light,ut.light,ut.light,1.5,.2);we(Y.TAILLIGHT,ut.light,ut.light,ut.light,2.2,.2);we(Y.RUBBER,ut.rubber,ut.rubber,ut.rubber,0,.9);we(Y.CARBON,ut.carbon,ut.carbon,ut.carbon,0,.4,.3);we(Y.BOOSTLIGHT,ut.light,ut.light,ut.light,2.2,.3);function ii(s){let t=s>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var Oe=s=>[s>>16&255,s>>8&255,s&255];function yS(){let t=new Uint8Array(1024*dg),e=(a,l,c,h,u=255)=>{let d=(a*16*16+c*16+l)*4;t[d]=Math.max(0,Math.min(255,h[0])),t[d+1]=Math.max(0,Math.min(255,h[1])),t[d+2]=Math.max(0,Math.min(255,h[2])),t[d+3]=u},n=(a,l)=>[a[0]*l,a[1]*l,a[2]*l],i=(a,l,c,h)=>{let u=ii(c);for(let d=0;d<16;d++)for(let f=0;f<16;f++){let m=u(),v=0;if(h){let p=0;for(v=0;v<l.length-1&&(p+=h[v],!(m<p));v++);}else v=Math.floor(m*l.length);e(a,f,d,Oe(l[v]))}};i(ut.grassTop,[6134842,6990658,5212721,7648586,5672758],1),i(ut.dirt,[9067835,8016434,9857605,7030314,8673594],2),i(ut.grassSide,[9067835,8016434,9857605,7030314],3);{let a=ii(4);for(let l=0;l<16;l++){let c=3+Math.floor(a()*3);for(let h=0;h<c;h++)e(ut.grassSide,l,h,Oe([6134842,6990658,5212721][Math.floor(a()*3)]))}}i(ut.stone,[8553090,7829367,9342606,7105644,8224125],5),i(ut.sand,[14405531,13878672,14932136,13352326],6),i(ut.snow,[16054524,15265526,16777215,14673905],7),i(ut.snowSide,[9067835,8016434,9857605,7030314],8);{let a=ii(9);for(let l=0;l<16;l++){let c=3+Math.floor(a()*3);for(let h=0;h<c;h++)e(ut.snowSide,l,h,Oe([16054524,15265526,16777215][Math.floor(a()*3)]))}}{let a=ii(10);for(let c=0;c<16;c++){let h=[7032108,5914402,7755055][Math.floor(a()*3)];for(let u=0;u<16;u++)e(ut.logSide,c,u,n(Oe(h),.85+a()*.25))}let l=ii(11);for(let c=0;c<16;c++){let h=[4074008,3351316,4862752][Math.floor(l()*3)];for(let u=0;u<16;u++)e(ut.spruceLog,c,u,n(Oe(h),.85+l()*.25))}}for(let a=0;a<16;a++)for(let l=0;l<16;l++){let c=Math.max(Math.abs(l-7.5),Math.abs(a-7.5)),h=Math.floor(c)%2;e(ut.logTop,l,a,c>6.5?Oe(5914402):Oe(h?11569754:10254408))}i(ut.leaves,[4160042,3500834,4885043,2906652,2246426],12,[.25,.25,.2,.18,.12]),i(ut.spruce,[2903852,2376490,3365427,1848607],13);for(let a=0;a<16;a++)for(let l=0;l<16;l++){let c=Math.floor(a/4),h=Oe([11043663,10254405,11570007,9991235][c]);(a%4===3||l===(c*5+3)%16)&&(h=Oe(7229744)),e(ut.planks,l,a,n(h,.92+(l*7+a*3)%5*.03))}{let a=ii(14),l=[];for(let c=0;c<11;c++)l.push([a()*16,a()*16,.75+a()*.35]);for(let c=0;c<16;c++)for(let h=0;h<16;h++){let u=99,d=99,f=1;for(let[m,v,p]of l)for(let[g,x]of[[0,0],[16,0],[-16,0],[0,16],[0,-16]]){let _=Math.hypot(h-m-g,c-v-x);_<u?(d=u,u=_,f=p):_<d&&(d=_)}e(ut.cobble,h,c,d-u<1.1?Oe(4868682):n(Oe(9276813),f))}}for(let a=0;a<16;a++)for(let l=0;l<16;l++){let h=Math.floor(a/4)%2?4:0,u=a%4===0||(l+h)%8===0;e(ut.brick,l,a,u?Oe(6052956):n(Oe(9145227),.9+(l*13+a*7)%6*.03))}i(ut.gravel,[9078144,7301734,10262159,6051925,8156785],15);{let a=ii(16);for(let l=0;l<16;l++)for(let c=0;c<16;c++)e(ut.glow,c,l,Oe([16769946,16368730,14260794,16773832,12089386][Math.floor(a()*5)]))}let r=(a,l,c)=>{let h=ii(c);for(let u=0;u<16;u++)for(let d=0;d<16;d++)e(a,d,u,n(Oe(l),.88+h()*.16-(d+u)%2*.04))};r(ut.woolBlue,3105494,17),r(ut.woolOrange,15759900,18),r(ut.woolWhite,15265008,31),r(ut.concrete,10133158,19),r(ut.dark,2764083,20),r(ut.quartz,15328476,21),r(ut.deepslate,4079172,26),r(ut.obsidian,1709092,32);for(let a=0;a<16;a++)for(let l=0;l<16;l++){let c=l===0||a===0||l===15||a===15;e(ut.glass,l,a,c?Oe(13621728):l-a===3||l-a===4?Oe(15398139):Oe(10273752))}for(let a=0;a<16;a++)for(let l=0;l<16;l++){let c=Math.floor(a/4),h=c%2?2:0,u=a%4===3||(l+h)%4===0;e(ut.roof,l,a,u?Oe(6956056):n(Oe(11027758),.9+(l*5+a)%4*.05))}for(let a=0;a<16;a++)for(let l=0;l<16;l++){let c=l<1||a<1||l>14||a>14||l===8||a===8;e(ut.lamp,l,a,Oe(c?2764083:16774880))}i(ut.clay,[11035711,10115639,11824710,9327154],22);for(let a=0;a<16;a++)for(let l=0;l<16;l++)e(ut.iron,l,a,n(Oe(12896719),.86+(l*3+a*11)%7*.025+(l===0||a===0?-.15:0)));i(ut.water,[3040440,3830472,2775720],23);for(let a=0;a<16;a++)for(let l=0;l<16;l++){let c=l===0||a===0?1.08:l===15||a===15?.82:1;e(ut.paint,l,a,n([235,235,238],c*(.97+(l*7+a*13)%5*.012)))}for(let a=0;a<16;a++)for(let l=0;l<16;l++){let c=l===0||a===0||l===15||a===15;e(ut.tint,l,a,c?Oe(2237996):l-a===4||l-a===5?Oe(3951194):Oe(1054238))}for(let a=0;a<16;a++)for(let l=0;l<16;l++)e(ut.rubber,l,a,Oe((l+a*3)%7===0?1052690:a%4===0?2500138:1842207));for(let a=0;a<16;a++)for(let l=0;l<16;l++)e(ut.carbon,l,a,Oe(((l>>1)+(a>>1))%2?1842722:2764083));for(let a=0;a<16;a++)for(let l=0;l<16;l++){let c=Math.max(Math.abs(l-7.5),Math.abs(a-7.5));e(ut.light,l,a,n([255,255,255],c>6.5?.55:c>4.5?.85:1))}let o=new Mr(t,16,16,dg);return o.colorSpace=Te,o.magFilter=en,o.minFilter=ti,o.wrapS=o.wrapT=bn,o.generateMipmaps=!0,o.anisotropy=8,o.needsUpdate=!0,o}var jf=null;function _S(){return jf||(jf=yS()),jf}var vi={cube:{value:null},density:{value:55e-5},mix:{value:1},tint:{value:new mt(1,1,1)}};function vs({fog:s=!0,side:t=ls,emissiveBoost:e=1}={}){let n=new Ft({color:16777215,vertexColors:!0,roughness:1,metalness:0,side:t,fog:!1});return n.userData.emissiveBoost={value:e},n.onBeforeCompile=i=>{i.uniforms.uBlocks={value:_S()},i.uniforms.uSkyCube=vi.cube,i.uniforms.uFogDensity=vi.density,i.uniforms.uFogMix=vi.mix,i.uniforms.uFogTint=vi.tint,i.uniforms.uEmitBoost=n.userData.emissiveBoost,i.defines=i.defines||{},s&&(i.defines.BLOCK_FOG=""),i.vertexShader=`attribute float aLayer;
attribute vec4 aSurf; // ao, emit, roughness, metalness
varying float vLayer;
varying vec4 vSurf;
varying vec2 vBUv;
varying vec3 vWorldDir;
`+i.vertexShader.replace("#include <uv_vertex>",`#include <uv_vertex>
 vLayer = aLayer; vSurf = aSurf; vBUv = uv;`).replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
 {
   vec4 wp = vec4(transformed, 1.0);
   #ifdef USE_INSTANCING
     wp = instanceMatrix * wp;
   #endif
   wp = modelMatrix * wp;
   vWorldDir = wp.xyz - cameraPosition;
 }`),i.fragmentShader=`uniform sampler2DArray uBlocks;
uniform samplerCube uSkyCube;
uniform float uFogDensity, uFogMix, uEmitBoost;
uniform vec3 uFogTint;
varying float vLayer;
varying vec4 vSurf;
varying vec2 vBUv;
varying vec3 vWorldDir;
`+i.fragmentShader.replace("#include <map_fragment>",`vec4 blockTexel = texture(uBlocks, vec3(vBUv.x, 1.0 - vBUv.y, vLayer));
 diffuseColor.rgb *= blockTexel.rgb * vSurf.x;`).replace("#include <roughnessmap_fragment>","float roughnessFactor = vSurf.z;").replace("#include <metalnessmap_fragment>","float metalnessFactor = vSurf.w;").replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
 totalEmissiveRadiance += blockTexel.rgb * vColor.rgb * vSurf.y * uEmitBoost;`).replace("#include <dithering_fragment>",`#include <dithering_fragment>
 #ifdef BLOCK_FOG
 {
   float dist = length(vWorldDir);
   float f = 1.0 - exp(-pow(dist * uFogDensity, 1.6));
   vec3 dir = normalize(vWorldDir);
   dir.y = max(dir.y, 0.015);
   vec3 skyC = textureLod(uSkyCube, dir, 3.0).rgb * uFogTint;
   gl_FragColor.rgb = mix(gl_FragColor.rgb, skyC, clamp(f, 0.0, 1.0) * uFogMix);
 }
 #endif`)},n.customProgramCacheKey=()=>`block${s?1:0}`,n}var si=class{constructor(){this.pos=[],this.nor=[],this.uv=[],this.col=[],this.layer=[],this.surf=[],this.idx=[]}quad(t,e,n,i,r,o,a,l,c){let h=this.pos.length/3;for(let u=0;u<4;u++)this.pos.push(t[u][0],t[u][1],t[u][2]),this.nor.push(e[0],e[1],e[2]),this.uv.push(n[u][0],n[u][1]),this.col.push(o[0],o[1],o[2]),this.layer.push(i),this.surf.push(r[u],a,l,c);r[0]+r[2]<r[1]+r[3]?this.idx.push(h+1,h+2,h+3,h+1,h+3,h):this.idx.push(h,h+1,h+2,h,h+2,h+3)}get quads(){return this.pos.length/12}build(){let t=new ae;return t.setAttribute("position",new zt(this.pos,3)),t.setAttribute("normal",new zt(this.nor,3)),t.setAttribute("uv",new zt(this.uv,2)),t.setAttribute("color",new zt(this.col,3)),t.setAttribute("aLayer",new zt(this.layer,1)),t.setAttribute("aSurf",new zt(this.surf,4)),t.setIndex(this.pos.length/3>65535?new Sr(this.idx,1):new br(this.idx,1)),t.computeBoundingSphere(),t}};var Jn=class{constructor(t,e,n){this.nx=t,this.ny=e,this.nz=n,this.cells=new Uint8Array(t*e*n),this.tints=null}idx(t,e,n){return t+this.nx*(e+this.ny*n)}get(t,e,n){return t<0||e<0||n<0||t>=this.nx||e>=this.ny||n>=this.nz?0:this.cells[this.idx(t,e,n)]}set(t,e,n,i,r){if(t<0||e<0||n<0||t>=this.nx||e>=this.ny||n>=this.nz)return;let o=this.idx(t,e,n);this.cells[o]=i,r&&(this.tints||(this.tints=new Uint8Array(this.cells.length*3).fill(255)),this.tints[o*3]=r[0],this.tints[o*3+1]=r[1],this.tints[o*3+2]=r[2])}box(t,e,n,i,r,o,a){for(let l=n;l<=o;l++)for(let c=e;c<=r;c++)for(let h=t;h<=i;h++)this.set(h,c,l,a)}solid(t,e,n){let i=this.get(t,e,n);return i!==0&&i!==Y.GLASS&&i!==Y.WATER}mesh(t,e=1,n=[0,0,0],i={}){let{aoStrength:r=.42}=i,o=[this.nx,this.ny,this.nz],a=c=>this.tints?this.tints[c*3]*65536+this.tints[c*3+1]*256+this.tints[c*3+2]:16777215,l=[.86,1,.92];for(let c=0;c<3;c++){let h=(c+1)%3,u=(c+2)%3,d=o[h],f=o[u],m=new Float64Array(d*f),v=new Float32Array(d*f*4),p=[0,0,0],g=[0,0,0],x=[0,0,0];for(let _ of[1,-1])for(let y=0;y<o[c];y++){for(let b=0;b<f;b++)for(let S=0;S<d;S++){p[c]=y,p[h]=S,p[u]=b;let T=b*d+S;m[T]=0;let M=this.get(p[0],p[1],p[2]);if(!M)continue;g[0]=p[0],g[1]=p[1],g[2]=p[2],g[c]+=_;let R=this.get(g[0],g[1],g[2]);if(R===M||R&&R!==Y.GLASS&&R!==Y.WATER)continue;let C=0;for(let I=0;I<4;I++){let L=I===1||I===2?1:-1,k=I>=2?1:-1;x[0]=g[0],x[1]=g[1],x[2]=g[2],x[h]+=L;let N=this.solid(x[0],x[1],x[2])?1:0;x[h]-=L,x[u]+=k;let O=this.solid(x[0],x[1],x[2])?1:0;x[h]+=L;let V=this.solid(x[0],x[1],x[2])?1:0,q=N&&O?3:N+O+V;v[T*4+I]=1-q*(r/3),C=C*4+q}m[T]=M+256*C+65536*256*a(this.idx(p[0],p[1],p[2]))}for(let b=0;b<f;b++)for(let S=0;S<d;){let T=b*d+S,M=m[T];if(!M){S++;continue}let R=1;for(;S+R<d&&m[T+R]===M;)R++;let C=1;t:for(;b+C<f;){for(let Ht=0;Ht<R;Ht++)if(m[(b+C)*d+S+Ht]!==M)break t;C++}for(let Ht=0;Ht<C;Ht++)for(let Vt=0;Vt<R;Vt++)m[(b+Ht)*d+S+Vt]=0;let I=M%256,L=Ko[I];p[c]=y,p[h]=S,p[u]=b;let k=this.idx(p[0],p[1],p[2]),N=this.tints?[this.tints[k*3]/255,this.tints[k*3+1]/255,this.tints[k*3+2]/255]:[1,1,1],O=y+(_>0?1:0),V=[[S,b],[S+R,b],[S+R,b+C],[S,b+C]],q=_>0?[0,1,2,3]:[0,3,2,1],rt=[],G=[],X=[],Q=c===1?_>0?1:.7:l[c];for(let Ht of q){let Vt=[0,0,0];Vt[c]=O,Vt[h]=V[Ht][0],Vt[u]=V[Ht][1],rt.push([n[0]+Vt[0]*e,n[1]+Vt[1]*e,n[2]+Vt[2]*e]),G.push(c===0?[Vt[2],Vt[1]]:c===2?[Vt[0],Vt[1]]:[Vt[0],Vt[2]]),X.push(v[T*4+Ht]*Q)}let _t=[0,0,0];_t[c]=_;let St=c===1?_>0?L.top:L.bottom:L.side;t.quad(rt,_t,G,St,X,N,L.emit,L.rough,L.metal),S+=R}}}return t}};var ar=3,Pi={x0:-45,x1:45,y0:-9,y1:63,z0:-66,z1:78},Jo=s=>[s>>16&255,s>>8&255,s&255],MS=Jo(12588060),bS=Jo(16713734),SS=Jo(16774374);function ES(s,t,e,n){let i=Jo(Se[n].main);if(cg(s,t,e))return e<-44.4?[Y.CARBON]:t<-.5?[Y.CARBON]:e>63&&Math.abs(s)>13&&Math.abs(s)<29&&t>3&&t<11?[Y.HEADLIGHT,SS]:e>43&&e<56&&Math.abs(s)>3&&Math.abs(s)<12&&t>10?[Y.CARBON]:[Y.PAINT,i];let r=hg(s,t,e);if(r>=0){if(r<.12)return[Y.CARBON];let c=Math.abs(s)>ug(e,r)-ar*1.2;return e>10.5?c&&r>.15?[Y.PAINT,i]:[Y.TINT_GLASS]:e<-9?c&&r>.2?[Y.PAINT,i]:[Y.TINT_GLASS]:r>.8?[Y.PAINT,i]:c?e>-3.5&&e<.5?[Y.CARBON]:[Y.TINT_GLASS]:[Y.PAINT,i]}let o=Math.abs(s);if(o<=19&&t>=19&&t<=32&&e>=-46.5&&e<=-26.5)return[Y.CARBON];if(o<=11&&t>32&&t<=44.5&&e>=-42&&e<=-25)return[Y.PAINT,MS];if(o<=9&&t>44.5&&t<=46.5&&e>=-40&&e<=-27)return[Y.CHROME];if(t>46.5&&t<=54&&Math.hypot(o-5.2,e+31)<=3.2)return[Y.CHROME];if(e>=-50&&e<-44.4){for(let c of[29.1,20.1])if(Math.hypot(o-c,t-10.8)<=4)return[Y.TAILLIGHT,bS];if(Math.hypot(s,t-6.5)<=4.8)return Math.hypot(s,t-6.5)<=3.2?[Y.BOOSTLIGHT,Jo(Se[n].light)]:[Y.CHROME];if(e>-47.5&&(t>15.5&&t<19&&o<34||t>0&&t<4.5&&o<31||o>32&&o<35&&t>2&&t<18))return[Y.CARBON]}let a=51+(-52-e)*.43;if(e>=-63&&e<=-41){if(o<=41&&Math.abs(t-a)<=1.6)return[Y.PAINT,i];if(o>40&&o<=43.5&&t>=a-6&&t<=a+7)return[Y.PAINT,i]}let l=-31-(t-21)*.55;return o>=12.5&&o<=15.5&&t>=21&&t<=49&&Math.abs(e-l)<=2?[Y.CARBON]:null}var Ds={};function fg(s){if(Ds["car"+s])return Ds["car"+s];let t=Math.ceil((Pi.x1-Pi.x0)/ar),e=Math.ceil((Pi.y1-Pi.y0)/ar),n=Math.ceil((Pi.z1-Pi.z0)/ar),i=new Jn(t,e,n);for(let a=0;a<n;a++)for(let l=0;l<e;l++)for(let c=0;c<t;c++){let h=Pi.x0+(c+.5)*ar,u=Pi.y0+(l+.5)*ar,d=Pi.z0+(a+.5)*ar,f=ES(h,u,d,s);f&&i.set(c,l,a,f[0],f[1])}let r=new si;i.mesh(r,ar,[Pi.x0,Pi.y0,Pi.z0],{aoStrength:.36});let o=r.build();return o.userData.shared=!0,Ds["car"+s]=o,o}function pg(s,t){let e=`wheel${s}_${t}`;if(Ds[e])return Ds[e];let n=2,i=$o(s),r=Math.ceil(2*s/n),o=Math.ceil(2*i/n),a=new Jn(o,r,r),l=Jo(t===0?16761370:14163486);for(let u=0;u<r;u++)for(let d=0;d<r;d++)for(let f=0;f<o;f++){let m=-s+(d+.5)*n,v=-s+(u+.5)*n,p=-i+(f+.5)*n,g=Math.hypot(m,v);if(g>s)continue;if(g>s*.62){a.set(f,d,u,Y.RUBBER);continue}if(!(p>i-n*1.6)){g>s*.5&&f===Math.floor(o/2)&&a.set(f,d,u,Y.PAINT,l);continue}let _=Math.atan2(v,m),y=Math.abs((_/(Math.PI/3)%1+1)%1-.5)<.18;g<s*.2?a.set(f,d,u,Y.CHROME):(y||g>s*.54)&&a.set(f,d,u,Y.DARK)}let c=new si;a.mesh(c,n,[-i,-s,-s],{aoStrength:.3});let h=c.build();return h.userData.shared=!0,Ds[e]=h,h}function mg(){if(Ds.ball)return Ds.ball;let s=Re.radius,t=s/11,e=22,n=new Jn(e,e,e),i=[[1,.2,.3],[-.8,.5,-.4],[.1,-.9,.6],[-.2,.3,.95],[.4,.9,-.5]].map(l=>new E(...l).normalize()),r=new E;for(let l=0;l<e;l++)for(let c=0;c<e;c++)for(let h=0;h<e;h++){let u=-s+(h+.5)*t,d=-s+(c+.5)*t,f=-s+(l+.5)*t;if(Math.hypot(u,d,f)>s)continue;r.set(u,d,f).normalize();let v=0,p=-2,g=-2;for(let b of i){let S=r.dot(b);S>p?(g=p,p=S):S>g&&(g=S),v=Math.max(v,S)}if(v>.975){n.set(h,c,l,Y.BOOSTLIGHT,[90,170,255]);continue}let x=p-g<.06,_=v>.93,y=150+Math.round((Math.sin(u*.21)+Math.cos(f*.17))*12);x||_?n.set(h,c,l,Y.PAINT,_?[30,44,70]:[52,56,66]):n.set(h,c,l,Y.PAINT,[y*.8|0,y*.82|0,y*.86|0])}let o=new si;n.mesh(o,t,[-s,-s,-s],{aoStrength:.25});let a=o.build();return a.userData.shared=!0,Ds.ball=a,a}var Su=new E,wS=new re,Dl=null;function Eu(){if(Dl)return Dl;let s=ig();s.repeat.set(7,1);let t=lg(),e={transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4};Dl={tireMat:new Ft({color:2302757,map:s,roughness:.92,metalness:0}),sidewallMat:new Ft({color:1644827,roughness:.75,metalness:0}),rimMat:new Ft({color:2369066,roughness:.32,metalness:.9}),lipMat:new Ft({color:9278363,roughness:.22,metalness:1}),barrelMat:new Ft({color:1316120,roughness:.5,metalness:.8,side:Zt}),discMat:new Ft({color:7040627,roughness:.42,metalness:.9}),darkMat:new Ft({color:1118741,roughness:.55,metalness:.3}),frameMat:new Ft({color:2764083,roughness:.42,metalness:.75}),trimMat:new Ft({color:460810,roughness:.18,metalness:.4}),glassMat:new Ar({color:395533,roughness:.04,metalness:.1,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.6}),chromeMat:new Ft({color:14673130,roughness:.1,metalness:1}),engineMat:new Ar({color:11538970,roughness:.3,metalness:.35,clearcoat:1,clearcoatRoughness:.08}),tailLampMat:new Ft({color:3145732,emissive:16718372,emissiveMap:t.lamp,emissiveIntensity:3.4,roughness:.2}),headMat:new Ft({...e,map:t.head.map,emissiveMap:t.head.emissiveMap,emissive:16054527,emissiveIntensity:2.4,roughness:.08,metalness:.4}),panelMat:new ue({...e,map:t.panel}),ventMat:new Ft({...e,map:t.vents,roughness:.5,metalness:.3}),badgeMat:new Ft({...e,map:t.badge,roughness:.2,metalness:.7}),spikeMat:new Ft({color:2830134,roughness:.3,metalness:.9,emissive:5246984,emissiveIntensity:.6}),caliperMats:[new Ft({color:16761370,roughness:.35,metalness:.25}),new Ft({color:14163486,roughness:.35,metalness:.25})],geo:{}};let n=Dl.geo;n.engine=new rr(38,13,20,3,2.4),n.blower=new rr(22,13,17,3,2.4),n.blowerTop=new rr(18,1.8,13,2,.8),n.stack=new qs([new nt(2.6,0),new nt(2.6,5),new nt(3.2,7.4),new nt(4.2,8.6)],18),n.pulley=new Fe(3,3,2,18),n.pulley.rotateZ(Math.PI/2),n.belt=new rr(2.2,11,16,2,1),n.bar=new Fe(1.1,1.1,1,10),n.bar.rotateZ(Math.PI/2),n.post=new Fe(1.1,1.1,1,10),n.shaft=new Fe(1.5,1.5,1,10),n.shaft.rotateZ(Math.PI/2),n.lampHousing=new Fe(3.9,3.9,2.4,22),n.lampHousing.rotateX(Math.PI/2),n.lamp=new ki(3.2,22),n.lamp.rotateY(Math.PI),n.undertray=new rr(52,3,9,2,1.2),n.wing=TS(),n.endplate=RS(),n.strut=AS(),n.pipe=new Fe(4.6,4.2,6,22,1,!0),n.pipe.rotateX(Math.PI/2),n.pipeInner=new ki(3.9,22),n.pipeInner.rotateY(Math.PI),n.pipeRim=new Yn(4.5,.6,8,22);for(let i in n)n[i].userData.shared=!0;return Dl}function TS(){let s=new Vi;s.moveTo(9,0),s.bezierCurveTo(5,2,-4,2.8,-9,1.6),s.lineTo(-9.2,.6),s.bezierCurveTo(-4,.9,4,.2,9,-.4),s.closePath();let t=new Tr(s,{depth:74,bevelEnabled:!0,bevelThickness:.5,bevelSize:.4,bevelSegments:2,curveSegments:10});return t.translate(0,0,-37),t.rotateY(Math.PI/2),t}function RS(){let s=new Vi;s.moveTo(10,-5),s.lineTo(-11,-3),s.lineTo(-13,8),s.lineTo(4,5),s.closePath();let t=new Tr(s,{depth:1,bevelEnabled:!0,bevelThickness:.2,bevelSize:.2,bevelSegments:1});return t.translate(0,0,-.5),t.rotateY(-Math.PI/2),t}function AS(){let s=new Vi;s.moveTo(4,0),s.lineTo(-3,0),s.lineTo(-11,21),s.lineTo(-5,21),s.closePath();let t=new Tr(s,{depth:1.6,bevelEnabled:!0,bevelThickness:.3,bevelSize:.3,bevelSegments:1});return t.translate(0,0,-.8),t.rotateY(-Math.PI/2),t}function gg(s,t){let e=document.createElement("canvas");e.width=256,e.height=160;let n=e.getContext("2d");n.font="italic 900 132px Arial Black, Arial, sans-serif",n.textAlign="center",n.textBaseline="middle",n.lineJoin="round",n.lineWidth=18,n.strokeStyle="#101216",n.strokeText(String(s),128,84),n.fillStyle="#f4f6fa",n.fillText(String(s),128,84),n.lineWidth=4,n.strokeStyle=t,n.strokeText(String(s),128,84);let i=new Xe(e);return i.colorSpace=Te,i}var wu=class{constructor(t,e=0,n="high",i="classic"){let r=Eu(),o=Se[t];this.team=t,this.root=new se,this.body=new se,this.body.scale.setScalar(.01),this.root.add(this.body),this.tilt=new nt,i==="blocky"?this.buildVoxel(t,e):this.buildClassic(t,e,n),this.addBoost(t),this.spikes=null,this.powerOn=!1}buildVoxel(t,e){let n=Se[t],i=vs();this.paint=i,this.chassis=new se,this.body.add(this.chassis);let r=new et(fg(t),i);if(r.castShadow=!0,r.receiveShadow=!0,this.chassis.add(r),e){let o=new Ft({map:gg(e,n.css),transparent:!0,depthWrite:!1,roughness:.4,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),a=new Be(18,11);for(let l of[-1,1]){let c=new et(a,o);c.position.set(l*33.15,7,5),c.rotation.y=l*Math.PI/2,this.chassis.add(c)}}this.wheels=[];for(let o of Ut.wheels){let a=Math.sign(o.x),l=new se;l.position.set(a*(Math.abs(o.x)+7),-Ut.restHeight+o.r,o.z);let c=new se;l.add(c);let h=new et(pg(o.r,t),i);h.castShadow=!0,a<0&&(h.rotation.y=Math.PI),c.add(h),this.body.add(l),this.wheels.push({pivot:l,spin:c,front:o.front,r:o.r,baseY:l.position.y})}}buildClassic(t,e,n){let i=Eu(),r=ag(n),o=Se[t],a=new Ar({color:o.main,metalness:.4,roughness:.32,clearcoat:1,clearcoatRoughness:.035,envMapIntensity:1.2});this.paint=a;let l=(m,v,p=0,g=0,x=0,_=this.body,y=!0)=>{let b=new et(m,v);return b.position.set(p,g,x),b.castShadow=y,b.receiveShadow=y,_.add(b),b};l(r.body,[a,i.darkMat]),l(r.greenhouse,[a,i.glassMat,i.trimMat]);let c=r.decals;for(let m of["headR","headL"])l(c[m],i.headMat,0,0,0,this.body,!1);for(let m of["doorR","doorL"])l(c[m],i.panelMat,0,0,0,this.body,!1);if(l(c.hoodVents,i.ventMat,0,0,0,this.body,!1),l(c.badge,i.badgeMat,0,0,0,this.body,!1),e){let m=new Ft({map:gg(e,o.css),transparent:!0,depthWrite:!1,roughness:.3,metalness:.2,polygonOffset:!0,polygonOffsetFactor:-5,polygonOffsetUnits:-5});for(let v of["numR","numL"])l(c[v],m,0,0,0,this.body,!1)}l(i.geo.engine,i.frameMat,0,25.5,-36.5),l(i.geo.blower,i.engineMat,0,38,-33.5),l(i.geo.blowerTop,i.chromeMat,0,45.2,-33.5,this.body,!1);for(let m of[-1,1])l(i.geo.stack,i.chromeMat,m*5.2,45.8,-31);l(i.geo.belt,i.darkMat,12.5,33,-28.5),l(i.geo.pulley,i.chromeMat,12.8,37,-23.5);let h=(m,v,p,g,x=i.frameMat)=>{let _=l(i.geo.bar,x,v,p,g);return _.scale.x=m,_},u=(m,v,p,g)=>{let x=l(i.geo.post,i.frameMat,v,p,g);return x.scale.y=m,x};h(66,0,17.5,-46.2),h(62,0,2.5,-46.4);for(let m of[-1,1]){u(15,m*33.5,10,-46.3),u(12,m*14,8.6,-46.3);for(let v of[33.5,24.5])l(i.geo.lampHousing,i.trimMat,m*(v-4.4),10.8,-46.6),l(i.geo.lamp,i.tailLampMat,m*(v-4.4),10.8,-47.85,this.body,!1)}l(i.geo.undertray,i.frameMat,0,-3.5,-42);for(let m of Ut.wheels){let v=Math.sign(m.x),p=13,g=Math.abs(m.x)+7-$o(m.r)*.4,x=l(i.geo.shaft,i.frameMat,v*(p+g)/2,-Ut.restHeight+m.r,m.z,this.body,!1);x.scale.x=g-p}let d=l(i.geo.wing,a,0,51,-52);d.rotation.x=.42,d.scale.set(1.12,1.1,1.25);for(let m of[-1,1]){l(i.geo.strut,i.frameMat,m*14,21,-33).scale.set(1,1.42,1.35);let p=l(i.geo.endplate,a,m*41.8,51.5,-52);p.rotation.x=.3,p.scale.set(1,1.2,1.25)}l(i.geo.pipe,i.chromeMat,0,6.5,-46.5),l(i.geo.pipeRim,i.chromeMat,0,6.5,-49.5,this.body,!1),l(i.geo.pipeInner,i.darkMat,0,6.5,-48.6,this.body,!1),this.wheels=[];let f=i.caliperMats[t];for(let m of Ut.wheels){let v=Math.sign(m.x),p=r.wheels[m.r],g=new se;g.position.set(v*(Math.abs(m.x)+7),-Ut.restHeight+m.r,m.z);let x=new se;g.add(x);let _=new se;v<0&&(_.rotation.y=Math.PI),x.add(_),l(p.tread,i.tireMat,0,0,0,_),l(p.sideOut,i.sidewallMat,0,0,0,_),l(p.sideIn,i.sidewallMat,0,0,0,_),l(p.barrel,i.barrelMat,0,0,0,_,!1),l(p.lip,i.lipMat,0,0,0,_,!1),l(p.spokes,i.rimMat,0,0,0,_),l(p.nuts,i.chromeMat,0,0,0,_,!1),l(p.cap,i.badgeMat,0,0,0,_,!1),l(p.disc,i.discMat,0,0,0,_,!1);let y=new se;v<0&&(y.rotation.y=Math.PI),l(p.caliper,f,0,0,0,y,!1),g.add(y),this.body.add(g),this.wheels.push({pivot:g,spin:x,front:m.front,r:m.r,baseY:g.position.y})}}addBoost(t){let e=Eu(),n=Se[t],i=new mt(...n.flame),r=new zi(7,46,16,1,!0);r.translate(0,-23,0),r.rotateX(-Math.PI/2),this.flame=new et(r,new ue({color:i.clone().multiplyScalar(1.4),transparent:!0,opacity:.75,blending:de,depthWrite:!1,fog:!1})),this.flame.position.set(0,6.5,-49);let o=new zi(3.6,26,12,1,!0);o.translate(0,-13,0),o.rotateX(-Math.PI/2),this.flameCore=new et(o,new ue({color:new mt(2.2,2.2,2.2),transparent:!0,opacity:.9,blending:de,depthWrite:!1,fog:!1})),this.flame.add(this.flameCore),this.body.add(this.flame),this.flame.visible=!1,this.exhaustGlow=new se;let a=new ue({color:i.clone().multiplyScalar(1.5),transparent:!0,opacity:.6,blending:de,depthWrite:!1});this.exhaustGlow.material=a;let l=new et(e.geo.pipeInner,a);l.position.set(0,6.5,-48.4),this.exhaustGlow.add(l),this.body.add(this.exhaustGlow),this.flicker=0}setSpikes(t){if(t&&!this.spikes){let e=Eu();this.spikes=new se;let n=new zi(3.2,13,6),i=[new E(0,35.6,2),new E(13,34.2,-6),new E(-13,34.2,-6),new E(13,34.2,9),new E(-13,34.2,9),new E(0,15.5,52),Hr(51,1,.42),Hr(51,-1,.42),new E(0,3,74.5),Hr(8,1,.55),Hr(8,-1,.55),Hr(-34,1,.3),Hr(-34,-1,.3),new E(0,41,-36),new E(0,18,-47)];for(let r of i){let o=new et(n,e.spikeMat);o.position.copy(r);let a=new E(r.x,r.y+10,(r.z-10)*.6).normalize();o.quaternion.setFromUnitVectors(new E(0,1,0),a),this.spikes.add(o)}this.body.add(this.spikes)}this.spikes&&(this.spikes.visible=t)}setPower(t,e){t?(this.paint.emissive.setRGB(1,.08,.02),this.paint.emissiveIntensity=.5+Math.sin(e*14)*.25):this.powerOn&&(this.paint.emissive.setRGB(0,0,0),this.paint.emissiveIntensity=1),this.powerOn=t}update(t,e,n,i){if(this.root.visible=!t.demolished,t.demolished)return;this.root.position.set(e.x*.01,e.y*.01,e.z*.01),this.root.quaternion.copy(n);for(let o of this.wheels)o.spin.rotation.x=t.wheelSpin*(12.5/o.r),o.front&&(o.pivot.rotation.y=-t.steerVisual*.42);for(let o=0;o<4;o++){let a=this.wheels[o],l=t.wheelDist[o],c=l>=0?a.baseY+(Ut.restHeight-l)*.6:a.baseY-4;a.pivot.position.y+=(Math.max(a.baseY-6,Math.min(a.baseY+6,c))-a.pivot.position.y)*Math.min(1,i*20)}if(this.chassis&&i>0){this.prevVel||(this.prevVel=t.vel.clone()),Su.subVectors(t.vel,this.prevVel).divideScalar(Math.max(i,1/240)),this.prevVel.copy(t.vel),Su.applyQuaternion(wS.copy(n).invert());let o=t.onGround!==!1,a=o?pe.clamp(-Su.z*22e-6,-.055,.055):0,l=o?pe.clamp(Su.x*24e-6,-.065,.065):0,c=Math.min(1,i*7);this.tilt.x+=(a-this.tilt.x)*c,this.tilt.y+=(l-this.tilt.y)*c,this.chassis.rotation.set(this.tilt.x,0,this.tilt.y)}this.flicker+=i*40;let r=t.boosting;if(this.flame.visible=r,r){let o=.85+Math.sin(this.flicker)*.12+Math.random()*.15;this.flame.scale.set(o,o,o*(t.supersonic?1.35:1))}this.exhaustGlow.material.opacity=r?1:.45}};var Tu=class{constructor(t,e,n=!1){this.max=t,this.count=0,this.p=new Float32Array(t*3),this.v=new Float32Array(t*3),this.life=new Float32Array(t),this.maxLife=new Float32Array(t),this.size=new Float32Array(t*2),this.c0=new Float32Array(t*4),this.c1=new Float32Array(t*4),this.phys=new Float32Array(t*4);let i=new sl,r=new Be(1,1);i.index=r.index,i.setAttribute("position",r.attributes.position),i.setAttribute("uv",r.attributes.uv),this.aPos=new Hi(new Float32Array(t*3),3).setUsage(ei),this.aCol=new Hi(new Float32Array(t*4),4).setUsage(ei),this.aSR=new Hi(new Float32Array(t*2),2).setUsage(ei),i.setAttribute("iPos",this.aPos),i.setAttribute("iCol",this.aCol),i.setAttribute("iSR",this.aSR),i.instanceCount=0,this.geo=i;let o=new te({transparent:!0,depthWrite:!1,blending:e?de:Ei,uniforms:{},vertexShader:`
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
          ${n?"vec2 q = abs(vUv - 0.5) * 2.0; float r = max(q.x, q.y); float a = (1.0 - smoothstep(0.55, 0.85, r)) * 0.9 + (1.0 - r) * 0.1;":"float r = length(vUv - 0.5) * 2.0; float a = 1.0 - smoothstep(0.0, 1.0, r); a *= a;"}
          gl_FragColor = vec4(vCol.rgb, vCol.a * a);
          #include <colorspace_fragment>
        }`:`
        varying vec2 vUv; varying vec4 vCol; varying float vSeed;
        float h(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
        float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
        void main() {
          ${n?`// pixel-art puff: 6x6 cells, square falloff
          vec2 uv = (floor(vUv * 6.0) + 0.5) / 6.0; vec2 d = abs(uv - 0.5); float r = max(d.x, d.y) * 2.2;`:"vec2 uv = vUv; float r = length(vUv - 0.5) * 2.0;"}
          float puff = n(uv * 4.0 + vSeed * 17.0) * 0.6 + n(uv * 9.0 - vSeed * 5.0) * 0.4;
          float a = (1.0 - smoothstep(0.35, 1.0, r + (puff - 0.5) * 0.5));
          gl_FragColor = vec4(vCol.rgb * (0.8 + puff * 0.4), vCol.a * a);
          #include <colorspace_fragment>
        }`});this.mesh=new et(i,o),this.mesh.frustumCulled=!1,this.mesh.renderOrder=e?5:4}emit(t,e,n,i,r,o,a,l,c,h,u,d=0,f=0,m=0){let v;this.count<this.max?v=this.count++:v=Math.floor(Math.random()*this.max),this.p[v*3]=t,this.p[v*3+1]=e,this.p[v*3+2]=n,this.v[v*3]=i,this.v[v*3+1]=r,this.v[v*3+2]=o,this.life[v]=a,this.maxLife[v]=a,this.size[v*2]=l,this.size[v*2+1]=c,this.c0.set(h,v*4),this.c1.set(u,v*4),this.phys[v*4]=d,this.phys[v*4+1]=f,this.phys[v*4+2]=Math.random()*6.28,this.phys[v*4+3]=m}update(t){let{p:e,v:n,life:i,maxLife:r,size:o,c0:a,c1:l,phys:c}=this,h=this.aPos.array,u=this.aCol.array,d=this.aSR.array,f=this.count;for(let m=0;m<f;m++){if(i[m]-=t,i[m]<=0){f--,m!==f&&(e.copyWithin(m*3,f*3,f*3+3),n.copyWithin(m*3,f*3,f*3+3),i[m]=i[f],r[m]=r[f],o.copyWithin(m*2,f*2,f*2+2),a.copyWithin(m*4,f*4,f*4+4),l.copyWithin(m*4,f*4,f*4+4),c.copyWithin(m*4,f*4,f*4+4),m--);continue}let v=Math.max(0,1-c[m*4]*t);n[m*3]*=v,n[m*3+1]=n[m*3+1]*v-c[m*4+1]*t,n[m*3+2]*=v,e[m*3]+=n[m*3]*t,e[m*3+1]+=n[m*3+1]*t,e[m*3+2]+=n[m*3+2]*t,c[m*4+2]+=c[m*4+3]*t}this.count=f;for(let m=0;m<f;m++){let v=1-i[m]/r[m];h[m*3]=e[m*3],h[m*3+1]=e[m*3+1],h[m*3+2]=e[m*3+2];for(let p=0;p<4;p++)u[m*4+p]=a[m*4+p]+(l[m*4+p]-a[m*4+p])*v;d[m*2]=o[m*2]+(o[m*2+1]-o[m*2])*v,d[m*2+1]=c[m*4+2]}this.geo.instanceCount=f,f>0&&(this.aPos.clearUpdateRanges(),this.aPos.addUpdateRange(0,f*3),this.aPos.needsUpdate=!0,this.aCol.clearUpdateRanges(),this.aCol.addUpdateRange(0,f*4),this.aCol.needsUpdate=!0,this.aSR.clearUpdateRanges(),this.aSR.addUpdateRange(0,f*2),this.aSR.needsUpdate=!0)}clear(){this.count=0,this.geo.instanceCount=0}},Ie=new E,on=new E,Qf=new E,jo=new E,Ge=new E,CS=new le,PS=new re,IS=new E,ft=(s,t)=>s+Math.random()*(t-s),Ru=class{constructor(t,e,n="classic"){this.scene=t,this.blocky=n==="blocky",this.mult=e==="low"?.45:e==="medium"?.75:1,this.glow=new Tu(e==="low"?1500:4e3,!0,this.blocky),this.smoke=new Tu(e==="low"?600:1800,!1,this.blocky),t.add(this.glow.mesh,this.smoke.mesh),this.flashes=[],this.sphereGeo=new yn(1,32,16),this.ringGeo=new Yn(1,.06,8,64),this.blocky&&this.initCubes(e==="low"?120:320)}initCubes(t){let e=new Ft({roughness:.55,metalness:.05,emissive:16777215,emissiveIntensity:0});e.onBeforeCompile=n=>{n.fragmentShader=n.fragmentShader.replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
 totalEmissiveRadiance = vColor.rgb * 0.9;`)},this.cubes=new hi(new De(1,1,1),e,t),this.cubes.instanceColor=new Hi(new Float32Array(t*3),3),this.cubes.count=0,this.cubes.frustumCulled=!1,this.cubes.castShadow=!0,this.scene.add(this.cubes),this.cubeList=[],this.cubeMax=t}blocks(t,e,n,i,r=.35){if(this.cubes){n=Math.round(n*this.mult);for(let o=0;o<n;o++)this.cubeList.length>=this.cubeMax&&this.cubeList.shift(),Ie.set(ft(-1,1),ft(-.1,1.2),ft(-1,1)).normalize().multiplyScalar(ft(.3,1)*i),this.cubeList.push({p:t.clone().add(new E(ft(-.4,.4),ft(-.4,.4),ft(-.4,.4))),v:Ie.clone(),r:new ci(ft(0,6),ft(0,6),ft(0,6)),w:new E(ft(-9,9),ft(-9,9),ft(-9,9)),s:r*ft(.6,1.4),t:0,life:ft(2.2,3.6),c:e[Math.random()*e.length|0]})}}updateCubes(t){let e=CS,n=PS,i=IS,r=this.cubeList;for(let o=r.length-1;o>=0;o--){let a=r[o];if(a.t+=t,a.t>a.life){r.splice(o,1);continue}a.v.y-=16*t,a.p.addScaledVector(a.v,t);let l=a.s/2;a.p.y<l&&(a.p.y=l,a.v.y=Math.abs(a.v.y)*.35,a.v.x*=.7,a.v.z*=.7,a.w.multiplyScalar(.6)),a.r.x+=a.w.x*t,a.r.y+=a.w.y*t,a.r.z+=a.w.z*t}for(let o=0;o<r.length;o++){let a=r[o],l=Math.min(1,(a.life-a.t)/.6);n.setFromEuler(a.r),i.setScalar(a.s*l),e.compose(a.p,n,i),this.cubes.setMatrixAt(o,e),this.cubes.instanceColor.setXYZ(o,a.c[0],a.c[1],a.c[2])}this.cubes.count=r.length,this.cubes.instanceMatrix.needsUpdate=!0,this.cubes.instanceColor.needsUpdate=!0}clear(){this.glow.clear(),this.smoke.clear(),this.cubes&&(this.cubeList.length=0,this.cubes.count=0);for(let t of this.flashes)this.scene.remove(t.mesh);this.flashes.length=0}carTrail(t,e,n,i){if(t.demolished)return;let r=Se[t.team];if(on.set(0,0,1).applyQuaternion(n),Qf.set(0,1,0).applyQuaternion(n),jo.set(1,0,0).applyQuaternion(n),t.boosting){Ge.copy(e).addScaledVector(on,-51).addScaledVector(Qf,6.5).multiplyScalar(.01);let o=Ie.copy(t.vel).multiplyScalar(.01),a=Math.max(1,Math.round(i*150*this.mult)),l=r.flame,c=r.flameEnd;for(let h=0;h<a;h++){let u=ft(7,12),d=Math.random()*i;this.glow.emit(Ge.x-on.x*u*d+ft(-.03,.03),Ge.y-on.y*u*d+ft(-.03,.03),Ge.z-on.z*u*d+ft(-.03,.03),o.x*.2-on.x*u+ft(-.5,.5),o.y*.2-on.y*u+ft(-.5,.5),o.z*.2-on.z*u+ft(-.5,.5),ft(.1,.2),ft(.12,.2),ft(.3,.55),[l[0]*1.1,l[1]*1.1,l[2]*1.1,.55],[c[0],c[1],c[2],0],2,0)}if(Math.random()<i*40*this.mult){let h=[c[0]*.9+.1,c[1]*.9+.1,c[2]*.9+.1];this.smoke.emit(Ge.x-on.x*.4,Ge.y-on.y*.4,Ge.z-on.z*.4,o.x*.25-on.x*2+ft(-.4,.4),o.y*.25+ft(0,.6),o.z*.25-on.z*2+ft(-.4,.4),ft(.7,1.1),.35,ft(1.4,2.2),[h[0],h[1],h[2],.22],[.25,.25,.28,0],1.2,-.3,ft(-1,1))}}if(t.boosting&&Math.random()<i*60*this.mult){let o=r.flame,a=Ie.copy(t.vel).multiplyScalar(.01*.3);for(let l=0;l<2;l++)this.glow.emit(Ge.x,Ge.y,Ge.z,a.x-on.x*ft(4,9)+ft(-2.5,2.5),a.y+ft(-1,3),a.z-on.z*ft(4,9)+ft(-2.5,2.5),ft(.25,.55),ft(.05,.09),.02,[o[0]*3,o[1]*3,o[2]*3,1],[o[0],o[1]*.6,o[2]*.4,0],1.5,7)}if(t.supersonic)for(let o of[-1,1])Math.random()>.8*this.mult||(Ge.copy(e).addScaledVector(jo,o*30).addScaledVector(on,-36).addScaledVector(Qf,5).multiplyScalar(.01),this.glow.emit(Ge.x,Ge.y,Ge.z,0,0,0,.28,.12,.04,[1.6,1.7,1.8,.8],[.8,.9,1,0],0,0))}dirt(t,e,n,i,r){if(i<=0)return;on.set(0,0,1).applyQuaternion(n),jo.set(1,0,0).applyQuaternion(n);let o=Math.round(r*70*i*this.mult+Math.random());for(let a=0;a<o;a++){let l=a%2?1:-1;Ge.copy(e).addScaledVector(jo,l*34).addScaledVector(on,-36).multiplyScalar(.01);let c=ft(2,6),u=Math.random()<.45?[.12,.22,.06,1]:[.16,.11,.06,1];this.smoke.emit(Ge.x,.12,Ge.z,t.vel.x*.01*.2-on.x*c+jo.x*l*ft(0,2),ft(2.5,5.5),t.vel.z*.01*.2-on.z*c+jo.z*l*ft(0,2),ft(.5,.9),ft(.05,.11),ft(.04,.08),u,[u[0],u[1],u[2],.7],.3,13,ft(-10,10))}Math.random()<r*10*i*this.mult&&(Ge.copy(e).addScaledVector(on,-40).multiplyScalar(.01),this.smoke.emit(Ge.x,.15,Ge.z,-on.x*1.5,ft(.3,.9),-on.z*1.5,ft(.7,1.2),.3,ft(1,1.6),[.36,.33,.25,.3],[.3,.28,.24,0],1,-.2,ft(-1,1)))}pyro(t,e,n){let i=Se[e];for(let r of t){let o=Math.round(n*110*this.mult);for(let a=0;a<o;a++){let l=Math.random()<.5;this.glow.emit(r.x*.01+ft(-.3,.3),r.y*.01,r.z*.01+ft(-.3,.3),ft(-.8,.8),ft(14,22),ft(-.8,.8),ft(.35,.7),ft(.5,.9),ft(1.1,1.9),l?[2.1,1,.25,.85]:[i.flame[0]*1.6,i.flame[1]*1.1,i.flame[2]*.9,.8],[.9,.18,.03,0],1.2,2)}}}ballTrail(t,e){let n=t.vel.length(),i=this.blocky?1700:2600;n<i||Math.random()>(n-i)/2e3*this.mult||(Ge.copy(e).multiplyScalar(.01),this.glow.emit(Ge.x+ft(-.3,.3),Ge.y+ft(-.3,.3),Ge.z+ft(-.3,.3),0,0,0,.35,1,.2,[.6,.85,1.4,.35],[.2,.4,1,0],0,0))}hit(t,e){let n=Ge.copy(t).multiplyScalar(.01),i=Math.round(Math.min(40,e/60)*this.mult);for(let r=0;r<i;r++){let o=ft(3,9)*Math.min(2,e/1500);Ie.set(ft(-1,1),ft(-.2,1),ft(-1,1)).normalize().multiplyScalar(o),this.glow.emit(n.x,n.y,n.z,Ie.x,Ie.y,Ie.z,ft(.15,.35),ft(.06,.12),.02,[3,2.6,1.8,1],[2,.8,.2,0],2,6)}e>1800&&this.flash(n,12575743,1.6,.18,2.5),this.blocky&&e>1400&&this.blocks(n,[[.45,.75,1.6],[1.2,1.2,1.3],[.2,.22,.26]],10,7,.16)}boostPickup(t){let e=Math.round((t.big?40:12)*this.mult);for(let n=0;n<e;n++)this.glow.emit(t.x*.01+ft(-.6,.6),ft(.1,.4),t.z*.01+ft(-.6,.6),ft(-1,1),ft(2,6),ft(-1,1),ft(.3,.6),ft(.1,.25),.02,[3,1.8,.4,1],[2,.6,.05,0],1,2)}flash(t,e,n,i,r=3){let o=new ue({color:new mt(e).multiplyScalar(r),transparent:!0,blending:de,depthWrite:!1,fog:!1}),a=new et(this.sphereGeo,o);a.position.copy(t),a.scale.setScalar(.01),this.scene.add(a),this.flashes.push({mesh:a,t:0,dur:i,size:n,kind:"sphere"})}ring(t,e,n,i){let r=new ue({color:new mt(e).multiplyScalar(4),transparent:!0,blending:de,depthWrite:!1,fog:!1}),o=new et(this.ringGeo,r);o.position.copy(t),o.rotation.x=Math.PI/2,this.scene.add(o),this.flashes.push({mesh:o,t:0,dur:i,size:n,kind:"ring"})}explosion(t,e,n){let i=Se[e],r=Ge.copy(t).multiplyScalar(.01).clone(),o=i.flame,a=i.flameEnd,l=Math.round((n?420:140)*this.mult),c=n?28:12;for(let u=0;u<l;u++)Ie.set(ft(-1,1),ft(-.3,1),ft(-1,1)).normalize().multiplyScalar(ft(.2,1)*c),this.glow.emit(r.x,r.y,r.z,Ie.x,Ie.y,Ie.z,ft(.5,n?1.6:.9),ft(.3,.8),ft(.1,.4),[o[0]*3,o[1]*3,o[2]*3,1],[a[0]*2,a[1]*2,a[2]*2,0],2.2,n?3:4);let h=Math.round((n?90:40)*this.mult);for(let u=0;u<h;u++)Ie.set(ft(-1,1),ft(0,1),ft(-1,1)).normalize().multiplyScalar(ft(1,n?10:5)),this.smoke.emit(r.x,r.y,r.z,Ie.x,Ie.y,Ie.z,ft(1.2,2.4),ft(.8,1.4),ft(2.5,n?6:3.5),[.3,.3,.33,.55],[.12,.12,.14,0],1.6,-.6,ft(-1,1));if(this.flash(r,i.main,n?9:3,n?.55:.3,4),this.ring(r,i.light,n?26:8,n?.9:.5),this.blocky){let u=new mt(i.main),d=new mt(i.light);this.blocks(r,[[u.r,u.g,u.b],[d.r,d.g,d.b],[1,.95,.8],[.35,.6,.18]],n?150:40,n?22:10,n?.55:.35)}}demolition(t,e){let n=Se[e],i=Ge.copy(t).multiplyScalar(.01).clone();i.y+=.3;let r=Math.round(170*this.mult);for(let c=0;c<r;c++){Ie.set(ft(-1,1),ft(-.2,1),ft(-1,1)).normalize().multiplyScalar(ft(2,11));let h=Math.random()<.35;this.glow.emit(i.x,i.y,i.z,Ie.x,Ie.y,Ie.z,ft(.3,.8),ft(.3,.7),ft(.1,.35),h?[1.8,1.3,.7,.7]:[1.6,.6,.12,.7],[.8,.15,.02,0],2.5,-1.5)}let o=Math.round(60*this.mult);for(let c=0;c<o;c++)Ie.set(ft(-1,1),ft(0,1.2),ft(-1,1)).normalize().multiplyScalar(ft(6,16)),this.glow.emit(i.x,i.y,i.z,Ie.x,Ie.y,Ie.z,ft(.4,.8),ft(.08,.16),.03,[n.flame[0]*3,n.flame[1]*3,n.flame[2]*3,1],[n.flameEnd[0],n.flameEnd[1],n.flameEnd[2],0],1,9);let a=Math.round(40*this.mult);for(let c=0;c<a;c++)Ie.set(ft(-1,1),ft(.4,1.4),ft(-1,1)).normalize().multiplyScalar(ft(5,13)),this.smoke.emit(i.x,i.y,i.z,Ie.x,Ie.y,Ie.z,ft(.8,1.5),ft(.12,.25),ft(.08,.15),[.05,.05,.06,1],[.05,.05,.06,.8],.4,14,ft(-12,12));let l=Math.round(70*this.mult);for(let c=0;c<l;c++)Ie.set(ft(-1,1),ft(.2,1),ft(-1,1)).normalize().multiplyScalar(ft(1,5)),this.smoke.emit(i.x,i.y,i.z,Ie.x,Ie.y,Ie.z,ft(1.6,3),ft(.8,1.4),ft(3,5.5),[.12,.1,.1,.75],[.05,.05,.06,0],1.3,-.8,ft(-1,1));if(this.flash(i,16747056,3,.25,2),this.ring(i,16756832,10,.55),this.blocky){let c=new mt(n.main);this.blocks(i,[[c.r,c.g,c.b],[.05,.05,.06],[.12,.12,.13],[1.4,.6,.1]],34,11,.3)}}update(t){this.glow.update(t),this.smoke.update(t),this.cubes&&this.updateCubes(t);for(let e=this.flashes.length-1;e>=0;e--){let n=this.flashes[e];n.t+=t;let i=n.t/n.dur;if(i>=1){this.scene.remove(n.mesh),n.mesh.material.dispose(),this.flashes.splice(e,1);continue}let r=1-Math.pow(1-i,3);n.mesh.scale.setScalar(Math.max(.01,n.size*r)),n.mesh.material.opacity=1-i}}};var LS=new E(0,1,0),Dn=new E,xi=new E,tp=new E,DS=new E,Ii=new E,vg=new re,Qo=new E,xg=new re;function Nl(s,t,e,n){return pe.clamp(t.dot(e),-1,1)>.99999?s.copy(e):(vg.setFromUnitVectors(t,e),xg.identity().slerp(vg,n),s.copy(t).applyQuaternion(xg))}var ta=class{constructor(t){this.camera=t,this.dir=new E(0,0,1),this.camUp=new E(0,1,0),this.look=new E(0,0,1),this.pos=new E,this.ballCam=!0,this.shake=0,this.first=!0,this.distance=280,this.height=105,this.lookYaw=0}snap(){this.first=!0}addShake(t){this.shake=Math.min(1.5,this.shake+t)}update(t,e,n,i,r,o=0,a=0){let l=e.onGround&&e.groundNormal.y>-.2,c=l?e.groundNormal:LS;this.first?this.camUp.copy(c):Nl(this.camUp,this.camUp,c,1-Math.exp(-t*(l?9:4)));let h=this.camUp;this.ballCam&&r?Dn.copy(r).sub(n):(Dn.set(0,0,1).applyQuaternion(i),!e.onGround&&e.vel.lengthSq()>500*500&&Dn.lerp(xi.copy(e.vel).normalize(),.5)),Dn.addScaledVector(c,-Dn.dot(c)),Dn.lengthSq()<1&&(Dn.set(0,0,1).applyQuaternion(i),Dn.addScaledVector(c,-Dn.dot(c)),Dn.lengthSq()<1e-4&&Dn.copy(this.dir)),Dn.normalize();let u=this.dir.dot(Dn);this.first?this.dir.copy(Dn):u<-.95?(xi.crossVectors(h,this.dir).normalize(),this.dir.addScaledVector(xi,.25).normalize()):Nl(this.dir,this.dir,Dn,this.ballCam?1-Math.exp(-t*7.5):1-Math.exp(-t*6)),xi.copy(this.dir).addScaledVector(h,-this.dir.dot(h)),xi.lengthSq()<.001&&xi.copy(Dn).addScaledVector(h,-Dn.dot(h)),xi.lengthSq()>1e-6&&this.dir.copy(xi).normalize(),this.lookYaw+=(o*Math.PI*.95-this.lookYaw)*Math.min(1,t*10);let d=DS.copy(this.dir);Math.abs(this.lookYaw)>.001&&d.applyAxisAngle(h,-this.lookYaw);let f=e.vel.length(),m=this.distance+Math.min(60,f*.02),v=xi.copy(n).addScaledVector(d,-m).addScaledVector(h,this.height+a*-60);this.first?this.pos.copy(v):this.pos.lerp(v,1-Math.exp(-t*14));for(let g=0;g<2;g++){let x=fi(this.pos.x,this.pos.y,this.pos.z);x<40&&(Ps(this.pos.x,this.pos.y,this.pos.z,tp),this.pos.addScaledVector(tp,40-x))}if(Qo.copy(n).addScaledVector(h,70).addScaledVector(d,260),Ii.copy(Qo).sub(this.pos).normalize(),this.ballCam&&r&&Math.abs(this.lookYaw)<.3){let g=xi.copy(r).sub(this.pos).normalize();Ii.copy(g);let x=tp.copy(n).addScaledVector(h,10).sub(this.pos).normalize(),_=pe.degToRad(this.camera.fov*.5)*.82,y=Math.acos(pe.clamp(x.dot(Ii),-1,1));y>_&&Nl(Ii,x,Ii,_/y);let b=Ii.dot(h);b<-.35&&Ii.addScaledVector(h,-.35-b).normalize()}this.first?this.look.copy(Ii):Nl(this.look,this.look,Ii,1-Math.exp(-t*12)),this.first=!1,this.shake=Math.max(0,this.shake-t*2.2);let p=this.shake*this.shake*14;this.camera.up.copy(h),this.camera.position.set((this.pos.x+(Math.random()-.5)*p)*.01,(this.pos.y+(Math.random()-.5)*p)*.01,(this.pos.z+(Math.random()-.5)*p)*.01),Qo.copy(this.pos).addScaledVector(this.look,1e3).multiplyScalar(.01),this.camera.lookAt(Qo)}updateReplay(t,e,n,i){let r=Math.sign(e.x||1);xi.set(r*2600+Math.sin(i*.3)*400,900,n*.55),this.first&&this.pos.copy(xi),this.pos.lerp(xi,1-Math.exp(-t*1.5)),Ii.copy(e).sub(this.pos).normalize(),this.first?this.look.copy(Ii):Nl(this.look,this.look,Ii,1-Math.exp(-t*6)),this.first=!1,this.camera.up.set(0,1,0),this.camera.position.copy(this.pos).multiplyScalar(.01),Qo.copy(this.pos).addScaledVector(this.look,1e3).multiplyScalar(.01),this.camera.lookAt(Qo)}};var NS=new E(0,1,0),Ul=new E,ea=new E,yg=new E,_g=new E,zn=(s,t)=>s+Math.random()*(t-s);function US(){let s=document.createElement("canvas");s.width=s.height=256;let t=s.getContext("2d");t.fillStyle="rgba(255,255,255,0.22)",t.fillRect(0,0,256,256);for(let n=0;n<80;n++){let i=Math.random()*256,r=6+Math.random()*26,o=t.createLinearGradient(i,0,i+r,0),a=.35+Math.random()*.6;o.addColorStop(0,"rgba(255,255,255,0)"),o.addColorStop(.5,`rgba(255,255,255,${a})`),o.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=o,t.save(),t.translate(i,128),t.transform(1,0,-.6,1,0,0),t.fillRect(-r/2,-160,r,320),t.restore()}let e=new Xe(s);return e.wrapS=e.wrapT=bn,e}var Au=class{constructor(t,e,n){this.group=t,this.effects=e,this.mode=n,this.time=0,this.cableGeo=new Fe(1,1,1,6,1,!0),this.cableGeo.translate(0,.5,0),this.cableMat=new ue({color:new mt(1.4,1.5,1.7)}),this.clawGeo=new zi(.22,.5,8),this.clawMat=new Ft({color:13620960,metalness:1,roughness:.25,emissive:3820128}),this.cables=new Map,this.swirl=US(),this.funnelGeos=[new Fe(9.5,1.4,21,40,1,!0),new Fe(7,1,19,40,1,!0),new Fe(4.5,.7,17,32,1,!0)].map(i=>(i.translate(0,i.parameters.height/2,0),i)),this.tornados=new Map,this.ice=new et(new Ka(Re.radius*.01*1.15,1),new Ft({color:13496063,emissive:4890584,emissiveIntensity:.6,roughness:.08,metalness:.1,transparent:!0,opacity:.55,flatShading:!0,depthWrite:!1})),this.ice.visible=!1,t.add(this.ice)}cableFor(t){let e=this.cables.get(t);if(!e){let n=new et(this.cableGeo,this.cableMat),i=new et(this.clawGeo,this.clawMat);n.frustumCulled=!1,this.group.add(n,i),e={cable:n,claw:i},this.cables.set(t,e)}return e}tornadoFor(t){let e=this.tornados.get(t);if(!e){let n=new se,i=this.funnelGeos.map((r,o)=>{let a=this.swirl.clone();a.needsUpdate=!0,a.repeat.set(3+o,1);let l=new et(r,new ue({map:a,color:o===2?15789284:13813942,transparent:!0,opacity:[.62,.7,.45][o],depthWrite:!1,side:Zt,blending:o===2?de:Ei}));return l.renderOrder=6,n.add(l),{m:l,tex:a,speed:[2.2,-3.1,4.5][o]}});this.group.add(n),e={g:n,parts:i,grow:0},this.tornados.set(t,e)}return e}update(t,e,n,i){this.time+=t;let r=this.mode,o=r.world.ball,a=this.effects,l=-1;if(r.name==="heatseeker"&&r.team>=0&&(l=r.team),r.name==="rumble"&&r.curve&&(l=r.curve.team),l>=0&&n.visible){let d=Se[l],f=Math.max(1,Math.round(t*90*a.mult));for(let m=0;m<f;m++)a.glow.emit(i.x*.01+zn(-.4,.4),i.y*.01+zn(-.4,.4),i.z*.01+zn(-.4,.4),0,zn(0,.5),0,zn(.3,.55),zn(.7,1.1),.15,[d.flame[0]*1.6,d.flame[1]*1.6,d.flame[2]*1.6,.6],[d.flameEnd[0],d.flameEnd[1],d.flameEnd[2],0],1.5,0);n.material.emissiveIntensity=3.2+Math.sin(this.time*12)*.6}else n.material.emissiveIntensity=2.4;let c=o.iceTimer>0;if(this.ice.visible=c&&n.visible,c&&(this.ice.position.copy(n.position),this.ice.rotation.y+=t*.4,Math.random()<t*20&&a.glow.emit(n.position.x+zn(-1,1),n.position.y+zn(-1,1),n.position.z+zn(-1,1),0,-.3,0,.6,.12,.02,[1.6,2,2.4,.8],[.6,.9,1.4,0],0,0)),r.name!=="rumble")return;let h=new Set,u=new Set;for(let d of e){let f=d.car,v=r.st(f).active;if(d.model.setPower(!!v&&v.type==="power",this.time),d.model.setSpikes(!!v&&v.type==="spikes"),!(!v||f.demolished)){if((v.type==="grapple"||v.type==="plunger")&&d.ipos){let p=this.cableFor(f);h.add(f),yg.set(0,0,1).applyQuaternion(d.iquat),_g.set(0,1,0).applyQuaternion(d.iquat),Ul.copy(d.ipos).addScaledVector(yg,55).addScaledVector(_g,28).multiplyScalar(.01);let g=v.phase==="pull"?i:v.hook;ea.copy(g).multiplyScalar(.01),v.phase==="pull"&&ea.addScaledVector(Ul.clone().sub(ea).normalize(),Re.radius*.01*.9);let x=Ul.distanceTo(ea);p.cable.position.copy(Ul),p.cable.quaternion.setFromUnitVectors(NS,ea.clone().sub(Ul).normalize()),p.cable.scale.set(.05,Math.max(.01,x),.05),p.claw.position.copy(ea),p.claw.quaternion.copy(p.cable.quaternion),p.cable.visible=p.claw.visible=!0}if(v.type==="tornado"&&d.ipos){let p=this.tornadoFor(f);u.add(f);let g=Math.min(1,v.t/.5)*Math.min(1,(v.dur-v.t)/.6);p.grow=g,p.g.visible=!0,p.g.position.set(d.ipos.x*.01,0,d.ipos.z*.01),p.g.scale.set(.3+.7*g,g,.3+.7*g);for(let _ of p.parts)_.m.rotation.y+=_.speed*t,_.tex.offset.y-=t*.6;let x=Math.round(t*70*a.mult);for(let _=0;_<x;_++){let y=Math.random()*Math.PI*2,b=zn(1,6),S=p.g.position.x+Math.cos(y)*b,T=p.g.position.z+Math.sin(y)*b;a.smoke.emit(S,zn(0,1.5),T,-Math.sin(y)*9,zn(3,9),Math.cos(y)*9,zn(.8,1.6),zn(.8,1.4),zn(2.4,4),[.45,.4,.33,.45],[.3,.28,.25,0],.8,-1,zn(-2,2))}}}}for(let[d,f]of this.cables)h.has(d)||(f.cable.visible=f.claw.visible=!1);for(let[d,f]of this.tornados)u.has(d)||(f.g.visible=!1)}};var Cu=new E,Pu=new E,FS=new E,ep=new E,Fl=class{constructor(t,e=2400,n=.02){this.max=e,this.height=n,this.head=0,this.pos=new Float32Array(e*4*3),this.col=new Float32Array(e*4*4);let i=new Uint32Array(e*6);for(let o=0;o<e;o++){let a=o*4;i.set([a,a+1,a+2,a+2,a+1,a+3],o*6)}let r=new ae;this.posAttr=new ce(this.pos,3).setUsage(ei),this.colAttr=new ce(this.col,4).setUsage(ei),r.setAttribute("position",this.posAttr),r.setAttribute("color",this.colAttr),r.setIndex(new ce(i,1)),r.setDrawRange(0,0),this.geo=r,this.mesh=new et(r,new ue({vertexColors:!0,transparent:!0,depthWrite:!1,side:Zt,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2})),this.mesh.frustumCulled=!1,this.mesh.renderOrder=1,t.add(this.mesh),this.prev=new Map,this.used=0,this.dirty=!1}clear(){this.used=0,this.head=0,this.prev.clear(),this.geo.setDrawRange(0,0)}static skid(t){if(!t.onGround||t.demolished||t.groundNormal.y<.95||t.pos.y>45)return 0;t.forward(Cu),t.left(Pu);let e=t.vel.length(),n=Math.abs(t.vel.dot(Pu)),i=t.vel.dot(Cu),r=t.input,o=0;return r.powerslide&&e>250&&(o=Math.max(o,.9)),n>140&&(o=Math.max(o,Math.min(1,(n-140)/400))),(r.throttle>.5||t.boosting)&&Math.abs(i)<650&&(o=Math.max(o,.7)),r.throttle*i<0&&Math.abs(i)>450&&(o=Math.max(o,.8)),o}update(t,e,n,i){Cu.set(0,0,1).applyQuaternion(n),Pu.set(1,0,0).applyQuaternion(n),FS.set(0,1,0).applyQuaternion(n);for(let r=0;r<4;r++){let o=t.id*4+r;if(i<=0||Ut.wheels[r].front&&i<.75){this.prev.delete(o);continue}let a=Ut.wheels[r];ep.copy(e).addScaledVector(Pu,a.x+Math.sign(a.x)*7).addScaledVector(Cu,a.z);let l=ep.x*.01,c=ep.z*.01,h=this.prev.get(o);if(!h){this.prev.set(o,{x:l,z:c});continue}let u=l-h.x,d=c-h.z,f=Math.hypot(u,d);if(!(f<.08)){if(f>4){this.prev.set(o,{x:l,z:c});continue}this.addQuad(h.x,h.z,l,c,u/f,d/f,.72*i),h.x=l,h.z=c}}}addQuad(t,e,n,i,r,o,a){let c=-o*.07,h=r*.07,u=this.height,d=this.head,f=d*12,m=this.pos;m[f]=t+c,m[f+1]=u,m[f+2]=e+h,m[f+3]=t-c,m[f+4]=u,m[f+5]=e-h,m[f+6]=n+c,m[f+7]=u,m[f+8]=i+h,m[f+9]=n-c,m[f+10]=u,m[f+11]=i-h;let v=d*16;for(let p=0;p<4;p++)this.col.set([.045,.035,.018,a],v+p*4);this.head=(this.head+1)%this.max,this.used=Math.min(this.max,this.used+1),this.dirty=!0}flush(){this.dirty&&(this.dirty=!1,this.posAttr.needsUpdate=!0,this.colAttr.needsUpdate=!0,this.geo.setDrawRange(0,this.used*6))}};var lr=`
  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
  }
  float vnoise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash13(i), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
                   mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
               mix(mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
                   mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
    return s;
  }
  float fbm3(vec3 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.07 + 11.3; a *= 0.5; }
    return s / 0.875;
  }
`,Lu=`
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`,ip=1.3,Sg=7.5;function BS(s){return new te({uniforms:s,transparent:!0,depthWrite:!1,blending:de,side:Zt,vertexShader:`
      uniform float uBurst;
      varying vec3 vL; varying vec3 vW; varying vec3 vVel;
      void main() {
        vec3 p = position;
        vL = p;
        p.xz *= 1.0 + uBurst * (3.0 + length(p.xz) * 0.4);
        vec4 w = modelMatrix * vec4(p, 1.0);
        vW = w.xyz;
        vVel = mat3(modelMatrix) * vec3(-position.z, 0.0, position.x);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      uniform float uTime, uI, uHot, uBurst;
      varying vec3 vL; varying vec3 vW; varying vec3 vVel;
      ${lr}
      void main() {
        float r = length(vL.xz);
        float t = clamp((r - ${ip.toFixed(2)}) / (${(Sg-ip).toFixed(2)}), 0.0, 1.0);
        float a = atan(vL.z, vL.x);
        // differential rotation: the inner disk laps the outer disk, shearing the gas into streaks
        float ang = a - uTime * 2.2 / pow(r, 1.5);
        vec2 q = vec2(cos(ang), sin(ang)) * r;
        float n = fbm(vec3(q * 1.5, r * 1.3));
        float streak = fbm3(vec3(q * 4.5, r * 9.0));
        float dens = smoothstep(0.0, 0.05, t) * pow(1.0 - t, 1.7) * (0.3 + 0.95 * n) * (0.65 + 0.6 * streak);
        vec3 col = mix(vec3(1.0, 0.94, 0.84), vec3(1.0, 0.56, 0.18), smoothstep(0.0, 0.3, t));
        col = mix(col, vec3(0.7, 0.14, 0.03), smoothstep(0.3, 1.0, t));
        col = mix(col, vec3(1.0, 0.96, 0.92), uHot * 0.8);
        // relativistic beaming: the side of the disk spinning toward us is brighter
        float dop = dot(normalize(vVel), normalize(cameraPosition - vW));
        float beam = pow(1.0 + 0.4 * dop, 2.6);
        vec3 c = col * dens * beam * 0.85 * uI * (1.0 + uHot * 1.5) * (1.0 - smoothstep(0.2, 1.0, uBurst));
        gl_FragColor = vec4(c, 1.0);
        ${Lu}
      }`})}function OS(s){return new te({uniforms:s,transparent:!0,depthWrite:!1,blending:de,vertexShader:`
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`
      uniform float uTime, uI, uHot, uSide, uBurst;
      varying vec2 vP;
      ${lr}
      void main() {
        float r = length(vP);
        if (r < 0.97) discard;
        float th = atan(vP.y, vP.x);
        float ring = exp(-pow((r - 1.035) / 0.016, 2.0));
        float band = smoothstep(1.03, 1.1, r) * exp(-(r - 1.1) * 2.4);
        // the far half of the disk is bent over the top of the shadow (and thinly under it)
        float side = vP.y * uSide / r;
        float arc = mix(0.18, 1.0, smoothstep(-0.35, 0.85, side));
        float ang = th - uTime * 0.3;
        float n = fbm3(vec3(cos(ang) * r * 3.0, sin(ang) * r * 3.0, r * 5.0));
        vec3 col = mix(vec3(1.0, 0.9, 0.74), vec3(1.0, 0.48, 0.14), smoothstep(1.05, 1.9, r));
        col = mix(col, vec3(1.0), uHot * 0.7);
        vec3 c = col * band * arc * (0.3 + 1.1 * n) * 0.85 + vec3(1.0, 0.92, 0.82) * ring * 1.3;
        c *= uI * (1.0 + uHot) * (1.0 - smoothstep(0.0, 0.4, uBurst)) * (1.0 - smoothstep(2.5, 3.0, r));
        gl_FragColor = vec4(c, 1.0);
        ${Lu}
      }`})}function HS(s){return new te({uniforms:s,transparent:!0,depthWrite:!1,blending:de,vertexShader:`
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`
      uniform float uI, uHot, uGlow;
      varying vec2 vP;
      void main() {
        float r = length(vP);
        float g = exp(-r * 0.6) * 0.16 + exp(-r * 0.2) * 0.025;
        g *= smoothstep(0.95, 1.4, r) * (1.0 - smoothstep(10.0, 15.0, r));
        vec3 col = mix(vec3(1.0, 0.5, 0.18), vec3(1.0, 0.9, 0.8), uHot);
        gl_FragColor = vec4(col * g * uI * uGlow * (1.0 + uHot * 2.0), 1.0);
        ${Lu}
      }`})}function kS(s){return new te({uniforms:s,transparent:!0,depthWrite:!1,blending:de,side:Zt,vertexShader:`
      varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main() {
        vUv = uv;
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      uniform float uTime, uJet;
      varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      ${lr}
      void main() {
        float along = 1.0 - vUv.y; // 0 at the hole, 1 at the tip
        float n = fbm3(vec3(vUv.x * 12.0, along * 6.0 - uTime * 9.0, 1.0));
        float facing = abs(dot(normalize(vN), normalize(cameraPosition - vW)));
        float a = pow(facing, 1.5) * (1.0 - along) * (0.4 + n) * smoothstep(0.0, 0.05, along);
        vec3 col = mix(vec3(0.75, 0.85, 1.0), vec3(0.4, 0.55, 1.0), along);
        gl_FragColor = vec4(col * a * 3.0 * uJet, 1.0);
        ${Lu}
      }`})}var Iu=new le,np=new E,Mg=new E,na=new E,kr=new E,bg=new E(0,1,0),ia=class{constructor({jets:t=!1,segments:e=1}={}){this.group=new se,this.u={uTime:{value:0},uI:{value:1},uHot:{value:0},uSide:{value:1},uBurst:{value:0},uGlow:{value:1},uJet:{value:0}},this.horizon=new et(new yn(1,64,32),new ue({color:0,fog:!1})),this.horizon.renderOrder=1;let n=new Rr(ip,Sg,Math.round(192*e),20);if(n.rotateX(-Math.PI/2),this.disk=new et(n,BS(this.u)),this.disk.renderOrder=6,this.billboard=new se,this.halo=new et(new Be(6,6),OS(this.u)),this.halo.renderOrder=5,this.glow=new et(new Be(30,30),HS(this.u)),this.glow.renderOrder=4,this.billboard.add(this.glow,this.halo),this.group.add(this.horizon,this.disk,this.billboard),t){let i=new Fe(3.2,.12,70,32,1,!0);i.translate(0,35.6,0);let r=kS(this.u),o=new et(i,r),a=new et(i,r);a.rotation.x=Math.PI,this.jets=new se,this.jets.add(o,a),this.jets.visible=!1;for(let l of[o,a])l.renderOrder=7;this.group.add(this.jets)}this.group.traverse(i=>{i.frustumCulled=!1})}update(t,e){this.u.uTime.value+=t,this.group.updateMatrixWorld(),Iu.copy(this.group.matrixWorld).invert(),np.copy(e.position).applyMatrix4(Iu),kr.copy(np).normalize(),na.copy(bg).addScaledVector(kr,-bg.dot(kr)),na.lengthSq()<1e-6&&na.set(0,0,1).addScaledVector(kr,-kr.z),na.normalize(),Mg.crossVectors(na,kr),Iu.makeBasis(Mg,na,kr),this.billboard.quaternion.setFromRotationMatrix(Iu),this.u.uSide.value=np.y>=0?1:-1,this.jets&&(this.jets.visible=this.u.uJet.value>.001)}dispose(){this.group.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&t.material.dispose()})}};var xs=20,zr=`
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`,rp=`
  vec2 eqUv(vec3 d) { return vec2(atan(d.x, d.z) / 6.2831853 + 0.5, asin(clamp(d.y, -1.0, 1.0)) / 3.1415927 + 0.5); }
  vec3 eqDir(vec2 uv) {
    float lon = (uv.x - 0.5) * 6.2831853, lat = (uv.y - 0.5) * 3.1415927;
    return vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon));
  }
`,cr=s=>Math.min(1,Math.max(0,s)),jn=(s,t,e)=>{let n=cr((e-s)/(t-s));return n*n*(3-2*n)},sp=s=>s<.5?4*s*s*s:1-Math.pow(-2*s+2,3)/2;function Eg(s,t,e,n,i=On){let r=new qe(t,e,{type:i,depthBuffer:!1,generateMipmaps:!1,minFilter:cn,magFilter:cn});r.texture.wrapS=bn;let o=new te({depthTest:!1,depthWrite:!1,vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`varying vec2 vUv;
${lr}
${rp}
void main() { vec3 dir = eqDir(vUv);
${n}
}`}),a=new et(new Be(2,2),o);a.frustumCulled=!1;let l=new bi;l.add(a);let c=new as(-1,1,1,-1,0,1),h=s.getRenderTarget();return s.setRenderTarget(r),s.render(l,c),s.setRenderTarget(h),o.dispose(),a.geometry.dispose(),r}var zS=`
  float h = fbm(dir * 1.7 + vec3(3.7, 1.1, 0.0)) * 0.72 + fbm(dir * 6.5 + 7.0) * 0.28;
  float dry = fbm(dir * 3.2 + 11.0);
  float cl = fbm(dir * vec3(2.2, 4.6, 2.2) + 23.0) * 0.75 + fbm(dir * 11.0 + 5.0) * 0.25;
  cl = smoothstep(0.47, 0.7, cl);
  float city = step(0.76, vnoise(dir * 190.0)) * smoothstep(0.35, 0.65, vnoise(dir * 22.0));
  gl_FragColor = vec4(h, dry, cl, city);
`,VS=`
  vec3 gN = normalize(vec3(0.25, 0.92, 0.3));
  vec3 gC = normalize(vec3(-0.8, 0.12, 0.55));
  float b = dot(dir, gN);
  float band = exp(-b * b * 14.0);
  float core = pow(max(dot(dir, gC), 0.0), 5.0);
  float n = fbm(dir * 3.0);
  float n2 = fbm(dir * 9.0 + 5.0);
  float dust = smoothstep(0.45, 0.72, fbm(dir * 7.0 + 2.0)) * exp(-b * b * 70.0);
  vec3 mw = vec3(0.5, 0.58, 0.85) * band * (0.25 + n * n2 * 1.6) * 0.5 + vec3(1.0, 0.78, 0.5) * core * band * (0.6 + n) * 1.3;
  mw *= 1.0 - dust * 0.9;
  vec3 neb = vec3(0.5, 0.12, 0.45) * smoothstep(0.58, 0.85, fbm(dir * 1.8 + 9.0)) * 0.22
           + vec3(0.08, 0.28, 0.55) * smoothstep(0.6, 0.88, fbm(dir * 2.4 + 3.0)) * 0.2;
  float sd = pow(hash13(floor(dir * 900.0)), 400.0) * (0.4 + band * 2.0);
  vec3 col = mw + neb + vec3(sd) + vec3(0.002, 0.003, 0.006);
  gl_FragColor = vec4(col, 1.0);
`;function GS(s){return new te({side:fn,depthWrite:!1,uniforms:{uTex:{value:s},uBH:{value:new E},uBHR:{value:xs},uWarp:{value:0},uFlash:{value:0},uFlashDir:{value:new E(0,0,1)},uSun:{value:new E(1,0,0)}},vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = (modelMatrix * vec4(position, 0.0)).xyz;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,fragmentShader:`
      uniform sampler2D uTex; uniform vec3 uBH, uFlashDir, uSun; uniform float uBHR, uWarp, uFlash;
      varying vec3 vDir;
      ${rp}
      void main() {
        vec3 d = normalize(vDir);
        // gravitational lensing: bend the view ray around the black hole (point-lens model)
        vec3 toB = uBH - cameraPosition;
        float dist = length(toB);
        vec3 b = toB / dist;
        float thH = asin(min(uBHR / dist, 0.999));
        float thE = thH * 1.55;
        float c = clamp(dot(d, b), -1.0, 1.0);
        float th = acos(c);
        vec3 sdir = d;
        if (th > 1e-4 && th < 1.4) {
          float beta = th - thE * thE / th;
          vec3 perp = normalize(d - b * c);
          float ab = min(abs(beta), 3.0);
          sdir = b * cos(ab) + perp * sign(beta) * sin(ab);
        }
        vec3 col;
        if (uWarp > 0.0) {
          // stars streak away from the explosion
          col = vec3(0.0);
          for (int i = 0; i < 6; i++) {
            float k = float(i) / 5.0 * uWarp * 0.5;
            col += texture2D(uTex, eqUv(normalize(mix(sdir, uFlashDir, k)))).rgb;
          }
          col = col / 6.0 * (1.0 + uWarp * 0.8);
        } else {
          col = texture2D(uTex, eqUv(sdir)).rgb;
        }
        float sd = max(dot(d, uSun), 0.0);
        col += vec3(1.0, 0.95, 0.85) * (pow(sd, 3000.0) * 40.0 + pow(sd, 200.0) * 0.6 + pow(sd, 12.0) * 0.04);
        float fl = max(dot(d, uFlashDir), 0.0);
        col += uFlash * vec3(1.0, 0.85, 0.7) * (pow(fl, 60.0) * 3.0 + pow(fl, 10.0) * 0.12) + uFlash * uFlash * uFlash * vec3(0.9, 0.8, 1.0) * 0.6;
        gl_FragColor = vec4(col, 1.0);
        ${zr}
      }`})}var Cg=`
  uniform vec3 uAxis; uniform float uStretch;
  // tidal stretching toward the black hole (spaghettification)
  vec3 deform(vec3 p) {
    float x = dot(p, uAxis);
    vec3 perp = p - uAxis * x;
    float k = uStretch;
    float nx = x * (1.0 + k) + max(x, 0.0) * max(x, 0.0) * k * 1.3;
    return uAxis * nx + perp / sqrt(1.0 + k);
  }
  vec3 deformNormal(vec3 n0, vec3 p) {
    vec3 t1 = normalize(cross(n0, abs(n0.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
    vec3 t2 = cross(n0, t1);
    vec3 pa = deform(normalize(n0 + t1 * 0.01));
    vec3 pb = deform(normalize(n0 + t2 * 0.01));
    return normalize(cross(pa - p, pb - p));
  }
`;function WS(s,t){return new te({uniforms:{...t,uMap:{value:s},uSun:{value:new E(1,0,0)},uBH:{value:new E},uBHLight:{value:.5},uMelt:{value:0},uCloudRot:{value:0},uTime:{value:0}},vertexShader:`
      ${Cg}
      varying vec3 vN0; varying vec3 vNW; varying vec3 vW;
      void main() {
        vN0 = normalize(position);
        vec3 p = deform(position);
        vNW = normalize(mat3(modelMatrix) * deformNormal(vN0, p));
        vec4 w = modelMatrix * vec4(p, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      uniform sampler2D uMap; uniform vec3 uSun, uBH; uniform float uBHLight, uMelt, uCloudRot, uTime;
      varying vec3 vN0; varying vec3 vNW; varying vec3 vW;
      ${lr}
      ${rp}
      void main() {
        vec4 m = texture2D(uMap, eqUv(vN0));
        float ca = cos(uCloudRot), sa = sin(uCloudRot);
        vec3 cd = vec3(ca * vN0.x + sa * vN0.z, vN0.y, -sa * vN0.x + ca * vN0.z);
        float cl = texture2D(uMap, eqUv(cd)).b;
        float h = m.r;
        float land = smoothstep(0.522, 0.535, h);
        float lat = abs(vN0.y);
        vec3 ocean = mix(vec3(0.003, 0.012, 0.05), vec3(0.012, 0.06, 0.13), smoothstep(0.42, 0.522, h));
        vec3 green = vec3(0.06, 0.13, 0.035);
        vec3 desert = vec3(0.42, 0.32, 0.17);
        vec3 rock = vec3(0.24, 0.2, 0.16);
        vec3 landCol = mix(green, desert, smoothstep(0.47, 0.62, m.g) * (1.0 - smoothstep(0.45, 0.75, lat)));
        landCol = mix(landCol, rock, smoothstep(0.62, 0.7, h));
        vec3 albedo = mix(ocean, landCol, land);
        float ice = smoothstep(0.8, 0.88, lat + (h - 0.5) * 0.35);
        albedo = mix(albedo, vec3(0.85, 0.9, 0.95), ice);
        vec3 N = normalize(vNW);
        vec3 V = normalize(cameraPosition - vW);
        float sunD = dot(N, uSun);
        float day = smoothstep(-0.1, 0.25, sunD);
        vec3 col = albedo * max(sunD, 0.0) * 1.15;
        vec3 H = normalize(uSun + V);
        col += (1.0 - land) * (1.0 - ice) * pow(max(dot(N, H), 0.0), 120.0) * 0.45 * day * (1.0 - cl);
        col = mix(col, vec3(0.92) * max(sunD, 0.0) * 0.85, cl * 0.85);
        // orange light from the accretion disk
        vec3 Lb = normalize(uBH - vW);
        float bl = max(dot(N, Lb), 0.0);
        col += mix(albedo * 1.5, vec3(0.7), cl * 0.7) * vec3(1.0, 0.5, 0.18) * bl * uBHLight;
        // cities on the night side
        col += vec3(1.0, 0.62, 0.28) * m.a * land * (1.0 - ice) * (1.0 - day) * (1.0 - cl) * 1.4;
        // atmosphere
        float fr = pow(1.0 - max(dot(N, V), 0.0), 3.0);
        col += vec3(0.2, 0.45, 1.0) * fr * (0.1 + day * 0.6);
        // tidal forces crack the crust open
        float crack = 1.0 - abs(fbm3(vN0 * 7.0 + uTime * 0.15) * 2.0 - 1.0);
        crack = pow(crack, 10.0);
        col = mix(col, vec3(2.4, 0.75, 0.15), clamp(crack * uMelt * 3.0, 0.0, 1.0));
        col += vec3(1.2, 0.35, 0.08) * uMelt * uMelt * 0.5;
        gl_FragColor = vec4(col, 1.0);
        ${zr}
      }`})}function qS(s){return new te({uniforms:{...s,uSun:{value:new E(1,0,0)},uFade:{value:1}},transparent:!0,depthWrite:!1,blending:de,vertexShader:`
      ${Cg}
      varying vec3 vNW; varying vec3 vW;
      void main() {
        vec3 n0 = normalize(position);
        vec3 p = deform(position);
        vNW = normalize(mat3(modelMatrix) * deformNormal(n0, p));
        vec4 w = modelMatrix * vec4(p, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      uniform vec3 uSun; uniform float uFade;
      varying vec3 vNW; varying vec3 vW;
      void main() {
        vec3 N = normalize(vNW);
        vec3 V = normalize(cameraPosition - vW);
        float rim = pow(1.0 - max(dot(N, V), 0.0), 4.0);
        float lit = smoothstep(-0.35, 0.4, dot(N, uSun));
        gl_FragColor = vec4(vec3(0.3, 0.6, 1.0) * rim * (0.1 + lit * 1.1) * uFade, 1.0);
        ${zr}
      }`})}function wg(s=!0){return new te({transparent:!0,depthWrite:!1,blending:s?de:Ei,uniforms:{uScale:{value:1},uAtten:{value:0},uI:{value:1}},vertexShader:`
      attribute float aSize; attribute vec3 aCol;
      uniform float uScale, uAtten;
      varying vec3 vCol;
      void main() {
        vCol = aCol;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float s = uAtten > 0.5 ? aSize * uScale / -mv.z : aSize * uScale;
        gl_PointSize = clamp(s, 0.0, 64.0);
        gl_Position = projectionMatrix * mv;
      }`,fragmentShader:`
      uniform float uI;
      varying vec3 vCol;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = exp(-r * r * 4.0) * (1.0 - smoothstep(0.8, 1.0, r));
        gl_FragColor = vec4(vCol * a * uI, 1.0);
        ${zr}
      }`})}function XS(s){let t=document.createElement("canvas");t.width=t.height=256;let e=t.getContext("2d"),n=s*9301+49297,i=()=>(n=(n*9301+49297)%233280,n/233280),r=e.createRadialGradient(128,128,0,128,128,60);r.addColorStop(0,"rgba(255,240,210,1)"),r.addColorStop(.3,"rgba(255,200,150,0.5)"),r.addColorStop(1,"rgba(120,120,200,0)"),e.fillStyle=r,e.fillRect(0,0,256,256);let o=2+Math.floor(i()*2);for(let l=0;l<2600;l++){let c=l%o,h=Math.pow(i(),.7),u=h*7+c/o*Math.PI*2+(i()-.5)*.6,d=8+h*110+(i()-.5)*14*h,f=128+Math.cos(u)*d,m=128+Math.sin(u)*d,v=(1-h)*.5+.15;e.fillStyle=i()<.15?`rgba(255,170,200,${v})`:`rgba(170,200,255,${v})`,e.fillRect(f,m,1.6,1.6)}let a=new Xe(t);return a.colorSpace=Te,a}function YS(){return new te({uniforms:{uTime:{value:0},uI:{value:1}},transparent:!0,depthWrite:!1,blending:de,side:Zt,vertexShader:`
      varying vec3 vL; varying vec3 vNW; varying vec3 vW;
      void main() {
        vL = position;
        vNW = normalize(mat3(modelMatrix) * normal);
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      uniform float uTime, uI;
      varying vec3 vL; varying vec3 vNW; varying vec3 vW;
      ${lr}
      void main() {
        float f = abs(dot(normalize(vNW), normalize(cameraPosition - vW)));
        float n = fbm3(vL * 4.0 + vec3(0.0, uTime * 1.5, 0.0));
        float edge = pow(1.0 - f, 2.0);
        vec3 col = mix(vec3(1.0, 0.72, 0.4), vec3(1.0, 0.3, 0.08), edge);
        col = mix(col, vec3(0.65, 0.35, 1.0), smoothstep(0.5, 0.8, n) * 0.7);
        gl_FragColor = vec4(col * (0.2 + edge * 1.3) * (0.35 + n) * uI, 1.0);
        ${zr}
      }`})}function ZS(){return new te({uniforms:{uI:{value:1}},transparent:!0,depthWrite:!1,blending:de,side:Zt,vertexShader:"varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uI;
      varying vec2 vP;
      void main() {
        float r = length(vP);
        float a = smoothstep(0.8, 0.98, r) * (1.0 - smoothstep(0.98, 1.0, r));
        gl_FragColor = vec4(vec3(0.75, 0.85, 1.0) * a * a * 1.4 * uI, 1.0);
        ${zr}
      }`})}function $S(){return new te({uniforms:{uI:{value:0},uTime:{value:0}},transparent:!0,depthWrite:!1,depthTest:!1,blending:de,vertexShader:"varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uI, uTime;
      varying vec2 vP;
      ${lr}
      void main() {
        float r = length(vP);
        float a = atan(vP.y, vP.x);
        float rays = pow(max(fbm3(vec3(cos(a) * 7.0, sin(a) * 7.0, uTime * 0.5)) - 0.45, 0.0) / 0.55, 2.5) * 4.0;
        float fall = exp(-r * 3.5) * (1.0 - smoothstep(0.4, 0.9, r));
        vec3 col = mix(vec3(1.0, 0.85, 0.6), vec3(0.75, 0.6, 1.0), smoothstep(0.05, 0.4, r));
        gl_FragColor = vec4(col * (rays * fall + exp(-r * 9.0) * 1.5) * uI, 1.0);
        ${zr}
      }`})}var Ne=new E,Cn=new E,Tg=new re,Rg=new re,sa=new E(0,1,0);function Ag(s,t,e){let n=pe.degToRad(s),i=pe.degToRad(t);return new E(Math.cos(i)*Math.sin(n)*e,Math.sin(i)*e,Math.cos(i)*Math.cos(n)*e)}var Du=class{constructor(t,e,n){this.fx=n,this.quality=e;let i=e==="low";this.scene=new bi,this.camera=new Qe(50,1,.004,4e4),this.t=0,this.events=new Set;let r=e==="high";this.skyRT=Eg(t,r?4096:2048,r?2048:1024,VS,tn),this.earthRT=Eg(t,i?1024:2048,i?512:1024,zS),this.skyGroup=new se,this.sky=new et(new yn(9e3,64,32),GS(this.skyRT.texture)),this.sky.renderOrder=-10,this.skyGroup.add(this.sky),this.scene.add(this.skyGroup);{let d=i?2500:6e3,f=new Float32Array(d*3),m=new Float32Array(d*3),v=new Float32Array(d),p=new E(.25,.92,.3).normalize();for(let x=0;x<d;x++){if(Ne.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1),Ne.lengthSq()>1||Ne.lengthSq()<.01){x--;continue}Ne.normalize(),x%3===0&&Ne.addScaledVector(p,-Ne.dot(p)*.9).normalize(),Ne.multiplyScalar(8e3),f.set([Ne.x,Ne.y,Ne.z],x*3);let _=Math.random(),y=_<.2?[1,.75,.55]:_<.7?[1,.96,.92]:[.7,.82,1],b=.4+Math.pow(Math.random(),4)*2.4;m.set([y[0]*b,y[1]*b,y[2]*b],x*3),v[x]=1.2+Math.pow(Math.random(),6)*3.2}let g=new ae;g.setAttribute("position",new ce(f,3)),g.setAttribute("aCol",new ce(m,3)),g.setAttribute("aSize",new ce(v,1)),this.starMat=wg(),this.starMat.uniforms.uScale.value=Math.min(window.devicePixelRatio||1,2),this.stars=new Mo(g,this.starMat),this.stars.renderOrder=-9,this.stars.frustumCulled=!1,this.skyGroup.add(this.stars)}this.galaxies=[];for(let d=0;d<9;d++){let f=new os({map:XS(d+3),blending:de,depthWrite:!1,transparent:!0,opacity:.55,rotation:Math.random()*6.28}),m=new As(f);Ne.set(Math.random()*2-1,(Math.random()*2-1)*.6,Math.random()*2-1).normalize(),m.position.copy(Ne).multiplyScalar(5200+Math.random()*1500);let v=260+Math.random()*380;m.scale.set(v,v*(.35+Math.random()*.65),1),m.userData={base:m.position.clone(),s:m.scale.clone()},m.renderOrder=-8,this.scene.add(m),this.galaxies.push(m)}this.bh=new ia({jets:!0,segments:i?.6:1}),this.bh.group.scale.setScalar(xs),this.bh.group.rotation.set(-.04,0,.07),this.scene.add(this.bh.group),this.wideCam=Ag(38,8,430);let o=Ne.copy(this.wideCam).negate().normalize(),a=new E().crossVectors(o,sa).normalize(),l=new E().crossVectors(a,o).normalize();this.wideLook=new E().addScaledVector(a,40).addScaledVector(l,10),this.earth0=this.wideCam.clone().addScaledVector(o.clone().addScaledVector(a,-.34).addScaledVector(l,-.19).normalize(),60);let c={uAxis:{value:new E(1,0,0)},uStretch:{value:0}};this.earthShared=c,this.earth=new se,this.earthMat=WS(this.earthRT.texture,c),this.earthMesh=new et(new yn(1,i?96:160,i?64:120),this.earthMat),this.atmoMat=qS(c),this.atmo=new et(new yn(1.045,96,64),this.atmoMat),this.atmo.renderOrder=2,this.earth.add(this.earthMesh,this.atmo),this.earth.rotation.z=.41,this.earth.position.copy(this.earth0),this.scene.add(this.earth),this.earthAlive=!0;let h=this.earth0.clone().negate().normalize(),u=new E().crossVectors(h,sa).normalize();this.startDir=new E().addScaledVector(h,-.35).addScaledVector(u,-1).addScaledVector(sa,.32).normalize(),this.sunDir=new E().addScaledVector(this.startDir,1).addScaledVector(h,.45).addScaledVector(sa,.25).normalize(),this.earthMat.uniforms.uSun.value.copy(this.sunDir),this.atmoMat.uniforms.uSun.value.copy(this.sunDir),this.sky.material.uniforms.uSun.value.copy(this.sunDir);{let d=i?1400:3600;this.streamN=d;let f=new ae;this.sPos=new Float32Array(d*3),this.sCol=new Float32Array(d*3),this.sSize=new Float32Array(d),f.setAttribute("position",new ce(this.sPos,3).setUsage(ei)),f.setAttribute("aCol",new ce(this.sCol,3).setUsage(ei)),f.setAttribute("aSize",new ce(this.sSize,1).setUsage(ei)),this.streamGeo=f,this.streamMat=wg(),this.streamMat.uniforms.uAtten.value=1,this.stream=new Mo(f,this.streamMat),this.stream.frustumCulled=!1,this.stream.renderOrder=8,this.scene.add(this.stream),this.parts=[];for(let m=0;m<d;m++)this.parts.push({alive:!1,born:0,life:1,off:new E,spin:0,hot:!1,size:1,src:new E});this.emitAcc=0}this.core=new et(new yn(1,64,32),YS()),this.core.visible=!1,this.core.renderOrder=9,this.shock=new et(new Rr(.5,1,160,1),ZS()),this.shock.rotation.x=-Math.PI/2,this.shock.visible=!1,this.shock.renderOrder=9,this.rays=new et(new Be(2,2),$S()),this.rays.visible=!1,this.rays.renderOrder=10,this.scene.add(this.core,this.shock,this.rays);for(let d of[this.core,this.shock,this.rays])d.frustumCulled=!1;this.camPos=new E,this.camLook=new E,this.shakeAmt=0,this.fov=55,this.duration=19.8,this.update(0)}earthAt(t,e){let n=cr((t-6)/6.2),i=.75*Math.pow(n,2.2)+.25*Math.pow(n,12),r=this.earth0.length(),o=r*Math.pow(xs*.25/r,i),a=1-o/r,c=Math.atan2(this.earth0.x,this.earth0.z)+1.25*Math.pow(n,2.6),h=this.earth0.y*(1-a),u=Math.sqrt(Math.max(0,o*o-h*h));return e.set(Math.sin(c)*u,h,Math.cos(c)*u)}emitStream(t,e,n){this.emitAcc+=n*t;let i=this.earth.position;for(let r of this.parts){if(this.emitAcc<1)break;r.alive||(this.emitAcc-=1,r.alive=!0,r.born=e,r.life=2.4+Math.random()*2.4,Ne.copy(i).negate().normalize(),Cn.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize(),Cn.dot(Ne)<0&&Cn.addScaledVector(Ne,-2*Cn.dot(Ne)),Cn.lerp(Ne,.35).normalize(),r.off.copy(Cn).multiplyScalar(1.02+this.earthShared.uStretch.value*.8*Math.random()),r.src.copy(i),r.spin=.9+Math.random()*1.2,r.hot=Math.random()<.55,r.size=r.hot?.12+Math.random()*.25:.08+Math.random()*.15)}this.emitAcc>1&&(this.emitAcc=1)}updateStream(t){let e=this.sPos,n=this.sCol,i=this.sSize;for(let o=0;o<this.streamN;o++){let a=this.parts[o];if(!a.alive){i[o]=0;continue}let l=(t-a.born)/a.life;if(l>=1){a.alive=!1,i[o]=0;continue}Ne.copy(this.earthAlive?this.earth.position:a.src).add(a.off);let c=Ne.length(),h=Math.pow(l,1.5),u=c*(1-h)+xs*.92*h;Cn.copy(Ne).divideScalar(c);let d=a.spin*Math.pow(l,2.2)*2.2,f=Math.cos(d),m=Math.sin(d),v=Cn.x*f+Cn.z*m,p=-Cn.x*m+Cn.z*f,g=Cn.y*(1-h),x=Math.hypot(v,g,p);e[o*3]=v/x*u,e[o*3+1]=g/x*u,e[o*3+2]=p/x*u;let _=Math.min(1,l*1.6),y=Math.min(1,(1-l)*6)*Math.min(1,l*12);a.hot?(n[o*3]=(1.6+_)*y,n[o*3+1]=(.55+_*.9)*y,n[o*3+2]=(.15+_*.8)*y):(n[o*3]=(.35+_*1.2)*y,n[o*3+1]=(.3+_*.7)*y,n[o*3+2]=(.28+_*.4)*y),i[o]=a.size*(1+l*6)*(.4+.6*(u/c))}let r=this.streamGeo;r.attributes.position.needsUpdate=!0,r.attributes.aCol.needsUpdate=!0,r.attributes.aSize.needsUpdate=!0}once(t){return this.events.has(t)?!1:(this.events.add(t),!0)}update(t){let e=this.t;this.t+=t;let n=this.fx,i=this.camera,r=this.bh.u;if(this.earthAlive){this.earthAt(e,this.earth.position),this.earth.rotateY(t*.08);let f=this.earth.position.length();Ne.copy(this.earth.position).negate().normalize(),this.earth.getWorldQuaternion(Tg),Rg.copy(Tg).invert(),this.earthShared.uAxis.value.copy(Ne).applyQuaternion(Rg);let m=Math.pow(cr((95-f)/75),2)*7;this.earthShared.uStretch.value=m,this.earthMat.uniforms.uMelt.value=cr((140-f)/110),this.earthMat.uniforms.uBHLight.value=.35+cr((300-f)/250)*1.6,this.earthMat.uniforms.uCloudRot.value+=t*.03,this.earthMat.uniforms.uTime.value=e,this.earthMat.uniforms.uBH.value.set(0,0,0),f<xs*.55&&(this.earthAlive=!1,this.earth.visible=!1,n.flash("#ffd9a8",.35,.05,0,.6),n.sound("gulp"))}e<12.5&&this.emitStream(t,e,e<6?260:700),this.updateStream(e);let o=jn(12.3,14,e);r.uHot.value=o*.8,r.uJet.value=jn(12.6,13.4,e)*(1-jn(14.2,14.6,e));let a=.5+.5*jn(70,220,this.camPos.length());r.uI.value=(1+o*.6+(e>12.6&&e<14?Math.sin(e*40)*.15*o:0))*a;let l=1+(e>12.6&&e<14?Math.sin(e*22)*.035*o:0),c=e-14;if(c>0){this.once("boom")&&(n.sound("bigboom"),n.flash("#ffffff",.55,.05,.05,.8),n.shake(1.5),this.core.visible=!0,this.shock.visible=!0,this.rays.visible=!0),r.uBurst.value=cr(c/1.2),this.bh.horizon.scale.setScalar(Math.max(.001,1-c*3));let f=xs*(.6+3.2*Math.pow(c,2.4));this.core.scale.setScalar(f),this.core.material.uniforms.uTime.value=c,this.core.material.uniforms.uI.value=.7*(1-jn(3.5,5,c));let m=xs*(1+9*Math.pow(c,1.8));this.shock.scale.setScalar(m),this.shock.material.uniforms.uI.value=1-jn(2,3.4,c),this.rays.material.uniforms.uI.value=jn(0,.15,c)*(1-jn(2.6,3.4,c))*.45,this.rays.material.uniforms.uTime.value=c;let v=this.sky.material.uniforms;v.uWarp.value=jn(.2,2.6,c),v.uFlash.value=jn(.8,3,c);for(let p of this.galaxies){let g=p.userData.base.length(),x=cr((f-g*.15)/(g*.3));p.position.copy(p.userData.base).multiplyScalar(1+x*.6),p.material.opacity=.55+x*2*(1-x)}c>2.3&&this.once("white")&&n.flash("#ffffff",1,1,99,1),c>3.4&&this.once("text")&&n.text("final")}this.bh.group.scale.setScalar(xs*l);let h=this.wideCam;if(e<6.5){let f=sp(cr(e/6.3)),m=1.85,v=this.wideCam.distanceTo(this.earth0),p=m*Math.pow(v/m,f);Cn.copy(h).sub(this.earth0).normalize(),Ne.copy(this.startDir).lerp(Cn,jn(.15,1,f)).normalize(),this.camPos.copy(this.earth0).addScaledVector(Ne,p),Cn.copy(this.earth0).multiplyScalar(-.006).add(this.earth0),this.camLook.copy(Cn).lerp(this.wideLook,jn(.25,1,f)),this.fov=55}else if(e<12.4){let f=jn(6.3,7.8,e),m=this.earth.position;Ne.copy(m).normalize(),Cn.crossVectors(sa,Ne).normalize();let v=this._target||(this._target=new E);v.copy(m).addScaledVector(Ne,7).addScaledVector(Cn,-5).addScaledVector(sa,2.5),v.length()<xs*2.2&&v.setLength(xs*2.2),this.camPos.lerpVectors(h,v,f),Ne.copy(m).multiplyScalar(.65),this.camLook.lerpVectors(this.wideLook,Ne,f),this.fov=55+f*5}else{let f=jn(12.4,13.8,e);this.fromPos||(this.fromPos=this.camPos.clone(),this.fromLook=this.camLook.clone(),this.farPos=Ag(30,9,640)),this.camPos.lerpVectors(this.fromPos,this.farPos,sp(f)),this.camLook.copy(this.fromLook).multiplyScalar(1-sp(f)),this.fov=60+jn(14,16,e)*18}this.shakeAmt=Math.max(0,this.shakeAmt-t*.5);let u=Math.max(this.shakeAmt,o*.25)*(e>17?0:1);if(i.position.copy(this.camPos),u>0){let f=.004*u*i.position.distanceTo(this.camLook);i.position.x+=(Math.random()-.5)*f,i.position.y+=(Math.random()-.5)*f,i.position.z+=(Math.random()-.5)*f}i.up.set(0,1,0),i.lookAt(this.camLook),this.rays.position.set(0,0,0),this.rays.quaternion.copy(i.quaternion),this.rays.scale.setScalar(i.position.length()*2.2),this.skyGroup.position.copy(i.position);let d=this.sky.material.uniforms;d.uBH.value.set(0,0,0),d.uBHR.value=Math.max(1e-4,this.bh.group.scale.x*this.bh.horizon.scale.x),d.uFlashDir.value.copy(i.position).negate().normalize(),this.atmoMat.uniforms.uFade.value=1,this.bh.update(t,i)}get done(){return this.t>=this.duration}dispose(){this.scene.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&(t.material.map&&t.material.map.dispose(),t.material.dispose())}),this.bh.dispose(),this.skyRT.dispose(),this.earthRT.dispose()}};var{halfZ:Fu,goalDepth:Lg,goalH:Dg,goalHalfW:KS}=kt,Pn=s=>Math.min(1,Math.max(0,s)),op=(s,t,e)=>{let n=Pn((e-s)/(t-s));return n*n*(3-2*n)},Nu=s=>1-Math.pow(1-Pn(s),3),ap=s=>s<.5?4*s*s*s:1-Math.pow(-2*s+2,3)/2;function JS(s){return s<1/2.75?7.5625*s*s:s<2/2.75?7.5625*(s-=1.5/2.75)*s+.75:s<2.5/2.75?7.5625*(s-=2.25/2.75)*s+.9375:7.5625*(s-=2.625/2.75)*s+.984375}var jS=[[0,0,Fu+Lg+Dg],[0,0,7150],[0,200,7800],[0,700,8600],[0,1400,9500],[0,2200,10500],[0,3100,11600],[300,4100,12800],[1300,5200,14200],[2600,6400,15800],[3500,7700,17700],[3500,9100,19800],[2400,10500,21900],[600,11900,24e3],[-1200,13300,26200],[-2200,14700,28500],[-1800,16100,30900],[-600,17400,33300],[0,18600,35800]],QS=[0,16600,44e3],Uu=1500,tE=5500,eE=300,Pg=1300,ra=11e3,Vr=5e3,hr=3.3,ri=new E,Li=new E,ys=new re,Ig=new re,Xi=new le,Ns=new E,ur=new E(0,1,0);function nE(s){let t=Se[s],e=()=>{let l=document.createElement("canvas");return l.width=256,l.height=512,l},n=e(),i=e(),r=n.getContext("2d"),o=i.getContext("2d");r.fillStyle="#25282e",r.fillRect(0,0,256,512);for(let l=0;l<2500;l++){let c=30+Math.random()*40;r.fillStyle=`rgb(${c},${c},${c+4})`,r.fillRect(Math.random()*256,Math.random()*512,2,2)}o.fillStyle="#000",o.fillRect(0,0,256,512);for(let l of[r,o]){l.fillStyle=l===r?"#d8dde6":"#9aa6b8",l.fillRect(12,0,7,512),l.fillRect(237,0,7,512),l.fillStyle=l===r?t.css:"#fff";for(let c of[60,316])l.beginPath(),l.moveTo(128,c),l.lineTo(196,c+70),l.lineTo(196,c+120),l.lineTo(128,c+50),l.lineTo(60,c+120),l.lineTo(60,c+70),l.closePath(),l.fill()}let a=[n,i].map(l=>{let c=new Xe(l);return c.wrapS=c.wrapT=bn,c.anisotropy=4,c});return a[0].colorSpace=Te,a}function lp(s,t,e){return s.onBeforeCompile=n=>{n.uniforms.uReveal=t,n.uniforms.uRevealCol=e,n.vertexShader=`attribute float aS;
varying float vS;
`+n.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vS = aS;`),n.fragmentShader=`uniform float uReveal;
uniform vec3 uRevealCol;
varying float vS;
`+n.fragmentShader.replace("#include <clipping_planes_fragment>",`#include <clipping_planes_fragment>
if (vS > uReveal) discard;`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += uRevealCol * (1.0 - smoothstep(0.0, 1400.0, uReveal - vS)) * 3.0;`)},s}var Bu=class{constructor(t,e,n){this.match=t,this.app=t.app,this.champ=e,this.team=n,this.target=1-n,this.s=this.target===0?-1:1,this.t=0,this.stage=1,this.done=!1,this.events=new Set;let i=this.app,r=i.stadium;this.cine=r.cine,this.quality=i.settings.quality,this.group=new se,t.group.add(this.group),this.camera=new Qe(55,1,.1,4500),this.view={camera:this.camera,rect:[0,0,1,1],hfov:82},i.gfx.setViews([this.view]),i.hud.show(!1);let o=i.gfx.bloom;o&&(this.bloomWas={strength:o.strength,radius:o.radius},o.strength=.38,o.radius=.12);for(let a of t.engines)i.audio.updateEngine(a,0,0,!1,!1,!1);this.engine=i.audio.createEngine(0),this.cine.screenFor(this.target).visible=!1,this.buildOverlay(),this.buildRoad(),this.buildBlackHole(),this.stageCars(),this.buildCutEdges(),this.buildDebris(),this.shake=0,this.camPos=new E,this.camLook=new E,this.camUp=new E(0,1,0),this.camInit=!1,this.caption(`${n===0?"BLUE":"ORANGE"} WINS!`,`${t.scores[0]} - ${t.scores[1]}`,n===0?"blue":"orange"),i.audio.cine("rise")}P(t,e,n){return new E(t,e,this.s*n)}once(t){return this.events.has(t)?!1:(this.events.add(t),!0)}buildOverlay(){let t=document.createElement("div");t.className="cine",t.innerHTML='<div class="cine-fill"></div><div class="cine-bar top"></div><div class="cine-bar bottom"></div><div class="cine-text"><div class="cine-main"></div><div class="cine-sub"></div></div><div class="cine-skip">Press A / Space to skip</div>',document.body.appendChild(t),this.overlay=t,this.fill=t.querySelector(".cine-fill"),this.textEl=t.querySelector(".cine-text"),this.mainEl=t.querySelector(".cine-main"),this.subEl=t.querySelector(".cine-sub"),this.flashes=[],requestAnimationFrame(()=>t.classList.add("on"))}flash(t,e,n,i,r){this.flashes.push({color:t,peak:e,rise:Math.max(.001,n),hold:i,fall:Math.max(.001,r),t:0})}updateFlashes(t){let e=0,n="#fff";for(let i=this.flashes.length-1;i>=0;i--){let r=this.flashes[i];r.t+=t;let o;if(r.t<r.rise?o=r.t/r.rise:r.t<r.rise+r.hold?o=1:o=1-(r.t-r.rise-r.hold)/r.fall,o<=0&&r.t>r.rise){this.flashes.splice(i,1);continue}o*=r.peak,o>e&&(e=o,n=r.color)}this.fill.style.opacity=e.toFixed(3),this.fill.style.background=n}caption(t,e="",n=""){this.mainEl.textContent=t,this.subEl.textContent=e,this.textEl.className="cine-text show "+n}hideCaption(){this.textEl.className="cine-text"}buildRoad(){let t=jS.map(([m,v,p])=>this.P(m,v,p)),e=new So(t,!1,"centripetal");e.arcLengthDivisions=3e3;let n=e.getLength(),i=Math.ceil(n/40),r=[];for(let m=0;m<=i;m++){let v=m/i,p=e.getPointAt(v),g=e.getTangentAt(v).normalize();r.push({s:v*n,p,T:g,U:new E,R:new E,bank:0})}for(let m=0;m<=i;m++){let v=r[Math.max(0,m-3)],p=r[Math.min(i,m+3)],g=ri.crossVectors(r[m].T,ur).normalize(),x=Li.subVectors(p.T,v.T).dot(g)/Math.max(1,p.s-v.s);r[m].k=x}for(let m=0;m<=i;m++){let v=0,p=0;for(let T=Math.max(0,m-25);T<=Math.min(i,m+25);T++)v+=r[T].k,p++;let g=pe.clamp(v/p*9e3,-.5,.5),x=r[m];x.R.crossVectors(x.T,ur).normalize(),x.U.crossVectors(x.R,x.T).normalize();let _=Math.cos(g),y=Math.sin(g),b=x.U.clone(),S=x.R.clone();x.U.copy(b).multiplyScalar(_).addScaledVector(S,y),x.R.copy(S).multiplyScalar(_).addScaledVector(b,-y)}this.samples=r,this.roadLen=n,this.groundLen=Fu+Lg+Dg-Pg,this.totalLen=this.groundLen+n,this.roadEnd=r[i];let o=Se[this.team];this.reveal={value:0};let a={value:new mt(o.light).multiplyScalar(1.5)},[l,c]=nE(this.team),h=eE,u=lp(new Ft({map:l,emissiveMap:c,emissive:new mt(o.main),emissiveIntensity:.9,roughness:.8,metalness:.1,side:Zt}),this.reveal,a),d=lp(new Ft({color:2303790,roughness:.35,metalness:.85,side:Zt}),this.reveal,a),f=lp(new Ft({color:0,emissive:new mt(o.light),emissiveIntensity:2.2,side:Zt}),this.reveal,a);this.roadMats=[u,d,f],this.road=new se,this.road.add(new et(this.sweep([[-h,0],[h,0]],1200),u),new et(this.sweep([[-h+22,1],[-h+22,40],[-h-4,40],[-h-4,-55],[h+4,-55],[h+4,40],[h-22,40],[h-22,1]],900),d),new et(this.sweep([[-h-2,41.5],[-h+20,41.5]],900),f),new et(this.sweep([[h-20,41.5],[h+2,41.5]],900),f),new et(this.sweep([[-h-5,8],[-h-5,24]],900),f),new et(this.sweep([[h+5,24],[h+5,8]],900),f));for(let m of this.road.children)m.frustumCulled=!1,m.castShadow=!1;this.group.add(this.road)}sweep(t,e){let n=this.samples.length,i=t.length,r=new Float32Array(n*i*3),o=new Float32Array(n*i*2),a=new Float32Array(n*i);for(let h=0;h<n;h++){let u=this.samples[h];for(let d=0;d<i;d++){let[f,m]=t[d],v=h*i+d;r[v*3]=(u.p.x+u.R.x*f+u.U.x*m)*.01,r[v*3+1]=(u.p.y+u.R.y*f+u.U.y*m)*.01,r[v*3+2]=(u.p.z+u.R.z*f+u.U.z*m)*.01,o[v*2]=i===2?d:d/(i-1),o[v*2+1]=u.s/e,a[v]=u.s}}let l=[];for(let h=0;h<n-1;h++)for(let u=0;u<i-1;u++){let d=h*i+u,f=(h+1)*i+u,m=(h+1)*i+u+1,v=h*i+u+1;l.push(d,f,v,f,m,v)}let c=new ae;return c.setAttribute("position",new ce(r,3)),c.setAttribute("uv",new ce(o,2)),c.setAttribute("aS",new ce(a,1)),c.setIndex(l),c.computeVertexNormals(),c}frameAt(t,e){if(t<this.groundLen)return e.p.set(0,0,this.s*(Pg+t)),e.T.set(0,0,this.s),e.U.set(0,1,0),e.R.crossVectors(e.T,ur).normalize(),e;let n=t-this.groundLen,i=this.samples,r=n/(this.roadLen/(i.length-1));if(r>=i.length-1){let h=i[i.length-1];return e.p.copy(h.p).addScaledVector(h.T,n-this.roadLen),e.T.copy(h.T),e.U.copy(h.U),e.R.copy(h.R),e}let o=Math.floor(r),a=r-o,l=i[o],c=i[o+1];return e.p.lerpVectors(l.p,c.p,a),e.T.lerpVectors(l.T,c.T,a).normalize(),e.U.lerpVectors(l.U,c.U,a).normalize(),e.R.lerpVectors(l.R,c.R,a).normalize(),e}driveDist(t){let e=Math.max(0,t-hr),n=ra/Vr;return e<n?.5*Vr*e*e:.5*Vr*n*n+ra*(e-n)}driveSpeed(t){let e=Math.max(0,t-hr);return Math.min(ra,Vr*e)}timeAt(t){let e=ra/Vr,n=.5*Vr*e*e;return t<n?hr+Math.sqrt(2*t/Vr):hr+e+(t-n)/ra}buildBlackHole(){this.bhPos=this.P(...QS),this.bh=new ia({segments:this.quality==="low"?.6:1}),this.bh.group.position.copy(this.bhPos).multiplyScalar(.01),this.bh.group.scale.setScalar(Uu*.01);let t=ri.set(-560,0,this.s*-260).sub(Li.copy(this.bhPos).multiplyScalar(.01).setY(0)).normalize();this.bh.group.quaternion.setFromUnitVectors(ur,Li.copy(ur).addScaledVector(t,.3).normalize()),this.bh.u.uI.value=.6,this.bh.u.uGlow.value=.6,this.group.add(this.bh.group),this.bhR=Uu,this.tEnd=this.timeAt(this.totalLen),this.fallDur=1.25,this.tBoom=this.tEnd+this.fallDur,this.tSuck=this.tBoom+.55,this.tSpace=this.tSuck+5.6;let e=this.cine.buildings;this.bMats=[],this.roadBlocked=new Set;let n=new E,i=new re,r=new E;for(let o=0;o<e.count;o++){e.getMatrixAt(o,Xi),this.bMats.push(Xi.clone()),Xi.decompose(n,i,r);let a=!1;for(let l=0;l<this.samples.length;l+=4){let c=this.samples[l],h=c.p.x*.01-n.x,u=c.p.z*.01-n.z,d=Math.max(r.x,r.z)*.75+12;if(h*h+u*u<d*d&&n.y+r.y+8>c.p.y*.01){a=!0;break}}a&&(this.roadBlocked.add(o),Xi.compose(n,i,Ns.set(0,0,0)),e.setMatrixAt(o,Xi))}e.instanceMatrix.needsUpdate=!0}stageCars(){let t=this.match,e=this.s;this.carState={team:this.team,vel:new E,boosting:!1,supersonic:!1,demolished:!1,steerVisual:0,wheelSpin:0,wheelDist:[17,17,17,17],onGround:!0},t.players.filter(i=>i!==this.champ).forEach((i,r)=>{let o=i.car.team===this.team?1:-1,a=Math.floor(r/2),l=o*(700+r%2*260),c=e*(2300+a*1300+r%2*400);i.model.root.position.set(l*.01,17*.01,c*.01),i.model.root.quaternion.setFromAxisAngle(ur,Math.atan2(-l,0)),i.model.root.scale.setScalar(1),i.model.flame.visible=!1,i.model.root.visible=!0});for(let i of t.players)i.model.blob&&(i.model.blob.visible=!1);t.ballBlob&&(t.ballBlob.visible=!1),this.ballWasVisible=t.ball.visible,t.ball.visible=!0,t.ball.position.set(-1900*.01,93*.01,e*3200*.01),this.champ.model.root.visible=!0,this.champ.model.root.scale.setScalar(1),this.frame={p:new E,T:new E,U:new E,R:new E},this.camFrame={p:new E,T:new E,U:new E,R:new E},this.carPos=new E,this.carQuat=new re,this.placeChamp(0,0)}buildCutEdges(){let t=Se[this.team],e=new ue({color:new mt(t.light).multiplyScalar(3),fog:!1});this.edgeMat=e,this.edges=[];let n=i=>{let r=new wo;for(let o=0;o<i.length-1;o++){let a=i[o],l=i[o+1];r.add(new Eo(new E(0,a[1]*.01,this.s*(Fu+a[0])*.01),new E(0,l[1]*.01,this.s*(Fu+l[0])*.01)))}return new ja(r,i.length*8,.22,6,!1)};for(let i of[-1,1]){let r=new se;r.add(new et(n(this.cine.standEdge),e),new et(n(this.cine.roofEdge),e)),r.userData.side=i,r.visible=!1,this.cine.arena.parent.add(r),this.edges.push(r)}}buildDebris(){let e=this.quality==="low"?180:420,n=new De(1,1,1),i=new Ft({roughness:.85,metalness:.1}),r=new hi(n,i,e);r.instanceMatrix.setUsage(ei),r.frustumCulled=!1;let o=new mt,a=this.s;this.debris=[];for(let l=0;l<e;l++){let c=Math.random(),h={p0:new E,size:new E,axis:new E(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),spin:2+Math.random()*6};if(c<.45)h.p0.set((Math.random()*2-1)*38,.3,(Math.random()*2-1)*48),h.size.set(1.5+Math.random()*4,.4+Math.random()*.6,1.5+Math.random()*4),o.setRGB(.07+Math.random()*.05,.16+Math.random()*.08,.04);else if(c<.8){let u=Math.random()*Math.PI*2,d=1+Math.random()*.45;h.p0.set(Math.cos(u)*52*d,8+Math.random()*30,Math.sin(u)*63*d),h.size.set(1+Math.random()*5,.8+Math.random()*3,1+Math.random()*5),Math.random()<.3?o.setHex(Se[h.p0.z*a>0?this.target:this.team].main).multiplyScalar(.5):o.setRGB(.2,.21,.23)}else h.p0.set((Math.random()*2-1)*70,Math.random()*50,(Math.random()*2-1)*90),h.size.set(.3+Math.random()*2,.3+Math.random()*2,.3+Math.random()*2),o.setRGB(.5+Math.random()*.5,.5,.5);h.t0=Math.random()*3.6,h.dur=2.2+Math.random()*1.8,h.swirl=1.5+Math.random()*2.5,h.lift=8+Math.random()*25,this.debris.push(h),r.setColorAt(l,o),r.setMatrixAt(l,Xi.makeScale(0,0,0))}r.instanceColor.needsUpdate=!0,r.visible=!1,this.debrisMesh=r,this.group.add(r)}suckPos(t,e,n,i,r){let o=Li.copy(this.bhPos).multiplyScalar(.01),a=ri.copy(t).sub(o),l=a.length(),c=Math.pow(e,1.7),h=this.bhR*.01,u=l*(1-c)+h*.6*c,d=n*Math.pow(e,2.4),f=Math.cos(d),m=Math.sin(d),v=a.x*f+a.z*m,p=-a.x*m+a.z*f;return r.set(v,a.y,p).multiplyScalar(u/l).add(o),r.y+=i*Math.sin(Math.PI*Math.min(1,e*1.5))*(1-e),Pn((u-h*.75)/(h*1.2))}placeChamp(t,e){let n=this.frameAt(this.driveDist(t),this.frame);this.carPos.copy(n.p).addScaledVector(n.U,17),Xi.makeBasis(ri.copy(n.R).negate(),n.U,n.T),this.carQuat.setFromRotationMatrix(Xi);let i=this.driveSpeed(t),r=this.carState;r.vel.copy(n.T).multiplyScalar(i),r.boosting=t>hr-.1,r.supersonic=i>2200,r.wheelSpin+=i/17*e,this.champ.model.update(r,this.carPos,this.carQuat,e),this.match.effects.carTrail(r,this.carPos,this.carQuat,e)}update(t,e){if(this.done)return!1;t=Math.min(t,.05);let n=this.t;return this.t+=t,e&&n>1?(this.finish(!0),!1):(this.updateFlashes(t),this.stage===1?this.updateStadium(n,t):this.updateSpace(n,t),this.done?!1:(this.app.gfx.render(),!0))}updateStadium(t,e){let n=this.app,i=this.cine,r=this.match,o=this.s,a=Se[this.team];t>2.6&&this.once("caption-off")&&this.hideCaption();let l=Pn((t-.6)/1.1);i.setGoalFlap(this.target,Math.PI/2*JS(l)),t>.6&&this.once("flap")&&(n.audio.cine("flap"),n.stadium.goalFlash(this.target)),t>1.2&&this.once("flapLand")&&n.audio.cine("clunk");let c=KS*ap(Pn((t-.5)/1.1));i.setCut(this.target,t<this.tSuck+2.3?c:0);for(let d of this.edges)d.visible=c>1&&t<this.tSuck+2.2,d.position.x=d.userData.side*c*.01;let h=ap(Pn((t-1.1)/2.5));if(t>1.1&&this.once("build")&&n.audio.cine("build"),t<this.tBoom?this.reveal.value=this.roadLen*h:this.reveal.value=this.roadLen*(1-ap(Pn((t-this.tBoom)/3.2))),t>hr-.2&&this.once("go")&&n.audio.cine("launch"),t<this.tEnd){this.placeChamp(t,e);let d=this.driveSpeed(t);n.audio.updateEngine(this.engine,Math.min(2300,d),t>hr?1:0,t>hr-.1,!0,!0)}else if(t<this.tBoom){this.once("fall")&&(this.fallFrom=this.roadEnd.p.clone().addScaledVector(this.roadEnd.U,17),this.fallDir=this.roadEnd.T.clone(),this.fallQuat=this.carQuat.clone(),n.audio.cine("whoosh"));let d=Pn((t-this.tEnd)/this.fallDur),f=Math.pow(d,1.35),m=this.fallFrom,v=Li.copy(m).addScaledVector(this.fallDir,4200),p=this.bhPos,g=(1-f)*(1-f),x=2*(1-f)*f,_=f*f;this.carPos.set(m.x*g+v.x*x+p.x*_,m.y*g+v.y*x+p.y*_,m.z*g+v.z*x+p.z*_);let y=ri.set(2*(1-f)*(v.x-m.x)+2*f*(p.x-v.x),2*(1-f)*(v.y-m.y)+2*f*(p.y-v.y),2*(1-f)*(v.z-m.z)+2*f*(p.z-v.z)).normalize();ys.setFromUnitVectors(Ns.set(0,0,1),y),Ig.setFromAxisAngle(Ns.set(0,0,1),d*d*9),ys.multiply(Ig),this.carQuat.copy(this.fallQuat).slerp(ys,op(0,.5,d));let b=this.carState;b.vel.copy(y).multiplyScalar(ra),b.boosting=d<.4;let S=this.champ.model;S.update(b,this.carPos,this.carQuat,e);let T=this.carPos.distanceTo(this.bhPos),M=Pn(1-(T-this.bhR)/(this.bhR*3));S.root.scale.set(1-M*.7,1-M*.7,1+M*5),b.boosting&&r.effects.carTrail(b,this.carPos,this.carQuat,e),n.audio.updateEngine(this.engine,2300,0,!1,!1,d<.6)}else if(this.once("boom")){this.champ.model.root.visible=!1,n.audio.updateEngine(this.engine,0,0,!1,!1,!1),n.audio.cine("boom"),this.flash("#fff3e0",.35,.04,.05,.6),this.shake=1.4;let d=ri.copy(this.bhPos).multiplyScalar(.01),f=r.effects;this.nova=new et(new yn(1,48,24),new ue({color:new mt(2.4,1.5,.8),transparent:!0,blending:de,depthWrite:!1,fog:!1})),this.nova.position.copy(d),this.ring=new et(new Yn(1,.025,8,128),new ue({color:new mt(a.light).multiplyScalar(5),transparent:!0,blending:de,depthWrite:!1,fog:!1})),this.ring.position.copy(d),this.ring.quaternion.copy(this.bh.group.quaternion).multiply(ys.setFromAxisAngle(Ns.set(1,0,0),Math.PI/2)),this.group.add(this.nova,this.ring);let m=a.flame,v=Math.round(320*f.mult);for(let p=0;p<v;p++)Li.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiplyScalar(40+Math.random()*160),f.glow.emit(d.x,d.y,d.z,Li.x,Li.y,Li.z,.8+Math.random()*1.4,2+Math.random()*4,.6+Math.random()*1.5,[m[0]*1.6,m[1]*1.6,m[2]*1.6,1],[1.4,.4,.08,0],.6,0)}if(this.nova){let d=(t-this.tBoom)/.9;this.nova.visible=d<1,d<1&&(this.nova.scale.setScalar(this.bhR*.01*(1+1.6*Nu(d))),this.nova.material.opacity=(1-d)*(1-d));let f=(t-this.tBoom)/1.8;this.ring.visible=f<1,f<1&&(this.ring.scale.setScalar(this.bhR*.01*(2+22*Nu(f))),this.ring.material.opacity=1-f)}let u=Nu(Pn((t-this.tBoom)/2.6));this.bhR=Uu+(tE-Uu)*u,this.bh.group.scale.setScalar(this.bhR*.01),this.bh.u.uI.value=.6+u*.4,this.bh.u.uGlow.value=.6+u*.6,t>this.tSuck&&this.updateSuck(t-this.tSuck),this.updateCamera(t,e),this.bh.update(e,this.camera),r.effects.update(e),n.stadium.update(e),t>this.tSpace-.45&&this.once("toSpace")&&(this.flash("#d6ebff",1,.45,.12,1.1),n.audio.cine("whoosh")),t>this.tSpace&&this.once("space")&&this.enterSpace()}updateSuck(t){let e=this.match,n=this.app;if(this.once("suck")){n.audio.cine("drone"),this.debrisMesh.visible=!0,this.loose=[];for(let c of e.players)c!==this.champ&&this.loose.push({obj:c.model.root,p0:c.model.root.position.clone(),q0:c.model.root.quaternion.clone(),t0:.2+Math.random()*1.2,dur:2.4+Math.random(),axis:new E(Math.random()-.5,1,Math.random()-.5).normalize(),spin:3+Math.random()*4,swirl:2+Math.random()*2,lift:15});this.loose.push({obj:e.ball,p0:e.ball.position.clone(),q0:e.ball.quaternion.clone(),t0:.1,dur:2.6,axis:new E(1,0,0),spin:6,swirl:2.5,lift:20});let l=ri.copy(this.bhPos).multiplyScalar(.01);this.bStart=this.bMats.map((c,h)=>{let u=new E,d=new re,f=new E;c.decompose(u,d,f);let m=u.distanceTo(l);return{pos:u,quat:d,scl:f,t0:.6+m/900*2.6+Math.random()*.5,dur:2.4+Math.random()*1.2,axis:new E(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),spin:.6+Math.random()*1.6,swirl:1+Math.random()*2,hidden:this.roadBlocked.has(h)}})}let i=this.debrisMesh,r=this._tmp||(this._tmp=new E);for(let l=0;l<this.debris.length;l++){let c=this.debris[l],h=Pn((t-c.t0)/c.dur);if(h<=0||h>=1){i.setMatrixAt(l,Xi.makeScale(0,0,0));continue}let u=this.suckPos(c.p0,h,c.swirl,c.lift,r);ys.setFromAxisAngle(c.axis,c.spin*(t-c.t0)),Ns.copy(c.size).multiplyScalar(u*Math.min(1,h*8)),i.setMatrixAt(l,Xi.compose(r,ys,Ns))}i.instanceMatrix.needsUpdate=!0;for(let l of this.loose){let c=Pn((t-l.t0)/l.dur);if(c<=0)continue;let h=this.suckPos(l.p0,c,l.swirl,l.lift,r);l.obj.position.copy(r),ys.setFromAxisAngle(l.axis,l.spin*(t-l.t0)*c),l.obj.quaternion.copy(l.q0).premultiply(ys),l.obj.scale.setScalar(Math.max(.001,h)),l.obj.visible=c<1}let o=this.cine.buildings;for(let l=0;l<this.bStart.length;l++){let c=this.bStart[l];if(c.hidden)continue;let h=Pn((t-c.t0)/c.dur);if(h<=0)continue;let u=this.suckPos(c.pos,h,c.swirl,0,r);ys.setFromAxisAngle(c.axis,c.spin*(t-c.t0)).multiply(c.quat),Ns.copy(c.scl).multiplyScalar(u),o.setMatrixAt(l,Xi.compose(r,ys,Ns))}o.instanceMatrix.needsUpdate=!0;let a=Pn((t-2.4)/2.9);if(a>0){let l=this.cine.arena,c=this.suckPos(Ns.set(0,0,0),a,1.2,30,r);l.position.copy(r),l.quaternion.setFromAxisAngle(ri.set(1,0,.4).normalize(),-this.s*1.4*a*a),l.scale.setScalar(.01*Math.max(.001,c)),l.visible=c>.002;for(let h of this.edges)h.visible=!1;this.once("arenaGo")&&n.audio.cine("tear")}}updateCamera(t,e){let n=this.camera,i=this.s,r=this.camPos,o=this.camLook,a=ur,l=!1;if(t<3.7){let u=t/3.7;r.set(430-120*u,200-30*u,i*(300+380*u)).multiplyScalar(.01);let d=ri.set(0,380,i*6e3),f=this.frameAt(this.groundLen+this.reveal.value,this.camFrame).p,m=op(1.2,2.6,t);o.copy(d).lerp(f,m*.85).lerp(this.bhPos,op(2.7,3.6,t)*.8).multiplyScalar(.01),l=!this.camInit}else if(t<this.tEnd-.3){this.once("chaseCut")&&(l=!0);let u=this.driveDist(t),d=this.frameAt(u-560,this.camFrame);ri.copy(d.p).addScaledVector(d.U,200),r.copy(ri).multiplyScalar(.01),o.copy(this.carPos).addScaledVector(this.frame.T,900).addScaledVector(this.frame.U,60).multiplyScalar(.01),a=this.camUpTarget||(this.camUpTarget=new E),a.copy(d.U)}else if(t<this.tSuck){if(this.once("sideCut")){l=!0;let d=this.roadEnd.p,f=Li.crossVectors(this.roadEnd.T,ur).normalize();this.sidePos=d.clone().lerp(this.bhPos,.45).addScaledVector(f,6800).add(ri.set(0,1300,0)).addScaledVector(this.roadEnd.T,-1800),this.sideLook=d.clone().lerp(this.bhPos,.55)}let u=Pn((t-this.tEnd+.3)/(this.tBoom-this.tEnd+.3));r.copy(this.sidePos).lerp(this.sideLook,u*.25),r.addScaledVector(ri.subVectors(this.sidePos,this.sideLook),1.2*Nu(Pn((t-this.tBoom)/.55))),r.multiplyScalar(.01),o.copy(this.sideLook).multiplyScalar(.01)}else{this.once("wideCut")&&(l=!0);let u=Pn((t-this.tSuck)/(this.tSpace-this.tSuck)),d=Li.set(0,90,i*170),f=ri.set(-560,420,i*-260);r.copy(f).sub(d).multiplyScalar(1+1.2*u*u).add(d),r.y+=300*u*u,o.copy(d).lerp(Li.set(0,140,i*300),u)}l||!this.camInit?(this.camInit=!0,this.camUp.copy(a)):this.camUp.lerp(a,1-Math.exp(-e*6)).normalize(),this.shake=Math.max(0,this.shake-e*.9);let c=t>this.tSuck?.25+.35*Pn((t-this.tSuck)/4):0,h=Math.max(this.shake,c);if(n.position.copy(r),h>0){let u=.006*h*r.distanceTo(o);n.position.x+=(Math.random()-.5)*u,n.position.y+=(Math.random()-.5)*u,n.position.z+=(Math.random()-.5)*u}n.up.copy(this.camUp),n.lookAt(o)}enterSpace(){let t=this.app;this.stage=2,this.hideStadiumBits(),t.audio.stopEngine(this.engine);let e={flash:(n,i,r,o,a)=>this.flash(n,i,r,o,a),text:()=>this.caption(`${this.team===0?"BLUE":"ORANGE"} WINS!`,"...and blew up the universe","final "+(this.team===0?"blue":"orange")),sound:n=>t.audio.cine(n),shake:n=>{this.space.shakeAmt=Math.max(this.space.shakeAmt,n)}};this.space=new Du(t.gfx.renderer,this.quality,e),this.view.camera=this.space.camera,this.view.hfov=80,t.gfx.overrideScene=this.space.scene,t.gfx.setViews([this.view]),t.audio.cine("space")}updateSpace(t,e){let n=this.space;n.update(e);let i=80*(n.fov/55);Math.abs(i-this.view.hfov)>.5&&(this.view.hfov=i,this.app.gfx.updateCameras()),n.done&&this.finish(!1)}hideStadiumBits(){this.debrisMesh.visible=!1;for(let t of this.edges)t.visible=!1}finish(t){if(this.done)return;this.done=!0,this.app.audio.cine("stop"),this.restore(),this.overlay.classList.add("out"),this.fill.style.transition=`opacity ${t?.35:1.2}s ease`,this.fill.style.background="#fff",this.fill.style.opacity=t?"0.6":"1",requestAnimationFrame(()=>{this.fill.style.opacity="0"});let e=this.overlay;setTimeout(()=>e.remove(),t?600:1800),this.textEl.className="cine-text"}restore(){let t=this.app,e=this.match;this.bloomWas&&t.gfx.bloom&&Object.assign(t.gfx.bloom,this.bloomWas),t.gfx.overrideScene=null,this.space&&(this.space.dispose(),this.space=null),this.cine.reset();let n=this.cine.buildings;this.bMats.forEach((i,r)=>n.setMatrixAt(r,i)),n.instanceMatrix.needsUpdate=!0;for(let i of this.edges)i.parent.remove(i),i.traverse(r=>{r.geometry&&r.geometry.dispose()});this.edgeMat.dispose();for(let i of e.players)i.model.root.scale.setScalar(1),i.model.root.visible=!0;e.ball.scale.setScalar(1),e.ball.visible=this.ballWasVisible,e.effects.clear(),this.group.parent.remove(this.group),this.group.traverse(i=>{if(i.geometry&&i.geometry.dispose(),i.material){let r=Array.isArray(i.material)?i.material:[i.material];for(let o of r)o.map&&o.map.dispose(),o.emissiveMap&&o.emissiveMap.dispose(),o.dispose()}}),this.bh.dispose(),t.audio.stopEngine(this.engine)}dispose(){this.done||(this.done=!0,this.app.audio.cine("stop"),this.restore()),this.overlay.remove()}};var iE=["Atlas","Blitz","Comet","Dash","Echo","Flare","Ghost","Havoc","Jinx","Nova","Rex","Zippy","Vortex","Turbo"],sE=6,Bl=60,oa=null,Ol=null;function rE(){if(Ol)return Ol;let s=document.createElement("canvas");s.width=s.height=128;let t=s.getContext("2d"),e=t.createRadialGradient(64,64,0,64,64,64);return e.addColorStop(0,"rgba(255,255,255,1)"),e.addColorStop(.25,"rgba(255,255,255,0.45)"),e.addColorStop(.6,"rgba(255,255,255,0.1)"),e.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=e,t.fillRect(0,0,128,128),Ol=new Xe(s),Ol.colorSpace=Te,Ol}var Ou=null;function oE(){let s=vs({fog:!1,emissiveBoost:1.6});s.emissiveIntensity=2.4,Ou||(Ou=mg().clone().scale(.01,.01,.01),Ou.userData.shared=!0);let t=new et(Ou,s);t.castShadow=!0;let e=new As(new os({map:rE(),color:4164863,transparent:!0,opacity:.3,blending:de,depthWrite:!1,fog:!1}));return e.scale.setScalar(Re.radius*.01*4.2),e.renderOrder=2,t.add(e),t.userData.halo=e,t}function aE(s){if(s)return oE();oa||(oa=ng(1024));let t=new Ft({map:oa.map,emissive:16777215,emissiveMap:oa.emissiveMap,emissiveIntensity:2.4,roughness:1,roughnessMap:oa.roughnessMap,metalness:.65,bumpMap:oa.bumpMap,bumpScale:1.2}),e=new et(new yn(Re.radius*.01,64,40),t);return e.castShadow=!0,e}var Yi=new E,Zi=new re,$i=new E,aa=new re;function lE(s){return!s||s.type==="any"?"RB / F":s.type==="pad"?"RB":s.layout==="p2"?"H":"F"}function cp(s){for(let t=s.length-1;t>0;t--){let e=Math.floor(Math.random()*(t+1));[s[t],s[e]]=[s[e],s[t]]}return s}var Hl=class s{constructor(t,e){this.app=t,this.cfg=e,this.attract=e.mode==="attract",this.world=new uu,this.group=new se,t.gfx.scene.add(this.group),this.blocky=t.settings.world!=="classic",this.effects=new Ru(this.group,t.settings.quality,this.blocky?"blocky":"classic"),this.tireMarks=new Fl(this.group,t.settings.quality==="low"?900:2400,t.settings.quality==="high"?.075:.02),this.ball=aE(this.blocky),this.group.add(this.ball),t.settings.quality==="low"&&(this.ballBlob=this.addBlob(1.7,1.7)),this.players=[];let n=cp(iE.slice()),i=cp([7,9,11,17,21,24,33,42,55,73,88,99]);for(let a of[0,1]){let l=e.humans.filter(c=>c.team===a);for(let c=0;c<e.teamSize;c++){let h=l[c],u=this.world.addCar(new mu(a,h?h.name:n.pop()));u.handling=t.settings.handling==="realistic"?"realistic":"easy";let d=new wu(a,i.pop(),t.settings.quality,this.blocky?"blocky":"classic");this.group.add(d.root),t.settings.quality==="low"&&(d.blob=this.addBlob(1.6,2.2));let f={car:u,model:d,human:!!h,device:h?h.device:null,bot:h?null:new vu(u,e.difficulty),name:u.name};this.players.push(f)}}this.humans=this.players.filter(a=>a.human),this.gameMode=e.gameMode||"soccar";let r=!e.items||e.items==="all"?Oo:[e.items];this.world.mode=Dm(this.world,this.gameMode,r),this.modeFx=this.world.mode?new Au(this.group,this.effects,this.world.mode):null,t.input.rbIsItem=this.gameMode==="rumble",this.views=[];let o=this.humans.length;if(this.attract||o===0){let a=new Qe(60,1,.1,3e3);this.views.push({camera:a,rect:[0,0,1,1],hfov:90,rig:new ta(a)})}else this.humans.forEach((a,l)=>{let c=new Qe(70,1,.05,3e3),h=[0,0,1,1];o===2&&(h=e.split==="vertical"?[l*.5,0,.5,1]:[0,l*.5,1,.5]);let u=new ta(c);u.ballCam=t.settings.ballCam,o===2&&e.split!=="vertical"&&(u.distance=310,u.height=120);let d={camera:c,rect:h,hfov:t.settings.fov,rig:u,player:a,label:a.name,team:a.car.team};a.view=d,a.viewIndex=l,this.views.push(d)});this.replayCam=new Qe(55,1,.1,3e3),this.replayRig=new ta(this.replayCam),this.replayView={camera:this.replayCam,rect:[0,0,1,1],hfov:80},t.gfx.setViews(this.views),this.attract?this.engines=[]:(t.hud.setup(this.views),t.hud.show(!0),this.engines=this.humans.map((a,l)=>t.audio.createEngine(o===2&&e.split==="vertical"?l===0?-.5:.5:0))),this.scores=[0,0],this.clock=e.duration||0,this.unlimited=!e.duration,this.overtime=!1,this.state="countdown",this.stateT=0,this.acc=0,this.pred=[],this.predFrame=0,this.threat=-1,this.frame=0,this.time=0,this.snapSize=9+13*this.players.length,this.snapCount=sE*Bl,this.snaps=new Float32Array(this.snapSize*this.snapCount),this.snapHead=0,this.snapFilled=0,this.stepIndex=0,this.fakeCars=this.players.map(a=>({team:a.car.team,vel:new E,boosting:!1,supersonic:!1,demolished:!1,steerVisual:0,wheelSpin:0,wheelDist:[17,17,17,17],onGround:!0})),this.kickoff()}addBlob(t,e){if(!s.blobTex){let i=document.createElement("canvas");i.width=i.height=64;let r=i.getContext("2d"),o=r.createRadialGradient(32,32,0,32,32,32);o.addColorStop(0,"rgba(0,0,0,0.55)"),o.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=o,r.fillRect(0,0,64,64),s.blobTex=new Xe(i)}let n=new et(new Be(t,e),new ue({map:s.blobTex,transparent:!0,depthWrite:!1}));return n.rotation.x=-Math.PI/2,n.renderOrder=1,this.group.add(n),n}placeBlob(t,e,n,i){if(!t)return;let r=e.y-i;t.visible=r<600,t.position.set(e.x*.01,.03,e.z*.01);let o=Math.max(.4,1-r/800);t.scale.setScalar(o),t.material.opacity=o,n&&(t.rotation.z=Math.atan2(2*(n.w*n.y+n.x*n.z),1-2*(n.y*n.y+n.z*n.z)))}dispose(){this.cine&&(this.cine.dispose(),this.cine=null),this.app.gfx.scene.remove(this.group),this.group.traverse(t=>{if(t.geometry&&!t.geometry.userData.shared&&t.geometry.dispose(),t.material&&t.material!==this.ball.material){let e=Array.isArray(t.material)?t.material:[t.material];for(let n of e)n.dispose()}}),this.app.audio.stopEngines(),this.app.input.rbIsItem=!1}kickoff(){let t=this.world;t.ball.reset(),t.resetPads(),this.ball.visible=!0;let e=cp([0,1,2,3,4]);for(let n of[0,1]){let i=this.players.filter(o=>o.car.team===n),r=n===0?1:-1;i.forEach((o,a)=>{let l=Rm[e[a%5]];o.car.place(l[0]*r,l[1]*r,n===0?l[2]:l[2]+Math.PI),o.car.frozen=!0,o.car.input.jump=!1,o.car.prevJump=!1})}for(let n of this.views)n.rig&&n.rig.snap();this.world.mode&&this.world.mode.reset(),this.state="countdown",this.stateT=this.attract?1.2:3,this.lastBeep=4,this.threat=-1,this.acc=0,this.attract||this.app.hud.hideBanner()}startPlay(){this.state="playing";for(let t of this.players)t.car.frozen=!1;this.world.ball.frozen=!1,this.attract||(this.app.hud.showBanner("GO!","","go",.8),this.app.audio.beep(!0))}scored(t){let e=1-t,i=this.world.ball;this.scores[e]++;let r=i.lastTouch,o=i.prevTouch,a=r&&r.team===e?r:o&&o.team===e?o:null,l=a&&o&&o!==a&&o.team===e&&r===a?o:null;a&&(a.stats.goals++,a.stats.score+=100),l&&(l.stats.assists++,l.stats.score+=50);let c=i.pos.clone();this.goalTime=this.time,this.goalTeam=e,this.goalOf=t,this.effects.explosion(c,e,!0),this.app.stadium.goalFlash(t),this.app.stadium.cheer(1);for(let h of this.players){let u=h.car;if(u.demolished)continue;let d=u.pos.distanceTo(c);if(d<2600){let f=u.pos.clone().sub(c).setY(0).normalize().multiplyScalar((1-d/2600)*1800);u.vel.add(f),u.vel.y+=(1-d/2600)*700,u.noGround=.15,u.onGround=!1}}i.frozen=!0,i.vel.set(0,0,0),this.ball.visible=!1;for(let h of this.views)h.rig&&h.rig.addShake(1);if(!this.attract){this.app.audio.goal();for(let d of this.humans)this.app.input.rumble(d.device,1,1,700);let h=Se[e],u=a?a.name:e===0?"Blue":"Orange";this.app.hud.showBanner("GOAL!",a?`${u} scored${l?" \u2022 assist: "+l.name:""}`:"Own goal",e===0?"blue":"orange",2.6),this.app.hud.addFeed(`<b style="color:${h.css}">${u}</b> scored!`,e)}this.state="goal",this.stateT=2.8,this.endAfterGoal=this.overtime||!this.unlimited&&this.clock<=0}startReplay(){if(this.attract||this.snapFilled<Bl*2||!this.app.settings.replays){this.afterReplay();return}this.state="replay";let t=this.snapFilled/Bl,e=this.time-this.goalTime;this.replayEnd=Math.max(0,e-.35),this.replayStart=Math.min(t-.05,e+4.2),this.replayT=this.replayStart,this.replayExploded=!1,this.app.gfx.setViews([this.replayView]),this.replayRig.snap(),this.app.hud.setup([]),this.app.hud.showBanner("REPLAY","Press A / Space to skip","replay",99),this.ball.visible=!0,this.effects.clear()}afterReplay(){if(this.state==="replay"&&(this.app.gfx.setViews(this.views),this.app.hud.setup(this.views),this.app.hud.hideBanner()),this.endAfterGoal){this.finish();return}this.kickoff()}finish(){this.state="over",this.stateT=3;for(let n of this.players)n.car.frozen=!0,n.car.boosting=!1;this.world.ball.frozen=!0;let t=this.scores[0]>this.scores[1]?0:1;this.winner=t,this.app.audio.horn(),this.app.stadium.cheer(.8),this.app.hud.showBanner(t===0?"BLUE WINS!":"ORANGE WINS!",`${this.scores[0]} - ${this.scores[1]}`,t===0?"blue":"orange",99);let e=this.humans.filter(n=>n.car.team===t).sort((n,i)=>i.car.stats.score-n.car.stats.score)[0];e&&this.app.settings.victoryFx!==!1&&(this.app.hud.hideBanner(),this.effects.clear(),this.state="victory",this.cine=new Bu(this,e,t))}endVictory(){this.cine&&(this.cine.dispose(),this.cine=null),this.app.gfx.setViews(this.views),this.app.hud.setup(this.views),this.app.hud.show(!0),this.app.hud.showBanner(this.winner===0?"BLUE WINS!":"ORANGE WINS!",`${this.scores[0]} - ${this.scores[1]}`,this.winner===0?"blue":"orange",99),this.state="over",this.stateT=0}results(){let t=this.players.map(n=>({name:n.name,team:n.car.team,human:n.human,...n.car.stats}));t.sort((n,i)=>i.score-n.score);let e=t.filter(n=>n.team===this.winner).sort((n,i)=>i.score-n.score)[0];return{scores:this.scores.slice(),winner:this.winner,rows:t,mvp:e?e.name:""}}update(t){t=Math.min(t,.1),this.time+=t,this.frame++;let e=this.app,n=e.input,i=!1;for(let o of this.humans){let a=n.controls(o.device);if(o.controls=a,a.pause&&this.state==="victory")i=!0;else if(a.pause&&this.state!=="over"&&e.frames!==e.resumeFrame){e.pauseMatch(o);return}a.skip&&(i=!0),a.ballCam&&o.view&&(o.view.rig.ballCam=!o.view.rig.ballCam,e.hud.viewStatus(o.viewIndex,o.view.rig.ballCam?"BALL CAM":"CAR CAM"));let l=o.car.input;l.throttle=a.throttle,l.pitch=a.pitch,l.yaw=a.yaw,l.roll=a.roll,l.jump=a.jump,l.boost=a.boost,l.powerslide=a.powerslide,l.steer=this.shapeSteer(o,a,t),l.useItem=!!a.itemDown}if(this.state==="victory"){this.cine.update(t,i)||this.endVictory();return}(this.frame%3===0||this.pred.length===0)&&(Hf(this.world.ball,3.5,1/60,this.pred),this.threat=this.goalIn(this.pred));let r=this.world.ball.lastTouch===null&&this.state==="playing";for(let o of this.players)o.bot&&o.bot.update(t,{world:this.world,pred:this.pred,time:this.world.time,kickoff:r,rumble:this.gameMode==="rumble"?this.world.mode:null,teammates:this.players.filter(a=>a.car.team===o.car.team).map(a=>a.car),opponents:this.players.filter(a=>a.car.team!==o.car.team).map(a=>a.car)});switch(this.state){case"countdown":{this.stateT-=t;let o=Math.ceil(this.stateT);!this.attract&&o<this.lastBeep&&o>0&&(this.lastBeep=o,e.hud.showBanner(String(o),this.overtime?"OVERTIME":"","count",1),e.audio.beep(!1)),this.stateT<=0&&this.startPlay();break}case"playing":this.unlimited||(this.overtime?this.clock+=t:this.clock>0&&(this.clock=Math.max(0,this.clock-t)));break;case"goal":this.stateT-=t,this.stateT<=0&&this.startReplay();break;case"replay":this.replayT-=t,(i||this.replayT<=this.replayEnd)&&this.afterReplay();break;case"over":this.stateT-=t,this.stateT<=0&&!this.resultsShown&&(this.resultsShown=!0,e.showResults(this.results()));break;default:break}if(this.state==="replay"){this.renderReplay(t);return}{this.acc+=t;let o=0;for(;this.acc>=Sl&&o<12;)if(this.world.step(Sl),this.acc-=Sl,o++,this.stepIndex++%(120/Bl)===0&&this.recordSnap(),this.state==="playing"){let a=this.world.ball.goalState();if(a>=0){this.scored(a);break}}o>=12&&(this.acc=0)}if(this.state==="playing"&&!this.unlimited&&!this.overtime&&this.clock<=0){let o=this.world.ball;(o.pos.y<Re.radius+25||o.frozen)&&(this.scores[0]===this.scores[1]?(this.overtime=!0,this.clock=0,e.hud.showBanner("OVERTIME","Next goal wins","ot",2.5),e.audio.horn(),this.kickoff(),this.stateT=4):this.finish())}this.processEvents(),this.renderFrame(t)}shapeSteer(t,e,n){let i=e.steer;if(this.app.settings.handling==="realistic")return t.steerS=i,i;if(e.digitalSteer){let r=t.steerS||0,a=Math.sign(i)!==Math.sign(r)||Math.abs(i)<Math.abs(r)?14:6;t.steerS=r+Math.max(-a*n,Math.min(a*n,i-r))}else t.steerS=Math.sign(i)*Math.pow(Math.abs(i),1.5);return t.steerS}clockText(){if(this.unlimited)return"\u221E";let t=Math.max(0,this.overtime?Math.floor(this.clock):Math.ceil(this.clock));return`${this.overtime?"+":""}${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}goalIn(t){for(let e of t)if(Math.abs(e.pos.x)<kt.goalHalfW&&e.pos.y<kt.goalH){if(e.pos.z>kt.halfZ+Re.radius)return 1;if(e.pos.z<-kt.halfZ-Re.radius)return 0}return-1}processEvents(){let t=this.app,e=this.world.events,n=this.humans.map(r=>r.car),i=r=>{if(!r||n.length===0)return .6;let o=1/0;for(let a of n)o=Math.min(o,a.pos.distanceTo(r));return Math.max(.15,1-o/7e3)};for(let r of e){let o=r.car?this.humans.find(a=>a.car===r.car):null;switch(r.type){case"ballHit":r.strength>350&&this.effects.hit(r.point,r.strength),this.ballPulse=Math.max(this.ballPulse||0,Math.min(1,r.strength/1800)),this.attract||(r.strength>250&&t.audio.hit(r.strength*i(r.point)),o&&(t.input.rumble(o.device,Math.min(1,r.strength/2500),.4,120),r.strength>1500&&o.view.rig.addShake(Math.min(.45,r.strength/7e3))),this.onTouch(r.car,o));break;case"bounce":!this.attract&&r.strength>400&&t.audio.bounce(r.strength*i(r.point));break;case"jump":o&&t.audio.jump();break;case"dodge":o&&t.audio.dodge();break;case"land":o&&(t.audio.land(r.strength),t.input.rumble(o.device,.15,.2,60));break;case"bump":if(!this.attract){t.audio.bump();let a=this.humans.find(l=>l.car===r.by);o&&t.input.rumble(o.device,.7,.5,200),a&&t.input.rumble(a.device,.4,.3,120)}break;case"demo":if(this.effects.demolition(r.point,r.car.team),r.by.stats.score+=25,!this.attract){t.audio.demo();for(let l of this.humans){let c=l.car.pos.distanceTo(r.point);c<3e3&&l.view&&l.view.rig.addShake(l.car===r.car||l.car===r.by?.9:.6*(1-c/3e3))}t.hud.addFeed(`<b style="color:${Se[r.by.team].css}">${r.by.name}</b> \u{1F4A5} <b style="color:${Se[r.car.team].css}">${r.car.name}</b>`),o&&(t.input.rumble(o.device,1,1,450),t.hud.viewCenter(o.viewIndex,"DEMOLISHED",2.8));let a=this.humans.find(l=>l.car===r.by);a&&(t.input.rumble(a.device,.6,.6,200),t.hud.viewCenter(a.viewIndex,"DEMOLITION!",1.5))}break;case"itemGet":o&&(t.audio.itemGet(),t.input.rumble(o.device,.15,.3,90));break;case"itemUse":this.attract||t.audio.itemUse(r.item,i(r.car.pos)),r.item==="freezer"&&this.effects.flash(this.ball.position.clone(),10477823,2.6,.35,2.5),r.item==="curveball"&&this.effects.ring(this.ball.position.clone(),Se[r.car.team].light,5,.5);break;case"itemFail":o&&t.hud.viewStatus(o.viewIndex,r.item==="boot"?"NO OPPONENT IN RANGE":"BALL OUT OF RANGE",1.2);break;case"hooked":this.attract||t.audio.hook(i(r.point));break;case"boot":this.effects.flash(r.point.clone().multiplyScalar(.01),16765056,2.2,.3,2.5),this.effects.hit(r.point,2600),this.attract||(t.audio.bump(),t.hud.addFeed(`<b style="color:${Se[r.by.team].css}">${r.by.name}</b> \u{1F462} <b style="color:${Se[r.car.team].css}">${r.car.name}</b>`),o&&(t.input.rumble(o.device,.9,.7,300),t.hud.viewCenter(o.viewIndex,"BOOTED!",1.4)));break;case"heatseekFlip":this.effects.hit(r.point,2200);break;case"boostPickup":this.effects.boostPickup(r.pad),o&&(t.audio.boostPickup(r.big),r.big&&t.input.rumble(o.device,.1,.3,80));break;default:break}}e.length=0}onTouch(t,e){if(this.state!=="playing"||this.world.time-(t.lastShotCheck||-10)<.4)return;t.lastShotCheck=this.world.time;let n=this.threat,i=this._shotBuf||(this._shotBuf=[]);Hf(this.world.ball,3,1/40,i);let r=this.goalIn(i);this.threat=r,n===t.team&&r!==t.team&&(t.stats.saves++,t.stats.score+=50,this.app.hud.addFeed(`<b style="color:${Se[t.team].css}">${t.name}</b> made a save!`),e&&this.app.hud.viewCenter(e.viewIndex,"SAVE!",1.5)),r===1-t.team&&n!==r&&(t.stats.shots++,t.stats.score+=20,this.app.audio.cheer(.35),e&&this.app.hud.viewCenter(e.viewIndex,"SHOT ON GOAL",1.2))}recordSnap(){let t=this.snapHead*this.snapSize,e=this.snaps,n=this.world.ball;e[t]=this.time,e[t+1]=n.pos.x,e[t+2]=n.pos.y,e[t+3]=n.pos.z,e[t+4]=n.quat.x,e[t+5]=n.quat.y,e[t+6]=n.quat.z,e[t+7]=n.quat.w,e[t+8]=this.ball.visible?1:0;let i=t+9;for(let r of this.players){let o=r.car;e[i]=o.pos.x,e[i+1]=o.pos.y,e[i+2]=o.pos.z,e[i+3]=o.quat.x,e[i+4]=o.quat.y,e[i+5]=o.quat.z,e[i+6]=o.quat.w,e[i+7]=o.vel.x,e[i+8]=o.vel.y,e[i+9]=o.vel.z,e[i+10]=(o.boosting?1:0)|(o.supersonic?2:0)|(o.demolished?4:0)|(o.onGround?8:0),e[i+11]=o.steerVisual,e[i+12]=o.wheelSpin,i+=13}this.snapHead=(this.snapHead+1)%this.snapCount,this.snapFilled=Math.min(this.snapCount,this.snapFilled+1)}snapAt(t){let e=Math.min(this.snapFilled-1,Math.max(0,t*Bl)),n=Math.floor(e),i=e-n,r=(this.snapHead-1-n+this.snapCount*2)%this.snapCount,o=(r-1+this.snapCount)%this.snapCount;return{a:r*this.snapSize,b:o*this.snapSize,t:i}}renderReplay(t){let{a:e,b:n,t:i}=this.snapAt(this.replayT),r=this.snaps,o=l=>r[e+l]+(r[n+l]-r[e+l])*i;$i.set(o(1),o(2),o(3)),aa.set(r[e+4],r[e+5],r[e+6],r[e+7]),this.ball.position.copy($i).multiplyScalar(.01),this.ball.quaternion.copy(aa),this.ball.visible=r[e+8]>.5;let a=9;this.players.forEach((l,c)=>{let h=this.fakeCars[c];Yi.set(o(a),o(a+1),o(a+2)),Zi.set(r[e+a+3],r[e+a+4],r[e+a+5],r[e+a+6]),aa.set(r[n+a+3],r[n+a+4],r[n+a+5],r[n+a+6]),Zi.slerp(aa,i),h.vel.set(r[e+a+7],r[e+a+8],r[e+a+9]);let u=r[e+a+10];h.boosting=!!(u&1),h.supersonic=!!(u&2),h.demolished=!!(u&4),h.steerVisual=r[e+a+11],h.wheelSpin=r[e+a+12],l.model.update(h,Yi,Zi,t),this.effects.carTrail(h,Yi,Zi,t),a+=13}),!this.replayExploded&&this.ball.visible===!1&&(this.replayExploded=!0,this.effects.explosion($i,this.goalTeam,!0)),this.replayRig.updateReplay(t,$i,this.goalOf===1?kt.halfZ:-kt.halfZ,this.replayT),this.effects.update(t),this.app.stadium.update(t),this.app.hud.update(t),this.app.gfx.render()}updateBallGlow(t){let e=this.world.ball.vel.length();this.ballPulse=Math.max(0,(this.ballPulse||0)-t*2.5);let n=this.ballPulse*this.ballPulse,i=this.ball.material.emissiveIntensity/2.4;this.ball.material.userData.emissiveBoost.value=1.6*i+Math.min(1.6,e/2200)+n*4;let r=this.ball.userData.halo;r.material.opacity=Math.min(.9,.2+Math.min(.3,e/7e3)+n*.55),r.scale.setScalar(Re.radius*.01*(4.2+n*2.5+Math.min(1.2,e/3e3)))}renderFrame(t){let e=this.app,n=this.acc/Sl,i=this.world.ball;$i.lerpVectors(i.prevPos,i.pos,n),aa.slerpQuaternions(i.prevQuat,i.quat,n),this.ball.position.copy($i).multiplyScalar(.01),this.ball.quaternion.copy(aa),this.ball.visible&&this.effects.ballTrail(i,$i),this.placeBlob(this.ballBlob,$i,null,Re.radius),this.ballBlob&&(this.ballBlob.visible=this.ballBlob.visible&&this.ball.visible);let r=[];for(let a of this.players){let l=a.car;Yi.lerpVectors(l.prevPos,l.pos,n),Zi.slerpQuaternions(l.prevQuat,l.quat,n),a.ipos=(a.ipos||new E).copy(Yi),a.iquat=(a.iquat||new re).copy(Zi),a.model.update(l,Yi,Zi,t),this.placeBlob(a.model.blob,Yi,Zi,17);let c=this.state==="replay"?0:Fl.skid(l);this.tireMarks.update(l,Yi,Zi,c),this.effects.dirt(l,Yi,Zi,c,t),a.model.blob&&(a.model.blob.visible=a.model.blob.visible&&!l.demolished),this.effects.carTrail(l,Yi,Zi,t),r.push({car:l,pos:a.ipos,name:a.name})}if(this.attract){let a=this.views[0],l=this.time*.05,c=a.camera,h=62;c.position.set(Math.cos(l)*h*.62,13+Math.sin(l*.7)*4,Math.sin(l)*h*.8),c.up.set(0,1,0);let u=Yi.copy($i).multiplyScalar(.01*.6);c.lookAt(u.x,2,u.z)}else{for(let a of this.humans){let l=a.view,c=a.controls||{};l.rig.update(t,a.car,a.ipos,a.iquat,this.ball.visible?$i:null,c.lookX||0,c.lookY||0),e.hud.setBoost(a.viewIndex,a.car.boost),this.gameMode==="rumble"&&e.hud.setItem(a.viewIndex,this.world.mode.status(a.car),El,lE(a.device)),e.hud.updatePlates(a.viewIndex,l.camera,r,a.car)}this.humans.forEach((a,l)=>{let c=a.car;e.audio.updateEngine(this.engines[l],c.vel.length(),c.input.throttle,c.boosting,c.onGround,!c.demolished&&!c.frozen)}),e.hud.setScore(this.scores[0],this.scores[1]),e.hud.setClock(this.clock,this.overtime,this.unlimited),e.hud.update(t)}this.modeFx&&this.modeFx.update(t,this.players,this.ball,$i),this.ball.userData.halo&&this.updateBallGlow(t),this.tireMarks.flush();let o=this.state==="goal";o&&this.stateT>1.2&&this.effects.pyro(e.stadium.pyroPoints[this.goalOf],this.goalTeam,t),e.stadium.setScreens(this.scores[0],this.scores[1],this.clockText(),o?this.goalTeam===0?"blue":"orange":null),this.effects.update(t),e.stadium.update(t),e.gfx.render()}renderPaused(){this.app.gfx.render()}};var la={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var yi=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},cE=new as(-1,1,1,-1,0,1),hp=class extends ae{constructor(){super(),this.setAttribute("position",new zt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new zt([0,2,0,0,2,0],2))}},hE=new hp,dr=class{constructor(t){this._mesh=new et(hE,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,cE)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var Hu=class extends yi{constructor(t,e="tDiffuse"){super(),this.textureID=e,this.uniforms=null,this.material=null,t instanceof te?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=qi.clone(t.uniforms),this.material=new te({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new dr(this.material)}render(t,e,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var kl=class extends yi{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,n){let i=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),r.buffers.stencil.setFunc(i.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),t.setRenderTarget(n),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(i.EQUAL,1,4294967295),r.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),r.buffers.stencil.setLocked(!0)}},ku=class extends yi{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var zu=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let n=t.getSize(new nt);this._width=n.width,this._height=n.height,e=new qe(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:tn}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Hu(la),this.copyPass.material.blending=Si,this.timer=new rl}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){this.timer.update(),t===void 0&&(t=this.timer.getDelta());let e=this.renderer.getRenderTarget(),n=!1;for(let i=0,r=this.passes.length;i<r;i++){let o=this.passes[i];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),o.render(this.renderer,this.writeBuffer,this.readBuffer,t,n),o.needsSwap){if(n){let a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}kl!==void 0&&(o instanceof kl?n=!0:o instanceof ku&&(n=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new nt);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let n=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(n,i),this.renderTarget2.setSize(n,i);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,i)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Ng={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new mt(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var ca=class s extends yi{constructor(t,e=1,n,i){super(),this.strength=e,this.radius=n,this.threshold=i,this.resolution=t!==void 0?new nt(t.x,t.y):new nt(256,256),this.clearColor=new mt(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new qe(r,o,{type:tn,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new qe(r,o,{type:tn,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let d=new qe(r,o,{type:tn,depthBuffer:!1});d.texture.name="UnrealBloomPass.v"+h,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),o=Math.round(o/2)}let a=Ng;this.highPassUniforms=qi.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new te({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new nt(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new E(1,1,1),new E(1,1,1),new E(1,1,1),new E(1,1,1),new E(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=qi.clone(la.uniforms),this.blendMaterial=new te({uniforms:this.copyUniforms,vertexShader:la.vertexShader,fragmentShader:la.fragmentShader,premultipliedAlpha:!0,blending:de,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new mt,this._oldClearAlpha=1,this._basic=new ue,this._fsQuad=new dr(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(t,e){let n=Math.round(t/2),i=Math.round(e/2);this.renderTargetBright.setSize(n,i);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,i),this.renderTargetsVertical[r].setSize(n,i),this.separableBlurMaterials[r].uniforms.invSize.value=new nt(1/n,1/i),n=Math.round(n/2),i=Math.round(i/2)}render(t,e,n,i,r){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=n.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this._fsQuad.render(t),a=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(n),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(t){let e=[],n=t/3;for(let o=0;o<t;o++)e.push(.39894*Math.exp(-.5*o*o/(n*n))/n);let i=[],r=[];for(let o=1;o<t;o+=2){let a=e[o],l=o+1<t?e[o+1]:0,c=a+l;i.push((o*a+(o+1)*l)/c),r.push(c)}return new te({defines:{KERNEL_PAIRS:i.length},uniforms:{colorTexture:{value:null},invSize:{value:new nt(.5,.5)},direction:{value:new nt(.5,.5)},centerWeight:{value:e[0]},gaussianOffsets:{value:i},gaussianWeights:{value:r}},vertexShader:`

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

				}`})}_getCompositeMaterial(t){return new te({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

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

				}`})}};ca.BlurDirectionX=new nt(1,0);ca.BlurDirectionY=new nt(0,1);var zl={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};var Vu=class extends yi{constructor(){super(),this.isOutputPass=!0,this.uniforms=qi.clone(zl.uniforms),this.material=new Ro({name:zl.name,uniforms:this.uniforms,vertexShader:zl.vertexShader,fragmentShader:zl.fragmentShader}),this._fsQuad=new dr(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},Me.getTransfer(this._outputColorSpace)===Pe&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===ol?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===al?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===ll?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Ir?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===hl?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===ul?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===cl&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var up=class extends yi{constructor(t){super(),this.owner=t,this.needsSwap=!1}render(t,e,n){let i=this.renderToScreen?null:n;this.owner.renderViews(i)}},Gu=class{constructor(t,e){this.quality=e,this.container=t;let n=new eu({antialias:e!=="low",powerPreference:"high-performance",stencil:!1});if(n.toneMapping=Ir,n.toneMappingExposure=1,n.outputColorSpace=Te,n.shadowMap.enabled=e!=="low",n.shadowMap.type=Cr,n.autoClear=!1,n.localClippingEnabled=!0,t.appendChild(n.domElement),this.renderer=n,this.scene=new bi,this.overrideScene=null,this.views=[],this.pixelRatio=Math.min(window.devicePixelRatio||1,e==="high"?1.75:e==="medium"?1.25:1),n.setPixelRatio(this.pixelRatio),e!=="low"){let i=new qe(1,1,{type:tn,samples:e==="high"?4:0});this.composer=new zu(n,i),this.composer.addPass(new up(this)),this.bloom=new ca(new nt(256,256),.5,.35,.92),this.composer.addPass(this.bloom),this.composer.addPass(new Vu)}this.resize(),this.onResize=()=>this.resize(),window.addEventListener("resize",this.onResize)}setExposure(t){this.renderer.toneMappingExposure=t}setViews(t){this.views=t,this.updateCameras()}resize(){let t=window.innerWidth,e=window.innerHeight;this.width=t,this.height=e,this.renderer.setSize(t,e),this.composer&&(this.composer.setPixelRatio(this.pixelRatio),this.composer.setSize(t,e)),this.updateCameras()}updateCameras(){for(let t of this.views){let e=t.rect[2]*this.width/Math.max(1,t.rect[3]*this.height),n=pe.degToRad(t.hfov||100),i=pe.radToDeg(2*Math.atan(Math.tan(n/2)/e));i=pe.clamp(i,47,78),t.camera.fov=i,t.camera.aspect=e,t.camera.updateProjectionMatrix()}}renderViews(t){let e=this.renderer;e.setRenderTarget(t),e.setClearColor(0,1),e.clear(!0,!0,!1);let n=t?t.width:this.width*this.pixelRatio,i=t?t.height:this.height*this.pixelRatio,r=t?1:1/this.pixelRatio;for(let o of this.views){let a=Math.round(o.rect[0]*n),l=Math.round(o.rect[2]*n),c=Math.round(o.rect[3]*i),h=Math.round((1-o.rect[1]-o.rect[3])*i);t?(t.viewport.set(a,h,l,c),t.scissor.set(a,h,l,c),t.scissorTest=!0,e.setRenderTarget(t)):(e.setViewport(a*r,h*r,l*r,c*r),e.setScissor(a*r,h*r,l*r,c*r),e.setScissorTest(!0)),o.camera.layers.enable(1),o.camera.layers.enable(2),e.render(this.overrideScene||this.scene,o.camera)}t?(t.viewport.set(0,0,t.width,t.height),t.scissor.set(0,0,t.width,t.height),t.scissorTest=!1,e.setRenderTarget(t)):(e.setViewport(0,0,this.width,this.height),e.setScissorTest(!1))}render(){this.composer?this.composer.render():this.renderViews(null)}dispose(){window.removeEventListener("resize",this.onResize),this.composer&&this.composer.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}};function ha(s,t=!1){let e=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},o={},a=s[0].morphTargetsRelative,l=new ae,c=0;for(let h=0;h<s.length;++h){let u=s[h],d=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in u.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in u.morphAttributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(t){let f;if(e)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(e){let h=0,u=[];for(let d=0;d<s.length;++d){let f=s[d].index;for(let m=0;m<f.count;++m)u.push(f.getX(m)+h);h+=s[d].attributes.position.count}l.setIndex(u)}for(let h in r){let u=Ug(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in o){let u=o[h][0].length;if(u!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){let f=[];for(let v=0;v<o[h].length;++v)f.push(o[h][v][d]);let m=Ug(f);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(m)}}}return l}function Ug(s){let t,e,n,i=-1,r=0;for(let c=0;c<s.length;++c){let h=s[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}let o=new t(r),a=new ce(o,e,n),l=0;for(let c=0;c<s.length;++c){let h=s[c];if(h.isInterleavedBufferAttribute){let u=l/e;for(let d=0,f=h.count;d<f;d++)for(let m=0;m<e;m++){let v=h.getComponent(d,m);a.setComponent(d+u,m,v)}}else o.set(h.array,l);l+=h.count*e}return i!==void 0&&(a.gpuType=i),a}var Vl=new E(-.55,0,.83).normalize(),Fg=new E().crossVectors(Vl,new E(0,1,0)).normalize(),uE=new E(0,1,0),Bg=pe.degToRad(32),Og={sunset:17.78,day:13.2,night:.6},dE=`
  float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float a = 0.5, s = 0.0;
    mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 6; i++) { s += a * vnoise(p); p = r * p * 2.02 + 3.1; a *= 0.5; }
    return s;
  }
`;function fE(){return new te({side:fn,depthWrite:!1,depthTest:!1,uniforms:{uSunDir:{value:new E(0,1,0)},uMoonDir:{value:new E(0,-1,0)},uWind:{value:new nt},uZenith:{value:new mt},uHorizon:{value:new mt},uHorizonAway:{value:new mt},uGlow:{value:new mt},uSunColor:{value:new mt},uCloudLit:{value:new mt},uCloudShadow:{value:new mt},uCover:{value:.35},uNight:{value:0},uFlash:{value:0}},vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,fragmentShader:`
      uniform vec3 uSunDir, uMoonDir, uZenith, uHorizon, uHorizonAway, uGlow, uSunColor, uCloudLit, uCloudShadow;
      uniform vec2 uWind;
      uniform float uCover, uNight, uFlash;
      varying vec3 vDir;
      ${dE}
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 sunH = normalize(vec3(uSunDir.x, 0.0, uSunDir.z) + 1e-5);
        float toward = dot(normalize(vec3(d.x, 0.0, d.z) + 1e-5), sunH) * 0.5 + 0.5;
        vec3 horizon = mix(uHorizonAway, uHorizon, pow(toward, 2.2));
        vec3 col = mix(horizon, uZenith, pow(smoothstep(0.0, 0.55, h), 0.5));
        float sd = max(dot(d, uSunDir), 0.0);
        float band = 1.0 - smoothstep(0.0, 0.4, abs(h));
        col += uGlow * (pow(sd, 5.0) * 0.45 * band + pow(sd, 40.0) * 0.35);
        if (h < 0.0) col = mix(col, horizon * 0.4, smoothstep(0.0, -0.25, h));
        // stars
        if (uNight > 0.01 && h > 0.0) {
          vec3 sp = d * 280.0;
          float st = step(0.9972, hash13(floor(sp)));
          col += vec3(st) * uNight * (0.4 + 0.8 * hash13(floor(sp) + 2.3)) * smoothstep(0.02, 0.3, h) * (1.0 - uCover);
        }
        // sun and moon discs
        float sunDisc = smoothstep(0.99955, 0.99975, sd);
        col += uSunColor * (sunDisc * 8.0 + pow(sd, 600.0) * 0.8) * (1.0 - uCover * 0.7);
        float md = max(dot(d, uMoonDir), 0.0);
        col += vec3(0.9, 0.94, 1.0) * (smoothstep(0.99935, 0.99955, md) * 2.4 + pow(md, 300.0) * 0.25) * uNight;
        // clouds on a curved layer
        if (h > -0.02) {
          float hh = max(h, 0.0) + 0.045;
          vec2 p = d.xz / hh * 0.9 + uWind;
          vec2 q = vec2(fbm(p * 0.35 + 1.7), fbm(p * 0.35 + 9.2));
          float n = fbm(p * 0.3 + q * 1.6);
          float cov = mix(0.6, 0.3, uCover);
          float dens = smoothstep(cov, cov + 0.18, n);
          // light: denser cloud between this point and the sun means shadow
          vec2 ps = p + sunH.xz * 0.35;
          float ns = fbm(ps * 0.3 + q * 1.6);
          float shade = smoothstep(cov - 0.02, cov + 0.3, ns) * 0.8 + smoothstep(cov + 0.1, cov + 0.4, n) * 0.35;
          vec3 cc = mix(uCloudLit, uCloudShadow, clamp(shade * 0.9 + uCover * 0.35, 0.0, 1.0));
          cc += uGlow * pow(sd, 6.0) * (1.0 - dens * 0.7) * 1.2;
          cc += uGlow * pow(sd, 3.0) * 0.25;
          float fade = smoothstep(0.0, 0.1, h);
          col = mix(col, cc, dens * mix(0.35, 0.96, fade));
          // high streaky cirrus
          float ci = fbm(vec2(p.x * 0.25, p.y * 1.3) + 4.0);
          col += uCloudLit * smoothstep(0.58, 0.85, ci) * 0.18 * fade * (1.0 - uCover);
        }
        col += vec3(0.75, 0.8, 1.0) * uFlash;
        gl_FragColor = vec4(col, 1.0);
      }`})}var mn=s=>new mt(s),pE={night:{zenith:mn(264214),horizon:mn(1450558),away:mn(923696),glow:mn(0),sun:mn(0),lit:mn(3752810),shadow:mn(724766)},sunset:{zenith:mn(797306),horizon:mn(16747038),away:mn(3822228),glow:mn(16742928),sun:mn(16773832),lit:mn(16757830),shadow:mn(2896482)},day:{zenith:mn(2779348),horizon:mn(11785456),away:mn(10273514),glow:mn(16773336),sun:mn(16774368),lit:mn(16777215),shadow:mn(9346232)}},mE=new mt;function dp(s,t,e){e.setRGB(0,0,0);for(let n of["night","sunset","day"])e.add(mE.copy(pE[n][s]).multiplyScalar(t[n]));return e}var Wu=(s,t,e)=>{let n=Math.min(1,Math.max(0,(e-s)/(t-s)));return n*n*(3-2*n)},qu=class{constructor(t,e,n,{time:i="sunset",weather:r="clear"}={}){this.renderer=t,this.scene=e,this.cycle=i==="cycle",this.hours=Og[i]??Og.sunset,this.size=n==="high"?512:n==="medium"?256:128,this.rt=new Fo(this.size,{type:tn,generateMipmaps:!0,minFilter:ti}),this.skyScene=new bi,this.mat=fE();let o=new et(new De(2,2,2),this.mat);o.frustumCulled=!1,this.skyScene.add(o),this.cams=[];let a=[[1,0,0,0,-1,0],[-1,0,0,0,-1,0],[0,1,0,0,0,1],[0,-1,0,0,0,-1],[0,0,1,0,-1,0],[0,0,-1,0,-1,0]];for(let[l,c,h,u,d,f]of a){let m=new Qe(90,1,.1,10);m.up.set(u,d,f),m.lookAt(l,c,h),this.cams.push(m)}this.face=0,this.pmrem=new js(t),this.envRT=null,this.envTimer=0,this.wind=new nt(Math.random()*50,Math.random()*50),this.sunDir=new E,this.moonDir=new E,this.lightDir=new E,this.w={night:0,sunset:0,day:1},this.weather=r,this.cover=.35,this.flash=0,this.colors={zenith:new mt,horizon:new mt,away:new mt,sun:new mt,glow:new mt},vi.cube.value=this.rt.texture,e.background=this.rt.texture,this.compute(),this.renderAll(),this.refreshEnv()}setWeather(t){this.cover=t}compute(){let t=(this.hours-6)/12*Math.PI;this.sunDir.copy(Vl).multiplyScalar(-Math.cos(t)).addScaledVector(uE,Math.sin(t)*Math.cos(Bg)).addScaledVector(Fg,Math.sin(t)*Math.sin(Bg)).normalize(),this.moonDir.copy(this.sunDir).negate().addScaledVector(Fg,.25).normalize();let e=pe.radToDeg(Math.asin(this.sunDir.y)),n=Wu(-2,16,e),i=Wu(-8,1,e)*(1-Wu(5,24,e)),r=1-Wu(-12,-1,e),o=n+i+r||1;this.w.day=n/o,this.w.sunset=i/o,this.w.night=r/o,this.elevation=e;for(let l of["zenith","horizon","away","sun","glow"])dp(l==="away"?"away":l,this.w,this.colors[l]);e>-3?this.lightDir.copy(this.sunDir):this.lightDir.copy(this.moonDir),this.lightDir.y<.12&&(this.lightDir.y=.12,this.lightDir.normalize());let a=this.mat.uniforms;if(a.uSunDir.value.copy(this.sunDir),a.uMoonDir.value.copy(this.moonDir),a.uZenith.value.copy(this.colors.zenith),a.uHorizon.value.copy(this.colors.horizon),a.uHorizonAway.value.copy(this.colors.away),a.uGlow.value.copy(this.colors.glow),a.uSunColor.value.copy(this.colors.sun),dp("lit",this.w,a.uCloudLit.value),dp("shadow",this.w,a.uCloudShadow.value),this.cover>.62){let l=(this.cover-.62)*2.6,c=new mt(.32,.34,.38).multiplyScalar(.3+this.w.day*.9+this.w.sunset*.5);for(let h of[a.uZenith.value,a.uHorizon.value,a.uHorizonAway.value,a.uCloudLit.value])h.lerp(c,l*.8);a.uCloudShadow.value.multiplyScalar(1-l*.5),a.uGlow.value.multiplyScalar(1-l*.8)}a.uCover.value=this.cover,a.uNight.value=this.w.night,a.uFlash.value=this.flash}renderFace(t){let e=this.renderer,n=e.getRenderTarget(),i=e.xr.enabled;e.xr.enabled=!1,this.rt.texture.generateMipmaps=t===5,e.setRenderTarget(this.rt,t),e.render(this.skyScene,this.cams[t]),e.setRenderTarget(n),e.xr.enabled=i}renderAll(){for(let t=0;t<6;t++)this.renderFace(t)}refreshEnv(){let t=this.envRT;this.envRT=this.pmrem.fromCubemap(this.rt.texture),this.scene.environment=this.envRT.texture,t&&t.dispose()}update(t){this.cycle&&(this.hours=(this.hours+t*(24/480))%24),this.wind.x+=t*.012,this.wind.y+=t*.006,this.mat.uniforms.uWind.value.copy(this.wind),this.flash=Math.max(0,this.flash-t*3),this.compute(),this.renderFace(this.face),this.face=(this.face+1)%6,this.envTimer+=t,this.envTimer>(this.cycle?2:6)&&(this.envTimer=0,this.refreshEnv())}dispose(){this.scene.background===this.rt.texture&&(this.scene.background=null),this.envRT&&this.scene.environment===this.envRT.texture&&(this.scene.environment=null),vi.cube.value===this.rt.texture&&(vi.cube.value=null),this.rt.dispose(),this.envRT&&this.envRT.dispose(),this.pmrem.dispose(),this.mat.dispose()}};function zg(s){let t=ii(s),e=new Uint8Array(512),n=Array.from({length:256},(o,a)=>a);for(let o=255;o>0;o--){let a=Math.floor(t()*(o+1));[n[o],n[a]]=[n[a],n[o]]}for(let o=0;o<512;o++)e[o]=n[o&255];let i=(o,a,l)=>{switch(o&7){case 0:return a+l;case 1:return-a+l;case 2:return a-l;case 3:return-a-l;case 4:return a;case 5:return-a;case 6:return l;default:return-l}},r=o=>o*o*o*(o*(o*6-15)+10);return(o,a)=>{let l=Math.floor(o)&255,c=Math.floor(a)&255;o-=Math.floor(o),a-=Math.floor(a);let h=r(o),u=r(a),d=e[l]+c,f=e[l+1]+c,m=i(e[d],o,a)+h*(i(e[f],o-1,a)-i(e[d],o,a)),v=i(e[d+1],o,a-1)+h*(i(e[f+1],o-1,a-1)-i(e[d+1],o,a-1));return(m+u*(v-m))*.7}}var gE=zg(1337),vE=zg(4242);function Di(s,t,e=4,n=gE){let i=1,r=0,o=0;for(let a=0;a<e;a++)r+=i*n(s,t),o+=i,s*=2.03,t*=2.03,i*=.5;return r/o}function xE(s,t,e=5){let n=1,i=0,r=0,o=1;for(let a=0;a<e;a++){let l=1-Math.abs(vE(s,t));l*=l*o,o=Math.min(1,l*1.8),i+=n*l,r+=n,s*=2.1,t*=2.1,n*=.5}return i/r}var Gl=(s,t,e)=>{let n=Math.min(1,Math.max(0,(e-s)/(t-s)));return n*n*(3-2*n)},ua=-6,fr=-12,Wl=178;function fp(s,t){let e=Math.hypot(s,t*.84);if(e<Wl)return ua;let n=Math.hypot(s,t)||1,i=(s*Vl.x+t*Vl.z)/n,r=ua+4+Di(s/430,t/430,4)*60+Di(s/130+5,t/130,3)*14,o=Gl(420,1250,e)*Gl(.25,-.55,i);r+=Math.pow(xE(s/760,t/760,5),1.6)*520*o+o*40;let a=Gl(330,720,e)*Gl(-.15,.4,i),l=Math.max(0,Di(s/240+7,t/240-3,4)-.18)*160;r=r*(1-a)+(fr-26+l)*a;let c=Gl(Wl,Wl+110,e);return ua+(r-ua)*c}function yE(s,t){return Math.round((s-ua)/t)*t+ua}function _E(s,t,e,n,i){return i<Wl+2?{top:Y.BRICK,under:Y.STONE}:s<fr-10?{top:Y.GRAVEL,under:Y.DEEPSLATE}:s<fr+3?{top:Y.SAND,under:Y.SAND}:s>300-Di(t/90,e/90,2)*40?{top:Y.SNOW,under:Y.STONE}:n>1.25||s>190?{top:Y.STONE,under:Y.STONE}:n>.8&&Di(t/60,e/60,2)>.1?{top:Y.CLAY,under:Y.CLAY}:{top:Y.GRASS,under:Y.DIRT}}function ME(s,t,e){let n=Di(s/300+11,t/300,2),i=pe.clamp(n*.8+(e>120?.25:0),-.4,.5),r=o=>Math.round(o*40)/40;return[r(.92+i*.25),r(1-Math.abs(i)*.1),r(.85-i*.3)]}var Hg=[[1,0],[-1,0],[0,1],[0,-1]];function bE(s,t){return s<330?t.near:s<720?t.near*2:s<1350?t.near*4:t.near*8}function SE(s,t,e,n,i,r,o){let a=Math.round(n/i),l=new Float32Array((a+2)*(a+2)),c=(v,p)=>l[(p+1)*(a+2)+(v+1)];for(let v=-1;v<=a;v++)for(let p=-1;p<=a;p++){let g=t+(p+.5)*i,x=e+(v+.5)*i;l[(v+1)*(a+2)+(p+1)]=yE(fp(g,x),i)}let h=[1,1,1],u=[[0,1],[1,1],[1,0],[0,0]],d=(v,p,g,x,_,y,b)=>{let S=t+v*i,T=t+p*i,M=e+g*i,R=M+i,C=[[S,R],[T,R],[T,M],[S,M]];s.quad(C.map(([I,L])=>[I,x,L]),[0,1,0],C.map(([I,L])=>[I/i,L/i]),_.top,y,b,_.emit,_.rough,_.metal)},f=null,m=()=>{f&&(d(f.i0,f.i1,f.j,f.top,Ko[f.block],[1,1,1,1],f.tint),f=null)};for(let v=0;v<a;v++)for(let p=0;p<a;p++){p===0&&m();let g=t+p*i,x=e+v*i,_=g+i/2,y=x+i/2,b=Math.hypot(_,y*.84);if(b<r.inner){m();continue}let S=c(p,v);if(S<fr-1){m();continue}let T=0;for(let[N,O]of Hg)T=Math.max(T,Math.abs(c(p+N,v+O)-S)/i);let M=_E(S,_,y,T,b),R=M.top===Y.GRASS?ME(_,y,S):h,C=Ko[M.top],I=Ko[M.under],L=[];for(let[N,O]of u){let V=N?1:-1,q=O?1:-1,rt=c(p+V,v)>S?1:0,G=c(p,v+q)>S?1:0,X=c(p+V,v+q)>S?1:0;L.push(1-(rt&&G?3:rt+G+X)*.13)}let k=L[0]===1&&L[1]===1&&L[2]===1&&L[3]===1;k&&f&&f.i1===p&&f.top===S&&f.block===M.top&&f.tint[0]===R[0]&&f.tint[1]===R[1]&&f.tint[2]===R[2]?f.i1=p+1:(m(),k?f={i0:p,i1:p+1,j:v,top:S,block:M.top,tint:R}:d(p,p+1,v,S,C,L,R));for(let N=0;N<4;N++){let[O,V]=Hg[N],q=c(p+O,v+V);if(q>=S)continue;(p+O<0||v+V<0||p+O>=a||v+V>=a)&&(q-=i);let rt=Math.max(q,fr-1);if(rt>=S)continue;let G,X,Q;O===1?(G=[g+i,x],X=[g+i,x+i],Q=[1,0,0]):O===-1?(G=[g,x+i],X=[g,x],Q=[-1,0,0]):V===1?(G=[g+i,x+i],X=[g,x+i],Q=[0,0,1]):(G=[g,x],X=[g+i,x],Q=[0,0,-1]);let _t=ee=>(O!==0?ee[1]:ee[0])/i,St=O!==0?.86:.93,Ht=(ee,J,lt,wt,Xt)=>{s.quad([[G[0],ee,G[1]],[G[0],J,G[1]],[X[0],J,X[1]],[X[0],ee,X[1]]],Q,[[_t(G),ee/i],[_t(G),J/i],[_t(X),J/i],[_t(X),ee/i]],lt,[Xt*St,St,St,Xt*St],wt,0,.9,0)},Vt=S-rt>i*1.5;Ht(Math.max(rt,S-i),S,C.side,R,Vt?.95:.8),Vt&&Ht(rt,S-i,I.side,h,.62)}o&&M.top===Y.GRASS&&T<.5&&b>Wl+30&&o.push(_,S,y,i)}m()}function Xu(s){let t=new Jn(5,9,5);if(s==="oak"){for(let n=0;n<5;n++)t.set(2,n,2,Y.LOG);for(let n=3;n<=4;n++)for(let i=0;i<5;i++)for(let r=0;r<5;r++)(i===0||i===4)&&(r===0||r===4)||i===2&&r===2||t.set(i,n,r,Y.LEAVES);for(let n=1;n<4;n++)for(let i=1;i<4;i++)t.set(n,5,i,Y.LEAVES);for(let[n,i]of[[2,1],[1,2],[2,2],[3,2],[2,3]])t.set(n,6,i,Y.LEAVES)}else{for(let i=0;i<7;i++)t.set(2,i,2,Y.SPRUCE_LOG);let n=(i,r)=>{for(let o=2-r;o<=2+r;o++)for(let a=2-r;a<=2+r;a++)o===2&&a===2&&i<7||t.set(o,i,a,Y.SPRUCE)};n(2,2),n(3,1),n(4,2),n(5,1),n(6,1),n(7,0),n(8,0)}if(s==="oakFar"||s==="spruceFar"){t.cells.fill(0);let n=s==="spruceFar";for(let i=0;i<3;i++)t.set(2,i,2,n?Y.SPRUCE_LOG:Y.LOG);t.box(0,2,0,4,n?7:5,4,n?Y.SPRUCE:Y.LEAVES)}let e=new si;return t.mesh(e,1/5,[-.5,0,-.5],{aoStrength:0}),e.build()}function EE(){return new te({uniforms:{uSky:vi.cube,uFogDensity:vi.density,uSunDir:{value:new E(0,1,0)},uSunColor:{value:new mt(1,1,1)},uTime:{value:0},uDeep:{value:new mt(402490)},uRain:{value:0}},vertexShader:`
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      uniform samplerCube uSky;
      uniform vec3 uSunDir, uSunColor, uDeep;
      uniform float uTime, uFogDensity, uRain;
      varying vec3 vW;
      vec2 wave(vec2 p, vec2 dir, float freq, float speed, float amp) {
        float ph = dot(p, dir) * freq + uTime * speed;
        return dir * cos(ph) * amp * freq;
      }
      void main() {
        vec2 p = vW.xz;
        vec2 g = wave(p, normalize(vec2(0.8, 0.6)), 0.06, 1.1, 0.35) + wave(p, normalize(vec2(-0.5, 0.86)), 0.11, 1.7, 0.18)
               + wave(p, normalize(vec2(0.2, -0.98)), 0.23, 2.3, 0.08) + wave(p, normalize(vec2(-0.9, -0.3)), 0.47, 3.1, 0.04);
        g *= 1.0 + uRain * 0.8;
        vec3 N = normalize(vec3(-g.x, 1.0, -g.y));
        vec3 toCam = cameraPosition - vW;
        float dist = length(toCam);
        vec3 V = toCam / dist;
        // calm the normals with distance to avoid shimmer
        N = normalize(mix(N, vec3(0.0, 1.0, 0.0), clamp(dist / 1600.0, 0.0, 0.85)));
        vec3 R = reflect(-V, N);
        R.y = abs(R.y);
        vec3 refl = textureLod(uSky, R, 1.0).rgb;
        float fres = 0.03 + 0.97 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
        vec3 col = mix(uDeep * (0.25 + 0.75 * textureLod(uSky, vec3(0.0, 1.0, 0.0), 5.0).rgb), refl, fres);
        col += uSunColor * pow(max(dot(R, uSunDir), 0.0), 220.0) * 6.0 * (1.0 - uRain);
        float f = 1.0 - exp(-pow(dist * uFogDensity, 1.6));
        vec3 fd = -V; fd.y = max(fd.y, 0.015);
        col = mix(col, textureLod(uSky, fd, 3.0).rgb, clamp(f, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`})}var kg={high:{near:4,extent:2400,chunk:160,oaks:700,spruces:300,treeNear:600},medium:{near:6,extent:2200,chunk:192,oaks:420,spruces:180,treeNear:480},low:{near:8,extent:1900,chunk:256,oaks:220,spruces:90,treeNear:380}};function Vg(s,t,{inner:e=132}={}){let n={...kg[t]||kg.high,inner:e},i=new se;s.add(i);let r=vs(),o=[],a=n.chunk*4,l=new Map;for(let _=-n.extent;_<n.extent;_+=n.chunk)for(let y=-n.extent;y<n.extent;y+=n.chunk){let b=y+n.chunk/2,S=_+n.chunk/2,T=Math.hypot(b,S),M=Math.hypot(Math.max(0,Math.abs(b)-n.chunk/2),Math.max(0,Math.abs(S)-n.chunk/2));if(M<n.inner*.6&&T<n.inner*.6)continue;let R=bE(M,n),C=`${Math.floor(y/a)},${Math.floor(_/a)}`;l.has(C)||l.set(C,new si),SE(l.get(C),y,_,n.chunk,R,n,o)}let c=[];for(let _ of l.values()){if(!_.quads)continue;let y=new et(_.build(),r);y.receiveShadow=!1,i.add(y),c.push(y)}let h=new et(new Be(n.extent*2.4,n.extent*2.4),EE());h.rotation.x=-Math.PI/2,h.position.y=fr+.4,i.add(h);let u=ii(77),d=[],f=[];for(let _=0;_<o.length;_+=4){let[y,b,S,T]=[o[_],o[_+1],o[_+2],o[_+3]],M=Di(y/180+3,S/180-8,3),R=(M>.05?.55:.05)*(T<=8?1:.6);u()>R||(b>70||M>.32?f:d).push([y+(u()-.5)*T*.6,b,S+(u()-.5)*T*.6])}let m=(_,y,b,S,T)=>{let M=_.length>y?_.filter((N,O)=>O*y%_.length<y):_,R=new hi(b,r,M.length),C=new le,I=new re,L=new E,k=new E;return M.forEach(([N,O,V],q)=>{let rt=S+u()*(T-S);I.setFromAxisAngle(new E(0,1,0),Math.floor(u()*4)*Math.PI/2),L.set(rt*.6,rt,rt*.6),C.compose(k.set(N,O,V),I,L),R.setMatrixAt(q,C)}),R.instanceMatrix.needsUpdate=!0,R.frustumCulled=!1,i.add(R),R},v=_=>_.filter(([y,,b])=>Math.hypot(y,b)<n.treeNear),p=_=>_.filter(([y,,b])=>Math.hypot(y,b)>=n.treeNear),g=m(v(d),n.oaks,Xu("oak"),7,11),x=m(v(f),n.spruces,Xu("spruce"),11,17);return m(p(d),n.oaks*2,Xu("oakFar"),7,11),m(p(f),n.spruces*2,Xu("spruceFar"),11,17),{group:i,water:h,oaks:g,spruces:x,material:r,update(_,y){let b=h.material.uniforms;b.uTime.value+=_,b.uSunDir.value.copy(y.sunDir),b.uSunColor.value.copy(y.colors.sun).multiplyScalar(y.w.day+y.w.sunset)}}}function wE(s,t,{depth:e=1.6,castle:n=!1,trees:i=5,stream:r=!0}={}){let o=ii(t),a=Math.round(s*e),l=4,c=new Jn(2*s+3,a+l+(n?40:14),2*s+3),h=a,u=new Map;for(let m=0;m<c.nz;m++)for(let v=0;v<c.nx;v++){let p=v-s-1,g=m-s-1,x=Math.atan2(g,p),_=s*(.82+.18*Di(Math.cos(x)*1.3+t,Math.sin(x)*1.3,3)*2.2),y=Math.hypot(p,g);if(y>_)continue;let b=y/_,S=h+Math.round(Di(v/9+t,m/9,2)*2+(1-b)*1.5),T=Math.pow(1-b,.75)*a*(.75+.35*Di(v/5-t,m/5,2))+(o()<.05?o()*a*.4:0),M=Math.max(0,Math.round(S-T-1));for(let R=M;R<=S;R++){let C=R===S?Y.GRASS:R>=S-2?Y.DIRT:o()<.06?Y.GRAVEL:Y.STONE;c.set(v,R,m,C)}u.set(v+","+m,S)}let d=(m,v)=>u.get(m+","+v);for(let m=0;m<i;m++){let v=o()*Math.PI*2,p=o()*s*.7,g=Math.round(s+1+Math.cos(v)*p),x=Math.round(s+1+Math.sin(v)*p),_=d(g,x);if(_===void 0||n&&p<s*.55)continue;let y=4+Math.floor(o()*3);for(let b=1;b<=y;b++)c.set(g,_+b,x,Y.LOG);for(let b=y-1;b<=y+2;b++)for(let S=-2;S<=2;S++)for(let T=-2;T<=2;T++)Math.abs(S)+Math.abs(T)+Math.max(0,b-y)*1.5<=3&&c.get(g+S,_+b,x+T)===0&&c.set(g+S,_+b,x+T,Y.LEAVES)}let f=null;if(r){let m=t*2.39,v=[Math.cos(m),Math.sin(m)],p=null;for(let g=0;g<s+4;g+=.5){let x=Math.round(s+1+v[0]*g),_=Math.round(s+1+v[1]*g),y=d(x,_);if(y===void 0)break;c.set(x,y,_,Y.WATER),p={x,z:_,t:y}}p&&(f={x:p.x+v[0]*.8,y:p.t+.9,z:p.z+v[1]*.8,dir:v})}return n&&Gg(c,s+1,h+3,s+1,Math.round(s*.55),o),{grid:c,fall:f,center:[s+1,h,s+1]}}function Gg(s,t,e,n,i,r){for(let c=t-i;c<=t+i;c++)for(let h=n-i;h<=n+i;h++){for(let f=e-3;f<e;f++)s.get(c,f,h)===0&&s.set(c,f,h,Y.COBBLE);if(!(c<=t-i+1||c>=t+i-1||h<=n-i+1||h>=n+i-1)){s.set(c,e-1,h,Y.COBBLE);continue}let d=h>=n+i-1&&Math.abs(c-t)<=1;for(let f=e;f<e+8;f++)d&&f<e+4||s.set(c,f,h,Y.BRICK);(c+h)%2===0&&s.set(c,e+8,h,Y.BRICK)}let a=(c,h,u,d,f)=>{for(let m=c-u;m<=c+u;m++)for(let v=h-u;v<=h+u;v++){if(Math.hypot(m-c,v-h)>u+.4)continue;for(let g=e-3;g<e+d;g++)s.set(m,g,v,Y.BRICK);Math.hypot(m-c,v-h)>u-.6&&(m+v)%2===0&&s.set(m,e+d,v,Y.BRICK)}for(let m=e+4;m<e+d-2;m+=4)for(let[v,p]of[[u,0],[-u,0],[0,u],[0,-u]])s.set(c+v,m,h+p,Y.GLOW);for(let m=0;m<=u+2;m++){let v=u+1-m;for(let p=c-v;p<=c+v;p++)for(let g=h-v;g<=h+v;g++)Math.hypot(p-c,g-h)<=v+.3&&s.set(p,e+d+1+m*1,g,f)}s.set(c,e+d+u+4,h,Y.LOG),s.set(c,e+d+u+5,h,Y.LOG),s.set(c+1,e+d+u+5,h,r()<.5?Y.WOOL_BLUE:Y.WOOL_ORANGE)};for(let c of[-1,1])for(let h of[-1,1])a(t+c*i,n+h*i,2,14,Y.ROOF);let l=3;for(let c=t-l;c<=t+l;c++)for(let h=n-l;h<=n+l;h++){for(let u=e;u<e+20;u++)s.set(c,u,h,Y.BRICK);(c===t-l||c===t+l||h===n-l||h===n+l)&&(c+h)%2===0&&s.set(c,e+20,h,Y.BRICK)}for(let c=e+4;c<e+19;c+=4)for(let h=-1;h<=1;h+=2)s.set(t+h,c,n+l,Y.GLOW),s.set(t+h,c,n-l,Y.GLOW),s.set(t+l,c,n+h,Y.GLOW),s.set(t-l,c,n+h,Y.GLOW);a(t,n,2,26,Y.ROOF)}function TE(){let e=new Jn(21,44,21),n=10;for(let r=0;r<21;r++)for(let o=0;o<21;o++){let a=Math.hypot(r-n,o-n),l=Math.round(5-a*.5+Di(r/4,o/4,2)*2);if(!(a>10))for(let c=0;c<=l;c++)e.set(r,c,o,c===l&&a>5?Y.SAND:Y.STONE)}for(let r=6;r<36;r++)for(let o=n-4;o<=n+4;o++)for(let a=n-4;a<=n+4;a++){let l=Math.hypot(o-n,a-n),c=4-(r-6)/30*1.4;l>c+.4||e.set(o,r,a,Math.floor((r-6)/4)%2?Y.WOOL_ORANGE:Y.QUARTZ)}let i=36;for(let r=n-3;r<=n+3;r++)for(let o=n-3;o<=n+3;o++){let a=Math.hypot(r-n,o-n);a>3.4||(e.set(r,i,o,Y.DARK),a>2.4?(e.set(r,i+1,o,Y.GLASS),e.set(r,i+2,o,Y.GLASS)):(e.set(r,i+1,o,Y.LAMP),e.set(r,i+2,o,Y.LAMP)),e.set(r,i+3,o,Y.DARK),a<2&&e.set(r,i+4,o,Y.DARK))}return{grid:e,lamp:[n+.5,i+1.6,n+.5]}}function RE(){let s=new Jn(26,14,10);for(let t=0;t<26;t++)for(let e=4;e<14;e++)for(let n=0;n<10;n++){let i=(t-12.5)/12.5,r=(e-9)/4.6,o=(n-4.5)/4.6;i*i+r*r+o*o<=1&&s.set(t,e,n,t%6===2?Y.WOOL_ORANGE:Y.WOOL_WHITE)}return s.box(8,1,3,16,3,6,Y.PLANKS),s.box(9,2,3,15,2,3,Y.GLASS),s.box(9,2,6,15,2,6,Y.GLASS),s.box(10,3,4,14,4,5,Y.LOG),s.box(0,7,4,1,11,5,Y.DARK),s.box(0,8,1,1,10,8,Y.DARK),s}function AE(){return new te({transparent:!0,depthWrite:!1,side:Zt,uniforms:{uTime:{value:0},uLight:{value:new mt(1,1,1)}},vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uTime; uniform vec3 uLight;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
      void main() {
        vec2 px = floor(vec2(vUv.x * 8.0, vUv.y * 90.0 + uTime * 26.0));
        float n = hash(px);
        float fromTop = 1.0 - vUv.y;
        vec3 col = mix(vec3(0.24, 0.45, 0.78), vec3(0.85, 0.93, 1.0), step(0.72, n));
        col = mix(col, vec3(0.95), smoothstep(0.55, 1.0, fromTop) * 0.6);
        float a = (0.85 - fromTop * 0.55) * (1.0 - smoothstep(0.62, 1.0, fromTop));
        a *= smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
        gl_FragColor = vec4(col * uLight, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`})}function Wg(s,t){let e=new se;s.add(e);let n=vs(),i=new si,r=[],o=AE(),a=(v,p,g,x,_,y)=>{let b=new Be(_,y);b.translate(0,-y/2,0);let S=new et(b,o);S.position.set(v,p,g),S.rotation.y=Math.atan2(x[0],x[1]),S.renderOrder=3,e.add(S),r.push(S)},l=[{pos:[-330,250,880],R:26,v:3,castle:!0,trees:8,seed:3},{pos:[430,185,760],R:14,v:2.5,trees:6,seed:7},{pos:[180,235,-960],R:18,v:3,trees:7,seed:11},{pos:[-840,165,-260],R:12,v:2.5,trees:4,seed:13},{pos:[780,310,140],R:9,v:2.5,trees:2,seed:17,stream:!1}],c=t==="low";for(let v of l){if(c&&v.R<12)continue;let{grid:p,fall:g,center:x}=wE(v.R,v.seed,{castle:v.castle,trees:v.trees,stream:v.stream!==!1}),_=[v.pos[0]-x[0]*v.v,v.pos[1]-x[1]*v.v,v.pos[2]-x[2]*v.v];p.mesh(i,v.v,_),g&&a(_[0]+g.x*v.v,_[1]+g.y*v.v,_[2]+g.z*v.v,g.dir,v.v*2.2,150+v.R*3)}{let g=fp(560,-640),x=new Jn(44,48,44);for(let _=0;_<44;_++)for(let y=0;y<44;y++)for(let b=0;b<6;b++)x.set(_,b,y,b===5?Y.GRASS:Y.STONE);Gg(x,22,6,22,15,ii(5)),x.mesh(i,2.2,[560-22*2.2,g-6*2.2,-640-22*2.2])}let h=null;{let{grid:g,lamp:x}=TE(),_=1.6,y=[-640-10.5*_,fr-3,860-10.5*_];g.mesh(i,_,y);let b=new zi(14,240,24,1,!0);b.translate(0,-120,0),b.rotateZ(Math.PI/2),h=new et(b,new ue({color:16773572,transparent:!0,opacity:.12,blending:de,depthWrite:!1,side:Zt,fog:!1})),h.position.set(y[0]+x[0]*_,y[1]+x[1]*_,y[2]+x[2]*_),e.add(h)}let u=new et(i.build(),n);e.add(u);let d=(()=>{let v=new si;return RE().mesh(v,1.6,[-20.8,-9.6,-8]),v.build()})(),f=[{r:620,y:230,speed:.012,phase:.6},{r:980,y:300,speed:-.008,phase:2.8}].map(v=>{let p=new et(d,n);return e.add(p),{...v,mesh:p}}),m=0;return{group:e,material:n,update(v,p){m+=v,o.uniforms.uTime.value=m;let g=.35+p.w.day*.75+p.w.sunset*.6;o.uniforms.uLight.value.setScalar(g);for(let x of f){let _=x.phase+m*x.speed;x.mesh.position.set(Math.cos(_)*x.r,x.y+Math.sin(m*.3+x.phase)*4,Math.sin(_)*x.r),x.mesh.rotation.y=-_+(x.speed>0?Math.PI:0)}h&&(h.visible=p.w.night+p.w.sunset*.4>.2,h.rotation.y=m*.6),n.userData.emissiveBoost.value=.35+p.w.night*1.6+p.w.sunset*.5}}}var ql={steps:18,rise:92,depth:150,start:[-60,720]},pp={steps:22,rise:150,depth:170},pr=2900,Nn={offset:7e3,y:6600,inner:6740};function Xl(s,t){let e=document.createElement("canvas");return e.width=s,e.height=t,e}function Yu(s,t=!0){let e=new Xe(s);return e.colorSpace=Te,e.magFilter=en,e.minFilter=ti,t&&(e.wrapS=e.wrapT=bn),e.anisotropy=8,e}function CE(){let e=Xl(512,32),n=e.getContext("2d"),i=99,r=()=>(i=i*16807%2147483647,i/2147483647);n.fillStyle="#15171c",n.fillRect(0,0,512,32),n.fillStyle="#23262e";for(let c=0;c<512;c+=8)n.fillRect(c+1,6,6,10);let o=["#2f62d6","#f07a1c","#2f62d6","#f07a1c","#e8ecf0","#1c1c1c","#8a2a2a","#3a7a3a","#c8b040","#5a5f6e","#2f62d6","#f07a1c"],a=["#d7a98a","#b9845f","#8d5a3b","#5e3b26","#e8c4a6"],l=["#2a1c12","#5a3a1c","#1a1a1a","#c8a050","#7a4a2a"];for(let c=0;c<512;c+=8){if(r()<.08)continue;let h=o[Math.floor(r()*o.length)],u=a[Math.floor(r()*a.length)],d=r()<.2,f=9+Math.floor(r()*3);n.fillStyle=h,n.fillRect(c+1,f+8,6,32-f-8),n.fillStyle=u,n.fillRect(c+2,f+2,4,5),n.fillStyle=l[Math.floor(r()*l.length)],n.fillRect(c+2,f+1,4,2),d&&(n.fillStyle=u,n.fillRect(c,f-3,1,8),n.fillRect(c+7,f-3,1,8),r()<.5&&(n.fillStyle=r()<.5?"#2f62d6":"#f07a1c",n.fillRect(c-1,f-6,10,3)))}return Yu(e)}function PE(){let s=Xl(64,16),t=s.getContext("2d");t.fillStyle="#3a3f4a",t.fillRect(0,0,64,16);for(let e=0;e<64;e+=8)t.fillStyle="#4c5260",t.fillRect(e+1,2,6,8),t.fillStyle="#2a2e36",t.fillRect(e+1,10,6,2);return Yu(s)}function IE(){let s=Xl(64,64),t=s.getContext("2d");for(let i=0;i<64;i+=8)for(let r=0;r<64;r+=16){let o=i/8%2?8:0,a=120+Math.floor(Math.random()*30);t.fillStyle=`rgb(${a},${a},${a+4})`,t.fillRect((r+o)%64,i,16,8),t.fillStyle="rgb(80,80,84)",t.fillRect((r+o)%64,i,16,1),t.fillRect((r+o)%64,i,1,8)}t.fillStyle="#ffd890",t.fillRect(24,20,16,12),t.fillStyle="#3a3020",t.fillRect(31,20,2,12);let e=Xl(64,64),n=e.getContext("2d");return n.fillStyle="#000",n.fillRect(0,0,64,64),n.fillStyle="#ffd890",n.fillRect(24,20,7,12),n.fillRect(33,20,7,12),{map:Yu(s),emit:Yu(e)}}function qg(s,t,e,n,i){let r=[],o=[],a=s,l=t;for(let c=0;c<e;c++)r.push([[a,l],[a,l+n]]),o.push([[a,l+n],[a-i,l+n]]),l+=n,a-=i;return{risers:r,treads:o,end:[a,l]}}function LE(){let e=new Jn(16,76,8),n=5,i=1;for(let o=0;o<64;o++){for(let[a,l]of[[0,0],[5,0],[0,5],[5,5]])e.set(n+a,o,i+l,Y.IRON);if(o%6===0)for(let a=0;a<6;a++)e.set(n+a,o,i,Y.IRON),e.set(n+a,o,i+6-1,Y.IRON),e.set(n,o,i+a,Y.IRON),e.set(n+6-1,o,i+a,Y.IRON);else{let a=o%6;e.set(n+a,o,i,Y.IRON),e.set(n+6-1-a,o,i+6-1,Y.IRON),e.set(n,o,i+a,Y.IRON),e.set(n+6-1,o,i+6-1-a,Y.IRON)}}e.box(0,64,0,15,65,7,Y.DARK);for(let o=66;o<75;o++)for(let a=0;a<16;a++)e.set(a,o,6,Y.DARK),o<74&&a>0&&a<15&&e.set(a,o,7,(a+o)%3===0?Y.DARK:Y.LAMP);e.box(0,75,0,15,75,7,Y.DARK);let r=new si;return e.mesh(r,1.5,[-8*1.5,0,-4*1.5]),r.build()}function Xg({arena:s,root:t,pts:e,stripGeometry:n,teamTint:i,cuttable:r,quality:o,flood:a}){let l=CE(),c=PE(),h=IE(),u=X=>(Q,_t,St)=>{let Ht=i(St,1);return[1-X+Ht[0]*X*1.6,1-X+Ht[1]*X*1.6,1-X+Ht[2]*X*1.6]},d=qg(ql.start[0],ql.start[1],ql.steps,ql.rise,ql.depth),f=[d.end[0]-240,pr],m=qg(f[0],f[1],pp.steps,pp.rise,pp.depth),v=[...d.risers,...m.risers].map(X=>n(e,X,{uLen:3600,vOf:Q=>Q,colorOf:u(.22)})),p=[...d.treads,...m.treads].map(X=>n(e,X,{uLen:450,vOf:Q=>Q,colorOf:u(.35)})),g=r(new Ft({map:l,vertexColors:!0,roughness:.95,emissive:16777215,emissiveMap:l,emissiveIntensity:.05,side:Zt})),x=r(new Ft({map:c,vertexColors:!0,roughness:.9,side:Zt})),_=new et(ha(v),g),y=new et(ha(p),x);for(let X of[...v,...p])X.dispose();_.receiveShadow=y.receiveShadow=!0,s.add(_,y);let b=s.userData.adsTexture,S=new et(n(e,[[d.end[0],d.end[1]],[d.end[0],pr]],{uLen:5200,vOf:X=>X}),r(new Ft({color:328965,emissive:16777215,emissiveMap:b,emissiveIntensity:1.5,side:Zt})));s.add(S);let T=r(new Ft({color:9343900,roughness:.8,side:Zt}));s.add(new et(n(e,[[d.end[0],pr],[f[0],pr]],{uLen:1e3}),T));let M=r(new Ft({vertexColors:!0,roughness:.6,emissive:16777215,emissiveIntensity:0,side:Zt})),R=(X,Q,_t)=>{let St=i(_t,1);return[.15+St[0]*.9,.15+St[1]*.9,.15+St[2]*.9]};s.add(new et(n(e,[[m.end[0],m.end[1]],[m.end[0],Nn.y],[-Nn.offset,Nn.y]],{colorOf:R}),M));let C=r(new ue({vertexColors:!0,fog:!1,side:Zt}));s.add(new et(n(e,[[m.end[0]+2,Nn.y-110],[m.end[0]+2,Nn.y-40]],{colorOf:(X,Q,_t)=>i(_t,3)}),C));let I=r(new Ft({map:h.map,roughness:.9,emissive:16777215,emissiveMap:h.emit,emissiveIntensity:0,side:Zt})),L=new et(n(e,[[-Nn.offset,Nn.y],[-Nn.offset,-600]],{uLen:800,vOf:(X,Q)=>Q/800}),I);s.add(L);let k=r(new Ft({color:2369325,roughness:.9,side:Zt}));s.add(new et(n(e,[[f[0],pr],[-Nn.offset,pr]],{uLen:1e3}),k));let N=vs();N.userData.emissiveBoost.value=1.4;let O=LE(),V=[],q=[[112,126],[-112,126],[112,-126],[-112,-126],[136,0],[-136,0]],rt=(()=>{let X=Xl(64,64),Q=X.getContext("2d"),_t=Q.createRadialGradient(32,32,0,32,32,32);return _t.addColorStop(0,"rgba(255,250,235,1)"),_t.addColorStop(.25,"rgba(255,240,210,0.45)"),_t.addColorStop(1,"rgba(255,230,190,0)"),Q.fillStyle=_t,Q.fillRect(0,0,64,64),new Xe(X)})(),G=new os({map:rt,color:16774368,blending:de,depthWrite:!1,transparent:!0,opacity:.8});for(let[X,Q]of q){let _t=new se;_t.position.set(X,-6,Q),_t.rotation.y=Math.atan2(-X,-Q);let St=new et(O,N);_t.add(St);let Ht=new As(G);Ht.position.set(0,64*1.5+9,6*1.5+3),Ht.scale.setScalar(46),_t.add(Ht),t.add(_t),V.push({group:_t,glow:Ht})}return{crowd:l,profile:{standEdge:[[880,1316],[Math.abs(d.end[0]),d.end[1]],[Math.abs(d.end[0]),pr],[Math.abs(f[0]),pr],[Math.abs(m.end[0]),m.end[1]],[Nn.offset,Nn.y]],roofEdge:[[Nn.offset,Nn.y],[Nn.offset,-600]]},update(X,Q){let _t=Q.w.night,St=Q.w.sunset;I.emissiveIntensity=.15+_t*.9+St*.3,g.emissiveIntensity=.05+_t*.12,G.opacity=.35+_t*.65+St*.35,N.userData.emissiveBoost.value=.8+_t*1.6+St*.6,a&&(a.intensity=Math.max(a.intensity,0))}}}var Yl=class s extends et{constructor(t,e={}){super(t),this.isReflector=!0,this.type="Reflector",this.forceUpdate=!1,this._reflectionCameras=new WeakMap;let n=this,i=e.color!==void 0?new mt(e.color):new mt(8355711),r=e.textureWidth||512,o=e.textureHeight||512,a=e.clipBias||0,l=e.shader||s.ReflectorShader,c=e.multisample!==void 0?e.multisample:4,h=new Ln,u=new E,d=new E,f=new E,m=new le,v=new E(0,0,-1),p=new Ve,g=new E,x=new E,_=new Ve,y=new le,b=new qe(r,o,{samples:c,type:tn}),S=new te({name:l.name!==void 0?l.name:"unspecified",uniforms:qi.clone(l.uniforms),fragmentShader:l.fragmentShader,vertexShader:l.vertexShader});S.uniforms.tDiffuse.value=b.texture,S.uniforms.color.value=i,S.uniforms.textureMatrix.value=y,this.material=S,this.onBeforeRender=function(T,M,R){let C=this.getReflectionCamera(R);if(d.setFromMatrixPosition(n.matrixWorld),f.setFromMatrixPosition(R.matrixWorld),m.extractRotation(n.matrixWorld),u.set(0,0,1),u.applyMatrix4(m),g.subVectors(d,f),g.dot(u)>0===!0&&this.forceUpdate===!1)return;g.reflect(u).negate(),g.add(d),m.extractRotation(R.matrixWorld),v.set(0,0,-1),v.applyMatrix4(m),v.add(f),x.subVectors(d,v),x.reflect(u).negate(),x.add(d),C.position.copy(g),C.up.set(0,1,0),C.up.applyMatrix4(m),C.up.reflect(u),C.lookAt(x),C.far=R.far,C.updateMatrixWorld(),C.projectionMatrix.copy(R.projectionMatrix),y.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),y.multiply(C.projectionMatrix),y.multiply(C.matrixWorldInverse),y.multiply(n.matrixWorld),h.setFromNormalAndCoplanarPoint(u,d),h.applyMatrix4(C.matrixWorldInverse),p.set(h.normal.x,h.normal.y,h.normal.z,h.constant);let L=C.projectionMatrix;C.isOrthographicCamera?(_.x=(Math.sign(p.x)+L.elements[8])/L.elements[0],_.y=(Math.sign(p.y)+L.elements[9])/L.elements[5],_.z=-R.far,_.w=1):(_.x=(Math.sign(p.x)+L.elements[8])/L.elements[0],_.y=(Math.sign(p.y)+L.elements[9])/L.elements[5],_.z=-1,_.w=(1+L.elements[10])/L.elements[14]),p.multiplyScalar(2/p.dot(_)),L.elements[2]=p.x,L.elements[6]=p.y,C.isOrthographicCamera?(L.elements[10]=p.z-a,L.elements[14]=p.w-1):(L.elements[10]=p.z+1-a,L.elements[14]=p.w),n.visible=!1;let k=T.getRenderTarget(),N=T.xr.enabled,O=T.shadowMap.autoUpdate;T.xr.enabled=!1,T.shadowMap.autoUpdate=!1,T.setRenderTarget(b),T.state.buffers.depth.setMask(!0),T.autoClear===!1&&T.clear(),T.render(M,C),T.xr.enabled=N,T.shadowMap.autoUpdate=O,T.setRenderTarget(k);let V=R.viewport;V!==void 0&&T.state.viewport(V),n.visible=!0,this.forceUpdate=!1},this.getRenderTarget=function(){return b},this.dispose=function(){b.dispose(),n.material.dispose()},this.getReflectionCamera=function(T){let M=this._reflectionCameras.get(T);return M===void 0&&(M=T.clone(),this._reflectionCameras.set(T,M)),M}}};Yl.ReflectorShader={name:"ReflectorShader",uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null}},vertexShader:`
		uniform mat4 textureMatrix;
		varying vec4 vUv;

		#include <common>
		#include <logdepthbuf_pars_vertex>

		void main() {

			vUv = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#include <logdepthbuf_vertex>

		}`,fragmentShader:`
		uniform vec3 color;
		uniform sampler2D tDiffuse;
		varying vec4 vUv;

		#include <logdepthbuf_pars_fragment>

		float blendOverlay( float base, float blend ) {

			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

		}

		vec3 blendOverlay( vec3 base, vec3 blend ) {

			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

		}

		void main() {

			#include <logdepthbuf_fragment>

			vec4 base = texture2DProj( tDiffuse, vUv );
			gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`};var Zl={clear:{cover:.52,rain:0,haze:0,storm:!1,wet:0},cloudy:{cover:.76,rain:0,haze:1100,storm:!1,wet:.1},rain:{cover:.86,rain:1,haze:420,storm:!1,wet:.8},storm:{cover:.96,rain:1.5,haze:320,storm:!0,wet:1},fog:{cover:.7,rain:0,haze:130,storm:!1,wet:.25}};function mp(s){return s.haze?{block:Math.max(55e-5,.795/s.haze),scene:Math.max(18e-5,.833/s.haze)}:{block:55e-5,scene:18e-5}}var DE=60,NE=new mt(.7,.75,.85),UE=34;function FE(s){let t=new Float32Array(s*4*4),e=new Float32Array(s*4*2),n=new Uint32Array(s*6);for(let a=0;a<s;a++){let l=[Math.random(),Math.random(),Math.random(),.75+Math.random()*.5];for(let h=0;h<4;h++)t.set(l,(a*4+h)*4),e[(a*4+h)*2]=h&1?1:-1,e[(a*4+h)*2+1]=h&2?1:0;let c=a*4;n.set([c,c+1,c+2,c+1,c+3,c+2],a*6)}let i=new ae;i.setAttribute("position",new ce(new Float32Array(s*4*3),3)),i.setAttribute("aSeed",new ce(t,4)),i.setAttribute("aCorner",new ce(e,2)),i.setIndex(new ce(n,1));let r=new te({transparent:!0,depthWrite:!1,blending:de,side:Zt,fog:!1,uniforms:{uTime:{value:0},uAmount:{value:0},uWind:{value:new nt(2.5,1.2)},uColor:{value:new mt(.55,.62,.72)}},vertexShader:`
      attribute vec4 aSeed;
      attribute vec2 aCorner;
      uniform float uTime, uAmount;
      uniform vec2 uWind;
      varying float vA;
      varying float vU;
      void main() {
        const float B = ${DE.toFixed(1)}, H = ${UE.toFixed(1)};
        vec3 c = cameraPosition;
        float fall = uTime * 26.0 * aSeed.w;
        // world-anchored positions that wrap around the camera
        float y = c.y - H * 0.4 + fract(aSeed.z - (fall + c.y) / H) * H;
        vec2 drift = uWind * (fall / 26.0);
        float x = c.x + (fract(aSeed.x + (drift.x - c.x) / B) - 0.5) * B;
        float z = c.z + (fract(aSeed.y + (drift.y - c.z) / B) - 0.5) * B;
        vec3 top = vec3(x, y, z);
        float len = 0.95 * aSeed.w;
        vec3 dir = normalize(vec3(uWind.x, -26.0, uWind.y) / 26.0);
        vec3 p = top + dir * len * aCorner.y;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        vec4 mvTop = viewMatrix * vec4(top, 1.0);
        vec4 mvBot = viewMatrix * vec4(top + dir * len, 1.0);
        vec2 sd = normalize(mvBot.xy - mvTop.xy + vec2(1e-5, 0.0));
        // about a pixel wide at any distance
        mv.xy += vec2(-sd.y, sd.x) * aCorner.x * max(0.01, -mv.z * 0.0035);
        gl_Position = projectionMatrix * mv;
        float d = length(p - c);
        float show = step(aSeed.x * 0.37 + aSeed.y * 0.63, uAmount);
        vA = show * step(0.05, p.y) * (1.0 - smoothstep(B * 0.2, B * 0.5, d)) * smoothstep(0.6, 2.5, d);
        vU = aCorner.x;
      }`,fragmentShader:`
      uniform vec3 uColor;
      varying float vA;
      varying float vU;
      void main() {
        if (vA <= 0.0) discard;
        gl_FragColor = vec4(uColor * vA * (1.0 - abs(vU)) * 1.1, 1.0);
      }`}),o=new et(i,r);return o.frustumCulled=!1,o.renderOrder=5,o}function Yg(){let s=[],t=0,e=0,n=22;for(let h=0;h<=n;h++)s.push(new E(t,e,0)),e-=1/n,t+=(Math.random()-.5)*.09;let i=[];for(let h=0;h<3;h++){let u=3+Math.floor(Math.random()*12),d=[s[u].clone()],f=d[0].x,m=d[0].y,v=Math.random()<.5?-1:1;for(let p=0;p<6;p++)f+=v*.03+(Math.random()-.5)*.03,m-=.03,d.push(new E(f,m,0));i.push(d)}let r=[],o=[],a=[],l=(h,u,d)=>{let f=r.length/3;h.forEach(m=>{r.push(m.x-u,m.y,0,m.x+u,m.y,0),o.push(d,d)});for(let m=0;m<h.length-1;m++){let v=f+m*2;a.push(v,v+1,v+2,v+1,v+3,v+2)}};l(s,.006,1),l(s,.03,.18);for(let h of i)l(h,.004,.7);let c=new ae;return c.setAttribute("position",new zt(r,3)),c.setAttribute("aA",new zt(o,1)),c.setIndex(a),c}var Zu=class{constructor(t,e,n,i){this.kind=Zl[n]?n:"clear",this.cfg=Zl[this.kind],this.time=0,this.flash=0,this.nextStrike=4+Math.random()*6,this.onThunder=null,this.group=new se,t.add(this.group),this.cfg.rain>0&&(this.rain=FE(e==="high"?9e3:e==="medium"?6e3:3e3),this.rain.material.uniforms.uAmount.value=Math.min(1,this.cfg.rain),this.rain.layers.set(i),this.group.add(this.rain)),this.cfg.storm&&(this.boltMat=new te({transparent:!0,depthWrite:!1,blending:de,fog:!1,side:Zt,uniforms:{uI:{value:0}},vertexShader:"attribute float aA; varying float vA; void main() { vA = aA; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:"uniform float uI; varying float vA; void main() { gl_FragColor = vec4(vec3(0.75, 0.82, 1.0) * 4.0 * vA * uI, 1.0); }"}),this.bolt=new et(Yg(),this.boltMat),this.bolt.visible=!1,this.bolt.frustumCulled=!1,this.bolt.layers.set(i),this.group.add(this.bolt))}update(t,e){if(this.time+=t,this.rain){let n=this.rain.material.uniforms;n.uTime.value=this.time,n.uColor.value.copy(e.colors.horizon).lerp(NE,.5).multiplyScalar(.55+e.w.day*.4+this.flash*2)}if(this.cfg.storm){this.nextStrike-=t,this.nextStrike<=0&&this.strike(),this.flash=Math.max(0,this.flash-t*2.6);let n=this.flash>0?this.flash*(.6+.4*Math.sin(this.time*47)*Math.sin(this.time*23)):0;return e.flash=Math.max(e.flash,n*1.3),this.boltMat.uniforms.uI.value=n,this.bolt.visible=n>.03,n}return 0}strike(){this.nextStrike=5+Math.random()*11,this.flash=1,this.bolt.geometry.dispose(),this.bolt.geometry=Yg();let t=Math.random()*Math.PI*2,e=350+Math.random()*550,n=520+Math.random()*240;this.bolt.position.set(Math.cos(t)*e,n,Math.sin(t)*e),this.bolt.scale.set(n*1.1,n,1),this.bolt.rotation.y=Math.atan2(-Math.cos(t),-Math.sin(t)),this.onThunder&&this.onThunder(1-(e-350)/550*.7,e/340)}dispose(){this.group.removeFromParent(),this.rain&&(this.rain.geometry.dispose(),this.rain.material.dispose()),this.bolt&&(this.bolt.geometry.dispose(),this.boltMat.dispose())}};var xp=1,Kl=2;function BE(s,t){let e=new nt;s.getDrawingBufferSize(e);let n=t==="high"?2:3,i=(()=>{let h=new Uint8Array(16384);for(let d=0;d<4096;d++)h[d*4]=Math.random()*255,h[d*4+1]=Math.random()*255,h[d*4+2]=0,h[d*4+3]=255;let u=new Er(h,64,64);return u.wrapS=u.wrapT=bn,u.magFilter=cn,u.needsUpdate=!0,u})(),r={name:"WetPitch",uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null},tNoise:{value:i},uWet:{value:.4},uTime:{value:0},uRain:{value:0},uTexel:{value:new nt(1/512,1/512)}},vertexShader:`
      uniform mat4 textureMatrix;
      varying vec4 vUv; varying vec2 vP; varying vec3 vW;
      void main() {
        vUv = textureMatrix * vec4(position, 1.0);
        vP = position.xy / ${.01.toFixed(4)};
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      uniform sampler2D tDiffuse, tNoise;
      uniform float uWet, uTime, uRain;
      uniform vec2 uTexel;
      varying vec4 vUv; varying vec2 vP; varying vec3 vW;
      void main() {
        vec2 a = abs(vP);
        if (a.x > ${(mr-sn).toFixed(1)} || a.y > ${(ln-sn).toFixed(1)} || a.x + a.y > ${(mr+ln-kt.chamfer-sn*.6).toFixed(1)}) discard;
        // slow, broad ripples in the wet turf; raindrops add fine ones
        vec2 n = texture2D(tNoise, vP / 1100.0).rg + texture2D(tNoise, vP / 420.0 + uTime * 0.004).rg * 0.5 - 0.75;
        n += (texture2D(tNoise, vP / 90.0 + vec2(uTime * 0.9, uTime * 0.7)).rg - 0.5) * uRain * 0.8;
        vec4 uv = vUv;
        uv.xy += n * 0.007 * uv.w;
        // soft five-tap blur: grass is never a perfect mirror
        vec2 o = uTexel * 1.7 * uv.w;
        vec3 refl = texture2DProj(tDiffuse, uv).rgb * 2.0
          + texture2DProj(tDiffuse, uv + vec4(o.x, 0.0, 0.0, 0.0)).rgb + texture2DProj(tDiffuse, uv - vec4(o.x, 0.0, 0.0, 0.0)).rgb
          + texture2DProj(tDiffuse, uv + vec4(0.0, o.y, 0.0, 0.0)).rgb + texture2DProj(tDiffuse, uv - vec4(0.0, o.y, 0.0, 0.0)).rgb;
        refl = min(refl / 6.0, vec3(1.3)); // keep floodlight glints from blooming into blotches
        vec3 V = normalize(cameraPosition - vW);
        float fres = 0.04 + 0.96 * pow(1.0 - clamp(V.y, 0.0, 1.0), 4.0);
        float edge = smoothstep(0.0, 260.0, ${(mr-sn).toFixed(1)} - a.x) * smoothstep(0.0, 260.0, ${(ln-sn).toFixed(1)} - a.y);
        gl_FragColor = vec4(refl * vec3(0.85, 0.95, 0.9), uWet * mix(0.1, 0.62, fres) * edge);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`},o=new Be(2*mr*.01,2*ln*.01),a=new Yl(o,{textureWidth:Math.round(e.x/n),textureHeight:Math.round(e.y/n),clipBias:.003,multisample:0,shader:r});a.material.transparent=!0,a.material.depthWrite=!1,a.rotation.x=-Math.PI/2,a.position.y=t==="high"?.085:.03,a.renderOrder=1;let l=a.getReflectionCamera;return a.getReflectionCamera=c=>{let h=l.call(a,c);return h.layers.mask=c.layers.mask&~(1<<xp|1<<Kl),h},a.fitTo=c=>{c.getDrawingBufferSize(e);let h=Math.round(e.x/n),u=Math.round(e.y/n),d=a.getRenderTarget();(d.width!==h||d.height!==u)&&d.setSize(h,u),a.material.uniforms.uTexel.value.set(1/h,1/u)},a}var{halfX:mr,halfZ:ln,height:gp,rampR:sn,goalHalfW:In,goalH:an,goalDepth:Vn}=kt,vp={night:{skyTop:132623,skyHorizon:1781594,skyBottom:263949,sunDir:[.25,.75,-.6],sunColor:10467583,sunGlow:0,stars:1,hemiSky:10467583,hemiGround:2042392,hemi:.75,key:15134463,keyI:2.4,keyDir:[.35,1,.25],fog:726320,fogDensity:.0011,envI:.75,exposure:1.05,winLit:.55,bldg:461330},sunset:{skyTop:2112120,skyHorizon:16754282,skyBottom:2759200,sunDir:[.78,.07,.62],sunColor:16756848,sunGlow:1,stars:0,hemiSky:16767416,hemiGround:2892055,hemi:.85,key:16760970,keyI:3.2,keyDir:[.75,.32,.58],fog:11565672,fogDensity:.0012,envI:.9,exposure:1,winLit:.3,bldg:1709600}};function Zg(s){return new te({side:fn,depthWrite:!1,fog:!1,uniforms:{uTop:{value:new mt(s.skyTop)},uHorizon:{value:new mt(s.skyHorizon)},uBottom:{value:new mt(s.skyBottom)},uSunDir:{value:new E(...s.sunDir).normalize()},uSunColor:{value:new mt(s.sunColor)},uSunGlow:{value:s.sunGlow},uStars:{value:s.stars}},vertexShader:`
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
      }`})}function OE(s){return new te({uniforms:{uBase:{value:new mt(s.bldg)},uWin:{value:new mt(1,.82,.55)},uLit:{value:s.winLit},uFog:{value:new mt(s.fog)},uFogD:{value:s.fogDensity*.55},uSunDir:{value:new E(...s.sunDir).normalize()},uSunColor:{value:new mt(s.sunColor).multiplyScalar(s.sunGlow)}},vertexShader:`
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
      }`})}function oi(s,t,{uLen:e=1e3,vOf:n=(o,a)=>a/1e3,skip:i=null,colorOf:r=null}={}){let o=s.concat([{...s[0],s:s.total}]),a=o.length,l=t.length,c=new Float32Array(a*l*3),h=new Float32Array(a*l*2),u=r?new Float32Array(a*l*3):null,d=new Float32Array(l),f=[];for(let p=0;p<a;p++){let g=o[p];for(let x=0;x<l;x++){let[_,y]=t[x],b=g.x+g.nx*_,S=g.z+g.nz*_;p>0&&(d[x]+=Math.hypot(b-f[x][0],S-f[x][1])),f[x]=[b,S];let T=p*l+x;if(c[T*3]=b,c[T*3+1]=y,c[T*3+2]=S,h[T*2]=d[x]/e,h[T*2+1]=n(x,y),u){let M=r(b,y,S);u[T*3]=M[0],u[T*3+1]=M[1],u[T*3+2]=M[2]}}}let m=[];for(let p=0;p<a-1;p++)for(let g=0;g<l-1;g++){if(i&&i(o[p],o[p+1],t[g],t[g+1]))continue;let x=p*l+g,_=(p+1)*l+g,y=(p+1)*l+g+1,b=p*l+g+1;m.push(x,b,_,_,b,y)}let v=new ae;return v.setAttribute("position",new ce(c,3)),v.setAttribute("uv",new ce(h,2)),u&&v.setAttribute("color",new ce(u,3)),v.setIndex(m),v.computeVertexNormals(),v}var yp=s=>s.wall==="orange"||s.wall==="blue";function da(s,t=.5){return(e,n,i,r)=>yp(e)&&yp(n)&&Math.abs(e.x)<=In+t&&Math.abs(n.x)<=In+t&&Math.max(i[1],r[1])<=s+.5}function $l(s,t=1){let e=pe.smoothstep(s,-2500,2500),n=new mt(Se[0].main),i=new mt(Se[1].main),r=n.lerp(i,e);return[r.r*t,r.g*t,r.b*t]}function $g(s,t){let e=[];for(let a of s){let l=a.x+a.nx*t,c=a.z+a.nz*t;if(yp(a)){let h=a.wall==="orange"?1:-1,u=h>0?In:-In;if(Math.abs(a.x-u)<.5){e.push([l,c],[u,h*(ln+Vn)],[-u,h*(ln+Vn)]);continue}if(Math.abs(a.x)<In-.5)continue}e.push([l,c])}let n=new Vi(e.map(([a,l])=>new nt(a,-l))),i=new Ja(n);i.rotateX(-Math.PI/2);let r=i.attributes.position,o=i.attributes.uv;for(let a=0;a<r.count;a++)o.setXY(a,(r.getX(a)+mi.halfX)/(2*mi.halfX),(r.getZ(a)-mi.minZ)/(mi.maxZ-mi.minZ));return i}function Kg(s,t,e){let n=e.theme!=="classic",i=n?vp.sunset:vp[e.timeOfDay]||vp.sunset,r=e.quality,o=new se,a=new se;a.scale.setScalar(.01),o.add(a),t.add(o);let l=[],c=[new Ln(new E(1,0,0),0),new Ln(new E(-1,0,0),0),new Ln(new E(0,0,-1),0)],h=F=>(F.clippingPlanes=c,F.clipIntersection=!0,F);t.fog=new Fa(i.fog,i.fogDensity*.35);let u=new le,d,f,m=null;if(n){let F=Zl[e.weather]||Zl.clear,U=new qu(s,t,r,{time:e.timeOfDay,weather:e.weather});U.setWeather(F.cover),vi.density.value=mp(F).block;let st=new Zu(o,r,e.weather,xp),ht=Vg(o,r,{inner:30}),gt=Wg(o,r);for(let D of[ht.group,gt.group])D.traverse(j=>j.layers.set(xp));m={sky:U,terrain:ht,features:gt,weather:st,wcfg:F},d=ht.oaks,f=ht.group}else{let F=new et(new yn(2500,48,24),Zg(i));F.renderOrder=-10,F.frustumCulled=!1,o.add(F);let U=qo(42),st=new De(1,1,1);st.translate(0,.5,0);let ht=190;d=new hi(st,OE(i),ht);for(let gt=0;gt<ht;gt++){let D=U()*Math.PI*2,j=170+U()*380+(U()<.3?250:0),W=18+U()*40,pt=18+U()*40,xt=30+Math.pow(U(),2)*260+(j>400?60:0);u.compose(new E(Math.cos(D)*j,-5,Math.sin(D)*j*1.2),new re().setFromAxisAngle(new E(0,1,0),U()*.6),new E(W,xt,pt)),d.setMatrixAt(gt,u)}o.add(d),f=new et(new ki(1400,48),new Ft({color:855826,roughness:1})),f.rotation.x=-Math.PI/2,f.position.y=-6,o.add(f)}let v=new tl(i.hemiSky,i.hemiGround,i.hemi);o.add(v);let p=new Co(i.key,i.keyI),g=new E(...i.keyDir).normalize();if(p.position.copy(g).multiplyScalar(90),p.target.position.set(0,0,0),o.add(p,p.target),r!=="low"){p.castShadow=!0;let F=r==="high"?2048:1024;p.shadow.mapSize.set(F,F);let U=p.shadow.camera;U.left=-60,U.right=60,U.top=70,U.bottom=-70,U.near=10,U.far=220,p.shadow.bias=-4e-4,p.shadow.normalBias=.02}let x=new Co(15922687,0);x.position.set(-20,100,30),o.add(x);let _=zo(200,6),y=Qm(r),b=tg(),S=b.clone();S.repeat.set(40,58),S.needsUpdate=!0;let T=$g(_,sn),M=new Ft({map:y,roughness:.92,metalness:0,bumpMap:S,bumpScale:.6}),R=new et(T,M);R.receiveShadow=!0,a.add(R);let C=n&&r!=="low"?BE(s,r):null;if(C&&o.add(C),r==="high"){let F=b.clone();F.repeat.set(32,47),F.needsUpdate=!0;let U=5;for(let st=1;st<=U;st++){let ht=new Ft({map:y,alphaMap:F,alphaTest:.25+st/U*.55,roughness:.95,color:new mt().setScalar(.85+st*.05)}),gt=new et(T,ht);gt.position.y=st*1.4,gt.receiveShadow=!0,a.add(gt)}}let I=[];for(let F=0;F<=10;F++){let U=Math.PI/2*(1-F/10);I.push([sn-sn*Math.cos(U),sn-sn*Math.sin(U)])}let L=new Ft({color:1777703,roughness:.55,metalness:.35,vertexColors:!0,side:Zt}),k=new et(oi(_,I,{uLen:400,skip:da(an),colorOf:(F,U,st)=>{let ht=$l(st,.35);return[.55+ht[0],.55+ht[1],.55+ht[2]]}}),L);k.receiveShadow=!0,a.add(k);let N=[[0,sn-4],[0,sn+14]],O=new et(oi(_,N,{skip:da(an),colorOf:(F,U,st)=>$l(st,4)}),new ue({vertexColors:!0,side:Zt,fog:!1}));a.add(O);let V=xu(),q=sn+230,rt=new et(oi(_,[[0,sn+14],[0,q]],{uLen:4200,vOf:F=>F,skip:da(an)}),new Ft({color:1118481,emissive:16777215,emissiveMap:V,emissiveIntensity:1.1,map:V,roughness:.4,side:Zt}));a.add(rt),l.push(F=>{V.offset.x=(V.offset.x+F*.012)%1});let G=$f(3),X=[[0,q],[0,an],[0,1100],[0,gp-sn]];for(let F=1;F<=8;F++){let U=Math.PI/2*(F/8);X.push([sn-sn*Math.cos(U),gp-sn+sn*Math.sin(U)])}let Q=new Ft({color:8365784,emissive:10275071,emissiveMap:G,emissiveIntensity:.16,alphaMap:G,transparent:!0,opacity:.32,depthWrite:!1,roughness:.1,metalness:.2,side:Zt});G.repeat.set(1,1);let _t=new et(oi(_,X,{uLen:900,vOf:(F,U)=>U/1040,skip:da(an)}),Q);_t.renderOrder=2,a.add(_t);let St=new et(_t.geometry,new ue({color:4880568,transparent:!0,opacity:.045,depthWrite:!1,side:Zt}));St.renderOrder=1,a.add(St);let Ht=$g(_.map(F=>({...F,wall:"side"})),sn);Ht.translate(0,gp,0);let Vt=Ht.attributes.uv;for(let F=0;F<Vt.count;F++)Vt.setXY(F,Ht.attributes.position.getX(F)/900,Ht.attributes.position.getZ(F)/1040);let ee=new et(Ht,Q.clone());ee.material.opacity=.07,ee.material.emissiveIntensity=.05,ee.renderOrder=2,a.add(ee);let J=[];for(let F of[1,-1])for(let U of[1,-1]){let st=U*In,ht=[st,0,F*ln];for(let gt=0;gt<I.length-1;gt++){let[D,j]=I[gt],[W,pt]=I[gt+1];J.push(...ht,st,j,F*(ln-D),st,pt,F*(ln-W))}}let lt=new ae;lt.setAttribute("position",new zt(J,3)),lt.computeVertexNormals(),a.add(new et(lt,new Ft({color:2764856,roughness:.6,metalness:.3,side:Zt})));let wt=[],Xt=[];for(let F of[0,1]){let U=F===0?-1:1,st=Se[F],ht=new se,gt=$f(4,256);gt.repeat.set(Vn/300,an/300);let D=new Ft({color:658448,emissive:st.main,emissiveMap:gt,emissiveIntensity:1.4,roughness:.6,metalness:.2,side:Zt}),j=gt.clone();j.repeat.set(2*In/300,an/300),j.needsUpdate=!0;let W=D.clone();W.emissiveMap=j;let pt=new et(new Be(Vn,an),D);pt.rotation.y=Math.PI/2,pt.position.set(In,an/2,U*(ln+Vn/2));let xt=pt.clone();xt.position.x=-In;let at=new et(new Be(2*In,an),W);at.position.set(0,an/2,0);let Nt=new se;Nt.position.set(0,0,U*(ln+Vn)),Nt.add(at);let It=gt.clone();It.repeat.set(2*In/300,Vn/300),It.needsUpdate=!0;let ge=D.clone();ge.emissiveMap=It,ge.emissiveIntensity=.8;let fe=new et(new Be(2*In,Vn),ge);fe.rotation.x=Math.PI/2,fe.position.set(0,an,U*(ln+Vn/2)),ht.add(pt,xt,Nt,fe),Xt.push({hinge:Nt,s:U});let Mn=new Ft({color:2236962,emissive:st.main,emissiveIntensity:4.5,roughness:.3,metalness:.6}),he=new Ft({color:2764083,emissive:st.main,emissiveIntensity:1.2,roughness:.4,metalness:.7}),Gn=new De(46,an+46,46);for(let Gr of[-1,1]){let pa=new et(Gn,Mn);pa.position.set(Gr*(In+23),(an+46)/2,U*(ln+23)),ht.add(pa);let Ki=new et(new De(36,an,36),he);Ki.position.set(Gr*(In+18),an/2,U*(ln+Vn)),ht.add(Ki);let Wr=new et(new De(30,30,Vn),he);Wr.position.set(Gr*(In+15),an+15,U*(ln+Vn/2)),ht.add(Wr)}let Qn=new et(new De(2*In+92,46,46),Mn);Qn.position.set(0,an+23,U*(ln+23));let Rn=new et(new De(2*In+72,30,30),he);Rn.position.set(0,an+15,U*(ln+Vn)),ht.add(Qn,Rn);let Us=new et(new De(2*In+500,70,80),he);Us.position.set(0,an+260,U*(ln+60)),ht.add(Us),a.add(ht);let fa=new il(st.main,0,40,2);fa.position.set(0,3.5,U*(ln+Vn*.6)*.01),o.add(fa),wt.push({light:fa,frameMat:Mn,netMat:[D,W,ge],base:4.5})}let Ct=h(new Ft({color:1382430,roughness:.8,metalness:.3,side:Zt})),Kt=new et(oi(_,[[-60,0],[-60,an+40],[-60,720]],{uLen:4200,vOf:F=>F===0?0:F===1?.5:1,skip:da(an+40,60)}),Ct);a.add(Kt);let me,ct=null,yt=n?Nn.offset-60:5950,bt=n?Nn.y:4650;if(n){let F=xu();a.userData.adsTexture=F,l.push(U=>{F.offset.x=(F.offset.x-U*.02)%1}),ct=Xg({arena:a,root:o,pts:_,stripGeometry:oi,teamTint:$l,cuttable:h,quality:r,flood:x}),me=ct.crowd}else{me=eg();let F=h(new Ft({map:me,roughness:.95,emissive:16777215,emissiveMap:me,emissiveIntensity:.07,side:Zt})),U=[[-60,720],[-1200,1240],[-2300,1760],[-3300,2300]],st=[[-3300,2780],[-4200,3250],[-5100,3720],[-5900,4150]],ht=he=>{let Gn=0,Qn=[0];for(let Rn=1;Rn<he.length;Rn++)Gn+=Math.hypot(he[Rn][0]-he[Rn-1][0],he[Rn][1]-he[Rn-1][1]),Qn.push(Gn);return Rn=>Qn[Rn]/900};a.add(new et(oi(_,U,{uLen:3400,vOf:ht(U)}),F)),a.add(new et(oi(_,st,{uLen:3400,vOf:ht(st)}),F));let gt=xu(),D=new et(oi(_,[[-3300,2300],[-3300,2780]],{uLen:5200,vOf:he=>he}),h(new Ft({color:328965,emissive:16777215,emissiveMap:gt,emissiveIntensity:1.6,side:Zt})));a.add(D),l.push(he=>{gt.offset.x=(gt.offset.x-he*.02)%1}),a.add(new et(oi(_,[[-5900,4150],[-5900,4650]],{uLen:2e3}),Ct));let j=h(new ue({vertexColors:!0,fog:!1,side:Zt}));a.add(new et(oi(_,[[-5900,4650],[-5900,4700]],{colorOf:(he,Gn,Qn)=>$l(Qn,2.2)}),j));let W=h(new Ft({color:921620,roughness:.8,metalness:.4,side:Zt}));a.add(new et(oi(_,[[-6500,5350],[-4200,5220],[-1900,5120]],{uLen:2e3}),W)),a.add(new et(oi(_,[[-1900,5120],[-1900,5020]],{uLen:2e3}),Ct));let pt=new Ft({color:1711394,roughness:.6,metalness:.7}),xt=h(new ue({color:new mt(4.2,4.2,4),fog:!1})),at=[-3700,-1250,1250,3700],Nt=new De(150,14,60),It=at.length*30+160,ge=new hi(Nt,xt,It),fe=0;for(let he of at){let Gn=new et(new De(2*mr+4400,200,140),pt);Gn.position.set(0,5560,he),a.add(Gn);let Qn=new et(new De(2*mr+4400,60,60),pt);Qn.position.set(0,5180,he),a.add(Qn);for(let Rn=0;Rn<30;Rn++){let Us=-mr-1300+Rn*(2*mr+2600)/29;u.makeTranslation(Us,5140,he),ge.setMatrixAt(fe++,u)}}let Mn=zo(420,3);for(let he of Mn){if(fe>=It)break;let Gn=he.x-he.nx*1950,Qn=he.z-he.nz*1950;u.makeRotationY(Math.atan2(he.nx,he.nz)),u.setPosition(Gn,5010,Qn),ge.setMatrixAt(fe++,u)}ge.count=fe,a.add(ge)}let Mt=[];{let F=new Ft({color:1316636,roughness:.5,metalness:.8});for(let U of[1,-1]){let st=document.createElement("canvas");st.width=1024,st.height=480;let ht=new Xe(st);ht.colorSpace=Te;let gt=new se,D=3600,j=1690,W=new et(new Be(D,j),new ue({map:ht,color:new mt(1.5,1.5,1.5),fog:!1})),pt=new et(new De(D+160,j+160,120),F);pt.position.z=-70,gt.add(pt,W);for(let xt of[-1,1]){let at=new et(new De(120,2e3,120),F);at.position.set(xt*D*.35,-j/2-1e3,-60),gt.add(at)}n?(gt.position.set(0,8700,U*(ln+6200)),gt.scale.setScalar(1.5)):gt.position.set(0,4300,U*(ln+4e3)),gt.rotation.order="YXZ",gt.rotation.y=U>0?Math.PI:0,gt.rotation.x=.12,a.add(gt),Mt.push({c:st,tex:ht,ctx:st.getContext("2d"),group:gt,end:U})}}let Rt="";function Jt(F,U,st,ht){let gt=`${F}|${U}|${st}|${ht}`;if(gt!==Rt){Rt=gt;for(let D of Mt){let j=D.ctx,W=D.c.width,pt=D.c.height,xt=j.createLinearGradient(0,0,0,pt);xt.addColorStop(0,"#0a1430"),xt.addColorStop(1,"#03060f"),j.fillStyle=xt,j.fillRect(0,0,W,pt),j.textAlign="center",j.textBaseline="middle",ht?(j.fillStyle=ht==="blue"?"#2f7bff":"#ff7a1a",j.fillRect(0,0,W,pt),j.fillStyle="#fff",j.font="italic 900 220px Arial Black, Arial, sans-serif",j.fillText("GOAL!!",W/2,pt/2+10)):(j.fillStyle="#9fc4ff",j.font="bold 44px Arial, sans-serif",j.fillText("ROCKET ARENA",W/2,52),j.fillStyle="#1f5fe0",j.fillRect(70,110,330,250),j.fillStyle="#e8621a",j.fillRect(W-400,110,330,250),j.fillStyle="#fff",j.font="italic 900 190px Arial Black, Arial, sans-serif",j.fillText(String(F),235,245),j.fillText(String(U),W-235,245),j.font="bold 40px Arial, sans-serif",j.fillText("BLUE",235,400),j.fillText("ORANGE",W-235,400),j.font="bold 110px Arial, sans-serif",j.fillText(st,W/2,245)),j.fillStyle="rgba(0,0,0,0.18)";for(let at=0;at<pt;at+=4)j.fillRect(0,at,W,1);D.tex.needsUpdate=!0}}}Jt(0,0,"5:00",null);let $t={value:0};{let F=[["#1f5fe0","#ffffff","#e8621a"],["#c8102e","#ffffff","#003da5"],["#009246","#ffffff","#ce2b37"],["#000000","#dd0000","#ffce00"],["#ff7a1a","#ffffff","#2f7bff"],["#0055a4","#ffffff","#ef4135"],["#ffcc00","#00843d","#00843d"],["#2f7bff","#2f7bff","#ffffff"]],ht=h(new Ft({color:10133930,metalness:.9,roughness:.3})),gt=zo(1100,2),D=new Fe(9,9,520,6),j=new hi(D,ht,gt.length),W=F.map(()=>[]);gt.forEach((pt,xt)=>{let at=pt.x-pt.nx*yt,Nt=pt.z-pt.nz*yt;u.makeTranslation(at,bt+260,Nt),j.setMatrixAt(xt,u);let It=new Be(300,190,8,1);It.translate(300/2,0,0),It.rotateY(Math.atan2(pt.nx,pt.nz)),It.translate(at,bt+420,Nt),W[xt%F.length].push(It)}),a.add(j),F.forEach((pt,xt)=>{if(!W[xt].length)return;let at=document.createElement("canvas");at.width=96,at.height=64;let Nt=at.getContext("2d"),It=xt%2===0;pt.forEach((he,Gn)=>{Nt.fillStyle=he,It?Nt.fillRect(Gn*32,0,32,64):Nt.fillRect(0,Gn*21.4,96,21.4)});let ge=new Xe(at);ge.colorSpace=Te;let fe=h(new Ft({map:ge,side:Zt,roughness:.9,emissive:16777215,emissiveMap:ge,emissiveIntensity:.15}));fe.onBeforeCompile=he=>{he.uniforms.uTime=$t,he.vertexShader=`uniform float uTime;
`+he.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
          float wave = sin(uTime * 3.0 + position.x * 0.01 + position.z * 0.01 + uv.x * 5.0) * 45.0 * uv.x;
          transformed.y += wave * 0.6;
          transformed.x += wave * 0.4;
          transformed.z += wave * 0.4;`)};let Mn=ha(W[xt]);a.add(new et(Mn,fe))})}if(l.push(F=>{$t.value+=F}),i.stars&&!n){let F=document.createElement("canvas");F.width=4,F.height=256;let U=F.getContext("2d"),st=U.createLinearGradient(0,0,0,256);st.addColorStop(0,"rgba(255,255,255,0)"),st.addColorStop(.7,"rgba(255,255,255,0.35)"),st.addColorStop(1,"rgba(255,255,255,1)"),U.fillStyle=st,U.fillRect(0,0,4,256);let ht=new Xe(F),gt=new Fe(9,.8,420,24,1,!0);gt.translate(0,210,0);let D=new ue({map:ht,color:9418495,transparent:!0,opacity:.07,blending:de,depthWrite:!1,side:Zt,fog:!1}),j=[];for(let pt=0;pt<6;pt++){let xt=pt/6*Math.PI*2+.3,at=new et(gt,D);at.position.set(Math.cos(xt)*125,5,Math.sin(xt)*150),at.renderOrder=3,o.add(at),j.push({beam:at,a:xt,phase:pt*1.7})}let W=0;l.push(pt=>{W+=pt;for(let xt of j)xt.beam.rotation.set(0,0,0),xt.beam.rotateY(xt.a+Math.sin(W*.25+xt.phase)*.6),xt.beam.rotateZ(-.55-Math.sin(W*.31+xt.phase)*.2)})}{let F=document.createElement("canvas");F.width=256,F.height=64;let U=F.getContext("2d");U.fillStyle="#fff";for(let D=0;D<3;D++){let j=30+D*70;U.beginPath(),U.moveTo(j,8),U.lineTo(j+34,32),U.lineTo(j,56),U.lineTo(j+18,56),U.lineTo(j+52,32),U.lineTo(j+18,8),U.closePath(),U.fill()}let st=new Xe(F);st.wrapS=bn;let ht=[];for(let D=0;D<=3;D++){let j=.42*(1-D/3);ht.push([sn-(sn-3)*Math.cos(j),sn-(sn-3)*Math.sin(j)])}let gt=new et(oi(_,ht,{uLen:500,vOf:D=>D/3,skip:da(an),colorOf:(D,j,W)=>$l(W,2.2)}),new ue({map:st,vertexColors:!0,transparent:!0,blending:de,depthWrite:!1,side:Zt,fog:!1}));gt.renderOrder=2,a.add(gt),l.push(D=>{st.offset.x=(st.offset.x-D*.25)%1})}let jt={0:[],1:[]};for(let F of[0,1]){let U=F===0?-1:1;for(let st of[-2700,-1500,1500,2700])jt[F].push(new E(st,520,U*(ln-30)))}let ie=[],B=new Ft({color:2764598,roughness:.4,metalness:.7}),Ce=new Fe(70,80,6,32),_e=new Fe(150,175,14,40),P=ha([new Yn(64,7,8,40).rotateX(Math.PI/2),new ki(40,24).rotateX(-Math.PI/2)].map(F=>(F.deleteAttribute("uv"),F))),w=new Yn(140,10,8,48),z=new yn(52,24,16),K=new Fe(70,150,260,32,1,!0);for(let F of e.pads){let U=new se;U.position.set(F.x,0,F.z);let st=new Ft({color:3348992,emissive:16753183,emissiveIntensity:F.big?2.6:1.4});if(st.userData.base=F.big?2.6:1.4,F.big){let ht=new et(_e,B);ht.position.y=4;let gt=new et(w,st);gt.rotation.x=Math.PI/2,gt.position.y=12;let D=new et(z,new Ft({color:16752672,emissive:16747536,emissiveIntensity:3.5,roughness:.2}));D.position.y=110;let j=new et(K,new ue({color:16751152,transparent:!0,opacity:.13,blending:de,depthWrite:!1,side:Zt}));j.position.y=135,ht.layers.set(Kl),gt.layers.set(Kl),U.add(ht,gt,D,j),ie.push({pad:F,grp:U,ring:gt,orb:D,cone:j,glowMat:st})}else{let ht=new et(Ce,B);ht.position.y=2;let gt=new et(P,st);gt.position.y=6,ht.layers.set(Kl),gt.layers.set(Kl),U.add(ht,gt),ie.push({pad:F,grp:U,ring:gt,glowMat:st})}a.add(U)}let it=null;if(n)t.environmentIntensity=.85;else{let F=new bi;F.add(new et(new yn(100,32,16),Zg(i)));let U=new ue({color:new mt(12,12,11)});for(let gt=0;gt<10;gt++){let D=gt/10*Math.PI*2,j=new et(new De(14,2,4),U);j.position.set(Math.cos(D)*30,30,Math.sin(D)*36),j.lookAt(0,0,0),F.add(j)}let st=new et(new Be(200,200),new ue({color:1915416}));st.rotation.x=-Math.PI/2,st.position.y=-2,F.add(st);let ht=new js(s);it=ht.fromScene(F,.03).texture,ht.dispose(),t.environment=it,t.environmentIntensity=i.envI}let Et=new mt,At=new mt(10466559),ot=new mt(1,1,1);function dt(F){let{sky:U,terrain:st,features:ht,weather:gt,wcfg:D}=m,j=gt.update(F,U);U.update(F),st.update(F,U),ht.update(F,U),ct&&ct.update(F,U),C&&(C.fitTo(s),C.material.uniforms.uTime.value+=F,C.material.uniforms.uWet.value=.5+U.cover*.15+D.wet*.4,C.material.uniforms.uRain.value=Math.min(1,D.rain));let W=U.w;p.position.copy(U.lightDir).multiplyScalar(120),p.color.copy(U.colors.sun).lerp(At,W.night),p.intensity=(W.day*3+W.sunset*2.6+W.night*.35)*(1-U.cover*.55),v.color.copy(U.colors.zenith).lerp(ot,.45),v.groundColor.setRGB(.16,.2,.12).multiplyScalar(.4+W.day*.8),v.intensity=(.35+W.day*.65+W.sunset*.45)*(1-D.rain*.12)+j*2.2,x.intensity=.35+W.night*1.9+W.sunset*.6+U.cover*.5,s.toneMappingExposure=.9*W.day+1.02*W.sunset+1.12*W.night,Et.copy(U.colors.horizon).lerp(U.colors.away,.5),t.fog.color.copy(Et)}m&&(t.fog.density=mp(m.wcfg).scene,dt(0));let Tt=0,Gt=0;return l.push(F=>{Gt+=F,Tt=Math.max(0,Tt-F*.18),me.offset.y=Tt>0?Math.abs(Math.sin(Gt*14))*.012*Math.min(1,Tt*2):0;for(let U of ie){let st=U.pad.active;U.orb&&(U.orb.visible=st,U.cone.visible=st,U.orb.position.y=110+Math.sin(Gt*2.2+U.pad.x)*12,U.orb.rotation.y+=F);let ht=U.glowMat.userData.base;U.glowMat.emissiveIntensity=st?ht*(1+Math.sin(Gt*4+U.pad.z)*.18):.12}for(let U of wt)U.light.intensity=Math.max(0,U.light.intensity-F*900),U.frameMat.emissiveIntensity+=(U.base-U.frameMat.emissiveIntensity)*Math.min(1,F*1.5)}),{root:o,exposure:i.exposure,bindPads(F){ie.forEach((U,st)=>{F[st]&&(U.pad=F[st])})},dispose(){t.remove(o);let F=new Set;o.traverse(U=>{U.geometry&&!F.has(U.geometry)&&(F.add(U.geometry),U.geometry.dispose());let st=U.material?Array.isArray(U.material)?U.material:[U.material]:[];for(let ht of st)if(!F.has(ht)){F.add(ht);for(let gt in ht)ht[gt]&&ht[gt].isTexture&&!F.has(ht[gt])&&(F.add(ht[gt]),ht[gt].dispose());ht.dispose()}}),it&&it.dispose(),m&&(m.sky.dispose(),m.weather.dispose()),C&&C.dispose(),t.environment=null,t.background=null,t.fog=null},update(F){for(let U of l)U(F);m&&dt(F)},world:m,wet:C,cheer(F=1){Tt=Math.max(Tt,F)},pyroPoints:jt,setScreens(F,U,st,ht){Jt(F,U,st,ht)},goalFlash(F){let U=wt[F];U.light.intensity=2500,U.frameMat.emissiveIntensity=14},cine:{arena:a,buildings:d,ground:f,standEdge:ct?ct.profile.standEdge:[[Vn,1094],[1200,1240],[2300,1760],[3300,2300],[3300,2780],[4200,3250],[5100,3720],[5900,4150],[5900,4700]],roofEdge:ct?ct.profile.roofEdge:[[1900,5020],[1900,5120],[4200,5220],[6500,5350]],setGoalFlap(F,U){let st=Xt[F];st.hinge.rotation.x=st.s*U},setCut(F,U){let st=F===0?-1:1,ht=Math.max(0,U)*.01;c[0].constant=-ht,c[1].constant=-ht,c[2].normal.set(0,0,-st),c[2].constant=(ln+Vn-20)*.01},screenFor(F){let U=F===0?-1:1;return Mt.find(st=>st.end===U).group},reset(){for(let F of Xt)F.hinge.rotation.x=0;c[0].constant=0,c[1].constant=0;for(let F of Mt)F.group.visible=!0;a.position.set(0,0,0),a.quaternion.identity(),a.scale.setScalar(.01),a.visible=!0,f.visible=!0}}}}var jg="rocketArena.settings.v1";function HE(){let s=navigator.userAgent||"";return/Xbox/i.test(s)?"medium":/Android|iPhone|iPad|Mobile/i.test(s)?"low":"high"}function kE(){let s={quality:HE(),volume:.7,rumble:!0,ballCam:!0,fov:100,replays:!0,showFps:!1,timeOfDay:"sunset",world:"blocky",weather:"clear",split:"horizontal",duration:300,difficulty:"pro",teamSize_solo:1,teamSize_versus:1,teamSize_coop:2,handling:"easy",gameMode:"soccar",items:"all",victoryFx:!0};try{let t=JSON.parse(localStorage.getItem(jg)||"{}");return t.timeOfDay&&!t.world&&(t.timeOfDay="sunset"),{...s,...t}}catch{return s}}var _p=class{constructor(){this.settings=kE();let t=new URLSearchParams(location.search);t.get("quality")&&(this.settings.quality=t.get("quality")),this.input=new tc,this.audio=new ec,this.audio.volume=this.settings.volume,this.input.onActivity=()=>this.audio.resume();let e=this.input.rumble.bind(this.input);this.input.rumble=(...n)=>{this.settings.rumble&&e(...n)},this.input.onPadConnect=(n,i)=>this.toast(i?"\u{1F3AE} Controller connected":"Controller disconnected"),this.hud=new ou(document.getElementById("hud")),this.hud.show(!1),this.menu=new lu(this,document.getElementById("menu")),this.container=document.getElementById("game"),this.paused=!1,this.match=null,this.buildGraphics(),this.startAttract(),this.last=performance.now(),this.fpsT=0,this.fpsN=0,document.getElementById("loading")?.remove(),requestAnimationFrame(n=>this.loop(n)),window.__app=this}buildGraphics(){this.gfx&&this.gfx.dispose(),this.gfx=new Gu(this.container,this.settings.quality),this.builtQuality=this.settings.quality,this.buildStadium()}buildStadium(){this.stadium&&this.stadium.dispose();let t=su.map(([i,r])=>({x:i,z:r,big:!0,active:!0})).concat(ru.map(([i,r])=>({x:i,z:r,big:!1,active:!0}))),e=this.settings;this.stadium=Kg(this.gfx.renderer,this.gfx.scene,{quality:e.quality,theme:e.world,timeOfDay:e.timeOfDay,weather:e.weather,pads:t}),this.gfx.setExposure(this.stadium.exposure),this.builtTime=this.worldKey();let n=this.stadium.world&&this.stadium.world.weather;n&&(n.onThunder=(i,r)=>this.audio.thunder(i,r)),this.audio.setRain(n?Math.min(1,n.cfg.rain):0)}saveSettings(){try{localStorage.setItem(jg,JSON.stringify(this.settings))}catch{}}applySettings(){this.saveSettings(),this.audio.setVolume(this.settings.volume),this.settings.quality!==this.builtQuality?(this.disposeMatch(),this.buildGraphics(),this.startAttract(!1)):this.worldKey()!==this.builtTime&&(this.disposeMatch(),this.buildStadium(),this.startAttract(!1))}worldKey(){let t=this.settings;return`${t.world}|${t.timeOfDay}|${t.weather}`}ensureStadium(){this.worldKey()!==this.builtTime&&this.buildStadium()}disposeMatch(){this.match&&this.match.dispose(),this.match=null}startAttract(t=!0){this.disposeMatch(),this.paused=!1,this.hud.show(!1),this.attractCount=(this.attractCount||0)+1;let e=this.attractCount%2===0?"rumble":"soccar";this.match=new Hl(this,{mode:"attract",gameMode:e,items:"all",teamSize:2,duration:0,difficulty:"pro",humans:[]}),this.stadium.bindPads(this.match.world.pads),t&&this.menu.show("main")}startMatch(t){this.audio.resume(),this.lastCfg=t,this.disposeMatch(),this.ensureStadium(),this.menu.hide(),this.paused=!1,this.match=new Hl(this,t),this.stadium.bindPads(this.match.world.pads)}restartMatch(){this.lastCfg&&this.startMatch(this.lastCfg)}pauseMatch(){this.paused||(this.paused=!0,this.menu.show("pause"))}resume(){if(this.paused=!1,this.menu.hide(),this.resumeFrame=this.frames,this.match){this.match.acc=0;for(let t of this.match.humans)t.car.prevJump=!0}}quitToMenu(){this.startAttract(!0)}showResults(t){this.menu.show("results",t)}toggleFullscreen(){Qg()}toast(t){let e=document.createElement("div");e.className="toast",e.textContent=t,document.body.appendChild(e),setTimeout(()=>e.classList.add("out"),2200),setTimeout(()=>e.remove(),2800)}loop(t){requestAnimationFrame(i=>this.loop(i));let e=Math.min(.1,Math.max(0,(t-this.last)/1e3));this.last=t,this.input.update();let n=this.input.menu();if(this.menu.visible&&this.menu.update(n),this.match)if(this.paused){for(let i of this.match.engines)this.audio.updateEngine(i,0,0,!1,!1,!1);this.match.renderPaused()}else this.match.update(e);if(this.fpsT+=e,this.fpsN++,this.fpsT>.5){let i=this.fpsN/this.fpsT;this.hud.setFps(this.settings.showFps?`${Math.round(i)} FPS`:"");let r=this.match&&!this.match.attract&&!this.paused;this.slowT=r&&i<32&&this.settings.quality!=="low"?(this.slowT||0)+this.fpsT:0,this.slowT>6&&!this.slowHinted&&(this.slowHinted=!0,this.toast("Running slowly? Lower Graphics in Settings for a smoother game")),this.fpsT=0,this.fpsN=0}this.input.endFrame(),this.frames=(this.frames||0)+1}};function zE(){try{history.pushState({game:1},""),window.addEventListener("popstate",()=>history.pushState({game:1},""))}catch{}}function Qg(){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen({navigationUI:"hide"}).catch(()=>{})}catch{}}function Jg(){zE(),window.addEventListener("keydown",s=>{s.code==="KeyF"&&!s.repeat&&window.__app&&window.__app.menu.visible&&Qg()});try{new _p}catch(s){console.error(s);let t=document.getElementById("loading");t&&(t.innerHTML=`<div class="err">Could not start the game: ${s.message}<br>Your browser needs WebGL 2 support.</div>`)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Jg):Jg();})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
