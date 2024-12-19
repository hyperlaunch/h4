export const layoutTs = ({
	skipFrontend = false,
}: {
	skipFrontend: boolean;
}) => `import { assetUrl } from "@h4-dev/frontend/assets";

export default function BaseLayout({children}: {children: JSX.Element}) {
	return (
        <>
            {'<!doctype html>'}
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Your App Title</title>
                ${
									skipFrontend
										? ""
										: `<link rel="stylesheet" href={assetUrl("main.css")} />
<link rel="icon" href="/favicon.ico" type="image/x-icon" />`
								}
                <meta name="description" content="A brief description of your app for SEO." />
                <meta name="theme-color" content="#ffffff" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            </head>
            <body>
                {children}
                ${skipFrontend ? "" : `<script type="module" src={assetUrl("main.ts")} />`}
            </body>
            </html>
        </>
    );
}`;
