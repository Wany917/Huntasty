import * as Twoslash from "fumadocs-twoslash/ui";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Mermaid } from "@/components/mermaid";

export function getMDXComponents(components?: MDXComponents) {
	return {
		...defaultMdxComponents,
		...Twoslash,
		Tab,
		Tabs,
		Mermaid,
		...components,
	} satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
	type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
