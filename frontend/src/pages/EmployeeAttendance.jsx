import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEmployee } from '../api/employees';
import { getAttendance, markAttendance } from '../api/attendance';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

export default function EmployeeAttendance() {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMark, setShowMark] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [markForm, setMarkForm] = useState({ date: today, status: 'Present' });
  const [markErrors, setMarkErrors] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { employee_id: employeeId };
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const [empRes, attRes] = await Promise.all([
        getEmployee(employeeId),
        getAttendance(params),
      ]);
      setEmployee(empRes.data);
      setRecords(attRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [employeeId, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMark = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!markForm.date) errors.date = 'Date is required';
    if (!markForm.status) errors.status = 'Status is required';
    if (Object.keys(errors).length > 0) {
      setMarkErrors(errors);
      return;
    }
    setSubmitting(true);
    setMarkErrors({});
    try {
      await markAttendance({ employee: employeeId, date: markForm.date, status: markForm.status });
      toast.success('Attendance marked successfully');
      setShowMark(false);
      setMarkForm({ date: today, status: 'Present' });
      fetchData();
    } catch (err) {
      if (err.raw?.non_field_errors) {
        toast.error(err.raw.non_field_errors[0]);
      } else {
        toast.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;

  if (loading && !employee) return <LoadingSpinner text="Loading attendance..." />;
  if (error && !employee) return <ErrorBanner message={error} onRetry={fetchData} />;

  return (
    <div>
      <Link to="/employees" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Employees
      </Link>

      {employee && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.full_name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {employee.employee_id} &middot; {employee.department} &middot; {employee.email}
              </p>
            </div>
            <Button onClick={() => setShowMark(true)}>
              <CalendarPlus size={16} /> Mark Attendance
            </Button>
          </div>

          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
            <div>
              <span className="text-sm text-gray-500">Present</span>
              <p className="text-xl font-bold text-green-600">{presentCount}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Absent</span>
              <p className="text-xl font-bold text-red-600">{absentCount}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Total</span>
              <p className="text-xl font-bold text-gray-900">{records.length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 flex-1">Attendance Records</h2>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="From"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="To"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Filtering records..." />
        ) : records.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records"
            message={dateFrom || dateTo ? 'No records match the selected date range.' : 'Mark attendance to see records here.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">#</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-400">{idx + 1}</td>
                    <td className="px-6 py-3 text-gray-900">{r.date}</td>
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

      <Modal open={showMark} onClose={() => { setShowMark(false); setMarkErrors({}); }} title="Mark Attendance">
        <form onSubmit={handleMark} className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={markForm.date}
            onChange={(e) => setMarkForm((prev) => ({ ...prev, date: e.target.value }))}
            error={markErrors.date}
          />
          <Select
            label="Status"
            value={markForm.status}
            onChange={(e) => setMarkForm((prev) => ({ ...prev, status: e.target.value }))}
            options={[
              { value: 'Present', label: 'Present' },
              { value: 'Absent', label: 'Absent' },
            ]}
            error={markErrors.status}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => { setShowMark(false); setMarkErrors({}); }}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Mark Attendance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
