import React, { useState, useEffect } from 'react';
import { Package, FileText, Tag, Hash, ShoppingCart, Calendar, Link as LinkIcon, Image as ImageIcon, Briefcase, MessageSquare, Upload, Save, X, Layers, ArrowLeft, Send, Edit3, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import RejectReceiveModal from './rejectreceivemodal';
import WithdrawModal from './withdrawmodal';
import WithdrawLogModal from './withdrawlogmodal';
import { productService } from '../../../../services/product.service';
import { fileService } from '../../../../services/file.service';
import { dropdownService, DropdownItem } from '../../../../services/dropdown.service';
import { flowService } from '../../../../services/flow.service';
import { authService } from '../../../../services/auth.service';
import { Loader2 } from 'lucide-react';

interface CreateSectionProps {
    isPendingApproval?: boolean;
    isReadOnly?: boolean;
    status?: string;
    receiveData?: { receiverName: string, receiveDate: string } | null;
    onSendApprove?: () => void;
    onEditInfo?: () => void;
    onReceive?: () => void;
    onRejectReceive?: (reason: string) => void;
    externalApproverRemark?: string;
}

export default function CreateSection({
    isPendingApproval,
    isReadOnly,
    status,
    receiveData,
    onSendApprove,
    onEditInfo,
    onReceive,
    onRejectReceive,
    externalApproverRemark
}: CreateSectionProps) {
    const { id: projectId, productId } = useParams();
    const navigate = useNavigate();
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [originalProductRemark, setOriginalProductRemark] = useState<string>('');
    const [withdrawalLogs, setWithdrawalLogs] = useState<{ amount: number; withdrawerName: string; date: string; remark?: string }[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadedImagePath, setUploadedImagePath] = useState<string>('');
    const [categories, setCategories] = useState<DropdownItem[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isEditing, setIsEditing] = useState(!productId);
    const [rejectInfo, setRejectInfo] = useState<{ remark: string; rejecter: string; date: string } | null>(null);

    const withdrawnAmountTotal = withdrawalLogs.reduce((sum, log) => sum + Number(log.amount || 0), 0);

    const handleRejectConfirm = (reason: string) => {
        setIsRejectModalOpen(false);
        if (onRejectReceive) {
            onRejectReceive(reason);
        }
    };

    const handleWithdrawConfirm = async (amount: number, remark: string) => {
        if (!productId) return;
        setIsWithdrawModalOpen(false);
        try {
            await flowService.withdraw({
                productId,
                quantity: amount,
                remark
            });

            setWithdrawalLogs(prev => [...prev, {
                amount,
                withdrawerName: authService.getCurrentUserName() || 'You',
                date: new Date().toISOString(),
                remark
            }]);

            // Update the amount in formData to reflect the new balance
            setFormData(prev => ({
                ...prev,
                amount: String(Math.max(0, Number(prev.amount || 0) - amount))
            }));
            console.log('Withdrawal successful');
        } catch (error) {
            console.error('Failed to withdraw item:', error);
            alert('Failed to withdraw item');
        }
    };

    const [formData, setFormData] = useState({
        productName: '',
        specification: '',
        brand: '',
        amount: '',
        buyOrMake: 'Buy',
        category: '',
        categories: [] as string[],
        dateToUse: '',
        urlLink: '',
        useFor: '',
        remark: ''
    });

    const currentBalance = Number(formData.amount || 0);
    const originalTotal = currentBalance + withdrawnAmountTotal;

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const data = await dropdownService.getDropdown('CATEGORIES');
                setCategories(data || []);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setIsLoadingCategories(false);
            }
        };

        const fetchLogs = async () => {
            if (!productId) return;
            try {
                const res = await flowService.getWithdrawLogs(productId);
                const logData = res?.data || res;
                if (Array.isArray(logData)) {
                    setWithdrawalLogs(logData.map((log: any) => ({
                        amount: Number(log.quantity || log.withdrawNum || log.amount || 0),
                        withdrawerName: log.withdrawnBy || log.userName || log.withdrawerName || log.createdByName || 'Unknown User',
                        date: log.withdrawnDate || log.dateRecord || log.date || log.createAt || log.createdAt || new Date().toISOString(),
                        remark: log.remark || ''
                    })));
                }
            } catch (error) {
                console.error('Failed to fetch withdrawal logs:', error);
            }
        };

        const fetchAuditLogs = async () => {
            if (!productId || status !== 'rejected') return;
            try {
                const res = await flowService.getAuditLogs(productId);
                const auditData = res?.data || res;
                if (Array.isArray(auditData)) {
                    // Find the latest log that contains 'reject', 'not', or 'cancel' in action
                    // Or simply the very last log entry if the status IS already 'rejected'
                    const rejectLog = [...auditData].reverse().find(log =>
                        (log.action?.toLowerCase().includes('reject') ||
                            log.action?.toLowerCase().includes('not') ||
                            log.action?.toLowerCase().includes('cancel')) ||
                        (log.remark && log.remark.length > 0) // Fallback: latest log with a remark
                    );

                    if (rejectLog) {
                        setRejectInfo({
                            remark: rejectLog.remark || 'No remark provided',
                            rejecter: rejectLog.createdByName || rejectLog.userName || rejectLog.createdBy || 'System',
                            date: rejectLog.createAt || rejectLog.createdAt || rejectLog.dateRecord || new Date().toISOString()
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch audit logs:', error);
            }
        };

        fetchCategories();
        fetchLogs();
        fetchAuditLogs();
    }, [productId, status]);

    useEffect(() => {
        if (externalApproverRemark && formData.remark === externalApproverRemark) {
            setFormData(prev => ({ ...prev, remark: '' }));
        }
    }, [externalApproverRemark, formData.remark]);

    useEffect(() => {
        if (!productId) return;
        const fetchProduct = async () => {
            try {
                const product = await productService.getProduct(productId);

                // category: ใช้ id ของ categories ทั้งหมด (many to many)
                const categoryValues = product.categories?.length
                    ? product.categories.map((c: any) => String(c.id || c.categoryId || c.code))
                    : [];

                // date: backend ส่ง ISO string, input[type=date] ต้องการแค่ YYYY-MM-DD
                const dateValue = product.dateToUse
                    ? product.dateToUse.split('T')[0]
                    : '';

                const rawRemark = product.remark || '';
                setOriginalProductRemark(rawRemark);
                const isApproverRemark = (externalApproverRemark && rawRemark === externalApproverRemark) || rawRemark.startsWith('Rejected: ');
                const cleanRemark = isApproverRemark ? '' : rawRemark;

                setFormData(prev => ({
                    ...prev,
                    productName: product.name || '',
                    specification: product.specification || '',
                    brand: product.brand || '',
                    amount: String(product.amount ?? ''),
                    buyOrMake: product.buyType || 'Buy',
                    category: '',
                    categories: categoryValues,
                    dateToUse: dateValue,
                    urlLink: product.linkUrl || '',
                    useFor: product.useFor || '',
                    remark: cleanRemark,
                }));

                // โหลดรูปเดิมจาก DB: เก็บ raw path ไว้ส่ง API, ใช้ full URL สำหรับ preview เท่านั้น
                if (product.imageUrl) {
                    setUploadedImagePath(product.imageUrl);
                    // รูปต้องการ auth token — fetch พร้อม Bearer แล้วสร้าง Blob URL
                    const apiBase = (import.meta.env.VITE_API_URL || '').replace('/api', '');
                    const fullUrl = product.imageUrl.startsWith('http')
                        ? product.imageUrl
                        : `${apiBase}${product.imageUrl}`;
                    const token = localStorage.getItem('token');
                    fetch(fullUrl, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    })
                        .then(res => res.blob())
                        .then(blob => {
                            const blobUrl = URL.createObjectURL(blob);
                            setImagePreview(blobUrl);
                        })
                        .catch(err => console.error('Failed to load image preview:', err));
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
            }
        };
        fetchProduct();
    }, [productId]);

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Instant Upload
            setIsUploadingImage(true);
            try {
                const path = await fileService.uploadFile(file);
                setUploadedImagePath(path);
                console.log("Image uploaded successfully:", path);
            } catch (error) {
                console.error("Failed to upload image:", error);
                alert("Image upload failed. Please try again.");
                setImagePreview(null);
            } finally {
                setIsUploadingImage(false);
            }
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.preventDefault();
        // Revoke blob URL หากเป็น blob เพื่อคืน memory
        if (imagePreview?.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        setUploadedImagePath('');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const prepareProductData = () => {
        if (!projectId) return null;

        return {
            projectId: projectId,
            name: formData.productName,
            specification: formData.specification,
            brand: formData.brand,
            amount: parseInt(formData.amount) || 0,
            buyType: formData.buyOrMake,
            categoryIds: formData.categories.length > 0 ? formData.categories.map(c => parseInt(c)).filter(n => !isNaN(n)) : [101],
            dateToUse: formData.dateToUse,
            linkUrl: formData.urlLink,
            imageUrl: uploadedImagePath || "",
            useFor: formData.useFor,
            remark: (() => {
                const currentRemark = formData.remark.trim();
                const originalRemark = originalProductRemark.trim();
                const externalRemark = (externalApproverRemark || '').trim();

                // If the user left the form's remark field empty
                if (currentRemark === '') {
                    // And the original remark was a "system" remark that we hidden from the UI
                    const isSystemRemark = originalRemark.startsWith('Rejected: ') ||
                        (externalRemark !== '' && originalRemark === externalRemark);

                    if (isSystemRemark) {
                        return originalProductRemark; // Restore original to preserve it
                    }
                }
                return formData.remark;
            })()
        };
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = prepareProductData();
        if (!data || !projectId) {
            alert("Project ID is missing or form data is invalid");
            return;
        }

        setIsSaving(true);
        try {
            if (productId) {
                // แก้ไข product ที่มีอยู่ → PUT
                await productService.updateProduct(productId, data as any);
                console.log('Product updated successfully');
            } else {
                // สร้าง product ใหม่ → POST
                await productService.createProduct(data as any);
                console.log('Product created successfully');
            }
            navigate(-1);
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product. Please check console for details.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleApprove = async (e: React.MouseEvent) => {
        e.preventDefault();
        const data = prepareProductData();
        if (!data || !projectId) return;

        setIsSaving(true);
        try {
            let savedProductId = productId;

            if (productId) {
                // แก้ไข product ที่มีอยู่ → PUT
                await productService.updateProduct(productId, data as any);
            } else {
                // สร้าง product ใหม่ → POST (รับ id กลับมา)
                const result = await productService.createProduct(data as any);
                // รองรับ wrapper หลายรูปแบบ: { data: { id } } หรือ { id }
                savedProductId = result?.data?.id ?? result?.id ?? result;
            }

            if (!savedProductId) {
                throw new Error('Product ID not found after save');
            }

            // เรียก flow API เพื่อส่งขออนุมัติ
            await flowService.requestApproval(savedProductId);

            if (onSendApprove) {
                onSendApprove();
            }
        } catch (error) {
            console.error('Failed to save and send for approval:', error);
            alert('Failed to process submission. Please try again.');
        } finally {
            setIsSaving(false);
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
                        {/* Read-only badge สำหรับ user ที่ไม่ใช่ member EXCEPT for status that requires receiving/withdrawing */}
                        {isReadOnly && status !== 'procured' && status !== 'received' && status !== 'rejected' ? (
                            <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 text-slate-500 px-6 py-3 rounded-xl font-bold border border-slate-200 cursor-not-allowed select-none">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                View Only
                            </div>
                        ) : (
                            <>{/* Render different buttons based on status */}
                                {status === 'rejected' ? (
                                    <div className="flex flex-col lg:flex-row items-center gap-3 w-full sm:w-auto">
                                        {rejectInfo && (
                                            <div className="flex items-center gap-2 bg-rose-50/80 border border-rose-200/50 px-4 py-3 rounded-xl shadow-sm animate-in fade-in slide-in-from-left-4 duration-500">
                                                <span className="text-xs font-black text-rose-600 uppercase tracking-wider whitespace-nowrap">Remark :</span>
                                                <span className="text-sm font-bold text-slate-700 italic">
                                                    "{rejectInfo.remark}"
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-50 text-rose-600 px-8 py-3 rounded-xl font-bold border border-rose-200 cursor-not-allowed shadow-sm">
                                            <X className="w-5 h-5" />
                                            <span className="text-lg">Rejected</span>
                                        </div>
                                    </div>
                                ) : status === 'received' ? (
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        {receiveData && (
                                            <>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold shadow-sm whitespace-nowrap">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Received by {receiveData.receiverName} on {new Date(receiveData.receiveDate).toLocaleDateString('en-US')}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsLogModalOpen(true)}
                                                    title="View Withdrawal Log"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-sm font-bold shadow-sm whitespace-nowrap transition-colors outline-none cursor-pointer"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    เบิกแล้ว: {withdrawnAmountTotal} / {originalTotal}
                                                </button>
                                            </>
                                        )}
                                        {currentBalance > 0 && (
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
                                            {currentBalance === 0 && withdrawnAmountTotal > 0 ? 'Fully Withdrawn' : 'Received'}
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


                                        {/* Local Edit toggle for Draft state */}
                                        {!isPendingApproval && productId && !isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(true)}
                                                className="flex-1 sm:flex-none group flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-600 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 border border-amber-200"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                Edit Product
                                            </button>
                                        )}

                                        {/* Send Approve button */}
                                        <button
                                            type="button"
                                            onClick={handleApprove}
                                            disabled={isPendingApproval || !productId || isEditing}
                                            className={`flex-1 sm:flex-none group flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 ${isPendingApproval || !productId || isEditing
                                                ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed border border-slate-200'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                                                }`}
                                            title={!productId ? "Please save as draft first" : isEditing ? "Please save before sending for approval" : ""}
                                        >
                                            <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                            Send Approve
                                        </button>
                                    </>
                                )}
                            </>)}
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-6">
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                {productId ? 'View / Edit Product' : 'Product Details'}
                            </h2>
                        </div>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {productId ? 'Update information for this product.' : 'Please provide the necessary information for the new product.'}
                        </p>
                    </div>
                </div>

                <fieldset
                    disabled={!!(isReadOnly || isPendingApproval || status === 'rejected' || status === 'received' || (productId && !isEditing))}
                    className={`transition-opacity ${isReadOnly || isPendingApproval || status === 'rejected' || status === 'received' || (productId && !isEditing) ? 'opacity-70 pointer-events-none' : ''}`}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">

                        {/* 1. Product Name */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Product Name <span className="text-rose-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Package className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleChange}
                                    placeholder="e.g. High Performance Laptop"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* 2. Specification */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Specification</label>
                            <div className="relative group">
                                <div className="absolute top-3.5 left-4 pointer-events-none">
                                    <FileText className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <textarea
                                    name="specification"
                                    value={formData.specification}
                                    onChange={handleChange}
                                    placeholder="Detailed technical specifications..."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none resize-none font-medium"
                                />
                            </div>
                        </div>

                        {/* 3. Brand */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Brand</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Tag className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    placeholder="Manufacturer brand"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* 4. Amount */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Amount <span className="text-rose-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Hash className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="1"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* 5. Buy / Make Dropdown */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Buy / Make <span className="text-rose-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <ShoppingCart className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <select
                                    name="buyOrMake"
                                    value={formData.buyOrMake}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-10 text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
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
                        <div className="space-y-2 lg:row-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Category <span className="text-rose-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Layers className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <select
                                    name="category"
                                    value=""
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val) {
                                            if (formData.categories.includes(val)) {
                                                // Toggle Off: Remove if already selected
                                                setFormData(prev => ({ ...prev, categories: prev.categories.filter(id => id !== val) }));
                                            } else {
                                                // Toggle On: Add if not selected
                                                setFormData(prev => ({ ...prev, categories: [...prev.categories, val] }));
                                            }
                                        }
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-10 text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select Category...</option>
                                    {isLoadingCategories ? (
                                        <option disabled>Loading...</option>
                                    ) : categories.length > 0 ? (
                                        categories.map(cat => {
                                            const catId = String(cat.id || cat.code);
                                            const isSelected = formData.categories.includes(catId);
                                            return (
                                                <option key={catId} value={catId}>
                                                    {isSelected ? `✓ ${cat.name}` : cat.name}
                                                </option>
                                            );
                                        })
                                    ) : (
                                        <>
                                            <option value="Structure">Structure</option>
                                            <option value="control & caurcuit">control & caurcuit</option>
                                            <option value="software">software</option>
                                        </>
                                    )}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>

                            {/* Selected Categories Display */}
                            {formData.categories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                                    {formData.categories.map((catId) => {
                                        let catName = catId;
                                        if (categories.length > 0) {
                                            const found = categories.find(c => String(c.id || c.code) === catId);
                                            if (found) catName = found.name;
                                        }
                                        return (
                                            <div key={catId} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-bold shadow-sm">
                                                <span>{catName}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({
                                                        ...prev,
                                                        categories: prev.categories.filter(c => c !== catId)
                                                    }))}
                                                    className="p-0.5 hover:bg-amber-200 rounded-md transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 6. Date to use */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Date to Use <span className="text-rose-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                    type="date"
                                    name="dateToUse"
                                    value={formData.dateToUse}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* 7. Link URL */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Reference URL</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <LinkIcon className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                    type="url"
                                    name="urlLink"
                                    value={formData.urlLink}
                                    onChange={handleChange}
                                    placeholder="https://example.com/product"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* 8. Image Upload */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Product Image</label>

                            {imagePreview ? (
                                <div className="mt-1 flex justify-start">
                                    <div className="relative inline-block group/image">
                                        <img src={imagePreview} alt="Preview" className={`h-48 w-auto rounded-xl object-cover border border-slate-200 shadow-sm transition-opacity ${isUploadingImage ? 'opacity-50' : 'opacity-100'}`} />

                                        {isUploadingImage && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px] rounded-xl">
                                                <div className="bg-white/90 p-3 rounded-full shadow-lg">
                                                    <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                                                </div>
                                            </div>
                                        )}

                                        {!isUploadingImage && (
                                            <button
                                                onClick={handleRemoveImage}
                                                className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-1.5 shadow-md hover:bg-rose-600 transition-colors z-10"
                                                title="Remove Image"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <label htmlFor="file-upload" className={`mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-slate-200 border-dashed rounded-xl transition-all cursor-pointer group ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : 'hover:border-amber-400 hover:bg-amber-50/30'}`}>
                                    <div className="space-y-2 text-center flex flex-col items-center">
                                        <div className={`w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center transition-colors ${isUploadingImage ? '' : 'group-hover:bg-amber-100 text-slate-400 group-hover:text-amber-500'}`}>
                                            {isUploadingImage ? <Loader2 className="h-6 w-6 text-amber-500 animate-spin" /> : <ImageIcon className="mx-auto h-6 w-6" />}
                                        </div>
                                        <div className="flex text-sm text-slate-600">
                                            <span className={`relative cursor-pointer rounded-md font-bold text-amber-600 ${isUploadingImage ? '' : 'group-hover:text-amber-500'}`}>
                                                {isUploadingImage ? 'Uploading...' : 'Upload a file'}
                                            </span>
                                            {!isUploadingImage && <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} disabled={isUploadingImage} />}
                                            {!isUploadingImage && <p className="pl-1">or drag and drop</p>}
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
                                    <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="useFor"
                                    value={formData.useFor}
                                    onChange={handleChange}
                                    placeholder="What is the primary purpose of this product?"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none font-medium"
                                />
                            </div>
                        </div>

                        {/* 10. Remark */}
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Remark</label>
                            <div className="relative group">
                                <div className="absolute top-3.5 left-4 pointer-events-none">
                                    <MessageSquare className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <textarea
                                    name="remark"
                                    value={formData.remark}
                                    onChange={handleChange}
                                    placeholder="Any additional notes or comments..."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none resize-none font-medium"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Save Draft Button Section (Moved to bottom) */}
                    {(isEditing || !productId) && (
                        <div className="flex justify-end pt-4 mt-6 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={isSaving || isUploadingImage}
                                className={`group flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-amber-200 active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed`}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                )}
                                {isSaving ? 'Saving...' : 'Save Draft'}
                            </button>
                        </div>
                    )}
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
                maxAmount={currentBalance}
            />

            <WithdrawLogModal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                logs={withdrawalLogs}
            />
        </>
    );
}
