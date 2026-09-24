"use strict";

import powerbi from "powerbi-visuals-api";
import VisualUpdateType = powerbi.VisualUpdateType;

const RESIZE_BITS = VisualUpdateType.Resize | VisualUpdateType.ResizeEnd;

/**
 * True only for Resize and/or ResizeEnd with no other flags.
 * VisualUpdateType.All includes Resize, so "has the Resize bit" is not resize-only.
 */
export function isPureResize(type: VisualUpdateType): boolean {
    if ((type & VisualUpdateType.Data) === VisualUpdateType.Data) {
        return false;
    }
    if ((type & RESIZE_BITS) === 0) {
        return false;
    }
    return (type & ~RESIZE_BITS) === 0;
}
