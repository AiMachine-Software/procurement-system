import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    projectName: string;
}

export default function DeleteProjectModal({ isOpen, onClose, onDelete, projectName }: DeleteProjectModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header Actions */}
                <div className="flex justify-end p-4 pb-0">
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full p-1.5 transition-colors"
                    >
                        <span className="sr-only">Close</span>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 pb-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Delete Project?</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Are you sure you want to delete <span className="font-bold text-slate-700">"{projectName}"</span>? This action is permanent and cannot be undone. All associated data will be lost.
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-colors w-full sm:w-auto"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onDelete();
                            onClose();
                        }}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-200 active:scale-95 transition-all w-full sm:w-auto"
                    >
                        Yes, Delete Project
                    </button>
                </div>
            </div>
        </div>
    );
}
