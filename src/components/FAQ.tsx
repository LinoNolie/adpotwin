import React, { useState } from 'react';
import './FAQ.css';

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqItems = [
    {
      question: "How does AdPot work?",
      answer: "..."
    },
    // ...existing FAQ items...
  ];

  return (
    <div className="faq-container">
      {faqItems.map((item, index) => (
        <div key={index} className="faq-item">
          <button 
            className="faq-question" 
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
          >
            {item.question}
          </button>
          <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
            {item.answer}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;
