"""Run from week5: python3 -m unittest discover -s live -v"""
import unittest
from till_fixed import amount_to_pay, checkout

class TillTests(unittest.TestCase):
    def test_below_threshold(self):
        self.assertEqual(amount_to_pay(1900), 1900)

    def test_exact_threshold(self):
        subtotal, expected = 2000, 1500  # Arrange
        actual = amount_to_pay(subtotal)  # Act
        self.assertEqual(actual, expected)  # Assert

    def test_above_threshold(self):
        self.assertEqual(amount_to_pay(2100), 1600)

    def test_checkout_uses_pricing_result_on_receipt(self):
        receipt = checkout(2000)
        self.assertEqual(receipt["subtotal"], 2000)
        self.assertEqual(receipt["amount_to_pay"], 1500)

if __name__ == "__main__":
    unittest.main()
