// ============================================================
//  untuk Elinn — script.js
// ============================================================

/* ---------------------------------------------------------
   1. BACKGROUND: canvas particles (hearts, stars, glow dots)
--------------------------------------------------------- */
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let W, H;

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// keep particle count low for weak devices
const PARTICLE_COUNT = window.innerWidth < 500 ? 22 : 40;

function rand(min, max) { return Math.random() * (max - min) + min; }

const particles = [];
const PARTICLE_TYPES = ['star', 'heart', 'glow'];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push({
    x: rand(0, W),
    y: rand(0, H),
    size: rand(2, 6),
    speed: rand(0.1, 0.5),
    drift: rand(-0.3, 0.3),
    type: PARTICLE_TYPES[Math.floor(Math.random() * PARTICLE_TYPES.length)],
    alpha: rand(0.3, 0.9),
    twinkle: rand(0.005, 0.02)
  });
}

let calmMode = false; // becomes true after the 100-scene sequence

function drawHeartShape(x, y, size, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(size / 10, size / 10);
  ctx.beginPath();
  ctx.moveTo(0, 3);
  ctx.bezierCurveTo(0, 0, -5, 0, -5, -3);
  ctx.bezierCurveTo(-5, -6, 0, -6, 0, -3);
  ctx.bezierCurveTo(0, -6, 5, -6, 5, -3);
  ctx.bezierCurveTo(5, 0, 0, 0, 0, 3);
  ctx.closePath();
  ctx.fillStyle = '#ff6fa5';
  ctx.fill();
  ctx.restore();
}

