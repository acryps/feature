import { BrowserManager } from "./browser.manager";
import { Feature } from "./feature";
import { Project } from "./project";

export async function assemblyFeature() {
	const browserManager = new BrowserManager();
	await browserManager.launch();
	
	const project = new Project('assembly', 'https://assembly.acryps.com');

	const productName = 'ecM1-Series | Elementarum PTFE Lined Butterfly Valve';
	const productRoute = '/configure/yckiuj/0'
	
	const feature = new Feature(`Configure '${productName}'`, 'Example configuration of a product.');

	// define a feature
	feature.prepare(productName, productRoute)
		// configure product:
		.click('options option name', '1"')
		.click('options option name', 'Duplex')
		.click('options option name', 'UHMPE')
		.click('options option name', 'EPDM')
	
		// save product
		.click('configurator actions save')

		// enter product configuration
		.write('! input', 'My Configuration 1')
		.click('! actions save')

		// navigate to home
		.navigate('navigation page-links href', 'home')

		// present saved configurations
		.present('saved-assemblies-section assembly', ['name', 'product-code'])

		.click('product create')
		// // configure product:
		// .click('slot header name', 'Size')
		.click('options option name', '24"')

		// .click('slot header name', 'Disc')
		.click('options option name', 'Duplex')

		.click('slot header name', 'Body')
		.click('options option name', 'Ductile Iron 5.3103')

		.click('slot header name', 'Actuator')
		.click('options option name', 'Bare Shaft')
	
		// save product
		.click('configurator actions save')

		// enter product configuration
		.write('! input', 'My Configuration 2')
		.click('! actions save')

		// navigate to home
		.navigate('navigation page-links href', 'home')

		// present saved configurations
		.present('saved-assemblies-section assembly', ['name', 'product-code']);

	// execute the feature
	const result = await feature.execute(project, await browserManager.getPage(), {guide: true, screenshots: true, video: true});

	console.log(result);
	console.log(result.steps)

	for (let step of result.steps) {
		console.log(step.screenshots[0]);
	}

	await browserManager.close();
}

export async function ringbakerFeature() {
	const browserManager = new BrowserManager();
	await browserManager.launch();
	
	const project = new Project('ringbaker', 'https://ringbaker.com');
	
	const feature = new Feature(`Configure a ring'`, 'Example configuration of a ring.');

	// define a feature
	feature.prepare('Ringabaker Ring', '')
		// configure product:
		.click('banner button')
		.click('pack pack-title', 'Silver 925')
		.click('modifier title', 'Material and base')
		.click('option title', '14K Gold')
		.click('section option title', 'Rose Gold')
		.click('toolbar button', 'Apply')

		.click('add-modifier')
		.click('modifier-preview')
		.click('popup-controller button', 'Select Symbol')
		.click('decoration-images decoration-image img')
		.click('presets predicted')
		.click('presets predicted action')
		.click('presets predicted action')
		.click('toolbar button', 'Apply')

		.click('toolbar button', 'Continue')
		.click('toolbar button', 'Add Ring To Cart')
		.click('preview-image action like')

	// execute the feature
	const result = await feature.execute(project, await browserManager.getPage(), {guide: true, screenshots: true, video: true});

	await browserManager.close();
}

export async function wikiFeature() {
	const project = new Project('wikipedia', 'https://www.wikipedia.org/');

	const browserManager = new BrowserManager();
	await browserManager.launch();
	
	const feature = new Feature('test-name', 'test-description');
	feature.prepare('google suche', '/')
		.write('input#searchInput', 'NodeJS')
		.click('button.pure-button.pure-button-primary-progressive')

	const result = await feature.execute(project, await browserManager.getPage(), {guide: true, screenshots: true, video: true});

	await browserManager.close();
}

assemblyFeature().then(() => {
	console.log('feature done');
});
