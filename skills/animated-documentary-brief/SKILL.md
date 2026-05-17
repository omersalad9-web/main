---
name: animated-documentary-brief
description: Produces a complete solo-build production brief for a Fern-style animated documentary — script breakdown, shot list (with AI tool assignments and prompts), asset folder structure, voiceover settings, edit rhythm notes, thumbnail concepts, and publish checklist. Use when asked to plan, brief, or produce an animated documentary video.
---

# Animated Documentary Brief

This skill produces a **complete production brief** for a solo-built animated documentary in the style of Fern / Real Stories. The output is a self-contained document a single creator can execute with ElevenLabs, Google Flow (Veo 3), Sora 2, Whisk, DaVinci Resolve, and Epidemic Sound.

## When to activate

Activate when the user:
- Asks to "produce a production brief" or "plan an animated documentary"
- Provides a finished or draft script and asks what to do next
- Asks how to turn a topic/script into a YouTube documentary video
- Wants to commission a production vendor to build the video for them
- Uses phrases like "Fern-style", "solo build", "AI documentary", "shot list", "vendor brief", "commission"

## Two modes

Before generating anything, clarify which output the user needs:

**Mode A — Solo build brief** (default)
A DIY production guide the user executes themselves with ElevenLabs, Veo 3, Sora 2, Whisk, DaVinci Resolve, and Epidemic Sound. Covers the full shot list with generation prompts, tool settings, edit rhythm, and publish checklist. Cost: ~£180–260.

**Mode B — Vendor commissioning brief**
A client-facing document sent to a production agency or freelancer. Specifies outcomes (not tools), milestones, deliverables, creative guardrails, and payment structure. The vendor chooses their own stack.

Both can be generated from the same locked script. If the user has a script and wants to explore both options, generate Mode A first (it informs the quality expectations in Mode B).

## Inputs you need

Before generating either brief, confirm:
1. **Script** — is there a finished script, or should you draft one first?
2. **Topic/angle** — what is the central argument or revelation of the film?
3. **Target runtime** — default is 16–18 minutes
4. **Tone** — default is Fern/Real Stories: restrained, academic, no dramatic inflection
5. **Platform** — default is YouTube; adjust monetisation notes for Nebula/Patreon if specified
6. **Mode** — solo build or vendor commission (or both)?

If the script is missing, offer to write it first using the narrative structure in Section 1 of the template.

## Output structure

Generate the brief with these sections, in order:

1. **Production stack** — tool table with plan tier and cost
2. **Pre-production checklist** — Day 1–2 tasks before any generation
3. **Shot list** — scene-by-scene, with shot #, type (🎬/🖼️/📼/📊), tool assignment, and full generation prompt
4. **Asset folder structure** — copy-paste ready directory tree
5. **Archival sources** — free public domain sources with search terms
6. **Voiceover production** — ElevenLabs settings, generation workflow, pacing notes
7. **Visual generation** — prompt engineering template, style tokens, policy workarounds
8. **Edit principles** — Fern rhythm rules, music map by act, colour grade, captions
9. **Thumbnail & packaging** — three concept options, title variants
10. **Publish checklist** — export, captions, monetisation expectations
11. **Realistic timeline** — phased day count

## Key principles to apply throughout

### The Fern rhythm
- Cut on the breath, not the beat
- Hold shots 9–12 seconds (longer than feels comfortable)
- Map at least 3 moments of complete silence (no music, no SFX)
- Mirror the cold open visuals exactly at the close — the visual rhyme is the argument

### Visual generation strategy
- Generate atmospheric aftermath, never the act itself
- Add `no people visible` to every shot in sensitive sections
- Style tokens for historical material: `desaturated cinematic, 35mm film grain, period accurate, photographic realism, atmospheric, no graphic content`
- Style tokens for modern footage: `photorealistic, cinematic anamorphic, warm amber tones, shallow depth of field, contemporary documentary style`
- Generation order: simple atmospherics first → period exteriors → modern footage → human action last

### Policy workarounds for sensitive history
Never describe the act — describe the room it happened in:
- ✅ "empty operating theatre" not "surgery room"
- ✅ "closed door" not "door behind which X is happening"
- ✅ "abandoned village street" not "village hit by plague"
- ✅ "ceramic canister opening mid-air" not "biological weapon deploying"

### Voiceover first, always
Lock the voiceover before generating a single frame. Every shot duration flows from audio timing. This is the single decision that most determines quality.

## Production stack defaults

| Layer | Tool | Plan |
|---|---|---|
| Script | Claude | — |
| Voiceover | ElevenLabs | Creator (~£18/mo) |
| Animated shots (primary) | Google Flow (Veo 3) | Google AI Pro (~£18/mo) |
| Animated shots (backup) | Sora 2 | ChatGPT Pro (~£18/mo) |
| Stills | Google Whisk | Included with AI Pro |
| Archival footage | Internet Archive / LoC | Free |
| Music | Epidemic Sound | Personal (~£12/mo) |
| Edit | DaVinci Resolve | Free |
| Thumbnail | Midjourney v7 | Basic (~£8/mo) |

**Typical one-video cost: £180–260** (one month of all tools + generation over-allocation)

## Shot type legend

- 🎬 **AI Animated** — Veo 3 or Sora 2, moving cinematic clip
- 🖼️ **AI Still** — Whisk, static frame with optional Ken Burns in edit
- 📼 **Archival** — real footage from Internet Archive / LoC / public domain stock
- 📊 **Graphic** — animated map, text card, data overlay built in DaVinci/After Effects

## Prompt engineering template

Every Veo 3 / Sora 2 prompt should follow:

> `[SHOT TYPE] of [SUBJECT], [ACTION/MOTION], [SETTING/PERIOD], [LIGHTING], [MOOD], [STYLE/CAMERA], [RESTRICTIONS]`

Example:
> "Slow dolly forward down a long empty sterile corridor, 1940s institutional architecture, locked metal doors on both sides, cold fluorescent light, atmospheric and tense mood, photorealistic cinematic 35mm film, no people visible, no graphic content"

## Music map template

| Act | Mood | Epidemic Sound search |
|---|---|---|
| Cold open | Minimal hopeful piano | "documentary piano minimal hopeful" |
| Rising tension | Slow ascending build | "documentary slow build tension" |
| Dark centrepiece | Industrial drone, no melody | "ambient drone documentary dark" |
| Aftermath | Mostly silence, sparse single notes | "minimal piano dark sparse" |
| Resolution | Returns to opening piano theme | (reuse cold open track) |

## Reference materials

- `resources/production_brief_example.md` — complete worked example, Mode A (Unit 731, 84 shots, solo build)
- `resources/shot_list_template.md` — blank shot list table ready to populate
- `resources/vendor_brief_template.md` — Mode B vendor commissioning brief template (outcomes-based, tool-agnostic)
