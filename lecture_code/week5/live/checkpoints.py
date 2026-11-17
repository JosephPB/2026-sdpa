"""Use block boundaries to narrow the search, then inspect the failing block."""
from till_buggy import amount_to_pay

subtotal = 2000
print("A: subtotal", subtotal)

total = amount_to_pay(subtotal)
print("B: calculated total", total)

print("C: receipt", total)
