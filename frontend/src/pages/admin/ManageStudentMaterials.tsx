import React, { useState } from 'react';
import { useAllStudents } from '../../hooks/useQueries';
import { useGetMaterialsForStudent, useAddMaterial, useDeleteMaterial } from '../../hooks/useMaterials';
import { Student } from '../../backend';
import { Principal } from '@dfinity/principal';
import {
  BookOpen, Plus, Trash2, Loader2, User, Link as LinkIcon,
  FileText, ExternalLink, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

function getPaymentStatusLabel(student: Student): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  const ps = student.paymentStatus;
  if (ps.__kind__ === 'upi') {
    if (ps.upi.__kind__ === 'approved') return { label: 'Active', variant: 'default' };
    if (ps.upi.__kind__ === 'pending') return { label: 'Pending', variant: 'secondary' };
    if (ps.upi.__kind__ === 'rejected') return { label: 'Rejected', variant: 'destructive' };
  }
  if (ps.__kind__ === 'stripe') {
    if (ps.stripe.__kind__ === 'completed') return { label: 'Active', variant: 'default' };
    if (ps.stripe.__kind__ === 'failed') return { label: 'Failed', variant: 'destructive' };
  }
  return { label: 'Unknown', variant: 'outline' };
}

function formatDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ManageStudentMaterials() {
  const { data: allStudents = [], isLoading: studentsLoading } = useAllStudents();

  const [selectedPrincipal, setSelectedPrincipal] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [relatedCourse, setRelatedCourse] = useState('');

  const selectedPrincipalObj = selectedPrincipal
    ? (() => {
        try { return Principal.fromText(selectedPrincipal); } catch { return null; }
      })()
    : null;

  const { data: materials = [], isLoading: materialsLoading } = useGetMaterialsForStudent(selectedPrincipalObj);
  const addMaterialMutation = useAddMaterial();
  const deleteMaterialMutation = useDeleteMaterial();

  const selectedStudent = allStudents.find(s => s.principal.toString() === selectedPrincipal);

  const filteredStudents = allStudents.filter(s =>
    s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.course.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Auto-fill relatedCourse when student is selected
  const handleSelectStudent = (principalStr: string) => {
    setSelectedPrincipal(principalStr);
    const student = allStudents.find(s => s.principal.toString() === principalStr);
    if (student && !relatedCourse) {
      setRelatedCourse(student.course);
    }
  };

  const handleAddMaterial = async () => {
    if (!selectedPrincipal) { toast.error('Please select a student'); return; }
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!relatedCourse.trim()) { toast.error('Related course is required'); return; }

    let principalObj: Principal;
    try {
      principalObj = Principal.fromText(selectedPrincipal);
    } catch {
      toast.error('Invalid principal ID');
      return;
    }

    try {
      await addMaterialMutation.mutateAsync({
        studentPrincipal: principalObj,
        title: title.trim(),
        description: description.trim() || null,
        fileData: null,
        fileLink: fileLink.trim() || null,
        relatedCourse: relatedCourse.trim(),
      });
      toast.success('Material added successfully!');
      setTitle('');
      setDescription('');
      setFileLink('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add material');
    }
  };

  const handleDeleteMaterial = async (materialId: bigint) => {
    try {
      await deleteMaterialMutation.mutateAsync(materialId);
      toast.success('Material deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete material');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          Manage Student Materials
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select any registered student and add study materials — materials appear only on that student's dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Add Material Form */}
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add New Material
          </h2>

          {/* Student Selector */}
          <div className="space-y-1.5">
            <Label>Select Student *</Label>
            {studentsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedPrincipal} onValueChange={handleSelectStudent}>
                <SelectTrigger>
                  <SelectValue placeholder={allStudents.length === 0 ? 'No students registered yet' : 'Choose a student...'} />
                </SelectTrigger>
                <SelectContent>
                  {allStudents.map(s => {
                    const statusInfo = getPaymentStatusLabel(s);
                    return (
                      <SelectItem key={s.principal.toString()} value={s.principal.toString()}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{s.fullName}</span>
                          <span className="text-muted-foreground text-xs">— {s.course}</span>
                          <Badge variant={statusInfo.variant} className="text-xs ml-1">{statusInfo.label}</Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
            {selectedStudent && (
              <p className="text-xs text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{selectedStudent.fullName}</span> — {selectedStudent.email}
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="mat-title">Title *</Label>
            <Input
              id="mat-title"
              placeholder="e.g. Chapter 5 Notes"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="mat-desc">Description (optional)</Label>
            <Textarea
              id="mat-desc"
              placeholder="Brief description of the material..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* File Link */}
          <div className="space-y-1.5">
            <Label htmlFor="mat-link">File / Resource Link (optional)</Label>
            <Input
              id="mat-link"
              type="url"
              placeholder="https://drive.google.com/..."
              value={fileLink}
              onChange={e => setFileLink(e.target.value)}
            />
          </div>

          {/* Related Course */}
          <div className="space-y-1.5">
            <Label htmlFor="mat-course">Related Course *</Label>
            <Input
              id="mat-course"
              placeholder="e.g. Mathematics"
              value={relatedCourse}
              onChange={e => setRelatedCourse(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleAddMaterial}
            disabled={addMaterialMutation.isPending || !selectedPrincipal}
          >
            {addMaterialMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding Material...</>
            ) : (
              <><Plus className="h-4 w-4 mr-2" />Add Material</>
            )}
          </Button>
        </div>

        {/* Right: Materials for selected student */}
        <div className="bg-card border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {selectedStudent ? `Materials for ${selectedStudent.fullName}` : 'Select a student to view materials'}
          </h2>

          {!selectedPrincipal && (
            <div className="text-center py-10 text-muted-foreground">
              <User className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Select a student from the form to view their materials</p>
            </div>
          )}

          {selectedPrincipal && materialsLoading && (
            <div className="space-y-2">
              {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          )}

          {selectedPrincipal && !materialsLoading && materials.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No materials assigned to this student yet</p>
              <p className="text-xs mt-1">Use the form on the left to add a material</p>
            </div>
          )}

          {selectedPrincipal && !materialsLoading && materials.length > 0 && (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {[...materials].sort((a, b) => Number(b.uploadedAt) - Number(a.uploadedAt)).map(material => (
                <div key={material.id.toString()} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{material.title}</p>
                      {material.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{material.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{material.relatedCourse}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(material.uploadedAt)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive flex-shrink-0"
                      onClick={() => handleDeleteMaterial(material.id)}
                      disabled={deleteMaterialMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {material.fileLink && (
                    <a
                      href={material.fileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline truncate"
                    >
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      {material.fileLink}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All students reference panel */}
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <User className="h-4 w-4" /> All Students ({allStudents.length})
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
        {studentsLoading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : filteredStudents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {studentSearch ? 'No students match your search.' : 'No students registered yet.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredStudents.map(s => {
              const statusInfo = getPaymentStatusLabel(s);
              return (
                <div
                  key={s.principal.toString()}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedPrincipal === s.principal.toString() ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                  onClick={() => handleSelectStudent(s.principal.toString())}
                >
                  <p className="font-medium text-sm truncate">{s.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.course}</p>
                  <Badge variant={statusInfo.variant} className="text-xs mt-1">{statusInfo.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
