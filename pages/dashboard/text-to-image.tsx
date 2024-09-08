import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { auth, db } from '../../firebaseConfig'
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import withAuth from '../../components/withAuth'
import Sidebar from '../../components/Sidebar'

const ImageDisplay = ({ url, prompt, onDownload, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <div 
        style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          borderRadius: '10px',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowPopup(true)}
      >
        <img 
          src={url} 
          alt={prompt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        {isHovered && (
          <>
            <div 
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                padding: '5px',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDownload(url);
              }}
            >
              📥
            </div>
            <div 
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                padding: '5px',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowPopup(true);
              }}
            >
              🔍
            </div>
          </>
        )}
      </div>
      {showPopup && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowPopup(false)}
        >
          <div 
            style={{
              backgroundColor: '#1a1a2e',
              padding: '20px',
              borderRadius: '10px',
              display: 'flex',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ flex: 3, marginRight: '20px', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={url} 
                alt={prompt}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <button 
                onClick={() => onDownload(url)}
                style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Download
              </button>
              <button 
                onClick={() => {
                  onDelete();
                  setShowPopup(false);
                }}
                style={{ padding: '10px', backgroundColor: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const CurrentImageDisplay = ({ url, prompt, onDownload, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <div 
        style={{
          position: 'relative',
          width: '256px',
          height: '256px',
          borderRadius: '10px',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowPopup(true)}
      >
        <img 
          src={url} 
          alt={prompt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        {isHovered && (
          <>
            <div 
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                padding: '5px',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDownload(url);
              }}
            >
              📥
            </div>
            <div 
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                padding: '5px',
                cursor: 'pointer'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowPopup(true);
              }}
            >
              🔍
            </div>
          </>
        )}
      </div>
      {showPopup && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowPopup(false)}
        >
          <div 
            style={{
              backgroundColor: '#1a1a2e',
              padding: '20px',
              borderRadius: '10px',
              display: 'flex',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ flex: 3, marginRight: '20px', maxHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={url} 
                alt={prompt}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <button 
                onClick={() => onDownload(url)}
                style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Download
              </button>
              <button 
                onClick={() => {
                  onDelete();
                  setShowPopup(false);
                }}
                style={{ padding: '10px', backgroundColor: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function TextToImage() {
  const [prompt, setPrompt] = useState('');
  const [generatedImageUrls, setGeneratedImageUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [previousImages, setPreviousImages] = useState([]);
  const [numImages, setNumImages] = useState(1);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedModel, setSelectedModel] = useState('flux-schnell');
  const [selectedStyle, setSelectedStyle] = useState('No Style');
  const dropdownRef = useRef(null);
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchPreviousImages(user.uid);
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    console.log("Previous images state updated:", previousImages);
  }, [previousImages]);

  const fetchPreviousImages = async (userId) => {
    try {
      console.log("Fetching previous images for user:", userId);
      const imagesRef = collection(db, 'users', userId, 'images');
      const q = query(imagesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      console.log("Query snapshot size:", querySnapshot.size);
      const images = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        console.log("Document data:", data);
        images.push({
          id: doc.id,
          prompt: data.prompt,
          imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [data.imageUrl], // Handle both array and single image
          createdAt: data.createdAt
        });
      });
      console.log("Processed images:", images);
      setPreviousImages(images);
    } catch (error) {
      console.error("Error fetching previous images:", error);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let finalPrompt = prompt;
      if (selectedStyle !== 'No Style') {
        finalPrompt += `, ${selectedStyle}`;
      }

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: finalPrompt, 
          userId: user.uid, 
          num_outputs: numImages,
          aspect_ratio: aspectRatio,
          model: selectedModel
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) {
        throw new Error(`Failed to generate image: ${data.message || response.statusText}`);
      }

      if (data.output && data.output.length > 0) {
        setGeneratedImageUrls(data.output);
        // Update previousImages with the new generation
        setPreviousImages(prev => [{
          id: Date.now().toString(),
          prompt,
          imageUrls: data.output,
          createdAt: new Date()
        }, ...prev]);
      } else {
        console.error("Unexpected API response format:", data);
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError('An error occurred while generating the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (imageUrl) => {
    if (imageUrl) {
      try {
        const response = await fetch(`/api/download-image?imageUrl=${encodeURIComponent(imageUrl)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'generated-image.png';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading image:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  const handleDownloadAll = async (imageUrls) => {
    for (let i = 0; i < imageUrls.length; i++) {
      await handleDownload(imageUrls[i]);
    }
  };

  const handleDeleteGeneration = async (generationId) => {
    if (confirm('Are you sure you want to delete this entire generation?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'images', generationId));
        setPreviousImages(prev => prev.filter(gen => gen.id !== generationId));
      } catch (error) {
        console.error('Error deleting generation:', error);
      }
    }
  };

  const handleDeleteImage = async (generationId, imageUrl) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        const updatedGeneration = previousImages.find(gen => gen.id === generationId);
        if (updatedGeneration) {
          updatedGeneration.imageUrls = updatedGeneration.imageUrls.filter(url => url !== imageUrl);
          if (updatedGeneration.imageUrls.length === 0) {
            await deleteDoc(doc(db, 'users', user.uid, 'images', generationId));
            setPreviousImages(prev => prev.filter(gen => gen.id !== generationId));
          } else {
            await updateDoc(doc(db, 'users', user.uid, 'images', generationId), {
              imageUrls: updatedGeneration.imageUrls
            });
            setPreviousImages(prev => prev.map(gen => gen.id === generationId ? updatedGeneration : gen));
          }
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      fontFamily: 'Inter, sans-serif', 
      backgroundColor: '#0f0f1a', 
      color: '#fff',
      minHeight: '100vh',
      display: 'flex',
      position: 'relative'
    }}>
      <Sidebar />

      {/* Main content */}
      <main style={{ flex: 1, padding: '30px', overflow: 'auto', display: 'flex' }}>
        {/* Left side: Previous images section */}
        <div style={{ flex: 3, marginRight: '20px', overflow: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {previousImages.map((generation) => (
              <div key={generation.id} style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#2a2a3a', borderRadius: '5px 5px 0 0' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500' }}>{generation.prompt}</p>
                  <div style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === generation.id ? null : generation.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '20px' }}
                    >
                      ⋮
                    </button>
                    {activeDropdown === generation.id && (
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        backgroundColor: '#1a1a2e',
                        borderRadius: '5px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        zIndex: 10,
                        minWidth: '120px'
                      }}>
                        <button 
                          onClick={() => handleDownloadAll(generation.imageUrls)}
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            padding: '10px', 
                            textAlign: 'left', 
                            background: 'none', 
                            border: 'none', 
                            color: '#fff', 
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          Download All
                        </button>
                        <button 
                          onClick={() => handleDeleteGeneration(generation.id)}
                          style={{ 
                            display: 'block', 
                            width: '100%', 
                            padding: '10px', 
                            textAlign: 'left', 
                            background: 'none', 
                            border: 'none', 
                            color: '#ff6b6b', 
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', backgroundColor: '#1a1a2e', padding: '10px', borderRadius: '0 0 5px 5px' }}>
                  {generation.imageUrls && generation.imageUrls.length > 0 ? (
                    generation.imageUrls.map((url, index) => (
                      <ImageDisplay 
                        key={index}
                        url={url}
                        prompt={generation.prompt}
                        onDownload={handleDownload}
                        onDelete={() => handleDeleteImage(generation.id, url)}
                      />
                    ))
                  ) : (
                    <p>No images available for this generation</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Settings section */}
        <div style={{ flex: 1, backgroundColor: '#1a1a2e', padding: '20px', borderRadius: '10px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', letterSpacing: '-0.3px' }}>Settings</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="numImages" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Number of Images</label>
            <input
              type="number"
              id="numImages"
              value={numImages}
              onChange={(e) => setNumImages(Number(e.target.value))}
              min="1"
              max="4"
              style={{ width: '100%', padding: '5px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '14px', fontWeight: '400' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="aspectRatio" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Aspect Ratio</label>
            <select
              id="aspectRatio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              style={{ width: '100%', padding: '5px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '14px', fontWeight: '400' }}
            >
              <option value="1:1">1:1</option>
              <option value="16:9">16:9</option>
              <option value="21:9">21:9</option>
              <option value="2:3">2:3</option>
              <option value="3:2">3:2</option>
              <option value="4:5">4:5</option>
              <option value="5:4">5:4</option>
              <option value="9:16">9:16</option>
              <option value="9:21">9:21</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="model" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Model</label>
            <select
              id="model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{ width: '100%', padding: '5px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '14px', fontWeight: '400' }}
            >
              <option value="flux-schnell">Flux Schnell</option>
              <option value="flux-dev">Flux Dev</option>
              <option value="flux-pro">Flux Pro</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="style" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>Style</label>
            <select
              id="style"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              style={{ width: '100%', padding: '5px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '14px', fontWeight: '400' }}
            >
              <option value="No Style">No Style</option>
              <option value="Anime">Anime</option>
              <option value="Cinematic">Cinematic</option>
              <option value="Digital Art">Digital Art</option>
              <option value="Fantasy Art">Fantasy Art</option>
              <option value="Icon">Texture</option>
              <option value="Line Art">Line Art</option>
              <option value="Logo">Texture</option>
              <option value="Neon Punk">Neon Punk</option>
              <option value="Photographic">Photographic</option>
              <option value="Pixel Art">Pixel Art</option>
              <option value="Texture">Texture</option>
            </select>
          </div>
        </div>
      </main>

      {/* Floating prompt input box */}
      <div style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '42rem',
        padding: '0 16px'
      }}>
        <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <form onSubmit={handleGenerate} style={{ marginBottom: '1px' }}>
            <div style={{ marginBottom: '16px' }}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  color: '#111827',
                  resize: 'vertical',
                  minHeight: '100px',
                  fontSize: '14px',
                  fontWeight: '400',
                  lineHeight: '1.5'
                }}
                placeholder="Try something like 'a tiny astronaut hatching from an egg on the moon'"
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', width: 'fit-content' }}>
              <button
                type="submit"
                style={{
                  padding: '4px 16px',
                  backgroundColor: prompt.trim() === '' || isLoading ? '#e2e8f0' : '#8b5cf6',
                  color: prompt.trim() === '' || isLoading ? '#a0aec0' : '#ffffff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: prompt.trim() === '' || isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                disabled={prompt.trim() === '' || isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Image'}
              </button>
            </div>
          </form>
          {error && <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px', fontWeight: '500' }}>{error}</p>}
        </div>
      </div>
    </div>
  )
}

export default withAuth(TextToImage);