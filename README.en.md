# Gallop

A running rhythm game on a path at sunset: your runner dashes to the right, bats come in the air and slimes on the ground. Hit the right lane when the monster touches its circle. Play the 1200 tracks from the Rythme plugin, or your own music.

*Version française : [README.md](README.md)*

## How to play

- **In the air** (bats): **J**, **K** or **↑**.
- **On the ground** (slimes): **F**, **D** or **↓**. Hitting the wrong lane does nothing: the monster goes by and it's a miss.
- **Two monsters together**: they come from the track's chords; hit **both lanes** at the same time.
- **Golden ribbons**: on long notes. Hit the start, then **hold the key down** to the end: every tenth of a second held scores. Letting go too early ends the ribbon.
- With the **mouse** or a **finger**: the top half of the screen for the air, the bottom half for the ground (a finger kept down holds ribbons).
- **Space**: play · **P**: pause · **Full screen** during the game.

## Accuracy and points

Notes are judged by how far they are from the right moment: **Perfect** (about ±45 ms), **Good** (±90 ms), **OK** (±140 ms), otherwise a miss.

A note's points rise by 1 % per note of combo, up to double at 100 notes in a row; a miss resets the combo. At the end, accuracy gives a grade: **S** from 95 %, **A** at 90 %, **B** at 80 %, **C** at 70 %, **D** below.

## Songs and difficulty

The **Songs** tab has the 1200 Rythme tracks, in four difficulties (Easy, Normal, Hard, Expert). Each level's difficulty is computed from its notes (density, busy passages), from 1 to 10 stars.

## My music

In **My music**, create a level from an imported **audio file** or a track from your **NeoMusic** library: the game finds its tempo and strong beats and turns them into a level, at the chosen **difficulty** (1 to 10 stars).

## Settings

- Music **volume**.
- **Hit sound**: the sound played on each note you hit, one of 10 (Soft, Clap, Wood, Kick, Crystal, Pop, Hi-hat, Snare, Pluck, Tock) or none. Losing a combo of 10 or more plays a « combo break » sound.
- **Offset** (−300 to +300 ms): it adjusts itself after each game based on your average lateness or earliness; you can also change it by hand.

## Data and sync

Your scores and grades per level and your settings are stored by NeoDex, backed up and synced between your PCs when sync is on.

## Install

In NeoDex: **NeoStore → Discover → Gallop → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
