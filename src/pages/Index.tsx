
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle2, Clock, FolderOpen, Plus, Users, BarChart3 } from "lucide-react";
import TaskManager from "@/components/TaskManager";
import ProjectManager from "@/components/ProjectManager";
import UserManager from "@/components/UserManager";
import UserMenu from "@/components/UserMenu";
import { useTaskStore } from "@/store/taskStore";

const Index = () => {
  const { projects, tasks, users } = useTaskStore();
  const [activeTab, setActiveTab] = useState("dashboard");

  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const inProgressTasks = tasks.filter(task => task.status === "in-progress").length;
  const todoTasks = tasks.filter(task => task.status === "todo").length;
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"
  ).length;

  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const recentTasks = tasks
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with User Menu */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
                <p className="text-gray-600">Organize your projects and track your progress</p>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Total Tasks</CardTitle>
                  <div className="text-2xl font-bold">{tasks.length}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs opacity-75">
                    {tasks.length > 0 ? `${Math.round(completionRate)}% completed` : 'No tasks yet'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Completed</CardTitle>
                  <div className="text-2xl font-bold">{completedTasks}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs opacity-75">Tasks finished</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">In Progress</CardTitle>
                  <div className="text-2xl font-bold">{inProgressTasks}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs opacity-75">Active tasks</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">Overdue</CardTitle>
                  <div className="text-2xl font-bold">{overdueTasks}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs opacity-75">Need attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Overview */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Progress Overview
                </CardTitle>
                <CardDescription>Your task completion progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Completion</span>
                    <span>{Math.round(completionRate)}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{inProgressTasks}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{todoTasks}</div>
                    <div className="text-sm text-gray-600">To Do</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Tasks
                </CardTitle>
                <CardDescription>Your latest activity</CardDescription>
              </CardHeader>
              <CardContent>
                {recentTasks.length > 0 ? (
                  <div className="space-y-3">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' :
                            task.status === 'in-progress' ? 'bg-orange-500' :
                            'bg-gray-400'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900">{task.name}</p>
                            <p className="text-sm text-gray-600">{task.description}</p>
                          </div>
                        </div>
                        <Badge variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'in-progress' ? 'secondary' :
                          'outline'
                        }>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks yet. Create your first task to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManager />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectManager />
          </TabsContent>

          <TabsContent value="users">
            <UserManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
