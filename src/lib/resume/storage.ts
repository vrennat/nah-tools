import { get, set, del } from 'idb-keyval';
import type { ResumeData, ResumeMetadata } from './types';
import { createId } from './types';

const INDEX_KEY = 'resume-index';

function resumeKey(id: string): string {
	return `resume:${id}`;
}

function toMetadata(data: ResumeData): ResumeMetadata {
	return {
		id: data.id,
		name: data.name,
		template: data.template,
		updatedAt: data.updatedAt,
		masterResumeId: data.masterResumeId
	};
}

async function getIndex(): Promise<ResumeMetadata[]> {
	return (await get<ResumeMetadata[]>(INDEX_KEY)) ?? [];
}

async function setIndex(index: ResumeMetadata[]): Promise<void> {
	await set(INDEX_KEY, index);
}

export async function saveResume(data: ResumeData): Promise<ResumeData> {
	await set(resumeKey(data.id), data);
	const index = await getIndex();
	const existing = index.findIndex((m) => m.id === data.id);
	const meta = toMetadata(data);
	if (existing >= 0) {
		index[existing] = meta;
	} else {
		index.push(meta);
	}
	await setIndex(index);
	return data;
}

export async function getResume(id: string): Promise<ResumeData | undefined> {
	return get<ResumeData>(resumeKey(id));
}

export async function listResumes(): Promise<ResumeMetadata[]> {
	const index = await getIndex();
	return index.filter((m) => !m.masterResumeId);
}

export async function deleteResume(id: string): Promise<void> {
	await del(resumeKey(id));
	const index = await getIndex();
	await setIndex(index.filter((m) => m.id !== id));
}

export async function saveTailoredResume(
	data: ResumeData,
	masterResumeId: string
): Promise<ResumeData> {
	const tailored = { ...data, masterResumeId };
	return saveResume(tailored);
}

export async function listTailoredResumes(masterResumeId: string): Promise<ResumeMetadata[]> {
	const index = await getIndex();
	return index.filter((m) => m.masterResumeId === masterResumeId);
}

export async function exportResumeJSON(id: string): Promise<string> {
	const data = await getResume(id);
	if (!data) {
		throw new Error(`Resume not found: ${id}`);
	}
	return JSON.stringify(data);
}

export async function importResumeJSON(json: string): Promise<ResumeData> {
	let parsed: unknown;
	try {
		parsed = JSON.parse(json);
	} catch {
		throw new Error('Invalid JSON');
	}

	if (
		typeof parsed !== 'object' ||
		parsed === null ||
		!('personal' in parsed) ||
		!('template' in parsed) ||
		!('name' in parsed)
	) {
		throw new Error('Missing required resume fields');
	}

	const data = parsed as ResumeData;
	const now = new Date().toISOString();
	const imported: ResumeData = {
		...data,
		id: createId(),
		createdAt: now,
		updatedAt: now
	};
	delete imported.masterResumeId;

	await saveResume(imported);
	return imported;
}
