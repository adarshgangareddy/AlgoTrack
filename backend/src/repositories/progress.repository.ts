// backend/src/repositories/progress.repository.ts

import { getSupabaseClient } from '../config/supabase.js';
import { ProblemProgressStatus } from '../types/problem.types.js';

export class ProgressRepository {
  async getStatusForProblem(userId: string, problemId: string): Promise<ProblemProgressStatus> {
    const supabase = getSupabaseClient();
    if (!supabase) return 'not_started';

    try {
      const { data, error } = await supabase
        .from('user_problem_progress')
        .select('status')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .single();

      if (!error && data?.status) {
        return data.status as ProblemProgressStatus;
      }
    } catch {
      // return default
    }

    return 'not_started';
  }

  async getAllProgressForUser(userId: string): Promise<Record<string, ProblemProgressStatus>> {
    const map: Record<string, ProblemProgressStatus> = {};
    const supabase = getSupabaseClient();
    if (!supabase) return map;

    try {
      const { data, error } = await supabase
        .from('user_problem_progress')
        .select('problem_id, status')
        .eq('user_id', userId);

      if (!error && data) {
        for (const row of data) {
          map[row.problem_id] = row.status as ProblemProgressStatus;
        }
      }
    } catch (err) {
      console.warn('[Backend ProgressRepository] Error fetching user progress:', err);
    }

    return map;
  }

  async updateProgress(params: {
    userId: string;
    problemId: string;
    status: ProblemProgressStatus;
    problemTitle?: string;
    problemDifficulty?: string;
  }): Promise<{ status: ProblemProgressStatus; updated_at: string }> {
    const { userId, problemId, status, problemTitle, problemDifficulty } = params;
    const now = new Date().toISOString();
    const supabase = getSupabaseClient();

    if (supabase) {
      if (status === 'not_started') {
        await supabase
          .from('user_problem_progress')
          .delete()
          .eq('user_id', userId)
          .eq('problem_id', problemId);
      } else {
        await supabase
          .from('user_problem_progress')
          .upsert(
            {
              user_id: userId,
              problem_id: problemId,
              status,
              solved_at: status === 'solved' ? now : null,
              updated_at: now,
            },
            { onConflict: 'user_id,problem_id' }
          );

        // Record activity log
        await supabase.from('user_activity_logs').insert({
          user_id: userId,
          problem_id: problemId,
          action_type: status,
          problem_title: problemTitle || 'Problem',
          difficulty: problemDifficulty || 'Medium',
          created_at: now,
        });
      }
    }

    return { status, updated_at: now };
  }
}

