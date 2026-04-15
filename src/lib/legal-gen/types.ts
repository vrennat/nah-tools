export type DocumentType = 'privacy-policy' | 'terms-of-service' | 'cookie-policy' | 'dmca-notice';
export type EntityType = 'individual' | 'llc' | 'corporation' | 'nonprofit' | 'other';
export type Jurisdiction = 'us-california' | 'us-general' | 'eu-gdpr' | 'uk' | 'canada' | 'australia' | 'other';

export interface BusinessInfo {
	businessName: string;
	websiteUrl: string;
	contactEmail: string;
	contactAddress: string;
	entityType: EntityType;
	jurisdiction: Jurisdiction;
	effectiveDate: string;
}

export interface DataCollectionConfig {
	collectsPersonalInfo: boolean;
	collectsEmail: boolean;
	collectsName: boolean;
	collectsPaymentInfo: boolean;
	collectsLocation: boolean;
	collectsCookies: boolean;
	collectsAnalytics: boolean;
	collectsDeviceInfo: boolean;
	collectsUsageData: boolean;
	collectsChildrenData: boolean;
	dataRetentionPeriod: string;
	allowsDeletion: boolean;
}

export interface ThirdPartyService {
	name: string;
	purpose: string;
	privacyUrl: string;
}

export interface ThirdPartyConfig {
	usesGoogleAnalytics: boolean;
	usesStripe: boolean;
	usesMailchimp: boolean;
	usesFacebookPixel: boolean;
	usesCloudflare: boolean;
	usesAWS: boolean;
	usesIntercom: boolean;
	customServices: ThirdPartyService[];
}

export interface LegalGenInput {
	business: BusinessInfo;
	dataCollection: DataCollectionConfig;
	thirdParties: ThirdPartyConfig;
}
