import { API_BASE } from './config';
import type { AskResponse } from './types';

export const ASK_DISCLAIMER =
  'Not medical advice. Ask your doctor or pharmacist if you are unsure.';

const SAMPLE_QUESTIONS = [
  'What does my prescription label mean?',
  'How do I prepare for a doctor visit?',
  'What should I wear today?',
] as const;

export function sampleQuestions(): string[] {
  return [...SAMPLE_QUESTIONS];
}

/**
 * Honest on-device demo answerer (rule-based). Used when no backend
 * answers. Every answer is labelled DEMO by the caller, uses plain
 * words and short sentences, gives general information only, never a
 * diagnosis or a prescription change, and always ends with the
 * "ask your doctor or pharmacist" line on health topics.
 */
export function demoAnswer(question: string, weatherLine?: string): string {
  const q = question.toLowerCase();
  if (q.includes('prescription') || q.includes('label') || q.includes('medicine') || q.includes('pill') || q.includes('tablet')) {
    return [
      'A prescription label tells you four things.',
      'First, the name of the medicine and how strong it is.',
      'Second, how much to take and how often. For example, one tablet in the morning.',
      'Third, how long to take it for.',
      'Fourth, any warnings, such as take with food or do not drive.',
      'If a word on the label is unclear, do not guess. Take the bottle to your pharmacist and ask them to read it with you.',
      ASK_DISCLAIMER,
    ].join('\n\n');
  }
  if (q.includes('doctor') || q.includes('appointment') || q.includes('visit')) {
    return [
      'To prepare for a doctor visit, do these four things.',
      'First, write down your questions before you go. Bring the list.',
      'Second, bring every medicine bottle you take, or a photo of each label.',
      'Third, write down any new pain or change since your last visit.',
      'Fourth, bring a family member if you can. Two people hear more than one.',
      'Ask the doctor to say the plan back in plain words before you leave.',
      ASK_DISCLAIMER,
    ].join('\n\n');
  }
  if (q.includes('wear') || q.includes('weather') || q.includes('cold') || q.includes('hot') || q.includes('rain')) {
    const line = weatherLine ?? 'Check the weather strip on the Today screen before you go out.';
    return [
      line,
      'On a cold day, wear layers. A warm coat, a hat, and gloves.',
      'On a hot day, wear light clothes and a hat, and drink water often.',
      'If it may rain, take a raincoat or an umbrella.',
      'Wear shoes with a good grip so you do not slip.',
      ASK_DISCLAIMER,
    ].join('\n\n');
  }
  if (q.includes('sleep') || q.includes('tired')) {
    return [
      'Good sleep helps the whole day.',
      'Try to go to bed and wake up at the same time each day.',
      'Keep the bedroom dark and quiet.',
      'Avoid tea, coffee, and screens in the hour before bed.',
      'If poor sleep lasts more than two weeks, tell your doctor.',
      ASK_DISCLAIMER,
    ].join('\n\n');
  }
  if (q.includes('water') || q.includes('drink') || q.includes('eat') || q.includes('food')) {
    return [
      'Small habits help a lot.',
      'Drink water through the day. Keep a glass or bottle where you can see it.',
      'Eat regular meals. Try to include fruit or vegetables at each meal.',
      'If you take medicine with food, eat first, then take the medicine.',
      ASK_DISCLAIMER,
    ].join('\n\n');
  }
  return [
    'Here is a simple answer to your question.',
    'I can help with everyday questions: medicine labels, doctor visits, what to wear, sleep, food, and water.',
    'Try one of the suggested questions below, or ask in plain words.',
    'For health questions, this is general information only.',
    ASK_DISCLAIMER,
  ].join('\n\n');
}

/**
 * Ask the companion. Tries the live backend first when one is
 * configured; falls back to the honest on-device demo answerer and
 * says DEMO. Never throws for a missing backend — the demo answer
 * is the designed fallback, not an error.
 */
export async function askCompanion(question: string, weatherLine?: string): Promise<AskResponse> {
  const trimmed = question.trim();
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      });
      if (res.ok) {
        const data = (await res.json()) as { answer?: string };
        if (data.answer && data.answer.trim()) {
          return { answer: data.answer.trim(), source: 'live' };
        }
      }
    } catch {
      // Backend unreachable — fall through to the demo answerer.
    }
  }
  return { answer: demoAnswer(trimmed, weatherLine), source: 'demo' };
}
