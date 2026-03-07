import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Login({ navigate, data }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await login(username, password);
            if (res.ok) {
                navigate(data?.from || 'dashboard');
            } else {
                setError(res.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Staff Login</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Access SalesSathi management portal
                    </p>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'var(--status-not-interested)',
                        color: '#b91c1c',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', padding: '0.85rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
