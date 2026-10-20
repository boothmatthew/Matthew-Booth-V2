import { browser } from '$app/environment';

// Filter context (scope + filter + view) for the index, mirrored to
// sessionStorage so a hard reload of a detail page still knows which filtered
// list it belongs to. Scope is the index path ('/' or '/private'), since each
// index has its own filters (categories vs collections).
// Entry links themselves stay param-free (/index/[slug]) so the browser's
// :visited matching is consistent across every filtered view of the index.

const KEY = 'index-context';

function initial() {
  if (browser) {
    try {
      const stored = JSON.parse(sessionStorage.getItem(KEY));
      if (stored && typeof stored === 'object') {
        return { scope: stored.scope ?? null, filter: stored.filter ?? null, view: stored.view ?? null };
      }
    } catch {
      // malformed storage — fall through to defaults
    }
  }
  return { scope: null, filter: null, view: null };
}

export const indexContext = $state(initial());

export function setIndexContext(scope, filter, view) {
  indexContext.scope = scope;
  indexContext.filter = filter;
  indexContext.view = view;
  if (browser) {
    sessionStorage.setItem(KEY, JSON.stringify({ scope, filter, view }));
  }
}
