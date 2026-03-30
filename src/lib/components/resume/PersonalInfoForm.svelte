<script lang="ts">
	import type { PersonalInfo } from '$resume/types';

	let { personal = $bindable<PersonalInfo>() }: { personal: PersonalInfo } = $props();
</script>

<div class="space-y-4">
	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="fullName" class="block text-sm font-medium text-text">Full Name</label>
			<input
				id="fullName"
				type="text"
				autocomplete="name"
				bind:value={personal.fullName}
				placeholder="Jane Smith"
				class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
		</div>

		<div>
			<label for="email" class="block text-sm font-medium text-text">Email</label>
			<input
				id="email"
				type="email"
				autocomplete="email"
				bind:value={personal.email}
				placeholder="jane@example.com"
				class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
		</div>

		<div>
			<label for="phone" class="block text-sm font-medium text-text">Phone</label>
			<input
				id="phone"
				type="tel"
				autocomplete="tel"
				bind:value={personal.phone}
				placeholder="(555) 123-4567"
				class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
		</div>

		<div>
			<label for="location" class="block text-sm font-medium text-text">Location</label>
			<input
				id="location"
				type="text"
				bind:value={personal.location}
				placeholder="San Francisco, CA"
				class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
		</div>

		<div>
			<label for="linkedin" class="block text-sm font-medium text-text">LinkedIn</label>
			<input
				id="linkedin"
				type="url"
				autocomplete="url"
				bind:value={personal.linkedin}
				placeholder="https://linkedin.com/in/janesmith"
				class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
		</div>

		<div>
			<label for="website" class="block text-sm font-medium text-text">Website</label>
			<input
				id="website"
				type="url"
				autocomplete="url"
				bind:value={personal.website}
				placeholder="https://janesmith.dev"
				class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
		</div>
	</div>
</div>
