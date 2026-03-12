import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Trash2, Mail, Shield } from 'lucide-react';

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
    onSave: (updatedProject: any) => void;
}

export default function EditProjectModal({ isOpen, onClose, project, onSave }: EditProjectModalProps) {
    const MOCK_USERS = [
        'john.doe@example.com',
        'jane.smith@example.com',
        'robert.johnson@example.com',
        'emily.davis@example.com',
        'michael.wilson@example.com',
        'sarah.brown@example.com',
        'somchai.jaidee@example.com'
    ];
    const [editProjectData, setEditProjectData] = useState({ ...project });
    const [members, setMembers] = useState<{ email: string, permission: string }[]>(project.members || []);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberPermission, setNewMemberPermission] = useState('MEMBER');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredUsers = MOCK_USERS.filter(email =>
        email.toLowerCase().includes(newMemberEmail.toLowerCase()) &&
        !members.some(m => m.email === email)
    );

    useEffect(() => {
        setEditProjectData({ ...project });
        setMembers(project.members || []);
    }, [project]);

    if (!isOpen) return null;

    const handleAddMember = () => {
        if (!newMemberEmail.trim()) return;
        setMembers([...members, { email: newMemberEmail.trim(), permission: newMemberPermission }]);
        setNewMemberEmail('');
        setNewMemberPermission('MEMBER');
    };

    const handleRemoveMember = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...editProjectData, members });
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
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm mb-4"
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
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={editProjectData.status || ''}
                            onChange={handleEditChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm bg-white"
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="IN_COMING">IN_COMING</option>
                            <option value="SUCCESS">SUCCESS</option>
                            <option value="CANCLE">CANCLE</option>
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
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
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
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Members Section */}
                    <div className="space-y-2 mt-4">
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Team Members</label>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1 group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={newMemberEmail}
                                    onChange={(e) => {
                                        setNewMemberEmail(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                    placeholder="Search member email..."
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
                                />
                                {isDropdownOpen && filteredUsers.length > 0 && (
                                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                        {filteredUsers.map((email) => (
                                            <div
                                                key={email}
                                                onClick={() => {
                                                    setNewMemberEmail(email);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 cursor-pointer transition-colors"
                                            >
                                                {email}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="relative w-full sm:w-40 group shrink-0">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                                    <Shield className="h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <select
                                    value={newMemberPermission}
                                    onChange={(e) => setNewMemberPermission(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-10 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="PM/KEY">PM/KEY</option>
                                    <option value="MEMBER">MEMBER</option>
                                    <option value="APPROVER">APPROVER</option>
                                    <option value="BUYER">BUYER</option>
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddMember}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center justify-center shrink-0"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>

                        {members.length > 0 && (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto mt-2">
                                {members.map((member, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-teal-100 text-teal-700 p-2 rounded-full hidden sm:block">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-semibold text-slate-700 truncate">{member.email}</p>
                                                <p className="text-xs text-slate-500">{member.permission}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveMember(index)}
                                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                            className="px-6 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-lg shadow-teal-200"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
