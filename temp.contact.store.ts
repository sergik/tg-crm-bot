export type Contact = {
  contactName: string | null;
  companyName: string | null;
  isLead: boolean | null;
  priority: ContactPriority | null;
  files: Array<string>;
  additionalNotes: Array<string>;
  voiceIds: Array<string>;
};

export type ContactPriority = "high" | "medium" | "low" | "other";

export class TempContactStore {
  private contact: Contact;

  constructor() {
    this.contact = this.getDefault();
  }
  private getDefault(): Contact {
    return {
      contactName: null,
      companyName: null,
      isLead: null,
      priority: null,
      files: [],
      additionalNotes: [],
      voiceIds: [],
    };
  }

  public async getContact(): Promise<Contact> {
    return this.contact;
  }

  public async updateContact(contact: Contact): Promise<void> {
    this.contact = contact;
  }

  public async resetContact(): Promise<void> {
    this.contact = this.getDefault();
  }
}
