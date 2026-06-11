import { describe, it, expect } from 'vitest';
import { markdownToHtml } from '$legalgen/renderer';

describe('markdownToHtml — XSS hardening', () => {
	describe('link scheme validation', () => {
		it('renders plain text for a javascript: link, not an anchor', () => {
			const html = markdownToHtml('[click me](javascript:alert(1))');
			expect(html).not.toContain('javascript:');
			expect(html).not.toContain('<a ');
			// Link text should still appear
			expect(html).toContain('click me');
		});

		it('renders plain text for a vbscript: link', () => {
			const html = markdownToHtml('[x](vbscript:msgbox(1))');
			expect(html).not.toContain('vbscript:');
			expect(html).not.toContain('<a ');
		});

		it('renders an anchor for a valid https link', () => {
			const html = markdownToHtml('[Privacy Policy](https://example.com/privacy)');
			expect(html).toContain('<a href="https://example.com/privacy">Privacy Policy</a>');
		});

		it('renders an anchor for a valid http link', () => {
			const html = markdownToHtml('[Site](http://example.com)');
			expect(html).toContain('<a href="http://example.com">Site</a>');
		});

		it('renders an anchor for a mailto link', () => {
			const html = markdownToHtml('[Email us](mailto:hello@example.com)');
			expect(html).toContain('<a href="mailto:hello@example.com">Email us</a>');
		});
	});

	describe('HTML escaping is still applied', () => {
		it('escapes angle brackets in link text', () => {
			const html = markdownToHtml('[<script>xss</script>](https://example.com)');
			expect(html).not.toContain('<script>');
			expect(html).toContain('&lt;script&gt;');
		});
	});
});
