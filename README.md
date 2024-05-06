## Define and execute features

### Examples:

``` typescript
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

	// save product
	.click(['configurator', 'actions', 'save'])

	// enter product configuration
	.write(['dialog', 'input'], 'My Configuration')
	.click(['dialog', 'actions', 'save'])

	// navigate to home
	.navigate(['navigation', 'page-links', 'href'], 'home')

	// present saved configurations
	.present(['saved-assemblies-section', 'assembly'], ['name', 'product-code']);

// execute the feature
await feature.execute(project, await browserManager.getPage());

// generate feature guide
const guide = feature.generateGuide();

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
10. Go to 'home' 'https://assembly.acryps.com/' from 'https://assembly.acryps.com/configure/degaep/0'.
11. Find elements 'My Configuration, Elementarum ecM1-Series | PTFE Lined Butterfly Valve, ecM1B-1----DUEI?X?5????F010??'.
```