import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Guide - Height Comparison Tool | How to Use',
  description: 'Complete guide on how to use our height comparison tool. Step-by-step instructions for comparing heights, uploading images, and getting accurate measurements.',
  keywords: 'height comparison guide, how to use height tool, height comparison tutorial, height measurement guide, compare heights step by step',
  openGraph: {
    title: 'User Guide - Height Comparison Tool | How to Use',
    description: 'Complete guide on how to use our height comparison tool. Step-by-step instructions for comparing heights, uploading images, and getting accurate measurements.',
    url: 'https://www.heightscompare.com/guide',
    siteName: 'Heights Compare',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.heightscompare.com/guide',
  },
};

export default function GuidePage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Height Comparison Tool User Guide
      </h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Learn how to use our height comparison tool effectively with this comprehensive guide. 
          Follow these step-by-step instructions to create accurate and visually appealing height comparisons.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            Getting Started
          </h2>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
              Quick Start
            </h3>
            <p className="text-blue-800 dark:text-blue-200">
              The height comparison tool is ready to use immediately - no registration or downloads required. 
              Simply start adding people and their heights to begin comparing.
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Step 1: Adding Your First Person
          </h3>
          <ol className="list-decimal ml-6 space-y-3 mb-6">
            <li>Look for the "Add Person" section in the sidebar (on mobile, it's in the left column)</li>
            <li>Choose the gender by clicking "Male" or "Female"</li>
            <li>Enter a name (optional but helpful for identification)</li>
            <li>Input the height using either feet/inches or centimeters</li>
            <li>Select a color to distinguish this person</li>
            <li>Click "Add Person" to create the silhouette</li>
          </ol>

          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Step 2: Adding More People
          </h3>
          <p className="mb-4">
            Repeat the process to add up to 50 people for comparison. Each person will appear as a colored silhouette 
            in the main comparison area, scaled proportionally to their height.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            Height Input Methods
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Imperial (Feet & Inches)
              </h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Enter feet in the first field (e.g., 5)</li>
                <li>Enter inches in the second field (e.g., 10.5)</li>
                <li>Supports decimal inches for precision</li>
                <li>Maximum 11.99 inches per foot</li>
              </ul>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Metric (Centimeters)
              </h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Enter height in centimeters (e.g., 178)</li>
                <li>Whole numbers recommended</li>
                <li>Automatically converts to feet/inches</li>
                <li>More precise for international users</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-green-900 dark:text-green-100">
              💡 Pro Tip: Unit Conversion
            </h3>
            <p className="text-green-800 dark:text-green-200">
              You can switch between feet/inches and centimeters at any time. The tool automatically 
              converts measurements, so you can input in your preferred unit regardless of the source data.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            Customizing Your Comparison
          </h2>

          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Editing People
          </h3>
          <ol className="list-decimal ml-6 space-y-3 mb-6">
            <li>Click on any silhouette in the comparison area to select it</li>
            <li>Click the edit button (pencil icon) in the people list</li>
            <li>Modify name, height, gender, or color as needed</li>
            <li>Use vertical adjustment controls to align feet to ground level</li>
            <li>Click "Done Editing" when finished</li>
          </ol>

          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Custom Images
          </h3>
          <p className="mb-4">
            For more personalized comparisons, you can upload custom images:
          </p>
          <ul className="list-disc ml-6 space-y-2 mb-6">
            <li>Click "Choose Image" in the add person form</li>
            <li>Select a photo from your device</li>
            <li>The image will be scaled according to the height you specify</li>
            <li>Works best with full-body photos</li>
            <li>Supports common image formats (JPG, PNG, etc.)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Positioning and Alignment
          </h3>
          <ul className="list-disc ml-6 space-y-2">
            <li>Drag silhouettes to reposition them horizontally</li>
            <li>Use vertical adjustment controls for precise ground alignment</li>
            <li>Zoom in/out using the controls at the top</li>
            <li>Step size adjusts automatically based on zoom level</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            Advanced Features
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Zoom Controls
              </h3>
              <p className="mb-3">
                Use the zoom controls at the top of the comparison area to:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Zoom in for detailed height difference analysis</li>
                <li>Zoom out to see the full comparison</li>
                <li>Use the slider for precise zoom control</li>
                <li>Zoom level affects vertical adjustment precision</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Color Coding
              </h3>
              <p className="mb-3">
                Strategic use of colors can improve your comparisons:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Use different colors to group related people</li>
                <li>Bright colors stand out more in comparisons</li>
                <li>Consider color contrast for better visibility</li>
                <li>Colors help identify people in crowded comparisons</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Saving and Sharing
              </h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Comparisons are automatically saved in your browser</li>
                <li>Use the "Share" button to create shareable links</li>
                <li>Take screenshots for social media sharing</li>
                <li>Clear all to start fresh comparisons</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            Tips for Accurate Comparisons
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-yellow-900 dark:text-yellow-100">
                ⚡ Best Practices
              </h3>
              <ul className="list-disc ml-6 space-y-2 text-yellow-800 dark:text-yellow-200">
                <li>Use verified height measurements when possible</li>
                <li>Align all silhouettes to the same ground level</li>
                <li>Consider posture differences in real photos</li>
                <li>Use consistent measurement units</li>
              </ul>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-red-900 dark:text-red-100">
                ⚠️ Common Mistakes
              </h3>
              <ul className="list-disc ml-6 space-y-2 text-red-800 dark:text-red-200">
                <li>Not aligning feet to ground level</li>
                <li>Using unverified height claims</li>
                <li>Mixing measurement systems incorrectly</li>
                <li>Ignoring posture in custom images</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Need More Help?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you're still having trouble or have specific questions about using the height comparison tool, 
            we're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/faq" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View FAQ
            </a>
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </section>
      </div>
    </main>
  );
} 