"""Render the storefront tile (PNG) for dsh-voice-enhance.

The catalog accepts only GitHub-hosted raster images for `icon:`, so the
plugin's SVG mark is rasterised here with Pillow instead of shipping the SVG.
"""
from PIL import Image, ImageDraw

SIZE = 512
SS = 4  # supersample for smooth curves
W = SIZE * SS

img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# Rounded-square background with the plugin's blue -> violet gradient.
radius = 112 * SS
grad = Image.new("RGB", (W, W))
gd = ImageDraw.Draw(grad)
c0 = (76, 141, 255)   # #4c8dff
c1 = (138, 92, 255)   # #8a5cff
for y in range(W):
    for_x = y / (W - 1)
    r = int(c0[0] + (c1[0] - c0[0]) * for_x)
    g = int(c0[1] + (c1[1] - c0[1]) * for_x)
    b = int(c0[2] + (c1[2] - c0[2]) * for_x)
    gd.line([(0, y), (W, y)], fill=(r, g, b))

mask = Image.new("L", (W, W), 0)
md = ImageDraw.Draw(mask)
md.rounded_rectangle([32 * SS, 32 * SS, W - 32 * SS, W - 32 * SS], radius=radius, fill=255)
img.paste(grad, (0, 0), mask)

WHITE = (255, 255, 255, 255)

# Microphone capsule.
cap_x0, cap_x1 = 200 * SS, 280 * SS
cap_y0, cap_y1 = 128 * SS, 272 * SS
d.rounded_rectangle([cap_x0, cap_y0, cap_x1, cap_y1], radius=(cap_x1 - cap_x0) // 2, fill=WHITE)

# Mic arc: an open ring under the capsule.
arc_w = 12 * SS
d.arc([152 * SS, 168 * SS, 328 * SS, 344 * SS], start=0, end=180, fill=WHITE, width=arc_w)

# Stand: a vertical stem and a base bar.
stem_w = 12 * SS
d.rectangle([(256 - stem_w // 2) * SS // SS * SS, 344 * SS, (256 + stem_w // 2) * SS, 400 * SS], fill=WHITE)
d.rounded_rectangle([196 * SS, 392 * SS, 316 * SS, 416 * SS], radius=12 * SS, fill=WHITE)

# Sparkle, upper-right: a four-point star built from two tapered diamonds.
def sparkle(cx, cy, long, short):
    pts = [
        (cx, cy - long), (cx + short, cy - short), (cx + long, cy),
        (cx + short, cy + short), (cx, cy + long), (cx - short, cy + short),
        (cx - long, cy), (cx - short, cy - short),
    ]
    d.polygon(pts, fill=WHITE)

sparkle(372 * SS, 156 * SS, 64 * SS, 20 * SS)
sparkle(428 * SS, 224 * SS, 32 * SS, 10 * SS)

img = img.resize((SIZE, SIZE), Image.LANCZOS)
img.save("icon.png")
print("wrote icon.png", img.size, img.mode)
