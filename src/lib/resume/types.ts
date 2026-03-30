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
			fullName: 'Jane Doe',
			email: 'jane.doe@example.com',
			phone: '(555) 000-1234',
			location: 'Austin, TX',
			linkedin: 'linkedin.com/in/example',
			website: 'example.com'
		},
		summary:
			'Senior software engineer with 8+ years of experience designing and shipping scalable distributed systems, developer tools, and data pipelines. Track record of leading cross-functional teams, driving architecture decisions, and mentoring engineers. Deeply motivated by developer experience and operational reliability.',
		experience: [
			{
				id: createId(),
				company: 'Horizon Technologies',
				title: 'Staff Software Engineer',
				location: 'Austin, TX',
				startDate: '2023-01',
				endDate: 'Present',
				bullets: [
					'Architected event-driven ingestion pipeline processing 12M+ events/day with sub-100ms p99 latency, replacing a batch system that ran 6 hours behind',
					'Led a team of 5 engineers to deliver a self-service feature flagging platform adopted by 40+ internal teams within 3 months of launch',
					'Reduced infrastructure costs by $180K/year by profiling and right-sizing Kubernetes workloads across 3 production clusters',
					'Established engineering RFC process and authored 8 design documents that shaped the platform roadmap'
				]
			},
			{
				id: createId(),
				company: 'Nimbus Cloud',
				title: 'Senior Software Engineer',
				location: 'Remote',
				startDate: '2020-04',
				endDate: '2022-12',
				bullets: [
					'Designed and built a multi-tenant API gateway handling 5M+ requests/day with 99.95% uptime SLA',
					'Implemented zero-downtime database migration strategy for PostgreSQL clusters serving 200+ microservices',
					'Created internal CLI tool for service scaffolding that cut new service setup time from 2 days to 15 minutes',
					'Mentored 6 engineers across two teams, with 3 earning promotions within 18 months'
				]
			},
			{
				id: createId(),
				company: 'Greenfield Labs',
				title: 'Software Engineer',
				location: 'Denver, CO',
				startDate: '2017-06',
				endDate: '2020-03',
				bullets: [
					'Built real-time collaboration features for a document editor serving 50K+ daily active users',
					'Developed CI/CD pipeline with automated canary deployments, reducing production incidents by 40%',
					'Designed and shipped a notification system processing 1M+ daily messages across email, SMS, and push channels'
				]
			}
		],
		education: [
			{
				id: createId(),
				institution: 'University of Texas at Austin',
				degree: 'B.S.',
				field: 'Computer Science',
				startDate: '2013-08',
				endDate: '2017-05',
				gpa: '3.8',
				honors: 'Summa Cum Laude, Dean\'s List'
			}
		],
		skills: [
			{
				id: createId(),
				name: 'Languages',
				skills: ['TypeScript', 'Go', 'Python', 'Rust', 'SQL']
			},
			{
				id: createId(),
				name: 'Frameworks & Libraries',
				skills: ['React', 'Node.js', 'Next.js', 'FastAPI', 'gRPC']
			},
			{
				id: createId(),
				name: 'Infrastructure',
				skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Kafka', 'PostgreSQL', 'Redis']
			},
			{
				id: createId(),
				name: 'Practices',
				skills: ['System Design', 'CI/CD', 'Observability', 'Incident Response', 'Technical Writing']
			}
		],
		projects: [
			{
				id: createId(),
				name: 'OpenTrace',
				description: 'Open-source distributed tracing toolkit for Node.js microservices. 2.4K GitHub stars.',
				url: 'github.com/example/opentrace',
				bullets: [
					'Automatic instrumentation for Express, Fastify, and gRPC with zero config',
					'Adopted by 3 companies in production after a conference talk at NodeConf'
				]
			}
		],
		certifications: [
			{
				id: createId(),
				name: 'AWS Solutions Architect - Professional',
				issuer: 'Amazon Web Services',
				date: '2023-06',
				url: ''
			}
		],
		customSections: [],
		createdAt: now,
		updatedAt: now
	};
}
