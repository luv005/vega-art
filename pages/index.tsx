import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { auth, db } from '../firebase'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { useRouter } from 'next/router'
import { useAuth } from '../components/AuthProvider';
import React from 'react';
import styles from '../styles/Home.module.css'

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
      const particles: Array<{x: number, y: number, radius: number, speed: number}> = [];
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          speed: Math.random() * 0.5 + 0.1
        });
      }

      function animateParticles() {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        ctx!.fillStyle = gradient;
        ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

        particles.forEach(particle => {
          ctx!.beginPath();
          ctx!.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx!.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx!.fill();

          particle.y -= particle.speed;
          if (particle.y < 0) {
            particle.y = canvas!.height;
          }
        });

        requestAnimationFrame(animateParticles);
      }

      animateParticles();
    };

    drawBackground();

    const handleResize = () => {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
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

const Home: React.FC = () => {
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const [generatedImages, setGeneratedImages] = useState<Array<{
    id: string;
    urls: string[];
    prompt: string;
    createdAt: Date;
    model: string;
  }>>([]);

  const fetchUserImages = useCallback(async () => {
    if (!user) return;

    try {
      const imagesRef = collection(db, 'users', user.uid, 'images');
      const q = query(imagesRef, orderBy('createdAt', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      
      const images = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          urls: data.imageUrl ? [data.imageUrl] : data.imageUrls || [],
          prompt: data.prompt,
          createdAt: data.createdAt.toDate(),
          model: data.model,
        };
      });

      setGeneratedImages(images);
    } catch (error) {
      console.error('Error fetching user images:', error);
    }
  }, [user]);

  useEffect(() => {
    console.log('Home component mounted');
    if (user) {
      fetchUserImages();
    }
  }, [user, fetchUserImages]);

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

  const [prompt, setPrompt] = useState('');

  const handleImageGeneration = async (prompt: string) => {
    try {
      setShowSignInPopup(true);
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          userId: user?.uid,
          num_outputs: 1,
          aspect_ratio: '1:1',
          model: 'flux-pro',
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newImage = {
          id: Date.now().toString(),
          urls: data.output.imageUrl ? [data.output.imageUrl] : data.output.imageUrls || [],
          prompt: data.prompt,
          createdAt: new Date(data.createdAt),
          model: data.model,
        };

        setGeneratedImages(prevImages => [newImage, ...prevImages]);
      } else {
        console.error('Image generation failed:', data.error);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

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
      <header style={{ 
        padding: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        position: 'relative', 
        zIndex: 1,
        flexWrap: 'wrap',
      }}>
        <Logo />
        <div className="cta-buttons" style={{ marginTop: '10px' }}>
          <button onClick={handleSignInClick} style={{ 
            padding: '8px 16px', 
            backgroundColor: '#ff6b6b', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}>Launch App</button>
        </div>
      </header>

      <main style={{ padding: '40px 20px', position: 'relative', zIndex: 1 }}>
        <section className="hero" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ 
            fontSize: 'clamp(2em, 5vw, 3.5em)', 
            fontWeight: 'bold', 
            marginBottom: '20px' 
          }}>Vega AI Art Generator</h1>
          <p style={{ 
            fontSize: 'clamp(1em, 3vw, 1.2em)', 
            lineHeight: '1.6', 
            maxWidth: '800px', 
            margin: '0 auto 30px' 
          }}>Create AI videos and images with Vega&apos;s Generator</p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}>
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A magical Disney-inspired castle" 
              style={{ 
                padding: '15px', 
                fontSize: 'clamp(0.8em, 2vw, 1.2em)', 
                width: '100%', 
                maxWidth: '500px', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                border: '1px solid rgba(255, 255, 255, 0.3)', 
                borderRadius: '30px', 
                color: 'white',
                outline: 'none',
                marginBottom: '5px',
              }} 
            />
            <button onClick={() => handleImageGeneration(prompt)} style={{ 
              padding: '15px 30px', 
              fontSize: 'clamp(0.8em, 2vw, 1.2em)', 
              backgroundColor: '#ff6b6b', 
              color: 'white', 
              border: 'none', 
              borderRadius: '30px',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '200px',
            }}>Create</button>
          </div>
        </section>

        <section className="ai-tools" style={{ 
          marginBottom: '60px', 
          maxWidth: '1200px', 
          margin: '0 auto', 
          position: 'relative', 
          zIndex: 0 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px', 
            marginTop: '40px',
            flexWrap: 'wrap',
          }}>
            {/* Text to Video Card */}
            <div 
              onClick={(e) => handleSectionClick(e, '/dashboard/text-to-video')}
              style={{ 
                width: '100%',
                maxWidth: '580px',
                height: '400px',
                backgroundColor: 'rgba(26, 26, 46, 0.1)',
                borderRadius: '10px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                zIndex: 0,
                marginBottom: '20px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.backgroundColor = 'rgba(26, 26, 46, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(26, 26, 46, 0.1)';
              }}
            >
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover',
                  opacity: 0.7,
                }}
              >
                <source src="https://storage.googleapis.com/vegaart-d14b4.appspot.com/lWjZpigy8hXCbHhHlpL67dblTXJ3/videos/1726042670263.mp4?GoogleAccessId=firebase-adminsdk-m1moh%40vegaart-d14b4.iam.gserviceaccount.com&Expires=16730323200&Signature=fSmjPThN2YwXko6%2BZqm6w9It9gKrsQL8dPJuBEGsbfUulthMiIPZK6yUUaac%2BgMggPQuHDurSyk25jn0A5SONKLy1mz5bHoHVlkfyN%2BKWCV8Gf5%2BBixQQU54nQF0%2FIcSlriHbkXCT8dZdTMY7YgqpER0BAEUMEYTV4em8H4GGVEvYAme19pLITJ0xmDVDe%2F3M5Wn1J4ddyM2lHGFWmYIGVwYz7%2Fw5XGW6r%2F3322h6p391oIue9HO3KgRTeXlnxnGz3Irq%2FOdCyOynuWNNlWNnNnBdzToOIsWQFmKLMJc9SXi8KvLKbyKeeAWjZfPu9Xh2YMGv4ifbvyabfOOblQYRg%3D%3D" 
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
              <div style={{ padding: '10px', position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '1.8em', fontWeight: 'bold', marginBottom: '10px' }}>Text to Video</h3>
                <p style={{ fontSize: '1em', lineHeight: '1.6'}}>Transform your text into captivating videos</p>
              </div>
            </div>
            {/* Text to Image Card */}
            <div 
              onClick={(e) => handleSectionClick(e, '/dashboard/text-to-image')}
              style={{ 
                width: '100%',
                maxWidth: '580px',
                height: '400px',
                backgroundColor: 'rgba(26, 26, 46, 0.1)',
                borderRadius: '10px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                zIndex: 0,
                marginBottom: '20px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.backgroundColor = 'rgba(26, 26, 46, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(26, 26, 46, 0.1)';
              }}
            >
              <div style={{
                height: '300px',
                backgroundImage: 'url(/textToImage.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.7,
              }} />
              <div style={{ padding: '10px', position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: '1.8em', fontWeight: 'bold', marginBottom: '10px' }}>Text to Image</h3>
                <p style={{ fontSize: '1em', lineHeight: '1.6' }}>Convert your text into stunning images</p>
              </div>
            </div>
          </div>
        </section>

        <section className="recent-creations" style={{ 
          marginTop: '100px', 
          marginBottom: '60px', 
          maxWidth: '1200px', 
          margin: '100px auto 60px' 
        }}>
          <h2 style={{ 
            fontSize: 'clamp(1.5em, 4vw, 2.5em)', 
            fontWeight: 'bold', 
            textAlign: 'center', 
            marginBottom: '30px' 
          }}>Recent Creations</h2>
          
          {/* Videos row */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px', 
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}>
            {[
              "https://storage.googleapis.com/vegaart-d14b4.appspot.com/lWjZpigy8hXCbHhHlpL67dblTXJ3/videos/1726044209387.mp4?GoogleAccessId=firebase-adminsdk-m1moh%40vegaart-d14b4.iam.gserviceaccount.com&Expires=16730323200&Signature=NATxrISaB9LDWGaC1Vf7S1WUdfqywvB5ygQt5fusxjMbmGE7DO08PnNENA2nA7NUFonh3Gu%2Bid6qLDiBGwa2%2FPKlsFeSg9%2FAqDBrxbbpubwfgs0UgqaptqBVduaeVf0jZ2SyPfZHdgZFrUctFMSf6FR1mUEHMXOsJEyK%2FSQ9nsgbsWwDJ%2BDcyN%2BM%2Fu%2FMODdoy%2F4P4DMfPFtdy9B44ixz3IFmIkaSyNTzrAFPbw19C85pqAg6ap%2BXb1ucrT7RUqFJfys%2BIeRxuz5wzyT4nDhAxeYEvkIQb8CqRkAgMIY2rgLiUHFWDcYsBT21NR07mgVly4WAl9TmrgGa8HaULLGkUg%3D%3D",
              "https://storage.googleapis.com/vegaart-d14b4.appspot.com/lWjZpigy8hXCbHhHlpL67dblTXJ3/videos/1726043728105.mp4?GoogleAccessId=firebase-adminsdk-m1moh%40vegaart-d14b4.iam.gserviceaccount.com&Expires=16730323200&Signature=tJrzGp8Qbp3Re4YJxf8jb0e7moh5DiforwxC%2BretgcrkZNZk1sm9EsAfCdT9NRnOv2UTGU6Wmy%2FsVvVOWibOQhZv3CoOjK2d%2Bs92D%2Bb2gNew02PHs75yfyM0D1XAzjuz35xFkTtzBBL7DXwZhFbPK2Y9i8n5ER9pFxof542FIjenikfl9hS8CXJGG3cduVHW84o40cNjIIpgS90uBUE9mJ9F4tZDziVDf%2Fp4t7PAZtaVvdgrVBpX%2FT7nVWWzPUfEMusSKuKV2GvsgilKfT6J27hBuswpdCVZPdqHal9ukWE%2B3VRByqmiMvOjD32e8s7fDFLXu8cXUT5a6En7MkRSNw%3D%3D",
              "https://storage.googleapis.com/vegaart-d14b4.appspot.com/lWjZpigy8hXCbHhHlpL67dblTXJ3/videos/1726042218476.mp4?GoogleAccessId=firebase-adminsdk-m1moh%40vegaart-d14b4.iam.gserviceaccount.com&Expires=16730323200&Signature=Q8GMccd6ra1jCTe%2BTH0skKIFSmBB741MhRcHG6HzWzISC6mEM3yzjgF7Vg0gEFqy7mLi4heJV5vABg7MKDewfoIKKSNx7ormUtkF2XRC6UsW33eDam4b7%2BN%2BdJM3T4FrKl9IsQLO6XQOn%2B3%2BNyaqwEFP9SMcv%2FeReEqXcLSD2Fv8ZHOtkx%2B%2FrV%2BpRXHX3wUpeAVpTiV%2FyhXG%2FKXO5SH7w17qGsA0HNrLT3RGXtqspyYuiMhbTQll4ca%2B1O8mQYq9fZeVtH7ufBKbWZ4Dh7jnfL2zKJPyeEt7kcV%2BeFfJAjEBaYkkWZretr%2FxYRMd0bdH%2FsgSeydy5kffTGS5ye7Cvg%3D%3D",
              "https://storage.googleapis.com/vegaart-d14b4.appspot.com/users/lWjZpigy8hXCbHhHlpL67dblTXJ3/videos/psJYOCtwoleYdvoM84WR.mp4?GoogleAccessId=firebase-adminsdk-m1moh%40vegaart-d14b4.iam.gserviceaccount.com&Expires=16730323200&Signature=QIAcwL8ze4BDfoPDP%2BpZd1UgLC%2BLBeJ5pLWCPY01m%2FIbYoH4qJbGpbUQVTSratU%2FHs6oZulrcHFx0A6MWaeeTrAMueBZ%2B5HmGjlwYxfsYjrTzPtUyVqDNDsU2cYmHOJ9ktaLozL7FX%2BzHxvRriKQARKeiY5h0BTXqVAqvk431DU%2FRyRNkhLkXLE5VE3dS3Qv1e%2B97mUCIPK9fPYu%2FuG0dY6%2F6UGFtrRBOSyQpafMy42ImEcH1acIGgjINyznsqZ97l6xcOgseny%2FYLLaHvhFl85PsErgczJ0cJXQ8iPgAI0gct3mAMAIkmNQEesyXVxsgSBFoUR%2BwskIoqbvTARoSg%3D%3D"
            ].map((videoUrl, index) => (
              <div key={`video-${index}`} style={{ width: '100%', maxWidth: '280px', height: '280px', overflow: 'hidden', borderRadius: '10px' }}>
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ))}
          </div>

          {/* Images row */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px',
            flexWrap: 'wrap',
          }}>
            {[
              '/images/image1.png',
              '/images/image2.png',
              '/images/image3.png',
              '/images/image4.png'
            ].map((imagePath, index) => (
              <div key={`image-${index}`} style={{ width: '100%', maxWidth: '280px', height: '280px', overflow: 'hidden', borderRadius: '10px' }}>
                <Image 
                  src={imagePath}
                  alt={`Generated image ${index + 1}`}
                  width={280}
                  height={280}
                  objectFit="cover"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Other sections (pricing, FAQ, community, testimonials) can be added here following the same style */}
      </main>

      <footer style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        padding: '40px 20px', 
        textAlign: 'center', 
        position: 'relative', 
        zIndex: 1 
      }}>
        <p>© 2024 VegaArt. All rights reserved.</p>
      </footer>

      {showSignInPopup && <SignInPopup />}
    </div>
  );
};

export default Home;
