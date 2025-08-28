import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import NewBill from './components/NewBill';
import History from './components/History';
import Reports from './components/Reports';
import Navbar from './components/Navbar';
import PendingBills from './components/PendingBills';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
         <Route
    path="/pending-bills"
    element={
      <ProtectedRoute>
        <PendingBills />
      </ProtectedRoute>
    }
  />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-bill"
          element={
            <ProtectedRoute>
              <NewBill />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;