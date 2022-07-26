const rwClient = require("./TwitterClient.js")
const tweet = async () => {
    try {
        await rwClient.v2.tweet("Hello Worldd")
    } catch (e) {
        console.log(e)
    }
}

console.log(tweet())