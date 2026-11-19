<script setup lang="ts">
/**
 * Perspective 3D tilt card that follows the pointer, with a glare highlight.
 * Adapted from Inspira UI's FloatingCard (MIT, https://inspira-ui.com),
 * re-implemented with a small requestAnimationFrame spring instead of motion-v.
 */
import { onBeforeUnmount, ref } from "vue";

const props = withDefaults(
  defineProps<{
    rotateDepth?: number;
    translateDepth?: number;
    radiusClass?: string;
  }>(),
  { rotateDepth: 17.5, translateDepth: 20, radiusClass: "rounded-2xl" },
);

const rootRef = ref<HTMLElement | null>(null);
const cardRef = ref<HTMLElement | null>(null);
const glareRef = ref<HTMLElement | null>(null);

interface Spring {
  value: number;
  velocity: number;
  target: number;
  stiffness: number;
  damping: number;
}

const createSpring = (value: number, stiffness: number, damping: number): Spring => ({
  value,
  velocity: 0,
  target: value,
  stiffness,
  damping,
});

// x / y: pointer position relative to the card center, in [-0.5, 0.5].
const springs = {
  x: createSpring(0, 120, 14),
  y: createSpring(0, 120, 14),
  scale: createSpring(1, 260, 22),
  z: createSpring(0, 260, 22),
  glare: createSpring(0, 220, 24),
};

let frame = 0;
let lastTime = 0;

function render() {
  const { x, y, scale, z, glare } = springs;
  const rotate = props.rotateDepth * 2;
  const translate = props.translateDepth * 2;

  if (cardRef.value) {
    cardRef.value.style.transform =
      `translateX(${x.value * translate}px) translateY(${-y.value * translate}px) translateZ(${z.value}px) ` +
      `rotateX(${y.value * rotate}deg) rotateY(${-x.value * rotate}deg) scale(${scale.value})`;
  }
  if (glareRef.value) {
    glareRef.value.style.opacity = String(Math.max(0, glare.value));
    glareRef.value.style.background =
      `radial-gradient(circle at ${(x.value + 0.5) * 100}% ${(y.value + 0.5) * 100}%, ` +
      "rgba(255, 255, 255, 0.9) 10%, rgba(255, 255, 255, 0.75) 20%, rgba(255, 255, 255, 0) 80%)";
  }
}

function step(time: number) {
  const dt = Math.min((time - (lastTime || time)) / 1000, 1 / 30);
  lastTime = time;

  let moving = false;
  for (const spring of Object.values(springs)) {
    const force = -spring.stiffness * (spring.value - spring.target) - spring.damping * spring.velocity;
    spring.velocity += force * dt;
    spring.value += spring.velocity * dt;
    if (Math.abs(spring.value - spring.target) > 0.001 || Math.abs(spring.velocity) > 0.001) {
      moving = true;
    } else {
      spring.value = spring.target;
      spring.velocity = 0;
    }
  }
  render();

  if (moving) {
    frame = requestAnimationFrame(step);
  } else {
    frame = 0;
    lastTime = 0;
  }
}

function animate() {
  if (!frame) frame = requestAnimationFrame(step);
}

function canTilt(event: PointerEvent) {
  return event.pointerType !== "touch" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function handlePointerEnter(event: PointerEvent) {
  if (!canTilt(event)) return;
  springs.scale.target = 1.05;
  springs.z.target = 50;
  springs.glare.target = 0.6;
  animate();
}

function handlePointerMove(event: PointerEvent) {
  if (!canTilt(event) || !rootRef.value) return;
  const rect = rootRef.value.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  springs.x.target = (event.clientX - rect.left) / rect.width - 0.5;
  springs.y.target = (event.clientY - rect.top) / rect.height - 0.5;
  animate();
}

function resetCard() {
  springs.x.target = 0;
  springs.y.target = 0;
  springs.scale.target = 1;
  springs.z.target = 0;
  springs.glare.target = 0;
  animate();
}

onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>

<template>
  <div
    ref="rootRef"
    class="perspective-distant transform-3d"
    @pointerenter="handlePointerEnter"
    @pointermove="handlePointerMove"
    @pointerleave="resetCard"
    @pointercancel="resetCard"
  >
    <div
      ref="cardRef"
      class="relative"
      :class="radiusClass"
      :style="{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        boxShadow:
          'rgba(0, 0, 0, 0.01) 0px 520px 146px 0px, rgba(0, 0, 0, 0.04) 0px 333px 133px 0px, rgba(0, 0, 0, 0.26) 0px 83px 83px 0px, rgba(0, 0, 0, 0.29) 0px 21px 46px 0px',
      }"
    >
      <slot />
      <div
        ref="glareRef"
        class="pointer-events-none absolute inset-0 z-50 h-full w-full opacity-0 mix-blend-overlay"
        :class="radiusClass"
      />
    </div>
  </div>
</template>
