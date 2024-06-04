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
feature1.go(`https://assembly.acryps.com/`)
	// create a product and configure
	.element('product detail create').click()
	.element('slot header name', 'Body').click()
	.element('options option name', 'Ductile Iron 5.3103').click()

	// save product
	.element('configurator actions save').click()

	// enter product configuration
	.element('! input').write('My Configuration 1')
	.element('! actions save').click()

	// navigate to home
	.element('navigation page-links href', 'home').click()

const feature2 = new Feature('Example 2', 'Modify product');
feature2.go(`https://assembly.acryps.com/`)
	// import product using product code
	.element('importer input').write('ecM1B000032DU???X?5????F010??')
	.element('importer action', 'Import').click()
	.waitWhile('activity-indicator')	// wait while loading

	// change the configuration
	.element('slot header name', 'Size').click()
	.element('options option name', 'DN 25').click()

	// save product
	.element('configurator actions save').click()
	.element('! input').write('Modified configuration')
	.element('! actions save').click()

	.element('navigation page-links href', 'home').click()
	.elements('saved-assemblies-section assembly').show(['name', 'product-code'])

const feature3 = new Feature('Example 3', 'Copy product code and load')
feature3.go('https://assembly.acryps.com/configure/yckiuj/0')
	// copy product code 
	// .element('product-code action', 'Copy').click()
	.element('product-code code').copyToClipboard()	// alternate version

	.element('navigation page-links href', 'home').click()

	// load it a second time and use waitWhile
	.element('importer input').writeFromClipboard()
	.element('importer action', 'Import').click()
	.waitWhile('activity-indicator')

	// navigate home
	.element('navigation page-links href', 'home').click()

	// load it a third time and use waitFor
	.element('importer input').writeFromClipboard()
	.element('importer action', 'Import').click()
	.waitFor('slot header name')

// execute the features
const steps1 = await feature1.execute(project, { width: 1280, height: 720 }, { guide: true, screenshots: true });
const result1 = feature1.getExecutionResult();
await result1.save('example1');

const steps2 = await feature2.execute(project, { width: 1280, height: 720 }, { guide: true, screenshots: false });
const result2 = feature2.getExecutionResult();
await result2.save('example2');

const steps3 = await feature3.execute(project, { width: 1280, height: 720 }, { guide: true, screenshots: true });
const videoResult = await feature3.generateVideo(project, { width: 1280, height: 720 });
const result3 = feature3.getExecutionResult();
await result3.save('example3');

await BrowserManager.close();
```

```typescript 
await BrowserManager.launch(false);

const project = new Project('ringbaker', 'https://ringbaker.com');

// add elements which are ignored
project.ignore('badge');

const feature = new Feature('create a product', 'create a basic product');

feature.go('https://ringbaker.com')
	.element('banner button', `Let's go`).click()

	.elements('pack-container pack').get(1).click()

	.element('add-modifier').click()

	// select several elements
	.elements('group')
		// add conditions to the element-selection
		.where('title', 'Surface')
		// filter the selected elements
		.first()
			// add further selections on the current element
			.elements('modifier')
				// filter
				.get(1)
					// finally: interact with the selected element
					.click()
	
	.elements('preset').get(2).click()

	.element('toolbar button', 'Apply').click()

	.element('add-modifier').click()

	.elements('group').where('title', 'Bevel').first()
		.elements('modifier').get(1).click()

	.elements('preset').get(1).click()

	.element('toolbar button', 'Apply').click()

	.element('toolbar button', 'Continue').click()

	.elements('material').last().click()

	.element('toolbar button', 'Continue').click()

	.element('toolbar button', 'Add Ring To Cart').click()

	.waitWhile('spinner')

await feature.execute(project, { width: 1280, height: 720 }, { guide: true, screenshots: true });
await feature.generateVideo(project, { width: 1280, height: 720 });

const result = feature.getExecutionResult();
await result.save('ring1');

await BrowserManager.close();
```