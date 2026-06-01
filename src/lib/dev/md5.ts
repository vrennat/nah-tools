// MD5 digest. Web Crypto deliberately omits MD5, so this is a compact pure-JS
// implementation operating on a byte array (RFC 1321). For text, UTF-8 encode first.

const S = [
	7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14,
	20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6,
	10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
];

const K = (() => {
	const k = new Int32Array(64);
	for (let i = 0; i < 64; i++) k[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
	return k;
})();

const rotl = (x: number, c: number) => (x << c) | (x >>> (32 - c));

export function md5(input: Uint8Array): string {
	const n = input.length;
	const bitLen = n * 8;
	const padded = new Uint8Array(Math.ceil((n + 9) / 64) * 64);
	padded.set(input);
	padded[n] = 0x80;
	const lenLo = bitLen >>> 0;
	const lenHi = Math.floor(bitLen / 4294967296) >>> 0;
	const p = padded.length - 8;
	padded[p] = lenLo & 0xff;
	padded[p + 1] = (lenLo >>> 8) & 0xff;
	padded[p + 2] = (lenLo >>> 16) & 0xff;
	padded[p + 3] = (lenLo >>> 24) & 0xff;
	padded[p + 4] = lenHi & 0xff;
	padded[p + 5] = (lenHi >>> 8) & 0xff;
	padded[p + 6] = (lenHi >>> 16) & 0xff;
	padded[p + 7] = (lenHi >>> 24) & 0xff;

	let a0 = 0x67452301,
		b0 = 0xefcdab89,
		c0 = 0x98badcfe,
		d0 = 0x10325476;

	const M = new Int32Array(16);
	for (let off = 0; off < padded.length; off += 64) {
		for (let i = 0; i < 16; i++) {
			const j = off + i * 4;
			M[i] = padded[j] | (padded[j + 1] << 8) | (padded[j + 2] << 16) | (padded[j + 3] << 24);
		}
		let A = a0,
			B = b0,
			C = c0,
			D = d0;
		for (let i = 0; i < 64; i++) {
			let F: number, g: number;
			if (i < 16) {
				F = (B & C) | (~B & D);
				g = i;
			} else if (i < 32) {
				F = (D & B) | (~D & C);
				g = (5 * i + 1) % 16;
			} else if (i < 48) {
				F = B ^ C ^ D;
				g = (3 * i + 5) % 16;
			} else {
				F = C ^ (B | ~D);
				g = (7 * i) % 16;
			}
			F = (F + A + K[i] + M[g]) | 0;
			A = D;
			D = C;
			C = B;
			B = (B + rotl(F, S[i])) | 0;
		}
		a0 = (a0 + A) | 0;
		b0 = (b0 + B) | 0;
		c0 = (c0 + C) | 0;
		d0 = (d0 + D) | 0;
	}

	return [a0, b0, c0, d0].map(toHexLE).join('');
}

function toHexLE(x: number): string {
	let hex = '';
	for (let i = 0; i < 4; i++) hex += ((x >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
	return hex;
}
