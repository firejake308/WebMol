class Atom:
    def __init__(self, element, charge, name, residue_num, x, y, z):
        self.element = element
        self.charge = charge
        self.name = name
        self.residue_num = residue_num
        self.x = x
        self.y = y
        self.z = z

def get_charge(charge_str):
    if len(charge_str) != 2:
        raise Exception("Invalid charge string: " + charge_str + "|")

    if charge_str == '  ': return 0
    return int(charge_str[1] + charge_str[0])
