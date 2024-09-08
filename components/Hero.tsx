import { useState } from 'react';
import LoginPopup from './LoginPopup';

export default function Hero() {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-800"></div>
      
      {/* Overlay with noise texture */}
      <div className="absolute inset-0 bg-black opacity-30"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <h1 className="text-5xl font-bold mb-4">VegaArt AI Art Generator</h1>
        <p className="text-xl mb-8">Create AI videos and images with VegaArt&apos;s AI Generator</p>
        <div className="max-w-xl mx-auto">
          <div className="flex items-center bg-white bg-opacity-10 rounded-full overflow-hidden shadow-lg backdrop-blur-sm">
            <input
              type="text"
              placeholder="a cyberpunk dystopia with a sprawling"
              className="w-full py-3 px-6 bg-transparent text-white placeholder-gray-300 leading-tight focus:outline-none"
            />
            <button 
              className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition duration-300 shadow-lg hover:shadow-blue-500/50"
              onClick={() => setIsLoginPopupOpen(true)}
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      <LoginPopup isOpen={isLoginPopupOpen} onClose={() => setIsLoginPopupOpen(false)} />
    </section>
  )
}