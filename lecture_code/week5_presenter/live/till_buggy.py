"""Intentional teaching bug. Rule: £5 off a subtotal of £20 or more."""

def amount_to_pay(subtotal):
    if subtotal > 2000:  # Set the VS Code breakpoint on this line.
        return subtotal - 500
    return subtotal


if __name__ == "__main__":
    subtotal = 2000
    total = amount_to_pay(subtotal)
    print("Amount to pay:", total)  # Should be 1500; currently 2000.
