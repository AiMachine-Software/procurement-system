import { X, Upload, Clock, User } from 'lucide-react';

interface WithdrawLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    logs: { amount: number; withdrawerName: string; date: string; remark?: string }[];
}

export default function WithdrawLogModal({ isOpen, onClose, logs }: WithdrawLogModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-purple-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                            <Upload className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Withdrawal Log</h2>
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
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {logs.length === 0 ? (
                        <p className="text-center text-slate-500 py-4">No withdrawals yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {[...logs].reverse().map((log, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-purple-600 font-black text-lg h-12 w-16 shrink-0">
                                        {log.amount}
                                    </div>
                                    <div className="space-y-1.5 flex-1 pt-0.5">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                            <User className="w-4 h-4 text-slate-400" />
                                            เบิกโดย {log.withdrawerName}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium tracking-wide">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {new Date(log.date).toLocaleString('th-TH', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                        {log.remark && (
                                            <div className="text-xs text-slate-500 bg-white/50 p-2 rounded-lg mt-1 border border-slate-100 font-medium italic">
                                                <span className="font-black text-purple-600 uppercase text-[10px] not-italic mr-1">Remark:</span>
                                                "{log.remark}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
