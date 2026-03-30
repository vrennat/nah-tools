import type { Broker, UserInfo } from './types';

interface GeneratedEmail {
	to: string;
	subject: string;
	body: string;
	mailto: string;
}

export function generateCCPAEmail(broker: Broker, user: UserInfo): GeneratedEmail {
	const to = broker.emailAddress ?? '';
	const subject = broker.emailSubject ?? `Data Deletion Request — ${user.firstName} ${user.lastName}`;
	const body = `To Whom It May Concern,

I am writing to request the deletion of my personal information pursuant to the California Consumer Privacy Act (CCPA), Cal. Civ. Code § 1798.105.

Please delete all personal information your organization has collected, stored, or sold about me. This includes but is not limited to my name, address, phone number, email address, and any other personally identifiable information.

My details for locating my records:
- Full Name: ${user.firstName} ${user.lastName}
- Email: ${user.email}${user.state ? `\n- State: ${user.state}` : ''}${user.address ? `\n- Address: ${user.address}${user.city ? `, ${user.city}` : ''}${user.state ? `, ${user.state}` : ''}${user.zip ? ` ${user.zip}` : ''}` : ''}${user.phone ? `\n- Phone: ${user.phone}` : ''}

Under the CCPA, you are required to respond to this request within 45 days. Please confirm deletion once complete.

Thank you,
${user.firstName} ${user.lastName}`;

	return { to, subject, body, mailto: buildMailtoUrl(to, subject, body) };
}

export function generateGDPREmail(broker: Broker, user: UserInfo): GeneratedEmail {
	const to = broker.emailAddress ?? '';
	const subject = broker.emailSubject ?? `Right to Erasure Request — ${user.firstName} ${user.lastName}`;
	const body = `To the Data Protection Officer,

I am writing to request the erasure of my personal data pursuant to Article 17 of the General Data Protection Regulation (GDPR).

Please erase all personal data your organization holds about me without undue delay. This includes any data obtained directly or from third-party sources.

My details for locating my records:
- Full Name: ${user.firstName} ${user.lastName}
- Email: ${user.email}${user.address ? `\n- Address: ${user.address}${user.city ? `, ${user.city}` : ''}${user.zip ? ` ${user.zip}` : ''}` : ''}${user.phone ? `\n- Phone: ${user.phone}` : ''}

Under the GDPR, you are required to respond within one month. Please confirm erasure once complete.

Thank you,
${user.firstName} ${user.lastName}`;

	return { to, subject, body, mailto: buildMailtoUrl(to, subject, body) };
}

export function generateEmail(broker: Broker, user: UserInfo): GeneratedEmail {
	const isUS = user.state && user.state !== 'outside-us';
	if (!isUS && broker.legalBasis.includes('gdpr')) {
		return generateGDPREmail(broker, user);
	}
	return generateCCPAEmail(broker, user);
}

export function buildMailtoUrl(to: string, subject: string, body: string): string {
	return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
