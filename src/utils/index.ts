import { Contact } from "../temp.contact.store";

export function printContact(contact: Contact) {
  return `Name: ${contact.contactName}\nCompany: ${contact.companyName}\nEmail: ${contact.email ?? ""}\nTelegram: ${contact.telegram ?? ""}\nPhone Number: ${contact.phoneNumber ?? ""}\nNotes:${contact.notes ?? ""}\n`;
}
