import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Heights Compare',
  description: 'Learn about Heights Compare - The leading platform for comparing heights of celebrities, athletes, and public figures.',
  openGraph: {
    title: 'About | Heights Compare',
    description: 'Learn about Heights Compare - The leading platform for comparing heights of celebrities, athletes, and public figures.',
    url: 'https://www.heightscompare.com/about',
    siteName: 'Heights Compare',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">About Heights Compare</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p>
            Heights Compare is dedicated to providing accurate and reliable height comparisons 
            of celebrities, athletes, and public figures. We aim to be your go-to resource for 
            understanding and visualizing height differences in an engaging and intuitive way.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
          <ul className="list-disc ml-6 space-y-3">
            <li>
              <strong>Visual Representation:</strong> Our intuitive visualization tools help 
              you understand height differences at a glance.
            </li>
            <li>
              <strong>Multiple Units:</strong> View heights in both metric (cm) and 
              imperial (feet/inches) measurements.
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-4">
            <p>
              Using Heights Compare is simple:
            </p>
            <ol className="list-decimal ml-6 space-y-3">
              <li>Add silohuette or images of comparison entities</li>
              <li>Update their heights from the input fields</li>
              <li>View the visual comparison and exact height difference</li>
              <li>Explore additional comparisons and related figures</li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <p>
            Have questions or suggestions? We'd love to hear from you! Visit our{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              contact page
            </a>{' '}
            to get in touch with our team.
          </p>
        </section>
      </div>
    </main>
  );
} 