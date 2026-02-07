const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/**
 * サウンドエフェクト関連
 */
function playJerkSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}

function playHitSound() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

function playWinSound() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.1);
        osc.stop(audioCtx.currentTime + i * 0.1 + 0.3);
    });
}

let dragInterval = null;
function startDragSound() {
    if (dragInterval) return;
    dragInterval = setInterval(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + Math.random() * 400, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
    }, 60);
}
function stopDragSound() {
    if (dragInterval) { clearInterval(dragInterval); dragInterval = null; }
}

let isMuted = false;
class BGMPlayer {
    constructor() {
        this.isPlaying = false;
        this.osc1 = null;
        this.osc2 = null;
        this.gainNode = null;
        this.interval = null;
        this.noteIndex = 0;
        // 楽しげなメロディ（Cメジャースケール）
        this.melody = [
            523.25, 0, 659.25, 523.25, 783.99, 0, 659.25, 0,
            587.33, 0, 698.46, 587.33, 783.99, 0, 523.25, 0
        ];
        this.bass = [
            261.63, 261.63, 293.66, 293.66, 329.63, 329.63, 349.23, 349.23,
            392.00, 392.00, 349.23, 349.23, 329.63, 329.63, 293.66, 293.66
        ];
    }
    play() {
        if (this.isPlaying || isMuted) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        this.isPlaying = true;
        this.noteIndex = 0;

        this.interval = setInterval(() => {
            if (!this.isPlaying) return;
            this.playNote();
            this.noteIndex = (this.noteIndex + 1) % 16;
        }, 200); // テンポ bpm=300相当の8分音符
    }
    playNote() {
        const t = audioCtx.currentTime;
        // Melody
        if (this.melody[this.noteIndex] !== 0) {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(this.melody[this.noteIndex], t);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.15);
        }
        // Bass
        const oscB = audioCtx.createOscillator();
        const gainB = audioCtx.createGain();
        oscB.type = 'square';
        oscB.frequency.setValueAtTime(this.bass[this.noteIndex] / 2, t);
        gainB.gain.setValueAtTime(0.05, t);
        gainB.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        oscB.connect(gainB);
        gainB.connect(audioCtx.destination);
        oscB.start(t);
        oscB.stop(t + 0.1);
    }
    stop() {
        this.isPlaying = false;
        if (this.interval) { clearInterval(this.interval); this.interval = null; }
    }
}
const bgm = new BGMPlayer();

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('btn-mute');
    btn.innerHTML = isMuted ? "🔇" : "🔊";
    if (isMuted) bgm.stop();
    else if (state !== 'idle') bgm.play();
}

/**
 * 視覚効果用クラス
 */
class LightRay {
    constructor(canvasWidth) {
        this.x = Math.random() * canvasWidth;
        this.width = 40 + Math.random() * 100;
        this.opacity = 0.02 + Math.random() * 0.08;
        this.speed = (Math.random() - 0.5) * 0.5;
    }
    update(canvasWidth) {
        this.x += this.speed;
        if (this.x < -100) this.x = canvasWidth + 100;
        if (this.x > canvasWidth + 100) this.x = -100;
    }
    draw(ctx, canvasHeight) {
        const grad = ctx.createLinearGradient(this.x, 0, this.x - 50, canvasHeight);
        grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(this.x, 0);
        ctx.lineTo(this.x + this.width, 0);
        ctx.lineTo(this.x + this.width - 150, canvasHeight);
        ctx.lineTo(this.x - 150, canvasHeight);
        ctx.fill();
    }
}

