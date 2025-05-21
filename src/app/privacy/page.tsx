import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Heights Compare',
  description: 'Learn about how Heights Compare handles and protects your personal information. Our privacy policy explains our data collection and usage practices.',
  openGraph: {
    title: 'Privacy Policy | Heights Compare',
    description: 'Learn about how Heights Compare handles and protects your personal information. Our privacy policy explains our data collection and usage practices.',
    url: 'https://www.heightscompare.com/privacy',
    siteName: 'Heights Compare',
    type: 'website',
  },
};

export default function Privacy() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="mt-4">We automatically collect certain information about your device, including:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Device information</li>
            <li>Usage statistics</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Provide and improve our height comparison service</li>
            <li>Respond to your inquiries and requests</li>
            <li>Monitor and analyze usage patterns</li>
            <li>Protect against fraudulent or unauthorized activity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar tracking technologies to:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Remember your preferences</li>
            <li>Analyze how you use our website</li>
            <li>Improve user experience</li>
            <li>Provide relevant content</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p>We implement appropriate security measures to protect your information, including:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Encryption of data in transit</li>
            <li>Regular security assessments</li>
            <li>Limited access to personal information</li>
            <li>Secure data storage practices</li>
          </ul>
        </section>


        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Changes to Privacy Policy</h2>
          <p>This privacy policy may be updated from time to time.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
          <p>If you have any questions about this privacy policy, please contact us through our <a href="/contact" className="text-blue-600 hover:underline">contact form</a>.</p>
        </section>

        <section className="mt-12 text-sm text-gray-600">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </section>
      </div>
    </main>
  );
} 