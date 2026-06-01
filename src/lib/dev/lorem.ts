// Lorem ipsum generator. Deterministic word bank, pseudo-random structure.

const WORDS = [
	'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
	'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
	'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
	'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit',
	'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur',
	'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
	'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde', 'omnis', 'iste',
	'natus', 'error', 'voluptatem', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem',
	'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore', 'veritatis', 'quasi',
	'architecto', 'beatae', 'vitae', 'dicta', 'explicabo', 'aspernatur', 'aut', 'odit', 'fugit',
	'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi', 'nesciunt', 'neque', 'porro',
	'quisquam', 'dolorem', 'adipisci', 'numquam', 'eius', 'modi', 'tempora', 'incidunt', 'magnam',
	'quaerat', 'voluptatem', 'minima', 'nostrum', 'exercitationem', 'corporis', 'suscipit'
];

const LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';

// Simple seeded LCG so output is stable within a render but varied by count.
function makeRng(seed: number) {
	let s = seed >>> 0 || 1;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 4294967296;
	};
}

const pick = (rng: () => number) => WORDS[Math.floor(rng() * WORDS.length)];

function sentence(rng: () => number): string {
	const len = 8 + Math.floor(rng() * 10);
	const w: string[] = [];
	for (let i = 0; i < len; i++) {
		let word = pick(rng);
		// occasional comma
		if (i > 0 && i < len - 1 && rng() < 0.12) word += ',';
		w.push(word);
	}
	const s = w.join(' ').replace(/,$/, '');
	return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}

function paragraph(rng: () => number): string {
	const count = 3 + Math.floor(rng() * 4);
	const sentences: string[] = [];
	for (let i = 0; i < count; i++) sentences.push(sentence(rng));
	return sentences.join(' ');
}

export type LoremUnit = 'paragraphs' | 'sentences' | 'words';

export function generateLorem(
	count: number,
	unit: LoremUnit,
	startWithLorem = true,
	seed = 1
): string {
	const n = Math.max(1, Math.min(count, 500));
	const rng = makeRng(seed + n);

	if (unit === 'words') {
		const w: string[] = [];
		for (let i = 0; i < n; i++) w.push(pick(rng));
		let text = w.join(' ');
		if (startWithLorem) text = 'Lorem ipsum ' + text;
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	if (unit === 'sentences') {
		const s: string[] = [];
		for (let i = 0; i < n; i++) s.push(sentence(rng));
		if (startWithLorem) s[0] = LOREM_START + ', ' + s[0].charAt(0).toLowerCase() + s[0].slice(1);
		return s.join(' ');
	}

	const p: string[] = [];
	for (let i = 0; i < n; i++) p.push(paragraph(rng));
	if (startWithLorem) p[0] = LOREM_START + ', ' + p[0].charAt(0).toLowerCase() + p[0].slice(1);
	return p.join('\n\n');
}
