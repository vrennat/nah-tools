// Line-based diff via longest-common-subsequence. Returns a flat list of rows
// tagged equal/add/remove, suitable for a side-by-side or unified view.

export type DiffOp = 'equal' | 'add' | 'remove';

export interface DiffRow {
	op: DiffOp;
	text: string;
	/** 1-based line number in the left (original) text, if present. */
	leftNo?: number;
	/** 1-based line number in the right (changed) text, if present. */
	rightNo?: number;
}

export interface DiffResult {
	rows: DiffRow[];
	added: number;
	removed: number;
	unchanged: number;
}

export function diffLines(
	a: string,
	b: string,
	opts: { ignoreWhitespace?: boolean; ignoreCase?: boolean } = {}
): DiffResult {
	const rawA = a.split('\n');
	const rawB = b.split('\n');

	const norm = (s: string) => {
		let v = s;
		if (opts.ignoreWhitespace) v = v.trim().replace(/\s+/g, ' ');
		if (opts.ignoreCase) v = v.toLowerCase();
		return v;
	};
	const na = rawA.map(norm);
	const nb = rawB.map(norm);

	const m = na.length;
	const n = nb.length;

	// LCS length table.
	const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
	for (let i = m - 1; i >= 0; i--) {
		for (let j = n - 1; j >= 0; j--) {
			dp[i][j] = na[i] === nb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
		}
	}

	const rows: DiffRow[] = [];
	let added = 0,
		removed = 0,
		unchanged = 0;
	let i = 0,
		j = 0,
		li = 0,
		lj = 0;
	while (i < m && j < n) {
		if (na[i] === nb[j]) {
			rows.push({ op: 'equal', text: rawA[i], leftNo: ++li, rightNo: ++lj });
			unchanged++;
			i++;
			j++;
		} else if (dp[i + 1][j] >= dp[i][j + 1]) {
			rows.push({ op: 'remove', text: rawA[i], leftNo: ++li });
			removed++;
			i++;
		} else {
			rows.push({ op: 'add', text: rawB[j], rightNo: ++lj });
			added++;
			j++;
		}
	}
	while (i < m) {
		rows.push({ op: 'remove', text: rawA[i++], leftNo: ++li });
		removed++;
	}
	while (j < n) {
		rows.push({ op: 'add', text: rawB[j++], rightNo: ++lj });
		added++;
	}

	return { rows, added, removed, unchanged };
}
