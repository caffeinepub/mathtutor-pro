import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { useAddMaterial, useGetMaterialsForStudent, useDeleteMaterial } from '../../hooks/useMaterials';
import { UpiPayment } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Plus, Upload, Link, FileText } from 'lucide-react';
import { toast } from 'sonner';

function useApprovedStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<UpiPayment[]>({
    queryKey: ['approvedStudents'],
    queryFn: async () => {
      if (!actor) return [];
      const payments = await actor.getAllPayments();
      return payments.filter(p => p.status.__kind__ === 'approved');
    },
    enabled: !!actor && !isFetching,
  });
}

type MaterialMode = 'file' | 'link';

export default function ManageStudentMaterials() {
  const { data: students = [], isLoading: studentsLoading } = useApprovedStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<bigint | null>(null);
  const [mode, setMode] = useState<MaterialMode>('link');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [relatedCourse, setRelatedCourse] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: materials = [], isLoading: materialsLoading } = useGetMaterialsForStudent(selectedStudentId);
  const addMaterial = useAddMaterial();
  const deleteMaterial = useDeleteMaterial();

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) { toast.error('Please select a student'); return; }
    if (!title.trim()) { toast.error('Please enter a title'); return; }
    if (!relatedCourse.trim()) { toast.error('Please enter a related course'); return; }
    if (mode === 'link' && !fileLink.trim()) { toast.error('Please enter a file link'); return; }
    if (mode === 'file' && !selectedFile) { toast.error('Please select a file to upload'); return; }

    try {
      let fileData: Uint8Array | null = null;
      if (mode === 'file' && selectedFile) {
        setUploadProgress(0);
        const buffer = await selectedFile.arrayBuffer();
        fileData = new Uint8Array(buffer);
        setUploadProgress(100);
      }

      await addMaterial.mutateAsync({
        studentId: selectedStudentId,
        title: title.trim(),
        description: description.trim() || null,
        fileData: mode === 'file' ? fileData : null,
        fileLink: mode === 'link' ? fileLink.trim() : null,
        relatedCourse: relatedCourse.trim(),
      });

      toast.success('Material added successfully!');
      setTitle('');
      setDescription('');
      setFileLink('');
      setRelatedCourse('');
      setSelectedFile(null);
      setUploadProgress(0);
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      toast.error(err.message || 'Failed to add material');
    }
  };

  const handleDelete = async (materialId: bigint) => {
    if (!selectedStudentId) return;
    try {
      await deleteMaterial.mutateAsync({ materialId, studentId: selectedStudentId });
      toast.success('Material deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete material');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Student Materials</h1>
        <p className="text-muted-foreground mt-1">Upload and assign study materials to individual students</p>
      </div>

      {/* Student Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <p className="text-muted-foreground">No approved students found.</p>
          ) : (
            <Select
              value={selectedStudentId?.toString() ?? ''}
              onValueChange={(val) => setSelectedStudentId(BigInt(val))}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id.toString()} value={s.id.toString()}>
                    {s.fullName} — {s.email} ({s.accessCode ?? `ID: ${s.id}`})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedStudentId && (
        <>
          {/* Add Material Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Material for {selectedStudent?.fullName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mode Toggle */}
              <div className="flex gap-3 mb-6">
                <Button
                  type="button"
                  variant={mode === 'link' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setMode('link')}
                  className="flex-1"
                >
                  <Link className="h-4 w-4 mr-2" />
                  URL Link
                </Button>
                <Button
                  type="button"
                  variant={mode === 'file' ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setMode('file')}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  File Upload
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="e.g. Chapter 5 Notes"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relatedCourse">Related Course *</Label>
                    <Input
                      id="relatedCourse"
                      type="text"
                      placeholder="e.g. Class 10 Mathematics"
                      value={relatedCourse}
                      onChange={e => setRelatedCourse(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the material..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={2}
                    />
                  </div>

                  {mode === 'link' ? (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="fileLink" className="flex items-center gap-1">
                        <Link className="h-4 w-4" /> File Link *
                      </Label>
                      <Input
                        id="fileLink"
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={fileLink}
                        onChange={e => setFileLink(e.target.value)}
                        required={mode === 'link'}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="fileInput" className="flex items-center gap-1">
                        <Upload className="h-4 w-4" /> Upload File *
                      </Label>
                      <Input
                        id="fileInput"
                        type="file"
                        onChange={handleFileChange}
                        required={mode === 'file'}
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto"
                  disabled={addMaterial.isPending}
                >
                  {addMaterial.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Adding Material...</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-2" />Add Material</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Materials List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Materials for {selectedStudent?.fullName}
                <Badge variant="secondary" className="ml-2">{materials.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {materialsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading materials...
                </div>
              ) : materials.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center">No materials added yet for this student.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materials.map(material => (
                        <TableRow key={material.id.toString()}>
                          <TableCell className="font-medium">{material.title}</TableCell>
                          <TableCell>{material.relatedCourse}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {material.description ?? '—'}
                          </TableCell>
                          <TableCell>
                            {material.fileLink ? (
                              <Badge variant="outline" className="gap-1">
                                <Link className="h-3 w-3" />Link
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <FileText className="h-3 w-3" />File
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(material.id)}
                              disabled={deleteMaterial.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
