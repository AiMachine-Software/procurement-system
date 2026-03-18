import React, { useState, useEffect } from 'react';
import { X, Mail, Shield, Plus, Users, Trash2, CheckCircle, AlertCircle, Loader2, UserCheck } from 'lucide-react';
import { projectMemberService, UserResponse, RoleResponse, ProjectMemberResponse } from '../../../services/projectMember.service';
import { authService } from '../../../services/auth.service';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string | null;
    onAddMembers: (members: { email: string, permission: string }[]) => void;
}

export default function AddMemberModal({ isOpen, onClose, projectId, onAddMembers }: AddMemberModalProps) {
    const [members, setMembers] = useState<{ userId: string, email: string, roleCode: string }[]>([]);
    const [existingMembers, setExistingMembers] = useState<ProjectMemberResponse[]>([]);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [newMemberPermission, setNewMemberPermission] = useState('MEMBER');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<UserResponse[]>([]);
    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        if (!projectId) return;
        try {
            const [usersData, rolesData, projectMembersData] = await Promise.all([
                projectMemberService.getUsers(),
                projectMemberService.getRoles(),
                projectMemberService.getProjectMembers(projectId)
            ]);
            setAvailableUsers(Array.isArray(usersData) ? usersData : []);
            setRoles(Array.isArray(rolesData) ? rolesData : []);
            setExistingMembers(Array.isArray(projectMembersData) ? projectMembersData : []);

            if (Array.isArray(rolesData) && rolesData.length > 0) {
                setNewMemberPermission(rolesData[0].code);
            }
        } catch (error) {
            console.error('Failed to fetch initial data', error);
        }
    };

    const filteredUsers = (Array.isArray(availableUsers) ? availableUsers : []).filter(user =>
        (user.email.toLowerCase().includes(newMemberEmail.toLowerCase()) ||
            user.name.toLowerCase().includes(newMemberEmail.toLowerCase())) &&
        !members.some(m => m.userId === user.id) &&
        !existingMembers.some(em => em.userId === user.id)
    );

    const currentUserId = authService.getCurrentUserId();
    const currentUserMember = existingMembers.find(m => m.userId === currentUserId);
    const currentUserRoleObj = currentUserMember ? roles.find(r => r.code === currentUserMember.roleCode) : null;
    const currentUserRoleName = (currentUserRoleObj?.name || currentUserMember?.roleCode || '').toUpperCase();
    
    const checkCanDeleteMember = (targetMember: ProjectMemberResponse) => {
        const targetRoleObj = roles.find(r => r.code === targetMember.roleCode);
        const targetRoleName = (targetRoleObj?.name || targetMember.roleCode || '').toUpperCase();

        // Prevent users from removing themselves (including Owner or PM/Key)
        if (targetMember.userId === currentUserId) return false;

        // No one can delete an OWNER from this modal
        if (targetRoleName.includes('OWNER')) return false;

        // OWNER can delete anyone else
        if (currentUserRoleName.includes('OWNER')) return true;

        // PM/Key can delete members except themselves, other PM/Key, and OWNERs
        if (currentUserRoleName.includes('PM') || currentUserRoleName.includes('KEY')) {
            if (targetRoleName.includes('PM') || targetRoleName.includes('KEY')) {
                return false;
            }
            return true;
        }

        return false;
    };

    const getRoleWeight = (roleCode: string | undefined): number => {
        const roleObj = roles.find(r => r.code === roleCode);
        const name = (roleObj?.name || roleCode || '').toUpperCase();
        
        if (name.includes('OWNER')) return 1;
        if (name.includes('PM') || name.includes('KEY')) return 2;
        if (name.includes('APPROVER')) return 3;
        if (name.includes('BUYER') || name.includes('PROCUREMENT')) return 4;
        return 5; // members or others
    };

    const sortedExistingMembers = [...existingMembers].sort((a, b) => {
        const weightA = getRoleWeight(a.roleCode);
        const weightB = getRoleWeight(b.roleCode);
        return weightA - weightB;
    });

    if (!isOpen) return null;

    const handleAddMemberToList = () => {
        if (!newMemberEmail.trim() || !selectedUserId) return;
        setMembers([...members, { userId: selectedUserId, email: newMemberEmail.trim(), roleCode: newMemberPermission }]);
        setNewMemberEmail('');
        setSelectedUserId(null);
    };

    const handleRemoveMember = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const handleDeleteExistingMember = async (memberId: string) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            await projectMemberService.removeMember(memberId);
            setExistingMembers(prev => prev.filter(m => m.id !== memberId));
            setStatus({ type: 'success', message: 'Member removed successfully.' });
        } catch (error) {
            console.error('Failed to remove member', error);
            setStatus({ type: 'error', message: 'Failed to remove member.' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (members.length === 0 || !projectId) return;

        setIsLoading(true);
        setStatus({ type: null, message: '' });

        try {
            // Sequential API calls as requested for each member
            for (const member of members) {
                await projectMemberService.addMember({
                    projectId,
                    userId: member.userId,
                    roleCode: member.roleCode
                });
            }

            setStatus({ type: 'success', message: 'Successfully added members to the project!' });
            onAddMembers(members.map(m => ({ email: m.email, permission: m.roleCode })));

            // Close after a small delay to show success
            setTimeout(() => {
                setMembers([]);
                setNewMemberEmail('');
                setStatus({ type: null, message: '' });
                onClose();
            }, 1500);

        } catch (error) {
            console.error('Failed to add members', error);
            setStatus({ type: 'error', message: 'Failed to add some members. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-[2rem] w-full  max-w-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 md:p-8 pb-4 shrink-0 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Add Team Members</h2>
                        <p className="text-slate-500 text-sm mt-1">Add new members to this project</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors self-start">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="p-6 md:p-8 space-y-4 min-h-[350px] max-h-[75vh] overflow-y-auto">

                        {/* Existing Project Members Section */}
                        {existingMembers.length > 0 && (
                            <div className="mb-6 space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <UserCheck size={14} />
                                    Existing Members ({existingMembers.length})
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {sortedExistingMembers.map((member) => (
                                        <div key={member.id} className="flex items-center gap-3 bg-slate-50/80 border border-slate-100 p-3 rounded-xl">
                                            <div className="bg-white text-slate-400 p-2 rounded-full border border-slate-100 shrink-0">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <div className="overflow-hidden flex-1">
                                                <p className="text-sm font-bold text-slate-700 truncate">{member.userName || 'Unknown'}</p>
                                                <p className="text-[10px] uppercase font-semibold tracking-wider text-amber-600">
                                                    {roles.find(r => r.code === member.roleCode)?.name || member.roleCode}
                                                </p>
                                            </div>
                                            {checkCanDeleteMember(member) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteExistingMember(member.id)}
                                                    className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0 outline-none border border-transparent hover:border-rose-100 disabled:opacity-50"
                                                    title="Remove member"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="border-b border-slate-100 pt-3"></div>
                            </div>
                        )}

                        <label className="text-xs font-bold text-slate-700 uppercase tracking-widest ml-1">Team Members</label>

                        <div className="flex flex-col sm:flex-row gap-2 relative">
                            <div className="relative flex-1 group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={newMemberEmail}
                                    onChange={(e) => {
                                        setNewMemberEmail(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    // small delay to allow click on dropdown items
                                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                    placeholder="Search member email..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all text-sm font-medium"
                                />
                                {isDropdownOpen && filteredUsers.length > 0 && (
                                    <div className="absolute z-[70] w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => {
                                                    setNewMemberEmail(user.email);
                                                    setSelectedUserId(user.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                                            >
                                                <div className="flex flex-col">
                                                    <span>{user.name}</span>
                                                    <span className="text-[10px] text-slate-400">{user.email}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="relative w-full sm:w-48 group shrink-0">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                                    <Shield className="h-4 w-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                                </div>
                                <select
                                    value={newMemberPermission}
                                    onChange={(e) => setNewMemberPermission(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-9 pr-10 text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all text-sm font-medium appearance-none cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {roles.map(role => (
                                        <option key={role.id || role.code} value={role.code}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddMemberToList}
                                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center justify-center shrink-0"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>

                        {members.length > 0 && (
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 max-h-80 overflow-y-auto mt-4">
                                {members.map((member, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="bg-amber-100 text-amber-700 p-2 rounded-full shrink-0">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-bold text-slate-700 truncate">{member.email}</p>
                                                <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                                                    {roles.find(r => r.code === member.roleCode)?.name || member.roleCode}
                                                </p>
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
                        {status.type && (
                            <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium animate-in slide-in-from-top-2 duration-300 mt-4 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                                }`}>
                                {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {status.message}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white rounded-b-[2rem]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || members.length === 0}
                            className={`px-8 py-3 text-sm font-bold text-white rounded-xl transition-all shadow-lg w-full sm:w-auto flex items-center justify-center gap-2 ${isLoading || members.length === 0
                                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200 active:scale-95'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Confirm Add Members'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
