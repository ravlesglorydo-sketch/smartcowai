/* ============================================================
   GLOBAL POLISH — loader, page-wipe transitions, ripple clicks,
   scroll reveal, nav active indicator, cursor glow, card tilt
   ============================================================ */

/* ---- Page loader (boot-up sequence) ---- */
(function bootLoader(){
  const loader = document.getElementById('pageLoader');
  const fill = document.getElementById('loaderFill');
  const text = document.getElementById('loaderText');
  if(!loader) return;
  let pct = 0;
  const steps = ['MENGINISIALISASI SISTEM', 'MEMUAT MODUL SCAN', 'MENYIAPKAN MODEL 3D', 'SIAP DIGUNAKAN'];
  const timer = setInterval(()=>{
    pct += Math.random()*18 + 8;
    if(pct >= 100){
      pct = 100;
      clearInterval(timer);
      text.textContent = steps[3] + '… 100%';
      setTimeout(()=>{
        loader.classList.add('hide');
        document.body.classList.add('loaded');
        setTimeout(()=> loader.remove(), 700);
      }, 220);
    } else {
      const stepIdx = Math.min(2, Math.floor(pct/34));
      text.textContent = steps[stepIdx] + '… ' + Math.floor(pct) + '%';
    }
    fill.style.width = pct + '%';
  }, 160);
})();

/* ---- Animated hero counter ---- */
(function animateCounters(){
  document.querySelectorAll('[data-count]').forEach(el=>{
    const target = parseInt(el.dataset.count, 10);
    let cur = 0;
    setTimeout(()=>{
      const step = () => {
        cur += Math.max(1, Math.ceil((target-cur)/6));
        if(cur >= target){ el.textContent = target; return; }
        el.textContent = cur;
        requestAnimationFrame(step);
      };
      step();
    }, 500);
  });
})();

/* ---- Section page-wipe transition on nav / jump links ---- */
(function pageTransitions(){
  const wipe = document.getElementById('pageWipe');
  const sections = ['scan','edukasi','pakan','chat','tim'];
  let animating = false;

  function jumpTo(id){
    const target = document.getElementById(id);
    if(!target || animating) return;
    animating = true;
    wipe.classList.remove('wipe-out');
    wipe.classList.add('wipe-in');
    setTimeout(()=>{
      target.scrollIntoView({ behavior:'auto', block:'start' });
      wipe.classList.remove('wipe-in');
      wipe.classList.add('wipe-out');
      setTimeout(()=>{
        wipe.classList.remove('wipe-out');
        animating = false;
      }, 430);
    }, 390);
  }

  document.querySelectorAll('a[data-nav]').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      jumpTo(a.dataset.nav);
      document.getElementById('navLinks')?.classList.remove('open-mobile');
    });
  });
  document.querySelectorAll('[data-nav-jump]').forEach(btn=>{
    btn.addEventListener('click', ()=> jumpTo(btn.dataset.navJump));
  });

  /* Active link + sliding indicator, synced to scroll position */
  const navLinksEl = document.getElementById('navLinks');
  const indicator = document.getElementById('navIndicator');
  const linkEls = {};
  document.querySelectorAll('a[data-nav]').forEach(a=> linkEls[a.dataset.nav] = a);

  function moveIndicator(id){
    const link = linkEls[id];
    if(!link || !navLinksEl) return;
    const lr = link.getBoundingClientRect();
    const cr = navLinksEl.getBoundingClientRect();
    indicator.style.left = (lr.left - cr.left) + 'px';
    indicator.style.width = lr.width + 'px';
    indicator.classList.add('on');
    Object.values(linkEls).forEach(l=>l.classList.remove('active'));
    link.classList.add('active');
  }

  const sectionEls = sections.map(id=>document.getElementById(id)).filter(Boolean);
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) moveIndicator(entry.target.id);
    });
  }, { rootMargin:'-45% 0px -50% 0px', threshold:0 });
  sectionEls.forEach(s=>io.observe(s));

  window.addEventListener('resize', ()=>{
    const active = Object.values(linkEls).find(l=>l.classList.contains('active'));
    if(active) moveIndicator(active.dataset.nav);
  });
})();

/* ---- Click ripple on interactive elements ---- */
(function rippleFX(){
  document.addEventListener('click', (e)=>{
    const el = e.target.closest('.btn, .nav-cta, .holo-icon-btn, .part-item, .bcs-select button');
    if(!el) return;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.3;
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.width = span.style.height = size + 'px';
    span.style.left = (e.clientX - rect.left - size/2) + 'px';
    span.style.top = (e.clientY - rect.top - size/2) + 'px';
    el.appendChild(span);
    setTimeout(()=> span.remove(), 620);
  });
})();

/* ---- Scroll reveal (IntersectionObserver) ---- */
(function scrollReveal(){
  const els = document.querySelectorAll('.reveal');
  if(!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((entry, i)=>{
      if(entry.isIntersecting){
        const siblings = Array.from(entry.target.parentElement.children).filter(c=>c.classList.contains('reveal'));
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = (Math.min(idx,4) * 80) + 'ms';
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
  els.forEach(el=> io.observe(el));
})();

/* ---- Cursor glow (desktop / fine-pointer only) ---- */
(function cursorGlow(){
  if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const glow = document.getElementById('cursorGlow');
  if(!glow) return;
  let mx=0,my=0,gx=0,gy=0, shown=false;
  window.addEventListener('mousemove', e=>{
    mx = e.clientX; my = e.clientY;
    if(!shown){ shown=true; glow.classList.add('on'); }
  });
  window.addEventListener('mouseleave', ()=> glow.classList.remove('on'));
  function loop(){
    gx += (mx-gx)*0.15; gy += (my-gy)*0.15;
    glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ---- Subtle card tilt on hover (desktop only) ---- */
(function cardTilt(){
  if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  document.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('mousemove', e=>{
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left)/r.width - 0.5;
      const py = (e.clientY - r.top)/r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-py*3.5).toFixed(2)}deg) rotateY(${(px*3.5).toFixed(2)}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transform = '';
    });
  });
})();

/* ===================== Nav mobile toggle ===================== */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open-mobile');
  if(navLinks.classList.contains('open-mobile')){
    navLinks.style.display='flex';
    navLinks.style.flexDirection='column';
    navLinks.style.position='absolute';
    navLinks.style.top='58px';
    navLinks.style.right='24px';
    navLinks.style.background='#142218';
    navLinks.style.border='1px solid #24402E';
    navLinks.style.borderRadius='10px';
    navLinks.style.padding='14px 20px';
    navLinks.style.gap='14px';
  } else {
    navLinks.style.display='none';
  }
});

/* ============================================================
   FITUR 1 — SCAN TUBUH TERNAK (Mode Pemantauan CCTV + Deteksi AI)
   Deteksi real-time sapi/manusia berjalan 100% di perangkat (on-device)
   menggunakan TensorFlow.js + model COCO-SSD — tidak ada video terkirim
   ke server manapun.
   ============================================================ */
const video = document.getElementById('camVideo');
const detectOverlay = document.getElementById('detectOverlay');
const overlayCtx = detectOverlay.getContext('2d');
const captureCanvas = document.getElementById('captureCanvas');
const capturedImg = document.getElementById('capturedImg');
const placeholder = document.getElementById('capturePlaceholder');
const btnStartCam = document.getElementById('btnStartCam');
const btnSnap = document.getElementById('btnSnap');
const btnUpload = document.getElementById('btnUpload');
const btnSound = document.getElementById('btnSound');
const fileInput = document.getElementById('fileInput');
const cctvHud = document.getElementById('cctvHud');
const cctvClock = document.getElementById('cctvClock');
const cctvStatus = document.getElementById('cctvStatus');
const cctvStatusText = document.getElementById('cctvStatusText');
const modelLoading = document.getElementById('modelLoading');
const modelLoadingText = document.getElementById('modelLoadingText');
const detectLog = document.getElementById('detectLog');
const detectLogList = document.getElementById('detectLogList');

