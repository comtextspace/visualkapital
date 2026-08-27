<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col bg-paper text-ink">
	<header class="border-b border-ink/15 bg-paper-dark/60">
		<div class="mx-auto flex max-w-4xl items-baseline justify-between px-4 py-3 sm:px-6">
			<a href="/" class="font-serif text-lg tracking-tight hover:underline"
				>Схемы в «Капитале» К. Маркса</a
			>
			<a
				href="https://defcon.social/@pensadoj"
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm text-ink-soft hover:underline">Mastodon</a
			>
		</div>
	</header>

	<main class="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
		{@render children()}
	</main>
</div>
