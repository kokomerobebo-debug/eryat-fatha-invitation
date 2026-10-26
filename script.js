'use strict';

const eventDate = new Date('2026-12-26T00:00:00+02:00');
const $ = (s) => document.querySelector(s);
const format = (number) => String(number).padStart(2, '0');

function updateCountdown() {
  const remaining = Math.max(0, eventDate.getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  $('#days').textContent = format(days);
  $('#hours').textContent = format(hours);
  $('#minutes').textContent = format(minutes);
  $('#seconds').textContent = format(seconds);
  $('#countdownFinished').hidden = remaining > 0;
}
updateCountdown();
setInterval(updateCountdown, 1000);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene = $('#envelopeScene');
const envelopeButton = $('#envelopeButton');
const invitationMusic = $('#invitationMusic');
let musicStarted = false;

function openEnvelope() {
  // A click on the envelope unlocks audio playback on desktop and mobile.
  // Keep one continuous soundtrack through the entire single-page invitation.
  if (!musicStarted && invitationMusic) {
    musicStarted = true;
    invitationMusic.volume = 0.65;
    const playAttempt = invitationMusic.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(() => { musicStarted = false; });
    }
  }
  scene.classList.add('open');
  envelopeButton.setAttribute('aria-expanded', 'true');
  const note = document.getElementById('tapNote');
  if (note) note.textContent = 'Your invitation is open — scroll to celebrate ✧';
}

envelopeButton.addEventListener('click', openEnvelope);
if (reducedMotion) {
  scene.classList.add('open');
  envelopeButton.setAttribute('aria-expanded', 'true');
}

document.documentElement.classList.add('js-ready');
const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.12 });
document.querySelectorAll('.animate-in').forEach(el => revealObserver.observe(el));

const car = $('#floatingCar');
let scheduled = false;

function positionCar() {
  scheduled = false;
  if (!car || reducedMotion) return;

  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop;
  const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));

  const startTop = 280;
  const endTop = doc.scrollHeight - Math.max(car.offsetHeight + 120, 280);
  const top = startTop + (endTop - startTop) * progress;
  const sway = Math.sin(progress * Math.PI * 4) * 12;
  const rotate = Math.sin(progress * Math.PI * 2) * 3;

  car.style.top = `${top}px`;
  car.style.transform = `translateX(${sway}px) rotate(${rotate}deg)`;
}

function requestPosition() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(positionCar);
  }
}
window.addEventListener('scroll', requestPosition, { passive: true });
window.addEventListener('resize', requestPosition);
window.addEventListener('load', requestPosition);
requestPosition();
