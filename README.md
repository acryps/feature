## Define and execute features

### Examples:

``` typescript
const browserManager = new BrowserManager();
await browserManager.launch();

const project = new Project('https://assembly.acryps.com');

// add project specific prefixes (and postfixes)
project.addPrefix('ui-');

// add project specific keywords
project.addKeyword('!', 'dialog');

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
	.click('options option name', 'Ductile Iron 5.3103')
	.click('options option name', 'Wafer')
	.click('options option name', 'Class 150')
	.click('options option name', 'Square 45°')
	.click('options option name', 'Yellow Green')
	.click('options option name', 'EN 12944-5, C2M >120µm')
	.click('options option name', 'Add Earth Cable')
	.click('options option name', '3.1 EN 10204, P10, P11, P12')
	.click('options option name', 'Bare Shaft')

	// save product
	.click('configurator actions save')

	// enter product configuration in dialog
	.write('! input', 'My Configuration 1')
	.click('! actions save')

	// navigate to home
	.navigate('navigation page-links href', 'home')

	// present saved configurations
	.present('saved-assemblies-section assembly', ['name', 'product-code']);

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
7. Clicked 'Wafer' on the 'lower left'.
8. Clicked 'Class 150' on the 'lower left'.
9. Clicked 'Square 45°' on the 'lower left'.
10. Clicked 'Yellow Green' on the 'lower left'.
11. Clicked 'EN 12944-5, C2M >120µm' on the 'lower left'.
12. Clicked 'Add Earth Cable' on the 'lower left'.
13. Clicked '3.1 EN 10204, P10, P11, P12' on the 'lower left'.
14. Clicked 'Bare Shaft' on the 'lower left'.
15. Clicked 'Save As...' on the 'upper right'.
16. Write 'My Configuration 1' into the 'Name' field.
17. Clicked 'Add to my Assemblies' on the 'lower left'.
18. Go to 'home' 'https://assembly.acryps.com/' from 'https://assembly.acryps.com/configure/xj94n0/0'.
19. Find elements 'My Configuration 1, Elementarum ecM1-Series | PTFE Lined Butterfly Valve, ecM1B-1----DUEIWXA15DG2AF010CB'.
```