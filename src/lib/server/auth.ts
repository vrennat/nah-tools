/**
 * Passphrase Authentication
 * bcrypt hashing for dynamic QR code management
 */

import bcrypt from 'bcryptjs';

const COST_FACTOR = 10;

/** Hash a passphrase for storage */
export async function hashPassphrase(passphrase: string): Promise<string> {
	return bcrypt.hash(passphrase, COST_FACTOR);
}

/** Verify a passphrase against a stored hash (constant-time) */
export async function verifyPassphrase(passphrase: string, hash: string): Promise<boolean> {
	return bcrypt.compare(passphrase, hash);
}
