'use client';

// Landing previews adapt the retrieved 21st.dev Hero Scroll Video Reveal
// (25482), Parallax Scrolling (4775), Text Block Animation (9902), and
// Hover Expand (28111). They use OKNO's own media, copy, and destinations.
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { SubtleLink } from '@/components/ui/SubtleAction';
import { useSiteContentMap } from '@/lib/useSiteContent';
import { localDestination } from '@/lib/localDestination';
import TextBlock from './TextBlock';
import styles from './LandingPathways.module.css';

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function SignaturePreview() {
  const content = useSiteContentMap();
  const value = (id: string, fallback: string) => content[id] ?? fallback;
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTime = useRef(0);
  const reduced = useReducedMotion();
  const near = useInView(sectionRef, { margin: '100% 0px' });
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  // The landing's Lenis scroll already has momentum; an extra spring delays
  // the rotation film and its reveal behind the visitor's actual position.
  const progress = scrollYProgress;
  const clipPath = useTransform(progress, [0, .16, .74, 1], reduced
    ? ['inset(0% 0% 0% 0% round 0px)', 'inset(0% 0% 0% 0% round 0px)', 'inset(0% 0% 0% 0% round 0px)', 'inset(0% 0% 0% 0% round 0px)']
    : ['inset(18% 27% 18% 27% round 34px)', 'inset(7% 10% 7% 10% round 28px)', 'inset(0% 0% 0% 0% round 0px)', 'inset(0% 0% 0% 0% round 0px)']);
  const headingOpacity = useTransform(progress, [0, .14, .28], [1, 1, 0]);
  const closingOpacity = useTransform(progress, [.58, .72, .96], [0, 1, 1]);
  const closingY = useTransform(progress, [.58, .76], [42, 0]);

  const sync = (value: number) => {
    const video = videoRef.current;
    if (!video || video.seeking || !Number.isFinite(video.duration) || video.duration <= 0) return;
    targetTime.current = clamp(value) * Math.max(0, video.duration - .04);
    if (Math.abs(video.currentTime - targetTime.current) > .035) video.currentTime = targetTime.current;
  };

  useMotionValueEvent(progress, 'change', sync);
  useEffect(() => {
    if (!near) return;
    const video = videoRef.current;
    if (!video) return;
    const ready = () => sync(progress.get());
    video.addEventListener('loadedmetadata', ready);
    if (video.readyState >= 1) ready();
    return () => video.removeEventListener('loadedmetadata', ready);
  }, [near, progress]);

  return (
    <section id="models-preview" ref={sectionRef} className={styles.signature} aria-labelledby="signature-preview-title" data-component="25482">
      <div className={styles.signatureSticky}>
        <motion.div className={styles.signatureMedia} style={{ clipPath }}>
          <Image src={value('home.signature.image', '/models/forza/orbit-keyframes-invisible-glow-1080p/forza-invisible-a00.png')} alt={value('home.signature.image-alt', 'Forza Signature home exterior')} fill sizes="100vw" />
          {near && !reduced && <video ref={videoRef} src={value('home.signature.video', '/models/forza/video/forza-360-scroll-648p-24fps-fluid.mp4')} muted playsInline preload="metadata" aria-hidden="true" onSeeked={() => sync(progress.get())} />}
          <div className={styles.signatureGrade} />
        </motion.div>
        <motion.div className={styles.signatureHeading} style={{ opacity: headingOpacity }}>
          <span>{value('home.signature.label', 'Signature homes')}</span>
          <h2 id="signature-preview-title"><TextBlock lines={[value('home.signature.heading-1', 'Meet Forza.'), value('home.signature.heading-2', 'Turn the home with your scroll.')]} /></h2>
        </motion.div>
        <motion.div className={styles.signatureClosing} style={{ opacity: closingOpacity, y: closingY }}>
          <p>{value('home.signature.copy', 'Explore Forza and the complete Signature collection.')}</p>
          <SubtleLink href={localDestination(value('home.signature.action-href', '/models/signature'), '/models/signature')} data-cursor-media-action>{value('home.signature.action', 'View the models')}</SubtleLink>
        </motion.div>
      </div>
    </section>
  );
}

function BespokePreview() {
  const content = useSiteContentMap();
  const value = (id: string, fallback: string) => content[id] ?? fallback;
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-5%', '5%']);
  const wordX = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['8%', '-8%']);
  const cardY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [115, -115]);
  return (
    <section id="bespoke-preview" ref={sectionRef} className={styles.bespoke} aria-labelledby="bespoke-preview-title" data-component="4775">
      <motion.div className={styles.bespokeBackdrop} style={{ y: imageY }}>
        <Image src={value('home.bespoke.image', '/models/bespoke/bespoke-pearl-exterior-v1.webp')} alt={value('home.bespoke.image-alt', 'Bespoke limestone and oak home shaped around a wooded site')} fill sizes="100vw" />
      </motion.div>
      <div className={styles.bespokeShade} />
      <motion.p className={styles.bespokeWord} style={{ x: wordX }} aria-hidden="true">{value('home.bespoke.word', 'Bespoke')}</motion.p>
      <motion.figure className={styles.bespokeCard} style={{ y: cardY }}>
        <Image src={value('home.bespoke.card-image', '/models/bespoke/bespoke-pearl-courtyard-v1.webp')} alt={value('home.bespoke.card-alt', 'Bespoke courtyard opening to water and mature trees')} fill sizes="(max-width: 700px) 70vw, 31vw" />
      </motion.figure>
      <div className={styles.bespokeCopy}>
        <h2 id="bespoke-preview-title"><TextBlock lines={[value('home.bespoke.heading-1', 'One site.'), value('home.bespoke.heading-2', 'One original home.')]} /></h2>
        <p>{value('home.bespoke.copy', 'The architecture begins with your land, your routines and a brief of your own.')}</p>
        <SubtleLink href={localDestination(value('home.bespoke.action-href', '/models/bespoke'), '/models/bespoke')} data-cursor-media-action>{value('home.bespoke.action', 'Enter Bespoke')}</SubtleLink>
      </div>
    </section>
  );
}

