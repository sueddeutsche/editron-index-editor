# [editron](https://github.com/sueddeutsche/editron) Index Editor

Adds an editable navigation for a given datapoint (json-pointer).


`npm i editron-index-editor`


## Plugin

Add it to your editors list, e.g.

```js
const editors = [
    require("editron-index-editor")
].concat(require("editron-core-editors"));
```

And optional import the custom wysiwyg-editor styles via sass

```scss
@import "editron-index-editor/index-editor.scss";
```

And initialize explicitely by

```js
controller.createEditor("#", document.querySelector("#editor-navigation"), {
    ui: { index: true }
});
```

## Example 

```js
const Controller = require("editron-core/Controller");

// instantiate controller
const controller = new Controller(
    mySchema, // schema used to build form
    myDefaultData, // some data like { inputform: [...] }
    [
        require("editron-index-editor")
    ].concat(require("editron-core-editors") // a list of editron-editors
);

controller.createEditor("#", document.querySelector("#editor-navigation"), {
    ui: { index: true }
});
```


