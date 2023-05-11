/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import Scrollbar from 'smooth-scrollbar'
import ScrollMagic from 'scrollmagic'
import globalTaskQueue from './globalTaskQueue';

// import 'scrollmagic/scrollmagic/minified/plugins/debug.addIndicators.min.js'

import { max, min, clamp, NORMAL, REVERSE, isNumberInRange, checkDirection } from './utils'
import { LockPlugin } from './scrollPlugin'

import ScrollCamera from './scrollCamera'

class SmoothScroller extends ScrollCamera {
  constructor(store, camera, options) {
    super(store, camera)

    this.store = store

    this.scroller = document.querySelector(options.scrollSelector)

    if (!this.scroller) {
      throw new Error('we need a container to scroll')
    }

    this.store.setState({
      scrollerSection: this.scroller,
    })

    this.addEventListeners()
    this.setScrollListeners()

    this.onScrollTimeout = null
    this.onDoneTimeout = null
    this.RAF = null

    this.sMC = new ScrollMagic.Controller({
      container: this.scroller,
    })

    this.scrollDirection = NORMAL
    this.transitioning = false
  }

  initScrollBody() {
    Scrollbar.use(LockPlugin)

    const { locked } = this.store.getState()

    this.bodyScrollBar = Scrollbar.init(this.scroller, {
      damping: 1,
      continuousScrolling: false,
      track: {
        autoHideOnIdle: true,
      },
      plugins: {
        lock: {
          locked: true,
        },
      },
    })

    this.bodyScrollBar.updatePluginOptions('lock', { locked })

    this.bodyScrollBar.addListener((status) => {
      this.store.setState({
        scrollProgress: status.offset.y / status.limit.y,
        scrollStatus: status,
      })
    })

    this.store.subscribe(({ locked }) => {
      this.bodyScrollBar.updatePluginOptions('lock', { locked })
    }, 'locked')

    const { sectionsRect, sections, viewportHeight, eventFromApi } = this.store.getState()
    const { scenesCount } = this.getCurrentScrollState()

    for (let index = 0; index < sections.length; index += 1) {
      const section = sections[index]
      const discount = viewportHeight * 0.025
      const duration = 600

      new ScrollMagic.Scene({
        triggerElement: section,
        triggerHook: 0,
        duration: sectionsRect[index].bottom - sectionsRect[index].top,
        offset: 0,
      })
        .addTo(this.sMC)
        // .addIndicators({ name })
        .on('progress', ({ progress }) => {

          const isLastScene = index === scenesCount

          if (this.transitioning || isLastScene || eventFromApi) {
            return
          }

          const direction = this.scrollDirection

          if (direction === NORMAL && progress > 0.1) {
            const to = min(index + 1, scenesCount)
            const from = max(index, 0)
            const scrollToY = sectionsRect[to].top + 10
            this.changeScene({ from, to, direction, scrollToY, duration })
            this.transitioning = true
            return
          }

          if (direction === REVERSE && isNumberInRange(progress, [0.40, 0.95])) {
            const to = max(index, 0)
            const from = min(index + 1, scenesCount)
            const scrollToY = (sectionsRect[to].bottom - viewportHeight) + discount
            this.changeScene({ from, to, direction, scrollToY, duration })
            this.transitioning = true
            return
          }

        })
    }
  }

  setScrollListeners() {
    this.store.subscribe(
      ({ sceneChange }) => {
        if (sceneChange.enabled) {
          this.onChangeScene(sceneChange)
          this.store.setState({ sceneChange: { enabled: false } })
        }
      },
      ['sceneChange'],
    )

    this.store.subscribe(
      ({ sectionScroll }) => {
        if (sectionScroll.enabled) {
          this.onSectionScroll(sectionScroll)
          this.store.setState({ sectionScroll: { enabled: false } })
        }
      },
      ['sectionScroll'],
    )
  }

