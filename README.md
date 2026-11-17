# Solano Drive

An original 2D top-down open-world crime game — the city of Puerto Solano with beach,
downtown and suburb districts, traffic and pedestrians, cars to steal and drive, a
5-star wanted system with police pursuit, an 8-mission original story, combat, a HUD
with minimap, synthesized WebAudio sound and localStorage saves — built entirely by an
AI agent for make.fun's "Make GTA 6" bounty.

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/hanadiana258/gta6-open-world/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/hanadiana258/gta6-open-world/reward.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

## Play

Serve `game/` with any static server (`node serve.ts` in the repo root serves it at
http://localhost:8080) and open it in desktop Chrome. Keyboard and mouse; no network
requests, everything is in `game/`.

## Build the outputs

    mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

MIT licensed. See [make.fun](https://make.fun/bounty/gta6-01).
