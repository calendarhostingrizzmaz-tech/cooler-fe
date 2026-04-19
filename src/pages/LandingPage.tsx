import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const LandingPage: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) {
      setNewsletterMessage('Please enter your email.');
      setNewsletterStatus('error');
      return;
    }
    setNewsletterStatus('loading');
    setNewsletterMessage('');
    try {
      const res = await axios.post(`${API}/newsletter/subscribe`, { email });
      const payload = res.data?.data;
      const already = payload?.alreadySubscribed === true;
      setNewsletterStatus('success');
      setNewsletterMessage(
        already
          ? "You're already on our list — we'll keep you posted."
          : "Thanks for subscribing. Check your inbox for a confirmation.",
      );
      if (!already) setNewsletterEmail('');
    } catch {
      setNewsletterStatus('error');
      setNewsletterMessage('Something went wrong. Please try again shortly.');
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section — natural height on mobile; tall centered layout from md */}
      <section className="relative overflow-hidden md:min-h-[85vh] md:flex md:items-center">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10" />
        <div className="absolute top-[-20%] right-[-10%] w-[min(100vw,500px)] h-[min(100vw,500px)] bg-blue-100/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[min(100vw,400px)] h-[min(100vw,400px)] bg-sky-100/30 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-6 sm:py-10 md:py-14 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-16 md:items-center">
          <div className="relative z-20 animate-in slide-in-from-left duration-700 order-2 md:order-1 text-center md:text-left">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-blue-600 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-full mb-4 md:mb-6">
              Official Store
            </span>
            <h1 className="text-[1.85rem] leading-[1.12] min-[400px]:text-[2.1rem] sm:text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-4 sm:mb-5 md:mb-6">
              Beat The Heat <br />
              <span className="text-blue-600">With Precision.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-6 sm:mb-8 md:mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed px-1 sm:px-0">
              Experience next-generation cooling technology with our premium range of air coolers, refrigerators, and climate solutions.
            </p>
            <div className="relative z-30 flex flex-col min-[400px]:flex-row flex-wrap gap-3 sm:gap-4 justify-center md:justify-start">
              <Link
                to="/store"
                className="relative z-30 inline-flex items-center justify-center w-full min-[400px]:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-blue-600 text-white rounded-2xl text-base sm:text-lg font-black hover:bg-blue-700 hover:-translate-y-0.5 sm:hover:-translate-y-1 active:scale-95 transition-all shadow-xl shadow-blue-200 cursor-pointer"
              >
                Shop Collection
              </Link>
              <Link
                to="/about"
                className="relative z-30 inline-flex items-center justify-center w-full min-[400px]:w-auto px-8 py-4 sm:px-10 sm:py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl text-base sm:text-lg font-bold hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              >
                Our Story
              </Link>
            </div>
          </div>

          <div className="relative z-0 order-1 md:order-2 flex justify-center md:justify-end pointer-events-none pt-2 md:pt-0">
            <div
              className="absolute inset-0 m-auto w-[min(100%,320px)] sm:w-[min(100%,420px)] aspect-square rounded-[40%] bg-gradient-to-br from-blue-200/60 via-sky-100/40 to-transparent blur-2xl scale-110 pointer-events-none"
              aria-hidden
            />
            <div className="relative w-full max-w-[280px] sm:max-w-[360px] md:max-w-[min(100%,520px)] h-[220px] sm:h-[280px] md:h-auto md:aspect-square flex items-center justify-center">
              <img
                src="/hop.png"
                alt="Premium stainless steel water dispenser with multiple taps"
                className="relative z-10 w-full h-full max-h-[220px] sm:max-h-[280px] md:max-h-[min(72vh,560px)] object-contain object-center drop-shadow-[0_25px_50px_rgba(37,99,235,0.22)] animate-hero-bounce-soft select-none pointer-events-none"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals Section */}
     

      {/* Featured Collections Section */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-8 sm:mb-12 md:mb-16">
          <span className="text-blue-600 font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] mb-3 sm:mb-4 inline-block">
            Curated Just For You
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 px-2">
            Our Top Collections
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base md:text-lg font-medium px-2">
            Explore our meticulously crafted electronics designed for the modern lifestyle.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          {[
            { title: 'Air Coolers', img: '/banner1.png', items: '40+ Items', color: 'bg-blue-600' },
            { title: 'Electric Water Cooler', img: '/electric-water-cooler.jpeg', items: '70+ Items', color: 'bg-indigo-600' },
            // { title: 'Water Dispenser', img: '/water-dispenser.jpeg', items: '20+ Items', color: 'bg-sky-600' },
            { title: 'Geaser', img: '/geaser.jpg', items: '20+ Items', color: 'bg-sky-600' }

          ].map((cat, i) => (
            <div key={i} className="group relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden aspect-[3/4] sm:aspect-[4/5] cursor-pointer shadow-xl max-w-md mx-auto md:max-w-none w-full">
               <img src={cat.img} alt={cat.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
               <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 md:bottom-10 md:left-10 text-white pr-4">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/60 mb-1 sm:mb-2 inline-block">{cat.items}</span>
                  <h3 className="text-2xl sm:text-3xl font-black mb-3 sm:mb-6 leading-tight">{cat.title}</h3>
                  <Link 
                    to="/store" 
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold bg-white text-gray-900 px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    View Store <span className="text-base sm:text-lg">→</span>
                  </Link>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-10 sm:py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 mb-12 sm:mb-20">
        <div className="bg-blue-600 rounded-3xl sm:rounded-[2.5rem] md:rounded-[3.5rem] p-6 sm:p-10 md:p-16 lg:p-20 relative overflow-hidden text-center items-center shadow-2xl shadow-blue-200">
           <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 leading-tight px-1">
                Stay Updated On New Tech
              </h2>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg font-medium mb-6 sm:mb-10 leading-relaxed px-1">
                Join our inner circle and receive exclusive updates on newly launched cooling innovations and special offers.
              </p>
              
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto bg-white/10 p-2 rounded-3xl border border-white/20 backdrop-blur-sm"
              >
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={newsletterStatus === 'loading'}
                  className="flex-1 bg-transparent px-6 py-4 text-white placeholder:text-blue-200 focus:outline-none font-medium disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="px-10 py-4 bg-white text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {newsletterStatus === 'loading' ? 'Submitting…' : 'Subscribe'}
                </button>
              </form>
              {newsletterMessage ? (
                <p
                  className={`mt-4 text-sm font-medium ${
                    newsletterStatus === 'error' ? 'text-amber-200' : 'text-white/95'
                  }`}
                  role="status"
                >
                  {newsletterMessage}
                </p>
              ) : null}
           </div>
           
           {/* Abstract Shapes */}
           <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-blue-500 rounded-full blur-3xl opacity-50" />
           <div className="absolute bottom-[-50%] left-[-10%] w-[400px] h-[400px] bg-indigo-500 rounded-full blur-3xl opacity-50" />
        </div>
      </section>
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {[
            { icon: '🚚', title: 'Fast Delivery', desc: 'Secure delivery in 2-3 days' },
            { icon: '⚡', title: 'Power Save', desc: 'Up to 30% energy efficiency' },
            { icon: '🛡️', title: '1-Year Warranty', desc: 'Official brand protection' },
            { icon: '💎', title: 'Premium Build', desc: 'Crafted with top-tier materials' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 sm:gap-5 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-gray-100/50 shadow-sm hover:shadow-md transition-all">
              <span className="text-3xl sm:text-4xl shrink-0">{item.icon}</span>
              <div className="min-w-0">
                <h4 className="font-black text-gray-900 text-base sm:text-lg leading-tight">{item.title}</h4>
                <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
