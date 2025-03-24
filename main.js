const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
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
};
const keys = {};

// Disable context menu (so right-click works for looking around)
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

// Camera control variables
let isMouseDown = false;
let cameraYaw = 0;   // horizontal rotation (in radians)
let cameraPitch = 0; // vertical rotation (we'll use this only for view, not for movement)

// Mouse listeners for right-click look
window.addEventListener("mousedown", (e) => {
  if (e.button === 2) isMouseDown = true;
});
window.addEventListener("mouseup", (e) => {
  if (e.button === 2) isMouseDown = false;
});
window.addEventListener("mousemove", (e) => {
  if (isMouseDown) {
    // Adjust yaw and pitch using the mouse movement.
    cameraYaw -= e.movementX * 0.002;
    cameraPitch -= e.movementY * 0.002;
    // Clamp pitch to prevent flipping
    cameraPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraPitch));
  }
});

// Update player movement using cameraYaw for direction
function updatePlayer() {
  let moveDirection = new THREE.Vector3(0, 0, 0);
  // Calculate a horizontal forward vector from cameraYaw.
  let forward = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw));
  // Right vector is perpendicular to forward.
  let right = new THREE.Vector3(-Math.cos(cameraYaw), 0, Math.sin(cameraYaw));

  if (keys["w"]) moveDirection.add(forward);
  if (keys["s"]) moveDirection.sub(forward);
  if (keys["a"]) moveDirection.sub(right);
  if (keys["d"]) moveDirection.add(right);

  if (moveDirection.length() > 0) {
    moveDirection.normalize();
    player.position.addScaledVector(moveDirection, player.speed);
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

  // Position the camera behind the player using cameraYaw.
  camera.position.x = player.position.x - Math.sin(cameraYaw) * cameraDistance;
  camera.position.z = player.position.z - Math.cos(cameraYaw) * cameraDistance;
  camera.position.y = player.position.y + cameraHeight;

  // Compute a lookAt point that factors in both yaw and pitch.
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
