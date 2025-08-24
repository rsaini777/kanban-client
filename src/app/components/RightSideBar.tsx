"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed unused Badge import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Clock, Play, CheckCircle, FolderOpen } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { getAllTasks } from "../services/tasks/api";
import { updateProject } from "../services/projects/api";

interface ProjectType {
  _id: string;
  name: string;
  description?: string;
}

interface RightSidebarProps {
  projects: ProjectType[];
  setSelectedProjectId?: (id: string) => void;
}

interface Task {
  _id: string;
  title: string;
  status: "Yet To Start" | "In Progress" | "Completed";
}

const RightSidebar: React.FC<RightSidebarProps> = ({ projects: initialProjects = [], setSelectedProjectId }) => {
  const [projects, setProjects] = useState<ProjectType[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize projects and handle project selection
  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      setProjects(initialProjects);
      
      // Get project ID from URL or use first project
      const projectId = searchParams.get('projectId');
      let projectToSelect = null;
      
      if (projectId) {
        projectToSelect = initialProjects.find((p: ProjectType) => p._id === projectId);
      }
      
      // If no project in URL, use the first project
      if (!projectToSelect && initialProjects.length > 0) {
        projectToSelect = initialProjects[0];
      }
      
      if (projectToSelect) {
        setSelectedProject(projectToSelect);
        if (setSelectedProjectId) {
          setSelectedProjectId(projectToSelect._id);
        }
      }
    }
  }, [initialProjects, searchParams, setSelectedProjectId]);

  // Fetch tasks when selected project changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedProject) return;
      
      setLoading(true);
      try {
        const res = await getAllTasks(selectedProject._id);
        setTasks(res.projectTasks || []);
        setName(selectedProject.name);
        setDescription(selectedProject.description || "");
        
        // Update URL with project ID for better refresh handling
        if (window) {
          window.history.replaceState({}, '', `?projectId=${selectedProject._id}`);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [selectedProject]);

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    const selectedProj = projects.find((p: ProjectType) => p._id === projectId);
    if (selectedProj) {
      setSelectedProject(selectedProj);
      if (setSelectedProjectId) {
        setSelectedProjectId(projectId);
      }
      
      // Update URL with the selected project ID
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('projectId', projectId);
        const newPath = `${pathname || ''}?${params.toString()}`;
        router.replace(newPath);
      }
    }
  };

  // Count tasks by status
  const countTasks = (status: Task["status"]) =>
    tasks.filter((t) => t.status === status).length;

  // Calculate progress percentage
  const calculateProgress = () => {
    if (tasks.length === 0) return 0;
    return Math.round((countTasks("Completed") / tasks.length) * 100);
  };

  // Save project edits
  const handleSave = async () => {
    if (!selectedProject) return;
    
    setSaving(true);
    try {
      // Only include fields that are in UpdateProjectData
      const updateData = { name };
      await updateProject(selectedProject._id, updateData);
      
      // Update local state with new values
      setSelectedProject(prev => prev ? { ...prev, name } : null);
      setProjects(prev => prev.map(p => 
        p._id === selectedProject._id ? { ...p, name } : p
      ));
      setOpenEdit(false);
    } catch (err) {
      console.error("Error updating project:", err);
    } finally {
      setSaving(false);
    }
  };

  const progress = calculateProgress();

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Project Selector Dropdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-xl">Select Project</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedProject?._id || ""} 
            onValueChange={handleProjectSelect}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a project..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-xs text-gray-500 truncate">
                      {project.description || "No description"}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProject ? (
        <>
          {/* Project Details with Edit Button */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Project Details</CardTitle>
                <Button size="sm" onClick={() => setOpenEdit(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Project Name</label>
                  <p className="text-lg font-medium text-gray-900 mt-1">{selectedProject.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Description</label>
                  <p className="text-gray-700 mt-1">
                    {selectedProject.description || "No description provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Circle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-center">Project Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <p className="text-gray-500">Loading progress...</p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="relative">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-green-500"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={`${progress}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-green-600">{progress}%</span>
                      <span className="text-sm text-gray-500">Complete</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Statistics Cards - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total Tasks */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full">
                  <FolderOpen className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-3xl font-bold text-gray-700 mb-1">
                  {tasks.length}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Total Tasks
                </div>
              </CardContent>
            </Card>

            {/* Waiting Tasks */}
            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-yellow-700 mb-1">
                  {countTasks("Yet To Start")}
                </div>
                <div className="text-sm font-medium text-yellow-700">
                  Waiting
                </div>
              </CardContent>
            </Card>

            {/* In Progress Tasks */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full">
                  <Play className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-700 mb-1">
                  {countTasks("In Progress")}
                </div>
                <div className="text-sm font-medium text-blue-700">
                  In Progress
                </div>
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-700 mb-1">
                  {countTasks("Completed")}
                </div>
                <div className="text-sm font-medium text-green-700">
                  Complete
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No project selected</p>
              <p className="text-gray-400 text-sm">Choose a project from the dropdown above</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Project Modal */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                rows={3} 
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RightSidebar;