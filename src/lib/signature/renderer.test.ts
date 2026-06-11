import { describe, it, expect } from 'vitest';
import { renderSignature } from '$signature/renderer';
import type { SignatureData } from '$signature/types';

function baseData(overrides: Partial<SignatureData> = {}): SignatureData {
	return {
		name: 'Test User',
		title: 'Engineer',
		company: 'Acme',
		department: '',
		phone: '',
		email: 'test@example.com',
		website: 'https://example.com',
		address: '',
		photoUrl: '',
		companyLogoUrl: '',
		socialLinks: [],
		template: 'professional',
		accentColor: '#3b82f6',
		fontFamily: 'Arial',
		...overrides
	};
}

describe('renderSignature — XSS hardening', () => {
	describe('photoUrl injection', () => {
		it('omits the img tag when photoUrl contains an attribute injection payload', () => {
			const data = baseData({ photoUrl: '" onerror="alert(1)' });
			const html = renderSignature(data);
			expect(html).not.toContain('onerror');
			expect(html).not.toContain('" onerror=');
		});

		it('omits the img tag when photoUrl uses javascript: scheme', () => {
			const html = renderSignature(baseData({ photoUrl: 'javascript:alert(1)' }));
			expect(html).not.toContain('javascript:');
			expect(html).not.toContain('<img');
		});

		it('renders the img tag when photoUrl is a valid https URL', () => {
			const html = renderSignature(baseData({ photoUrl: 'https://cdn.example.com/photo.jpg' }));
			expect(html).toContain('https://cdn.example.com/photo.jpg');
		});

		it('renders the img tag when photoUrl is a data:image/ URI', () => {
			const html = renderSignature(baseData({ photoUrl: 'data:image/png;base64,abc123' }));
			expect(html).toContain('data:image/png;base64,abc123');
		});
	});

	describe('accentColor CSS injection', () => {
		it('falls back to the default color when accentColor is a CSS expression', () => {
			const data = baseData({ accentColor: 'red; background: url(javascript:alert(1))' });
			const html = renderSignature(data);
			expect(html).not.toContain('background');
			expect(html).not.toContain('javascript:');
			// Default accent color must appear instead
			expect(html).toContain('#3b82f6');
		});

		it('falls back to the default color for an empty accentColor', () => {
			const html = renderSignature(baseData({ accentColor: '' }));
			expect(html).toContain('#3b82f6');
		});

		it('uses the provided color when accentColor is a valid 6-digit hex', () => {
			const html = renderSignature(baseData({ accentColor: '#ff0000' }));
			expect(html).toContain('#ff0000');
		});

		it('uses the provided color when accentColor is a valid 3-digit hex', () => {
			const html = renderSignature(baseData({ accentColor: '#f00' }));
			expect(html).toContain('#f00');
		});
	});

	describe('website href injection', () => {
		it('omits the anchor when website is a javascript: URL', () => {
			const html = renderSignature(baseData({ website: 'javascript:alert(1)' }));
			expect(html).not.toContain('javascript:');
		});

		it('renders the anchor when website is https', () => {
			const html = renderSignature(baseData({ website: 'https://example.com' }));
			expect(html).toContain('https://example.com');
		});
	});

	describe('social link URL injection', () => {
		it('omits the anchor for a javascript: social link URL', () => {
			const html = renderSignature(
				baseData({
					socialLinks: [{ platform: 'linkedin', url: 'javascript:alert(1)' }]
				})
			);
			expect(html).not.toContain('javascript:');
		});

		it('renders the anchor for a valid https social link URL', () => {
			const html = renderSignature(
				baseData({
					socialLinks: [{ platform: 'linkedin', url: 'https://linkedin.com/in/test' }]
				})
			);
			expect(html).toContain('https://linkedin.com/in/test');
		});
	});

	describe('minimal template', () => {
		it('escapes link.platform in social links text', () => {
			const html = renderSignature(
				baseData({
					template: 'minimal',
					socialLinks: [{ platform: 'linkedin', url: 'https://linkedin.com/in/test' }]
				})
			);
			// platform is used as link text; must be HTML-escaped (no raw angle brackets etc.)
			expect(html).not.toContain('<script>');
		});
	});
});
