const core = require("@actions/core");
const fetch = require("node-fetch");

(async () => {
  try {
    const payload = {
      channel: `${core.getInput("channel")}`,
      attachments: [
        {
          color: status === "success" ? "#2e993e" : status === "failure" ? "#bd0f26" : "#d29d0c",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Github Action: *${status === "success" ? "SUCCESS" : status === "failure" ? "FAILURE" : "CANCELLED"}*`,
              }
            }
          ]
        }
      ]
    };

    const rest = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": payload.length,
        Authorization: `Bearer ${core.getInput("slack-bot-token")}`,
        Accept: "application/json",
      }
    });
    if (!res.ok) {
      throw new Error(`Server error ${res.status}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();
