import { getStore } from '../../lib/store';
import { getAuthState } from '../../lib/auth';
import { BookOpen, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function StudentCourses() {
  const auth = getAuthState();
  const store = getStore();

  // Find the student's enrolled course by matching their course name
  const student = auth?.studentId
    ? store.students.find((s) => s.id === auth.studentId)
    : null;

  // Show courses that match the student's enrolled course name
  const enrolledCourses = student
    ? store.courses.filter((c) => c.name === student.course)
    : [];

  // Count materials for a course by name
  const getMaterialCount = (courseName: string) =>
    store.materials.filter((m) => m.course === courseName).length;

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
            onClick={() =>
              window.open(
                'https://wa.me/919424135055?text=Hi! I want to enroll in a course.',
                '_blank'
              )
            }
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
          const matCount = getMaterialCount(course.name);
          return (
            <div
              key={course.id}
              className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all p-5 flex flex-col"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-foreground text-lg leading-tight">{course.name}</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4 flex-1">{course.description}</p>

              <div className="mb-4">
                <div className="flex items-center justify-between bg-primary/5 rounded-lg px-3 py-2">
                  <span className="text-sm text-muted-foreground">Price per Hour</span>
                  <span className="font-bold text-primary">₹{course.pricePerHour}/hr</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span>
                  {matCount} material{matCount !== 1 ? 's' : ''} available
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {course.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full border-[#25D366] text-[#25D366] hover:bg-green-50 font-semibold"
                onClick={() =>
                  window.open(
                    `https://wa.me/919424135055?text=${encodeURIComponent(
                      `Hi! I have a question about the ${course.name} course.`
                    )}`,
                    '_blank'
                  )
                }
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
