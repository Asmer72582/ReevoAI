export type ReviewSentiment = "Positive" | "Negative" | "Mixed";

const NEGATIVE_WORDS = [
  "worst",
  "terrible",
  "awful",
  "horrible",
  "hate",
  "disgusting",
  "disappointed",
  "disappointing",
  "poor",
  "bad",
  "never again",
  "waste",
  "refund",
  "unacceptable",
  "disaster",
  "pathetic",
  "useless",
  "broken",
  "slow",
  "rude",
  "angry",
  "frustrated",
  "frustrating",
  "unhappy",
  "regret",
  "avoid",
  "complaint",
  "unprofessional",
  "failed",
  "failure",
  "mediocre",
  "subpar",
  "not good",
  "not great",
  "didn't like",
  "don't like",
  "wouldn't recommend",
];

const POSITIVE_WORDS = [
  "great",
  "love",
  "loved",
  "amazing",
  "excellent",
  "wonderful",
  "best",
  "good",
  "happy",
  "fantastic",
  "perfect",
  "awesome",
  "recommend",
  "thrilled",
  "impressed",
  "smooth",
  "easy",
  "helpful",
  "outstanding",
  "brilliant",
  "delighted",
  "enjoyed",
  "enjoy",
  "satisfied",
  "pleased",
  "incredible",
  "superb",
  "five star",
  "5 star",
];

function scoreText(text: string): { positive: number; negative: number } {
  const lower = text.toLowerCase();
  let positive = 0;
  let negative = 0;
  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) negative += 1;
  }
  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) positive += 1;
  }
  return { positive, negative };
}

/** Analyse review caption/text + star rating for sentiment. */
export function analyzeReviewSentiment(text: string, stars: number): ReviewSentiment {
  const { positive, negative } = scoreText(text);

  if (negative > positive && negative >= 1) return "Negative";
  if (positive > negative && positive >= 1 && stars >= 3) return "Positive";
  if (negative >= 1 && positive >= 1) return "Mixed";

  if (stars <= 2) return "Negative";
  if (stars >= 4 && negative === 0) return "Positive";
  if (stars === 3) return negative > 0 ? "Mixed" : "Positive";

  return negative > 0 ? "Negative" : "Mixed";
}

export function summarizeSentiment(reviews: { text: string; stars: number }[]): string {
  if (!reviews.length) return "—";
  const counts = { Positive: 0, Negative: 0, Mixed: 0 };
  for (const r of reviews) {
    counts[analyzeReviewSentiment(r.text, r.stars)] += 1;
  }
  if (counts.Negative > 0) return "Needs attention";
  if (counts.Mixed > counts.Positive) return "Mixed";
  return "Positive";
}
