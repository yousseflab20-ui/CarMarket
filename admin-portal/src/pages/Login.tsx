import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { Car, Mail, Lock, Loader2, AlertCircle, ChevronRight, ShieldCheck } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await adminService.login({ email, password });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials. Please verify your access.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020817] flex items-center justify-center p-4 relative font-sans antialiased overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px] mix-blend-screen animate-pulse duration-[12000ms] delay-1000"></div>

                {/* Subtle Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgyMHYyMEgxVjF6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wMikiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-30"></div>
            </div>

            <div className="w-full max-w-[420px] relative z-10">
                {/* Logo and Brand */}
                <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="relative group cursor-pointer">
                        <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-slate-700/50 rounded-2xl flex items-center justify-center shadow-2xl">
                            <Car size={32} className="text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-white tracking-tight mt-6">
                        CarMarket<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Admin</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium mt-2 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-blue-500" />
                        Secure Portal Access
                    </p>
                </div>

                {/* Login Glassmorphic Card */}
                <div className="bg-[#0f172a]/80 backdrop-blur-2xl border border-slate-800 p-8 rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">

                    {/* Inner subtle glow for the card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                            <p className="text-[12px] font-medium text-red-200 leading-relaxed">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2.5">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                            <div className="flex items-center gap-3 bg-[#020817]/50 border border-slate-700/50 px-4 py-3.5 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all group overflow-hidden relative">
                                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                                <Mail size={20} className="text-slate-500 group-focus-within:text-blue-400 transition-colors relative z-10" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@carmarket.com"
                                    autoComplete="email"
                                    required
                                    className="bg-transparent border-none outline-none text-[15px] text-white w-full font-medium placeholder:text-slate-600 relative z-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between pl-1">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                            </div>
                            <div className="flex items-center gap-3 bg-[#020817]/50 border border-slate-700/50 px-4 py-3.5 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all group overflow-hidden relative">
                                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                                <Lock size={20} className="text-slate-500 group-focus-within:text-blue-400 transition-colors relative z-10" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                    className="bg-transparent border-none outline-none text-[15px] text-white w-full font-medium placeholder:text-slate-600 relative z-10 tracking-widest"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-[15px] shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                            {isLoading ? (
                                <Loader2 size={22} className="animate-spin text-blue-200" />
                            ) : (
                                <>
                                    <span>Sign in to Dashboard</span>
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Security Note */}
                <div className="mt-8 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-1000 delay-500">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">End-to-End Encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
