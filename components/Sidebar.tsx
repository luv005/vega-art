import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Sidebar: React.FC = () => {
    const router = useRouter();

    const NavLink: React.FC<NavLinkProps> = ({ href, children, icon }) => {
        const isActive = router.pathname === href;
        return (
            <Link href={href} className={`flex items-center py-2 px-4 ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                {icon}
                {children}
            </Link>
        );
    };

    return (
        <nav className="bg-gray-800 w-64 min-h-screen p-4">
            <div className="space-y-4">
                <NavLink href="/dashboard" icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                }>
                    Home
                </NavLink>
                
                <div>
                    <h3 className="text-gray-500 font-semibold py-2 px-4">AI Tools</h3>
                    <div className="space-y-2">
                        <NavLink href="/dashboard/text-to-video" icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                        }>
                            Text to Video
                        </NavLink>
                        <NavLink href="/dashboard/text-to-image" icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                        }>
                            Text to Image
                        </NavLink>
                    </div>
                </div>
                
                {/* Add other navigation items here if needed */}
            </div>
        </nav>
    );
};

export default Sidebar;