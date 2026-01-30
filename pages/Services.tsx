import React from 'react';
import { Check } from 'lucide-react';
import { SERVICE_TIERS } from '../constants';

const Services: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6">Transparent Pricing</h1>
          <p className="text-xl text-stone-500 font-light">
            Choose the level of support you need. From quick refreshes to full-scale renovations, we have a package for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {SERVICE_TIERS.map((tier, index) => (
            <div 
              key={tier.id} 
              className={`relative rounded-2xl p-8 border ${index === 1 ? 'border-stone-900 shadow-2xl scale-105 z-10 bg-white' : 'border-stone-200 bg-stone-50'}`}
            >
              {index === 1 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-stone-900 text-white px-4 py-1 rounded-full text-xs uppercase tracking-widest font-medium">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-serif text-stone-900 mb-2">{tier.name}</h3>
              <p className="text-stone-500 text-sm mb-6">{tier.recommendedFor}</p>
              
              <div className="mb-8">
                <span className="text-4xl font-semibold text-stone-900">{tier.priceRange}</span>
                <span className="text-stone-500"> / room</span>
              </div>

              <button className={`w-full py-3 rounded-lg font-medium transition mb-8 ${index === 1 ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-white border border-stone-300 text-stone-900 hover:bg-stone-100'}`}>
                Get Started
              </button>

              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">What's included</p>
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={18} className="text-green-600 mt-0.5 shrink-0" />
                    <span className="text-stone-600 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif text-stone-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-b border-stone-200 pb-6">
              <h3 className="font-medium text-lg mb-2">How does the shopping list work?</h3>
              <p className="text-stone-500">We provide a digital list with direct links to purchase items. We use major retailers like Wayfair, Amazon, and West Elm to ensure easy shipping and returns.</p>
            </div>
            <div className="border-b border-stone-200 pb-6">
              <h3 className="font-medium text-lg mb-2">Can I keep my existing furniture?</h3>
              <p className="text-stone-500">Absolutely. During the onboarding process, you can upload photos and dimensions of pieces you want to keep, and we'll design around them.</p>
            </div>
            <div className="border-b border-stone-200 pb-6">
              <h3 className="font-medium text-lg mb-2">What happens if items go out of stock?</h3>
              <p className="text-stone-500">We check stock before sending the final design. If something sells out quickly, we provide 2-3 alternatives for every major piece in your design.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;