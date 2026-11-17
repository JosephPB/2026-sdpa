"""Week 5: a deliberately small model of an order."""

class Order:
    def __init__(self, number, customer="Guest"):
        self.number = number
        self.customer = customer
        self.status = "Preparing"

    def mark_ready(self):
        self.status = "Ready"

    def collect(self):
        if self.status != "Ready":
            raise ValueError("Order is not ready")
        self.status = "Collected"

    def __str__(self):
        return "Order " + str(self.number) + ": " + self.status


if __name__ == "__main__":
    order_11 = Order(11, "Sam")
    order_12 = Order(12, "Alex")
    order_11.mark_ready()
    print(order_11)
    print(order_12)
    another_name = order_11
    print(another_name is order_11)
