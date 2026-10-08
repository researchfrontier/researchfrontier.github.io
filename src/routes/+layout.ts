// Static SPA served from GitHub Pages. We prerender the app shell (so "/" and the
// static routes get real index.html files and a 200), but render on the client
// (ssr=false) because every view reads from the API at runtime. The dynamic
// /field/[id] route opts out of prerender and is served by the 404.html fallback.
export const ssr = false;
export const prerender = true;
export const trailingSlash = 'always';
