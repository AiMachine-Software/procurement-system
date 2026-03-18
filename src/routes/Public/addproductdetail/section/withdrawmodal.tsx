import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

interface WithdrawModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, remark: string) => void;
    maxAmount: number;
}

export default function WithdrawModal({ isOpen, onClose, onConfirm, maxAmount }: WithdrawModalProps) {
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');
    const [remark, setRemark] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setWithdrawAmount('');
            setRemark('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(withdrawAmount);
        if (amount > 0 && amount <= maxAmount) {
            onConfirm(amount, remark);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-purple-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                            <Upload className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Withdraw Items</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        <p className="text-sm text-slate-600">
                            Please specify the amount you want to withdraw.
                            <br />
                            <span className="font-semibold text-purple-600">Available to withdraw: {maxAmount}</span>
                        </p>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
                                    Withdraw Amount <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={maxAmount}
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder={`Max ${maxAmount}`}
                                    required
                                    autoFocus
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all outline-none font-medium"
                                />
                            </div>
                            <div className="space-y-2 mt-4">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
                                    Remark <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    placeholder="Enter additional details or reasons for withdrawing..."
                                    rows={3}
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 focus:bg-white transition-all outline-none resize-none font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > maxAmount || !remark.trim()}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600 px-4 py-3 rounded-xl font-bold transition-all active:scale-[0.98] shadow-md shadow-purple-200 flex items-center justify-center gap-2"
                        >
                            Confirm Withdraw
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
