const cue = (at, kind, pan = 0, strength = 1) => ({ at, kind, pan, strength });
const repeat = (count, interval, events) =>
  Array.from({ length: count }, (_, index) =>
    events.map((event) => ({ ...event, at: event.at + index * interval })),
  ).flat();

// Seconds on each exhibit's own animation clock, not wall-clock timers.
export const PROJECT_SOUND_CUES = {
  conversation: repeat(3, 4, [cue(0.6, "send", -0.25), cue(3, "reply", 0.25)]),
  publishing: [
    cue(0.8, "paper", -0.25),
    cue(2.1, "type"),
    cue(3.4, "type"),
    cue(4.7, "type"),
    cue(6.9, "confirm", 0.2),
  ],
  retrieval: repeat(2, 5, [cue(0.8, "paper", -0.3), cue(3.2, "reply", 0.3)]),
  query: [cue(1.8, "pulse"), cue(4.7, "confirm", 0.3)],
  routing: repeat(3, 4, [cue(1.8, "relay", 0.2)]),
  workflow: repeat(4, 2.3, [cue(1.7, "confirm", 0, 0.65)]),
  skin: [cue(0.6, "scan", -0.15), cue(4.8, "confirm", 0.25, 0.7)],
  assistant: repeat(3, 4, [
    cue(0.5, "scan", -0.15),
    cue(2.3, "reply", 0.25, 0.7),
  ]),
  emotion: repeat(3, 4, [cue(2.3, "pulse", 0, 0.7)]),
  voting: [
    cue(1.2, "paper", -0.2),
    cue(3.2, "land", -0.2),
    cue(4.5, "confirm", 0.3),
  ],
  tenants: [
    cue(2, "relay", -0.3, 0.7),
    cue(4, "relay", 0, 0.7),
    cue(6, "relay", 0.3, 0.7),
  ],
  workout: repeat(3, 4, [cue(2, "land", 0.15, 0.6)]),
  classifier: repeat(3, 4, [
    cue(0.35, "scan", -0.2, 0.6),
    cue(2.4, "confirm", 0.3, 0.75),
  ]),
  commerce: repeat(3, 4, [cue(2.5, "land", -0.2), cue(3.3, "paper", 0.3, 0.7)]),
  events: repeat(3, 4, [cue(2.4, "paper", 0, 0.8)]),
  sentiment: repeat(3, 4, [
    cue(0.6, "scan", -0.2, 0.5),
    cue(3.1, "reply", 0.25, 0.7),
  ]),
  universe: [cue(3, "orbit", -0.3), cue(9, "orbit", 0.3), cue(15, "orbit", 0)],
  responsive: repeat(3, 4, [cue(2, "paper", 0, 0.65)]),
  collaboration: [
    cue(1.2, "type", -0.2),
    cue(3, "type", 0.2),
    cue(4.8, "type", -0.2),
    cue(6.2, "reply", 0.2, 0.6),
  ],
  bingo: [
    cue(1.15, "land"),
    cue(3.95, "land"),
    cue(6.75, "land"),
    cue(9.55, "land"),
    cue(10.6, "celebrate", 0, 0.8),
  ],
  treasure: [
    cue(2.4, "relay", -0.2, 0.65),
    cue(4.5, "relay", 0, 0.65),
    cue(6.6, "open", 0.25),
    cue(8.1, "celebrate", 0.25, 0.8),
  ],
};

// Emit at most one recent event. Pauses, seeks, tab restores and dropped frames
// must never replay a backlog of sounds or repeat a cue on a frozen frame.
export function crossedProjectCue(cues, previous, elapsed, duration) {
  if (
    previous === null ||
    !Number.isFinite(previous) ||
    !Number.isFinite(elapsed) ||
    !Number.isFinite(duration) ||
    duration <= 0 ||
    elapsed <= previous ||
    elapsed - previous > 0.25
  )
    return null;
  let crossed = null,
    latest = previous;
  for (const event of cues) {
    const at =
      Math.floor((elapsed - event.at) / duration) * duration + event.at;
    if (at >= 0 && at > latest && at <= elapsed) {
      crossed = event;
      latest = at;
    }
  }
  return crossed;
}
