import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useAuth } from '../components/AuthProvider'
import withAuth from '../components/withAuth'

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
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      backgroundColor: '#0f0f1a', 
      color: '#fff',
      minHeight: '100vh',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '250px', 
        backgroundColor: '#1a1a2e', 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <Image src="/logo.png" alt="VegaArt Logo" width={150} height={40} />
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <NavLink href="/dashboard">Home</NavLink>
          <NavLink href="/dashboard/text-to-video">Text to Video</NavLink>
          <NavLink href="/dashboard/text-to-image">Text to Image</NavLink>
          <NavLink href="/dashboard/ideate">Ideate</NavLink>
          <NavLink href="/dashboard/image-remix">Image Remix</NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '30px' }}>
        <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span>{user.displayName}</span>
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
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>AI Tools</h2>
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
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Recent Creations</h2>
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
  )
}

export default withAuth(Dashboard);