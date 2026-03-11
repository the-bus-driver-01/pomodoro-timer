import React from 'react';

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="text-center py-8 sm:py-12 lg:py-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4">
          Pomodoro Timer
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Boost your productivity with the proven Pomodoro Technique.
          Focus for 25 minutes, then take a 5-minute break.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="btn-primary w-full sm:w-auto px-8 py-3">
            Start Timer
          </button>
          <button className="btn-secondary w-full sm:w-auto px-8 py-3">
            Learn More
          </button>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12">
          Why Use Pomodoro Timer?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Time Management
            </h3>
            <p className="text-gray-600 text-responsive">
              Break your work into focused 25-minute intervals with structured breaks to maintain peak concentration.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Track Progress
            </h3>
            <p className="text-gray-600 text-responsive">
              Monitor your productivity patterns and see how many pomodoros you complete each day.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Stay Focused
            </h3>
            <p className="text-gray-600 text-responsive">
              Eliminate distractions and maintain deep focus with timed work sessions and regular breaks.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-indigo-50 rounded-xl p-6 sm:p-8 lg:p-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Ready to Boost Your Productivity?
        </h2>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of people who have improved their focus and productivity with the Pomodoro Technique.
        </p>
        <button className="btn-primary px-8 py-3 text-base sm:text-lg">
          Get Started Now
        </button>
      </section>
    </div>
  );
}