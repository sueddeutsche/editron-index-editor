# [editron](https://github.com/sueddeutsche/editron) Index Editor

Adds an editable navigation for a given datapoint (json-pointer).


`npm i editron-index-editor --save`


## Setup

### Add the bundled editor as a plugin

> Use bundled versions of this editor


Add the editor after the core-modules and it will register automatically (paths depend on your build-setup)

```html
<link rel="stylesheet" href="../node_modules/editron-index-editor/dist/editron-index-editor.css">

<!-- plugin editor -->
<script type="text/javascript" src="../node_modules/editron-core/dist/editron-modules.js"></script>
<script type="text/javascript" src="../node_modules/editron-core/dist/editron-core.js"></script>
<script type="text/javascript" src="../node_modules/editron-index-editor/dist/editron-index-editor.js"></script>
```

And create the index-editor

```js
const controller = new editronCore.Controller(mySchema, myData);
// create a main view for your data
const mainEditor = controller.createEditor("#/subView", document.querySelector("#editor"));

// create a new editor using the index-editor (enabled by option)
const index = controller.createEditor("#", document.querySelector("#editor-navigation"), {
    "editron:ui": { index: true }
});

// the index-editor will notify the location-service for any changes
const LocationServive = require("editron-core/services/LocationService");
LocationService.on(LocationService.PAGE_EVENT, function (pointer) {
    // change entry pointer to `pointer` (item within index has been clicked)
    // here you may destroy the main view editor and change the entry-point according to the passed pointer:
    mainEditor.destroy();
    mainEditor = controller.createEditor(pointer, document.querySelector("#editor"));
});
```


### Webpack build

> bundle the editor into your editron-application


#### Javascript

To use this editor within a webpack build, require the editor and add it to the editors list

```js
const editronIndexEditor = require("editron-index-editor");
const editors = [
    editronIndexEditor
    ...otherEditors
];
const controller = new Editron(schema, data, { editors });

// and follow the example above
```


#### Styles

Optionally import the custom script-editor styles via sass

```scss
@import "editron-index-editor/editron-index-editor.scss";
```

or simply add the bundled css-file (path is depending on your build-setup)

```html
<link rel="stylesheet" href="../node_modules/editron-index-editor/dist/editron-index-editor.css">
```

