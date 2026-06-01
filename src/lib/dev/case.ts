// Text case conversions. Each transform splits the input into words on
// whitespace, punctuation separators, and camelCase boundaries, then rejoins.

export type CaseId =
	| 'upper'
	| 'lower'
	| 'title'
	| 'sentence'
	| 'camel'
	| 'pascal'
	| 'snake'
	| 'constant'
	| 'kebab'
	| 'dot'
	| 'capitalize'
	| 'alternating'
	| 'inverse';

export interface CaseDef {
	id: CaseId;
	name: string;
	example: string;
}

export const caseDefs: CaseDef[] = [
	{ id: 'upper', name: 'UPPER CASE', example: 'HELLO WORLD' },
	{ id: 'lower', name: 'lower case', example: 'hello world' },
	{ id: 'title', name: 'Title Case', example: 'Hello World' },
	{ id: 'sentence', name: 'Sentence case', example: 'Hello world' },
	{ id: 'capitalize', name: 'Capitalize Each Word', example: 'Hello World' },
	{ id: 'camel', name: 'camelCase', example: 'helloWorld' },
	{ id: 'pascal', name: 'PascalCase', example: 'HelloWorld' },
	{ id: 'snake', name: 'snake_case', example: 'hello_world' },
	{ id: 'constant', name: 'CONSTANT_CASE', example: 'HELLO_WORLD' },
	{ id: 'kebab', name: 'kebab-case', example: 'hello-world' },
	{ id: 'dot', name: 'dot.case', example: 'hello.world' },
	{ id: 'alternating', name: 'aLtErNaTiNg', example: 'hElLo WoRlD' },
	{ id: 'inverse', name: 'iNVERSE cASE', example: 'hELLO wORLD' }
];

// Split into normalized lowercase word tokens.
function words(input: string): string[] {
	return (
		input
			// insert space at camelCase / PascalCase boundaries
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
			.split(/[\s_\-./]+/)
			.filter(Boolean)
			.map((w) => w.toLowerCase())
	);
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

// Smaller words that stay lowercase in Title Case unless first/last.
const MINOR = new Set([
	'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'per',
	'the', 'to', 'vs', 'via'
]);

export function convertCase(input: string, id: CaseId): string {
	if (!input) return '';

	switch (id) {
		case 'upper':
			return input.toUpperCase();
		case 'lower':
			return input.toLowerCase();
		case 'alternating':
			return [...input]
				.map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
				.join('');
		case 'inverse':
			return [...input]
				.map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
				.join('');
	}

	const w = words(input);
	if (w.length === 0) return '';

	switch (id) {
		case 'title':
			return w
				.map((word, i) =>
					i !== 0 && i !== w.length - 1 && MINOR.has(word) ? word : cap(word)
				)
				.join(' ');
		case 'capitalize':
			return w.map(cap).join(' ');
		case 'sentence':
			return cap(w.join(' '));
		case 'camel':
			return w.map((word, i) => (i === 0 ? word : cap(word))).join('');
		case 'pascal':
			return w.map(cap).join('');
		case 'snake':
			return w.join('_');
		case 'constant':
			return w.join('_').toUpperCase();
		case 'kebab':
			return w.join('-');
		case 'dot':
			return w.join('.');
		default:
			return input;
	}
}
