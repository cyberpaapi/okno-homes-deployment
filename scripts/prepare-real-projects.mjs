import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
const root = process.cwd();
const sourceRoot = path.resolve(root, '../Assests/Real Projects');
const base = '/assets/projects/real-v1';
const output = path.join(root, 'public', base);
await fs.mkdir(output, { recursive: true });
const sets = [
  ['forrest','Forrest','Forrest(C)', ['DSC05321-HDR.JPG','DSC07906-HDR.JPG','DSC04979-HDR.JPG','DSC05257.JPG','DSC04913.JPG','DSC05349-HDR.JPG','DSC07645-HDR.JPG','DSC07499-HDR.JPG','DSC07939-HDR.JPG','DSC08119.JPG','DSC07572-HDR.JPG','DSC08181-HDR.JPG']],
  ['kioo','Kioo','Kioo_Photos', ['Mirror House 42.jpg','Mirror House 28.jpg','Mirror House 4.jpg','Mirror House 26.jpg','Mirror House 23.jpg','Mirror House 1.jpg','Mirror House 38.jpg','Mirror House 14.jpg','Mirror House 20.jpg','Mirror House 6.jpg']],
  ['kray-sangareddy','Kray Sangareddy','Kray Sangareddy', ['04.jpg','07.jpg','014.jpg','011.jpg','05.jpg','09.jpg','016.jpg','017.jpg']],
  ['lakewood','Lakewood Villa','Lakewood(Villa)', ['Villa 8.jpg','Villa 6.jpg','Villa 17.jpg','Villa 22.JPG','Villa 24.JPG','Villa 27.jpg','Villa 30.jpg','Villa 10.jpg','Villa 23.jpg','Villa 2.jpg']],
  ['octapod-layana','Octapod Layana','Octapod_Layana/PHOTOS', ['memedia_studio-18(1).jpg','memedia_studio-3(1).jpg','memedia_studio-4.jpg','memedia_studio-15.jpg','memedia_studio-9.jpg','memedia_studio-5(1).jpg','memedia_studio-7(1).jpg','memedia_studio-16(1).jpg','memedia_studio-12(1).jpg','memedia_studio-14(1).jpg']],
  ['rasa-vikarabad','Rasa Vikarabad','Rasa_Vikarabad', ['Okno Modhomes-54.jpg','Okno Modhomes-16.jpg','Okno Modhomes-9.jpg','Okno Modhomes-40.jpg','Okno Modhomes-49.jpg','Okno Modhomes-31.jpg','Okno Modhomes-17.jpg','Okno Modhomes-26.jpg','Okno Modhomes-46.jpg','Okno Modhomes-55.jpg']],
  ['trib-birdseye','Trib BirdsEye','Trib_BirdsEye', ['01.jpg','02.jpeg','03.jpeg']],
];
const videoSets = [
 ['forrest','forrest-film','FORREST','Cinematic Videos/FORREST – A Luxury Resort Built in 120 Days _ Okno Modhomes.mp4'],
 ['forrest','forrest-fpv','Forrest — FPV','Cinematic Videos/Forrest_FPV.MP4'],
 ['lakewood','lakewood-film','Lakewoods','Cinematic Videos/Lakewoods.mp4'],
 ...['01','02','03'].map(n=>['kray-sangareddy',`kray-${n}`,`Kray — ${n}`,`Kray Sangareddy/${n}.mp4`]),
 ...['Cabin and Rain','Okno Reel 2','Reel 3','Reel 4','Reel 5'].map((n,i)=>['octapod-layana',`layana-${i+1}`,n,`Octapod_Layana/REELS/${n}.mov`]),
];
const hash = data => createHash('sha256').update(data).digest('hex');
const captions=JSON.parse(await fs.readFile(path.join(root,'scripts/projects-photo-captions.json'),'utf8'));
const manifest=[];const projects=[];
for(const [id,title,folder,names] of sets){
 const gallery=[];
 for(const [i,name] of names.entries()){
  const source=path.join(sourceRoot,folder,name);const bytes=await fs.readFile(source);
  const filename=`${id}-${String(i+1).padStart(2,'0')}.webp`;const dest=path.join(output,filename);
  const existing=await fs.stat(dest).catch(()=>null);
  const info=existing ? {...await sharp(dest).metadata(),size:existing.size} : await sharp(bytes).rotate().resize({width:3200,height:3200,fit:'inside',withoutEnlargement:true}).webp({quality:87,effort:4}).toFile(dest);
  gallery.push({src:`${base}/${filename}`,alt:`${title} — ${captions[id][i]}`,width:info.width,height:info.height});
  manifest.push({project:id,type:'photo',source:path.relative(path.dirname(root),source),sourceSha256:hash(bytes),output:`${base}/${filename}`,width:info.width,height:info.height,bytes:info.size});
 }
 projects.push({id,title,folder,gallery,films:[]});
}
// Serial transcoding bounds CPU/memory use and never changes originals.
for(const [id,key,title,relative] of videoSets){
 const source=path.join(sourceRoot,relative);const dest=path.join(output,`${key}.mp4`);
 const probe=JSON.parse(execFileSync('ffprobe',['-v','quiet','-show_format','-show_streams','-of','json',source]));
 const stream=probe.streams.find(s=>s.codec_type==='video');const portrait=stream.height>stream.width;
 if(key === 'forrest-film') execFileSync('ffmpeg',['-v','error','-y','-i',source,'-c','copy','-movflags','+faststart',dest]);
 else if(!await fs.stat(dest).catch(()=>null)) execFileSync('ffmpeg',['-v','error','-y','-i',source,'-map','0:v:0','-map','0:a?','-vf',portrait?'scale=720:1280:force_original_aspect_ratio=decrease:force_divisible_by=2':`scale=${Math.min(stream.width,1920)}:${Math.min(stream.height,1080)}:force_original_aspect_ratio=decrease:force_divisible_by=2`,'-r','30','-c:v','libopenh264','-b:v',portrait?'1800k':'3500k','-threads','2','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',dest],{stdio:['ignore','ignore','inherit']});
 execFileSync('ffmpeg',['-v','error','-y','-ss',String(Number(probe.format.duration)*.15),'-i',source,'-frames:v','1','-vf','scale=1280:1280:force_original_aspect_ratio=decrease','-update','1',path.join(output,`${key}-poster.jpg`)]);
 const film={src:`${base}/${key}.mp4`,poster:`${base}/${key}-poster.jpg`,title,duration:Math.round(Number(probe.format.duration)),width:stream.width,height:stream.height};
 projects.find(p=>p.id===id).films.push(film);
 manifest.push({project:id,type:'video',source:path.relative(path.dirname(root),source),sourceSha256:hash(await fs.readFile(source)),output:film.src,duration:film.duration});
 console.log('Prepared',key);
}
await fs.writeFile(path.join(root,'src/data/realProjectMedia.json'),JSON.stringify(projects,null,2)+'\n');
await fs.writeFile(path.join(root,'docs/projects-media-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Prepared',manifest.length,'assets');
