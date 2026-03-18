from datetime import date
from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer

@api_view(['GET'])
def api_root(request):
    return Response({
        'message': 'HRMS backend is running.',
        'endpoints': {
            'admin': '/admin/',
            'api_root': '/api/',
            'employees': '/api/employees/',
            'attendance': '/api/attendance/',
            'dashboard': '/api/dashboard/',
            'health': '/health/',
        },
    })


@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok'})

class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    lookup_field = 'employee_id'
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return Employee.objects.annotate(
            total_present=Count(
                'attendance_records',
                filter=Q(attendance_records__status=Attendance.Status.PRESENT),
            ),
            total_absent=Count(
                'attendance_records',
                filter=Q(attendance_records__status=Attendance.Status.ABSENT),
            ),
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        emp_id = instance.employee_id
        self.perform_destroy(instance)
        return Response(
            {'message': f'Employee {emp_id} deleted successfully.'},
            status=status.HTTP_200_OK,
        )


class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        qs = Attendance.objects.select_related('employee')

        employee_id = self.request.query_params.get('employee_id')
        if employee_id:
            qs = qs.filter(employee__employee_id=employee_id)

        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(date__lte=date_to)

        return qs


@api_view(['GET'])
def dashboard(request):
    today = date.today()
    total_employees = Employee.objects.count()
    present_today = Attendance.objects.filter(
        date=today, status=Attendance.Status.PRESENT
    ).count()
    absent_today = Attendance.objects.filter(
        date=today, status=Attendance.Status.ABSENT
    ).count()

    return Response({
        'total_employees': total_employees,
        'present_today': present_today,
        'absent_today': absent_today,
        'date': today.isoformat(),
    })
