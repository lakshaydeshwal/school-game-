/**
 * REDLINE RUSH
 * BY LAKSHAY DESHWAL
 * 
 * Clean Cyberpunk Arcade Engine
 * - ONLY 2 sounds: CH_1 out (CH_1.mp3) and CH_2 out (CH_2.mp3)
 * - All other sounds removed as requested
 * - Full uncropped character images in real dimensions
 * - Mobile optimized touch controls and layout
 */

// ============================================================================
// 1. REUSABLE CHARACTER SYSTEM
// ============================================================================
const characters = [
  {
    id: "CH_1",
    name: "Aditya Jatik",
    image: "https://i.postimg.cc/4dBqBtNB/CH-1.png",
    localImage: "CH_1.png",
    sound: "CH_1.mp3",
    className: "Class 10",
    birthYear: 2011,
    father: "Sanjeev",
    mother: "Shweta",
    trait: "LANGDA BOY"
  },
  {
    id: "CH_2",
    name: "Pari Goyal",
    image: "https://i.postimg.cc/dQNgC8fG/CH-2.png",
    localImage: "CH_2.png",
    sound: "CH_2.mp3",
    className: "Class 10",
    birthYear: 2011,
    father: "Sachin",
    mother: "Ritu",
    trait: "NATKHAT BACHAA"
  }
];

let selectedCharacter = characters[0];
let soundEnabled = true;

// ============================================================================
// 2. IMAGE PRELOADER (Loads full real dimension images)
// ============================================================================
const characterImages = {};

function preloadCharacterImages() {
  characters.forEach(char => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = char.image;
    img.onerror = () => {
      if (img.src !== char.localImage) {
        img.src = char.localImage;
      }
    };
    characterImages[char.id] = img;
  });
}

function getCharacterImage(char) {
  const img = characterImages[char.id];
  if (img && img.complete && img.naturalWidth > 0) {
    return img;
  }
  return null;
}

// ============================================================================
// 3. SOUND CONTROLLER (ONLY 2 SOUNDS: CH_1 OUT & CH_2 OUT)
// ============================================================================
class SoundController {
  constructor() {
    this.audioCtx = null;
    this.charAudios = {};
    this.initAudioElements();
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initAudioElements() {
    characters.forEach(char => {
      try {
        const audio = new Audio(char.sound);
        audio.preload = 'auto';
        this.charAudios[char.id] = audio;
      } catch (e) {}
    });
  }

  // All clicks, flaps, and score sounds are REMOVED.
  // ONLY character OUT sound plays:
  playCharacterOut(character) {
    if (!soundEnabled) return;
    this.ensureContext();

    // 1. Play supplied character MP3 file
    const audioEl = this.charAudios[character.id] || new Audio(character.sound);
    if (audioEl) {
      audioEl.currentTime = 0;
      audioEl.play().catch(() => {});
    }

    // 2. Synthesize distinctly different out sounds for CH_1 vs CH_2
    if (this.audioCtx) {
      try {
        const now = this.audioCtx.currentTime;

        if (character.id === 'CH_1') {
          // CH_1 OUT: Heavy deep robotic slam crunch (Distinct signature)
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(32, now + 0.65);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.66);
        } else {
          // CH_2 OUT: High-pitched playful cyber zap crunch (Distinct signature)
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.55);

          gain.gain.setValueAtTime(0.38, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.56);
        }

        // Low impact rumble noise
        const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.25);
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.25, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        noise.connect(noiseGain);
        noiseGain.connect(this.audioCtx.destination);
        noise.start(now);
      } catch (e) {}
    }
  }
}

const sounds = new SoundController();

// ============================================================================
// 4. SCREEN NAVIGATION
// ============================================================================
const screens = {
  intro: document.getElementById('screen-intro'),
  select: document.getElementById('screen-select'),
  preview: document.getElementById('screen-preview'),
  game: document.getElementById('screen-game'),
  gameover: document.getElementById('screen-gameover')
};

function switchScreen(screenKey) {
  Object.keys(screens).forEach(key => {
    if (screens[key]) screens[key].classList.remove('active');
  });
  if (screens[screenKey]) screens[screenKey].classList.add('active');
}

