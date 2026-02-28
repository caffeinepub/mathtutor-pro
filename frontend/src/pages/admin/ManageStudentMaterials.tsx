import { useState } from 'react';
import { getStore, saveStore, getApprovedStudents } from '../../lib/store';
import type { Student, Material } from '../../lib/store';
import { Plus, Trash2, FileText, Video, Image, File, ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';

const FILE_TYPE_ICONS: Record<Material['fileType'], React.ReactNode> = {
  pdf: <FileText size={14} className="text-red-500" />,
  video: <Video size={14} className="text-blue-500" />,
  image: <Image size={14} className="text-green-500" />,
  doc: <File size={14} className="text-yellow-500" />,
  other: <File size={14} className="text-gray-500" />,
};

export default function AdminManageStudentMaterials() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    fileType: 'pdf' as Material['fileType'],
    fileUrl: '',
    course: '',
  });

  const approvedStudents = getApprovedStudents();

  const getStudentMaterials = (studentId: string): Material[] => {
    return getStore().materials.filter((m) => m.studentId === studentId);
  };

  const handleAddMaterial = () => {
    if (!selectedStudent || !form.title || !form.course) return;

    const store = getStore();
    const newMaterial: Material = {
      id: `material-${Date.now()}`,
      studentId: selectedStudent.id,
      title: form.title,
      description: form.description || undefined,
      fileType: form.fileType,
      fileUrl: form.fileUrl || undefined,
      course: form.course,
      uploadedAt: new Date().toISOString(),
    };
    store.materials.push(newMaterial);
    saveStore(store);

    setShowAddMaterial(false);
    setForm({ title: '', description: '', fileType: 'pdf', fileUrl: '', course: '' });
  };

  const handleDeleteMaterial = (materialId: string) => {
    const store = getStore();
    store.materials = store.materials.filter((m) => m.id !== materialId);
    saveStore(store);
    // Force re-render by toggling student
    if (selectedStudent) setSelectedStudent({ ...selectedStudent });
  };

  const materials = selectedStudent ? getStudentMaterials(selectedStudent.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Manage Student Materials</h2>
        <p className="text-muted-foreground">Assign and manage study materials for individual students</p>
      </div>

      {/* Student Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          {approvedStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved students yet.</p>
          ) : (
            <div className="relative">
              <select
                value={selectedStudent?.id ?? ''}
                onChange={(e) => {
                  const s = approvedStudents.find((st) => st.id === e.target.value) ?? null;
                  setSelectedStudent(s);
                }}
                className="w-full px-3 py-2 pr-8 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none"
              >
                <option value="">Choose a student...</option>
                {approvedStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.email}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials for selected student */}
      {selectedStudent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              Materials for {selectedStudent.name}
            </h3>
            <Button size="sm" onClick={() => setShowAddMaterial(true)}>
              <Plus size={14} className="mr-1" />
              Add Material
            </Button>
          </div>

          {materials.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No materials assigned yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <Card key={material.id}>
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {FILE_TYPE_ICONS[material.fileType]}
                          <p className="font-medium text-foreground text-sm">{material.title}</p>
                        </div>
                        {material.description && (
                          <p className="text-xs text-muted-foreground mb-1">{material.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="bg-muted px-2 py-0.5 rounded">{material.course}</span>
                          <span className="uppercase">{material.fileType}</span>
                        </div>
                        {material.fileUrl && (
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                          >
                            View Material →
                          </a>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteMaterial(material.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Material Dialog */}
      <Dialog open={showAddMaterial} onOpenChange={setShowAddMaterial}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Material for {selectedStudent?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Calculus Notes Chapter 1"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the material"
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">File Type</label>
              <select
                value={form.fileType}
                onChange={(e) => setForm({ ...form, fileType: e.target.value as Material['fileType'] })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="pdf">PDF</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="doc">Document</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">File URL / Link</label>
              <input
                type="url"
                value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Related Course</label>
              <input
                type="text"
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                placeholder="e.g. JEE Mathematics"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMaterial(false)}>Cancel</Button>
            <Button
              onClick={handleAddMaterial}
              disabled={!form.title || !form.course}
            >
              Add Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
