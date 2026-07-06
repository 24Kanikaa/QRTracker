require("dotenv").config();

const app = require("./src/app");
const initialize = require("./src/database/init");

const PORT = process.env.PORT || 5000;

(async () => {
    try {

        await initialize();

        app.listen(PORT, () => {
            console.log("--------------------------------");
            console.log(`🚀 Server running on port ${PORT}`);
            console.log("--------------------------------");
        });

    } catch (err) {

        console.error(err);

    }
})();