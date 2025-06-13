import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import BlogCard from '@/components/BlogCard';

export const metadata: Metadata = {
  title: 'Marvel Superheroes Height Comparison | Complete Guide & Analysis',
  description: 'Discover the heights of your favorite Marvel superheroes! From Iron Man to Thor, Hulk to Spider-Man - compare their heights and learn fascinating facts about their physical attributes.',
  keywords: 'marvel superheroes height, marvel characters height comparison, iron man height, thor height, hulk height, spider-man height, captain america height, marvel height chart, superhero height comparison, marvel height analysis',
  openGraph: {
    title: 'Marvel Superheroes Height Comparison | Complete Guide & Analysis',
    description: 'Discover the heights of your favorite Marvel superheroes! From Iron Man to Thor, Hulk to Spider-Man - compare their heights and learn fascinating facts about their physical attributes.',
    url: 'https://www.heightscompare.com/blog/marvel-superheroes-height-comparison',
    siteName: 'Heights Compare',
    type: 'article',
    publishedTime: '2024-03-15T00:00:00.000Z',
    modifiedTime: '2024-03-15T00:00:00.000Z',
    authors: ['Heights Compare Team'],
    tags: ['Marvel', 'Superheroes', 'Height Comparison', 'Comics', 'MCU'],
  },
  alternates: {
    canonical: 'https://www.heightscompare.com/blog/marvel-superheroes-height-comparison',
  },
};

