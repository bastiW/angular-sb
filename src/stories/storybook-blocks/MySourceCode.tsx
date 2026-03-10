import { Fragment, useState, CSSProperties } from "react";
import type { ComponentProps, FC } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Source as StorybookSource } from "@storybook/addon-docs/blocks";
import { SyntaxHighlighter } from "storybook/internal/components";

interface Source {
  /**
   * The language the syntax highlighter uses for your story’s code
   */
  language?: string;
  /**
   * Use this to override the content of the source block.
   */
  code?: string;
  /**
   * The (prettier) formatter the syntax highlighter uses for your story’s code.
   */
  format?: ComponentProps<typeof SyntaxHighlighter>["format"];
}

export type AdditionalSourceCode = {
  displayedFileName: string;
  source: string;
  lang: "html" | "typescript";
};

export type SourceCode = {
  htmlComponentSource?: string;
  tsComponentSource?: string;
  additionalSourceFiles?: AdditionalSourceCode[];
};

export const MySourceCode: FC<{ sourceCode: SourceCode }> = ({
  sourceCode,
}) => {
  const { htmlComponentSource, tsComponentSource, additionalSourceFiles } =
    sourceCode;

  const tabs: string[] = [];
  if (htmlComponentSource) tabs.push("html");
  if (tsComponentSource) tabs.push("tsComponent");
  if (additionalSourceFiles) {
    for (const f of additionalSourceFiles) {
      tabs.push(f.displayedFileName);
    }
  }

  const [selectedTab, setSelectedTab] = useState<string>(tabs[0] || "");

  const baseTabStyle: CSSProperties = {
    backgroundColor: "transparent",
    color: "white",
    border: "2px solid transparent",
    margin: "2px",
    cursor: "pointer",
    fontFamily:
      '"Nunito Sans", -apple-system, ".SFNSText-Regular", "San Francisco", BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
  };

  return (
    <div style={{ backgroundColor: "#1B1C1D" }}>
      <TabGroup
        selectedIndex={tabs.indexOf(selectedTab)}
        onChange={(idx) => setSelectedTab(tabs[idx])}
      >
        <TabList style={{ display: "flex", justifyContent: "end" }}>
          {htmlComponentSource && (
            <Tab as={Fragment} key="html">
              {({ selected }) => (
                <button
                  onClick={() => setSelectedTab("html")}
                  style={{
                    ...baseTabStyle,
                    borderBottomColor:
                      selectedTab === "html" ? "lightblue" : "transparent",
                    fontWeight: selectedTab === "html" ? "bold" : "normal",
                  }}
                >
                  HTML Component
                </button>
              )}
            </Tab>
          )}
          {tsComponentSource && (
            <Tab as={Fragment} key="tsComponent">
              {({ selected }) => (
                <button
                  onClick={() => setSelectedTab("tsComponent")}
                  style={{
                    ...baseTabStyle,
                    borderBottomColor:
                      selectedTab === "tsComponent"
                        ? "lightblue"
                        : "transparent",
                    fontWeight:
                      selectedTab === "tsComponent" ? "bold" : "normal",
                  }}
                >
                  TS Component
                </button>
              )}
            </Tab>
          )}
          {additionalSourceFiles?.map((sourceFile) => (
            <Tab as={Fragment} key={sourceFile.displayedFileName}>
              {({ selected }) => (
                <button
                  onClick={() => setSelectedTab(sourceFile.displayedFileName)}
                  style={{
                    ...baseTabStyle,
                    fontWeight:
                      selectedTab === sourceFile.displayedFileName
                        ? "bold"
                        : "normal",
                    borderBottomColor:
                      selectedTab === sourceFile.displayedFileName
                        ? "lightblue"
                        : "transparent",
                  }}
                >
                  {sourceFile.displayedFileName}
                </button>
              )}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {htmlComponentSource && (
            <TabPanel key="panel-html">
              <StorybookSource
                code={htmlComponentSource}
                language="html"
                // format can be undefined or true/false depending on usage
                format={true}
                dark={true}
              />
            </TabPanel>
          )}
          {tsComponentSource && (
            <TabPanel key="panel-ts">
              <StorybookSource
                code={tsComponentSource}
                language="typescript"
                format={true}
                dark={true}
              />
            </TabPanel>
          )}
          {additionalSourceFiles?.map((sourceFile) => (
            <TabPanel key={`panel-${sourceFile.displayedFileName}`}>
              <StorybookSource
                code={sourceFile.source}
                language={sourceFile.lang}
                format={true}
                dark={true}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
};
