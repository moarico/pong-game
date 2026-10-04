(()=>{var $o=["a","b","x","y","lb","rb","lt","rt","view","menu","ls","rs","up","down","left","right","guide"],Z0={solo:{up:["KeyW","ArrowUp"],down:["KeyS","ArrowDown"],left:["KeyA","ArrowLeft"],right:["KeyD","ArrowRight"],jump:["Space","KeyK"],boost:["ShiftLeft","ShiftRight","KeyL"],slide:["ControlLeft","KeyC","KeyJ"],rollL:["KeyQ","KeyU"],rollR:["KeyE","KeyO"],cam:["KeyR","KeyI"],pause:["Escape","KeyP"],item:["KeyF","KeyH"],mouse:{boost:0,jump:2,cam:1}},p1:{up:["KeyW"],down:["KeyS"],left:["KeyA"],right:["KeyD"],jump:["Space"],boost:["ShiftLeft"],slide:["ControlLeft","KeyC"],rollL:["KeyQ"],rollR:["KeyE"],cam:["KeyR"],pause:["Escape"],item:["KeyF"],mouse:{boost:0,jump:2,cam:1}},p2:{up:["ArrowUp"],down:["ArrowDown"],left:["ArrowLeft"],right:["ArrowRight"],jump:["KeyK","Numpad0"],boost:["KeyL","NumpadDecimal"],slide:["KeyJ","Numpad1"],rollL:["KeyU"],rollR:["KeyO"],cam:["KeyI","Numpad2"],pause:["KeyP"],item:["KeyH","Numpad3"]}},$0=new Set(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab","ShiftLeft","ShiftRight","ControlLeft"]);function Al(s,t,e=.16){let i=Math.hypot(s,t);if(i<e)return[0,0];let n=Math.min(1,(i-e)/(1-e))/i;return[s*n,t*n]}var xu=class{constructor(t){this.index=t,this.id="",this.connected=!1,this.b={},this.prev={};for(let e of $o)this.b[e]=0,this.prev[e]=0;this.lx=0,this.ly=0,this.rx=0,this.ry=0,this.triggerSeenNeg=[!1,!1],this.navRepeat={dir:"",t:0},this.raw=null}pressed(t){return this.b[t]>.5&&this.prev[t]<=.5}down(t){return this.b[t]>.5}},Rl=class{constructor(){this.keys=new Set,this.keysPressed=new Set,this.mouse=new Set,this.mousePressed=new Set,this.gamepadBlocked=!1,this.rbIsItem=!1,this.pads=[],this.onActivity=null,this.onPadConnect=null,this.kbNav={dir:"",t:0},this.lastFrame=performance.now();try{navigator.gamepadInputEmulation="gamepad"}catch{}window.addEventListener("keydown",t=>{$0.has(t.code)&&!(t.target&&t.target.tagName==="INPUT")&&t.preventDefault(),t.repeat||this.keysPressed.add(t.code),this.keys.add(t.code),this.onActivity&&this.onActivity()}),window.addEventListener("keyup",t=>{this.keys.delete(t.code)}),window.addEventListener("blur",()=>{this.keys.clear(),this.mouse.clear()}),window.addEventListener("pointerdown",()=>{this.onActivity&&this.onActivity()}),window.addEventListener("mousedown",t=>{this.mouse.has(t.button)||this.mousePressed.add(t.button),this.mouse.add(t.button),t.button===1&&t.preventDefault()}),window.addEventListener("mouseup",t=>{this.mouse.delete(t.button)}),window.addEventListener("mousemove",t=>{t.buttons&1||this.mouse.delete(0),t.buttons&2||this.mouse.delete(2),t.buttons&4||this.mouse.delete(1)}),window.addEventListener("contextmenu",t=>t.preventDefault()),window.addEventListener("gamepadconnected",t=>{this.onPadConnect&&this.onPadConnect(t.gamepad,!0)}),window.addEventListener("gamepaddisconnected",t=>{let e=this.pads[t.gamepad.index];e&&(e.connected=!1),this.onPadConnect&&this.onPadConnect(t.gamepad,!1)})}update(){let t=performance.now();this.dt=Math.min(.1,(t-this.lastFrame)/1e3),this.lastFrame=t;let e=[];try{e=navigator.getGamepads?navigator.getGamepads():[]}catch{e=[],this.gamepadBlocked=!0}for(let i of this.pads)i&&(i.connected=!1);for(let i=0;i<e.length;i++){let n=e[i];if(!n||!n.connected)continue;let r=this.pads[n.index]||(this.pads[n.index]=new xu(n.index));r.connected=!0,r.id=n.id,r.raw=n;for(let o of $o)r.prev[o]=r.b[o];if(this.readPad(r,n),this.onActivity){for(let o of $o)if(r.pressed(o)){this.onActivity();break}}}}readPad(t,e){let i=r=>e.buttons[r]?typeof e.buttons[r]=="object"?e.buttons[r].value||(e.buttons[r].pressed?1:0):e.buttons[r]:0,n=r=>e.axes[r]!==void 0?e.axes[r]:0;if(e.mapping==="standard"||e.axes.length<6)$o.forEach((r,o)=>{t.b[r]=i(o)}),[t.lx,t.ly]=Al(n(0),n(1)),[t.rx,t.ry]=Al(n(2),n(3));else{let r={a:0,b:1,x:2,y:3,lb:4,rb:5,view:6,menu:7,guide:8,ls:9,rs:10};for(let a of $o)t.b[a]=0;for(let a in r)t.b[a]=i(r[a]);let o=(a,l)=>{let c=n(a);return c<-.5&&(t.triggerSeenNeg[l]=!0),t.triggerSeenNeg[l]?(c+1)/2:Math.max(0,c)};t.b.lt=o(2,0),t.b.rt=o(5,1),t.b.left=n(6)<-.5?1:0,t.b.right=n(6)>.5?1:0,t.b.up=n(7)<-.5?1:0,t.b.down=n(7)>.5?1:0,[t.lx,t.ly]=Al(n(0),n(1)),[t.rx,t.ry]=Al(n(3),n(4))}}endFrame(){this.keysPressed.clear(),this.mousePressed.clear()}connectedPads(){return this.pads.filter(t=>t&&t.connected)}anyKey(t){for(let e of t)if(this.keys.has(e))return!0;return!1}anyKeyPressed(t){for(let e of t)if(this.keysPressed.has(e))return!0;return!1}keyboardControls(t){let e=Z0[t],i=e.mouse,n=this.anyKey(e.up)?1:0,r=this.anyKey(e.down)?1:0,o=this.anyKey(e.left)?1:0,a=this.anyKey(e.right)?1:0,l=h=>!!i&&this.mouse.has(i[h]),c=h=>!!i&&this.mousePressed.has(i[h]);return{throttle:n-r,steer:a-o,pitch:r-n,yaw:a-o,roll:(this.anyKey(e.rollR)?1:0)-(this.anyKey(e.rollL)?1:0),jump:this.anyKey(e.jump)||l("jump"),boost:this.anyKey(e.boost)||l("boost"),powerslide:this.anyKey(e.slide),ballCam:this.anyKeyPressed(e.cam)||c("cam"),pause:this.anyKeyPressed(e.pause),lookX:0,lookY:0,skip:this.anyKeyPressed(e.jump)||c("jump"),itemDown:this.anyKey(e.item),digitalSteer:!0}}padControls(t){let e=t.b.right-t.b.left,i=t.b.down-t.b.up,n=Math.abs(t.lx)>Math.abs(e)?t.lx:e,r=Math.abs(t.ly)>Math.abs(i)?t.ly:i;return{throttle:t.b.rt-t.b.lt,steer:n,pitch:r,yaw:n,roll:(this.rbIsItem?0:t.b.rb)-t.b.lb,itemDown:this.rbIsItem&&t.down("rb"),jump:t.down("a"),boost:t.down("b"),powerslide:t.down("x"),ballCam:t.pressed("y"),pause:t.pressed("menu"),lookX:t.rx,lookY:t.ry,skip:t.pressed("a"),digitalSteer:Math.abs(t.lx)<.01&&Math.abs(e)>0}}controls(t){if(t.type==="kb")return this.keyboardControls(t.layout);if(t.type==="pad"){let i=this.pads[t.index];return!i||!i.connected?J0():this.padControls(i)}let e=this.keyboardControls("solo");for(let i of this.connectedPads()){let n=this.padControls(i);for(let r in n)r!=="digitalSteer"&&(typeof n[r]=="boolean"?e[r]=e[r]||n[r]:Math.abs(n[r])>Math.abs(e[r])&&(e[r]=n[r],r==="steer"&&(e.digitalSteer=n.digitalSteer)))}return e}menu(){let t={up:!1,down:!1,left:!1,right:!1,confirm:!1,back:!1,start:!1,source:null},e=i=>this.anyKeyPressed(i);e(["ArrowUp","KeyW"])&&(t.up=!0),e(["ArrowDown","KeyS"])&&(t.down=!0),e(["ArrowLeft","KeyA"])&&(t.left=!0),e(["ArrowRight","KeyD"])&&(t.right=!0),e(["Enter","NumpadEnter","Space"])&&(t.confirm=!0,t.source={type:"kb"}),e(["Escape","Backspace"])&&(t.back=!0);for(let i of this.connectedPads()){i.pressed("up")&&(t.up=!0),i.pressed("down")&&(t.down=!0),i.pressed("left")&&(t.left=!0),i.pressed("right")&&(t.right=!0),i.pressed("a")&&(t.confirm=!0,t.source={type:"pad",index:i.index}),i.pressed("b")&&(t.back=!0),i.pressed("menu")&&(t.start=!0);let n="";i.ly<-.6?n="up":i.ly>.6?n="down":i.lx<-.6?n="left":i.lx>.6&&(n="right");let r=i.navRepeat;n&&n!==r.dir?(t[n]=!0,r.t=.38):n&&(r.t-=this.dt||.016,r.t<=0&&(t[n]=!0,r.t=.13)),r.dir=n}return t}rumble(t,e,i,n){let r=t.type==="pad"?[this.pads[t.index]]:t.type==="any"?this.connectedPads():[];for(let o of r){let a=o&&o.raw;if(a)try{a.vibrationActuator&&a.vibrationActuator.playEffect?a.vibrationActuator.playEffect("dual-rumble",{startDelay:0,duration:n,weakMagnitude:Math.min(1,i),strongMagnitude:Math.min(1,e)}).catch(()=>{}):a.hapticActuators&&a.hapticActuators[0]&&a.hapticActuators[0].pulse(Math.min(1,Math.max(e,i)),n)}catch{}}}};function J0(){return{throttle:0,steer:0,pitch:0,yaw:0,roll:0,jump:!1,boost:!1,powerslide:!1,ballCam:!1,pause:!1,lookX:0,lookY:0,skip:!1,itemDown:!1}}function yu(s){if(!s)return"Controller";let t=s.toLowerCase();return t.includes("xbox")||t.includes("xinput")||t.includes("045e")?"Xbox Controller":t.includes("dualsense")||t.includes("dualshock")||t.includes("054c")?"PlayStation Controller":"Controller"}var Cl=class{constructor(){this.ctx=null,this.volume=.7,this.engines=[],this.cineNodes=[]}init(){if(this.ctx)return!0;let t=window.AudioContext||window.webkitAudioContext;if(!t)return!1;try{this.ctx=new t}catch{return!1}let e=this.ctx;this.master=e.createGain(),this.master.gain.value=this.volume;let i=e.createDynamicsCompressor();i.threshold.value=-14,i.ratio.value=4,this.master.connect(i).connect(e.destination);let n=e.sampleRate*2;this.noise=e.createBuffer(1,n,e.sampleRate);let r=this.noise.getChannelData(0),o=0;for(let u=0;u<n;u++){let d=Math.random()*2-1;o=(o+.02*d)/1.02,r[u]=d*.6+o*3}let a=this.loopNoise(),l=e.createBiquadFilter();l.type="bandpass",l.frequency.value=700,l.Q.value=.6;let c=e.createOscillator();c.frequency.value=.23;let h=e.createGain();return h.gain.value=.015,this.crowdGain=e.createGain(),this.crowdGain.gain.value=.05,c.connect(h).connect(this.crowdGain.gain),a.connect(l).connect(this.crowdGain).connect(this.master),c.start(),!0}resume(){this.init()&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{})}get ready(){return this.ctx&&this.ctx.state==="running"}setVolume(t){this.volume=t,this.master&&this.master.gain.setTargetAtTime(t,this.ctx.currentTime,.05)}loopNoise(){let t=this.ctx.createBufferSource();return t.buffer=this.noise,t.loop=!0,t.loopStart=Math.random(),t.start(0,Math.random()*1.5),t}burst({dur:t=.2,gain:e=.5,freq:i=1200,endFreq:n=null,type:r="lowpass",q:o=.7,pan:a=0,delay:l=0}){if(!this.ready)return;let c=this.ctx,h=c.currentTime+l,u=c.createBufferSource();u.buffer=this.noise;let d=c.createBiquadFilter();d.type=r,d.frequency.setValueAtTime(i,h),n&&d.frequency.exponentialRampToValueAtTime(n,h+t),d.Q.value=o;let f=c.createGain();f.gain.setValueAtTime(1e-4,h),f.gain.exponentialRampToValueAtTime(e,h+.008),f.gain.exponentialRampToValueAtTime(1e-4,h+t);let m=c.createStereoPanner?c.createStereoPanner():null,v=u.connect(d).connect(f);m&&(m.pan.value=a,v=v.connect(m)),v.connect(this.master),u.start(h,Math.random()*1.5),u.stop(h+t+.05)}tone({freq:t=440,endFreq:e=null,dur:i=.2,gain:n=.3,type:r="sine",delay:o=0,attack:a=.005}){if(!this.ready)return;let l=this.ctx,c=l.currentTime+o,h=l.createOscillator();h.type=r,h.frequency.setValueAtTime(t,c),e&&h.frequency.exponentialRampToValueAtTime(e,c+i);let u=l.createGain();u.gain.setValueAtTime(1e-4,c),u.gain.exponentialRampToValueAtTime(n,c+a),u.gain.exponentialRampToValueAtTime(1e-4,c+i),h.connect(u).connect(this.master),h.start(c),h.stop(c+i+.05)}createEngine(t=0){if(!this.ctx)return null;let e=this.ctx,i=e.createGain();i.gain.value=0;let n=e.createStereoPanner?e.createStereoPanner():null;n?(n.pan.value=t,i.connect(n).connect(this.master)):i.connect(this.master);let r=e.createOscillator();r.type="sawtooth";let o=e.createOscillator();o.type="square";let a=e.createBiquadFilter();a.type="lowpass",a.Q.value=2;let l=e.createGain();l.gain.value=.5,r.connect(a),o.connect(l).connect(a),a.connect(i),r.start(),o.start();let c=this.loopNoise(),h=e.createBiquadFilter();h.type="bandpass",h.frequency.value=900,h.Q.value=.5;let u=e.createGain();u.gain.value=0,c.connect(h).connect(u),n?u.connect(n):u.connect(this.master);let d={out:i,o1:r,o2:o,lp:a,bg:u,bf:h,nodes:[r,o,c]};return this.engines.push(d),d}updateEngine(t,e,i,n,r,o){if(!t||!this.ctx)return;let a=this.ctx.currentTime,l=Math.abs(i),c=38+e*.05+l*14;t.o1.frequency.setTargetAtTime(c,a,.06),t.o2.frequency.setTargetAtTime(c*.5,a,.06),t.lp.frequency.setTargetAtTime(240+e*.9+l*700,a,.08),t.out.gain.setTargetAtTime(o?.05+l*.06+(r?.02:0):0,a,.1),t.bg.gain.setTargetAtTime(o&&n?.22:0,a,.04),t.bf.frequency.setTargetAtTime(n?700+e*.4:900,a,.1)}stopEngine(t){if(t){try{t.out.gain.value=0,t.bg.gain.value=0;for(let e of t.nodes)e.stop()}catch{}this.engines=this.engines.filter(e=>e!==t)}}stopEngines(){for(let t of this.engines)try{t.out.gain.value=0,t.bg.gain.value=0;for(let e of t.nodes)e.stop()}catch{}this.engines=[]}hit(t,e=0){let i=Math.min(1,t/3500);this.burst({dur:.12+i*.15,gain:.25+i*.6,freq:900+i*3e3,endFreq:200,pan:e}),this.tone({freq:140,endFreq:45,dur:.18+i*.15,gain:.25+i*.5}),i>.6&&this.burst({dur:.35,gain:.25*i,freq:4e3,endFreq:800,type:"highpass",pan:e})}bounce(t){let e=Math.min(1,t/2500);this.tone({freq:90,endFreq:40,dur:.15,gain:.08+e*.2}),this.burst({dur:.08,gain:.05+e*.15,freq:600,endFreq:150})}bump(){this.burst({dur:.18,gain:.5,freq:1500,endFreq:200}),this.tone({freq:220,endFreq:70,dur:.15,gain:.3,type:"triangle"})}demo(){this.burst({dur:.9,gain:.9,freq:3e3,endFreq:80}),this.tone({freq:90,endFreq:30,dur:.7,gain:.7}),this.burst({dur:.5,gain:.3,freq:6e3,endFreq:1500,type:"highpass",delay:.05})}goal(){this.burst({dur:1.8,gain:1,freq:4e3,endFreq:60}),this.tone({freq:70,endFreq:25,dur:1.2,gain:.9}),this.burst({dur:.6,gain:.4,freq:7e3,endFreq:2e3,type:"highpass",delay:.05}),this.cheer(1)}cheer(t){if(!this.ready)return;let e=this.ctx.currentTime,i=this.crowdGain.gain;i.cancelScheduledValues(e),i.setValueAtTime(i.value,e),i.linearRampToValueAtTime(.05+.35*t,e+.4),i.linearRampToValueAtTime(.05+.25*t,e+2.5),i.linearRampToValueAtTime(.05,e+6);for(let n=0;n<6;n++)this.burst({dur:1.2+Math.random(),gain:.06*t,freq:500+Math.random()*900,type:"bandpass",q:4,delay:Math.random()*1.2,pan:Math.random()*2-1})}boostPickup(t){t?(this.tone({freq:520,endFreq:1200,dur:.18,gain:.12,type:"triangle"}),this.tone({freq:780,endFreq:1600,dur:.2,gain:.08,type:"triangle",delay:.06})):this.tone({freq:1100,endFreq:1500,dur:.07,gain:.06,type:"triangle"})}jump(){this.burst({dur:.16,gain:.12,freq:700,endFreq:2400,type:"bandpass",q:1.2})}dodge(){this.burst({dur:.25,gain:.16,freq:1800,endFreq:500,type:"bandpass",q:1})}land(t){this.tone({freq:70,endFreq:40,dur:.12,gain:Math.min(.25,t/3e3)})}beep(t){this.tone({freq:t?880:523,dur:t?.5:.18,gain:.25,type:"square"}),this.tone({freq:t?1760:1046,dur:t?.45:.15,gain:.08,type:"sine"})}horn(){for(let t of[220,277,330])this.tone({freq:t,dur:1.4,gain:.12,type:"sawtooth",attack:.04})}itemGet(){this.tone({freq:660,endFreq:990,dur:.12,gain:.08,type:"triangle"}),this.tone({freq:990,endFreq:1320,dur:.14,gain:.07,type:"triangle",delay:.08})}itemUse(t,e=1){let i=Math.max(.2,e);switch(t){case"grapple":case"plunger":this.burst({dur:.25,gain:.25*i,freq:2500,endFreq:700,type:"bandpass",q:2});break;case"tornado":this.burst({dur:2.5,gain:.35*i,freq:300,endFreq:1400,type:"bandpass",q:.8}),this.burst({dur:3,gain:.2*i,freq:900,endFreq:400,type:"bandpass",q:3,delay:.3});break;case"freezer":this.tone({freq:1800,endFreq:3200,dur:.4,gain:.12*i,type:"sine"}),this.burst({dur:.5,gain:.25*i,freq:6e3,endFreq:3e3,type:"highpass"});break;case"curveball":this.tone({freq:300,endFreq:1200,dur:.5,gain:.15*i,type:"sawtooth"});break;case"power":case"spikes":this.tone({freq:140,endFreq:420,dur:.35,gain:.25*i,type:"square"});break;default:this.burst({dur:.2,gain:.3*i,freq:1200,endFreq:200})}}hook(t=1){this.tone({freq:900,endFreq:500,dur:.12,gain:.2*Math.max(.2,t),type:"square"}),this.burst({dur:.1,gain:.2*Math.max(.2,t),freq:4e3,endFreq:1500,type:"highpass"})}cine(t){if(!this.ready)return;let e=this.ctx;switch(t){case"rise":[523,659,784,1046].forEach((i,n)=>this.tone({freq:i,dur:.9,gain:.09,type:"triangle",delay:n*.11,attack:.02})),this.tone({freq:131,dur:1.6,gain:.18,type:"sawtooth",attack:.05});break;case"flap":this.burst({dur:1,gain:.25,freq:3e3,endFreq:500,type:"bandpass",q:1.5}),this.tone({freq:160,endFreq:70,dur:.6,gain:.25,type:"square"});break;case"clunk":this.tone({freq:70,endFreq:30,dur:.5,gain:.7}),this.burst({dur:.4,gain:.6,freq:1500,endFreq:100});break;case"build":this.tone({freq:90,endFreq:900,dur:2.6,gain:.12,type:"sawtooth",attack:.3});for(let i=0;i<12;i++)this.tone({freq:700+i*90,dur:.12,gain:.05,type:"square",delay:i*.2});break;case"launch":this.burst({dur:1.4,gain:.7,freq:500,endFreq:3e3,type:"bandpass",q:.7}),this.tone({freq:60,endFreq:120,dur:1.2,gain:.4,type:"sawtooth"});break;case"whoosh":this.burst({dur:1.3,gain:.5,freq:300,endFreq:4e3,type:"bandpass",q:1.2});break;case"boom":this.burst({dur:2.6,gain:1,freq:3500,endFreq:40}),this.tone({freq:60,endFreq:18,dur:2.4,gain:1}),this.burst({dur:.8,gain:.5,freq:7e3,endFreq:1500,type:"highpass",delay:.03});break;case"tear":this.burst({dur:3,gain:.8,freq:200,endFreq:1200,type:"lowpass"});for(let i=0;i<8;i++)this.burst({dur:.3,gain:.35,freq:2500,endFreq:300,delay:Math.random()*2.5});break;case"drone":this.startDrone(32,.55);break;case"space":{this.stopCine(1.5),this.startDrone(24,.45);let i=e.currentTime,n=e.createGain();n.gain.setValueAtTime(1e-4,i),n.gain.exponentialRampToValueAtTime(.06,i+3),n.connect(this.master);let r=[110,164.8,220.5,329.6].map((o,a)=>{let l=e.createOscillator();return l.type="sine",l.frequency.value=o*(1+(a%2?.003:-.002)),l.connect(n),l.start(i),l});this.cineNodes.push({out:n,srcs:r});break}case"gulp":this.tone({freq:180,endFreq:20,dur:1.6,gain:.8}),this.burst({dur:1.5,gain:.6,freq:1200,endFreq:60});break;case"bigboom":this.stopCine(.2),this.burst({dur:5,gain:1,freq:5e3,endFreq:30}),this.tone({freq:50,endFreq:15,dur:4.5,gain:1}),this.tone({freq:100,endFreq:25,dur:3,gain:.6,type:"sawtooth"}),this.burst({dur:1.5,gain:.6,freq:8e3,endFreq:2e3,type:"highpass",delay:.05}),this.burst({dur:4,gain:.5,freq:600,endFreq:80,delay:.6});break;case"stop":this.stopCine(.6);break;default:break}}startDrone(t,e){let i=this.ctx,n=i.currentTime,r=i.createGain();r.gain.setValueAtTime(1e-4,n),r.gain.exponentialRampToValueAtTime(e,n+1.5);let o=i.createBiquadFilter();o.type="lowpass",o.frequency.setValueAtTime(140,n),o.frequency.linearRampToValueAtTime(700,n+9),o.Q.value=3,o.connect(r).connect(this.master);let a=[1,1.012,.5].map(h=>{let u=i.createOscillator();return u.type="sawtooth",u.frequency.setValueAtTime(t*h,n),u.frequency.linearRampToValueAtTime(t*h*1.8,n+10),u.connect(o),u.start(n),u}),l=this.loopNoise(),c=i.createGain();c.gain.value=.6,l.connect(c).connect(o),a.push(l),this.cineNodes=this.cineNodes||[],this.cineNodes.push({out:r,srcs:a})}stopCine(t=.5){if(!this.ctx||!this.cineNodes)return;let e=this.ctx.currentTime;for(let i of this.cineNodes)try{i.out.gain.cancelScheduledValues(e),i.out.gain.setValueAtTime(Math.max(1e-4,i.out.gain.value),e),i.out.gain.exponentialRampToValueAtTime(1e-4,e+t);for(let n of i.srcs)n.stop(e+t+.05)}catch{}this.cineNodes=[]}click(){this.tone({freq:1400,dur:.04,gain:.05,type:"square"})}select(){this.tone({freq:900,endFreq:1400,dur:.09,gain:.08,type:"triangle"})}};var yp=0,nd=1,_p=2;var dr=1,Mp=2,uo=3,Hs=0,_i=1,re=2,pn=0,mn=1,Ee=2,sd=3,rd=4,bp=5;var fr=100,Sp=101,Ep=102,wp=103,Tp=104,Ap=200,Rp=201,Cp=202,Pp=203,od=204,ad=205,Ip=206,Lp=207,Dp=208,Np=209,Up=210,Fp=211,Bp=212,Op=213,Hp=214,rc=0,oc=1,ac=2,Zr=3,lc=4,cc=5,hc=6,uc=7,ld=0,zp=1,kp=2,Dn=0,Xa=1,Ya=2,Za=3,pr=4,$a=5,Ja=6,Ka=7;var cd=300,zs=301,mr=302,Oc=303,Hc=304,ja=306,Ji=1e3,Gn=1001,dc=1002,pi=1003,Vp=1004;var Qa=1005;var mi=1006,zc=1007;var ks=1008;var Fi=1009,hd=1010,ud=1011,fo=1012,kc=1013,Nn=1014,gn=1015,hi=1016,Vc=1017,Gc=1018,po=1020,dd=35902,fd=35899,pd=1021,md=1022,vn=1023,Xn=1026,Vs=1027,Wc=1028,qc=1029,Gs=1030,Xc=1031;var Yc=1033,tl=33776,el=33777,il=33778,nl=33779,Zc=35840,$c=35841,Jc=35842,Kc=35843,jc=36196,Qc=37492,th=37496,eh=37488,ih=37489,sl=37490,nh=37491,sh=37808,rh=37809,oh=37810,ah=37811,lh=37812,ch=37813,hh=37814,uh=37815,dh=37816,fh=37817,ph=37818,mh=37819,gh=37820,vh=37821,xh=36492,yh=36494,_h=36495,Mh=36283,bh=36284,rl=36285,Sh=36286;var ha=2300,fc=2301,nc=2302,qu=2303,Xu=2400,Yu=2401,Zu=2402;var Gp=3200;var Eh=0,Wp=1,_s="",ze="srgb",ua="srgb-linear",da="linear",Ce="srgb";var sc=7680;var qp=519,Xp=512,Yp=513,Zp=514,wh=515,$p=516,Jp=517,Th=518,Kp=519,gd=35044,Ki=35048;var vd="300 es",Cn=2e3,$r=2001;function K0(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function j0(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function fa(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function jp(){let s=fa("canvas");return s.style.display="block",s}var Hf={},Jr=null;function pa(...s){let t="THREE."+s.shift();Jr?Jr("log",t,...s):console.log(t,...s)}function Qp(s){let t=s[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=s[1];e&&e.isStackTrace?s[0]+=" "+e.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function jt(...s){s=Qp(s);let t="THREE."+s.shift();if(Jr)Jr("warn",t,...s);else{let e=s[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...s)}}function te(...s){s=Qp(s);let t="THREE."+s.shift();if(Jr)Jr("error",t,...s);else{let e=s[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...s)}}function ar(...s){let t=s.join(" ");t in Hf||(Hf[t]=!0,jt(...s))}function tm(s,t,e){return new Promise(function(i,n){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:n();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}var em={[rc]:oc,[ac]:hc,[lc]:uc,[Zr]:cc,[oc]:rc,[hc]:ac,[uc]:lc,[cc]:Zr},Yn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let n=i[t];if(n!==void 0){let r=n.indexOf(e);r!==-1&&n.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let n=i.slice(0);for(let r=0,o=n.length;r<o;r++)n[r].call(this,t);t.target=null}}},Ni=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],zf=1234567,oa=Math.PI/180,Kr=180/Math.PI;function qn(){let s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ni[s&255]+Ni[s>>8&255]+Ni[s>>16&255]+Ni[s>>24&255]+"-"+Ni[t&255]+Ni[t>>8&255]+"-"+Ni[t>>16&15|64]+Ni[t>>24&255]+"-"+Ni[e&63|128]+Ni[e>>8&255]+"-"+Ni[e>>16&255]+Ni[e>>24&255]+Ni[i&255]+Ni[i>>8&255]+Ni[i>>16&255]+Ni[i>>24&255]).toLowerCase()}function de(s,t,e){return Math.max(t,Math.min(e,s))}function xd(s,t){return(s%t+t)%t}function Q0(s,t,e,i,n){return i+(s-t)*(n-i)/(e-t)}function tg(s,t,e){return s!==t?(e-s)/(t-s):0}function aa(s,t,e){return(1-e)*s+e*t}function eg(s,t,e,i){return aa(s,t,1-Math.exp(-e*i))}function ig(s,t=1){return t-Math.abs(xd(s,t*2)-t)}function ng(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function sg(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function rg(s,t){return s+Math.floor(Math.random()*(t-s+1))}function og(s,t){return s+Math.random()*(t-s)}function ag(s){return s*(.5-Math.random())}function lg(s){s!==void 0&&(zf=s);let t=zf+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function cg(s){return s*oa}function hg(s){return s*Kr}function ug(s){return s>0&&Number.isInteger(s)&&2**Math.round(Math.log2(s))===s}function dg(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function fg(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function pg(s,t,e,i,n){let r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+i)/2),h=o((t+i)/2),u=r((t-i)/2),d=o((t-i)/2),f=r((i-t)/2),m=o((i-t)/2);switch(n){case"XYX":s.set(a*h,l*u,l*d,a*c);break;case"YZY":s.set(l*d,a*h,l*u,a*c);break;case"ZXZ":s.set(l*u,l*d,a*h,a*c);break;case"XZX":s.set(a*h,l*m,l*f,a*c);break;case"YXY":s.set(l*f,a*h,l*m,a*c);break;case"ZYZ":s.set(l*m,l*f,a*h,a*c);break;default:jt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+n)}}function Rn(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:case Uint8ClampedArray:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Be(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var we={DEG2RAD:oa,RAD2DEG:Kr,generateUUID:qn,clamp:de,euclideanModulo:xd,mapLinear:Q0,inverseLerp:tg,lerp:aa,damp:eg,pingpong:ig,smoothstep:ng,smootherstep:sg,randInt:rg,randFloat:og,randFloatSpread:ag,seededRandom:lg,degToRad:cg,radToDeg:hg,isPowerOfTwo:ug,ceilPowerOfTwo:dg,floorPowerOfTwo:fg,setQuaternionFromProperEuler:pg,normalize:Be,denormalize:Rn},Ed=class Ed{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,n=t.elements;return this.x=n[0]*e+n[3]*i+n[6],this.y=n[1]*e+n[4]*i+n[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(de(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(de(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),n=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*i-o*n+t.x,this.y=r*n+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Ed.prototype.isVector2=!0;var j=Ed,he=class{constructor(t=0,e=0,i=0,n=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=n}static slerpFlat(t,e,i,n,r,o,a){let l=i[n+0],c=i[n+1],h=i[n+2],u=i[n+3],d=r[o+0],f=r[o+1],m=r[o+2],v=r[o+3];if(u!==v||l!==d||c!==f||h!==m){let p=l*d+c*f+h*m+u*v;p<0&&(d=-d,f=-f,m=-m,v=-v,p=-p);let g=1-a;if(p<.9995){let x=Math.acos(p),M=Math.sin(x);g=Math.sin(g*x)/M,a=Math.sin(a*x)/M,l=l*g+d*a,c=c*g+f*a,h=h*g+m*a,u=u*g+v*a}else{l=l*g+d*a,c=c*g+f*a,h=h*g+m*a,u=u*g+v*a;let x=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=x,c*=x,h*=x,u*=x}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,i,n,r,o){let a=i[n],l=i[n+1],c=i[n+2],h=i[n+3],u=r[o],d=r[o+1],f=r[o+2],m=r[o+3];return t[e]=a*m+h*u+l*f-c*d,t[e+1]=l*m+h*d+c*u-a*f,t[e+2]=c*m+h*f+a*d-l*u,t[e+3]=h*m-a*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,n){return this._x=t,this._y=e,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,n=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(n/2),u=a(r/2),d=l(i/2),f=l(n/2),m=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"YXZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"ZXY":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"ZYX":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"YZX":this._x=d*h*u+c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u-d*f*m;break;case"XZY":this._x=d*h*u-c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u+d*f*m;break;default:jt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,n=Math.sin(i);return this._x=t.x*n,this._y=t.y*n,this._z=t.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],n=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=i+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-n)*f}else if(i>a&&i>u){let f=2*Math.sqrt(1+i-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(n+o)/f,this._z=(r+c)/f}else if(a>u){let f=2*Math.sqrt(1+a-i-u);this._w=(r-c)/f,this._x=(n+o)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-i-a);this._w=(o-n)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(de(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let n=Math.min(1,e/i);return this.slerp(t,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,n=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+o*a+n*c-r*l,this._y=n*h+o*l+r*a-i*c,this._z=r*h+o*c+i*l-n*a,this._w=o*h-i*a-n*l-r*c,this._onChangeCallback(),this}slerp(t,e){let i=t._x,n=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(i=-i,n=-n,r=-r,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(n*Math.sin(t),n*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},wd=class wd{constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(kf.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(kf.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*n,this.y=r[1]*e+r[4]*i+r[7]*n,this.z=r[2]*e+r[5]*i+r[8]*n,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=t.elements,o=1/(r[3]*e+r[7]*i+r[11]*n+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*n+r[12])*o,this.y=(r[1]*e+r[5]*i+r[9]*n+r[13])*o,this.z=(r[2]*e+r[6]*i+r[10]*n+r[14])*o,this}applyQuaternion(t){let e=this.x,i=this.y,n=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*n-a*i),h=2*(a*e-r*n),u=2*(r*i-o*e);return this.x=e+l*c+o*u-a*h,this.y=i+l*h+a*c-r*u,this.z=n+l*u+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*n,this.y=r[1]*e+r[5]*i+r[9]*n,this.z=r[2]*e+r[6]*i+r[10]*n,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this.z=de(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this.z=de(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(de(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,n=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=n*l-r*a,this.y=r*o-i*l,this.z=i*a-n*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return _u.copy(this).projectOnVector(t),this.sub(_u)}reflect(t){return this.sub(_u.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(de(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,n=this.z-t.z;return e*e+i*i+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let n=Math.sin(e)*t;return this.x=n*Math.sin(i),this.y=Math.cos(e)*t,this.z=n*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),n=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=n,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};wd.prototype.isVector3=!0;var w=wd,_u=new w,kf=new he,Td=class Td{constructor(t,e,i,n,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,o,a,l,c)}set(t,e,i,n,r,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=n,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],u=i[7],d=i[2],f=i[5],m=i[8],v=n[0],p=n[3],g=n[6],x=n[1],M=n[4],y=n[7],b=n[2],E=n[5],A=n[8];return r[0]=o*v+a*x+l*b,r[3]=o*p+a*M+l*E,r[6]=o*g+a*y+l*A,r[1]=c*v+h*x+u*b,r[4]=c*p+h*M+u*E,r[7]=c*g+h*y+u*A,r[2]=d*v+f*x+m*b,r[5]=d*p+f*M+m*E,r[8]=d*g+f*y+m*A,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-i*r*h+i*a*l+n*r*c-n*o*l}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,m=e*u+i*d+n*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/m;return t[0]=u*v,t[1]=(n*c-h*i)*v,t[2]=(a*i-n*o)*v,t[3]=d*v,t[4]=(h*e-n*l)*v,t[5]=(n*r-a*e)*v,t[6]=f*v,t[7]=(i*l-c*e)*v,t[8]=(o*e-i*r)*v,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,n,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+t,-n*c,n*l,-n*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return ar("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Mu.makeScale(t,e)),this}rotate(t){return ar("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Mu.makeRotation(-t)),this}translate(t,e){return ar("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Mu.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<9;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Td.prototype.isMatrix3=!0;var ie=Td,Mu=new ie,Vf=new ie().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Gf=new ie().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function mg(){let s={enabled:!0,workingColorSpace:ua,spaces:{},convert:function(n,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Ce&&(n.r=gs(n.r),n.g=gs(n.g),n.b=gs(n.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(n.applyMatrix3(this.spaces[r].toXYZ),n.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Ce&&(n.r=Yr(n.r),n.g=Yr(n.g),n.b=Yr(n.b))),n},workingToColorSpace:function(n,r){return this.convert(n,this.workingColorSpace,r)},colorSpaceToWorking:function(n,r){return this.convert(n,r,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===_s?da:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,r=this.workingColorSpace){return n.fromArray(this.spaces[r].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,r,o){return n.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,r){return ar("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(n,r)},toWorkingColorSpace:function(n,r){return ar("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(n,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return s.define({[ua]:{primaries:t,whitePoint:i,transfer:da,toXYZ:Vf,fromXYZ:Gf,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:ze},outputColorSpaceConfig:{drawingBufferColorSpace:ze}},[ze]:{primaries:t,whitePoint:i,transfer:Ce,toXYZ:Vf,fromXYZ:Gf,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:ze}}}),s}var ye=mg();function gs(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Yr(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var Cr,pc=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{Cr===void 0&&(Cr=fa("canvas")),Cr.width=t.width,Cr.height=t.height;let n=Cr.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),i=Cr}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=fa("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let n=i.getImageData(0,0,t.width,t.height),r=n.data;for(let o=0;o<r.length;o++)r[o]=gs(r[o]/255)*255;return i.putImageData(n,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(gs(e[i]/255)*255):e[i]=gs(e[i]);return{data:e,width:t.width,height:t.height}}else return jt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},gg=0,jr=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:gg++}),this.uuid=qn(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let r;if(Array.isArray(n)){r=[];for(let o=0,a=n.length;o<a;o++)n[o].isDataTexture?r.push(bu(n[o].image)):r.push(bu(n[o]))}else r=bu(n);i.url=r}return e||(t.images[this.uuid]=i),i}};function bu(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?pc.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(jt("Texture: Unable to serialize Texture."),{})}var vg=0,Su=new w,Wi=class s extends Yn{constructor(t=s.DEFAULT_IMAGE,e=s.DEFAULT_MAPPING,i=Gn,n=Gn,r=mi,o=ks,a=vn,l=Fi,c=s.DEFAULT_ANISOTROPY,h=_s){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:vg++}),this.uuid=qn(),this.name="",this.source=new jr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new j(0,0),this.repeat=new j(1,1),this.center=new j(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ie,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Su).x}get height(){return this.source.getSize(Su).y}get depth(){return this.source.getSize(Su).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){jt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){jt(`Texture.setValues(): property '${e}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==cd)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ji:t.x=t.x-Math.floor(t.x);break;case Gn:t.x=t.x<0?0:1;break;case dc:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ji:t.y=t.y-Math.floor(t.y);break;case Gn:t.y=t.y<0?0:1;break;case dc:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Wi.DEFAULT_IMAGE=null;Wi.DEFAULT_MAPPING=cd;Wi.DEFAULT_ANISOTROPY=1;var Ad=class Ad{constructor(t=0,e=0,i=0,n=1){this.x=t,this.y=e,this.z=i,this.w=n}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,n){return this.x=t,this.y=e,this.z=i,this.w=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*i+o[8]*n+o[12]*r,this.y=o[1]*e+o[5]*i+o[9]*n+o[13]*r,this.z=o[2]*e+o[6]*i+o[10]*n+o[14]*r,this.w=o[3]*e+o[7]*i+o[11]*n+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,n,r,l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],m=l[9],v=l[2],p=l[6],g=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-v)<.01&&Math.abs(m-p)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+v)<.1&&Math.abs(m+p)<.1&&Math.abs(c+f+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let M=(c+1)/2,y=(f+1)/2,b=(g+1)/2,E=(h+d)/4,A=(u+v)/4,_=(m+p)/4;return M>y&&M>b?M<.01?(i=0,n=.707106781,r=.707106781):(i=Math.sqrt(M),n=E/i,r=A/i):y>b?y<.01?(i=.707106781,n=0,r=.707106781):(n=Math.sqrt(y),i=E/n,r=_/n):b<.01?(i=.707106781,n=.707106781,r=0):(r=Math.sqrt(b),i=A/r,n=_/r),this.set(i,n,r,e),this}let x=Math.sqrt((p-m)*(p-m)+(u-v)*(u-v)+(d-h)*(d-h));return Math.abs(x)<.001&&(x=1),this.x=(p-m)/x,this.y=(u-v)/x,this.z=(d-h)/x,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=de(this.x,t.x,e.x),this.y=de(this.y,t.y,e.y),this.z=de(this.z,t.z,e.z),this.w=de(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=de(this.x,t,e),this.y=de(this.y,t,e),this.z=de(this.z,t,e),this.w=de(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(de(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Ad.prototype.isVector4=!0;var je=Ad,mc=class extends Yn{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:mi,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new je(0,0,t,e),this.scissorTest=!1,this.viewport=new je(0,0,t,e),this.textures=[];let n={width:t,height:e,depth:i.depth},r=new Wi(n),o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:mi,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let n=0,r=this.textures.length;n<r;n++)this.textures[n].image.width=t,this.textures[n].image.height=e,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let n=Object.assign({},t.textures[e].image);this.textures[e].source=new jr(n)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Qe=class extends mc{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},ma=class extends Wi{constructor(t=null,e=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=pi,this.minFilter=pi,this.wrapR=Gn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var gc=class extends Wi{constructor(t=null,e=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=pi,this.minFilter=pi,this.wrapR=Gn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Bc=class Bc{constructor(t,e,i,n,r,o,a,l,c,h,u,d,f,m,v,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,o,a,l,c,h,u,d,f,m,v,p)}set(t,e,i,n,r,o,a,l,c,h,u,d,f,m,v,p){let g=this.elements;return g[0]=t,g[4]=e,g[8]=i,g[12]=n,g[1]=r,g[5]=o,g[9]=a,g[13]=l,g[2]=c,g[6]=h,g[10]=u,g[14]=d,g[3]=f,g[7]=m,g[11]=v,g[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Bc().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,n=1/Pr.setFromMatrixColumn(t,0).length(),r=1/Pr.setFromMatrixColumn(t,1).length(),o=1/Pr.setFromMatrixColumn(t,2).length();return e[0]=i[0]*n,e[1]=i[1]*n,e[2]=i[2]*n,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*o,e[9]=i[9]*o,e[10]=i[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,n=t.y,r=t.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(n),c=Math.sin(n),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let d=o*h,f=o*u,m=a*h,v=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+m*c,e[5]=d-v*c,e[9]=-a*l,e[2]=v-d*c,e[6]=m+f*c,e[10]=o*l}else if(t.order==="YXZ"){let d=l*h,f=l*u,m=c*h,v=c*u;e[0]=d+v*a,e[4]=m*a-f,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-m,e[6]=v+d*a,e[10]=o*l}else if(t.order==="ZXY"){let d=l*h,f=l*u,m=c*h,v=c*u;e[0]=d-v*a,e[4]=-o*u,e[8]=m+f*a,e[1]=f+m*a,e[5]=o*h,e[9]=v-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let d=o*h,f=o*u,m=a*h,v=a*u;e[0]=l*h,e[4]=m*c-f,e[8]=d*c+v,e[1]=l*u,e[5]=v*c+d,e[9]=f*c-m,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let d=o*l,f=o*c,m=a*l,v=a*c;e[0]=l*h,e[4]=v-d*u,e[8]=m*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*u+m,e[10]=d-v*u}else if(t.order==="XZY"){let d=o*l,f=o*c,m=a*l,v=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+v,e[5]=o*h,e[9]=f*u-m,e[2]=m*u-f,e[6]=a*h,e[10]=v*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(xg,t,yg)}lookAt(t,e,i){let n=this.elements;return en.subVectors(t,e),en.lengthSq()===0&&(en.z=1),en.normalize(),Cs.crossVectors(i,en),Cs.lengthSq()===0&&(Math.abs(i.z)===1?en.x+=1e-4:en.z+=1e-4,en.normalize(),Cs.crossVectors(i,en)),Cs.normalize(),Pl.crossVectors(en,Cs),n[0]=Cs.x,n[4]=Pl.x,n[8]=en.x,n[1]=Cs.y,n[5]=Pl.y,n[9]=en.y,n[2]=Cs.z,n[6]=Pl.z,n[10]=en.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],u=i[5],d=i[9],f=i[13],m=i[2],v=i[6],p=i[10],g=i[14],x=i[3],M=i[7],y=i[11],b=i[15],E=n[0],A=n[4],_=n[8],R=n[12],P=n[1],I=n[5],N=n[9],H=n[13],L=n[2],B=n[6],q=n[10],Y=n[14],rt=n[3],Z=n[7],tt=n[11],nt=n[15];return r[0]=o*E+a*P+l*L+c*rt,r[4]=o*A+a*I+l*B+c*Z,r[8]=o*_+a*N+l*q+c*tt,r[12]=o*R+a*H+l*Y+c*nt,r[1]=h*E+u*P+d*L+f*rt,r[5]=h*A+u*I+d*B+f*Z,r[9]=h*_+u*N+d*q+f*tt,r[13]=h*R+u*H+d*Y+f*nt,r[2]=m*E+v*P+p*L+g*rt,r[6]=m*A+v*I+p*B+g*Z,r[10]=m*_+v*N+p*q+g*tt,r[14]=m*R+v*H+p*Y+g*nt,r[3]=x*E+M*P+y*L+b*rt,r[7]=x*A+M*I+y*B+b*Z,r[11]=x*_+M*N+y*q+b*tt,r[15]=x*R+M*H+y*Y+b*nt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],m=t[3],v=t[7],p=t[11],g=t[15],x=l*f-c*d,M=a*f-c*u,y=a*d-l*u,b=o*f-c*h,E=o*d-l*h,A=o*u-a*h;return e*(v*x-p*M+g*y)-i*(m*x-p*b+g*E)+n*(m*M-v*b+g*A)-r*(m*y-v*E+p*A)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[1],o=t[5],a=t[9],l=t[2],c=t[6],h=t[10];return e*(o*h-a*c)-i*(r*h-a*l)+n*(r*c-o*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let n=this.elements;return t.isVector3?(n[12]=t.x,n[13]=t.y,n[14]=t.z):(n[12]=t,n[13]=e,n[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],m=t[12],v=t[13],p=t[14],g=t[15],x=e*a-i*o,M=e*l-n*o,y=e*c-r*o,b=i*l-n*a,E=i*c-r*a,A=n*c-r*l,_=h*v-u*m,R=h*p-d*m,P=h*g-f*m,I=u*p-d*v,N=u*g-f*v,H=d*g-f*p,L=x*H-M*N+y*I+b*P-E*R+A*_;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let B=1/L;return t[0]=(a*H-l*N+c*I)*B,t[1]=(n*N-i*H-r*I)*B,t[2]=(v*A-p*E+g*b)*B,t[3]=(d*E-u*A-f*b)*B,t[4]=(l*P-o*H-c*R)*B,t[5]=(e*H-n*P+r*R)*B,t[6]=(p*y-m*A-g*M)*B,t[7]=(h*A-d*y+f*M)*B,t[8]=(o*N-a*P+c*_)*B,t[9]=(i*P-e*N-r*_)*B,t[10]=(m*E-v*y+g*x)*B,t[11]=(u*y-h*E-f*x)*B,t[12]=(a*R-o*I-l*_)*B,t[13]=(e*I-i*R+n*_)*B,t[14]=(v*M-m*b-p*x)*B,t[15]=(h*b-u*M+d*x)*B,this}scale(t){let e=this.elements,i=t.x,n=t.y,r=t.z;return e[0]*=i,e[4]*=n,e[8]*=r,e[1]*=i,e[5]*=n,e[9]*=r,e[2]*=i,e[6]*=n,e[10]*=r,e[3]*=i,e[7]*=n,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],n=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,n))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),n=Math.sin(e),r=1-i,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+i,c*a-n*l,c*l+n*a,0,c*a+n*l,h*a+i,h*l-n*o,0,c*l-n*a,h*l+n*o,r*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,n,r,o){return this.set(1,i,r,0,t,1,o,0,e,n,1,0,0,0,0,1),this}compose(t,e,i){let n=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,m=r*u,v=o*h,p=o*u,g=a*u,x=l*c,M=l*h,y=l*u,b=i.x,E=i.y,A=i.z;return n[0]=(1-(v+g))*b,n[1]=(f+y)*b,n[2]=(m-M)*b,n[3]=0,n[4]=(f-y)*E,n[5]=(1-(d+g))*E,n[6]=(p+x)*E,n[7]=0,n[8]=(m+M)*A,n[9]=(p-x)*A,n[10]=(1-(d+v))*A,n[11]=0,n[12]=t.x,n[13]=t.y,n[14]=t.z,n[15]=1,this}decompose(t,e,i){let n=this.elements;t.x=n[12],t.y=n[13],t.z=n[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),e.identity(),this;let o=Pr.set(n[0],n[1],n[2]).length(),a=Pr.set(n[4],n[5],n[6]).length(),l=Pr.set(n[8],n[9],n[10]).length();r<0&&(o=-o),wn.copy(this);let c=1/o,h=1/a,u=1/l;return wn.elements[0]*=c,wn.elements[1]*=c,wn.elements[2]*=c,wn.elements[4]*=h,wn.elements[5]*=h,wn.elements[6]*=h,wn.elements[8]*=u,wn.elements[9]*=u,wn.elements[10]*=u,e.setFromRotationMatrix(wn),i.x=o,i.y=a,i.z=l,this}makePerspective(t,e,i,n,r,o,a=Cn,l=!1){let c=this.elements,h=2*r/(e-t),u=2*r/(i-n),d=(e+t)/(e-t),f=(i+n)/(i-n),m,v;if(l)m=r/(o-r),v=o*r/(o-r);else if(a===Cn)m=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===$r)m=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,n,r,o,a=Cn,l=!1){let c=this.elements,h=2/(e-t),u=2/(i-n),d=-(e+t)/(e-t),f=-(i+n)/(i-n),m,v;if(l)m=1/(o-r),v=o/(o-r);else if(a===Cn)m=-2/(o-r),v=-(o+r)/(o-r);else if(a===$r)m=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=m,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<16;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}};Bc.prototype.isMatrix4=!0;var Me=Bc,Pr=new w,wn=new Me,xg=new w(0,0,0),yg=new w(1,1,1),Cs=new w,Pl=new w,en=new w,Wf=new Me,qf=new he,Pn=class s{constructor(t=0,e=0,i=0,n=s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=n}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,n=this._order){return this._x=t,this._y=e,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let n=t.elements,r=n[0],o=n[4],a=n[8],l=n[1],c=n[5],h=n[9],u=n[2],d=n[6],f=n[10];switch(e){case"XYZ":this._y=Math.asin(de(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-de(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(de(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-de(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(de(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-de(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:jt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Wf.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Wf,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return qf.setFromEuler(this),this.setFromQuaternion(qf,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Pn.DEFAULT_ORDER="XYZ";var ga=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},_g=0,Xf=new w,Ir=new he,hs=new Me,Il=new w,Jo=new w,Mg=new w,bg=new he,Yf=new w(1,0,0),Zf=new w(0,1,0),$f=new w(0,0,1),Jf={type:"added"},Sg={type:"removed"},Lr={type:"childadded",child:null},Eu={type:"childremoved",child:null},gi=class s extends Yn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:_g++}),this.uuid=qn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let t=new w,e=new Pn,i=new he,n=new w(1,1,1);function r(){i.setFromEuler(e,!1)}function o(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new Me},normalMatrix:{value:new ie}}),this.matrix=new Me,this.matrixWorld=new Me,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ga,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ir.setFromAxisAngle(t,e),this.quaternion.multiply(Ir),this}rotateOnWorldAxis(t,e){return Ir.setFromAxisAngle(t,e),this.quaternion.premultiply(Ir),this}rotateX(t){return this.rotateOnAxis(Yf,t)}rotateY(t){return this.rotateOnAxis(Zf,t)}rotateZ(t){return this.rotateOnAxis($f,t)}translateOnAxis(t,e){return Xf.copy(t).applyQuaternion(this.quaternion),this.position.add(Xf.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Yf,t)}translateY(t){return this.translateOnAxis(Zf,t)}translateZ(t){return this.translateOnAxis($f,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(hs.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?Il.copy(t):Il.set(t,e,i);let n=this.parent;this.updateWorldMatrix(!0,!1),Jo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?hs.lookAt(Jo,Il,this.up):hs.lookAt(Il,Jo,this.up),this.quaternion.setFromRotationMatrix(hs),n&&(hs.extractRotation(n.matrixWorld),Ir.setFromRotationMatrix(hs),this.quaternion.premultiply(Ir.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(te("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Jf),Lr.child=t,this.dispatchEvent(Lr),Lr.child=null):te("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Sg),Eu.child=t,this.dispatchEvent(Eu),Eu.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),hs.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),hs.multiply(t.parent.matrixWorld)),t.applyMatrix4(hs),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Jf),Lr.child=t,this.dispatchEvent(Lr),Lr.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,n=this.children.length;i<n;i++){let o=this.children[i].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let n=this.children;for(let r=0,o=n.length;r<o;r++)n[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Jo,t,Mg),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Jo,bg,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,n=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*i-r[8]*n,r[13]+=i-r[1]*e-r[5]*i-r[9]*n,r[14]+=n-r[2]*e-r[6]*i-r[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};n.uuid=this.uuid,n.type=this.type,n.name=this.name,n.castShadow=this.castShadow,n.receiveShadow=this.receiveShadow,n.visible=this.visible,n.frustumCulled=this.frustumCulled,n.renderOrder=this.renderOrder,n.static=this.static,n.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(a=>({...a})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(t),n.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));n.material=a}else n.material=r(t.materials,this.material);if(this.children.length>0){n.children=[];for(let a=0;a<this.children.length;a++)n.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){n.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];n.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),m=o(t.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),m.length>0&&(i.nodes=m)}return i.object=n,i;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let n=t.children[i];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};gi.DEFAULT_UP=new w(0,1,0);gi.DEFAULT_MATRIX_AUTO_UPDATE=!0;gi.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var _e=class extends gi{constructor(){super(),this.isGroup=!0,this.type="Group"}},Eg={type:"move"},Qr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new _e,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new _e,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new w,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new w),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new _e,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new w,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new w,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let n=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let v of t.hand.values()){let p=e.getJointPose(v,i),g=this._getHandJoint(c,v);p!==null&&(g.matrix.fromArray(p.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=p.radius),g.visible=p!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,m=.005;c.inputState.pinching&&d>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(n=e.getPose(t.targetRaySpace,i),n===null&&r!==null&&(n=r),n!==null&&(a.matrix.fromArray(n.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,n.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(n.linearVelocity)):a.hasLinearVelocity=!1,n.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(n.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Eg)))}return a!==null&&(a.visible=n!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new _e;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},im={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ps={h:0,s:0,l:0},Ll={h:0,s:0,l:0};function wu(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}var St=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let n=t;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=ze){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ye.colorSpaceToWorking(this,e),this}setRGB(t,e,i,n=ye.workingColorSpace){return this.r=t,this.g=e,this.b=i,ye.colorSpaceToWorking(this,n),this}setHSL(t,e,i,n=ye.workingColorSpace){if(t=xd(t,1),e=de(e,0,1),i=de(i,0,1),e===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+e):i+e-i*e,o=2*i-r;this.r=wu(o,r,t+1/3),this.g=wu(o,r,t),this.b=wu(o,r,t-1/3)}return ye.colorSpaceToWorking(this,n),this}setStyle(t,e=ze){function i(r){r!==void 0&&parseFloat(r)<1&&jt("Color: Alpha component of "+t+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=n[1],a=n[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:jt("Color: Unknown color model "+t)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=n[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);jt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=ze){let i=im[t.toLowerCase()];return i!==void 0?this.setHex(i,e):jt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=gs(t.r),this.g=gs(t.g),this.b=gs(t.b),this}copyLinearToSRGB(t){return this.r=Yr(t.r),this.g=Yr(t.g),this.b=Yr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=ze){return ye.workingToColorSpace(Ui.copy(this),t),Math.round(de(Ui.r*255,0,255))*65536+Math.round(de(Ui.g*255,0,255))*256+Math.round(de(Ui.b*255,0,255))}getHexString(t=ze){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ye.workingColorSpace){ye.workingToColorSpace(Ui.copy(this),e);let i=Ui.r,n=Ui.g,r=Ui.b,o=Math.max(i,n,r),a=Math.min(i,n,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case i:l=(n-r)/u+(n<r?6:0);break;case n:l=(r-i)/u+2;break;case r:l=(i-n)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=ye.workingColorSpace){return ye.workingToColorSpace(Ui.copy(this),e),t.r=Ui.r,t.g=Ui.g,t.b=Ui.b,t}getStyle(t=ze){ye.workingToColorSpace(Ui.copy(this),t);let e=Ui.r,i=Ui.g,n=Ui.b;return t!==ze?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(t,e,i){return this.getHSL(Ps),this.setHSL(Ps.h+t,Ps.s+e,Ps.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(Ps),t.getHSL(Ll);let i=aa(Ps.h,Ll.h,e),n=aa(Ps.s,Ll.s,e),r=aa(Ps.l,Ll.l,e);return this.setHSL(i,n,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,n=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*n,this.g=r[1]*e+r[4]*i+r[7]*n,this.b=r[2]*e+r[5]*i+r[8]*n,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ui=new St;St.NAMES=im;var va=class s{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new St(t),this.density=e}clone(){return new s(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Zn=class extends gi{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Pn,this.environmentIntensity=1,this.environmentRotation=new Pn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},Tn=new w,us=new w,Tu=new w,ds=new w,Dr=new w,Nr=new w,Kf=new w,Au=new w,Ru=new w,Cu=new w,Pu=new je,Iu=new je,Lu=new je,ms=class s{constructor(t=new w,e=new w,i=new w){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,n){n.subVectors(i,e),Tn.subVectors(t,e),n.cross(Tn);let r=n.lengthSq();return r>0?n.multiplyScalar(1/Math.sqrt(r)):n.set(0,0,0)}static getBarycoord(t,e,i,n,r){Tn.subVectors(n,e),us.subVectors(i,e),Tu.subVectors(t,e);let o=Tn.dot(Tn),a=Tn.dot(us),l=Tn.dot(Tu),c=us.dot(us),h=us.dot(Tu),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(c*l-a*h)*d,m=(o*h-a*l)*d;return r.set(1-f-m,m,f)}static containsPoint(t,e,i,n){return this.getBarycoord(t,e,i,n,ds)===null?!1:ds.x>=0&&ds.y>=0&&ds.x+ds.y<=1}static getInterpolation(t,e,i,n,r,o,a,l){return this.getBarycoord(t,e,i,n,ds)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ds.x),l.addScaledVector(o,ds.y),l.addScaledVector(a,ds.z),l)}static getInterpolatedAttribute(t,e,i,n,r,o){return Pu.setScalar(0),Iu.setScalar(0),Lu.setScalar(0),Pu.fromBufferAttribute(t,e),Iu.fromBufferAttribute(t,i),Lu.fromBufferAttribute(t,n),o.setScalar(0),o.addScaledVector(Pu,r.x),o.addScaledVector(Iu,r.y),o.addScaledVector(Lu,r.z),o}static isFrontFacing(t,e,i,n){return Tn.subVectors(i,e),us.subVectors(t,e),Tn.cross(us).dot(n)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,n){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[n]),this}setFromAttributeAndIndices(t,e,i,n){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,n),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Tn.subVectors(this.c,this.b),us.subVectors(this.a,this.b),Tn.cross(us).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return s.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return s.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,n,r){return s.getInterpolation(t,this.a,this.b,this.c,e,i,n,r)}containsPoint(t){return s.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return s.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,n=this.b,r=this.c,o,a;Dr.subVectors(n,i),Nr.subVectors(r,i),Au.subVectors(t,i);let l=Dr.dot(Au),c=Nr.dot(Au);if(l<=0&&c<=0)return e.copy(i);Ru.subVectors(t,n);let h=Dr.dot(Ru),u=Nr.dot(Ru);if(h>=0&&u<=h)return e.copy(n);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(i).addScaledVector(Dr,o);Cu.subVectors(t,r);let f=Dr.dot(Cu),m=Nr.dot(Cu);if(m>=0&&f<=m)return e.copy(r);let v=f*c-l*m;if(v<=0&&c>=0&&m<=0)return a=c/(c-m),e.copy(i).addScaledVector(Nr,a);let p=h*m-f*u;if(p<=0&&u-h>=0&&f-m>=0)return Kf.subVectors(r,n),a=(u-h)/(u-h+(f-m)),e.copy(n).addScaledVector(Kf,a);let g=1/(p+v+d);return o=v*g,a=d*g,e.copy(i).addScaledVector(Dr,o).addScaledVector(Nr,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},$n=class{constructor(t=new w(1/0,1/0,1/0),e=new w(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(An.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(An.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=An.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,An):An.fromBufferAttribute(r,o),An.applyMatrix4(t.matrixWorld),this.expandByPoint(An);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Dl.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Dl.copy(i.boundingBox)),Dl.applyMatrix4(t.matrixWorld),this.union(Dl)}let n=t.children;for(let r=0,o=n.length;r<o;r++)this.expandByObject(n[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,An),An.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ko),Nl.subVectors(this.max,Ko),Ur.subVectors(t.a,Ko),Fr.subVectors(t.b,Ko),Br.subVectors(t.c,Ko),Is.subVectors(Fr,Ur),Ls.subVectors(Br,Fr),nr.subVectors(Ur,Br);let e=[0,-Is.z,Is.y,0,-Ls.z,Ls.y,0,-nr.z,nr.y,Is.z,0,-Is.x,Ls.z,0,-Ls.x,nr.z,0,-nr.x,-Is.y,Is.x,0,-Ls.y,Ls.x,0,-nr.y,nr.x,0];return!Du(e,Ur,Fr,Br,Nl)||(e=[1,0,0,0,1,0,0,0,1],!Du(e,Ur,Fr,Br,Nl))?!1:(Ul.crossVectors(Is,Ls),e=[Ul.x,Ul.y,Ul.z],Du(e,Ur,Fr,Br,Nl))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,An).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(An).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(fs[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),fs[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),fs[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),fs[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),fs[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),fs[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),fs[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),fs[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(fs),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},fs=[new w,new w,new w,new w,new w,new w,new w,new w],An=new w,Dl=new $n,Ur=new w,Fr=new w,Br=new w,Is=new w,Ls=new w,nr=new w,Ko=new w,Nl=new w,Ul=new w,sr=new w;function Du(s,t,e,i,n){for(let r=0,o=s.length-3;r<=o;r+=3){sr.fromArray(s,r);let a=n.x*Math.abs(sr.x)+n.y*Math.abs(sr.y)+n.z*Math.abs(sr.z),l=t.dot(sr),c=e.dot(sr),h=i.dot(sr);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var fi=new w,Fl=new j,wg=0,ge=class extends Yn{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:wg++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=gd,this.updateRanges=[],this.gpuType=gn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let n=0,r=this.itemSize;n<r;n++)this.array[t+n]=e.array[i+n];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Fl.fromBufferAttribute(this,e),Fl.applyMatrix3(t),this.setXY(e,Fl.x,Fl.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)fi.fromBufferAttribute(this,e),fi.applyMatrix3(t),this.setXYZ(e,fi.x,fi.y,fi.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)fi.fromBufferAttribute(this,e),fi.applyMatrix4(t),this.setXYZ(e,fi.x,fi.y,fi.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)fi.fromBufferAttribute(this,e),fi.applyNormalMatrix(t),this.setXYZ(e,fi.x,fi.y,fi.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)fi.fromBufferAttribute(this,e),fi.transformDirection(t),this.setXYZ(e,fi.x,fi.y,fi.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=Rn(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=Be(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Rn(e,this.array)),e}setX(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Rn(e,this.array)),e}setY(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Rn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Rn(e,this.array)),e}setW(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),i=Be(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,n){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),i=Be(i,this.array),n=Be(n,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this}setXYZW(t,e,i,n,r){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),i=Be(i,this.array),n=Be(n,this.array),r=Be(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var xa=class extends ge{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var ya=class extends ge{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var Kt=class extends ge{constructor(t,e,i){super(new Float32Array(t),e,i)}},Tg=new $n,jo=new w,Nu=new w,vs=class{constructor(t=new w,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):Tg.setFromPoints(t).getCenter(i);let n=0;for(let r=0,o=t.length;r<o;r++)n=Math.max(n,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(n),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;jo.subVectors(t,this.center);let e=jo.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),n=(i-this.radius)*.5;this.center.addScaledVector(jo,n/i),this.radius+=n}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Nu.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(jo.copy(t.center).add(Nu)),this.expandByPoint(jo.copy(t.center).sub(Nu))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Ag=0,fn=new Me,Uu=new gi,Or=new w,nn=new $n,Qo=new $n,Ai=new w,le=class s extends Yn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ag++}),this.uuid=qn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(K0(t)?ya:xa)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new ie().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return fn.makeRotationFromQuaternion(t),this.applyMatrix4(fn),this}rotateX(t){return fn.makeRotationX(t),this.applyMatrix4(fn),this}rotateY(t){return fn.makeRotationY(t),this.applyMatrix4(fn),this}rotateZ(t){return fn.makeRotationZ(t),this.applyMatrix4(fn),this}translate(t,e,i){return fn.makeTranslation(t,e,i),this.applyMatrix4(fn),this}scale(t,e,i){return fn.makeScale(t,e,i),this.applyMatrix4(fn),this}lookAt(t){return Uu.lookAt(t),Uu.updateMatrix(),this.applyMatrix4(Uu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Or).negate(),this.translate(Or.x,Or.y,Or.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let n=0,r=t.length;n<r;n++){let o=t[n];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Kt(i,3))}else{let i=Math.min(t.length,e.count);for(let n=0;n<i;n++){let r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&jt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new $n);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){te("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new w(-1/0,-1/0,-1/0),new w(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,n=e.length;i<n;i++){let r=e[i];nn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ai.addVectors(this.boundingBox.min,nn.min),this.boundingBox.expandByPoint(Ai),Ai.addVectors(this.boundingBox.max,nn.max),this.boundingBox.expandByPoint(Ai)):(this.boundingBox.expandByPoint(nn.min),this.boundingBox.expandByPoint(nn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&te('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vs);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){te("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new w,1/0);return}if(t){let i=this.boundingSphere.center;if(nn.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];Qo.setFromBufferAttribute(a),this.morphTargetsRelative?(Ai.addVectors(nn.min,Qo.min),nn.expandByPoint(Ai),Ai.addVectors(nn.max,Qo.max),nn.expandByPoint(Ai)):(nn.expandByPoint(Qo.min),nn.expandByPoint(Qo.max))}nn.getCenter(i);let n=0;for(let r=0,o=t.count;r<o;r++)Ai.fromBufferAttribute(t,r),n=Math.max(n,i.distanceToSquared(Ai));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Ai.fromBufferAttribute(a,c),l&&(Or.fromBufferAttribute(t,c),Ai.add(Or)),n=Math.max(n,i.distanceToSquared(Ai))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&te('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){te("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,n=e.normal,r=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new ge(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let _=0;_<i.count;_++)a[_]=new w,l[_]=new w;let c=new w,h=new w,u=new w,d=new j,f=new j,m=new j,v=new w,p=new w;function g(_,R,P){c.fromBufferAttribute(i,_),h.fromBufferAttribute(i,R),u.fromBufferAttribute(i,P),d.fromBufferAttribute(r,_),f.fromBufferAttribute(r,R),m.fromBufferAttribute(r,P),h.sub(c),u.sub(c),f.sub(d),m.sub(d);let I=1/(f.x*m.y-m.x*f.y);isFinite(I)&&(v.copy(h).multiplyScalar(m.y).addScaledVector(u,-f.y).multiplyScalar(I),p.copy(u).multiplyScalar(f.x).addScaledVector(h,-m.x).multiplyScalar(I),a[_].add(v),a[R].add(v),a[P].add(v),l[_].add(p),l[R].add(p),l[P].add(p))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let _=0,R=x.length;_<R;++_){let P=x[_],I=P.start,N=P.count;for(let H=I,L=I+N;H<L;H+=3)g(t.getX(H+0),t.getX(H+1),t.getX(H+2))}let M=new w,y=new w,b=new w,E=new w;function A(_){b.fromBufferAttribute(n,_),E.copy(b);let R=a[_];M.copy(R),M.sub(b.multiplyScalar(b.dot(R))).normalize(),y.crossVectors(E,R);let I=y.dot(l[_])<0?-1:1;o.setXYZW(_,M.x,M.y,M.z,I)}for(let _=0,R=x.length;_<R;++_){let P=x[_],I=P.start,N=P.count;for(let H=I,L=I+N;H<L;H+=3)A(t.getX(H+0)),A(t.getX(H+1)),A(t.getX(H+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new ge(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let n=new w,r=new w,o=new w,a=new w,l=new w,c=new w,h=new w,u=new w;if(t)for(let d=0,f=t.count;d<f;d+=3){let m=t.getX(d+0),v=t.getX(d+1),p=t.getX(d+2);n.fromBufferAttribute(e,m),r.fromBufferAttribute(e,v),o.fromBufferAttribute(e,p),h.subVectors(o,r),u.subVectors(n,r),h.cross(u),a.fromBufferAttribute(i,m),l.fromBufferAttribute(i,v),c.fromBufferAttribute(i,p),a.add(h),l.add(h),c.add(h),i.setXYZ(m,a.x,a.y,a.z),i.setXYZ(v,l.x,l.y,l.z),i.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)n.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,r),u.subVectors(n,r),h.cross(u),i.setXYZ(d+0,h.x,h.y,h.z),i.setXYZ(d+1,h.x,h.y,h.z),i.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Ai.fromBufferAttribute(t,e),Ai.normalize(),t.setXYZ(e,Ai.x,Ai.y,Ai.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h),f=0,m=0;for(let v=0,p=l.length;v<p;v++){a.isInterleavedBufferAttribute?f=l[v]*a.data.stride+a.offset:f=l[v]*h;for(let g=0;g<h;g++)d[m++]=c[f++]}return new ge(d,h,u)}if(this.index===null)return jt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new s,i=this.index.array,n=this.attributes;for(let a in n){let l=n[a],c=t(l,i);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=t(d,i);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let n={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(n[l]=h,r=!0)}r&&(t.data.morphAttributes=n,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let n=t.attributes;for(let c in n){let h=n[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},_a=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=gd,this.updateRanges=[],this.version=0,this.uuid=qn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,i){t*=this.stride,i*=e.stride;for(let n=0,r=this.stride;n<r;n++)this.array[t+n]=e.array[i+n];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=qn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(e,this.stride);return i.setUsage(this.usage),i}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=qn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}},Vi=new w,to=class s{constructor(t,e,i,n=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=i,this.normalized=n}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,i=this.data.count;e<i;e++)Vi.fromBufferAttribute(this,e),Vi.applyMatrix4(t),this.setXYZ(e,Vi.x,Vi.y,Vi.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Vi.fromBufferAttribute(this,e),Vi.applyNormalMatrix(t),this.setXYZ(e,Vi.x,Vi.y,Vi.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Vi.fromBufferAttribute(this,e),Vi.transformDirection(t),this.setXYZ(e,Vi.x,Vi.y,Vi.z);return this}getComponent(t,e){let i=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(i=Rn(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=Be(i,this.array)),this.data.array[t*this.data.stride+this.offset+e]=i,this}setX(t,e){return this.normalized&&(e=Be(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=Be(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=Be(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=Be(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Rn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Rn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Rn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Rn(e,this.array)),e}setXY(t,e,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=Be(e,this.array),i=Be(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this}setXYZ(t,e,i,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=Be(e,this.array),i=Be(i,this.array),n=Be(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=n,this}setXYZW(t,e,i,n,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=Be(e,this.array),i=Be(i,this.array),n=Be(n,this.array),r=Be(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=n,this.data.array[t+3]=r,this}clone(t){if(t===void 0){pa("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let n=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[n+r])}return new ge(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new s(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){pa("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let n=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[n+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Fu=new w,Rg=new w,Cg=new ie,Gi=class{constructor(t=new w(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,n){return this.normal.set(t,e,i),this.constant=n,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let n=Fu.subVectors(i,e).cross(Rg.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(n,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let n=t.delta(Fu),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/r;return i===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(n,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||Cg.getNormalMatrix(t),n=this.coplanarPoint(Fu).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Pg=0,Jn=class extends Yn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Pg++}),this.uuid=qn(),this.name="",this.type="Material",this.blending=mn,this.side=Hs,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=od,this.blendDst=ad,this.blendEquation=fr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new St(0,0,0),this.blendAlpha=0,this.depthFunc=Zr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=qp,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=sc,this.stencilZFail=sc,this.stencilZPass=sc,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){jt(`Material: parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){jt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(e){let r=n(t.textures),o=n(t.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new St().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new Gi().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new j().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new j().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let n=e.length;i=new Array(n);for(let r=0;r!==n;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},eo=class extends Jn{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new St(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Hr,ta=new w,zr=new w,kr=new w,Vr=new j,ea=new j,nm=new Me,Bl=new w,ia=new w,Ol=new w,jf=new j,Bu=new j,Qf=new j,Ma=class extends gi{constructor(t=new eo){if(super(),this.isSprite=!0,this.type="Sprite",Hr===void 0){Hr=new le;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new _a(e,5);Hr.setIndex([0,1,2,0,2,3]),Hr.setAttribute("position",new to(i,3,0,!1)),Hr.setAttribute("uv",new to(i,2,3,!1))}this.geometry=Hr,this.material=t,this.center=new j(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&te('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),zr.setFromMatrixScale(this.matrixWorld),nm.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),kr.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&zr.multiplyScalar(-kr.z);let i=this.material.rotation,n,r;i!==0&&(r=Math.cos(i),n=Math.sin(i));let o=this.center;Hl(Bl.set(-.5,-.5,0),kr,o,zr,n,r),Hl(ia.set(.5,-.5,0),kr,o,zr,n,r),Hl(Ol.set(.5,.5,0),kr,o,zr,n,r),jf.set(0,0),Bu.set(1,0),Qf.set(1,1);let a=t.ray.intersectTriangle(Bl,ia,Ol,!1,ta);if(a===null&&(Hl(ia.set(-.5,.5,0),kr,o,zr,n,r),Bu.set(0,1),a=t.ray.intersectTriangle(Bl,Ol,ia,!1,ta),a===null))return;let l=t.ray.origin.distanceTo(ta);l<t.near||l>t.far||e.push({distance:l,point:ta.clone(),uv:ms.getInterpolation(ta,Bl,ia,Ol,jf,Bu,Qf,new j),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function Hl(s,t,e,i,n,r){Vr.subVectors(s,e).addScalar(.5).multiply(i),n!==void 0?(ea.x=r*Vr.x-n*Vr.y,ea.y=n*Vr.x+r*Vr.y):ea.copy(Vr),s.copy(t),s.x+=ea.x,s.y+=ea.y,s.applyMatrix4(nm)}var ps=new w,Ou=new w,zl=new w,kl=new w,ba=class{constructor(t=new w,e=new w(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ps)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=ps.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ps.copy(this.origin).addScaledVector(this.direction,e),ps.distanceToSquared(t))}distanceSqToSegment(t,e,i,n){Ou.copy(t).add(e).multiplyScalar(.5),zl.copy(e).sub(t).normalize(),kl.copy(this.origin).sub(Ou);let r=t.distanceTo(e)*.5,o=-this.direction.dot(zl),a=kl.dot(this.direction),l=-kl.dot(zl),c=kl.lengthSq(),h=Math.abs(1-o*o),u,d,f,m;if(h>0)if(u=o*l-a,d=o*a-l,m=r*h,u>=0)if(d>=-m)if(d<=m){let v=1/h;u*=v,d*=v,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-m?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=m?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),n&&n.copy(Ou).addScaledVector(zl,d),f}intersectSphere(t,e){if(t.radius<0)return null;ps.subVectors(t.center,this.origin);let i=ps.dot(this.direction),n=ps.dot(ps)-i*i,r=t.radius*t.radius;if(n>r)return null;let o=Math.sqrt(r-n),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,n,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(i=(t.min.x-d.x)*c,n=(t.max.x-d.x)*c):(i=(t.max.x-d.x)*c,n=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),i>o||r>n||((r>i||isNaN(i))&&(i=r),(o<n||isNaN(n))&&(n=o),u>=0?(a=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),i>l||a>n)||((a>i||i!==i)&&(i=a),(l<n||n!==n)&&(n=l),n<0)?null:this.at(i>=0?i:n,e)}intersectsBox(t){return this.intersectBox(t,ps)!==null}intersectTriangle(t,e,i,n,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,u=t.x-o.x,d=t.y-o.y,f=t.z-o.z,m=e.x-o.x,v=e.y-o.y,p=e.z-o.z,g=i.x-o.x,x=i.y-o.y,M=i.z-o.z,y=Math.abs(l),b=Math.abs(c),E=Math.abs(h),A,_,R,P,I,N,H,L,B,q,Y,rt;if(y>=b&&y>=E?(R=l,N=u,B=m,rt=g,l>=0?(A=c,_=h,P=d,I=f,H=v,L=p,q=x,Y=M):(A=h,_=c,P=f,I=d,H=p,L=v,q=M,Y=x)):b>=E?(R=c,N=d,B=v,rt=x,c>=0?(A=h,_=l,P=f,I=u,H=p,L=m,q=M,Y=g):(A=l,_=h,P=u,I=f,H=m,L=p,q=g,Y=M)):(R=h,N=f,B=p,rt=M,h>=0?(A=l,_=c,P=u,I=d,H=m,L=v,q=g,Y=x):(A=c,_=l,P=d,I=u,H=v,L=m,q=x,Y=g)),R===0)return null;let Z=A/R,tt=_/R,nt=1/R,Dt=P-Z*N,Pt=I-tt*N,ce=H-Z*B,oe=L-tt*B,ae=q-Z*rt,X=Y-tt*rt,Q=ae*oe-X*ce,vt=Dt*X-Pt*ae,Wt=ce*Pt-oe*Dt;if(n){if(Q<0||vt<0||Wt<0)return null}else if((Q<0||vt<0||Wt<0)&&(Q>0||vt>0||Wt>0))return null;let Et=Q+vt+Wt;if(Et===0)return null;let Yt=nt*(Q*N+vt*B+Wt*rt);return(Et>0?Yt<0:Yt>0)?null:this.at(Yt/Et,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ve=class extends Jn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new St(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pn,this.combine=ld,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},tp=new Me,rr=new ba,Vl=new vs,ep=new w,Gl=new w,Wl=new w,ql=new w,Hu=new w,Xl=new w,ip=new w,Yl=new w,ot=class extends gi{constructor(t=new le,e=new ve){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){let a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let i=this.geometry,n=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;e.fromBufferAttribute(n,t);let a=this.morphTargetInfluences;if(r&&a){Xl.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(Hu.fromBufferAttribute(u,t),o?Xl.addScaledVector(Hu,h):Xl.addScaledVector(Hu.sub(e),h))}e.add(Xl)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.material,r=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Vl.copy(i.boundingSphere),Vl.applyMatrix4(r),rr.copy(t.ray).recast(t.near),!(Vl.containsPoint(rr.origin)===!1&&(rr.intersectSphere(Vl,ep)===null||rr.origin.distanceToSquared(ep)>(t.far-t.near)**2))&&(tp.copy(r).invert(),rr.copy(t.ray).applyMatrix4(tp),!(i.boundingBox!==null&&rr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,rr)))}_computeIntersections(t,e,i){let n,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let m=0,v=d.length;m<v;m++){let p=d[m],g=o[p.materialIndex],x=Math.max(p.start,f.start),M=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let y=x,b=M;y<b;y+=3){let E=a.getX(y),A=a.getX(y+1),_=a.getX(y+2);n=Zl(this,g,t,i,c,h,u,E,A,_),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=p.materialIndex,e.push(n))}}else{let m=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let p=m,g=v;p<g;p+=3){let x=a.getX(p),M=a.getX(p+1),y=a.getX(p+2);n=Zl(this,o,t,i,c,h,u,x,M,y),n&&(n.faceIndex=Math.floor(p/3),e.push(n))}}else if(l!==void 0)if(Array.isArray(o))for(let m=0,v=d.length;m<v;m++){let p=d[m],g=o[p.materialIndex],x=Math.max(p.start,f.start),M=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let y=x,b=M;y<b;y+=3){let E=y,A=y+1,_=y+2;n=Zl(this,g,t,i,c,h,u,E,A,_),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=p.materialIndex,e.push(n))}}else{let m=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let p=m,g=v;p<g;p+=3){let x=p,M=p+1,y=p+2;n=Zl(this,o,t,i,c,h,u,x,M,y),n&&(n.faceIndex=Math.floor(p/3),e.push(n))}}}};function Ig(s,t,e,i,n,r,o,a){let l;if(t.side===_i?l=i.intersectTriangle(o,r,n,!0,a):l=i.intersectTriangle(n,r,o,t.side===Hs,a),l===null)return null;Yl.copy(a),Yl.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(Yl);return c<e.near||c>e.far?null:{distance:c,point:Yl.clone(),object:s}}function Zl(s,t,e,i,n,r,o,a,l,c){s.getVertexPosition(a,Gl),s.getVertexPosition(l,Wl),s.getVertexPosition(c,ql);let h=Ig(s,t,e,i,Gl,Wl,ql,ip);if(h){let u=new w;ms.getBarycoord(ip,Gl,Wl,ql,u),n&&(h.uv=ms.getInterpolatedAttribute(n,a,l,c,u,new j)),r&&(h.uv1=ms.getInterpolatedAttribute(r,a,l,c,u,new j)),o&&(h.normal=ms.getInterpolatedAttribute(o,a,l,c,u,new w),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new w,materialIndex:0};ms.getNormal(Gl,Wl,ql,d.normal),h.face=d,h.barycoord=u}return h}var Sa=class extends Wi{constructor(t=null,e=1,i=1,n,r,o,a,l,c=pi,h=pi,u,d){super(null,o,a,l,c,h,n,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Kn=class extends ge{constructor(t,e,i,n=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Gr=new Me,np=new Me,$l=[],sp=new $n,Lg=new Me,na=new ot,sa=new vs,xs=class extends ot{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Kn(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,Lg)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new $n),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Gr),sp.copy(t.boundingBox).applyMatrix4(Gr),this.boundingBox.union(sp)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new vs),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Gr),sa.copy(t.boundingSphere).applyMatrix4(Gr),this.boundingSphere.union(sa)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,n=this.morphTexture.source.data.data,r=i.length+1,o=t*r+1;for(let a=0;a<i.length;a++)i[a]=n[o+a]}raycast(t,e){let i=this.matrixWorld,n=this.count;if(na.geometry=this.geometry,na.material=this.material,na.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),sa.copy(this.boundingSphere),sa.applyMatrix4(i),t.ray.intersectsSphere(sa)!==!1))for(let r=0;r<n;r++){this.getMatrixAt(r,Gr),np.multiplyMatrices(i,Gr),na.matrixWorld=np,na.raycast(t,$l);for(let o=0,a=$l.length;o<a;o++){let l=$l[o];l.instanceId=r,l.object=this,e.push(l)}$l.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Kn(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new Sa(new Float32Array(n*this.count),n,this.count,Wc,gn));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=n*t;return r[l]=a,r.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},or=new vs,Dg=new j(.5,.5),Jl=new w,io=class{constructor(t=new Gi,e=new Gi,i=new Gi,n=new Gi,r=new Gi,o=new Gi){this.planes=[t,e,i,n,r,o]}set(t,e,i,n,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(i),a[3].copy(n),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Cn,i=!1){let n=this.planes,r=t.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],m=r[8],v=r[9],p=r[10],g=r[11],x=r[12],M=r[13],y=r[14],b=r[15];if(n[0].setComponents(c-o,f-h,g-m,b-x).normalize(),n[1].setComponents(c+o,f+h,g+m,b+x).normalize(),n[2].setComponents(c+a,f+u,g+v,b+M).normalize(),n[3].setComponents(c-a,f-u,g-v,b-M).normalize(),i)n[4].setComponents(l,d,p,y).normalize(),n[5].setComponents(c-l,f-d,g-p,b-y).normalize();else if(n[4].setComponents(c-l,f-d,g-p,b-y).normalize(),e===Cn)n[5].setComponents(c+l,f+d,g+p,b+y).normalize();else if(e===$r)n[5].setComponents(l,d,p,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),or.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),or.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(or)}intersectsSprite(t){or.center.set(0,0,0);let e=Dg.distanceTo(t.center);return or.radius=.7071067811865476+e,or.applyMatrix4(t.matrixWorld),this.intersectsSphere(or)}intersectsSphere(t){let e=this.planes,i=t.center,n=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<n)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let n=e[i];if(Jl.x=n.normal.x>0?t.max.x:t.min.x,Jl.y=n.normal.y>0?t.max.y:t.min.y,Jl.z=n.normal.z>0?t.max.z:t.min.z,n.distanceToPoint(Jl)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var vc=class extends Jn{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new St(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},rp=new Me,$u=new ba,Kl=new vs,jl=new w,no=class extends gi{constructor(t=new le,e=new vc){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,r=t.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Kl.copy(i.boundingSphere),Kl.applyMatrix4(n),Kl.radius+=r,t.ray.intersectsSphere(Kl)===!1)return;rp.copy(n).invert(),$u.copy(t.ray).applyMatrix4(rp);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,u=i.attributes.position;if(c!==null){let d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let m=d,v=f;m<v;m++){let p=c.getX(m);jl.fromBufferAttribute(u,p),op(jl,p,l,n,t,e,this)}}else{let d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let m=d,v=f;m<v;m++)jl.fromBufferAttribute(u,m),op(jl,m,l,n,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){let a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function op(s,t,e,i,n,r,o){let a=$u.distanceSqToPoint(s);if(a<e){let l=new w;$u.closestPointToPoint(s,l),l.applyMatrix4(i);let c=n.ray.origin.distanceTo(l);if(c<n.near||c>n.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Ea=class extends Wi{constructor(t=[],e=zs,i,n,r,o,a,l,c,h){super(t,e,i,n,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},ri=class extends Wi{constructor(t,e,i,n,r,o,a,l,c){super(t,e,i,n,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Ns=class extends Wi{constructor(t,e,i=Nn,n,r,o,a=pi,l=pi,c,h=Xn,u=1){if(h!==Xn&&h!==Vs)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:u};super(d,n,r,o,a,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new jr(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},xc=class extends Ns{constructor(t,e=Nn,i=zs,n,r,o=pi,a=pi,l,c=Xn){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,i,n,r,o,a,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},wa=class extends Wi{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},qe=class s extends le{constructor(t=1,e=1,i=1,n=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:n,heightSegments:r,depthSegments:o};let a=this;n=Math.floor(n),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],d=0,f=0;m("z","y","x",-1,-1,i,e,t,o,r,0),m("z","y","x",1,-1,i,e,-t,o,r,1),m("x","z","y",1,1,t,i,e,n,o,2),m("x","z","y",1,-1,t,i,-e,n,o,3),m("x","y","z",1,-1,t,e,i,n,r,4),m("x","y","z",-1,-1,t,e,-i,n,r,5),this.setIndex(l),this.setAttribute("position",new Kt(c,3)),this.setAttribute("normal",new Kt(h,3)),this.setAttribute("uv",new Kt(u,2));function m(v,p,g,x,M,y,b,E,A,_,R){let P=y/A,I=b/_,N=y/2,H=b/2,L=E/2,B=A+1,q=_+1,Y=0,rt=0,Z=new w;for(let tt=0;tt<q;tt++){let nt=tt*I-H;for(let Dt=0;Dt<B;Dt++){let Pt=Dt*P-N;Z[v]=Pt*x,Z[p]=nt*M,Z[g]=L,c.push(Z.x,Z.y,Z.z),Z[v]=0,Z[p]=0,Z[g]=E>0?1:-1,h.push(Z.x,Z.y,Z.z),u.push(Dt/A),u.push(1-tt/_),Y+=1}}for(let tt=0;tt<_;tt++)for(let nt=0;nt<A;nt++){let Dt=d+nt+B*tt,Pt=d+nt+B*(tt+1),ce=d+(nt+1)+B*(tt+1),oe=d+(nt+1)+B*tt;l.push(Dt,Pt,oe),l.push(Pt,ce,oe),rt+=6}a.addGroup(f,rt,R),f+=rt,d+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var In=class s extends le{constructor(t=1,e=32,i=0,n=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:n},e=Math.max(3,e);let r=[],o=[],a=[],l=[],c=new w,h=new j;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=e;u++,d+=3){let f=i+u/e*n;c.x=t*Math.cos(f),c.y=t*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[d]/t+1)/2,h.y=(o[d+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new Kt(o,3)),this.setAttribute("normal",new Kt(a,3)),this.setAttribute("uv",new Kt(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Oe=class s extends le{constructor(t=1,e=1,i=1,n=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:n,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;n=Math.floor(n),r=Math.floor(r);let h=[],u=[],d=[],f=[],m=0,v=[],p=i/2,g=0;x(),o===!1&&(t>0&&M(!0),e>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new Kt(u,3)),this.setAttribute("normal",new Kt(d,3)),this.setAttribute("uv",new Kt(f,2));function x(){let y=new w,b=new w,E=0,A=(e-t)/i;for(let _=0;_<=r;_++){let R=[],P=_/r,I=P*(e-t)+t;for(let N=0;N<=n;N++){let H=N/n,L=H*l+a,B=Math.sin(L),q=Math.cos(L);b.x=I*B,b.y=-P*i+p,b.z=I*q,u.push(b.x,b.y,b.z),y.set(B,A,q).normalize(),d.push(y.x,y.y,y.z),f.push(H,1-P),R.push(m++)}v.push(R)}for(let _=0;_<n;_++)for(let R=0;R<r;R++){let P=v[R][_],I=v[R+1][_],N=v[R+1][_+1],H=v[R][_+1];(t>0||R!==0)&&(h.push(P,I,H),E+=3),(e>0||R!==r-1)&&(h.push(I,N,H),E+=3)}c.addGroup(g,E,0),g+=E}function M(y){let b=m,E=new j,A=new w,_=0,R=y===!0?t:e,P=y===!0?1:-1;for(let N=1;N<=n;N++)u.push(0,p*P,0),d.push(0,P,0),f.push(.5,.5),m++;let I=m;for(let N=0;N<=n;N++){let L=N/n*l+a,B=Math.cos(L),q=Math.sin(L);A.x=R*q,A.y=p*P,A.z=R*B,u.push(A.x,A.y,A.z),d.push(0,P,0),E.x=B*.5+.5,E.y=q*.5*P+.5,f.push(E.x,E.y),m++}for(let N=0;N<n;N++){let H=b+N,L=I+N;y===!0?h.push(L,L+1,H):h.push(L+1,L,H),_+=3}c.addGroup(g,_,y===!0?1:2),g+=_}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ys=class s extends Oe{constructor(t=1,e=1,i=32,n=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,i,n,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:n,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new s(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},yc=class s extends le{constructor(t=[],e=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:n};let r=[],o=[];a(n),c(i),h(),this.setAttribute("position",new Kt(r,3)),this.setAttribute("normal",new Kt(r.slice(),3)),this.setAttribute("uv",new Kt(o,2)),n===0?this.computeVertexNormals():this.normalizeNormals();function a(x){let M=new w,y=new w,b=new w;for(let E=0;E<e.length;E+=3)f(e[E+0],M),f(e[E+1],y),f(e[E+2],b),l(M,y,b,x)}function l(x,M,y,b){let E=b+1,A=[];for(let _=0;_<=E;_++){A[_]=[];let R=x.clone().lerp(y,_/E),P=M.clone().lerp(y,_/E),I=E-_;for(let N=0;N<=I;N++)N===0&&_===E?A[_][N]=R:A[_][N]=R.clone().lerp(P,N/I)}for(let _=0;_<E;_++)for(let R=0;R<2*(E-_)-1;R++){let P=Math.floor(R/2);R%2===0?(d(A[_][P+1]),d(A[_+1][P]),d(A[_][P])):(d(A[_][P+1]),d(A[_+1][P+1]),d(A[_+1][P]))}}function c(x){let M=new w;for(let y=0;y<r.length;y+=3)M.x=r[y+0],M.y=r[y+1],M.z=r[y+2],M.normalize().multiplyScalar(x),r[y+0]=M.x,r[y+1]=M.y,r[y+2]=M.z}function h(){let x=new w;for(let M=0;M<r.length;M+=3){x.x=r[M+0],x.y=r[M+1],x.z=r[M+2];let y=p(x)/2/Math.PI+.5,b=g(x)/Math.PI+.5;o.push(y,1-b)}m(),u()}function u(){for(let x=0;x<o.length;x+=6){let M=o[x+0],y=o[x+2],b=o[x+4],E=Math.max(M,y,b),A=Math.min(M,y,b);E>.9&&A<.1&&(M<.2&&(o[x+0]+=1),y<.2&&(o[x+2]+=1),b<.2&&(o[x+4]+=1))}}function d(x){r.push(x.x,x.y,x.z)}function f(x,M){let y=x*3;M.x=t[y+0],M.y=t[y+1],M.z=t[y+2]}function m(){let x=new w,M=new w,y=new w,b=new w,E=new j,A=new j,_=new j;for(let R=0,P=0;R<r.length;R+=9,P+=6){x.set(r[R+0],r[R+1],r[R+2]),M.set(r[R+3],r[R+4],r[R+5]),y.set(r[R+6],r[R+7],r[R+8]),E.set(o[P+0],o[P+1]),A.set(o[P+2],o[P+3]),_.set(o[P+4],o[P+5]),b.copy(x).add(M).add(y).divideScalar(3);let I=p(b);v(E,P+0,x,I),v(A,P+2,M,I),v(_,P+4,y,I)}}function v(x,M,y,b){b<0&&x.x===1&&(o[M]=x.x-1),y.x===0&&y.z===0&&(o[M]=b/2/Math.PI+.5)}function p(x){return Math.atan2(x.z,-x.x)}function g(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.vertices,t.indices,t.radius,t.detail)}};var sn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){jt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let i=this.getUtoTmapping(t);return this.getPoint(i,e)}getPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return e}getSpacedPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPointAt(i/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],i,n=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)i=this.getPoint(o/t),r+=i.distanceTo(n),e.push(r),n=i;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let i=this.getLengths(),n=0,r=i.length,o;e?o=e:o=t*i[r-1];let a=0,l=r-1,c;for(;a<=l;)if(n=Math.floor(a+(l-a)/2),c=i[n]-o,c<0)a=n+1;else if(c>0)l=n-1;else{l=n;break}if(n=l,i[n]===o)return n/(r-1);let h=i[n],d=i[n+1]-h,f=(o-h)/d;return(n+f)/(r-1)}getTangent(t,e){let n=t-1e-4,r=t+1e-4;n<0&&(n=0),r>1&&(r=1);let o=this.getPoint(n),a=this.getPoint(r),l=e||(o.isVector2?new j:new w);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){let i=this.getUtoTmapping(t);return this.getTangent(i,e)}computeFrenetFrames(t,e=!1){let i=new w,n=[],r=[],o=[],a=new w,l=new Me;for(let f=0;f<=t;f++){let m=f/t;n[f]=this.getTangentAt(m,new w)}r[0]=new w,o[0]=new w;let c=Number.MAX_VALUE,h=Math.abs(n[0].x),u=Math.abs(n[0].y),d=Math.abs(n[0].z);h<=c&&(c=h,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),d<=c&&i.set(0,0,1),a.crossVectors(n[0],i).normalize(),r[0].crossVectors(n[0],a),o[0].crossVectors(n[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(n[f-1],n[f]),a.length()>Number.EPSILON){a.normalize();let m=Math.acos(de(n[f-1].dot(n[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,m))}o[f].crossVectors(n[f],r[f])}if(e===!0){let f=Math.acos(de(r[0].dot(r[t]),-1,1));f/=t,n[0].dot(a.crossVectors(r[0],r[t]))>0&&(f=-f);for(let m=1;m<=t;m++)r[m].applyMatrix4(l.makeRotationAxis(n[m],f*m)),o[m].crossVectors(n[m],r[m])}return{tangents:n,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},so=class extends sn{constructor(t=0,e=0,i=1,n=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=i,this.yRadius=n,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new j){let i=e,n=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=n;for(;r>n;)r-=n;r<Number.EPSILON&&(o?r=0:r=n),this.aClockwise===!0&&!o&&(r===n?r=-n:r=r-n);let a=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return i.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},_c=class extends so{constructor(t,e,i,n,r,o){super(t,e,i,i,n,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function yd(){let s=0,t=0,e=0,i=0;function n(r,o,a,l){s=r,t=a,e=-3*r+3*o-2*a-l,i=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){n(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,f*=h,n(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return s+t*r+e*o+i*a}}}var ap=new w,lp=new w,zu=new yd,ku=new yd,Vu=new yd,ro=class extends sn{constructor(t=[],e=!1,i="centripetal",n=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=i,this.tension=n}getPoint(t,e=new w){let i=e,n=this.points,r=n.length,o=(r-(this.closed?0:1))*t,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=n[(a-1)%r]:(lp.subVectors(n[0],n[1]).add(n[0]),c=lp);let u=n[a%r],d=n[(a+1)%r];if(this.closed||a+2<r?h=n[(a+2)%r]:(ap.subVectors(n[r-1],n[r-2]).add(n[r-1]),h=ap),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(u),f),v=Math.pow(u.distanceToSquared(d),f),p=Math.pow(d.distanceToSquared(h),f);v<1e-4&&(v=1),m<1e-4&&(m=v),p<1e-4&&(p=v),zu.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,m,v,p),ku.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,m,v,p),Vu.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,m,v,p)}else this.curveType==="catmullrom"&&(zu.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),ku.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),Vu.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return i.set(zu.calc(l),ku.calc(l),Vu.calc(l)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(n.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let n=this.points[e];t.points.push(n.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(new w().fromArray(n))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function cp(s,t,e,i,n){let r=(i-t)*.5,o=(n-e)*.5,a=s*s,l=s*a;return(2*e-2*i+r+o)*l+(-3*e+3*i-2*r-o)*a+r*s+e}function Ng(s,t){let e=1-s;return e*e*t}function Ug(s,t){return 2*(1-s)*s*t}function Fg(s,t){return s*s*t}function la(s,t,e,i){return Ng(s,t)+Ug(s,e)+Fg(s,i)}function Bg(s,t){let e=1-s;return e*e*e*t}function Og(s,t){let e=1-s;return 3*e*e*s*t}function Hg(s,t){return 3*(1-s)*s*s*t}function zg(s,t){return s*s*s*t}function ca(s,t,e,i,n){return Bg(s,t)+Og(s,e)+Hg(s,i)+zg(s,n)}var Ta=class extends sn{constructor(t=new j,e=new j,i=new j,n=new j){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=i,this.v3=n}getPoint(t,e=new j){let i=e,n=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(ca(t,n.x,r.x,o.x,a.x),ca(t,n.y,r.y,o.y,a.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Mc=class extends sn{constructor(t=new w,e=new w,i=new w,n=new w){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=i,this.v3=n}getPoint(t,e=new w){let i=e,n=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(ca(t,n.x,r.x,o.x,a.x),ca(t,n.y,r.y,o.y,a.y),ca(t,n.z,r.z,o.z,a.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Aa=class extends sn{constructor(t=new j,e=new j){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new j){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new j){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},oo=class extends sn{constructor(t=new w,e=new w){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new w){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new w){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Ra=class extends sn{constructor(t=new j,e=new j,i=new j){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new j){let i=e,n=this.v0,r=this.v1,o=this.v2;return i.set(la(t,n.x,r.x,o.x),la(t,n.y,r.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Ca=class extends sn{constructor(t=new w,e=new w,i=new w){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new w){let i=e,n=this.v0,r=this.v1,o=this.v2;return i.set(la(t,n.x,r.x,o.x),la(t,n.y,r.y,o.y),la(t,n.z,r.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Pa=class extends sn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new j){let i=e,n=this.points,r=(n.length-1)*t,o=Math.floor(r),a=r-o,l=n[o===0?o:o-1],c=n[o],h=n[o>n.length-2?n.length-1:o+1],u=n[o>n.length-3?n.length-1:o+2];return i.set(cp(a,l.x,c.x,h.x,u.x),cp(a,l.y,c.y,h.y,u.y)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(n.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let n=this.points[e];t.points.push(n.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(new j().fromArray(n))}return this}},bc=Object.freeze({__proto__:null,ArcCurve:_c,CatmullRomCurve3:ro,CubicBezierCurve:Ta,CubicBezierCurve3:Mc,EllipseCurve:so,LineCurve:Aa,LineCurve3:oo,QuadraticBezierCurve:Ra,QuadraticBezierCurve3:Ca,SplineCurve:Pa}),ao=class extends sn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let i=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new bc[i](e,t))}return this}getPoint(t,e){let i=t*this.getLength(),n=this.getCurveLengths(),r=0;for(;r<n.length;){if(n[r]>=i){let o=n[r]-i,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let i=0,n=this.curves.length;i<n;i++)e+=this.curves[i].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],i;for(let n=0,r=this.curves;n<r.length;n++){let o=r[n],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(e.push(h),i=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let n=t.curves[e];this.curves.push(n.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,i=this.curves.length;e<i;e++){let n=this.curves[e];t.curves.push(n.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let n=t.curves[e];this.curves.push(new bc[n.type]().fromJSON(n))}return this}},Ia=class extends ao{constructor(t){super(),this.type="Path",this.currentPoint=new j,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,i=t.length;e<i;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let i=new Aa(this.currentPoint.clone(),new j(t,e));return this.curves.push(i),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,i,n){let r=new Ra(this.currentPoint.clone(),new j(t,e),new j(i,n));return this.curves.push(r),this.currentPoint.set(i,n),this}bezierCurveTo(t,e,i,n,r,o){let a=new Ta(this.currentPoint.clone(),new j(t,e),new j(i,n),new j(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),i=new Pa(e);return this.curves.push(i),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,i,n,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,i,n,r,o),this}absarc(t,e,i,n,r,o){return this.absellipse(t,e,i,i,n,r,o),this}ellipse(t,e,i,n,r,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,i,n,r,o,a,l),this}absellipse(t,e,i,n,r,o,a,l){let c=new so(t,e,i,n,r,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Ln=class extends Ia{constructor(t){super(t),this.uuid=qn(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let i=0,n=this.holes.length;i<n;i++)e[i]=this.holes[i].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let n=t.holes[e];this.holes.push(n.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,i=this.holes.length;e<i;e++){let n=this.holes[e];t.holes.push(n.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let n=t.holes[e];this.holes.push(new Ia().fromJSON(n))}return this}};function kg(s,t,e=2){let i=t&&t.length,n=i?t[0]*e:s.length,r=sm(s,0,n,e,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(i&&(r=Xg(s,t,r,e)),s.length>80*e){a=s[0],l=s[1];let h=a,u=l;for(let d=e;d<n;d+=e){let f=s[d],m=s[d+1];f<a&&(a=f),m<l&&(l=m),f>h&&(h=f),m>u&&(u=m)}c=Math.max(h-a,u-l),c=c!==0?32767/c:0}return La(r,o,e,a,l,c,0),o}function sm(s,t,e,i,n){let r;if(n===nv(s,t,e,i)>0)for(let o=t;o<e;o+=i)r=hp(o/i|0,s[o],s[o+1],r);else for(let o=e-i;o>=t;o-=i)r=hp(o/i|0,s[o],s[o+1],r);return r&&lo(r,r.next)&&(Na(r),r=r.next),r}function lr(s,t){if(!s)return s;t||(t=s);let e=s,i;do if(i=!1,!e.steiner&&(lo(e,e.next)||ii(e.prev,e,e.next)===0)){if(Na(e),e=t=e.prev,e===e.next)break;i=!0}else e=e.next;while(i||e!==t);return t}function La(s,t,e,i,n,r,o){if(!s)return;!o&&r&&Kg(s,i,n,r);let a=s;for(;s.prev!==s.next;){let l=s.prev,c=s.next;if(r?Gg(s,i,n,r):Vg(s)){t.push(l.i,s.i,c.i),Na(s),s=c.next,a=c.next;continue}if(s=c,s===a){o?o===1?(s=Wg(lr(s),t),La(s,t,e,i,n,r,2)):o===2&&qg(s,t,e,i,n,r):La(lr(s),t,e,i,n,r,1);break}}}function Vg(s){let t=s.prev,e=s,i=s.next;if(ii(t,e,i)>=0)return!1;let n=t.x,r=e.x,o=i.x,a=t.y,l=e.y,c=i.y,h=Math.min(n,r,o),u=Math.min(a,l,c),d=Math.max(n,r,o),f=Math.max(a,l,c),m=i.next;for(;m!==t;){if(m.x>=h&&m.x<=d&&m.y>=u&&m.y<=f&&ra(n,a,r,l,o,c,m.x,m.y)&&ii(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function Gg(s,t,e,i){let n=s.prev,r=s,o=s.next;if(ii(n,r,o)>=0)return!1;let a=n.x,l=r.x,c=o.x,h=n.y,u=r.y,d=o.y,f=Math.min(a,l,c),m=Math.min(h,u,d),v=Math.max(a,l,c),p=Math.max(h,u,d),g=Ju(f,m,t,e,i),x=Ju(v,p,t,e,i),M=s.prevZ,y=s.nextZ;for(;M&&M.z>=g&&y&&y.z<=x;){if(M.x>=f&&M.x<=v&&M.y>=m&&M.y<=p&&M!==n&&M!==o&&ra(a,h,l,u,c,d,M.x,M.y)&&ii(M.prev,M,M.next)>=0||(M=M.prevZ,y.x>=f&&y.x<=v&&y.y>=m&&y.y<=p&&y!==n&&y!==o&&ra(a,h,l,u,c,d,y.x,y.y)&&ii(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;M&&M.z>=g;){if(M.x>=f&&M.x<=v&&M.y>=m&&M.y<=p&&M!==n&&M!==o&&ra(a,h,l,u,c,d,M.x,M.y)&&ii(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;y&&y.z<=x;){if(y.x>=f&&y.x<=v&&y.y>=m&&y.y<=p&&y!==n&&y!==o&&ra(a,h,l,u,c,d,y.x,y.y)&&ii(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function Wg(s,t){let e=s;do{let i=e.prev,n=e.next.next;!lo(i,n)&&om(i,e,e.next,n)&&Da(i,n)&&Da(n,i)&&(t.push(i.i,e.i,n.i),Na(e),Na(e.next),e=s=n),e=e.next}while(e!==s);return lr(e)}function qg(s,t,e,i,n,r){let o=s;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&tv(o,a)){let l=am(o,a);o=lr(o,o.next),l=lr(l,l.next),La(o,t,e,i,n,r,0),La(l,t,e,i,n,r,0);return}a=a.next}o=o.next}while(o!==s)}function Xg(s,t,e,i){let n=[];for(let r=0,o=t.length;r<o;r++){let a=t[r]*i,l=r<o-1?t[r+1]*i:s.length,c=sm(s,a,l,i,!1);c===c.next&&(c.steiner=!0),n.push(Qg(c))}n.sort(Yg);for(let r=0;r<n.length;r++)e=Zg(n[r],e);return e}function Yg(s,t){let e=s.x-t.x;if(e===0&&(e=s.y-t.y,e===0)){let i=(s.next.y-s.y)/(s.next.x-s.x),n=(t.next.y-t.y)/(t.next.x-t.x);e=i-n}return e}function Zg(s,t){let e=$g(s,t);if(!e)return t;let i=am(e,s);return lr(i,i.next),lr(e,e.next)}function $g(s,t){let e=t,i=s.x,n=s.y,r=-1/0,o;if(lo(s,e))return e;do{if(lo(s,e.next))return e.next;if(n<=e.y&&n>=e.next.y&&e.next.y!==e.y){let u=e.x+(n-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(u<=i&&u>r&&(r=u,o=e.x<e.next.x?e:e.next,u===i))return o}e=e.next}while(e!==t);if(!o)return null;let a=o,l=o.x,c=o.y,h=1/0;e=o;do{if(i>=e.x&&e.x>=l&&i!==e.x&&rm(n<c?i:r,n,l,c,n<c?r:i,n,e.x,e.y)){let u=Math.abs(n-e.y)/(i-e.x);Da(e,s)&&(u<h||u===h&&(e.x>o.x||e.x===o.x&&Jg(o,e)))&&(o=e,h=u)}e=e.next}while(e!==a);return o}function Jg(s,t){return ii(s.prev,s,t.prev)<0&&ii(t.next,s,s.next)<0}function Kg(s,t,e,i){let n=s;do n.z===0&&(n.z=Ju(n.x,n.y,t,e,i)),n.prevZ=n.prev,n.nextZ=n.next,n=n.next;while(n!==s);n.prevZ.nextZ=null,n.prevZ=null,jg(n)}function jg(s){let t,e=1;do{let i=s,n;s=null;let r=null;for(t=0;i;){t++;let o=i,a=0;for(let c=0;c<e&&(a++,o=o.nextZ,!!o);c++);let l=e;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||i.z<=o.z)?(n=i,i=i.nextZ,a--):(n=o,o=o.nextZ,l--),r?r.nextZ=n:s=n,n.prevZ=r,r=n;i=o}r.nextZ=null,e*=2}while(t>1);return s}function Ju(s,t,e,i,n){return s=(s-e)*n|0,t=(t-i)*n|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,s|t<<1}function Qg(s){let t=s,e=s;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==s);return e}function rm(s,t,e,i,n,r,o,a){return(n-o)*(t-a)>=(s-o)*(r-a)&&(s-o)*(i-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(n-o)*(i-a)}function ra(s,t,e,i,n,r,o,a){return!(s===o&&t===a)&&rm(s,t,e,i,n,r,o,a)}function tv(s,t){return s.next.i!==t.i&&s.prev.i!==t.i&&!ev(s,t)&&(Da(s,t)&&Da(t,s)&&iv(s,t)&&(ii(s.prev,s,t.prev)||ii(s,t.prev,t))||lo(s,t)&&ii(s.prev,s,s.next)>0&&ii(t.prev,t,t.next)>0)}function ii(s,t,e){return(t.y-s.y)*(e.x-t.x)-(t.x-s.x)*(e.y-t.y)}function lo(s,t){return s.x===t.x&&s.y===t.y}function om(s,t,e,i){let n=tc(ii(s,t,e)),r=tc(ii(s,t,i)),o=tc(ii(e,i,s)),a=tc(ii(e,i,t));return!!(n!==r&&o!==a||n===0&&Ql(s,e,t)||r===0&&Ql(s,i,t)||o===0&&Ql(e,s,i)||a===0&&Ql(e,t,i))}function Ql(s,t,e){return t.x<=Math.max(s.x,e.x)&&t.x>=Math.min(s.x,e.x)&&t.y<=Math.max(s.y,e.y)&&t.y>=Math.min(s.y,e.y)}function tc(s){return s>0?1:s<0?-1:0}function ev(s,t){let e=s;do{if(e.i!==s.i&&e.next.i!==s.i&&e.i!==t.i&&e.next.i!==t.i&&om(e,e.next,s,t))return!0;e=e.next}while(e!==s);return!1}function Da(s,t){return ii(s.prev,s,s.next)<0?ii(s,t,s.next)>=0&&ii(s,s.prev,t)>=0:ii(s,t,s.prev)<0||ii(s,s.next,t)<0}function iv(s,t){let e=s,i=!1,n=(s.x+t.x)/2,r=(s.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&n<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(i=!i),e=e.next;while(e!==s);return i}function am(s,t){let e=Ku(s.i,s.x,s.y),i=Ku(t.i,t.x,t.y),n=s.next,r=t.prev;return s.next=t,t.prev=s,e.next=n,n.prev=e,i.next=e,e.prev=i,r.next=i,i.prev=r,i}function hp(s,t,e,i){let n=Ku(s,t,e);return i?(n.next=i.next,n.prev=i,i.next.prev=n,i.next=n):(n.prev=n,n.next=n),n}function Na(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Ku(s,t,e){return{i:s,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function nv(s,t,e,i){let n=0;for(let r=t,o=e-i;r<e;r+=i)n+=(s[o]-s[r])*(s[r+1]+s[o+1]),o=r;return n}var ju=class{static triangulate(t,e,i=2){return kg(t,e,i)}},Wn=class s{static area(t){let e=t.length,i=0;for(let n=e-1,r=0;r<e;n=r++)i+=t[n].x*t[r].y-t[r].x*t[n].y;return i*.5}static isClockWise(t){return s.area(t)<0}static triangulateShape(t,e){let i=[],n=[],r=[];up(t),dp(i,t);let o=t.length;e.forEach(up);for(let l=0;l<e.length;l++)n.push(o),o+=e[l].length,dp(i,e[l]);let a=ju.triangulate(i,n);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function up(s){let t=s.length;t>2&&s[t-1].equals(s[0])&&s.pop()}function dp(s,t){for(let e=0;e<t.length;e++)s.push(t[e].x),s.push(t[e].y)}var cr=class s extends le{constructor(t=new Ln([new j(.5,.5),new j(-.5,.5),new j(-.5,-.5),new j(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let i=this,n=[],r=[];for(let a=0,l=t.length;a<l;a++){let c=t[a];o(c)}this.setAttribute("position",new Kt(n,3)),this.setAttribute("uv",new Kt(r,2)),this.computeVertexNormals();function o(a){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,m=e.bevelSize!==void 0?e.bevelSize:f-.1,v=e.bevelOffset!==void 0?e.bevelOffset:0,p=e.bevelSegments!==void 0?e.bevelSegments:3,g=e.extrudePath,x=e.UVGenerator!==void 0?e.UVGenerator:sv,M,y=!1,b,E,A,_;if(g){M=g.getSpacedPoints(h),y=!0,d=!1;let st=g.isCatmullRomCurve3?g.closed:!1;b=g.computeFrenetFrames(h,st),E=new w,A=new w,_=new w}d||(p=0,f=0,m=0,v=0);let R=a.extractPoints(c),P=R.shape,I=R.holes;if(!Wn.isClockWise(P)){P=P.reverse();for(let st=0,ct=I.length;st<ct;st++){let dt=I[st];Wn.isClockWise(dt)&&(I[st]=dt.reverse())}}function H(st){let dt=10000000000000001e-36,ft=st[0];for(let mt=1;mt<=st.length;mt++){let $t=mt%st.length,qt=st[$t],Qt=qt.x-ft.x,ee=qt.y-ft.y,D=Qt*Qt+ee*ee,Te=Math.max(Math.abs(qt.x),Math.abs(qt.y),Math.abs(ft.x),Math.abs(ft.y)),me=dt*Te*Te;if(D<=me){st.splice($t,1),mt--;continue}ft=qt}}H(P),I.forEach(H);let L=I.length,B=P;for(let st=0;st<L;st++){let ct=I[st];P=P.concat(ct)}function q(st,ct,dt){return ct||te("ExtrudeGeometry: vec does not exist"),st.clone().addScaledVector(ct,dt)}let Y=P.length;function rt(st,ct,dt){let ft,mt,$t,qt=st.x-ct.x,Qt=st.y-ct.y,ee=dt.x-st.x,D=dt.y-st.y,Te=qt*qt+Qt*Qt,me=qt*D-Qt*ee;if(Math.abs(me)>Number.EPSILON){let C=Math.sqrt(Te),S=Math.sqrt(ee*ee+D*D),O=ct.x-Qt/C,G=ct.y+qt/C,J=dt.x-D/S,pt=dt.y+ee/S,gt=((J-O)*D-(pt-G)*ee)/(qt*D-Qt*ee);ft=O+qt*gt-st.x,mt=G+Qt*gt-st.y;let K=ft*ft+mt*mt;if(K<=2)return new j(ft,mt);$t=Math.sqrt(K/2)}else{let C=!1;qt>Number.EPSILON?ee>Number.EPSILON&&(C=!0):qt<-Number.EPSILON?ee<-Number.EPSILON&&(C=!0):Math.sign(Qt)===Math.sign(D)&&(C=!0),C?(ft=-Qt,mt=qt,$t=Math.sqrt(Te)):(ft=qt,mt=Qt,$t=Math.sqrt(Te/2))}return new j(ft/$t,mt/$t)}let Z=[];for(let st=0,ct=B.length,dt=ct-1,ft=st+1;st<ct;st++,dt++,ft++)dt===ct&&(dt=0),ft===ct&&(ft=0),Z[st]=rt(B[st],B[dt],B[ft]);let tt=[],nt,Dt=Z.concat();for(let st=0,ct=L;st<ct;st++){let dt=I[st];nt=[];for(let ft=0,mt=dt.length,$t=mt-1,qt=ft+1;ft<mt;ft++,$t++,qt++)$t===mt&&($t=0),qt===mt&&(qt=0),nt[ft]=rt(dt[ft],dt[$t],dt[qt]);tt.push(nt),Dt=Dt.concat(nt)}let Pt;if(p===0)Pt=Wn.triangulateShape(B,I);else{let st=[],ct=[];for(let dt=0;dt<p;dt++){let ft=dt/p,mt=f*Math.cos(ft*Math.PI/2),$t=m*Math.sin(ft*Math.PI/2)+v;for(let qt=0,Qt=B.length;qt<Qt;qt++){let ee=q(B[qt],Z[qt],$t);vt(ee.x,ee.y,-mt),ft===0&&st.push(ee)}for(let qt=0,Qt=L;qt<Qt;qt++){let ee=I[qt];nt=tt[qt];let D=[];for(let Te=0,me=ee.length;Te<me;Te++){let C=q(ee[Te],nt[Te],$t);vt(C.x,C.y,-mt),ft===0&&D.push(C)}ft===0&&ct.push(D)}}Pt=Wn.triangulateShape(st,ct)}let ce=Pt.length,oe=m+v;for(let st=0;st<Y;st++){let ct=d?q(P[st],Dt[st],oe):P[st];y?(A.copy(b.normals[0]).multiplyScalar(ct.x),E.copy(b.binormals[0]).multiplyScalar(ct.y),_.copy(M[0]).add(A).add(E),vt(_.x,_.y,_.z)):vt(ct.x,ct.y,0)}for(let st=1;st<=h;st++)for(let ct=0;ct<Y;ct++){let dt=d?q(P[ct],Dt[ct],oe):P[ct];y?(A.copy(b.normals[st]).multiplyScalar(dt.x),E.copy(b.binormals[st]).multiplyScalar(dt.y),_.copy(M[st]).add(A).add(E),vt(_.x,_.y,_.z)):vt(dt.x,dt.y,u/h*st)}for(let st=p-1;st>=0;st--){let ct=st/p,dt=f*Math.cos(ct*Math.PI/2),ft=m*Math.sin(ct*Math.PI/2)+v;for(let mt=0,$t=B.length;mt<$t;mt++){let qt=q(B[mt],Z[mt],ft);vt(qt.x,qt.y,u+dt)}for(let mt=0,$t=I.length;mt<$t;mt++){let qt=I[mt];nt=tt[mt];for(let Qt=0,ee=qt.length;Qt<ee;Qt++){let D=q(qt[Qt],nt[Qt],ft);y?vt(D.x,D.y+M[h-1].y,M[h-1].x+dt):vt(D.x,D.y,u+dt)}}}ae(),X();function ae(){let st=n.length/3;if(d){let ct=0,dt=Y*ct;for(let ft=0;ft<ce;ft++){let mt=Pt[ft];Wt(mt[2]+dt,mt[1]+dt,mt[0]+dt)}ct=h+p*2,dt=Y*ct;for(let ft=0;ft<ce;ft++){let mt=Pt[ft];Wt(mt[0]+dt,mt[1]+dt,mt[2]+dt)}}else{for(let ct=0;ct<ce;ct++){let dt=Pt[ct];Wt(dt[2],dt[1],dt[0])}for(let ct=0;ct<ce;ct++){let dt=Pt[ct];Wt(dt[0]+Y*h,dt[1]+Y*h,dt[2]+Y*h)}}i.addGroup(st,n.length/3-st,0)}function X(){let st=n.length/3,ct=0;Q(B,ct),ct+=B.length;for(let dt=0,ft=I.length;dt<ft;dt++){let mt=I[dt];Q(mt,ct),ct+=mt.length}i.addGroup(st,n.length/3-st,1)}function Q(st,ct){let dt=st.length;for(;--dt>=0;){let ft=dt,mt=dt-1;mt<0&&(mt=st.length-1);for(let $t=0,qt=h+p*2;$t<qt;$t++){let Qt=Y*$t,ee=Y*($t+1),D=ct+ft+Qt,Te=ct+mt+Qt,me=ct+mt+ee,C=ct+ft+ee;Et(D,Te,me,C)}}}function vt(st,ct,dt){l.push(st),l.push(ct),l.push(dt)}function Wt(st,ct,dt){Yt(st),Yt(ct),Yt(dt);let ft=n.length/3,mt=x.generateTopUV(i,n,ft-3,ft-2,ft-1);xe(mt[0]),xe(mt[1]),xe(mt[2])}function Et(st,ct,dt,ft){Yt(st),Yt(ct),Yt(ft),Yt(ct),Yt(dt),Yt(ft);let mt=n.length/3,$t=x.generateSideWallUV(i,n,mt-6,mt-3,mt-2,mt-1);xe($t[0]),xe($t[1]),xe($t[3]),xe($t[1]),xe($t[2]),xe($t[3])}function Yt(st){n.push(l[st*3+0]),n.push(l[st*3+1]),n.push(l[st*3+2])}function xe(st){r.push(st.x),r.push(st.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,i=this.parameters.options;return rv(e,i,t)}static fromJSON(t,e){let i=[];for(let r=0,o=t.shapes.length;r<o;r++){let a=e[t.shapes[r]];i.push(a)}let n=t.options.extrudePath;return n!==void 0&&(t.options.extrudePath=new bc[n.type]().fromJSON(n)),new s(i,t.options)}},sv={generateTopUV:function(s,t,e,i,n){let r=t[e*3],o=t[e*3+1],a=t[i*3],l=t[i*3+1],c=t[n*3],h=t[n*3+1];return[new j(r,o),new j(a,l),new j(c,h)]},generateSideWallUV:function(s,t,e,i,n,r){let o=t[e*3],a=t[e*3+1],l=t[e*3+2],c=t[i*3],h=t[i*3+1],u=t[i*3+2],d=t[n*3],f=t[n*3+1],m=t[n*3+2],v=t[r*3],p=t[r*3+1],g=t[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new j(o,1-l),new j(c,1-u),new j(d,1-m),new j(v,1-g)]:[new j(a,1-l),new j(h,1-u),new j(f,1-m),new j(p,1-g)]}};function rv(s,t,e){if(e.shapes=[],Array.isArray(s))for(let i=0,n=s.length;i<n;i++){let r=s[i];e.shapes.push(r.uuid)}else e.shapes.push(s.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Ua=class s extends yc{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,n=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(n,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new s(t.radius,t.detail)}},Us=class s extends le{constructor(t=[new j(0,-.5),new j(.5,0),new j(0,.5)],e=12,i=0,n=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:i,phiLength:n},e=Math.floor(e),n=de(n,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],h=1/e,u=new w,d=new j,f=new w,m=new w,v=new w,p=0,g=0;for(let x=0;x<=t.length-1;x++)switch(x){case 0:p=t[x+1].x-t[x].x,g=t[x+1].y-t[x].y,f.x=g*1,f.y=-p,f.z=g*0,v.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case t.length-1:l.push(v.x,v.y,v.z);break;default:p=t[x+1].x-t[x].x,g=t[x+1].y-t[x].y,f.x=g*1,f.y=-p,f.z=g*0,m.copy(f),f.x+=v.x,f.y+=v.y,f.z+=v.z,f.normalize(),l.push(f.x,f.y,f.z),v.copy(m)}for(let x=0;x<=e;x++){let M=i+x*h*n,y=Math.sin(M),b=Math.cos(M);for(let E=0;E<=t.length-1;E++){u.x=t[E].x*y,u.y=t[E].y,u.z=t[E].x*b,o.push(u.x,u.y,u.z),d.x=x/e,d.y=E/(t.length-1),a.push(d.x,d.y);let A=l[3*E+0]*y,_=l[3*E+1],R=l[3*E+0]*b;c.push(A,_,R)}}for(let x=0;x<e;x++)for(let M=0;M<t.length-1;M++){let y=M+x*t.length,b=y,E=y+t.length,A=y+t.length+1,_=y+1;r.push(b,E,_),r.push(A,_,E)}this.setIndex(r),this.setAttribute("position",new Kt(o,3)),this.setAttribute("uv",new Kt(a,2)),this.setAttribute("normal",new Kt(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.points,t.segments,t.phiStart,t.phiLength)}};var oi=class s extends le{constructor(t=1,e=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:n};let r=t/2,o=e/2,a=Math.floor(i),l=Math.floor(n),c=a+1,h=l+1,u=t/a,d=e/l,f=[],m=[],v=[],p=[];for(let g=0;g<h;g++){let x=g*d-o;for(let M=0;M<c;M++){let y=M*u-r;m.push(y,-x,0),v.push(0,0,1),p.push(M/a),p.push(1-g/l)}}for(let g=0;g<l;g++)for(let x=0;x<a;x++){let M=x+c*g,y=x+c*(g+1),b=x+1+c*(g+1),E=x+1+c*g;f.push(M,y,E),f.push(y,b,E)}this.setIndex(f),this.setAttribute("position",new Kt(m,3)),this.setAttribute("normal",new Kt(v,3)),this.setAttribute("uv",new Kt(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.widthSegments,t.heightSegments)}},hr=class s extends le{constructor(t=.5,e=1,i=32,n=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:n,thetaStart:r,thetaLength:o},i=Math.max(3,i),n=Math.max(1,n);let a=[],l=[],c=[],h=[],u=t,d=(e-t)/n,f=new w,m=new j;for(let v=0;v<=n;v++){for(let p=0;p<=i;p++){let g=r+p/i*o;f.x=u*Math.cos(g),f.y=u*Math.sin(g),l.push(f.x,f.y,f.z),c.push(0,0,1),m.x=(f.x/e+1)/2,m.y=(f.y/e+1)/2,h.push(m.x,m.y)}u+=d}for(let v=0;v<n;v++){let p=v*(i+1);for(let g=0;g<i;g++){let x=g+p,M=x,y=x+i+1,b=x+i+2,E=x+1;a.push(M,y,E),a.push(y,b,E)}}this.setIndex(a),this.setAttribute("position",new Kt(l,3)),this.setAttribute("normal",new Kt(c,3)),this.setAttribute("uv",new Kt(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Fa=class s extends le{constructor(t=new Ln([new j(0,.5),new j(-.5,-.5),new j(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};let i=[],n=[],r=[],o=[],a=0,l=0;if(Array.isArray(t)===!1)c(t);else for(let h=0;h<t.length;h++)c(t[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new Kt(n,3)),this.setAttribute("normal",new Kt(r,3)),this.setAttribute("uv",new Kt(o,2));function c(h){let u=n.length/3,d=h.extractPoints(e),f=d.shape,m=d.holes;Wn.isClockWise(f)===!1&&(f=f.reverse());for(let p=0,g=m.length;p<g;p++){let x=m[p];Wn.isClockWise(x)===!0&&(m[p]=x.reverse())}let v=Wn.triangulateShape(f,m);for(let p=0,g=m.length;p<g;p++){let x=m[p];f=f.concat(x)}for(let p=0,g=f.length;p<g;p++){let x=f[p];n.push(x.x,x.y,0),r.push(0,0,1),o.push(x.x,x.y)}for(let p=0,g=v.length;p<g;p++){let x=v[p],M=x[0]+u,y=x[1]+u,b=x[2]+u;i.push(M,y,b),l+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes;return ov(e,t)}static fromJSON(t,e){let i=[];for(let n=0,r=t.shapes.length;n<r;n++){let o=e[t.shapes[n]];i.push(o)}return new s(i,t.curveSegments)}};function ov(s,t){if(t.shapes=[],Array.isArray(s))for(let e=0,i=s.length;e<i;e++){let n=s[e];t.shapes.push(n.uuid)}else t.shapes.push(s.uuid);return t}var vi=class s extends le{constructor(t=1,e=32,i=16,n=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:n,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new w,d=new w,f=[],m=[],v=[],p=[];for(let g=0;g<=i;g++){let x=[],M=g/i,y=o+M*a,b=t*Math.cos(y),E=Math.sqrt(t*t-b*b),A=0;g===0&&o===0?A=.5/e:g===i&&l===Math.PI&&(A=-.5/e);for(let _=0;_<=e;_++){let R=_/e,P=n+R*r;u.x=-E*Math.cos(P),u.y=b,u.z=E*Math.sin(P),m.push(u.x,u.y,u.z),d.copy(u).normalize(),v.push(d.x,d.y,d.z),p.push(R+A,1-M),x.push(c++)}h.push(x)}for(let g=0;g<i;g++)for(let x=0;x<e;x++){let M=h[g][x+1],y=h[g][x],b=h[g+1][x],E=h[g+1][x+1];(g!==0||o>0)&&f.push(M,y,E),(g!==i-1||l<Math.PI)&&f.push(y,b,E)}this.setIndex(f),this.setAttribute("position",new Kt(m,3)),this.setAttribute("normal",new Kt(v,3)),this.setAttribute("uv",new Kt(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var qi=class s extends le{constructor(t=1,e=.4,i=12,n=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:n,arc:r,thetaStart:o,thetaLength:a},i=Math.floor(i),n=Math.floor(n);let l=[],c=[],h=[],u=[],d=new w,f=new w,m=new w;for(let v=0;v<=i;v++){let p=o+v/i*a;for(let g=0;g<=n;g++){let x=g/n*r;f.x=(t+e*Math.cos(p))*Math.cos(x),f.y=(t+e*Math.cos(p))*Math.sin(x),f.z=e*Math.sin(p),c.push(f.x,f.y,f.z),d.x=t*Math.cos(x),d.y=t*Math.sin(x),m.subVectors(f,d).normalize(),h.push(m.x,m.y,m.z),u.push(g/n),u.push(v/i)}}for(let v=1;v<=i;v++)for(let p=1;p<=n;p++){let g=(n+1)*v+p-1,x=(n+1)*(v-1)+p-1,M=(n+1)*(v-1)+p,y=(n+1)*v+p;l.push(g,x,y),l.push(x,M,y)}this.setIndex(l),this.setAttribute("position",new Kt(c,3)),this.setAttribute("normal",new Kt(h,3)),this.setAttribute("uv",new Kt(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};var Ba=class s extends le{constructor(t=new Ca(new w(-1,-1,0),new w(-1,1,0),new w(1,1,0)),e=64,i=1,n=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:i,radialSegments:n,closed:r};let o=t.computeFrenetFrames(e,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;let a=new w,l=new w,c=new j,h=new w,u=[],d=[],f=[],m=[];v(),this.setIndex(m),this.setAttribute("position",new Kt(u,3)),this.setAttribute("normal",new Kt(d,3)),this.setAttribute("uv",new Kt(f,2));function v(){for(let M=0;M<e;M++)p(M);p(r===!1?e:0),x(),g()}function p(M){h=t.getPointAt(M/e,h);let y=o.normals[M],b=o.binormals[M];for(let E=0;E<=n;E++){let A=E/n*Math.PI*2,_=Math.sin(A),R=-Math.cos(A);l.x=R*y.x+_*b.x,l.y=R*y.y+_*b.y,l.z=R*y.z+_*b.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=h.x+i*l.x,a.y=h.y+i*l.y,a.z=h.z+i*l.z,u.push(a.x,a.y,a.z)}}function g(){for(let M=1;M<=e;M++)for(let y=1;y<=n;y++){let b=(n+1)*(M-1)+(y-1),E=(n+1)*M+(y-1),A=(n+1)*M+y,_=(n+1)*(M-1)+y;m.push(b,E,_),m.push(E,A,_)}}function x(){for(let M=0;M<=e;M++)for(let y=0;y<=n;y++)c.x=M/e,c.y=y/n,f.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new s(new bc[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};function gr(s){let t={};for(let e in s){t[e]={};for(let i in s[e]){let n=s[e][i];if(fp(n))n.isRenderTargetTexture?(jt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=n.clone();else if(Array.isArray(n))if(fp(n[0])){let r=[];for(let o=0,a=n.length;o<a;o++)r[o]=n[o].clone();t[e][i]=r}else t[e][i]=n.slice();else t[e][i]=n}}return t}function Bi(s){let t={};for(let e=0;e<s.length;e++){let i=gr(s[e]);for(let n in i)t[n]=i[n]}return t}function fp(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function av(s){let t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function _d(s){let t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ye.workingColorSpace}var Ms={clone:gr,merge:Bi},lv=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,cv=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,fe=class extends Jn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=lv,this.fragmentShader=cv,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=gr(t.uniforms),this.uniformsGroups=av(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let n in this.uniforms){let o=this.uniforms[n].value;o&&o.isTexture?e.uniforms[n]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[n]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[n]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[n]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[n]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[n]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[n]={type:"m4",value:o.toArray()}:e.uniforms[n]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let n=t.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=e[n.value]||null;break;case"c":this.uniforms[i].value=new St().setHex(n.value);break;case"v2":this.uniforms[i].value=new j().fromArray(n.value);break;case"v3":this.uniforms[i].value=new w().fromArray(n.value);break;case"v4":this.uniforms[i].value=new je().fromArray(n.value);break;case"m3":this.uniforms[i].value=new ie().fromArray(n.value);break;case"m4":this.uniforms[i].value=new Me().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},co=class extends fe{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Zt=class extends Jn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new St(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new St(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Eh,this.normalScale=new j(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},ur=class extends Zt{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new j(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return de(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new St(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new St(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new St(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var Sc=class extends Jn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Gp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Ec=class extends Jn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Wr(s,t){return!s||s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function Gu(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}var Fs=class{constructor(t,e,i,n){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,n=e[i],r=e[i-1];i:{t:{let o;e:{n:if(!(t<n)){for(let a=i+2;;){if(n===void 0){if(t<r)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=n,n=e[++i],t<n)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(n=r,r=e[--i-1],t>=r)break t}o=i,i=0;break e}break i}for(;i<o;){let a=i+o>>>1;t<e[a]?o=a:i=a+1}if(n=e[i],r=e[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,n)}return this.interpolate_(i,r,t,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,n=this.valueSize,r=t*n;for(let o=0;o!==n;++o)e[o]=i[r+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},wc=class extends Fs{constructor(t,e,i,n){super(t,e,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Xu,endingEnd:Xu}}intervalChanged_(t,e,i){let n=this.parameterPositions,r=t-2,o=t+1,a=n[r],l=n[o];if(a===void 0)switch(this.getSettings_().endingStart){case Yu:r=t,a=2*e-i;break;case Zu:r=n.length-2,a=e+n[r]-n[r+1];break;default:r=t,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Yu:o=t,l=2*i-e;break;case Zu:o=1,l=i+n[1]-n[0];break;default:o=t-1,l=e}let c=(i-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,m=(i-e)/(n-e),v=m*m,p=v*m,g=-d*p+2*d*v-d*m,x=(1+d)*p+(-1.5-2*d)*v+(-.5+d)*m+1,M=(-1-f)*p+(1.5+f)*v+.5*m,y=f*p-f*v;for(let b=0;b!==a;++b)r[b]=g*o[h+b]+x*o[c+b]+M*o[l+b]+y*o[u+b];return r}},Tc=class extends Fs{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(i-e)/(n-e),u=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*u+o[l+d]*h;return r}},Ac=class extends Fs{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t){return this.copySampleValue_(t-1)}},Rc=class extends Fs{interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this.inTangents,u=this.outTangents;if(!h||!u){let m=(i-e)/(n-e),v=1-m;for(let p=0;p!==a;++p)r[p]=o[c+p]*v+o[l+p]*m;return r}let d=a*2,f=t-1;for(let m=0;m!==a;++m){let v=o[c+m],p=o[l+m],g=f*d+m*2,x=u[g],M=u[g+1],y=t*d+m*2,b=h[y],E=h[y+1],A=uv(i,e,x,b,n);r[m]=lm(A,v,M,E,p)}return r}};function lm(s,t,e,i,n){let r=1-s;return r*r*r*t+3*r*r*s*e+3*r*s*s*i+s*s*s*n}function hv(s,t,e,i,n){let r=1-s;return 3*r*r*(e-t)+6*r*s*(i-e)+3*s*s*(n-i)}function uv(s,t,e,i,n){let r=(s-t)/(n-t);for(let o=0;o<8;o++){let a=lm(r,t,e,i,n)-s;if(Math.abs(a)<1e-10)break;let l=hv(r,t,e,i,n);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var rn=class{constructor(t,e,i,n){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Wr(e,this.TimeBufferType),this.values=Wr(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:Wr(t.times,Array),values:Wr(t.values,Array)};let n=t.getInterpolation();n!==t.DefaultInterpolation&&(i.interpolation=n),Gu(t.settings)&&(i.settings={inTangents:Wr(t.settings.inTangents,Array),outTangents:Wr(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new Ac(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Tc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new wc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new Rc(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case ha:e=this.InterpolantFactoryMethodDiscrete;break;case fc:e=this.InterpolantFactoryMethodLinear;break;case nc:e=this.InterpolantFactoryMethodSmooth;break;case qu:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return jt("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ha;case this.InterpolantFactoryMethodLinear:return fc;case this.InterpolantFactoryMethodSmooth:return nc;case this.InterpolantFactoryMethodBezier:return qu}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]*=t;Gu(this.settings)&&(pp(this.settings.inTangents,t),pp(this.settings.outTangents,t))}return this}trim(t,e){let i=this.times,n=i.length,r=0,o=n-1;for(;r!==n&&i[r]<t;)++r;for(;o!==-1&&i[o]>e;)--o;if(++o,r!==0||o!==n){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(te("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,n=this.values,r=i.length;r===0&&(te("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){te("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){te("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(n!==void 0&&j0(n))for(let a=0,l=n.length;a!==l;++a){let c=n[a];if(isNaN(c)){te("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===nc,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(n)l=!0;else{let u=a*i,d=u-i,f=u+i;for(let m=0;m!==i;++m){let v=e[u+m];if(v!==e[d+m]||v!==e[f+m]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let u=a*i,d=o*i;for(let f=0;f!==i;++f)e[d+f]=e[u+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*i,l=o*i,c=0;c!==i;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,n=new i(this.name,t,e);return n.createInterpolant=this.createInterpolant,Gu(this.settings)&&(n.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),n}};function pp(s,t){for(let e=0,i=s.length;e!==i;e+=2)s[e]*=t}rn.prototype.ValueTypeName="";rn.prototype.TimeBufferType=Float32Array;rn.prototype.ValueBufferType=Float32Array;rn.prototype.DefaultInterpolation=fc;var Bs=class extends rn{constructor(t,e,i){super(t,e,i)}};Bs.prototype.ValueTypeName="bool";Bs.prototype.ValueBufferType=Array;Bs.prototype.DefaultInterpolation=ha;Bs.prototype.InterpolantFactoryMethodLinear=void 0;Bs.prototype.InterpolantFactoryMethodSmooth=void 0;var Cc=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}};Cc.prototype.ValueTypeName="color";var Pc=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}};Pc.prototype.ValueTypeName="number";var Ic=class extends Fs{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-e)/(n-e),c=t*a;for(let h=c+a;c!==h;c+=4)he.slerpFlat(r,0,o,c-a,o,c,l);return r}},Oa=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}InterpolantFactoryMethodLinear(t){return new Ic(this.times,this.values,this.getValueSize(),t)}};Oa.prototype.ValueTypeName="quaternion";Oa.prototype.InterpolantFactoryMethodSmooth=void 0;var Os=class extends rn{constructor(t,e,i){super(t,e,i)}};Os.prototype.ValueTypeName="string";Os.prototype.ValueBufferType=Array;Os.prototype.DefaultInterpolation=ha;Os.prototype.InterpolantFactoryMethodLinear=void 0;Os.prototype.InterpolantFactoryMethodSmooth=void 0;var Lc=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}};Lc.prototype.ValueTypeName="vector";var Dc=class{constructor(t,e,i){let n=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(h){a++,r===!1&&n.onStart!==void 0&&n.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,n.onProgress!==void 0&&n.onProgress(h,o,a),o===a&&(r=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],m=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},cm=new Dc,Nc=class{constructor(t){this.manager=t!==void 0?t:cm,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(n,r){i.load(t,n,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Nc.DEFAULT_MATERIAL_NAME="__DEFAULT";var ho=class extends gi{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new St(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Ha=class extends ho{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(gi.DEFAULT_UP),this.updateMatrix(),this.groundColor=new St(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Wu=new Me,mp=new w,gp=new w,za=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new j(512,512),this.mapType=Fi,this.map=null,this.mapPass=null,this.matrix=new Me,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new io,this._frameExtents=new j(1,1),this._viewportCount=1,this._viewports=[new je(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;mp.setFromMatrixPosition(t.matrixWorld),e.position.copy(mp),gp.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(gp),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,n){Wu.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(Wu,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,o=n?n.z/r.x:1,a=n?n.w/r.y:1,l=n?n.x/r.x:0,c=n?n.y/r.y:0;t.coordinateSystem===$r||t.reversedDepth?e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),e.multiply(Wu)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},ec=new w,ic=new he,Vn=new w,ka=class extends gi{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Me,this.projectionMatrix=new Me,this.projectionMatrixInverse=new Me,this.coordinateSystem=Cn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(ec,ic,Vn),Vn.x===1&&Vn.y===1&&Vn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ec,ic,Vn.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(ec,ic,Vn),Vn.x===1&&Vn.y===1&&Vn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ec,ic,Vn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ds=new w,vp=new j,xp=new j,ei=class extends ka{constructor(t=50,e=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Kr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(oa*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Kr*2*Math.atan(Math.tan(oa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){Ds.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Ds.x,Ds.y).multiplyScalar(-t/Ds.z),Ds.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ds.x,Ds.y).multiplyScalar(-t/Ds.z)}getViewSize(t,e){return this.getViewBounds(t,vp,xp),e.subVectors(xp,vp)}setViewOffset(t,e,i,n,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(oa*.5*this.fov)/this.zoom,i=2*e,n=this.aspect*i,r=-.5*n,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*n/l,e-=o.offsetY*i/c,n*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+n,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Qu=class extends za{constructor(){super(new ei(90,1,.5,500)),this.isPointLightShadow=!0}},Va=class extends ho{constructor(t,e,i=0,n=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=n,this.shadow=new Qu}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},jn=class extends ka{constructor(t=-1,e=1,i=1,n=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=n,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,n,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2,r=i-t,o=i+t,a=n+e,l=n-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},td=class extends za{constructor(){super(new jn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ga=class extends ho{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(gi.DEFAULT_UP),this.updateMatrix(),this.target=new gi,this.shadow=new td}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Wa=class extends le{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}};var qr=-90,Xr=1,Uc=class extends gi{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let n=new ei(qr,Xr,t,e);n.layers=this.layers,this.add(n);let r=new ei(qr,Xr,t,e);r.layers=this.layers,this.add(r);let o=new ei(qr,Xr,t,e);o.layers=this.layers,this.add(o);let a=new ei(qr,Xr,t,e);a.layers=this.layers,this.add(a);let l=new ei(qr,Xr,t,e);l.layers=this.layers,this.add(l);let c=new ei(qr,Xr,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,n,r,o,a,l]=e;for(let c of e)this.remove(c);if(t===Cn)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===$r)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;let v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let p=!1;t.isWebGLRenderer===!0?p=t.state.buffers.depth.getReversed():p=t.reversedDepthBuffer,t.setRenderTarget(i,0,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(i,1,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,2,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,3,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(i,4,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),i.texture.generateMipmaps=v,t.setRenderTarget(i,5,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},Fc=class extends ei{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}},qa=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(t){this._document=t,t.hidden!==void 0&&(this._pageVisibilityHandler=dv.bind(this),t.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(t){return this._timescale=t,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(t){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(t!==void 0?t:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function dv(){this._document.hidden===!1&&this.reset()}var Md="\\[\\]\\.:\\/",fv=new RegExp("["+Md+"]","g"),bd="[^"+Md+"]",pv="[^"+Md.replace("\\.","")+"]",mv=/((?:WC+[\/:])*)/.source.replace("WC",bd),gv=/(WCOD+)?/.source.replace("WCOD",pv),vv=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",bd),xv=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",bd),yv=new RegExp("^"+mv+gv+vv+xv+"$"),_v=["material","materials","bones","map"],ed=class{constructor(t,e,i){let n=i||Ke.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,n)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,n=this._bindings[i];n!==void 0&&n.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let n=this._targetGroup.nCachedObjects_,r=i.length;n!==r;++n)i[n].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},Ke=class s{constructor(t,e,i){this.path=e,this.parsedPath=i||s.parseTrackName(e),this.node=s.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new s.Composite(t,e,i):new s(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(fv,"")}static parseTrackName(t){let e=yv.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},n=i.nodeName&&i.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let r=i.nodeName.substring(n+1);_v.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,n),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=i(a.children);if(l)return l}return null},n=i(t.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)t[e++]=i[n]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,n=e.propertyName,r=e.propertyIndex;if(t||(t=s.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){jt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=e.objectIndex;switch(i){case"materials":if(!t.material){te("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){te("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){te("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){te("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){te("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){te("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){te("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[n];if(o===void 0){let c=e.nodeName;te("PropertyBinding: Trying to update property for track: "+c+"."+n+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(n==="morphTargetInfluences"){if(!t.geometry){te("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){te("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=n;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ke.Composite=ed;Ke.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ke.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ke.prototype.GetterByBindingType=[Ke.prototype._getValue_direct,Ke.prototype._getValue_array,Ke.prototype._getValue_arrayElement,Ke.prototype._getValue_toArray];Ke.prototype.SetterByBindingTypeAndVersioning=[[Ke.prototype._setValue_direct,Ke.prototype._setValue_direct_setNeedsUpdate,Ke.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ke.prototype._setValue_array,Ke.prototype._setValue_array_setNeedsUpdate,Ke.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ke.prototype._setValue_arrayElement,Ke.prototype._setValue_arrayElement_setNeedsUpdate,Ke.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ke.prototype._setValue_fromArray,Ke.prototype._setValue_fromArray_setNeedsUpdate,Ke.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var K1=new Float32Array(1);var Rd=class Rd{constructor(t,e,i,n){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,n){let r=this.elements;return r[0]=t,r[2]=e,r[1]=i,r[3]=n,this}};Rd.prototype.isMatrix2=!0;var id=Rd;function Sd(s,t,e,i){let n=Mv(i);switch(e){case pd:return s*t;case Wc:return s*t/n.components*n.byteLength;case qc:return s*t/n.components*n.byteLength;case Gs:return s*t*2/n.components*n.byteLength;case Xc:return s*t*2/n.components*n.byteLength;case md:return s*t*3/n.components*n.byteLength;case vn:return s*t*4/n.components*n.byteLength;case Yc:return s*t*4/n.components*n.byteLength;case tl:case el:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case il:case nl:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case $c:case Kc:return Math.max(s,16)*Math.max(t,8)/4;case Zc:case Jc:return Math.max(s,8)*Math.max(t,8)/2;case jc:case Qc:case eh:case ih:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case th:case sl:case nh:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case sh:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case rh:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case oh:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case ah:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case lh:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case ch:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case hh:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case uh:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case dh:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case fh:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case ph:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case mh:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case gh:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case vh:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case xh:case yh:case _h:return Math.ceil(s/4)*Math.ceil(t/4)*16;case Mh:case bh:return Math.ceil(s/4)*Math.ceil(t/4)*8;case rl:case Sh:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Mv(s){switch(s){case Fi:case hd:return{byteLength:1,components:1};case fo:case ud:case hi:return{byteLength:2,components:1};case Vc:case Gc:return{byteLength:2,components:4};case Nn:case kc:case gn:return{byteLength:4,components:1};case dd:case fd:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?jt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Im(){let s=null,t=!1,e=null,i=null;function n(r,o){i=s.requestAnimationFrame(n),e(r,o)}return{start:function(){t!==!0&&e!==null&&s!==null&&(i=s.requestAnimationFrame(n),t=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function Tv(s){let t=new WeakMap;function e(a,l){let c=a.array,h=a.usage,u=c.byteLength,d=s.createBuffer();s.bindBuffer(l,d),s.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=s.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){let h=l.array,u=l.updateRanges;if(s.bindBuffer(c,a),u.length===0)s.bufferSubData(c,0,h);else{u.sort((f,m)=>f.start-m.start);let d=0;for(let f=1;f<u.length;f++){let m=u[d],v=u[f];v.start<=m.start+m.count+1?m.count=Math.max(m.count,v.start+v.count-m.start):(++d,u[d]=v)}u.length=d+1;for(let f=0,m=u.length;f<m;f++){let v=u[f];s.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function n(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(s.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:n,remove:r,update:o}}var Av=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Rv=`#ifdef USE_ALPHAHASH
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
#endif`,Cv=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Pv=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Iv=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Lv=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Dv=`#ifdef USE_AOMAP
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
#endif`,Nv=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Uv=`#ifdef USE_BATCHING
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
#endif`,Fv=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Bv=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ov=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Hv=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,zv=`#ifdef USE_IRIDESCENCE
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
#endif`,kv=`#ifdef USE_BUMPMAP
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
#endif`,Vv=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Gv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Wv=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,qv=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Xv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Yv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Zv=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,$v=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Jv=`#define PI 3.141592653589793
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
} // validated`,Kv=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,jv=`vec3 transformedNormal = objectNormal;
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
#endif`,Qv=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,tx=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ex=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ix=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,nx="gl_FragColor = linearToOutputTexel( gl_FragColor );",sx=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,rx=`#ifdef USE_ENVMAP
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
#endif`,ox=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,ax=`#ifdef USE_ENVMAP
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
#endif`,lx=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,cx=`#ifdef USE_ENVMAP
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
#endif`,hx=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ux=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,dx=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fx=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,px=`#ifdef USE_GRADIENTMAP
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
}`,mx=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,gx=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,vx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,xx=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,yx=`#ifdef USE_ENVMAP
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
#endif`,_x=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Mx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,bx=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Sx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ex=`PhysicalMaterial material;
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
#endif`,wx=`uniform sampler2D dfgLUT;
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
}`,Tx=`
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
#endif`,Ax=`#if defined( RE_IndirectDiffuse )
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
#endif`,Rx=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Cx=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Px=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ix=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Lx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Dx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Nx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ux=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Fx=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Bx=`#if defined( USE_POINTS_UV )
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
#endif`,Ox=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Hx=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,zx=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,kx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Vx=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Gx=`#ifdef USE_MORPHTARGETS
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
#endif`,Wx=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,qx=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Xx=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Yx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Zx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,$x=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Jx=`#ifdef USE_NORMALMAP
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
#endif`,Kx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,jx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Qx=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ty=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,ey=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,iy=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,ny=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,sy=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ry=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,oy=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ay=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,ly=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,cy=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,hy=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,uy=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,dy=`float getShadowMask() {
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
}`,fy=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,py=`#ifdef USE_SKINNING
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
#endif`,my=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,gy=`#ifdef USE_SKINNING
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
#endif`,vy=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,xy=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,yy=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,_y=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,My=`#ifdef USE_TRANSMISSION
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
#endif`,by=`#ifdef USE_TRANSMISSION
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
#endif`,Sy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Ey=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,wy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Ty=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Ay=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Ry=`uniform sampler2D t2D;
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
}`,Cy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Py=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Iy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ly=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Dy=`#include <common>
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
}`,Ny=`#if DEPTH_PACKING == 3200
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
}`,Uy=`#define DISTANCE
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
}`,Fy=`#define DISTANCE
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
}`,By=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Oy=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hy=`uniform float scale;
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
}`,zy=`uniform vec3 diffuse;
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
}`,ky=`#include <common>
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
}`,Vy=`uniform vec3 diffuse;
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
}`,Gy=`#define LAMBERT
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
}`,Wy=`#define LAMBERT
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
}`,qy=`#define MATCAP
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
}`,Xy=`#define MATCAP
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
}`,Yy=`#define NORMAL
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
}`,Zy=`#define NORMAL
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
}`,$y=`#define PHONG
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
}`,Jy=`#define PHONG
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
}`,Ky=`#define STANDARD
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
}`,jy=`#define STANDARD
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
}`,Qy=`#define TOON
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
}`,t_=`#define TOON
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
}`,e_=`uniform float size;
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
}`,i_=`uniform vec3 diffuse;
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
}`,n_=`#include <common>
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
}`,s_=`uniform vec3 color;
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
}`,r_=`uniform float rotation;
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
}`,o_=`uniform vec3 diffuse;
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
}`,pe={alphahash_fragment:Av,alphahash_pars_fragment:Rv,alphamap_fragment:Cv,alphamap_pars_fragment:Pv,alphatest_fragment:Iv,alphatest_pars_fragment:Lv,aomap_fragment:Dv,aomap_pars_fragment:Nv,batching_pars_vertex:Uv,batching_vertex:Fv,begin_vertex:Bv,beginnormal_vertex:Ov,bsdfs:Hv,iridescence_fragment:zv,bumpmap_pars_fragment:kv,clipping_planes_fragment:Vv,clipping_planes_pars_fragment:Gv,clipping_planes_pars_vertex:Wv,clipping_planes_vertex:qv,color_fragment:Xv,color_pars_fragment:Yv,color_pars_vertex:Zv,color_vertex:$v,common:Jv,cube_uv_reflection_fragment:Kv,defaultnormal_vertex:jv,displacementmap_pars_vertex:Qv,displacementmap_vertex:tx,emissivemap_fragment:ex,emissivemap_pars_fragment:ix,colorspace_fragment:nx,colorspace_pars_fragment:sx,envmap_fragment:rx,envmap_common_pars_fragment:ox,envmap_pars_fragment:ax,envmap_pars_vertex:lx,envmap_physical_pars_fragment:yx,envmap_vertex:cx,fog_vertex:hx,fog_pars_vertex:ux,fog_fragment:dx,fog_pars_fragment:fx,gradientmap_pars_fragment:px,lightmap_pars_fragment:mx,lights_lambert_fragment:gx,lights_lambert_pars_fragment:vx,lights_pars_begin:xx,lights_toon_fragment:_x,lights_toon_pars_fragment:Mx,lights_phong_fragment:bx,lights_phong_pars_fragment:Sx,lights_physical_fragment:Ex,lights_physical_pars_fragment:wx,lights_fragment_begin:Tx,lights_fragment_maps:Ax,lights_fragment_end:Rx,lightprobes_pars_fragment:Cx,logdepthbuf_fragment:Px,logdepthbuf_pars_fragment:Ix,logdepthbuf_pars_vertex:Lx,logdepthbuf_vertex:Dx,map_fragment:Nx,map_pars_fragment:Ux,map_particle_fragment:Fx,map_particle_pars_fragment:Bx,metalnessmap_fragment:Ox,metalnessmap_pars_fragment:Hx,morphinstance_vertex:zx,morphcolor_vertex:kx,morphnormal_vertex:Vx,morphtarget_pars_vertex:Gx,morphtarget_vertex:Wx,normal_fragment_begin:qx,normal_fragment_maps:Xx,normal_pars_fragment:Yx,normal_pars_vertex:Zx,normal_vertex:$x,normalmap_pars_fragment:Jx,clearcoat_normal_fragment_begin:Kx,clearcoat_normal_fragment_maps:jx,clearcoat_pars_fragment:Qx,iridescence_pars_fragment:ty,opaque_fragment:ey,packing:iy,premultiplied_alpha_fragment:ny,project_vertex:sy,dithering_fragment:ry,dithering_pars_fragment:oy,roughnessmap_fragment:ay,roughnessmap_pars_fragment:ly,shadowmap_pars_fragment:cy,shadowmap_pars_vertex:hy,shadowmap_vertex:uy,shadowmask_pars_fragment:dy,skinbase_vertex:fy,skinning_pars_vertex:py,skinning_vertex:my,skinnormal_vertex:gy,specularmap_fragment:vy,specularmap_pars_fragment:xy,tonemapping_fragment:yy,tonemapping_pars_fragment:_y,transmission_fragment:My,transmission_pars_fragment:by,uv_pars_fragment:Sy,uv_pars_vertex:Ey,uv_vertex:wy,worldpos_vertex:Ty,background_vert:Ay,background_frag:Ry,backgroundCube_vert:Cy,backgroundCube_frag:Py,cube_vert:Iy,cube_frag:Ly,depth_vert:Dy,depth_frag:Ny,distance_vert:Uy,distance_frag:Fy,equirect_vert:By,equirect_frag:Oy,linedashed_vert:Hy,linedashed_frag:zy,meshbasic_vert:ky,meshbasic_frag:Vy,meshlambert_vert:Gy,meshlambert_frag:Wy,meshmatcap_vert:qy,meshmatcap_frag:Xy,meshnormal_vert:Yy,meshnormal_frag:Zy,meshphong_vert:$y,meshphong_frag:Jy,meshphysical_vert:Ky,meshphysical_frag:jy,meshtoon_vert:Qy,meshtoon_frag:t_,points_vert:e_,points_frag:i_,shadow_vert:n_,shadow_frag:s_,sprite_vert:r_,sprite_frag:o_},Tt={common:{diffuse:{value:new St(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ie},alphaMap:{value:null},alphaMapTransform:{value:new ie},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ie}},envmap:{envMap:{value:null},envMapRotation:{value:new ie},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ie}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ie}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ie},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ie},normalScale:{value:new j(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ie},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ie}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ie}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ie}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new St(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new w},probesMax:{value:new w},probesResolution:{value:new w}},points:{diffuse:{value:new St(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ie},alphaTest:{value:0},uvTransform:{value:new ie}},sprite:{diffuse:{value:new St(16777215)},opacity:{value:1},center:{value:new j(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ie},alphaMap:{value:null},alphaMapTransform:{value:new ie},alphaTest:{value:0}}},ts={basic:{uniforms:Bi([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.fog]),vertexShader:pe.meshbasic_vert,fragmentShader:pe.meshbasic_frag},lambert:{uniforms:Bi([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,Tt.lights,{emissive:{value:new St(0)},envMapIntensity:{value:1}}]),vertexShader:pe.meshlambert_vert,fragmentShader:pe.meshlambert_frag},phong:{uniforms:Bi([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,Tt.lights,{emissive:{value:new St(0)},specular:{value:new St(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:pe.meshphong_vert,fragmentShader:pe.meshphong_frag},standard:{uniforms:Bi([Tt.common,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.roughnessmap,Tt.metalnessmap,Tt.fog,Tt.lights,{emissive:{value:new St(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:pe.meshphysical_vert,fragmentShader:pe.meshphysical_frag},toon:{uniforms:Bi([Tt.common,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.gradientmap,Tt.fog,Tt.lights,{emissive:{value:new St(0)}}]),vertexShader:pe.meshtoon_vert,fragmentShader:pe.meshtoon_frag},matcap:{uniforms:Bi([Tt.common,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,{matcap:{value:null}}]),vertexShader:pe.meshmatcap_vert,fragmentShader:pe.meshmatcap_frag},points:{uniforms:Bi([Tt.points,Tt.fog]),vertexShader:pe.points_vert,fragmentShader:pe.points_frag},dashed:{uniforms:Bi([Tt.common,Tt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:pe.linedashed_vert,fragmentShader:pe.linedashed_frag},depth:{uniforms:Bi([Tt.common,Tt.displacementmap]),vertexShader:pe.depth_vert,fragmentShader:pe.depth_frag},normal:{uniforms:Bi([Tt.common,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,{opacity:{value:1}}]),vertexShader:pe.meshnormal_vert,fragmentShader:pe.meshnormal_frag},sprite:{uniforms:Bi([Tt.sprite,Tt.fog]),vertexShader:pe.sprite_vert,fragmentShader:pe.sprite_frag},background:{uniforms:{uvTransform:{value:new ie},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:pe.background_vert,fragmentShader:pe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ie}},vertexShader:pe.backgroundCube_vert,fragmentShader:pe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:pe.cube_vert,fragmentShader:pe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:pe.equirect_vert,fragmentShader:pe.equirect_frag},distance:{uniforms:Bi([Tt.common,Tt.displacementmap,{referencePosition:{value:new w},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:pe.distance_vert,fragmentShader:pe.distance_frag},shadow:{uniforms:Bi([Tt.lights,Tt.fog,{color:{value:new St(0)},opacity:{value:1}}]),vertexShader:pe.shadow_vert,fragmentShader:pe.shadow_frag}};ts.physical={uniforms:Bi([ts.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ie},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ie},clearcoatNormalScale:{value:new j(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ie},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ie},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ie},sheen:{value:0},sheenColor:{value:new St(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ie},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ie},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ie},transmissionSamplerSize:{value:new j},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ie},attenuationDistance:{value:0},attenuationColor:{value:new St(0)},specularColor:{value:new St(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ie},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ie},anisotropyVector:{value:new j},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ie}}]),vertexShader:pe.meshphysical_vert,fragmentShader:pe.meshphysical_frag};var Ah={r:0,b:0,g:0},a_=new Me,Lm=new ie;Lm.set(-1,0,0,0,1,0,0,0,1);function l_(s,t,e,i,n,r){let o=new St(0),a=n===!0?0:1,l,c,h=null,u=0,d=null;function f(x){let M=x.isScene===!0?x.background:null;if(M&&M.isTexture){let y=x.backgroundBlurriness>0;M=t.get(M,y)}return M}function m(x){let M=!1,y=f(x);y===null?p(o,a):y&&y.isColor&&(p(y,1),M=!0);let b=s.xr.getEnvironmentBlendMode();b==="additive"?e.buffers.color.setClear(0,0,0,1,r):b==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(s.autoClear||M)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function v(x,M){let y=f(M);y&&(y.isCubeTexture||y.mapping===ja)?(c===void 0&&(c=new ot(new qe(1,1,1),new fe({name:"BackgroundCubeMaterial",uniforms:gr(ts.backgroundCube.uniforms),vertexShader:ts.backgroundCube.vertexShader,fragmentShader:ts.backgroundCube.fragmentShader,side:_i,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(b,E,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(a_.makeRotationFromEuler(M.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Lm),c.material.toneMapped=ye.getTransfer(y.colorSpace)!==Ce,(h!==y||u!==y.version||d!==s.toneMapping)&&(c.material.needsUpdate=!0,h=y,u=y.version,d=s.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new ot(new oi(2,2),new fe({name:"BackgroundMaterial",uniforms:gr(ts.background.uniforms),vertexShader:ts.background.vertexShader,fragmentShader:ts.background.fragmentShader,side:Hs,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=ye.getTransfer(y.colorSpace)!==Ce,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||u!==y.version||d!==s.toneMapping)&&(l.material.needsUpdate=!0,h=y,u=y.version,d=s.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function p(x,M){x.getRGB(Ah,_d(s)),e.buffers.color.setClear(Ah.r,Ah.g,Ah.b,M,r)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,M=1){o.set(x),a=M,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(x){a=x,p(o,a)},render:m,addToRenderList:v,dispose:g}}function c_(s,t){let e=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},n=d(null),r=n,o=!1;function a(I,N,H,L,B){let q=!1,Y=u(I,L,H,N);r!==Y&&(r=Y,c(r.object)),q=f(I,L,H,B),q&&m(I,L,H,B),B!==null&&t.update(B,s.ELEMENT_ARRAY_BUFFER),(q||o)&&(o=!1,y(I,N,H,L),B!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(B).buffer))}function l(){return s.createVertexArray()}function c(I){return s.bindVertexArray(I)}function h(I){return s.deleteVertexArray(I)}function u(I,N,H,L){let B=L.wireframe===!0,q=i[N.id];q===void 0&&(q={},i[N.id]=q);let Y=I.isInstancedMesh===!0?I.id:0,rt=q[Y];rt===void 0&&(rt={},q[Y]=rt);let Z=rt[H.id];Z===void 0&&(Z={},rt[H.id]=Z);let tt=Z[B];return tt===void 0&&(tt=d(l()),Z[B]=tt),tt}function d(I){let N=[],H=[],L=[];for(let B=0;B<e;B++)N[B]=0,H[B]=0,L[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:H,attributeDivisors:L,object:I,attributes:{},index:null}}function f(I,N,H,L){let B=r.attributes,q=N.attributes,Y=0,rt=H.getAttributes();for(let Z in rt)if(rt[Z].location>=0){let nt=B[Z],Dt=q[Z];if(Dt===void 0&&(Z==="instanceMatrix"&&I.instanceMatrix&&(Dt=I.instanceMatrix),Z==="instanceColor"&&I.instanceColor&&(Dt=I.instanceColor)),nt===void 0||nt.attribute!==Dt||Dt&&nt.data!==Dt.data)return!0;Y++}return r.attributesNum!==Y||r.index!==L}function m(I,N,H,L){let B={},q=N.attributes,Y=0,rt=H.getAttributes();for(let Z in rt)if(rt[Z].location>=0){let nt=q[Z];nt===void 0&&(Z==="instanceMatrix"&&I.instanceMatrix&&(nt=I.instanceMatrix),Z==="instanceColor"&&I.instanceColor&&(nt=I.instanceColor));let Dt={};Dt.attribute=nt,nt&&nt.data&&(Dt.data=nt.data),B[Z]=Dt,Y++}r.attributes=B,r.attributesNum=Y,r.index=L}function v(){let I=r.newAttributes;for(let N=0,H=I.length;N<H;N++)I[N]=0}function p(I){g(I,0)}function g(I,N){let H=r.newAttributes,L=r.enabledAttributes,B=r.attributeDivisors;H[I]=1,L[I]===0&&(s.enableVertexAttribArray(I),L[I]=1),B[I]!==N&&(s.vertexAttribDivisor(I,N),B[I]=N)}function x(){let I=r.newAttributes,N=r.enabledAttributes;for(let H=0,L=N.length;H<L;H++)N[H]!==I[H]&&(s.disableVertexAttribArray(H),N[H]=0)}function M(I,N,H,L,B,q,Y){Y===!0?s.vertexAttribIPointer(I,N,H,B,q):s.vertexAttribPointer(I,N,H,L,B,q)}function y(I,N,H,L){v();let B=L.attributes,q=H.getAttributes(),Y=N.defaultAttributeValues;for(let rt in q){let Z=q[rt];if(Z.location>=0){let tt=B[rt];if(tt===void 0&&(rt==="instanceMatrix"&&I.instanceMatrix&&(tt=I.instanceMatrix),rt==="instanceColor"&&I.instanceColor&&(tt=I.instanceColor)),tt!==void 0){let nt=tt.normalized,Dt=tt.itemSize,Pt=t.get(tt);if(Pt===void 0)continue;let ce=Pt.buffer,oe=Pt.type,ae=Pt.bytesPerElement,X=oe===s.INT||oe===s.UNSIGNED_INT||tt.gpuType===kc;if(tt.isInterleavedBufferAttribute){let Q=tt.data,vt=Q.stride,Wt=tt.offset;if(Q.isInstancedInterleavedBuffer){for(let Et=0;Et<Z.locationSize;Et++)g(Z.location+Et,Q.meshPerAttribute);I.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let Et=0;Et<Z.locationSize;Et++)p(Z.location+Et);s.bindBuffer(s.ARRAY_BUFFER,ce);for(let Et=0;Et<Z.locationSize;Et++)M(Z.location+Et,Dt/Z.locationSize,oe,nt,vt*ae,(Wt+Dt/Z.locationSize*Et)*ae,X)}else{if(tt.isInstancedBufferAttribute){for(let Q=0;Q<Z.locationSize;Q++)g(Z.location+Q,tt.meshPerAttribute);I.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=tt.meshPerAttribute*tt.count)}else for(let Q=0;Q<Z.locationSize;Q++)p(Z.location+Q);s.bindBuffer(s.ARRAY_BUFFER,ce);for(let Q=0;Q<Z.locationSize;Q++)M(Z.location+Q,Dt/Z.locationSize,oe,nt,Dt*ae,Dt/Z.locationSize*Q*ae,X)}}else if(Y!==void 0){let nt=Y[rt];if(nt!==void 0)switch(nt.length){case 2:s.vertexAttrib2fv(Z.location,nt);break;case 3:s.vertexAttrib3fv(Z.location,nt);break;case 4:s.vertexAttrib4fv(Z.location,nt);break;default:s.vertexAttrib1fv(Z.location,nt)}}}}x()}function b(){R();for(let I in i){let N=i[I];for(let H in N){let L=N[H];for(let B in L){let q=L[B];for(let Y in q)h(q[Y].object),delete q[Y];delete L[B]}}delete i[I]}}function E(I){if(i[I.id]===void 0)return;let N=i[I.id];for(let H in N){let L=N[H];for(let B in L){let q=L[B];for(let Y in q)h(q[Y].object),delete q[Y];delete L[B]}}delete i[I.id]}function A(I){for(let N in i){let H=i[N];for(let L in H){let B=H[L];if(B[I.id]===void 0)continue;let q=B[I.id];for(let Y in q)h(q[Y].object),delete q[Y];delete B[I.id]}}}function _(I){for(let N in i){let H=i[N],L=I.isInstancedMesh===!0?I.id:0,B=H[L];if(B!==void 0){for(let q in B){let Y=B[q];for(let rt in Y)h(Y[rt].object),delete Y[rt];delete B[q]}delete H[L],Object.keys(H).length===0&&delete i[N]}}}function R(){P(),o=!0,r!==n&&(r=n,c(r.object))}function P(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:a,reset:R,resetDefaultState:P,dispose:b,releaseStatesOfGeometry:E,releaseStatesOfObject:_,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:p,disableUnusedAttributes:x}}function h_(s,t,e){let i;function n(l){i=l}function r(l,c){s.drawArrays(i,l,c),e.update(c,i,1)}function o(l,c,h){h!==0&&(s.drawArraysInstanced(i,l,c,h),e.update(c,i,h))}function a(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];e.update(d,i,1)}this.setMode=n,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function u_(s,t,e,i){let n;function r(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let A=t.get("EXT_texture_filter_anisotropic");n=s.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function o(A){return!(A!==vn&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){let _=A===hi&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(A!==Fi&&A!==gn&&!_&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(A){if(A==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(jt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&d===!1&&jt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),m=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=s.getParameter(s.MAX_TEXTURE_SIZE),p=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),g=s.getParameter(s.MAX_VERTEX_ATTRIBS),x=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),M=s.getParameter(s.MAX_VARYING_VECTORS),y=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),b=s.getParameter(s.MAX_SAMPLES),E=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:m,maxTextureSize:v,maxCubemapSize:p,maxAttributes:g,maxVertexUniforms:x,maxVaryings:M,maxFragmentUniforms:y,maxSamples:b,samples:E}}function d_(s){let t=this,e=null,i=0,n=!1,r=!1,o=new Gi,a=new ie,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||i!==0||n;return n=d,i=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){let m=u.clippingPlanes,v=u.clipIntersection,p=u.clipShadows,g=s.get(u);if(!n||m===null||m.length===0||r&&!p)r?h(null):c();else{let x=r?0:i,M=x*4,y=g.clippingState||null;l.value=y,y=h(m,d,M,f);for(let b=0;b!==M;++b)y[b]=e[b];g.clippingState=y,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(u,d,f,m){let v=u!==null?u.length:0,p=null;if(v!==0){if(p=l.value,m!==!0||p===null){let g=f+v*4,x=d.matrixWorldInverse;a.getNormalMatrix(x),(p===null||p.length<g)&&(p=new Float32Array(g));for(let M=0,y=f;M!==v;++M,y+=4)o.copy(u[M]).applyMatrix4(x,a),o.normal.toArray(p,y),p[y+3]=o.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,p}}var go=4,f_=6,p_=20,m_=256,ol=new jn,hm=new St,Cd=null,Pd=0,Id=0,Ld=!1,g_=new w,vr=new w,xo=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,i=.1,n=100,r={}){let{size:o=256,position:a=g_}=r;Cd=this._renderer.getRenderTarget(),Pd=this._renderer.getActiveCubeFace(),Id=this._renderer.getActiveMipmapLevel(),Ld=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,n,l,a),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=fm(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=dm(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Cd,Pd,Id),this._renderer.xr.enabled=Ld,t.scissorTest=!1,mo(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===zs||t.mapping===mr?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Cd=this._renderer.getRenderTarget(),Pd=this._renderer.getActiveCubeFace(),Id=this._renderer.getActiveMipmapLevel(),Ld=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:mi,minFilter:mi,generateMipmaps:!1,type:hi,format:vn,colorSpace:ua,depthBuffer:!1},n=um(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=um(t,e,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=v_(r)),this._blurMaterial=y_(r,t,e),this._ggxMaterial=x_(r,t,e)}return n}_compileMaterial(t){let e=new ot(new le,t);this._renderer.compile(e,ol)}_sceneToCubeUV(t,e,i,n,r){let l=new ei(90,1,e,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(hm),u.toneMapping=Dn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(n),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ot(new qe,new ve({name:"PMREM.Background",side:_i,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,p=v.material,g=!1,x=t.background;x?x.isColor&&(p.color.copy(x),t.background=null,g=!0):(p.color.copy(hm),g=!0);for(let M=0;M<6;M++){let y=M%3;y===0?(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[M],r.y,r.z)):y===1?(l.up.set(0,0,c[M]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[M],r.z)):(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[M]));let b=this._cubeSize;mo(n,y*b,M>2?b:0,b,b),u.setRenderTarget(n),g&&u.render(v,l),u.render(t,l)}u.toneMapping=f,u.autoClear=d,t.background=x}_textureToCubeUV(t,e){let i=this._renderer,n=t.mapping===zs||t.mapping===mr;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=fm()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=dm());let r=n?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=t;let l=this._cubeSize;mo(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(o,ol)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let n=this._lodMeshes.length;for(let r=1;r<n;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=i}_applyGGXFilter(t,e,i){let n=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;let l=o.uniforms,c=i/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=c*1.25,f=u*d,{_lodMax:m}=this,v=this._sizeLods[i],p=3*v*(i>m-go?i-m+go:0),g=4*(this._cubeSize-v);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=m-e,mo(r,p,g,3*v,2*v),n.setRenderTarget(r),n.render(a,ol),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-i,mo(t,p,g,3*v,2*v),n.setRenderTarget(t),n.render(a,ol)}_blur(t,e,i,n){let r=this._pingPongRenderTarget,o=Math.min(n,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,i,o),this._blurPass(r,t,i,i,o)}_blurPass(t,e,i,n,r){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[n];l.material=a;let c=a.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[n],u=3*h*(n>this._lodMax-go?n-this._lodMax+go:0),d=4*(this._cubeSize-h);mo(e,u,d,3*h,2*h),o.setRenderTarget(e),o.render(l,ol)}};function v_(s){let t=[],e=[],i=s,n=s-go+1+f_;for(let r=0;r<n;r++){let o=Math.pow(2,i);t.push(o);let a=1/(o-2),l=-a,c=1+a,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,f=3,m=new Float32Array(f*d*u),v=new Float32Array(f*d*u);for(let g=0;g<u;g++){let x=g%3*2/3-1,M=g>2?0:-1,y=[x,M,0,x+2/3,M,0,x+2/3,M+1,0,x,M,0,x+2/3,M+1,0,x,M+1,0];m.set(y,f*d*g);for(let b=0;b<d;b++){let E=h[b*2]*2-1,A=h[b*2+1]*2-1;g===0?vr.set(1,A,E):g===1?vr.set(-E,1,-A):g===2?vr.set(-E,A,1):g===3?vr.set(-1,A,-E):g===4?vr.set(-E,-1,A):vr.set(E,A,-1),vr.toArray(v,(g*d+b)*f)}}let p=new le;p.setAttribute("position",new ge(m,f)),p.setAttribute("outputDirection",new ge(v,f)),e.push(new ot(p,null)),i>go&&i--}return{lodMeshes:e,sizeLods:t}}function um(s,t,e){let i=new Qe(s,t,e);return i.texture.mapping=ja,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function mo(s,t,e,i,n){s.viewport.set(t,e,i,n),s.scissor.set(t,e,i,n)}function x_(s,t,e){return new fe({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:m_,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Ih(),fragmentShader:`

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
		`,blending:pn,depthTest:!1,depthWrite:!1})}function y_(s,t,e){return new fe({name:"SphericalGaussianBlur",defines:{SAMPLES:p_,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Ih(),fragmentShader:`

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
		`,blending:pn,depthTest:!1,depthWrite:!1})}function dm(){return new fe({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ih(),fragmentShader:`

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
		`,blending:pn,depthTest:!1,depthWrite:!1})}function fm(){return new fe({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ih(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:pn,depthTest:!1,depthWrite:!1})}function Ih(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Ch=class extends Qe{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},n=[i,i,i,i,i,i];this.texture=new Ea(n),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},n=new qe(5,5,5),r=new fe({name:"CubemapFromEquirect",uniforms:gr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:_i,blending:pn});r.uniforms.tEquirect.value=e;let o=new ot(n,r),a=e.minFilter;return e.minFilter===ks&&(e.minFilter=mi),new Uc(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,i=!0,n=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,i,n);t.setRenderTarget(r)}};function __(s){let t=new WeakMap,e=new WeakMap,i=null;function n(d,f=!1){return d==null?null:f?o(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===Oc||f===Hc)if(t.has(d)){let m=t.get(d).texture;return a(m,d.mapping)}else{let m=d.image;if(m&&m.height>0){let v=new Ch(m.height);return v.fromEquirectangularTexture(s,d),t.set(d,v),d.addEventListener("dispose",c),a(v.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,m=f===Oc||f===Hc,v=f===zs||f===mr;if(m||v){let p=e.get(d),g=p!==void 0?p.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==g)return i===null&&(i=new xo(s)),p=m?i.fromEquirectangular(d,p):i.fromCubemap(d,p),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),p.texture;if(p!==void 0)return p.texture;{let x=d.image;return m&&x&&x.height>0||v&&x&&l(x)?(i===null&&(i=new xo(s)),p=m?i.fromEquirectangular(d):i.fromCubemap(d),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),d.addEventListener("dispose",h),p.texture):null}}}return d}function a(d,f){return f===Oc?d.mapping=zs:f===Hc&&(d.mapping=mr),d}function l(d){let f=0,m=6;for(let v=0;v<m;v++)d[v]!==void 0&&f++;return f===m}function c(d){let f=d.target;f.removeEventListener("dispose",c);let m=t.get(f);m!==void 0&&(t.delete(f),m.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let m=e.get(f);m!==void 0&&(e.delete(f),m.dispose())}function u(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:u}}function M_(s){let t={};function e(i){if(t[i]!==void 0)return t[i];let n=s.getExtension(i);return t[i]=n,n}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let n=e(i);return n===null&&ar("WebGLRenderer: "+i+" extension not supported."),n}}}function b_(s,t,e,i){let n={},r=new WeakMap;function o(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let m in d.attributes)t.remove(d.attributes[m]);d.removeEventListener("dispose",o),delete n[d.id];let f=r.get(d);f&&(t.remove(f),r.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return n[d.id]===!0||(d.addEventListener("dispose",o),n[d.id]=!0,e.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)t.update(d[f],s.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,m=u.attributes.position,v=0;if(m===void 0)return;if(f!==null){let x=f.array;v=f.version;for(let M=0,y=x.length;M<y;M+=3){let b=x[M+0],E=x[M+1],A=x[M+2];d.push(b,E,E,A,A,b)}}else{let x=m.array;v=m.version;for(let M=0,y=x.length/3-1;M<y;M+=3){let b=M+0,E=M+1,A=M+2;d.push(b,E,E,A,A,b)}}let p=new(m.count>=65535?ya:xa)(d,1);p.version=v;let g=r.get(u);g&&t.remove(g),r.set(u,p)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function S_(s,t,e){let i;function n(u){i=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function l(u,d){s.drawElements(i,d,r,u*o),e.update(d,i,1)}function c(u,d,f){f!==0&&(s.drawElementsInstanced(i,d,r,u*o,f),e.update(d,i,f))}function h(u,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,u,0,f);let v=0;for(let p=0;p<f;p++)v+=d[p];e.update(v,i,1)}this.setMode=n,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function E_(s){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(e.calls++,o){case s.TRIANGLES:e.triangles+=a*(r/3);break;case s.LINES:e.lines+=a*(r/2);break;case s.LINE_STRIP:e.lines+=a*(r-1);break;case s.LINE_LOOP:e.lines+=a*r;break;case s.POINTS:e.points+=a*r;break;default:te("WebGLInfo: Unknown draw mode:",o);break}}function n(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:n,update:i}}function w_(s,t,e){let i=new WeakMap,n=new je;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=i.get(a);if(d===void 0||d.count!==u){let R=function(){A.dispose(),i.delete(a),a.removeEventListener("dispose",R)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,m=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],x=a.morphAttributes.color||[],M=0;f===!0&&(M=1),m===!0&&(M=2),v===!0&&(M=3);let y=a.attributes.position.count*M,b=1;y>t.maxTextureSize&&(b=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let E=new Float32Array(y*b*4*u),A=new ma(E,y,b,u);A.type=gn,A.needsUpdate=!0;let _=M*4;for(let P=0;P<u;P++){let I=p[P],N=g[P],H=x[P],L=y*b*4*P;for(let B=0;B<I.count;B++){let q=B*_;f===!0&&(n.fromBufferAttribute(I,B),E[L+q+0]=n.x,E[L+q+1]=n.y,E[L+q+2]=n.z,E[L+q+3]=0),m===!0&&(n.fromBufferAttribute(N,B),E[L+q+4]=n.x,E[L+q+5]=n.y,E[L+q+6]=n.z,E[L+q+7]=0),v===!0&&(n.fromBufferAttribute(H,B),E[L+q+8]=n.x,E[L+q+9]=n.y,E[L+q+10]=n.z,E[L+q+11]=H.itemSize===4?n.w:1)}}d={count:u,texture:A,size:new j(y,b)},i.set(a,d),a.addEventListener("dispose",R)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,e);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];let m=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(s,"morphTargetBaseInfluence",m),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function T_(s,t,e,i,n){let r=new WeakMap;function o(c){let h=n.render.frame,u=c.geometry,d=t.get(c,u);if(r.get(d)!==h&&(t.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function a(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var A_={[Xa]:"LINEAR_TONE_MAPPING",[Ya]:"REINHARD_TONE_MAPPING",[Za]:"CINEON_TONE_MAPPING",[pr]:"ACES_FILMIC_TONE_MAPPING",[Ja]:"AGX_TONE_MAPPING",[Ka]:"NEUTRAL_TONE_MAPPING",[$a]:"CUSTOM_TONE_MAPPING"};function R_(s,t,e,i,n,r){let o=new Qe(t,e,{type:s,depthBuffer:n,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new le;c.setAttribute("position",new Kt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new Kt([0,2,0,0,2,0],2));let h=new co({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new ot(c,h),d=new jn(-1,1,1,-1,0,1),f=null,m=null,v=!1,p,g=null,x=[],M=!1;this.setSize=function(y,b){o.setSize(y,b),a!==null&&a.setSize(y,b),l!==null&&l.setSize(y,b);for(let E=0;E<x.length;E++){let A=x[E];A.setSize&&A.setSize(y,b)}},this.setEffects=function(y){x=y,M=x.length>0&&x[0].isRenderPass===!0;let b=o.width,E=o.height;x.length>0&&a===null&&(a=new Qe(b,E,{type:hi,depthBuffer:!1,stencilBuffer:!1}),l=new Qe(b,E,{type:hi,depthBuffer:!1,stencilBuffer:!1}));for(let A=0;A<x.length;A++){let _=x[A];_.setSize&&_.setSize(b,E)}},this.begin=function(y,b){if(v||y.toneMapping===Dn&&x.length===0)return!1;if(g=b,b!==null){let E=b.width,A=b.height;(o.width!==E||o.height!==A)&&this.setSize(E,A)}return M===!1&&y.setRenderTarget(o),p=y.toneMapping,y.toneMapping=Dn,!0},this.hasRenderPass=function(){return M},this.end=function(y,b){y.toneMapping=p,v=!0;let E=o,A=a;for(let _=0;_<x.length;_++){let R=x[_];R.enabled!==!1&&(R.render(y,A,E,b),R.needsSwap!==!1&&(E=A,A=A===a?l:a))}if(f!==y.outputColorSpace||m!==y.toneMapping){f=y.outputColorSpace,m=y.toneMapping,h.defines={},ye.getTransfer(f)===Ce&&(h.defines.SRGB_TRANSFER="");let _=A_[m];_&&(h.defines[_]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=E.texture,y.setRenderTarget(g),y.render(u,d),g=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var Dm=new Wi,Ud=new Ns(1,1),Nm=new ma,Um=new gc,Fm=new Ea,pm=[],mm=[],gm=new Float32Array(16),vm=new Float32Array(9),xm=new Float32Array(4);function yo(s,t,e){let i=s[0];if(i<=0||i>0)return s;let n=t*e,r=pm[n];if(r===void 0&&(r=new Float32Array(n),pm[n]=r),t!==0){i.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,s[o].toArray(r,a)}return r}function Mi(s,t){if(s.length!==t.length)return!1;for(let e=0,i=s.length;e<i;e++)if(s[e]!==t[e])return!1;return!0}function bi(s,t){for(let e=0,i=t.length;e<i;e++)s[e]=t[e]}function Lh(s,t){let e=mm[t];e===void 0&&(e=new Int32Array(t),mm[t]=e);for(let i=0;i!==t;++i)e[i]=s.allocateTextureUnit();return e}function C_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function P_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Mi(e,t))return;s.uniform2fv(this.addr,t),bi(e,t)}}function I_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Mi(e,t))return;s.uniform3fv(this.addr,t),bi(e,t)}}function L_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Mi(e,t))return;s.uniform4fv(this.addr,t),bi(e,t)}}function D_(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(Mi(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),bi(e,t)}else{if(Mi(e,i))return;xm.set(i),s.uniformMatrix2fv(this.addr,!1,xm),bi(e,i)}}function N_(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(Mi(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),bi(e,t)}else{if(Mi(e,i))return;vm.set(i),s.uniformMatrix3fv(this.addr,!1,vm),bi(e,i)}}function U_(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(Mi(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),bi(e,t)}else{if(Mi(e,i))return;gm.set(i),s.uniformMatrix4fv(this.addr,!1,gm),bi(e,i)}}function F_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function B_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Mi(e,t))return;s.uniform2iv(this.addr,t),bi(e,t)}}function O_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Mi(e,t))return;s.uniform3iv(this.addr,t),bi(e,t)}}function H_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Mi(e,t))return;s.uniform4iv(this.addr,t),bi(e,t)}}function z_(s,t){let e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function k_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Mi(e,t))return;s.uniform2uiv(this.addr,t),bi(e,t)}}function V_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Mi(e,t))return;s.uniform3uiv(this.addr,t),bi(e,t)}}function G_(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Mi(e,t))return;s.uniform4uiv(this.addr,t),bi(e,t)}}function W_(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n);let r;this.type===s.SAMPLER_2D_SHADOW?(Ud.compareFunction=e.isReversedDepthBuffer()?Th:wh,r=Ud):r=Dm,e.setTexture2D(t||r,n)}function q_(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture3D(t||Um,n)}function X_(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTextureCube(t||Fm,n)}function Y_(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture2DArray(t||Nm,n)}function Z_(s){switch(s){case 5126:return C_;case 35664:return P_;case 35665:return I_;case 35666:return L_;case 35674:return D_;case 35675:return N_;case 35676:return U_;case 5124:case 35670:return F_;case 35667:case 35671:return B_;case 35668:case 35672:return O_;case 35669:case 35673:return H_;case 5125:return z_;case 36294:return k_;case 36295:return V_;case 36296:return G_;case 35678:case 36198:case 36298:case 36306:case 35682:return W_;case 35679:case 36299:case 36307:return q_;case 35680:case 36300:case 36308:case 36293:return X_;case 36289:case 36303:case 36311:case 36292:return Y_}}function $_(s,t){s.uniform1fv(this.addr,t)}function J_(s,t){let e=yo(t,this.size,2);s.uniform2fv(this.addr,e)}function K_(s,t){let e=yo(t,this.size,3);s.uniform3fv(this.addr,e)}function j_(s,t){let e=yo(t,this.size,4);s.uniform4fv(this.addr,e)}function Q_(s,t){let e=yo(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function tM(s,t){let e=yo(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function eM(s,t){let e=yo(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function iM(s,t){s.uniform1iv(this.addr,t)}function nM(s,t){s.uniform2iv(this.addr,t)}function sM(s,t){s.uniform3iv(this.addr,t)}function rM(s,t){s.uniform4iv(this.addr,t)}function oM(s,t){s.uniform1uiv(this.addr,t)}function aM(s,t){s.uniform2uiv(this.addr,t)}function lM(s,t){s.uniform3uiv(this.addr,t)}function cM(s,t){s.uniform4uiv(this.addr,t)}function hM(s,t,e){let i=this.cache,n=t.length,r=Lh(e,n);Mi(i,r)||(s.uniform1iv(this.addr,r),bi(i,r));let o;this.type===s.SAMPLER_2D_SHADOW?o=Ud:o=Dm;for(let a=0;a!==n;++a)e.setTexture2D(t[a]||o,r[a])}function uM(s,t,e){let i=this.cache,n=t.length,r=Lh(e,n);Mi(i,r)||(s.uniform1iv(this.addr,r),bi(i,r));for(let o=0;o!==n;++o)e.setTexture3D(t[o]||Um,r[o])}function dM(s,t,e){let i=this.cache,n=t.length,r=Lh(e,n);Mi(i,r)||(s.uniform1iv(this.addr,r),bi(i,r));for(let o=0;o!==n;++o)e.setTextureCube(t[o]||Fm,r[o])}function fM(s,t,e){let i=this.cache,n=t.length,r=Lh(e,n);Mi(i,r)||(s.uniform1iv(this.addr,r),bi(i,r));for(let o=0;o!==n;++o)e.setTexture2DArray(t[o]||Nm,r[o])}function pM(s){switch(s){case 5126:return $_;case 35664:return J_;case 35665:return K_;case 35666:return j_;case 35674:return Q_;case 35675:return tM;case 35676:return eM;case 5124:case 35670:return iM;case 35667:case 35671:return nM;case 35668:case 35672:return sM;case 35669:case 35673:return rM;case 5125:return oM;case 36294:return aM;case 36295:return lM;case 36296:return cM;case 35678:case 36198:case 36298:case 36306:case 35682:return hM;case 35679:case 36299:case 36307:return uM;case 35680:case 36300:case 36308:case 36293:return dM;case 36289:case 36303:case 36311:case 36292:return fM}}var Fd=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=Z_(e.type)}},Bd=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=pM(e.type)}},Od=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let n=this.seq;for(let r=0,o=n.length;r!==o;++r){let a=n[r];a.setValue(t,e[a.id],i)}}},Dd=/(\w+)(\])?(\[|\.)?/g;function ym(s,t){s.seq.push(t),s.map[t.id]=t}function mM(s,t,e){let i=s.name,n=i.length;for(Dd.lastIndex=0;;){let r=Dd.exec(i),o=Dd.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===n){ym(e,c===void 0?new Fd(a,s,t):new Bd(a,s,t));break}else{let u=e.map[a];u===void 0&&(u=new Od(a),ym(e,u)),e=u}}}var vo=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){let a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);mM(a,l,this)}let n=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?n.push(o):r.push(o);n.length>0&&(this.seq=n.concat(r))}setValue(t,e,i,n){let r=this.map[e];r!==void 0&&r.setValue(t,i,n)}setOptional(t,e,i){let n=e[i];n!==void 0&&this.setValue(t,i,n)}static upload(t,e,i,n){for(let r=0,o=e.length;r!==o;++r){let a=e[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,n)}}static seqWithValue(t,e){let i=[];for(let n=0,r=t.length;n!==r;++n){let o=t[n];o.id in e&&i.push(o)}return i}};function _m(s,t,e){let i=s.createShader(t);return s.shaderSource(i,e),s.compileShader(i),i}var gM=37297,vM=0;function xM(s,t){let e=s.split(`
`),i=[],n=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=n;o<r;o++){let a=o+1;i.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return i.join(`
`)}var Mm=new ie;function yM(s){ye._getMatrix(Mm,ye.workingColorSpace,s);let t=`mat3( ${Mm.elements.map(e=>e.toFixed(4))} )`;switch(ye.getTransfer(s)){case da:return[t,"LinearTransferOETF"];case Ce:return[t,"sRGBTransferOETF"];default:return jt("WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function bm(s,t,e){let i=s.getShaderParameter(t,s.COMPILE_STATUS),r=(s.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+xM(s.getShaderSource(t),a)}else return r}function _M(s,t){let e=yM(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var MM={[Xa]:"Linear",[Ya]:"Reinhard",[Za]:"Cineon",[pr]:"ACESFilmic",[Ja]:"AgX",[Ka]:"Neutral",[$a]:"Custom"};function bM(s,t){let e=MM[t];return e===void 0?(jt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Rh=new w;function SM(){ye.getLuminanceCoefficients(Rh);let s=Rh.x.toFixed(4),t=Rh.y.toFixed(4),e=Rh.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function EM(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ll).join(`
`)}function wM(s){let t=[];for(let e in s){let i=s[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function TM(s,t){let e={},i=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){let r=s.getActiveAttrib(t,n),o=r.name,a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:s.getAttribLocation(t,o),locationSize:a}}return e}function ll(s){return s!==""}function Sm(s,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Em(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var AM=/^[ \t]*#include +<([\w\d./]+)>/gm;function Hd(s){return s.replace(AM,CM)}var RM=new Map;function CM(s,t){let e=pe[t];if(e===void 0){let i=RM.get(t);if(i!==void 0)e=pe[i],jt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Hd(e)}var PM=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function wm(s){return s.replace(PM,IM)}function IM(s,t,e,i){let n="";for(let r=parseInt(t);r<parseInt(e);r++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return n}function Tm(s){let t=`precision ${s.precision} float;
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
#define LOW_PRECISION`),t}var LM={[dr]:"SHADOWMAP_TYPE_PCF",[uo]:"SHADOWMAP_TYPE_VSM"};function DM(s){return LM[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var NM={[zs]:"ENVMAP_TYPE_CUBE",[mr]:"ENVMAP_TYPE_CUBE",[ja]:"ENVMAP_TYPE_CUBE_UV"};function UM(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":NM[s.envMapMode]||"ENVMAP_TYPE_CUBE"}var FM={[mr]:"ENVMAP_MODE_REFRACTION"};function BM(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":FM[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var OM={[ld]:"ENVMAP_BLENDING_MULTIPLY",[zp]:"ENVMAP_BLENDING_MIX",[kp]:"ENVMAP_BLENDING_ADD"};function HM(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":OM[s.combine]||"ENVMAP_BLENDING_NONE"}function zM(s){let t=s.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function kM(s,t,e,i){let n=s.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,l=DM(e),c=UM(e),h=BM(e),u=HM(e),d=zM(e),f=EM(e),m=wM(r),v=n.createProgram(),p,g,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(ll).join(`
`),p.length>0&&(p+=`
`),g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(ll).join(`
`),g.length>0&&(g+=`
`)):(p=[Tm(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ll).join(`
`),g=[Tm(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Dn?"#define TONE_MAPPING":"",e.toneMapping!==Dn?pe.tonemapping_pars_fragment:"",e.toneMapping!==Dn?bM("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",pe.colorspace_pars_fragment,_M("linearToOutputTexel",e.outputColorSpace),SM(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(ll).join(`
`)),o=Hd(o),o=Sm(o,e),o=Em(o,e),a=Hd(a),a=Sm(a,e),a=Em(a,e),o=wm(o),a=wm(a),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,g=["#define varying in",e.glslVersion===vd?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===vd?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let M=x+p+o,y=x+g+a,b=_m(n,n.VERTEX_SHADER,M),E=_m(n,n.FRAGMENT_SHADER,y);n.attachShader(v,b),n.attachShader(v,E),e.index0AttributeName!==void 0?n.bindAttribLocation(v,0,e.index0AttributeName):e.hasPositionAttribute===!0&&n.bindAttribLocation(v,0,"position"),n.linkProgram(v);function A(I){if(s.debug.checkShaderErrors){let N=n.getProgramInfoLog(v)||"",H=n.getShaderInfoLog(b)||"",L=n.getShaderInfoLog(E)||"",B=N.trim(),q=H.trim(),Y=L.trim(),rt=!0,Z=!0;if(n.getProgramParameter(v,n.LINK_STATUS)===!1)if(rt=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(n,v,b,E);else{let tt=bm(n,b,"vertex"),nt=bm(n,E,"fragment");te("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(v,n.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+B+`
`+tt+`
`+nt)}else B!==""?jt("WebGLProgram: Program Info Log:",B):(q===""||Y==="")&&(Z=!1);Z&&(I.diagnostics={runnable:rt,programLog:B,vertexShader:{log:q,prefix:p},fragmentShader:{log:Y,prefix:g}})}n.deleteShader(b),n.deleteShader(E),_=new vo(n,v),R=TM(n,v)}let _;this.getUniforms=function(){return _===void 0&&A(this),_};let R;this.getAttributes=function(){return R===void 0&&A(this),R};let P=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=n.getProgramParameter(v,gM)),P},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=vM++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=b,this.fragmentShader=E,this}var VM=0,zd=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let n=this._getShaderCacheForMaterial(t);return n.has(e)===!1&&(n.add(e),e.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new kd(t),e.set(t,i)),i}},kd=class{constructor(t){this.id=VM++,this.code=t,this.usedTimes=0}};function GM(s){return s===Gs||s===sl||s===rl}function WM(s,t,e,i,n,r){let o=new ga,a=new zd,l=new Set,c=[],h=new Map,u=i.logarithmicDepthBuffer,d=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(_){return l.add(_),_===0?"uv":`uv${_}`}function v(_,R,P,I,N,H){let L=I.fog,B=N.geometry,q=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?I.environment:null,Y=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,rt=t.get(_.envMap||q,Y),Z=rt&&rt.mapping===ja?rt.image.height:null,tt=f[_.type];_.precision!==null&&(d=i.getMaxPrecision(_.precision),d!==_.precision&&jt("WebGLProgram.getParameters:",_.precision,"not supported, using",d,"instead."));let nt=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,Dt=nt!==void 0?nt.length:0,Pt=0;B.morphAttributes.position!==void 0&&(Pt=1),B.morphAttributes.normal!==void 0&&(Pt=2),B.morphAttributes.color!==void 0&&(Pt=3);let ce,oe,ae,X;if(tt){let z=ts[tt];ce=z.vertexShader,oe=z.fragmentShader}else{ce=_.vertexShader,oe=_.fragmentShader;let z=a.getVertexShaderStage(_),W=a.getFragmentShaderStage(_);a.update(_,z,W),ae=z.id,X=W.id}let Q=s.getRenderTarget(),vt=s.state.buffers.depth.getReversed(),Wt=N.isInstancedMesh===!0,Et=N.isBatchedMesh===!0,Yt=!!_.map,xe=!!_.matcap,st=!!rt,ct=!!_.aoMap,dt=!!_.lightMap,ft=!!_.bumpMap&&_.wireframe===!1,mt=!!_.normalMap,$t=!!_.displacementMap,qt=!!_.emissiveMap,Qt=!!_.metalnessMap,ee=!!_.roughnessMap,D=_.anisotropy>0,Te=_.clearcoat>0,me=_.dispersion>0,C=_.retroreflectivity>0,S=_.iridescence>0,O=_.sheen>0,G=_.transmission>0,J=D&&!!_.anisotropyMap,pt=Te&&!!_.clearcoatMap,gt=Te&&!!_.clearcoatNormalMap,K=Te&&!!_.clearcoatRoughnessMap,it=S&&!!_.iridescenceMap,xt=S&&!!_.iridescenceThicknessMap,kt=O&&!!_.sheenColorMap,wt=O&&!!_.sheenRoughnessMap,Mt=!!_.specularMap,Vt=!!_.specularColorMap,Jt=!!_.specularIntensityMap,ne=G&&!!_.transmissionMap,F=G&&!!_.thicknessMap,yt=!!_.gradientMap,et=!!_.alphaMap,_t=_.alphaTest>0,At=!!_.alphaHash,at=!!_.extensions,Bt=Dn;_.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(Bt=s.toneMapping);let Ut={shaderID:tt,shaderType:_.type,shaderName:_.name,vertexShader:ce,fragmentShader:oe,defines:_.defines,customVertexShaderID:ae,customFragmentShaderID:X,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:d,batching:Et,batchingColor:Et&&N._colorsTexture!==null,instancing:Wt,instancingColor:Wt&&N.instanceColor!==null,instancingMorph:Wt&&N.morphTexture!==null,outputColorSpace:Q===null?s.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:ye.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Yt,matcap:xe,envMap:st,envMapMode:st&&rt.mapping,envMapCubeUVHeight:Z,aoMap:ct,lightMap:dt,bumpMap:ft,normalMap:mt,displacementMap:$t,emissiveMap:qt,normalMapObjectSpace:mt&&_.normalMapType===Wp,normalMapTangentSpace:mt&&_.normalMapType===Eh,packedNormalMap:mt&&_.normalMapType===Eh&&GM(_.normalMap.format),metalnessMap:Qt,roughnessMap:ee,anisotropy:D,anisotropyMap:J,clearcoat:Te,clearcoatMap:pt,clearcoatNormalMap:gt,clearcoatRoughnessMap:K,dispersion:me,retroreflection:C,iridescence:S,iridescenceMap:it,iridescenceThicknessMap:xt,sheen:O,sheenColorMap:kt,sheenRoughnessMap:wt,specularMap:Mt,specularColorMap:Vt,specularIntensityMap:Jt,transmission:G,transmissionMap:ne,thicknessMap:F,gradientMap:yt,opaque:_.transparent===!1&&_.blending===mn&&_.alphaToCoverage===!1,alphaMap:et,alphaTest:_t,alphaHash:At,combine:_.combine,mapUv:Yt&&m(_.map.channel),aoMapUv:ct&&m(_.aoMap.channel),lightMapUv:dt&&m(_.lightMap.channel),bumpMapUv:ft&&m(_.bumpMap.channel),normalMapUv:mt&&m(_.normalMap.channel),displacementMapUv:$t&&m(_.displacementMap.channel),emissiveMapUv:qt&&m(_.emissiveMap.channel),metalnessMapUv:Qt&&m(_.metalnessMap.channel),roughnessMapUv:ee&&m(_.roughnessMap.channel),anisotropyMapUv:J&&m(_.anisotropyMap.channel),clearcoatMapUv:pt&&m(_.clearcoatMap.channel),clearcoatNormalMapUv:gt&&m(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:K&&m(_.clearcoatRoughnessMap.channel),iridescenceMapUv:it&&m(_.iridescenceMap.channel),iridescenceThicknessMapUv:xt&&m(_.iridescenceThicknessMap.channel),sheenColorMapUv:kt&&m(_.sheenColorMap.channel),sheenRoughnessMapUv:wt&&m(_.sheenRoughnessMap.channel),specularMapUv:Mt&&m(_.specularMap.channel),specularColorMapUv:Vt&&m(_.specularColorMap.channel),specularIntensityMapUv:Jt&&m(_.specularIntensityMap.channel),transmissionMapUv:ne&&m(_.transmissionMap.channel),thicknessMapUv:F&&m(_.thicknessMap.channel),alphaMapUv:et&&m(_.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(mt||D),vertexNormals:!!B.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!B.attributes.uv&&(Yt||et),fog:!!L,useFog:_.fog===!0,fogExp2:!!L&&L.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||B.attributes.normal===void 0&&mt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:vt,skinning:N.isSkinnedMesh===!0,hasPositionAttribute:B.attributes.position!==void 0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:Dt,morphTextureStride:Pt,numSunLights:R.sun.length,numDirLights:R.directional.length,numPointLights:R.point.length,numSpotLights:R.spot.length,numSpotLightMaps:R.spotLightMap.length,numRectAreaLights:R.rectArea.length,numHemiLights:R.hemi.length,numSunLightShadows:R.sunShadowMap.length,numDirLightShadows:R.directionalShadowMap.length,numPointLightShadows:R.pointShadowMap.length,numSpotLightShadows:R.spotShadowMap.length,numSpotLightShadowsWithMaps:R.numSpotLightShadowsWithMaps,numLightProbes:R.numLightProbes,numLightProbeGrids:H.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:Bt,decodeVideoTexture:Yt&&_.map.isVideoTexture===!0&&ye.getTransfer(_.map.colorSpace)===Ce,decodeVideoTextureEmissive:qt&&_.emissiveMap.isVideoTexture===!0&&ye.getTransfer(_.emissiveMap.colorSpace)===Ce,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===re,flipSided:_.side===_i,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:at&&_.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(at&&_.extensions.multiDraw===!0||Et)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Ut.vertexUv1s=l.has(1),Ut.vertexUv2s=l.has(2),Ut.vertexUv3s=l.has(3),l.clear(),Ut}function p(_){let R=[];if(_.shaderID?R.push(_.shaderID):(R.push(_.customVertexShaderID),R.push(_.customFragmentShaderID)),_.defines!==void 0)for(let P in _.defines)R.push(P),R.push(_.defines[P]);return _.isRawShaderMaterial===!1&&(g(R,_),x(R,_),R.push(s.outputColorSpace)),R.push(_.customProgramCacheKey),R.join()}function g(_,R){_.push(R.precision),_.push(R.outputColorSpace),_.push(R.envMapMode),_.push(R.envMapCubeUVHeight),_.push(R.mapUv),_.push(R.alphaMapUv),_.push(R.lightMapUv),_.push(R.aoMapUv),_.push(R.bumpMapUv),_.push(R.normalMapUv),_.push(R.displacementMapUv),_.push(R.emissiveMapUv),_.push(R.metalnessMapUv),_.push(R.roughnessMapUv),_.push(R.anisotropyMapUv),_.push(R.clearcoatMapUv),_.push(R.clearcoatNormalMapUv),_.push(R.clearcoatRoughnessMapUv),_.push(R.iridescenceMapUv),_.push(R.iridescenceThicknessMapUv),_.push(R.sheenColorMapUv),_.push(R.sheenRoughnessMapUv),_.push(R.specularMapUv),_.push(R.specularColorMapUv),_.push(R.specularIntensityMapUv),_.push(R.transmissionMapUv),_.push(R.thicknessMapUv),_.push(R.combine),_.push(R.fogExp2),_.push(R.sizeAttenuation),_.push(R.morphTargetsCount),_.push(R.morphAttributeCount),_.push(R.numSunLights),_.push(R.numDirLights),_.push(R.numPointLights),_.push(R.numSpotLights),_.push(R.numSpotLightMaps),_.push(R.numHemiLights),_.push(R.numRectAreaLights),_.push(R.numSunLightShadows),_.push(R.numDirLightShadows),_.push(R.numPointLightShadows),_.push(R.numSpotLightShadows),_.push(R.numSpotLightShadowsWithMaps),_.push(R.numLightProbes),_.push(R.shadowMapType),_.push(R.toneMapping),_.push(R.numClippingPlanes),_.push(R.numClipIntersection),_.push(R.depthPacking)}function x(_,R){o.disableAll(),R.instancing&&o.enable(0),R.instancingColor&&o.enable(1),R.instancingMorph&&o.enable(2),R.matcap&&o.enable(3),R.envMap&&o.enable(4),R.normalMapObjectSpace&&o.enable(5),R.normalMapTangentSpace&&o.enable(6),R.clearcoat&&o.enable(7),R.iridescence&&o.enable(8),R.alphaTest&&o.enable(9),R.vertexColors&&o.enable(10),R.vertexAlphas&&o.enable(11),R.vertexUv1s&&o.enable(12),R.vertexUv2s&&o.enable(13),R.vertexUv3s&&o.enable(14),R.vertexTangents&&o.enable(15),R.anisotropy&&o.enable(16),R.alphaHash&&o.enable(17),R.batching&&o.enable(18),R.dispersion&&o.enable(19),R.retroreflection&&o.enable(24),R.batchingColor&&o.enable(20),R.gradientMap&&o.enable(21),R.packedNormalMap&&o.enable(22),R.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),R.fog&&o.enable(0),R.useFog&&o.enable(1),R.flatShading&&o.enable(2),R.logarithmicDepthBuffer&&o.enable(3),R.reversedDepthBuffer&&o.enable(4),R.skinning&&o.enable(5),R.morphTargets&&o.enable(6),R.morphNormals&&o.enable(7),R.morphColors&&o.enable(8),R.premultipliedAlpha&&o.enable(9),R.shadowMapEnabled&&o.enable(10),R.doubleSided&&o.enable(11),R.flipSided&&o.enable(12),R.useDepthPacking&&o.enable(13),R.dithering&&o.enable(14),R.transmission&&o.enable(15),R.sheen&&o.enable(16),R.opaque&&o.enable(17),R.pointsUvs&&o.enable(18),R.decodeVideoTexture&&o.enable(19),R.decodeVideoTextureEmissive&&o.enable(20),R.alphaToCoverage&&o.enable(21),R.numLightProbeGrids>0&&o.enable(22),R.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function M(_){let R=f[_.type],P;if(R){let I=ts[R];P=Ms.clone(I.uniforms)}else P=_.uniforms;return P}function y(_,R){let P=h.get(R);return P!==void 0?++P.usedTimes:(P=new kM(s,R,_,n),c.push(P),h.set(R,P)),P}function b(_){if(--_.usedTimes===0){let R=c.indexOf(_);c[R]=c[c.length-1],c.pop(),h.delete(_.cacheKey),_.destroy()}}function E(_){a.remove(_)}function A(){a.dispose()}return{getParameters:v,getProgramCacheKey:p,getUniforms:M,acquireProgram:y,releaseProgram:b,releaseShaderCache:E,programs:c,dispose:A}}function qM(){let s=new WeakMap;function t(o){return s.has(o)}function e(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function i(o){s.delete(o)}function n(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:i,update:n,dispose:r}}function XM(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.materialVariant!==t.materialVariant?s.materialVariant-t.materialVariant:s.z!==t.z?s.z-t.z:s.id-t.id}function Am(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function Rm(){let s=[],t=0,e=[],i=[],n=[];function r(){t=0,e.length=0,i.length=0,n.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,m,v,p,g){let x=s[t];return x===void 0?(x={id:d.id,object:d,geometry:f,material:m,materialVariant:o(d),groupOrder:v,renderOrder:d.renderOrder,z:p,group:g},s[t]=x):(x.id=d.id,x.object=d,x.geometry=f,x.material=m,x.materialVariant=o(d),x.groupOrder=v,x.renderOrder=d.renderOrder,x.z=p,x.group=g),t++,x}function l(d,f,m,v,p,g,x){x.reversedDepth===!0&&(p=-p);let M=a(d,f,m,v,p,g);m.transmission>0?i.push(M):m.transparent===!0?n.push(M):e.push(M)}function c(d,f,m,v,p,g){let x=a(d,f,m,v,p,g);m.transmission>0?i.unshift(x):m.transparent===!0?n.unshift(x):e.unshift(x)}function h(d,f){e.length>1&&e.sort(d||XM),i.length>1&&i.sort(f||Am),n.length>1&&n.sort(f||Am)}function u(){for(let d=t,f=s.length;d<f;d++){let m=s[d];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:e,transmissive:i,transparent:n,init:r,push:l,unshift:c,finish:u,sort:h}}function YM(){let s=new WeakMap;function t(i,n){let r=s.get(i),o;return r===void 0?(o=new Rm,s.set(i,[o])):n>=r.length?(o=new Rm,r.push(o)):o=r[n],o}function e(){s=new WeakMap}return{get:t,dispose:e}}function ZM(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new w,color:new St};break;case"SpotLight":e={position:new w,direction:new w,color:new St,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new w,color:new St,distance:0,decay:0};break;case"HemisphereLight":e={direction:new w,skyColor:new St,groundColor:new St};break;case"RectAreaLight":e={color:new St,position:new w,halfWidth:new w,halfHeight:new w};break}return s[t.id]=e,e}}}function $M(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new j};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new j};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new j,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}var JM=0;function KM(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function jM(s){let t=new ZM,e=$M(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new w);let n=new w,r=new Me,o=new Me;function a(c){let h=0,u=0,d=0;for(let N=0;N<9;N++)i.probe[N].set(0,0,0);let f=0,m=0,v=0,p=0,g=0,x=0,M=0,y=0,b=0,E=0,A=0,_=0,R=0,P=0;c.sort(KM);for(let N=0,H=c.length;N<H;N++){let L=c[N],B=L.color,q=L.intensity,Y=L.distance,rt=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===Gs?rt=L.shadow.map.texture:rt=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)h+=B.r*q,u+=B.g*q,d+=B.b*q;else if(L.isLightProbe){for(let Z=0;Z<9;Z++)i.probe[Z].addScaledVector(L.sh.coefficients[Z],q);P++}else if(L.isSunLight){let Z=t.get(L);if(Z.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let tt=L.shadow,nt=e.get(L);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize.copy(tt.mapSize).multiply(tt.getFrameExtents()),i.sunShadow[m]=nt,i.sunShadowMap[m]=rt;let Dt=tt.getViewportCount();for(let Pt=0;Pt<Dt;Pt++)i.sunShadowMatrix[v+Pt]=tt.getMatrix(Pt),i.sunShadowCascade[v+Pt]=tt._cascadeData[Pt];v+=Dt,m++}i.sun[f]=Z,f++}else if(L.isDirectionalLight){let Z=t.get(L);if(Z.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let tt=L.shadow,nt=e.get(L);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize=tt.mapSize,i.directionalShadow[p]=nt,i.directionalShadowMap[p]=rt,i.directionalShadowMatrix[p]=L.shadow.matrix,b++}i.directional[p]=Z,p++}else if(L.isSpotLight){let Z=t.get(L);Z.position.setFromMatrixPosition(L.matrixWorld),Z.color.copy(B).multiplyScalar(q),Z.distance=Y,Z.coneCos=Math.cos(L.angle),Z.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),Z.decay=L.decay,i.spot[x]=Z;let tt=L.shadow;if(L.map&&(i.spotLightMap[_]=L.map,_++,tt.updateMatrices(L),L.castShadow&&R++),i.spotLightMatrix[x]=tt.matrix,L.castShadow){let nt=e.get(L);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize=tt.mapSize,i.spotShadow[x]=nt,i.spotShadowMap[x]=rt,A++}x++}else if(L.isRectAreaLight){let Z=t.get(L);Z.color.copy(B).multiplyScalar(q),Z.halfWidth.set(L.width*.5,0,0),Z.halfHeight.set(0,L.height*.5,0),i.rectArea[M]=Z,M++}else if(L.isPointLight){let Z=t.get(L);if(Z.color.copy(L.color).multiplyScalar(L.intensity),Z.distance=L.distance,Z.decay=L.decay,L.castShadow){let tt=L.shadow,nt=e.get(L);nt.shadowIntensity=tt.intensity,nt.shadowBias=tt.bias,nt.shadowNormalBias=tt.normalBias,nt.shadowRadius=tt.radius,nt.shadowMapSize=tt.mapSize,nt.shadowCameraNear=tt.camera.near,nt.shadowCameraFar=tt.camera.far,i.pointShadow[g]=nt,i.pointShadowMap[g]=rt,i.pointShadowMatrix[g]=L.shadow.matrix,E++}i.point[g]=Z,g++}else if(L.isHemisphereLight){let Z=t.get(L);Z.skyColor.copy(L.color).multiplyScalar(q),Z.groundColor.copy(L.groundColor).multiplyScalar(q),i.hemi[y]=Z,y++}}M>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Tt.LTC_FLOAT_1,i.rectAreaLTC2=Tt.LTC_FLOAT_2):(i.rectAreaLTC1=Tt.LTC_HALF_1,i.rectAreaLTC2=Tt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;let I=i.hash;(I.sunLength!==f||I.directionalLength!==p||I.pointLength!==g||I.spotLength!==x||I.rectAreaLength!==M||I.hemiLength!==y||I.numSunShadows!==m||I.numDirectionalShadows!==b||I.numPointShadows!==E||I.numSpotShadows!==A||I.numSpotMaps!==_||I.numLightProbes!==P)&&(i.sun.length=f,i.directional.length=p,i.spot.length=x,i.rectArea.length=M,i.point.length=g,i.hemi.length=y,i.sunShadow.length=m,i.sunShadowMap.length=m,i.sunShadowMatrix.length=v,i.sunShadowCascade.length=v,i.directionalShadow.length=b,i.directionalShadowMap.length=b,i.directionalShadowMatrix.length=b,i.pointShadow.length=E,i.pointShadowMap.length=E,i.pointShadowMatrix.length=E,i.spotShadow.length=A,i.spotShadowMap.length=A,i.spotLightMatrix.length=A+_-R,i.spotLightMap.length=_,i.numSpotLightShadowsWithMaps=R,i.numLightProbes=P,I.sunLength=f,I.directionalLength=p,I.pointLength=g,I.spotLength=x,I.rectAreaLength=M,I.hemiLength=y,I.numSunShadows=m,I.numDirectionalShadows=b,I.numPointShadows=E,I.numSpotShadows=A,I.numSpotMaps=_,I.numLightProbes=P,i.version=JM++)}function l(c,h){let u=0,d=0,f=0,m=0,v=0,p=0,g=h.matrixWorldInverse;for(let x=0,M=c.length;x<M;x++){let y=c[x];if(y.isSunLight){let b=i.sun[u];b.direction.setFromMatrixPosition(y.matrixWorld),b.direction.transformDirection(g),u++}else if(y.isDirectionalLight){let b=i.directional[d];b.direction.setFromMatrixPosition(y.matrixWorld),n.setFromMatrixPosition(y.target.matrixWorld),b.direction.sub(n),b.direction.transformDirection(g),d++}else if(y.isSpotLight){let b=i.spot[m];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(g),b.direction.setFromMatrixPosition(y.matrixWorld),n.setFromMatrixPosition(y.target.matrixWorld),b.direction.sub(n),b.direction.transformDirection(g),m++}else if(y.isRectAreaLight){let b=i.rectArea[v];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(g),o.identity(),r.copy(y.matrixWorld),r.premultiply(g),o.extractRotation(r),b.halfWidth.set(y.width*.5,0,0),b.halfHeight.set(0,y.height*.5,0),b.halfWidth.applyMatrix4(o),b.halfHeight.applyMatrix4(o),v++}else if(y.isPointLight){let b=i.point[f];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(g),f++}else if(y.isHemisphereLight){let b=i.hemi[p];b.direction.setFromMatrixPosition(y.matrixWorld),b.direction.transformDirection(g),p++}}}return{setup:a,setupView:l,state:i}}function Cm(s){let t=new jM(s),e=[],i=[],n=[];function r(d){u.camera=d,e.length=0,i.length=0,n.length=0}function o(d){e.push(d)}function a(d){i.push(d)}function l(d){n.push(d)}function c(){t.setup(e)}function h(d){t.setupView(e,d)}let u={lightsArray:e,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function QM(s){let t=new WeakMap;function e(n,r=0){let o=t.get(n),a;return o===void 0?(a=new Cm(s),t.set(n,[a])):r>=o.length?(a=new Cm(s),o.push(a)):a=o[r],a}function i(){t=new WeakMap}return{get:e,dispose:i}}var tb=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,eb=`uniform sampler2D shadow_pass;
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
}`,ib=[new w(1,0,0),new w(-1,0,0),new w(0,1,0),new w(0,-1,0),new w(0,0,1),new w(0,0,-1)],nb=[new w(0,-1,0),new w(0,-1,0),new w(0,0,1),new w(0,0,-1),new w(0,-1,0),new w(0,-1,0)],Pm=new Me,al=new w,Nd=new w;function sb(s,t,e){let i=new io,n=new j,r=new j,o=new je,a=new Sc,l=new Ec,c={},h=e.maxTextureSize,u={[Hs]:_i,[_i]:Hs,[re]:re},d=new fe({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new j},radius:{value:4}},vertexShader:tb,fragmentShader:eb}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let m=new le;m.setAttribute("position",new ge(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new ot(m,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=dr;let g=this.type;this.render=function(E,A,_){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||E.length===0)return;this.type===Mp&&(jt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=dr);let R=s.getRenderTarget(),P=s.getActiveCubeFace(),I=s.getActiveMipmapLevel(),N=s.state;N.setBlending(pn),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);let H=g!==this.type;H&&A.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(B=>B.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,B=E.length;L<B;L++){let q=E[L],Y=q.shadow;if(Y===void 0){jt("WebGLShadowMap:",q,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;n.copy(Y.mapSize);let rt=Y.getFrameExtents();n.multiply(rt),r.copy(Y.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(r.x=Math.floor(h/rt.x),n.x=r.x*rt.x,Y.mapSize.x=r.x),n.y>h&&(r.y=Math.floor(h/rt.y),n.y=r.y*rt.y,Y.mapSize.y=r.y));let Z=s.state.buffers.depth.getReversed();if(Y.camera._reversedDepth=Z,Y.map===null||H===!0){if(Y.map!==null&&(Y.map.depthTexture!==null&&(Y.map.depthTexture.dispose(),Y.map.depthTexture=null),Y.map.dispose()),this.type===uo){if(q.isPointLight){jt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Y.map=new Qe(n.x,n.y,{format:Gs,type:hi,minFilter:mi,magFilter:mi,generateMipmaps:!1}),Y.map.texture.name=q.name+".shadowMap",Y.map.depthTexture=new Ns(n.x,n.y,gn),Y.map.depthTexture.name=q.name+".shadowMapDepth",Y.map.depthTexture.format=Xn,Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=pi,Y.map.depthTexture.magFilter=pi}else q.isPointLight?(Y.map=new Ch(n.x),Y.map.depthTexture=new xc(n.x,Nn)):(Y.map=new Qe(n.x,n.y),Y.map.depthTexture=new Ns(n.x,n.y,Nn)),Y.map.depthTexture.name=q.name+".shadowMap",Y.map.depthTexture.format=Xn,this.type===dr?(Y.map.depthTexture.compareFunction=Z?Th:wh,Y.map.depthTexture.minFilter=mi,Y.map.depthTexture.magFilter=mi):(Y.map.depthTexture.compareFunction=null,Y.map.depthTexture.minFilter=pi,Y.map.depthTexture.magFilter=pi);Y.camera.updateProjectionMatrix()}Y.map.isWebGLCubeRenderTarget!==!0&&(Y.map.width!==n.x||Y.map.height!==n.y)&&Y.map.setSize(n.x,n.y);let tt=Y.map.isWebGLCubeRenderTarget?6:Y.getViewportCount();q.isPointLight!==!0&&Y.updateMatrices(q,_);for(let nt=0;nt<tt;nt++){let Dt=Y.getCamera(nt);if(q.isPointLight){let Pt=Y.camera,ce=Y.matrix,oe=q.distance||Pt.far;oe!==Pt.far&&(Pt.far=oe,Pt.updateProjectionMatrix()),al.setFromMatrixPosition(q.matrixWorld),Pt.position.copy(al),Nd.copy(Pt.position),Nd.add(ib[nt]),Pt.up.copy(nb[nt]),Pt.lookAt(Nd),Pt.updateMatrixWorld(),ce.makeTranslation(-al.x,-al.y,-al.z),Pm.multiplyMatrices(Pt.projectionMatrix,Pt.matrixWorldInverse),Y._frustum.setFromProjectionMatrix(Pm,Pt.coordinateSystem,Pt.reversedDepth)}if(Y.map.isWebGLCubeRenderTarget)s.setRenderTarget(Y.map,nt),s.clear();else{nt===0&&(s.setRenderTarget(Y.map),s.clear());let Pt=Y.getViewport(nt);o.set(r.x*Pt.x,r.y*Pt.y,r.x*Pt.z,r.y*Pt.w),N.viewport(o)}i=Y.getFrustum(nt),y(A,_,Dt,q,this.type)}Y.isPointLightShadow!==!0&&this.type===uo&&x(Y,_),Y.needsUpdate=!1}g=this.type,p.needsUpdate=!1,s.setRenderTarget(R,P,I)};function x(E,A){let _=t.update(v);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null?E.mapPass=new Qe(n.x,n.y,{format:Gs,type:hi}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),d.uniforms.shadow_pass.value=E.map.depthTexture,d.uniforms.resolution.value.set(E.map.width,E.map.height),d.uniforms.radius.value=E.radius,s.setRenderTarget(E.mapPass),s.clear(),s.renderBufferDirect(A,null,_,d,v,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value.set(E.map.width,E.map.height),f.uniforms.radius.value=E.radius,s.setRenderTarget(E.map),s.clear(),s.renderBufferDirect(A,null,_,f,v,null)}function M(E,A,_,R){let P=null,I=_.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(I!==void 0)P=I;else if(P=_.isPointLight===!0?l:a,s.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let N=P.uuid,H=A.uuid,L=c[N];L===void 0&&(L={},c[N]=L);let B=L[H];B===void 0&&(B=P.clone(),L[H]=B,A.addEventListener("dispose",b)),P=B}if(P.visible=A.visible,P.wireframe=A.wireframe,R===uo?P.side=A.shadowSide!==null?A.shadowSide:A.side:P.side=A.shadowSide!==null?A.shadowSide:u[A.side],P.alphaMap=A.alphaMap,P.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,P.map=A.map,P.clipShadows=A.clipShadows,P.clippingPlanes=A.clippingPlanes,P.clipIntersection=A.clipIntersection,P.displacementMap=A.displacementMap,P.displacementScale=A.displacementScale,P.displacementBias=A.displacementBias,P.wireframeLinewidth=A.wireframeLinewidth,P.linewidth=A.linewidth,_.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let N=s.properties.get(P);N.light=_}return P}function y(E,A,_,R,P){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&P===uo)&&(!E.frustumCulled||E.intersectsFrustum(i))){E.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,E.matrixWorld);let H=t.update(E),L=E.material;if(Array.isArray(L)){let B=H.groups;for(let q=0,Y=B.length;q<Y;q++){let rt=B[q],Z=L[rt.materialIndex];if(Z&&Z.visible){let tt=M(E,Z,R,P);E.onBeforeShadow(s,E,A,_,H,tt,rt),s.renderBufferDirect(_,null,H,tt,E,rt),E.onAfterShadow(s,E,A,_,H,tt,rt)}}}else if(L.visible){let B=M(E,L,R,P);E.onBeforeShadow(s,E,A,_,H,B,null),s.renderBufferDirect(_,null,H,B,E,null),E.onAfterShadow(s,E,A,_,H,B,null)}}let N=E.children;for(let H=0,L=N.length;H<L;H++)y(N[H],A,_,R,P)}function b(E){E.target.removeEventListener("dispose",b);for(let _ in c){let R=c[_],P=E.target.uuid;P in R&&(R[P].dispose(),delete R[P])}}}function rb(s,t){function e(){let F=!1,yt=new je,et=null,_t=new je(0,0,0,0);return{setMask:function(At){et!==At&&!F&&(s.colorMask(At,At,At,At),et=At)},setLocked:function(At){F=At},setClear:function(At,at,Bt,Ut,z){z===!0&&(At*=Ut,at*=Ut,Bt*=Ut),yt.set(At,at,Bt,Ut),_t.equals(yt)===!1&&(s.clearColor(At,at,Bt,Ut),_t.copy(yt))},reset:function(){F=!1,et=null,_t.set(-1,0,0,0)}}}function i(){let F=!1,yt=!1,et=null,_t=null,At=null;return{setReversed:function(at){if(yt!==at){let Bt=t.get("EXT_clip_control");at?Bt.clipControlEXT(Bt.LOWER_LEFT_EXT,Bt.ZERO_TO_ONE_EXT):Bt.clipControlEXT(Bt.LOWER_LEFT_EXT,Bt.NEGATIVE_ONE_TO_ONE_EXT),yt=at;let Ut=At;At=null,this.setClear(Ut)}},getReversed:function(){return yt},setTest:function(at){at?Q(s.DEPTH_TEST):vt(s.DEPTH_TEST)},setMask:function(at){et!==at&&!F&&(s.depthMask(at),et=at)},setFunc:function(at){if(yt&&(at=em[at]),_t!==at){switch(at){case rc:s.depthFunc(s.NEVER);break;case oc:s.depthFunc(s.ALWAYS);break;case ac:s.depthFunc(s.LESS);break;case Zr:s.depthFunc(s.LEQUAL);break;case lc:s.depthFunc(s.EQUAL);break;case cc:s.depthFunc(s.GEQUAL);break;case hc:s.depthFunc(s.GREATER);break;case uc:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}_t=at}},setLocked:function(at){F=at},setClear:function(at){At!==at&&(At=at,yt&&(at=1-at),s.clearDepth(at))},reset:function(){F=!1,et=null,_t=null,At=null,yt=!1}}}function n(){let F=!1,yt=null,et=null,_t=null,At=null,at=null,Bt=null,Ut=null,z=null;return{setTest:function(W){F||(W?Q(s.STENCIL_TEST):vt(s.STENCIL_TEST))},setMask:function(W){yt!==W&&!F&&(s.stencilMask(W),yt=W)},setFunc:function(W,ut,bt){(et!==W||_t!==ut||At!==bt)&&(s.stencilFunc(W,ut,bt),et=W,_t=ut,At=bt)},setOp:function(W,ut,bt){(at!==W||Bt!==ut||Ut!==bt)&&(s.stencilOp(W,ut,bt),at=W,Bt=ut,Ut=bt)},setLocked:function(W){F=W},setClear:function(W){z!==W&&(s.clearStencil(W),z=W)},reset:function(){F=!1,yt=null,et=null,_t=null,At=null,at=null,Bt=null,Ut=null,z=null}}}let r=new e,o=new i,a=new n,l=new WeakMap,c=new WeakMap,h={},u={},d={},f=new WeakMap,m=[],v=null,p=!1,g=null,x=null,M=null,y=null,b=null,E=null,A=null,_=new St(0,0,0),R=0,P=!1,I=null,N=null,H=null,L=null,B=null,q=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,rt=0,Z=s.getParameter(s.VERSION);Z.indexOf("WebGL")!==-1?(rt=parseFloat(/^WebGL (\d)/.exec(Z)[1]),Y=rt>=1):Z.indexOf("OpenGL ES")!==-1&&(rt=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),Y=rt>=2);let tt=null,nt={},Dt=s.getParameter(s.SCISSOR_BOX),Pt=s.getParameter(s.VIEWPORT),ce=new je().fromArray(Dt),oe=new je().fromArray(Pt);function ae(F,yt,et,_t){let At=new Uint8Array(4),at=s.createTexture();s.bindTexture(F,at),s.texParameteri(F,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(F,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Bt=0;Bt<et;Bt++)F===s.TEXTURE_3D||F===s.TEXTURE_2D_ARRAY?s.texImage3D(yt,0,s.RGBA,1,1,_t,0,s.RGBA,s.UNSIGNED_BYTE,At):s.texImage2D(yt+Bt,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,At);return at}let X={};X[s.TEXTURE_2D]=ae(s.TEXTURE_2D,s.TEXTURE_2D,1),X[s.TEXTURE_CUBE_MAP]=ae(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),X[s.TEXTURE_2D_ARRAY]=ae(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),X[s.TEXTURE_3D]=ae(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),Q(s.DEPTH_TEST),o.setFunc(Zr),ft(!1),mt(nd),Q(s.CULL_FACE),ct(pn);function Q(F){h[F]!==!0&&(s.enable(F),h[F]=!0)}function vt(F){h[F]!==!1&&(s.disable(F),h[F]=!1)}function Wt(F,yt){return d[F]!==yt?(s.bindFramebuffer(F,yt),d[F]=yt,F===s.DRAW_FRAMEBUFFER&&(d[s.FRAMEBUFFER]=yt),F===s.FRAMEBUFFER&&(d[s.DRAW_FRAMEBUFFER]=yt),!0):!1}function Et(F,yt){let et=m,_t=!1;if(F){et=f.get(yt),et===void 0&&(et=[],f.set(yt,et));let At=F.textures;if(et.length!==At.length||et[0]!==s.COLOR_ATTACHMENT0){for(let at=0,Bt=At.length;at<Bt;at++)et[at]=s.COLOR_ATTACHMENT0+at;et.length=At.length,_t=!0}}else et[0]!==s.BACK&&(et[0]=s.BACK,_t=!0);_t&&s.drawBuffers(et)}function Yt(F){return v!==F?(s.useProgram(F),v=F,!0):!1}let xe={[fr]:s.FUNC_ADD,[Sp]:s.FUNC_SUBTRACT,[Ep]:s.FUNC_REVERSE_SUBTRACT};xe[wp]=s.MIN,xe[Tp]=s.MAX;let st={[Ap]:s.ZERO,[Rp]:s.ONE,[Cp]:s.SRC_COLOR,[od]:s.SRC_ALPHA,[Up]:s.SRC_ALPHA_SATURATE,[Dp]:s.DST_COLOR,[Ip]:s.DST_ALPHA,[Pp]:s.ONE_MINUS_SRC_COLOR,[ad]:s.ONE_MINUS_SRC_ALPHA,[Np]:s.ONE_MINUS_DST_COLOR,[Lp]:s.ONE_MINUS_DST_ALPHA,[Fp]:s.CONSTANT_COLOR,[Bp]:s.ONE_MINUS_CONSTANT_COLOR,[Op]:s.CONSTANT_ALPHA,[Hp]:s.ONE_MINUS_CONSTANT_ALPHA};function ct(F,yt,et,_t,At,at,Bt,Ut,z,W){if(F===pn){p===!0&&(vt(s.BLEND),p=!1);return}if(p===!1&&(Q(s.BLEND),p=!0),F!==bp){if(F!==g||W!==P){if((x!==fr||b!==fr)&&(s.blendEquation(s.FUNC_ADD),x=fr,b=fr),W)switch(F){case mn:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Ee:s.blendFunc(s.ONE,s.ONE);break;case sd:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case rd:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:te("WebGLState: Invalid blending: ",F);break}else switch(F){case mn:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Ee:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case sd:te("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case rd:te("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:te("WebGLState: Invalid blending: ",F);break}M=null,y=null,E=null,A=null,_.set(0,0,0),R=0,g=F,P=W}return}At=At||yt,at=at||et,Bt=Bt||_t,(yt!==x||At!==b)&&(s.blendEquationSeparate(xe[yt],xe[At]),x=yt,b=At),(et!==M||_t!==y||at!==E||Bt!==A)&&(s.blendFuncSeparate(st[et],st[_t],st[at],st[Bt]),M=et,y=_t,E=at,A=Bt),(Ut.equals(_)===!1||z!==R)&&(s.blendColor(Ut.r,Ut.g,Ut.b,z),_.copy(Ut),R=z),g=F,P=!1}function dt(F,yt){F.side===re?vt(s.CULL_FACE):Q(s.CULL_FACE);let et=F.side===_i;yt&&(et=!et),ft(et),F.blending===mn&&F.transparent===!1?ct(pn):ct(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),o.setFunc(F.depthFunc),o.setTest(F.depthTest),o.setMask(F.depthWrite),r.setMask(F.colorWrite);let _t=F.stencilWrite;a.setTest(_t),_t&&(a.setMask(F.stencilWriteMask),a.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),a.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),qt(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?Q(s.SAMPLE_ALPHA_TO_COVERAGE):vt(s.SAMPLE_ALPHA_TO_COVERAGE)}function ft(F){I!==F&&(F?s.frontFace(s.CW):s.frontFace(s.CCW),I=F)}function mt(F){F!==yp?(Q(s.CULL_FACE),F!==N&&(F===nd?s.cullFace(s.BACK):F===_p?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):vt(s.CULL_FACE),N=F}function $t(F){F!==H&&(Y&&s.lineWidth(F),H=F)}function qt(F,yt,et){F?(Q(s.POLYGON_OFFSET_FILL),(L!==yt||B!==et)&&(L=yt,B=et,o.getReversed()&&(yt=-yt),s.polygonOffset(yt,et))):vt(s.POLYGON_OFFSET_FILL)}function Qt(F){F?Q(s.SCISSOR_TEST):vt(s.SCISSOR_TEST)}function ee(F){F===void 0&&(F=s.TEXTURE0+q-1),tt!==F&&(s.activeTexture(F),tt=F)}function D(F,yt,et){et===void 0&&(tt===null?et=s.TEXTURE0+q-1:et=tt);let _t=nt[et];_t===void 0&&(_t={type:void 0,texture:void 0},nt[et]=_t),(_t.type!==F||_t.texture!==yt)&&(tt!==et&&(s.activeTexture(et),tt=et),s.bindTexture(F,yt||X[F]),_t.type=F,_t.texture=yt)}function Te(){let F=nt[tt];F!==void 0&&F.type!==void 0&&(s.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function me(){try{s.compressedTexImage2D(...arguments)}catch(F){te("WebGLState:",F)}}function C(){try{s.compressedTexImage3D(...arguments)}catch(F){te("WebGLState:",F)}}function S(){try{s.texSubImage2D(...arguments)}catch(F){te("WebGLState:",F)}}function O(){try{s.texSubImage3D(...arguments)}catch(F){te("WebGLState:",F)}}function G(){try{s.compressedTexSubImage2D(...arguments)}catch(F){te("WebGLState:",F)}}function J(){try{s.compressedTexSubImage3D(...arguments)}catch(F){te("WebGLState:",F)}}function pt(){try{s.texStorage2D(...arguments)}catch(F){te("WebGLState:",F)}}function gt(){try{s.texStorage3D(...arguments)}catch(F){te("WebGLState:",F)}}function K(){try{s.texImage2D(...arguments)}catch(F){te("WebGLState:",F)}}function it(){try{s.texImage3D(...arguments)}catch(F){te("WebGLState:",F)}}function xt(F){return u[F]!==void 0?u[F]:s.getParameter(F)}function kt(F,yt){u[F]!==yt&&(s.pixelStorei(F,yt),u[F]=yt)}function wt(F){ce.equals(F)===!1&&(s.scissor(F.x,F.y,F.z,F.w),ce.copy(F))}function Mt(F){oe.equals(F)===!1&&(s.viewport(F.x,F.y,F.z,F.w),oe.copy(F))}function Vt(F,yt){let et=c.get(yt);et===void 0&&(et=new WeakMap,c.set(yt,et));let _t=et.get(F);_t===void 0&&(_t=s.getUniformBlockIndex(yt,F.name),et.set(F,_t))}function Jt(F,yt){let _t=c.get(yt).get(F);l.get(yt)!==_t&&(s.uniformBlockBinding(yt,_t,F.__bindingPointIndex),l.set(yt,_t))}function ne(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),h={},u={},tt=null,nt={},d={},f=new WeakMap,m=[],v=null,p=!1,g=null,x=null,M=null,y=null,b=null,E=null,A=null,_=new St(0,0,0),R=0,P=!1,I=null,N=null,H=null,L=null,B=null,ce.set(0,0,s.canvas.width,s.canvas.height),oe.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:Q,disable:vt,bindFramebuffer:Wt,drawBuffers:Et,useProgram:Yt,setBlending:ct,setMaterial:dt,setFlipSided:ft,setCullFace:mt,setLineWidth:$t,setPolygonOffset:qt,setScissorTest:Qt,activeTexture:ee,bindTexture:D,unbindTexture:Te,compressedTexImage2D:me,compressedTexImage3D:C,texImage2D:K,texImage3D:it,pixelStorei:kt,getParameter:xt,updateUBOMapping:Vt,uniformBlockBinding:Jt,texStorage2D:pt,texStorage3D:gt,texSubImage2D:S,texSubImage3D:O,compressedTexSubImage2D:G,compressedTexSubImage3D:J,scissor:wt,viewport:Mt,reset:ne}}function ob(s,t,e,i,n,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new j,h=new WeakMap,u=new Set,d,f=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(C,S){return m?new OffscreenCanvas(C,S):fa("canvas")}function p(C,S,O){let G=1,J=me(C);if((J.width>O||J.height>O)&&(G=O/Math.max(J.width,J.height)),G<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let pt=Math.floor(G*J.width),gt=Math.floor(G*J.height);d===void 0&&(d=v(pt,gt));let K=S?v(pt,gt):d;return K.width=pt,K.height=gt,K.getContext("2d").drawImage(C,0,0,pt,gt),jt("WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+pt+"x"+gt+")."),K}else return"data"in C&&jt("WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),C;return C}function g(C){return C.generateMipmaps}function x(C){s.generateMipmap(C)}function M(C){return C.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?s.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function y(C,S,O,G,J,pt=!1){if(C!==null){if(s[C]!==void 0)return s[C];jt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let gt;G&&(gt=t.get("EXT_texture_norm16"),gt||jt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=S;if(S===s.RED&&(O===s.FLOAT&&(K=s.R32F),O===s.HALF_FLOAT&&(K=s.R16F),O===s.UNSIGNED_BYTE&&(K=s.R8),O===s.UNSIGNED_SHORT&&gt&&(K=gt.R16_EXT),O===s.SHORT&&gt&&(K=gt.R16_SNORM_EXT)),S===s.RED_INTEGER&&(O===s.UNSIGNED_BYTE&&(K=s.R8UI),O===s.UNSIGNED_SHORT&&(K=s.R16UI),O===s.UNSIGNED_INT&&(K=s.R32UI),O===s.BYTE&&(K=s.R8I),O===s.SHORT&&(K=s.R16I),O===s.INT&&(K=s.R32I)),S===s.RG&&(O===s.FLOAT&&(K=s.RG32F),O===s.HALF_FLOAT&&(K=s.RG16F),O===s.UNSIGNED_BYTE&&(K=s.RG8),O===s.UNSIGNED_SHORT&&gt&&(K=gt.RG16_EXT),O===s.SHORT&&gt&&(K=gt.RG16_SNORM_EXT)),S===s.RG_INTEGER&&(O===s.UNSIGNED_BYTE&&(K=s.RG8UI),O===s.UNSIGNED_SHORT&&(K=s.RG16UI),O===s.UNSIGNED_INT&&(K=s.RG32UI),O===s.BYTE&&(K=s.RG8I),O===s.SHORT&&(K=s.RG16I),O===s.INT&&(K=s.RG32I)),S===s.RGB_INTEGER&&(O===s.UNSIGNED_BYTE&&(K=s.RGB8UI),O===s.UNSIGNED_SHORT&&(K=s.RGB16UI),O===s.UNSIGNED_INT&&(K=s.RGB32UI),O===s.BYTE&&(K=s.RGB8I),O===s.SHORT&&(K=s.RGB16I),O===s.INT&&(K=s.RGB32I)),S===s.RGBA_INTEGER&&(O===s.UNSIGNED_BYTE&&(K=s.RGBA8UI),O===s.UNSIGNED_SHORT&&(K=s.RGBA16UI),O===s.UNSIGNED_INT&&(K=s.RGBA32UI),O===s.BYTE&&(K=s.RGBA8I),O===s.SHORT&&(K=s.RGBA16I),O===s.INT&&(K=s.RGBA32I)),S===s.RGB&&(O===s.UNSIGNED_SHORT&&gt&&(K=gt.RGB16_EXT),O===s.SHORT&&gt&&(K=gt.RGB16_SNORM_EXT),O===s.UNSIGNED_INT_5_9_9_9_REV&&(K=s.RGB9_E5),O===s.UNSIGNED_INT_10F_11F_11F_REV&&(K=s.R11F_G11F_B10F)),S===s.RGBA){let it=pt?da:ye.getTransfer(J);O===s.FLOAT&&(K=s.RGBA32F),O===s.HALF_FLOAT&&(K=s.RGBA16F),O===s.UNSIGNED_BYTE&&(K=it===Ce?s.SRGB8_ALPHA8:s.RGBA8),O===s.UNSIGNED_SHORT&&gt&&(K=gt.RGBA16_EXT),O===s.SHORT&&gt&&(K=gt.RGBA16_SNORM_EXT),O===s.UNSIGNED_SHORT_4_4_4_4&&(K=s.RGBA4),O===s.UNSIGNED_SHORT_5_5_5_1&&(K=s.RGB5_A1)}return(K===s.R16F||K===s.R32F||K===s.RG16F||K===s.RG32F||K===s.RGBA16F||K===s.RGBA32F)&&t.get("EXT_color_buffer_float"),K}function b(C,S){let O;return C?S===null||S===Nn||S===po?O=s.DEPTH24_STENCIL8:S===gn?O=s.DEPTH32F_STENCIL8:S===fo&&(O=s.DEPTH24_STENCIL8,jt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===Nn||S===po?O=s.DEPTH_COMPONENT24:S===gn?O=s.DEPTH_COMPONENT32F:S===fo&&(O=s.DEPTH_COMPONENT16),O}function E(C,S){return g(C)===!0||C.isFramebufferTexture&&C.minFilter!==pi&&C.minFilter!==mi?Math.log2(Math.max(S.width,S.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?S.mipmaps.length:1}function A(C){let S=C.target;S.removeEventListener("dispose",A),R(S),S.isVideoTexture&&h.delete(S),S.isHTMLTexture&&u.delete(S)}function _(C){let S=C.target;S.removeEventListener("dispose",_),I(S)}function R(C){let S=i.get(C);if(S.__webglInit===void 0)return;let O=C.source,G=f.get(O);if(G){let J=G[S.__cacheKey];J.usedTimes--,J.usedTimes===0&&P(C),Object.keys(G).length===0&&f.delete(O)}i.remove(C)}function P(C){let S=i.get(C);s.deleteTexture(S.__webglTexture);let O=C.source,G=f.get(O);delete G[S.__cacheKey],o.memory.textures--}function I(C){let S=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(S.__webglFramebuffer[G]))for(let J=0;J<S.__webglFramebuffer[G].length;J++)s.deleteFramebuffer(S.__webglFramebuffer[G][J]);else s.deleteFramebuffer(S.__webglFramebuffer[G]);S.__webglDepthbuffer&&s.deleteRenderbuffer(S.__webglDepthbuffer[G])}else{if(Array.isArray(S.__webglFramebuffer))for(let G=0;G<S.__webglFramebuffer.length;G++)s.deleteFramebuffer(S.__webglFramebuffer[G]);else s.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&s.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&s.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let G=0;G<S.__webglColorRenderbuffer.length;G++)S.__webglColorRenderbuffer[G]&&s.deleteRenderbuffer(S.__webglColorRenderbuffer[G]);S.__webglDepthRenderbuffer&&s.deleteRenderbuffer(S.__webglDepthRenderbuffer)}let O=C.textures;for(let G=0,J=O.length;G<J;G++){let pt=i.get(O[G]);pt.__webglTexture&&(s.deleteTexture(pt.__webglTexture),o.memory.textures--),i.remove(O[G])}i.remove(C)}let N=0;function H(){N=0}function L(){return N}function B(C){N=C}function q(){let C=N;return C>=n.maxTextures&&jt("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+n.maxTextures),N+=1,C}function Y(C){let S=[];return S.push(C.wrapS),S.push(C.wrapT),S.push(C.wrapR||0),S.push(C.magFilter),S.push(C.minFilter),S.push(C.anisotropy),S.push(C.internalFormat),S.push(C.format),S.push(C.type),S.push(C.generateMipmaps),S.push(C.premultiplyAlpha),S.push(C.flipY),S.push(C.unpackAlignment),S.push(C.colorSpace),S.join()}function rt(C,S){let O=i.get(C);if(C.isVideoTexture&&D(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&O.__version!==C.version){let G=C.image;if(G===null)jt("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)jt("WebGLRenderer: Texture marked for update but image is incomplete");else{vt(O,C,S);return}}else C.isExternalTexture&&(O.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(s.TEXTURE_2D,O.__webglTexture,s.TEXTURE0+S)}function Z(C,S){let O=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&O.__version!==C.version){vt(O,C,S);return}else C.isExternalTexture&&(O.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(s.TEXTURE_2D_ARRAY,O.__webglTexture,s.TEXTURE0+S)}function tt(C,S){let O=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&O.__version!==C.version){vt(O,C,S);return}e.bindTexture(s.TEXTURE_3D,O.__webglTexture,s.TEXTURE0+S)}function nt(C,S){let O=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&O.__version!==C.version){Wt(O,C,S);return}e.bindTexture(s.TEXTURE_CUBE_MAP,O.__webglTexture,s.TEXTURE0+S)}let Dt={[Ji]:s.REPEAT,[Gn]:s.CLAMP_TO_EDGE,[dc]:s.MIRRORED_REPEAT},Pt={[pi]:s.NEAREST,[Vp]:s.NEAREST_MIPMAP_NEAREST,[Qa]:s.NEAREST_MIPMAP_LINEAR,[mi]:s.LINEAR,[zc]:s.LINEAR_MIPMAP_NEAREST,[ks]:s.LINEAR_MIPMAP_LINEAR},ce={[Xp]:s.NEVER,[Kp]:s.ALWAYS,[Yp]:s.LESS,[wh]:s.LEQUAL,[Zp]:s.EQUAL,[Th]:s.GEQUAL,[$p]:s.GREATER,[Jp]:s.NOTEQUAL};function oe(C,S){if(S.type===gn&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===mi||S.magFilter===zc||S.magFilter===Qa||S.magFilter===ks||S.minFilter===mi||S.minFilter===zc||S.minFilter===Qa||S.minFilter===ks)&&jt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(C,s.TEXTURE_WRAP_S,Dt[S.wrapS]),s.texParameteri(C,s.TEXTURE_WRAP_T,Dt[S.wrapT]),(C===s.TEXTURE_3D||C===s.TEXTURE_2D_ARRAY)&&s.texParameteri(C,s.TEXTURE_WRAP_R,Dt[S.wrapR]),s.texParameteri(C,s.TEXTURE_MAG_FILTER,Pt[S.magFilter]),s.texParameteri(C,s.TEXTURE_MIN_FILTER,Pt[S.minFilter]),S.compareFunction&&(s.texParameteri(C,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(C,s.TEXTURE_COMPARE_FUNC,ce[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===pi||S.minFilter!==Qa&&S.minFilter!==ks||S.type===gn&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||i.get(S).__currentAnisotropy){let O=t.get("EXT_texture_filter_anisotropic");s.texParameterf(C,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,n.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy}}}function ae(C,S){let O=!1;C.__webglInit===void 0&&(C.__webglInit=!0,S.addEventListener("dispose",A));let G=S.source,J=f.get(G);J===void 0&&(J={},f.set(G,J));let pt=Y(S);if(pt!==C.__cacheKey){J[pt]===void 0&&(J[pt]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,O=!0),J[pt].usedTimes++;let gt=J[C.__cacheKey];gt!==void 0&&(J[C.__cacheKey].usedTimes--,gt.usedTimes===0&&P(S)),C.__cacheKey=pt,C.__webglTexture=J[pt].texture}return O}function X(C,S,O){return Math.floor(Math.floor(C/O)/S)}function Q(C,S,O,G){let pt=C.updateRanges;if(pt.length===0)e.texSubImage2D(s.TEXTURE_2D,0,0,0,S.width,S.height,O,G,S.data);else{pt.sort((kt,wt)=>kt.start-wt.start);let gt=0;for(let kt=1;kt<pt.length;kt++){let wt=pt[gt],Mt=pt[kt],Vt=wt.start+wt.count,Jt=X(Mt.start,S.width,4),ne=X(wt.start,S.width,4);Mt.start<=Vt+1&&Jt===ne&&X(Mt.start+Mt.count-1,S.width,4)===Jt?wt.count=Math.max(wt.count,Mt.start+Mt.count-wt.start):(++gt,pt[gt]=Mt)}pt.length=gt+1;let K=e.getParameter(s.UNPACK_ROW_LENGTH),it=e.getParameter(s.UNPACK_SKIP_PIXELS),xt=e.getParameter(s.UNPACK_SKIP_ROWS);e.pixelStorei(s.UNPACK_ROW_LENGTH,S.width);for(let kt=0,wt=pt.length;kt<wt;kt++){let Mt=pt[kt],Vt=Math.floor(Mt.start/4),Jt=Math.ceil(Mt.count/4),ne=Vt%S.width,F=Math.floor(Vt/S.width),yt=Jt,et=1;e.pixelStorei(s.UNPACK_SKIP_PIXELS,ne),e.pixelStorei(s.UNPACK_SKIP_ROWS,F),e.texSubImage2D(s.TEXTURE_2D,0,ne,F,yt,et,O,G,S.data)}C.clearUpdateRanges(),e.pixelStorei(s.UNPACK_ROW_LENGTH,K),e.pixelStorei(s.UNPACK_SKIP_PIXELS,it),e.pixelStorei(s.UNPACK_SKIP_ROWS,xt)}}function vt(C,S,O){let G=s.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(G=s.TEXTURE_2D_ARRAY),S.isData3DTexture&&(G=s.TEXTURE_3D);let J=ae(C,S),pt=S.source;e.bindTexture(G,C.__webglTexture,s.TEXTURE0+O);let gt=i.get(pt);if(pt.version!==gt.__version||J===!0){if(e.activeTexture(s.TEXTURE0+O),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){let et=ye.getPrimaries(ye.workingColorSpace),_t=S.colorSpace===_s?null:ye.getPrimaries(S.colorSpace),At=S.colorSpace===_s||et===_t?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,At)}e.pixelStorei(s.UNPACK_ALIGNMENT,S.unpackAlignment);let it=p(S.image,!1,n.maxTextureSize);it=Te(S,it);let xt=r.convert(S.format,S.colorSpace),kt=r.convert(S.type),wt=y(S.internalFormat,xt,kt,S.normalized,S.colorSpace,S.isVideoTexture);oe(G,S);let Mt,Vt=S.mipmaps,Jt=S.isVideoTexture!==!0,ne=gt.__version===void 0||J===!0,F=pt.dataReady,yt=E(S,it);if(S.isDepthTexture)wt=b(S.format===Vs,S.type),ne&&(Jt?e.texStorage2D(s.TEXTURE_2D,1,wt,it.width,it.height):e.texImage2D(s.TEXTURE_2D,0,wt,it.width,it.height,0,xt,kt,null));else if(S.isDataTexture)if(Vt.length>0){Jt&&ne&&e.texStorage2D(s.TEXTURE_2D,yt,wt,Vt[0].width,Vt[0].height);for(let et=0,_t=Vt.length;et<_t;et++)Mt=Vt[et],Jt?F&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,Mt.width,Mt.height,xt,kt,Mt.data):e.texImage2D(s.TEXTURE_2D,et,wt,Mt.width,Mt.height,0,xt,kt,Mt.data);S.generateMipmaps=!1}else Jt?(ne&&e.texStorage2D(s.TEXTURE_2D,yt,wt,it.width,it.height),F&&Q(S,it,xt,kt)):e.texImage2D(s.TEXTURE_2D,0,wt,it.width,it.height,0,xt,kt,it.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Jt&&ne&&e.texStorage3D(s.TEXTURE_2D_ARRAY,yt,wt,Vt[0].width,Vt[0].height,it.depth);for(let et=0,_t=Vt.length;et<_t;et++)if(Mt=Vt[et],S.format!==vn)if(xt!==null)if(Jt){if(F)if(S.layerUpdates.size>0){let At=Sd(Mt.width,Mt.height,S.format,S.type);for(let at of S.layerUpdates){let Bt=Mt.data.subarray(at*At/Mt.data.BYTES_PER_ELEMENT,(at+1)*At/Mt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,at,Mt.width,Mt.height,1,xt,Bt)}}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,0,Mt.width,Mt.height,it.depth,xt,Mt.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,et,wt,Mt.width,Mt.height,it.depth,0,Mt.data,0,0);else jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Jt?F&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,0,Mt.width,Mt.height,it.depth,xt,kt,Mt.data):e.texImage3D(s.TEXTURE_2D_ARRAY,et,wt,Mt.width,Mt.height,it.depth,0,xt,kt,Mt.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{Jt&&ne&&e.texStorage2D(s.TEXTURE_2D,yt,wt,Vt[0].width,Vt[0].height);for(let et=0,_t=Vt.length;et<_t;et++)Mt=Vt[et],S.format!==vn?xt!==null?Jt?F&&e.compressedTexSubImage2D(s.TEXTURE_2D,et,0,0,Mt.width,Mt.height,xt,Mt.data):e.compressedTexImage2D(s.TEXTURE_2D,et,wt,Mt.width,Mt.height,0,Mt.data):jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Jt?F&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,Mt.width,Mt.height,xt,kt,Mt.data):e.texImage2D(s.TEXTURE_2D,et,wt,Mt.width,Mt.height,0,xt,kt,Mt.data)}else if(S.isDataArrayTexture)if(Jt){if(ne&&e.texStorage3D(s.TEXTURE_2D_ARRAY,yt,wt,it.width,it.height,it.depth),F)if(S.layerUpdates.size>0){let et=Sd(it.width,it.height,S.format,S.type);for(let _t of S.layerUpdates){let At=it.data.subarray(_t*et/it.data.BYTES_PER_ELEMENT,(_t+1)*et/it.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,_t,it.width,it.height,1,xt,kt,At)}S.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,it.width,it.height,it.depth,xt,kt,it.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,wt,it.width,it.height,it.depth,0,xt,kt,it.data);else if(S.isData3DTexture)Jt?(ne&&e.texStorage3D(s.TEXTURE_3D,yt,wt,it.width,it.height,it.depth),F&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,it.width,it.height,it.depth,xt,kt,it.data)):e.texImage3D(s.TEXTURE_3D,0,wt,it.width,it.height,it.depth,0,xt,kt,it.data);else if(S.isFramebufferTexture){if(ne)if(Jt)e.texStorage2D(s.TEXTURE_2D,yt,wt,it.width,it.height);else{let et=it.width,_t=it.height;for(let At=0;At<yt;At++)e.texImage2D(s.TEXTURE_2D,At,wt,et,_t,0,xt,kt,null),et>>=1,_t>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in s){let et=s.canvas;if(et.hasAttribute("layoutsubtree")||et.setAttribute("layoutsubtree","true"),it.parentNode!==et){et.appendChild(it),u.add(S),et.onpaint=_t=>{let At=_t.changedElements;for(let at of u)At.includes(at.image)&&(at.needsUpdate=!0)},et.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,it);else{let At=s.RGBA,at=s.RGBA,Bt=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,At,at,Bt,it)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(Vt.length>0){if(Jt&&ne){let et=me(Vt[0]);e.texStorage2D(s.TEXTURE_2D,yt,wt,et.width,et.height)}for(let et=0,_t=Vt.length;et<_t;et++)Mt=Vt[et],Jt?F&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,xt,kt,Mt):e.texImage2D(s.TEXTURE_2D,et,wt,xt,kt,Mt);S.generateMipmaps=!1}else if(Jt){if(ne){let et=me(it);e.texStorage2D(s.TEXTURE_2D,yt,wt,et.width,et.height)}F&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,xt,kt,it)}else e.texImage2D(s.TEXTURE_2D,0,wt,xt,kt,it);g(S)&&x(G),gt.__version=pt.version,S.onUpdate&&S.onUpdate(S)}C.__version=S.version}function Wt(C,S,O){if(S.image.length!==6)return;let G=ae(C,S),J=S.source;e.bindTexture(s.TEXTURE_CUBE_MAP,C.__webglTexture,s.TEXTURE0+O);let pt=i.get(J);if(J.version!==pt.__version||G===!0){e.activeTexture(s.TEXTURE0+O);let gt=ye.getPrimaries(ye.workingColorSpace),K=S.colorSpace===_s?null:ye.getPrimaries(S.colorSpace),it=S.colorSpace===_s||gt===K?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(s.UNPACK_ALIGNMENT,S.unpackAlignment),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,it);let xt=S.isCompressedTexture||S.image[0].isCompressedTexture,kt=S.image[0]&&S.image[0].isDataTexture,wt=[];for(let at=0;at<6;at++)!xt&&!kt?wt[at]=p(S.image[at],!0,n.maxCubemapSize):wt[at]=kt?S.image[at].image:S.image[at],wt[at]=Te(S,wt[at]);let Mt=wt[0],Vt=r.convert(S.format,S.colorSpace),Jt=r.convert(S.type),ne=y(S.internalFormat,Vt,Jt,S.normalized,S.colorSpace),F=S.isVideoTexture!==!0,yt=pt.__version===void 0||G===!0,et=J.dataReady,_t=E(S,Mt);oe(s.TEXTURE_CUBE_MAP,S);let At;if(xt){F&&yt&&e.texStorage2D(s.TEXTURE_CUBE_MAP,_t,ne,Mt.width,Mt.height);for(let at=0;at<6;at++){At=wt[at].mipmaps;for(let Bt=0;Bt<At.length;Bt++){let Ut=At[Bt];S.format!==vn?Vt!==null?F?et&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt,0,0,Ut.width,Ut.height,Vt,Ut.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt,ne,Ut.width,Ut.height,0,Ut.data):jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt,0,0,Ut.width,Ut.height,Vt,Jt,Ut.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt,ne,Ut.width,Ut.height,0,Vt,Jt,Ut.data)}}}else{if(At=S.mipmaps,F&&yt){At.length>0&&_t++;let at=me(wt[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,_t,ne,at.width,at.height)}for(let at=0;at<6;at++)if(kt){F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,wt[at].width,wt[at].height,Vt,Jt,wt[at].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,ne,wt[at].width,wt[at].height,0,Vt,Jt,wt[at].data);for(let Bt=0;Bt<At.length;Bt++){let z=At[Bt].image[at].image;F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt+1,0,0,z.width,z.height,Vt,Jt,z.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt+1,ne,z.width,z.height,0,Vt,Jt,z.data)}}else{F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,0,0,Vt,Jt,wt[at]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0,ne,Vt,Jt,wt[at]);for(let Bt=0;Bt<At.length;Bt++){let Ut=At[Bt];F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt+1,0,0,Vt,Jt,Ut.image[at]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+at,Bt+1,ne,Vt,Jt,Ut.image[at])}}}g(S)&&x(s.TEXTURE_CUBE_MAP),pt.__version=J.version,S.onUpdate&&S.onUpdate(S)}C.__version=S.version}function Et(C,S,O,G,J,pt){let gt=r.convert(O.format,O.colorSpace),K=r.convert(O.type),it=y(O.internalFormat,gt,K,O.normalized,O.colorSpace),xt=i.get(S),kt=i.get(O);if(kt.__renderTarget=S,!xt.__hasExternalTextures){let wt=Math.max(1,S.width>>pt),Mt=Math.max(1,S.height>>pt);J===s.TEXTURE_3D||J===s.TEXTURE_2D_ARRAY?e.texImage3D(J,pt,it,wt,Mt,S.depth,0,gt,K,null):e.texImage2D(J,pt,it,wt,Mt,0,gt,K,null)}e.bindFramebuffer(s.FRAMEBUFFER,C),ee(S)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,G,J,kt.__webglTexture,0,Qt(S)):(J===s.TEXTURE_2D||J>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,G,J,kt.__webglTexture,pt),e.bindFramebuffer(s.FRAMEBUFFER,null)}function Yt(C,S,O){if(s.bindRenderbuffer(s.RENDERBUFFER,C),S.depthBuffer){let G=S.depthTexture,J=G&&G.isDepthTexture?G.type:null,pt=b(S.stencilBuffer,J),gt=S.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;ee(S)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Qt(S),pt,S.width,S.height):O?s.renderbufferStorageMultisample(s.RENDERBUFFER,Qt(S),pt,S.width,S.height):s.renderbufferStorage(s.RENDERBUFFER,pt,S.width,S.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,gt,s.RENDERBUFFER,C)}else{let G=S.textures;for(let J=0;J<G.length;J++){let pt=G[J],gt=r.convert(pt.format,pt.colorSpace),K=r.convert(pt.type),it=y(pt.internalFormat,gt,K,pt.normalized,pt.colorSpace);ee(S)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Qt(S),it,S.width,S.height):O?s.renderbufferStorageMultisample(s.RENDERBUFFER,Qt(S),it,S.width,S.height):s.renderbufferStorage(s.RENDERBUFFER,it,S.width,S.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function xe(C,S,O){let G=S.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(s.FRAMEBUFFER,C),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let J=i.get(S.depthTexture);if(J.__renderTarget=S,(!J.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),G){if(J.__webglInit===void 0&&(J.__webglInit=!0,S.depthTexture.addEventListener("dispose",A)),J.__webglTexture===void 0){J.__webglTexture=s.createTexture(),e.bindTexture(s.TEXTURE_CUBE_MAP,J.__webglTexture),oe(s.TEXTURE_CUBE_MAP,S.depthTexture);let xt=r.convert(S.depthTexture.format),kt=r.convert(S.depthTexture.type),wt;S.depthTexture.format===Xn?wt=s.DEPTH_COMPONENT24:S.depthTexture.format===Vs&&(wt=s.DEPTH24_STENCIL8);for(let Mt=0;Mt<6;Mt++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,0,wt,S.width,S.height,0,xt,kt,null)}}else rt(S.depthTexture,0);let pt=J.__webglTexture,gt=Qt(S),K=G?s.TEXTURE_CUBE_MAP_POSITIVE_X+O:s.TEXTURE_2D,it=S.depthTexture.format===Vs?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(S.depthTexture.format===Xn)ee(S)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,it,K,pt,0,gt):s.framebufferTexture2D(s.FRAMEBUFFER,it,K,pt,0);else if(S.depthTexture.format===Vs)ee(S)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,it,K,pt,0,gt):s.framebufferTexture2D(s.FRAMEBUFFER,it,K,pt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function st(C){let S=i.get(C),O=C.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==C.depthTexture){let G=C.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),G){let J=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,G.removeEventListener("dispose",J)};G.addEventListener("dispose",J),S.__depthDisposeCallback=J}S.__boundDepthTexture=G}if(C.depthTexture&&!S.__autoAllocateDepthBuffer)if(O)for(let G=0;G<6;G++)xe(S.__webglFramebuffer[G],C,G);else{let G=C.texture.mipmaps;G&&G.length>0?xe(S.__webglFramebuffer[0],C,0):xe(S.__webglFramebuffer,C,0)}else if(O){S.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(e.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer[G]),S.__webglDepthbuffer[G]===void 0)S.__webglDepthbuffer[G]=s.createRenderbuffer(),Yt(S.__webglDepthbuffer[G],C,!1);else{let J=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,pt=S.__webglDepthbuffer[G];s.bindRenderbuffer(s.RENDERBUFFER,pt),s.framebufferRenderbuffer(s.FRAMEBUFFER,J,s.RENDERBUFFER,pt)}}else{let G=C.texture.mipmaps;if(G&&G.length>0?e.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer[0]):e.bindFramebuffer(s.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=s.createRenderbuffer(),Yt(S.__webglDepthbuffer,C,!1);else{let J=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,pt=S.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,pt),s.framebufferRenderbuffer(s.FRAMEBUFFER,J,s.RENDERBUFFER,pt)}}e.bindFramebuffer(s.FRAMEBUFFER,null)}function ct(C,S,O){let G=i.get(C);S!==void 0&&Et(G.__webglFramebuffer,C,C.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),O!==void 0&&st(C)}function dt(C){let S=C.texture,O=i.get(C),G=i.get(S);C.addEventListener("dispose",_);let J=C.textures,pt=C.isWebGLCubeRenderTarget===!0,gt=J.length>1;if(gt||(G.__webglTexture===void 0&&(G.__webglTexture=s.createTexture()),G.__version=S.version,o.memory.textures++),pt){O.__webglFramebuffer=[];for(let K=0;K<6;K++)if(S.mipmaps&&S.mipmaps.length>0){O.__webglFramebuffer[K]=[];for(let it=0;it<S.mipmaps.length;it++)O.__webglFramebuffer[K][it]=s.createFramebuffer()}else O.__webglFramebuffer[K]=s.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){O.__webglFramebuffer=[];for(let K=0;K<S.mipmaps.length;K++)O.__webglFramebuffer[K]=s.createFramebuffer()}else O.__webglFramebuffer=s.createFramebuffer();if(gt)for(let K=0,it=J.length;K<it;K++){let xt=i.get(J[K]);xt.__webglTexture===void 0&&(xt.__webglTexture=s.createTexture(),o.memory.textures++)}if(C.samples>0&&ee(C)===!1){O.__webglMultisampledFramebuffer=s.createFramebuffer(),O.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let K=0;K<J.length;K++){let it=J[K];O.__webglColorRenderbuffer[K]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,O.__webglColorRenderbuffer[K]);let xt=r.convert(it.format,it.colorSpace),kt=r.convert(it.type),wt=y(it.internalFormat,xt,kt,it.normalized,it.colorSpace,C.isXRRenderTarget===!0),Mt=Qt(C);s.renderbufferStorageMultisample(s.RENDERBUFFER,Mt,wt,C.width,C.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+K,s.RENDERBUFFER,O.__webglColorRenderbuffer[K])}s.bindRenderbuffer(s.RENDERBUFFER,null),C.depthBuffer&&(O.__webglDepthRenderbuffer=s.createRenderbuffer(),Yt(O.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(pt){e.bindTexture(s.TEXTURE_CUBE_MAP,G.__webglTexture),oe(s.TEXTURE_CUBE_MAP,S);for(let K=0;K<6;K++)if(S.mipmaps&&S.mipmaps.length>0)for(let it=0;it<S.mipmaps.length;it++)Et(O.__webglFramebuffer[K][it],C,S,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+K,it);else Et(O.__webglFramebuffer[K],C,S,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);g(S)&&x(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(gt){for(let K=0,it=J.length;K<it;K++){let xt=J[K],kt=i.get(xt),wt=s.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(wt=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(wt,kt.__webglTexture),oe(wt,xt),Et(O.__webglFramebuffer,C,xt,s.COLOR_ATTACHMENT0+K,wt,0),g(xt)&&x(wt)}e.unbindTexture()}else{let K=s.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(K=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(K,G.__webglTexture),oe(K,S),S.mipmaps&&S.mipmaps.length>0)for(let it=0;it<S.mipmaps.length;it++)Et(O.__webglFramebuffer[it],C,S,s.COLOR_ATTACHMENT0,K,it);else Et(O.__webglFramebuffer,C,S,s.COLOR_ATTACHMENT0,K,0);g(S)&&x(K),e.unbindTexture()}C.depthBuffer&&st(C)}function ft(C){let S=C.textures;for(let O=0,G=S.length;O<G;O++){let J=S[O];if(g(J)){let pt=M(C),gt=i.get(J).__webglTexture;e.bindTexture(pt,gt),x(pt),e.unbindTexture()}}}let mt=[],$t=[];function qt(C){if(C.samples>0){if(ee(C)===!1){let S=C.textures,O=C.width,G=C.height,J=s.COLOR_BUFFER_BIT,pt=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,gt=i.get(C),K=S.length>1;if(K)for(let xt=0;xt<S.length;xt++)e.bindFramebuffer(s.FRAMEBUFFER,gt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+xt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,gt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+xt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,gt.__webglMultisampledFramebuffer);let it=C.texture.mipmaps;it&&it.length>0?e.bindFramebuffer(s.DRAW_FRAMEBUFFER,gt.__webglFramebuffer[0]):e.bindFramebuffer(s.DRAW_FRAMEBUFFER,gt.__webglFramebuffer);for(let xt=0;xt<S.length;xt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(J|=s.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(J|=s.STENCIL_BUFFER_BIT)),K){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,gt.__webglColorRenderbuffer[xt]);let kt=i.get(S[xt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,kt,0)}s.blitFramebuffer(0,0,O,G,0,0,O,G,J,s.NEAREST),l===!0&&(mt.length=0,$t.length=0,mt.push(s.COLOR_ATTACHMENT0+xt),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(mt.push(pt),$t.push(pt),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,$t)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,mt))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),K)for(let xt=0;xt<S.length;xt++){e.bindFramebuffer(s.FRAMEBUFFER,gt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+xt,s.RENDERBUFFER,gt.__webglColorRenderbuffer[xt]);let kt=i.get(S[xt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,gt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+xt,s.TEXTURE_2D,kt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,gt.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let S=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[S])}}}function Qt(C){return Math.min(n.maxSamples,C.samples)}function ee(C){let S=i.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function D(C){let S=o.render.frame;h.get(C)!==S&&(h.set(C,S),C.update())}function Te(C,S){let O=C.colorSpace,G=C.format,J=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||O!==ua&&O!==_s&&(ye.getTransfer(O)===Ce?(G!==vn||J!==Fi)&&jt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):te("WebGLTextures: Unsupported texture color space:",O)),S}function me(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=q,this.resetTextureUnits=H,this.getTextureUnits=L,this.setTextureUnits=B,this.setTexture2D=rt,this.setTexture2DArray=Z,this.setTexture3D=tt,this.setTextureCube=nt,this.rebindTextures=ct,this.setupRenderTarget=dt,this.updateRenderTargetMipmap=ft,this.updateMultisampleRenderTarget=qt,this.setupDepthRenderbuffer=st,this.setupFrameBufferTexture=Et,this.useMultisampledRTT=ee,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function ab(s,t){function e(i,n=_s){let r,o=ye.getTransfer(n);if(i===Fi)return s.UNSIGNED_BYTE;if(i===Vc)return s.UNSIGNED_SHORT_4_4_4_4;if(i===Gc)return s.UNSIGNED_SHORT_5_5_5_1;if(i===dd)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===fd)return s.UNSIGNED_INT_10F_11F_11F_REV;if(i===hd)return s.BYTE;if(i===ud)return s.SHORT;if(i===fo)return s.UNSIGNED_SHORT;if(i===kc)return s.INT;if(i===Nn)return s.UNSIGNED_INT;if(i===gn)return s.FLOAT;if(i===hi)return s.HALF_FLOAT;if(i===pd)return s.ALPHA;if(i===md)return s.RGB;if(i===vn)return s.RGBA;if(i===Xn)return s.DEPTH_COMPONENT;if(i===Vs)return s.DEPTH_STENCIL;if(i===Wc)return s.RED;if(i===qc)return s.RED_INTEGER;if(i===Gs)return s.RG;if(i===Xc)return s.RG_INTEGER;if(i===Yc)return s.RGBA_INTEGER;if(i===tl||i===el||i===il||i===nl)if(o===Ce)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===tl)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===el)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===il)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===nl)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===tl)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===el)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===il)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===nl)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Zc||i===$c||i===Jc||i===Kc)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Zc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===$c)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Jc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Kc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===jc||i===Qc||i===th||i===eh||i===ih||i===sl||i===nh)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===jc||i===Qc)return o===Ce?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===th)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===eh)return r.COMPRESSED_R11_EAC;if(i===ih)return r.COMPRESSED_SIGNED_R11_EAC;if(i===sl)return r.COMPRESSED_RG11_EAC;if(i===nh)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===sh||i===rh||i===oh||i===ah||i===lh||i===ch||i===hh||i===uh||i===dh||i===fh||i===ph||i===mh||i===gh||i===vh)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===sh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===rh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===oh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===ah)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===lh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===ch)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===hh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===uh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===dh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===fh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===ph)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===mh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===gh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===vh)return o===Ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===xh||i===yh||i===_h)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===xh)return o===Ce?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===yh)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===_h)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Mh||i===bh||i===rl||i===Sh)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===Mh)return r.COMPRESSED_RED_RGTC1_EXT;if(i===bh)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===rl)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Sh)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===po?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:e}}var lb=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,cb=`
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

}`,Vd=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new wa(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new fe({vertexShader:lb,fragmentShader:cb,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ot(new oi(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Gd=class extends Yn{constructor(t,e){super();let i=this,n=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,m=null,v=typeof XRWebGLBinding<"u",p=new Vd,g={},x=e.getContextAttributes(),M=null,y=null,b=[],E=[],A=new j,_=null,R=null,P=new ei;P.viewport=new je;let I=new ei;I.viewport=new je;let N=[P,I],H=new Fc,L=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let Q=b[X];return Q===void 0&&(Q=new Qr,b[X]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(X){let Q=b[X];return Q===void 0&&(Q=new Qr,b[X]=Q),Q.getGripSpace()},this.getHand=function(X){let Q=b[X];return Q===void 0&&(Q=new Qr,b[X]=Q),Q.getHandSpace()};function q(X){let Q=E.indexOf(X.inputSource);if(Q===-1)return;let vt=b[Q];vt!==void 0&&(vt.update(X.inputSource,X.frame,c||o),vt.dispatchEvent({type:X.type,data:X.inputSource}))}function Y(){n.removeEventListener("select",q),n.removeEventListener("selectstart",q),n.removeEventListener("selectend",q),n.removeEventListener("squeeze",q),n.removeEventListener("squeezestart",q),n.removeEventListener("squeezeend",q),n.removeEventListener("end",Y),n.removeEventListener("inputsourceschange",rt);for(let X=0;X<b.length;X++){let Q=E[X];Q!==null&&(E[X]=null,b[X].disconnect(Q))}L=null,B=null,p.reset();for(let X in g)delete g[X];if(t.setRenderTarget(M),f=null,d=null,u=null,n=null,y=null,ae.stop(),i.isPresenting=!1,t.setPixelRatio(_),t.setSize(A.width,A.height,!1),R!==null){let X=R.camera;X.fov=R.fov,X.zoom=R.zoom,X.updateProjectionMatrix(),R=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,i.isPresenting===!0&&jt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){a=X,i.isPresenting===!0&&jt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(X){c=X},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&v&&(u=new XRWebGLBinding(n,e)),u},this.getFrame=function(){return m},this.getSession=function(){return n},this.setSession=async function(X){if(n=X,n!==null){if(M=t.getRenderTarget(),n.addEventListener("select",q),n.addEventListener("selectstart",q),n.addEventListener("selectend",q),n.addEventListener("squeeze",q),n.addEventListener("squeezestart",q),n.addEventListener("squeezeend",q),n.addEventListener("end",Y),n.addEventListener("inputsourceschange",rt),x.xrCompatible!==!0&&await e.makeXRCompatible(),_=t.getPixelRatio(),t.getSize(A),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let vt=null,Wt=null,Et=null;x.depth&&(Et=x.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,vt=x.stencil?Vs:Xn,Wt=x.stencil?po:Nn);let Yt={colorFormat:e.RGBA8,depthFormat:Et,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Yt),n.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),y=new Qe(d.textureWidth,d.textureHeight,{format:vn,type:Fi,depthTexture:new Ns(d.textureWidth,d.textureHeight,Wt,void 0,void 0,void 0,void 0,void 0,void 0,vt),stencilBuffer:x.stencil,colorSpace:t.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let vt={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(n,e,vt),n.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Qe(f.framebufferWidth,f.framebufferHeight,{format:vn,type:Fi,colorSpace:t.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await n.requestReferenceSpace(a),ae.setContext(n),ae.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function rt(X){for(let Q=0;Q<X.removed.length;Q++){let vt=X.removed[Q],Wt=E.indexOf(vt);Wt>=0&&(E[Wt]=null,b[Wt].disconnect(vt))}for(let Q=0;Q<X.added.length;Q++){let vt=X.added[Q],Wt=E.indexOf(vt);if(Wt===-1){for(let Yt=0;Yt<b.length;Yt++)if(Yt>=E.length){E.push(vt),Wt=Yt;break}else if(E[Yt]===null){E[Yt]=vt,Wt=Yt;break}if(Wt===-1)break}let Et=b[Wt];Et&&Et.connect(vt)}}let Z=new w,tt=new w;function nt(X,Q,vt){Z.setFromMatrixPosition(Q.matrixWorld),tt.setFromMatrixPosition(vt.matrixWorld);let Wt=Z.distanceTo(tt),Et=Q.projectionMatrix.elements,Yt=vt.projectionMatrix.elements,xe=Et[14]/(Et[10]-1),st=Et[14]/(Et[10]+1),ct=(Et[9]+1)/Et[5],dt=(Et[9]-1)/Et[5],ft=(Et[8]-1)/Et[0],mt=(Yt[8]+1)/Yt[0],$t=xe*ft,qt=xe*mt,Qt=Wt/(-ft+mt),ee=Qt*-ft;if(Q.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(ee),X.translateZ(Qt),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),Et[10]===-1)X.projectionMatrix.copy(Q.projectionMatrix),X.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{let D=xe+Qt,Te=st+Qt,me=$t-ee,C=qt+(Wt-ee),S=ct*st/Te*D,O=dt*st/Te*D;X.projectionMatrix.makePerspective(me,C,S,O,D,Te),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function Dt(X,Q){Q===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(Q.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(n===null)return;let Q=X.near,vt=X.far;p.texture!==null&&(p.depthNear>0&&(Q=p.depthNear),p.depthFar>0&&(vt=p.depthFar)),H.near=I.near=P.near=Q,H.far=I.far=P.far=vt,(L!==H.near||B!==H.far)&&(n.updateRenderState({depthNear:H.near,depthFar:H.far}),L=H.near,B=H.far),H.layers.mask=X.layers.mask|6,P.layers.mask=H.layers.mask&-5,I.layers.mask=H.layers.mask&-3;let Wt=X.parent,Et=H.cameras;Dt(H,Wt);for(let Yt=0;Yt<Et.length;Yt++)Dt(Et[Yt],Wt);Et.length===2?nt(H,P,I):H.projectionMatrix.copy(P.projectionMatrix),R===null&&X.isPerspectiveCamera&&(R={camera:X,fov:X.fov,zoom:X.zoom}),Pt(X,H,Wt)};function Pt(X,Q,vt){vt===null?X.matrix.copy(Q.matrixWorld):(X.matrix.copy(vt.matrixWorld),X.matrix.invert(),X.matrix.multiply(Q.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(Q.projectionMatrix),X.projectionMatrixInverse.copy(Q.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=Kr*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return H},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(X){l=X,d!==null&&(d.fixedFoveation=X),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=X)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(H)},this.getCameraTexture=function(X){return g[X]};let ce=null;function oe(X,Q){if(h=Q.getViewerPose(c||o),m=Q,h!==null){let vt=h.views;f!==null&&(t.setRenderTargetFramebuffer(y,f.framebuffer),t.setRenderTarget(y));let Wt=!1;vt.length!==H.cameras.length&&(H.cameras.length=0,Wt=!0);for(let st=0;st<vt.length;st++){let ct=vt[st],dt=null;if(f!==null)dt=f.getViewport(ct);else{let mt=u.getViewSubImage(d,ct);dt=mt.viewport,st===0&&(t.setRenderTargetTextures(y,mt.colorTexture,mt.depthStencilTexture),t.setRenderTarget(y))}let ft=N[st];ft===void 0&&(ft=new ei,ft.layers.enable(st),ft.viewport=new je,N[st]=ft),ft.matrix.fromArray(ct.transform.matrix),ft.matrix.decompose(ft.position,ft.quaternion,ft.scale),ft.projectionMatrix.fromArray(ct.projectionMatrix),ft.projectionMatrixInverse.copy(ft.projectionMatrix).invert(),ft.viewport.set(dt.x,dt.y,dt.width,dt.height),st===0&&(H.matrix.copy(ft.matrix),H.matrix.decompose(H.position,H.quaternion,H.scale)),Wt===!0&&H.cameras.push(ft)}let Et=n.enabledFeatures;if(Et&&Et.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&v){u=i.getBinding();let st=u.getDepthInformation(vt[0]);st&&st.isValid&&st.texture&&p.init(st,n.renderState)}if(Et&&Et.includes("camera-access")&&v){t.state.unbindTexture(),u=i.getBinding();for(let st=0;st<vt.length;st++){let ct=vt[st].camera;if(ct){let dt=g[ct];dt||(dt=new wa,g[ct]=dt);let ft=u.getCameraImage(ct);dt.sourceTexture=ft}}}}for(let vt=0;vt<b.length;vt++){let Wt=E[vt],Et=b[vt];Wt!==null&&Et!==void 0&&Et.update(Wt,Q,c||o)}ce&&ce(X,Q),Q.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Q}),m=null}let ae=new Im;ae.setAnimationLoop(oe),this.setAnimationLoop=function(X){ce=X},this.dispose=function(){}}},hb=new Me,Bm=new ie;Bm.set(-1,0,0,0,1,0,0,0,1);function ub(s,t){function e(p,g){p.matrixAutoUpdate===!0&&p.updateMatrix(),g.value.copy(p.matrix)}function i(p,g){g.color.getRGB(p.fogColor.value,_d(s)),g.isFog?(p.fogNear.value=g.near,p.fogFar.value=g.far):g.isFogExp2&&(p.fogDensity.value=g.density)}function n(p,g,x,M,y){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(p,g):g.isMeshLambertMaterial?(r(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(p,g),u(p,g)):g.isMeshPhongMaterial?(r(p,g),h(p,g),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(p,g),d(p,g),g.isMeshPhysicalMaterial&&f(p,g,y)):g.isMeshMatcapMaterial?(r(p,g),m(p,g)):g.isMeshDepthMaterial?r(p,g):g.isMeshDistanceMaterial?(r(p,g),v(p,g)):g.isMeshNormalMaterial?r(p,g):g.isLineBasicMaterial?(o(p,g),g.isLineDashedMaterial&&a(p,g)):g.isPointsMaterial?l(p,g,x,M):g.isSpriteMaterial?c(p,g):g.isShadowMaterial?(p.color.value.copy(g.color),p.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(p,g){p.opacity.value=g.opacity,g.color&&p.diffuse.value.copy(g.color),g.emissive&&p.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(p.map.value=g.map,e(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,e(g.alphaMap,p.alphaMapTransform)),g.bumpMap&&(p.bumpMap.value=g.bumpMap,e(g.bumpMap,p.bumpMapTransform),p.bumpScale.value=g.bumpScale,g.side===_i&&(p.bumpScale.value*=-1)),g.normalMap&&(p.normalMap.value=g.normalMap,e(g.normalMap,p.normalMapTransform),p.normalScale.value.copy(g.normalScale),g.side===_i&&p.normalScale.value.negate()),g.displacementMap&&(p.displacementMap.value=g.displacementMap,e(g.displacementMap,p.displacementMapTransform),p.displacementScale.value=g.displacementScale,p.displacementBias.value=g.displacementBias),g.emissiveMap&&(p.emissiveMap.value=g.emissiveMap,e(g.emissiveMap,p.emissiveMapTransform)),g.specularMap&&(p.specularMap.value=g.specularMap,e(g.specularMap,p.specularMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest);let x=t.get(g),M=x.envMap,y=x.envMapRotation;M&&(p.envMap.value=M,p.envMapRotation.value.setFromMatrix4(hb.makeRotationFromEuler(y)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Bm),p.reflectivity.value=g.reflectivity,p.ior.value=g.ior,p.refractionRatio.value=g.refractionRatio),g.lightMap&&(p.lightMap.value=g.lightMap,p.lightMapIntensity.value=g.lightMapIntensity,e(g.lightMap,p.lightMapTransform)),g.aoMap&&(p.aoMap.value=g.aoMap,p.aoMapIntensity.value=g.aoMapIntensity,e(g.aoMap,p.aoMapTransform))}function o(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,g.map&&(p.map.value=g.map,e(g.map,p.mapTransform))}function a(p,g){p.dashSize.value=g.dashSize,p.totalSize.value=g.dashSize+g.gapSize,p.scale.value=g.scale}function l(p,g,x,M){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.size.value=g.size*x,p.scale.value=M*.5,g.map&&(p.map.value=g.map,e(g.map,p.uvTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,e(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function c(p,g){p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.rotation.value=g.rotation,g.map&&(p.map.value=g.map,e(g.map,p.mapTransform)),g.alphaMap&&(p.alphaMap.value=g.alphaMap,e(g.alphaMap,p.alphaMapTransform)),g.alphaTest>0&&(p.alphaTest.value=g.alphaTest)}function h(p,g){p.specular.value.copy(g.specular),p.shininess.value=Math.max(g.shininess,1e-4)}function u(p,g){g.gradientMap&&(p.gradientMap.value=g.gradientMap)}function d(p,g){p.metalness.value=g.metalness,g.metalnessMap&&(p.metalnessMap.value=g.metalnessMap,e(g.metalnessMap,p.metalnessMapTransform)),p.roughness.value=g.roughness,g.roughnessMap&&(p.roughnessMap.value=g.roughnessMap,e(g.roughnessMap,p.roughnessMapTransform)),g.envMap&&(p.envMapIntensity.value=g.envMapIntensity)}function f(p,g,x){p.ior.value=g.ior,g.sheen>0&&(p.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),p.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(p.sheenColorMap.value=g.sheenColorMap,e(g.sheenColorMap,p.sheenColorMapTransform)),g.sheenRoughnessMap&&(p.sheenRoughnessMap.value=g.sheenRoughnessMap,e(g.sheenRoughnessMap,p.sheenRoughnessMapTransform))),g.clearcoat>0&&(p.clearcoat.value=g.clearcoat,p.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(p.clearcoatMap.value=g.clearcoatMap,e(g.clearcoatMap,p.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,e(g.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(p.clearcoatNormalMap.value=g.clearcoatNormalMap,e(g.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===_i&&p.clearcoatNormalScale.value.negate())),g.dispersion>0&&(p.dispersion.value=g.dispersion),g.retroreflectivity>0&&(p.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(p.iridescence.value=g.iridescence,p.iridescenceIOR.value=g.iridescenceIOR,p.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(p.iridescenceMap.value=g.iridescenceMap,e(g.iridescenceMap,p.iridescenceMapTransform)),g.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=g.iridescenceThicknessMap,e(g.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),g.transmission>0&&(p.transmission.value=g.transmission,p.transmissionSamplerMap.value=x.texture,p.transmissionSamplerSize.value.set(x.width,x.height),g.transmissionMap&&(p.transmissionMap.value=g.transmissionMap,e(g.transmissionMap,p.transmissionMapTransform)),p.thickness.value=g.thickness,g.thicknessMap&&(p.thicknessMap.value=g.thicknessMap,e(g.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=g.attenuationDistance,p.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(p.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(p.anisotropyMap.value=g.anisotropyMap,e(g.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=g.specularIntensity,p.specularColor.value.copy(g.specularColor),g.specularColorMap&&(p.specularColorMap.value=g.specularColorMap,e(g.specularColorMap,p.specularColorMapTransform)),g.specularIntensityMap&&(p.specularIntensityMap.value=g.specularIntensityMap,e(g.specularIntensityMap,p.specularIntensityMapTransform))}function m(p,g){g.matcap&&(p.matcap.value=g.matcap)}function v(p,g){let x=t.get(g).light;p.referencePosition.value.setFromMatrixPosition(x.matrixWorld),p.nearDistance.value=x.shadow.camera.near,p.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function db(s,t,e,i){let n={},r={},o=[],a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,b){let E=b.program;i.uniformBlockBinding(y,E)}function c(y,b){let E=n[y.id];E===void 0&&(p(y),E=h(y),n[y.id]=E,y.addEventListener("dispose",x));let A=b.program;i.updateUBOMapping(y,A);let _=t.render.frame;r[y.id]!==_&&(d(y),r[y.id]=_)}function h(y){let b=u();y.__bindingPointIndex=b;let E=s.createBuffer(),A=y.__size,_=y.usage;return s.bindBuffer(s.UNIFORM_BUFFER,E),s.bufferData(s.UNIFORM_BUFFER,A,_),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,b,E),E}function u(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return te("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){let b=n[y.id],E=y.uniforms,A=y.__cache;s.bindBuffer(s.UNIFORM_BUFFER,b);for(let _=0,R=E.length;_<R;_++){let P=E[_];if(Array.isArray(P))for(let I=0,N=P.length;I<N;I++)f(P[I],_,I,A);else f(P,_,0,A)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(y,b,E,A){if(v(y,b,E,A)===!0){let _=y.__offset,R=y.value;if(Array.isArray(R)){let P=0;for(let I=0;I<R.length;I++){let N=R[I],H=g(N);m(N,y.__data,P),typeof N!="number"&&typeof N!="boolean"&&!N.isMatrix3&&!ArrayBuffer.isView(N)&&(P+=H.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(R,y.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,_,y.__data)}}function m(y,b,E){typeof y=="number"||typeof y=="boolean"?b[0]=y:y.isMatrix3?(b[0]=y.elements[0],b[1]=y.elements[1],b[2]=y.elements[2],b[3]=0,b[4]=y.elements[3],b[5]=y.elements[4],b[6]=y.elements[5],b[7]=0,b[8]=y.elements[6],b[9]=y.elements[7],b[10]=y.elements[8],b[11]=0):ArrayBuffer.isView(y)?b.set(new y.constructor(y.buffer,y.byteOffset,b.length)):y.toArray(b,E)}function v(y,b,E,A){let _=y.value,R=b+"_"+E;if(A[R]===void 0)return typeof _=="number"||typeof _=="boolean"?A[R]=_:ArrayBuffer.isView(_)?A[R]=_.slice():A[R]=_.clone(),!0;{let P=A[R];if(typeof _=="number"||typeof _=="boolean"){if(P!==_)return A[R]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(P.equals(_)===!1)return P.copy(_),!0}}return!1}function p(y){let b=y.uniforms,E=0,A=16;for(let R=0,P=b.length;R<P;R++){let I=Array.isArray(b[R])?b[R]:[b[R]];for(let N=0,H=I.length;N<H;N++){let L=I[N],B=Array.isArray(L.value)?L.value:[L.value];for(let q=0,Y=B.length;q<Y;q++){let rt=B[q],Z=g(rt),tt=E%A,nt=tt%Z.boundary,Dt=tt+nt;E+=nt,Dt!==0&&A-Dt<Z.storage&&(E+=A-Dt),L.__data=new Float32Array(Z.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=E,E+=Z.storage}}}let _=E%A;return _>0&&(E+=A-_),y.__size=E,y.__cache={},this}function g(y){let b={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(b.boundary=4,b.storage=4):y.isVector2?(b.boundary=8,b.storage=8):y.isVector3||y.isColor?(b.boundary=16,b.storage=12):y.isVector4?(b.boundary=16,b.storage=16):y.isMatrix3?(b.boundary=48,b.storage=48):y.isMatrix4?(b.boundary=64,b.storage=64):y.isTexture?jt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(b.boundary=16,b.storage=y.byteLength):jt("WebGLRenderer: Unsupported uniform value type.",y),b}function x(y){let b=y.target;b.removeEventListener("dispose",x);let E=o.indexOf(b.__bindingPointIndex);o.splice(E,1),s.deleteBuffer(n[b.id]),delete n[b.id],delete r[b.id]}function M(){for(let y in n)s.deleteBuffer(n[y]);o=[],n={},r={}}return{bind:l,update:c,dispose:M}}var fb=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Qn=null;function pb(){return Qn===null&&(Qn=new Sa(fb,16,16,Gs,hi),Qn.name="DFG_LUT",Qn.minFilter=mi,Qn.magFilter=mi,Qn.wrapS=Gn,Qn.wrapT=Gn,Qn.generateMipmaps=!1,Qn.needsUpdate=!0),Qn}var Ph=class{constructor(t={}){let{canvas:e=jp(),context:i=null,depth:n=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Fi}=t;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=o;let v=f,p=new Set([Yc,Xc,qc]),g=new Set([Fi,Nn,fo,po,Vc,Gc]),x=new Uint32Array(4),M=new Int32Array(4),y=new w,b=null,E=null,A=[],_=[],R=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Dn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,I=!1,N=null,H=null,L=null,B=null;this._outputColorSpace=ze;let q=0,Y=0,rt=null,Z=-1,tt=null,nt=new je,Dt=new je,Pt=null,ce=new St(0),oe=0,ae=e.width,X=e.height,Q=1,vt=null,Wt=null,Et=new je(0,0,ae,X),Yt=new je(0,0,ae,X),xe=!1,st=new io,ct=!1,dt=!1,ft=new Me,mt=new w,$t=new je,qt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Qt=!1;function ee(){return rt===null?Q:1}let D=i;function Te(T,U){return e.getContext(T,U)}let me,C,S,O,G,J,pt,gt,K,it,xt,kt,wt,Mt,Vt,Jt,ne,F,yt,et,_t,At,at;try{let T={alpha:!0,depth:n,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",z,!1),e.addEventListener("webglcontextrestored",W,!1),e.addEventListener("webglcontextcreationerror",ut,!1),D===null){let U="webgl2";if(D=Te(U,T),D===null)throw Te(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Bt()}catch(T){throw e.removeEventListener("webglcontextlost",z,!1),e.removeEventListener("webglcontextrestored",W,!1),e.removeEventListener("webglcontextcreationerror",ut,!1),te("WebGLRenderer: "+T.message),T}function Bt(){me=new M_(D),me.init(),_t=new ab(D,me),C=new u_(D,me,t,_t),S=new rb(D,me),C.reversedDepthBuffer&&d&&S.buffers.depth.setReversed(!0),H=D.createFramebuffer(),L=D.createFramebuffer(),B=D.createFramebuffer(),O=new E_(D),G=new qM,J=new ob(D,me,S,G,C,_t,O),pt=new __(P),gt=new Tv(D),At=new c_(D,gt),K=new b_(D,gt,O,At),it=new T_(D,K,gt,At,O),F=new w_(D,C,J),Vt=new d_(G),xt=new WM(P,pt,me,C,At,Vt),kt=new ub(P,G),wt=new YM,Mt=new QM(me),ne=new l_(P,pt,S,it,m,l),Jt=new sb(P,it,C),at=new db(D,O,C,S),yt=new h_(D,me,O),et=new S_(D,me,O),O.programs=xt.programs,P.capabilities=C,P.extensions=me,P.properties=G,P.renderLists=wt,P.shadowMap=Jt,P.state=S,P.info=O}v!==Fi&&(R=new R_(v,e.width,e.height,a,n,r));let Ut=new Gd(P,D);this.xr=Ut,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let T=me.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=me.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(T){T!==void 0&&(Q=T,this.setSize(ae,X,!1))},this.getSize=function(T){return T.set(ae,X)},this.setSize=function(T,U,$=!0){if(Ut.isPresenting){jt("WebGLRenderer: Can't change size while VR device is presenting.");return}ae=T,X=U,e.width=Math.floor(T*Q),e.height=Math.floor(U*Q),$===!0&&(e.style.width=T+"px",e.style.height=U+"px"),R!==null&&R.setSize(e.width,e.height),this.setViewport(0,0,T,U)},this.getDrawingBufferSize=function(T){return T.set(ae*Q,X*Q).floor()},this.setDrawingBufferSize=function(T,U,$){ae=T,X=U,Q=$,e.width=Math.floor(T*$),e.height=Math.floor(U*$),this.setViewport(0,0,T,U)},this.setEffects=function(T){if(v===Fi){te("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let U=0;U<T.length;U++)if(T[U].isOutputPass===!0){jt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}R.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy(nt)},this.getViewport=function(T){return T.copy(Et)},this.setViewport=function(T,U,$,k){T.isVector4?Et.set(T.x,T.y,T.z,T.w):Et.set(T,U,$,k),S.viewport(nt.copy(Et).multiplyScalar(Q).round())},this.getScissor=function(T){return T.copy(Yt)},this.setScissor=function(T,U,$,k){T.isVector4?Yt.set(T.x,T.y,T.z,T.w):Yt.set(T,U,$,k),S.scissor(Dt.copy(Yt).multiplyScalar(Q).round())},this.getScissorTest=function(){return xe},this.setScissorTest=function(T){S.setScissorTest(xe=T)},this.setOpaqueSort=function(T){vt=T},this.setTransparentSort=function(T){Wt=T},this.getClearColor=function(T){return T.copy(ne.getClearColor())},this.setClearColor=function(){ne.setClearColor(...arguments)},this.getClearAlpha=function(){return ne.getClearAlpha()},this.setClearAlpha=function(){ne.setClearAlpha(...arguments)},this.clear=function(T=!0,U=!0,$=!0){let k=0;if(T){let V=!1;if(rt!==null){let Ct=rt.texture.format;V=p.has(Ct)}if(V){let Ct=rt.texture.type,Nt=g.has(Ct),Rt=ne.getClearColor(),Ht=ne.getClearAlpha(),Gt=Rt.r,ue=Rt.g,be=Rt.b;Nt?(x[0]=Gt,x[1]=ue,x[2]=be,x[3]=Ht,D.clearBufferuiv(D.COLOR,0,x)):(M[0]=Gt,M[1]=ue,M[2]=be,M[3]=Ht,D.clearBufferiv(D.COLOR,0,M))}else k|=D.COLOR_BUFFER_BIT}U&&(k|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),$&&(k|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),k!==0&&D.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),N=T},this.dispose=function(){e.removeEventListener("webglcontextlost",z,!1),e.removeEventListener("webglcontextrestored",W,!1),e.removeEventListener("webglcontextcreationerror",ut,!1),ne.dispose(),wt.dispose(),Mt.dispose(),G.dispose(),pt.dispose(),it.dispose(),At.dispose(),at.dispose(),xt.dispose(),Ut.dispose(),Ut.removeEventListener("sessionstart",Fe),Ut.removeEventListener("sessionend",$e),yi.stop()};function z(T){T.preventDefault(),pa("WebGLRenderer: Context Lost."),I=!0}function W(){pa("WebGLRenderer: Context Restored."),I=!1;let T=O.autoReset,U=Jt.enabled,$=Jt.autoUpdate,k=Jt.needsUpdate,V=Jt.type;Bt(),O.autoReset=T,Jt.enabled=U,Jt.autoUpdate=$,Jt.needsUpdate=k,Jt.type=V}function ut(T){te("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function bt(T){let U=T.target;U.removeEventListener("dispose",bt),Xt(U)}function Xt(T){se(T),G.remove(T)}function se(T){let U=G.get(T).programs;U!==void 0&&(U.forEach(function($){xt.releaseProgram($)}),T.isShaderMaterial&&xt.releaseShaderCache(T))}this.renderBufferDirect=function(T,U,$,k,V,Ct){U===null&&(U=qt);let Nt=V.isMesh&&V.matrixWorld.determinantAffine()<0,Rt=Xo(T,U,$,k,V);S.setMaterial(k,Nt);let Ht=$.index,Gt=1;if(k.wireframe===!0){if(Ht=K.getWireframeAttribute($),Ht===void 0)return;Gt=2}let ue=$.drawRange,be=$.attributes.position,zt=ue.start*Gt,Le=(ue.start+ue.count)*Gt;Ct!==null&&(zt=Math.max(zt,Ct.start*Gt),Le=Math.min(Le,(Ct.start+Ct.count)*Gt)),Ht!==null?(zt=Math.max(zt,0),Le=Math.min(Le,Ht.count)):be!=null&&(zt=Math.max(zt,0),Le=Math.min(Le,be.count));let di=Le-zt;if(di<0||di===1/0)return;At.setup(V,k,Rt,$,Ht);let Je,Ve=yt;if(Ht!==null&&(Je=gt.get(Ht),Ve=et,Ve.setIndex(Je)),V.isMesh)k.wireframe===!0?(S.setLineWidth(k.wireframeLinewidth*ee()),Ve.setMode(D.LINES)):Ve.setMode(D.TRIANGLES);else if(V.isLine){let Di=k.linewidth;Di===void 0&&(Di=1),S.setLineWidth(Di*ee()),V.isLineSegments?Ve.setMode(D.LINES):V.isLineLoop?Ve.setMode(D.LINE_LOOP):Ve.setMode(D.LINE_STRIP)}else V.isPoints?Ve.setMode(D.POINTS):V.isSprite&&Ve.setMode(D.TRIANGLES);if(V.isBatchedMesh)if(me.get("WEBGL_multi_draw"))Ve.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{let Di=V._multiDrawStarts,Lt=V._multiDrawCounts,ki=V._multiDrawCount,Re=Ht?gt.get(Ht).bytesPerElement:1,dn=G.get(k).currentProgram.getUniforms();for(let kn=0;kn<ki;kn++)dn.setValue(D,"_gl_DrawID",kn),Ve.render(Di[kn]/Re,Lt[kn])}else if(V.isInstancedMesh)Ve.renderInstances(zt,di,V.count);else if($.isInstancedBufferGeometry){let Di=$._maxInstanceCount!==void 0?$._maxInstanceCount:1/0,Lt=Math.min($.instanceCount,Di);Ve.renderInstances(zt,di,Lt)}else Ve.render(zt,di)};function Ot(T,U,$,k){N!==null&&T.isNodeMaterial&&N.setObject(k,T),ct===!0&&Vt.setState(T,$,!1),T.transparent===!0&&T.side===re&&T.forceSinglePass===!1?(T.side=_i,T.needsUpdate=!0,cs(T,U,k),T.side=Hs,T.needsUpdate=!0,cs(T,U,k),T.side=re):cs(T,U,k)}this.compile=function(T,U,$=null){$===null&&($=T),N!==null&&N.renderStart(T,U,$),E=Mt.get($),E.init(U),_.push(E),$.traverseVisible(function(V){V.isLight&&V.layers.test(U.layers)&&(E.pushLight(V),V.castShadow&&E.pushShadow(V))}),T!==$&&T.traverseVisible(function(V){V.isLight&&V.layers.test(U.layers)&&(E.pushLight(V),V.castShadow&&E.pushShadow(V))}),E.setupLights(),N!==null&&N.updateLights(E.state.lightsArray),dt=this.localClippingEnabled,ct=Vt.init(this.clippingPlanes,dt),ct===!0&&Vt.setGlobalState(this.clippingPlanes,U),N!==null&&Jt.render(E.state.shadowsArray,$,U);let k=new Set;return T.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;let Ct=V.material;if(Ct)if(Array.isArray(Ct))for(let Nt=0;Nt<Ct.length;Nt++){let Rt=Ct[Nt];Ot(Rt,$,U,V),k.add(Rt)}else Ot(Ct,$,U,V),k.add(Ct)}),E=_.pop(),N!==null&&N.renderEnd(),k},this.compileAsync=function(T,U,$=null){let k=this.compile(T,U,$);return new Promise(V=>{function Ct(){if(k.forEach(function(Nt){let Ht=G.get(Nt).currentProgram;(Ht===void 0||Ht.isReady())&&k.delete(Nt)}),k.size===0){V(T);return}setTimeout(Ct,10)}me.get("KHR_parallel_shader_compile")!==null?Ct():setTimeout(Ct,10)})};let Pe=null;function Ae(T){Pe&&Pe(T)}function Fe(){yi.stop()}function $e(){yi.start()}let yi=new Im;yi.setAnimationLoop(Ae),typeof self<"u"&&yi.setContext(self),this.setAnimationLoop=function(T){Pe=T,Ut.setAnimationLoop(T),T===null?yi.stop():yi.start()},Ut.addEventListener("sessionstart",Fe),Ut.addEventListener("sessionend",$e),this.render=function(T,U){if(U!==void 0&&U.isCamera!==!0){te("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;N!==null&&N.renderStart(T,U);let $=Ut.enabled===!0&&Ut.isPresenting===!0,k=R!==null&&(rt===null||$)&&R.begin(P,rt);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),Ut.enabled===!0&&Ut.isPresenting===!0&&(R===null||R.isCompositing()===!1)&&(Ut.cameraAutoUpdate===!0&&Ut.updateCamera(U),U=Ut.getCamera()),T.isScene===!0&&T.onBeforeRender(P,T,U,rt),E=Mt.get(T,_.length),E.init(U),E.state.textureUnits=J.getTextureUnits(),_.push(E),ft.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),st.setFromProjectionMatrix(ft,Cn,U.reversedDepth),dt=this.localClippingEnabled,ct=Vt.init(this.clippingPlanes,dt),b=wt.get(T,A.length),b.init(),A.push(b),Ut.enabled===!0&&Ut.isPresenting===!0){let Nt=P.xr.getDepthSensingMesh();Nt!==null&&$i(Nt,U,-1/0,P.sortObjects)}$i(T,U,0,P.sortObjects),b.finish(),N!==null&&N.updateLights(E.state.lightsArray),P.sortObjects===!0&&b.sort(vt,Wt),Qt=Ut.enabled===!1||Ut.isPresenting===!1||Ut.hasDepthSensing()===!1,Qt&&ne.addToRenderList(b,T),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ct===!0&&Vt.beginShadows();let V=E.state.shadowsArray;if(Jt.render(V,T,U),ct===!0&&Vt.endShadows(),(k&&R.hasRenderPass())===!1){let Nt=b.opaque,Rt=b.transmissive;if(E.setupLights(),U.isArrayCamera){let Ht=U.cameras;if(Rt.length>0)for(let Gt=0,ue=Ht.length;Gt<ue;Gt++){let be=Ht[Gt];ls(Nt,Rt,T,be)}Qt&&ne.render(T);for(let Gt=0,ue=Ht.length;Gt<ue;Gt++){let be=Ht[Gt];En(b,T,be,be.viewport)}}else Rt.length>0&&ls(Nt,Rt,T,U),Qt&&ne.render(T),En(b,T,U)}rt!==null&&Y===0&&(J.updateMultisampleRenderTarget(rt),J.updateRenderTargetMipmap(rt)),k&&R.end(P),T.isScene===!0&&T.onAfterRender(P,T,U),At.resetDefaultState(),Z=-1,tt=null,_.pop(),_.length>0?(E=_[_.length-1],J.setTextureUnits(E.state.textureUnits),ct===!0&&Vt.setGlobalState(P.clippingPlanes,E.state.camera)):E=null,A.pop(),A.length>0?b=A[A.length-1]:b=null,N!==null&&N.renderEnd()};function $i(T,U,$,k){if(T.visible===!1)return;if(T.layers.test(U.layers)){if(T.isGroup)$=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(U);else if(T.isLightProbeGrid)E.pushLightProbeGrid(T);else if(T.isLight)E.pushLight(T),T.castShadow&&E.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||T.intersectsFrustum(st)){k&&$t.setFromMatrixPosition(T.matrixWorld).applyMatrix4(ft);let Nt=it.update(T),Rt=T.material;Rt.visible&&b.push(T,Nt,Rt,$,$t.z,null,U)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||T.intersectsFrustum(st))){let Nt=it.update(T),Rt=T.material;if(k&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),$t.copy(T.boundingSphere.center)):(Nt.boundingSphere===null&&Nt.computeBoundingSphere(),$t.copy(Nt.boundingSphere.center)),$t.applyMatrix4(T.matrixWorld).applyMatrix4(ft)),Array.isArray(Rt)){let Ht=Nt.groups;for(let Gt=0,ue=Ht.length;Gt<ue;Gt++){let be=Ht[Gt],zt=Rt[be.materialIndex];zt&&zt.visible&&b.push(T,Nt,zt,$,$t.z,be,U)}}else Rt.visible&&b.push(T,Nt,Rt,$,$t.z,null,U)}}let Ct=T.children;for(let Nt=0,Rt=Ct.length;Nt<Rt;Nt++)$i(Ct[Nt],U,$,k)}function En(T,U,$,k){let{opaque:V,transmissive:Ct,transparent:Nt}=T;E.setupLightsView($),ct===!0&&Vt.setGlobalState(P.clippingPlanes,$),k&&S.viewport(nt.copy(k)),V.length>0&&zn(V,U,$),Ct.length>0&&zn(Ct,U,$),Nt.length>0&&zn(Nt,U,$),S.buffers.depth.setTest(!0),S.buffers.depth.setMask(!0),S.buffers.color.setMask(!0),S.setPolygonOffset(!1)}function ls(T,U,$,k){if(($.isScene===!0?$.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[k.id]===void 0){let zt=me.has("EXT_color_buffer_half_float")||me.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[k.id]=new Qe(1,1,{generateMipmaps:!0,type:zt?hi:Fi,minFilter:ks,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ye.workingColorSpace})}let Ct=E.state.transmissionRenderTarget[k.id],Nt=k.viewport||nt;Ct.setSize(Nt.z*P.transmissionResolutionScale,Nt.w*P.transmissionResolutionScale);let Rt=P.getRenderTarget(),Ht=P.getActiveCubeFace(),Gt=P.getActiveMipmapLevel();P.setRenderTarget(Ct),P.getClearColor(ce),oe=P.getClearAlpha(),oe<1&&P.setClearColor(16777215,.5),P.clear(),Qt&&ne.render($);let ue=P.toneMapping;P.toneMapping=Dn;let be=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),E.setupLightsView(k),ct===!0&&Vt.setGlobalState(P.clippingPlanes,k),zn(T,$,k),J.updateMultisampleRenderTarget(Ct),J.updateRenderTargetMipmap(Ct),me.has("WEBGL_multisampled_render_to_texture")===!1){let zt=!1;for(let Le=0,di=U.length;Le<di;Le++){let Je=U[Le],{object:Ve,geometry:Di,material:Lt,group:ki}=Je;if(Lt.side===re&&Ve.layers.test(k.layers)){let Re=Lt.side;Lt.side=_i,Lt.needsUpdate=!0,tn(Ve,$,k,Di,Lt,ki),Lt.side=Re,Lt.needsUpdate=!0,zt=!0}}zt===!0&&(J.updateMultisampleRenderTarget(Ct),J.updateRenderTargetMipmap(Ct))}P.setRenderTarget(Rt,Ht,Gt),P.setClearColor(ce,oe),be!==void 0&&(k.viewport=be),P.toneMapping=ue}function zn(T,U,$){let k=U.isScene===!0?U.overrideMaterial:null;for(let V=0,Ct=T.length;V<Ct;V++){let Nt=T[V],{object:Rt,geometry:Ht,group:Gt}=Nt,ue=Nt.material;ue.allowOverride===!0&&k!==null&&(ue=k),Rt.layers.test($.layers)&&tn(Rt,U,$,Ht,ue,Gt)}}function tn(T,U,$,k,V,Ct){N!==null&&V.isNodeMaterial&&N.setObject(T,V),T.onBeforeRender(P,U,$,k,V,Ct),T.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),V.onBeforeRender(P,U,$,k,T,Ct),V.transparent===!0&&V.side===re&&V.forceSinglePass===!1?(V.side=_i,V.needsUpdate=!0,P.renderBufferDirect($,U,k,V,T,Ct),V.side=Hs,V.needsUpdate=!0,P.renderBufferDirect($,U,k,V,T,Ct),V.side=re):P.renderBufferDirect($,U,k,V,T,Ct),T.onAfterRender(P,U,$,k,V,Ct)}function cs(T,U,$){U.isScene!==!0&&(U=qt);let k=G.get(T),V=E.state.lights,Ct=E.state.shadowsArray,Nt=V.state.version,Rt=xt.getParameters(T,V.state,Ct,U,$,E.state.lightProbeGridArray),Ht=xt.getProgramCacheKey(Rt),Gt=k.programs;k.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?U.environment:null,k.fog=U.fog;let ue=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;k.envMap=pt.get(T.envMap||k.environment,ue),k.envMapRotation=k.environment!==null&&T.envMap===null?U.environmentRotation:T.envMapRotation,Gt===void 0&&(T.addEventListener("dispose",bt),Gt=new Map,k.programs=Gt);let be=Gt.get(Ht);if(be!==void 0){if(k.currentProgram===be&&k.lightsStateVersion===Nt)return qo(T,Rt),be}else Rt.uniforms=xt.getUniforms(T),N!==null&&T.isNodeMaterial&&N.build(T,$,Rt),T.onBeforeCompile(Rt,P),be=xt.acquireProgram(Rt,Ht),Gt.set(Ht,be),k.uniforms=Rt.uniforms;let zt=k.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(zt.clippingPlanes=Vt.uniform),qo(T,Rt),k.needsLights=Tl(T),k.lightsStateVersion=Nt,k.needsLights&&(zt.ambientLightColor.value=V.state.ambient,zt.lightProbe.value=V.state.probe,zt.sunLights.value=V.state.sun,zt.sunLightShadows.value=V.state.sunShadow,zt.directionalLights.value=V.state.directional,zt.directionalLightShadows.value=V.state.directionalShadow,zt.spotLights.value=V.state.spot,zt.spotLightShadows.value=V.state.spotShadow,zt.rectAreaLights.value=V.state.rectArea,zt.ltc_1.value=V.state.rectAreaLTC1,zt.ltc_2.value=V.state.rectAreaLTC2,zt.pointLights.value=V.state.point,zt.pointLightShadows.value=V.state.pointShadow,zt.hemisphereLights.value=V.state.hemi,zt.sunShadowMatrix.value=V.state.sunShadowMatrix,zt.sunShadowCascade.value=V.state.sunShadowCascade,zt.directionalShadowMatrix.value=V.state.directionalShadowMatrix,zt.spotLightMatrix.value=V.state.spotLightMatrix,zt.spotLightMap.value=V.state.spotLightMap,zt.pointShadowMatrix.value=V.state.pointShadowMatrix),k.lightProbeGrid=E.state.lightProbeGridArray.length>0,k.currentProgram=be,k.uniformsList=null,be}function Wo(T){if(T.uniformsList===null){let U=T.currentProgram.getUniforms();T.uniformsList=vo.seqWithValue(U.seq,T.uniforms)}return T.uniformsList}function qo(T,U){let $=G.get(T);$.outputColorSpace=U.outputColorSpace,$.batching=U.batching,$.batchingColor=U.batchingColor,$.instancing=U.instancing,$.instancingColor=U.instancingColor,$.instancingMorph=U.instancingMorph,$.skinning=U.skinning,$.morphTargets=U.morphTargets,$.morphNormals=U.morphNormals,$.morphColors=U.morphColors,$.morphTargetsCount=U.morphTargetsCount,$.numClippingPlanes=U.numClippingPlanes,$.numIntersection=U.numClipIntersection,$.vertexAlphas=U.vertexAlphas,$.vertexTangents=U.vertexTangents,$.toneMapping=U.toneMapping}function wl(T,U){if(T.length===0)return null;if(T.length===1)return T[0].texture!==null?T[0]:null;y.setFromMatrixPosition(U.matrixWorld);for(let $=0,k=T.length;$<k;$++){let V=T[$];if(V.texture!==null&&V.boundingBox.containsPoint(y))return V}return null}function Xo(T,U,$,k,V){U.isScene!==!0&&(U=qt),J.resetTextureUnits();let Ct=U.fog,Nt=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?U.environment:null,Rt=rt===null?P.outputColorSpace:rt.isXRRenderTarget===!0?rt.texture.colorSpace:ye.workingColorSpace,Ht=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap,Gt=pt.get(k.envMap||Nt,Ht),ue=k.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,be=!!$.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),zt=!!$.morphAttributes.position,Le=!!$.morphAttributes.normal,di=!!$.morphAttributes.color,Je=Dn;k.toneMapped&&(rt===null||rt.isXRRenderTarget===!0)&&(Je=P.toneMapping);let Ve=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,Di=Ve!==void 0?Ve.length:0,Lt=G.get(k),ki=E.state.lights;if(ct===!0&&(dt===!0||T!==tt)){let We=T===tt&&k.id===Z;Vt.setState(k,T,We)}let Re=!1;k.version===Lt.__version?(Lt.needsLights&&Lt.lightsStateVersion!==ki.state.version||Lt.outputColorSpace!==Rt||V.isBatchedMesh&&Lt.batching===!1||!V.isBatchedMesh&&Lt.batching===!0||V.isBatchedMesh&&Lt.batchingColor===!0&&V._colorsTexture===null||V.isBatchedMesh&&Lt.batchingColor===!1&&V._colorsTexture!==null||V.isInstancedMesh&&Lt.instancing===!1||!V.isInstancedMesh&&Lt.instancing===!0||V.isSkinnedMesh&&Lt.skinning===!1||!V.isSkinnedMesh&&Lt.skinning===!0||V.isInstancedMesh&&Lt.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&Lt.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&Lt.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&Lt.instancingMorph===!1&&V.morphTexture!==null||Lt.envMap!==Gt||k.fog===!0&&Lt.fog!==Ct||Lt.numClippingPlanes!==void 0&&(Lt.numClippingPlanes!==Vt.numPlanes||Lt.numIntersection!==Vt.numIntersection)||Lt.vertexAlphas!==ue||Lt.vertexTangents!==be||Lt.morphTargets!==zt||Lt.morphNormals!==Le||Lt.morphColors!==di||Lt.toneMapping!==Je||Lt.morphTargetsCount!==Di||!!Lt.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(Re=!0):(Re=!0,Lt.__version=k.version);let dn=Lt.currentProgram;Re===!0&&(dn=cs(k,U,V),N&&k.isNodeMaterial&&N.onUpdateProgram(k,dn,Lt));let kn=!1,Ts=!1,Ar=!1,He=dn.getUniforms(),ci=Lt.uniforms;if(S.useProgram(dn.program)&&(kn=!0,Ts=!0,Ar=!0),k.id!==Z&&(Z=k.id,Ts=!0),Lt.needsLights){let We=wl(E.state.lightProbeGridArray,V);Lt.lightProbeGrid!==We&&(Lt.lightProbeGrid=We,Ts=!0)}if(kn||tt!==T){S.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),He.setValue(D,"projectionMatrix",T.projectionMatrix),He.setValue(D,"viewMatrix",T.matrixWorldInverse);let Rs=He.map.cameraPosition;Rs!==void 0&&Rs.setValue(D,mt.setFromMatrixPosition(T.matrixWorld)),C.logarithmicDepthBuffer&&He.setValue(D,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&He.setValue(D,"isOrthographic",T.isOrthographicCamera===!0),tt!==T&&(tt=T,Ts=!0,Ar=!0)}if(Lt.needsLights&&(ki.state.sunShadowMap.length>0&&He.setValue(D,"sunShadowMap",ki.state.sunShadowMap,J),ki.state.directionalShadowMap.length>0&&He.setValue(D,"directionalShadowMap",ki.state.directionalShadowMap,J),ki.state.spotShadowMap.length>0&&He.setValue(D,"spotShadowMap",ki.state.spotShadowMap,J),ki.state.pointShadowMap.length>0&&He.setValue(D,"pointShadowMap",ki.state.pointShadowMap,J)),V.isSkinnedMesh){He.setOptional(D,V,"bindMatrix"),He.setOptional(D,V,"bindMatrixInverse");let We=V.skeleton;We&&(We.boneTexture===null&&We.computeBoneTexture(),He.setValue(D,"boneTexture",We.boneTexture,J))}V.isBatchedMesh&&(He.setOptional(D,V,"batchingTexture"),He.setValue(D,"batchingTexture",V._matricesTexture,J),He.setOptional(D,V,"batchingIdTexture"),He.setValue(D,"batchingIdTexture",V._indirectTexture,J),He.setOptional(D,V,"batchingColorTexture"),V._colorsTexture!==null&&He.setValue(D,"batchingColorTexture",V._colorsTexture,J));let As=$.morphAttributes;if((As.position!==void 0||As.normal!==void 0||As.color!==void 0)&&F.update(V,$,dn),(Ts||Lt.receiveShadow!==V.receiveShadow)&&(Lt.receiveShadow=V.receiveShadow,He.setValue(D,"receiveShadow",V.receiveShadow)),(k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial)&&k.envMap===null&&U.environment!==null&&(ci.envMapIntensity.value=U.environmentIntensity),ci.dfgLUT!==void 0&&(ci.dfgLUT.value=pb()),Ts){if(He.setValue(D,"toneMappingExposure",P.toneMappingExposure),Lt.needsLights&&Yo(ci,Ar),Ct&&k.fog===!0&&kt.refreshFogUniforms(ci,Ct),kt.refreshMaterialUniforms(ci,k,Q,X,E.state.transmissionRenderTarget[T.id]),Lt.needsLights&&Lt.lightProbeGrid){let We=Lt.lightProbeGrid;ci.probesSH.value=We.texture,ci.probesMin.value.copy(We.boundingBox.min),ci.probesMax.value.copy(We.boundingBox.max),ci.probesResolution.value.copy(We.resolution)}vo.upload(D,Wo(Lt),ci,J)}if(k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(vo.upload(D,Wo(Lt),ci,J),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&He.setValue(D,"center",V.center),He.setValue(D,"modelViewMatrix",V.modelViewMatrix),He.setValue(D,"normalMatrix",V.normalMatrix),He.setValue(D,"modelMatrix",V.matrixWorld),k.uniformsGroups!==void 0){let We=k.uniformsGroups;for(let Rs=0,Rr=We.length;Rs<Rr;Rs++){let Of=We[Rs];at.update(Of,dn),at.bind(Of,dn)}}return dn}function Yo(T,U){T.ambientLightColor.needsUpdate=U,T.lightProbe.needsUpdate=U,T.sunLights.needsUpdate=U,T.sunLightShadows.needsUpdate=U,T.directionalLights.needsUpdate=U,T.directionalLightShadows.needsUpdate=U,T.pointLights.needsUpdate=U,T.pointLightShadows.needsUpdate=U,T.spotLights.needsUpdate=U,T.spotLightShadows.needsUpdate=U,T.rectAreaLights.needsUpdate=U,T.hemisphereLights.needsUpdate=U}function Tl(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return q},this.getActiveMipmapLevel=function(){return Y},this.getRenderTarget=function(){return rt},this.setRenderTargetTextures=function(T,U,$){let k=G.get(T);k.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),G.get(T.texture).__webglTexture=U,G.get(T.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:$,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,U){let $=G.get(T);$.__webglFramebuffer=U,$.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(T,U=0,$=0){rt=T,q=U,Y=$;let k=null,V=!1,Ct=!1;if(T){let Rt=G.get(T);if(Rt.__useDefaultFramebuffer!==void 0){S.bindFramebuffer(D.FRAMEBUFFER,Rt.__webglFramebuffer),nt.copy(T.viewport),Dt.copy(T.scissor),Pt=T.scissorTest,S.viewport(nt),S.scissor(Dt),S.setScissorTest(Pt),Z=-1;return}else if(Rt.__webglFramebuffer===void 0)J.setupRenderTarget(T);else if(Rt.__hasExternalTextures)J.rebindTextures(T,G.get(T.texture).__webglTexture,G.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let ue=T.depthTexture;if(Rt.__boundDepthTexture!==ue){if(ue!==null&&G.has(ue)&&(T.width!==ue.image.width||T.height!==ue.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");J.setupDepthRenderbuffer(T)}}let Ht=T.texture;(Ht.isData3DTexture||Ht.isDataArrayTexture||Ht.isCompressedArrayTexture)&&(Ct=!0);let Gt=G.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Gt[U])?k=Gt[U][$]:k=Gt[U],V=!0):T.samples>0&&J.useMultisampledRTT(T)===!1?k=G.get(T).__webglMultisampledFramebuffer:Array.isArray(Gt)?k=Gt[$]:k=Gt,nt.copy(T.viewport),Dt.copy(T.scissor),Pt=T.scissorTest}else nt.copy(Et).multiplyScalar(Q).floor(),Dt.copy(Yt).multiplyScalar(Q).floor(),Pt=xe;if($!==0&&(k=H),S.bindFramebuffer(D.FRAMEBUFFER,k)&&S.drawBuffers(T,k),S.viewport(nt),S.scissor(Dt),S.setScissorTest(Pt),V){let Rt=G.get(T.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+U,Rt.__webglTexture,$)}else if(Ct){let Rt=U;for(let Ht=0;Ht<T.textures.length;Ht++){let Gt=G.get(T.textures[Ht]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Ht,Gt.__webglTexture,$,Rt)}}else if(T!==null&&$!==0){let Rt=G.get(T.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Rt.__webglTexture,$)}Z=-1};function Zo(T){let U=G.get(T);return(U.__readFormat!==T.format||U.__readType!==T.type)&&(U.__readFormat=T.format,U.__readType=T.type,U.__formatReadable=C.textureFormatReadable(T.format),U.__typeReadable=C.textureTypeReadable(T.type)),U}this.readRenderTargetPixels=function(T,U,$,k,V,Ct,Nt,Rt=0){if(!(T&&T.isWebGLRenderTarget)){te("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ht=G.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Nt!==void 0&&(Ht=Ht[Nt]),Ht){S.bindFramebuffer(D.FRAMEBUFFER,Ht);try{let Gt=T.textures[Rt],ue=Gt.format,be=Gt.type;T.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Rt);let zt=Zo(Gt);if(zt.__formatReadable===!1){te("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(zt.__typeReadable===!1){te("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=T.width-k&&$>=0&&$<=T.height-V&&D.readPixels(U,$,k,V,_t.convert(ue),_t.convert(be),Ct)}finally{let Gt=rt!==null?G.get(rt).__webglFramebuffer:null;S.bindFramebuffer(D.FRAMEBUFFER,Gt)}}},this.readRenderTargetPixelsAsync=async function(T,U,$,k,V,Ct,Nt,Rt=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ht=G.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Nt!==void 0&&(Ht=Ht[Nt]),Ht)if(U>=0&&U<=T.width-k&&$>=0&&$<=T.height-V){S.bindFramebuffer(D.FRAMEBUFFER,Ht);let Gt=T.textures[Rt],ue=Gt.format,be=Gt.type;T.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Rt);let zt=Zo(Gt);if(zt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(zt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Le=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Le),D.bufferData(D.PIXEL_PACK_BUFFER,Ct.byteLength,D.STREAM_READ),D.readPixels(U,$,k,V,_t.convert(ue),_t.convert(be),0),D.bindBuffer(D.PIXEL_PACK_BUFFER,null);let di=rt!==null?G.get(rt).__webglFramebuffer:null;S.bindFramebuffer(D.FRAMEBUFFER,di);let Je=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await tm(D,Je,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Le),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,Ct),D.bindBuffer(D.PIXEL_PACK_BUFFER,null),D.deleteBuffer(Le),D.deleteSync(Je),Ct}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,U=null,$=0){let k=Math.pow(2,-$),V=Math.floor(T.image.width*k),Ct=Math.floor(T.image.height*k),Nt=U!==null?U.x:0,Rt=U!==null?U.y:0;J.setTexture2D(T,0),D.copyTexSubImage2D(D.TEXTURE_2D,$,0,0,Nt,Rt,V,Ct),S.unbindTexture()},this.copyTextureToTexture=function(T,U,$=null,k=null,V=0,Ct=0){let Nt,Rt,Ht,Gt,ue,be,zt,Le,di,Je=T.isCompressedTexture?T.mipmaps[Ct]:T.image;if($!==null)Nt=$.max.x-$.min.x,Rt=$.max.y-$.min.y,Ht=$.isBox3?$.max.z-$.min.z:1,Gt=$.min.x,ue=$.min.y,be=$.isBox3?$.min.z:0;else{let ci=Math.pow(2,-V);Nt=Math.floor(Je.width*ci),Rt=Math.floor(Je.height*ci),T.isDataArrayTexture?Ht=Je.depth:T.isData3DTexture?Ht=Math.floor(Je.depth*ci):Ht=1,Gt=0,ue=0,be=0}k!==null?(zt=k.x,Le=k.y,di=k.z):(zt=0,Le=0,di=0);let Ve=_t.convert(U.format),Di=_t.convert(U.type),Lt;U.isData3DTexture?(J.setTexture3D(U,0),Lt=D.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(J.setTexture2DArray(U,0),Lt=D.TEXTURE_2D_ARRAY):(J.setTexture2D(U,0),Lt=D.TEXTURE_2D),S.activeTexture(D.TEXTURE0),S.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),S.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),S.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);let ki=S.getParameter(D.UNPACK_ROW_LENGTH),Re=S.getParameter(D.UNPACK_IMAGE_HEIGHT),dn=S.getParameter(D.UNPACK_SKIP_PIXELS),kn=S.getParameter(D.UNPACK_SKIP_ROWS),Ts=S.getParameter(D.UNPACK_SKIP_IMAGES);S.pixelStorei(D.UNPACK_ROW_LENGTH,Je.width),S.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Je.height),S.pixelStorei(D.UNPACK_SKIP_PIXELS,Gt),S.pixelStorei(D.UNPACK_SKIP_ROWS,ue),S.pixelStorei(D.UNPACK_SKIP_IMAGES,be);let Ar=T.isDataArrayTexture||T.isData3DTexture,He=U.isDataArrayTexture||U.isData3DTexture;if(T.isDepthTexture){let ci=G.get(T),As=G.get(U),We=G.get(ci.__renderTarget),Rs=G.get(As.__renderTarget);S.bindFramebuffer(D.READ_FRAMEBUFFER,We.__webglFramebuffer),S.bindFramebuffer(D.DRAW_FRAMEBUFFER,Rs.__webglFramebuffer);for(let Rr=0;Rr<Ht;Rr++)Ar&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,G.get(T).__webglTexture,V,be+Rr),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,G.get(U).__webglTexture,Ct,di+Rr)),D.blitFramebuffer(Gt,ue,Nt,Rt,zt,Le,Nt,Rt,D.DEPTH_BUFFER_BIT,D.NEAREST);S.bindFramebuffer(D.READ_FRAMEBUFFER,null),S.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(V!==0||T.isRenderTargetTexture||G.has(T)){let ci=G.get(T),As=G.get(U);S.bindFramebuffer(D.READ_FRAMEBUFFER,L),S.bindFramebuffer(D.DRAW_FRAMEBUFFER,B);for(let We=0;We<Ht;We++)Ar?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,ci.__webglTexture,V,be+We):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,ci.__webglTexture,V),He?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,As.__webglTexture,Ct,di+We):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,As.__webglTexture,Ct),V!==0?D.blitFramebuffer(Gt,ue,Nt,Rt,zt,Le,Nt,Rt,D.COLOR_BUFFER_BIT,D.NEAREST):He?D.copyTexSubImage3D(Lt,Ct,zt,Le,di+We,Gt,ue,Nt,Rt):D.copyTexSubImage2D(Lt,Ct,zt,Le,Gt,ue,Nt,Rt);S.bindFramebuffer(D.READ_FRAMEBUFFER,null),S.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else He?T.isDataTexture||T.isData3DTexture?D.texSubImage3D(Lt,Ct,zt,Le,di,Nt,Rt,Ht,Ve,Di,Je.data):U.isCompressedArrayTexture?D.compressedTexSubImage3D(Lt,Ct,zt,Le,di,Nt,Rt,Ht,Ve,Je.data):D.texSubImage3D(Lt,Ct,zt,Le,di,Nt,Rt,Ht,Ve,Di,Je):T.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,Ct,zt,Le,Nt,Rt,Ve,Di,Je.data):T.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,Ct,zt,Le,Je.width,Je.height,Ve,Je.data):D.texSubImage2D(D.TEXTURE_2D,Ct,zt,Le,Nt,Rt,Ve,Di,Je);S.pixelStorei(D.UNPACK_ROW_LENGTH,ki),S.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Re),S.pixelStorei(D.UNPACK_SKIP_PIXELS,dn),S.pixelStorei(D.UNPACK_SKIP_ROWS,kn),S.pixelStorei(D.UNPACK_SKIP_IMAGES,Ts),Ct===0&&U.generateMipmaps&&D.generateMipmap(Lt),S.unbindTexture()},this.initRenderTarget=function(T){G.get(T).__webglFramebuffer===void 0&&J.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?J.setTextureCube(T,0):T.isData3DTexture?J.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?J.setTexture2DArray(T,0):J.setTexture2D(T,0),S.unbindTexture()},this.resetState=function(){q=0,Y=0,rt=null,S.reset(),At.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Cn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=ye._getDrawingBufferColorSpace(t),e.unpackColorSpace=ye._getUnpackColorSpace()}};var cl=.008333333333333333,Oi=650,Ft={halfX:4096,halfZ:5120,height:2044,chamfer:1150,cornerR:400,rampR:280,goalHalfW:893,goalH:642,goalDepth:880},De={radius:93,mass:30,maxSpeed:6e3,maxSpin:6,drag:.0305,restitution:.6,friction:.285},It={mass:180,restHeight:17,hitboxHalf:{x:42.1,y:18.08,z:59},hitboxOffset:{x:0,y:20.75,z:13.88},wheels:[{x:25.9,z:51.25,r:12.5,front:!0},{x:-25.9,z:51.25,r:12.5,front:!0},{x:29.5,z:-33.75,r:15,front:!1},{x:-29.5,z:-33.75,r:15,front:!1}],maxSpeed:2300,maxDriveSpeed:1410,supersonic:2200,boostAccelGround:991.67,boostAccelAir:1058.33,boostUsePerSec:33.3,brakeAccel:3500,coastDecel:525,airThrottleAccel:66.67,jumpImpulse:291.67,jumpHoldAccel:1458.33,jumpHoldTime:.2,doubleJumpWindow:1.25,dodgeImpulse:500,dodgeTime:.65,stickyAccel:325,maxAngVel:5.5,airRoll:36.08,airPitch:12.15,airYaw:8.92,dampRoll:4.47,dampPitch:2.8,dampYaw:1.89},Wd=33,Dh=[[-3584,0],[3584,0],[-3072,-4096],[3072,-4096],[-3072,4096],[3072,4096]],Nh=[[0,-4240],[-1792,-4184],[1792,-4184],[-940,-3308],[940,-3308],[0,-2816],[-3584,-2484],[3584,-2484],[-1788,-2300],[1788,-2300],[-2048,-1036],[0,-1024],[2048,-1036],[-1024,0],[1024,0],[-2048,1036],[0,1024],[2048,1036],[-1788,2300],[1788,2300],[-3584,2484],[3584,2484],[0,2816],[-940,3310],[940,3308],[-1792,4184],[1792,4184],[0,4240]],Om=[[-2048,-2560,Math.PI/4],[2048,-2560,-Math.PI/4],[-256,-3840,0],[256,-3840,0],[0,-4608,0]],qd=[[-2304,-4608,0],[-2688,-4608,0],[2304,-4608,0],[2688,-4608,0]],Ie={0:{main:1010687,light:6272255,dark:670362,css:"#2f7bff",flame:[.55,.85,1],flameEnd:[.1,.3,1]},1:{main:16738834,light:16756832,dark:9054720,css:"#ff7a1a",flame:[1,.85,.45],flameEnd:[1,.28,.04]}};var Xd=30,Ws=new w;function ui(s,t,e,i){let n=document.createElement(s);return t&&(n.className=t),i!==void 0&&(n.innerHTML=i),e&&e.appendChild(n),n}function mb(){let r=270/Xd,o="";for(let a=0;a<Xd;a++){let l=(135+a*r+.8)*Math.PI/180,c=(135+(a+1)*r-.8)*Math.PI/180,h=100+Math.cos(l)*84,u=100+Math.sin(l)*84,d=100+Math.cos(c)*84,f=100+Math.sin(c)*84;o+=`<path class="seg" d="M${h.toFixed(2)} ${u.toFixed(2)} A84 84 0 0 1 ${d.toFixed(2)} ${f.toFixed(2)}"/>`}return`<svg viewBox="0 0 200 200" class="boost-svg">
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
  </svg>`}var Uh=class{constructor(t){this.root=t,t.innerHTML="";let e=ui("div","scoreboard",t);this.sbBlue=ui("div","sb-team sb-blue",e,"<span>0</span>");let i=ui("div","sb-clock",e);this.sbTime=ui("div","sb-time",i,"5:00"),this.sbOT=ui("div","sb-ot",i,""),this.sbOrange=ui("div","sb-team sb-orange",e,"<span>0</span>"),this.viewsEl=ui("div","hud-views",t),this.banner=ui("div","banner",t),this.bannerMain=ui("div","banner-main",this.banner),this.bannerSub=ui("div","banner-sub",this.banner),this.feed=ui("div","feed",t),this.fps=ui("div","fps",t),this.views=[],this.bannerTimer=0,this.lastScores=[-1,-1],this.lastTime=""}show(t){this.root.classList.toggle("hidden",!t)}setup(t){this.viewsEl.innerHTML="",this.views=t.map(e=>{let i=ui("div","hud-view",this.viewsEl);i.style.left=e.rect[0]*100+"%",i.style.top=e.rect[1]*100+"%",i.style.width=e.rect[2]*100+"%",i.style.height=e.rect[3]*100+"%",t.length>1&&i.classList.add("split");let n=ui("div","boost-gauge",i,mb()),r=t.length>1?ui("div","player-tag",i,e.label):null;r&&(r.style.color=Ie[e.team].css);let o=ui("div","item-slot hidden",i);o.innerHTML='<div class="item-icon"></div><div class="item-text"><div class="item-name"></div><div class="item-key"></div></div><div class="item-bar"><div></div></div>';let a=ui("div","view-status",i),l=ui("div","view-center",i),c=ui("div","plates",i);return{box:i,gauge:n,status:a,center:l,plates:c,plateMap:new Map,item:o,itemIcon:o.querySelector(".item-icon"),itemName:o.querySelector(".item-name"),itemKey:o.querySelector(".item-key"),itemBar:o.querySelector(".item-bar div"),itemSig:"",segs:Array.from(n.querySelectorAll(".seg")),num:n.querySelector(".boost-num"),lastBoost:-1,statusTimer:0,centerTimer:0}})}setScore(t,e){t!==this.lastScores[0]&&(this.sbBlue.firstChild.textContent=t,this.pulse(this.sbBlue)),e!==this.lastScores[1]&&(this.sbOrange.firstChild.textContent=e,this.pulse(this.sbOrange)),this.lastScores=[t,e]}pulse(t){this.lastScores[0]<0||(t.classList.remove("pulse"),t.offsetWidth,t.classList.add("pulse"))}setClock(t,e,i){let n;if(i)n="\u221E";else{let r=Math.max(0,e?Math.floor(t):Math.ceil(t));n=`${e?"+":""}${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`}n!==this.lastTime&&(this.sbTime.textContent=n,this.lastTime=n),this.sbOT.textContent=e?"OVERTIME":""}setBoost(t,e){let i=this.views[t];if(!i)return;let n=Math.round(e);if(n===i.lastBoost)return;i.lastBoost=n,i.num.textContent=n;let r=Math.ceil(e/100*Xd-.001);i.segs.forEach((o,a)=>o.classList.toggle("on",a<r)),i.gauge.classList.toggle("empty",n===0),i.gauge.classList.toggle("full",n===100)}setItem(t,e,i,n){let r=this.views[t];if(!r)return;if(!e){r.item.classList.add("hidden");return}r.item.classList.remove("hidden");let o=`${e.item}|${e.active}|${n}|${e.item?"":Math.ceil(e.next||0)}`;if(o!==r.itemSig){r.itemSig=o;let a=e.item?i[e.item]:null;r.item.classList.toggle("ready",!!e.item&&!e.active),r.item.classList.toggle("active",!!e.active),r.item.classList.toggle("empty",!e.item),r.itemIcon.textContent=a?a.icon:"\u23F3",r.itemName.textContent=a?a.name:"Power-up",r.itemKey.innerHTML=e.item?e.active?"active":`press <b>${n}</b>`:`next in ${Math.ceil(e.next||0)}s`}r.itemBar.style.transform=`scaleX(${e.active?e.frac:e.item?1:0})`}viewStatus(t,e,i=1.6){let n=this.views[t];n&&(n.status.textContent=e,n.status.classList.add("visible"),n.statusTimer=i)}viewCenter(t,e,i=2){let n=this.views[t];n&&(n.center.textContent=e,n.center.classList.add("visible"),n.centerTimer=i)}showBanner(t,e="",i="",n=2){this.bannerMain.textContent=t,this.bannerSub.textContent=e,this.banner.className="banner visible "+i,this.bannerTimer=n}hideBanner(){this.banner.className="banner",this.bannerTimer=0}addFeed(t,e=-1){let i=ui("div","feed-item"+(e>=0?" team"+e:""),this.feed,t);for(setTimeout(()=>i.classList.add("fade"),3500),setTimeout(()=>i.remove(),4200);this.feed.children.length>5;)this.feed.firstChild.remove()}updatePlates(t,e,i,n){let r=this.views[t];if(!r)return;let o=r.box.clientWidth,a=r.box.clientHeight,l=new Set;for(let c of i){if(c.car===n||c.car.demolished||(Ws.set(c.pos.x*.01,(c.pos.y+95)*.01,c.pos.z*.01).project(e),Ws.z>1||Ws.z<-1||Math.abs(Ws.x)>1.1||Math.abs(Ws.y)>1.1))continue;let h=r.plateMap.get(c.car.id);h||(h=ui("div","plate team"+c.car.team,r.plates,c.name),r.plateMap.set(c.car.id,h));let u=(Ws.x+1)/2*o,d=(1-Ws.y)/2*a,f=e.position.distanceTo(Ws.set(c.pos.x*.01,c.pos.y*.01,c.pos.z*.01));h.style.transform=`translate(${u.toFixed(1)}px, ${d.toFixed(1)}px) translate(-50%, -100%) scale(${Math.max(.55,Math.min(1,12/f)).toFixed(3)})`,h.style.display="",l.add(c.car.id)}for(let[c,h]of r.plateMap)l.has(c)||(h.style.display="none")}update(t){this.bannerTimer>0&&(this.bannerTimer-=t,this.bannerTimer<=0&&this.banner.classList.remove("visible"));for(let e of this.views)e.statusTimer>0&&(e.statusTimer-=t,e.statusTimer<=0&&e.status.classList.remove("visible")),e.centerTimer>0&&(e.centerTimer-=t,e.centerTimer<=0&&e.center.classList.remove("visible"))}setFps(t){this.fps.textContent=t}};var Gm=Ft.halfZ,gb=Ft.goalHalfW,vb=Ft.goalH,Yd=De.radius,ke=new w,Hm=new w,zm=new w,km=new he,Zd=s=>(s===0?1:-1)*(Gm+450),Fh=class{reset(){}preStep(){}preBall(){}onTouch(){}postStep(){}},$d=class extends Fh{constructor(t){super(),this.world=t,this.name="heatseeker",this.reset(),t.ball.force=(e,i)=>this.force(e,i)}reset(){this.team=-1,this.speed=0,this.lastBoost=-10,this.lastFlip=-10}onTouch(t){let e=this.world.time;(t.team!==this.team||e-this.lastBoost>.5)&&(this.speed=Math.min(4200,Math.max(1500,this.speed+160)),this.lastBoost=e),this.team=t.team}force(t,e){if(this.team<0)return;ke.set(0,330,Zd(this.team)).sub(t.pos);let i=ke.length();i<1||(ke.multiplyScalar(this.speed/i),t.vel.y+=Oi*e*.92,t.vel.lerp(ke,1-Math.exp(-e*1.5)))}postStep(){if(this.team<0)return;let t=this.world.ball,e=(this.team===0?1:-1)*Gm,i=Math.abs(t.pos.z-e)<Yd+40,n=Math.abs(t.pos.x)<gb&&t.pos.y<vb;i&&!n&&this.world.time-this.lastFlip>.6&&(this.team=1-this.team,this.lastFlip=this.world.time,this.world.events.push({type:"heatseekFlip",point:t.pos.clone()}))}},hl={grapple:{name:"Grappling Hook",icon:"\u{1FA9D}",hint:"Pulls you to the ball"},plunger:{name:"Plunger",icon:"\u{1FAA0}",hint:"Pulls the ball to you"},tornado:{name:"Tornado",icon:"\u{1F32A}\uFE0F",hint:"Spins up everything near you"},curveball:{name:"Curveball",icon:"\u{1F300}",hint:"Curves the ball into their goal"},spikes:{name:"Spikes",icon:"\u{1F4CC}",hint:"The ball sticks to your car"},boot:{name:"Boot",icon:"\u{1F462}",hint:"Kicks the nearest opponent away"},power:{name:"Power Hitter",icon:"\u{1F4A5}",hint:"Huge hits and demolish on contact"},freezer:{name:"Freezer",icon:"\u2744\uFE0F",hint:"Freezes the ball in place"}},_o=Object.keys(hl),Vm={grapple:4200,plunger:4200,curveball:5e3,freezer:6e3,boot:4500},Jd=class extends Fh{constructor(t,e=_o){super(),this.world=t,this.name="rumble",this.pool=e.length?e:_o,this.state=new Map,this.curve=null,this.reset()}st(t){let e=this.state.get(t);return e||(e={item:null,timer:3,held:0,active:null,prevUse:!1},this.state.set(t,e)),e}reset(){for(let t of this.world.cars){let e=this.st(t);this.endActive(t,e),e.item=null,e.timer=2+Math.random()*3,e.prevUse=!!t.input.useItem}this.curve=null,this.world.ball.iceTimer=0,this.world.ball.attachedTo=null}give(t,e){e.item=this.pool[Math.floor(Math.random()*this.pool.length)],e.held=0,this.world.events.push({type:"itemGet",car:t,item:e.item})}inRange(t,e){let i=Vm[e];return i?e==="boot"?!!this.nearestOpponent(t,i):t.pos.distanceTo(this.world.ball.pos)<i:!0}nearestOpponent(t,e){let i=null,n=e;for(let r of this.world.cars){if(r.team===t.team||r.demolished)continue;let o=r.pos.distanceTo(t.pos);o<n&&(n=o,i=r)}return i}use(t){let e=this.st(t);if(!e.item||e.active||t.demolished||this.world.ball.frozen)return!1;let i=e.item;if(!this.inRange(t,i))return this.world.events.push({type:"itemFail",car:t,item:i}),!1;e.item=null;let n=this.world,r=n.ball;switch(i){case"grapple":case"plunger":e.active={type:i,phase:"shoot",t:0,hook:t.pos.clone()};break;case"tornado":e.active={type:"tornado",t:0,dur:5.5};break;case"spikes":e.active={type:"spikes",t:0,dur:10,offset:null};break;case"power":e.active={type:"power",t:0,dur:8},t.hitPower=1.8;break;case"curveball":this.curve={team:t.team,t:4},r.vel.length()<1200&&(r.vel.addScaledVector(ke.set(0,0,Math.sign(Zd(t.team))),900),r.vel.y+=250),e.timer=9;break;case"freezer":r.iceTimer=3.5,r.vel.set(0,0,0),e.timer=9;break;case"boot":{let o=this.nearestOpponent(t,Vm.boot);ke.copy(o.pos).sub(t.pos).setY(0).normalize(),o.vel.addScaledVector(ke,1700),o.vel.y+=1050,o.noGround=.25,o.onGround=!1,o.angVel.set(Math.random()-.5,0,Math.random()-.5).multiplyScalar(8),n.events.push({type:"boot",car:o,by:t,point:o.pos.clone()}),e.timer=9;break}default:break}return n.events.push({type:"itemUse",car:t,item:i}),!0}endActive(t,e){let i=e.active;i&&(i.type==="power"&&(t.hitPower=1),i.type==="spikes"&&this.world.ball.attachedTo===t&&this.release(t,!1),e.active=null,e.timer=8+Math.random()*3)}release(t,e){let i=this.world.ball;i.attachedTo===t&&(i.attachedTo=null,e&&(t.forward(zm),i.vel.copy(t.vel).addScaledVector(zm,950),i.vel.y+=250))}preStep(t){let e=this.world,i=e.ball;for(let n of e.cars){let r=this.st(n),o=!!n.input.useItem&&!r.prevUse;if(r.prevUse=!!n.input.useItem,n.demolished){r.active&&this.endActive(n,r);continue}o&&this.use(n),!r.item&&!r.active&&(r.timer-=t,r.timer<=0&&!i.frozen&&this.give(n,r)),r.item&&(r.held+=t);let a=r.active;if(a)switch(a.t+=t,a.type){case"grapple":case"plunger":{if(a.phase==="shoot"){ke.copy(i.pos).sub(a.hook);let l=ke.length(),c=6e3*t;l<=c+Yd?(a.hook.copy(i.pos),a.phase="pull",a.pullT=0,e.events.push({type:"hooked",car:n,item:a.type,point:i.pos.clone()})):a.hook.addScaledVector(ke,c/l),a.t>1&&a.phase==="shoot"&&this.endActive(n,r)}else{a.pullT+=t,a.hook.copy(i.pos),ke.copy(i.pos).sub(n.pos);let l=ke.length();ke.divideScalar(Math.max(1,l)),a.type==="grapple"?(n.vel.addScaledVector(ke,5400*t),n.vel.y+=Oi*.6*t,n.noGround=.12,(l<230||a.pullT>2)&&this.endActive(n,r)):(i.vel.addScaledVector(ke,-6800*t),i.vel.y+=Oi*.5*t,(l<380||a.pullT>1.8)&&this.endActive(n,r))}break}case"tornado":{let c=(h,u)=>{ke.copy(h.pos).sub(n.pos);let d=Math.hypot(ke.x,ke.z);if(d>1050||h.pos.y>2200)return!1;let f=1-d/1050;return Hm.set(-ke.z,0,ke.x).normalize(),h.vel.addScaledVector(Hm,2e3*f*t*u),h.vel.y+=(Oi+900*f+150)*t*u,d>1&&h.vel.addScaledVector(ke.set(ke.x/d,0,ke.z/d),-700*f*t*u),!0};!i.attachedTo&&i.iceTimer<=0&&c(i,1);for(let h of e.cars)h===n||h.demolished||c(h,.85)&&(h.noGround=.1,h.onGround=!1);a.t>a.dur&&this.endActive(n,r);break}case"spikes":case"power":a.t>a.dur&&this.endActive(n,r);break;default:break}}if(this.curve&&!i.attachedTo&&i.iceTimer<=0){this.curve.t-=t;let n=Math.hypot(i.vel.x,i.vel.z);ke.set(-i.pos.x,0,Zd(this.curve.team)-i.pos.z).normalize();let r=Math.atan2(i.vel.x,i.vel.z),a=Math.atan2(ke.x,ke.z)-r;for(;a>Math.PI;)a-=Math.PI*2;for(;a<-Math.PI;)a+=Math.PI*2;let l=Math.sign(a)*Math.min(Math.abs(a),2.2*t),c=Math.max(n,1500);i.vel.x=Math.sin(r+l)*c,i.vel.z=Math.cos(r+l)*c,this.curve.t<=0&&(this.curve=null)}}preBall(){let t=this.world.ball,e=t.attachedTo;if(!e)return;let i=this.st(e);if(!i.active||i.active.type!=="spikes"||e.demolished){this.release(e,!1);return}t.prevPos.copy(t.pos),ke.copy(i.active.offset).applyQuaternion(e.quat),t.pos.copy(e.pos).add(ke),t.vel.copy(e.vel)}onTouch(t){let e=this.world.ball;e.iceTimer>0&&(e.iceTimer=0),this.curve&&this.curve.team!==t.team&&(this.curve=null),e.attachedTo&&e.attachedTo!==t&&this.release(e.attachedTo,!1);let i=this.st(t);if(i.active&&i.active.type==="spikes"&&!e.attachedTo){km.copy(t.quat).invert();let n=e.pos.clone().sub(t.pos).applyQuaternion(km);n.setLength(Math.max(n.length(),Yd+52)),i.active.offset=n,e.attachedTo=t,e.lastTouch=t}}postStep(){let t=this.world.ball;if(t.attachedTo)for(let e of this.world.events){if(e.type==="dodge"&&e.car===t.attachedTo){this.release(e.car,!0);break}if(e.type==="bump"&&e.car===t.attachedTo){this.release(e.car,!1);break}}}status(t){let e=this.st(t);if(e.active){let i=e.active,n=i.dur?Math.max(0,1-i.t/i.dur):1;return{item:i.type,active:!0,frac:n}}return e.item?{item:e.item,active:!1,frac:1}:{item:null,active:!1,frac:0,next:Math.max(0,e.timer)}}};function Wm(s,t,e){return t==="heatseeker"?new $d(s):t==="rumble"?new Jd(s,e):null}function ai(s,t,e,i){let n=document.createElement(s);return t&&(n.className=t),i!==void 0&&(n.innerHTML=i),e&&e.appendChild(n),n}var xb={solo:{title:"PLAY vs CPU",humans:1},versus:{title:"2 PLAYERS \u2014 VERSUS",humans:2},coop:{title:"2 PLAYERS \u2014 CO-OP vs CPU",humans:2}},qm=`
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
</div>`,Bh=class{constructor(t,e){this.app=t,this.root=e,this.visible=!1,this.items=[],this.focus=0,this.screen=null,this.joinSlots=[null,null],e.addEventListener("mousemove",()=>{this.mouse=!0})}hide(){this.visible=!1,this.root.classList.add("hidden"),this.root.innerHTML="",this.screen=null}show(t,e){this.visible=!0,this.root.classList.remove("hidden"),this.root.innerHTML="",this.root.className="menu screen-"+t,this.screen=t,this.data=e,this.items=[],this.focus=0,this.onBack=null,this.custom=null,this["screen_"+t].call(this,e),this.refreshFocus()}panel(t,e){let i=ai("div","panel",this.root);return t&&ai("div","panel-title",i,t),e&&ai("div","panel-sub",i,e),i}button(t,e,i,n=""){let r=ai("div","item button "+n,t,`<span>${e}</span>`),o={el:r,type:"button",action:i};return r.addEventListener("click",()=>{this.focus=this.items.indexOf(o),this.activate()}),r.addEventListener("mouseenter",()=>{this.focus=this.items.indexOf(o),this.refreshFocus()}),this.items.push(o),o}option(t,e,i,n,r){let o=ai("div","item option",t);ai("span","opt-label",o,e);let a=ai("span","opt-ctl",o),l=ai("span","arrow",a,"\u25C0"),c=ai("span","opt-value",a),h=ai("span","arrow",a,"\u25B6"),u={el:o,type:"option",values:i,get:n,set:r,val:c},d=()=>{let f=n(),m=i.find(v=>v.value===f)||i[0];c.textContent=m.label};return u.render=d,u.change=f=>{let m=n(),v=i.findIndex(p=>p.value===m);v=(v+f+i.length)%i.length,r(i[v].value),d(),this.app.audio.click(),this.onOptionChange&&this.onOptionChange()},l.addEventListener("click",f=>{f.stopPropagation(),u.change(-1)}),h.addEventListener("click",f=>{f.stopPropagation(),u.change(1)}),o.addEventListener("click",()=>u.change(1)),o.addEventListener("mouseenter",()=>{this.focus=this.items.indexOf(u),this.refreshFocus()}),d(),this.items.push(u),u}refreshFocus(){this.items.forEach((t,e)=>t.el.classList.toggle("focused",e===this.focus))}activate(){let t=this.items[this.focus];t&&(t.type==="button"?(this.app.audio.select(),t.action()):t.type==="option"&&t.change(1))}update(t){if(!this.visible||this.custom&&this.custom(t))return;let e=this.items.length;t.up&&e&&(this.focus=(this.focus-1+e)%e,this.refreshFocus(),this.app.audio.click()),t.down&&e&&(this.focus=(this.focus+1)%e,this.refreshFocus(),this.app.audio.click());let i=this.items[this.focus];i&&i.type==="option"&&(t.left&&i.change(-1),t.right&&i.change(1)),t.confirm&&this.activate(),t.back&&this.onBack&&(this.app.audio.click(),this.onBack()),t.start&&this.onStart&&this.onStart()}screen_main(){let t=ai("div","logo",this.root);t.innerHTML='<div class="logo-top">ROCKET</div><div class="logo-bottom">ARENA</div><div class="logo-tag">supersonic car soccer</div>';let e=this.panel();e.classList.add("main-panel"),this.button(e,"\u25B6  PLAY vs CPU",()=>this.show("setup","solo"),"primary"),this.button(e,"\u{1F465}  2 PLAYERS \u2014 VERSUS",()=>this.show("setup","versus")),this.button(e,"\u{1F91D}  2 PLAYERS \u2014 CO-OP vs CPU",()=>this.show("setup","coop")),this.button(e,"\u2699  SETTINGS",()=>this.show("settings")),this.button(e,"\u{1F3AE}  CONTROLS",()=>this.show("controls")),this.button(e,"\u26F6  FULLSCREEN",()=>this.app.toggleFullscreen());let i=ai("div","footer",this.root);this.padStatus(i)}padStatus(t){let e=()=>{let i=this.app.input.connectedPads();if(this.app.input.gamepadBlocked){t.innerHTML='<span class="footer-hint warn">\u26A0\uFE0F Controllers are blocked on this page. Keyboard &amp; mouse work. For controllers, open the game from its own web address.</span>';return}t.innerHTML=i.length?i.map((n,r)=>`<span class="pad-chip">\u{1F3AE} ${yu(n.id)} ${r+1}</span>`).join("")+'<span class="footer-hint">\u24B6 select \xB7 \u24B7 back</span>':'<span class="footer-hint">Connect an Xbox controller and press any button \xB7 or use mouse / keyboard (Enter to select)</span>'};e(),this.footerTimer=setInterval(()=>{t.isConnected?e():clearInterval(this.footerTimer)},1e3)}screen_setup(t){let e=this.app.settings,i=xb[t],n=this.panel(i.title,t==="solo"?"You (blue) vs CPU (orange)":t==="versus"?"Player 1 (blue) vs Player 2 (orange) \xB7 split screen":"Player 1 & Player 2 (blue) vs CPU (orange) \xB7 split screen"),r=t==="coop"?[{label:"2 vs 2",value:2},{label:"3 vs 3",value:3}]:[{label:"1 vs 1",value:1},{label:"2 vs 2",value:2},{label:"3 vs 3",value:3}],o="teamSize_"+t;r.some(l=>l.value===e[o])||(e[o]=r[0].value),this.option(n,"Game mode",[{label:"Soccar",value:"soccar"},{label:"Heatseeker (ball homes in)",value:"heatseeker"},{label:"Rumble (power-ups)",value:"rumble"}],()=>e.gameMode,l=>{e.gameMode=l}),this.option(n,"Power-ups (Rumble)",[{label:"All, random",value:"all"}].concat(_o.map(l=>({label:`${hl[l].name} only`,value:l}))),()=>e.items,l=>{e.items=l}),this.option(n,"Team size",r,()=>e[o],l=>{e[o]=l}),this.option(n,"Match length",[{label:"3 minutes",value:180},{label:"5 minutes",value:300},{label:"7 minutes",value:420},{label:"1 minute",value:60},{label:"Unlimited",value:0}],()=>e.duration,l=>{e.duration=l}),this.option(n,"CPU skill",[{label:"Rookie",value:"rookie"},{label:"Pro",value:"pro"},{label:"All-Star",value:"allstar"}],()=>e.difficulty,l=>{e.difficulty=l}),this.option(n,"Stadium",[{label:"Night",value:"night"},{label:"Sunset",value:"sunset"}],()=>e.timeOfDay,l=>{e.timeOfDay=l}),t!=="solo"&&this.option(n,"Split screen",[{label:"Top / Bottom",value:"horizontal"},{label:"Side by side",value:"vertical"}],()=>e.split,l=>{e.split=l});let a=()=>{this.app.saveSettings(),t==="solo"?this.app.startMatch({mode:t,gameMode:e.gameMode,items:e.items,teamSize:e[o],duration:e.duration,difficulty:e.difficulty,split:e.split,humans:[{device:{type:"any"},team:0,name:"You"}]}):this.show("join",t)};this.button(n,t==="solo"?"\u25B6  KICK OFF":"\u25B6  CONTINUE",a,"primary"),this.button(n,"\u25C0  BACK",()=>this.show("main")),this.onBack=()=>this.show("main"),this.focus=this.items.length-2}screen_join(t){let e=this.app.settings,i=this.app.input,n=this.panel("PRESS TO JOIN","Controller players press <b>\u24B6</b>. The keyboard &amp; mouse player clicks a slot or presses <b>Space</b>."),r=ai("div","join-blocked",n),o=ai("div","join-slots",n);this.joinSlots=[null,null];let a=(p,g)=>p&&g&&p.type===g.type&&(p.type==="pad"?p.index===g.index:p.layout===g.layout),l=p=>p.type==="pad"?"\u{1F3AE} "+yu(i.pads[p.index]?.id):p.layout==="p1"?"\u2328\uFE0F\u{1F5B1}\uFE0F Keyboard &amp; Mouse":"\u2328\uFE0F Keyboard (arrow keys)",c=()=>!!(this.joinSlots[0]&&this.joinSlots[1]),h=()=>{},u=(p,g)=>{if(this.joinSlots.some(M=>a(M,p)))return!1;let x=g>=0&&!this.joinSlots[g]?g:this.joinSlots.findIndex(M=>!M);return x<0?!1:(this.joinSlots[x]=p,this.app.audio.select(),p.type==="pad"&&i.rumble(p,.5,.5,150),h(),!0)},d=[0,1].map(p=>{let g=t==="versus"?p:0,x=ai("div","join-slot team"+g,o);ai("div","join-title",x,`PLAYER ${p+1}`);let M=ai("div","join-body",x);return x.addEventListener("click",()=>{this.joinSlots[p]||u({type:"kb",layout:"p1"},p)||u({type:"kb",layout:"p2"},p)}),{box:x,body:M,team:g}}),f=ai("div","join-status",n),m=()=>{if(!c())return;let p=this.joinSlots.map((x,M)=>({device:x,team:t==="versus"?M:0,name:`Player ${M+1}`})),g=e["teamSize_"+t];this.app.startMatch({mode:t,gameMode:e.gameMode,items:e.items,teamSize:g,duration:e.duration,difficulty:e.difficulty,split:e.split,humans:p})},v=this.button(n,"\u25B6  START MATCH",m,"primary");this.button(n,"\u25C0  BACK",()=>this.show("setup",t)),h=()=>{d.forEach((p,g)=>{let x=this.joinSlots[g];if(p.box.classList.toggle("joined",!!x),p.box.classList.toggle("clickable",!x),x){let M=x.type==="pad"?"Press \u24B7 to leave":"Press Backspace to leave";p.body.innerHTML=`<div class="join-device">${l(x)}</div><div class="join-team" style="color:${Ie[p.team].css}">${p.team===0?"BLUE":"ORANGE"} TEAM</div><div class="join-leave">${M}</div>`}else p.body.innerHTML='<div class="join-wait">Press <b>\u24B6</b> on a controller<br><span><b>Click here</b> or press <b>Space</b> for keyboard &amp; mouse</span></div>'}),f.innerHTML=c()?"<b>Ready!</b> Press <b>\u24B6</b>, <b>Start</b>, <b>Enter</b> or click <b>Start match</b>":"Waiting for players\u2026",f.classList.toggle("ready",c()),v.el.classList.toggle("hidden",!c()),r.innerHTML=i.gamepadBlocked?"\u26A0\uFE0F This page is not allowed to read game controllers, so only keyboard &amp; mouse work here. To play with a controller, open the game from its own web address (GitHub Pages) or from the downloaded <b>index.html</b>.":"",r.classList.toggle("hidden",!i.gamepadBlocked)},h(),this.custom=p=>{for(let x of i.connectedPads()){let M={type:"pad",index:x.index},y=this.joinSlots.findIndex(b=>a(b,M));if(x.pressed("a")||x.pressed("menu")){if(y<0)u(M,-1);else if(c())return m(),!0}if(x.pressed("b"))if(y>=0)this.joinSlots[y]=null,this.app.audio.click(),h();else return this.show("setup",t),!0}let g=x=>i.keysPressed.has(x);if(c()&&(g("Space")||g("Enter")||g("NumpadEnter")))return m(),!0;if(g("Space")&&u({type:"kb",layout:"p1"},-1),(g("Enter")||g("NumpadEnter"))&&u({type:"kb",layout:"p2"},-1),g("Backspace")){for(let x=1;x>=0;x--)if(this.joinSlots[x]&&this.joinSlots[x].type==="kb"){this.joinSlots[x]=null,h();break}}return g("Escape")?(this.show("setup",t),!0):(i.gamepadBlocked&&!this.blockedShown&&(this.blockedShown=!0,h()),!0)}}screen_settings(){let t=this.app.settings,e=this.panel("SETTINGS");this.option(e,"Graphics",[{label:"High",value:"high"},{label:"Medium",value:"medium"},{label:"Low (fast)",value:"low"}],()=>t.quality,n=>{t.quality=n}),this.option(e,"Handling",[{label:"Easy (recommended)",value:"easy"},{label:"Realistic (Rocket League)",value:"realistic"}],()=>t.handling,n=>{t.handling=n}),this.option(e,"Default camera",[{label:"Ball cam",value:!0},{label:"Car cam",value:!1}],()=>t.ballCam,n=>{t.ballCam=n}),this.option(e,"Field of view",[90,95,100,105,110].map(n=>({label:n+"\xB0",value:n})),()=>t.fov,n=>{t.fov=n}),this.option(e,"Goal replays",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.replays,n=>{t.replays=n}),this.option(e,"Victory cinematic",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.victoryFx!==!1,n=>{t.victoryFx=n}),this.option(e,"Controller rumble",[{label:"On",value:!0},{label:"Off",value:!1}],()=>t.rumble,n=>{t.rumble=n}),this.option(e,"Volume",[0,1,2,3,4,5,6,7,8,9,10].map(n=>({label:n===0?"Off":String(n),value:n/10})),()=>Math.round(t.volume*10)/10,n=>{t.volume=n,this.app.audio.setVolume(n)}),this.option(e,"Show FPS",[{label:"Off",value:!1},{label:"On",value:!0}],()=>t.showFps,n=>{t.showFps=n});let i=()=>{this.app.applySettings(),this.show("main")};this.button(e,"\u25C0  BACK",i,"primary"),this.onBack=i}screen_controls(){let t=this.panel("CONTROLS");t.classList.add("wide"),ai("div","controls",t,qm),this.button(t,"\u25C0  BACK",()=>this.show("main"),"primary"),this.onBack=()=>this.show("main")}screen_pause(){let t=this.panel("PAUSED");this.button(t,"\u25B6  RESUME",()=>this.app.resume(),"primary"),this.button(t,"\u21BB  RESTART MATCH",()=>this.app.restartMatch()),this.button(t,"\u{1F3AE}  CONTROLS",()=>this.show("pauseControls")),this.button(t,"\u23CF  QUIT TO MENU",()=>this.app.quitToMenu()),this.onBack=()=>this.app.resume(),this.onStart=()=>this.app.resume()}screen_pauseControls(){let t=this.panel("CONTROLS");t.classList.add("wide"),ai("div","controls",t,qm),this.button(t,"\u25C0  BACK",()=>this.show("pause"),"primary"),this.onBack=()=>this.show("pause")}screen_results(t){let e=this.panel(t.winner===0?"BLUE TEAM WINS":"ORANGE TEAM WINS");e.classList.add("wide","results",t.winner===0?"win-blue":"win-orange"),ai("div","final-score",e,`<span class="b">${t.scores[0]}</span><span class="dash">\u2013</span><span class="o">${t.scores[1]}</span>`);let i=t.rows.map(n=>`<tr class="team${n.team}"><td class="nm">${n.name===t.mvp?'<span class="mvp">MVP</span> ':""}${n.name}${n.human?"":' <span class="cpu">CPU</span>'}</td><td>${n.score}</td><td>${n.goals}</td><td>${n.assists}</td><td>${n.saves}</td><td>${n.shots}</td><td>${n.demos}</td></tr>`).join("");ai("table","stats",e,`<tr><th>Player</th><th>Score</th><th>Goals</th><th>Assists</th><th>Saves</th><th>Shots</th><th>Demos</th></tr>${i}`),this.button(e,"\u21BB  REMATCH",()=>this.app.restartMatch(),"primary"),this.button(e,"\u23CF  MAIN MENU",()=>this.app.quitToMenu()),this.onBack=()=>this.app.quitToMenu()}};var $m=Ft.halfX,tf=Ft.halfZ,Xm=Ft.height,yb=Ft.chamfer,qs=Ft.cornerR,Kd=Ft.rampR,Qd=Ft.goalHalfW,_b=Ft.goalH,Mb=Ft.goalDepth,Xs=$m-qs,Ys=tf-qs,ef=$m+tf-yb-qs*Math.SQRT2,Ym=Xs,Mo=ef-Xs,bo=ef-Ys,Zm=Ys;function jd(s,t,e,i,n,r){let o=n-e,a=r-i,l=((s-e)*o+(t-i)*a)/(o*o+a*a);l=l<0?0:l>1?1:l;let c=s-e-o*l,h=t-i-a*l;return c*c+h*h}function nf(s,t){let e=s<0?-s:s,i=t<0?-t:t,n=Math.min(jd(e,i,Xs,0,Ym,Mo),jd(e,i,Ym,Mo,bo,Zm),jd(e,i,bo,Zm,0,Ys)),r=e<Xs&&i<Ys&&e+i<ef,o=Math.sqrt(n);return(r?-o:o)-qs}function bb(s,t,e){let i=nf(s,e),n=Math.abs(t-Xm/2)-Xm/2,r=i+Kd,o=n+Kd,a=r>0?r:0,l=o>0?o:0;return-(Math.sqrt(a*a+l*l)+Math.min(Math.max(r,o),0)-Kd)}function Sb(s,t,e){return Math.min(Qd-Math.abs(s),t,_b-t,tf+Mb-Math.abs(e))}function on(s,t,e){let i=bb(s,t,e),n=Sb(s,t,e);return i>n?i:n}function bs(s,t,e,i){let r=on(s+1,t,e)-on(s-1,t,e),o=on(s,t+1,e)-on(s,t-1,e),a=on(s,t,e+1)-on(s,t,e-1),l=Math.hypot(r,o,a)||1;return i.x=r/l,i.y=o/l,i.z=a/l,i}function Jm(s,t,e,i,n,r,o){let a=0;for(let l=0;l<32;l++){let c=on(s+i*a,t+n*a,e+r*a);if(c<.5)return a;if(a+=c,a>o)return-1}return a<=o?a:-1}function So(s=220,t=5){let e=[[Xs,-Mo],[Xs,Mo],[bo,Ys],[-bo,Ys],[-Xs,Mo],[-Xs,-Mo],[-bo,-Ys],[bo,-Ys]],i=[],n=(o,a,l,c,h)=>{let u=i[i.length-1];u&&Math.abs(u.x-o)<1e-6&&Math.abs(u.z-a)<1e-6||i.push({x:o,z:a,nx:-l,nz:-c,wall:h})};for(let o=0;o<8;o++){let a=e[o],l=e[(o+1)%8],c=e[(o+2)%8],h=l[0]-a[0],u=l[1]-a[1],d=Math.hypot(h,u),f=[u/d,-h/d],m=o===2?"orange":o===6?"blue":o%2===0?"side":"corner",v=[],p=Math.max(1,Math.ceil(d/s));for(let A=0;A<=p;A++)v.push(A/p);if(m==="orange"||m==="blue"){for(let A of[Qd,-Qd]){let _=(A-a[0])/h;_>0&&_<1&&v.push(_)}v.sort((A,_)=>A-_)}for(let A of v)n(a[0]+h*A+f[0]*qs,a[1]+u*A+f[1]*qs,f[0],f[1],m);let g=c[0]-l[0],x=c[1]-l[1],M=Math.hypot(g,x),y=[x/M,-g/M],b=Math.atan2(f[1],f[0]),E=Math.atan2(y[1],y[0]);for(;E<b;)E+=Math.PI*2;for(let A=1;A<t;A++){let _=b+(E-b)*(A/t);n(l[0]+Math.cos(_)*qs,l[1]+Math.sin(_)*qs,Math.cos(_),Math.sin(_),"arc")}}let r=0;for(let o=0;o<i.length;o++)o>0&&(r+=Math.hypot(i[o].x-i[o-1].x,i[o].z-i[o-1].z)),i[o].s=r;return i.total=r+Math.hypot(i[0].x-i[i.length-1].x,i[0].z-i[i.length-1].z),i}var Eo=new w,sf=new w,Km=new w,rf=new w,of=new w,af=new w,Eb=De.friction,wb=2,Tb=3e-4;function Qm(s,t,e){let i=De.radius;s.vel.y-=Oi*t,e&&e(s,t),s.vel.multiplyScalar(1-De.drag*t);let n=s.vel.length();n>De.maxSpeed&&s.vel.multiplyScalar(De.maxSpeed/n),s.pos.addScaledVector(s.vel,t);let r=0;for(let a=0;a<2;a++){let l=on(s.pos.x,s.pos.y,s.pos.z);if(l>=i)break;bs(s.pos.x,s.pos.y,s.pos.z,Eo),s.pos.addScaledVector(Eo,i-l);let c=s.vel.dot(Eo);if(c<0){sf.copy(Eo).multiplyScalar(c),Km.copy(s.vel).sub(sf),rf.crossVectors(Eo,s.angVel).multiplyScalar(i),of.copy(Km).add(rf);let h=Math.max(of.length(),1e-4),u=-c/h,d=-c<40?0:De.restitution,f=af.copy(of).multiplyScalar(-Math.min(1,wb*u)*Eb);s.vel.addScaledVector(sf,-(1+d)),s.vel.add(f),s.angVel.add(rf.crossVectors(f,Eo).multiplyScalar(Tb*i)),r=Math.max(r,-c)}}let o=s.angVel.length();return o>De.maxSpin&&s.angVel.multiplyScalar(De.maxSpin/o),r}var Oh=class{constructor(){this.pos=new w(0,De.radius,0),this.vel=new w,this.angVel=new w,this.quat=new he,this.prevPos=this.pos.clone(),this.prevQuat=this.quat.clone(),this.lastTouch=null,this.prevTouch=null,this.lastTouchTime=-10,this.frozen=!1,this.force=null,this.iceTimer=0,this.attachedTo=null}reset(){this.pos.set(0,De.radius,0),this.vel.set(0,0,0),this.angVel.set(0,0,0),this.prevPos.copy(this.pos),this.lastTouch=null,this.prevTouch=null,this.frozen=!0,this.iceTimer=0,this.attachedTo=null}step(t){if(this.attachedTo||(this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.frozen))return 0;if(this.iceTimer>0)return this.iceTimer-=t,this.vel.set(0,0,0),this.angVel.multiplyScalar(.95),0;let e=Qm(this,t,this.force),i=this.angVel.length();return i>1e-4&&(af.copy(this.angVel).divideScalar(i),jm.setFromAxisAngle(af,i*t),this.quat.premultiply(jm).normalize()),e}goalState(){let t=De.radius;if(Math.abs(this.pos.x)<Ft.goalHalfW&&this.pos.y<Ft.goalH){if(this.pos.z>Ft.halfZ+t)return 1;if(this.pos.z<-Ft.halfZ-t)return 0}return-1}},jm=new he;function lf(s,t,e,i){let n={pos:s.pos.clone(),vel:s.vel.clone(),angVel:s.angVel.clone()},r=Math.round(t/e);if(i.length=0,s.frozen||s.attachedTo||s.iceTimer>0){for(let o=0;o<=r;o++)i.push({t:o*e,pos:n.pos.clone(),vel:s.frozen?new w:n.vel.clone()});return i}for(let o=0;o<=r;o++)i.push({t:o*e,pos:n.pos.clone(),vel:n.vel.clone()}),Qm(n,e,s.force);return i}var Hh=new w,an=new w,Xe=new w,cf=new w,ul=new w,hf=new w,xn=new w,xr=new w,is=new w,t0=new he,uf=new w,df=new w,e0=new w,i0=new w,n0=new w,ff=new w,es=It.hitboxHalf;function Ab(s){return s<=500?.65:s<=2300?.65-.1*(s-500)/1800:Math.max(.3,.55-.25*(s-2300)/2300)}function Rb(s,t,e,i){if(s.demolished||t.frozen)return!1;let n=De.radius;s.hitboxCenter(Hh),t0.copy(s.quat).invert(),an.copy(t.pos).sub(Hh).applyQuaternion(t0);let r=Math.max(-es.x,Math.min(es.x,an.x)),o=Math.max(-es.y,Math.min(es.y,an.y)),a=Math.max(-es.z,Math.min(es.z,an.z)),l=an.x-r,c=an.y-o,h=an.z-a,u=Math.hypot(l,c,h);if(u>=n)return!1;if(u<.001){let b=es.x-Math.abs(an.x),E=es.y-Math.abs(an.y),A=es.z-Math.abs(an.z);l=c=h=0,b<E&&b<A?l=Math.sign(an.x)||1:E<A?c=Math.sign(an.y)||1:h=Math.sign(an.z)||1,u=0}else l/=u,c/=u,h/=u;Xe.set(l,c,h).applyQuaternion(s.quat);let d=n-u;cf.set(r,o,a).applyQuaternion(s.quat).add(Hh);let f=De.mass,m=It.mass;t.pos.addScaledVector(Xe,d*(m/(f+m))),s.pos.addScaledVector(Xe,-d*(f/(f+m)));let v=Math.min(4600,xn.copy(s.vel).sub(t.vel).length());ul.copy(cf).sub(s.pos),hf.crossVectors(s.angVel,ul).add(s.vel);let p=xn.copy(t.vel).sub(hf).dot(Xe);if(p>=0)return!0;xn.crossVectors(ul,Xe),s.applyInvInertia(xn),xr.crossVectors(xn,ul);let g=1/f+1/m+Xe.dot(xr),x=-p/g;t.vel.addScaledVector(Xe,x/f),s.vel.addScaledVector(Xe,-x/m),s.onGround||(xn.crossVectors(ul,Xe).multiplyScalar(-x*.5),s.angVel.add(s.applyInvInertia(xn))),xn.copy(hf).sub(t.vel),xn.addScaledVector(Xe,-xn.dot(Xe)),t.angVel.addScaledVector(is.crossVectors(Xe,xn),-.6/n);let M=-p;e-s.lastBallHit>.1&&(s.forward(xr),is.copy(t.pos).sub(Hh),is.y*=.35,is.addScaledVector(xr,-.35*is.dot(xr)),is.normalize(),t.vel.addScaledVector(is,v*Ab(v)*(s.hitPower||1)),M=Math.max(M,v)),s.lastBallHit=e;let y=t.vel.length();return y>De.maxSpeed&&t.vel.multiplyScalar(De.maxSpeed/y),i&&i.push({type:"ballHit",car:s,strength:M,point:cf.clone()}),!0}function Cb(s,t,e,i,n,r,o){let a=s.x-t.x*n,l=s.y-t.y*n,c=s.z-t.z*n,h=e.x-i.x*n,u=e.y-i.y*n,d=e.z-i.z*n,f=t.x*2*n,m=t.y*2*n,v=t.z*2*n,p=i.x*2*n,g=i.y*2*n,x=i.z*2*n,M=a-h,y=l-u,b=c-d,E=f*f+m*m+v*v,A=f*p+m*g+v*x,_=p*p+g*g+x*x,R=f*M+m*y+v*b,P=p*M+g*y+x*b,I=E*_-A*A,N=I>1e-6?(A*P-_*R)/I:0;N=Math.max(0,Math.min(1,N));let H=(A*N+P)/_;H<0?(H=0,N=Math.max(0,Math.min(1,-R/E))):H>1&&(H=1,N=Math.max(0,Math.min(1,(A-R)/E))),r.set(a+f*N,l+m*N,c+v*N),o.set(h+p*H,u+g*H,d+x*H)}var Pb=1100,pf=new w;function s0(s,t,e){if(s.team===t.team||s.demolished)return!1;s.forward(pf);let i=s.vel.dot(e)-t.vel.dot(e);return s.hitPower>1?pf.dot(e)>.25&&i>150:pf.dot(e)<.5?!1:s.supersonic?i>300:s.boosting&&s.vel.length()>Pb&&i>700}function Ib(s,t,e,i,n){if(s.demolished||t.demolished||(s.hitboxCenter(uf),t.hitboxCenter(df),uf.distanceToSquared(df)>62500))return;s.forward(e0),t.forward(i0);let r=36;Cb(uf,e0,df,i0,es.z-r*.6,n0,ff),Xe.copy(ff).sub(n0);let o=Xe.length();if(o>=r*2)return;o<.001?(Xe.set(1,0,0),o=0):Xe.divideScalar(o);let a=r*2-o;s.pos.addScaledVector(Xe,-a/2),t.pos.addScaledVector(Xe,a/2);let l=xn.copy(t.vel).sub(s.vel).dot(Xe);if(l>=0)return;is.copy(Xe).negate();let c=s0(s,t,Xe),h=s0(t,s,is);if(c||h){for(let[b,E]of[[s,t],[t,s]]){if(b===s?!c:!h)continue;let A=E.pos.clone();E.demolish(),b.stats.demos++,i&&i.push({type:"demo",car:E,by:b,point:A})}return}let u=s.id<t.id?s.id*1e3+t.id:t.id*1e3+s.id,d=n.get(u)??-10,f=s.vel.dot(Xe),m=-t.vel.dot(Xe),v=f>=m?s:t,p=v===s?t:s,g=v===s?Xe:is;v.forward(xr);let x=xr.dot(g)>.55,M=-(1+.3)*l/2;s.vel.addScaledVector(Xe,-M),t.vel.addScaledVector(Xe,M);let y=-l;x&&y>350&&e-d>.25&&(p.vel.addScaledVector(g,y*.55),p.vel.y+=Math.min(600,y*.28),p.noGround=.15,p.onGround=!1,n.set(u,e),i&&i.push({type:"bump",car:p,by:v,strength:y,point:ff.clone()}))}var zh=class{constructor(){this.ball=new Oh,this.cars=[],this.time=0,this.events=[],this.bumpTimes=new Map,this.pads=[];for(let[t,e]of Dh)this.pads.push({x:t,z:e,big:!0,active:!0,timer:0});for(let[t,e]of Nh)this.pads.push({x:t,z:e,big:!1,active:!0,timer:0});this.respawnIndex=0,this.mode=null}addCar(t){return t.events=this.events,this.cars.push(t),t}resetPads(){for(let t of this.pads)t.active=!0,t.timer=0}respawn(t){let e=qd[this.respawnIndex++%qd.length],i=t.team===0?1:-1,n=t.team===0?e[2]:Math.PI-e[2];t.place(e[0]*i,e[1]*i,n),this.events.push({type:"respawn",car:t})}step(t){this.time+=t;let{ball:e,cars:i,mode:n}=this;n&&n.preStep(t);for(let o of i){if(o.demolished){o.respawnTimer-=t,o.prevPos.copy(o.pos),o.respawnTimer<=0&&this.respawn(o);continue}o.step(t)}n&&n.preBall(t);let r=e.step(t);r>250&&this.events.push({type:"bounce",strength:r,point:e.pos.clone()});for(let o of i)e.attachedTo!==o&&Rb(o,e,this.time,this.events)&&(e.lastTouch!==o&&(e.prevTouch=e.lastTouch,e.lastTouch=o),e.lastTouchTime=this.time,n&&n.onTouch(o));for(let o=0;o<i.length;o++)for(let a=o+1;a<i.length;a++)Ib(i[o],i[a],this.time,this.events,this.bumpTimes);for(let o of this.pads){if(!o.active){o.timer-=t,o.timer<=0&&(o.active=!0);continue}let a=o.big?208:144;for(let l of i){if(l.demolished||l.boost>=100||l.pos.y>180)continue;let c=l.pos.x-o.x,h=l.pos.z-o.z;if(c*c+h*h<a*a){l.boost=o.big?100:Math.min(100,l.boost+12),o.active=!1,o.timer=o.big?10:4,this.events.push({type:"boostPickup",car:l,big:o.big,pad:o});break}}}n&&n.postStep(t)}};var r0=new w(0,1,0),Ye=new w,li=new w,kh=new w,ns=new w,Ei=new w,mf=new w,xi=new w,dl=new w,Ze=new w,Vh=new w,Gh=new w,gf=new w,yr=new he,fl=new he,o0=new he,Xi=It.hitboxHalf,ti=It.hitboxOffset,vf=new w(12/(It.mass*((2*Xi.y)**2+(2*Xi.z)**2)),12/(It.mass*((2*Xi.x)**2+(2*Xi.z)**2)),12/(It.mass*((2*Xi.x)**2+(2*Xi.y)**2))),pl=[];for(let s of[-1,1])for(let t of[-1,1])for(let e of[-1,1])pl.push(new w(ti.x+s*Xi.x,ti.y+t*Xi.y,ti.z+e*Xi.z));pl.push(new w(ti.x,ti.y+Xi.y,ti.z),new w(ti.x,ti.y-Xi.y,ti.z),new w(ti.x+Xi.x,ti.y,ti.z),new w(ti.x-Xi.x,ti.y,ti.z),new w(ti.x,ti.y,ti.z+Xi.z),new w(ti.x,ti.y,ti.z-Xi.z));function Lb(s){return s<1400?1600-1440*s/1400:s<1410?160*(1-(s-1400)/10):0}var wo=[[0,.0069],[500,.00398],[1e3,.00235],[1500,.001375],[1750,.0011],[2500,88e-5]];function Db(s){s=Math.abs(s);for(let t=1;t<wo.length;t++)if(s<=wo[t][0]){let e=wo[t-1],i=wo[t],n=(s-e[0])/(i[0]-e[0]);return e[1]+(i[1]-e[1])*n}return wo[wo.length-1][1]}function Nb(){return{throttle:0,steer:0,pitch:0,yaw:0,roll:0,jump:!1,boost:!1,powerslide:!1,useItem:!1}}var Ub=0,Wh=class{constructor(t,e="Player"){this.id=Ub++,this.team=t,this.name=e,this.pos=new w,this.vel=new w,this.angVel=new w,this.quat=new he,this.prevPos=new w,this.prevQuat=new he,this.input=Nb(),this.hitPower=1,this.handling="easy",this.prevJump=!1,this.boost=Wd,this.onGround=!1,this.groundNormal=new w(0,1,0),this.wheelContacts=0,this.wheelDist=[0,0,0,0],this.hasJumped=!1,this.canDodge=!1,this.jumpHold=0,this.noGround=0,this.sinceJump=10,this.dodgeTime=0,this.dodgeAxis=new w,this.dodgePitchSign=0,this.boosting=!1,this.supersonic=!1,this.demolished=!1,this.respawnTimer=0,this.frozen=!1,this.turtleTime=0,this.selfRight=0,this.yawRate=0,this.steerVisual=0,this.wheelSpin=0,this.lastBallHit=-10,this.bodyHit=0,this.events=null,this.stats={goals:0,assists:0,shots:0,saves:0,demos:0,score:0}}forward(t){return t.set(0,0,1).applyQuaternion(this.quat)}up(t){return t.set(0,1,0).applyQuaternion(this.quat)}left(t){return t.set(1,0,0).applyQuaternion(this.quat)}hitboxCenter(t){return t.set(ti.x,ti.y,ti.z).applyQuaternion(this.quat).add(this.pos)}place(t,e,i,n=Wd){this.pos.set(t,It.restHeight,e),this.vel.set(0,0,0),this.angVel.set(0,0,0),this.quat.setFromAxisAngle(r0,i),this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.boost=n,this.onGround=!0,this.groundNormal.set(0,1,0),this.hasJumped=!1,this.canDodge=!1,this.jumpHold=0,this.noGround=0,this.dodgeTime=0,this.demolished=!1,this.supersonic=!1,this.boosting=!1,this.turtleTime=0,this.yawRate=0}demolish(){this.demolished=!0,this.respawnTimer=3,this.vel.set(0,0,0),this.angVel.set(0,0,0),this.boosting=!1}speed(){return this.vel.length()}applyInvInertia(t){return o0.copy(this.quat).invert(),t.applyQuaternion(o0),t.x*=vf.x,t.y*=vf.y,t.z*=vf.z,t.applyQuaternion(this.quat)}step(t){if(this.prevPos.copy(this.pos),this.prevQuat.copy(this.quat),this.demolished||this.frozen){this.boosting=!1,this.prevJump=this.input.jump;return}let e=this.input,i=e.jump&&!this.prevJump;this.prevJump=e.jump,this.sinceJump+=t,this.noGround>0&&(this.noGround-=t),this.forward(Ye),this.up(li),this.left(kh);let n=0,r=0;if(mf.set(0,0,0),this.noGround<=0){let c=It.restHeight+14;for(let h=0;h<4;h++){let u=It.wheels[h];xi.copy(this.pos).addScaledVector(kh,u.x).addScaledVector(Ye,u.z);let d=Jm(xi.x,xi.y,xi.z,-li.x,-li.y,-li.z,c);this.wheelDist[h]=d,d>=0&&(n++,r+=d,xi.addScaledVector(li,-d+2),bs(xi.x,xi.y,xi.z,Ei),mf.add(Ei))}}else this.wheelDist.fill(-1);this.wheelContacts=n;let o=!1;n>=2&&(Ei.copy(mf).normalize(),Ei.dot(li)>.55&&(o=!0,-Oi*Ei.y>It.stickyAccel&&(o=!1,n>=3&&(this.hasJumped=!1,this.canDodge=!0,this.sinceJump=0))));let a=i;o&&i&&(a=!1,this.vel.addScaledVector(li,It.jumpImpulse),this.jumpHold=It.jumpHoldTime,this.hasJumped=!0,this.leftWithoutJump=!1,this.canDodge=!0,this.sinceJump=0,this.noGround=.12,o=!1,this.onGround=!1,this.events&&this.events.push({type:"jump",car:this})),o?this.groundStep(t,Ei,r/n):this.airStep(t,a),this.bodyCollide(t,o);let l=this.vel.length();l>It.maxSpeed&&this.vel.multiplyScalar(It.maxSpeed/l),l>=It.supersonic?this.supersonic=!0:l<It.supersonic-100&&(this.supersonic=!1),this.steerVisual+=(e.steer-this.steerVisual)*Math.min(1,t*12),this.forward(Ye),this.wheelSpin+=this.vel.dot(Ye)/14*t}groundStep(t,e,i){let n=this.input,r=!this.onGround;if(this.onGround=!0,this.groundNormal.copy(e),this.hasJumped=!1,this.leftWithoutJump=!1,this.canDodge=!1,this.jumpHold=0,this.dodgeTime=0,this.turtleTime=0,this.selfRight=0,r){let M=-this.vel.dot(e);this.events&&M>250&&this.events.push({type:"land",car:this,strength:M})}this.up(li),yr.setFromUnitVectors(li,e),fl.identity().slerp(yr,1-Math.exp(-t*28)),this.quat.premultiply(fl).normalize(),this.vel.y-=Oi*t;let o=this.vel.dot(e);o<40&&this.vel.addScaledVector(e,-o),this.forward(Ye),Ye.addScaledVector(e,-Ye.dot(e)).normalize(),ns.crossVectors(Ye,e).normalize();let a=this.vel.dot(Ye),l=n.throttle,c=n.boost&&this.boost>0;c&&(l=1);let h=0;if(l!==0)a*l>=0||Math.abs(a)<25?h=Lb(Math.abs(a))*l:(h=It.brakeAccel*Math.sign(l),Math.abs(a)<It.brakeAccel*t&&(h=-a/t));else if(Math.abs(a)>0){let M=Math.min(It.coastDecel,Math.abs(a)/t);h=-Math.sign(a)*M}this.vel.addScaledVector(Ye,h*t),c&&(this.vel.addScaledVector(Ye,It.boostAccelGround*t),this.boost=Math.max(0,this.boost-It.boostUsePerSec*t)),this.boosting=c;let u=this.handling!=="realistic",d=this.vel.dot(Ye),f=Db(d);u&&(f*=1+.55*Math.min(1,Math.max(0,(Math.abs(d)-400)/1600)));let m=-n.steer*f*d;n.powerslide&&(m*=1.35),this.yawRate+=(m-this.yawRate)*(1-Math.exp(-t*(u?26:18))),Math.abs(this.yawRate)>1e-5&&(yr.setFromAxisAngle(e,this.yawRate*t),this.quat.premultiply(yr).normalize(),u&&!n.powerslide&&this.vel.applyQuaternion(fl.identity().slerp(yr,.85)));let v=Math.min(1,Math.max(.3,(Oi*Math.max(0,e.y)+It.stickyAccel)/(Oi+It.stickyAccel))),p=(n.powerslide?2.2:u?30:14)*v;this.forward(Ye),Ye.addScaledVector(e,-Ye.dot(e)).normalize(),ns.crossVectors(Ye,e).normalize();let g=this.vel.dot(ns);this.vel.addScaledVector(ns,-g*(1-Math.exp(-t*p))),this.pos.addScaledVector(this.vel,t);let x=It.restHeight-i;this.pos.addScaledVector(e,x*(1-Math.exp(-t*30))),this.angVel.copy(e).multiplyScalar(this.yawRate)}airStep(t,e){let i=this.input;this.onGround&&(this.onGround=!1,this.hasJumped||(this.canDodge=!0,this.sinceJump=0,this.hasJumped=!0,this.leftWithoutJump=!0)),this.onGround=!1,this.yawRate=0,this.forward(Ye),this.up(li),this.left(kh),ns.copy(kh).negate(),this.vel.y-=Oi*t,this.jumpHold>0&&(i.jump?(this.vel.addScaledVector(li,It.jumpHoldAccel*t),this.jumpHold-=t):this.jumpHold=0);let n=this.leftWithoutJump?1e9:It.doubleJumpWindow;if(e&&this.canDodge&&this.sinceJump<n){this.canDodge=!1,this.jumpHold=0;let l=-i.pitch,c=i.yaw;if(Math.abs(l)+Math.abs(c)>=.5){let h=l,u=c,d=Math.hypot(h,u);d>1&&(h/=d,u/=d),Ze.set(Ye.x,0,Ye.z),Ze.lengthSq()<1e-4&&Ze.set(-li.x,0,-li.z),Ze.normalize(),Vh.set(-Ze.z,0,Ze.x);let f=h>=0?It.dodgeImpulse:It.dodgeImpulse*1.066,m=this.vel.length(),v=It.dodgeImpulse*(1+.9*Math.min(1,m/It.maxSpeed));this.vel.addScaledVector(Ze,h*f).addScaledVector(Vh,u*v*.9),this.vel.y*=.35,this.angVel.copy(ns).multiplyScalar(-h*It.maxAngVel).addScaledVector(Ye,u*It.maxAngVel),this.dodgeTime=It.dodgeTime,this.dodgeAxis.copy(this.angVel),this.dodgePitchSign=Math.sign(-h),this.events&&this.events.push({type:"dodge",car:this})}else this.vel.addScaledVector(li,It.jumpImpulse),this.events&&this.events.push({type:"jump",car:this})}if(this.selfRight>0)this.selfRight-=t,Ze.set(Ye.x,0,Ye.z),Ze.lengthSq()<.001&&Ze.set(-li.x,0,-li.z),Ze.lengthSq()<1e-6&&Ze.set(0,0,1),Ze.normalize(),fl.setFromAxisAngle(r0,Math.atan2(Ze.x,Ze.z)),this.quat.slerp(fl,1-Math.exp(-t*9)),this.angVel.set(0,0,0);else if(this.dodgeTime>0){if(this.dodgeTime-=t,this.dodgePitchSign!==0&&Math.sign(i.pitch)===this.dodgePitchSign&&Math.abs(i.pitch)>.5){let c=this.angVel.dot(ns);this.angVel.addScaledVector(ns,-c*Math.min(1,t*20))}}else{let l=i.pitch,c=i.yaw,h=i.roll;i.powerslide&&(h=Math.max(-1,Math.min(1,h+i.yaw)),c=0);let u=this.angVel.dot(ns),d=this.angVel.dot(li),f=this.angVel.dot(Ye);u+=(It.airPitch*l-It.dampPitch*u*(1-Math.abs(l)))*t,d+=(-It.airYaw*c-It.dampYaw*d*(1-Math.abs(c)))*t,f+=(It.airRoll*h-It.dampRoll*f)*t,this.angVel.copy(ns).multiplyScalar(u).addScaledVector(li,d).addScaledVector(Ye,f)}let r=this.angVel.length();r>It.maxAngVel&&this.angVel.multiplyScalar(It.maxAngVel/r);let o=i.boost&&this.boost>0;o?(this.vel.addScaledVector(Ye,It.boostAccelAir*t),this.boost=Math.max(0,this.boost-It.boostUsePerSec*t)):i.throttle!==0&&this.vel.addScaledVector(Ye,It.airThrottleAccel*i.throttle*t),this.boosting=o,this.pos.addScaledVector(this.vel,t);let a=this.angVel.length();a>1e-6&&(Ze.copy(this.angVel).divideScalar(a),yr.setFromAxisAngle(Ze,a*t),this.quat.premultiply(yr).normalize()),this.up(li),bs(this.pos.x,this.pos.y,this.pos.z,Ei),this.turtled=this.bodyHit>0&&this.vel.lengthSq()<300*300&&li.dot(Ei)<.5,this.turtled?(this.turtleTime+=t,(e&&this.turtleTime>.15||this.turtleTime>2.5)&&(this.vel.y+=340,this.selfRight=.6,this.turtleTime=0,this.canDodge=!1)):this.turtleTime=0}bodyCollide(t,e){this.bodyHit=Math.max(0,this.bodyHit-t);for(let i=0;i<3;i++){let n=0,r=-1;for(let u=0;u<pl.length;u++){xi.copy(pl[u]).applyQuaternion(this.quat).add(this.pos);let d=on(xi.x,xi.y,xi.z);if(d<n){if(e&&(bs(xi.x,xi.y,xi.z,Ei),this.up(li),Math.abs(Ei.dot(li))>.6))continue;n=d,r=u}}if(r<0)return;if(xi.copy(pl[r]).applyQuaternion(this.quat).add(this.pos),bs(xi.x,xi.y,xi.z,Ei),this.pos.addScaledVector(Ei,-n+.1),this.bodyHit=.2,dl.copy(xi).sub(this.pos),e){let u=this.vel.dot(Ei);u<0&&this.vel.addScaledVector(Ei,-u*1.2);continue}gf.crossVectors(this.angVel,dl).add(this.vel);let o=gf.dot(Ei);if(o>=0)continue;Ze.crossVectors(dl,Ei),this.applyInvInertia(Ze),Vh.crossVectors(Ze,dl);let a=1/It.mass+Ei.dot(Vh),c=-(1+(o<-350?.3:0))*o/a;Gh.copy(Ei).multiplyScalar(c),Ze.copy(gf).addScaledVector(Ei,-o);let h=Ze.length();if(h>.001){Ze.divideScalar(h);let u=Math.min(.6*c,h*It.mass/2);Gh.addScaledVector(Ze,-u)}this.vel.addScaledVector(Gh,1/It.mass),Ze.crossVectors(dl,Gh),this.angVel.add(this.applyInvInertia(Ze))}}};var a0={rookie:{itemDelay:2.5,replan:.32,aimError:650,boost:.35,dodge:!1,kickoffFlip:!1,jumpReach:200,aerial:!1,maxSpeed:1900,wrongSideCare:.4},pro:{itemDelay:1,replan:.14,aimError:260,boost:.85,dodge:!0,kickoffFlip:!0,jumpReach:420,aerial:!1,maxSpeed:2300,wrongSideCare:.8},allstar:{itemDelay:.4,replan:.05,aimError:90,boost:1,dodge:!0,kickoffFlip:!0,jumpReach:1300,aerial:!0,maxSpeed:2300,wrongSideCare:1}},wi=new w,qh=new w,Zs=new w,_r=new w,Se=new w,yn=new w,Yi=new w,Fb=new w(0,-Oi,0),l0=new w,ss=De.radius,ji=Ft.halfZ,Ss=Ft.goalHalfW;function c0(s){if(s<=0)return 0;let t=(It.jumpHoldAccel-Oi)/2;if(s<=74.6)return(-It.jumpImpulse+Math.sqrt(It.jumpImpulse**2+4*t*s))/(2*t);let e=453.3,n=e*e-4*325*(s-74.6);return n<0?1/0:.2+(e-Math.sqrt(n))/650}function Bb(s){if(s<=96)return c0(s);let t=712,i=t*t-4*325*(s-96);return i<0?1/0:.25+(t-Math.sqrt(i))/650}var To=[[0,.0069],[500,.00398],[1e3,.00235],[1500,.001375],[1750,.0011],[2500,88e-5]];function Ob(s){for(let t=1;t<To.length;t++)if(s<=To[t][0]){let e=To[t-1],i=To[t];return e[1]+(i[1]-e[1])*(s-e[0])/(i[0]-e[0])}return To[To.length-1][1]}function Hb(s,t,e,i){t=Math.max(0,Math.min(t,e));let n=(e-t)/i,r=(t+e)/2*n;return s<=r?(-t+Math.sqrt(t*t+2*i*s))/i:n+(s-r)/e}var Xh=class{constructor(t,e="pro"){this.car=t,this.cfg=a0[e]||a0.pro,this.replanT=Math.random()*.1,this.target=new w,this.ballTarget=new w,this.desiredSpeed=2300,this.interceptT=1,this.mode="chase",this.seq=null,this.seqT=0,this.stuckT=0,this.reverseT=0,this.aimOffset=(Math.random()-.5)*this.cfg.aimError,this.aerialing=!1,this.lastJumpAt=-10,this.careT=0,this.cares=!0,this.retreatStart=-10}get attackSign(){return this.car.team===0?1:-1}startSeq(t){this.seq=t,this.seqT=0}wantItem(t){let e=t.rumble;if(!e)return!1;let i=e.st(this.car);if(!i.item||i.active||i.held<this.cfg.itemDelay)return!1;let n=this.car,r=t.world.ball,o=this.attackSign,a=n.pos.distanceTo(r.pos);n.forward(wi),Se.copy(r.pos).sub(n.pos).normalize();let l=Se.dot(wi),c=r.vel.z*o<-500,h=!1;switch(i.item){case"grapple":h=a>900&&a<3800&&l>.6&&r.pos.y<1500;break;case"plunger":h=a>900&&a<3800&&(c||r.pos.z*o<-2500);break;case"tornado":h=a<700;break;case"curveball":h=a<4500&&r.vel.z*o>300&&r.pos.z*o>-500;break;case"spikes":case"power":h=!0;break;case"boot":h=!!e.nearestOpponent(n,2200);break;case"freezer":h=c&&r.pos.z*o<-1500&&a<6e3;break;default:break}return!h&&i.held>12&&(h=e.inRange(n,i.item)),h}update(t,e){let i=this.car,n=i.input;if(i.demolished)return;let r=this.wantItem(e);if(n.useItem=r&&!this.itemTap,this.itemTap=n.useItem,this.replanT-=t,this.replanT<=0&&(this.replanT=this.cfg.replan*(.7+Math.random()*.6),this.plan(e)),n.throttle=0,n.steer=0,n.pitch=0,n.yaw=0,n.roll=0,n.boost=!1,n.powerslide=!1,this.seq){this.seqT+=t;let o=null;for(let a of this.seq)this.seqT>=a.t&&(o=a);if(!o||this.seqT>this.seq[this.seq.length-1].t+.05||o.end&&this.seqT>=o.t)this.seq=null;else{n.jump=!!o.jump,n.pitch=o.pitch||0,n.yaw=o.yaw||0,n.steer=o.yaw||0,n.throttle=o.throttle??1,n.boost=!!o.boost&&i.boost>0,o.aerial&&this.aerialControl(t,e);return}}if(n.jump=!1,!i.onGround){if(i.turtled){this.turtleTap=(this.turtleTap||0)+1,n.jump=this.turtleTap%8<4;return}this.aerialing?this.aerialControl(t,e):this.recover();return}this.aerialing=!1,this.drive(t,e)}plan(t){let e=this.car,i=t.world.ball,n=this.attackSign,r=t.pred;e.forward(wi);let o=e.vel.length(),a=e.boost>8&&this.cfg.boost>.3,l=a?Math.min(this.cfg.maxSpeed,2200):1400,c=a?1900:1e3;if(t.kickoff){if(this.isClosest(t,i.pos)){this.mode="kickoff",this.target.copy(i.pos).add(Yi.set(0,0,-n*40)),this.ballTarget.copy(i.pos),this.desiredSpeed=2300;return}this.mode="support",this.setSupportTarget(t,!0);return}let h=this.cfg.jumpReach,u=null,d=null;for(let x=2;x<r.length;x+=2){let M=r[x];if(!d&&M.pos.z*n<-(ji+ss*.5)&&Math.abs(M.pos.x)<Ss+100&&(d=M),u||M.pos.y>h+ss)continue;this.shotDir(M.pos,d||t.threatOwn,yn),Yi.copy(M.pos).addScaledVector(yn,-(ss+70)),Se.copy(Yi).sub(e.pos).setY(0);let y=Se.length();Se.normalize();let b=Math.acos(we.clamp(Se.dot(wi.clone().setY(0).normalize()),-1,1)),E=e.vel.dot(Se),A=Hb(Math.max(0,y-60),E,l,c)+b*.32;if(M.pos.y>150&&(A+=.1),A<=M.t+.02){u=M;break}}u||(u=r[r.length-1]),this.interceptT=u.t,this.ballTarget.copy(u.pos);let f=!0;for(let x of t.teammates){if(x===e||x.demolished)continue;let M=x.pos.distanceTo(u.pos)/Math.max(800,x.vel.length()*.8+600),y=e.pos.distanceTo(u.pos)/Math.max(800,o*.8+600),b=(u.pos.z-x.pos.z)*n>0;if(M+(b?0:.6)<y-.15){f=!1;break}}let m=(e.pos.z-u.pos.z)*n,v=u.pos.z*n<0;if(!!d&&(m>-200||f)){if(m>300){this.mode="retreat",this.setRetreatTarget(u.pos),this.desiredSpeed=2300;return}this.mode="save",this.setHitTarget(u,d);return}if(!f){if(e.boost<30&&Math.random()<this.cfg.boost&&this.setBoostTarget(t)){this.mode="boost";return}this.mode="support",this.setSupportTarget(t,!1);return}this.careT-=this.cfg.replan,this.careT<=0&&(this.careT=2,this.cares=Math.random()<this.cfg.wrongSideCare);let g=this.mode==="retreat"&&m>-150&&t.time-this.retreatStart<3;if(m>250&&this.cares||g){this.mode!=="retreat"&&(this.retreatStart=t.time),this.mode="retreat",v||m>1500?this.setRetreatTarget(u.pos):this.target.set(u.pos.x*.5+(e.pos.x>u.pos.x?900:-900),0,u.pos.z-n*1300),this.clampTarget(),this.desiredSpeed=2300;return}if(e.boost<15&&!v&&u.t>2.2&&this.setBoostTarget(t)){this.mode="boost";return}this.mode="attack",this.setHitTarget(u,null)}aimPoint(t,e){let i=this.attackSign;return e?l0.set(t.x>=0?4e3:-4e3,0,t.z+i*3e3):l0.set(we.clamp(t.x*.25+this.aimOffset,-Ss+150,Ss-150),0,i*(ji+300))}shotDir(t,e,i){let n=this.aimPoint(t,e);if(i.copy(n).sub(t).setY(0).normalize(),Zs.copy(t).sub(this.car.pos).setY(0),Zs.lengthSq()<1)return i;Zs.normalize();let r=Math.acos(we.clamp(i.dot(Zs),-1,1)),o=we.clamp((r-.6)/1.6,0,.75);return o>0&&i.lerp(Zs,o).normalize(),i}setHitTarget(t,e){let i=this.car;this.shotDir(t.pos,e,yn);let n=Yi.copy(t.pos).sub(i.pos).setY(0).length(),r=we.clamp(n*.45,ss+40,1200);for(;r>ss+40&&(Yi.copy(t.pos).addScaledVector(yn,-r),!(nf(Yi.x,Yi.z)<-320&&Math.abs(Yi.z)<ji-250));)r-=80;r=Math.max(r,ss+40),this.target.copy(t.pos).addScaledVector(yn,-r),this.target.y=0,this.clampTarget();let o=i.pos.distanceTo(this.target)+r,a=Math.max(.05,t.t),l=t.pos.y>180;this.desiredSpeed=l?we.clamp(o/a,300,2300):2300,i.forward(wi),wi.setY(0).normalize();let c=Math.acos(we.clamp(wi.dot(yn),-1,1));n<1100&&c>.6&&!e&&(this.desiredSpeed=Math.min(this.desiredSpeed,700+(1100-Math.min(1100,c*500))))}setRetreatTarget(t){let e=this.attackSign,i=t.x>0?-Ss*.8:Ss*.8;this.target.set(i,0,-e*(ji-350))}setSupportTarget(t,e){let i=this.car,n=t.world.ball,r=this.attackSign,o=t.teammates.indexOf(i),a=o%2===0?-1:1;if(e)i.boost<60&&Math.abs(i.pos.x)>1e3?this.target.set(Math.sign(i.pos.x)*3072,0,-r*4096):this.target.set(0,0,-r*(ji-500));else{let c=n.pos.z-r*(2200+o*900);this.target.set(n.pos.x*.35+a*1100,0,Math.max(-ji+400,Math.min(ji-400,c*r))*r)}this.clampTarget();let l=i.pos.distanceTo(this.target);this.desiredSpeed=l>1500?2300:l>400?1400:300}setBoostTarget(t){let e=this.car,i=this.attackSign,n=null,r=1/0;for(let o of t.world.pads){if(!o.big||!o.active||o.z*i>1500)continue;let a=Math.hypot(o.x-e.pos.x,o.z-e.pos.z);a<r&&(r=a,n=o)}return!n||r>4500?!1:(this.target.set(n.x,0,n.z),this.desiredSpeed=2300,!0)}clampTarget(){this.target.x=we.clamp(this.target.x,-Ft.halfX+250,Ft.halfX-250),this.target.z=we.clamp(this.target.z,-ji+150,ji-150)}isClosest(t,e){let i=this.car.pos.distanceTo(e);for(let n of t.teammates){if(n===this.car)continue;let r=n.pos.distanceTo(e);if(r<i-5||Math.abs(r-i)<=5&&n.pos.x*this.attackSign<this.car.pos.x*this.attackSign)return!1}return!0}drive(t,e){let i=this.car,n=i.input,r=i.groundNormal;i.forward(wi),_r.crossVectors(wi,r).normalize();let o=i.vel.length(),a=i.vel.dot(wi),l=e.world.ball;if(l.attachedTo===i){Yi.set(0,0,this.attackSign*(ji-300)),Se.copy(Yi).sub(i.pos),Se.addScaledVector(r,-Se.dot(r));let P=Math.atan2(Se.dot(_r),Se.dot(wi));n.throttle=1,n.steer=we.clamp(P*3,-1,1),n.boost=Math.abs(P)<.4&&i.boost>0,Se.length()<2600&&Math.abs(P)<.3&&e.time-this.lastJumpAt>1.2&&(this.lastJumpAt=e.time,this.startSeq([{t:0,jump:!0},{t:.06,jump:!1},{t:.09,jump:!0,pitch:-1},{t:.19,jump:!1,end:!0}]));return}let c=this.target,h=i.pos.distanceTo(l.pos);if((this.mode==="attack"||this.mode==="save"||this.mode==="kickoff")&&h<650&&l.pos.y<260&&(this.shotDir(l.pos,this.mode==="save",yn),Yi.copy(l.pos).addScaledVector(yn,-(ss*.6)),Se.copy(l.pos).sub(i.pos).setY(0).normalize(),Se.dot(yn)>.2&&(c=Yi)),Math.abs(i.pos.z)>ji-60&&(Math.abs(c.x)>Ss-100||Math.abs(c.z)<ji-200)){let P=Math.sign(i.pos.z);(Math.abs(i.pos.z)>ji+60||Math.abs(i.pos.x)>Ss-80)&&(c=Yi.set(we.clamp(c.x,-Ss+250,Ss-250),0,P*(ji-500)))}Se.copy(c).sub(i.pos),Se.addScaledVector(r,-Se.dot(r));let u=Se.length(),d=Math.atan2(Se.dot(_r),Se.dot(wi)),f=we.clamp(d*3.2,-1,1),m=1,v=Math.abs(d)>1.6&&o>500,p=this.desiredSpeed;(this.mode==="support"||this.mode==="boost")&&(p=Math.min(p,u>1200?2300:Math.max(300,u*1.2)));let g=1/Ob(Math.max(a,0));if(Math.abs(d)>.3&&u<2*g*Math.sin(Math.min(Math.abs(d),Math.PI/2))*1.05&&(p=Math.min(p,Math.max(250,a*.5)),Math.abs(d)>1&&(v=o>350)),a>p+250&&(m=a>p+600?-1:0),this.reverseT>0){this.reverseT-=t,n.throttle=-1,n.steer=-f;return}o<120&&m>0?(this.stuckT+=t,this.stuckT>1.2&&(this.reverseT=.8,this.stuckT=0)):this.stuckT=0;let x=!1;if(i.boost>0&&Math.abs(d)<.3&&a<Math.min(this.cfg.maxSpeed,p)-80&&u>400){let P=this.mode==="kickoff"||this.mode==="save"||this.mode==="retreat"?0:this.cfg.boost<1?20:8;x=i.boost>P&&Math.random()<this.cfg.boost+.1}if(a>this.cfg.maxSpeed-50&&(x=!1),n.throttle=m,n.steer=f,n.powerslide=v,n.boost=x,this.mode==="kickoff"&&this.cfg.kickoffFlip&&h<520+o*.12&&o>1100&&Math.abs(d)<.25){this.startSeq([{t:0,jump:!0,boost:!0},{t:.07,jump:!1,boost:!0},{t:.1,jump:!0,pitch:-1,yaw:we.clamp(d*2,-.4,.4)},{t:.2,jump:!1,pitch:-1,end:!0}]);return}let M=e.time;if(M-this.lastJumpAt<1.2)return;let y=l.pos.y;Se.copy(l.pos).sub(i.pos);let b=Math.hypot(Se.x,Se.z),E=i.vel.clone().sub(l.vel),A=Math.max(1,E.dot(Se.clone().setY(0).normalize())),_=Math.max(0,b-110)/A,R=Se.clone().setY(0).normalize().dot(wi.clone().setY(0).normalize());if(this.cfg.dodge&&y<220&&b<360&&R>.85&&o>600&&_<.2&&(this.mode==="attack"||this.mode==="save")){let P=we.clamp(Se.dot(_r)/120,-.6,.6);this.lastJumpAt=M,this.startSeq([{t:0,jump:!0},{t:.06,jump:!1},{t:.09,jump:!0,pitch:-1,yaw:P},{t:.19,jump:!1,pitch:-.4,end:!0}]);return}if(y>190&&y<this.cfg.jumpReach+100&&R>.8&&b<1400){let P=y-110,I=P<230,N=I?c0(P):Bb(P),H=l.vel.y<0?(y-110-ss)/Math.max(1,-l.vel.y):1/0,L=Math.min(_,H+.3);Number.isFinite(N)&&Math.abs(L-N)<.06&&(I||this.cfg.jumpReach>350)&&(this.lastJumpAt=M,I?this.startSeq([{t:0,jump:!0},{t:Math.min(.2,N),jump:!0},{t:N+.02,jump:!1,end:!0}]):this.cfg.aerial&&P>520?(this.aerialing=!0,this.startSeq([{t:0,jump:!0,aerial:!0},{t:.2,jump:!1,aerial:!0},{t:.24,jump:!0,aerial:!0,boost:!0},{t:.3,jump:!1,aerial:!0,boost:!0,end:!0}])):this.startSeq([{t:0,jump:!0},{t:.2,jump:!1},{t:.24,jump:!0},{t:.3,jump:!1,end:!0}]))}else if(this.cfg.aerial&&y>520&&y<1500&&R>.9&&b<1500&&i.boost>30&&o>400){let P=this.interceptT,I=(y-120)/600+.3;Math.abs(P-I)<.25&&this.ballTarget.y>450&&(this.lastJumpAt=M,this.aerialing=!0,this.startSeq([{t:0,jump:!0,aerial:!0,boost:!0},{t:.2,jump:!1,aerial:!0,boost:!0},{t:.24,jump:!0,aerial:!0,boost:!0},{t:.3,jump:!1,aerial:!0,boost:!0,end:!0}]))}}orient(t,e){let i=this.car,n=i.input;i.forward(wi),i.up(qh),i.left(Zs),_r.copy(Zs).negate();let r=i.angVel,o=Math.atan2(t.dot(qh),t.dot(wi)),a=Math.atan2(t.dot(_r),t.dot(wi)),l=r.dot(_r),c=-r.dot(qh),h=r.dot(wi);n.pitch=we.clamp(o*3.5-l*.55,-1,1),n.yaw=we.clamp(a*3.5-c*.55,-1,1);let u=Math.atan2(Zs.dot(e),qh.dot(e));n.roll=we.clamp(u*2.5-h*.4,-1,1),n.steer=n.yaw,n.powerslide=!1}aerialControl(t,e){let i=this.car,n=i.input,r=e.world.ball,o=e.pred,a=o[o.length-1];for(let h=1;h<o.length;h++){let u=o[h],d=u.pos.distanceTo(i.pos)-ss-40,f=i.vel.length();if(d/Math.max(900,f+500*u.t)<=u.t){a=u;break}}let l=Math.max(.1,a.t);yn.copy(a.pos).sub(i.pos).addScaledVector(i.vel,-l).multiplyScalar(2/(l*l)).sub(Fb);let c=yn.length();(c>1500||i.boost<=0||i.pos.distanceTo(r.pos)<ss+60)&&c>1500&&!this.seq&&(this.aerialing=!1),Se.copy(yn).normalize(),this.orient(Se,Yi.set(0,1,0)),i.forward(wi),n.boost=i.boost>0&&wi.dot(Se)>.75&&c>250,n.throttle=1}recover(){let t=this.car,e=t.input;Se.set(t.vel.x,0,t.vel.z),Se.lengthSq()<100&&(t.forward(Se),Se.y=0),Se.normalize(),this.orient(Se,Yi.set(0,1,0)),e.throttle=1,e.boost=!1}};function $s(s,t){let e=document.createElement("canvas");return e.width=s,e.height=t,e}function rs(s,{srgb:t=!0,repeat:e=!1,aniso:i=8}={}){let n=new ri(s);return t&&(n.colorSpace=ze),e&&(n.wrapS=n.wrapT=Ji),n.anisotropy=i,n}function Ao(s=1){let t=s>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var ln={minZ:-(Ft.halfZ+Ft.goalDepth),maxZ:Ft.halfZ+Ft.goalDepth,halfX:Ft.halfX};function h0(s){let t=s==="low"?8:5.3333,e=Math.round(2*Ft.halfX/t),i=Math.round((ln.maxZ-ln.minZ)/t),n=$s(e,i),r=n.getContext("2d"),o=x=>(x+Ft.halfX)/t,a=x=>(ln.maxZ-x)/t,l=x=>x/t,c=512;for(let x=ln.minZ;x<ln.maxZ;x+=c){let M=Math.floor((x-ln.minZ)/c);r.fillStyle=M%2?"#3f7f2c":"#356f25",r.fillRect(0,a(x+c),e,l(c)+1)}let h=r.createLinearGradient(0,a(-Ft.halfZ),0,a(0));h.addColorStop(0,"rgba(40,110,255,0.10)"),h.addColorStop(1,"rgba(40,110,255,0)"),r.fillStyle=h,r.fillRect(0,a(0),e,a(ln.minZ)-a(0)),h=r.createLinearGradient(0,a(Ft.halfZ),0,a(0)),h.addColorStop(0,"rgba(255,120,30,0.10)"),h.addColorStop(1,"rgba(255,120,30,0)"),r.fillStyle=h,r.fillRect(0,0,e,a(0));let u=r.getImageData(0,0,e,i),d=u.data,f=Ao(7);for(let x=0;x<d.length;x+=4){let M=(f()-.5)*26+(f()<.04?-18:0);d[x]=Math.max(0,Math.min(255,d[x]+M*.6)),d[x+1]=Math.max(0,Math.min(255,d[x+1]+M)),d[x+2]=Math.max(0,Math.min(255,d[x+2]+M*.4))}r.putImageData(u,0,0);for(let x of[1,-1]){r.fillStyle="rgba(10,20,10,0.45)";let M=x*Ft.halfZ,y=x*(Ft.halfZ+Ft.goalDepth);r.fillRect(o(-Ft.goalHalfW),Math.min(a(M),a(y)),l(2*Ft.goalHalfW),Math.abs(a(y)-a(M)))}let m=(x,M)=>{r.lineWidth=l(x),r.strokeStyle=M};r.lineCap="round",r.lineJoin="round";let v="rgba(245,250,255,0.85)",p=So(160,6);m(34,v),r.beginPath(),p.forEach((x,M)=>{let y=x.x+x.nx*(Ft.rampR+60),b=x.z+x.nz*(Ft.rampR+60);M===0?r.moveTo(o(y),a(b)):r.lineTo(o(y),a(b))}),r.closePath(),r.stroke(),r.beginPath(),r.moveTo(o(-Ft.halfX+340),a(0)),r.lineTo(o(Ft.halfX-340),a(0)),r.stroke(),r.beginPath(),r.arc(o(0),a(0),l(1e3),0,Math.PI*2),r.stroke(),r.fillStyle=v,r.beginPath(),r.arc(o(0),a(0),l(60),0,Math.PI*2),r.fill();for(let x of[-1,1]){let M=x<0?"rgba(70,150,255,0.95)":"rgba(255,140,50,0.95)",y=x*(Ft.halfZ-340);m(40,M),r.beginPath(),r.moveTo(o(-Ft.goalHalfW),a(x*Ft.halfZ)),r.lineTo(o(Ft.goalHalfW),a(x*Ft.halfZ)),r.stroke(),m(30,v),r.beginPath(),r.moveTo(o(-1800),a(y)),r.lineTo(o(-1800),a(x*(Ft.halfZ-1500))),r.lineTo(o(1800),a(x*(Ft.halfZ-1500))),r.lineTo(o(1800),a(y)),r.stroke(),m(26,M),r.beginPath(),r.moveTo(o(-1150),a(y)),r.lineTo(o(-1150),a(x*(Ft.halfZ-800))),r.lineTo(o(1150),a(x*(Ft.halfZ-800))),r.lineTo(o(1150),a(y)),r.stroke(),m(30,v),r.beginPath();let b=a(x*(Ft.halfZ-1500));x<0?r.arc(o(0),b,l(700),Math.PI,0,!1):r.arc(o(0),b,l(700),0,Math.PI,!1),r.stroke(),m(26,x<0?"rgba(70,150,255,0.55)":"rgba(255,140,50,0.55)");for(let E of[-2600,2600])for(let A=0;A<3;A++){let _=x*(2e3+A*260);r.beginPath(),r.moveTo(o(E-220),a(_+x*160)),r.lineTo(o(E),a(_)),r.lineTo(o(E+220),a(_+x*160)),r.stroke()}}return rs(n,{aniso:16})}function u0(){let t=$s(256,256),e=t.getContext("2d"),i=e.createImageData(256,256),n=Ao(11),r=new Float32Array(256*256);for(let a=0;a<9e3;a++){let l=Math.floor(n()*256),c=Math.floor(n()*256),h=.35+n()*.65,u=1+Math.floor(n()*3);for(let d=0;d<u;d++){let f=(c+d)%256;r[f*256+l]=Math.max(r[f*256+l],h*(1-d*.2))}}for(let a=0;a<256*256;a++){let l=Math.round(r[a]*255);i.data[a*4]=l,i.data[a*4+1]=l,i.data[a*4+2]=l,i.data[a*4+3]=255}e.putImageData(i,0,0);let o=rs(t,{srgb:!1,repeat:!0});return o.magFilter=pi,o}function xf(s=3,t=512){let e=t/6,i=t,n=Math.round(Math.sqrt(3)*e*4),r=$s(i,n),o=r.getContext("2d");o.fillStyle="#000",o.fillRect(0,0,i,n),o.strokeStyle="#fff",o.lineWidth=s;let a=Math.sqrt(3)*e;for(let l=-1;l<=5;l++)for(let c=-1;c<=5;c++){let h=1.5*e*l,u=a*(c+(l%2?.5:0));o.beginPath();for(let d=0;d<=6;d++){let f=Math.PI/3*d,m=h+e*Math.cos(f),v=u+e*Math.sin(f);d===0?o.moveTo(m,v):o.lineTo(m,v)}o.stroke()}return rs(r,{srgb:!1,repeat:!0})}function yf(){let e=$s(2048,128),i=e.getContext("2d"),n=i.createLinearGradient(0,0,0,128);n.addColorStop(0,"#05070c"),n.addColorStop(1,"#0b1220"),i.fillStyle=n,i.fillRect(0,0,2048,128);let r=["ROCKET ARENA","SUPERSONIC","ROCKET ARENA","BOOST","ROCKET ARENA","AERIAL CUP"],o=2048/r.length;return r.forEach((a,l)=>{let c=l*o;i.fillStyle="rgba(120,180,255,0.18)",i.fillRect(c+4,8,o-8,112),i.fillStyle=l%2?"#ff8a2a":"#4aa8ff",i.beginPath(),i.arc(c+58,128/2,30,0,Math.PI*2),i.fill(),i.fillStyle="#fff",i.beginPath(),i.arc(c+58,128/2,18,0,Math.PI*2),i.fill(),i.fillStyle=l%2?"#ff8a2a":"#4aa8ff",i.beginPath(),i.arc(c+64,128/2-4,9,0,Math.PI*2),i.fill(),i.fillStyle="#f4f8ff",i.font="bold italic 54px Arial, Helvetica, sans-serif",i.textBaseline="middle",i.fillText(a,c+104,128/2+2,o-120)}),rs(e,{repeat:!0})}function d0(){let e=$s(1024,512),i=e.getContext("2d");i.fillStyle="#14161c",i.fillRect(0,0,1024,512);let n=Ao(23),r=8,o=512/r,a=["#c8641c","#2a62c4","#9aa3ad","#1c1c1c","#8a2a2a","#b89a3a","#2a6a3a","#3a3f4a","#c8641c","#2a62c4","#30343c","#5a6070","#20232a"],l=["#c9a185","#b08060","#8a5a3c","#5a3a26","#d2b096"];for(let u=0;u<r;u++){let d=u*o;i.fillStyle=u%2?"#20232b":"#1a1d24",i.fillRect(0,d+o*.62,1024,o*.38),i.fillStyle="#2b3140",i.fillRect(0,d+o*.6,1024,3);for(let f=4;f<1020;f+=15+n()*4){if(n()<.12)continue;let m=a[Math.floor(n()*a.length)],v=l[Math.floor(n()*l.length)],p=d+o*(.32+n()*.08);i.fillStyle=m,i.fillRect(f-6,p,12,o*.36),i.fillStyle=v,i.beginPath(),i.arc(f,p-6,5.5,0,Math.PI*2),i.fill(),n()<.18&&(i.fillStyle=v,i.fillRect(f-9,p-18,3,16),i.fillRect(f+6,p-18,3,16)),n()<.06&&(i.fillStyle=n()<.5?"#ff7a1a":"#2f7bff",i.fillRect(f-10,p-26,20,10))}}let c=$s(1024,512),h=c.getContext("2d");return h.filter="blur(1.2px) saturate(0.8)",h.drawImage(e,0,0),rs(c,{repeat:!0})}function f0(s=1024){let t=s,e=s/2,i=(1+Math.sqrt(5))/2,n=[],r=(b,E,A,_)=>{let R=Math.hypot(b,E,A);n.push([b/R,E/R,A/R,_])};for(let b of[-1,1])for(let E of[-1,1])r(0,b,E*i,1),r(b,E*i,0,1),r(b*i,0,E,1);for(let b of[-1,1])for(let E of[-1,1])for(let A of[-1,1])r(b,E,A,0);for(let b of[-1,1])for(let E of[-1,1])r(0,b/i,E*i,0),r(b/i,E*i,0,0),r(b*i,0,E/i,0);let o=()=>{let b=$s(t,e);return[b,b.getContext("2d")]},[a,l]=o(),[c,h]=o(),[u,d]=o(),[f,m]=o(),v=l.createImageData(t,e),p=h.createImageData(t,e),g=d.createImageData(t,e),x=m.createImageData(t,e),M=Ao(5),y=new Float32Array(2048);for(let b=0;b<y.length;b++)y[b]=M();for(let b=0;b<e;b++){let E=(b+.5)/e,A=Math.sin(Math.PI*E),_=Math.cos(Math.PI*E);for(let R=0;R<t;R++){let P=(R+.5)/t,I=-Math.cos(2*Math.PI*P)*A,N=_,H=Math.sin(2*Math.PI*P)*A,L=-2,B=-2,q=0;for(let Et=0;Et<32;Et++){let Yt=n[Et],xe=I*Yt[0]+N*Yt[1]+H*Yt[2];xe>L?(B=L,L=xe,q=Et):xe>B&&(B=xe)}let Y=n[q][3],rt=L-B,Z=rt<.006?1:rt<.014?1-(rt-.006)/.008:0,tt=Math.acos(Math.min(1,L)),nt=y[(b>>4)%32*64+(R>>4)%64]*.08,Dt,Pt,ce;Y?(Dt=52,Pt=58,ce=66):(Dt=128,Pt=134,ce=140);let oe=rt<.03?.85:1,ae=(1-Z*.85)*oe*(1+nt),X=(b*t+R)*4;v.data[X]=Dt*ae,v.data[X+1]=Pt*ae,v.data[X+2]=ce*ae,v.data[X+3]=255;let Q=0;Y&&(tt<.07?Q=1:tt>.12&&tt<.15&&(Q=.9)),p.data[X]=60*Q,p.data[X+1]=170*Q,p.data[X+2]=255*Q,p.data[X+3]=255;let vt=Z>0?200:Y?95:120;g.data[X]=vt,g.data[X+1]=vt,g.data[X+2]=vt,g.data[X+3]=255;let Wt=255*(1-Z)*(rt<.03?.6+rt*13:1);x.data[X]=Wt,x.data[X+1]=Wt,x.data[X+2]=Wt,x.data[X+3]=255}}return l.putImageData(v,0,0),h.putImageData(p,0,0),d.putImageData(g,0,0),m.putImageData(x,0,0),{map:rs(a),emissiveMap:rs(c),roughnessMap:rs(u,{srgb:!1}),bumpMap:rs(f,{srgb:!1})}}function p0(){let s=$s(256,64),t=s.getContext("2d");t.fillStyle="#1b1b1d",t.fillRect(0,0,256,64),t.strokeStyle="#0a0a0b",t.lineWidth=6;for(let e=-64;e<320;e+=18)t.beginPath(),t.moveTo(e,0),t.lineTo(e+14,30),t.lineTo(e,64),t.stroke();return t.fillStyle="#0c0c0d",t.fillRect(0,30,256,4),rs(s,{repeat:!0})}var ml=new w;function _n(s,t,e,i,n,r){let o=2*Math.PI*n/4,a=Math.max(r-2*n,0),l=Math.PI/4;ml.copy(t),ml[i]=0,ml.normalize();let c=.5*o/(o+a),h=1-ml.angleTo(s)/l;return Math.sign(ml[e])===1?h*c:a/(o+a)+c+c*(1-h)}var Js=class s extends qe{constructor(t=1,e=1,i=1,n=2,r=.1){let o=n*2+1;if(r=Math.min(t/2,e/2,i/2,r),super(1,1,1,o,o,o),this.type="RoundedBoxGeometry",this.parameters={width:t,height:e,depth:i,segments:n,radius:r},o===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let l=new w,c=new w,h=new w(t,e,i).divideScalar(2).subScalar(r),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,m=u.length/6,v=new w,p=.5/o;for(let g=0,x=0;g<u.length;g+=3,x+=2)switch(l.fromArray(u,g),c.copy(l),c.x-=Math.sign(c.x)*p,c.y-=Math.sign(c.y)*p,c.z-=Math.sign(c.z)*p,c.normalize(),u[g+0]=h.x*Math.sign(l.x)+c.x*r,u[g+1]=h.y*Math.sign(l.y)+c.y*r,u[g+2]=h.z*Math.sign(l.z)+c.z*r,d[g+0]=c.x,d[g+1]=c.y,d[g+2]=c.z,Math.floor(g/m)){case 0:v.set(1,0,0),f[x+0]=_n(v,c,"z","y",r,i),f[x+1]=1-_n(v,c,"y","z",r,e);break;case 1:v.set(-1,0,0),f[x+0]=1-_n(v,c,"z","y",r,i),f[x+1]=1-_n(v,c,"y","z",r,e);break;case 2:v.set(0,1,0),f[x+0]=1-_n(v,c,"x","z",r,t),f[x+1]=_n(v,c,"z","x",r,i);break;case 3:v.set(0,-1,0),f[x+0]=1-_n(v,c,"x","z",r,t),f[x+1]=1-_n(v,c,"z","x",r,i);break;case 4:v.set(0,0,1),f[x+0]=1-_n(v,c,"x","y",r,t),f[x+1]=1-_n(v,c,"y","x",r,e);break;case 5:v.set(0,0,-1),f[x+0]=_n(v,c,"x","y",r,t),f[x+1]=1-_n(v,c,"y","x",r,e);break}}static fromJSON(t){return new s(t.width,t.height,t.depth,t.segments,t.radius)}};var Yh=class extends le{constructor(t=new ot,e=new w,i=new Pn,n=new w(1,1,1)){super();let r=[],o=[],a=[],l=new w,c=new ie().getNormalMatrix(t.matrixWorld),h=new Me;h.makeRotationFromEuler(i),h.setPosition(e);let u=new Me;u.copy(h).invert(),d(),this.setAttribute("position",new Kt(r,3)),this.setAttribute("uv",new Kt(a,2)),o.length>0&&this.setAttribute("normal",new Kt(o,3));function d(){let p=[],g=new w,x=new w,M=t.geometry,y=M.attributes.position,b=M.attributes.normal;if(M.index!==null){let E=M.index;for(let A=0;A<E.count;A++)g.fromBufferAttribute(y,E.getX(A)),b?(x.fromBufferAttribute(b,E.getX(A)),f(p,g,x)):f(p,g)}else{if(y===void 0)return;for(let E=0;E<y.count;E++)g.fromBufferAttribute(y,E),b?(x.fromBufferAttribute(b,E),f(p,g,x)):f(p,g)}p=m(p,l.set(1,0,0)),p=m(p,l.set(-1,0,0)),p=m(p,l.set(0,1,0)),p=m(p,l.set(0,-1,0)),p=m(p,l.set(0,0,1)),p=m(p,l.set(0,0,-1));for(let E=0;E<p.length;E++){let A=p[E];a.push(.5+A.position.x/n.x,.5+A.position.y/n.y),A.position.applyMatrix4(h),r.push(A.position.x,A.position.y,A.position.z),A.normal!==null&&o.push(A.normal.x,A.normal.y,A.normal.z)}}function f(p,g,x=null){g.applyMatrix4(t.matrixWorld),g.applyMatrix4(u),x?(x.applyNormalMatrix(c),p.push(new gl(g.clone(),x.clone()))):p.push(new gl(g.clone()))}function m(p,g){let x=[],M=.5*Math.abs(n.dot(g));for(let y=0;y<p.length;y+=3){let b=0,E,A,_,R,P=p[y+0].position.dot(g)-M,I=p[y+1].position.dot(g)-M,N=p[y+2].position.dot(g)-M,H=P>0,L=I>0,B=N>0;switch(b=(H?1:0)+(L?1:0)+(B?1:0),b){case 0:{x.push(p[y]),x.push(p[y+1]),x.push(p[y+2]);break}case 1:{if(H&&(E=p[y+1],A=p[y+2],_=v(p[y],E,g,M),R=v(p[y],A,g,M)),L){E=p[y],A=p[y+2],_=v(p[y+1],E,g,M),R=v(p[y+1],A,g,M),x.push(_),x.push(A.clone()),x.push(E.clone()),x.push(A.clone()),x.push(_.clone()),x.push(R);break}B&&(E=p[y],A=p[y+1],_=v(p[y+2],E,g,M),R=v(p[y+2],A,g,M)),x.push(E.clone()),x.push(A.clone()),x.push(_),x.push(R),x.push(_.clone()),x.push(A.clone());break}case 2:{H||(E=p[y].clone(),A=v(E,p[y+1],g,M),_=v(E,p[y+2],g,M),x.push(E),x.push(A),x.push(_)),L||(E=p[y+1].clone(),A=v(E,p[y+2],g,M),_=v(E,p[y],g,M),x.push(E),x.push(A),x.push(_)),B||(E=p[y+2].clone(),A=v(E,p[y],g,M),_=v(E,p[y+1],g,M),x.push(E),x.push(A),x.push(_));break}case 3:break}}return x}function v(p,g,x,M){let y=p.position.dot(x)-M,b=g.position.dot(x)-M,E=y/(y-b),A=new w(p.position.x+E*(g.position.x-p.position.x),p.position.y+E*(g.position.y-p.position.y),p.position.z+E*(g.position.z-p.position.z)),_=null;return p.normal!==null&&g.normal!==null&&(_=new w(p.normal.x+E*(g.normal.x-p.normal.x),p.normal.y+E*(g.normal.y-p.normal.y),p.normal.z+E*(g.normal.z-p.normal.z))),new gl(A,_)}}},gl=class{constructor(t,e=null){this.position=t,this.normal=e}clone(){let t=this.position.clone(),e=this.normal!==null?this.normal.clone():null;return new this.constructor(t,e)}};var Mn=[-46.2,-45.5,-44.4,-40,-34,-26,-18,-8,4,16,26,34,44,51,58,65,70,73,74.4],kb=[13,18.5,21,21.8,22.2,21.5,19.5,17.6,16.8,16.4,16.2,16,16.4,16.6,15.4,11.6,7.4,3.8,.8],Vb=[2,0,-1.5,-2.5,-3,-3,-3.2,-3.2,-3.2,-3.2,-3.2,-3.2,-3,-2.8,-2.4,-2,-1.6,-1.2,-.8],Gb=[8,11,12.5,13.5,14,13,11,9.5,8.8,8.6,8.6,9,9.8,10.2,9.4,7,4.4,1.8,0],Wb=[30,34.5,36.5,37.5,38,37,35,34,34,34.5,36.2,38.8,40.6,41,39.8,36,30.5,24,17],qb=[0,0,0,0,0,0,0,0,0,0,1,3.4,5,5.4,4.6,3.2,1.8,.6,0],Xb=[3.4,4,4.6,5,5.2,5.4,5.6,5.8,5.8,5.8,5.6,5,4.6,4.6,4.4,4,3.4,3,2.6],Yb=[3.4,4.5,5.5,6,6,6,6,6,6,6,6,6,5.5,5,4.8,4.4,4,3.4,3],br=[-22.5,-19,-14,-8,-1,6,11,16.5,21.5,25.5,28.5],Zb=[21,26.4,31.6,34.6,35.4,35.4,34.6,30.6,25.6,20.8,16.4],$b=[27.5,28.5,29.5,30,30,29.8,29.5,29,28,27,25.5];function Es(s,t){let e=s.length,i=[],n=new Array(e);for(let r=0;r<e-1;r++)i.push((t[r+1]-t[r])/(s[r+1]-s[r]));n[0]=i[0],n[e-1]=i[e-2];for(let r=1;r<e-1;r++)n[r]=i[r-1]*i[r]<=0?0:(i[r-1]+i[r])/2;for(let r=0;r<e-1;r++){if(i[r]===0){n[r]=0,n[r+1]=0;continue}let o=n[r]/i[r],a=n[r+1]/i[r],l=o*o+a*a;if(l>9){let c=3/Math.sqrt(l);n[r]=c*o*i[r],n[r+1]=c*a*i[r]}}return r=>{if(r<=s[0])return t[0];if(r>=s[e-1])return t[e-1];let o=0;for(;r>s[o+1];)o++;let a=s[o+1]-s[o],l=(r-s[o])/a,c=l*l,h=c*l;return(2*h-3*c+1)*t[o]+(h-2*c+l)*a*n[o]+(-2*h+3*c)*t[o+1]+(h-c)*a*n[o+1]}}var Mr={top:Es(Mn,kb),bot:Es(Mn,Vb),cy:Es(Mn,Gb),a:Es(Mn,Wb),dip:Es(Mn,qb),nt:Es(Mn,Xb),nb:Es(Mn,Yb)},m0={roof:Es(br,Zb),half:Es(br,$b)};function _f(s){return{z:s,top:Mr.top(s),bot:Mr.bot(s),cy:Mr.cy(s),a:Mr.a(s),dip:Mr.dip(s),nt:Mr.nt(s),nb:Mr.nb(s)}}function Un(s,t){let e=Math.max(0,Math.sin(t)),i=Math.cos(t),n,r;if(t<=Math.PI/2){let o=2/s.nt;n=s.a*Math.pow(e,o),r=s.cy+(s.top-s.cy)*Math.pow(Math.max(0,i),o);let a=n/s.a;r-=s.dip*Math.pow(Math.max(0,1-a*a*1.15),2)}else{let o=2/s.nb;n=s.a*Math.pow(e,o),r=s.cy-(s.cy-s.bot)*Math.pow(Math.max(0,-i),o)}return[n,r]}var Kh=s=>s<14?6.5:8,Mf=It.wheels.filter(s=>s.x>0).map(s=>{let t=Kh(s.r),e=Math.abs(s.x)+7;return{z:s.z,cy:-It.restHeight+s.r,R:s.r+(s.front?3.4:5.2),inner:e-t-2.2}});function Jb(s){for(let t of Mf){let e=s-t.z;if(Math.abs(e)<t.R)return{...t,y:t.cy+Math.sqrt(t.R*t.R-e*e)}}return null}function Ro(s,t,e,i,n=120){let r=[],o=[0];for(let h=0;h<=n;h++){let u=s(t+(e-t)*h/n);h>0&&o.push(o[h-1]+Math.hypot(u[0]-r[h-1][0],u[1]-r[h-1][1])),r.push(u)}let a=o[n],l=[],c=0;for(let h=0;h<=i;h++){let u=a*h/i;for(;c<n-1&&o[c+1]<u;)c++;let d=o[c+1]-o[c],f=d>1e-9?(u-o[c])/d:0;l.push([r[c][0]+(r[c+1][0]-r[c][0])*f,r[c][1]+(r[c+1][1]-r[c][1])*f])}return l}function Kb(s,t){let e=0,i=Math.PI;for(let n=0;n<40;n++){let r=(e+i)/2;Un(s,r)[1]>t?e=r:i=r}return(e+i)/2}function jb(s,t){let e=Math.PI/2,i=Math.PI;for(let n=0;n<40;n++){let r=(e+i)/2;Un(s,r)[0]>t?e=r:i=r}return(e+i)/2}function Qb(s){let t=s.ringA,e=s.ringB,i=s.ringC,n=t+e+i,r=n*2,o=[];for(let v=Mn[0];v<Mn[Mn.length-1];v+=s.step)o.push(v);o.push(Mn[Mn.length-1]);for(let v of Mf)for(let p of[-1,1])o.push(v.z+p*(v.R-.04),v.z+p*(v.R+.04));o.sort((v,p)=>v-p);let a=[],l=[];for(let v of o){let p=_f(v),g=Jb(v),x=g?g.y:Math.min(p.cy-1,-.5),M=Kb(p,x),y=Ro(R=>Un(p,R),0,M,t),b,E;if(g){let R=y[t][0],P=Math.min(g.inner,R-.5);b=Ro(q=>[R+(P-R)*q,g.y],0,1,e);let I=jb(p,P),N=Un(p,I)[1],H=Math.max(.01,g.y-N),L=(()=>{let q=0,Y=Un(p,I);for(let rt=1;rt<=30;rt++){let Z=Un(p,I+(Math.PI-I)*rt/30);q+=Math.hypot(Z[0]-Y[0],Z[1]-Y[1]),Y=Z}return q})(),B=H/(H+L);E=Ro(q=>q<B?[P,g.y-H*(q/B)]:Un(p,I+(Math.PI-I)*((q-B)/(1-B))),0,1,i,200)}else b=Ro(()=>y[t],0,1,e,2),E=Ro(R=>Un(p,R),M,Math.PI,i);let A=y.concat(b.slice(1),E.slice(1)),_=(R,P,I,N)=>R>t+(g?0:e)||N<-44.6?1:0;for(let R=0;R<=n;R++){let[P,I]=A[R];a.push(-P,I,v),l.push(_(R,P,I,v))}for(let R=n-1;R>=1;R--){let[P,I]=A[R];a.push(P,I,v),l.push(_(R,P,I,v))}}let c=o.length,h=[],u=[];for(let v=0;v<c-1;v++)for(let p=0;p<r;p++){let g=v*r+p,x=v*r+(p+1)%r,M=(v+1)*r+p,y=(v+1)*r+(p+1)%r,b=l[g]&&l[x]&&l[M]&&l[y]?1:0;h.push(g,x,M,x,y,M),u.push(b,b)}let d=v=>{let p=0;for(let g=0;g<r;g++)p+=a[(v*r+g)*3+1];return p/r},f=a.length/3;a.push(0,d(0),o[0]-.3),l.push(0);let m=a.length/3;a.push(0,d(c-1),o[c-1]+.3),l.push(0);for(let v=0;v<r;v++){let p=(v+1)%r;h.push(f,v,p),u.push(1),h.push(m,(c-1)*r+p,(c-1)*r+v),u.push(1)}return v0(a,h,u.map(v=>v?1:0),2)}function v0(s,t,e,i){let n=new le;n.setAttribute("position",new Kt(s,3));let r=[];for(let o=0;o<i;o++){let a=r.length;for(let l=0;l<e.length;l++)e[l]===o&&r.push(t[l*3],t[l*3+1],t[l*3+2]);n.addGroup(a,r.length-a,o)}return n.setIndex(r),n.computeVertexNormals(),n}function t1(s,t){let e=_f(s),i=0,n=Math.PI/2;for(let r=0;r<40;r++){let o=(i+n)/2;Un(e,o)[0]<t?i=o:n=o}return Un(e,(i+n)/2)[1]}function e1(s){let t=s.ringG,e=[];for(let f=br[0];f<br[br.length-1];f+=s.step)e.push(f);e.push(br[br.length-1]);let i=2*t+1,n=[],r=[],o=e.map(f=>{let m=m0.half(f),v=t1(f,m)-.7,p=Math.max(.25,m0.roof(f)-v),g=Ro(x=>{let M=Math.sin(x),y=Math.cos(x),b=v+p*Math.pow(Math.max(0,y),2/5),E=1-.2*Math.pow((b-v)/p,1.2);return[m*Math.pow(Math.max(0,M),2/5)*E,b]},0,Math.PI/2,t);return{z:f,h:p,pts:g}}),a=o.reduce((f,m)=>m.h>f.h?m:f),l=t;for(let f=0;f<t;f++){let m=a.pts;if(Math.abs(m[f+1][1]-m[f][1])>Math.abs(m[f+1][0]-m[f][0])){l=f;break}}let c=f=>f>=t-1?3:f>l+1?2:f>=l-1?1:0;for(let{z:f,pts:m}of o){for(let v=t;v>=0;v--)n.push(m[v][0],m[v][1],f),r.push(c(v));for(let v=1;v<=t;v++)n.push(-m[v][0],m[v][1],f),r.push(c(v))}let h=e.length,u=[];for(let f=0;f<h-1;f++)for(let m=0;m<i-1;m++){let v=f*i+m,p=f*i+m+1,g=(f+1)*i+m,x=(f+1)*i+m+1;u.push(v,p,g,p,x,g)}let d=[];for(let f=0;f<u.length/3;f+=2){let m=u[f*3],v=u[f*3+1],p=Math.max(r[m],r[v]),g=n[m*3+2],x;p===3?x=2:p===2?x=g>-3.2&&g<.8?2:1:p===1?x=0:x=g>11||g<-9?1:0,d.push(x,x)}return v0(n,u,d,3)}function Co(s,t){let e=document.createElement("canvas");return e.width=s,e.height=t,e}function Po(s,t=!0){let e=new ri(s);return t&&(e.colorSpace=ze),e.anisotropy=4,e}function i1(s,t,e,i,n,r){s.beginPath(),s.moveTo(t+r,e),s.arcTo(t+i,e,t+i,e+n,r),s.arcTo(t+i,e+n,t,e+n,r),s.arcTo(t,e+n,t,e,r),s.arcTo(t,e,t+i,e,r),s.closePath()}function n1(){let e=Co(256,112),i=Co(256,112),n=e.getContext("2d"),r=i.getContext("2d"),o=l=>{l.beginPath(),l.moveTo(8,70),l.bezierCurveTo(40,20,150,8,248,14),l.lineTo(240,52),l.bezierCurveTo(170,60,90,80,30,104),l.closePath()};o(n);let a=n.createLinearGradient(0,0,0,112);a.addColorStop(0,"#2a3038"),a.addColorStop(1,"#0b0d10"),n.fillStyle=a,n.fill(),n.save(),n.clip();for(let[l,c,h]of[[150,38,17],[196,32,14]]){let u=n.createRadialGradient(l-4,c-4,1,l,c,h);u.addColorStop(0,"#ffffff"),u.addColorStop(.35,"#c9d2dc"),u.addColorStop(1,"#3a414a"),n.fillStyle=u,n.beginPath(),n.arc(l,c,h,0,Math.PI*2),n.fill()}n.restore(),n.lineWidth=3,n.strokeStyle="#8b939c",o(n),n.stroke(),r.fillStyle="#000",r.fillRect(0,0,256,112),r.strokeStyle="#fff",r.lineWidth=7,r.lineCap="round",r.beginPath(),r.moveTo(36,80),r.bezierCurveTo(70,50,120,62,232,44),r.stroke();for(let[l,c,h]of[[150,38,7],[196,32,6]])r.fillStyle="#c8ccd0",r.beginPath(),r.arc(l,c,h,0,Math.PI*2),r.fill();return{map:Po(e),emissiveMap:Po(i)}}function s1(){let s=Co(64,64),t=s.getContext("2d"),e=t.createRadialGradient(32,32,2,32,32,31);return e.addColorStop(0,"#4a0a0c"),e.addColorStop(.45,"#c01822"),e.addColorStop(.62,"#ffffff"),e.addColorStop(.75,"#ff3a40"),e.addColorStop(1,"#5a0306"),t.fillStyle=e,t.fillRect(0,0,64,64),Po(s)}function r1(){let e=Co(512,320),i=e.getContext("2d");return i.clearRect(0,0,512,320),i.strokeStyle="rgba(0,0,0,0.9)",i.lineWidth=5,i.beginPath(),i.moveTo(470,40),i.lineTo(476,250),i.quadraticCurveTo(476,290,430,292),i.lineTo(80,292),i.quadraticCurveTo(40,290,38,250),i.lineTo(46,40),i.stroke(),i1(i,120,108,70,14,7),i.fillStyle="rgba(0,0,0,0.55)",i.fill(),i.strokeStyle="rgba(255,255,255,0.18)",i.lineWidth=2,i.beginPath(),i.moveTo(124,107),i.lineTo(186,107),i.stroke(),Po(e)}function o1(){let e=Co(256,128),i=e.getContext("2d");i.clearRect(0,0,256,128);for(let n of[22,140]){i.beginPath(),i.moveTo(n,100),i.lineTo(n+94,100),i.lineTo(n+80,30),i.lineTo(n+14,30),i.closePath(),i.fillStyle="#08090b",i.fill(),i.strokeStyle="rgba(255,255,255,0.12)",i.lineWidth=2,i.stroke();for(let r=40;r<96;r+=11)i.fillStyle="#25282d",i.fillRect(n+12+(100-r)*.2,r,70-(100-r)*.4,4)}return Po(e)}function a1(){let s=Co(64,64),t=s.getContext("2d");return t.beginPath(),t.arc(32,32,30,0,Math.PI*2),t.fillStyle="#c9ced6",t.fill(),t.beginPath(),t.arc(32,32,24,0,Math.PI*2),t.fillStyle="#121418",t.fill(),t.fillStyle="#e8ecf2",t.font="italic 900 26px Arial Black, Arial, sans-serif",t.textAlign="center",t.textBaseline="middle",t.fillText("RA",32,34),Po(s)}var Zh=new gi;function Ks(s,t,e,i,n=null,r=!1){Zh.position.copy(t),Zh.up.copy(n||new w(0,1,0)),Zh.lookAt(t.clone().add(e));let o=new Yh(s,t,Zh.rotation.clone(),i);if(r){let a=o.attributes.uv;for(let l=0;l<a.count;l++)a.setX(l,1-a.getX(l))}return o}function l1(s,t,e){let i=e.wheelSeg,n=s*.6,r=x=>x.rotateZ(-Math.PI/2),o=new Us([new j(s*.975,-t*.93),new j(s,-t*.72),new j(s,t*.72),new j(s*.975,t*.93)],i);r(o);let a=x=>{let M=[new j(s*.975,x*t*.93),new j(s*.93,x*t),new j(s*.84,x*t*1.02),new j(s*.75,x*t*.97),new j(n+.4,x*t*.9),new j(n,x*t*.84)];x<0&&M.reverse();let y=new Us(M,i);return r(y),y},l=new Oe(n-.2,n-.2,t*1.6,i,1,!0);l.rotateZ(Math.PI/2),l.translate(-t*.1,0,0);let c=new qi(n-.1,.42,6,i);c.rotateY(Math.PI/2),c.translate(t*.8,0,0);let h=[],u=6;for(let x=0;x<u;x++){let M=new qe(1.4,n-s*.2,2.6,1,4,1);M.translate(0,(n+s*.2)/2-.2,0);let y=M.attributes.position;for(let b=0;b<y.count;b++){let A=(y.getY(b)-s*.2)/(n-s*.2);y.setZ(b,y.getZ(b)*(1.25-.45*A)),y.setX(b,y.getX(b)+t*(.48+.3*A))}M.rotateX(x/u*Math.PI*2+.3),h.push(M)}let d=new Oe(s*.22,s*.24,1.6,20);d.rotateZ(Math.PI/2),d.translate(t*.5,0,0);let f=new In(s*.12,20);f.rotateY(Math.PI/2),f.translate(t*.5+.82,0,0);let m=[];for(let x=0;x<5;x++){let M=new Oe(.45,.45,.9,6);M.rotateZ(Math.PI/2);let y=x/5*Math.PI*2;M.translate(t*.5+.9,Math.cos(y)*s*.165,Math.sin(y)*s*.165),m.push(M)}let v=new Oe(s*.6,s*.6,1.2,i);v.rotateZ(Math.PI/2),v.translate(-t*.05,0,0);let p=new qi(s*.55,1.15,6,10,1);p.scale(1,1,1.9),p.rotateY(Math.PI/2),p.rotateX(Math.PI*.62),p.translate(t*.08,0,0);let g=x=>{let M=c1(x);for(let y of x)y.dispose();return M};return{tread:o,sideOut:a(1),sideIn:a(-1),barrel:l,lip:c,spokes:g(h.concat([d])),nuts:g(m),cap:f,disc:v,caliper:p}}function c1(s){let t=s.map(l=>l.index?l.toNonIndexed():l),e=0;for(let l of t)e+=l.attributes.position.count;let i=new Float32Array(e*3),n=new Float32Array(e*3),r=new Float32Array(e*2),o=0;for(let l of t)i.set(l.attributes.position.array,o*3),l.attributes.normal&&n.set(l.attributes.normal.array,o*3),l.attributes.uv&&r.set(l.attributes.uv.array,o*2),o+=l.attributes.position.count;let a=new le;return a.setAttribute("position",new ge(i,3)),a.setAttribute("normal",new ge(n,3)),a.setAttribute("uv",new ge(r,2)),a}var g0={high:{step:1.1,ringA:26,ringB:5,ringC:12,ringG:18,wheelSeg:40},medium:{step:1.6,ringA:20,ringB:4,ringC:9,ringG:14,wheelSeg:28},low:{step:2.6,ringA:14,ringB:3,ringC:6,ringG:9,wheelSeg:18}},$h={};function x0(s="high"){if($h[s])return $h[s];let t=g0[s]||g0.high,e=Qb(t),i=e1(t),n=new ot(e);n.updateMatrixWorld(!0),new ot(i).updateMatrixWorld(!0);let o=(h,u,d)=>new w(h,u,d),a={headR:Ks(n,o(-23,7,69),o(-.45,.55,.7).normalize(),o(13,6,10)),headL:Ks(n,o(23,7,69),o(.45,.55,.7).normalize(),o(13,6,10)),doorR:Ks(n,o(-34.5,7,8),o(-1,0,0),o(40,21,9)),doorL:Ks(n,o(34.5,7,8),o(1,0,0),o(40,21,9)),numR:Ks(n,o(-34.5,7.5,5),o(-1,0,0),o(19,11.5,9)),numL:Ks(n,o(34.5,7.5,5),o(1,0,0),o(19,11.5,9)),hoodVents:Ks(n,o(0,11.5,50),o(0,1,.25).normalize(),o(24,13,8),o(0,0,1)),badge:Ks(n,o(0,4,72.6),o(0,.6,.8).normalize(),o(4.5,4.5,6))},l={};for(let h of It.wheels)l[h.r]||(l[h.r]=l1(h.r,Kh(h.r),t));let c=[e,i,...Object.values(a)];for(let h of Object.values(l))c.push(...Object.values(h));for(let h of c)h.userData.shared=!0;return $h[s]={body:e,greenhouse:i,decals:a,wheels:l,arches:Mf},$h[s]}var Jh=null;function y0(){return Jh||(Jh={head:n1(),lamp:s1(),panel:r1(),vents:o1(),badge:a1()},Jh)}function Sr(s,t,e){let i=_f(s),[n,r]=Un(i,e);return new w(t*n,r,s)}var vl=null;function _0(){if(vl)return vl;let s=p0();s.repeat.set(7,1);let t=y0(),e={transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4};vl={tireMat:new Zt({color:2302757,map:s,roughness:.92,metalness:0}),sidewallMat:new Zt({color:1644827,roughness:.75,metalness:0}),rimMat:new Zt({color:2369066,roughness:.32,metalness:.9}),lipMat:new Zt({color:9278363,roughness:.22,metalness:1}),barrelMat:new Zt({color:1316120,roughness:.5,metalness:.8,side:re}),discMat:new Zt({color:7040627,roughness:.42,metalness:.9}),darkMat:new Zt({color:1118741,roughness:.55,metalness:.3}),frameMat:new Zt({color:2764083,roughness:.42,metalness:.75}),trimMat:new Zt({color:460810,roughness:.18,metalness:.4}),glassMat:new ur({color:395533,roughness:.04,metalness:.1,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.6}),chromeMat:new Zt({color:14673130,roughness:.1,metalness:1}),engineMat:new ur({color:11538970,roughness:.3,metalness:.35,clearcoat:1,clearcoatRoughness:.08}),tailLampMat:new Zt({color:3145732,emissive:16718372,emissiveMap:t.lamp,emissiveIntensity:3.4,roughness:.2}),headMat:new Zt({...e,map:t.head.map,emissiveMap:t.head.emissiveMap,emissive:16054527,emissiveIntensity:2.4,roughness:.08,metalness:.4}),panelMat:new ve({...e,map:t.panel}),ventMat:new Zt({...e,map:t.vents,roughness:.5,metalness:.3}),badgeMat:new Zt({...e,map:t.badge,roughness:.2,metalness:.7}),spikeMat:new Zt({color:2830134,roughness:.3,metalness:.9,emissive:5246984,emissiveIntensity:.6}),caliperMats:[new Zt({color:16761370,roughness:.35,metalness:.25}),new Zt({color:14163486,roughness:.35,metalness:.25})],geo:{}};let i=vl.geo;i.engine=new Js(38,13,20,3,2.4),i.blower=new Js(22,13,17,3,2.4),i.blowerTop=new Js(18,1.8,13,2,.8),i.stack=new Us([new j(2.6,0),new j(2.6,5),new j(3.2,7.4),new j(4.2,8.6)],18),i.pulley=new Oe(3,3,2,18),i.pulley.rotateZ(Math.PI/2),i.belt=new Js(2.2,11,16,2,1),i.bar=new Oe(1.1,1.1,1,10),i.bar.rotateZ(Math.PI/2),i.post=new Oe(1.1,1.1,1,10),i.shaft=new Oe(1.5,1.5,1,10),i.shaft.rotateZ(Math.PI/2),i.lampHousing=new Oe(3.9,3.9,2.4,22),i.lampHousing.rotateX(Math.PI/2),i.lamp=new In(3.2,22),i.lamp.rotateY(Math.PI),i.undertray=new Js(52,3,9,2,1.2),i.wing=h1(),i.endplate=u1(),i.strut=d1(),i.pipe=new Oe(4.6,4.2,6,22,1,!0),i.pipe.rotateX(Math.PI/2),i.pipeInner=new In(3.9,22),i.pipeInner.rotateY(Math.PI),i.pipeRim=new qi(4.5,.6,8,22);for(let n in i)i[n].userData.shared=!0;return vl}function h1(){let s=new Ln;s.moveTo(9,0),s.bezierCurveTo(5,2,-4,2.8,-9,1.6),s.lineTo(-9.2,.6),s.bezierCurveTo(-4,.9,4,.2,9,-.4),s.closePath();let t=new cr(s,{depth:74,bevelEnabled:!0,bevelThickness:.5,bevelSize:.4,bevelSegments:2,curveSegments:10});return t.translate(0,0,-37),t.rotateY(Math.PI/2),t}function u1(){let s=new Ln;s.moveTo(10,-5),s.lineTo(-11,-3),s.lineTo(-13,8),s.lineTo(4,5),s.closePath();let t=new cr(s,{depth:1,bevelEnabled:!0,bevelThickness:.2,bevelSize:.2,bevelSegments:1});return t.translate(0,0,-.5),t.rotateY(-Math.PI/2),t}function d1(){let s=new Ln;s.moveTo(4,0),s.lineTo(-3,0),s.lineTo(-11,21),s.lineTo(-5,21),s.closePath();let t=new cr(s,{depth:1.6,bevelEnabled:!0,bevelThickness:.3,bevelSize:.3,bevelSegments:1});return t.translate(0,0,-.8),t.rotateY(-Math.PI/2),t}function f1(s,t){let e=document.createElement("canvas");e.width=256,e.height=160;let i=e.getContext("2d");i.font="italic 900 132px Arial Black, Arial, sans-serif",i.textAlign="center",i.textBaseline="middle",i.lineJoin="round",i.lineWidth=18,i.strokeStyle="#101216",i.strokeText(String(s),128,84),i.fillStyle="#f4f6fa",i.fillText(String(s),128,84),i.lineWidth=4,i.strokeStyle=t,i.strokeText(String(s),128,84);let n=new ri(e);return n.colorSpace=ze,n}var jh=class{constructor(t,e=0,i="high"){let n=_0(),r=x0(i),o=Ie[t];this.team=t,this.root=new _e,this.body=new _e,this.body.scale.setScalar(.01),this.root.add(this.body);let a=new ur({color:o.main,metalness:.4,roughness:.32,clearcoat:1,clearcoatRoughness:.035,envMapIntensity:1.2});this.paint=a;let l=(M,y,b=0,E=0,A=0,_=this.body,R=!0)=>{let P=new ot(M,y);return P.position.set(b,E,A),P.castShadow=R,P.receiveShadow=R,_.add(P),P};l(r.body,[a,n.darkMat]),l(r.greenhouse,[a,n.glassMat,n.trimMat]);let c=r.decals;for(let M of["headR","headL"])l(c[M],n.headMat,0,0,0,this.body,!1);for(let M of["doorR","doorL"])l(c[M],n.panelMat,0,0,0,this.body,!1);if(l(c.hoodVents,n.ventMat,0,0,0,this.body,!1),l(c.badge,n.badgeMat,0,0,0,this.body,!1),e){let M=new Zt({map:f1(e,o.css),transparent:!0,depthWrite:!1,roughness:.3,metalness:.2,polygonOffset:!0,polygonOffsetFactor:-5,polygonOffsetUnits:-5});for(let y of["numR","numL"])l(c[y],M,0,0,0,this.body,!1)}l(n.geo.engine,n.frameMat,0,25.5,-36.5),l(n.geo.blower,n.engineMat,0,38,-33.5),l(n.geo.blowerTop,n.chromeMat,0,45.2,-33.5,this.body,!1);for(let M of[-1,1])l(n.geo.stack,n.chromeMat,M*5.2,45.8,-31);l(n.geo.belt,n.darkMat,12.5,33,-28.5),l(n.geo.pulley,n.chromeMat,12.8,37,-23.5);let h=(M,y,b,E,A=n.frameMat)=>{let _=l(n.geo.bar,A,y,b,E);return _.scale.x=M,_},u=(M,y,b,E)=>{let A=l(n.geo.post,n.frameMat,y,b,E);return A.scale.y=M,A};h(66,0,17.5,-46.2),h(62,0,2.5,-46.4);for(let M of[-1,1]){u(15,M*33.5,10,-46.3),u(12,M*14,8.6,-46.3);for(let y of[33.5,24.5])l(n.geo.lampHousing,n.trimMat,M*(y-4.4),10.8,-46.6),l(n.geo.lamp,n.tailLampMat,M*(y-4.4),10.8,-47.85,this.body,!1)}l(n.geo.undertray,n.frameMat,0,-3.5,-42);for(let M of It.wheels){let y=Math.sign(M.x),b=13,E=Math.abs(M.x)+7-Kh(M.r)*.4,A=l(n.geo.shaft,n.frameMat,y*(b+E)/2,-It.restHeight+M.r,M.z,this.body,!1);A.scale.x=E-b}let d=l(n.geo.wing,a,0,51,-52);d.rotation.x=.42,d.scale.set(1.12,1.1,1.25);for(let M of[-1,1]){l(n.geo.strut,n.frameMat,M*14,21,-33).scale.set(1,1.42,1.35);let b=l(n.geo.endplate,a,M*41.8,51.5,-52);b.rotation.x=.3,b.scale.set(1,1.2,1.25)}l(n.geo.pipe,n.chromeMat,0,6.5,-46.5),l(n.geo.pipeRim,n.chromeMat,0,6.5,-49.5,this.body,!1),l(n.geo.pipeInner,n.darkMat,0,6.5,-48.6,this.body,!1),this.wheels=[];let f=n.caliperMats[t];for(let M of It.wheels){let y=Math.sign(M.x),b=r.wheels[M.r],E=new _e;E.position.set(y*(Math.abs(M.x)+7),-It.restHeight+M.r,M.z);let A=new _e;E.add(A);let _=new _e;y<0&&(_.rotation.y=Math.PI),A.add(_),l(b.tread,n.tireMat,0,0,0,_),l(b.sideOut,n.sidewallMat,0,0,0,_),l(b.sideIn,n.sidewallMat,0,0,0,_),l(b.barrel,n.barrelMat,0,0,0,_,!1),l(b.lip,n.lipMat,0,0,0,_,!1),l(b.spokes,n.rimMat,0,0,0,_),l(b.nuts,n.chromeMat,0,0,0,_,!1),l(b.cap,n.badgeMat,0,0,0,_,!1),l(b.disc,n.discMat,0,0,0,_,!1);let R=new _e;y<0&&(R.rotation.y=Math.PI),l(b.caliper,f,0,0,0,R,!1),E.add(R),this.body.add(E),this.wheels.push({pivot:E,spin:A,front:M.front,r:M.r,baseY:E.position.y})}let m=new St(...o.flame),v=new ys(7,46,16,1,!0);v.translate(0,-23,0),v.rotateX(-Math.PI/2),this.flame=new ot(v,new ve({color:m.clone().multiplyScalar(1.4),transparent:!0,opacity:.75,blending:Ee,depthWrite:!1,fog:!1})),this.flame.position.set(0,6.5,-49);let p=new ys(3.6,26,12,1,!0);p.translate(0,-13,0),p.rotateX(-Math.PI/2),this.flameCore=new ot(p,new ve({color:new St(2.2,2.2,2.2),transparent:!0,opacity:.9,blending:Ee,depthWrite:!1,fog:!1})),this.flame.add(this.flameCore),this.body.add(this.flame),this.flame.visible=!1,this.exhaustGlow=new _e;let g=new ve({color:m.clone().multiplyScalar(1.5),transparent:!0,opacity:.6,blending:Ee,depthWrite:!1});this.exhaustGlow.material=g;let x=new ot(n.geo.pipeInner,g);x.position.set(0,6.5,-48.4),this.exhaustGlow.add(x),this.body.add(this.exhaustGlow),this.flicker=0,this.spikes=null,this.powerOn=!1}setSpikes(t){if(t&&!this.spikes){let e=_0();this.spikes=new _e;let i=new ys(3.2,13,6),n=[new w(0,35.6,2),new w(13,34.2,-6),new w(-13,34.2,-6),new w(13,34.2,9),new w(-13,34.2,9),new w(0,15.5,52),Sr(51,1,.42),Sr(51,-1,.42),new w(0,3,74.5),Sr(8,1,.55),Sr(8,-1,.55),Sr(-34,1,.3),Sr(-34,-1,.3),new w(0,41,-36),new w(0,18,-47)];for(let r of n){let o=new ot(i,e.spikeMat);o.position.copy(r);let a=new w(r.x,r.y+10,(r.z-10)*.6).normalize();o.quaternion.setFromUnitVectors(new w(0,1,0),a),this.spikes.add(o)}this.body.add(this.spikes)}this.spikes&&(this.spikes.visible=t)}setPower(t,e){t?(this.paint.emissive.setRGB(1,.08,.02),this.paint.emissiveIntensity=.5+Math.sin(e*14)*.25):this.powerOn&&(this.paint.emissive.setRGB(0,0,0),this.paint.emissiveIntensity=1),this.powerOn=t}update(t,e,i,n){if(this.root.visible=!t.demolished,t.demolished)return;this.root.position.set(e.x*.01,e.y*.01,e.z*.01),this.root.quaternion.copy(i);for(let o of this.wheels)o.spin.rotation.x=t.wheelSpin*(12.5/o.r),o.front&&(o.pivot.rotation.y=-t.steerVisual*.42);for(let o=0;o<4;o++){let a=this.wheels[o],l=t.wheelDist[o],c=l>=0?a.baseY+(It.restHeight-l)*.6:a.baseY-4;a.pivot.position.y+=(Math.max(a.baseY-6,Math.min(a.baseY+6,c))-a.pivot.position.y)*Math.min(1,n*20)}this.flicker+=n*40;let r=t.boosting;if(this.flame.visible=r,r){let o=.85+Math.sin(this.flicker)*.12+Math.random()*.15;this.flame.scale.set(o,o,o*(t.supersonic?1.35:1))}this.exhaustGlow.material.opacity=r?1:.45}};var Qh=class{constructor(t,e){this.max=t,this.count=0,this.p=new Float32Array(t*3),this.v=new Float32Array(t*3),this.life=new Float32Array(t),this.maxLife=new Float32Array(t),this.size=new Float32Array(t*2),this.c0=new Float32Array(t*4),this.c1=new Float32Array(t*4),this.phys=new Float32Array(t*4);let i=new Wa,n=new oi(1,1);i.index=n.index,i.setAttribute("position",n.attributes.position),i.setAttribute("uv",n.attributes.uv),this.aPos=new Kn(new Float32Array(t*3),3).setUsage(Ki),this.aCol=new Kn(new Float32Array(t*4),4).setUsage(Ki),this.aSR=new Kn(new Float32Array(t*2),2).setUsage(Ki),i.setAttribute("iPos",this.aPos),i.setAttribute("iCol",this.aCol),i.setAttribute("iSR",this.aSR),i.instanceCount=0,this.geo=i;let r=new fe({transparent:!0,depthWrite:!1,blending:e?Ee:mn,uniforms:{},vertexShader:`
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
        }`});this.mesh=new ot(i,r),this.mesh.frustumCulled=!1,this.mesh.renderOrder=e?5:4}emit(t,e,i,n,r,o,a,l,c,h,u,d=0,f=0,m=0){let v;this.count<this.max?v=this.count++:v=Math.floor(Math.random()*this.max),this.p[v*3]=t,this.p[v*3+1]=e,this.p[v*3+2]=i,this.v[v*3]=n,this.v[v*3+1]=r,this.v[v*3+2]=o,this.life[v]=a,this.maxLife[v]=a,this.size[v*2]=l,this.size[v*2+1]=c,this.c0.set(h,v*4),this.c1.set(u,v*4),this.phys[v*4]=d,this.phys[v*4+1]=f,this.phys[v*4+2]=Math.random()*6.28,this.phys[v*4+3]=m}update(t){let{p:e,v:i,life:n,maxLife:r,size:o,c0:a,c1:l,phys:c}=this,h=this.aPos.array,u=this.aCol.array,d=this.aSR.array,f=this.count;for(let m=0;m<f;m++){if(n[m]-=t,n[m]<=0){f--,m!==f&&(e.copyWithin(m*3,f*3,f*3+3),i.copyWithin(m*3,f*3,f*3+3),n[m]=n[f],r[m]=r[f],o.copyWithin(m*2,f*2,f*2+2),a.copyWithin(m*4,f*4,f*4+4),l.copyWithin(m*4,f*4,f*4+4),c.copyWithin(m*4,f*4,f*4+4),m--);continue}let v=Math.max(0,1-c[m*4]*t);i[m*3]*=v,i[m*3+1]=i[m*3+1]*v-c[m*4+1]*t,i[m*3+2]*=v,e[m*3]+=i[m*3]*t,e[m*3+1]+=i[m*3+1]*t,e[m*3+2]+=i[m*3+2]*t,c[m*4+2]+=c[m*4+3]*t}this.count=f;for(let m=0;m<f;m++){let v=1-n[m]/r[m];h[m*3]=e[m*3],h[m*3+1]=e[m*3+1],h[m*3+2]=e[m*3+2];for(let p=0;p<4;p++)u[m*4+p]=a[m*4+p]+(l[m*4+p]-a[m*4+p])*v;d[m*2]=o[m*2]+(o[m*2+1]-o[m*2])*v,d[m*2+1]=c[m*4+2]}this.geo.instanceCount=f,f>0&&(this.aPos.clearUpdateRanges(),this.aPos.addUpdateRange(0,f*3),this.aPos.needsUpdate=!0,this.aCol.clearUpdateRanges(),this.aCol.addUpdateRange(0,f*4),this.aCol.needsUpdate=!0,this.aSR.clearUpdateRanges(),this.aSR.addUpdateRange(0,f*2),this.aSR.needsUpdate=!0)}clear(){this.count=0,this.geo.instanceCount=0}},Ne=new w,ni=new w,bf=new w,Io=new w,Ge=new w,lt=(s,t)=>s+Math.random()*(t-s),tu=class{constructor(t,e){this.scene=t,this.mult=e==="low"?.45:e==="medium"?.75:1,this.glow=new Qh(e==="low"?1500:4e3,!0),this.smoke=new Qh(e==="low"?600:1800,!1),t.add(this.glow.mesh,this.smoke.mesh),this.flashes=[],this.sphereGeo=new vi(1,32,16),this.ringGeo=new qi(1,.06,8,64)}clear(){this.glow.clear(),this.smoke.clear();for(let t of this.flashes)this.scene.remove(t.mesh);this.flashes.length=0}carTrail(t,e,i,n){if(t.demolished)return;let r=Ie[t.team];if(ni.set(0,0,1).applyQuaternion(i),bf.set(0,1,0).applyQuaternion(i),Io.set(1,0,0).applyQuaternion(i),t.boosting){Ge.copy(e).addScaledVector(ni,-51).addScaledVector(bf,6.5).multiplyScalar(.01);let o=Ne.copy(t.vel).multiplyScalar(.01),a=Math.max(1,Math.round(n*150*this.mult)),l=r.flame,c=r.flameEnd;for(let h=0;h<a;h++){let u=lt(7,12),d=Math.random()*n;this.glow.emit(Ge.x-ni.x*u*d+lt(-.03,.03),Ge.y-ni.y*u*d+lt(-.03,.03),Ge.z-ni.z*u*d+lt(-.03,.03),o.x*.2-ni.x*u+lt(-.5,.5),o.y*.2-ni.y*u+lt(-.5,.5),o.z*.2-ni.z*u+lt(-.5,.5),lt(.1,.2),lt(.12,.2),lt(.3,.55),[l[0]*1.1,l[1]*1.1,l[2]*1.1,.55],[c[0],c[1],c[2],0],2,0)}if(Math.random()<n*40*this.mult){let h=[c[0]*.9+.1,c[1]*.9+.1,c[2]*.9+.1];this.smoke.emit(Ge.x-ni.x*.4,Ge.y-ni.y*.4,Ge.z-ni.z*.4,o.x*.25-ni.x*2+lt(-.4,.4),o.y*.25+lt(0,.6),o.z*.25-ni.z*2+lt(-.4,.4),lt(.7,1.1),.35,lt(1.4,2.2),[h[0],h[1],h[2],.22],[.25,.25,.28,0],1.2,-.3,lt(-1,1))}}if(t.boosting&&Math.random()<n*60*this.mult){let o=r.flame,a=Ne.copy(t.vel).multiplyScalar(.01*.3);for(let l=0;l<2;l++)this.glow.emit(Ge.x,Ge.y,Ge.z,a.x-ni.x*lt(4,9)+lt(-2.5,2.5),a.y+lt(-1,3),a.z-ni.z*lt(4,9)+lt(-2.5,2.5),lt(.25,.55),lt(.05,.09),.02,[o[0]*3,o[1]*3,o[2]*3,1],[o[0],o[1]*.6,o[2]*.4,0],1.5,7)}if(t.supersonic)for(let o of[-1,1])Math.random()>.8*this.mult||(Ge.copy(e).addScaledVector(Io,o*30).addScaledVector(ni,-36).addScaledVector(bf,5).multiplyScalar(.01),this.glow.emit(Ge.x,Ge.y,Ge.z,0,0,0,.28,.12,.04,[1.6,1.7,1.8,.8],[.8,.9,1,0],0,0))}dirt(t,e,i,n,r){if(n<=0)return;ni.set(0,0,1).applyQuaternion(i),Io.set(1,0,0).applyQuaternion(i);let o=Math.round(r*70*n*this.mult+Math.random());for(let a=0;a<o;a++){let l=a%2?1:-1;Ge.copy(e).addScaledVector(Io,l*34).addScaledVector(ni,-36).multiplyScalar(.01);let c=lt(2,6),u=Math.random()<.45?[.12,.22,.06,1]:[.16,.11,.06,1];this.smoke.emit(Ge.x,.12,Ge.z,t.vel.x*.01*.2-ni.x*c+Io.x*l*lt(0,2),lt(2.5,5.5),t.vel.z*.01*.2-ni.z*c+Io.z*l*lt(0,2),lt(.5,.9),lt(.05,.11),lt(.04,.08),u,[u[0],u[1],u[2],.7],.3,13,lt(-10,10))}Math.random()<r*10*n*this.mult&&(Ge.copy(e).addScaledVector(ni,-40).multiplyScalar(.01),this.smoke.emit(Ge.x,.15,Ge.z,-ni.x*1.5,lt(.3,.9),-ni.z*1.5,lt(.7,1.2),.3,lt(1,1.6),[.36,.33,.25,.3],[.3,.28,.24,0],1,-.2,lt(-1,1)))}pyro(t,e,i){let n=Ie[e];for(let r of t){let o=Math.round(i*110*this.mult);for(let a=0;a<o;a++){let l=Math.random()<.5;this.glow.emit(r.x*.01+lt(-.3,.3),r.y*.01,r.z*.01+lt(-.3,.3),lt(-.8,.8),lt(14,22),lt(-.8,.8),lt(.35,.7),lt(.5,.9),lt(1.1,1.9),l?[2.1,1,.25,.85]:[n.flame[0]*1.6,n.flame[1]*1.1,n.flame[2]*.9,.8],[.9,.18,.03,0],1.2,2)}}}ballTrail(t,e){let i=t.vel.length();i<2600||Math.random()>(i-2600)/2e3*this.mult||(Ge.copy(e).multiplyScalar(.01),this.glow.emit(Ge.x+lt(-.3,.3),Ge.y+lt(-.3,.3),Ge.z+lt(-.3,.3),0,0,0,.35,1,.2,[.6,.85,1.4,.35],[.2,.4,1,0],0,0))}hit(t,e){let i=Ge.copy(t).multiplyScalar(.01),n=Math.round(Math.min(40,e/60)*this.mult);for(let r=0;r<n;r++){let o=lt(3,9)*Math.min(2,e/1500);Ne.set(lt(-1,1),lt(-.2,1),lt(-1,1)).normalize().multiplyScalar(o),this.glow.emit(i.x,i.y,i.z,Ne.x,Ne.y,Ne.z,lt(.15,.35),lt(.06,.12),.02,[3,2.6,1.8,1],[2,.8,.2,0],2,6)}e>1800&&this.flash(i,12575743,1.6,.18,2.5)}boostPickup(t){let e=Math.round((t.big?40:12)*this.mult);for(let i=0;i<e;i++)this.glow.emit(t.x*.01+lt(-.6,.6),lt(.1,.4),t.z*.01+lt(-.6,.6),lt(-1,1),lt(2,6),lt(-1,1),lt(.3,.6),lt(.1,.25),.02,[3,1.8,.4,1],[2,.6,.05,0],1,2)}flash(t,e,i,n,r=3){let o=new ve({color:new St(e).multiplyScalar(r),transparent:!0,blending:Ee,depthWrite:!1,fog:!1}),a=new ot(this.sphereGeo,o);a.position.copy(t),a.scale.setScalar(.01),this.scene.add(a),this.flashes.push({mesh:a,t:0,dur:n,size:i,kind:"sphere"})}ring(t,e,i,n){let r=new ve({color:new St(e).multiplyScalar(4),transparent:!0,blending:Ee,depthWrite:!1,fog:!1}),o=new ot(this.ringGeo,r);o.position.copy(t),o.rotation.x=Math.PI/2,this.scene.add(o),this.flashes.push({mesh:o,t:0,dur:n,size:i,kind:"ring"})}explosion(t,e,i){let n=Ie[e],r=Ge.copy(t).multiplyScalar(.01).clone(),o=n.flame,a=n.flameEnd,l=Math.round((i?420:140)*this.mult),c=i?28:12;for(let u=0;u<l;u++)Ne.set(lt(-1,1),lt(-.3,1),lt(-1,1)).normalize().multiplyScalar(lt(.2,1)*c),this.glow.emit(r.x,r.y,r.z,Ne.x,Ne.y,Ne.z,lt(.5,i?1.6:.9),lt(.3,.8),lt(.1,.4),[o[0]*3,o[1]*3,o[2]*3,1],[a[0]*2,a[1]*2,a[2]*2,0],2.2,i?3:4);let h=Math.round((i?90:40)*this.mult);for(let u=0;u<h;u++)Ne.set(lt(-1,1),lt(0,1),lt(-1,1)).normalize().multiplyScalar(lt(1,i?10:5)),this.smoke.emit(r.x,r.y,r.z,Ne.x,Ne.y,Ne.z,lt(1.2,2.4),lt(.8,1.4),lt(2.5,i?6:3.5),[.3,.3,.33,.55],[.12,.12,.14,0],1.6,-.6,lt(-1,1));this.flash(r,n.main,i?9:3,i?.55:.3,4),this.ring(r,n.light,i?26:8,i?.9:.5)}demolition(t,e){let i=Ie[e],n=Ge.copy(t).multiplyScalar(.01).clone();n.y+=.3;let r=Math.round(170*this.mult);for(let c=0;c<r;c++){Ne.set(lt(-1,1),lt(-.2,1),lt(-1,1)).normalize().multiplyScalar(lt(2,11));let h=Math.random()<.35;this.glow.emit(n.x,n.y,n.z,Ne.x,Ne.y,Ne.z,lt(.3,.8),lt(.3,.7),lt(.1,.35),h?[1.8,1.3,.7,.7]:[1.6,.6,.12,.7],[.8,.15,.02,0],2.5,-1.5)}let o=Math.round(60*this.mult);for(let c=0;c<o;c++)Ne.set(lt(-1,1),lt(0,1.2),lt(-1,1)).normalize().multiplyScalar(lt(6,16)),this.glow.emit(n.x,n.y,n.z,Ne.x,Ne.y,Ne.z,lt(.4,.8),lt(.08,.16),.03,[i.flame[0]*3,i.flame[1]*3,i.flame[2]*3,1],[i.flameEnd[0],i.flameEnd[1],i.flameEnd[2],0],1,9);let a=Math.round(40*this.mult);for(let c=0;c<a;c++)Ne.set(lt(-1,1),lt(.4,1.4),lt(-1,1)).normalize().multiplyScalar(lt(5,13)),this.smoke.emit(n.x,n.y,n.z,Ne.x,Ne.y,Ne.z,lt(.8,1.5),lt(.12,.25),lt(.08,.15),[.05,.05,.06,1],[.05,.05,.06,.8],.4,14,lt(-12,12));let l=Math.round(70*this.mult);for(let c=0;c<l;c++)Ne.set(lt(-1,1),lt(.2,1),lt(-1,1)).normalize().multiplyScalar(lt(1,5)),this.smoke.emit(n.x,n.y,n.z,Ne.x,Ne.y,Ne.z,lt(1.6,3),lt(.8,1.4),lt(3,5.5),[.12,.1,.1,.75],[.05,.05,.06,0],1.3,-.8,lt(-1,1));this.flash(n,16747056,3,.25,2),this.ring(n,16756832,10,.55)}update(t){this.glow.update(t),this.smoke.update(t);for(let e=this.flashes.length-1;e>=0;e--){let i=this.flashes[e];i.t+=t;let n=i.t/i.dur;if(n>=1){this.scene.remove(i.mesh),i.mesh.material.dispose(),this.flashes.splice(e,1);continue}let r=1-Math.pow(1-n,3);i.mesh.scale.setScalar(Math.max(.01,i.size*r)),i.mesh.material.opacity=1-n}}};var p1=new w(0,1,0),Li=new w,cn=new w,Sf=new w,m1=new w,bn=new w,M0=new he,Lo=new w,b0=new he;function xl(s,t,e,i){return we.clamp(t.dot(e),-1,1)>.99999?s.copy(e):(M0.setFromUnitVectors(t,e),b0.identity().slerp(M0,i),s.copy(t).applyQuaternion(b0))}var Do=class{constructor(t){this.camera=t,this.dir=new w(0,0,1),this.camUp=new w(0,1,0),this.look=new w(0,0,1),this.pos=new w,this.ballCam=!0,this.shake=0,this.first=!0,this.distance=280,this.height=105,this.lookYaw=0}snap(){this.first=!0}addShake(t){this.shake=Math.min(1.5,this.shake+t)}update(t,e,i,n,r,o=0,a=0){let l=e.onGround&&e.groundNormal.y>-.2,c=l?e.groundNormal:p1;this.first?this.camUp.copy(c):xl(this.camUp,this.camUp,c,1-Math.exp(-t*(l?9:4)));let h=this.camUp;this.ballCam&&r?Li.copy(r).sub(i):(Li.set(0,0,1).applyQuaternion(n),!e.onGround&&e.vel.lengthSq()>500*500&&Li.lerp(cn.copy(e.vel).normalize(),.5)),Li.addScaledVector(c,-Li.dot(c)),Li.lengthSq()<1&&(Li.set(0,0,1).applyQuaternion(n),Li.addScaledVector(c,-Li.dot(c)),Li.lengthSq()<1e-4&&Li.copy(this.dir)),Li.normalize();let u=this.dir.dot(Li);this.first?this.dir.copy(Li):u<-.95?(cn.crossVectors(h,this.dir).normalize(),this.dir.addScaledVector(cn,.25).normalize()):xl(this.dir,this.dir,Li,this.ballCam?1-Math.exp(-t*7.5):1-Math.exp(-t*6)),cn.copy(this.dir).addScaledVector(h,-this.dir.dot(h)),cn.lengthSq()<.001&&cn.copy(Li).addScaledVector(h,-Li.dot(h)),cn.lengthSq()>1e-6&&this.dir.copy(cn).normalize(),this.lookYaw+=(o*Math.PI*.95-this.lookYaw)*Math.min(1,t*10);let d=m1.copy(this.dir);Math.abs(this.lookYaw)>.001&&d.applyAxisAngle(h,-this.lookYaw);let f=e.vel.length(),m=this.distance+Math.min(60,f*.02),v=cn.copy(i).addScaledVector(d,-m).addScaledVector(h,this.height+a*-60);this.first?this.pos.copy(v):this.pos.lerp(v,1-Math.exp(-t*14));for(let g=0;g<2;g++){let x=on(this.pos.x,this.pos.y,this.pos.z);x<40&&(bs(this.pos.x,this.pos.y,this.pos.z,Sf),this.pos.addScaledVector(Sf,40-x))}if(Lo.copy(i).addScaledVector(h,70).addScaledVector(d,260),bn.copy(Lo).sub(this.pos).normalize(),this.ballCam&&r&&Math.abs(this.lookYaw)<.3){let g=cn.copy(r).sub(this.pos).normalize();bn.copy(g);let x=Sf.copy(i).addScaledVector(h,10).sub(this.pos).normalize(),M=we.degToRad(this.camera.fov*.5)*.82,y=Math.acos(we.clamp(x.dot(bn),-1,1));y>M&&xl(bn,x,bn,M/y);let b=bn.dot(h);b<-.35&&bn.addScaledVector(h,-.35-b).normalize()}this.first?this.look.copy(bn):xl(this.look,this.look,bn,1-Math.exp(-t*12)),this.first=!1,this.shake=Math.max(0,this.shake-t*2.2);let p=this.shake*this.shake*14;this.camera.up.copy(h),this.camera.position.set((this.pos.x+(Math.random()-.5)*p)*.01,(this.pos.y+(Math.random()-.5)*p)*.01,(this.pos.z+(Math.random()-.5)*p)*.01),Lo.copy(this.pos).addScaledVector(this.look,1e3).multiplyScalar(.01),this.camera.lookAt(Lo)}updateReplay(t,e,i,n){let r=Math.sign(e.x||1);cn.set(r*2600+Math.sin(n*.3)*400,900,i*.55),this.first&&this.pos.copy(cn),this.pos.lerp(cn,1-Math.exp(-t*1.5)),bn.copy(e).sub(this.pos).normalize(),this.first?this.look.copy(bn):xl(this.look,this.look,bn,1-Math.exp(-t*6)),this.first=!1,this.camera.up.set(0,1,0),this.camera.position.copy(this.pos).multiplyScalar(.01),Lo.copy(this.pos).addScaledVector(this.look,1e3).multiplyScalar(.01),this.camera.lookAt(Lo)}};var g1=new w(0,1,0),yl=new w,No=new w,S0=new w,E0=new w,Hi=(s,t)=>s+Math.random()*(t-s);function v1(){let s=document.createElement("canvas");s.width=s.height=256;let t=s.getContext("2d");t.fillStyle="rgba(255,255,255,0.22)",t.fillRect(0,0,256,256);for(let i=0;i<80;i++){let n=Math.random()*256,r=6+Math.random()*26,o=t.createLinearGradient(n,0,n+r,0),a=.35+Math.random()*.6;o.addColorStop(0,"rgba(255,255,255,0)"),o.addColorStop(.5,`rgba(255,255,255,${a})`),o.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=o,t.save(),t.translate(n,128),t.transform(1,0,-.6,1,0,0),t.fillRect(-r/2,-160,r,320),t.restore()}let e=new ri(s);return e.wrapS=e.wrapT=Ji,e}var eu=class{constructor(t,e,i){this.group=t,this.effects=e,this.mode=i,this.time=0,this.cableGeo=new Oe(1,1,1,6,1,!0),this.cableGeo.translate(0,.5,0),this.cableMat=new ve({color:new St(1.4,1.5,1.7)}),this.clawGeo=new ys(.22,.5,8),this.clawMat=new Zt({color:13620960,metalness:1,roughness:.25,emissive:3820128}),this.cables=new Map,this.swirl=v1(),this.funnelGeos=[new Oe(9.5,1.4,21,40,1,!0),new Oe(7,1,19,40,1,!0),new Oe(4.5,.7,17,32,1,!0)].map(n=>(n.translate(0,n.parameters.height/2,0),n)),this.tornados=new Map,this.ice=new ot(new Ua(De.radius*.01*1.15,1),new Zt({color:13496063,emissive:4890584,emissiveIntensity:.6,roughness:.08,metalness:.1,transparent:!0,opacity:.55,flatShading:!0,depthWrite:!1})),this.ice.visible=!1,t.add(this.ice)}cableFor(t){let e=this.cables.get(t);if(!e){let i=new ot(this.cableGeo,this.cableMat),n=new ot(this.clawGeo,this.clawMat);i.frustumCulled=!1,this.group.add(i,n),e={cable:i,claw:n},this.cables.set(t,e)}return e}tornadoFor(t){let e=this.tornados.get(t);if(!e){let i=new _e,n=this.funnelGeos.map((r,o)=>{let a=this.swirl.clone();a.needsUpdate=!0,a.repeat.set(3+o,1);let l=new ot(r,new ve({map:a,color:o===2?15789284:13813942,transparent:!0,opacity:[.62,.7,.45][o],depthWrite:!1,side:re,blending:o===2?Ee:mn}));return l.renderOrder=6,i.add(l),{m:l,tex:a,speed:[2.2,-3.1,4.5][o]}});this.group.add(i),e={g:i,parts:n,grow:0},this.tornados.set(t,e)}return e}update(t,e,i,n){this.time+=t;let r=this.mode,o=r.world.ball,a=this.effects,l=-1;if(r.name==="heatseeker"&&r.team>=0&&(l=r.team),r.name==="rumble"&&r.curve&&(l=r.curve.team),l>=0&&i.visible){let d=Ie[l],f=Math.max(1,Math.round(t*90*a.mult));for(let m=0;m<f;m++)a.glow.emit(n.x*.01+Hi(-.4,.4),n.y*.01+Hi(-.4,.4),n.z*.01+Hi(-.4,.4),0,Hi(0,.5),0,Hi(.3,.55),Hi(.7,1.1),.15,[d.flame[0]*1.6,d.flame[1]*1.6,d.flame[2]*1.6,.6],[d.flameEnd[0],d.flameEnd[1],d.flameEnd[2],0],1.5,0);i.material.emissiveIntensity=3.2+Math.sin(this.time*12)*.6}else i.material.emissiveIntensity=2.4;let c=o.iceTimer>0;if(this.ice.visible=c&&i.visible,c&&(this.ice.position.copy(i.position),this.ice.rotation.y+=t*.4,Math.random()<t*20&&a.glow.emit(i.position.x+Hi(-1,1),i.position.y+Hi(-1,1),i.position.z+Hi(-1,1),0,-.3,0,.6,.12,.02,[1.6,2,2.4,.8],[.6,.9,1.4,0],0,0)),r.name!=="rumble")return;let h=new Set,u=new Set;for(let d of e){let f=d.car,v=r.st(f).active;if(d.model.setPower(!!v&&v.type==="power",this.time),d.model.setSpikes(!!v&&v.type==="spikes"),!(!v||f.demolished)){if((v.type==="grapple"||v.type==="plunger")&&d.ipos){let p=this.cableFor(f);h.add(f),S0.set(0,0,1).applyQuaternion(d.iquat),E0.set(0,1,0).applyQuaternion(d.iquat),yl.copy(d.ipos).addScaledVector(S0,55).addScaledVector(E0,28).multiplyScalar(.01);let g=v.phase==="pull"?n:v.hook;No.copy(g).multiplyScalar(.01),v.phase==="pull"&&No.addScaledVector(yl.clone().sub(No).normalize(),De.radius*.01*.9);let x=yl.distanceTo(No);p.cable.position.copy(yl),p.cable.quaternion.setFromUnitVectors(g1,No.clone().sub(yl).normalize()),p.cable.scale.set(.05,Math.max(.01,x),.05),p.claw.position.copy(No),p.claw.quaternion.copy(p.cable.quaternion),p.cable.visible=p.claw.visible=!0}if(v.type==="tornado"&&d.ipos){let p=this.tornadoFor(f);u.add(f);let g=Math.min(1,v.t/.5)*Math.min(1,(v.dur-v.t)/.6);p.grow=g,p.g.visible=!0,p.g.position.set(d.ipos.x*.01,0,d.ipos.z*.01),p.g.scale.set(.3+.7*g,g,.3+.7*g);for(let M of p.parts)M.m.rotation.y+=M.speed*t,M.tex.offset.y-=t*.6;let x=Math.round(t*70*a.mult);for(let M=0;M<x;M++){let y=Math.random()*Math.PI*2,b=Hi(1,6),E=p.g.position.x+Math.cos(y)*b,A=p.g.position.z+Math.sin(y)*b;a.smoke.emit(E,Hi(0,1.5),A,-Math.sin(y)*9,Hi(3,9),Math.cos(y)*9,Hi(.8,1.6),Hi(.8,1.4),Hi(2.4,4),[.45,.4,.33,.45],[.3,.28,.25,0],.8,-1,Hi(-2,2))}}}}for(let[d,f]of this.cables)h.has(d)||(f.cable.visible=f.claw.visible=!1);for(let[d,f]of this.tornados)u.has(d)||(f.g.visible=!1)}};var iu=new w,nu=new w,x1=new w,Ef=new w,_l=class{constructor(t,e=2400,i=.02){this.max=e,this.height=i,this.head=0,this.pos=new Float32Array(e*4*3),this.col=new Float32Array(e*4*4);let n=new Uint32Array(e*6);for(let o=0;o<e;o++){let a=o*4;n.set([a,a+1,a+2,a+2,a+1,a+3],o*6)}let r=new le;this.posAttr=new ge(this.pos,3).setUsage(Ki),this.colAttr=new ge(this.col,4).setUsage(Ki),r.setAttribute("position",this.posAttr),r.setAttribute("color",this.colAttr),r.setIndex(new ge(n,1)),r.setDrawRange(0,0),this.geo=r,this.mesh=new ot(r,new ve({vertexColors:!0,transparent:!0,depthWrite:!1,side:re,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2})),this.mesh.frustumCulled=!1,this.mesh.renderOrder=1,t.add(this.mesh),this.prev=new Map,this.used=0,this.dirty=!1}clear(){this.used=0,this.head=0,this.prev.clear(),this.geo.setDrawRange(0,0)}static skid(t){if(!t.onGround||t.demolished||t.groundNormal.y<.95||t.pos.y>45)return 0;t.forward(iu),t.left(nu);let e=t.vel.length(),i=Math.abs(t.vel.dot(nu)),n=t.vel.dot(iu),r=t.input,o=0;return r.powerslide&&e>250&&(o=Math.max(o,.9)),i>140&&(o=Math.max(o,Math.min(1,(i-140)/400))),(r.throttle>.5||t.boosting)&&Math.abs(n)<650&&(o=Math.max(o,.7)),r.throttle*n<0&&Math.abs(n)>450&&(o=Math.max(o,.8)),o}update(t,e,i,n){iu.set(0,0,1).applyQuaternion(i),nu.set(1,0,0).applyQuaternion(i),x1.set(0,1,0).applyQuaternion(i);for(let r=0;r<4;r++){let o=t.id*4+r;if(n<=0||It.wheels[r].front&&n<.75){this.prev.delete(o);continue}let a=It.wheels[r];Ef.copy(e).addScaledVector(nu,a.x+Math.sign(a.x)*7).addScaledVector(iu,a.z);let l=Ef.x*.01,c=Ef.z*.01,h=this.prev.get(o);if(!h){this.prev.set(o,{x:l,z:c});continue}let u=l-h.x,d=c-h.z,f=Math.hypot(u,d);if(!(f<.08)){if(f>4){this.prev.set(o,{x:l,z:c});continue}this.addQuad(h.x,h.z,l,c,u/f,d/f,.72*n),h.x=l,h.z=c}}}addQuad(t,e,i,n,r,o,a){let c=-o*.07,h=r*.07,u=this.height,d=this.head,f=d*12,m=this.pos;m[f]=t+c,m[f+1]=u,m[f+2]=e+h,m[f+3]=t-c,m[f+4]=u,m[f+5]=e-h,m[f+6]=i+c,m[f+7]=u,m[f+8]=n+h,m[f+9]=i-c,m[f+10]=u,m[f+11]=n-h;let v=d*16;for(let p=0;p<4;p++)this.col.set([.045,.035,.018,a],v+p*4);this.head=(this.head+1)%this.max,this.used=Math.min(this.max,this.used+1),this.dirty=!0}flush(){this.dirty&&(this.dirty=!1,this.posAttr.needsUpdate=!0,this.colAttr.needsUpdate=!0,this.geo.setDrawRange(0,this.used*6))}};var js=`
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
`,ru=`
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`,Tf=1.3,A0=7.5;function y1(s){return new fe({uniforms:s,transparent:!0,depthWrite:!1,blending:Ee,side:re,vertexShader:`
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
      ${js}
      void main() {
        float r = length(vL.xz);
        float t = clamp((r - ${Tf.toFixed(2)}) / (${(A0-Tf).toFixed(2)}), 0.0, 1.0);
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
        ${ru}
      }`})}function _1(s){return new fe({uniforms:s,transparent:!0,depthWrite:!1,blending:Ee,vertexShader:`
      varying vec2 vP;
      void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`
      uniform float uTime, uI, uHot, uSide, uBurst;
      varying vec2 vP;
      ${js}
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
        ${ru}
      }`})}function M1(s){return new fe({uniforms:s,transparent:!0,depthWrite:!1,blending:Ee,vertexShader:`
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
        ${ru}
      }`})}function b1(s){return new fe({uniforms:s,transparent:!0,depthWrite:!1,blending:Ee,side:re,vertexShader:`
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
      ${js}
      void main() {
        float along = 1.0 - vUv.y; // 0 at the hole, 1 at the tip
        float n = fbm3(vec3(vUv.x * 12.0, along * 6.0 - uTime * 9.0, 1.0));
        float facing = abs(dot(normalize(vN), normalize(cameraPosition - vW)));
        float a = pow(facing, 1.5) * (1.0 - along) * (0.4 + n) * smoothstep(0.0, 0.05, along);
        vec3 col = mix(vec3(0.75, 0.85, 1.0), vec3(0.4, 0.55, 1.0), along);
        gl_FragColor = vec4(col * a * 3.0 * uJet, 1.0);
        ${ru}
      }`})}var su=new Me,wf=new w,w0=new w,Uo=new w,Er=new w,T0=new w(0,1,0),Fo=class{constructor({jets:t=!1,segments:e=1}={}){this.group=new _e,this.u={uTime:{value:0},uI:{value:1},uHot:{value:0},uSide:{value:1},uBurst:{value:0},uGlow:{value:1},uJet:{value:0}},this.horizon=new ot(new vi(1,64,32),new ve({color:0,fog:!1})),this.horizon.renderOrder=1;let i=new hr(Tf,A0,Math.round(192*e),20);if(i.rotateX(-Math.PI/2),this.disk=new ot(i,y1(this.u)),this.disk.renderOrder=6,this.billboard=new _e,this.halo=new ot(new oi(6,6),_1(this.u)),this.halo.renderOrder=5,this.glow=new ot(new oi(30,30),M1(this.u)),this.glow.renderOrder=4,this.billboard.add(this.glow,this.halo),this.group.add(this.horizon,this.disk,this.billboard),t){let n=new Oe(3.2,.12,70,32,1,!0);n.translate(0,35.6,0);let r=b1(this.u),o=new ot(n,r),a=new ot(n,r);a.rotation.x=Math.PI,this.jets=new _e,this.jets.add(o,a),this.jets.visible=!1;for(let l of[o,a])l.renderOrder=7;this.group.add(this.jets)}this.group.traverse(n=>{n.frustumCulled=!1})}update(t,e){this.u.uTime.value+=t,this.group.updateMatrixWorld(),su.copy(this.group.matrixWorld).invert(),wf.copy(e.position).applyMatrix4(su),Er.copy(wf).normalize(),Uo.copy(T0).addScaledVector(Er,-T0.dot(Er)),Uo.lengthSq()<1e-6&&Uo.set(0,0,1).addScaledVector(Er,-Er.z),Uo.normalize(),w0.crossVectors(Uo,Er),su.makeBasis(w0,Uo,Er),this.billboard.quaternion.setFromRotationMatrix(su),this.u.uSide.value=wf.y>=0?1:-1,this.jets&&(this.jets.visible=this.u.uJet.value>.001)}dispose(){this.group.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&t.material.dispose()})}};var os=20,wr=`
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`,Rf=`
  vec2 eqUv(vec3 d) { return vec2(atan(d.x, d.z) / 6.2831853 + 0.5, asin(clamp(d.y, -1.0, 1.0)) / 3.1415927 + 0.5); }
  vec3 eqDir(vec2 uv) {
    float lon = (uv.x - 0.5) * 6.2831853, lat = (uv.y - 0.5) * 3.1415927;
    return vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon));
  }
`,Qs=s=>Math.min(1,Math.max(0,s)),Zi=(s,t,e)=>{let i=Qs((e-s)/(t-s));return i*i*(3-2*i)},Af=s=>s<.5?4*s*s*s:1-Math.pow(-2*s+2,3)/2;function R0(s,t,e,i,n=Fi){let r=new Qe(t,e,{type:n,depthBuffer:!1,generateMipmaps:!1,minFilter:mi,magFilter:mi});r.texture.wrapS=Ji;let o=new fe({depthTest:!1,depthWrite:!1,vertexShader:"varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",fragmentShader:`varying vec2 vUv;
${js}
${Rf}
void main() { vec3 dir = eqDir(vUv);
${i}
}`}),a=new ot(new oi(2,2),o);a.frustumCulled=!1;let l=new Zn;l.add(a);let c=new jn(-1,1,1,-1,0,1),h=s.getRenderTarget();return s.setRenderTarget(r),s.render(l,c),s.setRenderTarget(h),o.dispose(),a.geometry.dispose(),r}var S1=`
  float h = fbm(dir * 1.7 + vec3(3.7, 1.1, 0.0)) * 0.72 + fbm(dir * 6.5 + 7.0) * 0.28;
  float dry = fbm(dir * 3.2 + 11.0);
  float cl = fbm(dir * vec3(2.2, 4.6, 2.2) + 23.0) * 0.75 + fbm(dir * 11.0 + 5.0) * 0.25;
  cl = smoothstep(0.47, 0.7, cl);
  float city = step(0.76, vnoise(dir * 190.0)) * smoothstep(0.35, 0.65, vnoise(dir * 22.0));
  gl_FragColor = vec4(h, dry, cl, city);
`,E1=`
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
`;function w1(s){return new fe({side:_i,depthWrite:!1,uniforms:{uTex:{value:s},uBH:{value:new w},uBHR:{value:os},uWarp:{value:0},uFlash:{value:0},uFlashDir:{value:new w(0,0,1)},uSun:{value:new w(1,0,0)}},vertexShader:`
      varying vec3 vDir;
      void main() {
        vDir = (modelMatrix * vec4(position, 0.0)).xyz;
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,fragmentShader:`
      uniform sampler2D uTex; uniform vec3 uBH, uFlashDir, uSun; uniform float uBHR, uWarp, uFlash;
      varying vec3 vDir;
      ${Rf}
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
        ${wr}
      }`})}var D0=`
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
`;function T1(s,t){return new fe({uniforms:{...t,uMap:{value:s},uSun:{value:new w(1,0,0)},uBH:{value:new w},uBHLight:{value:.5},uMelt:{value:0},uCloudRot:{value:0},uTime:{value:0}},vertexShader:`
      ${D0}
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
      ${js}
      ${Rf}
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
        ${wr}
      }`})}function A1(s){return new fe({uniforms:{...s,uSun:{value:new w(1,0,0)},uFade:{value:1}},transparent:!0,depthWrite:!1,blending:Ee,vertexShader:`
      ${D0}
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
        ${wr}
      }`})}function C0(s=!0){return new fe({transparent:!0,depthWrite:!1,blending:s?Ee:mn,uniforms:{uScale:{value:1},uAtten:{value:0},uI:{value:1}},vertexShader:`
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
        ${wr}
      }`})}function R1(s){let t=document.createElement("canvas");t.width=t.height=256;let e=t.getContext("2d"),i=s*9301+49297,n=()=>(i=(i*9301+49297)%233280,i/233280),r=e.createRadialGradient(128,128,0,128,128,60);r.addColorStop(0,"rgba(255,240,210,1)"),r.addColorStop(.3,"rgba(255,200,150,0.5)"),r.addColorStop(1,"rgba(120,120,200,0)"),e.fillStyle=r,e.fillRect(0,0,256,256);let o=2+Math.floor(n()*2);for(let l=0;l<2600;l++){let c=l%o,h=Math.pow(n(),.7),u=h*7+c/o*Math.PI*2+(n()-.5)*.6,d=8+h*110+(n()-.5)*14*h,f=128+Math.cos(u)*d,m=128+Math.sin(u)*d,v=(1-h)*.5+.15;e.fillStyle=n()<.15?`rgba(255,170,200,${v})`:`rgba(170,200,255,${v})`,e.fillRect(f,m,1.6,1.6)}let a=new ri(t);return a.colorSpace=ze,a}function C1(){return new fe({uniforms:{uTime:{value:0},uI:{value:1}},transparent:!0,depthWrite:!1,blending:Ee,side:re,vertexShader:`
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
      ${js}
      void main() {
        float f = abs(dot(normalize(vNW), normalize(cameraPosition - vW)));
        float n = fbm3(vL * 4.0 + vec3(0.0, uTime * 1.5, 0.0));
        float edge = pow(1.0 - f, 2.0);
        vec3 col = mix(vec3(1.0, 0.72, 0.4), vec3(1.0, 0.3, 0.08), edge);
        col = mix(col, vec3(0.65, 0.35, 1.0), smoothstep(0.5, 0.8, n) * 0.7);
        gl_FragColor = vec4(col * (0.2 + edge * 1.3) * (0.35 + n) * uI, 1.0);
        ${wr}
      }`})}function P1(){return new fe({uniforms:{uI:{value:1}},transparent:!0,depthWrite:!1,blending:Ee,side:re,vertexShader:"varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uI;
      varying vec2 vP;
      void main() {
        float r = length(vP);
        float a = smoothstep(0.8, 0.98, r) * (1.0 - smoothstep(0.98, 1.0, r));
        gl_FragColor = vec4(vec3(0.75, 0.85, 1.0) * a * a * 1.4 * uI, 1.0);
        ${wr}
      }`})}function I1(){return new fe({uniforms:{uI:{value:0},uTime:{value:0}},transparent:!0,depthWrite:!1,depthTest:!1,blending:Ee,vertexShader:"varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uI, uTime;
      varying vec2 vP;
      ${js}
      void main() {
        float r = length(vP);
        float a = atan(vP.y, vP.x);
        float rays = pow(max(fbm3(vec3(cos(a) * 7.0, sin(a) * 7.0, uTime * 0.5)) - 0.45, 0.0) / 0.55, 2.5) * 4.0;
        float fall = exp(-r * 3.5) * (1.0 - smoothstep(0.4, 0.9, r));
        vec3 col = mix(vec3(1.0, 0.85, 0.6), vec3(0.75, 0.6, 1.0), smoothstep(0.05, 0.4, r));
        gl_FragColor = vec4(col * (rays * fall + exp(-r * 9.0) * 1.5) * uI, 1.0);
        ${wr}
      }`})}var Ue=new w,Ri=new w,P0=new he,I0=new he,Bo=new w(0,1,0);function L0(s,t,e){let i=we.degToRad(s),n=we.degToRad(t);return new w(Math.cos(n)*Math.sin(i)*e,Math.sin(n)*e,Math.cos(n)*Math.cos(i)*e)}var ou=class{constructor(t,e,i){this.fx=i,this.quality=e;let n=e==="low";this.scene=new Zn,this.camera=new ei(50,1,.004,4e4),this.t=0,this.events=new Set;let r=e==="high";this.skyRT=R0(t,r?4096:2048,r?2048:1024,E1,hi),this.earthRT=R0(t,n?1024:2048,n?512:1024,S1),this.skyGroup=new _e,this.sky=new ot(new vi(9e3,64,32),w1(this.skyRT.texture)),this.sky.renderOrder=-10,this.skyGroup.add(this.sky),this.scene.add(this.skyGroup);{let d=n?2500:6e3,f=new Float32Array(d*3),m=new Float32Array(d*3),v=new Float32Array(d),p=new w(.25,.92,.3).normalize();for(let x=0;x<d;x++){if(Ue.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1),Ue.lengthSq()>1||Ue.lengthSq()<.01){x--;continue}Ue.normalize(),x%3===0&&Ue.addScaledVector(p,-Ue.dot(p)*.9).normalize(),Ue.multiplyScalar(8e3),f.set([Ue.x,Ue.y,Ue.z],x*3);let M=Math.random(),y=M<.2?[1,.75,.55]:M<.7?[1,.96,.92]:[.7,.82,1],b=.4+Math.pow(Math.random(),4)*2.4;m.set([y[0]*b,y[1]*b,y[2]*b],x*3),v[x]=1.2+Math.pow(Math.random(),6)*3.2}let g=new le;g.setAttribute("position",new ge(f,3)),g.setAttribute("aCol",new ge(m,3)),g.setAttribute("aSize",new ge(v,1)),this.starMat=C0(),this.starMat.uniforms.uScale.value=Math.min(window.devicePixelRatio||1,2),this.stars=new no(g,this.starMat),this.stars.renderOrder=-9,this.stars.frustumCulled=!1,this.skyGroup.add(this.stars)}this.galaxies=[];for(let d=0;d<9;d++){let f=new eo({map:R1(d+3),blending:Ee,depthWrite:!1,transparent:!0,opacity:.55,rotation:Math.random()*6.28}),m=new Ma(f);Ue.set(Math.random()*2-1,(Math.random()*2-1)*.6,Math.random()*2-1).normalize(),m.position.copy(Ue).multiplyScalar(5200+Math.random()*1500);let v=260+Math.random()*380;m.scale.set(v,v*(.35+Math.random()*.65),1),m.userData={base:m.position.clone(),s:m.scale.clone()},m.renderOrder=-8,this.scene.add(m),this.galaxies.push(m)}this.bh=new Fo({jets:!0,segments:n?.6:1}),this.bh.group.scale.setScalar(os),this.bh.group.rotation.set(-.04,0,.07),this.scene.add(this.bh.group),this.wideCam=L0(38,8,430);let o=Ue.copy(this.wideCam).negate().normalize(),a=new w().crossVectors(o,Bo).normalize(),l=new w().crossVectors(a,o).normalize();this.wideLook=new w().addScaledVector(a,40).addScaledVector(l,10),this.earth0=this.wideCam.clone().addScaledVector(o.clone().addScaledVector(a,-.34).addScaledVector(l,-.19).normalize(),60);let c={uAxis:{value:new w(1,0,0)},uStretch:{value:0}};this.earthShared=c,this.earth=new _e,this.earthMat=T1(this.earthRT.texture,c),this.earthMesh=new ot(new vi(1,n?96:160,n?64:120),this.earthMat),this.atmoMat=A1(c),this.atmo=new ot(new vi(1.045,96,64),this.atmoMat),this.atmo.renderOrder=2,this.earth.add(this.earthMesh,this.atmo),this.earth.rotation.z=.41,this.earth.position.copy(this.earth0),this.scene.add(this.earth),this.earthAlive=!0;let h=this.earth0.clone().negate().normalize(),u=new w().crossVectors(h,Bo).normalize();this.startDir=new w().addScaledVector(h,-.35).addScaledVector(u,-1).addScaledVector(Bo,.32).normalize(),this.sunDir=new w().addScaledVector(this.startDir,1).addScaledVector(h,.45).addScaledVector(Bo,.25).normalize(),this.earthMat.uniforms.uSun.value.copy(this.sunDir),this.atmoMat.uniforms.uSun.value.copy(this.sunDir),this.sky.material.uniforms.uSun.value.copy(this.sunDir);{let d=n?1400:3600;this.streamN=d;let f=new le;this.sPos=new Float32Array(d*3),this.sCol=new Float32Array(d*3),this.sSize=new Float32Array(d),f.setAttribute("position",new ge(this.sPos,3).setUsage(Ki)),f.setAttribute("aCol",new ge(this.sCol,3).setUsage(Ki)),f.setAttribute("aSize",new ge(this.sSize,1).setUsage(Ki)),this.streamGeo=f,this.streamMat=C0(),this.streamMat.uniforms.uAtten.value=1,this.stream=new no(f,this.streamMat),this.stream.frustumCulled=!1,this.stream.renderOrder=8,this.scene.add(this.stream),this.parts=[];for(let m=0;m<d;m++)this.parts.push({alive:!1,born:0,life:1,off:new w,spin:0,hot:!1,size:1,src:new w});this.emitAcc=0}this.core=new ot(new vi(1,64,32),C1()),this.core.visible=!1,this.core.renderOrder=9,this.shock=new ot(new hr(.5,1,160,1),P1()),this.shock.rotation.x=-Math.PI/2,this.shock.visible=!1,this.shock.renderOrder=9,this.rays=new ot(new oi(2,2),I1()),this.rays.visible=!1,this.rays.renderOrder=10,this.scene.add(this.core,this.shock,this.rays);for(let d of[this.core,this.shock,this.rays])d.frustumCulled=!1;this.camPos=new w,this.camLook=new w,this.shakeAmt=0,this.fov=55,this.duration=19.8,this.update(0)}earthAt(t,e){let i=Qs((t-6)/6.2),n=.75*Math.pow(i,2.2)+.25*Math.pow(i,12),r=this.earth0.length(),o=r*Math.pow(os*.25/r,n),a=1-o/r,c=Math.atan2(this.earth0.x,this.earth0.z)+1.25*Math.pow(i,2.6),h=this.earth0.y*(1-a),u=Math.sqrt(Math.max(0,o*o-h*h));return e.set(Math.sin(c)*u,h,Math.cos(c)*u)}emitStream(t,e,i){this.emitAcc+=i*t;let n=this.earth.position;for(let r of this.parts){if(this.emitAcc<1)break;r.alive||(this.emitAcc-=1,r.alive=!0,r.born=e,r.life=2.4+Math.random()*2.4,Ue.copy(n).negate().normalize(),Ri.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize(),Ri.dot(Ue)<0&&Ri.addScaledVector(Ue,-2*Ri.dot(Ue)),Ri.lerp(Ue,.35).normalize(),r.off.copy(Ri).multiplyScalar(1.02+this.earthShared.uStretch.value*.8*Math.random()),r.src.copy(n),r.spin=.9+Math.random()*1.2,r.hot=Math.random()<.55,r.size=r.hot?.12+Math.random()*.25:.08+Math.random()*.15)}this.emitAcc>1&&(this.emitAcc=1)}updateStream(t){let e=this.sPos,i=this.sCol,n=this.sSize;for(let o=0;o<this.streamN;o++){let a=this.parts[o];if(!a.alive){n[o]=0;continue}let l=(t-a.born)/a.life;if(l>=1){a.alive=!1,n[o]=0;continue}Ue.copy(this.earthAlive?this.earth.position:a.src).add(a.off);let c=Ue.length(),h=Math.pow(l,1.5),u=c*(1-h)+os*.92*h;Ri.copy(Ue).divideScalar(c);let d=a.spin*Math.pow(l,2.2)*2.2,f=Math.cos(d),m=Math.sin(d),v=Ri.x*f+Ri.z*m,p=-Ri.x*m+Ri.z*f,g=Ri.y*(1-h),x=Math.hypot(v,g,p);e[o*3]=v/x*u,e[o*3+1]=g/x*u,e[o*3+2]=p/x*u;let M=Math.min(1,l*1.6),y=Math.min(1,(1-l)*6)*Math.min(1,l*12);a.hot?(i[o*3]=(1.6+M)*y,i[o*3+1]=(.55+M*.9)*y,i[o*3+2]=(.15+M*.8)*y):(i[o*3]=(.35+M*1.2)*y,i[o*3+1]=(.3+M*.7)*y,i[o*3+2]=(.28+M*.4)*y),n[o]=a.size*(1+l*6)*(.4+.6*(u/c))}let r=this.streamGeo;r.attributes.position.needsUpdate=!0,r.attributes.aCol.needsUpdate=!0,r.attributes.aSize.needsUpdate=!0}once(t){return this.events.has(t)?!1:(this.events.add(t),!0)}update(t){let e=this.t;this.t+=t;let i=this.fx,n=this.camera,r=this.bh.u;if(this.earthAlive){this.earthAt(e,this.earth.position),this.earth.rotateY(t*.08);let f=this.earth.position.length();Ue.copy(this.earth.position).negate().normalize(),this.earth.getWorldQuaternion(P0),I0.copy(P0).invert(),this.earthShared.uAxis.value.copy(Ue).applyQuaternion(I0);let m=Math.pow(Qs((95-f)/75),2)*7;this.earthShared.uStretch.value=m,this.earthMat.uniforms.uMelt.value=Qs((140-f)/110),this.earthMat.uniforms.uBHLight.value=.35+Qs((300-f)/250)*1.6,this.earthMat.uniforms.uCloudRot.value+=t*.03,this.earthMat.uniforms.uTime.value=e,this.earthMat.uniforms.uBH.value.set(0,0,0),f<os*.55&&(this.earthAlive=!1,this.earth.visible=!1,i.flash("#ffd9a8",.35,.05,0,.6),i.sound("gulp"))}e<12.5&&this.emitStream(t,e,e<6?260:700),this.updateStream(e);let o=Zi(12.3,14,e);r.uHot.value=o*.8,r.uJet.value=Zi(12.6,13.4,e)*(1-Zi(14.2,14.6,e));let a=.5+.5*Zi(70,220,this.camPos.length());r.uI.value=(1+o*.6+(e>12.6&&e<14?Math.sin(e*40)*.15*o:0))*a;let l=1+(e>12.6&&e<14?Math.sin(e*22)*.035*o:0),c=e-14;if(c>0){this.once("boom")&&(i.sound("bigboom"),i.flash("#ffffff",.55,.05,.05,.8),i.shake(1.5),this.core.visible=!0,this.shock.visible=!0,this.rays.visible=!0),r.uBurst.value=Qs(c/1.2),this.bh.horizon.scale.setScalar(Math.max(.001,1-c*3));let f=os*(.6+3.2*Math.pow(c,2.4));this.core.scale.setScalar(f),this.core.material.uniforms.uTime.value=c,this.core.material.uniforms.uI.value=.7*(1-Zi(3.5,5,c));let m=os*(1+9*Math.pow(c,1.8));this.shock.scale.setScalar(m),this.shock.material.uniforms.uI.value=1-Zi(2,3.4,c),this.rays.material.uniforms.uI.value=Zi(0,.15,c)*(1-Zi(2.6,3.4,c))*.45,this.rays.material.uniforms.uTime.value=c;let v=this.sky.material.uniforms;v.uWarp.value=Zi(.2,2.6,c),v.uFlash.value=Zi(.8,3,c);for(let p of this.galaxies){let g=p.userData.base.length(),x=Qs((f-g*.15)/(g*.3));p.position.copy(p.userData.base).multiplyScalar(1+x*.6),p.material.opacity=.55+x*2*(1-x)}c>2.3&&this.once("white")&&i.flash("#ffffff",1,1,99,1),c>3.4&&this.once("text")&&i.text("final")}this.bh.group.scale.setScalar(os*l);let h=this.wideCam;if(e<6.5){let f=Af(Qs(e/6.3)),m=1.85,v=this.wideCam.distanceTo(this.earth0),p=m*Math.pow(v/m,f);Ri.copy(h).sub(this.earth0).normalize(),Ue.copy(this.startDir).lerp(Ri,Zi(.15,1,f)).normalize(),this.camPos.copy(this.earth0).addScaledVector(Ue,p),Ri.copy(this.earth0).multiplyScalar(-.006).add(this.earth0),this.camLook.copy(Ri).lerp(this.wideLook,Zi(.25,1,f)),this.fov=55}else if(e<12.4){let f=Zi(6.3,7.8,e),m=this.earth.position;Ue.copy(m).normalize(),Ri.crossVectors(Bo,Ue).normalize();let v=this._target||(this._target=new w);v.copy(m).addScaledVector(Ue,7).addScaledVector(Ri,-5).addScaledVector(Bo,2.5),v.length()<os*2.2&&v.setLength(os*2.2),this.camPos.lerpVectors(h,v,f),Ue.copy(m).multiplyScalar(.65),this.camLook.lerpVectors(this.wideLook,Ue,f),this.fov=55+f*5}else{let f=Zi(12.4,13.8,e);this.fromPos||(this.fromPos=this.camPos.clone(),this.fromLook=this.camLook.clone(),this.farPos=L0(30,9,640)),this.camPos.lerpVectors(this.fromPos,this.farPos,Af(f)),this.camLook.copy(this.fromLook).multiplyScalar(1-Af(f)),this.fov=60+Zi(14,16,e)*18}this.shakeAmt=Math.max(0,this.shakeAmt-t*.5);let u=Math.max(this.shakeAmt,o*.25)*(e>17?0:1);if(n.position.copy(this.camPos),u>0){let f=.004*u*n.position.distanceTo(this.camLook);n.position.x+=(Math.random()-.5)*f,n.position.y+=(Math.random()-.5)*f,n.position.z+=(Math.random()-.5)*f}n.up.set(0,1,0),n.lookAt(this.camLook),this.rays.position.set(0,0,0),this.rays.quaternion.copy(n.quaternion),this.rays.scale.setScalar(n.position.length()*2.2),this.skyGroup.position.copy(n.position);let d=this.sky.material.uniforms;d.uBH.value.set(0,0,0),d.uBHR.value=Math.max(1e-4,this.bh.group.scale.x*this.bh.horizon.scale.x),d.uFlashDir.value.copy(n.position).negate().normalize(),this.atmoMat.uniforms.uFade.value=1,this.bh.update(t,n)}get done(){return this.t>=this.duration}dispose(){this.scene.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&(t.material.map&&t.material.map.dispose(),t.material.dispose())}),this.bh.dispose(),this.skyRT.dispose(),this.earthRT.dispose()}};var{halfZ:cu,goalDepth:F0,goalH:B0,goalHalfW:L1}=Ft,Ci=s=>Math.min(1,Math.max(0,s)),Cf=(s,t,e)=>{let i=Ci((e-s)/(t-s));return i*i*(3-2*i)},au=s=>1-Math.pow(1-Ci(s),3),Pf=s=>s<.5?4*s*s*s:1-Math.pow(-2*s+2,3)/2;function D1(s){return s<1/2.75?7.5625*s*s:s<2/2.75?7.5625*(s-=1.5/2.75)*s+.75:s<2.5/2.75?7.5625*(s-=2.25/2.75)*s+.9375:7.5625*(s-=2.625/2.75)*s+.984375}var N1=[[0,0,cu+F0+B0],[0,0,7150],[0,200,7800],[0,700,8600],[0,1400,9500],[0,2200,10500],[0,3100,11600],[300,4100,12800],[1300,5200,14200],[2600,6400,15800],[3500,7700,17700],[3500,9100,19800],[2400,10500,21900],[600,11900,24e3],[-1200,13300,26200],[-2200,14700,28500],[-1800,16100,30900],[-600,17400,33300],[0,18600,35800]],U1=[0,16600,44e3],lu=1500,F1=5500,B1=300,N0=1300,Oo=11e3,Tr=5e3,tr=3.3,Qi=new w,Sn=new w,as=new he,U0=new he,Fn=new Me,ws=new w,er=new w(0,1,0);function O1(s){let t=Ie[s],e=()=>{let l=document.createElement("canvas");return l.width=256,l.height=512,l},i=e(),n=e(),r=i.getContext("2d"),o=n.getContext("2d");r.fillStyle="#25282e",r.fillRect(0,0,256,512);for(let l=0;l<2500;l++){let c=30+Math.random()*40;r.fillStyle=`rgb(${c},${c},${c+4})`,r.fillRect(Math.random()*256,Math.random()*512,2,2)}o.fillStyle="#000",o.fillRect(0,0,256,512);for(let l of[r,o]){l.fillStyle=l===r?"#d8dde6":"#9aa6b8",l.fillRect(12,0,7,512),l.fillRect(237,0,7,512),l.fillStyle=l===r?t.css:"#fff";for(let c of[60,316])l.beginPath(),l.moveTo(128,c),l.lineTo(196,c+70),l.lineTo(196,c+120),l.lineTo(128,c+50),l.lineTo(60,c+120),l.lineTo(60,c+70),l.closePath(),l.fill()}let a=[i,n].map(l=>{let c=new ri(l);return c.wrapS=c.wrapT=Ji,c.anisotropy=4,c});return a[0].colorSpace=ze,a}function If(s,t,e){return s.onBeforeCompile=i=>{i.uniforms.uReveal=t,i.uniforms.uRevealCol=e,i.vertexShader=`attribute float aS;
varying float vS;
`+i.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vS = aS;`),i.fragmentShader=`uniform float uReveal;
uniform vec3 uRevealCol;
varying float vS;
`+i.fragmentShader.replace("#include <clipping_planes_fragment>",`#include <clipping_planes_fragment>
if (vS > uReveal) discard;`).replace("#include <emissivemap_fragment>",`#include <emissivemap_fragment>
totalEmissiveRadiance += uRevealCol * (1.0 - smoothstep(0.0, 1400.0, uReveal - vS)) * 3.0;`)},s}var hu=class{constructor(t,e,i){this.match=t,this.app=t.app,this.champ=e,this.team=i,this.target=1-i,this.s=this.target===0?-1:1,this.t=0,this.stage=1,this.done=!1,this.events=new Set;let n=this.app,r=n.stadium;this.cine=r.cine,this.quality=n.settings.quality,this.group=new _e,t.group.add(this.group),this.camera=new ei(55,1,.1,4500),this.view={camera:this.camera,rect:[0,0,1,1],hfov:82},n.gfx.setViews([this.view]),n.hud.show(!1);let o=n.gfx.bloom;o&&(this.bloomWas={strength:o.strength,radius:o.radius},o.strength=.38,o.radius=.12);for(let a of t.engines)n.audio.updateEngine(a,0,0,!1,!1,!1);this.engine=n.audio.createEngine(0),this.cine.screenFor(this.target).visible=!1,this.buildOverlay(),this.buildRoad(),this.buildBlackHole(),this.stageCars(),this.buildCutEdges(),this.buildDebris(),this.shake=0,this.camPos=new w,this.camLook=new w,this.camUp=new w(0,1,0),this.camInit=!1,this.caption(`${i===0?"BLUE":"ORANGE"} WINS!`,`${t.scores[0]} - ${t.scores[1]}`,i===0?"blue":"orange"),n.audio.cine("rise")}P(t,e,i){return new w(t,e,this.s*i)}once(t){return this.events.has(t)?!1:(this.events.add(t),!0)}buildOverlay(){let t=document.createElement("div");t.className="cine",t.innerHTML='<div class="cine-fill"></div><div class="cine-bar top"></div><div class="cine-bar bottom"></div><div class="cine-text"><div class="cine-main"></div><div class="cine-sub"></div></div><div class="cine-skip">Press A / Space to skip</div>',document.body.appendChild(t),this.overlay=t,this.fill=t.querySelector(".cine-fill"),this.textEl=t.querySelector(".cine-text"),this.mainEl=t.querySelector(".cine-main"),this.subEl=t.querySelector(".cine-sub"),this.flashes=[],requestAnimationFrame(()=>t.classList.add("on"))}flash(t,e,i,n,r){this.flashes.push({color:t,peak:e,rise:Math.max(.001,i),hold:n,fall:Math.max(.001,r),t:0})}updateFlashes(t){let e=0,i="#fff";for(let n=this.flashes.length-1;n>=0;n--){let r=this.flashes[n];r.t+=t;let o;if(r.t<r.rise?o=r.t/r.rise:r.t<r.rise+r.hold?o=1:o=1-(r.t-r.rise-r.hold)/r.fall,o<=0&&r.t>r.rise){this.flashes.splice(n,1);continue}o*=r.peak,o>e&&(e=o,i=r.color)}this.fill.style.opacity=e.toFixed(3),this.fill.style.background=i}caption(t,e="",i=""){this.mainEl.textContent=t,this.subEl.textContent=e,this.textEl.className="cine-text show "+i}hideCaption(){this.textEl.className="cine-text"}buildRoad(){let t=N1.map(([m,v,p])=>this.P(m,v,p)),e=new ro(t,!1,"centripetal");e.arcLengthDivisions=3e3;let i=e.getLength(),n=Math.ceil(i/40),r=[];for(let m=0;m<=n;m++){let v=m/n,p=e.getPointAt(v),g=e.getTangentAt(v).normalize();r.push({s:v*i,p,T:g,U:new w,R:new w,bank:0})}for(let m=0;m<=n;m++){let v=r[Math.max(0,m-3)],p=r[Math.min(n,m+3)],g=Qi.crossVectors(r[m].T,er).normalize(),x=Sn.subVectors(p.T,v.T).dot(g)/Math.max(1,p.s-v.s);r[m].k=x}for(let m=0;m<=n;m++){let v=0,p=0;for(let A=Math.max(0,m-25);A<=Math.min(n,m+25);A++)v+=r[A].k,p++;let g=we.clamp(v/p*9e3,-.5,.5),x=r[m];x.R.crossVectors(x.T,er).normalize(),x.U.crossVectors(x.R,x.T).normalize();let M=Math.cos(g),y=Math.sin(g),b=x.U.clone(),E=x.R.clone();x.U.copy(b).multiplyScalar(M).addScaledVector(E,y),x.R.copy(E).multiplyScalar(M).addScaledVector(b,-y)}this.samples=r,this.roadLen=i,this.groundLen=cu+F0+B0-N0,this.totalLen=this.groundLen+i,this.roadEnd=r[n];let o=Ie[this.team];this.reveal={value:0};let a={value:new St(o.light).multiplyScalar(1.5)},[l,c]=O1(this.team),h=B1,u=If(new Zt({map:l,emissiveMap:c,emissive:new St(o.main),emissiveIntensity:.9,roughness:.8,metalness:.1,side:re}),this.reveal,a),d=If(new Zt({color:2303790,roughness:.35,metalness:.85,side:re}),this.reveal,a),f=If(new Zt({color:0,emissive:new St(o.light),emissiveIntensity:2.2,side:re}),this.reveal,a);this.roadMats=[u,d,f],this.road=new _e,this.road.add(new ot(this.sweep([[-h,0],[h,0]],1200),u),new ot(this.sweep([[-h+22,1],[-h+22,40],[-h-4,40],[-h-4,-55],[h+4,-55],[h+4,40],[h-22,40],[h-22,1]],900),d),new ot(this.sweep([[-h-2,41.5],[-h+20,41.5]],900),f),new ot(this.sweep([[h-20,41.5],[h+2,41.5]],900),f),new ot(this.sweep([[-h-5,8],[-h-5,24]],900),f),new ot(this.sweep([[h+5,24],[h+5,8]],900),f));for(let m of this.road.children)m.frustumCulled=!1,m.castShadow=!1;this.group.add(this.road)}sweep(t,e){let i=this.samples.length,n=t.length,r=new Float32Array(i*n*3),o=new Float32Array(i*n*2),a=new Float32Array(i*n);for(let h=0;h<i;h++){let u=this.samples[h];for(let d=0;d<n;d++){let[f,m]=t[d],v=h*n+d;r[v*3]=(u.p.x+u.R.x*f+u.U.x*m)*.01,r[v*3+1]=(u.p.y+u.R.y*f+u.U.y*m)*.01,r[v*3+2]=(u.p.z+u.R.z*f+u.U.z*m)*.01,o[v*2]=n===2?d:d/(n-1),o[v*2+1]=u.s/e,a[v]=u.s}}let l=[];for(let h=0;h<i-1;h++)for(let u=0;u<n-1;u++){let d=h*n+u,f=(h+1)*n+u,m=(h+1)*n+u+1,v=h*n+u+1;l.push(d,f,v,f,m,v)}let c=new le;return c.setAttribute("position",new ge(r,3)),c.setAttribute("uv",new ge(o,2)),c.setAttribute("aS",new ge(a,1)),c.setIndex(l),c.computeVertexNormals(),c}frameAt(t,e){if(t<this.groundLen)return e.p.set(0,0,this.s*(N0+t)),e.T.set(0,0,this.s),e.U.set(0,1,0),e.R.crossVectors(e.T,er).normalize(),e;let i=t-this.groundLen,n=this.samples,r=i/(this.roadLen/(n.length-1));if(r>=n.length-1){let h=n[n.length-1];return e.p.copy(h.p).addScaledVector(h.T,i-this.roadLen),e.T.copy(h.T),e.U.copy(h.U),e.R.copy(h.R),e}let o=Math.floor(r),a=r-o,l=n[o],c=n[o+1];return e.p.lerpVectors(l.p,c.p,a),e.T.lerpVectors(l.T,c.T,a).normalize(),e.U.lerpVectors(l.U,c.U,a).normalize(),e.R.lerpVectors(l.R,c.R,a).normalize(),e}driveDist(t){let e=Math.max(0,t-tr),i=Oo/Tr;return e<i?.5*Tr*e*e:.5*Tr*i*i+Oo*(e-i)}driveSpeed(t){let e=Math.max(0,t-tr);return Math.min(Oo,Tr*e)}timeAt(t){let e=Oo/Tr,i=.5*Tr*e*e;return t<i?tr+Math.sqrt(2*t/Tr):tr+e+(t-i)/Oo}buildBlackHole(){this.bhPos=this.P(...U1),this.bh=new Fo({segments:this.quality==="low"?.6:1}),this.bh.group.position.copy(this.bhPos).multiplyScalar(.01),this.bh.group.scale.setScalar(lu*.01);let t=Qi.set(-560,0,this.s*-260).sub(Sn.copy(this.bhPos).multiplyScalar(.01).setY(0)).normalize();this.bh.group.quaternion.setFromUnitVectors(er,Sn.copy(er).addScaledVector(t,.3).normalize()),this.bh.u.uI.value=.6,this.bh.u.uGlow.value=.6,this.group.add(this.bh.group),this.bhR=lu,this.tEnd=this.timeAt(this.totalLen),this.fallDur=1.25,this.tBoom=this.tEnd+this.fallDur,this.tSuck=this.tBoom+.55,this.tSpace=this.tSuck+5.6;let e=this.cine.buildings;this.bMats=[],this.roadBlocked=new Set;let i=new w,n=new he,r=new w;for(let o=0;o<e.count;o++){e.getMatrixAt(o,Fn),this.bMats.push(Fn.clone()),Fn.decompose(i,n,r);let a=!1;for(let l=0;l<this.samples.length;l+=4){let c=this.samples[l],h=c.p.x*.01-i.x,u=c.p.z*.01-i.z,d=Math.max(r.x,r.z)*.75+12;if(h*h+u*u<d*d&&i.y+r.y+8>c.p.y*.01){a=!0;break}}a&&(this.roadBlocked.add(o),Fn.compose(i,n,ws.set(0,0,0)),e.setMatrixAt(o,Fn))}e.instanceMatrix.needsUpdate=!0}stageCars(){let t=this.match,e=this.s;this.carState={team:this.team,vel:new w,boosting:!1,supersonic:!1,demolished:!1,steerVisual:0,wheelSpin:0,wheelDist:[17,17,17,17],onGround:!0},t.players.filter(n=>n!==this.champ).forEach((n,r)=>{let o=n.car.team===this.team?1:-1,a=Math.floor(r/2),l=o*(700+r%2*260),c=e*(2300+a*1300+r%2*400);n.model.root.position.set(l*.01,17*.01,c*.01),n.model.root.quaternion.setFromAxisAngle(er,Math.atan2(-l,0)),n.model.root.scale.setScalar(1),n.model.flame.visible=!1,n.model.root.visible=!0});for(let n of t.players)n.model.blob&&(n.model.blob.visible=!1);t.ballBlob&&(t.ballBlob.visible=!1),this.ballWasVisible=t.ball.visible,t.ball.visible=!0,t.ball.position.set(-1900*.01,93*.01,e*3200*.01),this.champ.model.root.visible=!0,this.champ.model.root.scale.setScalar(1),this.frame={p:new w,T:new w,U:new w,R:new w},this.camFrame={p:new w,T:new w,U:new w,R:new w},this.carPos=new w,this.carQuat=new he,this.placeChamp(0,0)}buildCutEdges(){let t=Ie[this.team],e=new ve({color:new St(t.light).multiplyScalar(3),fog:!1});this.edgeMat=e,this.edges=[];let i=n=>{let r=new ao;for(let o=0;o<n.length-1;o++){let a=n[o],l=n[o+1];r.add(new oo(new w(0,a[1]*.01,this.s*(cu+a[0])*.01),new w(0,l[1]*.01,this.s*(cu+l[0])*.01)))}return new Ba(r,n.length*8,.22,6,!1)};for(let n of[-1,1]){let r=new _e;r.add(new ot(i(this.cine.standEdge),e),new ot(i(this.cine.roofEdge),e)),r.userData.side=n,r.visible=!1,this.cine.arena.parent.add(r),this.edges.push(r)}}buildDebris(){let e=this.quality==="low"?180:420,i=new qe(1,1,1),n=new Zt({roughness:.85,metalness:.1}),r=new xs(i,n,e);r.instanceMatrix.setUsage(Ki),r.frustumCulled=!1;let o=new St,a=this.s;this.debris=[];for(let l=0;l<e;l++){let c=Math.random(),h={p0:new w,size:new w,axis:new w(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),spin:2+Math.random()*6};if(c<.45)h.p0.set((Math.random()*2-1)*38,.3,(Math.random()*2-1)*48),h.size.set(1.5+Math.random()*4,.4+Math.random()*.6,1.5+Math.random()*4),o.setRGB(.07+Math.random()*.05,.16+Math.random()*.08,.04);else if(c<.8){let u=Math.random()*Math.PI*2,d=1+Math.random()*.45;h.p0.set(Math.cos(u)*52*d,8+Math.random()*30,Math.sin(u)*63*d),h.size.set(1+Math.random()*5,.8+Math.random()*3,1+Math.random()*5),Math.random()<.3?o.setHex(Ie[h.p0.z*a>0?this.target:this.team].main).multiplyScalar(.5):o.setRGB(.2,.21,.23)}else h.p0.set((Math.random()*2-1)*70,Math.random()*50,(Math.random()*2-1)*90),h.size.set(.3+Math.random()*2,.3+Math.random()*2,.3+Math.random()*2),o.setRGB(.5+Math.random()*.5,.5,.5);h.t0=Math.random()*3.6,h.dur=2.2+Math.random()*1.8,h.swirl=1.5+Math.random()*2.5,h.lift=8+Math.random()*25,this.debris.push(h),r.setColorAt(l,o),r.setMatrixAt(l,Fn.makeScale(0,0,0))}r.instanceColor.needsUpdate=!0,r.visible=!1,this.debrisMesh=r,this.group.add(r)}suckPos(t,e,i,n,r){let o=Sn.copy(this.bhPos).multiplyScalar(.01),a=Qi.copy(t).sub(o),l=a.length(),c=Math.pow(e,1.7),h=this.bhR*.01,u=l*(1-c)+h*.6*c,d=i*Math.pow(e,2.4),f=Math.cos(d),m=Math.sin(d),v=a.x*f+a.z*m,p=-a.x*m+a.z*f;return r.set(v,a.y,p).multiplyScalar(u/l).add(o),r.y+=n*Math.sin(Math.PI*Math.min(1,e*1.5))*(1-e),Ci((u-h*.75)/(h*1.2))}placeChamp(t,e){let i=this.frameAt(this.driveDist(t),this.frame);this.carPos.copy(i.p).addScaledVector(i.U,17),Fn.makeBasis(Qi.copy(i.R).negate(),i.U,i.T),this.carQuat.setFromRotationMatrix(Fn);let n=this.driveSpeed(t),r=this.carState;r.vel.copy(i.T).multiplyScalar(n),r.boosting=t>tr-.1,r.supersonic=n>2200,r.wheelSpin+=n/17*e,this.champ.model.update(r,this.carPos,this.carQuat,e),this.match.effects.carTrail(r,this.carPos,this.carQuat,e)}update(t,e){if(this.done)return!1;t=Math.min(t,.05);let i=this.t;return this.t+=t,e&&i>1?(this.finish(!0),!1):(this.updateFlashes(t),this.stage===1?this.updateStadium(i,t):this.updateSpace(i,t),this.done?!1:(this.app.gfx.render(),!0))}updateStadium(t,e){let i=this.app,n=this.cine,r=this.match,o=this.s,a=Ie[this.team];t>2.6&&this.once("caption-off")&&this.hideCaption();let l=Ci((t-.6)/1.1);n.setGoalFlap(this.target,Math.PI/2*D1(l)),t>.6&&this.once("flap")&&(i.audio.cine("flap"),i.stadium.goalFlash(this.target)),t>1.2&&this.once("flapLand")&&i.audio.cine("clunk");let c=L1*Pf(Ci((t-.5)/1.1));n.setCut(this.target,t<this.tSuck+2.3?c:0);for(let d of this.edges)d.visible=c>1&&t<this.tSuck+2.2,d.position.x=d.userData.side*c*.01;let h=Pf(Ci((t-1.1)/2.5));if(t>1.1&&this.once("build")&&i.audio.cine("build"),t<this.tBoom?this.reveal.value=this.roadLen*h:this.reveal.value=this.roadLen*(1-Pf(Ci((t-this.tBoom)/3.2))),t>tr-.2&&this.once("go")&&i.audio.cine("launch"),t<this.tEnd){this.placeChamp(t,e);let d=this.driveSpeed(t);i.audio.updateEngine(this.engine,Math.min(2300,d),t>tr?1:0,t>tr-.1,!0,!0)}else if(t<this.tBoom){this.once("fall")&&(this.fallFrom=this.roadEnd.p.clone().addScaledVector(this.roadEnd.U,17),this.fallDir=this.roadEnd.T.clone(),this.fallQuat=this.carQuat.clone(),i.audio.cine("whoosh"));let d=Ci((t-this.tEnd)/this.fallDur),f=Math.pow(d,1.35),m=this.fallFrom,v=Sn.copy(m).addScaledVector(this.fallDir,4200),p=this.bhPos,g=(1-f)*(1-f),x=2*(1-f)*f,M=f*f;this.carPos.set(m.x*g+v.x*x+p.x*M,m.y*g+v.y*x+p.y*M,m.z*g+v.z*x+p.z*M);let y=Qi.set(2*(1-f)*(v.x-m.x)+2*f*(p.x-v.x),2*(1-f)*(v.y-m.y)+2*f*(p.y-v.y),2*(1-f)*(v.z-m.z)+2*f*(p.z-v.z)).normalize();as.setFromUnitVectors(ws.set(0,0,1),y),U0.setFromAxisAngle(ws.set(0,0,1),d*d*9),as.multiply(U0),this.carQuat.copy(this.fallQuat).slerp(as,Cf(0,.5,d));let b=this.carState;b.vel.copy(y).multiplyScalar(Oo),b.boosting=d<.4;let E=this.champ.model;E.update(b,this.carPos,this.carQuat,e);let A=this.carPos.distanceTo(this.bhPos),_=Ci(1-(A-this.bhR)/(this.bhR*3));E.root.scale.set(1-_*.7,1-_*.7,1+_*5),b.boosting&&r.effects.carTrail(b,this.carPos,this.carQuat,e),i.audio.updateEngine(this.engine,2300,0,!1,!1,d<.6)}else if(this.once("boom")){this.champ.model.root.visible=!1,i.audio.updateEngine(this.engine,0,0,!1,!1,!1),i.audio.cine("boom"),this.flash("#fff3e0",.35,.04,.05,.6),this.shake=1.4;let d=Qi.copy(this.bhPos).multiplyScalar(.01),f=r.effects;this.nova=new ot(new vi(1,48,24),new ve({color:new St(2.4,1.5,.8),transparent:!0,blending:Ee,depthWrite:!1,fog:!1})),this.nova.position.copy(d),this.ring=new ot(new qi(1,.025,8,128),new ve({color:new St(a.light).multiplyScalar(5),transparent:!0,blending:Ee,depthWrite:!1,fog:!1})),this.ring.position.copy(d),this.ring.quaternion.copy(this.bh.group.quaternion).multiply(as.setFromAxisAngle(ws.set(1,0,0),Math.PI/2)),this.group.add(this.nova,this.ring);let m=a.flame,v=Math.round(320*f.mult);for(let p=0;p<v;p++)Sn.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).normalize().multiplyScalar(40+Math.random()*160),f.glow.emit(d.x,d.y,d.z,Sn.x,Sn.y,Sn.z,.8+Math.random()*1.4,2+Math.random()*4,.6+Math.random()*1.5,[m[0]*1.6,m[1]*1.6,m[2]*1.6,1],[1.4,.4,.08,0],.6,0)}if(this.nova){let d=(t-this.tBoom)/.9;this.nova.visible=d<1,d<1&&(this.nova.scale.setScalar(this.bhR*.01*(1+1.6*au(d))),this.nova.material.opacity=(1-d)*(1-d));let f=(t-this.tBoom)/1.8;this.ring.visible=f<1,f<1&&(this.ring.scale.setScalar(this.bhR*.01*(2+22*au(f))),this.ring.material.opacity=1-f)}let u=au(Ci((t-this.tBoom)/2.6));this.bhR=lu+(F1-lu)*u,this.bh.group.scale.setScalar(this.bhR*.01),this.bh.u.uI.value=.6+u*.4,this.bh.u.uGlow.value=.6+u*.6,t>this.tSuck&&this.updateSuck(t-this.tSuck),this.updateCamera(t,e),this.bh.update(e,this.camera),r.effects.update(e),i.stadium.update(e),t>this.tSpace-.45&&this.once("toSpace")&&(this.flash("#d6ebff",1,.45,.12,1.1),i.audio.cine("whoosh")),t>this.tSpace&&this.once("space")&&this.enterSpace()}updateSuck(t){let e=this.match,i=this.app;if(this.once("suck")){i.audio.cine("drone"),this.debrisMesh.visible=!0,this.loose=[];for(let c of e.players)c!==this.champ&&this.loose.push({obj:c.model.root,p0:c.model.root.position.clone(),q0:c.model.root.quaternion.clone(),t0:.2+Math.random()*1.2,dur:2.4+Math.random(),axis:new w(Math.random()-.5,1,Math.random()-.5).normalize(),spin:3+Math.random()*4,swirl:2+Math.random()*2,lift:15});this.loose.push({obj:e.ball,p0:e.ball.position.clone(),q0:e.ball.quaternion.clone(),t0:.1,dur:2.6,axis:new w(1,0,0),spin:6,swirl:2.5,lift:20});let l=Qi.copy(this.bhPos).multiplyScalar(.01);this.bStart=this.bMats.map((c,h)=>{let u=new w,d=new he,f=new w;c.decompose(u,d,f);let m=u.distanceTo(l);return{pos:u,quat:d,scl:f,t0:.6+m/900*2.6+Math.random()*.5,dur:2.4+Math.random()*1.2,axis:new w(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),spin:.6+Math.random()*1.6,swirl:1+Math.random()*2,hidden:this.roadBlocked.has(h)}})}let n=this.debrisMesh,r=this._tmp||(this._tmp=new w);for(let l=0;l<this.debris.length;l++){let c=this.debris[l],h=Ci((t-c.t0)/c.dur);if(h<=0||h>=1){n.setMatrixAt(l,Fn.makeScale(0,0,0));continue}let u=this.suckPos(c.p0,h,c.swirl,c.lift,r);as.setFromAxisAngle(c.axis,c.spin*(t-c.t0)),ws.copy(c.size).multiplyScalar(u*Math.min(1,h*8)),n.setMatrixAt(l,Fn.compose(r,as,ws))}n.instanceMatrix.needsUpdate=!0;for(let l of this.loose){let c=Ci((t-l.t0)/l.dur);if(c<=0)continue;let h=this.suckPos(l.p0,c,l.swirl,l.lift,r);l.obj.position.copy(r),as.setFromAxisAngle(l.axis,l.spin*(t-l.t0)*c),l.obj.quaternion.copy(l.q0).premultiply(as),l.obj.scale.setScalar(Math.max(.001,h)),l.obj.visible=c<1}let o=this.cine.buildings;for(let l=0;l<this.bStart.length;l++){let c=this.bStart[l];if(c.hidden)continue;let h=Ci((t-c.t0)/c.dur);if(h<=0)continue;let u=this.suckPos(c.pos,h,c.swirl,0,r);as.setFromAxisAngle(c.axis,c.spin*(t-c.t0)).multiply(c.quat),ws.copy(c.scl).multiplyScalar(u),o.setMatrixAt(l,Fn.compose(r,as,ws))}o.instanceMatrix.needsUpdate=!0;let a=Ci((t-2.4)/2.9);if(a>0){let l=this.cine.arena,c=this.suckPos(ws.set(0,0,0),a,1.2,30,r);l.position.copy(r),l.quaternion.setFromAxisAngle(Qi.set(1,0,.4).normalize(),-this.s*1.4*a*a),l.scale.setScalar(.01*Math.max(.001,c)),l.visible=c>.002;for(let h of this.edges)h.visible=!1;this.once("arenaGo")&&i.audio.cine("tear")}}updateCamera(t,e){let i=this.camera,n=this.s,r=this.camPos,o=this.camLook,a=er,l=!1;if(t<3.7){let u=t/3.7;r.set(430-120*u,200-30*u,n*(300+380*u)).multiplyScalar(.01);let d=Qi.set(0,380,n*6e3),f=this.frameAt(this.groundLen+this.reveal.value,this.camFrame).p,m=Cf(1.2,2.6,t);o.copy(d).lerp(f,m*.85).lerp(this.bhPos,Cf(2.7,3.6,t)*.8).multiplyScalar(.01),l=!this.camInit}else if(t<this.tEnd-.3){this.once("chaseCut")&&(l=!0);let u=this.driveDist(t),d=this.frameAt(u-560,this.camFrame);Qi.copy(d.p).addScaledVector(d.U,200),r.copy(Qi).multiplyScalar(.01),o.copy(this.carPos).addScaledVector(this.frame.T,900).addScaledVector(this.frame.U,60).multiplyScalar(.01),a=this.camUpTarget||(this.camUpTarget=new w),a.copy(d.U)}else if(t<this.tSuck){if(this.once("sideCut")){l=!0;let d=this.roadEnd.p,f=Sn.crossVectors(this.roadEnd.T,er).normalize();this.sidePos=d.clone().lerp(this.bhPos,.45).addScaledVector(f,6800).add(Qi.set(0,1300,0)).addScaledVector(this.roadEnd.T,-1800),this.sideLook=d.clone().lerp(this.bhPos,.55)}let u=Ci((t-this.tEnd+.3)/(this.tBoom-this.tEnd+.3));r.copy(this.sidePos).lerp(this.sideLook,u*.25),r.addScaledVector(Qi.subVectors(this.sidePos,this.sideLook),1.2*au(Ci((t-this.tBoom)/.55))),r.multiplyScalar(.01),o.copy(this.sideLook).multiplyScalar(.01)}else{this.once("wideCut")&&(l=!0);let u=Ci((t-this.tSuck)/(this.tSpace-this.tSuck)),d=Sn.set(0,90,n*170),f=Qi.set(-560,420,n*-260);r.copy(f).sub(d).multiplyScalar(1+1.2*u*u).add(d),r.y+=300*u*u,o.copy(d).lerp(Sn.set(0,140,n*300),u)}l||!this.camInit?(this.camInit=!0,this.camUp.copy(a)):this.camUp.lerp(a,1-Math.exp(-e*6)).normalize(),this.shake=Math.max(0,this.shake-e*.9);let c=t>this.tSuck?.25+.35*Ci((t-this.tSuck)/4):0,h=Math.max(this.shake,c);if(i.position.copy(r),h>0){let u=.006*h*r.distanceTo(o);i.position.x+=(Math.random()-.5)*u,i.position.y+=(Math.random()-.5)*u,i.position.z+=(Math.random()-.5)*u}i.up.copy(this.camUp),i.lookAt(o)}enterSpace(){let t=this.app;this.stage=2,this.hideStadiumBits(),t.audio.stopEngine(this.engine);let e={flash:(i,n,r,o,a)=>this.flash(i,n,r,o,a),text:()=>this.caption(`${this.team===0?"BLUE":"ORANGE"} WINS!`,"...and blew up the universe","final "+(this.team===0?"blue":"orange")),sound:i=>t.audio.cine(i),shake:i=>{this.space.shakeAmt=Math.max(this.space.shakeAmt,i)}};this.space=new ou(t.gfx.renderer,this.quality,e),this.view.camera=this.space.camera,this.view.hfov=80,t.gfx.overrideScene=this.space.scene,t.gfx.setViews([this.view]),t.audio.cine("space")}updateSpace(t,e){let i=this.space;i.update(e);let n=80*(i.fov/55);Math.abs(n-this.view.hfov)>.5&&(this.view.hfov=n,this.app.gfx.updateCameras()),i.done&&this.finish(!1)}hideStadiumBits(){this.debrisMesh.visible=!1;for(let t of this.edges)t.visible=!1}finish(t){if(this.done)return;this.done=!0,this.app.audio.cine("stop"),this.restore(),this.overlay.classList.add("out"),this.fill.style.transition=`opacity ${t?.35:1.2}s ease`,this.fill.style.background="#fff",this.fill.style.opacity=t?"0.6":"1",requestAnimationFrame(()=>{this.fill.style.opacity="0"});let e=this.overlay;setTimeout(()=>e.remove(),t?600:1800),this.textEl.className="cine-text"}restore(){let t=this.app,e=this.match;this.bloomWas&&t.gfx.bloom&&Object.assign(t.gfx.bloom,this.bloomWas),t.gfx.overrideScene=null,this.space&&(this.space.dispose(),this.space=null),this.cine.reset();let i=this.cine.buildings;this.bMats.forEach((n,r)=>i.setMatrixAt(r,n)),i.instanceMatrix.needsUpdate=!0;for(let n of this.edges)n.parent.remove(n),n.traverse(r=>{r.geometry&&r.geometry.dispose()});this.edgeMat.dispose();for(let n of e.players)n.model.root.scale.setScalar(1),n.model.root.visible=!0;e.ball.scale.setScalar(1),e.ball.visible=this.ballWasVisible,e.effects.clear(),this.group.parent.remove(this.group),this.group.traverse(n=>{if(n.geometry&&n.geometry.dispose(),n.material){let r=Array.isArray(n.material)?n.material:[n.material];for(let o of r)o.map&&o.map.dispose(),o.emissiveMap&&o.emissiveMap.dispose(),o.dispose()}}),this.bh.dispose(),t.audio.stopEngine(this.engine)}dispose(){this.done||(this.done=!0,this.app.audio.cine("stop"),this.restore()),this.overlay.remove()}};var H1=["Atlas","Blitz","Comet","Dash","Echo","Flare","Ghost","Havoc","Jinx","Nova","Rex","Zippy","Vortex","Turbo"],z1=6,Ml=60,Ho=null;function k1(){Ho||(Ho=f0(1024));let s=new Zt({map:Ho.map,emissive:16777215,emissiveMap:Ho.emissiveMap,emissiveIntensity:2.4,roughness:1,roughnessMap:Ho.roughnessMap,metalness:.65,bumpMap:Ho.bumpMap,bumpScale:1.2}),t=new ot(new vi(De.radius*.01,64,40),s);return t.castShadow=!0,t}var Bn=new w,On=new he,Hn=new w,zo=new he;function V1(s){return!s||s.type==="any"?"RB / F":s.type==="pad"?"RB":s.layout==="p2"?"H":"F"}function Lf(s){for(let t=s.length-1;t>0;t--){let e=Math.floor(Math.random()*(t+1));[s[t],s[e]]=[s[e],s[t]]}return s}var bl=class s{constructor(t,e){this.app=t,this.cfg=e,this.attract=e.mode==="attract",this.world=new zh,this.group=new _e,t.gfx.scene.add(this.group),this.effects=new tu(this.group,t.settings.quality),this.tireMarks=new _l(this.group,t.settings.quality==="low"?900:2400,t.settings.quality==="high"?.075:.02),this.ball=k1(),this.group.add(this.ball),t.settings.quality==="low"&&(this.ballBlob=this.addBlob(1.7,1.7)),this.players=[];let i=Lf(H1.slice()),n=Lf([7,9,11,17,21,24,33,42,55,73,88,99]);for(let a of[0,1]){let l=e.humans.filter(c=>c.team===a);for(let c=0;c<e.teamSize;c++){let h=l[c],u=this.world.addCar(new Wh(a,h?h.name:i.pop()));u.handling=t.settings.handling==="realistic"?"realistic":"easy";let d=new jh(a,n.pop(),t.settings.quality);this.group.add(d.root),t.settings.quality==="low"&&(d.blob=this.addBlob(1.6,2.2));let f={car:u,model:d,human:!!h,device:h?h.device:null,bot:h?null:new Xh(u,e.difficulty),name:u.name};this.players.push(f)}}this.humans=this.players.filter(a=>a.human),this.gameMode=e.gameMode||"soccar";let r=!e.items||e.items==="all"?_o:[e.items];this.world.mode=Wm(this.world,this.gameMode,r),this.modeFx=this.world.mode?new eu(this.group,this.effects,this.world.mode):null,t.input.rbIsItem=this.gameMode==="rumble",this.views=[];let o=this.humans.length;if(this.attract||o===0){let a=new ei(60,1,.1,3e3);this.views.push({camera:a,rect:[0,0,1,1],hfov:90,rig:new Do(a)})}else this.humans.forEach((a,l)=>{let c=new ei(70,1,.05,3e3),h=[0,0,1,1];o===2&&(h=e.split==="vertical"?[l*.5,0,.5,1]:[0,l*.5,1,.5]);let u=new Do(c);u.ballCam=t.settings.ballCam,o===2&&e.split!=="vertical"&&(u.distance=310,u.height=120);let d={camera:c,rect:h,hfov:t.settings.fov,rig:u,player:a,label:a.name,team:a.car.team};a.view=d,a.viewIndex=l,this.views.push(d)});this.replayCam=new ei(55,1,.1,3e3),this.replayRig=new Do(this.replayCam),this.replayView={camera:this.replayCam,rect:[0,0,1,1],hfov:80},t.gfx.setViews(this.views),this.attract?this.engines=[]:(t.hud.setup(this.views),t.hud.show(!0),this.engines=this.humans.map((a,l)=>t.audio.createEngine(o===2&&e.split==="vertical"?l===0?-.5:.5:0))),this.scores=[0,0],this.clock=e.duration||0,this.unlimited=!e.duration,this.overtime=!1,this.state="countdown",this.stateT=0,this.acc=0,this.pred=[],this.predFrame=0,this.threat=-1,this.frame=0,this.time=0,this.snapSize=9+13*this.players.length,this.snapCount=z1*Ml,this.snaps=new Float32Array(this.snapSize*this.snapCount),this.snapHead=0,this.snapFilled=0,this.stepIndex=0,this.fakeCars=this.players.map(a=>({team:a.car.team,vel:new w,boosting:!1,supersonic:!1,demolished:!1,steerVisual:0,wheelSpin:0,wheelDist:[17,17,17,17],onGround:!0})),this.kickoff()}addBlob(t,e){if(!s.blobTex){let n=document.createElement("canvas");n.width=n.height=64;let r=n.getContext("2d"),o=r.createRadialGradient(32,32,0,32,32,32);o.addColorStop(0,"rgba(0,0,0,0.55)"),o.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=o,r.fillRect(0,0,64,64),s.blobTex=new ri(n)}let i=new ot(new oi(t,e),new ve({map:s.blobTex,transparent:!0,depthWrite:!1}));return i.rotation.x=-Math.PI/2,i.renderOrder=1,this.group.add(i),i}placeBlob(t,e,i,n){if(!t)return;let r=e.y-n;t.visible=r<600,t.position.set(e.x*.01,.03,e.z*.01);let o=Math.max(.4,1-r/800);t.scale.setScalar(o),t.material.opacity=o,i&&(t.rotation.z=Math.atan2(2*(i.w*i.y+i.x*i.z),1-2*(i.y*i.y+i.z*i.z)))}dispose(){this.cine&&(this.cine.dispose(),this.cine=null),this.app.gfx.scene.remove(this.group),this.group.traverse(t=>{if(t.geometry&&!t.geometry.userData.shared&&t.geometry.dispose(),t.material&&t.material!==this.ball.material){let e=Array.isArray(t.material)?t.material:[t.material];for(let i of e)i.dispose()}}),this.app.audio.stopEngines(),this.app.input.rbIsItem=!1}kickoff(){let t=this.world;t.ball.reset(),t.resetPads(),this.ball.visible=!0;let e=Lf([0,1,2,3,4]);for(let i of[0,1]){let n=this.players.filter(o=>o.car.team===i),r=i===0?1:-1;n.forEach((o,a)=>{let l=Om[e[a%5]];o.car.place(l[0]*r,l[1]*r,i===0?l[2]:l[2]+Math.PI),o.car.frozen=!0,o.car.input.jump=!1,o.car.prevJump=!1})}for(let i of this.views)i.rig&&i.rig.snap();this.world.mode&&this.world.mode.reset(),this.state="countdown",this.stateT=this.attract?1.2:3,this.lastBeep=4,this.threat=-1,this.acc=0,this.attract||this.app.hud.hideBanner()}startPlay(){this.state="playing";for(let t of this.players)t.car.frozen=!1;this.world.ball.frozen=!1,this.attract||(this.app.hud.showBanner("GO!","","go",.8),this.app.audio.beep(!0))}scored(t){let e=1-t,n=this.world.ball;this.scores[e]++;let r=n.lastTouch,o=n.prevTouch,a=r&&r.team===e?r:o&&o.team===e?o:null,l=a&&o&&o!==a&&o.team===e&&r===a?o:null;a&&(a.stats.goals++,a.stats.score+=100),l&&(l.stats.assists++,l.stats.score+=50);let c=n.pos.clone();this.goalTime=this.time,this.goalTeam=e,this.goalOf=t,this.effects.explosion(c,e,!0),this.app.stadium.goalFlash(t),this.app.stadium.cheer(1);for(let h of this.players){let u=h.car;if(u.demolished)continue;let d=u.pos.distanceTo(c);if(d<2600){let f=u.pos.clone().sub(c).setY(0).normalize().multiplyScalar((1-d/2600)*1800);u.vel.add(f),u.vel.y+=(1-d/2600)*700,u.noGround=.15,u.onGround=!1}}n.frozen=!0,n.vel.set(0,0,0),this.ball.visible=!1;for(let h of this.views)h.rig&&h.rig.addShake(1);if(!this.attract){this.app.audio.goal();for(let d of this.humans)this.app.input.rumble(d.device,1,1,700);let h=Ie[e],u=a?a.name:e===0?"Blue":"Orange";this.app.hud.showBanner("GOAL!",a?`${u} scored${l?" \u2022 assist: "+l.name:""}`:"Own goal",e===0?"blue":"orange",2.6),this.app.hud.addFeed(`<b style="color:${h.css}">${u}</b> scored!`,e)}this.state="goal",this.stateT=2.8,this.endAfterGoal=this.overtime||!this.unlimited&&this.clock<=0}startReplay(){if(this.attract||this.snapFilled<Ml*2||!this.app.settings.replays){this.afterReplay();return}this.state="replay";let t=this.snapFilled/Ml,e=this.time-this.goalTime;this.replayEnd=Math.max(0,e-.35),this.replayStart=Math.min(t-.05,e+4.2),this.replayT=this.replayStart,this.replayExploded=!1,this.app.gfx.setViews([this.replayView]),this.replayRig.snap(),this.app.hud.setup([]),this.app.hud.showBanner("REPLAY","Press A / Space to skip","replay",99),this.ball.visible=!0,this.effects.clear()}afterReplay(){if(this.state==="replay"&&(this.app.gfx.setViews(this.views),this.app.hud.setup(this.views),this.app.hud.hideBanner()),this.endAfterGoal){this.finish();return}this.kickoff()}finish(){this.state="over",this.stateT=3;for(let i of this.players)i.car.frozen=!0,i.car.boosting=!1;this.world.ball.frozen=!0;let t=this.scores[0]>this.scores[1]?0:1;this.winner=t,this.app.audio.horn(),this.app.stadium.cheer(.8),this.app.hud.showBanner(t===0?"BLUE WINS!":"ORANGE WINS!",`${this.scores[0]} - ${this.scores[1]}`,t===0?"blue":"orange",99);let e=this.humans.filter(i=>i.car.team===t).sort((i,n)=>n.car.stats.score-i.car.stats.score)[0];e&&this.app.settings.victoryFx!==!1&&(this.app.hud.hideBanner(),this.effects.clear(),this.state="victory",this.cine=new hu(this,e,t))}endVictory(){this.cine&&(this.cine.dispose(),this.cine=null),this.app.gfx.setViews(this.views),this.app.hud.setup(this.views),this.app.hud.show(!0),this.app.hud.showBanner(this.winner===0?"BLUE WINS!":"ORANGE WINS!",`${this.scores[0]} - ${this.scores[1]}`,this.winner===0?"blue":"orange",99),this.state="over",this.stateT=0}results(){let t=this.players.map(i=>({name:i.name,team:i.car.team,human:i.human,...i.car.stats}));t.sort((i,n)=>n.score-i.score);let e=t.filter(i=>i.team===this.winner).sort((i,n)=>n.score-i.score)[0];return{scores:this.scores.slice(),winner:this.winner,rows:t,mvp:e?e.name:""}}update(t){t=Math.min(t,.1),this.time+=t,this.frame++;let e=this.app,i=e.input,n=!1;for(let o of this.humans){let a=i.controls(o.device);if(o.controls=a,a.pause&&this.state==="victory")n=!0;else if(a.pause&&this.state!=="over"&&e.frames!==e.resumeFrame){e.pauseMatch(o);return}a.skip&&(n=!0),a.ballCam&&o.view&&(o.view.rig.ballCam=!o.view.rig.ballCam,e.hud.viewStatus(o.viewIndex,o.view.rig.ballCam?"BALL CAM":"CAR CAM"));let l=o.car.input;l.throttle=a.throttle,l.pitch=a.pitch,l.yaw=a.yaw,l.roll=a.roll,l.jump=a.jump,l.boost=a.boost,l.powerslide=a.powerslide,l.steer=this.shapeSteer(o,a,t),l.useItem=!!a.itemDown}if(this.state==="victory"){this.cine.update(t,n)||this.endVictory();return}(this.frame%3===0||this.pred.length===0)&&(lf(this.world.ball,3.5,1/60,this.pred),this.threat=this.goalIn(this.pred));let r=this.world.ball.lastTouch===null&&this.state==="playing";for(let o of this.players)o.bot&&o.bot.update(t,{world:this.world,pred:this.pred,time:this.world.time,kickoff:r,rumble:this.gameMode==="rumble"?this.world.mode:null,teammates:this.players.filter(a=>a.car.team===o.car.team).map(a=>a.car),opponents:this.players.filter(a=>a.car.team!==o.car.team).map(a=>a.car)});switch(this.state){case"countdown":{this.stateT-=t;let o=Math.ceil(this.stateT);!this.attract&&o<this.lastBeep&&o>0&&(this.lastBeep=o,e.hud.showBanner(String(o),this.overtime?"OVERTIME":"","count",1),e.audio.beep(!1)),this.stateT<=0&&this.startPlay();break}case"playing":this.unlimited||(this.overtime?this.clock+=t:this.clock>0&&(this.clock=Math.max(0,this.clock-t)));break;case"goal":this.stateT-=t,this.stateT<=0&&this.startReplay();break;case"replay":this.replayT-=t,(n||this.replayT<=this.replayEnd)&&this.afterReplay();break;case"over":this.stateT-=t,this.stateT<=0&&!this.resultsShown&&(this.resultsShown=!0,e.showResults(this.results()));break;default:break}if(this.state==="replay"){this.renderReplay(t);return}{this.acc+=t;let o=0;for(;this.acc>=cl&&o<12;)if(this.world.step(cl),this.acc-=cl,o++,this.stepIndex++%(120/Ml)===0&&this.recordSnap(),this.state==="playing"){let a=this.world.ball.goalState();if(a>=0){this.scored(a);break}}o>=12&&(this.acc=0)}if(this.state==="playing"&&!this.unlimited&&!this.overtime&&this.clock<=0){let o=this.world.ball;(o.pos.y<De.radius+25||o.frozen)&&(this.scores[0]===this.scores[1]?(this.overtime=!0,this.clock=0,e.hud.showBanner("OVERTIME","Next goal wins","ot",2.5),e.audio.horn(),this.kickoff(),this.stateT=4):this.finish())}this.processEvents(),this.renderFrame(t)}shapeSteer(t,e,i){let n=e.steer;if(this.app.settings.handling==="realistic")return t.steerS=n,n;if(e.digitalSteer){let r=t.steerS||0,a=Math.sign(n)!==Math.sign(r)||Math.abs(n)<Math.abs(r)?14:6;t.steerS=r+Math.max(-a*i,Math.min(a*i,n-r))}else t.steerS=Math.sign(n)*Math.pow(Math.abs(n),1.5);return t.steerS}clockText(){if(this.unlimited)return"\u221E";let t=Math.max(0,this.overtime?Math.floor(this.clock):Math.ceil(this.clock));return`${this.overtime?"+":""}${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}goalIn(t){for(let e of t)if(Math.abs(e.pos.x)<Ft.goalHalfW&&e.pos.y<Ft.goalH){if(e.pos.z>Ft.halfZ+De.radius)return 1;if(e.pos.z<-Ft.halfZ-De.radius)return 0}return-1}processEvents(){let t=this.app,e=this.world.events,i=this.humans.map(r=>r.car),n=r=>{if(!r||i.length===0)return .6;let o=1/0;for(let a of i)o=Math.min(o,a.pos.distanceTo(r));return Math.max(.15,1-o/7e3)};for(let r of e){let o=r.car?this.humans.find(a=>a.car===r.car):null;switch(r.type){case"ballHit":r.strength>350&&this.effects.hit(r.point,r.strength),this.attract||(r.strength>250&&t.audio.hit(r.strength*n(r.point)),o&&(t.input.rumble(o.device,Math.min(1,r.strength/2500),.4,120),r.strength>1500&&o.view.rig.addShake(Math.min(.45,r.strength/7e3))),this.onTouch(r.car,o));break;case"bounce":!this.attract&&r.strength>400&&t.audio.bounce(r.strength*n(r.point));break;case"jump":o&&t.audio.jump();break;case"dodge":o&&t.audio.dodge();break;case"land":o&&(t.audio.land(r.strength),t.input.rumble(o.device,.15,.2,60));break;case"bump":if(!this.attract){t.audio.bump();let a=this.humans.find(l=>l.car===r.by);o&&t.input.rumble(o.device,.7,.5,200),a&&t.input.rumble(a.device,.4,.3,120)}break;case"demo":if(this.effects.demolition(r.point,r.car.team),r.by.stats.score+=25,!this.attract){t.audio.demo();for(let l of this.humans){let c=l.car.pos.distanceTo(r.point);c<3e3&&l.view&&l.view.rig.addShake(l.car===r.car||l.car===r.by?.9:.6*(1-c/3e3))}t.hud.addFeed(`<b style="color:${Ie[r.by.team].css}">${r.by.name}</b> \u{1F4A5} <b style="color:${Ie[r.car.team].css}">${r.car.name}</b>`),o&&(t.input.rumble(o.device,1,1,450),t.hud.viewCenter(o.viewIndex,"DEMOLISHED",2.8));let a=this.humans.find(l=>l.car===r.by);a&&(t.input.rumble(a.device,.6,.6,200),t.hud.viewCenter(a.viewIndex,"DEMOLITION!",1.5))}break;case"itemGet":o&&(t.audio.itemGet(),t.input.rumble(o.device,.15,.3,90));break;case"itemUse":this.attract||t.audio.itemUse(r.item,n(r.car.pos)),r.item==="freezer"&&this.effects.flash(this.ball.position.clone(),10477823,2.6,.35,2.5),r.item==="curveball"&&this.effects.ring(this.ball.position.clone(),Ie[r.car.team].light,5,.5);break;case"itemFail":o&&t.hud.viewStatus(o.viewIndex,r.item==="boot"?"NO OPPONENT IN RANGE":"BALL OUT OF RANGE",1.2);break;case"hooked":this.attract||t.audio.hook(n(r.point));break;case"boot":this.effects.flash(r.point.clone().multiplyScalar(.01),16765056,2.2,.3,2.5),this.effects.hit(r.point,2600),this.attract||(t.audio.bump(),t.hud.addFeed(`<b style="color:${Ie[r.by.team].css}">${r.by.name}</b> \u{1F462} <b style="color:${Ie[r.car.team].css}">${r.car.name}</b>`),o&&(t.input.rumble(o.device,.9,.7,300),t.hud.viewCenter(o.viewIndex,"BOOTED!",1.4)));break;case"heatseekFlip":this.effects.hit(r.point,2200);break;case"boostPickup":this.effects.boostPickup(r.pad),o&&(t.audio.boostPickup(r.big),r.big&&t.input.rumble(o.device,.1,.3,80));break;default:break}}e.length=0}onTouch(t,e){if(this.state!=="playing"||this.world.time-(t.lastShotCheck||-10)<.4)return;t.lastShotCheck=this.world.time;let i=this.threat,n=this._shotBuf||(this._shotBuf=[]);lf(this.world.ball,3,1/40,n);let r=this.goalIn(n);this.threat=r,i===t.team&&r!==t.team&&(t.stats.saves++,t.stats.score+=50,this.app.hud.addFeed(`<b style="color:${Ie[t.team].css}">${t.name}</b> made a save!`),e&&this.app.hud.viewCenter(e.viewIndex,"SAVE!",1.5)),r===1-t.team&&i!==r&&(t.stats.shots++,t.stats.score+=20,this.app.audio.cheer(.35),e&&this.app.hud.viewCenter(e.viewIndex,"SHOT ON GOAL",1.2))}recordSnap(){let t=this.snapHead*this.snapSize,e=this.snaps,i=this.world.ball;e[t]=this.time,e[t+1]=i.pos.x,e[t+2]=i.pos.y,e[t+3]=i.pos.z,e[t+4]=i.quat.x,e[t+5]=i.quat.y,e[t+6]=i.quat.z,e[t+7]=i.quat.w,e[t+8]=this.ball.visible?1:0;let n=t+9;for(let r of this.players){let o=r.car;e[n]=o.pos.x,e[n+1]=o.pos.y,e[n+2]=o.pos.z,e[n+3]=o.quat.x,e[n+4]=o.quat.y,e[n+5]=o.quat.z,e[n+6]=o.quat.w,e[n+7]=o.vel.x,e[n+8]=o.vel.y,e[n+9]=o.vel.z,e[n+10]=(o.boosting?1:0)|(o.supersonic?2:0)|(o.demolished?4:0)|(o.onGround?8:0),e[n+11]=o.steerVisual,e[n+12]=o.wheelSpin,n+=13}this.snapHead=(this.snapHead+1)%this.snapCount,this.snapFilled=Math.min(this.snapCount,this.snapFilled+1)}snapAt(t){let e=Math.min(this.snapFilled-1,Math.max(0,t*Ml)),i=Math.floor(e),n=e-i,r=(this.snapHead-1-i+this.snapCount*2)%this.snapCount,o=(r-1+this.snapCount)%this.snapCount;return{a:r*this.snapSize,b:o*this.snapSize,t:n}}renderReplay(t){let{a:e,b:i,t:n}=this.snapAt(this.replayT),r=this.snaps,o=l=>r[e+l]+(r[i+l]-r[e+l])*n;Hn.set(o(1),o(2),o(3)),zo.set(r[e+4],r[e+5],r[e+6],r[e+7]),this.ball.position.copy(Hn).multiplyScalar(.01),this.ball.quaternion.copy(zo),this.ball.visible=r[e+8]>.5;let a=9;this.players.forEach((l,c)=>{let h=this.fakeCars[c];Bn.set(o(a),o(a+1),o(a+2)),On.set(r[e+a+3],r[e+a+4],r[e+a+5],r[e+a+6]),zo.set(r[i+a+3],r[i+a+4],r[i+a+5],r[i+a+6]),On.slerp(zo,n),h.vel.set(r[e+a+7],r[e+a+8],r[e+a+9]);let u=r[e+a+10];h.boosting=!!(u&1),h.supersonic=!!(u&2),h.demolished=!!(u&4),h.steerVisual=r[e+a+11],h.wheelSpin=r[e+a+12],l.model.update(h,Bn,On,t),this.effects.carTrail(h,Bn,On,t),a+=13}),!this.replayExploded&&this.ball.visible===!1&&(this.replayExploded=!0,this.effects.explosion(Hn,this.goalTeam,!0)),this.replayRig.updateReplay(t,Hn,this.goalOf===1?Ft.halfZ:-Ft.halfZ,this.replayT),this.effects.update(t),this.app.stadium.update(t),this.app.hud.update(t),this.app.gfx.render()}renderFrame(t){let e=this.app,i=this.acc/cl,n=this.world.ball;Hn.lerpVectors(n.prevPos,n.pos,i),zo.slerpQuaternions(n.prevQuat,n.quat,i),this.ball.position.copy(Hn).multiplyScalar(.01),this.ball.quaternion.copy(zo),this.ball.visible&&this.effects.ballTrail(n,Hn),this.placeBlob(this.ballBlob,Hn,null,De.radius),this.ballBlob&&(this.ballBlob.visible=this.ballBlob.visible&&this.ball.visible);let r=[];for(let a of this.players){let l=a.car;Bn.lerpVectors(l.prevPos,l.pos,i),On.slerpQuaternions(l.prevQuat,l.quat,i),a.ipos=(a.ipos||new w).copy(Bn),a.iquat=(a.iquat||new he).copy(On),a.model.update(l,Bn,On,t),this.placeBlob(a.model.blob,Bn,On,17);let c=this.state==="replay"?0:_l.skid(l);this.tireMarks.update(l,Bn,On,c),this.effects.dirt(l,Bn,On,c,t),a.model.blob&&(a.model.blob.visible=a.model.blob.visible&&!l.demolished),this.effects.carTrail(l,Bn,On,t),r.push({car:l,pos:a.ipos,name:a.name})}if(this.attract){let a=this.views[0],l=this.time*.05,c=a.camera,h=62;c.position.set(Math.cos(l)*h*.62,13+Math.sin(l*.7)*4,Math.sin(l)*h*.8),c.up.set(0,1,0);let u=Bn.copy(Hn).multiplyScalar(.01*.6);c.lookAt(u.x,2,u.z)}else{for(let a of this.humans){let l=a.view,c=a.controls||{};l.rig.update(t,a.car,a.ipos,a.iquat,this.ball.visible?Hn:null,c.lookX||0,c.lookY||0),e.hud.setBoost(a.viewIndex,a.car.boost),this.gameMode==="rumble"&&e.hud.setItem(a.viewIndex,this.world.mode.status(a.car),hl,V1(a.device)),e.hud.updatePlates(a.viewIndex,l.camera,r,a.car)}this.humans.forEach((a,l)=>{let c=a.car;e.audio.updateEngine(this.engines[l],c.vel.length(),c.input.throttle,c.boosting,c.onGround,!c.demolished&&!c.frozen)}),e.hud.setScore(this.scores[0],this.scores[1]),e.hud.setClock(this.clock,this.overtime,this.unlimited),e.hud.update(t)}this.modeFx&&this.modeFx.update(t,this.players,this.ball,Hn),this.tireMarks.flush();let o=this.state==="goal";o&&this.stateT>1.2&&this.effects.pyro(e.stadium.pyroPoints[this.goalOf],this.goalTeam,t),e.stadium.setScreens(this.scores[0],this.scores[1],this.clockText(),o?this.goalTeam===0?"blue":"orange":null),this.effects.update(t),e.stadium.update(t),e.gfx.render()}renderPaused(){this.app.gfx.render()}};var ko={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var hn=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},G1=new jn(-1,1,1,-1,0,1),Df=class extends le{constructor(){super(),this.setAttribute("position",new Kt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Kt([0,2,0,0,2,0],2))}},W1=new Df,ir=class{constructor(t){this._mesh=new ot(W1,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,G1)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var uu=class extends hn{constructor(t,e="tDiffuse"){super(),this.textureID=e,this.uniforms=null,this.material=null,t instanceof fe?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=Ms.clone(t.uniforms),this.material=new fe({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new ir(this.material)}render(t,e,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Sl=class extends hn{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,i){let n=t.getContext(),r=t.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let o,a;this.inverse?(o=0,a=1):(o=1,a=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(n.REPLACE,n.REPLACE,n.REPLACE),r.buffers.stencil.setFunc(n.ALWAYS,o,4294967295),r.buffers.stencil.setClear(a),r.buffers.stencil.setLocked(!0),t.setRenderTarget(i),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(n.EQUAL,1,4294967295),r.buffers.stencil.setOp(n.KEEP,n.KEEP,n.KEEP),r.buffers.stencil.setLocked(!0)}},du=class extends hn{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var fu=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let i=t.getSize(new j);this._width=i.width,this._height=i.height,e=new Qe(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:hi}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new uu(ko),this.copyPass.material.blending=pn,this.timer=new qa}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){this.timer.update(),t===void 0&&(t=this.timer.getDelta());let e=this.renderer.getRenderTarget(),i=!1;for(let n=0,r=this.passes.length;n<r;n++){let o=this.passes[n];if(o.enabled!==!1){if(o.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(n),o.render(this.renderer,this.writeBuffer,this.readBuffer,t,i),o.needsSwap){if(i){let a=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(a.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),l.setFunc(a.EQUAL,1,4294967295)}this.swapBuffers()}Sl!==void 0&&(o instanceof Sl?i=!0:o instanceof du&&(i=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new j);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let i=this._width*this._pixelRatio,n=this._height*this._pixelRatio;this.renderTarget1.setSize(i,n),this.renderTarget2.setSize(i,n);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(i,n)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var O0={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new St(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var Vo=class s extends hn{constructor(t,e=1,i,n){super(),this.strength=e,this.radius=i,this.threshold=n,this.resolution=t!==void 0?new j(t.x,t.y):new j(256,256),this.clearColor=new St(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);this.renderTargetBright=new Qe(r,o,{type:hi,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new Qe(r,o,{type:hi,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let d=new Qe(r,o,{type:hi,depthBuffer:!1});d.texture.name="UnrealBloomPass.v"+h,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),o=Math.round(o/2)}let a=O0;this.highPassUniforms=Ms.clone(a.uniforms),this.highPassUniforms.luminosityThreshold.value=n,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new fe({uniforms:this.highPassUniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),o=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new j(1/r,1/o),r=Math.round(r/2),o=Math.round(o/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new w(1,1,1),new w(1,1,1),new w(1,1,1),new w(1,1,1),new w(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Ms.clone(ko.uniforms),this.blendMaterial=new fe({uniforms:this.copyUniforms,vertexShader:ko.vertexShader,fragmentShader:ko.fragmentShader,premultipliedAlpha:!0,blending:Ee,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new St,this._oldClearAlpha=1,this._basic=new ve,this._fsQuad=new ir(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(t,e){let i=Math.round(t/2),n=Math.round(e/2);this.renderTargetBright.setSize(i,n);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(i,n),this.renderTargetsVertical[r].setSize(i,n),this.separableBlurMaterials[r].uniforms.invSize.value=new j(1/i,1/n),i=Math.round(i/2),n=Math.round(n/2)}render(t,e,i,n,r){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),r&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let a=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=a.texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[l]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=s.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[l]),t.clear(),this._fsQuad.render(t),a=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(i),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(t){let e=[],i=t/3;for(let o=0;o<t;o++)e.push(.39894*Math.exp(-.5*o*o/(i*i))/i);let n=[],r=[];for(let o=1;o<t;o+=2){let a=e[o],l=o+1<t?e[o+1]:0,c=a+l;n.push((o*a+(o+1)*l)/c),r.push(c)}return new fe({defines:{KERNEL_PAIRS:n.length},uniforms:{colorTexture:{value:null},invSize:{value:new j(.5,.5)},direction:{value:new j(.5,.5)},centerWeight:{value:e[0]},gaussianOffsets:{value:n},gaussianWeights:{value:r}},vertexShader:`

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

				}`})}};Vo.BlurDirectionX=new j(1,0);Vo.BlurDirectionY=new j(0,1);var El={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};var pu=class extends hn{constructor(){super(),this.isOutputPass=!0,this.uniforms=Ms.clone(El.uniforms),this.material=new co({name:El.name,uniforms:this.uniforms,vertexShader:El.vertexShader,fragmentShader:El.fragmentShader}),this._fsQuad=new ir(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},ye.getTransfer(this._outputColorSpace)===Ce&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Xa?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Ya?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Za?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===pr?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Ja?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Ka?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===$a&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Nf=class extends hn{constructor(t){super(),this.owner=t,this.needsSwap=!1}render(t,e,i){let n=this.renderToScreen?null:i;this.owner.renderViews(n)}},mu=class{constructor(t,e){this.quality=e,this.container=t;let i=new Ph({antialias:e!=="low",powerPreference:"high-performance",stencil:!1});if(i.toneMapping=pr,i.toneMappingExposure=1,i.outputColorSpace=ze,i.shadowMap.enabled=e!=="low",i.shadowMap.type=dr,i.autoClear=!1,i.localClippingEnabled=!0,t.appendChild(i.domElement),this.renderer=i,this.scene=new Zn,this.overrideScene=null,this.views=[],this.pixelRatio=Math.min(window.devicePixelRatio||1,e==="high"?1.75:e==="medium"?1.25:1),i.setPixelRatio(this.pixelRatio),e!=="low"){let n=new Qe(1,1,{type:hi,samples:e==="high"?4:0});this.composer=new fu(i,n),this.composer.addPass(new Nf(this)),this.bloom=new Vo(new j(256,256),.5,.35,.92),this.composer.addPass(this.bloom),this.composer.addPass(new pu)}this.resize(),this.onResize=()=>this.resize(),window.addEventListener("resize",this.onResize)}setExposure(t){this.renderer.toneMappingExposure=t}setViews(t){this.views=t,this.updateCameras()}resize(){let t=window.innerWidth,e=window.innerHeight;this.width=t,this.height=e,this.renderer.setSize(t,e),this.composer&&(this.composer.setPixelRatio(this.pixelRatio),this.composer.setSize(t,e)),this.updateCameras()}updateCameras(){for(let t of this.views){let e=t.rect[2]*this.width/Math.max(1,t.rect[3]*this.height),i=we.degToRad(t.hfov||100),n=we.radToDeg(2*Math.atan(Math.tan(i/2)/e));n=we.clamp(n,47,78),t.camera.fov=n,t.camera.aspect=e,t.camera.updateProjectionMatrix()}}renderViews(t){let e=this.renderer;e.setRenderTarget(t),e.setClearColor(0,1),e.clear(!0,!0,!1);let i=t?t.width:this.width*this.pixelRatio,n=t?t.height:this.height*this.pixelRatio,r=t?1:1/this.pixelRatio;for(let o of this.views){let a=Math.round(o.rect[0]*i),l=Math.round(o.rect[2]*i),c=Math.round(o.rect[3]*n),h=Math.round((1-o.rect[1]-o.rect[3])*n);t?(t.viewport.set(a,h,l,c),t.scissor.set(a,h,l,c),t.scissorTest=!0,e.setRenderTarget(t)):(e.setViewport(a*r,h*r,l*r,c*r),e.setScissor(a*r,h*r,l*r,c*r),e.setScissorTest(!0)),e.render(this.overrideScene||this.scene,o.camera)}t?(t.viewport.set(0,0,t.width,t.height),t.scissor.set(0,0,t.width,t.height),t.scissorTest=!1,e.setRenderTarget(t)):(e.setViewport(0,0,this.width,this.height),e.setScissorTest(!1))}render(){this.composer?this.composer.render():this.renderViews(null)}dispose(){window.removeEventListener("resize",this.onResize),this.composer&&this.composer.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}};function z0(s,t=!1){let e=s[0].index!==null,i=new Set(Object.keys(s[0].attributes)),n=new Set(Object.keys(s[0].morphAttributes)),r={},o={},a=s[0].morphTargetsRelative,l=new le,c=0;for(let h=0;h<s.length;++h){let u=s[h],d=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in u.attributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),d++}if(d!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in u.morphAttributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(t){let f;if(e)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(e){let h=0,u=[];for(let d=0;d<s.length;++d){let f=s[d].index;for(let m=0;m<f.count;++m)u.push(f.getX(m)+h);h+=s[d].attributes.position.count}l.setIndex(u)}for(let h in r){let u=H0(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in o){let u=o[h][0].length;if(u!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){let f=[];for(let v=0;v<o[h].length;++v)f.push(o[h][v][d]);let m=H0(f);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(m)}}}return l}function H0(s){let t,e,i,n=-1,r=0;for(let c=0;c<s.length;++c){let h=s[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(n===-1&&(n=h.gpuType),n!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}let o=new t(r),a=new ge(o,e,i),l=0;for(let c=0;c<s.length;++c){let h=s[c];if(h.isInterleavedBufferAttribute){let u=l/e;for(let d=0,f=h.count;d<f;d++)for(let m=0;m<e;m++){let v=h.getComponent(d,m);a.setComponent(d+u,m,v)}}else o.set(h.array,l);l+=h.count*e}return n!==void 0&&(a.gpuType=n),a}var{halfX:gu,halfZ:Pi,height:Uf,rampR:Ti,goalHalfW:Ii,goalH:si,goalDepth:zi}=Ft,k0={night:{skyTop:132623,skyHorizon:1781594,skyBottom:263949,sunDir:[.25,.75,-.6],sunColor:10467583,sunGlow:0,stars:1,hemiSky:10467583,hemiGround:2042392,hemi:.75,key:15134463,keyI:2.4,keyDir:[.35,1,.25],fog:726320,fogDensity:.0011,envI:.75,exposure:1.05,winLit:.55,bldg:461330},sunset:{skyTop:2112120,skyHorizon:16754282,skyBottom:2759200,sunDir:[.78,.07,.62],sunColor:16756848,sunGlow:1,stars:0,hemiSky:16767416,hemiGround:2892055,hemi:.85,key:16760970,keyI:3.2,keyDir:[.75,.32,.58],fog:11565672,fogDensity:.0012,envI:.9,exposure:1,winLit:.3,bldg:1709600}};function V0(s){return new fe({side:_i,depthWrite:!1,fog:!1,uniforms:{uTop:{value:new St(s.skyTop)},uHorizon:{value:new St(s.skyHorizon)},uBottom:{value:new St(s.skyBottom)},uSunDir:{value:new w(...s.sunDir).normalize()},uSunColor:{value:new St(s.sunColor)},uSunGlow:{value:s.sunGlow},uStars:{value:s.stars}},vertexShader:`
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
      }`})}function q1(s){return new fe({uniforms:{uBase:{value:new St(s.bldg)},uWin:{value:new St(1,.82,.55)},uLit:{value:s.winLit},uFog:{value:new St(s.fog)},uFogD:{value:s.fogDensity*.55},uSunDir:{value:new w(...s.sunDir).normalize()},uSunColor:{value:new St(s.sunColor).multiplyScalar(s.sunGlow)}},vertexShader:`
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
      }`})}function un(s,t,{uLen:e=1e3,vOf:i=(o,a)=>a/1e3,skip:n=null,colorOf:r=null}={}){let o=s.concat([{...s[0],s:s.total}]),a=o.length,l=t.length,c=new Float32Array(a*l*3),h=new Float32Array(a*l*2),u=r?new Float32Array(a*l*3):null,d=new Float32Array(l),f=[];for(let p=0;p<a;p++){let g=o[p];for(let x=0;x<l;x++){let[M,y]=t[x],b=g.x+g.nx*M,E=g.z+g.nz*M;p>0&&(d[x]+=Math.hypot(b-f[x][0],E-f[x][1])),f[x]=[b,E];let A=p*l+x;if(c[A*3]=b,c[A*3+1]=y,c[A*3+2]=E,h[A*2]=d[x]/e,h[A*2+1]=i(x,y),u){let _=r(b,y,E);u[A*3]=_[0],u[A*3+1]=_[1],u[A*3+2]=_[2]}}}let m=[];for(let p=0;p<a-1;p++)for(let g=0;g<l-1;g++){if(n&&n(o[p],o[p+1],t[g],t[g+1]))continue;let x=p*l+g,M=(p+1)*l+g,y=(p+1)*l+g+1,b=p*l+g+1;m.push(x,b,M,M,b,y)}let v=new le;return v.setAttribute("position",new ge(c,3)),v.setAttribute("uv",new ge(h,2)),u&&v.setAttribute("color",new ge(u,3)),v.setIndex(m),v.computeVertexNormals(),v}var Ff=s=>s.wall==="orange"||s.wall==="blue";function Go(s,t=.5){return(e,i,n,r)=>Ff(e)&&Ff(i)&&Math.abs(e.x)<=Ii+t&&Math.abs(i.x)<=Ii+t&&Math.max(n[1],r[1])<=s+.5}function vu(s,t=1){let e=we.smoothstep(s,-2500,2500),i=new St(Ie[0].main),n=new St(Ie[1].main),r=i.lerp(n,e);return[r.r*t,r.g*t,r.b*t]}function G0(s,t){let e=[];for(let a of s){let l=a.x+a.nx*t,c=a.z+a.nz*t;if(Ff(a)){let h=a.wall==="orange"?1:-1,u=h>0?Ii:-Ii;if(Math.abs(a.x-u)<.5){e.push([l,c],[u,h*(Pi+zi)],[-u,h*(Pi+zi)]);continue}if(Math.abs(a.x)<Ii-.5)continue}e.push([l,c])}let i=new Ln(e.map(([a,l])=>new j(a,-l))),n=new Fa(i);n.rotateX(-Math.PI/2);let r=n.attributes.position,o=n.attributes.uv;for(let a=0;a<r.count;a++)o.setXY(a,(r.getX(a)+ln.halfX)/(2*ln.halfX),(r.getZ(a)-ln.minZ)/(ln.maxZ-ln.minZ));return n}function W0(s,t,e){let i=k0[e.timeOfDay]||k0.night,n=e.quality,r=new _e,o=new _e;o.scale.setScalar(.01),r.add(o),t.add(r);let a=[],l=[new Gi(new w(1,0,0),0),new Gi(new w(-1,0,0),0),new Gi(new w(0,0,-1),0)],c=z=>(z.clippingPlanes=l,z.clipIntersection=!0,z);t.fog=new va(i.fog,i.fogDensity*.35);let h=new ot(new vi(2500,48,24),V0(i));h.renderOrder=-10,h.frustumCulled=!1,r.add(h);let u=Ao(42),d=new qe(1,1,1);d.translate(0,.5,0);let f=190,m=new xs(d,q1(i),f),v=new Me;for(let z=0;z<f;z++){let W=u()*Math.PI*2,ut=170+u()*380+(u()<.3?250:0),bt=18+u()*40,Xt=18+u()*40,se=30+Math.pow(u(),2)*260+(ut>400?60:0);v.compose(new w(Math.cos(W)*ut,-5,Math.sin(W)*ut*1.2),new he().setFromAxisAngle(new w(0,1,0),u()*.6),new w(bt,se,Xt)),m.setMatrixAt(z,v)}r.add(m);let p=new ot(new In(1400,48),new Zt({color:855826,roughness:1}));p.rotation.x=-Math.PI/2,p.position.y=-6,r.add(p);let g=new Ha(i.hemiSky,i.hemiGround,i.hemi);r.add(g);let x=new Ga(i.key,i.keyI),M=new w(...i.keyDir).normalize();if(x.position.copy(M).multiplyScalar(90),x.target.position.set(0,0,0),r.add(x,x.target),n!=="low"){x.castShadow=!0;let z=n==="high"?2048:1024;x.shadow.mapSize.set(z,z);let W=x.shadow.camera;W.left=-60,W.right=60,W.top=70,W.bottom=-70,W.near=10,W.far=220,x.shadow.bias=-4e-4,x.shadow.normalBias=.02}let y=So(200,6),b=h0(n),E=u0(),A=E.clone();A.repeat.set(40,58),A.needsUpdate=!0;let _=G0(y,Ti),R=new Zt({map:b,roughness:.92,metalness:0,bumpMap:A,bumpScale:.6}),P=new ot(_,R);if(P.receiveShadow=!0,o.add(P),n==="high"){let z=E.clone();z.repeat.set(32,47),z.needsUpdate=!0;let W=5;for(let ut=1;ut<=W;ut++){let bt=new Zt({map:b,alphaMap:z,alphaTest:.25+ut/W*.55,roughness:.95,color:new St().setScalar(.85+ut*.05)}),Xt=new ot(_,bt);Xt.position.y=ut*1.4,Xt.receiveShadow=!0,o.add(Xt)}}let I=[];for(let z=0;z<=10;z++){let W=Math.PI/2*(1-z/10);I.push([Ti-Ti*Math.cos(W),Ti-Ti*Math.sin(W)])}let N=new Zt({color:1777703,roughness:.55,metalness:.35,vertexColors:!0,side:re}),H=new ot(un(y,I,{uLen:400,skip:Go(si),colorOf:(z,W,ut)=>{let bt=vu(ut,.35);return[.55+bt[0],.55+bt[1],.55+bt[2]]}}),N);H.receiveShadow=!0,o.add(H);let L=[[0,Ti-4],[0,Ti+14]],B=new ot(un(y,L,{skip:Go(si),colorOf:(z,W,ut)=>vu(ut,4)}),new ve({vertexColors:!0,side:re,fog:!1}));o.add(B);let q=yf(),Y=Ti+230,rt=new ot(un(y,[[0,Ti+14],[0,Y]],{uLen:4200,vOf:z=>z,skip:Go(si)}),new Zt({color:1118481,emissive:16777215,emissiveMap:q,emissiveIntensity:1.1,map:q,roughness:.4,side:re}));o.add(rt),a.push(z=>{q.offset.x=(q.offset.x+z*.012)%1});let Z=xf(3),tt=[[0,Y],[0,si],[0,1100],[0,Uf-Ti]];for(let z=1;z<=8;z++){let W=Math.PI/2*(z/8);tt.push([Ti-Ti*Math.cos(W),Uf-Ti+Ti*Math.sin(W)])}let nt=new Zt({color:8365784,emissive:10275071,emissiveMap:Z,emissiveIntensity:.16,alphaMap:Z,transparent:!0,opacity:.32,depthWrite:!1,roughness:.1,metalness:.2,side:re});Z.repeat.set(1,1);let Dt=new ot(un(y,tt,{uLen:900,vOf:(z,W)=>W/1040,skip:Go(si)}),nt);Dt.renderOrder=2,o.add(Dt);let Pt=new ot(Dt.geometry,new ve({color:4880568,transparent:!0,opacity:.045,depthWrite:!1,side:re}));Pt.renderOrder=1,o.add(Pt);let ce=G0(y.map(z=>({...z,wall:"side"})),Ti);ce.translate(0,Uf,0);let oe=ce.attributes.uv;for(let z=0;z<oe.count;z++)oe.setXY(z,ce.attributes.position.getX(z)/900,ce.attributes.position.getZ(z)/1040);let ae=new ot(ce,nt.clone());ae.material.opacity=.07,ae.material.emissiveIntensity=.05,ae.renderOrder=2,o.add(ae);let X=[];for(let z of[1,-1])for(let W of[1,-1]){let ut=W*Ii,bt=[ut,0,z*Pi];for(let Xt=0;Xt<I.length-1;Xt++){let[se,Ot]=I[Xt],[Pe,Ae]=I[Xt+1];X.push(...bt,ut,Ot,z*(Pi-se),ut,Ae,z*(Pi-Pe))}}let Q=new le;Q.setAttribute("position",new Kt(X,3)),Q.computeVertexNormals(),o.add(new ot(Q,new Zt({color:2764856,roughness:.6,metalness:.3,side:re})));let vt=[],Wt=[];for(let z of[0,1]){let W=z===0?-1:1,ut=Ie[z],bt=new _e,Xt=xf(4,256);Xt.repeat.set(zi/300,si/300);let se=new Zt({color:658448,emissive:ut.main,emissiveMap:Xt,emissiveIntensity:1.4,roughness:.6,metalness:.2,side:re}),Ot=Xt.clone();Ot.repeat.set(2*Ii/300,si/300),Ot.needsUpdate=!0;let Pe=se.clone();Pe.emissiveMap=Ot;let Ae=new ot(new oi(zi,si),se);Ae.rotation.y=Math.PI/2,Ae.position.set(Ii,si/2,W*(Pi+zi/2));let Fe=Ae.clone();Fe.position.x=-Ii;let $e=new ot(new oi(2*Ii,si),Pe);$e.position.set(0,si/2,0);let yi=new _e;yi.position.set(0,0,W*(Pi+zi)),yi.add($e);let $i=Xt.clone();$i.repeat.set(2*Ii/300,zi/300),$i.needsUpdate=!0;let En=se.clone();En.emissiveMap=$i,En.emissiveIntensity=.8;let ls=new ot(new oi(2*Ii,zi),En);ls.rotation.x=Math.PI/2,ls.position.set(0,si,W*(Pi+zi/2)),bt.add(Ae,Fe,yi,ls),Wt.push({hinge:yi,s:W});let zn=new Zt({color:2236962,emissive:ut.main,emissiveIntensity:4.5,roughness:.3,metalness:.6}),tn=new Zt({color:2764083,emissive:ut.main,emissiveIntensity:1.2,roughness:.4,metalness:.7}),cs=new qe(46,si+46,46);for(let Yo of[-1,1]){let Tl=new ot(cs,zn);Tl.position.set(Yo*(Ii+23),(si+46)/2,W*(Pi+23)),bt.add(Tl);let Zo=new ot(new qe(36,si,36),tn);Zo.position.set(Yo*(Ii+18),si/2,W*(Pi+zi)),bt.add(Zo);let T=new ot(new qe(30,30,zi),tn);T.position.set(Yo*(Ii+15),si+15,W*(Pi+zi/2)),bt.add(T)}let Wo=new ot(new qe(2*Ii+92,46,46),zn);Wo.position.set(0,si+23,W*(Pi+23));let qo=new ot(new qe(2*Ii+72,30,30),tn);qo.position.set(0,si+15,W*(Pi+zi)),bt.add(Wo,qo);let wl=new ot(new qe(2*Ii+500,70,80),tn);wl.position.set(0,si+260,W*(Pi+60)),bt.add(wl),o.add(bt);let Xo=new Va(ut.main,0,40,2);Xo.position.set(0,3.5,W*(Pi+zi*.6)*.01),r.add(Xo),vt.push({light:Xo,frameMat:zn,netMat:[se,Pe,En],base:4.5})}let Et=d0(),Yt=c(new Zt({map:Et,roughness:.95,emissive:16777215,emissiveMap:Et,emissiveIntensity:.07,side:re})),xe=c(new Zt({color:1382430,roughness:.8,metalness:.3,side:re})),st=[[-60,720],[-1200,1240],[-2300,1760],[-3300,2300]],ct=[[-3300,2780],[-4200,3250],[-5100,3720],[-5900,4150]],dt=z=>{let W=0,ut=[0];for(let bt=1;bt<z.length;bt++)W+=Math.hypot(z[bt][0]-z[bt-1][0],z[bt][1]-z[bt-1][1]),ut.push(W);return bt=>ut[bt]/900};o.add(new ot(un(y,st,{uLen:3400,vOf:dt(st)}),Yt)),o.add(new ot(un(y,ct,{uLen:3400,vOf:dt(ct)}),Yt));let ft=new ot(un(y,[[-60,0],[-60,si+40],[-60,720]],{uLen:4200,vOf:z=>z===0?0:z===1?.5:1,skip:Go(si+40,60)}),xe);o.add(ft);let mt=yf(),$t=new ot(un(y,[[-3300,2300],[-3300,2780]],{uLen:5200,vOf:z=>z}),c(new Zt({color:328965,emissive:16777215,emissiveMap:mt,emissiveIntensity:1.6,side:re})));o.add($t),a.push(z=>{mt.offset.x=(mt.offset.x-z*.02)%1}),o.add(new ot(un(y,[[-5900,4150],[-5900,4650]],{uLen:2e3}),xe));let qt=c(new ve({vertexColors:!0,fog:!1,side:re}));o.add(new ot(un(y,[[-5900,4650],[-5900,4700]],{colorOf:(z,W,ut)=>vu(ut,2.2)}),qt));let Qt=c(new Zt({color:921620,roughness:.8,metalness:.4,side:re}));o.add(new ot(un(y,[[-6500,5350],[-4200,5220],[-1900,5120]],{uLen:2e3}),Qt)),o.add(new ot(un(y,[[-1900,5120],[-1900,5020]],{uLen:2e3}),xe));let ee=new Zt({color:1711394,roughness:.6,metalness:.7}),D=c(new ve({color:new St(4.2,4.2,4),fog:!1})),Te=[-3700,-1250,1250,3700],me=new qe(150,14,60),C=Te.length*30+160,S=new xs(me,D,C),O=0;for(let z of Te){let W=new ot(new qe(2*gu+4400,200,140),ee);W.position.set(0,5560,z),o.add(W);let ut=new ot(new qe(2*gu+4400,60,60),ee);ut.position.set(0,5180,z),o.add(ut);for(let bt=0;bt<30;bt++){let Xt=-gu-1300+bt*(2*gu+2600)/29;v.makeTranslation(Xt,5140,z),S.setMatrixAt(O++,v)}}let G=So(420,3);for(let z of G){if(O>=C)break;let W=z.x-z.nx*1950,ut=z.z-z.nz*1950;v.makeRotationY(Math.atan2(z.nx,z.nz)),v.setPosition(W,5010,ut),S.setMatrixAt(O++,v)}S.count=O,o.add(S);let J=[];{let z=new Zt({color:1316636,roughness:.5,metalness:.8});for(let W of[1,-1]){let ut=document.createElement("canvas");ut.width=1024,ut.height=480;let bt=new ri(ut);bt.colorSpace=ze;let Xt=new _e,se=3600,Ot=1690,Pe=new ot(new oi(se,Ot),new ve({map:bt,color:new St(1.5,1.5,1.5),fog:!1})),Ae=new ot(new qe(se+160,Ot+160,120),z);Ae.position.z=-70,Xt.add(Ae,Pe);for(let Fe of[-1,1]){let $e=new ot(new qe(120,2e3,120),z);$e.position.set(Fe*se*.35,-Ot/2-1e3,-60),Xt.add($e)}Xt.position.set(0,4300,W*(Pi+4e3)),Xt.rotation.order="YXZ",Xt.rotation.y=W>0?Math.PI:0,Xt.rotation.x=.12,o.add(Xt),J.push({c:ut,tex:bt,ctx:ut.getContext("2d"),group:Xt,end:W})}}let pt="";function gt(z,W,ut,bt){let Xt=`${z}|${W}|${ut}|${bt}`;if(Xt!==pt){pt=Xt;for(let se of J){let Ot=se.ctx,Pe=se.c.width,Ae=se.c.height,Fe=Ot.createLinearGradient(0,0,0,Ae);Fe.addColorStop(0,"#0a1430"),Fe.addColorStop(1,"#03060f"),Ot.fillStyle=Fe,Ot.fillRect(0,0,Pe,Ae),Ot.textAlign="center",Ot.textBaseline="middle",bt?(Ot.fillStyle=bt==="blue"?"#2f7bff":"#ff7a1a",Ot.fillRect(0,0,Pe,Ae),Ot.fillStyle="#fff",Ot.font="italic 900 220px Arial Black, Arial, sans-serif",Ot.fillText("GOAL!!",Pe/2,Ae/2+10)):(Ot.fillStyle="#9fc4ff",Ot.font="bold 44px Arial, sans-serif",Ot.fillText("ROCKET ARENA",Pe/2,52),Ot.fillStyle="#1f5fe0",Ot.fillRect(70,110,330,250),Ot.fillStyle="#e8621a",Ot.fillRect(Pe-400,110,330,250),Ot.fillStyle="#fff",Ot.font="italic 900 190px Arial Black, Arial, sans-serif",Ot.fillText(String(z),235,245),Ot.fillText(String(W),Pe-235,245),Ot.font="bold 40px Arial, sans-serif",Ot.fillText("BLUE",235,400),Ot.fillText("ORANGE",Pe-235,400),Ot.font="bold 110px Arial, sans-serif",Ot.fillText(ut,Pe/2,245)),Ot.fillStyle="rgba(0,0,0,0.18)";for(let $e=0;$e<Ae;$e+=4)Ot.fillRect(0,$e,Pe,1);se.tex.needsUpdate=!0}}}gt(0,0,"5:00",null);let K={value:0};{let z=[["#1f5fe0","#ffffff","#e8621a"],["#c8102e","#ffffff","#003da5"],["#009246","#ffffff","#ce2b37"],["#000000","#dd0000","#ffce00"],["#ff7a1a","#ffffff","#2f7bff"],["#0055a4","#ffffff","#ef4135"],["#ffcc00","#00843d","#00843d"],["#2f7bff","#2f7bff","#ffffff"]],bt=c(new Zt({color:10133930,metalness:.9,roughness:.3})),Xt=So(1100,2),se=new Oe(9,9,520,6),Ot=new xs(se,bt,Xt.length),Pe=z.map(()=>[]);Xt.forEach((Ae,Fe)=>{let $e=Ae.x-Ae.nx*5950,yi=Ae.z-Ae.nz*5950;v.makeTranslation($e,4910,yi),Ot.setMatrixAt(Fe,v);let $i=new oi(300,190,8,1);$i.translate(300/2,0,0),$i.rotateY(Math.atan2(Ae.nx,Ae.nz)),$i.translate($e,5070,yi),Pe[Fe%z.length].push($i)}),o.add(Ot),z.forEach((Ae,Fe)=>{if(!Pe[Fe].length)return;let $e=document.createElement("canvas");$e.width=96,$e.height=64;let yi=$e.getContext("2d"),$i=Fe%2===0;Ae.forEach((tn,cs)=>{yi.fillStyle=tn,$i?yi.fillRect(cs*32,0,32,64):yi.fillRect(0,cs*21.4,96,21.4)});let En=new ri($e);En.colorSpace=ze;let ls=c(new Zt({map:En,side:re,roughness:.9,emissive:16777215,emissiveMap:En,emissiveIntensity:.15}));ls.onBeforeCompile=tn=>{tn.uniforms.uTime=K,tn.vertexShader=`uniform float uTime;
`+tn.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
          float wave = sin(uTime * 3.0 + position.x * 0.01 + position.z * 0.01 + uv.x * 5.0) * 45.0 * uv.x;
          transformed.y += wave * 0.6;
          transformed.x += wave * 0.4;
          transformed.z += wave * 0.4;`)};let zn=z0(Pe[Fe]);o.add(new ot(zn,ls))})}if(a.push(z=>{K.value+=z}),i.stars){let z=document.createElement("canvas");z.width=4,z.height=256;let W=z.getContext("2d"),ut=W.createLinearGradient(0,0,0,256);ut.addColorStop(0,"rgba(255,255,255,0)"),ut.addColorStop(.7,"rgba(255,255,255,0.35)"),ut.addColorStop(1,"rgba(255,255,255,1)"),W.fillStyle=ut,W.fillRect(0,0,4,256);let bt=new ri(z),Xt=new Oe(9,.8,420,24,1,!0);Xt.translate(0,210,0);let se=new ve({map:bt,color:9418495,transparent:!0,opacity:.07,blending:Ee,depthWrite:!1,side:re,fog:!1}),Ot=[];for(let Ae=0;Ae<6;Ae++){let Fe=Ae/6*Math.PI*2+.3,$e=new ot(Xt,se);$e.position.set(Math.cos(Fe)*125,5,Math.sin(Fe)*150),$e.renderOrder=3,r.add($e),Ot.push({beam:$e,a:Fe,phase:Ae*1.7})}let Pe=0;a.push(Ae=>{Pe+=Ae;for(let Fe of Ot)Fe.beam.rotation.set(0,0,0),Fe.beam.rotateY(Fe.a+Math.sin(Pe*.25+Fe.phase)*.6),Fe.beam.rotateZ(-.55-Math.sin(Pe*.31+Fe.phase)*.2)})}{let z=document.createElement("canvas");z.width=256,z.height=64;let W=z.getContext("2d");W.fillStyle="#fff";for(let se=0;se<3;se++){let Ot=30+se*70;W.beginPath(),W.moveTo(Ot,8),W.lineTo(Ot+34,32),W.lineTo(Ot,56),W.lineTo(Ot+18,56),W.lineTo(Ot+52,32),W.lineTo(Ot+18,8),W.closePath(),W.fill()}let ut=new ri(z);ut.wrapS=Ji;let bt=[];for(let se=0;se<=3;se++){let Ot=.42*(1-se/3);bt.push([Ti-(Ti-3)*Math.cos(Ot),Ti-(Ti-3)*Math.sin(Ot)])}let Xt=new ot(un(y,bt,{uLen:500,vOf:se=>se/3,skip:Go(si),colorOf:(se,Ot,Pe)=>vu(Pe,2.2)}),new ve({map:ut,vertexColors:!0,transparent:!0,blending:Ee,depthWrite:!1,side:re,fog:!1}));Xt.renderOrder=2,o.add(Xt),a.push(se=>{ut.offset.x=(ut.offset.x-se*.25)%1})}let it={0:[],1:[]};for(let z of[0,1]){let W=z===0?-1:1;for(let ut of[-2700,-1500,1500,2700])it[z].push(new w(ut,520,W*(Pi-30)))}let xt=[],kt=new Zt({color:2764598,roughness:.4,metalness:.7}),wt=new Oe(70,80,6,32),Mt=new Oe(150,175,14,40),Vt=new qi(64,7,8,40),Jt=new qi(140,10,8,48),ne=new vi(52,24,16),F=new Oe(70,150,260,32,1,!0);for(let z of e.pads){let W=new _e;W.position.set(z.x,0,z.z);let ut=new Zt({color:3348992,emissive:16753183,emissiveIntensity:z.big?2.6:1.4});if(ut.userData.base=z.big?2.6:1.4,z.big){let bt=new ot(Mt,kt);bt.position.y=4;let Xt=new ot(Jt,ut);Xt.rotation.x=Math.PI/2,Xt.position.y=12;let se=new ot(ne,new Zt({color:16752672,emissive:16747536,emissiveIntensity:3.5,roughness:.2}));se.position.y=110;let Ot=new ot(F,new ve({color:16751152,transparent:!0,opacity:.13,blending:Ee,depthWrite:!1,side:re}));Ot.position.y=135,W.add(bt,Xt,se,Ot),xt.push({pad:z,grp:W,ring:Xt,orb:se,cone:Ot,glowMat:ut})}else{let bt=new ot(wt,kt);bt.position.y=2;let Xt=new ot(Vt,ut);Xt.rotation.x=Math.PI/2,Xt.position.y=6;let se=new ot(new In(40,24),ut);se.rotation.x=-Math.PI/2,se.position.y=6,W.add(bt,Xt,se),xt.push({pad:z,grp:W,ring:Xt,glowMat:ut})}o.add(W)}let yt=new Zn;yt.add(new ot(new vi(100,32,16),V0(i)));let et=new ve({color:new St(12,12,11)});for(let z=0;z<10;z++){let W=z/10*Math.PI*2,ut=new ot(new qe(14,2,4),et);ut.position.set(Math.cos(W)*30,30,Math.sin(W)*36),ut.lookAt(0,0,0),yt.add(ut)}let _t=new ot(new oi(200,200),new ve({color:1915416}));_t.rotation.x=-Math.PI/2,_t.position.y=-2,yt.add(_t);let At=new xo(s),at=At.fromScene(yt,.03).texture;At.dispose(),t.environment=at,t.environmentIntensity=i.envI;let Bt=0,Ut=0;return a.push(z=>{Ut+=z,Bt=Math.max(0,Bt-z*.18),Et.offset.y=Bt>0?Math.abs(Math.sin(Ut*14))*.012*Math.min(1,Bt*2):0;for(let W of xt){let ut=W.pad.active;W.orb&&(W.orb.visible=ut,W.cone.visible=ut,W.orb.position.y=110+Math.sin(Ut*2.2+W.pad.x)*12,W.orb.rotation.y+=z);let bt=W.glowMat.userData.base;W.glowMat.emissiveIntensity=ut?bt*(1+Math.sin(Ut*4+W.pad.z)*.18):.12}for(let W of vt)W.light.intensity=Math.max(0,W.light.intensity-z*900),W.frameMat.emissiveIntensity+=(W.base-W.frameMat.emissiveIntensity)*Math.min(1,z*1.5)}),{root:r,exposure:i.exposure,bindPads(z){xt.forEach((W,ut)=>{z[ut]&&(W.pad=z[ut])})},dispose(){t.remove(r);let z=new Set;r.traverse(W=>{W.geometry&&!z.has(W.geometry)&&(z.add(W.geometry),W.geometry.dispose());let ut=W.material?Array.isArray(W.material)?W.material:[W.material]:[];for(let bt of ut)if(!z.has(bt)){z.add(bt);for(let Xt in bt)bt[Xt]&&bt[Xt].isTexture&&!z.has(bt[Xt])&&(z.add(bt[Xt]),bt[Xt].dispose());bt.dispose()}}),at.dispose(),t.environment=null,t.fog=null},update(z){for(let W of a)W(z)},cheer(z=1){Bt=Math.max(Bt,z)},pyroPoints:it,setScreens(z,W,ut,bt){gt(z,W,ut,bt)},goalFlash(z){let W=vt[z];W.light.intensity=2500,W.frameMat.emissiveIntensity=14},cine:{arena:o,buildings:m,ground:p,standEdge:[[zi,1094],[1200,1240],[2300,1760],[3300,2300],[3300,2780],[4200,3250],[5100,3720],[5900,4150],[5900,4700]],roofEdge:[[1900,5020],[1900,5120],[4200,5220],[6500,5350]],setGoalFlap(z,W){let ut=Wt[z];ut.hinge.rotation.x=ut.s*W},setCut(z,W){let ut=z===0?-1:1,bt=Math.max(0,W)*.01;l[0].constant=-bt,l[1].constant=-bt,l[2].normal.set(0,0,-ut),l[2].constant=(Pi+zi-20)*.01},screenFor(z){let W=z===0?-1:1;return J.find(ut=>ut.end===W).group},reset(){for(let z of Wt)z.hinge.rotation.x=0;l[0].constant=0,l[1].constant=0;for(let z of J)z.group.visible=!0;o.position.set(0,0,0),o.quaternion.identity(),o.scale.setScalar(.01),o.visible=!0,p.visible=!0}}}}var X0="rocketArena.settings.v1";function X1(){let s=navigator.userAgent||"";return/Xbox/i.test(s)?"medium":/Android|iPhone|iPad|Mobile/i.test(s)?"low":"high"}function Y1(){let s={quality:X1(),volume:.7,rumble:!0,ballCam:!0,fov:100,replays:!0,showFps:!1,timeOfDay:"night",split:"horizontal",duration:300,difficulty:"pro",teamSize_solo:1,teamSize_versus:1,teamSize_coop:2,handling:"easy",gameMode:"soccar",items:"all",victoryFx:!0};try{let t=JSON.parse(localStorage.getItem(X0)||"{}");return{...s,...t}}catch{return s}}var Bf=class{constructor(){this.settings=Y1();let t=new URLSearchParams(location.search);t.get("quality")&&(this.settings.quality=t.get("quality")),this.input=new Rl,this.audio=new Cl,this.audio.volume=this.settings.volume,this.input.onActivity=()=>this.audio.resume();let e=this.input.rumble.bind(this.input);this.input.rumble=(...i)=>{this.settings.rumble&&e(...i)},this.input.onPadConnect=(i,n)=>this.toast(n?"\u{1F3AE} Controller connected":"Controller disconnected"),this.hud=new Uh(document.getElementById("hud")),this.hud.show(!1),this.menu=new Bh(this,document.getElementById("menu")),this.container=document.getElementById("game"),this.paused=!1,this.match=null,this.buildGraphics(),this.startAttract(),this.last=performance.now(),this.fpsT=0,this.fpsN=0,document.getElementById("loading")?.remove(),requestAnimationFrame(i=>this.loop(i)),window.__app=this}buildGraphics(){this.gfx&&this.gfx.dispose(),this.gfx=new mu(this.container,this.settings.quality),this.builtQuality=this.settings.quality,this.buildStadium()}buildStadium(){this.stadium&&this.stadium.dispose();let t=Dh.map(([e,i])=>({x:e,z:i,big:!0,active:!0})).concat(Nh.map(([e,i])=>({x:e,z:i,big:!1,active:!0})));this.stadium=W0(this.gfx.renderer,this.gfx.scene,{quality:this.settings.quality,timeOfDay:this.settings.timeOfDay,pads:t}),this.gfx.setExposure(this.stadium.exposure),this.builtTime=this.settings.timeOfDay}saveSettings(){try{localStorage.setItem(X0,JSON.stringify(this.settings))}catch{}}applySettings(){this.saveSettings(),this.audio.setVolume(this.settings.volume),this.settings.quality!==this.builtQuality&&(this.disposeMatch(),this.buildGraphics(),this.startAttract(!1))}ensureStadium(){this.settings.timeOfDay!==this.builtTime&&this.buildStadium()}disposeMatch(){this.match&&this.match.dispose(),this.match=null}startAttract(t=!0){this.disposeMatch(),this.paused=!1,this.hud.show(!1),this.attractCount=(this.attractCount||0)+1;let e=this.attractCount%2===0?"rumble":"soccar";this.match=new bl(this,{mode:"attract",gameMode:e,items:"all",teamSize:2,duration:0,difficulty:"pro",humans:[]}),this.stadium.bindPads(this.match.world.pads),t&&this.menu.show("main")}startMatch(t){this.audio.resume(),this.lastCfg=t,this.disposeMatch(),this.ensureStadium(),this.menu.hide(),this.paused=!1,this.match=new bl(this,t),this.stadium.bindPads(this.match.world.pads)}restartMatch(){this.lastCfg&&this.startMatch(this.lastCfg)}pauseMatch(){this.paused||(this.paused=!0,this.menu.show("pause"))}resume(){if(this.paused=!1,this.menu.hide(),this.resumeFrame=this.frames,this.match){this.match.acc=0;for(let t of this.match.humans)t.car.prevJump=!0}}quitToMenu(){this.startAttract(!0)}showResults(t){this.menu.show("results",t)}toggleFullscreen(){Y0()}toast(t){let e=document.createElement("div");e.className="toast",e.textContent=t,document.body.appendChild(e),setTimeout(()=>e.classList.add("out"),2200),setTimeout(()=>e.remove(),2800)}loop(t){requestAnimationFrame(n=>this.loop(n));let e=Math.min(.1,Math.max(0,(t-this.last)/1e3));this.last=t,this.input.update();let i=this.input.menu();if(this.menu.visible&&this.menu.update(i),this.match)if(this.paused){for(let n of this.match.engines)this.audio.updateEngine(n,0,0,!1,!1,!1);this.match.renderPaused()}else this.match.update(e);if(this.fpsT+=e,this.fpsN++,this.fpsT>.5){let n=this.fpsN/this.fpsT;this.hud.setFps(this.settings.showFps?`${Math.round(n)} FPS`:"");let r=this.match&&!this.match.attract&&!this.paused;this.slowT=r&&n<32&&this.settings.quality!=="low"?(this.slowT||0)+this.fpsT:0,this.slowT>6&&!this.slowHinted&&(this.slowHinted=!0,this.toast("Running slowly? Lower Graphics in Settings for a smoother game")),this.fpsT=0,this.fpsN=0}this.input.endFrame(),this.frames=(this.frames||0)+1}};function Z1(){try{history.pushState({game:1},""),window.addEventListener("popstate",()=>history.pushState({game:1},""))}catch{}}function Y0(){try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen({navigationUI:"hide"}).catch(()=>{})}catch{}}function q0(){Z1(),window.addEventListener("keydown",s=>{s.code==="KeyF"&&!s.repeat&&window.__app&&window.__app.menu.visible&&Y0()});try{new Bf}catch(s){console.error(s);let t=document.getElementById("loading");t&&(t.innerHTML=`<div class="err">Could not start the game: ${s.message}<br>Your browser needs WebGL 2 support.</div>`)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",q0):q0();})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
