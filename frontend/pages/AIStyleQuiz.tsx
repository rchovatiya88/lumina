import React, { useState } from 'react';
import { getStyleAdvice } from '../services/geminiService';
import { Sparkles, Loader2, RefreshCw, ArrowRight } from 'lucide-react';

const AIStyleQuiz: React.FC = () => {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    setIsLoading(true);
    const advice = await getStyleAdvice(description);
    setResult(advice);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-stone-200 rounded-full mb-4">
            <Sparkles className="text-stone-700" size={24} />
          </div>
          <h1 className="text-4xl font-serif text-stone-900 mb-4">AI Style Matcher</h1>
          <p className="text-stone-500">
            Describe your dream room, your favorite colors, or how you want to feel in the space. 
            Our AI will analyze your taste and suggest a style direction.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Tell us about your space
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 p-4 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-500 focus:border-transparent resize-none text-stone-800 bg-stone-50"
              placeholder="e.g. I love natural light, plants, and cozy textures. I want my living room to feel like a calm sanctuary but still modern..."
            ></textarea>
          </div>
          
          <button 
            onClick={handleAnalyze}
            disabled={isLoading || !description.trim()}
            className="w-full bg-stone-900 text-white py-4 rounded-xl font-medium hover:bg-stone-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Analyzing...
              </>
            ) : (
              <>
                Reveal My Style <Sparkles size={20} />
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-stone-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-stone-800 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="font-serif text-2xl mb-4 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-white/50"></span> Your Design Persona
                </h2>
                
                <div className="prose prose-invert max-w-none">
                   {result.split('\n').map((line, i) => (
                     <p key={i} className="mb-2 text-stone-200 leading-relaxed">
                        {line}
                     </p>
                   ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                  <button onClick={() => setResult(null)} className="text-sm text-stone-400 hover:text-white flex items-center gap-2">
                    <RefreshCw size={14} /> Try Again
                  </button>
                  <a href="/room-builder" className="bg-white text-stone-900 px-6 py-2 rounded-full text-sm font-medium hover:bg-stone-100 transition flex items-center gap-2">
                    Start Designing <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStyleQuiz;