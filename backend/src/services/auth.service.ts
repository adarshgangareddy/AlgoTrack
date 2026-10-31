// backend/src/services/auth.service.ts

import { getSupabaseClient } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

export class AuthService {
  async verifySession(token: string) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw ApiError.internal('Database connection not configured');
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      throw ApiError.unauthorized('Invalid or expired authentication session');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      user_metadata: user.user_metadata,
    };
  }

  async getUserProfile(userId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  }
}

