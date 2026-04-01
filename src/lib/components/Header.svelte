<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$components/ThemeToggle.svelte';

	let pathname = $derived(page.url.pathname as string);
	let toolsOpen = $state(false);
	let mobileOpen = $state(false);
	let focusedIndex = $state(-1);
	let menuRef: HTMLDivElement | undefined = $state(undefined);

	const topLinks = [
		{ href: '/pdf', label: 'PDF', match: (p: string) => p.startsWith('/pdf') },
		{ href: '/qr', label: 'QR', match: (p: string) => p.startsWith('/qr') }
	];

	const toolsDropdown = [
		{ href: '/pdf', label: 'PDF Tools', desc: 'Merge, split, rotate, compress, convert' },
		{ href: '/pptx', label: 'PowerPoint Tools', desc: 'Merge, split, compress, extract, watermark' },
		{ href: '/photo', label: 'Photo & Image Tools', desc: 'Convert, compress, remove backgrounds, filters' },
		{ href: '/resume', label: 'Resume Builder', desc: 'ATS-optimized, PDF and DOCX export' },
		{ href: '/qr', label: 'QR Code Generator', desc: 'Static, dynamic, styled, batch export' },
		{ href: '/invoice', label: 'Invoice Generator', desc: 'Multi-currency, tax support, PDF export' },
		{ href: '/links', label: 'Link Shortener', desc: 'Custom aliases, click analytics, UTM builder' },
		{ href: '/bio', label: 'Link in Bio', desc: 'Your links, your page, no signup' },
		{ href: '/remove', label: 'Data Removal', desc: 'Remove your info from 25+ data brokers' },
		{ href: '/signature', label: 'Email Signatures', desc: 'HTML signatures, free templates' },
{ href: '/media', label: 'Video/Audio Tools', desc: 'Trim, compress, convert media files' },
		{ href: '/legal-gen', label: 'Policy Generator', desc: 'Privacy policy, ToS, cookie policy' }
	];

	function closeDropdown() {
		toolsOpen = false;
		focusedIndex = -1;
	}

	function focusMenuItem(index: number) {
		if (!menuRef) return;
		const items = menuRef.querySelectorAll<HTMLElement>('[role="menuitem"]');
		if (items[index]) {
			focusedIndex = index;
			items[index].focus();
		}
	}

	function handleToolsKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeDropdown();
			return;
		}
		if (!toolsOpen && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
			e.preventDefault();
			toolsOpen = true;
			// Focus first item on next tick after menu renders
			requestAnimationFrame(() => focusMenuItem(0));
			return;
		}
	}

	function handleMenuKey(e: KeyboardEvent) {
		const len = toolsDropdown.length;
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				focusMenuItem((focusedIndex + 1) % len);
				break;
			case 'ArrowUp':
				e.preventDefault();
				focusMenuItem((focusedIndex - 1 + len) % len);
				break;
			case 'Home':
				e.preventDefault();
				focusMenuItem(0);
				break;
			case 'End':
				e.preventDefault();
				focusMenuItem(len - 1);
				break;
			case 'Escape':
				closeDropdown();
				break;
			case 'Tab':
				closeDropdown();
				break;
		}
	}
</script>

<svelte:window onclick={() => { toolsOpen = false; mobileOpen = false; }} />

