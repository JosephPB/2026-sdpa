"""Teaching example for finite numerical readings and a finite threshold.

This does not validate sensor data and must not control real equipment.
"""


def flag_force(readings, threshold):
    """Return one Boolean per reading, including equality with the threshold."""
    return [value >= threshold for value in readings]
