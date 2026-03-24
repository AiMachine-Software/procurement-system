import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';
import { flowService } from '../../../../services/flow.service';

interface ApproveSectionProps {
    isPendingApproval: boolean;
    hasPermission?: boolean;
    savedRemark?: string;
    onEditInfo: () => void;
    onApprove?: (remark: string) => void;
    onReject?: (remark: string) => void;
}

export default function ApproveSection({ isPendingApproval, hasPermission = true, savedRemark = '', onEditInfo, onApprove, onReject }: ApproveSectionProps) {
    const { productId } = useParams();
    const [remark, setRemark] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Update remark if savedRemark changes from parent
    useEffect(() => {
        if (savedRemark && savedRemark !== remark) {
            setRemark(savedRemark);
        }
    }, [savedRemark]);

    const handleApprove = async () => {
        if (!isPendingApproval || !productId || !hasPermission) return;
        setIsLoading(true);
        try {
            await flowService.approve(productId, remark);
            if (onApprove) onApprove(remark);
            else onEditInfo();
        } catch (error) {
            console.error('Approve failed:', error);
            alert('Failed to approve. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        if (!isPendingApproval || !productId || !hasPermission) return;
        setIsLoading(true);
        try {
            await flowService.reject(productId, remark);
            if (onReject) onReject(remark);
            else onEditInfo();
        } catch (error) {
            console.error('Reject failed:', error);
            alert('Failed to reject. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Logical states for styling and interaction
    const isInteractive = isPendingApproval && hasPermission;
    const hasExistingRemark = !!(remark || savedRemark);

    // Always show clearly if product exists (regardless of status) OR if it's pending OR if there's a remark
    const isVisibleState = !!productId || isPendingApproval || hasExistingRemark;

    return (
        <div className={`bg-white rounded-[2rem] shadow-sm border p-6 md:p-8 space-y-8 transition-all ${isInteractive
            ? 'border-blue-200 shadow-md ring-1 ring-blue-50/50'
            : 'border-slate-100 shadow-none'
            }`}>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className={`p-3 rounded-xl ${isInteractive
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-blue-50/50 text-blue-400'
                    }`}>
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h2 className={`text-xl font-black tracking-tight ${isInteractive ? 'text-slate-800' : 'text-slate-600'
                        }`}>Approval Section</h2>
                    <p className="text-slate-500 text-sm mt-0.5 font-medium">
                        {!hasPermission && isPendingApproval
                            ? 'Waiting for approval (Approver only).'
                            : isInteractive
                                ? 'Review and approve or reject the product request.'
                                : hasExistingRemark
                                    ? 'Previous approver remarks.'
                                    : !!productId
                                        ? 'No remarks have been added yet.'
                                        : 'This section will be available after the product is sent for approval.'}
                    </p>
                </div>
            </div>

            <div className={`space-y-6 ${!isVisibleState ? 'pointer-events-none' : ''}`}>
                {/* Remark Field */}
                <div className="space-y-2">
                    <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${isInteractive ? 'text-slate-700' : 'text-slate-400'
                        }`}>Approver's Remark</label>
                    <div className="relative group">
                        <div className="absolute top-3.5 left-4 pointer-events-none">
                            <MessageSquare className={`h-5 w-5 transition-colors ${isInteractive
                                ? 'text-slate-400 group-focus-within:text-blue-500'
                                : 'text-blue-300'
                                }`} />
                        </div>
                        <textarea
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder={hasPermission ? "Add comments..." : (hasExistingRemark ? "" : "No remarks provided")}
                            rows={3}
                            disabled={!isInteractive}
                            className={`w-full border rounded-xl py-3 pl-12 pr-4 transition-all outline-none resize-none font-medium ${isInteractive
                                ? 'bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white'
                                : 'bg-slate-50/50 border-slate-100 text-slate-400 cursor-default'
                                }`}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                {isInteractive && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={handleReject}
                            disabled={isLoading}
                            className={`group flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${!isLoading
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 border border-rose-100 cursor-pointer'
                                : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                            Reject
                        </button>
                        <button
                            type="button"
                            onClick={handleApprove}
                            disabled={isLoading}
                            className={`group flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 ${!isLoading
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                            Approve
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
