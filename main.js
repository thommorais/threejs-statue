import './style.css'

import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import './firebase'
import { auth } from './firebase'

async function main() {
	const app = document.querySelector('#app')
	const login = app.querySelector('#login')
  const form = app.querySelector('form')


  async function onLogin(user) {
    if (user.uid) {
      const canvas = document.createElement('canvas')
      canvas.classList.add('webgl')
      app.appendChild(canvas)
      app.removeChild(login)
      const { default: scene } = await import('./scene')
      scene()
    }
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      onLogin(user)
    } else {
      const canvas = app.querySelector('canvas')
      if (canvas) {
        app.removeChild(canvas)
      }
    }
  })

  async function onLoginSubmit(email, pass) {
    try {
      await signInWithEmailAndPassword(auth, email, pass)
    } catch (error) {
      console.log(error)
      form.reset()
    }
  }

	form.addEventListener('submit', async (e) => {
		e.preventDefault()
		const email = e.target.querySelector('#email')
		const pass = e.target.querySelector('#pass')
    onLoginSubmit(email.value, pass.value)
	})
}

requestIdleCallback(main)
