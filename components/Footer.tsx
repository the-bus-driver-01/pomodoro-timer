import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 sm:py-12">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand/Description */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Pomodoro Timer
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                Stay focused and productive with the Pomodoro Technique.
                Work in focused intervals, take breaks, and track your progress.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#timer"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Timer
                  </a>
                </li>
                <li>
                  <a
                    href="#stats"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Statistics
                  </a>
                </li>
                <li>
                  <a
                    href="#settings"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    Settings
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    About Pomodoro
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-500">
                © 2026 Pomodoro Timer. Built for productivity.
              </div>

              {/* Social links or additional info */}
              <div className="flex items-center space-x-6">
                <a
                  href="#privacy"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Privacy
                </a>
                <a
                  href="#terms"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Terms
                </a>
                <a
                  href="#help"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Help
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}