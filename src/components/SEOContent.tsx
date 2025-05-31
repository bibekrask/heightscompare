'use client';

import React from 'react';

const SEOContent = () => (
  <section className="bg-gray-50 dark:bg-gray-900 py-16 mt-8">
    <div className="container mx-auto px-4 max-w-6xl">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
        The Ultimate Height Comparison Tool
      </h2>
      
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Visual Height Comparisons</h3>
          <p className="text-gray-600 dark:text-gray-300">Compare heights of celebrities, athletes, friends, and family members with our intuitive height comparison chart interface.</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Height Conversion & Comparison</h3>
          <p className="text-gray-600 dark:text-gray-300">Get height differences in both metric (cm) and imperial (feet, inches to cm) units with our height comparator tool.</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Easy Height Comparing</h3>
          <p className="text-gray-600 dark:text-gray-300">Simply add people, set their heights, and instantly see the height difference comparison. Works on all devices for comparing heights.</p>
        </div>
      </div>

      <div className="prose prose-lg max-w-4xl mx-auto text-gray-700 dark:text-gray-300">
        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">How to Use the Height Comparison Tool</h3>
        <ol className="list-decimal ml-6 space-y-3 mb-8">
          <li>Click &quot;Add Person&quot; to create a new silhouette for height comparing</li>
          <li>Enter the person&apos;s name and height in cm or feet/inches for height conversion</li>
          <li>Choose male or female silhouette and customize the color</li>
          <li>Add multiple people to compare heights side by side using our height comparator</li>
          <li>Drag and position the silhouettes for the perfect height comparison chart</li>
          <li>Use zoom controls to get a better view of height differences</li>
        </ol>

        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Popular Height Comparison Use Cases</h3>
        <p className="mb-4">Our height comparison tool is perfect for comparing heights in various scenarios:</p>
        <ul className="list-disc ml-6 space-y-2 mb-8">
          <li><strong>Celebrity Height Comparisons:</strong> Compare heights of your favorite celebrities, actors, and public figures</li>
          <li><strong>Sports & Athletics:</strong> Height comparing for NBA players, soccer stars, and athletes from different disciplines</li>
          <li><strong>Recruitment Agencies:</strong> Visual height assessment for modeling, acting, and sports recruitment</li>
          <li><strong>Modeling Industry:</strong> Height comparison charts for fashion shows, photo shoots, and casting calls</li>
          <li><strong>Entertainment Casting:</strong> Compare height differences for movie roles, TV shows, and theater productions</li>
          <li><strong>Family & Friends:</strong> Fun height comparisons for family photos and group events</li>
          <li><strong>Historical Figures:</strong> Height comparing of famous historical personalities</li>
          <li><strong>Average Human Height Studies:</strong> Compare against average human height statistics by country and age</li>
          <li><strong>Dating & Social:</strong> Understanding height differences in relationships and social settings</li>
          <li><strong>Medical & Health:</strong> Height tracking and comparison for growth monitoring</li>
        </ul>

        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Height Comparison Examples & Scenarios</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Professional Use Cases</h4>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Modeling Agencies:</strong> Compare model heights for runway shows and photo shoots</li>
              <li><strong>Sports Recruiters:</strong> Height analysis for basketball, volleyball, and other height-dependent sports</li>
              <li><strong>Film & TV Casting:</strong> Ensure proper height ratios between actors in scenes</li>
              <li><strong>Fashion Industry:</strong> Height comparison charts for clothing size standards</li>
              <li><strong>Talent Agencies:</strong> Visual height assessment for various entertainment roles</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Personal & Educational</h4>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Family Growth Tracking:</strong> Monitor children&apos;s height progress over time</li>
              <li><strong>Educational Projects:</strong> Height comparison studies and statistics</li>
              <li><strong>Social Media Content:</strong> Create engaging height comparison posts</li>
              <li><strong>Fitness & Health:</strong> Compare heights in fitness and bodybuilding communities</li>
              <li><strong>Travel Planning:</strong> Understanding average human height in different countries</li>
            </ul>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Features & Benefits</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Free Height Comparison Tool</h4>
            <p>Use our height comparison tool completely free with no registration required. Compare up to 50 people at once for comprehensive height comparing.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Mobile-Responsive Height Comparator</h4>
            <p>Works perfectly on smartphones, tablets, and desktop computers with touch-friendly controls for easy height comparison on any device.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Custom Images for Height Compare</h4>
            <p>Upload your own photos or use our default silhouettes for personalized height comparison charts and visual height analysis.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Height Conversion Calculator</h4>
            <p>Built-in height conversion between feet, inches to cm and metric units for international height comparing needs.</p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Height Conversion & Measurement Guide</h3>
        <p className="mb-4">
          Our height comparison tool includes comprehensive height conversion capabilities:
        </p>
        <ul className="list-disc ml-6 space-y-2 mb-6">
          <li><strong>Feet, Inches to CM:</strong> Automatic conversion from imperial to metric measurements</li>
          <li><strong>CM to Feet/Inches:</strong> Convert centimeters to feet and inches for height comparing</li>
          <li><strong>Average Human Height Reference:</strong> Compare against global height averages by gender and region</li>
          <li><strong>Height Difference Calculator:</strong> Instantly see exact height differences between people</li>
          <li><strong>Multiple Unit Display:</strong> View heights in both metric and imperial simultaneously</li>
        </ul>

        <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Why Choose Our Height Comparison Tool?</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-8">
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-500 mr-3 mt-1">✓</span>
              <span><strong>Instant Height Comparing:</strong> No downloads or installations required for height comparison</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-3 mt-1">✓</span>
              <span><strong>Professional Height Comparison Charts:</strong> Perfect for recruitment agencies and modeling industry</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-3 mt-1">✓</span>
              <span><strong>Comprehensive Height Conversion:</strong> Support for all major measurement units</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-3 mt-1">✓</span>
              <span><strong>Visual Height Difference Analysis:</strong> Clear, easy-to-understand height comparisons</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-3 mt-1">✓</span>
              <span><strong>Multi-Person Height Compare:</strong> Compare multiple heights simultaneously</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export default SEOContent; 