import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, CalendarDays } from 'lucide-react';
import { getDashboard } from '../api/dashboard';
import { getAttendance } from '../api/attendance';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, attRes] = await Promise.all([
        getDashboard(),
        getAttendance(),
      ]);
      setStats(dashRes.data);
      setRecentAttendance(attRes.data.slice(0, 10));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchData} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card title="Total Employees" value={stats.total_employees} icon={Users} color="indigo" />
        <Card title="Present Today" value={stats.present_today} icon={UserCheck} color="green" />
        <Card title="Absent Today" value={stats.absent_today} icon={UserX} color="red" />
        <Card
          title="Not Marked"
          value={Math.max(0, stats.total_employees - stats.present_today - stats.absent_today)}
          icon={CalendarDays}
          color="amber"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Attendance</h2>
        </div>
        {recentAttendance.length === 0 ? (
          <EmptyState title="No attendance records yet" message="Start marking attendance to see records here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Employee</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{r.employee_name}</td>
                    <td className="px-6 py-3 text-gray-600">{r.date}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          r.status === 'Present'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
