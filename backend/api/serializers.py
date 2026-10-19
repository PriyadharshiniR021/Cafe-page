from rest_framework import serializers
from .models import MenuItem, CustomerOrder, OrderItem, ContactMessage, Testimonial

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['menu_item', 'item_name', 'price', 'quantity', 'subtotal']
        read_only_fields = ['item_name', 'price', 'subtotal']

class CustomerOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = CustomerOrder
        fields = ['id', 'customer_name', 'customer_phone', 'customer_email', 'delivery_address', 'notes', 'total_amount', 'status', 'created_at', 'items']
        read_only_fields = ['total_amount', 'status', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Calculate total amount on the backend
        total_amount = 0
        for item_data in items_data:
            menu_item = item_data['menu_item']
            quantity = item_data['quantity']
            total_amount += menu_item.price * quantity

        # Create Order
        order = CustomerOrder.objects.create(total_amount=total_amount, **validated_data)
        
        # Create Order Items
        for item_data in items_data:
            menu_item = item_data['menu_item']
            quantity = item_data['quantity']
            price = menu_item.price
            subtotal = price * quantity
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                item_name=menu_item.name,
                price=price,
                quantity=quantity,
                subtotal=subtotal
            )
            
        return order

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ['is_read', 'created_at']

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'
