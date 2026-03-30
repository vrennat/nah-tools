<script lang="ts">
	import { encodeVCard } from '$qr/encoder';

	let { value = $bindable('') } = $props();

	let firstName = $state('');
	let lastName = $state('');
	let phone = $state('');
	let email = $state('');
	let org = $state('');
	let title = $state('');
	let url = $state('');

	$effect(() => {
		value = encodeVCard({
			firstName,
			lastName,
			phone: phone || undefined,
			email: email || undefined,
			org: org || undefined,
			title: title || undefined,
			url: url || undefined
		});
	});
</script>

<div class="space-y-4">
	<div>
		<label for="firstName" class="mb-1 block text-sm font-medium text-text">First Name</label>
		<input
			id="firstName"
			type="text"
			bind:value={firstName}
			placeholder="John"
			required
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="lastName" class="mb-1 block text-sm font-medium text-text">Last Name</label>
		<input
			id="lastName"
			type="text"
			bind:value={lastName}
			placeholder="Doe"
			required
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="vcard-phone" class="mb-1 block text-sm font-medium text-text">Phone</label>
		<input
			id="vcard-phone"
			type="tel"
			bind:value={phone}
			placeholder="+1 (555) 123-4567"
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="vcard-email" class="mb-1 block text-sm font-medium text-text">Email</label>
		<input
			id="vcard-email"
			type="email"
			bind:value={email}
			placeholder="john@example.com"
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="org" class="mb-1 block text-sm font-medium text-text">Organization</label>
		<input
			id="org"
			type="text"
			bind:value={org}
			placeholder="Acme Inc."
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="title" class="mb-1 block text-sm font-medium text-text">Title</label>
		<input
			id="title"
			type="text"
			bind:value={title}
			placeholder="Software Engineer"
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="vcard-url" class="mb-1 block text-sm font-medium text-text">URL</label>
		<input
			id="vcard-url"
			type="url"
			bind:value={url}
			placeholder="https://example.com"
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		/>
	</div>
</div>
