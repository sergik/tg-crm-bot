import { Context } from "grammy";
import { TempContactStore } from "./temp.contact.store";
import { cancelAction } from "./state.actions/cancel";

type ContactMachineStates =
  | "idle"
  | "waiting_contact_name"
  | "waiting_company"
  | "waiting_is_lead"
  | "waiting_for_other_input"
  | "waiting_contact_confirmation";

export type ContactMachineActions = "start" | "input" | "submit" | "cancel";

type ContactStateMachineTransitions = {
  [state in ContactMachineStates]: {
    [action in ContactMachineActions]?: {
      state: ContactMachineStates;
      action?: (ctx: Context, store: TempContactStore) => Promise<void>;
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
        await ctx.reply(`Starting new contact creation`);
        await ctx.reply(`Enter contact name:`);
      },
    },
    cancel: cancelActionDef,
  },
  waiting_contact_name: {
    input: {
      state: "waiting_company",
      action: async (ctx, _store) => {
        await ctx.reply(`Starting new contact creation`);
        await ctx.reply(`Enter contact name:`);
      },
    },
    cancel: {
      state: "idle",
      action: cancelAction,
    },
  },
  waiting_company: {
    input: { state: "waiting_is_lead" },
    cancel: cancelActionDef,
  },
  waiting_is_lead: {
    input: { state: "waiting_for_other_input" },
    cancel: cancelActionDef,
  },
  waiting_for_other_input: {
    submit: { state: "waiting_contact_confirmation" },
    input: { state: "waiting_for_other_input" },
    cancel: cancelActionDef,
  },
  waiting_contact_confirmation: {
    cancel: cancelActionDef,
    submit: { state: "idle" },
  },
};

export class ContactStateMachine {
  private currentState: ContactMachineStates = "idle";
  constructor(private store: TempContactStore) {}
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
      await nextTransition.action(args.ctx, this.store);
    }
    this.currentState = nextTransition.state;
  }
}
