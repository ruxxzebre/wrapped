import type { ReactNode } from "react";
import * as css from "./Modal.css";

/** Centered-top modal; clicking the backdrop closes it. */
export function Modal({
	onClose,
	children,
}: {
	onClose: () => void;
	children: ReactNode;
}) {
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: backdrop click-to-close; Escape is handled by the opener
		<div className={css.backdrop} onMouseDown={onClose}>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: stops backdrop close when clicking inside */}
			<div className={css.modal} onMouseDown={(e) => e.stopPropagation()}>
				{children}
			</div>
		</div>
	);
}
