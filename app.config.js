import "dotenv/config"; // loads .env into process.env
export default ({ config }) => {
	return {
		...config,
		android: {
			...config.android,
			config: {
				googleMaps: {
					apiKey: process.env.GOOGLE_MAPS_API,
				},
			},
			// optional: set package name here if not in app.json
			// package: "com.yourcompany.rotwalker",
		},
		ios: {
			...config.ios,
			config: {
				googleMapsApiKey: process.env.GOOGLE_MAPS_API,
			},
		},
	};
};
