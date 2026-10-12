export const HERO_FILM_START = .06;
export const HERO_FILM_END = .9;
export const HERO_FILM_EXIT = .95;
export const heroFilmProgress = (scroll: number) => Math.min(1, Math.max(0, (scroll - HERO_FILM_START) / (HERO_FILM_END - HERO_FILM_START)));
// Native media duration can be rounded to milliseconds. Use the last frame
// index so its presentation reaches exactly 1 rather than 0.99998.
export const heroFilmLastTime = (duration: number) => Math.max(0, Math.round(duration*24)-1)/24;
