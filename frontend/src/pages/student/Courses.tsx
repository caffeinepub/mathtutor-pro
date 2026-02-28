import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCourses, getMaterials, getAuthState, getStore } from '../../lib/store';
import { BookOpen, MessageCircle, Users, User } from 'lucide-react';

export default function StudentCourses() {
  const auth = getAuthState();
  const store = getStore();
  const student = auth ? store.students.find((s) => s.id === auth.userId || s.userId === auth.userId) : null;
  const allCourses = getCourses();
  const materials = getMaterials();

  const enrolledCourses = allCourses.filter(
    (c) => student?.enrolledCourses?.includes(c.id)
  );

  const getMaterialCount = (courseId: string) =>
    materials.filter((m) => m.courseId === courseId).length;

  if (enrolledCourses.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">My Courses</h1>
        <p className="text-muted-foreground mb-8">Courses you are enrolled in will appear here.</p>
        <div className="text-center py-16 bg-primary/5 rounded-2xl border border-primary/10">
          <BookOpen size={56} className="mx-auto text-primary/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Courses Yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            You haven't been enrolled in any courses yet. Contact us on WhatsApp to get started!
          </p>
          <Button
            className="bg-[#25D366] hover:opacity-90 text-white h-12 px-6 text-base font-semibold"
            onClick={() => window.open('https://wa.me/919424135055?text=Hi! I want to enroll in a course.', '_blank')}
          >
            <MessageCircle size={18} className="mr-2" />
            Contact on WhatsApp
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-2">My Courses</h1>
      <p className="text-muted-foreground mb-6">Your enrolled courses and study materials.</p>

      <div className="grid md:grid-cols-2 gap-5">
        {enrolledCourses.map((course) => {
          const matCount = getMaterialCount(course.id);
          return (
            <div
              key={course.id}
              className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-foreground text-lg leading-tight">{course.name}</h3>
                <Badge variant="outline" className="text-xs ml-2 shrink-0">
                  {course.level}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-4 flex-1">{course.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between bg-sky-50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Users size={14} className="text-sky-500" />
                    Group Class
                  </span>
                  <span className="font-bold text-sky-700">₹{course.groupPricePerHour}/hr</span>
                </div>
                <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <User size={14} className="text-purple-500" />
                    One-on-One
                  </span>
                  <span className="font-bold text-purple-700">₹{course.oneOnOnePricePerHour}/hr</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span>{matCount} material{matCount !== 1 ? 's' : ''} available</span>
                <span>{course.duration}</span>
              </div>

              <Button
                variant="outline"
                className="w-full border-[#25D366] text-[#25D366] hover:bg-green-50 font-semibold"
                onClick={() => window.open(`https://wa.me/919424135055?text=${encodeURIComponent(`Hi! I have a question about the ${course.name} course.`)}`, '_blank')}
              >
                <MessageCircle size={15} className="mr-2" />
                Ask on WhatsApp
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
