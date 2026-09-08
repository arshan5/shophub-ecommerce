import Breadcrumb from "../components/Breadcrumb";
import { Target, Users, Award, Leaf } from "lucide-react";
import "./StaticPages.css";

const values = [
  { icon: Target, title: "Our Mission", text: "To make quality, thoughtfully designed products accessible to everyone." },
  { icon: Users, title: "Customer First", text: "Every decision we make starts with what's best for our customers." },
  { icon: Award, title: "Quality Assured", text: "We partner with trusted suppliers and test every product line." },
  { icon: Leaf, title: "Sustainability", text: "Committed to responsible sourcing and reducing packaging waste." },
];

export default function About() {
  return (
    <div>
      <div className="page-header">
        <div className="container">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "About" }]} />
          <h1>About ShopHub</h1>
        </div>
      </div>

      <div className="container section static-page">
        <div className="about-hero">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&q=80"
            alt="Our team at work"
          />
          <div>
            <h2>Building a Better Way to Shop Online</h2>
            <p>
              ShopHub started with a simple idea: online shopping should feel as trustworthy and
              enjoyable as buying from a store you know and love. Since then, we've grown into a
              destination for electronics, fashion, home goods and more — all curated with the
              same attention to quality and detail.
            </p>
            <p>
              Every product on our shelves is chosen by a small team that genuinely tests and
              believes in what we sell. No filler, no guesswork — just things worth owning.
            </p>
          </div>
        </div>

        <div className="grid grid-4 mt-24">
          {values.map((v) => (
            <div key={v.title} className="feature-item">
              <div className="feature-icon">
                <v.icon size={22} />
              </div>
              <h4>{v.title}</h4>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
