const minSize = 6;
const maxSize = 12;

const randomSize = () => {
	return minSize + (maxSize - minSize + 1)*Math.random()|0;
};

const randomBits = (n) => {
	return [...new Array(n)].map(_=>(Math.random()>0.5)|0);
};

const isPowerOfTwo = (x) => {
	return /^10*$/.test(x.toString(2));
};

const countParity = (bits, mask) => {
	let sum = 0;
	for (let n=mask+1; n<=bits.length; ++n) {
		if (mask & n) {
			sum += bits[n-1];
		}
	}
	return sum;
};

const encode = (bits, parity) => {
	const res = [];
	for (let i=0; i<bits.length;) {
		const n = res.length + 1;
		if (isPowerOfTwo(n)) {
			res.push(0);
		} else {
			const bit = bits[i++];
			res.push(bit);
		}
	}
	for (let i=0; i<res.length; ++i) {
		const n = i + 1;
		if (!isPowerOfTwo(n)) {
			continue;
		}
		const sum = countParity(res, n) & 1;
		res[i] = (sum === parity)|0;
	}
	return res;
};

const flipRandomBit = (bits) => {
	const res = bits.slice();
	const i = (Math.random()*bits.length)|0;
	res[i] ^= 1;
	return res;
};

const generateEncodingQuiz = () => {
	const size = randomSize();
	const data = randomBits(size);
	const parity = randomBits(1)[0];
	const html = `
		<p>Codifique os seguintes bits de dados <b>${data.join('')}</b>
		utilizando paridade <b>${['par', 'ímpar'][parity]}</b>.</p>
	`;
	document.querySelector('#quiz').innerHTML = html;
};

const generateDecodingQuiz = () => {
	const size = randomSize();
	const data = randomBits(size);
	const parity = randomBits(1)[0];
	const encoded = encode(data, parity);
	const final = flipRandomBit(encoded);
	const html = `
		<p>Recupere os bits de dados do seguinte código de hamming: <b>${final.join('')}</b>.
		Utilize paridade <b>${['par', 'ímpar'][parity]}</b>.</p>
	`;
	document.querySelector('#quiz').innerHTML = html;
};

const encodedLengthToParityCount = (n) => {
	let sum = 0;
	for (let i=1; i<=n; ++i) {
		sum += isPowerOfTwo(i);
	}
	return sum;
};

const solveDecoding = () => {
	const textBits = document.querySelector('#code_bits').value.trim();
	if (!/^[10]+$/.test(textBits)) {
		return;
	}
	const bits = textBits.split('').map(Number);
	if (isPowerOfTwo(bits.length)) {
		document.querySelector('#decoding').innerHTML = `
			<p>Quantidade de bits inválida.</p>
		`;
		return;
	}
	const parity = Number(document.querySelector('#parity_decoding').value);
	let html = '';
	let errors = [];
	for (let p=1; p<bits.length; ++p) {
		if (!isPowerOfTwo(p)) {
			continue;
		}
		html += `<h3>Cálculo do bit de paridade ${p}</h3>`;
		html += '<p>';
		for (let i=0; i<bits.length; ++i) {
			const n = i + 1;
			const bit = bits[i];
			if (n === p) {
				html += `[${bits[i]}]`;
			} else if (n & p) {
				html += `<span class="counted ${['zero', 'one'][bit]}">${bits[i]}</span>`;
			} else {
				html += `<span class="ignored">${bits[i]}</span>`;
			}
		}
		const sum = countParity(bits, p);
		const expected = ((sum & 1) === parity)|0;
		const ok = expected === bits[p - 1]; 
		html += '</p>';
		html += `<p>Total de uns: <b>${sum}</b>, `;
		html += `bit de paridade esperado: <b>${expected}</b>, `;
		if (ok) {
			html += '<span class="ok">ok</span>.</p>';
		} else {
			errors.push(p);
			html += '<span class="err">erro detectado<span>.</p>';
		}
	}
	html += '<h3>Correção do erro</h3>';
	if (errors.length === 0) {
		html += '<p>Nenhum erro detectado</p>';
	} else {
		let pos = errors.reduce((a, b) => a + b);
		if (errors.length === 1) {
			html += `<p>Posição do erro: <b>${pos}</b></p>`;
		} else {
			html += `<p>Posição do erro: ${errors.join(' + ')} = <b>${pos}</b></p>`;
		}
		if (pos <= bits.length) {
			html += '<p>Correção: ';
			bits[pos - 1] ^= 1;
			for (let i=0; i<bits.length; ++i) {
				const bit = bits[i];
				if (i === pos - 1) {
					html += `<span class="counted ok">${bit}</span>`;
				} else {
					html += `<span class="ignored">${bit}</span>`;
				}
			}
			html += '</p>';
		} else {
			html += '</p>Posição inválida, mais de um bit com erro.</p>';
			document.querySelector('#decoding').innerHTML = html;
			return;
		}
	}
	html += `<p>Bits de dados: `;
	const data = [];
	for (let i=0; i<bits.length; ++i) {
		const bit = bits[i];
		if (isPowerOfTwo(i + 1)) {
			html += `<span class="ignored">${bit}</span>`;
		} else {
			html += `<span class="counted">${bit}</span>`;
			data.push(bit);
		}
	}
	html += ` -> <b>${data.join('')}</b></p>`;
	document.querySelector('#decoding').innerHTML = html;
};

document.querySelector('#generate_quiz').addEventListener('click', () => {
	// if (Math.random() > 0.5) {
	// 	generateEncodingQuiz();
	// } else {
	generateDecodingQuiz();
	// }
});

document.querySelector('#code_bits').addEventListener('input', solveDecoding);
document.querySelector('#parity_decoding').addEventListener('input', solveDecoding);
