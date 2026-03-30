<script lang="ts">
	import { encodeWiFi } from '$qr/encoder';
	import type { WiFiData } from '$qr/types';

	let { value = $bindable('') } = $props();

	let ssid = $state('');
	let password = $state('');
	let encryption = $state<WiFiData['encryption']>('WPA');
	let hidden = $state(false);

	$effect(() => {
		value = encodeWiFi({ ssid, password, encryption, hidden });
	});
</script>

<div class="space-y-4">
	<div>
		<label for="ssid" class="mb-1 block text-sm font-medium text-text">SSID</label>
		<input
			id="ssid"
			type="text"
			bind:value={ssid}
			placeholder="Network name"
			required
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="password" class="mb-1 block text-sm font-medium text-text">Password</label>
		<input
			id="password"
			type="text"
			bind:value={password}
			placeholder="Network password"
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="encryption" class="mb-1 block text-sm font-medium text-text">Encryption</label>
		<select
			id="encryption"
			bind:value={encryption}
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		>
			<option value="WPA">WPA/WPA2</option>
			<option value="WEP">WEP</option>
			<option value="nopass">None</option>
		</select>
	</div>

	<div class="flex items-center gap-2">
		<input
			id="hidden"
			type="checkbox"
			bind:checked={hidden}
			class="rounded border-border text-accent focus:ring-accent"
		/>
		<label for="hidden" class="text-sm font-medium text-text">Hidden network</label>
	</div>
</div>
