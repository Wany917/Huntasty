import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const gitConfig = {
	user: "huntasty",
	repo: "huntasty",
	branch: "main",
};

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: "Huntasty Docs",
		},
	};
}
