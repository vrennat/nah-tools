import type { ResumeData } from './types';

export function createMockResume(overrides?: Partial<ResumeData>): ResumeData {
	return {
		id: crypto.randomUUID(),
		name: 'Test Resume',
		template: 'professional',
		personal: {
			fullName: 'Jane Smith',
			email: 'jane@example.com',
			phone: '(555) 123-4567',
			location: 'San Francisco, CA',
			linkedin: 'linkedin.com/in/janesmith',
			website: 'janesmith.dev'
		},
		summary:
			'Senior software engineer with 8 years of experience building scalable web applications. Proficient in TypeScript, React, and distributed systems.',
		experience: [
			{
				id: crypto.randomUUID(),
				company: 'Acme Corp',
				title: 'Senior Software Engineer',
				location: 'San Francisco, CA',
				startDate: '2021-01',
				endDate: '',
				bullets: [
					'Led migration of monolithic API to microservices, reducing p99 latency by 40%',
					'Mentored team of 4 junior engineers through quarterly growth reviews',
					'Designed and implemented real-time notification system serving 2M daily active users'
				]
			},
			{
				id: crypto.randomUUID(),
				company: 'StartupXYZ',
				title: 'Software Engineer',
				location: 'Remote',
				startDate: '2018-06',
				endDate: '2021-01',
				bullets: [
					'Built React component library used across 3 product teams',
					'Implemented CI/CD pipeline reducing deployment time from 45 minutes to 8 minutes',
					'Contributed to open-source GraphQL tooling with 2K+ GitHub stars'
				]
			}
		],
		education: [
			{
				id: crypto.randomUUID(),
				institution: 'University of California, Berkeley',
				degree: 'Bachelor of Science',
				field: 'Computer Science',
				startDate: '2014-08',
				endDate: '2018-05',
				gpa: '3.8',
				honors: 'Magna Cum Laude'
			}
		],
		skills: [
			{
				id: crypto.randomUUID(),
				name: 'Languages',
				skills: ['TypeScript', 'Python', 'Go', 'SQL']
			},
			{
				id: crypto.randomUUID(),
				name: 'Frameworks',
				skills: ['React', 'Node.js', 'Next.js', 'FastAPI']
			},
			{
				id: crypto.randomUUID(),
				name: 'Tools',
				skills: ['AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis']
			}
		],
		projects: [
			{
				id: crypto.randomUUID(),
				name: 'Open Source CLI Tool',
				url: 'https://github.com/janesmith/cli-tool',
				description: 'A developer productivity CLI with 1.5K GitHub stars',
				bullets: [
					'Built plugin system supporting 20+ community extensions',
					'Achieved 95% test coverage with integration and unit tests'
				]
			}
		],
		certifications: [
			{
				id: crypto.randomUUID(),
				name: 'AWS Solutions Architect',
				issuer: 'Amazon Web Services',
				date: '2023-03',
				url: ''
			}
		],
		customSections: [],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		...overrides
	};
}

export function createMinimalResume(overrides?: Partial<ResumeData>): ResumeData {
	return {
		id: crypto.randomUUID(),
		name: 'Minimal Resume',
		template: 'professional',
		personal: {
			fullName: 'John Doe',
			email: 'john@example.com',
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
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		...overrides
	};
}
