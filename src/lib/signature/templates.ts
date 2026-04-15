import type { SignatureData } from './types';
import { escapeHtml, socialIconUrls } from './renderer';

function renderSocialIcons(data: SignatureData): string {
	if (data.socialLinks.length === 0) return '';

	const icons = data.socialLinks
		.map((link) => {
			const iconUrl = socialIconUrls[link.platform];
			if (!iconUrl) return '';
			return `<a href="${escapeHtml(link.url)}" style="display: inline-block; margin-right: 8px; vertical-align: middle;">
				<img src="${iconUrl}" alt="${link.platform}" width="18" height="18" style="border: 0; display: block;" />
			</a>`;
		})
		.join('');

	return `<td style="padding-top: 12px; vertical-align: top;">${icons}</td>`;
}

function renderPhoneEmail(data: SignatureData): string {
	const parts: string[] = [];
	if (data.phone) parts.push(`<a href="tel:${escapeHtml(data.phone)}" style="color: ${data.accentColor}; text-decoration: none;">${escapeHtml(data.phone)}</a>`);
	if (data.email) parts.push(`<a href="mailto:${escapeHtml(data.email)}" style="color: ${data.accentColor}; text-decoration: none;">${escapeHtml(data.email)}</a>`);
	if (data.website) parts.push(`<a href="${escapeHtml(data.website)}" style="color: ${data.accentColor}; text-decoration: none;">${escapeHtml(data.website)}</a>`);

	return parts.join(' | ');
}

export function renderProfessional(data: SignatureData): string {
	const hasPhoto = data.photoUrl && data.photoUrl.length > 0;
	const hasLogo = data.companyLogoUrl && data.companyLogoUrl.length > 0;

	let html = `<table cellpadding="0" cellspacing="0" style="font-family: ${data.fontFamily}, Arial, sans-serif; font-size: 13px; color: #333; line-height: 1.5;">`;

	if (hasLogo) {
		html += `<tr>
			<td style="padding-bottom: 12px;">
				<img src="${data.companyLogoUrl}" alt="Company Logo" width="100" height="auto" style="border: 0; display: block;" />
			</td>
		</tr>`;
	}

	html += `<tr>
		<td style="border-bottom: 2px solid ${data.accentColor}; padding-bottom: 12px; padding-right: 20px;">
			<div style="font-weight: 700; font-size: 15px; margin-bottom: 4px; color: #111;">${escapeHtml(data.name)}</div>
			${data.title ? `<div style="font-size: 12px; color: #666; margin-bottom: 2px;">${escapeHtml(data.title)}</div>` : ''}
			${data.department ? `<div style="font-size: 12px; color: #666; margin-bottom: 6px;">${escapeHtml(data.department)} | ${escapeHtml(data.company)}</div>` : data.company ? `<div style="font-size: 12px; color: #666; margin-bottom: 6px;">${escapeHtml(data.company)}</div>` : ''}
			<div style="font-size: 12px; color: #888; margin-top: 8px;">
				${renderPhoneEmail(data)}
				${data.address ? `<div style="margin-top: 4px;">${escapeHtml(data.address)}</div>` : ''}
			</div>
		</td>
		${hasPhoto ? `<td style="padding-left: 16px; vertical-align: top;">
			<img src="${data.photoUrl}" alt="Photo" width="100" height="100" style="border: 0; display: block; border-radius: 4px;" />
		</td>` : ''}
	</tr>`;

	if (data.socialLinks.length > 0) {
		html += `<tr>${renderSocialIcons(data)}</tr>`;
	}

	html += `</table>`;

	return html;
}

export function renderMinimal(data: SignatureData): string {
	let html = `<table cellpadding="0" cellspacing="0" style="font-family: ${data.fontFamily}, Arial, sans-serif; font-size: 13px; color: #333; line-height: 1.5;">
		<tr>
			<td>
				<div style="font-weight: 700; font-size: 14px; margin-bottom: 2px; color: #111;">${escapeHtml(data.name)}</div>
				${data.title ? `<div style="font-size: 12px; color: #666; margin-bottom: 2px;">${escapeHtml(data.title)}</div>` : ''}
				${data.company ? `<div style="font-size: 12px; color: #999; margin-bottom: 8px;">${escapeHtml(data.company)}</div>` : ''}`;

	const contactParts: string[] = [];
	if (data.phone) contactParts.push(`<a href="tel:${escapeHtml(data.phone)}" style="color: #666; text-decoration: none;">${escapeHtml(data.phone)}</a>`);
	if (data.email) contactParts.push(`<a href="mailto:${escapeHtml(data.email)}" style="color: #666; text-decoration: none;">${escapeHtml(data.email)}</a>`);
	if (data.website) contactParts.push(`<a href="${escapeHtml(data.website)}" style="color: #666; text-decoration: none;">${escapeHtml(data.website)}</a>`);

	html += `<div style="font-size: 12px; color: #666;">
					${contactParts.join(' • ')}
				</div>`;

	if (data.socialLinks.length > 0) {
		const socialLinks = data.socialLinks
			.map((link) => `<a href="${escapeHtml(link.url)}" style="color: #666; text-decoration: none; margin-right: 8px;">${link.platform}</a>`)
			.join('');
		html += `<div style="font-size: 12px; margin-top: 8px; color: #999;">
					${socialLinks}
				</div>`;
	}

	html += `</td>
		</tr>
	</table>`;

	return html;
}

