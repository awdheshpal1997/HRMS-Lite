import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, CalendarPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAttendance, markAttendance } from '../api/attendance';
import { getEmployees } from '../api/employees';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

export default function AttendanceOverview() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [showMark, setShowMark] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [markForm, setMarkForm] = useState({ employee: '', date: today, status: 'Present' });
  const [markErrors, setMarkErrors] = useState({});

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterEmployee) params.employee_id = filterEmployee;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await getAttendance(params);
      setRecords(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterEmployee, dateFrom, dateTo]);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (_) {
      /* employees list is optional for filters */
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleMark = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!markForm.employee) errors.employee = 'Select an employee';
    if (!markForm.date) errors.date = 'Date is required';
    if (Object.keys(errors).length > 0) {
      setMarkErrors(errors);
      return;
    }
    setSubmitting(true);
    setMarkErrors({});
    try {
      await markAttendance(markForm);
      toast.success('Attendance marked successfully');
      setShowMark(false);
      setMarkForm({ employee: '', date: today, status: 'Present' });
      fetchRecords();
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <Button onClick={() => setShowMark(true)} disabled={employees.length === 0}>
          <CalendarPlus size={16} /> Mark Attendance
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 flex-1">All Records</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {(dateFrom || dateTo || filterEmployee) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); setFilterEmployee(''); }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading attendance..." />
        ) : error ? (
          <ErrorBanner message={error} onRetry={fetchRecords} />
        ) : records.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No attendance records"
            message="Mark attendance for employees to see records here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Employee</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Details</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{r.employee_name}</td>
                    <td className="px-6 py-3 font-mono text-sm text-gray-500">{r.employee}</td>
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
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`/attendance/${r.employee}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        View
                      </Link>
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
          <Select
            label="Employee"
            value={markForm.employee}
            onChange={(e) => {
              setMarkForm((prev) => ({ ...prev, employee: e.target.value }));
              if (markErrors.employee) setMarkErrors((prev) => ({ ...prev, employee: undefined }));
            }}
            options={[
              { value: '', label: 'Select employee...' },
              ...employees.map((emp) => ({
                value: emp.employee_id,
                label: `${emp.full_name} (${emp.employee_id})`,
              })),
            ]}
            error={markErrors.employee}
          />
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
