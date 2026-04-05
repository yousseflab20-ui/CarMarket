import { useState, useEffect } from 'react';
import { Plus, HelpCircle, AlertCircle, CheckCircle, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';
import { getAllFAQs, createFAQ, updateFAQ, deleteFAQ } from '../services/settings/endpoint.Settings';

interface FAQItem {
    id: number;
    question: string;
    answer: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

const FAQ = () => {
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState<boolean | null>(null);

    // Form state
    const [formData, setFormData] = useState({ question: '', answer: '' });

    // Load FAQs
    useEffect(() => {
        loadFAQs();
    }, []);

    const loadFAQs = async () => {
        try {
            setLoading(true);
            const data = await getAllFAQs();
            setFaqs(data.faqs || []);
            setError(null);
        } catch (err) {
            setError('Failed to load FAQs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.question.trim() || !formData.answer.trim()) {
            setError('Please fill in all fields');
            return;
        }

        try {
            if (editingId) {
                await updateFAQ(editingId, formData);
            } else {
                await createFAQ(formData);
            }
            setFormData({ question: '', answer: '' });
            setEditingId(null);
            setShowForm(false);
            await loadFAQs();
        } catch (err) {
            setError('Failed to save FAQ');
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            try {
                await deleteFAQ(id);
                await loadFAQs();
            } catch (err) {
                setError('Failed to delete FAQ');
                console.error(err);
            }
        }
    };

    const handleEdit = (faq: FAQItem) => {
        setFormData({ question: faq.question, answer: faq.answer });
        setEditingId(faq.id);
        setShowForm(true);
    };

    const handleCancel = () => {
        setFormData({ question: '', answer: '' });
        setEditingId(null);
        setShowForm(false);
        setError(null);
    };

    // Filter FAQs
    const filteredFAQs = faqs.filter((faq) => {
        const matchesSearch =
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterActive === null || faq.isActive === filterActive;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <HelpCircle className="w-7 h-7 text-blue-600" />
                        FAQ Management
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Manage frequently asked questions for users
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus size={20} />
                    Add FAQ
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle size={20} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">
                        {editingId ? 'Edit FAQ' : 'Add New FAQ'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Question
                            </label>
                            <input
                                type="text"
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                placeholder="Enter the FAQ question"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Answer
                            </label>
                            <textarea
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                placeholder="Enter the FAQ answer"
                                rows={5}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                {editingId ? 'Update FAQ' : 'Create FAQ'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterActive(null)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterActive === null
                                ? 'bg-blue-600 text-white'
                                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterActive(true)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${filterActive === true
                                ? 'bg-green-600 text-white'
                                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <Eye size={16} />
                        Active
                    </button>
                    <button
                        onClick={() => setFilterActive(false)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${filterActive === false
                                ? 'bg-slate-600 text-white'
                                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <EyeOff size={16} />
                        Inactive
                    </button>
                </div>
            </div>

            {/* FAQs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-slate-500 font-medium">Loading FAQs...</p>
                        </div>
                    </div>
                ) : filteredFAQs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <HelpCircle className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">No FAQs found</p>
                        <p className="text-slate-400 text-sm">
                            {faqs.length === 0 ? 'Create your first FAQ to get started' : 'Try adjusting your search filters'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Question
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Answer Preview
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredFAQs.map((faq) => (
                                    <tr key={faq.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-900 line-clamp-2">
                                                {faq.question}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 line-clamp-2">
                                                {faq.answer}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${faq.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                    }`}
                                            >
                                                <CheckCircle size={14} />
                                                {faq.isActive ? 'Active' : 'Inactive'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(faq)}
                                                    className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(faq.id)}
                                                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Stats */}
            {!loading && faqs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <p className="text-sm text-slate-600 font-medium">Total FAQs</p>
                        <p className="text-2xl font-bold text-slate-900">{faqs.length}</p>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <p className="text-sm text-slate-600 font-medium">Active</p>
                        <p className="text-2xl font-bold text-green-600">
                            {faqs.filter((f) => f.isActive).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <p className="text-sm text-slate-600 font-medium">Inactive</p>
                        <p className="text-2xl font-bold text-slate-600">
                            {faqs.filter((f) => !f.isActive).length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FAQ;
