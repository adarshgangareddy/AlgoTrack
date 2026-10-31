-- ==========================================================================
-- AlgoTrack Phase 5: Individual Problem Workspace & Solution Schema
-- ==========================================================================

-- 1. Enhance problems table with metadata & theory content columns
ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS problem_number INTEGER;
ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS theory_content TEXT;
ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS hints TEXT[];

-- 2. Update user_problem_progress status check constraint to include 'not_started'
ALTER TABLE public.user_problem_progress DROP CONSTRAINT IF EXISTS user_problem_progress_status_check;
ALTER TABLE public.user_problem_progress ADD CONSTRAINT user_problem_progress_status_check 
  CHECK (status IN ('not_started', 'attempted', 'solved'));

-- 3. Create user_problem_workspace table (User-isolated learning workspace)
CREATE TABLE IF NOT EXISTS public.user_problem_workspace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  personal_notes TEXT DEFAULT '',
  personal_approach TEXT DEFAULT '',
  time_complexity TEXT DEFAULT '',
  space_complexity TEXT DEFAULT '',
  mistakes_and_edge_cases TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_user_problem_workspace_user_prob 
  ON public.user_problem_workspace(user_id, problem_id);

-- 4. Create user_problem_solutions table (Multi-language solution code storage)
CREATE TABLE IF NOT EXISTS public.user_problem_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL,
  source_code TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, problem_id, language)
);

CREATE INDEX IF NOT EXISTS idx_user_problem_solutions_user_prob_lang 
  ON public.user_problem_solutions(user_id, problem_id, language);

-- 5. Updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_problem_workspace_updated_at ON public.user_problem_workspace;
CREATE TRIGGER set_user_problem_workspace_updated_at
  BEFORE UPDATE ON public.user_problem_workspace
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_problem_solutions_updated_at ON public.user_problem_solutions;
CREATE TRIGGER set_user_problem_solutions_updated_at
  BEFORE UPDATE ON public.user_problem_solutions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================================================
-- Row Level Security (RLS) - Strict Isolation
-- ==========================================================================

ALTER TABLE public.user_problem_workspace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_problem_solutions ENABLE ROW LEVEL SECURITY;

-- user_problem_workspace policies
DROP POLICY IF EXISTS "Users can only read their own workspace" ON public.user_problem_workspace;
CREATE POLICY "Users can only read their own workspace"
  ON public.user_problem_workspace FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own workspace" ON public.user_problem_workspace;
CREATE POLICY "Users can insert their own workspace"
  ON public.user_problem_workspace FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own workspace" ON public.user_problem_workspace;
CREATE POLICY "Users can update their own workspace"
  ON public.user_problem_workspace FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own workspace" ON public.user_problem_workspace;
CREATE POLICY "Users can delete their own workspace"
  ON public.user_problem_workspace FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- user_problem_solutions policies
DROP POLICY IF EXISTS "Users can only read their own solutions" ON public.user_problem_solutions;
CREATE POLICY "Users can only read their own solutions"
  ON public.user_problem_solutions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own solutions" ON public.user_problem_solutions;
CREATE POLICY "Users can insert their own solutions"
  ON public.user_problem_solutions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own solutions" ON public.user_problem_solutions;
CREATE POLICY "Users can update their own solutions"
  ON public.user_problem_solutions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own solutions" ON public.user_problem_solutions;
CREATE POLICY "Users can delete their own solutions"
  ON public.user_problem_solutions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ==========================================================================
-- Curated Seed Problems (Initial Library)
-- ==========================================================================

