import { useState } from 'react';
import { User, Bell, Shield, Globe, Save, Camera, Mail, Lock } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Admin Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'system', label: 'System Config', icon: Globe },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500 font-medium">Manage your administrator account and platform-wide configurations.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Settings Navigation */}
                <div className="w-full lg:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Settings Content */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {activeTab === 'profile' && (
                        <div className="p-8 space-y-8">
                            <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                                <div className="relative group">
                                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200 overflow-hidden">
                                        <User size={40} className="text-slate-400" />
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                                        <Camera size={16} />
                                    </button>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Admin Profile Photo</h3>
                                    <p className="text-xs text-slate-500 mt-1">PNG, JPG or GIF. Max size of 800K.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                        <User size={18} className="text-slate-400" />
                                        <input type="text" defaultValue="Admin User" className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                        <Mail size={18} className="text-slate-400" />
                                        <input type="email" defaultValue="admin@carmarket.com" className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bio / Description</label>
                                <textarea
                                    rows={4}
                                    defaultValue="Senior Administrator for CarMarket Platform. Responsible for user oversight and listing moderation."
                                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl outline-none text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="p-8 space-y-8">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <Lock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                                            <p className="text-xs text-slate-500">Secure your account with an extra layer of security.</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-blue-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">Enable 2FA</button>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Change Password</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Current Password</label>
                                            <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none text-sm" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">New Password</label>
                                            <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none text-sm" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95">Update Security</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab !== 'profile' && activeTab !== 'security' && (
                        <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Advanced Configuration</h3>
                                <p className="text-sm text-slate-500 max-w-sm mx-auto">This section is under development and will include system-wide platform settings.</p>
                            </div>
                            <button className="text-xs font-bold text-blue-600 hover:underline">Learn more about system roles</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
