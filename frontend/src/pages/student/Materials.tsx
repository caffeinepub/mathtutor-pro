import { getStore } from '../../lib/store';
import { getAuthState } from '../../lib/auth';
import type { Material } from '../../lib/store';
import { FileText, Video, Image, File, ExternalLink, BookOpen } from 'lucide-react';

const FILE_TYPE_ICONS: Record<Material['fileType'], React.ReactNode> = {
  pdf: <FileText size={16} className="text-red-500" />,
  video: <Video size={16} className="text-blue-500" />,
  image: <Image size={16} className="text-green-500" />,
  doc: <File size={16} className="text-yellow-500" />,
  other: <File size={16} className="text-gray-500" />,
};

export default function StudentMaterials() {
  const auth = getAuthState();
  const store = getStore();

  if (!auth || auth.role !== 'student') {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Please log in to view your materials.
      </div>
    );
  }

  const studentId = auth.studentId || '';
  const myMaterials = store.materials.filter((m) => m.studentId === studentId);

  // Group by course name
  const grouped = myMaterials.reduce<Record<string, Material[]>>((acc, m) => {
    const key = m.course || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Materials</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {myMaterials.length} material{myMaterials.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {myMaterials.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No materials yet</p>
          <p className="text-sm mt-1">Study materials assigned by your tutor will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([courseName, mats]) => (
            <div key={courseName}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-primary" />
                <h2 className="font-semibold text-foreground">{courseName}</h2>
                <span className="text-xs text-muted-foreground">({mats.length})</span>
              </div>
              <div className="space-y-2">
                {mats.map((material) => (
                  <div
                    key={material.id}
                    className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {FILE_TYPE_ICONS[material.fileType]}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{material.title}</p>
                        {material.description && (
                          <p className="text-xs text-muted-foreground truncate">{material.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(material.uploadedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    {material.fileUrl && (
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
                      >
                        <ExternalLink size={12} />
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
