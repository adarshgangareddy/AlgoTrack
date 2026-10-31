import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

// Curated default problem dataset
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
    theory_content: 'The water trapped above bar i is min(max_left, max_right) - height[i]. Using two pointers moving inward, we can track the maximum heights seen from the left and right, eliminating extra memory.'
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
    pattern: 'Sliding Window / Greedy',
    leetcode_url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    topics: ['Arrays', 'Greedy'],
    description: 'You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
    theory_content: 'Track the minimum purchase price seen so far in a single pass. For each subsequent day, compute the candidate profit (price - min_price) and maintain the maximum.'
  },
  {
    id: 'p146-lru-cache',
    problem_number: 146,
    title: 'LRU Cache',
    slug: 'lru-cache',
    difficulty: 'Medium',
    pattern: 'Hash Table + Doubly Linked List',
    leetcode_url: 'https://leetcode.com/problems/lru-cache/',
    topics: ['Linked Lists', 'Hash Maps', 'Design'],
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
    theory_content: 'A hash map provides O(1) key-to-node lookups, while a Doubly Linked List (DLL) allows O(1) node removal and insertion at the head. Maintain dummy head and tail nodes to simplify edge boundary manipulations.'
  },
  {
    id: 'p206-reverse-linked-list',
    problem_number: 206,
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'Easy',
    pattern: 'Linked List / Pointers',
    leetcode_url: 'https://leetcode.com/problems/reverse-linked-list/',
    topics: ['Linked Lists', 'Recursion'],
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    theory_content: 'Maintain three pointers: prev (initially null), curr (initially head), and next_temp. In each step, save curr.next, redirect curr.next = prev, advance prev = curr, and curr = next_temp.'
  },
  {
    id: 'p226-invert-binary-tree',
    problem_number: 226,
    title: 'Invert Binary Tree',
    slug: 'invert-binary-tree',
    difficulty: 'Easy',
    pattern: 'Binary Tree / DFS / BFS',
    leetcode_url: 'https://leetcode.com/problems/invert-binary-tree/',
    topics: ['Trees', 'Binary Trees', 'DFS'],
    description: 'Given the root of a binary tree, invert the tree, and return its root.',
    theory_content: 'Recursively swap the left and right child pointers of each node. Depth-First Search visits every node once in O(N) time with call stack depth bounded by the tree height O(H).'
  },
  {
    id: 'p704-binary-search',
    problem_number: 704,
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Easy',
    pattern: 'Binary Search',
    leetcode_url: 'https://leetcode.com/problems/binary-search/',
    topics: ['Arrays', 'Binary Search'],
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums in O(log n) time.',
    theory_content: 'Calculate mid = left + (right - left) // 2 to avoid integer overflow. If nums[mid] == target, return mid; if nums[mid] < target, search the right half; otherwise, search the left half.'
  }
];

// Starter template code for each language
export const STARTER_CODE_TEMPLATES: Record<string, string> = {
  python: `# Write your solution in Python 3\nclass Solution:\n    def solve(self) -> None:\n        # Your implementation here\n        pass\n`,
  typescript: `// Write your solution in TypeScript\nfunction solve(): void {\n  // Your implementation here\n}\n`,
  javascript: `// Write your solution in JavaScript\nfunction solve() {\n  // Your implementation here\n}\n`,
  java: `// Write your solution in Java\nclass Solution {\n    public void solve() {\n        // Your implementation here\n    }\n}\n`,
  cpp: `// Write your solution in C++\n#include <iostream>\n#include <vector>\n\nclass Solution {\npublic:\n    void solve() {\n        // Your implementation here\n    }\n};\n`
};

/**
 * Fetch all available problems
 */
export async function fetchAllProblems(): Promise<Problem[]> {
  if (!isSupabaseConfigured()) {
    return CURATED_PROBLEMS;
  }

  try {
    const { data, error } = await supabase
      .from('problems')
      .select('id, problem_number, title, slug, difficulty, pattern, leetcode_url, description, theory_content')
      .order('problem_number', { ascending: true, nullsFirst: false });

    if (error || !data || data.length === 0) {
      return CURATED_PROBLEMS;
    }

    return data.map((item) => ({
      ...item,
      topics: item.pattern ? [item.pattern.split('/')[0].trim()] : ['General']
    }));
  } catch {
    return CURATED_PROBLEMS;
  }
}

/**
 * Fetch a single problem by slug
 */
