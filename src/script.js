import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import * as dat from 'dat.gui'
import { Line2, LineGeometry, LineMaterial } from 'three-fatline'

// Загрузка текстур
const textureLoader = new THREE.TextureLoader()
const normalTexture = textureLoader.load('/normal-map.png')
const sprite = textureLoader.load( '/disc.png' );

const canvas = document.querySelector('canvas.webgl') // Canvas
const scene = new THREE.Scene() // Scene
// const gui = new dat.GUI() // Графический дебаггер

// В этом объекте хранятся все материалы
const materials = {
    materialH : new THREE.MeshStandardMaterial({
        metalness: .0,
        roughness: .0,
        color: 0xABB2BF,
        normalMap: normalTexture
    }),
    materialN : new THREE.MeshStandardMaterial({
        metalness: .0,
        roughness: .0,
        color: 0x61afef,
        normalMap: normalTexture
    }),
    materialS : new THREE.MeshStandardMaterial({
        metalness: .0,
        roughness: .0,
        color: 0xE5c07b,
        normalMap: normalTexture
    }),
    materialC : new THREE.MeshStandardMaterial({
        metalness: .0,
        roughness: .0,
        color: 0x282c34,
        normalMap: normalTexture
    }),
    materialO : new THREE.MeshStandardMaterial({
        metalness: .0,
        roughness: .0,
        color: 0xE06C75,
        normalMap: normalTexture
    }),
    matLine : new LineMaterial({
        color: 0xABB2BF,
        linewidth: 12, // px
        resolution: new THREE.Vector2(640, 480) // resolution of the viewport
    }),
    particlesMat: new THREE.PointsMaterial({
        size: .07,
        map: sprite,
        alphaTest: 0.2, 
        transparent: true, 
        color: 0x000 
    })
}

// Класс атома при инициализации создает сферу в переданных координатах и добавляет ее в группу.
// Размер сферы и ее материал определяются типом атома.
// .connect( atom1, atom2, atom3 ) - проводит линию от этого атома до переданных
class Atom {
    constructor(type, coords, group) {
        //выбрать материал и размер в замисимости от типа атома
        const material = materials['material' + type.toUpperCase()]
        let size
        if      (type === 'H') { size = .2 }
        else if (type === 'O') { size = .3 }
        else if (type === 'N') { size = .35 }
        else if (type === 'S') { size = .4 }
        else if (type === 'C') { size = .3 }

        const atomGeom = new THREE.SphereGeometry(size, 13, 13)
        
        this.coords = Object.values(coords)
        this.group = group
          
        this.atomMesh = new THREE.Mesh( atomGeom, material )
        this.atomMesh.position.set(...this.coords)

        this.group.add( this.atomMesh )
    }

    // проводит линию от этого атома до переданных
    connect( ...atoms ) {

        atoms.forEach(atom => {
            const lineGeom = new LineGeometry()
            lineGeom.setPositions( [].concat(this.coords, atom.coords) ) // [ x1, y1, z1,  x2, y2, z2, ... ] format

            const myLine = new Line2(lineGeom, materials.matLine);
            this.group.add( myLine )

        })

        return this
    }
}


// Структура молекулы
const len = .5 // задает длину связей между атомами

const molecule = new THREE.Group() // группа, в которой хранятся атомы и связи

new Atom('H', { x: 0, y: 0, z: 0 }, molecule)
.connect( 
    new Atom('O', { x: len , y: -len , z: 0 }, molecule)
.connect( 
    new Atom('S', { x: 2*len, y: 0, z: 0 }, molecule)
.connect( 
    new Atom('O', { x: 2*len, y: len, z: len }, molecule),
    new Atom('O', { x: 2*len, y: len, z: -len }, molecule),
    new Atom('C', { x: 3*len, y: -len, z: 0 }, molecule)
.connect(
    new Atom('H', { x: 3*len, y: -2*len, z: len }, molecule),
    new Atom('H', { x: 3*len, y: -2*len, z: -len }, molecule),
    new Atom('C', { x: 4*len, y: 0, z: 0 }, molecule)
.connect(
    new Atom('H', { x: 4*len, y: len, z: len }, molecule),
    new Atom('H', { x: 4*len, y: len, z: -len }, molecule),
    new Atom('N', { x: 5*len, y: -len, z: 0 }, molecule)
.connect(
    new Atom('H', { x: 6*len, y: 0, z: 0 }, molecule),
    new Atom('H', { x: 6*len, y: -2*len, z: 0 }, molecule)
))))))

scene.add( molecule )

molecule.position.x = -1.5

// добавить pivot (anchor, origin) point для удобного вращения молекулы
const moleculePivot = new THREE.Object3D();
moleculePivot.add( molecule );
scene.add( moleculePivot );
moleculePivot.rotation.z = Math.PI / 2


// Particles
const particlesGeom = new THREE.BufferGeometry();
const vertices = [];

for ( let i = 0; i < 2000; i ++ ) {

    const x = 10 * Math.random() - 5;
    const y = 10 * Math.random() - 5;
    const z = 10 * Math.random() - 5;

    vertices.push( x, y, z );

}

particlesGeom.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
const particles = new THREE.Points( particlesGeom, materials.particlesMat );
scene.add( particles );

// Lights
RectAreaLightUniformsLib.init();
const rectLight1 = new THREE.RectAreaLight( 0x68D92D, 10, 3, 7 );
rectLight1.position.set( -3.25, 0, -3);
rectLight1.rotation.y = Math.PI
scene.add( rectLight1 );
scene.add( new RectAreaLightHelper( rectLight1 ) );

const rectLight2 = new THREE.RectAreaLight( 0xffffff, 5, 3, 7 );
rectLight2.position.set( 0, 0, -3 );
scene.add( rectLight2 );
rectLight2.rotation.y = Math.PI
scene.add( new RectAreaLightHelper( rectLight2 ) );

const rectLight3 = new THREE.RectAreaLight( 0x49C3E1, 5, 3, 7 );
rectLight3.position.set( 3.25, 0, -3 );
scene.add( rectLight3 );
rectLight3.rotation.y = Math.PI
scene.add( new RectAreaLightHelper( rectLight3 ) );

const pointLight = new THREE.PointLight(0xffffff, 0.1)
pointLight.position.set(2, 3, 4)
pointLight.intensity = .1
scene.add(pointLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 3
scene.add(camera)

// OrbitControls, если раскоментировать, то можно вращать камеру мышкой
// ( P.S но лучше не портить хорошую композицию )
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Animate
 */

let mouseX = 0, mouseY = 0
document.body.addEventListener('pointermove', e => {
    mouseX = e.clientX - window.innerWidth / 2;
    mouseY = e.clientY - window.innerHeight / 2;
})

const clock = new THREE.Clock()

const tick = () => {

    // Update objects
    particles.rotation.x += ( mouseX - particles.rotation.x ) * .000005
    particles.rotation.y += ( - mouseY - particles.rotation.y ) * .000005
    camera.lookAt( moleculePivot.position );

    const elapsedTime = clock.getElapsedTime()
    moleculePivot.rotation.y = .3 * elapsedTime

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
