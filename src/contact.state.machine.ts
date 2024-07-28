import { Context } from "grammy";
import { Contact, TempContactStore } from "./temp.contact.store";
import { cancelAction } from "./state.actions/cancel";
import { toWaitingLeadAction } from "./state.actions/to.is.lead";
import { toPriorityAction } from "./state.actions/to.priority";
import { fromPriorityAction } from "./state.actions/from.priority";
import { loadAdditionalData } from "./state.actions/load.additional.data";
import { GoogleSheetsStore } from "./crm/hubspot/google.sheets.store";
import {
  getMainMenuMarkup,
  showContactInfoMenu,
  showSearchContacntMenu,
  showSubmitMenu,
} from "./telegram/utils";

type ContactMachineStates =
  | "idle"
  | "waiting_contact_name"
  | "waiting_company"
  | "waiting_position"
  | "waiting_contact_information"
  | "waiting_email"
  | "waiting_phone_number"
  | "waiting_telegram"
  | "waiting_is_lead"
  | "waiting_priority"
  | "waiting_files"
  | "waiting_additional_notes"
  | "waiting_voice_messages"
  | "waiting_auth_input"
  | "waiting_for_other_input"
  | "waiting_search_type"
  | "waiting_search_by_name";

export type ContactMachineActions =
  | "start"
  | "enter_phone"
  | "enter_telegram"
  | "enter_email"
  | "next"
  | "input"
  | "submit"
  | "cancel"
  | "upload_files"
  | "upload_voice_messages"
  | "authorize"
  | "search_contact"
  | "add_additional_notes"
  | "search_by_name"
  | "search_by_company";

export type StateAction = (
  ctx: Context,
  storeCtx: StoreContext
) => Promise<void>;

export type StoreContext = {
  tmpContactStore: TempContactStore;
  store: GoogleSheetsStore;
};
type ContactStateMachineTransitions = {
  [state in ContactMachineStates]: {
    [action in ContactMachineActions]?: {
      state: ContactMachineStates;
      action?: StateAction;
    };
  };
};

const cancelActionDef = {
  state: "idle" as ContactMachineStates,
  action: cancelAction,
};

