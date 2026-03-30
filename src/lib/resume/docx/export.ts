import {
	Document,
	Packer,
	Paragraph,
	TextRun,
	HeadingLevel,
	AlignmentType,
	BorderStyle
} from 'docx';
import type { ResumeData } from '$resume/types';

function sectionHeader(text: string): Paragraph {
	return new Paragraph({
		heading: HeadingLevel.HEADING_2,
		spacing: { before: 300, after: 100 },
		border: {
			bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' }
		},
		children: [new TextRun({ text, bold: true, size: 24 })]
	});
}

function bulletParagraph(text: string): Paragraph {
	return new Paragraph({
		bullet: { level: 0 },
		spacing: { after: 40 },
		children: [new TextRun({ text, size: 20 })]
	});
}

function textParagraph(text: string, options?: { bold?: boolean; spacing?: { before?: number; after?: number } }): Paragraph {
	return new Paragraph({
		spacing: options?.spacing ?? { after: 60 },
		children: [new TextRun({ text, size: 20, bold: options?.bold })]
	});
}

export function buildDocxDocument(data: ResumeData): Document {
	const children: Paragraph[] = [];

	// Name (title)
	children.push(
		new Paragraph({
			alignment: AlignmentType.CENTER,
			spacing: { after: 100 },
			children: [new TextRun({ text: data.personal.fullName, bold: true, size: 32 })]
		})
	);

	// Contact line
	const contactParts = [
		data.personal.email,
		data.personal.phone,
		data.personal.location,
		data.personal.linkedin,
		data.personal.website
	].filter(Boolean);

	if (contactParts.length > 0) {
		children.push(
			new Paragraph({
				alignment: AlignmentType.CENTER,
				spacing: { after: 200 },
				children: [new TextRun({ text: contactParts.join(' | '), size: 20 })]
			})
		);
	}

	// Summary
	if (data.summary) {
		children.push(sectionHeader('Professional Summary'));
		children.push(textParagraph(data.summary));
	}

	// Experience
	if (data.experience.length > 0) {
		children.push(sectionHeader('Work Experience'));
		for (const exp of data.experience) {
			const titleLine = `${exp.title} at ${exp.company}`;
			children.push(textParagraph(titleLine, { bold: true, spacing: { before: 120, after: 40 } }));

			const meta: string[] = [];
			if (exp.location) meta.push(exp.location);
			const dateRange = [exp.startDate, exp.endDate || 'Present'].filter(Boolean).join(' - ');
			if (dateRange) meta.push(dateRange);
			if (meta.length > 0) {
				children.push(textParagraph(meta.join(' | '), { spacing: { after: 40 } }));
			}

			for (const bullet of exp.bullets) {
				children.push(bulletParagraph(bullet));
			}
		}
	}

	// Education
	if (data.education.length > 0) {
		children.push(sectionHeader('Education'));
		for (const edu of data.education) {
			const parts = [edu.degree, edu.field].filter(Boolean);
			const degreeLine = parts.length > 0 ? `${parts.join(' in ')} at ${edu.institution}` : edu.institution;
			children.push(textParagraph(degreeLine, { bold: true, spacing: { before: 120, after: 40 } }));

			const meta: string[] = [];
			const dateRange = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
			if (dateRange) meta.push(dateRange);
			if (edu.gpa) meta.push(`GPA: ${edu.gpa}`);
			if (edu.honors) meta.push(edu.honors);
			if (meta.length > 0) {
				children.push(textParagraph(meta.join(' | '), { spacing: { after: 40 } }));
			}
		}
	}

	// Skills
	if (data.skills.length > 0) {
		children.push(sectionHeader('Skills'));
		for (const cat of data.skills) {
			children.push(
				new Paragraph({
					spacing: { after: 40 },
					children: [
						new TextRun({ text: `${cat.name}: `, bold: true, size: 20 }),
						new TextRun({ text: cat.skills.join(', '), size: 20 })
					]
				})
			);
		}
	}

	// Projects
	if (data.projects.length > 0) {
		children.push(sectionHeader('Projects'));
		for (const proj of data.projects) {
			const nameText = proj.url ? `${proj.name} (${proj.url})` : proj.name;
			children.push(textParagraph(nameText, { bold: true, spacing: { before: 120, after: 40 } }));
			if (proj.description) {
				children.push(textParagraph(proj.description, { spacing: { after: 40 } }));
			}
			for (const bullet of proj.bullets) {
				children.push(bulletParagraph(bullet));
			}
		}
	}

	// Certifications
	if (data.certifications.length > 0) {
		children.push(sectionHeader('Certifications'));
		for (const cert of data.certifications) {
			const parts = [cert.name];
			if (cert.issuer) parts.push(cert.issuer);
			if (cert.date) parts.push(cert.date);
			children.push(textParagraph(parts.join(' — '), { spacing: { after: 40 } }));
		}
	}

	// Custom sections
	for (const section of data.customSections) {
		if (section.entries.length === 0) continue;
		children.push(sectionHeader(section.title));
		for (const entry of section.entries) {
			if (entry.primary) {
				children.push(textParagraph(entry.primary, { bold: true, spacing: { before: 120, after: 40 } }));
			}
			if (entry.secondary) {
				children.push(textParagraph(entry.secondary, { spacing: { after: 40 } }));
			}
			for (const bullet of entry.bullets) {
				children.push(bulletParagraph(bullet));
			}
		}
	}

	return new Document({
		sections: [
			{
				properties: {},
				children
			}
		]
	});
}

export async function exportDOCX(data: ResumeData): Promise<Blob> {
	const doc = buildDocxDocument(data);
	const blob = await Packer.toBlob(doc);
	return blob;
}
