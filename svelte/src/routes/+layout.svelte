<script>
	import '../styles/index.css';
	import NProgress from 'nprogress';
	import 'nprogress/nprogress.css';
	import { page } from '$app/state';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';

	import MainNav from '$lib/components/MainNav.svelte';
	import { entryOgImageUrl } from '$lib/og.js';

	// props
	let { children, data } = $props();

	// Single source of truth for the document title. Pages contribute a title
	// via their load data (entry for index details, page for static pages);
	// rendering <title> only here means it always resets when they unmount.
	const siteTitle = $derived(data.siteSettings?.siteTitle ?? 'Matthew Booth');
	const pageTitle = $derived(page.data.entry?.title ?? page.data.page?.title ?? null);
	const documentTitle = $derived(pageTitle ? `${pageTitle} — ${siteTitle}` : siteTitle);

	// Same single-source pattern for share meta: entry pages share their list
	// thumbnail, everything else falls back to the site-wide OG image.
	const metaDescription = $derived(data.siteSettings?.metaDescription ?? null);
	const ogImage = $derived(
		entryOgImageUrl(page.data.entry) ?? data.siteSettings?.ogImage?.asset?.url ?? null
	);

	// Vars
	let loadingTimeout;

	// configure nprogress
	NProgress.configure({ showSpinner: false });

	// handle navigation
	beforeNavigate(() => {
		loadingTimeout = setTimeout(() => NProgress.start(), 500);
	});

	afterNavigate(() => {
		clearTimeout(loadingTimeout);
		NProgress.done();
	});

	onMount(() => {
		console.log('%c \nDev by Cold Rice LLC \n \ncold-rice.info \n \n', 'color: grey')
	});
</script>

<svelte:head>
	<title>{documentTitle}</title>
	<meta property="og:site_name" content={siteTitle} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:title" content={documentTitle} />
	{#if metaDescription}
		<meta name="description" content={metaDescription} />
		<meta property="og:description" content={metaDescription} />
	{/if}
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
		<meta name="twitter:card" content="summary_large_image" />
	{/if}
</svelte:head>

<!-- the login page stands alone, without the site chrome -->
{#if page.route.id !== '/login'}
	<MainNav />
{/if}

<main>
	{@render children()}
</main>
