const UISchema = require("editron-core/utils/UISchema");


function sanitizeString(title = "", maxLength = 40) {
    return (title && title.substr) ? title.replace(/<.*?>/g, "").substr(0, maxLength) : title;
}


module.exports = function buildTree(pointer, data, controller, depth = 1) {
    // @ui-option hidden
    if (UISchema.getOption(pointer, controller, "hidden")) {
        return undefined;
    }

    const title = sanitizeString(UISchema.getOption(pointer, controller, "index:title", "title"));
    const icon = UISchema.getOption(pointer, controller, "index:icon", "icon");

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
