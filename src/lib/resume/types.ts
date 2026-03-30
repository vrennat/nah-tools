export type TemplateId = 'professional' | 'modern' | 'minimal';

export interface PersonalInfo {
	fullName: string;
	email: string;
	phone: string;
	location: string;
	linkedin: string;
	website: string;
}

export interface ExperienceEntry {
	id: string;
	company: string;
	title: string;
	location: string;
	startDate: string;
	endDate: string;
	bullets: string[];
}

export interface EducationEntry {
	id: string;
	institution: string;
	degree: string;
	field: string;
	startDate: string;
	endDate: string;
	gpa: string;
	honors: string;
}

export interface SkillCategory {
	id: string;
	name: string;
	skills: string[];
}

export interface ProjectEntry {
	id: string;
	name: string;
	url: string;
	description: string;
	bullets: string[];
}

export interface CertificationEntry {
	id: string;
	name: string;
	issuer: string;
	date: string;
	url: string;
}

export interface CustomSectionEntry {
	id: string;
	primary: string;
	secondary: string;
	bullets: string[];
}

export interface CustomSection {
	id: string;
	title: string;
	entries: CustomSectionEntry[];
}

export interface ResumeData {
	id: string;
	name: string;
	template: TemplateId;
	personal: PersonalInfo;
	summary: string;
	experience: ExperienceEntry[];
	education: EducationEntry[];
	skills: SkillCategory[];
	projects: ProjectEntry[];
	certifications: CertificationEntry[];
	customSections: CustomSection[];
	createdAt: string;
	updatedAt: string;
	masterResumeId?: string;
	jobDescription?: string;
}

export interface ResumeMetadata {
	id: string;
	name: string;
	template: TemplateId;
	updatedAt: string;
	masterResumeId?: string;
}

export interface ATSAnalysis {
	score: number;
	extractedText: string;
	sections: { name: string; found: boolean }[];
	issues: string[];
	suggestions: string[];
}

export interface JobMatchResult {
	score: number;
	matched: string[];
	missing: string[];
	suggestions: string[];
}

export function createId(): string {
	return crypto.randomUUID();
}

export function createEmptyResume(): ResumeData {
	const now = new Date().toISOString();
	return {
		id: createId(),
		name: 'Untitled Resume',
		template: 'professional',
		personal: {
			fullName: '',
			email: '',
			phone: '',
			location: '',
			linkedin: '',
			website: ''
		},
		summary: '',
		experience: [],
		education: [],
		skills: [],
		projects: [],
		certifications: [],
		customSections: [],
		createdAt: now,
		updatedAt: now
	};
}
