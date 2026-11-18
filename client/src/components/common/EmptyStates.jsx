import React from 'react';
import { SearchX, AlertCircle, WifiOff, PackageX, History } from 'lucide-react';
import Button from '../ui/Button';

export const NoResults = ({ query = '' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
      <SearchX className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No results found</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
      We couldn't find anything matching "{query}". Try adjusting your search or using more general terms.
    </p>
    <Button variant="secondary" onClick={() => window.history.back()}>
      Go Back
    </Button>
  </div>
);

export const ApiError = ({ message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-2xl">
    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
      <AlertCircle className="w-8 h-8 text-red-500" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Oops! An error occurred</h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">{message}</p>
    {onRetry && (
      <Button variant="primary" onClick={onRetry}>
        Try Again
      </Button>
    )}
  </div>
);

export const OfflineError = () => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
      <WifiOff className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You are offline</h3>
    <p className="text-gray-500 dark:text-gray-400 mb-6">Please check your internet connection and try again.</p>
    <Button variant="secondary" onClick={() => window.location.reload()}>
      Reload Page
    </Button>
  </div>
);

export const EmptyWishlist = () => (
  <div className="flex flex-col items-center justify-center p-16 text-center">
    <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6">
      <PackageX className="w-12 h-12 text-primary-500" />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your wishlist is empty</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
      Save products you are interested in to track their prices and get notified of drops.
    </p>
    <Button variant="primary">Explore Deals</Button>
  </div>
);

export const NoProducts = ({ message = "No products available yet." }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
    <PackageX className="w-10 h-10 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{message}</h3>
  </div>
);
