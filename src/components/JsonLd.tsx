export default function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Height Comparison Tool",
    "description": "Free online height comparison tool. Compare heights of people, celebrities, and objects visually with accurate measurements in cm and feet/inches.",
    "url": "https://www.heightscompare.com",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Visual height comparison",
      "Real-time measurements",
      "Multiple unit support (cm, feet, inches)",
      "Customizable silhouettes",
      "Drag and drop interface",
      "Celebrity height database",
      "Mobile responsive design"
    ],
    "author": {
      "@type": "Organization",
      "name": "HeightsCompare.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "HeightsCompare.com",
      "url": "https://www.heightscompare.com"
    },
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString(),
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "usageInfo": "https://www.heightscompare.com/terms",
    "privacyPolicy": "https://www.heightscompare.com/privacy"
  };

  // Add FAQ structured data
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How accurate is the height comparison tool?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our height comparison tool provides accurate visual representations based on the heights you input. The tool uses precise mathematical calculations to ensure proportional accuracy."
        }
      },
      {
        "@type": "Question", 
        "name": "Can I compare more than two people at once?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! You can add up to 50 people in a single comparison to see how multiple heights stack up against each other."
        }
      },
      {
        "@type": "Question",
        "name": "Does the tool work on mobile devices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! Our height comparison tool is fully responsive and works perfectly on smartphones, tablets, and desktop computers."
        }
      },
      {
        "@type": "Question",
        "name": "Can I upload custom images for comparison?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, you can upload custom images of people or objects to compare alongside the default silhouettes."
        }
      },
      {
        "@type": "Question",
        "name": "What units of measurement are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The tool supports both metric (centimeters) and imperial (feet and inches) units. You can easily switch between them."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  );
} 