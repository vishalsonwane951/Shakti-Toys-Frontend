import { Link } from 'react-router-dom';

export default function StoreNotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900 text-white text-center">
      <div>
        <div className="text-6xl mb-6">🏪</div>
        <h1 className="font-display text-3xl font-bold mb-3">Store Not Found</h1>
        <p className="text-gray-400 max-w-md mx-auto mb-8">This store link doesn't exist, or the store hasn't been approved yet. Double-check the link, or start your own store.</p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/" className="text-gray-300 hover:text-white transition-colors">← Back home</Link>
          <Link to="/start-a-store" className="bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold px-6 py-3 rounded-2xl transition-colors">
            Start Your Own Store
          </Link>
        </div>
      </div>
    </div>
  );
}
