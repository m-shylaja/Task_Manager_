
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User, Mail, Calendar, FolderOpen, CheckCircle2 } from "lucide-react";
import { useTaskStore, User as UserType } from "@/store/taskStore";
import { toast } from "sonner";

const UserManager = () => {
  const { users, projects, tasks, addUser, updateUser, deleteUser } = useTaskStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check for duplicate email
    const existingUser = users.find(u => u.email === newUser.email && u.id !== editingUser?.id);
    if (existingUser) {
      toast.error("A user with this email already exists");
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, newUser);
      toast.success("User updated successfully");
    } else {
      addUser(newUser);
      toast.success("User created successfully");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setNewUser({
      name: "",
      email: "",
    });
    setEditingUser(null);
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
    });
    setIsDialogOpen(true);
  };

  const getUserStats = (userId: string) => {
    const userProjects = projects.filter(project => project.ownerId === userId);
    const userTasks = tasks.filter(task => task.assignedTo === userId);
    const completedTasks = userTasks.filter(task => task.status === 'completed').length;
    
    return {
      projects: userProjects.length,
      tasks: userTasks.length,
      completed: completedTasks,
    };
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="text-gray-600">Manage team members and collaborators</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingUser ? 'Update User' : 'Add User'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const stats = getUserStats(user.id);
            
            return (
              <Card
                key={user.id}
                className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleEdit(user)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-gray-900 truncate">{user.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.projects}</div>
                      <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                        <FolderOpen className="h-3 w-3" />
                        Projects
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.tasks}</div>
                      <div className="text-xs text-gray-600 flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Tasks
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                  </div>

                  {/* Performance Badge */}
                  <div className="flex justify-center">
                    {stats.tasks > 0 && (
                      <Badge 
                        variant="secondary" 
                        className={`${
                          (stats.completed / stats.tasks) >= 0.8 ? 'bg-green-100 text-green-800' :
                          (stats.completed / stats.tasks) >= 0.5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {Math.round((stats.completed / stats.tasks) * 100)}% completion rate
                      </Badge>
                    )}
                  </div>

                  {/* Joined Date */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 pt-2 border-t">
                    <Calendar className="h-3 w-3" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Add team members to get started'}
            </p>
            {!searchTerm && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManager;
