"use client";

// Reuses the documented 21st.dev accordion 24854, field 26101 and button 143
// adaptations from the page-first Content Studio.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { ContentItem } from "@/lib/contentCollections";
import type { GeocodePlace } from "@/lib/projectGeocoding";
import { parseProjectCoordinates } from "@/lib/projectCoordinates";
import base from "./CollectionEditor.module.css";
import styles from "./GlobePinsEditor.module.css";

type Props = {
  items: ContentItem[];
  onChange: (items: ContentItem[]) => void;
  disabled: boolean;
  onLookupLocation: (query: string) => Promise<GeocodePlace[]>;
};

function PinDetails({ initialOpen, children }: { initialOpen: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => { if (initialOpen && ref.current) ref.current.open = true; }, [initialOpen]);
  return <details ref={ref} className={base.item}>{children}</details>;
}

function PinFields({ item, disabled, onChange, onLookupLocation }: {
  item: ContentItem;
  disabled: boolean;
  onChange: (item: ContentItem) => void;
  onLookupLocation: Props["onLookupLocation"];
}) {
  const [results, setResults] = useState<GeocodePlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const coordinates = parseProjectCoordinates(item.fields.latitude, item.fields.longitude);
  const change = (fields: Record<string, string>) => onChange({ ...item, fields: { ...item.fields, ...fields } });
  async function lookup() {
    const query = item.fields.label?.trim() || "";
    if (query.length < 2) { setMessage("Enter a place before searching."); return; }
    setLoading(true); setMessage(""); setResults([]);
    try {
      const next = await onLookupLocation(query);
      setResults(next);
      if (!next.length) setMessage("No matching place found. Try a city and country, or enter coordinates manually.");
    } catch (cause) { setMessage((cause as Error).message); }
    finally { setLoading(false); }
  }
  return <div className={styles.fields}>
    <div className={styles.status}><strong>{coordinates ? "Pin ready" : "Coordinates needed"}</strong><span>No project page or photograph is required.</span></div>
    <div className={base.field}><label htmlFor={`globe-${item.id}-label`}>Place label <span className={base.required}>Required to publish</span></label>
      <input id={`globe-${item.id}-label`} value={item.fields.label || ""} maxLength={140} disabled={disabled} placeholder="City, region, country" onChange={event => { change({ label: event.target.value, latitude: "", longitude: "" }); setResults([]); setMessage(""); }} />
      <small className={base.help}>Changing the place clears old coordinates so a pin cannot silently point somewhere else.</small>
    </div>
    <button type="button" className={styles.lookup} disabled={disabled || loading || (item.fields.label?.trim().length || 0) < 2} onClick={() => void lookup()}>{loading ? "Looking up…" : "Find coordinates"}</button>
    {message && <p role="status" className={styles.message}>{message}</p>}
    {results.length > 0 && <div className={styles.results}><strong>Choose the matching place</strong><ul>{results.map(place => <li key={place.id}><button type="button" disabled={disabled} onClick={() => { change({ latitude: String(place.latitude), longitude: String(place.longitude) }); setResults([]); setMessage(`Coordinates set near ${place.label}. The shorter place label above remains editable; check the pin position before publishing.`); }}><span>{place.label}</span><small>{place.kind} · {place.latitude.toFixed(4)}°, {place.longitude.toFixed(4)}°</small></button></li>)}</ul></div>}
    <div className={styles.coordinates}>
      <div className={base.field}><label htmlFor={`globe-${item.id}-latitude`}>Latitude <span className={base.required}>Required to publish</span></label><input id={`globe-${item.id}-latitude`} type="number" step="any" min="-90" max="90" value={item.fields.latitude || ""} disabled={disabled} onChange={event => change({ latitude: event.target.value })} /><small className={base.help}>−90 to 90 · north is positive</small></div>
      <div className={base.field}><label htmlFor={`globe-${item.id}-longitude`}>Longitude <span className={base.required}>Required to publish</span></label><input id={`globe-${item.id}-longitude`} type="number" step="any" min="-180" max="180" value={item.fields.longitude || ""} disabled={disabled} onChange={event => change({ longitude: event.target.value })} /><small className={base.help}>−180 to 180 · east is positive</small></div>
    </div>
  </div>;
}

export default function GlobePinsEditor({ items, onChange, disabled, onLookupLocation }: Props) {
  const [newId, setNewId] = useState("");
  const [recentRemoval, setRecentRemoval] = useState<{ item: ContentItem; index: number } | null>(null);
  function add() {
    let number = 1;
    while (items.some(item => item.id === `new-pin-${number}`)) number++;
    const id = `new-pin-${number}`;
    onChange([...items, { id, fields: { label: "", latitude: "", longitude: "" } }]);
    setNewId(id);
    setRecentRemoval(null);
  }
  function move(index: number, offset: number) {
    const next = [...items];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  }
  return <div className={base.collection}>
    <div className={base.intro}><div><strong>Globe pins</strong><p>{items.length} {items.length === 1 ? "place" : "places"} on the globe. Locations stand alone; adding a pin does not create a project page.</p></div><button type="button" className={base.primary} disabled={disabled || items.length >= 100} onClick={add}><Plus size={16} aria-hidden="true" /> Add location pin</button></div>
    {recentRemoval && <div role="status" className={base.undo}><span>{recentRemoval.item.fields.label || recentRemoval.item.id} removed from this draft.</span><button type="button" onClick={() => { const next = [...items]; next.splice(Math.min(recentRemoval.index, next.length), 0, recentRemoval.item); onChange(next); setRecentRemoval(null); }}>Undo</button></div>}
    {!items.length && <p className={base.empty}>No globe locations. Add a place, look up its coordinates or enter them manually, then save and publish.</p>}
    <div className={base.items}>{items.map((item, index) => <PinDetails key={item.id} initialOpen={item.id === newId}>
      <summary><span className={base.order}>{index + 1}</span><span className={base.itemName}>{item.fields.label || "New location"}<small>{parseProjectCoordinates(item.fields.latitude, item.fields.longitude) ? `${item.fields.latitude}°, ${item.fields.longitude}°` : "Set coordinates before publishing"}</small></span><span className={base.summaryHint}>Edit</span></summary>
      <div className={base.body}>
        <PinFields item={item} disabled={disabled} onChange={updated => onChange(items.map(entry => entry.id === item.id ? updated : entry))} onLookupLocation={onLookupLocation} />
        <div className={base.actions}><button type="button" disabled={disabled || index === 0} onClick={() => move(index, -1)}><ArrowUp size={15} /> Move up</button><button type="button" disabled={disabled || index === items.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15} /> Move down</button><button type="button" className={base.remove} disabled={disabled} onClick={() => { setRecentRemoval({ item, index }); onChange(items.filter(entry => entry.id !== item.id)); if (newId === item.id) setNewId(""); }}><Trash2 size={15} /> Remove pin</button></div>
      </div>
    </PinDetails>)}</div>
    <p className={styles.attribution}>Place search © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>. Search results are approximate; enter confirmed coordinates when available.</p>
  </div>;
}
