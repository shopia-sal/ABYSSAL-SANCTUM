import * as THREE from "https://esm.sh/three@0.160.0";

const ORB_RADIUS = 0.13;
const ORB_SPEED = 16;
const DRAG = 1.6;
const BUOYANCY = 0.6;
const MAX_LIFE = 3.5;
const FADE_START = 2.6;
const MAX_ORBS = 50;

const ORB_COLORS = [0x2de6c9, 0x8b5cf6, 0xff6ec7, 0x7fffa0, 0x3a7ca5];

export function createShooter(scene, camera, onCountChange) {
  const orbs = [];
  const geo = new THREE.SphereGeometry(ORB_RADIUS, 12, 12);
  const dir = new THREE.Vector3();

  function shoot() {
    if (orbs.length >= MAX_ORBS) {
      const old = orbs.shift();
      scene.remove(old.mesh);
    }

    const color = ORB_COLORS[Math.floor(Math.random() * ORB_COLORS.length)];
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 2,
      roughness: 0.3,
      transparent: true,
      opacity: 0.95,
    });
    const mesh = new THREE.Mesh(geo, mat);

    camera.getWorldDirection(dir);
    mesh.position.copy(camera.position).addScaledVector(dir, 0.6);

    const glow = new THREE.PointLight(color, 1.6, 4.5);
    mesh.add(glow);

    scene.add(mesh);
    orbs.push({
      mesh,
      mat,
      glow,
      velocity: dir.clone().multiplyScalar(ORB_SPEED),
      life: 0,
    });

    if (onCountChange) onCountChange(orbs.length);
  }

  function update(delta) {
    for (let i = orbs.length - 1; i >= 0; i--) {
      const o = orbs[i];
      o.life += delta;

      o.velocity.y += BUOYANCY * delta;
      o.velocity.multiplyScalar(Math.max(0, 1 - DRAG * delta));
      o.mesh.position.addScaledVector(o.velocity, delta);

      if (o.life > FADE_START) {
        const t = 1 - (o.life - FADE_START) / (MAX_LIFE - FADE_START);
        o.mat.opacity = Math.max(0, t);
        o.glow.intensity = Math.max(0, 1.6 * t);
        o.mesh.scale.setScalar(Math.max(0.05, t));
      }

      if (o.life > MAX_LIFE) {
        scene.remove(o.mesh);
        orbs.splice(i, 1);
      }
    }
    if (onCountChange) onCountChange(orbs.length);
  }

  return { shoot, update };
}
