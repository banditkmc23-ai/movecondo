# MoveCondo (ย้ายคอนโด)

Thai-first Bangkok condo-rental matching site.

**Live:** https://banditkmc23-ai.github.io/movecondo/

Neighborhood guides, real nearby places, and 21 room listings are live.

Contact: [ทัก LINE](https://line.me/R/ti/p/%40576yhgtz)

This repository is published via GitHub Pages (branch `main`, root).

## Maintaining pages

Home, area, and room HTML in this repo is **hand-maintained**. Do not regenerate
those pages from older helper scripts (including `/tmp/publish_rooms.py`). Running
a stale builder would overwrite the current layout: the clean landing, photo
carousels, and nearby-place marquees.

When a listing or nearby place changes, edit the relevant HTML (and files under
`data/`) directly.
