import type { LegalGenInput } from '../types';
import { formatDate } from './helpers';

export function generateTermsOfService(input: LegalGenInput): string {
	const { business } = input;

	const lines: string[] = [];

	// Header
	lines.push(`# Terms of Service`);
	lines.push('');
	lines.push(`**Effective Date:** ${formatDate(business.effectiveDate)}`);
	lines.push('');

	// Introduction
	lines.push(`## 1. Acceptance of Terms`);
	lines.push('');
	lines.push(`These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and ${business.businessName} ("Company," "we," "us," or "our"). By accessing and using the ${business.websiteUrl} website and services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use our services.`);
	lines.push('');

	// Description of Service
	lines.push(`## 2. Description of Service`);
	lines.push('');
	lines.push(`${business.businessName} provides online tools and services through our website. Our services are provided on an "as-is" and "as-available" basis. We reserve the right to modify, suspend, or discontinue any part of our services at any time, with or without notice.`);
	lines.push('');

	// User Accounts
	lines.push(`## 3. User Accounts`);
	lines.push('');
	lines.push(`If our services require account creation, you agree to provide accurate, current, and complete information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to maintain account security.`);
	lines.push('');

	// Acceptable Use
	lines.push(`## 4. Acceptable Use Policy`);
	lines.push('');
	lines.push(`You agree not to use our services for any unlawful, abusive, or harmful purpose. Specifically, you agree not to:`);
	lines.push('');
	lines.push(`- Upload, transmit, or distribute any malicious software, viruses, or harmful code`);
	lines.push(`- Harass, threaten, abuse, or defame any person`);
	lines.push(`- Engage in any activity that violates applicable laws or regulations`);
	lines.push(`- Attempt to gain unauthorized access to our systems or networks`);
	lines.push(`- Engage in any form of automated scraping, hacking, or data mining`);
	lines.push(`- Interfere with the normal operation of our services`);
	lines.push(`- Circumvent or bypass any security or access control measures`);
	lines.push('');
	lines.push(`Violations of this policy may result in immediate termination of your access to our services.`);
	lines.push('');

	// Intellectual Property
	lines.push(`## 5. Intellectual Property Rights`);
	lines.push('');
	lines.push(`All content, materials, and functionality on our website, including but not limited to text, graphics, logos, images, and software, are the exclusive property of ${business.businessName} or our licensors and are protected by applicable copyright, trademark, and intellectual property laws.`);
	lines.push('');
	lines.push(`You are granted a limited, non-exclusive, non-transferable license to access and use our services for lawful personal or business purposes. This license does not include any right to:`);
	lines.push('');
	lines.push(`- Copy, modify, or distribute our content or services`);
	lines.push(`- Reverse engineer or attempt to derive the source code or algorithms`);
	lines.push(`- Remove or alter any proprietary notices or labels`);
	lines.push(`- Use our content for commercial purposes without our written consent`);
	lines.push('');

	// Limitation of Liability
	lines.push(`## 6. Limitation of Liability`);
	lines.push('');
	lines.push(`To the fullest extent permitted by law, ${business.businessName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, even if we have been advised of the possibility of such damages. This includes loss of profits, loss of data, or loss of use.`);
	lines.push('');
	lines.push(`Our total liability for any claim arising out of or related to these Terms or our services shall not exceed the amount you paid to us in the 12 months preceding the claim, or $100, whichever is greater.`);
	lines.push('');

	// Disclaimer of Warranties
	lines.push(`## 7. Disclaimer of Warranties`);
	lines.push('');
	lines.push(`Our services are provided "as-is" and "as-available" without warranty of any kind, express or implied. We disclaim all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.`);
	lines.push('');
	lines.push(`We do not warrant that our services will be uninterrupted, error-free, or secure, or that defects will be corrected. We make no representations about the accuracy, reliability, or completeness of any information or content.`);
	lines.push('');

	// Indemnification
	lines.push(`## 8. Indemnification`);
	lines.push('');
	lines.push(`You agree to indemnify, defend, and hold harmless ${business.businessName}, its officers, directors, employees, and agents from any claims, losses, damages, liabilities, costs, and expenses (including reasonable attorney's fees) arising out of:`);
	lines.push('');
	lines.push(`- Your use of our services`);
	lines.push(`- Your violation of these Terms`);
	lines.push(`- Your violation of any applicable law or regulation`);
	lines.push(`- Your infringement of any third-party intellectual property rights`);
	lines.push(`- Any content you upload, transmit, or distribute through our services`);
	lines.push('');

	// Governing Law
	lines.push(`## 9. Governing Law`);
	lines.push('');
	const jurisdiction = getJurisdictionText(business.jurisdiction);
	lines.push(`These Terms shall be governed by and construed in accordance with the laws of ${jurisdiction}, without regard to its conflict of law provisions.`);
	lines.push('');

	// Dispute Resolution
	lines.push(`## 10. Dispute Resolution`);
	lines.push('');
	lines.push(`Any disputes arising out of or related to these Terms or our services shall be resolved through binding arbitration or in the courts of ${jurisdiction}, at our election. You agree to submit to the personal jurisdiction of such courts.`);
	lines.push('');
	lines.push(`Before initiating any legal action, you agree to make good faith efforts to resolve the dispute through informal negotiation or mediation.`);
	lines.push('');

	// Termination
	lines.push(`## 11. Termination`);
	lines.push('');
	lines.push(`We may terminate your access to our services at any time, with or without cause, and with or without notice. Upon termination, all licenses and rights granted to you shall immediately cease, and you must cease all use of our services.`);
	lines.push('');

	// Changes to Terms
	lines.push(`## 12. Changes to These Terms`);
	lines.push('');
	lines.push(`We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to our website. Your continued use of our services following the posting of modified Terms constitutes your acceptance of the changes. If you do not agree to any modifications, your sole remedy is to cease using our services.`);
	lines.push('');

	// Contact Information
	lines.push(`## 13. Contact Information`);
	lines.push('');
	lines.push(`If you have questions about these Terms of Service, please contact us at:`);
	lines.push('');
	lines.push(`**${business.businessName}**`);
	lines.push('');
	lines.push(`Email: ${business.contactEmail}`);
	lines.push('');
	lines.push(`Address: ${business.contactAddress}`);
	lines.push('');

	return lines.join('\n');
}

function getJurisdictionText(jurisdiction: string): string {
	const jurisdictionMap: Record<string, string> = {
		'us-california': 'the State of California, United States',
		'us-general': 'the State where the Company is incorporated, United States',
		'eu-gdpr': 'the European Union',
		'uk': 'England and Wales, United Kingdom',
		'canada': 'the Province of Ontario, Canada',
		'australia': 'New South Wales, Australia',
		'other': 'the jurisdiction specified in a separate agreement'
	};

	return jurisdictionMap[jurisdiction] || jurisdictionMap['us-general'];
}

