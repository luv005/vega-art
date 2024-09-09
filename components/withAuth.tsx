import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './AuthProvider';

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  const WithAuth: React.FC<any> = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace('/');
      }
    }, [user, loading, router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuth;
};

export default withAuth;