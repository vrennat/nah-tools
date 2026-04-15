import type { LegalGenInput } from '../types';
import { getThirdPartyServices, formatDate } from './helpers';

export function generateCookiePolicy(input: LegalGenInput): string {
	const { business, thirdParties } = input;

	const lines: string[] = [];

	// Header
	lines.push(`# Cookie Policy`);
	lines.push('');
	lines.push(`**Effective Date:** ${formatDate(business.effectiveDate)}`);
	lines.push('');

	// Introduction
	lines.push(`## What Are Cookies?`);
	lines.push('');
	lines.push(`Cookies are small text files that are placed on your device (computer, mobile phone, tablet, etc.) when you visit our website. They are widely used in web applications to store information about user preferences, authentication status, and browsing behavior. Cookies do not contain viruses or malicious code.`);
	lines.push('');
	lines.push(`There are two types of cookies:`);
	lines.push('');
	lines.push(`- **Session Cookies:** Temporary files that are automatically deleted when you close your browser`);
	lines.push(`- **Persistent Cookies:** Files that remain on your device until they expire or are manually deleted`);
	lines.push('');

	// How We Use Cookies
	lines.push(`## How We Use Cookies`);
	lines.push('');

	lines.push(`### Essential Cookies`);
	lines.push('');
	lines.push(`These cookies are necessary for our website to function properly. They enable core functionality such as:`);
	lines.push('');
	lines.push(`- User authentication and login sessions`);
	lines.push(`- Security and fraud prevention`);
	lines.push(`- Preference storage (language, accessibility settings)`);
	lines.push('');

	lines.push(`### Analytical Cookies`);
	lines.push('');
	lines.push(`These cookies help us understand how users interact with our website. They collect anonymous information about:`);
	lines.push('');
	lines.push(`- Pages visited and content viewed`);
	lines.push(`- Time spent on pages`);
	lines.push(`- Referral sources and click-through rates`);
	lines.push(`- User engagement patterns`);
	lines.push('');
	lines.push(`This information allows us to improve our website and user experience.`);
	lines.push('');

	lines.push(`### Preference Cookies`);
	lines.push('');
	lines.push(`These cookies remember your preferences and choices, including:`);
	lines.push('');
	lines.push(`- Language preferences`);
	lines.push(`- Theme selection (light/dark mode)`);
	lines.push(`- Customized user interface settings`);
	lines.push('');

	// Third-Party Cookies
	const allThirdParties = getThirdPartyServices(thirdParties);
	if (allThirdParties.length > 0) {
		lines.push(`## Third-Party Cookies`);
		lines.push('');
		lines.push(`We partner with trusted third-party service providers who may set their own cookies on your device:`);
		lines.push('');

		allThirdParties.forEach(service => {
			lines.push(`### ${service.name}`);
			lines.push('');
			lines.push(`**Purpose:** ${service.purpose}`);
			lines.push('');
			lines.push(`[View ${service.name} Cookie Policy](${service.privacyUrl})`);
			lines.push('');
		});
	}

	// Managing Cookies
	lines.push(`## Managing Your Cookies`);
	lines.push('');
	lines.push(`You have the right to control cookies on your device. You can:`);
	lines.push('');
	lines.push(`### Browser Settings`);
	lines.push('');
	lines.push(`Most web browsers allow you to control cookies through settings:`);
	lines.push('');
	lines.push(`- **Chrome:** Settings > Privacy and Security > Cookies and other site data`);
	lines.push(`- **Firefox:** Preferences > Privacy & Security > Cookies and Site Data`);
	lines.push(`- **Safari:** Preferences > Privacy > Cookies and website data`);
	lines.push(`- **Edge:** Settings > Privacy, search, and services > Cookies and other site permissions`);
	lines.push('');

	lines.push(`### Cookie Controls`);
	lines.push('');
	lines.push(`You can:`);
	lines.push('');
	lines.push(`- View all cookies stored on your device`);
	lines.push(`- Delete specific cookies or all cookies`);
	lines.push(`- Block all cookies or allow only essential cookies`);
	lines.push(`- Set preferences for specific websites`);
	lines.push('');

	lines.push(`### Opt-Out Tools`);
	lines.push('');
	lines.push(`For analytics and advertising cookies, you can use:`);
	lines.push('');
	lines.push(`- [Google Analytics Opt-Out Browser Add-on](https://tools.google.com/dlpage/gaoptout)`);
	lines.push(`- [Network Advertising Initiative Opt-Out](https://optout.networkadvertising.org/)`);
	lines.push(`- [Your Online Choices (EU)](http://www.youronlinechoices.eu/)`);
	lines.push('');

	// Impact of Disabling Cookies
	lines.push(`## Impact of Disabling Cookies`);
	lines.push('');
	lines.push(`If you disable cookies, some features of our website may not function properly, including:`);
	lines.push('');
	lines.push(`- Login and authentication services`);
	lines.push(`- User preference storage`);
	lines.push(`- Personalized content`);
	lines.push('');

	// Changes to This Policy
	lines.push(`## Changes to This Cookie Policy`);
	lines.push('');
	lines.push(`We may update this Cookie Policy periodically to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the updated policy on our website. Your continued use of our services constitutes your acceptance of any changes.`);
	lines.push('');

	// Contact Us
	lines.push(`## Contact Us`);
	lines.push('');
	lines.push(`If you have questions about this Cookie Policy or our cookie practices, please contact us at:`);
	lines.push('');
	lines.push(`**${business.businessName}**`);
	lines.push('');
	lines.push(`Email: ${business.contactEmail}`);
	lines.push('');
	lines.push(`Address: ${business.contactAddress}`);
	lines.push('');

	return lines.join('\n');
}

