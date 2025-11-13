import { Client, GatewayIntentBits } from "discord.js";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Botへのメンションがない場合は無視
  if (!message.mentions.has(client.user)) return;

  message.channel.sendTyping();

  try {
    const username = message.author.username;

    const userMessage = message.content
      .replace(`<@${client.user.id}>`, "")
      .trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "あなたはDiscordサーバー内のAIアシスタントです。ユーザーの発言を読み取り、自然に返答してください。返信にはリプライ形式を使わず、通常メッセージとして返答してください。" 
        },
        { 
          role: "user", 
          content: `発言者:${username} ${userMessage}`
        }
      ]
    });

    const reply = completion.choices[0].message.content;

    // リプライではなく send() で送る
    message.channel.send(reply);

  } catch (err) {
    console.error(err);
    message.channel.send("エラーが起きちゃったよ…");
  }
});

client.login(process.env.DISCORD_TOKEN);
