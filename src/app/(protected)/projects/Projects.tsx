"use client";

import React, { useState, useEffect } from "react";
import LeftSidebar from "../../components/LeftSideBar";
import RightSidebar from "../../components/RightSideBar";
import { getProjectById,getProjects } from "@/app/services/projects/api"; // Your API to fetch project info

interface ProjectProps {
  projectId: string;
}

interface ProjectType {
  _id: string;
  name: string;
  description?: string;
}

const Project: React.FC<ProjectProps> = ({ userId }) => {
  const [project, setProject] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [taskUpdateTrigger, setTaskUpdateTrigger] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await getProjects(userId);
        setProject(res);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [userId]);

  if (loading) {
    return <p className="text-gray-500 p-4">Loading project...</p>;
  }

  if (!project) {
    return <p className="text-red-500 p-4">Project not found</p>;
  }
  console.log(selectedProjectId);
  return (
    <div className="flex h-full w-full p-4 gap-4">
      {/* Left Sidebar / Kanban */}
      <div className="w-2/3 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 shadow">
        <LeftSidebar 
          selectedProjectId={selectedProjectId} 
          onTaskUpdate={() => setTaskUpdateTrigger(prev => prev + 1)} 
        />
      </div>

      {/* Right Sidebar / Project Info */}
      <div className="w-1/3 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 shadow">
        <RightSidebar 
          key={taskUpdateTrigger} 
          projects={project.projects} 
          setSelectedProjectId={setSelectedProjectId} 
        />
      </div>
    </div>
  );
};

export default Project;
