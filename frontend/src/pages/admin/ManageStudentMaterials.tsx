import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Link2, User, BookOpen, RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getStore, saveStore, getApprovedStudents, Student, Material } from '../../lib/store';

const FILE_TYPES = ['pdf', 'video', 'image', 'doc', 'other'] as const;

export default function ManageStudentMaterials() {
  const [approvedStudents, setApprovedStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    fileType: 'pdf' as Material['fileType'],
    fileUrl: '',
    relatedCourse: '',
  });

  const loadData = () => {
    const students = getApprovedStudents();
    setApprovedStudents(students);
    if (selectedStudentId) {
      loadMaterialsForStudent(selectedStudentId);
    }
  };

  const loadMaterialsForStudent = (studentId: string) => {
    const store = getStore();
    const studentMaterials = store.materials.filter((m) => m.studentId === studentId);
    studentMaterials.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    setMaterials(studentMaterials);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      loadMaterialsForStudent(selectedStudentId);
    } else {
      setMaterials([]);
    }
  }, [selectedStudentId]);

  const handleStudentChange = (value: string) => {
    setSelectedStudentId(value);
    setShowForm(false);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleFormChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedStudentId) {
      setErrorMsg('Please select a student first.');
      return;
    }
    if (!form.title.trim()) {
      setErrorMsg('Title is required.');
      return;
    }
    if (!form.fileUrl.trim()) {
      setErrorMsg('File URL/link is required.');
      return;
    }
    if (!form.relatedCourse.trim()) {
      setErrorMsg('Related course is required.');
      return;
    }

    setSaving(true);
    try {
      const store = getStore();
      const selectedStudent = approvedStudents.find((s) => s.id === selectedStudentId);

      const newMaterial: Material = {
        id: `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        studentId: selectedStudentId,
        studentEmail: selectedStudent?.email,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        fileType: form.fileType,
        fileUrl: form.fileUrl.trim(),
        relatedCourse: form.relatedCourse.trim(),
        uploadedAt: new Date().toISOString(),
      };

      store.materials.push(newMaterial);
      saveStore(store);

      setForm({ title: '', description: '', fileType: 'pdf', fileUrl: '', relatedCourse: '' });
      setShowForm(false);
      setSuccessMsg(`Material added successfully for ${selectedStudent?.name}!`);
      loadMaterialsForStudent(selectedStudentId);
    } catch (err) {
      setErrorMsg('Failed to save material. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (materialId: string) => {
    const store = getStore();
    store.materials = store.materials.filter((m) => m.id !== materialId);
    saveStore(store);
    loadMaterialsForStudent(selectedStudentId);
  };

  const selectedStudent = approvedStudents.find((s) => s.id === selectedStudentId);

  const fileTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'image': return '🖼️';
      case 'doc': return '📝';
      default: return '📎';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Materials</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Assign study materials to individual students
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Step 1: Select Student */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Step 1: Select Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedStudents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No approved students yet.</p>
              <p className="text-xs mt-1">Approve students from the Students section first.</p>
            </div>
          ) : (
            <Select value={selectedStudentId} onValueChange={handleStudentChange}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent>
                {approvedStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{student.name}</span>
                      <span className="text-xs text-muted-foreground">{student.email} · {student.course}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Add Material */}
      {selectedStudentId && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                Step 2: Add Material for {selectedStudent?.name}
              </CardTitle>
              {!showForm && (
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Material
                </Button>
              )}
            </div>
          </CardHeader>
          {showForm && (
            <CardContent>
              {successMsg && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
                  {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3">
                  {errorMsg}
                </div>
              )}
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mat-title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="mat-title"
                      type="text"
                      placeholder="e.g. Chapter 3 Notes"
                      value={form.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mat-type">File Type</Label>
                    <Select
                      value={form.fileType}
                      onValueChange={(v) => handleFormChange('fileType', v)}
                    >
                      <SelectTrigger id="mat-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FILE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {fileTypeIcon(t)} {t.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="mat-url">
                      <Link2 className="w-3.5 h-3.5 inline mr-1" />
                      File URL / Link <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="mat-url"
                      type="url"
                      placeholder="https://drive.google.com/... or any file link"
                      value={form.fileUrl}
                      onChange={(e) => handleFormChange('fileUrl', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mat-course">
                      <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                      Related Course <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="mat-course"
                      type="text"
                      placeholder="e.g. Mathematics Foundation"
                      value={form.relatedCourse}
                      onChange={(e) => handleFormChange('relatedCourse', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mat-desc">Description (optional)</Label>
                    <Input
                      id="mat-desc"
                      type="text"
                      placeholder="Brief description..."
                      value={form.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Material'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setErrorMsg('');
                      setForm({ title: '', description: '', fileType: 'pdf', fileUrl: '', relatedCourse: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      )}

      {/* Success message outside form */}
      {!showForm && successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
          {successMsg}
        </div>
      )}

      {/* Materials List */}
      {selectedStudentId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Materials for {selectedStudent?.name}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({materials.length} total)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No materials assigned yet.</p>
                <p className="text-xs mt-1">Click "Add Material" above to add study materials.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{fileTypeIcon(material.fileType)}</span>
                        <div>
                          <p className="font-medium text-sm">{material.title}</p>
                          {material.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{material.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="bg-muted px-2 py-0.5 rounded">{material.relatedCourse}</span>
                        <span>{new Date(material.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      {material.fileUrl && (
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                        >
                          <Link2 className="w-3 h-3" />
                          View / Download
                        </a>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(material.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
