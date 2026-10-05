# AXELAB Guitar Lab

A guitar practice app that runs in the browser (installable as a PWA, works offline).

- **Jam**: 36 progressions × 15 band styles. Synthesized drums, physically modeled guitar and bass, amp simulation, keys. A live fretboard follows the music: one key scale, or a scale per chord, with chord tones ringed and the next chord previewed before it lands. Key cycling, tempo trainer, custom progressions, drum programmer, mixer.
- **Neck**: 47 scales in any key, 9 tunings, up to 24 frets, positions with playable tab, diatonic chords, related scales.
- **Learn**: 33 lessons (Foundations → Advanced), 23 techniques, 20 artist style guides, glossary. Every tab is engraved and playable.
- **Theory**: scale library, chord builder with voicings, harmony for any mode, circle of fifths, intervals, modes.
- **Ear**: intervals, chord quality, scales, scale degrees, fretboard notes.
- **Tools**: practice routines and log, metronome, tuner, Riff Lab.

No build step. Serve the folder with any static server.

## Tests

```
node tests/content.test.js          # verifies every tab note against its declared scale
npx http-server -p 8765 . &         # then:
node tests/e2e.js                   # drives the whole app in headless Chromium (needs Playwright)
```
