"""Deliberately incorrect comparison for the recorded demonstration."""


def flag_force(readings, threshold):
    return [value > threshold for value in readings]
