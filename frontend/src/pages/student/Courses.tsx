import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCourses, getStudentByUserId, getMaterials, getAuthState } from '../../lib/store';
import { BookOpen, FileText, MessageCircle, Users, User } from 'lucide-react';

export default function StudentCourses() {
  const auth = getAuthState();
  const student = auth.userId ? getStudentByUserId(auth.userId) : null;
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
        <h1 className="text-2xl font-bold text-slate-800 mb-2">My Courses</h1>
        <p className="text-slate-500 mb-8">Courses you are enrolled in will appear here.</p>
        <div className="text-center py-16 bg-sky-50 rounded-2xl border border-sky-100">
          <BookOpen size={56} className="mx-auto text-sky-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">No Courses Yet</h2>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            You haven't been enrolled in any courses yet. Contact us on WhatsApp to get started!
          </p>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white h-12 px-6 text-base font-semibold"
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
      <h1 className="text-2xl font-bold text-slate-800 mb-2">My Courses</h1>
      <p className="text-slate-500 mb-6">Your enrolled courses and study materials.</p>

      <div className="grid md:grid-cols-2 gap-5">
        {enrolledCourses.map((course) => {
          const matCount = getMaterialCount(course.id);
          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-slate-800 text-lg leading-tight">{course.name}</h3>
                <Badge variant="outline" className="text-sky-600 border-sky-200 bg-sky-50 text-xs ml-2 flex-shrink-0">
                  {course.level}
                </Badge>
              </div>
              <p className="text-slate-500 text-sm mb-4 flex-1">{course.description}</p>

              {/* Pricing */}
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

              <div className="flex gap-2">
                <Link to="/student/materials" className="flex-1">
                  <Button variant="outline" className="w-full border-sky-200 text-sky-700 hover:bg-sky-50 font-semibold h-11">
                    <FileText size={16} className="mr-2" />
                    View Materials ({matCount})
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50 h-11 px-3"
                  onClick={() => window.open(`https://wa.me/919424135055?text=${encodeURIComponent(`Hi! I want to book a session for ${course.name}.`)}`, '_blank')}
                  title="Book Session on WhatsApp"
                >
                  <MessageCircle size={16} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
