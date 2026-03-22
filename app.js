'use strict';

/* ─── Telegram WebApp Bootstrap ────────────────────────────────────── */

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();

  if (typeof tg.disableVerticalSwipes === 'function') {
    tg.disableVerticalSwipes();
  }

  applyTelegramTheme(tg);
  applyViewportFix(tg);
  applySafeArea(tg);

  tg.onEvent('themeChanged', () => applyTelegramTheme(tg));
  tg.onEvent('viewportChanged', () => {
    applyViewportFix(tg);
    applySafeArea(tg);
  });
}

/* ─── Theme ─────────────────────────────────────────────────────────── */

function applyTelegramTheme(telegramApp) {
  const params = telegramApp?.themeParams;
  if (!params) return;

  const root = document.documentElement;
  const map = {
    '--tg-theme-bg-color':           params.bg_color,
    '--tg-theme-text-color':         params.text_color,
    '--tg-theme-button-color':       params.button_color,
    '--tg-theme-button-text-color':  params.button_text_color,
    '--tg-theme-hint-color':         params.hint_color,
    '--tg-theme-link-color':         params.link_color,
    '--tg-theme-secondary-bg-color': params.secondary_bg_color,
  };

  for (const [prop, value] of Object.entries(map)) {
    if (value) root.style.setProperty(prop, value);
  }
}

/* ─── Viewport Height Fix ───────────────────────────────────────────── */

function applyViewportFix(telegramApp) {
  const stableHeight = telegramApp?.viewportStableHeight;
  const height = (stableHeight && stableHeight > 0)
    ? stableHeight
    : window.innerHeight;

  const vh = height * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

/* ─── Safe Area Insets ──────────────────────────────────────────────── */

function applySafeArea(telegramApp) {
  const inset = telegramApp?.safeAreaInset;
  const root = document.documentElement;

  root.style.setProperty('--safe-top',    `${inset?.top    ?? 0}px`);
  root.style.setProperty('--safe-bottom', `${inset?.bottom ?? 0}px`);
  root.style.setProperty('--safe-left',   `${inset?.left   ?? 0}px`);
  root.style.setProperty('--safe-right',  `${inset?.right  ?? 0}px`);
}

/* ─── Upload Screen ─────────────────────────────────────────────────── */

const uploadScreen = document.getElementById('uploadScreen');
const sliderContainer = document.getElementById('sliderContainer');
const fileBefore = document.getElementById('fileBefore');
const fileAfter  = document.getElementById('fileAfter');
const previewBefore = document.getElementById('previewBefore');
const previewAfter  = document.getElementById('previewAfter');
const startBtn = document.getElementById('startBtn');
const backBtn  = document.getElementById('backBtn');

let urlBefore = null;
let urlAfter  = null;

function readFileAsURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setPreview(previewEl, dataUrl) {
  let img = previewEl.querySelector('img');
  if (!img) {
    img = document.createElement('img');
    previewEl.appendChild(img);
  }
  img.src = dataUrl;
  previewEl.classList.add('has-image');
}

fileBefore.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  urlBefore = await readFileAsURL(file);
  setPreview(previewBefore, urlBefore);
  updateStartBtn();
});

fileAfter.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  urlAfter = await readFileAsURL(file);
  setPreview(previewAfter, urlAfter);
  updateStartBtn();
});

function updateStartBtn() {
  startBtn.disabled = !(urlBefore && urlAfter);
}

startBtn.addEventListener('click', () => {
  launchSlider(urlBefore, urlAfter);
});

backBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  sliderContainer.style.display = 'none';
  uploadScreen.style.display = 'flex';
  setPosition(50);
});

function launchSlider(srcBefore, srcAfter) {
  uploadScreen.style.display = 'none';
  sliderContainer.style.display = 'flex';

  requestAnimationFrame(() => {
    const card = document.getElementById('sliderCard');
    if (card) {
      document.documentElement.style.setProperty('--slider-w', card.offsetWidth + 'px');
    }
  });

  loadingOverlay.classList.remove('hidden');
  loadingOverlay.style.display = 'flex';

  loadedCount = 0;
  imagesReady = false;

  imgBefore.src = srcBefore;
  imgAfter.src  = srcAfter;

  setPosition(50);
}

/* ─── Slider ────────────────────────────────────────────────────────── */

const container      = document.getElementById('sliderContainer');
const divider        = document.getElementById('divider');
const loadingOverlay = document.getElementById('loadingOverlay');
const imgBefore      = document.getElementById('imgBefore');
const imgAfter       = document.getElementById('imgAfter');

let isDragging = false;
let rafPending = false;
let lastClientX = 0;

function setPosition(percent) {
  const clamped = Math.max(0, Math.min(100, percent));
  document.documentElement.style.setProperty('--split-pos', `${clamped}%`);
}

function clientXToPercent(clientX) {
  const card = document.getElementById('sliderCard');
  const rect = (card ?? container).getBoundingClientRect();
  return ((clientX - rect.left) / rect.width) * 100;
}

/* ─── Pointer Events ────────────────────────────────────────────────── */

divider.addEventListener('pointerdown', (e) => {
  isDragging = true;
  divider.setPointerCapture(e.pointerId);
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  lastClientX = e.clientX;
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      setPosition(clientXToPercent(lastClientX));
    });
  }
});

document.addEventListener('pointerup', () => {
  isDragging = false;
});

document.addEventListener('pointercancel', () => {
  isDragging = false;
});

container.addEventListener('pointerdown', (e) => {
  if (divider.contains(e.target)) return;
  if (backBtn.contains(e.target)) return;
  isDragging = true;
  container.setPointerCapture(e.pointerId);
  setPosition(clientXToPercent(e.clientX));
});

/* ─── Image Loading ─────────────────────────────────────────────────── */

let loadedCount = 0;
let imagesReady = false;

function onImageReady() {
  loadedCount += 1;
  if (loadedCount >= 2 && !imagesReady) {
    imagesReady = true;
    hideLoadingOverlay();
  }
}

function hideLoadingOverlay() {
  loadingOverlay.classList.add('hidden');
  setTimeout(() => {
    loadingOverlay.style.display = 'none';
  }, 350);
}

imgBefore.addEventListener('load',  onImageReady);
imgAfter.addEventListener('load',   onImageReady);

imgBefore.addEventListener('error', () => {
  imgBefore.style.backgroundColor = '#1a1a2e';
  onImageReady();
});

imgAfter.addEventListener('error', () => {
  imgAfter.style.backgroundColor = '#16213e';
  onImageReady();
});

/* ─── Init ──────────────────────────────────────────────────────────── */

if (!tg) applyViewportFix(null);

setPosition(50);

window.addEventListener('resize', () => {
  const card = document.getElementById('sliderCard');
  if (card && sliderContainer.style.display !== 'none') {
    document.documentElement.style.setProperty('--slider-w', card.offsetWidth + 'px');
  }
});
