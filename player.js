import * as THREE from "https://esm.sh/three@0.160.0";
import { PointerLockControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

const PLAYER_RADIUS = 0.45;
const PLAYER_HALF_H = 0.5;
const SWIM_ACCEL = 26;
const MAX_SPEED = 9;
const DRAG = 3.2;
const MIN_Y = 0.6;
const MAX_Y = 10.2;

export function createPlayer(camera, domElement, colliders) {
  const controls = new PointerLockControls(camera, domElement);
  camera.position.set(0, 3.5, 15);

  const keys = {
    forward: false,
    back: false,
    left: false,
    right: false,
    up: false,
    down: false,
  };
  const velocity = new THREE.Vector3();
  const forwardDir = new THREE.Vector3();
  const rightDir = new THREE.Vector3();
  const accel = new THREE.Vector3();
  const worldUp = new THREE.Vector3(0, 1, 0);

  window.addEventListener("keydown", (e) => setKey(e.code, true));
  window.addEventListener("keyup", (e) => setKey(e.code, false));

  function setKey(code, state) {
    switch (code) {
      case "KeyW":
      case "ArrowUp":
        keys.forward = state;
        break;
      case "KeyS":
      case "ArrowDown":
        keys.back = state;
        break;
      case "KeyA":
      case "ArrowLeft":
        keys.left = state;
        break;
      case "KeyD":
      case "ArrowRight":
        keys.right = state;
        break;
      case "Space":
        keys.up = state;
        break;
      case "ShiftLeft":
      case "KeyC":
        keys.down = state;
        break;
    }
  }

  function collides(x, y, z) {
    const box = new THREE.Box3(
      new THREE.Vector3(
        x - PLAYER_RADIUS,
        y - PLAYER_HALF_H,
        z - PLAYER_RADIUS,
      ),
      new THREE.Vector3(
        x + PLAYER_RADIUS,
        y + PLAYER_HALF_H,
        z + PLAYER_RADIUS,
      ),
    );
    for (const c of colliders) if (box.intersectsBox(c)) return true;
    return false;
  }

  function update(delta) {
    if (!controls.isLocked) return;

    camera.getWorldDirection(forwardDir);
    rightDir.crossVectors(forwardDir, worldUp).normalize();

    accel.set(0, 0, 0);
    if (keys.forward) accel.add(forwardDir);
    if (keys.back) accel.sub(forwardDir);
    if (keys.right) accel.add(rightDir);
    if (keys.left) accel.sub(rightDir);
    if (keys.up) accel.y += 1;
    if (keys.down) accel.y -= 1;
    if (accel.lengthSq() > 0) accel.normalize().multiplyScalar(SWIM_ACCEL);

    velocity.addScaledVector(accel, delta);
    velocity.multiplyScalar(Math.max(0, 1 - DRAG * delta));
    if (velocity.length() > MAX_SPEED) velocity.setLength(MAX_SPEED);

    const cur = camera.position;
    const nx = cur.x + velocity.x * delta;
    const ny = THREE.MathUtils.clamp(cur.y + velocity.y * delta, MIN_Y, MAX_Y);
    const nz = cur.z + velocity.z * delta;

    if (!collides(nx, cur.y, cur.z)) cur.x = nx;
    else velocity.x = 0;
    if (!collides(cur.x, ny, cur.z)) cur.y = ny;
    else velocity.y = 0;
    if (!collides(cur.x, cur.y, nz)) cur.z = nz;
    else velocity.z = 0;

    cur.x = THREE.MathUtils.clamp(cur.x, -19.2, 19.2);
    cur.z = THREE.MathUtils.clamp(cur.z, -19.2, 19.2);
  }

  return { controls, update };
}
