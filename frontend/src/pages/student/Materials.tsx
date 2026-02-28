import React from 'react';
import { FileText, ExternalLink, WifiOff } from 'lucide-react';
import { getAuthState } from '../../lib/auth';
import { getStore } from '../../lib/store';
import { useCanisterHealth } from '../../hooks/useCanisterHealth';

export default function StudentMaterials() {
  const auth = getAuthState();
  const { isOnline } = useCanisterHealth();

  let materials: Array<{
    id: string;
    title: string;
    description?: string;
    course: string;
    fileUrl?: string;
    fileType?: string;
    uploadedAt: string;
  }> = [];

  try {
    const store = getStore();
    const studentId = auth?.studentId;
    if (studentId) {
      materials = store.materials
        .filter(m => m.studentId === studentId)
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .map(m => ({
          id: m.id,
          title: m.title,
          description: m.description,
          course: m.course || '',
          fileUrl: m.fileUrl,
          fileType: m.fileType,
          uploadedAt: m.uploadedAt,
        }));
    }
  } catch {
    // ignore
  }

  // Group by course
  const grouped: Record<string, typeof materials> = {};
  for (const mat of materials) {
    const key = mat.course || 'General';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(mat);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Study Materials</h1>
        {!isOnline && (
          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-full">
            <WifiOff className="h-3 w-3" />
            Cached
          </span>
        )}
      </div>

      {materials.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No materials available yet.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([course, mats]) => (
          <div key={course} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {course}
            </h2>
            {mats.map(mat => (
              <div
                key={mat.id}
                className="rounded-xl border border-border bg-card p-4 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{mat.title}</p>
                  {mat.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{mat.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(mat.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                {mat.fileUrl && (
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
