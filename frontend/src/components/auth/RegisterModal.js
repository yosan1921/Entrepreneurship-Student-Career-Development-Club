import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Field = ({ label, required, children, error }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

const inputClass = (error) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none ${error
        ? 'border-red-300 focus:ring-2 focus:ring-red-400 bg-red-50'
        : 'border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white'
    } disabled:bg-gray-50 disabled:cursor-not-allowed`;

const RegisterModal = ({ onClose, onLoginClick }) => {
    const { register } = useAuth();
    const [step, setStep] = useState(1); // 1 = basic, 2 = academic
    const [form, setForm] = useState({
        firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '',
        phone: '', studentId: '', program: '', year: ''
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [apiSuccess, setApiSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

    const validateStep1 = () => {
        const e = {};
        if (!form.firstName.trim()) e.firstName = 'First name is required';
        if (!form.lastName.trim()) e.lastName = 'Last name is required';
        if (!form.username.trim()) e.username = 'Username is required';
        else if (form.username.trim().length < 3) e.username = 'Username must be at least 3 characters';
        else if (form.username.trim().length > 30) e.username = 'Username must be 30 characters or fewer';
        else if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) e.username = 'Only letters, numbers and underscores allowed';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 6) e.password = 'At least 6 characters';
        if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
        else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        return e;
    };

    const validateStep2 = () => {
        const e = {};
        if (!form.studentId.trim()) e.studentId = 'Student ID is required';
        if (!form.program.trim()) e.program = 'Program is required';
        if (!form.year) e.year = 'Year of study is required';
        return e;
    };

    const handleNext = () => {
        const e = validateStep1();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const e2 = validateStep2();
        if (Object.keys(e2).length) { setErrors(e2); return; }
        setErrors({}); setApiError(''); setLoading(true);

        const result = await register({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            username: form.username.trim().toLowerCase(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            phone: form.phone.trim(),
            studentId: form.studentId.trim(),
            program: form.program.trim(),
            year: form.year
        });

        setLoading(false);
        if (result.success) {
            setApiSuccess(result.message);
        } else {
            setApiError(result.message);
        }
    };

    const EyeBtn = ({ show, onToggle }) => (
        <button type="button" onClick={onToggle} className="text-gray-400 hover:text-gray-600 transition-colors">
            {show ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            )}
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-br from-indigo-600 to-blue-700 px-6 py-5 rounded-t-2xl z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-extrabold text-white">Create Account</h2>
                            <p className="text-indigo-200 text-xs mt-0.5">Join the ESCDC community</p>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-2">
                        {[1, 2].map(s => (
                            <React.Fragment key={s}>
                                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${step >= s ? 'bg-white text-indigo-700' : 'bg-white/20 text-white/60'
                                    }`}>{s}</div>
                                {s < 2 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s ? 'bg-white' : 'bg-white/20'}`} />}
                            </React.Fragment>
                        ))}
                        <span className="ml-2 text-xs text-indigo-200 font-medium">
                            {step === 1 ? 'Personal Info' : 'Academic Info'}
                        </span>
                    </div>
                </div>

                <div className="p-6">
                    {/* Success state */}
                    {apiSuccess ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Account Created!</h3>
                            <p className="text-sm text-gray-500 mb-6">{apiSuccess}</p>
                            <button
                                onClick={onLoginClick}
                                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all"
                            >
                                Go to Login
                            </button>
                        </div>
                    ) : (
                        <>
                            {apiError && (
                                <div className="flex items-center gap-2.5 p-3.5 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                    {apiError}
                                </div>
                            )}

                            {step === 1 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="First Name" required error={errors.firstName}>
                                            <input type="text" value={form.firstName} onChange={set('firstName')} placeholder="John" className={inputClass(errors.firstName)} />
                                        </Field>
                                        <Field label="Last Name" required error={errors.lastName}>
                                            <input type="text" value={form.lastName} onChange={set('lastName')} placeholder="Doe" className={inputClass(errors.lastName)} />
                                        </Field>
                                    </div>
                                    <Field label="Username" required error={errors.username}>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm font-medium pointer-events-none select-none">
                                                @
                                            </span>
                                            <input
                                                type="text"
                                                value={form.username}
                                                onChange={set('username')}
                                                placeholder="e.g. john_doe"
                                                autoComplete="username"
                                                className={inputClass(errors.username) + ' pl-8'}
                                            />
                                        </div>
                                        {!errors.username && (
                                            <p className="mt-1 text-xs text-gray-400">Letters, numbers and underscores only (3–30 chars)</p>
                                        )}
                                    </Field>
                                    <Field label="Email Address" required error={errors.email}>
                                        <input type="email" value={form.email} onChange={set('email')} placeholder="your.email@example.com" className={inputClass(errors.email)} />
                                    </Field>
                                    <Field label="Password" required error={errors.password}>
                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 6 characters" className={inputClass(errors.password) + ' pr-10'} />
                                            <div className="absolute inset-y-0 right-3 flex items-center"><EyeBtn show={showPassword} onToggle={() => setShowPassword(p => !p)} /></div>
                                        </div>
                                    </Field>
                                    <Field label="Confirm Password" required error={errors.confirmPassword}>
                                        <div className="relative">
                                            <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password" className={inputClass(errors.confirmPassword) + ' pr-10'} />
                                            <div className="absolute inset-y-0 right-3 flex items-center"><EyeBtn show={showConfirm} onToggle={() => setShowConfirm(p => !p)} /></div>
                                        </div>
                                    </Field>
                                    <button type="button" onClick={handleNext} className="w-full py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 mt-2">
                                        Continue
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Field label="Student ID" required error={errors.studentId}>
                                        <input type="text" value={form.studentId} onChange={set('studentId')} placeholder="e.g. CS/1234/15" className={inputClass(errors.studentId)} />
                                    </Field>
                                    <Field label="Program / Major" required error={errors.program}>
                                        <input type="text" value={form.program} onChange={set('program')} placeholder="e.g. Business Administration" className={inputClass(errors.program)} />
                                    </Field>
                                    <Field label="Year of Study" required error={errors.year}>
                                        <select value={form.year} onChange={set('year')} className={inputClass(errors.year)}>
                                            <option value="">Select year</option>
                                            {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'].map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Phone Number" error={errors.phone}>
                                        <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+251..." className={inputClass(errors.phone)} />
                                    </Field>
                                    <div className="flex gap-3 mt-2">
                                        <button type="button" onClick={() => setStep(1)} className="px-5 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm">
                                            Back
                                        </button>
                                        <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                                            {loading ? (
                                                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Creating…</>
                                            ) : 'Create Account'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            <p className="text-center text-sm text-gray-500 mt-4">
                                Already have an account?{' '}
                                <button onClick={onLoginClick} className="font-semibold text-indigo-600 hover:underline">Sign in</button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterModal;
