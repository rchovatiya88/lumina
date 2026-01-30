import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Layout, ShoppingBag, CheckCircle } from 'lucide-react';
import { SERVICE_TIERS } from '../constants';
import NewsletterModal from '../components/NewsletterModal';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col">
      <NewsletterModal />
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-stone-900/30"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-white text-xs tracking-widest uppercase mb-6 border border-white/30">
            Interior Design Reimagined
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-6 leading-tight">
            Designed by Us.<br/> Styled by You.
          </h1>
          <p className="text-lg md:text-xl text-stone-100 mb-10 max-w-2xl mx-auto font-light">
            Professional interior design services meets modern technology. 
            Get a custom shoppable room design in days, not months.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/room-builder" className="bg-white text-stone-900 px-8 py-4 rounded-full font-medium hover:bg-stone-100 transition shadow-xl flex items-center justify-center gap-2">
              Start Room Builder <Layout size={18} />
            </Link>
            <Link to="/services" className="bg-stone-900/80 backdrop-blur text-white px-8 py-4 rounded-full font-medium hover:bg-stone-900 transition shadow-xl border border-white/10">
              View Design Packages
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-stone-900 mb-4">Why Lumina?</h2>
            <div className="w-24 h-1 bg-stone-200 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-900">
                <Star size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif mb-3">Curated Expertise</h3>
              <p className="text-stone-500 leading-relaxed">
                Access to designer-only selections and retail favorites, vetted for quality and style by our expert team.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-900">
                <Layout size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif mb-3">Visual Planning</h3>
              <p className="text-stone-500 leading-relaxed">
                See your room before you buy. Our interactive mood boards and floor plans ensure everything fits perfectly.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-900">
                <ShoppingBag size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-serif mb-3">One-Click Shopping</h3>
              <p className="text-stone-500 leading-relaxed">
                We consolidate products from Amazon, Wayfair, and more into a single, easy-to-manage shopping list.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Mini */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif text-stone-900 mb-2">Design Packages</h2>
              <p className="text-stone-500">Tailored solutions for every budget.</p>
            </div>
            <Link to="/services" className="hidden md:flex items-center gap-2 text-stone-900 font-medium hover:text-stone-600">
              See all pricing <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICE_TIERS.map((tier) => (
              <div key={tier.id} className="bg-white p-8 rounded-xl shadow-sm border border-stone-100 hover:shadow-lg transition-shadow duration-300">
                <h3 className="font-serif text-2xl mb-2">{tier.name}</h3>
                <p className="text-3xl font-light text-stone-900 mb-6">{tier.priceRange}</p>
                <p className="text-stone-500 mb-8 text-sm h-10">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-stone-600">
                      <CheckCircle size={16} className="text-stone-300" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/services" className="block w-full text-center border border-stone-900 text-stone-900 py-3 rounded-lg hover:bg-stone-900 hover:text-white transition">
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-stone-900 text-white text-center px-4">
        <h2 className="text-3xl md:text-5xl font-serif mb-6">Not sure where to start?</h2>
        <p className="text-stone-300 max-w-2xl mx-auto mb-10 text-lg">
          Take our 2-minute AI-powered style quiz. We'll analyze your preferences and generate a free custom mood board just for you.
        </p>
        <Link to="/style-quiz" className="inline-block bg-white text-stone-900 px-10 py-4 rounded-full font-medium hover:bg-stone-100 transition shadow-lg text-lg">
          Take the Style Quiz
        </Link>
      </section>
    </div>
  );
};

export default Home;