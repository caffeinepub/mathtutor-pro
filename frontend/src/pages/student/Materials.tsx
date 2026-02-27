import React, { useState } from 'react';
import { getStore, type Material, type Course } from '../../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Link as LinkIcon, Filter, BookOpen } from 'lucide-react';

export default function StudentMaterials() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const store = getStore();

  const student = store.students.find((s) => s.userId === currentUser?.id);
  const enrolledCourseIds: string[] = student?.enrolledCourses || [];

  const enrolledCourses = store.courses.filter((c: Course) =>
    enrolledCourseIds.includes(c.id)
  );

  const allMaterials = store.materials.filter((m: Material) =>
    enrolledCourseIds.includes(m.courseId)
  );

  const [courseFilter, setCourseFilter] = useState('all');

  const filteredMaterials: Material[] =
    courseFilter === 'all'
      ? allMaterials
      : allMaterials.filter((m) => m.courseId === courseFilter);

  const fileTypeBadgeVariant = (type: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
    const map: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      PDF: 'default',
      Video: 'secondary',
      Notes: 'outline',
      Assignment: 'destructive',
    };
    return map[type] || 'outline';
  };

  if (enrolledCourseIds.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Materials</h1>
          <p className="text-muted-foreground text-sm mt-1">Access your course materials</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Materials Available</h3>
          <p className="text-muted-foreground text-sm">
            You need to be enrolled in a course to access study materials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Study Materials</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''} available
        </p>
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
          {enrolledCourses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Materials Yet</h3>
          <p className="text-muted-foreground text-sm">
            Materials will appear here once your instructor uploads them.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredMaterials.map((material: Material) => (
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
              <CardContent className="space-y-2">
                {material.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{material.description}</p>
                )}
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline"
                >
                  <LinkIcon className="w-3 h-3" />
                  Open Material
                </a>
                <p className="text-xs text-muted-foreground">
                  {new Date(material.uploadedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
