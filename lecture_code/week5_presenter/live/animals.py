"""Inheritance, extending initialisation and overriding a method."""

class Animal:
    def __init__(self, name):
        self.name = name

    def roll_over(self):
        return self.name + ": no trick defined"


class Cat(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed

    def sleep(self):
        return self.name + " is sleeping"

    def roll_over(self):
        return self.name + " rolled over!"


class Alpaca(Animal):
    def roll_over(self):
        return self.name + ": absolutely not."


if __name__ == "__main__":
    kitty = Cat("Kitty", "Siamese")
    mimi = Alpaca("Mimi")
    print(kitty.name, kitty.breed)
    print(kitty.sleep())
    for animal in [kitty, mimi]:
        print(animal.roll_over())
