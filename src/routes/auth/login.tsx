import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            // ส่ง /v1/auth/login { "email": "...", "password": "..." }
            await authService.login({ email, password });
            console.log('Login successful');
            // เปลี่ยนหน้าหลังล็อคอินผ่าน
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Login failed:', error);
            // แสดงข้อความ Error ถ้า Backend ตอบกลับมาว่า ผิดพลาด/รหัสไม่ถูก ฯลฯ
            setErrorMessage(error.response?.data?.message || 'Login failed. Please check your credentials and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-teal-100">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-200 mb-6">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Error Message Alert */}
                        {errorMessage && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in flex items-start gap-2">
                                <span>⚠️</span>
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="email">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="hello@example.com"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-bold text-slate-700" htmlFor="password">Password</label>
                                <a href="#" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">Forgot Password?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center ml-1">
                            <input
                                id="remember"
                                type="checkbox"
                                className="w-4 h-4 text-teal-600 bg-slate-50 border-slate-200 rounded focus:ring-teal-500 focus:ring-2 cursor-pointer transition-all"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm font-medium text-slate-600 cursor-pointer select-none">
                                Remember me for 30 days
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-teal-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    Sign In
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-sm font-medium text-slate-500">
                    Don't have an account?{' '}
                    <a href="#" className="font-bold text-teal-600 hover:text-teal-700 transition-colors">
                        Sign up now
                    </a>
                </p>
            </div>
        </div>
    );
}
