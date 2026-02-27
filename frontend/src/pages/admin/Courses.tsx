import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  Course,
} from '../../lib/store';
import { Plus, Edit, Trash2, BookOpen, Users, User } from 'lucide-react';
import { toast } from 'sonner';

interface CourseFormData {
  name: string;
  description: string;
  groupPricePerHour: string;
  oneOnOnePricePerHour: string;
  duration: string;
  level: string;
  isActive: boolean;
}

const emptyForm: CourseFormData = {
  name: '',
  description: '',
  groupPricePerHour: '',
  oneOnOnePricePerHour: '',
  duration: 'Flexible',
  level: '',
  isActive: true,
};

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>(() => getCourses());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseFormData>(emptyForm);

  const refresh = () => setCourses(getCourses());

  const openCreate = () => {
    setEditingCourse(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({
      name: course.name,
      description: course.description,
      groupPricePerHour: String(course.groupPricePerHour),
      oneOnOnePricePerHour: String(course.oneOnOnePricePerHour),
      duration: course.duration,
      level: course.level,
      isActive: course.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      groupPricePerHour: parseInt(form.groupPricePerHour) || 0,
      oneOnOnePricePerHour: parseInt(form.oneOnOnePricePerHour) || 0,
      duration: form.duration.trim(),
      level: form.level.trim(),
      isActive: form.isActive,
    };

    if (editingCourse) {
      updateCourse(editingCourse.id, data);
      toast.success('Course updated successfully!');
    } else {
      createCourse(data);
      toast.success('Course created successfully!');
    }
    setIsFormOpen(false);
    refresh();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCourse(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
    toast.success('Course deleted.');
  };

  const handleToggleActive = (course: Course) => {
    updateCourse(course.id, { isActive: !course.isActive });
    refresh();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Courses</h1>
          <p className="text-slate-500 mt-1">Manage your course offerings and pricing.</p>
        </div>
        <Button onClick={openCreate} className="bg-sky-600 hover:bg-sky-700 text-white h-11 px-5">
          <Plus size={18} className="mr-2" />
          Add Course
        </Button>
      </div>

      <div className="grid gap-4">
        {courses.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg">No courses yet. Add your first course!</p>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-slate-800 text-lg">{course.name}</h3>
                  <Badge variant={course.isActive ? 'default' : 'outline'} className={course.isActive ? 'bg-green-100 text-green-700 border-green-300' : 'text-slate-400'}>
                    {course.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-slate-500 text-sm mb-3">{course.description}</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 bg-sky-50 rounded-lg px-3 py-1.5">
                    <Users size={14} className="text-sky-600" />
                    <span className="text-sm font-medium text-sky-700">Group: ₹{course.groupPricePerHour}/hr</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-purple-50 rounded-lg px-3 py-1.5">
                    <User size={14} className="text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">1-on-1: ₹{course.oneOnOnePricePerHour}/hr</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-3 py-1.5">
                    <span className="text-sm text-slate-600">{course.level}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-sm text-slate-500">Active</span>
                  <Switch
                    checked={course.isActive}
                    onCheckedChange={() => handleToggleActive(course)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(course)}
                  className="border-slate-200"
                >
                  <Edit size={15} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTarget(course)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Update course details and pricing.' : 'Create a new course with hourly pricing.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Course Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. JEE Mains"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief course description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Group Price per Hour (₹)</Label>
                <Input
                  type="number"
                  value={form.groupPricePerHour}
                  onChange={(e) => setForm({ ...form, groupPricePerHour: e.target.value })}
                  placeholder="e.g. 250"
                  min="0"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>One-on-One Price per Hour (₹)</Label>
                <Input
                  type="number"
                  value={form.oneOnOnePricePerHour}
                  onChange={(e) => setForm({ ...form, oneOnOnePricePerHour: e.target.value })}
                  placeholder="e.g. 350"
                  min="0"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Level / Class</Label>
                <Input
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  placeholder="e.g. Class 11-12"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Duration</Label>
                <Input
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g. Flexible"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label>Active (visible to students)</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white">
                {editingCourse ? 'Save Changes' : 'Create Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
