import type { ResumeData, JobMatchResult } from '$resume/types';
import { extractKeywords } from './keywords';
import { computeMatchScore, findMissingKeywords, findMatchedKeywords } from './matching';

export { extractKeywords } from './keywords';
export { computeMatchScore, findMissingKeywords, findMatchedKeywords } from './matching';
export { analyzeATSCompatibility, extractTextFromPDF } from './xray';

/**
 * Full pipeline: analyze how well a resume matches a job description.
 * Extracts keywords from both, computes overlap, and generates suggestions.
 */
export async function analyzeJobMatch(resume: ResumeData, jobDescription: string): Promise<JobMatchResult> {
	// Build resume text from all sections
	const resumeTextParts: string[] = [];
	const { personal, summary, experience, education, skills, projects, certifications } = resume;

	if (personal.fullName) resumeTextParts.push(personal.fullName);
	if (personal.location) resumeTextParts.push(personal.location);
	if (summary) resumeTextParts.push(summary);

	for (const exp of experience) {
		resumeTextParts.push(`${exp.title} ${exp.company}`);
		resumeTextParts.push(...exp.bullets);
	}

	for (const edu of education) {
		resumeTextParts.push(`${edu.degree} ${edu.field} ${edu.institution}`);
		if (edu.honors) resumeTextParts.push(edu.honors);
	}

	for (const cat of skills) {
		resumeTextParts.push(cat.name);
		resumeTextParts.push(...cat.skills);
	}

	for (const proj of projects) {
		resumeTextParts.push(proj.name);
		if (proj.description) resumeTextParts.push(proj.description);
		resumeTextParts.push(...proj.bullets);
	}

	for (const cert of certifications) {
		resumeTextParts.push(`${cert.name} ${cert.issuer}`);
	}

	for (const section of resume.customSections) {
		resumeTextParts.push(section.title);
		for (const entry of section.entries) {
			if (entry.primary) resumeTextParts.push(entry.primary);
			if (entry.secondary) resumeTextParts.push(entry.secondary);
			resumeTextParts.push(...entry.bullets);
		}
	}

	const resumeText = resumeTextParts.join(' ');
	const resumeKeywords = await extractKeywords(resumeText);
	const jobKeywords = await extractKeywords(jobDescription);

	const matched = findMatchedKeywords(resumeKeywords, jobKeywords);
	const missing = findMissingKeywords(resumeKeywords, jobKeywords);
	const score = computeMatchScore(resumeKeywords, jobKeywords);

	const suggestions: string[] = [];
	for (const kw of missing.slice(0, 10)) {
		suggestions.push(`Consider adding "${kw}" to your skills or experience section.`);
	}

	if (score < 50) {
		suggestions.push(
			'Your resume has low keyword overlap with this job description. Tailor your experience bullets to include more relevant terms.'
		);
	}

	return { score, matched, missing, suggestions };
}
