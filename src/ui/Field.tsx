import type {
	InputHTMLAttributes,
	ReactNode,
	SelectHTMLAttributes,
} from "react";
import * as css from "./Field.css";

/** Horizontal bar of form controls above a view's content. */
export function ControlsBar({ children }: { children: ReactNode }) {
	return <div className={css.bar}>{children}</div>;
}

/** Small uppercase-ish label stacked over a control. */
export function Field({
	label,
	children,
}: {
	label: ReactNode;
	children: ReactNode;
}) {
	return (
		// biome-ignore lint/a11y/noLabelWithoutControl: the control is passed in via children
		<label className={css.field}>
			{label}
			{children}
		</label>
	);
}

export function Input({
	width,
	...rest
}: InputHTMLAttributes<HTMLInputElement> & { width?: string }) {
	return (
		<input
			className={css.input}
			style={width ? { width } : undefined}
			{...rest}
		/>
	);
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
	return <select className={css.select} {...props} />;
}
