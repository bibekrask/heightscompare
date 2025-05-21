import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Heights Compare',
  description: 'Find answers to common questions about Heights Compare - Learn how to use our height comparison tool and understand our data sources.',
  openGraph: {
    title: 'Frequently Asked Questions | Heights Compare',
    description: 'Find answers to common questions about Heights Compare - Learn how to use our height comparison tool and understand our data sources.',
    url: 'https://www.heightscompare.com/faq',
    siteName: 'Heights Compare',
    type: 'website',
  },
};

export default function FAQ() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">How accurate are the height measurements?</h2>
          <p className="text-lg">We gather height information from multiple reliable sources, including official records, athlete profiles, and verified public data. While we strive for accuracy, some heights may be approximate.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How can I request a height comparison?</h2>
          <p className="text-lg">You can use our search feature to find and compare heights of celebrities, athletes, and public figures. If you can't find someone specific, you can contact us to request an addition.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Where does the height data come from?</h2>
          <p className="text-lg">Our height data comes from various verified sources, including:
            <ul className="list-disc ml-6 mt-2">
              <li>Official sports records</li>
              <li>Verified celebrity profiles</li>
              <li>Public records</li>
              <li>Reliable media sources</li>
            </ul>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Can I contribute height information?</h2>
          <p className="text-lg">While we appreciate user contributions, we verify all height information before adding it to our database to maintain accuracy. You can submit height information through our contact page.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How often is the data updated?</h2>
          <p className="text-lg">We regularly update our database to ensure accuracy and add new entries. Updates occur as new verified information becomes available.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Is Heights Compare free to use?</h2>
          <p className="text-lg">Yes, Heights Compare is completely free to use. We aim to provide accessible height comparison information to everyone.</p>
        </section>
      </div>
    </main>
  );
} 