export function renderCreative(data: SignatureData): string {
	let html = `<table cellpadding="0" cellspacing="0" style="font-family: ${data.fontFamily}, Arial, sans-serif; font-size: 13px; color: #333; line-height: 1.5;">
		<tr>
			<td style="border-left: 3px solid ${data.accentColor}; padding-left: 12px;">
				<div style="font-weight: 700; font-size: 15px; margin-bottom: 6px; color: ${data.accentColor};">${escapeHtml(data.name)}</div>
				${data.title ? `<div style="font-size: 12px; color: #666; margin-bottom: 2px;">${escapeHtml(data.title)}</div>` : ''}
				${data.company ? `<div style="font-size: 12px; color: #999; margin-bottom: 8px;">${escapeHtml(data.company)}</div>` : ''}
				<div style="font-size: 12px; color: #666;">
					${renderPhoneEmail(data)}
				</div>
				${data.address ? `<div style="font-size: 12px; color: #999; margin-top: 6px;">${escapeHtml(data.address)}</div>` : ''}`;

	if (data.socialLinks.length > 0) {
		html += `<div style="margin-top: 8px;">
					${data.socialLinks
						.map((link) => {
							const iconUrl = socialIconUrls[link.platform];
							if (!iconUrl) return '';
							return `<a href="${escapeHtml(link.url)}" style="display: inline-block; margin-right: 8px;">
								<img src="${iconUrl}" alt="${link.platform}" width="16" height="16" style="border: 0; display: block;" />
							</a>`;
						})
						.join('')}
				</div>`;
	}

	html += `</td>
		</tr>
	</table>`;

	return html;
}

export function renderCorporate(data: SignatureData): string {
	const hasLogo = data.companyLogoUrl && data.companyLogoUrl.length > 0;

	let html = `<table cellpadding="0" cellspacing="0" style="font-family: ${data.fontFamily}, Arial, sans-serif; font-size: 13px; color: #333; line-height: 1.6;">`;

	if (hasLogo) {
		html += `<tr>
			<td style="padding-bottom: 16px;">
				<img src="${data.companyLogoUrl}" alt="Company Logo" width="120" height="auto" style="border: 0; display: block;" />
			</td>
		</tr>`;
	}

	html += `<tr>
		<td style="border-left: 4px solid ${data.accentColor}; padding-left: 12px;">
			<div style="font-weight: 700; font-size: 16px; margin-bottom: 4px; color: #111;">${escapeHtml(data.name)}</div>
			<div style="font-size: 13px; color: #666; margin-bottom: 2px;">${escapeHtml(data.title)}</div>
			${data.department ? `<div style="font-size: 12px; color: #999; margin-bottom: 8px;">Department: ${escapeHtml(data.department)}</div>` : ''}
			<div style="font-size: 12px; color: #666; margin-bottom: 2px;">
				${data.company ? `${escapeHtml(data.company)}` : ''}
				${data.company && (data.phone || data.email) ? '<br />' : ''}
				${data.phone ? `Phone: <a href="tel:${escapeHtml(data.phone)}" style="color: ${data.accentColor}; text-decoration: none;">${escapeHtml(data.phone)}</a>` : ''}
				${data.phone && data.email ? '<br />' : ''}
				${data.email ? `Email: <a href="mailto:${escapeHtml(data.email)}" style="color: ${data.accentColor}; text-decoration: none;">${escapeHtml(data.email)}</a>` : ''}
				${(data.phone || data.email) && data.website ? '<br />' : ''}
				${data.website ? `Web: <a href="${escapeHtml(data.website)}" style="color: ${data.accentColor}; text-decoration: none;">${escapeHtml(data.website)}</a>` : ''}
			</div>
			${data.address ? `<div style="font-size: 12px; color: #999; margin-top: 6px;">${escapeHtml(data.address)}</div>` : ''}
		</td>
	</tr>`;

	if (data.socialLinks.length > 0) {
		html += `<tr><td style="padding-top: 12px;">${renderSocialIcons(data)}</td></tr>`;
	}

	html += `</table>`;

	return html;
}

export function renderCompact(data: SignatureData): string {
	let html = `<table cellpadding="0" cellspacing="0" style="font-family: ${data.fontFamily}, Arial, sans-serif; font-size: 12px; color: #333; line-height: 1.4;">
		<tr>
			<td>
				<div style="font-weight: 700; font-size: 13px; margin-bottom: 6px; color: #111;">
					${escapeHtml(data.name)}${data.title ? ' | ' + escapeHtml(data.title) : ''}
				</div>
				<div style="font-size: 11px; color: #666;">
					${data.company ? escapeHtml(data.company) : ''}
					${data.company && (data.phone || data.email) ? ' • ' : ''}
					${data.phone ? `<a href="tel:${escapeHtml(data.phone)}" style="color: #666; text-decoration: none;">${escapeHtml(data.phone)}</a>` : ''}
					${data.phone && data.email ? ' • ' : ''}
					${data.email ? `<a href="mailto:${escapeHtml(data.email)}" style="color: #666; text-decoration: none;">${escapeHtml(data.email)}</a>` : ''}
					${(data.phone || data.email) && data.website ? ' • ' : ''}
					${data.website ? `<a href="${escapeHtml(data.website)}" style="color: #666; text-decoration: none;">${escapeHtml(data.website)}</a>` : ''}
				</div>`;

	if (data.socialLinks.length > 0) {
		const socialLinks = data.socialLinks.map((link) => `<a href="${escapeHtml(link.url)}" style="color: #666; text-decoration: none; margin-right: 6px; font-size: 11px;">${link.platform}</a>`).join(' ');
		html += `<div style="margin-top: 4px;">${socialLinks}</div>`;
	}

	html += `</td>
		</tr>
	</table>`;

	return html;
}
