import type { PersonalInfo } from '../types';

const MONTHS = [
	'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function formatDate(dateStr: string): string {
	if (!dateStr) return 'Present';
	const [year, month] = dateStr.split('-');
	if (!month) return year;
	const monthIndex = parseInt(month, 10) - 1;
	return `${MONTHS[monthIndex] ?? month} ${year}`;
}

export function dateRange(start: string, end: string): string {
	return `${formatDate(start)} – ${formatDate(end)}`;
}

export function sectionHeader(title: string, color: string = '#000000') {
	return [
		{ text: title, style: 'sectionHeader', color, bold: true, fontSize: 13, margin: [0, 12, 0, 4] as [number, number, number, number] },
		horizontalLine()
	];
}

export function horizontalLine() {
	return {
		canvas: [
			{
				type: 'line' as const,
				x1: 0,
				y1: 0,
				x2: 515,
				y2: 0,
				lineWidth: 0.5,
				lineColor: '#cccccc'
			}
		],
		margin: [0, 0, 0, 6] as [number, number, number, number]
	};
}

export function spacer(points: number = 8) {
	return { text: '', margin: [0, points, 0, 0] as [number, number, number, number] };
}

export function contactLine(personal: PersonalInfo): string {
	const parts: string[] = [];
	if (personal.email) parts.push(personal.email);
	if (personal.phone) parts.push(personal.phone);
	if (personal.location) parts.push(personal.location);
	if (personal.linkedin) parts.push(personal.linkedin);
	if (personal.website) parts.push(personal.website);
	return parts.join('  |  ');
}
