import { mountFlexCarousel } from './FlexCarousel.js?v=fc2';

/** Hero carousel — largest / most detailed shots only */
const carouselFiles = [
  { file: 'rtg-11.jpg', title: 'Full wrap' },
  { file: 'rtg-30.jpg', title: 'Color change' },
  { file: 'rtg-15.jpg', title: 'Satin finish' },
  { file: 'rtg-16.jpg', title: 'Chrome delete' },
  { file: 'rtg-12.jpg', title: 'Partial wrap' },
  { file: 'rtg-33.jpg', title: 'PPF' },
  { file: 'rtg-32.jpg', title: 'Truck' },
  { file: 'rtg-35.jpg', title: 'Custom decals' },
  { file: 'rtg-09.jpg', title: 'Detail' },
  { file: 'rtg-08.jpg', title: 'Bay finish' },
];

const items = carouselFiles.map(({ file, title }, i) => ({
  src: `img/work/${file}`,
  alt: `RTG Wrapzz — ${title}`,
  title,
  subtitle: i % 3 === 0 ? 'RTG Wrapzz' : undefined,
}));

const root = document.getElementById('flex-carousel');
if (root) {
  mountFlexCarousel(root, {
    items,
    preset: 'liquid',
    intro: 'rise',
    cardHeight: 0.5,
    gap: 12,
    squeeze: 0.2,
    focusOnClick: true,
    captions: true,
    fit: 'natural',
    radius: 0,
    captureWheel: true,
  });
}
