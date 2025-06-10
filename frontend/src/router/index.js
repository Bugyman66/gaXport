import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Register from '../views/Register.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import ResetPassword from '../views/ResetPassword.vue';
import Fund from '../views/Fund.vue';
import Buy from "../views/Buy.vue";
import TransactionHistory from "../views/TransactionHistory.vue";
import Profile from '../views/Profile.vue';
import SecuritySettings from '../views/SecuritySettings.vue';
import PersonalDetails from '../views/PersonalDetails.vue';
import AdminLogin from '../views/AdminLogin.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import VendorProfile from '../views/VendorProfile.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/register', component: Register, meta: { guest: true } }, 
  { path: '/login', component: Login, meta: { guest: true } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/forgot-password', component: ForgotPassword },
  { path: '/reset-password', component: ResetPassword },
  { path: '/fund', component: Fund, meta: { requiresAuth: true } },
  { path: '/buy', component: Buy },
  { 
    path: '/transaction-history', 
    name: 'TransactionHistory',
    component: TransactionHistory, 
    meta: { requiresAuth: true } 
  },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { 
    path: '/terms', 
    component: () => import('../views/Terms.vue')
  },
  { 
    path: '/privacy', 
    component: () => import('../views/Privacy.vue')
  },
  {
    path: '/security-settings',
    name: 'SecuritySettings',
    component: SecuritySettings
  },
  {
    path: '/personal-details',
    name: 'PersonalDetails',
    component: PersonalDetails,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: TransactionHistory,
    meta: { requiresAuth: true }
  },
  {
    path: '/vendor/register',
    name: 'VendorRegister',
    component: () => import('../views/VendorRegister.vue')
  },
  {
    path: '/vendor/login',
    name: 'VendorLogin',
    component: () => import('../views/VendorLogin.vue')
  },
  {
    path: '/vendor/dashboard',
    name: 'VendorDashboard',
    component: () => import('../views/VendorDashboard.vue'),
    meta: { requiresVendorAuth: true }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: { guest: true }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/add-vendor',
    name: 'AddVendor',
    component: () => import('../views/AddVendor.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/vendor/profile',
    name: 'VendorProfile',
    component: VendorProfile,
    meta: { requiresAuth: true, requiresVendor: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Authentication helper
export const isAuthenticated = () => {
  return !!localStorage.getItem("token") || 
         !!localStorage.getItem("vendor_token") || 
         !!localStorage.getItem("admin_token");
};

export const isVendorRoute = (path) => {
  return path.startsWith('/vendor');
};

export const isAdminRoute = (path) => {
  return path.startsWith('/admin');
};

// Navigation Guard
router.beforeEach((to, from, next) => {
  const userToken = localStorage.getItem("token");
  const vendorToken = localStorage.getItem("vendor_token");
  const adminToken = localStorage.getItem("admin_token");
  const isVendorPath = isVendorRoute(to.path);
  const isAdminPath = isAdminRoute(to.path);

  console.log("User Token:", userToken);
  console.log("Vendor Token:", vendorToken);
  console.log("Admin Token:", adminToken);
  console.log("Navigating to:", to.path);

  if (to.meta.requiresAuth) {
    if (isAdminPath && !adminToken) {
      console.log("Redirecting to admin login");
      next("/admin/login");
    } else if (isVendorPath && !vendorToken) {
      console.log("Redirecting to vendor login");
      next("/vendor/login");
    } else if (!isVendorPath && !isAdminPath && !userToken) {
      console.log("Redirecting to user login");
      next("/login");
    } else {
      next();
    }
  } else if (to.meta.guest) {
    if (isAdminPath && adminToken) {
      console.log("Redirecting to admin dashboard");
      next("/admin/dashboard");
    } else if (isVendorPath && vendorToken) {
      console.log("Redirecting to vendor dashboard");
      next("/vendor/dashboard");
    } else if (!isVendorPath && !isAdminPath && userToken) {
      console.log("Redirecting to user dashboard");
      next("/dashboard");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
