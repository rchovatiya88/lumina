import React, { useState, useEffect } from 'react';
import { X, Mail, Check } from 'lucide-react';

const NewsletterModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Show modal after 5 seconds
    const timer = setTimeout(() => {
      const hasSeenModal = localStorage.getItem('lumina_newsletter_seen');
      if (!hasSeenModal) {
        setIsOpen(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('lumina_newsletter_seen', 'true');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send to ConvertKit/Beehiiv here
    setIsSubmitted(true);
    setTimeout(() => {
        handleClose();
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-500">
        <button 
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 bg-white/80 rounded-full p-2 hover:bg-stone-100 transition"
        >
            <X size={20} className="text-stone-500" />
        </button>

        {/* Image Side */}
        <div className="md:w-1/2 relative min-h-[300px] md:min-h-full">
           <img 
             src="https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=800"
             alt="Luxury Living Room"
             className="absolute inset-0 w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-stone-900/20"></div>
           <div className="absolute bottom-6 left-6 text-white">
              <p className="font-serif text-2xl leading-tight">"Design is not just what it looks like. Design is how it works."</p>
           </div>
        </div>

        {/* Content Side */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
           {isSubmitted ? (
               <div className="text-center py-10">
                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                       <Check size={32} />
                   </div>
                   <h3 className="font-serif text-2xl text-stone-900 mb-2">You're on the list!</h3>
                   <p className="text-stone-500">Check your inbox for your free guide.</p>
               </div>
           ) : (
               <>
                <div className="mb-2 uppercase tracking-widest text-xs font-semibold text-stone-400">Free Design Guide</div>
                <h2 className="font-serif text-3xl text-stone-900 mb-4">Get Our Top 50 Designer Picks</h2>
                <p className="text-stone-500 mb-8 leading-relaxed">
                    Stop scrolling for hours. We've curated the best hidden gems on Amazon, Wayfair, and more. 
                    Download the free PDF guide today.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-stone-400" size={20} />
                            <input 
                                type="email" 
                                required
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-stone-900 text-white py-3 rounded-lg font-medium hover:bg-stone-800 transition shadow-lg"
                    >
                        Send Me The Guide
                    </button>
                    <p className="text-xs text-center text-stone-400 mt-4">
                        Join 15,000+ subscribers. Unsubscribe anytime.
                    </p>
                </form>
               </>
           )}
        </div>
      </div>
    </div>
  );
};

export default NewsletterModal;