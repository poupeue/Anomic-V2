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

// Player model
const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const playerModel = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(playerModel);

// Player variables
const player = {
    position: new THREE.Vector3(0, 1.5, 5),
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
    if (e.button === 2) isMouseDown = true;
});
window.addEventListener("mouseup", () => isMouseDown = false);
window.addEventListener("mousemove", (e) => {
    if (isMouseDown) {
        cameraYaw -= e.movementX * 0.002;
        cameraPitch -= e.movementY * 0.002;
        cameraPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraPitch));
    }
});

// **Fix: Movement now aligns properly with camera direction**
function updatePlayer() {
    let moveDirection = new THREE.Vector3();
    let cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    
    // Create right vector from camera
    let rightVector = new THREE.Vector3();
    rightVector.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();

    // Forward and backward (aligned with camera)
    if (keys["w"]) moveDirection.add(cameraDirection);
    if (keys["s"]) moveDirection.sub(cameraDirection);

    // Strafe left and right
    if (keys["a"]) moveDirection.sub(rightVector);
    if (keys["d"]) moveDirection.add(rightVector);

    if (moveDirection.length() > 0) {
        moveDirection.normalize();
        player.position.addScaledVector(moveDirection, player.speed);
    }

    // Gravity & Jumping
    if (player.position.y > 1.5 || player.isJumping) {
        player.velocity.y -= 0.01;
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

// Update camera to follow player
function updateCamera() {
    camera.position.set(player.position.x, player.position.y + 2, player.position.z);
    let lookAtPos = new THREE.Vector3(
        player.position.x + Math.sin(cameraYaw),
        player.position.y + 2 + Math.sin(cameraPitch),
        player.position.z + Math.cos(cameraYaw)
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
