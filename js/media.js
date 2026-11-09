import { $$, esc } from './dom.js';

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

      // Lets whoever owns the carousel react to a slide change (bubbles up from .car)
      car.dispatchEvent(new CustomEvent('carousel:change', { bubbles: true, detail: { index } }));
    };

    car.show = show;   // lets other code jump to a slide: car.show(3)
    show(Number(car.dataset.start) || 0);
    previous.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    car.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') show(index + 1);
      else if (event.key === 'ArrowLeft') show(index - 1);
    });
  });
}

// Carousel markup, the same structure as the hand-written ones in index.html.
// `slides` are HTML strings; `start` is the slide to open on.
export const carouselHTML = ({ slides, label, start = 0 }) => `
  <div class="car" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${esc(label)}" data-start="${start}">
    <div class="car-stage">${slides.map(slide => `<div class="car-slide">${slide}</div>`).join('')}</div>
    <div class="fb-bar">
      <button type="button" class="car-prev" aria-label="Previous">[ BACK ]</button>
      <span class="fb-count" aria-live="polite"></span>
      <button type="button" class="car-next" aria-label="Next">[ NEXT ]</button>
    </div>
  </div>`;