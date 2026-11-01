import { supabase, isSupabaseConfigured } from '../lib/supabase';
import leetcodeIndexData from '../data/leetcodeIndex.json';
import problemUuidMapData from '../data/problemUuidMap.json';

const problemUuidMap: Record<string, string> = problemUuidMapData as Record<string, string>;

/**
 * Returns the standardized Supabase UUID for a problem slug or identifier
 */
export function getProblemUuid(slugOrId: string): string {
  const normalized = slugOrId.toLowerCase().trim().replace(/^p\d+-/, '');
  if (problemUuidMap[normalized]) {
    return problemUuidMap[normalized];
  }
  if (problemUuidMap[slugOrId]) {
    return problemUuidMap[slugOrId];
  }
  // If already a valid UUID format, return it
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId)) {
    return slugOrId;
  }
  return slugOrId;
}

export interface Problem {
  id: string;
  problem_number?: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  pattern?: string;
  leetcode_url?: string;
  description?: string;
  theory_content?: string;
  topics?: string[];
  hints?: string[];
}

export interface UserWorkspaceData {
  id?: string;
  user_id: string;
  problem_id: string;
  personal_notes: string;
  personal_approach: string;
  time_complexity: string;
  space_complexity: string;
  mistakes_and_edge_cases: string;
  updated_at?: string;
}

export interface UserSolutionRecord {
  language: string;
  source_code: string;
  updated_at?: string;
}

export type ProblemStatus = 'not_started' | 'attempted' | 'solved';

// In-memory cache for loaded problem details
const problemDetailsCache = new Map<string, Problem>();

