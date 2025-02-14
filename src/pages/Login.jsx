import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import 'animate.css';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        createParticles();
        addMouseMoveEffect();
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const createParticles = () => {
        const container = document.getElementById('particles');
        if (!container) return;
        
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 8}s`;
            particle.style.opacity = `${Math.random() * 0.5 + 0.2}`;
            container.appendChild(particle);
        }
    };

    const handleMouseMove = (e) => {
        const spheres = document.querySelectorAll('.gradient-sphere');
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        spheres.forEach((sphere, index) => {
            const speed = (index + 1) * 20;
            const xOffset = (0.5 - x) * speed;
            const yOffset = (0.5 - y) * speed;
            sphere.style.transform = `translate(${xOffset}px, ${yOffset}px) scale(${1 + (index * 0.1)})`;
        });
    };

    const addMouseMoveEffect = () => {
        window.addEventListener('mousemove', handleMouseMove);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData.username, formData.password);
            if (result.success && result.user) {
                const roleRoutes = {
                    student: '/student/registration',
                    staff: '/staff/fines',
                    tutor: '/tutor/registrations',
                    admin: '/admin/dashboard'
                };
                navigate(roleRoutes[result.user.role] || '/');
            } else {
                setError(result.message || 'Invalid credentials');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="animated-background">
                <div className="gradient-sphere sphere-1"></div>
                <div className="gradient-sphere sphere-2"></div>
                <div className="gradient-sphere sphere-3"></div>
                <div className="particles" id="particles"></div>
            </div>

            <div className="login-container">
                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue your journey</p>
                </div>

                {error && (
                    <div className="error-message animate__animated animate__shakeX">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-input"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <i className="input-icon">
                            <FaEnvelope />
                        </i>
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            className="form-input"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <i className="input-icon">
                            <FaLock />
                        </i>
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>

            <style jsx>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #0a0a0a;
                    position: relative;
                    overflow: hidden;
                }

                .animated-background {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    overflow: hidden;
                }

                .gradient-sphere {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(60px);
                    opacity: 0.5;
                    animation: moveSphere 20s infinite ease-in-out;
                }

                .sphere-1 {
                    width: 600px;
                    height: 600px;
                    background: linear-gradient(45deg, #ff3366, #ff6b3d);
                    top: -300px;
                    left: -300px;
                    animation-delay: -5s;
                }

                .sphere-2 {
                    width: 500px;
                    height: 500px;
                    background: linear-gradient(45deg, #4433ff, #3dceff);
                    bottom: -250px;
                    right: -250px;
                    animation-delay: -2s;
                }

                .sphere-3 {
                    width: 400px;
                    height: 400px;
                    background: linear-gradient(45deg, #7400ff, #ff00d4);
                    top: 50%;
                    left: 30%;
                    animation-delay: -8s;
                }

                @keyframes moveSphere {
                    0%, 100% {
                        transform: translate(0, 0) rotate(0deg) scale(1);
                    }
                    25% {
                        transform: translate(100px, 50px) rotate(90deg) scale(1.1);
                    }
                    50% {
                        transform: translate(50px, 100px) rotate(180deg) scale(1);
                    }
                    75% {
                        transform: translate(-50px, 50px) rotate(270deg) scale(0.9);
                    }
                }

                .particles {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                }

                .particle {
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    animation: floatParticle 8s infinite linear;
                }

                @keyframes floatParticle {
                    0% {
                        transform: translateY(100vh) scale(0);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100vh) scale(1);
                        opacity: 0;
                    }
                }

                .login-container {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    max-width: 440px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 24px;
                    padding: 3rem;
                    color: white;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden;
                    transform: translateY(20px);
                    opacity: 0;
                    animation: slideIn 0.6s ease-out forwards;
                }

                @keyframes slideIn {
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .login-header h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(45deg, #fff, #ccc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .login-header p {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 1rem;
                }

                .form-group {
                    position: relative;
                    margin-bottom: 1.5rem;
                }

                .form-input {
                    width: 100%;
                    padding: 1rem 1rem 1rem 3rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    font-size: 1rem;
                    color: white;
                    transition: all 0.3s ease;
                }

                .form-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .form-input:focus {
                    outline: none;
                    border-color: rgba(255, 255, 255, 0.3);
                    background: rgba(255, 255, 255, 0.1);
                    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05);
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255, 255, 255, 0.4);
                    transition: color 0.3s ease;
                }

                .form-input:focus + .input-icon {
                    color: white;
                }

                .submit-button {
                    width: 100%;
                    padding: 1rem;
                    background: white;
                    color: black;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .submit-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                }

                .submit-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .error-message {
                    background: rgba(255, 68, 119, 0.1);
                    border: 1px solid rgba(255, 68, 119, 0.3);
                    color: #ff4477;
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    text-align: center;
                }

                @media (max-width: 480px) {
                    .login-container {
                        margin: 1rem;
                        padding: 2rem;
                    }

                    .login-header h1 {
                        font-size: 2rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Login; 