function animateBackground() {
  ctx.clearRect(0, 0, W, H);

  for (const p of particles) {
    p.y -= p.speed;
    p.x += p.drift;
    p.alpha += p.twinkle;
    if (p.alpha > 0.9 || p.alpha < 0.2) p.twinkle *= -1;

    if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
    if (p.x < -10) p.x = W + 10;
    if (p.x > W + 10) p.x = -10;

    const alpha = calmMode ? p.alpha * 0.5 : p.alpha;

    if (p.type === 'star') {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size / 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.type === 'heart') {
      drawHeartShape(p.x, p.y, p.size, alpha);
    } else {
      ctx.save();
      ctx.globalAlpha = alpha * 0.5;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      grad.addColorStop(0, 'rgba(255,150,190,0.8)');
      grad.addColorStop(1, 'rgba(255,150,190,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  requestAnimationFrame(animateBackground);
}
requestAnimationFrame(animateBackground);

/* ---------------------------------------------------------
   2. TOMBOL "tidak." — selalu kabur dari pointer
--------------------------------------------------------- */
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const btnRow = document.getElementById('btnRow') || document.querySelector('.btn-row');

function placeNoBtnInitial() {
  const rect = noBtn.getBoundingClientRect();
  const safeX = window.innerWidth / 2 - rect.width / 2 - 60;
  const safeY = window.innerHeight * 0.62;
  noBtn.style.left = `${safeX}px`;
  noBtn.style.top = `${safeY}px`;
}

function moveNoBtnRandom() {
  const rect = noBtn.getBoundingClientRect();
  const margin = 12;
  const maxX = window.innerWidth - rect.width - margin;
  const maxY = window.innerHeight - rect.height - margin;
  const newX = Math.max(margin, Math.min(maxX, rand(margin, maxX)));
  const newY = Math.max(margin, Math.min(maxY, rand(margin, maxY)));
  noBtn.style.left = `${newX}px`;
  noBtn.style.top = `${newY}px`;
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

// dodge when pointer gets close, using Pointer Events (works for mouse/touch/pen)
const DODGE_RADIUS = 90;

window.addEventListener('pointermove', (e) => {
  if (noBtn.offsetParent === null) return;
  const rect = noBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  if (distance(e.clientX, e.clientY, cx, cy) < DODGE_RADIUS) {
    moveNoBtnRandom();
  }
});

// also dodge on any attempt to press it directly (covers touch taps)
noBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  moveNoBtnRandom();
});

// prevent the "tidak" button from ever truly triggering a click
noBtn.addEventListener('click', (e) => {
  e.preventDefault();
  moveNoBtnRandom();
});

window.addEventListener('resize', () => {
  // keep button inside viewport bounds on resize
  const rect = noBtn.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width - 12;
  const maxY = window.innerHeight - rect.height - 12;
  const curX = parseFloat(noBtn.style.left) || 0;
  const curY = parseFloat(noBtn.style.top) || 0;
  noBtn.style.left = `${Math.min(curX, maxX)}px`;
  noBtn.style.top = `${Math.min(curY, maxY)}px`;
});

placeNoBtnInitial();

/* ---------------------------------------------------------
   3. TOMBOL "iyaa" — mulai musik + rangkaian scene
--------------------------------------------------------- */
const bgMusic = document.getElementById('bgMusic');
const bgMusic2 = document.getElementById('bgMusic2');
const questionScreen = document.getElementById('questionScreen');
const sceneScreen = document.getElementById('sceneScreen');
const sceneText = document.getElementById('sceneText');
const finalScreen = document.getElementById('finalScreen');

yesBtn.addEventListener('click', () => {
  bgMusic.volume = 0.5;
  bgMusic.play().catch(() => {
    // autoplay might be blocked until further interaction; ignored silently
  });

  questionScreen.classList.add('fading-out');
  setTimeout(() => {
    questionScreen.classList.add('hidden');
    sceneScreen.classList.remove('hidden');
    startSceneSequence();
  }, 550);
});

/* ---------------------------------------------------------
   4. 100 SCENE ROMANTIS
--------------------------------------------------------- */
const scenes = [
  "haii Elinn...", "ini aku", "Rendy.", "buat kamu", "orang favoritku.",
  "aku cuma", "mau bilang", "sesuatu.", "sesuatu yang", "sebenarnya sederhana.",
  "tapi berarti", "banget buat aku.", "aku sayang", "sama kamu.", "banget.",
  "beneran.", "bukan bercanda.", "bukan main-main.", "aku bersyukur", "kenal kamu.",
  "aku bersyukur", "kita bertemu.", "dari sekian", "banyak orang", "aku menemukan",
  "kamu.", "dan jujur...", "aku senang.", "sangat senang.", "kamu hadir.",
  "kamu bertahan.", "kamu mendengarkan.", "kamu memahami.", "kamu menerima.", "bahkan ketika",
  "aku menyebalkan.", "bahkan ketika", "aku salah.", "bahkan ketika", "aku keras kepala.",
  "aku tahu", "aku belum sempurna.", "jauh dari sempurna.", "aku masih belajar.", "belajar memahami.",
  "belajar mengerti.", "belajar menjaga.", "belajar mencintai.", "aku ingin", "terus belajar",
  "bersama kamu.", "aku ingin", "kita tumbuh.", "bersama.", "pelan-pelan.",
  "sedikit demi sedikit.", "tanpa terburu-buru.", "tanpa menyerah.", "kalau ada masalah", "kita hadapi.",
  "kalau ada salah", "kita perbaiki.", "kalau ada sedih", "kita temani.", "kalau ada takut",
  "kita tenangkan.", "kalau ada jarak", "kita lewati.", "kalau ada rindu", "kita simpan.",
  "kalau ada bahagia", "kita rayakan.", "aku ingin", "lebih banyak", "cerita.",
  "lebih banyak", "tawa.", "lebih banyak", "kenangan.", "lebih banyak",
  "waktu.", "lebih banyak", "tentang kita.", "aku ingin", "tetap memilih",
  "kamu.", "hari ini.", "besok.", "lusa.", "dan seterusnya.",
  "selama kita", "masih mau", "berusaha.", "selama kita", "masih saling",
  "memilih.", "aku akan", "tetap sayang", "sama kamu.", "Elinn."
];

const FX_LIST = [
  'fx-fadein', 'fx-scaleup', 'fx-glow', 'fx-fadein', 'fx-zoomin',
  'fx-blurclear', 'fx-float', 'fx-drift', 'fx-sparkle', 'fx-zoomout',
  'fx-minimal', 'fx-heartbeat', 'fx-clearblur', 'fx-minimal', 'fx-fadein'
];

function pickFx(index) {
  // deterministic-ish variety, avoid repeating the same fx twice in a row
  const fx = FX_LIST[index % FX_LIST.length];
  return fx;
}

const SCENE_DURATION = 200; // ms per scene
const MUSIC_FADE_OUT_MS = 1600; // music.mp3 melembut menjelang scene terakhir
const MUSIC1_VOLUME = 0.5;
const MUSIC2_VOLUME = 0.5;
let sceneIndex = 0;
let sceneTimer = null;
let music1FadeStarted = false;

// helper: fade an <audio> element's volume smoothly over `duration` ms
function fadeVolume(audioEl, fromVol, toVol, duration, onDone) {
  const steps = Math.max(6, Math.round(duration / 60));
  const stepTime = duration / steps;
  let step = 0;
  const interval = setInterval(() => {
    step++;
    const progress = step / steps;
    audioEl.volume = Math.max(0, Math.min(1, fromVol + (toVol - fromVol) * progress));
    if (step >= steps) {
      clearInterval(interval);
      if (onDone) onDone();
    }
  }, stepTime);
}

function renderScene(index) {
  const fx = pickFx(index);
  sceneText.className = 'scene-text'; // reset classes
  // force reflow so the animation restarts every time
  void sceneText.offsetWidth;
  sceneText.textContent = scenes[index];
  sceneText.classList.add(fx);
}

function startSceneSequence() {
  sceneIndex = 0;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const targetIndex = Math.floor(elapsed / SCENE_DURATION);

    if (targetIndex !== sceneIndex && targetIndex < scenes.length) {
      sceneIndex = targetIndex;
      renderScene(sceneIndex);
    } else if (sceneIndex === 0 && elapsed < SCENE_DURATION) {
      renderScene(0);
    }

    // mulai melembutkan music.mp3 menjelang scene terakhir
    const totalDuration = scenes.length * SCENE_DURATION;
    if (!music1FadeStarted && elapsed >= totalDuration - MUSIC_FADE_OUT_MS) {
      music1FadeStarted = true;
      fadeVolume(bgMusic, bgMusic.volume, 0, MUSIC_FADE_OUT_MS, () => {
        bgMusic.pause();
      });
    }

    if (sceneIndex >= scenes.length - 1 && elapsed >= totalDuration) {
      finishSceneSequence();
      return;
    }
    sceneTimer = requestAnimationFrame(tick);
  }
  sceneTimer = requestAnimationFrame(tick);
}

/* ---------------------------------------------------------
   5. SETELAH SCENE KE-100 — pesan utama
--------------------------------------------------------- */
const finalMessageEl = document.getElementById('finalMessage');
const heartBtn = document.getElementById('heartBtn');
const thanksMessageEl = document.getElementById('thanksMessage');
const blackout = document.getElementById('blackout');

const FINAL_MESSAGE = "hai Elinn, ini aku Rendy. aku cinta banget sama kamu, dan aku ga bakalan mauu kehilangan kamuu. kitaa usahainnn bareng terusss yaaa. pokok nya akuu cintaa bangettt sama kamuuuuu";
const THANKS_MESSAGE = "makasih yaa udahh mau nerima aku apa ada nya";

function finishSceneSequence() {
  cancelAnimationFrame(sceneTimer);
  sceneScreen.classList.add('fading-out');

  setTimeout(() => {
    sceneScreen.classList.add('hidden');
    calmMode = true; // background becomes calmer

    finalScreen.classList.remove('hidden');
    revealFinalMessage();
  }, 1000); // jeda ~1 detik
}

function revealFinalMessage() {
  finalMessageEl.textContent = '';
  finalMessageEl.style.opacity = '1';
  const words = FINAL_MESSAGE.split(' ');
  const revealDuration = words.length * 140;

  // music2 mulai main dari volume 0, lalu muncul perlahan bareng teks berikutnya
  bgMusic2.volume = 0;
  bgMusic2.currentTime = 0;
  bgMusic2.play().catch(() => {});
  fadeVolume(bgMusic2, 0, MUSIC2_VOLUME, revealDuration);

  let i = 0;
  function addWord() {
    if (i >= words.length) return;
    finalMessageEl.textContent += (i === 0 ? '' : ' ') + words[i];
    i++;
    setTimeout(addWord, 140);
  }
  addWord();
}

/* ---------------------------------------------------------
   6. TOMBOL HATI
--------------------------------------------------------- */
function spawnMiniHearts(originX, originY, count = 14) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'mini-heart';
    el.textContent = '❤';
    el.style.left = `${originX + rand(-40, 40)}px`;
    el.style.top = `${originY + rand(-20, 20)}px`;
    el.style.color = `hsl(${rand(330, 350)}, 90%, 65%)`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1700);
  }
}

let heartPressed = false;

heartBtn.addEventListener('click', () => {
  if (heartPressed) return;
  heartPressed = true;

  heartBtn.classList.add('pressed');
  const rect = heartBtn.getBoundingClientRect();
  spawnMiniHearts(rect.left + rect.width / 2, rect.top + rect.height / 2);

  thanksMessageEl.textContent = THANKS_MESSAGE;
  thanksMessageEl.classList.remove('hidden');

  // background fades to black, music2 fades out, everything disappears
  setTimeout(() => {
    document.body.classList.add('going-dark');
    fadeVolume(bgMusic2, bgMusic2.volume, 0, 4500, () => bgMusic2.pause());
    blackout.classList.add('active');

    setTimeout(() => {
      finalScreen.style.opacity = '0';
    }, 400);
  }, 1200);
});