<header class="mx-auto w-full max-w-6xl px-4 pt-6 pb-2 sm:px-6 sm:pt-8 lg:px-8">
	<div class="flex items-center justify-between">
		<a href="/" class="flex items-center gap-2 font-display text-2xl font-700 tracking-tight text-brand">
			<svg class="h-6 w-6" viewBox="0 0 480 464" fill="currentColor" aria-hidden="true">
				<path d="M197.475296,31.443810 C209.975235,31.512640 219.486847,37.336010 227.136002,45.789631 C248.929108,69.874725 270.284515,94.355675 291.833496,118.661942 C309.068390,138.102127 326.342590,157.507462 343.580566,176.944931 C347.401855,181.253799 351.144073,185.632767 355.409790,190.539764 C357.689392,182.113663 359.530304,174.408554 361.863953,166.855667 C368.331177,145.924194 378.022491,126.815338 396.468262,113.917831 C414.531067,101.288063 434.125305,99.899918 454.233459,109.047737 C462.592987,112.850761 469.960083,121.827995 465.638672,134.091476 C461.274078,146.477615 456.637604,158.781448 452.721283,171.309250 C444.622650,197.215729 438.500336,223.532928 436.110413,250.698792 C434.471497,269.328430 434.637878,287.954834 434.287567,306.599945 C433.242493,362.223145 410.017334,405.991547 362.435760,435.277863 C328.955566,455.884796 292.505829,460.541016 254.345673,449.966095 C230.564606,443.375916 210.932007,430.065948 193.873108,412.710846 C177.534439,396.088470 161.168442,379.470734 145.416000,362.299133 C115.798347,330.013184 85.320496,298.547852 55.209881,266.732727 C49.137321,260.316376 42.716915,254.280548 38.784767,246.137222 C27.834497,223.459610 38.295204,196.188950 61.658569,186.766739 C62.397888,186.468567 63.104988,186.090515 64.724373,185.326233 C52.469391,172.912476 45.179268,158.900909 47.634445,141.286789 C50.134953,123.347443 61.076626,112.167946 77.255379,104.660622 C66.697037,79.309357 71.605072,58.429039 95.799095,44.206871 C114.223984,33.376022 131.516434,36.980019 153.333405,55.217228 C163.381393,39.080154 177.400101,29.941523 197.475296,31.443810 M270.400909,187.117798 C273.081299,190.299774 276.093750,193.262711 278.369171,196.711838 C282.418396,202.849762 280.890045,211.069214 275.294952,215.653824 C270.188416,219.838104 263.372009,219.141266 257.729584,213.757538 C255.924500,212.035217 254.274368,210.145325 252.610184,208.281342 C233.080780,186.407730 213.547012,164.537964 194.046265,142.638824 C181.642975,128.710068 169.319717,114.710022 156.909973,100.787041 C148.153168,90.962433 139.366592,81.163109 130.489197,71.447617 C124.060654,64.412148 116.026833,63.098518 108.430710,67.593407 C97.399063,74.121201 96.108559,86.162682 105.634201,96.775124 C138.572113,133.470978 171.710922,169.986954 204.554138,206.767075 C213.079849,216.314789 222.684830,224.981125 229.533813,235.967651 C233.778778,242.777054 232.654556,250.303909 226.839325,254.641754 C221.136292,258.895905 213.795776,257.937714 208.467773,252.040604 C187.929550,229.308777 167.438950,206.533905 146.936249,183.769974 C133.222336,168.543549 119.559761,153.270554 105.780037,138.103958 C102.321457,134.297287 98.774162,130.320969 93.309441,129.425964 C83.749504,127.860260 75.087158,135.402283 74.234543,145.447159 C73.521904,153.842941 78.143211,159.697144 83.154045,165.321106 C92.239388,175.518158 101.673172,185.405121 110.742348,195.616165 C135.519073,223.512436 160.396866,251.314972 185.886337,278.565125 C188.273544,281.117218 190.752914,283.648956 192.724228,286.510651 C196.998108,292.714996 195.895599,300.674988 190.410416,305.521790 C185.652222,309.726227 178.279816,309.378235 172.643494,304.470978 C170.137894,302.289490 167.838593,299.846741 165.612152,297.372711 C141.537445,270.620850 117.493835,243.840958 93.446541,217.064407 C86.351067,209.163666 74.650009,207.879395 67.577682,214.093704 C61.743580,219.220016 59.481712,232.078751 67.709778,240.514282 C88.066078,261.383850 107.685371,282.969910 127.778275,304.099335 C158.430984,336.333252 188.158020,369.484100 220.227844,400.322601 C244.578232,423.738159 274.462219,432.702759 307.634644,427.267578 C350.809204,420.193542 380.687683,395.254639 397.810303,355.191925 C406.951813,333.803101 408.221924,310.941559 408.580841,288.088379 C409.035736,259.125641 410.395325,230.316986 416.429657,201.829971 C419.644775,186.651962 423.972412,171.855621 428.751404,157.152298 C431.561462,148.506790 434.586426,139.931122 437.708618,130.754150 C432.107422,130.156540 427.171875,129.693512 422.281891,130.917664 C411.349854,133.654358 404.044983,141.108948 398.673218,150.407974 C391.468964,162.879181 386.699371,176.341522 384.274567,190.586533 C381.368378,207.659729 375.071198,222.537659 362.171509,235.190598 C337.285309,259.600800 330.531708,289.326874 340.609039,322.804993 C341.699310,326.427032 343.010803,330.121155 341.883698,334.049408 C340.244446,339.762756 335.714478,343.352173 329.394318,343.906830 C324.005493,344.379761 318.476440,340.983917 316.126770,335.174896 C309.144745,317.913544 308.010040,299.703461 310.130951,281.633179 C312.914093,257.920563 322.535370,236.842453 339.477692,219.564194 C341.645264,217.353622 341.440094,215.802521 339.562744,213.687302 C331.050568,204.096603 322.633118,194.421982 314.158905,184.797485 C291.041412,158.541962 268.044067,132.178925 244.735764,106.093796 C231.972427,91.809898 219.840393,76.933777 206.144882,63.509403 C198.615234,56.128822 188.007050,56.137238 181.063797,62.964043 C174.968536,68.957069 175.544235,79.807945 182.289139,87.316689 C188.966507,94.750237 195.617004,102.208466 202.224854,109.703857 C224.807007,135.319122 247.365189,160.955505 270.400909,187.117798z"/>
			</svg>
			nah
		</a>

		<div class="flex items-center">
			<!-- Desktop nav -->
			<nav class="hidden items-center text-[15px] sm:flex">
				{#each topLinks as link}
					<a
						href={link.href}
						class="rounded-md px-3 py-1.5 transition-colors hover:text-accent {link.match(pathname) ? 'text-accent font-medium' : 'text-text-muted'}"
					>
						{link.label}
					</a>
				{/each}

				<!-- Tools dropdown -->
				<div class="relative">
					<button
						onclick={(e: MouseEvent) => { e.stopPropagation(); toolsOpen = !toolsOpen; }}
						onkeydown={handleToolsKey}
						class="flex items-center gap-1 rounded-md px-3 py-1.5 transition-colors hover:text-accent {toolsOpen ? 'text-accent font-medium' : 'text-text-muted'}"
						aria-expanded={toolsOpen}
						aria-haspopup="true"
					>
						Tools
						<svg class="h-3.5 w-3.5 transition-transform {toolsOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					{#if toolsOpen}
						<!-- svelte-ignore a11y_interactive_supports_focus -->
						<div
							bind:this={menuRef}
							class="absolute right-0 top-full z-50 mt-3 w-72 rounded-xl border border-border bg-surface p-2 shadow-lg"
							onclick={(e: MouseEvent) => e.stopPropagation()}
							onkeydown={handleMenuKey}
							role="menu"
						>
							{#each toolsDropdown as tool, i}
								<a
									href={tool.href}
									class="block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-alt {focusedIndex === i ? 'bg-surface-alt' : ''}"
									role="menuitem"
									tabindex="-1"
									onclick={closeDropdown}
								>
									<div class="text-sm font-medium text-text">{tool.label}</div>
									<div class="text-xs text-text-muted">{tool.desc}</div>
								</a>
							{/each}
						</div>
					{/if}
				</div>

				<a
					href="/why"
					class="rounded-md px-3 py-1.5 transition-colors hover:text-accent {pathname.startsWith('/why') ? 'text-accent font-medium' : 'text-text-muted'}"
				>
					Why
				</a>

				<a
					href="https://github.com/vrennat/nah-tools"
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-md px-2.5 py-1.5 text-text-muted transition-colors hover:text-accent"
					aria-label="GitHub"
				>
					<svg class="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
					</svg>
				</a>
			</nav>

			<ThemeToggle />

			<!-- Mobile hamburger -->
			<button
				class="flex items-center p-2 sm:hidden"
				onclick={(e: MouseEvent) => { e.stopPropagation(); mobileOpen = !mobileOpen; }}
				aria-label="Menu"
				aria-expanded={mobileOpen}
			>
				<svg class="h-6 w-6 text-text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					{#if mobileOpen}
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
					{/if}
				</svg>
			</button>
		</div>
	</div>

	<!-- Mobile menu -->
	{#if mobileOpen}
		<nav class="mt-4 flex flex-col gap-1 border-t border-border pt-4 sm:hidden">
			{#each toolsDropdown as tool}
				<a href={tool.href} class="rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-alt">
					<div class="text-sm font-medium text-text">{tool.label}</div>
					<div class="text-xs text-text-muted">{tool.desc}</div>
				</a>
			{/each}
			<hr class="my-2 border-border" />
			<a href="/why" class="rounded-lg px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-alt">Why</a>
			<a href="https://github.com/vrennat/nah-tools" target="_blank" rel="noopener noreferrer" class="rounded-lg px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-alt">GitHub</a>
		</nav>
	{/if}
</header>
