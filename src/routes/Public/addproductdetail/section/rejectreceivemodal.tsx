import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface RejectReceiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

export default function RejectReceiveModal({ isOpen, onClose, onConfirm }: RejectReceiveModalProps) {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(reason);
        setReason(''); // Reset after submit
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-rose-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Reject Receive</h2>
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
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-slate-600">
                            Please provide a reason for rejecting the receipt of this product.
                        </p>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">
                                Reason <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Why are you rejecting this item?"
                                required
                                rows={4}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 focus:bg-white transition-all outline-none resize-none font-medium"
                            />
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
                            disabled={!reason.trim()}
                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-500 px-4 py-3 rounded-xl font-bold transition-all active:scale-[0.98] shadow-md shadow-rose-200 flex items-center justify-center gap-2"
                        >
                            Confirm Reject
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
