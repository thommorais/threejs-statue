import Stats from 'three/addons/libs/stats.module.js';

class StatsMonitor {
	constructor() {
		const prevStats = document.querySelector('.stats');
		if (prevStats) {
			document.body.removeChild(prevStats);
		}
		this.stats = new Stats();
		this.stats.dom.classList.add('stats');
		const container = document.body;
		container.appendChild(this.stats.dom);
	}

	update() {
		this.stats.update();
	}
}


export default StatsMonitor;
