import Stats from 'three/addons/libs/stats.module.js';

class StatsMonitor {
	constructor() {
		const prevStats = document.querySelector('.stats');
		if (prevStats) {
			document.body.removeChild(prevStats);
		}

		this.stats = new Stats();

		this.stats.showPanel(0);

		this.stats.dom.classList.add('stats');

		Object.assign(this.stats.dom.style, {
			display: 'flex',
			width: '320px',
			background: 'rgba(0, 0, 0, 0.5)',
		})


		document.body.appendChild(this.stats.dom);
	}

	update() {
		this.stats.update();
	}
}


export default StatsMonitor;
