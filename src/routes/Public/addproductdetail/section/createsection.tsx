import React, { useState, useEffect } from 'react';
import { Package, FileText, Tag, Hash, ShoppingCart, Calendar, Link as LinkIcon, Image as ImageIcon, Briefcase, MessageSquare, Upload, Save, X, Layers, ArrowLeft, Send, Edit3, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockProducts } from '../../projectDetail/mocks/productdetail.mock.table';
import RejectReceiveModal from './rejectreceivemodal';
import WithdrawModal from './withdrawmodal';
import WithdrawLogModal from './withdrawlogmodal';

interface CreateSectionProps {
    isPendingApproval?: boolean;
    status?: string;
    receiveData?: { receiverName: string, receiveDate: string } | null;
    onSendApprove?: () => void;
    onEditInfo?: () => void;
    onReceive?: () => void;
    onRejectReceive?: (reason: string) => void;
}

export default function CreateSection({ isPendingApproval, status, receiveData, onSendApprove, onEditInfo, onReceive, onRejectReceive }: CreateSectionProps) {
    const { projectId, productId } = useParams();
    const navigate = useNavigate();
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [withdrawalLogs, setWithdrawalLogs] = useState<{ amount: number; withdrawerName: string; date: string }[]>([]);

    const withdrawnAmount = withdrawalLogs.reduce((sum, log) => sum + log.amount, 0);

    const handleRejectConfirm = (reason: string) => {
        setIsRejectModalOpen(false);
        if (onRejectReceive) {
            onRejectReceive(reason);
        }
    };

    const handleWithdrawConfirm = (amount: number) => {
        setIsWithdrawModalOpen(false);
        setWithdrawalLogs(prev => [...prev, {
            amount,
            withdrawerName: 'สมชาย ใจดี', // System user mockup like the receive section
            date: new Date().toISOString()
        }]);
    };

    const [formData, setFormData] = useState({
        productName: '',
        specification: '',
        brand: '',
        amount: '',
        buyOrMake: 'Buy',
        category: 'Structure',
        dateToUse: '',
        urlLink: '',
        useFor: '',
        remark: ''
    });

    useEffect(() => {
        if (productId) {
            const product = mockProducts.find(p => p.id === parseInt(productId));
            if (product) {
                setFormData(prev => ({
                    ...prev,
                    productName: product.name || '',
                    specification: product.specification || '',
                    amount: product.amount || '',
                    category: product.category || 'Structure',
                    // Default values for fields not present in mock data
                    brand: 'Example Brand',
                    buyOrMake: 'Buy',
                    dateToUse: '2026-03-10',
                }));
            }
        }
    }, [productId]);

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.preventDefault();
        setImagePreview(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically save the data
        console.log('Saving product details...', formData);
        // For now, let's just go back
        navigate(-1);
    };

    const handleApprove = (e: React.MouseEvent) => {
        e.preventDefault();
        console.log('Sending for approval...', formData);
        if (onSendApprove) {
            onSendApprove();
        }
    };

    return (
        <>
            <form onSubmit={handleSave} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-8 space-y-8">

                {/* Action Buttons Section (Moved to top) */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center text-slate-500 hover:text-slate-700 transition-colors text-sm font-bold bg-slate-50 hover:bg-slate-100 px-6 py-3 rounded-xl border border-slate-200 w-full sm:w-auto justify-center"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Project
                    </button>
                    <div className="flex gap-3 w-full sm:w-auto">
                        {/* Render different buttons based on status */}
                        {status === 'rejected' ? (
                            <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-50 text-rose-600 px-6 py-3 rounded-xl font-bold border border-rose-200 cursor-not-allowed">
                                <X className="w-4 h-4" />
                                Rejected
                            </div>
                        ) : status === 'received' ? (
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {withdrawnAmount < Number(formData.amount || 0) && (
                                    <button
                                        type="button"
                                        onClick={() => setIsWithdrawModalOpen(true)}
                                        className="flex-1 sm:flex-none group flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 shadow-purple-200"
                                    >
                                        <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                        Withdraw
                                    </button>
                                )}
                                <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-3 rounded-xl font-bold border border-emerald-200 cursor-not-allowed">
                                    <CheckCircle className="w-4 h-4" />
                                    {withdrawnAmount >= Number(formData.amount || 0) ? 'Fully Withdrawn' : 'Received'}
                                </div>
                            </div>
                        ) : status === 'procured' ? (
                            <>
                                {/* Reject Receive button */}
                                <button
                                    type="button"
                                    onClick={() => setIsRejectModalOpen(true)}
                                    className="flex-1 sm:flex-none group flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 border border-rose-200"
                                >
                                    <X className="w-4 h-4" />
                                    Reject Receive
                                </button>
                                {/* Receive button */}
                                <button
                                    type="button"
                                    onClick={onReceive}
                                    className="flex-1 sm:flex-none group flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 shadow-emerald-200"
                                >
                                    <Save className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                    Receive
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Edit Info button */}
                                {isPendingApproval && (
                                    <button
                                        type="button"
                                        onClick={onEditInfo}
                                        className="flex-1 sm:flex-none group flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 border border-slate-200"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit Info
                                    </button>
                                )}

                                {/* Send Approve button */}
                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={isPendingApproval}
                                    className={`flex-1 sm:flex-none group flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 ${isPendingApproval
                                        ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                                        }`}
                                >
                                    <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                    Send Approve
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-6">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                {productId ? 'View / Edit Product' : 'Product Details'}
                            </h2>

                            {status === 'received' && receiveData && (
                                <>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold shadow-sm whitespace-nowrap">
                                        <CheckCircle className="w-4 h-4" />
                                        รับโดย {receiveData.receiverName} วันที่ {new Date(receiveData.receiveDate).toLocaleDateString('th-TH')}
                                    </span>
                                    {withdrawnAmount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsLogModalOpen(true)}
                                            title="View Withdrawal Log"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-sm font-bold shadow-sm whitespace-nowrap transition-colors outline-none cursor-pointer"
                                        >
                                            <Upload className="w-4 h-4" />
                                            เบิกแล้ว: {withdrawnAmount} / {formData.amount || 0}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {productId ? 'Update information for this product.' : 'Please provide the necessary information for the new product.'}
                        </p>
                    </div>
                </div>

                <fieldset disabled={isPendingApproval || status === 'rejected' || status === 'received'} className={`transition-opacity ${isPendingApproval || status === 'rejected' || status === 'received' ? 'opacity-70 pointer-events-none' : ''}`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">

                        {/* 1. Product Name */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Product Name <span className="text-rose-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Package className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleChange}
                                    placeholder="e.g. High Performance Laptop"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* 2. Specification */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Specification</label>
                            <div className="relative group">
                                <div className="absolute top-3.5 left-4 pointer-events-none">
                                    <FileText className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <textarea
                                    name="specification"
                                    value={formData.specification}
                                    onChange={handleChange}
                                    placeholder="Detailed technical specifications..."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none resize-none font-medium"
                                />
                            </div>
                        </div>

                        {/* 3. Brand */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Brand</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Tag className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    placeholder="Manufacturer brand"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* 4. Amount */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Amount <span className="text-rose-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Hash className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="1"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* 5. Buy / Make Dropdown */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Buy / Make <span className="text-rose-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <ShoppingCart className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <select
                                    name="buyOrMake"
                                    value={formData.buyOrMake}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-10 text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
                                >
                                    <option value="Buy">Buy</option>
                                    <option value="Make">Make</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Category Dropdown (Right beside Buy/Make) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Category <span className="text-rose-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Layers className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-10 text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
                                >
                                    <option value="Structure">Structure</option>
                                    <option value="control & caurcuit">control & caurcuit</option>
                                    <option value="software">software</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* 6. Date to use */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Date to Use <span className="text-rose-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    type="date"
                                    name="dateToUse"
                                    value={formData.dateToUse}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* 7. Link URL */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Reference URL</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <LinkIcon className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    type="url"
                                    name="urlLink"
                                    value={formData.urlLink}
                                    onChange={handleChange}
                                    placeholder="https://example.com/product"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* 8. Image Upload */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Product Image</label>

                            {imagePreview ? (
                                <div className="mt-1 flex justify-start">
                                    <div className="relative inline-block">
                                        <img src={imagePreview} alt="Preview" className="h-48 w-auto rounded-xl object-cover border border-slate-200 shadow-sm" />
                                        <button
                                            onClick={handleRemoveImage}
                                            className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-1.5 shadow-md hover:bg-rose-600 transition-colors"
                                            title="Remove Image"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label htmlFor="file-upload" className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-teal-400 hover:bg-teal-50/30 transition-all cursor-pointer group">
                                    <div className="space-y-2 text-center flex flex-col items-center">
                                        <div className="w-12 h-12 bg-slate-100 group-hover:bg-teal-100 text-slate-400 group-hover:text-teal-500 rounded-full flex items-center justify-center transition-colors">
                                            <ImageIcon className="mx-auto h-6 w-6" />
                                        </div>
                                        <div className="flex text-sm text-slate-600">
                                            <span className="relative cursor-pointer rounded-md font-bold text-teal-600 group-hover:text-teal-500">
                                                Upload a file
                                            </span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            PNG, JPG, GIF up to 5MB
                                        </p>
                                    </div>
                                </label>
                            )}
                        </div>

                        {/* 9. Use for */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Use For</label>
                            <div className="relative group">
                                <div className="absolute top-3.5 left-4 pointer-events-none">
                                    <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="useFor"
                                    value={formData.useFor}
                                    onChange={handleChange}
                                    placeholder="What is the primary purpose of this product?"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* 10. Remark */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Remark</label>
                            <div className="relative group">
                                <div className="absolute top-3.5 left-4 pointer-events-none">
                                    <MessageSquare className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <textarea
                                    name="remark"
                                    value={formData.remark}
                                    onChange={handleChange}
                                    placeholder="Any additional notes or comments..."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none resize-none font-medium"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Save Draft Button Section (Moved to bottom) */}
                    <div className="flex justify-end pt-4 mt-6 border-t border-slate-100">
                        <button
                            type="submit"
                            className="group flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-teal-200 active:scale-95"
                        >
                            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Save Draft
                        </button>
                    </div>
                </fieldset>

            </form>

            <RejectReceiveModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onConfirm={handleRejectConfirm}
            />

            <WithdrawModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                onConfirm={handleWithdrawConfirm}
                maxAmount={Math.max(0, Number(formData.amount || 0) - withdrawnAmount)}
            />

            <WithdrawLogModal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                logs={withdrawalLogs}
            />
        </>
    );
}
