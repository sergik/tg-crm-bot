import { Bot, InlineKeyboard, Context } from "grammy";
import { ContactStateMachine } from "./contact.state.machine";
import { TempContactStore } from "./temp.contact.store";
import { config } from "./config";

const bot = new Bot(config.BOT_TOKEN);

const tmpContactStore = new TempContactStore();
const stateMachine = new ContactStateMachine(tmpContactStore);

bot.command("a", async (ctx) => {
  await dispatchWithErrorHandling(ctx, async () =>
    stateMachine.dispatch("start", { ctx })
  );
});

bot.command("c", async (ctx) => {
  await dispatchWithErrorHandling(ctx, async () =>
    stateMachine.dispatch("cancel", { ctx })
  );
});

bot.on("message", async (ctx) => {
  await dispatchWithErrorHandling(ctx, async () =>
    stateMachine.dispatch("input", { ctx })
  );
});

bot.command("praise", async (ctx) => {
  const author = await ctx.getAuthor();
  await ctx.reply(`${author.user.first_name} molodec`);
});

bot.command("pnh", async (ctx) => {
  const author = await ctx.getAuthor();
  await ctx.reply(`${author.user.first_name}, idi ty nahui!`);
});

bot.start();

async function dispatchWithErrorHandling(
  ctx: Context,
  actonHandler: () => Promise<void>
): Promise<void> {
  try {
    await actonHandler();
  } catch (e) {
    ctx.reply("Unexpected input");
    console.error(e);
  }
}
