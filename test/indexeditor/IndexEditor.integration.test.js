const IndexEditor = require("../../indexeditor");
const testEditorIntegration = require("editron-core/test/support/testEditorIntegration");


testEditorIntegration(
    IndexEditor,
    "#",
    require("../support/schema.json"),
    require("../support/data.json")
);
