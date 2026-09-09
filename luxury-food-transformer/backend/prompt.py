"""The Michelin transformation brief sent to the image model.

Every rule in this module comes straight from the product spec. The prompt is
assembled from named sections so a single rule can be tuned without rewriting
the whole brief, and so the tests can assert that the hard rules survive.
"""

ROLE = (
    "You are an award-winning luxury food photographer and Michelin-star plating chef. "
    "Transform the supplied photograph into an ultra high-end, 5-star Michelin "
    "restaurant-quality food photograph."
)

PRESERVE = """PRESERVE (non-negotiable):
Use the uploaded image as the reference. Keep the original dish, the original
ingredients, the original portion size, the original food composition and the
original food identity. Do not replace the meal with a different dish. Do not
invent ingredients that do not logically belong."""

PLATING = """PLATING:
Transform the presentation into Michelin-star quality: elegant chef-style
plating, clean plate edges, intentional spacing, beautiful balance, modern
luxury presentation and a natural artistic arrangement. Only add subtle
garnishes that naturally fit the cuisine - microgreens, fresh herbs, edible
flowers, delicate sauce accents. Do not add garnishes that conflict with the
original dish."""

FOOD_QUALITY = """FOOD QUALITY:
Improve realism while keeping the food recognizable. Enhance juiciness,
freshness, crisp textures, creamy textures, sauce gloss, grill marks, sear
lines, steam where appropriate, natural moisture and fine texture detail. The
food must look freshly prepared by a Michelin-star chef."""

TABLE_SETTING = """TABLE SETTING:
Upgrade the environment into luxury fine dining: elegant modern plates or bowls,
premium restaurant presentation, luxury table surfaces (stone, marble, wood,
linen). Do NOT add silverware if none exists in the original image; if
silverware already exists, refine it into premium fine-dining utensils. Keep the
background minimal, elegant, softly blurred and distraction-free. The food
remains the hero."""

LIGHTING = """LIGHTING:
Professional editorial food photography lighting - cinematic side lighting, soft
shadows, natural highlights, shallow depth of field, realistic bokeh, perfect
white balance, rich but realistic colors, premium contrast."""

CLEANUP = """CLEANUP:
Remove messy plating, stains, distracting objects, poor lighting, image noise,
blur, unwanted reflections and visual clutter, while preserving the authenticity
of the dish."""

STYLE = """STYLE:
Hyper-realistic, editorial-quality, award-winning food photography with a
Michelin-star restaurant aesthetic, ultra-high resolution, luxury commercial
food photography."""

OUTPUT_FORMAT = """OUTPUT FORMAT (required):
Render in 9:16 vertical portrait orientation. The composition must fully fill
the frame and keep the entire plated dish inside it, suitable for TikTok,
Instagram Reels, YouTube Shorts, Facebook Reels and Pinterest. Return an image,
never text."""

SECTIONS = (PRESERVE, PLATING, FOOD_QUALITY, TABLE_SETTING, LIGHTING, CLEANUP, STYLE, OUTPUT_FORMAT)

# Shown to the user after every successful generation, verbatim.
ENGAGEMENT_TIP = (
    "\U0001f4a1 Want even more engagement? Turn this food photo into a cinematic AI "
    "video with realistic steam, camera movement, lighting effects, and professional "
    "restaurant-style motion for TikTok, Reels, Shorts, and ads."
)


def build_prompt():
    """Return the full transformation brief for one image."""
    return "\n\n".join((ROLE,) + SECTIONS)
