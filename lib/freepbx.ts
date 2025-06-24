interface FreePBXConfig {
  baseUrl: string
  username: string
  password: string
  apiToken?: string
}

interface CallRecord {
  id: string
  callId: string
  direction: 'inbound' | 'outbound'
  from: string
  to: string
  startTime: string
  endTime?: string
  duration?: number
  status: 'ringing' | 'answered' | 'busy' | 'failed' | 'completed'
  recordingPath?: string
  notes?: string
}

interface Extension {
  extension: string
  name: string
  status: 'available' | 'busy' | 'unavailable' | 'dnd'
  device: string
  lastActivity?: string
}

interface CallLog {
  uniqueid: string
  date: string
  clid: string
  src: string
  dst: string
  dcontext: string
  channel: string
  dstchannel: string
  lastapp: string
  lastdata: string
  duration: number
  billsec: number
  disposition: string
  amaflags: string
  accountcode: string
  userfield: string
}

class FreePBXClient {
  private config: FreePBXConfig
  private wsConnection: WebSocket | null = null

  constructor() {
    this.config = {
      baseUrl: process.env.FREEPBX_BASE_URL || 'https://your-freepbx-server.com',
      username: process.env.FREEPBX_USERNAME!,
      password: process.env.FREEPBX_PASSWORD!,
      apiToken: process.env.FREEPBX_API_TOKEN
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.config.baseUrl}/admin/api/${endpoint}`
      
      // Use API token if available, otherwise basic auth
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }

      if (this.config.apiToken) {
        headers['Authorization'] = `Bearer ${this.config.apiToken}`
      } else {
        const credentials = btoa(`${this.config.username}:${this.config.password}`)
        headers['Authorization'] = `Basic ${credentials}`
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`FreePBX API error: ${response.status} - ${errorText}`)
        
        // Fall back to mock data if FreePBX API is disabled
        if (process.env.FREEPBX_DISABLE_API === 'true') {
          return this.getMockResponse<T>(endpoint, options.method || 'GET')
        }
        
        throw new Error(`FreePBX API error: ${response.status} - ${errorText}`)
      }

      return response.json()
    } catch (error) {
      console.warn('FreePBX request failed, falling back to mock data:', error)
      
      if (process.env.FREEPBX_DISABLE_API === 'true') {
        return this.getMockResponse<T>(endpoint, options.method || 'GET')
      }
      
      throw error
    }
  }

  private getMockResponse<T>(endpoint: string, method: string): T {
    console.log(`Mock response for ${method} ${endpoint}`)
    
    if (endpoint.includes('extensions')) {
      return {
        data: [
          {
            extension: "1001",
            name: "John Smith",
            status: "available",
            device: "PJSIP/1001",
            lastActivity: new Date().toISOString()
          },
          {
            extension: "1002", 
            name: "Sarah Johnson",
            status: "busy",
            device: "PJSIP/1002",
            lastActivity: new Date().toISOString()
          },
          {
            extension: "1003",
            name: "Mike Wilson", 
            status: "unavailable",
            device: "PJSIP/1003",
            lastActivity: new Date(Date.now() - 300000).toISOString()
          }
        ]
      } as unknown as T
    }
    
    if (endpoint.includes('cdr') || endpoint.includes('call-logs')) {
      return {
        data: [
          {
            uniqueid: "1701234567.123",
            date: new Date().toISOString(),
            clid: "John Smith <1001>",
            src: "1001",
            dst: "5551234567",
            dcontext: "from-internal",
            channel: "PJSIP/1001-00000001",
            dstchannel: "PJSIP/trunk-00000002",
            lastapp: "Dial",
            lastdata: "PJSIP/trunk/5551234567",
            duration: 125,
            billsec: 120,
            disposition: "ANSWERED",
            amaflags: "DOCUMENTATION",
            accountcode: "",
            userfield: ""
          },
          {
            uniqueid: "1701234568.124",
            date: new Date(Date.now() - 3600000).toISOString(),
            clid: "Customer <5559876543>",
            src: "5559876543",
            dst: "1002",
            dcontext: "from-trunk",
            channel: "PJSIP/trunk-00000003",
            dstchannel: "PJSIP/1002-00000004",
            lastapp: "Dial", 
            lastdata: "PJSIP/1002",
            duration: 245,
            billsec: 240,
            disposition: "ANSWERED",
            amaflags: "DOCUMENTATION",
            accountcode: "",
            userfield: ""
          }
        ]
      } as unknown as T
    }
    
    if (endpoint.includes('originate') && method === 'POST') {
      return {
        success: true,
        message: "Call initiated successfully",
        callId: `CALL${Date.now()}`
      } as unknown as T
    }
    
    return { data: [] } as unknown as T
  }

  // Extension management
  async getExtensions(): Promise<Extension[]> {
    const response = await this.request<{ data: Extension[] }>('extensions')
    return response.data
  }

  async getExtension(extension: string): Promise<Extension> {
    const response = await this.request<Extension>(`extensions/${extension}`)
    return response
  }

  // Call management
  async originateCall(from: string, to: string, context: string = 'from-internal'): Promise<any> {
    return this.request('call/originate', {
      method: 'POST',
      body: JSON.stringify({
        channel: `PJSIP/${from}`,
        exten: to,
        context: context,
        priority: 1,
        callerid: `Extension ${from}`,
        timeout: 30000
      })
    })
  }

  async hangupCall(channel: string): Promise<any> {
    return this.request('call/hangup', {
      method: 'POST',
      body: JSON.stringify({ channel })
    })
  }

  async transferCall(channel: string, extension: string): Promise<any> {
    return this.request('call/transfer', {
      method: 'POST', 
      body: JSON.stringify({ channel, extension })
    })
  }

  // Call history
  async getCallLogs(startDate?: string, endDate?: string, limit: number = 100): Promise<CallLog[]> {
    let endpoint = `cdr?limit=${limit}`
    if (startDate) endpoint += `&start=${startDate}`
    if (endDate) endpoint += `&end=${endDate}`
    
    const response = await this.request<{ data: CallLog[] }>(endpoint)
    return response.data
  }

  async getCallRecord(uniqueid: string): Promise<CallLog> {
    const response = await this.request<CallLog>(`cdr/${uniqueid}`)
    return response
  }

  // Queue management
  async getQueues(): Promise<any> {
    return this.request('queues')
  }

  async getQueueStatus(queue: string): Promise<any> {
    return this.request(`queues/${queue}/status`)
  }

  // Device status
  async getDeviceStatus(): Promise<any> {
    return this.request('asterisk/device-status')
  }

  async getChannelStatus(): Promise<any> {
    return this.request('asterisk/channels')
  }

  // WebRTC and real-time events
  initializeWebSocket(): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const wsUrl = `${this.config.baseUrl.replace('http', 'ws')}/ws/asterisk`
      this.wsConnection = new WebSocket(wsUrl)

      this.wsConnection.onopen = () => {
        console.log('FreePBX WebSocket connected')
        // Authenticate WebSocket connection
        this.wsConnection?.send(JSON.stringify({
          action: 'authenticate',
          username: this.config.username,
          secret: this.config.password
        }))
      }

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleWebSocketMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.wsConnection.onclose = () => {
        console.log('FreePBX WebSocket disconnected')
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.initializeWebSocket(), 5000)
      }

      this.wsConnection.onerror = (error) => {
        console.error('FreePBX WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }

  private handleWebSocketMessage(data: any): void {
    // Handle different types of AMI events
    switch (data.Event) {
      case 'Newchannel':
        console.log('New channel created:', data)
        break
      case 'Hangup':
        console.log('Call ended:', data)
        break
      case 'ExtensionStatus':
        console.log('Extension status changed:', data)
        break
      case 'QueueMemberStatus':
        console.log('Queue member status changed:', data)
        break
      default:
        console.log('Received AMI event:', data)
    }
    
    // Emit custom events for the application to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('freepbx-event', { detail: data }))
    }
  }

  closeWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
  }

  // WebRTC phone functionality
  async getWebRTCCredentials(extension: string): Promise<any> {
    return this.request(`webrtc/credentials/${extension}`)
  }

  async enableWebRTC(extension: string): Promise<any> {
    return this.request(`extensions/${extension}/webrtc`, {
      method: 'PUT',
      body: JSON.stringify({ enabled: true })
    })
  }

  // Integration helpers for Dataverse
  async logCallToDataverse(callLog: CallLog, contactId?: string): Promise<void> {
    // This will be implemented when we integrate with Dataverse
    console.log('Logging call to Dataverse:', { callLog, contactId })
  }

  async searchContactByPhoneNumber(phoneNumber: string): Promise<any> {
    // This will integrate with Dataverse to find contacts
    console.log('Searching contact by phone:', phoneNumber)
    return null
  }
}

// Singleton instance
export const freepbxClient = new FreePBXClient()

// Helper functions
export function formatPhoneNumber(number: string): string {
  // Remove all non-digit characters
  const cleaned = number.replace(/\D/g, '')
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return number
}

export function parseCallDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function getCallDirection(src: string, dst: string, userExtensions: string[]): 'inbound' | 'outbound' | 'internal' {
  const isInternalSrc = userExtensions.includes(src)
  const isInternalDst = userExtensions.includes(dst)
  
  if (isInternalSrc && isInternalDst) {
    return 'internal'
  } else if (isInternalSrc) {
    return 'outbound'
  } else {
    return 'inbound'
  }
}

export { type CallRecord, type Extension, type CallLog }