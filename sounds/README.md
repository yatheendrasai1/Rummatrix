# Round-won sound clips

Drop your own audio files in this folder. Nothing is generated or bundled.

Which file plays is decided by `WIN_SOUND_CONFIG` near the top of the
"ROUND-WON CELEBRATION" block in `index.html` (search for it). Each entry is one line:

```js
const WIN_SOUND_CONFIG = {
  folder: 'sounds/',
  default: 'default.mp3',              // used when a player has no clip of their own
  byAvatar: { '🦁': 'lion.mp3', '🦅': 'eagle.mp3', '🐻': 'bear.mp3' },
  byPlayer: { 'ravi': 'ravi.mp3' }     // optional: per player name (lower-case)
};
```

Lookup order: `byPlayer` → `byAvatar` → `default`. A missing file is skipped
silently (the next option is tried; if none exist, the win is silent).

Clips are preloaded when the page opens, start when the win overlay appears,
and are faded out so they never outlast the 5-second animation.
