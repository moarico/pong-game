(()=>{var Fa=["a","b","x","y","lb","rb","lt","rt","view","menu","ls","rs","up","down","left","right","guide"],T0={solo:{up:["KeyW","ArrowUp"],down:["KeyS","ArrowDown"],left:["KeyA","ArrowLeft"],right:["KeyD","ArrowRight"],jump:["Space","KeyK"],boost:["ShiftLeft","ShiftRight","KeyL"],slide:["ControlLeft","KeyC","KeyJ"],rollL:["KeyQ","KeyU"],rollR:["KeyE","KeyO"],cam:["KeyR","KeyI"],pause:["Escape","KeyP"],item:["KeyF","KeyH"],mouse:{boost:0,jump:2,cam:1}},p1:{up:["KeyW"],down:["KeyS"],left:["KeyA"],right:["KeyD"],jump:["Space"],boost:["ShiftLeft"],slide:["ControlLeft","KeyC"],rollL:["KeyQ"],rollR:["KeyE"],cam:["KeyR"],pause:["Escape"],item:["KeyF"],mouse:{boost:0,jump:2,cam:1}},p2:{up:["ArrowUp"],down:["ArrowDown"],left:["ArrowLeft"],right:["ArrowRight"],jump:["KeyK","Numpad0"],boost:["KeyL","NumpadDecimal"],slide:["KeyJ","Numpad1"],rollL:["KeyU"],rollR:["KeyO"],cam:["KeyI","Numpad2"],pause:["KeyP"],item:["KeyH","Numpad3"]}},A0=new Set(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab","ShiftLeft","ShiftRight","ControlLeft"]);function pl(s,t,e=.16){let i=Math.hypot(s,t);if(i<e)return[0,0];let n=Math.min(1,(i-e)/(1-e))/i;return[s*n,t*n]}var eu=class{constructor(t){this.index=t,this.id="",this.connected=!1,this.b={},this.prev={};for(let e of Fa)this.b[e]=0,this.prev[e]=0;this.lx=0,this.ly=0,this.rx=0,this.ry=0,this.triggerSeenNeg=[!1,!1],this.navRepeat={dir:"",t:0},this.raw=null}pressed(t){return this.b[t]>.5&&this.prev[t]<=.5}down(t){return this.b[t]>.5}},ml=class{constructor(){this.keys=new Set,this.keysPressed=new Set,this.mouse=new Set,this.mousePressed=new Set,this.gamepadBlocked=!1,this.rbIsItem=!1,this.pads=[],this.onActivity=null,this.onPadConnect=null,this.kbNav={dir:"",t:0},this.lastFrame=performance.now();try{navigator.gamepadInputEmulation="gamepad"}catch{}window.addEventListener("keydown",t=>{A0.has(t.code)&&!(t.target&&t.target.tagName==="INPUT")&&t.preventDefault(),t.repeat||this.keysPressed.add(t.code),this.keys.add(t.code),this.onActivity&&this.onActivity()}),window.addEventListener("keyup",t=>{this.keys.delete(t.code)}),window.addEventListener("blur",()=>{this.keys.clear(),this.mouse.clear()}),window.addEventListener("pointerdown",()=>{this.onActivity&&this.onActivity()}),window.addEventListener("mousedown",t=>{this.mouse.has(t.button)||this.mousePressed.add(t.button),this.mouse.add(t.button),t.button===1&&t.preventDefault()}),window.addEventListener("mouseup",t=>{this.mouse.delete(t.button)}),window.addEventListener("mousemove",t=>{t.buttons&1||this.mouse.delete(0),t.buttons&2||this.mouse.delete(2),t.buttons&4||this.mouse.delete(1)}),window.addEventListener("contextmenu",t=>t.preventDefault()),window.addEventListener("gamepadconnected",t=>{this.onPadConnect&&this.onPadConnect(t.gamepad,!0)}),window.addEventListener("gamepaddisconnected",t=>{let e=this.pads[t.gamepad.index];e&&(e.connected=!1),this.onPadConnect&&this.onPadConnect(t.gamepad,!1)})}update(){let t=performance.now();this.dt=Math.min(.1,(t-this.lastFrame)/1e3),this.lastFrame=t;let e=[];try{e=navigator.getGamepads?navigator.getGamepads():[]}catch{e=[],this.gamepadBlocked=!0}for(let i of this.pads)i&&(i.connected=!1);for(let i=0;i<e.length;i++){let n=e[i];if(!n||!n.connected)continue;let r=this.pads[n.index]||(this.pads[n.index]=new eu(n.index));r.connected=!0,r.id=n.id,r.raw=n;for(let a of Fa)r.prev[a]=r.b[a];if(this.readPad(r,n),this.onActivity){for(let a of Fa)if(r.pressed(a)){this.onActivity();break}}}}readPad(t,e){let i=r=>e.buttons[r]?typeof e.buttons[r]=="object"?e.buttons[r].value||(e.buttons[r].pressed?1:0):e.buttons[r]:0,n=r=>e.axes[r]!==void 0?e.axes[r]:0;if(e.mapping==="standard"||e.axes.length<6)Fa.forEach((r,a)=>{t.b[r]=i(a)}),[t.lx,t.ly]=pl(n(0),n(1)),[t.rx,t.ry]=pl(n(2),n(3));else{let r={a:0,b:1,x:2,y:3,lb:4,rb:5,view:6,menu:7,guide:8,ls:9,rs:10};for(let o of Fa)t.b[o]=0;for(let o in r)t.b[o]=i(r[o]);let a=(o,l)=>{let c=n(o);return c<-.5&&(t.triggerSeenNeg[l]=!0),t.triggerSeenNeg[l]?(c+1)/2:Math.max(0,c)};t.b.lt=a(2,0),t.b.rt=a(5,1),t.b.left=n(6)<-.5?1:0,t.b.right=n(6)>.5?1:0,t.b.up=n(7)<-.5?1:0,t.b.down=n(7)>.5?1:0,[t.lx,t.ly]=pl(n(0),n(1)),[t.rx,t.ry]=pl(n(3),n(4))}}endFrame(){this.keysPressed.clear(),this.mousePressed.clear()}connectedPads(){return this.pads.filter(t=>t&&t.connected)}anyKey(t){for(let e of t)if(this.keys.has(e))return!0;return!1}anyKeyPressed(t){for(let e of t)if(this.keysPressed.has(e))return!0;return!1}keyboardControls(t){let e=T0[t],i=e.mouse,n=this.anyKey(e.up)?1:0,r=this.anyKey(e.down)?1:0,a=this.anyKey(e.left)?1:0,o=this.anyKey(e.right)?1:0,l=h=>!!i&&this.mouse.has(i[h]),c=h=>!!i&&this.mousePressed.has(i[h]);return{throttle:n-r,steer:o-a,pitch:r-n,yaw:o-a,roll:(this.anyKey(e.rollR)?1:0)-(this.anyKey(e.rollL)?1:0),jump:this.anyKey(e.jump)||l("jump"),boost:this.anyKey(e.boost)||l("boost"),powerslide:this.anyKey(e.slide),ballCam:this.anyKeyPressed(e.cam)||c("cam"),pause:this.anyKeyPressed(e.pause),lookX:0,lookY:0,skip:this.anyKeyPressed(e.jump)||c("jump"),itemDown:this.anyKey(e.item),digitalSteer:!0}}padControls(t){let e=t.b.right-t.b.left,i=t.b.down-t.b.up,n=Math.abs(t.lx)>Math.abs(e)?t.lx:e,r=Math.abs(t.ly)>Math.abs(i)?t.ly:i;return{throttle:t.b.rt-t.b.lt,steer:n,pitch:r,yaw:n,roll:(this.rbIsItem?0:t.b.rb)-t.b.lb,itemDown:this.rbIsItem&&t.down("rb"),jump:t.down("a"),boost:t.down("b"),powerslide:t.down("x"),ballCam:t.pressed("y"),pause:t.pressed("menu"),lookX:t.rx,lookY:t.ry,skip:t.pressed("a"),digitalSteer:Math.abs(t.lx)<.01&&Math.abs(e)>0}}controls(t){if(t.type==="kb")return this.keyboardControls(t.layout);if(t.type==="pad"){let i=this.pads[t.index];return!i||!i.connected?R0():this.padControls(i)}let e=this.keyboardControls("solo");for(let i of this.connectedPads()){let n=this.padControls(i);for(let r in n)r!=="digitalSteer"&&(typeof n[r]=="boolean"?e[r]=e[r]||n[r]:Math.abs(n[r])>Math.abs(e[r])&&(e[r]=n[r],r==="steer"&&(e.digitalSteer=n.digitalSteer)))}return e}menu(){let t={up:!1,down:!1,left:!1,right:!1,confirm:!1,back:!1,start:!1,source:null},e=i=>this.anyKeyPressed(i);e(["ArrowUp","KeyW"])&&(t.up=!0),e(["ArrowDown","KeyS"])&&(t.down=!0),e(["ArrowLeft","KeyA"])&&(t.left=!0),e(["ArrowRight","KeyD"])&&(t.right=!0),e(["Enter","NumpadEnter","Space"])&&(t.confirm=!0,t.source={type:"kb"}),e(["Escape","Backspace"])&&(t.back=!0);for(let i of this.connectedPads()){i.pressed("up")&&(t.up=!0),i.pressed("down")&&(t.down=!0),i.pressed("left")&&(t.left=!0),i.pressed("right")&&(t.right=!0),i.pressed("a")&&(t.confirm=!0,t.source={type:"pad",index:i.index}),i.pressed("b")&&(t.back=!0),i.pressed("menu")&&(t.start=!0);let n="";i.ly<-.6?n="up":i.ly>.6?n="down":i.lx<-.6?n="left":i.lx>.6&&(n="right");let r=i.navRepeat;n&&n!==r.dir?(t[n]=!0,r.t=.38):n&&(r.t-=this.dt||.016,r.t<=0&&(t[n]=!0,r.t=.13)),r.dir=n}return t}rumble(t,e,i,n){let r=t.type==="pad"?[this.pads[t.index]]:t.type==="any"?this.connectedPads():[];for(let a of r){let o=a&&a.raw;if(o)try{o.vibrationActuator&&o.vibrationActuator.playEffect?o.vibrationActuator.playEffect("dual-rumble",{startDelay:0,duration:n,weakMagnitude:Math.min(1,i),strongMagnitude:Math.min(1,e)}).catch(()=>{}):o.hapticActuators&&o.hapticActuators[0]&&o.hapticActuators[0].pulse(Math.min(1,Math.max(e,i)),n)}catch{}}}};function R0(){return{throttle:0,steer:0,pitch:0,yaw:0,roll:0,jump:!1,boost:!1,powerslide:!1,ballCam:!1,pause:!1,lookX:0,lookY:0,skip:!1,itemDown:!1}}function iu(s){if(!s)return"Controller";let t=s.toLowerCase();return t.includes("xbox")||t.includes("xinput")||t.includes("045e")?"Xbox Controller":t.includes("dualsense")||t.includes("dualshock")||t.includes("054c")?"PlayStation Controller":"Controller"}var gl=class{constructor(){this.ctx=null,this.volume=.7,this.engines=[],this.cineNodes=[]}init(){if(this.ctx)return!0;let t=window.AudioContext||window.webkitAudioContext;if(!t)return!1;try{this.ctx=new t}catch{return!1}let e=this.ctx;this.master=e.createGain(),this.master.gain.value=this.volume;let i=e.createDynamicsCompressor();i.threshold.value=-14,i.ratio.value=4,this.master.connect(i).connect(e.destination);let n=e.sampleRate*2;this.noise=e.createBuffer(1,n,e.sampleRate);let r=this.noise.getChannelData(0),a=0;for(let u=0;u<n;u++){let d=Math.random()*2-1;a=(a+.02*d)/1.02,r[u]=d*.6+a*3}let o=this.loopNoise(),l=e.createBiquadFilter();l.type="bandpass",l.frequency.value=700,l.Q.value=.6;let c=e.createOscillator();c.frequency.value=.23;let h=e.createGain();return h.gain.value=.015,this.crowdGain=e.createGain(),this.crowdGain.gain.value=.05,c.connect(h).connect(this.crowdGain.gain),o.connect(l).connect(this.crowdGain).connect(this.master),c.start(),!0}resume(){this.init()&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{})}get ready(){return this.ctx&&this.ctx.state==="running"}setVolume(t){this.volume=t,this.master&&this.master.gain.setTargetAtTime(t,this.ctx.currentTime,.05)}loopNoise(){let t=this.ctx.createBufferSource();return t.buffer=this.noise,t.loop=!0,t.loopStart=Math.random(),t.start(0,Math.random()*1.5),t}burst({dur:t=.2,gain:e=.5,freq:i=1200,endFreq:n=null,type:r="lowpass",q:a=.7,pan:o=0,delay:l=0}){if(!this.ready)return;let c=this.ctx,h=c.currentTime+l,u=c.createBufferSource();u.buffer=this.noise;let d=c.createBiquadFilter();d.type=r,d.frequency.setValueAtTime(i,h),n&&d.frequency.exponentialRampToValueAtTime(n,h+t),d.Q.value=a;let f=c.createGain();f.gain.setValueAtTime(1e-4,h),f.gain.exponentialRampToValueAtTime(e,h+.008),f.gain.exponentialRampToValueAtTime(1e-4,h+t);let p=c.createStereoPanner?c.createStereoPanner():null,v=u.connect(d).connect(f);p&&(p.pan.value=o,v=v.connect(p)),v.connect(this.master),u.start(h,Math.random()*1.5),u.stop(h+t+.05)}tone({freq:t=440,endFreq:e=null,dur:i=.2,gain:n=.3,type:r="sine",delay:a=0,attack:o=.005}){if(!this.ready)return;let l=this.ctx,c=l.currentTime+a,h=l.createOscillator();h.type=r,h.frequency.setValueAtTime(t,c),e&&h.frequency.exponentialRampToValueAtTime(e,c+i);let u=l.createGain();u.gain.setValueAtTime(1e-4,c),u.gain.exponentialRampToValueAtTime(n,c+o),u.gain.exponentialRampToValueAtTime(1e-4,c+i),h.connect(u).connect(this.master),h.start(c),h.stop(c+i+.05)}createEngine(t=0){if(!this.ctx)return null;let e=this.ctx,i=e.createGain();i.gain.value=0;let n=e.createStereoPanner?e.createStereoPanner():null;n?(n.pan.value=t,i.connect(n).connect(this.master)):i.connect(this.master);let r=e.createOscillator();r.type="sawtooth";let a=e.createOscillator();a.type="square";let o=e.createBiquadFilter();o.type="lowpass",o.Q.value=2;let l=e.createGain();l.gain.value=.5,r.connect(o),a.connect(l).connect(o),o.connect(i),r.start(),a.start();let c=this.loopNoise(),h=e.createBiquadFilter();h.type="bandpass",h.frequency.value=900,h.Q.value=.5;let u=e.createGain();u.gain.value=0,c.connect(h).connect(u),n?u.connect(n):u.connect(this.master);let d={out:i,o1:r,o2:a,lp:o,bg:u,bf:h,nodes:[r,a,c]};return this.engines.push(d),d}updateEngine(t,e,i,n,r,a){if(!t||!this.ctx)return;let o=this.ctx.currentTime,l=Math.abs(i),c=38+e*.05+l*14;t.o1.frequency.setTargetAtTime(c,o,.06),t.o2.frequency.setTargetAtTime(c*.5,o,.06),t.lp.frequency.setTargetAtTime(240+e*.9+l*700,o,.08),t.out.gain.setTargetAtTime(a?.05+l*.06+(r?.02:0):0,o,.1),t.bg.gain.setTargetAtTime(a&&n?.22:0,o,.04),t.bf.frequency.setTargetAtTime(n?700+e*.4:900,o,.1)}stopEngine(t){if(t){try{t.out.gain.value=0,t.bg.gain.value=0;for(let e of t.nodes)e.stop()}catch{}this.engines=this.engines.filter(e=>e!==t)}}stopEngines(){for(let t of this.engines)try{t.out.gain.value=0,t.bg.gain.value=0;for(let e of t.nodes)e.stop()}catch{}this.engines=[]}hit(t,e=0){let i=Math.min(1,t/3500);this.burst({dur:.12+i*.15,gain:.25+i*.6,freq:900+i*3e3,endFreq:200,pan:e}),this.tone({freq:140,endFreq:45,dur:.18+i*.15,gain:.25+i*.5}),i>.6&&this.burst({dur:.35,gain:.25*i,freq:4e3,endFreq:800,type:"highpass",pan:e})}bounce(t){let e=Math.min(1,t/2500);this.tone({freq:90,endFreq:40,dur:.15,gain:.08+e*.2}),this.burst({dur:.08,gain:.05+e*.15,freq:600,endFreq:150})}bump(){this.burst({dur:.18,gain:.5,freq:1500,endFreq:200}),this.tone({freq:220,endFreq:70,dur:.15,gain:.3,type:"triangle"})}demo(){this.burst({dur:.9,gain:.9,freq:3e3,endFreq:80}),this.tone({freq:90,endFreq:30,dur:.7,gain:.7}),this.burst({dur:.5,gain:.3,freq:6e3,endFreq:1500,type:"highpass",delay:.05})}goal(){this.burst({dur:1.8,gain:1,freq:4e3,endFreq:60}),this.tone({freq:70,endFreq:25,dur:1.2,gain:.9}),this.burst({dur:.6,gain:.4,freq:7e3,endFreq:2e3,type:"highpass",delay:.05}),this.cheer(1)}cheer(t){if(!this.ready)return;let e=this.ctx.currentTime,i=this.crowdGain.gain;i.cancelScheduledValues(e),i.setValueAtTime(i.value,e),i.linearRampToValueAtTime(.05+.35*t,e+.4),i.linearRampToValueAtTime(.05+.25*t,e+2.5),i.linearRampToValueAtTime(.05,e+6);for(let n=0;n<6;n++)this.burst({dur:1.2+Math.random(),gain:.06*t,freq:500+Math.random()*900,type:"bandpass",q:4,delay:Math.random()*1.2,pan:Math.random()*2-1})}boostPickup(t){t?(this.tone({freq:520,endFreq:1200,dur:.18,gain:.12,type:"triangle"}),this.tone({freq:780,endFreq:1600,dur:.2,gain:.08,type:"triangle",delay:.06})):this.tone({freq:1100,endFreq:1500,dur:.07,gain:.06,type:"triangle"})}jump(){this.burst({dur:.16,gain:.12,freq:700,endFreq:2400,type:"bandpass",q:1.2})}dodge(){this.burst({dur:.25,gain:.16,freq:1800,endFreq:500,type:"bandpass",q:1})}land(t){this.tone({freq:70,endFreq:40,dur:.12,gain:Math.min(.25,t/3e3)})}beep(t){this.tone({freq:t?880:523,dur:t?.5:.18,gain:.25,type:"square"}),this.tone({freq:t?1760:1046,dur:t?.45:.15,gain:.08,type:"sine"})}horn(){for(let t of[220,277,330])this.tone({freq:t,dur:1.4,gain:.12,type:"sawtooth",attack:.04})}itemGet(){this.tone({freq:660,endFreq:990,dur:.12,gain:.08,type:"triangle"}),this.tone({freq:990,endFreq:1320,dur:.14,gain:.07,type:"triangle",delay:.08})}itemUse(t,e=1){let i=Math.max(.2,e);switch(t){case"grapple":case"plunger":this.burst({dur:.25,gain:.25*i,freq:2500,endFreq:700,type:"bandpass",q:2});break;case"tornado":this.burst({dur:2.5,gain:.35*i,freq:300,endFreq:1400,type:"bandpass",q:.8}),this.burst({dur:3,gain:.2*i,freq:900,endFreq:400,type:"bandpass",q:3,delay:.3});break;case"freezer":this.tone({freq:1800,endFreq:3200,dur:.4,gain:.12*i,type:"sine"}),this.burst({dur:.5,gain:.25*i,freq:6e3,endFreq:3e3,type:"highpass"});break;case"curveball":this.tone({freq:300,endFreq:1200,dur:.5,gain:.15*i,type:"sawtooth"});break;case"power":case"spikes":this.tone({freq:140,endFreq:420,dur:.35,gain:.25*i,type:"square"});break;default:this.burst({dur:.2,gain:.3*i,freq:1200,endFreq:200})}}hook(t=1){this.tone({freq:900,endFreq:500,dur:.12,gain:.2*Math.max(.2,t),type:"square"}),this.burst({dur:.1,gain:.2*Math.max(.2,t),freq:4e3,endFreq:1500,type:"highpass"})}cine(t){if(!this.ready)return;let e=this.ctx;switch(t){case"rise":[523,659,784,1046].forEach((i,n)=>this.tone({freq:i,dur:.9,gain:.09,type:"triangle",delay:n*.11,attack:.02})),this.tone({freq:131,dur:1.6,gain:.18,type:"sawtooth",attack:.05});break;case"flap":this.burst({dur:1,gain:.25,freq:3e3,endFreq:500,type:"bandpass",q:1.5}),this.tone({freq:160,endFreq:70,dur:.6,gain:.25,type:"square"});break;case"clunk":this.tone({freq:70,endFreq:30,dur:.5,gain:.7}),this.burst({dur:.4,gain:.6,freq:1500,endFreq:100});break;case"build":this.tone({freq:90,endFreq:900,dur:2.6,gain:.12,type:"sawtooth",attack:.3});for(let i=0;i<12;i++)this.tone({freq:700+i*90,dur:.12,gain:.05,type:"square",delay:i*.2});break;case"launch":this.burst({dur:1.4,gain:.7,freq:500,endFreq:3e3,type:"bandpass",q:.7}),this.tone({freq:60,endFreq:120,dur:1.2,gain:.4,type:"sawtooth"});break;case"whoosh":this.burst({dur:1.3,gain:.5,freq:300,endFreq:4e3,type:"bandpass",q:1.2});break;case"boom":this.burst({dur:2.6,gain:1,freq:3500,endFreq:40}),this.tone({freq:60,endFreq:18,dur:2.4,gain:1}),this.burst({dur:.8,gain:.5,freq:7e3,endFreq:1500,type:"highpass",delay:.03});break;case"tear":this.burst({dur:3,gain:.8,freq:200,endFreq:1200,type:"lowpass"});for(let i=0;i<8;i++)this.burst({dur:.3,gain:.35,freq:2500,endFreq:300,delay:Math.random()*2.5});break;case"drone":this.startDrone(32,.55);break;case"space":{this.stopCine(1.5),this.startDrone(24,.45);let i=e.currentTime,n=e.createGain();n.gain.setValueAtTime(1e-4,i),n.gain.exponentialRampToValueAtTime(.06,i+3),n.connect(this.master);let r=[110,164.8,220.5,329.6].map((a,o)=>{let l=e.createOscillator();return l.type="sine",l.frequency.value=a*(1+(o%2?.003:-.002)),l.connect(n),l.start(i),l});this.cineNodes.push({out:n,srcs:r});break}case"gulp":this.tone({freq:180,endFreq:20,dur:1.6,gain:.8}),this.burst({dur:1.5,gain:.6,freq:1200,endFreq:60});break;case"bigboom":this.stopCine(.2),this.burst({dur:5,gain:1,freq:5e3,endFreq:30}),this.tone({freq:50,endFreq:15,dur:4.5,gain:1}),this.tone({freq:100,endFreq:25,dur:3,gain:.6,type:"sawtooth"}),this.burst({dur:1.5,gain:.6,freq:8e3,endFreq:2e3,type:"highpass",delay:.05}),this.burst({dur:4,gain:.5,freq:600,endFreq:80,delay:.6});break;case"stop":this.stopCine(.6);break;default:break}}startDrone(t,e){let i=this.ctx,n=i.currentTime,r=i.createGain();r.gain.setValueAtTime(1e-4,n),r.gain.exponentialRampToValueAtTime(e,n+1.5);let a=i.createBiquadFilter();a.type="lowpass",a.frequency.setValueAtTime(140,n),a.frequency.linearRampToValueAtTime(700,n+9),a.Q.value=3,a.connect(r).connect(this.master);let o=[1,1.012,.5].map(h=>{let u=i.createOscillator();return u.type="sawtooth",u.frequency.setValueAtTime(t*h,n),u.frequency.linearRampToValueAtTime(t*h*1.8,n+10),u.connect(a),u.start(n),u}),l=this.loopNoise(),c=i.createGain();c.gain.value=.6,l.connect(c).connect(a),o.push(l),this.cineNodes=this.cineNodes||[],this.cineNodes.push({out:r,srcs:o})}stopCine(t=.5){if(!this.ctx||!this.cineNodes)return;let e=this.ctx.currentTime;for(let i of this.cineNodes)try{i.out.gain.cancelScheduledValues(e),i.out.gain.setValueAtTime(Math.max(1e-4,i.out.gain.value),e),i.out.gain.exponentialRampToValueAtTime(1e-4,e+t);for(let n of i.srcs)n.stop(e+t+.05)}catch{}this.cineNodes=[]}click(){this.tone({freq:1400,dur:.04,gain:.05,type:"square"})}select(){this.tone({freq:900,endFreq:1400,dur:.09,gain:.08,type:"triangle"})}};var tp=0,zu=1,ep=2;var ar=1,ip=2,ia=3,Bs=0,yi=1,ce=2,mn=0,gn=1,Ee=2,ku=3,Vu=4,np=5;var or=100,sp=101,rp=102,ap=103,op=104,lp=200,cp=201,hp=202,up=203,Gu=204,Wu=205,dp=206,fp=207,pp=208,mp=209,gp=210,vp=211,xp=212,yp=213,_p=214,Xl=0,Yl=1,Zl=2,Hr=3,$l=4,Jl=5,Kl=6,jl=7,qu=0,Mp=1,bp=2,Pn=0,Uo=1,Fo=2,Bo=3,lr=4,Oo=5,Ho=6,zo=7;var Xu=300,Os=301,cr=302,wc=303,Tc=304,ko=306,Ji=1e3,Hn=1001,Ql=1002,pi=1003,Sp=1004;var Vo=1005;var mi=1006,Ac=1007;var Hs=1008;var Bi=1009,Yu=1010,Zu=1011,na=1012,Rc=1013,In=1014,vn=1015,hi=1016,Cc=1017,Pc=1018,sa=1020,$u=35902,Ju=35899,Ku=1021,ju=1022,xn=1023,Vn=1026,zs=1027,Ic=1028,Lc=1029,ks=1030,Dc=1031;var Nc=1033,Go=33776,Wo=33777,qo=33778,Xo=33779,Uc=35840,Fc=35841,Bc=35842,Oc=35843,Hc=36196,zc=37492,kc=37496,Vc=37488,Gc=37489,Yo=37490,Wc=37491,qc=37808,Xc=37809,Yc=37810,Zc=37811,$c=37812,Jc=37813,Kc=37814,jc=37815,Qc=37816,th=37817,eh=37818,ih=37819,nh=37820,sh=37821,rh=36492,ah=36494,oh=36495,lh=36283,ch=36284,Zo=36285,hh=36286;var Ka=2300,tc=2301,Wl=2302,Ru=2303,Cu=2400,Pu=2401,Iu=2402;var Ep=3200;var uh=0,wp=1,_s="",We="srgb",ja="srgb-linear",Qa="linear",Ce="srgb";var ql=7680;var Tp=519,Ap=512,Rp=513,Cp=514,dh=515,Pp=516,Ip=517,fh=518,Lp=519,Qu=35044,Ki=35048;var td="300 es",Cn=2e3,zr=2001;function C0(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function P0(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function to(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Dp(){let s=to("canvas");return s.style.display="block",s}var _f={},kr=null;function eo(...s){let t="THREE."+s.shift();kr?kr("log",t,...s):console.log(t,...s)}function Np(s){let t=s[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=s[1];e&&e.isStackTrace?s[0]+=" "+e.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function Jt(...s){s=Np(s);let t="THREE."+s.shift();if(kr)kr("warn",t,...s);else{let e=s[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...s)}}function jt(...s){s=Np(s);let t="THREE."+s.shift();if(kr)kr("error",t,...s);else{let e=s[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...s)}}function nr(...s){let t=s.join(" ");t in _f||(_f[t]=!0,Jt(...s))}function Up(s,t,e){return new Promise(function(i,n){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:n();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}var Fp={[Xl]:Yl,[Zl]:Kl,[$l]:jl,[Hr]:Jl,[Yl]:Xl,[Kl]:Zl,[jl]:$l,[Jl]:Hr},Gn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let n=i[t];if(n!==void 0){let r=n.indexOf(e);r!==-1&&n.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let n=i.slice(0);for(let r=0,a=n.length;r<a;r++)n[r].call(this,t);t.target=null}}},Ui=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Mf=1234567,Ya=Math.PI/180,Vr=180/Math.PI;function kn(){let s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ui[s&255]+Ui[s>>8&255]+Ui[s>>16&255]+Ui[s>>24&255]+"-"+Ui[t&255]+Ui[t>>8&255]+"-"+Ui[t>>16&15|64]+Ui[t>>24&255]+"-"+Ui[e&63|128]+Ui[e>>8&255]+"-"+Ui[e>>16&255]+Ui[e>>24&255]+Ui[i&255]+Ui[i>>8&255]+Ui[i>>16&255]+Ui[i>>24&255]).toLowerCase()}function pe(s,t,e){return Math.max(t,Math.min(e,s))}function ed(s,t){return(s%t+t)%t}function I0(s,t,e,i,n){return i+(s-t)*(n-i)/(e-t)}function L0(s,t,e){return s!==t?(e-s)/(t-s):0}function Za(s,t,e){return(1-e)*s+e*t}function D0(s,t,e,i){return Za(s,t,1-Math.exp(-e*i))}function N0(s,t=1){return t-Math.abs(ed(s,t*2)-t)}function U0(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function F0(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function B0(s,t){return s+Math.floor(Math.random()*(t-s+1))}function O0(s,t){return s+Math.random()*(t-s)}function H0(s){return s*(.5-Math.random())}function z0(s){s!==void 0&&(Mf=s);let t=Mf+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function k0(s){return s*Ya}function V0(s){return s*Vr}function G0(s){return s>0&&Number.isInteger(s)&&2**Math.round(Math.log2(s))===s}function W0(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function q0(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function X0(s,t,e,i,n){let r=Math.cos,a=Math.sin,o=r(e/2),l=a(e/2),c=r((t+i)/2),h=a((t+i)/2),u=r((t-i)/2),d=a((t-i)/2),f=r((i-t)/2),p=a((i-t)/2);switch(n){case"XYX":s.set(o*h,l*u,l*d,o*c);break;case"YZY":s.set(l*d,o*h,l*u,o*c);break;case"ZXZ":s.set(l*u,l*d,o*h,o*c);break;case"XZX":s.set(o*h,l*p,l*f,o*c);break;case"YXY":s.set(l*f,o*h,l*p,o*c);break;case"ZYZ":s.set(l*p,l*f,o*h,o*c);break;default:Jt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}}function Rn(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:case Uint8ClampedArray:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Be(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var we={DEG2RAD:Ya,RAD2DEG:Vr,generateUUID:kn,clamp:pe,euclideanModulo:ed,mapLinear:I0,inverseLerp:L0,lerp:Za,damp:D0,pingpong:N0,smoothstep:U0,smootherstep:F0,randInt:B0,randFloat:O0,randFloatSpread:H0,seededRandom:z0,degToRad:k0,radToDeg:V0,isPowerOfTwo:G0,ceilPowerOfTwo:W0,floorPowerOfTwo:q0,setQuaternionFromProperEuler:X0,normalize:Be,denormalize:Rn},od=class od{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,n=t.elements;return this.x=n[0]*e+n[3]*i+n[6],this.y=n[1]*e+n[4]*i+n[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=pe(this.x,t.x,e.x),this.y=pe(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=pe(this.x,t,e),this.y=pe(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(pe(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(pe(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),n=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*i-a*n+t.x,this.y=r*n+a*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};od.prototype.isVector2=!0;var st=od,le=class{constructor(t=0,e=0,i=0,n=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=n}static slerpFlat(t,e,i,n,r,a,o){let l=i[n+0],c=i[n+1],h=i[n+2],u=i[n+3],d=r[a+0],f=r[a+1],p=r[a+2],v=r[a+3];if(u!==v||l!==d||c!==f||h!==p){let m=l*d+c*f+h*p+u*v;m<0&&(d=-d,f=-f,p=-p,v=-v,m=-m);let g=1-o;if(m<.9995){let x=Math.acos(m),b=Math.sin(x);g=Math.sin(g*x)/b,o=Math.sin(o*x)/b,l=l*g+d*o,c=c*g+f*o,h=h*g+p*o,u=u*g+v*o}else{l=l*g+d*o,c=c*g+f*o,h=h*g+p*o,u=u*g+v*o;let x=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=x,c*=x,h*=x,u*=x}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,i,n,r,a){let o=i[n],l=i[n+1],c=i[n+2],h=i[n+3],u=r[a],d=r[a+1],f=r[a+2],p=r[a+3];return t[e]=o*p+h*u+l*f-c*d,t[e+1]=l*p+h*d+c*u-o*f,t[e+2]=c*p+h*f+o*d-l*u,t[e+3]=h*p-o*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,n){return this._x=t,this._y=e,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,n=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(n/2),u=o(r/2),d=l(i/2),f=l(n/2),p=l(r/2);switch(a){case"XYZ":this._x=d*h*u+c*f*p,this._y=c*f*u-d*h*p,this._z=c*h*p+d*f*u,this._w=c*h*u-d*f*p;break;case"YXZ":this._x=d*h*u+c*f*p,this._y=c*f*u-d*h*p,this._z=c*h*p-d*f*u,this._w=c*h*u+d*f*p;break;case"ZXY":this._x=d*h*u-c*f*p,this._y=c*f*u+d*h*p,this._z=c*h*p+d*f*u,this._w=c*h*u-d*f*p;break;case"ZYX":this._x=d*h*u-c*f*p,this._y=c*f*u+d*h*p,this._z=c*h*p-d*f*u,this._w=c*h*u+d*f*p;break;case"YZX":this._x=d*h*u+c*f*p,this._y=c*f*u+d*h*p,this._z=c*h*p-d*f*u,this._w=c*h*u-d*f*p;break;case"XZY":this._x=d*h*u-c*f*p,this._y=c*f*u-d*h*p,this._z=c*h*p+d*f*u,this._w=c*h*u+d*f*p;break;default:Jt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,n=Math.sin(i);return this._x=t.x*n,this._y=t.y*n,this._z=t.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],n=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=i+o+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(a-n)*f}else if(i>o&&i>u){let f=2*Math.sqrt(1+i-o-u);this._w=(h-l)/f,this._x=.25*f,this._y=(n+a)/f,this._z=(r+c)/f}else if(o>u){let f=2*Math.sqrt(1+o-i-u);this._w=(r-c)/f,this._x=(n+a)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-i-o);this._w=(a-n)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(pe(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let n=Math.min(1,e/i);return this.slerp(t,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,n=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+a*o+n*c-r*l,this._y=n*h+a*l+r*o-i*c,this._z=r*h+a*c+i*l-n*o,this._w=a*h-i*o-n*l-r*c,this._onChangeCallback(),this}slerp(t,e){let i=t._x,n=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(i=-i,n=-n,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(n*Math.sin(t),n*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},ld=class ld{constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(bf.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(bf.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*n,this.y=r[1]*e+r[4]*i+r[7]*n,this.z=r[2]*e+r[5]*i+r[8]*n,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=t.elements,a=1/(r[3]*e+r[7]*i+r[11]*n+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*n+r[12])*a,this.y=(r[1]*e+r[5]*i+r[9]*n+r[13])*a,this.z=(r[2]*e+r[6]*i+r[10]*n+r[14])*a,this}applyQuaternion(t){let e=this.x,i=this.y,n=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*n-o*i),h=2*(o*e-r*n),u=2*(r*i-a*e);return this.x=e+l*c+a*u-o*h,this.y=i+l*h+o*c-r*u,this.z=n+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*n,this.y=r[1]*e+r[5]*i+r[9]*n,this.z=r[2]*e+r[6]*i+r[10]*n,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=pe(this.x,t.x,e.x),this.y=pe(this.y,t.y,e.y),this.z=pe(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=pe(this.x,t,e),this.y=pe(this.y,t,e),this.z=pe(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(pe(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,n=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=n*l-r*o,this.y=r*a-i*l,this.z=i*o-n*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return nu.copy(this).projectOnVector(t),this.sub(nu)}reflect(t){return this.sub(nu.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(pe(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,n=this.z-t.z;return e*e+i*i+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let n=Math.sin(e)*t;return this.x=n*Math.sin(i),this.y=Math.cos(e)*t,this.z=n*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),n=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=n,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};ld.prototype.isVector3=!0;var S=ld,nu=new S,bf=new le,cd=class cd{constructor(t,e,i,n,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,a,o,l,c)}set(t,e,i,n,r,a,o,l,c){let h=this.elements;return h[0]=t,h[1]=n,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=i,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],h=i[4],u=i[7],d=i[2],f=i[5],p=i[8],v=n[0],m=n[3],g=n[6],x=n[1],b=n[4],y=n[7],E=n[2],w=n[5],R=n[8];return r[0]=a*v+o*x+l*E,r[3]=a*m+o*b+l*w,r[6]=a*g+o*y+l*R,r[1]=c*v+h*x+u*E,r[4]=c*m+h*b+u*w,r[7]=c*g+h*y+u*R,r[2]=d*v+f*x+p*E,r[5]=d*m+f*b+p*w,r[8]=d*g+f*y+p*R,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-i*r*h+i*o*l+n*r*c-n*a*l}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,d=o*l-h*r,f=c*r-a*l,p=e*u+i*d+n*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/p;return t[0]=u*v,t[1]=(n*c-h*i)*v,t[2]=(o*i-n*a)*v,t[3]=d*v,t[4]=(h*e-n*l)*v,t[5]=(n*r-o*e)*v,t[6]=f*v,t[7]=(i*l-c*e)*v,t[8]=(a*e-i*r)*v,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,n,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+t,-n*c,n*l,-n*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return nr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(su.makeScale(t,e)),this}rotate(t){return nr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(su.makeRotation(-t)),this}translate(t,e){return nr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(su.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<9;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}};cd.prototype.isMatrix3=!0;var ee=cd,su=new ee,Sf=new ee().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ef=new ee().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Y0(){let s={enabled:!0,workingColorSpace:ja,spaces:{},convert:function(n,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Ce&&(n.r=fs(n.r),n.g=fs(n.g),n.b=fs(n.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(n.applyMatrix3(this.spaces[r].toXYZ),n.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Ce&&(n.r=Or(n.r),n.g=Or(n.g),n.b=Or(n.b))),n},workingToColorSpace:function(n,r){return this.convert(n,this.workingColorSpace,r)},colorSpaceToWorking:function(n,r){return this.convert(n,r,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===_s?Qa:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,r=this.workingColorSpace){return n.fromArray(this.spaces[r].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,r,a){return n.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,r){return nr("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(n,r)},toWorkingColorSpace:function(n,r){return nr("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(n,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return s.define({[ja]:{primaries:t,whitePoint:i,transfer:Qa,toXYZ:Sf,fromXYZ:Ef,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:We},outputColorSpaceConfig:{drawingBufferColorSpace:We}},[We]:{primaries:t,whitePoint:i,transfer:Ce,toXYZ:Sf,fromXYZ:Ef,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:We}}}),s}var ge=Y0();function fs(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Or(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var _r,ec=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{_r===void 0&&(_r=to("canvas")),_r.width=t.width,_r.height=t.height;let n=_r.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),i=_r}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=to("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let n=i.getImageData(0,0,t.width,t.height),r=n.data;for(let a=0;a<r.length;a++)r[a]=fs(r[a]/255)*255;return i.putImageData(n,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(fs(e[i]/255)*255):e[i]=fs(e[i]);return{data:e,width:t.width,height:t.height}}else return Jt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Z0=0,Gr=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Z0++}),this.uuid=kn(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let r;if(Array.isArray(n)){r=[];for(let a=0,o=n.length;a<o;a++)n[a].isDataTexture?r.push(ru(n[a].image)):r.push(ru(n[a]))}else r=ru(n);i.url=r}return e||(t.images[this.uuid]=i),i}};function ru(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?ec.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(Jt("Texture: Unable to serialize Texture."),{})}var $0=0,au=new S,qi=class s extends Gn{constructor(t=s.DEFAULT_IMAGE,e=s.DEFAULT_MAPPING,i=Hn,n=Hn,r=mi,a=Hs,o=xn,l=Bi,c=s.DEFAULT_ANISOTROPY,h=_s){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:$0++}),this.uuid=kn(),this.name="",this.source=new Gr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new st(0,0),this.repeat=new st(1,1),this.center=new st(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ee,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(au).x}get height(){return this.source.getSize(au).y}get depth(){return this.source.getSize(au).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){Jt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){Jt(`Texture.setValues(): property '${e}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Xu)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ji:t.x=t.x-Math.floor(t.x);break;case Hn:t.x=t.x<0?0:1;break;case Ql:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ji:t.y=t.y-Math.floor(t.y);break;case Hn:t.y=t.y<0?0:1;break;case Ql:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};qi.DEFAULT_IMAGE=null;qi.DEFAULT_MAPPING=Xu;qi.DEFAULT_ANISOTROPY=1;var hd=class hd{constructor(t=0,e=0,i=0,n=1){this.x=t,this.y=e,this.z=i,this.w=n}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,n){return this.x=t,this.y=e,this.z=i,this.w=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*n+a[12]*r,this.y=a[1]*e+a[5]*i+a[9]*n+a[13]*r,this.z=a[2]*e+a[6]*i+a[10]*n+a[14]*r,this.w=a[3]*e+a[7]*i+a[11]*n+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,n,r,l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],p=l[9],v=l[2],m=l[6],g=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-v)<.01&&Math.abs(p-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+v)<.1&&Math.abs(p+m)<.1&&Math.abs(c+f+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let b=(c+1)/2,y=(f+1)/2,E=(g+1)/2,w=(h+d)/4,R=(u+v)/4,_=(p+m)/4;return b>y&&b>E?b<.01?(i=0,n=.707106781,r=.707106781):(i=Math.sqrt(b),n=w/i,r=R/i):y>E?y<.01?(i=.707106781,n=0,r=.707106781):(n=Math.sqrt(y),i=w/n,r=_/n):E<.01?(i=.707106781,n=.707106781,r=0):(r=Math.sqrt(E),i=R/r,n=_/r),this.set(i,n,r,e),this}let x=Math.sqrt((m-p)*(m-p)+(u-v)*(u-v)+(d-h)*(d-h));return Math.abs(x)<.001&&(x=1),this.x=(m-p)/x,this.y=(u-v)/x,this.z=(d-h)/x,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=pe(this.x,t.x,e.x),this.y=pe(this.y,t.y,e.y),this.z=pe(this.z,t.z,e.z),this.w=pe(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=pe(this.x,t,e),this.y=pe(this.y,t,e),this.z=pe(this.z,t,e),this.w=pe(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(pe(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};hd.prototype.isVector4=!0;var je=hd,ic=class extends Gn{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:mi,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new je(0,0,t,e),this.scissorTest=!1,this.viewport=new je(0,0,t,e),this.textures=[];let n={width:t,height:e,depth:i.depth},r=new qi(n),a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:mi,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let n=0,r=this.textures.length;n<r;n++)this.textures[n].image.width=t,this.textures[n].image.height=e,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let n=Object.assign({},t.textures[e].image);this.textures[e].source=new Gr(n)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Qe=class extends ic{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},io=class extends qi{constructor(t=null,e=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=pi,this.minFilter=pi,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var nc=class extends qi{constructor(t=null,e=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=pi,this.minFilter=pi,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Ec=class Ec{constructor(t,e,i,n,r,a,o,l,c,h,u,d,f,p,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,a,o,l,c,h,u,d,f,p,v,m)}set(t,e,i,n,r,a,o,l,c,h,u,d,f,p,v,m){let g=this.elements;return g[0]=t,g[4]=e,g[8]=i,g[12]=n,g[1]=r,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=h,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=v,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ec().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,n=1/Mr.setFromMatrixColumn(t,0).length(),r=1/Mr.setFromMatrixColumn(t,1).length(),a=1/Mr.setFromMatrixColumn(t,2).length();return e[0]=i[0]*n,e[1]=i[1]*n,e[2]=i[2]*n,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*a,e[9]=i[9]*a,e[10]=i[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,n=t.y,r=t.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(n),c=Math.sin(n),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let d=a*h,f=a*u,p=o*h,v=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+p*c,e[5]=d-v*c,e[9]=-o*l,e[2]=v-d*c,e[6]=p+f*c,e[10]=a*l}else if(t.order==="YXZ"){let d=l*h,f=l*u,p=c*h,v=c*u;e[0]=d+v*o,e[4]=p*o-f,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=f*o-p,e[6]=v+d*o,e[10]=a*l}else if(t.order==="ZXY"){let d=l*h,f=l*u,p=c*h,v=c*u;e[0]=d-v*o,e[4]=-a*u,e[8]=p+f*o,e[1]=f+p*o,e[5]=a*h,e[9]=v-d*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let d=a*h,f=a*u,p=o*h,v=o*u;e[0]=l*h,e[4]=p*c-f,e[8]=d*c+v,e[1]=l*u,e[5]=v*c+d,e[9]=f*c-p,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let d=a*l,f=a*c,p=o*l,v=o*c;e[0]=l*h,e[4]=v-d*u,e[8]=p*u+f,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=f*u+p,e[10]=d-v*u}else if(t.order==="XZY"){let d=a*l,f=a*c,p=o*l,v=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+v,e[5]=a*h,e[9]=f*u-p,e[2]=p*u-f,e[6]=o*h,e[10]=v*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(J0,t,K0)}lookAt(t,e,i){let n=this.elements;return en.subVectors(t,e),en.lengthSq()===0&&(en.z=1),en.normalize(),Rs.crossVectors(i,en),Rs.lengthSq()===0&&(Math.abs(i.z)===1?en.x+=1e-4:en.z+=1e-4,en.normalize(),Rs.crossVectors(i,en)),Rs.normalize(),vl.crossVectors(en,Rs),n[0]=Rs.x,n[4]=vl.x,n[8]=en.x,n[1]=Rs.y,n[5]=vl.y,n[9]=en.y,n[2]=Rs.z,n[6]=vl.z,n[10]=en.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],h=i[1],u=i[5],d=i[9],f=i[13],p=i[2],v=i[6],m=i[10],g=i[14],x=i[3],b=i[7],y=i[11],E=i[15],w=n[0],R=n[4],_=n[8],A=n[12],P=n[1],I=n[5],U=n[9],H=n[13],D=n[2],O=n[6],Z=n[10],Y=n[14],rt=n[3],$=n[7],Q=n[11],it=n[15];return r[0]=a*w+o*P+l*D+c*rt,r[4]=a*R+o*I+l*O+c*$,r[8]=a*_+o*U+l*Z+c*Q,r[12]=a*A+o*H+l*Y+c*it,r[1]=h*w+u*P+d*D+f*rt,r[5]=h*R+u*I+d*O+f*$,r[9]=h*_+u*U+d*Z+f*Q,r[13]=h*A+u*H+d*Y+f*it,r[2]=p*w+v*P+m*D+g*rt,r[6]=p*R+v*I+m*O+g*$,r[10]=p*_+v*U+m*Z+g*Q,r[14]=p*A+v*H+m*Y+g*it,r[3]=x*w+b*P+y*D+E*rt,r[7]=x*R+b*I+y*O+E*$,r[11]=x*_+b*U+y*Z+E*Q,r[15]=x*A+b*H+y*Y+E*it,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],p=t[3],v=t[7],m=t[11],g=t[15],x=l*f-c*d,b=o*f-c*u,y=o*d-l*u,E=a*f-c*h,w=a*d-l*h,R=a*u-o*h;return e*(v*x-m*b+g*y)-i*(p*x-m*E+g*w)+n*(p*b-v*E+g*R)-r*(p*y-v*w+m*R)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],h=t[10];return e*(a*h-o*c)-i*(r*h-o*l)+n*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let n=this.elements;return t.isVector3?(n[12]=t.x,n[13]=t.y,n[14]=t.z):(n[12]=t,n[13]=e,n[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],p=t[12],v=t[13],m=t[14],g=t[15],x=e*o-i*a,b=e*l-n*a,y=e*c-r*a,E=i*l-n*o,w=i*c-r*o,R=n*c-r*l,_=h*v-u*p,A=h*m-d*p,P=h*g-f*p,I=u*m-d*v,U=u*g-f*v,H=d*g-f*m,D=x*H-b*U+y*I+E*P-w*A+R*_;if(D===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let O=1/D;return t[0]=(o*H-l*U+c*I)*O,t[1]=(n*U-i*H-r*I)*O,t[2]=(v*R-m*w+g*E)*O,t[3]=(d*w-u*R-f*E)*O,t[4]=(l*P-a*H-c*A)*O,t[5]=(e*H-n*P+r*A)*O,t[6]=(m*y-p*R-g*b)*O,t[7]=(h*R-d*y+f*b)*O,t[8]=(a*U-o*P+c*_)*O,t[9]=(i*P-e*U-r*_)*O,t[10]=(p*w-v*y+g*x)*O,t[11]=(u*y-h*w-f*x)*O,t[12]=(o*A-a*I-l*_)*O,t[13]=(e*I-i*A+n*_)*O,t[14]=(v*b-p*E-m*x)*O,t[15]=(h*E-u*b+d*x)*O,this}scale(t){let e=this.elements,i=t.x,n=t.y,r=t.z;return e[0]*=i,e[4]*=n,e[8]*=r,e[1]*=i,e[5]*=n,e[9]*=r,e[2]*=i,e[6]*=n,e[10]*=r,e[3]*=i,e[7]*=n,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],n=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,n))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),n=Math.sin(e),r=1-i,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+i,c*o-n*l,c*l+n*o,0,c*o+n*l,h*o+i,h*l-n*a,0,c*l-n*o,h*l+n*a,r*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,n,r,a){return this.set(1,i,r,0,t,1,a,0,e,n,1,0,0,0,0,1),this}compose(t,e,i){let n=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,d=r*c,f=r*h,p=r*u,v=a*h,m=a*u,g=o*u,x=l*c,b=l*h,y=l*u,E=i.x,w=i.y,R=i.z;return n[0]=(1-(v+g))*E,n[1]=(f+y)*E,n[2]=(p-b)*E,n[3]=0,n[4]=(f-y)*w,n[5]=(1-(d+g))*w,n[6]=(m+x)*w,n[7]=0,n[8]=(p+b)*R,n[9]=(m-x)*R,n[10]=(1-(d+v))*R,n[11]=0,n[12]=t.x,n[13]=t.y,n[14]=t.z,n[15]=1,this}decompose(t,e,i){let n=this.elements;t.x=n[12],t.y=n[13],t.z=n[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),e.identity(),this;let a=Mr.set(n[0],n[1],n[2]).length(),o=Mr.set(n[4],n[5],n[6]).length(),l=Mr.set(n[8],n[9],n[10]).length();r<0&&(a=-a),wn.copy(this);let c=1/a,h=1/o,u=1/l;return wn.elements[0]*=c,wn.elements[1]*=c,wn.elements[2]*=c,wn.elements[4]*=h,wn.elements[5]*=h,wn.elements[6]*=h,wn.elements[8]*=u,wn.elements[9]*=u,wn.elements[10]*=u,e.setFromRotationMatrix(wn),i.x=a,i.y=o,i.z=l,this}makePerspective(t,e,i,n,r,a,o=Cn,l=!1){let c=this.elements,h=2*r/(e-t),u=2*r/(i-n),d=(e+t)/(e-t),f=(i+n)/(i-n),p,v;if(l)p=r/(a-r),v=a*r/(a-r);else if(o===Cn)p=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===zr)p=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,n,r,a,o=Cn,l=!1){let c=this.elements,h=2/(e-t),u=2/(i-n),d=-(e+t)/(e-t),f=-(i+n)/(i-n),p,v;if(l)p=1/(a-r),v=a/(a-r);else if(o===Cn)p=-2/(a-r),v=-(a+r)/(a-r);else if(o===zr)p=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<16;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}};Ec.prototype.isMatrix4=!0;var be=Ec,Mr=new S,wn=new be,J0=new S(0,0,0),K0=new S(1,1,1),Rs=new S,vl=new S,en=new S,wf=new be,Tf=new le,ps=class s{constructor(t=0,e=0,i=0,n=s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=n}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,n=this._order){return this._x=t,this._y=e,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let n=t.elements,r=n[0],a=n[4],o=n[8],l=n[1],c=n[5],h=n[9],u=n[2],d=n[6],f=n[10];switch(e){case"XYZ":this._y=Math.asin(pe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-pe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(pe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-pe(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(pe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-pe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Jt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return wf.makeRotationFromQuaternion(t),this.setFromRotationMatrix(wf,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Tf.setFromEuler(this),this.setFromQuaternion(Tf,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ps.DEFAULT_ORDER="XYZ";var no=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},j0=0,Af=new S,br=new le,os=new be,xl=new S,Ba=new S,Q0=new S,tg=new le,Rf=new S(1,0,0),Cf=new S(0,1,0),Pf=new S(0,0,1),If={type:"added"},eg={type:"removed"},Sr={type:"childadded",child:null},ou={type:"childremoved",child:null},Ti=class s extends Gn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:j0++}),this.uuid=kn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let t=new S,e=new ps,i=new le,n=new S(1,1,1);function r(){i.setFromEuler(e,!1)}function a(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new be},normalMatrix:{value:new ee}}),this.matrix=new be,this.matrixWorld=new be,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new no,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return br.setFromAxisAngle(t,e),this.quaternion.multiply(br),this}rotateOnWorldAxis(t,e){return br.setFromAxisAngle(t,e),this.quaternion.premultiply(br),this}rotateX(t){return this.rotateOnAxis(Rf,t)}rotateY(t){return this.rotateOnAxis(Cf,t)}rotateZ(t){return this.rotateOnAxis(Pf,t)}translateOnAxis(t,e){return Af.copy(t).applyQuaternion(this.quaternion),this.position.add(Af.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Rf,t)}translateY(t){return this.translateOnAxis(Cf,t)}translateZ(t){return this.translateOnAxis(Pf,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(os.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?xl.copy(t):xl.set(t,e,i);let n=this.parent;this.updateWorldMatrix(!0,!1),Ba.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?os.lookAt(Ba,xl,this.up):os.lookAt(xl,Ba,this.up),this.quaternion.setFromRotationMatrix(os),n&&(os.extractRotation(n.matrixWorld),br.setFromRotationMatrix(os),this.quaternion.premultiply(br.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(jt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(If),Sr.child=t,this.dispatchEvent(Sr),Sr.child=null):jt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(eg),ou.child=t,this.dispatchEvent(ou),ou.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),os.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),os.multiply(t.parent.matrixWorld)),t.applyMatrix4(os),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(If),Sr.child=t,this.dispatchEvent(Sr),Sr.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,n=this.children.length;i<n;i++){let a=this.children[i].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let n=this.children;for(let r=0,a=n.length;r<a;r++)n[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ba,t,Q0),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ba,tg,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,n=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*i-r[8]*n,r[13]+=i-r[1]*e-r[5]*i-r[9]*n,r[14]+=n-r[2]*e-r[6]*i-r[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};n.uuid=this.uuid,n.type=this.type,n.name=this.name,n.castShadow=this.castShadow,n.receiveShadow=this.receiveShadow,n.visible=this.visible,n.frustumCulled=this.frustumCulled,n.renderOrder=this.renderOrder,n.static=this.static,n.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(o=>({...o})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(t),n.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));n.material=o}else n.material=r(t.materials,this.material);if(this.children.length>0){n.children=[];for(let o=0;o<this.children.length;o++)n.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){n.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];n.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),d=a(t.skeletons),f=a(t.animations),p=a(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),p.length>0&&(i.nodes=p)}return i.object=n,i;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let n=t.children[i];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ti.DEFAULT_UP=new S(0,1,0);Ti.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ti.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Me=class extends Ti{constructor(){super(),this.isGroup=!0,this.type="Group"}},ig={type:"move"},Wr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Me,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Me,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new S,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new S),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Me,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new S,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new S,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let n=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let v of t.hand.values()){let m=e.getJointPose(v,i),g=this._getHandJoint(c,v);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,p=.005;c.inputState.pinching&&d>f+p?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-p&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(n=e.getPose(t.targetRaySpace,i),n===null&&r!==null&&(n=r),n!==null&&(o.matrix.fromArray(n.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,n.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(n.linearVelocity)):o.hasLinearVelocity=!1,n.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(n.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(ig)))}return o!==null&&(o.visible=n!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new Me;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},Bp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Cs={h:0,s:0,l:0},yl={h:0,s:0,l:0};function lu(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}var St=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let n=t;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=We){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ge.colorSpaceToWorking(this,e),this}setRGB(t,e,i,n=ge.workingColorSpace){return this.r=t,this.g=e,this.b=i,ge.colorSpaceToWorking(this,n),this}setHSL(t,e,i,n=ge.workingColorSpace){if(t=ed(t,1),e=pe(e,0,1),i=pe(i,0,1),e===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+e):i+e-i*e,a=2*i-r;this.r=lu(a,r,t+1/3),this.g=lu(a,r,t),this.b=lu(a,r,t-1/3)}return ge.colorSpaceToWorking(this,n),this}setStyle(t,e=We){function i(r){r!==void 0&&parseFloat(r)<1&&Jt("Color: Alpha component of "+t+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=n[1],o=n[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Jt("Color: Unknown color model "+t)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=n[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Jt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=We){let i=Bp[t.toLowerCase()];return i!==void 0?this.setHex(i,e):Jt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=fs(t.r),this.g=fs(t.g),this.b=fs(t.b),this}copyLinearToSRGB(t){return this.r=Or(t.r),this.g=Or(t.g),this.b=Or(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=We){return ge.workingToColorSpace(Fi.copy(this),t),Math.round(pe(Fi.r*255,0,255))*65536+Math.round(pe(Fi.g*255,0,255))*256+Math.round(pe(Fi.b*255,0,255))}getHexString(t=We){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ge.workingColorSpace){ge.workingToColorSpace(Fi.copy(this),e);let i=Fi.r,n=Fi.g,r=Fi.b,a=Math.max(i,n,r),o=Math.min(i,n,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case i:l=(n-r)/u+(n<r?6:0);break;case n:l=(r-i)/u+2;break;case r:l=(i-n)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=ge.workingColorSpace){return ge.workingToColorSpace(Fi.copy(this),e),t.r=Fi.r,t.g=Fi.g,t.b=Fi.b,t}getStyle(t=We){ge.workingToColorSpace(Fi.copy(this),t);let e=Fi.r,i=Fi.g,n=Fi.b;return t!==We?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(t,e,i){return this.getHSL(Cs),this.setHSL(Cs.h+t,Cs.s+e,Cs.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(Cs),t.getHSL(yl);let i=Za(Cs.h,yl.h,e),n=Za(Cs.s,yl.s,e),r=Za(Cs.l,yl.l,e);return this.setHSL(i,n,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,n=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*n,this.g=r[1]*e+r[4]*i+r[7]*n,this.b=r[2]*e+r[5]*i+r[8]*n,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Fi=new St;St.NAMES=Bp;var so=class s{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new St(t),this.density=e}clone(){return new s(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Wn=class extends Ti{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ps,this.environmentIntensity=1,this.environmentRotation=new ps,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},Tn=new S,ls=new S,cu=new S,cs=new S,Er=new S,wr=new S,Lf=new S,hu=new S,uu=new S,du=new S,fu=new je,pu=new je,mu=new je,ds=class s{constructor(t=new S,e=new S,i=new S){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,n){n.subVectors(i,e),Tn.subVectors(t,e),n.cross(Tn);let r=n.lengthSq();return r>0?n.multiplyScalar(1/Math.sqrt(r)):n.set(0,0,0)}static getBarycoord(t,e,i,n,r){Tn.subVectors(n,e),ls.subVectors(i,e),cu.subVectors(t,e);let a=Tn.dot(Tn),o=Tn.dot(ls),l=Tn.dot(cu),c=ls.dot(ls),h=ls.dot(cu),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(c*l-o*h)*d,p=(a*h-o*l)*d;return r.set(1-f-p,p,f)}static containsPoint(t,e,i,n){return this.getBarycoord(t,e,i,n,cs)===null?!1:cs.x>=0&&cs.y>=0&&cs.x+cs.y<=1}static getInterpolation(t,e,i,n,r,a,o,l){return this.getBarycoord(t,e,i,n,cs)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,cs.x),l.addScaledVector(a,cs.y),l.addScaledVector(o,cs.z),l)}static getInterpolatedAttribute(t,e,i,n,r,a){return fu.setScalar(0),pu.setScalar(0),mu.setScalar(0),fu.fromBufferAttribute(t,e),pu.fromBufferAttribute(t,i),mu.fromBufferAttribute(t,n),a.setScalar(0),a.addScaledVector(fu,r.x),a.addScaledVector(pu,r.y),a.addScaledVector(mu,r.z),a}static isFrontFacing(t,e,i,n){return Tn.subVectors(i,e),ls.subVectors(t,e),Tn.cross(ls).dot(n)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,n){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[n]),this}setFromAttributeAndIndices(t,e,i,n){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,n),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Tn.subVectors(this.c,this.b),ls.subVectors(this.a,this.b),Tn.cross(ls).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return s.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return s.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,n,r){return s.getInterpolation(t,this.a,this.b,this.c,e,i,n,r)}containsPoint(t){return s.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return s.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,n=this.b,r=this.c,a,o;Er.subVectors(n,i),wr.subVectors(r,i),hu.subVectors(t,i);let l=Er.dot(hu),c=wr.dot(hu);if(l<=0&&c<=0)return e.copy(i);uu.subVectors(t,n);let h=Er.dot(uu),u=wr.dot(uu);if(h>=0&&u<=h)return e.copy(n);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(i).addScaledVector(Er,a);du.subVectors(t,r);let f=Er.dot(du),p=wr.dot(du);if(p>=0&&f<=p)return e.copy(r);let v=f*c-l*p;if(v<=0&&c>=0&&p<=0)return o=c/(c-p),e.copy(i).addScaledVector(wr,o);let m=h*p-f*u;if(m<=0&&u-h>=0&&f-p>=0)return Lf.subVectors(r,n),o=(u-h)/(u-h+(f-p)),e.copy(n).addScaledVector(Lf,o);let g=1/(m+v+d);return a=v*g,o=d*g,e.copy(i).addScaledVector(Er,a).addScaledVector(wr,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},qn=class{constructor(t=new S(1/0,1/0,1/0),e=new S(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(An.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(An.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=An.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,An):An.fromBufferAttribute(r,a),An.applyMatrix4(t.matrixWorld),this.expandByPoint(An);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),_l.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),_l.copy(i.boundingBox)),_l.applyMatrix4(t.matrixWorld),this.union(_l)}let n=t.children;for(let r=0,a=n.length;r<a;r++)this.expandByObject(n[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,An),An.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Oa),Ml.subVectors(this.max,Oa),Tr.subVectors(t.a,Oa),Ar.subVectors(t.b,Oa),Rr.subVectors(t.c,Oa),Ps.subVectors(Ar,Tr),Is.subVectors(Rr,Ar),Qs.subVectors(Tr,Rr);let e=[0,-Ps.z,Ps.y,0,-Is.z,Is.y,0,-Qs.z,Qs.y,Ps.z,0,-Ps.x,Is.z,0,-Is.x,Qs.z,0,-Qs.x,-Ps.y,Ps.x,0,-Is.y,Is.x,0,-Qs.y,Qs.x,0];return!gu(e,Tr,Ar,Rr,Ml)||(e=[1,0,0,0,1,0,0,0,1],!gu(e,Tr,Ar,Rr,Ml))?!1:(bl.crossVectors(Ps,Is),e=[bl.x,bl.y,bl.z],gu(e,Tr,Ar,Rr,Ml))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,An).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(An).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(hs[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),hs[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),hs[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),hs[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),hs[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),hs[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),hs[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),hs[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(hs),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},hs=[new S,new S,new S,new S,new S,new S,new S,new S],An=new S,_l=new qn,Tr=new S,Ar=new S,Rr=new S,Ps=new S,Is=new S,Qs=new S,Oa=new S,Ml=new S,bl=new S,tr=new S;function gu(s,t,e,i,n){for(let r=0,a=s.length-3;r<=a;r+=3){tr.fromArray(s,r);let o=n.x*Math.abs(tr.x)+n.y*Math.abs(tr.y)+n.z*Math.abs(tr.z),l=t.dot(tr),c=e.dot(tr),h=i.dot(tr);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var fi=new S,Sl=new st,ng=0,Se=class extends Gn{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ng++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=Qu,this.updateRanges=[],this.gpuType=vn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let n=0,r=this.itemSize;n<r;n++)this.array[t+n]=e.array[i+n];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Sl.fromBufferAttribute(this,e),Sl.applyMatrix3(t),this.setXY(e,Sl.x,Sl.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)fi.fromBufferAttribute(this,e),fi.applyMatrix3(t),this.setXYZ(e,fi.x,fi.y,fi.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)fi.fromBufferAttribute(this,e),fi.applyMatrix4(t),this.setXYZ(e,fi.x,fi.y,fi.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)fi.fromBufferAttribute(this,e),fi.applyNormalMatrix(t),this.setXYZ(e,fi.x,fi.y,fi.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)fi.fromBufferAttribute(this,e),fi.transformDirection(t),this.setXYZ(e,fi.x,fi.y,fi.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=Rn(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=Be(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Rn(e,this.array)),e}setX(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Rn(e,this.array)),e}setY(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Rn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Rn(e,this.array)),e}setW(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),i=Be(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,n){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),i=Be(i,this.array),n=Be(n,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this}setXYZW(t,e,i,n,r){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),i=Be(i,this.array),n=Be(n,this.array),r=Be(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var ro=class extends Se{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var ao=class extends Se{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var se=class extends Se{constructor(t,e,i){super(new Float32Array(t),e,i)}},sg=new qn,Ha=new S,vu=new S,ms=class{constructor(t=new S,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):sg.setFromPoints(t).getCenter(i);let n=0;for(let r=0,a=t.length;r<a;r++)n=Math.max(n,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(n),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ha.subVectors(t,this.center);let e=Ha.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),n=(i-this.radius)*.5;this.center.addScaledVector(Ha,n/i),this.radius+=n}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(vu.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ha.copy(t.center).add(vu)),this.expandByPoint(Ha.copy(t.center).sub(vu))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},rg=0,fn=new be,xu=new Ti,Cr=new S,nn=new qn,za=new qn,wi=new S,ye=class s extends Gn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:rg++}),this.uuid=kn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(C0(t)?ao:ro)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new ee().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return fn.makeRotationFromQuaternion(t),this.applyMatrix4(fn),this}rotateX(t){return fn.makeRotationX(t),this.applyMatrix4(fn),this}rotateY(t){return fn.makeRotationY(t),this.applyMatrix4(fn),this}rotateZ(t){return fn.makeRotationZ(t),this.applyMatrix4(fn),this}translate(t,e,i){return fn.makeTranslation(t,e,i),this.applyMatrix4(fn),this}scale(t,e,i){return fn.makeScale(t,e,i),this.applyMatrix4(fn),this}lookAt(t){return xu.lookAt(t),xu.updateMatrix(),this.applyMatrix4(xu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Cr).negate(),this.translate(Cr.x,Cr.y,Cr.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let n=0,r=t.length;n<r;n++){let a=t[n];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new se(i,3))}else{let i=Math.min(t.length,e.count);for(let n=0;n<i;n++){let r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&Jt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new qn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){jt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new S(-1/0,-1/0,-1/0),new S(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,n=e.length;i<n;i++){let r=e[i];nn.setFromBufferAttribute(r),this.morphTargetsRelative?(wi.addVectors(this.boundingBox.min,nn.min),this.boundingBox.expandByPoint(wi),wi.addVectors(this.boundingBox.max,nn.max),this.boundingBox.expandByPoint(wi)):(this.boundingBox.expandByPoint(nn.min),this.boundingBox.expandByPoint(nn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&jt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ms);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){jt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new S,1/0);return}if(t){let i=this.boundingSphere.center;if(nn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];za.setFromBufferAttribute(o),this.morphTargetsRelative?(wi.addVectors(nn.min,za.min),nn.expandByPoint(wi),wi.addVectors(nn.max,za.max),nn.expandByPoint(wi)):(nn.expandByPoint(za.min),nn.expandByPoint(za.max))}nn.getCenter(i);let n=0;for(let r=0,a=t.count;r<a;r++)wi.fromBufferAttribute(t,r),n=Math.max(n,i.distanceToSquared(wi));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)wi.fromBufferAttribute(o,c),l&&(Cr.fromBufferAttribute(t,c),wi.add(Cr)),n=Math.max(n,i.distanceToSquared(wi))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&jt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){jt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,n=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new Se(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let _=0;_<i.count;_++)o[_]=new S,l[_]=new S;let c=new S,h=new S,u=new S,d=new st,f=new st,p=new st,v=new S,m=new S;function g(_,A,P){c.fromBufferAttribute(i,_),h.fromBufferAttribute(i,A),u.fromBufferAttribute(i,P),d.fromBufferAttribute(r,_),f.fromBufferAttribute(r,A),p.fromBufferAttribute(r,P),h.sub(c),u.sub(c),f.sub(d),p.sub(d);let I=1/(f.x*p.y-p.x*f.y);isFinite(I)&&(v.copy(h).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(I),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-p.x).multiplyScalar(I),o[_].add(v),o[A].add(v),o[P].add(v),l[_].add(m),l[A].add(m),l[P].add(m))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let _=0,A=x.length;_<A;++_){let P=x[_],I=P.start,U=P.count;for(let H=I,D=I+U;H<D;H+=3)g(t.getX(H+0),t.getX(H+1),t.getX(H+2))}let b=new S,y=new S,E=new S,w=new S;function R(_){E.fromBufferAttribute(n,_),w.copy(E);let A=o[_];b.copy(A),b.sub(E.multiplyScalar(E.dot(A))).normalize(),y.crossVectors(w,A);let I=y.dot(l[_])<0?-1:1;a.setXYZW(_,b.x,b.y,b.z,I)}for(let _=0,A=x.length;_<A;++_){let P=x[_],I=P.start,U=P.count;for(let H=I,D=I+U;H<D;H+=3)R(t.getX(H+0)),R(t.getX(H+1)),R(t.getX(H+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new Se(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let n=new S,r=new S,a=new S,o=new S,l=new S,c=new S,h=new S,u=new S;if(t)for(let d=0,f=t.count;d<f;d+=3){let p=t.getX(d+0),v=t.getX(d+1),m=t.getX(d+2);n.fromBufferAttribute(e,p),r.fromBufferAttribute(e,v),a.fromBufferAttribute(e,m),h.subVectors(a,r),u.subVectors(n,r),h.cross(u),o.fromBufferAttribute(i,p),l.fromBufferAttribute(i,v),c.fromBufferAttribute(i,m),o.add(h),l.add(h),c.add(h),i.setXYZ(p,o.x,o.y,o.z),i.setXYZ(v,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)n.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),a.fromBufferAttribute(e,d+2),h.subVectors(a,r),u.subVectors(n,r),h.cross(u),i.setXYZ(d+0,h.x,h.y,h.z),i.setXYZ(d+1,h.x,h.y,h.z),i.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)wi.fromBufferAttribute(t,e),wi.normalize(),t.setXYZ(e,wi.x,wi.y,wi.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h),f=0,p=0;for(let v=0,m=l.length;v<m;v++){o.isInterleavedBufferAttribute?f=l[v]*o.data.stride+o.offset:f=l[v]*h;for(let g=0;g<h;g++)d[p++]=c[f++]}return new Se(d,h,u)}if(this.index===null)return Jt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new s,i=this.index.array,n=this.attributes;for(let o in n){let l=n[o],c=t(l,i);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=t(d,i);l.push(f)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let n={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(n[l]=h,r=!0)}r&&(t.data.morphAttributes=n,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let n=t.attributes;for(let c in n){let h=n[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,h=a.length;c<h;c++){let u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},oo=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Qu,this.updateRanges=[],this.version=0,this.uuid=kn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,i){t*=this.stride,i*=e.stride;for(let n=0,r=this.stride;n<r;n++)this.array[t+n]=e.array[i+n];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=kn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(e,this.stride);return i.setUsage(this.usage),i}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=kn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}},Gi=new S,qr=class s{constructor(t,e,i,n=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=i,this.normalized=n}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,i=this.data.count;e<i;e++)Gi.fromBufferAttribute(this,e),Gi.applyMatrix4(t),this.setXYZ(e,Gi.x,Gi.y,Gi.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Gi.fromBufferAttribute(this,e),Gi.applyNormalMatrix(t),this.setXYZ(e,Gi.x,Gi.y,Gi.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Gi.fromBufferAttribute(this,e),Gi.transformDirection(t),this.setXYZ(e,Gi.x,Gi.y,Gi.z);return this}getComponent(t,e){let i=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(i=Rn(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=Be(i,this.array)),this.data.array[t*this.data.stride+this.offset+e]=i,this}setX(t,e){return this.normalized&&(e=Be(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=Be(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=Be(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=Be(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Rn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Rn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Rn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Rn(e,this.array)),e}setXY(t,e,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=Be(e,this.array),i=Be(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this}setXYZ(t,e,i,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=Be(e,this.array),i=Be(i,this.array),n=Be(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=n,this}setXYZW(t,e,i,n,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=Be(e,this.array),i=Be(i,this.array),n=Be(n,this.array),r=Be(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=n,this.data.array[t+3]=r,this}clone(t){if(t===void 0){eo("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let n=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[n+r])}return new Se(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new s(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){eo("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let n=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[n+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},yu=new S,ag=new S,og=new ee,Wi=class{constructor(t=new S(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,n){return this.normal.set(t,e,i),this.constant=n,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let n=yu.subVectors(i,e).cross(ag.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(n,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let n=t.delta(yu),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(n,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||og.getNormalMatrix(t),n=this.coplanarPoint(yu).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},lg=0,Xn=class extends Gn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:lg++}),this.uuid=kn(),this.name="",this.type="Material",this.blending=gn,this.side=Bs,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Gu,this.blendDst=Wu,this.blendEquation=or,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new St(0,0,0),this.blendAlpha=0,this.depthFunc=Hr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Tp,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ql,this.stencilZFail=ql,this.stencilZPass=ql,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){Jt(`Material: parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){Jt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=n(t.textures),a=n(t.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new St().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new Wi().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new st().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new st().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let n=e.length;i=new Array(n);for(let r=0;r!==n;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},Xr=class extends Xn{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new St(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Pr,ka=new S,Ir=new S,Lr=new S,Dr=new st,Va=new st,Op=new be,El=new S,Ga=new S,wl=new S,Df=new st,_u=new st,Nf=new st,lo=class extends Ti{constructor(t=new Xr){if(super(),this.isSprite=!0,this.type="Sprite",Pr===void 0){Pr=new ye;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new oo(e,5);Pr.setIndex([0,1,2,0,2,3]),Pr.setAttribute("position",new qr(i,3,0,!1)),Pr.setAttribute("uv",new qr(i,2,3,!1))}this.geometry=Pr,this.material=t,this.center=new st(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&jt('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Ir.setFromMatrixScale(this.matrixWorld),Op.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Lr.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Ir.multiplyScalar(-Lr.z);let i=this.material.rotation,n,r;i!==0&&(r=Math.cos(i),n=Math.sin(i));let a=this.center;Tl(El.set(-.5,-.5,0),Lr,a,Ir,n,r),Tl(Ga.set(.5,-.5,0),Lr,a,Ir,n,r),Tl(wl.set(.5,.5,0),Lr,a,Ir,n,r),Df.set(0,0),_u.set(1,0),Nf.set(1,1);let o=t.ray.intersectTriangle(El,Ga,wl,!1,ka);if(o===null&&(Tl(Ga.set(-.5,.5,0),Lr,a,Ir,n,r),_u.set(0,1),o=t.ray.intersectTriangle(El,wl,Ga,!1,ka),o===null))return;let l=t.ray.origin.distanceTo(ka);l<t.near||l>t.far||e.push({distance:l,point:ka.clone(),uv:ds.getInterpolation(ka,El,Ga,wl,Df,_u,Nf,new st),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function Tl(s,t,e,i,n,r){Dr.subVectors(s,e).addScalar(.5).multiply(i),n!==void 0?(Va.x=r*Dr.x-n*Dr.y,Va.y=n*Dr.x+r*Dr.y):Va.copy(Dr),s.copy(t),s.x+=Va.x,s.y+=Va.y,s.applyMatrix4(Op)}var us=new S,Mu=new S,Al=new S,Rl=new S,co=class{constructor(t=new S,e=new S(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,us)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=us.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(us.copy(this.origin).addScaledVector(this.direction,e),us.distanceToSquared(t))}distanceSqToSegment(t,e,i,n){Mu.copy(t).add(e).multiplyScalar(.5),Al.copy(e).sub(t).normalize(),Rl.copy(this.origin).sub(Mu);let r=t.distanceTo(e)*.5,a=-this.direction.dot(Al),o=Rl.dot(this.direction),l=-Rl.dot(Al),c=Rl.lengthSq(),h=Math.abs(1-a*a),u,d,f,p;if(h>0)if(u=a*l-o,d=a*o-l,p=r*h,u>=0)if(d>=-p)if(d<=p){let v=1/h;u*=v,d*=v,f=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d<=-p?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=p?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),n&&n.copy(Mu).addScaledVector(Al,d),f}intersectSphere(t,e){if(t.radius<0)return null;us.subVectors(t.center,this.origin);let i=us.dot(this.direction),n=us.dot(us)-i*i,r=t.radius*t.radius;if(n>r)return null;let a=Math.sqrt(r-n),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,n,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(i=(t.min.x-d.x)*c,n=(t.max.x-d.x)*c):(i=(t.max.x-d.x)*c,n=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,a=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,a=(t.min.y-d.y)*h),i>a||r>n||((r>i||isNaN(i))&&(i=r),(a<n||isNaN(n))&&(n=a),u>=0?(o=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(o=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),i>l||o>n)||((o>i||i!==i)&&(i=o),(l<n||n!==n)&&(n=l),n<0)?null:this.at(i>=0?i:n,e)}intersectsBox(t){return this.intersectBox(t,us)!==null}intersectTriangle(t,e,i,n,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,u=t.x-a.x,d=t.y-a.y,f=t.z-a.z,p=e.x-a.x,v=e.y-a.y,m=e.z-a.z,g=i.x-a.x,x=i.y-a.y,b=i.z-a.z,y=Math.abs(l),E=Math.abs(c),w=Math.abs(h),R,_,A,P,I,U,H,D,O,Z,Y,rt;if(y>=E&&y>=w?(A=l,U=u,O=p,rt=g,l>=0?(R=c,_=h,P=d,I=f,H=v,D=m,Z=x,Y=b):(R=h,_=c,P=f,I=d,H=m,D=v,Z=b,Y=x)):E>=w?(A=c,U=d,O=v,rt=x,c>=0?(R=h,_=l,P=f,I=u,H=m,D=p,Z=b,Y=g):(R=l,_=h,P=u,I=f,H=p,D=m,Z=g,Y=b)):(A=h,U=f,O=m,rt=b,h>=0?(R=l,_=c,P=u,I=d,H=p,D=v,Z=g,Y=x):(R=c,_=l,P=d,I=u,H=v,D=p,Z=x,Y=g)),A===0)return null;let $=R/A,Q=_/A,it=1/A,Lt=P-$*U,Pt=I-Q*U,oe=H-$*O,re=D-Q*O,ae=Z-$*rt,q=Y-Q*rt,j=ae*re-q*oe,vt=Lt*q-Pt*ae,Wt=oe*Pt-re*Lt;if(n){if(j<0||vt<0||Wt<0)return null}else if((j<0||vt<0||Wt<0)&&(j>0||vt>0||Wt>0))return null;let Et=j+vt+Wt;if(Et===0)return null;let Yt=it*(j*U+vt*O+Wt*rt);return(Et>0?Yt<0:Yt>0)?null:this.at(Yt/Et,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ve=class extends Xn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new St(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ps,this.combine=qu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Uf=new be,er=new co,Cl=new ms,Ff=new S,Pl=new S,Il=new S,Ll=new S,bu=new S,Dl=new S,Bf=new S,Nl=new S,at=class extends Ti{constructor(t=new ye,e=new ve){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=n.length;r<a;r++){let o=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let i=this.geometry,n=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;e.fromBufferAttribute(n,t);let o=this.morphTargetInfluences;if(r&&o){Dl.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],u=r[l];h!==0&&(bu.fromBufferAttribute(u,t),a?Dl.addScaledVector(bu,h):Dl.addScaledVector(bu.sub(e),h))}e.add(Dl)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.material,r=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Cl.copy(i.boundingSphere),Cl.applyMatrix4(r),er.copy(t.ray).recast(t.near),!(Cl.containsPoint(er.origin)===!1&&(er.intersectSphere(Cl,Ff)===null||er.origin.distanceToSquared(Ff)>(t.far-t.near)**2))&&(Uf.copy(r).invert(),er.copy(t.ray).applyMatrix4(Uf),!(i.boundingBox!==null&&er.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,er)))}_computeIntersections(t,e,i){let n,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let p=0,v=d.length;p<v;p++){let m=d[p],g=a[m.materialIndex],x=Math.max(m.start,f.start),b=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let y=x,E=b;y<E;y+=3){let w=o.getX(y),R=o.getX(y+1),_=o.getX(y+2);n=Ul(this,g,t,i,c,h,u,w,R,_),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=m.materialIndex,e.push(n))}}else{let p=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let m=p,g=v;m<g;m+=3){let x=o.getX(m),b=o.getX(m+1),y=o.getX(m+2);n=Ul(this,a,t,i,c,h,u,x,b,y),n&&(n.faceIndex=Math.floor(m/3),e.push(n))}}else if(l!==void 0)if(Array.isArray(a))for(let p=0,v=d.length;p<v;p++){let m=d[p],g=a[m.materialIndex],x=Math.max(m.start,f.start),b=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let y=x,E=b;y<E;y+=3){let w=y,R=y+1,_=y+2;n=Ul(this,g,t,i,c,h,u,w,R,_),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=m.materialIndex,e.push(n))}}else{let p=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let m=p,g=v;m<g;m+=3){let x=m,b=m+1,y=m+2;n=Ul(this,a,t,i,c,h,u,x,b,y),n&&(n.faceIndex=Math.floor(m/3),e.push(n))}}}};function cg(s,t,e,i,n,r,a,o){let l;if(t.side===yi?l=i.intersectTriangle(a,r,n,!0,o):l=i.intersectTriangle(n,r,a,t.side===Bs,o),l===null)return null;Nl.copy(o),Nl.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(Nl);return c<e.near||c>e.far?null:{distance:c,point:Nl.clone(),object:s}}function Ul(s,t,e,i,n,r,a,o,l,c){s.getVertexPosition(o,Pl),s.getVertexPosition(l,Il),s.getVertexPosition(c,Ll);let h=cg(s,t,e,i,Pl,Il,Ll,Bf);if(h){let u=new S;ds.getBarycoord(Bf,Pl,Il,Ll,u),n&&(h.uv=ds.getInterpolatedAttribute(n,o,l,c,u,new st)),r&&(h.uv1=ds.getInterpolatedAttribute(r,o,l,c,u,new st)),a&&(h.normal=ds.getInterpolatedAttribute(a,o,l,c,u,new S),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new S,materialIndex:0};ds.getNormal(Pl,Il,Ll,d.normal),h.face=d,h.barycoord=u}return h}var ho=class extends qi{constructor(t=null,e=1,i=1,n,r,a,o,l,c=pi,h=pi,u,d){super(null,a,o,l,c,h,n,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Yn=class extends Se{constructor(t,e,i,n=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Nr=new be,Of=new be,Fl=[],Hf=new qn,hg=new be,Wa=new at,qa=new ms,gs=class extends at{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Yn(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,hg)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new qn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Nr),Hf.copy(t.boundingBox).applyMatrix4(Nr),this.boundingBox.union(Hf)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new ms),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Nr),qa.copy(t.boundingSphere).applyMatrix4(Nr),this.boundingSphere.union(qa)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,n=this.morphTexture.source.data.data,r=i.length+1,a=t*r+1;for(let o=0;o<i.length;o++)i[o]=n[a+o]}raycast(t,e){let i=this.matrixWorld,n=this.count;if(Wa.geometry=this.geometry,Wa.material=this.material,Wa.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),qa.copy(this.boundingSphere),qa.applyMatrix4(i),t.ray.intersectsSphere(qa)!==!1))for(let r=0;r<n;r++){this.getMatrixAt(r,Nr),Of.multiplyMatrices(i,Nr),Wa.matrixWorld=Of,Wa.raycast(t,Fl);for(let a=0,o=Fl.length;a<o;a++){let l=Fl[a];l.instanceId=r,l.object=this,e.push(l)}Fl.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Yn(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new ho(new Float32Array(n*this.count),n,this.count,Ic,vn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<i.length;c++)a+=i[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=n*t;return r[l]=o,r.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},ir=new ms,ug=new st(.5,.5),Bl=new S,Yr=class{constructor(t=new Wi,e=new Wi,i=new Wi,n=new Wi,r=new Wi,a=new Wi){this.planes=[t,e,i,n,r,a]}set(t,e,i,n,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(i),o[3].copy(n),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Cn,i=!1){let n=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],p=r[8],v=r[9],m=r[10],g=r[11],x=r[12],b=r[13],y=r[14],E=r[15];if(n[0].setComponents(c-a,f-h,g-p,E-x).normalize(),n[1].setComponents(c+a,f+h,g+p,E+x).normalize(),n[2].setComponents(c+o,f+u,g+v,E+b).normalize(),n[3].setComponents(c-o,f-u,g-v,E-b).normalize(),i)n[4].setComponents(l,d,m,y).normalize(),n[5].setComponents(c-l,f-d,g-m,E-y).normalize();else if(n[4].setComponents(c-l,f-d,g-m,E-y).normalize(),e===Cn)n[5].setComponents(c+l,f+d,g+m,E+y).normalize();else if(e===zr)n[5].setComponents(l,d,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),ir.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),ir.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(ir)}intersectsSprite(t){ir.center.set(0,0,0);let e=ug.distanceTo(t.center);return ir.radius=.7071067811865476+e,ir.applyMatrix4(t.matrixWorld),this.intersectsSphere(ir)}intersectsSphere(t){let e=this.planes,i=t.center,n=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<n)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let n=e[i];if(Bl.x=n.normal.x>0?t.max.x:t.min.x,Bl.y=n.normal.y>0?t.max.y:t.min.y,Bl.z=n.normal.z>0?t.max.z:t.min.z,n.distanceToPoint(Bl)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var sc=class extends Xn{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new St(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},zf=new be,Lu=new co,Ol=new ms,Hl=new S,Zr=class extends Ti{constructor(t=new ye,e=new sc){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,r=t.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Ol.copy(i.boundingSphere),Ol.applyMatrix4(n),Ol.radius+=r,t.ray.intersectsSphere(Ol)===!1)return;zf.copy(n).invert(),Lu.copy(t.ray).applyMatrix4(zf);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,u=i.attributes.position;if(c!==null){let d=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let p=d,v=f;p<v;p++){let m=c.getX(p);Hl.fromBufferAttribute(u,m),kf(Hl,m,l,n,t,e,this)}}else{let d=Math.max(0,a.start),f=Math.min(u.count,a.start+a.count);for(let p=d,v=f;p<v;p++)Hl.fromBufferAttribute(u,p),kf(Hl,p,l,n,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=n.length;r<a;r++){let o=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function kf(s,t,e,i,n,r,a){let o=Lu.distanceSqToPoint(s);if(o<e){let l=new S;Lu.closestPointToPoint(s,l),l.applyMatrix4(i);let c=n.ray.origin.distanceTo(l);if(c<n.near||c>n.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}var uo=class extends qi{constructor(t=[],e=Os,i,n,r,a,o,l,c,h){super(t,e,i,n,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},gi=class extends qi{constructor(t,e,i,n,r,a,o,l,c){super(t,e,i,n,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Ds=class extends qi{constructor(t,e,i=In,n,r,a,o=pi,l=pi,c,h=Vn,u=1){if(h!==Vn&&h!==zs)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:u};super(d,n,r,a,o,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Gr(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},rc=class extends Ds{constructor(t,e=In,i=Os,n,r,a=pi,o=pi,l,c=Vn){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,i,n,r,a,o,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},fo=class extends qi{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},He=class s extends ye{constructor(t=1,e=1,i=1,n=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:n,heightSegments:r,depthSegments:a};let o=this;n=Math.floor(n),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],u=[],d=0,f=0;p("z","y","x",-1,-1,i,e,t,a,r,0),p("z","y","x",1,-1,i,e,-t,a,r,1),p("x","z","y",1,1,t,i,e,n,a,2),p("x","z","y",1,-1,t,i,-e,n,a,3),p("x","y","z",1,-1,t,e,i,n,r,4),p("x","y","z",-1,-1,t,e,-i,n,r,5),this.setIndex(l),this.setAttribute("position",new se(c,3)),this.setAttribute("normal",new se(h,3)),this.setAttribute("uv",new se(u,2));function p(v,m,g,x,b,y,E,w,R,_,A){let P=y/R,I=E/_,U=y/2,H=E/2,D=w/2,O=R+1,Z=_+1,Y=0,rt=0,$=new S;for(let Q=0;Q<Z;Q++){let it=Q*I-H;for(let Lt=0;Lt<O;Lt++){let Pt=Lt*P-U;$[v]=Pt*x,$[m]=it*b,$[g]=D,c.push($.x,$.y,$.z),$[v]=0,$[m]=0,$[g]=w>0?1:-1,h.push($.x,$.y,$.z),u.push(Lt/R),u.push(1-Q/_),Y+=1}}for(let Q=0;Q<_;Q++)for(let it=0;it<R;it++){let Lt=d+it+O*Q,Pt=d+it+O*(Q+1),oe=d+(it+1)+O*(Q+1),re=d+(it+1)+O*Q;l.push(Lt,Pt,re),l.push(Pt,oe,re),rt+=6}o.addGroup(f,rt,A),f+=rt,d+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Zn=class s extends ye{constructor(t=1,e=32,i=0,n=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:n},e=Math.max(3,e);let r=[],a=[],o=[],l=[],c=new S,h=new st;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=e;u++,d+=3){let f=i+u/e*n;c.x=t*Math.cos(f),c.y=t*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[d]/t+1)/2,h.y=(a[d+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new se(a,3)),this.setAttribute("normal",new se(o,3)),this.setAttribute("uv",new se(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Ke=class s extends ye{constructor(t=1,e=1,i=1,n=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:n,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;n=Math.floor(n),r=Math.floor(r);let h=[],u=[],d=[],f=[],p=0,v=[],m=i/2,g=0;x(),a===!1&&(t>0&&b(!0),e>0&&b(!1)),this.setIndex(h),this.setAttribute("position",new se(u,3)),this.setAttribute("normal",new se(d,3)),this.setAttribute("uv",new se(f,2));function x(){let y=new S,E=new S,w=0,R=(e-t)/i;for(let _=0;_<=r;_++){let A=[],P=_/r,I=P*(e-t)+t;for(let U=0;U<=n;U++){let H=U/n,D=H*l+o,O=Math.sin(D),Z=Math.cos(D);E.x=I*O,E.y=-P*i+m,E.z=I*Z,u.push(E.x,E.y,E.z),y.set(O,R,Z).normalize(),d.push(y.x,y.y,y.z),f.push(H,1-P),A.push(p++)}v.push(A)}for(let _=0;_<n;_++)for(let A=0;A<r;A++){let P=v[A][_],I=v[A+1][_],U=v[A+1][_+1],H=v[A][_+1];(t>0||A!==0)&&(h.push(P,I,H),w+=3),(e>0||A!==r-1)&&(h.push(I,U,H),w+=3)}c.addGroup(g,w,0),g+=w}function b(y){let E=p,w=new st,R=new S,_=0,A=y===!0?t:e,P=y===!0?1:-1;for(let U=1;U<=n;U++)u.push(0,m*P,0),d.push(0,P,0),f.push(.5,.5),p++;let I=p;for(let U=0;U<=n;U++){let D=U/n*l+o,O=Math.cos(D),Z=Math.sin(D);R.x=A*Z,R.y=m*P,R.z=A*O,u.push(R.x,R.y,R.z),d.push(0,P,0),w.x=O*.5+.5,w.y=Z*.5*P+.5,f.push(w.x,w.y),p++}for(let U=0;U<n;U++){let H=E+U,D=I+U;y===!0?h.push(D,D+1,H):h.push(D+1,D,H),_+=3}c.addGroup(g,_,y===!0?1:2),g+=_}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},vs=class s extends Ke{constructor(t=1,e=1,i=32,n=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,i,n,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:n,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new s(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ac=class s extends ye{constructor(t=[],e=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:n};let r=[],a=[];o(n),c(i),h(),this.setAttribute("position",new se(r,3)),this.setAttribute("normal",new se(r.slice(),3)),this.setAttribute("uv",new se(a,2)),n===0?this.computeVertexNormals():this.normalizeNormals();function o(x){let b=new S,y=new S,E=new S;for(let w=0;w<e.length;w+=3)f(e[w+0],b),f(e[w+1],y),f(e[w+2],E),l(b,y,E,x)}function l(x,b,y,E){let w=E+1,R=[];for(let _=0;_<=w;_++){R[_]=[];let A=x.clone().lerp(y,_/w),P=b.clone().lerp(y,_/w),I=w-_;for(let U=0;U<=I;U++)U===0&&_===w?R[_][U]=A:R[_][U]=A.clone().lerp(P,U/I)}for(let _=0;_<w;_++)for(let A=0;A<2*(w-_)-1;A++){let P=Math.floor(A/2);A%2===0?(d(R[_][P+1]),d(R[_+1][P]),d(R[_][P])):(d(R[_][P+1]),d(R[_+1][P+1]),d(R[_+1][P]))}}function c(x){let b=new S;for(let y=0;y<r.length;y+=3)b.x=r[y+0],b.y=r[y+1],b.z=r[y+2],b.normalize().multiplyScalar(x),r[y+0]=b.x,r[y+1]=b.y,r[y+2]=b.z}function h(){let x=new S;for(let b=0;b<r.length;b+=3){x.x=r[b+0],x.y=r[b+1],x.z=r[b+2];let y=m(x)/2/Math.PI+.5,E=g(x)/Math.PI+.5;a.push(y,1-E)}p(),u()}function u(){for(let x=0;x<a.length;x+=6){let b=a[x+0],y=a[x+2],E=a[x+4],w=Math.max(b,y,E),R=Math.min(b,y,E);w>.9&&R<.1&&(b<.2&&(a[x+0]+=1),y<.2&&(a[x+2]+=1),E<.2&&(a[x+4]+=1))}}function d(x){r.push(x.x,x.y,x.z)}function f(x,b){let y=x*3;b.x=t[y+0],b.y=t[y+1],b.z=t[y+2]}function p(){let x=new S,b=new S,y=new S,E=new S,w=new st,R=new st,_=new st;for(let A=0,P=0;A<r.length;A+=9,P+=6){x.set(r[A+0],r[A+1],r[A+2]),b.set(r[A+3],r[A+4],r[A+5]),y.set(r[A+6],r[A+7],r[A+8]),w.set(a[P+0],a[P+1]),R.set(a[P+2],a[P+3]),_.set(a[P+4],a[P+5]),E.copy(x).add(b).add(y).divideScalar(3);let I=m(E);v(w,P+0,x,I),v(R,P+2,b,I),v(_,P+4,y,I)}}function v(x,b,y,E){E<0&&x.x===1&&(a[b]=x.x-1),y.x===0&&y.z===0&&(a[b]=E/2/Math.PI+.5)}function m(x){return Math.atan2(x.z,-x.x)}function g(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.vertices,t.indices,t.radius,t.detail)}};var sn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Jt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let i=this.getUtoTmapping(t);return this.getPoint(i,e)}getPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return e}getSpacedPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPointAt(i/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],i,n=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)i=this.getPoint(a/t),r+=i.distanceTo(n),e.push(r),n=i;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let i=this.getLengths(),n=0,r=i.length,a;e?a=e:a=t*i[r-1];let o=0,l=r-1,c;for(;o<=l;)if(n=Math.floor(o+(l-o)/2),c=i[n]-a,c<0)o=n+1;else if(c>0)l=n-1;else{l=n;break}if(n=l,i[n]===a)return n/(r-1);let h=i[n],d=i[n+1]-h,f=(a-h)/d;return(n+f)/(r-1)}getTangent(t,e){let n=t-1e-4,r=t+1e-4;n<0&&(n=0),r>1&&(r=1);let a=this.getPoint(n),o=this.getPoint(r),l=e||(a.isVector2?new st:new S);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){let i=this.getUtoTmapping(t);return this.getTangent(i,e)}computeFrenetFrames(t,e=!1){let i=new S,n=[],r=[],a=[],o=new S,l=new be;for(let f=0;f<=t;f++){let p=f/t;n[f]=this.getTangentAt(p,new S)}r[0]=new S,a[0]=new S;let c=Number.MAX_VALUE,h=Math.abs(n[0].x),u=Math.abs(n[0].y),d=Math.abs(n[0].z);h<=c&&(c=h,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),d<=c&&i.set(0,0,1),o.crossVectors(n[0],i).normalize(),r[0].crossVectors(n[0],o),a[0].crossVectors(n[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(n[f-1],n[f]),o.length()>Number.EPSILON){o.normalize();let p=Math.acos(pe(n[f-1].dot(n[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,p))}a[f].crossVectors(n[f],r[f])}if(e===!0){let f=Math.acos(pe(r[0].dot(r[t]),-1,1));f/=t,n[0].dot(o.crossVectors(r[0],r[t]))>0&&(f=-f);for(let p=1;p<=t;p++)r[p].applyMatrix4(l.makeRotationAxis(n[p],f*p)),a[p].crossVectors(n[p],r[p])}return{tangents:n,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},$r=class extends sn{constructor(t=0,e=0,i=1,n=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=i,this.yRadius=n,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new st){let i=e,n=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=n;for(;r>n;)r-=n;r<Number.EPSILON&&(a?r=0:r=n),this.aClockwise===!0&&!a&&(r===n?r=-n:r=r-n);let o=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return i.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},oc=class extends $r{constructor(t,e,i,n,r,a){super(t,e,i,i,n,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function id(){let s=0,t=0,e=0,i=0;function n(r,a,o,l){s=r,t=o,e=-3*r+3*a-2*o-l,i=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){n(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let d=(a-r)/c-(o-r)/(c+h)+(o-a)/h,f=(o-a)/h-(l-a)/(h+u)+(l-o)/u;d*=h,f*=h,n(a,o,d,f)},calc:function(r){let a=r*r,o=a*r;return s+t*r+e*a+i*o}}}var Vf=new S,Gf=new S,Su=new id,Eu=new id,wu=new id,Jr=class extends sn{constructor(t=[],e=!1,i="centripetal",n=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=i,this.tension=n}getPoint(t,e=new S){let i=e,n=this.points,r=n.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=n[(o-1)%r]:(Gf.subVectors(n[0],n[1]).add(n[0]),c=Gf);let u=n[o%r],d=n[(o+1)%r];if(this.closed||o+2<r?h=n[(o+2)%r]:(Vf.subVectors(n[r-1],n[r-2]).add(n[r-1]),h=Vf),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,p=Math.pow(c.distanceToSquared(u),f),v=Math.pow(u.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(h),f);v<1e-4&&(v=1),p<1e-4&&(p=v),m<1e-4&&(m=v),Su.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,p,v,m),Eu.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,p,v,m),wu.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,p,v,m)}else this.curveType==="catmullrom"&&(Su.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),Eu.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),wu.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return i.set(Su.calc(l),Eu.calc(l),wu.calc(l)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(n.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let n=this.points[e];t.points.push(n.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(new S().fromArray(n))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function Wf(s,t,e,i,n){let r=(i-t)*.5,a=(n-e)*.5,o=s*s,l=s*o;return(2*e-2*i+r+a)*l+(-3*e+3*i-2*r-a)*o+r*s+e}function dg(s,t){let e=1-s;return e*e*t}function fg(s,t){return 2*(1-s)*s*t}function pg(s,t){return s*s*t}function $a(s,t,e,i){return dg(s,t)+fg(s,e)+pg(s,i)}function mg(s,t){let e=1-s;return e*e*e*t}function gg(s,t){let e=1-s;return 3*e*e*s*t}function vg(s,t){return 3*(1-s)*s*s*t}function xg(s,t){return s*s*s*t}function Ja(s,t,e,i,n){return mg(s,t)+gg(s,e)+vg(s,i)+xg(s,n)}var po=class extends sn{constructor(t=new st,e=new st,i=new st,n=new st){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=i,this.v3=n}getPoint(t,e=new st){let i=e,n=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(Ja(t,n.x,r.x,a.x,o.x),Ja(t,n.y,r.y,a.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},lc=class extends sn{constructor(t=new S,e=new S,i=new S,n=new S){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=i,this.v3=n}getPoint(t,e=new S){let i=e,n=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(Ja(t,n.x,r.x,a.x,o.x),Ja(t,n.y,r.y,a.y,o.y),Ja(t,n.z,r.z,a.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},mo=class extends sn{constructor(t=new st,e=new st){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new st){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new st){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Kr=class extends sn{constructor(t=new S,e=new S){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new S){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new S){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},go=class extends sn{constructor(t=new st,e=new st,i=new st){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new st){let i=e,n=this.v0,r=this.v1,a=this.v2;return i.set($a(t,n.x,r.x,a.x),$a(t,n.y,r.y,a.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},vo=class extends sn{constructor(t=new S,e=new S,i=new S){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new S){let i=e,n=this.v0,r=this.v1,a=this.v2;return i.set($a(t,n.x,r.x,a.x),$a(t,n.y,r.y,a.y),$a(t,n.z,r.z,a.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},xo=class extends sn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new st){let i=e,n=this.points,r=(n.length-1)*t,a=Math.floor(r),o=r-a,l=n[a===0?a:a-1],c=n[a],h=n[a>n.length-2?n.length-1:a+1],u=n[a>n.length-3?n.length-1:a+2];return i.set(Wf(o,l.x,c.x,h.x,u.x),Wf(o,l.y,c.y,h.y,u.y)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(n.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let n=this.points[e];t.points.push(n.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(new st().fromArray(n))}return this}},cc=Object.freeze({__proto__:null,ArcCurve:oc,CatmullRomCurve3:Jr,CubicBezierCurve:po,CubicBezierCurve3:lc,EllipseCurve:$r,LineCurve:mo,LineCurve3:Kr,QuadraticBezierCurve:go,QuadraticBezierCurve3:vo,SplineCurve:xo}),jr=class extends sn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let i=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new cc[i](e,t))}return this}getPoint(t,e){let i=t*this.getLength(),n=this.getCurveLengths(),r=0;for(;r<n.length;){if(n[r]>=i){let a=n[r]-i,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let i=0,n=this.curves.length;i<n;i++)e+=this.curves[i].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],i;for(let n=0,r=this.curves;n<r.length;n++){let a=r[n],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(e.push(h),i=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let n=t.curves[e];this.curves.push(n.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,i=this.curves.length;e<i;e++){let n=this.curves[e];t.curves.push(n.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let n=t.curves[e];this.curves.push(new cc[n.type]().fromJSON(n))}return this}},yo=class extends jr{constructor(t){super(),this.type="Path",this.currentPoint=new st,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,i=t.length;e<i;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let i=new mo(this.currentPoint.clone(),new st(t,e));return this.curves.push(i),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,i,n){let r=new go(this.currentPoint.clone(),new st(t,e),new st(i,n));return this.curves.push(r),this.currentPoint.set(i,n),this}bezierCurveTo(t,e,i,n,r,a){let o=new po(this.currentPoint.clone(),new st(t,e),new st(i,n),new st(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),i=new xo(e);return this.curves.push(i),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,i,n,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,i,n,r,a),this}absarc(t,e,i,n,r,a){return this.absellipse(t,e,i,i,n,r,a),this}ellipse(t,e,i,n,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,i,n,r,a,o,l),this}absellipse(t,e,i,n,r,a,o,l){let c=new $r(t,e,i,n,r,a,o,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},xs=class extends yo{constructor(t){super(t),this.uuid=kn(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let i=0,n=this.holes.length;i<n;i++)e[i]=this.holes[i].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let n=t.holes[e];this.holes.push(n.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,i=this.holes.length;e<i;e++){let n=this.holes[e];t.holes.push(n.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let n=t.holes[e];this.holes.push(new yo().fromJSON(n))}return this}};function yg(s,t,e=2){let i=t&&t.length,n=i?t[0]*e:s.length,r=Hp(s,0,n,e,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(i&&(r=Eg(s,t,r,e)),s.length>80*e){o=s[0],l=s[1];let h=o,u=l;for(let d=e;d<n;d+=e){let f=s[d],p=s[d+1];f<o&&(o=f),p<l&&(l=p),f>h&&(h=f),p>u&&(u=p)}c=Math.max(h-o,u-l),c=c!==0?32767/c:0}return _o(r,a,e,o,l,c,0),a}function Hp(s,t,e,i,n){let r;if(n===Ug(s,t,e,i)>0)for(let a=t;a<e;a+=i)r=qf(a/i|0,s[a],s[a+1],r);else for(let a=e-i;a>=t;a-=i)r=qf(a/i|0,s[a],s[a+1],r);return r&&Qr(r,r.next)&&(bo(r),r=r.next),r}function sr(s,t){if(!s)return s;t||(t=s);let e=s,i;do if(i=!1,!e.steiner&&(Qr(e,e.next)||ni(e.prev,e,e.next)===0)){if(bo(e),e=t=e.prev,e===e.next)break;i=!0}else e=e.next;while(i||e!==t);return t}function _o(s,t,e,i,n,r,a){if(!s)return;!a&&r&&Cg(s,i,n,r);let o=s;for(;s.prev!==s.next;){let l=s.prev,c=s.next;if(r?Mg(s,i,n,r):_g(s)){t.push(l.i,s.i,c.i),bo(s),s=c.next,o=c.next;continue}if(s=c,s===o){a?a===1?(s=bg(sr(s),t),_o(s,t,e,i,n,r,2)):a===2&&Sg(s,t,e,i,n,r):_o(sr(s),t,e,i,n,r,1);break}}}function _g(s){let t=s.prev,e=s,i=s.next;if(ni(t,e,i)>=0)return!1;let n=t.x,r=e.x,a=i.x,o=t.y,l=e.y,c=i.y,h=Math.min(n,r,a),u=Math.min(o,l,c),d=Math.max(n,r,a),f=Math.max(o,l,c),p=i.next;for(;p!==t;){if(p.x>=h&&p.x<=d&&p.y>=u&&p.y<=f&&Xa(n,o,r,l,a,c,p.x,p.y)&&ni(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function Mg(s,t,e,i){let n=s.prev,r=s,a=s.next;if(ni(n,r,a)>=0)return!1;let o=n.x,l=r.x,c=a.x,h=n.y,u=r.y,d=a.y,f=Math.min(o,l,c),p=Math.min(h,u,d),v=Math.max(o,l,c),m=Math.max(h,u,d),g=Du(f,p,t,e,i),x=Du(v,m,t,e,i),b=s.prevZ,y=s.nextZ;for(;b&&b.z>=g&&y&&y.z<=x;){if(b.x>=f&&b.x<=v&&b.y>=p&&b.y<=m&&b!==n&&b!==a&&Xa(o,h,l,u,c,d,b.x,b.y)&&ni(b.prev,b,b.next)>=0||(b=b.prevZ,y.x>=f&&y.x<=v&&y.y>=p&&y.y<=m&&y!==n&&y!==a&&Xa(o,h,l,u,c,d,y.x,y.y)&&ni(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;b&&b.z>=g;){if(b.x>=f&&b.x<=v&&b.y>=p&&b.y<=m&&b!==n&&b!==a&&Xa(o,h,l,u,c,d,b.x,b.y)&&ni(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;y&&y.z<=x;){if(y.x>=f&&y.x<=v&&y.y>=p&&y.y<=m&&y!==n&&y!==a&&Xa(o,h,l,u,c,d,y.x,y.y)&&ni(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function bg(s,t){let e=s;do{let i=e.prev,n=e.next.next;!Qr(i,n)&&kp(i,e,e.next,n)&&Mo(i,n)&&Mo(n,i)&&(t.push(i.i,e.i,n.i),bo(e),bo(e.next),e=s=n),e=e.next}while(e!==s);return sr(e)}function Sg(s,t,e,i,n,r){let a=s;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Lg(a,o)){let l=Vp(a,o);a=sr(a,a.next),l=sr(l,l.next),_o(a,t,e,i,n,r,0),_o(l,t,e,i,n,r,0);return}o=o.next}a=a.next}while(a!==s)}function Eg(s,t,e,i){let n=[];for(let r=0,a=t.length;r<a;r++){let o=t[r]*i,l=r<a-1?t[r+1]*i:s.length,c=Hp(s,o,l,i,!1);c===c.next&&(c.steiner=!0),n.push(Ig(c))}n.sort(wg);for(let r=0;r<n.length;r++)e=Tg(n[r],e);return e}function wg(s,t){let e=s.x-t.x;if(e===0&&(e=s.y-t.y,e===0)){let i=(s.next.y-s.y)/(s.next.x-s.x),n=(t.next.y-t.y)/(t.next.x-t.x);e=i-n}return e}function Tg(s,t){let e=Ag(s,t);if(!e)return t;let i=Vp(e,s);return sr(i,i.next),sr(e,e.next)}function Ag(s,t){let e=t,i=s.x,n=s.y,r=-1/0,a;if(Qr(s,e))return e;do{if(Qr(s,e.next))return e.next;if(n<=e.y&&n>=e.next.y&&e.next.y!==e.y){let u=e.x+(n-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(u<=i&&u>r&&(r=u,a=e.x<e.next.x?e:e.next,u===i))return a}e=e.next}while(e!==t);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;e=a;do{if(i>=e.x&&e.x>=l&&i!==e.x&&zp(n<c?i:r,n,l,c,n<c?r:i,n,e.x,e.y)){let u=Math.abs(n-e.y)/(i-e.x);Mo(e,s)&&(u<h||u===h&&(e.x>a.x||e.x===a.x&&Rg(a,e)))&&(a=e,h=u)}e=e.next}while(e!==o);return a}function Rg(s,t){return ni(s.prev,s,t.prev)<0&&ni(t.next,s,s.next)<0}function Cg(s,t,e,i){let n=s;do n.z===0&&(n.z=Du(n.x,n.y,t,e,i)),n.prevZ=n.prev,n.nextZ=n.next,n=n.next;while(n!==s);n.prevZ.nextZ=null,n.prevZ=null,Pg(n)}function Pg(s){let t,e=1;do{let i=s,n;s=null;let r=null;for(t=0;i;){t++;let a=i,o=0;for(let c=0;c<e&&(o++,a=a.nextZ,!!a);c++);let l=e;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||i.z<=a.z)?(n=i,i=i.nextZ,o--):(n=a,a=a.nextZ,l--),r?r.nextZ=n:s=n,n.prevZ=r,r=n;i=a}r.nextZ=null,e*=2}while(t>1);return s}function Du(s,t,e,i,n){return s=(s-e)*n|0,t=(t-i)*n|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,s|t<<1}function Ig(s){let t=s,e=s;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==s);return e}function zp(s,t,e,i,n,r,a,o){return(n-a)*(t-o)>=(s-a)*(r-o)&&(s-a)*(i-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(n-a)*(i-o)}function Xa(s,t,e,i,n,r,a,o){return!(s===a&&t===o)&&zp(s,t,e,i,n,r,a,o)}function Lg(s,t){return s.next.i!==t.i&&s.prev.i!==t.i&&!Dg(s,t)&&(Mo(s,t)&&Mo(t,s)&&Ng(s,t)&&(ni(s.prev,s,t.prev)||ni(s,t.prev,t))||Qr(s,t)&&ni(s.prev,s,s.next)>0&&ni(t.prev,t,t.next)>0)}function ni(s,t,e){return(t.y-s.y)*(e.x-t.x)-(t.x-s.x)*(e.y-t.y)}function Qr(s,t){return s.x===t.x&&s.y===t.y}function kp(s,t,e,i){let n=kl(ni(s,t,e)),r=kl(ni(s,t,i)),a=kl(ni(e,i,s)),o=kl(ni(e,i,t));return!!(n!==r&&a!==o||n===0&&zl(s,e,t)||r===0&&zl(s,i,t)||a===0&&zl(e,s,i)||o===0&&zl(e,t,i))}function zl(s,t,e){return t.x<=Math.max(s.x,e.x)&&t.x>=Math.min(s.x,e.x)&&t.y<=Math.max(s.y,e.y)&&t.y>=Math.min(s.y,e.y)}function kl(s){return s>0?1:s<0?-1:0}function Dg(s,t){let e=s;do{if(e.i!==s.i&&e.next.i!==s.i&&e.i!==t.i&&e.next.i!==t.i&&kp(e,e.next,s,t))return!0;e=e.next}while(e!==s);return!1}function Mo(s,t){return ni(s.prev,s,s.next)<0?ni(s,t,s.next)>=0&&ni(s,s.prev,t)>=0:ni(s,t,s.prev)<0||ni(s,s.next,t)<0}function Ng(s,t){let e=s,i=!1,n=(s.x+t.x)/2,r=(s.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&n<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(i=!i),e=e.next;while(e!==s);return i}function Vp(s,t){let e=Nu(s.i,s.x,s.y),i=Nu(t.i,t.x,t.y),n=s.next,r=t.prev;return s.next=t,t.prev=s,e.next=n,n.prev=e,i.next=e,e.prev=i,r.next=i,i.prev=r,i}function qf(s,t,e,i){let n=Nu(s,t,e);return i?(n.next=i.next,n.prev=i,i.next.prev=n,i.next=n):(n.prev=n,n.next=n),n}function bo(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Nu(s,t,e){return{i:s,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Ug(s,t,e,i){let n=0;for(let r=t,a=e-i;r<e;r+=i)n+=(s[a]-s[r])*(s[r+1]+s[a+1]),a=r;return n}var Uu=class{static triangulate(t,e,i=2){return yg(t,e,i)}},zn=class s{static area(t){let e=t.length,i=0;for(let n=e-1,r=0;r<e;n=r++)i+=t[n].x*t[r].y-t[r].x*t[n].y;return i*.5}static isClockWise(t){return s.area(t)<0}static triangulateShape(t,e){let i=[],n=[],r=[];Xf(t),Yf(i,t);let a=t.length;e.forEach(Xf);for(let l=0;l<e.length;l++)n.push(a),a+=e[l].length,Yf(i,e[l]);let o=Uu.triangulate(i,n);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function Xf(s){let t=s.length;t>2&&s[t-1].equals(s[0])&&s.pop()}function Yf(s,t){for(let e=0;e<t.length;e++)s.push(t[e].x),s.push(t[e].y)}var So=class s extends ye{constructor(t=new xs([new st(.5,.5),new st(-.5,.5),new st(-.5,-.5),new st(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let i=this,n=[],r=[];for(let o=0,l=t.length;o<l;o++){let c=t[o];a(c)}this.setAttribute("position",new se(n,3)),this.setAttribute("uv",new se(r,2)),this.computeVertexNormals();function a(o){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,p=e.bevelSize!==void 0?e.bevelSize:f-.1,v=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3,g=e.extrudePath,x=e.UVGenerator!==void 0?e.UVGenerator:Fg,b,y=!1,E,w,R,_;if(g){b=g.getSpacedPoints(h),y=!0,d=!1;let nt=g.isCatmullRomCurve3?g.closed:!1;E=g.computeFrenetFrames(h,nt),w=new S,R=new S,_=new S}d||(m=0,f=0,p=0,v=0);let A=o.extractPoints(c),P=A.shape,I=A.holes;if(!zn.isClockWise(P)){P=P.reverse();for(let nt=0,ct=I.length;nt<ct;nt++){let dt=I[nt];zn.isClockWise(dt)&&(I[nt]=dt.reverse())}}function H(nt){let dt=10000000000000001e-36,ft=nt[0];for(let mt=1;mt<=nt.length;mt++){let Zt=mt%nt.length,qt=nt[Zt],Kt=qt.x-ft.x,te=qt.y-ft.y,L=Kt*Kt+te*te,Te=Math.max(Math.abs(qt.x),Math.abs(qt.y),Math.abs(ft.x),Math.abs(ft.y)),fe=dt*Te*Te;if(L<=fe){nt.splice(Zt,1),mt--;continue}ft=qt}}H(P),I.forEach(H);let D=I.length,O=P;for(let nt=0;nt<D;nt++){let ct=I[nt];P=P.concat(ct)}function Z(nt,ct,dt){return ct||jt("ExtrudeGeometry: vec does not exist"),nt.clone().addScaledVector(ct,dt)}let Y=P.length;function rt(nt,ct,dt){let ft,mt,Zt,qt=nt.x-ct.x,Kt=nt.y-ct.y,te=dt.x-nt.x,L=dt.y-nt.y,Te=qt*qt+Kt*Kt,fe=qt*L-Kt*te;if(Math.abs(fe)>Number.EPSILON){let C=Math.sqrt(Te),M=Math.sqrt(te*te+L*L),B=ct.x-Kt/C,G=ct.y+qt/C,J=dt.x-L/M,pt=dt.y+te/M,gt=((J-B)*L-(pt-G)*te)/(qt*L-Kt*te);ft=B+qt*gt-nt.x,mt=G+Kt*gt-nt.y;let K=ft*ft+mt*mt;if(K<=2)return new st(ft,mt);Zt=Math.sqrt(K/2)}else{let C=!1;qt>Number.EPSILON?te>Number.EPSILON&&(C=!0):qt<-Number.EPSILON?te<-Number.EPSILON&&(C=!0):Math.sign(Kt)===Math.sign(L)&&(C=!0),C?(ft=-Kt,mt=qt,Zt=Math.sqrt(Te)):(ft=qt,mt=Kt,Zt=Math.sqrt(Te/2))}return new st(ft/Zt,mt/Zt)}let $=[];for(let nt=0,ct=O.length,dt=ct-1,ft=nt+1;nt<ct;nt++,dt++,ft++)dt===ct&&(dt=0),ft===ct&&(ft=0),$[nt]=rt(O[nt],O[dt],O[ft]);let Q=[],it,Lt=$.concat();for(let nt=0,ct=D;nt<ct;nt++){let dt=I[nt];it=[];for(let ft=0,mt=dt.length,Zt=mt-1,qt=ft+1;ft<mt;ft++,Zt++,qt++)Zt===mt&&(Zt=0),qt===mt&&(qt=0),it[ft]=rt(dt[ft],dt[Zt],dt[qt]);Q.push(it),Lt=Lt.concat(it)}let Pt;if(m===0)Pt=zn.triangulateShape(O,I);else{let nt=[],ct=[];for(let dt=0;dt<m;dt++){let ft=dt/m,mt=f*Math.cos(ft*Math.PI/2),Zt=p*Math.sin(ft*Math.PI/2)+v;for(let qt=0,Kt=O.length;qt<Kt;qt++){let te=Z(O[qt],$[qt],Zt);vt(te.x,te.y,-mt),ft===0&&nt.push(te)}for(let qt=0,Kt=D;qt<Kt;qt++){let te=I[qt];it=Q[qt];let L=[];for(let Te=0,fe=te.length;Te<fe;Te++){let C=Z(te[Te],it[Te],Zt);vt(C.x,C.y,-mt),ft===0&&L.push(C)}ft===0&&ct.push(L)}}Pt=zn.triangulateShape(nt,ct)}let oe=Pt.length,re=p+v;for(let nt=0;nt<Y;nt++){let ct=d?Z(P[nt],Lt[nt],re):P[nt];y?(R.copy(E.normals[0]).multiplyScalar(ct.x),w.copy(E.binormals[0]).multiplyScalar(ct.y),_.copy(b[0]).add(R).add(w),vt(_.x,_.y,_.z)):vt(ct.x,ct.y,0)}for(let nt=1;nt<=h;nt++)for(let ct=0;ct<Y;ct++){let dt=d?Z(P[ct],Lt[ct],re):P[ct];y?(R.copy(E.normals[nt]).multiplyScalar(dt.x),w.copy(E.binormals[nt]).multiplyScalar(dt.y),_.copy(b[nt]).add(R).add(w),vt(_.x,_.y,_.z)):vt(dt.x,dt.y,u/h*nt)}for(let nt=m-1;nt>=0;nt--){let ct=nt/m,dt=f*Math.cos(ct*Math.PI/2),ft=p*Math.sin(ct*Math.PI/2)+v;for(let mt=0,Zt=O.length;mt<Zt;mt++){let qt=Z(O[mt],$[mt],ft);vt(qt.x,qt.y,u+dt)}for(let mt=0,Zt=I.length;mt<Zt;mt++){let qt=I[mt];it=Q[mt];for(let Kt=0,te=qt.length;Kt<te;Kt++){let L=Z(qt[Kt],it[Kt],ft);y?vt(L.x,L.y+b[h-1].y,b[h-1].x+dt):vt(L.x,L.y,u+dt)}}}ae(),q();function ae(){let nt=n.length/3;if(d){let ct=0,dt=Y*ct;for(let ft=0;ft<oe;ft++){let mt=Pt[ft];Wt(mt[2]+dt,mt[1]+dt,mt[0]+dt)}ct=h+m*2,dt=Y*ct;for(let ft=0;ft<oe;ft++){let mt=Pt[ft];Wt(mt[0]+dt,mt[1]+dt,mt[2]+dt)}}else{for(let ct=0;ct<oe;ct++){let dt=Pt[ct];Wt(dt[2],dt[1],dt[0])}for(let ct=0;ct<oe;ct++){let dt=Pt[ct];Wt(dt[0]+Y*h,dt[1]+Y*h,dt[2]+Y*h)}}i.addGroup(nt,n.length/3-nt,0)}function q(){let nt=n.length/3,ct=0;j(O,ct),ct+=O.length;for(let dt=0,ft=I.length;dt<ft;dt++){let mt=I[dt];j(mt,ct),ct+=mt.length}i.addGroup(nt,n.length/3-nt,1)}function j(nt,ct){let dt=nt.length;for(;--dt>=0;){let ft=dt,mt=dt-1;mt<0&&(mt=nt.length-1);for(let Zt=0,qt=h+m*2;Zt<qt;Zt++){let Kt=Y*Zt,te=Y*(Zt+1),L=ct+ft+Kt,Te=ct+mt+Kt,fe=ct+mt+te,C=ct+ft+te;Et(L,Te,fe,C)}}}function vt(nt,ct,dt){l.push(nt),l.push(ct),l.push(dt)}function Wt(nt,ct,dt){Yt(nt),Yt(ct),Yt(dt);let ft=n.length/3,mt=x.generateTopUV(i,n,ft-3,ft-2,ft-1);me(mt[0]),me(mt[1]),me(mt[2])}function Et(nt,ct,dt,ft){Yt(nt),Yt(ct),Yt(ft),Yt(ct),Yt(dt),Yt(ft);let mt=n.length/3,Zt=x.generateSideWallUV(i,n,mt-6,mt-3,mt-2,mt-1);me(Zt[0]),me(Zt[1]),me(Zt[3]),me(Zt[1]),me(Zt[2]),me(Zt[3])}function Yt(nt){n.push(l[nt*3+0]),n.push(l[nt*3+1]),n.push(l[nt*3+2])}function me(nt){r.push(nt.x),r.push(nt.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,i=this.parameters.options;return Bg(e,i,t)}static fromJSON(t,e){let i=[];for(let r=0,a=t.shapes.length;r<a;r++){let o=e[t.shapes[r]];i.push(o)}let n=t.options.extrudePath;return n!==void 0&&(t.options.extrudePath=new cc[n.type]().fromJSON(n)),new s(i,t.options)}},Fg={generateTopUV:function(s,t,e,i,n){let r=t[e*3],a=t[e*3+1],o=t[i*3],l=t[i*3+1],c=t[n*3],h=t[n*3+1];return[new st(r,a),new st(o,l),new st(c,h)]},generateSideWallUV:function(s,t,e,i,n,r){let a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[i*3],h=t[i*3+1],u=t[i*3+2],d=t[n*3],f=t[n*3+1],p=t[n*3+2],v=t[r*3],m=t[r*3+1],g=t[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new st(a,1-l),new st(c,1-u),new st(d,1-p),new st(v,1-g)]:[new st(o,1-l),new st(h,1-u),new st(f,1-p),new st(m,1-g)]}};function Bg(s,t,e){if(e.shapes=[],Array.isArray(s))for(let i=0,n=s.length;i<n;i++){let r=s[i];e.shapes.push(r.uuid)}else e.shapes.push(s.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Eo=class s extends ac{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,n=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(n,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new s(t.radius,t.detail)}};var ti=class s extends ye{constructor(t=1,e=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:n};let r=t/2,a=e/2,o=Math.floor(i),l=Math.floor(n),c=o+1,h=l+1,u=t/o,d=e/l,f=[],p=[],v=[],m=[];for(let g=0;g<h;g++){let x=g*d-a;for(let b=0;b<c;b++){let y=b*u-r;p.push(y,-x,0),v.push(0,0,1),m.push(b/o),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let x=0;x<o;x++){let b=x+c*g,y=x+c*(g+1),E=x+1+c*(g+1),w=x+1+c*g;f.push(b,y,w),f.push(y,E,w)}this.setIndex(f),this.setAttribute("position",new se(p,3)),this.setAttribute("normal",new se(v,3)),this.setAttribute("uv",new se(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.widthSegments,t.heightSegments)}},ys=class s extends ye{constructor(t=.5,e=1,i=32,n=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:n,thetaStart:r,thetaLength:a},i=Math.max(3,i),n=Math.max(1,n);let o=[],l=[],c=[],h=[],u=t,d=(e-t)/n,f=new S,p=new st;for(let v=0;v<=n;v++){for(let m=0;m<=i;m++){let g=r+m/i*a;f.x=u*Math.cos(g),f.y=u*Math.sin(g),l.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/e+1)/2,p.y=(f.y/e+1)/2,h.push(p.x,p.y)}u+=d}for(let v=0;v<n;v++){let m=v*(i+1);for(let g=0;g<i;g++){let x=g+m,b=x,y=x+i+1,E=x+i+2,w=x+1;o.push(b,y,w),o.push(y,E,w)}}this.setIndex(o),this.setAttribute("position",new se(l,3)),this.setAttribute("normal",new se(c,3)),this.setAttribute("uv",new se(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},wo=class s extends ye{constructor(t=new xs([new st(0,.5),new st(-.5,-.5),new st(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};let i=[],n=[],r=[],a=[],o=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let h=0;h<t.length;h++)c(t[h]),this.addGroup(o,l,h),o+=l,l=0;this.setIndex(i),this.setAttribute("position",new se(n,3)),this.setAttribute("normal",new se(r,3)),this.setAttribute("uv",new se(a,2));function c(h){let u=n.length/3,d=h.extractPoints(e),f=d.shape,p=d.holes;zn.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,g=p.length;m<g;m++){let x=p[m];zn.isClockWise(x)===!0&&(p[m]=x.reverse())}let v=zn.triangulateShape(f,p);for(let m=0,g=p.length;m<g;m++){let x=p[m];f=f.concat(x)}for(let m=0,g=f.length;m<g;m++){let x=f[m];n.push(x.x,x.y,0),r.push(0,0,1),a.push(x.x,x.y)}for(let m=0,g=v.length;m<g;m++){let x=v[m],b=x[0]+u,y=x[1]+u,E=x[2]+u;i.push(b,y,E),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes;return Og(e,t)}static fromJSON(t,e){let i=[];for(let n=0,r=t.shapes.length;n<r;n++){let a=e[t.shapes[n]];i.push(a)}return new s(i,t.curveSegments)}};function Og(s,t){if(t.shapes=[],Array.isArray(s))for(let e=0,i=s.length;e<i;e++){let n=s[e];t.shapes.push(n.uuid)}else t.shapes.push(s.uuid);return t}var ai=class s extends ye{constructor(t=1,e=32,i=16,n=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:n,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let l=Math.min(a+o,Math.PI),c=0,h=[],u=new S,d=new S,f=[],p=[],v=[],m=[];for(let g=0;g<=i;g++){let x=[],b=g/i,y=a+b*o,E=t*Math.cos(y),w=Math.sqrt(t*t-E*E),R=0;g===0&&a===0?R=.5/e:g===i&&l===Math.PI&&(R=-.5/e);for(let _=0;_<=e;_++){let A=_/e,P=n+A*r;u.x=-w*Math.cos(P),u.y=E,u.z=w*Math.sin(P),p.push(u.x,u.y,u.z),d.copy(u).normalize(),v.push(d.x,d.y,d.z),m.push(A+R,1-b),x.push(c++)}h.push(x)}for(let g=0;g<i;g++)for(let x=0;x<e;x++){let b=h[g][x+1],y=h[g][x],E=h[g+1][x],w=h[g+1][x+1];(g!==0||a>0)&&f.push(b,y,w),(g!==i-1||l<Math.PI)&&f.push(y,E,w)}this.setIndex(f),this.setAttribute("position",new se(p,3)),this.setAttribute("normal",new se(v,3)),this.setAttribute("uv",new se(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var pn=class s extends ye{constructor(t=1,e=.4,i=12,n=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:n,arc:r,thetaStart:a,thetaLength:o},i=Math.floor(i),n=Math.floor(n);let l=[],c=[],h=[],u=[],d=new S,f=new S,p=new S;for(let v=0;v<=i;v++){let m=a+v/i*o;for(let g=0;g<=n;g++){let x=g/n*r;f.x=(t+e*Math.cos(m))*Math.cos(x),f.y=(t+e*Math.cos(m))*Math.sin(x),f.z=e*Math.sin(m),c.push(f.x,f.y,f.z),d.x=t*Math.cos(x),d.y=t*Math.sin(x),p.subVectors(f,d).normalize(),h.push(p.x,p.y,p.z),u.push(g/n),u.push(v/i)}}for(let v=1;v<=i;v++)for(let m=1;m<=n;m++){let g=(n+1)*v+m-1,x=(n+1)*(v-1)+m-1,b=(n+1)*(v-1)+m,y=(n+1)*v+m;l.push(g,x,y),l.push(x,b,y)}this.setIndex(l),this.setAttribute("position",new se(c,3)),this.setAttribute("normal",new se(h,3)),this.setAttribute("uv",new se(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};var To=class s extends ye{constructor(t=new vo(new S(-1,-1,0),new S(-1,1,0),new S(1,1,0)),e=64,i=1,n=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:i,radialSegments:n,closed:r};let a=t.computeFrenetFrames(e,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new S,l=new S,c=new st,h=new S,u=[],d=[],f=[],p=[];v(),this.setIndex(p),this.setAttribute("position",new se(u,3)),this.setAttribute("normal",new se(d,3)),this.setAttribute("uv",new se(f,2));function v(){for(let b=0;b<e;b++)m(b);m(r===!1?e:0),x(),g()}function m(b){h=t.getPointAt(b/e,h);let y=a.normals[b],E=a.binormals[b];for(let w=0;w<=n;w++){let R=w/n*Math.PI*2,_=Math.sin(R),A=-Math.cos(R);l.x=A*y.x+_*E.x,l.y=A*y.y+_*E.y,l.z=A*y.z+_*E.z,l.normalize(),d.push(l.x,l.y,l.z),o.x=h.x+i*l.x,o.y=h.y+i*l.y,o.z=h.z+i*l.z,u.push(o.x,o.y,o.z)}}function g(){for(let b=1;b<=e;b++)for(let y=1;y<=n;y++){let E=(n+1)*(b-1)+(y-1),w=(n+1)*b+(y-1),R=(n+1)*b+y,_=(n+1)*(b-1)+y;p.push(E,w,_),p.push(w,R,_)}}function x(){for(let b=0;b<=e;b++)for(let y=0;y<=n;y++)c.x=b/e,c.y=y/n,f.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new s(new cc[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};function hr(s){let t={};for(let e in s){t[e]={};for(let i in s[e]){let n=s[e][i];if(Zf(n))n.isRenderTargetTexture?(Jt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=n.clone();else if(Array.isArray(n))if(Zf(n[0])){let r=[];for(let a=0,o=n.length;a<o;a++)r[a]=n[a].clone();t[e][i]=r}else t[e][i]=n.slice();else t[e][i]=n}}return t}function Oi(s){let t={};for(let e=0;e<s.length;e++){let i=hr(s[e]);for(let n in i)t[n]=i[n]}return t}function Zf(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function Hg(s){let t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function nd(s){let t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ge.workingColorSpace}var Ms={clone:hr,merge:Oi},zg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,kg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ue=class extends Xn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=zg,this.fragmentShader=kg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=hr(t.uniforms),this.uniformsGroups=Hg(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let n in this.uniforms){let a=this.uniforms[n].value;a&&a.isTexture?e.uniforms[n]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[n]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[n]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[n]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[n]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[n]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[n]={type:"m4",value:a.toArray()}:e.uniforms[n]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let n=t.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=e[n.value]||null;break;case"c":this.uniforms[i].value=new St().setHex(n.value);break;case"v2":this.uniforms[i].value=new st().fromArray(n.value);break;case"v3":this.uniforms[i].value=new S().fromArray(n.value);break;case"v4":this.uniforms[i].value=new je().fromArray(n.value);break;case"m3":this.uniforms[i].value=new ee().fromArray(n.value);break;case"m4":this.uniforms[i].value=new be().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},ta=class extends ue{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Qt=class extends Xn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new St(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new St(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=uh,this.normalScale=new st(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ps,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},rr=class extends Qt{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new st(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return pe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new St(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new St(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new St(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var hc=class extends Xn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ep,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},uc=class extends Xn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Ur(s,t){return!s||s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function Tu(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}var Ns=class{constructor(t,e,i,n){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,n=e[i],r=e[i-1];i:{t:{let a;e:{n:if(!(t<n)){for(let o=i+2;;){if(n===void 0){if(t<r)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=n,n=e[++i],t<n)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(i=2,r=o);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(n=r,r=e[--i-1],t>=r)break t}a=i,i=0;break e}break i}for(;i<a;){let o=i+a>>>1;t<e[o]?a=o:i=o+1}if(n=e[i],r=e[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,n)}return this.interpolate_(i,r,t,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,n=this.valueSize,r=t*n;for(let a=0;a!==n;++a)e[a]=i[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},dc=class extends Ns{constructor(t,e,i,n){super(t,e,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Cu,endingEnd:Cu}}intervalChanged_(t,e,i){let n=this.parameterPositions,r=t-2,a=t+1,o=n[r],l=n[a];if(o===void 0)switch(this.getSettings_().endingStart){case Pu:r=t,o=2*e-i;break;case Iu:r=n.length-2,o=e+n[r]-n[r+1];break;default:r=t,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Pu:a=t,l=2*i-e;break;case Iu:a=1,l=i+n[1]-n[0];break;default:a=t-1,l=e}let c=(i-e)*.5,h=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(t,e,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(i-e)/(n-e),v=p*p,m=v*p,g=-d*m+2*d*v-d*p,x=(1+d)*m+(-1.5-2*d)*v+(-.5+d)*p+1,b=(-1-f)*m+(1.5+f)*v+.5*p,y=f*m-f*v;for(let E=0;E!==o;++E)r[E]=g*a[h+E]+x*a[c+E]+b*a[l+E]+y*a[u+E];return r}},fc=class extends Ns{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=(i-e)/(n-e),u=1-h;for(let d=0;d!==o;++d)r[d]=a[c+d]*u+a[l+d]*h;return r}},pc=class extends Ns{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t){return this.copySampleValue_(t-1)}},mc=class extends Ns{interpolate_(t,e,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this.inTangents,u=this.outTangents;if(!h||!u){let p=(i-e)/(n-e),v=1-p;for(let m=0;m!==o;++m)r[m]=a[c+m]*v+a[l+m]*p;return r}let d=o*2,f=t-1;for(let p=0;p!==o;++p){let v=a[c+p],m=a[l+p],g=f*d+p*2,x=u[g],b=u[g+1],y=t*d+p*2,E=h[y],w=h[y+1],R=Gg(i,e,x,E,n);r[p]=Gp(R,v,b,w,m)}return r}};function Gp(s,t,e,i,n){let r=1-s;return r*r*r*t+3*r*r*s*e+3*r*s*s*i+s*s*s*n}function Vg(s,t,e,i,n){let r=1-s;return 3*r*r*(e-t)+6*r*s*(i-e)+3*s*s*(n-i)}function Gg(s,t,e,i,n){let r=(s-t)/(n-t);for(let a=0;a<8;a++){let o=Gp(r,t,e,i,n)-s;if(Math.abs(o)<1e-10)break;let l=Vg(r,t,e,i,n);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var rn=class{constructor(t,e,i,n){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Ur(e,this.TimeBufferType),this.values=Ur(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:Ur(t.times,Array),values:Ur(t.values,Array)};let n=t.getInterpolation();n!==t.DefaultInterpolation&&(i.interpolation=n),Tu(t.settings)&&(i.settings={inTangents:Ur(t.settings.inTangents,Array),outTangents:Ur(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new pc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new fc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new dc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new mc(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Ka:e=this.InterpolantFactoryMethodDiscrete;break;case tc:e=this.InterpolantFactoryMethodLinear;break;case Wl:e=this.InterpolantFactoryMethodSmooth;break;case Ru:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Jt("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ka;case this.InterpolantFactoryMethodLinear:return tc;case this.InterpolantFactoryMethodSmooth:return Wl;case this.InterpolantFactoryMethodBezier:return Ru}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]*=t;Tu(this.settings)&&($f(this.settings.inTangents,t),$f(this.settings.outTangents,t))}return this}trim(t,e){let i=this.times,n=i.length,r=0,a=n-1;for(;r!==n&&i[r]<t;)++r;for(;a!==-1&&i[a]>e;)--a;if(++a,r!==0||a!==n){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(jt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,n=this.values,r=i.length;r===0&&(jt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){jt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){jt("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(n!==void 0&&P0(n))for(let o=0,l=n.length;o!==l;++o){let c=n[o];if(isNaN(c)){jt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===Wl,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],h=t[o+1];if(c!==h&&(o!==1||c!==t[0]))if(n)l=!0;else{let u=o*i,d=u-i,f=u+i;for(let p=0;p!==i;++p){let v=e[u+p];if(v!==e[d+p]||v!==e[f+p]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let u=o*i,d=a*i;for(let f=0;f!==i;++f)e[d+f]=e[u+f]}++a}}if(r>0){t[a]=t[r];for(let o=r*i,l=a*i,c=0;c!==i;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,n=new i(this.name,t,e);return n.createInterpolant=this.createInterpolant,Tu(this.settings)&&(n.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),n}};function $f(s,t){for(let e=0,i=s.length;e!==i;e+=2)s[e]*=t}rn.prototype.ValueTypeName="";rn.prototype.TimeBufferType=Float32Array;rn.prototype.ValueBufferType=Float32Array;rn.prototype.DefaultInterpolation=tc;var Us=class extends rn{constructor(t,e,i){super(t,e,i)}};Us.prototype.ValueTypeName="bool";Us.prototype.ValueBufferType=Array;Us.prototype.DefaultInterpolation=Ka;Us.prototype.InterpolantFactoryMethodLinear=void 0;Us.prototype.InterpolantFactoryMethodSmooth=void 0;var gc=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}};gc.prototype.ValueTypeName="color";var vc=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}};vc.prototype.ValueTypeName="number";var xc=class extends Ns{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(i-e)/(n-e),c=t*o;for(let h=c+o;c!==h;c+=4)le.slerpFlat(r,0,a,c-o,a,c,l);return r}},Ao=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}InterpolantFactoryMethodLinear(t){return new xc(this.times,this.values,this.getValueSize(),t)}};Ao.prototype.ValueTypeName="quaternion";Ao.prototype.InterpolantFactoryMethodSmooth=void 0;var Fs=class extends rn{constructor(t,e,i){super(t,e,i)}};Fs.prototype.ValueTypeName="string";Fs.prototype.ValueBufferType=Array;Fs.prototype.DefaultInterpolation=Ka;Fs.prototype.InterpolantFactoryMethodLinear=void 0;Fs.prototype.InterpolantFactoryMethodSmooth=void 0;var yc=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}};yc.prototype.ValueTypeName="vector";var _c=class{constructor(t,e,i){let n=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,r===!1&&n.onStart!==void 0&&n.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,n.onProgress!==void 0&&n.onProgress(h,a,o),a===o&&(r=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],p=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Wp=new _c,Mc=class{constructor(t){this.manager=t!==void 0?t:Wp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(n,r){i.load(t,n,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Mc.DEFAULT_MATERIAL_NAME="__DEFAULT";var ea=class extends Ti{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new St(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Ro=class extends ea{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ti.DEFAULT_UP),this.updateMatrix(),this.groundColor=new St(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Au=new be,Jf=new S,Kf=new S,Co=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new st(512,512),this.mapType=Bi,this.map=null,this.mapPass=null,this.matrix=new be,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Yr,this._frameExtents=new st(1,1),this._viewportCount=1,this._viewports=[new je(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Jf.setFromMatrixPosition(t.matrixWorld),e.position.copy(Jf),Kf.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Kf),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,n){Au.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(Au,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=n?n.z/r.x:1,o=n?n.w/r.y:1,l=n?n.x/r.x:0,c=n?n.y/r.y:0;t.coordinateSystem===zr||t.reversedDepth?e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(Au)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Vl=new S,Gl=new le,On=new S,Po=class extends Ti{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new be,this.projectionMatrix=new be,this.projectionMatrixInverse=new be,this.coordinateSystem=Cn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Vl,Gl,On),On.x===1&&On.y===1&&On.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Vl,Gl,On.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(Vl,Gl,On),On.x===1&&On.y===1&&On.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Vl,Gl,On.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ls=new S,jf=new st,Qf=new st,ii=class extends Po{constructor(t=50,e=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Vr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Ya*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Vr*2*Math.atan(Math.tan(Ya*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){Ls.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Ls.x,Ls.y).multiplyScalar(-t/Ls.z),Ls.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ls.x,Ls.y).multiplyScalar(-t/Ls.z)}getViewSize(t,e){return this.getViewBounds(t,jf,Qf),e.subVectors(Qf,jf)}setViewOffset(t,e,i,n,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Ya*.5*this.fov)/this.zoom,i=2*e,n=this.aspect*i,r=-.5*n,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*n/l,e-=a.offsetY*i/c,n*=a.width/l,i*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+n,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Fu=class extends Co{constructor(){super(new ii(90,1,.5,500)),this.isPointLightShadow=!0}},Io=class extends ea{constructor(t,e,i=0,n=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=n,this.shadow=new Fu}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},$n=class extends Po{constructor(t=-1,e=1,i=1,n=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=n,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,n,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2,r=i-t,a=i+t,o=n+e,l=n-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Bu=class extends Co{constructor(){super(new $n(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Lo=class extends ea{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ti.DEFAULT_UP),this.updateMatrix(),this.target=new Ti,this.shadow=new Bu}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Do=class extends ye{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}};var Fr=-90,Br=1,bc=class extends Ti{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let n=new ii(Fr,Br,t,e);n.layers=this.layers,this.add(n);let r=new ii(Fr,Br,t,e);r.layers=this.layers,this.add(r);let a=new ii(Fr,Br,t,e);a.layers=this.layers,this.add(a);let o=new ii(Fr,Br,t,e);o.layers=this.layers,this.add(o);let l=new ii(Fr,Br,t,e);l.layers=this.layers,this.add(l);let c=new ii(Fr,Br,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,n,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===Cn)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===zr)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),p=t.xr.enabled;t.xr.enabled=!1;let v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(i,0,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(i,1,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,2,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,3,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(i,4,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),i.texture.generateMipmaps=v,t.setRenderTarget(i,5,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=p,i.texture.needsPMREMUpdate=!0}},Sc=class extends ii{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}},No=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(t){this._document=t,t.hidden!==void 0&&(this._pageVisibilityHandler=Wg.bind(this),t.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(t){return this._timescale=t,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(t){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(t!==void 0?t:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function Wg(){this._document.hidden===!1&&this.reset()}var sd="\\[\\]\\.:\\/",qg=new RegExp("["+sd+"]","g"),rd="[^"+sd+"]",Xg="[^"+sd.replace("\\.","")+"]",Yg=/((?:WC+[\/:])*)/.source.replace("WC",rd),Zg=/(WCOD+)?/.source.replace("WCOD",Xg),$g=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",rd),Jg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",rd),Kg=new RegExp("^"+Yg+Zg+$g+Jg+"$"),jg=["material","materials","bones","map"],Ou=class{constructor(t,e,i){let n=i||Je.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,n)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,n=this._bindings[i];n!==void 0&&n.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let n=this._targetGroup.nCachedObjects_,r=i.length;n!==r;++n)i[n].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},Je=class s{constructor(t,e,i){this.path=e,this.parsedPath=i||s.parseTrackName(e),this.node=s.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new s.Composite(t,e,i):new s(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(qg,"")}static parseTrackName(t){let e=Kg.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},n=i.nodeName&&i.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let r=i.nodeName.substring(n+1);jg.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,n),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=i(o.children);if(l)return l}return null},n=i(t.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)t[e++]=i[n]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,n=e.propertyName,r=e.propertyIndex;if(t||(t=s.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Jt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=e.objectIndex;switch(i){case"materials":if(!t.material){jt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){jt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){jt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){jt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){jt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){jt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){jt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[n];if(a===void 0){let c=e.nodeName;jt("PropertyBinding: Trying to update property for track: "+c+"."+n+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(n==="morphTargetInfluences"){if(!t.geometry){jt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){jt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=n;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Je.Composite=Ou;Je.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Je.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Je.prototype.GetterByBindingType=[Je.prototype._getValue_direct,Je.prototype._getValue_array,Je.prototype._getValue_arrayElement,Je.prototype._getValue_toArray];Je.prototype.SetterByBindingTypeAndVersioning=[[Je.prototype._setValue_direct,Je.prototype._setValue_direct_setNeedsUpdate,Je.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_array,Je.prototype._setValue_array_setNeedsUpdate,Je.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_arrayElement,Je.prototype._setValue_arrayElement_setNeedsUpdate,Je.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_fromArray,Je.prototype._setValue_fromArray_setNeedsUpdate,Je.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var nS=new Float32Array(1);var ud=class ud{constructor(t,e,i,n){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,n){let r=this.elements;return r[0]=t,r[2]=e,r[1]=i,r[3]=n,this}};ud.prototype.isMatrix2=!0;var Hu=ud;function ad(s,t,e,i){let n=Qg(i);switch(e){case Ku:return s*t;case Ic:return s*t/n.components*n.byteLength;case Lc:return s*t/n.components*n.byteLength;case ks:return s*t*2/n.components*n.byteLength;case Dc:return s*t*2/n.components*n.byteLength;case ju:return s*t*3/n.components*n.byteLength;case xn:return s*t*4/n.components*n.byteLength;case Nc:return s*t*4/n.components*n.byteLength;case Go:case Wo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case qo:case Xo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Fc:case Oc:return Math.max(s,16)*Math.max(t,8)/4;case Uc:case Bc:return Math.max(s,8)*Math.max(t,8)/2;case Hc:case zc:case Vc:case Gc:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case kc:case Yo:case Wc:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case qc:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Xc:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case Yc:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case Zc:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case $c:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case Jc:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case Kc:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case jc:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case Qc:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case th:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case eh:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case ih:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case nh:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case sh:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case rh:case ah:case oh:return Math.ceil(s/4)*Math.ceil(t/4)*16;case lh:case ch:return Math.ceil(s/4)*Math.ceil(t/4)*8;case Zo:case hh:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Qg(s){switch(s){case Bi:case Yu:return{byteLength:1,components:1};case na:case Zu:case hi:return{byteLength:2,components:1};case Cc:case Pc:return{byteLength:2,components:4};case In:case Rc:case vn:return{byteLength:4,components:1};case $u:case Ju:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Jt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function dm(){let s=null,t=!1,e=null,i=null;function n(r,a){i=s.requestAnimationFrame(n),e(r,a)}return{start:function(){t!==!0&&e!==null&&s!==null&&(i=s.requestAnimationFrame(n),t=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function sv(s){let t=new WeakMap;function e(o,l){let c=o.array,h=o.usage,u=c.byteLength,d=s.createBuffer();s.bindBuffer(l,d),s.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=s.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function i(o,l,c){let h=l.array,u=l.updateRanges;if(s.bindBuffer(c,o),u.length===0)s.bufferSubData(c,0,h);else{u.sort((f,p)=>f.start-p.start);let d=0;for(let f=1;f<u.length;f++){let p=u[d],v=u[f];v.start<=p.start+p.count+1?p.count=Math.max(p.count,v.start+v.count-p.start):(++d,u[d]=v)}u.length=d+1;for(let f=0,p=u.length;f<p;f++){let v=u[f];s.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function n(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(s.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:n,remove:r,update:a}}var rv=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,av=`#ifdef USE_ALPHAHASH
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
#endif`,ov=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,lv=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,cv=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,hv=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,uv=`#ifdef USE_AOMAP
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
#endif`,dv=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,fv=`#ifdef USE_BATCHING
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
#endif`,pv=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,mv=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,gv=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,vv=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,xv=`#ifdef USE_IRIDESCENCE
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
#endif`,yv=`#ifdef USE_BUMPMAP
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
#endif`,_v=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Mv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,bv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Sv=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Ev=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,wv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Tv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Av=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Rv=`#define PI 3.141592653589793
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
} // validated`,Cv=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Pv=`vec3 transformedNormal = objectNormal;
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
#endif`,Iv=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Lv=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Dv=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Nv=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Uv="gl_FragColor = linearToOutputTexel( gl_FragColor );",Fv=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Bv=`#ifdef USE_ENVMAP
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
#endif`,Ov=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Hv=`#ifdef USE_ENVMAP
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
#endif`,zv=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,kv=`#ifdef USE_ENVMAP
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
#endif`,Vv=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Gv=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Wv=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,qv=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Xv=`#ifdef USE_GRADIENTMAP
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
}`,Yv=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Zv=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,$v=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Jv=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Kv=`#ifdef USE_ENVMAP
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
#endif`,jv=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Qv=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,tx=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,ex=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ix=`PhysicalMaterial material;
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
#endif`,nx=`uniform sampler2D dfgLUT;
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
}`,sx=`
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
#endif`,rx=`#if defined( RE_IndirectDiffuse )
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
#endif`,ax=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ox=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,lx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,cx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ux=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,dx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,fx=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,px=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,mx=`#if defined( USE_POINTS_UV )
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
#endif`,gx=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,vx=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,xx=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,yx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,_x=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Mx=`#ifdef USE_MORPHTARGETS
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
#endif`,bx=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Sx=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Ex=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,wx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Tx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ax=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Rx=`#ifdef USE_NORMALMAP
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
#endif`,Cx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Px=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Ix=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Lx=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Dx=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Nx=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Ux=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Fx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Bx=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ox=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Hx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,zx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,kx=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Vx=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Gx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Wx=`float getShadowMask() {
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
}`,qx=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Xx=`#ifdef USE_SKINNING
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
#endif`,Yx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Zx=`#ifdef USE_SKINNING
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
#endif`,$x=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Jx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Kx=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,jx=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Qx=`#ifdef USE_TRANSMISSION
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
#endif`,ty=`#ifdef USE_TRANSMISSION
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
#endif`,ey=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,iy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ny=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,sy=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,ry=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,ay=`uniform sampler2D t2D;
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
}`,oy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ly=`#ifdef ENVMAP_TYPE_CUBE
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
}`,cy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,hy=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,uy=`#include <common>
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
}`,dy=`#if DEPTH_PACKING == 3200
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
}`,fy=`#define DISTANCE
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
}`,py=`#define DISTANCE
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
}`,my=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,gy=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vy=`uniform float scale;
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
}`,xy=`uniform vec3 diffuse;
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
}`,yy=`#include <common>
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
}`,_y=`uniform vec3 diffuse;
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
}`,My=`#define LAMBERT
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
}`,by=`#define LAMBERT
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
}`,Sy=`#define MATCAP
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
}`,Ey=`#define MATCAP
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
}`,wy=`#define NORMAL
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
}`,Ty=`#define NORMAL
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
}`,Ay=`#define PHONG
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
}`,Ry=`#define PHONG
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
}`,Cy=`#define STANDARD
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
}`,Py=`#define STANDARD
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
}`,Iy=`#define TOON
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
}`,Ly=`#define TOON
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
}`,Dy=`uniform float size;
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
}`,Ny=`uniform vec3 diffuse;
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
}`,Uy=`#include <common>
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
}`,Fy=`uniform vec3 color;
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
}`,By=`uniform float rotation;
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
}`,Oy=`uniform vec3 diffuse;
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
}`,de={alphahash_fragment:rv,alphahash_pars_fragment:av,alphamap_fragment:ov,alphamap_pars_fragment:lv,alphatest_fragment:cv,alphatest_pars_fragment:hv,aomap_fragment:uv,aomap_pars_fragment:dv,batching_pars_vertex:fv,batching_vertex:pv,begin_vertex:mv,beginnormal_vertex:gv,bsdfs:vv,iridescence_fragment:xv,bumpmap_pars_fragment:yv,clipping_planes_fragment:_v,clipping_planes_pars_fragment:Mv,clipping_planes_pars_vertex:bv,clipping_planes_vertex:Sv,color_fragment:Ev,color_pars_fragment:wv,color_pars_vertex:Tv,color_vertex:Av,common:Rv,cube_uv_reflection_fragment:Cv,defaultnormal_vertex:Pv,displacementmap_pars_vertex:Iv,displacementmap_vertex:Lv,emissivemap_fragment:Dv,emissivemap_pars_fragment:Nv,colorspace_fragment:Uv,colorspace_pars_fragment:Fv,envmap_fragment:Bv,envmap_common_pars_fragment:Ov,envmap_pars_fragment:Hv,envmap_pars_vertex:zv,envmap_physical_pars_fragment:Kv,envmap_vertex:kv,fog_vertex:Vv,fog_pars_vertex:Gv,fog_fragment:Wv,fog_pars_fragment:qv,gradientmap_pars_fragment:Xv,lightmap_pars_fragment:Yv,lights_lambert_fragment:Zv,lights_lambert_pars_fragment:$v,lights_pars_begin:Jv,lights_toon_fragment:jv,lights_toon_pars_fragment:Qv,lights_phong_fragment:tx,lights_phong_pars_fragment:ex,lights_physical_fragment:ix,lights_physical_pars_fragment:nx,lights_fragment_begin:sx,lights_fragment_maps:rx,lights_fragment_end:ax,lightprobes_pars_fragment:ox,logdepthbuf_fragment:lx,logdepthbuf_pars_fragment:cx,logdepthbuf_pars_vertex:hx,logdepthbuf_vertex:ux,map_fragment:dx,map_pars_fragment:fx,map_particle_fragment:px,map_particle_pars_fragment:mx,metalnessmap_fragment:gx,metalnessmap_pars_fragment:vx,morphinstance_vertex:xx,morphcolor_vertex:yx,morphnormal_vertex:_x,morphtarget_pars_vertex:Mx,morphtarget_vertex:bx,normal_fragment_begin:Sx,normal_fragment_maps:Ex,normal_pars_fragment:wx,normal_pars_vertex:Tx,normal_vertex:Ax,normalmap_pars_fragment:Rx,clearcoat_normal_fragment_begin:Cx,clearcoat_normal_fragment_maps:Px,clearcoat_pars_fragment:Ix,iridescence_pars_fragment:Lx,opaque_fragment:Dx,packing:Nx,premultiplied_alpha_fragment:Ux,project_vertex:Fx,dithering_fragment:Bx,dithering_pars_fragment:Ox,roughnessmap_fragment:Hx,roughnessmap_pars_fragment:zx,shadowmap_pars_fragment:kx,shadowmap_pars_vertex:Vx,shadowmap_vertex:Gx,shadowmask_pars_fragment:Wx,skinbase_vertex:qx,skinning_pars_vertex:Xx,skinning_vertex:Yx,skinnormal_vertex:Zx,specularmap_fragment:$x,specularmap_pars_fragment:Jx,tonemapping_fragment:Kx,tonemapping_pars_fragment:jx,transmission_fragment:Qx,transmission_pars_fragment:ty,uv_pars_fragment:ey,uv_pars_vertex:iy,uv_vertex:ny,worldpos_vertex:sy,background_vert:ry,background_frag:ay,backgroundCube_vert:oy,backgroundCube_frag:ly,cube_vert:cy,cube_frag:hy,depth_vert:uy,depth_frag:dy,distance_vert:fy,distance_frag:py,equirect_vert:my,equirect_frag:gy,linedashed_vert:vy,linedashed_frag:xy,meshbasic_vert:yy,meshbasic_frag:_y,meshlambert_vert:My,meshlambert_frag:by,meshmatcap_vert:Sy,meshmatcap_frag:Ey,meshnormal_vert:wy,meshnormal_frag:Ty,meshphong_vert:Ay,meshphong_frag:Ry,meshphysical_vert:Cy,meshphysical_frag:Py,meshtoon_vert:Iy,meshtoon_frag:Ly,points_vert:Dy,points_frag:Ny,shadow_vert:Uy,shadow_frag:Fy,sprite_vert:By,sprite_frag:Oy},Tt={common:{diffuse:{value:new St(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ee},alphaMap:{value:null},alphaMapTransform:{value:new ee},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ee}},envmap:{envMap:{value:null},envMapRotation:{value:new ee},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ee}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ee}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ee},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ee},normalScale:{value:new st(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ee},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ee}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ee}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ee}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new St(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new S},probesMax:{value:new S},probesResolution:{value:new S}},points:{diffuse:{value:new St(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ee},alphaTest:{value:0},uvTransform:{value:new ee}},sprite:{diffuse:{value:new St(16777215)},opacity:{value:1},center:{value:new st(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ee},alphaMap:{value:null},alphaMapTransform:{value:new ee},alphaTest:{value:0}}},Kn={basic:{uniforms:Oi([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.fog]),vertexShader:de.meshbasic_vert,fragmentShader:de.meshbasic_frag},lambert:{uniforms:Oi([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,Tt.lights,{emissive:{value:new St(0)},envMapIntensity:{value:1}}]),vertexShader:de.meshlambert_vert,fragmentShader:de.meshlambert_frag},phong:{uniforms:Oi([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,Tt.lights,{emissive:{value:new St(0)},specular:{value:new St(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:de.meshphong_vert,fragmentShader:de.meshphong_frag},standard:{uniforms:Oi([Tt.common,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.roughnessmap,Tt.metalnessmap,Tt.fog,Tt.lights,{emissive:{value:new St(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:de.meshphysical_vert,fragmentShader:de.meshphysical_frag},toon:{uniforms:Oi([Tt.common,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.gradientmap,Tt.fog,Tt.lights,{emissive:{value:new St(0)}}]),vertexShader:de.meshtoon_vert,fragmentShader:de.meshtoon_frag},matcap:{uniforms:Oi([Tt.common,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,{matcap:{value:null}}]),vertexShader:de.meshmatcap_vert,fragmentShader:de.meshmatcap_frag},points:{uniforms:Oi([Tt.points,Tt.fog]),vertexShader:de.points_vert,fragmentShader:de.points_frag},dashed:{uniforms:Oi([Tt.common,Tt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:de.linedashed_vert,fragmentShader:de.linedashed_frag},depth:{uniforms:Oi([Tt.common,Tt.displacementmap]),vertexShader:de.depth_vert,fragmentShader:de.depth_frag},normal:{uniforms:Oi([Tt.common,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,{opacity:{value:1}}]),vertexShader:de.meshnormal_vert,fragmentShader:de.meshnormal_frag},sprite:{uniforms:Oi([Tt.sprite,Tt.fog]),vertexShader:de.sprite_vert,fragmentShader:de.sprite_frag},background:{uniforms:{uvTransform:{value:new ee},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:de.background_vert,fragmentShader:de.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ee}},vertexShader:de.backgroundCube_vert,fragmentShader:de.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:de.cube_vert,fragmentShader:de.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:de.equirect_vert,fragmentShader:de.equirect_frag},distance:{uniforms:Oi([Tt.common,Tt.displacementmap,{referencePosition:{value:new S},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:de.distance_vert,fragmentShader:de.distance_frag},shadow:{uniforms:Oi([Tt.lights,Tt.fog,{color:{value:new St(0)},opacity:{value:1}}]),vertexShader:de.shadow_vert,fragmentShader:de.shadow_frag}};Kn.physical={uniforms:Oi([Kn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ee},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ee},clearcoatNormalScale:{value:new st(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ee},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ee},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ee},sheen:{value:0},sheenColor:{value:new St(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ee},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ee},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ee},transmissionSamplerSize:{value:new st},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ee},attenuationDistance:{value:0},attenuationColor:{value:new St(0)},specularColor:{value:new St(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ee},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ee},anisotropyVector:{value:new st},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ee}}]),vertexShader:de.meshphysical_vert,fragmentShader:de.meshphysical_frag};var ph={r:0,b:0,g:0},Hy=new be,fm=new ee;fm.set(-1,0,0,0,1,0,0,0,1);function zy(s,t,e,i,n,r){let a=new St(0),o=n===!0?0:1,l,c,h=null,u=0,d=null;function f(x){let b=x.isScene===!0?x.background:null;if(b&&b.isTexture){let y=x.backgroundBlurriness>0;b=t.get(b,y)}return b}function p(x){let b=!1,y=f(x);y===null?m(a,o):y&&y.isColor&&(m(y,1),b=!0);let E=s.xr.getEnvironmentBlendMode();E==="additive"?e.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(s.autoClear||b)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function v(x,b){let y=f(b);y&&(y.isCubeTexture||y.mapping===ko)?(c===void 0&&(c=new at(new He(1,1,1),new ue({name:"BackgroundCubeMaterial",uniforms:hr(Kn.backgroundCube.uniforms),vertexShader:Kn.backgroundCube.vertexShader,fragmentShader:Kn.backgroundCube.fragmentShader,side:yi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,w,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Hy.makeRotationFromEuler(b.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(fm),c.material.toneMapped=ge.getTransfer(y.colorSpace)!==Ce,(h!==y||u!==y.version||d!==s.toneMapping)&&(c.material.needsUpdate=!0,h=y,u=y.version,d=s.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new at(new ti(2,2),new ue({name:"BackgroundMaterial",uniforms:hr(Kn.background.uniforms),vertexShader:Kn.background.vertexShader,fragmentShader:Kn.background.fragmentShader,side:Bs,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.toneMapped=ge.getTransfer(y.colorSpace)!==Ce,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||u!==y.version||d!==s.toneMapping)&&(l.material.needsUpdate=!0,h=y,u=y.version,d=s.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function m(x,b){x.getRGB(ph,nd(s)),e.buffers.color.setClear(ph.r,ph.g,ph.b,b,r)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(x,b=1){a.set(x),o=b,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(x){o=x,m(a,o)},render:p,addToRenderList:v,dispose:g}}function ky(s,t){let e=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},n=d(null),r=n,a=!1;function o(I,U,H,D,O){let Z=!1,Y=u(I,D,H,U);r!==Y&&(r=Y,c(r.object)),Z=f(I,D,H,O),Z&&p(I,D,H,O),O!==null&&t.update(O,s.ELEMENT_ARRAY_BUFFER),(Z||a)&&(a=!1,y(I,U,H,D),O!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(O).buffer))}function l(){return s.createVertexArray()}function c(I){return s.bindVertexArray(I)}function h(I){return s.deleteVertexArray(I)}function u(I,U,H,D){let O=D.wireframe===!0,Z=i[U.id];Z===void 0&&(Z={},i[U.id]=Z);let Y=I.isInstancedMesh===!0?I.id:0,rt=Z[Y];rt===void 0&&(rt={},Z[Y]=rt);let $=rt[H.id];$===void 0&&($={},rt[H.id]=$);let Q=$[O];return Q===void 0&&(Q=d(l()),$[O]=Q),Q}function d(I){let U=[],H=[],D=[];for(let O=0;O<e;O++)U[O]=0,H[O]=0,D[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:H,attributeDivisors:D,object:I,attributes:{},index:null}}function f(I,U,H,D){let O=r.attributes,Z=U.attributes,Y=0,rt=H.getAttributes();for(let $ in rt)if(rt[$].location>=0){let it=O[$],Lt=Z[$];if(Lt===void 0&&($==="instanceMatrix"&&I.instanceMatrix&&(Lt=I.instanceMatrix),$==="instanceColor"&&I.instanceColor&&(Lt=I.instanceColor)),it===void 0||it.attribute!==Lt||Lt&&it.data!==Lt.data)return!0;Y++}return r.attributesNum!==Y||r.index!==D}function p(I,U,H,D){let O={},Z=U.attributes,Y=0,rt=H.getAttributes();for(let $ in rt)if(rt[$].location>=0){let it=Z[$];it===void 0&&($==="instanceMatrix"&&I.instanceMatrix&&(it=I.instanceMatrix),$==="instanceColor"&&I.instanceColor&&(it=I.instanceColor));let Lt={};Lt.attribute=it,it&&it.data&&(Lt.data=it.data),O[$]=Lt,Y++}r.attributes=O,r.attributesNum=Y,r.index=D}function v(){let I=r.newAttributes;for(let U=0,H=I.length;U<H;U++)I[U]=0}function m(I){g(I,0)}function g(I,U){let H=r.newAttributes,D=r.enabledAttributes,O=r.attributeDivisors;H[I]=1,D[I]===0&&(s.enableVertexAttribArray(I),D[I]=1),O[I]!==U&&(s.vertexAttribDivisor(I,U),O[I]=U)}function x(){let I=r.newAttributes,U=r.enabledAttributes;for(let H=0,D=U.length;H<D;H++)U[H]!==I[H]&&(s.disableVertexAttribArray(H),U[H]=0)}function b(I,U,H,D,O,Z,Y){Y===!0?s.vertexAttribIPointer(I,U,H,O,Z):s.vertexAttribPointer(I,U,H,D,O,Z)}function y(I,U,H,D){v();let O=D.attributes,Z=H.getAttributes(),Y=U.defaultAttributeValues;for(let rt in Z){let $=Z[rt];if($.location>=0){let Q=O[rt];if(Q===void 0&&(rt==="instanceMatrix"&&I.instanceMatrix&&(Q=I.instanceMatrix),rt==="instanceColor"&&I.instanceColor&&(Q=I.instanceColor)),Q!==void 0){let it=Q.normalized,Lt=Q.itemSize,Pt=t.get(Q);if(Pt===void 0)continue;let oe=Pt.buffer,re=Pt.type,ae=Pt.bytesPerElement,q=re===s.INT||re===s.UNSIGNED_INT||Q.gpuType===Rc;if(Q.isInterleavedBufferAttribute){let j=Q.data,vt=j.stride,Wt=Q.offset;if(j.isInstancedInterleavedBuffer){for(let Et=0;Et<$.locationSize;Et++)g($.location+Et,j.meshPerAttribute);I.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let Et=0;Et<$.locationSize;Et++)m($.location+Et);s.bindBuffer(s.ARRAY_BUFFER,oe);for(let Et=0;Et<$.locationSize;Et++)b($.location+Et,Lt/$.locationSize,re,it,vt*ae,(Wt+Lt/$.locationSize*Et)*ae,q)}else{if(Q.isInstancedBufferAttribute){for(let j=0;j<$.locationSize;j++)g($.location+j,Q.meshPerAttribute);I.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let j=0;j<$.locationSize;j++)m($.location+j);s.bindBuffer(s.ARRAY_BUFFER,oe);for(let j=0;j<$.locationSize;j++)b($.location+j,Lt/$.locationSize,re,it,Lt*ae,Lt/$.locationSize*j*ae,q)}}else if(Y!==void 0){let it=Y[rt];if(it!==void 0)switch(it.length){case 2:s.vertexAttrib2fv($.location,it);break;case 3:s.vertexAttrib3fv($.location,it);break;case 4:s.vertexAttrib4fv($.location,it);break;default:s.vertexAttrib1fv($.location,it)}}}}x()}function E(){A();for(let I in i){let U=i[I];for(let H in U){let D=U[H];for(let O in D){let Z=D[O];for(let Y in Z)h(Z[Y].object),delete Z[Y];delete D[O]}}delete i[I]}}function w(I){if(i[I.id]===void 0)return;let U=i[I.id];for(let H in U){let D=U[H];for(let O in D){let Z=D[O];for(let Y in Z)h(Z[Y].object),delete Z[Y];delete D[O]}}delete i[I.id]}function R(I){for(let U in i){let H=i[U];for(let D in H){let O=H[D];if(O[I.id]===void 0)continue;let Z=O[I.id];for(let Y in Z)h(Z[Y].object),delete Z[Y];delete O[I.id]}}}function _(I){for(let U in i){let H=i[U],D=I.isInstancedMesh===!0?I.id:0,O=H[D];if(O!==void 0){for(let Z in O){let Y=O[Z];for(let rt in Y)h(Y[rt].object),delete Y[rt];delete O[Z]}delete H[D],Object.keys(H).length===0&&delete i[U]}}}function A(){P(),a=!0,r!==n&&(r=n,c(r.object))}function P(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:o,reset:A,resetDefaultState:P,dispose:E,releaseStatesOfGeometry:w,releaseStatesOfObject:_,releaseStatesOfProgram:R,initAttributes:v,enableAttribute:m,disableUnusedAttributes:x}}function Vy(s,t,e){let i;function n(l){i=l}function r(l,c){s.drawArrays(i,l,c),e.update(c,i,1)}function a(l,c,h){h!==0&&(s.drawArraysInstanced(i,l,c,h),e.update(c,i,h))}function o(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];e.update(d,i,1)}this.setMode=n,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Gy(s,t,e,i){let n;function r(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let R=t.get("EXT_texture_filter_anisotropic");n=s.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function a(R){return!(R!==xn&&i.convert(R)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){let _=R===hi&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==Bi&&R!==vn&&!_&&i.convert(R)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(R){if(R==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Jt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&d===!1&&Jt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),p=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),g=s.getParameter(s.MAX_VERTEX_ATTRIBS),x=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),b=s.getParameter(s.MAX_VARYING_VECTORS),y=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),E=s.getParameter(s.MAX_SAMPLES),w=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:p,maxTextureSize:v,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:x,maxVaryings:b,maxFragmentUniforms:y,maxSamples:E,samples:w}}function Wy(s){let t=this,e=null,i=0,n=!1,r=!1,a=new Wi,o=new ee,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||i!==0||n;return n=d,i=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){let p=u.clippingPlanes,v=u.clipIntersection,m=u.clipShadows,g=s.get(u);if(!n||p===null||p.length===0||r&&!m)r?h(null):c();else{let x=r?0:i,b=x*4,y=g.clippingState||null;l.value=y,y=h(p,d,b,f);for(let E=0;E!==b;++E)y[E]=e[E];g.clippingState=y,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(u,d,f,p){let v=u!==null?u.length:0,m=null;if(v!==0){if(m=l.value,p!==!0||m===null){let g=f+v*4,x=d.matrixWorldInverse;o.getNormalMatrix(x),(m===null||m.length<g)&&(m=new Float32Array(g));for(let b=0,y=f;b!==v;++b,y+=4)a.copy(u[b]).applyMatrix4(x,o),a.normal.toArray(m,y),m[y+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,m}}var aa=4,qy=6,Xy=20,Yy=256,$o=new $n,qp=new St,dd=null,fd=0,pd=0,md=!1,Zy=new S,ur=new S,la=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,i=.1,n=100,r={}){let{size:a=256,position:o=Zy}=r;dd=this._renderer.getRenderTarget(),fd=this._renderer.getActiveCubeFace(),pd=this._renderer.getActiveMipmapLevel(),md=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,n,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Zp(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Yp(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(dd,fd,pd),this._renderer.xr.enabled=md,t.scissorTest=!1,ra(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Os||t.mapping===cr?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),dd=this._renderer.getRenderTarget(),fd=this._renderer.getActiveCubeFace(),pd=this._renderer.getActiveMipmapLevel(),md=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:mi,minFilter:mi,generateMipmaps:!1,type:hi,format:xn,colorSpace:ja,depthBuffer:!1},n=Xp(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Xp(t,e,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=$y(r)),this._blurMaterial=Ky(r,t,e),this._ggxMaterial=Jy(r,t,e)}return n}_compileMaterial(t){let e=new at(new ye,t);this._renderer.compile(e,$o)}_sceneToCubeUV(t,e,i,n,r){let l=new ii(90,1,e,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(qp),u.toneMapping=Pn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(n),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new at(new He,new ve({name:"PMREM.Background",side:yi,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,m=v.material,g=!1,x=t.background;x?x.isColor&&(m.color.copy(x),t.background=null,g=!0):(m.color.copy(qp),g=!0);for(let b=0;b<6;b++){let y=b%3;y===0?(l.up.set(0,c[b],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[b],r.y,r.z)):y===1?(l.up.set(0,0,c[b]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[b],r.z)):(l.up.set(0,c[b],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[b]));let E=this._cubeSize;ra(n,y*E,b>2?E:0,E,E),u.setRenderTarget(n),g&&u.render(v,l),u.render(t,l)}u.toneMapping=f,u.autoClear=d,t.background=x}_textureToCubeUV(t,e){let i=this._renderer,n=t.mapping===Os||t.mapping===cr;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=Zp()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Yp());let r=n?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;ra(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(a,$o)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let n=this._lodMeshes.length;for(let r=1;r<n;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=i}_applyGGXFilter(t,e,i){let n=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;let l=a.uniforms,c=i/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=c*1.25,f=u*d,{_lodMax:p}=this,v=this._sizeLods[i],m=3*v*(i>p-aa?i-p+aa:0),g=4*(this._cubeSize-v);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=p-e,ra(r,m,g,3*v,2*v),n.setRenderTarget(r),n.render(o,$o),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=p-i,ra(t,m,g,3*v,2*v),n.setRenderTarget(t),n.render(o,$o)}_blur(t,e,i,n){let r=this._pingPongRenderTarget,a=Math.min(n,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,i,a),this._blurPass(r,t,i,i,a)}_blurPass(t,e,i,n,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[n];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[n],u=3*h*(n>this._lodMax-aa?n-this._lodMax+aa:0),d=4*(this._cubeSize-h);ra(e,u,d,3*h,2*h),a.setRenderTarget(e),a.render(l,$o)}};function $y(s){let t=[],e=[],i=s,n=s-aa+1+qy;for(let r=0;r<n;r++){let a=Math.pow(2,i);t.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,f=3,p=new Float32Array(f*d*u),v=new Float32Array(f*d*u);for(let g=0;g<u;g++){let x=g%3*2/3-1,b=g>2?0:-1,y=[x,b,0,x+2/3,b,0,x+2/3,b+1,0,x,b,0,x+2/3,b+1,0,x,b+1,0];p.set(y,f*d*g);for(let E=0;E<d;E++){let w=h[E*2]*2-1,R=h[E*2+1]*2-1;g===0?ur.set(1,R,w):g===1?ur.set(-w,1,-R):g===2?ur.set(-w,R,1):g===3?ur.set(-1,R,-w):g===4?ur.set(-w,-1,R):ur.set(w,R,-1),ur.toArray(v,(g*d+E)*f)}}let m=new ye;m.setAttribute("position",new Se(p,f)),m.setAttribute("outputDirection",new Se(v,f)),e.push(new at(m,null)),i>aa&&i--}return{lodMeshes:e,sizeLods:t}}function Xp(s,t,e){let i=new Qe(s,t,e);return i.texture.mapping=ko,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function ra(s,t,e,i,n){s.viewport.set(t,e,i,n),s.scissor.set(t,e,i,n)}function Jy(s,t,e){return new ue({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Yy,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:xh(),fragmentShader:`

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
		`,blending:mn,depthTest:!1,depthWrite:!1})}function Ky(s,t,e){return new ue({name:"SphericalGaussianBlur",defines:{SAMPLES:Xy,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:xh(),fragmentShader:`

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
		`,blending:mn,depthTest:!1,depthWrite:!1})}function Yp(){return new ue({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:xh(),fragmentShader:`

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
		`,blending:mn,depthTest:!1,depthWrite:!1})}function Zp(){return new ue({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:xh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:mn,depthTest:!1,depthWrite:!1})}function xh(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var gh=class extends Qe{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},n=[i,i,i,i,i,i];this.texture=new uo(n),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},n=new He(5,5,5),r=new ue({name:"CubemapFromEquirect",uniforms:hr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:yi,blending:mn});r.uniforms.tEquirect.value=e;let a=new at(n,r),o=e.minFilter;return e.minFilter===Hs&&(e.minFilter=mi),new bc(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,i=!0,n=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,i,n);t.setRenderTarget(r)}};function jy(s){let t=new WeakMap,e=new WeakMap,i=null;function n(d,f=!1){return d==null?null:f?a(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===wc||f===Tc)if(t.has(d)){let p=t.get(d).texture;return o(p,d.mapping)}else{let p=d.image;if(p&&p.height>0){let v=new gh(p.height);return v.fromEquirectangularTexture(s,d),t.set(d,v),d.addEventListener("dispose",c),o(v.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture){let f=d.mapping,p=f===wc||f===Tc,v=f===Os||f===cr;if(p||v){let m=e.get(d),g=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==g)return i===null&&(i=new la(s)),m=p?i.fromEquirectangular(d,m):i.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),m.texture;if(m!==void 0)return m.texture;{let x=d.image;return p&&x&&x.height>0||v&&x&&l(x)?(i===null&&(i=new la(s)),m=p?i.fromEquirectangular(d):i.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),d.addEventListener("dispose",h),m.texture):null}}}return d}function o(d,f){return f===wc?d.mapping=Os:f===Tc&&(d.mapping=cr),d}function l(d){let f=0,p=6;for(let v=0;v<p;v++)d[v]!==void 0&&f++;return f===p}function c(d){let f=d.target;f.removeEventListener("dispose",c);let p=t.get(f);p!==void 0&&(t.delete(f),p.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let p=e.get(f);p!==void 0&&(e.delete(f),p.dispose())}function u(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:u}}function Qy(s){let t={};function e(i){if(t[i]!==void 0)return t[i];let n=s.getExtension(i);return t[i]=n,n}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let n=e(i);return n===null&&nr("WebGLRenderer: "+i+" extension not supported."),n}}}function t_(s,t,e,i){let n={},r=new WeakMap;function a(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let p in d.attributes)t.remove(d.attributes[p]);d.removeEventListener("dispose",a),delete n[d.id];let f=r.get(d);f&&(t.remove(f),r.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function o(u,d){return n[d.id]===!0||(d.addEventListener("dispose",a),n[d.id]=!0,e.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)t.update(d[f],s.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,p=u.attributes.position,v=0;if(p===void 0)return;if(f!==null){let x=f.array;v=f.version;for(let b=0,y=x.length;b<y;b+=3){let E=x[b+0],w=x[b+1],R=x[b+2];d.push(E,w,w,R,R,E)}}else{let x=p.array;v=p.version;for(let b=0,y=x.length/3-1;b<y;b+=3){let E=b+0,w=b+1,R=b+2;d.push(E,w,w,R,R,E)}}let m=new(p.count>=65535?ao:ro)(d,1);m.version=v;let g=r.get(u);g&&t.remove(g),r.set(u,m)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function e_(s,t,e){let i;function n(u){i=u}let r,a;function o(u){r=u.type,a=u.bytesPerElement}function l(u,d){s.drawElements(i,d,r,u*a),e.update(d,i,1)}function c(u,d,f){f!==0&&(s.drawElementsInstanced(i,d,r,u*a,f),e.update(d,i,f))}function h(u,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,u,0,f);let v=0;for(let m=0;m<f;m++)v+=d[m];e.update(v,i,1)}this.setMode=n,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function i_(s){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(e.calls++,a){case s.TRIANGLES:e.triangles+=o*(r/3);break;case s.LINES:e.lines+=o*(r/2);break;case s.LINE_STRIP:e.lines+=o*(r-1);break;case s.LINE_LOOP:e.lines+=o*r;break;case s.POINTS:e.points+=o*r;break;default:jt("WebGLInfo: Unknown draw mode:",a);break}}function n(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:n,update:i}}function n_(s,t,e){let i=new WeakMap,n=new je;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=i.get(o);if(d===void 0||d.count!==u){let A=function(){R.dispose(),i.delete(o),o.removeEventListener("dispose",A)};d!==void 0&&d.texture.dispose();let f=o.morphAttributes.position!==void 0,p=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],x=o.morphAttributes.color||[],b=0;f===!0&&(b=1),p===!0&&(b=2),v===!0&&(b=3);let y=o.attributes.position.count*b,E=1;y>t.maxTextureSize&&(E=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let w=new Float32Array(y*E*4*u),R=new io(w,y,E,u);R.type=vn,R.needsUpdate=!0;let _=b*4;for(let P=0;P<u;P++){let I=m[P],U=g[P],H=x[P],D=y*E*4*P;for(let O=0;O<I.count;O++){let Z=O*_;f===!0&&(n.fromBufferAttribute(I,O),w[D+Z+0]=n.x,w[D+Z+1]=n.y,w[D+Z+2]=n.z,w[D+Z+3]=0),p===!0&&(n.fromBufferAttribute(U,O),w[D+Z+4]=n.x,w[D+Z+5]=n.y,w[D+Z+6]=n.z,w[D+Z+7]=0),v===!0&&(n.fromBufferAttribute(H,O),w[D+Z+8]=n.x,w[D+Z+9]=n.y,w[D+Z+10]=n.z,w[D+Z+11]=H.itemSize===4?n.w:1)}}d={count:u,texture:R,size:new st(y,E)},i.set(o,d),o.addEventListener("dispose",A)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,e);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];let p=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(s,"morphTargetBaseInfluence",p),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function s_(s,t,e,i,n){let r=new WeakMap;function a(c){let h=n.render.frame,u=c.geometry,d=t.get(c,u);if(r.get(d)!==h&&(t.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:a,dispose:o}}var r_={[Uo]:"LINEAR_TONE_MAPPING",[Fo]:"REINHARD_TONE_MAPPING",[Bo]:"CINEON_TONE_MAPPING",[lr]:"ACES_FILMIC_TONE_MAPPING",[Ho]:"AGX_TONE_MAPPING",[zo]:"NEUTRAL_TONE_MAPPING",[Oo]:"CUSTOM_TONE_MAPPING"};function a_(s,t,e,i,n,r){let a=new Qe(t,e,{type:s,depthBuffer:n,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new ye;c.setAttribute("position",new se([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new se([0,2,0,0,2,0],2));let h=new ta({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new at(c,h),d=new $n(-1,1,1,-1,0,1),f=null,p=null,v=!1,m,g=null,x=[],b=!1;this.setSize=function(y,E){a.setSize(y,E),o!==null&&o.setSize(y,E),l!==null&&l.setSize(y,E);for(let w=0;w<x.length;w++){let R=x[w];R.setSize&&R.setSize(y,E)}},this.setEffects=function(y){x=y,b=x.length>0&&x[0].isRenderPass===!0;let E=a.width,w=a.height;x.length>0&&o===null&&(o=new Qe(E,w,{type:hi,depthBuffer:!1,stencilBuffer:!1}),l=new Qe(E,w,{type:hi,depthBuffer:!1,stencilBuffer:!1}));for(let R=0;R<x.length;R++){let _=x[R];_.setSize&&_.setSize(E,w)}},this.begin=function(y,E){if(v||y.toneMapping===Pn&&x.length===0)return!1;if(g=E,E!==null){let w=E.width,R=E.height;(a.width!==w||a.height!==R)&&this.setSize(w,R)}return b===!1&&y.setRenderTarget(a),m=y.toneMapping,y.toneMapping=Pn,!0},this.hasRenderPass=function(){return b},this.end=function(y,E){y.toneMapping=m,v=!0;let w=a,R=o;for(let _=0;_<x.length;_++){let A=x[_];A.enabled!==!1&&(A.render(y,R,w,E),A.needsSwap!==!1&&(w=R,R=R===o?l:o))}if(f!==y.outputColorSpace||p!==y.toneMapping){f=y.outputColorSpace,p=y.toneMapping,h.defines={},ge.getTransfer(f)===Ce&&(h.defines.SRGB_TRANSFER="");let _=r_[p];_&&(h.defines[_]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=w.texture,y.setRenderTarget(g),y.render(u,d),g=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var pm=new qi,xd=new Ds(1,1),mm=new io,gm=new nc,vm=new uo,$p=[],Jp=[],Kp=new Float32Array(16),jp=new Float32Array(9),Qp=new Float32Array(4);function ca(s,t,e){let i=s[0];if(i<=0||i>0)return s;let n=t*e,r=$p[n];if(r===void 0&&(r=new Float32Array(n),$p[n]=r),t!==0){i.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,s[a].toArray(r,o)}return r}function _i(s,t){if(s.length!==t.length)return!1;for(let e=0,i=s.length;e<i;e++)if(s[e]!==t[e])return!1;return!0}function Mi(s,t){for(let e=0,i=t.length;e<i;e++)s[e]=t[e]}function yh(s,t){let e=Jp[t];e===void 0&&(e=new Int32Array(t),Jp[t]=e);for(let i=0;i!==t;++i)e[i]=s.allocateTextureUnit();return e}function o_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function l_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_i(e,t))return;s.uniform2fv(this.addr,t),Mi(e,t)}}function c_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(_i(e,t))return;s.uniform3fv(this.addr,t),Mi(e,t)}}function h_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_i(e,t))return;s.uniform4fv(this.addr,t),Mi(e,t)}}function u_(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(_i(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),Mi(e,t)}else{if(_i(e,i))return;Qp.set(i),s.uniformMatrix2fv(this.addr,!1,Qp),Mi(e,i)}}function d_(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(_i(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),Mi(e,t)}else{if(_i(e,i))return;jp.set(i),s.uniformMatrix3fv(this.addr,!1,jp),Mi(e,i)}}function f_(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(_i(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),Mi(e,t)}else{if(_i(e,i))return;Kp.set(i),s.uniformMatrix4fv(this.addr,!1,Kp),Mi(e,i)}}function p_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function m_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_i(e,t))return;s.uniform2iv(this.addr,t),Mi(e,t)}}function g_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(_i(e,t))return;s.uniform3iv(this.addr,t),Mi(e,t)}}function v_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_i(e,t))return;s.uniform4iv(this.addr,t),Mi(e,t)}}function x_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function y_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_i(e,t))return;s.uniform2uiv(this.addr,t),Mi(e,t)}}function __(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(_i(e,t))return;s.uniform3uiv(this.addr,t),Mi(e,t)}}function M_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_i(e,t))return;s.uniform4uiv(this.addr,t),Mi(e,t)}}function b_(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n);let r;this.type===s.SAMPLER_2D_SHADOW?(xd.compareFunction=e.isReversedDepthBuffer()?fh:dh,r=xd):r=pm,e.setTexture2D(t||r,n)}function S_(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture3D(t||gm,n)}function E_(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTextureCube(t||vm,n)}function w_(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture2DArray(t||mm,n)}function T_(s){switch(s){case 5126:return o_;case 35664:return l_;case 35665:return c_;case 35666:return h_;case 35674:return u_;case 35675:return d_;case 35676:return f_;case 5124:case 35670:return p_;case 35667:case 35671:return m_;case 35668:case 35672:return g_;case 35669:case 35673:return v_;case 5125:return x_;case 36294:return y_;case 36295:return __;case 36296:return M_;case 35678:case 36198:case 36298:case 36306:case 35682:return b_;case 35679:case 36299:case 36307:return S_;case 35680:case 36300:case 36308:case 36293:return E_;case 36289:case 36303:case 36311:case 36292:return w_}}function A_(s,t){s.uniform1fv(this.addr,t)}function R_(s,t){let e=ca(t,this.size,2);s.uniform2fv(this.addr,e)}function C_(s,t){let e=ca(t,this.size,3);s.uniform3fv(this.addr,e)}function P_(s,t){let e=ca(t,this.size,4);s.uniform4fv(this.addr,e)}function I_(s,t){let e=ca(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function L_(s,t){let e=ca(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function D_(s,t){let e=ca(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function N_(s,t){s.uniform1iv(this.addr,t)}function U_(s,t){s.uniform2iv(this.addr,t)}function F_(s,t){s.uniform3iv(this.addr,t)}function B_(s,t){s.uniform4iv(this.addr,t)}function O_(s,t){s.uniform1uiv(this.addr,t)}function H_(s,t){s.uniform2uiv(this.addr,t)}function z_(s,t){s.uniform3uiv(this.addr,t)}function k_(s,t){s.uniform4uiv(this.addr,t)}function V_(s,t,e){let i=this.cache,n=t.length,r=yh(e,n);_i(i,r)||(s.uniform1iv(this.addr,r),Mi(i,r));let a;this.type===s.SAMPLER_2D_SHADOW?a=xd:a=pm;for(let o=0;o!==n;++o)e.setTexture2D(t[o]||a,r[o])}function G_(s,t,e){let i=this.cache,n=t.length,r=yh(e,n);_i(i,r)||(s.uniform1iv(this.addr,r),Mi(i,r));for(let a=0;a!==n;++a)e.setTexture3D(t[a]||gm,r[a])}function W_(s,t,e){let i=this.cache,n=t.length,r=yh(e,n);_i(i,r)||(s.uniform1iv(this.addr,r),Mi(i,r));for(let a=0;a!==n;++a)e.setTextureCube(t[a]||vm,r[a])}function q_(s,t,e){let i=this.cache,n=t.length,r=yh(e,n);_i(i,r)||(s.uniform1iv(this.addr,r),Mi(i,r));for(let a=0;a!==n;++a)e.setTexture2DArray(t[a]||mm,r[a])}function X_(s){switch(s){case 5126:return A_;case 35664:return R_;case 35665:return C_;case 35666:return P_;case 35674:return I_;case 35675:return L_;case 35676:return D_;case 5124:case 35670:return N_;case 35667:case 35671:return U_;case 35668:case 35672:return F_;case 35669:case 35673:return B_;case 5125:return O_;case 36294:return H_;case 36295:return z_;case 36296:return k_;case 35678:case 36198:case 36298:case 36306:case 35682:return V_;case 35679:case 36299:case 36307:return G_;case 35680:case 36300:case 36308:case 36293:return W_;case 36289:case 36303:case 36311:case 36292:return q_}}var yd=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=T_(e.type)}},_d=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=X_(e.type)}},Md=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let n=this.seq;for(let r=0,a=n.length;r!==a;++r){let o=n[r];o.setValue(t,e[o.id],i)}}},gd=/(\w+)(\])?(\[|\.)?/g;function tm(s,t){s.seq.push(t),s.map[t.id]=t}function Y_(s,t,e){let i=s.name,n=i.length;for(gd.lastIndex=0;;){let r=gd.exec(i),a=gd.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===n){tm(e,c===void 0?new yd(o,s,t):new _d(o,s,t));break}else{let u=e.map[o];u===void 0&&(u=new Md(o),tm(e,u)),e=u}}}var oa=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);Y_(o,l,this)}let n=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?n.push(a):r.push(a);n.length>0&&(this.seq=n.concat(r))}setValue(t,e,i,n){let r=this.map[e];r!==void 0&&r.setValue(t,i,n)}setOptional(t,e,i){let n=e[i];n!==void 0&&this.setValue(t,i,n)}static upload(t,e,i,n){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,n)}}static seqWithValue(t,e){let i=[];for(let n=0,r=t.length;n!==r;++n){let a=t[n];a.id in e&&i.push(a)}return i}};function em(s,t,e){let i=s.createShader(t);return s.shaderSource(i,e),s.compileShader(i),i}var Z_=37297,$_=0;function J_(s,t){let e=s.split(`
`),i=[],n=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=n;a<r;a++){let o=a+1;i.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return i.join(`
`)}var im=new ee;function K_(s){ge._getMatrix(im,ge.workingColorSpace,s);let t=`mat3( ${im.elements.map(e=>e.toFixed(4))} )`;switch(ge.getTransfer(s)){case Qa:return[t,"LinearTransferOETF"];case Ce:return[t,"sRGBTransferOETF"];default:return Jt("WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function nm(s,t,e){let i=s.getShaderParameter(t,s.COMPILE_STATUS),r=(s.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+J_(s.getShaderSource(t),o)}else return r}function j_(s,t){let e=K_(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var Q_={[Uo]:"Linear",[Fo]:"Reinhard",[Bo]:"Cineon",[lr]:"ACESFilmic",[Ho]:"AgX",[zo]:"Neutral",[Oo]:"Custom"};function tM(s,t){let e=Q_[t];return e===void 0?(Jt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var mh=new S;function eM(){ge.getLuminanceCoefficients(mh);let s=mh.x.toFixed(4),t=mh.y.toFixed(4),e=mh.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function iM(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ko).join(`
`)}function nM(s){let t=[];for(let e in s){let i=s[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function sM(s,t){let e={},i=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){let r=s.getActiveAttrib(t,n),a=r.name,o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:s.getAttribLocation(t,a),locationSize:o}}return e}function Ko(s){return s!==""}function sm(s,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function rm(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var rM=/^[ \t]*#include +<([\w\d./]+)>/gm;function bd(s){return s.replace(rM,oM)}var aM=new Map;function oM(s,t){let e=de[t];if(e===void 0){let i=aM.get(t);if(i!==void 0)e=de[i],Jt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return bd(e)}var lM=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function am(s){return s.replace(lM,cM)}function cM(s,t,e,i){let n="";for(let r=parseInt(t);r<parseInt(e);r++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return n}function om(s){let t=`precision ${s.precision} float;
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
#define LOW_PRECISION`),t}var hM={[ar]:"SHADOWMAP_TYPE_PCF",[ia]:"SHADOWMAP_TYPE_VSM"};function uM(s){return hM[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var dM={[Os]:"ENVMAP_TYPE_CUBE",[cr]:"ENVMAP_TYPE_CUBE",[ko]:"ENVMAP_TYPE_CUBE_UV"};function fM(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":dM[s.envMapMode]||"ENVMAP_TYPE_CUBE"}var pM={[cr]:"ENVMAP_MODE_REFRACTION"};function mM(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":pM[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var gM={[qu]:"ENVMAP_BLENDING_MULTIPLY",[Mp]:"ENVMAP_BLENDING_MIX",[bp]:"ENVMAP_BLENDING_ADD"};function vM(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":gM[s.combine]||"ENVMAP_BLENDING_NONE"}function xM(s){let t=s.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function yM(s,t,e,i){let n=s.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=uM(e),c=fM(e),h=mM(e),u=vM(e),d=xM(e),f=iM(e),p=nM(r),v=n.createProgram(),m,g,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p].filter(Ko).join(`
`),m.length>0&&(m+=`
`),g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p].filter(Ko).join(`
`),g.length>0&&(g+=`
`)):(m=[om(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ko).join(`
`),g=[om(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Pn?"#define TONE_MAPPING":"",e.toneMapping!==Pn?de.tonemapping_pars_fragment:"",e.toneMapping!==Pn?tM("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",de.colorspace_pars_fragment,j_("linearToOutputTexel",e.outputColorSpace),eM(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ko).join(`
`)),a=bd(a),a=sm(a,e),a=rm(a,e),o=bd(o),o=sm(o,e),o=rm(o,e),a=am(a),o=am(o),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,g=["#define varying in",e.glslVersion===td?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===td?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let b=x+m+a,y=x+g+o,E=em(n,n.VERTEX_SHADER,b),w=em(n,n.FRAGMENT_SHADER,y);n.attachShader(v,E),n.attachShader(v,w),e.index0AttributeName!==void 0?n.bindAttribLocation(v,0,e.index0AttributeName):e.hasPositionAttribute===!0&&n.bindAttribLocation(v,0,"position"),n.linkProgram(v);function R(I){if(s.debug.checkShaderErrors){let U=n.getProgramInfoLog(v)||"",H=n.getShaderInfoLog(E)||"",D=n.getShaderInfoLog(w)||"",O=U.trim(),Z=H.trim(),Y=D.trim(),rt=!0,$=!0;if(n.getProgramParameter(v,n.LINK_STATUS)===!1)if(rt=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(n,v,E,w);else{let Q=nm(n,E,"vertex"),it=nm(n,w,"fragment");jt("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(v,n.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+O+`
`+Q+`
`+it)}else O!==""?Jt("WebGLProgram: Program Info Log:",O):(Z===""||Y==="")&&($=!1);$&&(I.diagnostics={runnable:rt,programLog:O,vertexShader:{log:Z,prefix:m},fragmentShader:{log:Y,prefix:g}})}n.deleteShader(E),n.deleteShader(w),_=new oa(n,v),A=sM(n,v)}let _;this.getUniforms=function(){return _===void 0&&R(this),_};let A;this.getAttributes=function(){return A===void 0&&R(this),A};let P=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=n.getProgramParameter(v,Z_)),P},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=$_++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=E,this.fragmentShader=w,this}var _M=0,Sd=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let n=this._getShaderCacheForMaterial(t);return n.has(e)===!1&&(n.add(e),e.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new Ed(t),e.set(t,i)),i}},Ed=class{constructor(t){this.id=_M++,this.code=t,this.usedTimes=0}};function MM(s){return s===ks||s===Yo||s===Zo}function bM(s,t,e,i,n,r){let a=new no,o=new Sd,l=new Set,c=[],h=new Map,u=i.logarithmicDepthBuffer,d=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(_){return l.add(_),_===0?"uv":`uv${_}`}function v(_,A,P,I,U,H){let D=I.fog,O=U.geometry,Z=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?I.environment:null,Y=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,rt=t.get(_.envMap||Z,Y),$=rt&&rt.mapping===ko?rt.image.height:null,Q=f[_.type];_.precision!==null&&(d=i.getMaxPrecision(_.precision),d!==_.precision&&Jt("WebGLProgram.getParameters:",_.precision,"not supported, using",d,"instead."));let it=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Lt=it!==void 0?it.length:0,Pt=0;O.morphAttributes.position!==void 0&&(Pt=1),O.morphAttributes.normal!==void 0&&(Pt=2),O.morphAttributes.color!==void 0&&(Pt=3);let oe,re,ae,q;if(Q){let z=Kn[Q];oe=z.vertexShader,re=z.fragmentShader}else{oe=_.vertexShader,re=_.fragmentShader;let z=o.getVertexShaderStage(_),W=o.getFragmentShaderStage(_);o.update(_,z,W),ae=z.id,q=W.id}let j=s.getRenderTarget(),vt=s.state.buffers.depth.getReversed(),Wt=U.isInstancedMesh===!0,Et=U.isBatchedMesh===!0,Yt=!!_.map,me=!!_.matcap,nt=!!rt,ct=!!_.aoMap,dt=!!_.lightMap,ft=!!_.bumpMap&&_.wireframe===!1,mt=!!_.normalMap,Zt=!!_.displacementMap,qt=!!_.emissiveMap,Kt=!!_.metalnessMap,te=!!_.roughnessMap,L=_.anisotropy>0,Te=_.clearcoat>0,fe=_.dispersion>0,C=_.retroreflectivity>0,M=_.iridescence>0,B=_.sheen>0,G=_.transmission>0,J=L&&!!_.anisotropyMap,pt=Te&&!!_.clearcoatMap,gt=Te&&!!_.clearcoatNormalMap,K=Te&&!!_.clearcoatRoughnessMap,et=M&&!!_.iridescenceMap,xt=M&&!!_.iridescenceThicknessMap,kt=B&&!!_.sheenColorMap,wt=B&&!!_.sheenRoughnessMap,Mt=!!_.specularMap,Vt=!!_.specularColorMap,$t=!!_.specularIntensityMap,ie=G&&!!_.transmissionMap,F=G&&!!_.thicknessMap,yt=!!_.gradientMap,tt=!!_.alphaMap,_t=_.alphaTest>0,At=!!_.alphaHash,ot=!!_.extensions,Bt=Pn;_.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Bt=s.toneMapping);let Nt={shaderID:Q,shaderType:_.type,shaderName:_.name,vertexShader:oe,fragmentShader:re,defines:_.defines,customVertexShaderID:ae,customFragmentShaderID:q,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:d,batching:Et,batchingColor:Et&&U._colorsTexture!==null,instancing:Wt,instancingColor:Wt&&U.instanceColor!==null,instancingMorph:Wt&&U.morphTexture!==null,outputColorSpace:j===null?s.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:ge.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Yt,matcap:me,envMap:nt,envMapMode:nt&&rt.mapping,envMapCubeUVHeight:$,aoMap:ct,lightMap:dt,bumpMap:ft,normalMap:mt,displacementMap:Zt,emissiveMap:qt,normalMapObjectSpace:mt&&_.normalMapType===wp,normalMapTangentSpace:mt&&_.normalMapType===uh,packedNormalMap:mt&&_.normalMapType===uh&&MM(_.normalMap.format),metalnessMap:Kt,roughnessMap:te,anisotropy:L,anisotropyMap:J,clearcoat:Te,clearcoatMap:pt,clearcoatNormalMap:gt,clearcoatRoughnessMap:K,dispersion:fe,retroreflection:C,iridescence:M,iridescenceMap:et,iridescenceThicknessMap:xt,sheen:B,sheenColorMap:kt,sheenRoughnessMap:wt,specularMap:Mt,specularColorMap:Vt,specularIntensityMap:$t,transmission:G,transmissionMap:ie,thicknessMap:F,gradientMap:yt,opaque:_.transparent===!1&&_.blending===gn&&_.alphaToCoverage===!1,alphaMap:tt,alphaTest:_t,alphaHash:At,combine:_.combine,mapUv:Yt&&p(_.map.channel),aoMapUv:ct&&p(_.aoMap.channel),lightMapUv:dt&&p(_.lightMap.channel),bumpMapUv:ft&&p(_.bumpMap.channel),normalMapUv:mt&&p(_.normalMap.channel),displacementMapUv:Zt&&p(_.displacementMap.channel),emissiveMapUv:qt&&p(_.emissiveMap.channel),metalnessMapUv:Kt&&p(_.metalnessMap.channel),roughnessMapUv:te&&p(_.roughnessMap.channel),anisotropyMapUv:J&&p(_.anisotropyMap.channel),clearcoatMapUv:pt&&p(_.clearcoatMap.channel),clearcoatNormalMapUv:gt&&p(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:K&&p(_.clearcoatRoughnessMap.channel),iridescenceMapUv:et&&p(_.iridescenceMap.channel),iridescenceThicknessMapUv:xt&&p(_.iridescenceThicknessMap.channel),sheenColorMapUv:kt&&p(_.sheenColorMap.channel),sheenRoughnessMapUv:wt&&p(_.sheenRoughnessMap.channel),specularMapUv:Mt&&p(_.specularMap.channel),specularColorMapUv:Vt&&p(_.specularColorMap.channel),specularIntensityMapUv:$t&&p(_.specularIntensityMap.channel),transmissionMapUv:ie&&p(_.transmissionMap.channel),thicknessMapUv:F&&p(_.thicknessMap.channel),alphaMapUv:tt&&p(_.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(mt||L),vertexNormals:!!O.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!O.attributes.uv&&(Yt||tt),fog:!!D,useFog:_.fog===!0,fogExp2:!!D&&D.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||O.attributes.normal===void 0&&mt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:vt,skinning:U.isSkinnedMesh===!0,hasPositionAttribute:O.attributes.position!==void 0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:Lt,morphTextureStride:Pt,numSunLights:A.sun.length,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numSunLightShadows:A.sunShadowMap.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:H.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:Bt,decodeVideoTexture:Yt&&_.map.isVideoTexture===!0&&ge.getTransfer(_.map.colorSpace)===Ce,decodeVideoTextureEmissive:qt&&_.emissiveMap.isVideoTexture===!0&&ge.getTransfer(_.emissiveMap.colorSpace)===Ce,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===ce,flipSided:_.side===yi,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:ot&&_.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ot&&_.extensions.multiDraw===!0||Et)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Nt.vertexUv1s=l.has(1),Nt.vertexUv2s=l.has(2),Nt.vertexUv3s=l.has(3),l.clear(),Nt}function m(_){let A=[];if(_.shaderID?A.push(_.shaderID):(A.push(_.customVertexShaderID),A.push(_.customFragmentShaderID)),_.defines!==void 0)for(let P in _.defines)A.push(P),A.push(_.defines[P]);return _.isRawShaderMaterial===!1&&(g(A,_),x(A,_),A.push(s.outputColorSpace)),A.push(_.customProgramCacheKey),A.join()}function g(_,A){_.push(A.precision),_.push(A.outputColorSpace),_.push(A.envMapMode),_.push(A.envMapCubeUVHeight),_.push(A.mapUv),_.push(A.alphaMapUv),_.push(A.lightMapUv),_.push(A.aoMapUv),_.push(A.bumpMapUv),_.push(A.normalMapUv),_.push(A.displacementMapUv),_.push(A.emissiveMapUv),_.push(A.metalnessMapUv),_.push(A.roughnessMapUv),_.push(A.anisotropyMapUv),_.push(A.clearcoatMapUv),_.push(A.clearcoatNormalMapUv),_.push(A.clearcoatRoughnessMapUv),_.push(A.iridescenceMapUv),_.push(A.iridescenceThicknessMapUv),_.push(A.sheenColorMapUv),_.push(A.sheenRoughnessMapUv),_.push(A.specularMapUv),_.push(A.specularColorMapUv),_.push(A.specularIntensityMapUv),_.push(A.transmissionMapUv),_.push(A.thicknessMapUv),_.push(A.combine),_.push(A.fogExp2),_.push(A.sizeAttenuation),_.push(A.morphTargetsCount),_.push(A.morphAttributeCount),_.push(A.numSunLights),_.push(A.numDirLights),_.push(A.numPointLights),_.push(A.numSpotLights),_.push(A.numSpotLightMaps),_.push(A.numHemiLights),_.push(A.numRectAreaLights),_.push(A.numSunLightShadows),_.push(A.numDirLightShadows),_.push(A.numPointLightShadows),_.push(A.numSpotLightShadows),_.push(A.numSpotLightShadowsWithMaps),_.push(A.numLightProbes),_.push(A.shadowMapType),_.push(A.toneMapping),_.push(A.numClippingPlanes),_.push(A.numClipIntersection),_.push(A.depthPacking)}function x(_,A){a.disableAll(),A.instancing&&a.enable(0),A.instancingColor&&a.enable(1),A.instancingMorph&&a.enable(2),A.matcap&&a.enable(3),A.envMap&&a.enable(4),A.normalMapObjectSpace&&a.enable(5),A.normalMapTangentSpace&&a.enable(6),A.clearcoat&&a.enable(7),A.iridescence&&a.enable(8),A.alphaTest&&a.enable(9),A.vertexColors&&a.enable(10),A.vertexAlphas&&a.enable(11),A.vertexUv1s&&a.enable(12),A.vertexUv2s&&a.enable(13),A.vertexUv3s&&a.enable(14),A.vertexTangents&&a.enable(15),A.anisotropy&&a.enable(16),A.alphaHash&&a.enable(17),A.batching&&a.enable(18),A.dispersion&&a.enable(19),A.retroreflection&&a.enable(24),A.batchingColor&&a.enable(20),A.gradientMap&&a.enable(21),A.packedNormalMap&&a.enable(22),A.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),A.fog&&a.enable(0),A.useFog&&a.enable(1),A.flatShading&&a.enable(2),A.logarithmicDepthBuffer&&a.enable(3),A.reversedDepthBuffer&&a.enable(4),A.skinning&&a.enable(5),A.morphTargets&&a.enable(6),A.morphNormals&&a.enable(7),A.morphColors&&a.enable(8),A.premultipliedAlpha&&a.enable(9),A.shadowMapEnabled&&a.enable(10),A.doubleSided&&a.enable(11),A.flipSided&&a.enable(12),A.useDepthPacking&&a.enable(13),A.dithering&&a.enable(14),A.transmission&&a.enable(15),A.sheen&&a.enable(16),A.opaque&&a.enable(17),A.pointsUvs&&a.enable(18),A.decodeVideoTexture&&a.enable(19),A.decodeVideoTextureEmissive&&a.enable(20),A.alphaToCoverage&&a.enable(21),A.numLightProbeGrids>0&&a.enable(22),A.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function b(_){let A=f[_.type],P;if(A){let I=Kn[A];P=Ms.clone(I.uniforms)}else P=_.uniforms;return P}function y(_,A){let P=h.get(A);return P!==void 0?++P.usedTimes:(P=new yM(s,A,_,n),c.push(P),h.set(A,P)),P}function E(_){if(--_.usedTimes===0){let A=c.indexOf(_);c[A]=c[c.length-1],c.pop(),h.delete(_.cacheKey),_.destroy()}}function w(_){o.remove(_)}function R(){o.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:b,acquireProgram:y,releaseProgram:E,releaseShaderCache:w,programs:c,dispose:R}}function SM(){let s=new WeakMap;function t(a){return s.has(a)}function e(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function i(a){s.delete(a)}function n(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:i,update:n,dispose:r}}function EM(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.materialVariant!==t.materialVariant?s.materialVariant-t.materialVariant:s.z!==t.z?s.z-t.z:s.id-t.id}function lm(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function cm(){let s=[],t=0,e=[],i=[],n=[];function r(){t=0,e.length=0,i.length=0,n.length=0}function a(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function o(d,f,p,v,m,g){let x=s[t];return x===void 0?(x={id:d.id,object:d,geometry:f,material:p,materialVariant:a(d),groupOrder:v,renderOrder:d.renderOrder,z:m,group:g},s[t]=x):(x.id=d.id,x.object=d,x.geometry=f,x.material=p,x.materialVariant=a(d),x.groupOrder=v,x.renderOrder=d.renderOrder,x.z=m,x.group=g),t++,x}function l(d,f,p,v,m,g,x){x.reversedDepth===!0&&(m=-m);let b=o(d,f,p,v,m,g);p.transmission>0?i.push(b):p.transparent===!0?n.push(b):e.push(b)}function c(d,f,p,v,m,g){let x=o(d,f,p,v,m,g);p.transmission>0?i.unshift(x):p.transparent===!0?n.unshift(x):e.unshift(x)}function h(d,f){e.length>1&&e.sort(d||EM),i.length>1&&i.sort(f||lm),n.length>1&&n.sort(f||lm)}function u(){for(let d=t,f=s.length;d<f;d++){let p=s[d];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:i,transparent:n,init:r,push:l,unshift:c,finish:u,sort:h}}function wM(){let s=new WeakMap;function t(i,n){let r=s.get(i),a;return r===void 0?(a=new cm,s.set(i,[a])):n>=r.length?(a=new cm,r.push(a)):a=r[n],a}function e(){s=new WeakMap}return{get:t,dispose:e}}function TM(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new S,color:new St};break;case"SpotLight":e={position:new S,direction:new S,color:new St,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new S,color:new St,distance:0,decay:0};break;case"HemisphereLight":e={direction:new S,skyColor:new St,groundColor:new St};break;case"RectAreaLight":e={color:new St,position:new S,halfWidth:new S,halfHeight:new S};break}return s[t.id]=e,e}}}function AM(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new st,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}var RM=0;function CM(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function PM(s){let t=new TM,e=AM(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new S);let n=new S,r=new be,a=new be;function o(c){let h=0,u=0,d=0;for(let U=0;U<9;U++)i.probe[U].set(0,0,0);let f=0,p=0,v=0,m=0,g=0,x=0,b=0,y=0,E=0,w=0,R=0,_=0,A=0,P=0;c.sort(CM);for(let U=0,H=c.length;U<H;U++){let D=c[U],O=D.color,Z=D.intensity,Y=D.distance,rt=null;if(D.shadow&&D.shadow.map&&(D.shadow.map.texture.format===ks?rt=D.shadow.map.texture:rt=D.shadow.map.depthTexture||D.shadow.map.texture),D.isAmbientLight)h+=O.r*Z,u+=O.g*Z,d+=O.b*Z;else if(D.isLightProbe){for(let $=0;$<9;$++)i.probe[$].addScaledVector(D.sh.coefficients[$],Z);P++}else if(D.isSunLight){let $=t.get(D);if($.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let Q=D.shadow,it=e.get(D);it.shadowIntensity=Q.intensity,it.shadowBias=Q.bias,it.shadowNormalBias=Q.normalBias,it.shadowRadius=Q.radius,it.shadowMapSize.copy(Q.mapSize).multiply(Q.getFrameExtents()),i.sunShadow[p]=it,i.sunShadowMap[p]=rt;let Lt=Q.getViewportCount();for(let Pt=0;Pt<Lt;Pt++)i.sunShadowMatrix[v+Pt]=Q.getMatrix(Pt),i.sunShadowCascade[v+Pt]=Q._cascadeData[Pt];v+=Lt,p++}i.sun[f]=$,f++}else if(D.isDirectionalLight){let $=t.get(D);if($.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let Q=D.shadow,it=e.get(D);it.shadowIntensity=Q.intensity,it.shadowBias=Q.bias,it.shadowNormalBias=Q.normalBias,it.shadowRadius=Q.radius,it.shadowMapSize=Q.mapSize,i.directionalShadow[m]=it,i.directionalShadowMap[m]=rt,i.directionalShadowMatrix[m]=D.shadow.matrix,E++}i.directional[m]=$,m++}else if(D.isSpotLight){let $=t.get(D);$.position.setFromMatrixPosition(D.matrixWorld),$.color.copy(O).multiplyScalar(Z),$.distance=Y,$.coneCos=Math.cos(D.angle),$.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),$.decay=D.decay,i.spot[x]=$;let Q=D.shadow;if(D.map&&(i.spotLightMap[_]=D.map,_++,Q.updateMatrices(D),D.castShadow&&A++),i.spotLightMatrix[x]=Q.matrix,D.castShadow){let it=e.get(D);it.shadowIntensity=Q.intensity,it.shadowBias=Q.bias,it.shadowNormalBias=Q.normalBias,it.shadowRadius=Q.radius,it.shadowMapSize=Q.mapSize,i.spotShadow[x]=it,i.spotShadowMap[x]=rt,R++}x++}else if(D.isRectAreaLight){let $=t.get(D);$.color.copy(O).multiplyScalar(Z),$.halfWidth.set(D.width*.5,0,0),$.halfHeight.set(0,D.height*.5,0),i.rectArea[b]=$,b++}else if(D.isPointLight){let $=t.get(D);if($.color.copy(D.color).multiplyScalar(D.intensity),$.distance=D.distance,$.decay=D.decay,D.castShadow){let Q=D.shadow,it=e.get(D);it.shadowIntensity=Q.intensity,it.shadowBias=Q.bias,it.shadowNormalBias=Q.normalBias,it.shadowRadius=Q.radius,it.shadowMapSize=Q.mapSize,it.shadowCameraNear=Q.camera.near,it.shadowCameraFar=Q.camera.far,i.pointShadow[g]=it,i.pointShadowMap[g]=rt,i.pointShadowMatrix[g]=D.shadow.matrix,w++}i.point[g]=$,g++}else if(D.isHemisphereLight){let $=t.get(D);$.skyColor.copy(D.color).multiplyScalar(Z),$.groundColor.copy(D.groundColor).multiplyScalar(Z),i.hemi[y]=$,y++}}b>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Tt.LTC_FLOAT_1,i.rectAreaLTC2=Tt.LTC_FLOAT_2):(i.rectAreaLTC1=Tt.LTC_HALF_1,i.rectAreaLTC2=Tt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;let I=i.hash;(I.sunLength!==f||I.directionalLength!==m||I.pointLength!==g||I.spotLength!==x||I.rectAreaLength!==b||I.hemiLength!==y||I.numSunShadows!==p||I.numDirectionalShadows!==E||I.numPointShadows!==w||I.numSpotShadows!==R||I.numSpotMaps!==_||I.numLightProbes!==P)&&(i.sun.length=f,i.directional.length=m,i.spot.length=x,i.rectArea.length=b,i.point.length=g,i.hemi.length=y,i.sunShadow.length=p,i.sunShadowMap.length=p,i.sunShadowMatrix.length=v,i.sunShadowCascade.length=v,i.directionalShadow.length=E,i.directionalShadowMap.length=E,i.directionalShadowMatrix.length=E,i.pointShadow.length=w,i.pointShadowMap.length=w,i.pointShadowMatrix.length=w,i.spotShadow.length=R,i.spotShadowMap.length=R,i.spotLightMatrix.length=R+_-A,i.spotLightMap.length=_,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=P,I.sunLength=f,I.directionalLength=m,I.pointLength=g,I.spotLength=x,I.rectAreaLength=b,I.hemiLength=y,I.numSunShadows=p,I.numDirectionalShadows=E,I.numPointShadows=w,I.numSpotShadows=R,I.numSpotMaps=_,I.numLightProbes=P,i.version=RM++)}function l(c,h){let u=0,d=0,f=0,p=0,v=0,m=0,g=h.matrixWorldInverse;for(let x=0,b=c.length;x<b;x++){let y=c[x];if(y.isSunLight){let E=i.sun[u];E.direction.setFromMatrixPosition(y.matrixWorld),E.direction.transformDirection(g),u++}else if(y.isDirectionalLight){let E=i.directional[d];E.direction.setFromMatrixPosition(y.matrixWorld),n.setFromMatrixPosition(y.target.matrixWorld),E.direction.sub(n),E.direction.transformDirection(g),d++}else if(y.isSpotLight){let E=i.spot[p];E.position.setFromMatrixPosition(y.matrixWorld),E.position.applyMatrix4(g),E.direction.setFromMatrixPosition(y.matrixWorld),n.setFromMatrixPosition(y.target.matrixWorld),E.direction.sub(n),E.direction.transformDirection(g),p++}else if(y.isRectAreaLight){let E=i.rectArea[v];E.position.setFromMatrixPosition(y.matrixWorld),E.position.applyMatrix4(g),a.identity(),r.copy(y.matrixWorld),r.premultiply(g),a.extractRotation(r),E.halfWidth.set(y.width*.5,0,0),E.halfHeight.set(0,y.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),v++}else if(y.isPointLight){let E=i.point[f];E.position.setFromMatrixPosition(y.matrixWorld),E.position.applyMatrix4(g),f++}else if(y.isHemisphereLight){let E=i.hemi[m];E.direction.setFromMatrixPosition(y.matrixWorld),E.direction.transformDirection(g),m++}}}return{setup:o,setupView:l,state:i}}function hm(s){let t=new PM(s),e=[],i=[],n=[];function r(d){u.camera=d,e.length=0,i.length=0,n.length=0}function a(d){e.push(d)}function o(d){i.push(d)}function l(d){n.push(d)}function c(){t.setup(e)}function h(d){t.setupView(e,d)}let u={lightsArray:e,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function IM(s){let t=new WeakMap;function e(n,r=0){let a=t.get(n),o;return a===void 0?(o=new hm(s),t.set(n,[o])):r>=a.length?(o=new hm(s),a.push(o)):o=a[r],o}function i(){t=new WeakMap}return{get:e,dispose:i}}var LM=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,DM=`uniform sampler2D shadow_pass;
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
}`,NM=[new S(1,0,0),new S(-1,0,0),new S(0,1,0),new S(0,-1,0),new S(0,0,1),new S(0,0,-1)],UM=[new S(0,-1,0),new S(0,-1,0),new S(0,0,1),new S(0,0,-1),new S(0,-1,0),new S(0,-1,0)],um=new be,Jo=new S,vd=new S;function FM(s,t,e){let i=new Yr,n=new st,r=new st,a=new je,o=new hc,l=new uc,c={},h=e.maxTextureSize,u={[Bs]:yi,[yi]:Bs,[ce]:ce},d=new ue({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new st},radius:{value:4}},vertexShader:LM,fragmentShader:DM}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let p=new ye;p.setAttribute("position",new Se(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new at(p,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ar;let g=this.type;this.render=function(w,R,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;this.type===ip&&(Jt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=ar);let A=s.getRenderTarget(),P=s.getActiveCubeFace(),I=s.getActiveMipmapLevel(),U=s.state;U.setBlending(mn),U.buffers.depth.getReversed()===!0?U.buffers.color.setClear(0,0,0,0):U.buffers.color.setClear(1,1,1,1),U.buffers.depth.setTest(!0),U.setScissorTest(!1);let H=g!==this.type;H&&R.traverse(function(D){D.material&&(Array.isArray(D.material)?D.material.forEach(O=>O.needsUpdate=!0):D.material.needsUpdate=!0)});for(let D=0,O=w.length;D<O;D++){let Z=w[D],Y=Z.shadow;if(Y===void 0){Jt("WebGLShadowMap:",Z,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;n.copy(Y.mapSize);let rt=Y.getFrameExtents();n.multiply(rt),r.copy(Y.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(r.x=Math.floor(h/rt.x),n.x=r.x*rt.x,Y.mapSize.x=r.x),n.y>h&&(r.y=Math.floor(h/rt.y),n.y=r.y*rt.y,Y.mapSize.y=r.y));let $=s.state.buffers.depth.getReversed();if(Y.camera._reversedDepth=$,Y.map===null||H===!0){if(Y.map!==null&&(Y.map.depthTexture!==null&&(Y.map.depthTexture.dispose(),Y.map.depthTexture=null),Y.map.dispose()),this.type===ia){if(Z.isPointLight){Jt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Y.map=new Qe(n.x,n.y,{format:ks,type:hi,minFilter:mi,magFilter:mi,generateMipmaps:!1}),Y.map.texture.name=Z.name+".shadowMap",Y.map.depthTexture=new Ds(n.x,n.y,vn),Y.map.depthTexture.name=Z.name+".shadowMapDepth",Y.map.depthTexture.format=Vn,Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=pi,Y.map.depthTexture.magFilter=pi}else Z.isPointLight?(Y.map=new gh(n.x),Y.map.depthTexture=new rc(n.x,In)):(Y.map=new Qe(n.x,n.y),Y.map.depthTexture=new Ds(n.x,n.y,In)),Y.map.depthTexture.name=Z.name+".shadowMap",Y.map.depthTexture.format=Vn,this.type===ar?(Y.map.depthTexture.compareFunction=$?fh:dh,Y.map.depthTexture.minFilter=mi,Y.map.depthTexture.magFilter=mi):(Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=pi,Y.map.depthTexture.magFilter=pi);Y.camera.updateProjectionMatrix()}Y.map.isWebGLCubeRenderTarget!==!0&&(Y.map.width!==n.x||Y.map.height!==n.y)&&Y.map.setSize(n.x,n.y);let Q=Y.map.isWebGLCubeRenderTarget?6:Y.getViewportCount();Z.isPointLight!==!0&&Y.updateMatrices(Z,_);for(let it=0;it<Q;it++){let Lt=Y.getCamera(it);if(Z.isPointLight){let Pt=Y.camera,oe=Y.matrix,re=Z.distance||Pt.far;re!==Pt.far&&(Pt.far=re,Pt.updateProjectionMatrix()),Jo.setFromMatrixPosition(Z.matrixWorld),Pt.position.copy(Jo),vd.copy(Pt.position),vd.add(NM[it]),Pt.up.copy(UM[it]),Pt.lookAt(vd),Pt.updateMatrixWorld(),oe.makeTranslation(-Jo.x,-Jo.y,-Jo.z),um.multiplyMatrices(Pt.projectionMatrix,Pt.matrixWorldInverse),Y._frustum.setFromProjectionMatrix(um,Pt.coordinateSystem,Pt.reversedDepth)}if(Y.map.isWebGLCubeRenderTarget)s.setRenderTarget(Y.map,it),s.clear();else{it===0&&(s.setRenderTarget(Y.map),s.clear());let Pt=Y.getViewport(it);a.set(r.x*Pt.x,r.y*Pt.y,r.x*Pt.z,r.y*Pt.w),U.viewport(a)}i=Y.getFrustum(it),y(R,_,Lt,Z,this.type)}Y.isPointLightShadow!==!0&&this.type===ia&&x(Y,_),Y.needsUpdate=!1}g=this.type,m.needsUpdate=!1,s.setRenderTarget(A,P,I)};function x(w,R){let _=t.update(v);d.defines.VSM_SAMPLES!==w.blurSamples&&(d.defines.VSM_SAMPLES=w.blurSamples,f.defines.VSM_SAMPLES=w.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),w.mapPass===null?w.mapPass=new Qe(n.x,n.y,{format:ks,type:hi}):(w.mapPass.width!==w.map.width||w.mapPass.height!==w.map.height)&&w.mapPass.setSize(w.map.width,w.map.height),d.uniforms.shadow_pass.value=w.map.depthTexture,d.uniforms.resolution.value.set(w.map.width,w.map.height),d.uniforms.radius.value=w.radius,s.setRenderTarget(w.mapPass),s.clear(),s.renderBufferDirect(R,null,_,d,v,null),f.uniforms.shadow_pass.value=w.mapPass.texture,f.uniforms.resolution.value.set(w.map.width,w.map.height),f.uniforms.radius.value=w.radius,s.setRenderTarget(w.map),s.clear(),s.renderBufferDirect(R,null,_,f,v,null)}function b(w,R,_,A){let P=null,I=_.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(I!==void 0)P=I;else if(P=_.isPointLight===!0?l:o,s.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){let U=P.uuid,H=R.uuid,D=c[U];D===void 0&&(D={},c[U]=D);let O=D[H];O===void 0&&(O=P.clone(),D[H]=O,R.addEventListener("dispose",E)),P=O}if(P.visible=R.visible,P.wireframe=R.wireframe,A===ia?P.side=R.shadowSide!==null?R.shadowSide:R.side:P.side=R.shadowSide!==null?R.shadowSide:u[R.side],P.alphaMap=R.alphaMap,P.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,P.map=R.map,P.clipShadows=R.clipShadows,P.clippingPlanes=R.clippingPlanes,P.clipIntersection=R.clipIntersection,P.displacementMap=R.displacementMap,P.displacementScale=R.displacementScale,P.displacementBias=R.displacementBias,P.wireframeLinewidth=R.wireframeLinewidth,P.linewidth=R.linewidth,_.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let U=s.properties.get(P);U.light=_}return P}function y(w,R,_,A,P){if(w.visible===!1)return;if(w.layers.test(R.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&P===ia)&&(!w.frustumCulled||w.intersectsFrustum(i))){w.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,w.matrixWorld);let H=t.update(w),D=w.material;if(Array.isArray(D)){let O=H.groups;for(let Z=0,Y=O.length;Z<Y;Z++){let rt=O[Z],$=D[rt.materialIndex];if($&&$.visible){let Q=b(w,$,A,P);w.onBeforeShadow(s,w,R,_,H,Q,rt),s.renderBufferDirect(_,null,H,Q,w,rt),w.onAfterShadow(s,w,R,_,H,Q,rt)}}}else if(D.visible){let O=b(w,D,A,P);w.onBeforeShadow(s,w,R,_,H,O,null),s.renderBufferDirect(_,null,H,O,w,null),w.onAfterShadow(s,w,R,_,H,O,null)}}let U=w.children;for(let H=0,D=U.length;H<D;H++)y(U[H],R,_,A,P)}function E(w){w.target.removeEventListener("dispose",E);for(let _ in c){let A=c[_],P=w.target.uuid;P in A&&(A[P].dispose(),delete A[P])}}}function BM(s,t){function e(){let F=!1,yt=new je,tt=null,_t=new je(0,0,0,0);return{setMask:function(At){tt!==At&&!F&&(s.colorMask(At,At,At,At),tt=At)},setLocked:function(At){F=At},setClear:function(At,ot,Bt,Nt,z){z===!0&&(At*=Nt,ot*=Nt,Bt*=Nt),yt.set(At,ot,Bt,Nt),_t.equals(yt)===!1&&(s.clearColor(At,ot,Bt,Nt),_t.copy(yt))},reset:function(){F=!1,tt=null,_t.set(-1,0,0,0)}}}function i(){let F=!1,yt=!1,tt=null,_t=null,At=null;return{setReversed:function(ot){if(yt!==ot){let Bt=t.get("EXT_clip_control");ot?Bt.clipControlEXT(Bt.LOWER_LEFT_EXT,Bt.ZERO_TO_ONE_EXT):Bt.clipControlEXT(Bt.LOWER_LEFT_EXT,Bt.NEGATIVE_ONE_TO_ONE_EXT),yt=ot;let Nt=At;At=null,this.setClear(Nt)}},getReversed:function(){return yt},setTest:function(ot){ot?j(s.DEPTH_TEST):vt(s.DEPTH_TEST)},setMask:function(ot){tt!==ot&&!F&&(s.depthMask(ot),tt=ot)},setFunc:function(ot){if(yt&&(ot=Fp[ot]),_t!==ot){switch(ot){case Xl:s.depthFunc(s.NEVER);break;case Yl:s.depthFunc(s.ALWAYS);break;case Zl:s.depthFunc(s.LESS);break;case Hr:s.depthFunc(s.LEQUAL);break;case $l:s.depthFunc(s.EQUAL);break;case Jl:s.depthFunc(s.GEQUAL);break;case Kl:s.depthFunc(s.GREATER);break;case jl:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}_t=ot}},setLocked:function(ot){F=ot},setClear:function(ot){At!==ot&&(At=ot,yt&&(ot=1-ot),s.clearDepth(ot))},reset:function(){F=!1,tt=null,_t=null,At=null,yt=!1}}}function n(){let F=!1,yt=null,tt=null,_t=null,At=null,ot=null,Bt=null,Nt=null,z=null;return{setTest:function(W){F||(W?j(s.STENCIL_TEST):vt(s.STENCIL_TEST))},setMask:function(W){yt!==W&&!F&&(s.stencilMask(W),yt=W)},setFunc:function(W,ut,bt){(tt!==W||_t!==ut||At!==bt)&&(s.stencilFunc(W,ut,bt),tt=W,_t=ut,At=bt)},setOp:function(W,ut,bt){(ot!==W||Bt!==ut||Nt!==bt)&&(s.stencilOp(W,ut,bt),ot=W,Bt=ut,Nt=bt)},setLocked:function(W){F=W},setClear:function(W){z!==W&&(s.clearStencil(W),z=W)},reset:function(){F=!1,yt=null,tt=null,_t=null,At=null,ot=null,Bt=null,Nt=null,z=null}}}let r=new e,a=new i,o=new n,l=new WeakMap,c=new WeakMap,h={},u={},d={},f=new WeakMap,p=[],v=null,m=!1,g=null,x=null,b=null,y=null,E=null,w=null,R=null,_=new St(0,0,0),A=0,P=!1,I=null,U=null,H=null,D=null,O=null,Z=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,rt=0,$=s.getParameter(s.VERSION);$.indexOf("WebGL")!==-1?(rt=parseFloat(/^WebGL (\d)/.exec($)[1]),Y=rt>=1):$.indexOf("OpenGL ES")!==-1&&(rt=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),Y=rt>=2);let Q=null,it={},Lt=s.getParameter(s.SCISSOR_BOX),Pt=s.getParameter(s.VIEWPORT),oe=new je().fromArray(Lt),re=new je().fromArray(Pt);function ae(F,yt,tt,_t){let At=new Uint8Array(4),ot=s.createTexture();s.bindTexture(F,ot),s.texParameteri(F,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(F,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Bt=0;Bt<tt;Bt++)F===s.TEXTURE_3D||F===s.TEXTURE_2D_ARRAY?s.texImage3D(yt,0,s.RGBA,1,1,_t,0,s.RGBA,s.UNSIGNED_BYTE,At):s.texImage2D(yt+Bt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,At);return ot}let q={};q[s.TEXTURE_2D]=ae(s.TEXTURE_2D,s.TEXTURE_2D,1),q[s.TEXTURE_CUBE_MAP]=ae(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),q[s.TEXTURE_2D_ARRAY]=ae(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),q[s.TEXTURE_3D]=ae(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),j(s.DEPTH_TEST),a.setFunc(Hr),ft(!1),mt(zu),j(s.CULL_FACE),ct(mn);function j(F){h[F]!==!0&&(s.enable(F),h[F]=!0)}function vt(F){h[F]!==!1&&(s.disable(F),h[F]=!1)}function Wt(F,yt){return d[F]!==yt?(s.bindFramebuffer(F,yt),d[F]=yt,F===s.DRAW_FRAMEBUFFER&&(d[s.FRAMEBUFFER]=yt),F===s.FRAMEBUFFER&&(d[s.DRAW_FRAMEBUFFER]=yt),!0):!1}function Et(F,yt){let tt=p,_t=!1;if(F){tt=f.get(yt),tt===void 0&&(tt=[],f.set(yt,tt));let At=F.textures;if(tt.length!==At.length||tt[0]!==s.COLOR_ATTACHMENT0){for(let ot=0,Bt=At.length;ot<Bt;ot++)tt[ot]=s.COLOR_ATTACHMENT0+ot;tt.length=At.length,_t=!0}}else tt[0]!==s.BACK&&(tt[0]=s.BACK,_t=!0);_t&&s.drawBuffers(tt)}function Yt(F){return v!==F?(s.useProgram(F),v=F,!0):!1}let me={[or]:s.FUNC_ADD,[sp]:s.FUNC_SUBTRACT,[rp]:s.FUNC_REVERSE_SUBTRACT};me[ap]=s.MIN,me[op]=s.MAX;let nt={[lp]:s.ZERO,[cp]:s.ONE,[hp]:s.SRC_COLOR,[Gu]:s.SRC_ALPHA,[gp]:s.SRC_ALPHA_SATURATE,[pp]:s.DST_COLOR,[dp]:s.DST_ALPHA,[up]:s.ONE_MINUS_SRC_COLOR,[Wu]:s.ONE_MINUS_SRC_ALPHA,[mp]:s.ONE_MINUS_DST_COLOR,[fp]:s.ONE_MINUS_DST_ALPHA,[vp]:s.CONSTANT_COLOR,[xp]:s.ONE_MINUS_CONSTANT_COLOR,[yp]:s.CONSTANT_ALPHA,[_p]:s.ONE_MINUS_CONSTANT_ALPHA};function ct(F,yt,tt,_t,At,ot,Bt,Nt,z,W){if(F===mn){m===!0&&(vt(s.BLEND),m=!1);return}if(m===!1&&(j(s.BLEND),m=!0),F!==np){if(F!==g||W!==P){if((x!==or||E!==or)&&(s.blendEquation(s.FUNC_ADD),x=or,E=or),W)switch(F){case gn:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Ee:s.blendFunc(s.ONE,s.ONE);break;case ku:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Vu:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:jt("WebGLState: Invalid blending: ",F);break}else switch(F){case gn:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Ee:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case ku:jt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Vu:jt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:jt("WebGLState: Invalid blending: ",F);break}b=null,y=null,w=null,R=null,_.set(0,0,0),A=0,g=F,P=W}return}At=At||yt,ot=ot||tt,Bt=Bt||_t,(yt!==x||At!==E)&&(s.blendEquationSeparate(me[yt],me[At]),x=yt,E=At),(tt!==b||_t!==y||ot!==w||Bt!==R)&&(s.blendFuncSeparate(nt[tt],nt[_t],nt[ot],nt[Bt]),b=tt,y=_t,w=ot,R=Bt),(Nt.equals(_)===!1||z!==A)&&(s.blendColor(Nt.r,Nt.g,Nt.b,z),_.copy(Nt),A=z),g=F,P=!1}function dt(F,yt){F.side===ce?vt(s.CULL_FACE):j(s.CULL_FACE);let tt=F.side===yi;yt&&(tt=!tt),ft(tt),F.blending===gn&&F.transparent===!1?ct(mn):ct(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),a.setFunc(F.depthFunc),a.setTest(F.depthTest),a.setMask(F.depthWrite),r.setMask(F.colorWrite);let _t=F.stencilWrite;o.setTest(_t),_t&&(o.setMask(F.stencilWriteMask),o.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),o.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),qt(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?j(s.SAMPLE_ALPHA_TO_COVERAGE):vt(s.SAMPLE_ALPHA_TO_COVERAGE)}function ft(F){I!==F&&(F?s.frontFace(s.CW):s.frontFace(s.CCW),I=F)}function mt(F){F!==tp?(j(s.CULL_FACE),F!==U&&(F===zu?s.cullFace(s.BACK):F===ep?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):vt(s.CULL_FACE),U=F}function Zt(F){F!==H&&(Y&&s.lineWidth(F),H=F)}function qt(F,yt,tt){F?(j(s.POLYGON_OFFSET_FILL),(D!==yt||O!==tt)&&(D=yt,O=tt,a.getReversed()&&(yt=-yt),s.polygonOffset(yt,tt))):vt(s.POLYGON_OFFSET_FILL)}function Kt(F){F?j(s.SCISSOR_TEST):vt(s.SCISSOR_TEST)}function te(F){F===void 0&&(F=s.TEXTURE0+Z-1),Q!==F&&(s.activeTexture(F),Q=F)}function L(F,yt,tt){tt===void 0&&(Q===null?tt=s.TEXTURE0+Z-1:tt=Q);let _t=it[tt];_t===void 0&&(_t={type:void 0,texture:void 0},it[tt]=_t),(_t.type!==F||_t.texture!==yt)&&(Q!==tt&&(s.activeTexture(tt),Q=tt),s.bindTexture(F,yt||q[F]),_t.type=F,_t.texture=yt)}function Te(){let F=it[Q];F!==void 0&&F.type!==void 0&&(s.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function fe(){try{s.compressedTexImage2D(...arguments)}catch(F){jt("WebGLState:",F)}}function C(){try{s.compressedTexImage3D(...arguments)}catch(F){jt("WebGLState:",F)}}function M(){try{s.texSubImage2D(...arguments)}catch(F){jt("WebGLState:",F)}}function B(){try{s.texSubImage3D(...arguments)}catch(F){jt("WebGLState:",F)}}function G(){try{s.compressedTexSubImage2D(...arguments)}catch(F){jt("WebGLState:",F)}}function J(){try{s.compressedTexSubImage3D(...arguments)}catch(F){jt("WebGLState:",F)}}function pt(){try{s.texStorage2D(...arguments)}catch(F){jt("WebGLState:",F)}}function gt(){try{s.texStorage3D(...arguments)}catch(F){jt("WebGLState:",F)}}function K(){try{s.texImage2D(...arguments)}catch(F){jt("WebGLState:",F)}}function et(){try{s.texImage3D(...arguments)}catch(F){jt("WebGLState:",F)}}function xt(F){return u[F]!==void 0?u[F]:s.getParameter(F)}function kt(F,yt){u[F]!==yt&&(s.pixelStorei(F,yt),u[F]=yt)}function wt(F){oe.equals(F)===!1&&(s.scissor(F.x,F.y,F.z,F.w),oe.copy(F))}function Mt(F){re.equals(F)===!1&&(s.viewport(F.x,F.y,F.z,F.w),re.copy(F))}function Vt(F,yt){let tt=c.get(yt);tt===void 0&&(tt=new WeakMap,c.set(yt,tt));let _t=tt.get(F);_t===void 0&&(_t=s.getUniformBlockIndex(yt,F.name),tt.set(F,_t))}function $t(F,yt){let _t=c.get(yt).get(F);l.get(yt)!==_t&&(s.uniformBlockBinding(yt,_t,F.__bindingPointIndex),l.set(yt,_t))}function ie(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),h={},u={},Q=null,it={},d={},f=new WeakMap,p=[],v=null,m=!1,g=null,x=null,b=null,y=null,E=null,w=null,R=null,_=new St(0,0,0),A=0,P=!1,I=null,U=null,H=null,D=null,O=null,oe.set(0,0,s.canvas.width,s.canvas.height),re.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:j,disable:vt,bindFramebuffer:Wt,drawBuffers:Et,useProgram:Yt,setBlending:ct,setMaterial:dt,setFlipSided:ft,setCullFace:mt,setLineWidth:Zt,setPolygonOffset:qt,setScissorTest:Kt,activeTexture:te,bindTexture:L,unbindTexture:Te,compressedTexImage2D:fe,compressedTexImage3D:C,texImage2D:K,texImage3D:et,pixelStorei:kt,getParameter:xt,updateUBOMapping:Vt,uniformBlockBinding:$t,texStorage2D:pt,texStorage3D:gt,texSubImage2D:M,texSubImage3D:B,compressedTexSubImage2D:G,compressedTexSubImage3D:J,scissor:wt,viewport:Mt,reset:ie}}function OM(s,t,e,i,n,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new st,h=new WeakMap,u=new Set,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(C,M){return p?new OffscreenCanvas(C,M):to("canvas")}function m(C,M,B){let G=1,J=fe(C);if((J.width>B||J.height>B)&&(G=B/Math.max(J.width,J.height)),G<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let pt=Math.floor(G*J.width),gt=Math.floor(G*J.height);d===void 0&&(d=v(pt,gt));let K=M?v(pt,gt):d;return K.width=pt,K.height=gt,K.getContext("2d").drawImage(C,0,0,pt,gt),Jt("WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+pt+"x"+gt+")."),K}else return"data"in C&&Jt("WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),C;return C}function g(C){return C.generateMipmaps}function x(C){s.generateMipmap(C)}function b(C){return C.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?s.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function y(C,M,B,G,J,pt=!1){if(C!==null){if(s[C]!==void 0)return s[C];Jt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let gt;G&&(gt=t.get("EXT_texture_norm16"),gt||Jt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=M;if(M===s.RED&&(B===s.FLOAT&&(K=s.R32F),B===s.HALF_FLOAT&&(K=s.R16F),B===s.UNSIGNED_BYTE&&(K=s.R8),B===s.UNSIGNED_SHORT&&gt&&(K=gt.R16_EXT),B===s.SHORT&&gt&&(K=gt.R16_SNORM_EXT)),M===s.RED_INTEGER&&(B===s.UNSIGNED_BYTE&&(K=s.R8UI),B===s.UNSIGNED_SHORT&&(K=s.R16UI),B===s.UNSIGNED_INT&&(K=s.R32UI),B===s.BYTE&&(K=s.R8I),B===s.SHORT&&(K=s.R16I),B===s.INT&&(K=s.R32I)),M===s.RG&&(B===s.FLOAT&&(K=s.RG32F),B===s.HALF_FLOAT&&(K=s.RG16F),B===s.UNSIGNED_BYTE&&(K=s.RG8),B===s.UNSIGNED_SHORT&&gt&&(K=gt.RG16_EXT),B===s.SHORT&&gt&&(K=gt.RG16_SNORM_EXT)),M===s.RG_INTEGER&&(B===s.UNSIGNED_BYTE&&(K=s.RG8UI),B===s.UNSIGNED_SHORT&&(K=s.RG16UI),B===s.UNSIGNED_INT&&(K=s.RG32UI),B===s.BYTE&&(K=s.RG8I),B===s.SHORT&&(K=s.RG16I),B===s.INT&&(K=s.RG32I)),M===s.RGB_INTEGER&&(B===s.UNSIGNED_BYTE&&(K=s.RGB8UI),B===s.UNSIGNED_SHORT&&(K=s.RGB16UI),B===s.UNSIGNED_INT&&(K=s.RGB32UI),B===s.BYTE&&(K=s.RGB8I),B===s.SHORT&&(K=s.RGB16I),B===s.INT&&(K=s.RGB32I)),M===s.RGBA_INTEGER&&(B===s.UNSIGNED_BYTE&&(K=s.RGBA8UI),B===s.UNSIGNED_SHORT&&(K=s.RGBA16UI),B===s.UNSIGNED_INT&&(K=s.RGBA32UI),B===s.BYTE&&(K=s.RGBA8I),B===s.SHORT&&(K=s.RGBA16I),B===s.INT&&(K=s.RGBA32I)),M===s.RGB&&(B===s.UNSIGNED_SHORT&&gt&&(K=gt.RGB16_EXT),B===s.SHORT&&gt&&(K=gt.RGB16_SNORM_EXT),B===s.UNSIGNED_INT_5_9_9_9_REV&&(K=s.RGB9_E5),B===s.UNSIGNED_INT_10F_11F_11F_REV&&(K=s.R11F_G11F_B10F)),M===s.RGBA){let et=pt?Qa:ge.getTransfer(J);B===s.FLOAT&&(K=s.RGBA32F),B===s.HALF_FLOAT&&(K=s.RGBA16F),B===s.UNSIGNED_BYTE&&(K=et===Ce?s.SRGB8_ALPHA8:s.RGBA8),B===s.UNSIGNED_SHORT&&gt&&(K=gt.RGBA16_EXT),B===s.SHORT&&gt&&(K=gt.RGBA16_SNORM_EXT),B===s.UNSIGNED_SHORT_4_4_4_4&&(K=s.RGBA4),B===s.UNSIGNED_SHORT_5_5_5_1&&(K=s.RGB5_A1)}return(K===s.R16F||K===s.R32F||K===s.RG16F||K===s.RG32F||K===s.RGBA16F||K===s.RGBA32F)&&t.get("EXT_color_buffer_float"),K}function E(C,M){let B;return C?M===null||M===In||M===sa?B=s.DEPTH24_STENCIL8:M===vn?B=s.DEPTH32F_STENCIL8:M===na&&(B=s.DEPTH24_STENCIL8,Jt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===In||M===sa?B=s.DEPTH_COMPONENT24:M===vn?B=s.DEPTH_COMPONENT32F:M===na&&(B=s.DEPTH_COMPONENT16),B}function w(C,M){return g(C)===!0||C.isFramebufferTexture&&C.minFilter!==pi&&C.minFilter!==mi?Math.log2(Math.max(M.width,M.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?M.mipmaps.length:1}function R(C){let M=C.target;M.removeEventListener("dispose",R),A(M),M.isVideoTexture&&h.delete(M),M.isHTMLTexture&&u.delete(M)}function _(C){let M=C.target;M.removeEventListener("dispose",_),I(M)}function A(C){let M=i.get(C);if(M.__webglInit===void 0)return;let B=C.source,G=f.get(B);if(G){let J=G[M.__cacheKey];J.usedTimes--,J.usedTimes===0&&P(C),Object.keys(G).length===0&&f.delete(B)}i.remove(C)}function P(C){let M=i.get(C);s.deleteTexture(M.__webglTexture);let B=C.source,G=f.get(B);delete G[M.__cacheKey],a.memory.textures--}function I(C){let M=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(M.__webglFramebuffer[G]))for(let J=0;J<M.__webglFramebuffer[G].length;J++)s.deleteFramebuffer(M.__webglFramebuffer[G][J]);else s.deleteFramebuffer(M.__webglFramebuffer[G]);M.__webglDepthbuffer&&s.deleteRenderbuffer(M.__webglDepthbuffer[G])}else{if(Array.isArray(M.__webglFramebuffer))for(let G=0;G<M.__webglFramebuffer.length;G++)s.deleteFramebuffer(M.__webglFramebuffer[G]);else s.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&s.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&s.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let G=0;G<M.__webglColorRenderbuffer.length;G++)M.__webglColorRenderbuffer[G]&&s.deleteRenderbuffer(M.__webglColorRenderbuffer[G]);M.__webglDepthRenderbuffer&&s.deleteRenderbuffer(M.__webglDepthRenderbuffer)}let B=C.textures;for(let G=0,J=B.length;G<J;G++){let pt=i.get(B[G]);pt.__webglTexture&&(s.deleteTexture(pt.__webglTexture),a.memory.textures--),i.remove(B[G])}i.remove(C)}let U=0;function H(){U=0}function D(){return U}function O(C){U=C}function Z(){let C=U;return C>=n.maxTextures&&Jt("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+n.maxTextures),U+=1,C}function Y(C){let M=[];return M.push(C.wrapS),M.push(C.wrapT),M.push(C.wrapR||0),M.push(C.magFilter),M.push(C.minFilter),M.push(C.anisotropy),M.push(C.internalFormat),M.push(C.format),M.push(C.type),M.push(C.generateMipmaps),M.push(C.premultiplyAlpha),M.push(C.flipY),M.push(C.unpackAlignment),M.push(C.colorSpace),M.join()}function rt(C,M){let B=i.get(C);if(C.isVideoTexture&&L(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&B.__version!==C.version){let G=C.image;if(G===null)Jt("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)Jt("WebGLRenderer: Texture marked for update but image is incomplete");else{vt(B,C,M);return}}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(s.TEXTURE_2D,B.__webglTexture,s.TEXTURE0+M)}function $(C,M){let B=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){vt(B,C,M);return}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(s.TEXTURE_2D_ARRAY,B.__webglTexture,s.TEXTURE0+M)}function Q(C,M){let B=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){vt(B,C,M);return}e.bindTexture(s.TEXTURE_3D,B.__webglTexture,s.TEXTURE0+M)}function it(C,M){let B=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&B.__version!==C.version){Wt(B,C,M);return}e.bindTexture(s.TEXTURE_CUBE_MAP,B.__webglTexture,s.TEXTURE0+M)}let Lt={[Ji]:s.REPEAT,[Hn]:s.CLAMP_TO_EDGE,[Ql]:s.MIRRORED_REPEAT},Pt={[pi]:s.NEAREST,[Sp]:s.NEAREST_MIPMAP_NEAREST,[Vo]:s.NEAREST_MIPMAP_LINEAR,[mi]:s.LINEAR,[Ac]:s.LINEAR_MIPMAP_NEAREST,[Hs]:s.LINEAR_MIPMAP_LINEAR},oe={[Ap]:s.NEVER,[Lp]:s.ALWAYS,[Rp]:s.LESS,[dh]:s.LEQUAL,[Cp]:s.EQUAL,[fh]:s.GEQUAL,[Pp]:s.GREATER,[Ip]:s.NOTEQUAL};function re(C,M){if(M.type===vn&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===mi||M.magFilter===Ac||M.magFilter===Vo||M.magFilter===Hs||M.minFilter===mi||M.minFilter===Ac||M.minFilter===Vo||M.minFilter===Hs)&&Jt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(C,s.TEXTURE_WRAP_S,Lt[M.wrapS]),s.texParameteri(C,s.TEXTURE_WRAP_T,Lt[M.wrapT]),(C===s.TEXTURE_3D||C===s.TEXTURE_2D_ARRAY)&&s.texParameteri(C,s.TEXTURE_WRAP_R,Lt[M.wrapR]),s.texParameteri(C,s.TEXTURE_MAG_FILTER,Pt[M.magFilter]),s.texParameteri(C,s.TEXTURE_MIN_FILTER,Pt[M.minFilter]),M.compareFunction&&(s.texParameteri(C,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(C,s.TEXTURE_COMPARE_FUNC,oe[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===pi||M.minFilter!==Vo&&M.minFilter!==Hs||M.type===vn&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||i.get(M).__currentAnisotropy){let B=t.get("EXT_texture_filter_anisotropic");s.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,n.getMaxAnisotropy())),i.get(M).__currentAnisotropy=M.anisotropy}}}function ae(C,M){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,M.addEventListener("dispose",R));let G=M.source,J=f.get(G);J===void 0&&(J={},f.set(G,J));let pt=Y(M);if(pt!==C.__cacheKey){J[pt]===void 0&&(J[pt]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,B=!0),J[pt].usedTimes++;let gt=J[C.__cacheKey];gt!==void 0&&(J[C.__cacheKey].usedTimes--,gt.usedTimes===0&&P(M)),C.__cacheKey=pt,C.__webglTexture=J[pt].texture}return B}function q(C,M,B){return Math.floor(Math.floor(C/B)/M)}function j(C,M,B,G){let pt=C.updateRanges;if(pt.length===0)e.texSubImage2D(s.TEXTURE_2D,0,0,0,M.width,M.height,B,G,M.data);else{pt.sort((kt,wt)=>kt.start-wt.start);let gt=0;for(let kt=1;kt<pt.length;kt++){let wt=pt[gt],Mt=pt[kt],Vt=wt.start+wt.count,$t=q(Mt.start,M.width,4),ie=q(wt.start,M.width,4);Mt.start<=Vt+1&&$t===ie&&q(Mt.start+Mt.count-1,M.width,4)===$t?wt.count=Math.max(wt.count,Mt.start+Mt.count-wt.start):(++gt,pt[gt]=Mt)}pt.length=gt+1;let K=e.getParameter(s.UNPACK_ROW_LENGTH),et=e.getParameter(s.UNPACK_SKIP_PIXELS),xt=e.getParameter(s.UNPACK_SKIP_ROWS);e.pixelStorei(s.UNPACK_ROW_LENGTH,M.width);for(let kt=0,wt=pt.length;kt<wt;kt++){let Mt=pt[kt],Vt=Math.floor(Mt.start/4),$t=Math.ceil(Mt.count/4),ie=Vt%M.width,F=Math.floor(Vt/M.width),yt=$t,tt=1;e.pixelStorei(s.UNPACK_SKIP_PIXELS,ie),e.pixelStorei(s.UNPACK_SKIP_ROWS,F),e.texSubImage2D(s.TEXTURE_2D,0,ie,F,yt,tt,B,G,M.data)}C.clearUpdateRanges(),e.pixelStorei(s.UNPACK_ROW_LENGTH,K),e.pixelStorei(s.UNPACK_SKIP_PIXELS,et),e.pixelStorei(s.UNPACK_SKIP_ROWS,xt)}}function vt(C,M,B){let G=s.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(G=s.TEXTURE_2D_ARRAY),M.isData3DTexture&&(G=s.TEXTURE_3D);let J=ae(C,M),pt=M.source;e.bindTexture(G,C.__webglTexture,s.TEXTURE0+B);let gt=i.get(pt);if(pt.version!==gt.__version||J===!0){if(e.activeTexture(s.TEXTURE0+B),(typeof ImageBitmap<"u"&&M.image instanceof ImageBitmap)===!1){let tt=ge.getPrimaries(ge.workingColorSpace),_t=M.colorSpace===_s?null:ge.getPrimaries(M.colorSpace),At=M.colorSpace===_s||tt===_t?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,M.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,At)}e.pixelStorei(s.UNPACK_ALIGNMENT,M.unpackAlignment);let et=m(M.image,!1,n.maxTextureSize);et=Te(M,et);let xt=r.convert(M.format,M.colorSpace),kt=r.convert(M.type),wt=y(M.internalFormat,xt,kt,M.normalized,M.colorSpace,M.isVideoTexture);re(G,M);let Mt,Vt=M.mipmaps,$t=M.isVideoTexture!==!0,ie=gt.__version===void 0||J===!0,F=pt.dataReady,yt=w(M,et);if(M.isDepthTexture)wt=E(M.format===zs,M.type),ie&&($t?e.texStorage2D(s.TEXTURE_2D,1,wt,et.width,et.height):e.texImage2D(s.TEXTURE_2D,0,wt,et.width,et.height,0,xt,kt,null));else if(M.isDataTexture)if(Vt.length>0){$t&&ie&&e.texStorage2D(s.TEXTURE_2D,yt,wt,Vt[0].width,Vt[0].height);for(let tt=0,_t=Vt.length;tt<_t;tt++)Mt=Vt[tt],$t?F&&e.texSubImage2D(s.TEXTURE_2D,tt,0,0,Mt.width,Mt.height,xt,kt,Mt.data):e.texImage2D(s.TEXTURE_2D,tt,wt,Mt.width,Mt.height,0,xt,kt,Mt.data);M.generateMipmaps=!1}else $t?(ie&&e.texStorage2D(s.TEXTURE_2D,yt,wt,et.width,et.height),F&&j(M,et,xt,kt)):e.texImage2D(s.TEXTURE_2D,0,wt,et.width,et.height,0,xt,kt,et.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){$t&&ie&&e.texStorage3D(s.TEXTURE_2D_ARRAY,yt,wt,Vt[0].width,Vt[0].height,et.depth);for(let tt=0,_t=Vt.length;tt<_t;tt++)if(Mt=Vt[tt],M.format!==xn)if(xt!==null)if($t){if(F)if(M.layerUpdates.size>0){let At=ad(Mt.width,Mt.height,M.format,M.type);for(let ot of M.layerUpdates){let Bt=Mt.data.subarray(ot*At/Mt.data.BYTES_PER_ELEMENT,(ot+1)*At/Mt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,tt,0,0,ot,Mt.width,Mt.height,1,xt,Bt)}}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,tt,0,0,0,Mt.width,Mt.height,et.depth,xt,Mt.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,tt,wt,Mt.width,Mt.height,et.depth,0,Mt.data,0,0);else Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else $t?F&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,tt,0,0,0,Mt.width,Mt.height,et.depth,xt,kt,Mt.data):e.texImage3D(s.TEXTURE_2D_ARRAY,tt,wt,Mt.width,Mt.height,et.depth,0,xt,kt,Mt.data);M.layerUpdates.size>0&&M.clearLayerUpdates()}else{$t&&ie&&e.texStorage2D(s.TEXTURE_2D,yt,wt,Vt[0].width,Vt[0].height);for(let tt=0,_t=Vt.length;tt<_t;tt++)Mt=Vt[tt],M.format!==xn?xt!==null?$t?F&&e.compressedTexSubImage2D(s.TEXTURE_2D,tt,0,0,Mt.width,Mt.height,xt,Mt.data):e.compressedTexImage2D(s.TEXTURE_2D,tt,wt,Mt.width,Mt.height,0,Mt.data):Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):$t?F&&e.texSubImage2D(s.TEXTURE_2D,tt,0,0,Mt.width,Mt.height,xt,kt,Mt.data):e.texImage2D(s.TEXTURE_2D,tt,wt,Mt.width,Mt.height,0,xt,kt,Mt.data)}else if(M.isDataArrayTexture)if($t){if(ie&&e.texStorage3D(s.TEXTURE_2D_ARRAY,yt,wt,et.width,et.height,et.depth),F)if(M.layerUpdates.size>0){let tt=ad(et.width,et.height,M.format,M.type);for(let _t of M.layerUpdates){let At=et.data.subarray(_t*tt/et.data.BYTES_PER_ELEMENT,(_t+1)*tt/et.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,_t,et.width,et.height,1,xt,kt,At)}M.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,et.width,et.height,et.depth,xt,kt,et.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,wt,et.width,et.height,et.depth,0,xt,kt,et.data);else if(M.isData3DTexture)$t?(ie&&e.texStorage3D(s.TEXTURE_3D,yt,wt,et.width,et.height,et.depth),F&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,et.width,et.height,et.depth,xt,kt,et.data)):e.texImage3D(s.TEXTURE_3D,0,wt,et.width,et.height,et.depth,0,xt,kt,et.data);else if(M.isFramebufferTexture){if(ie)if($t)e.texStorage2D(s.TEXTURE_2D,yt,wt,et.width,et.height);else{let tt=et.width,_t=et.height;for(let At=0;At<yt;At++)e.texImage2D(s.TEXTURE_2D,At,wt,tt,_t,0,xt,kt,null),tt>>=1,_t>>=1}}else if(M.isHTMLTexture){if("texElementImage2D"in s){let tt=s.canvas;if(tt.hasAttribute("layoutsubtree")||tt.setAttribute("layoutsubtree","true"),et.parentNode!==tt){tt.appendChild(et),u.add(M),tt.onpaint=_t=>{let At=_t.changedElements;for(let ot of u)At.includes(ot.image)&&(ot.needsUpdate=!0)},tt.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,et);else{let At=s.RGBA,ot=s.RGBA,Bt=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,At,ot,Bt,et)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(Vt.length>0){if($t&&ie){let tt=fe(Vt[0]);e.texStorage2D(s.TEXTURE_2D,yt,wt,tt.width,tt.height)}for(let tt=0,_t=Vt.length;tt<_t;tt++)Mt=Vt[tt],$t?F&&e.texSubImage2D(s.TEXTURE_2D,tt,0,0,xt,kt,Mt):e.texImage2D(s.TEXTURE_2D,tt,wt,xt,kt,Mt);M.generateMipmaps=!1}else if($t){if(ie){let tt=fe(et);e.texStorage2D(s.TEXTURE_2D,yt,wt,tt.width,tt.height)}F&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,xt,kt,et)}else e.texImage2D(s.TEXTURE_2D,0,wt,xt,kt,et);g(M)&&x(G),gt.__version=pt.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function Wt(C,M,B){if(M.image.length!==6)return;let G=ae(C,M),J=M.source;e.bindTexture(s.TEXTURE_CUBE_MAP,C.__webglTexture,s.TEXTURE0+B);let pt=i.get(J);if(J.version!==pt.__version||G===!0){e.activeTexture(s.TEXTURE0+B);let gt=ge.getPrimaries(ge.workingColorSpace),K=M.colorSpace===_s?null:ge.getPrimaries(M.colorSpace),et=M.colorSpace===_s||gt===K?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,M.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),e.pixelStorei(s.UNPACK_ALIGNMENT,M.unpackAlignment),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,et);let xt=M.isCompressedTexture||M.image[0].isCompressedTexture,kt=M.image[0]&&M.image[0].isDataTexture,wt=[];for(let ot=0;ot<6;ot++)!xt&&!kt?wt[ot]=m(M.image[ot],!0,n.maxCubemapSize):wt[ot]=kt?M.image[ot].image:M.image[ot],wt[ot]=Te(M,wt[ot]);let Mt=wt[0],Vt=r.convert(M.format,M.colorSpace),$t=r.convert(M.type),ie=y(M.internalFormat,Vt,$t,M.normalized,M.colorSpace),F=M.isVideoTexture!==!0,yt=pt.__version===void 0||G===!0,tt=J.dataReady,_t=w(M,Mt);re(s.TEXTURE_CUBE_MAP,M);let At;if(xt){F&&yt&&e.texStorage2D(s.TEXTURE_CUBE_MAP,_t,ie,Mt.width,Mt.height);for(let ot=0;ot<6;ot++){At=wt[ot].mipmaps;for(let Bt=0;Bt<At.length;Bt++){let Nt=At[Bt];M.format!==xn?Vt!==null?F?tt&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,Bt,0,0,Nt.width,Nt.height,Vt,Nt.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,Bt,ie,Nt.width,Nt.height,0,Nt.data):Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):F?tt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,Bt,0,0,Nt.width,Nt.height,Vt,$t,Nt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,Bt,ie,Nt.width,Nt.height,0,Vt,$t,Nt.data)}}}else{if(At=M.mipmaps,F&&yt){At.length>0&&_t++;let ot=fe(wt[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,_t,ie,ot.width,ot.height)}for(let ot=0;ot<6;ot++)if(kt){F?tt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0,0,0,wt[ot].width,wt[ot].height,Vt,$t,wt[ot].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0,ie,wt[ot].width,wt[ot].height,0,Vt,$t,wt[ot].data);for(let Bt=0;Bt<At.length;Bt++){let z=At[Bt].image[ot].image;F?tt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,Bt+1,0,0,z.width,z.height,Vt,$t,z.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,Bt+1,ie,z.width,z.height,0,Vt,$t,z.data)}}else{F?tt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0,0,0,Vt,$t,wt[ot]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0,ie,Vt,$t,wt[ot]);for(let Bt=0;Bt<At.length;Bt++){let Nt=At[Bt];F?tt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,Bt+1,0,0,Vt,$t,Nt.image[ot]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ot,Bt+1,ie,Vt,$t,Nt.image[ot])}}}g(M)&&x(s.TEXTURE_CUBE_MAP),pt.__version=J.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function Et(C,M,B,G,J,pt){let gt=r.convert(B.format,B.colorSpace),K=r.convert(B.type),et=y(B.internalFormat,gt,K,B.normalized,B.colorSpace),xt=i.get(M),kt=i.get(B);if(kt.__renderTarget=M,!xt.__hasExternalTextures){let wt=Math.max(1,M.width>>pt),Mt=Math.max(1,M.height>>pt);J===s.TEXTURE_3D||J===s.TEXTURE_2D_ARRAY?e.texImage3D(J,pt,et,wt,Mt,M.depth,0,gt,K,null):e.texImage2D(J,pt,et,wt,Mt,0,gt,K,null)}e.bindFramebuffer(s.FRAMEBUFFER,C),te(M)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,G,J,kt.__webglTexture,0,Kt(M)):(J===s.TEXTURE_2D||J>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,G,J,kt.__webglTexture,pt),e.bindFramebuffer(s.FRAMEBUFFER,null)}function Yt(C,M,B){if(s.bindRenderbuffer(s.RENDERBUFFER,C),M.depthBuffer){let G=M.depthTexture,J=G&&G.isDepthTexture?G.type:null,pt=E(M.stencilBuffer,J),gt=M.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;te(M)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Kt(M),pt,M.width,M.height):B?s.renderbufferStorageMultisample(s.RENDERBUFFER,Kt(M),pt,M.width,M.height):s.renderbufferStorage(s.RENDERBUFFER,pt,M.width,M.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,gt,s.RENDERBUFFER,C)}else{let G=M.textures;for(let J=0;J<G.length;J++){let pt=G[J],gt=r.convert(pt.format,pt.colorSpace),K=r.convert(pt.type),et=y(pt.internalFormat,gt,K,pt.normalized,pt.colorSpace);te(M)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Kt(M),et,M.width,M.height):B?s.renderbufferStorageMultisample(s.RENDERBUFFER,Kt(M),et,M.width,M.height):s.renderbufferStorage(s.RENDERBUFFER,et,M.width,M.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function me(C,M,B){let G=M.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(s.FRAMEBUFFER,C),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let J=i.get(M.depthTexture);if(J.__renderTarget=M,(!J.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),G){if(J.__webglInit===void 0&&(J.__webglInit=!0,M.depthTexture.addEventListener("dispose",R)),J.__webglTexture===void 0){J.__webglTexture=s.createTexture(),e.bindTexture(s.TEXTURE_CUBE_MAP,J.__webglTexture),re(s.TEXTURE_CUBE_MAP,M.depthTexture);let xt=r.convert(M.depthTexture.format),kt=r.convert(M.depthTexture.type),wt;M.depthTexture.format===Vn?wt=s.DEPTH_COMPONENT24:M.depthTexture.format===zs&&(wt=s.DEPTH24_STENCIL8);for(let Mt=0;Mt<6;Mt++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,0,wt,M.width,M.height,0,xt,kt,null)}}else rt(M.depthTexture,0);let pt=J.__webglTexture,gt=Kt(M),K=G?s.TEXTURE_CUBE_MAP_POSITIVE_X+B:s.TEXTURE_2D,et=M.depthTexture.format===zs?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(M.depthTexture.format===Vn)te(M)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,et,K,pt,0,gt):s.framebufferTexture2D(s.FRAMEBUFFER,et,K,pt,0);else if(M.depthTexture.format===zs)te(M)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,et,K,pt,0,gt):s.framebufferTexture2D(s.FRAMEBUFFER,et,K,pt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function nt(C){let M=i.get(C),B=C.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==C.depthTexture){let G=C.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),G){let J=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,G.removeEventListener("dispose",J)};G.addEventListener("dispose",J),M.__depthDisposeCallback=J}M.__boundDepthTexture=G}if(C.depthTexture&&!M.__autoAllocateDepthBuffer)if(B)for(let G=0;G<6;G++)me(M.__webglFramebuffer[G],C,G);else{let G=C.texture.mipmaps;G&&G.length>0?me(M.__webglFramebuffer[0],C,0):me(M.__webglFramebuffer,C,0)}else if(B){M.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(e.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer[G]),M.__webglDepthbuffer[G]===void 0)M.__webglDepthbuffer[G]=s.createRenderbuffer(),Yt(M.__webglDepthbuffer[G],C,!1);else{let J=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,pt=M.__webglDepthbuffer[G];s.bindRenderbuffer(s.RENDERBUFFER,pt),s.framebufferRenderbuffer(s.FRAMEBUFFER,J,s.RENDERBUFFER,pt)}}else{let G=C.texture.mipmaps;if(G&&G.length>0?e.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer[0]):e.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=s.createRenderbuffer(),Yt(M.__webglDepthbuffer,C,!1);else{let J=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,pt=M.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,pt),s.framebufferRenderbuffer(s.FRAMEBUFFER,J,s.RENDERBUFFER,pt)}}e.bindFramebuffer(s.FRAMEBUFFER,null)}function ct(C,M,B){let G=i.get(C);M!==void 0&&Et(G.__webglFramebuffer,C,C.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),B!==void 0&&nt(C)}function dt(C){let M=C.texture,B=i.get(C),G=i.get(M);C.addEventListener("dispose",_);let J=C.textures,pt=C.isWebGLCubeRenderTarget===!0,gt=J.length>1;if(gt||(G.__webglTexture===void 0&&(G.__webglTexture=s.createTexture()),G.__version=M.version,a.memory.textures++),pt){B.__webglFramebuffer=[];for(let K=0;K<6;K++)if(M.mipmaps&&M.mipmaps.length>0){B.__webglFramebuffer[K]=[];for(let et=0;et<M.mipmaps.length;et++)B.__webglFramebuffer[K][et]=s.createFramebuffer()}else B.__webglFramebuffer[K]=s.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){B.__webglFramebuffer=[];for(let K=0;K<M.mipmaps.length;K++)B.__webglFramebuffer[K]=s.createFramebuffer()}else B.__webglFramebuffer=s.createFramebuffer();if(gt)for(let K=0,et=J.length;K<et;K++){let xt=i.get(J[K]);xt.__webglTexture===void 0&&(xt.__webglTexture=s.createTexture(),a.memory.textures++)}if(C.samples>0&&te(C)===!1){B.__webglMultisampledFramebuffer=s.createFramebuffer(),B.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let K=0;K<J.length;K++){let et=J[K];B.__webglColorRenderbuffer[K]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,B.__webglColorRenderbuffer[K]);let xt=r.convert(et.format,et.colorSpace),kt=r.convert(et.type),wt=y(et.internalFormat,xt,kt,et.normalized,et.colorSpace,C.isXRRenderTarget===!0),Mt=Kt(C);s.renderbufferStorageMultisample(s.RENDERBUFFER,Mt,wt,C.width,C.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+K,s.RENDERBUFFER,B.__webglColorRenderbuffer[K])}s.bindRenderbuffer(s.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=s.createRenderbuffer(),Yt(B.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(pt){e.bindTexture(s.TEXTURE_CUBE_MAP,G.__webglTexture),re(s.TEXTURE_CUBE_MAP,M);for(let K=0;K<6;K++)if(M.mipmaps&&M.mipmaps.length>0)for(let et=0;et<M.mipmaps.length;et++)Et(B.__webglFramebuffer[K][et],C,M,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+K,et);else Et(B.__webglFramebuffer[K],C,M,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);g(M)&&x(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(gt){for(let K=0,et=J.length;K<et;K++){let xt=J[K],kt=i.get(xt),wt=s.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(wt=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(wt,kt.__webglTexture),re(wt,xt),Et(B.__webglFramebuffer,C,xt,s.COLOR_ATTACHMENT0+K,wt,0),g(xt)&&x(wt)}e.unbindTexture()}else{let K=s.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(K=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(K,G.__webglTexture),re(K,M),M.mipmaps&&M.mipmaps.length>0)for(let et=0;et<M.mipmaps.length;et++)Et(B.__webglFramebuffer[et],C,M,s.COLOR_ATTACHMENT0,K,et);else Et(B.__webglFramebuffer,C,M,s.COLOR_ATTACHMENT0,K,0);g(M)&&x(K),e.unbindTexture()}C.depthBuffer&&nt(C)}function ft(C){let M=C.textures;for(let B=0,G=M.length;B<G;B++){let J=M[B];if(g(J)){let pt=b(C),gt=i.get(J).__webglTexture;e.bindTexture(pt,gt),x(pt),e.unbindTexture()}}}let mt=[],Zt=[];function qt(C){if(C.samples>0){if(te(C)===!1){let M=C.textures,B=C.width,G=C.height,J=s.COLOR_BUFFER_BIT,pt=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,gt=i.get(C),K=M.length>1;if(K)for(let xt=0;xt<M.length;xt++)e.bindFramebuffer(s.FRAMEBUFFER,gt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+xt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,gt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+xt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,gt.__webglMultisampledFramebuffer);let et=C.texture.mipmaps;et&&et.length>0?e.bindFramebuffer(s.DRAW_FRAMEBUFFER,gt.__webglFramebuffer[0]):e.bindFramebuffer(s.DRAW_FRAMEBUFFER,gt.__webglFramebuffer);for(let xt=0;xt<M.length;xt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(J|=s.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(J|=s.STENCIL_BUFFER_BIT)),K){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,gt.__webglColorRenderbuffer[xt]);let kt=i.get(M[xt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,kt,0)}s.blitFramebuffer(0,0,B,G,0,0,B,G,J,s.NEAREST),l===!0&&(mt.length=0,Zt.length=0,mt.push(s.COLOR_ATTACHMENT0+xt),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(mt.push(pt),Zt.push(pt),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Zt)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,mt))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),K)for(let xt=0;xt<M.length;xt++){e.bindFramebuffer(s.FRAMEBUFFER,gt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+xt,s.RENDERBUFFER,gt.__webglColorRenderbuffer[xt]);let kt=i.get(M[xt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,gt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+xt,s.TEXTURE_2D,kt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,gt.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let M=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[M])}}}function Kt(C){return Math.min(n.maxSamples,C.samples)}function te(C){let M=i.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function L(C){let M=a.render.frame;h.get(C)!==M&&(h.set(C,M),C.update())}function Te(C,M){let B=C.colorSpace,G=C.format,J=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==ja&&B!==_s&&(ge.getTransfer(B)===Ce?(G!==xn||J!==Bi)&&Jt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):jt("WebGLTextures: Unsupported texture color space:",B)),M}function fe(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=Z,this.resetTextureUnits=H,this.getTextureUnits=D,this.setTextureUnits=O,this.setTexture2D=rt,this.setTexture2DArray=$,this.setTexture3D=Q,this.setTextureCube=it,this.rebindTextures=ct,this.setupRenderTarget=dt,this.updateRenderTargetMipmap=ft,this.updateMultisampleRenderTarget=qt,this.setupDepthRenderbuffer=nt,this.setupFrameBufferTexture=Et,this.useMultisampledRTT=te,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function HM(s,t){function e(i,n=_s){let r,a=ge.getTransfer(n);if(i===Bi)return s.UNSIGNED_BYTE;if(i===Cc)return s.UNSIGNED_SHORT_4_4_4_4;if(i===Pc)return s.UNSIGNED_SHORT_5_5_5_1;if(i===$u)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===Ju)return s.UNSIGNED_INT_10F_11F_11F_REV;if(i===Yu)return s.BYTE;if(i===Zu)return s.SHORT;if(i===na)return s.UNSIGNED_SHORT;if(i===Rc)return s.INT;if(i===In)return s.UNSIGNED_INT;if(i===vn)return s.FLOAT;if(i===hi)return s.HALF_FLOAT;if(i===Ku)return s.ALPHA;if(i===ju)return s.RGB;if(i===xn)return s.RGBA;if(i===Vn)return s.DEPTH_COMPONENT;if(i===zs)return s.DEPTH_STENCIL;if(i===Ic)return s.RED;if(i===Lc)return s.RED_INTEGER;if(i===ks)return s.RG;if(i===Dc)return s.RG_INTEGER;if(i===Nc)return s.RGBA_INTEGER;if(i===Go||i===Wo||i===qo||i===Xo)if(a===Ce)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Go)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Wo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===qo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Xo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Go)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Wo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===qo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Xo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Uc||i===Fc||i===Bc||i===Oc)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Uc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Fc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Bc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Oc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Hc||i===zc||i===kc||i===Vc||i===Gc||i===Yo||i===Wc)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Hc||i===zc)return a===Ce?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===kc)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Vc)return r.COMPRESSED_R11_EAC;if(i===Gc)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Yo)return r.COMPRESSED_RG11_EAC;if(i===Wc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===qc||i===Xc||i===Yc||i===Zc||i===$c||i===Jc||i===Kc||i===jc||i===Qc||i===th||i===eh||i===ih||i===nh||i===sh)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===qc)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Xc)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Yc)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Zc)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===$c)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Jc)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Kc)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===jc)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Qc)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===th)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===eh)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===ih)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===nh)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===sh)return a===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===rh||i===ah||i===oh)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===rh)return a===Ce?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===ah)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===oh)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===lh||i===ch||i===Zo||i===hh)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===lh)return r.COMPRESSED_RED_RGTC1_EXT;if(i===ch)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Zo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===hh)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===sa?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:e}}var zM=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,kM=`
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

}`,wd=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new fo(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new ue({vertexShader:zM,fragmentShader:kM,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new at(new ti(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Td=class extends Gn{constructor(t,e){super();let i=this,n=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,p=null,v=typeof XRWebGLBinding<"u",m=new wd,g={},x=e.getContextAttributes(),b=null,y=null,E=[],w=[],R=new st,_=null,A=null,P=new ii;P.viewport=new je;let I=new ii;I.viewport=new je;let U=[P,I],H=new Sc,D=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let j=E[q];return j===void 0&&(j=new Wr,E[q]=j),j.getTargetRaySpace()},this.getControllerGrip=function(q){let j=E[q];return j===void 0&&(j=new Wr,E[q]=j),j.getGripSpace()},this.getHand=function(q){let j=E[q];return j===void 0&&(j=new Wr,E[q]=j),j.getHandSpace()};function Z(q){let j=w.indexOf(q.inputSource);if(j===-1)return;let vt=E[j];vt!==void 0&&(vt.update(q.inputSource,q.frame,c||a),vt.dispatchEvent({type:q.type,data:q.inputSource}))}function Y(){n.removeEventListener("select",Z),n.removeEventListener("selectstart",Z),n.removeEventListener("selectend",Z),n.removeEventListener("squeeze",Z),n.removeEventListener("squeezestart",Z),n.removeEventListener("squeezeend",Z),n.removeEventListener("end",Y),n.removeEventListener("inputsourceschange",rt);for(let q=0;q<E.length;q++){let j=w[q];j!==null&&(w[q]=null,E[q].disconnect(j))}D=null,O=null,m.reset();for(let q in g)delete g[q];if(t.setRenderTarget(b),f=null,d=null,u=null,n=null,y=null,ae.stop(),i.isPresenting=!1,t.setPixelRatio(_),t.setSize(R.width,R.height,!1),A!==null){let q=A.camera;q.fov=A.fov,q.zoom=A.zoom,q.updateProjectionMatrix(),A=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,i.isPresenting===!0&&Jt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,i.isPresenting===!0&&Jt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&v&&(u=new XRWebGLBinding(n,e)),u},this.getFrame=function(){return p},this.getSession=function(){return n},this.setSession=async function(q){if(n=q,n!==null){if(b=t.getRenderTarget(),n.addEventListener("select",Z),n.addEventListener("selectstart",Z),n.addEventListener("selectend",Z),n.addEventListener("squeeze",Z),n.addEventListener("squeezestart",Z),n.addEventListener("squeezeend",Z),n.addEventListener("end",Y),n.addEventListener("inputsourceschange",rt),x.xrCompatible!==!0&&await e.makeXRCompatible(),_=t.getPixelRatio(),t.getSize(R),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let vt=null,Wt=null,Et=null;x.depth&&(Et=x.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,vt=x.stencil?zs:Vn,Wt=x.stencil?sa:In);let Yt={colorFormat:e.RGBA8,depthFormat:Et,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Yt),n.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),y=new Qe(d.textureWidth,d.textureHeight,{format:xn,type:Bi,depthTexture:new Ds(d.textureWidth,d.textureHeight,Wt,void 0,void 0,void 0,void 0,void 0,void 0,vt),stencilBuffer:x.stencil,colorSpace:t.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let vt={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(n,e,vt),n.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Qe(f.framebufferWidth,f.framebufferHeight,{format:xn,type:Bi,colorSpace:t.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await n.requestReferenceSpace(o),ae.setContext(n),ae.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function rt(q){for(let j=0;j<q.removed.length;j++){let vt=q.removed[j],Wt=w.indexOf(vt);Wt>=0&&(w[Wt]=null,E[Wt].disconnect(vt))}for(let j=0;j<q.added.length;j++){let vt=q.added[j],Wt=w.indexOf(vt);if(Wt===-1){for(let Yt=0;Yt<E.length;Yt++)if(Yt>=w.length){w.push(vt),Wt=Yt;break}else if(w[Yt]===null){w[Yt]=vt,Wt=Yt;break}if(Wt===-1)break}let Et=E[Wt];Et&&Et.connect(vt)}}let $=new S,Q=new S;function it(q,j,vt){$.setFromMatrixPosition(j.matrixWorld),Q.setFromMatrixPosition(vt.matrixWorld);let Wt=$.distanceTo(Q),Et=j.projectionMatrix.elements,Yt=vt.projectionMatrix.elements,me=Et[14]/(Et[10]-1),nt=Et[14]/(Et[10]+1),ct=(Et[9]+1)/Et[5],dt=(Et[9]-1)/Et[5],ft=(Et[8]-1)/Et[0],mt=(Yt[8]+1)/Yt[0],Zt=me*ft,qt=me*mt,Kt=Wt/(-ft+mt),te=Kt*-ft;if(j.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(te),q.translateZ(Kt),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Et[10]===-1)q.projectionMatrix.copy(j.projectionMatrix),q.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{let L=me+Kt,Te=nt+Kt,fe=Zt-te,C=qt+(Wt-te),M=ct*nt/Te*L,B=dt*nt/Te*L;q.projectionMatrix.makePerspective(fe,C,M,B,L,Te),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function Lt(q,j){j===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(j.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(n===null)return;let j=q.near,vt=q.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(vt=m.depthFar)),H.near=I.near=P.near=j,H.far=I.far=P.far=vt,(D!==H.near||O!==H.far)&&(n.updateRenderState({depthNear:H.near,depthFar:H.far}),D=H.near,O=H.far),H.layers.mask=q.layers.mask|6,P.layers.mask=H.layers.mask&-5,I.layers.mask=H.layers.mask&-3;let Wt=q.parent,Et=H.cameras;Lt(H,Wt);for(let Yt=0;Yt<Et.length;Yt++)Lt(Et[Yt],Wt);Et.length===2?it(H,P,I):H.projectionMatrix.copy(P.projectionMatrix),A===null&&q.isPerspectiveCamera&&(A={camera:q,fov:q.fov,zoom:q.zoom}),Pt(q,H,Wt)};function Pt(q,j,vt){vt===null?q.matrix.copy(j.matrixWorld):(q.matrix.copy(vt.matrixWorld),q.matrix.invert(),q.matrix.multiply(j.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(j.projectionMatrix),q.projectionMatrixInverse.copy(j.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=Vr*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return H},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(q){l=q,d!==null&&(d.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(H)},this.getCameraTexture=function(q){return g[q]};let oe=null;function re(q,j){if(h=j.getViewerPose(c||a),p=j,h!==null){let vt=h.views;f!==null&&(t.setRenderTargetFramebuffer(y,f.framebuffer),t.setRenderTarget(y));let Wt=!1;vt.length!==H.cameras.length&&(H.cameras.length=0,Wt=!0);for(let nt=0;nt<vt.length;nt++){let ct=vt[nt],dt=null;if(f!==null)dt=f.getViewport(ct);else{let mt=u.getViewSubImage(d,ct);dt=mt.viewport,nt===0&&(t.setRenderTargetTextures(y,mt.colorTexture,mt.depthStencilTexture),t.setRenderTarget(y))}let ft=U[nt];ft===void 0&&(ft=new ii,ft.layers.enable(nt),ft.viewport=new je,U[nt]=ft),ft.matrix.fromArray(ct.transform.matrix),ft.matrix.decompose(ft.position,ft.quaternion,ft.scale),ft.projectionMatrix.fromArray(ct.projectionMatrix),ft.projectionMatrixInverse.copy(ft.projectionMatrix).invert(),ft.viewport.set(dt.x,dt.y,dt.width,dt.height),nt===0&&(H.matrix.copy(ft.matrix),H.matrix.decompose(H.position,H.quaternion,H.scale)),Wt===!0&&H.cameras.push(ft)}let Et=n.enabledFeatures;if(Et&&Et.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&v){u=i.getBinding();let nt=u.getDepthInformation(vt[0]);nt&&nt.isValid&&nt.texture&&m.init(nt,n.renderState)}if(Et&&Et.includes("camera-access")&&v){t.state.unbindTexture(),u=i.getBinding();for(let nt=0;nt<vt.length;nt++){let ct=vt[nt].camera;if(ct){let dt=g[ct];dt||(dt=new fo,g[ct]=dt);let ft=u.getCameraImage(ct);dt.sourceTexture=ft}}}}for(let vt=0;vt<E.length;vt++){let Wt=w[vt],Et=E[vt];Wt!==null&&Et!==void 0&&Et.update(Wt,j,c||a)}oe&&oe(q,j),j.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:j}),p=null}let ae=new dm;ae.setAnimationLoop(re),this.setAnimationLoop=function(q){oe=q},this.dispose=function(){}}},VM=new be,xm=new ee;xm.set(-1,0,0,0,1,0,0,0,1);function GM(s,t){function e(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function i(m,g){g.color.getRGB(m.fogColor.value,nd(s)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function n(m,g,x,b,y){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),u(m,g)):g.isMeshPhongMaterial?(r(m,g),h(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),d(m,g),g.isMeshPhysicalMaterial&&f(m,g,y)):g.isMeshMatcapMaterial?(r(m,g),p(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),v(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(a(m,g),g.isLineDashedMaterial&&o(m,g)):g.isPointsMaterial?l(m,g,x,b):g.isSpriteMaterial?c(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,e(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===yi&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,e(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===yi&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,e(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,e(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,e(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);let x=t.get(g),b=x.envMap,y=x.envMapRotation;b&&(m.envMap.value=b,m.envMapRotation.value.setFromMatrix4(VM.makeRotationFromEuler(y)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(xm),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,e(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,e(g.aoMap,m.aoMapTransform))}function a(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform))}function o(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function l(m,g,x,b){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*x,m.scale.value=b*.5,g.map&&(m.map.value=g.map,e(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function c(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,e(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,e(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function h(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function u(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function d(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,e(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,e(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function f(m,g,x){m.ior.value=g.ior,g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,e(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,e(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,e(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,e(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,e(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===yi&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,e(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,e(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,e(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,e(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,e(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,e(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,e(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function v(m,g){let x=t.get(g).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function WM(s,t,e,i){let n={},r={},a=[],o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,E){let w=E.program;i.uniformBlockBinding(y,w)}function c(y,E){let w=n[y.id];w===void 0&&(m(y),w=h(y),n[y.id]=w,y.addEventListener("dispose",x));let R=E.program;i.updateUBOMapping(y,R);let _=t.render.frame;r[y.id]!==_&&(d(y),r[y.id]=_)}function h(y){let E=u();y.__bindingPointIndex=E;let w=s.createBuffer(),R=y.__size,_=y.usage;return s.bindBuffer(s.UNIFORM_BUFFER,w),s.bufferData(s.UNIFORM_BUFFER,R,_),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,E,w),w}function u(){for(let y=0;y<o;y++)if(a.indexOf(y)===-1)return a.push(y),y;return jt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){let E=n[y.id],w=y.uniforms,R=y.__cache;s.bindBuffer(s.UNIFORM_BUFFER,E);for(let _=0,A=w.length;_<A;_++){let P=w[_];if(Array.isArray(P))for(let I=0,U=P.length;I<U;I++)f(P[I],_,I,R);else f(P,_,0,R)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(y,E,w,R){if(v(y,E,w,R)===!0){let _=y.__offset,A=y.value;if(Array.isArray(A)){let P=0;for(let I=0;I<A.length;I++){let U=A[I],H=g(U);p(U,y.__data,P),typeof U!="number"&&typeof U!="boolean"&&!U.isMatrix3&&!ArrayBuffer.isView(U)&&(P+=H.storage/Float32Array.BYTES_PER_ELEMENT)}}else p(A,y.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,_,y.__data)}}function p(y,E,w){typeof y=="number"||typeof y=="boolean"?E[0]=y:y.isMatrix3?(E[0]=y.elements[0],E[1]=y.elements[1],E[2]=y.elements[2],E[3]=0,E[4]=y.elements[3],E[5]=y.elements[4],E[6]=y.elements[5],E[7]=0,E[8]=y.elements[6],E[9]=y.elements[7],E[10]=y.elements[8],E[11]=0):ArrayBuffer.isView(y)?E.set(new y.constructor(y.buffer,y.byteOffset,E.length)):y.toArray(E,w)}function v(y,E,w,R){let _=y.value,A=E+"_"+w;if(R[A]===void 0)return typeof _=="number"||typeof _=="boolean"?R[A]=_:ArrayBuffer.isView(_)?R[A]=_.slice():R[A]=_.clone(),!0;{let P=R[A];if(typeof _=="number"||typeof _=="boolean"){if(P!==_)return R[A]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(P.equals(_)===!1)return P.copy(_),!0}}return!1}function m(y){let E=y.uniforms,w=0,R=16;for(let A=0,P=E.length;A<P;A++){let I=Array.isArray(E[A])?E[A]:[E[A]];for(let U=0,H=I.length;U<H;U++){let D=I[U],O=Array.isArray(D.value)?D.value:[D.value];for(let Z=0,Y=O.length;Z<Y;Z++){let rt=O[Z],$=g(rt),Q=w%R,it=Q%$.boundary,Lt=Q+it;w+=it,Lt!==0&&R-Lt<$.storage&&(w+=R-Lt),D.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),D.__offset=w,w+=$.storage}}}let _=w%R;return _>0&&(w+=R-_),y.__size=w,y.__cache={},this}function g(y){let E={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(E.boundary=4,E.storage=4):y.isVector2?(E.boundary=8,E.storage=8):y.isVector3||y.isColor?(E.boundary=16,E.storage=12):y.isVector4?(E.boundary=16,E.storage=16):y.isMatrix3?(E.boundary=48,E.storage=48):y.isMatrix4?(E.boundary=64,E.storage=64):y.isTexture?Jt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(E.boundary=16,E.storage=y.byteLength):Jt("WebGLRenderer: Unsupported uniform value type.",y),E}function x(y){let E=y.target;E.removeEventListener("dispose",x);let w=a.indexOf(E.__bindingPointIndex);a.splice(w,1),s.deleteBuffer(n[E.id]),delete n[E.id],delete r[E.id]}function b(){for(let y in n)s.deleteBuffer(n[y]);a=[],n={},r={}}return{bind:l,update:c,dispose:b}}var qM=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Jn=null;function XM(){return Jn===null&&(Jn=new ho(qM,16,16,ks,hi),Jn.name="DFG_LUT",Jn.minFilter=mi,Jn.magFilter=mi,Jn.wrapS=Hn,Jn.wrapT=Hn,Jn.generateMipmaps=!1,Jn.needsUpdate=!0),Jn}var vh=class{constructor(t={}){let{canvas:e=Dp(),context:i=null,depth:n=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Bi}=t;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=a;let v=f,m=new Set([Nc,Dc,Lc]),g=new Set([Bi,In,na,sa,Cc,Pc]),x=new Uint32Array(4),b=new Int32Array(4),y=new S,E=null,w=null,R=[],_=[],A=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Pn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,I=!1,U=null,H=null,D=null,O=null;this._outputColorSpace=We;let Z=0,Y=0,rt=null,$=-1,Q=null,it=new je,Lt=new je,Pt=null,oe=new St(0),re=0,ae=e.width,q=e.height,j=1,vt=null,Wt=null,Et=new je(0,0,ae,q),Yt=new je(0,0,ae,q),me=!1,nt=new Yr,ct=!1,dt=!1,ft=new be,mt=new S,Zt=new je,qt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Kt=!1;function te(){return rt===null?j:1}let L=i;function Te(T,N){return e.getContext(T,N)}let fe,C,M,B,G,J,pt,gt,K,et,xt,kt,wt,Mt,Vt,$t,ie,F,yt,tt,_t,At,ot;try{let T={alpha:!0,depth:n,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",z,!1),e.addEventListener("webglcontextrestored",W,!1),e.addEventListener("webglcontextcreationerror",ut,!1),L===null){let N="webgl2";if(L=Te(N,T),L===null)throw Te(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Bt()}catch(T){throw e.removeEventListener("webglcontextlost",z,!1),e.removeEventListener("webglcontextrestored",W,!1),e.removeEventListener("webglcontextcreationerror",ut,!1),jt("WebGLRenderer: "+T.message),T}function Bt(){fe=new Qy(L),fe.init(),_t=new HM(L,fe),C=new Gy(L,fe,t,_t),M=new BM(L,fe),C.reversedDepthBuffer&&d&&M.buffers.depth.setReversed(!0),H=L.createFramebuffer(),D=L.createFramebuffer(),O=L.createFramebuffer(),B=new i_(L),G=new SM,J=new OM(L,fe,M,G,C,_t,B),pt=new jy(P),gt=new sv(L),At=new ky(L,gt),K=new t_(L,gt,B,At),et=new s_(L,K,gt,At,B),F=new n_(L,C,J),Vt=new Wy(G),xt=new bM(P,pt,fe,C,At,Vt),kt=new GM(P,G),wt=new wM,Mt=new IM(fe),ie=new zy(P,pt,M,et,p,l),$t=new FM(P,et,C),ot=new WM(L,B,C,M),yt=new Vy(L,fe,B),tt=new e_(L,fe,B),B.programs=xt.programs,P.capabilities=C,P.extensions=fe,P.properties=G,P.renderLists=wt,P.shadowMap=$t,P.state=M,P.info=B}v!==Bi&&(A=new a_(v,e.width,e.height,o,n,r));let Nt=new Td(P,L);this.xr=Nt,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let T=fe.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=fe.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(T){T!==void 0&&(j=T,this.setSize(ae,q,!1))},this.getSize=function(T){return T.set(ae,q)},this.setSize=function(T,N,X=!0){if(Nt.isPresenting){Jt("WebGLRenderer: Can't change size while VR device is presenting.");return}ae=T,q=N,e.width=Math.floor(T*j),e.height=Math.floor(N*j),X===!0&&(e.style.width=T+"px",e.style.height=N+"px"),A!==null&&A.setSize(e.width,e.height),this.setViewport(0,0,T,N)},this.getDrawingBufferSize=function(T){return T.set(ae*j,q*j).floor()},this.setDrawingBufferSize=function(T,N,X){ae=T,q=N,j=X,e.width=Math.floor(T*X),e.height=Math.floor(N*X),this.setViewport(0,0,T,N)},this.setEffects=function(T){if(v===Bi){jt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let N=0;N<T.length;N++)if(T[N].isOutputPass===!0){Jt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy(it)},this.getViewport=function(T){return T.copy(Et)},this.setViewport=function(T,N,X,k){T.isVector4?Et.set(T.x,T.y,T.z,T.w):Et.set(T,N,X,k),M.viewport(it.copy(Et).multiplyScalar(j).round())},this.getScissor=function(T){return T.copy(Yt)},this.setScissor=function(T,N,X,k){T.isVector4?Yt.set(T.x,T.y,T.z,T.w):Yt.set(T,N,X,k),M.scissor(Lt.copy(Yt).multiplyScalar(j).round())},this.getScissorTest=function(){return me},this.setScissorTest=function(T){M.setScissorTest(me=T)},this.setOpaqueSort=function(T){vt=T},this.setTransparentSort=function(T){Wt=T},this.getClearColor=function(T){return T.copy(ie.getClearColor())},this.setClearColor=function(){ie.setClearColor(...arguments)},this.getClearAlpha=function(){return ie.getClearAlpha()},this.setClearAlpha=function(){ie.setClearAlpha(...arguments)},this.clear=function(T=!0,N=!0,X=!0){let k=0;if(T){let V=!1;if(rt!==null){let Ct=rt.texture.format;V=m.has(Ct)}if(V){let Ct=rt.texture.type,Dt=g.has(Ct),Rt=ie.getClearColor(),Ht=ie.getClearAlpha(),Gt=Rt.r,he=Rt.g,xe=Rt.b;Dt?(x[0]=Gt,x[1]=he,x[2]=xe,x[3]=Ht,L.clearBufferuiv(L.COLOR,0,x)):(b[0]=Gt,b[1]=he,b[2]=xe,b[3]=Ht,L.clearBufferiv(L.COLOR,0,b))}else k|=L.COLOR_BUFFER_BIT}N&&(k|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),X&&(k|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k!==0&&L.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),U=T},this.dispose=function(){e.removeEventListener("webglcontextlost",z,!1),e.removeEventListener("webglcontextrestored",W,!1),e.removeEventListener("webglcontextcreationerror",ut,!1),ie.dispose(),wt.dispose(),Mt.dispose(),G.dispose(),pt.dispose(),et.dispose(),At.dispose(),ot.dispose(),xt.dispose(),Nt.dispose(),Nt.removeEventListener("sessionstart",Fe),Nt.removeEventListener("sessionend",Ze),xi.stop()};function z(T){T.preventDefault(),eo("WebGLRenderer: Context Lost."),I=!0}function W(){eo("WebGLRenderer: Context Restored."),I=!1;let T=B.autoReset,N=$t.enabled,X=$t.autoUpdate,k=$t.needsUpdate,V=$t.type;Bt(),B.autoReset=T,$t.enabled=N,$t.autoUpdate=X,$t.needsUpdate=k,$t.type=V}function ut(T){jt("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function bt(T){let N=T.target;N.removeEventListener("dispose",bt),Xt(N)}function Xt(T){ne(T),G.remove(T)}function ne(T){let N=G.get(T).programs;N!==void 0&&(N.forEach(function(X){xt.releaseProgram(X)}),T.isShaderMaterial&&xt.releaseShaderCache(T))}this.renderBufferDirect=function(T,N,X,k,V,Ct){N===null&&(N=qt);let Dt=V.isMesh&&V.matrixWorld.determinantAffine()<0,Rt=Da(T,N,X,k,V);M.setMaterial(k,Dt);let Ht=X.index,Gt=1;if(k.wireframe===!0){if(Ht=K.getWireframeAttribute(X),Ht===void 0)return;Gt=2}let he=X.drawRange,xe=X.attributes.position,zt=he.start*Gt,Le=(he.start+he.count)*Gt;Ct!==null&&(zt=Math.max(zt,Ct.start*Gt),Le=Math.min(Le,(Ct.start+Ct.count)*Gt)),Ht!==null?(zt=Math.max(zt,0),Le=Math.min(Le,Ht.count)):xe!=null&&(zt=Math.max(zt,0),Le=Math.min(Le,xe.count));let di=Le-zt;if(di<0||di===1/0)return;At.setup(V,k,Rt,X,Ht);let $e,ke=yt;if(Ht!==null&&($e=gt.get(Ht),ke=tt,ke.setIndex($e)),V.isMesh)k.wireframe===!0?(M.setLineWidth(k.wireframeLinewidth*te()),ke.setMode(L.LINES)):ke.setMode(L.TRIANGLES);else if(V.isLine){let Ni=k.linewidth;Ni===void 0&&(Ni=1),M.setLineWidth(Ni*te()),V.isLineSegments?ke.setMode(L.LINES):V.isLineLoop?ke.setMode(L.LINE_LOOP):ke.setMode(L.LINE_STRIP)}else V.isPoints?ke.setMode(L.POINTS):V.isSprite&&ke.setMode(L.TRIANGLES);if(V.isBatchedMesh)if(fe.get("WEBGL_multi_draw"))ke.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{let Ni=V._multiDrawStarts,It=V._multiDrawCounts,Vi=V._multiDrawCount,Re=Ht?gt.get(Ht).bytesPerElement:1,dn=G.get(k).currentProgram.getUniforms();for(let Bn=0;Bn<Vi;Bn++)dn.setValue(L,"_gl_DrawID",Bn),ke.render(Ni[Bn]/Re,It[Bn])}else if(V.isInstancedMesh)ke.renderInstances(zt,di,V.count);else if(X.isInstancedBufferGeometry){let Ni=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,It=Math.min(X.instanceCount,Ni);ke.renderInstances(zt,di,It)}else ke.render(zt,di)};function Ot(T,N,X,k){U!==null&&T.isNodeMaterial&&U.setObject(k,T),ct===!0&&Vt.setState(T,X,!1),T.transparent===!0&&T.side===ce&&T.forceSinglePass===!1?(T.side=yi,T.needsUpdate=!0,as(T,N,k),T.side=Bs,T.needsUpdate=!0,as(T,N,k),T.side=ce):as(T,N,k)}this.compile=function(T,N,X=null){X===null&&(X=T),U!==null&&U.renderStart(T,N,X),w=Mt.get(X),w.init(N),_.push(w),X.traverseVisible(function(V){V.isLight&&V.layers.test(N.layers)&&(w.pushLight(V),V.castShadow&&w.pushShadow(V))}),T!==X&&T.traverseVisible(function(V){V.isLight&&V.layers.test(N.layers)&&(w.pushLight(V),V.castShadow&&w.pushShadow(V))}),w.setupLights(),U!==null&&U.updateLights(w.state.lightsArray),dt=this.localClippingEnabled,ct=Vt.init(this.clippingPlanes,dt),ct===!0&&Vt.setGlobalState(this.clippingPlanes,N),U!==null&&$t.render(w.state.shadowsArray,X,N);let k=new Set;return T.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;let Ct=V.material;if(Ct)if(Array.isArray(Ct))for(let Dt=0;Dt<Ct.length;Dt++){let Rt=Ct[Dt];Ot(Rt,X,N,V),k.add(Rt)}else Ot(Ct,X,N,V),k.add(Ct)}),w=_.pop(),U!==null&&U.renderEnd(),k},this.compileAsync=function(T,N,X=null){let k=this.compile(T,N,X);return new Promise(V=>{function Ct(){if(k.forEach(function(Dt){let Ht=G.get(Dt).currentProgram;(Ht===void 0||Ht.isReady())&&k.delete(Dt)}),k.size===0){V(T);return}setTimeout(Ct,10)}fe.get("KHR_parallel_shader_compile")!==null?Ct():setTimeout(Ct,10)})};let Pe=null;function Ae(T){Pe&&Pe(T)}function Fe(){xi.stop()}function Ze(){xi.start()}let xi=new dm;xi.setAnimationLoop(Ae),typeof self<"u"&&xi.setContext(self),this.setAnimationLoop=function(T){Pe=T,Nt.setAnimationLoop(T),T===null?xi.stop():xi.start()},Nt.addEventListener("sessionstart",Fe),Nt.addEventListener("sessionend",Ze),this.render=function(T,N){if(N!==void 0&&N.isCamera!==!0){jt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;U!==null&&U.renderStart(T,N);let X=Nt.enabled===!0&&Nt.isPresenting===!0,k=A!==null&&(rt===null||X)&&A.begin(P,rt);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),Nt.enabled===!0&&Nt.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(Nt.cameraAutoUpdate===!0&&Nt.updateCamera(N),N=Nt.getCamera()),T.isScene===!0&&T.onBeforeRender(P,T,N,rt),w=Mt.get(T,_.length),w.init(N),w.state.textureUnits=J.getTextureUnits(),_.push(w),ft.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),nt.setFromProjectionMatrix(ft,Cn,N.reversedDepth),dt=this.localClippingEnabled,ct=Vt.init(this.clippingPlanes,dt),E=wt.get(T,R.length),E.init(),R.push(E),Nt.enabled===!0&&Nt.isPresenting===!0){let Dt=P.xr.getDepthSensingMesh();Dt!==null&&$i(Dt,N,-1/0,P.sortObjects)}$i(T,N,0,P.sortObjects),E.finish(),U!==null&&U.updateLights(w.state.lightsArray),P.sortObjects===!0&&E.sort(vt,Wt),Kt=Nt.enabled===!1||Nt.isPresenting===!1||Nt.hasDepthSensing()===!1,Kt&&ie.addToRenderList(E,T),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ct===!0&&Vt.beginShadows();let V=w.state.shadowsArray;if($t.render(V,T,N),ct===!0&&Vt.endShadows(),(k&&A.hasRenderPass())===!1){let Dt=E.opaque,Rt=E.transmissive;if(w.setupLights(),N.isArrayCamera){let Ht=N.cameras;if(Rt.length>0)for(let Gt=0,he=Ht.length;Gt<he;Gt++){let xe=Ht[Gt];rs(Dt,Rt,T,xe)}Kt&&ie.render(T);for(let Gt=0,he=Ht.length;Gt<he;Gt++){let xe=Ht[Gt];En(E,T,xe,xe.viewport)}}else Rt.length>0&&rs(Dt,Rt,T,N),Kt&&ie.render(T),En(E,T,N)}rt!==null&&Y===0&&(J.updateMultisampleRenderTarget(rt),J.updateRenderTargetMipmap(rt)),k&&A.end(P),T.isScene===!0&&T.onAfterRender(P,T,N),At.resetDefaultState(),$=-1,Q=null,_.pop(),_.length>0?(w=_[_.length-1],J.setTextureUnits(w.state.textureUnits),ct===!0&&Vt.setGlobalState(P.clippingPlanes,w.state.camera)):w=null,R.pop(),R.length>0?E=R[R.length-1]:E=null,U!==null&&U.renderEnd()};function $i(T,N,X,k){if(T.visible===!1)return;if(T.layers.test(N.layers)){if(T.isGroup)X=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(N);else if(T.isLightProbeGrid)w.pushLightProbeGrid(T);else if(T.isLight)w.pushLight(T),T.castShadow&&w.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||T.intersectsFrustum(nt)){k&&Zt.setFromMatrixPosition(T.matrixWorld).applyMatrix4(ft);let Dt=et.update(T),Rt=T.material;Rt.visible&&E.push(T,Dt,Rt,X,Zt.z,null,N)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||T.intersectsFrustum(nt))){let Dt=et.update(T),Rt=T.material;if(k&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Zt.copy(T.boundingSphere.center)):(Dt.boundingSphere===null&&Dt.computeBoundingSphere(),Zt.copy(Dt.boundingSphere.center)),Zt.applyMatrix4(T.matrixWorld).applyMatrix4(ft)),Array.isArray(Rt)){let Ht=Dt.groups;for(let Gt=0,he=Ht.length;Gt<he;Gt++){let xe=Ht[Gt],zt=Rt[xe.materialIndex];zt&&zt.visible&&E.push(T,Dt,zt,X,Zt.z,xe,N)}}else Rt.visible&&E.push(T,Dt,Rt,X,Zt.z,null,N)}}let Ct=T.children;for(let Dt=0,Rt=Ct.length;Dt<Rt;Dt++)$i(Ct[Dt],N,X,k)}function En(T,N,X,k){let{opaque:V,transmissive:Ct,transparent:Dt}=T;w.setupLightsView(X),ct===!0&&Vt.setGlobalState(P.clippingPlanes,X),k&&M.viewport(it.copy(k)),V.length>0&&Fn(V,N,X),Ct.length>0&&Fn(Ct,N,X),Dt.length>0&&Fn(Dt,N,X),M.buffers.depth.setTest(!0),M.buffers.depth.setMask(!0),M.buffers.color.setMask(!0),M.setPolygonOffset(!1)}function rs(T,N,X,k){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[k.id]===void 0){let zt=fe.has("EXT_color_buffer_half_float")||fe.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[k.id]=new Qe(1,1,{generateMipmaps:!0,type:zt?hi:Bi,minFilter:Hs,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ge.workingColorSpace})}let Ct=w.state.transmissionRenderTarget[k.id],Dt=k.viewport||it;Ct.setSize(Dt.z*P.transmissionResolutionScale,Dt.w*P.transmissionResolutionScale);let Rt=P.getRenderTarget(),Ht=P.getActiveCubeFace(),Gt=P.getActiveMipmapLevel();P.setRenderTarget(Ct),P.getClearColor(oe),re=P.getClearAlpha(),re<1&&P.setClearColor(16777215,.5),P.clear(),Kt&&ie.render(X);let he=P.toneMapping;P.toneMapping=Pn;let xe=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),w.setupLightsView(k),ct===!0&&Vt.setGlobalState(P.clippingPlanes,k),Fn(T,X,k),J.updateMultisampleRenderTarget(Ct),J.updateRenderTargetMipmap(Ct),fe.has("WEBGL_multisampled_render_to_texture")===!1){let zt=!1;for(let Le=0,di=N.length;Le<di;Le++){let $e=N[Le],{object:ke,geometry:Ni,material:It,group:Vi}=$e;if(It.side===ce&&ke.layers.test(k.layers)){let Re=It.side;It.side=yi,It.needsUpdate=!0,tn(ke,X,k,Ni,It,Vi),It.side=Re,It.needsUpdate=!0,zt=!0}}zt===!0&&(J.updateMultisampleRenderTarget(Ct),J.updateRenderTargetMipmap(Ct))}P.setRenderTarget(Rt,Ht,Gt),P.setClearColor(oe,re),xe!==void 0&&(k.viewport=xe),P.toneMapping=he}function Fn(T,N,X){let k=N.isScene===!0?N.overrideMaterial:null;for(let V=0,Ct=T.length;V<Ct;V++){let Dt=T[V],{object:Rt,geometry:Ht,group:Gt}=Dt,he=Dt.material;he.allowOverride===!0&&k!==null&&(he=k),Rt.layers.test(X.layers)&&tn(Rt,N,X,Ht,he,Gt)}}function tn(T,N,X,k,V,Ct){U!==null&&V.isNodeMaterial&&U.setObject(T,V),T.onBeforeRender(P,N,X,k,V,Ct),T.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),V.onBeforeRender(P,N,X,k,T,Ct),V.transparent===!0&&V.side===ce&&V.forceSinglePass===!1?(V.side=yi,V.needsUpdate=!0,P.renderBufferDirect(X,N,k,V,T,Ct),V.side=Bs,V.needsUpdate=!0,P.renderBufferDirect(X,N,k,V,T,Ct),V.side=ce):P.renderBufferDirect(X,N,k,V,T,Ct),T.onAfterRender(P,N,X,k,V,Ct)}function as(T,N,X){N.isScene!==!0&&(N=qt);let k=G.get(T),V=w.state.lights,Ct=w.state.shadowsArray,Dt=V.state.version,Rt=xt.getParameters(T,V.state,Ct,N,X,w.state.lightProbeGridArray),Ht=xt.getProgramCacheKey(Rt),Gt=k.programs;k.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?N.environment:null,k.fog=N.fog;let he=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;k.envMap=pt.get(T.envMap||k.environment,he),k.envMapRotation=k.environment!==null&&T.envMap===null?N.environmentRotation:T.envMapRotation,Gt===void 0&&(T.addEventListener("dispose",bt),Gt=new Map,k.programs=Gt);let xe=Gt.get(Ht);if(xe!==void 0){if(k.currentProgram===xe&&k.lightsStateVersion===Dt)return La(T,Rt),xe}else Rt.uniforms=xt.getUniforms(T),U!==null&&T.isNodeMaterial&&U.build(T,X,Rt),T.onBeforeCompile(Rt,P),xe=xt.acquireProgram(Rt,Ht),Gt.set(Ht,xe),k.uniforms=Rt.uniforms;let zt=k.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(zt.clippingPlanes=Vt.uniform),La(T,Rt),k.needsLights=fl(T),k.lightsStateVersion=Dt,k.needsLights&&(zt.ambientLightColor.value=V.state.ambient,zt.lightProbe.value=V.state.probe,zt.sunLights.value=V.state.sun,zt.sunLightShadows.value=V.state.sunShadow,zt.directionalLights.value=V.state.directional,zt.directionalLightShadows.value=V.state.directionalShadow,zt.spotLights.value=V.state.spot,zt.spotLightShadows.value=V.state.spotShadow,zt.rectAreaLights.value=V.state.rectArea,zt.ltc_1.value=V.state.rectAreaLTC1,zt.ltc_2.value=V.state.rectAreaLTC2,zt.pointLights.value=V.state.point,zt.pointLightShadows.value=V.state.pointShadow,zt.hemisphereLights.value=V.state.hemi,zt.sunShadowMatrix.value=V.state.sunShadowMatrix,zt.sunShadowCascade.value=V.state.sunShadowCascade,zt.directionalShadowMatrix.value=V.state.directionalShadowMatrix,zt.spotLightMatrix.value=V.state.spotLightMatrix,zt.spotLightMap.value=V.state.spotLightMap,zt.pointShadowMatrix.value=V.state.pointShadowMatrix),k.lightProbeGrid=w.state.lightProbeGridArray.length>0,k.currentProgram=xe,k.uniformsList=null,xe}function Ia(T){if(T.uniformsList===null){let N=T.currentProgram.getUniforms();T.uniformsList=oa.seqWithValue(N.seq,T.uniforms)}return T.uniformsList}function La(T,N){let X=G.get(T);X.outputColorSpace=N.outputColorSpace,X.batching=N.batching,X.batchingColor=N.batchingColor,X.instancing=N.instancing,X.instancingColor=N.instancingColor,X.instancingMorph=N.instancingMorph,X.skinning=N.skinning,X.morphTargets=N.morphTargets,X.morphNormals=N.morphNormals,X.morphColors=N.morphColors,X.morphTargetsCount=N.morphTargetsCount,X.numClippingPlanes=N.numClippingPlanes,X.numIntersection=N.numClipIntersection,X.vertexAlphas=N.vertexAlphas,X.vertexTangents=N.vertexTangents,X.toneMapping=N.toneMapping}function dl(T,N){if(T.length===0)return null;if(T.length===1)return T[0].texture!==null?T[0]:null;y.setFromMatrixPosition(N.matrixWorld);for(let X=0,k=T.length;X<k;X++){let V=T[X];if(V.texture!==null&&V.boundingBox.containsPoint(y))return V}return null}function Da(T,N,X,k,V){N.isScene!==!0&&(N=qt),J.resetTextureUnits();let Ct=N.fog,Dt=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?N.environment:null,Rt=rt===null?P.outputColorSpace:rt.isXRRenderTarget===!0?rt.texture.colorSpace:ge.workingColorSpace,Ht=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap,Gt=pt.get(k.envMap||Dt,Ht),he=k.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,xe=!!X.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),zt=!!X.morphAttributes.position,Le=!!X.morphAttributes.normal,di=!!X.morphAttributes.color,$e=Pn;k.toneMapped&&(rt===null||rt.isXRRenderTarget===!0)&&($e=P.toneMapping);let ke=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,Ni=ke!==void 0?ke.length:0,It=G.get(k),Vi=w.state.lights;if(ct===!0&&(dt===!0||T!==Q)){let Ge=T===Q&&k.id===$;Vt.setState(k,T,Ge)}let Re=!1;k.version===It.__version?(It.needsLights&&It.lightsStateVersion!==Vi.state.version||It.outputColorSpace!==Rt||V.isBatchedMesh&&It.batching===!1||!V.isBatchedMesh&&It.batching===!0||V.isBatchedMesh&&It.batchingColor===!0&&V._colorsTexture===null||V.isBatchedMesh&&It.batchingColor===!1&&V._colorsTexture!==null||V.isInstancedMesh&&It.instancing===!1||!V.isInstancedMesh&&It.instancing===!0||V.isSkinnedMesh&&It.skinning===!1||!V.isSkinnedMesh&&It.skinning===!0||V.isInstancedMesh&&It.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&It.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&It.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&It.instancingMorph===!1&&V.morphTexture!==null||It.envMap!==Gt||k.fog===!0&&It.fog!==Ct||It.numClippingPlanes!==void 0&&(It.numClippingPlanes!==Vt.numPlanes||It.numIntersection!==Vt.numIntersection)||It.vertexAlphas!==he||It.vertexTangents!==xe||It.morphTargets!==zt||It.morphNormals!==Le||It.morphColors!==di||It.toneMapping!==$e||It.morphTargetsCount!==Ni||!!It.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(Re=!0):(Re=!0,It.__version=k.version);let dn=It.currentProgram;Re===!0&&(dn=as(k,N,V),U&&k.isNodeMaterial&&U.onUpdateProgram(k,dn,It));let Bn=!1,ws=!1,xr=!1,Oe=dn.getUniforms(),ci=It.uniforms;if(M.useProgram(dn.program)&&(Bn=!0,ws=!0,xr=!0),k.id!==$&&($=k.id,ws=!0),It.needsLights){let Ge=dl(w.state.lightProbeGridArray,V);It.lightProbeGrid!==Ge&&(It.lightProbeGrid=Ge,ws=!0)}if(Bn||Q!==T){M.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),Oe.setValue(L,"projectionMatrix",T.projectionMatrix),Oe.setValue(L,"viewMatrix",T.matrixWorldInverse);let As=Oe.map.cameraPosition;As!==void 0&&As.setValue(L,mt.setFromMatrixPosition(T.matrixWorld)),C.logarithmicDepthBuffer&&Oe.setValue(L,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&Oe.setValue(L,"isOrthographic",T.isOrthographicCamera===!0),Q!==T&&(Q=T,ws=!0,xr=!0)}if(It.needsLights&&(Vi.state.sunShadowMap.length>0&&Oe.setValue(L,"sunShadowMap",Vi.state.sunShadowMap,J),Vi.state.directionalShadowMap.length>0&&Oe.setValue(L,"directionalShadowMap",Vi.state.directionalShadowMap,J),Vi.state.spotShadowMap.length>0&&Oe.setValue(L,"spotShadowMap",Vi.state.spotShadowMap,J),Vi.state.pointShadowMap.length>0&&Oe.setValue(L,"pointShadowMap",Vi.state.pointShadowMap,J)),V.isSkinnedMesh){Oe.setOptional(L,V,"bindMatrix"),Oe.setOptional(L,V,"bindMatrixInverse");let Ge=V.skeleton;Ge&&(Ge.boneTexture===null&&Ge.computeBoneTexture(),Oe.setValue(L,"boneTexture",Ge.boneTexture,J))}V.isBatchedMesh&&(Oe.setOptional(L,V,"batchingTexture"),Oe.setValue(L,"batchingTexture",V._matricesTexture,J),Oe.setOptional(L,V,"batchingIdTexture"),Oe.setValue(L,"batchingIdTexture",V._indirectTexture,J),Oe.setOptional(L,V,"batchingColorTexture"),V._colorsTexture!==null&&Oe.setValue(L,"batchingColorTexture",V._colorsTexture,J));let Ts=X.morphAttributes;if((Ts.position!==void 0||Ts.normal!==void 0||Ts.color!==void 0)&&F.update(V,X,dn),(ws||It.receiveShadow!==V.receiveShadow)&&(It.receiveShadow=V.receiveShadow,Oe.setValue(L,"receiveShadow",V.receiveShadow)),(k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial)&&k.envMap===null&&N.environment!==null&&(ci.envMapIntensity.value=N.environmentIntensity),ci.dfgLUT!==void 0&&(ci.dfgLUT.value=XM()),ws){if(Oe.setValue(L,"toneMappingExposure",P.toneMappingExposure),It.needsLights&&Na(ci,xr),Ct&&k.fog===!0&&kt.refreshFogUniforms(ci,Ct),kt.refreshMaterialUniforms(ci,k,j,q,w.state.transmissionRenderTarget[T.id]),It.needsLights&&It.lightProbeGrid){let Ge=It.lightProbeGrid;ci.probesSH.value=Ge.texture,ci.probesMin.value.copy(Ge.boundingBox.min),ci.probesMax.value.copy(Ge.boundingBox.max),ci.probesResolution.value.copy(Ge.resolution)}oa.upload(L,Ia(It),ci,J)}if(k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(oa.upload(L,Ia(It),ci,J),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&Oe.setValue(L,"center",V.center),Oe.setValue(L,"modelViewMatrix",V.modelViewMatrix),Oe.setValue(L,"normalMatrix",V.normalMatrix),Oe.setValue(L,"modelMatrix",V.matrixWorld),k.uniformsGroups!==void 0){let Ge=k.uniformsGroups;for(let As=0,yr=Ge.length;As<yr;As++){let yf=Ge[As];ot.update(yf,dn),ot.bind(yf,dn)}}return dn}function Na(T,N){T.ambientLightColor.needsUpdate=N,T.lightProbe.needsUpdate=N,T.sunLights.needsUpdate=N,T.sunLightShadows.needsUpdate=N,T.directionalLights.needsUpdate=N,T.directionalLightShadows.needsUpdate=N,T.pointLights.needsUpdate=N,T.pointLightShadows.needsUpdate=N,T.spotLights.needsUpdate=N,T.spotLightShadows.needsUpdate=N,T.rectAreaLights.needsUpdate=N,T.hemisphereLights.needsUpdate=N}function fl(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return Z},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return rt},this.setRenderTargetTextures=function(T,N,X){let k=G.get(T);k.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),G.get(T.texture).__webglTexture=N,G.get(T.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:X,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,N){let X=G.get(T);X.__webglFramebuffer=N,X.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(T,N=0,X=0){rt=T,Z=N,Y=X;let k=null,V=!1,Ct=!1;if(T){let Rt=G.get(T);if(Rt.__useDefaultFramebuffer!==void 0){M.bindFramebuffer(L.FRAMEBUFFER,Rt.__webglFramebuffer),it.copy(T.viewport),Lt.copy(T.scissor),Pt=T.scissorTest,M.viewport(it),M.scissor(Lt),M.setScissorTest(Pt),$=-1;return}else if(Rt.__webglFramebuffer===void 0)J.setupRenderTarget(T);else if(Rt.__hasExternalTextures)J.rebindTextures(T,G.get(T.texture).__webglTexture,G.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let he=T.depthTexture;if(Rt.__boundDepthTexture!==he){if(he!==null&&G.has(he)&&(T.width!==he.image.width||T.height!==he.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");J.setupDepthRenderbuffer(T)}}let Ht=T.texture;(Ht.isData3DTexture||Ht.isDataArrayTexture||Ht.isCompressedArrayTexture)&&(Ct=!0);let Gt=G.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Gt[N])?k=Gt[N][X]:k=Gt[N],V=!0):T.samples>0&&J.useMultisampledRTT(T)===!1?k=G.get(T).__webglMultisampledFramebuffer:Array.isArray(Gt)?k=Gt[X]:k=Gt,it.copy(T.viewport),Lt.copy(T.scissor),Pt=T.scissorTest}else it.copy(Et).multiplyScalar(j).floor(),Lt.copy(Yt).multiplyScalar(j).floor(),Pt=me;if(X!==0&&(k=H),M.bindFramebuffer(L.FRAMEBUFFER,k)&&M.drawBuffers(T,k),M.viewport(it),M.scissor(Lt),M.setScissorTest(Pt),V){let Rt=G.get(T.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+N,Rt.__webglTexture,X)}else if(Ct){let Rt=N;for(let Ht=0;Ht<T.textures.length;Ht++){let Gt=G.get(T.textures[Ht]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Ht,Gt.__webglTexture,X,Rt)}}else if(T!==null&&X!==0){let Rt=G.get(T.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Rt.__webglTexture,X)}$=-1};function Ua(T){let N=G.get(T);return(N.__readFormat!==T.format||N.__readType!==T.type)&&(N.__readFormat=T.format,N.__readType=T.type,N.__formatReadable=C.textureFormatReadable(T.format),N.__typeReadable=C.textureTypeReadable(T.type)),N}this.readRenderTargetPixels=function(T,N,X,k,V,Ct,Dt,Rt=0){if(!(T&&T.isWebGLRenderTarget)){jt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ht=G.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Dt!==void 0&&(Ht=Ht[Dt]),Ht){M.bindFramebuffer(L.FRAMEBUFFER,Ht);try{let Gt=T.textures[Rt],he=Gt.format,xe=Gt.type;T.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Rt);let zt=Ua(Gt);if(zt.__formatReadable===!1){jt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(zt.__typeReadable===!1){jt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=T.width-k&&X>=0&&X<=T.height-V&&L.readPixels(N,X,k,V,_t.convert(he),_t.convert(xe),Ct)}finally{let Gt=rt!==null?G.get(rt).__webglFramebuffer:null;M.bindFramebuffer(L.FRAMEBUFFER,Gt)}}},this.readRenderTargetPixelsAsync=async function(T,N,X,k,V,Ct,Dt,Rt=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ht=G.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Dt!==void 0&&(Ht=Ht[Dt]),Ht)if(N>=0&&N<=T.width-k&&X>=0&&X<=T.height-V){M.bindFramebuffer(L.FRAMEBUFFER,Ht);let Gt=T.textures[Rt],he=Gt.format,xe=Gt.type;T.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+Rt);let zt=Ua(Gt);if(zt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(zt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Le=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,Le),L.bufferData(L.PIXEL_PACK_BUFFER,Ct.byteLength,L.STREAM_READ),L.readPixels(N,X,k,V,_t.convert(he),_t.convert(xe),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let di=rt!==null?G.get(rt).__webglFramebuffer:null;M.bindFramebuffer(L.FRAMEBUFFER,di);let $e=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Up(L,$e,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,Le),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,Ct),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(Le),L.deleteSync($e),Ct}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,N=null,X=0){let k=Math.pow(2,-X),V=Math.floor(T.image.width*k),Ct=Math.floor(T.image.height*k),Dt=N!==null?N.x:0,Rt=N!==null?N.y:0;J.setTexture2D(T,0),L.copyTexSubImage2D(L.TEXTURE_2D,X,0,0,Dt,Rt,V,Ct),M.unbindTexture()},this.copyTextureToTexture=function(T,N,X=null,k=null,V=0,Ct=0){let Dt,Rt,Ht,Gt,he,xe,zt,Le,di,$e=T.isCompressedTexture?T.mipmaps[Ct]:T.image;if(X!==null)Dt=X.max.x-X.min.x,Rt=X.max.y-X.min.y,Ht=X.isBox3?X.max.z-X.min.z:1,Gt=X.min.x,he=X.min.y,xe=X.isBox3?X.min.z:0;else{let ci=Math.pow(2,-V);Dt=Math.floor($e.width*ci),Rt=Math.floor($e.height*ci),T.isDataArrayTexture?Ht=$e.depth:T.isData3DTexture?Ht=Math.floor($e.depth*ci):Ht=1,Gt=0,he=0,xe=0}k!==null?(zt=k.x,Le=k.y,di=k.z):(zt=0,Le=0,di=0);let ke=_t.convert(N.format),Ni=_t.convert(N.type),It;N.isData3DTexture?(J.setTexture3D(N,0),It=L.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(J.setTexture2DArray(N,0),It=L.TEXTURE_2D_ARRAY):(J.setTexture2D(N,0),It=L.TEXTURE_2D),M.activeTexture(L.TEXTURE0),M.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,N.flipY),M.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),M.pixelStorei(L.UNPACK_ALIGNMENT,N.unpackAlignment);let Vi=M.getParameter(L.UNPACK_ROW_LENGTH),Re=M.getParameter(L.UNPACK_IMAGE_HEIGHT),dn=M.getParameter(L.UNPACK_SKIP_PIXELS),Bn=M.getParameter(L.UNPACK_SKIP_ROWS),ws=M.getParameter(L.UNPACK_SKIP_IMAGES);M.pixelStorei(L.UNPACK_ROW_LENGTH,$e.width),M.pixelStorei(L.UNPACK_IMAGE_HEIGHT,$e.height),M.pixelStorei(L.UNPACK_SKIP_PIXELS,Gt),M.pixelStorei(L.UNPACK_SKIP_ROWS,he),M.pixelStorei(L.UNPACK_SKIP_IMAGES,xe);let xr=T.isDataArrayTexture||T.isData3DTexture,Oe=N.isDataArrayTexture||N.isData3DTexture;if(T.isDepthTexture){let ci=G.get(T),Ts=G.get(N),Ge=G.get(ci.__renderTarget),As=G.get(Ts.__renderTarget);M.bindFramebuffer(L.READ_FRAMEBUFFER,Ge.__webglFramebuffer),M.bindFramebuffer(L.DRAW_FRAMEBUFFER,As.__webglFramebuffer);for(let yr=0;yr<Ht;yr++)xr&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,G.get(T).__webglTexture,V,xe+yr),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,G.get(N).__webglTexture,Ct,di+yr)),L.blitFramebuffer(Gt,he,Dt,Rt,zt,Le,Dt,Rt,L.DEPTH_BUFFER_BIT,L.NEAREST);M.bindFramebuffer(L.READ_FRAMEBUFFER,null),M.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(V!==0||T.isRenderTargetTexture||G.has(T)){let ci=G.get(T),Ts=G.get(N);M.bindFramebuffer(L.READ_FRAMEBUFFER,D),M.bindFramebuffer(L.DRAW_FRAMEBUFFER,O);for(let Ge=0;Ge<Ht;Ge++)xr?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,ci.__webglTexture,V,xe+Ge):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,ci.__webglTexture,V),Oe?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ts.__webglTexture,Ct,di+Ge):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ts.__webglTexture,Ct),V!==0?L.blitFramebuffer(Gt,he,Dt,Rt,zt,Le,Dt,Rt,L.COLOR_BUFFER_BIT,L.NEAREST):Oe?L.copyTexSubImage3D(It,Ct,zt,Le,di+Ge,Gt,he,Dt,Rt):L.copyTexSubImage2D(It,Ct,zt,Le,Gt,he,Dt,Rt);M.bindFramebuffer(L.READ_FRAMEBUFFER,null),M.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else Oe?T.isDataTexture||T.isData3DTexture?L.texSubImage3D(It,Ct,zt,Le,di,Dt,Rt,Ht,ke,Ni,$e.data):N.isCompressedArrayTexture?L.compressedTexSubImage3D(It,Ct,zt,Le,di,Dt,Rt,Ht,ke,$e.data):L.texSubImage3D(It,Ct,zt,Le,di,Dt,Rt,Ht,ke,Ni,$e):T.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,Ct,zt,Le,Dt,Rt,ke,Ni,$e.data):T.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,Ct,zt,Le,$e.width,$e.height,ke,$e.data):L.texSubImage2D(L.TEXTURE_2D,Ct,zt,Le,Dt,Rt,ke,Ni,$e);M.pixelStorei(L.UNPACK_ROW_LENGTH,Vi),M.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Re),M.pixelStorei(L.UNPACK_SKIP_PIXELS,dn),M.pixelStorei(L.UNPACK_SKIP_ROWS,Bn),M.pixelStorei(L.UNPACK_SKIP_IMAGES,ws),Ct===0&&N.generateMipmaps&&L.generateMipmap(It),M.unbindTexture()},this.initRenderTarget=function(T){G.get(T).__webglFramebuffer===void 0&&J.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?J.setTextureCube(T,0):T.isData3DTexture?J.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?J.setTexture2DArray(T,0):J.setTexture2D(T,0),M.unbindTexture()},this.resetState=function(){Z=0,Y=0,rt=null,M.reset(),At.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Cn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=ge._getDrawingBufferColorSpace(t),e.unpackColorSpace=ge._getUnpackColorSpace()}};var jo=.008333333333333333,Hi=650,Ut={halfX:4096,halfZ:5120,height:2044,chamfer:1150,cornerR:400,rampR:280,goalHalfW:893,goalH:642,goalDepth:880},De={radius:93,mass:30,maxSpeed:6e3,maxSpin:6,drag:.0305,restitution:.6,friction:.285},Ft={mass:180,restHeight:17,hitboxHalf:{x:42.1,y:18.08,z:59},hitboxOffset:{x:0,y:20.75,z:13.88},wheels:[{x:25.9,z:51.25,r:12.5,front:!0},{x:-25.9,z:51.25,r:12.5,front:!0},{x:29.5,z:-33.75,r:15,front:!1},{x:-29.5,z:-33.75,r:15,front:!1}],maxSpeed:2300,maxDriveSpeed:1410,supersonic:2200,boostAccelGround:991.67,boostAccelAir:1058.33,boostUsePerSec:33.3,brakeAccel:3500,coastDecel:525,airThrottleAccel:66.67,jumpImpulse:291.67,jumpHoldAccel:1458.33,jumpHoldTime:.2,doubleJumpWindow:1.25,dodgeImpulse:500,dodgeTime:.65,stickyAccel:325,maxAngVel:5.5,airRoll:36.08,airPitch:12.15,airYaw:8.92,dampRoll:4.47,dampPitch:2.8,dampYaw:1.89},Ad=33,_h=[[-3584,0],[3584,0],[-3072,-4096],[3072,-4096],[-3072,4096],[3072,4096]],Mh=[[0,-4240],[-1792,-4184],[1792,-4184],[-940,-3308],[940,-3308],[0,-2816],[-3584,-2484],[3584,-2484],[-1788,-2300],[1788,-2300],[-2048,-1036],[0,-1024],[2048,-1036],[-1024,0],[1024,0],[-2048,1036],[0,1024],[2048,1036],[-1788,2300],[1788,2300],[-3584,2484],[3584,2484],[0,2816],[-940,3310],[940,3308],[-1792,4184],[1792,4184],[0,4240]],ym=[[-2048,-2560,Math.PI/4],[2048,-2560,-Math.PI/4],[-256,-3840,0],[256,-3840,0],[0,-4608,0]],Rd=[[-2304,-4608,0],[-2688,-4608,0],[2304,-4608,0],[2688,-4608,0]],Ie={0:{main:1010687,light:6272255,dark:670362,css:"#2f7bff",flame:[.55,.85,1],flameEnd:[.1,.3,1]},1:{main:16738834,light:16756832,dark:9054720,css:"#ff7a1a",flame:[1,.85,.45],flameEnd:[1,.28,.04]}};var Cd=30,Vs=new S;function ui(s,t,e,i){let n=document.createElement(s);return t&&(n.className=t),i!==void 0&&(n.innerHTML=i),e&&e.appendChild(n),n}function YM(){let r=270/Cd,a="";for(let o=0;o<Cd;o++){let l=(135+o*r+.8)*Math.PI/180,c=(135+(o+1)*r-.8)*Math.PI/180,h=100+Math.cos(l)*84,u=100+Math.sin(l)*84,d=100+Math.cos(c)*84,f=100+Math.sin(c)*84;a+=`<path class="seg" d="M${h.toFixed(2)} ${u.toFixed(2)} A84 84 0 0 1 ${d.toFixed(2)} ${f.toFixed(2)}"/>`}return`<svg viewBox="0 0 200 200" class="boost-svg">
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
  </svg>`}var bh=class{constructor(t){this.root=t,t.innerHTML="";let e=ui("div","scoreboard",t);this.sbBlue=ui("div","sb-team sb-blue",e,"<span>0</span>");let i=ui("div","sb-clock",e);this.sbTime=ui("div","sb-time",i,"5:00"),this.sbOT=ui("div","sb-ot",i,""),this.sbOrange=ui("div","sb-team sb-orange",e,"<span>0</span>"),this.viewsEl=ui("div","hud-views",t),this.banner=ui("div","banner",t),this.bannerMain=ui("div","banner-main",this.banner),this.bannerSub=ui("div","banner-sub",this.banner),this.feed=ui("div","feed",t),this.fps=ui("div","fps",t),this.views=[],this.bannerTimer=0,this.lastScores=[-1,-1],this.lastTime=""}show(t){this.root.classList.toggle("hidden",!t)}setup(t){this.viewsEl.innerHTML="",this.views=t.map(e=>{let i=ui("div","hud-view",this.viewsEl);i.style.left=e.rect[0]*100+"%",i.style.top=e.rect[1]*100+"%",i.style.width=e.rect[2]*100+"%",i.style.height=e.rect[3]*100+"%",t.length>1&&i.classList.add("split");let n=ui("div","boost-gauge",i,YM()),r=t.length>1?ui("div","player-tag",i,e.label):null;r&&(r.style.color=Ie[e.team].css);let a=ui("div","item-slot hidden",i);a.innerHTML='<div class="item-icon"></div><div class="item-text"><div class="item-name"></div><div class="item-key"></div></div><div class="item-bar"><div></div></div>';let o=ui("div","view-status",i),l=ui("div","view-center",i),c=ui("div","plates",i);return{box:i,gauge:n,status:o,center:l,plates:c,plateMap:new Map,item:a,itemIcon:a.querySelector(".item-icon"),itemName:a.querySelector(".item-name"),itemKey:a.querySelector(".item-key"),itemBar:a.querySelector(".item-bar div"),itemSig:"",segs:Array.from(n.querySelectorAll(".seg")),num:n.querySelector(".boost-num"),lastBoost:-1,statusTimer:0,centerTimer:0}})}setScore(t,e){t!==this.lastScores[0]&&(this.sbBlue.firstChild.textContent=t,this.pulse(this.sbBlue)),e!==this.lastScores[1]&&(this.sbOrange.firstChild.textContent=e,this.pulse(this.sbOrange)),this.lastScores=[t,e]}pulse(t){this.lastScores[0]<0||(t.classList.remove("pulse"),t.offsetWidth,t.classList.add("pulse"))}setClock(t,e,i){let n;if(i)n="\u221E";else{let r=Math.max(0,e?Math.floor(t):Math.ceil(t));n=`${e?"+":""}${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`}n!==this.lastTime&&(this.sbTime.textContent=n,this.lastTime=n),this.sbOT.textContent=e?"OVERTIME":""}setBoost(t,e){let i=this.views[t];if(!i)return;let n=Math.round(e);if(n===i.lastBoost)return;i.lastBoost=n,i.num.textContent=n;let r=Math.ceil(e/100*Cd-.001);i.segs.forEach((a,o)=>a.classList.toggle("on",o<r)),i.gauge.classList.toggle("empty",n===0),i.gauge.classList.toggle("full",n===100)}setItem(t,e,i,n){let r=this.views[t];if(!r)return;if(!e){r.item.classList.add("hidden");return}r.item.classList.remove("hidden");let a=`${e.item}|${e.active}|${n}|${e.item?"":Math.ceil(e.next||0)}`;if(a!==r.itemSig){r.itemSig=a;let o=e.item?i[e.item]:null;r.item.classList.toggle("ready",!!e.item&&!e.active),r.item.classList.toggle("active",!!e.active),r.item.classList.toggle("empty",!e.item),r.itemIcon.textContent=o?o.icon:"\u23F3",r.itemName.textContent=o?o.name:"Power-up",r.itemKey.innerHTML=e.item?e.active?"active":`press <b>${n}</b>`:`next in ${Math.ceil(e.next||0)}s`}r.itemBar.style.transform=`scaleX(${e.active?e.frac:e.item?1:0})`}viewStatus(t,e,i=1.6){let n=this.views[t];n&&(n.status.textContent=e,n.status.classList.add("visible"),n.statusTimer=i)}viewCenter(t,e,i=2){let n=this.views[t];n&&(n.center.textContent=e,n.center.classList.add("visible"),n.centerTimer=i)}showBanner(t,e="",i="",n=2){this.bannerMain.textContent=t,this.bannerSub.textContent=e,this.banner.className="banner visible "+i,this.bannerTimer=n}hideBanner(){this.banner.className="banner",this.bannerTimer=0}addFeed(t,e=-1){let i=ui("div","feed-item"+(e>=0?" team"+e:""),this.feed,t);for(setTimeout(()=>i.classList.add("fade"),3500),setTimeout(()=>i.remove(),4200);this.feed.children.length>5;)this.feed.firstChild.remove()}updatePlates(t,e,i,n){let r=this.views[t];if(!r)return;let a=r.box.clientWidth,o=r.box.clientHeight,l=new Set;for(let c of i){if(c.car===n||c.car.demolished||(Vs.set(c.pos.x*.01,(c.pos.y+95)*.01,c.pos.z*.01).project(e),Vs.z>1||Vs.z<-1||Math.abs(Vs.x)>1.1||Math.abs(Vs.y)>1.1))continue;let h=r.plateMap.get(c.car.id);h||(h=ui("div","plate team"+c.car.team,r.plates,c.name),r.plateMap.set(c.car.id,h));let u=(Vs.x+1)/2*a,d=(1-Vs.y)/2*o,f=e.position.distanceTo(Vs.set(c.pos.x*.01,c.pos.y*.01,c.pos.z*.01));h.style.transform=`translate(${u.toFixed(1)}px, ${d.toFixed(1)}px) translate(-50%, -100%) scale(${Math.max(.55,Math.min(1,12/f)).toFixed(3)})`,h.style.display="",l.add(c.car.id)}for(let[c,h]of r.plateMap)l.has(c)||(h.style.display="none")}update(t){this.bannerTimer>0&&(this.bannerTimer-=t,this.bannerTimer<=0&&this.banner.classList.remove("visible"));for(let e of this.views)e.statusTimer>0&&(e.statusTimer-=t,e.statusTimer<=0&&e.status.classList.remove("visible")),e.centerTimer>0&&(e.centerTimer-=t,e.centerTimer<=0&&e.center.classList.remove("visible"))}setFps(t){this.fps.textContent=t}};var Em=Ut.halfZ,ZM=Ut.goalHalfW,$M=Ut.goalH,Pd=De.radius,ze=new S,_m=new S,Mm=new S,bm=new le,Id=s=>(s===0?1:-1)*(Em+450),Sh=class{reset(){}preStep(){}preBall(){}onTouch(){}postStep(){}},Ld=class extends Sh{constructor(t){super(),this.world=t,this.name="heatseeker",this.reset(),t.ball.force=(e,i)=>this.force(e,i)}reset(){this.team=-1,this.speed=0,this.lastBoost=-10,this.lastFlip=-10}onTouch(t){let e=this.world.time;(t.team!==this.team||e-this.lastBoost>.5)&&(this.speed=Math.min(4200,Math.max(1500,this.speed+160)),this.lastBoost=e),this.team=t.team}force(t,e){if(this.team<0)return;ze.set(0,330,Id(this.team)).sub(t.pos);let i=ze.length();i<1||(ze.multiplyScalar(this.speed/i),t.vel.y+=Hi*e*.92,t.vel.lerp(ze,1-Math.exp(-e*1.5)))}postStep(){if(this.team<0)return;let t=this.world.ball,e=(this.team===0?1:-1)*Em,i=Math.abs(t.pos.z-e)<Pd+40,n=Math.abs(t.pos.x)<ZM&&t.pos.y<$M;i&&!n&&this.world.time-this.lastFlip>.6&&(this.team=1-this.team,this.lastFlip=this.world.time,this.world.events.push({type:"heatseekFlip",point:t.pos.clone()}))}},Qo={grapple:{name:"Grappling Hook",icon:"\u{1FA9D}",hint:"Pulls you to the ball"},plunger:{name:"Plunger",icon:"\u{1FAA0}",hint:"Pulls the ball to you"},tornado:{name:"Tornado",icon:"\u{1F32A}\uFE0F",hint:"Spins up everything near you"},curveball:{name:"Curveball",icon:"\u{1F300}",hint:"Curves the ball into their goal"},spikes:{name:"Spikes",icon:"\u{1F4CC}",hint:"The ball sticks to your car"},boot:{name:"Boot",icon:"\u{1F462}",hint:"Kicks the nearest opponent away"},power:{name:"Power Hitter",icon:"\u{1F4A5}",hint:"Huge hits and demolish on contact"},freezer:{name:"Freezer",icon:"\u2744\uFE0F",hint:"Freezes the ball in place"}},ha=Object.keys(Qo),Sm={grapple:4200,plunger:4200,curveball:5e3,freezer:6e3,boot:4500},Dd=class extends Sh{constructor(t,e=ha){super(),this.world=t,this.name="rumble",this.pool=e.length?e:ha,this.state=new Map,this.curve=null,this.reset()}st(t){let e=this.state.get(t);return e||(e={item:null,timer:3,held:0,active:null,prevUse:!1},this.state.set(t,e)),e}reset(){for(let t of this.world.cars){let e=this.st(t);this.endActive(t,e),e.item=null,e.timer=2+Math.random()*3,e.prevUse=!!t.input.useItem}this.curve=null,this.world.ball.iceTimer=0,this.world.ball.attachedTo=null}give(t,e){e.item=this.pool[Math.floor(Math.random()*this.pool.length)],e.held=0,this.world.events.push({type:"itemGet",car:t,item:e.item})}inRange(t,e){let i=Sm[e];return i?e==="boot"?!!this.nearestOpponent(t,i):t.pos.distanceTo(this.world.ball.pos)<i:!0}nearestOpponent(t,e){let i=null,n=e;for(let r of this.world.cars){if(r.team===t.team||r.demolished)continue;let a=r.pos.distanceTo(t.pos);a<n&&(n=a,i=r)}return i}use(t){let e=this.st(t);if(!e.item||e.active||t.demolished||this.world.ball.frozen)return!1;let i=e.item;if(!this.inRange(t,i))return this.world.events.push({type:"itemFail",car:t,item:i}),!1;e.item=null;let n=this.world,r=n.ball;switch(i){case"grapple":case"plunger":e.active={type:i,phase:"shoot",t:0,hook:t.pos.clone()};break;case"tornado":e.active={type:"tornado",t:0,dur:5.5};break;case"spikes":e.active={type:"spikes",t:0,dur:10,offset:null};break;case"power":e.active={type:"power",t:0,dur:8},t.hitPower=1.8;break;case"curveball":this.curve={team:t.team,t:4},r.vel.length()<1200&&(r.vel.addScaledVector(ze.set(0,0,Math.sign(Id(t.team))),900),r.vel.y+=250),e.timer=9;break;case"freezer":r.iceTimer=3.5,r.vel.set(0,0,0),e.timer=9;break;case"boot":{let a=this.nearestOpponent(t,Sm.boot);ze.copy(a.pos).sub(t.pos).setY(0).normalize(),a.vel.addScaledVector(ze,1700),a.vel.y+=1050,a.noGround=.25,a.onGround=!1,a.angVel.set(Math.random()-.5,0,Math.random()-.5).multiplyScalar(8),n.events.push({type:"boot",car:a,by:t,point:a.pos.clone()}),e.timer=9;break}default:break}return n.events.push({type:"itemUse",car:t,item:i}),!0}endActive(t,e){let i=e.active;i&&(i.type==="power"&&(t.hitPower=1),i.type==="spikes"&&this.world.ball.attachedTo===t&&this.release(t,!1),e.active=null,e.timer=8+Math.random()*3)}release(t,e){let i=this.world.ball;i.attachedTo===t&&(i.attachedTo=null,e&&(t.forward(Mm),i.vel.copy(t.vel).addScaledVector(Mm,950),i.vel.y+=250))}preStep(t){let e=this.world,i=e.ball;for(let n of e.cars){let r=this.st(n),a=!!n.input.useItem&&!r.prevUse;if(r.prevUse=!!n.input.useItem,n.demolished){r.active&&this.endActive(n,r);continue}a&&this.use(n),!r.item&&!r.active&&(r.timer-=t,r.timer<=0&&!i.frozen&&this.give(n,r)),r.item&&(r.held+=t);let o=r.active;if(o)switch(o.t+=t,o.type){case"grapple":case"plunger":{if(o.phase==="shoot"){ze.copy(i.pos).sub(o.hook);let l=ze.length(),c=6e3*t;l<=c+Pd?(o.hook.copy(i.pos),o.phase="pull",o.pullT=0,e.events.push({type:"hooked",car:n,item:o.type,point:i.pos.clone()})):o.hook.addScaledVector(ze,c/l),o.t>1&&o.phase==="shoot"&&this.endActive(n,r)}else{o.pullT+=t,o.hook.copy(i.pos),ze.copy(i.pos).sub(n.pos);let l=ze.length();ze.divideScalar(Math.max(1,l)),o.type==="grapple"?(n.vel.addScaledVector(ze,5400*t),n.vel.y+=Hi*.6*t,n.noGround=.12,(l<230||o.pullT>2)&&this.endActive(n,r)):(i.vel.addScaledVector(ze,-6800*t),i.vel.y+=Hi*.5*t,(l<380||o.pullT>1.8)&&this.endActive(n,r))}break}case"tornado":{let c=(h,u)=>{ze.copy(h.pos).sub(n.pos);let d=Math.hypot(ze.x,ze.z);if(d>1050||h.pos.y>2200)return!1;let f=1-d/1050;return _m.set(-ze.z,0,ze.x).normalize(),h.vel.addScaledVector(_m,2e3*f*t*u),h.vel.y+=(Hi+900*f+150)*t*u,d>1&&h.vel.addScaledVector(ze.set(ze.x/d,0,ze.z/d),-700*f*t*u),!0};!i.attachedTo&&i.iceTimer<=0&&c(i,1);for(let h of e.cars)h===n||h.demolished||c(h,.85)&&(h.noGround=.1,h.onGround=!1);o.t>o.dur&&this.endActive(n,r);break}case"spikes":case"power":o.t>o.dur&&this.endActive(n,r);break;default:break}}if(this.curve&&!i.attachedTo&&i.iceTimer<=0){this.curve.t-=t;let n=Math.hypot(i.vel.x,i.vel.z);ze.set(-i.pos.x,0,Id(this.curve.team)-i.pos.z).normalize();let r=Math.atan2(i.vel.x,i.vel.z),o=Math.atan2(ze.x,ze.z)-r;for(;o>Math.PI;)o-=Math.PI*2;for(;o<-Math.PI;)o+=Math.PI*2;let l=Math.sign(o)*Math.min(Math.abs(o),2.2*t),c=Math.max(n,1500);i.vel.x=Math.sin(r+l)*c,i.vel.z=Math.cos(r+l)*c,this.curve.t<=0&&(this.curve=null)}}preBall(){let t=this.world.ball,e=t.attachedTo;if(!e)return;let i=this.st(e);if(!i.active||i.active.type!=="spikes"||e.demolished){this.release(e,!1);return}t.prevPos.copy(t.pos),ze.copy(i.active.offset).applyQuaternion(e.quat),t.pos.copy(e.pos).add(ze),t.vel.copy(e.vel)}onTouch(t){let e=this.world.ball;e.iceTimer>0&&(e.iceTimer=0),this.curve&&this.curve.team!==t.team&&(this.curve=null),e.attachedTo&&e.attachedTo!==t&&this.release(e.attachedTo,!1);let i=this.st(t);if(i.active&&i.active.type==="spikes"&&!e.attachedTo){bm.copy(t.quat).invert();let n=e.pos.clone().sub(t.pos).applyQuaternion(bm);n.setLength(Math.max(n.length(),Pd+52)),i.active.offset=n,e.attachedTo=t,e.lastTouch=t}}postStep(){let t=this.world.ball;if(t.attachedTo)for(let e of this.world.events){if(e.type==="dodge"&&e.car===t.attachedTo){this.release(e.car,!0);break}if(e.type==="bump"&&e.car===t.attachedTo){this.release(e.car,!1);break}}}status(t){let e=this.st(t);if(e.active){let i=e.active,n=i.dur?Math.max(0,1-i.t/i.dur):1;return{item:i.type,active:!0,frac:n}}return e.item?{item:e.item,active:!1,frac:1}:{item:null,active:!1,frac:0,next:Math.max(0,e.timer)}}};function wm(s,t,e){return t==="heatseeker"?new Ld(s):t==="rumble"?new Dd(s,e):null}function oi(s,t,e,i){let n=document.createElement(s);return t&&(n.className=t),i!==void 0&&(n.innerHTML=i),e&&e.appendChild(n),n}var JM={solo:{title:"PLAY vs CPU",humans:1},versus:{title:"2 PLAYERS \u2014 VERSUS",humans:2},coop:{title:"2 PLAYERS \u2014 CO-OP vs CPU",humans:2}},Tm=`
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
</div>`,Eh=class{constructor(t,e){this.app=t,this.root=e,this.visible=!1,this.items=[],this.focus=0,this.screen=null,this.joinSlots=[null,null],e.addEventListener("mousemove",()=>{this.mouse=!0})}hide(){this.visible=!1,this.root.classList.add("hidden"),this.root.innerHTML="",this.screen=null}show(t,e){this.visible=!0,this.root.classList.remove("hidden"),this.root.innerHTML="",this.root.className="menu screen-"+t,this.screen=t,this.data=e,this.items=[],this.focus=0,this.onBack=null,this.custom=null,this["screen_"+t].call(this,e),this.refreshFocus()}panel(t,e){let i=oi("div","panel",this.root);return t&&oi("div","panel-title",i,t),e&&oi("div","panel-sub",i,e),i}button(t,e,i,n=""){let r=oi("div","item button "+n,t,`<span>${e}</span>`),a={el:r,type:"button",action:i};return r.addEventListener("click",()=>{this.focus=this.items.indexOf(a),this.activate()}),r.addEventListener("mouseenter",()=>{this.focus=this.items.indexOf(a),this.refreshFocus()}),this.items.push(a),a}option(t,e,i,n,r){let a=oi("div","item option",t);oi("span","opt-label",a,e);let o=oi("span","opt-ctl",a),l=oi("span","arrow",o,"\u25C0"),c=oi("span","opt-value",o),h=oi("span","arrow",o,"\u25B6"),u={el:a,type:"option",values:i,get:n,set:r,val:c},d=()=>{let f=n(),p=i.find(v=>v.value===f)||i[0];c.textContent=p.label};return u.render=d,u.change=f=>{let p=n(),v=i.findIndex(m=>m.value===p);v=(v+f+i.length)%i.length,r(i[v].value),d(),this.app.audio.click(),this.onOptionChange&&this.onOptionChange()},l.addEventListener("click",f=>{f.stopPropagation(),u.change(-1)}),h.addEventListener("click",f=>{f.stopPropagation(),u.change(1)}),a.addEventListener("click",()=>u.change(1)),a.addEventListener("mouseenter",()=>{this.focus=this.items.indexOf(u),this.refreshFocus()}),d(),this.items.push(u),u}refreshFocus(){this.items.forEach((t,e)=>t.el.classList.toggle("focused",e===this.focus))}activate(){let t=this.items[this.focus];t&&(t.type==="button"?(this.app.audio.select(),t.action()):t.type==="option"&&t.change(1))}update(t){if(!this.visible||this.custom&&this.custom(t))return;let e=this.items.length;t.up&&e&&(this.focus=(this.focus-1+e)%e,this.refreshFocus(),this.app.audio.click()),t.down&&e&&(this.focus=(this.focus+1)%e,this.refreshFocus(),this.app.audio.click());let i=this.items[this.focus];i&&i.type==="option"&&(t.left&&i.change(-1),t.right&&i.change(1)),t.confirm&&this.activate(),t.back&&this.onBack&&(this.app.audio.click(),this.onBack()),t.start&&this.onStart&&this.onStart()}screen_main(){let t=oi("div","logo",this.root);t.innerHTML='<div class="logo-top">ROCKET</div><div class="logo-bottom">ARENA</div><div class="logo-tag">supersonic car soccer</div>';let e=this.panel();e.classList.add("main-panel"),this.button(e,"\u25B6  PLAY vs CPU",()=>this.show("setup","solo"),"primary"),this.button(e,"\u{1F465}  2 PLAYERS \u2014 VERSUS",()=>this.show("setup","versus")),this.button(e,"\u{1F91D}  2 PLAYERS \u2014 CO-OP vs CPU",()=>this.show("setup","coop")),this.button(e,"\u2699  SETTINGS",()=>this.show("settings")),this.button(e,"\u{1F3AE}  CONTROLS",()=>this.show("controls")),this.button(e,"\u26F6  FULLSCREEN",()=>this.app.toggleFullscreen());let i=oi("div","footer",this.root);this.padStatus(i)}padStatus(t){let e=()=>{let i=this.app.input.connectedPads();if(this.app.input.gamepadBlocked){t.innerHTML='<span class="footer-hint warn">\u26A0\uFE0F Controllers are blocked on this page. Keyboard &amp; mouse work. For controllers, open the game from its own web address.</span>';return}t.innerHTML=i.length?i.map((n,r)=>`<span class="pad-chip">\u{1F3AE} ${iu(n.id)} ${r+1}</span>`).join("")+'<span class="footer-hint">\u24B6 select \xB7 \u24B7 back</span>':'<span class="footer-hint">Connect an Xbox controller and press any button \xB7 or use mouse / keyboard (Enter to select)</span>'};e(),this.footerTimer=setInterval(()=>{t.isConnected?e():clearInterval(this.footerTimer)},1e3)}screen_setup(t){let e=this.app.settings,i=JM[t],n=this.panel(i.title,t==="solo"?"You (blue) vs CPU (orange)":t==="versus"?"Player 1 (blue) vs Player 2 (orange) \xB7 split screen":"Player 1 & Player 2 (blue) vs CPU (orange) \xB7 split screen"),r=t==="coop"?[{label:"2 vs 2",value:2},{label:"3 vs 3",value:3}]:[{label:"1 vs 1",value:1},{label:"2 vs 2",value:2},{label:"3 vs 3",value:3}],a="teamSize_"+t;r.some(l=>l.value===e[a])||(e[a]=r[0].value),this.option(n,"Game mode",[{label:"Soccar",value:"soccar"},{label:"Heatseeker (ball homes in)",value:"heatseeker"},{label:"Rumble (power-ups)",value:"rumble"}],()=>e.gameMode,l=>{e.gameMode=l}),this.option(n,"Power-ups (Rumble)",[{label:"All, random",value:"all"}].concat(ha.map(l=>({label:`${Qo[l].name} only`,value:l}))),()=>e.items,l=>{e.items=l}),this.option(n,"Team size",r,()=>e[a],l=>{e[a]=l}),this.option(n,"Match length",[{label:"3 minutes",value:180},{label:"5 minutes",value:300},{label:"7 minutes",value:420},{label:"1 minute",value:60},{label:"Unlimited",value:0}],()=>e.duration,l=>{e.duration=l}),this.option(n,"CPU skill",[{label:"Rookie",value:"rookie"},{label:"Pro",value:"pro"},{label:"All-Star",value:"allstar"}],()=>e.difficulty,l=>{e.difficulty=l}),this.option(n,"Stadium",[{label:"Night",value:"night"},{label:"Sunset",value:"sunset"}],()=>e.timeOfDay,l=>{e.timeOfDay=l}),t!=="solo"&&this.option(n,"Split screen",[{label:"Top / Bottom",value:"horizontal"},{label:"Side by side",value:"vertical"}],()=>e.split,l=>{e.split=l});let o=()=>{this.app.saveSettings(),t==="solo"?this.app.startMatch({mode:t,gameMode:e.gameMode,items:e.items,teamSize:e[a],duration:e.duration,difficulty:e.difficulty,split:e.split,humans:[{device:{type:"any"},team:0,name:"You"}]}):this.show("join",t)};this.button(n,t==="solo"?"\u25B6  KICK OFF":"\u25B6  CONTINUE",o,"primary"),this.button(n,"\u25C0  BACK",()=>this.show("main")),this.onBack=()=>this.show("main"),this.focus=this.items.length-2}screen_join(t){let e=this.app.settings,i=this.app.input,n=this.panel("PRESS TO JOIN","Controller players press <b>\u24B6</b>. The keyboard &amp; mouse player clicks a slot or presses <b>Space</b>."),r=oi("div","join-blocked",n),a=oi("div","join-slots",n);this.joinSlots=[null,null];let o=(m,g)=>m&&g&&m.type===g.type&&(m.type==="pad"?m.index===g.index:m.layout===g.layout),l=m=>m.type==="pad"?"\u{1F3AE} "+iu(i.pads[m.index]?.id):m.layout==="p1"?"\u2328\uFE0F\u{1F5B1}\uFE0F Keyboard &amp; Mouse":"\u2328\uFE0F Keyboard (arrow keys)",c=()=>!!(this.joinSlots[0]&&this.joinSlots[1]),h=()=>{},u=(m,g)=>{if(this.joinSlots.some(b=>o(b,m)))return!1;let x=g>=0&&!this.joinSlots[g]?g:this.joinSlots.findIndex(b=>!b);return x<0?!1:(this.joinSlots[x]=m,this.app.audio.select(),m.type==="pad"&&i.rumble(m,.5,.5,150),h(),!0)},d=[0,1].map(m=>{let g=t==="versus"?m:0,x=oi("div","join-slot team"+g,a);oi("div","join-title",x,`PLAYER ${m+1}`);let b=oi("div","join-body",x);return x.addEventListener("click",()=>{this.joinSlots[m]||u({type:"kb",layout:"p1"},m)||u({type:"kb",layout:"p2"},m)}),{box:x,body:b,team:g}}),f=oi("div","join-status",n),p=()=>{if(!c())return;let m=this.joinSlots.map((x,b)=>({device:x,team:t==="versus"?b:0,name:`Player ${b+1}`})),g=e["teamSize_"+t];this.app.startMatch({mode:t,gameMode:e.gameMode,items:e.items,teamSize:g,duration:e.duration,difficulty:e.difficulty,split:e.split,humans:m})},v=this.button(n,"\u25B6  START MATCH",p,"primary");this.button(n,"\u25C0  BACK",()=>this.show("setup",t)),h=()=>{d.forEach((m,g)=>{let x=this.joinSlots[g];if(m.box.classList.toggle("joined",!!x),m.box.classList.toggle("clickable",!x),x){let b=x.type==="pad"?"Press \u24B7 to leave":"Press Backspace to leave";m.body.innerHTML=`<div class="join-device">${l(x)}</div><div class="join-team" style="color:${Ie[m.team].css}">${m.team===0?"BLUE":"ORANGE"} TEAM</div><div class="join-leave">${b}</div>`}else m.body.innerHTML='<div class="join-wait">Press <b>\u24B6</b> on a controller<br><span><b>Click here</b> or press <b>Space</b> for keyboard &amp; mouse</span></div>'}),f.innerHTML=c()?"<b>Ready!</b> Press <b>\u24B6</b>, <b>Start</b>, <b>Enter</b> or click <b>Start match</b>":"Waiting for players\u2026",f.classList.toggle("ready",c()),v.el.classList.toggle("hidden",!c()),r.innerHTML=i.gamepadBlocked?"\u26A0\uFE0F This page is not allowed to read game controllers, so only keyboard &amp; mouse work here. To play with a controller, open the game from its own web address (GitHub Pages) or from the downloaded <b>index.html</b>.":"",r.classList.toggle("hidden",!i.gamepadBlocked)},h(),this.custom=m=>{for(let x of i.connectedPads()){let b={type:"pad",index:x.index},y=this.joinSlots.findIndex(E=>o(E,b));if(x.pressed("a")||x.pressed("menu")){if(y<0)u(b,-1);else if(c())return p(),!0}if(x.pressed("b"))if(y>=0)this.joinSlots[y]=null,this.app.audio.click(),h();else return this.show("setup",t),!0}let g=x=>i.keysPressed.has(x);if(c()&&(g("Space")||g("Enter")||g("NumpadEnter")))return p(),!0;if(g("Space")&&u({type:"kb",layout:"p1"},-1),(g("Enter")||g("NumpadEnter"))&&u({type:"kb",layout:"p2"},-1),g("Backspace")){for(let x=1;x>=0;x--)if(this.joinSlots[x]&&this.joinSlots[x].type==="kb"){this.joinSlots[x]=null,h();break}}return g("Escape")?(this.show("setup",t),!0):(i.gamepadBlocked&&!this.blockedShown&&(this.blockedShown=!0,h()),!0)}}screen_settings(){let t=this.app.settings,e=this.panel("SETTINGS");this.option(e,"Graphics",[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low (fast)",value:"low"}],()=>t.quality,n=>{t.quality=n}),this.option(e,"Handling",[{label:"Easy (recommended)",value:"easy"},{label:"Realistic (Rocket League)",value:"realistic"}],()=>t.handling,n=>{t.handling=n}),this.option(e,"Default camera",[{label:"Ball cam",value:!0},{label:"Car cam",value:!1}],()=>t.ballCam,n=>{t.ballCam=n}),this.option(e,"Field of view",[90,95,100,105,110].map(n=>({label:n+"\xB0",value:n})),()=>t.fov,n=>{t.fov=n}),this.option(e,"Goal replays",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.replays,n=>{t.replays=n}),this.option(e,"Victory cinematic",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.victoryFx!==!1,n=>{t.victoryFx=n}),this.option(e,"Controller rumble",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.rumble,n=>{t.rumble=n}),this.option(e,"Volume",[0,1,2,3,4,5,6,7,8,9,10].map(n=>({label:n===0?"Off":String(n),value:n/10})),()=>Math.round(t.volume*10)/10,n=>{t.volume=n,this.app.audio.setVolume(n)}),this.option(e,"Show FPS",[{label:"Off",value:!1},{label:"On",value:!0}],()=>t.showFps,n=>{t.showFps=n});let i=()=>{this.app.applySettings(),this.show("main")};this.button(e,"\u25C0  BACK",i,"primary"),this.onBack=i}screen_controls(){let t=this.panel("CONTROLS");t.classList.add("wide"),oi("div","controls",t,Tm),this.button(t,"\u25C0  BACK",()=>this.show("main"),"primary"),this.onBack=()=>this.show("main")}screen_pause(){let t=this.panel("PAUSED");this.button(t,"\u25B6  RESUME",()=>this.app.resume(),"primary"),this.button(t,"\u21BB  RESTART MATCH",()=>this.app.restartMatch()),this.button(t,"\u{1F3AE}  CONTROLS",()=>this.show("pauseControls")),this.button(t,"\u23CF  QUIT TO MENU",()=>this.app.quitToMenu()),this.onBack=()=>this.app.resume(),this.onStart=()=>this.app.resume()}screen_pauseControls(){let t=this.panel("CONTROLS");t.classList.add("wide"),oi("div","controls",t,Tm),this.button(t,"\u25C0  BACK",()=>this.show("pause"),"primary"),this.onBack=()=>this.show("pause")}screen_results(t){let e=this.panel(t.winner===0?"BLUE TEAM WINS":"ORANGE TEAM WINS");e.classList.add("wide","results",t.winner===0?"win-blue":"win-orange"),oi("div","final-score",e,`<span class="b">${t.scores[0]}</span><span class="dash">\u2013</span><span class="o">${t.scores[1]}</span>`);let i=t.rows.map(n=>`<tr class="team${n.team}"><td class="nm">${n.name===t.mvp?'<span class="mvp">MVP</span> ':""}${n.name}${n.human?"":' <span class="cpu">CPU</span>'}</td><td>${n.score}</td><td>${n.goals}</td><td>${n.assists}</td><td>${n.saves}</td><td>${n.shots}</td><td>${n.demos}</td></tr>`).join("");oi("table","stats",e,`<tr><th>Player</th><th>Score</th><th>Goals</th><th>Assists</th><th>Saves</th><th>Shots</th><th>Demos</th></tr>${i}`),this.button(e,"\u21BB  REMATCH",()=>this.app.restartMatch(),"primary"),this.button(e,"\u23CF  MAIN MENU",()=>this.app.quitToMenu()),this.onBack=()=>this.app.quitToMenu()}};var Pm=Ut.halfX,Bd=Ut.halfZ,Am=Ut.height,KM=Ut.chamfer,Gs=Ut.cornerR,Nd=Ut.rampR,Fd=Ut.goalHalfW,jM=Ut.goalH,QM=Ut.goalDepth,Ws=Pm-Gs,qs=Bd-Gs,Od=Pm+Bd-KM-Gs*Math.SQRT2,Rm=Ws,ua=Od-Ws,da=Od-qs,Cm=qs;function Ud(s,t,e,i,n,r){let a=n-e,o=r-i,l=((s-e)*a+(t-i)*o)/(a*a+o*o);l=l<0?0:l>1?1:l;let c=s-e-a*l,h=t-i-o*l;return c*c+h*h}function Hd(s,t){let e=s<0?-s:s,i=t<0?-t:t,n=Math.min(Ud(e,i,Ws,0,Rm,ua),Ud(e,i,Rm,ua,da,Cm),Ud(e,i,da,Cm,0,qs)),r=e<Ws&&i<qs&&e+i<Od,a=Math.sqrt(n);return(r?-a:a)-Gs}function tb(s,t,e){let i=Hd(s,e),n=Math.abs(t-Am/2)-Am/2,r=i+Nd,a=n+Nd,o=r>0?r:0,l=a>0?a:0;return-(Math.sqrt(o*o+l*l)+Math.min(Math.max(r,a),0)-Nd)}function eb(s,t,e){return Math.min(Fd-Math.abs(s),t,jM-t,Bd+QM-Math.abs(e))}function an(s,t,e){let i=tb(s,t,e),n=eb(s,t,e);return i>n?i:n}function bs(s,t,e,i){let r=an(s+1,t,e)-an(s-1,t,e),a=an(s,t+1,e)-an(s,t-1,e),o=an(s,t,e+1)-an(s,t,e-1),l=Math.hypot(r,a,o)||1;return i.x=r/l,i.y=a/l,i.z=o/l,i}function Im(s,t,e,i,n,r,a){let o=0;for(let l=0;l<32;l++){let c=an(s+i*o,t+n*o,e+r*o);if(c<.5)return o;if(o+=c,o>a)return-1}return o<=a?o:-1}function fa(s=220,t=5){let e=[[Ws,-ua],[Ws,ua],[da,qs],[-da,qs],[-Ws,ua],[-Ws,-ua],[-da,-qs],[da,-qs]],i=[],n=(a,o,l,c,h)=>{let u=i[i.length-1];u&&Math.abs(u.x-a)<1e-6&&Math.abs(u.z-o)<1e-6||i.push({x:a,z:o,nx:-l,nz:-c,wall:h})};for(let a=0;a<8;a++){let o=e[a],l=e[(a+1)%8],c=e[(a+2)%8],h=l[0]-o[0],u=l[1]-o[1],d=Math.hypot(h,u),f=[u/d,-h/d],p=a===2?"orange":a===6?"blue":a%2===0?"side":"corner",v=[],m=Math.max(1,Math.ceil(d/s));for(let R=0;R<=m;R++)v.push(R/m);if(p==="orange"||p==="blue"){for(let R of[Fd,-Fd]){let _=(R-o[0])/h;_>0&&_<1&&v.push(_)}v.sort((R,_)=>R-_)}for(let R of v)n(o[0]+h*R+f[0]*Gs,o[1]+u*R+f[1]*Gs,f[0],f[1],p);let g=c[0]-l[0],x=c[1]-l[1],b=Math.hypot(g,x),y=[x/b,-g/b],E=Math.atan2(f[1],f[0]),w=Math.atan2(y[1],y[0]);for(;w<E;)w+=Math.PI*2;for(let R=1;R<t;R++){let _=E+(w-E)*(R/t);n(l[0]+Math.cos(_)*Gs,l[1]+Math.sin(_)*Gs,Math.cos(_),Math.sin(_),"arc")}}let r=0;for(let a=0;a<i.length;a++)a>0&&(r+=Math.hypot(i[a].x-i[a-1].x,i[a].z-i[a-1].z)),i[a].s=r;return i.total=r+Math.hypot(i[0].x-i[i.length-1].x,i[0].z-i[i.length-1].z),i}var pa=new S,zd=new S,Lm=new S,kd=new S,Vd=new S,Gd=new S,ib=De.friction,nb=2,sb=3e-4;function Nm(s,t,e){let i=De.radius;s.vel.y-=Hi*t,e&&e(s,t),s.vel.multiplyScalar(1-De.drag*t);let n=s.vel.length();n>De.maxSpeed&&s.vel.multiplyScalar(De.maxSpeed/n),s.pos.addScaledVector(s.vel,t);let r=0;for(let o=0;o<2;o++){let l=an(s.pos.x,s.pos.y,s.pos.z);if(l>=i)break;bs(s.pos.x,s.pos.y,s.pos.z,pa),s.pos.addScaledVector(pa,i-l);let c=s.vel.dot(pa);if(c<0){zd.copy(pa).multiplyScalar(c),Lm.copy(s.vel).sub(zd),kd.crossVectors(pa,s.angVel).multiplyScalar(i),Vd.copy(Lm).add(kd);let h=Math.max(Vd.length(),1e-4),u=-c/h,d=-c<40?0:De.restitution,f=Gd.copy(Vd).multiplyScalar(-Math.min(1,nb*u)*ib);s.vel.addScaledVector(zd,-(1+d)),s.vel.add(f),s.angVel.add(kd.crossVectors(f,pa).multiplyScalar(sb*i)),r=Math.max(r,-c)}}let a=s.angVel.length();return a>De.maxSpin&&s.angVel.multiplyScalar(De.maxSpin/a),r}var wh=class{constructor(){this.pos=new S(0,De.radius,0),this.vel=new S,this.angVel=new S,this.quat=new le,this.prevPos=this.pos.clone(),this.prevQuat=this.quat.clone(),this.lastTouch=null,this.prevTouch=null,this.lastTouchTime=-10,this.frozen=!1,this.force=null,this.iceTimer=0,this.attachedTo=null}reset(){this.pos.set(0,De.radius,0),this.vel.set(0,0,0),this.angVel.set(0,0,0),this.prevPos.copy(this.pos),this.lastTouch=null,this.prevTouch=null,this.frozen=!0,this.iceTimer=0,this.attachedTo=null}step(t){if(this.attachedTo||(this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.frozen))return 0;if(this.iceTimer>0)return this.iceTimer-=t,this.vel.set(0,0,0),this.angVel.multiplyScalar(.95),0;let e=Nm(this,t,this.force),i=this.angVel.length();return i>1e-4&&(Gd.copy(this.angVel).divideScalar(i),Dm.setFromAxisAngle(Gd,i*t),this.quat.premultiply(Dm).normalize()),e}goalState(){let t=De.radius;if(Math.abs(this.pos.x)<Ut.goalHalfW&&this.pos.y<Ut.goalH){if(this.pos.z>Ut.halfZ+t)return 1;if(this.pos.z<-Ut.halfZ-t)return 0}return-1}},Dm=new le;function Wd(s,t,e,i){let n={pos:s.pos.clone(),vel:s.vel.clone(),angVel:s.angVel.clone()},r=Math.round(t/e);if(i.length=0,s.frozen||s.attachedTo||s.iceTimer>0){for(let a=0;a<=r;a++)i.push({t:a*e,pos:n.pos.clone(),vel:s.frozen?new S:n.vel.clone()});return i}for(let a=0;a<=r;a++)i.push({t:a*e,pos:n.pos.clone(),vel:n.vel.clone()}),Nm(n,e,s.force);return i}var Th=new S,on=new S,qe=new S,qd=new S,tl=new S,Xd=new S,yn=new S,dr=new S,Qn=new S,Um=new le,Yd=new S,Zd=new S,Fm=new S,Bm=new S,Om=new S,$d=new S,jn=Ft.hitboxHalf;function rb(s){return s<=500?.65:s<=2300?.65-.1*(s-500)/1800:Math.max(.3,.55-.25*(s-2300)/2300)}function ab(s,t,e,i){if(s.demolished||t.frozen)return!1;let n=De.radius;s.hitboxCenter(Th),Um.copy(s.quat).invert(),on.copy(t.pos).sub(Th).applyQuaternion(Um);let r=Math.max(-jn.x,Math.min(jn.x,on.x)),a=Math.max(-jn.y,Math.min(jn.y,on.y)),o=Math.max(-jn.z,Math.min(jn.z,on.z)),l=on.x-r,c=on.y-a,h=on.z-o,u=Math.hypot(l,c,h);if(u>=n)return!1;if(u<.001){let E=jn.x-Math.abs(on.x),w=jn.y-Math.abs(on.y),R=jn.z-Math.abs(on.z);l=c=h=0,E<w&&E<R?l=Math.sign(on.x)||1:w<R?c=Math.sign(on.y)||1:h=Math.sign(on.z)||1,u=0}else l/=u,c/=u,h/=u;qe.set(l,c,h).applyQuaternion(s.quat);let d=n-u;qd.set(r,a,o).applyQuaternion(s.quat).add(Th);let f=De.mass,p=Ft.mass;t.pos.addScaledVector(qe,d*(p/(f+p))),s.pos.addScaledVector(qe,-d*(f/(f+p)));let v=Math.min(4600,yn.copy(s.vel).sub(t.vel).length());tl.copy(qd).sub(s.pos),Xd.crossVectors(s.angVel,tl).add(s.vel);let m=yn.copy(t.vel).sub(Xd).dot(qe);if(m>=0)return!0;yn.crossVectors(tl,qe),s.applyInvInertia(yn),dr.crossVectors(yn,tl);let g=1/f+1/p+qe.dot(dr),x=-m/g;t.vel.addScaledVector(qe,x/f),s.vel.addScaledVector(qe,-x/p),s.onGround||(yn.crossVectors(tl,qe).multiplyScalar(-x*.5),s.angVel.add(s.applyInvInertia(yn))),yn.copy(Xd).sub(t.vel),yn.addScaledVector(qe,-yn.dot(qe)),t.angVel.addScaledVector(Qn.crossVectors(qe,yn),-.6/n);let b=-m;e-s.lastBallHit>.1&&(s.forward(dr),Qn.copy(t.pos).sub(Th),Qn.y*=.35,Qn.addScaledVector(dr,-.35*Qn.dot(dr)),Qn.normalize(),t.vel.addScaledVector(Qn,v*rb(v)*(s.hitPower||1)),b=Math.max(b,v)),s.lastBallHit=e;let y=t.vel.length();return y>De.maxSpeed&&t.vel.multiplyScalar(De.maxSpeed/y),i&&i.push({type:"ballHit",car:s,strength:b,point:qd.clone()}),!0}function ob(s,t,e,i,n,r,a){let o=s.x-t.x*n,l=s.y-t.y*n,c=s.z-t.z*n,h=e.x-i.x*n,u=e.y-i.y*n,d=e.z-i.z*n,f=t.x*2*n,p=t.y*2*n,v=t.z*2*n,m=i.x*2*n,g=i.y*2*n,x=i.z*2*n,b=o-h,y=l-u,E=c-d,w=f*f+p*p+v*v,R=f*m+p*g+v*x,_=m*m+g*g+x*x,A=f*b+p*y+v*E,P=m*b+g*y+x*E,I=w*_-R*R,U=I>1e-6?(R*P-_*A)/I:0;U=Math.max(0,Math.min(1,U));let H=(R*U+P)/_;H<0?(H=0,U=Math.max(0,Math.min(1,-A/w))):H>1&&(H=1,U=Math.max(0,Math.min(1,(R-A)/w))),r.set(o+f*U,l+p*U,c+v*U),a.set(h+m*H,u+g*H,d+x*H)}var lb=1100,Jd=new S;function Hm(s,t,e){if(s.team===t.team||s.demolished)return!1;s.forward(Jd);let i=s.vel.dot(e)-t.vel.dot(e);return s.hitPower>1?Jd.dot(e)>.25&&i>150:Jd.dot(e)<.5?!1:s.supersonic?i>300:s.boosting&&s.vel.length()>lb&&i>700}function cb(s,t,e,i,n){if(s.demolished||t.demolished||(s.hitboxCenter(Yd),t.hitboxCenter(Zd),Yd.distanceToSquared(Zd)>62500))return;s.forward(Fm),t.forward(Bm);let r=36;ob(Yd,Fm,Zd,Bm,jn.z-r*.6,Om,$d),qe.copy($d).sub(Om);let a=qe.length();if(a>=r*2)return;a<.001?(qe.set(1,0,0),a=0):qe.divideScalar(a);let o=r*2-a;s.pos.addScaledVector(qe,-o/2),t.pos.addScaledVector(qe,o/2);let l=yn.copy(t.vel).sub(s.vel).dot(qe);if(l>=0)return;Qn.copy(qe).negate();let c=Hm(s,t,qe),h=Hm(t,s,Qn);if(c||h){for(let[E,w]of[[s,t],[t,s]]){if(E===s?!c:!h)continue;let R=w.pos.clone();w.demolish(),E.stats.demos++,i&&i.push({type:"demo",car:w,by:E,point:R})}return}let u=s.id<t.id?s.id*1e3+t.id:t.id*1e3+s.id,d=n.get(u)??-10,f=s.vel.dot(qe),p=-t.vel.dot(qe),v=f>=p?s:t,m=v===s?t:s,g=v===s?qe:Qn;v.forward(dr);let x=dr.dot(g)>.55,b=-(1+.3)*l/2;s.vel.addScaledVector(qe,-b),t.vel.addScaledVector(qe,b);let y=-l;x&&y>350&&e-d>.25&&(m.vel.addScaledVector(g,y*.55),m.vel.y+=Math.min(600,y*.28),m.noGround=.15,m.onGround=!1,n.set(u,e),i&&i.push({type:"bump",car:m,by:v,strength:y,point:$d.clone()}))}var Ah=class{constructor(){this.ball=new wh,this.cars=[],this.time=0,this.events=[],this.bumpTimes=new Map,this.pads=[];for(let[t,e]of _h)this.pads.push({x:t,z:e,big:!0,active:!0,timer:0});for(let[t,e]of Mh)this.pads.push({x:t,z:e,big:!1,active:!0,timer:0});this.respawnIndex=0,this.mode=null}addCar(t){return t.events=this.events,this.cars.push(t),t}resetPads(){for(let t of this.pads)t.active=!0,t.timer=0}respawn(t){let e=Rd[this.respawnIndex++%Rd.length],i=t.team===0?1:-1,n=t.team===0?e[2]:Math.PI-e[2];t.place(e[0]*i,e[1]*i,n),this.events.push({type:"respawn",car:t})}step(t){this.time+=t;let{ball:e,cars:i,mode:n}=this;n&&n.preStep(t);for(let a of i){if(a.demolished){a.respawnTimer-=t,a.prevPos.copy(a.pos),a.respawnTimer<=0&&this.respawn(a);continue}a.step(t)}n&&n.preBall(t);let r=e.step(t);r>250&&this.events.push({type:"bounce",strength:r,point:e.pos.clone()});for(let a of i)e.attachedTo!==a&&ab(a,e,this.time,this.events)&&(e.lastTouch!==a&&(e.prevTouch=e.lastTouch,e.lastTouch=a),e.lastTouchTime=this.time,n&&n.onTouch(a));for(let a=0;a<i.length;a++)for(let o=a+1;o<i.length;o++)cb(i[a],i[o],this.time,this.events,this.bumpTimes);for(let a of this.pads){if(!a.active){a.timer-=t,a.timer<=0&&(a.active=!0);continue}let o=a.big?208:144;for(let l of i){if(l.demolished||l.boost>=100||l.pos.y>180)continue;let c=l.pos.x-a.x,h=l.pos.z-a.z;if(c*c+h*h<o*o){l.boost=a.big?100:Math.min(100,l.boost+12),a.active=!1,a.timer=a.big?10:4,this.events.push({type:"boostPickup",car:l,big:a.big,pad:a});break}}}n&&n.postStep(t)}};var zm=new S(0,1,0),Xe=new S,li=new S,Rh=new S,ts=new S,bi=new S,Kd=new S,vi=new S,el=new S,Ye=new S,Ch=new S,Ph=new S,jd=new S,fr=new le,il=new le,km=new le,Xi=Ft.hitboxHalf,ei=Ft.hitboxOffset,Qd=new S(12/(Ft.mass*((2*Xi.y)**2+(2*Xi.z)**2)),12/(Ft.mass*((2*Xi.x)**2+(2*Xi.z)**2)),12/(Ft.mass*((2*Xi.x)**2+(2*Xi.y)**2))),nl=[];for(let s of[-1,1])for(let t of[-1,1])for(let e of[-1,1])nl.push(new S(ei.x+s*Xi.x,ei.y+t*Xi.y,ei.z+e*Xi.z));nl.push(new S(ei.x,ei.y+Xi.y,ei.z),new S(ei.x,ei.y-Xi.y,ei.z),new S(ei.x+Xi.x,ei.y,ei.z),new S(ei.x-Xi.x,ei.y,ei.z),new S(ei.x,ei.y,ei.z+Xi.z),new S(ei.x,ei.y,ei.z-Xi.z));function hb(s){return s<1400?1600-1440*s/1400:s<1410?160*(1-(s-1400)/10):0}var ma=[[0,.0069],[500,.00398],[1e3,.00235],[1500,.001375],[1750,.0011],[2500,88e-5]];function ub(s){s=Math.abs(s);for(let t=1;t<ma.length;t++)if(s<=ma[t][0]){let e=ma[t-1],i=ma[t],n=(s-e[0])/(i[0]-e[0]);return e[1]+(i[1]-e[1])*n}return ma[ma.length-1][1]}function db(){return{throttle:0,steer:0,pitch:0,yaw:0,roll:0,jump:!1,boost:!1,powerslide:!1,useItem:!1}}var fb=0,Ih=class{constructor(t,e="Player"){this.id=fb++,this.team=t,this.name=e,this.pos=new S,this.vel=new S,this.angVel=new S,this.quat=new le,this.prevPos=new S,this.prevQuat=new le,this.input=db(),this.hitPower=1,this.handling="easy",this.prevJump=!1,this.boost=Ad,this.onGround=!1,this.groundNormal=new S(0,1,0),this.wheelContacts=0,this.wheelDist=[0,0,0,0],this.hasJumped=!1,this.canDodge=!1,this.jumpHold=0,this.noGround=0,this.sinceJump=10,this.dodgeTime=0,this.dodgeAxis=new S,this.dodgePitchSign=0,this.boosting=!1,this.supersonic=!1,this.demolished=!1,this.respawnTimer=0,this.frozen=!1,this.turtleTime=0,this.selfRight=0,this.yawRate=0,this.steerVisual=0,this.wheelSpin=0,this.lastBallHit=-10,this.bodyHit=0,this.events=null,this.stats={goals:0,assists:0,shots:0,saves:0,demos:0,score:0}}forward(t){return t.set(0,0,1).applyQuaternion(this.quat)}up(t){return t.set(0,1,0).applyQuaternion(this.quat)}left(t){return t.set(1,0,0).applyQuaternion(this.quat)}hitboxCenter(t){return t.set(ei.x,ei.y,ei.z).applyQuaternion(this.quat).add(this.pos)}place(t,e,i,n=Ad){this.pos.set(t,Ft.restHeight,e),this.vel.set(0,0,0),this.angVel.set(0,0,0),this.quat.setFromAxisAngle(zm,i),this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.boost=n,this.onGround=!0,this.groundNormal.set(0,1,0),this.hasJumped=!1,this.canDodge=!1,this.jumpHold=0,this.noGround=0,this.dodgeTime=0,this.demolished=!1,this.supersonic=!1,this.boosting=!1,this.turtleTime=0,this.yawRate=0}demolish(){this.demolished=!0,this.respawnTimer=3,this.vel.set(0,0,0),this.angVel.set(0,0,0),this.boosting=!1}speed(){return this.vel.length()}applyInvInertia(t){return km.copy(this.quat).invert(),t.applyQuaternion(km),t.x*=Qd.x,t.y*=Qd.y,t.z*=Qd.z,t.applyQuaternion(this.quat)}step(t){if(this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.demolished||this.frozen){this.boosting=!1,this.prevJump=this.input.jump;return}let e=this.input,i=e.jump&&!this.prevJump;this.prevJump=e.jump,this.sinceJump+=t,this.noGround>0&&(this.noGround-=t),this.forward(Xe),this.up(li),this.left(Rh);let n=0,r=0;if(Kd.set(0,0,0),this.noGround<=0){let c=Ft.restHeight+14;for(let h=0;h<4;h++){let u=Ft.wheels[h];vi.copy(this.pos).addScaledVector(Rh,u.x).addScaledVector(Xe,u.z);let d=Im(vi.x,vi.y,vi.z,-li.x,-li.y,-li.z,c);this.wheelDist[h]=d,d>=0&&(n++,r+=d,vi.addScaledVector(li,-d+2),bs(vi.x,vi.y,vi.z,bi),Kd.add(bi))}}else this.wheelDist.fill(-1);this.wheelContacts=n;let a=!1;n>=2&&(bi.copy(Kd).normalize(),bi.dot(li)>.55&&(a=!0,-Hi*bi.y>Ft.stickyAccel&&(a=!1,n>=3&&(this.hasJumped=!1,this.canDodge=!0,this.sinceJump=0))));let o=i;a&&i&&(o=!1,this.vel.addScaledVector(li,Ft.jumpImpulse),this.jumpHold=Ft.jumpHoldTime,this.hasJumped=!0,this.leftWithoutJump=!1,this.canDodge=!0,this.sinceJump=0,this.noGround=.12,a=!1,this.onGround=!1,this.events&&this.events.push({type:"jump",car:this})),a?this.groundStep(t,bi,r/n):this.airStep(t,o),this.bodyCollide(t,a);let l=this.vel.length();l>Ft.maxSpeed&&this.vel.multiplyScalar(Ft.maxSpeed/l),l>=Ft.supersonic?this.supersonic=!0:l<Ft.supersonic-100&&(this.supersonic=!1),this.steerVisual+=(e.steer-this.steerVisual)*Math.min(1,t*12),this.forward(Xe),this.wheelSpin+=this.vel.dot(Xe)/14*t}groundStep(t,e,i){let n=this.input,r=!this.onGround;if(this.onGround=!0,this.groundNormal.copy(e),this.hasJumped=!1,this.leftWithoutJump=!1,this.canDodge=!1,this.jumpHold=0,this.dodgeTime=0,this.turtleTime=0,this.selfRight=0,r){let b=-this.vel.dot(e);this.events&&b>250&&this.events.push({type:"land",car:this,strength:b})}this.up(li),fr.setFromUnitVectors(li,e),il.identity().slerp(fr,1-Math.exp(-t*28)),this.quat.premultiply(il).normalize(),this.vel.y-=Hi*t;let a=this.vel.dot(e);a<40&&this.vel.addScaledVector(e,-a),this.forward(Xe),Xe.addScaledVector(e,-Xe.dot(e)).normalize(),ts.crossVectors(Xe,e).normalize();let o=this.vel.dot(Xe),l=n.throttle,c=n.boost&&this.boost>0;c&&(l=1);let h=0;if(l!==0)o*l>=0||Math.abs(o)<25?h=hb(Math.abs(o))*l:(h=Ft.brakeAccel*Math.sign(l),Math.abs(o)<Ft.brakeAccel*t&&(h=-o/t));else if(Math.abs(o)>0){let b=Math.min(Ft.coastDecel,Math.abs(o)/t);h=-Math.sign(o)*b}this.vel.addScaledVector(Xe,h*t),c&&(this.vel.addScaledVector(Xe,Ft.boostAccelGround*t),this.boost=Math.max(0,this.boost-Ft.boostUsePerSec*t)),this.boosting=c;let u=this.handling!=="realistic",d=this.vel.dot(Xe),f=ub(d);u&&(f*=1+.55*Math.min(1,Math.max(0,(Math.abs(d)-400)/1600)));let p=-n.steer*f*d;n.powerslide&&(p*=1.35),this.yawRate+=(p-this.yawRate)*(1-Math.exp(-t*(u?26:18))),Math.abs(this.yawRate)>1e-5&&(fr.setFromAxisAngle(e,this.yawRate*t),this.quat.premultiply(fr).normalize(),u&&!n.powerslide&&this.vel.applyQuaternion(il.identity().slerp(fr,.85)));let v=Math.min(1,Math.max(.3,(Hi*Math.max(0,e.y)+Ft.stickyAccel)/(Hi+Ft.stickyAccel))),m=(n.powerslide?2.2:u?30:14)*v;this.forward(Xe),Xe.addScaledVector(e,-Xe.dot(e)).normalize(),ts.crossVectors(Xe,e).normalize();let g=this.vel.dot(ts);this.vel.addScaledVector(ts,-g*(1-Math.exp(-t*m))),this.pos.addScaledVector(this.vel,t);let x=Ft.restHeight-i;this.pos.addScaledVector(e,x*(1-Math.exp(-t*30))),this.angVel.copy(e).multiplyScalar(this.yawRate)}airStep(t,e){let i=this.input;this.onGround&&(this.onGround=!1,this.hasJumped||(this.canDodge=!0,this.sinceJump=0,this.hasJumped=!0,this.leftWithoutJump=!0)),this.onGround=!1,this.yawRate=0,this.forward(Xe),this.up(li),this.left(Rh),ts.copy(Rh).negate(),this.vel.y-=Hi*t,this.jumpHold>0&&(i.jump?(this.vel.addScaledVector(li,Ft.jumpHoldAccel*t),this.jumpHold-=t):this.jumpHold=0);let n=this.leftWithoutJump?1e9:Ft.doubleJumpWindow;if(e&&this.canDodge&&this.sinceJump<n){this.canDodge=!1,this.jumpHold=0;let l=-i.pitch,c=i.yaw;if(Math.abs(l)+Math.abs(c)>=.5){let h=l,u=c,d=Math.hypot(h,u);d>1&&(h/=d,u/=d),Ye.set(Xe.x,0,Xe.z),Ye.lengthSq()<1e-4&&Ye.set(-li.x,0,-li.z),Ye.normalize(),Ch.set(-Ye.z,0,Ye.x);let f=h>=0?Ft.dodgeImpulse:Ft.dodgeImpulse*1.066,p=this.vel.length(),v=Ft.dodgeImpulse*(1+.9*Math.min(1,p/Ft.maxSpeed));this.vel.addScaledVector(Ye,h*f).addScaledVector(Ch,u*v*.9),this.vel.y*=.35,this.angVel.copy(ts).multiplyScalar(-h*Ft.maxAngVel).addScaledVector(Xe,u*Ft.maxAngVel),this.dodgeTime=Ft.dodgeTime,this.dodgeAxis.copy(this.angVel),this.dodgePitchSign=Math.sign(-h),this.events&&this.events.push({type:"dodge",car:this})}else this.vel.addScaledVector(li,Ft.jumpImpulse),this.events&&this.events.push({type:"jump",car:this})}if(this.selfRight>0)this.selfRight-=t,Ye.set(Xe.x,0,Xe.z),Ye.lengthSq()<.001&&Ye.set(-li.x,0,-li.z),Ye.lengthSq()<1e-6&&Ye.set(0,0,1),Ye.normalize(),il.setFromAxisAngle(zm,Math.atan2(Ye.x,Ye.z)),this.quat.slerp(il,1-Math.exp(-t*9)),this.angVel.set(0,0,0);else if(this.dodgeTime>0){if(this.dodgeTime-=t,this.dodgePitchSign!==0&&Math.sign(i.pitch)===this.dodgePitchSign&&Math.abs(i.pitch)>.5){let c=this.angVel.dot(ts);this.angVel.addScaledVector(ts,-c*Math.min(1,t*20))}}else{let l=i.pitch,c=i.yaw,h=i.roll;i.powerslide&&(h=Math.max(-1,Math.min(1,h+i.yaw)),c=0);let u=this.angVel.dot(ts),d=this.angVel.dot(li),f=this.angVel.dot(Xe);u+=(Ft.airPitch*l-Ft.dampPitch*u*(1-Math.abs(l)))*t,d+=(-Ft.airYaw*c-Ft.dampYaw*d*(1-Math.abs(c)))*t,f+=(Ft.airRoll*h-Ft.dampRoll*f)*t,this.angVel.copy(ts).multiplyScalar(u).addScaledVector(li,d).addScaledVector(Xe,f)}let r=this.angVel.length();r>Ft.maxAngVel&&this.angVel.multiplyScalar(Ft.maxAngVel/r);let a=i.boost&&this.boost>0;a?(this.vel.addScaledVector(Xe,Ft.boostAccelAir*t),this.boost=Math.max(0,this.boost-Ft.boostUsePerSec*t)):i.throttle!==0&&this.vel.addScaledVector(Xe,Ft.airThrottleAccel*i.throttle*t),this.boosting=a,this.pos.addScaledVector(this.vel,t);let o=this.angVel.length();o>1e-6&&(Ye.copy(this.angVel).divideScalar(o),fr.setFromAxisAngle(Ye,o*t),this.quat.premultiply(fr).normalize()),this.up(li),bs(this.pos.x,this.pos.y,this.pos.z,bi),this.turtled=this.bodyHit>0&&this.vel.lengthSq()<300*300&&li.dot(bi)<.5,this.turtled?(this.turtleTime+=t,(e&&this.turtleTime>.15||this.turtleTime>2.5)&&(this.vel.y+=340,this.selfRight=.6,this.turtleTime=0,this.canDodge=!1)):this.turtleTime=0}bodyCollide(t,e){this.bodyHit=Math.max(0,this.bodyHit-t);for(let i=0;i<3;i++){let n=0,r=-1;for(let u=0;u<nl.length;u++){vi.copy(nl[u]).applyQuaternion(this.quat).add(this.pos);let d=an(vi.x,vi.y,vi.z);if(d<n){if(e&&(bs(vi.x,vi.y,vi.z,bi),this.up(li),Math.abs(bi.dot(li))>.6))continue;n=d,r=u}}if(r<0)return;if(vi.copy(nl[r]).applyQuaternion(this.quat).add(this.pos),bs(vi.x,vi.y,vi.z,bi),this.pos.addScaledVector(bi,-n+.1),this.bodyHit=.2,el.copy(vi).sub(this.pos),e){let u=this.vel.dot(bi);u<0&&this.vel.addScaledVector(bi,-u*1.2);continue}jd.crossVectors(this.angVel,el).add(this.vel);let a=jd.dot(bi);if(a>=0)continue;Ye.crossVectors(el,bi),this.applyInvInertia(Ye),Ch.crossVectors(Ye,el);let o=1/Ft.mass+bi.dot(Ch),c=-(1+(a<-350?.3:0))*a/o;Ph.copy(bi).multiplyScalar(c),Ye.copy(jd).addScaledVector(bi,-a);let h=Ye.length();if(h>.001){Ye.divideScalar(h);let u=Math.min(.6*c,h*Ft.mass/2);Ph.addScaledVector(Ye,-u)}this.vel.addScaledVector(Ph,1/Ft.mass),Ye.crossVectors(el,Ph),this.angVel.add(this.applyInvInertia(Ye))}}};var Vm={rookie:{itemDelay:2.5,replan:.32,aimError:650,boost:.35,dodge:!1,kickoffFlip:!1,jumpReach:200,aerial:!1,maxSpeed:1900,wrongSideCare:.4},pro:{itemDelay:1,replan:.14,aimError:260,boost:.85,dodge:!0,kickoffFlip:!0,jumpReach:420,aerial:!1,maxSpeed:2300,wrongSideCare:.8},allstar:{itemDelay:.4,replan:.05,aimError:90,boost:1,dodge:!0,kickoffFlip:!0,jumpReach:1300,aerial:!0,maxSpeed:2300,wrongSideCare:1}},Si=new S,Lh=new S,Xs=new S,pr=new S,_e=new S,_n=new S,Yi=new S,pb=new S(0,-Hi,0),Gm=new S,es=De.radius,ji=Ut.halfZ,Ss=Ut.goalHalfW;function Wm(s){if(s<=0)return 0;let t=(Ft.jumpHoldAccel-Hi)/2;if(s<=74.6)return(-Ft.jumpImpulse+Math.sqrt(Ft.jumpImpulse**2+4*t*s))/(2*t);let e=453.3,n=e*e-4*325*(s-74.6);return n<0?1/0:.2+(e-Math.sqrt(n))/650}function mb(s){if(s<=96)return Wm(s);let t=712,i=t*t-4*325*(s-96);return i<0?1/0:.25+(t-Math.sqrt(i))/650}var ga=[[0,.0069],[500,.00398],[1e3,.00235],[1500,.001375],[1750,.0011],[2500,88e-5]];function gb(s){for(let t=1;t<ga.length;t++)if(s<=ga[t][0]){let e=ga[t-1],i=ga[t];return e[1]+(i[1]-e[1])*(s-e[0])/(i[0]-e[0])}return ga[ga.length-1][1]}function vb(s,t,e,i){t=Math.max(0,Math.min(t,e));let n=(e-t)/i,r=(t+e)/2*n;return s<=r?(-t+Math.sqrt(t*t+2*i*s))/i:n+(s-r)/e}var Dh=class{constructor(t,e="pro"){this.car=t,this.cfg=Vm[e]||Vm.pro,this.replanT=Math.random()*.1,this.target=new S,this.ballTarget=new S,this.desiredSpeed=2300,this.interceptT=1,this.mode="chase",this.seq=null,this.seqT=0,this.stuckT=0,this.reverseT=0,this.aimOffset=(Math.random()-.5)*this.cfg.aimError,this.aerialing=!1,this.lastJumpAt=-10,this.careT=0,this.cares=!0,this.retreatStart=-10}get attackSign(){return this.car.team===0?1:-1}startSeq(t){this.seq=t,this.seqT=0}wantItem(t){let e=t.rumble;if(!e)return!1;let i=e.st(this.car);if(!i.item||i.active||i.held<this.cfg.itemDelay)return!1;let n=this.car,r=t.world.ball,a=this.attackSign,o=n.pos.distanceTo(r.pos);n.forward(Si),_e.copy(r.pos).sub(n.pos).normalize();let l=_e.dot(Si),c=r.vel.z*a<-500,h=!1;switch(i.item){case"grapple":h=o>900&&o<3800&&l>.6&&r.pos.y<1500;break;case"plunger":h=o>900&&o<3800&&(c||r.pos.z*a<-2500);break;case"tornado":h=o<700;break;case"curveball":h=o<4500&&r.vel.z*a>300&&r.pos.z*a>-500;break;case"spikes":case"power":h=!0;break;case"boot":h=!!e.nearestOpponent(n,2200);break;case"freezer":h=c&&r.pos.z*a<-1500&&o<6e3;break;default:break}return!h&&i.held>12&&(h=e.inRange(n,i.item)),h}update(t,e){let i=this.car,n=i.input;if(i.demolished)return;let r=this.wantItem(e);if(n.useItem=r&&!this.itemTap,this.itemTap=n.useItem,this.replanT-=t,this.replanT<=0&&(this.replanT=this.cfg.replan*(.7+Math.random()*.6),this.plan(e)),n.throttle=0,n.steer=0,n.pitch=0,n.yaw=0,n.roll=0,n.boost=!1,n.powerslide=!1,this.seq){this.seqT+=t;let a=null;for(let o of this.seq)this.seqT>=o.t&&(a=o);if(!a||this.seqT>this.seq[this.seq.length-1].t+.05||a.end&&this.seqT>=a.t)this.seq=null;else{n.jump=!!a.jump,n.pitch=a.pitch||0,n.yaw=a.yaw||0,n.steer=a.yaw||0,n.throttle=a.throttle??1,n.boost=!!a.boost&&i.boost>0,a.aerial&&this.aerialControl(t,e);return}}if(n.jump=!1,!i.onGround){if(i.turtled){this.turtleTap=(this.turtleTap||0)+1,n.jump=this.turtleTap%8<4;return}this.aerialing?this.aerialControl(t,e):this.recover();return}this.aerialing=!1,this.drive(t,e)}plan(t){let e=this.car,i=t.world.ball,n=this.attackSign,r=t.pred;e.forward(Si);let a=e.vel.length(),o=e.boost>8&&this.cfg.boost>.3,l=o?Math.min(this.cfg.maxSpeed,2200):1400,c=o?1900:1e3;if(t.kickoff){if(this.isClosest(t,i.pos)){this.mode="kickoff",this.target.copy(i.pos).add(Yi.set(0,0,-n*40)),this.ballTarget.copy(i.pos),this.desiredSpeed=2300;return}this.mode="support",this.setSupportTarget(t,!0);return}let h=this.cfg.jumpReach,u=null,d=null;for(let x=2;x<r.length;x+=2){let b=r[x];if(!d&&b.pos.z*n<-(ji+es*.5)&&Math.abs(b.pos.x)<Ss+100&&(d=b),u||b.pos.y>h+es)continue;this.shotDir(b.pos,d||t.threatOwn,_n),Yi.copy(b.pos).addScaledVector(_n,-(es+70)),_e.copy(Yi).sub(e.pos).setY(0);let y=_e.length();_e.normalize();let E=Math.acos(we.clamp(_e.dot(Si.clone().setY(0).normalize()),-1,1)),w=e.vel.dot(_e),R=vb(Math.max(0,y-60),w,l,c)+E*.32;if(b.pos.y>150&&(R+=.1),R<=b.t+.02){u=b;break}}u||(u=r[r.length-1]),this.interceptT=u.t,this.ballTarget.copy(u.pos);let f=!0;for(let x of t.teammates){if(x===e||x.demolished)continue;let b=x.pos.distanceTo(u.pos)/Math.max(800,x.vel.length()*.8+600),y=e.pos.distanceTo(u.pos)/Math.max(800,a*.8+600),E=(u.pos.z-x.pos.z)*n>0;if(b+(E?0:.6)<y-.15){f=!1;break}}let p=(e.pos.z-u.pos.z)*n,v=u.pos.z*n<0;if(!!d&&(p>-200||f)){if(p>300){this.mode="retreat",this.setRetreatTarget(u.pos),this.desiredSpeed=2300;return}this.mode="save",this.setHitTarget(u,d);return}if(!f){if(e.boost<30&&Math.random()<this.cfg.boost&&this.setBoostTarget(t)){this.mode="boost";return}this.mode="support",this.setSupportTarget(t,!1);return}this.careT-=this.cfg.replan,this.careT<=0&&(this.careT=2,this.cares=Math.random()<this.cfg.wrongSideCare);let g=this.mode==="retreat"&&p>-150&&t.time-this.retreatStart<3;if(p>250&&this.cares||g){this.mode!=="retreat"&&(this.retreatStart=t.time),this.mode="retreat",v||p>1500?this.setRetreatTarget(u.pos):this.target.set(u.pos.x*.5+(e.pos.x>u.pos.x?900:-900),0,u.pos.z-n*1300),this.clampTarget(),this.desiredSpeed=2300;return}if(e.boost<15&&!v&&u.t>2.2&&this.setBoostTarget(t)){this.mode="boost";return}this.mode="attack",this.setHitTarget(u,null)}aimPoint(t,e){let i=this.attackSign;return e?Gm.set(t.x>=0?4e3:-4e3,0,t.z+i*3e3):Gm.set(we.clamp(t.x*.25+this.aimOffset,-Ss+150,Ss-150),0,i*(ji+300))}shotDir(t,e,i){let n=this.aimPoint(t,e);if(i.copy(n).sub(t).setY(0).normalize(),Xs.copy(t).sub(this.car.pos).setY(0),Xs.lengthSq()<1)return i;Xs.normalize();let r=Math.acos(we.clamp(i.dot(Xs),-1,1)),a=we.clamp((r-.6)/1.6,0,.75);return a>0&&i.lerp(Xs,a).normalize(),i}setHitTarget(t,e){let i=this.car;this.shotDir(t.pos,e,_n);let n=Yi.copy(t.pos).sub(i.pos).setY(0).length(),r=we.clamp(n*.45,es+40,1200);for(;r>es+40&&(Yi.copy(t.pos).addScaledVector(_n,-r),!(Hd(Yi.x,Yi.z)<-320&&Math.abs(Yi.z)<ji-250));)r-=80;r=Math.max(r,es+40),this.target.copy(t.pos).addScaledVector(_n,-r),this.target.y=0,this.clampTarget();let a=i.pos.distanceTo(this.target)+r,o=Math.max(.05,t.t),l=t.pos.y>180;this.desiredSpeed=l?we.clamp(a/o,300,2300):2300,i.forward(Si),Si.setY(0).normalize();let c=Math.acos(we.clamp(Si.dot(_n),-1,1));n<1100&&c>.6&&!e&&(this.desiredSpeed=Math.min(this.desiredSpeed,700+(1100-Math.min(1100,c*500))))}setRetreatTarget(t){let e=this.attackSign,i=t.x>0?-Ss*.8:Ss*.8;this.target.set(i,0,-e*(ji-350))}setSupportTarget(t,e){let i=this.car,n=t.world.ball,r=this.attackSign,a=t.teammates.indexOf(i),o=a%2===0?-1:1;if(e)i.boost<60&&Math.abs(i.pos.x)>1e3?this.target.set(Math.sign(i.pos.x)*3072,0,-r*4096):this.target.set(0,0,-r*(ji-500));else{let c=n.pos.z-r*(2200+a*900);this.target.set(n.pos.x*.35+o*1100,0,Math.max(-ji+400,Math.min(ji-400,c*r))*r)}this.clampTarget();let l=i.pos.distanceTo(this.target);this.desiredSpeed=l>1500?2300:l>400?1400:300}setBoostTarget(t){let e=this.car,i=this.attackSign,n=null,r=1/0;for(let a of t.world.pads){if(!a.big||!a.active||a.z*i>1500)continue;let o=Math.hypot(a.x-e.pos.x,a.z-e.pos.z);o<r&&(r=o,n=a)}return!n||r>4500?!1:(this.target.set(n.x,0,n.z),this.desiredSpeed=2300,!0)}clampTarget(){this.target.x=we.clamp(this.target.x,-Ut.halfX+250,Ut.halfX-250),this.target.z=we.clamp(this.target.z,-ji+150,ji-150)}isClosest(t,e){let i=this.car.pos.distanceTo(e);for(let n of t.teammates){if(n===this.car)continue;let r=n.pos.distanceTo(e);if(r<i-5||Math.abs(r-i)<=5&&n.pos.x*this.attackSign<this.car.pos.x*this.attackSign)return!1}return!0}drive(t,e){let i=this.car,n=i.input,r=i.groundNormal;i.forward(Si),pr.crossVectors(Si,r).normalize();let a=i.vel.length(),o=i.vel.dot(Si),l=e.world.ball;if(l.attachedTo===i){Yi.set(0,0,this.attackSign*(ji-300)),_e.copy(Yi).sub(i.pos),_e.addScaledVector(r,-_e.dot(r));let P=Math.atan2(_e.dot(pr),_e.dot(Si));n.throttle=1,n.steer=we.clamp(P*3,-1,1),n.boost=Math.abs(P)<.4&&i.boost>0,_e.length()<2600&&Math.abs(P)<.3&&e.time-this.lastJumpAt>1.2&&(this.lastJumpAt=e.time,this.startSeq([{t:0,jump:!0},{t:.06,jump:!1},{t:.09,jump:!0,pitch:-1},{t:.19,jump:!1,end:!0}]));return}let c=this.target,h=i.pos.distanceTo(l.pos);if((this.mode==="attack"||this.mode==="save"||this.mode==="kickoff")&&h<650&&l.pos.y<260&&(this.shotDir(l.pos,this.mode==="save",_n),Yi.copy(l.pos).addScaledVector(_n,-(es*.6)),_e.copy(l.pos).sub(i.pos).setY(0).normalize(),_e.dot(_n)>.2&&(c=Yi)),Math.abs(i.pos.z)>ji-60&&(Math.abs(c.x)>Ss-100||Math.abs(c.z)<ji-200)){let P=Math.sign(i.pos.z);(Math.abs(i.pos.z)>ji+60||Math.abs(i.pos.x)>Ss-80)&&(c=Yi.set(we.clamp(c.x,-Ss+250,Ss-250),0,P*(ji-500)))}_e.copy(c).sub(i.pos),_e.addScaledVector(r,-_e.dot(r));let u=_e.length(),d=Math.atan2(_e.dot(pr),_e.dot(Si)),f=we.clamp(d*3.2,-1,1),p=1,v=Math.abs(d)>1.6&&a>500,m=this.desiredSpeed;(this.mode==="support"||this.mode==="boost")&&(m=Math.min(m,u>1200?2300:Math.max(300,u*1.2)));let g=1/gb(Math.max(o,0));if(Math.abs(d)>.3&&u<2*g*Math.sin(Math.min(Math.abs(d),Math.PI/2))*1.05&&(m=Math.min(m,Math.max(250,o*.5)),Math.abs(d)>1&&(v=a>350)),o>m+250&&(p=o>m+600?-1:0),this.reverseT>0){this.reverseT-=t,n.throttle=-1,n.steer=-f;return}a<120&&p>0?(this.stuckT+=t,this.stuckT>1.2&&(this.reverseT=.8,this.stuckT=0)):this.stuckT=0;let x=!1;if(i.boost>0&&Math.abs(d)<.3&&o<Math.min(this.cfg.maxSpeed,m)-80&&u>400){let P=this.mode==="kickoff"||this.mode==="save"||this.mode==="retreat"?0:this.cfg.boost<1?20:8;x=i.boost>P&&Math.random()<this.cfg.boost+.1}if(o>this.cfg.maxSpeed-50&&(x=!1),n.throttle=p,n.steer=f,n.powerslide=v,n.boost=x,this.mode==="kickoff"&&this.cfg.kickoffFlip&&h<520+a*.12&&a>1100&&Math.abs(d)<.25){this.startSeq([{t:0,jump:!0,boost:!0},{t:.07,jump:!1,boost:!0},{t:.1,jump:!0,pitch:-1,yaw:we.clamp(d*2,-.4,.4)},{t:.2,jump:!1,pitch:-1,end:!0}]);return}let b=e.time;if(b-this.lastJumpAt<1.2)return;let y=l.pos.y;_e.copy(l.pos).sub(i.pos);let E=Math.hypot(_e.x,_e.z),w=i.vel.clone().sub(l.vel),R=Math.max(1,w.dot(_e.clone().setY(0).normalize())),_=Math.max(0,E-110)/R,A=_e.clone().setY(0).normalize().dot(Si.clone().setY(0).normalize());if(this.cfg.dodge&&y<220&&E<360&&A>.85&&a>600&&_<.2&&(this.mode==="attack"||this.mode==="save")){let P=we.clamp(_e.dot(pr)/120,-.6,.6);this.lastJumpAt=b,this.startSeq([{t:0,jump:!0},{t:.06,jump:!1},{t:.09,jump:!0,pitch:-1,yaw:P},{t:.19,jump:!1,pitch:-.4,end:!0}]);return}if(y>190&&y<this.cfg.jumpReach+100&&A>.8&&E<1400){let P=y-110,I=P<230,U=I?Wm(P):mb(P),H=l.vel.y<0?(y-110-es)/Math.max(1,-l.vel.y):1/0,D=Math.min(_,H+.3);Number.isFinite(U)&&Math.abs(D-U)<.06&&(I||this.cfg.jumpReach>350)&&(this.lastJumpAt=b,I?this.startSeq([{t:0,jump:!0},{t:Math.min(.2,U),jump:!0},{t:U+.02,jump:!1,end:!0}]):this.cfg.aerial&&P>520?(this.aerialing=!0,this.startSeq([{t:0,jump:!0,aerial:!0},{t:.2,jump:!1,aerial:!0},{t:.24,jump:!0,aerial:!0,boost:!0},{t:.3,jump:!1,aerial:!0,boost:!0,end:!0}])):this.startSeq([{t:0,jump:!0},{t:.2,jump:!1},{t:.24,jump:!0},{t:.3,jump:!1,end:!0}]))}else if(this.cfg.aerial&&y>520&&y<1500&&A>.9&&E<1500&&i.boost>30&&a>400){let P=this.interceptT,I=(y-120)/600+.3;Math.abs(P-I)<.25&&this.ballTarget.y>450&&(this.lastJumpAt=b,this.aerialing=!0,this.startSeq([{t:0,jump:!0,aerial:!0,boost:!0},{t:.2,jump:!1,aerial:!0,boost:!0},{t:.24,jump:!0,aerial:!0,boost:!0},{t:.3,jump:!1,aerial:!0,boost:!0,end:!0}]))}}orient(t,e){let i=this.car,n=i.input;i.forward(Si),i.up(Lh),i.left(Xs),pr.copy(Xs).negate();let r=i.angVel,a=Math.atan2(t.dot(Lh),t.dot(Si)),o=Math.atan2(t.dot(pr),t.dot(Si)),l=r.dot(pr),c=-r.dot(Lh),h=r.dot(Si);n.pitch=we.clamp(a*3.5-l*.55,-1,1),n.yaw=we.clamp(o*3.5-c*.55,-1,1);let u=Math.atan2(Xs.dot(e),Lh.dot(e));n.roll=we.clamp(u*2.5-h*.4,-1,1),n.steer=n.yaw,n.powerslide=!1}aerialControl(t,e){let i=this.car,n=i.input,r=e.world.ball,a=e.pred,o=a[a.length-1];for(let h=1;h<a.length;h++){let u=a[h],d=u.pos.distanceTo(i.pos)-es-40,f=i.vel.length();if(d/Math.max(900,f+500*u.t)<=u.t){o=u;break}}let l=Math.max(.1,o.t);_n.copy(o.pos).sub(i.pos).addScaledVector(i.vel,-l).multiplyScalar(2/(l*l)).sub(pb);let c=_n.length();(c>1500||i.boost<=0||i.pos.distanceTo(r.pos)<es+60)&&c>1500&&!this.seq&&(this.aerialing=!1),_e.copy(_n).normalize(),this.orient(_e,Yi.set(0,1,0)),i.forward(Si),n.boost=i.boost>0&&Si.dot(_e)>.75&&c>250,n.throttle=1}recover(){let t=this.car,e=t.input;_e.set(t.vel.x,0,t.vel.z),_e.lengthSq()<100&&(t.forward(_e),_e.y=0),_e.normalize(),this.orient(_e,Yi.set(0,1,0)),e.throttle=1,e.boost=!1}};var sl=new S;function Mn(s,t,e,i,n,r){let a=2*Math.PI*n/4,o=Math.max(r-2*n,0),l=Math.PI/4;sl.copy(t),sl[i]=0,sl.normalize();let c=.5*a/(a+o),h=1-sl.angleTo(s)/l;return Math.sign(sl[e])===1?h*c:o/(a+o)+c+c*(1-h)}var Ri=class s extends He{constructor(t=1,e=1,i=1,n=2,r=.1){let a=n*2+1;if(r=Math.min(t/2,e/2,i/2,r),super(1,1,1,a,a,a),this.type="RoundedBoxGeometry",this.parameters={width:t,height:e,depth:i,segments:n,radius:r},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let l=new S,c=new S,h=new S(t,e,i).divideScalar(2).subScalar(r),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,p=u.length/6,v=new S,m=.5/a;for(let g=0,x=0;g<u.length;g+=3,x+=2)switch(l.fromArray(u,g),c.copy(l),c.x-=Math.sign(c.x)*m,c.y-=Math.sign(c.y)*m,c.z-=Math.sign(c.z)*m,c.normalize(),u[g+0]=h.x*Math.sign(l.x)+c.x*r,u[g+1]=h.y*Math.sign(l.y)+c.y*r,u[g+2]=h.z*Math.sign(l.z)+c.z*r,d[g+0]=c.x,d[g+1]=c.y,d[g+2]=c.z,Math.floor(g/p)){case 0:v.set(1,0,0),f[x+0]=Mn(v,c,"z","y",r,i),f[x+1]=1-Mn(v,c,"y","z",r,e);break;case 1:v.set(-1,0,0),f[x+0]=1-Mn(v,c,"z","y",r,i),f[x+1]=1-Mn(v,c,"y","z",r,e);break;case 2:v.set(0,1,0),f[x+0]=1-Mn(v,c,"x","z",r,t),f[x+1]=Mn(v,c,"z","x",r,i);break;case 3:v.set(0,-1,0),f[x+0]=1-Mn(v,c,"x","z",r,t),f[x+1]=1-Mn(v,c,"z","x",r,i);break;case 4:v.set(0,0,1),f[x+0]=1-Mn(v,c,"x","y",r,t),f[x+1]=1-Mn(v,c,"y","x",r,e);break;case 5:v.set(0,0,-1),f[x+0]=Mn(v,c,"x","y",r,t),f[x+1]=1-Mn(v,c,"y","x",r,e);break}}static fromJSON(t){return new s(t.width,t.height,t.depth,t.segments,t.radius)}};function Ys(s,t){let e=document.createElement("canvas");return e.width=s,e.height=t,e}function is(s,{srgb:t=!0,repeat:e=!1,aniso:i=8}={}){let n=new gi(s);return t&&(n.colorSpace=We),e&&(n.wrapS=n.wrapT=Ji),n.anisotropy=i,n}function va(s=1){let t=s>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var ln={minZ:-(Ut.halfZ+Ut.goalDepth),maxZ:Ut.halfZ+Ut.goalDepth,halfX:Ut.halfX};function qm(s){let t=s==="low"?8:5.3333,e=Math.round(2*Ut.halfX/t),i=Math.round((ln.maxZ-ln.minZ)/t),n=Ys(e,i),r=n.getContext("2d"),a=x=>(x+Ut.halfX)/t,o=x=>(ln.maxZ-x)/t,l=x=>x/t,c=512;for(let x=ln.minZ;x<ln.maxZ;x+=c){let b=Math.floor((x-ln.minZ)/c);r.fillStyle=b%2?"#3f7f2c":"#356f25",r.fillRect(0,o(x+c),e,l(c)+1)}let h=r.createLinearGradient(0,o(-Ut.halfZ),0,o(0));h.addColorStop(0,"rgba(40,110,255,0.10)"),h.addColorStop(1,"rgba(40,110,255,0)"),r.fillStyle=h,r.fillRect(0,o(0),e,o(ln.minZ)-o(0)),h=r.createLinearGradient(0,o(Ut.halfZ),0,o(0)),h.addColorStop(0,"rgba(255,120,30,0.10)"),h.addColorStop(1,"rgba(255,120,30,0)"),r.fillStyle=h,r.fillRect(0,0,e,o(0));let u=r.getImageData(0,0,e,i),d=u.data,f=va(7);for(let x=0;x<d.length;x+=4){let b=(f()-.5)*26+(f()<.04?-18:0);d[x]=Math.max(0,Math.min(255,d[x]+b*.6)),d[x+1]=Math.max(0,Math.min(255,d[x+1]+b)),d[x+2]=Math.max(0,Math.min(255,d[x+2]+b*.4))}r.putImageData(u,0,0);for(let x of[1,-1]){r.fillStyle="rgba(10,20,10,0.45)";let b=x*Ut.halfZ,y=x*(Ut.halfZ+Ut.goalDepth);r.fillRect(a(-Ut.goalHalfW),Math.min(o(b),o(y)),l(2*Ut.goalHalfW),Math.abs(o(y)-o(b)))}let p=(x,b)=>{r.lineWidth=l(x),r.strokeStyle=b};r.lineCap="round",r.lineJoin="round";let v="rgba(245,250,255,0.85)",m=fa(160,6);p(34,v),r.beginPath(),m.forEach((x,b)=>{let y=x.x+x.nx*(Ut.rampR+60),E=x.z+x.nz*(Ut.rampR+60);b===0?r.moveTo(a(y),o(E)):r.lineTo(a(y),o(E))}),r.closePath(),r.stroke(),r.beginPath(),r.moveTo(a(-Ut.halfX+340),o(0)),r.lineTo(a(Ut.halfX-340),o(0)),r.stroke(),r.beginPath(),r.arc(a(0),o(0),l(1e3),0,Math.PI*2),r.stroke(),r.fillStyle=v,r.beginPath(),r.arc(a(0),o(0),l(60),0,Math.PI*2),r.fill();for(let x of[-1,1]){let b=x<0?"rgba(70,150,255,0.95)":"rgba(255,140,50,0.95)",y=x*(Ut.halfZ-340);p(40,b),r.beginPath(),r.moveTo(a(-Ut.goalHalfW),o(x*Ut.halfZ)),r.lineTo(a(Ut.goalHalfW),o(x*Ut.halfZ)),r.stroke(),p(30,v),r.beginPath(),r.moveTo(a(-1800),o(y)),r.lineTo(a(-1800),o(x*(Ut.halfZ-1500))),r.lineTo(a(1800),o(x*(Ut.halfZ-1500))),r.lineTo(a(1800),o(y)),r.stroke(),p(26,b),r.beginPath(),r.moveTo(a(-1150),o(y)),r.lineTo(a(-1150),o(x*(Ut.halfZ-800))),r.lineTo(a(1150),o(x*(Ut.halfZ-800))),r.lineTo(a(1150),o(y)),r.stroke(),p(30,v),r.beginPath();let E=o(x*(Ut.halfZ-1500));x<0?r.arc(a(0),E,l(700),Math.PI,0,!1):r.arc(a(0),E,l(700),0,Math.PI,!1),r.stroke(),p(26,x<0?"rgba(70,150,255,0.55)":"rgba(255,140,50,0.55)");for(let w of[-2600,2600])for(let R=0;R<3;R++){let _=x*(2e3+R*260);r.beginPath(),r.moveTo(a(w-220),o(_+x*160)),r.lineTo(a(w),o(_)),r.lineTo(a(w+220),o(_+x*160)),r.stroke()}}return is(n,{aniso:16})}function Xm(){let t=Ys(256,256),e=t.getContext("2d"),i=e.createImageData(256,256),n=va(11),r=new Float32Array(256*256);for(let o=0;o<9e3;o++){let l=Math.floor(n()*256),c=Math.floor(n()*256),h=.35+n()*.65,u=1+Math.floor(n()*3);for(let d=0;d<u;d++){let f=(c+d)%256;r[f*256+l]=Math.max(r[f*256+l],h*(1-d*.2))}}for(let o=0;o<256*256;o++){let l=Math.round(r[o]*255);i.data[o*4]=l,i.data[o*4+1]=l,i.data[o*4+2]=l,i.data[o*4+3]=255}e.putImageData(i,0,0);let a=is(t,{srgb:!1,repeat:!0});return a.magFilter=pi,a}function tf(s=3,t=512){let e=t/6,i=t,n=Math.round(Math.sqrt(3)*e*4),r=Ys(i,n),a=r.getContext("2d");a.fillStyle="#000",a.fillRect(0,0,i,n),a.strokeStyle="#fff",a.lineWidth=s;let o=Math.sqrt(3)*e;for(let l=-1;l<=5;l++)for(let c=-1;c<=5;c++){let h=1.5*e*l,u=o*(c+(l%2?.5:0));a.beginPath();for(let d=0;d<=6;d++){let f=Math.PI/3*d,p=h+e*Math.cos(f),v=u+e*Math.sin(f);d===0?a.moveTo(p,v):a.lineTo(p,v)}a.stroke()}return is(r,{srgb:!1,repeat:!0})}function ef(){let e=Ys(2048,128),i=e.getContext("2d"),n=i.createLinearGradient(0,0,0,128);n.addColorStop(0,"#05070c"),n.addColorStop(1,"#0b1220"),i.fillStyle=n,i.fillRect(0,0,2048,128);let r=["ROCKET ARENA","SUPERSONIC","ROCKET ARENA","BOOST","ROCKET ARENA","AERIAL CUP"],a=2048/r.length;return r.forEach((o,l)=>{let c=l*a;i.fillStyle="rgba(120,180,255,0.18)",i.fillRect(c+4,8,a-8,112),i.fillStyle=l%2?"#ff8a2a":"#4aa8ff",i.beginPath(),i.arc(c+58,128/2,30,0,Math.PI*2),i.fill(),i.fillStyle="#fff",i.beginPath(),i.arc(c+58,128/2,18,0,Math.PI*2),i.fill(),i.fillStyle=l%2?"#ff8a2a":"#4aa8ff",i.beginPath(),i.arc(c+64,128/2-4,9,0,Math.PI*2),i.fill(),i.fillStyle="#f4f8ff",i.font="bold italic 54px Arial, Helvetica, sans-serif",i.textBaseline="middle",i.fillText(o,c+104,128/2+2,a-120)}),is(e,{repeat:!0})}function Ym(){let e=Ys(1024,512),i=e.getContext("2d");i.fillStyle="#14161c",i.fillRect(0,0,1024,512);let n=va(23),r=8,a=512/r,o=["#c8641c","#2a62c4","#9aa3ad","#1c1c1c","#8a2a2a","#b89a3a","#2a6a3a","#3a3f4a","#c8641c","#2a62c4","#30343c","#5a6070","#20232a"],l=["#c9a185","#b08060","#8a5a3c","#5a3a26","#d2b096"];for(let u=0;u<r;u++){let d=u*a;i.fillStyle=u%2?"#20232b":"#1a1d24",i.fillRect(0,d+a*.62,1024,a*.38),i.fillStyle="#2b3140",i.fillRect(0,d+a*.6,1024,3);for(let f=4;f<1020;f+=15+n()*4){if(n()<.12)continue;let p=o[Math.floor(n()*o.length)],v=l[Math.floor(n()*l.length)],m=d+a*(.32+n()*.08);i.fillStyle=p,i.fillRect(f-6,m,12,a*.36),i.fillStyle=v,i.beginPath(),i.arc(f,m-6,5.5,0,Math.PI*2),i.fill(),n()<.18&&(i.fillStyle=v,i.fillRect(f-9,m-18,3,16),i.fillRect(f+6,m-18,3,16)),n()<.06&&(i.fillStyle=n()<.5?"#ff7a1a":"#2f7bff",i.fillRect(f-10,m-26,20,10))}}let c=Ys(1024,512),h=c.getContext("2d");return h.filter="blur(1.2px) saturate(0.8)",h.drawImage(e,0,0),is(c,{repeat:!0})}function Zm(s=1024){let t=s,e=s/2,i=(1+Math.sqrt(5))/2,n=[],r=(E,w,R,_)=>{let A=Math.hypot(E,w,R);n.push([E/A,w/A,R/A,_])};for(let E of[-1,1])for(let w of[-1,1])r(0,E,w*i,1),r(E,w*i,0,1),r(E*i,0,w,1);for(let E of[-1,1])for(let w of[-1,1])for(let R of[-1,1])r(E,w,R,0);for(let E of[-1,1])for(let w of[-1,1])r(0,E/i,w*i,0),r(E/i,w*i,0,0),r(E*i,0,w/i,0);let a=()=>{let E=Ys(t,e);return[E,E.getContext("2d")]},[o,l]=a(),[c,h]=a(),[u,d]=a(),[f,p]=a(),v=l.createImageData(t,e),m=h.createImageData(t,e),g=d.createImageData(t,e),x=p.createImageData(t,e),b=va(5),y=new Float32Array(2048);for(let E=0;E<y.length;E++)y[E]=b();for(let E=0;E<e;E++){let w=(E+.5)/e,R=Math.sin(Math.PI*w),_=Math.cos(Math.PI*w);for(let A=0;A<t;A++){let P=(A+.5)/t,I=-Math.cos(2*Math.PI*P)*R,U=_,H=Math.sin(2*Math.PI*P)*R,D=-2,O=-2,Z=0;for(let Et=0;Et<32;Et++){let Yt=n[Et],me=I*Yt[0]+U*Yt[1]+H*Yt[2];me>D?(O=D,D=me,Z=Et):me>O&&(O=me)}let Y=n[Z][3],rt=D-O,$=rt<.006?1:rt<.014?1-(rt-.006)/.008:0,Q=Math.acos(Math.min(1,D)),it=y[(E>>4)%32*64+(A>>4)%64]*.08,Lt,Pt,oe;Y?(Lt=52,Pt=58,oe=66):(Lt=128,Pt=134,oe=140);let re=rt<.03?.85:1,ae=(1-$*.85)*re*(1+it),q=(E*t+A)*4;v.data[q]=Lt*ae,v.data[q+1]=Pt*ae,v.data[q+2]=oe*ae,v.data[q+3]=255;let j=0;Y&&(Q<.07?j=1:Q>.12&&Q<.15&&(j=.9)),m.data[q]=60*j,m.data[q+1]=170*j,m.data[q+2]=255*j,m.data[q+3]=255;let vt=$>0?200:Y?95:120;g.data[q]=vt,g.data[q+1]=vt,g.data[q+2]=vt,g.data[q+3]=255;let Wt=255*(1-$)*(rt<.03?.6+rt*13:1);x.data[q]=Wt,x.data[q+1]=Wt,x.data[q+2]=Wt,x.data[q+3]=255}}return l.putImageData(v,0,0),h.putImageData(m,0,0),d.putImageData(g,0,0),p.putImageData(x,0,0),{map:is(o),emissiveMap:is(c),roughnessMap:is(u,{srgb:!1}),bumpMap:is(f,{srgb:!1})}}function $m(){let s=Ys(256,64),t=s.getContext("2d");t.fillStyle="#1b1b1d",t.fillRect(0,0,256,64),t.strokeStyle="#0a0a0b",t.lineWidth=6;for(let e=-64;e<320;e+=18)t.beginPath(),t.moveTo(e,0),t.lineTo(e+14,30),t.lineTo(e,64),t.stroke();return t.fillStyle="#0c0c0d",t.fillRect(0,30,256,4),is(s,{repeat:!0})}var Nh=null;function Jm(){if(Nh)return Nh;let s=$m();return s.repeat.set(3,1),Nh={tireMat:new Qt({color:2763308,map:s,roughness:.85,metalness:0}),tireSideMat:new Qt({color:1447447,roughness:.75}),rimMat:new Qt({color:10133672,roughness:.25,metalness:1}),darkMat:new Qt({color:1316120,roughness:.45,metalness:.5}),trimMat:new Qt({color:2237738,roughness:.6,metalness:.3}),glassMat:new rr({color:724758,roughness:.05,metalness:.9,clearcoat:1,clearcoatRoughness:.03}),chromeMat:new Qt({color:14212580,roughness:.12,metalness:1}),tailMat:new Qt({color:4194304,emissive:16715808,emissiveIntensity:3.5}),headMat:new Qt({color:3355443,emissive:16773848,emissiveIntensity:2.2}),engineMat:new Qt({color:11735580,roughness:.35,metalness:.6}),spikeMat:new Qt({color:2830134,roughness:.3,metalness:.9,emissive:5246984,emissiveIntensity:.6})},Nh}function Km(s,t,e){let i=new xs(s.map(([r,a])=>new st(r,a))),n=new So(i,{depth:t*2-e*2,bevelEnabled:!0,bevelThickness:e,bevelSize:e*.8,bevelSegments:4,curveSegments:8});return n.translate(0,0,-(t-e)),n.rotateY(-Math.PI/2),n}function jm(s,t,e,i){let n=s.attributes.position;for(let r=0;r<n.count;r++){let a=Math.min(1,Math.max(0,(n.getY(r)-t)/(e-t)));n.setX(r,n.getX(r)*(1-i*a*a))}s.computeVertexNormals()}function yb(s,t){let e=document.createElement("canvas");e.width=256,e.height=160;let i=e.getContext("2d");i.font="italic 900 132px Arial Black, Arial, sans-serif",i.textAlign="center",i.textBaseline="middle",i.lineJoin="round",i.lineWidth=18,i.strokeStyle="#101216",i.strokeText(String(s),128,84),i.fillStyle="#f4f6fa",i.fillText(String(s),128,84),i.lineWidth=4,i.strokeStyle=t,i.strokeText(String(s),128,84);let n=new gi(e);return n.colorSpace=We,n}var Uh=class{constructor(t,e=0){let i=Jm(),n=Ie[t];this.team=t,this.root=new Me,this.body=new Me,this.body.scale.setScalar(.01),this.root.add(this.body);let r=new rr({color:n.main,metalness:.55,roughness:.32,clearcoat:1,clearcoatRoughness:.06}),a=new rr({color:n.dark,metalness:.6,roughness:.35,clearcoat:1,clearcoatRoughness:.1});this.paint=r;let o=(b,y,E=0,w=0,R=0,_=this.body)=>{let A=new at(b,y);return A.position.set(E,w,R),A.castShadow=!0,A.receiveShadow=!0,_.add(A),A},c=Km([[-46,3],[-48,18],[-43,26],[-20,29],[10,27],[38,22],[60,17],[71,11],[72,4],[64,-1],[-40,-1]],31,6);jm(c,8,30,.2),o(c,r);let u=Km([[-30,26],[-24,41],[-6,45],[8,42],[22,27]],24,4);jm(u,27,45,.22),o(u,i.glassMat),o(new Ri(40,3,22,2,1.5),r,0,45.2,-9);for(let b of[-1,1]){let y=o(new He(2.5,18,3),r,b*22.5,36,15);y.rotation.x=-.75}o(new He(10,1.2,40),i.darkMat,0,26.4,40).rotation.x=.17,o(new Ri(18,6,14,2,2),i.darkMat,0,27.5,22);for(let b of Ft.wheels){let y=Math.sign(b.x),E=-Ft.restHeight+b.r,w=new Ke(b.r+5,b.r+5,17,20,1,!1,-Math.PI/2,Math.PI);w.rotateZ(Math.PI/2);let R=o(w,a,y*(Math.abs(b.x)+7),E+1,b.z);R.rotation.x=0;let _=new pn(b.r+5,1.6,6,20,Math.PI);_.rotateY(Math.PI/2),o(_,i.trimMat,y*(Math.abs(b.x)+15.5),E+1,b.z)}o(new Ri(66,2.5,14,2,1),i.darkMat,0,-2.5,64),o(new Ri(56,4,9,2,1.5),i.darkMat,0,2,-47);for(let b of[-1,1])o(new Ri(5,7,52,2,2),i.trimMat,b*31,2,9);o(new Ri(50,9,6,2,2.5),i.darkMat,0,5,70),o(new Ri(62,4,10,2,1.5),i.trimMat,0,-1,66);for(let b of[-1,1])o(new Ri(10,4,3,2,1.2),i.headMat,b*21,13,70.5);o(new Ri(46,16,10,2,3),i.darkMat,0,14,-46),o(new Ri(30,9,16,2,2.5),i.engineMat,0,32,-33),o(new Ri(22,3,13,2,1),i.chromeMat,0,37.5,-33);for(let b of[-1,1]){let y=o(new Ke(3.4,4,8,14),i.chromeMat,b*7,42,-31);y.castShadow=!1,o(new Zn(2.8,14),i.darkMat,b*7,46.05,-31).rotation.x=-Math.PI/2}o(new Ri(4,12,18,2,1.5),i.darkMat,16,31,-33);let d=new Ke(4.2,4.8,12,16);d.rotateX(Math.PI/2);let f=new Zn(3,16);for(let b of[-1,1]){o(d,i.chromeMat,b*13,9,-50);let y=o(f,i.darkMat,b*13,9,-56.1);y.rotation.y=Math.PI,y.castShadow=!1}for(let b of[-1,1]){let y=o(new Ri(17,3.2,2,2,1),i.tailMat,b*26,21.5,-48.3);y.castShadow=!1}for(let b of[-1,1]){let y=o(new He(3,26,7),i.darkMat,b*17,40,-40);y.rotation.x=-.35}let p=o(new Ri(80,3.5,20,2,1.5),r,0,53,-45);p.rotation.x=.12;for(let b of[-1,1])o(new Ri(2.5,15,24,2,1),i.darkMat,b*40,50,-45);o(new Ke(.6,.6,22,6),i.darkMat,-16,56,-24),o(new ai(2.4,10,8),r,-16,67,-24),this.wheels=[];let v={};for(let b of Ft.wheels){let y=Math.sign(b.x),E=new Me;E.position.set(y*(Math.abs(b.x)+7),-Ft.restHeight+b.r,b.z);let w=new Me;E.add(w);let R=b.r;if(!v[R]){let A=new Ke(b.r,b.r,12,28,1,!0);A.rotateZ(Math.PI/2);let P=new ys(b.r*.62,b.r,28),I=new Ke(b.r*.64,b.r*.64,11,6);I.rotateZ(Math.PI/2);let U=new Ke(b.r*.22,b.r*.22,12.5,12);U.rotateZ(Math.PI/2),v[R]={tg:A,side:P,rim:I,hub:U}}let _=v[R];o(_.tg,i.tireMat,0,0,0,w);for(let A of[-1,1]){let P=o(_.side,i.tireSideMat,A*6,0,0,w);P.rotation.y=A*Math.PI/2}o(_.rim,i.rimMat,0,0,0,w),o(_.hub,i.chromeMat,0,0,0,w),this.body.add(E),this.wheels.push({pivot:E,spin:w,front:b.front,r:b.r,baseY:E.position.y})}let m=new St(...n.flame),g=new vs(7,46,16,1,!0);g.translate(0,-23,0),g.rotateX(-Math.PI/2),this.flame=new at(g,new ve({color:m.clone().multiplyScalar(1.4),transparent:!0,opacity:.75,blending:Ee,depthWrite:!1,fog:!1})),this.flame.position.set(0,12,-50);let x=new vs(3.6,26,12,1,!0);if(x.translate(0,-13,0),x.rotateX(-Math.PI/2),this.flameCore=new at(x,new ve({color:new St(2.2,2.2,2.2),transparent:!0,opacity:.9,blending:Ee,depthWrite:!1,fog:!1})),this.flame.add(this.flameCore),this.body.add(this.flame),this.flame.visible=!1,this.exhaustGlow=new at(new Zn(6,16),new ve({color:m.clone().multiplyScalar(1.5),transparent:!0,opacity:.7,blending:Ee,depthWrite:!1})),this.exhaustGlow.position.set(0,12,-51.5),this.exhaustGlow.rotation.y=Math.PI,this.body.add(this.exhaustGlow),this.flicker=0,e){let b=yb(e,n.css),y=new Qt({map:b,transparent:!0,roughness:.35,metalness:.2,polygonOffset:!0,polygonOffsetFactor:-2});for(let E of[-1,1]){let w=new at(new ti(26,15),y);w.position.set(E*31.2,15,8),w.rotation.y=E*Math.PI/2,this.body.add(w)}}this.spikes=null,this.powerOn=!1}setSpikes(t){if(t&&!this.spikes){let e=Jm();this.spikes=new Me;let i=new vs(3.2,13,6),n=[[0,47,-9],[12,45,-2],[-12,45,-2],[12,45,-16],[-12,45,-16],[0,29,30],[14,25,44],[-14,25,44],[0,20,66],[33,22,30],[-33,22,30],[33,22,-14],[-33,22,-14],[0,26,-47]];for(let[r,a,o]of n){let l=new at(i,e.spikeMat);l.position.set(r,a,o);let c=new S(r,a-18,o-10).normalize();l.quaternion.setFromUnitVectors(new S(0,1,0),c),this.spikes.add(l)}this.body.add(this.spikes)}this.spikes&&(this.spikes.visible=t)}setPower(t,e){t?(this.paint.emissive.setRGB(1,.08,.02),this.paint.emissiveIntensity=.5+Math.sin(e*14)*.25):this.powerOn&&(this.paint.emissive.setRGB(0,0,0),this.paint.emissiveIntensity=1),this.powerOn=t}update(t,e,i,n){if(this.root.visible=!t.demolished,t.demolished)return;this.root.position.set(e.x*.01,e.y*.01,e.z*.01),this.root.quaternion.copy(i);for(let a of this.wheels)a.spin.rotation.x=t.wheelSpin*(12.5/a.r),a.front&&(a.pivot.rotation.y=-t.steerVisual*.42);for(let a=0;a<4;a++){let o=this.wheels[a],l=t.wheelDist[a],c=l>=0?o.baseY+(Ft.restHeight-l)*.6:o.baseY-4;o.pivot.position.y+=(Math.max(o.baseY-6,Math.min(o.baseY+6,c))-o.pivot.position.y)*Math.min(1,n*20)}this.flicker+=n*40;let r=t.boosting;if(this.flame.visible=r,r){let a=.85+Math.sin(this.flicker)*.12+Math.random()*.15;this.flame.scale.set(a,a,a*(t.supersonic?1.35:1))}this.exhaustGlow.material.opacity=r?1:.45}};var Fh=class{constructor(t,e){this.max=t,this.count=0,this.p=new Float32Array(t*3),this.v=new Float32Array(t*3),this.life=new Float32Array(t),this.maxLife=new Float32Array(t),this.size=new Float32Array(t*2),this.c0=new Float32Array(t*4),this.c1=new Float32Array(t*4),this.phys=new Float32Array(t*4);let i=new Do,n=new ti(1,1);i.index=n.index,i.setAttribute("position",n.attributes.position),i.setAttribute("uv",n.attributes.uv),this.aPos=new Yn(new Float32Array(t*3),3).setUsage(Ki),this.aCol=new Yn(new Float32Array(t*4),4).setUsage(Ki),this.aSR=new Yn(new Float32Array(t*2),2).setUsage(Ki),i.setAttribute("iPos",this.aPos),i.setAttribute("iCol",this.aCol),i.setAttribute("iSR",this.aSR),i.instanceCount=0,this.geo=i;let r=new ue({transparent:!0,depthWrite:!1,blending:e?Ee:gn,uniforms:{},vertexShader:`
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
        }`});this.mesh=new at(i,r),this.mesh.frustumCulled=!1,this.mesh.renderOrder=e?5:4}emit(t,e,i,n,r,a,o,l,c,h,u,d=0,f=0,p=0){let v;this.count<this.max?v=this.count++:v=Math.floor(Math.random()*this.max),this.p[v*3]=t,this.p[v*3+1]=e,this.p[v*3+2]=i,this.v[v*3]=n,this.v[v*3+1]=r,this.v[v*3+2]=a,this.life[v]=o,this.maxLife[v]=o,this.size[v*2]=l,this.size[v*2+1]=c,this.c0.set(h,v*4),this.c1.set(u,v*4),this.phys[v*4]=d,this.phys[v*4+1]=f,this.phys[v*4+2]=Math.random()*6.28,this.phys[v*4+3]=p}update(t){let{p:e,v:i,life:n,maxLife:r,size:a,c0:o,c1:l,phys:c}=this,h=this.aPos.array,u=this.aCol.array,d=this.aSR.array,f=this.count;for(let p=0;p<f;p++){if(n[p]-=t,n[p]<=0){f--,p!==f&&(e.copyWithin(p*3,f*3,f*3+3),i.copyWithin(p*3,f*3,f*3+3),n[p]=n[f],r[p]=r[f],a.copyWithin(p*2,f*2,f*2+2),o.copyWithin(p*4,f*4,f*4+4),l.copyWithin(p*4,f*4,f*4+4),c.copyWithin(p*4,f*4,f*4+4),p--);continue}let v=Math.max(0,1-c[p*4]*t);i[p*3]*=v,i[p*3+1]=i[p*3+1]*v-c[p*4+1]*t,i[p*3+2]*=v,e[p*3]+=i[p*3]*t,e[p*3+1]+=i[p*3+1]*t,e[p*3+2]+=i[p*3+2]*t,c[p*4+2]+=c[p*4+3]*t}this.count=f;for(let p=0;p<f;p++){let v=1-n[p]/r[p];h[p*3]=e[p*3],h[p*3+1]=e[p*3+1],h[p*3+2]=e[p*3+2];for(let m=0;m<4;m++)u[p*4+m]=o[p*4+m]+(l[p*4+m]-o[p*4+m])*v;d[p*2]=a[p*2]+(a[p*2+1]-a[p*2])*v,d[p*2+1]=c[p*4+2]}this.geo.instanceCount=f,f>0&&(this.aPos.clearUpdateRanges(),this.aPos.addUpdateRange(0,f*3),this.aPos.needsUpdate=!0,this.aCol.clearUpdateRanges(),this.aCol.addUpdateRange(0,f*4),this.aCol.needsUpdate=!0,this.aSR.clearUpdateRanges(),this.aSR.addUpdateRange(0,f*2),this.aSR.needsUpdate=!0)}clear(){this.count=0,this.geo.instanceCount=0}},Ne=new S,si=new S,nf=new S,xa=new S,Ve=new S,lt=(s,t)=>s+Math.random()*(t-s),Bh=class{constructor(t,e){this.scene=t,this.mult=e==="low"?.45:e==="medium"?.75:1,this.glow=new Fh(e==="low"?1500:4e3,!0),this.smoke=new Fh(e==="low"?600:1800,!1),t.add(this.glow.mesh,this.smoke.mesh),this.flashes=[],this.sphereGeo=new ai(1,32,16),this.ringGeo=new pn(1,.06,8,64)}clear(){this.glow.clear(),this.smoke.clear();for(let t of this.flashes)this.scene.remove(t.mesh);this.flashes.length=0}carTrail(t,e,i,n){if(t.demolished)return;let r=Ie[t.team];if(si.set(0,0,1).applyQuaternion(i),nf.set(0,1,0).applyQuaternion(i),xa.set(1,0,0).applyQuaternion(i),t.boosting){Ve.copy(e).addScaledVector(si,-54).addScaledVector(nf,12).multiplyScalar(.01);let a=Ne.copy(t.vel).multiplyScalar(.01),o=Math.max(1,Math.round(n*150*this.mult)),l=r.flame,c=r.flameEnd;for(let h=0;h<o;h++){let u=lt(7,12),d=Math.random()*n;this.glow.emit(Ve.x-si.x*u*d+lt(-.03,.03),Ve.y-si.y*u*d+lt(-.03,.03),Ve.z-si.z*u*d+lt(-.03,.03),a.x*.2-si.x*u+lt(-.5,.5),a.y*.2-si.y*u+lt(-.5,.5),a.z*.2-si.z*u+lt(-.5,.5),lt(.1,.2),lt(.12,.2),lt(.3,.55),[l[0]*1.1,l[1]*1.1,l[2]*1.1,.55],[c[0],c[1],c[2],0],2,0)}if(Math.random()<n*40*this.mult){let h=[c[0]*.9+.1,c[1]*.9+.1,c[2]*.9+.1];this.smoke.emit(Ve.x-si.x*.4,Ve.y-si.y*.4,Ve.z-si.z*.4,a.x*.25-si.x*2+lt(-.4,.4),a.y*.25+lt(0,.6),a.z*.25-si.z*2+lt(-.4,.4),lt(.7,1.1),.35,lt(1.4,2.2),[h[0],h[1],h[2],.22],[.25,.25,.28,0],1.2,-.3,lt(-1,1))}}if(t.boosting&&Math.random()<n*60*this.mult){let a=r.flame,o=Ne.copy(t.vel).multiplyScalar(.01*.3);for(let l=0;l<2;l++)this.glow.emit(Ve.x,Ve.y,Ve.z,o.x-si.x*lt(4,9)+lt(-2.5,2.5),o.y+lt(-1,3),o.z-si.z*lt(4,9)+lt(-2.5,2.5),lt(.25,.55),lt(.05,.09),.02,[a[0]*3,a[1]*3,a[2]*3,1],[a[0],a[1]*.6,a[2]*.4,0],1.5,7)}if(t.supersonic)for(let a of[-1,1])Math.random()>.8*this.mult||(Ve.copy(e).addScaledVector(xa,a*30).addScaledVector(si,-36).addScaledVector(nf,5).multiplyScalar(.01),this.glow.emit(Ve.x,Ve.y,Ve.z,0,0,0,.28,.12,.04,[1.6,1.7,1.8,.8],[.8,.9,1,0],0,0))}dirt(t,e,i,n,r){if(n<=0)return;si.set(0,0,1).applyQuaternion(i),xa.set(1,0,0).applyQuaternion(i);let a=Math.round(r*70*n*this.mult+Math.random());for(let o=0;o<a;o++){let l=o%2?1:-1;Ve.copy(e).addScaledVector(xa,l*34).addScaledVector(si,-36).multiplyScalar(.01);let c=lt(2,6),u=Math.random()<.45?[.12,.22,.06,1]:[.16,.11,.06,1];this.smoke.emit(Ve.x,.12,Ve.z,t.vel.x*.01*.2-si.x*c+xa.x*l*lt(0,2),lt(2.5,5.5),t.vel.z*.01*.2-si.z*c+xa.z*l*lt(0,2),lt(.5,.9),lt(.05,.11),lt(.04,.08),u,[u[0],u[1],u[2],.7],.3,13,lt(-10,10))}Math.random()<r*10*n*this.mult&&(Ve.copy(e).addScaledVector(si,-40).multiplyScalar(.01),this.smoke.emit(Ve.x,.15,Ve.z,-si.x*1.5,lt(.3,.9),-si.z*1.5,lt(.7,1.2),.3,lt(1,1.6),[.36,.33,.25,.3],[.3,.28,.24,0],1,-.2,lt(-1,1)))}pyro(t,e,i){let n=Ie[e];for(let r of t){let a=Math.round(i*110*this.mult);for(let o=0;o<a;o++){let l=Math.random()<.5;this.glow.emit(r.x*.01+lt(-.3,.3),r.y*.01,r.z*.01+lt(-.3,.3),lt(-.8,.8),lt(14,22),lt(-.8,.8),lt(.35,.7),lt(.5,.9),lt(1.1,1.9),l?[2.1,1,.25,.85]:[n.flame[0]*1.6,n.flame[1]*1.1,n.flame[2]*.9,.8],[.9,.18,.03,0],1.2,2)}}}ballTrail(t,e){let i=t.vel.length();i<2600||Math.random()>(i-2600)/2e3*this.mult||(Ve.copy(e).multiplyScalar(.01),this.glow.emit(Ve.x+lt(-.3,.3),Ve.y+lt(-.3,.3),Ve.z+lt(-.3,.3),0,0,0,.35,1,.2,[.6,.85,1.4,.35],[.2,.4,1,0],0,0))}hit(t,e){let i=Ve.copy(t).multiplyScalar(.01),n=Math.round(Math.min(40,e/60)*this.mult);for(let r=0;r<n;r++){let a=lt(3,9)*Math.min(2,e/1500);Ne.set(lt(-1,1),lt(-.2,1),lt(-1,1)).normalize().multiplyScalar(a),this.glow.emit(i.x,i.y,i.z,Ne.x,Ne.y,Ne.z,lt(.15,.35),lt(.06,.12),.02,[3,2.6,1.8,1],[2,.8,.2,0],2,6)}e>1800&&this.flash(i,12575743,1.6,.18,2.5)}boostPickup(t){let e=Math.round((t.big?40:12)*this.mult);for(let i=0;i<e;i++)this.glow.emit(t.x*.01+lt(-.6,.6),lt(.1,.4),t.z*.01+lt(-.6,.6),lt(-1,1),lt(2,6),lt(-1,1),lt(.3,.6),lt(.1,.25),.02,[3,1.8,.4,1],[2,.6,.05,0],1,2)}flash(t,e,i,n,r=3){let a=new ve({color:new St(e).multiplyScalar(r),transparent:!0,blending:Ee,depthWrite:!1,fog:!1}),o=new at(this.sphereGeo,a);o.position.copy(t),o.scale.setScalar(.01),this.scene.add(o),this.flashes.push({mesh:o,t:0,dur:n,size:i,kind:"sphere"})}ring(t,e,i,n){let r=new ve({color:new St(e).multiplyScalar(4),transparent:!0,blending:Ee,depthWrite:!1,fog:!1}),a=new at(this.ringGeo,r);a.position.copy(t),a.rotation.x=Math.PI/2,this.scene.add(a),this.flashes.push({mesh:a,t:0,dur:n,size:i,kind:"ring"})}explosion(t,e,i){let n=Ie[e],r=Ve.copy(t).multiplyScalar(.01).clone(),a=n.flame,o=n.flameEnd,l=Math.round((i?420:140)*this.mult),c=i?28:12;for(let u=0;u<l;u++)Ne.set(lt(-1,1),lt(-.3,1),lt(-1,1)).normalize().multiplyScalar(lt(.2,1)*c),this.glow.emit(r.x,r.y,r.z,Ne.x,Ne.y,Ne.z,lt(.5,i?1.6:.9),lt(.3,.8),lt(.1,.4),[a[0]*3,a[1]*3,a[2]*3,1],[o[0]*2,o[1]*2,o[2]*2,0],2.2,i?3:4);let h=Math.round((i?90:40)*this.mult);for(let u=0;u<h;u++)Ne.set(lt(-1,1),lt(0,1),lt(-1,1)).normalize().multiplyScalar(lt(1,i?10:5)),this.smoke.emit(r.x,r.y,r.z,Ne.x,Ne.y,Ne.z,lt(1.2,2.4),lt(.8,1.4),lt(2.5,i?6:3.5),[.3,.3,.33,.55],[.12,.12,.14,0],1.6,-.6,lt(-1,1));this.flash(r,n.main,i?9:3,i?.55:.3,4),this.ring(r,n.light,i?26:8,i?.9:.5)}demolition(t,e){let i=Ie[e],n=Ve.copy(t).multiplyScalar(.01).clone();n.y+=.3;let r=Math.round(170*this.mult);for(let c=0;c<r;c++){Ne.set(lt(-1,1),lt(-.2,1),lt(-1,1)).normalize().multiplyScalar(lt(2,11));let h=Math.random()<.35;this.glow.emit(n.x,n.y,n.z,Ne.x,Ne.y,Ne.z,lt(.3,.8),lt(.3,.7),lt(.1,.35),h?[1.8,1.3,.7,.7]:[1.6,.6,.12,.7],[.8,.15,.02,0],2.5,-1.5)}let a=Math.round(60*this.mult);for(let c=0;c<a;c++)Ne.set(lt(-1,1),lt(0,1.2),lt(-1,1)).normalize().multiplyScalar(lt(6,16)),this.glow.emit(n.x,n.y,n.z,Ne.x,Ne.y,Ne.z,lt(.4,.8),lt(.08,.16),.03,[i.flame[0]*3,i.flame[1]*3,i.flame[2]*3,1],[i.flameEnd[0],i.flameEnd[1],i.flameEnd[2],0],1,9);let o=Math.round(40*this.mult);for(let c=0;c<o;c++)Ne.set(lt(-1,1),lt(.4,1.4),lt(-1,1)).normalize().multiplyScalar(lt(5,13)),this.smoke.emit(n.x,n.y,n.z,Ne.x,Ne.y,Ne.z,lt(.8,1.5),lt(.12,.25),lt(.08,.15),[.05,.05,.06,1],[.05,.05,.06,.8],.4,14,lt(-12,12));let l=Math.round(70*this.mult);for(let c=0;c<l;c++)Ne.set(lt(-1,1),lt(.2,1),lt(-1,1)).normalize().multiplyScalar(lt(1,5)),this.smoke.emit(n.x,n.y,n.z,Ne.x,Ne.y,Ne.z,lt(1.6,3),lt(.8,1.4),lt(3,5.5),[.12,.1,.1,.75],[.05,.05,.06,0],1.3,-.8,lt(-1,1));this.flash(n,16747056,3,.25,2),this.ring(n,16756832,10,.55)}update(t){this.glow.update(t),this.smoke.update(t);for(let e=this.flashes.length-1;e>=0;e--){let i=this.flashes[e];i.t+=t;let n=i.t/i.dur;if(n>=1){this.scene.remove(i.mesh),i.mesh.material.dispose(),this.flashes.splice(e,1);continue}let r=1-Math.pow(1-n,3);i.mesh.scale.setScalar(Math.max(.01,i.size*r)),i.mesh.material.opacity=1-n}}};var _b=new S(0,1,0),Di=new S,cn=new S,sf=new S,Mb=new S,bn=new S,Qm=new le,ya=new S,t0=new le;function rl(s,t,e,i){return we.clamp(t.dot(e),-1,1)>.99999?s.copy(e):(Qm.setFromUnitVectors(t,e),t0.identity().slerp(Qm,i),s.copy(t).applyQuaternion(t0))}var _a=class{constructor(t){this.camera=t,this.dir=new S(0,0,1),this.camUp=new S(0,1,0),this.look=new S(0,0,1),this.pos=new S,this.ballCam=!0,this.shake=0,this.first=!0,this.distance=280,this.height=105,this.lookYaw=0}snap(){this.first=!0}addShake(t){this.shake=Math.min(1.5,this.shake+t)}update(t,e,i,n,r,a=0,o=0){let l=e.onGround&&e.groundNormal.y>-.2,c=l?e.groundNormal:_b;this.first?this.camUp.copy(c):rl(this.camUp,this.camUp,c,1-Math.exp(-t*(l?9:4)));let h=this.camUp;this.ballCam&&r?Di.copy(r).sub(i):(Di.set(0,0,1).applyQuaternion(n),!e.onGround&&e.vel.lengthSq()>500*500&&Di.lerp(cn.copy(e.vel).normalize(),.5)),Di.addScaledVector(c,-Di.dot(c)),Di.lengthSq()<1&&(Di.set(0,0,1).applyQuaternion(n),Di.addScaledVector(c,-Di.dot(c)),Di.lengthSq()<1e-4&&Di.copy(this.dir)),Di.normalize();let u=this.dir.dot(Di);this.first?this.dir.copy(Di):u<-.95?(cn.crossVectors(h,this.dir).normalize(),this.dir.addScaledVector(cn,.25).normalize()):rl(this.dir,this.dir,Di,this.ballCam?1-Math.exp(-t*7.5):1-Math.exp(-t*6)),cn.copy(this.dir).addScaledVector(h,-this.dir.dot(h)),cn.lengthSq()<.001&&cn.copy(Di).addScaledVector(h,-Di.dot(h)),cn.lengthSq()>1e-6&&this.dir.copy(cn).normalize(),this.lookYaw+=(a*Math.PI*.95-this.lookYaw)*Math.min(1,t*10);let d=Mb.copy(this.dir);Math.abs(this.lookYaw)>.001&&d.applyAxisAngle(h,-this.lookYaw);let f=e.vel.length(),p=this.distance+Math.min(60,f*.02),v=cn.copy(i).addScaledVector(d,-p).addScaledVector(h,this.height+o*-60);this.first?this.pos.copy(v):this.pos.lerp(v,1-Math.exp(-t*14));for(let g=0;g<2;g++){let x=an(this.pos.x,this.pos.y,this.pos.z);x<40&&(bs(this.pos.x,this.pos.y,this.pos.z,sf),this.pos.addScaledVector(sf,40-x))}if(ya.copy(i).addScaledVector(h,70).addScaledVector(d,260),bn.copy(ya).sub(this.pos).normalize(),this.ballCam&&r&&Math.abs(this.lookYaw)<.3){let g=cn.copy(r).sub(this.pos).normalize();bn.copy(g);let x=sf.copy(i).addScaledVector(h,10).sub(this.pos).normalize(),b=we.degToRad(this.camera.fov*.5)*.82,y=Math.acos(we.clamp(x.dot(bn),-1,1));y>b&&rl(bn,x,bn,b/y);let E=bn.dot(h);E<-.35&&bn.addScaledVector(h,-.35-E).normalize()}this.first?this.look.copy(bn):rl(this.look,this.look,bn,1-Math.exp(-t*12)),this.first=!1,this.shake=Math.max(0,this.shake-t*2.2);let m=this.shake*this.shake*14;this.camera.up.copy(h),this.camera.position.set((this.pos.x+(Math.random()-.5)*m)*.01,(this.pos.y+(Math.random()-.5)*m)*.01,(this.pos.z+(Math.random()-.5)*m)*.01),ya.copy(this.pos).addScaledVector(this.look,1e3).multiplyScalar(.01),this.camera.lookAt(ya)}updateReplay(t,e,i,n){let r=Math.sign(e.x||1);cn.set(r*2600+Math.sin(n*.3)*400,900,i*.55),this.first&&this.pos.copy(cn),this.pos.lerp(cn,1-Math.exp(-t*1.5)),bn.copy(e).sub(this.pos).normalize(),this.first?this.look.copy(bn):rl(this.look,this.look,bn,1-Math.exp(-t*6)),this.first=!1,this.camera.up.set(0,1,0),this.camera.position.copy(this.pos).multiplyScalar(.01),ya.copy(this.pos).addScaledVector(this.look,1e3).multiplyScalar(.01),this.camera.lookAt(ya)}};var bb=new S(0,1,0),al=new S,Ma=new S,e0=new S,i0=new S,zi=(s,t)=>s+Math.random()*(t-s);function Sb(){let s=document.createElement("canvas");s.width=s.height=256;let t=s.getContext("2d");t.fillStyle="rgba(255,255,255,0.22)",t.fillRect(0,0,256,256);for(let i=0;i<80;i++){let n=Math.random()*256,r=6+Math.random()*26,a=t.createLinearGradient(n,0,n+r,0),o=.35+Math.random()*.6;a.addColorStop(0,"rgba(255,255,255,0)"),a.addColorStop(.5,`rgba(255,255,255,${o})`),a.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=a,t.save(),t.translate(n,128),t.transform(1,0,-.6,1,0,0),t.fillRect(-r/2,-160,r,320),t.restore()}let e=new gi(s);return e.wrapS=e.wrapT=Ji,e}var Oh=class{constructor(t,e,i){this.group=t,this.effects=e,this.mode=i,this.time=0,this.cableGeo=new Ke(1,1,1,6,1,!0),this.cableGeo.translate(0,.5,0),this.cableMat=new ve({color:new St(1.4,1.5,1.7)}),this.clawGeo=new vs(.22,.5,8),this.clawMat=new Qt({color:13620960,metalness:1,roughness:.25,emissive:3820128}),this.cables=new Map,this.swirl=Sb(),this.funnelGeos=[new Ke(9.5,1.4,21,40,1,!0),new Ke(7,1,19,40,1,!0),new Ke(4.5,.7,17,32,1,!0)].map(n=>(n.translate(0,n.parameters.height/2,0),n)),this.tornados=new Map,this.ice=new at(new Eo(De.radius*.01*1.15,1),new Qt({color:13496063,emissive:4890584,emissiveIntensity:.6,roughness:.08,metalness:.1,transparent:!0,opacity:.55,flatShading:!0,depthWrite:!1})),this.ice.visible=!1,t.add(this.ice)}cableFor(t){let e=this.cables.get(t);if(!e){let i=new at(this.cableGeo,this.cableMat),n=new at(this.clawGeo,this.clawMat);i.frustumCulled=!1,this.group.add(i,n),e={cable:i,claw:n},this.cables.set(t,e)}return e}tornadoFor(t){let e=this.tornados.get(t);if(!e){let i=new Me,n=this.funnelGeos.map((r,a)=>{let o=this.swirl.clone();o.needsUpdate=!0,o.repeat.set(3+a,1);let l=new at(r,new ve({map:o,color:a===2?15789284:13813942,transparent:!0,opacity:[.62,.7,.45][a],depthWrite:!1,side:ce,blending:a===2?Ee:gn}));return l.renderOrder=6,i.add(l),{m:l,tex:o,speed:[2.2,-3.1,4.5][a]}});this.group.add(i),e={g:i,parts:n,grow:0},this.tornados.set(t,e)}return e}update(t,e,i,n){this.time+=t;let r=this.mode,a=r.world.ball,o=this.effects,l=-1;if(r.name==="heatseeker"&&r.team>=0&&(l=r.team),r.name==="rumble"&&r.curve&&(l=r.curve.team),l>=0&&i.visible){let d=Ie[l],f=Math.max(1,Math.round(t*90*o.mult));for(let p=0;p<f;p++)o.glow.emit(n.x*.01+zi(-.4,.4),n.y*.01+zi(-.4,.4),n.z*.01+zi(-.4,.4),0,zi(0,.5),0,zi(.3,.55),zi(.7,1.1),.15,[d.flame[0]*1.6,d.flame[1]*1.6,d.flame[2]*1.6,.6],[d.flameEnd[0],d.flameEnd[1],d.flameEnd[2],0],1.5,0);i.material.emissiveIntensity=3.2+Math.sin(this.time*12)*.6}else i.material.emissiveIntensity=2.4;let c=a.iceTimer>0;if(this.ice.visible=c&&i.visible,c&&(this.ice.position.copy(i.position),this.ice.rotation.y+=t*.4,Math.random()<t*20&&o.glow.emit(i.position.x+zi(-1,1),i.position.y+zi(-1,1),i.position.z+zi(-1,1),0,-.3,0,.6,.12,.02,[1.6,2,2.4,.8],[.6,.9,1.4,0],0,0)),r.name!=="rumble")return;let h=new Set,u=new Set;for(let d of e){let f=d.car,v=r.st(f).active;if(d.model.setPower(!!v&&v.type==="power",this.time),d.model.setSpikes(!!v&&v.type==="spikes"),!(!v||f.demolished)){if((v.type==="grapple"||v.type==="plunger")&&d.ipos){let m=this.cableFor(f);h.add(f),e0.set(0,0,1).applyQuaternion(d.iquat),i0.set(0,1,0).applyQuaternion(d.iquat),al.copy(d.ipos).addScaledVector(e0,55).addScaledVector(i0,28).multiplyScalar(.01);let g=v.phase==="pull"?n:v.hook;Ma.copy(g).multiplyScalar(.01),v.phase==="pull"&&Ma.addScaledVector(al.clone().sub(Ma).normalize(),De.radius*.01*.9);let x=al.distanceTo(Ma);m.cable.position.copy(al),m.cable.quaternion.setFromUnitVectors(bb,Ma.clone().sub(al).normalize()),m.cable.scale.set(.05,Math.max(.01,x),.05),m.claw.position.copy(Ma),m.claw.quaternion.copy(m.cable.quaternion),m.cable.visible=m.claw.visible=!0}if(v.type==="tornado"&&d.ipos){let m=this.tornadoFor(f);u.add(f);let g=Math.min(1,v.t/.5)*Math.min(1,(v.dur-v.t)/.6);m.grow=g,m.g.visible=!0,m.g.position.set(d.ipos.x*.01,0,d.ipos.z*.01),m.g.scale.set(.3+.7*g,g,.3+.7*g);for(let b of m.parts)b.m.rotation.y+=b.speed*t,b.tex.offset.y-=t*.6;let x=Math.round(t*70*o.mult);for(let b=0;b<x;b++){let y=Math.random()*Math.PI*2,E=zi(1,6),w=m.g.position.x+Math.cos(y)*E,R=m.g.position.z+Math.sin(y)*E;o.smoke.emit(w,zi(0,1.5),R,-Math.sin(y)*9,zi(3,9),Math.cos(y)*9,zi(.8,1.6),zi(.8,1.4),zi(2.4,4),[.45,.4,.33,.45],[.3,.28,.25,0],.8,-1,zi(-2,2))}}}}for(let[d,f]of this.cables)h.has(d)||(f.cable.visible=f.claw.visible=!1);for(let[d,f]of this.tornados)u.has(d)||(f.g.visible=!1)}};var Hh=new S,zh=new S,Eb=new S,rf=new S,ol=class{constructor(t,e=2400,i=.02){this.max=e,this.height=i,this.head=0,this.pos=new Float32Array(e*4*3),this.col=new Float32Array(e*4*4);let n=new Uint32Array(e*6);for(let a=0;a<e;a++){let o=a*4;n.set([o,o+1,o+2,o+2,o+1,o+3],a*6)}let r=new ye;this.posAttr=new Se(this.pos,3).setUsage(Ki),this.colAttr=new Se(this.col,4).setUsage(Ki),r.setAttribute("position",this.posAttr),r.setAttribute("color",this.colAttr),r.setIndex(new Se(n,1)),r.setDrawRange(0,0),this.geo=r,this.mesh=new at(r,new ve({vertexColors:!0,transparent:!0,depthWrite:!1,side:ce,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2})),this.mesh.frustumCulled=!1,this.mesh.renderOrder=1,t.add(this.mesh),this.prev=new Map,this.used=0,this.dirty=!1}clear(){this.used=0,this.head=0,this.prev.clear(),this.geo.setDrawRange(0,0)}static skid(t){if(!t.onGround||t.demolished||t.groundNormal.y<.95||t.pos.y>45)return 0;t.forward(Hh),t.left(zh);let e=t.vel.length(),i=Math.abs(t.vel.dot(zh)),n=t.vel.dot(Hh),r=t.input,a=0;return r.powerslide&&e>250&&(a=Math.max(a,.9)),i>140&&(a=Math.max(a,Math.min(1,(i-140)/400))),(r.throttle>.5||t.boosting)&&Math.abs(n)<650&&(a=Math.max(a,.7)),r.throttle*n<0&&Math.abs(n)>450&&(a=Math.max(a,.8)),a}update(t,e,i,n){Hh.set(0,0,1).applyQuaternion(i),zh.set(1,0,0).applyQuaternion(i),Eb.set(0,1,0).applyQuaternion(i);for(let r=0;r<4;r++){let a=t.id*4+r;if(n<=0||Ft.wheels[r].front&&n<.75){this.prev.delete(a);continue}let o=Ft.wheels[r];rf.copy(e).addScaledVector(zh,o.x+Math.sign(o.x)*7).addScaledVector(Hh,o.z);let l=rf.x*.01,c=rf.z*.01,h=this.prev.get(a);if(!h){this.prev.set(a,{x:l,z:c});continue}let u=l-h.x,d=c-h.z,f=Math.hypot(u,d);if(!(f<.08)){if(f>4){this.prev.set(a,{x:l,z:c});continue}this.addQuad(h.x,h.z,l,c,u/f,d/f,.72*n),h.x=l,h.z=c}}}addQuad(t,e,i,n,r,a,o){let c=-a*.07,h=r*.07,u=this.height,d=this.head,f=d*12,p=this.pos;p[f]=t+c,p[f+1]=u,p[f+2]=e+h,p[f+3]=t-c,p[f+4]=u,p[f+5]=e-h,p[f+6]=i+c,p[f+7]=u,p[f+8]=n+h,p[f+9]=i-c,p[f+10]=u,p[f+11]=n-h;let v=d*16;for(let m=0;m<4;m++)this.col.set([.045,.035,.018,o],v+m*4);this.head=(this.head+1)%this.max,this.used=Math.min(this.max,this.used+1),this.dirty=!0}flush(){this.dirty&&(this.dirty=!1,this.posAttr.needsUpdate=!0,this.colAttr.needsUpdate=!0,this.geo.setDrawRange(0,this.used*6))}};var Zs=`
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
`,Vh=`
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`,of=1.3,r0=7.5;function wb(s){return new ue({uniforms:s,transparent:!0,depthWrite:!1,blending:Ee,side:ce,vertexShader:`
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
      ${Zs}
      void main() {
        float r = length(vL.xz);
        float t = clamp((r - ${of.toFixed(2)}) / (${(r0-of).toFixed(2)}), 0.0, 1.0);
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
        ${Vh}
      }`})}function Tb(s){return new ue({uniforms:s,transparent:!0,depthWrite:!1,blending:Ee,vertexShader:`
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`
      uniform float uTime, uI, uHot, uSide, uBurst;
      varying vec2 vP;
      ${Zs}
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
        ${Vh}
      }`})}function Ab(s){return new ue({uniforms:s,transparent:!0,depthWrite:!1,blending:Ee,vertexShader:`
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
        ${Vh}
      }`})}function Rb(s){return new ue({uniforms:s,transparent:!0,depthWrite:!1,blending:Ee,side:ce,vertexShader:`
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
      ${Zs}
      void main() {
        float along = 1.0 - vUv.y; // 0 at the hole, 1 at the tip
        float n = fbm3(vec3(vUv.x * 12.0, along * 6.0 - uTime * 9.0, 1.0));
        float facing = abs(dot(normalize(vN), normalize(cameraPosition - vW)));
        float a = pow(facing, 1.5) * (1.0 - along) * (0.4 + n) * smoothstep(0.0, 0.05, along);
        vec3 col = mix(vec3(0.75, 0.85, 1.0), vec3(0.4, 0.55, 1.0), along);
        gl_FragColor = vec4(col * a * 3.0 * uJet, 1.0);
        ${Vh}
      }`})}var kh=new be,af=new S,n0=new S,ba=new S,mr=new S,s0=new S(0,1,0),Sa=class{constructor({jets:t=!1,segments:e=1}={}){this.group=new Me,this.u={uTime:{value:0},uI:{value:1},uHot:{value:0},uSide:{value:1},uBurst:{value:0},uGlow:{value:1},uJet:{value:0}},this.horizon=new at(new ai(1,64,32),new ve({color:0,fog:!1})),this.horizon.renderOrder=1;let i=new ys(of,r0,Math.round(192*e),20);if(i.rotateX(-Math.PI/2),this.disk=new at(i,wb(this.u)),this.disk.renderOrder=6,this.billboard=new Me,this.halo=new at(new ti(6,6),Tb(this.u)),this.halo.renderOrder=5,this.glow=new at(new ti(30,30),Ab(this.u)),this.glow.renderOrder=4,this.billboard.add(this.glow,this.halo),this.group.add(this.horizon,this.disk,this.billboard),t){let n=new Ke(3.2,.12,70,32,1,!0);n.translate(0,35.6,0);let r=Rb(this.u),a=new at(n,r),o=new at(n,r);o.rotation.x=Math.PI,this.jets=new Me,this.jets.add(a,o),this.jets.visible=!1;for(let l of[a,o])l.renderOrder=7;this.group.add(this.jets)}this.group.traverse(n=>{n.frustumCulled=!1})}update(t,e){this.u.uTime.value+=t,this.group.updateMatrixWorld(),kh.copy(this.group.matrixWorld).invert(),af.copy(e.position).applyMatrix4(kh),mr.copy(af).normalize(),ba.copy(s0).addScaledVector(mr,-s0.dot(mr)),ba.lengthSq()<1e-6&&ba.set(0,0,1).addScaledVector(mr,-mr.z),ba.normalize(),n0.crossVectors(ba,mr),kh.makeBasis(n0,ba,mr),this.billboard.quaternion.setFromRotationMatrix(kh),this.u.uSide.value=af.y>=0?1:-1,this.jets&&(this.jets.visible=this.u.uJet.value>.001)}dispose(){this.group.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&t.material.dispose()})}};var ns=20,gr=`
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`,cf=`
  vec2 eqUv(vec3 d) { return vec2(atan(d.x, d.z) / 6.2831853 + 0.5, asin(clamp(d.y, -1.0, 1.0)) / 3.1415927 + 0.5); }
  vec3 eqDir(vec2 uv) {
    float lon = (uv.x - 0.5) * 6.2831853, lat = (uv.y - 0.5) * 3.1415927;
    return vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon));
  }
`,$s=s=>Math.min(1,Math.max(0,s)),Zi=(s,t,e)=>{let i=$s((e-s)/(t-s));return i*i*(3-2*i)},lf=s=>s<.5?4*s*s*s:1-Math.pow(-2*s+2,3)/2;function a0(s,t,e,i,n=Bi){let r=new Qe(t,e,{type:n,depthBuffer:!1,generateMipmaps:!1,minFilter:mi,magFilter:mi});r.texture.wrapS=Ji;let a=new ue({depthTest:!1,depthWrite:!1,vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`varying vec2 vUv;
${Zs}
${cf}
void main() { vec3 dir = eqDir(vUv);
${i}
}`}),o=new at(new ti(2,2),a);o.frustumCulled=!1;let l=new Wn;l.add(o);let c=new $n(-1,1,1,-1,0,1),h=s.getRenderTarget();return s.setRenderTarget(r),s.render(l,c),s.setRenderTarget(h),a.dispose(),o.geometry.dispose(),r}var Cb=`
  float h = fbm(dir * 1.7 + vec3(3.7, 1.1, 0.0)) * 0.72 + fbm(dir * 6.5 + 7.0) * 0.28;
  float dry = fbm(dir * 3.2 + 11.0);
  float cl = fbm(dir * vec3(2.2, 4.6, 2.2) + 23.0) * 0.75 + fbm(dir * 11.0 + 5.0) * 0.25;
  cl = smoothstep(0.47, 0.7, cl);
  float city = step(0.76, vnoise(dir * 190.0)) * smoothstep(0.35, 0.65, vnoise(dir * 22.0));
  gl_FragColor = vec4(h, dry, cl, city);
`,Pb=`
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
`;function Ib(s){return new ue({side:yi,depthWrite:!1,uniforms:{uTex:{value:s},uBH:{value:new S},uBHR:{value:ns},uWarp:{value:0},uFlash:{value:0},uFlashDir:{value:new S(0,0,1)},uSun:{value:new S(1,0,0)}},vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = (modelMatrix * vec4(position, 0.0)).xyz;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,fragmentShader:`
      uniform sampler2D uTex; uniform vec3 uBH, uFlashDir, uSun; uniform float uBHR, uWarp, uFlash;
      varying vec3 vDir;
      ${cf}
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
        ${gr}
      }`})}var u0=`
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
`;function Lb(s,t){return new ue({uniforms:{...t,uMap:{value:s},uSun:{value:new S(1,0,0)},uBH:{value:new S},uBHLight:{value:.5},uMelt:{value:0},uCloudRot:{value:0},uTime:{value:0}},vertexShader:`
      ${u0}
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
      ${Zs}
      ${cf}
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
        ${gr}
      }`})}function Db(s){return new ue({uniforms:{...s,uSun:{value:new S(1,0,0)},uFade:{value:1}},transparent:!0,depthWrite:!1,blending:Ee,vertexShader:`
      ${u0}
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
        ${gr}
      }`})}function o0(s=!0){return new ue({transparent:!0,depthWrite:!1,blending:s?Ee:gn,uniforms:{uScale:{value:1},uAtten:{value:0},uI:{value:1}},vertexShader:`
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
        ${gr}
      }`})}function Nb(s){let t=document.createElement("canvas");t.width=t.height=256;let e=t.getContext("2d"),i=s*9301+49297,n=()=>(i=(i*9301+49297)%233280,i/233280),r=e.createRadialGradient(128,128,0,128,128,60);r.addColorStop(0,"rgba(255,240,210,1)"),r.addColorStop(.3,"rgba(255,200,150,0.5)"),r.addColorStop(1,"rgba(120,120,200,0)"),e.fillStyle=r,e.fillRect(0,0,256,256);let a=2+Math.floor(n()*2);for(let l=0;l<2600;l++){let c=l%a,h=Math.pow(n(),.7),u=h*7+c/a*Math.PI*2+(n()-.5)*.6,d=8+h*110+(n()-.5)*14*h,f=128+Math.cos(u)*d,p=128+Math.sin(u)*d,v=(1-h)*.5+.15;e.fillStyle=n()<.15?`rgba(255,170,200,${v})`:`rgba(170,200,255,${v})`,e.fillRect(f,p,1.6,1.6)}let o=new gi(t);return o.colorSpace=We,o}function Ub(){return new ue({uniforms:{uTime:{value:0},uI:{value:1}},transparent:!0,depthWrite:!1,blending:Ee,side:ce,vertexShader:`
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
      ${Zs}
      void main() {
        float f = abs(dot(normalize(vNW), normalize(cameraPosition - vW)));
        float n = fbm3(vL * 4.0 + vec3(0.0, uTime * 1.5, 0.0));
        float edge = pow(1.0 - f, 2.0);
        vec3 col = mix(vec3(1.0, 0.72, 0.4), vec3(1.0, 0.3, 0.08), edge);
        col = mix(col, vec3(0.65, 0.35, 1.0), smoothstep(0.5, 0.8, n) * 0.7);
        gl_FragColor = vec4(col * (0.2 + edge * 1.3) * (0.35 + n) * uI, 1.0);
        ${gr}
      }`})}function Fb(){return new ue({uniforms:{uI:{value:1}},transparent:!0,depthWrite:!1,blending:Ee,side:ce,vertexShader:"varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uI;
      varying vec2 vP;
      void main() {
        float r = length(vP);
        float a = smoothstep(0.8, 0.98, r) * (1.0 - smoothstep(0.98, 1.0, r));
        gl_FragColor = vec4(vec3(0.75, 0.85, 1.0) * a * a * 1.4 * uI, 1.0);
        ${gr}
      }`})}function Bb(){return new ue({uniforms:{uI:{value:0},uTime:{value:0}},transparent:!0,depthWrite:!1,depthTest:!1,blending:Ee,vertexShader:"varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uI, uTime;
      varying vec2 vP;
      ${Zs}
      void main() {
        float r = length(vP);
        float a = atan(vP.y, vP.x);
        float rays = pow(max(fbm3(vec3(cos(a) * 7.0, sin(a) * 7.0, uTime * 0.5)) - 0.45, 0.0) / 0.55, 2.5) * 4.0;
        float fall = exp(-r * 3.5) * (1.0 - smoothstep(0.4, 0.9, r));
        vec3 col = mix(vec3(1.0, 0.85, 0.6), vec3(0.75, 0.6, 1.0), smoothstep(0.05, 0.4, r));
        gl_FragColor = vec4(col * (rays * fall + exp(-r * 9.0) * 1.5) * uI, 1.0);
        ${gr}
      }`})}var Ue=new S,Ci=new S,l0=new le,c0=new le,Ea=new S(0,1,0);function h0(s,t,e){let i=we.degToRad(s),n=we.degToRad(t);return new S(Math.cos(n)*Math.sin(i)*e,Math.sin(n)*e,Math.cos(n)*Math.cos(i)*e)}var Gh=class{constructor(t,e,i){this.fx=i,this.quality=e;let n=e==="low";this.scene=new Wn,this.camera=new ii(50,1,.004,4e4),this.t=0,this.events=new Set;let r=e==="high";this.skyRT=a0(t,r?4096:2048,r?2048:1024,Pb,hi),this.earthRT=a0(t,n?1024:2048,n?512:1024,Cb),this.skyGroup=new Me,this.sky=new at(new ai(9e3,64,32),Ib(this.skyRT.texture)),this.sky.renderOrder=-10,this.skyGroup.add(this.sky),this.scene.add(this.skyGroup);{let d=n?2500:6e3,f=new Float32Array(d*3),p=new Float32Array(d*3),v=new Float32Array(d),m=new S(.25,.92,.3).normalize();for(let x=0;x<d;x++){if(Ue.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1),Ue.lengthSq()>1||Ue.lengthSq()<.01){x--;continue}Ue.normalize(),x%3===0&&Ue.addScaledVector(m,-Ue.dot(m)*.9).normalize(),Ue.multiplyScalar(8e3),f.set([Ue.x,Ue.y,Ue.z],x*3);let b=Math.random(),y=b<.2?[1,.75,.55]:b<.7?[1,.96,.92]:[.7,.82,1],E=.4+Math.pow(Math.random(),4)*2.4;p.set([y[0]*E,y[1]*E,y[2]*E],x*3),v[x]=1.2+Math.pow(Math.random(),6)*3.2}let g=new ye;g.setAttribute("position",new Se(f,3)),g.setAttribute("aCol",new Se(p,3)),g.setAttribute("aSize",new Se(v,1)),this.starMat=o0(),this.starMat.uniforms.uScale.value=Math.min(window.devicePixelRatio||1,2),this.stars=new Zr(g,this.starMat),this.stars.renderOrder=-9,this.stars.frustumCulled=!1,this.skyGroup.add(this.stars)}this.galaxies=[];for(let d=0;d<9;d++){let f=new Xr({map:Nb(d+3),blending:Ee,depthWrite:!1,transparent:!0,opacity:.55,rotation:Math.random()*6.28}),p=new lo(f);Ue.set(Math.random()*2-1,(Math.random()*2-1)*.6,Math.random()*2-1).normalize(),p.position.copy(Ue).multiplyScalar(5200+Math.random()*1500);let v=260+Math.random()*380;p.scale.set(v,v*(.35+Math.random()*.65),1),p.userData={base:p.position.clone(),s:p.scale.clone()},p.renderOrder=-8,this.scene.add(p),this.galaxies.push(p)}this.bh=new Sa({jets:!0,segments:n?.6:1}),this.bh.group.scale.setScalar(ns),this.bh.group.rotation.set(-.04,0,.07),this.scene.add(this.bh.group),this.wideCam=h0(38,8,430);let a=Ue.copy(this.wideCam).negate().normalize(),o=new S().crossVectors(a,Ea).normalize(),l=new S().crossVectors(o,a).normalize();this.wideLook=new S().addScaledVector(o,40).addScaledVector(l,10),this.earth0=this.wideCam.clone().addScaledVector(a.clone().addScaledVector(o,-.34).addScaledVector(l,-.19).normalize(),60);let c={uAxis:{value:new S(1,0,0)},uStretch:{value:0}};this.earthShared=c,this.earth=new Me,this.earthMat=Lb(this.earthRT.texture,c),this.earthMesh=new at(new ai(1,n?96:160,n?64:120),this.earthMat),this.atmoMat=Db(c),this.atmo=new at(new ai(1.045,96,64),this.atmoMat),this.atmo.renderOrder=2,this.earth.add(this.earthMesh,this.atmo),this.earth.rotation.z=.41,this.earth.position.copy(this.earth0),this.scene.add(this.earth),this.earthAlive=!0;let h=this.earth0.clone().negate().normalize(),u=new S().crossVectors(h,Ea).normalize();this.startDir=new S().addScaledVector(h,-.35).addScaledVector(u,-1).addScaledVector(Ea,.32).normalize(),this.sunDir=new S().addScaledVector(this.startDir,1).addScaledVector(h,.45).addScaledVector(Ea,.25).normalize(),this.earthMat.uniforms.uSun.value.copy(this.sunDir),this.atmoMat.uniforms.uSun.value.copy(this.sunDir),this.sky.material.uniforms.uSun.value.copy(this.sunDir);{let d=n?1400:3600;this.streamN=d;let f=new ye;this.sPos=new Float32Array(d*3),this.sCol=new Float32Array(d*3),this.sSize=new Float32Array(d),f.setAttribute("position",new Se(this.sPos,3).setUsage(Ki)),f.setAttribute("aCol",new Se(this.sCol,3).setUsage(Ki)),f.setAttribute("aSize",new Se(this.sSize,1).setUsage(Ki)),this.streamGeo=f,this.streamMat=o0(),this.streamMat.uniforms.uAtten.value=1,this.stream=new Zr(f,this.streamMat),this.stream.frustumCulled=!1,this.stream.renderOrder=8,this.scene.add(this.stream),this.parts=[];for(let p=0;p<d;p++)this.parts.push({alive:!1,born:0,life:1,off:new S,spin:0,hot:!1,size:1,src:new S});this.emitAcc=0}this.core=new at(new ai(1,64,32),Ub()),this.core.visible=!1,this.core.renderOrder=9,this.shock=new at(new ys(.5,1,160,1),Fb()),this.shock.rotation.x=-Math.PI/2,this.shock.visible=!1,this.shock.renderOrder=9,this.rays=new at(new ti(2,2),Bb()),this.rays.visible=!1,this.rays.renderOrder=10,this.scene.add(this.core,this.shock,this.rays);for(let d of[this.core,this.shock,this.rays])d.frustumCulled=!1;this.camPos=new S,this.camLook=new S,this.shakeAmt=0,this.fov=55,this.duration=19.8,this.update(0)}earthAt(t,e){let i=$s((t-6)/6.2),n=.75*Math.pow(i,2.2)+.25*Math.pow(i,12),r=this.earth0.length(),a=r*Math.pow(ns*.25/r,n),o=1-a/r,c=Math.atan2(this.earth0.x,this.earth0.z)+1.25*Math.pow(i,2.6),h=this.earth0.y*(1-o),u=Math.sqrt(Math.max(0,a*a-h*h));return e.set(Math.sin(c)*u,h,Math.cos(c)*u)}emitStream(t,e,i){this.emitAcc+=i*t;let n=this.earth.position;for(let r of this.parts){if(this.emitAcc<1)break;r.alive||(this.emitAcc-=1,r.alive=!0,r.born=e,r.life=2.4+Math.random()*2.4,Ue.copy(n).negate().normalize(),Ci.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize(),Ci.dot(Ue)<0&&Ci.addScaledVector(Ue,-2*Ci.dot(Ue)),Ci.lerp(Ue,.35).normalize(),r.off.copy(Ci).multiplyScalar(1.02+this.earthShared.uStretch.value*.8*Math.random()),r.src.copy(n),r.spin=.9+Math.random()*1.2,r.hot=Math.random()<.55,r.size=r.hot?.12+Math.random()*.25:.08+Math.random()*.15)}this.emitAcc>1&&(this.emitAcc=1)}updateStream(t){let e=this.sPos,i=this.sCol,n=this.sSize;for(let a=0;a<this.streamN;a++){let o=this.parts[a];if(!o.alive){n[a]=0;continue}let l=(t-o.born)/o.life;if(l>=1){o.alive=!1,n[a]=0;continue}Ue.copy(this.earthAlive?this.earth.position:o.src).add(o.off);let c=Ue.length(),h=Math.pow(l,1.5),u=c*(1-h)+ns*.92*h;Ci.copy(Ue).divideScalar(c);let d=o.spin*Math.pow(l,2.2)*2.2,f=Math.cos(d),p=Math.sin(d),v=Ci.x*f+Ci.z*p,m=-Ci.x*p+Ci.z*f,g=Ci.y*(1-h),x=Math.hypot(v,g,m);e[a*3]=v/x*u,e[a*3+1]=g/x*u,e[a*3+2]=m/x*u;let b=Math.min(1,l*1.6),y=Math.min(1,(1-l)*6)*Math.min(1,l*12);o.hot?(i[a*3]=(1.6+b)*y,i[a*3+1]=(.55+b*.9)*y,i[a*3+2]=(.15+b*.8)*y):(i[a*3]=(.35+b*1.2)*y,i[a*3+1]=(.3+b*.7)*y,i[a*3+2]=(.28+b*.4)*y),n[a]=o.size*(1+l*6)*(.4+.6*(u/c))}let r=this.streamGeo;r.attributes.position.needsUpdate=!0,r.attributes.aCol.needsUpdate=!0,r.attributes.aSize.needsUpdate=!0}once(t){return this.events.has(t)?!1:(this.events.add(t),!0)}update(t){let e=this.t;this.t+=t;let i=this.fx,n=this.camera,r=this.bh.u;if(this.earthAlive){this.earthAt(e,this.earth.position),this.earth.rotateY(t*.08);let f=this.earth.position.length();Ue.copy(this.earth.position).negate().normalize(),this.earth.getWorldQuaternion(l0),c0.copy(l0).invert(),this.earthShared.uAxis.value.copy(Ue).applyQuaternion(c0);let p=Math.pow($s((95-f)/75),2)*7;this.earthShared.uStretch.value=p,this.earthMat.uniforms.uMelt.value=$s((140-f)/110),this.earthMat.uniforms.uBHLight.value=.35+$s((300-f)/250)*1.6,this.earthMat.uniforms.uCloudRot.value+=t*.03,this.earthMat.uniforms.uTime.value=e,this.earthMat.uniforms.uBH.value.set(0,0,0),f<ns*.55&&(this.earthAlive=!1,this.earth.visible=!1,i.flash("#ffd9a8",.35,.05,0,.6),i.sound("gulp"))}e<12.5&&this.emitStream(t,e,e<6?260:700),this.updateStream(e);let a=Zi(12.3,14,e);r.uHot.value=a*.8,r.uJet.value=Zi(12.6,13.4,e)*(1-Zi(14.2,14.6,e));let o=.5+.5*Zi(70,220,this.camPos.length());r.uI.value=(1+a*.6+(e>12.6&&e<14?Math.sin(e*40)*.15*a:0))*o;let l=1+(e>12.6&&e<14?Math.sin(e*22)*.035*a:0),c=e-14;if(c>0){this.once("boom")&&(i.sound("bigboom"),i.flash("#ffffff",.55,.05,.05,.8),i.shake(1.5),this.core.visible=!0,this.shock.visible=!0,this.rays.visible=!0),r.uBurst.value=$s(c/1.2),this.bh.horizon.scale.setScalar(Math.max(.001,1-c*3));let f=ns*(.6+3.2*Math.pow(c,2.4));this.core.scale.setScalar(f),this.core.material.uniforms.uTime.value=c,this.core.material.uniforms.uI.value=.7*(1-Zi(3.5,5,c));let p=ns*(1+9*Math.pow(c,1.8));this.shock.scale.setScalar(p),this.shock.material.uniforms.uI.value=1-Zi(2,3.4,c),this.rays.material.uniforms.uI.value=Zi(0,.15,c)*(1-Zi(2.6,3.4,c))*.45,this.rays.material.uniforms.uTime.value=c;let v=this.sky.material.uniforms;v.uWarp.value=Zi(.2,2.6,c),v.uFlash.value=Zi(.8,3,c);for(let m of this.galaxies){let g=m.userData.base.length(),x=$s((f-g*.15)/(g*.3));m.position.copy(m.userData.base).multiplyScalar(1+x*.6),m.material.opacity=.55+x*2*(1-x)}c>2.3&&this.once("white")&&i.flash("#ffffff",1,1,99,1),c>3.4&&this.once("text")&&i.text("final")}this.bh.group.scale.setScalar(ns*l);let h=this.wideCam;if(e<6.5){let f=lf($s(e/6.3)),p=1.85,v=this.wideCam.distanceTo(this.earth0),m=p*Math.pow(v/p,f);Ci.copy(h).sub(this.earth0).normalize(),Ue.copy(this.startDir).lerp(Ci,Zi(.15,1,f)).normalize(),this.camPos.copy(this.earth0).addScaledVector(Ue,m),Ci.copy(this.earth0).multiplyScalar(-.006).add(this.earth0),this.camLook.copy(Ci).lerp(this.wideLook,Zi(.25,1,f)),this.fov=55}else if(e<12.4){let f=Zi(6.3,7.8,e),p=this.earth.position;Ue.copy(p).normalize(),Ci.crossVectors(Ea,Ue).normalize();let v=this._target||(this._target=new S);v.copy(p).addScaledVector(Ue,7).addScaledVector(Ci,-5).addScaledVector(Ea,2.5),v.length()<ns*2.2&&v.setLength(ns*2.2),this.camPos.lerpVectors(h,v,f),Ue.copy(p).multiplyScalar(.65),this.camLook.lerpVectors(this.wideLook,Ue,f),this.fov=55+f*5}else{let f=Zi(12.4,13.8,e);this.fromPos||(this.fromPos=this.camPos.clone(),this.fromLook=this.camLook.clone(),this.farPos=h0(30,9,640)),this.camPos.lerpVectors(this.fromPos,this.farPos,lf(f)),this.camLook.copy(this.fromLook).multiplyScalar(1-lf(f)),this.fov=60+Zi(14,16,e)*18}this.shakeAmt=Math.max(0,this.shakeAmt-t*.5);let u=Math.max(this.shakeAmt,a*.25)*(e>17?0:1);if(n.position.copy(this.camPos),u>0){let f=.004*u*n.position.distanceTo(this.camLook);n.position.x+=(Math.random()-.5)*f,n.position.y+=(Math.random()-.5)*f,n.position.z+=(Math.random()-.5)*f}n.up.set(0,1,0),n.lookAt(this.camLook),this.rays.position.set(0,0,0),this.rays.quaternion.copy(n.quaternion),this.rays.scale.setScalar(n.position.length()*2.2),this.skyGroup.position.copy(n.position);let d=this.sky.material.uniforms;d.uBH.value.set(0,0,0),d.uBHR.value=Math.max(1e-4,this.bh.group.scale.x*this.bh.horizon.scale.x),d.uFlashDir.value.copy(n.position).negate().normalize(),this.atmoMat.uniforms.uFade.value=1,this.bh.update(t,n)}get done(){return this.t>=this.duration}dispose(){this.scene.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&(t.material.map&&t.material.map.dispose(),t.material.dispose())}),this.bh.dispose(),this.skyRT.dispose(),this.earthRT.dispose()}};var{halfZ:Xh,goalDepth:p0,goalH:m0,goalHalfW:Ob}=Ut,Pi=s=>Math.min(1,Math.max(0,s)),hf=(s,t,e)=>{let i=Pi((e-s)/(t-s));return i*i*(3-2*i)},Wh=s=>1-Math.pow(1-Pi(s),3),uf=s=>s<.5?4*s*s*s:1-Math.pow(-2*s+2,3)/2;function Hb(s){return s<1/2.75?7.5625*s*s:s<2/2.75?7.5625*(s-=1.5/2.75)*s+.75:s<2.5/2.75?7.5625*(s-=2.25/2.75)*s+.9375:7.5625*(s-=2.625/2.75)*s+.984375}var zb=[[0,0,Xh+p0+m0],[0,0,7150],[0,200,7800],[0,700,8600],[0,1400,9500],[0,2200,10500],[0,3100,11600],[300,4100,12800],[1300,5200,14200],[2600,6400,15800],[3500,7700,17700],[3500,9100,19800],[2400,10500,21900],[600,11900,24e3],[-1200,13300,26200],[-2200,14700,28500],[-1800,16100,30900],[-600,17400,33300],[0,18600,35800]],kb=[0,16600,44e3],qh=1500,Vb=5500,Gb=300,d0=1300,wa=11e3,vr=5e3,Js=3.3,Qi=new S,Sn=new S,ss=new le,f0=new le,Ln=new be,Es=new S,Ks=new S(0,1,0);function Wb(s){let t=Ie[s],e=()=>{let l=document.createElement("canvas");return l.width=256,l.height=512,l},i=e(),n=e(),r=i.getContext("2d"),a=n.getContext("2d");r.fillStyle="#25282e",r.fillRect(0,0,256,512);for(let l=0;l<2500;l++){let c=30+Math.random()*40;r.fillStyle=`rgb(${c},${c},${c+4})`,r.fillRect(Math.random()*256,Math.random()*512,2,2)}a.fillStyle="#000",a.fillRect(0,0,256,512);for(let l of[r,a]){l.fillStyle=l===r?"#d8dde6":"#9aa6b8",l.fillRect(12,0,7,512),l.fillRect(237,0,7,512),l.fillStyle=l===r?t.css:"#fff";for(let c of[60,316])l.beginPath(),l.moveTo(128,c),l.lineTo(196,c+70),l.lineTo(196,c+120),l.lineTo(128,c+50),l.lineTo(60,c+120),l.lineTo(60,c+70),l.closePath(),l.fill()}let o=[i,n].map(l=>{let c=new gi(l);return c.wrapS=c.wrapT=Ji,c.anisotropy=4,c});return o[0].colorSpace=We,o}function df(s,t,e){return s.onBeforeCompile=i=>{i.uniforms.uReveal=t,i.uniforms.uRevealCol=e,i.vertexShader=`attribute float aS;
varying float vS;
`+i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vS = aS;`),i.fragmentShader=`uniform float uReveal;
uniform vec3 uRevealCol;
varying float vS;
`+i.fragmentShader.replace("#include <clipping_planes_fragment>",`#include <clipping_planes_fragment>
if (vS > uReveal) discard;`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += uRevealCol * (1.0 - smoothstep(0.0, 1400.0, uReveal - vS)) * 3.0;`)},s}var Yh=class{constructor(t,e,i){this.match=t,this.app=t.app,this.champ=e,this.team=i,this.target=1-i,this.s=this.target===0?-1:1,this.t=0,this.stage=1,this.done=!1,this.events=new Set;let n=this.app,r=n.stadium;this.cine=r.cine,this.quality=n.settings.quality,this.group=new Me,t.group.add(this.group),this.camera=new ii(55,1,.1,4500),this.view={camera:this.camera,rect:[0,0,1,1],hfov:82},n.gfx.setViews([this.view]),n.hud.show(!1);let a=n.gfx.bloom;a&&(this.bloomWas={strength:a.strength,radius:a.radius},a.strength=.38,a.radius=.12);for(let o of t.engines)n.audio.updateEngine(o,0,0,!1,!1,!1);this.engine=n.audio.createEngine(0),this.cine.screenFor(this.target).visible=!1,this.buildOverlay(),this.buildRoad(),this.buildBlackHole(),this.stageCars(),this.buildCutEdges(),this.buildDebris(),this.shake=0,this.camPos=new S,this.camLook=new S,this.camUp=new S(0,1,0),this.camInit=!1,this.caption(`${i===0?"BLUE":"ORANGE"} WINS!`,`${t.scores[0]} - ${t.scores[1]}`,i===0?"blue":"orange"),n.audio.cine("rise")}P(t,e,i){return new S(t,e,this.s*i)}once(t){return this.events.has(t)?!1:(this.events.add(t),!0)}buildOverlay(){let t=document.createElement("div");t.className="cine",t.innerHTML='<div class="cine-fill"></div><div class="cine-bar top"></div><div class="cine-bar bottom"></div><div class="cine-text"><div class="cine-main"></div><div class="cine-sub"></div></div><div class="cine-skip">Press A / Space to skip</div>',document.body.appendChild(t),this.overlay=t,this.fill=t.querySelector(".cine-fill"),this.textEl=t.querySelector(".cine-text"),this.mainEl=t.querySelector(".cine-main"),this.subEl=t.querySelector(".cine-sub"),this.flashes=[],requestAnimationFrame(()=>t.classList.add("on"))}flash(t,e,i,n,r){this.flashes.push({color:t,peak:e,rise:Math.max(.001,i),hold:n,fall:Math.max(.001,r),t:0})}updateFlashes(t){let e=0,i="#fff";for(let n=this.flashes.length-1;n>=0;n--){let r=this.flashes[n];r.t+=t;let a;if(r.t<r.rise?a=r.t/r.rise:r.t<r.rise+r.hold?a=1:a=1-(r.t-r.rise-r.hold)/r.fall,a<=0&&r.t>r.rise){this.flashes.splice(n,1);continue}a*=r.peak,a>e&&(e=a,i=r.color)}this.fill.style.opacity=e.toFixed(3),this.fill.style.background=i}caption(t,e="",i=""){this.mainEl.textContent=t,this.subEl.textContent=e,this.textEl.className="cine-text show "+i}hideCaption(){this.textEl.className="cine-text"}buildRoad(){let t=zb.map(([p,v,m])=>this.P(p,v,m)),e=new Jr(t,!1,"centripetal");e.arcLengthDivisions=3e3;let i=e.getLength(),n=Math.ceil(i/40),r=[];for(let p=0;p<=n;p++){let v=p/n,m=e.getPointAt(v),g=e.getTangentAt(v).normalize();r.push({s:v*i,p:m,T:g,U:new S,R:new S,bank:0})}for(let p=0;p<=n;p++){let v=r[Math.max(0,p-3)],m=r[Math.min(n,p+3)],g=Qi.crossVectors(r[p].T,Ks).normalize(),x=Sn.subVectors(m.T,v.T).dot(g)/Math.max(1,m.s-v.s);r[p].k=x}for(let p=0;p<=n;p++){let v=0,m=0;for(let R=Math.max(0,p-25);R<=Math.min(n,p+25);R++)v+=r[R].k,m++;let g=we.clamp(v/m*9e3,-.5,.5),x=r[p];x.R.crossVectors(x.T,Ks).normalize(),x.U.crossVectors(x.R,x.T).normalize();let b=Math.cos(g),y=Math.sin(g),E=x.U.clone(),w=x.R.clone();x.U.copy(E).multiplyScalar(b).addScaledVector(w,y),x.R.copy(w).multiplyScalar(b).addScaledVector(E,-y)}this.samples=r,this.roadLen=i,this.groundLen=Xh+p0+m0-d0,this.totalLen=this.groundLen+i,this.roadEnd=r[n];let a=Ie[this.team];this.reveal={value:0};let o={value:new St(a.light).multiplyScalar(1.5)},[l,c]=Wb(this.team),h=Gb,u=df(new Qt({map:l,emissiveMap:c,emissive:new St(a.main),emissiveIntensity:.9,roughness:.8,metalness:.1,side:ce}),this.reveal,o),d=df(new Qt({color:2303790,roughness:.35,metalness:.85,side:ce}),this.reveal,o),f=df(new Qt({color:0,emissive:new St(a.light),emissiveIntensity:2.2,side:ce}),this.reveal,o);this.roadMats=[u,d,f],this.road=new Me,this.road.add(new at(this.sweep([[-h,0],[h,0]],1200),u),new at(this.sweep([[-h+22,1],[-h+22,40],[-h-4,40],[-h-4,-55],[h+4,-55],[h+4,40],[h-22,40],[h-22,1]],900),d),new at(this.sweep([[-h-2,41.5],[-h+20,41.5]],900),f),new at(this.sweep([[h-20,41.5],[h+2,41.5]],900),f),new at(this.sweep([[-h-5,8],[-h-5,24]],900),f),new at(this.sweep([[h+5,24],[h+5,8]],900),f));for(let p of this.road.children)p.frustumCulled=!1,p.castShadow=!1;this.group.add(this.road)}sweep(t,e){let i=this.samples.length,n=t.length,r=new Float32Array(i*n*3),a=new Float32Array(i*n*2),o=new Float32Array(i*n);for(let h=0;h<i;h++){let u=this.samples[h];for(let d=0;d<n;d++){let[f,p]=t[d],v=h*n+d;r[v*3]=(u.p.x+u.R.x*f+u.U.x*p)*.01,r[v*3+1]=(u.p.y+u.R.y*f+u.U.y*p)*.01,r[v*3+2]=(u.p.z+u.R.z*f+u.U.z*p)*.01,a[v*2]=n===2?d:d/(n-1),a[v*2+1]=u.s/e,o[v]=u.s}}let l=[];for(let h=0;h<i-1;h++)for(let u=0;u<n-1;u++){let d=h*n+u,f=(h+1)*n+u,p=(h+1)*n+u+1,v=h*n+u+1;l.push(d,f,v,f,p,v)}let c=new ye;return c.setAttribute("position",new Se(r,3)),c.setAttribute("uv",new Se(a,2)),c.setAttribute("aS",new Se(o,1)),c.setIndex(l),c.computeVertexNormals(),c}frameAt(t,e){if(t<this.groundLen)return e.p.set(0,0,this.s*(d0+t)),e.T.set(0,0,this.s),e.U.set(0,1,0),e.R.crossVectors(e.T,Ks).normalize(),e;let i=t-this.groundLen,n=this.samples,r=i/(this.roadLen/(n.length-1));if(r>=n.length-1){let h=n[n.length-1];return e.p.copy(h.p).addScaledVector(h.T,i-this.roadLen),e.T.copy(h.T),e.U.copy(h.U),e.R.copy(h.R),e}let a=Math.floor(r),o=r-a,l=n[a],c=n[a+1];return e.p.lerpVectors(l.p,c.p,o),e.T.lerpVectors(l.T,c.T,o).normalize(),e.U.lerpVectors(l.U,c.U,o).normalize(),e.R.lerpVectors(l.R,c.R,o).normalize(),e}driveDist(t){let e=Math.max(0,t-Js),i=wa/vr;return e<i?.5*vr*e*e:.5*vr*i*i+wa*(e-i)}driveSpeed(t){let e=Math.max(0,t-Js);return Math.min(wa,vr*e)}timeAt(t){let e=wa/vr,i=.5*vr*e*e;return t<i?Js+Math.sqrt(2*t/vr):Js+e+(t-i)/wa}buildBlackHole(){this.bhPos=this.P(...kb),this.bh=new Sa({segments:this.quality==="low"?.6:1}),this.bh.group.position.copy(this.bhPos).multiplyScalar(.01),this.bh.group.scale.setScalar(qh*.01);let t=Qi.set(-560,0,this.s*-260).sub(Sn.copy(this.bhPos).multiplyScalar(.01).setY(0)).normalize();this.bh.group.quaternion.setFromUnitVectors(Ks,Sn.copy(Ks).addScaledVector(t,.3).normalize()),this.bh.u.uI.value=.6,this.bh.u.uGlow.value=.6,this.group.add(this.bh.group),this.bhR=qh,this.tEnd=this.timeAt(this.totalLen),this.fallDur=1.25,this.tBoom=this.tEnd+this.fallDur,this.tSuck=this.tBoom+.55,this.tSpace=this.tSuck+5.6;let e=this.cine.buildings;this.bMats=[],this.roadBlocked=new Set;let i=new S,n=new le,r=new S;for(let a=0;a<e.count;a++){e.getMatrixAt(a,Ln),this.bMats.push(Ln.clone()),Ln.decompose(i,n,r);let o=!1;for(let l=0;l<this.samples.length;l+=4){let c=this.samples[l],h=c.p.x*.01-i.x,u=c.p.z*.01-i.z,d=Math.max(r.x,r.z)*.75+12;if(h*h+u*u<d*d&&i.y+r.y+8>c.p.y*.01){o=!0;break}}o&&(this.roadBlocked.add(a),Ln.compose(i,n,Es.set(0,0,0)),e.setMatrixAt(a,Ln))}e.instanceMatrix.needsUpdate=!0}stageCars(){let t=this.match,e=this.s;this.carState={team:this.team,vel:new S,boosting:!1,supersonic:!1,demolished:!1,steerVisual:0,wheelSpin:0,wheelDist:[17,17,17,17],onGround:!0},t.players.filter(n=>n!==this.champ).forEach((n,r)=>{let a=n.car.team===this.team?1:-1,o=Math.floor(r/2),l=a*(700+r%2*260),c=e*(2300+o*1300+r%2*400);n.model.root.position.set(l*.01,17*.01,c*.01),n.model.root.quaternion.setFromAxisAngle(Ks,Math.atan2(-l,0)),n.model.root.scale.setScalar(1),n.model.flame.visible=!1,n.model.root.visible=!0});for(let n of t.players)n.model.blob&&(n.model.blob.visible=!1);t.ballBlob&&(t.ballBlob.visible=!1),this.ballWasVisible=t.ball.visible,t.ball.visible=!0,t.ball.position.set(-1900*.01,93*.01,e*3200*.01),this.champ.model.root.visible=!0,this.champ.model.root.scale.setScalar(1),this.frame={p:new S,T:new S,U:new S,R:new S},this.camFrame={p:new S,T:new S,U:new S,R:new S},this.carPos=new S,this.carQuat=new le,this.placeChamp(0,0)}buildCutEdges(){let t=Ie[this.team],e=new ve({color:new St(t.light).multiplyScalar(3),fog:!1});this.edgeMat=e,this.edges=[];let i=n=>{let r=new jr;for(let a=0;a<n.length-1;a++){let o=n[a],l=n[a+1];r.add(new Kr(new S(0,o[1]*.01,this.s*(Xh+o[0])*.01),new S(0,l[1]*.01,this.s*(Xh+l[0])*.01)))}return new To(r,n.length*8,.22,6,!1)};for(let n of[-1,1]){let r=new Me;r.add(new at(i(this.cine.standEdge),e),new at(i(this.cine.roofEdge),e)),r.userData.side=n,r.visible=!1,this.cine.arena.parent.add(r),this.edges.push(r)}}buildDebris(){let e=this.quality==="low"?180:420,i=new He(1,1,1),n=new Qt({roughness:.85,metalness:.1}),r=new gs(i,n,e);r.instanceMatrix.setUsage(Ki),r.frustumCulled=!1;let a=new St,o=this.s;this.debris=[];for(let l=0;l<e;l++){let c=Math.random(),h={p0:new S,size:new S,axis:new S(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),spin:2+Math.random()*6};if(c<.45)h.p0.set((Math.random()*2-1)*38,.3,(Math.random()*2-1)*48),h.size.set(1.5+Math.random()*4,.4+Math.random()*.6,1.5+Math.random()*4),a.setRGB(.07+Math.random()*.05,.16+Math.random()*.08,.04);else if(c<.8){let u=Math.random()*Math.PI*2,d=1+Math.random()*.45;h.p0.set(Math.cos(u)*52*d,8+Math.random()*30,Math.sin(u)*63*d),h.size.set(1+Math.random()*5,.8+Math.random()*3,1+Math.random()*5),Math.random()<.3?a.setHex(Ie[h.p0.z*o>0?this.target:this.team].main).multiplyScalar(.5):a.setRGB(.2,.21,.23)}else h.p0.set((Math.random()*2-1)*70,Math.random()*50,(Math.random()*2-1)*90),h.size.set(.3+Math.random()*2,.3+Math.random()*2,.3+Math.random()*2),a.setRGB(.5+Math.random()*.5,.5,.5);h.t0=Math.random()*3.6,h.dur=2.2+Math.random()*1.8,h.swirl=1.5+Math.random()*2.5,h.lift=8+Math.random()*25,this.debris.push(h),r.setColorAt(l,a),r.setMatrixAt(l,Ln.makeScale(0,0,0))}r.instanceColor.needsUpdate=!0,r.visible=!1,this.debrisMesh=r,this.group.add(r)}suckPos(t,e,i,n,r){let a=Sn.copy(this.bhPos).multiplyScalar(.01),o=Qi.copy(t).sub(a),l=o.length(),c=Math.pow(e,1.7),h=this.bhR*.01,u=l*(1-c)+h*.6*c,d=i*Math.pow(e,2.4),f=Math.cos(d),p=Math.sin(d),v=o.x*f+o.z*p,m=-o.x*p+o.z*f;return r.set(v,o.y,m).multiplyScalar(u/l).add(a),r.y+=n*Math.sin(Math.PI*Math.min(1,e*1.5))*(1-e),Pi((u-h*.75)/(h*1.2))}placeChamp(t,e){let i=this.frameAt(this.driveDist(t),this.frame);this.carPos.copy(i.p).addScaledVector(i.U,17),Ln.makeBasis(Qi.copy(i.R).negate(),i.U,i.T),this.carQuat.setFromRotationMatrix(Ln);let n=this.driveSpeed(t),r=this.carState;r.vel.copy(i.T).multiplyScalar(n),r.boosting=t>Js-.1,r.supersonic=n>2200,r.wheelSpin+=n/17*e,this.champ.model.update(r,this.carPos,this.carQuat,e),this.match.effects.carTrail(r,this.carPos,this.carQuat,e)}update(t,e){if(this.done)return!1;t=Math.min(t,.05);let i=this.t;return this.t+=t,e&&i>1?(this.finish(!0),!1):(this.updateFlashes(t),this.stage===1?this.updateStadium(i,t):this.updateSpace(i,t),this.done?!1:(this.app.gfx.render(),!0))}updateStadium(t,e){let i=this.app,n=this.cine,r=this.match,a=this.s,o=Ie[this.team];t>2.6&&this.once("caption-off")&&this.hideCaption();let l=Pi((t-.6)/1.1);n.setGoalFlap(this.target,Math.PI/2*Hb(l)),t>.6&&this.once("flap")&&(i.audio.cine("flap"),i.stadium.goalFlash(this.target)),t>1.2&&this.once("flapLand")&&i.audio.cine("clunk");let c=Ob*uf(Pi((t-.5)/1.1));n.setCut(this.target,t<this.tSuck+2.3?c:0);for(let d of this.edges)d.visible=c>1&&t<this.tSuck+2.2,d.position.x=d.userData.side*c*.01;let h=uf(Pi((t-1.1)/2.5));if(t>1.1&&this.once("build")&&i.audio.cine("build"),t<this.tBoom?this.reveal.value=this.roadLen*h:this.reveal.value=this.roadLen*(1-uf(Pi((t-this.tBoom)/3.2))),t>Js-.2&&this.once("go")&&i.audio.cine("launch"),t<this.tEnd){this.placeChamp(t,e);let d=this.driveSpeed(t);i.audio.updateEngine(this.engine,Math.min(2300,d),t>Js?1:0,t>Js-.1,!0,!0)}else if(t<this.tBoom){this.once("fall")&&(this.fallFrom=this.roadEnd.p.clone().addScaledVector(this.roadEnd.U,17),this.fallDir=this.roadEnd.T.clone(),this.fallQuat=this.carQuat.clone(),i.audio.cine("whoosh"));let d=Pi((t-this.tEnd)/this.fallDur),f=Math.pow(d,1.35),p=this.fallFrom,v=Sn.copy(p).addScaledVector(this.fallDir,4200),m=this.bhPos,g=(1-f)*(1-f),x=2*(1-f)*f,b=f*f;this.carPos.set(p.x*g+v.x*x+m.x*b,p.y*g+v.y*x+m.y*b,p.z*g+v.z*x+m.z*b);let y=Qi.set(2*(1-f)*(v.x-p.x)+2*f*(m.x-v.x),2*(1-f)*(v.y-p.y)+2*f*(m.y-v.y),2*(1-f)*(v.z-p.z)+2*f*(m.z-v.z)).normalize();ss.setFromUnitVectors(Es.set(0,0,1),y),f0.setFromAxisAngle(Es.set(0,0,1),d*d*9),ss.multiply(f0),this.carQuat.copy(this.fallQuat).slerp(ss,hf(0,.5,d));let E=this.carState;E.vel.copy(y).multiplyScalar(wa),E.boosting=d<.4;let w=this.champ.model;w.update(E,this.carPos,this.carQuat,e);let R=this.carPos.distanceTo(this.bhPos),_=Pi(1-(R-this.bhR)/(this.bhR*3));w.root.scale.set(1-_*.7,1-_*.7,1+_*5),E.boosting&&r.effects.carTrail(E,this.carPos,this.carQuat,e),i.audio.updateEngine(this.engine,2300,0,!1,!1,d<.6)}else if(this.once("boom")){this.champ.model.root.visible=!1,i.audio.updateEngine(this.engine,0,0,!1,!1,!1),i.audio.cine("boom"),this.flash("#fff3e0",.35,.04,.05,.6),this.shake=1.4;let d=Qi.copy(this.bhPos).multiplyScalar(.01),f=r.effects;this.nova=new at(new ai(1,48,24),new ve({color:new St(2.4,1.5,.8),transparent:!0,blending:Ee,depthWrite:!1,fog:!1})),this.nova.position.copy(d),this.ring=new at(new pn(1,.025,8,128),new ve({color:new St(o.light).multiplyScalar(5),transparent:!0,blending:Ee,depthWrite:!1,fog:!1})),this.ring.position.copy(d),this.ring.quaternion.copy(this.bh.group.quaternion).multiply(ss.setFromAxisAngle(Es.set(1,0,0),Math.PI/2)),this.group.add(this.nova,this.ring);let p=o.flame,v=Math.round(320*f.mult);for(let m=0;m<v;m++)Sn.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiplyScalar(40+Math.random()*160),f.glow.emit(d.x,d.y,d.z,Sn.x,Sn.y,Sn.z,.8+Math.random()*1.4,2+Math.random()*4,.6+Math.random()*1.5,[p[0]*1.6,p[1]*1.6,p[2]*1.6,1],[1.4,.4,.08,0],.6,0)}if(this.nova){let d=(t-this.tBoom)/.9;this.nova.visible=d<1,d<1&&(this.nova.scale.setScalar(this.bhR*.01*(1+1.6*Wh(d))),this.nova.material.opacity=(1-d)*(1-d));let f=(t-this.tBoom)/1.8;this.ring.visible=f<1,f<1&&(this.ring.scale.setScalar(this.bhR*.01*(2+22*Wh(f))),this.ring.material.opacity=1-f)}let u=Wh(Pi((t-this.tBoom)/2.6));this.bhR=qh+(Vb-qh)*u,this.bh.group.scale.setScalar(this.bhR*.01),this.bh.u.uI.value=.6+u*.4,this.bh.u.uGlow.value=.6+u*.6,t>this.tSuck&&this.updateSuck(t-this.tSuck),this.updateCamera(t,e),this.bh.update(e,this.camera),r.effects.update(e),i.stadium.update(e),t>this.tSpace-.45&&this.once("toSpace")&&(this.flash("#d6ebff",1,.45,.12,1.1),i.audio.cine("whoosh")),t>this.tSpace&&this.once("space")&&this.enterSpace()}updateSuck(t){let e=this.match,i=this.app;if(this.once("suck")){i.audio.cine("drone"),this.debrisMesh.visible=!0,this.loose=[];for(let c of e.players)c!==this.champ&&this.loose.push({obj:c.model.root,p0:c.model.root.position.clone(),q0:c.model.root.quaternion.clone(),t0:.2+Math.random()*1.2,dur:2.4+Math.random(),axis:new S(Math.random()-.5,1,Math.random()-.5).normalize(),spin:3+Math.random()*4,swirl:2+Math.random()*2,lift:15});this.loose.push({obj:e.ball,p0:e.ball.position.clone(),q0:e.ball.quaternion.clone(),t0:.1,dur:2.6,axis:new S(1,0,0),spin:6,swirl:2.5,lift:20});let l=Qi.copy(this.bhPos).multiplyScalar(.01);this.bStart=this.bMats.map((c,h)=>{let u=new S,d=new le,f=new S;c.decompose(u,d,f);let p=u.distanceTo(l);return{pos:u,quat:d,scl:f,t0:.6+p/900*2.6+Math.random()*.5,dur:2.4+Math.random()*1.2,axis:new S(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),spin:.6+Math.random()*1.6,swirl:1+Math.random()*2,hidden:this.roadBlocked.has(h)}})}let n=this.debrisMesh,r=this._tmp||(this._tmp=new S);for(let l=0;l<this.debris.length;l++){let c=this.debris[l],h=Pi((t-c.t0)/c.dur);if(h<=0||h>=1){n.setMatrixAt(l,Ln.makeScale(0,0,0));continue}let u=this.suckPos(c.p0,h,c.swirl,c.lift,r);ss.setFromAxisAngle(c.axis,c.spin*(t-c.t0)),Es.copy(c.size).multiplyScalar(u*Math.min(1,h*8)),n.setMatrixAt(l,Ln.compose(r,ss,Es))}n.instanceMatrix.needsUpdate=!0;for(let l of this.loose){let c=Pi((t-l.t0)/l.dur);if(c<=0)continue;let h=this.suckPos(l.p0,c,l.swirl,l.lift,r);l.obj.position.copy(r),ss.setFromAxisAngle(l.axis,l.spin*(t-l.t0)*c),l.obj.quaternion.copy(l.q0).premultiply(ss),l.obj.scale.setScalar(Math.max(.001,h)),l.obj.visible=c<1}let a=this.cine.buildings;for(let l=0;l<this.bStart.length;l++){let c=this.bStart[l];if(c.hidden)continue;let h=Pi((t-c.t0)/c.dur);if(h<=0)continue;let u=this.suckPos(c.pos,h,c.swirl,0,r);ss.setFromAxisAngle(c.axis,c.spin*(t-c.t0)).multiply(c.quat),Es.copy(c.scl).multiplyScalar(u),a.setMatrixAt(l,Ln.compose(r,ss,Es))}a.instanceMatrix.needsUpdate=!0;let o=Pi((t-2.4)/2.9);if(o>0){let l=this.cine.arena,c=this.suckPos(Es.set(0,0,0),o,1.2,30,r);l.position.copy(r),l.quaternion.setFromAxisAngle(Qi.set(1,0,.4).normalize(),-this.s*1.4*o*o),l.scale.setScalar(.01*Math.max(.001,c)),l.visible=c>.002;for(let h of this.edges)h.visible=!1;this.once("arenaGo")&&i.audio.cine("tear")}}updateCamera(t,e){let i=this.camera,n=this.s,r=this.camPos,a=this.camLook,o=Ks,l=!1;if(t<3.7){let u=t/3.7;r.set(430-120*u,200-30*u,n*(300+380*u)).multiplyScalar(.01);let d=Qi.set(0,380,n*6e3),f=this.frameAt(this.groundLen+this.reveal.value,this.camFrame).p,p=hf(1.2,2.6,t);a.copy(d).lerp(f,p*.85).lerp(this.bhPos,hf(2.7,3.6,t)*.8).multiplyScalar(.01),l=!this.camInit}else if(t<this.tEnd-.3){this.once("chaseCut")&&(l=!0);let u=this.driveDist(t),d=this.frameAt(u-560,this.camFrame);Qi.copy(d.p).addScaledVector(d.U,200),r.copy(Qi).multiplyScalar(.01),a.copy(this.carPos).addScaledVector(this.frame.T,900).addScaledVector(this.frame.U,60).multiplyScalar(.01),o=this.camUpTarget||(this.camUpTarget=new S),o.copy(d.U)}else if(t<this.tSuck){if(this.once("sideCut")){l=!0;let d=this.roadEnd.p,f=Sn.crossVectors(this.roadEnd.T,Ks).normalize();this.sidePos=d.clone().lerp(this.bhPos,.45).addScaledVector(f,6800).add(Qi.set(0,1300,0)).addScaledVector(this.roadEnd.T,-1800),this.sideLook=d.clone().lerp(this.bhPos,.55)}let u=Pi((t-this.tEnd+.3)/(this.tBoom-this.tEnd+.3));r.copy(this.sidePos).lerp(this.sideLook,u*.25),r.addScaledVector(Qi.subVectors(this.sidePos,this.sideLook),1.2*Wh(Pi((t-this.tBoom)/.55))),r.multiplyScalar(.01),a.copy(this.sideLook).multiplyScalar(.01)}else{this.once("wideCut")&&(l=!0);let u=Pi((t-this.tSuck)/(this.tSpace-this.tSuck)),d=Sn.set(0,90,n*170),f=Qi.set(-560,420,n*-260);r.copy(f).sub(d).multiplyScalar(1+1.2*u*u).add(d),r.y+=300*u*u,a.copy(d).lerp(Sn.set(0,140,n*300),u)}l||!this.camInit?(this.camInit=!0,this.camUp.copy(o)):this.camUp.lerp(o,1-Math.exp(-e*6)).normalize(),this.shake=Math.max(0,this.shake-e*.9);let c=t>this.tSuck?.25+.35*Pi((t-this.tSuck)/4):0,h=Math.max(this.shake,c);if(i.position.copy(r),h>0){let u=.006*h*r.distanceTo(a);i.position.x+=(Math.random()-.5)*u,i.position.y+=(Math.random()-.5)*u,i.position.z+=(Math.random()-.5)*u}i.up.copy(this.camUp),i.lookAt(a)}enterSpace(){let t=this.app;this.stage=2,this.hideStadiumBits(),t.audio.stopEngine(this.engine);let e={flash:(i,n,r,a,o)=>this.flash(i,n,r,a,o),text:()=>this.caption(`${this.team===0?"BLUE":"ORANGE"} WINS!`,"...and blew up the universe","final "+(this.team===0?"blue":"orange")),sound:i=>t.audio.cine(i),shake:i=>{this.space.shakeAmt=Math.max(this.space.shakeAmt,i)}};this.space=new Gh(t.gfx.renderer,this.quality,e),this.view.camera=this.space.camera,this.view.hfov=80,t.gfx.overrideScene=this.space.scene,t.gfx.setViews([this.view]),t.audio.cine("space")}updateSpace(t,e){let i=this.space;i.update(e);let n=80*(i.fov/55);Math.abs(n-this.view.hfov)>.5&&(this.view.hfov=n,this.app.gfx.updateCameras()),i.done&&this.finish(!1)}hideStadiumBits(){this.debrisMesh.visible=!1;for(let t of this.edges)t.visible=!1}finish(t){if(this.done)return;this.done=!0,this.app.audio.cine("stop"),this.restore(),this.overlay.classList.add("out"),this.fill.style.transition=`opacity ${t?.35:1.2}s ease`,this.fill.style.background="#fff",this.fill.style.opacity=t?"0.6":"1",requestAnimationFrame(()=>{this.fill.style.opacity="0"});let e=this.overlay;setTimeout(()=>e.remove(),t?600:1800),this.textEl.className="cine-text"}restore(){let t=this.app,e=this.match;this.bloomWas&&t.gfx.bloom&&Object.assign(t.gfx.bloom,this.bloomWas),t.gfx.overrideScene=null,this.space&&(this.space.dispose(),this.space=null),this.cine.reset();let i=this.cine.buildings;this.bMats.forEach((n,r)=>i.setMatrixAt(r,n)),i.instanceMatrix.needsUpdate=!0;for(let n of this.edges)n.parent.remove(n),n.traverse(r=>{r.geometry&&r.geometry.dispose()});this.edgeMat.dispose();for(let n of e.players)n.model.root.scale.setScalar(1),n.model.root.visible=!0;e.ball.scale.setScalar(1),e.ball.visible=this.ballWasVisible,e.effects.clear(),this.group.parent.remove(this.group),this.group.traverse(n=>{if(n.geometry&&n.geometry.dispose(),n.material){let r=Array.isArray(n.material)?n.material:[n.material];for(let a of r)a.map&&a.map.dispose(),a.emissiveMap&&a.emissiveMap.dispose(),a.dispose()}}),this.bh.dispose(),t.audio.stopEngine(this.engine)}dispose(){this.done||(this.done=!0,this.app.audio.cine("stop"),this.restore()),this.overlay.remove()}};var qb=["Atlas","Blitz","Comet","Dash","Echo","Flare","Ghost","Havoc","Jinx","Nova","Rex","Zippy","Vortex","Turbo"],Xb=6,ll=60,Ta=null;function Yb(){Ta||(Ta=Zm(1024));let s=new Qt({map:Ta.map,emissive:16777215,emissiveMap:Ta.emissiveMap,emissiveIntensity:2.4,roughness:1,roughnessMap:Ta.roughnessMap,metalness:.65,bumpMap:Ta.bumpMap,bumpScale:1.2}),t=new at(new ai(De.radius*.01,64,40),s);return t.castShadow=!0,t}var Dn=new S,Nn=new le,Un=new S,Aa=new le;function Zb(s){return!s||s.type==="any"?"RB / F":s.type==="pad"?"RB":s.layout==="p2"?"H":"F"}function ff(s){for(let t=s.length-1;t>0;t--){let e=Math.floor(Math.random()*(t+1));[s[t],s[e]]=[s[e],s[t]]}return s}var cl=class s{constructor(t,e){this.app=t,this.cfg=e,this.attract=e.mode==="attract",this.world=new Ah,this.group=new Me,t.gfx.scene.add(this.group),this.effects=new Bh(this.group,t.settings.quality),this.tireMarks=new ol(this.group,t.settings.quality==="low"?900:2400,t.settings.quality==="high"?.075:.02),this.ball=Yb(),this.group.add(this.ball),t.settings.quality==="low"&&(this.ballBlob=this.addBlob(1.7,1.7)),this.players=[];let i=ff(qb.slice()),n=ff([7,9,11,17,21,24,33,42,55,73,88,99]);for(let o of[0,1]){let l=e.humans.filter(c=>c.team===o);for(let c=0;c<e.teamSize;c++){let h=l[c],u=this.world.addCar(new Ih(o,h?h.name:i.pop()));u.handling=t.settings.handling==="realistic"?"realistic":"easy";let d=new Uh(o,n.pop());this.group.add(d.root),t.settings.quality==="low"&&(d.blob=this.addBlob(1.6,2.2));let f={car:u,model:d,human:!!h,device:h?h.device:null,bot:h?null:new Dh(u,e.difficulty),name:u.name};this.players.push(f)}}this.humans=this.players.filter(o=>o.human),this.gameMode=e.gameMode||"soccar";let r=!e.items||e.items==="all"?ha:[e.items];this.world.mode=wm(this.world,this.gameMode,r),this.modeFx=this.world.mode?new Oh(this.group,this.effects,this.world.mode):null,t.input.rbIsItem=this.gameMode==="rumble",this.views=[];let a=this.humans.length;if(this.attract||a===0){let o=new ii(60,1,.1,3e3);this.views.push({camera:o,rect:[0,0,1,1],hfov:90,rig:new _a(o)})}else this.humans.forEach((o,l)=>{let c=new ii(70,1,.05,3e3),h=[0,0,1,1];a===2&&(h=e.split==="vertical"?[l*.5,0,.5,1]:[0,l*.5,1,.5]);let u=new _a(c);u.ballCam=t.settings.ballCam,a===2&&e.split!=="vertical"&&(u.distance=310,u.height=120);let d={camera:c,rect:h,hfov:t.settings.fov,rig:u,player:o,label:o.name,team:o.car.team};o.view=d,o.viewIndex=l,this.views.push(d)});this.replayCam=new ii(55,1,.1,3e3),this.replayRig=new _a(this.replayCam),this.replayView={camera:this.replayCam,rect:[0,0,1,1],hfov:80},t.gfx.setViews(this.views),this.attract?this.engines=[]:(t.hud.setup(this.views),t.hud.show(!0),this.engines=this.humans.map((o,l)=>t.audio.createEngine(a===2&&e.split==="vertical"?l===0?-.5:.5:0))),this.scores=[0,0],this.clock=e.duration||0,this.unlimited=!e.duration,this.overtime=!1,this.state="countdown",this.stateT=0,this.acc=0,this.pred=[],this.predFrame=0,this.threat=-1,this.frame=0,this.time=0,this.snapSize=9+13*this.players.length,this.snapCount=Xb*ll,this.snaps=new Float32Array(this.snapSize*this.snapCount),this.snapHead=0,this.snapFilled=0,this.stepIndex=0,this.fakeCars=this.players.map(o=>({team:o.car.team,vel:new S,boosting:!1,supersonic:!1,demolished:!1,steerVisual:0,wheelSpin:0,wheelDist:[17,17,17,17],onGround:!0})),this.kickoff()}addBlob(t,e){if(!s.blobTex){let n=document.createElement("canvas");n.width=n.height=64;let r=n.getContext("2d"),a=r.createRadialGradient(32,32,0,32,32,32);a.addColorStop(0,"rgba(0,0,0,0.55)"),a.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=a,r.fillRect(0,0,64,64),s.blobTex=new gi(n)}let i=new at(new ti(t,e),new ve({map:s.blobTex,transparent:!0,depthWrite:!1}));return i.rotation.x=-Math.PI/2,i.renderOrder=1,this.group.add(i),i}placeBlob(t,e,i,n){if(!t)return;let r=e.y-n;t.visible=r<600,t.position.set(e.x*.01,.03,e.z*.01);let a=Math.max(.4,1-r/800);t.scale.setScalar(a),t.material.opacity=a,i&&(t.rotation.z=Math.atan2(2*(i.w*i.y+i.x*i.z),1-2*(i.y*i.y+i.z*i.z)))}dispose(){this.cine&&(this.cine.dispose(),this.cine=null),this.app.gfx.scene.remove(this.group),this.group.traverse(t=>{if(t.geometry&&!t.geometry.userData.shared&&t.geometry.dispose(),t.material&&t.material!==this.ball.material){let e=Array.isArray(t.material)?t.material:[t.material];for(let i of e)i.dispose()}}),this.app.audio.stopEngines(),this.app.input.rbIsItem=!1}kickoff(){let t=this.world;t.ball.reset(),t.resetPads(),this.ball.visible=!0;let e=ff([0,1,2,3,4]);for(let i of[0,1]){let n=this.players.filter(a=>a.car.team===i),r=i===0?1:-1;n.forEach((a,o)=>{let l=ym[e[o%5]];a.car.place(l[0]*r,l[1]*r,i===0?l[2]:l[2]+Math.PI),a.car.frozen=!0,a.car.input.jump=!1,a.car.prevJump=!1})}for(let i of this.views)i.rig&&i.rig.snap();this.world.mode&&this.world.mode.reset(),this.state="countdown",this.stateT=this.attract?1.2:3,this.lastBeep=4,this.threat=-1,this.acc=0,this.attract||this.app.hud.hideBanner()}startPlay(){this.state="playing";for(let t of this.players)t.car.frozen=!1;this.world.ball.frozen=!1,this.attract||(this.app.hud.showBanner("GO!","","go",.8),this.app.audio.beep(!0))}scored(t){let e=1-t,n=this.world.ball;this.scores[e]++;let r=n.lastTouch,a=n.prevTouch,o=r&&r.team===e?r:a&&a.team===e?a:null,l=o&&a&&a!==o&&a.team===e&&r===o?a:null;o&&(o.stats.goals++,o.stats.score+=100),l&&(l.stats.assists++,l.stats.score+=50);let c=n.pos.clone();this.goalTime=this.time,this.goalTeam=e,this.goalOf=t,this.effects.explosion(c,e,!0),this.app.stadium.goalFlash(t),this.app.stadium.cheer(1);for(let h of this.players){let u=h.car;if(u.demolished)continue;let d=u.pos.distanceTo(c);if(d<2600){let f=u.pos.clone().sub(c).setY(0).normalize().multiplyScalar((1-d/2600)*1800);u.vel.add(f),u.vel.y+=(1-d/2600)*700,u.noGround=.15,u.onGround=!1}}n.frozen=!0,n.vel.set(0,0,0),this.ball.visible=!1;for(let h of this.views)h.rig&&h.rig.addShake(1);if(!this.attract){this.app.audio.goal();for(let d of this.humans)this.app.input.rumble(d.device,1,1,700);let h=Ie[e],u=o?o.name:e===0?"Blue":"Orange";this.app.hud.showBanner("GOAL!",o?`${u} scored${l?" \u2022 assist: "+l.name:""}`:"Own goal",e===0?"blue":"orange",2.6),this.app.hud.addFeed(`<b style="color:${h.css}">${u}</b> scored!`,e)}this.state="goal",this.stateT=2.8,this.endAfterGoal=this.overtime||!this.unlimited&&this.clock<=0}startReplay(){if(this.attract||this.snapFilled<ll*2||!this.app.settings.replays){this.afterReplay();return}this.state="replay";let t=this.snapFilled/ll,e=this.time-this.goalTime;this.replayEnd=Math.max(0,e-.35),this.replayStart=Math.min(t-.05,e+4.2),this.replayT=this.replayStart,this.replayExploded=!1,this.app.gfx.setViews([this.replayView]),this.replayRig.snap(),this.app.hud.setup([]),this.app.hud.showBanner("REPLAY","Press A / Space to skip","replay",99),this.ball.visible=!0,this.effects.clear()}afterReplay(){if(this.state==="replay"&&(this.app.gfx.setViews(this.views),this.app.hud.setup(this.views),this.app.hud.hideBanner()),this.endAfterGoal){this.finish();return}this.kickoff()}finish(){this.state="over",this.stateT=3;for(let i of this.players)i.car.frozen=!0,i.car.boosting=!1;this.world.ball.frozen=!0;let t=this.scores[0]>this.scores[1]?0:1;this.winner=t,this.app.audio.horn(),this.app.stadium.cheer(.8),this.app.hud.showBanner(t===0?"BLUE WINS!":"ORANGE WINS!",`${this.scores[0]} - ${this.scores[1]}`,t===0?"blue":"orange",99);let e=this.humans.filter(i=>i.car.team===t).sort((i,n)=>n.car.stats.score-i.car.stats.score)[0];e&&this.app.settings.victoryFx!==!1&&(this.app.hud.hideBanner(),this.effects.clear(),this.state="victory",this.cine=new Yh(this,e,t))}endVictory(){this.cine&&(this.cine.dispose(),this.cine=null),this.app.gfx.setViews(this.views),this.app.hud.setup(this.views),this.app.hud.show(!0),this.app.hud.showBanner(this.winner===0?"BLUE WINS!":"ORANGE WINS!",`${this.scores[0]} - ${this.scores[1]}`,this.winner===0?"blue":"orange",99),this.state="over",this.stateT=0}results(){let t=this.players.map(i=>({name:i.name,team:i.car.team,human:i.human,...i.car.stats}));t.sort((i,n)=>n.score-i.score);let e=t.filter(i=>i.team===this.winner).sort((i,n)=>n.score-i.score)[0];return{scores:this.scores.slice(),winner:this.winner,rows:t,mvp:e?e.name:""}}update(t){t=Math.min(t,.1),this.time+=t,this.frame++;let e=this.app,i=e.input,n=!1;for(let a of this.humans){let o=i.controls(a.device);if(a.controls=o,o.pause&&this.state==="victory")n=!0;else if(o.pause&&this.state!=="over"&&e.frames!==e.resumeFrame){e.pauseMatch(a);return}o.skip&&(n=!0),o.ballCam&&a.view&&(a.view.rig.ballCam=!a.view.rig.ballCam,e.hud.viewStatus(a.viewIndex,a.view.rig.ballCam?"BALL CAM":"CAR CAM"));let l=a.car.input;l.throttle=o.throttle,l.pitch=o.pitch,l.yaw=o.yaw,l.roll=o.roll,l.jump=o.jump,l.boost=o.boost,l.powerslide=o.powerslide,l.steer=this.shapeSteer(a,o,t),l.useItem=!!o.itemDown}if(this.state==="victory"){this.cine.update(t,n)||this.endVictory();return}(this.frame%3===0||this.pred.length===0)&&(Wd(this.world.ball,3.5,1/60,this.pred),this.threat=this.goalIn(this.pred));let r=this.world.ball.lastTouch===null&&this.state==="playing";for(let a of this.players)a.bot&&a.bot.update(t,{world:this.world,pred:this.pred,time:this.world.time,kickoff:r,rumble:this.gameMode==="rumble"?this.world.mode:null,teammates:this.players.filter(o=>o.car.team===a.car.team).map(o=>o.car),opponents:this.players.filter(o=>o.car.team!==a.car.team).map(o=>o.car)});switch(this.state){case"countdown":{this.stateT-=t;let a=Math.ceil(this.stateT);!this.attract&&a<this.lastBeep&&a>0&&(this.lastBeep=a,e.hud.showBanner(String(a),this.overtime?"OVERTIME":"","count",1),e.audio.beep(!1)),this.stateT<=0&&this.startPlay();break}case"playing":this.unlimited||(this.overtime?this.clock+=t:this.clock>0&&(this.clock=Math.max(0,this.clock-t)));break;case"goal":this.stateT-=t,this.stateT<=0&&this.startReplay();break;case"replay":this.replayT-=t,(n||this.replayT<=this.replayEnd)&&this.afterReplay();break;case"over":this.stateT-=t,this.stateT<=0&&!this.resultsShown&&(this.resultsShown=!0,e.showResults(this.results()));break;default:break}if(this.state==="replay"){this.renderReplay(t);return}{this.acc+=t;let a=0;for(;this.acc>=jo&&a<12;)if(this.world.step(jo),this.acc-=jo,a++,this.stepIndex++%(120/ll)===0&&this.recordSnap(),this.state==="playing"){let o=this.world.ball.goalState();if(o>=0){this.scored(o);break}}a>=12&&(this.acc=0)}if(this.state==="playing"&&!this.unlimited&&!this.overtime&&this.clock<=0){let a=this.world.ball;(a.pos.y<De.radius+25||a.frozen)&&(this.scores[0]===this.scores[1]?(this.overtime=!0,this.clock=0,e.hud.showBanner("OVERTIME","Next goal wins","ot",2.5),e.audio.horn(),this.kickoff(),this.stateT=4):this.finish())}this.processEvents(),this.renderFrame(t)}shapeSteer(t,e,i){let n=e.steer;if(this.app.settings.handling==="realistic")return t.steerS=n,n;if(e.digitalSteer){let r=t.steerS||0,o=Math.sign(n)!==Math.sign(r)||Math.abs(n)<Math.abs(r)?14:6;t.steerS=r+Math.max(-o*i,Math.min(o*i,n-r))}else t.steerS=Math.sign(n)*Math.pow(Math.abs(n),1.5);return t.steerS}clockText(){if(this.unlimited)return"\u221E";let t=Math.max(0,this.overtime?Math.floor(this.clock):Math.ceil(this.clock));return`${this.overtime?"+":""}${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}goalIn(t){for(let e of t)if(Math.abs(e.pos.x)<Ut.goalHalfW&&e.pos.y<Ut.goalH){if(e.pos.z>Ut.halfZ+De.radius)return 1;if(e.pos.z<-Ut.halfZ-De.radius)return 0}return-1}processEvents(){let t=this.app,e=this.world.events,i=this.humans.map(r=>r.car),n=r=>{if(!r||i.length===0)return .6;let a=1/0;for(let o of i)a=Math.min(a,o.pos.distanceTo(r));return Math.max(.15,1-a/7e3)};for(let r of e){let a=r.car?this.humans.find(o=>o.car===r.car):null;switch(r.type){case"ballHit":r.strength>350&&this.effects.hit(r.point,r.strength),this.attract||(r.strength>250&&t.audio.hit(r.strength*n(r.point)),a&&(t.input.rumble(a.device,Math.min(1,r.strength/2500),.4,120),r.strength>1500&&a.view.rig.addShake(Math.min(.45,r.strength/7e3))),this.onTouch(r.car,a));break;case"bounce":!this.attract&&r.strength>400&&t.audio.bounce(r.strength*n(r.point));break;case"jump":a&&t.audio.jump();break;case"dodge":a&&t.audio.dodge();break;case"land":a&&(t.audio.land(r.strength),t.input.rumble(a.device,.15,.2,60));break;case"bump":if(!this.attract){t.audio.bump();let o=this.humans.find(l=>l.car===r.by);a&&t.input.rumble(a.device,.7,.5,200),o&&t.input.rumble(o.device,.4,.3,120)}break;case"demo":if(this.effects.demolition(r.point,r.car.team),r.by.stats.score+=25,!this.attract){t.audio.demo();for(let l of this.humans){let c=l.car.pos.distanceTo(r.point);c<3e3&&l.view&&l.view.rig.addShake(l.car===r.car||l.car===r.by?.9:.6*(1-c/3e3))}t.hud.addFeed(`<b style="color:${Ie[r.by.team].css}">${r.by.name}</b> \u{1F4A5} <b style="color:${Ie[r.car.team].css}">${r.car.name}</b>`),a&&(t.input.rumble(a.device,1,1,450),t.hud.viewCenter(a.viewIndex,"DEMOLISHED",2.8));let o=this.humans.find(l=>l.car===r.by);o&&(t.input.rumble(o.device,.6,.6,200),t.hud.viewCenter(o.viewIndex,"DEMOLITION!",1.5))}break;case"itemGet":a&&(t.audio.itemGet(),t.input.rumble(a.device,.15,.3,90));break;case"itemUse":this.attract||t.audio.itemUse(r.item,n(r.car.pos)),r.item==="freezer"&&this.effects.flash(this.ball.position.clone(),10477823,2.6,.35,2.5),r.item==="curveball"&&this.effects.ring(this.ball.position.clone(),Ie[r.car.team].light,5,.5);break;case"itemFail":a&&t.hud.viewStatus(a.viewIndex,r.item==="boot"?"NO OPPONENT IN RANGE":"BALL OUT OF RANGE",1.2);break;case"hooked":this.attract||t.audio.hook(n(r.point));break;case"boot":this.effects.flash(r.point.clone().multiplyScalar(.01),16765056,2.2,.3,2.5),this.effects.hit(r.point,2600),this.attract||(t.audio.bump(),t.hud.addFeed(`<b style="color:${Ie[r.by.team].css}">${r.by.name}</b> \u{1F462} <b style="color:${Ie[r.car.team].css}">${r.car.name}</b>`),a&&(t.input.rumble(a.device,.9,.7,300),t.hud.viewCenter(a.viewIndex,"BOOTED!",1.4)));break;case"heatseekFlip":this.effects.hit(r.point,2200);break;case"boostPickup":this.effects.boostPickup(r.pad),a&&(t.audio.boostPickup(r.big),r.big&&t.input.rumble(a.device,.1,.3,80));break;default:break}}e.length=0}onTouch(t,e){if(this.state!=="playing"||this.world.time-(t.lastShotCheck||-10)<.4)return;t.lastShotCheck=this.world.time;let i=this.threat,n=this._shotBuf||(this._shotBuf=[]);Wd(this.world.ball,3,1/40,n);let r=this.goalIn(n);this.threat=r,i===t.team&&r!==t.team&&(t.stats.saves++,t.stats.score+=50,this.app.hud.addFeed(`<b style="color:${Ie[t.team].css}">${t.name}</b> made a save!`),e&&this.app.hud.viewCenter(e.viewIndex,"SAVE!",1.5)),r===1-t.team&&i!==r&&(t.stats.shots++,t.stats.score+=20,this.app.audio.cheer(.35),e&&this.app.hud.viewCenter(e.viewIndex,"SHOT ON GOAL",1.2))}recordSnap(){let t=this.snapHead*this.snapSize,e=this.snaps,i=this.world.ball;e[t]=this.time,e[t+1]=i.pos.x,e[t+2]=i.pos.y,e[t+3]=i.pos.z,e[t+4]=i.quat.x,e[t+5]=i.quat.y,e[t+6]=i.quat.z,e[t+7]=i.quat.w,e[t+8]=this.ball.visible?1:0;let n=t+9;for(let r of this.players){let a=r.car;e[n]=a.pos.x,e[n+1]=a.pos.y,e[n+2]=a.pos.z,e[n+3]=a.quat.x,e[n+4]=a.quat.y,e[n+5]=a.quat.z,e[n+6]=a.quat.w,e[n+7]=a.vel.x,e[n+8]=a.vel.y,e[n+9]=a.vel.z,e[n+10]=(a.boosting?1:0)|(a.supersonic?2:0)|(a.demolished?4:0)|(a.onGround?8:0),e[n+11]=a.steerVisual,e[n+12]=a.wheelSpin,n+=13}this.snapHead=(this.snapHead+1)%this.snapCount,this.snapFilled=Math.min(this.snapCount,this.snapFilled+1)}snapAt(t){let e=Math.min(this.snapFilled-1,Math.max(0,t*ll)),i=Math.floor(e),n=e-i,r=(this.snapHead-1-i+this.snapCount*2)%this.snapCount,a=(r-1+this.snapCount)%this.snapCount;return{a:r*this.snapSize,b:a*this.snapSize,t:n}}renderReplay(t){let{a:e,b:i,t:n}=this.snapAt(this.replayT),r=this.snaps,a=l=>r[e+l]+(r[i+l]-r[e+l])*n;Un.set(a(1),a(2),a(3)),Aa.set(r[e+4],r[e+5],r[e+6],r[e+7]),this.ball.position.copy(Un).multiplyScalar(.01),this.ball.quaternion.copy(Aa),this.ball.visible=r[e+8]>.5;let o=9;this.players.forEach((l,c)=>{let h=this.fakeCars[c];Dn.set(a(o),a(o+1),a(o+2)),Nn.set(r[e+o+3],r[e+o+4],r[e+o+5],r[e+o+6]),Aa.set(r[i+o+3],r[i+o+4],r[i+o+5],r[i+o+6]),Nn.slerp(Aa,n),h.vel.set(r[e+o+7],r[e+o+8],r[e+o+9]);let u=r[e+o+10];h.boosting=!!(u&1),h.supersonic=!!(u&2),h.demolished=!!(u&4),h.steerVisual=r[e+o+11],h.wheelSpin=r[e+o+12],l.model.update(h,Dn,Nn,t),this.effects.carTrail(h,Dn,Nn,t),o+=13}),!this.replayExploded&&this.ball.visible===!1&&(this.replayExploded=!0,this.effects.explosion(Un,this.goalTeam,!0)),this.replayRig.updateReplay(t,Un,this.goalOf===1?Ut.halfZ:-Ut.halfZ,this.replayT),this.effects.update(t),this.app.stadium.update(t),this.app.hud.update(t),this.app.gfx.render()}renderFrame(t){let e=this.app,i=this.acc/jo,n=this.world.ball;Un.lerpVectors(n.prevPos,n.pos,i),Aa.slerpQuaternions(n.prevQuat,n.quat,i),this.ball.position.copy(Un).multiplyScalar(.01),this.ball.quaternion.copy(Aa),this.ball.visible&&this.effects.ballTrail(n,Un),this.placeBlob(this.ballBlob,Un,null,De.radius),this.ballBlob&&(this.ballBlob.visible=this.ballBlob.visible&&this.ball.visible);let r=[];for(let o of this.players){let l=o.car;Dn.lerpVectors(l.prevPos,l.pos,i),Nn.slerpQuaternions(l.prevQuat,l.quat,i),o.ipos=(o.ipos||new S).copy(Dn),o.iquat=(o.iquat||new le).copy(Nn),o.model.update(l,Dn,Nn,t),this.placeBlob(o.model.blob,Dn,Nn,17);let c=this.state==="replay"?0:ol.skid(l);this.tireMarks.update(l,Dn,Nn,c),this.effects.dirt(l,Dn,Nn,c,t),o.model.blob&&(o.model.blob.visible=o.model.blob.visible&&!l.demolished),this.effects.carTrail(l,Dn,Nn,t),r.push({car:l,pos:o.ipos,name:o.name})}if(this.attract){let o=this.views[0],l=this.time*.05,c=o.camera,h=62;c.position.set(Math.cos(l)*h*.62,13+Math.sin(l*.7)*4,Math.sin(l)*h*.8),c.up.set(0,1,0);let u=Dn.copy(Un).multiplyScalar(.01*.6);c.lookAt(u.x,2,u.z)}else{for(let o of this.humans){let l=o.view,c=o.controls||{};l.rig.update(t,o.car,o.ipos,o.iquat,this.ball.visible?Un:null,c.lookX||0,c.lookY||0),e.hud.setBoost(o.viewIndex,o.car.boost),this.gameMode==="rumble"&&e.hud.setItem(o.viewIndex,this.world.mode.status(o.car),Qo,Zb(o.device)),e.hud.updatePlates(o.viewIndex,l.camera,r,o.car)}this.humans.forEach((o,l)=>{let c=o.car;e.audio.updateEngine(this.engines[l],c.vel.length(),c.input.throttle,c.boosting,c.onGround,!c.demolished&&!c.frozen)}),e.hud.setScore(this.scores[0],this.scores[1]),e.hud.setClock(this.clock,this.overtime,this.unlimited),e.hud.update(t)}this.modeFx&&this.modeFx.update(t,this.players,this.ball,Un),this.tireMarks.flush();let a=this.state==="goal";a&&this.stateT>1.2&&this.effects.pyro(e.stadium.pyroPoints[this.goalOf],this.goalTeam,t),e.stadium.setScreens(this.scores[0],this.scores[1],this.clockText(),a?this.goalTeam===0?"blue":"orange":null),this.effects.update(t),e.stadium.update(t),e.gfx.render()}renderPaused(){this.app.gfx.render()}};var Ra={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var hn=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},$b=new $n(-1,1,1,-1,0,1),pf=class extends ye{constructor(){super(),this.setAttribute("position",new se([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new se([0,2,0,0,2,0],2))}},Jb=new pf,js=class{constructor(t){this._mesh=new at(Jb,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,$b)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var Zh=class extends hn{constructor(t,e="tDiffuse"){super(),this.textureID=e,this.uniforms=null,this.material=null,t instanceof ue?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=Ms.clone(t.uniforms),this.material=new ue({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new js(this.material)}render(t,e,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var hl=class extends hn{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,i){let n=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(n.REPLACE,n.REPLACE,n.REPLACE),r.buffers.stencil.setFunc(n.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),t.setRenderTarget(i),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(n.EQUAL,1,4294967295),r.buffers.stencil.setOp(n.KEEP,n.KEEP,n.KEEP),r.buffers.stencil.setLocked(!0)}},$h=class extends hn{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var Jh=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let i=t.getSize(new st);this._width=i.width,this._height=i.height,e=new Qe(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:hi}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Zh(Ra),this.copyPass.material.blending=mn,this.timer=new No}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){this.timer.update(),t===void 0&&(t=this.timer.getDelta());let e=this.renderer.getRenderTarget(),i=!1;for(let n=0,r=this.passes.length;n<r;n++){let a=this.passes[n];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(n),a.render(this.renderer,this.writeBuffer,this.readBuffer,t,i),a.needsSwap){if(i){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}hl!==void 0&&(a instanceof hl?i=!0:a instanceof $h&&(i=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new st);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let i=this._width*this._pixelRatio,n=this._height*this._pixelRatio;this.renderTarget1.setSize(i,n),this.renderTarget2.setSize(i,n);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(i,n)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var g0={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new St(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var Ca=class s extends hn{constructor(t,e=1,i,n){super(),this.strength=e,this.radius=i,this.threshold=n,this.resolution=t!==void 0?new st(t.x,t.y):new st(256,256),this.clearColor=new St(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Qe(r,a,{type:hi,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new Qe(r,a,{type:hi,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let d=new Qe(r,a,{type:hi,depthBuffer:!1});d.texture.name="UnrealBloomPass.v"+h,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),a=Math.round(a/2)}let o=g0;this.highPassUniforms=Ms.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=n,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new ue({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new st(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new S(1,1,1),new S(1,1,1),new S(1,1,1),new S(1,1,1),new S(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Ms.clone(Ra.uniforms),this.blendMaterial=new ue({uniforms:this.copyUniforms,vertexShader:Ra.vertexShader,fragmentShader:Ra.fragmentShader,premultipliedAlpha:!0,blending:Ee,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new St,this._oldClearAlpha=1,this._basic=new ve,this._fsQuad=new js(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(t,e){let i=Math.round(t/2),n=Math.round(e/2);this.renderTargetBright.setSize(i,n);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(i,n),this.renderTargetsVertical[r].setSize(i,n),this.separableBlurMaterials[r].uniforms.invSize.value=new st(1/i,1/n),i=Math.round(i/2),n=Math.round(n/2)}render(t,e,i,n,r){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let a=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this._fsQuad.render(t),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(i),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=a}_getSeparableBlurMaterial(t){let e=[],i=t/3;for(let a=0;a<t;a++)e.push(.39894*Math.exp(-.5*a*a/(i*i))/i);let n=[],r=[];for(let a=1;a<t;a+=2){let o=e[a],l=a+1<t?e[a+1]:0,c=o+l;n.push((a*o+(a+1)*l)/c),r.push(c)}return new ue({defines:{KERNEL_PAIRS:n.length},uniforms:{colorTexture:{value:null},invSize:{value:new st(.5,.5)},direction:{value:new st(.5,.5)},centerWeight:{value:e[0]},gaussianOffsets:{value:n},gaussianWeights:{value:r}},vertexShader:`

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

				}`})}_getCompositeMaterial(t){return new ue({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

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

				}`})}};Ca.BlurDirectionX=new st(1,0);Ca.BlurDirectionY=new st(0,1);var ul={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};var Kh=class extends hn{constructor(){super(),this.isOutputPass=!0,this.uniforms=Ms.clone(ul.uniforms),this.material=new ta({name:ul.name,uniforms:this.uniforms,vertexShader:ul.vertexShader,fragmentShader:ul.fragmentShader}),this._fsQuad=new js(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},ge.getTransfer(this._outputColorSpace)===Ce&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Uo?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Fo?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Bo?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===lr?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Ho?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===zo?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Oo&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var mf=class extends hn{constructor(t){super(),this.owner=t,this.needsSwap=!1}render(t,e,i){let n=this.renderToScreen?null:i;this.owner.renderViews(n)}},jh=class{constructor(t,e){this.quality=e,this.container=t;let i=new vh({antialias:e!=="low",powerPreference:"high-performance",stencil:!1});if(i.toneMapping=lr,i.toneMappingExposure=1,i.outputColorSpace=We,i.shadowMap.enabled=e!=="low",i.shadowMap.type=ar,i.autoClear=!1,i.localClippingEnabled=!0,t.appendChild(i.domElement),this.renderer=i,this.scene=new Wn,this.overrideScene=null,this.views=[],this.pixelRatio=Math.min(window.devicePixelRatio||1,e==="high"?1.75:e==="medium"?1.25:1),i.setPixelRatio(this.pixelRatio),e!=="low"){let n=new Qe(1,1,{type:hi,samples:e==="high"?4:0});this.composer=new Jh(i,n),this.composer.addPass(new mf(this)),this.bloom=new Ca(new st(256,256),.5,.35,.92),this.composer.addPass(this.bloom),this.composer.addPass(new Kh)}this.resize(),this.onResize=()=>this.resize(),window.addEventListener("resize",this.onResize)}setExposure(t){this.renderer.toneMappingExposure=t}setViews(t){this.views=t,this.updateCameras()}resize(){let t=window.innerWidth,e=window.innerHeight;this.width=t,this.height=e,this.renderer.setSize(t,e),this.composer&&(this.composer.setPixelRatio(this.pixelRatio),this.composer.setSize(t,e)),this.updateCameras()}updateCameras(){for(let t of this.views){let e=t.rect[2]*this.width/Math.max(1,t.rect[3]*this.height),i=we.degToRad(t.hfov||100),n=we.radToDeg(2*Math.atan(Math.tan(i/2)/e));n=we.clamp(n,47,78),t.camera.fov=n,t.camera.aspect=e,t.camera.updateProjectionMatrix()}}renderViews(t){let e=this.renderer;e.setRenderTarget(t),e.setClearColor(0,1),e.clear(!0,!0,!1);let i=t?t.width:this.width*this.pixelRatio,n=t?t.height:this.height*this.pixelRatio,r=t?1:1/this.pixelRatio;for(let a of this.views){let o=Math.round(a.rect[0]*i),l=Math.round(a.rect[2]*i),c=Math.round(a.rect[3]*n),h=Math.round((1-a.rect[1]-a.rect[3])*n);t?(t.viewport.set(o,h,l,c),t.scissor.set(o,h,l,c),t.scissorTest=!0,e.setRenderTarget(t)):(e.setViewport(o*r,h*r,l*r,c*r),e.setScissor(o*r,h*r,l*r,c*r),e.setScissorTest(!0)),e.render(this.overrideScene||this.scene,a.camera)}t?(t.viewport.set(0,0,t.width,t.height),t.scissor.set(0,0,t.width,t.height),t.scissorTest=!1,e.setRenderTarget(t)):(e.setViewport(0,0,this.width,this.height),e.setScissorTest(!1))}render(){this.composer?this.composer.render():this.renderViews(null)}dispose(){window.removeEventListener("resize",this.onResize),this.composer&&this.composer.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}};function x0(s,t=!1){let e=s[0].index!==null,i=new Set(Object.keys(s[0].attributes)),n=new Set(Object.keys(s[0].morphAttributes)),r={},a={},o=s[0].morphTargetsRelative,l=new ye,c=0;for(let h=0;h<s.length;++h){let u=s[h],d=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in u.attributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),d++}if(d!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in u.morphAttributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;a[f]===void 0&&(a[f]=[]),a[f].push(u.morphAttributes[f])}if(t){let f;if(e)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(e){let h=0,u=[];for(let d=0;d<s.length;++d){let f=s[d].index;for(let p=0;p<f.count;++p)u.push(f.getX(p)+h);h+=s[d].attributes.position.count}l.setIndex(u)}for(let h in r){let u=v0(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in a){let u=a[h][0].length;if(u!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){let f=[];for(let v=0;v<a[h].length;++v)f.push(a[h][v][d]);let p=v0(f);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(p)}}}return l}function v0(s){let t,e,i,n=-1,r=0;for(let c=0;c<s.length;++c){let h=s[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(n===-1&&(n=h.gpuType),n!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}let a=new t(r),o=new Se(a,e,i),l=0;for(let c=0;c<s.length;++c){let h=s[c];if(h.isInterleavedBufferAttribute){let u=l/e;for(let d=0,f=h.count;d<f;d++)for(let p=0;p<e;p++){let v=h.getComponent(d,p);o.setComponent(d+u,p,v)}}else a.set(h.array,l);l+=h.count*e}return n!==void 0&&(o.gpuType=n),o}var{halfX:Qh,halfZ:Ii,height:gf,rampR:Ei,goalHalfW:Li,goalH:ri,goalDepth:ki}=Ut,y0={night:{skyTop:132623,skyHorizon:1781594,skyBottom:263949,sunDir:[.25,.75,-.6],sunColor:10467583,sunGlow:0,stars:1,hemiSky:10467583,hemiGround:2042392,hemi:.75,key:15134463,keyI:2.4,keyDir:[.35,1,.25],fog:726320,fogDensity:.0011,envI:.75,exposure:1.05,winLit:.55,bldg:461330},sunset:{skyTop:2112120,skyHorizon:16754282,skyBottom:2759200,sunDir:[.78,.07,.62],sunColor:16756848,sunGlow:1,stars:0,hemiSky:16767416,hemiGround:2892055,hemi:.85,key:16760970,keyI:3.2,keyDir:[.75,.32,.58],fog:11565672,fogDensity:.0012,envI:.9,exposure:1,winLit:.3,bldg:1709600}};function _0(s){return new ue({side:yi,depthWrite:!1,fog:!1,uniforms:{uTop:{value:new St(s.skyTop)},uHorizon:{value:new St(s.skyHorizon)},uBottom:{value:new St(s.skyBottom)},uSunDir:{value:new S(...s.sunDir).normalize()},uSunColor:{value:new St(s.sunColor)},uSunGlow:{value:s.sunGlow},uStars:{value:s.stars}},vertexShader:`
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
      }`})}function Kb(s){return new ue({uniforms:{uBase:{value:new St(s.bldg)},uWin:{value:new St(1,.82,.55)},uLit:{value:s.winLit},uFog:{value:new St(s.fog)},uFogD:{value:s.fogDensity*.55},uSunDir:{value:new S(...s.sunDir).normalize()},uSunColor:{value:new St(s.sunColor).multiplyScalar(s.sunGlow)}},vertexShader:`
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
      }`})}function un(s,t,{uLen:e=1e3,vOf:i=(a,o)=>o/1e3,skip:n=null,colorOf:r=null}={}){let a=s.concat([{...s[0],s:s.total}]),o=a.length,l=t.length,c=new Float32Array(o*l*3),h=new Float32Array(o*l*2),u=r?new Float32Array(o*l*3):null,d=new Float32Array(l),f=[];for(let m=0;m<o;m++){let g=a[m];for(let x=0;x<l;x++){let[b,y]=t[x],E=g.x+g.nx*b,w=g.z+g.nz*b;m>0&&(d[x]+=Math.hypot(E-f[x][0],w-f[x][1])),f[x]=[E,w];let R=m*l+x;if(c[R*3]=E,c[R*3+1]=y,c[R*3+2]=w,h[R*2]=d[x]/e,h[R*2+1]=i(x,y),u){let _=r(E,y,w);u[R*3]=_[0],u[R*3+1]=_[1],u[R*3+2]=_[2]}}}let p=[];for(let m=0;m<o-1;m++)for(let g=0;g<l-1;g++){if(n&&n(a[m],a[m+1],t[g],t[g+1]))continue;let x=m*l+g,b=(m+1)*l+g,y=(m+1)*l+g+1,E=m*l+g+1;p.push(x,E,b,b,E,y)}let v=new ye;return v.setAttribute("position",new Se(c,3)),v.setAttribute("uv",new Se(h,2)),u&&v.setAttribute("color",new Se(u,3)),v.setIndex(p),v.computeVertexNormals(),v}var vf=s=>s.wall==="orange"||s.wall==="blue";function Pa(s,t=.5){return(e,i,n,r)=>vf(e)&&vf(i)&&Math.abs(e.x)<=Li+t&&Math.abs(i.x)<=Li+t&&Math.max(n[1],r[1])<=s+.5}function tu(s,t=1){let e=we.smoothstep(s,-2500,2500),i=new St(Ie[0].main),n=new St(Ie[1].main),r=i.lerp(n,e);return[r.r*t,r.g*t,r.b*t]}function M0(s,t){let e=[];for(let o of s){let l=o.x+o.nx*t,c=o.z+o.nz*t;if(vf(o)){let h=o.wall==="orange"?1:-1,u=h>0?Li:-Li;if(Math.abs(o.x-u)<.5){e.push([l,c],[u,h*(Ii+ki)],[-u,h*(Ii+ki)]);continue}if(Math.abs(o.x)<Li-.5)continue}e.push([l,c])}let i=new xs(e.map(([o,l])=>new st(o,-l))),n=new wo(i);n.rotateX(-Math.PI/2);let r=n.attributes.position,a=n.attributes.uv;for(let o=0;o<r.count;o++)a.setXY(o,(r.getX(o)+ln.halfX)/(2*ln.halfX),(r.getZ(o)-ln.minZ)/(ln.maxZ-ln.minZ));return n}function b0(s,t,e){let i=y0[e.timeOfDay]||y0.night,n=e.quality,r=new Me,a=new Me;a.scale.setScalar(.01),r.add(a),t.add(r);let o=[],l=[new Wi(new S(1,0,0),0),new Wi(new S(-1,0,0),0),new Wi(new S(0,0,-1),0)],c=z=>(z.clippingPlanes=l,z.clipIntersection=!0,z);t.fog=new so(i.fog,i.fogDensity*.35);let h=new at(new ai(2500,48,24),_0(i));h.renderOrder=-10,h.frustumCulled=!1,r.add(h);let u=va(42),d=new He(1,1,1);d.translate(0,.5,0);let f=190,p=new gs(d,Kb(i),f),v=new be;for(let z=0;z<f;z++){let W=u()*Math.PI*2,ut=170+u()*380+(u()<.3?250:0),bt=18+u()*40,Xt=18+u()*40,ne=30+Math.pow(u(),2)*260+(ut>400?60:0);v.compose(new S(Math.cos(W)*ut,-5,Math.sin(W)*ut*1.2),new le().setFromAxisAngle(new S(0,1,0),u()*.6),new S(bt,ne,Xt)),p.setMatrixAt(z,v)}r.add(p);let m=new at(new Zn(1400,48),new Qt({color:855826,roughness:1}));m.rotation.x=-Math.PI/2,m.position.y=-6,r.add(m);let g=new Ro(i.hemiSky,i.hemiGround,i.hemi);r.add(g);let x=new Lo(i.key,i.keyI),b=new S(...i.keyDir).normalize();if(x.position.copy(b).multiplyScalar(90),x.target.position.set(0,0,0),r.add(x,x.target),n!=="low"){x.castShadow=!0;let z=n==="high"?2048:1024;x.shadow.mapSize.set(z,z);let W=x.shadow.camera;W.left=-60,W.right=60,W.top=70,W.bottom=-70,W.near=10,W.far=220,x.shadow.bias=-4e-4,x.shadow.normalBias=.02}let y=fa(200,6),E=qm(n),w=Xm(),R=w.clone();R.repeat.set(40,58),R.needsUpdate=!0;let _=M0(y,Ei),A=new Qt({map:E,roughness:.92,metalness:0,bumpMap:R,bumpScale:.6}),P=new at(_,A);if(P.receiveShadow=!0,a.add(P),n==="high"){let z=w.clone();z.repeat.set(32,47),z.needsUpdate=!0;let W=5;for(let ut=1;ut<=W;ut++){let bt=new Qt({map:E,alphaMap:z,alphaTest:.25+ut/W*.55,roughness:.95,color:new St().setScalar(.85+ut*.05)}),Xt=new at(_,bt);Xt.position.y=ut*1.4,Xt.receiveShadow=!0,a.add(Xt)}}let I=[];for(let z=0;z<=10;z++){let W=Math.PI/2*(1-z/10);I.push([Ei-Ei*Math.cos(W),Ei-Ei*Math.sin(W)])}let U=new Qt({color:1777703,roughness:.55,metalness:.35,vertexColors:!0,side:ce}),H=new at(un(y,I,{uLen:400,skip:Pa(ri),colorOf:(z,W,ut)=>{let bt=tu(ut,.35);return[.55+bt[0],.55+bt[1],.55+bt[2]]}}),U);H.receiveShadow=!0,a.add(H);let D=[[0,Ei-4],[0,Ei+14]],O=new at(un(y,D,{skip:Pa(ri),colorOf:(z,W,ut)=>tu(ut,4)}),new ve({vertexColors:!0,side:ce,fog:!1}));a.add(O);let Z=ef(),Y=Ei+230,rt=new at(un(y,[[0,Ei+14],[0,Y]],{uLen:4200,vOf:z=>z,skip:Pa(ri)}),new Qt({color:1118481,emissive:16777215,emissiveMap:Z,emissiveIntensity:1.1,map:Z,roughness:.4,side:ce}));a.add(rt),o.push(z=>{Z.offset.x=(Z.offset.x+z*.012)%1});let $=tf(3),Q=[[0,Y],[0,ri],[0,1100],[0,gf-Ei]];for(let z=1;z<=8;z++){let W=Math.PI/2*(z/8);Q.push([Ei-Ei*Math.cos(W),gf-Ei+Ei*Math.sin(W)])}let it=new Qt({color:8365784,emissive:10275071,emissiveMap:$,emissiveIntensity:.16,alphaMap:$,transparent:!0,opacity:.32,depthWrite:!1,roughness:.1,metalness:.2,side:ce});$.repeat.set(1,1);let Lt=new at(un(y,Q,{uLen:900,vOf:(z,W)=>W/1040,skip:Pa(ri)}),it);Lt.renderOrder=2,a.add(Lt);let Pt=new at(Lt.geometry,new ve({color:4880568,transparent:!0,opacity:.045,depthWrite:!1,side:ce}));Pt.renderOrder=1,a.add(Pt);let oe=M0(y.map(z=>({...z,wall:"side"})),Ei);oe.translate(0,gf,0);let re=oe.attributes.uv;for(let z=0;z<re.count;z++)re.setXY(z,oe.attributes.position.getX(z)/900,oe.attributes.position.getZ(z)/1040);let ae=new at(oe,it.clone());ae.material.opacity=.07,ae.material.emissiveIntensity=.05,ae.renderOrder=2,a.add(ae);let q=[];for(let z of[1,-1])for(let W of[1,-1]){let ut=W*Li,bt=[ut,0,z*Ii];for(let Xt=0;Xt<I.length-1;Xt++){let[ne,Ot]=I[Xt],[Pe,Ae]=I[Xt+1];q.push(...bt,ut,Ot,z*(Ii-ne),ut,Ae,z*(Ii-Pe))}}let j=new ye;j.setAttribute("position",new se(q,3)),j.computeVertexNormals(),a.add(new at(j,new Qt({color:2764856,roughness:.6,metalness:.3,side:ce})));let vt=[],Wt=[];for(let z of[0,1]){let W=z===0?-1:1,ut=Ie[z],bt=new Me,Xt=tf(4,256);Xt.repeat.set(ki/300,ri/300);let ne=new Qt({color:658448,emissive:ut.main,emissiveMap:Xt,emissiveIntensity:1.4,roughness:.6,metalness:.2,side:ce}),Ot=Xt.clone();Ot.repeat.set(2*Li/300,ri/300),Ot.needsUpdate=!0;let Pe=ne.clone();Pe.emissiveMap=Ot;let Ae=new at(new ti(ki,ri),ne);Ae.rotation.y=Math.PI/2,Ae.position.set(Li,ri/2,W*(Ii+ki/2));let Fe=Ae.clone();Fe.position.x=-Li;let Ze=new at(new ti(2*Li,ri),Pe);Ze.position.set(0,ri/2,0);let xi=new Me;xi.position.set(0,0,W*(Ii+ki)),xi.add(Ze);let $i=Xt.clone();$i.repeat.set(2*Li/300,ki/300),$i.needsUpdate=!0;let En=ne.clone();En.emissiveMap=$i,En.emissiveIntensity=.8;let rs=new at(new ti(2*Li,ki),En);rs.rotation.x=Math.PI/2,rs.position.set(0,ri,W*(Ii+ki/2)),bt.add(Ae,Fe,xi,rs),Wt.push({hinge:xi,s:W});let Fn=new Qt({color:2236962,emissive:ut.main,emissiveIntensity:4.5,roughness:.3,metalness:.6}),tn=new Qt({color:2764083,emissive:ut.main,emissiveIntensity:1.2,roughness:.4,metalness:.7}),as=new He(46,ri+46,46);for(let Na of[-1,1]){let fl=new at(as,Fn);fl.position.set(Na*(Li+23),(ri+46)/2,W*(Ii+23)),bt.add(fl);let Ua=new at(new He(36,ri,36),tn);Ua.position.set(Na*(Li+18),ri/2,W*(Ii+ki)),bt.add(Ua);let T=new at(new He(30,30,ki),tn);T.position.set(Na*(Li+15),ri+15,W*(Ii+ki/2)),bt.add(T)}let Ia=new at(new He(2*Li+92,46,46),Fn);Ia.position.set(0,ri+23,W*(Ii+23));let La=new at(new He(2*Li+72,30,30),tn);La.position.set(0,ri+15,W*(Ii+ki)),bt.add(Ia,La);let dl=new at(new He(2*Li+500,70,80),tn);dl.position.set(0,ri+260,W*(Ii+60)),bt.add(dl),a.add(bt);let Da=new Io(ut.main,0,40,2);Da.position.set(0,3.5,W*(Ii+ki*.6)*.01),r.add(Da),vt.push({light:Da,frameMat:Fn,netMat:[ne,Pe,En],base:4.5})}let Et=Ym(),Yt=c(new Qt({map:Et,roughness:.95,emissive:16777215,emissiveMap:Et,emissiveIntensity:.07,side:ce})),me=c(new Qt({color:1382430,roughness:.8,metalness:.3,side:ce})),nt=[[-60,720],[-1200,1240],[-2300,1760],[-3300,2300]],ct=[[-3300,2780],[-4200,3250],[-5100,3720],[-5900,4150]],dt=z=>{let W=0,ut=[0];for(let bt=1;bt<z.length;bt++)W+=Math.hypot(z[bt][0]-z[bt-1][0],z[bt][1]-z[bt-1][1]),ut.push(W);return bt=>ut[bt]/900};a.add(new at(un(y,nt,{uLen:3400,vOf:dt(nt)}),Yt)),a.add(new at(un(y,ct,{uLen:3400,vOf:dt(ct)}),Yt));let ft=new at(un(y,[[-60,0],[-60,ri+40],[-60,720]],{uLen:4200,vOf:z=>z===0?0:z===1?.5:1,skip:Pa(ri+40,60)}),me);a.add(ft);let mt=ef(),Zt=new at(un(y,[[-3300,2300],[-3300,2780]],{uLen:5200,vOf:z=>z}),c(new Qt({color:328965,emissive:16777215,emissiveMap:mt,emissiveIntensity:1.6,side:ce})));a.add(Zt),o.push(z=>{mt.offset.x=(mt.offset.x-z*.02)%1}),a.add(new at(un(y,[[-5900,4150],[-5900,4650]],{uLen:2e3}),me));let qt=c(new ve({vertexColors:!0,fog:!1,side:ce}));a.add(new at(un(y,[[-5900,4650],[-5900,4700]],{colorOf:(z,W,ut)=>tu(ut,2.2)}),qt));let Kt=c(new Qt({color:921620,roughness:.8,metalness:.4,side:ce}));a.add(new at(un(y,[[-6500,5350],[-4200,5220],[-1900,5120]],{uLen:2e3}),Kt)),a.add(new at(un(y,[[-1900,5120],[-1900,5020]],{uLen:2e3}),me));let te=new Qt({color:1711394,roughness:.6,metalness:.7}),L=c(new ve({color:new St(4.2,4.2,4),fog:!1})),Te=[-3700,-1250,1250,3700],fe=new He(150,14,60),C=Te.length*30+160,M=new gs(fe,L,C),B=0;for(let z of Te){let W=new at(new He(2*Qh+4400,200,140),te);W.position.set(0,5560,z),a.add(W);let ut=new at(new He(2*Qh+4400,60,60),te);ut.position.set(0,5180,z),a.add(ut);for(let bt=0;bt<30;bt++){let Xt=-Qh-1300+bt*(2*Qh+2600)/29;v.makeTranslation(Xt,5140,z),M.setMatrixAt(B++,v)}}let G=fa(420,3);for(let z of G){if(B>=C)break;let W=z.x-z.nx*1950,ut=z.z-z.nz*1950;v.makeRotationY(Math.atan2(z.nx,z.nz)),v.setPosition(W,5010,ut),M.setMatrixAt(B++,v)}M.count=B,a.add(M);let J=[];{let z=new Qt({color:1316636,roughness:.5,metalness:.8});for(let W of[1,-1]){let ut=document.createElement("canvas");ut.width=1024,ut.height=480;let bt=new gi(ut);bt.colorSpace=We;let Xt=new Me,ne=3600,Ot=1690,Pe=new at(new ti(ne,Ot),new ve({map:bt,color:new St(1.5,1.5,1.5),fog:!1})),Ae=new at(new He(ne+160,Ot+160,120),z);Ae.position.z=-70,Xt.add(Ae,Pe);for(let Fe of[-1,1]){let Ze=new at(new He(120,2e3,120),z);Ze.position.set(Fe*ne*.35,-Ot/2-1e3,-60),Xt.add(Ze)}Xt.position.set(0,4300,W*(Ii+4e3)),Xt.rotation.order="YXZ",Xt.rotation.y=W>0?Math.PI:0,Xt.rotation.x=.12,a.add(Xt),J.push({c:ut,tex:bt,ctx:ut.getContext("2d"),group:Xt,end:W})}}let pt="";function gt(z,W,ut,bt){let Xt=`${z}|${W}|${ut}|${bt}`;if(Xt!==pt){pt=Xt;for(let ne of J){let Ot=ne.ctx,Pe=ne.c.width,Ae=ne.c.height,Fe=Ot.createLinearGradient(0,0,0,Ae);Fe.addColorStop(0,"#0a1430"),Fe.addColorStop(1,"#03060f"),Ot.fillStyle=Fe,Ot.fillRect(0,0,Pe,Ae),Ot.textAlign="center",Ot.textBaseline="middle",bt?(Ot.fillStyle=bt==="blue"?"#2f7bff":"#ff7a1a",Ot.fillRect(0,0,Pe,Ae),Ot.fillStyle="#fff",Ot.font="italic 900 220px Arial Black, Arial, sans-serif",Ot.fillText("GOAL!!",Pe/2,Ae/2+10)):(Ot.fillStyle="#9fc4ff",Ot.font="bold 44px Arial, sans-serif",Ot.fillText("ROCKET ARENA",Pe/2,52),Ot.fillStyle="#1f5fe0",Ot.fillRect(70,110,330,250),Ot.fillStyle="#e8621a",Ot.fillRect(Pe-400,110,330,250),Ot.fillStyle="#fff",Ot.font="italic 900 190px Arial Black, Arial, sans-serif",Ot.fillText(String(z),235,245),Ot.fillText(String(W),Pe-235,245),Ot.font="bold 40px Arial, sans-serif",Ot.fillText("BLUE",235,400),Ot.fillText("ORANGE",Pe-235,400),Ot.font="bold 110px Arial, sans-serif",Ot.fillText(ut,Pe/2,245)),Ot.fillStyle="rgba(0,0,0,0.18)";for(let Ze=0;Ze<Ae;Ze+=4)Ot.fillRect(0,Ze,Pe,1);ne.tex.needsUpdate=!0}}}gt(0,0,"5:00",null);let K={value:0};{let z=[["#1f5fe0","#ffffff","#e8621a"],["#c8102e","#ffffff","#003da5"],["#009246","#ffffff","#ce2b37"],["#000000","#dd0000","#ffce00"],["#ff7a1a","#ffffff","#2f7bff"],["#0055a4","#ffffff","#ef4135"],["#ffcc00","#00843d","#00843d"],["#2f7bff","#2f7bff","#ffffff"]],bt=c(new Qt({color:10133930,metalness:.9,roughness:.3})),Xt=fa(1100,2),ne=new Ke(9,9,520,6),Ot=new gs(ne,bt,Xt.length),Pe=z.map(()=>[]);Xt.forEach((Ae,Fe)=>{let Ze=Ae.x-Ae.nx*5950,xi=Ae.z-Ae.nz*5950;v.makeTranslation(Ze,4910,xi),Ot.setMatrixAt(Fe,v);let $i=new ti(300,190,8,1);$i.translate(300/2,0,0),$i.rotateY(Math.atan2(Ae.nx,Ae.nz)),$i.translate(Ze,5070,xi),Pe[Fe%z.length].push($i)}),a.add(Ot),z.forEach((Ae,Fe)=>{if(!Pe[Fe].length)return;let Ze=document.createElement("canvas");Ze.width=96,Ze.height=64;let xi=Ze.getContext("2d"),$i=Fe%2===0;Ae.forEach((tn,as)=>{xi.fillStyle=tn,$i?xi.fillRect(as*32,0,32,64):xi.fillRect(0,as*21.4,96,21.4)});let En=new gi(Ze);En.colorSpace=We;let rs=c(new Qt({map:En,side:ce,roughness:.9,emissive:16777215,emissiveMap:En,emissiveIntensity:.15}));rs.onBeforeCompile=tn=>{tn.uniforms.uTime=K,tn.vertexShader=`uniform float uTime;
`+tn.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
          float wave = sin(uTime * 3.0 + position.x * 0.01 + position.z * 0.01 + uv.x * 5.0) * 45.0 * uv.x;
          transformed.y += wave * 0.6;
          transformed.x += wave * 0.4;
          transformed.z += wave * 0.4;`)};let Fn=x0(Pe[Fe]);a.add(new at(Fn,rs))})}if(o.push(z=>{K.value+=z}),i.stars){let z=document.createElement("canvas");z.width=4,z.height=256;let W=z.getContext("2d"),ut=W.createLinearGradient(0,0,0,256);ut.addColorStop(0,"rgba(255,255,255,0)"),ut.addColorStop(.7,"rgba(255,255,255,0.35)"),ut.addColorStop(1,"rgba(255,255,255,1)"),W.fillStyle=ut,W.fillRect(0,0,4,256);let bt=new gi(z),Xt=new Ke(9,.8,420,24,1,!0);Xt.translate(0,210,0);let ne=new ve({map:bt,color:9418495,transparent:!0,opacity:.07,blending:Ee,depthWrite:!1,side:ce,fog:!1}),Ot=[];for(let Ae=0;Ae<6;Ae++){let Fe=Ae/6*Math.PI*2+.3,Ze=new at(Xt,ne);Ze.position.set(Math.cos(Fe)*125,5,Math.sin(Fe)*150),Ze.renderOrder=3,r.add(Ze),Ot.push({beam:Ze,a:Fe,phase:Ae*1.7})}let Pe=0;o.push(Ae=>{Pe+=Ae;for(let Fe of Ot)Fe.beam.rotation.set(0,0,0),Fe.beam.rotateY(Fe.a+Math.sin(Pe*.25+Fe.phase)*.6),Fe.beam.rotateZ(-.55-Math.sin(Pe*.31+Fe.phase)*.2)})}{let z=document.createElement("canvas");z.width=256,z.height=64;let W=z.getContext("2d");W.fillStyle="#fff";for(let ne=0;ne<3;ne++){let Ot=30+ne*70;W.beginPath(),W.moveTo(Ot,8),W.lineTo(Ot+34,32),W.lineTo(Ot,56),W.lineTo(Ot+18,56),W.lineTo(Ot+52,32),W.lineTo(Ot+18,8),W.closePath(),W.fill()}let ut=new gi(z);ut.wrapS=Ji;let bt=[];for(let ne=0;ne<=3;ne++){let Ot=.42*(1-ne/3);bt.push([Ei-(Ei-3)*Math.cos(Ot),Ei-(Ei-3)*Math.sin(Ot)])}let Xt=new at(un(y,bt,{uLen:500,vOf:ne=>ne/3,skip:Pa(ri),colorOf:(ne,Ot,Pe)=>tu(Pe,2.2)}),new ve({map:ut,vertexColors:!0,transparent:!0,blending:Ee,depthWrite:!1,side:ce,fog:!1}));Xt.renderOrder=2,a.add(Xt),o.push(ne=>{ut.offset.x=(ut.offset.x-ne*.25)%1})}let et={0:[],1:[]};for(let z of[0,1]){let W=z===0?-1:1;for(let ut of[-2700,-1500,1500,2700])et[z].push(new S(ut,520,W*(Ii-30)))}let xt=[],kt=new Qt({color:2764598,roughness:.4,metalness:.7}),wt=new Ke(70,80,6,32),Mt=new Ke(150,175,14,40),Vt=new pn(64,7,8,40),$t=new pn(140,10,8,48),ie=new ai(52,24,16),F=new Ke(70,150,260,32,1,!0);for(let z of e.pads){let W=new Me;W.position.set(z.x,0,z.z);let ut=new Qt({color:3348992,emissive:16753183,emissiveIntensity:z.big?2.6:1.4});if(ut.userData.base=z.big?2.6:1.4,z.big){let bt=new at(Mt,kt);bt.position.y=4;let Xt=new at($t,ut);Xt.rotation.x=Math.PI/2,Xt.position.y=12;let ne=new at(ie,new Qt({color:16752672,emissive:16747536,emissiveIntensity:3.5,roughness:.2}));ne.position.y=110;let Ot=new at(F,new ve({color:16751152,transparent:!0,opacity:.13,blending:Ee,depthWrite:!1,side:ce}));Ot.position.y=135,W.add(bt,Xt,ne,Ot),xt.push({pad:z,grp:W,ring:Xt,orb:ne,cone:Ot,glowMat:ut})}else{let bt=new at(wt,kt);bt.position.y=2;let Xt=new at(Vt,ut);Xt.rotation.x=Math.PI/2,Xt.position.y=6;let ne=new at(new Zn(40,24),ut);ne.rotation.x=-Math.PI/2,ne.position.y=6,W.add(bt,Xt,ne),xt.push({pad:z,grp:W,ring:Xt,glowMat:ut})}a.add(W)}let yt=new Wn;yt.add(new at(new ai(100,32,16),_0(i)));let tt=new ve({color:new St(12,12,11)});for(let z=0;z<10;z++){let W=z/10*Math.PI*2,ut=new at(new He(14,2,4),tt);ut.position.set(Math.cos(W)*30,30,Math.sin(W)*36),ut.lookAt(0,0,0),yt.add(ut)}let _t=new at(new ti(200,200),new ve({color:1915416}));_t.rotation.x=-Math.PI/2,_t.position.y=-2,yt.add(_t);let At=new la(s),ot=At.fromScene(yt,.03).texture;At.dispose(),t.environment=ot,t.environmentIntensity=i.envI;let Bt=0,Nt=0;return o.push(z=>{Nt+=z,Bt=Math.max(0,Bt-z*.18),Et.offset.y=Bt>0?Math.abs(Math.sin(Nt*14))*.012*Math.min(1,Bt*2):0;for(let W of xt){let ut=W.pad.active;W.orb&&(W.orb.visible=ut,W.cone.visible=ut,W.orb.position.y=110+Math.sin(Nt*2.2+W.pad.x)*12,W.orb.rotation.y+=z);let bt=W.glowMat.userData.base;W.glowMat.emissiveIntensity=ut?bt*(1+Math.sin(Nt*4+W.pad.z)*.18):.12}for(let W of vt)W.light.intensity=Math.max(0,W.light.intensity-z*900),W.frameMat.emissiveIntensity+=(W.base-W.frameMat.emissiveIntensity)*Math.min(1,z*1.5)}),{root:r,exposure:i.exposure,bindPads(z){xt.forEach((W,ut)=>{z[ut]&&(W.pad=z[ut])})},dispose(){t.remove(r);let z=new Set;r.traverse(W=>{W.geometry&&!z.has(W.geometry)&&(z.add(W.geometry),W.geometry.dispose());let ut=W.material?Array.isArray(W.material)?W.material:[W.material]:[];for(let bt of ut)if(!z.has(bt)){z.add(bt);for(let Xt in bt)bt[Xt]&&bt[Xt].isTexture&&!z.has(bt[Xt])&&(z.add(bt[Xt]),bt[Xt].dispose());bt.dispose()}}),ot.dispose(),t.environment=null,t.fog=null},update(z){for(let W of o)W(z)},cheer(z=1){Bt=Math.max(Bt,z)},pyroPoints:et,setScreens(z,W,ut,bt){gt(z,W,ut,bt)},goalFlash(z){let W=vt[z];W.light.intensity=2500,W.frameMat.emissiveIntensity=14},cine:{arena:a,buildings:p,ground:m,standEdge:[[ki,1094],[1200,1240],[2300,1760],[3300,2300],[3300,2780],[4200,3250],[5100,3720],[5900,4150],[5900,4700]],roofEdge:[[1900,5020],[1900,5120],[4200,5220],[6500,5350]],setGoalFlap(z,W){let ut=Wt[z];ut.hinge.rotation.x=ut.s*W},setCut(z,W){let ut=z===0?-1:1,bt=Math.max(0,W)*.01;l[0].constant=-bt,l[1].constant=-bt,l[2].normal.set(0,0,-ut),l[2].constant=(Ii+ki-20)*.01},screenFor(z){let W=z===0?-1:1;return J.find(ut=>ut.end===W).group},reset(){for(let z of Wt)z.hinge.rotation.x=0;l[0].constant=0,l[1].constant=0;for(let z of J)z.group.visible=!0;a.position.set(0,0,0),a.quaternion.identity(),a.scale.setScalar(.01),a.visible=!0,m.visible=!0}}}}var E0="rocketArena.settings.v1";function jb(){let s=navigator.userAgent||"";return/Xbox/i.test(s)?"medium":/Android|iPhone|iPad|Mobile/i.test(s)?"low":"high"}function Qb(){let s={quality:jb(),volume:.7,rumble:!0,ballCam:!0,fov:100,replays:!0,showFps:!1,timeOfDay:"night",split:"horizontal",duration:300,difficulty:"pro",teamSize_solo:1,teamSize_versus:1,teamSize_coop:2,handling:"easy",gameMode:"soccar",items:"all",victoryFx:!0};try{let t=JSON.parse(localStorage.getItem(E0)||"{}");return{...s,...t}}catch{return s}}var xf=class{constructor(){this.settings=Qb();let t=new URLSearchParams(location.search);t.get("quality")&&(this.settings.quality=t.get("quality")),this.input=new ml,this.audio=new gl,this.audio.volume=this.settings.volume,this.input.onActivity=()=>this.audio.resume();let e=this.input.rumble.bind(this.input);this.input.rumble=(...i)=>{this.settings.rumble&&e(...i)},this.input.onPadConnect=(i,n)=>this.toast(n?"\u{1F3AE} Controller connected":"Controller disconnected"),this.hud=new bh(document.getElementById("hud")),this.hud.show(!1),this.menu=new Eh(this,document.getElementById("menu")),this.container=document.getElementById("game"),this.paused=!1,this.match=null,this.buildGraphics(),this.startAttract(),this.last=performance.now(),this.fpsT=0,this.fpsN=0,document.getElementById("loading")?.remove(),requestAnimationFrame(i=>this.loop(i)),window.__app=this}buildGraphics(){this.gfx&&this.gfx.dispose(),this.gfx=new jh(this.container,this.settings.quality),this.builtQuality=this.settings.quality,this.buildStadium()}buildStadium(){this.stadium&&this.stadium.dispose();let t=_h.map(([e,i])=>({x:e,z:i,big:!0,active:!0})).concat(Mh.map(([e,i])=>({x:e,z:i,big:!1,active:!0})));this.stadium=b0(this.gfx.renderer,this.gfx.scene,{quality:this.settings.quality,timeOfDay:this.settings.timeOfDay,pads:t}),this.gfx.setExposure(this.stadium.exposure),this.builtTime=this.settings.timeOfDay}saveSettings(){try{localStorage.setItem(E0,JSON.stringify(this.settings))}catch{}}applySettings(){this.saveSettings(),this.audio.setVolume(this.settings.volume),this.settings.quality!==this.builtQuality&&(this.disposeMatch(),this.buildGraphics(),this.startAttract(!1))}ensureStadium(){this.settings.timeOfDay!==this.builtTime&&this.buildStadium()}disposeMatch(){this.match&&this.match.dispose(),this.match=null}startAttract(t=!0){this.disposeMatch(),this.paused=!1,this.hud.show(!1),this.attractCount=(this.attractCount||0)+1;let e=this.attractCount%2===0?"rumble":"soccar";this.match=new cl(this,{mode:"attract",gameMode:e,items:"all",teamSize:2,duration:0,difficulty:"pro",humans:[]}),this.stadium.bindPads(this.match.world.pads),t&&this.menu.show("main")}startMatch(t){this.audio.resume(),this.lastCfg=t,this.disposeMatch(),this.ensureStadium(),this.menu.hide(),this.paused=!1,this.match=new cl(this,t),this.stadium.bindPads(this.match.world.pads)}restartMatch(){this.lastCfg&&this.startMatch(this.lastCfg)}pauseMatch(){this.paused||(this.paused=!0,this.menu.show("pause"))}resume(){if(this.paused=!1,this.menu.hide(),this.resumeFrame=this.frames,this.match){this.match.acc=0;for(let t of this.match.humans)t.car.prevJump=!0}}quitToMenu(){this.startAttract(!0)}showResults(t){this.menu.show("results",t)}toggleFullscreen(){w0()}toast(t){let e=document.createElement("div");e.className="toast",e.textContent=t,document.body.appendChild(e),setTimeout(()=>e.classList.add("out"),2200),setTimeout(()=>e.remove(),2800)}loop(t){requestAnimationFrame(n=>this.loop(n));let e=Math.min(.1,Math.max(0,(t-this.last)/1e3));this.last=t,this.input.update();let i=this.input.menu();if(this.menu.visible&&this.menu.update(i),this.match)if(this.paused){for(let n of this.match.engines)this.audio.updateEngine(n,0,0,!1,!1,!1);this.match.renderPaused()}else this.match.update(e);if(this.fpsT+=e,this.fpsN++,this.fpsT>.5){let n=this.fpsN/this.fpsT;this.hud.setFps(this.settings.showFps?`${Math.round(n)} FPS`:"");let r=this.match&&!this.match.attract&&!this.paused;this.slowT=r&&n<32&&this.settings.quality!=="low"?(this.slowT||0)+this.fpsT:0,this.slowT>6&&!this.slowHinted&&(this.slowHinted=!0,this.toast("Running slowly? Lower Graphics in Settings for a smoother game")),this.fpsT=0,this.fpsN=0}this.input.endFrame(),this.frames=(this.frames||0)+1}};function tS(){try{history.pushState({game:1},""),window.addEventListener("popstate",()=>history.pushState({game:1},""))}catch{}}function w0(){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen({navigationUI:"hide"}).catch(()=>{})}catch{}}function S0(){tS(),window.addEventListener("keydown",s=>{s.code==="KeyF"&&!s.repeat&&window.__app&&window.__app.menu.visible&&w0()});try{new xf}catch(s){console.error(s);let t=document.getElementById("loading");t&&(t.innerHTML=`<div class="err">Could not start the game: ${s.message}<br>Your browser needs WebGL 2 support.</div>`)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",S0):S0();})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
