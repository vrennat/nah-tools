// Color conversions between HEX, RGB, HSL, and OKLCH, plus WCAG contrast.
// OKLab/OKLCH math follows Björn Ottosson's published formulas.

export interface RGB {
	r: number; // 0-255
	g: number;
	b: number;
}

export interface HSL {
	h: number; // 0-360
	s: number; // 0-100
	l: number; // 0-100
}

export interface OKLCH {
	l: number; // 0-1
	c: number; // chroma
	h: number; // 0-360
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const round = (x: number, d = 0) => {
	const f = 10 ** d;
	return Math.round(x * f) / f;
};

// ---- HEX <-> RGB ----

export function parseHex(hex: string): RGB | null {
	let h = hex.trim().replace(/^#/, '');
	if (h.length === 3) h = h.split('').map((c) => c + c).join('');
	if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
	return {
		r: parseInt(h.slice(0, 2), 16),
		g: parseInt(h.slice(2, 4), 16),
		b: parseInt(h.slice(4, 6), 16)
	};
}

export function rgbToHex({ r, g, b }: RGB): string {
	const hx = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
	return `#${hx(r)}${hx(g)}${hx(b)}`;
}

// ---- RGB <-> HSL ----

export function rgbToHsl({ r, g, b }: RGB): HSL {
	const rn = r / 255,
		gn = g / 255,
		bn = b / 255;
	const max = Math.max(rn, gn, bn),
		min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	let h = 0,
		s = 0;
	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case rn:
				h = (gn - bn) / d + (gn < bn ? 6 : 0);
				break;
			case gn:
				h = (bn - rn) / d + 2;
				break;
			default:
				h = (rn - gn) / d + 4;
		}
		h /= 6;
	}
	return { h: round(h * 360, 1), s: round(s * 100, 1), l: round(l * 100, 1) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
	const hn = ((h % 360) + 360) % 360 / 360;
	const sn = s / 100,
		ln = l / 100;
	if (sn === 0) {
		const v = Math.round(ln * 255);
		return { r: v, g: v, b: v };
	}
	const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
	const p = 2 * ln - q;
	const hue = (t: number) => {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};
	return {
		r: Math.round(hue(hn + 1 / 3) * 255),
		g: Math.round(hue(hn) * 255),
		b: Math.round(hue(hn - 1 / 3) * 255)
	};
}

// ---- RGB <-> OKLCH ----

const srgbToLinear = (c: number) => {
	c /= 255;
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const linearToSrgb = (c: number) => {
	const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
	return clamp(Math.round(v * 255), 0, 255);
};

export function rgbToOklch({ r, g, b }: RGB): OKLCH {
	const lr = srgbToLinear(r),
		lg = srgbToLinear(g),
		lb = srgbToLinear(b);
	const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
	const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
	const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
	const l_ = Math.cbrt(l),
		m_ = Math.cbrt(m),
		s_ = Math.cbrt(s);
	const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
	const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
	const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
	const C = Math.sqrt(a * a + bb * bb);
	let H = (Math.atan2(bb, a) * 180) / Math.PI;
	if (H < 0) H += 360;
	return { l: round(L, 4), c: round(C, 4), h: round(H, 2) };
}

export function oklchToRgb({ l, c, h }: OKLCH): RGB {
	const hr = (h * Math.PI) / 180;
	const a = c * Math.cos(hr);
	const b = c * Math.sin(hr);
	const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
	const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
	const s_ = l - 0.0894841775 * a - 1.291485548 * b;
	const lc = l_ ** 3,
		mc = m_ ** 3,
		sc = s_ ** 3;
	return {
		r: linearToSrgb(4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc),
		g: linearToSrgb(-1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc),
		b: linearToSrgb(-0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc)
	};
}

// ---- WCAG contrast ----

function relativeLuminance({ r, g, b }: RGB): number {
	const f = (c: number) => {
		c /= 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a: RGB, b: RGB): number {
	const l1 = relativeLuminance(a);
	const l2 = relativeLuminance(b);
	const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
	return round(ratio, 2);
}

export interface ContrastVerdict {
	ratio: number;
	aaNormal: boolean;
	aaLarge: boolean;
	aaaNormal: boolean;
	aaaLarge: boolean;
}

export function contrastVerdict(fg: RGB, bg: RGB): ContrastVerdict {
	const ratio = contrastRatio(fg, bg);
	return {
		ratio,
		aaNormal: ratio >= 4.5,
		aaLarge: ratio >= 3,
		aaaNormal: ratio >= 7,
		aaaLarge: ratio >= 4.5
	};
}

// ---- formatters ----

export const fmtRgb = ({ r, g, b }: RGB) => `rgb(${r}, ${g}, ${b})`;
export const fmtHsl = ({ h, s, l }: HSL) => `hsl(${h}, ${s}%, ${l}%)`;
export const fmtOklch = ({ l, c, h }: OKLCH) => `oklch(${round(l * 100, 2)}% ${c} ${h})`;
