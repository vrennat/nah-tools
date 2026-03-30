import mammoth from 'mammoth';
import type { ResumeData, PersonalInfo } from '$resume/types';

const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_REGEX = /(\+?1?\s*[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/;

const SECTION_KEYWORDS: Record<string, string> = {
	'professional summary': 'summary',
	'summary': 'summary',
	'work experience': 'experience',
	'experience': 'experience',
	'education': 'education',
	'skills': 'skills',
	'projects': 'projects',
	'certifications': 'certifications',
	'certificates': 'certifications'
};

interface ParsedSections {
	[key: string]: string[];
}

function parseSections(lines: string[]): ParsedSections {
	const sections: ParsedSections = {};
	let currentSection: string | null = null;

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		const lower = trimmed.toLowerCase();
		const sectionKey = SECTION_KEYWORDS[lower];
		if (sectionKey) {
			currentSection = sectionKey;
			if (!sections[currentSection]) sections[currentSection] = [];
			continue;
		}

		if (currentSection) {
			sections[currentSection].push(trimmed);
		}
	}

	return sections;
}

function extractPersonal(lines: string[]): Partial<PersonalInfo> {
	const personal: Partial<PersonalInfo> = {};

	// First non-empty line is typically the name
	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed) {
			personal.fullName = trimmed;
			break;
		}
	}

	// Scan all lines for email and phone
	const fullText = lines.join('\n');

	const emailMatch = fullText.match(EMAIL_REGEX);
	if (emailMatch) {
		personal.email = emailMatch[0];
	}

	const phoneMatch = fullText.match(PHONE_REGEX);
	if (phoneMatch) {
		personal.phone = phoneMatch[1].trim();
	}

	// Try to find location and links from the contact line (pipe-separated, typically line 2)
	for (const line of lines.slice(1, 5)) {
		const trimmed = line.trim();
		if (trimmed.includes('|')) {
			const parts = trimmed.split('|').map((p) => p.trim());
			for (const part of parts) {
				if (EMAIL_REGEX.test(part)) continue; // already captured
				if (PHONE_REGEX.test(part)) continue; // already captured
				if (part.includes('linkedin.com')) {
					personal.linkedin = part;
				} else if (part.includes('.') && (part.includes('http') || part.includes('.dev') || part.includes('.com') || part.includes('.io') || part.includes('.org'))) {
					personal.website = part;
				} else if (part.length > 0 && !personal.location) {
					personal.location = part;
				}
			}
			break;
		}
	}

	return personal;
}

function parseSkills(lines: string[]): { name: string; skills: string[] }[] {
	const categories: { name: string; skills: string[] }[] = [];
	for (const line of lines) {
		const colonIdx = line.indexOf(':');
		if (colonIdx > 0) {
			const name = line.slice(0, colonIdx).trim();
			const skills = line
				.slice(colonIdx + 1)
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			if (skills.length > 0) {
				categories.push({ name, skills });
			}
		}
	}
	return categories;
}

export async function importDOCX(blob: Blob): Promise<Partial<ResumeData>> {
	let text: string;
	try {
		const arrayBuffer = await blob.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const result = await mammoth.extractRawText({ buffer });
		text = result.value;
	} catch {
		throw new Error('Could not parse file. Please ensure it is a valid DOCX document.');
	}

	if (!text || text.trim().length === 0) {
		throw new Error('Could not parse file. Please ensure it is a valid DOCX document.');
	}

	const lines = text.split('\n');
	const personal = extractPersonal(lines);
	const sections = parseSections(lines);

	const resume: Partial<ResumeData> = {
		personal: {
			fullName: personal.fullName ?? '',
			email: personal.email ?? '',
			phone: personal.phone ?? '',
			location: personal.location ?? '',
			linkedin: personal.linkedin ?? '',
			website: personal.website ?? ''
		}
	};

	if (sections.summary && sections.summary.length > 0) {
		resume.summary = sections.summary.join(' ');
	}

	if (sections.skills) {
		const parsed = parseSkills(sections.skills);
		if (parsed.length > 0) {
			resume.skills = parsed.map((c) => ({
				id: crypto.randomUUID(),
				...c
			}));
		}
	}

	return resume;
}
