import type { LegalGenInput } from '../types';
import { getThirdPartyServices, formatDate } from './helpers';

export function generatePrivacyPolicy(input: LegalGenInput): string {
	const {
		business,
		dataCollection,
		thirdParties
	} = input;

	const lines: string[] = [];

	// Header
	lines.push(`# Privacy Policy`);
	lines.push('');
	lines.push(`**Effective Date:** ${formatDate(business.effectiveDate)}`);
	lines.push('');

	// Introduction
	lines.push(`## Introduction`);
	lines.push('');
	lines.push(`${business.businessName} ("we," "us," "our," or "Company") operates the ${business.websiteUrl} website and related services. We are committed to protecting your privacy and ensuring you have a positive experience on our platform.`);
	lines.push('');
	lines.push(`This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our services.`);
	lines.push('');

	// Information We Collect
	lines.push(`## Information We Collect`);
	lines.push('');

	if (dataCollection.collectsPersonalInfo) {
		lines.push(`### Personal Information`);
		lines.push('');
		lines.push(`We may collect personal information that you voluntarily provide, including:`);
		lines.push('');

		const personalItems: string[] = [];
		if (dataCollection.collectsName) personalItems.push('Your name');
		if (dataCollection.collectsEmail) personalItems.push('Email address');
		if (dataCollection.collectsPaymentInfo) personalItems.push('Payment information (for processing transactions)');
		if (dataCollection.collectsLocation) personalItems.push('Location data (if you choose to share it)');
		if (dataCollection.collectsDeviceInfo) personalItems.push('Device information (device type, operating system, browser type)');
		if (dataCollection.collectsUsageData) personalItems.push('Usage data (pages visited, time spent, interactions)');

		personalItems.forEach(item => {
			lines.push(`- ${item}`);
		});
		lines.push('');
	}

	if (dataCollection.collectsCookies || dataCollection.collectsAnalytics) {
		lines.push(`### Automated Information`);
		lines.push('');
		lines.push(`We automatically collect certain information when you use our website:`);
		lines.push('');

		if (dataCollection.collectsCookies) {
			lines.push(`- **Cookies:** Small text files stored on your device to remember preferences and track usage patterns.`);
		}
		if (dataCollection.collectsAnalytics) {
			lines.push(`- **Analytics Data:** Information about your interaction with our website, including pages visited, duration of visits, and referral sources.`);
		}

		lines.push('');
	}

	// How We Use Your Information
	lines.push(`## How We Use Your Information`);
	lines.push('');
	lines.push(`We use the information we collect for the following purposes:`);
	lines.push('');

	const purposes: string[] = [
		'To provide, maintain, and improve our services',
		'To process transactions and send related information'
	];

	if (dataCollection.collectsAnalytics) {
		purposes.push('To analyze usage trends and improve our website and user experience');
	}
	if (dataCollection.collectsEmail) {
		purposes.push('To send you marketing communications (if you have opted in)');
	}
	if (dataCollection.collectsDeviceInfo || dataCollection.collectsUsageData) {
		purposes.push('To prevent fraud and enhance security');
	}

	purposes.forEach(p => {
		lines.push(`- ${p}`);
	});
	lines.push('');

	// Third-Party Services
	const allThirdParties = getThirdPartyServices(thirdParties);
	if (allThirdParties.length > 0) {
		lines.push(`## Third-Party Service Providers`);
		lines.push('');
		lines.push(`We may share your information with trusted third-party service providers who assist us in operating our website and conducting our business. These providers are contractually obligated to use your information only for providing services to us and not for their own marketing purposes.`);
		lines.push('');

		allThirdParties.forEach(service => {
			lines.push(`### ${service.name}`);
			lines.push('');
			lines.push(`**Purpose:** ${service.purpose}`);
			lines.push('');
			lines.push(`[View ${service.name} Privacy Policy](${service.privacyUrl})`);
			lines.push('');
		});
	}

	// Cookies and Tracking
	if (dataCollection.collectsCookies || dataCollection.collectsAnalytics) {
		lines.push(`## Cookies and Tracking Technologies`);
		lines.push('');
		lines.push(`We use cookies and similar tracking technologies to enhance your experience on our website. Cookies are small files that are stored on your device and allow us to remember your preferences and track your usage patterns.`);
		lines.push('');
		lines.push(`You can control cookies through your browser settings and opt out of certain tracking by adjusting your preferences or using browser extensions designed to block tracking.`);
		lines.push('');
	}

	// Data Retention
	lines.push(`## Data Retention`);
	lines.push('');
	lines.push(`We retain personal information for as long as necessary to provide our services and fulfill the purposes for which it was collected, or as required by law. Generally, we retain personal data for ${dataCollection.dataRetentionPeriod}.`);
	lines.push('');

	if (dataCollection.allowsDeletion) {
		lines.push(`You have the right to request deletion of your personal information at any time. Upon receiving a valid deletion request, we will remove your data within a reasonable timeframe, unless we are legally required to retain it.`);
		lines.push('');
	}

	// GDPR Rights
	if (business.jurisdiction === 'eu-gdpr' || business.jurisdiction === 'uk') {
		lines.push(`## Your Rights Under GDPR and UK Data Protection Law`);
		lines.push('');
		lines.push(`If you are located in the European Union, United Kingdom, or other jurisdictions with similar data protection laws, you have the following rights:`);
		lines.push('');
		lines.push(`- **Right of Access:** You can request access to the personal data we hold about you.`);
		lines.push(`- **Right to Rectification:** You can request correction of inaccurate or incomplete personal data.`);
		lines.push(`- **Right to Erasure:** You can request deletion of your personal data (subject to certain exceptions).`);
		lines.push(`- **Right to Restrict Processing:** You can request that we limit the processing of your data.`);
		lines.push(`- **Right to Data Portability:** You can request a copy of your data in a structured, commonly used format.`);
		lines.push(`- **Right to Object:** You can object to certain types of processing, including marketing communications.`);
		lines.push('');
		lines.push(`To exercise any of these rights, please contact us using the information provided in the Contact Us section below.`);
		lines.push('');
	}

	// CCPA Rights
	if (business.jurisdiction === 'us-california') {
		lines.push(`## Your Rights Under CCPA`);
		lines.push('');
		lines.push(`If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):`);
		lines.push('');
		lines.push(`- **Right to Know:** You can request what personal information we collect, use, and share about you.`);
		lines.push(`- **Right to Delete:** You can request deletion of personal information we have collected from you.`);
		lines.push(`- **Right to Opt-Out:** You can opt out of the sale or sharing of your personal information.`);
		lines.push(`- **Right to Non-Discrimination:** We will not discriminate against you for exercising your CCPA rights.`);
		lines.push('');
		lines.push(`To submit a CCPA request, please contact us at ${business.contactEmail}. We will verify your identity and respond within 45 days.`);
		lines.push('');
	}

	// Children's Privacy
	if (dataCollection.collectsChildrenData) {
		lines.push(`## Children's Privacy`);
		lines.push('');
		lines.push(`Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will delete such information immediately.`);
		lines.push('');
		lines.push(`Parents or guardians who believe their child has provided personal information to us should contact us immediately at ${business.contactEmail}.`);
		lines.push('');
	}

	// Security
	lines.push(`## Security`);
	lines.push('');
	lines.push(`We implement appropriate technical, administrative, and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your information.`);
	lines.push('');

	// Changes to Policy
	lines.push(`## Changes to This Privacy Policy`);
	lines.push('');
	lines.push(`We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by posting the updated Privacy Policy on our website and updating the "Effective Date" at the top of this policy. Your continued use of our services after such modifications constitutes your acceptance of the updated Privacy Policy.`);
	lines.push('');

	// Contact Us
	lines.push(`## Contact Us`);
	lines.push('');
	lines.push(`If you have questions about this Privacy Policy or our privacy practices, please contact us at:`);
	lines.push('');
	lines.push(`**${business.businessName}**`);
	lines.push('');
	lines.push(`Email: ${business.contactEmail}`);
	lines.push('');
	lines.push(`Address: ${business.contactAddress}`);
	lines.push('');

	return lines.join('\n');
}