let stream = null;
let cocoModel = null;
let modelLoadingPromise = null;
let detectionTimer = null;
let clockTimer = null;
let soundOn = true;

// Class label translation (COCO-SSD -> Bahasa Indonesia). Fokus utama: sapi & manusia.
const CLASS_LABEL = {
  cow:'Sapi', person:'Manusia', horse:'Kuda', sheep:'Domba', dog:'Anjing',
  cat:'Kucing', bird:'Burung'
};
const CLASS_COLOR = {
  cow:'#4FD1C5', person:'#E8B94F', horse:'#B5563C', sheep:'#A9BCAE',
  dog:'#D96A5A', cat:'#D97757', bird:'#7FD9C9'
};

/* ---- Preload model AI di background sejak halaman dibuka ---- */
function loadModel(){
  if(modelLoadingPromise) return modelLoadingPromise;
  modelLoadingPromise = (async () => {
    try{
      cocoModel = await cocoSsd.load({ base:'lite_mobilenet_v2' });
    }catch(err){
      console.warn('Gagal memuat model deteksi AI:', err);
      cocoModel = null;
    }
    return cocoModel;
  })();
  return modelLoadingPromise;
}
loadModel();

btnSound.addEventListener('click', () => {
  soundOn = !soundOn;
  btnSound.textContent = soundOn ? '🔊 Suara' : '🔇 Suara';
  btnSound.classList.toggle('btn-ghost', true);
});

btnStartCam.addEventListener('click', async () => {
  if(stream){ stopCamera(); addLog('sistem','Pemantauan dihentikan.'); return; }
  try{
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
    video.style.display='block';
    capturedImg.style.display='none';
    placeholder.style.display='none';
    cctvHud.style.display='flex';
    detectLog.style.display='block';
    video.play();
    btnSnap.disabled = false;
    btnStartCam.textContent = '⏹ Hentikan Pemantauan';

    startClock();

    if(!cocoModel){
      modelLoading.style.display='flex';
      modelLoadingText.textContent = 'Memuat model deteksi AI (sekali saja, ± 5–10 detik)…';
      await loadModel();
      modelLoading.style.display='none';
    }
    if(cocoModel){
      startDetectionLoop();
      addLog('sistem', 'Pemantauan dimulai — mendeteksi sapi & manusia secara real-time.');
    } else {
      cctvStatusText.textContent = 'Model AI gagal dimuat — cek koneksi internet.';
    }
  }catch(err){
    alert('Tidak dapat mengakses kamera. Pastikan browser memiliki izin kamera, atau gunakan tombol "Unggah Foto".');
  }
});

function stopCamera(){
  if(stream){ stream.getTracks().forEach(t => t.stop()); stream = null; }
  clearInterval(detectionTimer); detectionTimer = null;
  clearInterval(clockTimer); clockTimer = null;
  overlayCtx.clearRect(0,0,detectOverlay.width,detectOverlay.height);
  cctvHud.style.display='none';
  video.style.display='none';
  placeholder.style.display = capturedImg.style.display==='block' ? 'none' : 'flex';
  btnSnap.disabled = true;
  btnStartCam.textContent = '📹 Mulai Pemantauan';
  cowPresent = false; humanPresent = false;
  cowAbsentStreak = 0; humanAbsentStreak = 0;
}

btnSnap.addEventListener('click', () => {
  if(!stream) return;
  captureCanvas.width = video.videoWidth;
  captureCanvas.height = video.videoHeight;
  captureCanvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = captureCanvas.toDataURL('image/jpeg', .92);
  capturedImg.src = dataUrl;
  capturedImg.style.display='block';
  video.style.display='none';
  stopCamera();
  markScanReady();
});

btnUpload.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  stopCamera();
  const reader = new FileReader();
  reader.onload = (ev) => {
    capturedImg.src = ev.target.result;
    capturedImg.style.display='block';
    video.style.display='none';
    placeholder.style.display='none';
    markScanReady();
  };
  reader.readAsDataURL(file);
});

function markScanReady(){
  document.getElementById('scanStatus').innerHTML = '<b>Tersimpan:</b> foto digunakan sebagai dokumentasi kondisi ternak ✓';
  document.getElementById('scanStatus').style.color = 'var(--scan)';
}

/* ---- Jam live di HUD ---- */
function startClock(){
  clearInterval(clockTimer);
  const tick = () => { cctvClock.textContent = new Date().toLocaleTimeString('id-ID', {hour12:false}); };
  tick();
  clockTimer = setInterval(tick, 1000);
}

