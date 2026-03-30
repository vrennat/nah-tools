import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { brokers } from '$lib/remove/brokers';
import { filterBrokers, sortBrokers } from '$lib/remove/filters';
import { generateEmail, generateCCPAEmail, generateGDPREmail } from '$lib/remove/templates';
import type { BrokerFilters, SortBy, UserInfo } from '$lib/remove/types';

// Search URL query parameter patterns for brokers that support pre-filled URLs
const SEARCH_URL_BUILDERS: Record<string, (firstName: string, lastName: string, state?: string, city?: string) => string> = {
	spokeo: (fn, ln) => `https://www.spokeo.com/search?q=${encodeURIComponent(fn + ' ' + ln)}`,
	beenverified: (fn, ln, state) => {
		let url = `https://www.beenverified.com/app/optout/search?fn=${encodeURIComponent(fn)}&ln=${encodeURIComponent(ln)}`;
		if (state) url += `&state=${encodeURIComponent(state)}`;
		return url;
	},
	whitepages: (fn, ln, state, city) => {
		let url = `https://www.whitepages.com/name/${encodeURIComponent(fn)}-${encodeURIComponent(ln)}`;
		if (city && state) url += `/${encodeURIComponent(city)}-${encodeURIComponent(state)}`;
		else if (state) url += `/${encodeURIComponent(state)}`;
		return url;
	},
	truepeoplesearch: (fn, ln, state) => {
		let url = `https://www.truepeoplesearch.com/results?name=${encodeURIComponent(fn + ' ' + ln)}`;
		if (state) url += `&citystatezip=${encodeURIComponent(state)}`;
		return url;
	},
	fastpeoplesearch: (fn, ln, state) => {
		let url = `https://www.fastpeoplesearch.com/name/${encodeURIComponent(fn.toLowerCase())}-${encodeURIComponent(ln.toLowerCase())}`;
		if (state) url += `_${encodeURIComponent(state.toLowerCase())}`;
		return url;
	},
	peoplefinder: (fn, ln, state) => {
		let url = `https://www.peoplefinders.com/people/${encodeURIComponent(fn)}-${encodeURIComponent(ln)}`;
		if (state) url += `/${encodeURIComponent(state)}`;
		return url;
	},
	radaris: (fn, ln, state) => {
		let url = `https://radaris.com/p/${encodeURIComponent(fn)}/${encodeURIComponent(ln)}`;
		if (state) url += `/${encodeURIComponent(state)}`;
		return url;
	},
	nuwber: (fn, ln, state) => {
		let url = `https://nuwber.com/search?name=${encodeURIComponent(fn + ' ' + ln)}`;
		if (state) url += `&state=${encodeURIComponent(state)}`;
		return url;
	},
	thatsthem: (fn, ln, state) => {
		let url = `https://thatsthem.com/name/${encodeURIComponent(fn)}-${encodeURIComponent(ln)}`;
		if (state) url += `/${encodeURIComponent(state)}`;
		return url;
	},
	clustrmaps: (fn, ln) => `https://clustrmaps.com/persons/${encodeURIComponent(fn)}-${encodeURIComponent(ln)}`,
	mylife: (fn, ln) => `https://www.mylife.com/pub/name/${encodeURIComponent(fn)}+${encodeURIComponent(ln)}`,
};

