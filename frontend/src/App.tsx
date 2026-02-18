import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import TransparencyPage from "./pages/TransparencyPage";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import NotFoundPage from "./pages/NotFoundPage";

const queryClient = new QueryClient();

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

const App = () => (
    <HelmetProvider>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <CartProvider>
                    <TooltipProvider>
                        <ErrorBoundary>
                            <Toaster />
                            <Sonner />
                            <BrowserRouter>
                                <ScrollToTop />
                                <CartDrawer />
                                <Routes>
                                    <Route path="/" element={<Index />} />
                                    <Route path="/transparency" element={
                                        <ProtectedRoute>
                                            <TransparencyPage />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/product" element={<ProductPage />} />
                                    <Route path="/checkout" element={<CheckoutPage />} />
                                    <Route path="/auth" element={<AuthPage />} />
                                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                                    <Route path="/terms-of-service" element={<TermsOfService />} />
                                    <Route path="/refund-policy" element={<RefundPolicy />} />
                                    <Route path="/profile" element={
                                        <ProtectedRoute>
                                            <ProfilePage />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/admin" element={
                                        <ProtectedRoute requiredRole="admin">
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="*" element={<NotFoundPage />} />
                                </Routes>
                            </BrowserRouter>
                        </ErrorBoundary>
                    </TooltipProvider>
                </CartProvider>
            </AuthProvider>
        </QueryClientProvider>
    </HelmetProvider>
);

export default App;
