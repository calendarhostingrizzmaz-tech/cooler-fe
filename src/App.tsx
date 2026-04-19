import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import LandingPage from './pages/LandingPage';
import StorePage from './pages/StorePage';
import AboutPage from './pages/AboutPage';
import FaqPage from './pages/FaqPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DonationPage from './pages/DonationPage';
import LoginPage from './pages/admin/LoginPage';
import ForgotPasswordPage from './pages/admin/ForgotPasswordPage';
import ItemsPage from './pages/admin/ItemsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import SettingsPage from './pages/admin/SettingsPage';
import ProtectedRoute from './components/admin/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-white flex flex-col">
            <Routes>
              {/* Admin routes (no shared navbar) */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/admin/items"
                element={
                  <ProtectedRoute>
                    <ItemsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute>
                    <CategoriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Customer routes */}
              <Route
                path="/*"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/store" element={<StorePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/faqs" element={<FaqPage />} />
                        <Route path="/donation" element={<DonationPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                }
              />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
