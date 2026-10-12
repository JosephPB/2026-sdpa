"""Recursion examples. Use non-negative integers for n and b below."""
def basket_total(prices):
    if prices == []:
        return 0
    return prices[0] + basket_total(prices[1:])

def total_loop(prices):
    total = 0
    for price in prices:
        total += price
    return total

def sum_to(n):
    if n == 0:
        return 0
    return n + sum_to(n - 1)

def multiply(a, b):
    if b == 0:
        return 0
    return a + multiply(a, b - 1)

def multiply_loop(a, b):
    result = 0
    while b > 0:
        result += a
        b -= 1
    return result

def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)

def is_palindrome(text):
    if len(text) <= 1:
        return True
    if text[0] != text[-1]:
        return False
    return is_palindrome(text[1:-1])

if __name__ == "__main__":
    for basket in [[], [800], [800, 1000, 900]]:
        print(basket, basket_total(basket), total_loop(basket))
    print(sum_to(4), multiply(3, 4), multiply_loop(3, 4), factorial(4))
    for word in ["", "radar", "civic", "duck"]:
        print(repr(word), is_palindrome(word))
