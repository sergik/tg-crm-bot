import { Bot, Context } from "grammy";
import { ContactStateMachine } from "./contact.state.machine";
import { TempContactStore } from "./temp.contact.store";
import { config } from "./config";
import { GoogleSheetsStore } from "./crm/google.sheets.store";
import { checkTokenExists } from "./crm/google.auth";
import { getActionFromInput, getMainMenuMarkup } from "./telegram/utils";
import { AppDataSource } from "./store/datasoruce";
import { executeStateAction, getCurrentState, resetState } from "./utils";

AppDataSource.initialize()
  .then(() => {
    console.log("Database synchronized!");
  })
  .catch((error) => console.error(error));
const bot = new Bot(config.TG_BOT_TOKEN);

bot.command("a", async (ctx) => {
  await dispatchWithErrorHandling(ctx, async () => {
    if (checkTokenExists()) {
      await executeStateAction(ctx, "start");
    } else {
      await executeStateAction(ctx, "authorize");
    }
  });
});

bot.command("auth", async (ctx) => {
  await dispatchWithErrorHandling(ctx, async () => {
    await executeStateAction(ctx, "authorize");
  });
});

bot.command("c", async (ctx) => {
  await dispatchWithErrorHandling(
    ctx,
    async () => await executeStateAction(ctx, "cancel")
  );
});

bot.command("trace", async (ctx) => {
  const state = await getCurrentState(ctx);
  ctx.reply(state);
});

bot.command("reset", async (ctx) => {
  await resetState(ctx);
  ctx.reply("Reseted");
});

bot.command("cancel", async (ctx) => {
  await dispatchWithErrorHandling(
    ctx,
    async () => await executeStateAction(ctx, "cancel")
  );
});

bot.command("s", async (ctx) => {
  await dispatchWithErrorHandling(
    ctx,
    async () => await executeStateAction(ctx, "submit")
  );
});

bot.command("start", async (ctx) => {
  await ctx.reply("Welcome to the crm bot! Please choose an option:", {
    reply_markup: getMainMenuMarkup(),
  });
});

bot.on("callback_query:data", async (ctx) => {
  const callbackData = ctx.callbackQuery.data;
  let action = getActionFromInput(callbackData);
  if (action === "start" && !checkTokenExists()) {
    action = "authorize";
  }
  await dispatchWithErrorHandling(
    ctx,
    async () => await executeStateAction(ctx, action)
  );
});

bot.on("message", async (ctx) => {
  const state = await getCurrentState(ctx);
  if (state !== "idle") {
    await dispatchWithErrorHandling(
      ctx,
      async () => await executeStateAction(ctx, "input")
    );
  }
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
