# Design System Specification: The Kinetic Explorer

This design system translates the nostalgic energy of a global phenomenon into a high-end, editorial digital experience. It moves away from "game-like" cliches to embrace a "Modern Tech meets Adventure Journal" aesthetic. The goal is to create a UI that feels like a premium field-research tool: authoritative, clean, and layered with intentional depth.

---

### 1. Creative North Star: The Digital Field Guide
The "Creative North Star" for this system is **The Digital Field Guide**. Imagine a high-tech pokedex reimagined by a Swiss design house. It rejects the "boxy" nature of standard web grids in favor of **intentional asymmetry** and **tonal layering**. 

We achieve this by:
*   **Editorial Spacing:** Using generous white space (16/20/24 tokens) to let content breathe like a premium magazine.
*   **Fragmented Layouts:** Overlapping images or data chips across container boundaries to imply movement and discovery.
*   **Technical Sophistication:** Balancing the vibrant Primary Red with the intellectual Depth of Slate Blue, used primarily for data-heavy or interactive "tech" moments.

---

### 2. Tonal Architecture (Colors)

We utilize a sophisticated Material-based palette to ensure the vibrant red remains a highlight rather than an eyesore.

*   **The Primary Core (`#b22200`):** This is our "Action Red." Use it sparingly for primary CTAs and critical status indicators.
*   **The Slate Depth (`#505d86` / `#2A375E`):** Our secondary "Tech" color. Use this for navigation bars, sidebar containers, and high-contrast data visualizations.
*   **The "No-Line" Rule:** **Strictly prohibit 1px solid borders for sectioning.** To separate a sidebar from a main feed, do not draw a line. Instead, place a `surface_container_low` (`#f2f4f6`) sidebar against a `surface` (`#f8f9fb`) main stage.
*   **Glass & Gradient Strategy:** For hero sections, use a subtle linear gradient from `primary` to `primary_container` at a 135-degree angle. This adds "soul" and prevents the red from looking flat or "plastic."

---

### 3. Typography: Editorial Authority

We pair **Public Sans** (Display/Headlines) for its geometric, authoritative tech feel with **Inter** (Body/Labels) for its world-class readability.

| Role | Token | Font | Size | Weight | Intent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Public Sans | 3.5rem | 700 | Massive hero headers; "The Adventure Begins" |
| **Headline**| `headline-md`| Public Sans | 1.75rem | 600 | Section titles; Field Journal entries |
| **Title**   | `title-lg`   | Inter | 1.375rem | 600 | Card titles and prominent list headers |
| **Body**    | `body-lg`    | Inter | 1rem | 400 | Standard reading text |
| **Label**   | `label-md`   | Inter | 0.75rem | 500 | Technical data, metadata, and captions |

**Typographic Tip:** Use `on_surface_variant` (#5c4039) for subheaders to create a soft, "journal-ink" contrast against the dark Slate Blue of primary text.

---

### 4. Elevation & Depth: The Layering Principle

In this system, depth is biological, not mechanical. We avoid harsh dropshadows in favor of **Tonal Stacking**.

*   **The Stacking Order:** 
    1.  **Base:** `surface` (#f8f9fb)
    2.  **Sectioning:** `surface_container_low` (#f2f4f6)
    3.  **Floating Elements (Cards):** `surface_container_lowest` (#ffffff)
*   **Ambient Shadows:** If an element must "float" (like a modal or a primary FAB), use a highly diffused shadow: `box-shadow: 0 12px 40px rgba(42, 55, 94, 0.06);`. The shadow color is a faint tint of our Slate Blue, never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a container definition, use `outline_variant` at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** For top navigation bars, use `surface` with 80% opacity and a `backdrop-filter: blur(12px)`. This creates a high-tech "frosted lens" effect.

---

### 5. Signature Components

All components adhere to the **12px (`md`: 0.75rem)** corner radius to balance approachability with modern precision.

*   **Action Buttons:**
    *   **Primary:** `primary` background with `on_primary` text. Use a 1.5px "Ghost Border" of `primary_fixed_dim` for a subtle inner-glow.
    *   **Secondary (The Tech Button):** `secondary_container` background with `on_secondary_container` text. This is for secondary actions like "View Specs."
*   **Data Chips:** Use `secondary_fixed` (#dbe1ff) for categorizing items (e.g., "Fire Type", "Legendary"). Forbid borders; use background color shifts only.
*   **The "Adventure" Card:** Cards must have no border. Use `surface_container_lowest` (#ffffff) against a `surface_container` background. 
    *   *Pro Tip:* Bleed images off the top-right corner of the card by -12px to break the "contained" feel.
*   **Input Fields:** Use `surface_container_high` as the background with a 2px bottom-accent of `outline_variant` that transforms into `primary` red on focus.
*   **Field Dividers:** Forbid the 1px line. Use a **12 (3rem)** spacing gap or a subtle color block change to signify a new chapter in the content.

---

### 6. Do’s and Don’ts

#### Do:
*   **Do** use asymmetrical margins. A wider left margin (using the **10** or **12** spacing token) gives a "journal" feel.
*   **Do** use `tertiary` (#005ab6) for "Information" or "Water-type" related data visualizations to provide a cool contrast to the red.
*   **Do** utilize the `surface_bright` token for active states in navigation.

#### Don’t:
*   **Don't** use pure black (#000) for text. Always use `on_surface` (#191c1e) to maintain the premium, high-end ink look.
*   **Don't** use a 1px border to separate cards in a list. Use `6` (1.5rem) of vertical white space instead.
*   **Don't** stack Primary Red on Top of Slate Blue. It causes visual vibration. Use `on_primary_fixed` as a bridge.

---

### 7. Accessibility & Motion
*   **Contrast:** Ensure all `label-sm` text on `surface_container` meets WCAG AA standards.
*   **Motion:** Interactions should feel "Kinetic." When a card is hovered, it should lift using a `0.3s cubic-bezier(0.34, 1.56, 0.64, 1)` transition—a slight "spring" that evokes the excitement of an encounter.