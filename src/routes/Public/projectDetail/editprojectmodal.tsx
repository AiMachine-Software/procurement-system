import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { dropdownService, DropdownItem } from '../../../services/dropdown.service';

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
    onSave: (updatedProject: any) => void;
}

export default function EditProjectModal({ isOpen, onClose, project, onSave }: EditProjectModalProps) {
    const [editProjectData, setEditProjectData] = useState({ ...project });
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
            }
        } catch (error) {
            console.error('Failed to load status options:', error);
        }
    };

    useEffect(() => {
        setEditProjectData({ ...project });
    }, [project]);

    if (!isOpen) return null;

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editProjectData);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditProjectData((prev: any) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800">Edit Project</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors"
                    >
                        <span className="sr-only">Close</span>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1">Project Name</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={editProjectData.title || ''}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm mb-4"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={editProjectData.description || ''}
                            onChange={handleEditChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm"
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={editProjectData.status || ''}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm bg-white"
                        >
                            {statusOptions.length > 0 ? (
                                statusOptions.map((opt) => (
                                    <option key={opt.code} value={opt.code}>
                                        {opt.name}
                                    </option>
                                ))
                            ) : (
                                <>
                                    <option value="ACTIVE">Active</option>
                                    <option value="IN_COMING">In coming</option>
                                    <option value="SUCCESS">Success</option>
                                    <option value="CANCLE">Cancel</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="kickoff" className="block text-sm font-semibold text-slate-700 mb-1">Kickoff Date</label>
                            <input
                                type="date"
                                id="kickoff"
                                name="kickoff"
                                value={editProjectData.kickoff || ''}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="due" className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                id="due"
                                name="due"
                                value={editProjectData.due || ''}
                                onChange={handleEditChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>



                    <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-lg shadow-amber-200"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
