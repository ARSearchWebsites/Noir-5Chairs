import React from 'react';

interface ProductWithSrc {
  src: string;
}

interface VideoSectionProps {
  product: ProductWithSrc;
}

const VideoSection: React.FC<VideoSectionProps> = ({ product }) => (
  <section className="mt-8 flex justify-center">
    <iframe
      title="3D Model"
      src={product.src}
      allow="autoplay; fullscreen; xr-spatial-tracking"
      allowFullScreen
      className="w-[300px] h-[250px] sm:w-[800px] sm:h-[480px]"
      frameBorder={0}
    />
  </section>
);

export default VideoSection;