/* ---- Notifikasi suara (Web Speech API, native browser) ---- */
function speak(text){
  if(!soundOn || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'id-ID';
  utter.rate = 1.02;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

/* ---- Log deteksi ---- */
function addLog(type, text){
  const item = document.createElement('div');
  item.className = 'detect-log-item ' + type;
  const time = new Date().toLocaleTimeString('id-ID', {hour12:false});
  item.innerHTML = `<span class="log-badge" style="${type==='sistem'?'background:var(--ink-faint);':''}"></span><span class="log-time">${time}</span><span>${text}</span>`;
  detectLogList.prepend(item);
  while(detectLogList.children.length > 10) detectLogList.removeChild(detectLogList.lastChild);
}

/* ---- Loop deteksi objek real-time ---- */
let cowPresent = false, humanPresent = false;
let cowAbsentStreak = 0, humanAbsentStreak = 0;
const HYSTERESIS = 2; // jumlah siklus "tidak terlihat" sebelum status dianggap benar-benar hilang

function startDetectionLoop(){
  clearInterval(detectionTimer);
  detectionTimer = setInterval(runDetection, 650);
}

async function runDetection(){
  if(!cocoModel || !stream || video.readyState < 2) return;

  detectOverlay.width = video.videoWidth;
  detectOverlay.height = video.videoHeight;

  let predictions = [];
  try{
    predictions = await cocoModel.detect(video);
  }catch(err){ return; }

  overlayCtx.clearRect(0,0,detectOverlay.width,detectOverlay.height);

  const relevant = predictions.filter(p => CLASS_LABEL[p.class] && p.score > 0.5);

  relevant.forEach(p=>{
    const [x,y,w,h] = p.bbox;
    const color = CLASS_COLOR[p.class] || '#4FD1C5';
    const label = `${CLASS_LABEL[p.class]} ${(p.score*100).toFixed(0)}%`;

    overlayCtx.strokeStyle = color;
    overlayCtx.lineWidth = Math.max(3, detectOverlay.width*0.004);
    overlayCtx.strokeRect(x,y,w,h);

    overlayCtx.font = `600 ${Math.max(16, detectOverlay.width*0.018)}px 'IBM Plex Mono', monospace`;
    const textW = overlayCtx.measureText(label).width + 16;
    const textH = Math.max(24, detectOverlay.width*0.026);
    overlayCtx.fillStyle = color;
    overlayCtx.fillRect(x, Math.max(0,y-textH), textW, textH);
    overlayCtx.fillStyle = '#06201D';
    overlayCtx.fillText(label, x+8, Math.max(textH-7, y-7));

    // corner accents
    const cl = Math.min(18, w*0.25, h*0.25);
    overlayCtx.lineWidth = Math.max(4, detectOverlay.width*0.006);
    [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]].forEach(([cx,cy,dx,dy])=>{
      overlayCtx.beginPath();
      overlayCtx.moveTo(cx, cy+cl*dy);
      overlayCtx.lineTo(cx, cy);
      overlayCtx.lineTo(cx+cl*dx, cy);
      overlayCtx.stroke();
    });
  });

  const isCowNow = relevant.some(p=>p.class==='cow');
  const isHumanNow = relevant.some(p=>p.class==='person');

  // Hysteresis: hindari notifikasi berkedip akibat deteksi terputus-putus
  if(isCowNow){ cowAbsentStreak = 0; } else { cowAbsentStreak++; }
  if(isHumanNow){ humanAbsentStreak = 0; } else { humanAbsentStreak++; }

  if(isCowNow && !cowPresent){
    cowPresent = true;
    speak('Terdeteksi sapi');
    addLog('sapi', 'Sapi terdeteksi di area pemantauan.');
  } else if(!isCowNow && cowPresent && cowAbsentStreak > HYSTERESIS){
    cowPresent = false;
  }

  if(isHumanNow && !humanPresent){
    humanPresent = true;
    speak('Terdeteksi manusia');
    addLog('manusia', 'Manusia terdeteksi di area pemantauan.');
  } else if(!isHumanNow && humanPresent && humanAbsentStreak > HYSTERESIS){
    humanPresent = false;
  }

  // Update status chip
  cctvStatus.classList.remove('cow','human');
  if(isHumanNow){
    cctvStatus.classList.add('human');
    cctvStatusText.textContent = `Manusia terdeteksi (${relevant.filter(p=>p.class==='person').length})`;
  } else if(isCowNow){
    cctvStatus.classList.add('cow');
    cctvStatusText.textContent = `Sapi terdeteksi (${relevant.filter(p=>p.class==='cow').length})`;
  } else {
    cctvStatusText.textContent = 'Memindai area…';
  }
}


/* ---- Kalkulator Bobot Badan: Rumus Schoorl & Winter (standar peternakan Indonesia) ---- */
const formBobot = document.getElementById('formBobot');
formBobot.addEventListener('submit', (e) => {
  e.preventDefault();
  const ld = parseFloat(document.getElementById('inputLD').value); // lingkar dada, cm
  const pb = parseFloat(document.getElementById('inputPB').value); // panjang badan, cm
  const bangsa = document.getElementById('inputBangsa').value;

  if(!ld || ld < 50 || ld > 300){
    alert('Masukkan lingkar dada yang valid (50–300 cm).');
    return;
  }

  // Rumus Schoorl (hanya perlu lingkar dada)
  const bbSchoorl = Math.pow(ld + 22, 2) / 100;

  // Rumus Winter (perlu lingkar dada & panjang badan)
  let bbWinter = null;
  if(pb && pb > 40 && pb < 250){
    bbWinter = (Math.pow(ld,2) * pb) / 10840;
  }

  const bbFinal = bbWinter ? (bbSchoorl + bbWinter)/2 : bbSchoorl;

  document.getElementById('resSchoorl').textContent = bbSchoorl.toFixed(1) + ' kg';
  document.getElementById('resWinter').textContent = bbWinter ? bbWinter.toFixed(1) + ' kg' : '— (isi panjang badan)';
  document.getElementById('resFinal').textContent = bbFinal.toFixed(1) + ' kg';

  const noteEl = document.getElementById('resNote');
  const breedNote = {
    bali: 'Sapi Bali: rumus Schoorl umumnya cukup akurat untuk bangsa lokal bertubuh kompak.',
    ongole: 'Sapi Ongole/PO: gunakan rata-rata Schoorl & Winter untuk hasil lebih presisi karena tubuh lebih panjang.',
    lain: 'Bangsa lain/silangan: kombinasikan kedua rumus dan sesuaikan dengan kondisi tubuh (BCS).'
  };
  noteEl.textContent = breedNote[bangsa] || breedNote.lain;

  document.getElementById('bobotResultPanel').style.display = 'block';
});

/* ---- Skor Kondisi Tubuh (Body Condition Score) — panduan visual terpandu ---- */
const bcsButtons = document.querySelectorAll('.bcs-select button');
const bcsDesc = {
  1:'Sangat kurus — tulang rusuk, pinggul & tulang belakang sangat menonjol. Perlu perbaikan pakan segera.',
  2:'Kurus — tulang masih terlihat jelas, lemak penutup tipis.',
  3:'Ideal — bentuk tubuh proporsional, tulang teraba namun tidak menonjol tajam. Kondisi target pemeliharaan.',
  4:'Gemuk — lapisan lemak tebal, bentuk tubuh membulat.',
  5:'Sangat gemuk — tulang sulit teraba, endapan lemak berlebih di area pinggul & pangkal ekor.'
};
bcsButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    bcsButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const val = parseInt(btn.dataset.bcs);
    document.querySelectorAll('.bcs-dot').forEach((dot,i) => dot.classList.toggle('on', i < val));
    document.getElementById('bcsDescText').textContent = bcsDesc[val];
    document.getElementById('bcsResultPanel').style.display = 'block';
  });
});

/* ============================================================
   FITUR 2 — HOLOGRAM 3D EDUKASI SAPI (Three.js)
   Cross-section scan slider + hotspot organ + kamera halus
   ============================================================ */
