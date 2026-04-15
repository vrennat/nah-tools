import type { DocumentType, LegalGenInput } from '../types';
import { generatePrivacyPolicy } from './privacy-policy';
import { generateTermsOfService } from './terms-of-service';
import { generateCookiePolicy } from './cookie-policy';
import { generateDMCANotice } from './dmca-notice';

export function generateDocument(type: DocumentType, input: LegalGenInput): string {
	switch (type) {
		case 'privacy-policy':
			return generatePrivacyPolicy(input);
		case 'terms-of-service':
			return generateTermsOfService(input);
		case 'cookie-policy':
			return generateCookiePolicy(input);
		case 'dmca-notice':
			return generateDMCANotice(input);
		default:
			const _exhaustive: never = type;
			return _exhaustive;
	}
}
