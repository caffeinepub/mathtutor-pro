import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, BookOpen, IndianRupee } from 'lucide-react';
import { getStore } from '@/lib/store';
import WhatsAppButton from '@/components/WhatsAppButton';

interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  level: string;
  duration: string;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  level: 'Intermediate',
  duration: '',
  isActive: true,
};

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>(() => getStore().courses || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refreshCourses = () => {
    setCourses(getStore().courses || []);
  };

  const openCreate = () => {
    setEditingCourse(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({
      name: course.name,
      description: course.description,
      price: String(course.price),
      level: course.level || 'Intermediate',
      duration: course.duration || '',
      isActive: course.isActive !== false,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Course name is required';
    if (!form.price) errors.price = 'Price is required';
    else if (isNaN(Number(form.price)) || Number(form.price) < 0)
      errors.price = 'Enter a valid price';
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setIsSubmitting(true);
    try {
      const store = getStore();
      if (editingCourse) {
        store.courses = store.courses.map((c: Course) =>
          c.id === editingCourse.id
            ? {
                ...c,
                name: form.name.trim(),
                description: form.description.trim(),
                price: Number(form.price),
                level: form.level,
                duration: form.duration.trim(),
                isActive: form.isActive,
              }
            : c
        );
        toast.success('Course updated successfully');
      } else {
        const newCourse: Course = {
          id: `course_${Date.now()}`,
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          level: form.level,
          duration: form.duration.trim(),
          isActive: form.isActive,
          createdAt: new Date().toISOString(),
        };
        store.courses = [...(store.courses || []), newCourse];
        toast.success('Course created successfully');
      }
      localStorage.setItem('mathtutor_store', JSON.stringify(store));
      refreshCourses();
      setModalOpen(false);
    } catch (err) {
      toast.error('Failed to save course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (courseId: string) => {
    const store = getStore();
    store.courses = store.courses.filter((c: Course) => c.id !== courseId);
    localStorage.setItem('mathtutor_store', JSON.stringify(store));
    refreshCourses();
    setDeleteConfirm(null);
    toast.success('Course deleted');
  };

  const toggleActive = (course: Course) => {
    const store = getStore();
    store.courses = store.courses.map((c: Course) =>
      c.id === course.id ? { ...c, isActive: !c.isActive } : c
    );
    localStorage.setItem('mathtutor_store', JSON.stringify(store));
    refreshCourses();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {courses.length} course{courses.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Courses Yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Create your first course to get started.</p>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Create Course
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{course.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                        <Badge
                          variant={course.isActive !== false ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {course.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch
                      checked={course.isActive !== false}
                      onCheckedChange={() => toggleActive(course)}
                      className="scale-75"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                )}
                <div className="flex items-center gap-1 text-primary font-bold">
                  <IndianRupee className="w-4 h-4" />
                  <span>{course.price?.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-muted-foreground font-normal">/month</span>
                </div>
                {course.duration && (
                  <p className="text-xs text-muted-foreground">Duration: {course.duration}</p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(course)}
                    className="flex-1"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirm(course.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* WhatsApp CTA */}
                <WhatsAppButton
                  label="Demo Inquiry"
                  message={`Hi, I have an inquiry about the ${course.name} course demo.`}
                  className="w-full justify-center text-sm py-1.5"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="name">Course Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. JEE Mathematics"
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief course description"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="price">Price (₹/month) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="e.g. 5000"
                  className={formErrors.price ? 'border-destructive' : ''}
                />
                {formErrors.price && <p className="text-xs text-destructive">{formErrors.price}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="level">Level</Label>
                <select
                  id="level"
                  value={form.level}
                  onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={form.duration}
                onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 6 months"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
              />
              <Label htmlFor="isActive">Active (visible to students)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : editingCourse ? (
                'Update Course'
              ) : (
                'Create Course'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete this course? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
