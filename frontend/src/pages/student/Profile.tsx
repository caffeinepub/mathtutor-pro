import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { getStudentByUserId, updateStudent, getAuthState } from '../../lib/store';
import { User, Mail, Phone, BookOpen, Copy, Check, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentProfile() {
  const auth = getAuthState();
  const student = auth.userId ? getStudentByUserId(auth.userId) : null;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(student?.name || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [copied, setCopied] = useState(false);

  if (!student) {
    return (
      <div className="p-6 text-center text-slate-500">
        Profile not found. Please contact admin.
      </div>
    );
  }

  const handleSave = () => {
    updateStudent(student.id, { name: name.trim(), phone: phone.trim() });
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const copyAccessCode = () => {
    if (student.accessCode) {
      navigator.clipboard.writeText(student.accessCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Access code copied!');
      });
    }
  };

  const getStatusBadge = () => {
    switch (student.status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-green-300 text-sm px-3 py-1">✅ Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-sm px-3 py-1">⏳ Pending Approval</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-red-300 text-sm px-3 py-1">❌ Rejected</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>

      {/* Access Code Card */}
      {student.status === 'approved' && student.accessCode && (
        <div className="bg-gradient-to-r from-sky-600 to-sky-500 rounded-2xl p-6 mb-6 text-white text-center">
          <p className="text-sky-100 text-sm font-medium mb-2">Your Login Access Code</p>
          <p className="text-4xl font-bold font-mono tracking-widest mb-4">{student.accessCode}</p>
          <Button
            onClick={copyAccessCode}
            variant="outline"
            className="border-white text-white hover:bg-white/20 font-semibold h-11 px-6"
          >
            {copied ? (
              <><Check size={16} className="mr-2" /> Copied!</>
            ) : (
              <><Copy size={16} className="mr-2" /> Copy Access Code</>
            )}
          </Button>
          <p className="text-sky-200 text-xs mt-3">Keep this code safe. You need it to log in.</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center">
              <User size={28} className="text-sky-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{student.name}</h2>
              {getStatusBadge()}
            </div>
          </div>
          {!isEditing ? (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="border-sky-200 text-sky-700 hover:bg-sky-50 h-10 px-4"
            >
              <Edit size={16} className="mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="bg-sky-600 hover:bg-sky-700 text-white h-10 px-4"
              >
                <Save size={16} className="mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => { setIsEditing(false); setName(student.name); setPhone(student.phone); }}
                className="h-10 px-4"
              >
                <X size={16} />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              <User size={14} /> Full Name
            </Label>
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 text-base border-sky-200 focus:border-sky-500"
              />
            ) : (
              <p className="text-base font-medium text-slate-800 py-2">{student.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              <Mail size={14} /> Email Address
            </Label>
            <p className="text-base font-medium text-slate-800 py-2">{student.email}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              <Phone size={14} /> Phone Number
            </Label>
            {isEditing ? (
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 text-base border-sky-200 focus:border-sky-500"
              />
            ) : (
              <p className="text-base font-medium text-slate-800 py-2">{student.phone}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              <BookOpen size={14} /> Enrolled Course
            </Label>
            <p className="text-base font-medium text-slate-800 py-2">{student.course}</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-slate-500">Registered On</Label>
            <p className="text-base text-slate-700 py-2">
              {new Date(student.registeredAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
