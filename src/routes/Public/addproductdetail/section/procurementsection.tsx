import React, { useState } from 'react';
import { ShoppingCart, Calendar, Building2, MessageSquare, ClipboardCheck, Save } from 'lucide-react';

interface ProcurementSectionProps {
    isApproved: boolean;
    hasPermission?: boolean;
    isSaved?: boolean;
    savedData?: { status: string; dateReceive: string; buyFrom: string; remark: string } | null;
    onSave?: (data: { status: string; dateReceive: string; buyFrom: string; remark: string }) => void;
}

export default function ProcurementSection({ isApproved, hasPermission = true, isSaved, savedData, onSave }: ProcurementSectionProps) {
    const [formData, setFormData] = useState({
        status: 'Make',
        dateReceive: '',
        buyFrom: '',
        remark: ''
    });

    // Sync state with savedData from parent
    React.useEffect(() => {
        if (savedData) {
            // Normalize status to match select options (casing)
            let normalizedStatus = savedData.status || 'Make';
            if (normalizedStatus.toUpperCase() === 'MAKE') normalizedStatus = 'Make';
            if (normalizedStatus.toUpperCase() === 'BUY') normalizedStatus = 'Buy';
            if (normalizedStatus.toUpperCase() === 'INSTOCK' || normalizedStatus.toUpperCase() === 'INSTOCK') normalizedStatus = 'In_stock';

            setFormData({
                status: normalizedStatus,
                dateReceive: savedData.dateReceive ? savedData.dateReceive.split('T')[0] : '',
                buyFrom: savedData.buyFrom || '',
                remark: savedData.remark || ''
            });
        }
    }, [savedData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Saving procurement details...', formData);
        if (onSave) onSave(formData);
    };

    const isDisabled = !isApproved || isSaved || !hasPermission;

    return (
        <div className={`bg-white rounded-[2rem] shadow-sm border p-6 md:p-8 space-y-8 transition-colors ${isApproved && hasPermission ? 'border-amber-100 shadow-md ring-1 ring-amber-50/50' : 'border-slate-100'}`}>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className={`p-3 rounded-xl ${isApproved && hasPermission ? 'bg-amber-100 text-amber-600' : 'bg-amber-50/50 text-amber-400'}`}>
                    <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                    <h2 className={`text-xl font-black tracking-tight ${isApproved && hasPermission ? 'bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent' : 'text-slate-600'}`}>
                        Procurement Details
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5 font-medium">
                        {!hasPermission ? 'You do not have permission to modify procurement details.' : isApproved ? 'Provide procurement information for this product.' : 'This section will be available after the product is approved.'}
                    </p>
                </div>
            </div>

            <fieldset disabled={isDisabled} className={`transition-opacity ${isDisabled ? 'opacity-70 pointer-events-none' : ''}`}>
                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Status Dropdown */}
                    <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${!isDisabled ? 'text-slate-700' : 'text-slate-500'}`}>Status <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <ShoppingCart className={`h-5 w-5 transition-colors ${!isDisabled ? 'text-slate-400 group-focus-within:text-amber-500' : 'text-amber-400/60'}`} />
                            </div>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className={`w-full border rounded-xl py-3 pl-12 pr-10 outline-none font-medium appearance-none transition-all ${!isDisabled
                                    ? 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white cursor-pointer'
                                    : 'bg-slate-50/50 border-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <option value="Make">Make</option>
                                <option value="Buy">Buy</option>
                                <option value="In_stock">In Stock</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <svg className={`w-5 h-5 ${!isDisabled ? 'text-slate-400' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Date Receive */}
                    <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${!isDisabled ? 'text-slate-700' : 'text-slate-500'}`}>Date Receive <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Calendar className={`h-5 w-5 transition-colors ${!isDisabled ? 'text-slate-400 group-focus-within:text-amber-500' : 'text-amber-400/60'}`} />
                            </div>
                            <input
                                type="date"
                                name="dateReceive"
                                value={formData.dateReceive}
                                onChange={handleChange}
                                className={`w-full border rounded-xl py-3 pl-12 pr-4 outline-none font-medium transition-all ${!isDisabled
                                    ? 'bg-slate-50 border-slate-200 text-slate-700 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white'
                                    : 'bg-slate-50/50 border-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                                required
                            />
                        </div>
                    </div>

                    {/* Buy From */}
                    <div className="space-y-2 lg:col-span-2">
                        <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${!isDisabled ? 'text-slate-700' : 'text-slate-500'}`}>Buy From</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Building2 className={`h-5 w-5 transition-colors ${!isDisabled ? 'text-slate-400 group-focus-within:text-amber-500' : 'text-amber-400/60'}`} />
                            </div>
                            <input
                                type="text"
                                name="buyFrom"
                                value={formData.buyFrom}
                                onChange={handleChange}
                                placeholder="Supplier or Vendor Name"
                                className={`w-full border rounded-xl py-3 pl-12 pr-4 outline-none font-medium transition-all ${!isDisabled
                                    ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white'
                                    : 'bg-slate-50/50 border-slate-100 text-slate-400 placeholder:text-slate-300 cursor-not-allowed'
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Remark */}
                    <div className="space-y-2 lg:col-span-2">
                        <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${!isDisabled ? 'text-slate-700' : 'text-slate-500'}`}>Remark</label>
                        <div className="relative group">
                            <div className="absolute top-3.5 left-4 pointer-events-none">
                                <MessageSquare className={`h-5 w-5 transition-colors ${!isDisabled ? 'text-slate-400 group-focus-within:text-amber-500' : 'text-amber-400/60'}`} />
                            </div>
                            <textarea
                                name="remark"
                                value={formData.remark}
                                onChange={handleChange}
                                placeholder="Additional details regarding procurement..."
                                rows={3}
                                className={`w-full border rounded-xl py-3 pl-12 pr-4 outline-none font-medium resize-none transition-all ${!isDisabled
                                    ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white'
                                    : 'bg-slate-50/50 border-slate-100 text-slate-400 placeholder:text-slate-300 cursor-not-allowed'
                                    }`}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="lg:col-span-2 flex justify-end pt-4 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={isDisabled}
                            className={`group flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all shadow-md active:scale-95 ${!isDisabled
                                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200/50 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed hidden'
                                }`}
                        >
                            <Save className={`w-5 h-5 ${!isDisabled ? 'group-hover:scale-110 transition-transform' : ''}`} />
                            Save Procurement
                        </button>
                    </div>
                </form>
            </fieldset>
        </div>
    );
}
