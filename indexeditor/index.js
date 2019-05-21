const m = require("mithril");
const gp = require("gson-pointer");
const View = require("./View");
const buildTree = require("./buildTree");
const UI_PROPERTY = require("editron/utils/UISchema").UI_PROPERTY;


class OverviewEditor {

    static editorOf(pointer, controller, options = {}) {
        return options["editor:index"] === true;
    }

    constructor(pointer, controller, options) {
        this.viewModel = {
            children: [],
            errors: [],
            activeTarget: controller.location().getCurrent(),
            onClick: (item) => controller.location().goto(item.pointer),
            onAdd: (item) => controller.addItemTo(item.pointer),
            onChange(pointerToList, reorderedList, targetIndex) {
                // update data
                const data = controller.data().get(pointerToList);
                const sorted = [];
                for (let i = 0, l = data.length; i < l; i += 1) {
                    sorted.push(data[reorderedList[i]]);
                }
                controller.data().set(pointerToList, sorted);

                // refocus
                // controller.location().goto(`${pointerToList}/${targetIndex}`);
                const currentPointer = controller.location().getCurrent();
                const localPointer = currentPointer.replace(pointerToList, "");

                if (localPointer === currentPointer) {
                    // console.log("current focus is outside of reordered list - keep focus");
                    return controller.location().focus();
                }

                const currentIndex = parseInt(localPointer.replace(/^\//, ""));
                const nextIndex = reorderedList.indexOf(currentIndex);

                if (nextIndex === currentIndex) {
                    // console.log("current index has not changed - keep focus");
                    return controller.location().focus();
                }

                // console.log("change focus pointer - editor has moved", currentIndex, "->", nextIndex);
                const updatedPointer = gp.join(pointerToList, nextIndex, localPointer.replace(/^\/[0-9]+\//, ""));
                // console.log(currentPointer, "->", updatedPointer);
                return controller.location().setCurrent(updatedPointer);
            }
        };

        const LocationService = controller.location();
        this.onLocationChange = this.onLocationChange.bind(this);
        LocationService.on(LocationService.TARGET_EVENT, this.onLocationChange);

        this.options = options;
        this.pointer = pointer;
        this.controller = controller;

        this.$element = controller.createElement(".editron-index");
        this.setErrors = controller.validator().observe(pointer, this.setErrors.bind(this), true);
        this.onUpdate = controller.data().observe(pointer, this.onUpdate.bind(this), true);
        this.render();
        this.update();
    }

    destroy() {
        if (this.viewModel) {
            this.controller.removeInstance(this);
            this.viewModel = null;

            m.render(this.$element, m("i"));
            this.controller.data().removeObserver(this.pointer, this.onUpdate);
            this.controller.validator().removeObserver(this.pointer, this.setErrors);
            this.controller.location().off(this.controller.location().TARGET_EVENT, this.onLocationChange);
        }
    }

    onLocationChange(targetPointer) {
        this.viewModel.activeTarget = targetPointer;
        this.update();
    }

    setErrors(errors) {
        this.viewModel.errors = errors.filter(error => error.type === "error");
        this.render();
    }

    update() {
        this.rebuildList();
    }

    onUpdate(info) {
        // always update in order to update titles
        this.update();
    }

    getPointer() {
        return this.pointer;
    }

    // @validate not necessary or extend for inline use?
    updatePointer(newPointer) {
        if (this.pointer === newPointer) {
            return;
        }

        this.controller.changePointer(newPointer, this);

        const oldPointer = this.pointer;
        this.pointer = newPointer;
        this.controller.validator().removeObserver(oldPointer, this.setErrors, true);
        this.controller.validator().observe(newPointer, this.setErrors, true);
        this.controller.data().removeObserver(oldPointer, this.onUpdate, true);
        this.controller.data().observe(newPointer, this.onUpdate, true);

        this.rebuildList();
    }

    rebuildList() {
        const data = this.controller.data().get(this.pointer);
        this.viewModel.children = buildTree(this.pointer, data, this.controller).children;
        this.render();
    }

    render() {
        // @todo replace by onupdate in view?
        // force destroy the view
        m.render(this.$element, m("o"));
        // render view
        m.render(this.$element, m(View, this.viewModel));
    }

    toElement() {
        return this.$element;
    }
}


module.exports = OverviewEditor;
