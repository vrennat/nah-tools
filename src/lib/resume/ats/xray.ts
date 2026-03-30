import type { ResumeData, ATSAnalysis } from '$resume/types';

/**
 * Analyze a ResumeData object for ATS compatibility.
 * Checks contact info, standard sections, and content quality.
 */
export function analyzeATSCompatibility(resume: ResumeData): ATSAnalysis {
	const issues: string[] = [];
	const suggestions: string[] = [];
	let score = 100;

	const { personal, summary, experience, education, skills } = resume;

	// Contact info checks
	if (!personal.email) {
		issues.push('Missing email address — most ATS systems require an email for contact.');
		suggestions.push('Add your email address to the contact information section.');
		score -= 15;
	}

	if (!personal.phone) {
		issues.push('Missing phone number.');
		suggestions.push('Add a phone number for recruiter follow-up.');
		score -= 5;
	}

	if (!personal.fullName) {
		issues.push('Missing full name.');
		suggestions.push('Add your full name at the top of your resume.');
		score -= 15;
	}

	// Standard sections
	if (experience.length === 0) {
		issues.push('No work experience section found — ATS parsers expect a work history.');
		suggestions.push('Add at least one work experience entry.');
		score -= 20;
	}

	if (education.length === 0) {
		issues.push('No education section found.');
		suggestions.push('Add your educational background.');
		score -= 10;
	}

	if (skills.length === 0) {
		issues.push('No skills section found — many ATS systems scan for a dedicated skills list.');
		suggestions.push('Add a skills section with relevant technical and soft skills.');
		score -= 10;
	}

	// Content quality
	if (!summary) {
		issues.push('No professional summary provided.');
		suggestions.push('Add a concise professional summary to improve ATS parsing and recruiter engagement.');
		score -= 10;
	}

	// Check experience entries for empty bullets
	for (const entry of experience) {
		if (entry.bullets.length === 0 || entry.bullets.every((b) => !b.trim())) {
			issues.push(
				`Work experience entry "${entry.company}" has no bullet points describing responsibilities.`
			);
			suggestions.push(
				`Add accomplishment-focused bullet points to your "${entry.company}" experience entry.`
			);
			score -= 5;
		}
	}

	// Build extracted text from resume data
	const textParts: string[] = [];
	if (personal.fullName) textParts.push(personal.fullName);
	if (personal.email) textParts.push(personal.email);
	if (personal.phone) textParts.push(personal.phone);
	if (personal.location) textParts.push(personal.location);
	if (summary) textParts.push(summary);
	for (const exp of experience) {
		textParts.push(`${exp.title} at ${exp.company}`);
		textParts.push(...exp.bullets);
	}
	for (const edu of education) {
		textParts.push(`${edu.degree} ${edu.field} ${edu.institution}`);
	}
	for (const cat of skills) {
		textParts.push(...cat.skills);
	}

	const sections = [
		{ name: 'Contact Information', found: !!(personal.email && personal.fullName) },
		{ name: 'Professional Summary', found: !!summary },
		{ name: 'Work Experience', found: experience.length > 0 },
		{ name: 'Education', found: education.length > 0 },
		{ name: 'Skills', found: skills.length > 0 }
	];

	return {
		score: Math.max(0, score),
		extractedText: textParts.join('\n'),
		sections,
		issues,
		suggestions
	};
}

/**
 * Extract text from a PDF blob using pdfjs-dist.
 * Lazily imports pdfjs-dist to avoid SSR issues.
 * This is meant for UI use, not for tests.
 */
export async function extractTextFromPDF(pdfBlob: Blob): Promise<string> {
	const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
	const arrayBuffer = await pdfBlob.arrayBuffer();
	const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
	const textParts: string[] = [];
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);
		const content = await page.getTextContent();
		textParts.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
	}
	return textParts.join('\n');
}
