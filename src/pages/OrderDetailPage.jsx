import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSkeleton';
import { useShop } from '../context/shop-context';

const statusColors = {
  pending:    'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  shipped:    'bg-purple-500/20 text-purple-400 border-purple-500/20',
  delivered:  'bg-green-500/20 text-green-400 border-green-500/20',
  cancelled:  'bg-red-500/20 text-red-400 border-red-500/20',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const { shopSlug, currencySymbol } = useShop();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/shop/orders/${id}`)
      .then(r => setOrder(r.data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pt-20"><LoadingSpinner /></div>;
  if (!order)  return <div className="pt-24 text-center text-gray-400">Order not found</div>;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold">Order Details</h1>
            <p className="text-gray-400 text-sm mt-1">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize border ${statusColors[order.status] || 'bg-gray-700/50 text-gray-300 border-gray-600'}`}>
            {order.status}
          </span>
        </div>

        <div className="grid gap-6">
          {/* Items */}
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
            <h2 className="font-display font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover bg-dark-700"
                    loading="lazy"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=50'}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-400">Qty: {item.quantity}</div>
                  </div>
                  <span className="font-semibold text-primary-400">
                    {currencySymbol}{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 mt-5 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-400"><span>Items</span><span>{currencySymbol}{order.itemsPrice?.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-gray-400"><span>Shipping</span><span>{currencySymbol}{order.shippingPrice?.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-gray-400"><span>Tax</span><span>{currencySymbol}{order.taxPrice?.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="text-primary-400">{currencySymbol}{order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-6">
            <h2 className="font-display font-semibold mb-4">Shipping Address</h2>
            <p className="text-gray-300">{order.shippingAddress?.fullName}</p>
            <p className="text-gray-400 text-sm">{order.shippingAddress?.street}</p>
            <p className="text-gray-400 text-sm">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
            </p>
            <p className="text-gray-400 text-sm">{order.shippingAddress?.country}</p>
            <p className="text-gray-400 text-sm">📞 {order.shippingAddress?.phone}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to={`/${shopSlug}/dashboard`} className="text-primary-400 hover:text-primary-300 transition-colors">
            ← Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
}