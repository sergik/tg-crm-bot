import { Context } from "grammy";
import { TempContactStore } from "./temp.contact.store";
import { cancelAction } from "./state.actions/cancel";
import { toWaitingLeadAction } from "./state.actions/to.is.lead";
import { toPriorityAction } from "./state.actions/to.priority";
import { fromPriorityAction } from "./state.actions/from.priority";
import { loadAdditionalData } from "./state.actions/load.additional.data";
import { GoogleSheetsStore } from "./crm/hubspot/google.sheets.store";
import { config } from "./config";
import fs from "fs";

type ContactMachineStates =
  | "idle"
  | "waiting_contact_name"
  | "waiting_company"
  | "waiting_is_lead"
  | "waiting_priority"
  | "waiting_for_other_input"
  | "waiting_contact_confirmation";

export type ContactMachineActions = "start" | "input" | "submit" | "cancel";

export type StoreContext = {
  tmpContactStore: TempContactStore;
  store: GoogleSheetsStore;
};
type ContactStateMachineTransitions = {
  [state in ContactMachineStates]: {
    [action in ContactMachineActions]?: {
      state: ContactMachineStates;
      action?: (ctx: Context, storeCtx: StoreContext) => Promise<void>;
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
      action: async (ctx, _store) => {
        await ctx.reply(
          `Starting new contact creation. Please enter contact name`
        );
      },
    },
    cancel: cancelActionDef,
  },
  waiting_contact_name: {
    input: {
      state: "waiting_company",
      action: async (ctx, storeCtx) => {
        const contactName = ctx.message?.text as string;
        const contact = await storeCtx.tmpContactStore.getContact();
        contact.contactName = contactName;
        await storeCtx.tmpContactStore.updateContact(contact);
        await ctx.reply(`Please enter the company name`);
      },
    },
    cancel: cancelActionDef,
  },
  waiting_company: {
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
      state: "waiting_for_other_input",
      action: fromPriorityAction,
    },
    cancel: cancelActionDef,
  },
  waiting_for_other_input: {
    submit: {
      state: "idle",
      action: async (ctx, storeCtx) => {
        const contact = await storeCtx.tmpContactStore.getContact();
        await storeCtx.store.createContact(contact, async () => {});
      },
    },
    input: {
      state: "waiting_for_other_input",
      action: loadAdditionalData,
    },
    cancel: cancelActionDef,
  },
  waiting_contact_confirmation: {
    cancel: cancelActionDef,
    submit: { state: "idle" },
  },
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
