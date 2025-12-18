import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './src/store/store'
import { useAppSelector } from './src/store/hooks'
import { useAuthInit } from './src/hooks/useAuthInit'
import { TwitterLayout } from './src/components/twitter/layout'
import { HomePage } from './src/pages/home'
import { ProfilePage } from './src/pages/profile'
import { PostDetailPage } from './src/pages/post-detail'
import { LoginPage } from './src/pages/login'
import { SignupPage } from './src/pages/signup'
import { Toaster } from './src/components/ui/sonner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppContent() {
  useAuthInit()

  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <TwitterLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:userId" element={<ProfilePage />} />
          <Route path="post/:postId" element={<PostDetailPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  )
}

export default App