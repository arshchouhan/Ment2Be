import React from 'react';
import { Star } from 'lucide-react';

const KarmaPointsCard = ({ points = 0 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Karma Points</h3>
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
          <Star className="h-5 w-5 text-yellow-500" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {points.toLocaleString()}
      </div>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Earn more by completing sessions and tasks
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">This week</span>
          <span className="font-medium text-green-500">+150</span>
        </div>
      </div>
    </div>
  );
};

export default KarmaPointsCard;