(function initHologram(){
  const stage = document.getElementById('holoStage');
  if(!stage || typeof THREE === 'undefined') return;

  const width = stage.clientWidth, height = stage.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, width/height, 0.1, 100);
  camera.position.set(0, 1.5, 6.4);

  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.localClippingEnabled = true;
  stage.insertBefore(renderer.domElement, stage.firstChild);

  /* ---------- Lights ---------- */
  scene.add(new THREE.AmbientLight(0x4fd1c5, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 0.95);
  key.position.set(4,6,5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4fd1c5, 0.9);
  rim.position.set(-5,2,-4);
  scene.add(rim);
  const fillBelow = new THREE.PointLight(0xE8B94F, 0.35, 8);
  fillBelow.position.set(0,-1,2);
  scene.add(fillBelow);

  const cowGroup = new THREE.Group();
  scene.add(cowGroup);

  /* ---------- Cross-section clipping plane ---------- */
  // Plane normal (-1,0,0): kept region = points where x < cutX
  const clipPlane = new THREE.Plane(new THREE.Vector3(-1,0,0), 3.0);
  const CUT_FRONT = 3.05;   // t=0  -> nothing clipped (full skin)
  const CUT_BACK  = -2.35;  // t=100 -> fully clipped (skin gone)

  const skinMat = new THREE.MeshStandardMaterial({
    color:0x2E8A82, transparent:true, opacity:0.92, roughness:.5, metalness:.15,
    emissive:0x0B3B36, emissiveIntensity:0.25, side:THREE.DoubleSide,
    clippingPlanes:[clipPlane], clipShadows:true
  });
  const hornMat = new THREE.MeshStandardMaterial({ color:0xE8B94F, roughness:.4 });
  const hoofMat = new THREE.MeshStandardMaterial({ color:0x1a1305, roughness:.6 });
  const muscleMat = new THREE.MeshBasicMaterial({ color:0xD96A5A, wireframe:true, transparent:true, opacity:0 });
  const skeletonMat = new THREE.MeshBasicMaterial({ color:0xEEF3EA, wireframe:true, transparent:true, opacity:0 });

  const skinParts = new THREE.Group();
  const muscleParts = new THREE.Group();
  const skeletonParts = new THREE.Group();
  const innerParts = new THREE.Group();
  cowGroup.add(skinParts, muscleParts, skeletonParts, innerParts);

  function addSkin(mesh){ skinParts.add(mesh); }

  /* ---------- Body (barrel torso, smoother) ---------- */
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 2.4, 28, 4), skinMat);
  torso.rotation.z = Math.PI/2;
  torso.position.set(0, 0.9, 0);
  addSkin(torso);
  [1.15,-1.15].forEach(x=>{
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.88,20,16), skinMat);
    cap.position.set(x, 0.9, 0);
    cap.scale.set(0.5,1,1);
    addSkin(cap);
  });

  /* ---------- Neck, dewlap & Head ---------- */
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.5,1.1,16), skinMat);
  neck.position.set(1.55,1.35,0); neck.rotation.z = Math.PI/2.6;
  addSkin(neck);
  const dewlap = new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.16,0.7,10), skinMat);
  dewlap.position.set(1.55,1.02,0.02); dewlap.rotation.z = Math.PI/2.6;
  addSkin(dewlap);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42,20,16), skinMat);
  head.position.set(2.25,1.75,0); head.scale.set(1.15,0.85,0.85);
  addSkin(head);
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.24,16,12), skinMat);
  snout.position.set(2.65,1.62,0); snout.scale.set(1,0.7,0.9);
  addSkin(snout);
  [0.09,-0.09].forEach(z=>{
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.035,8,8), new THREE.MeshBasicMaterial({color:0x08110C}));
    nostril.position.set(2.85,1.6,z);
    addSkin(nostril);
  });
  // Curved horns via tube along a bezier curve
  [0.18,-0.18].forEach(z=>{
    const sign = z>0?1:-1;
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(2.08,2.05,z*1.0),
      new THREE.Vector3(1.95,2.3,z*1.6),
      new THREE.Vector3(1.78,2.28,z*2.0)
    );
    const horn = new THREE.Mesh(new THREE.TubeGeometry(curve,12,0.05,8,false), hornMat);
    addSkin(horn);
  });
  [0.32,-0.32].forEach(z=>{
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.16,0.05,10), skinMat);
    ear.position.set(2.15,1.85,z); ear.rotation.x = Math.PI/2;
    addSkin(ear);
  });

  /* ---------- Legs (two-segment with knee bend) ---------- */
  const legPositions = [[0.75,0.55],[0.75,-0.55],[-0.75,0.55],[-0.75,-0.55]];
  legPositions.forEach(([x,z])=>{
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.165,0.14,0.62,12), skinMat);
    upper.position.set(x,0.72,z);
    addSkin(upper);
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.1,0.55,12), skinMat);
    lower.position.set(x + (x>0?0.04:-0.04), 0.28, z);
    lower.rotation.z = x>0 ? -0.05 : 0.05;
    addSkin(lower);
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.15,0.13,10), hoofMat);
    hoof.position.set(x,0.02,z);
    addSkin(hoof);
  });

  /* ---------- Tail ---------- */
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.08,0.85,8), skinMat);
  tail.position.set(-1.35,0.7,0); tail.rotation.z = 0.4;
  addSkin(tail);
  const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.09,8,8), new THREE.MeshStandardMaterial({color:0x1a1305}));
  tuft.position.set(-1.68,0.32,0);
  addSkin(tuft);

  /* ---------- Muscle layer (simplified, wireframe overlay) ---------- */
  const muscleTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.72,0.8,2.15,16), muscleMat);
  muscleTorso.rotation.z = Math.PI/2; muscleTorso.position.set(0,0.9,0);
  muscleParts.add(muscleTorso);
  const muscleNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.4,1.0,12), muscleMat);
  muscleNeck.position.set(1.5,1.33,0); muscleNeck.rotation.z = Math.PI/2.6;
  muscleParts.add(muscleNeck);

  /* ---------- Skeleton layer (ribcage + spine, wireframe) ---------- */
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,2.6,8), skeletonMat);
  spine.rotation.z = Math.PI/2; spine.position.set(0.1,1.28,0);
  skeletonParts.add(spine);
  for(let i=0;i<7;i++){
    const rib = new THREE.Mesh(new THREE.TorusGeometry(0.62,0.02,6,16,Math.PI*1.15), skeletonMat);
    rib.position.set(0.85 - i*0.28, 0.95, 0);
    rib.rotation.y = Math.PI/2; rib.rotation.z = Math.PI*0.08;
    skeletonParts.add(rib);
  }

  /* ---------- Internal organs (simplified, educational) ---------- */
  const organDefs = [
    { name:'rumen', label:'Rumen', desc:'Bilik terbesar lambung (kapasitas hingga ± 150–200 liter pada sapi dewasa), tempat mikroba memfermentasi serat kasar hijauan menjadi asam lemak yang diserap tubuh.', color:0xB5563C, pos:[-0.25,0.85,0.15], radius:0.62, scale:[1,0.9,0.85] },
    { name:'retikulum', label:'Retikulum', desc:'Disebut juga "perut jala" karena bentuk dindingnya menyerupai sarang lebah. Menyaring pakan & menangkap benda asing sebelum diteruskan ke omasum.', color:0xD97757, pos:[0.55,0.65,0.1], radius:0.28, scale:[1,1,1] },
    { name:'omasum', label:'Omasum', desc:'Disebut "perut buku" karena berlapis-lapis seperti halaman buku, berfungsi menyerap air & nutrisi hasil fermentasi sebelum masuk abomasum.', color:0xE8B94F, pos:[0.85,0.85,0.15], radius:0.24, scale:[1,1,1] },
    { name:'abomasum', label:'Abomasum', desc:'"Lambung sejati" — satu-satunya bilik yang menghasilkan enzim pencernaan, fungsinya setara lambung pada manusia.', color:0x4FD1C5, pos:[1.05,0.55,-0.1], radius:0.26, scale:[1,0.9,1] },
    { name:'jantung', label:'Jantung', desc:'Memompa darah ke seluruh tubuh, terletak di rongga dada bagian depan di antara paru-paru.', color:0xD96A5A, pos:[1.3,1.15,0.05], radius:0.16, scale:[1,1,1] },
    { name:'paruparu', label:'Paru-paru', desc:'Sepasang organ pernapasan di sisi kiri & kanan rongga dada, mengembang-mengempis mengikuti gerak napas.', color:0xA9BCAE, pos:[1.15,1.05,0.35], radius:0.22, scale:[0.8,1,0.6] },
  ];
  const organMeshes = [];
  organDefs.forEach(o=>{
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(o.radius, 20, 16),
      new THREE.MeshStandardMaterial({ color:o.color, roughness:.5, metalness:.08, transparent:true, opacity:0 })
    );
    mesh.position.set(...o.pos);
    mesh.scale.set(...o.scale);
    mesh.userData = o;
    mesh.visible = false;
    innerParts.add(mesh);
    organMeshes.push(mesh);
  });

  cowGroup.scale.set(0.92,0.92,0.92);
  cowGroup.position.x = -0.25;

  /* ---------- Holographic stage: base rings + volumetric beam ---------- */
  const stageGroup = new THREE.Group();
  scene.add(stageGroup);
  const baseDisc = new THREE.Mesh(new THREE.CircleGeometry(2.15,48), new THREE.MeshBasicMaterial({color:0x4FD1C5, transparent:true, opacity:0.06, side:THREE.DoubleSide}));
  baseDisc.rotation.x = -Math.PI/2; baseDisc.position.y = -0.02;
  stageGroup.add(baseDisc);
  const ringsGroup = new THREE.Group();
  [1.0,1.55,2.1].forEach((r,i)=>{
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r,0.008,8,64), new THREE.MeshBasicMaterial({color:0x4FD1C5, transparent:true, opacity:0.35 - i*0.08}));
    ring.rotation.x = Math.PI/2; ring.position.y = -0.015;
    ringsGroup.add(ring);
  });
  stageGroup.add(ringsGroup);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 2.0, 3.4, 28, 1, true),
    new THREE.MeshBasicMaterial({ color:0x4FD1C5, transparent:true, opacity:0.045, side:THREE.DoubleSide, blending:THREE.AdditiveBlending })
  );
  beam.position.y = 1.7;
  stageGroup.add(beam);

  /* ---------- Moving scan-plane visual (glowing cut disc) ---------- */
  const scanDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.35,40),
    new THREE.MeshBasicMaterial({ color:0x4FD1C5, transparent:true, opacity:0.16, side:THREE.DoubleSide, blending:THREE.AdditiveBlending })
  );
  scanDisc.rotation.y = Math.PI/2;
  const scanRing = new THREE.Mesh(new THREE.TorusGeometry(1.35,0.012,8,48), new THREE.MeshBasicMaterial({color:0x4FD1C5, transparent:true, opacity:0.55}));
  scanRing.rotation.y = Math.PI/2;
  const scanGroup = new THREE.Group();
  scanGroup.add(scanDisc, scanRing);
  scanGroup.visible = false;
  cowGroup.add(scanGroup);

  /* ---------- Layer slider logic ---------- */
  let t = 0; // 0..100
  function applyLayer(tt){
    t = tt;
    const cutX = THREE.MathUtils.lerp(CUT_FRONT, CUT_BACK, t/100);
    clipPlane.constant = cutX;

    const muscleOpacity = THREE.MathUtils.clamp((t-8)/28, 0, 1) * 0.5;
    muscleMat.opacity = muscleOpacity;
    const skelOpacity = THREE.MathUtils.clamp((t-18)/30, 0, 1) * 0.55;
    skeletonMat.opacity = skelOpacity;

    organMeshes.forEach(m=>{
      const reveal = cutX < (m.userData.pos[0] + 0.15);
      m.visible = reveal || t > 96;
      const targetOp = (reveal || t>96) ? 0.95 : 0;
      m.material.opacity += (targetOp - m.material.opacity) * 0.25;
    });

    scanGroup.visible = t > 0.5 && t < 99.5;
    scanGroup.position.x = cutX;

    document.querySelectorAll('.part-item').forEach(btn=>{
      const def = organDefs.find(o=>o.name===btn.dataset.organ);
      const on = def && (clipPlane.constant < (def.pos[0]+0.15) || t>96);
      btn.classList.toggle('active', !!on);
    });
  }
  applyLayer(0);

  const slider = document.getElementById('layerSlider');
  slider.addEventListener('input', (e)=> applyLayer(parseFloat(e.target.value)));

  /* ---------- Camera controls: drag rotate + momentum + pinch zoom ---------- */
  let isDragging = false, prevX = 0, prevY = 0;
  let rotY = 0.45, rotX = 0.1;
  let targetRotY = rotY, targetRotX = rotX;
  let velY = 0;
  let dist = 6.4, targetDist = 6.4;
  const minDist = 3.6, maxDist = 10.5;
  let autoRotate = false;
  let lastPinchDist = null;

  function pointerDown(x,y){ isDragging = true; prevX = x; prevY = y; velY = 0; }
  function pointerMove(x,y){
    if(!isDragging) return;
    const dx = x - prevX, dy = y - prevY;
    targetRotY += dx * 0.008;
    velY = dx * 0.0009;
    targetRotX = Math.max(-0.5, Math.min(0.6, targetRotX + dy * 0.006));
    prevX = x; prevY = y;
  }
  function pointerUp(){ isDragging = false; }

  const dom = renderer.domElement;
  dom.style.cursor = 'grab';
  dom.addEventListener('mousedown', e=>{ pointerDown(e.clientX,e.clientY); dom.style.cursor='grabbing'; });
  window.addEventListener('mousemove', e=>pointerMove(e.clientX,e.clientY));
  window.addEventListener('mouseup', ()=>{ pointerUp(); dom.style.cursor='grab'; });

  dom.addEventListener('touchstart', e=>{
    if(e.touches.length===2){
      lastPinchDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    } else {
      const t0=e.touches[0]; pointerDown(t0.clientX,t0.clientY);
    }
  }, {passive:true});
  dom.addEventListener('touchmove', e=>{
    if(e.touches.length===2){
      const d = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
      if(lastPinchDist!=null){ targetDist = Math.max(minDist, Math.min(maxDist, targetDist - (d-lastPinchDist)*0.02)); }
      lastPinchDist = d;
    } else {
      const t0=e.touches[0]; pointerMove(t0.clientX,t0.clientY);
    }
  }, {passive:true});
  dom.addEventListener('touchend', ()=>{ pointerUp(); lastPinchDist=null; });

  dom.addEventListener('wheel', e=>{
    e.preventDefault();
    targetDist = Math.max(minDist, Math.min(maxDist, targetDist + e.deltaY * 0.004));
  }, {passive:false});

  const btnAutoRotate = document.getElementById('btnAutoRotate');
  const btnResetView = document.getElementById('btnResetView');
  btnAutoRotate.addEventListener('click', ()=>{
    autoRotate = !autoRotate;
    btnAutoRotate.classList.toggle('active', autoRotate);
  });
  btnResetView.addEventListener('click', ()=>{
    targetRotY = 0.45; targetRotX = 0.1; targetDist = 6.4;
    slider.value = 0; applyLayer(0);
  });

  /* ---------- Hotspots (2D overlay synced to 3D organ positions) ---------- */
  const hotspotContainer = document.getElementById('holoHotspots');
  const hotspotEls = {};
  organDefs.forEach(o=>{
    const el = document.createElement('div');
    el.className = 'hotspot';
    el.innerHTML = `<span class="hotspot-dot" style="background:#${o.color.toString(16).padStart(6,'0')}"></span><span class="hotspot-chip">${o.label}</span>`;
    el.addEventListener('click', ()=> selectOrgan(o.name));
    hotspotContainer.appendChild(el);
    hotspotEls[o.name] = el;
  });

  const detailTitle = document.getElementById('organDetailTitle');
  const detailDesc = document.getElementById('organDetailDesc');
  function selectOrgan(name){
    const def = organDefs.find(o=>o.name===name);
    if(!def) return;
    const tMin = 100 * (CUT_FRONT - def.pos[0] - 0.15) / (CUT_FRONT - CUT_BACK);
    if(t < tMin){ slider.value = Math.min(100, tMin+2); applyLayer(parseFloat(slider.value)); }
    detailTitle.textContent = def.label;
    detailDesc.textContent = def.desc;
    document.querySelectorAll('.hotspot').forEach(h=>h.classList.remove('selected'));
    hotspotEls[name]?.classList.add('selected');
  }
  document.getElementById('partLegend').addEventListener('click', (e)=>{
    const btn = e.target.closest('.part-item');
    if(btn) selectOrgan(btn.dataset.organ);
  });

  const projVec = new THREE.Vector3();
  function updateHotspots(){
    organMeshes.forEach(m=>{
      const el = hotspotEls[m.userData.name];
      if(!el) return;
      const visible = m.visible && m.material.opacity > 0.3;
      el.classList.toggle('show', visible);
      if(!visible) return;
      projVec.copy(m.position).applyMatrix4(cowGroup.matrixWorld);
      projVec.project(camera);
      const x = (projVec.x*0.5+0.5) * stage.clientWidth;
      const y = (-projVec.y*0.5+0.5) * stage.clientHeight;
      el.style.left = x+'px'; el.style.top = y+'px';
    });
  }

  /* ---------- Render loop ---------- */
  const loadingEl = document.getElementById('holoLoading');
  let breathe = 0;
  function animate(){
    requestAnimationFrame(animate);

    if(autoRotate && !isDragging) targetRotY += 0.0025;
    if(!isDragging){ targetRotY += velY; velY *= 0.94; }

    rotY += (targetRotY - rotY) * 0.12;
    rotX += (targetRotX - rotX) * 0.12;
    dist += (targetDist - dist) * 0.12;

    camera.position.x = Math.sin(rotY) * dist;
    camera.position.z = Math.cos(rotY) * dist;
    camera.position.y = 1.2 + rotX * dist;
    camera.lookAt(0, 0.9, 0);

    breathe += 0.02;
    const breathScale = 1 + Math.sin(breathe)*0.006*(1-t/100);
    torso.scale.set(1,breathScale,breathScale);

    ringsGroup.rotation.y += 0.0015;
    if(scanGroup.visible){ scanDisc.material.opacity = 0.12 + Math.sin(breathe*2)*0.03; }

    updateHotspots();
    renderer.render(scene, camera);
  }
  animate();

  requestAnimationFrame(()=> requestAnimationFrame(()=> loadingEl.classList.add('hidden')));

  window.addEventListener('resize', ()=>{
    const w = stage.clientWidth, h = stage.clientHeight;
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setSize(w,h);
  });
})();

