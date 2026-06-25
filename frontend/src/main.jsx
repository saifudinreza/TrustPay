import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import { isAuthenticated } from './lib/auth.js'

// Lazy load setiap halaman — chunk terpisah di build, tidak diunduh sampai dibutuhkan.
// Ini mengurangi ukuran bundle awal dan mempercepat First Contentful Paint.
const Landing      = lazy(() => import('./pages/Landing.jsx'))
const Dashboard    = lazy(() => import('./pages/Dashboard.jsx'))
const Login        = lazy(() => import('./pages/Login.jsx'))
const Register     = lazy(() => import('./pages/Register.jsx'))
const Profile      = lazy(() => import('./pages/Profile.jsx'))
const AuthCallback = lazy(() => import('./pages/AuthCallback.jsx'))

/** Spinner saat Suspense menunggu chunk halaman diunduh */
const PageLoader = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFF1EC', color: '#17191D', fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 600 }}>
    Memuat halaman...
  </div>
)

/**
 * Protected — hanya boleh diakses oleh user yang sudah login.
 * isAuthenticated() membaca cookie token; jika tidak ada → redirect ke /masuk.
 */
function Protected({ children }) {
  return isAuthenticated() ? children : <Navigate to="/masuk" replace />
}

/**
 * Guest — hanya boleh diakses oleh user yang BELUM login.
 * Mencegah user yang sudah login mengunjungi /masuk atau /daftar lagi.
 */
function Guest({ children }) {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children
}

// Definisi rute — semua dibungkus Suspense untuk lazy loading
const router = createBrowserRouter([
  {
    path: '/',
    element: <Suspense fallback={<PageLoader />}><Landing /></Suspense>,
  },
  {
    path: '/masuk',
    element: <Suspense fallback={<PageLoader />}><Guest><Login /></Guest></Suspense>,
  },
  {
    path: '/daftar',
    element: <Suspense fallback={<PageLoader />}><Guest><Register /></Guest></Suspense>,
  },
  {
    path: '/dashboard',
    element: <Suspense fallback={<PageLoader />}><Protected><Dashboard /></Protected></Suspense>,
  },
  {
    path: '/profil',
    element: <Suspense fallback={<PageLoader />}><Protected><Profile /></Protected></Suspense>,
  },
  {
    // Penerima redirect OAuth Google — TIDAK dibungkus Guest/Protected
    // karena token belum tersimpan saat halaman ini dimuat pertama kali
    path: '/auth/callback',
    element: <Suspense fallback={<PageLoader />}><AuthCallback /></Suspense>,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode: deteksi side-effect tidak disengaja di development (render 2x)
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
