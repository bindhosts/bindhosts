let initialized = false;
let applyingHistory = false;
let layerCounter = 0;
const managedLayers = [];

function ensureBaseHistoryState() {
    if (initialized) return;
    initialized = true;

    const state = window.history.state;
    if (!state || !state.__bindhostsUiHistory) {
        window.history.replaceState({ __bindhostsUiHistory: true, depth: 0 }, "");
    }

    window.addEventListener("popstate", (event) => {
        const nextDepth = event.state?.__bindhostsUiHistory ? event.state.depth : 0;
        applyHistoryDepth(nextDepth);
    });
}

function createManagedLayer(owner, handlers) {
    return {
        id: ++layerCounter,
        owner,
        ...handlers,
    };
}

function detachLayer(layer) {
    if (!layer) return;
    layer.owner.__historyLayer = null;
}

function removeTopLayer() {
    const layer = managedLayers.pop();
    if (!layer) return;
    detachLayer(layer);
    layer.onDeactivate?.();
}

function replaceTopLayer(nextLayer) {
    const previousLayer = managedLayers.pop();
    if (previousLayer) {
        detachLayer(previousLayer);
        previousLayer.onDeactivate?.();
    }

    managedLayers.push(nextLayer);
    nextLayer.owner.__historyLayer = nextLayer;
    nextLayer.onActivate?.();

    if (previousLayer) {
        window.history.replaceState({ __bindhostsUiHistory: true, depth: 1 }, "");
    } else {
        window.history.pushState({ __bindhostsUiHistory: true, depth: 1 }, "");
    }
}

function applyHistoryDepth(targetDepth) {
    applyingHistory = true;

    while (managedLayers.length > targetDepth) {
        removeTopLayer();
    }

    applyingHistory = false;
}

function requestLayerClose(layer) {
    if (!layer) return;
    if (managedLayers.at(-1)?.id !== layer.id) return;

    if (applyingHistory) {
        removeTopLayer();
        return;
    }

    window.history.back();
}

export function hasManagedHistoryLayer() {
    return managedLayers.length > 0;
}

export function closeTopManagedLayer() {
    const topLayer = managedLayers.at(-1);
    if (!topLayer) return false;
    requestLayerClose(topLayer);
    return true;
}

export function registerManagedDialog(dialog) {
    ensureBaseHistoryState();
    if (dialog.__historyManaged) return;
    dialog.__historyManaged = true;

    const originalShow = dialog.show.bind(dialog);
    const originalClose = dialog.close.bind(dialog);

    dialog.show = (...args) => {
        if (dialog.__historyLayer || dialog.open) return;

        const layer = createManagedLayer(dialog, {
            onActivate: () => originalShow(...args),
            onDeactivate: () => {
                if (dialog.open) originalClose();
            },
        });

        replaceTopLayer(layer);
    };

    dialog.close = (...args) => {
        if (!dialog.__historyLayer) {
            if (dialog.open) originalClose(...args);
            return;
        }
        requestLayerClose(dialog.__historyLayer);
    };

    dialog.addEventListener("close", () => {
        if (applyingHistory) return;
        if (dialog.__historyLayer) {
            requestLayerClose(dialog.__historyLayer);
        }
    });

    dialog.addEventListener("cancel", () => {
        if (applyingHistory) return;
        if (dialog.__historyLayer) {
            requestLayerClose(dialog.__historyLayer);
        }
    });
}

export function registerManagedPanel(panel, handlers) {
    ensureBaseHistoryState();
    if (panel.__historyManaged) return;
    panel.__historyManaged = true;

    panel.open = () => {
        if (panel.__historyLayer || handlers.isOpen()) return;

        const layer = createManagedLayer(panel, {
            onActivate: () => handlers.open(),
            onDeactivate: () => {
                if (handlers.isOpen()) handlers.close();
            },
        });

        replaceTopLayer(layer);
    };

    panel.close = () => {
        if (!panel.__historyLayer) {
            if (handlers.isOpen()) handlers.close();
            return;
        }
        requestLayerClose(panel.__historyLayer);
    };
}
