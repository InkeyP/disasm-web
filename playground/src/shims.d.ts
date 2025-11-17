declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}
declare module '*.wasm' {
  const src: string
  export default src
}
declare module 'virtual:pwa-register/vue' {
  export function useRegisterSW(options?: any): any
}
