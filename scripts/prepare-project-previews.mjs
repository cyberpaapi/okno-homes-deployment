import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
const previews = [
  // Client-approved continuous edit: Party Lawn → Mystical Pathway → central FPV orbit.
  { id:'forrest', source:'Cinematic Videos/Forrest_FPV.MP4', start:22, length:16, width:1920, bitrate:'8M', fps:25 },
  { id:'kray-sangareddy', source:'Kray Sangareddy/02.mp4', start:0, length:10, width:1920, bitrate:'6M' },
  { id:'lakewood', source:'Cinematic Videos/Lakewoods.mp4', start:28, length:12, width:1920, bitrate:'6M' },
];
mkdirSync('public/assets/projects/previews', { recursive: true });
for (const p of previews) {
  const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(p.start),'-i',`../Assests/Real Projects/${p.source}`,'-t',String(p.length),'-an','-vf',`scale=${p.width}:-2${p.fps ? `,fps=${p.fps}` : ''}`,'-c:v','libopenh264','-profile:v','high','-coder','cabac','-rc_mode','bitrate','-b:v',p.bitrate,'-maxrate',p.bitrate,'-bufsize','16M','-qmin','10','-qmax','42','-g',p.fps ? String(p.fps * 2) : '60','-allow_skip_frames','0','-pix_fmt','yuv420p','-movflags','+faststart',`public/assets/projects/previews/${p.id}-stream-${p.fps ? 'v4' : 'v3'}.mp4`],{stdio:'inherit'});
  if(result.status!==0)throw new Error(`Preview failed: ${p.id}`);
}
writeFileSync('docs/projects-preview-clips.json',JSON.stringify(previews,null,2)+'\n');
