## Define and execute features

### Examples:

``` typescript
// start browser manager in headless mode
await BrowserManager.launch(true);

// creating feature project
const project = new Project('assembly', 'https://assembly.acryps.com');

// add elements which are ignored
project.ignore('activity-indicator');
project.ignore('assembly date');

// override default selector wrapper
project.wrap = (selector: string) => {
	if (selector == '!') {
		return ['ui-dialog'];
	}

	return [`${selector}`, `ui-${selector}`, `.ui-${selector}`, `[ui-${selector}]`, `.${selector}`, `[${selector}]`];
}

const feature1 = new Feature('Example 1', 'Create product');
feature1.redirect(`https://assembly.acryps.com/`)
	// create a product and configure
	.click('product detail create')
	.click('slot header name', 'Body')
	.click('options option name', 'Ductile Iron 5.3103')

	// save product
	.click('configurator actions save')

	// enter product configuration
	.write('! input', 'My Configuration 1')
	.click('! actions save')

	// navigate to home
	.navigate('navigation page-links href', 'home')

const feature2 = new Feature('Example 2', 'Modify product');
feature2.redirect(`https://assembly.acryps.com/`)
	// import product using product code
	.write('importer input', 'ecM1B000032DU???X?5????F010??')
	.click('importer action', 'Import')
	.waitWhile('activity-indicator')	// wait while loading

	// change the configuration
	.click('slot header name', 'Size')
	.click('options option name', 'DN 25')

	// save product
	.click('configurator actions save')
	.write('! input', 'Modified configuration')
	.click('! actions save')

	.navigate('navigation page-links href', 'home')
	.show('saved-assemblies-section assembly', ['name', 'product-code'])

const feature3 = new Feature('Example 3', 'Copy product code and load')
feature3.redirect('https://assembly.acryps.com/configure/yckiuj/0')
	// copy product code 
	.click('product-code action', 'Copy')
	// .copyToClipboard('product-code code')	// alternate version

	.navigate('navigation page-links href', 'home')

	// load it a second time and use waitWhile
	.writeFromClipboard('importer input')
	.click('importer action', 'Import')
	.waitWhile('activity-indicator')

	// navigate home
	.navigate('navigation page-links href', 'home')

	// load it a third time and use waitFor
	.writeFromClipboard('importer input')
	.click('importer action', 'Import')
	.waitFor('slot header name')

// execute the features
const steps1 = await feature1.execute(project, { width: 1280, height: 720 }, { guide: true, screenshots: true });
const result1 = feature1.getExecutionResult();
await result1.save('example1');

const steps2 = await feature2.execute(project, { width: 1280, height: 720 }, { guide: true, screenshots: false });
const result2 = feature2.getExecutionResult();
await result2.save('example2');

const videoResult = await feature3.generateVideo(project, { width: 1280, height: 720 });
const result3 = feature3.getExecutionResult();
await result3.save('example3');

await BrowserManager.close();
```
