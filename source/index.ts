import { BrowserManager } from "./browser.manager";
import { Feature } from "./feature";
import { Project } from "./project";

export async function assemblyFeature() {
	const browserManager = new BrowserManager();
	await browserManager.launch();
	
	const project = new Project('https://assembly.acryps.com');
	// add project specific prefixes (and postfixes)
	project.addPrefix('ui-');

	const productName = 'ecM1-Series | Elementarum PTFE Lined Butterfly Valve';
	const productRoute = '/configure/yckiuj/0'
	
	const feature = new Feature(`Configure '${productName}'`, 'Example configuration of a product.');

	// define a feature
	feature.prepare(productName, productRoute)
		// configure product:
		.click(['options', 'option', 'name'], '1"')
		.click(['options', 'option', 'name'], 'Duplex')
		.click(['options', 'option', 'name'], 'UHMPE')
		.click(['options', 'option', 'name'], 'EPDM')
		.click(['options', 'option', 'name'], 'Ductile Iron 5.3103')
		.click(['options', 'option', 'name'], 'Wafer')
		.click(['options', 'option', 'name'], 'Class 150')
		.click(['options', 'option', 'name'], 'Square 45°')
		.click(['options', 'option', 'name'], 'Yellow Green')
		.click(['options', 'option', 'name'], 'EN 12944-5, C2M >120µm')
		.click(['options', 'option', 'name'], 'Add Earth Cable')
		.click(['options', 'option', 'name'], '3.1 EN 10204, P10, P11, P12')
		.click(['options', 'option', 'name'], 'Bare Shaft')
	
		// save product
		.click(['configurator', 'actions', 'save'])

		// enter product configuration
		.write(['dialog', 'input'], 'My Configuration 1')
		.click(['dialog', 'actions', 'save'])

		// navigate to home
		.navigate(['navigation', 'page-links', 'href'], 'home')

		// present saved configurations
		.present(['saved-assemblies-section', 'assembly'], ['name', 'product-code']);

	feature.click(['product', 'create'])
			// configure product:
			.click(['options', 'option', 'name'], '1"')
			.click(['options', 'option', 'name'], 'Duplex')
			.click(['options', 'option', 'name'], 'Ductile Iron 5.3103')
			.click(['options', 'option', 'name'], 'Square 45°')
			.click(['options', 'option', 'name'], 'Yellow Green')
			.click(['options', 'option', 'name'], 'EN 12944-5, C2M >120µm')
			.click(['options', 'option', 'name'], 'Bare Shaft')
		
			// save product
			.click(['configurator', 'actions', 'save'])
	
			// enter product configuration
			.write(['dialog', 'input'], 'My Configuration 2')
			.click(['dialog', 'actions', 'save'])
	
			// navigate to home
			.navigate(['navigation', 'page-links', 'href'], 'home')
	
			// present saved configurations
			.present(['saved-assemblies-section', 'assembly'], ['name', 'product-code']);

	// execute the feature
	await feature.execute(project, await browserManager.getPage());

	// generate feature guide
	const guide = feature.generateGuide();
	console.log();
	console.log(guide);

	await browserManager.close();
}

export async function wikiFeature() {
	const project = new Project('https://www.wikipedia.org/');
	project.addPrefix('ui-');

	const browserManager = new BrowserManager();
	await browserManager.launch();
	
	const feature = new Feature('test-name', 'test-description');
	feature.prepare('google suche', '/')
		.write(['input#searchInput'], 'NodeJS')
		.click(['button.pure-button.pure-button-primary-progressive'])

	await feature.execute(project, await browserManager.getPage());

	console.log();
	console.log(feature.generateGuide());

	await browserManager.close();
}

assemblyFeature().then(() => {
	console.log('feature done');
});
