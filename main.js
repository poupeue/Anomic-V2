const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Make the canvas fullscreen
function resizeCanvas() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

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

// Disable right-click menu
window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

// Listen for key presses
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

// Camera rotation variables
let cameraRotationX = 0;
let cameraRotationY = 0;
let isMouseDown = false;
let prevMouseX = 0;
let prevMouseY = 0;

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

        cameraRotationX -= deltaX * 0.002;
        cameraRotationY -= deltaY * 0.002;

        cameraRotationY = Math.max(Math.min(cameraRotationY, Math.PI / 2), -Math.PI / 2);

        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
    }
});

// Movement system that follows camera direction
function updatePlayer() {
    let moveDirection = new THREE.Vector3();
    let forward = new THREE.Vector3(
        -Math.sin(cameraRotationX),
        0,
        -Math.cos(cameraRotationX)
    );
    let right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));

    if (keys["w"]) moveDirection.add(forward);
    if (keys["s"]) moveDirection.sub(forward);
    if (keys["a"]) moveDirection.sub(right);
    if (keys["d"]) moveDirection.add(right);

    if (moveDirection.length() > 0) {
        moveDirection.normalize();
        player.x += moveDirection.x * player.speed;
        player.z += moveDirection.z * player.speed;
    }

    // Gravity & Jumping
    if (player.y > 1.5 || player.isJumping) {
        player.velocity.y -= 0.01;
        player.y += player.velocity.y;
    }

    if (player.y <= 1.5) {
        player.y = 1.5;
        player.velocity.y = 0;
        player.isJumping = false;
    }

    playerModel.position.set(player.x, player.y, player.z);
    updateCamera();
}

// Update camera to follow player
function updateCamera() {
    camera.position.set(player.x, player.y + 2, player.z);
    camera.lookAt(player.x - Math.sin(cameraRotationX), player.y + 2, player.z - Math.cos(cameraRotationX));
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
