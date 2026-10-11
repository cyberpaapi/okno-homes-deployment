'use client';
// jatin-yadav05 / Morphing Cursor, 21st.dev 9643. Retains the source's
// counter-translated text lens and lerp; runs only while a fine pointer is inside.
import { useEffect, useRef, type ReactNode, type PointerEvent } from 'react';
import styles from './MorphingText.module.css';

export function MorphingText({ children }: { children: ReactNode }) {
  const root = useRef<HTMLSpanElement>(null), lens = useRef<HTMLSpanElement>(null), inner = useRef<HTMLSpanElement>(null);
  const frame = useRef(0), active = useRef(false), target = useRef({x:0,y:0}), current = useRef({x:0,y:0});
  const stop = () => { active.current=false;cancelAnimationFrame(frame.current);frame.current=0;root.current?.removeAttribute('data-active'); };
  useEffect(() => {
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    window.addEventListener('blur',stop);document.addEventListener('visibilitychange',stop);reduced.addEventListener('change',stop);
    return () => {stop();window.removeEventListener('blur',stop);document.removeEventListener('visibilitychange',stop);reduced.removeEventListener('change',stop);};
  }, []);
  const move = (event: PointerEvent<HTMLSpanElement>) => {
    if(event.pointerType!=='mouse'||!matchMedia('(hover:hover) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    const rect=event.currentTarget.getBoundingClientRect();
    target.current={x:event.clientX-rect.left,y:event.clientY-rect.top};
    if(!active.current){current.current={...target.current};active.current=true;event.currentTarget.dataset.active='true';}
    if(inner.current){inner.current.style.width=`${rect.width}px`;inner.current.style.height=`${rect.height}px`;}
    if(frame.current)return;
    let last=performance.now();
    const animate=(now:number)=>{
      frame.current=0;if(!active.current)return;
      const factor=1-Math.pow(.85,Math.min((now-last)/16.667,3));last=now;
      current.current.x+=(target.current.x-current.current.x)*factor;current.current.y+=(target.current.y-current.current.y)*factor;
      const {x,y}=current.current;
      if(lens.current)lens.current.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
      if(inner.current)inner.current.style.transform=`translate(${-x}px,${-y}px)`;
      if(Math.hypot(target.current.x-x,target.current.y-y)>.1)frame.current=requestAnimationFrame(animate);
    };
    frame.current=requestAnimationFrame(animate);
  };
  return <span ref={root} className={styles.root} data-cursor="lens" onPointerMove={move} onPointerLeave={stop}>
    {children}
    <span ref={lens} className={styles.lens} aria-hidden="true"><span ref={inner} className={styles.inner}>{children}</span></span>
  </span>;
}
