# Emoji Shiritori Roadmap

> GitHub Issues are the authoritative source for design and requirements. This file is only a lightweight implementation roadmap.

## Phase 1 — Foundation

- [x] #5 — Issue Driven Development (IDD) as development standard
- [x] #4 — Ontology design
- [x] #3 — Game / UI / rules / data-model design
- [x] Add `AGENTS.md` for agent execution rules

## Phase 2 — Core Game

- [ ] Centralize `GameState`
- [ ] Extract pure rule engine
- [ ] Formalize `Move` and playability
- [ ] Improve Japanese reading normalization
- [ ] Handle terminal `ん` and edge cases consistently

## Phase 3 — Game Experience

- [ ] Combo / score system
- [ ] Playable-card highlighting
- [ ] CPU difficulty levels
- [ ] CPU thinking / move feedback
- [ ] Mobile-first battle UI polish

## Phase 4 — Data Quality

- [ ] JSON Schema for emoji data
- [ ] CI validation for duplicates and readings
- [ ] Normalize category / tag vocabulary
- [ ] Add aliases / difficulty / rarity metadata

## Phase 5 — Release

- [ ] PWA performance tuning
- [ ] Production build verification
- [ ] GitHub Pages deployment verification
- [ ] Release checklist

## Development flow

```text
Issue
  ↓
Definition / Ontology / Design
  ↓
Implementation
  ↓
Test / Build
  ↓
Commit / PR
  ↓
Issue update
  ↓
Close
```
