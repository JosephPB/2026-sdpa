"""The same four requirement-derived checks run against either implementation.

Correct version: python -m unittest -v
Buggy version:   python test_force.py --buggy
"""
import sys
import unittest

if "--buggy" in sys.argv:
    sys.argv.remove("--buggy")
    from force_buggy import flag_force
else:
    from force import flag_force


class TestForce(unittest.TestCase):
    def test_below_threshold(self):
        self.assertEqual(flag_force([2], 5), [False])

    def test_at_threshold(self):
        self.assertEqual(flag_force([5], 5), [True])

    def test_above_threshold(self):
        self.assertEqual(flag_force([8], 5), [True])

    def test_empty(self):
        self.assertEqual(flag_force([], 5), [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
