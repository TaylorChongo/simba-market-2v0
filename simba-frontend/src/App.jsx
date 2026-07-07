import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { BranchProvider } from './context/BranchContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import SuccessPage from './pages/SuccessPage';
import CategoryPage from './pages/CategoryPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ClientDashboard from './pages/ClientDashboard';
import BranchManagerDashboard from './pages/BranchManagerDashboard';
import BranchStaffDashboard from './pages/BranchStaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorOrders from './pages/vendor/VendorOrders';
import AddProduct from './pages/vendor/AddProduct';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import ShippingPolicy from './pages/ShippingPolicy';
import Returns from './pages/Returns';
import Branches from './pages/Branches';
import About from './pages/About';
import InlineBranchMap from './components/InlineBranchMap';
import Concierge from './components/Concierge';
import BottomNav from './components/BottomNav';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BranchProvider>
            <CartProvider>
              <Router>
                <ScrollToTop />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/category/:categoryName" element={<CategoryPage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/success" element={<SuccessPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                  <Route path="/returns" element={<Returns />} />
                  <Route path="/branches" element={<Branches />} />
                  <Route path="/about" element={<About />} />

                  {/* Protected Routes */}
                  <Route 
                    path="/dashboard/client" 
                    element={
                      <ProtectedRoute allowedRoles={['CLIENT']}>
                        <ClientDashboard />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Vendor Routes */}
                  <Route 
                    path="/dashboard/vendor" 
                    element={
                      <ProtectedRoute allowedRoles={['VENDOR']}>
                        <VendorDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard/vendor/products" 
                    element={
                      <ProtectedRoute allowedRoles={['VENDOR']}>
                        <VendorProducts />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard/vendor/orders" 
                    element={
                      <ProtectedRoute allowedRoles={['VENDOR']}>
                        <VendorOrders />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard/vendor/add-product" 
                    element={
                      <ProtectedRoute allowedRoles={['VENDOR']}>
                        <AddProduct />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Branch Management Routes */}
                  <Route 
                    path="/dashboard/branch-manager" 
                    element={
                      <ProtectedRoute allowedRoles={['BRANCH_MANAGER']}>
                        <BranchManagerDashboard />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/dashboard/branch-staff" 
                    element={
                      <ProtectedRoute allowedRoles={['BRANCH_STAFF']}>
                        <BranchStaffDashboard />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/dashboard/admin" 
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
                <InlineBranchMap />
                <Concierge />
                <BottomNav />
              </Router>
            </CartProvider>
          </BranchProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
