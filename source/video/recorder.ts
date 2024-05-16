import { Page } from "puppeteer";
import { Mouse } from "./mouse";
import * as Jimp from 'jimp'

export class Recorder {
    private screenshotTimeout = 1000 / 1;

    private invervalId;
    private frames = 0;
    
    private cursorImage: Jimp;
    
    constructor(
        private page: Page,
        private mouse: Mouse,
        private path: string,
        private name: string,
    ) {}

    public async start() {
        this.invervalId = setInterval(async () => {
            const buffer = await this.page.screenshot();
            const frame = await this.addCursor(buffer, this.mouse.x, this.mouse.y); 

            this.saveFrame(frame);
            this.frames++;
        }, this.screenshotTimeout);
    }

    public stop() {
        clearInterval(this.invervalId);
        this.frames = 0;
    }

    public composeVideo() {
        // todo: create video using frames
        return;
    }

    private async addCursor(buffer: Buffer,  x: number, y: number) {
        await this.loadCursor();
        const image = await Jimp.read(buffer);

        return image.composite(this.cursorImage, x, y);
    }

    private async saveFrame(frame: Jimp) {
        const savePath = `${this.path}/frame_${this.frames}.${frame.getExtension()}`;
        console.log(`[info] saved frame 'frame_${this.frames}.${frame.getExtension()}'`);
        await frame.writeAsync(savePath);
    }

    private async loadCursor() {
        if (!this.cursorImage) {
            this.cursorImage = await Jimp.read(`${__dirname}/../../assets/cursor.png`);
        }
    }
}