import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-blue-50/50 -z-10" />
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-blue-600 font-black text-xs uppercase tracking-[0.3em] mb-6 inline-block">Our Journey</span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-8">
            Engineering <br/> 
            <span className="text-blue-600">Pure Comfort.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-medium">
            Since our inception, we've been on a mission to redefine how the world stays cool. We combine advanced electronics with sustainable design to bring you the finest cooling solutions.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative group rounded-[3rem] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop" 
              alt="Engineering Team" 
              className="w-full h-[600px] object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply" />
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-8 leading-tight">
              A Legacy of <br/>Innovation & Quality.
            </h2>
            <div className="space-y-6 text-lg text-gray-500 font-medium leading-relaxed">
              <p>
                Founded in 2020, National Industries began with a simple idea: why should premium cooling technology be a luxury? We sets out to create products that are powerful, efficient, and accessible.
              </p>
              <p>
                Today, we serve thousands of customers across the nation, providing everything from heavy-duty industrial air coolers to sleek, modern refrigerators for the contemporary home.
              </p>
              <div className="pt-8 grid grid-cols-2 gap-8">
                 <div>
                    <h4 className="text-4xl font-black text-blue-600 mb-2">15k+</h4>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Happy Customers</p>
                 </div>
                 <div>
                    <h4 className="text-4xl font-black text-blue-600 mb-2">4.9/5</h4>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Global Ratings</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-900 rounded-[4rem] mx-4 mb-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Built on Foundation</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Our core values drive every decision we make, from research to delivery.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Consumer First', 
                desc: 'Every feature is designed with your daily comfort and utility in mind.',
                icon: '👤'
              },
              { 
                title: 'Eco-Commitment', 
                desc: 'We prioritize energy efficiency to protect your wallet and the planet.',
                icon: '🌍'
              },
              { 
                title: 'Pure Integrity', 
                desc: 'What you see is what you get—no hidden costs, just honest tech.',
                icon: '💎'
              }
            ].map((value, i) => (
              <div key={i} className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-sm group hover:bg-white/10 transition-all">
                <span className="text-5xl mb-8 block">{value.icon}</span>
                <h3 className="text-2xl font-black text-white mb-4">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed font-medium">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-0" />
      </section>
    </div>
  );
};

export default AboutPage;
