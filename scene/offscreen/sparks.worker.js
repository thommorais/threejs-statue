import { randomIntFromInterval } from '../utils'
// sparks.worker.js
import * as Comlink from 'comlink';

const populateArray = (params) => {

	const { count, bitLength, boxHeight, boxDepth, boxWidth } = params;

	const deep = count * bitLength;
	const yHeight = boxHeight * 4;
	const xWidth = boxWidth / 2;
	const dataODeep = deep * 3;
	const data1Deep = deep * 7;
	const random = () => Math.random();
	const getZeroCenteredValue = () => 2 * random() - 1;

	let index = 0;

	console.log('worker thread', params.attributesArray.buffer.uuid);


	for (let i = 0; i < count; i++) {
		const randomX = random();
		const randomY = random();
		const randomZ = random();
		const randomW = random();
		const posX = getZeroCenteredValue() * xWidth;
		const posY = getZeroCenteredValue() * yHeight;
		const posZ = randomIntFromInterval(-boxDepth, boxDepth);

		for (let j = 0; j < bitLength; j++) {
			const px = index++;
			const py = index++;
			const pz = index++;
			const pw = index++;

			// positions
			params.attributesArray[px] = posX;
			params.attributesArray[py] = posY;
			params.attributesArray[pz] = posZ;

			// data0Array
			params.attributesArray[px + dataODeep] = posX;
			params.attributesArray[py + dataODeep] = posY;
			params.attributesArray[pz + dataODeep] = posZ;
			params.attributesArray[pw + dataODeep] = j / bitLength;

			// data1Array
			params.attributesArray[px + data1Deep] = randomX;
			params.attributesArray[py + data1Deep] = randomY;
			params.attributesArray[pz + data1Deep] = randomZ;
			params.attributesArray[pw + data1Deep] = randomW;
		}
	}

	return Comlink.transfer(params.attributesArray, [params.attributesArray.buffer]);
};


Comlink.expose({ populateArray });
