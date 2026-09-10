import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mt-16">{children}</main>
      <Footer />
      <Toaster position="top-right" toastOptions={{
        style: { borderRadius: '12px', fontFamily: 'Outfit, sans-serif' },
        success: { iconTheme: { primary: '#f97316', secondary: 'white' } }
      }} />
    </div>
  );
}