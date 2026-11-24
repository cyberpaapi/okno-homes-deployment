"use client";

import { useState, type CSSProperties } from "react";
import SustainabilityJourney from "./SustainabilityJourney";
import SustainabilityProof from "./SustainabilityProof";
import SustainabilityEnding from "./SustainabilityEnding";
import styles from "./SustainabilityFramingPreview.module.css";

export default function SustainabilityFramingPreview() {
  const [zoom, setZoom] = useState<number | null>(null);
  const [gradient, setGradient] = useState(true);
  const [surround, setSurround] = useState("#000000");
  const variables = {
    ...(zoom === null ? {} : { "--sustainability-video-zoom": String(zoom / 100) }),
    "--sustainability-surround": surround,
    "--sustainability-gradient-opacity": gradient ? "1" : "0",
  } as CSSProperties;

  return <main data-route="sustainability" style={variables}>
    <SustainabilityJourney />
    <SustainabilityProof />
    <SustainabilityEnding />
    <details className={styles.controls} data-lenis-prevent open>
      <summary>Preview controls</summary>
      <div>
        <label htmlFor="video-zoom">Video zoom <output>{zoom === null ? "Auto fit" : `${zoom}%`}</output></label>
        <input id="video-zoom" type="range" min="106" max="220" step="1" value={zoom ?? 154} onChange={event => setZoom(Number(event.target.value))} />
        <label htmlFor="video-gradient">Scroll-matched gradient <input id="video-gradient" type="checkbox" checked={gradient} onChange={event => setGradient(event.target.checked)} /></label>
        <label className={styles.colour} htmlFor="video-surround">Base gap colour <input id="video-surround" type="color" value={surround} onInput={event => setSurround(event.currentTarget.value)} onChange={event => setSurround(event.target.value)} /></label>
        <button type="button" onClick={() => { setZoom(null); setSurround("#000000"); setGradient(true); }}>Reset</button>
      </div>
    </details>
  </main>;
}
