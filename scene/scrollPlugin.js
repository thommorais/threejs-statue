import { ScrollbarPlugin } from 'smooth-scrollbar';

export function LockPlugin() {
  ScrollbarPlugin.call(this);
}

LockPlugin.prototype = Object.create(ScrollbarPlugin.prototype);
LockPlugin.prototype.constructor = LockPlugin;
LockPlugin.pluginName = 'lock';

LockPlugin.prototype.transformDelta = function detalTrasnform(delta) {
  if (this.options.locked) {
    return { x: 0, y: 0 };
  }
  return delta;
};

