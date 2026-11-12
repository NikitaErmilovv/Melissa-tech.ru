import { mountFlexCarousel } from './FlexCarousel.js?v=fc2';

const carouselFiles = [
  { file: 'rtg-01.jpg', title: 'Студия' },
  { file: 'rtg-06.jpg', title: 'Оклейка' },
  { file: 'rtg-07.jpg', title: 'Кузов' },
  { file: 'rtg-09.jpg', title: 'PPF' },
  { file: 'rtg-10.jpg', title: 'Полировка' },
  { file: 'rtg-11.jpg', title: 'Керамика' },
  { file: 'rtg-12.jpg', title: 'Антихром' },
  { file: 'rtg-05.jpg', title: 'Детейлинг' },
  { file: 'rtg-08.jpg', title: 'Работа' },
  { file: 'rtg-04.jpg', title: 'Защита' },
];

const items = carouselFiles.map(({ file, title }, i) => ({
  src: `img/work/${file}`,
  alt: `Auto Custom — ${title}`,
  title,
  subtitle: i % 3 === 0 ? 'Auto Custom' : undefined,
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