const contactStateMachineTransitions: ContactStateMachineTransitions = {
  idle: {
    start: {
      state: "waiting_contact_name",
      action: async (ctx, store) => {
        store.tmpContactStore.resetContact();
        await ctx.reply(
          `Starting new contact creation. Please enter contact name`
        );
      },
    },
    cancel: cancelActionDef,
    authorize: {
      state: "waiting_auth_input",
      action: async (ctx, storeCtx) => {
        await ctx.reply(storeCtx.store.getAuthMessage());
      },
    },
    search_contact: {
      state: "waiting_search_type",
      action: async (ctx, _) => {
        await showSearchContacntMenu(ctx);
      },
    },
  },
  waiting_search_type: {
    cancel: {
      state: "idle",
      action: async (ctx, _) => {
        await ctx.reply("Search canceled", {
          reply_markup: getMainMenuMarkup(),
        });
      },
    },
    search_by_name: {
      state: "waiting_search_by_name",
      action: async (ctx, _) => {
        await ctx.reply("Enter contact name");
      },
    },
  },
  waiting_search_by_name: {
    input: {
      state: "idle",
      action: async (ctx, storeCtx) => {
        const input = ctx.message?.text as string;
        const res = storeCtx.store.searchByName(input);
        const printContact = (contact: Contact) =>
          `Name: ${contact.contactName}\nCompany: ${contact.companyName}\nEmail: ${contact.email ?? ""}\nTelegram: ${contact.telegram ?? ""}\n`;
        await ctx.reply(
          `Found contacts:\n${(await res).map((c) => printContact(c)).join("\n")}`,
          {
            reply_markup: getMainMenuMarkup(),
          }
        );
      },
    },
  },
  waiting_auth_input: {
    cancel: cancelActionDef,
    input: {
      state: "idle",
      action: async (ctx, storeCtx) => {
        const input = ctx.message?.text as string;
        storeCtx.store.applyAuthResponse(input);
      },
    },
  },
  waiting_contact_name: {
    input: {
      state: "waiting_company",
      action: async (ctx, storeCtx) => {
        await updateFieldInTmpStore(ctx, storeCtx, (contact, val) => {
          contact.contactName = val;
        });
        await ctx.reply(`Please enter the company name`);
      },
    },
    cancel: cancelActionDef,
  },
  waiting_company: {
    input: {
      state: "waiting_position",
      action: async (ctx, storeCtx) => {
        await updateFieldInTmpStore(ctx, storeCtx, (contact, val) => {
          contact.companyName = val;
        });
        await ctx.reply(`Please enter contact position`);
      },
    },
    cancel: cancelActionDef,
  },
  waiting_position: {
    input: {
      state: "waiting_is_lead",
      action: toWaitingLeadAction,
    },
    cancel: cancelActionDef,
  },
  waiting_is_lead: {
    input: { state: "waiting_priority", action: toPriorityAction },
    cancel: cancelActionDef,
  },
  waiting_priority: {
    input: {
      state: "waiting_contact_information",
      action: fromPriorityAction,
    },
    cancel: cancelActionDef,
  },
  waiting_contact_information: {
    next: {
      state: "waiting_for_other_input",
      action: async (ctx, _) => {
        await showSubmitMenu(ctx);
      },
    },
    enter_email: {
      state: "waiting_email",
      action: async (ctx, _) => {
        await ctx.reply(`Enter contact email`);
      },
    },
    enter_phone: {
      state: "waiting_phone_number",
      action: async (ctx, _) => {
        await ctx.reply(`Enter contact phone number`);
      },
    },
    enter_telegram: {
      state: "waiting_telegram",
      action: async (ctx, _) => {
        await ctx.reply(`Enter contact telegram`);
      },
    },
    cancel: cancelActionDef,
  },
  waiting_email: {
    input: {
      state: "waiting_contact_information",
      action: async (ctx, storeCtx) => {
        await updateFieldInTmpStore(ctx, storeCtx, (contact, val) => {
          contact.email = val;
        });
        await showContactInfoMenu(ctx);
      },
    },
    cancel: cancelActionDef,
  },
  waiting_phone_number: {
    input: {
      state: "waiting_contact_information",
      action: async (ctx, storeCtx) => {
        await updateFieldInTmpStore(ctx, storeCtx, (contact, val) => {
          contact.phoneNumber = val;
        });
        await showContactInfoMenu(ctx);
      },
    },
    cancel: cancelActionDef,
  },
  waiting_telegram: {
    input: {
      state: "waiting_contact_information",
      action: async (ctx, storeCtx) => {
        await updateFieldInTmpStore(ctx, storeCtx, (contact, val) => {
          contact.telegram = val;
        });
        await showContactInfoMenu(ctx);
      },
    },
    cancel: cancelActionDef,
  },
  waiting_for_other_input: {
    submit: {
      state: "idle",
      action: async (ctx, storeCtx) => {
        const contact = await storeCtx.tmpContactStore.getContact();
        await storeCtx.store.createContact(contact);
        await ctx.reply("Contact saved.", {
          reply_markup: getMainMenuMarkup(),
        });
      },
    },
    upload_files: {
      state: "waiting_files",
      action: async (ctx, _) => {
        await ctx.reply(`Upload files and/or photos`);
      },
    },
    upload_voice_messages: {
      state: "waiting_voice_messages",
      action: async (ctx, _) => {
        await ctx.reply(`Upload additinal voice messages`);
      },
    },
    add_additional_notes: {
      state: "waiting_additional_notes",
      action: async (ctx, _) => {
        await ctx.reply(`Enter additional notes related to contact`);
      },
    },
    cancel: cancelActionDef,
  },
  waiting_additional_notes: {
    cancel: cancelActionDef,
    input: {
      state: "waiting_for_other_input",
      action: async (ctx, storeCtx) => {
        await updateFieldInTmpStore(ctx, storeCtx, (contact, val) => {
          contact.additionalNotes = [...contact.additionalNotes, val];
        });
        await showSubmitMenu(ctx);
      },
    },
  },
  waiting_files: {
    cancel: cancelActionDef,
    input: {
      state: "waiting_for_other_input",
      action: async (ctx, storeCtx) => {
        await loadAdditionalData(ctx, storeCtx);
        await showSubmitMenu(ctx);
      },
    },
  },
  waiting_voice_messages: {
    cancel: cancelActionDef,
    input: {
      state: "waiting_for_other_input",
      action: async (ctx, storeCtx) => {
        await loadAdditionalData(ctx, storeCtx);
        await showSubmitMenu(ctx);
      },
    },
  },
};

const updateFieldInTmpStore = async (
  ctx: Context,
  storeCtx: StoreContext,
  fieldSetter: (contact: Contact, val: string) => void
) => {
  const contact = await storeCtx.tmpContactStore.getContact();
  const val = ctx.message?.text as string;
  fieldSetter(contact, val);
  await storeCtx.tmpContactStore.updateContact(contact);
};

export class ContactStateMachine {
  private currentState: ContactMachineStates = "idle";
  constructor(
    private tempStore: TempContactStore,
    private store: GoogleSheetsStore
  ) {}
  public getCurrentState(): ContactMachineStates {
    return this.currentState;
  }

  public async dispatch(
    action: ContactMachineActions,
    args: { ctx: Context }
  ): Promise<void> {
    const transitions = contactStateMachineTransitions[this.currentState];
    const nextTransition = transitions[action];
    if (!nextTransition) {
      throw new Error(
        `Unexpected action ${action} for state ${this.currentState}`
      );
    }
    if (nextTransition.action) {
      await nextTransition.action(args.ctx, {
        tmpContactStore: this.tempStore,
        store: this.store,
      });
    }
    this.currentState = nextTransition.state;
  }
}
