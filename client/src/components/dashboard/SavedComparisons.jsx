import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Trash2, ExternalLink, Calendar, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

const SavedComparisons = ({ comparisons = [] }) => {
  if (!comparisons.length) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
        <PlusCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-gray-900 dark:text-white font-medium">No Saved Comparisons</h3>
        <p className="text-sm text-gray-500 mt-1">Compare products and save them here for later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {comparisons.map(comp => (
        <Card key={comp.id} className="p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 truncate">{comp.title}</h4>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2 mb-3">
              <Calendar className="w-3.5 h-3.5" />
              Saved on {format(new Date(comp.date), 'MMM dd, yyyy')}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {comp.products.map((p, i) => (
                <span key={i} className="inline-block px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-md">
                  {p}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-transparent">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </Button>
            <Button variant="secondary" size="sm" onClick={() => window.location.href='/compare'}>
              Open <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SavedComparisons;
