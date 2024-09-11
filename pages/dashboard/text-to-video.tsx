import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../components/AuthProvider';
import withAuth from '../../components/withAuth';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, getDocs, where, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';

interface Video {
    id: string;
    prompt: string;
    status: string;
    videoUrl?: string;
    taskId: string;
}

function TextToVideo() {
    const [prompt, setPrompt] = useState('');
    const [promptError, setPromptError] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [previousVideos, setPreviousVideos] = useState<Video[]>([]);
    const [currentTaskStatus, setCurrentTaskStatus] = useState('');
    const { user } = useAuth();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [downloadError, setDownloadError] = useState('');

    const fetchPreviousVideos = useCallback(async () => {
        if (!user) {
            console.log("No user found, skipping fetch");
            return;
        }
        try {
            console.log("Fetching previous videos for user:", user.uid);
            const videosRef = collection(db, 'users', user.uid, 'videoTasks');
            const q = query(
                videosRef,
                where('videoUrl', '!=', null),  // Only fetch videos with a valid videoUrl
                orderBy('createdAt', 'desc'),
                limit(35)
            );
            const querySnapshot = await getDocs(q);
            const videos = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return { id: doc.id, ...data } as Video;
            });
            console.log("Fetched successful videos:", videos);
            setPreviousVideos(videos);

            // Check status of processing videos
            const processingVideosRef = query(
                videosRef,
                where('status', '==', 'Processing')
            );
            const processingSnapshot = await getDocs(processingVideosRef);
            const processingVideos = processingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
            if (processingVideos.length > 0) {
                checkProcessingVideos(processingVideos);
            }
        } catch (error) {
            console.error('Error fetching previous videos:', error);
            setError('Failed to fetch previous videos. Please try refreshing the page.');
        }
    }, [user]);

    useEffect(() => {
        console.log('Home component mounted');
        if (user) {
            fetchPreviousVideos();
        }
    }, [user, fetchPreviousVideos]);

    const checkProcessingVideos = async (processingVideos: Video[]) => {
        for (const video of processingVideos) {
            if (!video.taskId) {
                continue;
            }
            try {
                const response = await fetch('/api/check-video-status', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        taskId: video.taskId,
                        userId: user?.uid,
                        videoId: video.id
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to check video status: ${response.status}. Error: ${errorText}`);
                }

                const data = await response.json();
                console.log("Video status check response:", data);
                if (data.status === 'Success') {
                    // Update the video status in the state
                    setPreviousVideos(prevVideos => 
                        prevVideos.map(v => 
                            v.id === video.id ? { ...v, status: 'Success', videoUrl: data.videoUrl } : v
                        )
                    );
                }
            } catch (error) {
                console.error('Error checking video status:', error);
            }
        }
    };

    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newPrompt = e.target.value;
        setPrompt(newPrompt);
        if (newPrompt.length > 200) {
            setPromptError('Prompt is too long. Please keep it under 200 characters.');
        } else {
            setPromptError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('User not authenticated. Please log in.');
            return;
        }
        if (prompt.length > 200) {
            setError('Prompt is too long. Please keep it under 200 characters.');
            return;
        }
        setIsLoading(true);
        setError('');
        setVideoUrl('');
        setCurrentTaskStatus('Processing');

        try {
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    prompt,
                    userId: user.uid
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to generate video: ${response.status}`);
            }

            const data = await response.json();
            console.log("Response data:", data);

            if (data.status === 'Success') {
                setVideoUrl(data.output);
                setCurrentTaskStatus('');
                await fetchPreviousVideos(); // Refresh the list of previous videos
            } else {
                setError('Video generation failed. Please try again.');
                setCurrentTaskStatus('');
            }
        } catch (err) {
            console.error('Error details:', err);
            setError('An error occurred while generating the video.');
            setCurrentTaskStatus('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (videoUrl: string) => {
        try {
            const response = await fetch(`/api/download-video?videoUrl=${encodeURIComponent(videoUrl)}`);
            if (!response.ok) throw new Error('Download failed');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'generated-video.mp4';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading video:', error);
            setDownloadError('Failed to download video. Please try again.');
        }
    };

    const handleDelete = async (videoId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'videoTasks', videoId));
            setPreviousVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
        } catch (error) {
            console.error('Error deleting video:', error);
            setError('Failed to delete video. Please try again.');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex h-screen bg-gray-900 text-white relative">
            <Sidebar />
            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-gray-900">
                <div className="container mx-auto px-4 py-8">                    
                    {/* Previous videos section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                        {previousVideos.length === 0 ? (
                            <p className="text-gray-400" style={{ fontSize: '16px', fontWeight: '400' }}>No completed videos found.</p>
                        ) : (
                            previousVideos.map((video) => (
                                <div key={video.id} className="bg-gray-800 shadow-md rounded-lg p-4 relative">
                                    <div className="absolute top-2 right-2">
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === video.id ? null : video.id)}
                                            className="text-gray-300 hover:text-white focus:outline-none"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                            </svg>
                                        </button>
                                        {activeDropdown === video.id && (
                                            <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg z-10">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => video.videoUrl && handleDownload(video.videoUrl)}
                                                        className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600"
                                                    >
                                                        Download
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(video.id)}
                                                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p style={{ 
                                        fontSize: '14px', 
                                        fontWeight: '500',
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        marginBottom: '8px',
                                        lineHeight: '1.3',
                                        minHeight: '2.6em', // This ensures two lines of text
                                        wordBreak: 'break-word' // This allows long words to break and wrap
                                    }}>
                                        {video.prompt}
                                    </p>
                                    {video.videoUrl ? (
                                        <video src={video.videoUrl} controls className="w-full rounded-md" />
                                    ) : (
                                        <p className="text-yellow-500">Video URL not available</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

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
                    <form onSubmit={handleSubmit} style={{ marginBottom: '1px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={handlePromptChange}
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
                                placeholder="Try something like 'A forest with a river and a waterfall'"
                                required
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '12px' }}>
                                <span style={{ color: prompt.length > 200 ? '#ef4444' : '#6b7280' }}>{prompt.length}/200 characters</span>
                                {promptError && <span style={{ color: '#ef4444' }}>{promptError}</span>}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', width: 'fit-content' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '4px 16px',
                                    backgroundColor: prompt.trim() === '' || isLoading || currentTaskStatus === 'Processing' || prompt.length > 200 ? '#e2e8f0' : '#8b5cf6',
                                    color: prompt.trim() === '' || isLoading || currentTaskStatus === 'Processing' || prompt.length > 200 ? '#a0aec0' : '#ffffff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: prompt.trim() === '' || isLoading || currentTaskStatus === 'Processing' || prompt.length > 200 ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                disabled={prompt.trim() === '' || isLoading || currentTaskStatus === 'Processing' || prompt.length > 200}
                            >
                                {isLoading || currentTaskStatus === 'Processing' ? 'Generating...' : 'Generate Video'}
                            </button>
                        </div>
                    </form>
                    <div style={{ maxWidth: '500px' }}>
                        {error && <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>}
                        {currentTaskStatus === 'Processing' && (
                            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '5px' }}>
                                <p style={{ fontWeight: 'bold' }}>Generating your video...</p>
                                <p style={{ fontSize: '14px', marginTop: '8px' }}>This may take 3-8 minutes.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(TextToVideo);