// Curated core problem dataset with rich hand-crafted theory
export const CURATED_PROBLEMS: Problem[] = [
  {
    id: 'p1-two-sum',
    problem_number: 1,
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    pattern: 'Hash Map / Array Lookup',
    leetcode_url: 'https://leetcode.com/problems/two-sum/',
    topics: ['Arrays', 'Hash Maps'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    theory_content: 'The naive brute force approach checks all pairs in O(N^2) time. By using a hash map to record the complement (target - num) and its index, we can resolve matches in a single linear pass with O(N) time and O(N) space.'
  },
  {
    id: 'p3-longest-substring',
    problem_number: 3,
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    pattern: 'Sliding Window',
    leetcode_url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    topics: ['Strings', 'Sliding Window', 'Hash Maps'],
    description: 'Given a string s, find the length of the longest substring without duplicate characters.',
    theory_content: 'Maintain a dynamic window [left, right] using a hash map or character array storing the last seen index of each character. When a duplicate is encountered, slide left forward to the index after the previous occurrence.'
  },
  {
    id: 'p11-container-with-most-water',
    problem_number: 11,
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Medium',
    pattern: 'Two Pointers',
    leetcode_url: 'https://leetcode.com/problems/container-with-most-water/',
    topics: ['Arrays', 'Two Pointers'],
    description: 'You are given an integer array height of length n. Find two lines that together with the x-axis form a container that contains the most water.',
    theory_content: 'Place two pointers at the extreme ends of the array. The area is bounded by the shorter line multiplied by the width. To find a potentially larger area, always move the pointer pointing to the shorter vertical bar inward.'
  },
  {
    id: 'p15-3sum',
    problem_number: 15,
    title: '3Sum',
    slug: '3sum',
    difficulty: 'Medium',
    pattern: 'Two Pointers / Sorting',
    leetcode_url: 'https://leetcode.com/problems/3sum/',
    topics: ['Arrays', 'Two Pointers', 'Sorting'],
    description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
    theory_content: 'Sort the array first to enable two-pointer scanning and duplicate skipping. Fix the first element nums[i] in a loop, then use two pointers (left = i + 1, right = n - 1) to find pairs summing to -nums[i].'
  },
  {
    id: 'p20-valid-parentheses',
    problem_number: 20,
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    pattern: 'Stack',
    leetcode_url: 'https://leetcode.com/problems/valid-parentheses/',
    topics: ['Strings', 'Stack'],
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    theory_content: 'Use a Last-In First-Out (LIFO) stack. Push expected closing brackets when an opening bracket is met, or verify that the top element matches and pops when encountering a closing symbol.'
  },
  {
    id: 'p42-trapping-rain-water',
    problem_number: 42,
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'Hard',
    pattern: 'Two Pointers / Monotonic Stack',
    leetcode_url: 'https://leetcode.com/problems/trapping-rain-water/',
    topics: ['Arrays', 'Two Pointers', 'Dynamic Programming'],
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    theory_content: 'The water above any bar is min(max_left, max_right) - height[i]. Using two pointers moving from exterior inward while tracking left_max and right_max eliminates auxiliary array storage.'
  },
  {
    id: 'p53-maximum-subarray',
    problem_number: 53,
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    pattern: 'Dynamic Programming / Kadane Algorithm',
    leetcode_url: 'https://leetcode.com/problems/maximum-subarray/',
    topics: ['Arrays', 'Dynamic Programming'],
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    theory_content: "Kadane's algorithm iterates through the array while maintaining current_sum = max(num, current_sum + num). If the running sum becomes negative, starting fresh at the next number yields a higher potential."
  },
  {
    id: 'p70-climbing-stairs',
    problem_number: 70,
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'Easy',
    pattern: 'Dynamic Programming / Fibonacci',
    leetcode_url: 'https://leetcode.com/problems/climbing-stairs/',
    topics: ['Dynamic Programming', 'Math'],
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    theory_content: 'Notice that to reach step n, you must arrive from either step n-1 or step n-2. Thus ways(n) = ways(n-1) + ways(n-2), mirroring the Fibonacci recurrence, reducible to O(1) space with two variables.'
  },
  {
    id: 'p121-best-time-to-buy-and-sell-stock',
    problem_number: 121,
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy',
    pattern: 'Greedy / Sliding Window',
    leetcode_url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    topics: ['Arrays', 'Dynamic Programming'],
    description: 'You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
    theory_content: 'Iterate once through the prices array while keeping track of the minimum price observed so far. Calculate potential profit at each day (price - min_price) and maintain the global maximum.'
  },
  {
    id: 'p141-linked-list-cycle',
    problem_number: 141,
    title: 'Linked List Cycle',
    slug: 'linked-list-cycle',
    difficulty: 'Easy',
    pattern: 'Fast & Slow Pointers / Floyd Cycle Detection',
    leetcode_url: 'https://leetcode.com/problems/linked-list-cycle/',
    topics: ['Linked Lists', 'Two Pointers'],
    description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it.',
    theory_content: "Floyd's cycle-finding algorithm uses two pointers moving at different speeds (slow by 1, fast by 2). If there is a cycle, the fast pointer is guaranteed to catch up to the slow pointer within the loop."
  },
  {
    id: 'p200-number-of-islands',
    problem_number: 200,
    title: 'Number of Islands',
    slug: 'number-of-islands',
    difficulty: 'Medium',
    pattern: 'Graph / DFS & BFS',
    leetcode_url: 'https://leetcode.com/problems/number-of-islands/',
    topics: ['Arrays', 'Graph', 'DFS / BFS'],
    description: 'Given an m x n 2D binary grid grid which represents a map of "1"s (land) and "0"s (water), return the number of islands.',
    theory_content: 'Scan every cell in the matrix. Whenever a "1" is encountered, increment the island count and initiate a Breadth-First or Depth-First search to sink or mark all adjacent connected land cells to "0".'
  },
  {
    id: 'p206-reverse-linked-list',
    problem_number: 206,
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'Easy',
    pattern: 'Linked Lists / In-Place Reversal',
    leetcode_url: 'https://leetcode.com/problems/reverse-linked-list/',
    topics: ['Linked Lists', 'Recursion'],
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    theory_content: 'Maintain three pointers: prev (initially null), curr (starting at head), and next_temp. In each iteration, save curr.next, invert the link (curr.next = prev), and shift both prev and curr forward.'
  },
  {
    id: 'p23-merge-k-sorted-lists',
    problem_number: 23,
    title: 'Merge k Sorted Lists',
    slug: 'merge-k-sorted-lists',
    difficulty: 'Hard',
    pattern: 'Heap / Priority Queue / Divide & Conquer',
    leetcode_url: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    topics: ['Linked Lists', 'Divide and Conquer', 'Heap'],
    description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    theory_content: 'A min-heap / priority queue storing the heads of all k lists allows retrieving the smallest node across lists in O(log k) time, yielding an optimal overall runtime of O(N log k).'
  }
];

// Combine index problems with curated data
function buildAllProblemsList(): Problem[] {
  const curatedMap = new Map<string, Problem>();
  CURATED_PROBLEMS.forEach((p) => {
    curatedMap.set(p.slug, {
      ...p,
      id: getProblemUuid(p.slug)
    });
  });

  const list: Problem[] = [];

  const rawList = leetcodeIndexData as Array<{
    num: number;
    title: string;
    slug: string;
    diff: string;
    topics: string[];
  }>;

  for (const item of rawList) {
    const existing = curatedMap.get(item.slug);
    if (existing) {
      list.push(existing);
      curatedMap.delete(item.slug);
    } else {
      const difficulty = (item.diff === 'Hard' || item.diff === 'Medium' ? item.diff : 'Easy') as 'Easy' | 'Medium' | 'Hard';
      const uuid = getProblemUuid(item.slug);
      list.push({
        id: uuid,
        problem_number: item.num,
        title: item.title,
        slug: item.slug,
        difficulty,
        pattern: item.topics && item.topics.length > 0 ? item.topics[0] : 'General Algorithm',
        leetcode_url: `https://leetcode.com/problems/${item.slug}/`,
        topics: item.topics || ['General'],
        description: `LeetCode challenge #${item.num}: ${item.title}. Master this ${difficulty} level interview question.`,
      });
    }
  }

  // Add any remaining curated items
  curatedMap.forEach((p) => list.push(p));

  // Sort by problem number
  return list.sort((a, b) => (a.problem_number || 99999) - (b.problem_number || 99999));
}

let cachedAllProblems: Problem[] | null = null;

// Multi-language starter templates
export const STARTER_CODE_TEMPLATES: Record<string, string> = {
  python: `# Write your solution in Python 3\nclass Solution:\n    def solve(self) -> None:\n        # Your implementation here\n        pass\n`,
  typescript: `// Write your solution in TypeScript\nfunction solve(): void {\n  // Your implementation here\n}\n`,
  javascript: `// Write your solution in JavaScript\nfunction solve() {\n  // Your implementation here\n}\n`,
  java: `// Write your solution in Java\nclass Solution {\n    public void solve() {\n        // Your implementation here\n    }\n}\n`,
  cpp: `// Write your solution in C++\n#include <iostream>\n#include <vector>\n\nclass Solution {\npublic:\n    void solve() {\n        // Your implementation here\n    }\n};\n`
};

/**
 * Fetch all available problems (2,913+ LeetCode problems)
 */
export async function fetchAllProblems(): Promise<Problem[]> {
  if (!cachedAllProblems) {
    cachedAllProblems = buildAllProblemsList();
  }
  return cachedAllProblems;
}

/**
 * Fetch a single problem by slug, including full descriptions and hints
 */
export async function fetchProblemBySlug(slug: string): Promise<Problem | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  // Check cache first
  if (problemDetailsCache.has(normalizedSlug)) {
    return problemDetailsCache.get(normalizedSlug)!;
  }

  // 1. Check curated list
  const curated = CURATED_PROBLEMS.find((p) => p.slug === normalizedSlug);
  if (curated) {
    const enrichedCurated = {
      ...curated,
      id: getProblemUuid(curated.slug)
    };
    problemDetailsCache.set(normalizedSlug, enrichedCurated);
    return enrichedCurated;
  }

  // 2. Search in all indexed problems
  const all = await fetchAllProblems();
  const indexed = all.find((p) => p.slug === normalizedSlug || p.problem_number?.toString() === normalizedSlug);

  if (indexed) {
    // Try to dynamically fetch richer details (descriptions, hints) from open dataset
    try {
      const paddedNum = String(indexed.problem_number || 0).padStart(4, '0');
      const url = `https://raw.githubusercontent.com/neenza/leetcode-problems/master/problems/${paddedNum}-${indexed.slug}.json`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const details = await res.json();
        const enriched: Problem = {
          ...indexed,
          description: details.description || indexed.description,
          hints: details.hints || [],
          theory_content: details.solution || indexed.theory_content,
        };
        problemDetailsCache.set(normalizedSlug, enriched);
        return enriched;
      }
    } catch {
      // Offline fallback: return indexed problem directly
    }

    problemDetailsCache.set(normalizedSlug, indexed);
    return indexed;
  }

  // 3. Fallback for custom or high-number problems (up to 4096+)
  const fallbackNum = parseInt(normalizedSlug.replace(/\D/g, ''), 10) || undefined;
  const fallbackTitle = normalizedSlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const dynamicProblem: Problem = {
    id: `p-${normalizedSlug}`,
    problem_number: fallbackNum,
    title: fallbackTitle,
    slug: normalizedSlug,
    difficulty: 'Medium',
    pattern: 'Algorithm & Data Structures',
    leetcode_url: `https://leetcode.com/problems/${normalizedSlug}/`,
    topics: ['Algorithms'],
    description: `Practice and track your solution for ${fallbackTitle} on AlgoTrack.`,
  };

  problemDetailsCache.set(normalizedSlug, dynamicProblem);
  return dynamicProblem;
}

