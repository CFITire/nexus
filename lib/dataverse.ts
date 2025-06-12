interface DataverseConfig {
  baseUrl: string
  tenantId: string
  clientId: string
  clientSecret: string
  environment: string
}

interface DataverseEntity {
  [key: string]: any
}

interface DataverseResponse<T = any> {
  value: T[]
  '@odata.count'?: number
}

class DataverseClient {
  private config: DataverseConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    this.config = {
      baseUrl: process.env.DATAVERSE_BASE_URL || '',
      tenantId: process.env.DATAVERSE_TENANT_ID!,
      clientId: process.env.DATAVERSE_CLIENT_ID!,
      clientSecret: process.env.DATAVERSE_CLIENT_SECRET!,
      environment: process.env.DATAVERSE_ENVIRONMENT || 'default'
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken
    }

    const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`
    
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: `${this.config.baseUrl}/.default`,
      grant_type: 'client_credentials'
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    })

    if (!response.ok) {
      throw new Error(`Failed to get Dataverse access token: ${response.status}`)
    }

    const tokenData = await response.json()
    this.accessToken = tokenData.access_token
    this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in - 60) * 1000) // 1 minute buffer

    return this.accessToken!
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const token = await this.getAccessToken()
      const url = `${this.config.baseUrl}/api/data/v9.2/${endpoint}`

      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'If-None-Match': 'null',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`Dataverse API error: ${response.status} - ${errorText}`)
        
        // Fall back to mock data if DV API is disabled
        if (process.env.DV_DISABLE_API === 'true') {
          return this.getMockResponse<T>(endpoint, options.method || 'GET')
        }
        
        throw new Error(`Dataverse API error: ${response.status} - ${errorText}`)
      }

      return response.json()
    } catch (error) {
      console.warn('Dataverse request failed, falling back to mock data:', error)
      
      if (process.env.DV_DISABLE_API === 'true') {
        return this.getMockResponse<T>(endpoint, options.method || 'GET')
      }
      
      throw error
    }
  }

  private getMockResponse<T>(endpoint: string, method: string): T {
    console.log(`Mock Dataverse response for ${method} ${endpoint}`)
    
    if (endpoint.includes('accounts')) {
      return {
        value: [
          {
            accountid: "account-001",
            name: "Acme Corporation",
            accountnumber: "ACC001",
            telephone1: "(555) 123-4567",
            emailaddress1: "contact@acme.com",
            address1_city: "Edmonton",
            address1_stateorprovince: "Alberta",
            address1_country: "Canada",
            statuscode: 1,
            statecode: 0
          },
          {
            accountid: "account-002", 
            name: "Beta Industries",
            accountnumber: "ACC002",
            telephone1: "(555) 987-6543",
            emailaddress1: "info@beta.com",
            address1_city: "Calgary",
            address1_stateorprovince: "Alberta", 
            address1_country: "Canada",
            statuscode: 1,
            statecode: 0
          }
        ]
      } as unknown as T
    }
    
    if (endpoint.includes('contacts')) {
      return {
        value: [
          {
            contactid: "contact-001",
            fullname: "John Smith",
            firstname: "John",
            lastname: "Smith",
            emailaddress1: "john.smith@acme.com",
            telephone1: "(555) 123-4567",
            jobtitle: "Purchasing Manager",
            parentcustomerid: "account-001",
            statuscode: 1,
            statecode: 0
          },
          {
            contactid: "contact-002",
            fullname: "Sarah Johnson", 
            firstname: "Sarah",
            lastname: "Johnson",
            emailaddress1: "sarah.johnson@beta.com",
            telephone1: "(555) 987-6543",
            jobtitle: "Operations Director",
            parentcustomerid: "account-002",
            statuscode: 1,
            statecode: 0
          }
        ]
      } as unknown as T
    }
    
    if (endpoint.includes('opportunities')) {
      return {
        value: [
          {
            opportunityid: "opp-001",
            name: "Q4 Tire Purchase - Acme Corp",
            estimatedvalue: 50000,
            closeprobability: 75,
            estimatedclosedate: "2024-12-15",
            stepname: "Proposal",
            parentaccountid: "account-001",
            parentcontactid: "contact-001",
            statuscode: 1,
            statecode: 0
          },
          {
            opportunityid: "opp-002",
            name: "Fleet Replacement - Beta Industries",
            estimatedvalue: 125000,
            closeprobability: 60,
            estimatedclosedate: "2025-01-30",
            stepname: "Qualification",
            parentaccountid: "account-002", 
            parentcontactid: "contact-002",
            statuscode: 1,
            statecode: 0
          }
        ]
      } as unknown as T
    }

    if (method === 'POST') {
      return {
        id: `new-${Date.now()}`,
        success: true
      } as unknown as T
    }
    
    return { value: [] } as unknown as T
  }

  // Account (Customer) methods
  async getAccounts(filter?: string, select?: string): Promise<DataverseResponse<DataverseEntity>> {
    let endpoint = 'accounts'
    const params = new URLSearchParams()
    
    if (select) params.append('$select', select)
    if (filter) params.append('$filter', filter)
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }
    
    return this.request(endpoint)
  }

  async getAccount(accountId: string, select?: string): Promise<DataverseEntity> {
    let endpoint = `accounts(${accountId})`
    if (select) endpoint += `?$select=${select}`
    
    return this.request(endpoint)
  }

  async createAccount(account: DataverseEntity): Promise<any> {
    return this.request('accounts', {
      method: 'POST',
      body: JSON.stringify(account),
    })
  }

  async updateAccount(accountId: string, account: Partial<DataverseEntity>): Promise<any> {
    return this.request(`accounts(${accountId})`, {
      method: 'PATCH',
      body: JSON.stringify(account),
    })
  }

  // Contact methods
  async getContacts(filter?: string, select?: string): Promise<DataverseResponse<DataverseEntity>> {
    let endpoint = 'contacts'
    const params = new URLSearchParams()
    
    if (select) params.append('$select', select)
    if (filter) params.append('$filter', filter)
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }
    
    return this.request(endpoint)
  }

  async getContact(contactId: string, select?: string): Promise<DataverseEntity> {
    let endpoint = `contacts(${contactId})`
    if (select) endpoint += `?$select=${select}`
    
    return this.request(endpoint)
  }

  async createContact(contact: DataverseEntity): Promise<any> {
    return this.request('contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    })
  }

  async updateContact(contactId: string, contact: Partial<DataverseEntity>): Promise<any> {
    return this.request(`contacts(${contactId})`, {
      method: 'PATCH',
      body: JSON.stringify(contact),
    })
  }

  // Opportunity methods
  async getOpportunities(filter?: string, select?: string): Promise<DataverseResponse<DataverseEntity>> {
    let endpoint = 'opportunities'
    const params = new URLSearchParams()
    
    if (select) params.append('$select', select)
    if (filter) params.append('$filter', filter)
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }
    
    return this.request(endpoint)
  }

  async getOpportunity(opportunityId: string, select?: string): Promise<DataverseEntity> {
    let endpoint = `opportunities(${opportunityId})`
    if (select) endpoint += `?$select=${select}`
    
    return this.request(endpoint)
  }

  async createOpportunity(opportunity: DataverseEntity): Promise<any> {
    return this.request('opportunities', {
      method: 'POST',
      body: JSON.stringify(opportunity),
    })
  }

  async updateOpportunity(opportunityId: string, opportunity: Partial<DataverseEntity>): Promise<any> {
    return this.request(`opportunities(${opportunityId})`, {
      method: 'PATCH',
      body: JSON.stringify(opportunity),
    })
  }

  // Generic entity methods
  async getEntities(entitySetName: string, filter?: string, select?: string): Promise<DataverseResponse<DataverseEntity>> {
    let endpoint = entitySetName
    const params = new URLSearchParams()
    
    if (select) params.append('$select', select)
    if (filter) params.append('$filter', filter)
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }
    
    return this.request(endpoint)
  }

  async getEntity(entitySetName: string, entityId: string, select?: string): Promise<DataverseEntity> {
    let endpoint = `${entitySetName}(${entityId})`
    if (select) endpoint += `?$select=${select}`
    
    return this.request(endpoint)
  }

  async createEntity(entitySetName: string, entity: DataverseEntity): Promise<any> {
    return this.request(entitySetName, {
      method: 'POST',
      body: JSON.stringify(entity),
    })
  }

  async updateEntity(entitySetName: string, entityId: string, entity: Partial<DataverseEntity>): Promise<any> {
    return this.request(`${entitySetName}(${entityId})`, {
      method: 'PATCH',
      body: JSON.stringify(entity),
    })
  }

  async deleteEntity(entitySetName: string, entityId: string): Promise<void> {
    await this.request(`${entitySetName}(${entityId})`, {
      method: 'DELETE',
    })
  }
}

// Singleton instance
export const dvClient = new DataverseClient()

// Helper functions for common CRM operations
export function formatAccountForDisplay(account: DataverseEntity) {
  return {
    id: account.accountid,
    name: account.name,
    accountNumber: account.accountnumber,
    phone: account.telephone1,
    email: account.emailaddress1,
    city: account.address1_city,
    state: account.address1_stateorprovince,
    country: account.address1_country,
    status: account.statuscode
  }
}

export function formatContactForDisplay(contact: DataverseEntity) {
  return {
    id: contact.contactid,
    fullName: contact.fullname,
    firstName: contact.firstname,
    lastName: contact.lastname,
    email: contact.emailaddress1,
    phone: contact.telephone1,
    jobTitle: contact.jobtitle,
    accountId: contact.parentcustomerid,
    status: contact.statuscode
  }
}

export function formatOpportunityForDisplay(opportunity: DataverseEntity) {
  return {
    id: opportunity.opportunityid,
    name: opportunity.name,
    estimatedValue: opportunity.estimatedvalue,
    closeProbability: opportunity.closeprobability,
    estimatedCloseDate: opportunity.estimatedclosedate,
    stage: opportunity.stepname,
    accountId: opportunity.parentaccountid,
    contactId: opportunity.parentcontactid,
    status: opportunity.statuscode
  }
}