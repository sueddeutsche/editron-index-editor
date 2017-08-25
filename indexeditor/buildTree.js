const UISchema = require("editron-core/utils/UISchema");
const gp = require("gson-pointer");


module.exports = function buildTree(pointer, data, controller, depth = 1) {
    // @ui-option title
    const schema = controller.schema().get(pointer);

    let title = UISchema.resolveReference(pointer, controller, gp.get(schema, "#/ui/title-overview"));
    title = UISchema.isEmpty(title) ? UISchema.getTitle(schema) : UISchema.sanitizeString(title);
    const icon = gp.get(schema, "#/ui/icon");

    if (Array.isArray(data)) {
        return {
            pointer,
            title,
            icon,
            editable: true,
            children: data
                .map((item, index) => buildTree(`${pointer}/${index}`, data[index], controller, depth - 1))
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
