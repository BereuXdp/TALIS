import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

/* Busto de Platão em 3D (escaneamento de museu, threedscans.com).
   Luz de cima à direita, como um feixe; gira de leve seguindo o mouse. */
function Plato({ pointer }) {
  const { scene } = useGLTF('/models/plato.glb')
  const ref = useRef()

  const model = useMemo(() => {
    const root = scene.clone(true)
    const material = new THREE.MeshStandardMaterial({ color: '#ece8e1', roughness: 0.58, metalness: 0.02 })
    root.traverse((o) => {
      if (o.isMesh) {
        o.geometry = o.geometry.clone()
        o.geometry.computeVertexNormals() // o escaneamento não traz normais
        o.material = material
      }
    })
    // escala para caber: ~2,4 unidades de altura
    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const s = 2.05 / Math.max(size.x, size.y, size.z)
    root.scale.setScalar(s)
    const c = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3())
    root.position.sub(c)
    return root
  }, [scene])

  useFrame((state, dt) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    // segue o mouse com suavidade + respiração lenta
    const ty = Math.PI - 0.35 + pointer.current.x * 0.45 + Math.sin(t * 0.25) * 0.08 // o escaneamento vem de costas
    const tx = pointer.current.y * 0.12
    g.rotation.y += (ty - g.rotation.y) * Math.min(1, dt * 2.2)
    g.rotation.x += (tx - g.rotation.x) * Math.min(1, dt * 2.2)
    g.position.y = Math.sin(t * 0.6) * 0.03
  })

  return (
    <group ref={ref}>
      <primitive object={model} />
    </group>
  )
}

export default function Bust3D({ onReady }) {
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e) => {
      pointer.current.x = (e.clientX / innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / innerHeight) * 2 - 1
    }
    addEventListener('pointermove', h, { passive: true })
    return () => removeEventListener('pointermove', h)
  }, [])

  return (
    <Canvas
      className="bust-canvas"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.1, 4.1], fov: 34 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onCreated={() => onReady?.()}
    >
      <ambientLight intensity={0.05} />
      {/* feixe principal, quente, de cima à direita (como a foto de referência) */}
      <spotLight position={[3.2, 4.5, 2.5]} angle={0.5} penumbra={0.8} intensity={60} color="#fff0d8" />
      {/* recorte frio atrás, para destacar o contorno */}
      <directionalLight position={[-3, 1.5, -3]} intensity={2.6} color="#c9d2e0" />
      <directionalLight position={[0, -2, 2]} intensity={0.12} color="#ffffff" />
      <Suspense fallback={null}>
        <Plato pointer={pointer} />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload('/models/plato.glb')
