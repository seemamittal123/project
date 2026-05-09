import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import PromoBar from './components/PromoBar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';

import { AdminAuthProvider } from './admin/AuthContext.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import AdminProducts from './admin/AdminProducts.jsx';
import AdminBanners from './admin/AdminBanners.jsx';
import AdminReels from './admin/AdminReels.jsx';
import AdminTestimonials from './admin/AdminTestimonials.jsx';
import AdminPromoMessages from './admin/AdminPromoMessages.jsx';
import AdminMediaLogos from './admin/AdminMediaLogos.jsx';
import AdminFaqs from './admin/AdminFaqs.jsx';

export default function App() {
    const { pathname } = useLocation();
    const isAdmin = pathname.startsWith('/admin');

    return (
        <AdminAuthProvider>
            {!isAdmin && <PromoBar />}
            {!isAdmin && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Products />} />
                <Route path="/shop/:category" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="reels" element={<AdminReels />} />
                    <Route path="testimonials" element={<AdminTestimonials />} />
                    <Route path="promo-messages" element={<AdminPromoMessages />} />
                    <Route path="media-logos" element={<AdminMediaLogos />} />
                    <Route path="faqs" element={<AdminFaqs />} />
                </Route>
            </Routes>
            {!isAdmin && <Footer />}
        </AdminAuthProvider>
    );
}
