## Define and execute features

### Examples:

``` typescript
const browserManager = new BrowserManager();
await browserManager.launch();

const project = new Project('assembly', 'https://assembly.acryps.com');

// override default selector wrapper
project.wrapSelector = (selector: string) => {
	if (selector == '!') {
		return ['ui-dialog'];
	}

	return [`${selector}`, `ui-${selector}`, `.ui-${selector}`, `[ui-${selector}]`, `.${selector}`, `[${selector}]`];
}

const productName = 'ecM1-Series | Elementarum PTFE Lined Butterfly Valve';
const feature = new Feature(`Configure '${productName}'`, 'Example configuration of a product.');

// define a feature
feature.redirect(`https://assembly.acryps.com/configure/yckiuj/0`)
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
	.present('saved-assemblies-section assembly', ['name', 'product-code']);

// define execution configuration
const configuration = {guide: true, screenshots: true, video: true};

// execute the feature
const result = await feature.execute(project, await browserManager.getPage(), configuration);

// save execution results
await result.save(`${__dirname}/../saved`, 'assembly');

await browserManager.close();
```
