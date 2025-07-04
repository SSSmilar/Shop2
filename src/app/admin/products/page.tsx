'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  size: string;
  color: string;
  stock: number;
  sellerId: string;
}

export default function ProductsAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageFile: null as File | null,
    category: '',
    size: '',
    color: '',
    stock: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    if (status === 'authenticated') {
      fetchProducts();
    }
  }, [status]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const isAdmin = session && session.user && 'role' in session.user && session.user.role === 'ADMIN';
      const response = await fetch(
        isAdmin
          ? '/api/admin/products'
          : '/api/seller/products'
      );
      if (!response.ok) throw new Error('Ошибка при загрузке товаров');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imageFile: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploading(true);
    try {
      let imageUrl = '';
      if (formData.imageFile) {
        const imgData = new FormData();
        imgData.append('file', formData.imageFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: imgData,
        });
        if (!uploadRes.ok) throw new Error('Ошибка загрузки изображения');
        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.url;
      }
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      });
      if (!response.ok) throw new Error('Ошибка при создании товара');
      setFormData({
        name: '',
        description: '',
        price: '',
        imageFile: null,
        category: '',
        size: '',
        color: '',
        stock: '',
      });
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Удалить товар?')) return;
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Ошибка при удалении товара');
      // Удаляем изображение
      if (imageUrl) {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: imageUrl }),
        });
      }
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Управление товарами</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Добавить товар</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Название</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Описание</label>
              <textarea required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Цена (₽)</label>
              <input type="number" required min="0" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Изображение</label>
              <input type="file" accept="image/*" required onChange={handleImageChange} className="mt-1 block w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Категория</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Размер</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Цвет</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">В наличии (шт)</label>
              <input type="number" required min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
            </div>
            <button type="submit" disabled={uploading} className="w-full bg-indigo-600 text-white py-2 rounded-md font-semibold hover:bg-indigo-700 transition">
              {uploading ? 'Добавление...' : 'Добавить товар'}
            </button>
          </form>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Ваши товары</h2>
          <ul className="space-y-4">
            {products.map(product => (
              <li key={product.id} className="flex items-center gap-4 border p-4 rounded-md bg-white">
                <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-semibold text-lg text-gray-900">{product.name}</div>
                  <div className="text-gray-700">{product.description}</div>
                  <div className="text-gray-700">Цена: {product.price} ₽</div>
                  <div className="text-gray-700">Категория: {product.category}</div>
                  <div className="text-gray-700">Размер: {product.size}</div>
                  <div className="text-gray-700">Цвет: {product.color}</div>
                  <div className="text-gray-700">В наличии: {product.stock}</div>
                </div>
                <button onClick={() => handleDelete(product.id, product.imageUrl)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Удалить</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 