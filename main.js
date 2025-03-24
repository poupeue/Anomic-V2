const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Fullscreen & resize
function resizeCanvas() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Player model (Sphere)
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const playerModel = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(playerModel);

// Player variables
const player = {
    x: 0, y: 1.5, z: 5, 
    speed: 0.1, 
    velocity: new THREE.Vector3(0, 0, 0), 
    isJumping: false
};
const keys = {};

// Disable right-click menu
window.addEventListener("contextmenu", (event) => event.preventDefault());

// Key listeners
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

// Mouse movement variables
let isMouseDown = false;
let cameraYaw = 0;
let cameraPitch = 0;

// Mouse listeners for looking around
window.addEventListener("mousedown", (e) => {
    if (e.button === 2) isMouseDown = true; // Right click to look around
});
window.addEventListener("mouseup", () => isMouseDown = false);
window.addEventListener("mousemove", (e) => {
    if (isMouseDown) {
        cameraYaw -= e.movementX * 0.002;
        cameraPitch -= e.movementY * 0.002;
        cameraPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraPitch)); // Prevent flipping
    }
});

// Movement system relative to camera direction
function updatePlayer() {
    let moveDirection = new THREE.Vector3();
    let forward = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw));
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
    let lookAtPos = new THREE.Vector3(
        player.x + Math.sin(cameraYaw),
        player.y + 2 + Math.sin(cameraPitch),
        player.z + Math.cos(cameraYaw)
    );
    camera.lookAt(lookAtPos);
}

// Ground
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
