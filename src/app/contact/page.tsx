import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us - Height Comparison Tool | Get Help & Support',
  description: 'Contact our support team for help with the height comparison tool. Get answers to your questions, report issues, or suggest new features.',
  keywords: 'contact height comparison tool, height tool support, height calculator help, customer service, technical support',
  openGraph: {
    title: 'Contact Us - Height Comparison Tool | Get Help & Support',
    description: 'Contact our support team for help with the height comparison tool. Get answers to your questions, report issues, or suggest new features.',
    url: 'https://www.heightscompare.com/contact',
    siteName: 'Heights Compare',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.heightscompare.com/contact',
  },
};

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Contact Us
      </h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          We&apos;d love to hear from you! Whether you have questions, feedback, or need help with our 
          height comparison tool, our team is here to assist you.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <section className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
              📧 Email Support
            </h2>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              For general inquiries, technical support, or feature requests:
            </p>
            <a 
              href="mailto:heightscompare@gmail.com" 
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              heightscompare@gmail.com
            </a>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
              We typically respond within 24 hours
            </p>
          </section>

          <section className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-green-900 dark:text-green-100">
              🐛 Bug Reports & Feedback
            </h2>
            <p className="text-green-800 dark:text-green-200 mb-4">
              Found a bug or have feedback? Help us improve:
            </p>
            <a 
              href="mailto:heightscompare@gmail.com" 
              className="text-green-600 dark:text-green-400 hover:underline font-medium"
            >
              heightscompare@gmail.com
            </a>
            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
              Please include details about your device and browser
            </p>
          </section>
        </div>

        <ContactForm />

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Before reaching out, you might find your answer in our comprehensive FAQ section:
          </p>
          <a 
            href="/faq" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View FAQ
          </a>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            What to Include in Your Message
          </h2>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 mb-4">
              To help us assist you better, please include:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-yellow-800 dark:text-yellow-200">
              <li>A clear description of your question or issue</li>
              <li>Your device type (smartphone, tablet, desktop)</li>
              <li>Your browser name and version</li>
              <li>Steps to reproduce any problems you&apos;re experiencing</li>
              <li>Screenshots if applicable</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
            Feature Requests & Suggestions
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Have an idea for improving our height comparison tool? We love hearing from our users! 
            Your feedback helps us prioritize new features and improvements.
          </p>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-purple-900 dark:text-purple-100">
              💡 Popular Feature Requests
            </h3>
            <ul className="list-disc ml-6 space-y-2 text-purple-800 dark:text-purple-200">
              <li>Celebrity height database</li>
              <li>Comparison sharing and embedding</li>
              <li>Height statistics and analytics</li>
              <li>Mobile app versions</li>
              <li>Additional measurement units</li>
            </ul>
          </div>
        </section>

        <section className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Other Ways to Get Help
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                📖 User Guide
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Step-by-step instructions for using all features of the height comparison tool.
              </p>
              <a 
                href="/guide" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View User Guide →
              </a>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                ❓ FAQ Section
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Answers to the most commonly asked questions about our tool.
              </p>
              <a 
                href="/faq" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Browse FAQ →
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
} 