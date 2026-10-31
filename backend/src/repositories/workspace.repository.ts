// backend/src/repositories/workspace.repository.ts

import { getSupabaseClient } from '../config/supabase.js';
import { UserWorkspaceEntity, UserSolutionEntity, ProblemProgressStatus } from '../types/problem.types.js';

export class WorkspaceRepository {
  async getWorkspace(userId: string, problemId: string): Promise<{
    workspace: UserWorkspaceEntity | null;
    solutions: Record<string, string>;
    status: ProblemProgressStatus;
  }> {
    const supabase = getSupabaseClient();
    const result = {
      workspace: null as UserWorkspaceEntity | null,
      solutions: {} as Record<string, string>,
      status: 'not_started' as ProblemProgressStatus,
    };

    if (!supabase) return result;

    try {
      // 1. Fetch workspace
      const { data: wsData } = await supabase
        .from('user_problem_workspace')
        .select('*')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .single();

      if (wsData) result.workspace = wsData as UserWorkspaceEntity;

      // 2. Fetch solutions
      const { data: solData } = await supabase
        .from('user_problem_solutions')
        .select('language, source_code')
        .eq('user_id', userId)
        .eq('problem_id', problemId);

      if (solData) {
        for (const row of solData) {
          result.solutions[row.language] = row.source_code;
        }
      }

      // 3. Fetch status
      const { data: progData } = await supabase
        .from('user_problem_progress')
        .select('status')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .single();

      if (progData?.status) result.status = progData.status as ProblemProgressStatus;
    } catch (err) {
      console.warn('[Backend WorkspaceRepository] Query error:', err);
    }

    return result;
  }

  async saveWorkspace(params: {
    userId: string;
    problemId: string;
    workspace: {
      personal_notes?: string;
      personal_approach?: string;
      time_complexity?: string;
      space_complexity?: string;
      mistakes_and_edge_cases?: string;
    };
    activeLanguage: string;
    sourceCode: string;
    status: ProblemProgressStatus;
    problemTitle?: string;
    problemDifficulty?: string;
  }): Promise<{ updated_at: string }> {
    const { userId, problemId, workspace, activeLanguage, sourceCode, status, problemTitle, problemDifficulty } = params;
    const now = new Date().toISOString();
    const supabase = getSupabaseClient();

    if (supabase) {
      // 1. Upsert workspace notes
      await supabase.from('user_problem_workspace').upsert(
        {
          user_id: userId,
          problem_id: problemId,
          personal_notes: workspace.personal_notes || '',
          personal_approach: workspace.personal_approach || '',
          time_complexity: workspace.time_complexity || '',
          space_complexity: workspace.space_complexity || '',
          mistakes_and_edge_cases: workspace.mistakes_and_edge_cases || '',
          updated_at: now,
        },
        { onConflict: 'user_id,problem_id' }
      );

      // 2. Upsert solution
      if (sourceCode && activeLanguage) {
        await supabase.from('user_problem_solutions').upsert(
          {
            user_id: userId,
            problem_id: problemId,
            language: activeLanguage,
            source_code: sourceCode,
            updated_at: now,
          },
          { onConflict: 'user_id,problem_id,language' }
        );
      }

      // 3. Update status
      if (status === 'not_started') {
        await supabase
          .from('user_problem_progress')
          .delete()
          .eq('user_id', userId)
          .eq('problem_id', problemId);
      } else {
        await supabase.from('user_problem_progress').upsert(
          {
            user_id: userId,
            problem_id: problemId,
            status,
            solved_at: status === 'solved' ? now : null,
            updated_at: now,
          },
          { onConflict: 'user_id,problem_id' }
        );

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

    return { updated_at: now };
  }
}
