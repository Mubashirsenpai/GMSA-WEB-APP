"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, BookMarked, Network } from "lucide-react";

/**
 * Slideshow images: place your pictures in client/public/slideshow/
 * Use .jpeg or .jpg — update the image path below to match your filename.
 */
/** Images in client/public/slideshow/ — update paths here when you change pictures. */
const SLIDES = [
  { image: "/slideshow/IMG_0094.jpeg", title: "GMSA UDS NYC", subtitle: "Ghana Muslim Students' Association", line2: "University for Development Studies, Nyankpala Campus", cta: "Become a Member", ctaHref: "/register", cta2: "View Events", cta2Href: "/events" },
  { image: "/slideshow/IMG_0099.jpeg", title: "Faith, Knowledge & Jihad", subtitle: "Building a stronger community", line2: "Through learning, brotherhood, and service", cta: "Join Us", ctaHref: "/register", cta2: "Our Events", cta2Href: "/events" },
  { image: "/slideshow/IMG_0130.jpeg", title: "500+ Members", subtitle: "One community, one purpose", line2: "Workshops • Lectures • GMSA Week", cta: "Get Involved", ctaHref: "/events", cta2: "Donate", cta2Href: "/donate" },
  { image: "/slideshow/IMG_0131.jpeg", title: "GMSA UDS NYC", subtitle: "Ghana Muslim Students' Association", line2: "University for Development Studies, Nyankpala Campus", cta: "Become a Member", ctaHref: "/register", cta2: "View Events", cta2Href: "/events" },
  { image: "/slideshow/IMG_0136.jpeg", title: "Faith, Knowledge & Jihad", subtitle: "Building a stronger community", line2: "Through learning, brotherhood, and service", cta: "Join Us", ctaHref: "/register", cta2: "Our Events", cta2Href: "/events" },
  { image: "/slideshow/IMG_0155.jpeg", title: "500+ Members", subtitle: "One community, one purpose", line2: "Workshops • Lectures • GMSA Week", cta: "Get Involved", ctaHref: "/events", cta2: "Donate", cta2Href: "/donate" },
  { image: "/slideshow/IMG_0156.jpeg", title: "GMSA UDS NYC", subtitle: "Ghana Muslim Students' Association", line2: "University for Development Studies, Nyankpala Campus", cta: "Become a Member", ctaHref: "/register", cta2: "View Events", cta2Href: "/events" },
  { image: "/slideshow/IMG_0181.jpeg", title: "Faith, Knowledge & Jihad", subtitle: "Building a stronger community", line2: "Through learning, brotherhood, and service", cta: "Join Us", ctaHref: "/register", cta2: "Our Events", cta2Href: "/events" },
  { image: "/slideshow/IMG_0208.jpeg", title: "500+ Members", subtitle: "One community, one purpose", line2: "Workshops • Lectures • GMSA Week", cta: "Get Involved", ctaHref: "/events", cta2: "Donate", cta2Href: "/donate" },
  { image: "/slideshow/IMG_0233.jpeg", title: "GMSA UDS NYC", subtitle: "Ghana Muslim Students' Association", line2: "University for Development Studies, Nyankpala Campus", cta: "Become a Member", ctaHref: "/register", cta2: "View Events", cta2Href: "/events" },
  { image: "/slideshow/IMG_0234.jpeg", title: "Faith, Knowledge & Jihad", subtitle: "Building a stronger community", line2: "Through learning, brotherhood, and service", cta: "Join Us", ctaHref: "/register", cta2: "Our Events", cta2Href: "/events" },
  { image: "/slideshow/IMG_0272.jpeg", title: "GMSA UDS NYC", subtitle: "Ghana Muslim Students' Association", line2: "University for Development Studies, Nyankpala Campus", cta: "Become a Member", ctaHref: "/register", cta2: "View Events", cta2Href: "/events" },
];

const DURATION_MS = 5000;

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  // Preload all slide images so every slide displays when its turn comes
  useEffect(() => {
    SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, DURATION_MS);
    return () => clearInterval(t);
  }, []);

  const safeIndex = index % SLIDES.length;
  const currentSlide = SLIDES[safeIndex];
  const bgImage = currentSlide?.image;

  return (
    <section className="relative bg-black text-white pb-10 sm:pb-16 overflow-hidden min-h-[54vh] sm:min-h-[72vh] md:min-h-[620px] flex flex-col rounded-b-2xl">
      {/* Full-bleed image covers entire hero; text displays on top */}
      {bgImage && (
        <>
          <div
            className="absolute inset-0 rounded-b-2xl overflow-hidden transition-opacity duration-700"
            aria-hidden
          >
            {/* Image fills entire hero — no green; cover on all breakpoints */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-black/90"
              style={{ backgroundImage: `url(${bgImage})` }}
              aria-hidden
            />
            <div className="absolute inset-0 bg-black/35 rounded-b-2xl" aria-hidden />
          </div>
        </>
      )}

      <div className="container mx-auto px-4 pt-14 sm:pt-20 text-center max-w-3xl relative z-10 flex-1 flex flex-col justify-center">
        {/* Welcoming text and buttons overlay on the sliding images */}
        <div className="relative flex-1 min-h-[180px] sm:min-h-[240px] flex flex-col justify-center">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-x-0 top-0 flex flex-col justify-center items-center px-4 min-h-[240px] transition-all duration-700 ease-out ${
                i === safeIndex
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{slide.title}</h1>
              <p className="text-xl text-white/95">{slide.subtitle}</p>
              <p className="mt-1 text-white/80">{slide.line2}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href={slide.ctaHref}
                  className="bg-white text-gmsa-green font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {slide.cta}
                </Link>
                <Link
                  href={slide.cta2Href}
                  className="border-2 border-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition"
                >
                  {slide.cta2}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Dots indicator — all slides (e.g. 12) visible, compact so they fit */}
        <div className="flex flex-wrap justify-center gap-1.5 py-3 sm:py-4 max-w-full">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`rounded-full transition-all duration-300 shrink-0 ${
                i === safeIndex ? "bg-white w-5 h-2" : "bg-white/50 w-2 h-2 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1} of ${SLIDES.length}`}
            />
          ))}
        </div>

        {/* Icons on the image; captions in the green (mobile: split so captions sit in green band) */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-12 hero-icons pt-1 pb-2 sm:pt-0 sm:pb-0">
          <div className="text-center flex flex-col items-center">
            <Calendar className="w-9 h-9 mx-auto hero-icon-float sm:mb-1.5" style={{ color: "#93c5fd" }} />
            <p className="font-semibold text-white text-sm mt-2 sm:mt-1.5 sm:mb-0">Events</p>
            <p className="text-white/80 text-xs">GMSA week celebrations</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <BookMarked className="w-9 h-9 mx-auto hero-icon-float hero-icon-delay-1 sm:mb-1.5" style={{ color: "#c4b5fd" }} />
            <p className="font-semibold text-white text-sm mt-2 sm:mt-1.5 sm:mb-0">Workshops</p>
            <p className="text-white/80 text-xs">Islamic Lectures</p>
          </div>
          <div className="text-center flex flex-col items-center">
            <Network className="w-9 h-9 mx-auto hero-icon-float hero-icon-delay-2 sm:mb-1.5" style={{ color: "#86efac" }} />
            <p className="font-semibold text-white text-sm mt-2 sm:mt-1.5 sm:mb-0">Networks</p>
            <p className="text-white/80 text-xs">500+ members</p>
          </div>
        </div>
      </div>
    </section>
  );
}
