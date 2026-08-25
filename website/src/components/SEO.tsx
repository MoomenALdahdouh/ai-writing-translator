import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
  ogType?: string
}

export default function SEO({ 
  title = 'Lingo — Write naturally. Translate instantly.',
  description = 'Write in the language you think in. Lingo translates your text directly where you type.',
  canonical,
  ogImage,
  ogType = 'website'
}: SEOProps) {
  const location = useLocation()
  const url = canonical || `https://lingo.zaixos.com${location.pathname}`

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:site_name" content="Lingo" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  )
}
