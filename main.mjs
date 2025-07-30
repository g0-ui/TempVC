// 必要なモジュールをインポート
const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

// Botのクライアントを作成
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

// Botが起動したときの処理
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ボイスチャンネルの参加・退出を監視
client.on("voiceStateUpdate", (oldState, newState) => {
  // ユーザーがボイスチャンネルに参加した場合
  if (oldState.channelId === null && newState.channelId !== null) {
    // ユーザー名を元に一時的なボイスチャンネルを作成
    newState.guild.channels
      .create({
        name: `${newState.member.user.username}'s VC`,
        type: 2, // ボイスチャンネル
        parent: newState.channel.parent,
        userLimit: 10,
        reason: "Temporary voice channel for the user",
      })
      .then((channel) => {
        // ユーザーを新しいチャンネルに移動
        newState.setChannel(channel);

        // チャンネルが空になったら削除
        const interval = setInterval(() => {
          if (channel.members.size === 0) {
            clearInterval(interval);
            channel.delete();
          }
        }, 5000);
      });
  }

  // ユーザーがボイスチャンネルから退出した場合
  if (newState.channelId === null && oldState.channelId !== null) {
    // チャンネルが空になったら削除
    if (oldState.channel.members.size === 0) {
      oldState.channel.delete();
    }
  }
});

// Botにログイン
client.login(process.env.DISCORD_TOKEN);