// ============================================================================
// 5. INTRO SEQUENCE (~3s Clean)
// ============================================================================
let introTimer = null;

function runIntroSequence() {
  const fill = document.getElementById('boot-progress-fill');
  const statusMsg = document.getElementById('boot-status-text');
  const msgs = [
    'CONNECTING TO CYBERNET...',
    'SYNCING PILOT MATRICES...',
    'ENGAGING REDLINE ENGINE...',
    'SYSTEM READY // BOOT COMPLETE.'
  ];
  let step = 0;

  const interval = setInterval(() => {
    step++;
    if (fill) fill.style.width = `${Math.min(100, step * 25)}%`;
    if (statusMsg && msgs[step - 1]) statusMsg.textContent = msgs[step - 1];
    if (step >= 4) clearInterval(interval);
  }, 700);

  introTimer = setTimeout(() => {
    completeIntro();
  }, 3000);

  const skipBtn = document.getElementById('btn-skip-intro');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      clearTimeout(introTimer);
      clearInterval(interval);
      completeIntro();
    });
  }
}

function completeIntro() {
  switchScreen('select');
  renderCharacterSelection();
}

// ============================================================================
// 6. CHARACTER SELECTION (Full Uncropped Real Images & Clean Mobile UI)
// ============================================================================
function renderCharacterSelection() {
  const container = document.getElementById('characters-container');
  if (!container) return;

  container.innerHTML = '';

  characters.forEach((char, index) => {
    const card = document.createElement('div');
    const slideClass = index % 2 === 0 ? 'card-slide-left' : 'card-slide-right';
    const isSelected = selectedCharacter && selectedCharacter.id === char.id;
    const indexTag = index === 0 ? '01 // 01' : '02 // 02';
    const pilotTag = `${char.id} // PILOT`;

    card.className = `character-card ${slideClass} ${isSelected ? 'selected' : ''}`;
    card.setAttribute('data-id', char.id);

    card.innerHTML = `
      <div class="card-header-idx">${indexTag}</div>
      <div class="card-vertical-tag">REDLINE // ROSTER</div>
      <div class="card-pilot-tag">${pilotTag}</div>
      
      <!-- Full Character Image in Real Dimensions, 100% visible -->
      <div class="char-portrait-container">
        <img src="${char.image}" onerror="this.onerror=null;this.src='${char.localImage}';" alt="${char.name}" class="char-portrait-img" />
      </div>

      <div class="char-details">
        <div class="char-name-row">
          <h3 class="char-name">${char.name.toUpperCase()}</h3>
          <span class="char-arrow-icon">↗</span>
        </div>
        
        <div class="char-meta-row">
          <span>CLASS 10</span>
          <span class="meta-diamond">◆</span>
          <span>BORN ${char.birthYear}</span>
        </div>

        <div class="char-parents-row">
          <span>Father: ${char.father}</span>
          <span class="parents-slash">/</span>
          <span>Mother: ${char.mother}</span>
        </div>

        <div class="card-divider-line"></div>

        <div class="char-bottom-row">
          <span class="trait-quote">“${char.trait}”</span>
          <span class="select-action-state ${isSelected ? 'is-selected' : ''}">
            ${isSelected ? '✓ SELECTED' : 'SELECT →'}
          </span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      selectCharacter(char);
    });

    container.appendChild(card);
  });

  updateSelectionUI();
}

function selectCharacter(char) {
  selectedCharacter = char;

  const cards = document.querySelectorAll('.character-card');
  cards.forEach(card => {
    const isThis = card.getAttribute('data-id') === char.id;
    card.classList.toggle('selected', isThis);
    
    const actionState = card.querySelector('.select-action-state');
    if (actionState) {
      actionState.className = `select-action-state ${isThis ? 'is-selected' : ''}`;
      actionState.textContent = isThis ? '✓ SELECTED' : 'SELECT →';
    }
  });

  updateSelectionUI();
}

function updateSelectionUI() {
  const dockName = document.getElementById('dock-pilot-name');
  if (selectedCharacter && dockName) {
    dockName.textContent = selectedCharacter.name.toUpperCase();
  }
}

// ============================================================================
// 7. ABILITY / DOSSIER MODAL
// ============================================================================
function showAbilityModal() {
  if (!selectedCharacter) return;

  const modal = document.getElementById('modal-ability');
  const modalBody = document.getElementById('ability-modal-body');
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="modal-pilot-hero">
      <img src="${selectedCharacter.image}" onerror="this.onerror=null;this.src='${selectedCharacter.localImage}';" alt="${selectedCharacter.name}" class="modal-pilot-avatar" />
      <div class="modal-pilot-title">
        <h4 class="modal-pilot-name">${selectedCharacter.name.toUpperCase()}</h4>
      </div>
    </div>

    <div class="dossier-table">
      <div class="dossier-row">
        <span class="dossier-lbl">CLASS:</span>
        <span class="dossier-val">${selectedCharacter.className}</span>
      </div>
      <div class="dossier-row">
        <span class="dossier-lbl">BORN:</span>
        <span class="dossier-val">${selectedCharacter.birthYear}</span>
      </div>
      <div class="dossier-row">
        <span class="dossier-lbl">FATHER:</span>
        <span class="dossier-val">${selectedCharacter.father}</span>
      </div>
      <div class="dossier-row">
        <span class="dossier-lbl">MOTHER:</span>
        <span class="dossier-val">${selectedCharacter.mother}</span>
      </div>
    </div>

    <div class="dossier-trait-box">
      <span class="trait-header-lbl">// SPECIAL TRAIT</span>
      <div class="trait-hero-name">“${selectedCharacter.trait}”</div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function hideAbilityModal() {
  const modal = document.getElementById('modal-ability');
  if (modal) modal.classList.add('hidden');
}

// ============================================================================
// 8. CART / PREVIEW SCREEN
// ============================================================================
function loadPreviewScreen() {
  if (!selectedCharacter) return;

  const previewImg = document.getElementById('preview-character-img');
  const transferTitle = document.getElementById('cartridge-transfer-title');
  const pilotSub = document.getElementById('preview-pilot-sub');

  if (transferTitle) transferTitle.textContent = `PLAYER TRANSFER / ${selectedCharacter.id}`;
  if (pilotSub) pilotSub.textContent = selectedCharacter.name.toUpperCase();
  if (previewImg) {
    previewImg.src = selectedCharacter.image;
    previewImg.onerror = () => {
      previewImg.src = selectedCharacter.localImage;
    };
  }

  const cartridge = document.getElementById('preview-cartridge');
  if (cartridge) {
    cartridge.style.animation = 'none';
    cartridge.offsetHeight;
    cartridge.style.animation = 'cartridge-arrive 0.6s cubic-bezier(0.16, 1, 0.3, 1) both';
  }

  switchScreen('preview');
}

// ============================================================================
// 9. HIGH-GRAPHICS 2D CANVAS GAME ENGINE
// ============================================================================
class GameEngine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.animationFrameId = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.lastTime = 0;

    this.width = 1000;
    this.height = 600;

    this.bestScore = parseInt(localStorage.getItem('redline_rush_best_score') || '0', 10);
    this.score = 0;

    this.stars = [];
    this.cityBuildings = [];
    this.groundOffset = 0;

    this.player = {
      x: 160,
      y: 300,
      radius: 32,
      velocity: 0,
      gravity: 920,
      jumpStrength: -380,
      rotation: 0,
      squash: 1,
      stretch: 1,
      trail: [],
      alive: true
    };

    this.obstacles = [];
    this.obstacleTimer = 0;
    this.baseSpeed = 195;
    this.speed = this.baseSpeed;
    this.baseGap = 205;
    this.currentGap = this.baseGap;

    this.particles = [];
    this.scoreFlashes = [];

    this.handleInput = this.handleInput.bind(this);
    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);

    this.initParallaxData();
    window.addEventListener('resize', this.resize);
  }

  initParallaxData() {
    this.stars = [];
    for (let i = 0; i < 45; i++) {
      this.stars.push({
        x: Math.random() * 1400,
        y: Math.random() * 600,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 18 + 10,
        brightness: Math.random() * 0.5 + 0.5
      });
    }

    this.cityBuildings = [];
    let curX = 0;
    while (curX < 1600) {
      const bWidth = Math.floor(Math.random() * 50 + 40);
      const bHeight = Math.floor(Math.random() * 110 + 60);
      this.cityBuildings.push({ x: curX, width: bWidth, height: bHeight });
      curX += bWidth + Math.floor(Math.random() * 14);
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.width = rect.width || 1000;
    this.height = rect.height || 600;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;

    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  start() {
    this.resize();
    this.score = 0;
    this.speed = this.baseSpeed;
    this.currentGap = this.baseGap;
    this.obstacleTimer = 0;
    this.obstacles = [];
    this.particles = [];
    this.scoreFlashes = [];

    this.player.x = Math.max(120, this.width * 0.18);
    this.player.y = this.height * 0.45;
    this.player.velocity = -120;
    this.player.rotation = 0;
    this.player.squash = 1;
    this.player.stretch = 1;
    this.player.trail = [];
    this.player.alive = true;

    this.isPlaying = true;
    this.isPaused = false;
    this.lastTime = performance.now();

    this.updateHUD();

    window.addEventListener('keydown', this.handleInput);
    this.canvas.addEventListener('pointerdown', this.handleInput);

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('keydown', this.handleInput);
    if (this.canvas) this.canvas.removeEventListener('pointerdown', this.handleInput);
  }

  handleInput(e) {
    if (e.type === 'keydown') {
      if (e.code === 'Space') {
        e.preventDefault();
        this.flap();
      } else if (e.code === 'KeyP') {
        this.togglePause();
      }
    } else if (e.type === 'pointerdown') {
      e.preventDefault();
      this.flap();
    }
  }

  togglePause() {
    if (!this.isPlaying || !this.player.alive) return;
    this.isPaused = !this.isPaused;
    const pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) {
      pauseOverlay.classList.toggle('hidden', !this.isPaused);
    }
    if (!this.isPaused) {
      this.lastTime = performance.now();
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  }

  flap() {
    if (!this.isPlaying || this.isPaused || !this.player.alive) return;

    this.player.velocity = this.player.jumpStrength;
    this.player.squash = 0.85;
    this.player.stretch = 1.2;

    // Thrust spark particles (no flap sound)
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: this.player.x - 22,
        y: this.player.y + (Math.random() * 12 - 6),
        vx: -(Math.random() * 130 + 70),
        vy: (Math.random() * 50 - 25),
        size: Math.random() * 5 + 3,
        color: Math.random() > 0.5 ? '#f5c518' : '#e62534',
        alpha: 1,
        life: 0.28
      });
    }
  }

  update(dt) {
    if (this.isPaused || !this.isPlaying) return;

    this.speed = this.baseSpeed + Math.min(200, this.score * 7);
    this.currentGap = Math.max(165, this.baseGap - Math.min(35, this.score * 1.5));

    if (this.player.alive) {
      this.player.velocity += this.player.gravity * dt;
      this.player.y += this.player.velocity * dt;

      const targetRotation = Math.max(-0.4, Math.min(0.65, this.player.velocity * 0.0015));
      this.player.rotation += (targetRotation - this.player.rotation) * 12 * dt;

      this.player.squash += (1 - this.player.squash) * 8 * dt;
      this.player.stretch += (1 - this.player.stretch) * 8 * dt;

      this.player.trail.unshift({
        x: this.player.x,
        y: this.player.y,
        alpha: 0.5,
        rotation: this.player.rotation
      });
      if (this.player.trail.length > 5) this.player.trail.pop();
      this.player.trail.forEach(t => t.alpha -= 1.8 * dt);

      const topBoundary = 15;
      const groundBoundary = this.height - 24;

      if (this.player.y - this.player.radius <= topBoundary) {
        this.player.y = topBoundary + this.player.radius;
        this.crash();
        return;
      }
      if (this.player.y + this.player.radius >= groundBoundary) {
        this.player.y = groundBoundary - this.player.radius;
        this.crash();
        return;
      }
    } else {
      this.player.velocity += this.player.gravity * dt;
      this.player.y += this.player.velocity * dt;
      this.player.rotation += 3 * dt;
    }

    this.groundOffset = (this.groundOffset + this.speed * dt) % 40;
    this.stars.forEach(star => {
      star.x -= star.speed * dt;
      if (star.x < 0) {
        star.x = this.width + 10;
        star.y = Math.random() * this.height;
      }
    });

    this.cityBuildings.forEach(b => {
      b.x -= this.speed * 0.25 * dt;
      if (b.x + b.width < 0) {
        b.x = this.width + Math.random() * 40;
      }
    });

    const spawnInterval = Math.max(1.35, 2.1 - Math.min(0.6, this.score * 0.02));
    this.obstacleTimer += dt;
    if (this.obstacleTimer >= spawnInterval && this.player.alive) {
      this.obstacleTimer = 0;
      this.spawnObstacle();
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.speed * dt;

      if (!obs.passed && obs.x + obs.width < this.player.x) {
        obs.passed = true;
        this.score++;
        this.triggerScoreEffect(obs.x + obs.width, obs.topHeight + obs.gap / 2);
        this.updateHUD();
      }

      if (this.player.alive) {
        const pLeft = this.player.x - this.player.radius + 6;
        const pRight = this.player.x + this.player.radius - 6;
        const pTop = this.player.y - this.player.radius + 6;
        const pBottom = this.player.y + this.player.radius - 6;

        if (pRight > obs.x && pLeft < obs.x + obs.width) {
          if (pTop < obs.topHeight) {
            this.crash();
            return;
          }
          const bottomPipeY = obs.topHeight + obs.gap;
          if (pBottom > bottomPipeY) {
            this.crash();
            return;
          }
        }
      }

      if (obs.x + obs.width < -60) {
        this.obstacles.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= dt / p.life;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.scoreFlashes.length - 1; i >= 0; i--) {
      const sf = this.scoreFlashes[i];
      sf.y -= 45 * dt;
      sf.alpha -= 1.8 * dt;
      if (sf.alpha <= 0) this.scoreFlashes.splice(i, 1);
    }
  }

  spawnObstacle() {
    const minHeight = 60;
    const maxHeight = this.height - 24 - this.currentGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);

    this.obstacles.push({
      x: this.width + 40,
      width: 76,
      topHeight: topHeight,
      gap: this.currentGap,
      passed: false
    });
  }

  triggerScoreEffect(x, y) {
    this.scoreFlashes.push({ text: '+1', x: x, y: y, alpha: 1 });
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 120,
        vy: (Math.random() - 0.5) * 120,
        size: Math.random() * 4 + 2,
        color: '#f5c518',
        alpha: 1,
        life: 0.35
      });
    }
  }

  crash() {
    if (!this.player.alive) return;
    this.player.alive = false;

    // ONLY the character OUT sound plays! (CH_1.mp3 or CH_2.mp3)
    sounds.playCharacterOut(selectedCharacter);

    const wrapper = document.getElementById('screen-shake-wrapper');
    if (wrapper) {
      wrapper.classList.remove('screen-shaking', 'screen-flash-red');
      void wrapper.offsetWidth;
      wrapper.classList.add('screen-shaking', 'screen-flash-red');
      setTimeout(() => {
        wrapper.classList.remove('screen-shaking', 'screen-flash-red');
      }, 400);
    }

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 300 + 80;
      this.particles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color: ['#e62534', '#f5c518', '#ffffff'][Math.floor(Math.random() * 3)],
        alpha: 1,
        life: Math.random() * 0.45 + 0.4
      });
    }

    setTimeout(() => {
      this.stop();
      showGameOver(this.score, this.bestScore);
    }, 750);
  }

  updateHUD() {
    const curScoreEl = document.getElementById('hud-current-score');
    const bestScoreEl = document.getElementById('hud-best-score');
    const pilotDisplay = document.getElementById('hud-pilot-display');

    const formattedScore = String(this.score).padStart(4, '0');
    const formattedBest = String(this.bestScore).padStart(4, '0');

    if (curScoreEl) curScoreEl.textContent = formattedScore;
    if (bestScoreEl) bestScoreEl.textContent = formattedBest;
    if (pilotDisplay && selectedCharacter) {
      pilotDisplay.textContent = `PILOT // ${selectedCharacter.name.toUpperCase()}`;
    }
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.width, this.height);

    // Atmosphere Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#060609');
    bgGrad.addColorStop(0.65, '#12070d');
    bgGrad.addColorStop(1, '#1b0710');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Stars
    this.stars.forEach(star => {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * 0.85})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Cyber Moon
    ctx.fillStyle = '#260a12';
    ctx.beginPath();
    ctx.arc(this.width * 0.72, this.height * 0.38, 70, 0, Math.PI * 2);
    ctx.fill();

    // City Skyline
    const cityGroundY = this.height - 24;
    ctx.fillStyle = '#0a0a10';
    this.cityBuildings.forEach(b => {
      ctx.fillRect(b.x, cityGroundY - b.height, b.width, b.height);
      ctx.fillStyle = 'rgba(230, 37, 52, 0.2)';
      for (let wy = cityGroundY - b.height + 10; wy < cityGroundY - 8; wy += 20) {
        ctx.fillRect(b.x + 6, wy, 4, 7);
      }
      ctx.fillStyle = '#0a0a10';
    });

    // Top Red Line
    ctx.strokeStyle = '#e62534';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(this.width, 8);
    ctx.stroke();

    // Obstacles
    this.drawObstacles(ctx);

    // Player Motion Trails
    if (this.player.alive && this.player.trail.length > 0) {
      this.player.trail.forEach(t => {
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rotation);
        ctx.globalAlpha = t.alpha * 0.3;
        ctx.fillStyle = '#e62534';
        ctx.beginPath();
        ctx.arc(0, 0, this.player.radius * 0.9, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      ctx.globalAlpha = 1;
    }

    // Player
    this.drawPlayer(ctx);

    // Particles
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    });

    // Score Flashes
    this.scoreFlashes.forEach(sf => {
      ctx.save();
      ctx.font = 'bold 14px "Press Start 2P", monospace';
      ctx.fillStyle = `rgba(245, 197, 24, ${sf.alpha})`;
      ctx.textAlign = 'center';
      ctx.fillText(sf.text, sf.x, sf.y);
      ctx.restore();
    });

    // Ground Runway
    this.drawGround(ctx);
  }

  drawObstacles(ctx) {
    const groundY = this.height - 24;

    this.obstacles.forEach(obs => {
      const x = obs.x;
      const w = obs.width;

      // Top Obstacle Body
      ctx.fillStyle = '#080910';
      ctx.fillRect(x, 8, w, obs.topHeight - 8);

      ctx.strokeStyle = '#e62534';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, 8, w, obs.topHeight - 8);

      ctx.strokeStyle = 'rgba(230, 37, 52, 0.4)';
      ctx.beginPath();
      ctx.moveTo(x + 10, 8);
      ctx.lineTo(x + 10, obs.topHeight - 20);
      ctx.moveTo(x + w - 10, 8);
      ctx.lineTo(x + w - 10, obs.topHeight - 20);
      ctx.stroke();

      ctx.fillStyle = '#e62534';
      ctx.fillRect(x + w / 2 - 3, (obs.topHeight - 8) / 2, 6, 6);

      const capHeight = 22;
      ctx.fillStyle = '#000';
      ctx.fillRect(x - 4, obs.topHeight - capHeight, w + 8, capHeight);
      ctx.strokeStyle = '#f5c518';
      ctx.strokeRect(x - 4, obs.topHeight - capHeight, w + 8, capHeight);

      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 3, obs.topHeight - capHeight + 1, w + 6, capHeight - 2);
      ctx.clip();
      ctx.strokeStyle = '#f5c518';
      ctx.lineWidth = 7;
      for (let hx = x - 20; hx < x + w + 20; hx += 16) {
        ctx.beginPath();
        ctx.moveTo(hx, obs.topHeight);
        ctx.lineTo(hx + 16, obs.topHeight - capHeight);
        ctx.stroke();
      }
      ctx.restore();

      // Bottom Obstacle Body
      const bottomY = obs.topHeight + obs.gap;
      const bottomHeight = groundY - bottomY;

      ctx.fillStyle = '#080910';
      ctx.fillRect(x, bottomY, w, bottomHeight);

      ctx.strokeStyle = '#e62534';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, bottomY, w, bottomHeight);

      ctx.strokeStyle = 'rgba(230, 37, 52, 0.4)';
      ctx.beginPath();
      ctx.moveTo(x + 10, bottomY + 20);
      ctx.lineTo(x + 10, groundY);
      ctx.moveTo(x + w - 10, bottomY + 20);
      ctx.lineTo(x + w - 10, groundY);
      ctx.stroke();

      ctx.fillStyle = '#e62534';
      ctx.fillRect(x + w / 2 - 3, bottomY + bottomHeight / 2 - 3, 6, 6);

      ctx.fillStyle = '#000';
      ctx.fillRect(x - 4, bottomY, w + 8, capHeight);
      ctx.strokeStyle = '#f5c518';
      ctx.strokeRect(x - 4, bottomY, w + 8, capHeight);

      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 3, bottomY + 1, w + 6, capHeight - 2);
      ctx.clip();
      ctx.strokeStyle = '#f5c518';
      ctx.lineWidth = 7;
      for (let hx = x - 20; hx < x + w + 20; hx += 16) {
        ctx.beginPath();
        ctx.moveTo(hx, bottomY + capHeight);
        ctx.lineTo(hx + 16, bottomY);
        ctx.stroke();
      }
      ctx.restore();
    });
  }

  drawPlayer(ctx) {
    ctx.save();
    ctx.translate(this.player.x, this.player.y);
    ctx.rotate(this.player.rotation);
    ctx.scale(this.player.squash, this.player.stretch);

    // Circular translucent reticle aura
    ctx.fillStyle = 'rgba(245, 197, 24, 0.14)';
    ctx.beginPath();
    ctx.arc(0, 0, this.player.radius * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Inner yellow target reticle box
    ctx.strokeStyle = 'rgba(245, 197, 24, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-this.player.radius * 0.95, -this.player.radius * 0.95, this.player.radius * 1.9, this.player.radius * 1.9);

    // Full face photo
    const charImg = getCharacterImage(selectedCharacter);
    const size = this.player.radius * 2;

    if (charImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, this.player.radius * 0.9, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(charImg, -size / 2, -size / 2, size, size);
      ctx.restore();
    } else {
      ctx.fillStyle = '#f5c518';
      ctx.beginPath();
      ctx.arc(0, 0, this.player.radius * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.player.alive) {
      const flameLength = Math.random() * 8 + 12;
      ctx.fillStyle = Math.random() > 0.5 ? '#f5c518' : '#e62534';
      ctx.beginPath();
      ctx.moveTo(-this.player.radius + 2, -5);
      ctx.lineTo(-this.player.radius - flameLength, 0);
      ctx.lineTo(-this.player.radius + 2, 5);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  drawGround(ctx) {
    const groundY = this.height - 24;

    ctx.fillStyle = '#06060a';
    ctx.fillRect(0, groundY, this.width, 24);

    ctx.strokeStyle = '#e62534';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(this.width, groundY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(245, 197, 24, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(-this.groundOffset, groundY + 12);
    ctx.lineTo(this.width + 20, groundY + 12);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  loop(currentTime) {
    if (!this.isPlaying) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(dt);
    this.draw();

    if (this.isPlaying) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  }
}

let gameInstance = null;

// ============================================================================
// 10. GAME OVER SCREEN
// ============================================================================
function showGameOver(finalScore, previousBest) {
  const isNewRecord = finalScore > previousBest;
  const newBest = Math.max(finalScore, previousBest);

  localStorage.setItem('redline_rush_best_score', newBest.toString());

  const pilotName = document.getElementById('gameover-pilot-name');
  const pilotImg = document.getElementById('gameover-pilot-img');
  const finalScoreEl = document.getElementById('gameover-final-score');
  const bestScoreEl = document.getElementById('gameover-best-score');
  const recordBadge = document.getElementById('new-record-badge');
  const traitQuote = document.getElementById('gameover-trait-quote');

  if (pilotName) pilotName.textContent = selectedCharacter.name.toUpperCase();
  if (pilotImg) {
    pilotImg.src = selectedCharacter.image;
    pilotImg.onerror = () => {
      pilotImg.src = selectedCharacter.localImage;
    };
  }
  if (finalScoreEl) finalScoreEl.textContent = String(finalScore).padStart(4, '0');
  if (bestScoreEl) bestScoreEl.textContent = String(newBest).padStart(4, '0');
  if (traitQuote) traitQuote.textContent = `“${selectedCharacter.trait}”`;

  if (recordBadge) recordBadge.classList.toggle('hidden', !isNewRecord);

  if (gameInstance) gameInstance.bestScore = newBest;

  switchScreen('gameover');
}

// ============================================================================
// 11. INITIALIZATION & EVENT LISTENERS
// ============================================================================
function init() {
  preloadCharacterImages();
  gameInstance = new GameEngine();
  runIntroSequence();

  // Selection actions
  const btnConfirm = document.getElementById('btn-confirm-character');
  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      loadPreviewScreen();
    });
  }

  const btnAbility = document.getElementById('btn-open-ability');
  if (btnAbility) {
    btnAbility.addEventListener('click', showAbilityModal);
  }

  const btnCloseAbility = document.getElementById('btn-close-ability');
  const btnCloseAbilityFooter = document.getElementById('btn-close-ability-footer');
  if (btnCloseAbility) btnCloseAbility.addEventListener('click', hideAbilityModal);
  if (btnCloseAbilityFooter) btnCloseAbilityFooter.addEventListener('click', hideAbilityModal);

  // Preview actions
  const btnBackToSelect = document.getElementById('btn-back-to-select');
  if (btnBackToSelect) {
    btnBackToSelect.addEventListener('click', () => {
      switchScreen('select');
      renderCharacterSelection();
    });
  }

  const btnLaunchGame = document.getElementById('btn-launch-game');
  if (btnLaunchGame) {
    btnLaunchGame.addEventListener('click', () => {
      switchScreen('game');
      gameInstance.start();
    });
  }

  // In-Game Pause
  const btnPause = document.getElementById('btn-pause-game');
  if (btnPause) {
    btnPause.addEventListener('click', () => {
      if (gameInstance) gameInstance.togglePause();
    });
  }

  const btnResume = document.getElementById('btn-resume-game');
  if (btnResume) {
    btnResume.addEventListener('click', () => {
      if (gameInstance) gameInstance.togglePause();
    });
  }

  // Game Over actions
  const btnRetry = document.getElementById('btn-gameover-retry');
  if (btnRetry) {
    btnRetry.addEventListener('click', () => {
      switchScreen('game');
      gameInstance.start();
    });
  }

  const btnChangeChar = document.getElementById('btn-gameover-change');
  if (btnChangeChar) {
    btnChangeChar.addEventListener('click', () => {
      switchScreen('select');
      renderCharacterSelection();
    });
  }

  // Sound Toggle (controls OUT sound mute)
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  if (btnSoundToggle) {
    btnSoundToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundIcon) soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    });
  }

  // CRT Toggle
  const btnCrtToggle = document.getElementById('btn-crt-toggle');
  document.body.classList.toggle('no-crt', true); // Clean by default
  if (btnCrtToggle) {
    let crtOn = false;
    btnCrtToggle.addEventListener('click', () => {
      crtOn = !crtOn;
      document.body.classList.toggle('no-crt', !crtOn);
      btnCrtToggle.style.color = crtOn ? 'var(--color-yellow)' : '#8b90a6';
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
