"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";

export function Mermaid({ chart }: { chart: string }) {
	const id = useId();
	const containerRef = useRef<HTMLDivElement>(null);
	const [svg, setSvg] = useState("");
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		let cancelled = false;

		async function render() {
			const mermaid = (await import("mermaid")).default;
			mermaid.initialize({
				startOnLoad: false,
				theme: resolvedTheme === "dark" ? "dark" : "default",
				securityLevel: "loose",
			});

			const uniqueId = `mermaid-${id.replace(/:/g, "")}`;
			const { svg: rendered } = await mermaid.render(uniqueId, chart);
			if (!cancelled) {
				setSvg(rendered);
			}
		}

		render();
		return () => {
			cancelled = true;
		};
	}, [chart, id, resolvedTheme]);

	return (
		<div
			ref={containerRef}
			className="my-6 flex justify-center [&>svg]:max-w-full"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Mermaid SVG output
			dangerouslySetInnerHTML={{ __html: svg }}
		/>
	);
}
