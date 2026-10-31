// src/services/aiService.ts
// AlgoTrack — AI Problem Explanation & Interactive Tutor Service

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ProblemContext {
  title: string;
  problem_number?: number;
  difficulty: string;
  pattern?: string;
  topics: string[];
  description?: string;
  theory_content?: string;
  hints?: string[];
}

const LOCAL_STORAGE_GEMINI_KEY = 'algotrack_gemini_api_key';

export function getGeminiApiKey(): string {
  // 1. Check environment variable
  const envKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) return envKey.trim();

  // 2. Check user-configured key in browser localStorage
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_GEMINI_KEY);
    if (saved && saved.trim().length > 0) return saved.trim();
  } catch {
    // localStorage not accessible
  }

  return '';
}

export function saveGeminiApiKey(key: string): void {
  try {
    if (!key.trim()) {
      localStorage.removeItem(LOCAL_STORAGE_GEMINI_KEY);
    } else {
      localStorage.setItem(LOCAL_STORAGE_GEMINI_KEY, key.trim());
    }
  } catch {
    // ignore
  }
}

/**
 * Generates an instant, comprehensive algorithmic explanation
 * without requiring any external network or API key.
 */
export function generateBuiltinExplanation(problem: ProblemContext, topic?: string): string {
  const numPrefix = problem.problem_number ? `#${problem.problem_number} ` : '';
  const pattern = problem.pattern || 'Pattern Matching / Data Structures';
  const topicsList = problem.topics.length > 0 ? problem.topics.join(', ') : 'General Algorithms';

  if (topic === 'hints') {
    if (problem.hints && problem.hints.length > 0) {
      return `### 💡 Hints for ${numPrefix}${problem.title}\n\n` +
        problem.hints.map((h, i) => `**Hint ${i + 1}:** ${h.replace(/<[^>]*>/g, '')}`).join('\n\n');
    }
    return `### 💡 Helpful Hints for ${numPrefix}${problem.title}
1. **Identify the Core Invariant:** What property remains true after each operation or element inspection?
2. **Space vs. Time Tradeoff:** If a brute force takes $O(N^2)$, can a Hash Map, sorting step, or auxiliary pointer bring it down to $O(N)$ or $O(N \\log N)$?
3. **Boundary Extremes:** What happens if the collection is empty, has size 1, or contains all identical elements?`;
  }

  if (topic === 'edge_cases') {
    return `### ⚠️ Common Edge Cases for ${numPrefix}${problem.title}

1. **Empty or Minimal Input:** $N = 0$, $N = 1$, or null pointers. Always verify base checks before entering main loops.
2. **Duplicate Elements:** Does the problem require unique subsets, pairs, or indices? Ensure you don't double-count the same element.
3. **Extreme Value Boundaries:** Large integers approaching $2^{31}-1$ or $-2^{31}$ that could cause 32-bit integer overflow.
4. **All Identical Elements:** Arrays where every number is the same (e.g. \`[1, 1, 1, 1]\`) can degrade unbalanced partitions.
5. **No Feasible Solution:** How should the function signal that no matching target was discovered? (e.g., return empty array or sentinel value).`;
  }

  if (topic === 'complexity') {
    return `### ⏱️ Complexity Deep Dive: ${numPrefix}${problem.title}

- **Recommended Time Complexity:** For a **${problem.difficulty}** difficulty question in **${topicsList}**, competitive solutions aim for **$O(N)$** or **$O(N \\log N)$**. A quadratic $O(N^2)$ solution will generally hit a Time Limit Exceeded (TLE) when $N \\ge 10^5$.
- **Recommended Auxiliary Space:** **$O(1)$** if in-place two pointers are applicable, or **$O(N)$** if a Hash Table, frequency map, or dynamic programming memoization table is required.`;
  }

  // Full explanation
  return `### 🧠 Understanding ${numPrefix}${problem.title}

#### 1. The Core Problem in Plain English
You are given a problem classified as **${problem.difficulty}** under the **${topicsList}** category. The primary algorithmic pattern to master here is **${pattern}**.

${problem.description ? `> **Problem Statement Summary:**\n> ${problem.description.slice(0, 320)}...` : ''}

#### 2. Why the Naive / Brute-Force Approach Is Inefficient
- A direct brute-force check usually examines all permutations or pairs, leading to an **$O(N^2)$** or exponential time complexity.
- To pass modern technical interview benchmarks, we need to avoid repeated redundant work by recognizing the **${pattern}** pattern.

#### 3. Optimal Algorithmic Strategy
${problem.theory_content ? problem.theory_content : `1. **State Tracking:** Maintain a running state (e.g. hash map of complements, sliding window pointers, or prefix sums) as you iterate through the input once.
2. **Instant Lookup:** Check in $O(1)$ time if the matching counterpart or valid condition has already been observed.
3. **Single Pass Termination:** Terminate as soon as the valid condition is satisfied or when the traversal completes in $O(N)$ time.`}

#### 4. Summary Checklist
- [x] Time Complexity: **$O(N)$** (Single pass)
- [x] Space Complexity: **$O(N)$** (Auxiliary lookup)
- [x] Optimal Pattern: **${pattern}**`;
}

