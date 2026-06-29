import { Route, Routes, Outlet } from 'react-router-dom';
import { ThemeProvider } from '@material-tailwind/react';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { CartProvider } from './contexts/CartContext';
import AdminRoute from './Components/AdminRoute';
import Navbar from './Components/Navbar';
import MainPage from './pages/MainPage';
import MainProductDetails from './pages/MainProductDetails';
import CategoryPage from './pages/CategoryPage';
import RecentlyViewed from './pages/RecentlyViewed';
import Categories from './Components/Categories';
import Footer from './Components/Footer';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import SearchResults from './pages/SearchResults';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EditProfile from './pages/auth/EditProfile';
import Addresses from './pages/auth/Addresses';
import MyOrders from './pages/orders/MyOrders';
import AdminLogin from './admin/pages/AdminLogin';
import AdminLayout from './admin/components/AdminLayout';
import AdminHome from './admin/pages/AdminHome';
import AdminOrders from './admin/pages/orders/AdminOrders';
import AdminProducts from './admin/pages/products/AdminProducts';
import AdminUsers from './admin/pages/AdminUsers';

const PublicLayout = () => (
  <>
    <Navbar />
    <Categories />
    <Outlet />
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <ThemeProvider>
            <div className="app-bg min-h-screen text-white">
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/carrinho" element={<Cart />} />
                  <Route path="/produto/:id" element={<MainProductDetails />} />
                  <Route path="/perfil" element={<Profile />} />
                  <Route path="/categoria/:slug" element={<CategoryPage />} />
                  <Route path="/vistos-recentemente" element={<RecentlyViewed />} />
                  <Route path="/favoritos" element={<Favorites />} />
                  <Route path="/busca" element={<SearchResults />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/perfil/editar" element={<EditProfile />} />
                  <Route path="/perfil/enderecos" element={<Addresses />} />
                  <Route path="/perfil/pedidos" element={<MyOrders />} />
                </Route>

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminHome />} />
                  <Route path="pedidos" element={<AdminOrders />} />
                  <Route path="produtos" element={<AdminProducts />} />
                  <Route path="usuarios" element={<AdminUsers />} />
                </Route>
              </Routes>
            </div>
          </ThemeProvider>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
