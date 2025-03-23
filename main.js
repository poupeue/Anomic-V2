const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create player model (sphere)
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);  // Radius, width, height
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const playerModel = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(playerModel);

// Player movement variables
const player = {
    x: 0,
    y: 1.5,
    z: 5,
    speed: 0.1,
    velocity: new THREE.Vector3(0, 0, 0),
    isJumping: false,
};
const keys = {};

// Listen for key presses for jumping and running
window.addEventListener("keydown", (e) => {
    if (e.key === " " && player.y === 1.5) {
        player.isJumping = true;
        player.velocity.y = 0.3; // Jump velocity
    }
    if (e.key === "Shift") player.speed = 0.2; // Running speed
});
window.addEventListener("keyup", (e) => {
    if (e.key === "Shift") player.speed = 0.1; // Walking speed
});

// Camera settings
const cameraDistance = 5;
const cameraHeight = 2;
const cameraOffset = new THREE.Vector3(0, cameraHeight, -cameraDistance);

// Mouse control for camera rotation
let isMouseDown = false;
let prevMouseX = 0;
let prevMouseY = 0;
let cameraRotationX = 0;
let cameraRotationY = 0;

// Mouse event listeners for right-click drag
window.addEventListener("mousedown", (e) => {
    if (e.button === 2) { // Right-click to rotate camera
        isMouseDown = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
    }
});
window.addEventListener("mouseup", () => {
    isMouseDown = false;
});
window.addEventListener("mousemove", (e) => {
    if (isMouseDown) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;

        // Update camera rotation based on mouse movement
        cameraRotationX += deltaX * 0.002; // Rotate left-right (x-axis)
        cameraRotationY -= deltaY * 0.002; // Rotate up-down (y-axis)

        // Limit vertical camera rotation to prevent flipping
        cameraRotationY = Math.max(Math.min(cameraRotationY, Math.PI / 2), -Math.PI / 2);

        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
    }
});

// Update function for player movement and camera
function updatePlayer() {
    if (keys["w"]) player.z -= player.speed;
    if (keys["s"]) player.z += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    // Apply gravity
    if (player.y > 1.5) {
        player.velocity.y += -0.01; // Gravity
        player.y += player.velocity.y; // Update vertical position
    } else {
        player.y = 1.5; // Keep grounded
        player.velocity.y = 0;
    }

    // Update player model position
    playerModel.position.set(player.x, player.y, player.z);
    updateCamera();
}

// Update camera with mouse rotation
function updateCamera() {
    // Update camera rotation based on mouse movement
    camera.rotation.x = cameraRotationY;
    camera.rotation.y = cameraRotationX;

    // Adjust camera position relative to the player
    const targetPosition = new THREE.Vector3(player.x, player.y + cameraHeight, player.z);
    camera.position.lerp(targetPosition.add(cameraOffset), 0.1);
    camera.lookAt(player.x, player.y + 1, player.z); // Camera always looks at the player
}

// Add ground plane
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
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
