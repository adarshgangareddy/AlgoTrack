// backend/src/repositories/problems.repository.ts

import { getSupabaseClient } from '../config/supabase.js';
import { ProblemEntity } from '../types/problem.types.js';
import leetcodeIndexData from '../data/leetcodeIndex.json' with { type: 'json' };

const cachedProblems: ProblemEntity[] = [];

function loadAllProblems(): ProblemEntity[] {
  if (cachedProblems.length > 0) return cachedProblems;

  const rawList = leetcodeIndexData as Array<{
    num: number;
    title: string;
    slug: string;
    diff: string;
    topics: string[];
  }>;

  for (const item of rawList) {
    const difficulty = (item.diff === 'Hard' || item.diff === 'Medium' ? item.diff : 'Easy');
    cachedProblems.push({
      id: `p${item.num}-${item.slug}`,
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

  return cachedProblems.sort((a, b) => (a.problem_number || 99999) - (b.problem_number || 99999));
}

export class ProblemsRepository {
  async findAll(params: {
    page?: number;
    limit?: number;
    difficulty?: string;
    search?: string;
  }): Promise<{ problems: ProblemEntity[]; total: number }> {
    const { page = 1, limit = 48, difficulty = 'all', search = '' } = params;
    const all = loadAllProblems();

    const q = search.toLowerCase().trim();

    const filtered = all.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.pattern && p.pattern.toLowerCase().includes(q)) ||
        (p.topics && p.topics.some((t) => t.toLowerCase().includes(q))) ||
        (p.problem_number && p.problem_number.toString().includes(q));

      const matchDiff =
        difficulty === 'all' || p.difficulty.toLowerCase() === difficulty.toLowerCase();

      return matchSearch && matchDiff;
    });

    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      problems: paginated,
      total: filtered.length,
    };
  }

  async findBySlugOrId(identifier: string): Promise<ProblemEntity | null> {
    const normalized = identifier.toLowerCase().trim();
    const all = loadAllProblems();

    // 1. Try finding in loaded problems
    const found = all.find(
      (p) => p.slug === normalized || p.id === normalized || p.problem_number?.toString() === normalized
    );

    if (found) {
      // Try to fetch extended details if not populated
      try {
        const paddedNum = String(found.problem_number || 0).padStart(4, '0');
        const url = `https://raw.githubusercontent.com/neenza/leetcode-problems/master/problems/${paddedNum}-${found.slug}.json`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.ok) {
          const details = (await res.json()) as { description?: string; hints?: string[]; solution?: string };
          return {
            ...found,
            description: details.description || found.description,
            hints: details.hints || [],
            theory_content: details.solution || found.theory_content,
          };
        }
      } catch {
        // Fallback to found metadata
      }
      return found;
    }

    // 2. Try Supabase if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('problems')
          .select('*')
          .or(`slug.eq.${normalized},id.eq.${normalized}`)
          .single();

        if (!error && data) {
          return data as ProblemEntity;
        }
      } catch {
        // continue to dynamic fallback
      }
    }

    // 3. Dynamic fallback for high numbers or uncatalogued slugs
    const num = parseInt(normalized.replace(/\D/g, ''), 10) || undefined;
    const title = normalized
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      id: `p-${normalized}`,
      problem_number: num,
      title,
      slug: normalized,
      difficulty: 'Medium',
      pattern: 'Algorithm',
      leetcode_url: `https://leetcode.com/problems/${normalized}/`,
      topics: ['Algorithms'],
      description: `Challenge #${num || '—'}: ${title}. Practice and track your solution on AlgoTrack.`,
    };
  }
}

