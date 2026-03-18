import React, { useState, useEffect } from 'react';
import { X, Calendar, LayoutGrid, AlignLeft, Activity } from 'lucide-react';
import { dropdownService, DropdownItem } from '../../../services/dropdown.service';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddProject: (project: any) => void;
}

export default function AddProjectModal({ isOpen, onClose, onAddProject }: AddProjectModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        kickoff: '',
        due: '',
        status: 'IN_COMING'
    });
    const [statusOptions, setStatusOptions] = useState<DropdownItem[]>([]);

    useEffect(() => {
        if (isOpen && statusOptions.length === 0) {
            fetchStatusOptions();
        }
    }, [isOpen]);

    const fetchStatusOptions = async () => {
        try {
            const data = await dropdownService.getDropdown('PROJECT');
            if (Array.isArray(data)) {
                setStatusOptions(data);
                if (data.length > 0 && !formData.status) {
                    setFormData(prev => ({ ...prev, status: data[0].code }));
                }
            }
        } catch (error) {
            console.error('Failed to load status options:', error);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate that required fields are filled
        if (!formData.title || !formData.kickoff || !formData.due) {
            alert("Please fill out all required fields.");
            return;
        }

        const newProject = {
            ...formData,
            owner: 'Current User' // Mock owner
        };

        onAddProject(newProject);

        // Reset form and close
        setFormData({ title: '', description: '', kickoff: '', due: '', status: 'IN_COMING' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">

            {/* Modal Container */}
            <div
                className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                role="dialog"
            >
                {/* Header Section */}
                <div className="flex justify-between items-center p-6 md:p-8 pb-4 shrink-0 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create New Project</h2>
                        <p className="text-slate-500 text-sm mt-1">Fill in the details below to start a new workspace.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors self-start"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form elements */}
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                    <div className="p-6 md:p-8 space-y-6 overflow-y-auto">

                        {/* Project Name */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Project Name <span className="text-rose-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <LayoutGrid className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Q4 Marketing Campaign"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Description</label>
                            <div className="relative group">
                                <div className="absolute top-3.5 left-4 pointer-events-none">
                                    <AlignLeft className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Briefly describe the project goals..."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none resize-none font-medium"
                                />
                            </div>
                        </div>

                        {/* Dates Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Kickoff Date */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Kickoff Date <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Calendar className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                    </div>
                                    <input
                                        type="date"
                                        name="kickoff"
                                        value={formData.kickoff}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Due Date <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Calendar className="h-5 w-5 text-amber-400 group-focus-within:text-amber-600 transition-colors" />
                                    </div>
                                    <input
                                        type="date"
                                        name="due"
                                        value={formData.due}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none font-medium"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status Dropdown */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Status <span className="text-rose-500">*</span></label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Activity className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-10 text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
                                    required
                                >
                                    {statusOptions.length > 0 ? (
                                        statusOptions.map(opt => (
                                            <option key={opt.code} value={opt.code}>{opt.name}</option>
                                        ))
                                    ) : (
                                        <>
                                            <option value="IN_COMING">In coming</option>
                                            <option value="ACTIVE">Active</option>
                                            <option value="SUCCESS">Success</option>
                                            <option value="CANCLE">Cancel</option>
                                        </>
                                    )}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 md:p-8 pt-5 border-t border-slate-100 flex justify-end gap-3 rounded-b-[2rem] bg-slate-50/50 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-200 active:scale-95 transition-all"
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
