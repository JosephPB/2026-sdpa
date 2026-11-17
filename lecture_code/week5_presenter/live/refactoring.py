"""A structural change: both versions should have the same behaviour."""

def before(subtotal):
    if subtotal >= 2000:
        total = subtotal - 500
    else:
        total = subtotal
    return total


def after(subtotal):
    if subtotal >= 2000:
        return subtotal - 500
    return subtotal


if __name__ == "__main__":
    for function in [before, after]:
        assert function(1900) == 1900
        assert function(2000) == 1500
        assert function(2100) == 1600
        print(function.__name__, "3 tests passed")
