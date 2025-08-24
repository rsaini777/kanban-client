"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createTask, updateTask } from "../../services/tasks/api";

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "Yet To Start" | "In Progress" | "Completed";
}

interface TasksModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  task?: Task; 
}

const TasksModal: React.FC<TasksModalProps> = ({
  open,
  onClose,
  projectId,
  task,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("low");
  const [status, setStatus] = useState<"Yet To Start" | "In Progress" | "Completed">(
    "Yet To Start"
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setStatus(task.status);
    } else {
      setTitle("");
      setDescription("");
      setPriority("low");
      setStatus("Yet To Start");
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      if (task) {
        await updateTask(projectId,task._id, { title, description, priority, status });
      } else {
        await createTask( { title, description, priority, status ,projectId});
      }
      onClose();
      if (!task) {
        setTitle("");
        setDescription("");
        setPriority("low");
        setStatus("Yet To Start");
      }
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Priority</label>
              <Select value={priority} onValueChange={(val) => setPriority(val as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={status} onValueChange={(val) => setStatus(val as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yet To Start">Yet To Start</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : task ? "Save Changes" : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TasksModal;