/* ============================================================
   FITUR 3 — KALKULATOR PAKAN OTOMATIS
   ============================================================ */
const formPakan = document.getElementById('formPakan');
formPakan.addEventListener('submit', (e)=>{
  e.preventDefault();
  const bobot = parseFloat(document.getElementById('pakanBobot').value);
  const fase = document.getElementById('pakanFase').value;
  const pbbh = parseFloat(document.getElementById('pakanPBBH').value) || 0;

  if(!bobot || bobot < 20 || bobot > 1200){
    alert('Masukkan berat badan ternak yang valid (20–1200 kg).');
    return;
  }

  // Kebutuhan Bahan Kering (BK) ~ 3% dari bobot badan (basis umum sapi potong)
  let bkPersen = 0.03;
  if(fase === 'pedet') bkPersen = 0.035;
  if(fase === 'laktasi') bkPersen = 0.032;
  if(fase === 'penggemukan') bkPersen = 0.028;
  const kebutuhanBK = bobot * bkPersen;

  // Tambahan BK untuk target PBBH (tiap 0.1 kg PBBH tambahan ~+2% BK, disederhanakan)
  const extraBK = kebutuhanBK * (pbbh * 0.15);
  const totalBK = kebutuhanBK + extraBK;

  // Kebutuhan Protein Kasar (PK) & TDN berbasis fase fisiologis (% dari BK)
  const kebutuhan = {
    pedet:        { pk:0.16, tdn:0.70 },
    dara:         { pk:0.13, tdn:0.65 },
    dewasa:       { pk:0.11, tdn:0.60 },
    laktasi:      { pk:0.15, tdn:0.68 },
    penggemukan:  { pk:0.14, tdn:0.72 },
  }[fase];

  const kebutuhanPK = totalBK * kebutuhan.pk;
  const kebutuhanTDN = totalBK * kebutuhan.tdn;
  const airMinum = bobot * 0.08; // liter/hari, estimasi 8% bobot badan

  // Rasio hijauan : konsentrat berdasarkan fase
  const rasio = {
    pedet:        [50,50],
    dara:         [65,35],
    dewasa:       [70,30],
    laktasi:      [55,45],
    penggemukan:  [40,60],
  }[fase];

  document.getElementById('outBK').textContent = totalBK.toFixed(2) + ' kg/hari';
  document.getElementById('outPK').textContent = kebutuhanPK.toFixed(2) + ' kg/hari';
  document.getElementById('outTDN').textContent = kebutuhanTDN.toFixed(2) + ' kg/hari';
  document.getElementById('outAir').textContent = airMinum.toFixed(1) + ' liter/hari';
  document.getElementById('outHijauan').textContent = (totalBK*rasio[0]/100).toFixed(2) + ' kg';
  document.getElementById('outKonsentrat').textContent = (totalBK*rasio[1]/100).toFixed(2) + ' kg';

  document.getElementById('ratioHijauanBar').style.width = rasio[0] + '%';
  document.getElementById('ratioHijauanBar').textContent = 'Hijauan ' + rasio[0] + '%';
  document.getElementById('ratioKonsentratBar').style.width = rasio[1] + '%';
  document.getElementById('ratioKonsentratBar').textContent = 'Konsentrat ' + rasio[1] + '%';

  document.getElementById('pakanResultPanel').style.display = 'block';
});

