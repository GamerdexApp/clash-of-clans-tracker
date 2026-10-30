import { Children } from "react";
import type { ReactNode } from "react";

/** Cards of different heights pack without gaps. Columns fill top to bottom, so the order reads down each column. */
export const Masonry = ({ children }: { children: ReactNode }) => (
	<div className="columns-1 gap-4 lg:columns-2 2xl:columns-3">
		{Children.toArray(children).map((child, index) => (
			<div key={index} className="mb-4 break-inside-avoid">
				{child}
			</div>
		))}
	</div>
);
