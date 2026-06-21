import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import { isAuthenticated } from './lib/auth.js'

const Landing = lazy(() => import('./pages/Landing.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))

// Loading Spinner for Suspense Fallback
const PageLoader = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EFF1EC', color: '#11203D', fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 600 }}>
    Memuat halaman...
  </div>
)

function Protected({ children }) {
  return isAuthenticated() ? children : <Navigate to="/masuk" replace />
}

function Guest({ children }) {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children
}

const router = createBrowserRouter([
  { path: '/', element: <Suspense fallback={<PageLoader />}><Landing /></Suspense> },
  { path: '/masuk', element: <Suspense fallback={<PageLoader />}><Guest><Login /></Guest></Suspense> },
  { path: '/daftar', element: <Suspense fallback={<PageLoader />}><Guest><Register /></Guest></Suspense> },
  { path: '/dashboard', element: <Suspense fallback={<PageLoader />}><Protected><Dashboard /></Protected></Suspense> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