function SustainabilityPreview() {
  const content = useSiteContentMap();
  const value = (id: string, fallback: string) => content[id] ?? fallback;
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useInView(sectionRef, { amount: .2 });
  const near = useInView(sectionRef, { margin: '70% 0px' });
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const mediaClip = useTransform(scrollYProgress, [.05, .36, .72, .95], reduced
    ? ['inset(0% 0% 0% 0% round 0px)', 'inset(0% 0% 0% 0% round 0px)', 'inset(0% 0% 0% 0% round 0px)', 'inset(0% 0% 0% 0% round 0px)']
    : ['inset(13% 20% 13% 20% round 34px)', 'inset(0% 0% 0% 0% round 0px)', 'inset(0% 0% 0% 0% round 0px)', 'inset(12% 8% 8% 8% round 32px)']);
  const copyY = useTransform(scrollYProgress, [.18, .48, .82], [70, 0, -45]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible && !reduced && !document.hidden) void video.play().catch(() => undefined);
    else video.pause();
  }, [visible, reduced]);

  return (
    <section id="sustainability-preview" ref={sectionRef} className={styles.sustainability} aria-labelledby="sustainability-preview-title" data-component="25482">
      <motion.div className={styles.sustainabilityMedia} style={{ clipPath: mediaClip }}>
        <Image src={value('home.sustainability.poster', '/sustainability/shared-poster.png')} alt={value('home.sustainability.poster-alt', 'OKNO home held within a dense green landscape')} fill sizes="100vw" />
        {near && !reduced && <video ref={videoRef} src={value('home.sustainability.video', '/sustainability/hero-idle.mp4')} poster={value('home.sustainability.poster', '/sustainability/shared-poster.png')} muted loop playsInline preload="metadata" aria-hidden="true" />}
        <div className={styles.sustainabilityGrade} />
      </motion.div>
      <motion.div className={styles.sustainabilityCopy} style={{ y: copyY }}>
        <span>{value('home.sustainability.label', 'Sustainability')}</span>
        <h2 id="sustainability-preview-title"><TextBlock lines={[value('home.sustainability.heading-1', 'Build less'), value('home.sustainability.heading-2', 'against the land.')]} /></h2>
        <p>{value('home.sustainability.copy', 'The slope, trees, light and path of water are inputs to the architecture.')}</p>
        <SubtleLink href={localDestination(value('home.sustainability.action-href', '/sustainability'), '/sustainability')} data-cursor-media-action>{value('home.sustainability.action', 'See the approach')}</SubtleLink>
      </motion.div>
    </section>
  );
}

const editorial = [
  {
    href: '/journal',
    title: 'From the journal',
    copy: 'Projects, published stories and notes from the practice.',
    image: '/assets/projects/real-v1/kioo-09.webp',
    alt: 'Warm-lit Kioo interior opening to the forest at dusk',
  },
  {
    href: '/about',
    title: 'About OKNO',
    copy: 'The people, thinking and making behind every home.',
    image: '/process/generated/process-factory-keyframe-v2.webp',
    alt: 'OKNO home taking shape in the factory',
  },
] as const;

function EditorialClose() {
  const content = useSiteContentMap();
  const value = (id: string, fallback: string) => content[id] ?? fallback;
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  return (
    <section id="editorial-preview" className={styles.editorial} aria-label="Journal and About OKNO" data-component="28111">
      {editorial.map((item, index) => {
        const id = item.href === '/journal' ? 'journal' : 'about';
        return (
        <motion.article
          className={styles.editorialPanel}
          key={item.href}
          animate={{ flexGrow: active === index ? 1.34 : .86 }}
          transition={reduced ? { duration: 0 } : { type: 'spring', duration: .55, bounce: .08 }}
          onMouseEnter={() => setActive(index)}
        >
          <Link href={localDestination(value(`home.editorial.${id}.href`, item.href), item.href)} onFocus={() => setActive(index)} data-cursor-media-action>
            <Image src={value(`home.editorial.${id}.image`, item.image)} alt={value(`home.editorial.${id}.image-alt`, item.alt)} fill sizes="(max-width: 700px) 100vw, 58vw" />
            <div className={styles.editorialShade} />
            <div className={styles.editorialCopy}><h2>{value(`home.editorial.${id}.title`, item.title)}</h2><p>{value(`home.editorial.${id}.copy`, item.copy)}</p><span>{value(`home.editorial.${id}.action`, 'Open')}</span></div>
          </Link>
        </motion.article>
      ); })}
    </section>
  );
}

export default function LandingPathways() {
  return (
    <>
      <SignaturePreview />
      <BespokePreview />
      <SustainabilityPreview />
      <EditorialClose />
    </>
  );
}
