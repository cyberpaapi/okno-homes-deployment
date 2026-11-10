// Short, silent derivatives of the corresponding client-supplied landscape films.
// Regenerate with scripts/prepare-project-previews.mjs. Portrait films remain full-frame in the player.
export const projectPreviewClips: Record<string, string> = {
  forrest: '/assets/projects/previews/forrest-stream-v4.mp4',
  'kray-sangareddy': '/assets/projects/previews/kray-sangareddy-stream-v3.mp4',
  lakewood: '/assets/projects/previews/lakewood-stream-v3.mp4',
};

// Portrait-screen versions keyed by the landscape clip they replace. The Forrest edit has
// burned-in place captions at the lower left, which a portrait crop of the landscape
// file cut in half ("…NS"). Its portrait version is a 608×1080 crop taken from x=998,
// right of the captions (ffmpeg crop=608:1080:998:0, libx264 CRF 21, 25 fps, no audio).
export const portraitPreviewClips: Record<string, string> = {
  '/assets/projects/previews/forrest-stream-v4.mp4': '/assets/projects/previews/forrest-stream-v4-portrait.mp4',
};
