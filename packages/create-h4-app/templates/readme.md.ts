export const readmeMd = (name: string) => `# ${name}

This project was created using [H4](https://h4.dev), a fast, batteries-included TypeScript framework for [Bun](https://bun.sh).

To install dependencies:

\`\`\`bash
bun install
\`\`\`

To run initial migrations:

\`\`\`bash
bun run dbmate up
\`\`\`

To start the development server:

\`\`\`bash
bun run dev
\`\`\`

Your app will be available at [http://localhost:3000](http://localhost:3000).

To create your first model (and corresponding db migration):

\`\`\`bash
bun run h4 create model User id:string:pk email:string:unique name:string address:string:optional
\`\`\`

To create your first controller:

\`\`\`bash
bun run h4 create controller users
\`\`\`

To create your first job:

\`\`\`bash
bun run h4 create job MyAsyncJob
\`\`\`

Your app database will be created at:

\`\`\`
./storage/primary.db
\`\`\`

Your queue database will be created at:

\`\`\`
./storage/queue.db
\`\`\``;
