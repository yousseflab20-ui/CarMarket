import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { adminService } from '../services/adminService';
import { Search, MessageSquare, Loader2, ArrowLeft, Clock, UserCircle, X, ExternalLink, AudioLines, ChevronRight } from 'lucide-react';

const Messages = () => {
    const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpenImageModal, setIsOpenImageModal] = useState<string | null>(null);
    const { data: conversations, isLoading: loadingConversations, error: convError } = useQuery({
        queryKey: ['admin-conversations'],
        queryFn: adminService.getConversations,
    });
    console.log('conversations result:', conversations);
    const { data: messages, isLoading: loadingMessages } = useQuery({
        queryKey: ['admin-messages', selectedConversation],
        queryFn: async () => {
            const result = await adminService.getMessagesByConversation(selectedConversation!);
            console.log('messages result:', result);
            return result;
        },
        enabled: selectedConversation !== null,
    });



    console.log('messages result:', messages);

    const filteredConversations = conversations?.filter((conv: any) =>
        String(conv.user1Id).includes(searchTerm) ||
        String(conv.user2Id).includes(searchTerm) ||
        String(conv.id).includes(searchTerm)
    ) || [];

    if (loadingConversations) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (convError) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
                <p className="font-bold">Error loading conversations. Please check if the backend is running.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Messages & Support</h1>
                <p className="text-sm text-slate-500 font-medium">Monitor conversations between users on the platform.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex h-[680px]">

                <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-slate-100 shrink-0`}>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl w-full focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                            <Search size={16} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto p-3">
                        {filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-8">
                                <MessageSquare size={32} className="opacity-30" />
                                <p className="text-sm font-medium text-center">No conversations found</p>
                            </div>
                        ) : (
                            filteredConversations.map((conv: any) => {
                                const isSelected = selectedConversation === conv.id;

                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv.id)}
                                        className={`group relative w-full overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${isSelected
                                            ? 'border-blue-200 bg-blue-50 shadow-sm ring-1 ring-blue-100'
                                            : 'border-transparent bg-white hover:-translate-y-0.5 hover:border-slate-200 hover:bg-slate-50 hover:shadow-md'
                                            }`}
                                    >
                                        <div className={`absolute inset-y-3 left-0 w-1 rounded-r-full transition-all ${isSelected ? 'bg-blue-600 opacity-100' : 'bg-blue-500 opacity-0 group-hover:opacity-60'}`} />

                                        <div className="flex items-center gap-3 pl-1">
                                            <div className="flex -space-x-2 shrink-0 transition-transform duration-300 group-hover:scale-105">
                                                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-sm">
                                                    {conv.user1?.photo ? (
                                                        <img src={conv.user1.photo} alt={conv.user1.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <UserCircle size={22} className="text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-sm">
                                                    {conv.user2?.photo ? (
                                                        <img src={conv.user2.photo} alt={conv.user2.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <UserCircle size={22} className="text-slate-400" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className={`truncate text-sm font-bold transition-colors ${isSelected ? 'text-blue-950' : 'text-slate-800 group-hover:text-slate-950'}`}>
                                                    {conv.user1?.name || 'User'} ↔ {conv.user2?.name || 'User'}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-blue-500' : 'bg-slate-300 group-hover:bg-blue-400'}`} />
                                                    <p className={`truncate text-xs font-semibold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                                                        Conversation #{conv.id}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 flex-col items-end gap-2">
                                                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${isSelected ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-500'}`}>
                                                    {new Date(conv.createdAt).toLocaleDateString()}
                                                </span>
                                                <ChevronRight size={16} className={`transition-all duration-300 ${isSelected ? 'translate-x-0 text-blue-500' : '-translate-x-1 text-slate-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                        <p className="text-xs text-slate-400 font-bold text-center">{filteredConversations.length} conversations</p>
                    </div>
                </div>

                <div className={`${!selectedConversation ? 'hidden md:flex' : 'flex'} flex-col flex-1`}>
                    {!selectedConversation ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <MessageSquare size={28} className="opacity-40" />
                            </div>
                            <p className="text-sm font-medium">Select a conversation to view messages</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedConversation(null)}
                                    className="md:hidden p-2 hover:bg-slate-200 rounded-xl transition-all"
                                >
                                    <ArrowLeft size={18} className="text-slate-600" />
                                </button>
                                {(() => {
                                    const conv = conversations?.find((c: any) => c.id === selectedConversation);
                                    return (
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-100">
                                                    {conv?.user1?.photo ? (
                                                        <img src={conv.user1.photo} alt={conv.user1.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserCircle size={20} className="text-slate-400 m-auto" />
                                                    )}
                                                </div>
                                                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-100">
                                                    {conv?.user2?.photo ? (
                                                        <img src={conv.user2.photo} alt={conv.user2.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserCircle size={20} className="text-slate-400 m-auto" />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">
                                                    {conv?.user1?.name || 'User'} ↔ {conv?.user2?.name || 'User'}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Conversation #{selectedConversation}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                                {loadingMessages ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                    </div>
                                ) : messages && messages.length > 0 ? (
                                    messages.map((msg: any) => {
                                        const conv = conversations?.find((c: any) => c.id === selectedConversation);
                                        const isUser1 = msg.userId === conv?.user1Id;
                                        const sender = msg.sender || {};
                                        const isImage = typeof msg.content === "string" && /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.content);
                                        const hasAudio = typeof msg.audioUrl === "string" && msg.audioUrl.length > 0;
                                        const hasText = typeof msg.content === "string" && msg.content.trim().length > 0 && !isImage && !hasAudio;

                                        return (
                                            <div key={msg.id} className={`flex ${isUser1 ? 'justify-start' : 'justify-end'} gap-2`}>
                                                {isUser1 && (
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0 mt-1">
                                                        {sender.photo ? (
                                                            <img src={sender.photo} alt={sender.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserCircle size={20} className="text-slate-400 m-auto" />
                                                        )}
                                                    </div>
                                                )}
                                                <div className={`max-w-[75%] ${isUser1 ? 'bg-white border border-slate-200 text-slate-800' : 'bg-blue-600 text-white'} rounded-2xl px-4 py-2.5 shadow-sm`}>
                                                    <p className={`text-[11px] font-bold mb-1 ${isUser1 ? 'text-blue-600' : 'text-blue-100'}`}>
                                                        {sender.name || `User ${msg.userId}`}
                                                    </p>

                                                    <div className="space-y-2">
                                                        {isImage && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsOpenImageModal(msg.content)}
                                                                className="group relative block overflow-hidden rounded-xl border border-white/30 bg-black/5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400/70"
                                                            >
                                                                <img
                                                                    src={msg.content}
                                                                    alt="Message attachment"
                                                                    className="max-h-72 w-full max-w-sm cursor-zoom-in object-cover transition-transform duration-500 group-hover:scale-105"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/0 opacity-0 transition-all duration-300 group-hover:bg-slate-950/35 group-hover:opacity-100">
                                                                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow-xl">
                                                                        <Search size={14} />
                                                                        View image
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        )}

                                                        {hasText && (
                                                            <p className="text-sm leading-relaxed">
                                                                {msg.content}
                                                            </p>
                                                        )}

                                                        {hasAudio && (
                                                            <div className={`w-72 max-w-full rounded-2xl border p-3 shadow-sm ${isUser1 ? 'border-slate-200 bg-slate-50' : 'border-white/15 bg-white/10'}`}>
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${isUser1 ? 'bg-blue-100 text-blue-600' : 'bg-white/15 text-white'}`}>
                                                                        <AudioLines size={16} />
                                                                    </span>
                                                                    <div className="min-w-0">
                                                                        <p className={`text-xs font-bold ${isUser1 ? 'text-slate-800' : 'text-white'}`}>Voice message</p>
                                                                        <p className={`text-[10px] font-medium ${isUser1 ? 'text-slate-400' : 'text-blue-100'}`}>Audio attachment</p>
                                                                    </div>
                                                                </div>
                                                                <audio
                                                                    controls
                                                                    src={msg.audioUrl}
                                                                    className="h-9 w-full"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${isUser1 ? 'text-slate-400' : 'text-blue-200'}`}>
                                                        <Clock size={10} />
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                {!isUser1 && (
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 shrink-0 mt-1">
                                                        {sender.photo ? (
                                                            <img src={sender.photo} alt={sender.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserCircle size={20} className="text-slate-400 m-auto" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                                        <MessageSquare size={28} className="opacity-30" />
                                        <p className="text-sm font-medium">No messages in this conversation</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isOpenImageModal && createPortal(
                <div
                    className="fixed inset-0 z-[99999] grid place-items-center bg-slate-950/95 p-4 backdrop-blur-md animate-in fade-in duration-200 sm:p-6"
                    onClick={() => setIsOpenImageModal(null)}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_42%)]" />

                    <button
                        type="button"
                        onClick={() => setIsOpenImageModal(null)}
                        className="absolute left-4 top-4 z-20 inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-slate-900/85 px-4 text-sm font-bold text-white shadow-2xl backdrop-blur-md transition-all hover:-translate-x-0.5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/70 sm:left-6 sm:top-6"
                        aria-label="Back to messages"
                    >
                        <ArrowLeft size={19} />
                        Back
                    </button>

                    <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/85 p-1.5 shadow-2xl backdrop-blur-md sm:right-6 sm:top-6">
                        <a
                            href={isOpenImageModal}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-200 transition-all hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/70"
                            aria-label="Open image in new tab"
                        >
                            <ExternalLink size={18} />
                        </a>
                        <button
                            type="button"
                            onClick={() => setIsOpenImageModal(null)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-200 transition-all hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/70"
                            aria-label="Close image preview"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div
                        className="relative z-10 flex h-full w-full items-center justify-center"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="relative max-h-[86vh] max-w-[min(92vw,1100px)] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-white/10">
                            <img
                                src={isOpenImageModal}
                                alt="Message attachment preview"
                                className="block max-h-[86vh] max-w-full object-contain"
                            />
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Messages;
