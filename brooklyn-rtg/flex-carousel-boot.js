import { mountFlexCarousel } from './FlexCarousel.js?v=fc2';

const carouselFiles = [
  { file: 'bk-01.jpg', title: 'Полировка' },
  { file: 'bk-02.jpg', title: 'PPF' },
  { file: 'bk-03.jpg', title: 'Детейлинг' },
  { file: 'bk-04.jpg', title: 'Салон' },
  { file: 'bk-05.jpg', title: 'Кузов' },
  { file: 'bk-06.jpg', title: 'Блеск' },
  { file: 'bk-07.jpg', title: 'Защита' },
  { file: 'bk-08.jpg', title: 'Студия' },
  { file: 'bk-09.jpg', title: 'Результат' },
  { file: 'bk-10.jpg', title: 'Комплекс' },
];

const items = carouselFiles.map(({ file, title }, i) => ({
  src: `img/work/${file}`,
  alt: `Бруклин — ${title}`,
  title,
  subtitle: i % 3 === 0 ? 'Бруклин' : undefined,
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