export default function MarvelSuperheroesPost() {
  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Article Header */}
      <header className="mb-12">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          March 15, 2024 • 8 min read
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Marvel Superheroes Height Comparison: Who Stands Tallest?
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          A comprehensive analysis of Marvel superheroes' heights and how they compare to each other
        </p>
        
        {/* Updated Featured Image with correct path */}
        <div className="relative w-full aspect-video mb-12 rounded-lg overflow-hidden">
          <Image
            src="/images/superheroes/Superheroesheightscompare.jpg"
            alt="Marvel Superheroes Height Comparison Chart"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </header>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p className="lead mb-12">
          Have you ever wondered how your favorite Marvel superheroes stack up against each other? 
          From the towering Hulk to the agile Spider-Man, height plays a crucial role in how these 
          characters are portrayed both in comics and on screen. Let's dive into the fascinating 
          world of Marvel superhero heights!
        </p>

        {/* Comparison Table */}
        <div className="overflow-x-auto my-12">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hero Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Height (ft)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Height (cm)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Notable Features</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong>Hulk (Bruce Banner)</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">8'0"</td>
                <td className="px-6 py-4 whitespace-nowrap">243.8 cm</td>
                <td className="px-6 py-4">Varies with anger level</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong>Thanos</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">6'7"</td>
                <td className="px-6 py-4 whitespace-nowrap">201 cm</td>
                <td className="px-6 py-4">Mad Titan</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong>Thor</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">6'6"</td>
                <td className="px-6 py-4 whitespace-nowrap">198 cm</td>
                <td className="px-6 py-4">God of Thunder</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong>Colossus</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">6'6"</td>
                <td className="px-6 py-4 whitespace-nowrap">198 cm</td>
                <td className="px-6 py-4">Organic Steel Form</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong>Groot</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">7'6"</td>
                <td className="px-6 py-4 whitespace-nowrap">229 cm</td>
                <td className="px-6 py-4">Can grow taller</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong>Iron Man</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">6'1"</td>
                <td className="px-6 py-4 whitespace-nowrap">185 cm</td>
                <td className="px-6 py-4">Enhanced by suit</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong>Captain America</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">6'2"</td>
                <td className="px-6 py-4 whitespace-nowrap">188 cm</td>
                <td className="px-6 py-4">Super Soldier Serum</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong>Spider-Man</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">5'10"</td>
                <td className="px-6 py-4 whitespace-nowrap">178 cm</td>
                <td className="px-6 py-4">Enhanced agility</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold mb-8"><strong>Why Height is Important</strong></h2>
        <p className="mb-12">
          The height of a superhero tells us many things about their character and abilities. 
          Taller heroes often have more physical presence and can be more intimidating, while 
          shorter heroes might rely on speed and agility. Let's explore how height affects 
          different aspects of these characters.
        </p>

        <p className="text-xl font-semibold mb-8">Top 10 Tallest Marvel Superheroes</p>

        <div className="space-y-16 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-[300px] bg-white p-4">
                <Image
                  src="/images/superheroes/hulk.png"
                  alt="Hulk (Bruce Banner)"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <h3 className="text-2xl font-bold mb-4">1. <strong>Hulk (Bruce Banner)</strong></h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The Hulk is one of the tallest heroes in the Marvel Universe. When Bruce Banner 
                  transforms, he grows to an impressive 8 feet tall. His height varies depending on 
                  his level of anger, making him one of the most dynamic characters in terms of size.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Height: 8'0" (243.8 cm) | Notable: Height varies with anger level
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-[300px] bg-white">
                <Image
                  src="/images/superheroes/groot.png"
                  alt="Groot"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <h3 className="text-2xl font-bold mb-4">2. <strong>Groot</strong></h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The tree-like Guardian of the Galaxy stands at an impressive 7'6" in his base form. 
                  However, Groot's most remarkable feature is his ability to grow much taller when needed, 
                  making him one of the most versatile characters in terms of height.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Height: 7'6" (229 cm) | Notable: Can grow much taller
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-[300px] bg-white">
                <Image
                  src="/images/superheroes/thanos.png"
                  alt="Thanos"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <h3 className="text-2xl font-bold mb-4">3. <strong>Thanos</strong></h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The Mad Titan's imposing height of 6'7" adds to his intimidating presence as one of 
                  Marvel's most powerful villains. His height, combined with his massive build, makes 
                  him a formidable opponent for any hero.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Height: 6'7" (201 cm) | Notable: Mad Titan
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-[300px] bg-white">
                <Image
                  src="/images/superheroes/thor.png"
                  alt="Thor"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <h3 className="text-2xl font-bold mb-4">4. <strong>Thor</strong></h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  As the God of Thunder, Thor stands at an imposing 6'6". His height reflects his 
                  divine heritage and warrior status. In the MCU, Chris Hemsworth's natural height 
                  of 6'3" is often enhanced with camera angles and special effects.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Height: 6'6" (198 cm) | Notable: God of Thunder
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-[300px] bg-white">
                <Image
                  src="/images/superheroes/Colossus.png"
                  alt="Colossus"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <h3 className="text-2xl font-bold mb-4">5. <strong>Colossus</strong></h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  In his armored form, Colossus stands at 6'6", making him one of the tallest X-Men. 
                  His organic steel form not only increases his height but also his overall mass and 
                  strength, making him a formidable opponent.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Height: 6'6" (198 cm) | Notable: Organic Steel Form
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-[300px] bg-white">
                <Image
                  src="/images/superheroes/ironman.png"
                  alt="Iron Man"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <h3 className="text-2xl font-bold mb-4">6. <strong>Iron Man</strong></h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Tony Stark stands at 6'1", but his height is often enhanced by the various Iron Man 
                  suits. The suits can add several inches to his height, making him appear more 
                  imposing in battle.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Height: 6'1" (185 cm) | Notable: Enhanced by suit
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-[300px] bg-white">
                <Image
                  src="/images/superheroes/captainamerica.png"
                  alt="Captain America"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <h3 className="text-2xl font-bold mb-4">7. <strong>Captain America</strong></h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Steve Rogers stands at 6'2" after the Super Soldier Serum enhanced his original 
                  height of 5'4". His height, combined with his enhanced physique, makes him the 
                  perfect symbol of American strength and determination.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Height: 6'2" (188 cm) | Notable: Super Soldier Serum
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-[300px] bg-white">
                <Image
                  src="/images/superheroes/spiderman.png"
                  alt="Spider-Man"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <h3 className="text-2xl font-bold mb-4">8. <strong>Spider-Man</strong></h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Peter Parker's height of 5'10" is perfect for his acrobatic fighting style. His 
                  relatively average height allows him to move quickly and efficiently through urban 
                  environments, making him one of the most agile heroes.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Height: 5'10" (178 cm) | Notable: Enhanced agility
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-[300px] bg-white">
                <Image
                  src="/images/superheroes/blackwidow.png"
                  alt="Black Widow"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <h3 className="text-2xl font-bold mb-4">9. <strong>Black Widow</strong></h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Natasha Romanoff stands at 5'7", a height that allows for perfect balance of agility 
                  and strength. Her relatively smaller stature compared to other heroes makes her 
                  combat style even more impressive.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Height: 5'7" (170 cm) | Notable: Master spy and assassin
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-[300px] bg-white">
                <Image
                  src="/images/superheroes/antman.png"
                  alt="Ant-Man"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 md:w-2/3">
                <h3 className="text-2xl font-bold mb-4">10. <strong>Ant-Man</strong></h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Scott Lang stands at 5'11" in his normal form, but his ability to change size makes 
                  him one of the most versatile heroes in terms of height. He can shrink to the size 
                  of an ant or grow to be larger than most buildings.
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Height: 5'11" (180 cm) | Notable: Size-changing abilities
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-8"><strong>Fun Facts</strong></h2>
        <div className="space-y-6 mb-16">
          <div className="flex items-start">
            <span className="text-red-600 dark:text-red-400 text-xl mr-3">•</span>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Hulk:</strong> The Hulk's height can vary between 7-8 feet depending on his anger level, making him one of the most dynamic characters in terms of size.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-red-600 dark:text-red-400 text-xl mr-3">•</span>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Captain America:</strong> Steve Rogers' height was enhanced from 5'4" to 6'2" by the Super Soldier Serum, making him the perfect physical specimen.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-red-600 dark:text-red-400 text-xl mr-3">•</span>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Groot:</strong> Can grow much taller than his base height of 7'6", making him one of the most versatile characters in terms of size.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-red-600 dark:text-red-400 text-xl mr-3">•</span>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Thanos:</strong> The Mad Titan's height of 6'7" makes him one of the most intimidating villains in the MCU, towering over most heroes.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-red-600 dark:text-red-400 text-xl mr-3">•</span>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Thor:</strong> Chris Hemsworth's natural height of 6'3" is enhanced with camera angles and special effects to match Thor's comic book height of 6'6".
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-red-600 dark:text-red-400 text-xl mr-3">•</span>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Iron Man:</strong> Tony Stark's various suits can add several inches to his height, making him appear more imposing in battle.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-red-600 dark:text-red-400 text-xl mr-3">•</span>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Spider-Man:</strong> Peter Parker's relatively average height of 5'10" is perfect for his acrobatic fighting style and urban navigation.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-red-600 dark:text-red-400 text-xl mr-3">•</span>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Black Widow:</strong> Natasha Romanoff's height of 5'7" allows for perfect balance of agility and strength in combat.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-red-600 dark:text-red-400 text-xl mr-3">•</span>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Ant-Man:</strong> Scott Lang's ability to change size makes him unique, as he can be both the smallest and potentially the tallest hero.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-red-600 dark:text-red-400 text-xl mr-3">•</span>
            <p className="text-gray-600 dark:text-gray-300">
              <strong>Colossus:</strong> His organic steel form not only increases his height to 6'6" but also his overall mass and strength.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-8">Compare Your Height</h2>
        <p className="mb-8">
          Want to see how you measure up against your favorite Marvel superheroes? Use our 
          height comparison tool to visualize the differences and create your own comparisons!
        </p>

        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-lg my-12">
          <h3 className="text-xl font-semibold mb-6 text-red-900 dark:text-red-100">
            Try Our Height Comparison Tool
          </h3>
          <p className="text-red-800 dark:text-red-200 mb-6">
            Create your own Marvel superhero height comparisons with our easy-to-use tool. 
            Compare multiple characters at once and see the height differences visually.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Compare Heights Now
          </Link>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 my-12 pt-8">
          <h3 className="text-xl font-semibold mb-6">Share This Article</h3>
          <div className="flex space-x-6">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Share on Twitter
            </button>
            <button className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors">
              Share on Facebook
            </button>
          </div>
        </div>
      </div>
    </article>
  );
} 