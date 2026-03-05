import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { Search, MessageSquare, Trash2, Clock, CheckCheck, MoreVertical, Loader2 } from 'lucide-react';

const Messages = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: messages, isLoading, error } = useQuery({
        queryKey: ['admin-messages'],
        queryFn: adminService.getMessages,
    });

    const filteredMessages = messages?.filter((msg: any) =>
        msg.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.content?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
                <p className="font-bold">Error loading messages. Please check if the backend is running.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Messages & Support</h1>
                    <p className="text-sm text-slate-500 font-medium">Monitor and manage platform communications and support tickets.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                    <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl w-full md:w-96 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search messages, senders..."
                            className="bg-transparent border-none outline-none text-sm w-full font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                        <select className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 outline-none">
                            <option>All Messages</option>
                            <option>Unread</option>
                            <option>Support Only</option>
                        </select>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {filteredMessages.map((msg: any) => (
                        <div key={msg.id} className={`p-6 hover:bg-slate-50/50 transition-all group flex items-start justify-between gap-4 ${!msg.seen ? 'bg-blue-50/20' : ''}`}>
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${!msg.seen ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 border-slate-200 text-slate-400'
                                    }`}>
                                    <MessageSquare size={20} />
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{msg.senderName || 'Anonymous User'}</h3>
                                        {!msg.seen && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium ml-auto md:ml-0">
                                            ID: {msg.conversationId}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{msg.content}</p>
                                    <div className="flex items-center gap-4 pt-1">
                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                                            <Clock size={12} />
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                        </span>
                                        {msg.seen && (
                                            <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1 uppercase tracking-wider">
                                                <CheckCheck size={12} />
                                                Seen
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-center md:self-start">
                                <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Message">
                                    <Trash2 size={18} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <p className="text-xs text-slate-500 font-bold tracking-tight">Showing {filteredMessages.length} conversations</p>
                </div>
            </div>
        </div>
    );
};

export default Messages;
