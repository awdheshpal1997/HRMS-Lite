import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Eye, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEmployees, createEmployee, deleteEmployee } from '../api/employees';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

const initialForm = { employee_id: '', full_name: '', email: '', department: '' };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const validateForm = () => {
    const errors = {};
    if (!form.employee_id.trim()) errors.employee_id = 'Employee ID is required';
    if (!form.full_name.trim()) errors.full_name = 'Full name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format';
    if (!form.department.trim()) errors.department = 'Department is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSubmitting(true);
    setFormErrors({});
    try {
      await createEmployee(form);
      toast.success('Employee added successfully');
      setShowAdd(false);
      setForm(initialForm);
      fetchEmployees();
    } catch (err) {
      const serverErrors = err.raw || {};
      const mapped = {};
      Object.keys(serverErrors).forEach((key) => {
        const val = serverErrors[key];
        mapped[key] = Array.isArray(val) ? val[0] : val;
      });
      if (Object.keys(mapped).length > 0) {
        setFormErrors(mapped);
      } else {
        toast.error(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteTarget.employee_id);
      toast.success(`Employee ${deleteTarget.employee_id} deleted`);
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Employee
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading employees..." />
      ) : error ? (
        <ErrorBanner message={error} onRetry={fetchEmployees} />
      ) : employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees yet"
          message="Add your first employee to get started."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Department</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Present</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Absent</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.employee_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-mono text-sm text-gray-700">{emp.employee_id}</td>
                    <td className="px-6 py-3 font-medium text-gray-900">{emp.full_name}</td>
                    <td className="px-6 py-3 text-gray-600">{emp.email}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-green-600 font-medium">{emp.total_present ?? 0}</td>
                    <td className="px-6 py-3 text-red-600 font-medium">{emp.total_absent ?? 0}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/attendance/${emp.employee_id}`}
                          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View attendance"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(emp)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete employee"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={showAdd} onClose={() => { setShowAdd(false); setForm(initialForm); setFormErrors({}); }} title="Add Employee">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Employee ID"
            placeholder="e.g. EMP001"
            value={form.employee_id}
            onChange={handleChange('employee_id')}
            error={formErrors.employee_id}
          />
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={form.full_name}
            onChange={handleChange('full_name')}
            error={formErrors.full_name}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. john@company.com"
            value={form.email}
            onChange={handleChange('email')}
            error={formErrors.email}
          />
          <Input
            label="Department"
            placeholder="e.g. Engineering"
            value={form.department}
            onChange={handleChange('department')}
            error={formErrors.department}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => { setShowAdd(false); setForm(initialForm); setFormErrors({}); }}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Add Employee
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteTarget?.full_name} (${deleteTarget?.employee_id})? This will also remove all their attendance records.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
