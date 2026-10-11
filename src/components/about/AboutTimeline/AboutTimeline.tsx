"use client";

import { useEffect, useRef, useState } from 'react';
import styles from './AboutTimeline.module.css';
import { timelineData } from '../aboutData';
import AboutTimelineCheckpoint from './AboutTimelineCheckpoint';

export default function AboutTimeline() {
  const routeRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const [coordText, setCoordText] = useState("17.3850°N<br/>78.4867°E");

  useEffect(() => {
    const route = routeRef.current;
    const tip = tipRef.current;
    const coord = coordRef.current;
    const timeline = timelineRef.current;

    if (!route || !tip || !coord || !timeline) return;

    const routeLength = route.getTotalLength();
    route.style.strokeDasharray = `${routeLength} ${routeLength}`;
    route.style.strokeDashoffset = `${routeLength}`;

    const coords = [
      [17.3850, 78.4867], [17.2400, 78.3470], [17.1730, 78.3930],
      [18.4088, 73.5350], [18.4088, 73.5350], [38.9072, -77.0369],
      [17.3850, 78.4867]
    ];

    let ticking = false;

    function lerp(a: number, b: number, t: number) { 
      return a + (b - a) * t; 
    }

    function getCoord(p: number) {
      const scaled = p * (coords.length - 1);
      const i = Math.min(coords.length - 2, Math.floor(scaled));
      const t = scaled - i;
      return [lerp(coords[i][0], coords[i + 1][0], t), lerp(coords[i][1], coords[i + 1][1], t)];
    }

    function render() {
      ticking = false;
      const r = timeline!.getBoundingClientRect();
      const viewportPoint = window.innerHeight * 0.52;
      let p = (viewportPoint - r.top) / r.height;
      p = Math.max(0, Math.min(0.94, p));

      // Scale p to match the new shorter path, so the scroll speed feels the same
      // Original path max Y was 6100, new max Y is 5800.
      const pScaled = Math.min(1, p * (6100 / 5800));

      route!.style.strokeDashoffset = `${routeLength * (1 - pScaled)}`;

      const pt = route!.getPointAtLength(routeLength * pScaled);
      const x = (pt.x / 1000) * r.width;
      const y = (pt.y / 6200) * r.height;

      tip!.style.transform = `translate3d(${x - 5}px, ${y - 5}px, 0)`;
      coord!.style.transform = `translate3d(${x - 12}px, ${y - 18}px, 0)`;

      const [lat, lon] = getCoord(pScaled);
      setCoordText(`${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}<br/>${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`);

      // Handle visibility of stories
      const stories = document.querySelectorAll('.story');
      stories.forEach((story) => {
        const sr = story.getBoundingClientRect();
        const center = sr.top + sr.height * 0.5;
        const near = Math.abs(center - window.innerHeight * 0.52) < window.innerHeight * 0.48;
        if (near) {
          story.classList.add(styles.visible);
        } else {
          story.classList.remove(styles.visible);
        }
      });
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    
    // Initial render
    render();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section className={styles.timeline} ref={timelineRef}>
      <svg className={styles.route} viewBox="0 0 1000 6200" preserveAspectRatio="none">
        <path id="routeBg" className={styles.routeBg} d="
        M820 0 L735 180 L610 360 L470 560 L300 760
        L185 940 L240 1120 L430 1280 L720 1450
        L850 1650 L735 1830 L535 2010 L300 2180
        L155 2370 L225 2550 L445 2700 L760 2850
        L875 3040 L760 3210 L560 3400 L330 3570
        L150 3750 L230 3930 L475 4080 L780 4240
        L900 4420 L800 4600 L575 4760 L350 4930
        L170 5120 L260 5300 L260 5800" />
        <path ref={routeRef} id="activeRoute" className={styles.routeActive} d="
        M820 0 L735 180 L610 360 L470 560 L300 760
        L185 940 L240 1120 L430 1280 L720 1450
        L850 1650 L735 1830 L535 2010 L300 2180
        L155 2370 L225 2550 L445 2700 L760 2850
        L875 3040 L760 3210 L560 3400 L330 3570
        L150 3750 L230 3930 L475 4080 L780 4240
        L900 4420 L800 4600 L575 4760 L350 4930
        L170 5120 L260 5300 L260 5800" />
      </svg>
      <div ref={tipRef} id="routeTip" className={styles.routeTip}></div>
      <div ref={coordRef} id="liveCoordinate" className={styles.liveCoordinate} dangerouslySetInnerHTML={{ __html: coordText }}></div>

      {timelineData.map((checkpoint) => (
        <AboutTimelineCheckpoint
          key={checkpoint.id}
          {...checkpoint}
        />
      ))}
    </section>
  );
}
