import React from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  BookOpen,
  Calendar,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { getStore } from '../../lib/store';

export default function AdminDashboard() {
  const store = getStore();
  const students = store.students;
  const payments = store.payments;
  const sessions = store.sessions;
  const materials = store.materials;
  const courses = store.courses;

  const pendingStudents = students.filter((s) => s.status === 'pending');
  const approvedStudents = students.filter((s) => s.status === 'approved');
  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  // Use 'scheduled' as the active/upcoming status
  const upcomingSessions = sessions.filter(
    (s) => s.status === 'scheduled' && new Date(s.date) >= new Date()
  );
  const pendingPayments = payments.filter((p) => p.status === 'pending');

  const stats = [
    {
      title: 'Total Students',
      value: students.length,
      sub: `${approvedStudents.length} approved`,
      icon: <Users className="w-5 h-5 text-primary" />,
      color: 'bg-primary/10',
    },
    {
      title: 'Active Courses',
      value: courses.filter((c) => c.isActive !== false).length,
      sub: `${courses.length} total`,
      icon: <BookOpen className="w-5 h-5 text-primary" />,
      color: 'bg-primary/10',
    },
    {
      title: 'Total Sessions',
      value: sessions.length,
      sub: `${upcomingSessions.length} upcoming`,
      icon: <Calendar className="w-5 h-5 text-primary" />,
      color: 'bg-primary/10',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      sub: `${payments.filter((p) => p.status === 'completed').length} payments`,
      icon: <IndianRupee className="w-5 h-5 text-primary" />,
      color: 'bg-primary/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back! Here's an overview of your coaching center.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      <div className="grid md:grid-cols-2 gap-4">
        {pendingStudents.length > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {pendingStudents.length} Pending Approval{pendingStudents.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">Students waiting for account approval</p>
                </div>
                <Link to="/admin/students">
                  <Button size="sm" variant="outline" className="shrink-0">Review</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {pendingPayments.length > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {pendingPayments.length} Pending Payment{pendingPayments.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">Payments awaiting confirmation</p>
                </div>
                <Link to="/admin/payments">
                  <Button size="sm" variant="outline" className="shrink-0">View</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Students */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Students</CardTitle>
              <Link to="/admin/students">
                <Button variant="ghost" size="sm" className="text-xs">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No students yet</p>
            ) : (
              students
                .slice()
                .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
                .slice(0, 5)
                .map((student) => (
                  <div key={student.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        student.status === 'approved'
                          ? 'default'
                          : student.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="text-xs shrink-0"
                    >
                      {student.status}
                    </Badge>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming Sessions</CardTitle>
              <Link to="/admin/sessions">
                <Button variant="ghost" size="sm" className="text-xs">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming sessions</p>
            ) : (
              upcomingSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{session.courseName}</p>
                      <p className="text-xs text-muted-foreground">{session.date} • {session.time}</p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs shrink-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    scheduled
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Materials summary */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Study Materials</CardTitle>
            <Link to="/admin/materials">
              <Button variant="ghost" size="sm" className="text-xs">Manage</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground font-medium">{materials.length} materials uploaded</span>
            </div>
            <span className="text-muted-foreground text-sm">across {courses.length} courses</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
