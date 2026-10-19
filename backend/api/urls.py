from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuItemViewSet, CustomerOrderViewSet, ContactMessageViewSet, TestimonialViewSet

router = DefaultRouter()
router.register(r'menu', MenuItemViewSet)
router.register(r'orders', CustomerOrderViewSet)
router.register(r'contact', ContactMessageViewSet)
router.register(r'testimonials', TestimonialViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
