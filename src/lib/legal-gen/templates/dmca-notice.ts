import type { LegalGenInput } from '../types';
import { formatDate } from './helpers';

export function generateDMCANotice(input: LegalGenInput): string {
	const { business } = input;

	const lines: string[] = [];

	// Header
	lines.push(`# DMCA Compliance Statement`);
	lines.push('');
	lines.push(`**Effective Date:** ${formatDate(business.effectiveDate)}`);
	lines.push('');

	// Introduction
	lines.push(`## Introduction`);
	lines.push('');
	lines.push(`${business.businessName} ("Company") respects the intellectual property rights of others and is committed to protecting copyrighted content from unauthorized use. This document outlines our Digital Millennium Copyright Act (DMCA) compliance procedures and policies.`);
	lines.push('');

	// DMCA Compliance
	lines.push(`## DMCA Compliance Statement`);
	lines.push('');
	lines.push(`We comply with the Digital Millennium Copyright Act (17 U.S.C. $ 512) and applicable international copyright laws. If you believe that any content on our website infringes upon your copyrights, you may submit a DMCA notice to our Designated Copyright Agent as described below.`);
	lines.push('');

	// Filing a DMCA Notice
	lines.push(`## Filing a DMCA Notice`);
	lines.push('');
	lines.push(`To file a valid DMCA notice, your notification must include the following information:`);
	lines.push('');
	lines.push(`1. **Your Physical or Electronic Signature:** Include your handwritten or electronic signature`);
	lines.push('');
	lines.push(`2. **Identification of the Copyrighted Work:** Describe the copyrighted work(s) you claim have been infringed, including:`);
	lines.push(`   - Title of the work`);
	lines.push(`   - Registration number(s) if applicable`);
	lines.push(`   - Other identifying information`);
	lines.push('');
	lines.push(`3. **Location of Infringing Material:** Identify the specific URL(s) or location(s) on our website where the allegedly infringing content is located`);
	lines.push('');
	lines.push(`4. **Your Contact Information:** Include:`);
	lines.push(`   - Name`);
	lines.push(`   - Complete mailing address`);
	lines.push(`   - Telephone number`);
	lines.push(`   - Email address`);
	lines.push('');
	lines.push(`5. **Statement of Good Faith:** Include a statement that you have a good faith belief that the use of the content is not authorized by the copyright holder, their agent, or the law`);
	lines.push('');
	lines.push(`6. **Statement Under Penalty of Perjury:** Include the following statement: "I declare under penalty of perjury that the information in this notice is accurate and that I am the copyright owner or authorized to act on behalf of the copyright owner"`);
	lines.push('');
	lines.push(`7. **Authorization:** If you are not the copyright owner, you must demonstrate that you are authorized to act on their behalf`);
	lines.push('');

	// Counter-Notification
	lines.push(`## Counter-Notification Process`);
	lines.push('');
	lines.push(`If content you uploaded has been removed due to a DMCA notice, and you believe the removal was improper, you may submit a counter-notification. Your counter-notification must include:`);
	lines.push('');
	lines.push(`1. **Your Physical or Electronic Signature**`);
	lines.push('');
	lines.push(`2. **Identification of Removed Content:** Describe the content that was removed and its previous location on our website`);
	lines.push('');
	lines.push(`3. **Statement Under Penalty of Perjury:** Include the following: "I declare under penalty of perjury that I have a good faith belief that the removed material was removed by mistake or misidentification"`);
	lines.push('');
	lines.push(`4. **Your Contact Information:** Provide your name, address, telephone number, and email address`);
	lines.push('');
	lines.push(`5. **Consent to Jurisdiction:** Include a statement that you consent to the jurisdiction of the Federal District Court in the district where your address is located, or if your address is outside the United States, any federal court in which ${business.businessName} may be found`);
	lines.push('');
	lines.push(`Please note that submitting a false counter-notification may result in legal liability for damages.`);
	lines.push('');

	// Repeat Infringer Policy
	lines.push(`## Repeat Infringer Policy`);
	lines.push('');
	lines.push(`In accordance with the DMCA, ${business.businessName} has adopted a policy that provides for the termination, in appropriate circumstances, of user accounts that are determined to be repeat infringers of copyrighted material.`);
	lines.push('');
	lines.push(`A repeat infringer is a user who has been notified of infringing activity more than once. Upon receiving valid DMCA notices indicating that a user has repeatedly infringed copyrighted content, we will take action, which may include:`);
	lines.push('');
	lines.push(`- Removal of infringing content`);
	lines.push(`- Suspension of the user's account`);
	lines.push(`- Permanent termination of the user's account and access to our services`);
	lines.push('');

	// Designated Agent
	lines.push(`## Designated Copyright Agent`);
	lines.push('');
	lines.push(`To report copyright infringement, submit a DMCA notice to our Designated Copyright Agent:`);
	lines.push('');
	lines.push(`**${business.businessName}**`);
	lines.push('');
	lines.push(`Copyright Agent`);
	lines.push('');
	lines.push(`Email: ${business.contactEmail}`);
	lines.push('');
	lines.push(`Mailing Address:`);
	lines.push(`${business.contactAddress}`);
	lines.push('');
	lines.push(`Please clearly mark your submission as "DMCA Notice" in the subject line.`);
	lines.push('');

	// Processing Timeline
	lines.push(`## Processing Timeline`);
	lines.push('');
	lines.push(`Upon receiving a valid DMCA notice, we will:`);
	lines.push('');
	lines.push(`1. Investigate the claim promptly`);
	lines.push(`2. Remove or disable access to the allegedly infringing content if we determine the notice is valid`);
	lines.push(`3. Notify the content creator that content has been removed (if applicable)`);
	lines.push(`4. Respond to the notifying party regarding actions taken`);
	lines.push('');
	lines.push(`The processing timeline may vary depending on the complexity of the infringement claim and verification requirements.`);
	lines.push('');

	// No License
	lines.push(`## No License to Use Our Content`);
	lines.push('');
	lines.push(`Unless explicitly authorized, you do not have permission to:`);
	lines.push('');
	lines.push(`- Copy or reproduce content from our website`);
	lines.push(`- Modify or create derivative works`);
	lines.push(`- Distribute or publicly display our content`);
	lines.push(`- Sublicense our content to third parties`);
	lines.push('');

	// Disclaimer
	lines.push(`## Disclaimer`);
	lines.push('');
	lines.push(`${business.businessName} is not responsible for user-generated content posted to our website. If infringing content has been uploaded by a user, the user is solely responsible for that content. We do not endorse or support any infringing material and take allegations of copyright infringement seriously.`);
	lines.push('');

	// Contact
	lines.push(`## Contact Us`);
	lines.push('');
	lines.push(`For questions about this DMCA Compliance Statement or our copyright policies, please contact us at:`);
	lines.push('');
	lines.push(`**${business.businessName}**`);
	lines.push('');
	lines.push(`Email: ${business.contactEmail}`);
	lines.push('');
	lines.push(`Address: ${business.contactAddress}`);
	lines.push('');

	return lines.join('\n');
}

