export type OptOutMethod = 'email' | 'form' | 'email+form' | 'phone' | 'mail';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'manual-only';
export type Priority = 'crucial' | 'high' | 'medium' | 'low';
export type RemovalStatus =
	| 'not-started'
	| 'email-sent'
	| 'form-submitted'
	| 'verification-pending'
	| 'confirmed'
	| 'skipped';

export type BrokerCategory =
	| 'people-search'
	| 'data-broker'
	| 'marketing'
	| 'background-check'
	| 'financial';

export type RequiredField = 'name' | 'email' | 'address' | 'phone' | 'dob' | 'profileUrl';

export interface BrokerStep {
	instruction: string;
	url?: string;
	note?: string;
}

export interface Broker {
	id: string;
	name: string;
	url: string;
	category: BrokerCategory;
	priority: Priority;
	difficulty: Difficulty;
	optOutMethod: OptOutMethod;
	optOutUrl?: string;
	emailAddress?: string;
	emailSubject?: string;
	legalBasis: ('ccpa' | 'gdpr')[];
	requiredInfo: RequiredField[];
	steps?: BrokerStep[];
	notes?: string;
	parentCompany?: string;
	subsidiaries?: string[];
	relistsAfterDays?: number;
	verificationMethod?: 'email' | 'phone' | 'none';
	searchUrl?: string;
}

export interface UserInfo {
	firstName: string;
	lastName: string;
	email: string;
	state: string;
	address?: string;
	city?: string;
	zip?: string;
	phone?: string;
}

export interface ProgressEntry {
	status: RemovalStatus;
	updatedAt: string;
}

export interface ProgressData {
	version: number;
	brokers: Record<string, ProgressEntry>;
}

export interface BrokerFilters {
	method?: OptOutMethod | 'all';
	difficulty?: Difficulty | 'all';
	priority?: Priority | 'all';
	category?: BrokerCategory | 'all';
	status?: RemovalStatus | 'all';
}

export type SortBy = 'priority' | 'difficulty' | 'name' | 'status';
