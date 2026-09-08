import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Hero.css";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
    heading: "Discover Your Next Favorite",
    text: "Premium products designed for modern living, curated just for you.",
    cta: "Shop Now",
    to: "/shop",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
    heading: "Elevate Your Everyday Style",
    text: "Fresh arrivals across fashion, accessories and more — up to 30% off.",
    cta: "Explore New Arrivals",
    to: "/shop?filter=new",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80",
    heading: "Tech That Keeps Up With You",
    text: "The latest electronics and gadgets, backed by fast, free shipping.",
    cta: "Shop Electronics",
    to: "/shop?category=electronics",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&q=80",
    heading: "Up To 40% Off Sitewide",
    text: "Our biggest seasonal sale is here. Limited time only.",
    cta: "Shop the Sale",
    to: "/shop?filter=sale",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="hero">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`hero-slide ${i === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero-overlay" />
          <div className="container hero-content">
            <h1>{slide.heading}</h1>
            <p>{slide.text}</p>
            <div className="hero-actions">
              <Link to={slide.to} className="btn btn-accent btn-lg">
                {slide.cta}
              </Link>
              <Link to="/shop" className="btn btn-outline btn-lg hero-btn-outline">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      ))}

      <button className="hero-arrow hero-arrow-left" onClick={prev} aria-label="Previous slide">
        <ChevronLeft size={22} />
      </button>
      <button className="hero-arrow hero-arrow-right" onClick={next} aria-label="Next slide">
        <ChevronRight size={22} />
      </button>

      <div className="hero-dots">
        {slides.map((s, i) => (
          <button
            key={s.id}
            className={`hero-dot ${i === current ? "active" : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
