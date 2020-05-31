from util import Atom, Vector3, get_charge
from model import RNN
import re
import torch
import torch.nn as nn
import torch.optim as optim

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

    print(f'found {len(atoms)} atoms')
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

mags = []
def to_train_tensor(atoms, n):
    amino_acids = [
        'SER', 'THR', 'ALA', 'GLY', 'LYS', 'VAL', 'ILE', 'CYS', 'LEU', 'TRP', 'GLU', 'PRO',
        'PHE', 'HIS', 'ARG', 'MET', 'ASP', 'GLN', 'ASN', 'TYR'
    ]
    aa_one_hot = []
    for aa in amino_acids:
        aa_one_hot.append(1 if aa == atoms[n].amino_acid else 0)
    
    MAX_MAGNITUDE = 20
    vec_from_prev = atoms[n].to_vector3() - atoms[n - 1].to_vector3()
    prev_mag = vec_from_prev.magnitude() / MAX_MAGNITUDE
    vec_from_prev.normalize_()
    input_tensor = torch.tensor([[vec_from_prev.x, vec_from_prev.y, vec_from_prev.z, prev_mag] + aa_one_hot])

    vec_to_next = atoms[n + 1].to_vector3() - atoms[n].to_vector3()
    next_mag = vec_to_next.magnitude() / MAX_MAGNITUDE
    vec_to_next.normalize_()
    output_tensor = torch.tensor([[vec_to_next.x, vec_to_next.y, vec_to_next.z, next_mag]])
    return input_tensor, output_tensor

def train(rnn, train_data, train_labels):
    # initialization
    hidden = rnn.init_hidden()
    criterion = nn.MSELoss()
    optimizer = optim.SGD(rnn.parameters(), lr=0.01)

    for i in range(1, len(train_data)):
        # progress bar
        if i % 100 == 0:
            print(f'On training example {i}')

        hidden = rnn.init_hidden()
        optimizer.zero_grad()
        for j in range(i):
            output, hidden = rnn(train_data[j], hidden)
    
        loss = criterion(output, train_labels[i])
        loss.backward()
        optimizer.step()


def evaluate(rnn, data, residue=None):
    hidden = rnn.init_hidden()
    if residue is None:
        residue = len(data)

    for i in range(residue + 1):
        output, hidden = rnn(data[i], hidden)

    return output


def test(rnn, test_data, test_labels):
    for i in range(20):
        output = evaluate(rnn, test_data, i)
        predicted = Vector3(output[0][0].item(), output[0][1].item(), output[0][2].item())
        print(predicted)
        truth = Vector3(test_labels[i][0][0].item(), test_labels[i][0][1].item(), test_labels[i][0][2].item())
        print(f'{predicted.angle_between(truth)} degrees')


if __name__ == '__main__':
    atoms = read_pdb('1adb.pdb')

    train_data = []
    train_labels = []
    for idx in range(len(atoms) - 1):
        data, labels = to_train_tensor(atoms, idx)
        train_data.append(data)
        train_labels.append(labels)
    
    num_hidden = 128
    rnn = RNN(train_data[0].size()[1], num_hidden, train_labels[0].size()[1])

    train(rnn, train_data, train_labels)
    
    # test
    test(rnn, train_data, train_labels)
