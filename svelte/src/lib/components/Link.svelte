<script>
	// Portable-text link mark: external links open in a new tab.
	import { page } from '$app/state';
	import { linkAttrs } from '$lib/utils.js';

	let { portableText, children } = $props();

	const href = $derived(portableText.value?.href);
</script>

{#if href}
	<a {href} {...linkAttrs(href, page.url.origin)}>{@render children?.()}</a>
{:else}
	{@render children?.()}
{/if}
