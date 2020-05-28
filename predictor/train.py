from util import Atom, Vector3, get_charge
import re
import torch

def read_pdb(filename):
    pdb_file = open(filename)

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
                amino_acid=line[17:20],
                chain=line[21],
                x=float(line[30:38]),
                y=float(line[38:46]),
                z=float(line[46:54]),
            ))

    print(len(atoms))
    return atoms

def get_residue_orientation(atoms, n):
    '''
    Returns the cross product of N(n) -> C(n-1) and N(n) -> Ca(n), which shows the
    orientation of a peptide bond plane thingy
    '''
    # arg validation
    if n * 3 - 1 < 0:
        raise Exception(f'Invalid n: {n}')

    prev_c = atoms[n * 3 - 1]
    curr_n = atoms[n * 3]
    curr_ca = atoms[n * 3 + 1]

    prev_c_loc = prev_c.to_vector3()
    curr_n_loc = curr_n.to_vector3()
    curr_ca_loc = curr_ca.to_vector3()

    vec1 = prev_c_loc - curr_n_loc
    vec2 = curr_ca_loc - curr_n_loc
    return vec1.cross(vec2)

def to_train_tensor(atoms, n):
    amino_acids = [
        'SER', 'THR', 'ALA', 'GLY', 'LYS', 'VAL', 'ILE', 'CYS', 'LEU', 'TRP', 'GLU', 'PRO',
        'PHE', 'HIS', 'ARG', 'MET', 'ASP', 'GLN', 'ASN', 'TYR'
    ]
    aa_one_hot = []
    for aa in amino_acids:
        aa_one_hot.append(1 if aa == atoms[n].amino_acid else 0)
    input_tensor = torch.Tensor([n, atoms[n].x, atoms[n].y, atoms[n].z] + aa_one_hot)
    diff_vector = atoms[n+1].to_vector3() - atoms[n].to_vector3()
    output_tensor = torch.Tensor([diff_vector.x, diff_vector.y, diff_vector.z])
    return input_tensor, output_tensor

if __name__ == '__main__':
    atoms = read_pdb('1adb.pdb')
    print(to_train_tensor(atoms, 0))

    train_data = []
    train_labels = []
    for idx in range(len(atoms)):
        data, labels = to_train_tensor(atoms, idx)
        train_data.append(data)
        train_labels.append(labels)
