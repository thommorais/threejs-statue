import './style.css'

async function main() {

  if (import.meta.env.MODE === 'development') {
    const { default: scene } = await import('./scene/scene')
    await scene()
  }

}

requestIdleCallback(main)
