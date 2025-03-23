const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

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

    // Prevent the player from falling below the ground (Y position)
    if (player.y < 1.5) player.y = 1.5; // Ensure player doesn't go below the ground

    // Update player model's position to match the camera
    playerModel.position.set(player.x, player.y, player.z);
    camera.position.set(player.x, player.y + 1, player.z + 3);  // Camera follows the player
}

// Create a simple player model (sphere)
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);  // Radius, width, height
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const playerModel = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(playerModel);

// Game loop
function animate() {
    requestAnimationFrame(animate);
    updatePlayer();
    renderer.render(scene, camera);
}
animate();

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
// Add a ground plane
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate to lay flat
scene.add(plane);
