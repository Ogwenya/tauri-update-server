// #################################################
// ############	API KEY AUTHENTICATION	############
// #################################################
exports.checkApiKey = async (req, res, next) => {
	const apiKey = req.query.api_key;

	// // check jwt exists and is valid
	if (apiKey) {
		if (apiKey === process.env.API_KEY) {
			next();
		} else {
			res.status(400).json({ error: "Authentication Error" });
		}
	} else {
		res.status(400).json({ error: "Unauthenticated" });
	}
};
