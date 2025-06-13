'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="p-3 md:p-5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3 md:space-x-6">
          <div className="font-heading font-bold text-xl md:text-2xl flex items-center text-gray-900 dark:text-white">
            <span className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center mr-2 rounded-lg shadow-lg font-bold text-sm md:text-base">H</span>
            HeightsComparison
          </div>
          {/* Menu button for mobile */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 text-base font-medium">
            <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">Home</Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">About</Link>
            <Link href="/blog" className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">Blog</Link>
            <Link href="/contact" className="text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer">Contact</Link>
          </nav>
        </div>
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <button className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 transition-colors">Login</button>
          <button className="text-base font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-lg shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all">Sign Up — It&apos;s Free</button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <nav className="md:hidden absolute left-0 right-0 top-full bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          <div className="flex flex-col p-4 space-y-1">
            <Link href="/" className="py-3 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 transition-colors">Home</Link>
            <Link href="/about" className="py-3 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 transition-colors">About</Link>
            <Link href="/blog" className="py-3 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 transition-colors">Blog</Link>
            <Link href="/contact" className="py-3 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 transition-colors">Contact</Link>
            <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
            <button className="text-left py-3 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 transition-colors">Login</button>
            <button className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg text-left text-base font-semibold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all">Sign Up — It&apos;s Free</button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header; 