const NotificationProvider = require("./notification-provider");
const axios = require("axios");
const { setSettings, setting } = require("../util-server");
const { getMonitorRelativeURL, UP } = require("../../src/util");

class Slack extends NotificationProvider {
    name = "slack";

    /**
     * Deprecated property notification.slackbutton
     * Set it as primary base url if this is not yet set.
     * @deprecated
     * @param {string} url The primary base URL to use
     * @returns {Promise<void>}
     */
    static async deprecateURL(url) {
        let currentPrimaryBaseURL = await setting("primaryBaseURL");

        if (!currentPrimaryBaseURL) {
            console.log("Move the url to be the primary base URL");
            await setSettings("general", {
                primaryBaseURL: url,
            });
        } else {
            console.log("Already there, no need to move the primary base URL");
        }
    }

    /**
     * @inheritdoc
     */
    async send(notification, msg, monitorJSON = null, heartbeatJSON = null) {
        const okMsg = "Sent Successfully.";

        if (notification.slackchannelnotify) {
            msg += " <!channel>";
        }

        try {
            if (heartbeatJSON == null) {
                let data = {
                    "text": msg,
                    "channel": notification.slackchannel,
                    "username": notification.slackusername,
                    "icon_emoji": notification.slackiconemo,
                };
                await axios.post(notification.slackwebhookURL, data);
                return okMsg;
            }

            const baseURL = await setting("primaryBaseURL");

            const title = "Uptime Kuma Alert-test";
            const combinedMessage = `${msg}`;

            let data = {
                "text": combinedMessage,
                "channel": notification.slackchannel,
                "username": notification.slackusername,
                "icon_emoji": notification.slackiconemo,
            };

            if (notification.slackbutton) {
                await Slack.deprecateURL(notification.slackbutton);
            }

            await axios.post(notification.slackwebhookURL, data);
            return okMsg;
        } catch (error) {
            this.throwGeneralAxiosError(error);
        }

    }
}

module.exports = Slack;
