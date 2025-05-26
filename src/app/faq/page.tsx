import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Height Comparison Tool | Frequently Asked Questions',
  description: 'Find answers to common questions about our height comparison tool. Learn how to use the tool, understand measurements, and get the most accurate comparisons.',
  keywords: 'height comparison FAQ, height tool questions, how to compare heights, height measurement help, height calculator guide',
  openGraph: {
    title: 'FAQ - Height Comparison Tool | Frequently Asked Questions',
    description: 'Find answers to common questions about our height comparison tool. Learn how to use the tool, understand measurements, and get the most accurate comparisons.',
    url: 'https://www.heightscompare.com/faq',
    siteName: 'Heights Compare',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.heightscompare.com/faq',
  },
};

export default function FAQPage() {
  const faqs = [
    {
      question: "How accurate is the height comparison tool?",
      answer: "Our height comparison tool provides accurate visual representations based on the heights you input. The tool uses precise mathematical calculations to ensure proportional accuracy. The visual scaling is mathematically correct, showing true height differences between people."
    },
    {
      question: "Can I compare more than two people at once?",
      answer: "Yes! You can add up to 50 people in a single comparison to see how multiple heights stack up against each other. This makes it perfect for comparing groups, teams, or families."
    },
    {
      question: "Does the tool work on mobile devices?",
      answer: "Absolutely! Our height comparison tool is fully responsive and works perfectly on smartphones, tablets, and desktop computers. The interface adapts to your screen size for the best experience."
    },
    {
      question: "Can I upload custom images for comparison?",
      answer: "Yes, you can upload custom images of people or objects to compare alongside the default silhouettes. The tool will maintain proper proportions based on the heights you specify."
    },
    {
      question: "What units of measurement are supported?",
      answer: "The tool supports both metric (centimeters) and imperial (feet and inches) units. You can easily switch between them, and the tool will automatically convert measurements for accurate comparisons."
    },
    {
      question: "Is the height comparison tool free to use?",
      answer: "Yes, our height comparison tool is completely free to use with no registration required. You can create unlimited comparisons and use all features without any cost."
    },
    {
      question: "How do I adjust the position of silhouettes?",
      answer: "You can drag and drop silhouettes to position them anywhere on the comparison area. There are also vertical adjustment controls in the editing panel to fine-tune positioning for accurate ground-level alignment."
    },
    {
      question: "Can I save my height comparisons?",
      answer: "Your comparisons are automatically saved in your browser's local storage, so they'll be there when you return. For permanent saving or sharing, you can use the share feature to create a link to your comparison."
    },
    {
      question: "How do I convert between feet/inches and centimeters?",
      answer: "The tool automatically handles conversions between metric and imperial units. Simply toggle between 'ft/in' and 'cm' modes, and the measurements will be converted accurately in real-time."
    },
    {
      question: "What's the maximum height I can enter?",
      answer: "There's no strict maximum height limit, but the tool is optimized for human heights typically ranging from 3 feet to 8 feet (90cm to 250cm). It can handle taller measurements for comparing with objects or very tall individuals."
    },
    {
      question: "Can I change the colors of the silhouettes?",
      answer: "Yes! Each silhouette can be customized with different colors from our color palette. This helps distinguish between different people in your comparison and makes it more visually appealing."
    },
    {
      question: "How do I delete a person from my comparison?",
      answer: "Click on a silhouette to select it, then click the edit button. In the editing panel, you'll find a delete button at the bottom. You can also use the 'Clear All' button to remove everyone at once."
    }
  ];

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Frequently Asked Questions
      </h1>
      
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Find answers to the most common questions about our height comparison tool. 
          If you can't find what you're looking for, feel free to{' '}
          <a href="/contact" className="text-blue-600 hover:underline">contact us</a>.
        </p>

        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                {faq.question}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Still Have Questions?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            If you couldn't find the answer you were looking for, we're here to help! 
            Our support team is ready to assist you with any questions about the height comparison tool.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
            <a 
              href="/guide" 
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              View User Guide
            </a>
          </div>
        </section>
      </div>
    </main>
  );
} 