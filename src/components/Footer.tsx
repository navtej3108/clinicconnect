import { Activity, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
            <Activity className="w-5 h-5" />
            <span>ClinicConnect</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for better healthcare access
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; 2026 ClinicConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
