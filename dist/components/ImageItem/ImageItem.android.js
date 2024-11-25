/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import React, { useCallback, useRef, useState, useMemo, useEffect } from "react";
import { Animated, ScrollView, } from "react-native";
import useImageDimensions from "../../hooks/useImageDimensions";
import usePanResponder from "../../hooks/usePanResponder";
import { getImageStyles, getImageTransform } from "../../utils";
import ImageLoading from "./ImageLoading";
const SWIPE_CLOSE_OFFSET = 75;
const SWIPE_CLOSE_VELOCITY = 1.75;
const ImageItem = ({ imageSrc, onZoom, onRequestClose, onLongPress, delayLongPress, swipeToCloseEnabled = true, doubleTapToZoomEnabled = true, layout }) => {
    const imageContainer = useRef(null);
    const imageDimensions = useImageDimensions(imageSrc);
    const [translate, scale] = getImageTransform(imageDimensions, layout);
    const scrollValueY = new Animated.Value(0);
    const [isLoaded, setLoadEnd] = useState(false);
    const onLoaded = useCallback(() => setLoadEnd(true), []);
    const onZoomPerformed = useCallback((isZoomed) => {
        var _a;
        onZoom(isZoomed);
        if ((_a = imageContainer) === null || _a === void 0 ? void 0 : _a.current) {
            imageContainer.current.setNativeProps({
                scrollEnabled: !isZoomed,
            });
        }
    }, [imageContainer]);
    const onLongPressHandler = useCallback(() => {
        onLongPress(imageSrc);
    }, [imageSrc, onLongPress]);
    const [panHandlers, scaleValue, translateValue] = usePanResponder({
        initialScale: scale || 1,
        initialTranslate: translate || { x: 0, y: 0 },
        onZoom: onZoomPerformed,
        doubleTapToZoomEnabled,
        onLongPress: onLongPressHandler,
        delayLongPress,
        layout,
    });
    const imagesStyles = getImageStyles(imageDimensions, translateValue, scaleValue);
    const imageOpacity = scrollValueY.interpolate({
        inputRange: [-SWIPE_CLOSE_OFFSET, 0, SWIPE_CLOSE_OFFSET],
        outputRange: [0.7, 1, 0.7],
    });
    const imageStylesWithOpacity = { ...imagesStyles, opacity: imageOpacity };
    const onScrollEndDrag = ({ nativeEvent, }) => {
        var _a, _b, _c, _d, _e, _f;
        const velocityY = (_c = (_b = (_a = nativeEvent) === null || _a === void 0 ? void 0 : _a.velocity) === null || _b === void 0 ? void 0 : _b.y, (_c !== null && _c !== void 0 ? _c : 0));
        const offsetY = (_f = (_e = (_d = nativeEvent) === null || _d === void 0 ? void 0 : _d.contentOffset) === null || _e === void 0 ? void 0 : _e.y, (_f !== null && _f !== void 0 ? _f : 0));
        if ((Math.abs(velocityY) > SWIPE_CLOSE_VELOCITY &&
            offsetY > SWIPE_CLOSE_OFFSET) ||
            offsetY > layout.height / 2) {
            onRequestClose();
        }
    };
    const onScroll = ({ nativeEvent, }) => {
        var _a, _b, _c;
        const offsetY = (_c = (_b = (_a = nativeEvent) === null || _a === void 0 ? void 0 : _a.contentOffset) === null || _b === void 0 ? void 0 : _b.y, (_c !== null && _c !== void 0 ? _c : 0));
        scrollValueY.setValue(offsetY);
    };
    // Reset scroll position when layout changes
    useEffect(() => {
        if (imageContainer.current) {
            imageContainer.current.scrollTo({ x: 0, y: 0, animated: false });
        }
    }, [layout.width, layout.height]);
    const dynamicStyles = useMemo(() => ({
        listItem: {
            width: layout.width,
            height: layout.height,
        },
        imageScrollContainer: {
            height: layout.height * 2,
        },
    }), [layout.width, layout.height]);
    return (<ScrollView ref={imageContainer} style={dynamicStyles.listItem} pagingEnabled nestedScrollEnabled showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} contentContainerStyle={dynamicStyles.imageScrollContainer} scrollEnabled={swipeToCloseEnabled} {...(swipeToCloseEnabled && {
        onScroll,
        onScrollEndDrag,
    })}>
      <Animated.Image {...panHandlers} source={imageSrc} style={imageStylesWithOpacity} onLoad={onLoaded}/>
      {(!isLoaded || !imageDimensions) && <ImageLoading />}
    </ScrollView>);
};
export default React.memo(ImageItem);
