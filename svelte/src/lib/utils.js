export function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// External = an http(s) URL on a different origin than the current page.
// Relative paths, same-origin absolute URLs, mailto: and tel: stay in-tab.
export function isExternal(href, origin) {
  try {
    const url = new URL(href, origin);
    return /^https?:$/.test(url.protocol) && url.origin !== origin;
  } catch {
    return false;
  }
}

// target/rel attributes for a link — new tab when external.
export function linkAttrs(href, origin) {
  return isExternal(href, origin)
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};
}
