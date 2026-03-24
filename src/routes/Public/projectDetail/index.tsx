import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Plus, Package, Calendar, User, Users, Search as SearchIcon, Filter as FilterIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import EditProjectModal from './editprojectmodal';
import DeleteProjectModal from './deleteprojectmodal';
import { projectService } from '../../../services/project.service';
import { dropdownService, DropdownItem } from '../../../services/dropdown.service';
import { projectMemberService } from '../../../services/projectMember.service';
import { authService } from '../../../services/auth.service';

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const projectId = id || '';

    const [project, setProject] = useState<any>({ title: '', status: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isOwnerOrPM, setIsOwnerOrPM] = useState(false);
    const [isMember, setIsMember] = useState(false);

    // Search Products Data
    const [products, setProducts] = useState<any[]>([]);
    const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [isSearching, setIsSearching] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchCategories = async () => {
        try {
            const data = await dropdownService.getDropdown('CATEGORIES');
            const map: Record<string, string> = {};
            data.forEach((item: DropdownItem) => {
                map[String(item.id || item.code)] = item.name;
            });
            setCategoryMap(map);
        } catch (error) {
            console.error('Failed to load categories for mapping:', error);
        }
    };

    // Add fetching logic inside fetchProjectDetail or in another useEffect
    const fetchProjectProducts = async (keyword?: string, statusCode?: string) => {
        try {
            setIsSearching(true);

            let actualData;
            if (!keyword?.trim() && !statusCode) {
                // If no filter, use the original POST API (which is known to return all products)
                actualData = await projectService.searchProjectProducts(projectId, {});
            } else {
                // If filter is active, use the new GET search API
                actualData = await projectService.searchProjectProductsWithFilter(projectId, keyword, statusCode);
            }

            if (typeof actualData === 'string') {
                try {
                    actualData = JSON.parse(actualData);
                } catch (e) {
                    console.error("Failed to parse product string JSON");
                }
            }

            let productList: any[] = [];
            if (Array.isArray(actualData)) {
                productList = actualData;
            } else if (actualData && typeof actualData === 'object') {
                // Common paths for backend data
                if (Array.isArray(actualData.data)) productList = actualData.data;
                else if (Array.isArray(actualData.items)) productList = actualData.items;
                else if (Array.isArray(actualData.content)) productList = actualData.content;
                else if (actualData.data && Array.isArray(actualData.data.items)) productList = actualData.data.items;
                else if (actualData.data && Array.isArray(actualData.data.content)) productList = actualData.data.content;
                else if (actualData.data && Array.isArray(actualData.data.data)) productList = actualData.data.data;
                else if (Object.keys(actualData).length === 0) productList = [];
                // If it's the raw axios response data field and it contains the list
                else if (actualData.list && Array.isArray(actualData.list)) productList = actualData.list;
            }

            console.log("Fetched products:", productList);
            setProducts(productList || []);
        } catch (error) {
            console.error('Failed to load project products:', error);
            setProducts([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Use useMemo to map products reactively when categoryMap is loaded
    const mappedProducts = useMemo(() => {
        return products.map((prod: any) => {
            // Priority 1: Use categories array from JSON (can be objects or IDs)
            let categoryDisplayName = '-';
            const rawCategories = prod.categories || prod.category_ids || prod.categoryIds;

            if (Array.isArray(rawCategories) && rawCategories.length > 0) {
                categoryDisplayName = rawCategories.map((c: any) => {
                    if (typeof c === 'object' && c !== null) return c.name || c.value || categoryMap[String(c.id || c.code)];
                    if (typeof c === 'number' || typeof c === 'string') return categoryMap[String(c)];
                    return null;
                }).filter(Boolean).join(', ');
            }
            // Priority 2: Try specific name fields
            if (categoryDisplayName === '-' || categoryDisplayName === '') {
                const name = prod.categoryName || prod.category_name || prod.category?.name || prod.category?.value;
                if (name) {
                    categoryDisplayName = name;
                } else {
                    // Priority 3: Lookup by ID
                    const catId = prod.category || prod.categoryId || prod.category_id;
                    if (catId && categoryMap[String(catId)]) {
                        categoryDisplayName = categoryMap[String(catId)];
                    } else if (typeof prod.category === 'string' && prod.category !== '') {
                        categoryDisplayName = prod.category;
                    }
                }
            }

            return {
                id: prod.id,
                name: prod.name,
                specification: prod.specification,
                amount: prod.amount,
                category: categoryDisplayName,
                statusName: prod.statusName || prod.status_name || '-',
                status: {
                    draft: prod.draft ? {
                        date: String(prod.draft.date || prod.draft).substring(0, 10),
                        name: prod.draft.userName || 'Draft'
                    } : null,
                    approved: prod.approve || prod.approved ? {
                        date: String((prod.approve || prod.approved).date || prod.approve || prod.approved).substring(0, 10),
                        name: (prod.approve || prod.approved).userName || 'Approve'
                    } : null,
                    procurement: prod.process || prod.procurement ? {
                        date: String((prod.process || prod.procurement).date || prod.process || prod.procurement).substring(0, 10),
                        name: (prod.process || prod.procurement).userName || 'Process'
                    } : null,
                    received: prod.receive || prod.received ? {
                        date: String((prod.receive || prod.received).date || prod.receive || prod.received).substring(0, 10),
                        name: (prod.receive || prod.received).userName || 'Receive'
                    } : null,
                    withdrawn: prod.withdrawn ? {
                        date: String(prod.withdrawn.date || prod.withdrawn).substring(0, 10),
                        name: prod.withdrawn.userName || 'Withdrawn'
                    } : null
                }
            };
        });
    }, [products, categoryMap]);

    // Pagination Calculations
    const totalPages = Math.ceil(mappedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = mappedProducts.slice(startIndex, startIndex + itemsPerPage);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedStatus, itemsPerPage]);

    const pageNumbers = useMemo(() => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    }, [currentPage, totalPages]);

    const fetchProjectDetail = async () => {
        try {
            setIsLoading(true);
            const [res, membersRes] = await Promise.all([
                projectService.getProjectById(projectId),
                projectMemberService.getProjectMembers(projectId).catch(() => [])
            ]);

            if (res.code === 'SUCCESS' && res.data) {
                const p = res.data;

                // 1. Check known literal keys
                let kDate = p.kickoff_date || p.kickoffDate || p.kick_off_date || p.startDate || p.start_date || p.kickoff;
                let dDate = p.due_date || p.dueDate || p.endDate || p.end_date || p.due;

                // 2. Fuzzy search keys if still not found
                if (!kDate) {
                    const kKey = Object.keys(p).find(k => k.toLowerCase().includes('kick') || k.toLowerCase().includes('start'));
                    if (kKey) kDate = p[kKey];
                }
                if (!dDate) {
                    const dKey = Object.keys(p).find(k => k.toLowerCase().includes('due') || k.toLowerCase().includes('end'));
                    if (dKey) dDate = p[dKey];
                }

                // 3. Fallback to Search API if STILL missing (since Dashboard search definitely returns them)
                if (!kDate || !dDate) {
                    try {
                        const searchRes = await projectService.searchProjects({ name: p.name, page: 1, pageSize: 50 });
                        let projectList = null;
                        if (Array.isArray(searchRes?.data?.items)) projectList = searchRes.data.items;
                        else if (Array.isArray(searchRes?.data?.content)) projectList = searchRes.data.content;
                        else if (Array.isArray(searchRes?.data)) projectList = searchRes.data;
                        else if (Array.isArray(searchRes)) projectList = searchRes;

                        if (projectList) {
                            const found = projectList.find((prj: any) => String(prj.id) === String(projectId));
                            if (found) {
                                if (!kDate) kDate = found.kickoff_date || found.kickoffDate || found.kick_off_date || found.startDate || found.start_date || found.kickoff;
                                if (!dDate) dDate = found.due_date || found.dueDate || found.endDate || found.end_date || found.due;
                            }
                        }
                    } catch (e) {
                        console.error('Failed fallback date search:', e);
                    }
                }

                const membersList = Array.isArray(p.members) && p.members.length > 0 ? p.members : (Array.isArray(membersRes) ? membersRes : []);

                let ownerName = p.owner || "-";
                if (membersList.length > 0) {
                    const ownerObj = membersList.find((m: any) => m.roleCode === "OWNER" || m.role?.code === "OWNER");
                    if (ownerObj) {
                        ownerName = ownerObj.name || ownerObj.user?.name || ownerObj.userName || ownerName;
                    }
                }
                const memberCount = membersList.length;

                // Check permissions
                const currentUserId = authService.getCurrentUserId();
                const currentUserMember = membersList.find((m: any) => String(m.userId) === String(currentUserId));
                const roleCode = currentUserMember?.roleCode || currentUserMember?.role?.code;
                setIsOwnerOrPM(roleCode === 'OWNER' || roleCode === 'PM');
                setIsMember(!!currentUserMember);

                setProject({
                    ...p,
                    title: p.name || p.title || 'Untitled',
                    description: p.description,
                    status: p.current_status?.code || p.statusCode || p.status_code || p.status || 'IN_COMING',
                    owner: ownerName,
                    memberCount: memberCount,
                    kickoff: kDate ? String(kDate).substring(0, 10) : '-',
                    due: dDate ? String(dDate).substring(0, 10) : '-'
                });
            } else {
                setProject({ title: 'Project not found' });
            }
        } catch (error) {
            console.error('Failed to load project details:', error);
            setProject({ title: 'Error loading project' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchCategories();
            fetchProjectDetail();
        }
    }, [projectId]);

    // Handle Search and Filter changes
    useEffect(() => {
        if (projectId) {
            const timer = setTimeout(() => {
                fetchProjectProducts(searchQuery, selectedStatus);
            }, 300); // Debounce search
            return () => clearTimeout(timer);
        }
    }, [projectId, searchQuery, selectedStatus]);

    // Edit Project State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleOpenEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (updatedProject: any) => {
        setIsLoading(true);
        try {
            await projectService.updateProject(projectId, {
                name: updatedProject.title,
                description: updatedProject.description,
                status_code: updatedProject.status,
                kickoff_date: updatedProject.kickoff || updatedProject.kickoff_date,
                due_date: updatedProject.due || updatedProject.due_date
            });
            await fetchProjectDetail();
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Failed to update project:', error);
            alert('Failed to update project.');
        } finally {
            setIsLoading(false);
        }
    };

    // Delete Project State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteProject = async () => {
        setIsLoading(true);
        try {
            await projectService.deleteProject(projectId);
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to delete project:', error);
            alert('Failed to delete project.');
            setIsLoading(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans relative">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Navigation & Header */}
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-slate-500 hover:text-amber-600 transition-colors mb-4 text-sm font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Workspace
                    </button>

                    <div className="flex flex-col gap-5 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-start gap-4 flex-wrap">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl hidden sm:block mt-1">
                                    <Package className="w-8 h-8" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                                            {project.title}
                                        </h1>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mt-1 ${project.status === 'IN_COMING' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                            project.status === 'ACTIVE' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                project.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    project.status === 'CANCLE' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                        'bg-slate-50 text-slate-600 border border-slate-200'
                                            }`}>
                                            {project.status || 'IN_COMING'}
                                        </span>
                                        <div className="flex items-center gap-1 mt-1">
                                            <button
                                                onClick={handleOpenEdit}
                                                disabled={!isOwnerOrPM}
                                                className={`p-2 rounded-xl transition-colors shrink-0 ${isOwnerOrPM ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-slate-200 cursor-not-allowed'}`}
                                                title={isOwnerOrPM ? "Edit Project" : "Only Owners and PMs can edit"}
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setIsDeleteModalOpen(true)}
                                                disabled={!isOwnerOrPM}
                                                className={`p-2 rounded-xl transition-colors shrink-0 ${isOwnerOrPM ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-200 cursor-not-allowed'}`}
                                                title={isOwnerOrPM ? "Delete Project" : "Only Owners and PMs can delete"}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    {project.description && (
                                        <p className="text-slate-500 text-sm mt-3 leading-relaxed max-w-3xl">
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Add Product Button */}
                            {(() => {
                                const isProjectDisabled = project.status !== 'ACTIVE';
                                const isAddDisabled = isProjectDisabled || !isMember;
                                return (
                                    <button
                                        onClick={() => !isAddDisabled && navigate(`/project/${projectId}/add-product`)}
                                        disabled={isAddDisabled}
                                        className={`group flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 shrink-0 ml-auto w-full md:w-auto justify-center ${isAddDisabled
                                            ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                                            : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200"
                                            }`}
                                        title={
                                            isProjectDisabled
                                                ? "Cannot add products when project is In coming or Canceled"
                                                : !isMember
                                                    ? "Only project members can add products"
                                                    : "Add Product"
                                        }
                                    >
                                        <Plus size={20} className={isAddDisabled ? "" : "group-hover:rotate-90 transition-transform duration-300"} />
                                        Add Product
                                    </button>
                                );
                            })()}
                        </div>

                        {/* Metadata Below Title */}
                        <div className="flex flex-wrap items-center gap-6 pt-5 border-t border-slate-50">
                            <div className="flex items-center text-[12px]">
                                <User size={15} className="text-slate-300 mr-2.5" />
                                <span className="font-semibold text-slate-400 mr-2 uppercase tracking-wider">Owner:</span>
                                <span className="text-slate-700 font-bold">{project.owner || '-'}</span>
                            </div>
                            <div className="flex items-center text-[12px]">
                                <Users size={15} className="text-slate-300 mr-2.5" />
                                <span className="font-semibold text-slate-400 mr-2 uppercase tracking-wider">Members:</span>
                                <span className="text-slate-700 font-bold">{project.memberCount || '0'}</span>
                            </div>
                            <div className="flex items-center text-[12px]">
                                <Calendar size={15} className="text-slate-300 mr-2.5" />
                                <span className="font-semibold text-slate-400 mr-2 uppercase tracking-wider">Kickoff:</span>
                                <span className="text-slate-600 font-medium">{project.kickoff || '-'}</span>
                            </div>
                            <div className="flex items-center text-[12px]">
                                <Calendar size={15} className="text-amber-400 mr-2.5" />
                                <span className="font-semibold text-slate-400 mr-2 uppercase tracking-wider">Due Date:</span>
                                <span className="text-slate-900 font-bold">{project.due || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Area */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <SearchIcon className={`w-4 h-4 transition-colors ${isSearching ? 'text-amber-500 animate-pulse' : 'text-slate-400 group-focus-within:text-amber-500'}`} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products or specifications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-sm"
                            />
                        </div>

                        <div className="relative group min-w-[200px]">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <FilterIcon className="w-4 h-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                            </div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-10 text-sm text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all shadow-sm cursor-pointer font-medium"
                            >
                                <option value="">All Statuses</option>
                                <option value="b1fc8b25-c572-4162-9131-7863e7af4873">Draft</option>
                                <option value="8751dd60-119c-450e-8b2d-d4a76bbb6bbc">Pending Approval</option>
                                <option value="02553c68-eaac-4a69-80f8-02533ad0d7fb">Approved</option>
                                <option value="65e18ae6-077c-42cd-8cc0-f458f64c6622">Rejected</option>
                                <option value="fbb4486c-bbf3-407d-b2f9-69b44bcd66cd">Procurement</option>
                                <option value="1ddf7a3f-b181-4902-9cef-4523cd708c80">Received</option>
                                <option value="4e0a678c-4c00-4c65-89b0-9f89bd9e0953">Reject Receive</option>
                                <option value="6ef2c592-2006-498a-ae1a-9a31f9fd38cd">Withdrawn</option>
                                <option value="7df5e92c-17e4-4ce1-8497-6d4951e50214">Fully Withdrawn</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm shrink-0 flex items-center gap-2">
                        Total Items: <span className="text-slate-800 text-sm">{mappedProducts.length}</span>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-bold border-r border-slate-200 whitespace-nowrap min-w-[200px]" rowSpan={2}>
                                        Product name
                                    </th>
                                    <th scope="col" className="px-6 py-4 font-bold border-r border-slate-200 whitespace-nowrap min-w-[150px]" rowSpan={2}>
                                        specification
                                    </th>
                                    <th scope="col" className="px-6 py-4 font-bold border-r border-slate-200 whitespace-nowrap" rowSpan={2}>
                                        amount
                                    </th>
                                    <th scope="col" className="px-6 py-4 font-bold border-r border-slate-200 whitespace-nowrap" rowSpan={2}>
                                        category
                                    </th>
                                    <th scope="col" className="px-4 py-4 font-bold border-r border-slate-200 whitespace-nowrap text-center" rowSpan={2}>
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 font-bold text-center border-b border-slate-200" colSpan={5}>
                                        Status
                                    </th>
                                </tr>
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-bold text-center border-r border-slate-200 text-slate-500 bg-slate-50/80 whitespace-nowrap min-w-[80px]">
                                        Draft
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-bold text-center border-r border-slate-200 text-slate-500 bg-slate-50/80 whitespace-nowrap min-w-[80px]">
                                        Approve
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-bold text-center border-r border-slate-200 text-slate-500 bg-slate-50/80 whitespace-nowrap min-w-[80px]">
                                        Procurement
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-bold text-center border-r border-slate-200 text-slate-500 bg-slate-50/80 whitespace-nowrap min-w-[80px]">
                                        Received
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-bold text-center text-slate-500 bg-slate-50/80 whitespace-nowrap min-w-[80px]">
                                        Withdrawn
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? currentItems.map((product) => (
                                    <tr
                                        key={product.id}
                                        onClick={() => navigate(`/project/${projectId}/product/${product.id}`)}
                                        className="bg-white border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4 font-bold text-slate-800 border-r border-slate-100 whitespace-nowrap">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 border-r border-slate-100">
                                            {product.specification}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 border-r border-slate-100">
                                            {product.amount}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 border-r border-slate-100">
                                            {product.category}
                                        </td>
                                        <td className="px-4 py-4 text-center border-r border-slate-100">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap border ${product.statusName?.toUpperCase().includes('REJECT')
                                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                : 'bg-slate-50 text-slate-600 border-slate-100'
                                                }`}>
                                                {product.statusName || '-'}
                                            </span>
                                        </td>
                                        {/* Status Indicators (Date & Name) */}
                                        {[
                                            product.status.draft,
                                            product.status.approved,
                                            product.status.procurement,
                                            product.status.received,
                                            product.status.withdrawn
                                        ].map((statusObj, idx, arr) => (
                                            <td key={idx} className={`px-2 py-3 text-center align-middle ${idx !== arr.length - 1 ? 'border-r border-slate-100' : 'border-slate-100'}`}>
                                                {statusObj ? (
                                                    <div className="flex flex-col items-center justify-center space-y-0.5">
                                                        <span className="text-xs font-bold text-slate-700">{statusObj.date}</span>
                                                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">{statusObj.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                                            No products added yet. Click "Add Product" to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                {mappedProducts.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-500">Show</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span className="text-sm font-medium text-slate-500">entries</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-xl border transition-all ${currentPage === 1
                                    ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-amber-500 hover:text-amber-600 shadow-sm'}`}
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="flex items-center gap-1">
                                {pageNumbers.map(number => (
                                    <button
                                        key={number}
                                        onClick={() => setCurrentPage(number)}
                                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === number
                                            ? 'bg-amber-600 text-white shadow-lg shadow-amber-200'
                                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-transparent'}`}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-xl border transition-all ${currentPage === totalPages
                                    ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-amber-500 hover:text-amber-600 shadow-sm'}`}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        <div className="text-sm font-semibold text-slate-400">
                            Showing <span className="text-slate-700">{startIndex + 1}</span> to <span className="text-slate-700">{Math.min(startIndex + itemsPerPage, mappedProducts.length)}</span> of <span className="text-slate-700">{mappedProducts.length}</span> entries
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Project Modal */}
            <EditProjectModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                project={project}
                onSave={handleSaveEdit}
            />

            {/* Delete Project Modal */}
            <DeleteProjectModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDeleteProject}
                projectName={project.title}
            />
        </div>
    );
}
