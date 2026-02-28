import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, LogIn } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  // Don't show layout on Login page
  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  const isActive = (path: string) => location.pathname === path ? 'text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800';

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-stone-900 text-white flex items-center justify-center rounded-sm font-serif text-xl">L</div>
                <span className="font-serif text-xl tracking-tight font-semibold">Lumina</span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 ml-10">
              <Link to="/" className={isActive('/')} data-testid="nav-home-link">Home</Link>
              <Link to="/studio" className={isActive('/studio')} data-testid="nav-studio-link">Studio / Shopping</Link>
              <Link to="/design" className={isActive('/design')} data-testid="nav-3d-builder-link">3D Builder</Link>
              <Link to="/journal" className={isActive('/journal')} data-testid="nav-journal-link">Inspiration / Trends / Blog</Link>
              <Link to="/services" className={isActive('/services')} data-testid="nav-services-link">Services</Link>
              <Link to="/style-quiz" className={`flex items-center gap-1 ${isActive('/style-quiz')}`} data-testid="nav-ai-quiz-link">
                <Sparkles size={16} /> AI Quiz
              </Link>
              <Link to="/about" className={isActive('/about')} data-testid="nav-about-link">About</Link>
              <Link to="/contact" className={isActive('/contact')} data-testid="nav-contact-link">Contact</Link>
              
              <div className="h-4 w-px bg-stone-300"></div>

              <Link to="/login" className="text-stone-500 hover:text-stone-900 flex items-center gap-2 text-sm font-medium" data-testid="nav-login-link">
                <LogIn size={16} /> Client Login
              </Link>
              <Link to="/contact" className="bg-stone-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-stone-800 transition-colors shadow-sm" data-testid="nav-book-consultation-link">
                Book Consultation
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-stone-500 hover:text-stone-900" data-testid="mobile-menu-toggle-button">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-stone-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50" data-testid="mobile-nav-home-link">Home</Link>
              <Link to="/studio" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50" data-testid="mobile-nav-studio-link">Studio / Shopping</Link>
              <Link to="/design" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50" data-testid="mobile-nav-3d-builder-link">3D Builder</Link>
              <Link to="/journal" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50" data-testid="mobile-nav-journal-link">Inspiration / Trends / Blog</Link>
              <Link to="/services" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50" data-testid="mobile-nav-services-link">Services</Link>
              <Link to="/style-quiz" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50" data-testid="mobile-nav-ai-quiz-link">AI Style Quiz</Link>
              <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50" data-testid="mobile-nav-about-link">About</Link>
              <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50" data-testid="mobile-nav-contact-link">Contact</Link>
              <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50" data-testid="mobile-nav-dashboard-link">Dashboard</Link>
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-50" data-testid="mobile-nav-login-link">Login</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      {!location.pathname.includes('studio') && (
        <footer className="bg-stone-900 text-stone-400 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-white font-serif text-2xl mb-4">Lumina</h3>
              <p className="max-w-xs text-sm leading-relaxed">
                Elevating interior design through technology and curated aesthetics.
                Create your dream space today.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/studio" className="hover:text-white transition">Moodboard Studio</Link></li>
                <li><Link to="/journal" className="hover:text-white transition">Journal</Link></li>
                <li><Link to="/services" className="hover:text-white transition">Design Services</Link></li>
                <li><Link to="/style-quiz" className="hover:text-white transition">Style Quiz</Link></li>
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition">Pinterest</a></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-stone-800 text-xs text-center">
            © {new Date().getFullYear()} Lumina Interiors. All rights reserved.
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;