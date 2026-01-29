# Why Your Sliders Feel Broken (And How to Fix It)

**TL;DR:** Standard sliders are terrible for real-world data like "time quitting" or "nicotine strength." They treat "3 months" and "10 years" the same, which ruins the UX. Here is the simple math trick I used to fix it for _iDontVape_.

## The "Linear" Trap

I was building the onboarding for my quit-vaping app, and I hit a wall with a simple question: _"How long have you vaped?"_

The range is huge: from **1 month** to **10+ years**.

If you use a standard slider:

- Trying to select "3 months" is a pixel-perfect nightmare (it's tiny).
- Selecting "7 years" is easy, but "7 years and 1 month" is pointless precision.

The same problem happened with **Nicotine Strength** (3mg is huge, 50mg is rare) and **Puffs per Day**.

## The Fix: Two-Layer "Magic"

Visuals and data are different things. You need to treat them differently.

### 1. The Visual Trick (Square Root Curve)

First, I stopped mapping the slider `0-100` like a ruler. I used a **Square Root Curve**.

This is just a math term for: _“Give the small numbers more screen space.”_

Visually, the first 25% of the slider now takes up about 50% of the width. This makes sliding between **1 month** and **2 years** feel spacious and easy, while **5 years** to **10 years** gets compressed (because you don't need pixel-perfect accuracy there).

### 2. The Snapping Logic (Variable Steps)

Visuals aren't enough. The values need to "snap" to what users actually say.

I wrote logic to change the "step" size as you drag:

**For Time:**

- **Under 2 Years:** Snaps to every **1 month**. (Precision matters here!)
- **Over 2 Years:** Snaps to every **1 year**. ("7 years" is fine; "7 years and 1 month" is noise).

**For Nicotine:**

- **Low (3-20mg):** Steps by **1mg** (Detailed).
- **Medium (20-30mg):** Steps by **5mg**.
- **High (30+ mg):** Steps by **10mg** (Fast).

## Why It Matters

It feels "natural." Users don't think in linear spreadsheets.

- "I've vaped for a few months" -> Needs precision.
- "I've vaped for a decade" -> Needs broad strokes.

Your UI should match the user's mental model, not the database's integer type.

---

_Building [iDontVape] in public. Follow for more dev logs._
