def amount_to_pay(subtotal):
    print("entered:", subtotal)
    print("eligible:", subtotal >= 2000)
    if subtotal >= 2000:
        print("discount branch")
        return subtotal - 500
    print("no-discount branch")
    return subtotal

print("result:", amount_to_pay(2000))