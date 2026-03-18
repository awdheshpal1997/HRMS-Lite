import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import AttendanceOverview from './pages/AttendanceOverview';
import EmployeeAttendance from './pages/EmployeeAttendance';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/attendance" element={<AttendanceOverview />} />
        <Route path="/attendance/:employeeId" element={<EmployeeAttendance />} />
      </Route>
    </Routes>
  );
}
