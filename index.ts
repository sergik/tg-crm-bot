import { Bot, Context } from "grammy";
import { ContactStateMachine } from "./contact.state.machine";
import { TempContactStore } from "./temp.contact.store";
import { config } from "./config";
import { leadButton, notLeadButton } from "./state.actions/to.is.lead";
import { buttons as priorityButtons } from "./state.actions/to.priority";
import { GoogleSheetsStore } from "./crm/hubspot/google.sheets.store";
import { checkTokenExists } from "./crm/hubspot/google.auth";
import { getActionFromInput, getMainMenuMarkup } from "./telegram/utils";

const bot = new Bot(config.BOT_TOKEN);
const store = new GoogleSheetsStore(config.SPREADSHEET_ID);

const tmpContactStore = new TempContactStore();
const stateMachine = new ContactStateMachine(tmpContactStore, store);

bot.command("a", async (ctx) => {
  await dispatchWithErrorHandling(ctx, async () => {
    if (checkTokenExists()) {
      await stateMachine.dispatch("start", { ctx });
    } else {
      await stateMachine.dispatch("authorize", { ctx });
    }
  });
});

bot.command("auth", async (ctx) => {
  await dispatchWithErrorHandling(ctx, async () => {
    await stateMachine.dispatch("authorize", { ctx });
  });
});

bot.command("c", async (ctx) => {
  await dispatchWithErrorHandling(
    ctx,
    async () => await stateMachine.dispatch("cancel", { ctx })
  );
});

bot.command("s", async (ctx) => {
  await dispatchWithErrorHandling(
    ctx,
    async () => await stateMachine.dispatch("submit", { ctx })
  );
});

bot.command("start", async (ctx) => {
  await ctx.reply("Welcome to the crm bot! Please choose an option:", {
    reply_markup: getMainMenuMarkup(),
  });
});

bot.on("callback_query:data", async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  const action = getActionFromInput(callbackData);
  await dispatchWithErrorHandling(
    ctx,
    async () => await stateMachine.dispatch(action, { ctx })
  );
});

bot.on("message", async (ctx) => {
  if (stateMachine.getCurrentState() !== "idle") {
    await dispatchWithErrorHandling(
      ctx,
      async () => await stateMachine.dispatch("input", { ctx })
    );
  }
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

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
