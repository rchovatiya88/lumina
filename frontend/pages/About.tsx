import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lightbulb, Handshake, TrendingUp } from 'lucide-react';

const About: React.FC = () => {
  const pillars = [
    {
      icon: <Lightbulb size={20} />,
      title: 'Approachable Design',
      text: 'We keep interior design simple and practical for first apartments and new homes.',
    },
    {
      icon: <Handshake size={20} />,
      title: 'Vendor Connection',
      text: 'We connect you with trusted products and service partners, then organize the process.',
    },
    {
      icon: <TrendingUp size={20} />,
      title: 'Smarter Shopping',
      text: 'We prioritize accurate links, pricing, and high-relevance product discovery to save time and money.',
    },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="about-page">
      <section className="bg-stone-50 py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-3" data-testid="about-page-tagline">About Lumina</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-900 mb-6" data-testid="about-page-title">
            We design practical homes people can actually buy.
          </h1>
          <p className="text-base md:text-lg text-stone-600 max-w-3xl mx-auto" data-testid="about-page-description">
            Lumina blends design intelligence with real-world shopping so your moodboard becomes a room plan, then a finished space.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-2xl border border-stone-200 p-8 bg-white shadow-sm"
              data-testid={`about-pillar-${pillar.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center mb-5">
                {pillar.icon}
              </div>
              <h2 className="font-serif text-2xl text-stone-900 mb-3">{pillar.title}</h2>
              <p className="text-stone-600">{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-stone-900 text-white p-10 md:p-14" data-testid="about-next-step-card">
          <h2 className="font-serif text-3xl mb-4">How we help you save money upfront</h2>
          <ul className="space-y-3 text-stone-200">
            {[
              'Curated product paths to avoid indecisive buying',
              'Price filters and relevance sorting to stay in budget',
              'Designer-backed shopping links so purchases are intentional',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3" data-testid={`about-benefit-${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                <CheckCircle2 size={18} className="mt-1 text-stone-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/studio"
              className="bg-white text-stone-900 px-6 py-3 rounded-full font-medium hover:bg-stone-100 transition"
              data-testid="about-go-to-studio-link"
            >
              Explore Studio
            </Link>
            <Link
              to="/contact"
              className="border border-white/30 px-6 py-3 rounded-full hover:bg-white/10 transition"
              data-testid="about-contact-link"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;