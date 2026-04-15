import type { ThirdPartyConfig } from '../types';

export interface ServiceEntry {
	name: string;
	purpose: string;
	privacyUrl: string;
}

const KNOWN_SERVICES: Array<{ key: keyof ThirdPartyConfig; entry: ServiceEntry }> = [
	{
		key: 'usesGoogleAnalytics',
		entry: {
			name: 'Google Analytics',
			purpose: 'Website analytics and usage tracking',
			privacyUrl: 'https://policies.google.com/privacy'
		}
	},
	{
		key: 'usesStripe',
		entry: {
			name: 'Stripe',
			purpose: 'Payment processing and transaction management',
			privacyUrl: 'https://stripe.com/privacy'
		}
	},
	{
		key: 'usesMailchimp',
		entry: {
			name: 'Mailchimp',
			purpose: 'Email marketing and subscriber management',
			privacyUrl: 'https://mailchimp.com/legal/privacy/'
		}
	},
	{
		key: 'usesFacebookPixel',
		entry: {
			name: 'Facebook Pixel',
			purpose: 'Conversion tracking and advertising',
			privacyUrl: 'https://www.facebook.com/privacy/explanation'
		}
	},
	{
		key: 'usesCloudflare',
		entry: {
			name: 'Cloudflare',
			purpose: 'Content delivery, security, and performance optimization',
			privacyUrl: 'https://www.cloudflare.com/privacy/'
		}
	},
	{
		key: 'usesAWS',
		entry: {
			name: 'Amazon Web Services (AWS)',
			purpose: 'Cloud hosting and infrastructure',
			privacyUrl: 'https://aws.amazon.com/privacy/'
		}
	},
	{
		key: 'usesIntercom',
		entry: {
			name: 'Intercom',
			purpose: 'Customer support and engagement',
			privacyUrl: 'https://www.intercom.com/legal/privacy'
		}
	}
];

export function getThirdPartyServices(config: ThirdPartyConfig): ServiceEntry[] {
	const services = KNOWN_SERVICES.filter((s) => config[s.key]).map((s) => s.entry);
	return [...services, ...config.customServices];
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
