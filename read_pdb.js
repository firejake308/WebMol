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
        }));  
    switch(modelType) {
        case 'backbone': {
            let lastPoints = null;
            const geoms = [];
            for (let i = 1; i < atoms.length-1; i++) {
                const points = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

                const curr = atoms[i];
                const prev = atoms[i - 1];
                const next = atoms[i + 1];

                const currPos = new THREE.Vector3(curr.x, curr.y, curr.z);
                const prevPos = new THREE.Vector3(prev.x, prev.y, prev.z);
                const nextPos = new THREE.Vector3(next.x, next.y, next.z);                

                const toPrev = new THREE.Vector3();
                toPrev.subVectors(prevPos, currPos);
                const toNext = new THREE.Vector3();
                toNext.subVectors(nextPos, currPos);
                const bisector = new THREE.Vector3();
                bisector.addVectors(toPrev, toNext).normalize().multiplyScalar(0.125);
                const cross = new THREE.Vector3();
                cross.crossVectors(toPrev, toNext).normalize().multiplyScalar(0.125);

                points[0].addVectors(currPos, bisector);
                bisector.multiplyScalar(-1);
                points[2].addVectors(currPos, bisector);

                points[1].addVectors(currPos, cross);
                cross.multiplyScalar(-1);
                points[3].addVectors(currPos, cross);

                if (lastPoints) {
                    const geom = new THREE.BufferGeometry();
                    const verts = new Float32Array([
                        ...makeTri(points[0], lastPoints[0], points[1]),
                        ...makeTri(points[1], lastPoints[1], points[0]),
                        ...makeTri(points[1], lastPoints[1], points[2]),
                        ...makeTri(points[2], lastPoints[2], points[1]),
                        ...makeTri(points[2], lastPoints[2], points[3]),
                        ...makeTri(points[3], lastPoints[3], points[2]),
                        ...makeTri(points[3], lastPoints[3], points[0]),
                        ...makeTri(points[0], lastPoints[0], points[3]),
                    ]);
                    console.log(verts);
                    geom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
                    geoms.push(geom);
                }
                lastPoints = points;
            }

            // make merged geometry
            const mergedGeom = THREE.BufferGeometryUtils.mergeBufferGeometries(geoms, false);
            const mat = new THREE.MeshBasicMaterial({color: 0x0000ff});
            const mesh = new THREE.Mesh(mergedGeom, mat);
            scene.add(mesh);
        }
        break;
        case 'space-filling':
        default: {
            const geoms = atoms.map(atom => {
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
            });

            // make merged geometry
            const mergedGeom = THREE.BufferGeometryUtils.mergeBufferGeometries(geoms, false);
            const mat = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors});
            const mesh = new THREE.Mesh(mergedGeom, mat);
            scene.add(mesh);
        }
    }
    
    // update scene
    render();
}

function makeTri(v1, v2, v3) {
    return [
        ...vecToArr(v1), ...vecToArr(v2), ...vecToArr(v3),
    ];
}

function vecToArr(vec3) {
    return [vec3.x, vec3.y, vec3.z];
}

function getCharge(chgStr) {
    // validation
    if (chgStr.length !== 2) throw Error("Invalid charge given to getCharge()");

    // convert string to number
    if (chgStr === '  ') return 0;
    return Number.parseInt(chgStr[1]+chgStr[0]);
}

document.getElementById('upload-pdb').addEventListener('change', readPDB);