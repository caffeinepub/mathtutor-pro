import React, { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, FileText, Link as LinkIcon, User, RefreshCw } from 'lucide-react';

interface LocalMaterial {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  title: string;
  description?: string;
  fileLink: string;
  relatedCourse?: string;
  createdAt: string;
}

function getLocalMaterials(): LocalMaterial[] {
  try {
    const raw = localStorage.getItem('rajats_equation_store');
    if (!raw) return [];
    const store = JSON.parse(raw);
    return store.adminMaterials || [];
  } catch {
    return [];
  }
}

function saveLocalMaterial(material: LocalMaterial) {
  try {
    const raw = localStorage.getItem('rajats_equation_store');
    const store = raw ? JSON.parse(raw) : {};
    const materials: LocalMaterial[] = store.adminMaterials || [];
    materials.push(material);
    store.adminMaterials = materials;
    localStorage.setItem('rajats_equation_store', JSON.stringify(store));
  } catch {
    // ignore
  }
}

function deleteLocalMaterial(id: string) {
  try {
    const raw = localStorage.getItem('rajats_equation_store');
    if (!raw) return;
    const store = JSON.parse(raw);
    store.adminMaterials = (store.adminMaterials || []).filter((m: LocalMaterial) => m.id !== id);
    localStorage.setItem('rajats_equation_store', JSON.stringify(store));
  } catch {
    // ignore
  }
}

export default function AdminMaterials() {
  const { actor } = useActor();

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [relatedCourse, setRelatedCourse] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [localMaterials, setLocalMaterials] = useState<LocalMaterial[]>(getLocalMaterials);
  const [filterStudentId, setFilterStudentId] = useState('');

  // Fetch all payments to get approved students
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['allPayments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor,
  });

  const approvedStudents = React.useMemo(() => {
    const fromBackend = payments
      .filter(p => p.status.__kind__ === 'approved')
      .map(p => ({
        paymentId: Number(p.id),
        name: p.fullName,
        email: p.email,
      }));

    try {
      const raw = localStorage.getItem('rajats_equation_store');
      if (raw) {
        const store = JSON.parse(raw);
        const localActive = (store.students || [])
          .filter((s: any) => s.status === 'active')
          .map((s: any) => ({
            paymentId: parseInt(s.id) || 0,
            name: s.name,
            email: s.email,
          }));
        for (const ls of localActive) {
          if (!fromBackend.find(s => s.email === ls.email)) {
            fromBackend.push(ls);
          }
        }
      }
    } catch {
      // ignore
    }

    return fromBackend;
  }, [payments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedStudentId) {
      setErrorMsg('Please select a student.');
      return;
    }
    if (!title.trim() || !fileLink.trim()) {
      setErrorMsg('Please fill in title and file link.');
      return;
    }

    setSaving(true);
    try {
      const student = approvedStudents.find(
        s => String(s.paymentId) === selectedStudentId || s.email === selectedStudentId
      );
      if (!student) {
        setErrorMsg('Student not found.');
        setSaving(false);
        return;
      }

      const newMaterial: LocalMaterial = {
        id: `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentId: String(student.paymentId),
        studentName: student.name,
        studentEmail: student.email,
        title: title.trim(),
        description: description.trim() || undefined,
        fileLink: fileLink.trim(),
        relatedCourse: relatedCourse.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      saveLocalMaterial(newMaterial);
      setLocalMaterials(getLocalMaterials());

      setSuccessMsg(`Material added for ${student.name}!`);
      setTitle('');
      setDescription('');
      setFileLink('');
      setRelatedCourse('');
      setSelectedStudentId('');
    } catch (err: any) {
      setErrorMsg(String(err?.message || 'Failed to save material. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this material?')) return;
    deleteLocalMaterial(id);
    setLocalMaterials(getLocalMaterials());
  };

  const displayedMaterials = filterStudentId
    ? localMaterials.filter(m => String(m.studentId) === filterStudentId || m.studentEmail === filterStudentId)
    : localMaterials;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Materials</h1>
        <p className="text-muted-foreground text-sm mt-1">Add and manage study materials for individual students</p>
      </div>

      {/* Add Material Form */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Add Material for Student
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Select */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Select Student <span className="text-destructive">*</span>
            </label>
            {paymentsLoading ? (
              <div className="text-sm text-muted-foreground">Loading students...</div>
            ) : approvedStudents.length === 0 ? (
              <div className="text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
                No approved students yet. Approve students from the Students section first.
              </div>
            ) : (
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="">-- Select a student --</option>
                {approvedStudents.map(s => (
                  <option key={s.email} value={String(s.paymentId) || s.email}>
                    {s.name} ({s.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Chapter 5 Notes"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                required
              />
            </div>

            {/* Related Course */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Related Course <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={relatedCourse}
                onChange={e => setRelatedCourse(e.target.value)}
                placeholder="e.g. JEE Mathematics"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          {/* File Link */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              File / Document Link <span className="text-destructive">*</span>
            </label>
            <input
              type="url"
              value={fileLink}
              onChange={e => setFileLink(e.target.value)}
              placeholder="https://drive.google.com/... or any document URL"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of the material..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>

          {errorMsg && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-3 py-2.5 text-sm">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 rounded-lg px-3 py-2.5 text-sm">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Add Material'}
          </button>
        </form>
      </div>

      {/* Materials List */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            All Materials ({localMaterials.length})
          </h2>
          <select
            value={filterStudentId}
            onChange={e => setFilterStudentId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none"
          >
            <option value="">All Students</option>
            {approvedStudents.map(s => (
              <option key={s.email} value={String(s.paymentId) || s.email}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {displayedMaterials.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No materials added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...displayedMaterials].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(material => (
              <div key={material.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-background">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-medium text-sm text-foreground">{material.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <User className="w-3 h-3" />
                    <span>{material.studentName} ({material.studentEmail})</span>
                  </div>
                  {material.relatedCourse && (
                    <p className="text-xs text-muted-foreground mb-1">Course: {material.relatedCourse}</p>
                  )}
                  {material.description && (
                    <p className="text-xs text-muted-foreground mb-1">{material.description}</p>
                  )}
                  <a
                    href={material.fileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" /> View Material
                  </a>
                </div>
                <button
                  onClick={() => handleDelete(material.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  title="Delete material"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
