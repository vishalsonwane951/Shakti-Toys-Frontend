import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { ProductSkeleton } from '../components/common/LoadingSkeleton';
import { useShop } from '../context/ShopContext';

const heroSlides = [
  {
    title: 'Speed Meets Precision',
    subtitle: 'Remote Control Cars',
    description: 'Experience the thrill of high-performance RC vehicles built for champions',
    cta: 'Shop RC Cars',
    link: 'products?category=remote-control-cars',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=75&auto=format&fit=crop',
    accent: '#f59300'
  },
  {
    title: 'Collector Edition',
    subtitle: 'Die-Cast Toy Cars',
    description: 'Stunning 1:18 scale models with authentic details for serious collectors',
    cta: 'Explore Collection',
    link: 'products?category=toy-cars',
    img: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=1400&q=75&auto=format&fit=crop',
    accent: '#ef4444'
  },
  {
    title: 'Tech Meets Play',
    subtitle: 'Smart Gadgets',
    description: 'Cutting-edge electronics and gadgets that transform everyday moments',
    cta: 'Shop Gadgets',
    link: 'products?category=gadgets',
    img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1400&q=75&auto=format&fit=crop',
    accent: '#6366f1'
  }
];

// Fallback colors/icons if API doesn't return them
const categoryStyles = [
  'from-red-500/20 to-orange-500/20 border-red-500/20',
  'from-blue-500/20 to-cyan-500/20 border-blue-500/20',
  'from-green-500/20 to-emerald-500/20 border-green-500/20',
  'from-purple-500/20 to-pink-500/20 border-purple-500/20',
  'from-yellow-500/20 to-amber-500/20 border-yellow-500/20',
  'from-teal-500/20 to-cyan-500/20 border-teal-500/20',
];

const categoryIcons = ['🚗', '🎮', '🏍️', '📱', '⚡', '🔋'];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const navigate = useNavigate();
  const { shopSlug } = useShop();

  useEffect(() => {
    if (!shopSlug) return;
    api.get(`/public/${shopSlug}/products/featured`)
      .then(r => setFeatured(r.data?.products ?? []))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));

    api.get(`/public/${shopSlug}/categories`)
      .then(r => setCategories(r.data?.categories ?? []))
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  }, [shopSlug]);

  return (
    <div className="min-h-screen">

      {/* ── Hero Slider ── */}
      <section className="relative h-screen">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop
          className="h-full"
        >
          {heroSlides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="relative h-full">
                <img
                  src={slide.img}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  fetchPriority={i === 0 ? 'high' : 'low'}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-dark-900/95 via-dark-900/70 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 w-full">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.7, delay: 0.15 }}
                      className="max-w-2xl"
                    >
                      <span
                        className="inline-block text-sm font-medium tracking-widest uppercase mb-4 px-4 py-1.5 rounded-full border"
                        style={{ color: slide.accent, borderColor: slide.accent + '50', background: slide.accent + '15' }}
                      >
                        {slide.subtitle}
                      </span>
                      <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                        {slide.title}
                      </h1>
                      <p className="text-lg text-gray-300 mb-8 leading-relaxed">{slide.description}</p>
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/${shopSlug}/${slide.link}`}
                          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-400 text-dark-900 font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 text-base"
                        >
                          {slide.cta}
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </Link>
                        <Link to={`/${shopSlug}/products`} className="text-gray-300 hover:text-white transition-colors font-medium">
                          View All →
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-dark-800 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[['500+', 'Products'], ['10K+', 'Happy Customers'], ['50+', 'Brands'], ['Free', 'Shipping on $50+']].map(([num, label]) => (
              <div key={label}>
                <div className="font-display font-bold text-2xl text-gradient">{num}</div>
                <div className="text-sm text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Cards ── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="text-primary-400 font-medium text-sm tracking-widest uppercase">Browse By</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 text-white">Shop Categories</h2>
        </div>

        {loadingCategories ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-dark-700 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id ?? cat.slug ?? i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/${shopSlug}/products?category=${cat.slug ?? cat._id}`}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${categoryStyles[i % categoryStyles.length]} border hover:scale-105 transition-transform cursor-pointer`}
                >
                  {/* Use image from API if available, else fallback icon */}
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <span className="text-4xl">{cat.icon ?? categoryIcons[i % categoryIcons.length]}</span>
                  )}
                  <span className="text-sm font-semibold text-white text-center">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ── Featured Products ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-primary-400 font-medium text-sm tracking-widest uppercase">Handpicked</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-1 text-white">Featured Products</h2>
          </div>
          <Link to={`/${shopSlug}/products?featured=true`} className="text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1 transition-colors">
            View All
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : featured.length > 0 ? (
          <Swiper
            modules={[Navigation]}
            slidesPerView={2}
            spaceBetween={16}
            navigation
            breakpoints={{
              640:  { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 5 }
            }}
          >
            {featured.map(p => (
              <SwiperSlide key={p._id}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="text-center text-gray-400 py-12">No featured products available.</p>
        )}
      </section>

      {/* ── Promo Banners ── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden h-52 group cursor-pointer"
            onClick={() => navigate(`/${shopSlug}/products?category=remote-control-cars`)}
          >
            <img
              src="https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=75&auto=format&fit=crop"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt="RC Cars"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-center">
              <span className="text-primary-400 font-medium text-xs uppercase tracking-widest mb-2">Up to 30% off</span>
              <h3 className="font-display text-2xl font-bold text-white mb-3">RC Cars Sale</h3>
              <span className="inline-flex items-center gap-1 text-sm text-white bg-primary-500/80 hover:bg-primary-500 px-4 py-2 rounded-full w-fit transition-colors">
                Shop Now →
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden h-52 group cursor-pointer"
            onClick={() => navigate(`/${shopSlug}/products?category=small-electronics`)}
          >
            <img
              src="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=75&auto=format&fit=crop"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt="Electronics"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-center">
              <span className="text-purple-400 font-medium text-xs uppercase tracking-widest mb-2">New Arrivals</span>
              <h3 className="font-display text-2xl font-bold text-white mb-3">Smart Electronics</h3>
              <span className="inline-flex items-center gap-1 text-sm text-white bg-purple-500/80 hover:bg-purple-500 px-4 py-2 rounded-full w-fit transition-colors">
                Explore →
              </span>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}