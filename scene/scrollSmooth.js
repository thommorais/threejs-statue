/* eslint-disable max-len */
import Scrollbar from 'smooth-scrollbar';
import {
  max,
  clamp,
  NORMAL,
  REVERSE,
  isNumberInRange,
} from './utils';
// import LockPlugin from './scrollCamera';

class SmoothScroller {
  constructor(scrollerContainer, store) {
    this.scroller = document.querySelector(scrollerContainer);

    if (!this.scroller) {
      throw new Error(`we need a container to scroll ${scrollerContainer}`);
    }

    this.store = store;

    const [currentSection] = this.store.getState().sections;

    this.store.setState({
      current: 0,
      currentSection,
      scrollerSection: this.scroller,
    });

    // Scrollbar.use(LockPlugin)

    this.bodyScrollBar = Scrollbar.init(this.scroller, {
      damping: 1,
      continuousScrolling: false,
      delegateTo: document.body,
      plugins: {
        lock: {
          locked: false,
        },
      },
    });

    this.bodyScrollBar.addListener((status) => {
      this.store.setState({
        scrollProgress: status.offset.y / status.limit.y,
        scrollStatus: status,
      });
    });

    this.store.subscribe(({ locked }) => {
      this.bodyScrollBar.updatePluginOptions('lock', { locked });
    }, 'locked');

    this.store.subscribe(({ syntaticScroll }) => {
      if (syntaticScroll.enabled) {
        this.syntaticScroll(syntaticScroll);
      }
    }, ['syntaticScroll']);

    this.onScrollTimeout = null;
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleWheel = this.handleWheel.bind(this);

    this.scroller.addEventListener('wheel', this.handleMouseWheel, { passive: false });
    this.scroller.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.scroller.addEventListener('touchmove', this.handleTouchMove, { passive: false });

    this.RAF = null;
  }

  scrollTo({ scrollToY }) {
    const { duration, sections, timeout, direction } = this.store.getState();
    const { nextPoint } = this.getCurrentScrollState(direction);

    this.store.lockScroll();
    clearTimeout(timeout);

    this.bodyScrollBar.update();

    this.bodyScrollBar.addMomentum(0, scrollToY - this.bodyScrollBar.offset.y);
    this.bodyScrollBar.scrollTo(0, scrollToY, max(duration, 200), {
      callback: () => {
        const newTimeout = setTimeout(() => this.store.unLockScroll(), max(duration - 100, 100));
        this.store.setState({ currentSection: sections[nextPoint], timeout: newTimeout, current: nextPoint });
      },
    });
  }

  getCurrentScrollState(direction) {
    const { scenesRect, current, viewportHeight } = this.store.getState();

    const goingDown = direction === NORMAL;
    const scenesCount = scenesRect.length - 1;
    const nextPoint = clamp(current + (goingDown ? +1 : -1), [0, scenesCount]);
    const { top, bottom } = scenesRect[nextPoint];
    const scrollToY = goingDown ? top : bottom - viewportHeight;

    return {
      scenesRect,
      current,
      nextPoint,
      scenesCount,
      goingDown,
      scrollToY,
    };
  }

  triggerCameraScroll({ from, to, direction }) {
    this.store.setState({ from, to, direction });
  }

  handleWheel({ scroll, direction }) {
    cancelAnimationFrame(this.RAF);
    this.RAF = requestAnimationFrame(() => {
      const { scenesRect, current, locked } = this.store.getState();
      const { goingDown } = this.getCurrentScrollState(direction);
      const scenesCount = scenesRect.length - 1;

      const avoidScroll = (current === scenesCount && goingDown) || (current === 0 && !goingDown) || locked;

      if (scroll && !avoidScroll) {
        const { scrollToY, nextPoint } = this.getCurrentScrollState(direction);
        // trigger camera scroll
        this.triggerCameraScroll({ from: current, to: nextPoint, direction });
        this.scrollTo({ scrollToY });
      }
    });
  }

  syntaticScroll(state) {
    if (state.enabled) {
      const { direction, from, to } = state;
      const { scenesCount, goingDown } = this.getCurrentScrollState(direction);

      const avoidScroll = (from === scenesCount && goingDown) || (from === 0 && !goingDown);

      if (!avoidScroll) {
        cancelAnimationFrame(this.RAF);
        this.RAF = requestAnimationFrame(() => {
          this.triggerCameraScroll({ from, to, direction });
          this.store.setState({ current: from, syntaticScroll: { enabled: false } });
          const { scrollToY } = this.getCurrentScrollState(direction);
          this.scrollTo({ scrollToY });
        });
      }
    }
  }

  hasReachedScrollBoundary(threshold) {
    const {
      scenesRect, scrollStatus, viewportHeight, locked, to,
    } = this.store.getState();

    const scrollTop = scrollStatus.offset.y;
    const scrollBottom = scrollTop + viewportHeight;

    const currentIndex = scenesRect.findIndex((scene) => isNumberInRange(scrollTop, [scene.top, scene.bottom]));
    const goingDown = threshold > 0;

    const { bottom: currBottom = 0 } = scenesRect[currentIndex] || { bottom: viewportHeight };
    const { top: nextTop = 0 } = scenesRect[to] || { top: 0 };

    const scrollDown = goingDown && !locked && scrollBottom >= currBottom + threshold;
    const scrollUp = !goingDown && !locked && scrollTop <= nextTop - threshold;

    return scrollDown || scrollUp;
  }

  handleMouseWheel({ deltaY }) {
    const { thresholdScroll: { desktop }, scenesRect } = this.store.getState();

    if (scenesRect.length === 0) {
      return null;
    }


    console.log('deltaY', deltaY)

    const direction = deltaY >= 0 ? NORMAL : REVERSE;
    const goingDown = direction === NORMAL;
    const threshold = goingDown ? deltaY + desktop : deltaY - desktop;

    if (this.hasReachedScrollBoundary(threshold)) {
      this.handleWheel({ scroll: Math.abs(deltaY) > 0, direction });
    }

    return null;
  }

  handleTouchStart({ touches }) {
    this.startY = touches[0].clientY;
  }

  handleTouchMove({ touches }) {
    const { thresholdScroll: { mobile }, scenesRect } = this.store.getState();

    if (scenesRect.length === 0) {
      return null;
    }

    const deltaY = this.startY - touches[0].clientY;
    const direction = deltaY >= 0 ? NORMAL : REVERSE;
    const goingDown = direction === NORMAL;
    const threshold = goingDown ? deltaY + mobile : deltaY - mobile;

    if (this.hasReachedScrollBoundary(threshold)) {
      this.handleWheel({ scroll: Math.abs(deltaY) > 0, direction });
    }

    return null;
  }
}

export default SmoothScroller;
