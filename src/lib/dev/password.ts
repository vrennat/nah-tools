// Password and passphrase generation using crypto.getRandomValues, plus an
// entropy-based strength estimate (no third-party strength library).

export interface PasswordOptions {
	length: number;
	lowercase: boolean;
	uppercase: boolean;
	numbers: boolean;
	symbols: boolean;
	excludeAmbiguous: boolean;
}

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?/';
const AMBIGUOUS = /[Il1O0o]/g;

// Uniform random index in [0, max) without modulo bias.
function randomInt(max: number): number {
	const limit = Math.floor(0xffffffff / max) * max;
	const buf = new Uint32Array(1);
	let x: number;
	do {
		crypto.getRandomValues(buf);
		x = buf[0];
	} while (x >= limit);
	return x % max;
}

export function generatePassword(opts: PasswordOptions): string {
	let pool = '';
	if (opts.lowercase) pool += LOWER;
	if (opts.uppercase) pool += UPPER;
	if (opts.numbers) pool += NUMBERS;
	if (opts.symbols) pool += SYMBOLS;
	if (opts.excludeAmbiguous) pool = pool.replace(AMBIGUOUS, '');
	if (!pool) return '';

	const len = Math.max(1, Math.min(opts.length, 256));
	let out = '';
	for (let i = 0; i < len; i++) out += pool[randomInt(pool.length)];
	return out;
}

// Curated common-word list for passphrases. Entropy is reported honestly from
// the actual list length: log2(WORDS.length) bits per word.
export const WORDS = [
	'apple', 'anchor', 'autumn', 'arrow', 'amber', 'badge', 'breeze', 'bridge', 'butter', 'bottle',
	'branch', 'basket', 'candle', 'castle', 'canyon', 'cherry', 'cloud', 'copper', 'cotton', 'cradle',
	'dagger', 'desert', 'dolphin', 'dragon', 'drizzle', 'eagle', 'ember', 'engine', 'echo', 'falcon',
	'feather', 'forest', 'fountain', 'garden', 'glacier', 'golden', 'granite', 'harbor', 'hammer',
	'harvest', 'hollow', 'island', 'ivory', 'jacket', 'jaguar', 'jungle', 'kettle', 'kitten', 'ladder',
	'lantern', 'leather', 'lemon', 'lily', 'lobster', 'maple', 'marble', 'meadow', 'meteor', 'mirror',
	'mountain', 'nectar', 'needle', 'nimble', 'oasis', 'ocean', 'olive', 'orchid', 'otter', 'oxygen',
	'pebble', 'pepper', 'pigeon', 'pillow', 'planet', 'pocket', 'pumpkin', 'quartz', 'quiver', 'rabbit',
	'rocket', 'ribbon', 'river', 'rubber', 'saddle', 'salmon', 'silver', 'spider', 'spruce', 'stable',
	'sugar', 'summer', 'sunset', 'temple', 'thunder', 'timber', 'tiger', 'tulip', 'turtle', 'umbrella',
	'valley', 'velvet', 'violet', 'walnut', 'willow', 'window', 'winter', 'wizard', 'yellow', 'yonder',
	'zephyr', 'zigzag', 'almond', 'antler', 'beacon', 'bishop', 'blanket', 'blossom', 'bubble', 'cactus',
	'cabin', 'camel', 'carbon', 'cedar', 'circus', 'clover', 'comet', 'coral', 'crystal', 'cyclone',
	'diamond', 'donut', 'dune', 'fable', 'fern', 'fiber', 'flame', 'fossil', 'galaxy', 'ginger',
	'gravel', 'hazel', 'helmet', 'honey', 'jasmine', 'jelly', 'kayak', 'koala', 'lagoon', 'lava',
	'lotus', 'magnet', 'mango', 'maze', 'melon', 'mint', 'moss', 'nimbus', 'noble', 'onyx',
	'opal', 'orbit', 'panda', 'parrot', 'peach', 'pearl', 'phoenix', 'pine', 'plum', 'prairie',
	'puzzle', 'quail', 'raven', 'reef', 'rhino', 'rose', 'sable', 'sage', 'sapphire', 'scarlet',
	'shadow', 'shell', 'slate', 'sloth', 'spark', 'sphinx', 'sprout', 'storm', 'swan', 'tango',
	'thistle', 'topaz', 'torch', 'trail', 'vapor', 'viper', 'walrus', 'wheat', 'whisker', 'zebra'
];

export interface PassphraseOptions {
	wordCount: number;
	separator: string;
	capitalize: boolean;
	includeNumber: boolean;
}

export function generatePassphrase(opts: PassphraseOptions): string {
	const count = Math.max(2, Math.min(opts.wordCount, 12));
	const picked: string[] = [];
	for (let i = 0; i < count; i++) {
		let w = WORDS[randomInt(WORDS.length)];
		if (opts.capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
		picked.push(w);
	}
	let phrase = picked.join(opts.separator);
	if (opts.includeNumber) phrase += opts.separator + randomInt(100);
	return phrase;
}

export interface Strength {
	bits: number;
	label: 'Very weak' | 'Weak' | 'Fair' | 'Strong' | 'Very strong';
	score: 0 | 1 | 2 | 3 | 4;
}

// Entropy from the character pool actually used in the password.
export function passwordEntropy(pw: string): number {
	if (!pw) return 0;
	let pool = 0;
	if (/[a-z]/.test(pw)) pool += 26;
	if (/[A-Z]/.test(pw)) pool += 26;
	if (/[0-9]/.test(pw)) pool += 10;
	if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
	return pw.length * Math.log2(pool || 1);
}

export function passphraseEntropy(wordCount: number): number {
	return wordCount * Math.log2(WORDS.length);
}

export function rateStrength(bits: number): Strength {
	let label: Strength['label'];
	let score: Strength['score'];
	if (bits < 28) {
		label = 'Very weak';
		score = 0;
	} else if (bits < 40) {
		label = 'Weak';
		score = 1;
	} else if (bits < 60) {
		label = 'Fair';
		score = 2;
	} else if (bits < 80) {
		label = 'Strong';
		score = 3;
	} else {
		label = 'Very strong';
		score = 4;
	}
	return { bits: Math.round(bits), label, score };
}