class Bubble {
    constructor(canvasWidth, canvasHeight) {
        this.reset(canvasWidth, canvasHeight);
        this.y = Math.random() * canvasHeight;
    }
    reset(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight + 20;
        this.size = 1 + Math.random() * 4;
        this.speed = 0.5 + Math.random() * 1.5;
        this.wiggle = Math.random() * Math.PI * 2;
    }
    update(canvasWidth, canvasHeight) {
        this.y -= this.speed;
        this.wiggle += 0.05;
        this.x += Math.sin(this.wiggle) * 0.5;
        if (this.y < -20) this.reset(canvasWidth, canvasHeight);
    }
    draw(ctx) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.stroke();
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class InkCloud {
    constructor(x, y, scale) {
        this.x = x;
        this.y = y;
        this.size = 10 * scale;
        this.alpha = 0.6;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.growth = 0.5 + Math.random() * 0.5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.size += this.growth;
        this.alpha -= 0.01;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        let grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        grad.addColorStop(0, "#000");
        grad.addColorStop(0.6, "#111");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

const LOCATIONS = [
    { id: "iwasaki", name: "岩崎ホテル沖", req: 0, depth: [10, 15], color: "#005073", redProb: 0.05 },
    { id: "yamagawa", name: "山川沖", req: 5, depth: [15, 20], color: "#003d5c", redProb: 0.15 }, // req: 2 -> 5
    { id: "ibusuki", name: "指宿沖", req: 30, depth: [20, 30], color: "#001b2e", redProb: 0.30 } // req: 10 -> 30
];

const ROD_LIST = [
    { id: "bb", name: "Sephia BB", req: 0 },
    { id: "ss", name: "Sephia SS", req: 10 },    // req: 2 -> 10
    { id: "xr", name: "Sephia XR", req: 20 },    // req: 5 -> 20
    { id: "xtune", name: "Sephia エクスチューン", req: 30 }, // req: 10 -> 30
    { id: "limited", name: "Sephia Limited", req: 50 } // req: 15 -> 50
];

const REEL_LIST = [
    { id: "bb", name: "Sephia BB", req: 0 },
    { id: "ss", name: "Sephia SS", req: 20 },   // req: 2 -> 20
    { id: "xr", name: "Sephia XR", req: 30 },    // req: 5 -> 30
    { id: "stella", name: "STELLA", req: 60 }    // req: 12 -> 60
];

const EGI_SHOP = [
    { id: "pink", name: "エギ王 Live (ピンク)", price: 0, speed: 0.12, color: "#ff00ff", headColor: "#ff4d4d", sinkerColor: "#8b0000", featherColor: "#da7706", pattern: "stripes", desc: "初期装備" },
    { id: "orange", name: "エギ王 Live (オレンジ)", price: 3000, speed: 0.15, color: "#ff6600", headColor: "#cc5200", sinkerColor: "#ffd700", featherColor: "#ffffff", pattern: "arrows", desc: "沈下速度UP" },
    { id: "purple", name: "エギ王 K (パープル)", price: 8000, speed: 0.18, color: "#800080", headColor: "#4b0082", sinkerColor: "#71717a", featherColor: "#dda0dd", pattern: "spots", desc: "安定沈下" },
    { id: "gold", name: "漆黒のレッドモンスターSP", price: 25000, speed: 0.25, color: "#1a1a1a", headColor: "#8b0000", sinkerColor: "#ff0000", featherColor: "#ff0000", pattern: "glow", desc: "最高速" },
    { id: "dartmax_purple", name: "ダートマックスTrパープル", price: 50000, speed: 0.35, color: "#9932cc", headColor: "#ff00ff", sinkerColor: "#4b0082", featherColor: "#00ffff", pattern: "rainbow", desc: "伝説の餌木", secret: true }
];

let state = 'idle', currentDepth = 0, targetDepth = 0;
let score = parseInt(localStorage.getItem('squidScore')) || 0;
let money = parseInt(localStorage.getItem('fishingMoney')) || 0;
let redCount = parseInt(localStorage.getItem('redSquidScore')) || 0;
let giantCaught = localStorage.getItem('giantCaught') === 'true';
let maxWeightNormal = parseInt(localStorage.getItem('maxWeightNormal')) || 0;
let maxWeightRed = parseInt(localStorage.getItem('maxWeightRed')) || 0;
let ownedEgis = JSON.parse(localStorage.getItem('ownedEgis')) || ["pink"];
let currentEgiId = localStorage.getItem('currentEgiId') || "pink";
let selectedEgi = EGI_SHOP.find(e => e.id === currentEgiId) || EGI_SHOP[0];
let currentRodId = localStorage.getItem('currentRodId') || "bb";
let currentReelId = localStorage.getItem('currentReelId') || "bb";

let kuromiCaughtCount = parseInt(localStorage.getItem('kuromiCaughtCount')) || 0;

let selectedLocObj = LOCATIONS[0], seabedObjects = [], envSquids = [], jerkCount = 0;
let attackerSquid = null, squidDist = 0, tension = 40, isReeling = false, timers = [];
let particles = [];
let lightRays = [];
let bubbles = [];
let isSharkAttacking = false, sharkX = 0, sharkY = 0, sharkBite = false;
let reelRotAngle = 0;
let boatSway = 0, boatSwaySpeed = 0.001;
let inkClouds = [];
let jerkFallbackTimer = null; // シャクリ後の自動フォール用タイマー
let approachingSquids = []; // 接近中のイカ
let isManualStay = false; // ユーザーが明示的にステイを選択したか
let canSquidsAppearThisFall = false; // このフォールでイカが出現するか（フォール開始時に抽選）

// --- 新機能用変数 ---
let fallCount = 0;
let fishSchool = [];
let isMultiHitChance = false;
let currentEvent = 'none'; // 'fever', 'golden', 'baku', 'multi', 'none'
let feverTimer = 0; // フィーバーの残り時間
const RAINBOW_COLORS = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3"];

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const reelCanvas = document.getElementById('reelCanvas');
const reelCtx = reelCanvas.getContext('2d');
const msg = document.getElementById('status-msg');

function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resize);
resize();

function saveStats() {
    localStorage.setItem('squidScore', score);
    localStorage.setItem('redSquidScore', redCount);
    localStorage.setItem('fishingMoney', money);
    localStorage.setItem('ownedEgis', JSON.stringify(ownedEgis));
    localStorage.setItem('currentEgiId', currentEgiId);
    localStorage.setItem('currentRodId', currentRodId);
    localStorage.setItem('currentReelId', currentReelId);
    localStorage.setItem('giantCaught', giantCaught);
    localStorage.setItem('kuromiCaughtCount', kuromiCaughtCount);
    document.getElementById('score-val').innerText = score;
    document.getElementById('money-val').innerText = money;
    updateTackleDisplay();
}

function updateTackleDisplay() {
    const rod = ROD_LIST.find(r => r.id === currentRodId);
    const reel = REEL_LIST.find(r => r.id === currentReelId);
    document.getElementById('disp-rod').innerText = rod ? rod.name : "--";
    document.getElementById('disp-reel').innerText = reel ? reel.name : "--";
    document.getElementById('disp-egi').innerText = selectedEgi.name;
    document.getElementById('display-loc').innerText = "📍 " + selectedLocObj.name;
}

function resetGameData() {
    if (confirm("全データをリセットしますか？")) {
        localStorage.clear();
        location.reload();
    }
}

function triggerGiantSquidWin() {
    const flash = document.getElementById('flash-overlay');
    flash.style.opacity = '1';
    let opacity = 1;
    const fade = setInterval(() => {
        opacity -= 0.05;
        flash.style.opacity = opacity;
        if (opacity <= 0) clearInterval(fade);
    }, 50);
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width, y: -10,
            vx: (Math.random() - 0.5) * 10, vy: Math.random() * 5 + 5,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`, size: Math.random() * 8 + 4
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.y > canvas.height) particles.splice(i, 1);
        else {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
    }
    // 墨雲の更新と描画
    for (let i = inkClouds.length - 1; i >= 0; i--) {
        const c = inkClouds[i];
        c.update();
        c.draw(ctx);
        if (c.alpha <= 0) inkClouds.splice(i, 1);
    }
}

function drawKuromi(x, y, scale, alpha, angle, isFighting) {
    ctx.save();
    ctx.translate(x, y);
    if (isFighting) {
        ctx.rotate(Math.PI / 2 + angle);
        ctx.scale(-scale, scale);
    } else {
        ctx.rotate(Math.PI / 2 + angle);
        ctx.scale(scale, scale);
    }
    ctx.globalAlpha = alpha;

    // Kuromi's Hat (Black Hood with triangle ears)
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(-35, 10);
    ctx.quadraticCurveTo(-38, -25, 0, -32);
    ctx.quadraticCurveTo(38, -25, 35, 10);
    ctx.quadraticCurveTo(0, 28, -35, 10);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pointy Ears
    ctx.beginPath();
    ctx.moveTo(-25, -20);
    ctx.lineTo(-45, -45);
    ctx.lineTo(-10, -30);
    ctx.fill(); ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(25, -20);
    ctx.lineTo(45, -45);
    ctx.lineTo(10, -30);
    ctx.fill(); ctx.stroke();

    // Pink Skull on hat
    ctx.fillStyle = "#ff69b4";
    ctx.beginPath();
    ctx.arc(0, -22, 6, 0, Math.PI * 2);
    ctx.fill();
    // Skull eyes
    ctx.fillStyle = "#333";
    ctx.beginPath(); ctx.arc(-2, -22, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(2, -22, 1.5, 0, Math.PI * 2); ctx.fill();

    // Face (White part)
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(0, 2, 22, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (Black, slightly slanted)
    ctx.fillStyle = "#000";
    ctx.save();
    ctx.rotate(-0.1);
    ctx.beginPath(); ctx.ellipse(-10, -2, 5, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.rotate(0.1);
    ctx.beginPath(); ctx.ellipse(10, -2, 5, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Eyelashes
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-15, -8); ctx.lineTo(-20, -12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(15, -8); ctx.lineTo(20, -12); ctx.stroke();

    // Nose/Mouth (Small pink dot/v)
    ctx.fillStyle = "#ff69b4";
    ctx.beginPath(); ctx.arc(0, 8, 2, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
}

function drawBaku(x, y, scale, alpha, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    // Baku's Body (Purple Tapir-like creature)
    ctx.fillStyle = "#9370db"; // Medium Purple
    ctx.beginPath();
    ctx.ellipse(0, 0, 35, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Round tummy
    ctx.fillStyle = "#e6e6fa"; // Lavender
    ctx.beginPath();
    ctx.ellipse(0, 8, 20, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk (Nose)
    ctx.fillStyle = "#9370db";
    ctx.beginPath();
    ctx.moveTo(-30, -5);
    ctx.quadraticCurveTo(-45, -5, -45, 5);
    ctx.lineTo(-30, 5);
    ctx.fill();

    // Big Ears
    ctx.beginPath();
    ctx.ellipse(-15, -20, 10, 15, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(15, -20, 10, 15, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(-10, -5, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -5, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "black";
    ctx.beginPath(); ctx.arc(-10, -5, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -5, 2.5, 0, Math.PI * 2); ctx.fill();

    // Pink Cheeks
    ctx.fillStyle = "rgba(255, 182, 193, 0.6)";
    ctx.beginPath(); ctx.arc(-18, 5, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(18, 5, 5, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
}

function drawSquid(x, y, scale, alpha, angle, color, isHitState, isFighting) {
    ctx.save();
    ctx.translate(x, y);
    if (isFighting) {
        ctx.rotate(Math.PI / 2 + angle);
        ctx.scale(-scale, scale);
    } else {
        ctx.rotate(Math.PI / 2 + angle);
        ctx.scale(scale, scale);
    }
    ctx.globalAlpha = alpha;

    // Glow effect
    if (color === "#ff0000" || color === "#8b0000") {
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
    }

    const t = Date.now() * 0.005;
    if (isHitState || isFighting) {
        ctx.strokeStyle = color; ctx.lineWidth = 2 * scale;
        let armLen = isHitState ? (Math.sin(Date.now() * 0.02) * 10 + 45) : 40;
        for (let side of [-1, 1]) {
            ctx.beginPath(); ctx.moveTo(side * 5, 35);
            ctx.quadraticCurveTo(side * 15, 50, side * 8, 35 + armLen);
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(side * 8, 35 + armLen, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Body shading
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -40);
    ctx.quadraticCurveTo(-28, -35, -18, -10);
    ctx.lineTo(18, -10);
    ctx.quadraticCurveTo(28, -35, 0, -40);
    ctx.fill();

    let grad = ctx.createRadialGradient(0, 0, 5 * scale, 0, 0, 40 * scale);
    grad.addColorStop(0, (color === "#ff0000" || color === "#8b0000") ? "#ff8888" : "#fff");
    grad.addColorStop(1, color);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(-9, 32, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, 32, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(-10, 33, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, 33, 3, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = (color === "#ff0000" || color === "#8b0000") ? "#440000" : "#ddd";
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 8; i++) {
        ctx.beginPath(); ctx.moveTo(-12 + (i * 3.5), 38);
        let footWave = Math.sin(t + i * 0.8) * (isFighting ? 3 : 8);
        ctx.quadraticCurveTo(-15 + (i * 4), 50 + footWave, -12 + (i * 3.5), 60 + footWave); ctx.stroke();
    }
    ctx.restore();
}

function drawEgi(x, y, egi, angle) {
    if (!egi) return;
    const color = egi.color || "#ffffff";
    const headColor = egi.headColor || "#ff4d4d";
    const sinkerColor = egi.sinkerColor || "#8b0000";
    const featherColor = egi.featherColor || "#da7706";
    const pattern = egi.pattern || "stripes";

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(0.8, 0.8);

    // 1. シンカー（オモリ）
    ctx.fillStyle = sinkerColor;
    ctx.beginPath();
    ctx.moveTo(-10, 5);
    ctx.lineTo(5, 18);
    ctx.lineTo(15, 12);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. ボディ本体
    ctx.beginPath();
    ctx.moveTo(-35, 0);
    ctx.bezierCurveTo(-30, -18, 10, -18, 45, -2);
    ctx.bezierCurveTo(55, 0, 55, 6, 45, 8);
    ctx.bezierCurveTo(15, 15, -15, 12, -35, 3);
    ctx.closePath();

    let bodyGrad = ctx.createLinearGradient(0, -15, 0, 15);
    bodyGrad.addColorStop(0, color);
    bodyGrad.addColorStop(0.5, pattern === 'glow' ? "#444" : "#fff");
    bodyGrad.addColorStop(1, color);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // 3. パターン描画
    ctx.save();
    ctx.clip();

    // メッシュ（共通）
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5;
    for (let i = -50; i < 70; i += 3) {
        ctx.beginPath(); ctx.moveTo(i, -20); ctx.lineTo(i + 20, 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i + 20, -20); ctx.lineTo(i, 20); ctx.stroke();
    }

    if (pattern === 'stripes') {
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.ellipse(10 + i * 6, -10 + i * 0.5, 4, 1.5, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (pattern === 'arrows') {
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(10 + i * 8, 0);
            ctx.lineTo(15 + i * 8, -6);
            ctx.moveTo(10 + i * 8, 0);
            ctx.lineTo(15 + i * 8, 6);
            ctx.stroke();
        }
    } else if (pattern === 'spots') {
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 50, (Math.random() - 0.5) * 15, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (pattern === 'glow') {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ff0000";
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(40, 0); ctx.stroke();
        ctx.shadowBlur = 0;
    } else if (pattern === 'dartmax') {
        // 画像のような濃い赤紫の背中の模様
        ctx.fillStyle = "rgba(75, 0, 130, 0.4)";
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(15 + i * 7, -8);
            ctx.lineTo(20 + i * 7, -13);
            ctx.lineTo(20 + i * 7, -3);
            ctx.closePath();
            ctx.fill();
        }
        // 背中の上部のダークライン
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(5, -12); ctx.quadraticCurveTo(25, -15, 45, -5); ctx.stroke();
    }
    ctx.restore();

    // 4. ヘッド
    let headGrad = ctx.createRadialGradient(-25, 0, 2, -25, 0, 15);
    headGrad.addColorStop(0, headColor);
    headGrad.addColorStop(1, headColor === "#ff4d4d" ? "#8b0000" : "#000");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.moveTo(-35, 0);
    ctx.bezierCurveTo(-30, -10, -20, -8, -15, -2);
    ctx.lineTo(-15, 6);
    ctx.bezierCurveTo(-20, 10, -30, 8, -35, 3);
    ctx.closePath();
    ctx.fill();

    // 5. フェザー
    ctx.save();
    ctx.translate(-12, 4);
    ctx.rotate(0.3);
    let featherGrad = ctx.createLinearGradient(0, 0, 25, 0);
    featherGrad.addColorStop(0, featherColor);
    featherGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = featherGrad;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(15, -5, 25, 2); ctx.quadraticCurveTo(15, 8, 0, 2); ctx.fill();
    ctx.restore();

    // 6. アイ
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(-28, 0, 4.5, 0, Math.PI * 2); ctx.fill();
    let eyeGrad = ctx.createRadialGradient(-29, 0, 1, -29, 0, 3);
    eyeGrad.addColorStop(0, egi.id === 'gold' ? "#ff0000" : "#00bfff");
    eyeGrad.addColorStop(1, "#000");
    ctx.fillStyle = eyeGrad;
    ctx.beginPath(); ctx.arc(-29, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(-30, -1, 1, 0, Math.PI * 2); ctx.fill();

    // 7. カンナ
    ctx.strokeStyle = egi.id === 'gold' ? "#ff0000" : "#71717a";
    ctx.lineWidth = 1;
    for (let layer = 0; layer < 2; layer++) {
        let offsetX = 50 + layer * 6;
        for (let i = 0; i < 6; i++) {
            let hAngle = (i * 60) * Math.PI / 180;
            ctx.beginPath(); ctx.moveTo(offsetX - 5, layer === 0 ? 3 : 4); ctx.lineTo(offsetX + Math.cos(hAngle) * 12, (layer === 0 ? 3 : 4) + Math.sin(hAngle) * 8); ctx.stroke();
        }
    }
    ctx.restore();
}

function drawCaptain(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // 1. 体 (白いコックコート)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(-10, 20);
    ctx.lineTo(10, 20);
    ctx.lineTo(12, 40);
    ctx.lineTo(-12, 40);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 0.5; ctx.stroke();

    // ボタン
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath(); ctx.arc(-3, 25, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3, 25, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-3, 31, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3, 31, 1, 0, Math.PI * 2); ctx.fill();

    // 2. 顔
    ctx.fillStyle = "#fcd34d"; // 肌色
    ctx.beginPath();
    ctx.arc(0, 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // 目
    ctx.fillStyle = "#333";
    ctx.beginPath(); ctx.arc(-3, 8, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3, 8, 1, 0, Math.PI * 2); ctx.fill();

    // 口髭 (画像の特徴)
    ctx.strokeStyle = "#4b2c20"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, 13);
    ctx.quadraticCurveTo(0, 15, 4, 13);
    ctx.stroke();

    // 3. 高いコック帽 (画像の特徴)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(-7, 3);
    ctx.lineTo(-8, -15);
    ctx.quadraticCurveTo(-8, -20, 0, -20);
    ctx.quadraticCurveTo(8, -20, 8, -15);
    ctx.lineTo(7, 3);
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 0.5; ctx.stroke();

    // 帽子の折り目
    ctx.strokeStyle = "#f1f5f9";
    for (let i = -4; i <= 4; i += 2) {
        ctx.beginPath(); ctx.moveTo(i, -18); ctx.lineTo(i, -2); ctx.stroke();
    }

    ctx.restore();
}

function drawReel(angle) {
    if (!reelCtx) return;
    const ctxR = reelCtx;
    const w = reelCanvas.width;
    const h = reelCanvas.height;
    ctxR.clearRect(0, 0, w, h);
    ctxR.save();
    ctxR.translate(w / 2, h / 2);

    // イラストに基づいた配色設定 (モデル別)
    let colors = {
        bodyDark: "#666666", bodyMid: "#8c8c8c", bodyLight: "#bfbfbf",
        spoolDark: "#4d4d4d", spoolMid: "#999999", spoolLight: "#d9d9d9",
        knobOuter: "#666666", knobInner: "#cccccc", accent: "#333333"
    };

    if (currentReelId === 'bb') {
        // Sephia BB: 赤色基調
        colors = {
            bodyDark: "#800000", bodyMid: "#cc0000", bodyLight: "#ff4d4d",
            spoolDark: "#4d0000", spoolMid: "#991b1b", spoolLight: "#f8fafc",
            knobOuter: "#800000", knobInner: "#cc0000", accent: "#220000"
        };
    } else if (currentReelId === 'ss') {
        // Sephia SS: 赤黒基調
        colors = {
            bodyDark: "#111111", bodyMid: "#262626", bodyLight: "#ef4444",
            spoolDark: "#000000", spoolMid: "#991b1b", spoolLight: "#f8fafc",
            knobOuter: "#111111", knobInner: "#dc2626", accent: "#000000"
        };
    } else if (currentReelId === 'xr') {
        // Sephia XR: ワインレッド基調
        colors = {
            bodyDark: "#4d0505", bodyMid: "#7a0a0a", bodyLight: "#a61b1b",
            spoolDark: "#2d0000", spoolMid: "#660000", spoolLight: "#f8fafc",
            knobOuter: "#4d0505", knobInner: "#7a0a0a", accent: "#1a0000"
        };
    } else if (currentReelId === 'stella') {
        // STELLA: 高級感のあるシルバー基調
        colors = {
            bodyDark: "#475569", bodyMid: "#94a3b8", bodyLight: "#f8fafc",
            spoolDark: "#1e293b", spoolMid: "#cbd5e1", spoolLight: "#ffffff",
            knobOuter: "#334155", knobInner: "#f1f5f9", accent: "#0f172a"
        };
    }

    // 1. 脚（フット）の描画
    ctxR.fillStyle = colors.bodyMid;
    ctxR.beginPath();
    ctxR.moveTo(0, -5);
    ctxR.bezierCurveTo(0, -45, 30, -60, 45, -65);
    ctxR.lineTo(30, -65);
    ctxR.bezierCurveTo(15, -60, -10, -40, -15, -5);
    ctxR.fill();

    // 2. ボディ (イラスト特有の角張ったリアガード形状)
    ctxR.fillStyle = colors.bodyMid;
    ctxR.beginPath();
    ctxR.moveTo(-20, -15);
    ctxR.lineTo(-60, -5);
    ctxR.lineTo(-70, 45);
    ctxR.lineTo(-35, 55);
    ctxR.bezierCurveTo(-5, 60, 15, 50, 15, 15);
    ctxR.closePath();
    ctxR.fill();

    // ボディ内部の塗り分け
    ctxR.fillStyle = colors.bodyDark;
    ctxR.beginPath();
    ctxR.moveTo(-10, 0);
    ctxR.lineTo(-50, 5);
    ctxR.lineTo(-60, 40);
    ctxR.lineTo(-25, 45);
    ctxR.fill();

    // 3. スプール (右向きに配置)
    ctxR.save();
    ctxR.translate(30, 10);

    // スプール本体
    ctxR.fillStyle = colors.spoolMid;
    ctxR.fillRect(-20, -28, 40, 56);

    // スプール先端 (台形パーツ)
    ctxR.fillStyle = colors.spoolLight;
    ctxR.beginPath();
    ctxR.moveTo(20, -28); ctxR.lineTo(40, -15); ctxR.lineTo(40, 15); ctxR.lineTo(20, 28);
    ctxR.fill();

    // スプール根元 (暗いパーツ)
    ctxR.fillStyle = colors.spoolDark;
    ctxR.fillRect(-22, -30, 12, 60);

    // ドラグノブ部 (黒/アクセント色)
    ctxR.fillStyle = colors.accent;
    ctxR.beginPath();
    ctxR.ellipse(40, 0, 6, 26, 0, 0, Math.PI * 2);
    ctxR.fill();
    ctxR.restore();

    // 4. ハンドル (ダブルハンドル仕様)
    const drawHandle = (rot) => {
        ctxR.save();
        ctxR.rotate(rot);

        // ハンドルアーム
        ctxR.strokeStyle = colors.bodyLight;
        ctxR.lineWidth = 10;
        ctxR.lineCap = "round";
        ctxR.beginPath(); ctxR.moveTo(0, 0); ctxR.lineTo(52, 0); ctxR.stroke();

        // 二重円ノブ
        ctxR.translate(52, 0);
        ctxR.rotate(-rot); // ノブ自体の向きは固定
        // 外円
        ctxR.fillStyle = colors.knobOuter;
        ctxR.beginPath(); ctxR.arc(0, 0, 22, 0, Math.PI * 2); ctxR.fill();
        // 内円
        ctxR.fillStyle = colors.knobInner;
        ctxR.beginPath(); ctxR.arc(0, 0, 12, 0, Math.PI * 2); ctxR.fill();

        ctxR.restore();
    };

    ctxR.save();
    ctxR.translate(-25, 25);
    drawHandle(angle);           // 1本目のハンドル
    drawHandle(angle + Math.PI); // 2本目のハンドル (180度反対)
    ctxR.restore();

    ctxR.restore(); // 元の座標系を復元

    // 5. リール名称の表示 (回転しないよう固定位置に配置)
    const reelInfo = REEL_LIST.find(r => r.id === currentReelId);
    if (reelInfo) {
        ctxR.save();
        // 右下に配置 (画面端から少し内側へ)
        ctxR.translate(w - 5, h - 5);
        ctxR.fillStyle = "#ffffff";
        ctxR.shadowBlur = 2;
        ctxR.shadowColor = "rgba(0,0,0,0.5)";
        ctxR.font = "bold 9px 'sans-serif'"; // 必要ならフォント指定
        ctxR.textAlign = "right";       // 右揃え
        ctxR.textBaseline = "bottom";   // 下揃え
        ctxR.fillText(reelInfo.name, 0, 0);
        ctxR.restore();
    }
}

function drawBoat(sway) {
    ctx.save();
    ctx.translate(0, sway * 15);
    const surfaceY = 84; // 水面ライン

    // 船体を描画する基準点
    ctx.save();
    ctx.translate(20, surfaceY);

    // 船体 (ハル: 15px分だけ水中に沈める)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(150, 15);     // 船尾底 (水中)
    ctx.lineTo(30, 15);      // 船底 (水中)
    ctx.bezierCurveTo(10, 15, 5, 0, 0, -25); // 船首 (水上のデッキへ)
    ctx.lineTo(150, -25);    // デッキ面 (水上)
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1; ctx.stroke();

    // 船名「cocona」を側面に表示 (青文字で大きく)
    ctx.fillStyle = "#3b82f6"; ctx.font = "bold 18px 'Outfit', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("cocona", 85, -5);

    // キャビン
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(65, -25); ctx.lineTo(130, -25); ctx.lineTo(120, -50); ctx.lineTo(70, -50);
    ctx.closePath(); ctx.fill();

    // 船首に船長を配置 (x=25 付近)
    drawCaptain(25, -49, 0.6);

    // 窓 (元に戻す)
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(85, -45, 30, 12);

    // 舵 (窓の近くにシルエット)
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(90, -35, 4, 0, Math.PI * 2); ctx.stroke();

    // 手すり
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -25); ctx.lineTo(0, -35); ctx.lineTo(65, -35);
    ctx.moveTo(130, -35); ctx.lineTo(150, -35); ctx.lineTo(150, -25);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
}

function drawRod(tipX, tipY, sway) {
    ctx.save();
    ctx.translate(0, sway * 15);
    let rodColor = "#333", accentColor = "#ff0000", isLimited = (currentRodId === 'limited');
    if (currentRodId.includes('ss') || currentRodId.includes('xr')) { rodColor = "#2c0e0e"; accentColor = "#ff4d4d"; }
    else if (isLimited) { rodColor = "#1a0505"; accentColor = "#8b0000"; }

    // 1. グリップ (船尾デッキ Y=59 付近に配置: surfaceY 84 - 25)
    let startX = 160, startY = 59;

    // グリップ描画
    ctx.save();
    ctx.translate(startX, startY);
    ctx.beginPath();
    let gripGrad = ctx.createLinearGradient(0, 0, 80, 20);
    gripGrad.addColorStop(0, "#111"); gripGrad.addColorStop(1, isLimited ? "#3d0a0a" : "#222");
    ctx.fillStyle = gripGrad; ctx.moveTo(0, 0); ctx.quadraticCurveTo(40, -5, 80, 5); ctx.lineTo(85, 10); ctx.quadraticCurveTo(40, 15, 0, 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = isLimited ? "#fbbf24" : "#71717a"; ctx.fillRect(80, 2, 8, 10);
    ctx.restore();

    // 2. ブランクス
    let bX = startX + 88, bY = startY + 7;
    let dx = tipX - bX, dy = tipY - bY;

    let cp1x = bX + dx * 0.4, cp1y = bY + dy * 0.1;
    let cp2x = bX + dx * 0.75, cp2y = bY + dy * 0.6;

    ctx.beginPath(); ctx.moveTo(bX, bY);
    let blankGrad = ctx.createLinearGradient(bX, bY, tipX, tipY);
    blankGrad.addColorStop(0, rodColor); blankGrad.addColorStop(0.5, isLimited ? "#5c1010" : rodColor); blankGrad.addColorStop(1, "#000");
    ctx.strokeStyle = blankGrad; ctx.lineWidth = isLimited ? 5 : 4;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tipX, tipY);
    ctx.stroke();

    // 3. ガイド
    ctx.strokeStyle = isLimited ? "#fbbf24" : "#71717a"; ctx.lineWidth = 1;
    const guideCount = isLimited ? 7 : 5;
    for (let i = 1; i <= guideCount; i++) {
        let t = Math.pow(i / guideCount, 0.7);
        let invT = 1 - t;
        let gx = Math.pow(invT, 3) * bX + 3 * Math.pow(invT, 2) * t * cp1x + 3 * invT * Math.pow(t, 2) * cp2x + Math.pow(t, 3) * tipX;
        let gy = Math.pow(invT, 3) * bY + 3 * Math.pow(invT, 2) * t * cp1y + 3 * invT * Math.pow(t, 2) * cp2y + Math.pow(t, 3) * tipY;
        ctx.beginPath(); ctx.arc(gx, gy, 2, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = isLimited ? "#fbbf24" : "#333";
        ctx.fillRect(gx - 2, gy - 1, 4, 3);
    }

    ctx.restore();
}

function drawShark(x, y, scale, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    // ボディ
    let sharkGrad = ctx.createLinearGradient(0, -20, 0, 20);
    sharkGrad.addColorStop(0, "#484848");
    sharkGrad.addColorStop(0.5, "#666");
    sharkGrad.addColorStop(1, "#222");
    ctx.fillStyle = sharkGrad;

    ctx.beginPath();
    ctx.moveTo(-100, 0);
    ctx.bezierCurveTo(-80, -40, 40, -40, 100, -5); // 背中
    ctx.lineTo(100, 5);
    ctx.bezierCurveTo(40, 40, -80, 40, -100, 0); // 腹
    ctx.fill();

    // 尾びれ
    ctx.beginPath();
    ctx.moveTo(-95, 0);
    ctx.lineTo(-130, -30);
    ctx.lineTo(-115, 0);
    ctx.lineTo(-130, 30);
    ctx.closePath();
    ctx.fill();

    // 背びれ
    ctx.beginPath();
    ctx.moveTo(-10, -32);
    ctx.quadraticCurveTo(10, -60, 40, -28);
    ctx.closePath();
    ctx.fill();

    // 胸びれ
    ctx.beginPath();
    ctx.moveTo(10, 28);
    ctx.quadraticCurveTo(30, 55, 60, 20);
    ctx.closePath();
    ctx.fill();

    // エラ
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(30 + i * 8, -10); ctx.lineTo(35 + i * 8, 10); ctx.stroke();
    }

    // 口と歯
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(70, 15);
    for (let i = 0; i < 5; i++) {
        ctx.lineTo(75 + i * 5, 10);
        ctx.lineTo(80 + i * 5, 15);
    }
    ctx.fill();

    // 目
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(75, -5, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ff0000";
    ctx.beginPath(); ctx.arc(76, -5, 1, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
}

function drawFish(x, y, color) {
    ctx.save(); ctx.translate(x, y);
    ctx.scale(-1, 1);

    let fishGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 10);
    fishGrad.addColorStop(0, "#fff");
    fishGrad.addColorStop(1, color);

    ctx.fillStyle = fishGrad;
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-14, -4); ctx.lineTo(-14, 4); ctx.closePath(); ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(4, -1, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function initSeabed() {
    seabedObjects = [];
    for (let i = 0; i < 20; i++) seabedObjects.push({ x: Math.random() * canvas.width, y: 385, type: Math.random() > 0.4 ? 'rock' : 'weed', size: 25 + Math.random() * 30, offset: Math.random() * Math.PI * 2 });
}

function initEnvSquids() {
    envSquids = [];
    for (let i = 0; i < 5; i++) envSquids.push({ x: Math.random() * 600, baseY: 100 + Math.random() * 200, y: 0, scale: 0.2 + Math.random() * 0.15, speed: 0.4 + Math.random() * 0.6, alpha: 0.1 + Math.random() * 0.15, phase: Math.random() * Math.PI * 2 });
}

function initAtmosphere() {
    lightRays = [];
    for (let i = 0; i < 5; i++) lightRays.push(new LightRay(canvas.width));
    bubbles = [];
    for (let i = 0; i < 15; i++) bubbles.push(new Bubble(canvas.width, canvas.height));
}

function actionFall() {
    timers.forEach(clearTimeout);
    const [min, max] = selectedLocObj.depth;
    targetDepth = (Math.random() * (max - min) + min).toFixed(1);
    document.getElementById('target-depth').innerText = targetDepth;
    currentDepth = 0; state = 'falling'; jerkCount = 0;
    if (jerkFallbackTimer) { clearTimeout(jerkFallbackTimer); jerkFallbackTimer = null; }
    msg.innerText = "フォール中...";
    setBtn('btn-fall', false); setBtn('btn-jerk', true); setBtn('btn-stay', false);
    setBtn('btn-retrieve', true);

    fallCount++;
    fishSchool = [];
    isMultiHitChance = false;
    currentEvent = 'none';

    // フォール開始時にイカ出現の抽選（通常時は20%の確率）
    canSquidsAppearThisFall = (Math.random() < 0.20);

    if (fallCount % 3 === 0) {
        isMultiHitChance = true;
        const rand = Math.random();
        if (rand < 0.2) currentEvent = 'fever';
        else if (rand < 0.4) currentEvent = 'golden';
        else if (rand < 0.6) currentEvent = 'baku';
        else currentEvent = 'none'; // 'multi' を廃止

        for (let i = 0; i < 15; i++) {
            fishSchool.push({
                x: canvas.width + Math.random() * 200,
                y: 120 + Math.random() * 250, // 海面(84)より深く配置
                speed: 3 + Math.random() * 2,
                color: (currentEvent === 'golden') ? '#ffd700' : RAINBOW_COLORS[Math.floor(Math.random() * RAINBOW_COLORS.length)]
            });
        }
    }
}

function actionJerk() {
    if (state === 'bottom' || state === 'staying' || state === 'falling') {
        if (jerkFallbackTimer) { clearTimeout(jerkFallbackTimer); jerkFallbackTimer = null; }

        playJerkSound(); jerkCount++; currentDepth = Math.max(0, currentDepth - 2.0);
        state = 'staying'; // 一時的にステイ状態にする（物理演算はdrawで行われる）
        isManualStay = false; // シャクリ中は手動ステイではない
        msg.innerText = `シャクリ！`;

        setBtn('btn-stay', true);
        setBtn('btn-jerk', true); // 連続実行を許可するため常に有効

        // シャクリ後、0.2秒の間を置いて自動的に沈下へ移行
        jerkFallbackTimer = setTimeout(() => {
            if (state === 'staying' || state === 'bottom') {
                state = 'falling';
                msg.innerText = "フォール中...";
                jerkCount = 0; // コンボリセット
                // フォール中もシャクリボタンは有効のままにする
            }
            jerkFallbackTimer = null;
        }, 200);

        // イカを寄せる演出 (魚群発生時は最大10匹、通常時は1-2匹)
        const isFishSchoolActive = (currentEvent !== 'none' || feverTimer > 0);

        // 魚群時は常に出現、通常時はフォール開始時の抽選結果に従う
        const shouldSpawn = isFishSchoolActive || canSquidsAppearThisFall;

        if (shouldSpawn) {
            const maxSquids = isFishSchoolActive ? 10 : 2;
            const spawnChance = isFishSchoolActive ? 0.8 : 0.4; // 出現が確定した上での取引度合い
            const spawnCount = isFishSchoolActive ? 10 : 1;
            // エギの現在位置を計算（draw関数と同じロジック）
            const maxD = Math.max(targetDepth, 15);
            const calcEgiY = 40 + (currentDepth / maxD) * 320;
            const calcEgiX = canvas.width * 0.5;

            for (let i = 0; i < spawnCount && approachingSquids.length < maxSquids; i++) {
                const spawnAngle = Math.random() * Math.PI * 2;
                const spawnDist = 300 + Math.random() * 150;
                approachingSquids.push({
                    x: calcEgiX + Math.cos(spawnAngle) * spawnDist,
                    y: calcEgiY + Math.sin(spawnAngle) * spawnDist,
                    targetDist: 50 + Math.random() * 80,
                    angle: spawnAngle,
                    speed: 0.01 + Math.random() * 0.02,
                    scale: 0.5 + Math.random() * 0.3,
                    alpha: 0,
                    phase: Math.random() * Math.PI * 2,
                    color: Math.random() < selectedLocObj.redProb ? "#ff0000" : "#ffffff"
                });
            }
        }
    }
}

function actionStay() {
    if (jerkFallbackTimer) { clearTimeout(jerkFallbackTimer); jerkFallbackTimer = null; }
    state = 'staying';
    isManualStay = true; // ユーザーが明示的にステイを選択
    msg.innerText = "ステイ... ティップに注目";
    setBtn('btn-stay', false); setBtn('btn-jerk', true);
}

function actionRetrieve() {
    if (state === 'falling' || state === 'staying' || state === 'bottom') {
        state = 'retrieving';
        msg.innerText = "エギ回収中...";
        canSquidsAppearThisFall = false; // 抽選結果をリセット
        setBtn('btn-fall', false);
        setBtn('btn-jerk', false);
        setBtn('btn-stay', false);
        setBtn('btn-retrieve', false);
    }
}


function actionHook() {
    if (state === 'hit') {
        playHitSound(); state = 'fighting'; squidDist = currentDepth; tension = 40;
        document.getElementById('btn-hook').style.display = 'none';
        document.getElementById('btn-reel').style.display = 'block';
        document.getElementById('reel-visual').style.display = 'block';
        drawReel(reelRotAngle); // 初期状態描画
        document.getElementById('gauge-container').style.display = 'block';
        document.getElementById('dist-container').style.display = 'block';

        // 1/10の確率でサメが襲来
        isSharkAttacking = Math.random() < 0.1;
        if (isSharkAttacking) {
            sharkX = canvas.width + 300;
            sharkY = 0;
            sharkBite = false;
        }
    }
}

function drawDepthMeter(currentD, targetD, surfaceY) {
    const meterX = 35;
    const meterYStart = surfaceY;
    const meterYEnd = 380; // 海底のY座標
    const meterHeight = meterYEnd - meterYStart;

    // 背面パネル
    ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
    ctx.beginPath();
    ctx.roundRect(meterX - 25, meterYStart - 10, 85, meterHeight + 20, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.stroke();

    // メインスケール
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(meterX, meterYStart);
    ctx.lineTo(meterX, meterYEnd);
    ctx.stroke();

    // 目盛り (10mごと)
    ctx.lineWidth = 1;
    ctx.textAlign = "right";
    ctx.font = "10px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    for (let i = 0; i <= targetD; i += 10) {
        let y = meterYStart + (i / Math.max(1, targetD)) * meterHeight;
        ctx.beginPath();
        ctx.moveTo(meterX, y);
        ctx.lineTo(meterX + 5, y);
        ctx.stroke();
        ctx.fillText(i + "m", meterX - 5, y + 4);
    }

    // 現在深度インジケーター
    let d = Math.max(0, currentD);
    let ratio = Math.min(1, d / Math.max(1, targetD));
    let markerY = meterYStart + ratio * meterHeight;

    // マーカー矢印
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(meterX + 8, markerY);
    ctx.lineTo(meterX + 18, markerY - 6);
    ctx.lineTo(meterX + 18, markerY + 6);
    ctx.closePath();
    ctx.fill();

    // 数値表示
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "left";
    ctx.fillText(d.toFixed(1) + "m", meterX + 22, markerY + 5);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fever logic
    if (feverTimer > 0) {
        feverTimer -= 1 / 60; // 60FPS assuming
        if (state === 'falling') currentDepth += selectedEgi.speed * 2; // 沈下2倍速
    }

    // Background Drawing (Split into Air and Water)
    const surfaceY = 84 + boatSway * 15; // 船の揺れと同期
    const waveFreq = 0.02;
    const waveAmp = 5;
    const waveOffset = Date.now() * 0.05;

    // Air/Sky Area (Above Water)
    ctx.fillStyle = feverTimer > 0 ? "#4a0044" : "#bde0fe";
    ctx.fillRect(0, 0, canvas.width, 400); // 一旦全面を空の色で塗る

    // Water Area (Below Wave)
    let grd = ctx.createLinearGradient(0, surfaceY, 0, 400);
    grd.addColorStop(0, feverTimer > 0 ? "#ff00ff" : "#0096c7");
    grd.addColorStop(0.2, "#005073");
    grd.addColorStop(0.8, selectedLocObj.color);
    grd.addColorStop(1, "#0a0500");
    ctx.fillStyle = grd;

    // 波打つ海面の描画
    ctx.beginPath();
    ctx.moveTo(0, canvas.height); // 左下
    for (let x = 0; x <= canvas.width; x += 10) {
        let y = surfaceY + Math.sin(x * waveFreq + waveOffset * 0.1) * waveAmp;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height); // 右下
    ctx.closePath();
    ctx.fill();

    boatSway = Math.sin(Date.now() * 0.001) * 1.0;
    drawBoat(boatSway);

    // 水深メーターを描画
    const displayDepth = (state === 'fighting') ? squidDist : currentDepth;
    drawDepthMeter(displayDepth, targetDepth, surfaceY);

    // Draw Atmosphere
    lightRays.forEach(ray => {
        ray.update(canvas.width);
        ray.draw(ctx, canvas.height);
    });

    bubbles.forEach(bubble => {
        bubble.update(canvas.width, canvas.height);
        bubble.draw(ctx);
    });

    // 墨の更新と描画
    for (let i = inkClouds.length - 1; i >= 0; i--) {
        inkClouds[i].update();
        inkClouds[i].draw(ctx);
        if (inkClouds[i].alpha <= 0) inkClouds.splice(i, 1);
    }

    envSquids.forEach(s => {
        s.x -= s.speed; s.y = s.baseY + Math.sin(Date.now() * 0.001 + s.phase) * 20;
        if (s.x < -100) s.x = canvas.width + 100;
        drawSquid(s.x, s.y, s.scale, s.alpha, 0, "#fff", false, false);
    });

    fishSchool.forEach(f => {
        f.x -= f.speed;
        if (f.x < -50) f.x = canvas.width + 100;
        // 波の高さに合わせてY座標を制限（海中のみ表示）
        const currentWaveY = surfaceY + Math.sin(f.x * waveFreq + waveOffset * 0.1) * waveAmp;
        const drawY = Math.max(f.y, currentWaveY + 15);
        drawFish(f.x, drawY, f.color);
    });


    // Seabed rendering with shading
    let seabedGrd = ctx.createLinearGradient(0, 380, 0, 400);
    seabedGrd.addColorStop(0, "#1a1105");
    seabedGrd.addColorStop(1, "#000");
    ctx.fillStyle = seabedGrd;
    ctx.fillRect(0, 380, canvas.width, 20);

    seabedObjects.forEach(obj => {
        obj.x -= 0.6; if (obj.x < -60) obj.x = canvas.width + 60;
        if (obj.type === 'weed') {
            ctx.strokeStyle = "#005a32"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(obj.x, 385);
            ctx.bezierCurveTo(obj.x - 10, 380, obj.x, 385 - obj.size / 2, obj.x, 385 - obj.size); ctx.stroke();
        } else { ctx.fillStyle = "#3d2b1f"; ctx.fillRect(obj.x, 375, obj.size, 12); }
    });

    const maxD = Math.max(targetDepth, 15);
    let egiY = 40 + (currentDepth / maxD) * 320;
    if (state === 'fighting') egiY = 40 + (squidDist / maxD) * 320;

    let tipX = 450, tipY = 100;
    if (state === 'hit') tipY += 30;
    if (state === 'fighting') tipY += (tension / 2);

    // Draw Rod and Line
    drawRod(tipX, tipY, boatSway);

    let egiX = canvas.width * 0.5;
    if (state === 'fighting') egiX = attackerSquid.currentX;

    // 接近中のイカの更新と描画 (360度接近 & じらし挙動 & 逃走演出)
    for (let i = approachingSquids.length - 1; i >= 0; i--) {
        const s = approachingSquids[i];

        // エギまでのベクトル計算
        const dx = egiX - s.x;
        const dy = egiY - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (s.fleeing) {
            // 逃走中：エギから離れる方向に高速移動
            s.x -= dx * 0.03;
            s.y -= dy * 0.03;
            s.alpha -= 0.02; // 徐々に消えていく

            // 画面外または透明になったら削除
            if (s.alpha <= 0 || s.x < -100 || s.x > canvas.width + 100 || s.y < -100 || s.y > canvas.height + 100) {
                approachingSquids.splice(i, 1);
                continue;
            }
        } else {
            // 通常の接近挙動：じらし（警戒）
            const teaseOffset = Math.sin(Date.now() * 0.002 + s.phase) * 30;
            const currentTargetDist = s.targetDist + teaseOffset;

            if (dist > currentTargetDist) {
                s.x += dx * s.speed;
                s.y += dy * s.speed;
            } else {
                s.x -= dx * s.speed * 0.5;
                s.y -= dy * s.speed * 0.5;
            }
            s.alpha = Math.min(0.4, s.alpha + 0.01);
        }

        // イカの向きをエギに向ける（逃走中は逆向き）
        const drawAngle = s.fleeing ? Math.atan2(dy, dx) : (Math.atan2(dy, dx) + Math.PI);
        drawSquid(s.x, s.y, s.scale, s.alpha, drawAngle, s.color, false, false);
    }

    // ラインの起点を揺れ(boatSway * 15)に同期
    ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(tipX, tipY + boatSway * 15);
    ctx.lineTo(egiX, egiY); ctx.stroke();

    let egiAngle = (state === 'falling') ? -Math.PI / 6 : (state === 'retrieving' ? Math.PI / 6 : 0);
    drawEgi(egiX, egiY, selectedEgi, egiAngle);

    if (state === 'retrieving') {
        currentDepth = Math.max(0, currentDepth - 0.8);
        reelRotAngle += 0.3;
        drawReel(reelRotAngle);
        if (currentDepth <= 0) {
            endGame("エギを回収しました。");
        }
    }

    if (state === 'falling') {
        if (currentDepth < targetDepth) {
            currentDepth += selectedEgi.speed * (feverTimer > 0 ? 2 : 1);

            // 魚群発生時はフォール中にヒット判定
            if (currentEvent !== 'none' || feverTimer > 0) {
                if (Math.random() < 0.01) triggerHit();
            }
        }
        else {
            currentDepth = parseFloat(targetDepth);
            state = 'bottom';
            setBtn('btn-jerk', true);
            setBtn('btn-stay', true);
            msg.innerText = "着底！";
        }
    }

    // 通常時はユーザーが明示的にステイを選んだ時のみヒット判定
    if (state === 'staying' && isManualStay && currentEvent === 'none' && feverTimer <= 0) {
        if (Math.random() < 0.008 && (approachingSquids.length > 0 || Math.random() < 0.05)) {
            triggerHit();
        }
    }

    if (attackerSquid && (state === 'hit' || state === 'staying')) {
        attackerSquid.currentX += (canvas.width * 0.5 - attackerSquid.currentX) * 0.05;
        if (attackerSquid.isKuromi) {
            drawKuromi(attackerSquid.currentX, egiY, attackerSquid.scale, 1, 0.1, false);
        } else {
            drawSquid(attackerSquid.currentX, egiY, attackerSquid.scale, 0.85, 0.1, attackerSquid.color, (state === 'hit'), false);
        }

        if (attackerSquid.event === 'baku') {
            drawBaku(attackerSquid.currentX + 80, egiY - 40, 0.6, 0.9, Math.sin(Date.now() * 0.005) * 0.2);
        }

        if (attackerSquid.isMulti) {
            drawSquid(attackerSquid.currentX + 30, egiY + 20, attackerSquid.scale * 0.8, 0.6, -0.2, attackerSquid.color, (state === 'hit'), false);
            drawSquid(attackerSquid.currentX - 20, egiY - 15, attackerSquid.scale * 0.9, 0.6, 0.3, attackerSquid.color, (state === 'hit'), false);
        }
    }

    if (state === 'fighting') {
        if (isSharkAttacking) {
            sharkX -= 12; // サメが高速で接近
            sharkY = egiY + Math.sin(Date.now() * 0.01) * 20;

            if (!sharkBite && Math.abs(sharkX - attackerSquid.currentX) < 50) {
                sharkBite = true; // イカを捕食
                playHitSound(); // 捕食音の代用
            }

            if (sharkBite) {
                if (sharkX < -200) {
                    isSharkAttacking = false;
                    endGame("サメに横取りされた！");
                    // returnを削除し、ループを継続させる
                }
            } else {
                // まだ食べていない間はリール操作可能
                if (!isReeling) {
                    tension -= 0.8; squidDist += 0.03; startDragSound();
                    // イカが逃げている時に墨を吐く
                    if (Math.random() < 0.08) {
                        inkClouds.push(new InkCloud(attackerSquid.currentX + 20, egiY, attackerSquid.scale));
                    }
                } else {
                    tension += 0.5; squidDist -= 0.05; stopDragSound();
                    reelRotAngle += 0.2; // 回転速度の調整（ラジアン）
                    drawReel(reelRotAngle);
                }
            }

            drawShark(sharkX, sharkY, 1.0, Math.PI);
        } else {
            if (!isReeling) {
                tension -= 0.8; squidDist += 0.03; startDragSound();
                // 通常のファイト時も逃走中に墨を吐く
                if (Math.random() < 0.08) {
                    inkClouds.push(new InkCloud(attackerSquid.currentX + 20, egiY, attackerSquid.scale));
                }
                if (Math.random() > 0.8) { particles.push({ x: tipX, y: tipY, vx: (Math.random() - 0.5) * 15, vy: -Math.random() * 10, color: '#00d2ff', size: 3 }); }
            } else {
                tension += 0.5; squidDist -= 0.05; stopDragSound();
                reelRotAngle += 0.2;
                drawReel(reelRotAngle);
            }
        }

        // endGameが呼ばれた場合はファイト関連の残りの描画・計算をスキップ
        if (state === 'fighting' && attackerSquid) {
            document.getElementById('gauge-bar').style.width = tension + "%";
            if (tension > 80) document.getElementById('gauge-bar').style.background = "var(--secondary)";
            else document.getElementById('gauge-bar').style.background = "linear-gradient(90deg, #2ecc71, #27ae60)";

            document.getElementById('dist-val').innerText = Math.max(0, squidDist).toFixed(1);

            let jetShake = Math.sin(Date.now() * 0.03) * (attackerSquid.isGiant ? 15 : 5);
            let targetX = isReeling ? (tipX + 50) : Math.max(tipX + 150, canvas.width * 0.8);
            attackerSquid.currentX += (targetX - attackerSquid.currentX) * 0.05;

            if (attackerSquid && !sharkBite) {
                if (attackerSquid.isKuromi) {
                    drawKuromi(attackerSquid.currentX + jetShake, egiY, attackerSquid.scale, 1, 0, true);
                } else {
                    drawSquid(attackerSquid.currentX + jetShake, egiY, attackerSquid.scale, 1, 0, attackerSquid.color, true, true);
                }

                if (attackerSquid.event === 'baku') {
                    drawBaku(attackerSquid.currentX + jetShake + 80, egiY - 40, 0.6, 0.9, Math.sin(Date.now() * 0.005) * 0.2);
                }

                if (attackerSquid.isMulti) {
                    drawSquid(attackerSquid.currentX + jetShake + 20, egiY + 25, attackerSquid.scale * 0.8, 0.8, 0.1, attackerSquid.color, true, true);
                    drawSquid(attackerSquid.currentX + jetShake - 15, egiY - 20, attackerSquid.scale * 0.9, 0.8, -0.1, attackerSquid.color, true, true);
                }
            }

            if (tension > 98 || tension < 2) endGame("ラインブレイク！バラした...");

            // 距離が0になるか、海面(egiY)が波の高さ(surfaceY)に達したら釣り上げ
            if (squidDist <= 0 || egiY <= surfaceY + 20) {
                playWinSound();
                let weight;
                let multiFactor = attackerSquid.isMulti ? 3 : 1;
                let bonusMoney = 0;

                if (attackerSquid.isKuromi) {
                    weight = 2005;
                    kuromiCaughtCount++;
                    money += 60000;
                    endGame(`😈 クロミ様を釣り上げた！世界クロミ化計画！ 🎉 (60,000G GET)`);
                } else if (attackerSquid.isGiant) {
                    weight = Math.floor(9000 + Math.random() * 13500);
                    redCount += multiFactor; if (weight > maxWeightRed) maxWeightRed = weight;
                    giantCaught = true; triggerGiantSquidWin();
                    endGame(`${attackerSquid.isMulti ? '群れごとGET！' : ''}ダイオウイカ ${weight}g🎉`);
                } else if (attackerSquid.isRed) {
                    weight = Math.floor(1800 + Math.random() * 2700);
                    redCount += multiFactor; if (weight > maxWeightRed) maxWeightRed = weight;
                    endGame(`${attackerSquid.isMulti ? 'トリプルヒット！' : ''}レッドモンスター ${weight}g🎉`);
                } else {
                    weight = Math.floor(400 + Math.random() * 800);
                    score += multiFactor; if (weight > maxWeightNormal) maxWeightNormal = weight;

                    let eventMsg = "";
                    if (attackerSquid.event === 'golden') {
                        multiFactor = 10;
                        eventMsg = "✨ 黄金のイカ獲得！10倍ボーナス！ ";
                    } else if (attackerSquid.event === 'baku') {
                        bonusMoney = 50000;
                        eventMsg = "💜 バクのボーナス 50,000G GET! ";
                    } else if (attackerSquid.event === 'fever') {
                        feverTimer = 30; // 30秒間のフィーバー
                        eventMsg = "🔥 入れ食いフィーバー開始（30秒）！ ";
                    }

                    endGame(`${eventMsg}${attackerSquid.isMulti ? '一網打尽！' : ''}アオリイカ ${weight}g🎉`);
                }
                money += (weight * multiFactor) + bonusMoney;
                checkUnlocks(score + redCount - multiFactor, score + redCount);
            }
        }
    }
    updateParticles();
    document.getElementById('current-depth').innerText = parseFloat(currentDepth).toFixed(1);
    requestAnimationFrame(draw);
}

function triggerHit() {
    if (state === 'hit' || state === 'fighting' || attackerSquid) return;

    let isKuromi = Math.random() < 0.20;

    // 接近中のイカがいる場合、その中から1匹を選択してヒットさせる
    let target = null;
    if (approachingSquids.length > 0) {
        // 最もエギに近いイカ、またはランダムに選択
        const idx = Math.floor(Math.random() * approachingSquids.length);
        target = approachingSquids[idx];
        approachingSquids.splice(idx, 1); // 接近リストから削除
    }

    let isRed = !isKuromi && (target ? (target.color === "#ff0000") : (Math.random() < selectedLocObj.redProb));
    let isGiant = !isKuromi && (currentRodId === 'limited' && isRed && Math.random() < 0.5);

    let finalEvent = currentEvent;
    if (feverTimer > 0) finalEvent = 'fever';

    // ターゲットがいない場合のためにエギのY座標を計算
    const maxD = Math.max(targetDepth, 15);
    const calcEgiY = 40 + (currentDepth / maxD) * 320;

    attackerSquid = {
        x: target ? target.x : (canvas.width + 150),
        y: target ? target.y : calcEgiY,
        scale: target ? target.scale : (isKuromi ? 0.9 : (isGiant ? 5.0 : (isRed ? 1.1 : 0.75))),
        color: target ? target.color : ((finalEvent === 'golden') ? "#ffd700" : (isGiant ? "#8b0000" : (isRed ? "#ff0000" : "#ffffff"))),
        isRed: isRed,
        isGiant: isGiant,
        isKuromi: isKuromi,
        currentX: target ? target.x : (canvas.width + 150),
        isMulti: false,
        event: finalEvent
    };

    if (finalEvent === 'golden') attackerSquid.scale *= 1.2;
    // ヒットしたイカ以外は逃げていく
    approachingSquids.forEach(s => s.fleeing = true);

    state = 'hit';
    if (attackerSquid.isKuromi) {
        msg.innerText = "😈 アタイの出番だよ！クロミちゃん参上！";
    } else {
        switch (finalEvent) {
            case 'fever': msg.innerText = "🔥 FEVER!! 入れ食いフィーバーだ！"; break;
            case 'golden': msg.innerText = "✨ GOLDEN!! 黄金のイカが現れた！"; break;
            case 'baku': msg.innerText = "💜 BAKU!! バクがイカを追い込んできたぞ！"; break;
            default: msg.innerText = attackerSquid.isGiant ? "⚠️ 警告：ダイオウイカ出現！" : (attackerSquid.isRed ? "💥 巨大なアタリ！" : "💥 アタリ！");
        }
    }
    document.getElementById('btn-hook').style.display = 'block';
    setBtn('btn-retrieve', false); // ヒット中は回収不可
    let hookTime = (feverTimer > 0) ? 2000 : 1300;
    timers.push(setTimeout(() => { if (state === 'hit') endGame("見切られた..."); }, hookTime));
}

function setBtn(id, e) { document.getElementById(id).disabled = !e; }
function endGame(t) {
    // すべてのタイマーをクリア
    timers.forEach(clearTimeout);
    timers = [];
    if (jerkFallbackTimer) { clearTimeout(jerkFallbackTimer); jerkFallbackTimer = null; }

    state = 'idle'; msg.innerText = t; attackerSquid = null; stopDragSound();
    isSharkAttacking = false; sharkBite = false;
    approachingSquids = [];
    inkClouds = [];
    canSquidsAppearThisFall = false; // 抽選結果をリセット
    document.getElementById('btn-reel').style.display = 'none';
    document.getElementById('reel-visual').style.display = 'none';
    document.getElementById('gauge-container').style.display = 'none';
    document.getElementById('dist-container').style.display = 'none';
    document.getElementById('btn-hook').style.display = 'none';
    setBtn('btn-fall', true); setBtn('btn-jerk', false); setBtn('btn-stay', false);
    setBtn('btn-retrieve', false);
    saveStats();
}

function startGame() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    bgm.play();
    selectedLocObj = LOCATIONS.find(l => l.id === document.getElementById('select-location').value);
    currentRodId = document.getElementById('select-rod').value;
    currentReelId = document.getElementById('select-reel').value;
    document.getElementById('start-screen').style.display = 'none';
    initSeabed(); initEnvSquids(); initAtmosphere(); saveStats();
}

function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal.style.display === 'block') modal.style.display = 'none';
    else {
        if (modalId === 'collection-modal') updateCollectionList();
        if (modalId === 'shop-modal') updateShopList();
        modal.style.display = 'block';
    }
}

function updateCollectionList() {
    document.getElementById('collection-list').innerHTML = `<div class="collection-item"><span>累計釣果: ${score} 杯</span><span>通常ベスト: ${maxWeightNormal}g</span></div><div class="collection-item" style="color:#ff416c"><span>RED/GIANT: ${redCount} 杯</span><span>RED/GIANTベスト: ${maxWeightRed}g</span></div>`;
}

function updateShopList() {
    document.getElementById('shop-money').innerText = money;
    const list = document.getElementById('shop-list'); list.innerHTML = "";
    EGI_SHOP.forEach(item => {
        if (item.secret && !giantCaught) return;
        const isOwned = ownedEgis.includes(item.id); const isSelected = currentEgiId === item.id;
        list.innerHTML += `<div class="shop-item"><div style="display:flex;justify-content:space-between"><span><b style="color:${item.color}">🦑</b> ${item.name}</span>${isOwned ? `<button class="btn-buy owned" onclick="selectEgi('${item.id}')">${isSelected ? '装着中' : '装着'}</button>` : `<button class="btn-buy" onclick="buyEgi('${item.id}', ${item.price})">${item.price}G</button>`}</div></div>`;
    });
}

function buyEgi(id, price) { if (money >= price) { money -= price; ownedEgis.push(id); saveStats(); updateShopList(); } else { alert("所持金が足りません！"); } }
function selectEgi(id) { currentEgiId = id; selectedEgi = EGI_SHOP.find(e => e.id === id); saveStats(); updateShopList(); }

function updateSelections() {
    const locS = document.getElementById('select-location'), rodS = document.getElementById('select-rod'), reelS = document.getElementById('select-reel');
    locS.innerHTML = ""; rodS.innerHTML = ""; reelS.innerHTML = "";
    LOCATIONS.forEach(l => { if (score + redCount >= l.req) locS.add(new Option(l.name, l.id)); });
    ROD_LIST.forEach(r => { if (score + redCount >= r.req) rodS.add(new Option(r.name, r.id)); });
    REEL_LIST.forEach(r => { if (score + redCount >= r.req) reelS.add(new Option(r.name, r.id)); });
}

function checkUnlocks(oldS, newS) {
    if (newS <= oldS) return;

    let unlockedItems = [];
    LOCATIONS.forEach(l => { if (l.req > oldS && l.req <= newS) unlockedItems.push(`釣り場: ${l.name}`); });
    ROD_LIST.forEach(r => { if (r.req > oldS && r.req <= newS) unlockedItems.push(`ロッド: ${r.name}`); });
    REEL_LIST.forEach(r => { if (r.req > oldS && r.req <= newS) unlockedItems.push(`リール: ${r.name}`); });

    if (unlockedItems.length > 0) {
        const banner = document.getElementById('unlock-banner');
        banner.innerText = "UNLOCK! " + unlockedItems.join(', ');
        banner.classList.add('show');
        setTimeout(() => banner.classList.remove('show'), 4000);
    }
}
function showStartScreen() { updateSelections(); document.getElementById('start-screen').style.display = 'flex'; }

const rb = document.getElementById('btn-reel');
rb.onmousedown = () => isReeling = true; window.onmouseup = () => isReeling = false;
rb.ontouchstart = (e) => { e.preventDefault(); isReeling = true; }; rb.ontouchend = () => isReeling = false;

window.onload = () => {
    updateSelections();
    updateTackleDisplay();
    initAtmosphere();
    draw();
};
