import test from 'node:test';
import assert from 'node:assert/strict';
import {metalEase,metalGeometry,metalIntensity,metalPlaybackRate,metalEntryEnergy} from '../src/metalGeometry.mjs';
test('symmetric easing starts slowly, accelerates centrally and slows on arrival',()=>{
 assert.equal(metalEase(0),0);assert.equal(metalEase(1),1);
 assert.ok(metalEase(.25)<.1);assert.ok(Math.abs(metalEase(.5)-.5)<1e-6);
 assert.ok(metalEase(.75)>.9);assert.ok(metalEase(.55)-metalEase(.45)>metalEase(.1));
 let last=0;for(let i=0;i<=100;i++){const v=metalEase(i/100);assert.ok(v>=last&&v<=1);last=v;}
});
test('both routes share top-left start and bottom-right finish at responsive sizes',()=>{
 for(const [w,h] of [[756,180],[350,216],[350,400]]){
 const g=metalGeometry(w,h),start=s=>s.match(/^M ([\d.]+) ([\d.]+)/).slice(1),end=s=>s.split(' ').slice(-2);
 assert.deepEqual(start(g.upper),start(g.lower));assert.deepEqual(end(g.upper),end(g.lower));
 assert.ok(+start(g.upper)[0]<12&&+start(g.upper)[1]<12);
 assert.ok(+end(g.upper)[0]>w-12&&+end(g.upper)[1]>h-12);
 assert.ok(g.upper.includes(`H ${w-12}`));assert.ok(g.lower.includes(`V ${h-12}`));
 assert.ok(Math.abs(g.length-(w+h-48+Math.PI*11))<1e-8);
 }
});

test('luminance ramps independently from 18 to 65 percent over 2200ms',()=>{
 assert.ok(Math.abs(metalIntensity(0)-.18)<1e-6);
 assert.ok(Math.abs(metalIntensity(2200)-.65)<1e-6);
 assert.ok(Math.abs(metalIntensity(1100)-.415)<1e-6);
 assert.ok(metalIntensity(1800)<metalIntensity(2200));
});

test('initial motion settles monotonically and stays calm after four seconds',()=>{
 assert.equal(metalPlaybackRate(0),5.25);
 assert.equal(metalPlaybackRate(4000),1.05);
 assert.equal(metalPlaybackRate(16000),1.05);
 let previous=5.25;for(let t=0;t<=5000;t+=50){const rate=metalPlaybackRate(t);assert.ok(rate<=previous&&rate>=1.05);previous=rate;}
});

test('calm material retains at least 30 fresh frames per second',()=>{
 assert.ok(30*metalPlaybackRate(5000)>=30);
 // 48s clip preserves the previous perceived speed of a 16s clip at .35x.
 assert.ok(Math.abs(48/metalPlaybackRate(5000)-16/.35)<1e-8);
});

test('entry color energy rises gently and disappears completely at rest',()=>{
 assert.equal(metalEntryEnergy(0),0);
 assert.ok(metalEntryEnergy(600)>.5);
 assert.ok(metalEntryEnergy(3500)<.02);
 assert.equal(metalEntryEnergy(4000),0);
 assert.equal(metalEntryEnergy(16000),0);
});
