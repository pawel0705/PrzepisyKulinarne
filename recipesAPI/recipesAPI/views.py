from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema


class IndexView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def index(request):
        return render(request, 'index.html')

    @swagger_auto_schema(tags=["entry"])
    def get(self, request, format=None):
        content = {
            'wmsg': 'Welcome to Recipes project!'
        }
        return Response(content)
