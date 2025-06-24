"use client"

import { useState, useEffect, useRef } from 'react'
import { UserAgent, Registerer, Inviter, SessionState } from 'sip.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { useRBAC } from '@/hooks/use-rbac'
import { formatPhoneNumber, parseCallDuration } from '@/lib/freepbx'

interface WebRTCPhoneProps {
  extension?: string
  onCallStateChange?: (state: CallState) => void
  onIncomingCall?: (callerInfo: CallerInfo) => void
}

interface CallerInfo {
  number: string
  name?: string
  extension?: string
}

interface CallState {
  status: 'idle' | 'connecting' | 'ringing' | 'connected' | 'disconnected'
  direction: 'inbound' | 'outbound'
  duration: number
  callerInfo?: CallerInfo
}

export function WebRTCPhone({ extension, onCallStateChange, onIncomingCall }: WebRTCPhoneProps) {
  const { hasPermission } = useRBAC()
  const [userAgent, setUserAgent] = useState<UserAgent | null>(null)
  const [registerer, setRegisterer] = useState<Registerer | null>(null)
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    direction: 'outbound',
    duration: 0
  })
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [volume, setVolume] = useState(1)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check permissions
  const canMakeCalls = hasPermission('communications', 'create')
  const canManagePhone = hasPermission('communications', 'manage')

  useEffect(() => {
    if (canMakeCalls && extension) {
      initializeWebRTC()
    }

    return () => {
      cleanup()
    }
  }, [extension, canMakeCalls])

  useEffect(() => {
    onCallStateChange?.(callState)
  }, [callState, onCallStateChange])

  const initializeWebRTC = async () => {
    try {
      setIsConnecting(true)

      // WebRTC configuration - these would come from your FreePBX setup
      const serverConfig = {
        uri: UserAgent.makeURI(`sip:${extension}@${process.env.NEXT_PUBLIC_FREEPBX_DOMAIN || 'your-freepbx-server.com'}`)!,
        transportOptions: {
          server: `wss://${process.env.NEXT_PUBLIC_FREEPBX_DOMAIN || 'your-freepbx-server.com'}:8089/ws`,
          connectionTimeout: 5000,
          maxReconnectionAttempts: 3,
          reconnectionTimeout: 3000
        },
        sessionDescriptionHandlerFactoryOptions: {
          peerConnectionConfiguration: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        },
        authorizationUsername: extension,
        authorizationPassword: process.env.NEXT_PUBLIC_WEBRTC_PASSWORD || 'your-extension-password',
        displayName: `Extension ${extension}`
      }

      const ua = new UserAgent(serverConfig)
      const registerer = new Registerer(ua)

      // Set up event handlers
      ua.stateChange.addListener((newState) => {
        console.log(`UserAgent state changed to: ${newState}`)
        if (newState === 'Started') {
          registerer.register().then(() => {
            setIsRegistered(true)
            console.log('Successfully registered with FreePBX')
          }).catch((error) => {
            console.error('Registration failed:', error)
            setIsRegistered(false)
          })
        }
      })

      // Handle incoming calls
      ua.delegate = {
        onInvite: (invitation) => {
          console.log('Incoming call from:', invitation.remoteIdentity.uri)
          
          const callerInfo: CallerInfo = {
            number: invitation.remoteIdentity.uri.user || 'Unknown',
            name: invitation.remoteIdentity.displayName || undefined
          }

          setCallState({
            status: 'ringing',
            direction: 'inbound',
            duration: 0,
            callerInfo
          })

          setCurrentSession(invitation)
          onIncomingCall?.(callerInfo)

          // Auto-setup media for incoming call
          setupSessionMedia(invitation)
        }
      }

      // Start the user agent
      await ua.start()
      setUserAgent(ua)
      setRegisterer(registerer)

    } catch (error) {
      console.error('Failed to initialize WebRTC:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const setupSessionMedia = (session: any) => {
    // Set up media streams
    session.sessionDescriptionHandler.peerConnection.addEventListener('addstream', (event: any) => {
      if (audioRef.current) {
        audioRef.current.srcObject = event.stream
        audioRef.current.volume = volume
      }
    })

    session.stateChange.addListener((newState: SessionState) => {
      console.log(`Session state changed to: ${newState}`)
      
      switch (newState) {
        case SessionState.Establishing:
          setCallState(prev => ({ ...prev, status: 'connecting' }))
          break
        case SessionState.Established:
          setCallState(prev => ({ ...prev, status: 'connected' }))
          startCallTimer()
          break
        case SessionState.Terminated:
          setCallState(prev => ({ ...prev, status: 'disconnected' }))
          stopCallTimer()
          setCurrentSession(null)
          break
      }
    })
  }

  const makeCall = async (number: string) => {
    if (!userAgent || !isRegistered || !number.trim()) return

    try {
      const target = `sip:${number}@${process.env.NEXT_PUBLIC_FREEPBX_DOMAIN || 'your-freepbx-server.com'}`
      const inviter = new Inviter(userAgent, UserAgent.makeURI(target)!)

      setCallState({
        status: 'connecting',
        direction: 'outbound',
        duration: 0,
        callerInfo: { number: formatPhoneNumber(number) }
      })

      setCurrentSession(inviter)
      setupSessionMedia(inviter)

      await inviter.invite()
      console.log('Call initiated to:', number)

    } catch (error) {
      console.error('Failed to make call:', error)
      setCallState(prev => ({ ...prev, status: 'disconnected' }))
    }
  }

  const answerCall = async () => {
    if (!currentSession) return

    try {
      await currentSession.accept()
      console.log('Call answered')
    } catch (error) {
      console.error('Failed to answer call:', error)
    }
  }

  const hangupCall = async () => {
    if (!currentSession) return

    try {
      if (currentSession.state === SessionState.Established) {
        await currentSession.bye()
      } else {
        await currentSession.reject()
      }
      console.log('Call ended')
    } catch (error) {
      console.error('Failed to hangup call:', error)
    }
  }

  const toggleMute = () => {
    if (!currentSession) return

    try {
      if (isMuted) {
        currentSession.sessionDescriptionHandler.unmute()
      } else {
        currentSession.sessionDescriptionHandler.mute()
      }
      setIsMuted(!isMuted)
    } catch (error) {
      console.error('Failed to toggle mute:', error)
    }
  }

  const adjustVolume = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const startCallTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      setCallState(prev => ({ ...prev, duration: prev.duration + 1 }))
    }, 1000)
  }

  const stopCallTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
      durationIntervalRef.current = null
    }
  }

  const cleanup = () => {
    stopCallTimer()
    if (currentSession) {
      currentSession.dispose()
    }
    if (registerer) {
      registerer.unregister()
    }
    if (userAgent) {
      userAgent.stop()
    }
  }

  if (!canMakeCalls) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">You don't have permission to use the phone system.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          WebRTC Phone
          {extension && (
            <Badge variant="outline">Ext. {extension}</Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={isRegistered ? 'default' : 'destructive'}>
            {isConnecting ? 'Connecting...' : isRegistered ? 'Registered' : 'Offline'}
          </Badge>
          {callState.status !== 'idle' && (
            <Badge variant="secondary">
              {callState.status === 'connected' && parseCallDuration(callState.duration)}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Call Status Display */}
        {callState.status !== 'idle' && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {callState.direction === 'inbound' ? 'Incoming Call' : 'Outgoing Call'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {callState.callerInfo?.name || callState.callerInfo?.number || 'Unknown'}
                </p>
                {callState.status === 'connected' && (
                  <p className="text-xs text-muted-foreground">
                    Duration: {parseCallDuration(callState.duration)}
                  </p>
                )}
              </div>
              <Badge variant={
                callState.status === 'connected' ? 'default' :
                callState.status === 'ringing' ? 'secondary' :
                'outline'
              }>
                {callState.status}
              </Badge>
            </div>
          </div>
        )}

        {/* Dialer Interface */}
        {callState.status === 'idle' && (
          <div className="space-y-3">
            <Input
              placeholder="Enter phone number..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  makeCall(phoneNumber)
                }
              }}
            />
            <Button 
              onClick={() => makeCall(phoneNumber)}
              disabled={!isRegistered || !phoneNumber.trim()}
              className="w-full"
            >
              <PhoneCall className="h-4 w-4 mr-2" />
              Call
            </Button>
          </div>
        )}

        {/* Call Controls */}
        {callState.status !== 'idle' && (
          <div className="flex gap-2">
            {callState.status === 'ringing' && callState.direction === 'inbound' && (
              <Button onClick={answerCall} className="flex-1">
                <PhoneCall className="h-4 w-4 mr-2" />
                Answer
              </Button>
            )}
            
            {callState.status === 'connected' && (
              <>
                <Button
                  variant={isMuted ? 'destructive' : 'outline'}
                  onClick={toggleMute}
                  size="sm"
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                
                <div className="flex items-center gap-1 px-2">
                  {volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => adjustVolume(parseFloat(e.target.value))}
                    className="w-16"
                  />
                </div>
              </>
            )}
            
            <Button
              variant="destructive"
              onClick={hangupCall}
              className="flex-1"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              {callState.status === 'ringing' && callState.direction === 'inbound' ? 'Decline' : 'Hang Up'}
            </Button>
          </div>
        )}

        {/* Hidden audio element for call audio */}
        <audio ref={audioRef} autoPlay playsInline hidden />
      </CardContent>
    </Card>
  )
}