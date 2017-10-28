const UISchema = require("editron-core/utils/UISchema");
const UI_PROPERTY = UISchema.UI_PROPERTY;
const gp = require("gson-pointer");
// const isUrl = /(((https?|file):\/\/)|.{8}-.{4}-.{4}-.{4}-.{12})/;

module.exports = function buildTree(pointer, data, controller, depth = 1) {
    const schema = controller.schema().get(pointer);

    // @ui-option hidden
    if (UISchema.isHidden(schema)) {
        return undefined;
    }

    // @ui-option title
    let title = UISchema.resolveReference(pointer, controller, gp.get(schema, `#/${UI_PROPERTY}/title-overview`));
    title = UISchema.isEmpty(title) ? UISchema.getTitle(schema) : UISchema.sanitizeString(title);
    const icon = UISchema.getIcon(schema);

    if (Array.isArray(data)) {
        return {
            pointer,
            title,
            icon,
            editable: true,
            children: data
                .map((item, index) => buildTree(`${pointer}/${index}`, data[index], controller, depth - 1))
                .filter((value) => value !== undefined)
        };
    }

    if (depth > 0 && typeof data === "object" && data) {
        return {
            pointer,
            title,
            icon,
            editable: false,
            children: Object
                .keys(data)
                .map((key) => buildTree(`${pointer}/${key}`, data[key], controller, depth - 1))
                .filter((value) => value !== undefined)
        };
    }

    return {
        pointer,
        icon,
        title,
        editable: false,
        children: []
    };
};
