function readPDB() {
    const file = this.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = evt => processPDB(evt.target.result);
    reader.readAsText(file);
}

function processPDB(text) {
    const lines = text.split('\n');
    const atoms = lines
        .filter(line => line.startsWith('ATOM'))
        .map(line => ({
            element: line.substring(76, 78).trim(),
            charge: getCharge(line.substring(78)),
            x: Number.parseFloat(line.substring(30, 38)),
            y: Number.parseFloat(line.substring(38, 46)),
            z: Number.parseFloat(line.substring(46, 54)),
        }));
    atoms.forEach(renderAtom);
}

function getCharge(chgStr) {
    // validation
    if (chgStr.length !== 2) throw Error("Invalid charge given to getCharge()");

    // convert string to number
    if (chgStr === '  ') return 0;
    return Number.parseInt(chgStr[1]+chgStr[0]);
}

function renderAtom(atom) {
    const materialMap = {
        'C': carbon,
        'N': nitrogen,
        'O': oxygen,
        'P': phosphorus,
        'H': hydrogen,
    }
    var atomSphere = new THREE.Mesh(sphere, materialMap[atom.element]);
    atomSphere.position.set(atom.x, atom.y, atom.z);
    scene.add(atomSphere);
}

document.getElementById('upload-pdb').addEventListener('change', readPDB);