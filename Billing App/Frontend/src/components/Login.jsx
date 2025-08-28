import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import BgImage from '../assets/Shop Logo F.png'; // adjust path

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    dispatch(login({ username, password }));
    setLoading(false);
    if (username === 'Admin' && password === 'Admin@123') {
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        backgroundImage: `url(${BgImage})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="p-4"
        style={{
          maxWidth: '400px',
          width: '100%',
          marginTop: '20%',
          background: 'transparent',   // no background
          border: 'none',              // remove border
          boxShadow: 'none'            // remove shadow
        }}
      >
        <div className="mb-3">
          <label className="form-label text-dark">
            <FaUser className="me-2" /> Username
          </label>
          <input
            type="text"
            className="form-control bg-transparent text-dark border-dark"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3 position-relative">
          <label className="form-label text-dark">
            <FaLock className="me-2" /> Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control bg-transparent text-dark border-dark"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            onClick={toggleShowPassword}
            style={{
              position: 'absolute',
              right: '10px',
              top: '70%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
            }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {error && <div className="alert alert-danger py-2 mb-2">{error}</div>}
        <button className="btn btn-success w-100" onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}

export default Login;