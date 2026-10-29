import { settingsText } from "@/lib/messages/settings";
import { APP_NAME } from "@/data/nav";
import { GAME_URL } from "@/data/site";
import { SettingsCard } from "./SettingsCard";

const text = settingsText.about;

export const AboutTab = () => (
	<div className="max-w-2xl">
		<SettingsCard title={APP_NAME} description={text.version(process.env.NEXT_PUBLIC_APP_VERSION ?? "")}>
			<p>{text.summary}</p>
			<p>
				<a
					href={GAME_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="text-link inline-flex min-h-11 items-center font-medium underline lg:min-h-9"
				>
					{text.officialGame}
				</a>
			</p>
			<p className="text-muted">{text.disclaimer}</p>
		</SettingsCard>
	</div>
);
