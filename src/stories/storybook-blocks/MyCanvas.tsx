import { MySourceCode } from "./MySourceCode";
import { useState } from "react";
import type {  StoryName, ModuleExport } from "storybook/internal/types";
import { getBaseUrl } from "../helpers/base-url";
import { Canvas } from "@storybook/addon-docs/blocks";
import { hrefTo } from "@storybook/addon-links";

async function fullscreenHrefTo(title: any, name: StoryName): Promise<string> {
  const hrefToLink = await hrefTo(title, name);
  const originalUrl = new URL(hrefToLink);

  const pathParam = originalUrl.searchParams.get("path");

  if (!pathParam) {
    throw new Error("Path parameter not found in the URL");
  }

  // Construct the new URL
  return `${getBaseUrl()}iframe.html?args=&id=${pathParam.replace("/story/", "")}&viewMode=story`;
}


export type MyCanvasType = {
  /**
   * Same as the of parameter on the storybook canvas  https://storybook.js.org/docs/react/api/doc-block-canvas & it can include the soureCode defined on the DocumentedStory type
   */
  of: ModuleExport,
  /**
   *  Hides the storybook border on the canvas, can be useful when the component itself has a border which we want to showcase.
   */
  hideBorderOnCanvas?: boolean,
  /**
   * Hides the Source Code
   */
  hideSourceCode?: boolean,
  /**
   * Hides the Fullscreen button
   */
  hideFullscreenButton?: boolean
}


/**
 * Renders storybook Canvas & the code block
 */
export const MyCanvas = ({ of, hideBorderOnCanvas, hideSourceCode, hideFullscreenButton }: MyCanvasType) => {
  const [showCodeBlock, setShowCodeBlock] = useState(false);

  function toggleCodeBlock() {
    setShowCodeBlock(!showCodeBlock);
  }

  const additionalActions = [];

  if (!hideSourceCode) {
    additionalActions.push({
      title: "Show Code",
      onClick: toggleCodeBlock
    });
  }

  if (!hideFullscreenButton) {
    additionalActions.push({
      title: "Fullscreen",
      onClick: async () => {
        const fullscreenHref = await fullscreenHrefTo(of.metaTitle, of.name);
        window.open(fullscreenHref, "_blank");
      }
    });
  }

  return (
    <>
      <Canvas
        className={hideBorderOnCanvas ? "my-canvas my-canvas--hide-border" : "my-canvas"}
        key={Number(showCodeBlock)}
        sourceState="none"
        of={of}
        additionalActions={additionalActions} // Use the dynamically created array
      ></Canvas>
      {of.sourceCode && !hideSourceCode && showCodeBlock && (
        <MySourceCode sourceCode={of.sourceCode}></MySourceCode>
      )}
    </>
  );
};
