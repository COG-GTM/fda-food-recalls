import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/past_recalls', label: 'Past Recalls' },
  { path: '/current_recalls', label: 'Recent Recalls' },
  { path: '/recalls_by_state', label: 'Trends Over Time' },
  { path: '/cpsc_recalls', label: 'CPSC Recalls' },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1E293B] border-b border-[#334155] px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-[#22D3EE] font-bold text-xl tracking-tight no-underline">
          FDA Food Recalls
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-[#CBD5E1] hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium no-underline transition-colors ${
                location.pathname === link.path
                  ? 'bg-[#22D3EE]/10 text-[#22D3EE]'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-[#334155]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden mt-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium no-underline ${
                location.pathname === link.path
                  ? 'bg-[#22D3EE]/10 text-[#22D3EE]'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-[#334155]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
