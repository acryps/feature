import { Page } from "puppeteer";
import * as Jimp from 'jimp'

export class Recorder {
    public cursor = {x: 0, y: 0};

    private stepInterval = 1000 / 60;
    private movementTime = 3 * 1000;

    private screenshotTimeout = 1000 / 1;

    private invervalId;
    private frames = 0;
    
    private cursorImage: Jimp;
    
    constructor(
        private page: Page,
        private path: string,
        private name: string,
    ) {}

    public async start() {
        this.invervalId = setInterval(async () => {
            const buffer = await this.page.screenshot();
            const frame = await this.addCursor(buffer, this.cursor.x, this.cursor.y); 

            this.saveFrame(frame);
            this.frames++;
        }, this.screenshotTimeout);
    }

    public stop() {
        clearInterval(this.invervalId);
        this.frames = 0;
    }

    public async simulateCursorMovement(x: number, y: number) {
        const deltaX = x - this.cursor.x;
        const deltaY = y - this.cursor.y;

        const steps = this.movementTime / this.stepInterval;

        const stepSizeX = deltaX / steps;
        const stepSizeY = deltaY / steps;

        for (let step = 0; step < steps; step++) {
            await new Promise<void>(done => setTimeout(() => {
                this.cursor.x += stepSizeX;
                this.cursor.y += stepSizeY;

                console.log(`x: ${this.cursor.x}, y: ${this.cursor.y}`);
            
                done();
            }, this.stepInterval));
        }
    }

    private async addCursor(buffer: Buffer,  x: number, y: number) {
        await this.loadCursor();
        const image = await Jimp.read(buffer);

        return image.composite(this.cursorImage, x, y);
    }

    private async saveFrame(frame: Jimp) {
        const savePath = `${this.path}/frame_${this.frames}.${frame.getExtension()}`;
        console.log(`saved frame 'frame_${this.frames}.${frame.getExtension()}'`);
        await frame.writeAsync(savePath);
    }

    private async loadCursor() {
        if (!this.cursorImage) {
            this.cursorImage = await Jimp.read(`${__dirname}/../../assets/cursor.png`);
        }
    }
}