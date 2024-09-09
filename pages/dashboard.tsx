import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useAuth } from '../components/AuthProvider'
import withAuth from '../components/withAuth'
import Sidebar from '../components/Sidebar'
import { db } from '../firebaseConfig'
import { collection, query, where, orderBy, limit, getDocs, DocumentData } from 'firebase/firestore'
import FeatureCard from '../components/FeatureCard'

interface Creation {
  id: string;
  type: 'video' | 'image';
  url: string | string[];
  createdAt: Date;
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [recentCreations, setRecentCreations] = useState<Creation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCreation, setHoveredCreation] = useState<string | null>(null);
  const [selectedCreation, setSelectedCreation] = useState<Creation | null>(null);

  useEffect(() => {
    const fetchRecentCreations = async () => {
      if (user) {
        try {
          const videosQuery = query(
            collection(db, 'users', user.uid, 'videoTasks'),
            where('status', '==', 'Success'),
            orderBy('createdAt', 'desc'),
            limit(5)
          );

          const imagesQuery = query(
            collection(db, 'users', user.uid, 'images'),
            orderBy('createdAt', 'desc'),
            limit(5)
          );

          const [videoSnapshot, imageSnapshot] = await Promise.all([
            getDocs(videosQuery),
            getDocs(imagesQuery)
          ]);

          const videos = videoSnapshot.docs.map((doc: DocumentData) => {
            const data = doc.data();
            return {
              id: doc.id,
              type: 'video' as const,
              url: data.videoUrl,
              createdAt: data.createdAt.toDate()
            };
          });

          const images = imageSnapshot.docs.map((doc: DocumentData) => {
            const data = doc.data();
            return {
              id: doc.id,
              type: 'image' as const,
              url: data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls : data.imageUrl,
              createdAt: data.createdAt.toDate()
            };
          });

          const allCreations = [...videos, ...images]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 10);

          setRecentCreations(allCreations);
          setError(null);
        } catch (error) {
          console.error('Error fetching recent creations:', error);
          setError('Failed to load recent creations. Please try again later.');
        }
      }
    };

    fetchRecentCreations();
  }, [user]);

  const NavLink: React.FC<NavLinkProps> = ({ href, children, icon }) => {
    const isActive = router.pathname === href;
    return (
      <Link href={href} className={`flex items-center py-2 px-4 ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
        {icon}
        {children}
      </Link>
    );
  };

  const handleCreationClick = (creation: Creation) => {
    setSelectedCreation(creation);
  };

  const closeModal = () => {
    setSelectedCreation(null);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          <header className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold">Explore AI Tools</h1>
            <div className="flex items-center gap-4">
              <span className="text-lg">{user?.displayName}</span>
              {user?.photoURL && (
                <Image 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  width={40} 
                  height={40} 
                  className="rounded-full" 
                  unoptimized
                />
              )}
            </div>
          </header>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">AI Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard 
                title="Text to Video" 
                description="Transform your text into captivating videos with AI" 
                imageSrc="/textToVideo.png" 
                href="/dashboard/text-to-video"
              />
              <FeatureCard 
                title="Text to Image" 
                description="Create stunning images from your text descriptions" 
                imageSrc="/textToImage.png" 
                href="/dashboard/text-to-image"
              />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">Recent Creations</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentCreations.map((creation) => (
                <div 
                  key={creation.id} 
                  className="relative h-48 rounded-lg overflow-hidden cursor-pointer"
                  onMouseEnter={() => setHoveredCreation(creation.id)}
                  onMouseLeave={() => setHoveredCreation(null)}
                  onClick={() => handleCreationClick(creation)}
                >
                  {creation.type === 'video' ? (
                    <video 
                      src={creation.url as string} 
                      className="w-full h-full object-cover" 
                      loop 
                      muted 
                      playsInline
                    />
                  ) : (
                    <Image 
                      src={Array.isArray(creation.url) ? creation.url[0] : creation.url}
                      alt="Created image" 
                      layout="fill" 
                      objectFit="cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                  {hoveredCreation === creation.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      {creation.type === 'video' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Modal for full view */}
      {selectedCreation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            {selectedCreation.type === 'video' ? (
              <video 
                src={selectedCreation.url as string} 
                className="w-full h-auto max-h-[80vh]" 
                controls 
                autoPlay
              />
            ) : (
              <Image 
                src={Array.isArray(selectedCreation.url) ? selectedCreation.url[0] : selectedCreation.url}
                alt="Full view" 
                width={800}
                height={600}
                objectFit="contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default withAuth(Dashboard);