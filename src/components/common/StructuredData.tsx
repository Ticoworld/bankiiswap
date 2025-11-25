export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://bankiiswap.com/#organization",
        "name": "BankiiSwap",
        "url": "https://bankiiswap.com/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bankiiswap.com/assets/logos/bankii-logo.jpg",
          "width": 200,
          "height": 200
        },
        "description": "Swap $BKP and Solana tokens with best rates via Jupiter aggregator",
        "foundingDate": "2025",
        "sameAs": [
          "https://twitter.com/BankiiFinance",
          "https://bankii.finance"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://bankiiswap.com/#website",
        "url": "https://bankiiswap.com/",
        "name": "BankiiSwap",
        "description": "Swap $BKP & Solana tokens. Part of Bankii Finance ecosystem.",
        "publisher": {
          "@id": "https://bankiiswap.com/#organization"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://bankiiswap.com/swap?search={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "WebApplication",
        "@id": "https://bankiiswap.com/#webapp",
        "name": "BankiiSwap DEX",
        "url": "https://bankiiswap.com/swap",
        "description": "Solana DEX aggregator powered by Jupiter Protocol. Trade BKP and Solana tokens.",
        "applicationCategory": "DeFi",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "DEX aggregation",
          "Best swap rates",
          "BKP token utility",
          "Solana blockchain",
          "Jupiter Protocol integration",
          "Bankii Finance ecosystem"
        ]
      },
      {
        "@type": "Article",
        "@id": "https://bankiiswap.com/#article",
        "headline": "BankiiSwap - Swap BKP & Solana Tokens",
        "description": "Best rates for $BKP swaps via Jupiter aggregator. Part of Bankii Finance crypto banking ecosystem.",
        "author": {
          "@id": "https://bankiiswap.com/#organization"
        },
        "publisher": {
          "@id": "https://bankiiswap.com/#organization"
        },
        "mainEntityOfPage": {
          "@id": "https://bankiiswap.com/#website"
        },
        "datePublished": "2025-01-01",
        "dateModified": "2025-11-04",
        "image": {
          "@type": "ImageObject",
          "url": "https://bankiiswap.com/assets/logos/bankii-logo.jpg",
          "width": 1200,
          "height": 630
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://bankiiswap.com/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://bankiiswap.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Swap",
            "item": "https://bankiiswap.com/swap"
          }
        ]
      }
    ]
  };

  // 🔒 SECURITY: Sanitize JSON data before rendering to prevent XSS
  const sanitizeJsonLd = (data: any): string => {
    // Validate that all URLs are safe
    const isValidUrl = (url: string): boolean => {
      try {
        const urlObj = new URL(url);
        return ['https:', 'http:'].includes(urlObj.protocol);
      } catch {
        return false;
      }
    };

    // Recursively sanitize object
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        if (obj.startsWith('http') && !isValidUrl(obj)) {
          throw new Error('Invalid URL detected in structured data');
        }
        // Escape potential script tags and remove dangerous characters
        return obj.replace(/<script[^>]*>/gi, '').replace(/<\/script>/gi, '');
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
      }
      return obj;
    };

    const sanitizedData = sanitizeObject(data);
    return JSON.stringify(sanitizedData);
  };

  const jsonLdContent = sanitizeJsonLd(structuredData);

  return (
    <script
      type="application/ld+json"
      // 🔒 SECURITY: Use sanitized JSON instead of direct dangerouslySetInnerHTML
      dangerouslySetInnerHTML={{ __html: jsonLdContent }}
    />
  );
}
