import React from 'react';
import { Link } from 'react-router-dom';

const deliveryRegions = [
  {
    title: 'Islamabad Capital Territory',
    places: ['Islamabad'],
  },
  {
    title: 'Punjab',
    places: [
      'Attock',
      'Bahawalpur',
      'Burewala',
      'Chakwal',
      'Chiniot',
      'Faisalabad',
      'Gujar Khan',
      'Gujranwala',
      'Gujrat',
      'Jhang',
      'Jhelum',
      'Kallar Syedan',
      'Kasur',
      'Kharian',
      'Lahore',
      'Mianwali',
      'Multan',
      'Murree',
      'Rahim Yar Khan',
      'Rawalpindi',
      'Sadiqabad',
      'Sahiwal',
      'Sargodha',
      'Sheikhupura',
      'Sialkot',
      'Taxila',
      'Toba Tek Singh',
    ],
  },
  {
    title: 'Sindh',
    places: [
      'Badin',
      'Hyderabad',
      'Jacobabad',
      'Karachi',
      'Khairpur',
      'Larkana',
      'Mirpur Khas',
      'Nawabshah',
      'Sukkur',
      'Thatta',
    ],
  },
  {
    title: 'Khyber Pakhtunkhwa',
    places: [
      'Abbottabad',
      'Bannu',
      'Battagram',
      'Chitral',
      'Charsadda',
      'D.I. Khan',
      'Haripur',
      'Kohat',
      'Mansehra',
      'Mardan',
      'Nowshera',
      'Peshawar',
      'Swat',
      'Swabi',
      'Timergara',
      'Tank',
    ],
  },
  {
    title: 'Balochistan',
    places: ['Chaman', 'Gwadar', 'Khuzdar', 'Quetta', 'Ziarat'],
  },
  {
    title: 'Azad Kashmir',
    places: ['Bagh', 'Bhimber', 'Kotli', 'Mirpur', 'Muzaffarabad', 'Rawalakot'],
  },
  {
    title: 'Gilgit-Baltistan',
    places: ['Gilgit', 'Skardu'],
  },
];

const DonationPage: React.FC = () => {
  return (
    <div className="bg-white">
      <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-blue-600 font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] mb-4 inline-block">
            Ehsaal-e-Sawab & community
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
            Donate comfort. <span className="text-blue-600">Share relief.</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Many families choose to donate water coolers, geysers, or chillers in memory of loved ones—a meaningful
            form of <strong className="text-gray-800">ehsaal-e-sawab</strong>. We handle supply, delivery, and can add
            the inscription you choose so the gift clearly reflects your intention.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-blue-600 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white text-center shadow-xl shadow-blue-200">
          <h2 className="text-xl sm:text-2xl font-black mb-3">How it works</h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Call us with your location and wording. We&apos;ll guide you on suitable models, arrange installation where
            possible, and apply your custom text on the unit so recipients know the donation is dedicated for your
            chosen purpose.
          </p>
          <Link
            to="/store"
            className="inline-flex mt-6 px-8 py-3.5 bg-white text-blue-600 rounded-xl font-black text-sm hover:bg-blue-50 transition-colors"
          >
            Browse products
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10 sm:space-y-14">
        <article className="rounded-2xl sm:rounded-3xl border border-gray-100 bg-gray-50/80 p-6 sm:p-10 shadow-sm">
          <span className="text-blue-600 font-black text-xs uppercase tracking-widest">Searing heat</span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 mb-4">
            Electric water coolers for public good
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-sm sm:text-base">
            <p>
              In punishing summer temperatures, a reliable electric water cooler at a busy mosque, madrassa, school,
              hospital, dispensary, or roadside shelter can mean safe hydration for hundreds of people every day.
            </p>
            <p>
              Donating a cooler in someone&apos;s name is a widely chosen way to seek reward for the deceased. We make
              that easier: you pick the message—we ensure it appears clearly on the equipment so the dedication is
              visible to everyone who benefits.
            </p>
          </div>
        </article>

        <article className="rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-6 sm:p-10 shadow-sm ring-1 ring-gray-100">
          <span className="text-indigo-600 font-black text-xs uppercase tracking-widest">Freezing winters</span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 mb-4">
            Electric & gas geysers when cold bites hardest
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-sm sm:text-base">
            <p>
              Bitter winters hit hardest for households that cannot afford a geyser. Gifting an electric or gas unit—
              again, often as ehsaal-e-sawab—brings dignity and safety when bathing and washing with icy water is not
              an option.
            </p>
            <p>
              Across Pakistan, gas load-shedding leaves many unable to rely on stoves alone. A dependable electric
              geyser can bridge those gaps; we can help you select what fits the recipient&apos;s setup.
            </p>
          </div>
        </article>

        <article className="rounded-2xl sm:rounded-3xl border border-gray-100 bg-gray-50/80 p-6 sm:p-10 shadow-sm">
          <span className="text-sky-600 font-black text-xs uppercase tracking-widest">Peak summer</span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2 mb-4">
            Electric water chillers for those without shade
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-sm sm:text-base">
            <p>
              For families living without proper shelter, extreme heat is not merely uncomfortable—it is dangerous. An
              electric water chiller, placed where it is needed most, offers tangible relief and can be another sincere
              avenue of ongoing charity.
            </p>
            <p>
              If you wish to support people who cannot purchase equipment themselves, we coordinate delivery and
              installation guidance so your contribution reaches the ground quickly.
            </p>
          </div>
        </article>
      </section>

      <section className="bg-gray-900 text-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black text-center mb-4">We deliver across Pakistan</h2>
          <p className="text-gray-400 text-center text-sm sm:text-base max-w-2xl mx-auto mb-10 sm:mb-12">
            Coverage includes major cities and towns in all provinces and regions below. Contact us to confirm timing
            and logistics for your chosen area.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {deliveryRegions.map((region) => (
              <details
                key={region.title}
                className="group rounded-2xl border border-white/10 bg-white/5 open:bg-white/10 transition-colors"
              >
                <summary className="cursor-pointer list-none font-black text-sm sm:text-base px-4 py-3 sm:px-5 sm:py-4 flex justify-between items-center gap-2">
                  <span>{region.title}</span>
                  <span className="text-blue-400 text-lg group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-white/10">
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mt-3">
                    {region.places.join(' · ')}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DonationPage;
