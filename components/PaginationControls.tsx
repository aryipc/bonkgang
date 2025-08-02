"use client";

import React from 'react';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null;
    }

    // --- Pagination Logic ---
    const getPaginationRange = () => {
        const siblings = 1;
        const totalPageNumbers = siblings * 2 + 5; // siblings on each side + current + first + last + 2 ellipses

        // Case 1: Total pages are less than the numbers we want to show.
        if (totalPageNumbers >= totalPages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const leftSiblingIndex = Math.max(currentPage - siblings, 1);
        const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;

        // Case 2: No left dots, but right dots.
        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblings;
            let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
            return [...leftRange, '...', totalPages];
        }

        // Case 3: No right dots, but left dots.
        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblings;
            let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + 1 + i);
            return [firstPageIndex, '...', ...rightRange];
        }

        // Case 4: Both left and right dots.
        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
            return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex];
        }
        
        // Default to a simple range if something goes wrong.
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    };

    const paginationRange = getPaginationRange();
    
    // --- Handlers ---
    const handlePrev = () => {
        onPageChange(Math.max(1, currentPage - 1));
    };

    const handleNext = () => {
        onPageChange(Math.min(totalPages, currentPage + 1));
    };

    return (
        <div className="flex justify-center items-center gap-2 sm:gap-4 mt-8" role="navigation" aria-label="pagination">
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm bg-zinc-800 text-white rounded-md transition-colors hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-gray-600 disabled:cursor-not-allowed"
                aria-label="Go to previous page"
            >
                &larr; Prev
            </button>

            <div className="flex items-center gap-1 sm:gap-2">
                {paginationRange.map((pageNumber, index) => {
                    if (typeof pageNumber === 'string') {
                        return <span key={`dots-${index}`} className="px-1 sm:px-2 py-2 text-sm text-gray-500 select-none">...</span>;
                    }

                    return (
                        <button
                            key={pageNumber}
                            onClick={() => onPageChange(pageNumber)}
                            disabled={currentPage === pageNumber}
                            className={`text-sm rounded-md transition-colors w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center font-bold ${
                                currentPage === pageNumber
                                    ? 'bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_#000] cursor-default'
                                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                            }`}
                            aria-label={`Go to page ${pageNumber}`}
                            aria-current={currentPage === pageNumber ? 'page' : undefined}
                        >
                            {pageNumber}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm bg-zinc-800 text-white rounded-md transition-colors hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-gray-600 disabled:cursor-not-allowed"
                aria-label="Go to next page"
            >
                Next &rarr;
            </button>
        </div>
    );
};

export default PaginationControls;
