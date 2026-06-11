// Standard 5-field cron parser: minute hour day-of-month month day-of-week.
// Supports *, */n, a-b, a-b/n, and comma lists. Computes next run times and a
// plain-English description.

interface CronFields {
	minute: Set<number>;
	hour: Set<number>;
	dom: Set<number>;
	month: Set<number>;
	dow: Set<number>;
	domRestricted: boolean;
	dowRestricted: boolean;
}

const RANGES = {
	minute: [0, 59],
	hour: [0, 23],
	dom: [1, 31],
	month: [1, 12],
	dow: [0, 6]
} as const;

const MONTH_NAMES: Record<string, number> = {
	jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
	jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
};
const DOW_NAMES: Record<string, number> = {
	sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
};

function parseField(
	field: string,
	[min, max]: readonly [number, number],
	names?: Record<string, number>
): Set<number> {
	const result = new Set<number>();
	for (const part of field.split(',')) {
		let [range, stepStr] = part.split('/');
		const step = stepStr ? parseInt(stepStr, 10) : 1;
		if (stepStr && (isNaN(step) || step < 1)) throw new Error(`Invalid step "${part}"`);

		let lo: number, hi: number;
		if (range === '*') {
			lo = min;
			hi = max;
		} else {
			const bounds = range.split('-');
			const resolve = (t: string): number => {
				const key = t.toLowerCase();
				if (names && key in names) return names[key];
				const v = parseInt(t, 10);
				if (isNaN(v)) throw new Error(`Invalid value "${t}"`);
				return v;
			};
			lo = resolve(bounds[0]);
			// When a step is provided but no range end (e.g. "5/15"), the range
			// extends to the field maximum per standard cron semantics.
			hi = bounds.length > 1 ? resolve(bounds[1]) : (stepStr ? max : lo);
		}
		if (lo < min || hi > max || lo > hi) throw new Error(`Value out of range in "${part}"`);
		for (let v = lo; v <= hi; v += step) result.add(v === 7 && max === 6 ? 0 : v);
	}
	return result;
}

export function parseCron(expr: string): CronFields {
	const parts = expr.trim().split(/\s+/);
	if (parts.length !== 5) {
		throw new Error(`Expected 5 fields, got ${parts.length}. Format: min hour dom month dow`);
	}
	const [min, hour, dom, month, dow] = parts;
	return {
		minute: parseField(min, RANGES.minute),
		hour: parseField(hour, RANGES.hour),
		dom: parseField(dom, RANGES.dom),
		month: parseField(month, RANGES.month, MONTH_NAMES),
		dow: parseField(dow, RANGES.dow, DOW_NAMES),
		domRestricted: dom !== '*',
		dowRestricted: dow !== '*'
	};
}

export function validateCron(expr: string): { valid: boolean; error?: string } {
	try {
		parseCron(expr);
		return { valid: true };
	} catch (e) {
		return { valid: false, error: e instanceof Error ? e.message : 'Invalid expression' };
	}
}

function matches(f: CronFields, d: Date): boolean {
	if (!f.minute.has(d.getMinutes())) return false;
	if (!f.hour.has(d.getHours())) return false;
	if (!f.month.has(d.getMonth() + 1)) return false;
	const domOk = f.dom.has(d.getDate());
	const dowOk = f.dow.has(d.getDay());
	// Cron OR semantics: when both DOM and DOW are restricted, either may match.
	if (f.domRestricted && f.dowRestricted) return domOk || dowOk;
	if (f.domRestricted) return domOk;
	if (f.dowRestricted) return dowOk;
	return true;
}

export function nextRuns(expr: string, from: Date, count = 5): Date[] {
	const f = parseCron(expr);
	const runs: Date[] = [];
	const d = new Date(from.getTime());
	d.setSeconds(0, 0);
	d.setMinutes(d.getMinutes() + 1);
	// Cap the search at ~4 years of minutes to avoid runaway loops.
	const cap = 366 * 4 * 24 * 60;
	for (let i = 0; i < cap && runs.length < count; i++) {
		if (matches(f, d)) runs.push(new Date(d.getTime()));
		d.setMinutes(d.getMinutes() + 1);
	}
	return runs;
}

// ---- human description ----

const ORDINAL_DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
	'', 'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];

function listText(set: Set<number>, full: number, mapper: (n: number) => string): string {
	if (set.size >= full) return 'every';
	return Array.from(set)
		.sort((a, b) => a - b)
		.map(mapper)
		.join(', ');
}

export function describeCron(expr: string): string {
	let f: CronFields;
	try {
		f = parseCron(expr);
	} catch (e) {
		return e instanceof Error ? e.message : 'Invalid expression';
	}

	const parts = expr.trim().split(/\s+/);
	const everyMinute = f.minute.size === 60;
	const everyHour = f.hour.size === 24;

	let time: string;
	if (everyMinute && everyHour) {
		time = 'Every minute';
	} else if (everyMinute) {
		time = `Every minute during ${listText(f.hour, 24, (h) => `${h}:00`)}`;
	} else if (parts[0].startsWith('*/')) {
		time = `Every ${parts[0].slice(2)} minutes`;
	} else if (f.minute.size === 1 && f.hour.size === 1) {
		const h = [...f.hour][0];
		const m = [...f.minute][0];
		time = `At ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
	} else {
		const mins = listText(f.minute, 60, (m) => `:${String(m).padStart(2, '0')}`);
		const hrs = listText(f.hour, 24, (h) => `${h}:00`);
		time = `At minute ${mins} past hour ${hrs}`;
	}

	const segments = [time];
	if (f.dowRestricted) {
		segments.push(`on ${listText(f.dow, 7, (d) => ORDINAL_DOW[d])}`);
	}
	if (f.domRestricted) {
		segments.push(`on day ${Array.from(f.dom).sort((a, b) => a - b).join(', ')} of the month`);
	}
	if (f.month.size < 12) {
		segments.push(`in ${listText(f.month, 12, (m) => MONTHS[m])}`);
	}

	return segments.join(' ') + '.';
}
