<template>
    <div
        class="icon"
        :style="{
            background: backgroundGradient,
            boxShadow: boxShadow
        }"
    >
        {{ initial }}
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
    text: {
        type: String,
        required: true
    }
})

const initial = computed(() => {
    return props.text?.trim()?.charAt(0)?.toUpperCase() || '?'
})

// 随机颜色生成器
function getRandomColorPair(): [string, string] {
    const hues = [0, 30, 60, 120, 180, 210, 270, 300]
    const h = hues[Math.floor(Math.random() * hues.length)]
    const s = 60 + Math.random() * 20
    const l1 = 60 + Math.random() * 10
    const l2 = 45 + Math.random() * 10
    return [`hsl(${h}, ${s}%, ${l1}%)`, `hsl(${h + 10}, ${s - 10}%, ${l2}%)`]
}

const [color1, color2] = getRandomColorPair()

const backgroundGradient = `linear-gradient(145deg, ${color1}, ${color2})`

const boxShadow = `
    0 2px 5px rgba(0, 0, 0, 0.1),
    inset 0 1px 1px rgba(255, 255, 255, 0.3)
  `
</script>

<style scoped>
.icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    font-weight: bold;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    user-select: none;
    transition: transform 0.2s ease;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}
.icon:hover {
    transform: scale(1.05);
}
</style>
