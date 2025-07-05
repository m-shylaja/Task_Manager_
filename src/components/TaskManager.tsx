
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Calendar, User, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useTaskStore, Task } from "@/store/taskStore";
import { toast } from "sonner";

const TaskManager = () => {
  const { tasks, projects, users, addTask, updateTask, deleteTask } = useTaskStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    projectId: "",
    status: "todo" as const,
    priority: "medium" as const,
    assignedTo: "",
    dueDate: "",
    tags: [] as string[],
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.name.trim() || !newTask.projectId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, newTask);
      toast.success("Task updated successfully");
    } else {
      addTask(newTask);
      toast.success("Task created successfully");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setNewTask({
      name: "",
      description: "",
      projectId: "",
      status: "todo",
      priority: "medium",
      assignedTo: "",
      dueDate: "",
      tags: [],
    });
    setEditingTask(null);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      name: task.name,
      description: task.description,
      projectId: task.projectId,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
      tags: task.tags,
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus });
    toast.success(`Task status updated to ${newStatus}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-orange-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    completed: filteredTasks.filter(task => task.status === 'completed'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-600">Manage and track your tasks</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Task Name *</Label>
                <Input
                  id="name"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  placeholder="Enter task name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="project">Project *</Label>
                <Select value={newTask.projectId} onValueChange={(value) => setNewTask({ ...newTask, projectId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newTask.status} onValueChange={(value: any) => setNewTask({ ...newTask, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task Board */}
      <Tabs defaultValue="board" className="space-y-4">
        <TabsList>
          <TabsTrigger value="board">Board View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(['todo', 'in-progress', 'completed'] as const).map((status) => (
              <Card key={status} className="border-0 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(status)}
                    {status === 'todo' ? 'To Do' : status === 'in-progress' ? 'In Progress' : 'Completed'}
                    <Badge variant="secondary" className="ml-auto">
                      {tasksByStatus[status].length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasksByStatus[status].map((task) => {
                    const project = projects.find(p => p.id === task.projectId);
                    const assignedUser = users.find(u => u.id === task.assignedTo);
                    
                    return (
                      <div
                        key={task.id}
                        className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleEdit(task)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-gray-900 flex-1">{task.name}</h4>
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{project?.name}</span>
                            {assignedUser && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {assignedUser.name}
                              </div>
                            )}
                          </div>
                          
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          
                          <div className="flex gap-1 pt-2">
                            {(['todo', 'in-progress', 'completed'] as const)
                              .filter(s => s !== task.status)
                              .map((newStatus) => (
                                <Button
                                  key={newStatus}
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(task.id, newStatus);
                                  }}
                                >
                                  {newStatus === 'todo' ? 'To Do' : 
                                   newStatus === 'in-progress' ? 'In Progress' : 'Complete'}
                                </Button>
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {tasksByStatus[status].length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No tasks in this column</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card className="border-0 shadow-md">
            <CardContent className="p-0">
              {filteredTasks.length > 0 ? (
                <div className="divide-y">
                  {filteredTasks.map((task) => {
                    const project = projects.find(p => p.id === task.projectId);
                    const assignedUser = users.find(u => u.id === task.assignedTo);
                    
                    return (
                      <div
                        key={task.id}
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleEdit(task)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {getStatusIcon(task.status)}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{task.name}</h4>
                              <p className="text-sm text-gray-600">{task.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <Badge className={`${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                            
                            <div className="text-sm text-gray-600 min-w-0">
                              {project?.name}
                            </div>
                            
                            {assignedUser && (
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {assignedUser.name}
                              </div>
                            )}
                            
                            {task.dueDate && (
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks found matching your criteria</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskManager;
