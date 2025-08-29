import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../store/authSlice';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import BgImage from '../assets/Shop Logo F.png';

function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

	const handleLogin = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			const resultAction = await dispatch(loginRequest({ username: username.trim(), password: password.trim() }));
			if (loginRequest.rejected.match(resultAction)) {
				setError(resultAction.payload || 'Invalid credentials');
			} else {
				navigate('/');
			}
		} finally {
			setLoading(false);
		}
	};

	const toggleShowPassword = () => {
		setShowPassword(!showPassword);
	};

	return (
		<div
			className="login-wrapper d-flex justify-content-center align-items-center min-vh-100"
			style={{
				backgroundImage: `url(${BgImage})`,
				backgroundSize: 'cover',
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'center'
			}}
		>
			<div className="login-overlay" aria-hidden="true" />
			<div
				className="login-card p-4 p-sm-5"
				style={{
					backgroundImage: `url(${BgImage})`,
					backgroundSize: 'cover',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center'
				}}
			>
				<div className="login-card-backdrop" aria-hidden="true" />
				<div className="login-card-content">
					<div className="text-center mb-4">
						<div className="login-icon mx-auto mb-3 d-flex align-items-center justify-content-center">
							<FaUser />
						</div>
						<h1 className="h4 mb-1">Welcome back</h1>
						<p className="text-muted mb-0">Sign in to continue</p>
					</div>
					<form onSubmit={handleLogin} noValidate>
						<div className="mb-3">
							<label className="form-label" htmlFor="username"><FaUser className="me-2" />Username</label>
							<input
								id="username"
								type="text"
								className="form-control login-input"
								placeholder="Enter your username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								autoComplete="username"
								required
							/>
						</div>
						<div className="mb-3">
							<label className="form-label" htmlFor="password"><FaLock className="me-2" />Password</label>
							<div className="position-relative">
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									className="form-control login-input pe-5"
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									autoComplete="current-password"
									required
								/>
								<button
									type="button"
									className="btn btn-link login-eye"
									onClick={toggleShowPassword}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
									aria-pressed={showPassword}
								>
									{showPassword ? <FaEyeSlash /> : <FaEye />}
								</button>
							</div>
						</div>
						{error && <div className="alert alert-danger py-2 mb-3" role="alert">{error}</div>}
						<button className="btn btn-success w-100" type="submit" disabled={loading}>
							{loading ? 'Logging in…' : 'Login'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default Login;