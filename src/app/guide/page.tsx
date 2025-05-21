import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Height Comparison Guide | Heights Compare',
  description: 'Learn how to use Heights Compare effectively - A comprehensive guide to comparing heights and understanding our visualization tools.',
  openGraph: {
    title: 'Height Comparison Guide | Heights Compare',
    description: 'Learn how to use Heights Compare effectively - A comprehensive guide to comparing heights and understanding our visualization tools.',
    url: 'https://www.heightscompare.com/guide',
    siteName: 'Heights Compare',
    type: 'website',
  },
};

export default function Guide() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Height Comparison Guide</h1>
      
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-6">Getting Started</h2>
          <div className="prose prose-lg">
            <p>Welcome to Heights Compare! This guide will help you make the most of our height comparison tools.</p>
            <ol className="list-decimal ml-6 space-y-4">
              <li>Start by using the search bar at the top of the page</li>
              <li>Enter the name of the person you want to compare</li>
              <li>Select from the dropdown suggestions</li>
              <li>Add another person to compare heights</li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Understanding Visualizations</h2>
          <div className="prose prose-lg">
            <p>Our height comparisons include several visualization options:</p>
            <ul className="list-disc ml-6 space-y-3">
              <li><strong>Side-by-side comparison:</strong> Direct visual comparison of heights</li>
              <li><strong>Height difference:</strong> Exact difference in various units</li>
              <li><strong>Relative scale:</strong> Perspective view with common objects</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Advanced Features</h2>
          <div className="prose prose-lg">
            <h3 className="text-xl font-semibold mb-4">Multiple Comparisons</h3>
            <p>You can compare multiple people at once:</p>
            <ul className="list-disc ml-6 space-y-3">
              <li>Add up to 5 people in one comparison</li>
              <li>Sort by height automatically</li>
              <li>Save comparisons for later reference</li>
            </ul>

            <h3 className="text-xl font-semibold mb-4 mt-8">Unit Conversion</h3>
            <p>Switch between different measurement units:</p>
            <ul className="list-disc ml-6 space-y-3">
              <li>Feet and inches</li>
              <li>Centimeters</li>
              <li>Meters</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Tips for Accurate Comparisons</h2>
          <div className="prose prose-lg">
            <ul className="list-disc ml-6 space-y-3">
              <li>Use the most recent height data available</li>
              <li>Consider the source of height information</li>
              <li>Check multiple comparisons for consistency</li>
              <li>Read the notes and sources provided with each height entry</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
} 