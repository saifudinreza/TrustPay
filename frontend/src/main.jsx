import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { isAuthenticated } from './lib/auth.js'

function Protected({ children }) {
  return isAuthenticated() ? children : <Navigate to="/masuk" replace />
}

function Guest({ children }) {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children
}

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/masuk', element: <Guest><Login /></Guest> },
  { path: '/daftar', element: <Guest><Register /></Guest> },
  { path: '/dashboard', element: <Protected><Dashboard /></Protected> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
