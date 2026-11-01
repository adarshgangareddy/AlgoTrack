import { supabase, isSupabaseConfigured } from '../lib/supabase';
import leetcodeIndexData from '../data/leetcodeIndex.json';

export interface UserProfileStats {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalAttempted: number;
  totalUnsolved: number;
  totalProblems: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  activeDaysCount: number;
}

export interface TopicStat {
  topic: string;
  solved: number;
  total: number;
  percentage: number;
}

export interface ActivityHeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface ActivityLogItem {
  id: string;
  actionType: 'attempted' | 'solved' | 'not_started';
  problemTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problemId: string;
  createdAt: string;
}

export interface CumulativeProgressPoint {
  date: string; // YYYY-MM-DD
  totalSolved: number;
}

export interface ProfileAnalyticsData {
  stats: UserProfileStats;
  difficultyDistribution: {
    easy: { solved: number; total: number };
    medium: { solved: number; total: number };
    hard: { solved: number; total: number };
  };
  topicStats: TopicStat[];
  activityHeatmap: ActivityHeatmapDay[];
  cumulativeProgress: CumulativeProgressPoint[];
  recentActivity: ActivityLogItem[];
  insights: {
    mostPracticedTopic: string;
    strongestDifficulty: string;
    weakestTopic: string;
    practiceConsistency: string;
  };
}

// Compute total problems per topic across library
const TOPIC_TOTALS: Record<string, number> = {};
const RAW_INDEX = leetcodeIndexData as Array<{
  num: number;
  title: string;
  slug: string;
  diff: string;
  topics: string[];
}>;

RAW_INDEX.forEach((item) => {
  (item.topics || []).forEach((t) => {
    TOPIC_TOTALS[t] = (TOPIC_TOTALS[t] || 0) + 1;
  });
});

