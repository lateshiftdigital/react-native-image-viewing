/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useState, useEffect, useCallback } from "react";
const useImageIndexChange = (imageIndex, layout) => {
    const [currentImageIndex, setImageIndex] = useState(imageIndex);
    // Reset to initial index if layout changes significantly
    useEffect(() => {
        if (layout.width > 0) {
            setImageIndex(imageIndex);
        }
    }, [layout.width]);
    const onScroll = useCallback((event) => {
        const { nativeEvent: { contentOffset: { x: scrollX }, }, } = event;
        if (layout.width) {
            const nextIndex = Math.round(scrollX / layout.width);
            setImageIndex(nextIndex < 0 ? 0 : nextIndex);
        }
    }, [layout.width]);
    return [currentImageIndex, onScroll];
};
export default useImageIndexChange;
