import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'

export default function TextToVideo() {
  const [prompt, setPrompt] = useState('');
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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Text to Video</h1>
        
        {/* Prompt input and generate button */}
        <div style={{ display: 'flex', marginBottom: '30px' }}>
          <input 
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            style={{
              flex: 1,
              padding: '10px 15px',
              fontSize: '16px',
              backgroundColor: '#2a2a3a',
              border: 'none',
              borderRadius: '5px 0 0 5px',
              color: '#fff'
            }}
          />
          <button 
            onClick={() => console.log('Generate video for:', prompt)}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#ff6b6b',
              color: '#fff',
              border: 'none',
              borderRadius: '0 5px 5px 0',
              cursor: 'pointer'
            }}
          >
            Generate
          </button>
        </div>

        {/* Video options */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <select style={{ padding: '10px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px' }}>
            <option>16:9</option>
            <option>4:3</option>
            <option>1:1</option>
          </select>
          <button style={{ padding: '10px 20px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Describe Video
          </button>
          <button style={{ padding: '10px 20px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Animate Image
          </button>
          <button style={{ padding: '10px 20px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Add Face
          </button>
          <button style={{ padding: '10px 20px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Add Style
          </button>
        </div>

        {/* Generated videos grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {/* Placeholder for video items */}
          {[...Array(8)].map((_, index) => (
            <div key={index} style={{ backgroundColor: '#2a2a3a', height: '200px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              Video {index + 1}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}