export type TemplateId = 'professional' | 'minimal' | 'creative' | 'corporate' | 'compact';

export type SocialPlatform = 'linkedin' | 'twitter' | 'github' | 'instagram' | 'facebook' | 'youtube';

export interface SocialLink {
	platform: SocialPlatform;
	url: string;
}

export interface SignatureData {
	name: string;
	title: string;
	company: string;
	department: string;
	phone: string;
	email: string;
	website: string;
	address: string;
	photoUrl: string;
	companyLogoUrl: string;
	socialLinks: SocialLink[];
	template: TemplateId;
	accentColor: string;
	fontFamily: 'Arial' | 'Georgia' | 'Verdana' | 'Trebuchet MS' | 'Tahoma';
}