export async function fetchUserProfileAnalytics(userId: string): Promise<ProfileAnalyticsData> {
  const TOTAL_PROBLEMS = 2913;
  const TOTAL_EASY = 763;
  const TOTAL_MEDIUM = 1464;
  const TOTAL_HARD = 686;

  let solvedEasy = 0;
  let solvedMedium = 0;
  let solvedHard = 0;
  let totalSolved = 0;
  let totalAttempted = 0;

  const topicSolvedMap: Record<string, number> = {};
  const dateSolvedCountMap: Record<string, number> = {};
  const activeDateSet = new Set<string>();

  const recentActivity: ActivityLogItem[] = [];

  if (isSupabaseConfigured() && userId) {
    try {
      // 1. Fetch user progress with problems join
      const { data: progressData } = await supabase
        .from('user_problem_progress')
        .select('problem_id, status, solved_at, updated_at, problems(id, title, difficulty, topics, slug)')
        .eq('user_id', userId);

      if (Array.isArray(progressData)) {
        progressData.forEach((row: any) => {
          const status = row.status;
          const diff = row.problems?.difficulty;
          const topics = row.problems?.topics || [];
          const solvedAt = row.solved_at || row.updated_at;

          if (status === 'solved') {
            totalSolved++;
            if (diff === 'Easy') solvedEasy++;
            else if (diff === 'Medium') solvedMedium++;
            else if (diff === 'Hard') solvedHard++;

            topics.forEach((t: string) => {
              topicSolvedMap[t] = (topicSolvedMap[t] || 0) + 1;
            });

            if (solvedAt) {
              const dayStr = solvedAt.split('T')[0];
              dateSolvedCountMap[dayStr] = (dateSolvedCountMap[dayStr] || 0) + 1;
              activeDateSet.add(dayStr);
            }
          } else if (status === 'attempted') {
            totalAttempted++;
            if (row.updated_at) {
              activeDateSet.add(row.updated_at.split('T')[0]);
            }
          }
        });
      }

      // 2. Fetch user activity logs for recent activity & calendar
      const { data: activityLogs } = await supabase
        .from('user_activity_logs')
        .select('id, problem_id, action_type, problem_title, difficulty, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (Array.isArray(activityLogs)) {
        activityLogs.forEach((act: any) => {
          recentActivity.push({
            id: act.id,
            problemId: act.problem_id,
            actionType: act.action_type,
            problemTitle: act.problem_title || 'Coding Problem',
            difficulty: act.difficulty || 'Medium',
            createdAt: act.created_at,
          });

          if (act.created_at) {
            const day = act.created_at.split('T')[0];
            activeDateSet.add(day);
          }
        });
      }
    } catch (err) {
      console.warn('[AlgoTrack] Error loading profile analytics from Supabase:', err);
    }
  }

  // Calculate streaks
  const sortedActiveDays = Array.from(activeDateSet).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  if (sortedActiveDays.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Compute longest streak
    for (let i = 0; i < sortedActiveDays.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedActiveDays[i - 1]);
        const curr = new Date(sortedActiveDays[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    // Check if current streak is active (today or yesterday)
    const lastActiveDay = sortedActiveDays[sortedActiveDays.length - 1];
    if (lastActiveDay === today || lastActiveDay === yesterday) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }
  }

  // Build last 365 days heatmap
  const activityHeatmap: ActivityHeatmapDay[] = [];
  const now = new Date();
  for (let d = 364; d >= 0; d--) {
    const targetDate = new Date(now.getTime() - d * 86400000);
    const dateStr = targetDate.toISOString().split('T')[0];
    activityHeatmap.push({
      date: dateStr,
      count: dateSolvedCountMap[dateStr] || (activeDateSet.has(dateStr) ? 1 : 0),
    });
  }

  // Build cumulative progress line chart
  const cumulativeProgress: CumulativeProgressPoint[] = [];
  let runningSum = 0;
  const sortedSolvedDates = Object.keys(dateSolvedCountMap).sort();
  sortedSolvedDates.forEach((date) => {
    runningSum += dateSolvedCountMap[date];
    cumulativeProgress.push({
      date,
      totalSolved: runningSum,
    });
  });

  // Top topic stats
  const popularTopics = [
    'Array',
    'String',
    'Hash Table',
    'Dynamic Programming',
    'Linked List',
    'Tree',
    'Binary Search',
    'Two Pointers',
    'Stack',
    'Graph',
    'Greedy',
    'Backtracking',
  ];

  const topicStats: TopicStat[] = popularTopics.map((topic) => {
    const solved = topicSolvedMap[topic] || 0;
    const total = TOPIC_TOTALS[topic] || 50;
    return {
      topic,
      solved,
      total,
      percentage: total > 0 ? Math.round((solved / total) * 100) : 0,
    };
  });

  // Insights calculation
  let mostPracticedTopic = 'Arrays';
  let maxTopicSolved = -1;
  topicStats.forEach((t) => {
    if (t.solved > maxTopicSolved) {
      maxTopicSolved = t.solved;
      mostPracticedTopic = t.topic;
    }
  });

  const strongestDifficulty =
    solvedHard > solvedMedium && solvedHard > solvedEasy
      ? 'Hard'
      : solvedMedium > solvedEasy
      ? 'Medium'
      : 'Easy';

  const weakestTopic = topicStats
    .filter((t) => t.solved === 0)
    .map((t) => t.topic)[0] || 'Dynamic Programming';

  const practiceConsistency =
    currentStreak >= 7 ? 'High (Daily Practice)' : currentStreak >= 3 ? 'Consistent' : 'Building Momentum';

  return {
    stats: {
      totalSolved,
      easySolved: solvedEasy,
      mediumSolved: solvedMedium,
      hardSolved: solvedHard,
      totalAttempted,
      totalUnsolved: Math.max(0, TOTAL_PROBLEMS - totalSolved - totalAttempted),
      totalProblems: TOTAL_PROBLEMS,
      completionRate: Math.round((totalSolved / TOTAL_PROBLEMS) * 100),
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      activeDaysCount: activeDateSet.size,
    },
    difficultyDistribution: {
      easy: { solved: solvedEasy, total: TOTAL_EASY },
      medium: { solved: solvedMedium, total: TOTAL_MEDIUM },
      hard: { solved: solvedHard, total: TOTAL_HARD },
    },
    topicStats,
    activityHeatmap,
    cumulativeProgress,
    recentActivity,
    insights: {
      mostPracticedTopic: maxTopicSolved > 0 ? mostPracticedTopic : 'None yet',
      strongestDifficulty: totalSolved > 0 ? strongestDifficulty : 'Ready to start',
      weakestTopic,
      practiceConsistency,
    },
  };
}
