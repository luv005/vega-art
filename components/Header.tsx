import Link from 'next/link'
import { useState } from 'react';
import LoginPopup from './LoginPopup';
import { useAuth } from './AuthProvider';
import { auth } from '../firebase';

export default function Header() {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const { user } = useAuth();

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="text-2xl font-bold">VegaArt</div>
        <div className="space-x-4">
          <Link href="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link>
          <Link href="/community" className="text-gray-600 hover:text-gray-900">Community</Link>
          <Link href="/api" className="text-gray-600 hover:text-gray-900">API</Link>
          <Link href="/creators" className="text-gray-600 hover:text-gray-900">Creators</Link>
        </div>
        <div className="space-x-2">
          {user ? (
            <>
              <span className="text-gray-600">Welcome, {user.displayName}</span>
              <button 
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <button 
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsLoginPopupOpen(true)}
            >
              Sign in
            </button>
          )}
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => user ? console.log('Launch app') : setIsLoginPopupOpen(true)}
          >
            Launch App
          </button>
        </div>
      </nav>
      <LoginPopup isOpen={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />
    </header>
  )
}