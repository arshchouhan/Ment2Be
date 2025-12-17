import React from 'react';

const PageLoader = ({ label = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-white mb-4" />
        <div className="text-sm text-gray-200">{label}</div>
      </div>
    </div>
  );
};

export default PageLoader;
