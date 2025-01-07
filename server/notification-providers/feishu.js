const NotificationProvider = require("./notification-provider");
const axios = require("axios");
const { DOWN, UP } = require("../../src/util");

class Feishu extends NotificationProvider {
    name = "Feishu";

    /**
     * @inheritdoc
     */
    async send(notification, msg, monitorJSON = null, heartbeatJSON = null) {
        const okMsg = "Sent Successfully.";

        try {
            if (heartbeatJSON == null) {
                let testdata = {
                    msg_type: "text",
                    content: {
                        text: msg,
                    },
                };
                await axios.post(notification.feishuWebHookUrl, testdata);
                return okMsg;
            }

            if (heartbeatJSON["status"] === DOWN) {
                let downdata = {
                    msg_type: "interactive",
                    card: {
                        config: {
                            update_multi: false,
                            wide_screen_mode: true,
                        },
                        header: {
                            title: {
                                tag: "plain_text",
                                content: "Alert: [Down] " + heartbeatJSON["msg"],
                            },
                            template: "red",
                        },
                        elements: [
                            {
                                tag: "div",
                                text: {
                                    tag: "lark_md",
                                    content: getContent(heartbeatJSON, monitorJSON), // 修改这里以传递 monitorJSON
                                },
                            }
                        ]
                    }
                };
                await axios.post(notification.feishuWebHookUrl, downdata);
                return okMsg;
            }

            if (heartbeatJSON["status"] === UP) {
                let updata = {
                    msg_type: "interactive",
                    card: {
                        config: {
                            update_multi: false,
                            wide_screen_mode: true,
                        },
                        header: {
                            title: {
                                tag: "plain_text",
                                content: "Alert: [Up]" + heartbeatJSON["msg"],
                            },
                            template: "green",
                        },
                        elements: [
                            {
                                tag: "div",
                                text: {
                                    tag: "lark_md",
                                    content: getContent(heartbeatJSON, monitorJSON), // 修改这里以传递 monitorJSON
                                },
                            },
                        ]
                    }
                };
                await axios.post(notification.feishuWebHookUrl, updata);
                return okMsg;
            }
        } catch (error) {
            this.throwGeneralAxiosError(error);
        }
    }
}

/**
 * Get content
 * @param {?object} heartbeatJSON Heartbeat details (For Up/Down only)
 * @param {?object} monitorJSON Monitor details
 * @returns {string} Return Successful Message
 */
function getContent(heartbeatJSON, monitorJSON) {
    return [
        "**Message**: " + monitorJSON["name"],
        `**Time (${heartbeatJSON["timezone"]})**: ${heartbeatJSON["localDateTime"]}`
    ].join("\n");
}

module.exports = Feishu;