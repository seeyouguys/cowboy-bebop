import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

// Загрузка текстур
// const textureLoader = new THREE.TextureLoader()
// const normalTexture = textureLoader.load('/normal-map.png')

const canvas = document.querySelector("canvas.webgl"); // Canvas
const scene = new THREE.Scene(); // Scene
// const gui = new dat.GUI() // Графический дебаггер

// В этом объекте хранятся все материалы
const materials = {
};

const gui = new dat.GUI();

// Lights
const pointLight = new THREE.PointLight(0xffffff, 0.1);
pointLight.position.set(2, 3, 4);
pointLight.intensity = 1;
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 3)
scene.add(camera);

// OrbitControls, если раскоментировать, то можно вращать камеру мышкой
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

// let mouseX = 0, mouseY = 0
// document.body.addEventListener('pointermove', e => {
//     mouseX = e.clientX - window.innerWidth / 2;
//     mouseY = e.clientY - window.innerHeight / 2;
// })

const clock = new THREE.Clock();

const tick = () => {
  // Update objects
  // camera.lookAt( moleculePivot.position );

  // const elapsedTime = clock.getElapsedTime()
  // moleculePivot.rotation.y = .3 * elapsedTime

  // Update Orbital Controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