/**
 * Fetch user's status for a problem
 */
export async function fetchUserProblemProgress(userId: string, problemId: string): Promise<ProblemStatus> {
  if (!userId || !problemId) return 'not_started';
  const canonicalId = getProblemUuid(problemId);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('user_problem_progress')
        .select('status')
        .eq('user_id', userId)
        .eq('problem_id', canonicalId)
        .single();

      if (!error && data?.status) {
        return data.status as ProblemStatus;
      }
    } catch {
      // Fallback below
    }
  }

  const localKey = `algotrack_prog_${userId}_${canonicalId}`;
  const stored = localStorage.getItem(localKey) || localStorage.getItem(`algotrack_prog_${userId}_${problemId}`);
  if (stored === 'attempted' || stored === 'solved') {
    return stored;
  }
  return 'not_started';
}

/**
 * Batch fetch user problem statuses (Instant 1-query load for entire library)
 */
export async function fetchUserProblemProgressBatch(userId: string): Promise<Record<string, ProblemStatus>> {
  const map: Record<string, ProblemStatus> = {};
  if (!userId) return map;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('user_problem_progress')
        .select('problem_id, status')
        .eq('user_id', userId);

      if (!error && data) {
        for (const row of data) {
          map[row.problem_id] = row.status as ProblemStatus;
        }
      }
    } catch {
      // continue to local storage
    }
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`algotrack_prog_${userId}_`)) {
        const rawProbId = key.replace(`algotrack_prog_${userId}_`, '');
        const canonicalId = getProblemUuid(rawProbId);
        const val = localStorage.getItem(key);
        if (val === 'attempted' || val === 'solved') {
          map[canonicalId] = val as ProblemStatus;
          map[rawProbId] = val as ProblemStatus;
        }
      }
    }
  } catch {
    // ignore
  }

  return map;
}

