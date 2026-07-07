import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const EyeIcon = ({ open }) => open ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

const InputField = ({ label, icon, type = 'text', value, onChange, placeholder, error, disabled, rightElement }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                {icon}
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full pl-10 ${rightElement ? 'pr-11' : 'pr-4'} py-3 rounded-xl border text-sm transition-all outline-none
                    ${error ? 'border-red-300 focus:ring-2 focus:ring-red-400 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white'}
                    disabled:bg-gray-50 disabled:cursor-not-allowed`}
            />
            {rightElement && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {rightElement}
                </div>
            )}
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

// ── Admin Login Form ──────────────────────────────────────────
const AdminLoginForm = ({ onSuccess, onClose }) => {
    const { login } = useAuth();
    const [form, setForm] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.username.trim()) e.username = 'Username or email is required';
        if (!form.password) e.password = 'Password is required';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setErrors({}); setApiError(''); setLoading(true);

        const result = await login({ username: form.username.trim(), password: form.password });
        setLoading(false);

        if (result.success) {
            onClose();
            onSuccess(result.user, 'admin');
        } else {
            setApiError(result.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {apiError && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {apiError}
                </div>
            )}

            <InputField
                label="Username or Email"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="Enter username or email"
                error={errors.username}
                disabled={loading}
            />

            <InputField
                label="Password"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Enter your password"
                error={errors.password}
                disabled={loading}
                rightElement={
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <EyeIcon open={showPassword} />
                    </button>
                }
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-sm mt-2"
            >
                {loading ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Signing in…</>
                ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" /></svg> Sign in as Admin</>
                )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-1">
                Admin accounts are managed by the system only.
            </p>
        </form>
    );
};

// ── User Login Form ───────────────────────────────────────────
const UserLoginForm = ({ onSuccess, onClose, onRegister }) => {
    const { userLogin } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
        if (!form.password) e.password = 'Password is required';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const e2 = validate();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setErrors({}); setApiError(''); setLoading(true);

        const result = await userLogin({ email: form.email.trim().toLowerCase(), password: form.password });
        setLoading(false);

        if (result.success) {
            onClose();
            onSuccess(result.user, 'user-dashboard');
        } else {
            setApiError(result.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {apiError && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {apiError}
                </div>
            )}

            <InputField
                label="Email Address"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="your.email@example.com"
                error={errors.email}
                disabled={loading}
            />

            <InputField
                label="Password"
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Enter your password"
                error={errors.password}
                disabled={loading}
                rightElement={
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <EyeIcon open={showPassword} />
                    </button>
                }
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-sm mt-2"
            >
                {loading ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Signing in…</>
                ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" /></svg> Sign in as Member</>
                )}
            </button>

            <div className="text-center pt-1">
                <p className="text-sm text-gray-500">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onRegister}
                        className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
                    >
                        Create Account
                    </button>
                </p>
            </div>
        </form>
    );
};

// ── Main LoginModal ───────────────────────────────────────────
const LoginModal = ({ onClose, onSuccess, onRegister }) => {
    const [activeTab, setActiveTab] = useState('user'); // 'user' | 'admin'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 pt-6 pb-0">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-xl font-extrabold text-white tracking-tight">Welcome Back</h2>
                            <p className="text-slate-400 text-xs mt-0.5">Sign in to your ESCDC account</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-white/10 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('user')}
                            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'user'
                                    ? 'bg-white text-indigo-700 shadow-sm'
                                    : 'text-slate-300 hover:text-white'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Member Login
                        </button>
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeTab === 'admin'
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-300 hover:text-white'
                                }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin Login
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    {activeTab === 'user' ? (
                        <>
                            <div className="mb-5 flex items-center gap-2.5 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <p className="text-xs text-indigo-800 font-medium">
                                    Sign in with your registered member email and password.
                                </p>
                            </div>
                            <UserLoginForm onSuccess={onSuccess} onClose={onClose} onRegister={onRegister} />
                        </>
                    ) : (
                        <>
                            <div className="mb-5 flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <p className="text-xs text-amber-800 font-medium">
                                    Admin access only. Credentials are managed by the system.
                                </p>
                            </div>
                            <AdminLoginForm onSuccess={onSuccess} onClose={onClose} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
