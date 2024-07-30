import { Contact } from "../temp.contact.store";

export function printContact(contact: Contact) {
  return `ID: ${contact.id}\nName: ${contact.contactName}\nCompany: ${contact.companyName}\nCompany: ${contact.position}\nEmail: ${contact.email ?? ""}\nTelegram: ${contact.telegram ?? ""}\nPhone Number: ${contact.phoneNumber ?? ""}\nNotes:${contact.notes ?? ""}\n`;
}
