export const heroFilmProgress = (scroll: number) => Math.min(1, Math.max(0, (scroll - .3) / .665));
// Native media duration can be rounded to milliseconds. Use the last frame
// index so its presentation reaches exactly 1 rather than 0.99998.
export const heroFilmLastTime = (duration: number) => Math.max(0, Math.round(duration*24)-1)/24;
