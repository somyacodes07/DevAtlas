import React from 'react';

interface JsonLdProps {
  type?: 'website' | 'jobs' | 'article';
  data?: Record<string, unknown>;
}

export function JsonLd({ type = 'website', data }: JsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://devatlas.pages.dev';

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'DevAtlas',
        description: 'Autonomous Developer Intelligence Platform & Real-Time Engineering Radar',
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/explore?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${baseUrl}/#software`,
        name: 'DevAtlas',
        operatingSystem: 'Any',
        applicationCategory: 'DeveloperApplication',
        description: 'Autonomous ecosystem discovery, AI scoring, and CI/CD developer intelligence.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'DevAtlas Engineering',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/icon.svg`,
        },
      },
    ],
  };

  const schemaToRender = data ? { '@context': 'https://schema.org', ...data } : websiteSchema;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaToRender) }}
    />
  );
}
