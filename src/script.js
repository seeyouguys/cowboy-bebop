import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import {OutlineEffect, PointLightHelper} from "three/examples/jsm/effects/OutlineEffect";


// Загрузка текстур
const textureLoader = new THREE.TextureLoader()
// const normalTexture = textureLoader.load('/normal-map.png')
const starSprite = textureLoader.load( '/disc.png' );

const canvas = document.querySelector("canvas.webgl"); // Canvas
const scene = new THREE.Scene(); // Scene
// const gui = new dat.GUI() // Графический дебаггер

// В этом объекте хранятся все материалы
const materials = {
    changeMe: new THREE.MeshLambertMaterial(),
    star: new THREE.PointsMaterial({
        size: .1,
        map: starSprite,
        alphaTest: 0.2, 
        transparent: true, 
        color: 0xffff00
    }),
    hood: new THREE.MeshLambertMaterial({
        color: 0xD65556,
    }),
    interior: new THREE.MeshToonMaterial({
        color: 0x3A3D30,
    }),
    handle: new THREE.MeshToonMaterial({
        color: 0x23262A,
    }),
    frame: new THREE.MeshToonMaterial({
        color: 0x9a9a9b,
    }),
    bulb: new THREE.MeshToonMaterial({
        color: 0x531924,
    }),
}

const gui = new dat.GUI()

const displayGroup = new THREE.Group()

// ободок дисплея
const wheelGeom = new THREE.TorusGeometry(0.75, 0.05, 16, 100)
const wheel = new THREE.Mesh(wheelGeom, materials.interior)
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

const panelMesh = new THREE.Mesh(panelGeometry, materials.interior)
panelMesh.scale.set(0.15, 0.1, 0.1)
panelMesh.position.set(0, 0, -.1)

displayGroup.add(panelMesh)

// лампочки
const bulbGeom = new THREE.CylinderGeometry(.08, .08, .1, 18, 1)
const bulbMesh = new THREE.Mesh(bulbGeom, materials.bulb)
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
const handleMesh = new THREE.Mesh(handleGeom, materials.handle)
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
const handleBoxMesh = new THREE.Mesh(handleBoxGeom, materials.interior)
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

const hoodMesh = new THREE.Mesh(hoodGeom, materials.hood)
hoodMesh.rotateX(-Math.PI / 2)
hoodMesh.position.set(0, -2.3, 0)

scene.add(hoodMesh)

// оконная рама
const frameGroup = new THREE.Group()

const frameGeom = new THREE.TorusGeometry(2, .15, 16, 20, Math.PI / 2)
const frameMesh = new THREE.Mesh(frameGeom, materials.frame)
frameMesh.rotateY(Math.PI / 2)
frameMesh.position.set(-1.8, -1, 2.1)

const frameMesh2 = frameMesh.clone()
frameMesh2.position.setX(1.8)

frameGroup.add(frameMesh, frameMesh2)
scene.add(frameGroup)


// Particles
const particlesGeom = new THREE.BufferGeometry();
const vertices = [];

for ( let i = 0; i < 3000; i ++ ) {

    // эти строки располагают точку в случайном месте поверхности цилиндра.
    const R = 5
    const x = 10 * Math.random() - 5
    const sign = Math.random() < .5 ? 1 : -1 // формула следует из уравнения окружности
    const y = Math.sqrt(R * R - x * x) * sign

    const z = 30 * Math.random() - 30

    vertices.push( x, y, z );

    for ( let j = 0 ; j < 5 ; j+=1) vertices.push(x, y, z-j / 10)

}

particlesGeom.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
const particles = new THREE.Points( particlesGeom, materials.star );

const particles2 = particles.clone()
particles2.position.setZ(-30)

scene.add( particles, particles2)


// Lights
const pointLight = new THREE.PointLight(0xffffff, 1.5, 8)
pointLight.position.set(0, 2.2, -1);

const pointLight2 = new THREE.PointLight(0xffffff, 0.2);
pointLight2.position.set(0, 4, 5.5);

scene.add(pointLight, pointLight2)

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

  outline.setSize(sizes.width, sizes.height)
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  85,
  sizes.width / sizes.height,
  0.1,
  30
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

// OutlineEffect
const outline = new OutlineEffect(renderer, {
    defaultThickness: .01,
})


/**
 * Animate
 */

// let mouseX = 0, mouseY = 0
// document.body.addEventListener('pointermove', e => {
//     mouseX = e.clientX - window.innerWidth / 2;
//     mouseY = e.clientY - window.innerHeight / 2;
// })

// const clock = new THREE.Clock();

const tick = () => {
    // Update objects
    // camera.lookAt( moleculePivot.position );

    // const elapsedTime = clock.getElapsedTime()
    const SPEED = .25
    particles.position.z += SPEED
    particles2.position.z += SPEED

    // звезды расположены на 2 цилиндрах.
    // цилиндр движется на камеру.
    // когда он выходит за пределы видимости камеры, его откидывает обратно в начало.
    // так, подменяя друг друга, они создают бесшовную бесконечную анимацию.
    if (particles.position.z  > 30) particles.position.setZ(-30)
    if (particles2.position.z  > 30) particles2.position.setZ(-30)


    // Update Orbital Controls
    controls.update();

    // Render
    renderer.render(scene, camera);
    outline.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
