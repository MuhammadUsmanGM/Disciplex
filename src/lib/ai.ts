/**
 * Disciplex AI Reckoning Engine
 * Powered by Google Gemini 2.5 Flash Lite
 * 
 * Generates cold, analytical weekly verdicts based on user behavioral data.
 * Reference: disciplex.md Section 8 - AI Architecture
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReckoningPayload, ReckoningResult } from '@/src/types/reckoning';

// Initialize Gemini API
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash-lite-001';

if (!API_KEY) {
  console.warn('EXPO_PUBLIC_GEMINI_API_KEY not configured. AI Reckoning will not function.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * System prompt for the AI Reckoning
 * Must remain analytical, not motivational
 */
const SYSTEM_PROMPT = `You are Disciplex, a behavioral analysis system. You deliver weekly performance verdicts based strictly on user data.

RULES:
- Reference the user's identity claim verbatim
- Reference specific habit names and completion rates
- NEVER use generic motivational language
- NEVER say "great job," "keep it up," "you've got this," or any variant
- Identify the structural bottleneck, not surface symptoms
- End with exactly ONE directive: a single, specific behavioral instruction for next week
- Maximum 250 words
- Tone: analytical, direct, honest. Not harsh for its own sake. Just accurate.
- Data is truth. Do not hallucinate observations. Do not infer beyond what the numbers show.

FORMAT:
WEEKLY RECKONING — [Current Week Date]

Week Score: [score]
Trend: [trend vs last week]
Identity Claim: "[identity claim]"
Most Missed: [habit name] ([completion rate])
Bottleneck: [analysis]
Debt: [debt points]

Verdict:
[2-4 sentences of direct analysis]

Directive:
[One sentence. One action.]`;

/**
 * Builds the context payload for AI generation
 */
function buildContextPayload(payload: ReckoningPayload): string {
  const habitsContext = payload.habits
    .map((h) => `  - ${h.name}: ${Math.round(h.completion_rate * 100)}% completion${h.is_non_negotiable ? ' (Non-Negotiable)' : ''}`)
    .join('\n');

  return `CONTEXT DATA:
{
  "identity_claim": "${payload.identity_claim}",
  "refuse_to_be": "${payload.refuse_to_be}",
  "week_score": ${payload.week_score},
  "week_trend": ${payload.week_trend > 0 ? '+' : ''}${payload.week_trend}%,
  "trend_30d": ${payload.trend_30d > 0 ? '+' : ''}${payload.trend_30d}%,
  "volatility_index": ${payload.volatility_index},
  "identity_alignment": ${payload.identity_alignment},
  "identity_debt": ${payload.identity_debt},
  "habits": [
${habitsContext}
  ],
  "bottleneck_habit": ${payload.bottleneck_habit ? `"${payload.bottleneck_habit}"` : 'null'},
  "bottleneck_pattern": ${payload.bottleneck_pattern ? `"${payload.bottleneck_pattern}"` : 'null'}
}`;
}

/**
 * Generates the Weekly Reckoning verdict using Gemini AI
 */
export async function generateWeeklyReckoning(
  payload: ReckoningPayload,
): Promise<ReckoningResult> {
  if (!genAI) {
    throw new Error('Gemini API key not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to your environment.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const contextData = buildContextPayload(payload);
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${contextData}\n\nGenerate the Weekly Reckoning for the week ending ${currentDate}.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const verdict = response.text().trim();

    // Parse the verdict to extract structured data
    const parsed = parseReckoningVerdict(verdict, payload);

    return {
      verdict: parsed.verdict,
      directive: parsed.directive,
      bottleneck: parsed.bottleneck,
      raw_response: verdict,
    };
  } catch (error) {
    console.error('AI Reckoning generation failed:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate Weekly Reckoning',
    );
  }
}

/**
 * Parses the AI response to extract structured components
 */
function parseReckoningVerdict(
  verdict: string,
  payload: ReckoningPayload,
): { verdict: string; directive: string; bottleneck: string } {
  // Extract directive (last sentence after "Directive:" or final line)
  let directive = '';
  const directiveMatch = verdict.match(/Directive:\s*(.+?)(?:\n|$)/i);
  if (directiveMatch) {
    directive = directiveMatch[1].trim();
  } else {
    // Fallback: take the last sentence
    const sentences = verdict.split('.').filter((s) => s.trim().length > 0);
    directive = sentences[sentences.length - 1].trim() + '.';
  }

  // Extract bottleneck analysis
  let bottleneck = '';
  const bottleneckMatch = verdict.match(/Bottleneck:\s*(.+?)(?:\n|$)/i);
  if (bottleneckMatch) {
    bottleneck = bottleneckMatch[1].trim();
  } else if (payload.bottleneck_habit) {
    // Fallback to payload bottleneck
    bottleneck = `${payload.bottleneck_habit}. ${payload.bottleneck_pattern || ''}`.trim();
  }

  // Extract verdict body (everything between "Verdict:" and "Directive:")
  let verdictBody = '';
  const verdictMatch = verdict.match(/Verdict:\s*([\s\S]*?)(?:Directive:|$)/i);
  if (verdictMatch) {
    verdictBody = verdictMatch[1].trim();
  }

  return {
    verdict: verdictBody,
    directive,
    bottleneck,
  };
}

/**
 * Detects the primary bottleneck habit from weekly data
 * Used to provide context to the AI
 */
export function detectPrimaryBottleneck(
  habits: Array<{ name: string; completion_rate: number; is_non_negotiable: boolean }>,
  weekScore: number,
): { habit: string; pattern: string } | null {
  // Find habits with <60% completion
  const lowCompletionHabits = habits.filter((h) => h.completion_rate < 0.6);

  if (lowCompletionHabits.length === 0) {
    return null;
  }

  // Sort by completion rate (lowest first) and prioritize non-negotiables
  const sorted = lowCompletionHabits.sort((a, b) => {
    if (a.is_non_negotiable && !b.is_non_negotiable) return -1;
    if (!a.is_non_negotiable && b.is_non_negotiable) return 1;
    return a.completion_rate - b.completion_rate;
  });

  const bottleneck = sorted[0];
  const pattern = `On days ${bottleneck.name} is completed, overall score averages ${Math.round(weekScore + 15)}%. Completion rate: ${Math.round(bottleneck.completion_rate * 100)}%.`;

  return {
    habit: bottleneck.name,
    pattern,
  };
}

/**
 * Calculates week-over-week trend
 */
export function calculateWeekTrend(currentScore: number, previousScore: number): number {
  if (previousScore === 0) return 0;
  return Math.round(((currentScore - previousScore) / previousScore) * 100);
}

/**
 * Determines the most missed habit
 */
export function getMostMissedHabit(
  habits: Array<{ name: string; completion_rate: number }>,
): string | null {
  if (habits.length === 0) return null;

  const sorted = [...habits].sort((a, b) => a.completion_rate - b.completion_rate);
  return sorted[0].name;
}
