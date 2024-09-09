import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface FeatureCardProps {
  title: string;
  description: string;
  imageSrc: string;
  href: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, imageSrc, href }) => {
  return (
    <Link href={href} className="relative overflow-hidden rounded-lg h-64 block">
      <div className="absolute inset-0">
        <Image 
          src={imageSrc} 
          alt={title} 
          layout="fill" 
          objectFit="cover"
          className="transition-transform duration-300 hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent">
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-sm">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default FeatureCard;