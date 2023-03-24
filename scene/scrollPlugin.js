import { ScrollbarPlugin } from 'smooth-scrollbar';
import config from './config';

function LockPlugin() {
  ScrollbarPlugin.call(this);
}

LockPlugin.prototype = Object.create(ScrollbarPlugin.prototype);
LockPlugin.prototype.constructor = LockPlugin;
LockPlugin.pluginName = 'lock';

LockPlugin.prototype.transformDelta = function detalTrasnform(delta, context) {
  const { deltaY } = context;

  if (this.options.isLock || Math.abs(deltaY) < config.threshold.desktop) {
    return { x: 0, y: 0 };
  }
  return delta;
};

export default LockPlugin;
