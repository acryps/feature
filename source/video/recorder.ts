import { Page } from "puppeteer";
import { Mouse } from "./mouse";
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as filestream from 'fs';
import * as Jimp from 'jimp'

export class Recorder {
    private fps = 1;
    private screenshotTimeout = 1000 / this.fps;

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
        ffmpeg.setFfmpegPath(ffmpegStatic);
        const command = ffmpeg();
        
        filestream.readdir(`${this.path}/`, (error, files) => {
            files.sort((a, b) => +a.split('.')[0] - +b.split('.')[0]);

            for (let file of files) {
                command.input(`${this.path}/${file}`)
            }

            command.on('start', (commandLine) => {
                    console.log(`[info] spawned ffmpeg with command: ${commandLine}`);
                })
                .on('error', (err, stdout, stderr) => {
                    console.error('[error] failed to compose video:', err.message);
                    console.error(err)
                })
                .on('end', () => {
                    console.log('[info] successfully composed video');
                })
                .inputFPS(this.fps)
                .outputOptions('-vf', `fps=${this.fps}`)
                .outputOptions('-c:v', 'libx264')
                .outputFormat('mp4')
                .output(`./${this.name}.mp4`)
                .run();
        });
    }

    private async addCursor(buffer: Buffer,  x: number, y: number) {
        await this.loadCursor();
        const image = await Jimp.read(buffer);

        return image.composite(this.cursorImage, x - (this.cursorImage.bitmap.width / 2), y - (this.cursorImage.bitmap.height / 2));
    }

    private async saveFrame(frame: Jimp) {
        const savePath = `${this.path}/${this.frames}.${frame.getExtension()}`;

        console.log(`[info] saved frame '${this.frames}.${frame.getExtension()}'`);

        await frame.writeAsync(savePath);
    }

    private async loadCursor() {
        if (!this.cursorImage) {
            this.cursorImage = await Jimp.read(`${__dirname}/../../assets/cursor.png`);
        }
    }
}