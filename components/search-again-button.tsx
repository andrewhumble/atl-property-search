import React from 'react';
import { ViewportBounds } from '@/types';

interface SearchAgainButtonProps {
  viewport: ViewportBounds;
  onSearchInViewport: (viewport: ViewportBounds) => void;
  isLoading?: boolean;
}

export default function SearchAgainButton({ 
  viewport, 
  onSearchInViewport, 
  isLoading = false 
}: SearchAgainButtonProps) {
  const handleClick = () => {
    onSearchInViewport(viewport);
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
          text-white font-medium py-2 px-4 rounded-lg shadow-lg
          transition-all duration-200 transform hover:scale-105
          flex items-center space-x-2
          ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Searching...</span>
          </>
        ) : (
          <>
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <span>Search This Area</span>
          </>
        )}
      </button>
    </div>
  );
} 