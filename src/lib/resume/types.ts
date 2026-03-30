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

export function createSampleResume(): ResumeData {
	const now = new Date().toISOString();
	return {
		id: createId(),
		name: 'Sample Resume',
		template: 'professional',
		personal: {
			fullName: 'Alex Johnson',
			email: 'alex.johnson@email.com',
			phone: '(555) 123-4567',
			location: 'San Francisco, CA',
			linkedin: 'linkedin.com/in/alexjohnson',
			website: 'alexjohnson.dev'
		},
		summary:
			'Full-stack engineer with 5 years of experience building web applications. Passionate about clean code, accessible interfaces, and shipping products that solve real problems.',
		experience: [
			{
				id: createId(),
				company: 'Acme Corp',
				title: 'Senior Software Engineer',
				location: 'San Francisco, CA',
				startDate: '2022-03',
				endDate: 'Present',
				bullets: [
					'Led migration from legacy monolith to microservices, reducing deploy times by 70%',
					'Built real-time analytics dashboard used by 500+ internal users',
					'Mentored 3 junior engineers through onboarding and first production features'
				]
			},
			{
				id: createId(),
				company: 'StartupCo',
				title: 'Software Engineer',
				location: 'Remote',
				startDate: '2019-06',
				endDate: '2022-02',
				bullets: [
					'Developed customer-facing API serving 2M+ requests/day with 99.9% uptime',
					'Implemented CI/CD pipeline that cut release cycle from 2 weeks to daily',
					'Designed and built onboarding flow that improved trial-to-paid conversion by 25%'
				]
			}
		],
		education: [
			{
				id: createId(),
				institution: 'University of California, Berkeley',
				degree: 'B.S.',
				field: 'Computer Science',
				startDate: '2015-08',
				endDate: '2019-05',
				gpa: '3.7',
				honors: 'Magna Cum Laude'
			}
		],
		skills: [
			{
				id: createId(),
				name: 'Languages',
				skills: ['TypeScript', 'Python', 'Go', 'SQL']
			},
			{
				id: createId(),
				name: 'Frameworks',
				skills: ['React', 'Node.js', 'Next.js', 'FastAPI']
			},
			{
				id: createId(),
				name: 'Tools',
				skills: ['Git', 'Docker', 'AWS', 'PostgreSQL', 'Redis']
			}
		],
		projects: [],
		certifications: [],
		customSections: [],
		createdAt: now,
		updatedAt: now
	};
}
