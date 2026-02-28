import React, { useState } from 'react';
import { submitContactLead } from '../services/monetizationService';

const defaultForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const Contact: React.FC = () => {
  const [form, setForm] = useState(defaultForm);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const updateField = (key: keyof typeof defaultForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');

    try {
      await submitContactLead(form);
      setStatus('success');
      setForm(defaultForm);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-16 px-4" data-testid="contact-page">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10" data-testid="contact-header">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3">Contact Us</p>
          <h1 className="text-4xl sm:text-5xl font-serif text-stone-900 mb-4">Let’s plan your space</h1>
          <p className="text-base md:text-lg text-stone-600 max-w-2xl mx-auto">
            Tell us your goal, budget, and timeline. We’ll reply with the best starting package.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-stone-200 p-8 md:p-10 shadow-sm space-y-6" data-testid="contact-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-stone-700 mb-2" htmlFor="contact-name">Full Name</label>
              <input
                id="contact-name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-500"
                data-testid="contact-name-input"
              />
            </div>
            <div>
              <label className="block text-sm text-stone-700 mb-2" htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
                className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-500"
                data-testid="contact-email-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-stone-700 mb-2" htmlFor="contact-subject">Subject</label>
            <input
              id="contact-subject"
              value={form.subject}
              onChange={(e) => updateField('subject', e.target.value)}
              required
              className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-500"
              data-testid="contact-subject-input"
            />
          </div>

          <div>
            <label className="block text-sm text-stone-700 mb-2" htmlFor="contact-message">Message</label>
            <textarea
              id="contact-message"
              value={form.message}
              onChange={(e) => updateField('message', e.target.value)}
              required
              rows={6}
              className="w-full border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-500"
              data-testid="contact-message-input"
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-stone-900 text-white px-8 py-3 rounded-full hover:bg-stone-800 transition disabled:opacity-60"
            disabled={status === 'loading'}
            data-testid="contact-submit-button"
          >
            {status === 'loading' ? 'Sending...' : 'Send Message'}
          </button>

          {status === 'success' && (
            <p className="text-green-700 text-sm" data-testid="contact-success-message">Thanks! We received your message and will reply soon.</p>
          )}
          {status === 'error' && (
            <p className="text-red-700 text-sm" data-testid="contact-error-message">Something went wrong. Please try again.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Contact;