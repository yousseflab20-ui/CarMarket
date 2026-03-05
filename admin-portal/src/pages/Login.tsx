import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { Car, Mail, Lock, Loader2, AlertCircle, ChevronRight, ShieldCheck } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await adminService.login({ email, password });

            
            if (response.user.role !== 'ADMIN') {
                
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                throw new Error('Access denied. You do not have administrator privileges.');
            }

            navigate('/Cars');
        } catch (err: any) {
            setError(err.message || err.response?.data?.message || 'Invalid credentials. Please verify your access.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden font-['Outfit',sans-serif] selection:bg-indigo-500/30 selection:text-indigo-200 text-slate-200">
            <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}></div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[800px] h-[80vw] max-h-[800px] rounded-full bg-indigo-600/10 blur-[120px] mix-blend-screen pointer-events-none"></div>

            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

            <div className={`w-full max-w-[440px] relative z-10 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} flex flex-col items-center justify-center`}>

                <div className="relative group/card w-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/30 via-slate-800/50 to-blue-500/30 rounded-[2.5rem] blur opacity-75 transition-opacity duration-500 group-hover/card:opacity-100"></div>
                    <div className="relative bg-[#0B1221]/90 backdrop-blur-xl border border-slate-800/80 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center">

                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent"></div>

                        <div className="flex flex-col items-center w-full mb-8">
                            <div className="relative group mb-5">
                                <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                                <div className="relative w-16 h-16 bg-[#030712] border border-slate-700 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-105 group-hover:border-indigo-500/50">
                                    <Car className="text-indigo-400 w-8 h-8" strokeWidth={1.5} />
                                </div>
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 text-center">
                                Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-extrabold">Portal</span>
                            </h1>
                            <p className="text-slate-400 text-sm font-medium flex items-center justify-center gap-1.5 text-center">
                                <ShieldCheck size={16} className="text-indigo-500" />
                                Secure Session Login
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                                <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm font-medium text-red-200 leading-relaxed">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5 w-full">
                            <div className="space-y-2.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail size={18} className="text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@carmarket.com"
                                        autoComplete="email"
                                        required
                                        className="w-full bg-[#030712] border border-slate-700/80 text-white text-[15px] rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        required
                                        className="w-full bg-[#030712] border border-slate-700/80 text-white text-[15px] rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600 font-medium tracking-widest"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-4 rounded-2xl font-bold text-[15px] shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden group/btn"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full duration-1000 ease-in-out"></div>
                                {isLoading ? (
                                    <Loader2 size={20} className="animate-spin text-white/70" />
                                ) : (
                                    <>
                                        <span>Authorize Access</span>
                                        <ChevronRight size={18} className="group-hover/btn:translate-x-1 duration-300 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center flex items-center justify-center">
                    <p className="text-xs text-slate-500 font-medium tracking-wide">
                        &copy; 2026 CARMARKET INC. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
