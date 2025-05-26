'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(path => path);

  const breadcrumbs = paths.map((path, index) => {
    const href = '/' + paths.slice(0, index + 1).join('/');
    const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
    const isLast = index === paths.length - 1;

    return {
      href,
      label,
      isLast
    };
  });

  if (paths.length === 0) return null;

  // Create structured data for breadcrumbs
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.heightscompare.com"
      },
      ...breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": crumb.label,
        "item": `https://www.heightscompare.com${crumb.href}`
      }))
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <nav aria-label="Breadcrumb" className="px-4 py-2 bg-gray-50 dark:bg-gray-800">
        <ol className="flex space-x-2 text-sm">
          <li>
            <Link 
              href="/"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Home
            </Link>
          </li>
          {breadcrumbs.map(({ href, label, isLast }) => (
            <li key={href} className="flex items-center space-x-2">
              <span className="text-gray-400">/</span>
              {isLast ? (
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
} 