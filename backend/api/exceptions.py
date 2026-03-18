from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        response.data['status_code'] = response.status_code
        return response

    if isinstance(exc, IntegrityError):
        return Response(
            {
                'error': 'A record with this data already exists.',
                'detail': str(exc),
                'status_code': 409,
            },
            status=status.HTTP_409_CONFLICT,
        )

    return Response(
        {
            'error': 'An unexpected error occurred.',
            'detail': str(exc),
            'status_code': 500,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
