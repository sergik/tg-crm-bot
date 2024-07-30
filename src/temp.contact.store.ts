export type Contact = {
  contactName: string | null;
  companyName: string | null;
  isLead: boolean | null;
  email: string | null;
  notes: string | null;
  phoneNumber: string | null;
  telegram: string | null;
  priority: ContactPriority | null;
  position: string | null;
  files: Array<string>;
  additionalNotes: Array<string>;
  id: string | null;
};

export type ContactPriority = "high" | "medium" | "low" | "other";

export class TempContactStore {
  private contact: Contact;

  constructor() {
    this.contact = this.getDefault();
  }
  private getDefault(): Contact {
    return {
      id: null,
      contactName: null,
      companyName: null,
      position: null,
      email: null,
      phoneNumber: null,
      telegram: null,
      isLead: null,
      priority: null,
      notes: null,
      files: [],
      additionalNotes: [],
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
