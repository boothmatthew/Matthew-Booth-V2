<script>
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import Portable from '$lib/components/Portable.svelte';

  let { form } = $props();

  const siteTitle = $derived(page.data.siteSettings?.siteTitle ?? 'Matthew Booth');
  const loginText = $derived(page.data.siteSettings?.loginText);
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<!-- positioned like the entry detail header's home link -->
<a href="/" class="absolute top-0 left-0 px-base py-line">{siteTitle}</a>

<section class="grid place-items-center min-h-svh px-base py-line">
  <form method="post" action="?/login" use:enhance class="flex flex-col gap-line w-full max-w-[32rem]">
    {#if loginText?.length}
      <div class="rich-text">
        <Portable value={loginText} />
      </div>
    {/if}

    <input type="hidden" name="redirect" value={page.url.searchParams.get('redirect') ?? '/private'} />

    <input
      type="password"
      name="password"
      autocomplete="current-password"
      placeholder="Password"
      aria-label="Password"
      required
      class="border px-xs py-xs"
    />

    <button type="submit" class="border px-xs py-xs cursor-pointer">Log in</button>

    {#if form?.error}
      <p class="text-accent" aria-live="polite">{form.error}</p>
    {/if}
  </form>
</section>
