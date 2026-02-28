import React, { useState, useEffect } from 'react';
import { FileText, Download, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getStore, getAuthState, Material } from '../../lib/store';

export default function StudentMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = () => {
    setLoading(true);
    try {
      const auth = getAuthState();
      if (!auth || !auth.userId) {
        setLoading(false);
        return;
      }
      const store = getStore();
      const studentMaterials = store.materials
        .filter((m) => m.studentId === auth.userId)
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      setMaterials(studentMaterials);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const fileTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'image': return '🖼️';
      case 'doc': return '📝';
      default: return '📎';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-muted-foreground">Loading materials...</div>
      </div>
    );
  }

  // Group by course
  const byCourse: Record<string, Material[]> = {};
  materials.forEach((m) => {
    const key = m.relatedCourse || m.courseName || 'General';
    if (!byCourse[key]) byCourse[key] = [];
    byCourse[key].push(m);
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Study Materials</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Materials assigned to you by your instructor
        </p>
      </div>

      {materials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">No materials assigned yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your instructor will upload study materials for you soon.
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(byCourse).map(([course, courseMaterials]) => (
          <section key={course}>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {course}
              <span className="text-sm font-normal text-muted-foreground">
                ({courseMaterials.length})
              </span>
            </h2>
            <div className="space-y-3">
              {courseMaterials.map((material) => (
                <Card key={material.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">{fileTypeIcon(material.fileType)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground">{material.title}</h3>
                          {material.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">{material.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Added {new Date(material.uploadedAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                      {material.fileUrl && (
                        <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <Download className="w-3.5 h-3.5 mr-1" />
                            View
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