/**
 * Fetch user's workspace notes/approach
 */
export async function fetchUserWorkspace(userId: string, problemId: string): Promise<UserWorkspaceData | null> {
  if (!userId || !problemId) return null;
  const canonicalId = getProblemUuid(problemId);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('user_problem_workspace')
        .select('*')
        .eq('user_id', userId)
        .eq('problem_id', canonicalId)
        .single();

      if (!error && data) {
        return data as UserWorkspaceData;
      }
    } catch {
      // Fallback below
    }
  }

  const localKey = `algotrack_ws_${userId}_${canonicalId}`;
  const stored = localStorage.getItem(localKey) || localStorage.getItem(`algotrack_ws_${userId}_${problemId}`);
  if (stored) {
    try {
      return JSON.parse(stored) as UserWorkspaceData;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Fetch saved code solutions across languages for a user and problem
 */
export async function fetchUserSolutions(
  userId: string,
  problemId: string
): Promise<Record<string, string>> {
  const solutionsMap: Record<string, string> = { ...STARTER_CODE_TEMPLATES };
  if (!userId || !problemId) return solutionsMap;
  const canonicalId = getProblemUuid(problemId);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('user_problem_solutions')
        .select('language, source_code')
        .eq('user_id', userId)
        .eq('problem_id', canonicalId);

      if (!error && data && data.length > 0) {
        data.forEach((row) => {
          if (row.language && row.source_code) {
            solutionsMap[row.language] = row.source_code;
          }
        });
        return solutionsMap;
      }
    } catch {
      // Fallback below
    }
  }

  const localKey = `algotrack_sol_${userId}_${canonicalId}`;
  const stored = localStorage.getItem(localKey) || localStorage.getItem(`algotrack_sol_${userId}_${problemId}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return { ...solutionsMap, ...parsed };
    } catch {
      // ignore
    }
  }

  return solutionsMap;
}

export interface SaveWorkspaceParams {
  userId: string;
  problemId: string;
  problemTitle?: string;
  problemDifficulty?: string;
  workspace: {
    personal_notes: string;
    personal_approach: string;
    time_complexity: string;
    space_complexity: string;
    mistakes_and_edge_cases: string;
  };
  status: ProblemStatus;
  activeLanguage: string;
  sourceCode: string;
}

/**
 * Persist user workspace notes, current language solution, and status
 */
export async function saveUserWorkspaceAndProgress(params: SaveWorkspaceParams): Promise<{
  success: boolean;
  error?: string;
  updated_at: string;
}> {
  const now = new Date().toISOString();
  const { userId, problemId, workspace, status, activeLanguage, sourceCode, problemTitle, problemDifficulty } = params;

  if (!userId || !problemId) {
    return { success: false, error: 'User or Problem ID missing', updated_at: now };
  }

  const canonicalId = getProblemUuid(problemId);

  if (isSupabaseConfigured()) {
    try {
      // 1. Upsert workspace data
      const { error: wsError } = await supabase
        .from('user_problem_workspace')
        .upsert(
          {
            user_id: userId,
            problem_id: canonicalId,
            personal_notes: workspace.personal_notes,
            personal_approach: workspace.personal_approach,
            time_complexity: workspace.time_complexity,
            space_complexity: workspace.space_complexity,
            mistakes_and_edge_cases: workspace.mistakes_and_edge_cases,
            updated_at: now
          },
          { onConflict: 'user_id,problem_id' }
        );

      if (wsError) throw wsError;

      // 2. Upsert solution for the active language
      const { error: solError } = await supabase
        .from('user_problem_solutions')
        .upsert(
          {
            user_id: userId,
            problem_id: canonicalId,
            language: activeLanguage,
            source_code: sourceCode,
            updated_at: now
          },
          { onConflict: 'user_id,problem_id,language' }
        );

      if (solError) throw solError;

      // 3. Update status in user_problem_progress
      if (status === 'not_started') {
        await supabase
          .from('user_problem_progress')
          .delete()
          .eq('user_id', userId)
          .eq('problem_id', canonicalId);
      } else {
        await supabase
          .from('user_problem_progress')
          .upsert(
            {
              user_id: userId,
              problem_id: canonicalId,
              status: status,
              solved_at: status === 'solved' ? now : null,
              updated_at: now
            },
            { onConflict: 'user_id,problem_id' }
          );

        // 4. Log activity if attempted or solved
        await supabase.from('user_activity_logs').insert({
          user_id: userId,
          problem_id: canonicalId,
          action_type: status,
          problem_title: problemTitle || 'Problem',
          difficulty: problemDifficulty || 'Medium',
          created_at: now
        });
      }
    } catch (err: unknown) {
      console.warn('[AlgoTrack] Supabase workspace save fallback:', err);
    }
  }

  // Always keep user-isolated localStorage updated for offline/fallback continuity
  try {
    const wsKey = `algotrack_ws_${userId}_${canonicalId}`;
    localStorage.setItem(
      wsKey,
      JSON.stringify({
        user_id: userId,
        problem_id: canonicalId,
        ...workspace,
        updated_at: now
      })
    );
    // Also save legacy key for compatibility
    if (canonicalId !== problemId) {
      localStorage.setItem(`algotrack_ws_${userId}_${problemId}`, localStorage.getItem(wsKey)!);
    }

    const solKey = `algotrack_sol_${userId}_${canonicalId}`;
    const existingSols = localStorage.getItem(solKey);
    const solsMap = existingSols ? JSON.parse(existingSols) : {};
    solsMap[activeLanguage] = sourceCode;
    localStorage.setItem(solKey, JSON.stringify(solsMap));
    if (canonicalId !== problemId) {
      localStorage.setItem(`algotrack_sol_${userId}_${problemId}`, JSON.stringify(solsMap));
    }

    const progKey = `algotrack_prog_${userId}_${canonicalId}`;
    localStorage.setItem(progKey, status);
    if (canonicalId !== problemId) {
      localStorage.setItem(`algotrack_prog_${userId}_${problemId}`, status);
    }
  } catch {
    // LocalStorage full or disabled
  }

  return { success: true, updated_at: now };
}
