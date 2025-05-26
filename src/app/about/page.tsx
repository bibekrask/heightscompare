import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - Height Comparison Tool | Free Online Height Calculator',
  description: 'Learn about our free height comparison tool. Discover how we help millions compare heights visually with accurate measurements, custom images, and easy-to-use interface.',
  keywords: 'about height comparison tool, height calculator information, visual height comparison, height measurement tool, free height comparer',
  openGraph: {
    title: 'About - Height Comparison Tool | Free Online Height Calculator',
    description: 'Learn about our free height comparison tool. Discover how we help millions compare heights visually with accurate measurements, custom images, and easy-to-use interface.',
    url: 'https://www.heightscompare.com/about',
    siteName: 'Heights Compare',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.heightscompare.com/about',
  },
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        About Heights Compare
      </h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Our Mission</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Heights Compare is dedicated to providing the most accurate, user-friendly, and accessible 
            height comparison tool on the internet. We believe that understanding height differences 
            should be visual, intuitive, and available to everyone, completely free of charge.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Whether you&apos;re comparing celebrity heights, planning a group photo, understanding sports 
            statistics, or simply satisfying your curiosity, our tool makes height visualization 
            simple and engaging.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">What Makes Us Different</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
                🎯 Visual Clarity
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                Our tool provides clear visual representations that help you understand height differences 
                at a glance. Easy-to-use interface with proportional scaling.
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-green-900 dark:text-green-100">
                🌍 Universal Access
              </h3>
              <p className="text-green-800 dark:text-green-200">
                No registration, no downloads, no fees. Our tool works instantly in any web browser 
                and supports both metric and imperial measurement systems.
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-purple-900 dark:text-purple-100">
                📱 Mobile-First Design
              </h3>
              <p className="text-purple-800 dark:text-purple-200">
                Designed from the ground up to work perfectly on smartphones, tablets, and desktops. 
                Compare heights anywhere, anytime.
              </p>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-orange-900 dark:text-orange-100">
                🎨 Customization Options
              </h3>
              <p className="text-orange-800 dark:text-orange-200">
                Upload custom images, choose colors, adjust positioning, and create comparisons 
                that are uniquely yours.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">What We Offer</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Visual Height Comparison
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Our intuitive visualization tools help you understand height differences at a glance. 
                See exactly how people stack up against each other with proportionally accurate silhouettes.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Multiple Unit Support
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Seamlessly switch between metric (centimeters) and imperial (feet/inches) measurements. 
                Our tool automatically converts between units for easy comparison.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Custom Image Upload
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Go beyond silhouettes by uploading your own photos. Perfect for comparing yourself 
                with celebrities, friends, or family members using actual images.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                Advanced Positioning Controls
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Fine-tune your comparisons with drag-and-drop positioning, vertical alignment controls, 
                and zoom functionality for the perfect view.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">How It Works</h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Using Heights Compare is simple and intuitive:
            </p>
            <ol className="list-decimal ml-6 space-y-3 text-gray-700 dark:text-gray-300">
              <li>Add people by entering their names and heights</li>
              <li>Choose between male/female silhouettes or upload custom images</li>
              <li>Customize colors and positioning for the best visual comparison</li>
              <li>View the accurate, proportional height differences instantly</li>
              <li>Share your comparisons or save them for later</li>
            </ol>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Popular Use Cases</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Celebrity Comparisons</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Compare your favorite celebrities, actors, and public figures
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚽</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Sports Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Analyze athlete heights across different sports and positions
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Family & Friends</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Create fun family comparisons and see how everyone measures up
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Get in Touch</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Have questions, suggestions, or feedback? We&apos;d love to hear from you! Our team is 
            committed to making Heights Compare the best height comparison tool available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </a>
            <a 
              href="/faq" 
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              View FAQ
            </a>
          </div>
        </section>
      </div>
    </main>
  );
} 