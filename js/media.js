import { $$ } from './dom.js';

export function initVideos(root = document) {
  const videos = $$( 'video', root );
  if (!('IntersectionObserver' in window) || !videos.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) video.play()?.catch(() => {});
      else video.pause();
    });
  }, { threshold: 0.5 });
  videos.forEach(video => observer.observe(video));
}

export function initCarousels(root = document) {
  $$('.car', root).forEach(car => {
    if (car.dataset.carouselInitialized === 'true') return;
    const slides = $$('.car-slide', car);
    const count = car.querySelector('.fb-count');
    const previous = car.querySelector('.car-prev');
    const next = car.querySelector('.car-next');
    if (!slides.length || !count || !previous || !next) return;
    car.dataset.carouselInitialized = 'true';
    let index = 0;
    const show = nextIndex => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === index));
      count.textContent = `${index + 1} / ${slides.length}`;
    };
    previous.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    car.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') show(index + 1);
      else if (event.key === 'ArrowLeft') show(index - 1);
    });
    show(0);
  });
}