  addEventListeners() {
    this.scroller.addEventListener('wheel', this.handleMouseWheel.bind(this), { passive: false })
    this.scroller.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true })
    this.scroller.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true })
  }

  getDirectionByDelta(deltaY) {
    return checkDirection(deltaY)
  }

  scrollTo({ scrollToY, givenDuration, callback }) {
    const { duration } = this.store.getState()
    const animationDuration = givenDuration ? max(givenDuration, 100) : max(duration || 0, 100)
    this.store.setState({ sectionTransitionComplete: false })
    this.bodyScrollBar.scrollTo(0, max(scrollToY, 0), animationDuration, {
      callback: () => {
        const currentIndex = this.getCurrentSectionIndex(scrollToY)
        this.store.setState({ sectionCurrent: currentIndex, sectionTransitionComplete: true })
        this.transitioning = false
        if (typeof callback === 'function') {
          callback()
        }
      },
    })
  }

  changeScene({ from, to, direction, rate, scrollToY, duration, ignoreCameraCurrentState = false }) {
    this.store.lockScroll()
    this.scrollTo({ scrollToY, givenDuration: duration })
    this.triggerCameraScroll({ direction, from, to, rate, ignoreCameraCurrentState })
  }

  setScroolPosition({ scrollToY, withoutCallbacks = true }) {
    this.bodyScrollBar.setPosition(0, scrollToY, {
      withoutCallbacks,
    })
  }

  getCurrentScrollState(direction) {
    const { sectionsRect, sectionCurrent, viewportHeight, cameraCurrentPose } = this.store.getState()

    const goingDown = direction === NORMAL
    const scenesCount = sectionsRect.length - 1

    const nextPoint = clamp(sectionCurrent + (goingDown ? +1 : -1), [0, scenesCount])

    const { top, bottom } = sectionsRect[nextPoint]
    const scrollToY = goingDown ? top : bottom - viewportHeight

    return {
      sectionsRect,
      nextPoint,
      scenesCount,
      goingDown,
      scrollToY,
      cameraCurrentPose,
    }
  }

  triggerCameraScroll({ from, to, rate, direction, ignoreCameraCurrentState = false }) {
    const { cameraCurrentPose, cameraScenesCount } = this.store.getState()

    const cameraPose = { from, to }

    if (!ignoreCameraCurrentState) {
      if (direction === NORMAL) {
        cameraPose.from = cameraCurrentPose
        cameraPose.to = clamp(max(cameraCurrentPose + 1, to), [0, cameraScenesCount])
      }

      if (direction === REVERSE) {
        cameraPose.from = cameraCurrentPose
        cameraPose.to = clamp(max(cameraCurrentPose - 1, to), [0, cameraScenesCount])
      }
    }

    this.store.setState({
      direction,
      cameraPose,
      rate,
      doCameraScroll: true,
    })
  }

  getNextSceneTop(currentIndex, direction) {
    const { scenesCount, sectionsRect } = this.getCurrentScrollState(direction)
    const nextPoint = clamp(currentIndex + (direction === NORMAL ? +1 : -1), [0, scenesCount])
    const { top } = sectionsRect[nextPoint]
    return top
  }

  getCurrentSceneBottom(currentIndex) {
    const { sectionsRect, scenesCount } = this.getCurrentScrollState()
    const sceneIndex = clamp(currentIndex, [0, scenesCount])
    const { bottom } = sectionsRect[sceneIndex]
    return bottom
  }

  getCurrentSceneTop(currentIndex) {
    const { sectionsRect, scenesCount } = this.getCurrentScrollState()
    const { top } = sectionsRect[clamp(currentIndex, [0, scenesCount])]
    return top
  }

  getCurrentSectionIndex(scrollTop) {
    const { sectionsRect } = this.store.getState()
    const foundIndex = sectionsRect.findIndex((scene) => isNumberInRange(scrollTop, [scene.top, scene.bottom]))
    return clamp(foundIndex, [0, sectionsRect.length - 1])
  }

  getCurrentScrollStatus() {
    const { scrollStatus, sectionsRect, viewportHeight } = this.store.getState()
    const {
      offset: { y: scrollTop },
    } = scrollStatus
    const currentIndex = this.getCurrentSectionIndex(scrollTop)
    const scrollBottom = scrollTop + viewportHeight
    const currentScene = sectionsRect[currentIndex]
    const scenesCount = sectionsRect.length - 1

    return {
      scenesCount,
      currentIndex,
      scrollTop,
      scrollBottom,
      currentScene,
      viewportHeight,
    }
  }

  handleMouseWheel(event) {
    // this.handleScroll({ deltaY: event.deltaY });
    const { direction } = this.getDirectionByDelta(event.deltaY)
    this.scrollDirection = direction
  }

  handleTouchStart({ touches }) {
    this.startY = touches[0].clientY
    this.startX = touches[0].clientX
  }

  handleTouchMove({ touches }) {
    const deltaY = this.startY - touches[0].clientY
    // this.handleScroll({ deltaY });
    const { direction } = this.getDirectionByDelta(deltaY)
    this.scrollDirection = direction
  }

  onChangeScene(sceneChange) {
    this.store.setState({ sectionCurrent: sceneChange.from, cameraCurrentPose: sceneChange.camera.from })

    if (sceneChange.direction === REVERSE) {
      const { sectionsRect, viewportHeight } = this.store.getState()
      const fromtop = sectionsRect[sceneChange.from].top
      this.setScroolPosition({ scrollToY: fromtop })

      setTimeout(() => {
        globalTaskQueue.pushTask(() => {
          const scrollToY = sectionsRect[sceneChange.to].bottom - viewportHeight
          this.changeScene({ ...sceneChange, ...sceneChange.camera, scrollToY })
        })
      }, 300)
    }

    if (sceneChange.direction === NORMAL) {
      globalTaskQueue.pushTask(() => {
        const { sectionsRect } = this.store.getState()
        const nextSceneTop = sectionsRect[sceneChange.to].top
        this.changeScene({ ...sceneChange, ...sceneChange.camera, scrollToY: nextSceneTop })
      })
    }
  }

  onSectionScroll(sectionScroll) {
    this.store.setState({ sectionCurrent: sectionScroll.from })

    if (sectionScroll.direction === REVERSE) {
      const { sectionsRect, viewportHeight } = this.store.getState()
      const fromtop = sectionsRect[sectionScroll.from].top
      this.setScroolPosition({ scrollToY: fromtop })

      setTimeout(() => {
        globalTaskQueue.pushTask(() => {
          const scrollToY = sectionsRect[sectionScroll.to].bottom - viewportHeight
          this.scrollTo({ scrollToY })
        })
      }, 200)
    }

    if (sectionScroll.direction === NORMAL) {
      const nextSceneTop = this.getNextSceneTop(sectionScroll.from, sectionScroll.direction)
      globalTaskQueue.pushTask(() => this.scrollTo({ scrollToY: nextSceneTop }));
    }
  }
}

export default SmoothScroller
