function readPDB() {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => processPDB(evt.target.result);
    reader.readAsText(file);
}

function processPDB(text) {
    const MATERIAL_MAP = {
        'C': [0x00, 0x00, 0x00],
        'H': [0xff, 0xff, 0xff],
        'O': [0xff, 0x00, 0x00],
        'N': [0x00, 0x00, 0xff],
        'P': [0xff, 0x88, 0x00],
        'S': [0xff, 0xff, 0x00],
    }

    const modelType = document.querySelector('input[name="model"]:checked').value;

    const lines = text.split('\n');
    const atoms = lines
        .filter(line => line.startsWith('ATOM'))
        .map(line => ({
            element: line.substring(76, 78).trim(),
            charge: getCharge(line.substring(78)),
            x: Number.parseFloat(line.substring(30, 38)),
            y: Number.parseFloat(line.substring(38, 46)),
            z: Number.parseFloat(line.substring(46, 54)),
        }))
        .map((atom) => {
            switch(modelType) {
                case 'backbone':
                case 'space-filling':
                default:
                    var sphere = new THREE.SphereBufferGeometry(0.5);
                    sphere.translate(atom.x, atom.y, atom.z);
                     // calculate colors
                    const numVerts = sphere.getAttribute('position').count;
                    const itemSize = 3; // r, g, b
                    let colors = new Uint8Array(itemSize * numVerts);
                    colors = colors.map((_, idx) => MATERIAL_MAP[atom.element][idx % 3]);
                    const colorAttrib = new THREE.BufferAttribute(colors, itemSize, true);
                    sphere.setAttribute('color', colorAttrib);
                    return sphere;   
            }
        });

    // make merged geometry
    const mergedGeom = THREE.BufferGeometryUtils.mergeBufferGeometries(atoms, false);
    const mat = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors});
    const mesh = new THREE.Mesh(mergedGeom, mat);
    scene.add(mesh);
    
    // update scene
    render();
}

function getCharge(chgStr) {
    // validation
    if (chgStr.length !== 2) throw Error("Invalid charge given to getCharge()");

    // convert string to number
    if (chgStr === '  ') return 0;
    return Number.parseInt(chgStr[1]+chgStr[0]);
}

document.getElementById('upload-pdb').addEventListener('change', readPDB);