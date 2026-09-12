import { Link } from 'react-router-dom';
import { useShop } from '../../context/shop-context';

export default function Footer() {
  const { shop, shopSlug, brandName, logo } = useShop();

  return (
    <footer className="bg-dark-800 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              {logo ? <img src={logo} alt={brandName} className="w-7 h-7 rounded-lg object-cover" /> : <span className="text-2xl">🏪</span>}
              <span className="font-display font-bold text-xl text-gradient">{brandName}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{shop?.tagline || shop?.description || 'Quality products, great service.'}</p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Shop</h4>
            <Link to={`/${shopSlug}/products`} className="block text-sm text-gray-400 hover:text-primary-400 mb-2 transition-colors">All Products</Link>
            <Link to={`/${shopSlug}/products?featured=true`} className="block text-sm text-gray-400 hover:text-primary-400 mb-2 transition-colors">Featured</Link>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Account</h4>
            {[
              { to: `/${shopSlug}/login`, label: 'Sign In' },
              { to: `/${shopSlug}/register`, label: 'Register' },
              { to: `/${shopSlug}/dashboard`, label: 'My Orders' },
              { to: `/${shopSlug}/cart`, label: 'Cart' }
            ].map(l => (
              <Link key={l.to} to={l.to} className="block text-sm text-gray-400 hover:text-primary-400 mb-2 transition-colors">{l.label}</Link>
            ))}
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4">Contact</h4>
            {shop?.contactEmail && <p className="text-sm text-gray-400 mb-2">📧 {shop.contactEmail}</p>}
            {shop?.contactPhone && <p className="text-sm text-gray-400 mb-2">📞 {shop.contactPhone}</p>}
            {shop?.address?.city && <p className="text-sm text-gray-400">📍 {shop.address.city}{shop.address.state ? `, ${shop.address.state}` : ''}</p>}
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {brandName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
