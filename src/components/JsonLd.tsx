export default function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Height Comparison Tool",
    "description": "Free online height comparison tool. Compare heights of people, celebrities, and objects visually with accurate measurements in cm and feet/inches.",
    "url": "https://www.heightscompare.com",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
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
      "Drag and drop interface"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
} 