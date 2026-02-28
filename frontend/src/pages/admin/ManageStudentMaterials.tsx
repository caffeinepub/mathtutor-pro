import { useState } from 'react';
import { useListApprovals, useGetAllPayments } from '../../hooks/useQueries';
import { useGetMaterialsForStudent, useAddMaterial, useDeleteMaterial } from '../../hooks/useMaterials';
import { Principal } from '@dfinity/principal';
import {
  BookOpen,
  Plus,
  Trash2,
  Loader2,
  User,
  Link as LinkIcon,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function ManageStudentMaterials() {
  const { data: approvals = [], isLoading: approvalsLoading } = useListApprovals();
  const { data: allPayments = [], isLoading: paymentsLoading } = useGetAllPayments();

  const [selectedPrincipal, setSelectedPrincipal] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileLink, setFileLink] = useState('');
  const [relatedCourse, setRelatedCourse] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const isLoading = approvalsLoading || paymentsLoading;

  const approvedPayments = allPayments.filter((p) => p.status.__kind__ === 'approved');

  const selectedPrincipalObj = selectedPrincipal
    ? (() => {
        try {
          return Principal.fromText(selectedPrincipal);
        } catch {
          return null;
        }
      })()
    : null;

  const { data: materials = [], isLoading: materialsLoading, refetch: refetchMaterials } =
    useGetMaterialsForStudent(selectedPrincipalObj);

  const addMaterialMutation = useAddMaterial();
  const deleteMaterialMutation = useDeleteMaterial();

  const handleAddMaterial = async () => {
    if (!selectedPrincipal || !title || !relatedCourse) {
      toast.error('Please fill in all required fields');
      return;
    }

    let principalObj: Principal;
    try {
      principalObj = Principal.fromText(selectedPrincipal);
    } catch {
      toast.error('Invalid principal ID');
      return;
    }

    setIsAdding(true);
    try {
      await addMaterialMutation.mutateAsync({
        studentPrincipal: principalObj,
        title,
        description: description || null,
        fileData: null,
        fileLink: fileLink || null,
        relatedCourse,
      });
      toast.success('Material added successfully!');
      setTitle('');
      setDescription('');
      setFileLink('');
      setRelatedCourse('');
      refetchMaterials();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add material');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteMaterial = async (materialId: bigint) => {
    try {
      await deleteMaterialMutation.mutateAsync(materialId);
      toast.success('Material deleted');
      refetchMaterials();
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
          Select a student and add or manage their study materials
        </p>
      </div>

      {/* Student Selector */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Select Student
        </h2>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading students...
          </div>
        ) : (
          <div className="space-y-3">
            {/* Dropdown for portal users (Internet Identity) */}
            {approvals.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground mb-1 block">
                  Portal Users (Internet Identity)
                </Label>
                <Select value={selectedPrincipal} onValueChange={setSelectedPrincipal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {approvals.map((approval) => {
                      const principalStr = approval.principal.toString();
                      return (
                        <SelectItem key={principalStr} value={principalStr}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{principalStr.slice(0, 16)}...</span>
                            <Badge
                              variant="outline"
                              className={
                                approval.status === 'approved'
                                  ? 'text-green-600 border-green-300 text-xs'
                                  : 'text-amber-600 border-amber-300 text-xs'
                              }
                            >
                              {approval.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Manual principal entry */}
            <div>
              <Label className="text-sm text-muted-foreground mb-1 block">
                Or enter Principal ID manually
              </Label>
              <Input
                placeholder="e.g. aaaaa-aa or full principal ID"
                value={selectedPrincipal}
                onChange={(e) => setSelectedPrincipal(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            {/* Approved payment students info */}
            {approvedPayments.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Active Students (Paid) — {approvedPayments.length} student(s)
                </p>
                <div className="space-y-1">
                  {approvedPayments.map((p) => (
                    <div key={String(p.id)} className="flex items-center justify-between text-xs">
                      <span className="text-foreground font-medium">{p.fullName}</span>
                      <span className="text-muted-foreground">{p.email} · {p.courseName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Material Form */}
      {selectedPrincipal && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Add New Material
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Chapter 5 Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Related Course <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. Mathematics Grade 10"
                value={relatedCourse}
                onChange={(e) => setRelatedCourse(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>File / Resource Link</Label>
              <Input
                placeholder="https://drive.google.com/..."
                value={fileLink}
                onChange={(e) => setFileLink(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Brief description of this material..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Button
            onClick={handleAddMaterial}
            disabled={isAdding || !title || !relatedCourse}
            className="w-full md:w-auto"
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </>
            )}
          </Button>
        </div>
      )}

      {/* Materials List */}
      {selectedPrincipal && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Materials for Selected Student</h2>
            <Badge variant="outline" className="ml-auto">{materials.length}</Badge>
          </div>

          {materialsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No materials yet for this student</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {materials.map((material) => (
                <div key={String(material.id)} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">{material.title}</div>
                    <div className="text-sm text-muted-foreground">{material.relatedCourse}</div>
                    {material.description && (
                      <div className="text-sm text-muted-foreground">{material.description}</div>
                    )}
                    {material.fileLink && (
                      <a
                        href={material.fileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Resource
                      </a>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
                    onClick={() => handleDeleteMaterial(material.id)}
                    disabled={deleteMaterialMutation.isPending}
                  >
                    {deleteMaterialMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