INSERT INTO public.problems (problem_number, title, slug, difficulty, pattern, leetcode_url, description, theory_content)
VALUES
(
  1,
  'Two Sum',
  'two-sum',
  'Easy',
  'Hash Map / Array Lookup',
  'https://leetcode.com/problems/two-sum/',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  'The naive brute force approach checks all pairs in O(N^2) time. By using a hash map to record the complement (target - num) and its index, we can resolve matches in a single linear pass with O(N) time and O(N) space.'
),
(
  3,
  'Longest Substring Without Repeating Characters',
  'longest-substring-without-repeating-characters',
  'Medium',
  'Sliding Window',
  'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
  'Given a string s, find the length of the longest substring without duplicate characters.',
  'Maintain a dynamic window [left, right] using a hash map or character array storing the last seen index of each character. When a duplicate is encountered, slide left forward to the index after the previous occurrence.'
),
(
  11,
  'Container With Most Water',
  'container-with-most-water',
  'Medium',
  'Two Pointers',
  'https://leetcode.com/problems/container-with-most-water/',
  'You are given an integer array height of length n. Find two lines that together with the x-axis form a container that contains the most water.',
  'Place two pointers at the extreme ends of the array. The area is bounded by the shorter line multiplied by the width. To find a potentially larger area, always move the pointer pointing to the shorter vertical bar inward.'
),
(
  15,
  '3Sum',
  '3sum',
  'Medium',
  'Two Pointers / Sorting',
  'https://leetcode.com/problems/3sum/',
  'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
  'Sort the array first to enable two-pointer scanning and duplicate skipping. Fix the first element nums[i] in a loop, then use two pointers (left = i + 1, right = n - 1) to find pairs summing to -nums[i].'
),
(
  20,
  'Valid Parentheses',
  'valid-parentheses',
  'Easy',
  'Stack',
  'https://leetcode.com/problems/valid-parentheses/',
  'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
  'Use a Last-In First-Out (LIFO) stack. Push expected closing brackets when an opening bracket is met, or verify that the top element matches and pops when encountering a closing symbol.'
),
(
  42,
  'Trapping Rain Water',
  'trapping-rain-water',
  'Hard',
  'Two Pointers / Monotonic Stack',
  'https://leetcode.com/problems/trapping-rain-water/',
  'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
  'The water trapped above bar i is min(max_left, max_right) - height[i]. Using two pointers moving inward, we can track the maximum heights seen from the left and right, eliminating extra memory.'
),
(
  53,
  'Maximum Subarray',
  'maximum-subarray',
  'Medium',
  'Dynamic Programming / Kadane Algorithm',
  'https://leetcode.com/problems/maximum-subarray/',
  'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
  'Kadane''s algorithm iterates through the array while maintaining current_sum = max(num, current_sum + num). If the running sum becomes negative, starting fresh at the next number yields a higher potential.'
),
(
  70,
  'Climbing Stairs',
  'climbing-stairs',
  'Easy',
  'Dynamic Programming / Fibonacci',
  'https://leetcode.com/problems/climbing-stairs/',
  'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
  'Notice that to reach step n, you must arrive from either step n-1 or step n-2. Thus ways(n) = ways(n-1) + ways(n-2), mirroring the Fibonacci recurrence, reducible to O(1) space with two variables.'
),
(
  121,
  'Best Time to Buy and Sell Stock',
  'best-time-to-buy-and-sell-stock',
  'Easy',
  'Sliding Window / Greedy',
  'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
  'You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
  'Track the minimum purchase price seen so far in a single pass. For each subsequent day, compute the candidate profit (price - min_price) and maintain the maximum.'
),
(
  146,
  'LRU Cache',
  'lru-cache',
  'Medium',
  'Hash Table + Doubly Linked List',
  'https://leetcode.com/problems/lru-cache/',
  'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
  'A hash map provides O(1) key-to-node lookups, while a Doubly Linked List (DLL) allows O(1) node removal and insertion at the head. Maintain dummy head and tail nodes to simplify edge boundary manipulations.'
),
(
  206,
  'Reverse Linked List',
  'reverse-linked-list',
  'Easy',
  'Linked List / Pointers',
  'https://leetcode.com/problems/reverse-linked-list/',
  'Given the head of a singly linked list, reverse the list, and return the reversed list.',
  'Maintain three pointers: prev (initially null), curr (initially head), and next_temp. In each step, save curr.next, redirect curr.next = prev, advance prev = curr, and curr = next_temp.'
),
(
  226,
  'Invert Binary Tree',
  'invert-binary-tree',
  'Easy',
  'Binary Tree / DFS / BFS',
  'https://leetcode.com/problems/invert-binary-tree/',
  'Given the root of a binary tree, invert the tree, and return its root.',
  'Recursively swap the left and right child pointers of each node. Depth-First Search visits every node once in O(N) time with call stack depth bounded by the tree height O(H).'
),
(
  704,
  'Binary Search',
  'binary-search',
  'Easy',
  'Binary Search',
  'https://leetcode.com/problems/binary-search/',
  'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums in O(log n) time.',
  'Calculate mid = left + (right - left) // 2 to avoid integer overflow. If nums[mid] == target, return mid; if nums[mid] < target, search the right half; otherwise, search the left half.'
)
ON CONFLICT (slug) DO UPDATE
SET
  problem_number = EXCLUDED.problem_number,
  title = EXCLUDED.title,
  difficulty = EXCLUDED.difficulty,
  pattern = EXCLUDED.pattern,
  leetcode_url = EXCLUDED.leetcode_url,
  description = EXCLUDED.description,
  theory_content = EXCLUDED.theory_content;
