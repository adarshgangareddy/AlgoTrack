// backend/src/services/aiProvider.service.ts
// Secure AI Provider & BYOK Manager with Atomic Usage Tracking

import fs from 'fs';
import path from 'path';
import { Groq } from 'groq-sdk';
import { getSupabaseClient } from '../config/supabase.js';
import { EncryptionService } from './encryption.service.js';
import { ApiError } from '../utils/ApiError.js';

export interface UserAiUsageSummary {
  freeRequestsLimit: number;
  freeRequestsUsed: number;
  freeRequestsRemaining: number;
  hasCustomKey: boolean;
  customKeyMasked: string | null;
  customKeyStatus: 'connected' | 'invalid' | 'none';
}

export class AiProviderService {
  private static FREE_REQUESTS_LIMIT = 3;
  private static localDataDir = path.resolve(process.cwd(), '.data');

  private static ensureLocalDataDir(): void {
    if (!fs.existsSync(this.localDataDir)) {
      try {
        fs.mkdirSync(this.localDataDir, { recursive: true });
      } catch {
        // ignore
      }
    }
  }

  // Fallback local file stores in case Supabase tables are not yet migrated
  private static getLocalUsagePath(): string {
    return path.join(this.localDataDir, 'ai_usage.json');
  }

  private static getLocalKeysPath(): string {
    return path.join(this.localDataDir, 'user_keys.json');
  }

  private static readLocalJson<T>(filePath: string): Record<string, T> {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return {};
  }

  private static writeLocalJson<T>(filePath: string, data: Record<string, T>): void {
    try {
      this.ensureLocalDataDir();
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch {
      // ignore
    }
  }

  /**
   * Retrieves the authenticated user's free AI usage count
   */
  static async getUserUsage(userId: string): Promise<{ used: number; limit: number }> {
    if (!userId) {
      return { used: 0, limit: this.FREE_REQUESTS_LIMIT };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_ai_usage')
          .select('free_requests_used, free_requests_limit')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          return {
            used: data.free_requests_used ?? 0,
            limit: data.free_requests_limit ?? this.FREE_REQUESTS_LIMIT,
          };
        }

        // If row doesn't exist yet, initialize it
        if (!error && !data) {
          await supabase.from('user_ai_usage').insert({
            user_id: userId,
            free_requests_used: 0,
            free_requests_limit: this.FREE_REQUESTS_LIMIT,
          });
          return { used: 0, limit: this.FREE_REQUESTS_LIMIT };
        }
      } catch {
        // Fallback to local file store
      }
    }

