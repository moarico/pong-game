(()=>{var Zo=["a","b","x","y","lb","rb","lt","rt","view","menu","ls","rs","up","down","left","right","guide"],X0={solo:{up:["KeyW","ArrowUp"],down:["KeyS","ArrowDown"],left:["KeyA","ArrowLeft"],right:["KeyD","ArrowRight"],jump:["Space","KeyK"],boost:["ShiftLeft","ShiftRight","KeyL"],slide:["ControlLeft","KeyC","KeyJ"],rollL:["KeyQ","KeyU"],rollR:["KeyE","KeyO"],cam:["KeyR","KeyI"],pause:["Escape","KeyP"],item:["KeyF","KeyH"],mouse:{boost:0,jump:2,cam:1}},p1:{up:["KeyW"],down:["KeyS"],left:["KeyA"],right:["KeyD"],jump:["Space"],boost:["ShiftLeft"],slide:["ControlLeft","KeyC"],rollL:["KeyQ"],rollR:["KeyE"],cam:["KeyR"],pause:["Escape"],item:["KeyF"],mouse:{boost:0,jump:2,cam:1}},p2:{up:["ArrowUp"],down:["ArrowDown"],left:["ArrowLeft"],right:["ArrowRight"],jump:["KeyK","Numpad0"],boost:["KeyL","NumpadDecimal"],slide:["KeyJ","Numpad1"],rollL:["KeyU"],rollR:["KeyO"],cam:["KeyI","Numpad2"],pause:["KeyP"],item:["KeyH","Numpad3"]}},Y0=new Set(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab","ShiftLeft","ShiftRight","ControlLeft"]);function Tl(s,t,e=.16){let i=Math.hypot(s,t);if(i<e)return[0,0];let n=Math.min(1,(i-e)/(1-e))/i;return[s*n,t*n]}var mu=class{constructor(t){this.index=t,this.id="",this.connected=!1,this.b={},this.prev={};for(let e of Zo)this.b[e]=0,this.prev[e]=0;this.lx=0,this.ly=0,this.rx=0,this.ry=0,this.triggerSeenNeg=[!1,!1],this.navRepeat={dir:"",t:0},this.raw=null}pressed(t){return this.b[t]>.5&&this.prev[t]<=.5}down(t){return this.b[t]>.5}},wl=class{constructor(){this.keys=new Set,this.keysPressed=new Set,this.mouse=new Set,this.mousePressed=new Set,this.gamepadBlocked=!1,this.rbIsItem=!1,this.pads=[],this.onActivity=null,this.onPadConnect=null,this.kbNav={dir:"",t:0},this.lastFrame=performance.now();try{navigator.gamepadInputEmulation="gamepad"}catch{}window.addEventListener("keydown",t=>{Y0.has(t.code)&&!(t.target&&t.target.tagName==="INPUT")&&t.preventDefault(),t.repeat||this.keysPressed.add(t.code),this.keys.add(t.code),this.onActivity&&this.onActivity()}),window.addEventListener("keyup",t=>{this.keys.delete(t.code)}),window.addEventListener("blur",()=>{this.keys.clear(),this.mouse.clear()}),window.addEventListener("pointerdown",()=>{this.onActivity&&this.onActivity()}),window.addEventListener("mousedown",t=>{this.mouse.has(t.button)||this.mousePressed.add(t.button),this.mouse.add(t.button),t.button===1&&t.preventDefault()}),window.addEventListener("mouseup",t=>{this.mouse.delete(t.button)}),window.addEventListener("mousemove",t=>{t.buttons&1||this.mouse.delete(0),t.buttons&2||this.mouse.delete(2),t.buttons&4||this.mouse.delete(1)}),window.addEventListener("contextmenu",t=>t.preventDefault()),window.addEventListener("gamepadconnected",t=>{this.onPadConnect&&this.onPadConnect(t.gamepad,!0)}),window.addEventListener("gamepaddisconnected",t=>{let e=this.pads[t.gamepad.index];e&&(e.connected=!1),this.onPadConnect&&this.onPadConnect(t.gamepad,!1)})}update(){let t=performance.now();this.dt=Math.min(.1,(t-this.lastFrame)/1e3),this.lastFrame=t;let e=[];try{e=navigator.getGamepads?navigator.getGamepads():[]}catch{e=[],this.gamepadBlocked=!0}for(let i of this.pads)i&&(i.connected=!1);for(let i=0;i<e.length;i++){let n=e[i];if(!n||!n.connected)continue;let r=this.pads[n.index]||(this.pads[n.index]=new mu(n.index));r.connected=!0,r.id=n.id,r.raw=n;for(let o of Zo)r.prev[o]=r.b[o];if(this.readPad(r,n),this.onActivity){for(let o of Zo)if(r.pressed(o)){this.onActivity();break}}}}readPad(t,e){let i=r=>e.buttons[r]?typeof e.buttons[r]=="object"?e.buttons[r].value||(e.buttons[r].pressed?1:0):e.buttons[r]:0,n=r=>e.axes[r]!==void 0?e.axes[r]:0;if(e.mapping==="standard"||e.axes.length<6)Zo.forEach((r,o)=>{t.b[r]=i(o)}),[t.lx,t.ly]=Tl(n(0),n(1)),[t.rx,t.ry]=Tl(n(2),n(3));else{let r={a:0,b:1,x:2,y:3,lb:4,rb:5,view:6,menu:7,guide:8,ls:9,rs:10};for(let a of Zo)t.b[a]=0;for(let a in r)t.b[a]=i(r[a]);let o=(a,l)=>{let c=n(a);return c<-.5&&(t.triggerSeenNeg[l]=!0),t.triggerSeenNeg[l]?(c+1)/2:Math.max(0,c)};t.b.lt=o(2,0),t.b.rt=o(5,1),t.b.left=n(6)<-.5?1:0,t.b.right=n(6)>.5?1:0,t.b.up=n(7)<-.5?1:0,t.b.down=n(7)>.5?1:0,[t.lx,t.ly]=Tl(n(0),n(1)),[t.rx,t.ry]=Tl(n(3),n(4))}}endFrame(){this.keysPressed.clear(),this.mousePressed.clear()}connectedPads(){return this.pads.filter(t=>t&&t.connected)}anyKey(t){for(let e of t)if(this.keys.has(e))return!0;return!1}anyKeyPressed(t){for(let e of t)if(this.keysPressed.has(e))return!0;return!1}keyboardControls(t){let e=X0[t],i=e.mouse,n=this.anyKey(e.up)?1:0,r=this.anyKey(e.down)?1:0,o=this.anyKey(e.left)?1:0,a=this.anyKey(e.right)?1:0,l=h=>!!i&&this.mouse.has(i[h]),c=h=>!!i&&this.mousePressed.has(i[h]);return{throttle:n-r,steer:a-o,pitch:r-n,yaw:a-o,roll:(this.anyKey(e.rollR)?1:0)-(this.anyKey(e.rollL)?1:0),jump:this.anyKey(e.jump)||l("jump"),boost:this.anyKey(e.boost)||l("boost"),powerslide:this.anyKey(e.slide),ballCam:this.anyKeyPressed(e.cam)||c("cam"),pause:this.anyKeyPressed(e.pause),lookX:0,lookY:0,skip:this.anyKeyPressed(e.jump)||c("jump"),itemDown:this.anyKey(e.item),digitalSteer:!0}}padControls(t){let e=t.b.right-t.b.left,i=t.b.down-t.b.up,n=Math.abs(t.lx)>Math.abs(e)?t.lx:e,r=Math.abs(t.ly)>Math.abs(i)?t.ly:i;return{throttle:t.b.rt-t.b.lt,steer:n,pitch:r,yaw:n,roll:(this.rbIsItem?0:t.b.rb)-t.b.lb,itemDown:this.rbIsItem&&t.down("rb"),jump:t.down("a"),boost:t.down("b"),powerslide:t.down("x"),ballCam:t.pressed("y"),pause:t.pressed("menu"),lookX:t.rx,lookY:t.ry,skip:t.pressed("a"),digitalSteer:Math.abs(t.lx)<.01&&Math.abs(e)>0}}controls(t){if(t.type==="kb")return this.keyboardControls(t.layout);if(t.type==="pad"){let i=this.pads[t.index];return!i||!i.connected?Z0():this.padControls(i)}let e=this.keyboardControls("solo");for(let i of this.connectedPads()){let n=this.padControls(i);for(let r in n)r!=="digitalSteer"&&(typeof n[r]=="boolean"?e[r]=e[r]||n[r]:Math.abs(n[r])>Math.abs(e[r])&&(e[r]=n[r],r==="steer"&&(e.digitalSteer=n.digitalSteer)))}return e}menu(){let t={up:!1,down:!1,left:!1,right:!1,confirm:!1,back:!1,start:!1,source:null},e=i=>this.anyKeyPressed(i);e(["ArrowUp","KeyW"])&&(t.up=!0),e(["ArrowDown","KeyS"])&&(t.down=!0),e(["ArrowLeft","KeyA"])&&(t.left=!0),e(["ArrowRight","KeyD"])&&(t.right=!0),e(["Enter","NumpadEnter","Space"])&&(t.confirm=!0,t.source={type:"kb"}),e(["Escape","Backspace"])&&(t.back=!0);for(let i of this.connectedPads()){i.pressed("up")&&(t.up=!0),i.pressed("down")&&(t.down=!0),i.pressed("left")&&(t.left=!0),i.pressed("right")&&(t.right=!0),i.pressed("a")&&(t.confirm=!0,t.source={type:"pad",index:i.index}),i.pressed("b")&&(t.back=!0),i.pressed("menu")&&(t.start=!0);let n="";i.ly<-.6?n="up":i.ly>.6?n="down":i.lx<-.6?n="left":i.lx>.6&&(n="right");let r=i.navRepeat;n&&n!==r.dir?(t[n]=!0,r.t=.38):n&&(r.t-=this.dt||.016,r.t<=0&&(t[n]=!0,r.t=.13)),r.dir=n}return t}rumble(t,e,i,n){let r=t.type==="pad"?[this.pads[t.index]]:t.type==="any"?this.connectedPads():[];for(let o of r){let a=o&&o.raw;if(a)try{a.vibrationActuator&&a.vibrationActuator.playEffect?a.vibrationActuator.playEffect("dual-rumble",{startDelay:0,duration:n,weakMagnitude:Math.min(1,i),strongMagnitude:Math.min(1,e)}).catch(()=>{}):a.hapticActuators&&a.hapticActuators[0]&&a.hapticActuators[0].pulse(Math.min(1,Math.max(e,i)),n)}catch{}}}};function Z0(){return{throttle:0,steer:0,pitch:0,yaw:0,roll:0,jump:!1,boost:!1,powerslide:!1,ballCam:!1,pause:!1,lookX:0,lookY:0,skip:!1,itemDown:!1}}function gu(s){if(!s)return"Controller";let t=s.toLowerCase();return t.includes("xbox")||t.includes("xinput")||t.includes("045e")?"Xbox Controller":t.includes("dualsense")||t.includes("dualshock")||t.includes("054c")?"PlayStation Controller":"Controller"}var Al=class{constructor(){this.ctx=null,this.volume=.7,this.engines=[],this.cineNodes=[]}init(){if(this.ctx)return!0;let t=window.AudioContext||window.webkitAudioContext;if(!t)return!1;try{this.ctx=new t}catch{return!1}let e=this.ctx;this.master=e.createGain(),this.master.gain.value=this.volume;let i=e.createDynamicsCompressor();i.threshold.value=-14,i.ratio.value=4,this.master.connect(i).connect(e.destination);let n=e.sampleRate*2;this.noise=e.createBuffer(1,n,e.sampleRate);let r=this.noise.getChannelData(0),o=0;for(let u=0;u<n;u++){let d=Math.random()*2-1;o=(o+.02*d)/1.02,r[u]=d*.6+o*3}let a=this.loopNoise(),l=e.createBiquadFilter();l.type="bandpass",l.frequency.value=700,l.Q.value=.6;let c=e.createOscillator();c.frequency.value=.23;let h=e.createGain();return h.gain.value=.015,this.crowdGain=e.createGain(),this.crowdGain.gain.value=.05,c.connect(h).connect(this.crowdGain.gain),a.connect(l).connect(this.crowdGain).connect(this.master),c.start(),!0}resume(){this.init()&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{})}get ready(){return this.ctx&&this.ctx.state==="running"}setVolume(t){this.volume=t,this.master&&this.master.gain.setTargetAtTime(t,this.ctx.currentTime,.05)}loopNoise(){let t=this.ctx.createBufferSource();return t.buffer=this.noise,t.loop=!0,t.loopStart=Math.random(),t.start(0,Math.random()*1.5),t}burst({dur:t=.2,gain:e=.5,freq:i=1200,endFreq:n=null,type:r="lowpass",q:o=.7,pan:a=0,delay:l=0}){if(!this.ready)return;let c=this.ctx,h=c.currentTime+l,u=c.createBufferSource();u.buffer=this.noise;let d=c.createBiquadFilter();d.type=r,d.frequency.setValueAtTime(i,h),n&&d.frequency.exponentialRampToValueAtTime(n,h+t),d.Q.value=o;let f=c.createGain();f.gain.setValueAtTime(1e-4,h),f.gain.exponentialRampToValueAtTime(e,h+.008),f.gain.exponentialRampToValueAtTime(1e-4,h+t);let g=c.createStereoPanner?c.createStereoPanner():null,v=u.connect(d).connect(f);g&&(g.pan.value=a,v=v.connect(g)),v.connect(this.master),u.start(h,Math.random()*1.5),u.stop(h+t+.05)}tone({freq:t=440,endFreq:e=null,dur:i=.2,gain:n=.3,type:r="sine",delay:o=0,attack:a=.005}){if(!this.ready)return;let l=this.ctx,c=l.currentTime+o,h=l.createOscillator();h.type=r,h.frequency.setValueAtTime(t,c),e&&h.frequency.exponentialRampToValueAtTime(e,c+i);let u=l.createGain();u.gain.setValueAtTime(1e-4,c),u.gain.exponentialRampToValueAtTime(n,c+a),u.gain.exponentialRampToValueAtTime(1e-4,c+i),h.connect(u).connect(this.master),h.start(c),h.stop(c+i+.05)}createEngine(t=0){if(!this.ctx)return null;let e=this.ctx,i=e.createGain();i.gain.value=0;let n=e.createStereoPanner?e.createStereoPanner():null;n?(n.pan.value=t,i.connect(n).connect(this.master)):i.connect(this.master);let r=e.createOscillator();r.type="sawtooth";let o=e.createOscillator();o.type="square";let a=e.createBiquadFilter();a.type="lowpass",a.Q.value=2;let l=e.createGain();l.gain.value=.5,r.connect(a),o.connect(l).connect(a),a.connect(i),r.start(),o.start();let c=this.loopNoise(),h=e.createBiquadFilter();h.type="bandpass",h.frequency.value=900,h.Q.value=.5;let u=e.createGain();u.gain.value=0,c.connect(h).connect(u),n?u.connect(n):u.connect(this.master);let d={out:i,o1:r,o2:o,lp:a,bg:u,bf:h,nodes:[r,o,c]};return this.engines.push(d),d}updateEngine(t,e,i,n,r,o){if(!t||!this.ctx)return;let a=this.ctx.currentTime,l=Math.abs(i),c=38+e*.05+l*14;t.o1.frequency.setTargetAtTime(c,a,.06),t.o2.frequency.setTargetAtTime(c*.5,a,.06),t.lp.frequency.setTargetAtTime(240+e*.9+l*700,a,.08),t.out.gain.setTargetAtTime(o?.05+l*.06+(r?.02:0):0,a,.1),t.bg.gain.setTargetAtTime(o&&n?.22:0,a,.04),t.bf.frequency.setTargetAtTime(n?700+e*.4:900,a,.1)}stopEngine(t){if(t){try{t.out.gain.value=0,t.bg.gain.value=0;for(let e of t.nodes)e.stop()}catch{}this.engines=this.engines.filter(e=>e!==t)}}stopEngines(){for(let t of this.engines)try{t.out.gain.value=0,t.bg.gain.value=0;for(let e of t.nodes)e.stop()}catch{}this.engines=[]}hit(t,e=0){let i=Math.min(1,t/3500);this.burst({dur:.12+i*.15,gain:.25+i*.6,freq:900+i*3e3,endFreq:200,pan:e}),this.tone({freq:140,endFreq:45,dur:.18+i*.15,gain:.25+i*.5}),i>.6&&this.burst({dur:.35,gain:.25*i,freq:4e3,endFreq:800,type:"highpass",pan:e})}bounce(t){let e=Math.min(1,t/2500);this.tone({freq:90,endFreq:40,dur:.15,gain:.08+e*.2}),this.burst({dur:.08,gain:.05+e*.15,freq:600,endFreq:150})}bump(){this.burst({dur:.18,gain:.5,freq:1500,endFreq:200}),this.tone({freq:220,endFreq:70,dur:.15,gain:.3,type:"triangle"})}demo(){this.burst({dur:.9,gain:.9,freq:3e3,endFreq:80}),this.tone({freq:90,endFreq:30,dur:.7,gain:.7}),this.burst({dur:.5,gain:.3,freq:6e3,endFreq:1500,type:"highpass",delay:.05})}goal(){this.burst({dur:1.8,gain:1,freq:4e3,endFreq:60}),this.tone({freq:70,endFreq:25,dur:1.2,gain:.9}),this.burst({dur:.6,gain:.4,freq:7e3,endFreq:2e3,type:"highpass",delay:.05}),this.cheer(1)}cheer(t){if(!this.ready)return;let e=this.ctx.currentTime,i=this.crowdGain.gain;i.cancelScheduledValues(e),i.setValueAtTime(i.value,e),i.linearRampToValueAtTime(.05+.35*t,e+.4),i.linearRampToValueAtTime(.05+.25*t,e+2.5),i.linearRampToValueAtTime(.05,e+6);for(let n=0;n<6;n++)this.burst({dur:1.2+Math.random(),gain:.06*t,freq:500+Math.random()*900,type:"bandpass",q:4,delay:Math.random()*1.2,pan:Math.random()*2-1})}boostPickup(t){t?(this.tone({freq:520,endFreq:1200,dur:.18,gain:.12,type:"triangle"}),this.tone({freq:780,endFreq:1600,dur:.2,gain:.08,type:"triangle",delay:.06})):this.tone({freq:1100,endFreq:1500,dur:.07,gain:.06,type:"triangle"})}jump(){this.burst({dur:.16,gain:.12,freq:700,endFreq:2400,type:"bandpass",q:1.2})}dodge(){this.burst({dur:.25,gain:.16,freq:1800,endFreq:500,type:"bandpass",q:1})}land(t){this.tone({freq:70,endFreq:40,dur:.12,gain:Math.min(.25,t/3e3)})}beep(t){this.tone({freq:t?880:523,dur:t?.5:.18,gain:.25,type:"square"}),this.tone({freq:t?1760:1046,dur:t?.45:.15,gain:.08,type:"sine"})}horn(){for(let t of[220,277,330])this.tone({freq:t,dur:1.4,gain:.12,type:"sawtooth",attack:.04})}itemGet(){this.tone({freq:660,endFreq:990,dur:.12,gain:.08,type:"triangle"}),this.tone({freq:990,endFreq:1320,dur:.14,gain:.07,type:"triangle",delay:.08})}itemUse(t,e=1){let i=Math.max(.2,e);switch(t){case"grapple":case"plunger":this.burst({dur:.25,gain:.25*i,freq:2500,endFreq:700,type:"bandpass",q:2});break;case"tornado":this.burst({dur:2.5,gain:.35*i,freq:300,endFreq:1400,type:"bandpass",q:.8}),this.burst({dur:3,gain:.2*i,freq:900,endFreq:400,type:"bandpass",q:3,delay:.3});break;case"freezer":this.tone({freq:1800,endFreq:3200,dur:.4,gain:.12*i,type:"sine"}),this.burst({dur:.5,gain:.25*i,freq:6e3,endFreq:3e3,type:"highpass"});break;case"curveball":this.tone({freq:300,endFreq:1200,dur:.5,gain:.15*i,type:"sawtooth"});break;case"power":case"spikes":this.tone({freq:140,endFreq:420,dur:.35,gain:.25*i,type:"square"});break;default:this.burst({dur:.2,gain:.3*i,freq:1200,endFreq:200})}}hook(t=1){this.tone({freq:900,endFreq:500,dur:.12,gain:.2*Math.max(.2,t),type:"square"}),this.burst({dur:.1,gain:.2*Math.max(.2,t),freq:4e3,endFreq:1500,type:"highpass"})}cine(t){if(!this.ready)return;let e=this.ctx;switch(t){case"rise":[523,659,784,1046].forEach((i,n)=>this.tone({freq:i,dur:.9,gain:.09,type:"triangle",delay:n*.11,attack:.02})),this.tone({freq:131,dur:1.6,gain:.18,type:"sawtooth",attack:.05});break;case"flap":this.burst({dur:1,gain:.25,freq:3e3,endFreq:500,type:"bandpass",q:1.5}),this.tone({freq:160,endFreq:70,dur:.6,gain:.25,type:"square"});break;case"clunk":this.tone({freq:70,endFreq:30,dur:.5,gain:.7}),this.burst({dur:.4,gain:.6,freq:1500,endFreq:100});break;case"build":this.tone({freq:90,endFreq:900,dur:2.6,gain:.12,type:"sawtooth",attack:.3});for(let i=0;i<12;i++)this.tone({freq:700+i*90,dur:.12,gain:.05,type:"square",delay:i*.2});break;case"launch":this.burst({dur:1.4,gain:.7,freq:500,endFreq:3e3,type:"bandpass",q:.7}),this.tone({freq:60,endFreq:120,dur:1.2,gain:.4,type:"sawtooth"});break;case"whoosh":this.burst({dur:1.3,gain:.5,freq:300,endFreq:4e3,type:"bandpass",q:1.2});break;case"boom":this.burst({dur:2.6,gain:1,freq:3500,endFreq:40}),this.tone({freq:60,endFreq:18,dur:2.4,gain:1}),this.burst({dur:.8,gain:.5,freq:7e3,endFreq:1500,type:"highpass",delay:.03});break;case"tear":this.burst({dur:3,gain:.8,freq:200,endFreq:1200,type:"lowpass"});for(let i=0;i<8;i++)this.burst({dur:.3,gain:.35,freq:2500,endFreq:300,delay:Math.random()*2.5});break;case"drone":this.startDrone(32,.55);break;case"space":{this.stopCine(1.5),this.startDrone(24,.45);let i=e.currentTime,n=e.createGain();n.gain.setValueAtTime(1e-4,i),n.gain.exponentialRampToValueAtTime(.06,i+3),n.connect(this.master);let r=[110,164.8,220.5,329.6].map((o,a)=>{let l=e.createOscillator();return l.type="sine",l.frequency.value=o*(1+(a%2?.003:-.002)),l.connect(n),l.start(i),l});this.cineNodes.push({out:n,srcs:r});break}case"gulp":this.tone({freq:180,endFreq:20,dur:1.6,gain:.8}),this.burst({dur:1.5,gain:.6,freq:1200,endFreq:60});break;case"bigboom":this.stopCine(.2),this.burst({dur:5,gain:1,freq:5e3,endFreq:30}),this.tone({freq:50,endFreq:15,dur:4.5,gain:1}),this.tone({freq:100,endFreq:25,dur:3,gain:.6,type:"sawtooth"}),this.burst({dur:1.5,gain:.6,freq:8e3,endFreq:2e3,type:"highpass",delay:.05}),this.burst({dur:4,gain:.5,freq:600,endFreq:80,delay:.6});break;case"stop":this.stopCine(.6);break;default:break}}startDrone(t,e){let i=this.ctx,n=i.currentTime,r=i.createGain();r.gain.setValueAtTime(1e-4,n),r.gain.exponentialRampToValueAtTime(e,n+1.5);let o=i.createBiquadFilter();o.type="lowpass",o.frequency.setValueAtTime(140,n),o.frequency.linearRampToValueAtTime(700,n+9),o.Q.value=3,o.connect(r).connect(this.master);let a=[1,1.012,.5].map(h=>{let u=i.createOscillator();return u.type="sawtooth",u.frequency.setValueAtTime(t*h,n),u.frequency.linearRampToValueAtTime(t*h*1.8,n+10),u.connect(o),u.start(n),u}),l=this.loopNoise(),c=i.createGain();c.gain.value=.6,l.connect(c).connect(o),a.push(l),this.cineNodes=this.cineNodes||[],this.cineNodes.push({out:r,srcs:a})}stopCine(t=.5){if(!this.ctx||!this.cineNodes)return;let e=this.ctx.currentTime;for(let i of this.cineNodes)try{i.out.gain.cancelScheduledValues(e),i.out.gain.setValueAtTime(Math.max(1e-4,i.out.gain.value),e),i.out.gain.exponentialRampToValueAtTime(1e-4,e+t);for(let n of i.srcs)n.stop(e+t+.05)}catch{}this.cineNodes=[]}click(){this.tone({freq:1400,dur:.04,gain:.05,type:"square"})}select(){this.tone({freq:900,endFreq:1400,dur:.09,gain:.08,type:"triangle"})}};var gp=0,td=1,vp=2;var cr=1,xp=2,uo=3,Os=0,_i=1,oe=2,pn=0,mn=1,Te=2,ed=3,id=4,yp=5;var hr=100,_p=101,Mp=102,bp=103,Sp=104,Ep=200,Tp=201,wp=202,Ap=203,nd=204,sd=205,Rp=206,Cp=207,Pp=208,Ip=209,Lp=210,Dp=211,Np=212,Up=213,Fp=214,nc=0,sc=1,rc=2,qr=3,oc=4,ac=5,lc=6,cc=7,rd=0,Bp=1,Op=2,Ln=0,qa=1,Xa=2,Ya=3,ur=4,Za=5,$a=6,Ja=7;var od=300,Hs=301,dr=302,Fc=303,Bc=304,Ka=306,Ji=1e3,Vn=1001,hc=1002,mi=1003,Hp=1004;var ja=1005;var gi=1006,Oc=1007;var zs=1008;var Fi=1009,ad=1010,ld=1011,fo=1012,Hc=1013,Dn=1014,gn=1015,ui=1016,zc=1017,kc=1018,po=1020,cd=35902,hd=35899,ud=1021,dd=1022,vn=1023,qn=1026,ks=1027,Vc=1028,Gc=1029,Vs=1030,Wc=1031;var qc=1033,Qa=33776,tl=33777,el=33778,il=33779,Xc=35840,Yc=35841,Zc=35842,$c=35843,Jc=36196,Kc=37492,jc=37496,Qc=37488,th=37489,nl=37490,eh=37491,ih=37808,nh=37809,sh=37810,rh=37811,oh=37812,ah=37813,lh=37814,ch=37815,hh=37816,uh=37817,dh=37818,fh=37819,ph=37820,mh=37821,gh=36492,vh=36494,xh=36495,yh=36283,_h=36284,sl=36285,Mh=36286;var ca=2300,uc=2301,ec=2302,Vu=2303,Gu=2400,Wu=2401,qu=2402;var zp=3200;var bh=0,kp=1,_s="",ze="srgb",ha="srgb-linear",ua="linear",Ce="srgb";var ic=7680;var Vp=519,Gp=512,Wp=513,qp=514,Sh=515,Xp=516,Yp=517,Eh=518,Zp=519,fd=35044,Ki=35048;var pd="300 es",Cn=2e3,Xr=2001;function $0(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function J0(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function da(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function $p(){let s=da("canvas");return s.style.display="block",s}var Ff={},Yr=null;function fa(...s){let t="THREE."+s.shift();Yr?Yr("log",t,...s):console.log(t,...s)}function Jp(s){let t=s[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=s[1];e&&e.isStackTrace?s[0]+=" "+e.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function jt(...s){s=Jp(s);let t="THREE."+s.shift();if(Yr)Yr("warn",t,...s);else{let e=s[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...s)}}function te(...s){s=Jp(s);let t="THREE."+s.shift();if(Yr)Yr("error",t,...s);else{let e=s[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...s)}}function or(...s){let t=s.join(" ");t in Ff||(Ff[t]=!0,jt(...s))}function Kp(s,t,e){return new Promise(function(i,n){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:n();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}var jp={[nc]:sc,[rc]:lc,[oc]:cc,[qr]:ac,[sc]:nc,[lc]:rc,[cc]:oc,[ac]:qr},Xn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let n=i[t];if(n!==void 0){let r=n.indexOf(e);r!==-1&&n.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let n=i.slice(0);for(let r=0,o=n.length;r<o;r++)n[r].call(this,t);t.target=null}}},Ni=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Bf=1234567,ra=Math.PI/180,Zr=180/Math.PI;function Wn(){let s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ni[s&255]+Ni[s>>8&255]+Ni[s>>16&255]+Ni[s>>24&255]+"-"+Ni[t&255]+Ni[t>>8&255]+"-"+Ni[t>>16&15|64]+Ni[t>>24&255]+"-"+Ni[e&63|128]+Ni[e>>8&255]+"-"+Ni[e>>16&255]+Ni[e>>24&255]+Ni[i&255]+Ni[i>>8&255]+Ni[i>>16&255]+Ni[i>>24&255]).toLowerCase()}function de(s,t,e){return Math.max(t,Math.min(e,s))}function md(s,t){return(s%t+t)%t}function K0(s,t,e,i,n){return i+(s-t)*(n-i)/(e-t)}function j0(s,t,e){return s!==t?(e-s)/(t-s):0}function oa(s,t,e){return(1-e)*s+e*t}function Q0(s,t,e,i){return oa(s,t,1-Math.exp(-e*i))}function tg(s,t=1){return t-Math.abs(md(s,t*2)-t)}function eg(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function ig(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function ng(s,t){return s+Math.floor(Math.random()*(t-s+1))}function sg(s,t){return s+Math.random()*(t-s)}function rg(s){return s*(.5-Math.random())}function og(s){s!==void 0&&(Bf=s);let t=Bf+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function ag(s){return s*ra}function lg(s){return s*Zr}function cg(s){return s>0&&Number.isInteger(s)&&2**Math.round(Math.log2(s))===s}function hg(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function ug(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function dg(s,t,e,i,n){let r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+i)/2),h=o((t+i)/2),u=r((t-i)/2),d=o((t-i)/2),f=r((i-t)/2),g=o((i-t)/2);switch(n){case"XYX":s.set(a*h,l*u,l*d,a*c);break;case"YZY":s.set(l*d,a*h,l*u,a*c);break;case"ZXZ":s.set(l*u,l*d,a*h,a*c);break;case"XZX":s.set(a*h,l*g,l*f,a*c);break;case"YXY":s.set(l*f,a*h,l*g,a*c);break;case"ZYZ":s.set(l*g,l*f,a*h,a*c);break;default:jt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}}function Rn(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:case Uint8ClampedArray:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Oe(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var xe={DEG2RAD:ra,RAD2DEG:Zr,generateUUID:Wn,clamp:de,euclideanModulo:md,mapLinear:K0,inverseLerp:j0,lerp:oa,damp:Q0,pingpong:tg,smoothstep:eg,smootherstep:ig,randInt:ng,randFloat:sg,randFloatSpread:rg,seededRandom:og,degToRad:ag,radToDeg:lg,isPowerOfTwo:cg,ceilPowerOfTwo:hg,floorPowerOfTwo:ug,setQuaternionFromProperEuler:dg,normalize:Oe,denormalize:Rn},Md=class Md{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,n=t.elements;return this.x=n[0]*e+n[3]*i+n[6],this.y=n[1]*e+n[4]*i+n[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(de(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(de(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),n=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*i-o*n+t.x,this.y=r*n+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Md.prototype.isVector2=!0;var Q=Md,he=class{constructor(t=0,e=0,i=0,n=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=n}static slerpFlat(t,e,i,n,r,o,a){let l=i[n+0],c=i[n+1],h=i[n+2],u=i[n+3],d=r[o+0],f=r[o+1],g=r[o+2],v=r[o+3];if(u!==v||l!==d||c!==f||h!==g){let p=l*d+c*f+h*g+u*v;p<0&&(d=-d,f=-f,g=-g,v=-v,p=-p);let m=1-a;if(p<.9995){let x=Math.acos(p),M=Math.sin(x);m=Math.sin(m*x)/M,a=Math.sin(a*x)/M,l=l*m+d*a,c=c*m+f*a,h=h*m+g*a,u=u*m+v*a}else{l=l*m+d*a,c=c*m+f*a,h=h*m+g*a,u=u*m+v*a;let x=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=x,c*=x,h*=x,u*=x}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,i,n,r,o){let a=i[n],l=i[n+1],c=i[n+2],h=i[n+3],u=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return t[e]=a*g+h*u+l*f-c*d,t[e+1]=l*g+h*d+c*u-a*f,t[e+2]=c*g+h*f+a*d-l*u,t[e+3]=h*g-a*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,n){return this._x=t,this._y=e,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,n=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(n/2),u=a(r/2),d=l(i/2),f=l(n/2),g=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"YZX":this._x=d*h*u+c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u-d*f*g;break;case"XZY":this._x=d*h*u-c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u+d*f*g;break;default:jt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,n=Math.sin(i);return this._x=t.x*n,this._y=t.y*n,this._z=t.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],n=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=i+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-n)*f}else if(i>a&&i>u){let f=2*Math.sqrt(1+i-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(n+o)/f,this._z=(r+c)/f}else if(a>u){let f=2*Math.sqrt(1+a-i-u);this._w=(r-c)/f,this._x=(n+o)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-i-a);this._w=(o-n)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(de(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let n=Math.min(1,e/i);return this.slerp(t,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,n=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+o*a+n*c-r*l,this._y=n*h+o*l+r*a-i*c,this._z=r*h+o*c+i*l-n*a,this._w=o*h-i*a-n*l-r*c,this._onChangeCallback(),this}slerp(t,e){let i=t._x,n=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(i=-i,n=-n,r=-r,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(n*Math.sin(t),n*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},bd=class bd{constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Of.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Of.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*n,this.y=r[1]*e+r[4]*i+r[7]*n,this.z=r[2]*e+r[5]*i+r[8]*n,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=t.elements,o=1/(r[3]*e+r[7]*i+r[11]*n+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*n+r[12])*o,this.y=(r[1]*e+r[5]*i+r[9]*n+r[13])*o,this.z=(r[2]*e+r[6]*i+r[10]*n+r[14])*o,this}applyQuaternion(t){let e=this.x,i=this.y,n=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*n-a*i),h=2*(a*e-r*n),u=2*(r*i-o*e);return this.x=e+l*c+o*u-a*h,this.y=i+l*h+a*c-r*u,this.z=n+l*u+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*n,this.y=r[1]*e+r[5]*i+r[9]*n,this.z=r[2]*e+r[6]*i+r[10]*n,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this.z=de(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this.z=de(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(de(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,n=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=n*l-r*a,this.y=r*o-i*l,this.z=i*a-n*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return vu.copy(this).projectOnVector(t),this.sub(vu)}reflect(t){return this.sub(vu.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(de(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,n=this.z-t.z;return e*e+i*i+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let n=Math.sin(e)*t;return this.x=n*Math.sin(i),this.y=Math.cos(e)*t,this.z=n*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),n=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=n,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};bd.prototype.isVector3=!0;var T=bd,vu=new T,Of=new he,Sd=class Sd{constructor(t,e,i,n,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,o,a,l,c)}set(t,e,i,n,r,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=n,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],u=i[7],d=i[2],f=i[5],g=i[8],v=n[0],p=n[3],m=n[6],x=n[1],M=n[4],y=n[7],S=n[2],b=n[5],A=n[8];return r[0]=o*v+a*x+l*S,r[3]=o*p+a*M+l*b,r[6]=o*m+a*y+l*A,r[1]=c*v+h*x+u*S,r[4]=c*p+h*M+u*b,r[7]=c*m+h*y+u*A,r[2]=d*v+f*x+g*S,r[5]=d*p+f*M+g*b,r[8]=d*m+f*y+g*A,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-i*r*h+i*a*l+n*r*c-n*o*l}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,g=e*u+i*d+n*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/g;return t[0]=u*v,t[1]=(n*c-h*i)*v,t[2]=(a*i-n*o)*v,t[3]=d*v,t[4]=(h*e-n*l)*v,t[5]=(n*r-a*e)*v,t[6]=f*v,t[7]=(i*l-c*e)*v,t[8]=(o*e-i*r)*v,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,n,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+t,-n*c,n*l,-n*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return or("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(xu.makeScale(t,e)),this}rotate(t){return or("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(xu.makeRotation(-t)),this}translate(t,e){return or("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(xu.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<9;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Sd.prototype.isMatrix3=!0;var ie=Sd,xu=new ie,Hf=new ie().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),zf=new ie().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function fg(){let s={enabled:!0,workingColorSpace:ha,spaces:{},convert:function(n,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Ce&&(n.r=gs(n.r),n.g=gs(n.g),n.b=gs(n.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(n.applyMatrix3(this.spaces[r].toXYZ),n.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Ce&&(n.r=Wr(n.r),n.g=Wr(n.g),n.b=Wr(n.b))),n},workingToColorSpace:function(n,r){return this.convert(n,this.workingColorSpace,r)},colorSpaceToWorking:function(n,r){return this.convert(n,r,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===_s?ua:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,r=this.workingColorSpace){return n.fromArray(this.spaces[r].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,r,o){return n.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,r){return or("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(n,r)},toWorkingColorSpace:function(n,r){return or("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(n,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return s.define({[ha]:{primaries:t,whitePoint:i,transfer:ua,toXYZ:Hf,fromXYZ:zf,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:ze},outputColorSpaceConfig:{drawingBufferColorSpace:ze}},[ze]:{primaries:t,whitePoint:i,transfer:Ce,toXYZ:Hf,fromXYZ:zf,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:ze}}}),s}var _e=fg();function gs(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Wr(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var wr,dc=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{wr===void 0&&(wr=da("canvas")),wr.width=t.width,wr.height=t.height;let n=wr.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),i=wr}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=da("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let n=i.getImageData(0,0,t.width,t.height),r=n.data;for(let o=0;o<r.length;o++)r[o]=gs(r[o]/255)*255;return i.putImageData(n,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(gs(e[i]/255)*255):e[i]=gs(e[i]);return{data:e,width:t.width,height:t.height}}else return jt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},pg=0,$r=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:pg++}),this.uuid=Wn(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let r;if(Array.isArray(n)){r=[];for(let o=0,a=n.length;o<a;o++)n[o].isDataTexture?r.push(yu(n[o].image)):r.push(yu(n[o]))}else r=yu(n);i.url=r}return e||(t.images[this.uuid]=i),i}};function yu(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?dc.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(jt("Texture: Unable to serialize Texture."),{})}var mg=0,_u=new T,Wi=class s extends Xn{constructor(t=s.DEFAULT_IMAGE,e=s.DEFAULT_MAPPING,i=Vn,n=Vn,r=gi,o=zs,a=vn,l=Fi,c=s.DEFAULT_ANISOTROPY,h=_s){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:mg++}),this.uuid=Wn(),this.name="",this.source=new $r(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Q(0,0),this.repeat=new Q(1,1),this.center=new Q(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ie,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(_u).x}get height(){return this.source.getSize(_u).y}get depth(){return this.source.getSize(_u).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){jt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){jt(`Texture.setValues(): property '${e}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==od)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ji:t.x=t.x-Math.floor(t.x);break;case Vn:t.x=t.x<0?0:1;break;case hc:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ji:t.y=t.y-Math.floor(t.y);break;case Vn:t.y=t.y<0?0:1;break;case hc:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Wi.DEFAULT_IMAGE=null;Wi.DEFAULT_MAPPING=od;Wi.DEFAULT_ANISOTROPY=1;var Ed=class Ed{constructor(t=0,e=0,i=0,n=1){this.x=t,this.y=e,this.z=i,this.w=n}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,n){return this.x=t,this.y=e,this.z=i,this.w=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*i+o[8]*n+o[12]*r,this.y=o[1]*e+o[5]*i+o[9]*n+o[13]*r,this.z=o[2]*e+o[6]*i+o[10]*n+o[14]*r,this.w=o[3]*e+o[7]*i+o[11]*n+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,n,r,l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],g=l[9],v=l[2],p=l[6],m=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-v)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+v)<.1&&Math.abs(g+p)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let M=(c+1)/2,y=(f+1)/2,S=(m+1)/2,b=(h+d)/4,A=(u+v)/4,_=(g+p)/4;return M>y&&M>S?M<.01?(i=0,n=.707106781,r=.707106781):(i=Math.sqrt(M),n=b/i,r=A/i):y>S?y<.01?(i=.707106781,n=0,r=.707106781):(n=Math.sqrt(y),i=b/n,r=_/n):S<.01?(i=.707106781,n=.707106781,r=0):(r=Math.sqrt(S),i=A/r,n=_/r),this.set(i,n,r,e),this}let x=Math.sqrt((p-g)*(p-g)+(u-v)*(u-v)+(d-h)*(d-h));return Math.abs(x)<.001&&(x=1),this.x=(p-g)/x,this.y=(u-v)/x,this.z=(d-h)/x,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this.z=de(this.z,t.z,e.z),this.w=de(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this.z=de(this.z,t,e),this.w=de(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(de(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Ed.prototype.isVector4=!0;var Ke=Ed,fc=class extends Xn{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:gi,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new Ke(0,0,t,e),this.scissorTest=!1,this.viewport=new Ke(0,0,t,e),this.textures=[];let n={width:t,height:e,depth:i.depth},r=new Wi(n),o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:gi,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let n=0,r=this.textures.length;n<r;n++)this.textures[n].image.width=t,this.textures[n].image.height=e,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let n=Object.assign({},t.textures[e].image);this.textures[e].source=new $r(n)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},je=class extends fc{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},pa=class extends Wi{constructor(t=null,e=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=mi,this.minFilter=mi,this.wrapR=Vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var pc=class extends Wi{constructor(t=null,e=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=mi,this.minFilter=mi,this.wrapR=Vn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Uc=class Uc{constructor(t,e,i,n,r,o,a,l,c,h,u,d,f,g,v,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,o,a,l,c,h,u,d,f,g,v,p)}set(t,e,i,n,r,o,a,l,c,h,u,d,f,g,v,p){let m=this.elements;return m[0]=t,m[4]=e,m[8]=i,m[12]=n,m[1]=r,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=d,m[3]=f,m[7]=g,m[11]=v,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Uc().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,n=1/Ar.setFromMatrixColumn(t,0).length(),r=1/Ar.setFromMatrixColumn(t,1).length(),o=1/Ar.setFromMatrixColumn(t,2).length();return e[0]=i[0]*n,e[1]=i[1]*n,e[2]=i[2]*n,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*o,e[9]=i[9]*o,e[10]=i[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,n=t.y,r=t.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(n),c=Math.sin(n),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let d=o*h,f=o*u,g=a*h,v=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+g*c,e[5]=d-v*c,e[9]=-a*l,e[2]=v-d*c,e[6]=g+f*c,e[10]=o*l}else if(t.order==="YXZ"){let d=l*h,f=l*u,g=c*h,v=c*u;e[0]=d+v*a,e[4]=g*a-f,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=v+d*a,e[10]=o*l}else if(t.order==="ZXY"){let d=l*h,f=l*u,g=c*h,v=c*u;e[0]=d-v*a,e[4]=-o*u,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=v-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let d=o*h,f=o*u,g=a*h,v=a*u;e[0]=l*h,e[4]=g*c-f,e[8]=d*c+v,e[1]=l*u,e[5]=v*c+d,e[9]=f*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let d=o*l,f=o*c,g=a*l,v=a*c;e[0]=l*h,e[4]=v-d*u,e[8]=g*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*u+g,e[10]=d-v*u}else if(t.order==="XZY"){let d=o*l,f=o*c,g=a*l,v=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+v,e[5]=o*h,e[9]=f*u-g,e[2]=g*u-f,e[6]=a*h,e[10]=v*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(gg,t,vg)}lookAt(t,e,i){let n=this.elements;return en.subVectors(t,e),en.lengthSq()===0&&(en.z=1),en.normalize(),Cs.crossVectors(i,en),Cs.lengthSq()===0&&(Math.abs(i.z)===1?en.x+=1e-4:en.z+=1e-4,en.normalize(),Cs.crossVectors(i,en)),Cs.normalize(),Rl.crossVectors(en,Cs),n[0]=Cs.x,n[4]=Rl.x,n[8]=en.x,n[1]=Cs.y,n[5]=Rl.y,n[9]=en.y,n[2]=Cs.z,n[6]=Rl.z,n[10]=en.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],u=i[5],d=i[9],f=i[13],g=i[2],v=i[6],p=i[10],m=i[14],x=i[3],M=i[7],y=i[11],S=i[15],b=n[0],A=n[4],_=n[8],R=n[12],P=n[1],I=n[5],N=n[9],B=n[13],L=n[2],O=n[6],q=n[10],Y=n[14],rt=n[3],Z=n[7],tt=n[11],nt=n[15];return r[0]=o*b+a*P+l*L+c*rt,r[4]=o*A+a*I+l*O+c*Z,r[8]=o*_+a*N+l*q+c*tt,r[12]=o*R+a*B+l*Y+c*nt,r[1]=h*b+u*P+d*L+f*rt,r[5]=h*A+u*I+d*O+f*Z,r[9]=h*_+u*N+d*q+f*tt,r[13]=h*R+u*B+d*Y+f*nt,r[2]=g*b+v*P+p*L+m*rt,r[6]=g*A+v*I+p*O+m*Z,r[10]=g*_+v*N+p*q+m*tt,r[14]=g*R+v*B+p*Y+m*nt,r[3]=x*b+M*P+y*L+S*rt,r[7]=x*A+M*I+y*O+S*Z,r[11]=x*_+M*N+y*q+S*tt,r[15]=x*R+M*B+y*Y+S*nt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],g=t[3],v=t[7],p=t[11],m=t[15],x=l*f-c*d,M=a*f-c*u,y=a*d-l*u,S=o*f-c*h,b=o*d-l*h,A=o*u-a*h;return e*(v*x-p*M+m*y)-i*(g*x-p*S+m*b)+n*(g*M-v*S+m*A)-r*(g*y-v*b+p*A)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[1],o=t[5],a=t[9],l=t[2],c=t[6],h=t[10];return e*(o*h-a*c)-i*(r*h-a*l)+n*(r*c-o*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let n=this.elements;return t.isVector3?(n[12]=t.x,n[13]=t.y,n[14]=t.z):(n[12]=t,n[13]=e,n[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],g=t[12],v=t[13],p=t[14],m=t[15],x=e*a-i*o,M=e*l-n*o,y=e*c-r*o,S=i*l-n*a,b=i*c-r*a,A=n*c-r*l,_=h*v-u*g,R=h*p-d*g,P=h*m-f*g,I=u*p-d*v,N=u*m-f*v,B=d*m-f*p,L=x*B-M*N+y*I+S*P-b*R+A*_;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let O=1/L;return t[0]=(a*B-l*N+c*I)*O,t[1]=(n*N-i*B-r*I)*O,t[2]=(v*A-p*b+m*S)*O,t[3]=(d*b-u*A-f*S)*O,t[4]=(l*P-o*B-c*R)*O,t[5]=(e*B-n*P+r*R)*O,t[6]=(p*y-g*A-m*M)*O,t[7]=(h*A-d*y+f*M)*O,t[8]=(o*N-a*P+c*_)*O,t[9]=(i*P-e*N-r*_)*O,t[10]=(g*b-v*y+m*x)*O,t[11]=(u*y-h*b-f*x)*O,t[12]=(a*R-o*I-l*_)*O,t[13]=(e*I-i*R+n*_)*O,t[14]=(v*M-g*S-p*x)*O,t[15]=(h*S-u*M+d*x)*O,this}scale(t){let e=this.elements,i=t.x,n=t.y,r=t.z;return e[0]*=i,e[4]*=n,e[8]*=r,e[1]*=i,e[5]*=n,e[9]*=r,e[2]*=i,e[6]*=n,e[10]*=r,e[3]*=i,e[7]*=n,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],n=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,n))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),n=Math.sin(e),r=1-i,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+i,c*a-n*l,c*l+n*a,0,c*a+n*l,h*a+i,h*l-n*o,0,c*l-n*a,h*l+n*o,r*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,n,r,o){return this.set(1,i,r,0,t,1,o,0,e,n,1,0,0,0,0,1),this}compose(t,e,i){let n=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,g=r*u,v=o*h,p=o*u,m=a*u,x=l*c,M=l*h,y=l*u,S=i.x,b=i.y,A=i.z;return n[0]=(1-(v+m))*S,n[1]=(f+y)*S,n[2]=(g-M)*S,n[3]=0,n[4]=(f-y)*b,n[5]=(1-(d+m))*b,n[6]=(p+x)*b,n[7]=0,n[8]=(g+M)*A,n[9]=(p-x)*A,n[10]=(1-(d+v))*A,n[11]=0,n[12]=t.x,n[13]=t.y,n[14]=t.z,n[15]=1,this}decompose(t,e,i){let n=this.elements;t.x=n[12],t.y=n[13],t.z=n[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),e.identity(),this;let o=Ar.set(n[0],n[1],n[2]).length(),a=Ar.set(n[4],n[5],n[6]).length(),l=Ar.set(n[8],n[9],n[10]).length();r<0&&(o=-o),Tn.copy(this);let c=1/o,h=1/a,u=1/l;return Tn.elements[0]*=c,Tn.elements[1]*=c,Tn.elements[2]*=c,Tn.elements[4]*=h,Tn.elements[5]*=h,Tn.elements[6]*=h,Tn.elements[8]*=u,Tn.elements[9]*=u,Tn.elements[10]*=u,e.setFromRotationMatrix(Tn),i.x=o,i.y=a,i.z=l,this}makePerspective(t,e,i,n,r,o,a=Cn,l=!1){let c=this.elements,h=2*r/(e-t),u=2*r/(i-n),d=(e+t)/(e-t),f=(i+n)/(i-n),g,v;if(l)g=r/(o-r),v=o*r/(o-r);else if(a===Cn)g=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===Xr)g=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,n,r,o,a=Cn,l=!1){let c=this.elements,h=2/(e-t),u=2/(i-n),d=-(e+t)/(e-t),f=-(i+n)/(i-n),g,v;if(l)g=1/(o-r),v=o/(o-r);else if(a===Cn)g=-2/(o-r),v=-(o+r)/(o-r);else if(a===Xr)g=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<16;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}};Uc.prototype.isMatrix4=!0;var be=Uc,Ar=new T,Tn=new be,gg=new T(0,0,0),vg=new T(1,1,1),Cs=new T,Rl=new T,en=new T,kf=new be,Vf=new he,Pn=class s{constructor(t=0,e=0,i=0,n=s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=n}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,n=this._order){return this._x=t,this._y=e,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let n=t.elements,r=n[0],o=n[4],a=n[8],l=n[1],c=n[5],h=n[9],u=n[2],d=n[6],f=n[10];switch(e){case"XYZ":this._y=Math.asin(de(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-de(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(de(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-de(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(de(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-de(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:jt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return kf.makeRotationFromQuaternion(t),this.setFromRotationMatrix(kf,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Vf.setFromEuler(this),this.setFromQuaternion(Vf,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Pn.DEFAULT_ORDER="XYZ";var ma=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},xg=0,Gf=new T,Rr=new he,hs=new be,Cl=new T,$o=new T,yg=new T,_g=new he,Wf=new T(1,0,0),qf=new T(0,1,0),Xf=new T(0,0,1),Yf={type:"added"},Mg={type:"removed"},Cr={type:"childadded",child:null},Mu={type:"childremoved",child:null},vi=class s extends Xn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:xg++}),this.uuid=Wn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let t=new T,e=new Pn,i=new he,n=new T(1,1,1);function r(){i.setFromEuler(e,!1)}function o(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new be},normalMatrix:{value:new ie}}),this.matrix=new be,this.matrixWorld=new be,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ma,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Rr.setFromAxisAngle(t,e),this.quaternion.multiply(Rr),this}rotateOnWorldAxis(t,e){return Rr.setFromAxisAngle(t,e),this.quaternion.premultiply(Rr),this}rotateX(t){return this.rotateOnAxis(Wf,t)}rotateY(t){return this.rotateOnAxis(qf,t)}rotateZ(t){return this.rotateOnAxis(Xf,t)}translateOnAxis(t,e){return Gf.copy(t).applyQuaternion(this.quaternion),this.position.add(Gf.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Wf,t)}translateY(t){return this.translateOnAxis(qf,t)}translateZ(t){return this.translateOnAxis(Xf,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(hs.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?Cl.copy(t):Cl.set(t,e,i);let n=this.parent;this.updateWorldMatrix(!0,!1),$o.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?hs.lookAt($o,Cl,this.up):hs.lookAt(Cl,$o,this.up),this.quaternion.setFromRotationMatrix(hs),n&&(hs.extractRotation(n.matrixWorld),Rr.setFromRotationMatrix(hs),this.quaternion.premultiply(Rr.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(te("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Yf),Cr.child=t,this.dispatchEvent(Cr),Cr.child=null):te("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Mg),Mu.child=t,this.dispatchEvent(Mu),Mu.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),hs.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),hs.multiply(t.parent.matrixWorld)),t.applyMatrix4(hs),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Yf),Cr.child=t,this.dispatchEvent(Cr),Cr.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,n=this.children.length;i<n;i++){let o=this.children[i].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let n=this.children;for(let r=0,o=n.length;r<o;r++)n[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose($o,t,yg),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose($o,_g,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,n=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*i-r[8]*n,r[13]+=i-r[1]*e-r[5]*i-r[9]*n,r[14]+=n-r[2]*e-r[6]*i-r[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};n.uuid=this.uuid,n.type=this.type,n.name=this.name,n.castShadow=this.castShadow,n.receiveShadow=this.receiveShadow,n.visible=this.visible,n.frustumCulled=this.frustumCulled,n.renderOrder=this.renderOrder,n.static=this.static,n.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(a=>({...a})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(t),n.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));n.material=a}else n.material=r(t.materials,this.material);if(this.children.length>0){n.children=[];for(let a=0;a<this.children.length;a++)n.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){n.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];n.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=n,i;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let n=t.children[i];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};vi.DEFAULT_UP=new T(0,1,0);vi.DEFAULT_MATRIX_AUTO_UPDATE=!0;vi.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Me=class extends vi{constructor(){super(),this.isGroup=!0,this.type="Group"}},bg={type:"move"},Jr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Me,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Me,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new T,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new T),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Me,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new T,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new T,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let n=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let v of t.hand.values()){let p=e.getJointPose(v,i),m=this._getHandJoint(c,v);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(n=e.getPose(t.targetRaySpace,i),n===null&&r!==null&&(n=r),n!==null&&(a.matrix.fromArray(n.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,n.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(n.linearVelocity)):a.hasLinearVelocity=!1,n.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(n.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(bg)))}return a!==null&&(a.visible=n!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new Me;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},Qp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ps={h:0,s:0,l:0},Pl={h:0,s:0,l:0};function bu(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}var St=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let n=t;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=ze){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,_e.colorSpaceToWorking(this,e),this}setRGB(t,e,i,n=_e.workingColorSpace){return this.r=t,this.g=e,this.b=i,_e.colorSpaceToWorking(this,n),this}setHSL(t,e,i,n=_e.workingColorSpace){if(t=md(t,1),e=de(e,0,1),i=de(i,0,1),e===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+e):i+e-i*e,o=2*i-r;this.r=bu(o,r,t+1/3),this.g=bu(o,r,t),this.b=bu(o,r,t-1/3)}return _e.colorSpaceToWorking(this,n),this}setStyle(t,e=ze){function i(r){r!==void 0&&parseFloat(r)<1&&jt("Color: Alpha component of "+t+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=n[1],a=n[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:jt("Color: Unknown color model "+t)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=n[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);jt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=ze){let i=Qp[t.toLowerCase()];return i!==void 0?this.setHex(i,e):jt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=gs(t.r),this.g=gs(t.g),this.b=gs(t.b),this}copyLinearToSRGB(t){return this.r=Wr(t.r),this.g=Wr(t.g),this.b=Wr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=ze){return _e.workingToColorSpace(Ui.copy(this),t),Math.round(de(Ui.r*255,0,255))*65536+Math.round(de(Ui.g*255,0,255))*256+Math.round(de(Ui.b*255,0,255))}getHexString(t=ze){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=_e.workingColorSpace){_e.workingToColorSpace(Ui.copy(this),e);let i=Ui.r,n=Ui.g,r=Ui.b,o=Math.max(i,n,r),a=Math.min(i,n,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case i:l=(n-r)/u+(n<r?6:0);break;case n:l=(r-i)/u+2;break;case r:l=(i-n)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=_e.workingColorSpace){return _e.workingToColorSpace(Ui.copy(this),e),t.r=Ui.r,t.g=Ui.g,t.b=Ui.b,t}getStyle(t=ze){_e.workingToColorSpace(Ui.copy(this),t);let e=Ui.r,i=Ui.g,n=Ui.b;return t!==ze?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(t,e,i){return this.getHSL(Ps),this.setHSL(Ps.h+t,Ps.s+e,Ps.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(Ps),t.getHSL(Pl);let i=oa(Ps.h,Pl.h,e),n=oa(Ps.s,Pl.s,e),r=oa(Ps.l,Pl.l,e);return this.setHSL(i,n,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,n=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*n,this.g=r[1]*e+r[4]*i+r[7]*n,this.b=r[2]*e+r[5]*i+r[8]*n,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ui=new St;St.NAMES=Qp;var ga=class s{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new St(t),this.density=e}clone(){return new s(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Yn=class extends vi{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Pn,this.environmentIntensity=1,this.environmentRotation=new Pn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},wn=new T,us=new T,Su=new T,ds=new T,Pr=new T,Ir=new T,Zf=new T,Eu=new T,Tu=new T,wu=new T,Au=new Ke,Ru=new Ke,Cu=new Ke,ms=class s{constructor(t=new T,e=new T,i=new T){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,n){n.subVectors(i,e),wn.subVectors(t,e),n.cross(wn);let r=n.lengthSq();return r>0?n.multiplyScalar(1/Math.sqrt(r)):n.set(0,0,0)}static getBarycoord(t,e,i,n,r){wn.subVectors(n,e),us.subVectors(i,e),Su.subVectors(t,e);let o=wn.dot(wn),a=wn.dot(us),l=wn.dot(Su),c=us.dot(us),h=us.dot(Su),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(c*l-a*h)*d,g=(o*h-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(t,e,i,n){return this.getBarycoord(t,e,i,n,ds)===null?!1:ds.x>=0&&ds.y>=0&&ds.x+ds.y<=1}static getInterpolation(t,e,i,n,r,o,a,l){return this.getBarycoord(t,e,i,n,ds)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ds.x),l.addScaledVector(o,ds.y),l.addScaledVector(a,ds.z),l)}static getInterpolatedAttribute(t,e,i,n,r,o){return Au.setScalar(0),Ru.setScalar(0),Cu.setScalar(0),Au.fromBufferAttribute(t,e),Ru.fromBufferAttribute(t,i),Cu.fromBufferAttribute(t,n),o.setScalar(0),o.addScaledVector(Au,r.x),o.addScaledVector(Ru,r.y),o.addScaledVector(Cu,r.z),o}static isFrontFacing(t,e,i,n){return wn.subVectors(i,e),us.subVectors(t,e),wn.cross(us).dot(n)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,n){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[n]),this}setFromAttributeAndIndices(t,e,i,n){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,n),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return wn.subVectors(this.c,this.b),us.subVectors(this.a,this.b),wn.cross(us).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return s.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return s.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,n,r){return s.getInterpolation(t,this.a,this.b,this.c,e,i,n,r)}containsPoint(t){return s.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return s.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,n=this.b,r=this.c,o,a;Pr.subVectors(n,i),Ir.subVectors(r,i),Eu.subVectors(t,i);let l=Pr.dot(Eu),c=Ir.dot(Eu);if(l<=0&&c<=0)return e.copy(i);Tu.subVectors(t,n);let h=Pr.dot(Tu),u=Ir.dot(Tu);if(h>=0&&u<=h)return e.copy(n);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(i).addScaledVector(Pr,o);wu.subVectors(t,r);let f=Pr.dot(wu),g=Ir.dot(wu);if(g>=0&&f<=g)return e.copy(r);let v=f*c-l*g;if(v<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(i).addScaledVector(Ir,a);let p=h*g-f*u;if(p<=0&&u-h>=0&&f-g>=0)return Zf.subVectors(r,n),a=(u-h)/(u-h+(f-g)),e.copy(n).addScaledVector(Zf,a);let m=1/(p+v+d);return o=v*m,a=d*m,e.copy(i).addScaledVector(Pr,o).addScaledVector(Ir,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Zn=class{constructor(t=new T(1/0,1/0,1/0),e=new T(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(An.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(An.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=An.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,An):An.fromBufferAttribute(r,o),An.applyMatrix4(t.matrixWorld),this.expandByPoint(An);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Il.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Il.copy(i.boundingBox)),Il.applyMatrix4(t.matrixWorld),this.union(Il)}let n=t.children;for(let r=0,o=n.length;r<o;r++)this.expandByObject(n[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,An),An.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Jo),Ll.subVectors(this.max,Jo),Lr.subVectors(t.a,Jo),Dr.subVectors(t.b,Jo),Nr.subVectors(t.c,Jo),Is.subVectors(Dr,Lr),Ls.subVectors(Nr,Dr),ir.subVectors(Lr,Nr);let e=[0,-Is.z,Is.y,0,-Ls.z,Ls.y,0,-ir.z,ir.y,Is.z,0,-Is.x,Ls.z,0,-Ls.x,ir.z,0,-ir.x,-Is.y,Is.x,0,-Ls.y,Ls.x,0,-ir.y,ir.x,0];return!Pu(e,Lr,Dr,Nr,Ll)||(e=[1,0,0,0,1,0,0,0,1],!Pu(e,Lr,Dr,Nr,Ll))?!1:(Dl.crossVectors(Is,Ls),e=[Dl.x,Dl.y,Dl.z],Pu(e,Lr,Dr,Nr,Ll))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,An).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(An).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(fs[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),fs[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),fs[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),fs[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),fs[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),fs[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),fs[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),fs[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(fs),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},fs=[new T,new T,new T,new T,new T,new T,new T,new T],An=new T,Il=new Zn,Lr=new T,Dr=new T,Nr=new T,Is=new T,Ls=new T,ir=new T,Jo=new T,Ll=new T,Dl=new T,nr=new T;function Pu(s,t,e,i,n){for(let r=0,o=s.length-3;r<=o;r+=3){nr.fromArray(s,r);let a=n.x*Math.abs(nr.x)+n.y*Math.abs(nr.y)+n.z*Math.abs(nr.z),l=t.dot(nr),c=e.dot(nr),h=i.dot(nr);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var pi=new T,Nl=new Q,Sg=0,ge=class extends Xn{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Sg++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=fd,this.updateRanges=[],this.gpuType=gn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let n=0,r=this.itemSize;n<r;n++)this.array[t+n]=e.array[i+n];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Nl.fromBufferAttribute(this,e),Nl.applyMatrix3(t),this.setXY(e,Nl.x,Nl.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)pi.fromBufferAttribute(this,e),pi.applyMatrix3(t),this.setXYZ(e,pi.x,pi.y,pi.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)pi.fromBufferAttribute(this,e),pi.applyMatrix4(t),this.setXYZ(e,pi.x,pi.y,pi.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)pi.fromBufferAttribute(this,e),pi.applyNormalMatrix(t),this.setXYZ(e,pi.x,pi.y,pi.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)pi.fromBufferAttribute(this,e),pi.transformDirection(t),this.setXYZ(e,pi.x,pi.y,pi.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=Rn(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=Oe(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Rn(e,this.array)),e}setX(t,e){return this.normalized&&(e=Oe(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Rn(e,this.array)),e}setY(t,e){return this.normalized&&(e=Oe(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Rn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Oe(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Rn(e,this.array)),e}setW(t,e){return this.normalized&&(e=Oe(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=Oe(e,this.array),i=Oe(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,n){return t*=this.itemSize,this.normalized&&(e=Oe(e,this.array),i=Oe(i,this.array),n=Oe(n,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this}setXYZW(t,e,i,n,r){return t*=this.itemSize,this.normalized&&(e=Oe(e,this.array),i=Oe(i,this.array),n=Oe(n,this.array),r=Oe(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var va=class extends ge{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var xa=class extends ge{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var $t=class extends ge{constructor(t,e,i){super(new Float32Array(t),e,i)}},Eg=new Zn,Ko=new T,Iu=new T,vs=class{constructor(t=new T,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):Eg.setFromPoints(t).getCenter(i);let n=0;for(let r=0,o=t.length;r<o;r++)n=Math.max(n,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(n),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ko.subVectors(t,this.center);let e=Ko.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),n=(i-this.radius)*.5;this.center.addScaledVector(Ko,n/i),this.radius+=n}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Iu.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ko.copy(t.center).add(Iu)),this.expandByPoint(Ko.copy(t.center).sub(Iu))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Tg=0,fn=new be,Lu=new vi,Ur=new T,nn=new Zn,jo=new Zn,Ai=new T,re=class s extends Xn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Tg++}),this.uuid=Wn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new($0(t)?xa:va)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new ie().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return fn.makeRotationFromQuaternion(t),this.applyMatrix4(fn),this}rotateX(t){return fn.makeRotationX(t),this.applyMatrix4(fn),this}rotateY(t){return fn.makeRotationY(t),this.applyMatrix4(fn),this}rotateZ(t){return fn.makeRotationZ(t),this.applyMatrix4(fn),this}translate(t,e,i){return fn.makeTranslation(t,e,i),this.applyMatrix4(fn),this}scale(t,e,i){return fn.makeScale(t,e,i),this.applyMatrix4(fn),this}lookAt(t){return Lu.lookAt(t),Lu.updateMatrix(),this.applyMatrix4(Lu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ur).negate(),this.translate(Ur.x,Ur.y,Ur.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let n=0,r=t.length;n<r;n++){let o=t[n];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new $t(i,3))}else{let i=Math.min(t.length,e.count);for(let n=0;n<i;n++){let r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&jt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Zn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){te("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new T(-1/0,-1/0,-1/0),new T(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,n=e.length;i<n;i++){let r=e[i];nn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ai.addVectors(this.boundingBox.min,nn.min),this.boundingBox.expandByPoint(Ai),Ai.addVectors(this.boundingBox.max,nn.max),this.boundingBox.expandByPoint(Ai)):(this.boundingBox.expandByPoint(nn.min),this.boundingBox.expandByPoint(nn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&te('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vs);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){te("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new T,1/0);return}if(t){let i=this.boundingSphere.center;if(nn.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];jo.setFromBufferAttribute(a),this.morphTargetsRelative?(Ai.addVectors(nn.min,jo.min),nn.expandByPoint(Ai),Ai.addVectors(nn.max,jo.max),nn.expandByPoint(Ai)):(nn.expandByPoint(jo.min),nn.expandByPoint(jo.max))}nn.getCenter(i);let n=0;for(let r=0,o=t.count;r<o;r++)Ai.fromBufferAttribute(t,r),n=Math.max(n,i.distanceToSquared(Ai));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Ai.fromBufferAttribute(a,c),l&&(Ur.fromBufferAttribute(t,c),Ai.add(Ur)),n=Math.max(n,i.distanceToSquared(Ai))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&te('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){te("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,n=e.normal,r=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new ge(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let _=0;_<i.count;_++)a[_]=new T,l[_]=new T;let c=new T,h=new T,u=new T,d=new Q,f=new Q,g=new Q,v=new T,p=new T;function m(_,R,P){c.fromBufferAttribute(i,_),h.fromBufferAttribute(i,R),u.fromBufferAttribute(i,P),d.fromBufferAttribute(r,_),f.fromBufferAttribute(r,R),g.fromBufferAttribute(r,P),h.sub(c),u.sub(c),f.sub(d),g.sub(d);let I=1/(f.x*g.y-g.x*f.y);isFinite(I)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(I),p.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(I),a[_].add(v),a[R].add(v),a[P].add(v),l[_].add(p),l[R].add(p),l[P].add(p))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let _=0,R=x.length;_<R;++_){let P=x[_],I=P.start,N=P.count;for(let B=I,L=I+N;B<L;B+=3)m(t.getX(B+0),t.getX(B+1),t.getX(B+2))}let M=new T,y=new T,S=new T,b=new T;function A(_){S.fromBufferAttribute(n,_),b.copy(S);let R=a[_];M.copy(R),M.sub(S.multiplyScalar(S.dot(R))).normalize(),y.crossVectors(b,R);let I=y.dot(l[_])<0?-1:1;o.setXYZW(_,M.x,M.y,M.z,I)}for(let _=0,R=x.length;_<R;++_){let P=x[_],I=P.start,N=P.count;for(let B=I,L=I+N;B<L;B+=3)A(t.getX(B+0)),A(t.getX(B+1)),A(t.getX(B+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new ge(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let n=new T,r=new T,o=new T,a=new T,l=new T,c=new T,h=new T,u=new T;if(t)for(let d=0,f=t.count;d<f;d+=3){let g=t.getX(d+0),v=t.getX(d+1),p=t.getX(d+2);n.fromBufferAttribute(e,g),r.fromBufferAttribute(e,v),o.fromBufferAttribute(e,p),h.subVectors(o,r),u.subVectors(n,r),h.cross(u),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,v),c.fromBufferAttribute(i,p),a.add(h),l.add(h),c.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(v,l.x,l.y,l.z),i.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)n.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,r),u.subVectors(n,r),h.cross(u),i.setXYZ(d+0,h.x,h.y,h.z),i.setXYZ(d+1,h.x,h.y,h.z),i.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Ai.fromBufferAttribute(t,e),Ai.normalize(),t.setXYZ(e,Ai.x,Ai.y,Ai.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h),f=0,g=0;for(let v=0,p=l.length;v<p;v++){a.isInterleavedBufferAttribute?f=l[v]*a.data.stride+a.offset:f=l[v]*h;for(let m=0;m<h;m++)d[g++]=c[f++]}return new ge(d,h,u)}if(this.index===null)return jt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new s,i=this.index.array,n=this.attributes;for(let a in n){let l=n[a],c=t(l,i);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=t(d,i);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let n={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(n[l]=h,r=!0)}r&&(t.data.morphAttributes=n,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let n=t.attributes;for(let c in n){let h=n[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},ya=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=fd,this.updateRanges=[],this.version=0,this.uuid=Wn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,i){t*=this.stride,i*=e.stride;for(let n=0,r=this.stride;n<r;n++)this.array[t+n]=e.array[i+n];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Wn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(e,this.stride);return i.setUsage(this.usage),i}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Wn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}},Vi=new T,Kr=class s{constructor(t,e,i,n=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=i,this.normalized=n}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,i=this.data.count;e<i;e++)Vi.fromBufferAttribute(this,e),Vi.applyMatrix4(t),this.setXYZ(e,Vi.x,Vi.y,Vi.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Vi.fromBufferAttribute(this,e),Vi.applyNormalMatrix(t),this.setXYZ(e,Vi.x,Vi.y,Vi.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Vi.fromBufferAttribute(this,e),Vi.transformDirection(t),this.setXYZ(e,Vi.x,Vi.y,Vi.z);return this}getComponent(t,e){let i=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(i=Rn(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=Oe(i,this.array)),this.data.array[t*this.data.stride+this.offset+e]=i,this}setX(t,e){return this.normalized&&(e=Oe(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=Oe(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=Oe(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=Oe(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Rn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Rn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Rn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Rn(e,this.array)),e}setXY(t,e,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=Oe(e,this.array),i=Oe(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this}setXYZ(t,e,i,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=Oe(e,this.array),i=Oe(i,this.array),n=Oe(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=n,this}setXYZW(t,e,i,n,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=Oe(e,this.array),i=Oe(i,this.array),n=Oe(n,this.array),r=Oe(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=n,this.data.array[t+3]=r,this}clone(t){if(t===void 0){fa("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let n=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[n+r])}return new ge(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new s(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){fa("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let n=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[n+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Du=new T,wg=new T,Ag=new ie,Gi=class{constructor(t=new T(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,n){return this.normal.set(t,e,i),this.constant=n,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let n=Du.subVectors(i,e).cross(wg.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(n,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let n=t.delta(Du),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/r;return i===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(n,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||Ag.getNormalMatrix(t),n=this.coplanarPoint(Du).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Rg=0,$n=class extends Xn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Rg++}),this.uuid=Wn(),this.name="",this.type="Material",this.blending=mn,this.side=Os,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=nd,this.blendDst=sd,this.blendEquation=hr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new St(0,0,0),this.blendAlpha=0,this.depthFunc=qr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Vp,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ic,this.stencilZFail=ic,this.stencilZPass=ic,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){jt(`Material: parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){jt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(e){let r=n(t.textures),o=n(t.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new St().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new Gi().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Q().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Q().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let n=e.length;i=new Array(n);for(let r=0;r!==n;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},jr=class extends $n{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new St(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Fr,Qo=new T,Br=new T,Or=new T,Hr=new Q,ta=new Q,tm=new be,Ul=new T,ea=new T,Fl=new T,$f=new Q,Nu=new Q,Jf=new Q,_a=class extends vi{constructor(t=new jr){if(super(),this.isSprite=!0,this.type="Sprite",Fr===void 0){Fr=new re;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new ya(e,5);Fr.setIndex([0,1,2,0,2,3]),Fr.setAttribute("position",new Kr(i,3,0,!1)),Fr.setAttribute("uv",new Kr(i,2,3,!1))}this.geometry=Fr,this.material=t,this.center=new Q(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&te('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Br.setFromMatrixScale(this.matrixWorld),tm.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Or.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Br.multiplyScalar(-Or.z);let i=this.material.rotation,n,r;i!==0&&(r=Math.cos(i),n=Math.sin(i));let o=this.center;Bl(Ul.set(-.5,-.5,0),Or,o,Br,n,r),Bl(ea.set(.5,-.5,0),Or,o,Br,n,r),Bl(Fl.set(.5,.5,0),Or,o,Br,n,r),$f.set(0,0),Nu.set(1,0),Jf.set(1,1);let a=t.ray.intersectTriangle(Ul,ea,Fl,!1,Qo);if(a===null&&(Bl(ea.set(-.5,.5,0),Or,o,Br,n,r),Nu.set(0,1),a=t.ray.intersectTriangle(Ul,Fl,ea,!1,Qo),a===null))return;let l=t.ray.origin.distanceTo(Qo);l<t.near||l>t.far||e.push({distance:l,point:Qo.clone(),uv:ms.getInterpolation(Qo,Ul,ea,Fl,$f,Nu,Jf,new Q),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function Bl(s,t,e,i,n,r){Hr.subVectors(s,e).addScalar(.5).multiply(i),n!==void 0?(ta.x=r*Hr.x-n*Hr.y,ta.y=n*Hr.x+r*Hr.y):ta.copy(Hr),s.copy(t),s.x+=ta.x,s.y+=ta.y,s.applyMatrix4(tm)}var ps=new T,Uu=new T,Ol=new T,Hl=new T,Ma=class{constructor(t=new T,e=new T(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ps)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=ps.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ps.copy(this.origin).addScaledVector(this.direction,e),ps.distanceToSquared(t))}distanceSqToSegment(t,e,i,n){Uu.copy(t).add(e).multiplyScalar(.5),Ol.copy(e).sub(t).normalize(),Hl.copy(this.origin).sub(Uu);let r=t.distanceTo(e)*.5,o=-this.direction.dot(Ol),a=Hl.dot(this.direction),l=-Hl.dot(Ol),c=Hl.lengthSq(),h=Math.abs(1-o*o),u,d,f,g;if(h>0)if(u=o*l-a,d=o*a-l,g=r*h,u>=0)if(d>=-g)if(d<=g){let v=1/h;u*=v,d*=v,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),n&&n.copy(Uu).addScaledVector(Ol,d),f}intersectSphere(t,e){if(t.radius<0)return null;ps.subVectors(t.center,this.origin);let i=ps.dot(this.direction),n=ps.dot(ps)-i*i,r=t.radius*t.radius;if(n>r)return null;let o=Math.sqrt(r-n),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,n,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(i=(t.min.x-d.x)*c,n=(t.max.x-d.x)*c):(i=(t.max.x-d.x)*c,n=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),i>o||r>n||((r>i||isNaN(i))&&(i=r),(o<n||isNaN(n))&&(n=o),u>=0?(a=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),i>l||a>n)||((a>i||i!==i)&&(i=a),(l<n||n!==n)&&(n=l),n<0)?null:this.at(i>=0?i:n,e)}intersectsBox(t){return this.intersectBox(t,ps)!==null}intersectTriangle(t,e,i,n,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,u=t.x-o.x,d=t.y-o.y,f=t.z-o.z,g=e.x-o.x,v=e.y-o.y,p=e.z-o.z,m=i.x-o.x,x=i.y-o.y,M=i.z-o.z,y=Math.abs(l),S=Math.abs(c),b=Math.abs(h),A,_,R,P,I,N,B,L,O,q,Y,rt;if(y>=S&&y>=b?(R=l,N=u,O=g,rt=m,l>=0?(A=c,_=h,P=d,I=f,B=v,L=p,q=x,Y=M):(A=h,_=c,P=f,I=d,B=p,L=v,q=M,Y=x)):S>=b?(R=c,N=d,O=v,rt=x,c>=0?(A=h,_=l,P=f,I=u,B=p,L=g,q=M,Y=m):(A=l,_=h,P=u,I=f,B=g,L=p,q=m,Y=M)):(R=h,N=f,O=p,rt=M,h>=0?(A=l,_=c,P=u,I=d,B=g,L=v,q=m,Y=x):(A=c,_=l,P=d,I=u,B=v,L=g,q=x,Y=m)),R===0)return null;let Z=A/R,tt=_/R,nt=1/R,Lt=P-Z*N,Pt=I-tt*N,ce=B-Z*O,ae=L-tt*O,le=q-Z*rt,X=Y-tt*rt,j=le*ae-X*ce,vt=Lt*X-Pt*le,Wt=ce*Pt-ae*Lt;if(n){if(j<0||vt<0||Wt<0)return null}else if((j<0||vt<0||Wt<0)&&(j>0||vt>0||Wt>0))return null;let Et=j+vt+Wt;if(Et===0)return null;let Zt=nt*(j*N+vt*O+Wt*rt);return(Et>0?Zt<0:Zt>0)?null:this.at(Zt/Et,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ve=class extends $n{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new St(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pn,this.combine=rd,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Kf=new be,sr=new Ma,zl=new vs,jf=new T,kl=new T,Vl=new T,Gl=new T,Fu=new T,Wl=new T,Qf=new T,ql=new T,ot=class extends vi{constructor(t=new re,e=new ve){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){let a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let i=this.geometry,n=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;e.fromBufferAttribute(n,t);let a=this.morphTargetInfluences;if(r&&a){Wl.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(Fu.fromBufferAttribute(u,t),o?Wl.addScaledVector(Fu,h):Wl.addScaledVector(Fu.sub(e),h))}e.add(Wl)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.material,r=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),zl.copy(i.boundingSphere),zl.applyMatrix4(r),sr.copy(t.ray).recast(t.near),!(zl.containsPoint(sr.origin)===!1&&(sr.intersectSphere(zl,jf)===null||sr.origin.distanceToSquared(jf)>(t.far-t.near)**2))&&(Kf.copy(r).invert(),sr.copy(t.ray).applyMatrix4(Kf),!(i.boundingBox!==null&&sr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,sr)))}_computeIntersections(t,e,i){let n,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=d.length;g<v;g++){let p=d[g],m=o[p.materialIndex],x=Math.max(p.start,f.start),M=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let y=x,S=M;y<S;y+=3){let b=a.getX(y),A=a.getX(y+1),_=a.getX(y+2);n=Xl(this,m,t,i,c,h,u,b,A,_),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=p.materialIndex,e.push(n))}}else{let g=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let p=g,m=v;p<m;p+=3){let x=a.getX(p),M=a.getX(p+1),y=a.getX(p+2);n=Xl(this,o,t,i,c,h,u,x,M,y),n&&(n.faceIndex=Math.floor(p/3),e.push(n))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,v=d.length;g<v;g++){let p=d[g],m=o[p.materialIndex],x=Math.max(p.start,f.start),M=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let y=x,S=M;y<S;y+=3){let b=y,A=y+1,_=y+2;n=Xl(this,m,t,i,c,h,u,b,A,_),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=p.materialIndex,e.push(n))}}else{let g=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let p=g,m=v;p<m;p+=3){let x=p,M=p+1,y=p+2;n=Xl(this,o,t,i,c,h,u,x,M,y),n&&(n.faceIndex=Math.floor(p/3),e.push(n))}}}};function Cg(s,t,e,i,n,r,o,a){let l;if(t.side===_i?l=i.intersectTriangle(o,r,n,!0,a):l=i.intersectTriangle(n,r,o,t.side===Os,a),l===null)return null;ql.copy(a),ql.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(ql);return c<e.near||c>e.far?null:{distance:c,point:ql.clone(),object:s}}function Xl(s,t,e,i,n,r,o,a,l,c){s.getVertexPosition(a,kl),s.getVertexPosition(l,Vl),s.getVertexPosition(c,Gl);let h=Cg(s,t,e,i,kl,Vl,Gl,Qf);if(h){let u=new T;ms.getBarycoord(Qf,kl,Vl,Gl,u),n&&(h.uv=ms.getInterpolatedAttribute(n,a,l,c,u,new Q)),r&&(h.uv1=ms.getInterpolatedAttribute(r,a,l,c,u,new Q)),o&&(h.normal=ms.getInterpolatedAttribute(o,a,l,c,u,new T),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new T,materialIndex:0};ms.getNormal(kl,Vl,Gl,d.normal),h.face=d,h.barycoord=u}return h}var ba=class extends Wi{constructor(t=null,e=1,i=1,n,r,o,a,l,c=mi,h=mi,u,d){super(null,o,a,l,c,h,n,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Jn=class extends ge{constructor(t,e,i,n=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},zr=new be,tp=new be,Yl=[],ep=new Zn,Pg=new be,ia=new ot,na=new vs,xs=class extends ot{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Jn(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,Pg)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Zn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,zr),ep.copy(t.boundingBox).applyMatrix4(zr),this.boundingBox.union(ep)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new vs),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,zr),na.copy(t.boundingSphere).applyMatrix4(zr),this.boundingSphere.union(na)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,n=this.morphTexture.source.data.data,r=i.length+1,o=t*r+1;for(let a=0;a<i.length;a++)i[a]=n[o+a]}raycast(t,e){let i=this.matrixWorld,n=this.count;if(ia.geometry=this.geometry,ia.material=this.material,ia.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),na.copy(this.boundingSphere),na.applyMatrix4(i),t.ray.intersectsSphere(na)!==!1))for(let r=0;r<n;r++){this.getMatrixAt(r,zr),tp.multiplyMatrices(i,zr),ia.matrixWorld=tp,ia.raycast(t,Yl);for(let o=0,a=Yl.length;o<a;o++){let l=Yl[o];l.instanceId=r,l.object=this,e.push(l)}Yl.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Jn(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new ba(new Float32Array(n*this.count),n,this.count,Vc,gn));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=n*t;return r[l]=a,r.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},rr=new vs,Ig=new Q(.5,.5),Zl=new T,Qr=class{constructor(t=new Gi,e=new Gi,i=new Gi,n=new Gi,r=new Gi,o=new Gi){this.planes=[t,e,i,n,r,o]}set(t,e,i,n,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(i),a[3].copy(n),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Cn,i=!1){let n=this.planes,r=t.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],g=r[8],v=r[9],p=r[10],m=r[11],x=r[12],M=r[13],y=r[14],S=r[15];if(n[0].setComponents(c-o,f-h,m-g,S-x).normalize(),n[1].setComponents(c+o,f+h,m+g,S+x).normalize(),n[2].setComponents(c+a,f+u,m+v,S+M).normalize(),n[3].setComponents(c-a,f-u,m-v,S-M).normalize(),i)n[4].setComponents(l,d,p,y).normalize(),n[5].setComponents(c-l,f-d,m-p,S-y).normalize();else if(n[4].setComponents(c-l,f-d,m-p,S-y).normalize(),e===Cn)n[5].setComponents(c+l,f+d,m+p,S+y).normalize();else if(e===Xr)n[5].setComponents(l,d,p,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),rr.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),rr.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(rr)}intersectsSprite(t){rr.center.set(0,0,0);let e=Ig.distanceTo(t.center);return rr.radius=.7071067811865476+e,rr.applyMatrix4(t.matrixWorld),this.intersectsSphere(rr)}intersectsSphere(t){let e=this.planes,i=t.center,n=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<n)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let n=e[i];if(Zl.x=n.normal.x>0?t.max.x:t.min.x,Zl.y=n.normal.y>0?t.max.y:t.min.y,Zl.z=n.normal.z>0?t.max.z:t.min.z,n.distanceToPoint(Zl)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var mc=class extends $n{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new St(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},ip=new be,Xu=new Ma,$l=new vs,Jl=new T,to=class extends vi{constructor(t=new re,e=new mc){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,r=t.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),$l.copy(i.boundingSphere),$l.applyMatrix4(n),$l.radius+=r,t.ray.intersectsSphere($l)===!1)return;ip.copy(n).invert(),Xu.copy(t.ray).applyMatrix4(ip);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,u=i.attributes.position;if(c!==null){let d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=d,v=f;g<v;g++){let p=c.getX(g);Jl.fromBufferAttribute(u,p),np(Jl,p,l,n,t,e,this)}}else{let d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=d,v=f;g<v;g++)Jl.fromBufferAttribute(u,g),np(Jl,g,l,n,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){let a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function np(s,t,e,i,n,r,o){let a=Xu.distanceSqToPoint(s);if(a<e){let l=new T;Xu.closestPointToPoint(s,l),l.applyMatrix4(i);let c=n.ray.origin.distanceTo(l);if(c<n.near||c>n.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Sa=class extends Wi{constructor(t=[],e=Hs,i,n,r,o,a,l,c,h){super(t,e,i,n,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},ri=class extends Wi{constructor(t,e,i,n,r,o,a,l,c){super(t,e,i,n,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Ns=class extends Wi{constructor(t,e,i=Dn,n,r,o,a=mi,l=mi,c,h=qn,u=1){if(h!==qn&&h!==ks)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:u};super(d,n,r,o,a,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new $r(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},gc=class extends Ns{constructor(t,e=Dn,i=Hs,n,r,o=mi,a=mi,l,c=qn){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,i,n,r,o,a,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Ea=class extends Wi{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},De=class s extends re{constructor(t=1,e=1,i=1,n=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:n,heightSegments:r,depthSegments:o};let a=this;n=Math.floor(n),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],d=0,f=0;g("z","y","x",-1,-1,i,e,t,o,r,0),g("z","y","x",1,-1,i,e,-t,o,r,1),g("x","z","y",1,1,t,i,e,n,o,2),g("x","z","y",1,-1,t,i,-e,n,o,3),g("x","y","z",1,-1,t,e,i,n,r,4),g("x","y","z",-1,-1,t,e,-i,n,r,5),this.setIndex(l),this.setAttribute("position",new $t(c,3)),this.setAttribute("normal",new $t(h,3)),this.setAttribute("uv",new $t(u,2));function g(v,p,m,x,M,y,S,b,A,_,R){let P=y/A,I=S/_,N=y/2,B=S/2,L=b/2,O=A+1,q=_+1,Y=0,rt=0,Z=new T;for(let tt=0;tt<q;tt++){let nt=tt*I-B;for(let Lt=0;Lt<O;Lt++){let Pt=Lt*P-N;Z[v]=Pt*x,Z[p]=nt*M,Z[m]=L,c.push(Z.x,Z.y,Z.z),Z[v]=0,Z[p]=0,Z[m]=b>0?1:-1,h.push(Z.x,Z.y,Z.z),u.push(Lt/A),u.push(1-tt/_),Y+=1}}for(let tt=0;tt<_;tt++)for(let nt=0;nt<A;nt++){let Lt=d+nt+O*tt,Pt=d+nt+O*(tt+1),ce=d+(nt+1)+O*(tt+1),ae=d+(nt+1)+O*tt;l.push(Lt,Pt,ae),l.push(Pt,ce,ae),rt+=6}a.addGroup(f,rt,R),f+=rt,d+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var In=class s extends re{constructor(t=1,e=32,i=0,n=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:n},e=Math.max(3,e);let r=[],o=[],a=[],l=[],c=new T,h=new Q;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=e;u++,d+=3){let f=i+u/e*n;c.x=t*Math.cos(f),c.y=t*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[d]/t+1)/2,h.y=(o[d+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new $t(o,3)),this.setAttribute("normal",new $t(a,3)),this.setAttribute("uv",new $t(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Qe=class s extends re{constructor(t=1,e=1,i=1,n=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:n,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;n=Math.floor(n),r=Math.floor(r);let h=[],u=[],d=[],f=[],g=0,v=[],p=i/2,m=0;x(),o===!1&&(t>0&&M(!0),e>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new $t(u,3)),this.setAttribute("normal",new $t(d,3)),this.setAttribute("uv",new $t(f,2));function x(){let y=new T,S=new T,b=0,A=(e-t)/i;for(let _=0;_<=r;_++){let R=[],P=_/r,I=P*(e-t)+t;for(let N=0;N<=n;N++){let B=N/n,L=B*l+a,O=Math.sin(L),q=Math.cos(L);S.x=I*O,S.y=-P*i+p,S.z=I*q,u.push(S.x,S.y,S.z),y.set(O,A,q).normalize(),d.push(y.x,y.y,y.z),f.push(B,1-P),R.push(g++)}v.push(R)}for(let _=0;_<n;_++)for(let R=0;R<r;R++){let P=v[R][_],I=v[R+1][_],N=v[R+1][_+1],B=v[R][_+1];(t>0||R!==0)&&(h.push(P,I,B),b+=3),(e>0||R!==r-1)&&(h.push(I,N,B),b+=3)}c.addGroup(m,b,0),m+=b}function M(y){let S=g,b=new Q,A=new T,_=0,R=y===!0?t:e,P=y===!0?1:-1;for(let N=1;N<=n;N++)u.push(0,p*P,0),d.push(0,P,0),f.push(.5,.5),g++;let I=g;for(let N=0;N<=n;N++){let L=N/n*l+a,O=Math.cos(L),q=Math.sin(L);A.x=R*q,A.y=p*P,A.z=R*O,u.push(A.x,A.y,A.z),d.push(0,P,0),b.x=O*.5+.5,b.y=q*.5*P+.5,f.push(b.x,b.y),g++}for(let N=0;N<n;N++){let B=S+N,L=I+N;y===!0?h.push(L,L+1,B):h.push(L+1,L,B),_+=3}c.addGroup(m,_,y===!0?1:2),m+=_}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ys=class s extends Qe{constructor(t=1,e=1,i=32,n=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,i,n,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:n,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new s(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},vc=class s extends re{constructor(t=[],e=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:n};let r=[],o=[];a(n),c(i),h(),this.setAttribute("position",new $t(r,3)),this.setAttribute("normal",new $t(r.slice(),3)),this.setAttribute("uv",new $t(o,2)),n===0?this.computeVertexNormals():this.normalizeNormals();function a(x){let M=new T,y=new T,S=new T;for(let b=0;b<e.length;b+=3)f(e[b+0],M),f(e[b+1],y),f(e[b+2],S),l(M,y,S,x)}function l(x,M,y,S){let b=S+1,A=[];for(let _=0;_<=b;_++){A[_]=[];let R=x.clone().lerp(y,_/b),P=M.clone().lerp(y,_/b),I=b-_;for(let N=0;N<=I;N++)N===0&&_===b?A[_][N]=R:A[_][N]=R.clone().lerp(P,N/I)}for(let _=0;_<b;_++)for(let R=0;R<2*(b-_)-1;R++){let P=Math.floor(R/2);R%2===0?(d(A[_][P+1]),d(A[_+1][P]),d(A[_][P])):(d(A[_][P+1]),d(A[_+1][P+1]),d(A[_+1][P]))}}function c(x){let M=new T;for(let y=0;y<r.length;y+=3)M.x=r[y+0],M.y=r[y+1],M.z=r[y+2],M.normalize().multiplyScalar(x),r[y+0]=M.x,r[y+1]=M.y,r[y+2]=M.z}function h(){let x=new T;for(let M=0;M<r.length;M+=3){x.x=r[M+0],x.y=r[M+1],x.z=r[M+2];let y=p(x)/2/Math.PI+.5,S=m(x)/Math.PI+.5;o.push(y,1-S)}g(),u()}function u(){for(let x=0;x<o.length;x+=6){let M=o[x+0],y=o[x+2],S=o[x+4],b=Math.max(M,y,S),A=Math.min(M,y,S);b>.9&&A<.1&&(M<.2&&(o[x+0]+=1),y<.2&&(o[x+2]+=1),S<.2&&(o[x+4]+=1))}}function d(x){r.push(x.x,x.y,x.z)}function f(x,M){let y=x*3;M.x=t[y+0],M.y=t[y+1],M.z=t[y+2]}function g(){let x=new T,M=new T,y=new T,S=new T,b=new Q,A=new Q,_=new Q;for(let R=0,P=0;R<r.length;R+=9,P+=6){x.set(r[R+0],r[R+1],r[R+2]),M.set(r[R+3],r[R+4],r[R+5]),y.set(r[R+6],r[R+7],r[R+8]),b.set(o[P+0],o[P+1]),A.set(o[P+2],o[P+3]),_.set(o[P+4],o[P+5]),S.copy(x).add(M).add(y).divideScalar(3);let I=p(S);v(b,P+0,x,I),v(A,P+2,M,I),v(_,P+4,y,I)}}function v(x,M,y,S){S<0&&x.x===1&&(o[M]=x.x-1),y.x===0&&y.z===0&&(o[M]=S/2/Math.PI+.5)}function p(x){return Math.atan2(x.z,-x.x)}function m(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.vertices,t.indices,t.radius,t.detail)}};var sn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){jt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let i=this.getUtoTmapping(t);return this.getPoint(i,e)}getPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return e}getSpacedPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPointAt(i/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],i,n=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)i=this.getPoint(o/t),r+=i.distanceTo(n),e.push(r),n=i;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let i=this.getLengths(),n=0,r=i.length,o;e?o=e:o=t*i[r-1];let a=0,l=r-1,c;for(;a<=l;)if(n=Math.floor(a+(l-a)/2),c=i[n]-o,c<0)a=n+1;else if(c>0)l=n-1;else{l=n;break}if(n=l,i[n]===o)return n/(r-1);let h=i[n],d=i[n+1]-h,f=(o-h)/d;return(n+f)/(r-1)}getTangent(t,e){let n=t-1e-4,r=t+1e-4;n<0&&(n=0),r>1&&(r=1);let o=this.getPoint(n),a=this.getPoint(r),l=e||(o.isVector2?new Q:new T);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){let i=this.getUtoTmapping(t);return this.getTangent(i,e)}computeFrenetFrames(t,e=!1){let i=new T,n=[],r=[],o=[],a=new T,l=new be;for(let f=0;f<=t;f++){let g=f/t;n[f]=this.getTangentAt(g,new T)}r[0]=new T,o[0]=new T;let c=Number.MAX_VALUE,h=Math.abs(n[0].x),u=Math.abs(n[0].y),d=Math.abs(n[0].z);h<=c&&(c=h,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),d<=c&&i.set(0,0,1),a.crossVectors(n[0],i).normalize(),r[0].crossVectors(n[0],a),o[0].crossVectors(n[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(n[f-1],n[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(de(n[f-1].dot(n[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(n[f],r[f])}if(e===!0){let f=Math.acos(de(r[0].dot(r[t]),-1,1));f/=t,n[0].dot(a.crossVectors(r[0],r[t]))>0&&(f=-f);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(n[g],f*g)),o[g].crossVectors(n[g],r[g])}return{tangents:n,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},eo=class extends sn{constructor(t=0,e=0,i=1,n=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=i,this.yRadius=n,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new Q){let i=e,n=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=n;for(;r>n;)r-=n;r<Number.EPSILON&&(o?r=0:r=n),this.aClockwise===!0&&!o&&(r===n?r=-n:r=r-n);let a=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return i.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},xc=class extends eo{constructor(t,e,i,n,r,o){super(t,e,i,i,n,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function gd(){let s=0,t=0,e=0,i=0;function n(r,o,a,l){s=r,t=a,e=-3*r+3*o-2*a-l,i=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){n(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,f*=h,n(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return s+t*r+e*o+i*a}}}var sp=new T,rp=new T,Bu=new gd,Ou=new gd,Hu=new gd,io=class extends sn{constructor(t=[],e=!1,i="centripetal",n=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=i,this.tension=n}getPoint(t,e=new T){let i=e,n=this.points,r=n.length,o=(r-(this.closed?0:1))*t,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=n[(a-1)%r]:(rp.subVectors(n[0],n[1]).add(n[0]),c=rp);let u=n[a%r],d=n[(a+1)%r];if(this.closed||a+2<r?h=n[(a+2)%r]:(sp.subVectors(n[r-1],n[r-2]).add(n[r-1]),h=sp),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(u),f),v=Math.pow(u.distanceToSquared(d),f),p=Math.pow(d.distanceToSquared(h),f);v<1e-4&&(v=1),g<1e-4&&(g=v),p<1e-4&&(p=v),Bu.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,v,p),Ou.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,v,p),Hu.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,v,p)}else this.curveType==="catmullrom"&&(Bu.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),Ou.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),Hu.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return i.set(Bu.calc(l),Ou.calc(l),Hu.calc(l)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(n.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let n=this.points[e];t.points.push(n.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(new T().fromArray(n))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function op(s,t,e,i,n){let r=(i-t)*.5,o=(n-e)*.5,a=s*s,l=s*a;return(2*e-2*i+r+o)*l+(-3*e+3*i-2*r-o)*a+r*s+e}function Lg(s,t){let e=1-s;return e*e*t}function Dg(s,t){return 2*(1-s)*s*t}function Ng(s,t){return s*s*t}function aa(s,t,e,i){return Lg(s,t)+Dg(s,e)+Ng(s,i)}function Ug(s,t){let e=1-s;return e*e*e*t}function Fg(s,t){let e=1-s;return 3*e*e*s*t}function Bg(s,t){return 3*(1-s)*s*s*t}function Og(s,t){return s*s*s*t}function la(s,t,e,i,n){return Ug(s,t)+Fg(s,e)+Bg(s,i)+Og(s,n)}var Ta=class extends sn{constructor(t=new Q,e=new Q,i=new Q,n=new Q){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=i,this.v3=n}getPoint(t,e=new Q){let i=e,n=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(la(t,n.x,r.x,o.x,a.x),la(t,n.y,r.y,o.y,a.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},yc=class extends sn{constructor(t=new T,e=new T,i=new T,n=new T){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=i,this.v3=n}getPoint(t,e=new T){let i=e,n=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(la(t,n.x,r.x,o.x,a.x),la(t,n.y,r.y,o.y,a.y),la(t,n.z,r.z,o.z,a.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},wa=class extends sn{constructor(t=new Q,e=new Q){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new Q){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new Q){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},no=class extends sn{constructor(t=new T,e=new T){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new T){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new T){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Aa=class extends sn{constructor(t=new Q,e=new Q,i=new Q){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new Q){let i=e,n=this.v0,r=this.v1,o=this.v2;return i.set(aa(t,n.x,r.x,o.x),aa(t,n.y,r.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Ra=class extends sn{constructor(t=new T,e=new T,i=new T){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new T){let i=e,n=this.v0,r=this.v1,o=this.v2;return i.set(aa(t,n.x,r.x,o.x),aa(t,n.y,r.y,o.y),aa(t,n.z,r.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Ca=class extends sn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new Q){let i=e,n=this.points,r=(n.length-1)*t,o=Math.floor(r),a=r-o,l=n[o===0?o:o-1],c=n[o],h=n[o>n.length-2?n.length-1:o+1],u=n[o>n.length-3?n.length-1:o+2];return i.set(op(a,l.x,c.x,h.x,u.x),op(a,l.y,c.y,h.y,u.y)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(n.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let n=this.points[e];t.points.push(n.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(new Q().fromArray(n))}return this}},_c=Object.freeze({__proto__:null,ArcCurve:xc,CatmullRomCurve3:io,CubicBezierCurve:Ta,CubicBezierCurve3:yc,EllipseCurve:eo,LineCurve:wa,LineCurve3:no,QuadraticBezierCurve:Aa,QuadraticBezierCurve3:Ra,SplineCurve:Ca}),so=class extends sn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let i=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new _c[i](e,t))}return this}getPoint(t,e){let i=t*this.getLength(),n=this.getCurveLengths(),r=0;for(;r<n.length;){if(n[r]>=i){let o=n[r]-i,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let i=0,n=this.curves.length;i<n;i++)e+=this.curves[i].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],i;for(let n=0,r=this.curves;n<r.length;n++){let o=r[n],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(e.push(h),i=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let n=t.curves[e];this.curves.push(n.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,i=this.curves.length;e<i;e++){let n=this.curves[e];t.curves.push(n.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let n=t.curves[e];this.curves.push(new _c[n.type]().fromJSON(n))}return this}},Pa=class extends so{constructor(t){super(),this.type="Path",this.currentPoint=new Q,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,i=t.length;e<i;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let i=new wa(this.currentPoint.clone(),new Q(t,e));return this.curves.push(i),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,i,n){let r=new Aa(this.currentPoint.clone(),new Q(t,e),new Q(i,n));return this.curves.push(r),this.currentPoint.set(i,n),this}bezierCurveTo(t,e,i,n,r,o){let a=new Ta(this.currentPoint.clone(),new Q(t,e),new Q(i,n),new Q(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),i=new Ca(e);return this.curves.push(i),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,i,n,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,i,n,r,o),this}absarc(t,e,i,n,r,o){return this.absellipse(t,e,i,i,n,r,o),this}ellipse(t,e,i,n,r,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,i,n,r,o,a,l),this}absellipse(t,e,i,n,r,o,a,l){let c=new eo(t,e,i,n,r,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Kn=class extends Pa{constructor(t){super(t),this.uuid=Wn(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let i=0,n=this.holes.length;i<n;i++)e[i]=this.holes[i].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let n=t.holes[e];this.holes.push(n.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,i=this.holes.length;e<i;e++){let n=this.holes[e];t.holes.push(n.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let n=t.holes[e];this.holes.push(new Pa().fromJSON(n))}return this}};function Hg(s,t,e=2){let i=t&&t.length,n=i?t[0]*e:s.length,r=em(s,0,n,e,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(i&&(r=Wg(s,t,r,e)),s.length>80*e){a=s[0],l=s[1];let h=a,u=l;for(let d=e;d<n;d+=e){let f=s[d],g=s[d+1];f<a&&(a=f),g<l&&(l=g),f>h&&(h=f),g>u&&(u=g)}c=Math.max(h-a,u-l),c=c!==0?32767/c:0}return Ia(r,o,e,a,l,c,0),o}function em(s,t,e,i,n){let r;if(n===ev(s,t,e,i)>0)for(let o=t;o<e;o+=i)r=ap(o/i|0,s[o],s[o+1],r);else for(let o=e-i;o>=t;o-=i)r=ap(o/i|0,s[o],s[o+1],r);return r&&ro(r,r.next)&&(Da(r),r=r.next),r}function ar(s,t){if(!s)return s;t||(t=s);let e=s,i;do if(i=!1,!e.steiner&&(ro(e,e.next)||ii(e.prev,e,e.next)===0)){if(Da(e),e=t=e.prev,e===e.next)break;i=!0}else e=e.next;while(i||e!==t);return t}function Ia(s,t,e,i,n,r,o){if(!s)return;!o&&r&&$g(s,i,n,r);let a=s;for(;s.prev!==s.next;){let l=s.prev,c=s.next;if(r?kg(s,i,n,r):zg(s)){t.push(l.i,s.i,c.i),Da(s),s=c.next,a=c.next;continue}if(s=c,s===a){o?o===1?(s=Vg(ar(s),t),Ia(s,t,e,i,n,r,2)):o===2&&Gg(s,t,e,i,n,r):Ia(ar(s),t,e,i,n,r,1);break}}}function zg(s){let t=s.prev,e=s,i=s.next;if(ii(t,e,i)>=0)return!1;let n=t.x,r=e.x,o=i.x,a=t.y,l=e.y,c=i.y,h=Math.min(n,r,o),u=Math.min(a,l,c),d=Math.max(n,r,o),f=Math.max(a,l,c),g=i.next;for(;g!==t;){if(g.x>=h&&g.x<=d&&g.y>=u&&g.y<=f&&sa(n,a,r,l,o,c,g.x,g.y)&&ii(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function kg(s,t,e,i){let n=s.prev,r=s,o=s.next;if(ii(n,r,o)>=0)return!1;let a=n.x,l=r.x,c=o.x,h=n.y,u=r.y,d=o.y,f=Math.min(a,l,c),g=Math.min(h,u,d),v=Math.max(a,l,c),p=Math.max(h,u,d),m=Yu(f,g,t,e,i),x=Yu(v,p,t,e,i),M=s.prevZ,y=s.nextZ;for(;M&&M.z>=m&&y&&y.z<=x;){if(M.x>=f&&M.x<=v&&M.y>=g&&M.y<=p&&M!==n&&M!==o&&sa(a,h,l,u,c,d,M.x,M.y)&&ii(M.prev,M,M.next)>=0||(M=M.prevZ,y.x>=f&&y.x<=v&&y.y>=g&&y.y<=p&&y!==n&&y!==o&&sa(a,h,l,u,c,d,y.x,y.y)&&ii(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;M&&M.z>=m;){if(M.x>=f&&M.x<=v&&M.y>=g&&M.y<=p&&M!==n&&M!==o&&sa(a,h,l,u,c,d,M.x,M.y)&&ii(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;y&&y.z<=x;){if(y.x>=f&&y.x<=v&&y.y>=g&&y.y<=p&&y!==n&&y!==o&&sa(a,h,l,u,c,d,y.x,y.y)&&ii(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function Vg(s,t){let e=s;do{let i=e.prev,n=e.next.next;!ro(i,n)&&nm(i,e,e.next,n)&&La(i,n)&&La(n,i)&&(t.push(i.i,e.i,n.i),Da(e),Da(e.next),e=s=n),e=e.next}while(e!==s);return ar(e)}function Gg(s,t,e,i,n,r){let o=s;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&jg(o,a)){let l=sm(o,a);o=ar(o,o.next),l=ar(l,l.next),Ia(o,t,e,i,n,r,0),Ia(l,t,e,i,n,r,0);return}a=a.next}o=o.next}while(o!==s)}function Wg(s,t,e,i){let n=[];for(let r=0,o=t.length;r<o;r++){let a=t[r]*i,l=r<o-1?t[r+1]*i:s.length,c=em(s,a,l,i,!1);c===c.next&&(c.steiner=!0),n.push(Kg(c))}n.sort(qg);for(let r=0;r<n.length;r++)e=Xg(n[r],e);return e}function qg(s,t){let e=s.x-t.x;if(e===0&&(e=s.y-t.y,e===0)){let i=(s.next.y-s.y)/(s.next.x-s.x),n=(t.next.y-t.y)/(t.next.x-t.x);e=i-n}return e}function Xg(s,t){let e=Yg(s,t);if(!e)return t;let i=sm(e,s);return ar(i,i.next),ar(e,e.next)}function Yg(s,t){let e=t,i=s.x,n=s.y,r=-1/0,o;if(ro(s,e))return e;do{if(ro(s,e.next))return e.next;if(n<=e.y&&n>=e.next.y&&e.next.y!==e.y){let u=e.x+(n-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(u<=i&&u>r&&(r=u,o=e.x<e.next.x?e:e.next,u===i))return o}e=e.next}while(e!==t);if(!o)return null;let a=o,l=o.x,c=o.y,h=1/0;e=o;do{if(i>=e.x&&e.x>=l&&i!==e.x&&im(n<c?i:r,n,l,c,n<c?r:i,n,e.x,e.y)){let u=Math.abs(n-e.y)/(i-e.x);La(e,s)&&(u<h||u===h&&(e.x>o.x||e.x===o.x&&Zg(o,e)))&&(o=e,h=u)}e=e.next}while(e!==a);return o}function Zg(s,t){return ii(s.prev,s,t.prev)<0&&ii(t.next,s,s.next)<0}function $g(s,t,e,i){let n=s;do n.z===0&&(n.z=Yu(n.x,n.y,t,e,i)),n.prevZ=n.prev,n.nextZ=n.next,n=n.next;while(n!==s);n.prevZ.nextZ=null,n.prevZ=null,Jg(n)}function Jg(s){let t,e=1;do{let i=s,n;s=null;let r=null;for(t=0;i;){t++;let o=i,a=0;for(let c=0;c<e&&(a++,o=o.nextZ,!!o);c++);let l=e;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||i.z<=o.z)?(n=i,i=i.nextZ,a--):(n=o,o=o.nextZ,l--),r?r.nextZ=n:s=n,n.prevZ=r,r=n;i=o}r.nextZ=null,e*=2}while(t>1);return s}function Yu(s,t,e,i,n){return s=(s-e)*n|0,t=(t-i)*n|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,s|t<<1}function Kg(s){let t=s,e=s;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==s);return e}function im(s,t,e,i,n,r,o,a){return(n-o)*(t-a)>=(s-o)*(r-a)&&(s-o)*(i-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(n-o)*(i-a)}function sa(s,t,e,i,n,r,o,a){return!(s===o&&t===a)&&im(s,t,e,i,n,r,o,a)}function jg(s,t){return s.next.i!==t.i&&s.prev.i!==t.i&&!Qg(s,t)&&(La(s,t)&&La(t,s)&&tv(s,t)&&(ii(s.prev,s,t.prev)||ii(s,t.prev,t))||ro(s,t)&&ii(s.prev,s,s.next)>0&&ii(t.prev,t,t.next)>0)}function ii(s,t,e){return(t.y-s.y)*(e.x-t.x)-(t.x-s.x)*(e.y-t.y)}function ro(s,t){return s.x===t.x&&s.y===t.y}function nm(s,t,e,i){let n=jl(ii(s,t,e)),r=jl(ii(s,t,i)),o=jl(ii(e,i,s)),a=jl(ii(e,i,t));return!!(n!==r&&o!==a||n===0&&Kl(s,e,t)||r===0&&Kl(s,i,t)||o===0&&Kl(e,s,i)||a===0&&Kl(e,t,i))}function Kl(s,t,e){return t.x<=Math.max(s.x,e.x)&&t.x>=Math.min(s.x,e.x)&&t.y<=Math.max(s.y,e.y)&&t.y>=Math.min(s.y,e.y)}function jl(s){return s>0?1:s<0?-1:0}function Qg(s,t){let e=s;do{if(e.i!==s.i&&e.next.i!==s.i&&e.i!==t.i&&e.next.i!==t.i&&nm(e,e.next,s,t))return!0;e=e.next}while(e!==s);return!1}function La(s,t){return ii(s.prev,s,s.next)<0?ii(s,t,s.next)>=0&&ii(s,s.prev,t)>=0:ii(s,t,s.prev)<0||ii(s,s.next,t)<0}function tv(s,t){let e=s,i=!1,n=(s.x+t.x)/2,r=(s.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&n<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(i=!i),e=e.next;while(e!==s);return i}function sm(s,t){let e=Zu(s.i,s.x,s.y),i=Zu(t.i,t.x,t.y),n=s.next,r=t.prev;return s.next=t,t.prev=s,e.next=n,n.prev=e,i.next=e,e.prev=i,r.next=i,i.prev=r,i}function ap(s,t,e,i){let n=Zu(s,t,e);return i?(n.next=i.next,n.prev=i,i.next.prev=n,i.next=n):(n.prev=n,n.next=n),n}function Da(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Zu(s,t,e){return{i:s,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function ev(s,t,e,i){let n=0;for(let r=t,o=e-i;r<e;r+=i)n+=(s[o]-s[r])*(s[r+1]+s[o+1]),o=r;return n}var $u=class{static triangulate(t,e,i=2){return Hg(t,e,i)}},Gn=class s{static area(t){let e=t.length,i=0;for(let n=e-1,r=0;r<e;n=r++)i+=t[n].x*t[r].y-t[r].x*t[n].y;return i*.5}static isClockWise(t){return s.area(t)<0}static triangulateShape(t,e){let i=[],n=[],r=[];lp(t),cp(i,t);let o=t.length;e.forEach(lp);for(let l=0;l<e.length;l++)n.push(o),o+=e[l].length,cp(i,e[l]);let a=$u.triangulate(i,n);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function lp(s){let t=s.length;t>2&&s[t-1].equals(s[0])&&s.pop()}function cp(s,t){for(let e=0;e<t.length;e++)s.push(t[e].x),s.push(t[e].y)}var oo=class s extends re{constructor(t=new Kn([new Q(.5,.5),new Q(-.5,.5),new Q(-.5,-.5),new Q(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let i=this,n=[],r=[];for(let a=0,l=t.length;a<l;a++){let c=t[a];o(c)}this.setAttribute("position",new $t(n,3)),this.setAttribute("uv",new $t(r,2)),this.computeVertexNormals();function o(a){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:f-.1,v=e.bevelOffset!==void 0?e.bevelOffset:0,p=e.bevelSegments!==void 0?e.bevelSegments:3,m=e.extrudePath,x=e.UVGenerator!==void 0?e.UVGenerator:iv,M,y=!1,S,b,A,_;if(m){M=m.getSpacedPoints(h),y=!0,d=!1;let st=m.isCatmullRomCurve3?m.closed:!1;S=m.computeFrenetFrames(h,st),b=new T,A=new T,_=new T}d||(p=0,f=0,g=0,v=0);let R=a.extractPoints(c),P=R.shape,I=R.holes;if(!Gn.isClockWise(P)){P=P.reverse();for(let st=0,ct=I.length;st<ct;st++){let dt=I[st];Gn.isClockWise(dt)&&(I[st]=dt.reverse())}}function B(st){let dt=10000000000000001e-36,ft=st[0];for(let mt=1;mt<=st.length;mt++){let Jt=mt%st.length,Xt=st[Jt],Qt=Xt.x-ft.x,ee=Xt.y-ft.y,D=Qt*Qt+ee*ee,we=Math.max(Math.abs(Xt.x),Math.abs(Xt.y),Math.abs(ft.x),Math.abs(ft.y)),me=dt*we*we;if(D<=me){st.splice(Jt,1),mt--;continue}ft=Xt}}B(P),I.forEach(B);let L=I.length,O=P;for(let st=0;st<L;st++){let ct=I[st];P=P.concat(ct)}function q(st,ct,dt){return ct||te("ExtrudeGeometry: vec does not exist"),st.clone().addScaledVector(ct,dt)}let Y=P.length;function rt(st,ct,dt){let ft,mt,Jt,Xt=st.x-ct.x,Qt=st.y-ct.y,ee=dt.x-st.x,D=dt.y-st.y,we=Xt*Xt+Qt*Qt,me=Xt*D-Qt*ee;if(Math.abs(me)>Number.EPSILON){let C=Math.sqrt(we),E=Math.sqrt(ee*ee+D*D),H=ct.x-Qt/C,G=ct.y+Xt/C,J=dt.x-D/E,pt=dt.y+ee/E,gt=((J-H)*D-(pt-G)*ee)/(Xt*D-Qt*ee);ft=H+Xt*gt-st.x,mt=G+Qt*gt-st.y;let K=ft*ft+mt*mt;if(K<=2)return new Q(ft,mt);Jt=Math.sqrt(K/2)}else{let C=!1;Xt>Number.EPSILON?ee>Number.EPSILON&&(C=!0):Xt<-Number.EPSILON?ee<-Number.EPSILON&&(C=!0):Math.sign(Qt)===Math.sign(D)&&(C=!0),C?(ft=-Qt,mt=Xt,Jt=Math.sqrt(we)):(ft=Xt,mt=Qt,Jt=Math.sqrt(we/2))}return new Q(ft/Jt,mt/Jt)}let Z=[];for(let st=0,ct=O.length,dt=ct-1,ft=st+1;st<ct;st++,dt++,ft++)dt===ct&&(dt=0),ft===ct&&(ft=0),Z[st]=rt(O[st],O[dt],O[ft]);let tt=[],nt,Lt=Z.concat();for(let st=0,ct=L;st<ct;st++){let dt=I[st];nt=[];for(let ft=0,mt=dt.length,Jt=mt-1,Xt=ft+1;ft<mt;ft++,Jt++,Xt++)Jt===mt&&(Jt=0),Xt===mt&&(Xt=0),nt[ft]=rt(dt[ft],dt[Jt],dt[Xt]);tt.push(nt),Lt=Lt.concat(nt)}let Pt;if(p===0)Pt=Gn.triangulateShape(O,I);else{let st=[],ct=[];for(let dt=0;dt<p;dt++){let ft=dt/p,mt=f*Math.cos(ft*Math.PI/2),Jt=g*Math.sin(ft*Math.PI/2)+v;for(let Xt=0,Qt=O.length;Xt<Qt;Xt++){let ee=q(O[Xt],Z[Xt],Jt);vt(ee.x,ee.y,-mt),ft===0&&st.push(ee)}for(let Xt=0,Qt=L;Xt<Qt;Xt++){let ee=I[Xt];nt=tt[Xt];let D=[];for(let we=0,me=ee.length;we<me;we++){let C=q(ee[we],nt[we],Jt);vt(C.x,C.y,-mt),ft===0&&D.push(C)}ft===0&&ct.push(D)}}Pt=Gn.triangulateShape(st,ct)}let ce=Pt.length,ae=g+v;for(let st=0;st<Y;st++){let ct=d?q(P[st],Lt[st],ae):P[st];y?(A.copy(S.normals[0]).multiplyScalar(ct.x),b.copy(S.binormals[0]).multiplyScalar(ct.y),_.copy(M[0]).add(A).add(b),vt(_.x,_.y,_.z)):vt(ct.x,ct.y,0)}for(let st=1;st<=h;st++)for(let ct=0;ct<Y;ct++){let dt=d?q(P[ct],Lt[ct],ae):P[ct];y?(A.copy(S.normals[st]).multiplyScalar(dt.x),b.copy(S.binormals[st]).multiplyScalar(dt.y),_.copy(M[st]).add(A).add(b),vt(_.x,_.y,_.z)):vt(dt.x,dt.y,u/h*st)}for(let st=p-1;st>=0;st--){let ct=st/p,dt=f*Math.cos(ct*Math.PI/2),ft=g*Math.sin(ct*Math.PI/2)+v;for(let mt=0,Jt=O.length;mt<Jt;mt++){let Xt=q(O[mt],Z[mt],ft);vt(Xt.x,Xt.y,u+dt)}for(let mt=0,Jt=I.length;mt<Jt;mt++){let Xt=I[mt];nt=tt[mt];for(let Qt=0,ee=Xt.length;Qt<ee;Qt++){let D=q(Xt[Qt],nt[Qt],ft);y?vt(D.x,D.y+M[h-1].y,M[h-1].x+dt):vt(D.x,D.y,u+dt)}}}le(),X();function le(){let st=n.length/3;if(d){let ct=0,dt=Y*ct;for(let ft=0;ft<ce;ft++){let mt=Pt[ft];Wt(mt[2]+dt,mt[1]+dt,mt[0]+dt)}ct=h+p*2,dt=Y*ct;for(let ft=0;ft<ce;ft++){let mt=Pt[ft];Wt(mt[0]+dt,mt[1]+dt,mt[2]+dt)}}else{for(let ct=0;ct<ce;ct++){let dt=Pt[ct];Wt(dt[2],dt[1],dt[0])}for(let ct=0;ct<ce;ct++){let dt=Pt[ct];Wt(dt[0]+Y*h,dt[1]+Y*h,dt[2]+Y*h)}}i.addGroup(st,n.length/3-st,0)}function X(){let st=n.length/3,ct=0;j(O,ct),ct+=O.length;for(let dt=0,ft=I.length;dt<ft;dt++){let mt=I[dt];j(mt,ct),ct+=mt.length}i.addGroup(st,n.length/3-st,1)}function j(st,ct){let dt=st.length;for(;--dt>=0;){let ft=dt,mt=dt-1;mt<0&&(mt=st.length-1);for(let Jt=0,Xt=h+p*2;Jt<Xt;Jt++){let Qt=Y*Jt,ee=Y*(Jt+1),D=ct+ft+Qt,we=ct+mt+Qt,me=ct+mt+ee,C=ct+ft+ee;Et(D,we,me,C)}}}function vt(st,ct,dt){l.push(st),l.push(ct),l.push(dt)}function Wt(st,ct,dt){Zt(st),Zt(ct),Zt(dt);let ft=n.length/3,mt=x.generateTopUV(i,n,ft-3,ft-2,ft-1);ye(mt[0]),ye(mt[1]),ye(mt[2])}function Et(st,ct,dt,ft){Zt(st),Zt(ct),Zt(ft),Zt(ct),Zt(dt),Zt(ft);let mt=n.length/3,Jt=x.generateSideWallUV(i,n,mt-6,mt-3,mt-2,mt-1);ye(Jt[0]),ye(Jt[1]),ye(Jt[3]),ye(Jt[1]),ye(Jt[2]),ye(Jt[3])}function Zt(st){n.push(l[st*3+0]),n.push(l[st*3+1]),n.push(l[st*3+2])}function ye(st){r.push(st.x),r.push(st.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,i=this.parameters.options;return nv(e,i,t)}static fromJSON(t,e){let i=[];for(let r=0,o=t.shapes.length;r<o;r++){let a=e[t.shapes[r]];i.push(a)}let n=t.options.extrudePath;return n!==void 0&&(t.options.extrudePath=new _c[n.type]().fromJSON(n)),new s(i,t.options)}},iv={generateTopUV:function(s,t,e,i,n){let r=t[e*3],o=t[e*3+1],a=t[i*3],l=t[i*3+1],c=t[n*3],h=t[n*3+1];return[new Q(r,o),new Q(a,l),new Q(c,h)]},generateSideWallUV:function(s,t,e,i,n,r){let o=t[e*3],a=t[e*3+1],l=t[e*3+2],c=t[i*3],h=t[i*3+1],u=t[i*3+2],d=t[n*3],f=t[n*3+1],g=t[n*3+2],v=t[r*3],p=t[r*3+1],m=t[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new Q(o,1-l),new Q(c,1-u),new Q(d,1-g),new Q(v,1-m)]:[new Q(a,1-l),new Q(h,1-u),new Q(f,1-g),new Q(p,1-m)]}};function nv(s,t,e){if(e.shapes=[],Array.isArray(s))for(let i=0,n=s.length;i<n;i++){let r=s[i];e.shapes.push(r.uuid)}else e.shapes.push(s.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Na=class s extends vc{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,n=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(n,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new s(t.radius,t.detail)}},ao=class s extends re{constructor(t=[new Q(0,-.5),new Q(.5,0),new Q(0,.5)],e=12,i=0,n=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:i,phiLength:n},e=Math.floor(e),n=de(n,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],h=1/e,u=new T,d=new Q,f=new T,g=new T,v=new T,p=0,m=0;for(let x=0;x<=t.length-1;x++)switch(x){case 0:p=t[x+1].x-t[x].x,m=t[x+1].y-t[x].y,f.x=m*1,f.y=-p,f.z=m*0,v.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case t.length-1:l.push(v.x,v.y,v.z);break;default:p=t[x+1].x-t[x].x,m=t[x+1].y-t[x].y,f.x=m*1,f.y=-p,f.z=m*0,g.copy(f),f.x+=v.x,f.y+=v.y,f.z+=v.z,f.normalize(),l.push(f.x,f.y,f.z),v.copy(g)}for(let x=0;x<=e;x++){let M=i+x*h*n,y=Math.sin(M),S=Math.cos(M);for(let b=0;b<=t.length-1;b++){u.x=t[b].x*y,u.y=t[b].y,u.z=t[b].x*S,o.push(u.x,u.y,u.z),d.x=x/e,d.y=b/(t.length-1),a.push(d.x,d.y);let A=l[3*b+0]*y,_=l[3*b+1],R=l[3*b+0]*S;c.push(A,_,R)}}for(let x=0;x<e;x++)for(let M=0;M<t.length-1;M++){let y=M+x*t.length,S=y,b=y+t.length,A=y+t.length+1,_=y+1;r.push(S,b,_),r.push(A,_,b)}this.setIndex(r),this.setAttribute("position",new $t(o,3)),this.setAttribute("uv",new $t(a,2)),this.setAttribute("normal",new $t(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.points,t.segments,t.phiStart,t.phiLength)}};var oi=class s extends re{constructor(t=1,e=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:n};let r=t/2,o=e/2,a=Math.floor(i),l=Math.floor(n),c=a+1,h=l+1,u=t/a,d=e/l,f=[],g=[],v=[],p=[];for(let m=0;m<h;m++){let x=m*d-o;for(let M=0;M<c;M++){let y=M*u-r;g.push(y,-x,0),v.push(0,0,1),p.push(M/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let x=0;x<a;x++){let M=x+c*m,y=x+c*(m+1),S=x+1+c*(m+1),b=x+1+c*m;f.push(M,y,b),f.push(y,S,b)}this.setIndex(f),this.setAttribute("position",new $t(g,3)),this.setAttribute("normal",new $t(v,3)),this.setAttribute("uv",new $t(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.widthSegments,t.heightSegments)}},lr=class s extends re{constructor(t=.5,e=1,i=32,n=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:n,thetaStart:r,thetaLength:o},i=Math.max(3,i),n=Math.max(1,n);let a=[],l=[],c=[],h=[],u=t,d=(e-t)/n,f=new T,g=new Q;for(let v=0;v<=n;v++){for(let p=0;p<=i;p++){let m=r+p/i*o;f.x=u*Math.cos(m),f.y=u*Math.sin(m),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/e+1)/2,g.y=(f.y/e+1)/2,h.push(g.x,g.y)}u+=d}for(let v=0;v<n;v++){let p=v*(i+1);for(let m=0;m<i;m++){let x=m+p,M=x,y=x+i+1,S=x+i+2,b=x+1;a.push(M,y,b),a.push(y,S,b)}}this.setIndex(a),this.setAttribute("position",new $t(l,3)),this.setAttribute("normal",new $t(c,3)),this.setAttribute("uv",new $t(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Ua=class s extends re{constructor(t=new Kn([new Q(0,.5),new Q(-.5,-.5),new Q(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};let i=[],n=[],r=[],o=[],a=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let h=0;h<t.length;h++)c(t[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new $t(n,3)),this.setAttribute("normal",new $t(r,3)),this.setAttribute("uv",new $t(o,2));function c(h){let u=n.length/3,d=h.extractPoints(e),f=d.shape,g=d.holes;Gn.isClockWise(f)===!1&&(f=f.reverse());for(let p=0,m=g.length;p<m;p++){let x=g[p];Gn.isClockWise(x)===!0&&(g[p]=x.reverse())}let v=Gn.triangulateShape(f,g);for(let p=0,m=g.length;p<m;p++){let x=g[p];f=f.concat(x)}for(let p=0,m=f.length;p<m;p++){let x=f[p];n.push(x.x,x.y,0),r.push(0,0,1),o.push(x.x,x.y)}for(let p=0,m=v.length;p<m;p++){let x=v[p],M=x[0]+u,y=x[1]+u,S=x[2]+u;i.push(M,y,S),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes;return sv(e,t)}static fromJSON(t,e){let i=[];for(let n=0,r=t.shapes.length;n<r;n++){let o=e[t.shapes[n]];i.push(o)}return new s(i,t.curveSegments)}};function sv(s,t){if(t.shapes=[],Array.isArray(s))for(let e=0,i=s.length;e<i;e++){let n=s[e];t.shapes.push(n.uuid)}else t.shapes.push(s.uuid);return t}var ai=class s extends re{constructor(t=1,e=32,i=16,n=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:n,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new T,d=new T,f=[],g=[],v=[],p=[];for(let m=0;m<=i;m++){let x=[],M=m/i,y=o+M*a,S=t*Math.cos(y),b=Math.sqrt(t*t-S*S),A=0;m===0&&o===0?A=.5/e:m===i&&l===Math.PI&&(A=-.5/e);for(let _=0;_<=e;_++){let R=_/e,P=n+R*r;u.x=-b*Math.cos(P),u.y=S,u.z=b*Math.sin(P),g.push(u.x,u.y,u.z),d.copy(u).normalize(),v.push(d.x,d.y,d.z),p.push(R+A,1-M),x.push(c++)}h.push(x)}for(let m=0;m<i;m++)for(let x=0;x<e;x++){let M=h[m][x+1],y=h[m][x],S=h[m+1][x],b=h[m+1][x+1];(m!==0||o>0)&&f.push(M,y,b),(m!==i-1||l<Math.PI)&&f.push(y,S,b)}this.setIndex(f),this.setAttribute("position",new $t(g,3)),this.setAttribute("normal",new $t(v,3)),this.setAttribute("uv",new $t(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var qi=class s extends re{constructor(t=1,e=.4,i=12,n=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:n,arc:r,thetaStart:o,thetaLength:a},i=Math.floor(i),n=Math.floor(n);let l=[],c=[],h=[],u=[],d=new T,f=new T,g=new T;for(let v=0;v<=i;v++){let p=o+v/i*a;for(let m=0;m<=n;m++){let x=m/n*r;f.x=(t+e*Math.cos(p))*Math.cos(x),f.y=(t+e*Math.cos(p))*Math.sin(x),f.z=e*Math.sin(p),c.push(f.x,f.y,f.z),d.x=t*Math.cos(x),d.y=t*Math.sin(x),g.subVectors(f,d).normalize(),h.push(g.x,g.y,g.z),u.push(m/n),u.push(v/i)}}for(let v=1;v<=i;v++)for(let p=1;p<=n;p++){let m=(n+1)*v+p-1,x=(n+1)*(v-1)+p-1,M=(n+1)*(v-1)+p,y=(n+1)*v+p;l.push(m,x,y),l.push(x,M,y)}this.setIndex(l),this.setAttribute("position",new $t(c,3)),this.setAttribute("normal",new $t(h,3)),this.setAttribute("uv",new $t(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};var Fa=class s extends re{constructor(t=new Ra(new T(-1,-1,0),new T(-1,1,0),new T(1,1,0)),e=64,i=1,n=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:i,radialSegments:n,closed:r};let o=t.computeFrenetFrames(e,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new T,l=new T,c=new Q,h=new T,u=[],d=[],f=[],g=[];v(),this.setIndex(g),this.setAttribute("position",new $t(u,3)),this.setAttribute("normal",new $t(d,3)),this.setAttribute("uv",new $t(f,2));function v(){for(let M=0;M<e;M++)p(M);p(r===!1?e:0),x(),m()}function p(M){h=t.getPointAt(M/e,h);let y=o.normals[M],S=o.binormals[M];for(let b=0;b<=n;b++){let A=b/n*Math.PI*2,_=Math.sin(A),R=-Math.cos(A);l.x=R*y.x+_*S.x,l.y=R*y.y+_*S.y,l.z=R*y.z+_*S.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=h.x+i*l.x,a.y=h.y+i*l.y,a.z=h.z+i*l.z,u.push(a.x,a.y,a.z)}}function m(){for(let M=1;M<=e;M++)for(let y=1;y<=n;y++){let S=(n+1)*(M-1)+(y-1),b=(n+1)*M+(y-1),A=(n+1)*M+y,_=(n+1)*(M-1)+y;g.push(S,b,_),g.push(b,A,_)}}function x(){for(let M=0;M<=e;M++)for(let y=0;y<=n;y++)c.x=M/e,c.y=y/n,f.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new s(new _c[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};function fr(s){let t={};for(let e in s){t[e]={};for(let i in s[e]){let n=s[e][i];if(hp(n))n.isRenderTargetTexture?(jt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=n.clone();else if(Array.isArray(n))if(hp(n[0])){let r=[];for(let o=0,a=n.length;o<a;o++)r[o]=n[o].clone();t[e][i]=r}else t[e][i]=n.slice();else t[e][i]=n}}return t}function Bi(s){let t={};for(let e=0;e<s.length;e++){let i=fr(s[e]);for(let n in i)t[n]=i[n]}return t}function hp(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function rv(s){let t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function vd(s){let t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:_e.workingColorSpace}var Ms={clone:fr,merge:Bi},ov=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,av=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,fe=class extends $n{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ov,this.fragmentShader=av,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=fr(t.uniforms),this.uniformsGroups=rv(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let n in this.uniforms){let o=this.uniforms[n].value;o&&o.isTexture?e.uniforms[n]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[n]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[n]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[n]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[n]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[n]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[n]={type:"m4",value:o.toArray()}:e.uniforms[n]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let n=t.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=e[n.value]||null;break;case"c":this.uniforms[i].value=new St().setHex(n.value);break;case"v2":this.uniforms[i].value=new Q().fromArray(n.value);break;case"v3":this.uniforms[i].value=new T().fromArray(n.value);break;case"v4":this.uniforms[i].value=new Ke().fromArray(n.value);break;case"m3":this.uniforms[i].value=new ie().fromArray(n.value);break;case"m4":this.uniforms[i].value=new be().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},lo=class extends fe{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},qt=class extends $n{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new St(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new St(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=bh,this.normalScale=new Q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},co=class extends qt{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Q(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return de(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new St(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new St(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new St(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var Mc=class extends $n{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=zp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},bc=class extends $n{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function kr(s,t){return!s||s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function zu(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}var Us=class{constructor(t,e,i,n){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,n=e[i],r=e[i-1];i:{t:{let o;e:{n:if(!(t<n)){for(let a=i+2;;){if(n===void 0){if(t<r)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=n,n=e[++i],t<n)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(n=r,r=e[--i-1],t>=r)break t}o=i,i=0;break e}break i}for(;i<o;){let a=i+o>>>1;t<e[a]?o=a:i=a+1}if(n=e[i],r=e[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,n)}return this.interpolate_(i,r,t,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,n=this.valueSize,r=t*n;for(let o=0;o!==n;++o)e[o]=i[r+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Sc=class extends Us{constructor(t,e,i,n){super(t,e,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Gu,endingEnd:Gu}}intervalChanged_(t,e,i){let n=this.parameterPositions,r=t-2,o=t+1,a=n[r],l=n[o];if(a===void 0)switch(this.getSettings_().endingStart){case Wu:r=t,a=2*e-i;break;case qu:r=n.length-2,a=e+n[r]-n[r+1];break;default:r=t,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Wu:o=t,l=2*i-e;break;case qu:o=1,l=i+n[1]-n[0];break;default:o=t-1,l=e}let c=(i-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(i-e)/(n-e),v=g*g,p=v*g,m=-d*p+2*d*v-d*g,x=(1+d)*p+(-1.5-2*d)*v+(-.5+d)*g+1,M=(-1-f)*p+(1.5+f)*v+.5*g,y=f*p-f*v;for(let S=0;S!==a;++S)r[S]=m*o[h+S]+x*o[c+S]+M*o[l+S]+y*o[u+S];return r}},Ec=class extends Us{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(i-e)/(n-e),u=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*u+o[l+d]*h;return r}},Tc=class extends Us{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t){return this.copySampleValue_(t-1)}},wc=class extends Us{interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this.inTangents,u=this.outTangents;if(!h||!u){let g=(i-e)/(n-e),v=1-g;for(let p=0;p!==a;++p)r[p]=o[c+p]*v+o[l+p]*g;return r}let d=a*2,f=t-1;for(let g=0;g!==a;++g){let v=o[c+g],p=o[l+g],m=f*d+g*2,x=u[m],M=u[m+1],y=t*d+g*2,S=h[y],b=h[y+1],A=cv(i,e,x,S,n);r[g]=rm(A,v,M,b,p)}return r}};function rm(s,t,e,i,n){let r=1-s;return r*r*r*t+3*r*r*s*e+3*r*s*s*i+s*s*s*n}function lv(s,t,e,i,n){let r=1-s;return 3*r*r*(e-t)+6*r*s*(i-e)+3*s*s*(n-i)}function cv(s,t,e,i,n){let r=(s-t)/(n-t);for(let o=0;o<8;o++){let a=rm(r,t,e,i,n)-s;if(Math.abs(a)<1e-10)break;let l=lv(r,t,e,i,n);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var rn=class{constructor(t,e,i,n){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=kr(e,this.TimeBufferType),this.values=kr(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:kr(t.times,Array),values:kr(t.values,Array)};let n=t.getInterpolation();n!==t.DefaultInterpolation&&(i.interpolation=n),zu(t.settings)&&(i.settings={inTangents:kr(t.settings.inTangents,Array),outTangents:kr(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new Tc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Ec(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Sc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new wc(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case ca:e=this.InterpolantFactoryMethodDiscrete;break;case uc:e=this.InterpolantFactoryMethodLinear;break;case ec:e=this.InterpolantFactoryMethodSmooth;break;case Vu:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return jt("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ca;case this.InterpolantFactoryMethodLinear:return uc;case this.InterpolantFactoryMethodSmooth:return ec;case this.InterpolantFactoryMethodBezier:return Vu}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]*=t;zu(this.settings)&&(up(this.settings.inTangents,t),up(this.settings.outTangents,t))}return this}trim(t,e){let i=this.times,n=i.length,r=0,o=n-1;for(;r!==n&&i[r]<t;)++r;for(;o!==-1&&i[o]>e;)--o;if(++o,r!==0||o!==n){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(te("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,n=this.values,r=i.length;r===0&&(te("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){te("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){te("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(n!==void 0&&J0(n))for(let a=0,l=n.length;a!==l;++a){let c=n[a];if(isNaN(c)){te("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===ec,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(n)l=!0;else{let u=a*i,d=u-i,f=u+i;for(let g=0;g!==i;++g){let v=e[u+g];if(v!==e[d+g]||v!==e[f+g]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let u=a*i,d=o*i;for(let f=0;f!==i;++f)e[d+f]=e[u+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*i,l=o*i,c=0;c!==i;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,n=new i(this.name,t,e);return n.createInterpolant=this.createInterpolant,zu(this.settings)&&(n.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),n}};function up(s,t){for(let e=0,i=s.length;e!==i;e+=2)s[e]*=t}rn.prototype.ValueTypeName="";rn.prototype.TimeBufferType=Float32Array;rn.prototype.ValueBufferType=Float32Array;rn.prototype.DefaultInterpolation=uc;var Fs=class extends rn{constructor(t,e,i){super(t,e,i)}};Fs.prototype.ValueTypeName="bool";Fs.prototype.ValueBufferType=Array;Fs.prototype.DefaultInterpolation=ca;Fs.prototype.InterpolantFactoryMethodLinear=void 0;Fs.prototype.InterpolantFactoryMethodSmooth=void 0;var Ac=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}};Ac.prototype.ValueTypeName="color";var Rc=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}};Rc.prototype.ValueTypeName="number";var Cc=class extends Us{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-e)/(n-e),c=t*a;for(let h=c+a;c!==h;c+=4)he.slerpFlat(r,0,o,c-a,o,c,l);return r}},Ba=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}InterpolantFactoryMethodLinear(t){return new Cc(this.times,this.values,this.getValueSize(),t)}};Ba.prototype.ValueTypeName="quaternion";Ba.prototype.InterpolantFactoryMethodSmooth=void 0;var Bs=class extends rn{constructor(t,e,i){super(t,e,i)}};Bs.prototype.ValueTypeName="string";Bs.prototype.ValueBufferType=Array;Bs.prototype.DefaultInterpolation=ca;Bs.prototype.InterpolantFactoryMethodLinear=void 0;Bs.prototype.InterpolantFactoryMethodSmooth=void 0;var Pc=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}};Pc.prototype.ValueTypeName="vector";var Ic=class{constructor(t,e,i){let n=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(h){a++,r===!1&&n.onStart!==void 0&&n.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,n.onProgress!==void 0&&n.onProgress(h,o,a),o===a&&(r=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},om=new Ic,Lc=class{constructor(t){this.manager=t!==void 0?t:om,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(n,r){i.load(t,n,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Lc.DEFAULT_MATERIAL_NAME="__DEFAULT";var ho=class extends vi{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new St(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Oa=class extends ho{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(vi.DEFAULT_UP),this.updateMatrix(),this.groundColor=new St(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},ku=new be,dp=new T,fp=new T,Ha=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Q(512,512),this.mapType=Fi,this.map=null,this.mapPass=null,this.matrix=new be,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Qr,this._frameExtents=new Q(1,1),this._viewportCount=1,this._viewports=[new Ke(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;dp.setFromMatrixPosition(t.matrixWorld),e.position.copy(dp),fp.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(fp),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,n){ku.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(ku,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,o=n?n.z/r.x:1,a=n?n.w/r.y:1,l=n?n.x/r.x:0,c=n?n.y/r.y:0;t.coordinateSystem===Xr||t.reversedDepth?e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),e.multiply(ku)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Ql=new T,tc=new he,kn=new T,za=class extends vi{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new be,this.projectionMatrix=new be,this.projectionMatrixInverse=new be,this.coordinateSystem=Cn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Ql,tc,kn),kn.x===1&&kn.y===1&&kn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ql,tc,kn.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(Ql,tc,kn),kn.x===1&&kn.y===1&&kn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ql,tc,kn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ds=new T,pp=new Q,mp=new Q,ei=class extends za{constructor(t=50,e=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Zr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(ra*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Zr*2*Math.atan(Math.tan(ra*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){Ds.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Ds.x,Ds.y).multiplyScalar(-t/Ds.z),Ds.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ds.x,Ds.y).multiplyScalar(-t/Ds.z)}getViewSize(t,e){return this.getViewBounds(t,pp,mp),e.subVectors(mp,pp)}setViewOffset(t,e,i,n,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(ra*.5*this.fov)/this.zoom,i=2*e,n=this.aspect*i,r=-.5*n,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*n/l,e-=o.offsetY*i/c,n*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+n,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Ju=class extends Ha{constructor(){super(new ei(90,1,.5,500)),this.isPointLightShadow=!0}},ka=class extends ho{constructor(t,e,i=0,n=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=n,this.shadow=new Ju}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},jn=class extends za{constructor(t=-1,e=1,i=1,n=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=n,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,n,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2,r=i-t,o=i+t,a=n+e,l=n-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Ku=class extends Ha{constructor(){super(new jn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Va=class extends ho{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(vi.DEFAULT_UP),this.updateMatrix(),this.target=new vi,this.shadow=new Ku}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Ga=class extends re{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}};var Vr=-90,Gr=1,Dc=class extends vi{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let n=new ei(Vr,Gr,t,e);n.layers=this.layers,this.add(n);let r=new ei(Vr,Gr,t,e);r.layers=this.layers,this.add(r);let o=new ei(Vr,Gr,t,e);o.layers=this.layers,this.add(o);let a=new ei(Vr,Gr,t,e);a.layers=this.layers,this.add(a);let l=new ei(Vr,Gr,t,e);l.layers=this.layers,this.add(l);let c=new ei(Vr,Gr,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,n,r,o,a,l]=e;for(let c of e)this.remove(c);if(t===Cn)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Xr)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let p=!1;t.isWebGLRenderer===!0?p=t.state.buffers.depth.getReversed():p=t.reversedDepthBuffer,t.setRenderTarget(i,0,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(i,1,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,2,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,3,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(i,4,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),i.texture.generateMipmaps=v,t.setRenderTarget(i,5,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Nc=class extends ei{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}},Wa=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(t){this._document=t,t.hidden!==void 0&&(this._pageVisibilityHandler=hv.bind(this),t.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(t){return this._timescale=t,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(t){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(t!==void 0?t:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function hv(){this._document.hidden===!1&&this.reset()}var xd="\\[\\]\\.:\\/",uv=new RegExp("["+xd+"]","g"),yd="[^"+xd+"]",dv="[^"+xd.replace("\\.","")+"]",fv=/((?:WC+[\/:])*)/.source.replace("WC",yd),pv=/(WCOD+)?/.source.replace("WCOD",dv),mv=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",yd),gv=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",yd),vv=new RegExp("^"+fv+pv+mv+gv+"$"),xv=["material","materials","bones","map"],ju=class{constructor(t,e,i){let n=i||Je.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,n)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,n=this._bindings[i];n!==void 0&&n.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let n=this._targetGroup.nCachedObjects_,r=i.length;n!==r;++n)i[n].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},Je=class s{constructor(t,e,i){this.path=e,this.parsedPath=i||s.parseTrackName(e),this.node=s.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new s.Composite(t,e,i):new s(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(uv,"")}static parseTrackName(t){let e=vv.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},n=i.nodeName&&i.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let r=i.nodeName.substring(n+1);xv.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,n),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=i(a.children);if(l)return l}return null},n=i(t.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)t[e++]=i[n]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,n=e.propertyName,r=e.propertyIndex;if(t||(t=s.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){jt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=e.objectIndex;switch(i){case"materials":if(!t.material){te("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){te("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){te("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){te("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){te("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){te("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){te("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[n];if(o===void 0){let c=e.nodeName;te("PropertyBinding: Trying to update property for track: "+c+"."+n+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(n==="morphTargetInfluences"){if(!t.geometry){te("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){te("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=n;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Je.Composite=ju;Je.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Je.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Je.prototype.GetterByBindingType=[Je.prototype._getValue_direct,Je.prototype._getValue_array,Je.prototype._getValue_arrayElement,Je.prototype._getValue_toArray];Je.prototype.SetterByBindingTypeAndVersioning=[[Je.prototype._setValue_direct,Je.prototype._setValue_direct_setNeedsUpdate,Je.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_array,Je.prototype._setValue_array_setNeedsUpdate,Je.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_arrayElement,Je.prototype._setValue_arrayElement_setNeedsUpdate,Je.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Je.prototype._setValue_fromArray,Je.prototype._setValue_fromArray_setNeedsUpdate,Je.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Y1=new Float32Array(1);var Td=class Td{constructor(t,e,i,n){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,n){let r=this.elements;return r[0]=t,r[2]=e,r[1]=i,r[3]=n,this}};Td.prototype.isMatrix2=!0;var Qu=Td;function _d(s,t,e,i){let n=yv(i);switch(e){case ud:return s*t;case Vc:return s*t/n.components*n.byteLength;case Gc:return s*t/n.components*n.byteLength;case Vs:return s*t*2/n.components*n.byteLength;case Wc:return s*t*2/n.components*n.byteLength;case dd:return s*t*3/n.components*n.byteLength;case vn:return s*t*4/n.components*n.byteLength;case qc:return s*t*4/n.components*n.byteLength;case Qa:case tl:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case el:case il:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Yc:case $c:return Math.max(s,16)*Math.max(t,8)/4;case Xc:case Zc:return Math.max(s,8)*Math.max(t,8)/2;case Jc:case Kc:case Qc:case th:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case jc:case nl:case eh:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case ih:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case nh:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case sh:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case rh:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case oh:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case ah:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case lh:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case ch:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case hh:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case uh:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case dh:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case fh:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case ph:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case mh:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case gh:case vh:case xh:return Math.ceil(s/4)*Math.ceil(t/4)*16;case yh:case _h:return Math.ceil(s/4)*Math.ceil(t/4)*8;case sl:case Mh:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function yv(s){switch(s){case Fi:case ad:return{byteLength:1,components:1};case fo:case ld:case ui:return{byteLength:2,components:1};case zc:case kc:return{byteLength:2,components:4};case Dn:case Hc:case gn:return{byteLength:4,components:1};case cd:case hd:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?jt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Rm(){let s=null,t=!1,e=null,i=null;function n(r,o){i=s.requestAnimationFrame(n),e(r,o)}return{start:function(){t!==!0&&e!==null&&s!==null&&(i=s.requestAnimationFrame(n),t=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function Ev(s){let t=new WeakMap;function e(a,l){let c=a.array,h=a.usage,u=c.byteLength,d=s.createBuffer();s.bindBuffer(l,d),s.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=s.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){let h=l.array,u=l.updateRanges;if(s.bindBuffer(c,a),u.length===0)s.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){let g=u[d],v=u[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++d,u[d]=v)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){let v=u[f];s.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function n(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(s.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:n,remove:r,update:o}}var Tv=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,wv=`#ifdef USE_ALPHAHASH
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
#endif`,Av=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Rv=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Cv=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Pv=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Iv=`#ifdef USE_AOMAP
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
#endif`,Lv=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Dv=`#ifdef USE_BATCHING
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
#endif`,Nv=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Uv=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Fv=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Bv=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Ov=`#ifdef USE_IRIDESCENCE
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
#endif`,Hv=`#ifdef USE_BUMPMAP
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
#endif`,zv=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,kv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Vv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Gv=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Wv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,qv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Xv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Yv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Zv=`#define PI 3.141592653589793
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
} // validated`,$v=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Jv=`vec3 transformedNormal = objectNormal;
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
#endif`,Kv=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,jv=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Qv=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,tx=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ex="gl_FragColor = linearToOutputTexel( gl_FragColor );",ix=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,nx=`#ifdef USE_ENVMAP
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
#endif`,sx=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,rx=`#ifdef USE_ENVMAP
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
#endif`,ox=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ax=`#ifdef USE_ENVMAP
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
#endif`,lx=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,cx=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,hx=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ux=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,dx=`#ifdef USE_GRADIENTMAP
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
}`,fx=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,px=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,mx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,gx=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,vx=`#ifdef USE_ENVMAP
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
#endif`,xx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,yx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,_x=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Mx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,bx=`PhysicalMaterial material;
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
#endif`,Sx=`uniform sampler2D dfgLUT;
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
}`,Ex=`
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
#endif`,Tx=`#if defined( RE_IndirectDiffuse )
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
#endif`,wx=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ax=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Rx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Cx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Px=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ix=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Lx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Dx=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Nx=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Ux=`#if defined( USE_POINTS_UV )
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
#endif`,Fx=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Bx=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ox=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Hx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,zx=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,kx=`#ifdef USE_MORPHTARGETS
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
#endif`,Vx=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Gx=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Wx=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,qx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Xx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Yx=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Zx=`#ifdef USE_NORMALMAP
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
#endif`,$x=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Jx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Kx=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,jx=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Qx=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,ty=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,ey=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,iy=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ny=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,sy=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ry=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,oy=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ay=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,ly=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,cy=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,hy=`float getShadowMask() {
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
}`,uy=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,dy=`#ifdef USE_SKINNING
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
#endif`,fy=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,py=`#ifdef USE_SKINNING
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
#endif`,my=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,gy=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,vy=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,xy=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,yy=`#ifdef USE_TRANSMISSION
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
#endif`,_y=`#ifdef USE_TRANSMISSION
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
#endif`,My=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,by=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Sy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Ey=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Ty=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,wy=`uniform sampler2D t2D;
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
}`,Ay=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ry=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Cy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Py=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Iy=`#include <common>
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
}`,Ly=`#if DEPTH_PACKING == 3200
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
}`,Dy=`#define DISTANCE
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
}`,Ny=`#define DISTANCE
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
}`,Uy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Fy=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,By=`uniform float scale;
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
}`,Oy=`uniform vec3 diffuse;
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
}`,Hy=`#include <common>
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
}`,zy=`uniform vec3 diffuse;
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
}`,ky=`#define LAMBERT
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
}`,Vy=`#define LAMBERT
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
}`,Gy=`#define MATCAP
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
}`,Wy=`#define MATCAP
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
}`,qy=`#define NORMAL
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
}`,Xy=`#define NORMAL
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
}`,Yy=`#define PHONG
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
}`,Zy=`#define PHONG
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
}`,$y=`#define STANDARD
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
}`,Jy=`#define STANDARD
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
}`,Ky=`#define TOON
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
}`,jy=`#define TOON
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
}`,Qy=`uniform float size;
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
}`,t_=`uniform vec3 diffuse;
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
}`,e_=`#include <common>
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
}`,i_=`uniform vec3 color;
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
}`,n_=`uniform float rotation;
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
}`,s_=`uniform vec3 diffuse;
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
}`,pe={alphahash_fragment:Tv,alphahash_pars_fragment:wv,alphamap_fragment:Av,alphamap_pars_fragment:Rv,alphatest_fragment:Cv,alphatest_pars_fragment:Pv,aomap_fragment:Iv,aomap_pars_fragment:Lv,batching_pars_vertex:Dv,batching_vertex:Nv,begin_vertex:Uv,beginnormal_vertex:Fv,bsdfs:Bv,iridescence_fragment:Ov,bumpmap_pars_fragment:Hv,clipping_planes_fragment:zv,clipping_planes_pars_fragment:kv,clipping_planes_pars_vertex:Vv,clipping_planes_vertex:Gv,color_fragment:Wv,color_pars_fragment:qv,color_pars_vertex:Xv,color_vertex:Yv,common:Zv,cube_uv_reflection_fragment:$v,defaultnormal_vertex:Jv,displacementmap_pars_vertex:Kv,displacementmap_vertex:jv,emissivemap_fragment:Qv,emissivemap_pars_fragment:tx,colorspace_fragment:ex,colorspace_pars_fragment:ix,envmap_fragment:nx,envmap_common_pars_fragment:sx,envmap_pars_fragment:rx,envmap_pars_vertex:ox,envmap_physical_pars_fragment:vx,envmap_vertex:ax,fog_vertex:lx,fog_pars_vertex:cx,fog_fragment:hx,fog_pars_fragment:ux,gradientmap_pars_fragment:dx,lightmap_pars_fragment:fx,lights_lambert_fragment:px,lights_lambert_pars_fragment:mx,lights_pars_begin:gx,lights_toon_fragment:xx,lights_toon_pars_fragment:yx,lights_phong_fragment:_x,lights_phong_pars_fragment:Mx,lights_physical_fragment:bx,lights_physical_pars_fragment:Sx,lights_fragment_begin:Ex,lights_fragment_maps:Tx,lights_fragment_end:wx,lightprobes_pars_fragment:Ax,logdepthbuf_fragment:Rx,logdepthbuf_pars_fragment:Cx,logdepthbuf_pars_vertex:Px,logdepthbuf_vertex:Ix,map_fragment:Lx,map_pars_fragment:Dx,map_particle_fragment:Nx,map_particle_pars_fragment:Ux,metalnessmap_fragment:Fx,metalnessmap_pars_fragment:Bx,morphinstance_vertex:Ox,morphcolor_vertex:Hx,morphnormal_vertex:zx,morphtarget_pars_vertex:kx,morphtarget_vertex:Vx,normal_fragment_begin:Gx,normal_fragment_maps:Wx,normal_pars_fragment:qx,normal_pars_vertex:Xx,normal_vertex:Yx,normalmap_pars_fragment:Zx,clearcoat_normal_fragment_begin:$x,clearcoat_normal_fragment_maps:Jx,clearcoat_pars_fragment:Kx,iridescence_pars_fragment:jx,opaque_fragment:Qx,packing:ty,premultiplied_alpha_fragment:ey,project_vertex:iy,dithering_fragment:ny,dithering_pars_fragment:sy,roughnessmap_fragment:ry,roughnessmap_pars_fragment:oy,shadowmap_pars_fragment:ay,shadowmap_pars_vertex:ly,shadowmap_vertex:cy,shadowmask_pars_fragment:hy,skinbase_vertex:uy,skinning_pars_vertex:dy,skinning_vertex:fy,skinnormal_vertex:py,specularmap_fragment:my,specularmap_pars_fragment:gy,tonemapping_fragment:vy,tonemapping_pars_fragment:xy,transmission_fragment:yy,transmission_pars_fragment:_y,uv_pars_fragment:My,uv_pars_vertex:by,uv_vertex:Sy,worldpos_vertex:Ey,background_vert:Ty,background_frag:wy,backgroundCube_vert:Ay,backgroundCube_frag:Ry,cube_vert:Cy,cube_frag:Py,depth_vert:Iy,depth_frag:Ly,distance_vert:Dy,distance_frag:Ny,equirect_vert:Uy,equirect_frag:Fy,linedashed_vert:By,linedashed_frag:Oy,meshbasic_vert:Hy,meshbasic_frag:zy,meshlambert_vert:ky,meshlambert_frag:Vy,meshmatcap_vert:Gy,meshmatcap_frag:Wy,meshnormal_vert:qy,meshnormal_frag:Xy,meshphong_vert:Yy,meshphong_frag:Zy,meshphysical_vert:$y,meshphysical_frag:Jy,meshtoon_vert:Ky,meshtoon_frag:jy,points_vert:Qy,points_frag:t_,shadow_vert:e_,shadow_frag:i_,sprite_vert:n_,sprite_frag:s_},wt={common:{diffuse:{value:new St(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ie},alphaMap:{value:null},alphaMapTransform:{value:new ie},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ie}},envmap:{envMap:{value:null},envMapRotation:{value:new ie},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ie}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ie}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ie},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ie},normalScale:{value:new Q(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ie},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ie}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ie}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ie}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new St(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new T},probesMax:{value:new T},probesResolution:{value:new T}},points:{diffuse:{value:new St(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ie},alphaTest:{value:0},uvTransform:{value:new ie}},sprite:{diffuse:{value:new St(16777215)},opacity:{value:1},center:{value:new Q(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ie},alphaMap:{value:null},alphaMapTransform:{value:new ie},alphaTest:{value:0}}},ts={basic:{uniforms:Bi([wt.common,wt.specularmap,wt.envmap,wt.aomap,wt.lightmap,wt.fog]),vertexShader:pe.meshbasic_vert,fragmentShader:pe.meshbasic_frag},lambert:{uniforms:Bi([wt.common,wt.specularmap,wt.envmap,wt.aomap,wt.lightmap,wt.emissivemap,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.fog,wt.lights,{emissive:{value:new St(0)},envMapIntensity:{value:1}}]),vertexShader:pe.meshlambert_vert,fragmentShader:pe.meshlambert_frag},phong:{uniforms:Bi([wt.common,wt.specularmap,wt.envmap,wt.aomap,wt.lightmap,wt.emissivemap,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.fog,wt.lights,{emissive:{value:new St(0)},specular:{value:new St(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:pe.meshphong_vert,fragmentShader:pe.meshphong_frag},standard:{uniforms:Bi([wt.common,wt.envmap,wt.aomap,wt.lightmap,wt.emissivemap,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.roughnessmap,wt.metalnessmap,wt.fog,wt.lights,{emissive:{value:new St(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:pe.meshphysical_vert,fragmentShader:pe.meshphysical_frag},toon:{uniforms:Bi([wt.common,wt.aomap,wt.lightmap,wt.emissivemap,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.gradientmap,wt.fog,wt.lights,{emissive:{value:new St(0)}}]),vertexShader:pe.meshtoon_vert,fragmentShader:pe.meshtoon_frag},matcap:{uniforms:Bi([wt.common,wt.bumpmap,wt.normalmap,wt.displacementmap,wt.fog,{matcap:{value:null}}]),vertexShader:pe.meshmatcap_vert,fragmentShader:pe.meshmatcap_frag},points:{uniforms:Bi([wt.points,wt.fog]),vertexShader:pe.points_vert,fragmentShader:pe.points_frag},dashed:{uniforms:Bi([wt.common,wt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:pe.linedashed_vert,fragmentShader:pe.linedashed_frag},depth:{uniforms:Bi([wt.common,wt.displacementmap]),vertexShader:pe.depth_vert,fragmentShader:pe.depth_frag},normal:{uniforms:Bi([wt.common,wt.bumpmap,wt.normalmap,wt.displacementmap,{opacity:{value:1}}]),vertexShader:pe.meshnormal_vert,fragmentShader:pe.meshnormal_frag},sprite:{uniforms:Bi([wt.sprite,wt.fog]),vertexShader:pe.sprite_vert,fragmentShader:pe.sprite_frag},background:{uniforms:{uvTransform:{value:new ie},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:pe.background_vert,fragmentShader:pe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ie}},vertexShader:pe.backgroundCube_vert,fragmentShader:pe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:pe.cube_vert,fragmentShader:pe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:pe.equirect_vert,fragmentShader:pe.equirect_frag},distance:{uniforms:Bi([wt.common,wt.displacementmap,{referencePosition:{value:new T},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:pe.distance_vert,fragmentShader:pe.distance_frag},shadow:{uniforms:Bi([wt.lights,wt.fog,{color:{value:new St(0)},opacity:{value:1}}]),vertexShader:pe.shadow_vert,fragmentShader:pe.shadow_frag}};ts.physical={uniforms:Bi([ts.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ie},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ie},clearcoatNormalScale:{value:new Q(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ie},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ie},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ie},sheen:{value:0},sheenColor:{value:new St(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ie},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ie},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ie},transmissionSamplerSize:{value:new Q},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ie},attenuationDistance:{value:0},attenuationColor:{value:new St(0)},specularColor:{value:new St(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ie},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ie},anisotropyVector:{value:new Q},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ie}}]),vertexShader:pe.meshphysical_vert,fragmentShader:pe.meshphysical_frag};var Th={r:0,b:0,g:0},r_=new be,Cm=new ie;Cm.set(-1,0,0,0,1,0,0,0,1);function o_(s,t,e,i,n,r){let o=new St(0),a=n===!0?0:1,l,c,h=null,u=0,d=null;function f(x){let M=x.isScene===!0?x.background:null;if(M&&M.isTexture){let y=x.backgroundBlurriness>0;M=t.get(M,y)}return M}function g(x){let M=!1,y=f(x);y===null?p(o,a):y&&y.isColor&&(p(y,1),M=!0);let S=s.xr.getEnvironmentBlendMode();S==="additive"?e.buffers.color.setClear(0,0,0,1,r):S==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(s.autoClear||M)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function v(x,M){let y=f(M);y&&(y.isCubeTexture||y.mapping===Ka)?(c===void 0&&(c=new ot(new De(1,1,1),new fe({name:"BackgroundCubeMaterial",uniforms:fr(ts.backgroundCube.uniforms),vertexShader:ts.backgroundCube.vertexShader,fragmentShader:ts.backgroundCube.fragmentShader,side:_i,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(S,b,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(r_.makeRotationFromEuler(M.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Cm),c.material.toneMapped=_e.getTransfer(y.colorSpace)!==Ce,(h!==y||u!==y.version||d!==s.toneMapping)&&(c.material.needsUpdate=!0,h=y,u=y.version,d=s.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new ot(new oi(2,2),new fe({name:"BackgroundMaterial",uniforms:fr(ts.background.uniforms),vertexShader:ts.background.vertexShader,fragmentShader:ts.background.fragmentShader,side:Os,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=_e.getTransfer(y.colorSpace)!==Ce,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||u!==y.version||d!==s.toneMapping)&&(l.material.needsUpdate=!0,h=y,u=y.version,d=s.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function p(x,M){x.getRGB(Th,vd(s)),e.buffers.color.setClear(Th.r,Th.g,Th.b,M,r)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,M=1){o.set(x),a=M,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(x){a=x,p(o,a)},render:g,addToRenderList:v,dispose:m}}function a_(s,t){let e=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},n=d(null),r=n,o=!1;function a(I,N,B,L,O){let q=!1,Y=u(I,L,B,N);r!==Y&&(r=Y,c(r.object)),q=f(I,L,B,O),q&&g(I,L,B,O),O!==null&&t.update(O,s.ELEMENT_ARRAY_BUFFER),(q||o)&&(o=!1,y(I,N,B,L),O!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(O).buffer))}function l(){return s.createVertexArray()}function c(I){return s.bindVertexArray(I)}function h(I){return s.deleteVertexArray(I)}function u(I,N,B,L){let O=L.wireframe===!0,q=i[N.id];q===void 0&&(q={},i[N.id]=q);let Y=I.isInstancedMesh===!0?I.id:0,rt=q[Y];rt===void 0&&(rt={},q[Y]=rt);let Z=rt[B.id];Z===void 0&&(Z={},rt[B.id]=Z);let tt=Z[O];return tt===void 0&&(tt=d(l()),Z[O]=tt),tt}function d(I){let N=[],B=[],L=[];for(let O=0;O<e;O++)N[O]=0,B[O]=0,L[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:B,attributeDivisors:L,object:I,attributes:{},index:null}}function f(I,N,B,L){let O=r.attributes,q=N.attributes,Y=0,rt=B.getAttributes();for(let Z in rt)if(rt[Z].location>=0){let nt=O[Z],Lt=q[Z];if(Lt===void 0&&(Z==="instanceMatrix"&&I.instanceMatrix&&(Lt=I.instanceMatrix),Z==="instanceColor"&&I.instanceColor&&(Lt=I.instanceColor)),nt===void 0||nt.attribute!==Lt||Lt&&nt.data!==Lt.data)return!0;Y++}return r.attributesNum!==Y||r.index!==L}function g(I,N,B,L){let O={},q=N.attributes,Y=0,rt=B.getAttributes();for(let Z in rt)if(rt[Z].location>=0){let nt=q[Z];nt===void 0&&(Z==="instanceMatrix"&&I.instanceMatrix&&(nt=I.instanceMatrix),Z==="instanceColor"&&I.instanceColor&&(nt=I.instanceColor));let Lt={};Lt.attribute=nt,nt&&nt.data&&(Lt.data=nt.data),O[Z]=Lt,Y++}r.attributes=O,r.attributesNum=Y,r.index=L}function v(){let I=r.newAttributes;for(let N=0,B=I.length;N<B;N++)I[N]=0}function p(I){m(I,0)}function m(I,N){let B=r.newAttributes,L=r.enabledAttributes,O=r.attributeDivisors;B[I]=1,L[I]===0&&(s.enableVertexAttribArray(I),L[I]=1),O[I]!==N&&(s.vertexAttribDivisor(I,N),O[I]=N)}function x(){let I=r.newAttributes,N=r.enabledAttributes;for(let B=0,L=N.length;B<L;B++)N[B]!==I[B]&&(s.disableVertexAttribArray(B),N[B]=0)}function M(I,N,B,L,O,q,Y){Y===!0?s.vertexAttribIPointer(I,N,B,O,q):s.vertexAttribPointer(I,N,B,L,O,q)}function y(I,N,B,L){v();let O=L.attributes,q=B.getAttributes(),Y=N.defaultAttributeValues;for(let rt in q){let Z=q[rt];if(Z.location>=0){let tt=O[rt];if(tt===void 0&&(rt==="instanceMatrix"&&I.instanceMatrix&&(tt=I.instanceMatrix),rt==="instanceColor"&&I.instanceColor&&(tt=I.instanceColor)),tt!==void 0){let nt=tt.normalized,Lt=tt.itemSize,Pt=t.get(tt);if(Pt===void 0)continue;let ce=Pt.buffer,ae=Pt.type,le=Pt.bytesPerElement,X=ae===s.INT||ae===s.UNSIGNED_INT||tt.gpuType===Hc;if(tt.isInterleavedBufferAttribute){let j=tt.data,vt=j.stride,Wt=tt.offset;if(j.isInstancedInterleavedBuffer){for(let Et=0;Et<Z.locationSize;Et++)m(Z.location+Et,j.meshPerAttribute);I.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let Et=0;Et<Z.locationSize;Et++)p(Z.location+Et);s.bindBuffer(s.ARRAY_BUFFER,ce);for(let Et=0;Et<Z.locationSize;Et++)M(Z.location+Et,Lt/Z.locationSize,ae,nt,vt*le,(Wt+Lt/Z.locationSize*Et)*le,X)}else{if(tt.isInstancedBufferAttribute){for(let j=0;j<Z.locationSize;j++)m(Z.location+j,tt.meshPerAttribute);I.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=tt.meshPerAttribute*tt.count)}else for(let j=0;j<Z.locationSize;j++)p(Z.location+j);s.bindBuffer(s.ARRAY_BUFFER,ce);for(let j=0;j<Z.locationSize;j++)M(Z.location+j,Lt/Z.locationSize,ae,nt,Lt*le,Lt/Z.locationSize*j*le,X)}}else if(Y!==void 0){let nt=Y[rt];if(nt!==void 0)switch(nt.length){case 2:s.vertexAttrib2fv(Z.location,nt);break;case 3:s.vertexAttrib3fv(Z.location,nt);break;case 4:s.vertexAttrib4fv(Z.location,nt);break;default:s.vertexAttrib1fv(Z.location,nt)}}}}x()}function S(){R();for(let I in i){let N=i[I];for(let B in N){let L=N[B];for(let O in L){let q=L[O];for(let Y in q)h(q[Y].object),delete q[Y];delete L[O]}}delete i[I]}}function b(I){if(i[I.id]===void 0)return;let N=i[I.id];for(let B in N){let L=N[B];for(let O in L){let q=L[O];for(let Y in q)h(q[Y].object),delete q[Y];delete L[O]}}delete i[I.id]}function A(I){for(let N in i){let B=i[N];for(let L in B){let O=B[L];if(O[I.id]===void 0)continue;let q=O[I.id];for(let Y in q)h(q[Y].object),delete q[Y];delete O[I.id]}}}function _(I){for(let N in i){let B=i[N],L=I.isInstancedMesh===!0?I.id:0,O=B[L];if(O!==void 0){for(let q in O){let Y=O[q];for(let rt in Y)h(Y[rt].object),delete Y[rt];delete O[q]}delete B[L],Object.keys(B).length===0&&delete i[N]}}}function R(){P(),o=!0,r!==n&&(r=n,c(r.object))}function P(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:a,reset:R,resetDefaultState:P,dispose:S,releaseStatesOfGeometry:b,releaseStatesOfObject:_,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:p,disableUnusedAttributes:x}}function l_(s,t,e){let i;function n(l){i=l}function r(l,c){s.drawArrays(i,l,c),e.update(c,i,1)}function o(l,c,h){h!==0&&(s.drawArraysInstanced(i,l,c,h),e.update(c,i,h))}function a(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];e.update(d,i,1)}this.setMode=n,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function c_(s,t,e,i){let n;function r(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let A=t.get("EXT_texture_filter_anisotropic");n=s.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function o(A){return!(A!==vn&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){let _=A===ui&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(A!==Fi&&A!==gn&&!_&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(A){if(A==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(jt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&d===!1&&jt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=s.getParameter(s.MAX_TEXTURE_SIZE),p=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),x=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),M=s.getParameter(s.MAX_VARYING_VECTORS),y=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),S=s.getParameter(s.MAX_SAMPLES),b=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:x,maxVaryings:M,maxFragmentUniforms:y,maxSamples:S,samples:b}}function h_(s){let t=this,e=null,i=0,n=!1,r=!1,o=new Gi,a=new ie,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||i!==0||n;return n=d,i=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){let g=u.clippingPlanes,v=u.clipIntersection,p=u.clipShadows,m=s.get(u);if(!n||g===null||g.length===0||r&&!p)r?h(null):c();else{let x=r?0:i,M=x*4,y=m.clippingState||null;l.value=y,y=h(g,d,M,f);for(let S=0;S!==M;++S)y[S]=e[S];m.clippingState=y,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(u,d,f,g){let v=u!==null?u.length:0,p=null;if(v!==0){if(p=l.value,g!==!0||p===null){let m=f+v*4,x=d.matrixWorldInverse;a.getNormalMatrix(x),(p===null||p.length<m)&&(p=new Float32Array(m));for(let M=0,y=f;M!==v;++M,y+=4)o.copy(u[M]).applyMatrix4(x,a),o.normal.toArray(p,y),p[y+3]=o.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,p}}var go=4,u_=6,d_=20,f_=256,rl=new jn,am=new St,wd=null,Ad=0,Rd=0,Cd=!1,p_=new T,pr=new T,xo=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,i=.1,n=100,r={}){let{size:o=256,position:a=p_}=r;wd=this._renderer.getRenderTarget(),Ad=this._renderer.getActiveCubeFace(),Rd=this._renderer.getActiveMipmapLevel(),Cd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,n,l,a),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=hm(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=cm(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(wd,Ad,Rd),this._renderer.xr.enabled=Cd,t.scissorTest=!1,mo(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Hs||t.mapping===dr?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),wd=this._renderer.getRenderTarget(),Ad=this._renderer.getActiveCubeFace(),Rd=this._renderer.getActiveMipmapLevel(),Cd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:gi,minFilter:gi,generateMipmaps:!1,type:ui,format:vn,colorSpace:ha,depthBuffer:!1},n=lm(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=lm(t,e,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=m_(r)),this._blurMaterial=v_(r,t,e),this._ggxMaterial=g_(r,t,e)}return n}_compileMaterial(t){let e=new ot(new re,t);this._renderer.compile(e,rl)}_sceneToCubeUV(t,e,i,n,r){let l=new ei(90,1,e,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(am),u.toneMapping=Ln,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(n),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ot(new De,new ve({name:"PMREM.Background",side:_i,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,p=v.material,m=!1,x=t.background;x?x.isColor&&(p.color.copy(x),t.background=null,m=!0):(p.color.copy(am),m=!0);for(let M=0;M<6;M++){let y=M%3;y===0?(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[M],r.y,r.z)):y===1?(l.up.set(0,0,c[M]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[M],r.z)):(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[M]));let S=this._cubeSize;mo(n,y*S,M>2?S:0,S,S),u.setRenderTarget(n),m&&u.render(v,l),u.render(t,l)}u.toneMapping=f,u.autoClear=d,t.background=x}_textureToCubeUV(t,e){let i=this._renderer,n=t.mapping===Hs||t.mapping===dr;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=hm()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=cm());let r=n?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=t;let l=this._cubeSize;mo(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(o,rl)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let n=this._lodMeshes.length;for(let r=1;r<n;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=i}_applyGGXFilter(t,e,i){let n=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;let l=o.uniforms,c=i/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=c*1.25,f=u*d,{_lodMax:g}=this,v=this._sizeLods[i],p=3*v*(i>g-go?i-g+go:0),m=4*(this._cubeSize-v);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=g-e,mo(r,p,m,3*v,2*v),n.setRenderTarget(r),n.render(a,rl),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-i,mo(t,p,m,3*v,2*v),n.setRenderTarget(t),n.render(a,rl)}_blur(t,e,i,n){let r=this._pingPongRenderTarget,o=Math.min(n,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,i,o),this._blurPass(r,t,i,i,o)}_blurPass(t,e,i,n,r){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[n];l.material=a;let c=a.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[n],u=3*h*(n>this._lodMax-go?n-this._lodMax+go:0),d=4*(this._cubeSize-h);mo(e,u,d,3*h,2*h),o.setRenderTarget(e),o.render(l,rl)}};function m_(s){let t=[],e=[],i=s,n=s-go+1+u_;for(let r=0;r<n;r++){let o=Math.pow(2,i);t.push(o);let a=1/(o-2),l=-a,c=1+a,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,f=3,g=new Float32Array(f*d*u),v=new Float32Array(f*d*u);for(let m=0;m<u;m++){let x=m%3*2/3-1,M=m>2?0:-1,y=[x,M,0,x+2/3,M,0,x+2/3,M+1,0,x,M,0,x+2/3,M+1,0,x,M+1,0];g.set(y,f*d*m);for(let S=0;S<d;S++){let b=h[S*2]*2-1,A=h[S*2+1]*2-1;m===0?pr.set(1,A,b):m===1?pr.set(-b,1,-A):m===2?pr.set(-b,A,1):m===3?pr.set(-1,A,-b):m===4?pr.set(-b,-1,A):pr.set(b,A,-1),pr.toArray(v,(m*d+S)*f)}}let p=new re;p.setAttribute("position",new ge(g,f)),p.setAttribute("outputDirection",new ge(v,f)),e.push(new ot(p,null)),i>go&&i--}return{lodMeshes:e,sizeLods:t}}function lm(s,t,e){let i=new je(s,t,e);return i.texture.mapping=Ka,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function mo(s,t,e,i,n){s.viewport.set(t,e,i,n),s.scissor.set(t,e,i,n)}function g_(s,t,e){return new fe({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:f_,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Ch(),fragmentShader:`

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
		`,blending:pn,depthTest:!1,depthWrite:!1})}function v_(s,t,e){return new fe({name:"SphericalGaussianBlur",defines:{SAMPLES:d_,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Ch(),fragmentShader:`

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
		`,blending:pn,depthTest:!1,depthWrite:!1})}function cm(){return new fe({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ch(),fragmentShader:`

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
		`,blending:pn,depthTest:!1,depthWrite:!1})}function hm(){return new fe({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ch(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:pn,depthTest:!1,depthWrite:!1})}function Ch(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Ah=class extends je{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},n=[i,i,i,i,i,i];this.texture=new Sa(n),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},n=new De(5,5,5),r=new fe({name:"CubemapFromEquirect",uniforms:fr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:_i,blending:pn});r.uniforms.tEquirect.value=e;let o=new ot(n,r),a=e.minFilter;return e.minFilter===zs&&(e.minFilter=gi),new Dc(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,i=!0,n=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,i,n);t.setRenderTarget(r)}};function x_(s){let t=new WeakMap,e=new WeakMap,i=null;function n(d,f=!1){return d==null?null:f?o(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===Fc||f===Bc)if(t.has(d)){let g=t.get(d).texture;return a(g,d.mapping)}else{let g=d.image;if(g&&g.height>0){let v=new Ah(g.height);return v.fromEquirectangularTexture(s,d),t.set(d,v),d.addEventListener("dispose",c),a(v.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,g=f===Fc||f===Bc,v=f===Hs||f===dr;if(g||v){let p=e.get(d),m=p!==void 0?p.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==m)return i===null&&(i=new xo(s)),p=g?i.fromEquirectangular(d,p):i.fromCubemap(d,p),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),p.texture;if(p!==void 0)return p.texture;{let x=d.image;return g&&x&&x.height>0||v&&x&&l(x)?(i===null&&(i=new xo(s)),p=g?i.fromEquirectangular(d):i.fromCubemap(d),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),d.addEventListener("dispose",h),p.texture):null}}}return d}function a(d,f){return f===Fc?d.mapping=Hs:f===Bc&&(d.mapping=dr),d}function l(d){let f=0,g=6;for(let v=0;v<g;v++)d[v]!==void 0&&f++;return f===g}function c(d){let f=d.target;f.removeEventListener("dispose",c);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function u(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:u}}function y_(s){let t={};function e(i){if(t[i]!==void 0)return t[i];let n=s.getExtension(i);return t[i]=n,n}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let n=e(i);return n===null&&or("WebGLRenderer: "+i+" extension not supported."),n}}}function __(s,t,e,i){let n={},r=new WeakMap;function o(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let g in d.attributes)t.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete n[d.id];let f=r.get(d);f&&(t.remove(f),r.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return n[d.id]===!0||(d.addEventListener("dispose",o),n[d.id]=!0,e.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)t.update(d[f],s.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,g=u.attributes.position,v=0;if(g===void 0)return;if(f!==null){let x=f.array;v=f.version;for(let M=0,y=x.length;M<y;M+=3){let S=x[M+0],b=x[M+1],A=x[M+2];d.push(S,b,b,A,A,S)}}else{let x=g.array;v=g.version;for(let M=0,y=x.length/3-1;M<y;M+=3){let S=M+0,b=M+1,A=M+2;d.push(S,b,b,A,A,S)}}let p=new(g.count>=65535?xa:va)(d,1);p.version=v;let m=r.get(u);m&&t.remove(m),r.set(u,p)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function M_(s,t,e){let i;function n(u){i=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function l(u,d){s.drawElements(i,d,r,u*o),e.update(d,i,1)}function c(u,d,f){f!==0&&(s.drawElementsInstanced(i,d,r,u*o,f),e.update(d,i,f))}function h(u,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,u,0,f);let v=0;for(let p=0;p<f;p++)v+=d[p];e.update(v,i,1)}this.setMode=n,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function b_(s){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(e.calls++,o){case s.TRIANGLES:e.triangles+=a*(r/3);break;case s.LINES:e.lines+=a*(r/2);break;case s.LINE_STRIP:e.lines+=a*(r-1);break;case s.LINE_LOOP:e.lines+=a*r;break;case s.POINTS:e.points+=a*r;break;default:te("WebGLInfo: Unknown draw mode:",o);break}}function n(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:n,update:i}}function S_(s,t,e){let i=new WeakMap,n=new Ke;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=i.get(a);if(d===void 0||d.count!==u){let R=function(){A.dispose(),i.delete(a),a.removeEventListener("dispose",R)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],x=a.morphAttributes.color||[],M=0;f===!0&&(M=1),g===!0&&(M=2),v===!0&&(M=3);let y=a.attributes.position.count*M,S=1;y>t.maxTextureSize&&(S=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let b=new Float32Array(y*S*4*u),A=new pa(b,y,S,u);A.type=gn,A.needsUpdate=!0;let _=M*4;for(let P=0;P<u;P++){let I=p[P],N=m[P],B=x[P],L=y*S*4*P;for(let O=0;O<I.count;O++){let q=O*_;f===!0&&(n.fromBufferAttribute(I,O),b[L+q+0]=n.x,b[L+q+1]=n.y,b[L+q+2]=n.z,b[L+q+3]=0),g===!0&&(n.fromBufferAttribute(N,O),b[L+q+4]=n.x,b[L+q+5]=n.y,b[L+q+6]=n.z,b[L+q+7]=0),v===!0&&(n.fromBufferAttribute(B,O),b[L+q+8]=n.x,b[L+q+9]=n.y,b[L+q+10]=n.z,b[L+q+11]=B.itemSize===4?n.w:1)}}d={count:u,texture:A,size:new Q(y,S)},i.set(a,d),a.addEventListener("dispose",R)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,e);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];let g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(s,"morphTargetBaseInfluence",g),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function E_(s,t,e,i,n){let r=new WeakMap;function o(c){let h=n.render.frame,u=c.geometry,d=t.get(c,u);if(r.get(d)!==h&&(t.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function a(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var T_={[qa]:"LINEAR_TONE_MAPPING",[Xa]:"REINHARD_TONE_MAPPING",[Ya]:"CINEON_TONE_MAPPING",[ur]:"ACES_FILMIC_TONE_MAPPING",[$a]:"AGX_TONE_MAPPING",[Ja]:"NEUTRAL_TONE_MAPPING",[Za]:"CUSTOM_TONE_MAPPING"};function w_(s,t,e,i,n,r){let o=new je(t,e,{type:s,depthBuffer:n,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new re;c.setAttribute("position",new $t([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new $t([0,2,0,0,2,0],2));let h=new lo({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new ot(c,h),d=new jn(-1,1,1,-1,0,1),f=null,g=null,v=!1,p,m=null,x=[],M=!1;this.setSize=function(y,S){o.setSize(y,S),a!==null&&a.setSize(y,S),l!==null&&l.setSize(y,S);for(let b=0;b<x.length;b++){let A=x[b];A.setSize&&A.setSize(y,S)}},this.setEffects=function(y){x=y,M=x.length>0&&x[0].isRenderPass===!0;let S=o.width,b=o.height;x.length>0&&a===null&&(a=new je(S,b,{type:ui,depthBuffer:!1,stencilBuffer:!1}),l=new je(S,b,{type:ui,depthBuffer:!1,stencilBuffer:!1}));for(let A=0;A<x.length;A++){let _=x[A];_.setSize&&_.setSize(S,b)}},this.begin=function(y,S){if(v||y.toneMapping===Ln&&x.length===0)return!1;if(m=S,S!==null){let b=S.width,A=S.height;(o.width!==b||o.height!==A)&&this.setSize(b,A)}return M===!1&&y.setRenderTarget(o),p=y.toneMapping,y.toneMapping=Ln,!0},this.hasRenderPass=function(){return M},this.end=function(y,S){y.toneMapping=p,v=!0;let b=o,A=a;for(let _=0;_<x.length;_++){let R=x[_];R.enabled!==!1&&(R.render(y,A,b,S),R.needsSwap!==!1&&(b=A,A=A===a?l:a))}if(f!==y.outputColorSpace||g!==y.toneMapping){f=y.outputColorSpace,g=y.toneMapping,h.defines={},_e.getTransfer(f)===Ce&&(h.defines.SRGB_TRANSFER="");let _=T_[g];_&&(h.defines[_]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=b.texture,y.setRenderTarget(m),y.render(u,d),m=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var Pm=new Wi,Ld=new Ns(1,1),Im=new pa,Lm=new pc,Dm=new Sa,um=[],dm=[],fm=new Float32Array(16),pm=new Float32Array(9),mm=new Float32Array(4);function yo(s,t,e){let i=s[0];if(i<=0||i>0)return s;let n=t*e,r=um[n];if(r===void 0&&(r=new Float32Array(n),um[n]=r),t!==0){i.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,s[o].toArray(r,a)}return r}function Mi(s,t){if(s.length!==t.length)return!1;for(let e=0,i=s.length;e<i;e++)if(s[e]!==t[e])return!1;return!0}function bi(s,t){for(let e=0,i=t.length;e<i;e++)s[e]=t[e]}function Ph(s,t){let e=dm[t];e===void 0&&(e=new Int32Array(t),dm[t]=e);for(let i=0;i!==t;++i)e[i]=s.allocateTextureUnit();return e}function A_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function R_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Mi(e,t))return;s.uniform2fv(this.addr,t),bi(e,t)}}function C_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Mi(e,t))return;s.uniform3fv(this.addr,t),bi(e,t)}}function P_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Mi(e,t))return;s.uniform4fv(this.addr,t),bi(e,t)}}function I_(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(Mi(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),bi(e,t)}else{if(Mi(e,i))return;mm.set(i),s.uniformMatrix2fv(this.addr,!1,mm),bi(e,i)}}function L_(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(Mi(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),bi(e,t)}else{if(Mi(e,i))return;pm.set(i),s.uniformMatrix3fv(this.addr,!1,pm),bi(e,i)}}function D_(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(Mi(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),bi(e,t)}else{if(Mi(e,i))return;fm.set(i),s.uniformMatrix4fv(this.addr,!1,fm),bi(e,i)}}function N_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function U_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Mi(e,t))return;s.uniform2iv(this.addr,t),bi(e,t)}}function F_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Mi(e,t))return;s.uniform3iv(this.addr,t),bi(e,t)}}function B_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Mi(e,t))return;s.uniform4iv(this.addr,t),bi(e,t)}}function O_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function H_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Mi(e,t))return;s.uniform2uiv(this.addr,t),bi(e,t)}}function z_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Mi(e,t))return;s.uniform3uiv(this.addr,t),bi(e,t)}}function k_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Mi(e,t))return;s.uniform4uiv(this.addr,t),bi(e,t)}}function V_(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n);let r;this.type===s.SAMPLER_2D_SHADOW?(Ld.compareFunction=e.isReversedDepthBuffer()?Eh:Sh,r=Ld):r=Pm,e.setTexture2D(t||r,n)}function G_(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture3D(t||Lm,n)}function W_(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTextureCube(t||Dm,n)}function q_(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture2DArray(t||Im,n)}function X_(s){switch(s){case 5126:return A_;case 35664:return R_;case 35665:return C_;case 35666:return P_;case 35674:return I_;case 35675:return L_;case 35676:return D_;case 5124:case 35670:return N_;case 35667:case 35671:return U_;case 35668:case 35672:return F_;case 35669:case 35673:return B_;case 5125:return O_;case 36294:return H_;case 36295:return z_;case 36296:return k_;case 35678:case 36198:case 36298:case 36306:case 35682:return V_;case 35679:case 36299:case 36307:return G_;case 35680:case 36300:case 36308:case 36293:return W_;case 36289:case 36303:case 36311:case 36292:return q_}}function Y_(s,t){s.uniform1fv(this.addr,t)}function Z_(s,t){let e=yo(t,this.size,2);s.uniform2fv(this.addr,e)}function $_(s,t){let e=yo(t,this.size,3);s.uniform3fv(this.addr,e)}function J_(s,t){let e=yo(t,this.size,4);s.uniform4fv(this.addr,e)}function K_(s,t){let e=yo(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function j_(s,t){let e=yo(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function Q_(s,t){let e=yo(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function tM(s,t){s.uniform1iv(this.addr,t)}function eM(s,t){s.uniform2iv(this.addr,t)}function iM(s,t){s.uniform3iv(this.addr,t)}function nM(s,t){s.uniform4iv(this.addr,t)}function sM(s,t){s.uniform1uiv(this.addr,t)}function rM(s,t){s.uniform2uiv(this.addr,t)}function oM(s,t){s.uniform3uiv(this.addr,t)}function aM(s,t){s.uniform4uiv(this.addr,t)}function lM(s,t,e){let i=this.cache,n=t.length,r=Ph(e,n);Mi(i,r)||(s.uniform1iv(this.addr,r),bi(i,r));let o;this.type===s.SAMPLER_2D_SHADOW?o=Ld:o=Pm;for(let a=0;a!==n;++a)e.setTexture2D(t[a]||o,r[a])}function cM(s,t,e){let i=this.cache,n=t.length,r=Ph(e,n);Mi(i,r)||(s.uniform1iv(this.addr,r),bi(i,r));for(let o=0;o!==n;++o)e.setTexture3D(t[o]||Lm,r[o])}function hM(s,t,e){let i=this.cache,n=t.length,r=Ph(e,n);Mi(i,r)||(s.uniform1iv(this.addr,r),bi(i,r));for(let o=0;o!==n;++o)e.setTextureCube(t[o]||Dm,r[o])}function uM(s,t,e){let i=this.cache,n=t.length,r=Ph(e,n);Mi(i,r)||(s.uniform1iv(this.addr,r),bi(i,r));for(let o=0;o!==n;++o)e.setTexture2DArray(t[o]||Im,r[o])}function dM(s){switch(s){case 5126:return Y_;case 35664:return Z_;case 35665:return $_;case 35666:return J_;case 35674:return K_;case 35675:return j_;case 35676:return Q_;case 5124:case 35670:return tM;case 35667:case 35671:return eM;case 35668:case 35672:return iM;case 35669:case 35673:return nM;case 5125:return sM;case 36294:return rM;case 36295:return oM;case 36296:return aM;case 35678:case 36198:case 36298:case 36306:case 35682:return lM;case 35679:case 36299:case 36307:return cM;case 35680:case 36300:case 36308:case 36293:return hM;case 36289:case 36303:case 36311:case 36292:return uM}}var Dd=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=X_(e.type)}},Nd=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=dM(e.type)}},Ud=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let n=this.seq;for(let r=0,o=n.length;r!==o;++r){let a=n[r];a.setValue(t,e[a.id],i)}}},Pd=/(\w+)(\])?(\[|\.)?/g;function gm(s,t){s.seq.push(t),s.map[t.id]=t}function fM(s,t,e){let i=s.name,n=i.length;for(Pd.lastIndex=0;;){let r=Pd.exec(i),o=Pd.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===n){gm(e,c===void 0?new Dd(a,s,t):new Nd(a,s,t));break}else{let u=e.map[a];u===void 0&&(u=new Ud(a),gm(e,u)),e=u}}}var vo=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){let a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);fM(a,l,this)}let n=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?n.push(o):r.push(o);n.length>0&&(this.seq=n.concat(r))}setValue(t,e,i,n){let r=this.map[e];r!==void 0&&r.setValue(t,i,n)}setOptional(t,e,i){let n=e[i];n!==void 0&&this.setValue(t,i,n)}static upload(t,e,i,n){for(let r=0,o=e.length;r!==o;++r){let a=e[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,n)}}static seqWithValue(t,e){let i=[];for(let n=0,r=t.length;n!==r;++n){let o=t[n];o.id in e&&i.push(o)}return i}};function vm(s,t,e){let i=s.createShader(t);return s.shaderSource(i,e),s.compileShader(i),i}var pM=37297,mM=0;function gM(s,t){let e=s.split(`
`),i=[],n=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=n;o<r;o++){let a=o+1;i.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return i.join(`
`)}var xm=new ie;function vM(s){_e._getMatrix(xm,_e.workingColorSpace,s);let t=`mat3( ${xm.elements.map(e=>e.toFixed(4))} )`;switch(_e.getTransfer(s)){case ua:return[t,"LinearTransferOETF"];case Ce:return[t,"sRGBTransferOETF"];default:return jt("WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function ym(s,t,e){let i=s.getShaderParameter(t,s.COMPILE_STATUS),r=(s.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+gM(s.getShaderSource(t),a)}else return r}function xM(s,t){let e=vM(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var yM={[qa]:"Linear",[Xa]:"Reinhard",[Ya]:"Cineon",[ur]:"ACESFilmic",[$a]:"AgX",[Ja]:"Neutral",[Za]:"Custom"};function _M(s,t){let e=yM[t];return e===void 0?(jt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var wh=new T;function MM(){_e.getLuminanceCoefficients(wh);let s=wh.x.toFixed(4),t=wh.y.toFixed(4),e=wh.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function bM(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(al).join(`
`)}function SM(s){let t=[];for(let e in s){let i=s[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function EM(s,t){let e={},i=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){let r=s.getActiveAttrib(t,n),o=r.name,a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:s.getAttribLocation(t,o),locationSize:a}}return e}function al(s){return s!==""}function _m(s,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Mm(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var TM=/^[ \t]*#include +<([\w\d./]+)>/gm;function Fd(s){return s.replace(TM,AM)}var wM=new Map;function AM(s,t){let e=pe[t];if(e===void 0){let i=wM.get(t);if(i!==void 0)e=pe[i],jt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Fd(e)}var RM=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function bm(s){return s.replace(RM,CM)}function CM(s,t,e,i){let n="";for(let r=parseInt(t);r<parseInt(e);r++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return n}function Sm(s){let t=`precision ${s.precision} float;
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
#define LOW_PRECISION`),t}var PM={[cr]:"SHADOWMAP_TYPE_PCF",[uo]:"SHADOWMAP_TYPE_VSM"};function IM(s){return PM[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var LM={[Hs]:"ENVMAP_TYPE_CUBE",[dr]:"ENVMAP_TYPE_CUBE",[Ka]:"ENVMAP_TYPE_CUBE_UV"};function DM(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":LM[s.envMapMode]||"ENVMAP_TYPE_CUBE"}var NM={[dr]:"ENVMAP_MODE_REFRACTION"};function UM(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":NM[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var FM={[rd]:"ENVMAP_BLENDING_MULTIPLY",[Bp]:"ENVMAP_BLENDING_MIX",[Op]:"ENVMAP_BLENDING_ADD"};function BM(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":FM[s.combine]||"ENVMAP_BLENDING_NONE"}function OM(s){let t=s.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function HM(s,t,e,i){let n=s.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,l=IM(e),c=DM(e),h=UM(e),u=BM(e),d=OM(e),f=bM(e),g=SM(r),v=n.createProgram(),p,m,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(al).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(al).join(`
`),m.length>0&&(m+=`
`)):(p=[Sm(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(al).join(`
`),m=[Sm(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Ln?"#define TONE_MAPPING":"",e.toneMapping!==Ln?pe.tonemapping_pars_fragment:"",e.toneMapping!==Ln?_M("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",pe.colorspace_pars_fragment,xM("linearToOutputTexel",e.outputColorSpace),MM(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(al).join(`
`)),o=Fd(o),o=_m(o,e),o=Mm(o,e),a=Fd(a),a=_m(a,e),a=Mm(a,e),o=bm(o),a=bm(a),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===pd?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===pd?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let M=x+p+o,y=x+m+a,S=vm(n,n.VERTEX_SHADER,M),b=vm(n,n.FRAGMENT_SHADER,y);n.attachShader(v,S),n.attachShader(v,b),e.index0AttributeName!==void 0?n.bindAttribLocation(v,0,e.index0AttributeName):e.hasPositionAttribute===!0&&n.bindAttribLocation(v,0,"position"),n.linkProgram(v);function A(I){if(s.debug.checkShaderErrors){let N=n.getProgramInfoLog(v)||"",B=n.getShaderInfoLog(S)||"",L=n.getShaderInfoLog(b)||"",O=N.trim(),q=B.trim(),Y=L.trim(),rt=!0,Z=!0;if(n.getProgramParameter(v,n.LINK_STATUS)===!1)if(rt=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(n,v,S,b);else{let tt=ym(n,S,"vertex"),nt=ym(n,b,"fragment");te("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(v,n.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+O+`
`+tt+`
`+nt)}else O!==""?jt("WebGLProgram: Program Info Log:",O):(q===""||Y==="")&&(Z=!1);Z&&(I.diagnostics={runnable:rt,programLog:O,vertexShader:{log:q,prefix:p},fragmentShader:{log:Y,prefix:m}})}n.deleteShader(S),n.deleteShader(b),_=new vo(n,v),R=EM(n,v)}let _;this.getUniforms=function(){return _===void 0&&A(this),_};let R;this.getAttributes=function(){return R===void 0&&A(this),R};let P=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=n.getProgramParameter(v,pM)),P},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=mM++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=S,this.fragmentShader=b,this}var zM=0,Bd=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let n=this._getShaderCacheForMaterial(t);return n.has(e)===!1&&(n.add(e),e.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new Od(t),e.set(t,i)),i}},Od=class{constructor(t){this.id=zM++,this.code=t,this.usedTimes=0}};function kM(s){return s===Vs||s===nl||s===sl}function VM(s,t,e,i,n,r){let o=new ma,a=new Bd,l=new Set,c=[],h=new Map,u=i.logarithmicDepthBuffer,d=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return l.add(_),_===0?"uv":`uv${_}`}function v(_,R,P,I,N,B){let L=I.fog,O=N.geometry,q=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?I.environment:null,Y=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,rt=t.get(_.envMap||q,Y),Z=rt&&rt.mapping===Ka?rt.image.height:null,tt=f[_.type];_.precision!==null&&(d=i.getMaxPrecision(_.precision),d!==_.precision&&jt("WebGLProgram.getParameters:",_.precision,"not supported, using",d,"instead."));let nt=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,Lt=nt!==void 0?nt.length:0,Pt=0;O.morphAttributes.position!==void 0&&(Pt=1),O.morphAttributes.normal!==void 0&&(Pt=2),O.morphAttributes.color!==void 0&&(Pt=3);let ce,ae,le,X;if(tt){let z=ts[tt];ce=z.vertexShader,ae=z.fragmentShader}else{ce=_.vertexShader,ae=_.fragmentShader;let z=a.getVertexShaderStage(_),W=a.getFragmentShaderStage(_);a.update(_,z,W),le=z.id,X=W.id}let j=s.getRenderTarget(),vt=s.state.buffers.depth.getReversed(),Wt=N.isInstancedMesh===!0,Et=N.isBatchedMesh===!0,Zt=!!_.map,ye=!!_.matcap,st=!!rt,ct=!!_.aoMap,dt=!!_.lightMap,ft=!!_.bumpMap&&_.wireframe===!1,mt=!!_.normalMap,Jt=!!_.displacementMap,Xt=!!_.emissiveMap,Qt=!!_.metalnessMap,ee=!!_.roughnessMap,D=_.anisotropy>0,we=_.clearcoat>0,me=_.dispersion>0,C=_.retroreflectivity>0,E=_.iridescence>0,H=_.sheen>0,G=_.transmission>0,J=D&&!!_.anisotropyMap,pt=we&&!!_.clearcoatMap,gt=we&&!!_.clearcoatNormalMap,K=we&&!!_.clearcoatRoughnessMap,it=E&&!!_.iridescenceMap,xt=E&&!!_.iridescenceThicknessMap,kt=H&&!!_.sheenColorMap,Tt=H&&!!_.sheenRoughnessMap,Mt=!!_.specularMap,Vt=!!_.specularColorMap,Kt=!!_.specularIntensityMap,ne=G&&!!_.transmissionMap,F=G&&!!_.thicknessMap,yt=!!_.gradientMap,et=!!_.alphaMap,_t=_.alphaTest>0,At=!!_.alphaHash,at=!!_.extensions,Bt=Ln;_.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Bt=s.toneMapping);let Ut={shaderID:tt,shaderType:_.type,shaderName:_.name,vertexShader:ce,fragmentShader:ae,defines:_.defines,customVertexShaderID:le,customFragmentShaderID:X,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:d,batching:Et,batchingColor:Et&&N._colorsTexture!==null,instancing:Wt,instancingColor:Wt&&N.instanceColor!==null,instancingMorph:Wt&&N.morphTexture!==null,outputColorSpace:j===null?s.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:_e.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Zt,matcap:ye,envMap:st,envMapMode:st&&rt.mapping,envMapCubeUVHeight:Z,aoMap:ct,lightMap:dt,bumpMap:ft,normalMap:mt,displacementMap:Jt,emissiveMap:Xt,normalMapObjectSpace:mt&&_.normalMapType===kp,normalMapTangentSpace:mt&&_.normalMapType===bh,packedNormalMap:mt&&_.normalMapType===bh&&kM(_.normalMap.format),metalnessMap:Qt,roughnessMap:ee,anisotropy:D,anisotropyMap:J,clearcoat:we,clearcoatMap:pt,clearcoatNormalMap:gt,clearcoatRoughnessMap:K,dispersion:me,retroreflection:C,iridescence:E,iridescenceMap:it,iridescenceThicknessMap:xt,sheen:H,sheenColorMap:kt,sheenRoughnessMap:Tt,specularMap:Mt,specularColorMap:Vt,specularIntensityMap:Kt,transmission:G,transmissionMap:ne,thicknessMap:F,gradientMap:yt,opaque:_.transparent===!1&&_.blending===mn&&_.alphaToCoverage===!1,alphaMap:et,alphaTest:_t,alphaHash:At,combine:_.combine,mapUv:Zt&&g(_.map.channel),aoMapUv:ct&&g(_.aoMap.channel),lightMapUv:dt&&g(_.lightMap.channel),bumpMapUv:ft&&g(_.bumpMap.channel),normalMapUv:mt&&g(_.normalMap.channel),displacementMapUv:Jt&&g(_.displacementMap.channel),emissiveMapUv:Xt&&g(_.emissiveMap.channel),metalnessMapUv:Qt&&g(_.metalnessMap.channel),roughnessMapUv:ee&&g(_.roughnessMap.channel),anisotropyMapUv:J&&g(_.anisotropyMap.channel),clearcoatMapUv:pt&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:gt&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:K&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:it&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:xt&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:kt&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:Tt&&g(_.sheenRoughnessMap.channel),specularMapUv:Mt&&g(_.specularMap.channel),specularColorMapUv:Vt&&g(_.specularColorMap.channel),specularIntensityMapUv:Kt&&g(_.specularIntensityMap.channel),transmissionMapUv:ne&&g(_.transmissionMap.channel),thicknessMapUv:F&&g(_.thicknessMap.channel),alphaMapUv:et&&g(_.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(mt||D),vertexNormals:!!O.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!O.attributes.uv&&(Zt||et),fog:!!L,useFog:_.fog===!0,fogExp2:!!L&&L.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||O.attributes.normal===void 0&&mt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:vt,skinning:N.isSkinnedMesh===!0,hasPositionAttribute:O.attributes.position!==void 0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:Lt,morphTextureStride:Pt,numSunLights:R.sun.length,numDirLights:R.directional.length,numPointLights:R.point.length,numSpotLights:R.spot.length,numSpotLightMaps:R.spotLightMap.length,numRectAreaLights:R.rectArea.length,numHemiLights:R.hemi.length,numSunLightShadows:R.sunShadowMap.length,numDirLightShadows:R.directionalShadowMap.length,numPointLightShadows:R.pointShadowMap.length,numSpotLightShadows:R.spotShadowMap.length,numSpotLightShadowsWithMaps:R.numSpotLightShadowsWithMaps,numLightProbes:R.numLightProbes,numLightProbeGrids:B.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:Bt,decodeVideoTexture:Zt&&_.map.isVideoTexture===!0&&_e.getTransfer(_.map.colorSpace)===Ce,decodeVideoTextureEmissive:Xt&&_.emissiveMap.isVideoTexture===!0&&_e.getTransfer(_.emissiveMap.colorSpace)===Ce,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===oe,flipSided:_.side===_i,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:at&&_.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(at&&_.extensions.multiDraw===!0||Et)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Ut.vertexUv1s=l.has(1),Ut.vertexUv2s=l.has(2),Ut.vertexUv3s=l.has(3),l.clear(),Ut}function p(_){let R=[];if(_.shaderID?R.push(_.shaderID):(R.push(_.customVertexShaderID),R.push(_.customFragmentShaderID)),_.defines!==void 0)for(let P in _.defines)R.push(P),R.push(_.defines[P]);return _.isRawShaderMaterial===!1&&(m(R,_),x(R,_),R.push(s.outputColorSpace)),R.push(_.customProgramCacheKey),R.join()}function m(_,R){_.push(R.precision),_.push(R.outputColorSpace),_.push(R.envMapMode),_.push(R.envMapCubeUVHeight),_.push(R.mapUv),_.push(R.alphaMapUv),_.push(R.lightMapUv),_.push(R.aoMapUv),_.push(R.bumpMapUv),_.push(R.normalMapUv),_.push(R.displacementMapUv),_.push(R.emissiveMapUv),_.push(R.metalnessMapUv),_.push(R.roughnessMapUv),_.push(R.anisotropyMapUv),_.push(R.clearcoatMapUv),_.push(R.clearcoatNormalMapUv),_.push(R.clearcoatRoughnessMapUv),_.push(R.iridescenceMapUv),_.push(R.iridescenceThicknessMapUv),_.push(R.sheenColorMapUv),_.push(R.sheenRoughnessMapUv),_.push(R.specularMapUv),_.push(R.specularColorMapUv),_.push(R.specularIntensityMapUv),_.push(R.transmissionMapUv),_.push(R.thicknessMapUv),_.push(R.combine),_.push(R.fogExp2),_.push(R.sizeAttenuation),_.push(R.morphTargetsCount),_.push(R.morphAttributeCount),_.push(R.numSunLights),_.push(R.numDirLights),_.push(R.numPointLights),_.push(R.numSpotLights),_.push(R.numSpotLightMaps),_.push(R.numHemiLights),_.push(R.numRectAreaLights),_.push(R.numSunLightShadows),_.push(R.numDirLightShadows),_.push(R.numPointLightShadows),_.push(R.numSpotLightShadows),_.push(R.numSpotLightShadowsWithMaps),_.push(R.numLightProbes),_.push(R.shadowMapType),_.push(R.toneMapping),_.push(R.numClippingPlanes),_.push(R.numClipIntersection),_.push(R.depthPacking)}function x(_,R){o.disableAll(),R.instancing&&o.enable(0),R.instancingColor&&o.enable(1),R.instancingMorph&&o.enable(2),R.matcap&&o.enable(3),R.envMap&&o.enable(4),R.normalMapObjectSpace&&o.enable(5),R.normalMapTangentSpace&&o.enable(6),R.clearcoat&&o.enable(7),R.iridescence&&o.enable(8),R.alphaTest&&o.enable(9),R.vertexColors&&o.enable(10),R.vertexAlphas&&o.enable(11),R.vertexUv1s&&o.enable(12),R.vertexUv2s&&o.enable(13),R.vertexUv3s&&o.enable(14),R.vertexTangents&&o.enable(15),R.anisotropy&&o.enable(16),R.alphaHash&&o.enable(17),R.batching&&o.enable(18),R.dispersion&&o.enable(19),R.retroreflection&&o.enable(24),R.batchingColor&&o.enable(20),R.gradientMap&&o.enable(21),R.packedNormalMap&&o.enable(22),R.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),R.fog&&o.enable(0),R.useFog&&o.enable(1),R.flatShading&&o.enable(2),R.logarithmicDepthBuffer&&o.enable(3),R.reversedDepthBuffer&&o.enable(4),R.skinning&&o.enable(5),R.morphTargets&&o.enable(6),R.morphNormals&&o.enable(7),R.morphColors&&o.enable(8),R.premultipliedAlpha&&o.enable(9),R.shadowMapEnabled&&o.enable(10),R.doubleSided&&o.enable(11),R.flipSided&&o.enable(12),R.useDepthPacking&&o.enable(13),R.dithering&&o.enable(14),R.transmission&&o.enable(15),R.sheen&&o.enable(16),R.opaque&&o.enable(17),R.pointsUvs&&o.enable(18),R.decodeVideoTexture&&o.enable(19),R.decodeVideoTextureEmissive&&o.enable(20),R.alphaToCoverage&&o.enable(21),R.numLightProbeGrids>0&&o.enable(22),R.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function M(_){let R=f[_.type],P;if(R){let I=ts[R];P=Ms.clone(I.uniforms)}else P=_.uniforms;return P}function y(_,R){let P=h.get(R);return P!==void 0?++P.usedTimes:(P=new HM(s,R,_,n),c.push(P),h.set(R,P)),P}function S(_){if(--_.usedTimes===0){let R=c.indexOf(_);c[R]=c[c.length-1],c.pop(),h.delete(_.cacheKey),_.destroy()}}function b(_){a.remove(_)}function A(){a.dispose()}return{getParameters:v,getProgramCacheKey:p,getUniforms:M,acquireProgram:y,releaseProgram:S,releaseShaderCache:b,programs:c,dispose:A}}function GM(){let s=new WeakMap;function t(o){return s.has(o)}function e(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function i(o){s.delete(o)}function n(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:i,update:n,dispose:r}}function WM(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.materialVariant!==t.materialVariant?s.materialVariant-t.materialVariant:s.z!==t.z?s.z-t.z:s.id-t.id}function Em(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function Tm(){let s=[],t=0,e=[],i=[],n=[];function r(){t=0,e.length=0,i.length=0,n.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,g,v,p,m){let x=s[t];return x===void 0?(x={id:d.id,object:d,geometry:f,material:g,materialVariant:o(d),groupOrder:v,renderOrder:d.renderOrder,z:p,group:m},s[t]=x):(x.id=d.id,x.object=d,x.geometry=f,x.material=g,x.materialVariant=o(d),x.groupOrder=v,x.renderOrder=d.renderOrder,x.z=p,x.group=m),t++,x}function l(d,f,g,v,p,m,x){x.reversedDepth===!0&&(p=-p);let M=a(d,f,g,v,p,m);g.transmission>0?i.push(M):g.transparent===!0?n.push(M):e.push(M)}function c(d,f,g,v,p,m){let x=a(d,f,g,v,p,m);g.transmission>0?i.unshift(x):g.transparent===!0?n.unshift(x):e.unshift(x)}function h(d,f){e.length>1&&e.sort(d||WM),i.length>1&&i.sort(f||Em),n.length>1&&n.sort(f||Em)}function u(){for(let d=t,f=s.length;d<f;d++){let g=s[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:i,transparent:n,init:r,push:l,unshift:c,finish:u,sort:h}}function qM(){let s=new WeakMap;function t(i,n){let r=s.get(i),o;return r===void 0?(o=new Tm,s.set(i,[o])):n>=r.length?(o=new Tm,r.push(o)):o=r[n],o}function e(){s=new WeakMap}return{get:t,dispose:e}}function XM(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new T,color:new St};break;case"SpotLight":e={position:new T,direction:new T,color:new St,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new T,color:new St,distance:0,decay:0};break;case"HemisphereLight":e={direction:new T,skyColor:new St,groundColor:new St};break;case"RectAreaLight":e={color:new St,position:new T,halfWidth:new T,halfHeight:new T};break}return s[t.id]=e,e}}}function YM(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Q,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}var ZM=0;function $M(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function JM(s){let t=new XM,e=YM(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new T);let n=new T,r=new be,o=new be;function a(c){let h=0,u=0,d=0;for(let N=0;N<9;N++)i.probe[N].set(0,0,0);let f=0,g=0,v=0,p=0,m=0,x=0,M=0,y=0,S=0,b=0,A=0,_=0,R=0,P=0;c.sort($M);for(let N=0,B=c.length;N<B;N++){let L=c[N],O=L.color,q=L.intensity,Y=L.distance,rt=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===Vs?rt=L.shadow.map.texture:rt=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)h+=O.r*q,u+=O.g*q,d+=O.b*q;else if(L.isLightProbe){for(let Z=0;Z<9;Z++)i.probe[Z].addScaledVector(L.sh.coefficients[Z],q);P++}else if(L.isSunLight){let Z=t.get(L);if(Z.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let tt=L.shadow,nt=e.get(L);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize.copy(tt.mapSize).multiply(tt.getFrameExtents()),i.sunShadow[g]=nt,i.sunShadowMap[g]=rt;let Lt=tt.getViewportCount();for(let Pt=0;Pt<Lt;Pt++)i.sunShadowMatrix[v+Pt]=tt.getMatrix(Pt),i.sunShadowCascade[v+Pt]=tt._cascadeData[Pt];v+=Lt,g++}i.sun[f]=Z,f++}else if(L.isDirectionalLight){let Z=t.get(L);if(Z.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let tt=L.shadow,nt=e.get(L);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize=tt.mapSize,i.directionalShadow[p]=nt,i.directionalShadowMap[p]=rt,i.directionalShadowMatrix[p]=L.shadow.matrix,S++}i.directional[p]=Z,p++}else if(L.isSpotLight){let Z=t.get(L);Z.position.setFromMatrixPosition(L.matrixWorld),Z.color.copy(O).multiplyScalar(q),Z.distance=Y,Z.coneCos=Math.cos(L.angle),Z.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),Z.decay=L.decay,i.spot[x]=Z;let tt=L.shadow;if(L.map&&(i.spotLightMap[_]=L.map,_++,tt.updateMatrices(L),L.castShadow&&R++),i.spotLightMatrix[x]=tt.matrix,L.castShadow){let nt=e.get(L);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize=tt.mapSize,i.spotShadow[x]=nt,i.spotShadowMap[x]=rt,A++}x++}else if(L.isRectAreaLight){let Z=t.get(L);Z.color.copy(O).multiplyScalar(q),Z.halfWidth.set(L.width*.5,0,0),Z.halfHeight.set(0,L.height*.5,0),i.rectArea[M]=Z,M++}else if(L.isPointLight){let Z=t.get(L);if(Z.color.copy(L.color).multiplyScalar(L.intensity),Z.distance=L.distance,Z.decay=L.decay,L.castShadow){let tt=L.shadow,nt=e.get(L);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize=tt.mapSize,nt.shadowCameraNear=tt.camera.near,nt.shadowCameraFar=tt.camera.far,i.pointShadow[m]=nt,i.pointShadowMap[m]=rt,i.pointShadowMatrix[m]=L.shadow.matrix,b++}i.point[m]=Z,m++}else if(L.isHemisphereLight){let Z=t.get(L);Z.skyColor.copy(L.color).multiplyScalar(q),Z.groundColor.copy(L.groundColor).multiplyScalar(q),i.hemi[y]=Z,y++}}M>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=wt.LTC_FLOAT_1,i.rectAreaLTC2=wt.LTC_FLOAT_2):(i.rectAreaLTC1=wt.LTC_HALF_1,i.rectAreaLTC2=wt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;let I=i.hash;(I.sunLength!==f||I.directionalLength!==p||I.pointLength!==m||I.spotLength!==x||I.rectAreaLength!==M||I.hemiLength!==y||I.numSunShadows!==g||I.numDirectionalShadows!==S||I.numPointShadows!==b||I.numSpotShadows!==A||I.numSpotMaps!==_||I.numLightProbes!==P)&&(i.sun.length=f,i.directional.length=p,i.spot.length=x,i.rectArea.length=M,i.point.length=m,i.hemi.length=y,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=v,i.sunShadowCascade.length=v,i.directionalShadow.length=S,i.directionalShadowMap.length=S,i.directionalShadowMatrix.length=S,i.pointShadow.length=b,i.pointShadowMap.length=b,i.pointShadowMatrix.length=b,i.spotShadow.length=A,i.spotShadowMap.length=A,i.spotLightMatrix.length=A+_-R,i.spotLightMap.length=_,i.numSpotLightShadowsWithMaps=R,i.numLightProbes=P,I.sunLength=f,I.directionalLength=p,I.pointLength=m,I.spotLength=x,I.rectAreaLength=M,I.hemiLength=y,I.numSunShadows=g,I.numDirectionalShadows=S,I.numPointShadows=b,I.numSpotShadows=A,I.numSpotMaps=_,I.numLightProbes=P,i.version=ZM++)}function l(c,h){let u=0,d=0,f=0,g=0,v=0,p=0,m=h.matrixWorldInverse;for(let x=0,M=c.length;x<M;x++){let y=c[x];if(y.isSunLight){let S=i.sun[u];S.direction.setFromMatrixPosition(y.matrixWorld),S.direction.transformDirection(m),u++}else if(y.isDirectionalLight){let S=i.directional[d];S.direction.setFromMatrixPosition(y.matrixWorld),n.setFromMatrixPosition(y.target.matrixWorld),S.direction.sub(n),S.direction.transformDirection(m),d++}else if(y.isSpotLight){let S=i.spot[g];S.position.setFromMatrixPosition(y.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(y.matrixWorld),n.setFromMatrixPosition(y.target.matrixWorld),S.direction.sub(n),S.direction.transformDirection(m),g++}else if(y.isRectAreaLight){let S=i.rectArea[v];S.position.setFromMatrixPosition(y.matrixWorld),S.position.applyMatrix4(m),o.identity(),r.copy(y.matrixWorld),r.premultiply(m),o.extractRotation(r),S.halfWidth.set(y.width*.5,0,0),S.halfHeight.set(0,y.height*.5,0),S.halfWidth.applyMatrix4(o),S.halfHeight.applyMatrix4(o),v++}else if(y.isPointLight){let S=i.point[f];S.position.setFromMatrixPosition(y.matrixWorld),S.position.applyMatrix4(m),f++}else if(y.isHemisphereLight){let S=i.hemi[p];S.direction.setFromMatrixPosition(y.matrixWorld),S.direction.transformDirection(m),p++}}}return{setup:a,setupView:l,state:i}}function wm(s){let t=new JM(s),e=[],i=[],n=[];function r(d){u.camera=d,e.length=0,i.length=0,n.length=0}function o(d){e.push(d)}function a(d){i.push(d)}function l(d){n.push(d)}function c(){t.setup(e)}function h(d){t.setupView(e,d)}let u={lightsArray:e,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function KM(s){let t=new WeakMap;function e(n,r=0){let o=t.get(n),a;return o===void 0?(a=new wm(s),t.set(n,[a])):r>=o.length?(a=new wm(s),o.push(a)):a=o[r],a}function i(){t=new WeakMap}return{get:e,dispose:i}}var jM=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,QM=`uniform sampler2D shadow_pass;
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
}`,tb=[new T(1,0,0),new T(-1,0,0),new T(0,1,0),new T(0,-1,0),new T(0,0,1),new T(0,0,-1)],eb=[new T(0,-1,0),new T(0,-1,0),new T(0,0,1),new T(0,0,-1),new T(0,-1,0),new T(0,-1,0)],Am=new be,ol=new T,Id=new T;function ib(s,t,e){let i=new Qr,n=new Q,r=new Q,o=new Ke,a=new Mc,l=new bc,c={},h=e.maxTextureSize,u={[Os]:_i,[_i]:Os,[oe]:oe},d=new fe({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Q},radius:{value:4}},vertexShader:jM,fragmentShader:QM}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new re;g.setAttribute("position",new ge(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new ot(g,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=cr;let m=this.type;this.render=function(b,A,_){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||b.length===0)return;this.type===xp&&(jt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=cr);let R=s.getRenderTarget(),P=s.getActiveCubeFace(),I=s.getActiveMipmapLevel(),N=s.state;N.setBlending(pn),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let B=m!==this.type;B&&A.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(O=>O.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,O=b.length;L<O;L++){let q=b[L],Y=q.shadow;if(Y===void 0){jt("WebGLShadowMap:",q,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;n.copy(Y.mapSize);let rt=Y.getFrameExtents();n.multiply(rt),r.copy(Y.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(r.x=Math.floor(h/rt.x),n.x=r.x*rt.x,Y.mapSize.x=r.x),n.y>h&&(r.y=Math.floor(h/rt.y),n.y=r.y*rt.y,Y.mapSize.y=r.y));let Z=s.state.buffers.depth.getReversed();if(Y.camera._reversedDepth=Z,Y.map===null||B===!0){if(Y.map!==null&&(Y.map.depthTexture!==null&&(Y.map.depthTexture.dispose(),Y.map.depthTexture=null),Y.map.dispose()),this.type===uo){if(q.isPointLight){jt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Y.map=new je(n.x,n.y,{format:Vs,type:ui,minFilter:gi,magFilter:gi,generateMipmaps:!1}),Y.map.texture.name=q.name+".shadowMap",Y.map.depthTexture=new Ns(n.x,n.y,gn),Y.map.depthTexture.name=q.name+".shadowMapDepth",Y.map.depthTexture.format=qn,Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=mi,Y.map.depthTexture.magFilter=mi}else q.isPointLight?(Y.map=new Ah(n.x),Y.map.depthTexture=new gc(n.x,Dn)):(Y.map=new je(n.x,n.y),Y.map.depthTexture=new Ns(n.x,n.y,Dn)),Y.map.depthTexture.name=q.name+".shadowMap",Y.map.depthTexture.format=qn,this.type===cr?(Y.map.depthTexture.compareFunction=Z?Eh:Sh,Y.map.depthTexture.minFilter=gi,Y.map.depthTexture.magFilter=gi):(Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=mi,Y.map.depthTexture.magFilter=mi);Y.camera.updateProjectionMatrix()}Y.map.isWebGLCubeRenderTarget!==!0&&(Y.map.width!==n.x||Y.map.height!==n.y)&&Y.map.setSize(n.x,n.y);let tt=Y.map.isWebGLCubeRenderTarget?6:Y.getViewportCount();q.isPointLight!==!0&&Y.updateMatrices(q,_);for(let nt=0;nt<tt;nt++){let Lt=Y.getCamera(nt);if(q.isPointLight){let Pt=Y.camera,ce=Y.matrix,ae=q.distance||Pt.far;ae!==Pt.far&&(Pt.far=ae,Pt.updateProjectionMatrix()),ol.setFromMatrixPosition(q.matrixWorld),Pt.position.copy(ol),Id.copy(Pt.position),Id.add(tb[nt]),Pt.up.copy(eb[nt]),Pt.lookAt(Id),Pt.updateMatrixWorld(),ce.makeTranslation(-ol.x,-ol.y,-ol.z),Am.multiplyMatrices(Pt.projectionMatrix,Pt.matrixWorldInverse),Y._frustum.setFromProjectionMatrix(Am,Pt.coordinateSystem,Pt.reversedDepth)}if(Y.map.isWebGLCubeRenderTarget)s.setRenderTarget(Y.map,nt),s.clear();else{nt===0&&(s.setRenderTarget(Y.map),s.clear());let Pt=Y.getViewport(nt);o.set(r.x*Pt.x,r.y*Pt.y,r.x*Pt.z,r.y*Pt.w),N.viewport(o)}i=Y.getFrustum(nt),y(A,_,Lt,q,this.type)}Y.isPointLightShadow!==!0&&this.type===uo&&x(Y,_),Y.needsUpdate=!1}m=this.type,p.needsUpdate=!1,s.setRenderTarget(R,P,I)};function x(b,A){let _=t.update(v);d.defines.VSM_SAMPLES!==b.blurSamples&&(d.defines.VSM_SAMPLES=b.blurSamples,f.defines.VSM_SAMPLES=b.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),b.mapPass===null?b.mapPass=new je(n.x,n.y,{format:Vs,type:ui}):(b.mapPass.width!==b.map.width||b.mapPass.height!==b.map.height)&&b.mapPass.setSize(b.map.width,b.map.height),d.uniforms.shadow_pass.value=b.map.depthTexture,d.uniforms.resolution.value.set(b.map.width,b.map.height),d.uniforms.radius.value=b.radius,s.setRenderTarget(b.mapPass),s.clear(),s.renderBufferDirect(A,null,_,d,v,null),f.uniforms.shadow_pass.value=b.mapPass.texture,f.uniforms.resolution.value.set(b.map.width,b.map.height),f.uniforms.radius.value=b.radius,s.setRenderTarget(b.map),s.clear(),s.renderBufferDirect(A,null,_,f,v,null)}function M(b,A,_,R){let P=null,I=_.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(I!==void 0)P=I;else if(P=_.isPointLight===!0?l:a,s.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let N=P.uuid,B=A.uuid,L=c[N];L===void 0&&(L={},c[N]=L);let O=L[B];O===void 0&&(O=P.clone(),L[B]=O,A.addEventListener("dispose",S)),P=O}if(P.visible=A.visible,P.wireframe=A.wireframe,R===uo?P.side=A.shadowSide!==null?A.shadowSide:A.side:P.side=A.shadowSide!==null?A.shadowSide:u[A.side],P.alphaMap=A.alphaMap,P.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,P.map=A.map,P.clipShadows=A.clipShadows,P.clippingPlanes=A.clippingPlanes,P.clipIntersection=A.clipIntersection,P.displacementMap=A.displacementMap,P.displacementScale=A.displacementScale,P.displacementBias=A.displacementBias,P.wireframeLinewidth=A.wireframeLinewidth,P.linewidth=A.linewidth,_.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let N=s.properties.get(P);N.light=_}return P}function y(b,A,_,R,P){if(b.visible===!1)return;if(b.layers.test(A.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&P===uo)&&(!b.frustumCulled||b.intersectsFrustum(i))){b.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,b.matrixWorld);let B=t.update(b),L=b.material;if(Array.isArray(L)){let O=B.groups;for(let q=0,Y=O.length;q<Y;q++){let rt=O[q],Z=L[rt.materialIndex];if(Z&&Z.visible){let tt=M(b,Z,R,P);b.onBeforeShadow(s,b,A,_,B,tt,rt),s.renderBufferDirect(_,null,B,tt,b,rt),b.onAfterShadow(s,b,A,_,B,tt,rt)}}}else if(L.visible){let O=M(b,L,R,P);b.onBeforeShadow(s,b,A,_,B,O,null),s.renderBufferDirect(_,null,B,O,b,null),b.onAfterShadow(s,b,A,_,B,O,null)}}let N=b.children;for(let B=0,L=N.length;B<L;B++)y(N[B],A,_,R,P)}function S(b){b.target.removeEventListener("dispose",S);for(let _ in c){let R=c[_],P=b.target.uuid;P in R&&(R[P].dispose(),delete R[P])}}}function nb(s,t){function e(){let F=!1,yt=new Ke,et=null,_t=new Ke(0,0,0,0);return{setMask:function(At){et!==At&&!F&&(s.colorMask(At,At,At,At),et=At)},setLocked:function(At){F=At},setClear:function(At,at,Bt,Ut,z){z===!0&&(At*=Ut,at*=Ut,Bt*=Ut),yt.set(At,at,Bt,Ut),_t.equals(yt)===!1&&(s.clearColor(At,at,Bt,Ut),_t.copy(yt))},reset:function(){F=!1,et=null,_t.set(-1,0,0,0)}}}function i(){let F=!1,yt=!1,et=null,_t=null,At=null;return{setReversed:function(at){if(yt!==at){let Bt=t.get("EXT_clip_control");at?Bt.clipControlEXT(Bt.LOWER_LEFT_EXT,Bt.ZERO_TO_ONE_EXT):Bt.clipControlEXT(Bt.LOWER_LEFT_EXT,Bt.NEGATIVE_ONE_TO_ONE_EXT),yt=at;let Ut=At;At=null,this.setClear(Ut)}},getReversed:function(){return yt},setTest:function(at){at?j(s.DEPTH_TEST):vt(s.DEPTH_TEST)},setMask:function(at){et!==at&&!F&&(s.depthMask(at),et=at)},setFunc:function(at){if(yt&&(at=jp[at]),_t!==at){switch(at){case nc:s.depthFunc(s.NEVER);break;case sc:s.depthFunc(s.ALWAYS);break;case rc:s.depthFunc(s.LESS);break;case qr:s.depthFunc(s.LEQUAL);break;case oc:s.depthFunc(s.EQUAL);break;case ac:s.depthFunc(s.GEQUAL);break;case lc:s.depthFunc(s.GREATER);break;case cc:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}_t=at}},setLocked:function(at){F=at},setClear:function(at){At!==at&&(At=at,yt&&(at=1-at),s.clearDepth(at))},reset:function(){F=!1,et=null,_t=null,At=null,yt=!1}}}function n(){let F=!1,yt=null,et=null,_t=null,At=null,at=null,Bt=null,Ut=null,z=null;return{setTest:function(W){F||(W?j(s.STENCIL_TEST):vt(s.STENCIL_TEST))},setMask:function(W){yt!==W&&!F&&(s.stencilMask(W),yt=W)},setFunc:function(W,ut,bt){(et!==W||_t!==ut||At!==bt)&&(s.stencilFunc(W,ut,bt),et=W,_t=ut,At=bt)},setOp:function(W,ut,bt){(at!==W||Bt!==ut||Ut!==bt)&&(s.stencilOp(W,ut,bt),at=W,Bt=ut,Ut=bt)},setLocked:function(W){F=W},setClear:function(W){z!==W&&(s.clearStencil(W),z=W)},reset:function(){F=!1,yt=null,et=null,_t=null,At=null,at=null,Bt=null,Ut=null,z=null}}}let r=new e,o=new i,a=new n,l=new WeakMap,c=new WeakMap,h={},u={},d={},f=new WeakMap,g=[],v=null,p=!1,m=null,x=null,M=null,y=null,S=null,b=null,A=null,_=new St(0,0,0),R=0,P=!1,I=null,N=null,B=null,L=null,O=null,q=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,rt=0,Z=s.getParameter(s.VERSION);Z.indexOf("WebGL")!==-1?(rt=parseFloat(/^WebGL (\d)/.exec(Z)[1]),Y=rt>=1):Z.indexOf("OpenGL ES")!==-1&&(rt=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),Y=rt>=2);let tt=null,nt={},Lt=s.getParameter(s.SCISSOR_BOX),Pt=s.getParameter(s.VIEWPORT),ce=new Ke().fromArray(Lt),ae=new Ke().fromArray(Pt);function le(F,yt,et,_t){let At=new Uint8Array(4),at=s.createTexture();s.bindTexture(F,at),s.texParameteri(F,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(F,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Bt=0;Bt<et;Bt++)F===s.TEXTURE_3D||F===s.TEXTURE_2D_ARRAY?s.texImage3D(yt,0,s.RGBA,1,1,_t,0,s.RGBA,s.UNSIGNED_BYTE,At):s.texImage2D(yt+Bt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,At);return at}let X={};X[s.TEXTURE_2D]=le(s.TEXTURE_2D,s.TEXTURE_2D,1),X[s.TEXTURE_CUBE_MAP]=le(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),X[s.TEXTURE_2D_ARRAY]=le(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),X[s.TEXTURE_3D]=le(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),j(s.DEPTH_TEST),o.setFunc(qr),ft(!1),mt(td),j(s.CULL_FACE),ct(pn);function j(F){h[F]!==!0&&(s.enable(F),h[F]=!0)}function vt(F){h[F]!==!1&&(s.disable(F),h[F]=!1)}function Wt(F,yt){return d[F]!==yt?(s.bindFramebuffer(F,yt),d[F]=yt,F===s.DRAW_FRAMEBUFFER&&(d[s.FRAMEBUFFER]=yt),F===s.FRAMEBUFFER&&(d[s.DRAW_FRAMEBUFFER]=yt),!0):!1}function Et(F,yt){let et=g,_t=!1;if(F){et=f.get(yt),et===void 0&&(et=[],f.set(yt,et));let At=F.textures;if(et.length!==At.length||et[0]!==s.COLOR_ATTACHMENT0){for(let at=0,Bt=At.length;at<Bt;at++)et[at]=s.COLOR_ATTACHMENT0+at;et.length=At.length,_t=!0}}else et[0]!==s.BACK&&(et[0]=s.BACK,_t=!0);_t&&s.drawBuffers(et)}function Zt(F){return v!==F?(s.useProgram(F),v=F,!0):!1}let ye={[hr]:s.FUNC_ADD,[_p]:s.FUNC_SUBTRACT,[Mp]:s.FUNC_REVERSE_SUBTRACT};ye[bp]=s.MIN,ye[Sp]=s.MAX;let st={[Ep]:s.ZERO,[Tp]:s.ONE,[wp]:s.SRC_COLOR,[nd]:s.SRC_ALPHA,[Lp]:s.SRC_ALPHA_SATURATE,[Pp]:s.DST_COLOR,[Rp]:s.DST_ALPHA,[Ap]:s.ONE_MINUS_SRC_COLOR,[sd]:s.ONE_MINUS_SRC_ALPHA,[Ip]:s.ONE_MINUS_DST_COLOR,[Cp]:s.ONE_MINUS_DST_ALPHA,[Dp]:s.CONSTANT_COLOR,[Np]:s.ONE_MINUS_CONSTANT_COLOR,[Up]:s.CONSTANT_ALPHA,[Fp]:s.ONE_MINUS_CONSTANT_ALPHA};function ct(F,yt,et,_t,At,at,Bt,Ut,z,W){if(F===pn){p===!0&&(vt(s.BLEND),p=!1);return}if(p===!1&&(j(s.BLEND),p=!0),F!==yp){if(F!==m||W!==P){if((x!==hr||S!==hr)&&(s.blendEquation(s.FUNC_ADD),x=hr,S=hr),W)switch(F){case mn:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Te:s.blendFunc(s.ONE,s.ONE);break;case ed:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case id:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:te("WebGLState: Invalid blending: ",F);break}else switch(F){case mn:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Te:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case ed:te("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case id:te("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:te("WebGLState: Invalid blending: ",F);break}M=null,y=null,b=null,A=null,_.set(0,0,0),R=0,m=F,P=W}return}At=At||yt,at=at||et,Bt=Bt||_t,(yt!==x||At!==S)&&(s.blendEquationSeparate(ye[yt],ye[At]),x=yt,S=At),(et!==M||_t!==y||at!==b||Bt!==A)&&(s.blendFuncSeparate(st[et],st[_t],st[at],st[Bt]),M=et,y=_t,b=at,A=Bt),(Ut.equals(_)===!1||z!==R)&&(s.blendColor(Ut.r,Ut.g,Ut.b,z),_.copy(Ut),R=z),m=F,P=!1}function dt(F,yt){F.side===oe?vt(s.CULL_FACE):j(s.CULL_FACE);let et=F.side===_i;yt&&(et=!et),ft(et),F.blending===mn&&F.transparent===!1?ct(pn):ct(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),o.setFunc(F.depthFunc),o.setTest(F.depthTest),o.setMask(F.depthWrite),r.setMask(F.colorWrite);let _t=F.stencilWrite;a.setTest(_t),_t&&(a.setMask(F.stencilWriteMask),a.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),a.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),Xt(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?j(s.SAMPLE_ALPHA_TO_COVERAGE):vt(s.SAMPLE_ALPHA_TO_COVERAGE)}function ft(F){I!==F&&(F?s.frontFace(s.CW):s.frontFace(s.CCW),I=F)}function mt(F){F!==gp?(j(s.CULL_FACE),F!==N&&(F===td?s.cullFace(s.BACK):F===vp?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):vt(s.CULL_FACE),N=F}function Jt(F){F!==B&&(Y&&s.lineWidth(F),B=F)}function Xt(F,yt,et){F?(j(s.POLYGON_OFFSET_FILL),(L!==yt||O!==et)&&(L=yt,O=et,o.getReversed()&&(yt=-yt),s.polygonOffset(yt,et))):vt(s.POLYGON_OFFSET_FILL)}function Qt(F){F?j(s.SCISSOR_TEST):vt(s.SCISSOR_TEST)}function ee(F){F===void 0&&(F=s.TEXTURE0+q-1),tt!==F&&(s.activeTexture(F),tt=F)}function D(F,yt,et){et===void 0&&(tt===null?et=s.TEXTURE0+q-1:et=tt);let _t=nt[et];_t===void 0&&(_t={type:void 0,texture:void 0},nt[et]=_t),(_t.type!==F||_t.texture!==yt)&&(tt!==et&&(s.activeTexture(et),tt=et),s.bindTexture(F,yt||X[F]),_t.type=F,_t.texture=yt)}function we(){let F=nt[tt];F!==void 0&&F.type!==void 0&&(s.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function me(){try{s.compressedTexImage2D(...arguments)}catch(F){te("WebGLState:",F)}}function C(){try{s.compressedTexImage3D(...arguments)}catch(F){te("WebGLState:",F)}}function E(){try{s.texSubImage2D(...arguments)}catch(F){te("WebGLState:",F)}}function H(){try{s.texSubImage3D(...arguments)}catch(F){te("WebGLState:",F)}}function G(){try{s.compressedTexSubImage2D(...arguments)}catch(F){te("WebGLState:",F)}}function J(){try{s.compressedTexSubImage3D(...arguments)}catch(F){te("WebGLState:",F)}}function pt(){try{s.texStorage2D(...arguments)}catch(F){te("WebGLState:",F)}}function gt(){try{s.texStorage3D(...arguments)}catch(F){te("WebGLState:",F)}}function K(){try{s.texImage2D(...arguments)}catch(F){te("WebGLState:",F)}}function it(){try{s.texImage3D(...arguments)}catch(F){te("WebGLState:",F)}}function xt(F){return u[F]!==void 0?u[F]:s.getParameter(F)}function kt(F,yt){u[F]!==yt&&(s.pixelStorei(F,yt),u[F]=yt)}function Tt(F){ce.equals(F)===!1&&(s.scissor(F.x,F.y,F.z,F.w),ce.copy(F))}function Mt(F){ae.equals(F)===!1&&(s.viewport(F.x,F.y,F.z,F.w),ae.copy(F))}function Vt(F,yt){let et=c.get(yt);et===void 0&&(et=new WeakMap,c.set(yt,et));let _t=et.get(F);_t===void 0&&(_t=s.getUniformBlockIndex(yt,F.name),et.set(F,_t))}function Kt(F,yt){let _t=c.get(yt).get(F);l.get(yt)!==_t&&(s.uniformBlockBinding(yt,_t,F.__bindingPointIndex),l.set(yt,_t))}function ne(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),h={},u={},tt=null,nt={},d={},f=new WeakMap,g=[],v=null,p=!1,m=null,x=null,M=null,y=null,S=null,b=null,A=null,_=new St(0,0,0),R=0,P=!1,I=null,N=null,B=null,L=null,O=null,ce.set(0,0,s.canvas.width,s.canvas.height),ae.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:j,disable:vt,bindFramebuffer:Wt,drawBuffers:Et,useProgram:Zt,setBlending:ct,setMaterial:dt,setFlipSided:ft,setCullFace:mt,setLineWidth:Jt,setPolygonOffset:Xt,setScissorTest:Qt,activeTexture:ee,bindTexture:D,unbindTexture:we,compressedTexImage2D:me,compressedTexImage3D:C,texImage2D:K,texImage3D:it,pixelStorei:kt,getParameter:xt,updateUBOMapping:Vt,uniformBlockBinding:Kt,texStorage2D:pt,texStorage3D:gt,texSubImage2D:E,texSubImage3D:H,compressedTexSubImage2D:G,compressedTexSubImage3D:J,scissor:Tt,viewport:Mt,reset:ne}}function sb(s,t,e,i,n,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Q,h=new WeakMap,u=new Set,d,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(C,E){return g?new OffscreenCanvas(C,E):da("canvas")}function p(C,E,H){let G=1,J=me(C);if((J.width>H||J.height>H)&&(G=H/Math.max(J.width,J.height)),G<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let pt=Math.floor(G*J.width),gt=Math.floor(G*J.height);d===void 0&&(d=v(pt,gt));let K=E?v(pt,gt):d;return K.width=pt,K.height=gt,K.getContext("2d").drawImage(C,0,0,pt,gt),jt("WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+pt+"x"+gt+")."),K}else return"data"in C&&jt("WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),C;return C}function m(C){return C.generateMipmaps}function x(C){s.generateMipmap(C)}function M(C){return C.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?s.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function y(C,E,H,G,J,pt=!1){if(C!==null){if(s[C]!==void 0)return s[C];jt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let gt;G&&(gt=t.get("EXT_texture_norm16"),gt||jt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=E;if(E===s.RED&&(H===s.FLOAT&&(K=s.R32F),H===s.HALF_FLOAT&&(K=s.R16F),H===s.UNSIGNED_BYTE&&(K=s.R8),H===s.UNSIGNED_SHORT&&gt&&(K=gt.R16_EXT),H===s.SHORT&&gt&&(K=gt.R16_SNORM_EXT)),E===s.RED_INTEGER&&(H===s.UNSIGNED_BYTE&&(K=s.R8UI),H===s.UNSIGNED_SHORT&&(K=s.R16UI),H===s.UNSIGNED_INT&&(K=s.R32UI),H===s.BYTE&&(K=s.R8I),H===s.SHORT&&(K=s.R16I),H===s.INT&&(K=s.R32I)),E===s.RG&&(H===s.FLOAT&&(K=s.RG32F),H===s.HALF_FLOAT&&(K=s.RG16F),H===s.UNSIGNED_BYTE&&(K=s.RG8),H===s.UNSIGNED_SHORT&&gt&&(K=gt.RG16_EXT),H===s.SHORT&&gt&&(K=gt.RG16_SNORM_EXT)),E===s.RG_INTEGER&&(H===s.UNSIGNED_BYTE&&(K=s.RG8UI),H===s.UNSIGNED_SHORT&&(K=s.RG16UI),H===s.UNSIGNED_INT&&(K=s.RG32UI),H===s.BYTE&&(K=s.RG8I),H===s.SHORT&&(K=s.RG16I),H===s.INT&&(K=s.RG32I)),E===s.RGB_INTEGER&&(H===s.UNSIGNED_BYTE&&(K=s.RGB8UI),H===s.UNSIGNED_SHORT&&(K=s.RGB16UI),H===s.UNSIGNED_INT&&(K=s.RGB32UI),H===s.BYTE&&(K=s.RGB8I),H===s.SHORT&&(K=s.RGB16I),H===s.INT&&(K=s.RGB32I)),E===s.RGBA_INTEGER&&(H===s.UNSIGNED_BYTE&&(K=s.RGBA8UI),H===s.UNSIGNED_SHORT&&(K=s.RGBA16UI),H===s.UNSIGNED_INT&&(K=s.RGBA32UI),H===s.BYTE&&(K=s.RGBA8I),H===s.SHORT&&(K=s.RGBA16I),H===s.INT&&(K=s.RGBA32I)),E===s.RGB&&(H===s.UNSIGNED_SHORT&&gt&&(K=gt.RGB16_EXT),H===s.SHORT&&gt&&(K=gt.RGB16_SNORM_EXT),H===s.UNSIGNED_INT_5_9_9_9_REV&&(K=s.RGB9_E5),H===s.UNSIGNED_INT_10F_11F_11F_REV&&(K=s.R11F_G11F_B10F)),E===s.RGBA){let it=pt?ua:_e.getTransfer(J);H===s.FLOAT&&(K=s.RGBA32F),H===s.HALF_FLOAT&&(K=s.RGBA16F),H===s.UNSIGNED_BYTE&&(K=it===Ce?s.SRGB8_ALPHA8:s.RGBA8),H===s.UNSIGNED_SHORT&&gt&&(K=gt.RGBA16_EXT),H===s.SHORT&&gt&&(K=gt.RGBA16_SNORM_EXT),H===s.UNSIGNED_SHORT_4_4_4_4&&(K=s.RGBA4),H===s.UNSIGNED_SHORT_5_5_5_1&&(K=s.RGB5_A1)}return(K===s.R16F||K===s.R32F||K===s.RG16F||K===s.RG32F||K===s.RGBA16F||K===s.RGBA32F)&&t.get("EXT_color_buffer_float"),K}function S(C,E){let H;return C?E===null||E===Dn||E===po?H=s.DEPTH24_STENCIL8:E===gn?H=s.DEPTH32F_STENCIL8:E===fo&&(H=s.DEPTH24_STENCIL8,jt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===Dn||E===po?H=s.DEPTH_COMPONENT24:E===gn?H=s.DEPTH_COMPONENT32F:E===fo&&(H=s.DEPTH_COMPONENT16),H}function b(C,E){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==mi&&C.minFilter!==gi?Math.log2(Math.max(E.width,E.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?E.mipmaps.length:1}function A(C){let E=C.target;E.removeEventListener("dispose",A),R(E),E.isVideoTexture&&h.delete(E),E.isHTMLTexture&&u.delete(E)}function _(C){let E=C.target;E.removeEventListener("dispose",_),I(E)}function R(C){let E=i.get(C);if(E.__webglInit===void 0)return;let H=C.source,G=f.get(H);if(G){let J=G[E.__cacheKey];J.usedTimes--,J.usedTimes===0&&P(C),Object.keys(G).length===0&&f.delete(H)}i.remove(C)}function P(C){let E=i.get(C);s.deleteTexture(E.__webglTexture);let H=C.source,G=f.get(H);delete G[E.__cacheKey],o.memory.textures--}function I(C){let E=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(E.__webglFramebuffer[G]))for(let J=0;J<E.__webglFramebuffer[G].length;J++)s.deleteFramebuffer(E.__webglFramebuffer[G][J]);else s.deleteFramebuffer(E.__webglFramebuffer[G]);E.__webglDepthbuffer&&s.deleteRenderbuffer(E.__webglDepthbuffer[G])}else{if(Array.isArray(E.__webglFramebuffer))for(let G=0;G<E.__webglFramebuffer.length;G++)s.deleteFramebuffer(E.__webglFramebuffer[G]);else s.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&s.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&s.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let G=0;G<E.__webglColorRenderbuffer.length;G++)E.__webglColorRenderbuffer[G]&&s.deleteRenderbuffer(E.__webglColorRenderbuffer[G]);E.__webglDepthRenderbuffer&&s.deleteRenderbuffer(E.__webglDepthRenderbuffer)}let H=C.textures;for(let G=0,J=H.length;G<J;G++){let pt=i.get(H[G]);pt.__webglTexture&&(s.deleteTexture(pt.__webglTexture),o.memory.textures--),i.remove(H[G])}i.remove(C)}let N=0;function B(){N=0}function L(){return N}function O(C){N=C}function q(){let C=N;return C>=n.maxTextures&&jt("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+n.maxTextures),N+=1,C}function Y(C){let E=[];return E.push(C.wrapS),E.push(C.wrapT),E.push(C.wrapR||0),E.push(C.magFilter),E.push(C.minFilter),E.push(C.anisotropy),E.push(C.internalFormat),E.push(C.format),E.push(C.type),E.push(C.generateMipmaps),E.push(C.premultiplyAlpha),E.push(C.flipY),E.push(C.unpackAlignment),E.push(C.colorSpace),E.join()}function rt(C,E){let H=i.get(C);if(C.isVideoTexture&&D(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&H.__version!==C.version){let G=C.image;if(G===null)jt("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)jt("WebGLRenderer: Texture marked for update but image is incomplete");else{vt(H,C,E);return}}else C.isExternalTexture&&(H.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(s.TEXTURE_2D,H.__webglTexture,s.TEXTURE0+E)}function Z(C,E){let H=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&H.__version!==C.version){vt(H,C,E);return}else C.isExternalTexture&&(H.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(s.TEXTURE_2D_ARRAY,H.__webglTexture,s.TEXTURE0+E)}function tt(C,E){let H=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&H.__version!==C.version){vt(H,C,E);return}e.bindTexture(s.TEXTURE_3D,H.__webglTexture,s.TEXTURE0+E)}function nt(C,E){let H=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&H.__version!==C.version){Wt(H,C,E);return}e.bindTexture(s.TEXTURE_CUBE_MAP,H.__webglTexture,s.TEXTURE0+E)}let Lt={[Ji]:s.REPEAT,[Vn]:s.CLAMP_TO_EDGE,[hc]:s.MIRRORED_REPEAT},Pt={[mi]:s.NEAREST,[Hp]:s.NEAREST_MIPMAP_NEAREST,[ja]:s.NEAREST_MIPMAP_LINEAR,[gi]:s.LINEAR,[Oc]:s.LINEAR_MIPMAP_NEAREST,[zs]:s.LINEAR_MIPMAP_LINEAR},ce={[Gp]:s.NEVER,[Zp]:s.ALWAYS,[Wp]:s.LESS,[Sh]:s.LEQUAL,[qp]:s.EQUAL,[Eh]:s.GEQUAL,[Xp]:s.GREATER,[Yp]:s.NOTEQUAL};function ae(C,E){if(E.type===gn&&t.has("OES_texture_float_linear")===!1&&(E.magFilter===gi||E.magFilter===Oc||E.magFilter===ja||E.magFilter===zs||E.minFilter===gi||E.minFilter===Oc||E.minFilter===ja||E.minFilter===zs)&&jt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(C,s.TEXTURE_WRAP_S,Lt[E.wrapS]),s.texParameteri(C,s.TEXTURE_WRAP_T,Lt[E.wrapT]),(C===s.TEXTURE_3D||C===s.TEXTURE_2D_ARRAY)&&s.texParameteri(C,s.TEXTURE_WRAP_R,Lt[E.wrapR]),s.texParameteri(C,s.TEXTURE_MAG_FILTER,Pt[E.magFilter]),s.texParameteri(C,s.TEXTURE_MIN_FILTER,Pt[E.minFilter]),E.compareFunction&&(s.texParameteri(C,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(C,s.TEXTURE_COMPARE_FUNC,ce[E.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===mi||E.minFilter!==ja&&E.minFilter!==zs||E.type===gn&&t.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||i.get(E).__currentAnisotropy){let H=t.get("EXT_texture_filter_anisotropic");s.texParameterf(C,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,n.getMaxAnisotropy())),i.get(E).__currentAnisotropy=E.anisotropy}}}function le(C,E){let H=!1;C.__webglInit===void 0&&(C.__webglInit=!0,E.addEventListener("dispose",A));let G=E.source,J=f.get(G);J===void 0&&(J={},f.set(G,J));let pt=Y(E);if(pt!==C.__cacheKey){J[pt]===void 0&&(J[pt]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,H=!0),J[pt].usedTimes++;let gt=J[C.__cacheKey];gt!==void 0&&(J[C.__cacheKey].usedTimes--,gt.usedTimes===0&&P(E)),C.__cacheKey=pt,C.__webglTexture=J[pt].texture}return H}function X(C,E,H){return Math.floor(Math.floor(C/H)/E)}function j(C,E,H,G){let pt=C.updateRanges;if(pt.length===0)e.texSubImage2D(s.TEXTURE_2D,0,0,0,E.width,E.height,H,G,E.data);else{pt.sort((kt,Tt)=>kt.start-Tt.start);let gt=0;for(let kt=1;kt<pt.length;kt++){let Tt=pt[gt],Mt=pt[kt],Vt=Tt.start+Tt.count,Kt=X(Mt.start,E.width,4),ne=X(Tt.start,E.width,4);Mt.start<=Vt+1&&Kt===ne&&X(Mt.start+Mt.count-1,E.width,4)===Kt?Tt.count=Math.max(Tt.count,Mt.start+Mt.count-Tt.start):(++gt,pt[gt]=Mt)}pt.length=gt+1;let K=e.getParameter(s.UNPACK_ROW_LENGTH),it=e.getParameter(s.UNPACK_SKIP_PIXELS),xt=e.getParameter(s.UNPACK_SKIP_ROWS);e.pixelStorei(s.UNPACK_ROW_LENGTH,E.width);for(let kt=0,Tt=pt.length;kt<Tt;kt++){let Mt=pt[kt],Vt=Math.floor(Mt.start/4),Kt=Math.ceil(Mt.count/4),ne=Vt%E.width,F=Math.floor(Vt/E.width),yt=Kt,et=1;e.pixelStorei(s.UNPACK_SKIP_PIXELS,ne),e.pixelStorei(s.UNPACK_SKIP_ROWS,F),e.texSubImage2D(s.TEXTURE_2D,0,ne,F,yt,et,H,G,E.data)}C.clearUpdateRanges(),e.pixelStorei(s.UNPACK_ROW_LENGTH,K),e.pixelStorei(s.UNPACK_SKIP_PIXELS,it),e.pixelStorei(s.UNPACK_SKIP_ROWS,xt)}}function vt(C,E,H){let G=s.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(G=s.TEXTURE_2D_ARRAY),E.isData3DTexture&&(G=s.TEXTURE_3D);let J=le(C,E),pt=E.source;e.bindTexture(G,C.__webglTexture,s.TEXTURE0+H);let gt=i.get(pt);if(pt.version!==gt.__version||J===!0){if(e.activeTexture(s.TEXTURE0+H),(typeof ImageBitmap<"u"&&E.image instanceof ImageBitmap)===!1){let et=_e.getPrimaries(_e.workingColorSpace),_t=E.colorSpace===_s?null:_e.getPrimaries(E.colorSpace),At=E.colorSpace===_s||et===_t?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,E.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,At)}e.pixelStorei(s.UNPACK_ALIGNMENT,E.unpackAlignment);let it=p(E.image,!1,n.maxTextureSize);it=we(E,it);let xt=r.convert(E.format,E.colorSpace),kt=r.convert(E.type),Tt=y(E.internalFormat,xt,kt,E.normalized,E.colorSpace,E.isVideoTexture);ae(G,E);let Mt,Vt=E.mipmaps,Kt=E.isVideoTexture!==!0,ne=gt.__version===void 0||J===!0,F=pt.dataReady,yt=b(E,it);if(E.isDepthTexture)Tt=S(E.format===ks,E.type),ne&&(Kt?e.texStorage2D(s.TEXTURE_2D,1,Tt,it.width,it.height):e.texImage2D(s.TEXTURE_2D,0,Tt,it.width,it.height,0,xt,kt,null));else if(E.isDataTexture)if(Vt.length>0){Kt&&ne&&e.texStorage2D(s.TEXTURE_2D,yt,Tt,Vt[0].width,Vt[0].height);for(let et=0,_t=Vt.length;et<_t;et++)Mt=Vt[et],Kt?F&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,Mt.width,Mt.height,xt,kt,Mt.data):e.texImage2D(s.TEXTURE_2D,et,Tt,Mt.width,Mt.height,0,xt,kt,Mt.data);E.generateMipmaps=!1}else Kt?(ne&&e.texStorage2D(s.TEXTURE_2D,yt,Tt,it.width,it.height),F&&j(E,it,xt,kt)):e.texImage2D(s.TEXTURE_2D,0,Tt,it.width,it.height,0,xt,kt,it.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){Kt&&ne&&e.texStorage3D(s.TEXTURE_2D_ARRAY,yt,Tt,Vt[0].width,Vt[0].height,it.depth);for(let et=0,_t=Vt.length;et<_t;et++)if(Mt=Vt[et],E.format!==vn)if(xt!==null)if(Kt){if(F)if(E.layerUpdates.size>0){let At=_d(Mt.width,Mt.height,E.format,E.type);for(let at of E.layerUpdates){let Bt=Mt.data.subarray(at*At/Mt.data.BYTES_PER_ELEMENT,(at+1)*At/Mt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,at,Mt.width,Mt.height,1,xt,Bt)}}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,0,Mt.width,Mt.height,it.depth,xt,Mt.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,et,Tt,Mt.width,Mt.height,it.depth,0,Mt.data,0,0);else jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Kt?F&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,0,Mt.width,Mt.height,it.depth,xt,kt,Mt.data):e.texImage3D(s.TEXTURE_2D_ARRAY,et,Tt,Mt.width,Mt.height,it.depth,0,xt,kt,Mt.data);E.layerUpdates.size>0&&E.clearLayerUpdates()}else{Kt&&ne&&e.texStorage2D(s.TEXTURE_2D,yt,Tt,Vt[0].width,Vt[0].height);for(let et=0,_t=Vt.length;et<_t;et++)Mt=Vt[et],E.format!==vn?xt!==null?Kt?F&&e.compressedTexSubImage2D(s.TEXTURE_2D,et,0,0,Mt.width,Mt.height,xt,Mt.data):e.compressedTexImage2D(s.TEXTURE_2D,et,Tt,Mt.width,Mt.height,0,Mt.data):jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Kt?F&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,Mt.width,Mt.height,xt,kt,Mt.data):e.texImage2D(s.TEXTURE_2D,et,Tt,Mt.width,Mt.height,0,xt,kt,Mt.data)}else if(E.isDataArrayTexture)if(Kt){if(ne&&e.texStorage3D(s.TEXTURE_2D_ARRAY,yt,Tt,it.width,it.height,it.depth),F)if(E.layerUpdates.size>0){let et=_d(it.width,it.height,E.format,E.type);for(let _t of E.layerUpdates){let At=it.data.subarray(_t*et/it.data.BYTES_PER_ELEMENT,(_t+1)*et/it.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,_t,it.width,it.height,1,xt,kt,At)}E.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,it.width,it.height,it.depth,xt,kt,it.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,Tt,it.width,it.height,it.depth,0,xt,kt,it.data);else if(E.isData3DTexture)Kt?(ne&&e.texStorage3D(s.TEXTURE_3D,yt,Tt,it.width,it.height,it.depth),F&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,it.width,it.height,it.depth,xt,kt,it.data)):e.texImage3D(s.TEXTURE_3D,0,Tt,it.width,it.height,it.depth,0,xt,kt,it.data);else if(E.isFramebufferTexture){if(ne)if(Kt)e.texStorage2D(s.TEXTURE_2D,yt,Tt,it.width,it.height);else{let et=it.width,_t=it.height;for(let At=0;At<yt;At++)e.texImage2D(s.TEXTURE_2D,At,Tt,et,_t,0,xt,kt,null),et>>=1,_t>>=1}}else if(E.isHTMLTexture){if("texElementImage2D"in s){let et=s.canvas;if(et.hasAttribute("layoutsubtree")||et.setAttribute("layoutsubtree","true"),it.parentNode!==et){et.appendChild(it),u.add(E),et.onpaint=_t=>{let At=_t.changedElements;for(let at of u)At.includes(at.image)&&(at.needsUpdate=!0)},et.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,it);else{let At=s.RGBA,at=s.RGBA,Bt=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,At,at,Bt,it)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(Vt.length>0){if(Kt&&ne){let et=me(Vt[0]);e.texStorage2D(s.TEXTURE_2D,yt,Tt,et.width,et.height)}for(let et=0,_t=Vt.length;et<_t;et++)Mt=Vt[et],Kt?F&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,xt,kt,Mt):e.texImage2D(s.TEXTURE_2D,et,Tt,xt,kt,Mt);E.generateMipmaps=!1}else if(Kt){if(ne){let et=me(it);e.texStorage2D(s.TEXTURE_2D,yt,Tt,et.width,et.height)}F&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,xt,kt,it)}else e.texImage2D(s.TEXTURE_2D,0,Tt,xt,kt,it);m(E)&&x(G),gt.__version=pt.version,E.onUpdate&&E.onUpdate(E)}C.__version=E.version}function Wt(C,E,H){if(E.image.length!==6)return;let G=le(C,E),J=E.source;e.bindTexture(s.TEXTURE_CUBE_MAP,C.__webglTexture,s.TEXTURE0+H);let pt=i.get(J);if(J.version!==pt.__version||G===!0){e.activeTexture(s.TEXTURE0+H);let gt=_e.getPrimaries(_e.workingColorSpace),K=E.colorSpace===_s?null:_e.getPrimaries(E.colorSpace),it=E.colorSpace===_s||gt===K?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,E.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),e.pixelStorei(s.UNPACK_ALIGNMENT,E.unpackAlignment),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,it);let xt=E.isCompressedTexture||E.image[0].isCompressedTexture,kt=E.image[0]&&E.image[0].isDataTexture,Tt=[];for(let at=0;at<6;at++)!xt&&!kt?Tt[at]=p(E.image[at],!0,n.maxCubemapSize):Tt[at]=kt?E.image[at].image:E.image[at],Tt[at]=we(E,Tt[at]);let Mt=Tt[0],Vt=r.convert(E.format,E.colorSpace),Kt=r.convert(E.type),ne=y(E.internalFormat,Vt,Kt,E.normalized,E.colorSpace),F=E.isVideoTexture!==!0,yt=pt.__version===void 0||G===!0,et=J.dataReady,_t=b(E,Mt);ae(s.TEXTURE_CUBE_MAP,E);let At;if(xt){F&&yt&&e.texStorage2D(s.TEXTURE_CUBE_MAP,_t,ne,Mt.width,Mt.height);for(let at=0;at<6;at++){At=Tt[at].mipmaps;for(let Bt=0;Bt<At.length;Bt++){let Ut=At[Bt];E.format!==vn?Vt!==null?F?et&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt,0,0,Ut.width,Ut.height,Vt,Ut.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt,ne,Ut.width,Ut.height,0,Ut.data):jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt,0,0,Ut.width,Ut.height,Vt,Kt,Ut.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt,ne,Ut.width,Ut.height,0,Vt,Kt,Ut.data)}}}else{if(At=E.mipmaps,F&&yt){At.length>0&&_t++;let at=me(Tt[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,_t,ne,at.width,at.height)}for(let at=0;at<6;at++)if(kt){F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,Tt[at].width,Tt[at].height,Vt,Kt,Tt[at].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,ne,Tt[at].width,Tt[at].height,0,Vt,Kt,Tt[at].data);for(let Bt=0;Bt<At.length;Bt++){let z=At[Bt].image[at].image;F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt+1,0,0,z.width,z.height,Vt,Kt,z.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt+1,ne,z.width,z.height,0,Vt,Kt,z.data)}}else{F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,Vt,Kt,Tt[at]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,ne,Vt,Kt,Tt[at]);for(let Bt=0;Bt<At.length;Bt++){let Ut=At[Bt];F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt+1,0,0,Vt,Kt,Ut.image[at]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt+1,ne,Vt,Kt,Ut.image[at])}}}m(E)&&x(s.TEXTURE_CUBE_MAP),pt.__version=J.version,E.onUpdate&&E.onUpdate(E)}C.__version=E.version}function Et(C,E,H,G,J,pt){let gt=r.convert(H.format,H.colorSpace),K=r.convert(H.type),it=y(H.internalFormat,gt,K,H.normalized,H.colorSpace),xt=i.get(E),kt=i.get(H);if(kt.__renderTarget=E,!xt.__hasExternalTextures){let Tt=Math.max(1,E.width>>pt),Mt=Math.max(1,E.height>>pt);J===s.TEXTURE_3D||J===s.TEXTURE_2D_ARRAY?e.texImage3D(J,pt,it,Tt,Mt,E.depth,0,gt,K,null):e.texImage2D(J,pt,it,Tt,Mt,0,gt,K,null)}e.bindFramebuffer(s.FRAMEBUFFER,C),ee(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,G,J,kt.__webglTexture,0,Qt(E)):(J===s.TEXTURE_2D||J>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,G,J,kt.__webglTexture,pt),e.bindFramebuffer(s.FRAMEBUFFER,null)}function Zt(C,E,H){if(s.bindRenderbuffer(s.RENDERBUFFER,C),E.depthBuffer){let G=E.depthTexture,J=G&&G.isDepthTexture?G.type:null,pt=S(E.stencilBuffer,J),gt=E.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;ee(E)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Qt(E),pt,E.width,E.height):H?s.renderbufferStorageMultisample(s.RENDERBUFFER,Qt(E),pt,E.width,E.height):s.renderbufferStorage(s.RENDERBUFFER,pt,E.width,E.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,gt,s.RENDERBUFFER,C)}else{let G=E.textures;for(let J=0;J<G.length;J++){let pt=G[J],gt=r.convert(pt.format,pt.colorSpace),K=r.convert(pt.type),it=y(pt.internalFormat,gt,K,pt.normalized,pt.colorSpace);ee(E)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Qt(E),it,E.width,E.height):H?s.renderbufferStorageMultisample(s.RENDERBUFFER,Qt(E),it,E.width,E.height):s.renderbufferStorage(s.RENDERBUFFER,it,E.width,E.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function ye(C,E,H){let G=E.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(s.FRAMEBUFFER,C),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let J=i.get(E.depthTexture);if(J.__renderTarget=E,(!J.__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),G){if(J.__webglInit===void 0&&(J.__webglInit=!0,E.depthTexture.addEventListener("dispose",A)),J.__webglTexture===void 0){J.__webglTexture=s.createTexture(),e.bindTexture(s.TEXTURE_CUBE_MAP,J.__webglTexture),ae(s.TEXTURE_CUBE_MAP,E.depthTexture);let xt=r.convert(E.depthTexture.format),kt=r.convert(E.depthTexture.type),Tt;E.depthTexture.format===qn?Tt=s.DEPTH_COMPONENT24:E.depthTexture.format===ks&&(Tt=s.DEPTH24_STENCIL8);for(let Mt=0;Mt<6;Mt++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,0,Tt,E.width,E.height,0,xt,kt,null)}}else rt(E.depthTexture,0);let pt=J.__webglTexture,gt=Qt(E),K=G?s.TEXTURE_CUBE_MAP_POSITIVE_X+H:s.TEXTURE_2D,it=E.depthTexture.format===ks?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(E.depthTexture.format===qn)ee(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,it,K,pt,0,gt):s.framebufferTexture2D(s.FRAMEBUFFER,it,K,pt,0);else if(E.depthTexture.format===ks)ee(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,it,K,pt,0,gt):s.framebufferTexture2D(s.FRAMEBUFFER,it,K,pt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function st(C){let E=i.get(C),H=C.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==C.depthTexture){let G=C.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),G){let J=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,G.removeEventListener("dispose",J)};G.addEventListener("dispose",J),E.__depthDisposeCallback=J}E.__boundDepthTexture=G}if(C.depthTexture&&!E.__autoAllocateDepthBuffer)if(H)for(let G=0;G<6;G++)ye(E.__webglFramebuffer[G],C,G);else{let G=C.texture.mipmaps;G&&G.length>0?ye(E.__webglFramebuffer[0],C,0):ye(E.__webglFramebuffer,C,0)}else if(H){E.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(e.bindFramebuffer(s.FRAMEBUFFER,E.__webglFramebuffer[G]),E.__webglDepthbuffer[G]===void 0)E.__webglDepthbuffer[G]=s.createRenderbuffer(),Zt(E.__webglDepthbuffer[G],C,!1);else{let J=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,pt=E.__webglDepthbuffer[G];s.bindRenderbuffer(s.RENDERBUFFER,pt),s.framebufferRenderbuffer(s.FRAMEBUFFER,J,s.RENDERBUFFER,pt)}}else{let G=C.texture.mipmaps;if(G&&G.length>0?e.bindFramebuffer(s.FRAMEBUFFER,E.__webglFramebuffer[0]):e.bindFramebuffer(s.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=s.createRenderbuffer(),Zt(E.__webglDepthbuffer,C,!1);else{let J=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,pt=E.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,pt),s.framebufferRenderbuffer(s.FRAMEBUFFER,J,s.RENDERBUFFER,pt)}}e.bindFramebuffer(s.FRAMEBUFFER,null)}function ct(C,E,H){let G=i.get(C);E!==void 0&&Et(G.__webglFramebuffer,C,C.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),H!==void 0&&st(C)}function dt(C){let E=C.texture,H=i.get(C),G=i.get(E);C.addEventListener("dispose",_);let J=C.textures,pt=C.isWebGLCubeRenderTarget===!0,gt=J.length>1;if(gt||(G.__webglTexture===void 0&&(G.__webglTexture=s.createTexture()),G.__version=E.version,o.memory.textures++),pt){H.__webglFramebuffer=[];for(let K=0;K<6;K++)if(E.mipmaps&&E.mipmaps.length>0){H.__webglFramebuffer[K]=[];for(let it=0;it<E.mipmaps.length;it++)H.__webglFramebuffer[K][it]=s.createFramebuffer()}else H.__webglFramebuffer[K]=s.createFramebuffer()}else{if(E.mipmaps&&E.mipmaps.length>0){H.__webglFramebuffer=[];for(let K=0;K<E.mipmaps.length;K++)H.__webglFramebuffer[K]=s.createFramebuffer()}else H.__webglFramebuffer=s.createFramebuffer();if(gt)for(let K=0,it=J.length;K<it;K++){let xt=i.get(J[K]);xt.__webglTexture===void 0&&(xt.__webglTexture=s.createTexture(),o.memory.textures++)}if(C.samples>0&&ee(C)===!1){H.__webglMultisampledFramebuffer=s.createFramebuffer(),H.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let K=0;K<J.length;K++){let it=J[K];H.__webglColorRenderbuffer[K]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,H.__webglColorRenderbuffer[K]);let xt=r.convert(it.format,it.colorSpace),kt=r.convert(it.type),Tt=y(it.internalFormat,xt,kt,it.normalized,it.colorSpace,C.isXRRenderTarget===!0),Mt=Qt(C);s.renderbufferStorageMultisample(s.RENDERBUFFER,Mt,Tt,C.width,C.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+K,s.RENDERBUFFER,H.__webglColorRenderbuffer[K])}s.bindRenderbuffer(s.RENDERBUFFER,null),C.depthBuffer&&(H.__webglDepthRenderbuffer=s.createRenderbuffer(),Zt(H.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(pt){e.bindTexture(s.TEXTURE_CUBE_MAP,G.__webglTexture),ae(s.TEXTURE_CUBE_MAP,E);for(let K=0;K<6;K++)if(E.mipmaps&&E.mipmaps.length>0)for(let it=0;it<E.mipmaps.length;it++)Et(H.__webglFramebuffer[K][it],C,E,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+K,it);else Et(H.__webglFramebuffer[K],C,E,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);m(E)&&x(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(gt){for(let K=0,it=J.length;K<it;K++){let xt=J[K],kt=i.get(xt),Tt=s.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Tt=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(Tt,kt.__webglTexture),ae(Tt,xt),Et(H.__webglFramebuffer,C,xt,s.COLOR_ATTACHMENT0+K,Tt,0),m(xt)&&x(Tt)}e.unbindTexture()}else{let K=s.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(K=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(K,G.__webglTexture),ae(K,E),E.mipmaps&&E.mipmaps.length>0)for(let it=0;it<E.mipmaps.length;it++)Et(H.__webglFramebuffer[it],C,E,s.COLOR_ATTACHMENT0,K,it);else Et(H.__webglFramebuffer,C,E,s.COLOR_ATTACHMENT0,K,0);m(E)&&x(K),e.unbindTexture()}C.depthBuffer&&st(C)}function ft(C){let E=C.textures;for(let H=0,G=E.length;H<G;H++){let J=E[H];if(m(J)){let pt=M(C),gt=i.get(J).__webglTexture;e.bindTexture(pt,gt),x(pt),e.unbindTexture()}}}let mt=[],Jt=[];function Xt(C){if(C.samples>0){if(ee(C)===!1){let E=C.textures,H=C.width,G=C.height,J=s.COLOR_BUFFER_BIT,pt=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,gt=i.get(C),K=E.length>1;if(K)for(let xt=0;xt<E.length;xt++)e.bindFramebuffer(s.FRAMEBUFFER,gt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+xt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,gt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+xt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,gt.__webglMultisampledFramebuffer);let it=C.texture.mipmaps;it&&it.length>0?e.bindFramebuffer(s.DRAW_FRAMEBUFFER,gt.__webglFramebuffer[0]):e.bindFramebuffer(s.DRAW_FRAMEBUFFER,gt.__webglFramebuffer);for(let xt=0;xt<E.length;xt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(J|=s.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(J|=s.STENCIL_BUFFER_BIT)),K){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,gt.__webglColorRenderbuffer[xt]);let kt=i.get(E[xt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,kt,0)}s.blitFramebuffer(0,0,H,G,0,0,H,G,J,s.NEAREST),l===!0&&(mt.length=0,Jt.length=0,mt.push(s.COLOR_ATTACHMENT0+xt),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(mt.push(pt),Jt.push(pt),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Jt)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,mt))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),K)for(let xt=0;xt<E.length;xt++){e.bindFramebuffer(s.FRAMEBUFFER,gt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+xt,s.RENDERBUFFER,gt.__webglColorRenderbuffer[xt]);let kt=i.get(E[xt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,gt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+xt,s.TEXTURE_2D,kt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,gt.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let E=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[E])}}}function Qt(C){return Math.min(n.maxSamples,C.samples)}function ee(C){let E=i.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function D(C){let E=o.render.frame;h.get(C)!==E&&(h.set(C,E),C.update())}function we(C,E){let H=C.colorSpace,G=C.format,J=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||H!==ha&&H!==_s&&(_e.getTransfer(H)===Ce?(G!==vn||J!==Fi)&&jt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):te("WebGLTextures: Unsupported texture color space:",H)),E}function me(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=q,this.resetTextureUnits=B,this.getTextureUnits=L,this.setTextureUnits=O,this.setTexture2D=rt,this.setTexture2DArray=Z,this.setTexture3D=tt,this.setTextureCube=nt,this.rebindTextures=ct,this.setupRenderTarget=dt,this.updateRenderTargetMipmap=ft,this.updateMultisampleRenderTarget=Xt,this.setupDepthRenderbuffer=st,this.setupFrameBufferTexture=Et,this.useMultisampledRTT=ee,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function rb(s,t){function e(i,n=_s){let r,o=_e.getTransfer(n);if(i===Fi)return s.UNSIGNED_BYTE;if(i===zc)return s.UNSIGNED_SHORT_4_4_4_4;if(i===kc)return s.UNSIGNED_SHORT_5_5_5_1;if(i===cd)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===hd)return s.UNSIGNED_INT_10F_11F_11F_REV;if(i===ad)return s.BYTE;if(i===ld)return s.SHORT;if(i===fo)return s.UNSIGNED_SHORT;if(i===Hc)return s.INT;if(i===Dn)return s.UNSIGNED_INT;if(i===gn)return s.FLOAT;if(i===ui)return s.HALF_FLOAT;if(i===ud)return s.ALPHA;if(i===dd)return s.RGB;if(i===vn)return s.RGBA;if(i===qn)return s.DEPTH_COMPONENT;if(i===ks)return s.DEPTH_STENCIL;if(i===Vc)return s.RED;if(i===Gc)return s.RED_INTEGER;if(i===Vs)return s.RG;if(i===Wc)return s.RG_INTEGER;if(i===qc)return s.RGBA_INTEGER;if(i===Qa||i===tl||i===el||i===il)if(o===Ce)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Qa)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===tl)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===el)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===il)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Qa)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===tl)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===el)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===il)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Xc||i===Yc||i===Zc||i===$c)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Xc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Yc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Zc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===$c)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Jc||i===Kc||i===jc||i===Qc||i===th||i===nl||i===eh)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Jc||i===Kc)return o===Ce?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===jc)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Qc)return r.COMPRESSED_R11_EAC;if(i===th)return r.COMPRESSED_SIGNED_R11_EAC;if(i===nl)return r.COMPRESSED_RG11_EAC;if(i===eh)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===ih||i===nh||i===sh||i===rh||i===oh||i===ah||i===lh||i===ch||i===hh||i===uh||i===dh||i===fh||i===ph||i===mh)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===ih)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===nh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===sh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===rh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===oh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===ah)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===lh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===ch)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===hh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===uh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===dh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===fh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===ph)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===mh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===gh||i===vh||i===xh)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===gh)return o===Ce?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===vh)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===xh)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===yh||i===_h||i===sl||i===Mh)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===yh)return r.COMPRESSED_RED_RGTC1_EXT;if(i===_h)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===sl)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Mh)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===po?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:e}}var ob=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ab=`
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

}`,Hd=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new Ea(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new fe({vertexShader:ob,fragmentShader:ab,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ot(new oi(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},zd=class extends Xn{constructor(t,e){super();let i=this,n=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,g=null,v=typeof XRWebGLBinding<"u",p=new Hd,m={},x=e.getContextAttributes(),M=null,y=null,S=[],b=[],A=new Q,_=null,R=null,P=new ei;P.viewport=new Ke;let I=new ei;I.viewport=new Ke;let N=[P,I],B=new Nc,L=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let j=S[X];return j===void 0&&(j=new Jr,S[X]=j),j.getTargetRaySpace()},this.getControllerGrip=function(X){let j=S[X];return j===void 0&&(j=new Jr,S[X]=j),j.getGripSpace()},this.getHand=function(X){let j=S[X];return j===void 0&&(j=new Jr,S[X]=j),j.getHandSpace()};function q(X){let j=b.indexOf(X.inputSource);if(j===-1)return;let vt=S[j];vt!==void 0&&(vt.update(X.inputSource,X.frame,c||o),vt.dispatchEvent({type:X.type,data:X.inputSource}))}function Y(){n.removeEventListener("select",q),n.removeEventListener("selectstart",q),n.removeEventListener("selectend",q),n.removeEventListener("squeeze",q),n.removeEventListener("squeezestart",q),n.removeEventListener("squeezeend",q),n.removeEventListener("end",Y),n.removeEventListener("inputsourceschange",rt);for(let X=0;X<S.length;X++){let j=b[X];j!==null&&(b[X]=null,S[X].disconnect(j))}L=null,O=null,p.reset();for(let X in m)delete m[X];if(t.setRenderTarget(M),f=null,d=null,u=null,n=null,y=null,le.stop(),i.isPresenting=!1,t.setPixelRatio(_),t.setSize(A.width,A.height,!1),R!==null){let X=R.camera;X.fov=R.fov,X.zoom=R.zoom,X.updateProjectionMatrix(),R=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,i.isPresenting===!0&&jt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){a=X,i.isPresenting===!0&&jt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&v&&(u=new XRWebGLBinding(n,e)),u},this.getFrame=function(){return g},this.getSession=function(){return n},this.setSession=async function(X){if(n=X,n!==null){if(M=t.getRenderTarget(),n.addEventListener("select",q),n.addEventListener("selectstart",q),n.addEventListener("selectend",q),n.addEventListener("squeeze",q),n.addEventListener("squeezestart",q),n.addEventListener("squeezeend",q),n.addEventListener("end",Y),n.addEventListener("inputsourceschange",rt),x.xrCompatible!==!0&&await e.makeXRCompatible(),_=t.getPixelRatio(),t.getSize(A),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let vt=null,Wt=null,Et=null;x.depth&&(Et=x.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,vt=x.stencil?ks:qn,Wt=x.stencil?po:Dn);let Zt={colorFormat:e.RGBA8,depthFormat:Et,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Zt),n.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),y=new je(d.textureWidth,d.textureHeight,{format:vn,type:Fi,depthTexture:new Ns(d.textureWidth,d.textureHeight,Wt,void 0,void 0,void 0,void 0,void 0,void 0,vt),stencilBuffer:x.stencil,colorSpace:t.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let vt={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(n,e,vt),n.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new je(f.framebufferWidth,f.framebufferHeight,{format:vn,type:Fi,colorSpace:t.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await n.requestReferenceSpace(a),le.setContext(n),le.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function rt(X){for(let j=0;j<X.removed.length;j++){let vt=X.removed[j],Wt=b.indexOf(vt);Wt>=0&&(b[Wt]=null,S[Wt].disconnect(vt))}for(let j=0;j<X.added.length;j++){let vt=X.added[j],Wt=b.indexOf(vt);if(Wt===-1){for(let Zt=0;Zt<S.length;Zt++)if(Zt>=b.length){b.push(vt),Wt=Zt;break}else if(b[Zt]===null){b[Zt]=vt,Wt=Zt;break}if(Wt===-1)break}let Et=S[Wt];Et&&Et.connect(vt)}}let Z=new T,tt=new T;function nt(X,j,vt){Z.setFromMatrixPosition(j.matrixWorld),tt.setFromMatrixPosition(vt.matrixWorld);let Wt=Z.distanceTo(tt),Et=j.projectionMatrix.elements,Zt=vt.projectionMatrix.elements,ye=Et[14]/(Et[10]-1),st=Et[14]/(Et[10]+1),ct=(Et[9]+1)/Et[5],dt=(Et[9]-1)/Et[5],ft=(Et[8]-1)/Et[0],mt=(Zt[8]+1)/Zt[0],Jt=ye*ft,Xt=ye*mt,Qt=Wt/(-ft+mt),ee=Qt*-ft;if(j.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(ee),X.translateZ(Qt),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),Et[10]===-1)X.projectionMatrix.copy(j.projectionMatrix),X.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{let D=ye+Qt,we=st+Qt,me=Jt-ee,C=Xt+(Wt-ee),E=ct*st/we*D,H=dt*st/we*D;X.projectionMatrix.makePerspective(me,C,E,H,D,we),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function Lt(X,j){j===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(j.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(n===null)return;let j=X.near,vt=X.far;p.texture!==null&&(p.depthNear>0&&(j=p.depthNear),p.depthFar>0&&(vt=p.depthFar)),B.near=I.near=P.near=j,B.far=I.far=P.far=vt,(L!==B.near||O!==B.far)&&(n.updateRenderState({depthNear:B.near,depthFar:B.far}),L=B.near,O=B.far),B.layers.mask=X.layers.mask|6,P.layers.mask=B.layers.mask&-5,I.layers.mask=B.layers.mask&-3;let Wt=X.parent,Et=B.cameras;Lt(B,Wt);for(let Zt=0;Zt<Et.length;Zt++)Lt(Et[Zt],Wt);Et.length===2?nt(B,P,I):B.projectionMatrix.copy(P.projectionMatrix),R===null&&X.isPerspectiveCamera&&(R={camera:X,fov:X.fov,zoom:X.zoom}),Pt(X,B,Wt)};function Pt(X,j,vt){vt===null?X.matrix.copy(j.matrixWorld):(X.matrix.copy(vt.matrixWorld),X.matrix.invert(),X.matrix.multiply(j.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(j.projectionMatrix),X.projectionMatrixInverse.copy(j.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=Zr*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(X){l=X,d!==null&&(d.fixedFoveation=X),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=X)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(B)},this.getCameraTexture=function(X){return m[X]};let ce=null;function ae(X,j){if(h=j.getViewerPose(c||o),g=j,h!==null){let vt=h.views;f!==null&&(t.setRenderTargetFramebuffer(y,f.framebuffer),t.setRenderTarget(y));let Wt=!1;vt.length!==B.cameras.length&&(B.cameras.length=0,Wt=!0);for(let st=0;st<vt.length;st++){let ct=vt[st],dt=null;if(f!==null)dt=f.getViewport(ct);else{let mt=u.getViewSubImage(d,ct);dt=mt.viewport,st===0&&(t.setRenderTargetTextures(y,mt.colorTexture,mt.depthStencilTexture),t.setRenderTarget(y))}let ft=N[st];ft===void 0&&(ft=new ei,ft.layers.enable(st),ft.viewport=new Ke,N[st]=ft),ft.matrix.fromArray(ct.transform.matrix),ft.matrix.decompose(ft.position,ft.quaternion,ft.scale),ft.projectionMatrix.fromArray(ct.projectionMatrix),ft.projectionMatrixInverse.copy(ft.projectionMatrix).invert(),ft.viewport.set(dt.x,dt.y,dt.width,dt.height),st===0&&(B.matrix.copy(ft.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),Wt===!0&&B.cameras.push(ft)}let Et=n.enabledFeatures;if(Et&&Et.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&v){u=i.getBinding();let st=u.getDepthInformation(vt[0]);st&&st.isValid&&st.texture&&p.init(st,n.renderState)}if(Et&&Et.includes("camera-access")&&v){t.state.unbindTexture(),u=i.getBinding();for(let st=0;st<vt.length;st++){let ct=vt[st].camera;if(ct){let dt=m[ct];dt||(dt=new Ea,m[ct]=dt);let ft=u.getCameraImage(ct);dt.sourceTexture=ft}}}}for(let vt=0;vt<S.length;vt++){let Wt=b[vt],Et=S[vt];Wt!==null&&Et!==void 0&&Et.update(Wt,j,c||o)}ce&&ce(X,j),j.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:j}),g=null}let le=new Rm;le.setAnimationLoop(ae),this.setAnimationLoop=function(X){ce=X},this.dispose=function(){}}},lb=new be,Nm=new ie;Nm.set(-1,0,0,0,1,0,0,0,1);function cb(s,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function i(p,m){m.color.getRGB(p.fogColor.value,vd(s)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function n(p,m,x,M,y){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(p,m):m.isMeshLambertMaterial?(r(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(p,m),u(p,m)):m.isMeshPhongMaterial?(r(p,m),h(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(p,m),d(p,m),m.isMeshPhysicalMaterial&&f(p,m,y)):m.isMeshMatcapMaterial?(r(p,m),g(p,m)):m.isMeshDepthMaterial?r(p,m):m.isMeshDistanceMaterial?(r(p,m),v(p,m)):m.isMeshNormalMaterial?r(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,x,M):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===_i&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===_i&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let x=t.get(m),M=x.envMap,y=x.envMapRotation;M&&(p.envMap.value=M,p.envMapRotation.value.setFromMatrix4(lb.makeRotationFromEuler(y)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Nm),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,x,M){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*x,p.scale.value=M*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function u(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function d(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,x){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===_i&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.retroreflectivity>0&&(p.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=x.texture,p.transmissionSamplerSize.value.set(x.width,x.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function v(p,m){let x=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(x.matrixWorld),p.nearDistance.value=x.shadow.camera.near,p.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function hb(s,t,e,i){let n={},r={},o=[],a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,S){let b=S.program;i.uniformBlockBinding(y,b)}function c(y,S){let b=n[y.id];b===void 0&&(p(y),b=h(y),n[y.id]=b,y.addEventListener("dispose",x));let A=S.program;i.updateUBOMapping(y,A);let _=t.render.frame;r[y.id]!==_&&(d(y),r[y.id]=_)}function h(y){let S=u();y.__bindingPointIndex=S;let b=s.createBuffer(),A=y.__size,_=y.usage;return s.bindBuffer(s.UNIFORM_BUFFER,b),s.bufferData(s.UNIFORM_BUFFER,A,_),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,S,b),b}function u(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return te("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){let S=n[y.id],b=y.uniforms,A=y.__cache;s.bindBuffer(s.UNIFORM_BUFFER,S);for(let _=0,R=b.length;_<R;_++){let P=b[_];if(Array.isArray(P))for(let I=0,N=P.length;I<N;I++)f(P[I],_,I,A);else f(P,_,0,A)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(y,S,b,A){if(v(y,S,b,A)===!0){let _=y.__offset,R=y.value;if(Array.isArray(R)){let P=0;for(let I=0;I<R.length;I++){let N=R[I],B=m(N);g(N,y.__data,P),typeof N!="number"&&typeof N!="boolean"&&!N.isMatrix3&&!ArrayBuffer.isView(N)&&(P+=B.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(R,y.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,_,y.__data)}}function g(y,S,b){typeof y=="number"||typeof y=="boolean"?S[0]=y:y.isMatrix3?(S[0]=y.elements[0],S[1]=y.elements[1],S[2]=y.elements[2],S[3]=0,S[4]=y.elements[3],S[5]=y.elements[4],S[6]=y.elements[5],S[7]=0,S[8]=y.elements[6],S[9]=y.elements[7],S[10]=y.elements[8],S[11]=0):ArrayBuffer.isView(y)?S.set(new y.constructor(y.buffer,y.byteOffset,S.length)):y.toArray(S,b)}function v(y,S,b,A){let _=y.value,R=S+"_"+b;if(A[R]===void 0)return typeof _=="number"||typeof _=="boolean"?A[R]=_:ArrayBuffer.isView(_)?A[R]=_.slice():A[R]=_.clone(),!0;{let P=A[R];if(typeof _=="number"||typeof _=="boolean"){if(P!==_)return A[R]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(P.equals(_)===!1)return P.copy(_),!0}}return!1}function p(y){let S=y.uniforms,b=0,A=16;for(let R=0,P=S.length;R<P;R++){let I=Array.isArray(S[R])?S[R]:[S[R]];for(let N=0,B=I.length;N<B;N++){let L=I[N],O=Array.isArray(L.value)?L.value:[L.value];for(let q=0,Y=O.length;q<Y;q++){let rt=O[q],Z=m(rt),tt=b%A,nt=tt%Z.boundary,Lt=tt+nt;b+=nt,Lt!==0&&A-Lt<Z.storage&&(b+=A-Lt),L.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=b,b+=Z.storage}}}let _=b%A;return _>0&&(b+=A-_),y.__size=b,y.__cache={},this}function m(y){let S={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(S.boundary=4,S.storage=4):y.isVector2?(S.boundary=8,S.storage=8):y.isVector3||y.isColor?(S.boundary=16,S.storage=12):y.isVector4?(S.boundary=16,S.storage=16):y.isMatrix3?(S.boundary=48,S.storage=48):y.isMatrix4?(S.boundary=64,S.storage=64):y.isTexture?jt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(S.boundary=16,S.storage=y.byteLength):jt("WebGLRenderer: Unsupported uniform value type.",y),S}function x(y){let S=y.target;S.removeEventListener("dispose",x);let b=o.indexOf(S.__bindingPointIndex);o.splice(b,1),s.deleteBuffer(n[S.id]),delete n[S.id],delete r[S.id]}function M(){for(let y in n)s.deleteBuffer(n[y]);o=[],n={},r={}}return{bind:l,update:c,dispose:M}}var ub=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Qn=null;function db(){return Qn===null&&(Qn=new ba(ub,16,16,Vs,ui),Qn.name="DFG_LUT",Qn.minFilter=gi,Qn.magFilter=gi,Qn.wrapS=Vn,Qn.wrapT=Vn,Qn.generateMipmaps=!1,Qn.needsUpdate=!0),Qn}var Rh=class{constructor(t={}){let{canvas:e=$p(),context:i=null,depth:n=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Fi}=t;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=o;let v=f,p=new Set([qc,Wc,Gc]),m=new Set([Fi,Dn,fo,po,zc,kc]),x=new Uint32Array(4),M=new Int32Array(4),y=new T,S=null,b=null,A=[],_=[],R=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ln,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,I=!1,N=null,B=null,L=null,O=null;this._outputColorSpace=ze;let q=0,Y=0,rt=null,Z=-1,tt=null,nt=new Ke,Lt=new Ke,Pt=null,ce=new St(0),ae=0,le=e.width,X=e.height,j=1,vt=null,Wt=null,Et=new Ke(0,0,le,X),Zt=new Ke(0,0,le,X),ye=!1,st=new Qr,ct=!1,dt=!1,ft=new be,mt=new T,Jt=new Ke,Xt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Qt=!1;function ee(){return rt===null?j:1}let D=i;function we(w,U){return e.getContext(w,U)}let me,C,E,H,G,J,pt,gt,K,it,xt,kt,Tt,Mt,Vt,Kt,ne,F,yt,et,_t,At,at;try{let w={alpha:!0,depth:n,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",z,!1),e.addEventListener("webglcontextrestored",W,!1),e.addEventListener("webglcontextcreationerror",ut,!1),D===null){let U="webgl2";if(D=we(U,w),D===null)throw we(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Bt()}catch(w){throw e.removeEventListener("webglcontextlost",z,!1),e.removeEventListener("webglcontextrestored",W,!1),e.removeEventListener("webglcontextcreationerror",ut,!1),te("WebGLRenderer: "+w.message),w}function Bt(){me=new y_(D),me.init(),_t=new rb(D,me),C=new c_(D,me,t,_t),E=new nb(D,me),C.reversedDepthBuffer&&d&&E.buffers.depth.setReversed(!0),B=D.createFramebuffer(),L=D.createFramebuffer(),O=D.createFramebuffer(),H=new b_(D),G=new GM,J=new sb(D,me,E,G,C,_t,H),pt=new x_(P),gt=new Ev(D),At=new a_(D,gt),K=new __(D,gt,H,At),it=new E_(D,K,gt,At,H),F=new S_(D,C,J),Vt=new h_(G),xt=new VM(P,pt,me,C,At,Vt),kt=new cb(P,G),Tt=new qM,Mt=new KM(me),ne=new o_(P,pt,E,it,g,l),Kt=new ib(P,it,C),at=new hb(D,H,C,E),yt=new l_(D,me,H),et=new M_(D,me,H),H.programs=xt.programs,P.capabilities=C,P.extensions=me,P.properties=G,P.renderLists=Tt,P.shadowMap=Kt,P.state=E,P.info=H}v!==Fi&&(R=new w_(v,e.width,e.height,a,n,r));let Ut=new zd(P,D);this.xr=Ut,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let w=me.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){let w=me.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(w){w!==void 0&&(j=w,this.setSize(le,X,!1))},this.getSize=function(w){return w.set(le,X)},this.setSize=function(w,U,$=!0){if(Ut.isPresenting){jt("WebGLRenderer: Can't change size while VR device is presenting.");return}le=w,X=U,e.width=Math.floor(w*j),e.height=Math.floor(U*j),$===!0&&(e.style.width=w+"px",e.style.height=U+"px"),R!==null&&R.setSize(e.width,e.height),this.setViewport(0,0,w,U)},this.getDrawingBufferSize=function(w){return w.set(le*j,X*j).floor()},this.setDrawingBufferSize=function(w,U,$){le=w,X=U,j=$,e.width=Math.floor(w*$),e.height=Math.floor(U*$),this.setViewport(0,0,w,U)},this.setEffects=function(w){if(v===Fi){te("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let U=0;U<w.length;U++)if(w[U].isOutputPass===!0){jt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}R.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(nt)},this.getViewport=function(w){return w.copy(Et)},this.setViewport=function(w,U,$,k){w.isVector4?Et.set(w.x,w.y,w.z,w.w):Et.set(w,U,$,k),E.viewport(nt.copy(Et).multiplyScalar(j).round())},this.getScissor=function(w){return w.copy(Zt)},this.setScissor=function(w,U,$,k){w.isVector4?Zt.set(w.x,w.y,w.z,w.w):Zt.set(w,U,$,k),E.scissor(Lt.copy(Zt).multiplyScalar(j).round())},this.getScissorTest=function(){return ye},this.setScissorTest=function(w){E.setScissorTest(ye=w)},this.setOpaqueSort=function(w){vt=w},this.setTransparentSort=function(w){Wt=w},this.getClearColor=function(w){return w.copy(ne.getClearColor())},this.setClearColor=function(){ne.setClearColor(...arguments)},this.getClearAlpha=function(){return ne.getClearAlpha()},this.setClearAlpha=function(){ne.setClearAlpha(...arguments)},this.clear=function(w=!0,U=!0,$=!0){let k=0;if(w){let V=!1;if(rt!==null){let Ct=rt.texture.format;V=p.has(Ct)}if(V){let Ct=rt.texture.type,Dt=m.has(Ct),Rt=ne.getClearColor(),Ht=ne.getClearAlpha(),Gt=Rt.r,ue=Rt.g,Se=Rt.b;Dt?(x[0]=Gt,x[1]=ue,x[2]=Se,x[3]=Ht,D.clearBufferuiv(D.COLOR,0,x)):(M[0]=Gt,M[1]=ue,M[2]=Se,M[3]=Ht,D.clearBufferiv(D.COLOR,0,M))}else k|=D.COLOR_BUFFER_BIT}U&&(k|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),$&&(k|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k!==0&&D.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),N=w},this.dispose=function(){e.removeEventListener("webglcontextlost",z,!1),e.removeEventListener("webglcontextrestored",W,!1),e.removeEventListener("webglcontextcreationerror",ut,!1),ne.dispose(),Tt.dispose(),Mt.dispose(),G.dispose(),pt.dispose(),it.dispose(),At.dispose(),at.dispose(),xt.dispose(),Ut.dispose(),Ut.removeEventListener("sessionstart",Be),Ut.removeEventListener("sessionend",Ze),yi.stop()};function z(w){w.preventDefault(),fa("WebGLRenderer: Context Lost."),I=!0}function W(){fa("WebGLRenderer: Context Restored."),I=!1;let w=H.autoReset,U=Kt.enabled,$=Kt.autoUpdate,k=Kt.needsUpdate,V=Kt.type;Bt(),H.autoReset=w,Kt.enabled=U,Kt.autoUpdate=$,Kt.needsUpdate=k,Kt.type=V}function ut(w){te("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function bt(w){let U=w.target;U.removeEventListener("dispose",bt),Yt(U)}function Yt(w){se(w),G.remove(w)}function se(w){let U=G.get(w).programs;U!==void 0&&(U.forEach(function($){xt.releaseProgram($)}),w.isShaderMaterial&&xt.releaseShaderCache(w))}this.renderBufferDirect=function(w,U,$,k,V,Ct){U===null&&(U=Xt);let Dt=V.isMesh&&V.matrixWorld.determinantAffine()<0,Rt=qo(w,U,$,k,V);E.setMaterial(k,Dt);let Ht=$.index,Gt=1;if(k.wireframe===!0){if(Ht=K.getWireframeAttribute($),Ht===void 0)return;Gt=2}let ue=$.drawRange,Se=$.attributes.position,zt=ue.start*Gt,Le=(ue.start+ue.count)*Gt;Ct!==null&&(zt=Math.max(zt,Ct.start*Gt),Le=Math.min(Le,(Ct.start+Ct.count)*Gt)),Ht!==null?(zt=Math.max(zt,0),Le=Math.min(Le,Ht.count)):Se!=null&&(zt=Math.max(zt,0),Le=Math.min(Le,Se.count));let fi=Le-zt;if(fi<0||fi===1/0)return;At.setup(V,k,Rt,$,Ht);let $e,Ve=yt;if(Ht!==null&&($e=gt.get(Ht),Ve=et,Ve.setIndex($e)),V.isMesh)k.wireframe===!0?(E.setLineWidth(k.wireframeLinewidth*ee()),Ve.setMode(D.LINES)):Ve.setMode(D.TRIANGLES);else if(V.isLine){let Di=k.linewidth;Di===void 0&&(Di=1),E.setLineWidth(Di*ee()),V.isLineSegments?Ve.setMode(D.LINES):V.isLineLoop?Ve.setMode(D.LINE_LOOP):Ve.setMode(D.LINE_STRIP)}else V.isPoints?Ve.setMode(D.POINTS):V.isSprite&&Ve.setMode(D.TRIANGLES);if(V.isBatchedMesh)if(me.get("WEBGL_multi_draw"))Ve.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{let Di=V._multiDrawStarts,It=V._multiDrawCounts,ki=V._multiDrawCount,Re=Ht?gt.get(Ht).bytesPerElement:1,dn=G.get(k).currentProgram.getUniforms();for(let zn=0;zn<ki;zn++)dn.setValue(D,"_gl_DrawID",zn),Ve.render(Di[zn]/Re,It[zn])}else if(V.isInstancedMesh)Ve.renderInstances(zt,fi,V.count);else if($.isInstancedBufferGeometry){let Di=$._maxInstanceCount!==void 0?$._maxInstanceCount:1/0,It=Math.min($.instanceCount,Di);Ve.renderInstances(zt,fi,It)}else Ve.render(zt,fi)};function Ot(w,U,$,k){N!==null&&w.isNodeMaterial&&N.setObject(k,w),ct===!0&&Vt.setState(w,$,!1),w.transparent===!0&&w.side===oe&&w.forceSinglePass===!1?(w.side=_i,w.needsUpdate=!0,cs(w,U,k),w.side=Os,w.needsUpdate=!0,cs(w,U,k),w.side=oe):cs(w,U,k)}this.compile=function(w,U,$=null){$===null&&($=w),N!==null&&N.renderStart(w,U,$),b=Mt.get($),b.init(U),_.push(b),$.traverseVisible(function(V){V.isLight&&V.layers.test(U.layers)&&(b.pushLight(V),V.castShadow&&b.pushShadow(V))}),w!==$&&w.traverseVisible(function(V){V.isLight&&V.layers.test(U.layers)&&(b.pushLight(V),V.castShadow&&b.pushShadow(V))}),b.setupLights(),N!==null&&N.updateLights(b.state.lightsArray),dt=this.localClippingEnabled,ct=Vt.init(this.clippingPlanes,dt),ct===!0&&Vt.setGlobalState(this.clippingPlanes,U),N!==null&&Kt.render(b.state.shadowsArray,$,U);let k=new Set;return w.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;let Ct=V.material;if(Ct)if(Array.isArray(Ct))for(let Dt=0;Dt<Ct.length;Dt++){let Rt=Ct[Dt];Ot(Rt,$,U,V),k.add(Rt)}else Ot(Ct,$,U,V),k.add(Ct)}),b=_.pop(),N!==null&&N.renderEnd(),k},this.compileAsync=function(w,U,$=null){let k=this.compile(w,U,$);return new Promise(V=>{function Ct(){if(k.forEach(function(Dt){let Ht=G.get(Dt).currentProgram;(Ht===void 0||Ht.isReady())&&k.delete(Dt)}),k.size===0){V(w);return}setTimeout(Ct,10)}me.get("KHR_parallel_shader_compile")!==null?Ct():setTimeout(Ct,10)})};let Pe=null;function Ae(w){Pe&&Pe(w)}function Be(){yi.stop()}function Ze(){yi.start()}let yi=new Rm;yi.setAnimationLoop(Ae),typeof self<"u"&&yi.setContext(self),this.setAnimationLoop=function(w){Pe=w,Ut.setAnimationLoop(w),w===null?yi.stop():yi.start()},Ut.addEventListener("sessionstart",Be),Ut.addEventListener("sessionend",Ze),this.render=function(w,U){if(U!==void 0&&U.isCamera!==!0){te("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;N!==null&&N.renderStart(w,U);let $=Ut.enabled===!0&&Ut.isPresenting===!0,k=R!==null&&(rt===null||$)&&R.begin(P,rt);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),Ut.enabled===!0&&Ut.isPresenting===!0&&(R===null||R.isCompositing()===!1)&&(Ut.cameraAutoUpdate===!0&&Ut.updateCamera(U),U=Ut.getCamera()),w.isScene===!0&&w.onBeforeRender(P,w,U,rt),b=Mt.get(w,_.length),b.init(U),b.state.textureUnits=J.getTextureUnits(),_.push(b),ft.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),st.setFromProjectionMatrix(ft,Cn,U.reversedDepth),dt=this.localClippingEnabled,ct=Vt.init(this.clippingPlanes,dt),S=Tt.get(w,A.length),S.init(),A.push(S),Ut.enabled===!0&&Ut.isPresenting===!0){let Dt=P.xr.getDepthSensingMesh();Dt!==null&&$i(Dt,U,-1/0,P.sortObjects)}$i(w,U,0,P.sortObjects),S.finish(),N!==null&&N.updateLights(b.state.lightsArray),P.sortObjects===!0&&S.sort(vt,Wt),Qt=Ut.enabled===!1||Ut.isPresenting===!1||Ut.hasDepthSensing()===!1,Qt&&ne.addToRenderList(S,w),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ct===!0&&Vt.beginShadows();let V=b.state.shadowsArray;if(Kt.render(V,w,U),ct===!0&&Vt.endShadows(),(k&&R.hasRenderPass())===!1){let Dt=S.opaque,Rt=S.transmissive;if(b.setupLights(),U.isArrayCamera){let Ht=U.cameras;if(Rt.length>0)for(let Gt=0,ue=Ht.length;Gt<ue;Gt++){let Se=Ht[Gt];ls(Dt,Rt,w,Se)}Qt&&ne.render(w);for(let Gt=0,ue=Ht.length;Gt<ue;Gt++){let Se=Ht[Gt];En(S,w,Se,Se.viewport)}}else Rt.length>0&&ls(Dt,Rt,w,U),Qt&&ne.render(w),En(S,w,U)}rt!==null&&Y===0&&(J.updateMultisampleRenderTarget(rt),J.updateRenderTargetMipmap(rt)),k&&R.end(P),w.isScene===!0&&w.onAfterRender(P,w,U),At.resetDefaultState(),Z=-1,tt=null,_.pop(),_.length>0?(b=_[_.length-1],J.setTextureUnits(b.state.textureUnits),ct===!0&&Vt.setGlobalState(P.clippingPlanes,b.state.camera)):b=null,A.pop(),A.length>0?S=A[A.length-1]:S=null,N!==null&&N.renderEnd()};function $i(w,U,$,k){if(w.visible===!1)return;if(w.layers.test(U.layers)){if(w.isGroup)$=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(U);else if(w.isLightProbeGrid)b.pushLightProbeGrid(w);else if(w.isLight)b.pushLight(w),w.castShadow&&b.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||w.intersectsFrustum(st)){k&&Jt.setFromMatrixPosition(w.matrixWorld).applyMatrix4(ft);let Dt=it.update(w),Rt=w.material;Rt.visible&&S.push(w,Dt,Rt,$,Jt.z,null,U)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||w.intersectsFrustum(st))){let Dt=it.update(w),Rt=w.material;if(k&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Jt.copy(w.boundingSphere.center)):(Dt.boundingSphere===null&&Dt.computeBoundingSphere(),Jt.copy(Dt.boundingSphere.center)),Jt.applyMatrix4(w.matrixWorld).applyMatrix4(ft)),Array.isArray(Rt)){let Ht=Dt.groups;for(let Gt=0,ue=Ht.length;Gt<ue;Gt++){let Se=Ht[Gt],zt=Rt[Se.materialIndex];zt&&zt.visible&&S.push(w,Dt,zt,$,Jt.z,Se,U)}}else Rt.visible&&S.push(w,Dt,Rt,$,Jt.z,null,U)}}let Ct=w.children;for(let Dt=0,Rt=Ct.length;Dt<Rt;Dt++)$i(Ct[Dt],U,$,k)}function En(w,U,$,k){let{opaque:V,transmissive:Ct,transparent:Dt}=w;b.setupLightsView($),ct===!0&&Vt.setGlobalState(P.clippingPlanes,$),k&&E.viewport(nt.copy(k)),V.length>0&&Hn(V,U,$),Ct.length>0&&Hn(Ct,U,$),Dt.length>0&&Hn(Dt,U,$),E.buffers.depth.setTest(!0),E.buffers.depth.setMask(!0),E.buffers.color.setMask(!0),E.setPolygonOffset(!1)}function ls(w,U,$,k){if(($.isScene===!0?$.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[k.id]===void 0){let zt=me.has("EXT_color_buffer_half_float")||me.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[k.id]=new je(1,1,{generateMipmaps:!0,type:zt?ui:Fi,minFilter:zs,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:_e.workingColorSpace})}let Ct=b.state.transmissionRenderTarget[k.id],Dt=k.viewport||nt;Ct.setSize(Dt.z*P.transmissionResolutionScale,Dt.w*P.transmissionResolutionScale);let Rt=P.getRenderTarget(),Ht=P.getActiveCubeFace(),Gt=P.getActiveMipmapLevel();P.setRenderTarget(Ct),P.getClearColor(ce),ae=P.getClearAlpha(),ae<1&&P.setClearColor(16777215,.5),P.clear(),Qt&&ne.render($);let ue=P.toneMapping;P.toneMapping=Ln;let Se=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),b.setupLightsView(k),ct===!0&&Vt.setGlobalState(P.clippingPlanes,k),Hn(w,$,k),J.updateMultisampleRenderTarget(Ct),J.updateRenderTargetMipmap(Ct),me.has("WEBGL_multisampled_render_to_texture")===!1){let zt=!1;for(let Le=0,fi=U.length;Le<fi;Le++){let $e=U[Le],{object:Ve,geometry:Di,material:It,group:ki}=$e;if(It.side===oe&&Ve.layers.test(k.layers)){let Re=It.side;It.side=_i,It.needsUpdate=!0,tn(Ve,$,k,Di,It,ki),It.side=Re,It.needsUpdate=!0,zt=!0}}zt===!0&&(J.updateMultisampleRenderTarget(Ct),J.updateRenderTargetMipmap(Ct))}P.setRenderTarget(Rt,Ht,Gt),P.setClearColor(ce,ae),Se!==void 0&&(k.viewport=Se),P.toneMapping=ue}function Hn(w,U,$){let k=U.isScene===!0?U.overrideMaterial:null;for(let V=0,Ct=w.length;V<Ct;V++){let Dt=w[V],{object:Rt,geometry:Ht,group:Gt}=Dt,ue=Dt.material;ue.allowOverride===!0&&k!==null&&(ue=k),Rt.layers.test($.layers)&&tn(Rt,U,$,Ht,ue,Gt)}}function tn(w,U,$,k,V,Ct){N!==null&&V.isNodeMaterial&&N.setObject(w,V),w.onBeforeRender(P,U,$,k,V,Ct),w.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),V.onBeforeRender(P,U,$,k,w,Ct),V.transparent===!0&&V.side===oe&&V.forceSinglePass===!1?(V.side=_i,V.needsUpdate=!0,P.renderBufferDirect($,U,k,V,w,Ct),V.side=Os,V.needsUpdate=!0,P.renderBufferDirect($,U,k,V,w,Ct),V.side=oe):P.renderBufferDirect($,U,k,V,w,Ct),w.onAfterRender(P,U,$,k,V,Ct)}function cs(w,U,$){U.isScene!==!0&&(U=Xt);let k=G.get(w),V=b.state.lights,Ct=b.state.shadowsArray,Dt=V.state.version,Rt=xt.getParameters(w,V.state,Ct,U,$,b.state.lightProbeGridArray),Ht=xt.getProgramCacheKey(Rt),Gt=k.programs;k.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?U.environment:null,k.fog=U.fog;let ue=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;k.envMap=pt.get(w.envMap||k.environment,ue),k.envMapRotation=k.environment!==null&&w.envMap===null?U.environmentRotation:w.envMapRotation,Gt===void 0&&(w.addEventListener("dispose",bt),Gt=new Map,k.programs=Gt);let Se=Gt.get(Ht);if(Se!==void 0){if(k.currentProgram===Se&&k.lightsStateVersion===Dt)return Wo(w,Rt),Se}else Rt.uniforms=xt.getUniforms(w),N!==null&&w.isNodeMaterial&&N.build(w,$,Rt),w.onBeforeCompile(Rt,P),Se=xt.acquireProgram(Rt,Ht),Gt.set(Ht,Se),k.uniforms=Rt.uniforms;let zt=k.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(zt.clippingPlanes=Vt.uniform),Wo(w,Rt),k.needsLights=El(w),k.lightsStateVersion=Dt,k.needsLights&&(zt.ambientLightColor.value=V.state.ambient,zt.lightProbe.value=V.state.probe,zt.sunLights.value=V.state.sun,zt.sunLightShadows.value=V.state.sunShadow,zt.directionalLights.value=V.state.directional,zt.directionalLightShadows.value=V.state.directionalShadow,zt.spotLights.value=V.state.spot,zt.spotLightShadows.value=V.state.spotShadow,zt.rectAreaLights.value=V.state.rectArea,zt.ltc_1.value=V.state.rectAreaLTC1,zt.ltc_2.value=V.state.rectAreaLTC2,zt.pointLights.value=V.state.point,zt.pointLightShadows.value=V.state.pointShadow,zt.hemisphereLights.value=V.state.hemi,zt.sunShadowMatrix.value=V.state.sunShadowMatrix,zt.sunShadowCascade.value=V.state.sunShadowCascade,zt.directionalShadowMatrix.value=V.state.directionalShadowMatrix,zt.spotLightMatrix.value=V.state.spotLightMatrix,zt.spotLightMap.value=V.state.spotLightMap,zt.pointShadowMatrix.value=V.state.pointShadowMatrix),k.lightProbeGrid=b.state.lightProbeGridArray.length>0,k.currentProgram=Se,k.uniformsList=null,Se}function Go(w){if(w.uniformsList===null){let U=w.currentProgram.getUniforms();w.uniformsList=vo.seqWithValue(U.seq,w.uniforms)}return w.uniformsList}function Wo(w,U){let $=G.get(w);$.outputColorSpace=U.outputColorSpace,$.batching=U.batching,$.batchingColor=U.batchingColor,$.instancing=U.instancing,$.instancingColor=U.instancingColor,$.instancingMorph=U.instancingMorph,$.skinning=U.skinning,$.morphTargets=U.morphTargets,$.morphNormals=U.morphNormals,$.morphColors=U.morphColors,$.morphTargetsCount=U.morphTargetsCount,$.numClippingPlanes=U.numClippingPlanes,$.numIntersection=U.numClipIntersection,$.vertexAlphas=U.vertexAlphas,$.vertexTangents=U.vertexTangents,$.toneMapping=U.toneMapping}function Sl(w,U){if(w.length===0)return null;if(w.length===1)return w[0].texture!==null?w[0]:null;y.setFromMatrixPosition(U.matrixWorld);for(let $=0,k=w.length;$<k;$++){let V=w[$];if(V.texture!==null&&V.boundingBox.containsPoint(y))return V}return null}function qo(w,U,$,k,V){U.isScene!==!0&&(U=Xt),J.resetTextureUnits();let Ct=U.fog,Dt=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?U.environment:null,Rt=rt===null?P.outputColorSpace:rt.isXRRenderTarget===!0?rt.texture.colorSpace:_e.workingColorSpace,Ht=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap,Gt=pt.get(k.envMap||Dt,Ht),ue=k.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,Se=!!$.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),zt=!!$.morphAttributes.position,Le=!!$.morphAttributes.normal,fi=!!$.morphAttributes.color,$e=Ln;k.toneMapped&&(rt===null||rt.isXRRenderTarget===!0)&&($e=P.toneMapping);let Ve=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,Di=Ve!==void 0?Ve.length:0,It=G.get(k),ki=b.state.lights;if(ct===!0&&(dt===!0||w!==tt)){let We=w===tt&&k.id===Z;Vt.setState(k,w,We)}let Re=!1;k.version===It.__version?(It.needsLights&&It.lightsStateVersion!==ki.state.version||It.outputColorSpace!==Rt||V.isBatchedMesh&&It.batching===!1||!V.isBatchedMesh&&It.batching===!0||V.isBatchedMesh&&It.batchingColor===!0&&V._colorsTexture===null||V.isBatchedMesh&&It.batchingColor===!1&&V._colorsTexture!==null||V.isInstancedMesh&&It.instancing===!1||!V.isInstancedMesh&&It.instancing===!0||V.isSkinnedMesh&&It.skinning===!1||!V.isSkinnedMesh&&It.skinning===!0||V.isInstancedMesh&&It.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&It.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&It.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&It.instancingMorph===!1&&V.morphTexture!==null||It.envMap!==Gt||k.fog===!0&&It.fog!==Ct||It.numClippingPlanes!==void 0&&(It.numClippingPlanes!==Vt.numPlanes||It.numIntersection!==Vt.numIntersection)||It.vertexAlphas!==ue||It.vertexTangents!==Se||It.morphTargets!==zt||It.morphNormals!==Le||It.morphColors!==fi||It.toneMapping!==$e||It.morphTargetsCount!==Di||!!It.lightProbeGrid!=b.state.lightProbeGridArray.length>0)&&(Re=!0):(Re=!0,It.__version=k.version);let dn=It.currentProgram;Re===!0&&(dn=cs(k,U,V),N&&k.isNodeMaterial&&N.onUpdateProgram(k,dn,It));let zn=!1,ws=!1,Er=!1,He=dn.getUniforms(),hi=It.uniforms;if(E.useProgram(dn.program)&&(zn=!0,ws=!0,Er=!0),k.id!==Z&&(Z=k.id,ws=!0),It.needsLights){let We=Sl(b.state.lightProbeGridArray,V);It.lightProbeGrid!==We&&(It.lightProbeGrid=We,ws=!0)}if(zn||tt!==w){E.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),He.setValue(D,"projectionMatrix",w.projectionMatrix),He.setValue(D,"viewMatrix",w.matrixWorldInverse);let Rs=He.map.cameraPosition;Rs!==void 0&&Rs.setValue(D,mt.setFromMatrixPosition(w.matrixWorld)),C.logarithmicDepthBuffer&&He.setValue(D,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&He.setValue(D,"isOrthographic",w.isOrthographicCamera===!0),tt!==w&&(tt=w,ws=!0,Er=!0)}if(It.needsLights&&(ki.state.sunShadowMap.length>0&&He.setValue(D,"sunShadowMap",ki.state.sunShadowMap,J),ki.state.directionalShadowMap.length>0&&He.setValue(D,"directionalShadowMap",ki.state.directionalShadowMap,J),ki.state.spotShadowMap.length>0&&He.setValue(D,"spotShadowMap",ki.state.spotShadowMap,J),ki.state.pointShadowMap.length>0&&He.setValue(D,"pointShadowMap",ki.state.pointShadowMap,J)),V.isSkinnedMesh){He.setOptional(D,V,"bindMatrix"),He.setOptional(D,V,"bindMatrixInverse");let We=V.skeleton;We&&(We.boneTexture===null&&We.computeBoneTexture(),He.setValue(D,"boneTexture",We.boneTexture,J))}V.isBatchedMesh&&(He.setOptional(D,V,"batchingTexture"),He.setValue(D,"batchingTexture",V._matricesTexture,J),He.setOptional(D,V,"batchingIdTexture"),He.setValue(D,"batchingIdTexture",V._indirectTexture,J),He.setOptional(D,V,"batchingColorTexture"),V._colorsTexture!==null&&He.setValue(D,"batchingColorTexture",V._colorsTexture,J));let As=$.morphAttributes;if((As.position!==void 0||As.normal!==void 0||As.color!==void 0)&&F.update(V,$,dn),(ws||It.receiveShadow!==V.receiveShadow)&&(It.receiveShadow=V.receiveShadow,He.setValue(D,"receiveShadow",V.receiveShadow)),(k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial)&&k.envMap===null&&U.environment!==null&&(hi.envMapIntensity.value=U.environmentIntensity),hi.dfgLUT!==void 0&&(hi.dfgLUT.value=db()),ws){if(He.setValue(D,"toneMappingExposure",P.toneMappingExposure),It.needsLights&&Xo(hi,Er),Ct&&k.fog===!0&&kt.refreshFogUniforms(hi,Ct),kt.refreshMaterialUniforms(hi,k,j,X,b.state.transmissionRenderTarget[w.id]),It.needsLights&&It.lightProbeGrid){let We=It.lightProbeGrid;hi.probesSH.value=We.texture,hi.probesMin.value.copy(We.boundingBox.min),hi.probesMax.value.copy(We.boundingBox.max),hi.probesResolution.value.copy(We.resolution)}vo.upload(D,Go(It),hi,J)}if(k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(vo.upload(D,Go(It),hi,J),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&He.setValue(D,"center",V.center),He.setValue(D,"modelViewMatrix",V.modelViewMatrix),He.setValue(D,"normalMatrix",V.normalMatrix),He.setValue(D,"modelMatrix",V.matrixWorld),k.uniformsGroups!==void 0){let We=k.uniformsGroups;for(let Rs=0,Tr=We.length;Rs<Tr;Rs++){let Uf=We[Rs];at.update(Uf,dn),at.bind(Uf,dn)}}return dn}function Xo(w,U){w.ambientLightColor.needsUpdate=U,w.lightProbe.needsUpdate=U,w.sunLights.needsUpdate=U,w.sunLightShadows.needsUpdate=U,w.directionalLights.needsUpdate=U,w.directionalLightShadows.needsUpdate=U,w.pointLights.needsUpdate=U,w.pointLightShadows.needsUpdate=U,w.spotLights.needsUpdate=U,w.spotLightShadows.needsUpdate=U,w.rectAreaLights.needsUpdate=U,w.hemisphereLights.needsUpdate=U}function El(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return q},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return rt},this.setRenderTargetTextures=function(w,U,$){let k=G.get(w);k.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),G.get(w.texture).__webglTexture=U,G.get(w.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:$,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,U){let $=G.get(w);$.__webglFramebuffer=U,$.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(w,U=0,$=0){rt=w,q=U,Y=$;let k=null,V=!1,Ct=!1;if(w){let Rt=G.get(w);if(Rt.__useDefaultFramebuffer!==void 0){E.bindFramebuffer(D.FRAMEBUFFER,Rt.__webglFramebuffer),nt.copy(w.viewport),Lt.copy(w.scissor),Pt=w.scissorTest,E.viewport(nt),E.scissor(Lt),E.setScissorTest(Pt),Z=-1;return}else if(Rt.__webglFramebuffer===void 0)J.setupRenderTarget(w);else if(Rt.__hasExternalTextures)J.rebindTextures(w,G.get(w.texture).__webglTexture,G.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){let ue=w.depthTexture;if(Rt.__boundDepthTexture!==ue){if(ue!==null&&G.has(ue)&&(w.width!==ue.image.width||w.height!==ue.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");J.setupDepthRenderbuffer(w)}}let Ht=w.texture;(Ht.isData3DTexture||Ht.isDataArrayTexture||Ht.isCompressedArrayTexture)&&(Ct=!0);let Gt=G.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Gt[U])?k=Gt[U][$]:k=Gt[U],V=!0):w.samples>0&&J.useMultisampledRTT(w)===!1?k=G.get(w).__webglMultisampledFramebuffer:Array.isArray(Gt)?k=Gt[$]:k=Gt,nt.copy(w.viewport),Lt.copy(w.scissor),Pt=w.scissorTest}else nt.copy(Et).multiplyScalar(j).floor(),Lt.copy(Zt).multiplyScalar(j).floor(),Pt=ye;if($!==0&&(k=B),E.bindFramebuffer(D.FRAMEBUFFER,k)&&E.drawBuffers(w,k),E.viewport(nt),E.scissor(Lt),E.setScissorTest(Pt),V){let Rt=G.get(w.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+U,Rt.__webglTexture,$)}else if(Ct){let Rt=U;for(let Ht=0;Ht<w.textures.length;Ht++){let Gt=G.get(w.textures[Ht]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Ht,Gt.__webglTexture,$,Rt)}}else if(w!==null&&$!==0){let Rt=G.get(w.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Rt.__webglTexture,$)}Z=-1};function Yo(w){let U=G.get(w);return(U.__readFormat!==w.format||U.__readType!==w.type)&&(U.__readFormat=w.format,U.__readType=w.type,U.__formatReadable=C.textureFormatReadable(w.format),U.__typeReadable=C.textureTypeReadable(w.type)),U}this.readRenderTargetPixels=function(w,U,$,k,V,Ct,Dt,Rt=0){if(!(w&&w.isWebGLRenderTarget)){te("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ht=G.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Dt!==void 0&&(Ht=Ht[Dt]),Ht){E.bindFramebuffer(D.FRAMEBUFFER,Ht);try{let Gt=w.textures[Rt],ue=Gt.format,Se=Gt.type;w.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Rt);let zt=Yo(Gt);if(zt.__formatReadable===!1){te("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(zt.__typeReadable===!1){te("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=w.width-k&&$>=0&&$<=w.height-V&&D.readPixels(U,$,k,V,_t.convert(ue),_t.convert(Se),Ct)}finally{let Gt=rt!==null?G.get(rt).__webglFramebuffer:null;E.bindFramebuffer(D.FRAMEBUFFER,Gt)}}},this.readRenderTargetPixelsAsync=async function(w,U,$,k,V,Ct,Dt,Rt=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ht=G.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Dt!==void 0&&(Ht=Ht[Dt]),Ht)if(U>=0&&U<=w.width-k&&$>=0&&$<=w.height-V){E.bindFramebuffer(D.FRAMEBUFFER,Ht);let Gt=w.textures[Rt],ue=Gt.format,Se=Gt.type;w.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Rt);let zt=Yo(Gt);if(zt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(zt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Le=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Le),D.bufferData(D.PIXEL_PACK_BUFFER,Ct.byteLength,D.STREAM_READ),D.readPixels(U,$,k,V,_t.convert(ue),_t.convert(Se),0),D.bindBuffer(D.PIXEL_PACK_BUFFER,null);let fi=rt!==null?G.get(rt).__webglFramebuffer:null;E.bindFramebuffer(D.FRAMEBUFFER,fi);let $e=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await Kp(D,$e,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Le),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,Ct),D.bindBuffer(D.PIXEL_PACK_BUFFER,null),D.deleteBuffer(Le),D.deleteSync($e),Ct}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,U=null,$=0){let k=Math.pow(2,-$),V=Math.floor(w.image.width*k),Ct=Math.floor(w.image.height*k),Dt=U!==null?U.x:0,Rt=U!==null?U.y:0;J.setTexture2D(w,0),D.copyTexSubImage2D(D.TEXTURE_2D,$,0,0,Dt,Rt,V,Ct),E.unbindTexture()},this.copyTextureToTexture=function(w,U,$=null,k=null,V=0,Ct=0){let Dt,Rt,Ht,Gt,ue,Se,zt,Le,fi,$e=w.isCompressedTexture?w.mipmaps[Ct]:w.image;if($!==null)Dt=$.max.x-$.min.x,Rt=$.max.y-$.min.y,Ht=$.isBox3?$.max.z-$.min.z:1,Gt=$.min.x,ue=$.min.y,Se=$.isBox3?$.min.z:0;else{let hi=Math.pow(2,-V);Dt=Math.floor($e.width*hi),Rt=Math.floor($e.height*hi),w.isDataArrayTexture?Ht=$e.depth:w.isData3DTexture?Ht=Math.floor($e.depth*hi):Ht=1,Gt=0,ue=0,Se=0}k!==null?(zt=k.x,Le=k.y,fi=k.z):(zt=0,Le=0,fi=0);let Ve=_t.convert(U.format),Di=_t.convert(U.type),It;U.isData3DTexture?(J.setTexture3D(U,0),It=D.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(J.setTexture2DArray(U,0),It=D.TEXTURE_2D_ARRAY):(J.setTexture2D(U,0),It=D.TEXTURE_2D),E.activeTexture(D.TEXTURE0),E.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),E.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),E.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);let ki=E.getParameter(D.UNPACK_ROW_LENGTH),Re=E.getParameter(D.UNPACK_IMAGE_HEIGHT),dn=E.getParameter(D.UNPACK_SKIP_PIXELS),zn=E.getParameter(D.UNPACK_SKIP_ROWS),ws=E.getParameter(D.UNPACK_SKIP_IMAGES);E.pixelStorei(D.UNPACK_ROW_LENGTH,$e.width),E.pixelStorei(D.UNPACK_IMAGE_HEIGHT,$e.height),E.pixelStorei(D.UNPACK_SKIP_PIXELS,Gt),E.pixelStorei(D.UNPACK_SKIP_ROWS,ue),E.pixelStorei(D.UNPACK_SKIP_IMAGES,Se);let Er=w.isDataArrayTexture||w.isData3DTexture,He=U.isDataArrayTexture||U.isData3DTexture;if(w.isDepthTexture){let hi=G.get(w),As=G.get(U),We=G.get(hi.__renderTarget),Rs=G.get(As.__renderTarget);E.bindFramebuffer(D.READ_FRAMEBUFFER,We.__webglFramebuffer),E.bindFramebuffer(D.DRAW_FRAMEBUFFER,Rs.__webglFramebuffer);for(let Tr=0;Tr<Ht;Tr++)Er&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,G.get(w).__webglTexture,V,Se+Tr),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,G.get(U).__webglTexture,Ct,fi+Tr)),D.blitFramebuffer(Gt,ue,Dt,Rt,zt,Le,Dt,Rt,D.DEPTH_BUFFER_BIT,D.NEAREST);E.bindFramebuffer(D.READ_FRAMEBUFFER,null),E.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(V!==0||w.isRenderTargetTexture||G.has(w)){let hi=G.get(w),As=G.get(U);E.bindFramebuffer(D.READ_FRAMEBUFFER,L),E.bindFramebuffer(D.DRAW_FRAMEBUFFER,O);for(let We=0;We<Ht;We++)Er?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,hi.__webglTexture,V,Se+We):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,hi.__webglTexture,V),He?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,As.__webglTexture,Ct,fi+We):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,As.__webglTexture,Ct),V!==0?D.blitFramebuffer(Gt,ue,Dt,Rt,zt,Le,Dt,Rt,D.COLOR_BUFFER_BIT,D.NEAREST):He?D.copyTexSubImage3D(It,Ct,zt,Le,fi+We,Gt,ue,Dt,Rt):D.copyTexSubImage2D(It,Ct,zt,Le,Gt,ue,Dt,Rt);E.bindFramebuffer(D.READ_FRAMEBUFFER,null),E.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else He?w.isDataTexture||w.isData3DTexture?D.texSubImage3D(It,Ct,zt,Le,fi,Dt,Rt,Ht,Ve,Di,$e.data):U.isCompressedArrayTexture?D.compressedTexSubImage3D(It,Ct,zt,Le,fi,Dt,Rt,Ht,Ve,$e.data):D.texSubImage3D(It,Ct,zt,Le,fi,Dt,Rt,Ht,Ve,Di,$e):w.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,Ct,zt,Le,Dt,Rt,Ve,Di,$e.data):w.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,Ct,zt,Le,$e.width,$e.height,Ve,$e.data):D.texSubImage2D(D.TEXTURE_2D,Ct,zt,Le,Dt,Rt,Ve,Di,$e);E.pixelStorei(D.UNPACK_ROW_LENGTH,ki),E.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Re),E.pixelStorei(D.UNPACK_SKIP_PIXELS,dn),E.pixelStorei(D.UNPACK_SKIP_ROWS,zn),E.pixelStorei(D.UNPACK_SKIP_IMAGES,ws),Ct===0&&U.generateMipmaps&&D.generateMipmap(It),E.unbindTexture()},this.initRenderTarget=function(w){G.get(w).__webglFramebuffer===void 0&&J.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?J.setTextureCube(w,0):w.isData3DTexture?J.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?J.setTexture2DArray(w,0):J.setTexture2D(w,0),E.unbindTexture()},this.resetState=function(){q=0,Y=0,rt=null,E.reset(),At.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Cn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=_e._getDrawingBufferColorSpace(t),e.unpackColorSpace=_e._getUnpackColorSpace()}};var ll=.008333333333333333,Oi=650,Ft={halfX:4096,halfZ:5120,height:2044,chamfer:1150,cornerR:400,rampR:280,goalHalfW:893,goalH:642,goalDepth:880},Ne={radius:93,mass:30,maxSpeed:6e3,maxSpin:6,drag:.0305,restitution:.6,friction:.285},Nt={mass:180,restHeight:17,hitboxHalf:{x:42.1,y:18.08,z:59},hitboxOffset:{x:0,y:20.75,z:13.88},wheels:[{x:25.9,z:51.25,r:12.5,front:!0},{x:-25.9,z:51.25,r:12.5,front:!0},{x:29.5,z:-33.75,r:15,front:!1},{x:-29.5,z:-33.75,r:15,front:!1}],maxSpeed:2300,maxDriveSpeed:1410,supersonic:2200,boostAccelGround:991.67,boostAccelAir:1058.33,boostUsePerSec:33.3,brakeAccel:3500,coastDecel:525,airThrottleAccel:66.67,jumpImpulse:291.67,jumpHoldAccel:1458.33,jumpHoldTime:.2,doubleJumpWindow:1.25,dodgeImpulse:500,dodgeTime:.65,stickyAccel:325,maxAngVel:5.5,airRoll:36.08,airPitch:12.15,airYaw:8.92,dampRoll:4.47,dampPitch:2.8,dampYaw:1.89},kd=33,Ih=[[-3584,0],[3584,0],[-3072,-4096],[3072,-4096],[-3072,4096],[3072,4096]],Lh=[[0,-4240],[-1792,-4184],[1792,-4184],[-940,-3308],[940,-3308],[0,-2816],[-3584,-2484],[3584,-2484],[-1788,-2300],[1788,-2300],[-2048,-1036],[0,-1024],[2048,-1036],[-1024,0],[1024,0],[-2048,1036],[0,1024],[2048,1036],[-1788,2300],[1788,2300],[-3584,2484],[3584,2484],[0,2816],[-940,3310],[940,3308],[-1792,4184],[1792,4184],[0,4240]],Um=[[-2048,-2560,Math.PI/4],[2048,-2560,-Math.PI/4],[-256,-3840,0],[256,-3840,0],[0,-4608,0]],Vd=[[-2304,-4608,0],[-2688,-4608,0],[2304,-4608,0],[2688,-4608,0]],Ie={0:{main:1010687,light:6272255,dark:670362,css:"#2f7bff",flame:[.55,.85,1],flameEnd:[.1,.3,1]},1:{main:16738834,light:16756832,dark:9054720,css:"#ff7a1a",flame:[1,.85,.45],flameEnd:[1,.28,.04]}};var Gd=30,Gs=new T;function di(s,t,e,i){let n=document.createElement(s);return t&&(n.className=t),i!==void 0&&(n.innerHTML=i),e&&e.appendChild(n),n}function fb(){let r=270/Gd,o="";for(let a=0;a<Gd;a++){let l=(135+a*r+.8)*Math.PI/180,c=(135+(a+1)*r-.8)*Math.PI/180,h=100+Math.cos(l)*84,u=100+Math.sin(l)*84,d=100+Math.cos(c)*84,f=100+Math.sin(c)*84;o+=`<path class="seg" d="M${h.toFixed(2)} ${u.toFixed(2)} A84 84 0 0 1 ${d.toFixed(2)} ${f.toFixed(2)}"/>`}return`<svg viewBox="0 0 200 200" class="boost-svg">
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
  </svg>`}var Dh=class{constructor(t){this.root=t,t.innerHTML="";let e=di("div","scoreboard",t);this.sbBlue=di("div","sb-team sb-blue",e,"<span>0</span>");let i=di("div","sb-clock",e);this.sbTime=di("div","sb-time",i,"5:00"),this.sbOT=di("div","sb-ot",i,""),this.sbOrange=di("div","sb-team sb-orange",e,"<span>0</span>"),this.viewsEl=di("div","hud-views",t),this.banner=di("div","banner",t),this.bannerMain=di("div","banner-main",this.banner),this.bannerSub=di("div","banner-sub",this.banner),this.feed=di("div","feed",t),this.fps=di("div","fps",t),this.views=[],this.bannerTimer=0,this.lastScores=[-1,-1],this.lastTime=""}show(t){this.root.classList.toggle("hidden",!t)}setup(t){this.viewsEl.innerHTML="",this.views=t.map(e=>{let i=di("div","hud-view",this.viewsEl);i.style.left=e.rect[0]*100+"%",i.style.top=e.rect[1]*100+"%",i.style.width=e.rect[2]*100+"%",i.style.height=e.rect[3]*100+"%",t.length>1&&i.classList.add("split");let n=di("div","boost-gauge",i,fb()),r=t.length>1?di("div","player-tag",i,e.label):null;r&&(r.style.color=Ie[e.team].css);let o=di("div","item-slot hidden",i);o.innerHTML='<div class="item-icon"></div><div class="item-text"><div class="item-name"></div><div class="item-key"></div></div><div class="item-bar"><div></div></div>';let a=di("div","view-status",i),l=di("div","view-center",i),c=di("div","plates",i);return{box:i,gauge:n,status:a,center:l,plates:c,plateMap:new Map,item:o,itemIcon:o.querySelector(".item-icon"),itemName:o.querySelector(".item-name"),itemKey:o.querySelector(".item-key"),itemBar:o.querySelector(".item-bar div"),itemSig:"",segs:Array.from(n.querySelectorAll(".seg")),num:n.querySelector(".boost-num"),lastBoost:-1,statusTimer:0,centerTimer:0}})}setScore(t,e){t!==this.lastScores[0]&&(this.sbBlue.firstChild.textContent=t,this.pulse(this.sbBlue)),e!==this.lastScores[1]&&(this.sbOrange.firstChild.textContent=e,this.pulse(this.sbOrange)),this.lastScores=[t,e]}pulse(t){this.lastScores[0]<0||(t.classList.remove("pulse"),t.offsetWidth,t.classList.add("pulse"))}setClock(t,e,i){let n;if(i)n="\u221E";else{let r=Math.max(0,e?Math.floor(t):Math.ceil(t));n=`${e?"+":""}${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`}n!==this.lastTime&&(this.sbTime.textContent=n,this.lastTime=n),this.sbOT.textContent=e?"OVERTIME":""}setBoost(t,e){let i=this.views[t];if(!i)return;let n=Math.round(e);if(n===i.lastBoost)return;i.lastBoost=n,i.num.textContent=n;let r=Math.ceil(e/100*Gd-.001);i.segs.forEach((o,a)=>o.classList.toggle("on",a<r)),i.gauge.classList.toggle("empty",n===0),i.gauge.classList.toggle("full",n===100)}setItem(t,e,i,n){let r=this.views[t];if(!r)return;if(!e){r.item.classList.add("hidden");return}r.item.classList.remove("hidden");let o=`${e.item}|${e.active}|${n}|${e.item?"":Math.ceil(e.next||0)}`;if(o!==r.itemSig){r.itemSig=o;let a=e.item?i[e.item]:null;r.item.classList.toggle("ready",!!e.item&&!e.active),r.item.classList.toggle("active",!!e.active),r.item.classList.toggle("empty",!e.item),r.itemIcon.textContent=a?a.icon:"\u23F3",r.itemName.textContent=a?a.name:"Power-up",r.itemKey.innerHTML=e.item?e.active?"active":`press <b>${n}</b>`:`next in ${Math.ceil(e.next||0)}s`}r.itemBar.style.transform=`scaleX(${e.active?e.frac:e.item?1:0})`}viewStatus(t,e,i=1.6){let n=this.views[t];n&&(n.status.textContent=e,n.status.classList.add("visible"),n.statusTimer=i)}viewCenter(t,e,i=2){let n=this.views[t];n&&(n.center.textContent=e,n.center.classList.add("visible"),n.centerTimer=i)}showBanner(t,e="",i="",n=2){this.bannerMain.textContent=t,this.bannerSub.textContent=e,this.banner.className="banner visible "+i,this.bannerTimer=n}hideBanner(){this.banner.className="banner",this.bannerTimer=0}addFeed(t,e=-1){let i=di("div","feed-item"+(e>=0?" team"+e:""),this.feed,t);for(setTimeout(()=>i.classList.add("fade"),3500),setTimeout(()=>i.remove(),4200);this.feed.children.length>5;)this.feed.firstChild.remove()}updatePlates(t,e,i,n){let r=this.views[t];if(!r)return;let o=r.box.clientWidth,a=r.box.clientHeight,l=new Set;for(let c of i){if(c.car===n||c.car.demolished||(Gs.set(c.pos.x*.01,(c.pos.y+95)*.01,c.pos.z*.01).project(e),Gs.z>1||Gs.z<-1||Math.abs(Gs.x)>1.1||Math.abs(Gs.y)>1.1))continue;let h=r.plateMap.get(c.car.id);h||(h=di("div","plate team"+c.car.team,r.plates,c.name),r.plateMap.set(c.car.id,h));let u=(Gs.x+1)/2*o,d=(1-Gs.y)/2*a,f=e.position.distanceTo(Gs.set(c.pos.x*.01,c.pos.y*.01,c.pos.z*.01));h.style.transform=`translate(${u.toFixed(1)}px, ${d.toFixed(1)}px) translate(-50%, -100%) scale(${Math.max(.55,Math.min(1,12/f)).toFixed(3)})`,h.style.display="",l.add(c.car.id)}for(let[c,h]of r.plateMap)l.has(c)||(h.style.display="none")}update(t){this.bannerTimer>0&&(this.bannerTimer-=t,this.bannerTimer<=0&&this.banner.classList.remove("visible"));for(let e of this.views)e.statusTimer>0&&(e.statusTimer-=t,e.statusTimer<=0&&e.status.classList.remove("visible")),e.centerTimer>0&&(e.centerTimer-=t,e.centerTimer<=0&&e.center.classList.remove("visible"))}setFps(t){this.fps.textContent=t}};var zm=Ft.halfZ,pb=Ft.goalHalfW,mb=Ft.goalH,Wd=Ne.radius,ke=new T,Fm=new T,Bm=new T,Om=new he,qd=s=>(s===0?1:-1)*(zm+450),Nh=class{reset(){}preStep(){}preBall(){}onTouch(){}postStep(){}},Xd=class extends Nh{constructor(t){super(),this.world=t,this.name="heatseeker",this.reset(),t.ball.force=(e,i)=>this.force(e,i)}reset(){this.team=-1,this.speed=0,this.lastBoost=-10,this.lastFlip=-10}onTouch(t){let e=this.world.time;(t.team!==this.team||e-this.lastBoost>.5)&&(this.speed=Math.min(4200,Math.max(1500,this.speed+160)),this.lastBoost=e),this.team=t.team}force(t,e){if(this.team<0)return;ke.set(0,330,qd(this.team)).sub(t.pos);let i=ke.length();i<1||(ke.multiplyScalar(this.speed/i),t.vel.y+=Oi*e*.92,t.vel.lerp(ke,1-Math.exp(-e*1.5)))}postStep(){if(this.team<0)return;let t=this.world.ball,e=(this.team===0?1:-1)*zm,i=Math.abs(t.pos.z-e)<Wd+40,n=Math.abs(t.pos.x)<pb&&t.pos.y<mb;i&&!n&&this.world.time-this.lastFlip>.6&&(this.team=1-this.team,this.lastFlip=this.world.time,this.world.events.push({type:"heatseekFlip",point:t.pos.clone()}))}},cl={grapple:{name:"Grappling Hook",icon:"\u{1FA9D}",hint:"Pulls you to the ball"},plunger:{name:"Plunger",icon:"\u{1FAA0}",hint:"Pulls the ball to you"},tornado:{name:"Tornado",icon:"\u{1F32A}\uFE0F",hint:"Spins up everything near you"},curveball:{name:"Curveball",icon:"\u{1F300}",hint:"Curves the ball into their goal"},spikes:{name:"Spikes",icon:"\u{1F4CC}",hint:"The ball sticks to your car"},boot:{name:"Boot",icon:"\u{1F462}",hint:"Kicks the nearest opponent away"},power:{name:"Power Hitter",icon:"\u{1F4A5}",hint:"Huge hits and demolish on contact"},freezer:{name:"Freezer",icon:"\u2744\uFE0F",hint:"Freezes the ball in place"}},_o=Object.keys(cl),Hm={grapple:4200,plunger:4200,curveball:5e3,freezer:6e3,boot:4500},Yd=class extends Nh{constructor(t,e=_o){super(),this.world=t,this.name="rumble",this.pool=e.length?e:_o,this.state=new Map,this.curve=null,this.reset()}st(t){let e=this.state.get(t);return e||(e={item:null,timer:3,held:0,active:null,prevUse:!1},this.state.set(t,e)),e}reset(){for(let t of this.world.cars){let e=this.st(t);this.endActive(t,e),e.item=null,e.timer=2+Math.random()*3,e.prevUse=!!t.input.useItem}this.curve=null,this.world.ball.iceTimer=0,this.world.ball.attachedTo=null}give(t,e){e.item=this.pool[Math.floor(Math.random()*this.pool.length)],e.held=0,this.world.events.push({type:"itemGet",car:t,item:e.item})}inRange(t,e){let i=Hm[e];return i?e==="boot"?!!this.nearestOpponent(t,i):t.pos.distanceTo(this.world.ball.pos)<i:!0}nearestOpponent(t,e){let i=null,n=e;for(let r of this.world.cars){if(r.team===t.team||r.demolished)continue;let o=r.pos.distanceTo(t.pos);o<n&&(n=o,i=r)}return i}use(t){let e=this.st(t);if(!e.item||e.active||t.demolished||this.world.ball.frozen)return!1;let i=e.item;if(!this.inRange(t,i))return this.world.events.push({type:"itemFail",car:t,item:i}),!1;e.item=null;let n=this.world,r=n.ball;switch(i){case"grapple":case"plunger":e.active={type:i,phase:"shoot",t:0,hook:t.pos.clone()};break;case"tornado":e.active={type:"tornado",t:0,dur:5.5};break;case"spikes":e.active={type:"spikes",t:0,dur:10,offset:null};break;case"power":e.active={type:"power",t:0,dur:8},t.hitPower=1.8;break;case"curveball":this.curve={team:t.team,t:4},r.vel.length()<1200&&(r.vel.addScaledVector(ke.set(0,0,Math.sign(qd(t.team))),900),r.vel.y+=250),e.timer=9;break;case"freezer":r.iceTimer=3.5,r.vel.set(0,0,0),e.timer=9;break;case"boot":{let o=this.nearestOpponent(t,Hm.boot);ke.copy(o.pos).sub(t.pos).setY(0).normalize(),o.vel.addScaledVector(ke,1700),o.vel.y+=1050,o.noGround=.25,o.onGround=!1,o.angVel.set(Math.random()-.5,0,Math.random()-.5).multiplyScalar(8),n.events.push({type:"boot",car:o,by:t,point:o.pos.clone()}),e.timer=9;break}default:break}return n.events.push({type:"itemUse",car:t,item:i}),!0}endActive(t,e){let i=e.active;i&&(i.type==="power"&&(t.hitPower=1),i.type==="spikes"&&this.world.ball.attachedTo===t&&this.release(t,!1),e.active=null,e.timer=8+Math.random()*3)}release(t,e){let i=this.world.ball;i.attachedTo===t&&(i.attachedTo=null,e&&(t.forward(Bm),i.vel.copy(t.vel).addScaledVector(Bm,950),i.vel.y+=250))}preStep(t){let e=this.world,i=e.ball;for(let n of e.cars){let r=this.st(n),o=!!n.input.useItem&&!r.prevUse;if(r.prevUse=!!n.input.useItem,n.demolished){r.active&&this.endActive(n,r);continue}o&&this.use(n),!r.item&&!r.active&&(r.timer-=t,r.timer<=0&&!i.frozen&&this.give(n,r)),r.item&&(r.held+=t);let a=r.active;if(a)switch(a.t+=t,a.type){case"grapple":case"plunger":{if(a.phase==="shoot"){ke.copy(i.pos).sub(a.hook);let l=ke.length(),c=6e3*t;l<=c+Wd?(a.hook.copy(i.pos),a.phase="pull",a.pullT=0,e.events.push({type:"hooked",car:n,item:a.type,point:i.pos.clone()})):a.hook.addScaledVector(ke,c/l),a.t>1&&a.phase==="shoot"&&this.endActive(n,r)}else{a.pullT+=t,a.hook.copy(i.pos),ke.copy(i.pos).sub(n.pos);let l=ke.length();ke.divideScalar(Math.max(1,l)),a.type==="grapple"?(n.vel.addScaledVector(ke,5400*t),n.vel.y+=Oi*.6*t,n.noGround=.12,(l<230||a.pullT>2)&&this.endActive(n,r)):(i.vel.addScaledVector(ke,-6800*t),i.vel.y+=Oi*.5*t,(l<380||a.pullT>1.8)&&this.endActive(n,r))}break}case"tornado":{let c=(h,u)=>{ke.copy(h.pos).sub(n.pos);let d=Math.hypot(ke.x,ke.z);if(d>1050||h.pos.y>2200)return!1;let f=1-d/1050;return Fm.set(-ke.z,0,ke.x).normalize(),h.vel.addScaledVector(Fm,2e3*f*t*u),h.vel.y+=(Oi+900*f+150)*t*u,d>1&&h.vel.addScaledVector(ke.set(ke.x/d,0,ke.z/d),-700*f*t*u),!0};!i.attachedTo&&i.iceTimer<=0&&c(i,1);for(let h of e.cars)h===n||h.demolished||c(h,.85)&&(h.noGround=.1,h.onGround=!1);a.t>a.dur&&this.endActive(n,r);break}case"spikes":case"power":a.t>a.dur&&this.endActive(n,r);break;default:break}}if(this.curve&&!i.attachedTo&&i.iceTimer<=0){this.curve.t-=t;let n=Math.hypot(i.vel.x,i.vel.z);ke.set(-i.pos.x,0,qd(this.curve.team)-i.pos.z).normalize();let r=Math.atan2(i.vel.x,i.vel.z),a=Math.atan2(ke.x,ke.z)-r;for(;a>Math.PI;)a-=Math.PI*2;for(;a<-Math.PI;)a+=Math.PI*2;let l=Math.sign(a)*Math.min(Math.abs(a),2.2*t),c=Math.max(n,1500);i.vel.x=Math.sin(r+l)*c,i.vel.z=Math.cos(r+l)*c,this.curve.t<=0&&(this.curve=null)}}preBall(){let t=this.world.ball,e=t.attachedTo;if(!e)return;let i=this.st(e);if(!i.active||i.active.type!=="spikes"||e.demolished){this.release(e,!1);return}t.prevPos.copy(t.pos),ke.copy(i.active.offset).applyQuaternion(e.quat),t.pos.copy(e.pos).add(ke),t.vel.copy(e.vel)}onTouch(t){let e=this.world.ball;e.iceTimer>0&&(e.iceTimer=0),this.curve&&this.curve.team!==t.team&&(this.curve=null),e.attachedTo&&e.attachedTo!==t&&this.release(e.attachedTo,!1);let i=this.st(t);if(i.active&&i.active.type==="spikes"&&!e.attachedTo){Om.copy(t.quat).invert();let n=e.pos.clone().sub(t.pos).applyQuaternion(Om);n.setLength(Math.max(n.length(),Wd+52)),i.active.offset=n,e.attachedTo=t,e.lastTouch=t}}postStep(){let t=this.world.ball;if(t.attachedTo)for(let e of this.world.events){if(e.type==="dodge"&&e.car===t.attachedTo){this.release(e.car,!0);break}if(e.type==="bump"&&e.car===t.attachedTo){this.release(e.car,!1);break}}}status(t){let e=this.st(t);if(e.active){let i=e.active,n=i.dur?Math.max(0,1-i.t/i.dur):1;return{item:i.type,active:!0,frac:n}}return e.item?{item:e.item,active:!1,frac:1}:{item:null,active:!1,frac:0,next:Math.max(0,e.timer)}}};function km(s,t,e){return t==="heatseeker"?new Xd(s):t==="rumble"?new Yd(s,e):null}function li(s,t,e,i){let n=document.createElement(s);return t&&(n.className=t),i!==void 0&&(n.innerHTML=i),e&&e.appendChild(n),n}var gb={solo:{title:"PLAY vs CPU",humans:1},versus:{title:"2 PLAYERS \u2014 VERSUS",humans:2},coop:{title:"2 PLAYERS \u2014 CO-OP vs CPU",humans:2}},Vm=`
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
</div>`,Uh=class{constructor(t,e){this.app=t,this.root=e,this.visible=!1,this.items=[],this.focus=0,this.screen=null,this.joinSlots=[null,null],e.addEventListener("mousemove",()=>{this.mouse=!0})}hide(){this.visible=!1,this.root.classList.add("hidden"),this.root.innerHTML="",this.screen=null}show(t,e){this.visible=!0,this.root.classList.remove("hidden"),this.root.innerHTML="",this.root.className="menu screen-"+t,this.screen=t,this.data=e,this.items=[],this.focus=0,this.onBack=null,this.custom=null,this["screen_"+t].call(this,e),this.refreshFocus()}panel(t,e){let i=li("div","panel",this.root);return t&&li("div","panel-title",i,t),e&&li("div","panel-sub",i,e),i}button(t,e,i,n=""){let r=li("div","item button "+n,t,`<span>${e}</span>`),o={el:r,type:"button",action:i};return r.addEventListener("click",()=>{this.focus=this.items.indexOf(o),this.activate()}),r.addEventListener("mouseenter",()=>{this.focus=this.items.indexOf(o),this.refreshFocus()}),this.items.push(o),o}option(t,e,i,n,r){let o=li("div","item option",t);li("span","opt-label",o,e);let a=li("span","opt-ctl",o),l=li("span","arrow",a,"\u25C0"),c=li("span","opt-value",a),h=li("span","arrow",a,"\u25B6"),u={el:o,type:"option",values:i,get:n,set:r,val:c},d=()=>{let f=n(),g=i.find(v=>v.value===f)||i[0];c.textContent=g.label};return u.render=d,u.change=f=>{let g=n(),v=i.findIndex(p=>p.value===g);v=(v+f+i.length)%i.length,r(i[v].value),d(),this.app.audio.click(),this.onOptionChange&&this.onOptionChange()},l.addEventListener("click",f=>{f.stopPropagation(),u.change(-1)}),h.addEventListener("click",f=>{f.stopPropagation(),u.change(1)}),o.addEventListener("click",()=>u.change(1)),o.addEventListener("mouseenter",()=>{this.focus=this.items.indexOf(u),this.refreshFocus()}),d(),this.items.push(u),u}refreshFocus(){this.items.forEach((t,e)=>t.el.classList.toggle("focused",e===this.focus))}activate(){let t=this.items[this.focus];t&&(t.type==="button"?(this.app.audio.select(),t.action()):t.type==="option"&&t.change(1))}update(t){if(!this.visible||this.custom&&this.custom(t))return;let e=this.items.length;t.up&&e&&(this.focus=(this.focus-1+e)%e,this.refreshFocus(),this.app.audio.click()),t.down&&e&&(this.focus=(this.focus+1)%e,this.refreshFocus(),this.app.audio.click());let i=this.items[this.focus];i&&i.type==="option"&&(t.left&&i.change(-1),t.right&&i.change(1)),t.confirm&&this.activate(),t.back&&this.onBack&&(this.app.audio.click(),this.onBack()),t.start&&this.onStart&&this.onStart()}screen_main(){let t=li("div","logo",this.root);t.innerHTML='<div class="logo-top">ROCKET</div><div class="logo-bottom">ARENA</div><div class="logo-tag">supersonic car soccer</div>';let e=this.panel();e.classList.add("main-panel"),this.button(e,"\u25B6  PLAY vs CPU",()=>this.show("setup","solo"),"primary"),this.button(e,"\u{1F465}  2 PLAYERS \u2014 VERSUS",()=>this.show("setup","versus")),this.button(e,"\u{1F91D}  2 PLAYERS \u2014 CO-OP vs CPU",()=>this.show("setup","coop")),this.button(e,"\u2699  SETTINGS",()=>this.show("settings")),this.button(e,"\u{1F3AE}  CONTROLS",()=>this.show("controls")),this.button(e,"\u26F6  FULLSCREEN",()=>this.app.toggleFullscreen());let i=li("div","footer",this.root);this.padStatus(i)}padStatus(t){let e=()=>{let i=this.app.input.connectedPads();if(this.app.input.gamepadBlocked){t.innerHTML='<span class="footer-hint warn">\u26A0\uFE0F Controllers are blocked on this page. Keyboard &amp; mouse work. For controllers, open the game from its own web address.</span>';return}t.innerHTML=i.length?i.map((n,r)=>`<span class="pad-chip">\u{1F3AE} ${gu(n.id)} ${r+1}</span>`).join("")+'<span class="footer-hint">\u24B6 select \xB7 \u24B7 back</span>':'<span class="footer-hint">Connect an Xbox controller and press any button \xB7 or use mouse / keyboard (Enter to select)</span>'};e(),this.footerTimer=setInterval(()=>{t.isConnected?e():clearInterval(this.footerTimer)},1e3)}screen_setup(t){let e=this.app.settings,i=gb[t],n=this.panel(i.title,t==="solo"?"You (blue) vs CPU (orange)":t==="versus"?"Player 1 (blue) vs Player 2 (orange) \xB7 split screen":"Player 1 & Player 2 (blue) vs CPU (orange) \xB7 split screen"),r=t==="coop"?[{label:"2 vs 2",value:2},{label:"3 vs 3",value:3}]:[{label:"1 vs 1",value:1},{label:"2 vs 2",value:2},{label:"3 vs 3",value:3}],o="teamSize_"+t;r.some(l=>l.value===e[o])||(e[o]=r[0].value),this.option(n,"Game mode",[{label:"Soccar",value:"soccar"},{label:"Heatseeker (ball homes in)",value:"heatseeker"},{label:"Rumble (power-ups)",value:"rumble"}],()=>e.gameMode,l=>{e.gameMode=l}),this.option(n,"Power-ups (Rumble)",[{label:"All, random",value:"all"}].concat(_o.map(l=>({label:`${cl[l].name} only`,value:l}))),()=>e.items,l=>{e.items=l}),this.option(n,"Team size",r,()=>e[o],l=>{e[o]=l}),this.option(n,"Match length",[{label:"3 minutes",value:180},{label:"5 minutes",value:300},{label:"7 minutes",value:420},{label:"1 minute",value:60},{label:"Unlimited",value:0}],()=>e.duration,l=>{e.duration=l}),this.option(n,"CPU skill",[{label:"Rookie",value:"rookie"},{label:"Pro",value:"pro"},{label:"All-Star",value:"allstar"}],()=>e.difficulty,l=>{e.difficulty=l}),this.option(n,"Stadium",[{label:"Night",value:"night"},{label:"Sunset",value:"sunset"}],()=>e.timeOfDay,l=>{e.timeOfDay=l}),t!=="solo"&&this.option(n,"Split screen",[{label:"Top / Bottom",value:"horizontal"},{label:"Side by side",value:"vertical"}],()=>e.split,l=>{e.split=l});let a=()=>{this.app.saveSettings(),t==="solo"?this.app.startMatch({mode:t,gameMode:e.gameMode,items:e.items,teamSize:e[o],duration:e.duration,difficulty:e.difficulty,split:e.split,humans:[{device:{type:"any"},team:0,name:"You"}]}):this.show("join",t)};this.button(n,t==="solo"?"\u25B6  KICK OFF":"\u25B6  CONTINUE",a,"primary"),this.button(n,"\u25C0  BACK",()=>this.show("main")),this.onBack=()=>this.show("main"),this.focus=this.items.length-2}screen_join(t){let e=this.app.settings,i=this.app.input,n=this.panel("PRESS TO JOIN","Controller players press <b>\u24B6</b>. The keyboard &amp; mouse player clicks a slot or presses <b>Space</b>."),r=li("div","join-blocked",n),o=li("div","join-slots",n);this.joinSlots=[null,null];let a=(p,m)=>p&&m&&p.type===m.type&&(p.type==="pad"?p.index===m.index:p.layout===m.layout),l=p=>p.type==="pad"?"\u{1F3AE} "+gu(i.pads[p.index]?.id):p.layout==="p1"?"\u2328\uFE0F\u{1F5B1}\uFE0F Keyboard &amp; Mouse":"\u2328\uFE0F Keyboard (arrow keys)",c=()=>!!(this.joinSlots[0]&&this.joinSlots[1]),h=()=>{},u=(p,m)=>{if(this.joinSlots.some(M=>a(M,p)))return!1;let x=m>=0&&!this.joinSlots[m]?m:this.joinSlots.findIndex(M=>!M);return x<0?!1:(this.joinSlots[x]=p,this.app.audio.select(),p.type==="pad"&&i.rumble(p,.5,.5,150),h(),!0)},d=[0,1].map(p=>{let m=t==="versus"?p:0,x=li("div","join-slot team"+m,o);li("div","join-title",x,`PLAYER ${p+1}`);let M=li("div","join-body",x);return x.addEventListener("click",()=>{this.joinSlots[p]||u({type:"kb",layout:"p1"},p)||u({type:"kb",layout:"p2"},p)}),{box:x,body:M,team:m}}),f=li("div","join-status",n),g=()=>{if(!c())return;let p=this.joinSlots.map((x,M)=>({device:x,team:t==="versus"?M:0,name:`Player ${M+1}`})),m=e["teamSize_"+t];this.app.startMatch({mode:t,gameMode:e.gameMode,items:e.items,teamSize:m,duration:e.duration,difficulty:e.difficulty,split:e.split,humans:p})},v=this.button(n,"\u25B6  START MATCH",g,"primary");this.button(n,"\u25C0  BACK",()=>this.show("setup",t)),h=()=>{d.forEach((p,m)=>{let x=this.joinSlots[m];if(p.box.classList.toggle("joined",!!x),p.box.classList.toggle("clickable",!x),x){let M=x.type==="pad"?"Press \u24B7 to leave":"Press Backspace to leave";p.body.innerHTML=`<div class="join-device">${l(x)}</div><div class="join-team" style="color:${Ie[p.team].css}">${p.team===0?"BLUE":"ORANGE"} TEAM</div><div class="join-leave">${M}</div>`}else p.body.innerHTML='<div class="join-wait">Press <b>\u24B6</b> on a controller<br><span><b>Click here</b> or press <b>Space</b> for keyboard &amp; mouse</span></div>'}),f.innerHTML=c()?"<b>Ready!</b> Press <b>\u24B6</b>, <b>Start</b>, <b>Enter</b> or click <b>Start match</b>":"Waiting for players\u2026",f.classList.toggle("ready",c()),v.el.classList.toggle("hidden",!c()),r.innerHTML=i.gamepadBlocked?"\u26A0\uFE0F This page is not allowed to read game controllers, so only keyboard &amp; mouse work here. To play with a controller, open the game from its own web address (GitHub Pages) or from the downloaded <b>index.html</b>.":"",r.classList.toggle("hidden",!i.gamepadBlocked)},h(),this.custom=p=>{for(let x of i.connectedPads()){let M={type:"pad",index:x.index},y=this.joinSlots.findIndex(S=>a(S,M));if(x.pressed("a")||x.pressed("menu")){if(y<0)u(M,-1);else if(c())return g(),!0}if(x.pressed("b"))if(y>=0)this.joinSlots[y]=null,this.app.audio.click(),h();else return this.show("setup",t),!0}let m=x=>i.keysPressed.has(x);if(c()&&(m("Space")||m("Enter")||m("NumpadEnter")))return g(),!0;if(m("Space")&&u({type:"kb",layout:"p1"},-1),(m("Enter")||m("NumpadEnter"))&&u({type:"kb",layout:"p2"},-1),m("Backspace")){for(let x=1;x>=0;x--)if(this.joinSlots[x]&&this.joinSlots[x].type==="kb"){this.joinSlots[x]=null,h();break}}return m("Escape")?(this.show("setup",t),!0):(i.gamepadBlocked&&!this.blockedShown&&(this.blockedShown=!0,h()),!0)}}screen_settings(){let t=this.app.settings,e=this.panel("SETTINGS");this.option(e,"Graphics",[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low (fast)",value:"low"}],()=>t.quality,n=>{t.quality=n}),this.option(e,"Handling",[{label:"Easy (recommended)",value:"easy"},{label:"Realistic (Rocket League)",value:"realistic"}],()=>t.handling,n=>{t.handling=n}),this.option(e,"Default camera",[{label:"Ball cam",value:!0},{label:"Car cam",value:!1}],()=>t.ballCam,n=>{t.ballCam=n}),this.option(e,"Field of view",[90,95,100,105,110].map(n=>({label:n+"\xB0",value:n})),()=>t.fov,n=>{t.fov=n}),this.option(e,"Goal replays",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.replays,n=>{t.replays=n}),this.option(e,"Victory cinematic",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.victoryFx!==!1,n=>{t.victoryFx=n}),this.option(e,"Controller rumble",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.rumble,n=>{t.rumble=n}),this.option(e,"Volume",[0,1,2,3,4,5,6,7,8,9,10].map(n=>({label:n===0?"Off":String(n),value:n/10})),()=>Math.round(t.volume*10)/10,n=>{t.volume=n,this.app.audio.setVolume(n)}),this.option(e,"Show FPS",[{label:"Off",value:!1},{label:"On",value:!0}],()=>t.showFps,n=>{t.showFps=n});let i=()=>{this.app.applySettings(),this.show("main")};this.button(e,"\u25C0  BACK",i,"primary"),this.onBack=i}screen_controls(){let t=this.panel("CONTROLS");t.classList.add("wide"),li("div","controls",t,Vm),this.button(t,"\u25C0  BACK",()=>this.show("main"),"primary"),this.onBack=()=>this.show("main")}screen_pause(){let t=this.panel("PAUSED");this.button(t,"\u25B6  RESUME",()=>this.app.resume(),"primary"),this.button(t,"\u21BB  RESTART MATCH",()=>this.app.restartMatch()),this.button(t,"\u{1F3AE}  CONTROLS",()=>this.show("pauseControls")),this.button(t,"\u23CF  QUIT TO MENU",()=>this.app.quitToMenu()),this.onBack=()=>this.app.resume(),this.onStart=()=>this.app.resume()}screen_pauseControls(){let t=this.panel("CONTROLS");t.classList.add("wide"),li("div","controls",t,Vm),this.button(t,"\u25C0  BACK",()=>this.show("pause"),"primary"),this.onBack=()=>this.show("pause")}screen_results(t){let e=this.panel(t.winner===0?"BLUE TEAM WINS":"ORANGE TEAM WINS");e.classList.add("wide","results",t.winner===0?"win-blue":"win-orange"),li("div","final-score",e,`<span class="b">${t.scores[0]}</span><span class="dash">\u2013</span><span class="o">${t.scores[1]}</span>`);let i=t.rows.map(n=>`<tr class="team${n.team}"><td class="nm">${n.name===t.mvp?'<span class="mvp">MVP</span> ':""}${n.name}${n.human?"":' <span class="cpu">CPU</span>'}</td><td>${n.score}</td><td>${n.goals}</td><td>${n.assists}</td><td>${n.saves}</td><td>${n.shots}</td><td>${n.demos}</td></tr>`).join("");li("table","stats",e,`<tr><th>Player</th><th>Score</th><th>Goals</th><th>Assists</th><th>Saves</th><th>Shots</th><th>Demos</th></tr>${i}`),this.button(e,"\u21BB  REMATCH",()=>this.app.restartMatch(),"primary"),this.button(e,"\u23CF  MAIN MENU",()=>this.app.quitToMenu()),this.onBack=()=>this.app.quitToMenu()}};var Xm=Ft.halfX,Kd=Ft.halfZ,Gm=Ft.height,vb=Ft.chamfer,Ws=Ft.cornerR,Zd=Ft.rampR,Jd=Ft.goalHalfW,xb=Ft.goalH,yb=Ft.goalDepth,qs=Xm-Ws,Xs=Kd-Ws,jd=Xm+Kd-vb-Ws*Math.SQRT2,Wm=qs,Mo=jd-qs,bo=jd-Xs,qm=Xs;function $d(s,t,e,i,n,r){let o=n-e,a=r-i,l=((s-e)*o+(t-i)*a)/(o*o+a*a);l=l<0?0:l>1?1:l;let c=s-e-o*l,h=t-i-a*l;return c*c+h*h}function Qd(s,t){let e=s<0?-s:s,i=t<0?-t:t,n=Math.min($d(e,i,qs,0,Wm,Mo),$d(e,i,Wm,Mo,bo,qm),$d(e,i,bo,qm,0,Xs)),r=e<qs&&i<Xs&&e+i<jd,o=Math.sqrt(n);return(r?-o:o)-Ws}function _b(s,t,e){let i=Qd(s,e),n=Math.abs(t-Gm/2)-Gm/2,r=i+Zd,o=n+Zd,a=r>0?r:0,l=o>0?o:0;return-(Math.sqrt(a*a+l*l)+Math.min(Math.max(r,o),0)-Zd)}function Mb(s,t,e){return Math.min(Jd-Math.abs(s),t,xb-t,Kd+yb-Math.abs(e))}function on(s,t,e){let i=_b(s,t,e),n=Mb(s,t,e);return i>n?i:n}function bs(s,t,e,i){let r=on(s+1,t,e)-on(s-1,t,e),o=on(s,t+1,e)-on(s,t-1,e),a=on(s,t,e+1)-on(s,t,e-1),l=Math.hypot(r,o,a)||1;return i.x=r/l,i.y=o/l,i.z=a/l,i}function Ym(s,t,e,i,n,r,o){let a=0;for(let l=0;l<32;l++){let c=on(s+i*a,t+n*a,e+r*a);if(c<.5)return a;if(a+=c,a>o)return-1}return a<=o?a:-1}function So(s=220,t=5){let e=[[qs,-Mo],[qs,Mo],[bo,Xs],[-bo,Xs],[-qs,Mo],[-qs,-Mo],[-bo,-Xs],[bo,-Xs]],i=[],n=(o,a,l,c,h)=>{let u=i[i.length-1];u&&Math.abs(u.x-o)<1e-6&&Math.abs(u.z-a)<1e-6||i.push({x:o,z:a,nx:-l,nz:-c,wall:h})};for(let o=0;o<8;o++){let a=e[o],l=e[(o+1)%8],c=e[(o+2)%8],h=l[0]-a[0],u=l[1]-a[1],d=Math.hypot(h,u),f=[u/d,-h/d],g=o===2?"orange":o===6?"blue":o%2===0?"side":"corner",v=[],p=Math.max(1,Math.ceil(d/s));for(let A=0;A<=p;A++)v.push(A/p);if(g==="orange"||g==="blue"){for(let A of[Jd,-Jd]){let _=(A-a[0])/h;_>0&&_<1&&v.push(_)}v.sort((A,_)=>A-_)}for(let A of v)n(a[0]+h*A+f[0]*Ws,a[1]+u*A+f[1]*Ws,f[0],f[1],g);let m=c[0]-l[0],x=c[1]-l[1],M=Math.hypot(m,x),y=[x/M,-m/M],S=Math.atan2(f[1],f[0]),b=Math.atan2(y[1],y[0]);for(;b<S;)b+=Math.PI*2;for(let A=1;A<t;A++){let _=S+(b-S)*(A/t);n(l[0]+Math.cos(_)*Ws,l[1]+Math.sin(_)*Ws,Math.cos(_),Math.sin(_),"arc")}}let r=0;for(let o=0;o<i.length;o++)o>0&&(r+=Math.hypot(i[o].x-i[o-1].x,i[o].z-i[o-1].z)),i[o].s=r;return i.total=r+Math.hypot(i[0].x-i[i.length-1].x,i[0].z-i[i.length-1].z),i}var Eo=new T,tf=new T,Zm=new T,ef=new T,nf=new T,sf=new T,bb=Ne.friction,Sb=2,Eb=3e-4;function Jm(s,t,e){let i=Ne.radius;s.vel.y-=Oi*t,e&&e(s,t),s.vel.multiplyScalar(1-Ne.drag*t);let n=s.vel.length();n>Ne.maxSpeed&&s.vel.multiplyScalar(Ne.maxSpeed/n),s.pos.addScaledVector(s.vel,t);let r=0;for(let a=0;a<2;a++){let l=on(s.pos.x,s.pos.y,s.pos.z);if(l>=i)break;bs(s.pos.x,s.pos.y,s.pos.z,Eo),s.pos.addScaledVector(Eo,i-l);let c=s.vel.dot(Eo);if(c<0){tf.copy(Eo).multiplyScalar(c),Zm.copy(s.vel).sub(tf),ef.crossVectors(Eo,s.angVel).multiplyScalar(i),nf.copy(Zm).add(ef);let h=Math.max(nf.length(),1e-4),u=-c/h,d=-c<40?0:Ne.restitution,f=sf.copy(nf).multiplyScalar(-Math.min(1,Sb*u)*bb);s.vel.addScaledVector(tf,-(1+d)),s.vel.add(f),s.angVel.add(ef.crossVectors(f,Eo).multiplyScalar(Eb*i)),r=Math.max(r,-c)}}let o=s.angVel.length();return o>Ne.maxSpin&&s.angVel.multiplyScalar(Ne.maxSpin/o),r}var Fh=class{constructor(){this.pos=new T(0,Ne.radius,0),this.vel=new T,this.angVel=new T,this.quat=new he,this.prevPos=this.pos.clone(),this.prevQuat=this.quat.clone(),this.lastTouch=null,this.prevTouch=null,this.lastTouchTime=-10,this.frozen=!1,this.force=null,this.iceTimer=0,this.attachedTo=null}reset(){this.pos.set(0,Ne.radius,0),this.vel.set(0,0,0),this.angVel.set(0,0,0),this.prevPos.copy(this.pos),this.lastTouch=null,this.prevTouch=null,this.frozen=!0,this.iceTimer=0,this.attachedTo=null}step(t){if(this.attachedTo||(this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.frozen))return 0;if(this.iceTimer>0)return this.iceTimer-=t,this.vel.set(0,0,0),this.angVel.multiplyScalar(.95),0;let e=Jm(this,t,this.force),i=this.angVel.length();return i>1e-4&&(sf.copy(this.angVel).divideScalar(i),$m.setFromAxisAngle(sf,i*t),this.quat.premultiply($m).normalize()),e}goalState(){let t=Ne.radius;if(Math.abs(this.pos.x)<Ft.goalHalfW&&this.pos.y<Ft.goalH){if(this.pos.z>Ft.halfZ+t)return 1;if(this.pos.z<-Ft.halfZ-t)return 0}return-1}},$m=new he;function rf(s,t,e,i){let n={pos:s.pos.clone(),vel:s.vel.clone(),angVel:s.angVel.clone()},r=Math.round(t/e);if(i.length=0,s.frozen||s.attachedTo||s.iceTimer>0){for(let o=0;o<=r;o++)i.push({t:o*e,pos:n.pos.clone(),vel:s.frozen?new T:n.vel.clone()});return i}for(let o=0;o<=r;o++)i.push({t:o*e,pos:n.pos.clone(),vel:n.vel.clone()}),Jm(n,e,s.force);return i}var Bh=new T,an=new T,qe=new T,of=new T,hl=new T,af=new T,xn=new T,mr=new T,is=new T,Km=new he,lf=new T,cf=new T,jm=new T,Qm=new T,t0=new T,hf=new T,es=Nt.hitboxHalf;function Tb(s){return s<=500?.65:s<=2300?.65-.1*(s-500)/1800:Math.max(.3,.55-.25*(s-2300)/2300)}function wb(s,t,e,i){if(s.demolished||t.frozen)return!1;let n=Ne.radius;s.hitboxCenter(Bh),Km.copy(s.quat).invert(),an.copy(t.pos).sub(Bh).applyQuaternion(Km);let r=Math.max(-es.x,Math.min(es.x,an.x)),o=Math.max(-es.y,Math.min(es.y,an.y)),a=Math.max(-es.z,Math.min(es.z,an.z)),l=an.x-r,c=an.y-o,h=an.z-a,u=Math.hypot(l,c,h);if(u>=n)return!1;if(u<.001){let S=es.x-Math.abs(an.x),b=es.y-Math.abs(an.y),A=es.z-Math.abs(an.z);l=c=h=0,S<b&&S<A?l=Math.sign(an.x)||1:b<A?c=Math.sign(an.y)||1:h=Math.sign(an.z)||1,u=0}else l/=u,c/=u,h/=u;qe.set(l,c,h).applyQuaternion(s.quat);let d=n-u;of.set(r,o,a).applyQuaternion(s.quat).add(Bh);let f=Ne.mass,g=Nt.mass;t.pos.addScaledVector(qe,d*(g/(f+g))),s.pos.addScaledVector(qe,-d*(f/(f+g)));let v=Math.min(4600,xn.copy(s.vel).sub(t.vel).length());hl.copy(of).sub(s.pos),af.crossVectors(s.angVel,hl).add(s.vel);let p=xn.copy(t.vel).sub(af).dot(qe);if(p>=0)return!0;xn.crossVectors(hl,qe),s.applyInvInertia(xn),mr.crossVectors(xn,hl);let m=1/f+1/g+qe.dot(mr),x=-p/m;t.vel.addScaledVector(qe,x/f),s.vel.addScaledVector(qe,-x/g),s.onGround||(xn.crossVectors(hl,qe).multiplyScalar(-x*.5),s.angVel.add(s.applyInvInertia(xn))),xn.copy(af).sub(t.vel),xn.addScaledVector(qe,-xn.dot(qe)),t.angVel.addScaledVector(is.crossVectors(qe,xn),-.6/n);let M=-p;e-s.lastBallHit>.1&&(s.forward(mr),is.copy(t.pos).sub(Bh),is.y*=.35,is.addScaledVector(mr,-.35*is.dot(mr)),is.normalize(),t.vel.addScaledVector(is,v*Tb(v)*(s.hitPower||1)),M=Math.max(M,v)),s.lastBallHit=e;let y=t.vel.length();return y>Ne.maxSpeed&&t.vel.multiplyScalar(Ne.maxSpeed/y),i&&i.push({type:"ballHit",car:s,strength:M,point:of.clone()}),!0}function Ab(s,t,e,i,n,r,o){let a=s.x-t.x*n,l=s.y-t.y*n,c=s.z-t.z*n,h=e.x-i.x*n,u=e.y-i.y*n,d=e.z-i.z*n,f=t.x*2*n,g=t.y*2*n,v=t.z*2*n,p=i.x*2*n,m=i.y*2*n,x=i.z*2*n,M=a-h,y=l-u,S=c-d,b=f*f+g*g+v*v,A=f*p+g*m+v*x,_=p*p+m*m+x*x,R=f*M+g*y+v*S,P=p*M+m*y+x*S,I=b*_-A*A,N=I>1e-6?(A*P-_*R)/I:0;N=Math.max(0,Math.min(1,N));let B=(A*N+P)/_;B<0?(B=0,N=Math.max(0,Math.min(1,-R/b))):B>1&&(B=1,N=Math.max(0,Math.min(1,(A-R)/b))),r.set(a+f*N,l+g*N,c+v*N),o.set(h+p*B,u+m*B,d+x*B)}var Rb=1100,uf=new T;function e0(s,t,e){if(s.team===t.team||s.demolished)return!1;s.forward(uf);let i=s.vel.dot(e)-t.vel.dot(e);return s.hitPower>1?uf.dot(e)>.25&&i>150:uf.dot(e)<.5?!1:s.supersonic?i>300:s.boosting&&s.vel.length()>Rb&&i>700}function Cb(s,t,e,i,n){if(s.demolished||t.demolished||(s.hitboxCenter(lf),t.hitboxCenter(cf),lf.distanceToSquared(cf)>62500))return;s.forward(jm),t.forward(Qm);let r=36;Ab(lf,jm,cf,Qm,es.z-r*.6,t0,hf),qe.copy(hf).sub(t0);let o=qe.length();if(o>=r*2)return;o<.001?(qe.set(1,0,0),o=0):qe.divideScalar(o);let a=r*2-o;s.pos.addScaledVector(qe,-a/2),t.pos.addScaledVector(qe,a/2);let l=xn.copy(t.vel).sub(s.vel).dot(qe);if(l>=0)return;is.copy(qe).negate();let c=e0(s,t,qe),h=e0(t,s,is);if(c||h){for(let[S,b]of[[s,t],[t,s]]){if(S===s?!c:!h)continue;let A=b.pos.clone();b.demolish(),S.stats.demos++,i&&i.push({type:"demo",car:b,by:S,point:A})}return}let u=s.id<t.id?s.id*1e3+t.id:t.id*1e3+s.id,d=n.get(u)??-10,f=s.vel.dot(qe),g=-t.vel.dot(qe),v=f>=g?s:t,p=v===s?t:s,m=v===s?qe:is;v.forward(mr);let x=mr.dot(m)>.55,M=-(1+.3)*l/2;s.vel.addScaledVector(qe,-M),t.vel.addScaledVector(qe,M);let y=-l;x&&y>350&&e-d>.25&&(p.vel.addScaledVector(m,y*.55),p.vel.y+=Math.min(600,y*.28),p.noGround=.15,p.onGround=!1,n.set(u,e),i&&i.push({type:"bump",car:p,by:v,strength:y,point:hf.clone()}))}var Oh=class{constructor(){this.ball=new Fh,this.cars=[],this.time=0,this.events=[],this.bumpTimes=new Map,this.pads=[];for(let[t,e]of Ih)this.pads.push({x:t,z:e,big:!0,active:!0,timer:0});for(let[t,e]of Lh)this.pads.push({x:t,z:e,big:!1,active:!0,timer:0});this.respawnIndex=0,this.mode=null}addCar(t){return t.events=this.events,this.cars.push(t),t}resetPads(){for(let t of this.pads)t.active=!0,t.timer=0}respawn(t){let e=Vd[this.respawnIndex++%Vd.length],i=t.team===0?1:-1,n=t.team===0?e[2]:Math.PI-e[2];t.place(e[0]*i,e[1]*i,n),this.events.push({type:"respawn",car:t})}step(t){this.time+=t;let{ball:e,cars:i,mode:n}=this;n&&n.preStep(t);for(let o of i){if(o.demolished){o.respawnTimer-=t,o.prevPos.copy(o.pos),o.respawnTimer<=0&&this.respawn(o);continue}o.step(t)}n&&n.preBall(t);let r=e.step(t);r>250&&this.events.push({type:"bounce",strength:r,point:e.pos.clone()});for(let o of i)e.attachedTo!==o&&wb(o,e,this.time,this.events)&&(e.lastTouch!==o&&(e.prevTouch=e.lastTouch,e.lastTouch=o),e.lastTouchTime=this.time,n&&n.onTouch(o));for(let o=0;o<i.length;o++)for(let a=o+1;a<i.length;a++)Cb(i[o],i[a],this.time,this.events,this.bumpTimes);for(let o of this.pads){if(!o.active){o.timer-=t,o.timer<=0&&(o.active=!0);continue}let a=o.big?208:144;for(let l of i){if(l.demolished||l.boost>=100||l.pos.y>180)continue;let c=l.pos.x-o.x,h=l.pos.z-o.z;if(c*c+h*h<a*a){l.boost=o.big?100:Math.min(100,l.boost+12),o.active=!1,o.timer=o.big?10:4,this.events.push({type:"boostPickup",car:l,big:o.big,pad:o});break}}}n&&n.postStep(t)}};var i0=new T(0,1,0),Xe=new T,ci=new T,Hh=new T,ns=new T,Ei=new T,df=new T,xi=new T,ul=new T,Ye=new T,zh=new T,kh=new T,ff=new T,gr=new he,dl=new he,n0=new he,Xi=Nt.hitboxHalf,ti=Nt.hitboxOffset,pf=new T(12/(Nt.mass*((2*Xi.y)**2+(2*Xi.z)**2)),12/(Nt.mass*((2*Xi.x)**2+(2*Xi.z)**2)),12/(Nt.mass*((2*Xi.x)**2+(2*Xi.y)**2))),fl=[];for(let s of[-1,1])for(let t of[-1,1])for(let e of[-1,1])fl.push(new T(ti.x+s*Xi.x,ti.y+t*Xi.y,ti.z+e*Xi.z));fl.push(new T(ti.x,ti.y+Xi.y,ti.z),new T(ti.x,ti.y-Xi.y,ti.z),new T(ti.x+Xi.x,ti.y,ti.z),new T(ti.x-Xi.x,ti.y,ti.z),new T(ti.x,ti.y,ti.z+Xi.z),new T(ti.x,ti.y,ti.z-Xi.z));function Pb(s){return s<1400?1600-1440*s/1400:s<1410?160*(1-(s-1400)/10):0}var To=[[0,.0069],[500,.00398],[1e3,.00235],[1500,.001375],[1750,.0011],[2500,88e-5]];function Ib(s){s=Math.abs(s);for(let t=1;t<To.length;t++)if(s<=To[t][0]){let e=To[t-1],i=To[t],n=(s-e[0])/(i[0]-e[0]);return e[1]+(i[1]-e[1])*n}return To[To.length-1][1]}function Lb(){return{throttle:0,steer:0,pitch:0,yaw:0,roll:0,jump:!1,boost:!1,powerslide:!1,useItem:!1}}var Db=0,Vh=class{constructor(t,e="Player"){this.id=Db++,this.team=t,this.name=e,this.pos=new T,this.vel=new T,this.angVel=new T,this.quat=new he,this.prevPos=new T,this.prevQuat=new he,this.input=Lb(),this.hitPower=1,this.handling="easy",this.prevJump=!1,this.boost=kd,this.onGround=!1,this.groundNormal=new T(0,1,0),this.wheelContacts=0,this.wheelDist=[0,0,0,0],this.hasJumped=!1,this.canDodge=!1,this.jumpHold=0,this.noGround=0,this.sinceJump=10,this.dodgeTime=0,this.dodgeAxis=new T,this.dodgePitchSign=0,this.boosting=!1,this.supersonic=!1,this.demolished=!1,this.respawnTimer=0,this.frozen=!1,this.turtleTime=0,this.selfRight=0,this.yawRate=0,this.steerVisual=0,this.wheelSpin=0,this.lastBallHit=-10,this.bodyHit=0,this.events=null,this.stats={goals:0,assists:0,shots:0,saves:0,demos:0,score:0}}forward(t){return t.set(0,0,1).applyQuaternion(this.quat)}up(t){return t.set(0,1,0).applyQuaternion(this.quat)}left(t){return t.set(1,0,0).applyQuaternion(this.quat)}hitboxCenter(t){return t.set(ti.x,ti.y,ti.z).applyQuaternion(this.quat).add(this.pos)}place(t,e,i,n=kd){this.pos.set(t,Nt.restHeight,e),this.vel.set(0,0,0),this.angVel.set(0,0,0),this.quat.setFromAxisAngle(i0,i),this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.boost=n,this.onGround=!0,this.groundNormal.set(0,1,0),this.hasJumped=!1,this.canDodge=!1,this.jumpHold=0,this.noGround=0,this.dodgeTime=0,this.demolished=!1,this.supersonic=!1,this.boosting=!1,this.turtleTime=0,this.yawRate=0}demolish(){this.demolished=!0,this.respawnTimer=3,this.vel.set(0,0,0),this.angVel.set(0,0,0),this.boosting=!1}speed(){return this.vel.length()}applyInvInertia(t){return n0.copy(this.quat).invert(),t.applyQuaternion(n0),t.x*=pf.x,t.y*=pf.y,t.z*=pf.z,t.applyQuaternion(this.quat)}step(t){if(this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.demolished||this.frozen){this.boosting=!1,this.prevJump=this.input.jump;return}let e=this.input,i=e.jump&&!this.prevJump;this.prevJump=e.jump,this.sinceJump+=t,this.noGround>0&&(this.noGround-=t),this.forward(Xe),this.up(ci),this.left(Hh);let n=0,r=0;if(df.set(0,0,0),this.noGround<=0){let c=Nt.restHeight+14;for(let h=0;h<4;h++){let u=Nt.wheels[h];xi.copy(this.pos).addScaledVector(Hh,u.x).addScaledVector(Xe,u.z);let d=Ym(xi.x,xi.y,xi.z,-ci.x,-ci.y,-ci.z,c);this.wheelDist[h]=d,d>=0&&(n++,r+=d,xi.addScaledVector(ci,-d+2),bs(xi.x,xi.y,xi.z,Ei),df.add(Ei))}}else this.wheelDist.fill(-1);this.wheelContacts=n;let o=!1;n>=2&&(Ei.copy(df).normalize(),Ei.dot(ci)>.55&&(o=!0,-Oi*Ei.y>Nt.stickyAccel&&(o=!1,n>=3&&(this.hasJumped=!1,this.canDodge=!0,this.sinceJump=0))));let a=i;o&&i&&(a=!1,this.vel.addScaledVector(ci,Nt.jumpImpulse),this.jumpHold=Nt.jumpHoldTime,this.hasJumped=!0,this.leftWithoutJump=!1,this.canDodge=!0,this.sinceJump=0,this.noGround=.12,o=!1,this.onGround=!1,this.events&&this.events.push({type:"jump",car:this})),o?this.groundStep(t,Ei,r/n):this.airStep(t,a),this.bodyCollide(t,o);let l=this.vel.length();l>Nt.maxSpeed&&this.vel.multiplyScalar(Nt.maxSpeed/l),l>=Nt.supersonic?this.supersonic=!0:l<Nt.supersonic-100&&(this.supersonic=!1),this.steerVisual+=(e.steer-this.steerVisual)*Math.min(1,t*12),this.forward(Xe),this.wheelSpin+=this.vel.dot(Xe)/14*t}groundStep(t,e,i){let n=this.input,r=!this.onGround;if(this.onGround=!0,this.groundNormal.copy(e),this.hasJumped=!1,this.leftWithoutJump=!1,this.canDodge=!1,this.jumpHold=0,this.dodgeTime=0,this.turtleTime=0,this.selfRight=0,r){let M=-this.vel.dot(e);this.events&&M>250&&this.events.push({type:"land",car:this,strength:M})}this.up(ci),gr.setFromUnitVectors(ci,e),dl.identity().slerp(gr,1-Math.exp(-t*28)),this.quat.premultiply(dl).normalize(),this.vel.y-=Oi*t;let o=this.vel.dot(e);o<40&&this.vel.addScaledVector(e,-o),this.forward(Xe),Xe.addScaledVector(e,-Xe.dot(e)).normalize(),ns.crossVectors(Xe,e).normalize();let a=this.vel.dot(Xe),l=n.throttle,c=n.boost&&this.boost>0;c&&(l=1);let h=0;if(l!==0)a*l>=0||Math.abs(a)<25?h=Pb(Math.abs(a))*l:(h=Nt.brakeAccel*Math.sign(l),Math.abs(a)<Nt.brakeAccel*t&&(h=-a/t));else if(Math.abs(a)>0){let M=Math.min(Nt.coastDecel,Math.abs(a)/t);h=-Math.sign(a)*M}this.vel.addScaledVector(Xe,h*t),c&&(this.vel.addScaledVector(Xe,Nt.boostAccelGround*t),this.boost=Math.max(0,this.boost-Nt.boostUsePerSec*t)),this.boosting=c;let u=this.handling!=="realistic",d=this.vel.dot(Xe),f=Ib(d);u&&(f*=1+.55*Math.min(1,Math.max(0,(Math.abs(d)-400)/1600)));let g=-n.steer*f*d;n.powerslide&&(g*=1.35),this.yawRate+=(g-this.yawRate)*(1-Math.exp(-t*(u?26:18))),Math.abs(this.yawRate)>1e-5&&(gr.setFromAxisAngle(e,this.yawRate*t),this.quat.premultiply(gr).normalize(),u&&!n.powerslide&&this.vel.applyQuaternion(dl.identity().slerp(gr,.85)));let v=Math.min(1,Math.max(.3,(Oi*Math.max(0,e.y)+Nt.stickyAccel)/(Oi+Nt.stickyAccel))),p=(n.powerslide?2.2:u?30:14)*v;this.forward(Xe),Xe.addScaledVector(e,-Xe.dot(e)).normalize(),ns.crossVectors(Xe,e).normalize();let m=this.vel.dot(ns);this.vel.addScaledVector(ns,-m*(1-Math.exp(-t*p))),this.pos.addScaledVector(this.vel,t);let x=Nt.restHeight-i;this.pos.addScaledVector(e,x*(1-Math.exp(-t*30))),this.angVel.copy(e).multiplyScalar(this.yawRate)}airStep(t,e){let i=this.input;this.onGround&&(this.onGround=!1,this.hasJumped||(this.canDodge=!0,this.sinceJump=0,this.hasJumped=!0,this.leftWithoutJump=!0)),this.onGround=!1,this.yawRate=0,this.forward(Xe),this.up(ci),this.left(Hh),ns.copy(Hh).negate(),this.vel.y-=Oi*t,this.jumpHold>0&&(i.jump?(this.vel.addScaledVector(ci,Nt.jumpHoldAccel*t),this.jumpHold-=t):this.jumpHold=0);let n=this.leftWithoutJump?1e9:Nt.doubleJumpWindow;if(e&&this.canDodge&&this.sinceJump<n){this.canDodge=!1,this.jumpHold=0;let l=-i.pitch,c=i.yaw;if(Math.abs(l)+Math.abs(c)>=.5){let h=l,u=c,d=Math.hypot(h,u);d>1&&(h/=d,u/=d),Ye.set(Xe.x,0,Xe.z),Ye.lengthSq()<1e-4&&Ye.set(-ci.x,0,-ci.z),Ye.normalize(),zh.set(-Ye.z,0,Ye.x);let f=h>=0?Nt.dodgeImpulse:Nt.dodgeImpulse*1.066,g=this.vel.length(),v=Nt.dodgeImpulse*(1+.9*Math.min(1,g/Nt.maxSpeed));this.vel.addScaledVector(Ye,h*f).addScaledVector(zh,u*v*.9),this.vel.y*=.35,this.angVel.copy(ns).multiplyScalar(-h*Nt.maxAngVel).addScaledVector(Xe,u*Nt.maxAngVel),this.dodgeTime=Nt.dodgeTime,this.dodgeAxis.copy(this.angVel),this.dodgePitchSign=Math.sign(-h),this.events&&this.events.push({type:"dodge",car:this})}else this.vel.addScaledVector(ci,Nt.jumpImpulse),this.events&&this.events.push({type:"jump",car:this})}if(this.selfRight>0)this.selfRight-=t,Ye.set(Xe.x,0,Xe.z),Ye.lengthSq()<.001&&Ye.set(-ci.x,0,-ci.z),Ye.lengthSq()<1e-6&&Ye.set(0,0,1),Ye.normalize(),dl.setFromAxisAngle(i0,Math.atan2(Ye.x,Ye.z)),this.quat.slerp(dl,1-Math.exp(-t*9)),this.angVel.set(0,0,0);else if(this.dodgeTime>0){if(this.dodgeTime-=t,this.dodgePitchSign!==0&&Math.sign(i.pitch)===this.dodgePitchSign&&Math.abs(i.pitch)>.5){let c=this.angVel.dot(ns);this.angVel.addScaledVector(ns,-c*Math.min(1,t*20))}}else{let l=i.pitch,c=i.yaw,h=i.roll;i.powerslide&&(h=Math.max(-1,Math.min(1,h+i.yaw)),c=0);let u=this.angVel.dot(ns),d=this.angVel.dot(ci),f=this.angVel.dot(Xe);u+=(Nt.airPitch*l-Nt.dampPitch*u*(1-Math.abs(l)))*t,d+=(-Nt.airYaw*c-Nt.dampYaw*d*(1-Math.abs(c)))*t,f+=(Nt.airRoll*h-Nt.dampRoll*f)*t,this.angVel.copy(ns).multiplyScalar(u).addScaledVector(ci,d).addScaledVector(Xe,f)}let r=this.angVel.length();r>Nt.maxAngVel&&this.angVel.multiplyScalar(Nt.maxAngVel/r);let o=i.boost&&this.boost>0;o?(this.vel.addScaledVector(Xe,Nt.boostAccelAir*t),this.boost=Math.max(0,this.boost-Nt.boostUsePerSec*t)):i.throttle!==0&&this.vel.addScaledVector(Xe,Nt.airThrottleAccel*i.throttle*t),this.boosting=o,this.pos.addScaledVector(this.vel,t);let a=this.angVel.length();a>1e-6&&(Ye.copy(this.angVel).divideScalar(a),gr.setFromAxisAngle(Ye,a*t),this.quat.premultiply(gr).normalize()),this.up(ci),bs(this.pos.x,this.pos.y,this.pos.z,Ei),this.turtled=this.bodyHit>0&&this.vel.lengthSq()<300*300&&ci.dot(Ei)<.5,this.turtled?(this.turtleTime+=t,(e&&this.turtleTime>.15||this.turtleTime>2.5)&&(this.vel.y+=340,this.selfRight=.6,this.turtleTime=0,this.canDodge=!1)):this.turtleTime=0}bodyCollide(t,e){this.bodyHit=Math.max(0,this.bodyHit-t);for(let i=0;i<3;i++){let n=0,r=-1;for(let u=0;u<fl.length;u++){xi.copy(fl[u]).applyQuaternion(this.quat).add(this.pos);let d=on(xi.x,xi.y,xi.z);if(d<n){if(e&&(bs(xi.x,xi.y,xi.z,Ei),this.up(ci),Math.abs(Ei.dot(ci))>.6))continue;n=d,r=u}}if(r<0)return;if(xi.copy(fl[r]).applyQuaternion(this.quat).add(this.pos),bs(xi.x,xi.y,xi.z,Ei),this.pos.addScaledVector(Ei,-n+.1),this.bodyHit=.2,ul.copy(xi).sub(this.pos),e){let u=this.vel.dot(Ei);u<0&&this.vel.addScaledVector(Ei,-u*1.2);continue}ff.crossVectors(this.angVel,ul).add(this.vel);let o=ff.dot(Ei);if(o>=0)continue;Ye.crossVectors(ul,Ei),this.applyInvInertia(Ye),zh.crossVectors(Ye,ul);let a=1/Nt.mass+Ei.dot(zh),c=-(1+(o<-350?.3:0))*o/a;kh.copy(Ei).multiplyScalar(c),Ye.copy(ff).addScaledVector(Ei,-o);let h=Ye.length();if(h>.001){Ye.divideScalar(h);let u=Math.min(.6*c,h*Nt.mass/2);kh.addScaledVector(Ye,-u)}this.vel.addScaledVector(kh,1/Nt.mass),Ye.crossVectors(ul,kh),this.angVel.add(this.applyInvInertia(Ye))}}};var s0={rookie:{itemDelay:2.5,replan:.32,aimError:650,boost:.35,dodge:!1,kickoffFlip:!1,jumpReach:200,aerial:!1,maxSpeed:1900,wrongSideCare:.4},pro:{itemDelay:1,replan:.14,aimError:260,boost:.85,dodge:!0,kickoffFlip:!0,jumpReach:420,aerial:!1,maxSpeed:2300,wrongSideCare:.8},allstar:{itemDelay:.4,replan:.05,aimError:90,boost:1,dodge:!0,kickoffFlip:!0,jumpReach:1300,aerial:!0,maxSpeed:2300,wrongSideCare:1}},Ti=new T,Gh=new T,Ys=new T,vr=new T,Ee=new T,yn=new T,Yi=new T,Nb=new T(0,-Oi,0),r0=new T,ss=Ne.radius,ji=Ft.halfZ,Ss=Ft.goalHalfW;function o0(s){if(s<=0)return 0;let t=(Nt.jumpHoldAccel-Oi)/2;if(s<=74.6)return(-Nt.jumpImpulse+Math.sqrt(Nt.jumpImpulse**2+4*t*s))/(2*t);let e=453.3,n=e*e-4*325*(s-74.6);return n<0?1/0:.2+(e-Math.sqrt(n))/650}function Ub(s){if(s<=96)return o0(s);let t=712,i=t*t-4*325*(s-96);return i<0?1/0:.25+(t-Math.sqrt(i))/650}var wo=[[0,.0069],[500,.00398],[1e3,.00235],[1500,.001375],[1750,.0011],[2500,88e-5]];function Fb(s){for(let t=1;t<wo.length;t++)if(s<=wo[t][0]){let e=wo[t-1],i=wo[t];return e[1]+(i[1]-e[1])*(s-e[0])/(i[0]-e[0])}return wo[wo.length-1][1]}function Bb(s,t,e,i){t=Math.max(0,Math.min(t,e));let n=(e-t)/i,r=(t+e)/2*n;return s<=r?(-t+Math.sqrt(t*t+2*i*s))/i:n+(s-r)/e}var Wh=class{constructor(t,e="pro"){this.car=t,this.cfg=s0[e]||s0.pro,this.replanT=Math.random()*.1,this.target=new T,this.ballTarget=new T,this.desiredSpeed=2300,this.interceptT=1,this.mode="chase",this.seq=null,this.seqT=0,this.stuckT=0,this.reverseT=0,this.aimOffset=(Math.random()-.5)*this.cfg.aimError,this.aerialing=!1,this.lastJumpAt=-10,this.careT=0,this.cares=!0,this.retreatStart=-10}get attackSign(){return this.car.team===0?1:-1}startSeq(t){this.seq=t,this.seqT=0}wantItem(t){let e=t.rumble;if(!e)return!1;let i=e.st(this.car);if(!i.item||i.active||i.held<this.cfg.itemDelay)return!1;let n=this.car,r=t.world.ball,o=this.attackSign,a=n.pos.distanceTo(r.pos);n.forward(Ti),Ee.copy(r.pos).sub(n.pos).normalize();let l=Ee.dot(Ti),c=r.vel.z*o<-500,h=!1;switch(i.item){case"grapple":h=a>900&&a<3800&&l>.6&&r.pos.y<1500;break;case"plunger":h=a>900&&a<3800&&(c||r.pos.z*o<-2500);break;case"tornado":h=a<700;break;case"curveball":h=a<4500&&r.vel.z*o>300&&r.pos.z*o>-500;break;case"spikes":case"power":h=!0;break;case"boot":h=!!e.nearestOpponent(n,2200);break;case"freezer":h=c&&r.pos.z*o<-1500&&a<6e3;break;default:break}return!h&&i.held>12&&(h=e.inRange(n,i.item)),h}update(t,e){let i=this.car,n=i.input;if(i.demolished)return;let r=this.wantItem(e);if(n.useItem=r&&!this.itemTap,this.itemTap=n.useItem,this.replanT-=t,this.replanT<=0&&(this.replanT=this.cfg.replan*(.7+Math.random()*.6),this.plan(e)),n.throttle=0,n.steer=0,n.pitch=0,n.yaw=0,n.roll=0,n.boost=!1,n.powerslide=!1,this.seq){this.seqT+=t;let o=null;for(let a of this.seq)this.seqT>=a.t&&(o=a);if(!o||this.seqT>this.seq[this.seq.length-1].t+.05||o.end&&this.seqT>=o.t)this.seq=null;else{n.jump=!!o.jump,n.pitch=o.pitch||0,n.yaw=o.yaw||0,n.steer=o.yaw||0,n.throttle=o.throttle??1,n.boost=!!o.boost&&i.boost>0,o.aerial&&this.aerialControl(t,e);return}}if(n.jump=!1,!i.onGround){if(i.turtled){this.turtleTap=(this.turtleTap||0)+1,n.jump=this.turtleTap%8<4;return}this.aerialing?this.aerialControl(t,e):this.recover();return}this.aerialing=!1,this.drive(t,e)}plan(t){let e=this.car,i=t.world.ball,n=this.attackSign,r=t.pred;e.forward(Ti);let o=e.vel.length(),a=e.boost>8&&this.cfg.boost>.3,l=a?Math.min(this.cfg.maxSpeed,2200):1400,c=a?1900:1e3;if(t.kickoff){if(this.isClosest(t,i.pos)){this.mode="kickoff",this.target.copy(i.pos).add(Yi.set(0,0,-n*40)),this.ballTarget.copy(i.pos),this.desiredSpeed=2300;return}this.mode="support",this.setSupportTarget(t,!0);return}let h=this.cfg.jumpReach,u=null,d=null;for(let x=2;x<r.length;x+=2){let M=r[x];if(!d&&M.pos.z*n<-(ji+ss*.5)&&Math.abs(M.pos.x)<Ss+100&&(d=M),u||M.pos.y>h+ss)continue;this.shotDir(M.pos,d||t.threatOwn,yn),Yi.copy(M.pos).addScaledVector(yn,-(ss+70)),Ee.copy(Yi).sub(e.pos).setY(0);let y=Ee.length();Ee.normalize();let S=Math.acos(xe.clamp(Ee.dot(Ti.clone().setY(0).normalize()),-1,1)),b=e.vel.dot(Ee),A=Bb(Math.max(0,y-60),b,l,c)+S*.32;if(M.pos.y>150&&(A+=.1),A<=M.t+.02){u=M;break}}u||(u=r[r.length-1]),this.interceptT=u.t,this.ballTarget.copy(u.pos);let f=!0;for(let x of t.teammates){if(x===e||x.demolished)continue;let M=x.pos.distanceTo(u.pos)/Math.max(800,x.vel.length()*.8+600),y=e.pos.distanceTo(u.pos)/Math.max(800,o*.8+600),S=(u.pos.z-x.pos.z)*n>0;if(M+(S?0:.6)<y-.15){f=!1;break}}let g=(e.pos.z-u.pos.z)*n,v=u.pos.z*n<0;if(!!d&&(g>-200||f)){if(g>300){this.mode="retreat",this.setRetreatTarget(u.pos),this.desiredSpeed=2300;return}this.mode="save",this.setHitTarget(u,d);return}if(!f){if(e.boost<30&&Math.random()<this.cfg.boost&&this.setBoostTarget(t)){this.mode="boost";return}this.mode="support",this.setSupportTarget(t,!1);return}this.careT-=this.cfg.replan,this.careT<=0&&(this.careT=2,this.cares=Math.random()<this.cfg.wrongSideCare);let m=this.mode==="retreat"&&g>-150&&t.time-this.retreatStart<3;if(g>250&&this.cares||m){this.mode!=="retreat"&&(this.retreatStart=t.time),this.mode="retreat",v||g>1500?this.setRetreatTarget(u.pos):this.target.set(u.pos.x*.5+(e.pos.x>u.pos.x?900:-900),0,u.pos.z-n*1300),this.clampTarget(),this.desiredSpeed=2300;return}if(e.boost<15&&!v&&u.t>2.2&&this.setBoostTarget(t)){this.mode="boost";return}this.mode="attack",this.setHitTarget(u,null)}aimPoint(t,e){let i=this.attackSign;return e?r0.set(t.x>=0?4e3:-4e3,0,t.z+i*3e3):r0.set(xe.clamp(t.x*.25+this.aimOffset,-Ss+150,Ss-150),0,i*(ji+300))}shotDir(t,e,i){let n=this.aimPoint(t,e);if(i.copy(n).sub(t).setY(0).normalize(),Ys.copy(t).sub(this.car.pos).setY(0),Ys.lengthSq()<1)return i;Ys.normalize();let r=Math.acos(xe.clamp(i.dot(Ys),-1,1)),o=xe.clamp((r-.6)/1.6,0,.75);return o>0&&i.lerp(Ys,o).normalize(),i}setHitTarget(t,e){let i=this.car;this.shotDir(t.pos,e,yn);let n=Yi.copy(t.pos).sub(i.pos).setY(0).length(),r=xe.clamp(n*.45,ss+40,1200);for(;r>ss+40&&(Yi.copy(t.pos).addScaledVector(yn,-r),!(Qd(Yi.x,Yi.z)<-320&&Math.abs(Yi.z)<ji-250));)r-=80;r=Math.max(r,ss+40),this.target.copy(t.pos).addScaledVector(yn,-r),this.target.y=0,this.clampTarget();let o=i.pos.distanceTo(this.target)+r,a=Math.max(.05,t.t),l=t.pos.y>180;this.desiredSpeed=l?xe.clamp(o/a,300,2300):2300,i.forward(Ti),Ti.setY(0).normalize();let c=Math.acos(xe.clamp(Ti.dot(yn),-1,1));n<1100&&c>.6&&!e&&(this.desiredSpeed=Math.min(this.desiredSpeed,700+(1100-Math.min(1100,c*500))))}setRetreatTarget(t){let e=this.attackSign,i=t.x>0?-Ss*.8:Ss*.8;this.target.set(i,0,-e*(ji-350))}setSupportTarget(t,e){let i=this.car,n=t.world.ball,r=this.attackSign,o=t.teammates.indexOf(i),a=o%2===0?-1:1;if(e)i.boost<60&&Math.abs(i.pos.x)>1e3?this.target.set(Math.sign(i.pos.x)*3072,0,-r*4096):this.target.set(0,0,-r*(ji-500));else{let c=n.pos.z-r*(2200+o*900);this.target.set(n.pos.x*.35+a*1100,0,Math.max(-ji+400,Math.min(ji-400,c*r))*r)}this.clampTarget();let l=i.pos.distanceTo(this.target);this.desiredSpeed=l>1500?2300:l>400?1400:300}setBoostTarget(t){let e=this.car,i=this.attackSign,n=null,r=1/0;for(let o of t.world.pads){if(!o.big||!o.active||o.z*i>1500)continue;let a=Math.hypot(o.x-e.pos.x,o.z-e.pos.z);a<r&&(r=a,n=o)}return!n||r>4500?!1:(this.target.set(n.x,0,n.z),this.desiredSpeed=2300,!0)}clampTarget(){this.target.x=xe.clamp(this.target.x,-Ft.halfX+250,Ft.halfX-250),this.target.z=xe.clamp(this.target.z,-ji+150,ji-150)}isClosest(t,e){let i=this.car.pos.distanceTo(e);for(let n of t.teammates){if(n===this.car)continue;let r=n.pos.distanceTo(e);if(r<i-5||Math.abs(r-i)<=5&&n.pos.x*this.attackSign<this.car.pos.x*this.attackSign)return!1}return!0}drive(t,e){let i=this.car,n=i.input,r=i.groundNormal;i.forward(Ti),vr.crossVectors(Ti,r).normalize();let o=i.vel.length(),a=i.vel.dot(Ti),l=e.world.ball;if(l.attachedTo===i){Yi.set(0,0,this.attackSign*(ji-300)),Ee.copy(Yi).sub(i.pos),Ee.addScaledVector(r,-Ee.dot(r));let P=Math.atan2(Ee.dot(vr),Ee.dot(Ti));n.throttle=1,n.steer=xe.clamp(P*3,-1,1),n.boost=Math.abs(P)<.4&&i.boost>0,Ee.length()<2600&&Math.abs(P)<.3&&e.time-this.lastJumpAt>1.2&&(this.lastJumpAt=e.time,this.startSeq([{t:0,jump:!0},{t:.06,jump:!1},{t:.09,jump:!0,pitch:-1},{t:.19,jump:!1,end:!0}]));return}let c=this.target,h=i.pos.distanceTo(l.pos);if((this.mode==="attack"||this.mode==="save"||this.mode==="kickoff")&&h<650&&l.pos.y<260&&(this.shotDir(l.pos,this.mode==="save",yn),Yi.copy(l.pos).addScaledVector(yn,-(ss*.6)),Ee.copy(l.pos).sub(i.pos).setY(0).normalize(),Ee.dot(yn)>.2&&(c=Yi)),Math.abs(i.pos.z)>ji-60&&(Math.abs(c.x)>Ss-100||Math.abs(c.z)<ji-200)){let P=Math.sign(i.pos.z);(Math.abs(i.pos.z)>ji+60||Math.abs(i.pos.x)>Ss-80)&&(c=Yi.set(xe.clamp(c.x,-Ss+250,Ss-250),0,P*(ji-500)))}Ee.copy(c).sub(i.pos),Ee.addScaledVector(r,-Ee.dot(r));let u=Ee.length(),d=Math.atan2(Ee.dot(vr),Ee.dot(Ti)),f=xe.clamp(d*3.2,-1,1),g=1,v=Math.abs(d)>1.6&&o>500,p=this.desiredSpeed;(this.mode==="support"||this.mode==="boost")&&(p=Math.min(p,u>1200?2300:Math.max(300,u*1.2)));let m=1/Fb(Math.max(a,0));if(Math.abs(d)>.3&&u<2*m*Math.sin(Math.min(Math.abs(d),Math.PI/2))*1.05&&(p=Math.min(p,Math.max(250,a*.5)),Math.abs(d)>1&&(v=o>350)),a>p+250&&(g=a>p+600?-1:0),this.reverseT>0){this.reverseT-=t,n.throttle=-1,n.steer=-f;return}o<120&&g>0?(this.stuckT+=t,this.stuckT>1.2&&(this.reverseT=.8,this.stuckT=0)):this.stuckT=0;let x=!1;if(i.boost>0&&Math.abs(d)<.3&&a<Math.min(this.cfg.maxSpeed,p)-80&&u>400){let P=this.mode==="kickoff"||this.mode==="save"||this.mode==="retreat"?0:this.cfg.boost<1?20:8;x=i.boost>P&&Math.random()<this.cfg.boost+.1}if(a>this.cfg.maxSpeed-50&&(x=!1),n.throttle=g,n.steer=f,n.powerslide=v,n.boost=x,this.mode==="kickoff"&&this.cfg.kickoffFlip&&h<520+o*.12&&o>1100&&Math.abs(d)<.25){this.startSeq([{t:0,jump:!0,boost:!0},{t:.07,jump:!1,boost:!0},{t:.1,jump:!0,pitch:-1,yaw:xe.clamp(d*2,-.4,.4)},{t:.2,jump:!1,pitch:-1,end:!0}]);return}let M=e.time;if(M-this.lastJumpAt<1.2)return;let y=l.pos.y;Ee.copy(l.pos).sub(i.pos);let S=Math.hypot(Ee.x,Ee.z),b=i.vel.clone().sub(l.vel),A=Math.max(1,b.dot(Ee.clone().setY(0).normalize())),_=Math.max(0,S-110)/A,R=Ee.clone().setY(0).normalize().dot(Ti.clone().setY(0).normalize());if(this.cfg.dodge&&y<220&&S<360&&R>.85&&o>600&&_<.2&&(this.mode==="attack"||this.mode==="save")){let P=xe.clamp(Ee.dot(vr)/120,-.6,.6);this.lastJumpAt=M,this.startSeq([{t:0,jump:!0},{t:.06,jump:!1},{t:.09,jump:!0,pitch:-1,yaw:P},{t:.19,jump:!1,pitch:-.4,end:!0}]);return}if(y>190&&y<this.cfg.jumpReach+100&&R>.8&&S<1400){let P=y-110,I=P<230,N=I?o0(P):Ub(P),B=l.vel.y<0?(y-110-ss)/Math.max(1,-l.vel.y):1/0,L=Math.min(_,B+.3);Number.isFinite(N)&&Math.abs(L-N)<.06&&(I||this.cfg.jumpReach>350)&&(this.lastJumpAt=M,I?this.startSeq([{t:0,jump:!0},{t:Math.min(.2,N),jump:!0},{t:N+.02,jump:!1,end:!0}]):this.cfg.aerial&&P>520?(this.aerialing=!0,this.startSeq([{t:0,jump:!0,aerial:!0},{t:.2,jump:!1,aerial:!0},{t:.24,jump:!0,aerial:!0,boost:!0},{t:.3,jump:!1,aerial:!0,boost:!0,end:!0}])):this.startSeq([{t:0,jump:!0},{t:.2,jump:!1},{t:.24,jump:!0},{t:.3,jump:!1,end:!0}]))}else if(this.cfg.aerial&&y>520&&y<1500&&R>.9&&S<1500&&i.boost>30&&o>400){let P=this.interceptT,I=(y-120)/600+.3;Math.abs(P-I)<.25&&this.ballTarget.y>450&&(this.lastJumpAt=M,this.aerialing=!0,this.startSeq([{t:0,jump:!0,aerial:!0,boost:!0},{t:.2,jump:!1,aerial:!0,boost:!0},{t:.24,jump:!0,aerial:!0,boost:!0},{t:.3,jump:!1,aerial:!0,boost:!0,end:!0}]))}}orient(t,e){let i=this.car,n=i.input;i.forward(Ti),i.up(Gh),i.left(Ys),vr.copy(Ys).negate();let r=i.angVel,o=Math.atan2(t.dot(Gh),t.dot(Ti)),a=Math.atan2(t.dot(vr),t.dot(Ti)),l=r.dot(vr),c=-r.dot(Gh),h=r.dot(Ti);n.pitch=xe.clamp(o*3.5-l*.55,-1,1),n.yaw=xe.clamp(a*3.5-c*.55,-1,1);let u=Math.atan2(Ys.dot(e),Gh.dot(e));n.roll=xe.clamp(u*2.5-h*.4,-1,1),n.steer=n.yaw,n.powerslide=!1}aerialControl(t,e){let i=this.car,n=i.input,r=e.world.ball,o=e.pred,a=o[o.length-1];for(let h=1;h<o.length;h++){let u=o[h],d=u.pos.distanceTo(i.pos)-ss-40,f=i.vel.length();if(d/Math.max(900,f+500*u.t)<=u.t){a=u;break}}let l=Math.max(.1,a.t);yn.copy(a.pos).sub(i.pos).addScaledVector(i.vel,-l).multiplyScalar(2/(l*l)).sub(Nb);let c=yn.length();(c>1500||i.boost<=0||i.pos.distanceTo(r.pos)<ss+60)&&c>1500&&!this.seq&&(this.aerialing=!1),Ee.copy(yn).normalize(),this.orient(Ee,Yi.set(0,1,0)),i.forward(Ti),n.boost=i.boost>0&&Ti.dot(Ee)>.75&&c>250,n.throttle=1}recover(){let t=this.car,e=t.input;Ee.set(t.vel.x,0,t.vel.z),Ee.lengthSq()<100&&(t.forward(Ee),Ee.y=0),Ee.normalize(),this.orient(Ee,Yi.set(0,1,0)),e.throttle=1,e.boost=!1}};function Zs(s,t){let e=document.createElement("canvas");return e.width=s,e.height=t,e}function rs(s,{srgb:t=!0,repeat:e=!1,aniso:i=8}={}){let n=new ri(s);return t&&(n.colorSpace=ze),e&&(n.wrapS=n.wrapT=Ji),n.anisotropy=i,n}function Ao(s=1){let t=s>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var ln={minZ:-(Ft.halfZ+Ft.goalDepth),maxZ:Ft.halfZ+Ft.goalDepth,halfX:Ft.halfX};function a0(s){let t=s==="low"?8:5.3333,e=Math.round(2*Ft.halfX/t),i=Math.round((ln.maxZ-ln.minZ)/t),n=Zs(e,i),r=n.getContext("2d"),o=x=>(x+Ft.halfX)/t,a=x=>(ln.maxZ-x)/t,l=x=>x/t,c=512;for(let x=ln.minZ;x<ln.maxZ;x+=c){let M=Math.floor((x-ln.minZ)/c);r.fillStyle=M%2?"#3f7f2c":"#356f25",r.fillRect(0,a(x+c),e,l(c)+1)}let h=r.createLinearGradient(0,a(-Ft.halfZ),0,a(0));h.addColorStop(0,"rgba(40,110,255,0.10)"),h.addColorStop(1,"rgba(40,110,255,0)"),r.fillStyle=h,r.fillRect(0,a(0),e,a(ln.minZ)-a(0)),h=r.createLinearGradient(0,a(Ft.halfZ),0,a(0)),h.addColorStop(0,"rgba(255,120,30,0.10)"),h.addColorStop(1,"rgba(255,120,30,0)"),r.fillStyle=h,r.fillRect(0,0,e,a(0));let u=r.getImageData(0,0,e,i),d=u.data,f=Ao(7);for(let x=0;x<d.length;x+=4){let M=(f()-.5)*26+(f()<.04?-18:0);d[x]=Math.max(0,Math.min(255,d[x]+M*.6)),d[x+1]=Math.max(0,Math.min(255,d[x+1]+M)),d[x+2]=Math.max(0,Math.min(255,d[x+2]+M*.4))}r.putImageData(u,0,0);for(let x of[1,-1]){r.fillStyle="rgba(10,20,10,0.45)";let M=x*Ft.halfZ,y=x*(Ft.halfZ+Ft.goalDepth);r.fillRect(o(-Ft.goalHalfW),Math.min(a(M),a(y)),l(2*Ft.goalHalfW),Math.abs(a(y)-a(M)))}let g=(x,M)=>{r.lineWidth=l(x),r.strokeStyle=M};r.lineCap="round",r.lineJoin="round";let v="rgba(245,250,255,0.85)",p=So(160,6);g(34,v),r.beginPath(),p.forEach((x,M)=>{let y=x.x+x.nx*(Ft.rampR+60),S=x.z+x.nz*(Ft.rampR+60);M===0?r.moveTo(o(y),a(S)):r.lineTo(o(y),a(S))}),r.closePath(),r.stroke(),r.beginPath(),r.moveTo(o(-Ft.halfX+340),a(0)),r.lineTo(o(Ft.halfX-340),a(0)),r.stroke(),r.beginPath(),r.arc(o(0),a(0),l(1e3),0,Math.PI*2),r.stroke(),r.fillStyle=v,r.beginPath(),r.arc(o(0),a(0),l(60),0,Math.PI*2),r.fill();for(let x of[-1,1]){let M=x<0?"rgba(70,150,255,0.95)":"rgba(255,140,50,0.95)",y=x*(Ft.halfZ-340);g(40,M),r.beginPath(),r.moveTo(o(-Ft.goalHalfW),a(x*Ft.halfZ)),r.lineTo(o(Ft.goalHalfW),a(x*Ft.halfZ)),r.stroke(),g(30,v),r.beginPath(),r.moveTo(o(-1800),a(y)),r.lineTo(o(-1800),a(x*(Ft.halfZ-1500))),r.lineTo(o(1800),a(x*(Ft.halfZ-1500))),r.lineTo(o(1800),a(y)),r.stroke(),g(26,M),r.beginPath(),r.moveTo(o(-1150),a(y)),r.lineTo(o(-1150),a(x*(Ft.halfZ-800))),r.lineTo(o(1150),a(x*(Ft.halfZ-800))),r.lineTo(o(1150),a(y)),r.stroke(),g(30,v),r.beginPath();let S=a(x*(Ft.halfZ-1500));x<0?r.arc(o(0),S,l(700),Math.PI,0,!1):r.arc(o(0),S,l(700),0,Math.PI,!1),r.stroke(),g(26,x<0?"rgba(70,150,255,0.55)":"rgba(255,140,50,0.55)");for(let b of[-2600,2600])for(let A=0;A<3;A++){let _=x*(2e3+A*260);r.beginPath(),r.moveTo(o(b-220),a(_+x*160)),r.lineTo(o(b),a(_)),r.lineTo(o(b+220),a(_+x*160)),r.stroke()}}return rs(n,{aniso:16})}function l0(){let t=Zs(256,256),e=t.getContext("2d"),i=e.createImageData(256,256),n=Ao(11),r=new Float32Array(256*256);for(let a=0;a<9e3;a++){let l=Math.floor(n()*256),c=Math.floor(n()*256),h=.35+n()*.65,u=1+Math.floor(n()*3);for(let d=0;d<u;d++){let f=(c+d)%256;r[f*256+l]=Math.max(r[f*256+l],h*(1-d*.2))}}for(let a=0;a<256*256;a++){let l=Math.round(r[a]*255);i.data[a*4]=l,i.data[a*4+1]=l,i.data[a*4+2]=l,i.data[a*4+3]=255}e.putImageData(i,0,0);let o=rs(t,{srgb:!1,repeat:!0});return o.magFilter=mi,o}function mf(s=3,t=512){let e=t/6,i=t,n=Math.round(Math.sqrt(3)*e*4),r=Zs(i,n),o=r.getContext("2d");o.fillStyle="#000",o.fillRect(0,0,i,n),o.strokeStyle="#fff",o.lineWidth=s;let a=Math.sqrt(3)*e;for(let l=-1;l<=5;l++)for(let c=-1;c<=5;c++){let h=1.5*e*l,u=a*(c+(l%2?.5:0));o.beginPath();for(let d=0;d<=6;d++){let f=Math.PI/3*d,g=h+e*Math.cos(f),v=u+e*Math.sin(f);d===0?o.moveTo(g,v):o.lineTo(g,v)}o.stroke()}return rs(r,{srgb:!1,repeat:!0})}function gf(){let e=Zs(2048,128),i=e.getContext("2d"),n=i.createLinearGradient(0,0,0,128);n.addColorStop(0,"#05070c"),n.addColorStop(1,"#0b1220"),i.fillStyle=n,i.fillRect(0,0,2048,128);let r=["ROCKET ARENA","SUPERSONIC","ROCKET ARENA","BOOST","ROCKET ARENA","AERIAL CUP"],o=2048/r.length;return r.forEach((a,l)=>{let c=l*o;i.fillStyle="rgba(120,180,255,0.18)",i.fillRect(c+4,8,o-8,112),i.fillStyle=l%2?"#ff8a2a":"#4aa8ff",i.beginPath(),i.arc(c+58,128/2,30,0,Math.PI*2),i.fill(),i.fillStyle="#fff",i.beginPath(),i.arc(c+58,128/2,18,0,Math.PI*2),i.fill(),i.fillStyle=l%2?"#ff8a2a":"#4aa8ff",i.beginPath(),i.arc(c+64,128/2-4,9,0,Math.PI*2),i.fill(),i.fillStyle="#f4f8ff",i.font="bold italic 54px Arial, Helvetica, sans-serif",i.textBaseline="middle",i.fillText(a,c+104,128/2+2,o-120)}),rs(e,{repeat:!0})}function c0(){let e=Zs(1024,512),i=e.getContext("2d");i.fillStyle="#14161c",i.fillRect(0,0,1024,512);let n=Ao(23),r=8,o=512/r,a=["#c8641c","#2a62c4","#9aa3ad","#1c1c1c","#8a2a2a","#b89a3a","#2a6a3a","#3a3f4a","#c8641c","#2a62c4","#30343c","#5a6070","#20232a"],l=["#c9a185","#b08060","#8a5a3c","#5a3a26","#d2b096"];for(let u=0;u<r;u++){let d=u*o;i.fillStyle=u%2?"#20232b":"#1a1d24",i.fillRect(0,d+o*.62,1024,o*.38),i.fillStyle="#2b3140",i.fillRect(0,d+o*.6,1024,3);for(let f=4;f<1020;f+=15+n()*4){if(n()<.12)continue;let g=a[Math.floor(n()*a.length)],v=l[Math.floor(n()*l.length)],p=d+o*(.32+n()*.08);i.fillStyle=g,i.fillRect(f-6,p,12,o*.36),i.fillStyle=v,i.beginPath(),i.arc(f,p-6,5.5,0,Math.PI*2),i.fill(),n()<.18&&(i.fillStyle=v,i.fillRect(f-9,p-18,3,16),i.fillRect(f+6,p-18,3,16)),n()<.06&&(i.fillStyle=n()<.5?"#ff7a1a":"#2f7bff",i.fillRect(f-10,p-26,20,10))}}let c=Zs(1024,512),h=c.getContext("2d");return h.filter="blur(1.2px) saturate(0.8)",h.drawImage(e,0,0),rs(c,{repeat:!0})}function h0(s=1024){let t=s,e=s/2,i=(1+Math.sqrt(5))/2,n=[],r=(S,b,A,_)=>{let R=Math.hypot(S,b,A);n.push([S/R,b/R,A/R,_])};for(let S of[-1,1])for(let b of[-1,1])r(0,S,b*i,1),r(S,b*i,0,1),r(S*i,0,b,1);for(let S of[-1,1])for(let b of[-1,1])for(let A of[-1,1])r(S,b,A,0);for(let S of[-1,1])for(let b of[-1,1])r(0,S/i,b*i,0),r(S/i,b*i,0,0),r(S*i,0,b/i,0);let o=()=>{let S=Zs(t,e);return[S,S.getContext("2d")]},[a,l]=o(),[c,h]=o(),[u,d]=o(),[f,g]=o(),v=l.createImageData(t,e),p=h.createImageData(t,e),m=d.createImageData(t,e),x=g.createImageData(t,e),M=Ao(5),y=new Float32Array(2048);for(let S=0;S<y.length;S++)y[S]=M();for(let S=0;S<e;S++){let b=(S+.5)/e,A=Math.sin(Math.PI*b),_=Math.cos(Math.PI*b);for(let R=0;R<t;R++){let P=(R+.5)/t,I=-Math.cos(2*Math.PI*P)*A,N=_,B=Math.sin(2*Math.PI*P)*A,L=-2,O=-2,q=0;for(let Et=0;Et<32;Et++){let Zt=n[Et],ye=I*Zt[0]+N*Zt[1]+B*Zt[2];ye>L?(O=L,L=ye,q=Et):ye>O&&(O=ye)}let Y=n[q][3],rt=L-O,Z=rt<.006?1:rt<.014?1-(rt-.006)/.008:0,tt=Math.acos(Math.min(1,L)),nt=y[(S>>4)%32*64+(R>>4)%64]*.08,Lt,Pt,ce;Y?(Lt=52,Pt=58,ce=66):(Lt=128,Pt=134,ce=140);let ae=rt<.03?.85:1,le=(1-Z*.85)*ae*(1+nt),X=(S*t+R)*4;v.data[X]=Lt*le,v.data[X+1]=Pt*le,v.data[X+2]=ce*le,v.data[X+3]=255;let j=0;Y&&(tt<.07?j=1:tt>.12&&tt<.15&&(j=.9)),p.data[X]=60*j,p.data[X+1]=170*j,p.data[X+2]=255*j,p.data[X+3]=255;let vt=Z>0?200:Y?95:120;m.data[X]=vt,m.data[X+1]=vt,m.data[X+2]=vt,m.data[X+3]=255;let Wt=255*(1-Z)*(rt<.03?.6+rt*13:1);x.data[X]=Wt,x.data[X+1]=Wt,x.data[X+2]=Wt,x.data[X+3]=255}}return l.putImageData(v,0,0),h.putImageData(p,0,0),d.putImageData(m,0,0),g.putImageData(x,0,0),{map:rs(a),emissiveMap:rs(c),roughnessMap:rs(u,{srgb:!1}),bumpMap:rs(f,{srgb:!1})}}function u0(){let s=Zs(256,64),t=s.getContext("2d");t.fillStyle="#1b1b1d",t.fillRect(0,0,256,64),t.strokeStyle="#0a0a0b",t.lineWidth=6;for(let e=-64;e<320;e+=18)t.beginPath(),t.moveTo(e,0),t.lineTo(e+14,30),t.lineTo(e,64),t.stroke();return t.fillStyle="#0c0c0d",t.fillRect(0,30,256,4),rs(s,{repeat:!0})}var qh=class extends re{constructor(t=new ot,e=new T,i=new Pn,n=new T(1,1,1)){super();let r=[],o=[],a=[],l=new T,c=new ie().getNormalMatrix(t.matrixWorld),h=new be;h.makeRotationFromEuler(i),h.setPosition(e);let u=new be;u.copy(h).invert(),d(),this.setAttribute("position",new $t(r,3)),this.setAttribute("uv",new $t(a,2)),o.length>0&&this.setAttribute("normal",new $t(o,3));function d(){let p=[],m=new T,x=new T,M=t.geometry,y=M.attributes.position,S=M.attributes.normal;if(M.index!==null){let b=M.index;for(let A=0;A<b.count;A++)m.fromBufferAttribute(y,b.getX(A)),S?(x.fromBufferAttribute(S,b.getX(A)),f(p,m,x)):f(p,m)}else{if(y===void 0)return;for(let b=0;b<y.count;b++)m.fromBufferAttribute(y,b),S?(x.fromBufferAttribute(S,b),f(p,m,x)):f(p,m)}p=g(p,l.set(1,0,0)),p=g(p,l.set(-1,0,0)),p=g(p,l.set(0,1,0)),p=g(p,l.set(0,-1,0)),p=g(p,l.set(0,0,1)),p=g(p,l.set(0,0,-1));for(let b=0;b<p.length;b++){let A=p[b];a.push(.5+A.position.x/n.x,.5+A.position.y/n.y),A.position.applyMatrix4(h),r.push(A.position.x,A.position.y,A.position.z),A.normal!==null&&o.push(A.normal.x,A.normal.y,A.normal.z)}}function f(p,m,x=null){m.applyMatrix4(t.matrixWorld),m.applyMatrix4(u),x?(x.applyNormalMatrix(c),p.push(new pl(m.clone(),x.clone()))):p.push(new pl(m.clone()))}function g(p,m){let x=[],M=.5*Math.abs(n.dot(m));for(let y=0;y<p.length;y+=3){let S=0,b,A,_,R,P=p[y+0].position.dot(m)-M,I=p[y+1].position.dot(m)-M,N=p[y+2].position.dot(m)-M,B=P>0,L=I>0,O=N>0;switch(S=(B?1:0)+(L?1:0)+(O?1:0),S){case 0:{x.push(p[y]),x.push(p[y+1]),x.push(p[y+2]);break}case 1:{if(B&&(b=p[y+1],A=p[y+2],_=v(p[y],b,m,M),R=v(p[y],A,m,M)),L){b=p[y],A=p[y+2],_=v(p[y+1],b,m,M),R=v(p[y+1],A,m,M),x.push(_),x.push(A.clone()),x.push(b.clone()),x.push(A.clone()),x.push(_.clone()),x.push(R);break}O&&(b=p[y],A=p[y+1],_=v(p[y+2],b,m,M),R=v(p[y+2],A,m,M)),x.push(b.clone()),x.push(A.clone()),x.push(_),x.push(R),x.push(_.clone()),x.push(A.clone());break}case 2:{B||(b=p[y].clone(),A=v(b,p[y+1],m,M),_=v(b,p[y+2],m,M),x.push(b),x.push(A),x.push(_)),L||(b=p[y+1].clone(),A=v(b,p[y+2],m,M),_=v(b,p[y],m,M),x.push(b),x.push(A),x.push(_)),O||(b=p[y+2].clone(),A=v(b,p[y],m,M),_=v(b,p[y+1],m,M),x.push(b),x.push(A),x.push(_));break}case 3:break}}return x}function v(p,m,x,M){let y=p.position.dot(x)-M,S=m.position.dot(x)-M,b=y/(y-S),A=new T(p.position.x+b*(m.position.x-p.position.x),p.position.y+b*(m.position.y-p.position.y),p.position.z+b*(m.position.z-p.position.z)),_=null;return p.normal!==null&&m.normal!==null&&(_=new T(p.normal.x+b*(m.normal.x-p.normal.x),p.normal.y+b*(m.normal.y-p.normal.y),p.normal.z+b*(m.normal.z-p.normal.z))),new pl(A,_)}}},pl=class{constructor(t,e=null){this.position=t,this.normal=e}clone(){let t=this.position.clone(),e=this.normal!==null?this.normal.clone():null;return new this.constructor(t,e)}};var Mn=[-58.4,-57.6,-56.5,-53,-46,-34,-22,-10,2,16,30,40,51,62,71,77,81,83,84.2],Hb=[6,13,17.5,20.5,22.5,22.8,21.5,19.5,18.6,18.4,18,16.5,16.5,15.5,12,8.5,4.5,1,-2.5],zb=[-2,-5,-6.5,-8,-9.5,-10.5,-11,-11,-11,-11,-11,-11,-10.5,-10.2,-9.8,-9.2,-8.6,-7.6,-6],kb=[2,8,12,15,16.5,17.5,15,11,9,9,9.5,11,12,10.5,6.5,2.5,-1,-3,-4.3],Vb=[22,33.5,38.5,41.8,44,44.6,42.6,40,39.2,39.2,39.6,40.6,41.3,40.4,37.4,33.6,28.2,21,10],Gb=[0,.5,1.5,2.2,2.5,2.5,1.8,.5,0,0,0,2,3,2.8,2,1.2,.5,0,0],Wb=[2.4,2.6,2.8,3,3.2,3.2,3.2,3.4,3.4,3.4,3.2,3.2,3.2,3.2,3,2.8,2.6,2.4,2.2],qb=[2.6,3,3.4,3.6,3.8,3.8,3.8,3.8,3.8,3.8,3.8,3.8,3.8,3.6,3.4,3,2.8,2.6,2.4],yr=[-35,-31,-24,-16,-8,0,8,16,24,31,36.5,38.6],Xb=[21.6,23.6,27.4,30.8,32.6,33.2,33,31.6,27.8,23.3,19.5,17],Yb=[30,32,33.5,34,34,33.8,33.5,33,32,30.5,29,27];function Es(s,t){let e=s.length,i=[],n=new Array(e);for(let r=0;r<e-1;r++)i.push((t[r+1]-t[r])/(s[r+1]-s[r]));n[0]=i[0],n[e-1]=i[e-2];for(let r=1;r<e-1;r++)n[r]=i[r-1]*i[r]<=0?0:(i[r-1]+i[r])/2;for(let r=0;r<e-1;r++){if(i[r]===0){n[r]=0,n[r+1]=0;continue}let o=n[r]/i[r],a=n[r+1]/i[r],l=o*o+a*a;if(l>9){let c=3/Math.sqrt(l);n[r]=c*o*i[r],n[r+1]=c*a*i[r]}}return r=>{if(r<=s[0])return t[0];if(r>=s[e-1])return t[e-1];let o=0;for(;r>s[o+1];)o++;let a=s[o+1]-s[o],l=(r-s[o])/a,c=l*l,h=c*l;return(2*h-3*c+1)*t[o]+(h-2*c+l)*a*n[o]+(-2*h+3*c)*t[o+1]+(h-c)*a*n[o+1]}}var xr={top:Es(Mn,Hb),bot:Es(Mn,zb),cy:Es(Mn,kb),a:Es(Mn,Vb),dip:Es(Mn,Gb),nt:Es(Mn,Wb),nb:Es(Mn,qb)},d0={roof:Es(yr,Xb),half:Es(yr,Yb)};function vf(s){return{z:s,top:xr.top(s),bot:xr.bot(s),cy:xr.cy(s),a:xr.a(s),dip:xr.dip(s),nt:xr.nt(s),nb:xr.nb(s)}}function Nn(s,t){let e=Math.max(0,Math.sin(t)),i=Math.cos(t),n,r;if(t<=Math.PI/2){let o=2/s.nt;n=s.a*Math.pow(e,o),r=s.cy+(s.top-s.cy)*Math.pow(Math.max(0,i),o);let a=n/s.a;r-=s.dip*Math.pow(Math.max(0,1-a*a*1.15),2)}else{let o=2/s.nb;n=s.a*Math.pow(e,o),r=s.cy-(s.cy-s.bot)*Math.pow(Math.max(0,-i),o)}return[n,r]}var xf=Nt.wheels.filter(s=>s.x>0).map(s=>{let t=s.r<14?5.5:6.5,e=Math.abs(s.x)+7;return{z:s.z,cy:-Nt.restHeight+s.r,R:s.r+3.6,inner:e-t-2.2}});function Zb(s){for(let t of xf){let e=s-t.z;if(Math.abs(e)<t.R)return{...t,y:t.cy+Math.sqrt(t.R*t.R-e*e)}}return null}function Ro(s,t,e,i,n=120){let r=[],o=[0];for(let h=0;h<=n;h++){let u=s(t+(e-t)*h/n);h>0&&o.push(o[h-1]+Math.hypot(u[0]-r[h-1][0],u[1]-r[h-1][1])),r.push(u)}let a=o[n],l=[],c=0;for(let h=0;h<=i;h++){let u=a*h/i;for(;c<n-1&&o[c+1]<u;)c++;let d=o[c+1]-o[c],f=d>1e-9?(u-o[c])/d:0;l.push([r[c][0]+(r[c+1][0]-r[c][0])*f,r[c][1]+(r[c+1][1]-r[c][1])*f])}return l}function $b(s,t){let e=0,i=Math.PI;for(let n=0;n<40;n++){let r=(e+i)/2;Nn(s,r)[1]>t?e=r:i=r}return(e+i)/2}function Jb(s,t){let e=Math.PI/2,i=Math.PI;for(let n=0;n<40;n++){let r=(e+i)/2;Nn(s,r)[0]>t?e=r:i=r}return(e+i)/2}function Kb(s){let t=s.ringA,e=s.ringB,i=s.ringC,n=t+e+i,r=n*2,o=[];for(let v=Mn[0];v<Mn[Mn.length-1];v+=s.step)o.push(v);o.push(Mn[Mn.length-1]);for(let v of xf)for(let p of[-1,1])o.push(v.z+p*(v.R-.04),v.z+p*(v.R+.04));o.sort((v,p)=>v-p);let a=[],l=[];for(let v of o){let p=vf(v),m=Zb(v),x=m?m.y:Math.min(p.cy-1,-6.8),M=$b(p,x),y=Ro(R=>Nn(p,R),0,M,t),S,b;if(m){let R=y[t][0],P=Math.min(m.inner,R-.5);S=Ro(q=>[R+(P-R)*q,m.y],0,1,e);let I=Jb(p,P),N=Nn(p,I)[1],B=Math.max(.01,m.y-N),L=(()=>{let q=0,Y=Nn(p,I);for(let rt=1;rt<=30;rt++){let Z=Nn(p,I+(Math.PI-I)*rt/30);q+=Math.hypot(Z[0]-Y[0],Z[1]-Y[1]),Y=Z}return q})(),O=B/(B+L);b=Ro(q=>q<O?[P,m.y-B*(q/O)]:Nn(p,I+(Math.PI-I)*((q-O)/(1-O))),0,1,i,200)}else S=Ro(()=>y[t],0,1,e,2),b=Ro(R=>Nn(p,R),M,Math.PI,i);let A=y.concat(S.slice(1),b.slice(1));for(let R=0;R<A.length;R++){let[P,I]=A[R],N=xe.smoothstep(v,-22,-18)*(1-xe.smoothstep(v,-9,-5)),B=xe.smoothstep(I,-2,2)*(1-xe.smoothstep(I,9,13));R<=t&&N*B>0&&(A[R]=[P-4.5*N*B*Math.min(1,(P/p.a-.7)*4),I])}let _=(R,P,I,N)=>R>t+(m?0:e)||N>-21&&N<-6&&I>-1&&I<12&&P>p.a-3.5?1:0;for(let R=0;R<=n;R++){let[P,I]=A[R];a.push(-P,I,v),l.push(_(R,P,I,v))}for(let R=n-1;R>=1;R--){let[P,I]=A[R];a.push(P,I,v),l.push(_(R,P,I,v))}}let c=o.length,h=[],u=[];for(let v=0;v<c-1;v++)for(let p=0;p<r;p++){let m=v*r+p,x=v*r+(p+1)%r,M=(v+1)*r+p,y=(v+1)*r+(p+1)%r,S=l[m]&&l[x]&&l[M]&&l[y]?1:0;h.push(m,x,M,x,y,M),u.push(S,S)}let d=v=>{let p=0;for(let m=0;m<r;m++)p+=a[(v*r+m)*3+1];return p/r},f=a.length/3;a.push(0,d(0),o[0]-.3),l.push(0);let g=a.length/3;a.push(0,d(c-1),o[c-1]+.3),l.push(0);for(let v=0;v<r;v++){let p=(v+1)%r;h.push(f,v,p),u.push(1),h.push(g,(c-1)*r+p,(c-1)*r+v),u.push(1)}return m0(a,h,u.map(v=>v?1:0),2)}function m0(s,t,e,i){let n=new re;n.setAttribute("position",new $t(s,3));let r=[];for(let o=0;o<i;o++){let a=r.length;for(let l=0;l<e.length;l++)e[l]===o&&r.push(t[l*3],t[l*3+1],t[l*3+2]);n.addGroup(a,r.length-a,o)}return n.setIndex(r),n.computeVertexNormals(),n}function jb(s,t){let e=vf(s),i=0,n=Math.PI/2;for(let r=0;r<40;r++){let o=(i+n)/2;Nn(e,o)[0]<t?i=o:n=o}return Nn(e,(i+n)/2)[1]}function Qb(s){let t=s.ringG,e=[];for(let m=yr[0];m<yr[yr.length-1];m+=s.step)e.push(m);e.push(yr[yr.length-1]);let i=2*t+1,n=[],r=[];for(let m of e){let x=d0.half(m),M=jb(m,x)-.7,y=Math.max(.25,d0.roof(m)-M),S=Ro(b=>{let A=Math.sin(b),_=Math.cos(b),R=M+y*Math.pow(Math.max(0,_),2/2.7),P=1-.27*Math.pow((R-M)/y,1.6);return[x*Math.pow(Math.max(0,A),2/2.7)*P,R]},0,Math.PI/2,t);for(let b=t;b>=0;b--)n.push(S[b][0],S[b][1],m),r.push(t-b);for(let b=1;b<=t;b++)n.push(-S[b][0],S[b][1],m),r.push(t-b)}let o=e.length,a=[];for(let m=0;m<o-1;m++)for(let x=0;x<i-1;x++){let M=m*i+x,y=m*i+x+1,S=(m+1)*i+x,b=(m+1)*i+x+1;a.push(M,y,S,y,b,S)}let l=new re;l.setAttribute("position",new $t(n,3)),l.setIndex(a),l.computeVertexNormals();let c=l.attributes.position,h=new T,u=new T,d=new T,f=new T,g=new T,v=new T,p=[];for(let m=0;m<a.length/3;m++){if(m%2===1){p.push(p[m-1]);continue}let x=a[m*3],M=a[m*3+1],y=a[m*3+2];h.fromBufferAttribute(c,x),u.fromBufferAttribute(c,M),d.fromBufferAttribute(c,y),f.crossVectors(g.subVectors(u,h),v.subVectors(d,h)).normalize();let S=(h.z+u.z+d.z)/3,b=Math.abs(f.x),A=Math.min(r[x],r[M],r[y]),_=1;A<=0&&Math.max(r[x],r[M],r[y])<=1?_=2:b>.4&&b<.84||S>-7&&S<15&&f.y>.72?_=0:S>-3.2&&S<.6&&b>=.84?_=2:Math.abs(f.z)>.25&&f.y<.8&&b<.4&&S<-27&&(_=0),p.push(_)}return m0(n,a,p,3)}function $s(s,t){let e=document.createElement("canvas");return e.width=s,e.height=t,e}function Js(s,t=!0){let e=new ri(s);return t&&(e.colorSpace=ze),e.anisotropy=4,e}function Co(s,t,e,i,n,r){s.beginPath(),s.moveTo(t+r,e),s.arcTo(t+i,e,t+i,e+n,r),s.arcTo(t+i,e+n,t,e+n,r),s.arcTo(t,e+n,t,e,r),s.arcTo(t,e,t+i,e,r),s.closePath()}function t1(){let e=$s(256,112),i=$s(256,112),n=e.getContext("2d"),r=i.getContext("2d"),o=l=>{l.beginPath(),l.moveTo(8,70),l.bezierCurveTo(40,20,150,8,248,14),l.lineTo(240,52),l.bezierCurveTo(170,60,90,80,30,104),l.closePath()};o(n);let a=n.createLinearGradient(0,0,0,112);a.addColorStop(0,"#2a3038"),a.addColorStop(1,"#0b0d10"),n.fillStyle=a,n.fill(),n.save(),n.clip();for(let[l,c,h]of[[150,38,17],[196,32,14]]){let u=n.createRadialGradient(l-4,c-4,1,l,c,h);u.addColorStop(0,"#ffffff"),u.addColorStop(.35,"#c9d2dc"),u.addColorStop(1,"#3a414a"),n.fillStyle=u,n.beginPath(),n.arc(l,c,h,0,Math.PI*2),n.fill()}n.restore(),n.lineWidth=3,n.strokeStyle="#8b939c",o(n),n.stroke(),r.fillStyle="#000",r.fillRect(0,0,256,112),r.strokeStyle="#fff",r.lineWidth=7,r.lineCap="round",r.beginPath(),r.moveTo(36,80),r.bezierCurveTo(70,50,120,62,232,44),r.stroke();for(let[l,c,h]of[[150,38,7],[196,32,6]])r.fillStyle="#c8ccd0",r.beginPath(),r.arc(l,c,h,0,Math.PI*2),r.fill();return{map:Js(e),emissiveMap:Js(i)}}function e1(){let e=$s(512,40),i=$s(512,40),n=e.getContext("2d"),r=i.getContext("2d");Co(n,4,6,504,28,12),n.fillStyle="#2a0204",n.fill(),n.strokeStyle="#151618",n.lineWidth=4,n.stroke(),r.fillStyle="#000",r.fillRect(0,0,512,40),r.fillStyle="#ff2030",Co(r,14,15,484,6,3),r.fill();for(let o of[20,402])Co(r,o,11,90,14,6),r.fill();return{map:Js(e),emissiveMap:Js(i)}}function i1(){let e=$s(512,320),i=e.getContext("2d");return i.clearRect(0,0,512,320),i.strokeStyle="rgba(0,0,0,0.9)",i.lineWidth=5,i.beginPath(),i.moveTo(470,40),i.lineTo(476,250),i.quadraticCurveTo(476,290,430,292),i.lineTo(80,292),i.quadraticCurveTo(40,290,38,250),i.lineTo(46,40),i.stroke(),Co(i,120,108,70,14,7),i.fillStyle="rgba(0,0,0,0.55)",i.fill(),i.strokeStyle="rgba(255,255,255,0.18)",i.lineWidth=2,i.beginPath(),i.moveTo(124,107),i.lineTo(186,107),i.stroke(),Js(e)}function f0(s){let i=$s(256,64),n=i.getContext("2d");n.save(),s(n,256,64),n.clip(),n.fillStyle="#060607",n.fillRect(0,0,256,64),n.strokeStyle="#2c2f34",n.lineWidth=1.5;let r=4.5;for(let o=0,a=0;o<64+r;o+=r*1.5,a++)for(let l=a%2*r*.866;l<256+r;l+=r*1.732){n.beginPath();for(let c=0;c<6;c++){let h=Math.PI/3*c+Math.PI/6;n.lineTo(l+Math.cos(h)*r,o+Math.sin(h)*r)}n.closePath(),n.stroke()}return n.restore(),n.strokeStyle="#1a1c20",n.lineWidth=4,s(n,256,64),n.stroke(),Js(i)}function n1(){let e=$s(256,160),i=e.getContext("2d");Co(i,4,4,248,152,18),i.fillStyle="#0a0b0d",i.fill();for(let n=18;n<146;n+=13){let r=i.createLinearGradient(0,n,0,n+9);r.addColorStop(0,"#3a3e45"),r.addColorStop(1,"#121417"),i.fillStyle=r,Co(i,16,n,224,8,4),i.fill()}return Js(e)}function s1(){let s=$s(64,64),t=s.getContext("2d");return t.beginPath(),t.arc(32,32,30,0,Math.PI*2),t.fillStyle="#c9ced6",t.fill(),t.beginPath(),t.arc(32,32,24,0,Math.PI*2),t.fillStyle="#121418",t.fill(),t.fillStyle="#e8ecf2",t.font="italic 900 26px Arial Black, Arial, sans-serif",t.textAlign="center",t.textBaseline="middle",t.fillText("RA",32,34),Js(s)}var Xh=new vi;function _n(s,t,e,i,n=null,r=!1){Xh.position.copy(t),Xh.up.copy(n||new T(0,1,0)),Xh.lookAt(t.clone().add(e));let o=new qh(s,t,Xh.rotation.clone(),i);if(r){let a=o.attributes.uv;for(let l=0;l<a.count;l++)a.setX(l,1-a.getX(l))}return o}function r1(s,t,e){let i=e.wheelSeg,n=s*.68,r=x=>x.rotateZ(-Math.PI/2),o=new ao([new Q(s*.975,-t*.93),new Q(s,-t*.72),new Q(s,t*.72),new Q(s*.975,t*.93)],i);r(o);let a=x=>{let M=[new Q(s*.975,x*t*.93),new Q(s*.93,x*t),new Q(s*.84,x*t*1.02),new Q(s*.75,x*t*.97),new Q(n+.4,x*t*.9),new Q(n,x*t*.84)];x<0&&M.reverse();let y=new ao(M,i);return r(y),y},l=new Qe(n-.2,n-.2,t*1.6,i,1,!0);l.rotateZ(Math.PI/2),l.translate(-t*.1,0,0);let c=new qi(n-.1,.42,6,i);c.rotateY(Math.PI/2),c.translate(t*.8,0,0);let h=[],u=10;for(let x=0;x<u;x++){let M=new De(1.3,n-s*.2,1.5,1,4,1);M.translate(0,(n+s*.2)/2-.2,0);let y=M.attributes.position;for(let S=0;S<y.count;S++){let A=(y.getY(S)-s*.2)/(n-s*.2);y.setZ(S,y.getZ(S)*(1.25-.45*A)),y.setX(S,y.getX(S)+t*(.48+.3*A))}M.rotateX((x-x%2)/u*Math.PI*2+(x%2?.2:-.2)+.3),h.push(M)}let d=new Qe(s*.22,s*.24,1.6,20);d.rotateZ(Math.PI/2),d.translate(t*.5,0,0);let f=new In(s*.12,20);f.rotateY(Math.PI/2),f.translate(t*.5+.82,0,0);let g=[];for(let x=0;x<5;x++){let M=new Qe(.45,.45,.9,6);M.rotateZ(Math.PI/2);let y=x/5*Math.PI*2;M.translate(t*.5+.9,Math.cos(y)*s*.165,Math.sin(y)*s*.165),g.push(M)}let v=new Qe(s*.6,s*.6,1.2,i);v.rotateZ(Math.PI/2),v.translate(-t*.05,0,0);let p=new qi(s*.55,1.15,6,10,1);p.scale(1,1,1.9),p.rotateY(Math.PI/2),p.rotateX(Math.PI*.62),p.translate(t*.08,0,0);let m=x=>{let M=o1(x);for(let y of x)y.dispose();return M};return{tread:o,sideOut:a(1),sideIn:a(-1),barrel:l,lip:c,spokes:m(h.concat([d])),nuts:m(g),cap:f,disc:v,caliper:p}}function o1(s){let t=s.map(l=>l.index?l.toNonIndexed():l),e=0;for(let l of t)e+=l.attributes.position.count;let i=new Float32Array(e*3),n=new Float32Array(e*3),r=new Float32Array(e*2),o=0;for(let l of t)i.set(l.attributes.position.array,o*3),l.attributes.normal&&n.set(l.attributes.normal.array,o*3),l.attributes.uv&&r.set(l.attributes.uv.array,o*2),o+=l.attributes.position.count;let a=new re;return a.setAttribute("position",new ge(i,3)),a.setAttribute("normal",new ge(n,3)),a.setAttribute("uv",new ge(r,2)),a}var p0={high:{step:1.1,ringA:26,ringB:5,ringC:12,ringG:18,wheelSeg:40},medium:{step:1.6,ringA:20,ringB:4,ringC:9,ringG:14,wheelSeg:28},low:{step:2.6,ringA:14,ringB:3,ringC:6,ringG:9,wheelSeg:18}},Yh={};function g0(s="high"){if(Yh[s])return Yh[s];let t=p0[s]||p0.high,e=Kb(t),i=Qb(t),n=new ot(e);n.updateMatrixWorld(!0),new ot(i).updateMatrixWorld(!0);let o=(h,u,d)=>new T(h,u,d),a={headR:_n(n,o(-28.5,5,76.5),o(-.62,.22,.75).normalize(),o(17,7.4,12)),headL:_n(n,o(28.5,5,76.5),o(.62,.22,.75).normalize(),o(17,7.4,12),null,!1),tail:_n(n,o(0,14.2,-57),o(0,.15,-1).normalize(),o(72,5.6,9)),doorR:_n(n,o(-40,5,12.5),o(-1,0,0),o(41,26,9)),doorL:_n(n,o(40,5,12.5),o(1,0,0),o(41,26,9)),numR:_n(n,o(-40,3.5,10),o(-1,0,0),o(21,12.5,9)),numL:_n(n,o(40,3.5,10),o(1,0,0),o(21,12.5,9)),scoopR:_n(n,o(-41,5.2,-13.5),o(-1,0,0),o(15.5,13,12)),scoopL:_n(n,o(41,5.2,-13.5),o(1,0,0),o(15.5,13,12)),grille:_n(n,o(0,-3.2,83),o(0,.05,1).normalize(),o(52,7,10)),louvers:_n(n,o(0,22,-45.5),o(0,1,0),o(30,16,8),o(0,0,-1)),badge:_n(n,o(0,3.4,81.6),o(0,.55,.84).normalize(),o(5.5,5.5,6))};for(let h of["headR","doorR","numR","scoopR"]){let u=a[h].attributes.uv;for(let d=0;d<u.count;d++)u.setX(d,1-u.getX(d))}let l={};for(let h of Nt.wheels){let u=h.r<14?5.5:6.5;l[h.r]||(l[h.r]=r1(h.r,u,t))}let c=[e,i,...Object.values(a)];for(let h of Object.values(l))c.push(...Object.values(h));for(let h of c)h.userData.shared=!0;return Yh[s]={body:e,greenhouse:i,decals:a,wheels:l,arches:xf},Yh[s]}var Zh=null;function v0(){return Zh||(Zh={head:t1(),tail:e1(),panel:i1(),grille:f0((s,t,e)=>{s.beginPath(),s.moveTo(6,10),s.lineTo(t-6,10),s.lineTo(t-34,e-6),s.lineTo(34,e-6),s.closePath()}),scoop:f0((s,t,e)=>{s.beginPath(),s.moveTo(16,10),s.lineTo(t-8,4),s.lineTo(t-20,e-6),s.lineTo(30,e-10),s.closePath()}),louvers:n1(),badge:s1()},Zh)}function _r(s,t,e){let i=vf(s),[n,r]=Nn(i,e);return new T(t*n,r,s)}var ml=null;function x0(){if(ml)return ml;let s=u0();s.repeat.set(6,1);let t=v0(),e={transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4};ml={tireMat:new qt({color:2302757,map:s,roughness:.92,metalness:0}),sidewallMat:new qt({color:1579034,roughness:.72,metalness:0}),rimMat:new qt({color:2895668,roughness:.3,metalness:.95}),lipMat:new qt({color:14278373,roughness:.16,metalness:1}),barrelMat:new qt({color:1711136,roughness:.5,metalness:.8,side:oe}),discMat:new qt({color:7040627,roughness:.42,metalness:.9}),darkMat:new qt({color:855568,roughness:.55,metalness:.25}),trimMat:new qt({color:460810,roughness:.18,metalness:.4}),carbonMat:new qt({color:1316120,roughness:.38,metalness:.5}),glassMat:new co({color:395533,roughness:.04,metalness:.1,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.6}),chromeMat:new qt({color:14673130,roughness:.1,metalness:1}),headMat:new qt({...e,map:t.head.map,emissiveMap:t.head.emissiveMap,emissive:16054527,emissiveIntensity:2.4,roughness:.08,metalness:.4}),tailMat:new qt({...e,map:t.tail.map,emissiveMap:t.tail.emissiveMap,emissive:16716840,emissiveIntensity:3.2,roughness:.15}),panelMat:new ve({...e,map:t.panel}),grilleMat:new qt({...e,map:t.grille,roughness:.6}),scoopMat:new qt({...e,map:t.scoop,roughness:.6}),louverMat:new qt({...e,map:t.louvers,roughness:.45,metalness:.4}),badgeMat:new qt({...e,map:t.badge,roughness:.2,metalness:.7}),spikeMat:new qt({color:2830134,roughness:.3,metalness:.9,emissive:5246984,emissiveIntensity:.6}),caliperMats:[new qt({color:16761370,roughness:.35,metalness:.25}),new qt({color:14163486,roughness:.35,metalness:.25})],geo:{}};let i=ml.geo;i.mirror=new ai(1,16,10),i.mirror.scale(3.4,2.1,2.6),i.mirrorGlass=new In(1,14),i.mirrorGlass.scale(2.9,1.7,1),i.stalk=new De(5,1.1,2),i.wing=a1(),i.endplate=new De(.9,9,15),i.upright=l1(),i.splitter=new De(52,.8,6),i.diffuser=new De(48,.8,11),i.fin=new De(.7,5,10),i.pipe=new Qe(3.3,3.3,5,20,1,!0),i.pipe.rotateX(Math.PI/2),i.pipeInner=new In(2.7,20),i.pipeInner.rotateY(Math.PI),i.pipeRim=new qi(3.2,.45,6,20);for(let n in i)i[n].userData.shared=!0;return ml}function a1(){let s=new Kn;s.moveTo(7,0),s.bezierCurveTo(4,1.6,-3,2.4,-7,1.2),s.lineTo(-7.2,.4),s.bezierCurveTo(-3,.6,3,0,7,-.3),s.closePath();let t=new oo(s,{depth:68,bevelEnabled:!0,bevelThickness:.4,bevelSize:.3,bevelSegments:2,curveSegments:10});return t.translate(0,0,-34),t.rotateY(Math.PI/2),t}function l1(){let s=new Kn;s.moveTo(0,0),s.lineTo(5,0),s.quadraticCurveTo(3,6,-1,11.5),s.lineTo(-4,11.5),s.quadraticCurveTo(1,5,0,0);let t=new oo(s,{depth:1.2,bevelEnabled:!1});return t.translate(0,0,-.6),t.rotateY(-Math.PI/2),t}function c1(s,t){let e=document.createElement("canvas");e.width=256,e.height=160;let i=e.getContext("2d");i.font="italic 900 132px Arial Black, Arial, sans-serif",i.textAlign="center",i.textBaseline="middle",i.lineJoin="round",i.lineWidth=18,i.strokeStyle="#101216",i.strokeText(String(s),128,84),i.fillStyle="#f4f6fa",i.fillText(String(s),128,84),i.lineWidth=4,i.strokeStyle=t,i.strokeText(String(s),128,84);let n=new ri(e);return n.colorSpace=ze,n}var $h=class{constructor(t,e=0,i="high"){let n=x0(),r=g0(i),o=Ie[t];this.team=t,this.root=new Me,this.body=new Me,this.body.scale.setScalar(.01),this.root.add(this.body);let a=new co({color:o.main,metalness:.4,roughness:.32,clearcoat:1,clearcoatRoughness:.035,envMapIntensity:1.2});this.paint=a;let l=(v,p,m=0,x=0,M=0,y=this.body,S=!0)=>{let b=new ot(v,p);return b.position.set(m,x,M),b.castShadow=S,b.receiveShadow=S,y.add(b),b};l(r.body,[a,n.darkMat]),l(r.greenhouse,[a,n.glassMat,n.trimMat]);let c=r.decals;for(let v of["headR","headL"])l(c[v],n.headMat,0,0,0,this.body,!1);l(c.tail,n.tailMat,0,0,0,this.body,!1);for(let v of["doorR","doorL"])l(c[v],n.panelMat,0,0,0,this.body,!1);for(let v of["scoopR","scoopL"])l(c[v],n.scoopMat,0,0,0,this.body,!1);if(l(c.grille,n.grilleMat,0,0,0,this.body,!1),l(c.louvers,n.louverMat,0,0,0,this.body,!1),l(c.badge,n.badgeMat,0,0,0,this.body,!1),e){let v=new qt({map:c1(e,o.css),transparent:!0,depthWrite:!1,roughness:.3,metalness:.2,polygonOffset:!0,polygonOffsetFactor:-5,polygonOffsetUnits:-5});for(let p of["numR","numL"])l(c[p],v,0,0,0,this.body,!1)}for(let v of[-1,1]){let p=l(n.geo.mirror,a,v*36.6,22,30);p.rotation.y=v*.2;let m=l(n.geo.mirrorGlass,n.chromeMat,v*36.9,22,27.45,this.body,!1);m.rotation.y=Math.PI;let x=l(n.geo.stalk,n.darkMat,v*34,19.6,30.6);x.rotation.z=v*.6}l(n.geo.splitter,n.carbonMat,0,-9.3,79),l(n.geo.diffuser,n.carbonMat,0,-7.6,-53);for(let v=-2;v<=2;v++)l(n.geo.fin,n.carbonMat,v*9,-5.4,-53.5);for(let v of[-1,1])l(n.geo.upright,n.carbonMat,v*13,21.2,-45);l(n.geo.wing,n.carbonMat,0,32.4,-50.5);for(let v of[-1,1])l(n.geo.endplate,n.carbonMat,v*34.6,31.6,-50.5);for(let v of[-1,1]){l(n.geo.pipe,n.chromeMat,v*6,1.5,-57.2);let p=l(n.geo.pipeRim,n.chromeMat,v*6,1.5,-59.6,this.body,!1);p.rotation.y=0,l(n.geo.pipeInner,n.darkMat,v*6,1.5,-58.6,this.body,!1)}this.wheels=[];let h=n.caliperMats[t];for(let v of Nt.wheels){let p=Math.sign(v.x),m=r.wheels[v.r],x=new Me;x.position.set(p*(Math.abs(v.x)+7),-Nt.restHeight+v.r,v.z);let M=new Me;x.add(M);let y=new Me;p<0&&(y.rotation.y=Math.PI),M.add(y),l(m.tread,n.tireMat,0,0,0,y),l(m.sideOut,n.sidewallMat,0,0,0,y),l(m.sideIn,n.sidewallMat,0,0,0,y),l(m.barrel,n.barrelMat,0,0,0,y,!1),l(m.lip,n.lipMat,0,0,0,y,!1),l(m.spokes,n.rimMat,0,0,0,y),l(m.nuts,n.chromeMat,0,0,0,y,!1),l(m.cap,n.badgeMat,0,0,0,y,!1),l(m.disc,n.discMat,0,0,0,y,!1);let S=new Me;p<0&&(S.rotation.y=Math.PI),l(m.caliper,h,0,0,0,S,!1),x.add(S),this.body.add(x),this.wheels.push({pivot:x,spin:M,front:v.front,r:v.r,baseY:x.position.y})}let u=new St(...o.flame),d=new ys(7,46,16,1,!0);d.translate(0,-23,0),d.rotateX(-Math.PI/2),this.flame=new ot(d,new ve({color:u.clone().multiplyScalar(1.4),transparent:!0,opacity:.75,blending:Te,depthWrite:!1,fog:!1})),this.flame.position.set(0,1.5,-59);let f=new ys(3.6,26,12,1,!0);f.translate(0,-13,0),f.rotateX(-Math.PI/2),this.flameCore=new ot(f,new ve({color:new St(2.2,2.2,2.2),transparent:!0,opacity:.9,blending:Te,depthWrite:!1,fog:!1})),this.flame.add(this.flameCore),this.body.add(this.flame),this.flame.visible=!1,this.exhaustGlow=new Me;let g=new ve({color:u.clone().multiplyScalar(1.5),transparent:!0,opacity:.6,blending:Te,depthWrite:!1});this.exhaustGlow.material=g;for(let v of[-1,1]){let p=new ot(n.geo.pipeInner,g);p.position.set(v*6,1.5,-58.4),this.exhaustGlow.add(p)}this.body.add(this.exhaustGlow),this.flicker=0,this.spikes=null,this.powerOn=!1}setSpikes(t){if(t&&!this.spikes){let e=x0();this.spikes=new Me;let i=new ys(3.2,13,6),n=[new T(0,33.5,2),new T(13,32,-6),new T(-13,32,-6),new T(13,32,10),new T(-13,32,10),new T(0,14.5,58),_r(64,1,.33),_r(64,-1,.33),new T(0,0,84),_r(30,1,.5),_r(30,-1,.5),_r(-22,1,.42),_r(-22,-1,.42),new T(0,21,-46),new T(0,15,-58)];for(let r of n){let o=new ot(i,e.spikeMat);o.position.copy(r);let a=new T(r.x,r.y+10,(r.z-10)*.6).normalize();o.quaternion.setFromUnitVectors(new T(0,1,0),a),this.spikes.add(o)}this.body.add(this.spikes)}this.spikes&&(this.spikes.visible=t)}setPower(t,e){t?(this.paint.emissive.setRGB(1,.08,.02),this.paint.emissiveIntensity=.5+Math.sin(e*14)*.25):this.powerOn&&(this.paint.emissive.setRGB(0,0,0),this.paint.emissiveIntensity=1),this.powerOn=t}update(t,e,i,n){if(this.root.visible=!t.demolished,t.demolished)return;this.root.position.set(e.x*.01,e.y*.01,e.z*.01),this.root.quaternion.copy(i);for(let o of this.wheels)o.spin.rotation.x=t.wheelSpin*(12.5/o.r),o.front&&(o.pivot.rotation.y=-t.steerVisual*.42);for(let o=0;o<4;o++){let a=this.wheels[o],l=t.wheelDist[o],c=l>=0?a.baseY+(Nt.restHeight-l)*.6:a.baseY-4;a.pivot.position.y+=(Math.max(a.baseY-6,Math.min(a.baseY+6,c))-a.pivot.position.y)*Math.min(1,n*20)}this.flicker+=n*40;let r=t.boosting;if(this.flame.visible=r,r){let o=.85+Math.sin(this.flicker)*.12+Math.random()*.15;this.flame.scale.set(o,o,o*(t.supersonic?1.35:1))}this.exhaustGlow.material.opacity=r?1:.45}};var Jh=class{constructor(t,e){this.max=t,this.count=0,this.p=new Float32Array(t*3),this.v=new Float32Array(t*3),this.life=new Float32Array(t),this.maxLife=new Float32Array(t),this.size=new Float32Array(t*2),this.c0=new Float32Array(t*4),this.c1=new Float32Array(t*4),this.phys=new Float32Array(t*4);let i=new Ga,n=new oi(1,1);i.index=n.index,i.setAttribute("position",n.attributes.position),i.setAttribute("uv",n.attributes.uv),this.aPos=new Jn(new Float32Array(t*3),3).setUsage(Ki),this.aCol=new Jn(new Float32Array(t*4),4).setUsage(Ki),this.aSR=new Jn(new Float32Array(t*2),2).setUsage(Ki),i.setAttribute("iPos",this.aPos),i.setAttribute("iCol",this.aCol),i.setAttribute("iSR",this.aSR),i.instanceCount=0,this.geo=i;let r=new fe({transparent:!0,depthWrite:!1,blending:e?Te:mn,uniforms:{},vertexShader:`
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
        }`});this.mesh=new ot(i,r),this.mesh.frustumCulled=!1,this.mesh.renderOrder=e?5:4}emit(t,e,i,n,r,o,a,l,c,h,u,d=0,f=0,g=0){let v;this.count<this.max?v=this.count++:v=Math.floor(Math.random()*this.max),this.p[v*3]=t,this.p[v*3+1]=e,this.p[v*3+2]=i,this.v[v*3]=n,this.v[v*3+1]=r,this.v[v*3+2]=o,this.life[v]=a,this.maxLife[v]=a,this.size[v*2]=l,this.size[v*2+1]=c,this.c0.set(h,v*4),this.c1.set(u,v*4),this.phys[v*4]=d,this.phys[v*4+1]=f,this.phys[v*4+2]=Math.random()*6.28,this.phys[v*4+3]=g}update(t){let{p:e,v:i,life:n,maxLife:r,size:o,c0:a,c1:l,phys:c}=this,h=this.aPos.array,u=this.aCol.array,d=this.aSR.array,f=this.count;for(let g=0;g<f;g++){if(n[g]-=t,n[g]<=0){f--,g!==f&&(e.copyWithin(g*3,f*3,f*3+3),i.copyWithin(g*3,f*3,f*3+3),n[g]=n[f],r[g]=r[f],o.copyWithin(g*2,f*2,f*2+2),a.copyWithin(g*4,f*4,f*4+4),l.copyWithin(g*4,f*4,f*4+4),c.copyWithin(g*4,f*4,f*4+4),g--);continue}let v=Math.max(0,1-c[g*4]*t);i[g*3]*=v,i[g*3+1]=i[g*3+1]*v-c[g*4+1]*t,i[g*3+2]*=v,e[g*3]+=i[g*3]*t,e[g*3+1]+=i[g*3+1]*t,e[g*3+2]+=i[g*3+2]*t,c[g*4+2]+=c[g*4+3]*t}this.count=f;for(let g=0;g<f;g++){let v=1-n[g]/r[g];h[g*3]=e[g*3],h[g*3+1]=e[g*3+1],h[g*3+2]=e[g*3+2];for(let p=0;p<4;p++)u[g*4+p]=a[g*4+p]+(l[g*4+p]-a[g*4+p])*v;d[g*2]=o[g*2]+(o[g*2+1]-o[g*2])*v,d[g*2+1]=c[g*4+2]}this.geo.instanceCount=f,f>0&&(this.aPos.clearUpdateRanges(),this.aPos.addUpdateRange(0,f*3),this.aPos.needsUpdate=!0,this.aCol.clearUpdateRanges(),this.aCol.addUpdateRange(0,f*4),this.aCol.needsUpdate=!0,this.aSR.clearUpdateRanges(),this.aSR.addUpdateRange(0,f*2),this.aSR.needsUpdate=!0)}clear(){this.count=0,this.geo.instanceCount=0}},Ue=new T,ni=new T,yf=new T,Po=new T,Ge=new T,lt=(s,t)=>s+Math.random()*(t-s),Kh=class{constructor(t,e){this.scene=t,this.mult=e==="low"?.45:e==="medium"?.75:1,this.glow=new Jh(e==="low"?1500:4e3,!0),this.smoke=new Jh(e==="low"?600:1800,!1),t.add(this.glow.mesh,this.smoke.mesh),this.flashes=[],this.sphereGeo=new ai(1,32,16),this.ringGeo=new qi(1,.06,8,64)}clear(){this.glow.clear(),this.smoke.clear();for(let t of this.flashes)this.scene.remove(t.mesh);this.flashes.length=0}carTrail(t,e,i,n){if(t.demolished)return;let r=Ie[t.team];if(ni.set(0,0,1).applyQuaternion(i),yf.set(0,1,0).applyQuaternion(i),Po.set(1,0,0).applyQuaternion(i),t.boosting){Ge.copy(e).addScaledVector(ni,-60).addScaledVector(yf,1.5).multiplyScalar(.01);let o=Ue.copy(t.vel).multiplyScalar(.01),a=Math.max(1,Math.round(n*150*this.mult)),l=r.flame,c=r.flameEnd;for(let h=0;h<a;h++){let u=lt(7,12),d=Math.random()*n;this.glow.emit(Ge.x-ni.x*u*d+lt(-.03,.03),Ge.y-ni.y*u*d+lt(-.03,.03),Ge.z-ni.z*u*d+lt(-.03,.03),o.x*.2-ni.x*u+lt(-.5,.5),o.y*.2-ni.y*u+lt(-.5,.5),o.z*.2-ni.z*u+lt(-.5,.5),lt(.1,.2),lt(.12,.2),lt(.3,.55),[l[0]*1.1,l[1]*1.1,l[2]*1.1,.55],[c[0],c[1],c[2],0],2,0)}if(Math.random()<n*40*this.mult){let h=[c[0]*.9+.1,c[1]*.9+.1,c[2]*.9+.1];this.smoke.emit(Ge.x-ni.x*.4,Ge.y-ni.y*.4,Ge.z-ni.z*.4,o.x*.25-ni.x*2+lt(-.4,.4),o.y*.25+lt(0,.6),o.z*.25-ni.z*2+lt(-.4,.4),lt(.7,1.1),.35,lt(1.4,2.2),[h[0],h[1],h[2],.22],[.25,.25,.28,0],1.2,-.3,lt(-1,1))}}if(t.boosting&&Math.random()<n*60*this.mult){let o=r.flame,a=Ue.copy(t.vel).multiplyScalar(.01*.3);for(let l=0;l<2;l++)this.glow.emit(Ge.x,Ge.y,Ge.z,a.x-ni.x*lt(4,9)+lt(-2.5,2.5),a.y+lt(-1,3),a.z-ni.z*lt(4,9)+lt(-2.5,2.5),lt(.25,.55),lt(.05,.09),.02,[o[0]*3,o[1]*3,o[2]*3,1],[o[0],o[1]*.6,o[2]*.4,0],1.5,7)}if(t.supersonic)for(let o of[-1,1])Math.random()>.8*this.mult||(Ge.copy(e).addScaledVector(Po,o*30).addScaledVector(ni,-36).addScaledVector(yf,5).multiplyScalar(.01),this.glow.emit(Ge.x,Ge.y,Ge.z,0,0,0,.28,.12,.04,[1.6,1.7,1.8,.8],[.8,.9,1,0],0,0))}dirt(t,e,i,n,r){if(n<=0)return;ni.set(0,0,1).applyQuaternion(i),Po.set(1,0,0).applyQuaternion(i);let o=Math.round(r*70*n*this.mult+Math.random());for(let a=0;a<o;a++){let l=a%2?1:-1;Ge.copy(e).addScaledVector(Po,l*34).addScaledVector(ni,-36).multiplyScalar(.01);let c=lt(2,6),u=Math.random()<.45?[.12,.22,.06,1]:[.16,.11,.06,1];this.smoke.emit(Ge.x,.12,Ge.z,t.vel.x*.01*.2-ni.x*c+Po.x*l*lt(0,2),lt(2.5,5.5),t.vel.z*.01*.2-ni.z*c+Po.z*l*lt(0,2),lt(.5,.9),lt(.05,.11),lt(.04,.08),u,[u[0],u[1],u[2],.7],.3,13,lt(-10,10))}Math.random()<r*10*n*this.mult&&(Ge.copy(e).addScaledVector(ni,-40).multiplyScalar(.01),this.smoke.emit(Ge.x,.15,Ge.z,-ni.x*1.5,lt(.3,.9),-ni.z*1.5,lt(.7,1.2),.3,lt(1,1.6),[.36,.33,.25,.3],[.3,.28,.24,0],1,-.2,lt(-1,1)))}pyro(t,e,i){let n=Ie[e];for(let r of t){let o=Math.round(i*110*this.mult);for(let a=0;a<o;a++){let l=Math.random()<.5;this.glow.emit(r.x*.01+lt(-.3,.3),r.y*.01,r.z*.01+lt(-.3,.3),lt(-.8,.8),lt(14,22),lt(-.8,.8),lt(.35,.7),lt(.5,.9),lt(1.1,1.9),l?[2.1,1,.25,.85]:[n.flame[0]*1.6,n.flame[1]*1.1,n.flame[2]*.9,.8],[.9,.18,.03,0],1.2,2)}}}ballTrail(t,e){let i=t.vel.length();i<2600||Math.random()>(i-2600)/2e3*this.mult||(Ge.copy(e).multiplyScalar(.01),this.glow.emit(Ge.x+lt(-.3,.3),Ge.y+lt(-.3,.3),Ge.z+lt(-.3,.3),0,0,0,.35,1,.2,[.6,.85,1.4,.35],[.2,.4,1,0],0,0))}hit(t,e){let i=Ge.copy(t).multiplyScalar(.01),n=Math.round(Math.min(40,e/60)*this.mult);for(let r=0;r<n;r++){let o=lt(3,9)*Math.min(2,e/1500);Ue.set(lt(-1,1),lt(-.2,1),lt(-1,1)).normalize().multiplyScalar(o),this.glow.emit(i.x,i.y,i.z,Ue.x,Ue.y,Ue.z,lt(.15,.35),lt(.06,.12),.02,[3,2.6,1.8,1],[2,.8,.2,0],2,6)}e>1800&&this.flash(i,12575743,1.6,.18,2.5)}boostPickup(t){let e=Math.round((t.big?40:12)*this.mult);for(let i=0;i<e;i++)this.glow.emit(t.x*.01+lt(-.6,.6),lt(.1,.4),t.z*.01+lt(-.6,.6),lt(-1,1),lt(2,6),lt(-1,1),lt(.3,.6),lt(.1,.25),.02,[3,1.8,.4,1],[2,.6,.05,0],1,2)}flash(t,e,i,n,r=3){let o=new ve({color:new St(e).multiplyScalar(r),transparent:!0,blending:Te,depthWrite:!1,fog:!1}),a=new ot(this.sphereGeo,o);a.position.copy(t),a.scale.setScalar(.01),this.scene.add(a),this.flashes.push({mesh:a,t:0,dur:n,size:i,kind:"sphere"})}ring(t,e,i,n){let r=new ve({color:new St(e).multiplyScalar(4),transparent:!0,blending:Te,depthWrite:!1,fog:!1}),o=new ot(this.ringGeo,r);o.position.copy(t),o.rotation.x=Math.PI/2,this.scene.add(o),this.flashes.push({mesh:o,t:0,dur:n,size:i,kind:"ring"})}explosion(t,e,i){let n=Ie[e],r=Ge.copy(t).multiplyScalar(.01).clone(),o=n.flame,a=n.flameEnd,l=Math.round((i?420:140)*this.mult),c=i?28:12;for(let u=0;u<l;u++)Ue.set(lt(-1,1),lt(-.3,1),lt(-1,1)).normalize().multiplyScalar(lt(.2,1)*c),this.glow.emit(r.x,r.y,r.z,Ue.x,Ue.y,Ue.z,lt(.5,i?1.6:.9),lt(.3,.8),lt(.1,.4),[o[0]*3,o[1]*3,o[2]*3,1],[a[0]*2,a[1]*2,a[2]*2,0],2.2,i?3:4);let h=Math.round((i?90:40)*this.mult);for(let u=0;u<h;u++)Ue.set(lt(-1,1),lt(0,1),lt(-1,1)).normalize().multiplyScalar(lt(1,i?10:5)),this.smoke.emit(r.x,r.y,r.z,Ue.x,Ue.y,Ue.z,lt(1.2,2.4),lt(.8,1.4),lt(2.5,i?6:3.5),[.3,.3,.33,.55],[.12,.12,.14,0],1.6,-.6,lt(-1,1));this.flash(r,n.main,i?9:3,i?.55:.3,4),this.ring(r,n.light,i?26:8,i?.9:.5)}demolition(t,e){let i=Ie[e],n=Ge.copy(t).multiplyScalar(.01).clone();n.y+=.3;let r=Math.round(170*this.mult);for(let c=0;c<r;c++){Ue.set(lt(-1,1),lt(-.2,1),lt(-1,1)).normalize().multiplyScalar(lt(2,11));let h=Math.random()<.35;this.glow.emit(n.x,n.y,n.z,Ue.x,Ue.y,Ue.z,lt(.3,.8),lt(.3,.7),lt(.1,.35),h?[1.8,1.3,.7,.7]:[1.6,.6,.12,.7],[.8,.15,.02,0],2.5,-1.5)}let o=Math.round(60*this.mult);for(let c=0;c<o;c++)Ue.set(lt(-1,1),lt(0,1.2),lt(-1,1)).normalize().multiplyScalar(lt(6,16)),this.glow.emit(n.x,n.y,n.z,Ue.x,Ue.y,Ue.z,lt(.4,.8),lt(.08,.16),.03,[i.flame[0]*3,i.flame[1]*3,i.flame[2]*3,1],[i.flameEnd[0],i.flameEnd[1],i.flameEnd[2],0],1,9);let a=Math.round(40*this.mult);for(let c=0;c<a;c++)Ue.set(lt(-1,1),lt(.4,1.4),lt(-1,1)).normalize().multiplyScalar(lt(5,13)),this.smoke.emit(n.x,n.y,n.z,Ue.x,Ue.y,Ue.z,lt(.8,1.5),lt(.12,.25),lt(.08,.15),[.05,.05,.06,1],[.05,.05,.06,.8],.4,14,lt(-12,12));let l=Math.round(70*this.mult);for(let c=0;c<l;c++)Ue.set(lt(-1,1),lt(.2,1),lt(-1,1)).normalize().multiplyScalar(lt(1,5)),this.smoke.emit(n.x,n.y,n.z,Ue.x,Ue.y,Ue.z,lt(1.6,3),lt(.8,1.4),lt(3,5.5),[.12,.1,.1,.75],[.05,.05,.06,0],1.3,-.8,lt(-1,1));this.flash(n,16747056,3,.25,2),this.ring(n,16756832,10,.55)}update(t){this.glow.update(t),this.smoke.update(t);for(let e=this.flashes.length-1;e>=0;e--){let i=this.flashes[e];i.t+=t;let n=i.t/i.dur;if(n>=1){this.scene.remove(i.mesh),i.mesh.material.dispose(),this.flashes.splice(e,1);continue}let r=1-Math.pow(1-n,3);i.mesh.scale.setScalar(Math.max(.01,i.size*r)),i.mesh.material.opacity=1-n}}};var h1=new T(0,1,0),Li=new T,cn=new T,_f=new T,u1=new T,bn=new T,y0=new he,Io=new T,_0=new he;function gl(s,t,e,i){return xe.clamp(t.dot(e),-1,1)>.99999?s.copy(e):(y0.setFromUnitVectors(t,e),_0.identity().slerp(y0,i),s.copy(t).applyQuaternion(_0))}var Lo=class{constructor(t){this.camera=t,this.dir=new T(0,0,1),this.camUp=new T(0,1,0),this.look=new T(0,0,1),this.pos=new T,this.ballCam=!0,this.shake=0,this.first=!0,this.distance=280,this.height=105,this.lookYaw=0}snap(){this.first=!0}addShake(t){this.shake=Math.min(1.5,this.shake+t)}update(t,e,i,n,r,o=0,a=0){let l=e.onGround&&e.groundNormal.y>-.2,c=l?e.groundNormal:h1;this.first?this.camUp.copy(c):gl(this.camUp,this.camUp,c,1-Math.exp(-t*(l?9:4)));let h=this.camUp;this.ballCam&&r?Li.copy(r).sub(i):(Li.set(0,0,1).applyQuaternion(n),!e.onGround&&e.vel.lengthSq()>500*500&&Li.lerp(cn.copy(e.vel).normalize(),.5)),Li.addScaledVector(c,-Li.dot(c)),Li.lengthSq()<1&&(Li.set(0,0,1).applyQuaternion(n),Li.addScaledVector(c,-Li.dot(c)),Li.lengthSq()<1e-4&&Li.copy(this.dir)),Li.normalize();let u=this.dir.dot(Li);this.first?this.dir.copy(Li):u<-.95?(cn.crossVectors(h,this.dir).normalize(),this.dir.addScaledVector(cn,.25).normalize()):gl(this.dir,this.dir,Li,this.ballCam?1-Math.exp(-t*7.5):1-Math.exp(-t*6)),cn.copy(this.dir).addScaledVector(h,-this.dir.dot(h)),cn.lengthSq()<.001&&cn.copy(Li).addScaledVector(h,-Li.dot(h)),cn.lengthSq()>1e-6&&this.dir.copy(cn).normalize(),this.lookYaw+=(o*Math.PI*.95-this.lookYaw)*Math.min(1,t*10);let d=u1.copy(this.dir);Math.abs(this.lookYaw)>.001&&d.applyAxisAngle(h,-this.lookYaw);let f=e.vel.length(),g=this.distance+Math.min(60,f*.02),v=cn.copy(i).addScaledVector(d,-g).addScaledVector(h,this.height+a*-60);this.first?this.pos.copy(v):this.pos.lerp(v,1-Math.exp(-t*14));for(let m=0;m<2;m++){let x=on(this.pos.x,this.pos.y,this.pos.z);x<40&&(bs(this.pos.x,this.pos.y,this.pos.z,_f),this.pos.addScaledVector(_f,40-x))}if(Io.copy(i).addScaledVector(h,70).addScaledVector(d,260),bn.copy(Io).sub(this.pos).normalize(),this.ballCam&&r&&Math.abs(this.lookYaw)<.3){let m=cn.copy(r).sub(this.pos).normalize();bn.copy(m);let x=_f.copy(i).addScaledVector(h,10).sub(this.pos).normalize(),M=xe.degToRad(this.camera.fov*.5)*.82,y=Math.acos(xe.clamp(x.dot(bn),-1,1));y>M&&gl(bn,x,bn,M/y);let S=bn.dot(h);S<-.35&&bn.addScaledVector(h,-.35-S).normalize()}this.first?this.look.copy(bn):gl(this.look,this.look,bn,1-Math.exp(-t*12)),this.first=!1,this.shake=Math.max(0,this.shake-t*2.2);let p=this.shake*this.shake*14;this.camera.up.copy(h),this.camera.position.set((this.pos.x+(Math.random()-.5)*p)*.01,(this.pos.y+(Math.random()-.5)*p)*.01,(this.pos.z+(Math.random()-.5)*p)*.01),Io.copy(this.pos).addScaledVector(this.look,1e3).multiplyScalar(.01),this.camera.lookAt(Io)}updateReplay(t,e,i,n){let r=Math.sign(e.x||1);cn.set(r*2600+Math.sin(n*.3)*400,900,i*.55),this.first&&this.pos.copy(cn),this.pos.lerp(cn,1-Math.exp(-t*1.5)),bn.copy(e).sub(this.pos).normalize(),this.first?this.look.copy(bn):gl(this.look,this.look,bn,1-Math.exp(-t*6)),this.first=!1,this.camera.up.set(0,1,0),this.camera.position.copy(this.pos).multiplyScalar(.01),Io.copy(this.pos).addScaledVector(this.look,1e3).multiplyScalar(.01),this.camera.lookAt(Io)}};var d1=new T(0,1,0),vl=new T,Do=new T,M0=new T,b0=new T,Hi=(s,t)=>s+Math.random()*(t-s);function f1(){let s=document.createElement("canvas");s.width=s.height=256;let t=s.getContext("2d");t.fillStyle="rgba(255,255,255,0.22)",t.fillRect(0,0,256,256);for(let i=0;i<80;i++){let n=Math.random()*256,r=6+Math.random()*26,o=t.createLinearGradient(n,0,n+r,0),a=.35+Math.random()*.6;o.addColorStop(0,"rgba(255,255,255,0)"),o.addColorStop(.5,`rgba(255,255,255,${a})`),o.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=o,t.save(),t.translate(n,128),t.transform(1,0,-.6,1,0,0),t.fillRect(-r/2,-160,r,320),t.restore()}let e=new ri(s);return e.wrapS=e.wrapT=Ji,e}var jh=class{constructor(t,e,i){this.group=t,this.effects=e,this.mode=i,this.time=0,this.cableGeo=new Qe(1,1,1,6,1,!0),this.cableGeo.translate(0,.5,0),this.cableMat=new ve({color:new St(1.4,1.5,1.7)}),this.clawGeo=new ys(.22,.5,8),this.clawMat=new qt({color:13620960,metalness:1,roughness:.25,emissive:3820128}),this.cables=new Map,this.swirl=f1(),this.funnelGeos=[new Qe(9.5,1.4,21,40,1,!0),new Qe(7,1,19,40,1,!0),new Qe(4.5,.7,17,32,1,!0)].map(n=>(n.translate(0,n.parameters.height/2,0),n)),this.tornados=new Map,this.ice=new ot(new Na(Ne.radius*.01*1.15,1),new qt({color:13496063,emissive:4890584,emissiveIntensity:.6,roughness:.08,metalness:.1,transparent:!0,opacity:.55,flatShading:!0,depthWrite:!1})),this.ice.visible=!1,t.add(this.ice)}cableFor(t){let e=this.cables.get(t);if(!e){let i=new ot(this.cableGeo,this.cableMat),n=new ot(this.clawGeo,this.clawMat);i.frustumCulled=!1,this.group.add(i,n),e={cable:i,claw:n},this.cables.set(t,e)}return e}tornadoFor(t){let e=this.tornados.get(t);if(!e){let i=new Me,n=this.funnelGeos.map((r,o)=>{let a=this.swirl.clone();a.needsUpdate=!0,a.repeat.set(3+o,1);let l=new ot(r,new ve({map:a,color:o===2?15789284:13813942,transparent:!0,opacity:[.62,.7,.45][o],depthWrite:!1,side:oe,blending:o===2?Te:mn}));return l.renderOrder=6,i.add(l),{m:l,tex:a,speed:[2.2,-3.1,4.5][o]}});this.group.add(i),e={g:i,parts:n,grow:0},this.tornados.set(t,e)}return e}update(t,e,i,n){this.time+=t;let r=this.mode,o=r.world.ball,a=this.effects,l=-1;if(r.name==="heatseeker"&&r.team>=0&&(l=r.team),r.name==="rumble"&&r.curve&&(l=r.curve.team),l>=0&&i.visible){let d=Ie[l],f=Math.max(1,Math.round(t*90*a.mult));for(let g=0;g<f;g++)a.glow.emit(n.x*.01+Hi(-.4,.4),n.y*.01+Hi(-.4,.4),n.z*.01+Hi(-.4,.4),0,Hi(0,.5),0,Hi(.3,.55),Hi(.7,1.1),.15,[d.flame[0]*1.6,d.flame[1]*1.6,d.flame[2]*1.6,.6],[d.flameEnd[0],d.flameEnd[1],d.flameEnd[2],0],1.5,0);i.material.emissiveIntensity=3.2+Math.sin(this.time*12)*.6}else i.material.emissiveIntensity=2.4;let c=o.iceTimer>0;if(this.ice.visible=c&&i.visible,c&&(this.ice.position.copy(i.position),this.ice.rotation.y+=t*.4,Math.random()<t*20&&a.glow.emit(i.position.x+Hi(-1,1),i.position.y+Hi(-1,1),i.position.z+Hi(-1,1),0,-.3,0,.6,.12,.02,[1.6,2,2.4,.8],[.6,.9,1.4,0],0,0)),r.name!=="rumble")return;let h=new Set,u=new Set;for(let d of e){let f=d.car,v=r.st(f).active;if(d.model.setPower(!!v&&v.type==="power",this.time),d.model.setSpikes(!!v&&v.type==="spikes"),!(!v||f.demolished)){if((v.type==="grapple"||v.type==="plunger")&&d.ipos){let p=this.cableFor(f);h.add(f),M0.set(0,0,1).applyQuaternion(d.iquat),b0.set(0,1,0).applyQuaternion(d.iquat),vl.copy(d.ipos).addScaledVector(M0,55).addScaledVector(b0,28).multiplyScalar(.01);let m=v.phase==="pull"?n:v.hook;Do.copy(m).multiplyScalar(.01),v.phase==="pull"&&Do.addScaledVector(vl.clone().sub(Do).normalize(),Ne.radius*.01*.9);let x=vl.distanceTo(Do);p.cable.position.copy(vl),p.cable.quaternion.setFromUnitVectors(d1,Do.clone().sub(vl).normalize()),p.cable.scale.set(.05,Math.max(.01,x),.05),p.claw.position.copy(Do),p.claw.quaternion.copy(p.cable.quaternion),p.cable.visible=p.claw.visible=!0}if(v.type==="tornado"&&d.ipos){let p=this.tornadoFor(f);u.add(f);let m=Math.min(1,v.t/.5)*Math.min(1,(v.dur-v.t)/.6);p.grow=m,p.g.visible=!0,p.g.position.set(d.ipos.x*.01,0,d.ipos.z*.01),p.g.scale.set(.3+.7*m,m,.3+.7*m);for(let M of p.parts)M.m.rotation.y+=M.speed*t,M.tex.offset.y-=t*.6;let x=Math.round(t*70*a.mult);for(let M=0;M<x;M++){let y=Math.random()*Math.PI*2,S=Hi(1,6),b=p.g.position.x+Math.cos(y)*S,A=p.g.position.z+Math.sin(y)*S;a.smoke.emit(b,Hi(0,1.5),A,-Math.sin(y)*9,Hi(3,9),Math.cos(y)*9,Hi(.8,1.6),Hi(.8,1.4),Hi(2.4,4),[.45,.4,.33,.45],[.3,.28,.25,0],.8,-1,Hi(-2,2))}}}}for(let[d,f]of this.cables)h.has(d)||(f.cable.visible=f.claw.visible=!1);for(let[d,f]of this.tornados)u.has(d)||(f.g.visible=!1)}};var Qh=new T,tu=new T,p1=new T,Mf=new T,xl=class{constructor(t,e=2400,i=.02){this.max=e,this.height=i,this.head=0,this.pos=new Float32Array(e*4*3),this.col=new Float32Array(e*4*4);let n=new Uint32Array(e*6);for(let o=0;o<e;o++){let a=o*4;n.set([a,a+1,a+2,a+2,a+1,a+3],o*6)}let r=new re;this.posAttr=new ge(this.pos,3).setUsage(Ki),this.colAttr=new ge(this.col,4).setUsage(Ki),r.setAttribute("position",this.posAttr),r.setAttribute("color",this.colAttr),r.setIndex(new ge(n,1)),r.setDrawRange(0,0),this.geo=r,this.mesh=new ot(r,new ve({vertexColors:!0,transparent:!0,depthWrite:!1,side:oe,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2})),this.mesh.frustumCulled=!1,this.mesh.renderOrder=1,t.add(this.mesh),this.prev=new Map,this.used=0,this.dirty=!1}clear(){this.used=0,this.head=0,this.prev.clear(),this.geo.setDrawRange(0,0)}static skid(t){if(!t.onGround||t.demolished||t.groundNormal.y<.95||t.pos.y>45)return 0;t.forward(Qh),t.left(tu);let e=t.vel.length(),i=Math.abs(t.vel.dot(tu)),n=t.vel.dot(Qh),r=t.input,o=0;return r.powerslide&&e>250&&(o=Math.max(o,.9)),i>140&&(o=Math.max(o,Math.min(1,(i-140)/400))),(r.throttle>.5||t.boosting)&&Math.abs(n)<650&&(o=Math.max(o,.7)),r.throttle*n<0&&Math.abs(n)>450&&(o=Math.max(o,.8)),o}update(t,e,i,n){Qh.set(0,0,1).applyQuaternion(i),tu.set(1,0,0).applyQuaternion(i),p1.set(0,1,0).applyQuaternion(i);for(let r=0;r<4;r++){let o=t.id*4+r;if(n<=0||Nt.wheels[r].front&&n<.75){this.prev.delete(o);continue}let a=Nt.wheels[r];Mf.copy(e).addScaledVector(tu,a.x+Math.sign(a.x)*7).addScaledVector(Qh,a.z);let l=Mf.x*.01,c=Mf.z*.01,h=this.prev.get(o);if(!h){this.prev.set(o,{x:l,z:c});continue}let u=l-h.x,d=c-h.z,f=Math.hypot(u,d);if(!(f<.08)){if(f>4){this.prev.set(o,{x:l,z:c});continue}this.addQuad(h.x,h.z,l,c,u/f,d/f,.72*n),h.x=l,h.z=c}}}addQuad(t,e,i,n,r,o,a){let c=-o*.07,h=r*.07,u=this.height,d=this.head,f=d*12,g=this.pos;g[f]=t+c,g[f+1]=u,g[f+2]=e+h,g[f+3]=t-c,g[f+4]=u,g[f+5]=e-h,g[f+6]=i+c,g[f+7]=u,g[f+8]=n+h,g[f+9]=i-c,g[f+10]=u,g[f+11]=n-h;let v=d*16;for(let p=0;p<4;p++)this.col.set([.045,.035,.018,a],v+p*4);this.head=(this.head+1)%this.max,this.used=Math.min(this.max,this.used+1),this.dirty=!0}flush(){this.dirty&&(this.dirty=!1,this.posAttr.needsUpdate=!0,this.colAttr.needsUpdate=!0,this.geo.setDrawRange(0,this.used*6))}};var Ks=`
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
`,iu=`
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`,Sf=1.3,T0=7.5;function m1(s){return new fe({uniforms:s,transparent:!0,depthWrite:!1,blending:Te,side:oe,vertexShader:`
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
      ${Ks}
      void main() {
        float r = length(vL.xz);
        float t = clamp((r - ${Sf.toFixed(2)}) / (${(T0-Sf).toFixed(2)}), 0.0, 1.0);
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
        ${iu}
      }`})}function g1(s){return new fe({uniforms:s,transparent:!0,depthWrite:!1,blending:Te,vertexShader:`
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`
      uniform float uTime, uI, uHot, uSide, uBurst;
      varying vec2 vP;
      ${Ks}
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
        ${iu}
      }`})}function v1(s){return new fe({uniforms:s,transparent:!0,depthWrite:!1,blending:Te,vertexShader:`
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
        ${iu}
      }`})}function x1(s){return new fe({uniforms:s,transparent:!0,depthWrite:!1,blending:Te,side:oe,vertexShader:`
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
      ${Ks}
      void main() {
        float along = 1.0 - vUv.y; // 0 at the hole, 1 at the tip
        float n = fbm3(vec3(vUv.x * 12.0, along * 6.0 - uTime * 9.0, 1.0));
        float facing = abs(dot(normalize(vN), normalize(cameraPosition - vW)));
        float a = pow(facing, 1.5) * (1.0 - along) * (0.4 + n) * smoothstep(0.0, 0.05, along);
        vec3 col = mix(vec3(0.75, 0.85, 1.0), vec3(0.4, 0.55, 1.0), along);
        gl_FragColor = vec4(col * a * 3.0 * uJet, 1.0);
        ${iu}
      }`})}var eu=new be,bf=new T,S0=new T,No=new T,Mr=new T,E0=new T(0,1,0),Uo=class{constructor({jets:t=!1,segments:e=1}={}){this.group=new Me,this.u={uTime:{value:0},uI:{value:1},uHot:{value:0},uSide:{value:1},uBurst:{value:0},uGlow:{value:1},uJet:{value:0}},this.horizon=new ot(new ai(1,64,32),new ve({color:0,fog:!1})),this.horizon.renderOrder=1;let i=new lr(Sf,T0,Math.round(192*e),20);if(i.rotateX(-Math.PI/2),this.disk=new ot(i,m1(this.u)),this.disk.renderOrder=6,this.billboard=new Me,this.halo=new ot(new oi(6,6),g1(this.u)),this.halo.renderOrder=5,this.glow=new ot(new oi(30,30),v1(this.u)),this.glow.renderOrder=4,this.billboard.add(this.glow,this.halo),this.group.add(this.horizon,this.disk,this.billboard),t){let n=new Qe(3.2,.12,70,32,1,!0);n.translate(0,35.6,0);let r=x1(this.u),o=new ot(n,r),a=new ot(n,r);a.rotation.x=Math.PI,this.jets=new Me,this.jets.add(o,a),this.jets.visible=!1;for(let l of[o,a])l.renderOrder=7;this.group.add(this.jets)}this.group.traverse(n=>{n.frustumCulled=!1})}update(t,e){this.u.uTime.value+=t,this.group.updateMatrixWorld(),eu.copy(this.group.matrixWorld).invert(),bf.copy(e.position).applyMatrix4(eu),Mr.copy(bf).normalize(),No.copy(E0).addScaledVector(Mr,-E0.dot(Mr)),No.lengthSq()<1e-6&&No.set(0,0,1).addScaledVector(Mr,-Mr.z),No.normalize(),S0.crossVectors(No,Mr),eu.makeBasis(S0,No,Mr),this.billboard.quaternion.setFromRotationMatrix(eu),this.u.uSide.value=bf.y>=0?1:-1,this.jets&&(this.jets.visible=this.u.uJet.value>.001)}dispose(){this.group.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&t.material.dispose()})}};var os=20,br=`
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`,Tf=`
  vec2 eqUv(vec3 d) { return vec2(atan(d.x, d.z) / 6.2831853 + 0.5, asin(clamp(d.y, -1.0, 1.0)) / 3.1415927 + 0.5); }
  vec3 eqDir(vec2 uv) {
    float lon = (uv.x - 0.5) * 6.2831853, lat = (uv.y - 0.5) * 3.1415927;
    return vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon));
  }
`,js=s=>Math.min(1,Math.max(0,s)),Zi=(s,t,e)=>{let i=js((e-s)/(t-s));return i*i*(3-2*i)},Ef=s=>s<.5?4*s*s*s:1-Math.pow(-2*s+2,3)/2;function w0(s,t,e,i,n=Fi){let r=new je(t,e,{type:n,depthBuffer:!1,generateMipmaps:!1,minFilter:gi,magFilter:gi});r.texture.wrapS=Ji;let o=new fe({depthTest:!1,depthWrite:!1,vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`varying vec2 vUv;
${Ks}
${Tf}
void main() { vec3 dir = eqDir(vUv);
${i}
}`}),a=new ot(new oi(2,2),o);a.frustumCulled=!1;let l=new Yn;l.add(a);let c=new jn(-1,1,1,-1,0,1),h=s.getRenderTarget();return s.setRenderTarget(r),s.render(l,c),s.setRenderTarget(h),o.dispose(),a.geometry.dispose(),r}var y1=`
  float h = fbm(dir * 1.7 + vec3(3.7, 1.1, 0.0)) * 0.72 + fbm(dir * 6.5 + 7.0) * 0.28;
  float dry = fbm(dir * 3.2 + 11.0);
  float cl = fbm(dir * vec3(2.2, 4.6, 2.2) + 23.0) * 0.75 + fbm(dir * 11.0 + 5.0) * 0.25;
  cl = smoothstep(0.47, 0.7, cl);
  float city = step(0.76, vnoise(dir * 190.0)) * smoothstep(0.35, 0.65, vnoise(dir * 22.0));
  gl_FragColor = vec4(h, dry, cl, city);
`,_1=`
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
`;function M1(s){return new fe({side:_i,depthWrite:!1,uniforms:{uTex:{value:s},uBH:{value:new T},uBHR:{value:os},uWarp:{value:0},uFlash:{value:0},uFlashDir:{value:new T(0,0,1)},uSun:{value:new T(1,0,0)}},vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = (modelMatrix * vec4(position, 0.0)).xyz;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,fragmentShader:`
      uniform sampler2D uTex; uniform vec3 uBH, uFlashDir, uSun; uniform float uBHR, uWarp, uFlash;
      varying vec3 vDir;
      ${Tf}
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
        ${br}
      }`})}var I0=`
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
`;function b1(s,t){return new fe({uniforms:{...t,uMap:{value:s},uSun:{value:new T(1,0,0)},uBH:{value:new T},uBHLight:{value:.5},uMelt:{value:0},uCloudRot:{value:0},uTime:{value:0}},vertexShader:`
      ${I0}
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
      ${Ks}
      ${Tf}
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
        ${br}
      }`})}function S1(s){return new fe({uniforms:{...s,uSun:{value:new T(1,0,0)},uFade:{value:1}},transparent:!0,depthWrite:!1,blending:Te,vertexShader:`
      ${I0}
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
        ${br}
      }`})}function A0(s=!0){return new fe({transparent:!0,depthWrite:!1,blending:s?Te:mn,uniforms:{uScale:{value:1},uAtten:{value:0},uI:{value:1}},vertexShader:`
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
        ${br}
      }`})}function E1(s){let t=document.createElement("canvas");t.width=t.height=256;let e=t.getContext("2d"),i=s*9301+49297,n=()=>(i=(i*9301+49297)%233280,i/233280),r=e.createRadialGradient(128,128,0,128,128,60);r.addColorStop(0,"rgba(255,240,210,1)"),r.addColorStop(.3,"rgba(255,200,150,0.5)"),r.addColorStop(1,"rgba(120,120,200,0)"),e.fillStyle=r,e.fillRect(0,0,256,256);let o=2+Math.floor(n()*2);for(let l=0;l<2600;l++){let c=l%o,h=Math.pow(n(),.7),u=h*7+c/o*Math.PI*2+(n()-.5)*.6,d=8+h*110+(n()-.5)*14*h,f=128+Math.cos(u)*d,g=128+Math.sin(u)*d,v=(1-h)*.5+.15;e.fillStyle=n()<.15?`rgba(255,170,200,${v})`:`rgba(170,200,255,${v})`,e.fillRect(f,g,1.6,1.6)}let a=new ri(t);return a.colorSpace=ze,a}function T1(){return new fe({uniforms:{uTime:{value:0},uI:{value:1}},transparent:!0,depthWrite:!1,blending:Te,side:oe,vertexShader:`
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
      ${Ks}
      void main() {
        float f = abs(dot(normalize(vNW), normalize(cameraPosition - vW)));
        float n = fbm3(vL * 4.0 + vec3(0.0, uTime * 1.5, 0.0));
        float edge = pow(1.0 - f, 2.0);
        vec3 col = mix(vec3(1.0, 0.72, 0.4), vec3(1.0, 0.3, 0.08), edge);
        col = mix(col, vec3(0.65, 0.35, 1.0), smoothstep(0.5, 0.8, n) * 0.7);
        gl_FragColor = vec4(col * (0.2 + edge * 1.3) * (0.35 + n) * uI, 1.0);
        ${br}
      }`})}function w1(){return new fe({uniforms:{uI:{value:1}},transparent:!0,depthWrite:!1,blending:Te,side:oe,vertexShader:"varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uI;
      varying vec2 vP;
      void main() {
        float r = length(vP);
        float a = smoothstep(0.8, 0.98, r) * (1.0 - smoothstep(0.98, 1.0, r));
        gl_FragColor = vec4(vec3(0.75, 0.85, 1.0) * a * a * 1.4 * uI, 1.0);
        ${br}
      }`})}function A1(){return new fe({uniforms:{uI:{value:0},uTime:{value:0}},transparent:!0,depthWrite:!1,depthTest:!1,blending:Te,vertexShader:"varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uI, uTime;
      varying vec2 vP;
      ${Ks}
      void main() {
        float r = length(vP);
        float a = atan(vP.y, vP.x);
        float rays = pow(max(fbm3(vec3(cos(a) * 7.0, sin(a) * 7.0, uTime * 0.5)) - 0.45, 0.0) / 0.55, 2.5) * 4.0;
        float fall = exp(-r * 3.5) * (1.0 - smoothstep(0.4, 0.9, r));
        vec3 col = mix(vec3(1.0, 0.85, 0.6), vec3(0.75, 0.6, 1.0), smoothstep(0.05, 0.4, r));
        gl_FragColor = vec4(col * (rays * fall + exp(-r * 9.0) * 1.5) * uI, 1.0);
        ${br}
      }`})}var Fe=new T,Ri=new T,R0=new he,C0=new he,Fo=new T(0,1,0);function P0(s,t,e){let i=xe.degToRad(s),n=xe.degToRad(t);return new T(Math.cos(n)*Math.sin(i)*e,Math.sin(n)*e,Math.cos(n)*Math.cos(i)*e)}var nu=class{constructor(t,e,i){this.fx=i,this.quality=e;let n=e==="low";this.scene=new Yn,this.camera=new ei(50,1,.004,4e4),this.t=0,this.events=new Set;let r=e==="high";this.skyRT=w0(t,r?4096:2048,r?2048:1024,_1,ui),this.earthRT=w0(t,n?1024:2048,n?512:1024,y1),this.skyGroup=new Me,this.sky=new ot(new ai(9e3,64,32),M1(this.skyRT.texture)),this.sky.renderOrder=-10,this.skyGroup.add(this.sky),this.scene.add(this.skyGroup);{let d=n?2500:6e3,f=new Float32Array(d*3),g=new Float32Array(d*3),v=new Float32Array(d),p=new T(.25,.92,.3).normalize();for(let x=0;x<d;x++){if(Fe.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1),Fe.lengthSq()>1||Fe.lengthSq()<.01){x--;continue}Fe.normalize(),x%3===0&&Fe.addScaledVector(p,-Fe.dot(p)*.9).normalize(),Fe.multiplyScalar(8e3),f.set([Fe.x,Fe.y,Fe.z],x*3);let M=Math.random(),y=M<.2?[1,.75,.55]:M<.7?[1,.96,.92]:[.7,.82,1],S=.4+Math.pow(Math.random(),4)*2.4;g.set([y[0]*S,y[1]*S,y[2]*S],x*3),v[x]=1.2+Math.pow(Math.random(),6)*3.2}let m=new re;m.setAttribute("position",new ge(f,3)),m.setAttribute("aCol",new ge(g,3)),m.setAttribute("aSize",new ge(v,1)),this.starMat=A0(),this.starMat.uniforms.uScale.value=Math.min(window.devicePixelRatio||1,2),this.stars=new to(m,this.starMat),this.stars.renderOrder=-9,this.stars.frustumCulled=!1,this.skyGroup.add(this.stars)}this.galaxies=[];for(let d=0;d<9;d++){let f=new jr({map:E1(d+3),blending:Te,depthWrite:!1,transparent:!0,opacity:.55,rotation:Math.random()*6.28}),g=new _a(f);Fe.set(Math.random()*2-1,(Math.random()*2-1)*.6,Math.random()*2-1).normalize(),g.position.copy(Fe).multiplyScalar(5200+Math.random()*1500);let v=260+Math.random()*380;g.scale.set(v,v*(.35+Math.random()*.65),1),g.userData={base:g.position.clone(),s:g.scale.clone()},g.renderOrder=-8,this.scene.add(g),this.galaxies.push(g)}this.bh=new Uo({jets:!0,segments:n?.6:1}),this.bh.group.scale.setScalar(os),this.bh.group.rotation.set(-.04,0,.07),this.scene.add(this.bh.group),this.wideCam=P0(38,8,430);let o=Fe.copy(this.wideCam).negate().normalize(),a=new T().crossVectors(o,Fo).normalize(),l=new T().crossVectors(a,o).normalize();this.wideLook=new T().addScaledVector(a,40).addScaledVector(l,10),this.earth0=this.wideCam.clone().addScaledVector(o.clone().addScaledVector(a,-.34).addScaledVector(l,-.19).normalize(),60);let c={uAxis:{value:new T(1,0,0)},uStretch:{value:0}};this.earthShared=c,this.earth=new Me,this.earthMat=b1(this.earthRT.texture,c),this.earthMesh=new ot(new ai(1,n?96:160,n?64:120),this.earthMat),this.atmoMat=S1(c),this.atmo=new ot(new ai(1.045,96,64),this.atmoMat),this.atmo.renderOrder=2,this.earth.add(this.earthMesh,this.atmo),this.earth.rotation.z=.41,this.earth.position.copy(this.earth0),this.scene.add(this.earth),this.earthAlive=!0;let h=this.earth0.clone().negate().normalize(),u=new T().crossVectors(h,Fo).normalize();this.startDir=new T().addScaledVector(h,-.35).addScaledVector(u,-1).addScaledVector(Fo,.32).normalize(),this.sunDir=new T().addScaledVector(this.startDir,1).addScaledVector(h,.45).addScaledVector(Fo,.25).normalize(),this.earthMat.uniforms.uSun.value.copy(this.sunDir),this.atmoMat.uniforms.uSun.value.copy(this.sunDir),this.sky.material.uniforms.uSun.value.copy(this.sunDir);{let d=n?1400:3600;this.streamN=d;let f=new re;this.sPos=new Float32Array(d*3),this.sCol=new Float32Array(d*3),this.sSize=new Float32Array(d),f.setAttribute("position",new ge(this.sPos,3).setUsage(Ki)),f.setAttribute("aCol",new ge(this.sCol,3).setUsage(Ki)),f.setAttribute("aSize",new ge(this.sSize,1).setUsage(Ki)),this.streamGeo=f,this.streamMat=A0(),this.streamMat.uniforms.uAtten.value=1,this.stream=new to(f,this.streamMat),this.stream.frustumCulled=!1,this.stream.renderOrder=8,this.scene.add(this.stream),this.parts=[];for(let g=0;g<d;g++)this.parts.push({alive:!1,born:0,life:1,off:new T,spin:0,hot:!1,size:1,src:new T});this.emitAcc=0}this.core=new ot(new ai(1,64,32),T1()),this.core.visible=!1,this.core.renderOrder=9,this.shock=new ot(new lr(.5,1,160,1),w1()),this.shock.rotation.x=-Math.PI/2,this.shock.visible=!1,this.shock.renderOrder=9,this.rays=new ot(new oi(2,2),A1()),this.rays.visible=!1,this.rays.renderOrder=10,this.scene.add(this.core,this.shock,this.rays);for(let d of[this.core,this.shock,this.rays])d.frustumCulled=!1;this.camPos=new T,this.camLook=new T,this.shakeAmt=0,this.fov=55,this.duration=19.8,this.update(0)}earthAt(t,e){let i=js((t-6)/6.2),n=.75*Math.pow(i,2.2)+.25*Math.pow(i,12),r=this.earth0.length(),o=r*Math.pow(os*.25/r,n),a=1-o/r,c=Math.atan2(this.earth0.x,this.earth0.z)+1.25*Math.pow(i,2.6),h=this.earth0.y*(1-a),u=Math.sqrt(Math.max(0,o*o-h*h));return e.set(Math.sin(c)*u,h,Math.cos(c)*u)}emitStream(t,e,i){this.emitAcc+=i*t;let n=this.earth.position;for(let r of this.parts){if(this.emitAcc<1)break;r.alive||(this.emitAcc-=1,r.alive=!0,r.born=e,r.life=2.4+Math.random()*2.4,Fe.copy(n).negate().normalize(),Ri.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize(),Ri.dot(Fe)<0&&Ri.addScaledVector(Fe,-2*Ri.dot(Fe)),Ri.lerp(Fe,.35).normalize(),r.off.copy(Ri).multiplyScalar(1.02+this.earthShared.uStretch.value*.8*Math.random()),r.src.copy(n),r.spin=.9+Math.random()*1.2,r.hot=Math.random()<.55,r.size=r.hot?.12+Math.random()*.25:.08+Math.random()*.15)}this.emitAcc>1&&(this.emitAcc=1)}updateStream(t){let e=this.sPos,i=this.sCol,n=this.sSize;for(let o=0;o<this.streamN;o++){let a=this.parts[o];if(!a.alive){n[o]=0;continue}let l=(t-a.born)/a.life;if(l>=1){a.alive=!1,n[o]=0;continue}Fe.copy(this.earthAlive?this.earth.position:a.src).add(a.off);let c=Fe.length(),h=Math.pow(l,1.5),u=c*(1-h)+os*.92*h;Ri.copy(Fe).divideScalar(c);let d=a.spin*Math.pow(l,2.2)*2.2,f=Math.cos(d),g=Math.sin(d),v=Ri.x*f+Ri.z*g,p=-Ri.x*g+Ri.z*f,m=Ri.y*(1-h),x=Math.hypot(v,m,p);e[o*3]=v/x*u,e[o*3+1]=m/x*u,e[o*3+2]=p/x*u;let M=Math.min(1,l*1.6),y=Math.min(1,(1-l)*6)*Math.min(1,l*12);a.hot?(i[o*3]=(1.6+M)*y,i[o*3+1]=(.55+M*.9)*y,i[o*3+2]=(.15+M*.8)*y):(i[o*3]=(.35+M*1.2)*y,i[o*3+1]=(.3+M*.7)*y,i[o*3+2]=(.28+M*.4)*y),n[o]=a.size*(1+l*6)*(.4+.6*(u/c))}let r=this.streamGeo;r.attributes.position.needsUpdate=!0,r.attributes.aCol.needsUpdate=!0,r.attributes.aSize.needsUpdate=!0}once(t){return this.events.has(t)?!1:(this.events.add(t),!0)}update(t){let e=this.t;this.t+=t;let i=this.fx,n=this.camera,r=this.bh.u;if(this.earthAlive){this.earthAt(e,this.earth.position),this.earth.rotateY(t*.08);let f=this.earth.position.length();Fe.copy(this.earth.position).negate().normalize(),this.earth.getWorldQuaternion(R0),C0.copy(R0).invert(),this.earthShared.uAxis.value.copy(Fe).applyQuaternion(C0);let g=Math.pow(js((95-f)/75),2)*7;this.earthShared.uStretch.value=g,this.earthMat.uniforms.uMelt.value=js((140-f)/110),this.earthMat.uniforms.uBHLight.value=.35+js((300-f)/250)*1.6,this.earthMat.uniforms.uCloudRot.value+=t*.03,this.earthMat.uniforms.uTime.value=e,this.earthMat.uniforms.uBH.value.set(0,0,0),f<os*.55&&(this.earthAlive=!1,this.earth.visible=!1,i.flash("#ffd9a8",.35,.05,0,.6),i.sound("gulp"))}e<12.5&&this.emitStream(t,e,e<6?260:700),this.updateStream(e);let o=Zi(12.3,14,e);r.uHot.value=o*.8,r.uJet.value=Zi(12.6,13.4,e)*(1-Zi(14.2,14.6,e));let a=.5+.5*Zi(70,220,this.camPos.length());r.uI.value=(1+o*.6+(e>12.6&&e<14?Math.sin(e*40)*.15*o:0))*a;let l=1+(e>12.6&&e<14?Math.sin(e*22)*.035*o:0),c=e-14;if(c>0){this.once("boom")&&(i.sound("bigboom"),i.flash("#ffffff",.55,.05,.05,.8),i.shake(1.5),this.core.visible=!0,this.shock.visible=!0,this.rays.visible=!0),r.uBurst.value=js(c/1.2),this.bh.horizon.scale.setScalar(Math.max(.001,1-c*3));let f=os*(.6+3.2*Math.pow(c,2.4));this.core.scale.setScalar(f),this.core.material.uniforms.uTime.value=c,this.core.material.uniforms.uI.value=.7*(1-Zi(3.5,5,c));let g=os*(1+9*Math.pow(c,1.8));this.shock.scale.setScalar(g),this.shock.material.uniforms.uI.value=1-Zi(2,3.4,c),this.rays.material.uniforms.uI.value=Zi(0,.15,c)*(1-Zi(2.6,3.4,c))*.45,this.rays.material.uniforms.uTime.value=c;let v=this.sky.material.uniforms;v.uWarp.value=Zi(.2,2.6,c),v.uFlash.value=Zi(.8,3,c);for(let p of this.galaxies){let m=p.userData.base.length(),x=js((f-m*.15)/(m*.3));p.position.copy(p.userData.base).multiplyScalar(1+x*.6),p.material.opacity=.55+x*2*(1-x)}c>2.3&&this.once("white")&&i.flash("#ffffff",1,1,99,1),c>3.4&&this.once("text")&&i.text("final")}this.bh.group.scale.setScalar(os*l);let h=this.wideCam;if(e<6.5){let f=Ef(js(e/6.3)),g=1.85,v=this.wideCam.distanceTo(this.earth0),p=g*Math.pow(v/g,f);Ri.copy(h).sub(this.earth0).normalize(),Fe.copy(this.startDir).lerp(Ri,Zi(.15,1,f)).normalize(),this.camPos.copy(this.earth0).addScaledVector(Fe,p),Ri.copy(this.earth0).multiplyScalar(-.006).add(this.earth0),this.camLook.copy(Ri).lerp(this.wideLook,Zi(.25,1,f)),this.fov=55}else if(e<12.4){let f=Zi(6.3,7.8,e),g=this.earth.position;Fe.copy(g).normalize(),Ri.crossVectors(Fo,Fe).normalize();let v=this._target||(this._target=new T);v.copy(g).addScaledVector(Fe,7).addScaledVector(Ri,-5).addScaledVector(Fo,2.5),v.length()<os*2.2&&v.setLength(os*2.2),this.camPos.lerpVectors(h,v,f),Fe.copy(g).multiplyScalar(.65),this.camLook.lerpVectors(this.wideLook,Fe,f),this.fov=55+f*5}else{let f=Zi(12.4,13.8,e);this.fromPos||(this.fromPos=this.camPos.clone(),this.fromLook=this.camLook.clone(),this.farPos=P0(30,9,640)),this.camPos.lerpVectors(this.fromPos,this.farPos,Ef(f)),this.camLook.copy(this.fromLook).multiplyScalar(1-Ef(f)),this.fov=60+Zi(14,16,e)*18}this.shakeAmt=Math.max(0,this.shakeAmt-t*.5);let u=Math.max(this.shakeAmt,o*.25)*(e>17?0:1);if(n.position.copy(this.camPos),u>0){let f=.004*u*n.position.distanceTo(this.camLook);n.position.x+=(Math.random()-.5)*f,n.position.y+=(Math.random()-.5)*f,n.position.z+=(Math.random()-.5)*f}n.up.set(0,1,0),n.lookAt(this.camLook),this.rays.position.set(0,0,0),this.rays.quaternion.copy(n.quaternion),this.rays.scale.setScalar(n.position.length()*2.2),this.skyGroup.position.copy(n.position);let d=this.sky.material.uniforms;d.uBH.value.set(0,0,0),d.uBHR.value=Math.max(1e-4,this.bh.group.scale.x*this.bh.horizon.scale.x),d.uFlashDir.value.copy(n.position).negate().normalize(),this.atmoMat.uniforms.uFade.value=1,this.bh.update(t,n)}get done(){return this.t>=this.duration}dispose(){this.scene.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&(t.material.map&&t.material.map.dispose(),t.material.dispose())}),this.bh.dispose(),this.skyRT.dispose(),this.earthRT.dispose()}};var{halfZ:ou,goalDepth:N0,goalH:U0,goalHalfW:R1}=Ft,Ci=s=>Math.min(1,Math.max(0,s)),wf=(s,t,e)=>{let i=Ci((e-s)/(t-s));return i*i*(3-2*i)},su=s=>1-Math.pow(1-Ci(s),3),Af=s=>s<.5?4*s*s*s:1-Math.pow(-2*s+2,3)/2;function C1(s){return s<1/2.75?7.5625*s*s:s<2/2.75?7.5625*(s-=1.5/2.75)*s+.75:s<2.5/2.75?7.5625*(s-=2.25/2.75)*s+.9375:7.5625*(s-=2.625/2.75)*s+.984375}var P1=[[0,0,ou+N0+U0],[0,0,7150],[0,200,7800],[0,700,8600],[0,1400,9500],[0,2200,10500],[0,3100,11600],[300,4100,12800],[1300,5200,14200],[2600,6400,15800],[3500,7700,17700],[3500,9100,19800],[2400,10500,21900],[600,11900,24e3],[-1200,13300,26200],[-2200,14700,28500],[-1800,16100,30900],[-600,17400,33300],[0,18600,35800]],I1=[0,16600,44e3],ru=1500,L1=5500,D1=300,L0=1300,Bo=11e3,Sr=5e3,Qs=3.3,Qi=new T,Sn=new T,as=new he,D0=new he,Un=new be,Ts=new T,tr=new T(0,1,0);function N1(s){let t=Ie[s],e=()=>{let l=document.createElement("canvas");return l.width=256,l.height=512,l},i=e(),n=e(),r=i.getContext("2d"),o=n.getContext("2d");r.fillStyle="#25282e",r.fillRect(0,0,256,512);for(let l=0;l<2500;l++){let c=30+Math.random()*40;r.fillStyle=`rgb(${c},${c},${c+4})`,r.fillRect(Math.random()*256,Math.random()*512,2,2)}o.fillStyle="#000",o.fillRect(0,0,256,512);for(let l of[r,o]){l.fillStyle=l===r?"#d8dde6":"#9aa6b8",l.fillRect(12,0,7,512),l.fillRect(237,0,7,512),l.fillStyle=l===r?t.css:"#fff";for(let c of[60,316])l.beginPath(),l.moveTo(128,c),l.lineTo(196,c+70),l.lineTo(196,c+120),l.lineTo(128,c+50),l.lineTo(60,c+120),l.lineTo(60,c+70),l.closePath(),l.fill()}let a=[i,n].map(l=>{let c=new ri(l);return c.wrapS=c.wrapT=Ji,c.anisotropy=4,c});return a[0].colorSpace=ze,a}function Rf(s,t,e){return s.onBeforeCompile=i=>{i.uniforms.uReveal=t,i.uniforms.uRevealCol=e,i.vertexShader=`attribute float aS;
varying float vS;
`+i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vS = aS;`),i.fragmentShader=`uniform float uReveal;
uniform vec3 uRevealCol;
varying float vS;
`+i.fragmentShader.replace("#include <clipping_planes_fragment>",`#include <clipping_planes_fragment>
if (vS > uReveal) discard;`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += uRevealCol * (1.0 - smoothstep(0.0, 1400.0, uReveal - vS)) * 3.0;`)},s}var au=class{constructor(t,e,i){this.match=t,this.app=t.app,this.champ=e,this.team=i,this.target=1-i,this.s=this.target===0?-1:1,this.t=0,this.stage=1,this.done=!1,this.events=new Set;let n=this.app,r=n.stadium;this.cine=r.cine,this.quality=n.settings.quality,this.group=new Me,t.group.add(this.group),this.camera=new ei(55,1,.1,4500),this.view={camera:this.camera,rect:[0,0,1,1],hfov:82},n.gfx.setViews([this.view]),n.hud.show(!1);let o=n.gfx.bloom;o&&(this.bloomWas={strength:o.strength,radius:o.radius},o.strength=.38,o.radius=.12);for(let a of t.engines)n.audio.updateEngine(a,0,0,!1,!1,!1);this.engine=n.audio.createEngine(0),this.cine.screenFor(this.target).visible=!1,this.buildOverlay(),this.buildRoad(),this.buildBlackHole(),this.stageCars(),this.buildCutEdges(),this.buildDebris(),this.shake=0,this.camPos=new T,this.camLook=new T,this.camUp=new T(0,1,0),this.camInit=!1,this.caption(`${i===0?"BLUE":"ORANGE"} WINS!`,`${t.scores[0]} - ${t.scores[1]}`,i===0?"blue":"orange"),n.audio.cine("rise")}P(t,e,i){return new T(t,e,this.s*i)}once(t){return this.events.has(t)?!1:(this.events.add(t),!0)}buildOverlay(){let t=document.createElement("div");t.className="cine",t.innerHTML='<div class="cine-fill"></div><div class="cine-bar top"></div><div class="cine-bar bottom"></div><div class="cine-text"><div class="cine-main"></div><div class="cine-sub"></div></div><div class="cine-skip">Press A / Space to skip</div>',document.body.appendChild(t),this.overlay=t,this.fill=t.querySelector(".cine-fill"),this.textEl=t.querySelector(".cine-text"),this.mainEl=t.querySelector(".cine-main"),this.subEl=t.querySelector(".cine-sub"),this.flashes=[],requestAnimationFrame(()=>t.classList.add("on"))}flash(t,e,i,n,r){this.flashes.push({color:t,peak:e,rise:Math.max(.001,i),hold:n,fall:Math.max(.001,r),t:0})}updateFlashes(t){let e=0,i="#fff";for(let n=this.flashes.length-1;n>=0;n--){let r=this.flashes[n];r.t+=t;let o;if(r.t<r.rise?o=r.t/r.rise:r.t<r.rise+r.hold?o=1:o=1-(r.t-r.rise-r.hold)/r.fall,o<=0&&r.t>r.rise){this.flashes.splice(n,1);continue}o*=r.peak,o>e&&(e=o,i=r.color)}this.fill.style.opacity=e.toFixed(3),this.fill.style.background=i}caption(t,e="",i=""){this.mainEl.textContent=t,this.subEl.textContent=e,this.textEl.className="cine-text show "+i}hideCaption(){this.textEl.className="cine-text"}buildRoad(){let t=P1.map(([g,v,p])=>this.P(g,v,p)),e=new io(t,!1,"centripetal");e.arcLengthDivisions=3e3;let i=e.getLength(),n=Math.ceil(i/40),r=[];for(let g=0;g<=n;g++){let v=g/n,p=e.getPointAt(v),m=e.getTangentAt(v).normalize();r.push({s:v*i,p,T:m,U:new T,R:new T,bank:0})}for(let g=0;g<=n;g++){let v=r[Math.max(0,g-3)],p=r[Math.min(n,g+3)],m=Qi.crossVectors(r[g].T,tr).normalize(),x=Sn.subVectors(p.T,v.T).dot(m)/Math.max(1,p.s-v.s);r[g].k=x}for(let g=0;g<=n;g++){let v=0,p=0;for(let A=Math.max(0,g-25);A<=Math.min(n,g+25);A++)v+=r[A].k,p++;let m=xe.clamp(v/p*9e3,-.5,.5),x=r[g];x.R.crossVectors(x.T,tr).normalize(),x.U.crossVectors(x.R,x.T).normalize();let M=Math.cos(m),y=Math.sin(m),S=x.U.clone(),b=x.R.clone();x.U.copy(S).multiplyScalar(M).addScaledVector(b,y),x.R.copy(b).multiplyScalar(M).addScaledVector(S,-y)}this.samples=r,this.roadLen=i,this.groundLen=ou+N0+U0-L0,this.totalLen=this.groundLen+i,this.roadEnd=r[n];let o=Ie[this.team];this.reveal={value:0};let a={value:new St(o.light).multiplyScalar(1.5)},[l,c]=N1(this.team),h=D1,u=Rf(new qt({map:l,emissiveMap:c,emissive:new St(o.main),emissiveIntensity:.9,roughness:.8,metalness:.1,side:oe}),this.reveal,a),d=Rf(new qt({color:2303790,roughness:.35,metalness:.85,side:oe}),this.reveal,a),f=Rf(new qt({color:0,emissive:new St(o.light),emissiveIntensity:2.2,side:oe}),this.reveal,a);this.roadMats=[u,d,f],this.road=new Me,this.road.add(new ot(this.sweep([[-h,0],[h,0]],1200),u),new ot(this.sweep([[-h+22,1],[-h+22,40],[-h-4,40],[-h-4,-55],[h+4,-55],[h+4,40],[h-22,40],[h-22,1]],900),d),new ot(this.sweep([[-h-2,41.5],[-h+20,41.5]],900),f),new ot(this.sweep([[h-20,41.5],[h+2,41.5]],900),f),new ot(this.sweep([[-h-5,8],[-h-5,24]],900),f),new ot(this.sweep([[h+5,24],[h+5,8]],900),f));for(let g of this.road.children)g.frustumCulled=!1,g.castShadow=!1;this.group.add(this.road)}sweep(t,e){let i=this.samples.length,n=t.length,r=new Float32Array(i*n*3),o=new Float32Array(i*n*2),a=new Float32Array(i*n);for(let h=0;h<i;h++){let u=this.samples[h];for(let d=0;d<n;d++){let[f,g]=t[d],v=h*n+d;r[v*3]=(u.p.x+u.R.x*f+u.U.x*g)*.01,r[v*3+1]=(u.p.y+u.R.y*f+u.U.y*g)*.01,r[v*3+2]=(u.p.z+u.R.z*f+u.U.z*g)*.01,o[v*2]=n===2?d:d/(n-1),o[v*2+1]=u.s/e,a[v]=u.s}}let l=[];for(let h=0;h<i-1;h++)for(let u=0;u<n-1;u++){let d=h*n+u,f=(h+1)*n+u,g=(h+1)*n+u+1,v=h*n+u+1;l.push(d,f,v,f,g,v)}let c=new re;return c.setAttribute("position",new ge(r,3)),c.setAttribute("uv",new ge(o,2)),c.setAttribute("aS",new ge(a,1)),c.setIndex(l),c.computeVertexNormals(),c}frameAt(t,e){if(t<this.groundLen)return e.p.set(0,0,this.s*(L0+t)),e.T.set(0,0,this.s),e.U.set(0,1,0),e.R.crossVectors(e.T,tr).normalize(),e;let i=t-this.groundLen,n=this.samples,r=i/(this.roadLen/(n.length-1));if(r>=n.length-1){let h=n[n.length-1];return e.p.copy(h.p).addScaledVector(h.T,i-this.roadLen),e.T.copy(h.T),e.U.copy(h.U),e.R.copy(h.R),e}let o=Math.floor(r),a=r-o,l=n[o],c=n[o+1];return e.p.lerpVectors(l.p,c.p,a),e.T.lerpVectors(l.T,c.T,a).normalize(),e.U.lerpVectors(l.U,c.U,a).normalize(),e.R.lerpVectors(l.R,c.R,a).normalize(),e}driveDist(t){let e=Math.max(0,t-Qs),i=Bo/Sr;return e<i?.5*Sr*e*e:.5*Sr*i*i+Bo*(e-i)}driveSpeed(t){let e=Math.max(0,t-Qs);return Math.min(Bo,Sr*e)}timeAt(t){let e=Bo/Sr,i=.5*Sr*e*e;return t<i?Qs+Math.sqrt(2*t/Sr):Qs+e+(t-i)/Bo}buildBlackHole(){this.bhPos=this.P(...I1),this.bh=new Uo({segments:this.quality==="low"?.6:1}),this.bh.group.position.copy(this.bhPos).multiplyScalar(.01),this.bh.group.scale.setScalar(ru*.01);let t=Qi.set(-560,0,this.s*-260).sub(Sn.copy(this.bhPos).multiplyScalar(.01).setY(0)).normalize();this.bh.group.quaternion.setFromUnitVectors(tr,Sn.copy(tr).addScaledVector(t,.3).normalize()),this.bh.u.uI.value=.6,this.bh.u.uGlow.value=.6,this.group.add(this.bh.group),this.bhR=ru,this.tEnd=this.timeAt(this.totalLen),this.fallDur=1.25,this.tBoom=this.tEnd+this.fallDur,this.tSuck=this.tBoom+.55,this.tSpace=this.tSuck+5.6;let e=this.cine.buildings;this.bMats=[],this.roadBlocked=new Set;let i=new T,n=new he,r=new T;for(let o=0;o<e.count;o++){e.getMatrixAt(o,Un),this.bMats.push(Un.clone()),Un.decompose(i,n,r);let a=!1;for(let l=0;l<this.samples.length;l+=4){let c=this.samples[l],h=c.p.x*.01-i.x,u=c.p.z*.01-i.z,d=Math.max(r.x,r.z)*.75+12;if(h*h+u*u<d*d&&i.y+r.y+8>c.p.y*.01){a=!0;break}}a&&(this.roadBlocked.add(o),Un.compose(i,n,Ts.set(0,0,0)),e.setMatrixAt(o,Un))}e.instanceMatrix.needsUpdate=!0}stageCars(){let t=this.match,e=this.s;this.carState={team:this.team,vel:new T,boosting:!1,supersonic:!1,demolished:!1,steerVisual:0,wheelSpin:0,wheelDist:[17,17,17,17],onGround:!0},t.players.filter(n=>n!==this.champ).forEach((n,r)=>{let o=n.car.team===this.team?1:-1,a=Math.floor(r/2),l=o*(700+r%2*260),c=e*(2300+a*1300+r%2*400);n.model.root.position.set(l*.01,17*.01,c*.01),n.model.root.quaternion.setFromAxisAngle(tr,Math.atan2(-l,0)),n.model.root.scale.setScalar(1),n.model.flame.visible=!1,n.model.root.visible=!0});for(let n of t.players)n.model.blob&&(n.model.blob.visible=!1);t.ballBlob&&(t.ballBlob.visible=!1),this.ballWasVisible=t.ball.visible,t.ball.visible=!0,t.ball.position.set(-1900*.01,93*.01,e*3200*.01),this.champ.model.root.visible=!0,this.champ.model.root.scale.setScalar(1),this.frame={p:new T,T:new T,U:new T,R:new T},this.camFrame={p:new T,T:new T,U:new T,R:new T},this.carPos=new T,this.carQuat=new he,this.placeChamp(0,0)}buildCutEdges(){let t=Ie[this.team],e=new ve({color:new St(t.light).multiplyScalar(3),fog:!1});this.edgeMat=e,this.edges=[];let i=n=>{let r=new so;for(let o=0;o<n.length-1;o++){let a=n[o],l=n[o+1];r.add(new no(new T(0,a[1]*.01,this.s*(ou+a[0])*.01),new T(0,l[1]*.01,this.s*(ou+l[0])*.01)))}return new Fa(r,n.length*8,.22,6,!1)};for(let n of[-1,1]){let r=new Me;r.add(new ot(i(this.cine.standEdge),e),new ot(i(this.cine.roofEdge),e)),r.userData.side=n,r.visible=!1,this.cine.arena.parent.add(r),this.edges.push(r)}}buildDebris(){let e=this.quality==="low"?180:420,i=new De(1,1,1),n=new qt({roughness:.85,metalness:.1}),r=new xs(i,n,e);r.instanceMatrix.setUsage(Ki),r.frustumCulled=!1;let o=new St,a=this.s;this.debris=[];for(let l=0;l<e;l++){let c=Math.random(),h={p0:new T,size:new T,axis:new T(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),spin:2+Math.random()*6};if(c<.45)h.p0.set((Math.random()*2-1)*38,.3,(Math.random()*2-1)*48),h.size.set(1.5+Math.random()*4,.4+Math.random()*.6,1.5+Math.random()*4),o.setRGB(.07+Math.random()*.05,.16+Math.random()*.08,.04);else if(c<.8){let u=Math.random()*Math.PI*2,d=1+Math.random()*.45;h.p0.set(Math.cos(u)*52*d,8+Math.random()*30,Math.sin(u)*63*d),h.size.set(1+Math.random()*5,.8+Math.random()*3,1+Math.random()*5),Math.random()<.3?o.setHex(Ie[h.p0.z*a>0?this.target:this.team].main).multiplyScalar(.5):o.setRGB(.2,.21,.23)}else h.p0.set((Math.random()*2-1)*70,Math.random()*50,(Math.random()*2-1)*90),h.size.set(.3+Math.random()*2,.3+Math.random()*2,.3+Math.random()*2),o.setRGB(.5+Math.random()*.5,.5,.5);h.t0=Math.random()*3.6,h.dur=2.2+Math.random()*1.8,h.swirl=1.5+Math.random()*2.5,h.lift=8+Math.random()*25,this.debris.push(h),r.setColorAt(l,o),r.setMatrixAt(l,Un.makeScale(0,0,0))}r.instanceColor.needsUpdate=!0,r.visible=!1,this.debrisMesh=r,this.group.add(r)}suckPos(t,e,i,n,r){let o=Sn.copy(this.bhPos).multiplyScalar(.01),a=Qi.copy(t).sub(o),l=a.length(),c=Math.pow(e,1.7),h=this.bhR*.01,u=l*(1-c)+h*.6*c,d=i*Math.pow(e,2.4),f=Math.cos(d),g=Math.sin(d),v=a.x*f+a.z*g,p=-a.x*g+a.z*f;return r.set(v,a.y,p).multiplyScalar(u/l).add(o),r.y+=n*Math.sin(Math.PI*Math.min(1,e*1.5))*(1-e),Ci((u-h*.75)/(h*1.2))}placeChamp(t,e){let i=this.frameAt(this.driveDist(t),this.frame);this.carPos.copy(i.p).addScaledVector(i.U,17),Un.makeBasis(Qi.copy(i.R).negate(),i.U,i.T),this.carQuat.setFromRotationMatrix(Un);let n=this.driveSpeed(t),r=this.carState;r.vel.copy(i.T).multiplyScalar(n),r.boosting=t>Qs-.1,r.supersonic=n>2200,r.wheelSpin+=n/17*e,this.champ.model.update(r,this.carPos,this.carQuat,e),this.match.effects.carTrail(r,this.carPos,this.carQuat,e)}update(t,e){if(this.done)return!1;t=Math.min(t,.05);let i=this.t;return this.t+=t,e&&i>1?(this.finish(!0),!1):(this.updateFlashes(t),this.stage===1?this.updateStadium(i,t):this.updateSpace(i,t),this.done?!1:(this.app.gfx.render(),!0))}updateStadium(t,e){let i=this.app,n=this.cine,r=this.match,o=this.s,a=Ie[this.team];t>2.6&&this.once("caption-off")&&this.hideCaption();let l=Ci((t-.6)/1.1);n.setGoalFlap(this.target,Math.PI/2*C1(l)),t>.6&&this.once("flap")&&(i.audio.cine("flap"),i.stadium.goalFlash(this.target)),t>1.2&&this.once("flapLand")&&i.audio.cine("clunk");let c=R1*Af(Ci((t-.5)/1.1));n.setCut(this.target,t<this.tSuck+2.3?c:0);for(let d of this.edges)d.visible=c>1&&t<this.tSuck+2.2,d.position.x=d.userData.side*c*.01;let h=Af(Ci((t-1.1)/2.5));if(t>1.1&&this.once("build")&&i.audio.cine("build"),t<this.tBoom?this.reveal.value=this.roadLen*h:this.reveal.value=this.roadLen*(1-Af(Ci((t-this.tBoom)/3.2))),t>Qs-.2&&this.once("go")&&i.audio.cine("launch"),t<this.tEnd){this.placeChamp(t,e);let d=this.driveSpeed(t);i.audio.updateEngine(this.engine,Math.min(2300,d),t>Qs?1:0,t>Qs-.1,!0,!0)}else if(t<this.tBoom){this.once("fall")&&(this.fallFrom=this.roadEnd.p.clone().addScaledVector(this.roadEnd.U,17),this.fallDir=this.roadEnd.T.clone(),this.fallQuat=this.carQuat.clone(),i.audio.cine("whoosh"));let d=Ci((t-this.tEnd)/this.fallDur),f=Math.pow(d,1.35),g=this.fallFrom,v=Sn.copy(g).addScaledVector(this.fallDir,4200),p=this.bhPos,m=(1-f)*(1-f),x=2*(1-f)*f,M=f*f;this.carPos.set(g.x*m+v.x*x+p.x*M,g.y*m+v.y*x+p.y*M,g.z*m+v.z*x+p.z*M);let y=Qi.set(2*(1-f)*(v.x-g.x)+2*f*(p.x-v.x),2*(1-f)*(v.y-g.y)+2*f*(p.y-v.y),2*(1-f)*(v.z-g.z)+2*f*(p.z-v.z)).normalize();as.setFromUnitVectors(Ts.set(0,0,1),y),D0.setFromAxisAngle(Ts.set(0,0,1),d*d*9),as.multiply(D0),this.carQuat.copy(this.fallQuat).slerp(as,wf(0,.5,d));let S=this.carState;S.vel.copy(y).multiplyScalar(Bo),S.boosting=d<.4;let b=this.champ.model;b.update(S,this.carPos,this.carQuat,e);let A=this.carPos.distanceTo(this.bhPos),_=Ci(1-(A-this.bhR)/(this.bhR*3));b.root.scale.set(1-_*.7,1-_*.7,1+_*5),S.boosting&&r.effects.carTrail(S,this.carPos,this.carQuat,e),i.audio.updateEngine(this.engine,2300,0,!1,!1,d<.6)}else if(this.once("boom")){this.champ.model.root.visible=!1,i.audio.updateEngine(this.engine,0,0,!1,!1,!1),i.audio.cine("boom"),this.flash("#fff3e0",.35,.04,.05,.6),this.shake=1.4;let d=Qi.copy(this.bhPos).multiplyScalar(.01),f=r.effects;this.nova=new ot(new ai(1,48,24),new ve({color:new St(2.4,1.5,.8),transparent:!0,blending:Te,depthWrite:!1,fog:!1})),this.nova.position.copy(d),this.ring=new ot(new qi(1,.025,8,128),new ve({color:new St(a.light).multiplyScalar(5),transparent:!0,blending:Te,depthWrite:!1,fog:!1})),this.ring.position.copy(d),this.ring.quaternion.copy(this.bh.group.quaternion).multiply(as.setFromAxisAngle(Ts.set(1,0,0),Math.PI/2)),this.group.add(this.nova,this.ring);let g=a.flame,v=Math.round(320*f.mult);for(let p=0;p<v;p++)Sn.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiplyScalar(40+Math.random()*160),f.glow.emit(d.x,d.y,d.z,Sn.x,Sn.y,Sn.z,.8+Math.random()*1.4,2+Math.random()*4,.6+Math.random()*1.5,[g[0]*1.6,g[1]*1.6,g[2]*1.6,1],[1.4,.4,.08,0],.6,0)}if(this.nova){let d=(t-this.tBoom)/.9;this.nova.visible=d<1,d<1&&(this.nova.scale.setScalar(this.bhR*.01*(1+1.6*su(d))),this.nova.material.opacity=(1-d)*(1-d));let f=(t-this.tBoom)/1.8;this.ring.visible=f<1,f<1&&(this.ring.scale.setScalar(this.bhR*.01*(2+22*su(f))),this.ring.material.opacity=1-f)}let u=su(Ci((t-this.tBoom)/2.6));this.bhR=ru+(L1-ru)*u,this.bh.group.scale.setScalar(this.bhR*.01),this.bh.u.uI.value=.6+u*.4,this.bh.u.uGlow.value=.6+u*.6,t>this.tSuck&&this.updateSuck(t-this.tSuck),this.updateCamera(t,e),this.bh.update(e,this.camera),r.effects.update(e),i.stadium.update(e),t>this.tSpace-.45&&this.once("toSpace")&&(this.flash("#d6ebff",1,.45,.12,1.1),i.audio.cine("whoosh")),t>this.tSpace&&this.once("space")&&this.enterSpace()}updateSuck(t){let e=this.match,i=this.app;if(this.once("suck")){i.audio.cine("drone"),this.debrisMesh.visible=!0,this.loose=[];for(let c of e.players)c!==this.champ&&this.loose.push({obj:c.model.root,p0:c.model.root.position.clone(),q0:c.model.root.quaternion.clone(),t0:.2+Math.random()*1.2,dur:2.4+Math.random(),axis:new T(Math.random()-.5,1,Math.random()-.5).normalize(),spin:3+Math.random()*4,swirl:2+Math.random()*2,lift:15});this.loose.push({obj:e.ball,p0:e.ball.position.clone(),q0:e.ball.quaternion.clone(),t0:.1,dur:2.6,axis:new T(1,0,0),spin:6,swirl:2.5,lift:20});let l=Qi.copy(this.bhPos).multiplyScalar(.01);this.bStart=this.bMats.map((c,h)=>{let u=new T,d=new he,f=new T;c.decompose(u,d,f);let g=u.distanceTo(l);return{pos:u,quat:d,scl:f,t0:.6+g/900*2.6+Math.random()*.5,dur:2.4+Math.random()*1.2,axis:new T(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),spin:.6+Math.random()*1.6,swirl:1+Math.random()*2,hidden:this.roadBlocked.has(h)}})}let n=this.debrisMesh,r=this._tmp||(this._tmp=new T);for(let l=0;l<this.debris.length;l++){let c=this.debris[l],h=Ci((t-c.t0)/c.dur);if(h<=0||h>=1){n.setMatrixAt(l,Un.makeScale(0,0,0));continue}let u=this.suckPos(c.p0,h,c.swirl,c.lift,r);as.setFromAxisAngle(c.axis,c.spin*(t-c.t0)),Ts.copy(c.size).multiplyScalar(u*Math.min(1,h*8)),n.setMatrixAt(l,Un.compose(r,as,Ts))}n.instanceMatrix.needsUpdate=!0;for(let l of this.loose){let c=Ci((t-l.t0)/l.dur);if(c<=0)continue;let h=this.suckPos(l.p0,c,l.swirl,l.lift,r);l.obj.position.copy(r),as.setFromAxisAngle(l.axis,l.spin*(t-l.t0)*c),l.obj.quaternion.copy(l.q0).premultiply(as),l.obj.scale.setScalar(Math.max(.001,h)),l.obj.visible=c<1}let o=this.cine.buildings;for(let l=0;l<this.bStart.length;l++){let c=this.bStart[l];if(c.hidden)continue;let h=Ci((t-c.t0)/c.dur);if(h<=0)continue;let u=this.suckPos(c.pos,h,c.swirl,0,r);as.setFromAxisAngle(c.axis,c.spin*(t-c.t0)).multiply(c.quat),Ts.copy(c.scl).multiplyScalar(u),o.setMatrixAt(l,Un.compose(r,as,Ts))}o.instanceMatrix.needsUpdate=!0;let a=Ci((t-2.4)/2.9);if(a>0){let l=this.cine.arena,c=this.suckPos(Ts.set(0,0,0),a,1.2,30,r);l.position.copy(r),l.quaternion.setFromAxisAngle(Qi.set(1,0,.4).normalize(),-this.s*1.4*a*a),l.scale.setScalar(.01*Math.max(.001,c)),l.visible=c>.002;for(let h of this.edges)h.visible=!1;this.once("arenaGo")&&i.audio.cine("tear")}}updateCamera(t,e){let i=this.camera,n=this.s,r=this.camPos,o=this.camLook,a=tr,l=!1;if(t<3.7){let u=t/3.7;r.set(430-120*u,200-30*u,n*(300+380*u)).multiplyScalar(.01);let d=Qi.set(0,380,n*6e3),f=this.frameAt(this.groundLen+this.reveal.value,this.camFrame).p,g=wf(1.2,2.6,t);o.copy(d).lerp(f,g*.85).lerp(this.bhPos,wf(2.7,3.6,t)*.8).multiplyScalar(.01),l=!this.camInit}else if(t<this.tEnd-.3){this.once("chaseCut")&&(l=!0);let u=this.driveDist(t),d=this.frameAt(u-560,this.camFrame);Qi.copy(d.p).addScaledVector(d.U,200),r.copy(Qi).multiplyScalar(.01),o.copy(this.carPos).addScaledVector(this.frame.T,900).addScaledVector(this.frame.U,60).multiplyScalar(.01),a=this.camUpTarget||(this.camUpTarget=new T),a.copy(d.U)}else if(t<this.tSuck){if(this.once("sideCut")){l=!0;let d=this.roadEnd.p,f=Sn.crossVectors(this.roadEnd.T,tr).normalize();this.sidePos=d.clone().lerp(this.bhPos,.45).addScaledVector(f,6800).add(Qi.set(0,1300,0)).addScaledVector(this.roadEnd.T,-1800),this.sideLook=d.clone().lerp(this.bhPos,.55)}let u=Ci((t-this.tEnd+.3)/(this.tBoom-this.tEnd+.3));r.copy(this.sidePos).lerp(this.sideLook,u*.25),r.addScaledVector(Qi.subVectors(this.sidePos,this.sideLook),1.2*su(Ci((t-this.tBoom)/.55))),r.multiplyScalar(.01),o.copy(this.sideLook).multiplyScalar(.01)}else{this.once("wideCut")&&(l=!0);let u=Ci((t-this.tSuck)/(this.tSpace-this.tSuck)),d=Sn.set(0,90,n*170),f=Qi.set(-560,420,n*-260);r.copy(f).sub(d).multiplyScalar(1+1.2*u*u).add(d),r.y+=300*u*u,o.copy(d).lerp(Sn.set(0,140,n*300),u)}l||!this.camInit?(this.camInit=!0,this.camUp.copy(a)):this.camUp.lerp(a,1-Math.exp(-e*6)).normalize(),this.shake=Math.max(0,this.shake-e*.9);let c=t>this.tSuck?.25+.35*Ci((t-this.tSuck)/4):0,h=Math.max(this.shake,c);if(i.position.copy(r),h>0){let u=.006*h*r.distanceTo(o);i.position.x+=(Math.random()-.5)*u,i.position.y+=(Math.random()-.5)*u,i.position.z+=(Math.random()-.5)*u}i.up.copy(this.camUp),i.lookAt(o)}enterSpace(){let t=this.app;this.stage=2,this.hideStadiumBits(),t.audio.stopEngine(this.engine);let e={flash:(i,n,r,o,a)=>this.flash(i,n,r,o,a),text:()=>this.caption(`${this.team===0?"BLUE":"ORANGE"} WINS!`,"...and blew up the universe","final "+(this.team===0?"blue":"orange")),sound:i=>t.audio.cine(i),shake:i=>{this.space.shakeAmt=Math.max(this.space.shakeAmt,i)}};this.space=new nu(t.gfx.renderer,this.quality,e),this.view.camera=this.space.camera,this.view.hfov=80,t.gfx.overrideScene=this.space.scene,t.gfx.setViews([this.view]),t.audio.cine("space")}updateSpace(t,e){let i=this.space;i.update(e);let n=80*(i.fov/55);Math.abs(n-this.view.hfov)>.5&&(this.view.hfov=n,this.app.gfx.updateCameras()),i.done&&this.finish(!1)}hideStadiumBits(){this.debrisMesh.visible=!1;for(let t of this.edges)t.visible=!1}finish(t){if(this.done)return;this.done=!0,this.app.audio.cine("stop"),this.restore(),this.overlay.classList.add("out"),this.fill.style.transition=`opacity ${t?.35:1.2}s ease`,this.fill.style.background="#fff",this.fill.style.opacity=t?"0.6":"1",requestAnimationFrame(()=>{this.fill.style.opacity="0"});let e=this.overlay;setTimeout(()=>e.remove(),t?600:1800),this.textEl.className="cine-text"}restore(){let t=this.app,e=this.match;this.bloomWas&&t.gfx.bloom&&Object.assign(t.gfx.bloom,this.bloomWas),t.gfx.overrideScene=null,this.space&&(this.space.dispose(),this.space=null),this.cine.reset();let i=this.cine.buildings;this.bMats.forEach((n,r)=>i.setMatrixAt(r,n)),i.instanceMatrix.needsUpdate=!0;for(let n of this.edges)n.parent.remove(n),n.traverse(r=>{r.geometry&&r.geometry.dispose()});this.edgeMat.dispose();for(let n of e.players)n.model.root.scale.setScalar(1),n.model.root.visible=!0;e.ball.scale.setScalar(1),e.ball.visible=this.ballWasVisible,e.effects.clear(),this.group.parent.remove(this.group),this.group.traverse(n=>{if(n.geometry&&n.geometry.dispose(),n.material){let r=Array.isArray(n.material)?n.material:[n.material];for(let o of r)o.map&&o.map.dispose(),o.emissiveMap&&o.emissiveMap.dispose(),o.dispose()}}),this.bh.dispose(),t.audio.stopEngine(this.engine)}dispose(){this.done||(this.done=!0,this.app.audio.cine("stop"),this.restore()),this.overlay.remove()}};var U1=["Atlas","Blitz","Comet","Dash","Echo","Flare","Ghost","Havoc","Jinx","Nova","Rex","Zippy","Vortex","Turbo"],F1=6,yl=60,Oo=null;function B1(){Oo||(Oo=h0(1024));let s=new qt({map:Oo.map,emissive:16777215,emissiveMap:Oo.emissiveMap,emissiveIntensity:2.4,roughness:1,roughnessMap:Oo.roughnessMap,metalness:.65,bumpMap:Oo.bumpMap,bumpScale:1.2}),t=new ot(new ai(Ne.radius*.01,64,40),s);return t.castShadow=!0,t}var Fn=new T,Bn=new he,On=new T,Ho=new he;function O1(s){return!s||s.type==="any"?"RB / F":s.type==="pad"?"RB":s.layout==="p2"?"H":"F"}function Cf(s){for(let t=s.length-1;t>0;t--){let e=Math.floor(Math.random()*(t+1));[s[t],s[e]]=[s[e],s[t]]}return s}var _l=class s{constructor(t,e){this.app=t,this.cfg=e,this.attract=e.mode==="attract",this.world=new Oh,this.group=new Me,t.gfx.scene.add(this.group),this.effects=new Kh(this.group,t.settings.quality),this.tireMarks=new xl(this.group,t.settings.quality==="low"?900:2400,t.settings.quality==="high"?.075:.02),this.ball=B1(),this.group.add(this.ball),t.settings.quality==="low"&&(this.ballBlob=this.addBlob(1.7,1.7)),this.players=[];let i=Cf(U1.slice()),n=Cf([7,9,11,17,21,24,33,42,55,73,88,99]);for(let a of[0,1]){let l=e.humans.filter(c=>c.team===a);for(let c=0;c<e.teamSize;c++){let h=l[c],u=this.world.addCar(new Vh(a,h?h.name:i.pop()));u.handling=t.settings.handling==="realistic"?"realistic":"easy";let d=new $h(a,n.pop(),t.settings.quality);this.group.add(d.root),t.settings.quality==="low"&&(d.blob=this.addBlob(1.6,2.2));let f={car:u,model:d,human:!!h,device:h?h.device:null,bot:h?null:new Wh(u,e.difficulty),name:u.name};this.players.push(f)}}this.humans=this.players.filter(a=>a.human),this.gameMode=e.gameMode||"soccar";let r=!e.items||e.items==="all"?_o:[e.items];this.world.mode=km(this.world,this.gameMode,r),this.modeFx=this.world.mode?new jh(this.group,this.effects,this.world.mode):null,t.input.rbIsItem=this.gameMode==="rumble",this.views=[];let o=this.humans.length;if(this.attract||o===0){let a=new ei(60,1,.1,3e3);this.views.push({camera:a,rect:[0,0,1,1],hfov:90,rig:new Lo(a)})}else this.humans.forEach((a,l)=>{let c=new ei(70,1,.05,3e3),h=[0,0,1,1];o===2&&(h=e.split==="vertical"?[l*.5,0,.5,1]:[0,l*.5,1,.5]);let u=new Lo(c);u.ballCam=t.settings.ballCam,o===2&&e.split!=="vertical"&&(u.distance=310,u.height=120);let d={camera:c,rect:h,hfov:t.settings.fov,rig:u,player:a,label:a.name,team:a.car.team};a.view=d,a.viewIndex=l,this.views.push(d)});this.replayCam=new ei(55,1,.1,3e3),this.replayRig=new Lo(this.replayCam),this.replayView={camera:this.replayCam,rect:[0,0,1,1],hfov:80},t.gfx.setViews(this.views),this.attract?this.engines=[]:(t.hud.setup(this.views),t.hud.show(!0),this.engines=this.humans.map((a,l)=>t.audio.createEngine(o===2&&e.split==="vertical"?l===0?-.5:.5:0))),this.scores=[0,0],this.clock=e.duration||0,this.unlimited=!e.duration,this.overtime=!1,this.state="countdown",this.stateT=0,this.acc=0,this.pred=[],this.predFrame=0,this.threat=-1,this.frame=0,this.time=0,this.snapSize=9+13*this.players.length,this.snapCount=F1*yl,this.snaps=new Float32Array(this.snapSize*this.snapCount),this.snapHead=0,this.snapFilled=0,this.stepIndex=0,this.fakeCars=this.players.map(a=>({team:a.car.team,vel:new T,boosting:!1,supersonic:!1,demolished:!1,steerVisual:0,wheelSpin:0,wheelDist:[17,17,17,17],onGround:!0})),this.kickoff()}addBlob(t,e){if(!s.blobTex){let n=document.createElement("canvas");n.width=n.height=64;let r=n.getContext("2d"),o=r.createRadialGradient(32,32,0,32,32,32);o.addColorStop(0,"rgba(0,0,0,0.55)"),o.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=o,r.fillRect(0,0,64,64),s.blobTex=new ri(n)}let i=new ot(new oi(t,e),new ve({map:s.blobTex,transparent:!0,depthWrite:!1}));return i.rotation.x=-Math.PI/2,i.renderOrder=1,this.group.add(i),i}placeBlob(t,e,i,n){if(!t)return;let r=e.y-n;t.visible=r<600,t.position.set(e.x*.01,.03,e.z*.01);let o=Math.max(.4,1-r/800);t.scale.setScalar(o),t.material.opacity=o,i&&(t.rotation.z=Math.atan2(2*(i.w*i.y+i.x*i.z),1-2*(i.y*i.y+i.z*i.z)))}dispose(){this.cine&&(this.cine.dispose(),this.cine=null),this.app.gfx.scene.remove(this.group),this.group.traverse(t=>{if(t.geometry&&!t.geometry.userData.shared&&t.geometry.dispose(),t.material&&t.material!==this.ball.material){let e=Array.isArray(t.material)?t.material:[t.material];for(let i of e)i.dispose()}}),this.app.audio.stopEngines(),this.app.input.rbIsItem=!1}kickoff(){let t=this.world;t.ball.reset(),t.resetPads(),this.ball.visible=!0;let e=Cf([0,1,2,3,4]);for(let i of[0,1]){let n=this.players.filter(o=>o.car.team===i),r=i===0?1:-1;n.forEach((o,a)=>{let l=Um[e[a%5]];o.car.place(l[0]*r,l[1]*r,i===0?l[2]:l[2]+Math.PI),o.car.frozen=!0,o.car.input.jump=!1,o.car.prevJump=!1})}for(let i of this.views)i.rig&&i.rig.snap();this.world.mode&&this.world.mode.reset(),this.state="countdown",this.stateT=this.attract?1.2:3,this.lastBeep=4,this.threat=-1,this.acc=0,this.attract||this.app.hud.hideBanner()}startPlay(){this.state="playing";for(let t of this.players)t.car.frozen=!1;this.world.ball.frozen=!1,this.attract||(this.app.hud.showBanner("GO!","","go",.8),this.app.audio.beep(!0))}scored(t){let e=1-t,n=this.world.ball;this.scores[e]++;let r=n.lastTouch,o=n.prevTouch,a=r&&r.team===e?r:o&&o.team===e?o:null,l=a&&o&&o!==a&&o.team===e&&r===a?o:null;a&&(a.stats.goals++,a.stats.score+=100),l&&(l.stats.assists++,l.stats.score+=50);let c=n.pos.clone();this.goalTime=this.time,this.goalTeam=e,this.goalOf=t,this.effects.explosion(c,e,!0),this.app.stadium.goalFlash(t),this.app.stadium.cheer(1);for(let h of this.players){let u=h.car;if(u.demolished)continue;let d=u.pos.distanceTo(c);if(d<2600){let f=u.pos.clone().sub(c).setY(0).normalize().multiplyScalar((1-d/2600)*1800);u.vel.add(f),u.vel.y+=(1-d/2600)*700,u.noGround=.15,u.onGround=!1}}n.frozen=!0,n.vel.set(0,0,0),this.ball.visible=!1;for(let h of this.views)h.rig&&h.rig.addShake(1);if(!this.attract){this.app.audio.goal();for(let d of this.humans)this.app.input.rumble(d.device,1,1,700);let h=Ie[e],u=a?a.name:e===0?"Blue":"Orange";this.app.hud.showBanner("GOAL!",a?`${u} scored${l?" \u2022 assist: "+l.name:""}`:"Own goal",e===0?"blue":"orange",2.6),this.app.hud.addFeed(`<b style="color:${h.css}">${u}</b> scored!`,e)}this.state="goal",this.stateT=2.8,this.endAfterGoal=this.overtime||!this.unlimited&&this.clock<=0}startReplay(){if(this.attract||this.snapFilled<yl*2||!this.app.settings.replays){this.afterReplay();return}this.state="replay";let t=this.snapFilled/yl,e=this.time-this.goalTime;this.replayEnd=Math.max(0,e-.35),this.replayStart=Math.min(t-.05,e+4.2),this.replayT=this.replayStart,this.replayExploded=!1,this.app.gfx.setViews([this.replayView]),this.replayRig.snap(),this.app.hud.setup([]),this.app.hud.showBanner("REPLAY","Press A / Space to skip","replay",99),this.ball.visible=!0,this.effects.clear()}afterReplay(){if(this.state==="replay"&&(this.app.gfx.setViews(this.views),this.app.hud.setup(this.views),this.app.hud.hideBanner()),this.endAfterGoal){this.finish();return}this.kickoff()}finish(){this.state="over",this.stateT=3;for(let i of this.players)i.car.frozen=!0,i.car.boosting=!1;this.world.ball.frozen=!0;let t=this.scores[0]>this.scores[1]?0:1;this.winner=t,this.app.audio.horn(),this.app.stadium.cheer(.8),this.app.hud.showBanner(t===0?"BLUE WINS!":"ORANGE WINS!",`${this.scores[0]} - ${this.scores[1]}`,t===0?"blue":"orange",99);let e=this.humans.filter(i=>i.car.team===t).sort((i,n)=>n.car.stats.score-i.car.stats.score)[0];e&&this.app.settings.victoryFx!==!1&&(this.app.hud.hideBanner(),this.effects.clear(),this.state="victory",this.cine=new au(this,e,t))}endVictory(){this.cine&&(this.cine.dispose(),this.cine=null),this.app.gfx.setViews(this.views),this.app.hud.setup(this.views),this.app.hud.show(!0),this.app.hud.showBanner(this.winner===0?"BLUE WINS!":"ORANGE WINS!",`${this.scores[0]} - ${this.scores[1]}`,this.winner===0?"blue":"orange",99),this.state="over",this.stateT=0}results(){let t=this.players.map(i=>({name:i.name,team:i.car.team,human:i.human,...i.car.stats}));t.sort((i,n)=>n.score-i.score);let e=t.filter(i=>i.team===this.winner).sort((i,n)=>n.score-i.score)[0];return{scores:this.scores.slice(),winner:this.winner,rows:t,mvp:e?e.name:""}}update(t){t=Math.min(t,.1),this.time+=t,this.frame++;let e=this.app,i=e.input,n=!1;for(let o of this.humans){let a=i.controls(o.device);if(o.controls=a,a.pause&&this.state==="victory")n=!0;else if(a.pause&&this.state!=="over"&&e.frames!==e.resumeFrame){e.pauseMatch(o);return}a.skip&&(n=!0),a.ballCam&&o.view&&(o.view.rig.ballCam=!o.view.rig.ballCam,e.hud.viewStatus(o.viewIndex,o.view.rig.ballCam?"BALL CAM":"CAR CAM"));let l=o.car.input;l.throttle=a.throttle,l.pitch=a.pitch,l.yaw=a.yaw,l.roll=a.roll,l.jump=a.jump,l.boost=a.boost,l.powerslide=a.powerslide,l.steer=this.shapeSteer(o,a,t),l.useItem=!!a.itemDown}if(this.state==="victory"){this.cine.update(t,n)||this.endVictory();return}(this.frame%3===0||this.pred.length===0)&&(rf(this.world.ball,3.5,1/60,this.pred),this.threat=this.goalIn(this.pred));let r=this.world.ball.lastTouch===null&&this.state==="playing";for(let o of this.players)o.bot&&o.bot.update(t,{world:this.world,pred:this.pred,time:this.world.time,kickoff:r,rumble:this.gameMode==="rumble"?this.world.mode:null,teammates:this.players.filter(a=>a.car.team===o.car.team).map(a=>a.car),opponents:this.players.filter(a=>a.car.team!==o.car.team).map(a=>a.car)});switch(this.state){case"countdown":{this.stateT-=t;let o=Math.ceil(this.stateT);!this.attract&&o<this.lastBeep&&o>0&&(this.lastBeep=o,e.hud.showBanner(String(o),this.overtime?"OVERTIME":"","count",1),e.audio.beep(!1)),this.stateT<=0&&this.startPlay();break}case"playing":this.unlimited||(this.overtime?this.clock+=t:this.clock>0&&(this.clock=Math.max(0,this.clock-t)));break;case"goal":this.stateT-=t,this.stateT<=0&&this.startReplay();break;case"replay":this.replayT-=t,(n||this.replayT<=this.replayEnd)&&this.afterReplay();break;case"over":this.stateT-=t,this.stateT<=0&&!this.resultsShown&&(this.resultsShown=!0,e.showResults(this.results()));break;default:break}if(this.state==="replay"){this.renderReplay(t);return}{this.acc+=t;let o=0;for(;this.acc>=ll&&o<12;)if(this.world.step(ll),this.acc-=ll,o++,this.stepIndex++%(120/yl)===0&&this.recordSnap(),this.state==="playing"){let a=this.world.ball.goalState();if(a>=0){this.scored(a);break}}o>=12&&(this.acc=0)}if(this.state==="playing"&&!this.unlimited&&!this.overtime&&this.clock<=0){let o=this.world.ball;(o.pos.y<Ne.radius+25||o.frozen)&&(this.scores[0]===this.scores[1]?(this.overtime=!0,this.clock=0,e.hud.showBanner("OVERTIME","Next goal wins","ot",2.5),e.audio.horn(),this.kickoff(),this.stateT=4):this.finish())}this.processEvents(),this.renderFrame(t)}shapeSteer(t,e,i){let n=e.steer;if(this.app.settings.handling==="realistic")return t.steerS=n,n;if(e.digitalSteer){let r=t.steerS||0,a=Math.sign(n)!==Math.sign(r)||Math.abs(n)<Math.abs(r)?14:6;t.steerS=r+Math.max(-a*i,Math.min(a*i,n-r))}else t.steerS=Math.sign(n)*Math.pow(Math.abs(n),1.5);return t.steerS}clockText(){if(this.unlimited)return"\u221E";let t=Math.max(0,this.overtime?Math.floor(this.clock):Math.ceil(this.clock));return`${this.overtime?"+":""}${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}goalIn(t){for(let e of t)if(Math.abs(e.pos.x)<Ft.goalHalfW&&e.pos.y<Ft.goalH){if(e.pos.z>Ft.halfZ+Ne.radius)return 1;if(e.pos.z<-Ft.halfZ-Ne.radius)return 0}return-1}processEvents(){let t=this.app,e=this.world.events,i=this.humans.map(r=>r.car),n=r=>{if(!r||i.length===0)return .6;let o=1/0;for(let a of i)o=Math.min(o,a.pos.distanceTo(r));return Math.max(.15,1-o/7e3)};for(let r of e){let o=r.car?this.humans.find(a=>a.car===r.car):null;switch(r.type){case"ballHit":r.strength>350&&this.effects.hit(r.point,r.strength),this.attract||(r.strength>250&&t.audio.hit(r.strength*n(r.point)),o&&(t.input.rumble(o.device,Math.min(1,r.strength/2500),.4,120),r.strength>1500&&o.view.rig.addShake(Math.min(.45,r.strength/7e3))),this.onTouch(r.car,o));break;case"bounce":!this.attract&&r.strength>400&&t.audio.bounce(r.strength*n(r.point));break;case"jump":o&&t.audio.jump();break;case"dodge":o&&t.audio.dodge();break;case"land":o&&(t.audio.land(r.strength),t.input.rumble(o.device,.15,.2,60));break;case"bump":if(!this.attract){t.audio.bump();let a=this.humans.find(l=>l.car===r.by);o&&t.input.rumble(o.device,.7,.5,200),a&&t.input.rumble(a.device,.4,.3,120)}break;case"demo":if(this.effects.demolition(r.point,r.car.team),r.by.stats.score+=25,!this.attract){t.audio.demo();for(let l of this.humans){let c=l.car.pos.distanceTo(r.point);c<3e3&&l.view&&l.view.rig.addShake(l.car===r.car||l.car===r.by?.9:.6*(1-c/3e3))}t.hud.addFeed(`<b style="color:${Ie[r.by.team].css}">${r.by.name}</b> \u{1F4A5} <b style="color:${Ie[r.car.team].css}">${r.car.name}</b>`),o&&(t.input.rumble(o.device,1,1,450),t.hud.viewCenter(o.viewIndex,"DEMOLISHED",2.8));let a=this.humans.find(l=>l.car===r.by);a&&(t.input.rumble(a.device,.6,.6,200),t.hud.viewCenter(a.viewIndex,"DEMOLITION!",1.5))}break;case"itemGet":o&&(t.audio.itemGet(),t.input.rumble(o.device,.15,.3,90));break;case"itemUse":this.attract||t.audio.itemUse(r.item,n(r.car.pos)),r.item==="freezer"&&this.effects.flash(this.ball.position.clone(),10477823,2.6,.35,2.5),r.item==="curveball"&&this.effects.ring(this.ball.position.clone(),Ie[r.car.team].light,5,.5);break;case"itemFail":o&&t.hud.viewStatus(o.viewIndex,r.item==="boot"?"NO OPPONENT IN RANGE":"BALL OUT OF RANGE",1.2);break;case"hooked":this.attract||t.audio.hook(n(r.point));break;case"boot":this.effects.flash(r.point.clone().multiplyScalar(.01),16765056,2.2,.3,2.5),this.effects.hit(r.point,2600),this.attract||(t.audio.bump(),t.hud.addFeed(`<b style="color:${Ie[r.by.team].css}">${r.by.name}</b> \u{1F462} <b style="color:${Ie[r.car.team].css}">${r.car.name}</b>`),o&&(t.input.rumble(o.device,.9,.7,300),t.hud.viewCenter(o.viewIndex,"BOOTED!",1.4)));break;case"heatseekFlip":this.effects.hit(r.point,2200);break;case"boostPickup":this.effects.boostPickup(r.pad),o&&(t.audio.boostPickup(r.big),r.big&&t.input.rumble(o.device,.1,.3,80));break;default:break}}e.length=0}onTouch(t,e){if(this.state!=="playing"||this.world.time-(t.lastShotCheck||-10)<.4)return;t.lastShotCheck=this.world.time;let i=this.threat,n=this._shotBuf||(this._shotBuf=[]);rf(this.world.ball,3,1/40,n);let r=this.goalIn(n);this.threat=r,i===t.team&&r!==t.team&&(t.stats.saves++,t.stats.score+=50,this.app.hud.addFeed(`<b style="color:${Ie[t.team].css}">${t.name}</b> made a save!`),e&&this.app.hud.viewCenter(e.viewIndex,"SAVE!",1.5)),r===1-t.team&&i!==r&&(t.stats.shots++,t.stats.score+=20,this.app.audio.cheer(.35),e&&this.app.hud.viewCenter(e.viewIndex,"SHOT ON GOAL",1.2))}recordSnap(){let t=this.snapHead*this.snapSize,e=this.snaps,i=this.world.ball;e[t]=this.time,e[t+1]=i.pos.x,e[t+2]=i.pos.y,e[t+3]=i.pos.z,e[t+4]=i.quat.x,e[t+5]=i.quat.y,e[t+6]=i.quat.z,e[t+7]=i.quat.w,e[t+8]=this.ball.visible?1:0;let n=t+9;for(let r of this.players){let o=r.car;e[n]=o.pos.x,e[n+1]=o.pos.y,e[n+2]=o.pos.z,e[n+3]=o.quat.x,e[n+4]=o.quat.y,e[n+5]=o.quat.z,e[n+6]=o.quat.w,e[n+7]=o.vel.x,e[n+8]=o.vel.y,e[n+9]=o.vel.z,e[n+10]=(o.boosting?1:0)|(o.supersonic?2:0)|(o.demolished?4:0)|(o.onGround?8:0),e[n+11]=o.steerVisual,e[n+12]=o.wheelSpin,n+=13}this.snapHead=(this.snapHead+1)%this.snapCount,this.snapFilled=Math.min(this.snapCount,this.snapFilled+1)}snapAt(t){let e=Math.min(this.snapFilled-1,Math.max(0,t*yl)),i=Math.floor(e),n=e-i,r=(this.snapHead-1-i+this.snapCount*2)%this.snapCount,o=(r-1+this.snapCount)%this.snapCount;return{a:r*this.snapSize,b:o*this.snapSize,t:n}}renderReplay(t){let{a:e,b:i,t:n}=this.snapAt(this.replayT),r=this.snaps,o=l=>r[e+l]+(r[i+l]-r[e+l])*n;On.set(o(1),o(2),o(3)),Ho.set(r[e+4],r[e+5],r[e+6],r[e+7]),this.ball.position.copy(On).multiplyScalar(.01),this.ball.quaternion.copy(Ho),this.ball.visible=r[e+8]>.5;let a=9;this.players.forEach((l,c)=>{let h=this.fakeCars[c];Fn.set(o(a),o(a+1),o(a+2)),Bn.set(r[e+a+3],r[e+a+4],r[e+a+5],r[e+a+6]),Ho.set(r[i+a+3],r[i+a+4],r[i+a+5],r[i+a+6]),Bn.slerp(Ho,n),h.vel.set(r[e+a+7],r[e+a+8],r[e+a+9]);let u=r[e+a+10];h.boosting=!!(u&1),h.supersonic=!!(u&2),h.demolished=!!(u&4),h.steerVisual=r[e+a+11],h.wheelSpin=r[e+a+12],l.model.update(h,Fn,Bn,t),this.effects.carTrail(h,Fn,Bn,t),a+=13}),!this.replayExploded&&this.ball.visible===!1&&(this.replayExploded=!0,this.effects.explosion(On,this.goalTeam,!0)),this.replayRig.updateReplay(t,On,this.goalOf===1?Ft.halfZ:-Ft.halfZ,this.replayT),this.effects.update(t),this.app.stadium.update(t),this.app.hud.update(t),this.app.gfx.render()}renderFrame(t){let e=this.app,i=this.acc/ll,n=this.world.ball;On.lerpVectors(n.prevPos,n.pos,i),Ho.slerpQuaternions(n.prevQuat,n.quat,i),this.ball.position.copy(On).multiplyScalar(.01),this.ball.quaternion.copy(Ho),this.ball.visible&&this.effects.ballTrail(n,On),this.placeBlob(this.ballBlob,On,null,Ne.radius),this.ballBlob&&(this.ballBlob.visible=this.ballBlob.visible&&this.ball.visible);let r=[];for(let a of this.players){let l=a.car;Fn.lerpVectors(l.prevPos,l.pos,i),Bn.slerpQuaternions(l.prevQuat,l.quat,i),a.ipos=(a.ipos||new T).copy(Fn),a.iquat=(a.iquat||new he).copy(Bn),a.model.update(l,Fn,Bn,t),this.placeBlob(a.model.blob,Fn,Bn,17);let c=this.state==="replay"?0:xl.skid(l);this.tireMarks.update(l,Fn,Bn,c),this.effects.dirt(l,Fn,Bn,c,t),a.model.blob&&(a.model.blob.visible=a.model.blob.visible&&!l.demolished),this.effects.carTrail(l,Fn,Bn,t),r.push({car:l,pos:a.ipos,name:a.name})}if(this.attract){let a=this.views[0],l=this.time*.05,c=a.camera,h=62;c.position.set(Math.cos(l)*h*.62,13+Math.sin(l*.7)*4,Math.sin(l)*h*.8),c.up.set(0,1,0);let u=Fn.copy(On).multiplyScalar(.01*.6);c.lookAt(u.x,2,u.z)}else{for(let a of this.humans){let l=a.view,c=a.controls||{};l.rig.update(t,a.car,a.ipos,a.iquat,this.ball.visible?On:null,c.lookX||0,c.lookY||0),e.hud.setBoost(a.viewIndex,a.car.boost),this.gameMode==="rumble"&&e.hud.setItem(a.viewIndex,this.world.mode.status(a.car),cl,O1(a.device)),e.hud.updatePlates(a.viewIndex,l.camera,r,a.car)}this.humans.forEach((a,l)=>{let c=a.car;e.audio.updateEngine(this.engines[l],c.vel.length(),c.input.throttle,c.boosting,c.onGround,!c.demolished&&!c.frozen)}),e.hud.setScore(this.scores[0],this.scores[1]),e.hud.setClock(this.clock,this.overtime,this.unlimited),e.hud.update(t)}this.modeFx&&this.modeFx.update(t,this.players,this.ball,On),this.tireMarks.flush();let o=this.state==="goal";o&&this.stateT>1.2&&this.effects.pyro(e.stadium.pyroPoints[this.goalOf],this.goalTeam,t),e.stadium.setScreens(this.scores[0],this.scores[1],this.clockText(),o?this.goalTeam===0?"blue":"orange":null),this.effects.update(t),e.stadium.update(t),e.gfx.render()}renderPaused(){this.app.gfx.render()}};var zo={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var hn=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},H1=new jn(-1,1,1,-1,0,1),Pf=class extends re{constructor(){super(),this.setAttribute("position",new $t([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new $t([0,2,0,0,2,0],2))}},z1=new Pf,er=class{constructor(t){this._mesh=new ot(z1,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,H1)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var lu=class extends hn{constructor(t,e="tDiffuse"){super(),this.textureID=e,this.uniforms=null,this.material=null,t instanceof fe?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=Ms.clone(t.uniforms),this.material=new fe({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new er(this.material)}render(t,e,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Ml=class extends hn{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,i){let n=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(n.REPLACE,n.REPLACE,n.REPLACE),r.buffers.stencil.setFunc(n.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),t.setRenderTarget(i),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(n.EQUAL,1,4294967295),r.buffers.stencil.setOp(n.KEEP,n.KEEP,n.KEEP),r.buffers.stencil.setLocked(!0)}},cu=class extends hn{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var hu=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let i=t.getSize(new Q);this._width=i.width,this._height=i.height,e=new je(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:ui}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new lu(zo),this.copyPass.material.blending=pn,this.timer=new Wa}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){this.timer.update(),t===void 0&&(t=this.timer.getDelta());let e=this.renderer.getRenderTarget(),i=!1;for(let n=0,r=this.passes.length;n<r;n++){let o=this.passes[n];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(n),o.render(this.renderer,this.writeBuffer,this.readBuffer,t,i),o.needsSwap){if(i){let a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}Ml!==void 0&&(o instanceof Ml?i=!0:o instanceof cu&&(i=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new Q);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let i=this._width*this._pixelRatio,n=this._height*this._pixelRatio;this.renderTarget1.setSize(i,n),this.renderTarget2.setSize(i,n);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(i,n)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var F0={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new St(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var ko=class s extends hn{constructor(t,e=1,i,n){super(),this.strength=e,this.radius=i,this.threshold=n,this.resolution=t!==void 0?new Q(t.x,t.y):new Q(256,256),this.clearColor=new St(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new je(r,o,{type:ui,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new je(r,o,{type:ui,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let d=new je(r,o,{type:ui,depthBuffer:!1});d.texture.name="UnrealBloomPass.v"+h,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),o=Math.round(o/2)}let a=F0;this.highPassUniforms=Ms.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=n,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new fe({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new Q(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1),new T(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Ms.clone(zo.uniforms),this.blendMaterial=new fe({uniforms:this.copyUniforms,vertexShader:zo.vertexShader,fragmentShader:zo.fragmentShader,premultipliedAlpha:!0,blending:Te,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new St,this._oldClearAlpha=1,this._basic=new ve,this._fsQuad=new er(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(t,e){let i=Math.round(t/2),n=Math.round(e/2);this.renderTargetBright.setSize(i,n);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(i,n),this.renderTargetsVertical[r].setSize(i,n),this.separableBlurMaterials[r].uniforms.invSize.value=new Q(1/i,1/n),i=Math.round(i/2),n=Math.round(n/2)}render(t,e,i,n,r){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this._fsQuad.render(t),a=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(i),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(t){let e=[],i=t/3;for(let o=0;o<t;o++)e.push(.39894*Math.exp(-.5*o*o/(i*i))/i);let n=[],r=[];for(let o=1;o<t;o+=2){let a=e[o],l=o+1<t?e[o+1]:0,c=a+l;n.push((o*a+(o+1)*l)/c),r.push(c)}return new fe({defines:{KERNEL_PAIRS:n.length},uniforms:{colorTexture:{value:null},invSize:{value:new Q(.5,.5)},direction:{value:new Q(.5,.5)},centerWeight:{value:e[0]},gaussianOffsets:{value:n},gaussianWeights:{value:r}},vertexShader:`

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

				}`})}_getCompositeMaterial(t){return new fe({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

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

				}`})}};ko.BlurDirectionX=new Q(1,0);ko.BlurDirectionY=new Q(0,1);var bl={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};var uu=class extends hn{constructor(){super(),this.isOutputPass=!0,this.uniforms=Ms.clone(bl.uniforms),this.material=new lo({name:bl.name,uniforms:this.uniforms,vertexShader:bl.vertexShader,fragmentShader:bl.fragmentShader}),this._fsQuad=new er(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},_e.getTransfer(this._outputColorSpace)===Ce&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===qa?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Xa?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Ya?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===ur?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===$a?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Ja?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Za&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var If=class extends hn{constructor(t){super(),this.owner=t,this.needsSwap=!1}render(t,e,i){let n=this.renderToScreen?null:i;this.owner.renderViews(n)}},du=class{constructor(t,e){this.quality=e,this.container=t;let i=new Rh({antialias:e!=="low",powerPreference:"high-performance",stencil:!1});if(i.toneMapping=ur,i.toneMappingExposure=1,i.outputColorSpace=ze,i.shadowMap.enabled=e!=="low",i.shadowMap.type=cr,i.autoClear=!1,i.localClippingEnabled=!0,t.appendChild(i.domElement),this.renderer=i,this.scene=new Yn,this.overrideScene=null,this.views=[],this.pixelRatio=Math.min(window.devicePixelRatio||1,e==="high"?1.75:e==="medium"?1.25:1),i.setPixelRatio(this.pixelRatio),e!=="low"){let n=new je(1,1,{type:ui,samples:e==="high"?4:0});this.composer=new hu(i,n),this.composer.addPass(new If(this)),this.bloom=new ko(new Q(256,256),.5,.35,.92),this.composer.addPass(this.bloom),this.composer.addPass(new uu)}this.resize(),this.onResize=()=>this.resize(),window.addEventListener("resize",this.onResize)}setExposure(t){this.renderer.toneMappingExposure=t}setViews(t){this.views=t,this.updateCameras()}resize(){let t=window.innerWidth,e=window.innerHeight;this.width=t,this.height=e,this.renderer.setSize(t,e),this.composer&&(this.composer.setPixelRatio(this.pixelRatio),this.composer.setSize(t,e)),this.updateCameras()}updateCameras(){for(let t of this.views){let e=t.rect[2]*this.width/Math.max(1,t.rect[3]*this.height),i=xe.degToRad(t.hfov||100),n=xe.radToDeg(2*Math.atan(Math.tan(i/2)/e));n=xe.clamp(n,47,78),t.camera.fov=n,t.camera.aspect=e,t.camera.updateProjectionMatrix()}}renderViews(t){let e=this.renderer;e.setRenderTarget(t),e.setClearColor(0,1),e.clear(!0,!0,!1);let i=t?t.width:this.width*this.pixelRatio,n=t?t.height:this.height*this.pixelRatio,r=t?1:1/this.pixelRatio;for(let o of this.views){let a=Math.round(o.rect[0]*i),l=Math.round(o.rect[2]*i),c=Math.round(o.rect[3]*n),h=Math.round((1-o.rect[1]-o.rect[3])*n);t?(t.viewport.set(a,h,l,c),t.scissor.set(a,h,l,c),t.scissorTest=!0,e.setRenderTarget(t)):(e.setViewport(a*r,h*r,l*r,c*r),e.setScissor(a*r,h*r,l*r,c*r),e.setScissorTest(!0)),e.render(this.overrideScene||this.scene,o.camera)}t?(t.viewport.set(0,0,t.width,t.height),t.scissor.set(0,0,t.width,t.height),t.scissorTest=!1,e.setRenderTarget(t)):(e.setViewport(0,0,this.width,this.height),e.setScissorTest(!1))}render(){this.composer?this.composer.render():this.renderViews(null)}dispose(){window.removeEventListener("resize",this.onResize),this.composer&&this.composer.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}};function O0(s,t=!1){let e=s[0].index!==null,i=new Set(Object.keys(s[0].attributes)),n=new Set(Object.keys(s[0].morphAttributes)),r={},o={},a=s[0].morphTargetsRelative,l=new re,c=0;for(let h=0;h<s.length;++h){let u=s[h],d=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in u.attributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),d++}if(d!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in u.morphAttributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(t){let f;if(e)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(e){let h=0,u=[];for(let d=0;d<s.length;++d){let f=s[d].index;for(let g=0;g<f.count;++g)u.push(f.getX(g)+h);h+=s[d].attributes.position.count}l.setIndex(u)}for(let h in r){let u=B0(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in o){let u=o[h][0].length;if(u!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){let f=[];for(let v=0;v<o[h].length;++v)f.push(o[h][v][d]);let g=B0(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}}return l}function B0(s){let t,e,i,n=-1,r=0;for(let c=0;c<s.length;++c){let h=s[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(n===-1&&(n=h.gpuType),n!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}let o=new t(r),a=new ge(o,e,i),l=0;for(let c=0;c<s.length;++c){let h=s[c];if(h.isInterleavedBufferAttribute){let u=l/e;for(let d=0,f=h.count;d<f;d++)for(let g=0;g<e;g++){let v=h.getComponent(d,g);a.setComponent(d+u,g,v)}}else o.set(h.array,l);l+=h.count*e}return n!==void 0&&(a.gpuType=n),a}var{halfX:fu,halfZ:Pi,height:Lf,rampR:wi,goalHalfW:Ii,goalH:si,goalDepth:zi}=Ft,H0={night:{skyTop:132623,skyHorizon:1781594,skyBottom:263949,sunDir:[.25,.75,-.6],sunColor:10467583,sunGlow:0,stars:1,hemiSky:10467583,hemiGround:2042392,hemi:.75,key:15134463,keyI:2.4,keyDir:[.35,1,.25],fog:726320,fogDensity:.0011,envI:.75,exposure:1.05,winLit:.55,bldg:461330},sunset:{skyTop:2112120,skyHorizon:16754282,skyBottom:2759200,sunDir:[.78,.07,.62],sunColor:16756848,sunGlow:1,stars:0,hemiSky:16767416,hemiGround:2892055,hemi:.85,key:16760970,keyI:3.2,keyDir:[.75,.32,.58],fog:11565672,fogDensity:.0012,envI:.9,exposure:1,winLit:.3,bldg:1709600}};function z0(s){return new fe({side:_i,depthWrite:!1,fog:!1,uniforms:{uTop:{value:new St(s.skyTop)},uHorizon:{value:new St(s.skyHorizon)},uBottom:{value:new St(s.skyBottom)},uSunDir:{value:new T(...s.sunDir).normalize()},uSunColor:{value:new St(s.sunColor)},uSunGlow:{value:s.sunGlow},uStars:{value:s.stars}},vertexShader:`
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
      }`})}function k1(s){return new fe({uniforms:{uBase:{value:new St(s.bldg)},uWin:{value:new St(1,.82,.55)},uLit:{value:s.winLit},uFog:{value:new St(s.fog)},uFogD:{value:s.fogDensity*.55},uSunDir:{value:new T(...s.sunDir).normalize()},uSunColor:{value:new St(s.sunColor).multiplyScalar(s.sunGlow)}},vertexShader:`
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
      }`})}function un(s,t,{uLen:e=1e3,vOf:i=(o,a)=>a/1e3,skip:n=null,colorOf:r=null}={}){let o=s.concat([{...s[0],s:s.total}]),a=o.length,l=t.length,c=new Float32Array(a*l*3),h=new Float32Array(a*l*2),u=r?new Float32Array(a*l*3):null,d=new Float32Array(l),f=[];for(let p=0;p<a;p++){let m=o[p];for(let x=0;x<l;x++){let[M,y]=t[x],S=m.x+m.nx*M,b=m.z+m.nz*M;p>0&&(d[x]+=Math.hypot(S-f[x][0],b-f[x][1])),f[x]=[S,b];let A=p*l+x;if(c[A*3]=S,c[A*3+1]=y,c[A*3+2]=b,h[A*2]=d[x]/e,h[A*2+1]=i(x,y),u){let _=r(S,y,b);u[A*3]=_[0],u[A*3+1]=_[1],u[A*3+2]=_[2]}}}let g=[];for(let p=0;p<a-1;p++)for(let m=0;m<l-1;m++){if(n&&n(o[p],o[p+1],t[m],t[m+1]))continue;let x=p*l+m,M=(p+1)*l+m,y=(p+1)*l+m+1,S=p*l+m+1;g.push(x,S,M,M,S,y)}let v=new re;return v.setAttribute("position",new ge(c,3)),v.setAttribute("uv",new ge(h,2)),u&&v.setAttribute("color",new ge(u,3)),v.setIndex(g),v.computeVertexNormals(),v}var Df=s=>s.wall==="orange"||s.wall==="blue";function Vo(s,t=.5){return(e,i,n,r)=>Df(e)&&Df(i)&&Math.abs(e.x)<=Ii+t&&Math.abs(i.x)<=Ii+t&&Math.max(n[1],r[1])<=s+.5}function pu(s,t=1){let e=xe.smoothstep(s,-2500,2500),i=new St(Ie[0].main),n=new St(Ie[1].main),r=i.lerp(n,e);return[r.r*t,r.g*t,r.b*t]}function k0(s,t){let e=[];for(let a of s){let l=a.x+a.nx*t,c=a.z+a.nz*t;if(Df(a)){let h=a.wall==="orange"?1:-1,u=h>0?Ii:-Ii;if(Math.abs(a.x-u)<.5){e.push([l,c],[u,h*(Pi+zi)],[-u,h*(Pi+zi)]);continue}if(Math.abs(a.x)<Ii-.5)continue}e.push([l,c])}let i=new Kn(e.map(([a,l])=>new Q(a,-l))),n=new Ua(i);n.rotateX(-Math.PI/2);let r=n.attributes.position,o=n.attributes.uv;for(let a=0;a<r.count;a++)o.setXY(a,(r.getX(a)+ln.halfX)/(2*ln.halfX),(r.getZ(a)-ln.minZ)/(ln.maxZ-ln.minZ));return n}function V0(s,t,e){let i=H0[e.timeOfDay]||H0.night,n=e.quality,r=new Me,o=new Me;o.scale.setScalar(.01),r.add(o),t.add(r);let a=[],l=[new Gi(new T(1,0,0),0),new Gi(new T(-1,0,0),0),new Gi(new T(0,0,-1),0)],c=z=>(z.clippingPlanes=l,z.clipIntersection=!0,z);t.fog=new ga(i.fog,i.fogDensity*.35);let h=new ot(new ai(2500,48,24),z0(i));h.renderOrder=-10,h.frustumCulled=!1,r.add(h);let u=Ao(42),d=new De(1,1,1);d.translate(0,.5,0);let f=190,g=new xs(d,k1(i),f),v=new be;for(let z=0;z<f;z++){let W=u()*Math.PI*2,ut=170+u()*380+(u()<.3?250:0),bt=18+u()*40,Yt=18+u()*40,se=30+Math.pow(u(),2)*260+(ut>400?60:0);v.compose(new T(Math.cos(W)*ut,-5,Math.sin(W)*ut*1.2),new he().setFromAxisAngle(new T(0,1,0),u()*.6),new T(bt,se,Yt)),g.setMatrixAt(z,v)}r.add(g);let p=new ot(new In(1400,48),new qt({color:855826,roughness:1}));p.rotation.x=-Math.PI/2,p.position.y=-6,r.add(p);let m=new Oa(i.hemiSky,i.hemiGround,i.hemi);r.add(m);let x=new Va(i.key,i.keyI),M=new T(...i.keyDir).normalize();if(x.position.copy(M).multiplyScalar(90),x.target.position.set(0,0,0),r.add(x,x.target),n!=="low"){x.castShadow=!0;let z=n==="high"?2048:1024;x.shadow.mapSize.set(z,z);let W=x.shadow.camera;W.left=-60,W.right=60,W.top=70,W.bottom=-70,W.near=10,W.far=220,x.shadow.bias=-4e-4,x.shadow.normalBias=.02}let y=So(200,6),S=a0(n),b=l0(),A=b.clone();A.repeat.set(40,58),A.needsUpdate=!0;let _=k0(y,wi),R=new qt({map:S,roughness:.92,metalness:0,bumpMap:A,bumpScale:.6}),P=new ot(_,R);if(P.receiveShadow=!0,o.add(P),n==="high"){let z=b.clone();z.repeat.set(32,47),z.needsUpdate=!0;let W=5;for(let ut=1;ut<=W;ut++){let bt=new qt({map:S,alphaMap:z,alphaTest:.25+ut/W*.55,roughness:.95,color:new St().setScalar(.85+ut*.05)}),Yt=new ot(_,bt);Yt.position.y=ut*1.4,Yt.receiveShadow=!0,o.add(Yt)}}let I=[];for(let z=0;z<=10;z++){let W=Math.PI/2*(1-z/10);I.push([wi-wi*Math.cos(W),wi-wi*Math.sin(W)])}let N=new qt({color:1777703,roughness:.55,metalness:.35,vertexColors:!0,side:oe}),B=new ot(un(y,I,{uLen:400,skip:Vo(si),colorOf:(z,W,ut)=>{let bt=pu(ut,.35);return[.55+bt[0],.55+bt[1],.55+bt[2]]}}),N);B.receiveShadow=!0,o.add(B);let L=[[0,wi-4],[0,wi+14]],O=new ot(un(y,L,{skip:Vo(si),colorOf:(z,W,ut)=>pu(ut,4)}),new ve({vertexColors:!0,side:oe,fog:!1}));o.add(O);let q=gf(),Y=wi+230,rt=new ot(un(y,[[0,wi+14],[0,Y]],{uLen:4200,vOf:z=>z,skip:Vo(si)}),new qt({color:1118481,emissive:16777215,emissiveMap:q,emissiveIntensity:1.1,map:q,roughness:.4,side:oe}));o.add(rt),a.push(z=>{q.offset.x=(q.offset.x+z*.012)%1});let Z=mf(3),tt=[[0,Y],[0,si],[0,1100],[0,Lf-wi]];for(let z=1;z<=8;z++){let W=Math.PI/2*(z/8);tt.push([wi-wi*Math.cos(W),Lf-wi+wi*Math.sin(W)])}let nt=new qt({color:8365784,emissive:10275071,emissiveMap:Z,emissiveIntensity:.16,alphaMap:Z,transparent:!0,opacity:.32,depthWrite:!1,roughness:.1,metalness:.2,side:oe});Z.repeat.set(1,1);let Lt=new ot(un(y,tt,{uLen:900,vOf:(z,W)=>W/1040,skip:Vo(si)}),nt);Lt.renderOrder=2,o.add(Lt);let Pt=new ot(Lt.geometry,new ve({color:4880568,transparent:!0,opacity:.045,depthWrite:!1,side:oe}));Pt.renderOrder=1,o.add(Pt);let ce=k0(y.map(z=>({...z,wall:"side"})),wi);ce.translate(0,Lf,0);let ae=ce.attributes.uv;for(let z=0;z<ae.count;z++)ae.setXY(z,ce.attributes.position.getX(z)/900,ce.attributes.position.getZ(z)/1040);let le=new ot(ce,nt.clone());le.material.opacity=.07,le.material.emissiveIntensity=.05,le.renderOrder=2,o.add(le);let X=[];for(let z of[1,-1])for(let W of[1,-1]){let ut=W*Ii,bt=[ut,0,z*Pi];for(let Yt=0;Yt<I.length-1;Yt++){let[se,Ot]=I[Yt],[Pe,Ae]=I[Yt+1];X.push(...bt,ut,Ot,z*(Pi-se),ut,Ae,z*(Pi-Pe))}}let j=new re;j.setAttribute("position",new $t(X,3)),j.computeVertexNormals(),o.add(new ot(j,new qt({color:2764856,roughness:.6,metalness:.3,side:oe})));let vt=[],Wt=[];for(let z of[0,1]){let W=z===0?-1:1,ut=Ie[z],bt=new Me,Yt=mf(4,256);Yt.repeat.set(zi/300,si/300);let se=new qt({color:658448,emissive:ut.main,emissiveMap:Yt,emissiveIntensity:1.4,roughness:.6,metalness:.2,side:oe}),Ot=Yt.clone();Ot.repeat.set(2*Ii/300,si/300),Ot.needsUpdate=!0;let Pe=se.clone();Pe.emissiveMap=Ot;let Ae=new ot(new oi(zi,si),se);Ae.rotation.y=Math.PI/2,Ae.position.set(Ii,si/2,W*(Pi+zi/2));let Be=Ae.clone();Be.position.x=-Ii;let Ze=new ot(new oi(2*Ii,si),Pe);Ze.position.set(0,si/2,0);let yi=new Me;yi.position.set(0,0,W*(Pi+zi)),yi.add(Ze);let $i=Yt.clone();$i.repeat.set(2*Ii/300,zi/300),$i.needsUpdate=!0;let En=se.clone();En.emissiveMap=$i,En.emissiveIntensity=.8;let ls=new ot(new oi(2*Ii,zi),En);ls.rotation.x=Math.PI/2,ls.position.set(0,si,W*(Pi+zi/2)),bt.add(Ae,Be,yi,ls),Wt.push({hinge:yi,s:W});let Hn=new qt({color:2236962,emissive:ut.main,emissiveIntensity:4.5,roughness:.3,metalness:.6}),tn=new qt({color:2764083,emissive:ut.main,emissiveIntensity:1.2,roughness:.4,metalness:.7}),cs=new De(46,si+46,46);for(let Xo of[-1,1]){let El=new ot(cs,Hn);El.position.set(Xo*(Ii+23),(si+46)/2,W*(Pi+23)),bt.add(El);let Yo=new ot(new De(36,si,36),tn);Yo.position.set(Xo*(Ii+18),si/2,W*(Pi+zi)),bt.add(Yo);let w=new ot(new De(30,30,zi),tn);w.position.set(Xo*(Ii+15),si+15,W*(Pi+zi/2)),bt.add(w)}let Go=new ot(new De(2*Ii+92,46,46),Hn);Go.position.set(0,si+23,W*(Pi+23));let Wo=new ot(new De(2*Ii+72,30,30),tn);Wo.position.set(0,si+15,W*(Pi+zi)),bt.add(Go,Wo);let Sl=new ot(new De(2*Ii+500,70,80),tn);Sl.position.set(0,si+260,W*(Pi+60)),bt.add(Sl),o.add(bt);let qo=new ka(ut.main,0,40,2);qo.position.set(0,3.5,W*(Pi+zi*.6)*.01),r.add(qo),vt.push({light:qo,frameMat:Hn,netMat:[se,Pe,En],base:4.5})}let Et=c0(),Zt=c(new qt({map:Et,roughness:.95,emissive:16777215,emissiveMap:Et,emissiveIntensity:.07,side:oe})),ye=c(new qt({color:1382430,roughness:.8,metalness:.3,side:oe})),st=[[-60,720],[-1200,1240],[-2300,1760],[-3300,2300]],ct=[[-3300,2780],[-4200,3250],[-5100,3720],[-5900,4150]],dt=z=>{let W=0,ut=[0];for(let bt=1;bt<z.length;bt++)W+=Math.hypot(z[bt][0]-z[bt-1][0],z[bt][1]-z[bt-1][1]),ut.push(W);return bt=>ut[bt]/900};o.add(new ot(un(y,st,{uLen:3400,vOf:dt(st)}),Zt)),o.add(new ot(un(y,ct,{uLen:3400,vOf:dt(ct)}),Zt));let ft=new ot(un(y,[[-60,0],[-60,si+40],[-60,720]],{uLen:4200,vOf:z=>z===0?0:z===1?.5:1,skip:Vo(si+40,60)}),ye);o.add(ft);let mt=gf(),Jt=new ot(un(y,[[-3300,2300],[-3300,2780]],{uLen:5200,vOf:z=>z}),c(new qt({color:328965,emissive:16777215,emissiveMap:mt,emissiveIntensity:1.6,side:oe})));o.add(Jt),a.push(z=>{mt.offset.x=(mt.offset.x-z*.02)%1}),o.add(new ot(un(y,[[-5900,4150],[-5900,4650]],{uLen:2e3}),ye));let Xt=c(new ve({vertexColors:!0,fog:!1,side:oe}));o.add(new ot(un(y,[[-5900,4650],[-5900,4700]],{colorOf:(z,W,ut)=>pu(ut,2.2)}),Xt));let Qt=c(new qt({color:921620,roughness:.8,metalness:.4,side:oe}));o.add(new ot(un(y,[[-6500,5350],[-4200,5220],[-1900,5120]],{uLen:2e3}),Qt)),o.add(new ot(un(y,[[-1900,5120],[-1900,5020]],{uLen:2e3}),ye));let ee=new qt({color:1711394,roughness:.6,metalness:.7}),D=c(new ve({color:new St(4.2,4.2,4),fog:!1})),we=[-3700,-1250,1250,3700],me=new De(150,14,60),C=we.length*30+160,E=new xs(me,D,C),H=0;for(let z of we){let W=new ot(new De(2*fu+4400,200,140),ee);W.position.set(0,5560,z),o.add(W);let ut=new ot(new De(2*fu+4400,60,60),ee);ut.position.set(0,5180,z),o.add(ut);for(let bt=0;bt<30;bt++){let Yt=-fu-1300+bt*(2*fu+2600)/29;v.makeTranslation(Yt,5140,z),E.setMatrixAt(H++,v)}}let G=So(420,3);for(let z of G){if(H>=C)break;let W=z.x-z.nx*1950,ut=z.z-z.nz*1950;v.makeRotationY(Math.atan2(z.nx,z.nz)),v.setPosition(W,5010,ut),E.setMatrixAt(H++,v)}E.count=H,o.add(E);let J=[];{let z=new qt({color:1316636,roughness:.5,metalness:.8});for(let W of[1,-1]){let ut=document.createElement("canvas");ut.width=1024,ut.height=480;let bt=new ri(ut);bt.colorSpace=ze;let Yt=new Me,se=3600,Ot=1690,Pe=new ot(new oi(se,Ot),new ve({map:bt,color:new St(1.5,1.5,1.5),fog:!1})),Ae=new ot(new De(se+160,Ot+160,120),z);Ae.position.z=-70,Yt.add(Ae,Pe);for(let Be of[-1,1]){let Ze=new ot(new De(120,2e3,120),z);Ze.position.set(Be*se*.35,-Ot/2-1e3,-60),Yt.add(Ze)}Yt.position.set(0,4300,W*(Pi+4e3)),Yt.rotation.order="YXZ",Yt.rotation.y=W>0?Math.PI:0,Yt.rotation.x=.12,o.add(Yt),J.push({c:ut,tex:bt,ctx:ut.getContext("2d"),group:Yt,end:W})}}let pt="";function gt(z,W,ut,bt){let Yt=`${z}|${W}|${ut}|${bt}`;if(Yt!==pt){pt=Yt;for(let se of J){let Ot=se.ctx,Pe=se.c.width,Ae=se.c.height,Be=Ot.createLinearGradient(0,0,0,Ae);Be.addColorStop(0,"#0a1430"),Be.addColorStop(1,"#03060f"),Ot.fillStyle=Be,Ot.fillRect(0,0,Pe,Ae),Ot.textAlign="center",Ot.textBaseline="middle",bt?(Ot.fillStyle=bt==="blue"?"#2f7bff":"#ff7a1a",Ot.fillRect(0,0,Pe,Ae),Ot.fillStyle="#fff",Ot.font="italic 900 220px Arial Black, Arial, sans-serif",Ot.fillText("GOAL!!",Pe/2,Ae/2+10)):(Ot.fillStyle="#9fc4ff",Ot.font="bold 44px Arial, sans-serif",Ot.fillText("ROCKET ARENA",Pe/2,52),Ot.fillStyle="#1f5fe0",Ot.fillRect(70,110,330,250),Ot.fillStyle="#e8621a",Ot.fillRect(Pe-400,110,330,250),Ot.fillStyle="#fff",Ot.font="italic 900 190px Arial Black, Arial, sans-serif",Ot.fillText(String(z),235,245),Ot.fillText(String(W),Pe-235,245),Ot.font="bold 40px Arial, sans-serif",Ot.fillText("BLUE",235,400),Ot.fillText("ORANGE",Pe-235,400),Ot.font="bold 110px Arial, sans-serif",Ot.fillText(ut,Pe/2,245)),Ot.fillStyle="rgba(0,0,0,0.18)";for(let Ze=0;Ze<Ae;Ze+=4)Ot.fillRect(0,Ze,Pe,1);se.tex.needsUpdate=!0}}}gt(0,0,"5:00",null);let K={value:0};{let z=[["#1f5fe0","#ffffff","#e8621a"],["#c8102e","#ffffff","#003da5"],["#009246","#ffffff","#ce2b37"],["#000000","#dd0000","#ffce00"],["#ff7a1a","#ffffff","#2f7bff"],["#0055a4","#ffffff","#ef4135"],["#ffcc00","#00843d","#00843d"],["#2f7bff","#2f7bff","#ffffff"]],bt=c(new qt({color:10133930,metalness:.9,roughness:.3})),Yt=So(1100,2),se=new Qe(9,9,520,6),Ot=new xs(se,bt,Yt.length),Pe=z.map(()=>[]);Yt.forEach((Ae,Be)=>{let Ze=Ae.x-Ae.nx*5950,yi=Ae.z-Ae.nz*5950;v.makeTranslation(Ze,4910,yi),Ot.setMatrixAt(Be,v);let $i=new oi(300,190,8,1);$i.translate(300/2,0,0),$i.rotateY(Math.atan2(Ae.nx,Ae.nz)),$i.translate(Ze,5070,yi),Pe[Be%z.length].push($i)}),o.add(Ot),z.forEach((Ae,Be)=>{if(!Pe[Be].length)return;let Ze=document.createElement("canvas");Ze.width=96,Ze.height=64;let yi=Ze.getContext("2d"),$i=Be%2===0;Ae.forEach((tn,cs)=>{yi.fillStyle=tn,$i?yi.fillRect(cs*32,0,32,64):yi.fillRect(0,cs*21.4,96,21.4)});let En=new ri(Ze);En.colorSpace=ze;let ls=c(new qt({map:En,side:oe,roughness:.9,emissive:16777215,emissiveMap:En,emissiveIntensity:.15}));ls.onBeforeCompile=tn=>{tn.uniforms.uTime=K,tn.vertexShader=`uniform float uTime;
`+tn.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
          float wave = sin(uTime * 3.0 + position.x * 0.01 + position.z * 0.01 + uv.x * 5.0) * 45.0 * uv.x;
          transformed.y += wave * 0.6;
          transformed.x += wave * 0.4;
          transformed.z += wave * 0.4;`)};let Hn=O0(Pe[Be]);o.add(new ot(Hn,ls))})}if(a.push(z=>{K.value+=z}),i.stars){let z=document.createElement("canvas");z.width=4,z.height=256;let W=z.getContext("2d"),ut=W.createLinearGradient(0,0,0,256);ut.addColorStop(0,"rgba(255,255,255,0)"),ut.addColorStop(.7,"rgba(255,255,255,0.35)"),ut.addColorStop(1,"rgba(255,255,255,1)"),W.fillStyle=ut,W.fillRect(0,0,4,256);let bt=new ri(z),Yt=new Qe(9,.8,420,24,1,!0);Yt.translate(0,210,0);let se=new ve({map:bt,color:9418495,transparent:!0,opacity:.07,blending:Te,depthWrite:!1,side:oe,fog:!1}),Ot=[];for(let Ae=0;Ae<6;Ae++){let Be=Ae/6*Math.PI*2+.3,Ze=new ot(Yt,se);Ze.position.set(Math.cos(Be)*125,5,Math.sin(Be)*150),Ze.renderOrder=3,r.add(Ze),Ot.push({beam:Ze,a:Be,phase:Ae*1.7})}let Pe=0;a.push(Ae=>{Pe+=Ae;for(let Be of Ot)Be.beam.rotation.set(0,0,0),Be.beam.rotateY(Be.a+Math.sin(Pe*.25+Be.phase)*.6),Be.beam.rotateZ(-.55-Math.sin(Pe*.31+Be.phase)*.2)})}{let z=document.createElement("canvas");z.width=256,z.height=64;let W=z.getContext("2d");W.fillStyle="#fff";for(let se=0;se<3;se++){let Ot=30+se*70;W.beginPath(),W.moveTo(Ot,8),W.lineTo(Ot+34,32),W.lineTo(Ot,56),W.lineTo(Ot+18,56),W.lineTo(Ot+52,32),W.lineTo(Ot+18,8),W.closePath(),W.fill()}let ut=new ri(z);ut.wrapS=Ji;let bt=[];for(let se=0;se<=3;se++){let Ot=.42*(1-se/3);bt.push([wi-(wi-3)*Math.cos(Ot),wi-(wi-3)*Math.sin(Ot)])}let Yt=new ot(un(y,bt,{uLen:500,vOf:se=>se/3,skip:Vo(si),colorOf:(se,Ot,Pe)=>pu(Pe,2.2)}),new ve({map:ut,vertexColors:!0,transparent:!0,blending:Te,depthWrite:!1,side:oe,fog:!1}));Yt.renderOrder=2,o.add(Yt),a.push(se=>{ut.offset.x=(ut.offset.x-se*.25)%1})}let it={0:[],1:[]};for(let z of[0,1]){let W=z===0?-1:1;for(let ut of[-2700,-1500,1500,2700])it[z].push(new T(ut,520,W*(Pi-30)))}let xt=[],kt=new qt({color:2764598,roughness:.4,metalness:.7}),Tt=new Qe(70,80,6,32),Mt=new Qe(150,175,14,40),Vt=new qi(64,7,8,40),Kt=new qi(140,10,8,48),ne=new ai(52,24,16),F=new Qe(70,150,260,32,1,!0);for(let z of e.pads){let W=new Me;W.position.set(z.x,0,z.z);let ut=new qt({color:3348992,emissive:16753183,emissiveIntensity:z.big?2.6:1.4});if(ut.userData.base=z.big?2.6:1.4,z.big){let bt=new ot(Mt,kt);bt.position.y=4;let Yt=new ot(Kt,ut);Yt.rotation.x=Math.PI/2,Yt.position.y=12;let se=new ot(ne,new qt({color:16752672,emissive:16747536,emissiveIntensity:3.5,roughness:.2}));se.position.y=110;let Ot=new ot(F,new ve({color:16751152,transparent:!0,opacity:.13,blending:Te,depthWrite:!1,side:oe}));Ot.position.y=135,W.add(bt,Yt,se,Ot),xt.push({pad:z,grp:W,ring:Yt,orb:se,cone:Ot,glowMat:ut})}else{let bt=new ot(Tt,kt);bt.position.y=2;let Yt=new ot(Vt,ut);Yt.rotation.x=Math.PI/2,Yt.position.y=6;let se=new ot(new In(40,24),ut);se.rotation.x=-Math.PI/2,se.position.y=6,W.add(bt,Yt,se),xt.push({pad:z,grp:W,ring:Yt,glowMat:ut})}o.add(W)}let yt=new Yn;yt.add(new ot(new ai(100,32,16),z0(i)));let et=new ve({color:new St(12,12,11)});for(let z=0;z<10;z++){let W=z/10*Math.PI*2,ut=new ot(new De(14,2,4),et);ut.position.set(Math.cos(W)*30,30,Math.sin(W)*36),ut.lookAt(0,0,0),yt.add(ut)}let _t=new ot(new oi(200,200),new ve({color:1915416}));_t.rotation.x=-Math.PI/2,_t.position.y=-2,yt.add(_t);let At=new xo(s),at=At.fromScene(yt,.03).texture;At.dispose(),t.environment=at,t.environmentIntensity=i.envI;let Bt=0,Ut=0;return a.push(z=>{Ut+=z,Bt=Math.max(0,Bt-z*.18),Et.offset.y=Bt>0?Math.abs(Math.sin(Ut*14))*.012*Math.min(1,Bt*2):0;for(let W of xt){let ut=W.pad.active;W.orb&&(W.orb.visible=ut,W.cone.visible=ut,W.orb.position.y=110+Math.sin(Ut*2.2+W.pad.x)*12,W.orb.rotation.y+=z);let bt=W.glowMat.userData.base;W.glowMat.emissiveIntensity=ut?bt*(1+Math.sin(Ut*4+W.pad.z)*.18):.12}for(let W of vt)W.light.intensity=Math.max(0,W.light.intensity-z*900),W.frameMat.emissiveIntensity+=(W.base-W.frameMat.emissiveIntensity)*Math.min(1,z*1.5)}),{root:r,exposure:i.exposure,bindPads(z){xt.forEach((W,ut)=>{z[ut]&&(W.pad=z[ut])})},dispose(){t.remove(r);let z=new Set;r.traverse(W=>{W.geometry&&!z.has(W.geometry)&&(z.add(W.geometry),W.geometry.dispose());let ut=W.material?Array.isArray(W.material)?W.material:[W.material]:[];for(let bt of ut)if(!z.has(bt)){z.add(bt);for(let Yt in bt)bt[Yt]&&bt[Yt].isTexture&&!z.has(bt[Yt])&&(z.add(bt[Yt]),bt[Yt].dispose());bt.dispose()}}),at.dispose(),t.environment=null,t.fog=null},update(z){for(let W of a)W(z)},cheer(z=1){Bt=Math.max(Bt,z)},pyroPoints:it,setScreens(z,W,ut,bt){gt(z,W,ut,bt)},goalFlash(z){let W=vt[z];W.light.intensity=2500,W.frameMat.emissiveIntensity=14},cine:{arena:o,buildings:g,ground:p,standEdge:[[zi,1094],[1200,1240],[2300,1760],[3300,2300],[3300,2780],[4200,3250],[5100,3720],[5900,4150],[5900,4700]],roofEdge:[[1900,5020],[1900,5120],[4200,5220],[6500,5350]],setGoalFlap(z,W){let ut=Wt[z];ut.hinge.rotation.x=ut.s*W},setCut(z,W){let ut=z===0?-1:1,bt=Math.max(0,W)*.01;l[0].constant=-bt,l[1].constant=-bt,l[2].normal.set(0,0,-ut),l[2].constant=(Pi+zi-20)*.01},screenFor(z){let W=z===0?-1:1;return J.find(ut=>ut.end===W).group},reset(){for(let z of Wt)z.hinge.rotation.x=0;l[0].constant=0,l[1].constant=0;for(let z of J)z.group.visible=!0;o.position.set(0,0,0),o.quaternion.identity(),o.scale.setScalar(.01),o.visible=!0,p.visible=!0}}}}var W0="rocketArena.settings.v1";function V1(){let s=navigator.userAgent||"";return/Xbox/i.test(s)?"medium":/Android|iPhone|iPad|Mobile/i.test(s)?"low":"high"}function G1(){let s={quality:V1(),volume:.7,rumble:!0,ballCam:!0,fov:100,replays:!0,showFps:!1,timeOfDay:"night",split:"horizontal",duration:300,difficulty:"pro",teamSize_solo:1,teamSize_versus:1,teamSize_coop:2,handling:"easy",gameMode:"soccar",items:"all",victoryFx:!0};try{let t=JSON.parse(localStorage.getItem(W0)||"{}");return{...s,...t}}catch{return s}}var Nf=class{constructor(){this.settings=G1();let t=new URLSearchParams(location.search);t.get("quality")&&(this.settings.quality=t.get("quality")),this.input=new wl,this.audio=new Al,this.audio.volume=this.settings.volume,this.input.onActivity=()=>this.audio.resume();let e=this.input.rumble.bind(this.input);this.input.rumble=(...i)=>{this.settings.rumble&&e(...i)},this.input.onPadConnect=(i,n)=>this.toast(n?"\u{1F3AE} Controller connected":"Controller disconnected"),this.hud=new Dh(document.getElementById("hud")),this.hud.show(!1),this.menu=new Uh(this,document.getElementById("menu")),this.container=document.getElementById("game"),this.paused=!1,this.match=null,this.buildGraphics(),this.startAttract(),this.last=performance.now(),this.fpsT=0,this.fpsN=0,document.getElementById("loading")?.remove(),requestAnimationFrame(i=>this.loop(i)),window.__app=this}buildGraphics(){this.gfx&&this.gfx.dispose(),this.gfx=new du(this.container,this.settings.quality),this.builtQuality=this.settings.quality,this.buildStadium()}buildStadium(){this.stadium&&this.stadium.dispose();let t=Ih.map(([e,i])=>({x:e,z:i,big:!0,active:!0})).concat(Lh.map(([e,i])=>({x:e,z:i,big:!1,active:!0})));this.stadium=V0(this.gfx.renderer,this.gfx.scene,{quality:this.settings.quality,timeOfDay:this.settings.timeOfDay,pads:t}),this.gfx.setExposure(this.stadium.exposure),this.builtTime=this.settings.timeOfDay}saveSettings(){try{localStorage.setItem(W0,JSON.stringify(this.settings))}catch{}}applySettings(){this.saveSettings(),this.audio.setVolume(this.settings.volume),this.settings.quality!==this.builtQuality&&(this.disposeMatch(),this.buildGraphics(),this.startAttract(!1))}ensureStadium(){this.settings.timeOfDay!==this.builtTime&&this.buildStadium()}disposeMatch(){this.match&&this.match.dispose(),this.match=null}startAttract(t=!0){this.disposeMatch(),this.paused=!1,this.hud.show(!1),this.attractCount=(this.attractCount||0)+1;let e=this.attractCount%2===0?"rumble":"soccar";this.match=new _l(this,{mode:"attract",gameMode:e,items:"all",teamSize:2,duration:0,difficulty:"pro",humans:[]}),this.stadium.bindPads(this.match.world.pads),t&&this.menu.show("main")}startMatch(t){this.audio.resume(),this.lastCfg=t,this.disposeMatch(),this.ensureStadium(),this.menu.hide(),this.paused=!1,this.match=new _l(this,t),this.stadium.bindPads(this.match.world.pads)}restartMatch(){this.lastCfg&&this.startMatch(this.lastCfg)}pauseMatch(){this.paused||(this.paused=!0,this.menu.show("pause"))}resume(){if(this.paused=!1,this.menu.hide(),this.resumeFrame=this.frames,this.match){this.match.acc=0;for(let t of this.match.humans)t.car.prevJump=!0}}quitToMenu(){this.startAttract(!0)}showResults(t){this.menu.show("results",t)}toggleFullscreen(){q0()}toast(t){let e=document.createElement("div");e.className="toast",e.textContent=t,document.body.appendChild(e),setTimeout(()=>e.classList.add("out"),2200),setTimeout(()=>e.remove(),2800)}loop(t){requestAnimationFrame(n=>this.loop(n));let e=Math.min(.1,Math.max(0,(t-this.last)/1e3));this.last=t,this.input.update();let i=this.input.menu();if(this.menu.visible&&this.menu.update(i),this.match)if(this.paused){for(let n of this.match.engines)this.audio.updateEngine(n,0,0,!1,!1,!1);this.match.renderPaused()}else this.match.update(e);if(this.fpsT+=e,this.fpsN++,this.fpsT>.5){let n=this.fpsN/this.fpsT;this.hud.setFps(this.settings.showFps?`${Math.round(n)} FPS`:"");let r=this.match&&!this.match.attract&&!this.paused;this.slowT=r&&n<32&&this.settings.quality!=="low"?(this.slowT||0)+this.fpsT:0,this.slowT>6&&!this.slowHinted&&(this.slowHinted=!0,this.toast("Running slowly? Lower Graphics in Settings for a smoother game")),this.fpsT=0,this.fpsN=0}this.input.endFrame(),this.frames=(this.frames||0)+1}};function W1(){try{history.pushState({game:1},""),window.addEventListener("popstate",()=>history.pushState({game:1},""))}catch{}}function q0(){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen({navigationUI:"hide"}).catch(()=>{})}catch{}}function G0(){W1(),window.addEventListener("keydown",s=>{s.code==="KeyF"&&!s.repeat&&window.__app&&window.__app.menu.visible&&q0()});try{new Nf}catch(s){console.error(s);let t=document.getElementById("loading");t&&(t.innerHTML=`<div class="err">Could not start the game: ${s.message}<br>Your browser needs WebGL 2 support.</div>`)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",G0):G0();})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