export async function fetchProblemBySlug(slug: string): Promise<Problem | null> {
  const normalizedSlug = slug.toLowerCase().trim();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('id, problem_number, title, slug, difficulty, pattern, leetcode_url, description, theory_content')
        .eq('slug', normalizedSlug)
        .single();

      if (!error && data) {
        return {
          ...data,
          topics: data.pattern ? [data.pattern.split('/')[0].trim()] : ['General']
        };
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback to in-memory curated catalog
  const found = CURATED_PROBLEMS.find((p) => p.slug === normalizedSlug);
  return found || null;
}

/**
 * Fetch user's status for a problem
 */
export async function fetchUserProblemProgress(userId: string, problemId: string): Promise<ProblemStatus> {
  if (!userId || !problemId) return 'not_started';

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('user_problem_progress')
        .select('status')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .single();

      if (!error && data?.status) {
        return data.status as ProblemStatus;
      }
    } catch {
      // Fallback below
    }
  }

  const localKey = `algotrack_prog_${userId}_${problemId}`;
  const stored = localStorage.getItem(localKey);
  if (stored === 'attempted' || stored === 'solved') {
    return stored;
  }
  return 'not_started';
}

/**
 * Fetch user's workspace notes/approach
 */
export async function fetchUserWorkspace(userId: string, problemId: string): Promise<UserWorkspaceData | null> {
  if (!userId || !problemId) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('user_problem_workspace')
        .select('*')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .single();

      if (!error && data) {
        return data as UserWorkspaceData;
      }
    } catch {
      // Fallback below
    }
  }

  const localKey = `algotrack_ws_${userId}_${problemId}`;
  const stored = localStorage.getItem(localKey);
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
export async function fetchUserSolutions(userId: string, problemId: string): Promise<Record<string, string>> {
  const result: Record<string, string> = { ...STARTER_CODE_TEMPLATES };
  if (!userId || !problemId) return result;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('user_problem_solutions')
        .select('language, source_code')
        .eq('user_id', userId)
        .eq('problem_id', problemId);

      if (!error && Array.isArray(data) && data.length > 0) {
        data.forEach((row) => {
          if (row.language && typeof row.source_code === 'string') {
            result[row.language] = row.source_code;
          }
        });
        return result;
      }
    } catch {
      // Fallback below
    }
  }

  const localKey = `algotrack_sol_${userId}_${problemId}`;
  const stored = localStorage.getItem(localKey);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return { ...result, ...parsed };
    } catch {
      return result;
    }
  }

  return result;
}

/**
 * Save user workspace, code solution, and synchronize status
 */
export async function saveUserWorkspaceAndProgress(params: {
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
}): Promise<{ success: boolean; error?: string; updated_at: string }> {
  const now = new Date().toISOString();
  const { userId, problemId, workspace, status, activeLanguage, sourceCode, problemTitle, problemDifficulty } = params;

  if (!userId || !problemId) {
    return { success: false, error: 'User or Problem ID missing', updated_at: now };
  }

  let dbSuccess = false;

  if (isSupabaseConfigured()) {
    try {
      // 1. Upsert workspace data
      const { error: wsError } = await supabase
        .from('user_problem_workspace')
        .upsert(
          {
            user_id: userId,
            problem_id: problemId,
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

      // 2. Upsert code solution for active language
      const { error: solError } = await supabase
        .from('user_problem_solutions')
        .upsert(
          {
            user_id: userId,
            problem_id: problemId,
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
          .eq('problem_id', problemId);
      } else {
        await supabase
          .from('user_problem_progress')
          .upsert(
            {
              user_id: userId,
              problem_id: problemId,
              status: status,
              solved_at: status === 'solved' ? now : null,
              updated_at: now
            },
            { onConflict: 'user_id,problem_id' }
          );

        // 4. Log activity if attempted or solved
        await supabase.from('user_activity_logs').insert({
          user_id: userId,
          problem_id: problemId,
          action_type: status,
          problem_title: problemTitle || 'Problem',
          difficulty: problemDifficulty || 'Medium',
          created_at: now
        });
      }

      dbSuccess = true;
    } catch (err: unknown) {
      console.warn('[AlgoTrack] Supabase workspace save fallback:', err);
    }
  }

  // Always keep user-isolated localStorage updated for offline/fallback continuity
  try {
    const wsKey = `algotrack_ws_${userId}_${problemId}`;
    localStorage.setItem(
      wsKey,
      JSON.stringify({
        user_id: userId,
        problem_id: problemId,
        ...workspace,
        updated_at: now
      })
    );

    const solKey = `algotrack_sol_${userId}_${problemId}`;
    const existingSols = localStorage.getItem(solKey);
    const solsMap = existingSols ? JSON.parse(existingSols) : {};
    solsMap[activeLanguage] = sourceCode;
    localStorage.setItem(solKey, JSON.stringify(solsMap));

    const progKey = `algotrack_prog_${userId}_${problemId}`;
    localStorage.setItem(progKey, status);
  } catch {
    // LocalStorage full or disabled
  }

  return { success: true, updated_at: now };
}
