import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useAuth } from '../components/AuthProvider'
import withAuth from '../components/withAuth'
import Sidebar from '../components/Sidebar';

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const NavLink = ({ href, children }) => {
    const isActive = router.pathname === href;
    return (
      <Link href={href} style={{
        color: isActive ? '#ff6b6b' : '#fff',
        textDecoration: 'none',
        fontSize: '16px',
        padding: '10px 15px',
        borderRadius: '5px',
        transition: 'all 0.3s ease',
        backgroundColor: isActive ? 'rgba(255, 107, 107, 0.1)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        {children}
      </Link>
    );
  };

  const FeatureCard = ({ title, description, imageSrc, href }) => (
    <Link href={href} style={{
      backgroundColor: '#1a1a2e',
      borderRadius: '10px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      textDecoration: 'none',
      color: '#fff',
      transition: 'transform 0.3s ease',
      cursor: 'pointer',
    }}>
      <Image src={imageSrc} alt={title} width={200} height={200} style={{ marginBottom: '20px', borderRadius: '5px' }} />
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: '#a0a0a0' }}>{description}</p>
    </Link>
  );

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {/* Main content */}
        <main style={{ flex: 1, padding: '30px' }}>
          <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }}>Explore AI Tools</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '16px', fontWeight: '500' }}>{user.displayName}</span>
              <Image 
                src={user.photoURL} 
                alt={user.displayName} 
                width={40} 
                height={40} 
                style={{ borderRadius: '50%' }} 
                unoptimized
              />
            </div>
          </header>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '20px', letterSpacing: '-0.3px' }}>AI Tools</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <FeatureCard 
                title="Text to Video" 
                description="Transform your text into captivating videos with AI" 
                imageSrc="/text-to-video-preview.jpg" 
                href="/dashboard/text-to-video"
              />
              <FeatureCard 
                title="Text to Image" 
                description="Create stunning images from your text descriptions" 
                imageSrc="/text-to-image-preview.jpg" 
                href="/dashboard/text-to-image"
              />
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '20px', letterSpacing: '-0.3px' }}>Recent Creations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {/* Placeholder for creation items */}
              <div style={{ backgroundColor: '#2a2a3a', height: '200px', borderRadius: '10px' }}></div>
              <div style={{ backgroundColor: '#2a2a3a', height: '200px', borderRadius: '10px' }}></div>
              <div style={{ backgroundColor: '#2a2a3a', height: '200px', borderRadius: '10px' }}></div>
              <div style={{ backgroundColor: '#2a2a3a', height: '200px', borderRadius: '10px' }}></div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default withAuth(Dashboard);