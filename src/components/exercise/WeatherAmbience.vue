<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { skyTheme } from '@/composables/useSkyTheme'

const canvasRef = ref(null)
let context = null
let frameId = 0
let particles = []
let width = 0
let height = 0
let tick = 0

const random = (min, max) => min + Math.random() * (max - min)

const makeParticle = (theme) => {
  if (theme === 'rain') {
    return {
      x: random(-100, width),
      y: random(-height, 0),
      length: random(12, 26),
      speed: random(12, 20),
      drift: random(2, 4),
      alpha: random(0.35, 0.75),
      width: random(1.2, 2),
    }
  }
  if (theme === 'snow') {
    return {
      x: random(0, width),
      y: random(-height, 0),
      radius: random(1.5, 4),
      speed: random(0.5, 1.5),
      sway: random(0.4, 1.2),
      phase: random(0, Math.PI * 2),
      alpha: random(0.6, 0.95),
    }
  }
  if (theme === 'clouds') {
    return {
      x: random(-300, width),
      y: random(height * 0.05, height * 0.5),
      radius: random(90, 200),
      speed: random(0.15, 0.4),
      alpha: random(0.35, 0.6),
    }
  }
  return {
    x: random(0, width),
    y: random(0, height),
    radius: random(1, 3),
    speed: random(0.15, 0.5),
    phase: random(0, Math.PI * 2),
    alpha: random(0.2, 0.6),
  }
}

const particleCount = (theme) => {
  if (theme === 'rain') {
    return 160
  }
  if (theme === 'snow') {
    return 110
  }
  if (theme === 'clouds') {
    return 7
  }
  if (theme === 'clear' || theme === 'hot') {
    return 40
  }
  return 0
}

const resetParticles = () => {
  const theme = skyTheme.value
  particles = []
  for (let index = 0; index < particleCount(theme); index += 1) {
    const particle = makeParticle(theme)
    if (theme === 'rain' || theme === 'snow') {
      particle.y = random(0, height)
    }
    particles.push(particle)
  }
}

const drawGlow = (color) => {
  const glow = context.createRadialGradient(
    width * 0.85,
    height * 0.08,
    0,
    width * 0.85,
    height * 0.08,
    Math.max(width, height) * 0.45,
  )
  const pulse = 0.85 + Math.sin(tick / 60) * 0.15
  glow.addColorStop(0, `rgba(${color}, ${0.55 * pulse})`)
  glow.addColorStop(0.35, `rgba(${color}, ${0.18 * pulse})`)
  glow.addColorStop(1, `rgba(${color}, 0)`)
  context.fillStyle = glow
  context.fillRect(0, 0, width, height)
}

const drawFrame = () => {
  const theme = skyTheme.value
  context.clearRect(0, 0, width, height)
  tick += 1

  if (theme === 'rain') {
    context.lineCap = 'round'
    particles.forEach((drop) => {
      context.strokeStyle = `rgba(59, 130, 246, ${drop.alpha})`
      context.lineWidth = drop.width
      context.beginPath()
      context.moveTo(drop.x, drop.y)
      context.lineTo(drop.x - drop.drift, drop.y + drop.length)
      context.stroke()
      drop.y += drop.speed
      drop.x -= drop.drift * 0.6
      if (drop.y > height + 30 || drop.x < -40) {
        drop.y = random(-80, -10)
        drop.x = random(0, width + 100)
      }
    })
    return
  }

  if (theme === 'snow') {
    particles.forEach((flake) => {
      context.fillStyle = `rgba(255, 255, 255, ${flake.alpha})`
      context.beginPath()
      context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
      context.fill()
      flake.y += flake.speed
      flake.x += Math.sin(tick / 50 + flake.phase) * flake.sway * 0.4
      if (flake.y > height + 10) {
        flake.y = -10
        flake.x = random(0, width)
      }
    })
    return
  }

  if (theme === 'clouds') {
    particles.forEach((cloud) => {
      const gradient = context.createRadialGradient(
        cloud.x,
        cloud.y,
        0,
        cloud.x,
        cloud.y,
        cloud.radius,
      )
      gradient.addColorStop(0, `rgba(255, 255, 255, ${cloud.alpha})`)
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      context.fillStyle = gradient
      context.beginPath()
      context.ellipse(cloud.x, cloud.y, cloud.radius, cloud.radius * 0.55, 0, 0, Math.PI * 2)
      context.fill()
      cloud.x += cloud.speed
      if (cloud.x - cloud.radius > width) {
        cloud.x = -cloud.radius
        cloud.y = random(height * 0.05, height * 0.5)
      }
    })
    return
  }

  if (theme === 'clear' || theme === 'hot') {
    drawGlow(theme === 'hot' ? '251, 146, 60' : '253, 224, 71')
    particles.forEach((spark) => {
      const twinkle = 0.5 + Math.sin(tick / 30 + spark.phase) * 0.5
      context.fillStyle = `rgba(255, 255, 255, ${spark.alpha * twinkle})`
      context.beginPath()
      context.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2)
      context.fill()
      spark.y -= spark.speed
      if (spark.y < -5) {
        spark.y = height + 5
        spark.x = random(0, width)
      }
    })
  }
}

const loop = () => {
  drawFrame()
  frameId = window.requestAnimationFrame(loop)
}

const resize = () => {
  width = window.innerWidth
  height = window.innerHeight
  canvasRef.value.width = width
  canvasRef.value.height = height
  resetParticles()
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  context = canvasRef.value.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
  if (!reducedMotion) {
    loop()
  }
})

onUnmounted(() => {
  window.cancelAnimationFrame(frameId)
  window.removeEventListener('resize', resize)
})

watch(skyTheme, () => {
  resetParticles()
  if (reducedMotion) {
    drawFrame()
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="weather-ambience"></canvas>
</template>

<style scoped>
.weather-ambience {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}
</style>
