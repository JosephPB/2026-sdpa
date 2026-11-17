"""£5 off a subtotal of £20 or more. Input/output: whole pence.

Teaching precondition: subtotal is a non-negative integer.
"""

def amount_to_pay(subtotal):
    if subtotal >= 2000:
        return subtotal - 500
    return subtotal


def checkout(subtotal):
    """Connect pricing to a tiny receipt, for the integration example."""
    total = amount_to_pay(subtotal)
    return {"subtotal": subtotal, "amount_to_pay": total}


if __name__ == "__main__":
    for subtotal, expected in [(1900, 1900), (2000, 1500), (2100, 1600)]:
        actual = amount_to_pay(subtotal)
        print(subtotal, expected, actual, actual == expected)