/* Tabel nutrisi — filter sederhana */
const feedFilter = document.getElementById('feedFilter');
feedFilter?.addEventListener('input', ()=>{
  const q = feedFilter.value.toLowerCase();
  document.querySelectorAll('table.nutrisi tbody tr').forEach(row=>{
    row.style.display = row.dataset.name.toLowerCase().includes(q) ? '' : 'none';
  });
});

/* ============================================================
   FITUR 4 — CHAT AI PETERNAKAN
   Chatbot berbasis pencocokan kata kunci pada basis pengetahuan
   terkurasi (bukan model generatif) — setiap jawaban disertai
   sumber rujukan, dan hanya merespons topik peternakan sapi.
   ============================================================ */
const KNOWLEDGE_BASE = [
  { id:'bcs', chip:'Apa itu BCS?', keywords:['bcs','skor kondisi tubuh','kondisi tubuh','body condition'],
    answer:`<b>Body Condition Score (BCS)</b> adalah metode penilaian visual &amp; perabaan untuk menilai cadangan lemak tubuh sapi, umumnya pada skala 1–5 (1 = sangat kurus, 5 = sangat gemuk). Penilaian dilakukan dengan meraba area tulang rusuk, pinggul, dan pangkal ekor. BCS ideal untuk sapi potong umumnya berada di kisaran 3. Anda bisa mencoba fitur "Skor Kondisi Tubuh" pada bagian Scan Ternak di halaman ini.`,
    source:'Direktorat Jenderal Peternakan &amp; Kesehatan Hewan (Ditjen PKH) Kementan RI; buku ajar Ilmu Ternak Potong dan Kerja, Fakultas Peternakan.' },

  { id:'bobot', chip:'Rumus menghitung bobot sapi?', keywords:['rumus bobot','hitung bobot','timbang sapi','lingkar dada','schoorl','winter','berat sapi'],
    answer:`Tanpa timbangan, bobot sapi bisa diestimasi dari <b>lingkar dada (LD)</b>:<ul><li><b>Rumus Schoorl:</b> BB (kg) = (LD+22)² / 100</li><li><b>Rumus Winter:</b> BB (kg) = (LD² × Panjang Badan) / 10.840</li></ul>Keduanya memberi estimasi, bukan angka pasti — makin dekat bentuk tubuh sapi dengan silinder, makin akurat hasilnya. Coba fitur kalkulator bobot di bagian Scan Ternak.`,
    source:'Standar umum peternakan Indonesia; buku ajar Ilmu Ternak Potong dan Kerja, Fakultas Peternakan.' },

  { id:'rasio-pakan', chip:'Rasio pakan hijauan & konsentrat?', keywords:['rasio pakan','hijauan konsentrat','perbandingan pakan','komposisi pakan'],
    answer:`Rasio hijauan:konsentrat bergantung pada fase fisiologis sapi — pedet ±50:50, sapi dara/dewasa ±70:30 (hijauan dominan untuk menjaga fungsi rumen), induk laktasi ±55:45, dan sapi penggemukan ±40:60 (konsentrat lebih tinggi untuk memacu pertambahan bobot). Coba Kalkulator Pakan di halaman ini untuk hasil sesuai bobot &amp; fase ternak Anda.`,
    source:'Balai Penelitian Ternak (Balitnak), Badan Penelitian dan Pengembangan Pertanian.' },

  { id:'pmk', chip:'Gejala & pencegahan PMK?', keywords:['pmk','penyakit mulut dan kuku','fmd','mulut kuku'],
    answer:`<b>Penyakit Mulut dan Kuku (PMK)</b> adalah penyakit virus yang sangat menular pada hewan berkuku belah. Gejala umum: demam, luka lepuh di mulut/lidah/gusi dan celah kuku, air liur berlebih, serta pincang. Pencegahan utama: vaksinasi rutin, menjaga biosekuriti kandang, membatasi lalu lintas ternak dari daerah wabah, dan segera melapor ke dinas peternakan/dokter hewan bila ada gejala.`,
    source:'Ditjen PKH Kementan RI; World Organisation for Animal Health (WOAH).' },

  { id:'antraks', chip:'Apa itu antraks pada ternak?', keywords:['antraks','anthrax'],
    answer:`<b>Antraks</b> adalah penyakit bakterial zoonosis (bisa menular ke manusia) yang disebabkan <i>Bacillus anthracis</i>. Gejala pada ternak bisa mendadak: demam tinggi, kesulitan bernapas, hingga kematian cepat. Karena berisiko zoonosis, bangkai ternak yang diduga antraks <b>tidak boleh dibedah/dikonsumsi</b> dan wajib segera dilaporkan ke petugas kesehatan hewan setempat. Pencegahan utama adalah vaksinasi rutin di daerah endemis.`,
    source:'Kementerian Kesehatan RI &amp; Ditjen PKH Kementan RI.' },

  { id:'kembung', chip:'Cara mencegah kembung rumen?', keywords:['kembung','bloat','timpani','perut kembung'],
    answer:`Kembung rumen (bloat) sering terjadi akibat konsumsi hijauan muda/leguminosa segar berlebihan yang cepat difermentasi dan menghasilkan gas berlebih yang terperangkap. Pencegahan: hindari pemberian hijauan leguminosa segar dalam jumlah besar secara tiba-tiba, lakukan penyesuaian pakan bertahap, dan sediakan sumber serat kasar (jerami) sebagai penyeimbang. Bila sapi sudah kembung parah (perut kiri membuncit, sesak napas), ini kondisi darurat — segera hubungi dokter hewan.`,
    source:'Buku ajar Ilmu Penyakit Ternak, Fakultas Kedokteran Hewan.' },

  { id:'cacingan', chip:'Tanda sapi cacingan?', keywords:['cacing','cacingan','parasit','deworming'],
    answer:`Tanda umum sapi cacingan: tubuh kurus meski nafsu makan normal, bulu kusam, perut buncit pada pedet, diare intermiten, dan pertumbuhan lambat. Program pengendalian cacing (deworming) umumnya dilakukan berkala sesuai anjuran dokter hewan setempat, disesuaikan dengan kondisi lingkungan &amp; usia ternak.`,
    source:'Ditjen PKH Kementan RI.' },

  { id:'mastitis', chip:'Apa itu mastitis?', keywords:['mastitis','radang ambing','susu'],
    answer:`<b>Mastitis</b> adalah peradangan pada ambing/kelenjar susu, biasanya akibat infeksi bakteri saat pemerahan yang kurang higienis. Tanda-tanda: ambing bengkak, merah, panas, nyeri saat diraba, serta susu menggumpal/berubah warna. Pencegahan utama: menjaga kebersihan kandang &amp; peralatan perah, teknik pemerahan yang benar, dan deteksi dini melalui pemeriksaan rutin.`,
    source:'Buku ajar Ilmu Produksi Ternak Perah, Fakultas Peternakan.' },

  { id:'birahi', chip:'Tanda-tanda sapi birahi?', keywords:['birahi','estrus','kawin','minta kawin'],
    answer:`Tanda birahi pada sapi betina dikenal dengan istilah <b>3A</b>: <i>Abang</i> (vulva memerah), <i>Abuh</i> (bengkak), dan <i>Anget</i> (hangat saat diraba) — disertai keluarnya lendir bening dan sapi lebih gelisah/sering menaiki sapi lain. Siklus birahi normal berulang sekitar tiap 18–24 hari (rata-rata 21 hari) bila tidak terjadi kebuntingan.`,
    source:'Buku ajar Ilmu Reproduksi Ternak, Fakultas Peternakan.' },

  { id:'ib', chip:'Apa itu inseminasi buatan (IB)?', keywords:['inseminasi buatan','kawin suntik',' ib ','ib sapi'],
    answer:`<b>Inseminasi Buatan (IB)</b> adalah teknik memasukkan semen beku pejantan unggul ke saluran reproduksi betina tanpa perkawinan alami, dilakukan oleh inseminator terlatih. Manfaatnya: mempercepat perbaikan genetik, mencegah penularan penyakit kelamin, dan efisiensi biaya pemeliharaan pejantan. Waktu IB yang tepat mengikuti kaidah umum "AM-PM rule" — birahi pagi diinseminasi sore, birahi sore diinseminasi esok pagi.`,
    source:'Ditjen PKH Kementan RI — Program Upsus SIWAB (Sapi Indukan Wajib Bunting).' },

  { id:'bunting', chip:'Berapa lama masa bunting sapi?', keywords:['bunting','kebuntingan','hamil sapi','gestasi','masa kandungan'],
    answer:`Masa kebuntingan sapi rata-rata sekitar <b>283 hari (± 9 bulan 9 hari)</b>, meski bisa bervariasi antar bangsa sapi. Tanda-tanda kebuntingan meliputi tidak munculnya birahi ulang, perut membesar secara bertahap, dan ambing mulai berkembang menjelang kelahiran. Pemeriksaan kebuntingan (PKB) sebaiknya dilakukan oleh dokter hewan sekitar 60–90 hari pasca kawin/IB untuk kepastian.`,
    source:'Buku ajar Ilmu Reproduksi Ternak, Fakultas Peternakan.' },

  { id:'kolostrum', chip:'Pentingnya kolostrum untuk pedet?', keywords:['kolostrum','pedet baru lahir','anak sapi lahir','pedet lahir'],
    answer:`<b>Kolostrum</b> (susu pertama induk) sangat penting karena mengandung antibodi (imunoglobulin) yang memberi kekebalan pasif bagi pedet yang baru lahir tanpa kekebalan alami. Pedet idealnya mendapat kolostrum sesegera mungkin dalam beberapa jam pertama setelah lahir, karena kemampuan usus menyerap antibodi menurun cepat seiring waktu.`,
    source:'Ditjen PKH Kementan RI; buku ajar Ilmu Ternak Potong dan Kerja.' },

  { id:'jenis-sapi', chip:'Jenis sapi lokal Indonesia?', keywords:['jenis sapi','sapi bali','sapi ongole','sapi po','bangsa sapi','sapi madura'],
    answer:`Beberapa bangsa sapi populer di Indonesia: <b>Sapi Bali</b> (kompak, adaptif, efisien pakan, banyak dipelihara di NTT &amp; Bali), <b>Sapi Ongole/PO (Peranakan Ongole)</b> (tubuh besar, tahan panas, berpunuk), dan <b>Sapi Madura</b> (kecil, tahan kondisi kering, cocok untuk lahan marginal). Pemilihan bangsa biasanya disesuaikan dengan kondisi iklim, ketersediaan pakan, dan tujuan pemeliharaan (potong/kerja).`,
    source:'Balai Penelitian Ternak (Balitnak), Badan Litbang Pertanian.' },

  { id:'penggemukan', chip:'Prinsip dasar penggemukan sapi?', keywords:['penggemukan','fattening','gemukkan sapi','pbbh'],
    answer:`Prinsip dasar penggemukan sapi: (1) pemilihan bakalan sehat &amp; berumur sesuai target, (2) pemberian pakan tinggi energi dengan porsi konsentrat lebih besar (±60%), (3) pemberian air &amp; mineral cukup, dan (4) periode penggemukan umumnya 3–4 bulan dengan target Pertambahan Bobot Badan Harian (PBBH) yang dipantau berkala. Coba Kalkulator Pakan di halaman ini dengan fase "Penggemukan" untuk estimasi kebutuhan hariannya.`,
    source:'Ditjen PKH Kementan RI.' },

  { id:'kandang', chip:'Standar kandang sapi yang baik?', keywords:['kandang','manajemen kandang','desain kandang','luas kandang'],
    answer:`Kandang sapi yang baik memperhatikan: ventilasi udara lancar (mengurangi panas &amp; amonia), lantai tidak licin dengan kemiringan untuk drainase, luas ideal ±2–3 m² per ekor untuk sapi dewasa, arah kandang membujur timur-barat agar tidak terlalu terpapar matahari langsung, serta akses mudah untuk pakan &amp; pembersihan kotoran.`,
    source:'Buku ajar Ilmu Tata Laksana Ternak Potong, Fakultas Peternakan.' },

  { id:'vaksinasi', chip:'Pentingnya vaksinasi ternak?', keywords:['vaksin','vaksinasi','imunisasi ternak'],
    answer:`Vaksinasi rutin membantu mencegah penyakit menular yang berdampak besar secara ekonomi, seperti Penyakit Mulut &amp; Kuku (PMK), Septicaemia Epizootica/SE (ngorok), dan antraks di daerah endemis. Jadwal &amp; jenis vaksin sebaiknya mengikuti anjuran dokter hewan atau dinas peternakan setempat, karena bisa berbeda tergantung wilayah &amp; status wabah.`,
    source:'Ditjen PKH Kementan RI.' },

  { id:'air-minum', chip:'Kebutuhan air minum sapi?', keywords:['air minum','kebutuhan air','minum sapi'],
    answer:`Kebutuhan air minum sapi diperkirakan sekitar <b>8% dari bobot badan per hari</b> dalam kondisi normal, dan bisa meningkat pada cuaca panas atau sapi laktasi. Air bersih &amp; tersedia terus-menerus (ad libitum) sangat penting karena kekurangan air memengaruhi konsumsi pakan &amp; produktivitas. Nilai ini juga digunakan pada Kalkulator Pakan di halaman ini.`,
    source:'Buku ajar Ilmu Nutrisi Ternak, Fakultas Peternakan.' },

  { id:'mineral', chip:'Perlu suplemen mineral/garam?', keywords:['mineral','garam blok','mineral block','suplemen mineral'],
    answer:`Ya — suplemen mineral (garam blok/mineral mix) penting untuk melengkapi kebutuhan mikro seperti kalsium, fosfor, dan garam yang tidak selalu tercukupi dari hijauan/konsentrat biasa. Umumnya diberikan secara <i>ad libitum</i> (bebas dijilat kapan saja) di dalam kandang.`,
    source:'Balai Penelitian Ternak (Balitnak), Badan Litbang Pertanian.' },

  { id:'ciri-sehat', chip:'Ciri-ciri sapi sehat?', keywords:['ciri sapi sehat','tanda sapi sakit','sapi sehat','sapi sakit'],
    answer:`Ciri sapi sehat umumnya: nafsu makan &amp; minum normal, mata cerah &amp; tidak berair berlebihan, hidung lembab (tidak kering pecah-pecah atau basah berlebihan), bulu mengkilap &amp; tidak kusam, kotoran berbentuk normal, gerak lincah, serta suhu tubuh normal berkisar 38–39°C. Perubahan mendadak pada tanda-tanda ini patut diwaspadai dan sebaiknya diperiksa dokter hewan.`,
    source:'Buku ajar Ilmu Penyakit Ternak, Fakultas Kedokteran Hewan.' },

  { id:'tentang-app', chip:'Fitur apa saja di SMARTCOW AI?', keywords:['smartcow','aplikasi ini','fitur aplikasi','siapa pembuat','pengembang'],
    answer:`<b>SMARTCOW AI</b> memiliki 4 fitur utama: (1) <i>Scan Ternak</i> — pemantauan CCTV real-time berbasis AI untuk mendeteksi sapi/manusia, plus kalkulator bobot &amp; BCS, (2) <i>Edukasi 3D</i> — hologram anatomi sapi interaktif, (3) <i>Kalkulator Pakan</i> — kebutuhan nutrisi otomatis, dan (4) <i>Chat AI Peternakan</i> ini. Aplikasi dikembangkan oleh mahasiswa Peternakan, Universitas Nusa Cendana.`,
    source:'Tim Pengembang SMARTCOW AI — Ravles Glorydo Noni, Maria Magdalena Ule, Pricilia Citradewi Antoni.' },

  { id:'peternakan-umum', chip:'Apa itu ilmu peternakan?', keywords:['ilmu peternakan','apa itu peternakan','definisi peternakan'],
    answer:`<b>Ilmu peternakan</b> adalah cabang ilmu terapan yang mempelajari pemeliharaan, pembudidayaan, dan pengembangan hewan ternak (termasuk sapi, kambing, unggas, dll) untuk menghasilkan pangan (daging, susu, telur), tenaga kerja, maupun produk turunan lain secara efisien &amp; berkelanjutan — mencakup aspek nutrisi, reproduksi, kesehatan, genetika, hingga manajemen usaha.`,
    source:'Buku ajar Pengantar Ilmu Peternakan, Fakultas Peternakan.' },
];

