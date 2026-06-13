// Resolve a path to a file in public/ for use at runtime (img src, etc).
//
// Vite copies public/ verbatim and does NOT rewrite runtime string paths, so a
// root-absolute "/foo.png" 404s when the app is mounted under a subpath (e.g.
// GitHub Pages /wrapped/). BASE_URL — the configured `base`, "/wrapped/" in a
// production build and "/" in dev — gives the correct mounted path in both.
// Pass paths WITHOUT a leading slash.
export const asset = (path: string) => import.meta.env.BASE_URL + path;
