import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Blog - Height Comparison Tool | Latest Updates & Articles',
  description: 'Read the latest articles and updates about height comparison, measurement tools, and interesting height-related content. Stay informed with our expert insights.',
  keywords: 'height comparison blog, height measurement articles, height tool updates, height comparison news, height-related content',
  openGraph: {
    title: 'Blog - Height Comparison Tool | Latest Updates & Articles',
    description: 'Read the latest articles and updates about height comparison, measurement tools, and interesting height-related content. Stay informed with our expert insights.',
    url: 'https://www.heightscompare.com/blog',
    siteName: 'Heights Compare',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.heightscompare.com/blog',
  },
};

export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Blog
      </h1>
      
      <div className="grid gap-8">
        {/* Featured Post */}
        <article className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Image Section */}
          <div className="md:w-1/2 w-full relative aspect-[16/9] md:aspect-auto min-h-[220px] bg-white flex items-center justify-center">
            <Image
              src="/images/superheroes/Superheroesheightscompare.jpg"
              alt="Marvel Superheroes Height Comparison"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {/* Content Section */}
          <div className="md:w-1/2 w-full p-6 flex flex-col justify-between">
            <div>
              <span className="inline-block bg-pink-100 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full mb-2">Blog</span>
              <h2 className="text-2xl font-bold mb-2">Marvel Superheroes Height Comparison: Who Stands Tallest?</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Discover the heights of your favorite Marvel superheroes! From Iron Man to Thor, 
                Hulk to Spider-Man - compare their heights and learn fascinating facts about their 
                physical attributes.
              </p>
              <Link
                href="/blog/marvel-superheroes-height-comparison"
                className="text-blue-600 font-semibold hover:underline"
              >
                Continue Reading &rarr;
              </Link>
            </div>
            <div className="flex items-center mt-4">
              <Image
                src="/images/avatars/your-avatar.png" // Replace with your avatar path or a placeholder
                alt="heightscomparechart"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="ml-2 text-gray-700 text-sm">heightscomparechart</span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-400 text-sm">June 7, 2025</span>
            </div>
          </div>
        </article>

        {/* Recent Posts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Post 1 */}
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
              {/* Add image here */}
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                March 10, 2024
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                The Science Behind Height Measurements
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Discover the fascinating science behind accurate height measurements and how modern tools make it easier than ever.
              </p>
              <Link
                href="#"
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                Read more →
              </Link>
            </div>
          </article>

          {/* Post 2 */}
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
              {/* Add image here */}
            </div>
            <div className="p-6">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                March 5, 2024
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Celebrity Height Comparisons: Fact vs Fiction
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Explore the truth behind celebrity height claims and how to get accurate comparisons using our tool.
              </p>
              <Link
                href="#"
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                Read more →
              </Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}