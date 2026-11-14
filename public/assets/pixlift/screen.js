// Variant C, risky, «Настоящий снимок экрана»: the button is ⌥⌘9 itself. The browser asks which screen to share (its own
// window, every time), takes one frame of it at the screen's own size, stops sharing at once, and the PNG goes to the
// clipboard and onto the «Desktop» row, named as the app names it. Risk: iPhone and iPad have no screen sharing in
// the browser, so there the button stays dim and does nothing, against the rule «the same on an iPhone and a Mac».
'use strict';
(() => {
  const btn = document.getElementById('px-btn'), desk = document.getElementById('px-desk');
  if (!navigator.mediaDevices?.getDisplayMedia) { btn.disabled = true; return; }
  async function grab() {
    const st = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'monitor' }, audio: false, selfBrowserSurface: 'include', monitorTypeSurfaces: 'include' });
    try {
      const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.srcObject = st; await v.play();
      await new Promise((ok) => (v.requestVideoFrameCallback ? v.requestVideoFrameCallback(() => ok()) : setTimeout(ok, 120)));
      const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0);
      return await new Promise((ok) => c.toBlob(ok, 'image/png'));
    } finally { st.getTracks().forEach((t) => t.stop()); }
  }
  btn.addEventListener('click', () => {
    const name = PX.name(), blob = grab();
    PX.copy(blob);                                   // the item is made inside the click (Safari); it fills when the frame is in
    blob.then((b) => PX.land(desk, b, name)).catch(() => PX.taken.delete(name));
  });
})();
