<script lang="ts">
	import type { ResumeData, JobMatchResult, ATSAnalysis } from '$resume/types';
	import { analyzeJobMatch, analyzeATSCompatibility } from '$resume/ats';

	let { resume }: { resume: ResumeData } = $props();

	let jobDescription = $state('');
	let matchResult: JobMatchResult | null = $state(null);
	let atsAnalysis: ATSAnalysis | null = $state(null);
	let analyzing = $state(false);
	let error: string | null = $state(null);

	let showMatched = $state(true);
	let showMissing = $state(true);
	let showSuggestions = $state(true);
	let showATSIssues = $state(true);

	function scoreColor(score: number): string {
		if (score >= 70) return 'text-success';
		if (score >= 40) return 'text-warning';
		return 'text-error';
	}

	function scoreBg(score: number): string {
		if (score >= 70) return 'bg-success/10';
		if (score >= 40) return 'bg-warning/10';
		return 'bg-error/10';
	}

	async function analyze() {
		if (!jobDescription.trim()) return;
		analyzing = true;
		error = null;
		try {
			const plain = JSON.parse(JSON.stringify(resume));
			matchResult = await analyzeJobMatch(plain, jobDescription);
			atsAnalysis = analyzeATSCompatibility(plain);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Analysis failed.';
		} finally {
			analyzing = false;
		}
	}
</script>

<div class="space-y-5">
	<div>
		<label for="job-description" class="mb-1.5 block text-sm font-medium text-text">
			Job Description
		</label>
		<textarea
			id="job-description"
			bind:value={jobDescription}
			placeholder="Paste the job description here to check how well your resume matches..."
			rows={6}
			class="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
		></textarea>
	</div>

	<button
		type="button"
		class="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
		disabled={analyzing || !jobDescription.trim()}
		onclick={analyze}
	>
		{#if analyzing}
			Analyzing...
		{:else}
			Analyze Match
		{/if}
	</button>

	{#if error}
		<p class="text-sm text-error">{error}</p>
	{/if}

	{#if matchResult}
		<div class="space-y-4">
			<!-- Scores -->
			<div class="grid grid-cols-2 gap-3">
				<div
					class="rounded-xl border border-border p-4 text-center {scoreBg(matchResult.score)}"
				>
					<p class="text-3xl font-bold {scoreColor(matchResult.score)}">{matchResult.score}%</p>
					<p class="mt-1 text-xs text-text-muted">Job Match</p>
				</div>
				{#if atsAnalysis}
					<div
						class="rounded-xl border border-border p-4 text-center {scoreBg(atsAnalysis.score)}"
					>
						<p class="text-3xl font-bold {scoreColor(atsAnalysis.score)}">{atsAnalysis.score}%</p>
						<p class="mt-1 text-xs text-text-muted">ATS Compatibility</p>
					</div>
				{/if}
			</div>

			<!-- Matched Keywords -->
			{#if matchResult.matched.length > 0}
				<div>
					<button
						type="button"
						class="flex w-full items-center justify-between text-left"
						onclick={() => (showMatched = !showMatched)}
					>
						<span class="text-sm font-medium text-text">
							Matched Keywords ({matchResult.matched.length})
						</span>
						<svg
							class="h-4 w-4 text-text-muted transition-transform {showMatched
								? 'rotate-180'
								: ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					{#if showMatched}
						<div class="mt-2 flex flex-wrap gap-1.5">
							{#each matchResult.matched as keyword}
								<span
									class="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success"
								>
									{keyword}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Missing Keywords -->
			{#if matchResult.missing.length > 0}
				<div>
					<button
						type="button"
						class="flex w-full items-center justify-between text-left"
						onclick={() => (showMissing = !showMissing)}
					>
						<span class="text-sm font-medium text-text">
							Missing Keywords ({matchResult.missing.length})
						</span>
						<svg
							class="h-4 w-4 text-text-muted transition-transform {showMissing
								? 'rotate-180'
								: ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					{#if showMissing}
						<div class="mt-2 flex flex-wrap gap-1.5">
							{#each matchResult.missing as keyword}
								<span
									class="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning"
								>
									{keyword}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Suggestions -->
			{#if matchResult.suggestions.length > 0}
				<div>
					<button
						type="button"
						class="flex w-full items-center justify-between text-left"
						onclick={() => (showSuggestions = !showSuggestions)}
					>
						<span class="text-sm font-medium text-text">
							Suggestions ({matchResult.suggestions.length})
						</span>
						<svg
							class="h-4 w-4 text-text-muted transition-transform {showSuggestions
								? 'rotate-180'
								: ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					{#if showSuggestions}
						<ul class="mt-2 space-y-1.5">
							{#each matchResult.suggestions as suggestion}
								<li class="text-sm text-text-muted">{suggestion}</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}

			<!-- ATS Issues -->
			{#if atsAnalysis && (atsAnalysis.issues.length > 0 || atsAnalysis.suggestions.length > 0)}
				<div>
					<button
						type="button"
						class="flex w-full items-center justify-between text-left"
						onclick={() => (showATSIssues = !showATSIssues)}
					>
						<span class="text-sm font-medium text-text">
							ATS Issues ({atsAnalysis.issues.length})
						</span>
						<svg
							class="h-4 w-4 text-text-muted transition-transform {showATSIssues
								? 'rotate-180'
								: ''}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					{#if showATSIssues}
						<ul class="mt-2 space-y-1.5">
							{#each atsAnalysis.issues as issue}
								<li class="text-sm text-error">{issue}</li>
							{/each}
							{#each atsAnalysis.suggestions as suggestion}
								<li class="text-sm text-text-muted">{suggestion}</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
