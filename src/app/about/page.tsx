import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Height Comparison Tool | Visual Height Comparison',
  description: 'Learn about our free height comparison tool. Compare heights visually with accurate measurements in centimeters and feet/inches. Perfect for comparing people, celebrities, and objects.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About Height Comparison Tool</h1>
      
      <section className="prose dark:prose-invert max-w-none">
        <h2>What is Height Comparison Tool?</h2>
        <p>
          Height Comparison Tool is a free, user-friendly web application designed to help you visualize 
          and compare heights easily. Whether you&apos;re curious about celebrity heights, need to compare 
          different people&apos;s heights, or want to understand height differences visually, our tool makes 
          it simple and intuitive.
        </p>

        <h2>Key Features</h2>
        <ul>
          <li>Visual height comparison with accurate measurements</li>
          <li>Support for both metric (cm) and imperial (feet/inches) units</li>
          <li>Customizable silhouettes with different colors</li>
          <li>Drag-and-drop interface for easy comparison</li>
          <li>Save and share your comparisons</li>
          <li>Mobile-friendly design</li>
        </ul>

        <h2>How It Works</h2>
        <p>
          Our tool uses a simple yet powerful interface that allows you to:
        </p>
        <ol>
          <li>Add people or objects to compare using our silhouette library or upload your own images</li>
          <li>Input heights in your preferred unit (cm or feet/inches)</li>
          <li>Customize appearances with different colors</li>
          <li>Drag and adjust positions for perfect alignment</li>
          <li>Share your comparisons with others</li>
        </ol>

        <h2>Why Use Height Comparison Tool?</h2>
        <p>
          Understanding height differences can be challenging when dealing with numbers alone. Our visual 
          approach makes it easy to:
        </p>
        <ul>
          <li>Visualize height differences instantly</li>
          <li>Compare multiple heights simultaneously</li>
          <li>Convert between different measurement units</li>
          <li>Create accurate visual references</li>
          <li>Share comparisons with others</li>
        </ul>

        <h2>Who Can Use It?</h2>
        <p>
          Our tool is perfect for:
        </p>
        <ul>
          <li>Anyone curious about height comparisons</li>
          <li>Teachers and educators</li>
          <li>Sports enthusiasts</li>
          <li>Casting directors and talent scouts</li>
          <li>Medical professionals</li>
          <li>Interior designers and architects</li>
        </ul>

        <h2>Privacy and Data Security</h2>
        <p>
          We take your privacy seriously. Any images you upload are processed in your browser and are not 
          stored on our servers. We don&apos;t collect any personal information unless explicitly provided.
        </p>

        <h2>Contact Us</h2>
        <p>
          Have questions or suggestions? We&apos;d love to hear from you! Contact us at{' '}
          <a href="mailto:contact@heightcomparison.com" className="text-blue-500 hover:text-blue-600">
            contact@heightcomparison.com
          </a>
        </p>
      </section>
    </div>
  );
} 