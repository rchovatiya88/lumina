import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Layout, ShoppingBag, CheckCircle, Search, Sparkles } from 'lucide-react';
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
            Search furniture across Amazon, Wayfair, IKEA and more. 
            Get a custom shoppable room design in days, not months.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search" className="inline-flex items-center gap-2 bg-white text-stone-900 px-8 py-4 rounded-full font-medium hover:bg-stone-100 transition shadow-xl" data-testid="home-search-furniture-link">
              <Search size={20} /> Search Furniture
            </Link>
            <Link to="/services" className="inline-flex bg-stone-900/80 backdrop-blur text-white px-8 py-4 rounded-full font-medium hover:bg-stone-900 transition shadow-xl border border-white/10" data-testid="home-view-design-packages-link">
              View Design Packages
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlight */}
      <section className="py-10 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Sparkles className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="font-serif text-xl text-stone-900">Curated + Live Search</h3>
                <p className="text-stone-600">120+ curated picks + search across Amazon, Wayfair, IKEA & more.</p>
              </div>
            </div>
            <Link to="/search" className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full font-medium hover:bg-stone-800 transition" data-testid="home-try-search-link">
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/search" className="bg-gradient-to-br from-amber-500 to-orange-500 p-8 rounded-2xl text-white hover:shadow-lg transition" data-testid="home-platform-shop-link">
              <p className="text-xs uppercase tracking-wide text-amber-100 mb-2">Shop</p>
              <h3 className="font-serif text-2xl mb-2">Product Discovery</h3>
              <p className="text-amber-50 text-sm">Browse curated products or search the entire web for furniture.</p>
            </Link>
            <Link to="/journal" className="bg-white p-8 rounded-2xl border border-stone-200 hover:shadow-md transition" data-testid="home-platform-journal-link">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-2">Content</p>
              <h3 className="font-serif text-2xl text-stone-900 mb-2">Journal • Trends</h3>
              <p className="text-stone-600 text-sm">Get trends, practical guides, and weekly shopping inspiration.</p>
            </Link>
            <Link to="/services" className="bg-white p-8 rounded-2xl border border-stone-200 hover:shadow-md transition" data-testid="home-platform-services-link">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-2">Services</p>
              <h3 className="font-serif text-2xl text-stone-900 mb-2">Design Packages</h3>
              <p className="text-stone-600 text-sm">Book paid design support and coordination for installation.</p>
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

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-stone-200 p-8 md:p-12 bg-gradient-to-br from-stone-900 to-stone-700 text-white" data-testid="home-monetization-plan-card">
            <h2 className="text-3xl font-serif mb-6">How Lumina grows revenue</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm md:text-base">
              <div data-testid="home-revenue-stream-affiliate">
                <p className="font-semibold mb-2">1) Affiliate Shopping</p>
                <p className="text-stone-200">Users discover products in Studio and buy through partner links.</p>
              </div>
              <div data-testid="home-revenue-stream-consulting">
                <p className="font-semibold mb-2">2) Paid Design Packages</p>
                <p className="text-stone-200">Convert journal and studio visitors into consultation bookings.</p>
              </div>
              <div data-testid="home-revenue-stream-coordination">
                <p className="font-semibold mb-2">3) Coordination Add-On</p>
                <p className="text-stone-200">Offer vendor scheduling and installation coordination for a service fee.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-stone-900 text-white text-center px-4">
        <h2 className="text-3xl md:text-5xl font-serif mb-6">Ready to design your space?</h2>
        <p className="text-stone-300 max-w-2xl mx-auto mb-10 text-lg">
          Explore curated products in Studio, then book paid support when you want a complete room plan.
        </p>
        <Link to="/studio" className="inline-block bg-white text-stone-900 px-10 py-4 rounded-full font-medium hover:bg-stone-100 transition shadow-lg text-lg" data-testid="home-explore-studio-link">
          Explore Studio
        </Link>
      </section>
    </div>
  );
};

export default Home;