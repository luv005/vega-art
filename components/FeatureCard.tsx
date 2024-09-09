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
    <Link href={href} className="block relative overflow-hidden rounded-lg h-64 transition-transform duration-300 hover:scale-105">
      <div className="absolute inset-0">
        <Image 
          src={imageSrc} 
          alt={title} 
          layout="fill" 
          objectFit="cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col justify-end p-6">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-white">{description}</p>
      </div>
    </Link>
  );
};

export default FeatureCard;