import './style.css'

import { signInWithEmailAndPassword } from 'firebase/auth'
import './firebase'
import {auth} from './firebase'

async function main() {

  const app = document.querySelector('#app')
  const login = app.querySelector('#login')
  const form = app.querySelector('form')

  form.addEventListener('submit', async e => {
    const email = e.target.querySelector('#email')
    const pass = e.target.querySelector('#pass')

    try {
      const res = await signInWithEmailAndPassword(auth, email.value, pass.value)
      console.log(res)
      app.removeChild(login)
      const canvas = document.createElement('canvas')
      canvas.classList.add('webgl')
      app.appendChild(canvas)
      const { default: scene } = await import('./scene')
      scene()

    } catch (error) {
      console.log(error)
      form.reset()
   }

  })
}

requestIdleCallback(main)
