import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200" 
          alt="Interior Design Studio" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-stone-900/30 flex items-end p-12">
           <div className="text-white">
             <h2 className="font-serif text-4xl mb-4">"Lumina transformed my business workflow entirely."</h2>
             <p className="text-lg opacity-90">— Erin, Interior Designer</p>
           </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 relative">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-stone-500 hover:text-stone-900 transition">
           <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-10">
            <div className="w-12 h-12 bg-stone-900 text-white flex items-center justify-center rounded-sm font-serif text-2xl mx-auto mb-4">L</div>
            <h1 className="font-serif text-3xl text-stone-900 mb-2">Welcome Back</h1>
            <p className="text-stone-500">Enter your details to access your workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
              <input 
                type="email" 
                defaultValue="erin@lumina.design"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900 transition"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-stone-700">Password</label>
                <a href="#" className="text-sm text-stone-500 hover:text-stone-900">Forgot password?</a>
              </div>
              <input 
                type="password" 
                defaultValue="password123"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-900 transition"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-stone-900 text-white py-3 rounded-lg font-medium hover:bg-stone-800 transition shadow-md"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-stone-500">
            Don't have an account? <Link to="/services" className="text-stone-900 font-medium hover:underline">View Plans</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;