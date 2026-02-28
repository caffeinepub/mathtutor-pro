import React from 'react';
import { FileText, Link as LinkIcon, BookOpen, AlertCircle } from 'lucide-react';
import { getAuthState } from '../../lib/auth';

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

function getStudentMaterials(studentEmail: string, studentId: string): LocalMaterial[] {
  try {
    const raw = localStorage.getItem('rajats_equation_store');
    if (!raw) return [];
    const store = JSON.parse(raw);
    const materials: LocalMaterial[] = store.adminMaterials || [];
    return materials.filter(
      m =>
        m.studentEmail?.toLowerCase() === studentEmail?.toLowerCase() ||
        m.studentId === studentId
    );
  } catch {
    return [];
  }
}

export default function MyMaterials() {
  const auth = getAuthState();

  if (!auth) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Please log in to view your materials.</p>
      </div>
    );
  }

  const materials = getStudentMaterials(auth.email || '', auth.userId || '');

  const sorted = [...materials].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Materials</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {materials.length} material{materials.length !== 1 ? 's' : ''} assigned to you
        </p>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No materials yet</p>
          <p className="text-sm mt-1">Study materials assigned by your tutor will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(material => (
            <div key={material.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">{material.title}</h3>
                  </div>

                  {material.relatedCourse && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <BookOpen className="w-3 h-3" /> {material.relatedCourse}
                    </p>
                  )}

                  {material.description && (
                    <p className="text-sm text-muted-foreground mb-2">{material.description}</p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Added {new Date(material.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>

                <a
                  href={material.fileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <LinkIcon className="w-3.5 h-3.5" /> View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
