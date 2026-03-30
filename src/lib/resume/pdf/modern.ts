import type { ResumeData } from '../types';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { dateRange } from './shared';

const ACCENT = '#3b82f6';

function modernSectionHeader(title: string) {
	return {
		text: title,
		bold: true,
		fontSize: 12,
		color: ACCENT,
		margin: [0, 10, 0, 4] as [number, number, number, number]
	};
}

function sidebarSectionHeader(title: string) {
	return {
		text: title,
		bold: true,
		fontSize: 11,
		color: ACCENT,
		margin: [0, 10, 0, 4] as [number, number, number, number]
	};
}

export function buildModern(data: ResumeData): TDocumentDefinitions {
	// Build sidebar content
	const sidebar: Content[] = [];

	// Contact info in sidebar
	sidebar.push(sidebarSectionHeader('Contact'));
	const contactFields = [
		data.personal.email,
		data.personal.phone,
		data.personal.location,
		data.personal.linkedin,
		data.personal.website
	].filter(Boolean);
	for (const field of contactFields) {
		sidebar.push({ text: field, fontSize: 9, margin: [0, 1, 0, 1] });
	}

	// Skills in sidebar
	if (data.skills.length > 0) {
		sidebar.push(sidebarSectionHeader('Skills'));
		for (const cat of data.skills) {
			sidebar.push({
				text: cat.name,
				bold: true,
				fontSize: 9,
				margin: [0, 4, 0, 1]
			});
			sidebar.push({
				text: cat.skills.join(', '),
				fontSize: 9,
				margin: [0, 0, 0, 2]
			});
		}
	}

	// Certifications in sidebar
	if (data.certifications.length > 0) {
		sidebar.push(sidebarSectionHeader('Certifications'));
		for (const cert of data.certifications) {
			sidebar.push({
				text: cert.name,
				bold: true,
				fontSize: 9,
				margin: [0, 2, 0, 0]
			});
			sidebar.push({
				text: cert.issuer,
				fontSize: 8,
				color: '#666666',
				margin: [0, 0, 0, 4]
			});
		}
	}

	// Build main content
	const main: Content[] = [];

	// Name at top of main column
	main.push({
		text: data.personal.fullName,
		fontSize: 20,
		bold: true,
		color: ACCENT,
		margin: [0, 0, 0, 6]
	});

	// Summary
	if (data.summary) {
		main.push(modernSectionHeader('Summary'));
		main.push({ text: data.summary, fontSize: 10, margin: [0, 0, 0, 4] });
	}

	// Experience
	if (data.experience.length > 0) {
		main.push(modernSectionHeader('Experience'));
		for (const exp of data.experience) {
			main.push({
				text: exp.title,
				bold: true,
				fontSize: 11,
				margin: [0, 4, 0, 0]
			});
			main.push({
				text: `${exp.company}${exp.location ? ', ' + exp.location : ''} | ${dateRange(exp.startDate, exp.endDate)}`,
				fontSize: 9,
				color: '#666666',
				margin: [0, 1, 0, 2]
			});
			if (exp.bullets.length > 0) {
				main.push({
					ul: exp.bullets.map((b) => ({ text: b, fontSize: 9 })),
					margin: [8, 0, 0, 4]
				});
			}
		}
	}

	// Education
	if (data.education.length > 0) {
		main.push(modernSectionHeader('Education'));
		for (const edu of data.education) {
			main.push({
				text: edu.institution,
				bold: true,
				fontSize: 11,
				margin: [0, 4, 0, 0]
			});
			main.push({
				text: `${edu.degree}${edu.field ? ' in ' + edu.field : ''} | ${dateRange(edu.startDate, edu.endDate)}`,
				fontSize: 9,
				color: '#666666',
				margin: [0, 1, 0, 2]
			});
			const details: string[] = [];
			if (edu.gpa) details.push(`GPA: ${edu.gpa}`);
			if (edu.honors) details.push(edu.honors);
			if (details.length > 0) {
				main.push({ text: details.join('  |  '), fontSize: 9, color: '#666666', margin: [0, 0, 0, 4] });
			}
		}
	}

	// Projects
	if (data.projects.length > 0) {
		main.push(modernSectionHeader('Projects'));
		for (const proj of data.projects) {
			main.push({
				text: proj.name,
				bold: true,
				fontSize: 10,
				margin: [0, 4, 0, 0]
			});
			if (proj.description) {
				main.push({ text: proj.description, fontSize: 9, margin: [0, 1, 0, 2] });
			}
			if (proj.bullets.length > 0) {
				main.push({
					ul: proj.bullets.map((b) => ({ text: b, fontSize: 9 })),
					margin: [8, 0, 0, 4]
				});
			}
		}
	}

	// Custom Sections
	for (const section of data.customSections) {
		if (section.entries.length > 0) {
			main.push(modernSectionHeader(section.title));
			for (const entry of section.entries) {
				main.push({
					text: entry.primary,
					bold: true,
					fontSize: 10,
					margin: [0, 4, 0, 0]
				});
				if (entry.secondary) {
					main.push({ text: entry.secondary, fontSize: 9, color: '#666666', margin: [0, 1, 0, 2] });
				}
				if (entry.bullets.length > 0) {
					main.push({
						ul: entry.bullets.map((b) => ({ text: b, fontSize: 9 })),
						margin: [8, 0, 0, 4]
					});
				}
			}
		}
	}

	const content: Content[] = [
		{
			columns: [
				{
					width: '30%',
					stack: sidebar
				},
				{
					width: '70%',
					stack: main
				}
			],
			columnGap: 20
		}
	];

	return {
		content,
		pageMargins: [40, 40, 40, 40],
		defaultStyle: {
			font: 'Roboto'
		}
	};
}
