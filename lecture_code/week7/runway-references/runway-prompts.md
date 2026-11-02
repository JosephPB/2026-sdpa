# Runway prompts for the Week 7 lecture

These are short visual transitions for the lecture. Use the generated clips as atmospheric bridges; keep exact pixel values, labels, locations and measurements in the Quarto slides.

## 1. Pixel duck to RGB channels

**Upload:** `pixel-duck-start-frame.png` as the image-to-video input. Optionally add `pixel-duck-array-slide.png` as a style/reference image if the Runway workflow supports it. The slide screenshot is context for the lesson; do not ask Runway to reproduce its code or text.

**Suggested settings:** 5 seconds, 16:9.

**Prompt:**

> Create a short, calm educational motion graphic from the attached pixel-duck image. Keep the duck centred on the same pale background. Treat it as a fixed 10-column by 7-row grid of square pixels. Start with the complete duck visible and hold briefly. Then gently lift its red, green and blue colour channels into three parallel, translucent planes, keeping every cell aligned to its original row and column. Pause with the planes separated, then slide them back together to restore the same duck and end on the opening composition. Locked camera, clean flat 2D diagram style, smooth restrained easing, crisp square cells, same simple palette throughout. Preserve the duck silhouette and grid layout. No camera move, extra objects, gradients, labels, text, numbers or code. The motion is a visual metaphor for colour channels, not a claim about the exact array representation.

**Teaching use:** Play as a brief hook before the live NumPy array example. The code and the deck’s static grid establish the actual dimensions and values.

## 2. Bristol map transition into the real data map

**Upload:** `bristol-map-high-res.png` as a visual/style reference only. It is a 3200 × 2267 clean export of the map layers, without slide text or interface. The vector source is also available as `bristol-map-high-res.svg`. Do not use the data map as the video’s starting frame: generated video can shift or invent data marks. If image-to-video requires a starting image, make or choose a plain off-white frame instead.

**Suggested settings:** 5 seconds, 16:9.

**Prompt:**

> Create a short, minimal educational transition inspired by the attached slide’s restrained Bristol University lecture aesthetic. On an off-white background, an abstract Bristol-like street network draws itself gradually from the centre outward using thin, pale grey lines. A few small burgundy circles appear at intersections and pulse gently once, then settle. Keep the map deliberately illustrative and schematic, with no claim to represent measured locations or values. Fixed camera, no zoom, subtle smooth motion, generous negative space. During the final half-second, fade all lines and circles to plain off-white so the clip can cross-fade into the real Bristol traffic and air-quality map on the next slide. No text, labels, numbers, axes, legends, interface elements, exact geography, pollution heatmap or other data graphics.

**Teaching use:** Place immediately before the real traffic and air-quality map. Introduce it as a visual transition, then reveal the sourced observations and explain what the marks encode.

## Reference images

- Pixel-duck lesson slide: `pixel-duck-array-slide.png`
- Clean image-to-video first frame: `pixel-duck-start-frame.png`
- High-resolution Bristol map reference: `bristol-map-high-res.png` (3200 × 2267 PNG)
- Scalable vector source: `bristol-map-high-res.svg`
- Bristol traffic and air-quality slide: `bristol-map-overlay-slide.png`