/**
 * Sends a prompt to Google Gemini API (gemini-1.5-flash) with full problem context.
 */
export async function askGeminiAI(params: {
  problem: ProblemContext;
  userPrompt: string;
  history?: ChatMessage[];
  apiKey?: string;
}): Promise<string> {
  const { problem, userPrompt, history = [], apiKey: paramKey } = params;
  const apiKey = paramKey || getGeminiApiKey();

  if (!apiKey) {
    // Graceful fallback to rich built-in smart engine
    const lower = userPrompt.toLowerCase();
    if (lower.includes('hint')) return generateBuiltinExplanation(problem, 'hints');
    if (lower.includes('edge') || lower.includes('mistake')) return generateBuiltinExplanation(problem, 'edge_cases');
    if (lower.includes('complexity') || lower.includes('time') || lower.includes('space')) return generateBuiltinExplanation(problem, 'complexity');
    return generateBuiltinExplanation(problem);
  }

  const systemInstruction = `You are AlgoTrack AI, an elite, patient, and encouraging computer science tutor helping a software engineer master algorithmic coding interviews.
Current Problem Context:
- Title: ${problem.problem_number ? `#${problem.problem_number} ` : ''}${problem.title}
- Difficulty: ${problem.difficulty}
- Topics: ${problem.topics.join(', ')}
- Pattern: ${problem.pattern || 'Standard DSA Pattern'}
${problem.description ? `- Description: ${problem.description}` : ''}
${problem.hints && problem.hints.length > 0 ? `- Problem Hints: ${problem.hints.join(' | ')}` : ''}

Guidelines:
1. Explain concepts step-by-step with clear mental models and simple real-world analogies.
2. Use markdown formatting with code blocks and bullet points.
3. Guide the student with intuition first before diving into code.
4. Clearly state Time and Space complexity ($O(N)$, etc.) with mathematical intuition.
5. Highlight subtle edge cases and off-by-one errors.
6. Keep explanations concise, actionable, and encouraging.`;

  // Build Gemini contents array
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  // Add recent history (up to last 6 messages)
  const recentHistory = history.slice(-6);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }

  // Add the current prompt with context prefix
  contents.push({
    role: 'user',
    parts: [{ text: `${systemInstruction}\n\nUser Question: ${userPrompt}` }]
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData.error?.message || `HTTP ${response.status} error from Gemini API`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Gemini returned an empty response.');
    }

    return candidateText;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to connect to Gemini API';
    console.warn('[AlgoTrack AI] Gemini API error, falling back to local engine:', message);
    return `> ⚠️ **Gemini API Notice:** ${message}\n\nHere is AlgoTrack's built-in explanation instead:\n\n${generateBuiltinExplanation(problem)}`;
  }
}

