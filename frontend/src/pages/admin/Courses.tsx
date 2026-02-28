import { useState } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  getStore,
  saveStore,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  type Course,
} from '../../lib/store';

const WHATSAPP_NUMBER = '919424135055';

type CourseForm = {
  name: string;
  description: string;
  price: string;
  groupPricePerHour: string;
  oneOnOnePricePerHour: string;
  duration: string;
  level: string;
  isActive: boolean;
};

const emptyForm: CourseForm = {
  name: '',
  description: '',
  price: '',
  groupPricePerHour: '',
  oneOnOnePricePerHour: '',
  duration: '',
  level: 'Intermediate',
  isActive: true,
};

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>(() => getCourses());
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refresh = () => setCourses(getCourses());

  const openCreate = () => {
    setEditingCourse(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({
      name: course.name || course.title || '',
      description: course.description,
      price: String(course.price),
      groupPricePerHour: String(course.groupPricePerHour),
      oneOnOnePricePerHour: String(course.oneOnOnePricePerHour),
      duration: course.duration,
      level: course.level,
      isActive: course.active,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    const courseData = {
      name: form.name,
      title: form.name,
      description: form.description,
      price: Number(form.price) || 0,
      pricePerHour: Number(form.oneOnOnePricePerHour) || 0,
      groupPricePerHour: Number(form.groupPricePerHour) || 0,
      oneOnOnePricePerHour: Number(form.oneOnOnePricePerHour) || 0,
      duration: form.duration,
      level: form.level,
      active: form.isActive,
      isActive: form.isActive,
    };

    if (editingCourse) {
      updateCourse(editingCourse.id, courseData);
    } else {
      createCourse(courseData);
    }
    setShowModal(false);
    refresh();
  };

  const handleToggleActive = (course: Course) => {
    updateCourse(course.id, { active: !course.active, isActive: !course.active });
    refresh();
  };

  const handleDelete = (courseId: string) => {
    deleteCourse(courseId);
    setDeleteConfirm(null);
    refresh();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your course offerings</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground truncate">{course.name || course.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{course.level} · {course.duration}</p>
              </div>
              <Badge
                variant={course.active ? 'default' : 'outline'}
                className={course.active ? 'bg-green-100 text-green-700 border-green-300' : 'text-slate-400'}
              >
                {course.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description}</p>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-sky-50 rounded-lg p-2 text-center">
                <span className="text-xs text-sky-600 block">Group</span>
                <span className="text-sm font-medium text-sky-700">₹{course.groupPricePerHour}/hr</span>
              </div>
              <div className="flex-1 bg-purple-50 rounded-lg p-2 text-center">
                <span className="text-xs text-purple-600 block">1-on-1</span>
                <span className="text-sm font-medium text-purple-700">₹{course.oneOnOnePricePerHour}/hr</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEdit(course)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(course)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors"
              >
                {course.active ? <ToggleRight className="w-3.5 h-3.5 text-green-600" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                {course.active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => setDeleteConfirm(course.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I'm interested in the ${course.name || course.title} course.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#25D366] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">
                {editingCourse ? 'Edit Course' : 'Add Course'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {(['name', 'description', 'duration'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-foreground mb-1 capitalize">{field}</label>
                  <input
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Level</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Base Price</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Group/hr</label>
                  <input
                    type="number"
                    value={form.groupPricePerHour}
                    onChange={(e) => setForm((f) => ({ ...f, groupPricePerHour: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">1-on-1/hr</label>
                  <input
                    type="number"
                    value={form.oneOnOnePricePerHour}
                    onChange={(e) => setForm((f) => ({ ...f, oneOnOnePricePerHour: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-foreground">Active</label>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {editingCourse ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Course?</h3>
            <p className="text-sm text-muted-foreground mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
