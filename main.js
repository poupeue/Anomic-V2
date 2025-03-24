const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Fullscreen & resize support
function resizeCanvas() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Player model (a red sphere)
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const playerModel = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(playerModel);

// Player state
const player = {
    position: new THREE.Vector3(0, 1.5, 5),
    speed: 0.1,
    velocity: new THREE.Vector3(0, 0, 0),
    isJumping: false,
    health: 100, // Start with full health
};

// Function to update health bar
function updateHealthBar() {
    const healthPercentage = player.health / 100;
    const healthFill = document.querySelector(".health-fill");
    healthFill.style.width = `${healthPercentage * 100}%`; // Adjust the width of the health bar
}

// Simulate player taking damage (this is just for testing, you can trigger it in the game)
function takeDamage(amount) {
    player.health -= amount;
    if (player.health < 0) player.health = 0; // Prevent negative health
    updateHealthBar();
}

// Key listeners
const keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === " " && !player.isJumping) {
        player.isJumping = true;
        player.velocity.y = 0.2;
    }
    if (e.key === "Shift") player.speed = 0.2; // Sprint
});
window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
    if (e.key === "Shift") player.speed = 0.1;
});

// Mouse listeners for right-click look
let isMouseDown = false;
let cameraYaw = 0;   // horizontal rotation (in radians)
let cameraPitch = 0; // vertical rotation (we'll use this only for view, not for movement)

window.addEventListener("mousedown", (e) => {
    if (e.button === 2) isMouseDown = true;
});
window.addEventListener("mouseup", (e) => {
    if (e.button === 2) isMouseDown = false;
});
window.addEventListener("mousemove", (e) => {
    if (isMouseDown) {
        cameraYaw -= e.movementX * 0.002;
        cameraPitch -= e.movementY * 0.002;
        cameraPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraPitch)); // Clamp pitch
    }
});

// Update player movement using cameraYaw for direction
function updatePlayer() {
    let moveDirection = new THREE.Vector3(0, 0, 0);

    // Calculate the forward and right vectors based on the camera's yaw
    let forward = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw));
    let right = new THREE.Vector3(-Math.cos(cameraYaw), 0, Math.sin(cameraYaw));

    // Update movement based on the keys pressed (WASD)
    if (keys["w"]) moveDirection.add(forward);  // Move forward
    if (keys["s"]) moveDirection.sub(forward);  // Move backward
    if (keys["a"]) moveDirection.sub(right);   // Move left
    if (keys["d"]) moveDirection.add(right);   // Move right

    if (moveDirection.length() > 0) {
        moveDirection.normalize();  // Normalize to prevent faster diagonal movement
        player.position.addScaledVector(moveDirection, player.speed);  // Update position based on direction
    }

    // Gravity & Jumping
    if (player.position.y > 1.5 || player.isJumping) {
        player.velocity.y -= 0.01; // Apply gravity
        player.position.y += player.velocity.y;
    }
    if (player.position.y <= 1.5) {
        player.position.y = 1.5;
        player.velocity.y = 0;
        player.isJumping = false;
    }

    playerModel.position.copy(player.position);
    updateCamera();
}

// Update camera to follow player using the yaw and pitch values.
function updateCamera() {
    const cameraDistance = 5;
    const cameraHeight = 2;
    camera.position.x = player.position.x - Math.sin(cameraYaw) * cameraDistance;
    camera.position.z = player.position.z - Math.cos(cameraYaw) * cameraDistance;
    camera.position.y = player.position.y + cameraHeight;

    let lookAtPoint = new THREE.Vector3();
    lookAtPoint.x = player.position.x + Math.sin(cameraYaw);
    lookAtPoint.y = player.position.y + cameraHeight + Math.sin(cameraPitch);
    lookAtPoint.z = player.position.z + Math.cos(cameraYaw);

    camera.lookAt(lookAtPoint);
}

// Add a ground plane
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x808080,
    side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Game loop
function animate() {
    requestAnimationFrame(animate);
    updatePlayer();
    renderer.render(scene, camera);
}
animate();

// Example: Simulate taking damage
setInterval(() => {
    if (player.health > 0) takeDamage(1); // Take 1 damage every second (just for testing)
}, 1000);
