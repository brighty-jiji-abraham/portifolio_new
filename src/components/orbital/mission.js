export const FLIGHT_DURATION = 12;
export const RETRIEVAL_DURATION = 5.4;

export const FLIGHT_PHASES = [
  { label: "Leaving Earth orbit", detail: "Departure burn", start: 0 },
  {
    label: "Approaching the station",
    detail: "Matching orbital velocity",
    start: 0.23,
  },
  {
    label: "Docking clearance received",
    detail: "Opening the airlock",
    start: 0.43,
  },
  {
    label: "Welcome to the orbital lab",
    detail: "Entering the research bay",
    start: 0.68,
  },
];

export const DOCUMENTS = [
  {
    id: "lexical",
    title: "Keyword retrieval",
    tag: "BM25",
    text: "Keyword search finds exact terms, product names, and identifiers. It gives precise matches a place in the candidate set, even when a semantic model overlooks them.",
    position: [-1.9, 0.85, 0.1],
  },
  {
    id: "semantic",
    title: "Semantic retrieval",
    tag: "Vector search",
    text: "Semantic search compares vector representations of a question and document fragments. It retrieves related meaning even when the question uses different words.",
    position: [1.35, 1.35, -0.1],
  },
  {
    id: "fusion",
    title: "Context assembly",
    tag: "Hybrid retrieval",
    text: "The retriever combines keyword and semantic candidates into useful context. The model receives the selected passages alongside the question to ground its response.",
    position: [1.65, -0.65, 0.35],
  },
  {
    id: "fallback",
    title: "Missing context",
    tag: "Web fallback",
    text: "When internal documents do not supply useful context, this project's retrieval flow can fall back to the open web. External context should remain distinguishable from internal sources.",
    position: [-1.5, -1.05, 0.55],
  },
];

export const QUESTIONS = [
  {
    label: "How does hybrid search work?",
    answer:
      "It searches in two complementary ways: keywords find exact terms, while vectors find related meaning. Their candidates are combined into context for the answer.",
    sources: ["lexical", "semantic", "fusion"],
  },
  {
    label: "Why use more than keywords?",
    answer:
      "A question can express the same idea with completely different words. Semantic retrieval finds that relationship; keyword retrieval keeps exact names and identifiers in play.",
    sources: ["lexical", "semantic"],
  },
  {
    label: "What if the documents can't answer?",
    answer:
      "The project can fall back to the open web when internal context is insufficient. The source of that information should stay visible, so external evidence is not mistaken for internal knowledge.",
    sources: ["fallback", "fusion"],
  },
];

export const RETRIEVAL_STAGES = [
  "Matching keywords",
  "Finding related meaning",
  "Assembling the context",
  "Answer grounded in sources",
];

export function flightPhase(progress) {
  return FLIGHT_PHASES.findLastIndex((phase) => progress >= phase.start);
}

export function retrievalStage(progress) {
  if (progress < 0) return -1;
  if (progress >= 1) return 3;
  return Math.min(2, Math.floor(progress * 3));
}

export function smoothRange(value, start, end) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}
