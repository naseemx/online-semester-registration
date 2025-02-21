import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import 'animate.css';
import styles from './Login.module.css';

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
            particle.className = styles.particle;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 8}s`;
            particle.style.opacity = `${Math.random() * 0.5 + 0.2}`;
            container.appendChild(particle);
        }
    };

    const handleMouseMove = (e) => {
        const spheres = document.querySelectorAll(`.${styles['gradient-sphere']}`);
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
        <div className={styles['login-page']}>
            <div className={styles['animated-background']}>
                <div className={`${styles['gradient-sphere']} ${styles['sphere-1']}`}></div>
                <div className={`${styles['gradient-sphere']} ${styles['sphere-2']}`}></div>
                <div className={`${styles['gradient-sphere']} ${styles['sphere-3']}`}></div>
                <div className={styles.particles} id="particles"></div>
            </div>

            <div className={styles['login-container']}>
                <div className={styles['login-header']}>
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue your journey</p>
                </div>

                {error && (
                    <div className={`${styles['error-message']} animate__animated animate__shakeX`}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles['form-group']}>
                        <input
                            type="text"
                            className={styles['form-input']}
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <i className={styles['input-icon']}>
                            <FaEnvelope />
                        </i>
                    </div>

                    <div className={styles['form-group']}>
                        <input
                            type="password"
                            className={styles['form-input']}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <i className={styles['input-icon']}>
                            <FaLock />
                        </i>
                    </div>

                    <button 
                        type="submit" 
                        className={styles['submit-button']}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login; 