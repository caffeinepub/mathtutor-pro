import React from 'react';
import { useGetMaterialsForStudent } from '../../hooks/useMaterials';
import { getAuthState } from '../../lib/auth';
import { getStore } from '../../lib/store';
import { Material } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Link, Download, BookOpen, AlertCircle } from 'lucide-react';

function getStudentPaymentId(): bigint | null {
  const auth = getAuthState();
  if (!auth) return null;
  const store = getStore();
  const student = store.students.find(s => s.userId === auth.userId);
  if (!student?.accessCode) return null;
  const match = student.accessCode.match(/RJMATH-(\d+)/);
  if (!match) return null;
  return BigInt(parseInt(match[1], 10));
}

function downloadFileData(fileData: Uint8Array, title: string) {
  const blob = new Blob([new Uint8Array(fileData.buffer as ArrayBuffer)]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = title;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function MyMaterials() {
  const studentId = getStudentPaymentId();
  const { data: materials = [], isLoading } = useGetMaterialsForStudent(studentId);

  const handleDownload = (material: Material) => {
    if (material.fileLink) {
      window.open(material.fileLink, '_blank', 'noopener,noreferrer');
    } else if (material.fileData) {
      downloadFileData(material.fileData, material.title);
    }
  };

  if (!studentId) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No access code linked to your account. Please contact your tutor.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Materials</h1>
        <p className="text-muted-foreground mt-1">Study materials assigned to you by your tutor</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : materials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Materials Yet</h3>
            <p className="text-muted-foreground">
              Your tutor hasn't uploaded any materials for you yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {materials.map(material => (
            <Card key={material.id.toString()} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{material.title}</CardTitle>
                  {material.fileLink ? (
                    <Badge variant="outline" className="gap-1 shrink-0">
                      <Link className="h-3 w-3" />
                      Link
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1 shrink-0">
                      <FileText className="h-3 w-3" />
                      File
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{material.relatedCourse}</span>
                </div>
                {material.description && (
                  <p className="text-sm text-muted-foreground">{material.description}</p>
                )}
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => handleDownload(material)}
                >
                  {material.fileLink ? (
                    <>
                      <Link className="h-5 w-5" />
                      View Material
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download Material
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