    // Local file fallback
    const localUsage = this.readLocalJson<{ used: number; limit: number }>(this.getLocalUsagePath());
    const userRecord = localUsage[userId] || { used: 0, limit: this.FREE_REQUESTS_LIMIT };
    return userRecord;
  }

  /**
   * Atomically increments the user's free requests used count (only after successful AI call)
   */
  static async incrementFreeUsage(userId: string): Promise<{ used: number; remaining: number }> {
    if (!userId) {
      return { used: 1, remaining: 2 };
    }

    const supabase = getSupabaseClient();
    let updatedUsed = 1;

    if (supabase) {
      try {
        const current = await this.getUserUsage(userId);
        updatedUsed = current.used + 1;

        const { error } = await supabase
          .from('user_ai_usage')
          .upsert({
            user_id: userId,
            free_requests_used: updatedUsed,
            free_requests_limit: this.FREE_REQUESTS_LIMIT,
            updated_at: new Date().toISOString(),
          });

        if (!error) {
          const remaining = Math.max(0, this.FREE_REQUESTS_LIMIT - updatedUsed);
          return { used: updatedUsed, remaining };
        }
      } catch {
        // Fallback below
      }
    }

    // Local file fallback
    const localUsage = this.readLocalJson<{ used: number; limit: number }>(this.getLocalUsagePath());
    const current = localUsage[userId] || { used: 0, limit: this.FREE_REQUESTS_LIMIT };
    updatedUsed = current.used + 1;
    localUsage[userId] = {
      used: updatedUsed,
      limit: this.FREE_REQUESTS_LIMIT,
    };
    this.writeLocalJson(this.getLocalUsagePath(), localUsage);

    const remaining = Math.max(0, this.FREE_REQUESTS_LIMIT - updatedUsed);
    return { used: updatedUsed, remaining };
  }

  /**
   * Retrieves and decrypts the user's personal Groq API key if configured
   */
  static async getUserCustomKey(userId: string): Promise<string | null> {
    if (!userId) return null;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_api_keys')
          .select('encrypted_key, is_valid')
          .eq('user_id', userId)
          .eq('provider', 'groq')
          .maybeSingle();

        if (!error && data?.encrypted_key && data.is_valid !== false) {
          return EncryptionService.decrypt(data.encrypted_key);
        }
      } catch {
        // Fallback below
      }
    }

    // Local file fallback
    const localKeys = this.readLocalJson<{ encrypted: string; isValid: boolean }>(this.getLocalKeysPath());
    const record = localKeys[userId];
    if (record && record.encrypted && record.isValid !== false) {
      try {
        return EncryptionService.decrypt(record.encrypted);
      } catch {
        return null;
      }
    }

    return null;
  }

  /**
   * Retrieves masked metadata for user's personal API key
   */
  static async getUserKeyMetadata(userId: string): Promise<{ hasKey: boolean; maskedKey: string | null; isValid: boolean }> {
    if (!userId) {
      return { hasKey: false, maskedKey: null, isValid: false };
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_api_keys')
          .select('masked_key, is_valid')
          .eq('user_id', userId)
          .eq('provider', 'groq')
          .maybeSingle();

        if (!error && data?.masked_key) {
          return {
            hasKey: true,
            maskedKey: data.masked_key,
            isValid: data.is_valid !== false,
          };
        }
      } catch {
        // Fallback below
      }
    }

    // Local file fallback
    const localKeys = this.readLocalJson<{ masked: string; isValid: boolean }>(this.getLocalKeysPath());
    const record = localKeys[userId];
    if (record && record.masked) {
      return {
        hasKey: true,
        maskedKey: record.masked,
        isValid: record.isValid !== false,
      };
    }

    return { hasKey: false, maskedKey: null, isValid: false };
  }

  /**
   * Verifies a submitted Groq API key directly against the Groq API
   */
  static async verifyGroqKey(apiKey: string): Promise<{ valid: boolean; model: string }> {
    const cleanKey = (apiKey || '').trim();
    if (!cleanKey || !cleanKey.startsWith('gsk_')) {
      throw ApiError.badRequest('Invalid Groq API key format. Groq API keys start with "gsk_".');
    }

    try {
      const groq = new Groq({ apiKey: cleanKey });
      const modelsResponse = await groq.models.list();
      const availableModels = modelsResponse.data.map((m) => m.id);

      // Preferred models in order of capability
      const preferred = [
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'openai/gpt-oss-120b',
        'mixtral-8x7b-32768',
      ];
      const selectedModel = preferred.find((p) => availableModels.includes(p)) || availableModels[0] || 'llama-3.3-70b-versatile';

      return { valid: true, model: selectedModel };
    } catch (err: any) {
      if (err.status === 401 || (err.message && err.message.includes('invalid_api_key'))) {
        throw ApiError.unauthorized('Invalid Groq API key. Please verify your key on https://console.groq.com/keys and try again.');
      }
      if (err.status === 429) {
        throw ApiError.tooManyRequests('Groq API rate limit reached for this key. Please verify your quota on https://console.groq.com.');
      }
      const message = err.message || 'Unable to verify Groq API key with provider.';
      throw ApiError.badRequest(`Groq API key verification failed: ${message}`);
    }
  }

  /**
   * Verifies, encrypts, and saves the user's personal Groq API key
   */
  static async saveUserKey(userId: string, apiKey: string): Promise<{ maskedKey: string; model: string }> {
    if (!userId) {
      throw ApiError.unauthorized('Authentication required to save Groq API key');
    }

    // 1. Validate key with Groq
    const verification = await this.verifyGroqKey(apiKey);

    // 2. Encrypt and mask key
    const encryptedKey = EncryptionService.encrypt(apiKey.trim());
    const maskedKey = EncryptionService.maskApiKey(apiKey.trim());

    // 3. Save in Supabase
    const supabase = getSupabaseClient();
    let savedInDb = false;

    if (supabase) {
      try {
        const { error } = await supabase.from('user_api_keys').upsert({
          user_id: userId,
          provider: 'groq',
          encrypted_key: encryptedKey,
          masked_key: maskedKey,
          is_valid: true,
          updated_at: new Date().toISOString(),
        });
        if (!error) {
          savedInDb = true;
        }
      } catch {
        // Fallback to local store
      }
    }

    // If Supabase table isn't present or failed, save in encrypted local store
    if (!savedInDb) {
      const localKeys = this.readLocalJson<{ encrypted: string; masked: string; isValid: boolean }>(this.getLocalKeysPath());
      localKeys[userId] = {
        encrypted: encryptedKey,
        masked: maskedKey,
        isValid: true,
      };
      this.writeLocalJson(this.getLocalKeysPath(), localKeys);
    }

    return { maskedKey, model: verification.model };
  }

  /**
   * Deletes the user's stored personal Groq key
   */
  static async deleteUserKey(userId: string): Promise<boolean> {
    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('user_api_keys')
          .delete()
          .eq('user_id', userId)
          .eq('provider', 'groq');
      } catch {
        // ignore
      }
    }

    // Also remove from local fallback store
    const localKeys = this.readLocalJson(this.getLocalKeysPath());
    delete localKeys[userId];
    this.writeLocalJson(this.getLocalKeysPath(), localKeys);

    return true;
  }

  /**
   * Marks a user's stored key as invalid (e.g. when Groq returns 401 during chat)
   */
  static async markUserKeyInvalid(userId: string): Promise<void> {
    if (!userId) return;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('user_api_keys')
          .update({ is_valid: false, updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('provider', 'groq');
      } catch {
        // ignore
      }
    }

    const localKeys = this.readLocalJson<{ encrypted: string; masked: string; isValid: boolean }>(this.getLocalKeysPath());
    if (localKeys[userId]) {
      localKeys[userId].isValid = false;
      this.writeLocalJson(this.getLocalKeysPath(), localKeys);
    }
  }

  /**
   * Aggregates usage limit and key configuration summary for a user
   */
  static async getSummary(userId: string): Promise<UserAiUsageSummary> {
    const usage = await this.getUserUsage(userId);
    const keyMeta = await this.getUserKeyMetadata(userId);

    const remaining = Math.max(0, usage.limit - usage.used);
    let keyStatus: 'connected' | 'invalid' | 'none' = 'none';

    if (keyMeta.hasKey) {
      keyStatus = keyMeta.isValid ? 'connected' : 'invalid';
    }

    return {
      freeRequestsLimit: usage.limit,
      freeRequestsUsed: usage.used,
      freeRequestsRemaining: remaining,
      hasCustomKey: keyMeta.hasKey,
      customKeyMasked: keyMeta.maskedKey,
      customKeyStatus: keyStatus,
    };
  }
}

