import React, { useState } from 'react';
import { X, Calendar, LayoutGrid, AlignLeft, Activity, Users, Plus, Trash2, Mail, Shield } from 'lucide-react';

interface AddProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddProject: (project: any) => void;
}

export default function AddProjectModal({ isOpen, onClose, onAddProject }: AddProjectModalProps) {
    const MOCK_USERS = [
        'john.doe@example.com',
        'jane.smith@example.com',
        'robert.johnson@example.com',
        'emily.davis@example.com',
        'michael.wilson@example.com',
        'sarah.brown@example.com',
        'somchai.jaidee@example.com'
    ];
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        kickoff: '',
        due: '',
        status: 'IN_COMING'
    });
    const [members, setMembers] = useState<{ email: string, permission: string }[]>([]);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberPermission, setNewMemberPermission] = useState('MEMBER');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredUsers = MOCK_USERS.filter(email =>
        email.toLowerCase().includes(newMemberEmail.toLowerCase()) &&
        !members.some(m => m.email === email)
    );

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddMember = () => {
        if (!newMemberEmail.trim()) return;
        setMembers([...members, { email: newMemberEmail.trim(), permission: newMemberPermission }]);
        setNewMemberEmail('');
        setNewMemberPermission('MEMBER');
    };

    const handleRemoveMember = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
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
            members,
            owner: 'Current User' // Mock owner
        };

        onAddProject(newProject);

        // Reset form and close
        setFormData({ title: '', description: '', kickoff: '', due: '', status: 'IN_COMING' });
        setMembers([]);
        setNewMemberEmail('');
        setNewMemberPermission('MEMBER');
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
                                    <LayoutGrid className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Q4 Marketing Campaign"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium"
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Description</label>
                            <div className="relative group">
                                <div className="absolute top-3.5 left-4 pointer-events-none">
                                    <AlignLeft className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Briefly describe the project goals..."
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none resize-none font-medium"
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
                                        <Calendar className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                    </div>
                                    <input
                                        type="date"
                                        name="kickoff"
                                        value={formData.kickoff}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Due Date <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <Calendar className="h-5 w-5 text-teal-400 group-focus-within:text-teal-600 transition-colors" />
                                    </div>
                                    <input
                                        type="date"
                                        name="due"
                                        value={formData.due}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium"
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
                                    <Activity className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                </div>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-10 text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="IN_COMING">IN_COMING</option>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="CANCLE">CANCLE</option>
                                    <option value="SUCCESS">SUCCESS</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Members Section */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Team Members</label>

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
                                        placeholder="Search member email address..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium text-sm"
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
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-9 pr-10 text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none font-medium appearance-none cursor-pointer text-sm"
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
                                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center justify-center shrink-0"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>

                            {members.length > 0 && (
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto mt-2">
                                    {members.map((member, index) => (
                                        <div key={index} className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="bg-teal-100 text-teal-700 p-2 rounded-full">
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
                                                className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                            className="px-6 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-200 active:scale-95 transition-all"
                        >
                            Confirm
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
