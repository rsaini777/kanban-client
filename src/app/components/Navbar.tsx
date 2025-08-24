"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { createProject } from "../services/projects/api";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";

type NavbarProps = {
  user?: {
    userId?: string;
    name?: string;
    email?: string;
   
  };
  onAddProject?: () => void;
};

export default function Navbar({
  user = { name: "John Doe", email: "john@example.com", userId: "" },
  onAddProject,
}: NavbarProps) {
  const router = useRouter();

  const initials =
    (user?.name || "")
      .split(" ")
      .map((s) => s?.[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  // Logout using NextAuth and redirect to home page
  const handleLogout = useCallback(async () => {
    await signOut({ redirect: false });
    router.push("/"); // redirect to home
  }, [router]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !user?.userId) {
      console.error('Project name or user ID is missing');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Creating project with data:', {
        name: projectName.trim(),
        invitedUsers: user.userId
      });
      
      const result = await createProject({
        name: projectName.trim(),
        invitedUsers: user.userId,
      });
      
      console.log('Project creation result:', result);
      
      if (result?.success) {
        setProjectName("");
        setIsModalOpen(false);
        if (onAddProject) onAddProject();
      } else {
        console.error('Failed to create project:', result);
        alert('Failed to create project. Please check the console for more details.');
      }
    } catch (error: any) {
      console.error("Error creating project:", error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        alert(`Error: ${error.response.data?.message || 'Failed to create project'}`);
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-[100vw] px-4 sm:px-6 lg:px-8">
        <nav className="h-16 flex items-center justify-between gap-3">
          {/* Left: Logo + Search */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="font-semibold text-sm sm:text-base">Kanban</span>
            </Link>

            <div className="hidden md:flex items-center gap-2 w-full max-w-xl">
              <Input type="search" placeholder="Search..." className="w-full" />
            </div>
          </div>

          {/* Right: Add Project + User Menu */}
          <div className="flex items-center gap-2">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!projectName.trim() || isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="User menu"
                  className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent focus:outline-none"
                >
                  <Avatar className="h-8 w-8">
                    {user?.image ? (
                      <AvatarImage src={user.image} alt={user.name || "User"} />
                    ) : (
                      <AvatarFallback>{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="hidden sm:flex flex-col items-start leading-tight text-left">
                    <span className="text-sm font-medium">{user?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {user?.email || ""}
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground truncate">{user?.email || ""}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        <div className="md:hidden pb-3">
          <Input type="search" placeholder="Search..." />
        </div>
      </div>
    </header>
  );
}
