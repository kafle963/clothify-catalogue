import React, { useEffect } from 'react';

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const Meta: React.FC<MetaProps> = ({
  title = 'Clothify - Premium Fashion for Modern Lifestyle',
  description = 'Discover premium clothing and accessories at Clothify. Shop the latest trends in fashion with our curated collection of high-quality apparel for men, women, and kids.',
  keywords = 'fashion, clothing, apparel, premium, modern, style, trends, men, women, kids, accessories'
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta description
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
    
    // Update meta keywords
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) {
      keywordsMeta.setAttribute('content', keywords);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = keywords;
      document.head.appendChild(meta);
    }
  }, [title, description, keywords]);

  return null; // This component doesn't render anything
};

export default Meta;