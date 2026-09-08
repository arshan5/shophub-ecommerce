import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import "./StaticPages.css";

const faqs = [
  {
    q: "How long does shipping take?",
    a: "Standard delivery takes 5-7 business days. Express delivery is available at checkout and arrives in 2-3 business days.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 30-day return window on unused items in their original packaging. Visit My Orders to start a return.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently we ship within Pakistan and select international markets. Shipping options are shown at checkout based on your address.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order ships, you can track its status anytime from the My Orders section of your account.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept major credit/debit cards and Cash on Delivery. Card payments will be fully enabled once payment processing is connected.",
  },
  {
    q: "How do I change or cancel my order?",
    a: "Contact our support team within 2 hours of placing your order and we'll do our best to accommodate changes.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <Breadcrumb items={[{ label: "Home", to: "/" }, { label: "FAQ" }]} />
          <h1>Frequently Asked Questions</h1>
        </div>
      </div>

      <div className="container section">
        <div className="faq-list">
          {faqs.map((item, i) => (
            <div key={item.q} className={`faq-item ${openIndex === i ? "open" : ""}`}>
              <button className="faq-question" onClick={() => setOpenIndex(openIndex === i ? -1 : i)}>
                {item.q}
                <ChevronDown size={18} />
              </button>
              {openIndex === i && <p className="faq-answer">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
