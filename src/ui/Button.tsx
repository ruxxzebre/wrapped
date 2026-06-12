import type { ButtonHTMLAttributes } from "react";
import * as css from "./Button.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "nav" | "chrome" | "link";
	/** Highlighted state for the nav variant. */
	active?: boolean;
};

export function Button({ variant = "chrome", active, ...rest }: Props) {
	const className =
		variant === "nav" && active
			? `${css.variant.nav} ${css.navActive}`
			: css.variant[variant];
	return <button type="button" className={className} {...rest} />;
}
