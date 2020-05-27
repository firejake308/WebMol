class Atom:
    def __init__(self, element, charge, name, residue_num, x, y, z):
        self.element = element
        self.charge = charge
        self.name = name
        self.residue_num = residue_num
        self.x = x
        self.y = y
        self.z = z

class Vector3:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z
    
    def __add__(self, other):
        return Vector(
            self.x + other.x,
            self.y + other.y,
            self.z + other.z,
        )
    
    def __sub__(self, other):
        return Vector(
            self.x - other.x,
            self.y - other.y,
            self.z - other.z,
        )
    
    def cross(self, other):
        return Vector(
            self.y * other.z - self.z * other.y,
            self.z * other.x - self.x * other.z,
            self.x * other.y - self.y - other.x,
        )

def get_charge(charge_str):
    if len(charge_str) != 2:
        raise Exception("Invalid charge string: " + charge_str + "|")

    if charge_str == '  ': return 0
    return int(charge_str[1] + charge_str[0])
