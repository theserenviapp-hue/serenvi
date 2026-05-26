'use client';

import { useState, useEffect } from 'react';
import { DashboardNav } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'PHYSICAL' | 'DIGITAL';
  category?: string;
  gender?: string;
  imageUrl?: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'PHYSICAL' | 'DIGITAL' | 'all'>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/products?take=500');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        
        // API returns { products: [...], total: number }
        const productList = Array.isArray(data.products) ? data.products : data;
        
        // Normalize products
        const normalizedProducts = (Array.isArray(productList) ? productList : []).map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: parseFloat(p.price),
          type: p.type || 'PHYSICAL',
          category: p.category || 'Clothing',
          gender: p.gender || 'Unisex',
          imageUrl: p.imageUrl,
        }));
        setProducts(normalizedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        // Fallback to empty state if API fails
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products.filter((p) => {
    const categoryMatch = filterCategory === 'all' || p.type === filterCategory;
    const genderMatch = filterGender === 'all' || p.gender === filterGender;
    return categoryMatch && genderMatch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const physicalProducts = filteredProducts.filter((p) => p.type === 'PHYSICAL');
  const digitalProducts = filteredProducts.filter((p) => p.type === 'DIGITAL');

  const handlePurchase = async (productId: string, productName: string, price: number) => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) return;
    setPurchasing(productId);

    try {
      const response = await fetch('/api/products/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId,
          paymentMethod: 'BANK',
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Purchase successful! You have purchased: ${productName}`);
      } else {
        alert(data.error || 'Purchase failed');
      }
    } catch (err) {
      alert('An error occurred during purchase');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
          <p className="text-gray-600 mt-2">Browse and purchase physical and digital products</p>
        </div>

        {/* Filter and Sort Controls */}
        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as 'PHYSICAL' | 'DIGITAL' | 'all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="PHYSICAL">Physical Products</option>
                <option value="DIGITAL">Digital Products</option>
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Products</option>
                <option value="Male">Men's</option>
                <option value="Female">Women's</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price-low' | 'price-high')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            {loading ? (
              'Loading products...'
            ) : (
              <>
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> of{' '}
                <span className="font-semibold text-gray-900">{products.length}</span> products
              </>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found. Please try again later.</p>
          </div>
        )}

        {/* Physical Products Section */}
        {!loading && physicalProducts.length > 0 && (
          <div className="mb-16 p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-amber-900 flex items-center gap-3">
                <span className="text-4xl">📦</span> 
                <span>Physical Products</span>
                <span className="ml-auto bg-amber-200 text-amber-900 px-3 py-1 rounded-full text-sm font-semibold">
                  {physicalProducts.length} Items
                </span>
              </h2>
              <p className="text-amber-700 mt-2">High-quality physical items delivered to your doorstep</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {physicalProducts.map((product) => (
                <Card key={product.id} className="flex flex-col h-full hover:shadow-xl transition border-amber-100 bg-white">
                  {product.imageUrl && (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-48 object-cover rounded-t-lg mb-4"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{product.name}</h3>
                    <div className="flex flex-col gap-1 ml-2">
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                        {product.type}
                      </span>
                      {product.gender && (
                        <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap text-center">
                          {product.gender}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">{product.description.substring(0, 100)}...</p>
                  <div className="border-t border-amber-100 pt-4">
                    <p className="text-2xl font-bold text-amber-600 mb-4">₹{product.price.toLocaleString()}</p>
                    <Button
                      onClick={() => handlePurchase(product.id, product.name, product.price)}
                      disabled={purchasing === product.id}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      {purchasing === product.id ? 'Processing...' : 'Purchase'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Digital Products Section */}
        {!loading && digitalProducts.length > 0 && (
          <div className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
                <span className="text-4xl">💻</span> 
                <span>Digital Products</span>
                <span className="ml-auto bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-sm font-semibold">
                  {digitalProducts.length} Items
                </span>
              </h2>
              <p className="text-blue-700 mt-2">Instant access to digital content and services</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {digitalProducts.map((product) => (
                <Card key={product.id} className="flex flex-col h-full hover:shadow-xl transition border-blue-100 bg-white">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{product.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2">
                      Digital
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 flex-grow">{product.description}</p>
                  <div className="border-t border-blue-100 pt-4">
                    <p className="text-2xl font-bold text-blue-600 mb-4">₹{product.price.toLocaleString()}</p>
                    <Button
                      onClick={() => handlePurchase(product.id, product.name, product.price)}
                      disabled={purchasing === product.id}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {purchasing === product.id ? 'Processing...' : 'Purchase'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!loading && filteredProducts.length === 0 && products.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your filters.</p>
          </div>
        )}
      </div>
    </>
  );
}
