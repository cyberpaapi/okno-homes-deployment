// Only the owning OKNO page can initialize this supplied viewer.
window.oknoSettings = new Promise(resolve => {
  let current = '';
  window.addEventListener('message', event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'OKNO_CONFIGURATOR_INIT') return;
    const settings = event.data.settings;
    if (!settings || !['forza', 'tengo', 'kray', 'custom'].includes(settings.profile) || typeof settings.name !== 'string' || typeof settings.url !== 'string' || !/^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.glb$/.test(settings.url) || settings.url.includes('..')) return;
    const next = JSON.stringify(settings);
    if (current && current !== next) { location.reload(); return; }
    current = next;
    document.title = settings.name + " · OKNO configurator";
    document.querySelector('.loader-brand').textContent = settings.name;
    resolve(settings);
  });
  parent.postMessage({type: 'OKNO_CONFIGURATOR_READY'}, location.origin);
});
window.addEventListener('error', () => parent.postMessage({type:'OKNO_CONFIGURATOR_ERROR'}, location.origin));
window.addEventListener('unhandledrejection', () => parent.postMessage({type:'OKNO_CONFIGURATOR_ERROR'}, location.origin));
