import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Calendar, User, LayoutGrid } from "lucide-react";
import { mockProjects } from "./mocks/dashboard.mock.table";
import AddProjectModal from "./addprojectmodal";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ข้อมูลโปรเจกต์ (จำลอง)
  const [projects, setProjects] = useState(mockProjects);

  // ฟังก์ชันกรองข้อมูลตาม Search
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProject = (newProject: any) => {
    setProjects([newProject, ...projects]);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans relative selection:bg-teal-100 flex flex-col">

      {/* Main Container */}
      <div className="flex-1 w-full bg-white rounded-[2rem] p-6 md:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid size={20} className="text-teal-600" />
              <span className="text-teal-600 font-bold text-xs uppercase tracking-wider">Workspace</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Projects</h1>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-7 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-teal-200 active:scale-95"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Add Project
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12 group max-w-md">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search projects, owners or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4.5 pl-14 pr-6 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:bg-white transition-all outline-none"
          />
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <div
                key={index}
                onClick={() => navigate(`/project/${index}`)}
                className="group bg-white rounded-[2rem] p-7 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500 relative flex flex-col cursor-pointer"
              >
                {/* Status Badge */}
                <div className="absolute top-7 right-7">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${project.status === 'IN_COMING' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    project.status === 'ACTIVE' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      project.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        project.status === 'CANCLE' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                    {project.status}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-800 mb-3 pr-16 group-hover:text-teal-600 transition-colors">
                  {project.title}
                </h2>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed line-clamp-2">
                  {project.description}
                </p>

                {/* Meta Data */}
                <div className="mt-auto pt-6 border-t border-slate-50 space-y-3">
                  <div className="flex items-center text-[11px]">
                    <User size={14} className="text-slate-300 mr-3" />
                    <span className="font-semibold text-slate-400 w-24 uppercase tracking-tighter">Owner</span>
                    <span className="text-slate-700 font-bold">{project.owner}</span>
                  </div>
                  <div className="flex items-center text-[11px]">
                    <Calendar size={14} className="text-slate-300 mr-3" />
                    <span className="font-semibold text-slate-400 w-24 uppercase tracking-tighter">Kickoff</span>
                    <span className="text-slate-600 font-medium">{project.kickoff}</span>
                  </div>
                  <div className="flex items-center text-[11px]">
                    <Calendar size={14} className="text-teal-300 mr-3" />
                    <span className="font-semibold text-slate-400 w-24 uppercase tracking-tighter">Due Date</span>
                    <span className="text-slate-900 font-bold">{project.due}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-slate-50 p-6 rounded-full mb-4 ring-8 ring-slate-50/50">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No projects found</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              We couldn't find anything matching "{searchTerm}". Try another keyword.
            </p>
          </div>
        )}
      </div>

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProject={handleAddProject}
      />
    </div>
  );
}