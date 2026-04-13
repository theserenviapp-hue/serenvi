'use client';

import { useState } from 'react';
import { DashboardNav } from '@/components/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'physical' | 'digital';
  gender?: 'mens' | 'womens' | 'unisex';
}

const PRODUCTS: Product[] = [
  { id: 'phys-1', name: 'Premium Skincare Bundle', description: 'Complete skincare set with moisturizer, cleanser, and serum for healthy glowing skin', price: 3500, category: 'physical', gender: 'mens' },
  { id: 'phys-2', name: 'Wireless Bluetooth Earbuds', description: 'High-quality audio experience with noise cancellation and 24-hour battery life', price: 4200, category: 'physical', gender: 'unisex' },
  { id: 'phys-3', name: 'Luxury Watch Collection', description: 'Elegant timepiece with premium leather strap and water-resistant design', price: 4800, category: 'physical', gender: 'mens' },
  { id: 'phys-4', name: 'Portable Phone Charger', description: 'Fast charging power bank with 20000mAh capacity and dual USB ports', price: 3200, category: 'physical', gender: 'unisex' },
  { id: 'phys-5', name: "Women's Premium Jewelry Set", description: 'Elegant jewelry collection with necklace, bracelet, and earrings in 18K gold', price: 5200, category: 'physical', gender: 'womens' },
  { id: 'phys-6', name: "Men's Leather Wallet", description: 'Genuine leather wallet with RFID protection and multiple card slots', price: 2800, category: 'physical', gender: 'mens' },
  { id: 'digit-1', name: 'Monthly Subscription Plan', description: 'Access to exclusive content, premium features, and priority customer support', price: 3999, category: 'digital', gender: 'unisex' },
  { id: 'digit-2', name: 'Digital Course Bundle', description: 'Complete training package with video tutorials, certificates, and lifetime access', price: 4500, category: 'digital', gender: 'unisex' },
  { id: 'digit-3', name: 'Cloud Storage Premium', description: '1TB cloud storage with unlimited file sharing and advanced security features', price: 3800, category: 'digital', gender: 'unisex' },
  { id: 'digit-4', name: 'Software License', description: 'Professional software license with 1-year updates and technical support included', price: 4900, category: 'digital', gender: 'unisex' },
];

export default function ShopPage() {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'physical' | 'digital' | 'all'>('all');
  const [filterGender, setFilterGender] = useState<'mens' | 'womens' | 'unisex' | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');

  const filteredProducts = PRODUCTS.filter((p) => {
    const categoryMatch = filterCategory === 'all' || p.category === filterCategory;
    const genderMatch = filterGender === 'all' || p.gender === filterGender;
    return categoryMatch && genderMatch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      default: return a.name.localeCompare(b.name);
    }
  });

  const physicalProducts = filteredProducts.filter((p) => p.category === 'physical');
  const digitalProducts = filteredProducts.filter((p) => p.category === 'digital');

  const handlePurchase = async (productId: string, productName: string) => {
    setPurchasing(productId);
    try {
      const response = await fetch('/api/products/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, paymentMethod: 'BANK' }),
      });
      const data = await response.json();
      if (data.success) {
        alert(`Purchase successful! You have purchased: ${productName}`);
      } else {
        alert(data.error || 'Purchase failed');
      }
    } catch {
      alert('An error occurred during purchase');
    } finally {
      setPurchasing(null);
    }
  };

  const renderProductCard = (product: Product, colorScheme: 'amber' | 'blue') => (
    <Card key={product.id} className={`flex flex-col h-full hover:shadow-xl transition border-${colorScheme}-100 bg-white`}>
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">{product.name}</h3>
        <div className="flex flex-col gap-1 ml-2">
          <span className={`bg-${colorScheme}-100 text-${colorScheme}-800 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap`}>
            {product.category === 'physical' ? 'Physical' : 'Digital'}
          </span>
          {product.gender && product.gender !== 'unisex' && (
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap text-center">
              {product.gender === 'mens' ? "Men's" : "Women's"}
            </span>
          )}
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{product.description}</p>
      <div className={`border-t border-${colorScheme}-100 pt-4`}>
        <p className={`text-2xl font-bold text-${colorScheme}-600 mb-4`}>₹{product.price.toLocaleString()}</p>
        <Button
          onClick={() => handlePurchase(product.id, product.name)}
          disabled={purchasing === product.id}
          className={`w-full bg-${colorScheme}-600 hover:bg-${colorScheme}-700`}
        >
          {purchasing === product.id ? 'Processing...' : 'Purchase'}
        </Button>
      </div>
    </Card>
  );

  return (
    <>
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
          <p className="text-gray-600 mt-2">Browse and purchase physical and digital products</p>
        </div>

        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as any)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="all">All Categories</option>
                <option value="physical">Physical Products</option>
                <option value="digital">Digital Products</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select value={filterGender} onChange={(e) => setFilterGender(e.target.value as any)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="all">All Products</option>
                <option value="mens">Men's</option>
                <option value="womens">Women's</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredProducts.length}</span> of <span className="font-semibold">{PRODUCTS.length}</span> products
          </div>
        </div>

        {physicalProducts.length > 0 && (
          <div className="mb-16 p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <h2 className="text-3xl font-bold text-amber-900 mb-6">Physical Products ({physicalProducts.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {physicalProducts.map((p) => renderProductCard(p, 'amber'))}
            </div>
          </div>
        )}

        {digitalProducts.length > 0 && (
          <div className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Digital Products ({digitalProducts.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {digitalProducts.map((p) => renderProductCard(p, 'blue'))}
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your filters.</p>
          </div>
        )}
      </div>
    </>
  );
}
