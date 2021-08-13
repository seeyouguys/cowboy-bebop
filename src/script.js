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
  changeMe: new THREE.MeshLambertMaterial(),
}

const gui = new dat.GUI()

const displayGroup = new THREE.Group()

// ободок дисплея
const wheelGeom = new THREE.TorusGeometry(0.75, 0.05, 16, 100)
const wheel = new THREE.Mesh(wheelGeom, materials.changeMe)
wheel.position.set(0, -.3, 0)
displayGroup.add(wheel)

// панелька дисплея
const panelShape = new THREE.Shape()
    .moveTo(-5, -5)
    .lineTo(-5, 4)
    .quadraticCurveTo(-5, 5, -4, 5)
    .lineTo(4, 5)
    .quadraticCurveTo(5, 5, 5, 4)
    .lineTo(5, -5)
    .lineTo(-5, -5)

const panelGeometry = new THREE.ExtrudeGeometry(panelShape, {
  depth: 1,
  bevelEnabled: false,
})

const panelMesh = new THREE.Mesh(panelGeometry, materials.changeMe)
panelMesh.scale.set(0.15, 0.1, 0.1)
panelMesh.position.set(0, 0, -.1)

displayGroup.add(panelMesh)

// лампочки
const bulbGeom = new THREE.CylinderGeometry(.08, .08, .1, 18, 1)
const bulbMesh = new THREE.Mesh(bulbGeom, materials.changeMe)
bulbMesh.rotation.x = Math.PI / 2
bulbMesh.position.set(.63, .38, 0)
const bulbMesh2 = bulbMesh.clone()
bulbMesh2.position.set(-.63, .38, 0)

displayGroup.add(bulbMesh, bulbMesh2)


scene.add(displayGroup)
displayGroup.position.set(0, -.95, 2)
displayGroup.rotation.set(-.4, 0, 0)

// ручка штурвала
const handleGroup = new THREE.Group()
const handlePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 2, 0),
    new THREE.Vector3(1, 5, 0),
    new THREE.Vector3(-3, 5, 3),
    new THREE.Vector3(-3, 3.5, 3),
    new THREE.Vector3(-1, 3.5, 0)
])

const handleGeom = new THREE.TubeGeometry(handlePath, 40, .35, 16, false)
const handleMesh = new THREE.Mesh(handleGeom, materials.changeMe)
handleMesh.scale.set(.3, .3, .3)
handleGroup.add(handleMesh)

// коробка под ручкой.
// на ней мне нужна фаска, поэтому использую ExtrudeGeometry, а не BoxGeometry
const handleBoxPath = new THREE.Shape()
handleBoxPath
    .moveTo(0, 0)
    .lineTo(0, 1)
    .lineTo(1, 1)
    .lineTo(1, 0)
    .lineTo(0, 0)

const handleBoxGeom = new THREE.ExtrudeGeometry(handleBoxPath, {
	steps: 1,
	depth: 1.5,
	bevelEnabled: true,
	bevelThickness: .2,
	bevelSize: .2,
	bevelSegments: 3
})
const handleBoxMesh = new THREE.Mesh(handleBoxGeom, materials.changeMe)
handleBoxMesh.scale.set(.5, .5, .5)
handleBoxMesh.position.set(-.4, 0, .7)
handleBoxMesh.rotateY(Math.PI/2)
handleGroup.add(handleBoxMesh)


handleGroup.position.set(-1.5, -1.5, 1)
// правая ручка
const handleGroup2 = handleGroup.clone()
handleGroup2.scale.set(-1, 1, 1)
handleGroup2.position.set(1.5, -1.5, 1)
scene.add(handleGroup, handleGroup2)

// капот
const hoodPath = new THREE.Shape()
    .moveTo(-2, 0)
    .quadraticCurveTo(0, 1, 2, 0)
    .lineTo(.3, 5)
    .lineTo(-.3, 5)

const hoodGeom = new THREE.ExtrudeGeometry(hoodPath, {
	steps: 1,
	depth: 1.5,
	bevelEnabled: true,
	bevelThickness: .2,
	bevelSize: .8,
	bevelSegments: 2
})

const hoodMesh = new THREE.Mesh(hoodGeom, materials.changeMe)
hoodMesh.rotateX(-Math.PI / 2)
hoodMesh.position.set(0, -2.3, 0)

scene.add(hoodMesh)

// оконная рама
const frameGroup = new THREE.Group()

const frameGeom = new THREE.TorusGeometry(2, .15, 16, 20, Math.PI / 2)
const frameMesh = new THREE.Mesh(frameGeom, materials.changeMe)
frameMesh.rotateY(Math.PI / 2)
frameMesh.position.set(-1.8, -1, 2.1)

const frameMesh2 = frameMesh.clone()
frameMesh2.position.setX(1.8)

frameGroup.add(frameMesh, frameMesh2)
scene.add(frameGroup)

// Lights
const pointLight = new THREE.PointLight(0xffffff, 0.1);
pointLight.position.set(2, 3, 4);
pointLight.intensity = 1;
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
  width: 950,
  height: 700,
};

window.addEventListener("resize", () => {
  // Update sizes
  // sizes.width = window.innerWidth
  // sizes.height = window.innerHeight

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
  alpha: false,
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
