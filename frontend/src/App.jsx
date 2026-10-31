import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Store, ShieldCheck, Database, Server } from 'lucide-react';
import api from './services/api';
import StatsCards from './components/StatsCards';
import LowStockBanner from './components/LowStockBanner';
import SearchBar from './components/SearchBar';
import ProductTable from './components/ProductTable';
import ProductModal from './components/ProductModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import NotificationToast from './components/NotificationToast';

export default function App() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'low-stock' | 'out-of-stock'
  const [sortBy, setSortBy] = useState('default');

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Load products and summary stats
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (activeFilter === 'low-stock') {
        params.lowStock = true;
      }

      const [productsData, statsData] = await Promise.all([
        api.getProducts(params),
        api.getStats()
      ]);

      setProducts(productsData || []);
      setStats(statsData);
    } catch (err) {
      showToast(err.message || 'Failed to load inventory data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter]);

  // Initial fetch and debounce when search changes
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData();
    }, 250);

    return () => clearTimeout(handler);
  }, [fetchData]);

  // Sort and secondary in-memory filtering (e.g., out-of-stock)
  const displayedProducts = useMemo(() => {
    let list = [...products];

    if (activeFilter === 'out-of-stock') {
      list = list.filter((p) => (p.quantity ?? 0) === 0);
    }

    if (sortBy === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === 'stock-asc') {
      list.sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
    } else if (sortBy === 'stock-desc') {
      list.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
    }

    return list;
  }, [products, activeFilter, sortBy]);

  // Handle Create or Update
  const handleSaveProduct = async (payload, editId) => {
    if (editId) {
      await api.updateProduct(editId, payload);
      showToast(`Product "${payload.name}" updated successfully.`);
    } else {
      await api.createProduct(payload);
      showToast(`Product "${payload.name}" (${payload.productId}) added to inventory.`);
    }
    await fetchData();
  };

  // Handle Quick stock adjustment
  const handleQuickStockUpdate = async (product, newQuantity) => {
    if (newQuantity < 0) return;

    try {
      await api.updateStock(product.id, newQuantity);
      if (newQuantity < 5 && newQuantity > 0) {
        showToast(`Stock updated to ${newQuantity}. ⚠️ Low stock warning active!`, 'error');
      } else {
        showToast(`Stock for ${product.name} updated to ${newQuantity}.`);
      }
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to update stock.', 'error');
    }
  };

  // Handle Delete
  const handleConfirmDelete = async (productId) => {
    try {
      await api.deleteProduct(productId);
      showToast('Product deleted from inventory.');
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to delete product.', 'error');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <header className="navbar">
        <div className="navbar-content">
          <div className="brand">
            <div className="brand-icon">
              <Store size={22} />
            </div>
            <div>
              <h1 className="brand-title">Shop Inventory Management</h1>
              <p className="brand-subtitle">Smart stock tracking &amp; low-stock alerts for small businesses</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{ 
                fontSize: '0.78rem', 
                color: '#16a34a', 
                background: '#f0fdf4', 
                padding: '5px 10px', 
                borderRadius: '999px',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={14} />
              <span>Spring Boot REST API Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Low-Stock Warning Banner if any items are under 5 */}
        <LowStockBanner
          count={stats?.lowStockCount}
          onViewLowStock={() => setActiveFilter('low-stock')}
        />

        {/* Top Summary Statistics Cards */}
        <StatsCards
          stats={stats}
          activeFilter={activeFilter}
          onFilterChange={(filter) => setActiveFilter(filter)}
        />

        {/* Search, Filter pills, and Controls */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onOpenAddModal={handleOpenAdd}
          onRefresh={fetchData}
          lowStockCount={stats?.lowStockCount}
        />

        {/* Product Inventory Table */}
        <ProductTable
          products={displayedProducts}
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onQuickStockUpdate={handleQuickStockUpdate}
        />
      </main>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        product={productToDelete}
      />

      {/* Floating Notifications */}
      <NotificationToast
        toast={toast}
        onDismiss={() => setToast(null)}
      />
    </div>
  );
}
