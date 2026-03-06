/**
 * Enhanced Asset System - 2026 Visual Overhaul
 * 
 * Modern asset loading with quality adaptation, WebP optimization,
 * and adaptive rendering for next-gen performance.
 */

export interface DeviceProfile {
    cores: number;
    memory: number;
    gpu: {
        supportsWebGPU: boolean;
        supportsWebGL2: boolean;
        maxTextureSize: number;
    };
    pixelRatio: number;
    screenSize: { width: number; height: number };
}

export interface EnhancedAssetConfig {
    base: string;
    optimized?: string; // WebP version
    animated?: string;  // Sprite sheet
    effects: string;    // Particle color scheme
    quality: 'low' | 'medium' | 'high' | 'ultra';
}

export interface AssetQualityTier {
    name: 'low' | 'medium' | 'high' | 'ultra';
    maxTextureSize: number;
    enableHDR: boolean;
    enablePostFX: boolean;
    maxParticles: number;
    enableWebGPU: boolean;
    compressionQuality: number;
}

export class AssetManager {
    private qualityLevel: 'low' | 'medium' | 'high' | 'ultra' = 'medium';
    private deviceProfile: DeviceProfile;
    private qualityTiers: AssetQualityTier[] = [
        {
            name: 'low',
            maxTextureSize: 1024,
            enableHDR: false,
            enablePostFX: false,
            maxParticles: 100,
            enableWebGPU: false,
            compressionQuality: 0.6
        },
        {
            name: 'medium',
            maxTextureSize: 2048,
            enableHDR: false,
            enablePostFX: true,
            maxParticles: 250,
            enableWebGPU: false,
            compressionQuality: 0.8
        },
        {
            name: 'high',
            maxTextureSize: 4096,
            enableHDR: true,
            enablePostFX: true,
            maxParticles: 400,
            enableWebGPU: true,
            compressionQuality: 0.9
        },
        {
            name: 'ultra',
            maxTextureSize: 8192,
            enableHDR: true,
            enablePostFX: true,
            maxParticles: 600,
            enableWebGPU: true,
            compressionQuality: 1.0
        }
    ];

    constructor() {
        this.deviceProfile = this.detectDeviceCapabilities();
        this.qualityLevel = this.calculateOptimalQuality();
    }

    private detectDeviceCapabilities(): DeviceProfile {
        const cores = navigator.hardwareConcurrency || 4;
        const memory = (navigator as any).deviceMemory || 4;
        const pixelRatio = window.devicePixelRatio || 1;
        const screenSize = {
            width: window.screen.width,
            height: window.screen.height
        };

        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        const supportsWebGL2 = !!gl;
        const supportsWebGPU = 'gpu' in navigator;

        let maxTextureSize = 2048;
        if (gl) {
            maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        }

        return {
            cores,
            memory,
            gpu: {
                supportsWebGPU,
                supportsWebGL2,
                maxTextureSize
            },
            pixelRatio,
            screenSize
        };
    }

    private calculateOptimalQuality(): 'low' | 'medium' | 'high' | 'ultra' {
        const { cores, memory, gpu } = this.deviceProfile;

        if (cores <= 2 || memory <= 2 || gpu.maxTextureSize < 2048) {
            return 'low';
        }

        if (cores <= 4 || memory <= 4 || !gpu.supportsWebGPU) {
            return 'medium';
        }

        if (cores >= 6 && memory >= 8 && gpu.supportsWebGPU) {
            return 'ultra';
        }

        return 'high';
    }

    getQualityConfig(): AssetQualityTier {
        return this.qualityTiers.find(t => t.name === this.qualityLevel) || this.qualityTiers[1];
    }

    getAssetPath(config: EnhancedAssetConfig): string {
        const qualityConfig = this.getQualityConfig();

        if (qualityConfig.name === 'low' && config.optimized) {
            return config.optimized;
        }

        return config.base;
    }

