import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { auth, db } from '../firebaseConfig'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'next/router'
import { useAuth } from '../components/AuthProvider';
import React from 'react';

// Add this new component for the logo
const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L21.39 6.64V17.36L12 22L2.61 17.36V6.64L12 2Z"
        fill="white"
        stroke="black"
        strokeWidth="1"
      />
      <path
        d="M16.5 8L12 18L7.5 8H16.5Z"
        fill="black"
      />
    </svg>
    <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>Vega Art</span>
  </div>
);

// Add this new component for the animated background
const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drawBackground = () => {
      if (!ctx) return;

      // Create a dark, slightly transparent gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(10, 10, 20, 0.8)');
      gradient.addColorStop(1, 'rgba(20, 20, 40, 0.8)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add some subtle, moving particles
      const particles = [];
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          speed: Math.random() * 0.5 + 0.1
        });
      }

      function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fill();

          particle.y -= particle.speed;
          if (particle.y < 0) {
            particle.y = canvas.height;
          }
        });

        requestAnimationFrame(animateParticles);
      }

      animateParticles();
    };

    drawBackground();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawBackground();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
};

export default function Home() {
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Home component mounted');
  }, []);

  console.log('Rendering Home component');

  const handleSignInClick = () => {
    setShowSignInPopup(true);
  };

  const closeSignInPopup = () => {
    setShowSignInPopup(false);
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Successfully signed in:', result.user);
      
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', result.user.uid);
      
      try {
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // If user doesn't exist, create a new user document
          const userData = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            createdAt: serverTimestamp(),
          };
          
          await setDoc(userRef, userData);
          console.log('New user created in Firestore:', userData);
        } else {
          console.log('User already exists in Firestore:', userSnap.data());
        }

        closeSignInPopup();
        // Here you can add logic for what happens after successful sign-in
      } catch (firestoreError) {
        console.error('Error accessing Firestore:', firestoreError);
      }
    } catch (signInError) {
      console.error('Error signing in with Google:', signInError);
      // Here you can add error handling logic
    }
  };

  const handleSectionClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (user) {
      router.push(path);
    } else {
      setShowSignInPopup(true);
    }
  };

  const SignInPopup = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1a1a2e',
        padding: '30px',
        borderRadius: '15px',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '24px' }}>Sign in to VegaArt</h2>
        <button onClick={handleGoogleSignIn} style={{
          padding: '12px 20px',
          fontSize: '16px',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          width: '100%',
          maxWidth: '300px',
          transition: 'background-color 0.3s'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" style={{ marginRight: '10px' }}>
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="home-container" style={{ 
      fontFamily: 'Arial, sans-serif', 
      color: '#fff',
      minHeight: '100vh',
      position: 'relative',
    }}>
      <AnimatedBackground />
      <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <Logo /> {/* Add the Logo component here */}
        <div className="cta-buttons">
          <button onClick={handleSignInClick} style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: 'transparent', color: 'white', border: '1px solid white', borderRadius: '4px', cursor: 'pointer' }}>Sign in</button>
          <button onClick={handleSignInClick} style={{ padding: '8px 16px', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Launch App</button>
        </div>
      </header>

      <main style={{ padding: '40px 20px', position: 'relative', zIndex: 1 }}>
        <section className="hero" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3.5em', fontWeight: 'bold', marginBottom: '20px' }}>Vega AI Art Generator</h1>
          <p style={{ fontSize: '1.2em', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto 30px' }}>Create AI videos and images with Vega's AI Generator</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="A magical Disney-inspired castle" 
              style={{ 
                padding: '15px', 
                fontSize: '1.2em', 
                width: '400px', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                border: '1px solid rgba(255, 255, 255, 0.3)', 
                borderRadius: '30px 0 0 30px', 
                color: 'white',
                outline: 'none'
              }} 
            />
            <button onClick={handleSignInClick} style={{ 
              padding: '15px 30px', 
              fontSize: '1.2em', 
              backgroundColor: '#ff6b6b', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0 30px 30px 0',
              cursor: 'pointer'
            }}>Create</button>
          </div>
        </section>

        <section className="ai-tools" style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5em', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px' }}>Our AI Tools Suite</h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '40px' }}>
            <div 
              onClick={(e) => handleSectionClick(e, '/dashboard/text-to-video')}
              style={{ 
                width: '400px',
                height: '300px',
                padding: '30px',
                borderRadius: '15px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url(/textToVideo.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.3,
                zIndex: 0
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '2.2em', fontWeight: 'bold', marginBottom: '20px' }}>Text to Video</h3>
                <p style={{ fontSize: '1.2em', lineHeight: '1.6' }}>Transform your text into captivating videos.</p>
              </div>
            </div>
            <div 
              onClick={(e) => handleSectionClick(e, '/dashboard/text-to-image')}
              style={{ 
                width: '400px',
                height: '300px',
                padding: '30px',
                borderRadius: '15px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url(/textToImage.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.3,
                zIndex: 0
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '2.2em', fontWeight: 'bold', marginBottom: '20px' }}>Text to Image</h3>
                <p style={{ fontSize: '1.2em', lineHeight: '1.6' }}>Convert your textual ideas into stunning images.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Other sections (pricing, FAQ, community, testimonials) can be added here following the same style */}
      </main>

      <footer style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '40px 20px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p>© 2024 VegaArt. All rights reserved.</p>
      </footer>

      {showSignInPopup && <SignInPopup />}
    </div>
  )
}
