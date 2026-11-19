import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessFrame, createFrameAssessment, initialRenderLevel, measuredBandwidth,
  networkTier, pixelRatioFor, renderLevel, textureTier } from '../src/components/scene/qualityPolicy.js';

test('connection quality honors Data Saver and slow networks before device power', () => {
  const device = {cores:16,memory:8};
  assert.equal(textureTier('auto',{saveData:true,downlink:100},device),'light');
  assert.equal(textureTier('auto',{effectiveType:'3g',downlink:10},device),'light');
  assert.equal(networkTier({downlink:1.6}),'light');
  assert.equal(networkTier({downlink:20,rtt:20}),'original');
  assert.equal(networkTier({}),'balanced');
  assert.equal(networkTier({},25),'original');
  assert.equal(networkTier({downlink:100},1.5),'light','measured transfers override an optimistic hint');
});

test('device and connection are separate inputs; maximum is an explicit override', () => {
  assert.equal(initialRenderLevel({cores:16,memory:8}),2);
  assert.equal(initialRenderLevel({cores:2,memory:2}),0);
  assert.equal(initialRenderLevel({}),1);
  assert.equal(textureTier('auto',{downlink:100},{memory:2}),'light');
  assert.equal(textureTier('maximum',{saveData:true},{memory:2}),'original');
  assert.equal(renderLevel('maximum',0),3);
  assert.equal(renderLevel('balanced',3),1);
});

test('high-end mobile gets native 3x rendering and very large displays stay within a pixel budget', () => {
  assert.equal(pixelRatioFor(3,390,844,3),3);
  assert.equal(pixelRatioFor(3,1440,900,1),1.5);
  assert.equal(pixelRatioFor(0,390,844,3),1);
  const ratio = pixelRatioFor(3,3840,2160,3);
  assert.ok(3840 * 2160 * ratio ** 2 <= 8_300_001);
});

test('bandwidth ignores cached requests and CPU gaps, without double-counting concurrent transfers', () => {
  const entries = [
    {transferSize:300000,encodedBodySize:300000,responseStart:100,responseEnd:200},
    {transferSize:300000,encodedBodySize:300000,responseStart:150,responseEnd:250},
    {transferSize:300000,encodedBodySize:300000,responseStart:3000,responseEnd:3100},
    {transferSize:0,encodedBodySize:90000000,responseStart:1,responseEnd:5000},
  ];
  assert.equal(measuredBandwidth(entries),28.8);
  assert.equal(measuredBandwidth(entries.slice(3)),0);
  assert.equal(measuredBandwidth([]),0);
});

function simulate(sample, fps, seconds, level, enabled=true) {
  for(let i=0;i<fps*seconds;i++) level=assessFrame(sample,1/fps,level,enabled);
  return level;
}

test('sustained frame rate promotes capable devices and reduces load on struggling devices', () => {
  const sample=createFrameAssessment();
  let level=simulate(sample,60,8,1);
  assert.equal(level,2);
  level=simulate(sample,60,14,level);
  assert.equal(level,3);
  level=simulate(sample,20,12,level);
  assert.equal(level,2);
});

test('brief stutters, paused scenes, hidden-tab gaps and borderline FPS do not oscillate quality', () => {
  const sample=createFrameAssessment();
  assert.equal(simulate(sample,20,2,2),2);
  assert.equal(simulate(sample,50,10,2),2);
  assert.equal(simulate(sample,10,15,2,false),2);
  assert.equal(assessFrame(sample,20,2),2);
  assert.equal(simulate(sample,60,2,2),2);
});
