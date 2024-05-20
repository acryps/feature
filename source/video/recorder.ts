import { Page } from "puppeteer";
import { Mouse } from "./mouse";
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as Jimp from 'jimp'

export class Recorder {
	private fps = 30;
	private screenshotTimeout = 1000 / this.fps;

	private interval: NodeJS.Timeout;
	private frames = 0;
	
	private cursorImage: Jimp;
	
	constructor(
		private page: Page,
		private mouse: Mouse,
		private path: string,
		private name: string,
	) {}

	public async start() {
		try {
			this.interval = setInterval(async () => {
				const buffer = await this.page.screenshot();
				const frame = await this.addCursor(buffer, this.mouse.x, this.mouse.y); 
	
				this.saveFrame(frame);
				this.frames++;
			}, this.screenshotTimeout);
		} catch(error) {
			console.log(`[error] failed to record frame: '${error}'`);
		}
	}

	public stop() {
		clearInterval(this.interval);
		this.interval = null;

		this.frames = 0;
	}

	public async composeVideo() {
		ffmpeg.setFfmpegPath(ffmpegStatic);
		const ffmpegCommand = ffmpeg();

		await new Promise<void>(done => {
			ffmpegCommand.on('start', (command) => {
				console.log(`[info] spawned ffmpeg command: '${command}'`);
			})
			.addInput(`${this.path}/%d.png`)
			.inputOptions(`-framerate ${this.fps}`)
			.outputOptions('-pix_fmt yuv420p')
			.output(`./${this.name}.mp4`)
			.on('error', (err, stdout, stderr) => {
				console.error('[error] failed to compose video:', err.message);
				console.error(err)
			})
			.on('end', () => {
				console.log('[info] successfully composed video');
				done();
			})
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
			this.cursorImage = await (await Jimp.read(`${__dirname}/../../assets/cursor.png`)).resize(60, 60);
		}
	}
}