// src/services/codeTemplates.ts
// AlgoTrack: Authentic LeetCode-Style Problem-Specific Function Templates

import type { Problem } from './problemService';

export interface ProblemTemplateSet {
  python: string;
  java: string;
  cpp: string;
  javascript: string;
  typescript: string;
}

// Verified problem-specific templates for core curated problems
const VERIFIED_TEMPLATES: Record<string, ProblemTemplateSet> = {
  'two-sum': {
    python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your solution here
        pass
`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}
`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};
`,
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your solution here
};
`,
    typescript: `function twoSum(nums: number[], target: number): number[] {
    // Write your solution here
};
`,
  },

  'add-two-numbers': {
    python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        # Write your solution here
        pass
`,
    java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        // Write your solution here
        return null;
    }
}
`,
    cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        // Write your solution here
        return nullptr;
    }
};
`,
    javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function(l1, l2) {
    // Write your solution here
};
`,
    typescript: `/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */
function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
    // Write your solution here
};
`,
  },

  'longest-substring-without-repeating-characters': {
    python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Write your solution here
        pass
`,
    java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your solution here
        return 0;
    }
}
`,
    cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your solution here
        return 0;
    }
};
`,
    javascript: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    // Write your solution here
};
`,
    typescript: `function lengthOfLongestSubstring(s: string): number {
    // Write your solution here
};
`,
  },

  'container-with-most-water': {
    python: `class Solution:
    def maxArea(self, height: List[int]) -> int:
        # Write your solution here
        pass
`,
    java: `class Solution {
    public int maxArea(int[] height) {
        // Write your solution here
        return 0;
    }
}
`,
    cpp: `class Solution {
public:
    int maxArea(vector<int>& height) {
        // Write your solution here
        return 0;
    }
};
`,
    javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
    // Write your solution here
};
`,
    typescript: `function maxArea(height: number[]): number {
    // Write your solution here
};
`,
  },

  '3sum': {
    python: `class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        # Write your solution here
        pass
`,
    java: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Write your solution here
        return new ArrayList<>();
    }
}
`,
    cpp: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        // Write your solution here
        return {};
    }
};
`,
    javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function(nums) {
    // Write your solution here
};
`,
    typescript: `function threeSum(nums: number[]): number[][] {
    // Write your solution here
};
`,
  },

  'valid-parentheses': {
    python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your solution here
        pass
`,
    java: `class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        return false;
    }
}
`,
    cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
        return false;
    }
};
`,
    javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Write your solution here
};
`,
    typescript: `function isValid(s: string): boolean {
    // Write your solution here
};
`,
  },

  'merge-k-sorted-lists': {
    python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        # Write your solution here
        pass
`,
    java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        // Write your solution here
        return null;
    }
}
`,
    cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        // Write your solution here
        return nullptr;
    }
};
`,
    javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
var mergeKLists = function(lists) {
    // Write your solution here
};
`,
    typescript: `/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */
function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
    // Write your solution here
};
`,
  },

  'trapping-rain-water': {
    python: `class Solution:
    def trap(self, height: List[int]) -> int:
        # Write your solution here
        pass
`,
    java: `class Solution {
    public int trap(int[] height) {
        // Write your solution here
        return 0;
    }
}
`,
    cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        // Write your solution here
        return 0;
    }
};
`,
    javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function(height) {
    // Write your solution here
};
`,
    typescript: `function trap(height: number[]): number {
    // Write your solution here
};
`,
  },

  'maximum-subarray': {
    python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        # Write your solution here
        pass
`,
    java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your solution here
        return 0;
    }
}
`,
    cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your solution here
        return 0;
    }
};
`,
    javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    // Write your solution here
};
`,
    typescript: `function maxSubArray(nums: number[]): number {
    // Write your solution here
};
`,
  },

  'climbing-stairs': {
    python: `class Solution:
    def climbStairs(self, n: int) -> int:
        # Write your solution here
        pass
`,
    java: `class Solution {
    public int climbStairs(int n) {
        // Write your solution here
        return 0;
    }
}
`,
    cpp: `class Solution {
public:
    int climbStairs(int n) {
        // Write your solution here
        return 0;
    }
};
`,
    javascript: `/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    // Write your solution here
};
`,
    typescript: `function climbStairs(n: number): number {
    // Write your solution here
};
`,
  },

  'best-time-to-buy-and-sell-stock': {
    python: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        # Write your solution here
        pass
`,
    java: `class Solution {
    public int maxProfit(int[] prices) {
        // Write your solution here
        return 0;
    }
}
`,
    cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // Write your solution here
        return 0;
    }
};
`,
    javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    // Write your solution here
};
`,
    typescript: `function maxProfit(prices: number[]): number {
    // Write your solution here
};
`,
  },

  'linked-list-cycle': {
    python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        # Write your solution here
        pass
`,
    java: `/**
 * Definition for singly-linked list.
 * class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) {
 *         val = x;
 *         next = null;
 *     }
 * }
 */
public class Solution {
    public boolean hasCycle(ListNode head) {
        // Write your solution here
        return false;
    }
}
`,
    cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    bool hasCycle(ListNode *head) {
        // Write your solution here
        return false;
    }
};
`,
    javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function(head) {
    // Write your solution here
};
`,
    typescript: `/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */

function hasCycle(head: ListNode | null): boolean {
    // Write your solution here
};
`,
  },

  'number-of-islands': {
    python: `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        # Write your solution here
        pass
`,
    java: `class Solution {
    public int numIslands(char[][] grid) {
        // Write your solution here
        return 0;
    }
}
`,
    cpp: `class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        // Write your solution here
        return 0;
    }
};
`,
    javascript: `/**
 * @param {character[][]} grid
 * @return {number}
 */
