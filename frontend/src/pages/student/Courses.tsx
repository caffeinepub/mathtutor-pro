import React from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, IndianRupee } from 'lucide-react';
import { getStore } from '@/lib/store';
import WhatsAppButton from '@/components/WhatsAppButton';

export default function StudentCourses() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const store = getStore();

  const student = store.students.find((s: any) => s.userId === currentUser?.id);
  const enrolledCourseIds: string[] = student?.enrolledCourses || [];

  const enrolledCourses = store.courses.filter((c: any) =>
    enrolledCourseIds.includes(c.id)
  );

  if (enrolledCourses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground text-sm mt-1">Your enrolled courses</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Courses Yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            You haven't been enrolled in any courses yet. Contact admin or book a session to get started.
          </p>
          <WhatsAppButton
            label="Contact to Enroll"
            message="Hi, I want to enroll in a mathematics course. Please guide me."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''} enrolled
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {enrolledCourses.map((course: any) => (
          <Card key={course.id} className="border-border hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{course.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {course.level || 'All Levels'}
                    </Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-0.5 text-primary font-bold">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>{course.price?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">per month</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Link
                  to="/student/materials"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium text-foreground transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Materials
                </Link>
                <WhatsAppButton
                  label="Book Demo"
                  message={`Hi, I'm enrolled in ${course.name} and want to book a demo session.`}
                  className="flex-1 justify-center text-sm py-2 px-3"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
