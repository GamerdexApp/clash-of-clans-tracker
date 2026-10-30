import Image from "next/image";

const MAX_IMAGE_LEVEL = 18;

export const TownHallIcon = ({ level, size }: { level: number; size: number }) => {
	const imageLevel = Math.min(Math.max(Math.floor(level), 1), MAX_IMAGE_LEVEL);

	return (
		<Image
			src={`/images/home/town-hall/normal/level-${imageLevel}.png`}
			alt=""
			width={size}
			height={size}
			style={{ width: size, height: size }}
			className="shrink-0 object-contain"
		/>
	);
};
