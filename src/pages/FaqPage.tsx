import React, { useState } from 'react';

const faqData = [
  {
    category: 'Ordering & Payment',
    questions: [
      { q: 'How can I place an order?', a: 'Just browse our store, add items to your cart, and head to the checkout page. Enter your details and submit!' },
      { q: 'What payment methods do you accept?', a: 'Currently we offer Cash on Delivery (COD) for your convenience and security.' },
      { q: 'Can I change my order after submitting?', a: 'Once an order is placed, it enters processing. Contact our support via WhatsApp immediately for any changes.' }
    ]
  },
  {
    category: 'Shipping & Delivery',
    questions: [
      { q: 'How long does delivery take?', a: 'Most orders are delivered within 2-4 business days depending on your location.' },
      { q: 'Do you offer free shipping?', a: 'Yes! We offer free delivery on all orders over PKR 5000 across the country.' },
      { q: 'Can I track my order?', a: 'Once shipped, we’ll send you a tracking ID via SMS to monitor your package.' }
    ]
  },
  {
    category: 'Warranty & Returns',
    questions: [
      { q: 'What is the warranty policy?', a: 'All our electronics come with a standard 1-year official brand warranty.' },
      { q: 'How do I return a product?', a: 'If you receive a faulty item, you can return it within 7 days. Contact our team to initiate the process.' }
    ]
  }
];

const FaqPage: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<string | null>(null);

  const toggle = (idx: string) => {
    setActiveIdx(activeIdx === idx ? null : idx);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="bg-blue-50/50 py-24 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-6 inline-block">Help Center</span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">Got Questions? <br/> <span className="text-blue-600">We’ve Got Answers.</span></h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">Explore our most frequently asked questions to find the information you need quickly.</p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-24 max-w-4xl mx-auto px-4">
        {faqData.map((cat, catIdx) => (
          <div key={catIdx} className="mb-16 last:mb-0">
            <h2 className="text-2xl font-black text-gray-900 mb-8 border-l-4 border-blue-600 pl-4">{cat.category}</h2>
            <div className="space-y-4">
              {cat.questions.map((item, qIdx) => {
                const uniqueId = `${catIdx}-${qIdx}`;
                const isOpen = activeIdx === uniqueId;
                return (
                  <div 
                    key={qIdx} 
                    className={`group rounded-3xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-blue-600 bg-blue-50/20 shadow-lg shadow-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'}`}
                  >
                    <button
                      onClick={() => toggle(uniqueId)}
                      className="w-full text-left p-8 flex justify-between items-center outline-none"
                    >
                      <span className={`text-lg font-bold leading-tight ${isOpen ? 'text-blue-600' : 'text-gray-800'}`}>
                        {item.q}
                      </span>
                      <span className={`text-2xl transition-transform duration-300 ${isOpen ? 'rotate-45 text-blue-600' : 'text-gray-300'}`}>
                        +
                      </span>
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 px-8 ${isOpen ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <p className="text-gray-500 font-medium leading-relaxed bg-white/40 p-6 rounded-2xl border border-blue-100/30">
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="mt-24 p-12 bg-gray-900 rounded-[3rem] text-center text-white relative flex flex-col items-center">
            <div className="text-5xl mb-6">💬</div>
            <h3 className="text-3xl font-black mb-4">Still have questions?</h3>
            <p className="text-gray-400 mb-10 max-w-md font-medium">Our friendly customer support team is always here to help you beat the heat.</p>
            <a 
              href="https://wa.me/03065758181" 
              target="_blank" 
              rel="noreferrer"
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200/20"
            >
              Contact Support
            </a>
        </div>
      </section>
    </div>
  );
};

export default FaqPage;
