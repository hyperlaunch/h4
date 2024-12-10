import log from "./logger";

export type H4Service = () => Promise<void>;

export default async function h4(services: H4Service[]) {
	const asciiArt = `
 _     _   __    
| |   | | / /    
| |__ | |/ /____ 
|  __)| |___   _)
| |   | |   | |  
|_|   |_|   |_|  
                  `;

	log({
		type: "INFO",
		message: `Starting H4\n${asciiArt}`,
		color: "magenta",
	});
	await Promise.all(services.map((service) => service()));
}
