from orders import Order

order = Order(11, "Sam")
try:
    order.collect()
    print("Enjoy your pizza!")
except ValueError as error:
    print(error)

print("Next customer")
print("Status:", order.status)
