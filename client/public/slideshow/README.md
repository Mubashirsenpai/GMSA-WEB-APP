# Home page slideshow images

**Put your slideshow pictures here** so they appear on the home page hero.

## File format

Use **.jpeg** or **.jpg** (or .png, .webp). The slideshow is set up to use your JPEG images.

## Adding or changing images

1. Add your image files in this folder (`client/public/slideshow/`).
2. In `client/components/HeroSlideshow.tsx`, in the `SLIDES` array, set each slide’s `image` to the path of your file, e.g. `"/slideshow/YourFileName.jpeg"`.

Recommended: landscape images, at least 1200px wide. Text and buttons sit on top with a dark overlay so the words stay readable.
