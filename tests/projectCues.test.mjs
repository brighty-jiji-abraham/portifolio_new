import test from "node:test";
import assert from "node:assert/strict";
import { crossedProjectCue, PROJECT_SOUND_CUES } from "../src/audio/projectCues.js";

test("a cue fires once when playback crosses its time", () => {
  const cues = PROJECT_SOUND_CUES.conversation;
  assert.equal(crossedProjectCue(cues, null, 0.6, 12), null);
  assert.equal(crossedProjectCue(cues, 0.5, 0.6, 12), cues[0]);
  assert.equal(crossedProjectCue(cues, 0.6, 0.7, 12), null);
  assert.equal(crossedProjectCue(cues, 0.6, 0.6, 12), null);
});

test("crossings continue through a loop boundary", () => {
  const cues = [{ at: 0.02, kind: "land" }];
  assert.equal(crossedProjectCue(cues, 11.99, 12.05, 12), cues[0]);
  assert.equal(crossedProjectCue(cues, 12.05, 12.1, 12), null);
  assert.equal(crossedProjectCue(cues, 23.99, 24.05, 12), cues[0]);
});

test("seeking and delayed frames do not create a backlog", () => {
  const cues = PROJECT_SOUND_CUES.publishing;
  assert.equal(crossedProjectCue(cues, 0.7, 7.2, 11), null);
  assert.equal(crossedProjectCue(cues, 7.2, 0.7, 11), null);
  assert.equal(crossedProjectCue(cues, 7.2, 7.3, 11), null);
});

test("a frame with multiple crossings plays only the latest cue", () => {
  const cues = [{ at: 1.1, kind: "reply" }, { at: 1.05, kind: "send" }];
  assert.equal(crossedProjectCue(cues, 1, 1.2, 12), cues[0]);
});

test("invalid clock values cannot emit audio", () => {
  const cues = PROJECT_SOUND_CUES.bingo;
  for (const invalid of [NaN, Infinity, -Infinity]) {
    assert.equal(crossedProjectCue(cues, invalid, 1.2, 13), null);
    assert.equal(crossedProjectCue(cues, 1.1, invalid, 13), null);
    assert.equal(crossedProjectCue(cues, 1.1, 1.2, invalid), null);
  }
  assert.equal(crossedProjectCue(cues, 1.1, 1.2, 0), null);
});
