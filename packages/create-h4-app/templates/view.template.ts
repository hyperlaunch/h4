export const viewTs = `import { H4BaseView } from "@h4-dev/views";
import BaseLayout from "./components/base-layout.tsx";

export default class IndexView extends H4BaseView {
	render = () => (
		<BaseLayout>
			<div class="container">
				<div class="logo">H4</div>
				<p class="description">
					Welcome to h4, a batteries-included TypeScript framework built for the Bun runtime. Your h4 app is ready to build using the following CLI commands:
				</p>
				<div class="cli-info">
					<p>Usage:</p>
					<p>
						<span class="cli-command">bun run h4 create controller</span>
						&lt;path/to/controller&gt;
					</p>
					<p>
						<span class="cli-command">bun run h4 create model</span>
						&lt;model-name&gt; [field:type ...]
					</p>
					<p>
						<span class="cli-command">bun run h4 create job</span>
						&lt;job-name&gt; [prop:type ...]
					</p>
					<p>
						<span class="cli-command">bun run h4 create view</span>
						&lt;view-name&gt; [prop:type ...]
					</p>
					<p>
						<span class="cli-command">bun run h4 create component</span>
						&lt;component-name&gt; [prop:type ...]
					</p>
				</div>
			</div>
		</BaseLayout>
	);
}`;
