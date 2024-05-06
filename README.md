## Define and execute features

### Examples:

``` typescript
const browserManager = new BrowserManager();
await browserManager.launch();

const project = new Project('https://assembly.acryps.com');
project.htmlTag = (name: string) => {return `${name}`};

const productName = 'ecM1-Series | Elementarum PTFE Lined Butterfly Valve';
const productRoute = '/configure/yckiuj/0'

const feature = new Feature(`Configure '${productName}'`, 'Example configuration of a product.');

// define a feature
feature.prepare(productName, productRoute)
	// configure product:
	.click(['ui-options', 'ui-option', 'ui-name'], '1"')
	.click(['ui-options', 'ui-option', 'ui-name'], 'Duplex')
	.click(['ui-options', 'ui-option', 'ui-name'], 'UHMPE')
	.click(['ui-options', 'ui-option', 'ui-name'], 'EPDM')
	.click(['ui-options', 'ui-option', 'ui-name'], 'Ductile Iron 5.3103')

	// save product
	.click(['ui-configurator ui-action[ui-save]'])

	// enter product configuration
	.write(['ui-dialog', 'input[placeholder="Name"]'], 'My Configuration')
	.click(['ui-dialog', 'ui-action[ui-save]'])

	// navigate to home
	.navigate(['ui-navigation', 'ui-page-links', 'a'], 'home')

	// present saved configurations
	.present(['ui-saved-assemblies-section', 'ui-assembly'], ['ui-name', 'ui-product-code']);

// execute the feature
await feature.execute(project, await browserManager.getPage());

// generate feature guide
const guide = feature.generateGuide();

console.log(guide);

await browserManager.close();
```

generates:
```
1. Configure product 'ecM1-Series | Elementarum PTFE Lined Butterfly Valve' at 'https://assembly.acryps.com/configure/yckiuj/0'.
2. Clicked '1"' on the 'upper left'.
3. Clicked 'Duplex' on the 'upper left'.
4. Clicked 'UHMPE' on the 'lower left'.
5. Clicked 'EPDM' on the 'lower left'.
6. Clicked 'Ductile Iron 5.3103' on the 'lower left'.
7. Clicked 'Save As...' on the 'upper right'.
8. Write 'My Configuration' into the 'Name' field.
9. Clicked 'Add to my Assemblies' on the 'lower left'.
10. Go to 'home' 'https://assembly.acryps.com/' from 'https://assembly.acryps.com/configure/1i4skm/0'.
11. Find elements 'My Configuration Elementarum ecM1-Series | PTFE Lined Butterfly Valve ecM1B-1----DUEI?X?5????F010??'.
```