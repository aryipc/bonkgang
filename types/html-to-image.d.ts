
// This file provides basic type definitions for 'html-to-image',
// a JavaScript library without its own TypeScript types.

declare module 'html-to-image' {
    interface ToPngOptions {
        /**
         * A function that takes a DOM node and returns a boolean.
         * A node will be excluded from the resulting image if the function returns true.
         */
        filter?: (node: HTMLElement) => boolean;
        /**
         * A string value for the background color of the image. Defaults to `white`.
         */
        backgroundColor?: string;
        /**
         * Width of the image in pixels. Defaults to the node's width.
         */
        width?: number;
        /**
         * Height of the image in pixels. Defaults to the node's height.
         */
        height?: number;
        /**
         * An object containing CSS styles to apply to the node.
         */
        style?: Partial<CSSStyleDeclaration>;
        /**
         * The pixel ratio of the image. Defaults to the window's device pixel ratio.
         */
        pixelRatio?: number;
        /**
         * A number for the quality of the image, between 0 and 1.
         * Only for `toJpeg`.
         */
        quality?: number;
        /**
         * Set to true to link to assets from external URLs.
         */
        skipAutoScale?: boolean;
        /**
         * The cache bust control for images.
         */
        cacheBust?: boolean;
    }

    export function toPng(node: HTMLElement, options?: ToPngOptions): Promise<string>;
    export function toJpeg(node: HTMLElement, options?: ToPngOptions): Promise<string>;
    export function toBlob(node: HTMLElement, options?: ToPngOptions): Promise<Blob | null>;
    export function toSvg(node: HTMLElement, options?: ToPngOptions): Promise<string>;
}
