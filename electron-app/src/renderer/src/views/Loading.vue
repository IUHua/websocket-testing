<template>
    <div
        class="loading-container"
        ref="containerRef"
        :style="{
            position: 'fixed',
            left: `${current.x}px`,
            top: `${current.y}px`
        }"
    >
        <Vue3Lottie
            :animationData="loadingJson"
            :height="size.height"
            :width="size.width"
        />
        <div class="progress">
            <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Vue3Lottie } from 'vue3-lottie'
import loadingJson from '@renderer/assets/Lottie/loadingJson.json'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const containerRef = ref<HTMLElement | null>(null)
const current = ref({ x: 0, y: 0 })
const target = ref({ x: 0, y: 0 })
const size = ref({ width: 200, height: 200 })
const progress = ref(0)
const router = useRouter()
window.electron.ipcRenderer.on('ping', () => {
    console.log('pong')
})
let st
// @ts-ignore (define in dts) //注释ts报错
window.api.onFromMain((event, data) => {
    console.log('主进程说：', data)
})
// window.electron.onFromMain((event, data) => {
//   console.log('主进程说：', data)
// })

function onMouseMove(e: MouseEvent) {
    const winWidth = window.innerWidth
    const winHeight = window.innerHeight

    let x = e.clientX - size.value.width / 2
    let y = e.clientY - size.value.height / 2

    // 边界限制
    x = Math.max(0, Math.min(x, winWidth - size.value.width))
    y = Math.max(0, Math.min(y, winHeight - size.value.height))

    target.value = { x, y }
}

let animationFrame: number

function animate() {
    // 缓动算法：当前位置往目标移动一点点
    current.value.x += (target.value.x - current.value.x) * 0.2
    current.value.y += (target.value.y - current.value.y) * 0.2

    animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
    animate() // 启动动画循环
    st = setInterval(() => {
        progress.value += 1
        if (progress.value >= 100) {
            clearInterval(st)
            router.push('/Home')
        }
    }, 100)
})

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMouseMove)
    cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.2s ease;
}
.progress {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 20px;
    margin: auto;
    height: 30px;
    width: 200px;
    background: rgb(255, 255, 255);
    box-shadow: 0 0 10px rgb(255, 255, 255);
    padding: 8px 10px;
    border-radius: 30px;
    animation: shadowAni 1s linear infinite;
    .progress-bar {
        height: 100%;
        background-image: linear-gradient(to right, #641a4e 0, #db5338 200px);
        border-radius: inherit;
        transition: all 0.2s;
    }
}
@keyframes shadowAni {
    50% {
        box-shadow: 0 0 10px 10px #ffffff00;
    }
}
</style>
