<script lang="ts">
	import type { UserInfo } from '$remove/types';

	let { userInfo = $bindable() }: { userInfo: UserInfo } = $props();

	let showExtra = $state(false);

	const states = [
		'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
		'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
		'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
		'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
		'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
	];

	const inputClass = 'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';
</script>

<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
	<h2 class="mb-1 text-lg font-semibold text-text">Your information</h2>
	<p class="mb-4 text-sm text-text-muted">
		This stays in your browser. We never see it.
	</p>

	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="first-name" class="mb-1 block text-sm font-medium text-text">First name</label>
			<input id="first-name" type="text" autocomplete="given-name" bind:value={userInfo.firstName} placeholder="Jane" class={inputClass} />
		</div>
		<div>
			<label for="last-name" class="mb-1 block text-sm font-medium text-text">Last name</label>
			<input id="last-name" type="text" autocomplete="family-name" bind:value={userInfo.lastName} placeholder="Doe" class={inputClass} />
		</div>
		<div>
			<label for="email" class="mb-1 block text-sm font-medium text-text">Email</label>
			<input id="email" type="email" autocomplete="email" bind:value={userInfo.email} placeholder="jane@example.com" class={inputClass} />
		</div>
		<div>
			<label for="state" class="mb-1 block text-sm font-medium text-text">State</label>
			<select id="state" autocomplete="address-level1" bind:value={userInfo.state} class={inputClass}>
				<option value="">Select state</option>
				{#each states as s}
					<option value={s}>{s}</option>
				{/each}
				<option value="outside-us">Outside the US</option>
			</select>
		</div>
	</div>

	<details class="group mt-4" bind:open={showExtra}>
		<summary class="cursor-pointer text-sm font-medium text-text-muted transition-colors hover:text-text">
			Additional information (optional)
		</summary>
		<div class="mt-3 grid gap-4 sm:grid-cols-2">
			<div class="sm:col-span-2">
				<label for="address" class="mb-1 block text-sm font-medium text-text">Street address</label>
				<input id="address" type="text" autocomplete="street-address" bind:value={userInfo.address} placeholder="123 Main St" class={inputClass} />
			</div>
			<div>
				<label for="city" class="mb-1 block text-sm font-medium text-text">City</label>
				<input id="city" type="text" autocomplete="address-level2" bind:value={userInfo.city} placeholder="San Francisco" class={inputClass} />
			</div>
			<div>
				<label for="zip" class="mb-1 block text-sm font-medium text-text">ZIP code</label>
				<input id="zip" type="text" autocomplete="postal-code" bind:value={userInfo.zip} placeholder="94102" class={inputClass} />
			</div>
			<div>
				<label for="phone" class="mb-1 block text-sm font-medium text-text">Phone</label>
				<input id="phone" type="tel" autocomplete="tel" bind:value={userInfo.phone} placeholder="(555) 123-4567" class={inputClass} />
			</div>
		</div>
	</details>
</div>
