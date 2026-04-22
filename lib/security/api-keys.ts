import { createPersistenceAdapter } from '@/lib/persistence';
import { ApiKeyRecord } from '@/lib/persistence/contracts';
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';

const KEY_PREFIX = 'nava';
const HASH_ITERATIONS = 210000;
const HASH_KEYLEN = 32;
const HASH_DIGEST = 'sha256';

function buildPersistedHash(secret: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(secret, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST).toString('hex');
  return `${HASH_ITERATIONS}:${salt}:${hash}`;
}

function verifyPersistedHash(secret: string, persistedHash: string): boolean {
  const [iterationsRaw, salt, expectedHash] = persistedHash.split(':');

  if (!iterationsRaw || !salt || !expectedHash) {
    return false;
  }

  const iterations = Number(iterationsRaw);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const computedHash = pbkdf2Sync(secret, salt, iterations, expectedHash.length / 2, HASH_DIGEST).toString('hex');
  const expected = Buffer.from(expectedHash, 'hex');
  const actual = Buffer.from(computedHash, 'hex');

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

function generateKeyId(): string {
  return randomBytes(8).toString('hex');
}

function generateSecret(): string {
  return randomBytes(24).toString('base64url');
}

export function generateApiKeyMaterial() {
  const keyId = generateKeyId();
  const secret = generateSecret();
  const rawKey = `${KEY_PREFIX}_${keyId}_${secret}`;
  const keyHash = buildPersistedHash(secret);
  const now = new Date().toISOString();

  const record: ApiKeyRecord = {
    id: `key_${randomBytes(8).toString('hex')}`,
    keyId,
    keyHash,
    createdAt: now,
    updatedAt: now,
  };

  return { rawKey, record };
}

function parseRawApiKey(rawKey: string): { keyId: string; secret: string } | null {
  const segments = rawKey.split('_');
  if (segments.length < 3) {
    return null;
  }

  const [prefix, keyId, ...secretParts] = segments;
  if (prefix !== KEY_PREFIX || !keyId || secretParts.length === 0) {
    return null;
  }

  return {
    keyId,
    secret: secretParts.join('_'),
  };
}

const persistence = createPersistenceAdapter({
  mode: (process.env.NAVA_RUN_MODE as 'self-hosted' | 'hosted' | undefined) ?? 'self-hosted',
});

export async function verifyApiKeyFromRepository(rawKey: string): Promise<ApiKeyRecord | null> {
  const parsed = parseRawApiKey(rawKey);
  if (!parsed) {
    return null;
  }

  const keyRecord = await persistence.apiKeys.getByKeyId(parsed.keyId);
  if (!keyRecord || keyRecord.revokedAt) {
    return null;
  }

  const isValid = verifyPersistedHash(parsed.secret, keyRecord.keyHash);
  if (!isValid) {
    return null;
  }

  const now = new Date().toISOString();
  await persistence.apiKeys.update(keyRecord.id, {
    lastUsedAt: now,
    updatedAt: now,
  });

  return keyRecord;
}

export async function revokeApiKey(keyId: string): Promise<ApiKeyRecord | null> {
  const keyRecord = await persistence.apiKeys.getByKeyId(keyId);
  if (!keyRecord) {
    return null;
  }

  const now = new Date().toISOString();
  return persistence.apiKeys.update(keyRecord.id, {
    revokedAt: now,
    updatedAt: now,
  });
}
