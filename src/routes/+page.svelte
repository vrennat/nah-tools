<svelte:head>
	<title>nah — Free tools. No catch.</title>
	<meta name="description" content="QR codes, PDFs, PowerPoint, links, resumes, invoices — all free, private, and open source. No signup, no tracking, most tools run in your browser." />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nah.tools" />
	<meta property="og:title" content="nah — Free tools. No catch." />
	<meta property="og:description" content="QR codes, PDFs, PowerPoint, links, resumes, invoices — all free, private, and open source. No signup, no tracking, most tools run in your browser." />
	<meta property="og:image" content="https://nah.tools/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="nah — Free tools. No catch." />
	<meta name="twitter:description" content="QR codes, PDFs, PowerPoint, links, resumes, invoices — all free, private, and open source. No signup, no tracking, most tools run in your browser." />
	<meta name="twitter:image" content="https://nah.tools/og.png" />
</svelte:head>

<div class="relative">
	<!-- Hero -->
	<section class="relative overflow-hidden pt-4 pb-4 sm:pt-12 sm:pb-10">
		<!-- Brand watermark -->
		<svg
			class="pointer-events-none absolute right-0 top-1/2 hidden h-[28vh] w-auto -translate-y-1/2 select-none opacity-[0.04] dark:opacity-[0.06] md:block lg:h-[32vh]"
			viewBox="0 0 480 464"
			fill="currentColor"
			aria-hidden="true"
		>
			<path d="M197.475296,31.443810 C209.975235,31.512640 219.486847,37.336010 227.136002,45.789631 C248.929108,69.874725 270.284515,94.355675 291.833496,118.661942 C309.068390,138.102127 326.342590,157.507462 343.580566,176.944931 C347.401855,181.253799 351.144073,185.632767 355.409790,190.539764 C357.689392,182.113663 359.530304,174.408554 361.863953,166.855667 C368.331177,145.924194 378.022491,126.815338 396.468262,113.917831 C414.531067,101.288063 434.125305,99.899918 454.233459,109.047737 C462.592987,112.850761 469.960083,121.827995 465.638672,134.091476 C461.274078,146.477615 456.637604,158.781448 452.721283,171.309250 C444.622650,197.215729 438.500336,223.532928 436.110413,250.698792 C434.471497,269.328430 434.637878,287.954834 434.287567,306.599945 C433.242493,362.223145 410.017334,405.991547 362.435760,435.277863 C328.955566,455.884796 292.505829,460.541016 254.345673,449.966095 C230.564606,443.375916 210.932007,430.065948 193.873108,412.710846 C177.534439,396.088470 161.168442,379.470734 145.416000,362.299133 C115.798347,330.013184 85.320496,298.547852 55.209881,266.732727 C49.137321,260.316376 42.716915,254.280548 38.784767,246.137222 C27.834497,223.459610 38.295204,196.188950 61.658569,186.766739 C62.397888,186.468567 63.104988,186.090515 64.724373,185.326233 C52.469391,172.912476 45.179268,158.900909 47.634445,141.286789 C50.134953,123.347443 61.076626,112.167946 77.255379,104.660622 C66.697037,79.309357 71.605072,58.429039 95.799095,44.206871 C114.223984,33.376022 131.516434,36.980019 153.333405,55.217228 C163.381393,39.080154 177.400101,29.941523 197.475296,31.443810 M270.400909,187.117798 C273.081299,190.299774 276.093750,193.262711 278.369171,196.711838 C282.418396,202.849762 280.890045,211.069214 275.294952,215.653824 C270.188416,219.838104 263.372009,219.141266 257.729584,213.757538 C255.924500,212.035217 254.274368,210.145325 252.610184,208.281342 C233.080780,186.407730 213.547012,164.537964 194.046265,142.638824 C181.642975,128.710068 169.319717,114.710022 156.909973,100.787041 C148.153168,90.962433 139.366592,81.163109 130.489197,71.447617 C124.060654,64.412148 116.026833,63.098518 108.430710,67.593407 C97.399063,74.121201 96.108559,86.162682 105.634201,96.775124 C138.572113,133.470978 171.710922,169.986954 204.554138,206.767075 C213.079849,216.314789 222.684830,224.981125 229.533813,235.967651 C233.778778,242.777054 232.654556,250.303909 226.839325,254.641754 C221.136292,258.895905 213.795776,257.937714 208.467773,252.040604 C187.929550,229.308777 167.438950,206.533905 146.936249,183.769974 C133.222336,168.543549 119.559761,153.270554 105.780037,138.103958 C102.321457,134.297287 98.774162,130.320969 93.309441,129.425964 C83.749504,127.860260 75.087158,135.402283 74.234543,145.447159 C73.521904,153.842941 78.143211,159.697144 83.154045,165.321106 C92.239388,175.518158 101.673172,185.405121 110.742348,195.616165 C135.519073,223.512436 160.396866,251.314972 185.886337,278.565125 C188.273544,281.117218 190.752914,283.648956 192.724228,286.510651 C196.998108,292.714996 195.895599,300.674988 190.410416,305.521790 C185.652222,309.726227 178.279816,309.378235 172.643494,304.470978 C170.137894,302.289490 167.838593,299.846741 165.612152,297.372711 C141.537445,270.620850 117.493835,243.840958 93.446541,217.064407 C86.351067,209.163666 74.650009,207.879395 67.577682,214.093704 C61.743580,219.220016 59.481712,232.078751 67.709778,240.514282 C88.066078,261.383850 107.685371,282.969910 127.778275,304.099335 C158.430984,336.333252 188.158020,369.484100 220.227844,400.322601 C244.578232,423.738159 274.462219,432.702759 307.634644,427.267578 C350.809204,420.193542 380.687683,395.254639 397.810303,355.191925 C406.951813,333.803101 408.221924,310.941559 408.580841,288.088379 C409.035736,259.125641 410.395325,230.316986 416.429657,201.829971 C419.644775,186.651962 423.972412,171.855621 428.751404,157.152298 C431.561462,148.506790 434.586426,139.931122 437.708618,130.754150 C432.107422,130.156540 427.171875,129.693512 422.281891,130.917664 C411.349854,133.654358 404.044983,141.108948 398.673218,150.407974 C391.468964,162.879181 386.699371,176.341522 384.274567,190.586533 C381.368378,207.659729 375.071198,222.537659 362.171509,235.190598 C337.285309,259.600800 330.531708,289.326874 340.609039,322.804993 C341.699310,326.427032 343.010803,330.121155 341.883698,334.049408 C340.244446,339.762756 335.714478,343.352173 329.394318,343.906830 C324.005493,344.379761 318.476440,340.983917 316.126770,335.174896 C309.144745,317.913544 308.010040,299.703461 310.130951,281.633179 C312.914093,257.920563 322.535370,236.842453 339.477692,219.564194 C341.645264,217.353622 341.440094,215.802521 339.562744,213.687302 C331.050568,204.096603 322.633118,194.421982 314.158905,184.797485 C291.041412,158.541962 268.044067,132.178925 244.735764,106.093796 C231.972427,91.809898 219.840393,76.933777 206.144882,63.509403 C198.615234,56.128822 188.007050,56.137238 181.063797,62.964043 C174.968536,68.957069 175.544235,79.807945 182.289139,87.316689 C188.966507,94.750237 195.617004,102.208466 202.224854,109.703857 C224.807007,135.319122 247.365189,160.955505 270.400909,187.117798z"/>
		</svg>

		<p class="animate-fade-up font-mono text-[clamp(0.5rem,1.2vw,1rem)] tracking-widest text-text-muted uppercase">
			Open source &middot; No accounts &middot; No tracking
		</p>

		<h1
			class="animate-fade-up mt-5 font-display text-[clamp(1.75rem,8vw,8rem)] leading-[0.9] font-800 tracking-tight"
			style="animation-delay: 80ms;"
		>
			Free tools.<br />
			<span class="text-accent">No catch.</span>
		</h1>

		<p
			class="animate-fade-up mt-6 text-[clamp(0.8rem,1.8vw,1.375rem)] text-text-muted sm:mt-8"
			style="animation-delay: 160ms;"
		>
			Everything is free. Forever. <a href="/trust" class="text-text underline decoration-border underline-offset-4 hover:decoration-accent">Here's&nbsp;how.</a>
		</p>
	</section>

	<!-- Featured tools -->
	<section class="grid gap-5 sm:grid-cols-3 mt-2">
		<a
			href="/pdf"
			class="animate-fade-up group rounded-2xl border border-border bg-surface-alt p-5 transition-all duration-200 hover:border-accent/50 hover:shadow-card-hover sm:p-7"
			style="animation-delay: 200ms;"
		>
			<h2 class="font-display text-2xl font-700 tracking-tight text-text transition-colors duration-200 group-hover:text-accent">PDF Tools</h2>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">
				Merge, split, rotate, compress, convert. Files never leave your device.
			</p>
			<span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
				Get started
				<svg class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</span>
		</a>

		<a
			href="/qr"
			class="animate-fade-up group rounded-2xl border border-border bg-surface-alt p-5 transition-all duration-200 hover:border-accent/50 hover:shadow-card-hover sm:p-7"
			style="animation-delay: 260ms;"
		>
			<h2 class="font-display text-2xl font-700 tracking-tight text-text transition-colors duration-200 group-hover:text-accent">QR Codes</h2>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">
				URL, WiFi, vCard, batch export, dynamic codes. No expiration. No paywall.
			</p>
			<span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
				Get started
				<svg class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</span>
		</a>

		<a
			href="/photo"
			class="animate-fade-up group rounded-2xl border border-border bg-surface-alt p-5 transition-all duration-200 hover:border-accent/50 hover:shadow-card-hover sm:p-7"
			style="animation-delay: 320ms;"
		>
			<h2 class="font-display text-2xl font-700 tracking-tight text-text transition-colors duration-200 group-hover:text-accent">Photo & Image Tools</h2>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">
				Convert, compress, remove backgrounds, adjust colors. All in your browser.
			</p>
			<span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
				Get started
				<svg class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</span>
		</a>
	</section>

	<!-- More tools -->
	<section class="animate-fade-up mt-10" style="animation-delay: 380ms;">
		<p class="mb-4 font-mono text-[clamp(0.5rem,1vw,0.75rem)] tracking-widest text-text-muted uppercase">More tools</p>

		<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
			<a href="/resume" class="group rounded-xl border border-border p-4 transition-colors duration-200 hover:border-accent/50 hover:bg-surface-alt">
				<h3 class="font-display text-base font-700 text-text transition-colors duration-200 group-hover:text-accent">Resume Builder</h3>
				<p class="mt-1 text-sm leading-relaxed text-text-muted">ATS-optimized, PDF and DOCX export.</p>
			</a>

			<a href="/invoice" class="group rounded-xl border border-border p-4 transition-colors duration-200 hover:border-accent/50 hover:bg-surface-alt">
				<h3 class="font-display text-base font-700 text-text transition-colors duration-200 group-hover:text-accent">Invoice Generator</h3>
				<p class="mt-1 text-sm leading-relaxed text-text-muted">Multi-currency, tax support, PDF export.</p>
			</a>

			<a href="/links" class="group rounded-xl border border-border p-4 transition-colors duration-200 hover:border-accent/50 hover:bg-surface-alt">
				<h3 class="font-display text-base font-700 text-text transition-colors duration-200 group-hover:text-accent">Link Shortener</h3>
				<p class="mt-1 text-sm leading-relaxed text-text-muted">Custom aliases, click analytics, UTM builder.</p>
			</a>

			<a href="/bio" class="group rounded-xl border border-border p-4 transition-colors duration-200 hover:border-accent/50 hover:bg-surface-alt">
				<h3 class="font-display text-base font-700 text-text transition-colors duration-200 group-hover:text-accent">Link in Bio</h3>
				<p class="mt-1 text-sm leading-relaxed text-text-muted">Your links, your page, no signup.</p>
			</a>

			<a href="/pptx" class="group rounded-xl border border-border p-4 transition-colors duration-200 hover:border-accent/50 hover:bg-surface-alt">
				<h3 class="font-display text-base font-700 text-text transition-colors duration-200 group-hover:text-accent">PowerPoint Tools</h3>
				<p class="mt-1 text-sm leading-relaxed text-text-muted">Merge, split, compress, extract, watermark.</p>
			</a>

			<a href="/remove" class="group rounded-xl border border-border p-4 transition-colors duration-200 hover:border-accent/50 hover:bg-surface-alt">
				<h3 class="font-display text-base font-700 text-text transition-colors duration-200 group-hover:text-accent">Data Removal</h3>
				<p class="mt-1 text-sm leading-relaxed text-text-muted">Remove your info from 25+ data brokers.</p>
			</a>

			<a href="/signature" class="group rounded-xl border border-border p-4 transition-colors duration-200 hover:border-accent/50 hover:bg-surface-alt">
				<h3 class="font-display text-base font-700 text-text transition-colors duration-200 group-hover:text-accent">Email Signatures</h3>
				<p class="mt-1 text-sm leading-relaxed text-text-muted">HTML signatures, free templates.</p>
			</a>

			<a href="/media" class="group rounded-xl border border-border p-4 transition-colors duration-200 hover:border-accent/50 hover:bg-surface-alt">
				<h3 class="font-display text-base font-700 text-text transition-colors duration-200 group-hover:text-accent">Video/Audio Tools</h3>
				<p class="mt-1 text-sm leading-relaxed text-text-muted">Trim, compress, convert media files.</p>
			</a>

			<a href="/legal-gen" class="group rounded-xl border border-border p-4 transition-colors duration-200 hover:border-accent/50 hover:bg-surface-alt">
				<h3 class="font-display text-base font-700 text-text transition-colors duration-200 group-hover:text-accent">Policy Generator</h3>
				<p class="mt-1 text-sm leading-relaxed text-text-muted">Privacy policy, ToS, cookie policy.</p>
			</a>
		</div>
	</section>
</div>
