/* eslint quote-props: 0 */
const m = require("mithril");
const SessionService = require("editron-core/services/SessionService");
const getId = require("editron-core/utils/getID");
let dragula = require("dragula");
const isNodeContext = require("editron-core/utils/isNodeContext");

if (!isNodeContext()) {
    require("dragula/dist/dragula.min.css");
} else {
    dragula = () => ({
        on: Function.prototype,
        destroy: Function.prototype
    });
}


function getCollapsedState(pointer) {
    return SessionService.get(`index:collapse:${pointer}`, false);
}

function setCollapsedState(pointer, state) {
    return SessionService.set(`index:collapse:${pointer}`, state);
}


function hasError(pointer, errors) {
    const hasErrors = errors.find((error) =>
        error.data.pointer === pointer || error.data.pointer.indexOf(`${pointer}/`) >= 0
    );
    return hasErrors !== undefined;
}

function getClass(pointer, activeTarget, errors) {
    let className = (hasError(pointer, errors) ? "hasError" : "hasNoError");
    if (activeTarget === pointer || activeTarget.includes(`${pointer}/`)) {
        className += " isActive";
    }

    if (getCollapsedState(pointer) === true) {
        className += " isCollapsed";
    }
    return className;
}

const EditableList = {
    getChangedIndex(vnode, draggedItem) {
        const children = vnode.dom.childNodes;
        const startIndex = parseInt(draggedItem.getAttribute("index"), 10);
        let currentIndex;
        for (let i = 0, l = children.length; i < l; i += 1) {
            if (children[i] === draggedItem) {
                currentIndex = i;
                break;
            }
        }

        if (currentIndex === startIndex) {
            return false;
        }

        return [...children].map((node) => parseInt(node.getAttribute("index"), 10));
    },
    onremove() {
        this.drag.destroy();
    },
    oncreate(vnode) {
        this.drag = dragula([vnode.dom], {
            moves: (el, source, handle) => handle.className.indexOf("is-handle") !== -1
        });
        this.drag.on("dragend", (draggedItem) => {
            const changedIndex = this.getChangedIndex(vnode, draggedItem);
            const dragIndex = parseInt(draggedItem.getAttribute("index"), 10);
            if (changedIndex !== false) {
                vnode.attrs.onChange(vnode.attrs.pointer, changedIndex, changedIndex.indexOf(dragIndex));
            }
        });
    },
    view(vnode) {
        return m("ul.editron-editable-index-list",
            vnode.attrs.children.map((item, index) =>
                m("li",
                    {
                        index,
                        class: getClass(item.pointer, vnode.attrs.activeTarget, vnode.attrs.errors)
                    },
                    m(".editron-index__item.editron-index__item--sortable",
                        m("span.editron-index__icon.editron-index__icon--dummy",
                            item.icon ? m("i.mmf-icon", item.icon) : ""
                        ),
                        m("a.editron-index__title",
                            {
                                href: `#${getId(item.pointer)}`,
                                onclick: (e) => {
                                    e.preventDefault();
                                    vnode.attrs.onClick(item);
                                }
                            },
                            item.title
                        ),
                        m("span.editron-index__icon.editron-index__icon--move.is-handle",
                            m("i.mmf-icon.is-handle", "drag_handle")
                        )
                    ),
                    m(vnode.attrs.ListComponent, Object.assign({}, vnode.attrs, item), vnode.children)
                )
            )
        );
    }
};

const List = {

    toggleCollapse(item) {
        item.$collapseTarget.classList.toggle("isCollapsed");
        setCollapsedState(item.pointer, item.$collapseTarget.classList.contains("isCollapsed"));
    },

    view(vnode) {
        return m("ul.editron-index-list", vnode.attrs.children.map((item) => {
            let collapseIcon = "";
            if (item.editable && item.children.length > 0) {
                // collapse sublist action
                collapseIcon = m("span.editron-index__icon.editron-index__icon--collapse",
                    { onclick: () => this.toggleCollapse(item) },
                    m("i.mmf-icon", "expand_less")
                );
            } else if (item.editable && item.children.length === 0) {
                // empty icon, nothing to expand
                collapseIcon = m("span.editron-index__icon.editron-index__icon--dummy",
                    m("i.mmf-icon", "")
                );
                // no children - deactivate collapse per default
                setCollapsedState(item.pointer, false);
            }

            return m("li",
                {
                    class: getClass(item.pointer, vnode.attrs.activeTarget, vnode.attrs.errors),
                    oncreate: (node) => (item.$collapseTarget = node.dom)
                },
                m(".editron-index__item",
                    {
                        class: item.editable ? "editron-index__item--editable" : "editron-index__item--default"
                    },
                    collapseIcon,
                    m("a.editron-index__title",
                        {
                            href: `#${getId(item.pointer)}`,
                            onclick: (e) => {
                                e.preventDefault();
                                vnode.attrs.onClick(item);
                            }
                        },
                        item.title
                    ),
                    item.editable ? m("span.editron-index__icon.editron-index__icon--add",
                        {
                            onclick: () => vnode.attrs.onAdd(item)
                        },
                        m("i.mmf-icon", "playlist_add")
                    ) : m("span.editron-index__icon")
                ),
                m(vnode.attrs.ListComponent, Object.assign({}, vnode.attrs, item), vnode.children)
            );
        }));
    }
};


const IndexList = {
    view(vnode) {
        if (vnode.attrs.children == null || vnode.attrs.children.length === 0) {
            return undefined;
        }

        vnode.attrs.ListComponent = IndexList;

        if (vnode.attrs.editable) {
            return m(EditableList, vnode.attrs, vnode.children);
        }

        return m(List, vnode.attrs, vnode.children);
    }
};


module.exports = IndexList;
