import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface DashboardSummary {
  totalProblems: number;
  solvedProblems: number;
  attemptedProblems: number;
  completionRate: number;
}

export interface DifficultyProgressData {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  solved: number;
  total: number;
  rate: number;
  color: string;
}

export interface TopicProgressData {
  id: string;
  name: string;
  slug: string;
  solved: number;
  total: number;
  rate: number;
}

export interface RecentActivityItem {
  id: string;
  actionType: 'attempted' | 'solved' | 'revisited' | 'note_added';
  problemTitle: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  createdAt: string;
}

export interface DailyActivityItem {
  date: string; // YYYY-MM-DD
  count: number;
  solvedCount: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  difficulties: DifficultyProgressData[];
  topics: TopicProgressData[];
  recentActivity: RecentActivityItem[];
  dailyActivity: DailyActivityItem[];
  isLibraryLoaded: boolean;
  error?: string | null;
}

// Default real empty state for new accounts / unpopulated library
export const createEmptyDashboardData = (): DashboardData => ({
  summary: {
    totalProblems: 0,
    solvedProblems: 0,
    attemptedProblems: 0,
    completionRate: 0,
  },
  difficulties: [
    { difficulty: 'Easy', solved: 0, total: 0, rate: 0, color: '#10B981' },
    { difficulty: 'Medium', solved: 0, total: 0, rate: 0, color: '#F59E0B' },
    { difficulty: 'Hard', solved: 0, total: 0, rate: 0, color: '#EF4444' },
  ],
  topics: [
    { id: '1', name: 'Arrays', slug: 'arrays', solved: 0, total: 0, rate: 0 },
    { id: '2', name: 'Strings', slug: 'strings', solved: 0, total: 0, rate: 0 },
    { id: '3', name: 'Hash Maps', slug: 'hash-maps', solved: 0, total: 0, rate: 0 },
    { id: '4', name: 'Linked Lists', slug: 'linked-lists', solved: 0, total: 0, rate: 0 },
    { id: '5', name: 'Trees', slug: 'trees', solved: 0, total: 0, rate: 0 },
    { id: '6', name: 'Graphs', slug: 'graphs', solved: 0, total: 0, rate: 0 },
    { id: '7', name: 'Dynamic Programming', slug: 'dynamic-programming', solved: 0, total: 0, rate: 0 },
    { id: '8', name: 'Binary Search', slug: 'binary-search', solved: 0, total: 0, rate: 0 },
    { id: '9', name: 'Stack & Queue', slug: 'stack-queue', solved: 0, total: 0, rate: 0 },
    { id: '10', name: 'Sliding Window', slug: 'sliding-window', solved: 0, total: 0, rate: 0 },
    { id: '11', name: 'Two Pointers', slug: 'two-pointers', solved: 0, total: 0, rate: 0 },
  ],
  recentActivity: [],
  dailyActivity: [],
  isLibraryLoaded: false,
  error: null,
});

export async function fetchUserDashboardData(userId: string): Promise<DashboardData> {
  const empty = createEmptyDashboardData();

  if (!isSupabaseConfigured() || !userId) {
    return empty;
  }

  try {
    // 1. Check if the 'problems' table exists and fetch total counts
    const { data: problemsData, error: problemsError } = await supabase
      .from('problems')
      .select('id, difficulty');

    const isLibraryLoaded = !problemsError && Array.isArray(problemsData) && problemsData.length > 0;
    const totalProblems = isLibraryLoaded ? problemsData.length : 0;

    // Count difficulty totals in library
    let totalEasy = 0;
    let totalMedium = 0;
    let totalHard = 0;

    if (isLibraryLoaded) {
      problemsData.forEach((p) => {
        if (p.difficulty === 'Easy') totalEasy++;
        else if (p.difficulty === 'Medium') totalMedium++;
        else if (p.difficulty === 'Hard') totalHard++;
      });
    }

    // 2. Fetch authenticated user's problem progress
    const { data: progressData } = await supabase
      .from('user_problem_progress')
      .select('problem_id, status, problems(id, difficulty)')
      .eq('user_id', userId);

    let solvedCount = 0;
    let attemptedCount = 0;
    let solvedEasy = 0;
    let solvedMedium = 0;
    let solvedHard = 0;

    if (Array.isArray(progressData)) {
      progressData.forEach((item: any) => {
        if (item.status === 'solved') {
          solvedCount++;
          const diff = item.problems?.difficulty;
          if (diff === 'Easy') solvedEasy++;
          else if (diff === 'Medium') solvedMedium++;
          else if (diff === 'Hard') solvedHard++;
        } else if (item.status === 'attempted') {
          attemptedCount++;
        }
      });
    }

    const completionRate = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

    // 3. Fetch user's recent activity logs
    const { data: activityData } = await supabase
      .from('user_activity_logs')
      .select('id, action_type, problem_title, difficulty, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const recentActivity: RecentActivityItem[] = Array.isArray(activityData)
      ? activityData.map((a: any) => ({
          id: a.id,
          actionType: a.action_type,
          problemTitle: a.problem_title || 'Coding Problem',
          difficulty: a.difficulty,
          createdAt: a.created_at,
        }))
      : [];

    return {
      summary: {
        totalProblems,
        solvedProblems: solvedCount,
        attemptedProblems: attemptedCount,
        completionRate,
      },
      difficulties: [
        {
          difficulty: 'Easy',
          solved: solvedEasy,
          total: totalEasy,
          rate: totalEasy > 0 ? Math.round((solvedEasy / totalEasy) * 100) : 0,
          color: '#10B981',
        },
        {
          difficulty: 'Medium',
          solved: solvedMedium,
          total: totalMedium,
          rate: totalMedium > 0 ? Math.round((solvedMedium / totalMedium) * 100) : 0,
          color: '#F59E0B',
        },
        {
          difficulty: 'Hard',
          solved: solvedHard,
          total: totalHard,
          rate: totalHard > 0 ? Math.round((solvedHard / totalHard) * 100) : 0,
          color: '#EF4444',
        },
      ],
      topics: empty.topics,
      recentActivity,
      dailyActivity: [],
      isLibraryLoaded,
      error: null,
    };
  } catch (err: any) {
    console.warn('[AlgoTrack] Error querying dashboard metrics:', err);
    return empty;
  }
}
