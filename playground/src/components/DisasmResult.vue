<script setup lang="ts">
import { computed } from 'vue'
import { toHexStringWithPrefix, toHexString } from '../utils/hex-string'
import PanelToolbar from './ui/PanelToolbar.vue'
import type { Insn } from '../types'

const props = defineProps<{
  value: Insn[]
  asmMode?: boolean
}>()

const hexContent = computed(() => props.value.map((insn) => toHexString(insn.bytes)).join('\n'))
const asmContent = computed(() => props.value.map((insn) => insn.str).join('\n'))
const allBytes = computed(() => {
  const out: number[] = []
  props.value.forEach((insn) => {
    insn.bytes.forEach((b) => out.push(b))
  })
  return new Uint8Array(out)
})
const hexContentRaw = computed(() => Array.from(allBytes.value).map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(''))
const rawHexWithBold = computed(() => Array.from(allBytes.value)
  .map((b) => {
    const h = b.toString(16).toUpperCase().padStart(2, '0')
    return h === '00' ? '<strong>00</strong>' : h
  })
  .join(' '))
const strLiteral = computed(() => `"${Array.from(allBytes.value).map((b) => `\\x${b.toString(16).toUpperCase().padStart(2, '0')}`).join('')}"`)
const arrayLiteral = computed(() => `{ ${Array.from(allBytes.value).map((b) => `0x${b.toString(16).toUpperCase().padStart(2, '0')}`).join(', ')} }`)

function handleCopy() {
  if (props.asmMode) {
    navigator.clipboard.writeText(asmContent.value)
  } else {
    navigator.clipboard.writeText(hexContentRaw.value)
  }
}

defineExpose({
  asmContent,
  hexContent,
})
</script>

<template>
  <div class="overflow-auto relative">
    <ol class="children:flex">
      <li
        v-for="(insn, index) of value"
        :key="index"
      >
        <span class="mr-2 color-neutral-500">{{ toHexStringWithPrefix(insn.address, 8) }}</span>
        <span class="inline-block w-23ch mr-2 whitespace-pre">{{ toHexString(insn.bytes) }}</span>
        <span class="color-sky-500">{{ insn.str }}</span>
      </li>
    </ol>
    <PanelToolbar>
      <button
        class="i-carbon:copy"
        :title="asmMode ? 'Copy Assembly' : 'Copy Hex'"
        @click="handleCopy"
      />
    </PanelToolbar>
    <div class="mt-3 p-2 border-t border-gray-500 text-sm">
      <div class="mb-2">
        <strong>{{ asmMode ? 'Assembly' : 'Disassembly' }}</strong>
        <div class="whitespace-pre-wrap">{{ asmContent }}</div>
      </div>
      <div class="mb-2">
        <strong>Raw Hex (zero bytes in bold):</strong>
        <div class="whitespace-pre" v-html="rawHexWithBold" />
      </div>
      <div class="mb-2">
        <strong>String Literal:</strong>
        <div class="whitespace-pre">{{ strLiteral }}</div>
      </div>
      <div class="mb-2">
        <strong>Array Literal:</strong>
        <div class="whitespace-pre">{{ arrayLiteral }}</div>
      </div>
    </div>
  </div>
</template>
