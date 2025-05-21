import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Heights Compare',
  description: 'Get in touch with Heights Compare - Contact us for questions, suggestions, or corrections about height comparisons.',
  openGraph: {
    title: 'Contact Us | Heights Compare',
    description: 'Get in touch with Heights Compare - Contact us for questions, suggestions, or corrections about height comparisons.',
    url: 'https://www.heightscompare.com/contact',
    siteName: 'Heights Compare',
    type: 'website',
  },
};

export default function Contact() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a subject</option>
              <option value="general">General Inquiry</option>
              <option value="correction">Height Correction</option>
              <option value="suggestion">Suggestion</option>
              <option value="bug">Report a Bug</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your message..."
              required
            ></textarea>
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 