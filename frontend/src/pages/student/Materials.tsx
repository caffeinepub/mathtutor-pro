import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getStore, getAuthState } from '../../lib/store';
import { FileText, Video, Image, File, Download, BookOpen } from 'lucide-react';

export default function StudentMaterials() {
  const auth = getAuthState();
  const store = getStore();
  const student = store.students.find((s) => s.userId === auth.userId);
  const enrolledCourseIds = student?.enrolledCourses || [];

  const enrolledCourses = store.courses.filter((c) => enrolledCourseIds.includes(c.id));
  const allMaterials = store.materials.filter((m) => enrolledCourseIds.includes(m.courseId));

  const [courseFilter, setCourseFilter] = useState<string>('all');

  const filtered = courseFilter === 'all'
    ? allMaterials
    : allMaterials.filter((m) => m.courseId === courseFilter);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText size={20} className="text-red-500" />;
      case 'video': return <Video size={20} className="text-blue-500" />;
      case 'image': return <Image size={20} className="text-green-500" />;
      default: return <File size={20} className="text-slate-500" />;
    }
  };

  const getFileTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      pdf: 'bg-red-50 text-red-700 border-red-200',
      video: 'bg-blue-50 text-blue-700 border-blue-200',
      image: 'bg-green-50 text-green-700 border-green-200',
      doc: 'bg-purple-50 text-purple-700 border-purple-200',
      other: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return (
      <Badge variant="outline" className={`text-xs ${colors[type] || colors.other}`}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  if (enrolledCourseIds.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Study Materials</h1>
        <div className="text-center py-16 bg-sky-50 rounded-2xl border border-sky-100">
          <BookOpen size={56} className="mx-auto text-sky-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">No Materials Yet</h2>
          <p className="text-slate-500">Enroll in a course to access study materials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Study Materials</h1>
      <p className="text-slate-500 mb-5">Download and view your course materials.</p>

      {/* Filter */}
      <div className="mb-5">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full md:w-64 h-11 border-sky-200">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {enrolledCourses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-sky-50 rounded-2xl border border-sky-100">
          <FileText size={48} className="mx-auto text-sky-300 mb-3" />
          <p className="text-slate-500">No materials available for this course yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-sky-300 hover:shadow-sm transition-all"
            >
              <div className="flex-shrink-0">
                {getFileIcon(material.fileType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-slate-800 truncate">{material.title}</h3>
                  {getFileTypeBadge(material.fileType)}
                </div>
                <p className="text-sm text-slate-500 truncate">{material.description}</p>
                <p className="text-xs text-slate-400 mt-0.5">{material.courseName}</p>
              </div>
              <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                <Button variant="outline" size="sm" className="border-sky-200 text-sky-700 hover:bg-sky-50 h-9">
                  <Download size={14} className="mr-1" />
                  Open
                </Button>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
