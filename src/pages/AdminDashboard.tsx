
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar, Clock, Users, Award, Bookmark, CheckCircle, AlertCircle, BookOpen, BarChart2 } from "lucide-react";

// Define types
interface College {
  id: string;
  name: string;
  domain?: string;
  country?: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  batchYear?: number;
  department?: string;
  stats: {
    totalProblems: number;
    activeDays: number;
  };
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  problemCount: number;
  submissionCount: number;
  batchYear?: number;
  department?: string;
}

interface Achievement {
  id: string;
  title: string;
  description?: string;
  userName?: string;
  date?: string;
  featured: boolean;
}

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [selectedBatchYear, setSelectedBatchYear] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalProblems: 0,
    avgProblemsPerStudent: 0,
    topPerformers: [] as Student[],
    problemsByTopic: [] as {name: string, value: number}[],
    activityByDay: [] as {name: string, students: number}[]
  });

  // Fetch admin's colleges
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/signin");
      return;
    }

    if (user?.adminColleges && user.adminColleges.length > 0) {
      const fetchColleges = async () => {
        try {
          const collegeIds = user.adminColleges.map(c => c.id);
          const { data, error } = await supabase
            .from('colleges')
            .select('*')
            .in('id', collegeIds);

          if (error) throw error;
          
          if (data && data.length > 0) {
            setColleges(data);
            setSelectedCollege(data[0]);
          }
        } catch (error) {
          console.error("Error fetching colleges:", error);
          toast.error("Failed to load colleges");
        }
      };

      fetchColleges();
    } else if (user && !user.isAdmin) {
      navigate("/dashboard");
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Fetch data based on selected college
  useEffect(() => {
    if (!selectedCollege) return;

    const fetchCollegeData = async () => {
      try {
        // Fetch students
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('college_id', selectedCollege.id)
          .order('last_name', { ascending: true });

        if (profilesError) throw profilesError;

        // Fetch assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assignments')
          .select(`
            *,
            problems:assignment_problems(count),
            submissions:assignment_submissions(count)
          `)
          .eq('college_id', selectedCollege.id);

        if (assignmentsError) throw assignmentsError;

        // Fetch achievements
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('college_achievements')
          .select(`
            *,
            user:profiles(first_name, last_name)
          `)
          .eq('college_id', selectedCollege.id)
          .order('created_at', { ascending: false });

        if (achievementsError) throw achievementsError;

        // Process data
        const processedStudents: Student[] = profilesData.map((profile: any) => ({
          id: profile.id,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || '',
          avatarUrl: profile.avatar_url,
          batchYear: profile.batch_year,
          department: profile.department,
          stats: {
            totalProblems: Math.floor(Math.random() * 100), // Placeholder
            activeDays: Math.floor(Math.random() * 30), // Placeholder
          }
        }));

        const processedAssignments: Assignment[] = assignmentsData.map((assignment: any) => ({
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.due_date,
          problemCount: assignment.problems?.length || 0,
          submissionCount: assignment.submissions?.length || 0,
          batchYear: assignment.batch_year,
          department: assignment.department
        }));

        const processedAchievements: Achievement[] = achievementsData.map((achievement: any) => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          userName: achievement.user ? `${achievement.user.first_name} ${achievement.user.last_name}` : undefined,
          date: achievement.achievement_date,
          featured: achievement.featured || false
        }));

        // Calculate dashboard stats
        const totalStudents = processedStudents.length;
        const activeStudents = processedStudents.filter(student => student.stats.activeDays > 0).length;
        const totalProblems = processedStudents.reduce((sum, student) => sum + student.stats.totalProblems, 0);
        const avgProblemsPerStudent = totalStudents > 0 ? totalProblems / totalStudents : 0;
        const topPerformers = [...processedStudents]
          .sort((a, b) => b.stats.totalProblems - a.stats.totalProblems)
          .slice(0, 5);

        // Sample data for charts
        const problemsByTopic = [
          { name: 'Arrays', value: 65 },
          { name: 'Strings', value: 45 },
          { name: 'Dynamic Programming', value: 30 },
          { name: 'Trees', value: 25 },
          { name: 'Graphs', value: 15 }
        ];

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const activityByDay = days.map(day => ({
          name: day,
          students: Math.floor(Math.random() * totalStudents)
        }));

        // Update state
        setStudents(processedStudents);
        setAssignments(processedAssignments);
        setAchievements(processedAchievements);
        setDashboardStats({
          totalStudents,
          activeStudents,
          totalProblems,
          avgProblemsPerStudent,
          topPerformers,
          problemsByTopic,
          activityByDay
        });

      } catch (error) {
        console.error("Error fetching college data:", error);
        toast.error("Failed to load college data");
      }
    };

    fetchCollegeData();
  }, [selectedCollege]);

  // Filter students based on selected batch and department
  const filteredStudents = students.filter(student => 
    (!selectedBatchYear || student.batchYear === selectedBatchYear) &&
    (!selectedDepartment || student.department === selectedDepartment)
  );

  // Create new assignment
  const handleCreateAssignment = async (formData: any) => {
    if (!selectedCollege || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          title: formData.title,
          description: formData.description,
          college_id: selectedCollege.id,
          created_by: user.id,
          due_date: formData.dueDate,
          batch_year: formData.batchYear ? parseInt(formData.batchYear) : null,
          department: formData.department || null
        })
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        // Add new assignment to state
        setAssignments([...assignments, {
          id: data[0].id,
          title: data[0].title,
          description: data[0].description,
          dueDate: data[0].due_date,
          problemCount: 0,
          submissionCount: 0,
          batchYear: data[0].batch_year,
          department: data[0].department
        }]);
        
        toast.success("Assignment created successfully");
        setIsCreatingAssignment(false);
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error("Failed to create assignment");
    }
  };

  // Add new achievement
  const handleAddAchievement = async (formData: any) => {
    if (!selectedCollege) return;
    
    try {
      const { data, error } = await supabase
        .from('college_achievements')
        .insert({
          title: formData.title,
          description: formData.description,
          college_id: selectedCollege.id,
          user_id: formData.userId || null,
          achievement_date: formData.date || null,
          featured: formData.featured || false
        })
        .select();

      if (error) throw error;
      
      if (data && data[0]) {
        // Add new achievement to state
        setAchievements([{
          id: data[0].id,
          title: data[0].title,
          description: data[0].description,
          date: data[0].achievement_date,
          featured: data[0].featured,
          userName: formData.userName || undefined
        }, ...achievements]);
        
        toast.success("Achievement added successfully");
        setIsAddingAchievement(false);
      }
    } catch (error) {
      console.error("Error adding achievement:", error);
      toast.error("Failed to add achievement");
    }
  };

  // Placeholder for colors
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to access the admin dashboard.</p>
        <Button onClick={() => navigate("/dashboard")} className="mt-4">Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-600">College Admin Dashboard</h1>
        
        {/* College Selection */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">Select College:</span>
          <Select
            value={selectedCollege?.id}
            onValueChange={(value) => {
              const college = colleges.find(c => c.id === value);
              if (college) setSelectedCollege(college);
            }}
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select College" />
            </SelectTrigger>
            <SelectContent>
              {colleges.map(college => (
                <SelectItem key={college.id} value={college.id}>
                  {college.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedCollege && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">{dashboardStats.totalStudents}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dashboardStats.activeStudents} active in the last 30 days
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Problems Solved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">{dashboardStats.totalProblems}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avg. {dashboardStats.avgProblemsPerStudent.toFixed(1)} per student
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">{assignments.length}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {assignments.filter(a => new Date(a.dueDate || '') > new Date()).length} currently active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">{achievements.length}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {achievements.filter(a => a.featured).length} featured achievements
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Activity by Day</CardTitle>
                  <CardDescription>Number of active students per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardStats.activityByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="students" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Problems by Topic</CardTitle>
                  <CardDescription>Distribution of problems solved by topic</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardStats.problemsByTopic}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {dashboardStats.problemsByTopic.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Students with the most problems solved</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead className="text-right">Problems Solved</TableHead>
                      <TableHead className="text-right">Active Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardStats.topPerformers.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={student.avatarUrl} />
                              <AvatarFallback>{student.firstName.charAt(0)}{student.lastName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>{student.firstName} {student.lastName}</div>
                          </div>
                        </TableCell>
                        <TableCell>{student.department || '-'}</TableCell>
                        <TableCell>{student.batchYear || '-'}</TableCell>
                        <TableCell className="text-right">{student.stats.totalProblems}</TableCell>
                        <TableCell className="text-right">{student.stats.activeDays}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Students</h2>
              
              <div className="flex gap-4">
                <Select
                  value={selectedBatchYear?.toString() || ""}
                  onValueChange={(value) => setSelectedBatchYear(value ? parseInt(value) : null)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Batch Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Batches</SelectItem>
                    {Array.from(new Set(students.map(s => s.batchYear).filter(Boolean))).map(year => (
                      <SelectItem key={year} value={year!.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={selectedDepartment || ""}
                  onValueChange={(value) => setSelectedDepartment(value || null)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {Array.from(new Set(students.map(s => s.department).filter(Boolean))).map(dept => (
                      <SelectItem key={dept} value={dept!}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead className="text-right">Problems Solved</TableHead>
                      <TableHead className="text-right">Active Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={student.avatarUrl} />
                                <AvatarFallback>{student.firstName.charAt(0)}{student.lastName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>{student.firstName} {student.lastName}</div>
                            </div>
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.department || '-'}</TableCell>
                          <TableCell>{student.batchYear || '-'}</TableCell>
                          <TableCell className="text-right">{student.stats.totalProblems}</TableCell>
                          <TableCell className="text-right">{student.stats.activeDays}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          No students found matching the selected filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Assignments</h2>
              
              <Dialog open={isCreatingAssignment} onOpenChange={setIsCreatingAssignment}>
                <DialogTrigger asChild>
                  <Button>Create Assignment</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create Assignment</DialogTitle>
                    <DialogDescription>
                      Create a new coding assignment for students.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = Object.fromEntries(formData.entries());
                    handleCreateAssignment(data);
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input type="datetime-local" id="dueDate" name="dueDate" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="batchYear">Batch Year</Label>
                          <Input type="number" id="batchYear" name="batchYear" placeholder="Optional" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="department">Department</Label>
                          <Input id="department" name="department" placeholder="Optional" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Create Assignment</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Problems</TableHead>
                      <TableHead className="text-right">Submissions</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.length > 0 ? (
                      assignments.map(assignment => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.title}</TableCell>
                          <TableCell>
                            {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>{assignment.batchYear || 'All'}</TableCell>
                          <TableCell>{assignment.department || 'All'}</TableCell>
                          <TableCell className="text-right">{assignment.problemCount}</TableCell>
                          <TableCell className="text-right">{assignment.submissionCount}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6">
                          No assignments created yet. Click "Create Assignment" to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Achievements</h2>
              
              <Dialog open={isAddingAchievement} onOpenChange={setIsAddingAchievement}>
                <DialogTrigger asChild>
                  <Button>Add Achievement</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add Achievement</DialogTitle>
                    <DialogDescription>
                      Highlight student accomplishments on the college wall of fame.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = Object.fromEntries(formData.entries());
                    handleAddAchievement({
                      ...data,
                      featured: Boolean(formData.get('featured'))
                    });
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="userName">Student Name</Label>
                        <Input id="userName" name="userName" placeholder="Optional" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input type="date" id="date" name="date" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="featured" name="featured" className="checkbox" />
                        <Label htmlFor="featured">Feature on Wall of Fame</Label>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Add Achievement</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.length > 0 ? (
                achievements.map(achievement => (
                  <Card key={achievement.id} className={achievement.featured ? "border-purple-500" : ""}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        {achievement.featured && (
                          <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            Featured
                          </div>
                        )}
                      </div>
                      {achievement.userName && (
                        <CardDescription>{achievement.userName}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{achievement.description}</p>
                      {achievement.date && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(achievement.date).toLocaleDateString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground mb-4">No achievements added yet.</p>
                  <Button onClick={() => setIsAddingAchievement(true)}>Add Achievement</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminDashboard;
