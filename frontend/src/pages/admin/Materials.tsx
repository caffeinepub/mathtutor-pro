import React, { useState } from 'react';
import { toast } from 'sonner';
import { getStore, saveStore, type Material } from '../../lib/store';
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
import { Plus, Trash2, FileText, Link as LinkIcon, Filter } from 'lucide-react';

const FILE_TYPES = ['PDF', 'Video', 'Notes', 'Assignment', 'Solution', 'Other'];

export default function AdminMaterials() {
  const [materials, setMaterials] = useState<Material[]>(() => getStore().materials);
  const [courseFilter, setCourseFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    courseId: '',
    title: '',
    description: '',
    fileType: 'PDF',
    fileUrl: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const store = getStore();
  const courses = store.courses;

  const refreshMaterials = () => {
    setMaterials(getStore().materials);
  };

  const filteredMaterials =
    courseFilter === 'all'
      ? materials
      : materials.filter((m) => m.courseId === courseFilter);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.courseId) errors.courseId = 'Please select a course';
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.fileUrl.trim()) errors.fileUrl = 'File URL is required';
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
      const currentStore = getStore();
      const course = currentStore.courses.find((c) => c.id === form.courseId);
      const newMaterial: Material = {
        id: `material_${Date.now()}`,
        courseId: form.courseId,
        courseName: course?.name || '',
        title: form.title.trim(),
        description: form.description.trim(),
        fileType: form.fileType,
        fileUrl: form.fileUrl.trim(),
        uploadedAt: new Date().toISOString(),
      };
      currentStore.materials = [...currentStore.materials, newMaterial];

      // Notify enrolled students
      const enrolledStudents = currentStore.students.filter(
        (s) => s.status === 'approved' && s.enrolledCourses.includes(form.courseId)
      );
      for (const student of enrolledStudents) {
        const user = currentStore.users.find((u) => u.id === student.userId);
        if (user) {
          currentStore.notifications.push({
            id: `notif_${Date.now()}_${student.id}`,
            userId: user.id,
            title: 'New Study Material',
            message: `New material "${form.title}" has been uploaded for ${course?.name}.`,
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
      }

      saveStore(currentStore);
      refreshMaterials();
      setModalOpen(false);
      setForm({ courseId: '', title: '', description: '', fileType: 'PDF', fileUrl: '' });
      toast.success('Material uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    const currentStore = getStore();
    currentStore.materials = currentStore.materials.filter((m) => m.id !== id);
    saveStore(currentStore);
    refreshMaterials();
    setDeleteConfirm(null);
    toast.success('Material deleted');
  };

  const fileTypeBadgeVariant = (type: string) => {
    const map: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      PDF: 'default',
      Video: 'secondary',
      Notes: 'outline',
      Assignment: 'destructive',
    };
    return map[type] || 'outline';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Materials</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {materials.length} material{materials.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        <Button onClick={() => { setForm({ courseId: '', title: '', description: '', fileType: 'PDF', fileUrl: '' }); setFormErrors({}); setModalOpen(true); }} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Upload Material
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Materials Yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Upload study materials for your students.</p>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Upload Material
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm truncate">{material.title}</CardTitle>
                      <p className="text-xs text-muted-foreground truncate">{material.courseName}</p>
                    </div>
                  </div>
                  <Badge variant={fileTypeBadgeVariant(material.fileType)} className="text-xs shrink-0">
                    {material.fileType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {material.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{material.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <LinkIcon className="w-3 h-3" />
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {material.fileUrl}
                  </a>
                </div>
                <p className="text-xs text-muted-foreground">
                  Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirm(material.id)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Study Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Course *</Label>
              <select
                value={form.courseId}
                onChange={(e) => setForm((p) => ({ ...p, courseId: e.target.value }))}
                className={`w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring ${formErrors.courseId ? 'border-destructive' : 'border-input'}`}
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {formErrors.courseId && <p className="text-xs text-destructive">{formErrors.courseId}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="mat-title">Title *</Label>
              <Input
                id="mat-title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Chapter 1 Notes"
                className={formErrors.title ? 'border-destructive' : ''}
              />
              {formErrors.title && <p className="text-xs text-destructive">{formErrors.title}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="mat-desc">Description</Label>
              <Input
                id="mat-desc"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description"
              />
            </div>
            <div className="space-y-1">
              <Label>File Type</Label>
              <select
                value={form.fileType}
                onChange={(e) => setForm((p) => ({ ...p, fileType: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {FILE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="mat-url">File URL *</Label>
              <Input
                id="mat-url"
                value={form.fileUrl}
                onChange={(e) => setForm((p) => ({ ...p, fileUrl: e.target.value }))}
                placeholder="https://drive.google.com/..."
                className={formErrors.fileUrl ? 'border-destructive' : ''}
              />
              {formErrors.fileUrl && <p className="text-xs text-destructive">{formErrors.fileUrl}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete this material? This cannot be undone.
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
