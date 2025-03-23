const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a rotating cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Add a ground plane
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate to lay flat
scene.add(plane);

// Player movement variables
const player = { x: 0, y: 1.5, z: 5, speed: 0.1 };
const keys = {};

// Listen for key presses
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

// Update function to move player
function updatePlayer() {
    if (keys["w"]) player.z -= player.speed; // Move forward
    if (keys["s"]) player.z += player.speed; // Move backward
    if (keys["a"]) player.x -= player.speed; // Move left
    if (keys["d"]) player.x += player.speed; // Move right
    
    camera.position.set(player.x, player.y, player.z);
}

// Main game loop
function animate() {
    requestAnimationFrame(animate);

    // Update player position
    updatePlayer();

    // Rotate the cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Render the scene
    renderer.render(scene, camera);
}
animate();