var numIslands = function(grid) {
    // Write your solution here
};
`,
    typescript: `function numIslands(grid: string[][]): number {
    // Write your solution here
};
`,
  },

  'reverse-linked-list': {
    python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Write your solution here
        pass
`,
    java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your solution here
        return null;
    }
}
`,
    cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your solution here
        return nullptr;
    }
};
`,
    javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
    // Write your solution here
};
`,
    typescript: `/**
 * Definition for singly-linked list.
 * class ListNode {
 *     val: number
 *     next: ListNode | null
 *     constructor(val?: number, next?: ListNode | null) {
 *         this.val = (val===undefined ? 0 : val)
 *         this.next = (next===undefined ? null : next)
 *     }
 * }
 */
function reverseList(head: ListNode | null): ListNode | null {
    // Write your solution here
};
`,
  },
};

/**
 * Derives a camelCase LeetCode function name from a slug
 */
function deriveFunctionName(slug: string): string {
  const words = slug.split('-').filter(Boolean);
  if (words.length === 0) return 'solve';
  return words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

/**
 * Inspects problem sample inputs to infer argument parameters
 */
function inferParametersFromExample(inputStr?: string): string[] {
  if (!inputStr) return ['nums'];
  // LeetCode inputs are formatted like "nums = [2,7,11,15], target = 9" or "s = 'abcabcbb'"
  const matches = inputStr.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*=/g);
  if (matches && matches.length > 0) {
    return matches.map(m => m.replace('=', '').trim());
  }
  return ['nums'];
}

/**
 * Generates an authentic LeetCode template dynamically from verified problem metadata
 */
function generateDynamicTemplate(problem: Problem): ProblemTemplateSet {
  const fnName = deriveFunctionName(problem.slug);
  const params = problem.examples && problem.examples[0]
    ? inferParametersFromExample(problem.examples[0].input)
    : ['nums'];

  const pyParams = params.map(p => `${p}: Any`).join(', ');
  const jsParams = params.join(', ');
  const tsParams = params.map(p => `${p}: any`).join(', ');
  const javaParams = params.map(p => `Object ${p}`).join(', ');
  const cppParams = params.map(p => `auto& ${p}`).join(', ');

  return {
    python: `class Solution:
    def ${fnName}(self${params.length > 0 ? ', ' + pyParams : ''}) -> Any:
        # Write your solution for "${problem.title}" here
        pass
`,
    java: `class Solution {
    public Object ${fnName}(${javaParams}) {
        // Write your solution for "${problem.title}" here
        return null;
    }
}
`,
    cpp: `class Solution {
public:
    auto ${fnName}(${cppParams}) {
        // Write your solution for "${problem.title}" here
    }
};
`,
    javascript: `/**
 * Solution for ${problem.title}
${params.map(p => ` * @param {any} ${p}`).join('\n')}
 * @return {any}
 */
var ${fnName} = function(${jsParams}) {
    // Write your solution here
};
`,
    typescript: `function ${fnName}(${tsParams}): any {
    // Write your solution for "${problem.title}" here
};
`,
  };
}

/**
 * Retrieves the problem-specific starter template for a given problem and language
 */
export function getProblemStarterTemplate(problem: Problem, language: string): string {
  const normalizedLang = (language || 'python').toLowerCase().trim();
  const slug = (problem.slug || '').toLowerCase().trim();

  // 1. Check verified curated template map
  if (VERIFIED_TEMPLATES[slug]) {
    const templateSet = VERIFIED_TEMPLATES[slug];
    if (normalizedLang.includes('py')) return templateSet.python;
    if (normalizedLang.includes('java') && !normalizedLang.includes('script')) return templateSet.java;
    if (normalizedLang.includes('c++') || normalizedLang.includes('cpp')) return templateSet.cpp;
    if (normalizedLang.includes('ts') || normalizedLang.includes('typescript')) return templateSet.typescript;
    if (normalizedLang.includes('js') || normalizedLang.includes('javascript')) return templateSet.javascript;
    return templateSet.python;
  }

  // 2. Generate dynamic template from problem metadata
  const dynamicSet = generateDynamicTemplate(problem);
  if (normalizedLang.includes('py')) return dynamicSet.python;
  if (normalizedLang.includes('java') && !normalizedLang.includes('script')) return dynamicSet.java;
  if (normalizedLang.includes('c++') || normalizedLang.includes('cpp')) return dynamicSet.cpp;
  if (normalizedLang.includes('ts') || normalizedLang.includes('typescript')) return dynamicSet.typescript;
  if (normalizedLang.includes('js') || normalizedLang.includes('javascript')) return dynamicSet.javascript;
  return dynamicSet.python;
}

/**
 * Returns all templates for a problem across supported languages
 */
export function getAllStarterTemplatesForProblem(problem: Problem): Record<string, string> {
  const slug = (problem.slug || '').toLowerCase().trim();
  const templateSet = VERIFIED_TEMPLATES[slug] || generateDynamicTemplate(problem);

  return {
    python: templateSet.python,
    java: templateSet.java,
    cpp: templateSet.cpp,
    javascript: templateSet.javascript,
    typescript: templateSet.typescript,
  };
}

