import { Bot, Context } from "grammy";
import { ContactStateMachine } from "./contact.state.machine";
import { TempContactStore } from "./temp.contact.store";
import { config } from "./config";
import { leadButton, notLeadButton } from "./state.actions/to.is.lead";
import { buttons as priorityButtons } from "./state.actions/to.priority";
import { HubspotStore } from "./crm/hubspot/hubspot.store";

const bot = new Bot(config.BOT_TOKEN);
const hubSpotClient = new HubspotStore(config.HUBSPOT_TOKEN);

const tmpContactStore = new TempContactStore();
const stateMachine = new ContactStateMachine(tmpContactStore, hubSpotClient);

bot.command("a", async (ctx) => {
  await dispatchWithErrorHandling(
    ctx,
    async () => await stateMachine.dispatch("start", { ctx })
  );
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

const leadBtns = [leadButton, notLeadButton];
const btns = [...leadBtns, ...priorityButtons];

for (const btn of btns) {
  bot.callbackQuery(btn, async (ctx) => {
    await stateMachine.dispatch("input", { ctx });
  });
}

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
