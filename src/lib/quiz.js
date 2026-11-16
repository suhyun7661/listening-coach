import { gradeAnswer } from './grading';
import { QUESTIONS, QUIZ_TOTAL } from '../data/compete-quiz';

// Is a typed answer right? Any accepted answer counts. Case, punctuation, extra spaces and a one-letter
// typo are forgiven (same grader as Practice). "Touche" = "Touché".
export function isTypedCorrect(typed, accept) {
  return accept.some((a) => {
    const { status } = gradeAnswer(typed, a);
    return status === 'correct' || status === 'almost';
  });
}

// answers: { questionId: "what the learner typed" or choice index }
export function gradeQuestion(question, answer) {
  if (question.type === 'meaning') return answer === question.correct;
  return isTypedCorrect(String(answer ?? ''), question.accept);
}

export function scoreQuiz(answers) {
  const score = QUESTIONS.filter((q) => gradeQuestion(q, answers[q.id])).length;
  return { score, total: QUIZ_TOTAL, percent: Math.round((score / QUIZ_TOTAL) * 100) };
}

// Standard competition ranking: tied scores share a rank (1st, 2nd, 2nd, 4th).
// Returns the 6 participants (5 competitors + the learner), best first.
export function buildLeaderboard(competitors, myScore, myName) {
  const people = [
    ...competitors.map((c) => ({ name: c.name, score: c.score, me: false })),
    { name: myName, score: myScore, me: true },
  ];
  // Same score: competitors first, then the learner (only the display order; the rank is shared).
  people.sort((a, b) => b.score - a.score || Number(a.me) - Number(b.me));
  return people.map((p) => ({ ...p, rank: 1 + people.filter((o) => o.score > p.score).length }));
}

const ordinal = (n) => ['1st', '2nd', '3rd', '4th', '5th', '6th'][n - 1] ?? `${n}th`;
export { ordinal };

// Short motivational messages, all from real data: the new score, the 5 benchmark scores and the
// previous saved result (read BEFORE it was overwritten). No improvement message on the first attempt.
export function resultMessages({ score, total, previous, competitors }) {
  const out = [];
  if (previous != null && score > previous) out.push('You improved your score!');
  if (score === total) out.push('Perfect score!');

  const ahead = competitors.filter((c) => c.score > score).sort((a, b) => a.score - b.score);
  const beaten = competitors.filter((c) => c.score < score).length;
  if (ahead.length) {
    const next = ahead[0];
    const gap = next.score - score;
    const who = next.name.replace(/\.$/, ''); // "Sophie L." -> "Sophie L" (no double full stop)
    if (gap === 1) out.push(`You're just 1 point behind ${who}!`);
    else if (gap <= 3) out.push(`You're ${gap} points behind ${who}. Keep going!`);
  }
  if (score !== total) {
    if (beaten === competitors.length) out.push(`You beat all ${beaten} competitors!`);
    else if (beaten > 0) out.push(`You beat ${beaten} of ${competitors.length} competitors.`);
  }
  return out;
}
