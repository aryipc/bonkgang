"use client";

import React, { useRef, useEffect } from 'react';

const ParticleBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // A Path2D object for a filled baseball bat icon. Dimensions are based on a 24x24 viewbox.
        const batIconPath = new Path2D("M21.41,2.59l-2-2a1,1,0,0,0-1.41,0L1.59,17A1,1,0,0,0,2,18.41l2,2a1,1,0,0,0,1.41,0L22.41,4A1,1,0,0,0,21.41,2.59ZM5,19,3,17l3-3,2,2Zm13-9-2-2,3-3,2,2Z");

        let animationFrameId: number;
        let particlesArray: Particle[] = [];

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        setCanvasSize();

        class Particle {
            x: number;
            y: number;
            directionX: number;
            directionY: number;
            size: number;
            color: string;
            rotation: number;
            rotationSpeed: number;

            constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
                this.color = color;
                this.rotation = Math.random() * 360;
                this.rotationSpeed = (Math.random() - 0.5) * 1.5;
            }

            draw() {
                if (!ctx) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation * Math.PI / 180);
                
                // Scale the 24x24 bat path to an appropriate size.
                // this.size is a value from 1.5 to 4, scaling it by /6 makes it larger and more visible.
                const scale = this.size / 6;
                ctx.scale(scale, scale);
                // Center the path on the particle's origin (0,0) before drawing.
                ctx.translate(-12, -12);
                
                ctx.fillStyle = this.color;
                ctx.fill(batIconPath);
                ctx.restore();
            }
        }

        const init = () => {
            particlesArray = [];
            // Rendering paths is more intensive, so we reduce the particle count slightly.
            let numberOfParticles = (canvas.height * canvas.width) / 11000;
            if (numberOfParticles > 130) numberOfParticles = 130; // Cap particles for performance
            for (let i = 0; i < numberOfParticles; i++) {
                let size = (Math.random() * 2.5) + 1.5; // Increased size range for larger bats
                let x = (Math.random() * ((window.innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((window.innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 0.4) - 0.2;
                let directionY = (Math.random() * 0.4) - 0.2;
                let color = 'rgba(251, 191, 36, 0.7)'; // Amber color with opacity

                particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
            }
        };

        const updateParticles = () => {
            for (let i = 0; i < particlesArray.length; i++) {
                if (particlesArray[i].x > canvas.width || particlesArray[i].x < 0) {
                    particlesArray[i].directionX = -particlesArray[i].directionX;
                }
                if (particlesArray[i].y > canvas.height || particlesArray[i].y < 0) {
                    particlesArray[i].directionY = -particlesArray[i].directionY;
                }

                particlesArray[i].x += particlesArray[i].directionX;
                particlesArray[i].y += particlesArray[i].directionY;
                particlesArray[i].rotation += particlesArray[i].rotationSpeed; // Update rotation for spinning effect
            }
        };
        
        const drawParticles = () => {
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].draw();
            }
        };

        const drawGlows = () => {
            if (!ctx) return;
            const collisionDistance = 1500; // Squared distance for collision glow
            const glowRadius = 25;

            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a + 1; b < particlesArray.length; b++) {
                    const distance = ((particlesArray[a].x - particlesArray[b].x) ** 2) +
                                   ((particlesArray[a].y - particlesArray[b].y) ** 2);

                    // Collision Glow Effect
                    if (distance < collisionDistance) {
                        const midX = (particlesArray[a].x + particlesArray[b].x) / 2;
                        const midY = (particlesArray[a].y + particlesArray[b].y) / 2;

                        const gradient = ctx.createRadialGradient(midX, midY, 0, midX, midY, glowRadius);
                        const opacity = 1 - (distance / collisionDistance);
                        gradient.addColorStop(0, `rgba(251, 191, 36, ${opacity * 0.5})`);
                        gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');

                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        ctx.arc(midX, midY, glowRadius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        };


        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updateParticles();
            drawGlows(); // Draw glows first (underneath)
            drawParticles(); // Draw particles on top
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            setCanvasSize();
            init();
        };

        init();
        animate();
        
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1, background: 'transparent' }} />;
};

export default ParticleBackground;