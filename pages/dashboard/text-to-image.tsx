import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { auth, db } from '../../firebaseConfig'
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import withAuth from '../../components/withAuth'

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

  const handleGenerate = async () => {
    if (!user) return;
    setIsLoading(true);
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
    } catch (error) {
      console.error("Error generating image:", error);
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
      <main style={{ flex: 1, padding: '30px', display: 'flex' }}>
        {/* Image generation and previous images section */}
        <div style={{ flex: 3, marginRight: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Text to Image</h1>
          
          {/* Prompt input and generate button */}
          <div style={{ display: 'flex', marginBottom: '20px' }}>
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Try something like "a tiny astronaut hatching from an egg on the moon"'
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
              onClick={handleGenerate}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#ff6b6b',
                color: '#fff',
                border: 'none',
                borderRadius: '0 5px 5px 0',
                cursor: 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {/* Previous images section */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {previousImages.map((generation) => (
                <div key={generation.id} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#2a2a3a', borderRadius: '5px 5px 0 0' }}>
                    <p>{generation.prompt}</p>
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
        </div>

        {/* Settings panel */}
        <div style={{ flex: 1, backgroundColor: '#1a1a2e', padding: '20px', borderRadius: '10px', height: 'fit-content' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Settings</h2>
          
          {/* Model selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>Model</label>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px' }}
            >
              <option value="flux-schnell">Flux Schnell</option>
              <option value="flux-dev">Flux Dev</option>
              <option value="flux-pro">Flux Pro</option>
            </select>
          </div>

          {/* Style selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>Style</label>
            <select 
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px' }}
            >
              <option>No Style</option>
              <option>Photorealistic</option>
              <option>Pixel Art</option>
              <option>Oil Painting</option>
              <option>Icon</option>
              <option>Logo</option>
              <option>Product Design</option>
            </select>
          </div>

          {/* Aspect Ratio */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>Aspect Ratio</label>
            <select 
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              style={{ width: '100%', padding: '10px', backgroundColor: '#2a2a3a', color: '#fff', border: 'none', borderRadius: '5px' }}
            >
              <option value="1:1">1:1</option>
              <option value="4:3">4:3</option>
              <option value="16:9">16:9</option>
              <option value="21:9">21:9</option>
              <option value="3:2">3:2</option>
              <option value="2:3">2:3</option>
              <option value="4:5">4:5</option>
              <option value="5:4">5:4</option>
              <option value="9:16">9:16</option>
              <option value="9:21">9:21</option>
            </select>
          </div>

          {/* Number of Images */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px' }}>Number of Images</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 3, 4].map(num => (
                <button 
                  key={num} 
                  onClick={() => setNumImages(num)}
                  style={{ 
                    flex: 1, 
                    padding: '10px', 
                    backgroundColor: numImages === num ? '#ff6b6b' : '#2a2a3a', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer' 
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default withAuth(TextToImage);