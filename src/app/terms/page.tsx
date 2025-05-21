import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | Heights Compare',
  description: 'Terms and conditions for using Heights Compare - your go-to platform for height comparisons.',
  openGraph: {
    title: 'Terms and Conditions | Heights Compare',
    description: 'Terms and conditions for using Heights Compare - your go-to platform for height comparisons.',
    url: 'https://www.heightscompare.com/terms',
    siteName: 'Heights Compare',
    type: 'website',
  },
};

export default function Terms() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
      
      <section className="prose prose-lg">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p>By accessing and using Heights Compare, you agree to be bound by these terms and conditions.</p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">2. Use of Service</h2>
        <p>Heights Compare provides a platform for comparing heights of various celebrities, athletes, and public figures. The information provided is for entertainment and reference purposes only.</p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">3. User Conduct</h2>
        <p>Users must not misuse the service or engage in any activity that could harm the platform or other users.</p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">4. Privacy</h2>
        <p>Your use of Heights Compare is also governed by our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>. Please review our privacy policy to understand how we collect, use, and protect your information.</p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">5. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.</p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">6. Contact</h2>
        <p>For any questions regarding these terms, please contact us through our contact page.</p>
      </section>
    </main>
  );
} 