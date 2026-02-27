import React from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Calendar,
  FileText,
  Bell,
  Clock,
  Video,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { getStore } from '../../lib/store';
import WhatsAppButton from '../../components/WhatsAppButton';

export default function StudentDashboard() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const store = getStore();

  const student = store.students.find((s) => s.userId === currentUser?.id);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Student Record Not Found</h2>
        <p className="text-muted-foreground text-sm">Please contact admin for assistance.</p>
      </div>
    );
  }

  if (student.status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
        <div className="p-4 bg-orange-100 rounded-full mb-4">
          <Clock className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Account Pending Approval</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Your account is being reviewed by the admin. You'll be notified once approved.
        </p>
        <WhatsAppButton
          label="Contact Admin"
          message="Hi, I registered on The Rajat's Equation platform and my account is pending approval. Please review my application."
        />
      </div>
    );
  }

  if (student.status === 'rejected') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
        <div className="p-4 bg-destructive/10 rounded-full mb-4">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Account Not Approved</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Your account application was not approved. Please contact admin for more information.
        </p>
        <WhatsAppButton
          label="Contact Admin"
          message="Hi, my account on The Rajat's Equation platform was rejected. I'd like to know more about this."
        />
      </div>
    );
  }

  const enrolledCourses = store.courses.filter((c) =>
    student.enrolledCourses.includes(c.id)
  );
  const mySessions = store.sessions.filter((s) => s.studentId === student.id);
  const upcomingSessions = mySessions.filter(
    (s) => s.status === 'confirmed' && new Date(s.date) >= new Date()
  );
  const notifications = store.notifications.filter(
    (n) => n.userId === currentUser?.id && !n.read
  );

  const quickLinks = [
    { label: 'My Courses', icon: <BookOpen className="w-5 h-5" />, to: '/student/courses', count: enrolledCourses.length },
    { label: 'Sessions', icon: <Calendar className="w-5 h-5" />, to: '/student/sessions', count: mySessions.length },
    { label: 'Materials', icon: <FileText className="w-5 h-5" />, to: '/student/materials', count: null },
    { label: 'Notifications', icon: <Bell className="w-5 h-5" />, to: '/student', count: notifications.length },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {currentUser?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Ready to continue your mathematics journey?
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="default" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Account Active
              </Badge>
              {student.accessCode && (
                <Badge variant="outline" className="text-xs font-mono">
                  {student.accessCode}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickLinks.map((link) => (
          <Link key={link.label} to={link.to}>
            <Card className="border-border hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50 group">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2 text-primary group-hover:scale-110 transition-transform">
                  {link.icon}
                </div>
                <p className="text-sm font-medium text-foreground">{link.label}</p>
                {link.count !== null && link.count > 0 && (
                  <Badge variant="secondary" className="text-xs mt-1">{link.count}</Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Upcoming sessions */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Upcoming Sessions</CardTitle>
            <Link to="/student/sessions">
              <Button variant="ghost" size="sm" className="text-xs">View all</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">No upcoming sessions</p>
              <Link to="/student/book">
                <Button size="sm">Book a Session</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 3).map((session) => (
                <div key={session.id} className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 bg-primary/10 rounded">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{session.courseName}</p>
                      <p className="text-xs text-muted-foreground">{session.date} • {session.time}</p>
                    </div>
                  </div>
                  {session.meetLink && (
                    <a
                      href={session.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                    >
                      <Video className="w-3 h-3" />
                      Join
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrolled courses summary */}
      {enrolledCourses.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">My Courses</CardTitle>
              <Link to="/student/courses">
                <Button variant="ghost" size="sm" className="text-xs">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {enrolledCourses.slice(0, 3).map((course) => (
                <div key={course.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1 truncate">{course.name}</span>
                  <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