const DOMAIN_WORDS = ['sapi','ternak','peternak','peternakan','pakan','kandang','hijauan','konsentrat',
  'pedet','bakalan','indukan','penggemukan','bcs','bobot','penyakit','vaksin','birahi','estrus','reproduksi',
  'susu','daging','rumput','jerami','kesehatan hewan','dokter hewan','kuku','mastitis','antraks','pmk',
  'cacing','kolostrum','inseminasi',' ib ','bunting','kebuntingan','mineral','garam','air minum','smartcow'];

function matchKnowledge(rawInput){
  const input = ' ' + rawInput.toLowerCase().trim() + ' ';
  let best = null, bestScore = 0;
  KNOWLEDGE_BASE.forEach(entry=>{
    let score = 0;
    entry.keywords.forEach(kw=>{ if(input.includes(kw.toLowerCase())) score += kw.length; });
    if(score > bestScore){ bestScore = score; best = entry; }
  });
  if(best && bestScore > 0) return best;

  const isDomain = DOMAIN_WORDS.some(w => input.includes(w));
  return isDomain ? 'domain-nomatch' : 'out-of-scope';
}

const chatBody = document.getElementById('chatBody');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatSuggestions = document.getElementById('chatSuggestions');

function renderChatChips(){
  chatSuggestions.innerHTML = '';
  const picks = ['bcs','bobot','rasio-pakan','birahi','penggemukan','jenis-sapi'];
  picks.forEach(id=>{
    const entry = KNOWLEDGE_BASE.find(k=>k.id===id);
    if(!entry) return;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chat-chip';
    chip.textContent = entry.chip;
    chip.addEventListener('click', ()=> submitChat(entry.chip));
    chatSuggestions.appendChild(chip);
  });
}
renderChatChips();

