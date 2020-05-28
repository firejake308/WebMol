class Atom:
    def __init__(self, element, charge, name, residue_num, amino_acid, chain, x, y, z):
        self.element = element
        self.charge = charge
        self.name = name
        self.residue_num = residue_num
        self.amino_acid = amino_acid
        self.chain = chain
        self.x = x
        self.y = y
        self.z = z
    
    def to_vector3(self):
        return Vector3(self.x, self.y, self.z)

class Vector3:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z
    
    def __add__(self, other):
        return Vector3(
            self.x + other.x,
            self.y + other.y,
            self.z + other.z,
        )
    
    def __sub__(self, other):
        return Vector3(
            self.x - other.x,
            self.y - other.y,
            self.z - other.z,
        )
    
    def cross(self, other):
        return Vector3(
            self.y * other.z - self.z * other.y,
            self.z * other.x - self.x * other.z,
            self.x * other.y - self.y - other.x,
        )
    
    def __str__(self):
        return f'<{self.x:.5f}, {self.y:.5f}, {self.z:.5f}>'

def get_charge(charge_str):
    if len(charge_str) != 2:
        raise Exception("Invalid charge string: " + charge_str + "|")

    if charge_str == '  ': return 0
    return int(charge_str[1] + charge_str[0])
