import { useMemo } from 'react';
import { getStore } from '../../lib/store';
import { useGetAllPayments } from '../../hooks/useQueries';
import { Users, CreditCard, BookOpen, Calendar, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function AdminDashboard() {
  const store = useMemo(() => getStore(), []);
  const { data: payments = [] } = useGetAllPayments();

  const stats = useMemo(() => {
    const totalStudents = store.students.length;
    const activeStudents = store.students.filter((s) => s.status === 'approved').length;
    const pendingStudents = store.students.filter((s) => s.status === 'pending').length;
    const totalSessions = store.sessions.length;
    const totalMaterials = store.materials.length;
    const approvedPayments = payments.filter((p) => p.status.__kind__ === 'approved').length;

    return {
      totalStudents,
      activeStudents,
      pendingStudents,
      totalSessions,
      totalMaterials,
      approvedPayments,
    };
  }, [store, payments]);

  const recentStudents = useMemo(
    () =>
      [...store.students]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [store.students]
  );

  const recentSessions = useMemo(
    () =>
      [...store.sessions]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [store.sessions]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your tutoring platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground">Total Students</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.activeStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-yellow-500" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.pendingStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={16} className="text-blue-500" />
              <span className="text-xs text-muted-foreground">Sessions</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-purple-500" />
              <span className="text-xs text-muted-foreground">Materials</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalMaterials}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={16} className="text-gold" />
              <span className="text-xs text-muted-foreground">Approved Payments</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.approvedPayments}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Students */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Students</CardTitle>
          </CardHeader>
          <CardContent>
            {recentStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students yet.</p>
            ) : (
              <div className="space-y-3">
                {recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        student.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : student.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions yet.</p>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.date} at {session.time}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        session.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-700'
                          : session.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