function addUserBubble(text){
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg user';
  wrap.innerHTML = `<div class="chat-bubble"></div>`;
  wrap.querySelector('.chat-bubble').textContent = text;
  chatBody.appendChild(wrap);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addBotTyping(){
  const wrap = document.createElement('div');
  wrap.className = 'chat-msg bot';
  wrap.id = 'chatTypingBubble';
  wrap.innerHTML = `<div class="chat-bubble"><div class="chat-typing"><span></span><span></span><span></span></div></div>`;
  chatBody.appendChild(wrap);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function resolveBotAnswer(match){
  if(match === 'out-of-scope'){
    return { html:`Maaf, saya hanya menjawab pertanyaan seputar <b>dunia peternakan sapi</b> (pakan, kesehatan, reproduksi, manajemen kandang, dan sejenisnya) 🙏 Pertanyaan tersebut berada di luar cakupan saya. Coba tanyakan topik peternakan, misalnya lewat saran di bawah.`, source:null };
  }
  if(match === 'domain-nomatch'){
    return { html:`Topik ini terdengar berkaitan dengan peternakan, tapi saya belum memiliki jawaban spesifik untuk itu di basis pengetahuan saya. Coba gunakan kata kunci lain, atau pilih salah satu topik yang tersedia di bawah ini.`, source:null };
  }
  return { html:match.answer, source:match.source };
}

function submitChat(text){
  const trimmed = text.trim();
  if(!trimmed) return;
  addUserBubble(trimmed);
  chatInput.value = '';
  addBotTyping();

  const match = matchKnowledge(trimmed);
  const delay = 500 + Math.random()*500;
  setTimeout(()=>{
    const typingEl = document.getElementById('chatTypingBubble');
    if(typingEl) typingEl.remove();
    const { html, source } = resolveBotAnswer(match);
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg bot';
    wrap.innerHTML = `<div class="chat-bubble">${html}${source ? `<div class="chat-source">📚 <span><b>Sumber:</b> ${source}</span></div>` : ''}</div>`;
    chatBody.appendChild(wrap);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, delay);
}

chatForm?.addEventListener('submit', (e)=>{
  e.preventDefault();
  submitChat(chatInput.value);
});

/* Tahun footer */
document.getElementById('yearNow').textContent = new Date().getFullYear();
