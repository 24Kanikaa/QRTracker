require("dotenv").config();

const app = require("./src/app");
const initialize = require("./src/database/init");

const PORT = process.env.PORT;

(async () => {
    try {

        await initialize();

        app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {

        console.error(err);

    }
})();