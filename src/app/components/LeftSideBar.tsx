"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import TasksModal from "./projects/TasksModal";
import { getAllTasks, updateTask, deleteTask, Task } from "../services/tasks/api";

interface LeftSidebarProps {
  selectedProjectId?: string | null;
  onTaskUpdate?: () => void;
}

interface TaskState {
  yetToStart: Task[];
  inProgress: Task[];
  completed: Task[];
}

const initialState: TaskState = {
  yetToStart: [],
  inProgress: [],
  completed: []
};

const LeftSidebar: React.FC<LeftSidebarProps> = ({ selectedProjectId, onTaskUpdate }) => {
  const [openTask, setOpenTask] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<TaskState>(initialState);
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const projectId = searchParams.get('projectId') || selectedProjectId || null;

  // Update URL when selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId && selectedProjectId !== searchParams.get('projectId')) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('projectId', selectedProjectId);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [selectedProjectId, searchParams, router, pathname]);

  // Fetch tasks when projectId changes
  const fetchAllTasks = useCallback(async (projectId: string | null) => {
    if (!projectId) {
      setTasks(initialState);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log("Fetching tasks for project ID:", projectId);
      
      const res = await getAllTasks(projectId);
      
      if (res?.projectTasks) {
        // Group tasks by status
        setTasks({
          yetToStart: res.projectTasks.filter((t: Task) => t.status === 'Yet To Start'),
          inProgress: res.projectTasks.filter((t: Task) => t.status === 'In Progress'),
          completed: res.projectTasks.filter((t: Task) => t.status === 'Completed')
        });
      } else {
        setTasks(initialState);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks(initialState);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tasks when projectId changes
  useEffect(() => {
    fetchAllTasks(projectId);
  }, [projectId, fetchAllTasks]);

  if (!projectId) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Please select a project to view tasks</p>
      </div>
    );
  }

  const handleDragStart = (task: Task) => setDraggedTask(task);

  const handleDrop = async (newStatus: Task["status"]) => {
    if (!draggedTask || !projectId || draggedTask.status === newStatus) return;

    const oldStatus = draggedTask.status;
    const taskId = draggedTask._id;
    
    // Optimistically update the UI
    const updatedTask = { ...draggedTask, status: newStatus };
    
    // Create updated task lists
    const updateTasks = (prev: TaskState): TaskState => {
      // Remove from old list
      const removeFromList = (list: Task[]) => list.filter(t => t._id !== taskId);
      
      // Add to new list
      const addToList = (list: Task[]) => [...list, updatedTask];
      
      // Update the appropriate lists based on old and new status
      const updatedState = { ...prev };
      
      // Remove from old status
      if (oldStatus === "Yet To Start") {
        updatedState.yetToStart = removeFromList(updatedState.yetToStart);
      } else if (oldStatus === "In Progress") {
        updatedState.inProgress = removeFromList(updatedState.inProgress);
      } else if (oldStatus === "Completed") {
        updatedState.completed = removeFromList(updatedState.completed);
      }
      
      // Add to new status
      if (newStatus === "Yet To Start") {
        updatedState.yetToStart = addToList(updatedState.yetToStart);
      } else if (newStatus === "In Progress") {
        updatedState.inProgress = addToList(updatedState.inProgress);
      } else if (newStatus === "Completed") {
        updatedState.completed = addToList(updatedState.completed);
      }
      
      return updatedState;
    };
    
    // Update the UI optimistically
    setTasks(prev => updateTasks(prev));

    try {
      // Update the task status in the backend
      await updateTask(projectId, taskId, { status: newStatus });
      
      // Refresh tasks to ensure we have the latest data
      await fetchAllTasks(projectId);
      
      // Notify parent that tasks were updated
      onTaskUpdate?.();
    } catch (error) {
      console.error("Error updating task status:", error);
      // Revert the optimistic update if the API call fails
      await fetchAllTasks(projectId);
    } finally {
      setDraggedTask(null);
    }
  };

  // ✅ Priority Badge Style
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Task Card Component
  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const handleEdit = () => {
      setOpenTask(true);
      setCurrentTask(task);
    };

    const handleDelete = async (task: Task) => {
      if (!projectId) return;
      
      try {
        const result = await deleteTask(projectId, task._id);
        if (result.success) {
          // Update the local state to remove the deleted task
          setTasks(prev => ({
            ...prev,
            yetToStart: prev.yetToStart.filter(t => t._id !== task._id),
            inProgress: prev.inProgress.filter(t => t._id !== task._id),
            completed: prev.completed.filter(t => t._id !== task._id)
          }));
          
          // Notify parent component of the update
          onTaskUpdate?.();
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    };

    return (
      <div
        key={task._id}
        className="p-3 mb-2 bg-white dark:bg-gray-800 shadow rounded-lg cursor-grab flex flex-col gap-2"
        draggable
        onDragStart={() => handleDragStart(task)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium">{task.title}</h4>
            <p className="text-sm text-gray-500">{task.description}</p>
          </div>

          <div className="flex gap-2">
            <button className="p-1 hover:text-blue-500" onClick={handleEdit}>
              <Pencil className="w-4 h-4" />
            </button>
            <button className="p-1 hover:text-red-500" onClick={() => handleDelete(task)}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <span
          className={`inline-block px-2 py-1 text-xs rounded-md self-start ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority.toUpperCase()}
        </span>
      </div>
    );
  };

  // Use the projectId from URL or props
  const currentProjectId = projectId;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Tasks</h2>
        <Button 
          onClick={() => setOpenTask(true)} 
          size="sm"
          disabled={!currentProjectId}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

   

      {/* Loading */}
      {loading && <p className="text-gray-500">Loading tasks...</p>}

      {/* No Project Selected */}
      {!currentProjectId && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No project selected</p>
          <p className="text-sm text-gray-400">Please select a project to view tasks</p>
        </div>
      )}

      {/* Task Containers */}
      {currentProjectId && !loading && (
        <div className="grid grid-cols-3 gap-4">
          {/* Yet To Start */}
          <div
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-900 min-h-[300px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop("Yet To Start")}
          >
            <h3 className="font-semibold mb-2 text-yellow-700">
              Yet To Start ({tasks.yetToStart.length})
            </h3>
            {tasks.yetToStart.map((task: Task) => (
              <TaskCard key={task._id} task={task} />
            ))}
            {tasks.yetToStart.length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-4">
                No tasks yet
              </p>
            )}
          </div>

          {/* In Progress */}
          <div
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-900 min-h-[300px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop("In Progress")}
          >
            <h3 className="font-semibold mb-2 text-blue-700">
              In Progress ({tasks.inProgress.length})
            </h3>
            {tasks.inProgress.map((task: Task) => (
              <TaskCard key={task._id} task={task} />
            ))}
            {tasks.inProgress.length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-4">
                No tasks in progress
              </p>
            )}
          </div>

          {/* Completed */}
          <div
            className="p-3 rounded-xl bg-gray-100 dark:bg-gray-900 min-h-[300px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop("Completed")}
          >
            <h3 className="font-semibold mb-2 text-green-700">
              Completed ({tasks.completed.length})
            </h3>
            {tasks.completed.map((task: Task) => (
              <TaskCard key={task._id} task={task} />
            ))}
            {tasks.completed.length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-4">
                No completed tasks
              </p>
            )}
          </div>
        </div>
      )}

      {/* Task Modal */}
      {openTask && (
        <TasksModal
          open={openTask}
          onClose={() => {
            setOpenTask(false);
            setCurrentTask(undefined);
          }}
          projectId={projectId || ''}
          task={currentTask}
          onTaskSaved={() => {
            // Refresh tasks when a task is created/updated
            fetchAllTasks(projectId);
            onTaskUpdate?.();
          }}
        />
      )}
    </div>
  );
};

export default LeftSidebar;