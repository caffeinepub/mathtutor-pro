import React, { useState } from 'react';
import { getStore, saveStore } from '../../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Copy, CheckCircle, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentProfile() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const store = getStore();

  const student = store.students.find((s) => s.userId === currentUser?.id);
  const user = store.users.find((u) => u.id === currentUser?.id);

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const copyAccessCode = () => {
    if (student?.accessCode) {
      navigator.clipboard.writeText(student.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Access code copied!');
    }
  };

  const handleSave = () => {
    if (!editForm.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    const currentStore = getStore();
    currentStore.users = currentStore.users.map((u) =>
      u.id === currentUser?.id
        ? { ...u, name: editForm.name.trim(), phone: editForm.phone.trim() }
        : u
    );
    currentStore.students = currentStore.students.map((s) =>
      s.userId === currentUser?.id
        ? { ...s, name: editForm.name.trim(), phone: editForm.phone.trim() }
        : s
    );
    saveStore(currentStore);
    localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, name: editForm.name.trim(), phone: editForm.phone.trim() }));
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const enrolledCourses = store.courses.filter((c) =>
    student?.enrolledCourses.includes(c.id)
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Personal Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-1">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="profile-phone">Phone Number</Label>
                <Input
                  id="profile-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">{user?.name || currentUser?.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{user?.email || currentUser?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium text-foreground">{user?.phone || currentUser?.phone || 'Not set'}</span>
              </div>
            </>
          )}

          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge
              variant={
                student?.status === 'approved'
                  ? 'default'
                  : student?.status === 'pending'
                  ? 'secondary'
                  : 'destructive'
              }
              className="text-xs capitalize"
            >
              {student?.status || 'Unknown'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Access Code */}
      {student?.accessCode && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              Access Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <code className="flex-1 p-3 bg-background border border-border rounded-lg font-mono text-lg font-bold text-primary tracking-widest text-center">
                {student.accessCode}
              </code>
              <Button variant="outline" size="icon" onClick={copyAccessCode}>
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Use this code to access exclusive resources and materials.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Enrolled Courses */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Enrolled Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrolledCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Not enrolled in any courses yet.
            </p>
          ) : (
            <div className="space-y-2">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                  <div className="p-1.5 bg-primary/10 rounded">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1 truncate">{course.name}</span>
                  <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
