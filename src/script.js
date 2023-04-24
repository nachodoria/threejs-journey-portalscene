import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragmentShader from './shaders/fireflies/fragment.glsl'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragment.glsl'
/**
 * Base
 */


// Debug
const debugObject = {}
const gui = new dat.GUI({
    width: 400
})
debugObject.clearColor = '#191609'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


/**
 * Textures
 */
const bakedTexture = textureLoader.load("FinalImage.jpg")
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

/**
 * Object
 */

debugObject.portalColorStart = '#fdd635'
debugObject.portalColorEnd = '#e28e1d'

gui
    .addColor(debugObject, 'portalColorStart')
    .onChange(() => {
        portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
    })




const bakedMaterial = new THREE.MeshBasicMaterial({
    map: bakedTexture
})
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
const portalLightMaterial = new THREE.ShaderMaterial({
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader,
    uniforms:
    {
        uTime: { value: 0 },
        uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
        uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) },

    },

})

let model = null;
gltfLoader.load("/portal.glb",
    (gltf) => {


        const bakeMesh = gltf.scene.children.find((child) => child.name === 'baked')
        const portalLightMesh = gltf.scene.children.find((child) => child.name === 'portalLight')
        const poleLightAMesh = gltf.scene.children.find((child) => child.name === 'poleLightA')
        const poleLightBMesh = gltf.scene.children.find((child) => child.name === 'poleLightB')

        bakeMesh.material = bakedMaterial
        portalLightMesh.material = portalLightMaterial
        poleLightAMesh.material = poleLightMaterial
        poleLightBMesh.material = poleLightMaterial
        gltf.scene.scale.set(0.5, 0.5, 0.5)
        gltf.scene.position.set(0, 0, -1)



        scene.add(gltf.scene)

    },
    function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    },
    // called when loading has errors
    function (error) {

        console.log('An error happened');

    }
)



/**
 * Fireflies
 */
// Geometry
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 30
const positionArray = new Float32Array(firefliesCount * 3)
const scaleArray = new Float32Array(firefliesCount)

for (let i = 0; i < firefliesCount; i++) {
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
    positionArray[i * 3 + 1] = Math.random() * 1.5
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4
    scaleArray[i] = Math.random()

}
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))
firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
// Material
debugObject.firefliesColor = '#fdd635'

const firefliesMaterial = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    uniforms:
    {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 60 },
        uColor : {value: new THREE.Color(debugObject.firefliesColor)}
    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader
})
gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('firefliesSize')
// Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)

gui
    .addColor(debugObject, 'firefliesColor')
    .onChange(() => {
        firefliesMaterial   .uniforms.uColor.value.set(debugObject.firefliesColor)
    })

scene.add(fireflies)
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


    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
    firefliesMaterial.uniforms.uTime.value = elapsedTime
    portalLightMaterial.uniforms.uTime.value = elapsedTime



})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = -2.5

camera.position.y = 1.5

camera.position.z = -3

scene.add(camera)


// Base camera
// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = false
controls.maxPolarAngle = Math.PI / 2 - 0.1
controls.minAzimuthAngle = Math.PI / 2;
controls.maxAzimuthAngle = -Math.PI / 2;
controls.enablePan = false


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setClearColor(debugObject.clearColor)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    firefliesMaterial.uniforms.uTime.value = elapsedTime
    portalLightMaterial.uniforms.uTime.value = elapsedTime
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

}

tick()
