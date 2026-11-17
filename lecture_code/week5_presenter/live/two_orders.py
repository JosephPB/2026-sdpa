"""Run this file in the IDE during the two-order example."""

class Order:
    def __init__(self, number, customer):
        self.number = number
        self.customer = customer
        self.status = "Preparing"

    def mark_ready(self):
        self.status = "Ready"

order_11 = Order(11, "Sam")
order_12 = Order(12, "Alex")
order_11.mark_ready()
print(order_11.status, order_12.status)