    createCharacterAssets(): Record<string, EnhancedAssetConfig> {
        return {
            'bug-queen': {
                base: '/assets/images/bug-1.png',
                animated: '/assets/images/bug-1-multiview.png',
                effects: 'pink-particles',
                quality: 'high'
            },
            'bug-ladybug': {
                base: '/assets/images/bug-2.png',
                effects: 'red-particles',
                quality: 'medium'
            },
            'bug-caterpillar': {
                base: '/assets/images/bug-3.png',
                effects: 'green-particles',
                quality: 'medium'
            },
            'bug-butterfly': {
                base: '/assets/images/bug-4.png',
                effects: 'blue-particles',
                quality: 'high'
            },
            'ant-mascot-1': {
                base: '/assets/images/Pink_ant_mascot_game_sprite_16bc3366ef.jpeg',
                effects: 'pink-mascot-particles',
                quality: 'medium'
            },
            'ant-mascot-2': {
                base: '/assets/images/Pink_ant_mascot_game_sprite_3379ebd6e6.jpeg',
                effects: 'pink-mascot-particles',
                quality: 'medium'
            },
            'ant-mascot-3': {
                base: '/assets/images/Pink_ant_mascot_game_sprite_49f52b4e1d.jpeg',
                effects: 'pink-mascot-particles',
                quality: 'medium'
            },
            'ant-mascot-4': {
                base: '/assets/images/Pink_ant_mascot_game_sprite_c415249f25.jpeg',
                effects: 'pink-mascot-particles',
                quality: 'medium'
            }
        };
    }

    createBackgroundAssets(): Record<string, EnhancedAssetConfig> {
        return {
            'bg-1': {
                base: '/assets/images/Pinik_pipra_mascot_and_backgrounds_47e7914f7b.jpeg',
                effects: 'psychedelic-shader',
                quality: 'high'
            },
            'bg-2': {
                base: '/assets/images/Pinik_pipra_mascot_and_backgrounds_cd6b5fdca4.jpeg',
                effects: 'psychedelic-shader',
                quality: 'high'
            },
            'bg-3': {
                base: '/assets/images/Pinik_pipra_mascot_and_backgrounds_d6feaccb97.jpeg',
                effects: 'psychedelic-shader',
                quality: 'high'
            },
            'bg-4': {
                base: '/assets/images/Pinik_pipra_mascot_and_backgrounds_d9c316ecec.jpeg',
                effects: 'psychedelic-shader',
                quality: 'high'
            }
        };
    }

    createAnimationAssets(): Record<string, EnhancedAssetConfig> {
        return {
            'walk-cycle': {
                base: '/assets/images/ant-walk-cycle.svg',
                effects: 'smooth-animation',
                quality: 'ultra'
            },
            'idle-1': {
                base: '/assets/animations/Pinik_pipra_idle_animation_9bcd48c96f.mp4',
                effects: 'idle-animation',
                quality: 'high'
            },
            'idle-2': {
                base: '/assets/animations/Pinik_pipra_idle_animation_e927c60d50.mp4',
                effects: 'idle-animation',
                quality: 'high'
            }
        };
    }

    async preloadAssets(): Promise<(HTMLImageElement | HTMLVideoElement)[]> {
        const characterAssets = this.createCharacterAssets();
        const backgroundAssets = this.createBackgroundAssets();
        const animationAssets = this.createAnimationAssets();

        const allAssets = {
            ...characterAssets,
            ...backgroundAssets,
            ...animationAssets
        };

        const assets: (HTMLImageElement | HTMLVideoElement)[] = [];

        for (const [key, config] of Object.entries(allAssets)) {
            try {
                const path = this.getAssetPath(config);
                const isVideo = /\.mp4($|\?)/i.test(path);

                if (isVideo) {
                    const video = await this.loadVideo(path);
                    assets.push(video);
                } else {
                    const image = await this.loadImage(path);
                    assets.push(image);
                }
            } catch (error) {
                console.warn(`Failed to load asset ${key}:`, error);
            }
        }

        return assets;
    }

    private loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    private loadVideo(src: string): Promise<HTMLVideoElement> {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.onloadeddata = () => resolve(video);
            video.onerror = () => reject(new Error(`Failed to load video: ${src}`));
            video.src = src;
            video.load();
        });
    }

    updateQualityBasedOnPerformance(fps: number): void {
        const currentConfig = this.getQualityConfig();

        if (fps < 30 && this.qualityLevel !== 'low') {
            const currentIndex = this.qualityTiers.findIndex(t => t.name === this.qualityLevel);
            if (currentIndex > 0) {
                this.qualityLevel = this.qualityTiers[currentIndex - 1].name as any;
            }
        } else if (fps > 55 && this.qualityLevel !== 'ultra') {
            const currentIndex = this.qualityTiers.findIndex(t => t.name === this.qualityLevel);
            if (currentIndex < this.qualityTiers.length - 1) {
                this.qualityLevel = this.qualityTiers[currentIndex + 1].name as any;
            }
        }
    }

    getDeviceProfile(): DeviceProfile {
        return this.deviceProfile;
    }

    getQualityLevel(): string {
        return this.qualityLevel;
    }
}

// Singleton instance
export const assetManager = new AssetManager();
