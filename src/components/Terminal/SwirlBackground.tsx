'use strict';

import React, { useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';

export const SwirlBackground: React.FC = () => {
	const canvasARef = useRef<HTMLCanvasElement>(null);
	const canvasBRef = useRef<HTMLCanvasElement>(null);
	const animationRef = useRef<number>();

	useEffect(() => {
		const particleCount = 700;
		const particlePropCount = 9;
		const particlePropsLength = particleCount * particlePropCount;
		const rangeY = 100;
		const baseTTL = 50;
		const rangeTTL = 150;
		const baseSpeed = 0.1;
		const rangeSpeed = 2;
		const baseRadius = 1;
		const rangeRadius = 4;
		const baseHue = 220;
		const rangeHue = 100;
		const noiseSteps = 8;
		const xOff = 0.00125;
		const yOff = 0.00125;
		const zOff = 0.0005;
		const backgroundColor = 'hsla(260,40%,5%,1)';

		let tick = 0;
		const noise3D = createNoise3D();
		let particleProps = new Float32Array(particlePropsLength);
		let center = [0, 0];
		let width = window.innerWidth;
		let height = window.innerHeight;

		function rand(n: number) { return Math.random() * n; }
		function randRange(n: number) { return n * (Math.random() - 0.5); }
		function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
		function fadeInOut(t: number, m: number) {
			let hm = 0.5 * m;
			return Math.abs((t + hm) % m - hm) / hm;
		}
		function TAU() { return Math.PI * 2; }
		function cos(n: number) { return Math.cos(n); }
		function sin(n: number) { return Math.sin(n); }

		function resize() {
			width = window.innerWidth;
			height = window.innerHeight;
			const canvasA = canvasARef.current;
			const canvasB = canvasBRef.current;
			if (!canvasA || !canvasB) return;
			canvasA.width = width;
			canvasA.height = height;
			canvasB.width = width;
			canvasB.height = height;
			center[0] = 0.5 * width;
			center[1] = 0.5 * height;
		}

		function initParticle(i: number) {
			let x = rand(width);
			let y = center[1] + randRange(rangeY);
			let vx = 0;
			let vy = 0;
			let life = 0;
			let ttl = baseTTL + rand(rangeTTL);
			let speed = baseSpeed + rand(rangeSpeed);
			let radius = baseRadius + rand(rangeRadius);
			let hue = baseHue + rand(rangeHue);
			particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
		}

		function initParticles() {
			tick = 0;
			particleProps = new Float32Array(particlePropsLength);
			for (let i = 0; i < particlePropsLength; i += particlePropCount) {
				initParticle(i);
			}
		}

		function checkBounds(x: number, y: number) {
			return x > width || x < 0 || y > height || y < 0;
		}

		function drawParticle(ctx: CanvasRenderingContext2D, x: number, y: number, x2: number, y2: number, life: number, ttl: number, radius: number, hue: number) {
			ctx.save();
			ctx.lineCap = 'round';
			ctx.lineWidth = radius;
			ctx.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x2, y2);
			ctx.stroke();
			ctx.closePath();
			ctx.restore();
		}

		function updateParticle(ctx: CanvasRenderingContext2D, i: number) {
			let i2 = 1 + i, i3 = 2 + i, i4 = 3 + i, i5 = 4 + i, i6 = 5 + i, i7 = 6 + i, i8 = 7 + i, i9 = 8 + i;
			let x = particleProps[i];
			let y = particleProps[i2];
			let n = noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU();
			let vx = lerp(particleProps[i3], cos(n), 0.5);
			let vy = lerp(particleProps[i4], sin(n), 0.5);
			let life = particleProps[i5];
			let ttl = particleProps[i6];
			let speed = particleProps[i7];
			let x2 = x + vx * speed;
			let y2 = y + vy * speed;
			let radius = particleProps[i8];
			let hue = particleProps[i9];

			drawParticle(ctx, x, y, x2, y2, life, ttl, radius, hue);

			life++;

			particleProps[i] = x2;
			particleProps[i2] = y2;
			particleProps[i3] = vx;
			particleProps[i4] = vy;
			particleProps[i5] = life;

			(checkBounds(x, y) || life > ttl) && initParticle(i);
		}

		function drawParticles(ctx: CanvasRenderingContext2D) {
			for (let i = 0; i < particlePropsLength; i += particlePropCount) {
				updateParticle(ctx, i);
			}
		}

		function renderGlow(ctxA: CanvasRenderingContext2D, ctxB: CanvasRenderingContext2D) {
			ctxB.save();
			ctxB.filter = 'blur(8px) brightness(200%)';
			ctxB.globalCompositeOperation = 'lighter';
			ctxB.drawImage(canvasARef.current!, 0, 0);
			ctxB.restore();

			ctxB.save();
			ctxB.filter = 'blur(4px) brightness(200%)';
			ctxB.globalCompositeOperation = 'lighter';
			ctxB.drawImage(canvasARef.current!, 0, 0);
			ctxB.restore();
		}

		function renderToScreen(ctxA: CanvasRenderingContext2D, ctxB: CanvasRenderingContext2D) {
			ctxB.save();
			ctxB.globalCompositeOperation = 'lighter';
			ctxB.drawImage(canvasARef.current!, 0, 0);
			ctxB.restore();
		}

		function draw() {
			tick++;
			const canvasA = canvasARef.current;
			const canvasB = canvasBRef.current;
			if (!canvasA || !canvasB) return;
			const ctxA = canvasA.getContext('2d');
			const ctxB = canvasB.getContext('2d');
			if (!ctxA || !ctxB) return;
			ctxA.clearRect(0, 0, width, height);
			ctxB.fillStyle = backgroundColor;
			ctxB.fillRect(0, 0, width, height);
			drawParticles(ctxA);
			renderGlow(ctxA, ctxB);
			renderToScreen(ctxA, ctxB);
			animationRef.current = requestAnimationFrame(draw);
		}

		function handleResize() {
			resize();
			initParticles();
		}

		resize();
		initParticles();
		draw();

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
		};
	}, []);

	return (
		<>
			{/*
				Swirl background is fixed and covers the viewport, always behind app content.
				Ensure main app containers use zIndex > 0.
			*/}
			<canvas
				ref={canvasBRef}
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					width: '100vw',
					height: '100vh',
					zIndex: 0,
					pointerEvents: 'none',
				}}
			/>

			<canvas
				ref={canvasARef}
				style={{
					display: 'none',
				}}
			/>
		</>
	);
};