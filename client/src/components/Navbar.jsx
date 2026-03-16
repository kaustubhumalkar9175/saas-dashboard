import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects':  'Projects',
  '/profile':   'Profile',
  '/admin':     'Admin Panel',
};

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const title    = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">

        {/* Left — hamburger + title */}
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>

        {/* Right — notification bell */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"/>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;