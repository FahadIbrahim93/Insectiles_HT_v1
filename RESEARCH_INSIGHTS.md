# 2026 Hybrid-Casual Game Standards - Pinik Pipra

## 1. Visual Benchmarks (The "Wow" Factor)
*   **Neon-on-Dark Aesthetics:** High contrast between deep space/plasma backgrounds and vibrant neon sprites.
*   **Layered Juice:** Every interaction triggers at least 3 layers of feedback:
    1.  **Direct:** Sprite squash/stretch + color flash.
    2.  **Environmental:** Screen shake + radial ripple.
    3.  **UI:** Score popups with easing + combo count "bump".
*   **Procedural Trippyness:** Backgrounds shouldn't be static images. They should use procedural warps (plasma/mandalas) that react to the music/tempo.

## 2. Performance & Loading
*   **Target:** < 2s to interactive on mid-range Android (2024 era).
*   **DPI Sensitivity:** Must render at 2x/3x scale on Retina/OLED displays to avoid "fuzziness" mentioned in user issues.
*   **Asset Atlasing:** Even for vanilla Canvas, batching draws from a single hidden canvas (atlas) significantly reduces context switches.

## 3. Viral Hooks
*   **The "Fever" State:** Needs to be a significant visual departure. Invert colors, apply "fisheye" distortion, and accelerate the BPM.
*   **Shareable Highs:** Automatically highlight the "best combo" of the session with a unique particle burst.
*   **Accessibility:** High-contrast modes and "reduced motion" are now standard for global reach.

## 4. Audio-Visual Sync (Haptic integration)
*   **Pitched Feedback:** Successive hits in a combo should increase in pitch (musical scale) to create a sense of progression.
*   **Haptic "Knock":** Use short vibration pulses for hits, long low-frequency for Fever start.
