import type { ResumeData } from '../types';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { dateRange, contactLine } from './shared';

export function buildMinimal(data: ResumeData): TDocumentDefinitions {
	const content: Content[] = [];

	// Name — left-aligned, understated
	content.push({
		text: data.personal.fullName,
		fontSize: 18,
		margin: [0, 0, 0, 4]
	});

	// Contact info
	const contact = contactLine(data.personal);
	if (contact) {
		content.push({
			text: contact,
			fontSize: 9,
			color: '#333333',
			margin: [0, 0, 0, 16]
		});
	}

	// Summary
	if (data.summary) {
		content.push(minimalSectionHeader('Summary'));
		content.push({ text: data.summary, fontSize: 10, margin: [0, 4, 0, 8] });
	}

	// Experience
	if (data.experience.length > 0) {
		content.push(minimalSectionHeader('Experience'));
		for (const exp of data.experience) {
			content.push({
				text: exp.title,
				fontSize: 11,
				margin: [0, 6, 0, 0]
			});
			content.push({
				text: `${exp.company}${exp.location ? ', ' + exp.location : ''}  —  ${dateRange(exp.startDate, exp.endDate)}`,
				fontSize: 9,
				color: '#333333',
				margin: [0, 2, 0, 4]
			});
			if (exp.bullets.length > 0) {
				content.push({
					ul: exp.bullets.map((b) => ({ text: b, fontSize: 10 })),
					margin: [8, 0, 0, 6]
				});
			}
		}
	}

	// Education
	if (data.education.length > 0) {
		content.push(minimalSectionHeader('Education'));
		for (const edu of data.education) {
			content.push({
				text: edu.institution,
				fontSize: 11,
				margin: [0, 6, 0, 0]
			});
			content.push({
				text: `${edu.degree}${edu.field ? ' in ' + edu.field : ''}  —  ${dateRange(edu.startDate, edu.endDate)}`,
				fontSize: 9,
				color: '#333333',
				margin: [0, 2, 0, 4]
			});
			const details: string[] = [];
			if (edu.gpa) details.push(`GPA: ${edu.gpa}`);
			if (edu.honors) details.push(edu.honors);
			if (details.length > 0) {
				content.push({ text: details.join('  |  '), fontSize: 9, color: '#333333', margin: [0, 0, 0, 6] });
			}
		}
	}

	// Skills
	if (data.skills.length > 0) {
		content.push(minimalSectionHeader('Skills'));
		for (const cat of data.skills) {
			content.push({
				text: [
					{ text: `${cat.name}: `, fontSize: 10 },
					{ text: cat.skills.join(', '), fontSize: 10 }
				],
				margin: [0, 2, 0, 2]
			});
		}
	}

	// Projects
	if (data.projects.length > 0) {
		content.push(minimalSectionHeader('Projects'));
		for (const proj of data.projects) {
			content.push({
				text: proj.name,
				fontSize: 11,
				margin: [0, 6, 0, 0]
			});
			if (proj.description) {
				content.push({ text: proj.description, fontSize: 10, margin: [0, 2, 0, 4] });
			}
			if (proj.bullets.length > 0) {
				content.push({
					ul: proj.bullets.map((b) => ({ text: b, fontSize: 10 })),
					margin: [8, 0, 0, 6]
				});
			}
		}
	}

	// Certifications
	if (data.certifications.length > 0) {
		content.push(minimalSectionHeader('Certifications'));
		for (const cert of data.certifications) {
			content.push({
				text: `${cert.name} — ${cert.issuer}`,
				fontSize: 10,
				margin: [0, 2, 0, 2]
			});
		}
	}

	// Custom Sections
	for (const section of data.customSections) {
		if (section.entries.length > 0) {
			content.push(minimalSectionHeader(section.title));
			for (const entry of section.entries) {
				content.push({
					text: entry.primary,
					fontSize: 11,
					margin: [0, 6, 0, 0]
				});
				if (entry.secondary) {
					content.push({ text: entry.secondary, fontSize: 10, color: '#333333', margin: [0, 2, 0, 4] });
				}
				if (entry.bullets.length > 0) {
					content.push({
						ul: entry.bullets.map((b) => ({ text: b, fontSize: 10 })),
						margin: [8, 0, 0, 6]
					});
				}
			}
		}
	}

	return {
		content,
		pageMargins: [50, 50, 50, 50],
		defaultStyle: {
			font: 'Roboto'
		}
	};
}

function minimalSectionHeader(title: string) {
	return {
		text: title,
		fontSize: 11,
		color: '#333333',
		margin: [0, 16, 0, 4] as [number, number, number, number]
	};
}
