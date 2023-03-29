/* eslint-disable max-len */
import Scrollbar from 'smooth-scrollbar'
import { max, min, clamp, NORMAL, REVERSE, isNumberInRange, checkDirection } from './utils'
import { LockPlugin } from './scrollPlugin';

import ScrollCamera from './scrollCamera'

class SmoothScroller extends ScrollCamera {
  constructor(store, camera, options) {
    super(store, camera)

    this.store = store

    this.scroller = document.querySelector(options.scrollSelector)

    if (!this.scroller) {
      throw new Error(`we need a container to scroll`)
    }

    this.store.setState({
      scrollerSection: this.scroller,
    })

    this.addEventListeners()
    this.initScrollBody()
    this.setScrollListeners()

    this.scrolling = false

    this.onScrollTimeout = null
    this.onDoneTimeout = null
    this.RAF = null
  }

  initScrollBody() {
    Scrollbar.use(LockPlugin)

    this.bodyScrollBar = Scrollbar.init(this.scroller, {
      damping: 1,
      alwaysShowTracks: false,
      continuousScrolling: false,
      delegateTo: document.body,
      track: {
        autoHideOnIdle: true,
      },
      plugins: {
        lock: {
          locked: true,
        },
      },
    })

    const { locked } = this.store.getState()
    this.bodyScrollBar.updatePluginOptions('lock', { locked });

    this.bodyScrollBar.addListener((status) => {
      this.store.setState({
        scrollProgress: status.offset.y / status.limit.y,
        scrollStatus: status,
      });
    });

    this.store.subscribe(({ locked }) => {
      this.bodyScrollBar.updatePluginOptions('lock', { locked });
    }, 'locked');

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
    this.scroller.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.scroller.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
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
        if (typeof callback === 'function') {
          callback()
        }
      },
    })
  }

  changeScene({ from, to, direction, scrollToY, duration }) {
    this.store.lockScroll()
    this.scrollTo({ scrollToY, givenDuration: duration })
    this.triggerCameraScroll({ direction, from, to });
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

  triggerCameraScroll({ from, to, direction }) {
    const { cameraCurrentPose, cameraScenesCount } = this.store.getState()
    const { goingDown } = this.getCurrentScrollState(direction)

    const actualFrom = clamp(cameraCurrentPose || from, [1, cameraScenesCount])
    const actualTo = clamp(goingDown ? max(actualFrom + 1, to) : max(actualFrom - 1, to), [1, cameraScenesCount])

    if (goingDown && actualTo <= actualFrom || !goingDown && actualTo >= actualFrom || actualTo === actualFrom) {
      return
    }

    this.store.setState({
      direction,
      cameraPose: {
        from: actualFrom,
        to: actualTo,
      },
      doCameraScroll: true
    })
  }

  hasReachedBottom(currentIndex, threshold = 0) {
    const { scrollStatus, viewportHeight, sectionsRect, scrollMarginVP } = this.store.getState()
    const {
      offset: { y: scrollTop },
    } = scrollStatus

    const scrollBottom = scrollTop + viewportHeight

    const { bottom } = sectionsRect[currentIndex]
    return ((scrollBottom - scrollMarginVP) + threshold) >= bottom
  }

  hasReachedTop(currentIndex, threshold = 0) {
    const { scrollStatus, sectionsRect, scrollMarginVP } = this.store.getState()
    const {
      offset: { y: scrollTop },
    } = scrollStatus
    const { top } = sectionsRect[currentIndex]

    return (scrollTop) <= ((top - scrollMarginVP) + threshold)
  }

  getNextSceneBottom(currentIndex, direction) {
    const { scenesCount, sectionsRect } = this.getCurrentScrollState(direction)
    const nextPoint = clamp(currentIndex + (direction === NORMAL ? +1 : -1), [0, scenesCount])
    const { bottom } = sectionsRect[nextPoint]
    return bottom
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
    const { offset: { y: scrollTop } } = scrollStatus

    const currentIndex = this.getCurrentSectionIndex(scrollTop)

    const scrollBottom = scrollTop + viewportHeight
    const currentScene = sectionsRect[currentIndex]
    const scenesCount = sectionsRect.length - 1

    const isFirstScene = currentIndex === 0
    const isLastScene = currentIndex === sectionsRect.length - 1

    return { scenesCount, currentIndex, scrollTop, scrollBottom, currentScene, isFirstScene, isLastScene, viewportHeight }
  }

  handleScroll({ deltaY }) {

    const { scrollMarginVP, locked } = this.store.getState()


    const {
      currentIndex,
      isLastScene,
      viewportHeight,
      scrollTop,
    } = this.getCurrentScrollStatus();

    const { direction, goingDown } = this.getDirectionByDelta(deltaY)

    if (locked || isLastScene) {
      return
    }

    if (goingDown) {
      const scrollingDown = this.hasReachedBottom(currentIndex, -scrollMarginVP)
      if (scrollingDown) {
        const nextSceneTop = this.getNextSceneTop(currentIndex, direction)
        this.changeScene({
          from: currentIndex,
          to: currentIndex + 1,
          direction,
          scrollToY: nextSceneTop + 1,
          duration: 450
        })
      }
      return null
    }

    if (!goingDown) {
      const bottom = this.getCurrentSceneBottom(currentIndex);
      if (scrollTop > (bottom - scrollMarginVP)) {
        this.changeScene({
          from: currentIndex,
          to: currentIndex - 1,
          direction,
          scrollToY: (bottom - viewportHeight) + 1,
          duration: 450
        })
      }
    }

    return null
  }

  handleMouseWheel({ deltaY }) {
    this.handleScroll({ deltaY })
  }

  handleTouchStart({ touches }) {
    this.startY = touches[0].clientY
    this.startX = touches[0].clientX
  }

  handleTouchMove({ touches }) {
    const deltaY = this.startY - touches[0].clientY
    this.handleScroll({ deltaY })
  }

  onChangeScene(sceneChange) {
    this.store.setState({ sectionCurrent: sceneChange.from, cameraCurrentPose: sceneChange.from })

    if (sceneChange.direction === REVERSE) {
      const { sectionsRect, viewportHeight } = this.store.getState()
      const fromtop = sectionsRect[sceneChange.from].top
      this.setScroolPosition({ scrollToY: fromtop })

      setTimeout(() => {
        requestAnimationFrame(() => {
          const scrollToY = sectionsRect[sceneChange.to].bottom - viewportHeight
          this.changeScene({ ...sceneChange, scrollToY })
        })
      }, 200)
    }

    if (sceneChange.direction === NORMAL) {
      const nextSceneTop = this.getNextSceneTop(sceneChange.from, sceneChange.direction)
      this.changeScene({ ...sceneChange, scrollToY: nextSceneTop })
    }

  }

  onSectionScroll(sectionScroll) {
    this.store.setState({ sectionCurrent: sectionScroll.from })

    if (sectionScroll.direction === REVERSE) {
      const { sectionsRect, viewportHeight } = this.store.getState()
      const fromtop = sectionsRect[sectionScroll.from].top
      this.setScroolPosition({ scrollToY: fromtop })

      setTimeout(() => {
        requestAnimationFrame(() => {
          const scrollToY = sectionsRect[sectionScroll.to].bottom - viewportHeight
          this.scrollTo({ scrollToY: scrollToY })
        })
      }, 200)
    }

    if (sectionScroll.direction === NORMAL) {
      const nextSceneTop = this.getNextSceneTop(sectionScroll.from, sectionScroll.direction)
      this.scrollTo({ scrollToY: nextSceneTop })
    }


  }

}

export default SmoothScroller
