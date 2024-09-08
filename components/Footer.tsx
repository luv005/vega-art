import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">VegaArt</h3>
            <ul className="space-y-2">
              <li><Link href="/blog">Blogs</Link></li>
              <li><Link href="/community">Community</Link></li>
              <li><Link href="/tools">Our Tools</Link></li>
              <li><Link href="/app">Mobile App</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/api">API</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            {/* Add social media icons here */}
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>© 2024 VegaArt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}