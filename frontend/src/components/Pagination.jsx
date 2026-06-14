import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border-light dark:border-border-dark bg-zinc-50/50 dark:bg-zinc-900/10">
      
      {/* Mobile view */}
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg border border-border-light dark:border-border-dark text-zinc-700 dark:text-zinc-300 bg-card-light dark:bg-card-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center ml-3 px-4 py-2 text-xs font-semibold rounded-lg border border-border-light dark:border-border-dark text-zinc-700 dark:text-zinc-300 bg-card-light dark:bg-card-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          Next
        </button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Showing page <span className="font-semibold text-zinc-700 dark:text-zinc-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2.5 py-1.5 rounded-l-lg border border-border-light dark:border-border-dark text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-card-light dark:bg-card-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Range of pages indicator */}
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              const isSelected = pageNumber === currentPage;
              
              // Only render standard amount of page numbers to avoid overflow
              if (
                totalPages > 6 &&
                Math.abs(pageNumber - currentPage) > 1 &&
                pageNumber !== 1 &&
                pageNumber !== totalPages
              ) {
                if (pageNumber === 2 || pageNumber === totalPages - 1) {
                  return (
                    <span key={pageNumber} className="relative inline-flex items-center px-3 py-1.5 border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-sm font-medium text-zinc-500">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`relative inline-flex items-center px-3 py-1.5 border text-sm font-semibold transition-colors ${
                    isSelected
                      ? 'z-10 bg-indigo-600 border-indigo-600 text-white'
                      : 'border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2.5 py-1.5 rounded-r-lg border border-border-light dark:border-border-dark text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-card-light dark:bg-card-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>

    </div>
  );
}
