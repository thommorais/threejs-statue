import { randomIntFromInterval, clamp } from './utils'

export const add = (a, b) => a + b

const random = () => Math.random()

export const populateArray = (count, bitLength, boxHeight, boxDepth, boxWidth) => {
	const deep = count * bitLength

	const data0Array = new Float32Array(deep * 4)
	const data1Array = new Float32Array(deep * 4)
	const positions = new Float32Array(deep * 3)


	const yHeight = boxHeight * 4

	let index1 = 0
	let index2 = 0

	for (let i = 0; i < count; i++) {
		const xx = random()
		const yy = random()
		const zz = random()
		const ww = random()

		const posX = clamp((2 * random() - 1) * (boxWidth / 2), [-1, 1])
		const posY = (2 * random() - 1) * yHeight
		const posZ = randomIntFromInterval(boxDepth * -1, boxDepth)

		for (let j = 0; j < bitLength; j++) {
			const px = index1++
			const py = index1++
			const pz = index1++
			const pw = index1++

			positions[px] = posX
			positions[py] = posY
			positions[pz] = posZ

			data0Array[px] = posX
			data0Array[py] = posY
			data0Array[pz] = posZ
			data0Array[pw] = j / bitLength

			data1Array[index2++] = xx
			data1Array[index2++] = yy
			data1Array[index2++] = zz
			data1Array[index2++] = ww
		}
    }


    return {
        data0Array,
        data1Array,
        positions
    }

}
