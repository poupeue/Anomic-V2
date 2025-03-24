const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create player model (sphere)
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
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

// Listen for key presses
window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;

    if (e.key === " " && !player.isJumping) {
        player.isJumping = true;
        player.velocity.y = 0.2; // Jump velocity
    }
    if (e.key === "Shift") player.speed = 0.2; // Running speed
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
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
    if (e.button === 2) {
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

        cameraRotationX += deltaX * 0.002;
        cameraRotationY -= deltaY * 0.002;

        cameraRotationY = Math.max(Math.min(cameraRotationY, Math.PI / 2), -Math.PI / 2);

        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
    }
});

// Update function for player movement
function updatePlayer() {
    let direction = new THREE.Vector3();

    if (keys["w"]) direction.z -= 1;
    if (keys["s"]) direction.z += 1;
    if (keys["a"]) direction.x -= 1;
    if (keys["d"]) direction.x += 1;

    if (direction.length() > 0) {
        direction.normalize();
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraRotationX); // Rotate movement direction with camera
        player.x += direction.x * player.speed;
        player.z += direction.z * player.speed;
    }

    // Gravity & Jumping
    if (player.y > 1.5) {
        player.velocity.y -= 0.01; // Gravity
        player.y += player.velocity.y;
    } else {
        player.y = 1.5;
        player.velocity.y = 0;
        player.isJumping = false;
    }

    playerModel.position.set(player.x, player.y, player.z);
    updateCamera();
}

// Update camera to follow player
function updateCamera() {
    camera.position.set(player.x - Math.sin(cameraRotationX) * cameraDistance, player.y + cameraHeight, player.z - Math.cos(cameraRotationX) * cameraDistance);
    camera.lookAt(player.x, player.y + 1, player.z);
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
