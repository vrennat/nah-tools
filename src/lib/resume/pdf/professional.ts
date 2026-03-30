import type { ResumeData } from '../types';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { sectionHeader, dateRange, contactLine } from './shared';

export function buildProfessional(data: ResumeData): TDocumentDefinitions {
	const content: Content[] = [];

	// Name
	content.push({
		text: data.personal.fullName,
		fontSize: 22,
		bold: true,
		alignment: 'center',
		margin: [0, 0, 0, 4]
	});

	// Contact info
	const contact = contactLine(data.personal);
	if (contact) {
		content.push({
			text: contact,
			fontSize: 9,
			alignment: 'center',
			color: '#555555',
			margin: [0, 0, 0, 12]
		});
	}

	// Summary
	if (data.summary) {
		content.push(...sectionHeader('Summary'));
		content.push({ text: data.summary, fontSize: 10, margin: [0, 2, 0, 0] });
	}

	// Experience
	if (data.experience.length > 0) {
		content.push(...sectionHeader('Experience'));
		for (const exp of data.experience) {
			content.push({
				text: exp.title,
				bold: true,
				fontSize: 11,
				margin: [0, 4, 0, 0]
			});
			content.push({
				columns: [
					{ text: `${exp.company}${exp.location ? ', ' + exp.location : ''}`, fontSize: 10, color: '#444444' },
					{ text: dateRange(exp.startDate, exp.endDate), fontSize: 10, color: '#444444', alignment: 'right' }
				],
				margin: [0, 1, 0, 2]
			});
			if (exp.bullets.length > 0) {
				content.push({
					ul: exp.bullets.map((b) => ({ text: b, fontSize: 10 })),
					margin: [10, 0, 0, 4]
				});
			}
		}
	}

	// Education
	if (data.education.length > 0) {
		content.push(...sectionHeader('Education'));
		for (const edu of data.education) {
			content.push({
				text: edu.institution,
				bold: true,
				fontSize: 11,
				margin: [0, 4, 0, 0]
			});
			content.push({
				columns: [
					{ text: `${edu.degree}${edu.field ? ' in ' + edu.field : ''}`, fontSize: 10, color: '#444444' },
					{ text: dateRange(edu.startDate, edu.endDate), fontSize: 10, color: '#444444', alignment: 'right' }
				],
				margin: [0, 1, 0, 2]
			});
			const details: string[] = [];
			if (edu.gpa) details.push(`GPA: ${edu.gpa}`);
			if (edu.honors) details.push(edu.honors);
			if (details.length > 0) {
				content.push({ text: details.join('  |  '), fontSize: 9, color: '#666666', margin: [0, 0, 0, 4] });
			}
		}
	}

	// Skills
	if (data.skills.length > 0) {
		content.push(...sectionHeader('Skills'));
		for (const cat of data.skills) {
			content.push({
				text: [
					{ text: `${cat.name}: `, bold: true, fontSize: 10 },
					{ text: cat.skills.join(', '), fontSize: 10 }
				],
				margin: [0, 2, 0, 2]
			});
		}
	}

	// Projects
	if (data.projects.length > 0) {
		content.push(...sectionHeader('Projects'));
		for (const proj of data.projects) {
			content.push({
				text: proj.name,
				bold: true,
				fontSize: 11,
				margin: [0, 4, 0, 0]
			});
			if (proj.description) {
				content.push({ text: proj.description, fontSize: 10, margin: [0, 1, 0, 2] });
			}
			if (proj.bullets.length > 0) {
				content.push({
					ul: proj.bullets.map((b) => ({ text: b, fontSize: 10 })),
					margin: [10, 0, 0, 4]
				});
			}
		}
	}

	// Certifications
	if (data.certifications.length > 0) {
		content.push(...sectionHeader('Certifications'));
		for (const cert of data.certifications) {
			content.push({
				text: [
					{ text: cert.name, bold: true, fontSize: 10 },
					{ text: ` — ${cert.issuer}`, fontSize: 10, color: '#666666' }
				],
				margin: [0, 2, 0, 2]
			});
		}
	}

	// Custom Sections
	for (const section of data.customSections) {
		if (section.entries.length > 0) {
			content.push(...sectionHeader(section.title));
			for (const entry of section.entries) {
				content.push({
					text: entry.primary,
					bold: true,
					fontSize: 11,
					margin: [0, 4, 0, 0]
				});
				if (entry.secondary) {
					content.push({ text: entry.secondary, fontSize: 10, color: '#444444', margin: [0, 1, 0, 2] });
				}
				if (entry.bullets.length > 0) {
					content.push({
						ul: entry.bullets.map((b) => ({ text: b, fontSize: 10 })),
						margin: [10, 0, 0, 4]
					});
				}
			}
		}
	}

	return {
		content,
		pageMargins: [40, 40, 40, 40],
		defaultStyle: {
			font: 'Roboto'
		}
	};
}
