import { useState } from 'react';
import { getStore, addCourse, updateCourse, deleteCourse } from '../../lib/store';
import type { Course } from '../../lib/store';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { SiWhatsapp } from 'react-icons/si';

const WHATSAPP_NUMBER = '919424135055';

interface CourseForm {
  name: string;
  description: string;
  pricePerHour: string;
}

function emptyForm(): CourseForm {
  return { name: '', description: '', pricePerHour: '' };
}

function courseToForm(course: Course): CourseForm {
  return {
    name: course.name,
    description: course.description,
    pricePerHour: String(course.pricePerHour),
  };
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>(() => getStore().courses);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<Course | null>(null);

  const refreshCourses = () => setCourses(getStore().courses);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setForm(courseToForm(course));
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const pricePerHour = Number(form.pricePerHour) || 0;

    if (editingCourse) {
      updateCourse(editingCourse.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        pricePerHour,
      });
    } else {
      addCourse({
        name: form.name.trim(),
        description: form.description.trim(),
        pricePerHour,
        active: true,
      });
    }
    refreshCourses();
    setShowModal(false);
  };

  const handleToggleActive = (course: Course) => {
    updateCourse(course.id, { active: !course.active });
    refreshCourses();
  };

  const handleDelete = (course: Course) => {
    deleteCourse(course.id);
    refreshCourses();
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Courses</h2>
          <p className="text-muted-foreground">Manage your course offerings</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus size={16} className="mr-2" />
          Add Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No courses yet. Add your first course.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className={!course.active ? 'opacity-60' : ''}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen size={16} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground truncate max-w-[160px]">{course.name}</h3>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${course.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {course.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{course.description}</p>

                <div className="mb-3">
                  <span className="text-sm font-medium text-primary">₹{course.pricePerHour}/hr</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenEdit(course)}>
                    <Edit2 size={13} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(course)}
                  >
                    {course.active ? (
                      <><ToggleRight size={13} className="mr-1 text-green-600" />Deactivate</>
                    ) : (
                      <><ToggleLeft size={13} className="mr-1" />Activate</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteConfirm(course)}
                  >
                    <Trash2 size={13} />
                  </Button>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'm interested in the ${course.name} course.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500 hover:bg-green-600 text-white transition-colors"
                  >
                    <SiWhatsapp size={12} />
                    Demo
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Add Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Course Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. JEE Mathematics"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Course description"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Price per Hour (₹)</label>
              <input
                type="number"
                min={0}
                value={form.pricePerHour}
                onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
                placeholder="500"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              {editingCourse ? 'Save Changes' : 'Add Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
