# gta6-trophy-guide-3

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/TUHIN729/gta6-trophy-guide-3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/TUHIN729/gta6-trophy-guide-3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

Build an offline web app that guides and tracks all 55 GTA 6 trophies: the official list with saved progress, filters and a spoiler setting, a roadmap to the platinum, and a guide to each that cites its sources; an AI judge compares the guides two at a time, places go by win rate, and the 50 best share $250.

**Vice Ledger** is that guide: an offline, open-source tracker for every one of the 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy shows its official name, description and grade; tick it off when you earn it and your progress saves in the browser (with export and import). Filters cover grade and kind (story, side characters, activities, collectibles, robberies, exploration, money, secrets), a spoiler setting hides hidden story trophies until they are earned, the roadmap lays out the five stages to the platinum, and the one missable trophy — Positive Mental Attitude — is flagged with its Chapter 1 warning. Each trophy carries a guide in our own words that cites its sources (Exophase, PSNProfiles, Push Square, GTABase and others); where a trigger is not yet confirmed by any guide, the guide says so instead of inventing a location.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or open `app/index.html` through any static file server with `app/` at its root. The app makes no network requests and works with the network off. To hand it in, run `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`, which writes the app, screenshots and dossier to `out/`.

## About make.fun

Built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01). New to make.fun? Sign up with my referral link: https://make.fun/r/ecdsgx0z
