import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Plus, Package } from 'lucide-react';
import { mockProjects } from '../dashboard/mocks/dashboard.mock.table';
import { mockProducts } from './mocks/productdetail.mock.table';
import EditProjectModal from './editprojectmodal';
import DeleteProjectModal from './deleteprojectmodal';

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    // Using index as ID for now
    const projectId = parseInt(id || '0');
    const [project, setProject] = useState(mockProjects[projectId] || { title: 'Unknown Project' });

    // Mock Products data
    const [products, setProducts] = useState(mockProducts);

    // Edit Project State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleOpenEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = (updatedProject: any) => {
        setProject(updatedProject);
        setIsEditModalOpen(false);
    };

    // Delete Project State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteProject = () => {
        // Here you would typically send a delete request to the API
        // For now we just navigate back to dashboard
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans relative">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Navigation & Header */}
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-slate-500 hover:text-teal-600 transition-colors mb-4 text-sm font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Workspace
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:flex-wrap md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl hidden sm:block">
                                <Package className="w-8 h-8" />
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                                    {project.title}
                                </h1>
                                <div className="flex items-center gap-1">
                                    <button onClick={handleOpenEdit} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shrink-0" title="Edit Project">
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0" title="Delete Project">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(`/project/${projectId}/add-product`)}
                            className="group flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-teal-200 active:scale-95 shrink-0 ml-auto"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            Add Product
                        </button>
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
                                {products.length > 0 ? products.map((product) => (
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
                                        <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                                            No products added yet. Click "Add Product" to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
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
