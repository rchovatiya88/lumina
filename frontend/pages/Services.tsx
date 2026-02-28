import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { SERVICE_TIERS } from '../constants';
import { submitConsultationLead } from '../services/monetizationService';

const Services: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    project_type: 'Living Room',
    budget: 'Under $1,000',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    try {
      await submitConsultationLead(form);
      setStatus('success');
      setForm({
        name: '',
        email: '',
        project_type: 'Living Room',
        budget: 'Under $1,000',
        message: '',
      });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="bg-white min-h-screen py-16" data-testid="services-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-6" data-testid="services-page-title">Transparent Pricing</h1>
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

              <button className={`w-full py-3 rounded-lg font-medium transition mb-8 ${index === 1 ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-white border border-stone-300 text-stone-900 hover:bg-stone-100'}`} data-testid={`services-tier-cta-${tier.id}`}>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <div className="rounded-2xl border border-stone-200 p-8 bg-stone-50" data-testid="services-monetization-block">
            <h2 className="font-serif text-3xl text-stone-900 mb-4">Revenue model in action</h2>
            <ul className="space-y-3 text-stone-600">
              <li>• Affiliate links from Studio product selections</li>
              <li>• Paid room packages and consultation bookings</li>
              <li>• Optional coordination add-on: install + vendor scheduling</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 p-8 bg-white shadow-sm space-y-4" data-testid="services-consultation-form">
            <h2 className="font-serif text-3xl text-stone-900">Book consultation</h2>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Full Name"
              required
              className="w-full border border-stone-300 rounded-xl px-4 py-3"
              data-testid="services-form-name-input"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
              required
              className="w-full border border-stone-300 rounded-xl px-4 py-3"
              data-testid="services-form-email-input"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={form.project_type}
                onChange={(e) => setForm((prev) => ({ ...prev, project_type: e.target.value }))}
                className="w-full border border-stone-300 rounded-xl px-4 py-3"
                data-testid="services-form-project-type-select"
              >
                <option>Living Room</option>
                <option>Bedroom</option>
                <option>Apartment Setup</option>
                <option>New Home Setup</option>
              </select>
              <select
                value={form.budget}
                onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
                className="w-full border border-stone-300 rounded-xl px-4 py-3"
                data-testid="services-form-budget-select"
              >
                <option>Under $1,000</option>
                <option>$1,000 - $3,000</option>
                <option>$3,000 - $10,000</option>
                <option>$10,000+</option>
              </select>
            </div>
            <textarea
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Tell us your style goals and timeline"
              rows={4}
              required
              className="w-full border border-stone-300 rounded-xl px-4 py-3"
              data-testid="services-form-message-input"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-stone-800 transition disabled:opacity-60"
              data-testid="services-form-submit-button"
            >
              {status === 'loading' ? 'Submitting...' : 'Request Consultation'}
            </button>
            {status === 'success' && <p className="text-green-700 text-sm" data-testid="services-form-success-message">Thanks! Your request has been submitted.</p>}
            {status === 'error' && <p className="text-red-700 text-sm" data-testid="services-form-error-message">Could not submit request. Please try again.</p>}
          </form>
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