"""Before defining functions: two orders, two ordinary price lookups."""
menu_prices = {"classic": 800, "pepperoni": 1000}

# First customer
pizza = "classic"
total = menu_prices[pizza]
print("Price in pence:", total)

# Second customer: the lookup is repeated
pizza = "pepperoni"
total = menu_prices[pizza]
print("Price in pence:", total)
