import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import CartPage from './pages/CartPage/CartPage';
import OrderSuccessPage from './pages/OrderSuccessPage/OrderSuccessPage';
import AdminPage from './pages/AdminPage/AdminPage';     
import VendorPage from './pages/VendorPage/VendorPage';   

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <div className="app-wrapper">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot" element={<ForgotPasswordPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/order/success" element={<OrderSuccessPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/vendor" element={<VendorPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;