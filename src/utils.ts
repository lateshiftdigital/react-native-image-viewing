/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  PanResponderInstance,
  NativeTouchEvent,
} from "react-native";
import { Dimensions, Position } from "./@types";

type CacheStorageItem = { key: string; value: any };

export const createCache = (cacheSize: number) => ({
  _storage: [] as CacheStorageItem[],
  get(key: string): any {
    const { value } =
      this._storage.find(({ key: storageKey }) => storageKey === key) || {};

    return value;
  },
  set(key: string, value: any) {
    if (this._storage.length >= cacheSize) {
      this._storage.shift();
    }

    this._storage.push({ key, value });
  },
});

export const splitArrayIntoBatches = (arr: any[], batchSize: number): any[] =>
  arr.reduce((result, item) => {
    const batch = result.pop() || [];

    if (batch.length < batchSize) {
      batch.push(item);
      result.push(batch);
    } else {
      result.push(batch, [item]);
    }

    return result;
  }, []);

export const getImageTransform = (
  image: Dimensions | null,
  screen: Dimensions
) => {
  if (!image?.width || !image?.height) {
    return [] as const;
  }

  const wScale = screen.width / image.width;
  const hScale = screen.height / image.height;
  const scale = Math.min(wScale, hScale);
  const { x, y } = getImageTranslate(image, screen);

  return [{ x, y }, scale] as const;
};

export const getImageStyles = (
  image: Dimensions | null,
  translate: Animated.ValueXY,
  scale?: Animated.Value
) => {
  if (!image?.width || !image?.height) {
    return { width: 0, height: 0 };
  }

  const transform = translate.getTranslateTransform();

  if (scale) {
    transform.push({ scale }, { perspective: new Animated.Value(1000) });
  }

  return {
    width: image.width,
    height: image.height,
    transform,
  };
};

export const getImageTranslate = (
  imageDimensions: Dimensions,
  layout: Dimensions
): Position => {
  const { width, height } = layout;
  return {
    x: (width - imageDimensions.width) / 2,
    y: (height - imageDimensions.height) / 2,
  };
};

export const getImageDimensionsByTranslate = (
  translate: Position,
  layout: Dimensions
): Dimensions => {
  const { width, height } = layout;
  return {
    width: width - translate.x * 2,
    height: height - translate.y * 2,
  };
};

export const getImageTranslateForScale = (
  currentTranslate: Position,
  targetScale: number,
  layout: Dimensions
): Position => {
  const { width, height } = getImageDimensionsByTranslate(
    currentTranslate,
    layout
  );

  const targetImageDimensions = {
    width: width * targetScale,
    height: height * targetScale,
  };

  return getImageTranslate(targetImageDimensions, layout);
};

type HandlerType = (
  event: GestureResponderEvent,
  state: PanResponderGestureState
) => void;

type PanResponderProps = {
  onGrant: HandlerType;
  onStart?: HandlerType;
  onMove: HandlerType;
  onRelease?: HandlerType;
  onTerminate?: HandlerType;
};

export const createPanResponder = ({
  onGrant,
  onStart,
  onMove,
  onRelease,
  onTerminate,
}: PanResponderProps): PanResponderInstance =>
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: onGrant,
    onPanResponderStart: onStart,
    onPanResponderMove: onMove,
    onPanResponderRelease: onRelease,
    onPanResponderTerminate: onTerminate,
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => false,
  });

export const getDistanceBetweenTouches = (
  touches: NativeTouchEvent[]
): number => {
  const [a, b] = touches;

  if (a == null || b == null) {
    return 0;
  }

  return Math.sqrt(
    Math.pow(a.pageX - b.pageX, 2) + Math.pow(a.pageY - b.pageY, 2)
  );
};
