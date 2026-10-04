import { mountMicroSlats } from './micro-slats.js?v=hex4';

const root = document.getElementById('micro-slats');
if (root) {
  mountMicroSlats(root, {
    preset: 'swell',
    color: '#48ec90',
    glintColor: '#ffffff',
    backgroundColor: '#120f17',
    slatWidth: 10,
    slatHeight: 25,
    gap: 3,
    roundness: 0.75,
    interactive: true,
    cursorStrength: 1,
    cursorSize: 40,
    swirl: 0,
    trail: 1.4,
    lean: 0,
    intro: true,
    scale: 1.5,
    speed: 0.6,
    direction: 250,
    chop: 0.55,
    stretch: 0,
    glint: 0.7,
    contrast: 1.25,
    perspective: 0.55,
    fog: 0.55,
    introDuration: 0.45,
    paused: false,
  });
}
