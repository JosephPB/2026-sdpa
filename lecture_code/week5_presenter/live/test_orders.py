import unittest
from orders import Order

class OrderTests(unittest.TestCase):
    def test_ready_state_is_independent(self):
        first = Order(11, "Sam")
        second = Order(12, "Alex")
        first.mark_ready()
        self.assertEqual(first.status, "Ready")
        self.assertEqual(second.status, "Preparing")

    def test_alias_refers_to_same_instance(self):
        first = Order(11, "Sam")
        alias = first
        alias.mark_ready()
        self.assertIs(alias, first)
        self.assertEqual(first.status, "Ready")

    def test_failed_collection_preserves_state(self):
        order = Order(11, "Sam")
        with self.assertRaisesRegex(ValueError, "Order is not ready"):
            order.collect()
        self.assertEqual(order.status, "Preparing")

    def test_ready_order_can_be_collected(self):
        order = Order(11, "Sam")
        order.mark_ready()
        order.collect()
        self.assertEqual(order.status, "Collected")

    def test_description_and_default_customer(self):
        order = Order(13)
        self.assertEqual(order.customer, "Guest")
        self.assertEqual(str(order), "Order 13: Preparing")

if __name__ == "__main__":
    unittest.main()
