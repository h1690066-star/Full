import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import ProductModal from './components/ProductModal';
import Orders from './components/Orders';
import OrderReceiptModal from './components/OrderReceiptModal';
import Customers from './components/Customers';
import SiteEditor from './components/SiteEditor';
import { getDashboardStats } from './api/api';

function AdminContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [navCounts, setNavCounts] = useState({
    products: 0,
    orders: 0,
    newOrders: 0,
    customers: 0,
  });

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    getDashboardStats()
      .then((data) => {
        if (data?.summary) {
          setNavCounts({
            products: data.summary.totalProducts || 0,
            orders: data.summary.totalOrders || 0,
            newOrders: data.summary.newOrders || 0,
            customers: data.summary.totalCustomers || 0,
          });
        }
      })
      .catch(() => {});
  }, [isAuthenticated, refreshKey]);

  if (!isAuthenticated) {
    return <Login />;
  }

  const tabTitles = {
    dashboard: 'Boshqaruv va Analitika Markazi',
    products: 'Mahsulotlar va Ombor Boshqaruvi',
    orders: 'Buyurtmalar va To\'lov Nazorati',
    customers: 'Mijozlar Bazasi (CRM)',
    'site-editor': 'Saytni Tahrirlash (Live CMS)',
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#f1f4f9] text-slate-800 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddProduct={handleOpenAddProduct}
        counts={navCounts}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar
          title={tabTitles[activeTab] || 'Boshqaruv paneli'}
          activeTab={activeTab}
          search={globalSearch}
          setSearch={setGlobalSearch}
          onRefresh={triggerRefresh}
          onOpenAddProduct={handleOpenAddProduct}
        />

        {/* Tab Views */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              key={`dash-${refreshKey}`}
              setActiveTab={setActiveTab}
              onSelectOrder={handleSelectOrder}
              onOpenAddProduct={handleOpenAddProduct}
            />
          )}

          {activeTab === 'products' && (
            <Products
              key={`prod-${refreshKey}`}
              onOpenAddProduct={handleOpenAddProduct}
              onEditProduct={handleEditProduct}
              globalSearch={globalSearch}
            />
          )}

          {activeTab === 'orders' && (
            <Orders
              key={`ord-${refreshKey}`}
              onSelectOrder={handleSelectOrder}
              globalSearch={globalSearch}
            />
          )}

          {activeTab === 'customers' && (
            <Customers
              key={`cust-${refreshKey}`}
              globalSearch={globalSearch}
            />
          )}

          {activeTab === 'site-editor' && (
            <SiteEditor key={`cms-${refreshKey}`} />
          )}
        </main>
      </div>

      {/* Global Product Add/Edit Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onRefresh={triggerRefresh}
        editingProduct={editingProduct}
      />

      {/* Global Order Detail & Receipt Modal */}
      <OrderReceiptModal
        order={selectedOrder}
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        onStatusUpdated={triggerRefresh}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}
