"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Plus, Trash2, UploadCloud } from "lucide-react";
import type { ContentItem } from "@/lib/contentCollections";
import { parseSignatureFeatures, parseSignatureGallery } from "@/lib/signatureCollections";
import styles from "./SignatureModelPanel.module.css";

type Props = {
  model: ContentItem;
  plans: ContentItem[];
  builtIn: boolean;
  disabled: boolean;
  onModelChange: (model: ContentItem) => void;
  onModelIdChange: (id: string) => boolean;
  onRemoveModel: () => void;
  onMoveModel: (direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onPlansChange: (plans: ContentItem[]) => void;
  onUpload: (file: File, rotation?: boolean) => Promise<{ url: string; detailUrl?: string; posterUrl?: string }>;
};

// Uses the documented 21st.dev accordion, field and button adaptations already
// used throughout the Content Studio; the nesting follows the public model order.
export default function SignatureModelPanel({ model, plans, builtIn, disabled, onModelChange, onModelIdChange, onRemoveModel, onMoveModel, canMoveUp, canMoveDown, onPlansChange, onUpload }: Props) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState("");
  const [draftId, setDraftId] = useState(model.id);
  const features = parseSignatureFeatures(model.fields.features);
  const gallery = parseSignatureGallery(model.fields.gallery);
  const setField = (key: string, value: string) => onModelChange({ ...model, fields: { ...model.fields, [key]: value } });
  const setFeatures = (next: typeof features) => setField("features", JSON.stringify(next));
  const setGallery = (next: typeof gallery) => setField("gallery", JSON.stringify(next));
  const previewable = (value?: string) => Boolean(value?.startsWith("/") && !value.startsWith("//"));
  const updatePlan = (id: string, key: string, value: string) => onPlansChange(plans.map(plan => plan.id === id ? { ...plan, fields: { ...plan.fields, [key]: value } } : plan));
  const addPlan = () => {
    let number = plans.length + 1;
    while (plans.some(plan => plan.id === `${model.id}-plan-${number}`)) number++;
    onPlansChange([...plans, { id: `${model.id}-plan-${number}`, fields: { modelId: model.id, name: "New plan", area: "Area on request", price: "Price on request", spaces: "Spaces on request" } }]);
  };
  const upload = async (key: string, file?: File, rotation = false, galleryIndex = -1) => {
    if (!file) return;
    const isVideo = rotation || key === "detailFilm";
    if (!(isVideo ? ["video/mp4", "video/webm"].includes(file.type) : ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"].includes(file.type))) { setError("Choose a supported image, MP4 or WebM file."); return; }
    setError(""); setUploading(galleryIndex < 0 ? key : `gallery-${galleryIndex}`);
    try {
      const result = await onUpload(file, rotation);
      if (galleryIndex >= 0) setGallery(gallery.map((item, index) => index === galleryIndex ? { ...item, image: result.url } : item));
      else onModelChange({ ...model, fields: { ...model.fields, [key]: result.url,
        ...(rotation && result.detailUrl ? { detailFilm: result.detailUrl } : {}),
        ...(rotation && result.posterUrl ? { poster: result.posterUrl } : {}),
      } });
    } catch (cause) { setError((cause as Error).message); }
    finally { setUploading(""); }
  };
  return <div className={styles.root}>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <p className={styles.note}>{builtIn ? "This model keeps its existing story, rotation and preview editors below. Remove hides it from the published Signature roster without deleting its media." : "New model · use one rotation film and its prepared detail/poster outputs. Its Explore action leads to Enquiry until a configurator is built."}</p>
    <div className={styles.row}><button type="button" disabled={disabled || !canMoveUp} onClick={() => onMoveModel(-1)}><ArrowUp size={14}/> Move up</button><button type="button" disabled={disabled || !canMoveDown} onClick={() => onMoveModel(1)}><ArrowDown size={14}/> Move down</button><button type="button" disabled={disabled} className={styles.remove} onClick={onRemoveModel}><Trash2 size={14} /> Remove {model.fields.name || model.id} from Signature</button></div>
    {!builtIn && <>
      <details className={styles.inner}><summary>Opening, rotation and Explore</summary><div className={styles.body}>
        <label>Stable model ID<input value={draftId} disabled={disabled} maxLength={80} onChange={event => setDraftId(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-"))} onBlur={() => { if (!draftId || !onModelIdChange(draftId)) { setDraftId(model.id); setError("Choose a unique, nonempty model ID."); } else setError(""); }} onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }} /><small>Used in the enquiry link. Choose it before publishing; changing it later may break saved links.</small></label>
        {([['name','Model name'],['posterAlt','Poster description'],['exploreAction','Explore button text']] as const).map(([key,label]) => <label key={key}>{label}<input value={model.fields[key] || ""} disabled={disabled} onChange={event => setField(key,event.target.value)} /></label>)}
        {([['orbitFilm','Rotation master video',true],['detailFilm','Explore detail video',false],['poster','Opening poster',false]] as const).map(([key,label,rotation]) => <label key={key}>{label}<input value={model.fields[key] || ""} disabled={disabled} onChange={event => setField(key,event.target.value)} />{previewable(model.fields[key]) && (key === 'poster' ? <Image className={styles.preview} src={model.fields[key]} alt="Opening poster preview" width={260} height={145} unoptimized /> : <video className={styles.preview} src={model.fields[key]} controls muted preload="none" aria-label={`${label} preview`} />)}<span className={styles.upload}><UploadCloud size={14}/>{uploading === key ? 'Uploading…' : 'Replace media'}<input type="file" accept={key === 'poster' ? 'image/jpeg,image/png,image/webp,image/avif,image/gif' : 'video/mp4,video/webm'} disabled={disabled || Boolean(uploading)} onChange={event => { void upload(key,event.target.files?.[0],rotation); event.target.value=''; }} /></span></label>)}
      </div></details>
      <details className={styles.inner}><summary>Story cards</summary><div className={styles.body}>
        {[0,1,2].map(index => <div className={styles.subcard} key={index}><strong>Card {index+1}</strong><label>Heading<input value={features[index]?.title || ""} disabled={disabled} onChange={event => setFeatures([0,1,2].map(position => position === index ? { title:event.target.value, copy:features[position]?.copy || "" } : features[position] || { title:"", copy:"" }))} /></label><label>Description<textarea rows={3} value={features[index]?.copy || ""} disabled={disabled} onChange={event => setFeatures([0,1,2].map(position => position === index ? { title:features[position]?.title || "", copy:event.target.value } : features[position] || { title:"", copy:"" }))} /></label></div>)}
      </div></details>
      <details className={styles.inner}><summary>Explore preview images · {gallery.length}</summary><div className={styles.body}>
        {gallery.map((image,index) => <div className={styles.subcard} key={image.id}><div className={styles.row}><strong>Image {index+1}</strong><button type="button" disabled={disabled} onClick={() => setGallery(gallery.filter((_,position) => position !== index))}><Trash2 size={14}/> Remove</button></div>
          {([['label','Image button text'],['image','Image path'],['alt','Image description']] as const).map(([key,label]) => <label key={key}>{label}<input value={image[key]} disabled={disabled} onChange={event => setGallery(gallery.map((item,position) => position === index ? { ...item, [key]:event.target.value } : item))} /></label>)}
          {previewable(image.image) && <Image className={styles.preview} src={image.image} alt={image.alt || 'Preview image'} width={260} height={145} unoptimized />}
          <span className={styles.upload}><UploadCloud size={14}/>{uploading === `gallery-${index}` ? 'Uploading…' : 'Replace image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" disabled={disabled || Boolean(uploading)} onChange={event => { void upload('image',event.target.files?.[0],false,index); event.target.value=''; }} /></span>
        </div>)}
        <button type="button" disabled={disabled || gallery.length >= 50} onClick={() => setGallery([...gallery,{ id:`${model.id}-image-${Date.now()}`,label:'New view',image:model.fields.poster || '',alt:`${model.fields.name} view` }])}><Plus size={14}/> Add preview image</button>
      </div></details>
    </>}
    <details className={styles.inner}><summary>Plans, areas and prices · {plans.length}</summary><div className={styles.body}>
      {plans.map((plan,index) => <details className={styles.plan} key={plan.id}><summary>{plan.fields.name || `Plan ${index+1}`}</summary><div className={styles.body}>
        {([['name','Plan name'],['area','Internal area'],['price','Starting price'],['spaces','Spaces and features']] as const).map(([key,label]) => <label key={key}>{label}<input value={plan.fields[key] || ""} disabled={disabled} onChange={event => updatePlan(plan.id,key,event.target.value)} /></label>)}
        <div className={styles.row}><button type="button" disabled={disabled || index === 0} onClick={() => { const next=[...plans]; [next[index-1],next[index]]=[next[index],next[index-1]]; onPlansChange(next); }}><ArrowUp size={14}/> Up</button><button type="button" disabled={disabled || index === plans.length-1} onClick={() => { const next=[...plans]; [next[index+1],next[index]]=[next[index],next[index+1]]; onPlansChange(next); }}><ArrowDown size={14}/> Down</button><button type="button" disabled={disabled || plans.length === 1} onClick={() => onPlansChange(plans.filter(item => item.id !== plan.id))}><Trash2 size={14}/> Remove plan</button></div>
      </div></details>)}
      <button type="button" disabled={disabled || plans.length >= 20} onClick={addPlan}><Plus size={14}/> Add plan to {model.fields.name || model.id}</button>
    </div></details>
  </div>;
}
