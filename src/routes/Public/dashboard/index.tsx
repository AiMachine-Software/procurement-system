import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Calendar, User, LayoutGrid, LogOut, ChevronLeft, ChevronRight, Users } from "lucide-react";
import AddProjectModal from "./addprojectmodal";
import AddMemberModal from "./addmembermodal";
import LogoutModal from "./logoutmodal";
import { projectService } from "../../../services/project.service";
import { authService } from "../../../services/auth.service";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // ข้อมูลโปรเจกต์
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
    const timer = setTimeout(() => {
      fetchProjects(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProjects = async (search: string = "") => {
    try {
      setIsLoading(true);
      const data = await projectService.searchProjects({
        name: search,
        page: 1,
        pageSize: 50
      });

      // Handle different possible pagination wrappers
      let projectList = null;
      if (Array.isArray(data?.data?.items)) projectList = data.data.items;
      else if (Array.isArray(data?.data?.content)) projectList = data.data.content;
      else if (Array.isArray(data?.data)) projectList = data.data;
      else if (Array.isArray(data)) projectList = data;

      if (projectList) {
        const currentUserId = authService.getCurrentUserId();
        const mapped = projectList.map((p: any) => {
          const kDate = p.kickoff_date || p.kickoffDate || p.kick_off_date || p.startDate || p.start_date || p.kickoff;
          const dDate = p.due_date || p.dueDate || p.endDate || p.end_date || p.due;

          let ownerName = p.owner || "Current User";
          let currentUserRoleCode = "";

          if (Array.isArray(p.members)) {
            const ownerObj = p.members.find((m: any) => m.roleCode === "OWNER" || m.role?.code === "OWNER");
            if (ownerObj) {
              ownerName = ownerObj.name || ownerObj.user?.name || ownerObj.userName || ownerName;
            }

            const myMember = currentUserId ? p.members.find((m: any) => m.userId === currentUserId || m.user?.id === currentUserId) : null;
            if (myMember) {
              currentUserRoleCode = myMember.roleCode || myMember.role?.code || "";
            }
          }

          return {
            id: p.id,
            title: p.name || p.title || "Untitled",
            description: p.description || "",
            status: p.current_status?.code || p.statusCode || p.status_code || p.status || "IN_COMING",
            owner: ownerName,
            kickoff: kDate ? String(kDate).substring(0, 10) : "-",
            due: dDate ? String(dDate).substring(0, 10) : "-",
            currentUserRoleCode: currentUserRoleCode,
            memberCount: Array.isArray(p.members) ? p.members.length : 0
          };
        });
        setProjects(mapped);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = async (newProject: any) => {
    try {
      const payload = {
        name: newProject.title,
        description: newProject.description,
        status_code: newProject.status,
        kickoff_date: newProject.kickoff,
        due_date: newProject.due
      };
      await projectService.createProject(payload);

      // Refresh list after creation
      await fetchProjects();
    } catch (error) {
      console.error("Failed to create project", error);
      alert("Failed to create project. Please check if API is running.");
      // Fallback update to UI so user feels responsive
      setProjects([newProject, ...projects]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleAddMembers = (members: { email: string, permission: string }[]) => {
    // You can integrate the API call to add members to selectedProjectId here
    console.log(`Adding members to project ${selectedProjectId}:`, members);
    // For now, let's simulate a success feedback
    // TODO: Connect this to the actual Add Member API when ready
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans relative selection:bg-amber-100 flex flex-col">

      {/* Main Container */}
      <div className="flex-1 w-full bg-white rounded-[2rem] p-6 md:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid size={20} className="text-amber-600" />
              <span className="text-amber-600 font-bold text-xs uppercase tracking-wider">Workspace</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Projects</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-7 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-amber-200 active:scale-95"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              Add Project
            </button>


          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-12 group max-w-md">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search projects, owners or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4.5 pl-14 pr-6 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white transition-all outline-none"
          />
        </div>

        {/* Project Cards Grid */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : projects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((project, index) => (
                <div
                  key={project.id || index}
                  onClick={() => navigate(`/project/${project.id}`)}
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

                  <h2 className="text-xl font-bold text-slate-800 mb-3 pr-16 group-hover:text-amber-600 transition-colors">
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
                      <Users size={14} className="text-slate-300 mr-3" />
                      <span className="font-semibold text-slate-400 w-24 uppercase tracking-tighter">Members</span>
                      <span className="text-slate-700 font-bold">{project.memberCount}</span>
                    </div>
                    <div className="flex items-center text-[11px]">
                      <Calendar size={14} className="text-slate-300 mr-3" />
                      <span className="font-semibold text-slate-400 w-24 uppercase tracking-tighter">Kickoff</span>
                      <span className="text-slate-600 font-medium">{project.kickoff}</span>
                    </div>
                    <div className="flex items-center text-[11px]">
                      <Calendar size={14} className="text-amber-300 mr-3" />
                      <span className="font-semibold text-slate-400 w-24 uppercase tracking-tighter">Due Date</span>
                      <span className="text-slate-900 font-bold">{project.due}</span>
                    </div>
                  </div>

                  {/* Add Member Button (Bottom Right) */}
                  {(() => {
                    const role = (project.currentUserRoleCode || "").toUpperCase();
                    const canAddMember = role.includes("OWNER") || role.includes("PM");
                    return (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canAddMember) {
                            setSelectedProjectId(project.id);
                            setIsAddMemberModalOpen(true);
                          }
                        }}
                        disabled={!canAddMember}
                        className={`absolute bottom-6 right-6 p-2.5 rounded-xl transition-all shadow border group ${canAddMember
                          ? "text-white bg-amber-500 hover:bg-amber-600 border-amber-400/50 hover:shadow-lg hover:-translate-y-0.5"
                          : "text-slate-400 bg-slate-200 border-slate-300 cursor-not-allowed opacity-60"
                          }`}
                        title={canAddMember ? "Add Member" : "Only Owner or PM can add members"}
                      >
                        <Plus size={22} className={canAddMember ? "group-hover:rotate-90 transition-transform duration-300" : ""} />
                      </button>
                    );
                  })()}
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {Math.ceil(projects.length / itemsPerPage) > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1.5">
                  {[...Array(Math.ceil(projects.length / itemsPerPage))].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-black flex items-center justify-center transition-all ${currentPage === idx + 1
                        ? "bg-amber-600 text-white shadow-lg shadow-amber-200"
                        : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(projects.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(projects.length / itemsPerPage)}
                  className="p-2 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
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

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false);
          setSelectedProjectId(null);
        }}
        projectId={selectedProjectId}
        onAddMembers={handleAddMembers}
      />

      {/* Button at bottom left (in normal document flow) */}
      <div className="mt-6 px-2 flex justify-start w-full">
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="group flex items-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 border border-transparent hover:border-rose-100"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          Logout
        </button>
      </div>
    </div>
  );
}