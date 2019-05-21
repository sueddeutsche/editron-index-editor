const IndexEditor = require("../../indexeditor");
const testEditorIntegration = require("editron/test/support/testEditorIntegration");

const window = require("mithril/test-utils/browserMock.js")();
Object.defineProperty(global, 'window', { get: () => window });


testEditorIntegration(
    IndexEditor,
    "#",
    require("../support/schema.json"),
    require("../support/data.json")
);
