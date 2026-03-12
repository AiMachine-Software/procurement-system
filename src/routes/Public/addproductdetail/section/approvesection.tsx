import React, { useState } from 'react';
import { CheckCircle2, XCircle, MessageSquare, ShieldCheck } from 'lucide-react';

interface ApproveSectionProps {
    isPendingApproval: boolean;
    onEditInfo: () => void;
    onApprove?: () => void;
    onReject?: () => void;
}
export default function ApproveSection({ isPendingApproval, onEditInfo, onApprove, onReject }: ApproveSectionProps) {
    const [remark, setRemark] = useState('');

    const handleApprove = () => {
        if (!isPendingApproval) return;
        console.log('Approved with remark:', remark);
        if (onApprove) onApprove();
        else onEditInfo();
    };

    const handleReject = () => {
        if (!isPendingApproval) return;
        console.log('Rejected with remark:', remark);
        if (onReject) onReject();
        else onEditInfo();
    };

    return (
        <div className={`bg-white rounded-[2rem] shadow-sm border p-6 md:p-8 space-y-8 transition-colors ${isPendingApproval ? 'border-blue-100' : 'border-slate-100 opacity-60'}`}>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className={`p-3 rounded-xl ${isPendingApproval ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h2 className={`text-xl font-black tracking-tight ${isPendingApproval ? 'text-slate-800' : 'text-slate-500'}`}>Approval Section</h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {isPendingApproval ? 'Review and approve or reject the product request.' : 'This section will be available after the product is sent for approval.'}
                    </p>
                </div>
            </div>

            <div className={`space-y-6 ${!isPendingApproval ? 'pointer-events-none' : ''}`}>
                {/* Remark Field */}
                <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${isPendingApproval ? 'text-slate-700' : 'text-slate-400'}`}>Approver's Remark</label>
                    <div className="relative group">
                        <div className="absolute top-3.5 left-4 pointer-events-none">
                            <MessageSquare className={`h-5 w-5 transition-colors ${isPendingApproval ? 'text-slate-400 group-focus-within:text-blue-500' : 'text-slate-300'}`} />
                        </div>
                        <textarea
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Add any comments regarding the approval or rejection..."
                            rows={3}
                            disabled={!isPendingApproval}
                            className={`w-full border rounded-xl py-3 pl-12 pr-4 transition-all outline-none resize-none font-medium ${isPendingApproval
                                ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white'
                                : 'bg-slate-50/50 border-slate-100 text-slate-400 placeholder:text-slate-300'
                                }`}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handleReject}
                        disabled={!isPendingApproval}
                        className={`group flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isPendingApproval
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 border border-rose-100 cursor-pointer'
                            : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
                            }`}
                    >
                        <XCircle className="w-5 h-5" />
                        Reject
                    </button>
                    <button
                        type="button"
                        onClick={handleApprove}
                        disabled={!isPendingApproval}
                        className={`group flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 ${isPendingApproval
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 cursor-pointer'
                            : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                            }`}
                    >
                        <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Approve
                    </button>
                </div>
            </div>
        </div>
    );
}
