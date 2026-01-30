import React from 'react';
import { MOCK_POSTS } from '../constants';
import { ArrowRight, Calendar } from 'lucide-react';

const Journal: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-stone-50 py-20 px-4">
         <div className="max-w-7xl mx-auto text-center">
            <span className="text-stone-500 uppercase tracking-widest text-xs font-semibold mb-3 block">The Journal</span>
            <h1 className="font-serif text-4xl md:text-6xl text-stone-900 mb-6">Design Notes & Living</h1>
            <p className="text-xl text-stone-600 font-light max-w-2xl mx-auto">
               Curated inspiration, industry trends, and practical guides for the modern home.
            </p>
         </div>
      </div>

      {/* Featured Post */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20 relative z-10">
         <div className="bg-white p-4 rounded-2xl shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
               <div className="h-[400px] md:h-[500px] w-full overflow-hidden rounded-xl">
                  <img 
                    src={MOCK_POSTS[0].image} 
                    alt={MOCK_POSTS[0].title} 
                    className="w-full h-full object-cover hover:scale-105 transition duration-700"
                  />
               </div>
               <div className="p-4 md:p-8">
                  <span className="text-stone-500 text-sm font-medium mb-4 block">{MOCK_POSTS[0].category} — {MOCK_POSTS[0].date}</span>
                  <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-6 leading-tight hover:text-stone-600 transition cursor-pointer">
                    {MOCK_POSTS[0].title}
                  </h2>
                  <p className="text-stone-500 text-lg mb-8 leading-relaxed">
                    {MOCK_POSTS[0].excerpt}
                  </p>
                  <button className="flex items-center gap-2 text-stone-900 font-medium border-b border-stone-900 pb-1 hover:text-stone-600 hover:border-stone-600 transition">
                     Read Article <ArrowRight size={18} />
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* Post Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {MOCK_POSTS.slice(1).map((post) => (
               <div key={post.id} className="group cursor-pointer">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl mb-6">
                     <img 
                       src={post.image} 
                       alt={post.title} 
                       className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                     />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-500 mb-3 uppercase tracking-wide">
                     <span className="font-semibold text-stone-900">{post.category}</span>
                     <span>•</span>
                     <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                  </div>
                  <h3 className="font-serif text-2xl text-stone-900 mb-3 group-hover:text-stone-600 transition">
                     {post.title}
                  </h3>
                  <p className="text-stone-500 text-sm mb-4 line-clamp-3 leading-relaxed">
                     {post.excerpt}
                  </p>
                  <span className="text-stone-900 text-sm font-medium underline decoration-stone-300 underline-offset-4 group-hover:decoration-stone-900 transition">Read Story</span>
               </div>
            ))}
         </div>
      </div>

      {/* Newsletter Section (Inline) */}
      <div className="bg-stone-900 text-white py-20 px-4">
         <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Join the Inner Circle</h2>
            <p className="text-stone-300 mb-8 text-lg">
               Get weekly design tips, exclusive retail discounts, and early access to our new collections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
               <input 
                 type="email" 
                 placeholder="Your email address" 
                 className="flex-1 px-4 py-3 rounded-lg bg-stone-800 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-stone-500"
               />
               <button className="bg-white text-stone-900 px-8 py-3 rounded-lg font-medium hover:bg-stone-100 transition">
                  Subscribe
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Journal;