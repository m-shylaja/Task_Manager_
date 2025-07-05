
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  status: 'active' | 'completed' | 'archived';
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string;
  createdAt: string;
  parentTaskId?: string;
  tags: string[];
}

interface TaskStore {
  users: User[];
  projects: Project[];
  tasks: Task[];
  
  // User actions
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Utility functions
  getTasksByProject: (projectId: string) => Task[];
  getProjectsByUser: (userId: string) => Project[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      users: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          createdAt: new Date().toISOString(),
        },
      ],
      
      projects: [
        {
          id: '1',
          name: 'Website Redesign',
          description: 'Complete redesign of the company website',
          ownerId: '1',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Mobile App Development',
          description: 'Develop a new mobile application',
          ownerId: '2',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ],
      
      tasks: [
        {
          id: '1',
          projectId: '1',
          name: 'Create wireframes',
          description: 'Design wireframes for all main pages',
          status: 'completed',
          priority: 'high',
          assignedTo: '1',
          createdAt: new Date().toISOString(),
          tags: ['design', 'wireframes'],
        },
        {
          id: '2',
          projectId: '1',
          name: 'Develop homepage',
          description: 'Code the new homepage design',
          status: 'in-progress',
          priority: 'medium',
          assignedTo: '2',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          tags: ['development', 'frontend'],
        },
        {
          id: '3',
          projectId: '2',
          name: 'Set up project structure',
          description: 'Initialize the mobile app project',
          status: 'todo',
          priority: 'high',
          assignedTo: '2',
          createdAt: new Date().toISOString(),
          tags: ['setup', 'mobile'],
        },
      ],
      
      // User actions
      addUser: (userData) => set((state) => ({
        users: [...state.users, {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }]
      })),
      
      updateUser: (id, userData) => set((state) => ({
        users: state.users.map(user => 
          user.id === id ? { ...user, ...userData } : user
        )
      })),
      
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(user => user.id !== id),
        projects: state.projects.filter(project => project.ownerId !== id),
        tasks: state.tasks.filter(task => task.assignedTo !== id),
      })),
      
      // Project actions
      addProject: (projectData) => set((state) => ({
        projects: [...state.projects, {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }]
      })),
      
      updateProject: (id, projectData) => set((state) => ({
        projects: state.projects.map(project => 
          project.id === id ? { ...project, ...projectData } : project
        )
      })),
      
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter(project => project.id !== id),
        tasks: state.tasks.filter(task => task.projectId !== id),
      })),
      
      // Task actions
      addTask: (taskData) => set((state) => ({
        tasks: [...state.tasks, {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }]
      })),
      
      updateTask: (id, taskData) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...taskData } : task
        )
      })),
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id && task.parentTaskId !== id),
      })),
      
      // Utility functions
      getTasksByProject: (projectId) => get().tasks.filter(task => task.projectId === projectId),
      getProjectsByUser: (userId) => get().projects.filter(project => project.ownerId === userId),
    }),
    {
      name: 'task-manager-storage',
    }
  )
);
