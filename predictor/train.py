from util import Atom, get_charge
import re

pdb_file = open('1adb.pdb')

atoms = []
for line in pdb_file:
    if line.startswith('ATOM'):
        name = line[12:16].strip()
        # filter out side chains
        if re.fullmatch(r'/^(N)|(CA)|(C)$/', name) is None:
            continue

        atoms.append(Atom(
            element=line[76:78].strip(),
            charge=get_charge(line[78:80]),
            name=name,
            residue_num=line[22:26].strip(),
            x=float(line[30:38]),
            y=float(line[38:46]),
            z=float(line[46:54]),
        ))

print(len(atoms))