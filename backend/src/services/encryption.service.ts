// backend/src/services/encryption.service.ts
// Secure Authenticated Encryption (AES-256-GCM) for User API Keys

import crypto from 'crypto';
import { env } from '../config/env.js';

export class EncryptionService {
  private static algorithm = 'aes-256-gcm';
  private static ivLength = 12; // 96 bits for GCM

  /**
   * Derives a deterministic 32-byte (256-bit) encryption key from the environment secret
   */
  private static getMasterKey(): Buffer {
    const rawSecret =
      process.env.GROQ_API_KEY_ENCRYPTION_SECRET ||
      env.SUPABASE_SERVICE_ROLE_KEY ||
      'algotrack_default_secure_vault_secret_key_2026';

    return crypto.scryptSync(rawSecret, 'algotrack_groq_salt_v1', 32);
  }

  /**
   * Encrypts plaintext string using AES-256-GCM with a random IV
   * Returns formatted string: iv:authTag:ciphertext (hex encoded)
   */
  static encrypt(plaintext: string): string {
    if (!plaintext) {
      throw new Error('Plaintext string cannot be empty for encryption');
    }

    const key = this.getMasterKey();
    const iv = crypto.randomBytes(this.ivLength);

    const cipher = crypto.createCipheriv(this.algorithm, key, iv) as crypto.CipherGCM;
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    const ivHex = iv.toString('hex');

    return `${ivHex}:${authTag}:${ciphertext}`;
  }

  /**
   * Decrypts an AES-256-GCM formatted string: iv:authTag:ciphertext
   */
  static decrypt(encryptedPayload: string): string {
    if (!encryptedPayload) {
      throw new Error('Encrypted payload cannot be empty for decryption');
    }

    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format');
    }

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const key = this.getMasterKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv) as crypto.DecipherGCM;
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Masks an API key for safe user-facing display (e.g. gsk_••••••••••••••••)
   */
  static maskApiKey(apiKey: string): string {
    if (!apiKey) return '';
    const cleanKey = apiKey.trim();

    if (cleanKey.startsWith('gsk_')) {
      const suffix = cleanKey.length > 8 ? cleanKey.slice(-4) : '';
      return suffix ? `gsk_••••••••••••${suffix}` : 'gsk_••••••••••••••••';
    }

    const suffix = cleanKey.length > 6 ? cleanKey.slice(-4) : '';
    return suffix ? `••••••••••••${suffix}` : '••••••••••••••••';
  }
}
