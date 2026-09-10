import { useState, useEffect } from 'react';
import api from '../services/api';

export function useProducts(shopSlug, params = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (!shopSlug) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/public/${shopSlug}/products`, { params });
        setProducts(data.products);
        setPagination({ page: data.page, pages: data.pages, total: data.total });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [shopSlug, JSON.stringify(params)]);

  return { products, loading, error, pagination };
}

// Public (unauthenticated) product lookup, scoped by shop slug — used on the storefront.
export function useProduct(shopSlug, id) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !shopSlug) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/public/${shopSlug}/products/${id}`);
        setProduct(data.product);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [shopSlug, id]);

  return { product, loading, error, setProduct };
}
