import { Contact } from "../../temp.contact.store";
import { Client, AssociationTypes } from "@hubspot/api-client";
export class HubspotStore {
  private client: Client;
  constructor(private token: string) {
    this.client = new Client({ accessToken: this.token });
  }

  public async createContact(
    contact: Contact,
    downloadFile: (fileId: string) => Promise<any>
  ): Promise<void> {
    this.client.files.filesApi.upload();
    const company = await this.getOrCreateCompany(
      contact.companyName as string
    );
    const contactObj = {
      properties: {
        firstname: contact.contactName as string,
        lastname: contact.contactName as string,
      },
      associations: [],
    };
    const createContactResponse =
      await this.client.crm.contacts.basicApi.create(contactObj);
    await this.client.crm.associations.v4.basicApi.create(
      "companies",
      company.id,
      "contacts",
      createContactResponse.id,
      [
        {
          associationCategory: "HUBSPOT_DEFINED" as any,
          associationTypeId: AssociationTypes.companyToContact,
        },
      ]
    );
  }

  private async getOrCreateCompany(
    companyName: string
  ): Promise<{ id: string }> {
    const existingCompany = await this.getCompany(companyName);
    if (existingCompany) {
      return existingCompany;
    }
    const companyObj = {
      properties: {
        name: companyName,
      },
      associations: [],
    };
    const createCompanyResponse =
      await this.client.crm.companies.basicApi.create(companyObj);

    return createCompanyResponse;
  }

  private async getCompany(
    companyName: string
  ): Promise<{ id: string } | null> {
    const contactSearchRequest = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "name",
              operator: "EQ" as any,
              value: companyName,
            },
          ],
        },
      ],
    };
    const response = await this.client.crm.companies.searchApi.doSearch(
      contactSearchRequest as any
    );

    if (response.results.length > 0) {
      return response.results[0];
    }
    return null;
  }
}
