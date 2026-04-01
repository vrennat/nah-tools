<script lang="ts">
	import type { SignatureData, TemplateId, SocialPlatform } from '$signature/types';

	let {
		data = $bindable<SignatureData>({
			name: '',
			title: '',
			company: '',
			department: '',
			phone: '',
			email: '',
			website: '',
			address: '',
			photoUrl: '',
			companyLogoUrl: '',
			socialLinks: [],
			template: 'professional',
			accentColor: '#3b82f6',
			fontFamily: 'Arial'
		})
	}: { data: SignatureData } = $props();

	const templates: { id: TemplateId; name: string; description: string }[] = [
		{ id: 'professional', name: 'Professional', description: 'Photo + bold separator' },
		{ id: 'minimal', name: 'Minimal', description: 'Clean and simple' },
		{ id: 'creative', name: 'Creative', description: 'Accent-colored name' },
		{ id: 'corporate', name: 'Corporate', description: 'Formal with border' },
		{ id: 'compact', name: 'Compact', description: 'Space-efficient' }
	];

	const platforms: SocialPlatform[] = ['linkedin', 'twitter', 'github', 'instagram', 'facebook', 'youtube'];

	function resizeImage(
		file: File,
		maxWidth: number,
		maxHeight: number
	): Promise<string> {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const img = new Image();
				img.onload = () => {
					const canvas = document.createElement('canvas');
					let width = img.width;
					let height = img.height;

					if (width > height) {
						if (width > maxWidth) {
							height = Math.round((height * maxWidth) / width);
							width = maxWidth;
						}
					} else {
						if (height > maxHeight) {
							width = Math.round((width * maxHeight) / height);
							height = maxHeight;
						}
					}

					canvas.width = width;
					canvas.height = height;
					const ctx = canvas.getContext('2d');
					if (ctx) {
						ctx.drawImage(img, 0, 0, width, height);
					}
					resolve(canvas.toDataURL('image/jpeg', 0.8));
				};
				img.src = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		});
	}

	async function handlePhotoUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files?.[0]) {
			const dataUrl = await resizeImage(input.files[0], 120, 120);
			data.photoUrl = dataUrl;
		}
	}

	async function handleLogoUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files?.[0]) {
			const dataUrl = await resizeImage(input.files[0], 150, 80);
			data.companyLogoUrl = dataUrl;
		}
	}

	function addSocialLink() {
		data.socialLinks = [...data.socialLinks, { platform: 'linkedin', url: '' }];
	}

	function removeSocialLink(index: number) {
		data.socialLinks = data.socialLinks.filter((_, i) => i !== index);
	}
</script>

