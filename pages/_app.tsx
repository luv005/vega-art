import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ErrorBoundary } from 'react-error-boundary'
import { AuthProvider } from '../components/AuthProvider'
import { useEffect, useState } from 'react'

function ErrorFallback({error}: {error: Error}) {
  console.error("Error caught by ErrorBoundary:", error);
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('MyApp useEffect running');
    setIsLoading(false);
  }, []);

  console.log('MyApp is rendering, isLoading:', isLoading);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Component {...pageProps} />
        </ErrorBoundary>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default MyApp