export function createMcpServer() {
	const server = new McpServer(
		{
			name: 'nah-tools',
			version: '1.0.0'
		},
		{
			capabilities: {
				tools: {},
				prompts: {},
				resources: {}
			}
		}
	);

	// ─── Tools ────────────────────────────────────────────────────────

	server.registerTool('list_brokers', {
		title: 'List Data Brokers',
		description:
			'List data brokers that may have your personal information, with optional filtering and sorting. Returns broker IDs, names, priority, difficulty, opt-out method, and category.',
		inputSchema: {
			method: z
				.enum(['email', 'form', 'email+form', 'phone', 'mail', 'all'])
				.optional()
				.describe('Filter by opt-out method'),
			difficulty: z
				.enum(['easy', 'medium', 'hard', 'manual-only', 'all'])
				.optional()
				.describe('Filter by difficulty'),
			priority: z
				.enum(['crucial', 'high', 'medium', 'low', 'all'])
				.optional()
				.describe('Filter by priority'),
			category: z
				.enum(['people-search', 'data-broker', 'marketing', 'background-check', 'financial', 'all'])
				.optional()
				.describe('Filter by category'),
			sort: z
				.enum(['priority', 'difficulty', 'name'])
				.optional()
				.describe('Sort order (default: priority)')
		},
		annotations: {
			readOnlyHint: true
		}
	}, async ({ method, difficulty, priority, category, sort }) => {
		const filters: BrokerFilters = {
			method: method ?? 'all',
			difficulty: difficulty ?? 'all',
			priority: priority ?? 'all',
			category: category ?? 'all'
		};

		const filtered = filterBrokers(brokers, filters, {});
		const sorted = sortBrokers(filtered, (sort ?? 'priority') as SortBy, {});

		const result = sorted.map((b) => ({
			id: b.id,
			name: b.name,
			priority: b.priority,
			difficulty: b.difficulty,
			optOutMethod: b.optOutMethod,
			category: b.category,
			parentCompany: b.parentCompany,
			subsidiaries: b.subsidiaries,
			relistsAfterDays: b.relistsAfterDays
		}));

		return {
			content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }]
		};
	});

	server.registerTool('get_broker', {
		title: 'Get Broker Details',
		description:
			'Get full details for a specific data broker including opt-out steps, URLs, required information, and notes.',
		inputSchema: {
			broker_id: z.string().describe('The broker ID (e.g. "spokeo", "beenverified")')
		},
		annotations: {
			readOnlyHint: true
		}
	}, async ({ broker_id }) => {
		const broker = brokers.find((b) => b.id === broker_id);
		if (!broker) {
			return {
				content: [{ type: 'text' as const, text: `Broker "${broker_id}" not found. Use list_brokers to see available IDs.` }],
				isError: true
			};
		}
		return {
			content: [{ type: 'text' as const, text: JSON.stringify(broker, null, 2) }]
		};
	});

	server.registerTool('generate_removal_email', {
		title: 'Generate Removal Email',
		description:
			'Generate a CCPA or GDPR data deletion request email for a specific broker. Returns the email recipient, subject, body, and mailto link.',
		inputSchema: {
			broker_id: z.string().describe('The broker ID'),
			first_name: z.string().describe('Your first name'),
			last_name: z.string().describe('Your last name'),
			email: z.string().describe('Your email address'),
			state: z.string().describe('Your US state abbreviation, or "outside-us" for GDPR'),
			address: z.string().optional().describe('Your street address'),
			city: z.string().optional().describe('Your city'),
			zip: z.string().optional().describe('Your ZIP code'),
			phone: z.string().optional().describe('Your phone number'),
			legal_basis: z
				.enum(['ccpa', 'gdpr', 'auto'])
				.optional()
				.describe('Legal basis for the request (default: auto-detect from state)')
		},
		annotations: {
			readOnlyHint: true
		}
	}, async ({ broker_id, first_name, last_name, email, state, address, city, zip, phone, legal_basis }) => {
		const broker = brokers.find((b) => b.id === broker_id);
		if (!broker) {
			return {
				content: [{ type: 'text' as const, text: `Broker "${broker_id}" not found.` }],
				isError: true
			};
		}

		const userInfo: UserInfo = {
			firstName: first_name,
			lastName: last_name,
			email,
			state,
			address,
			city,
			zip,
			phone
		};

		let result;
		if (legal_basis === 'ccpa') {
			result = generateCCPAEmail(broker, userInfo);
		} else if (legal_basis === 'gdpr') {
			result = generateGDPREmail(broker, userInfo);
		} else {
			result = generateEmail(broker, userInfo);
		}

		return {
			content: [
				{
					type: 'text' as const,
					text: JSON.stringify(
						{
							to: result.to,
							subject: result.subject,
							body: result.body,
							mailto: result.mailto,
							broker_name: broker.name,
							legal_basis: legal_basis === 'gdpr' || (!legal_basis && state === 'outside-us') ? 'GDPR' : 'CCPA'
						},
						null,
						2
					)
				}
			]
		};
	});

	server.registerTool('get_removal_plan', {
		title: 'Get Removal Plan',
		description:
			'Get a prioritized removal plan. Returns brokers grouped by priority with estimated effort, highlighting which opt-outs cover multiple subsidiaries.',
		inputSchema: {
			difficulty_max: z
				.enum(['easy', 'medium', 'hard', 'manual-only'])
				.optional()
				.describe('Maximum difficulty to include (default: all)')
		},
		annotations: {
			readOnlyHint: true
		}
	}, async ({ difficulty_max }) => {
		const difficultyOrder = { easy: 0, medium: 1, hard: 2, 'manual-only': 3 };
		const maxLevel = difficultyOrder[difficulty_max ?? 'manual-only'];

		const eligible = brokers.filter((b) => difficultyOrder[b.difficulty] <= maxLevel);
		const sorted = sortBrokers(eligible, 'priority', {});

		// Group by priority and deduplicate parent/subsidiary relationships
		const parentsSeen = new Set<string>();
		const plan: Array<{
			id: string;
			name: string;
			priority: string;
			difficulty: string;
			method: string;
			covers: string[];
			requiredInfo: string[];
			estimatedMinutes: number;
		}> = [];

		for (const broker of sorted) {
			// Skip subsidiaries if we already have the parent
			if (broker.parentCompany && parentsSeen.has(broker.parentCompany)) {
				continue;
			}

			const covers = [broker.name];
			if (broker.subsidiaries) {
				covers.push(...broker.subsidiaries.map((id) => {
					const sub = brokers.find((b) => b.id === id);
					return sub?.name ?? id;
				}));
				if (broker.parentCompany) {
					parentsSeen.add(broker.parentCompany);
				}
			}

			const minutes =
				broker.difficulty === 'easy' ? 3 :
				broker.difficulty === 'medium' ? 8 :
				broker.difficulty === 'hard' ? 15 : 30;

			plan.push({
				id: broker.id,
				name: broker.name,
				priority: broker.priority,
				difficulty: broker.difficulty,
				method: broker.optOutMethod,
				covers,
				requiredInfo: broker.requiredInfo,
				estimatedMinutes: minutes
			});
		}

		const totalMinutes = plan.reduce((sum, b) => sum + b.estimatedMinutes, 0);

		return {
			content: [
				{
					type: 'text' as const,
					text: JSON.stringify(
						{
							total_brokers: plan.length,
							total_estimated_minutes: totalMinutes,
							plan
						},
						null,
						2
					)
				}
			]
		};
	});

	server.registerTool('get_broker_search_url', {
		title: 'Get Broker Search URL',
		description:
			'Get a pre-filled search URL to check if your personal data appears on a specific broker site. Use this before opting out to verify your data is listed.',
		inputSchema: {
			broker_id: z.string().describe('The broker ID'),
			first_name: z.string().describe('First name to search for'),
			last_name: z.string().describe('Last name to search for'),
			state: z.string().optional().describe('US state abbreviation'),
			city: z.string().optional().describe('City name')
		},
		annotations: {
			readOnlyHint: true
		}
	}, async ({ broker_id, first_name, last_name, state, city }) => {
		const broker = brokers.find((b) => b.id === broker_id);
		if (!broker) {
			return {
				content: [{ type: 'text' as const, text: `Broker "${broker_id}" not found.` }],
				isError: true
			};
		}

		if (!broker.searchUrl) {
			return {
				content: [{
					type: 'text' as const,
					text: JSON.stringify({
						broker_name: broker.name,
						search_url: null,
						note: `${broker.name} does not have a public search page. This is typically a behind-the-scenes data broker. Proceed directly to opt-out.`,
						opt_out_url: broker.optOutUrl
					}, null, 2)
				}]
			};
		}

		const builder = SEARCH_URL_BUILDERS[broker_id];
		const prefilledUrl = builder ? builder(first_name, last_name, state, city) : null;

		return {
			content: [{
				type: 'text' as const,
				text: JSON.stringify({
					broker_name: broker.name,
					search_url: broker.searchUrl,
					prefilled_url: prefilledUrl,
					note: prefilledUrl
						? 'Use the prefilled URL to search for your listing. If found, proceed with opt-out.'
						: `No pre-filled URL available. Visit the search URL and manually search for "${first_name} ${last_name}".`
				}, null, 2)
			}]
		};
	});

	// ─── Resources ────────────────────────────────────────────────────

	server.registerResource(
		'broker_list',
		'nah://brokers',
		{
			description: 'Summary list of all data brokers with ID, name, priority, difficulty, and category',
			mimeType: 'application/json'
		},
		async (uri) => ({
			contents: [{
				uri: uri.href,
				mimeType: 'application/json',
				text: JSON.stringify(brokers.map((b) => ({
					id: b.id,
					name: b.name,
					priority: b.priority,
					difficulty: b.difficulty,
					category: b.category,
					optOutMethod: b.optOutMethod
				})), null, 2)
			}]
		})
	);

	server.registerResource(
		'broker_detail',
		new ResourceTemplate('nah://brokers/{broker_id}', {
			list: async () => ({
				resources: brokers.map((b) => ({
					uri: `nah://brokers/${b.id}`,
					name: b.name,
					description: `${b.priority} priority ${b.category} broker — ${b.difficulty} difficulty, opt-out via ${b.optOutMethod}`,
					mimeType: 'application/json' as const
				}))
			})
		}),
		{
			description: 'Full details for a specific data broker',
			mimeType: 'application/json'
		},
		async (uri, variables) => {
			const brokerId = variables.broker_id as string;
			const broker = brokers.find((b) => b.id === brokerId);
			if (!broker) return { contents: [] };
			return {
				contents: [{
					uri: uri.href,
					mimeType: 'application/json',
					text: JSON.stringify(broker, null, 2)
				}]
			};
		}
	);

	// ─── Prompts ──────────────────────────────────────────────────────

	server.registerPrompt('removal_guide', {
		title: 'Data Broker Removal Guide',
		description:
			'A system prompt that guides an AI agent through the data broker removal process step by step.',
		argsSchema: {
			first_name: z.string().describe('User first name'),
			last_name: z.string().describe('User last name'),
			email: z.string().describe('User email'),
			state: z.string().describe('US state abbreviation or "outside-us"')
		}
	}, async ({ first_name, last_name, email, state }) => {
		return {
			messages: [
				{
					role: 'user' as const,
					content: {
						type: 'text' as const,
						text: `You are helping ${first_name} ${last_name} (${email}, ${state}) remove their personal data from data broker websites.

Use the nah-tools MCP server to:

1. Call get_removal_plan to see the prioritized list of brokers to tackle.
2. For each broker, starting with "crucial" priority:
   a. Call get_broker to get the full opt-out steps.
   b. If the broker accepts email opt-outs, call generate_removal_email to draft the email.
   c. Walk the user through the steps, or if you have browser access, execute them directly.
   d. Track which brokers have been completed.
3. After completing crucial brokers, move to high, then medium priority.

Important notes:
- Some brokers share parent companies. Opting out of a parent (e.g., Intelius) covers subsidiaries (TruthFinder, Instant Checkmate, etc.). The plan accounts for this.
- Many brokers relist data after 60-180 days. Recommend setting a calendar reminder.
- Some require phone verification (WhitePages) or government ID (Epsilon). Flag these to the user.
- Never submit the user's information to any service without their explicit confirmation.`
					}
				}
			]
		};
	});

	return server;
}