<div class="space-y-6">
	<section class="space-y-4">
		<h3 class="text-sm font-medium text-text">Basic Information</h3>
		<div class="space-y-3">
			<div>
				<label for="name" class="mb-1 block text-sm font-medium text-text">Name</label>
				<input
					id="name"
					type="text"
					bind:value={data.name}
					placeholder="John Doe"
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>
			<div>
				<label for="title" class="mb-1 block text-sm font-medium text-text">Title</label>
				<input
					id="title"
					type="text"
					bind:value={data.title}
					placeholder="Senior Designer"
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>
			<div>
				<label for="company" class="mb-1 block text-sm font-medium text-text">Company</label>
				<input
					id="company"
					type="text"
					bind:value={data.company}
					placeholder="Acme Inc."
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>
			<div>
				<label for="department" class="mb-1 block text-sm font-medium text-text">Department</label>
				<input
					id="department"
					type="text"
					bind:value={data.department}
					placeholder="Design"
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>
		</div>
	</section>

	<section class="space-y-4">
		<h3 class="text-sm font-medium text-text">Contact Information</h3>
		<div class="space-y-3">
			<div>
				<label for="phone" class="mb-1 block text-sm font-medium text-text">Phone</label>
				<input
					id="phone"
					type="tel"
					bind:value={data.phone}
					placeholder="+1 (555) 123-4567"
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>
			<div>
				<label for="email" class="mb-1 block text-sm font-medium text-text">Email</label>
				<input
					id="email"
					type="email"
					bind:value={data.email}
					placeholder="john@example.com"
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>
			<div>
				<label for="website" class="mb-1 block text-sm font-medium text-text">Website</label>
				<input
					id="website"
					type="url"
					bind:value={data.website}
					placeholder="https://example.com"
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>
			<div>
				<label for="address" class="mb-1 block text-sm font-medium text-text">Address</label>
				<input
					id="address"
					type="text"
					bind:value={data.address}
					placeholder="123 Main St, City, State"
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>
		</div>
	</section>

	<section class="space-y-4">
		<h3 class="text-sm font-medium text-text">Images</h3>
		<div class="space-y-3">
			<div>
				<label for="photo" class="mb-1 block text-sm font-medium text-text">Photo</label>
				<input
					id="photo"
					type="file"
					accept="image/*"
					onchange={handlePhotoUpload}
					class="block w-full text-sm text-text-muted file:rounded-lg file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-text hover:file:bg-surface-alt"
				/>
				<p class="mt-1 text-xs text-text-muted">Will be resized to 120x120</p>
				{#if data.photoUrl}
					<img src={data.photoUrl} alt="" class="mt-2 h-20 w-20 rounded" />
				{/if}
			</div>
			<div>
				<label for="logo" class="mb-1 block text-sm font-medium text-text">Company Logo</label>
				<input
					id="logo"
					type="file"
					accept="image/*"
					onchange={handleLogoUpload}
					class="block w-full text-sm text-text-muted file:rounded-lg file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:font-medium file:text-text hover:file:bg-surface-alt"
				/>
				<p class="mt-1 text-xs text-text-muted">Will be resized to 150x80</p>
				{#if data.companyLogoUrl}
					<img src={data.companyLogoUrl} alt="Logo preview" class="mt-2 h-10 rounded" />
				{/if}
			</div>
		</div>
	</section>

	<section class="space-y-4">
		<h3 class="text-sm font-medium text-text">Template</h3>
		<div class="space-y-2">
			{#each templates as template}
				<label class="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-surface-alt">
					<input
						type="radio"
						bind:group={data.template}
						value={template.id}
						class="accent-accent"
					/>
					<div>
						<div class="font-medium text-text">{template.name}</div>
						<div class="text-xs text-text-muted">{template.description}</div>
					</div>
				</label>
			{/each}
		</div>
	</section>

	<section class="space-y-4">
		<h3 class="text-sm font-medium text-text">Design</h3>
		<div class="space-y-3">
			<div>
				<label for="color" class="mb-1 block text-sm font-medium text-text">Accent Color</label>
				<div class="flex gap-3">
					<input
						id="color"
						type="color"
						bind:value={data.accentColor}
						class="h-10 w-20 cursor-pointer rounded-lg border border-border"
					/>
					<input
						type="text"
						bind:value={data.accentColor}
						class="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
			</div>
			<div>
				<label for="font" class="mb-1 block text-sm font-medium text-text">Font Family</label>
				<select
					id="font"
					bind:value={data.fontFamily}
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				>
					<option value="Arial">Arial</option>
					<option value="Georgia">Georgia</option>
					<option value="Verdana">Verdana</option>
					<option value="Trebuchet MS">Trebuchet MS</option>
					<option value="Tahoma">Tahoma</option>
				</select>
			</div>
		</div>
	</section>

	<section class="space-y-4">
		<h3 class="text-sm font-medium text-text">Social Links</h3>
		<div class="space-y-2">
			{#each data.socialLinks as link, index (index)}
				<div class="flex gap-2">
					<select
						bind:value={link.platform}
						class="flex-shrink rounded-lg border border-border bg-surface px-2 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					>
						{#each platforms as platform}
							<option value={platform}>{platform}</option>
						{/each}
					</select>
					<input
						type="url"
						bind:value={link.url}
						placeholder="https://..."
						class="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
					<button
						type="button"
						onclick={() => removeSocialLink(index)}
						class="rounded-lg border border-border px-3 py-2 text-sm text-text-muted hover:bg-surface-alt"
					>
						Remove
					</button>
				</div>
			{/each}
			<button
				type="button"
				onclick={addSocialLink}
				class="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm font-medium text-text hover:bg-border"
			>
				Add Social Link
			</button>
		</div>
	</section>
</div>
