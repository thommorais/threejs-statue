import Stats from 'three/addons/libs/stats.module.js';

class StatsMonitor {
	constructor() {
		const prevStats = document.querySelector('.stats');
		if (prevStats) {
			document.body.removeChild(prevStats);
		}

		this.panels = [];

		this.panel = document.createElement('div');
		this.panel.classList.add('stats');

		Object.assign(this.panel.style, {
			position: 'fixed',
			top: 0,
			left: 0,
			zIndex: 100,
			display: 'flex',
			gap: '1rem'
		});

		document.body.appendChild(this.panel);

		this.createPanel(0)
		this.createPanel(1)
		this.createPanel(2)

	}

	createPanel(type) {
		const panel = new Stats();
		panel.showPanel(type);
		panel.domElement.style.cssText = 'position:relative;top:0px;left:0px;';

		this.panel.appendChild(panel.dom);
		this.panels.push(panel);
	}


	update() {
		this.panels.forEach((panel) => {
			panel.update();
		})
	}
}


export default StatsMonitor;
