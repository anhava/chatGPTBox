import Browser from 'webextension-polyfill'
import { initSession } from '../utils/index.mjs'
import { getUserConfig } from './index.mjs'

export const initDefaultSession = async () => {
  const config = await getUserConfig()
  const modelName = config.modelName
  return initSession({
    sessionName: new Date().toLocaleString(),
    modelName: modelName,
    autoClean: false,
  })
}

export const createSession = async (session) => {
  const currentSessions = await getSessions()
  if (!session) session = await initDefaultSession()
  currentSessions.unshift(session)
  await Browser.storage.local.set({ sessions: currentSessions })
  return { session, currentSessions }
}

export const deleteSession = async (sessionId) => {
  const currentSessions = await getSessions()
  const index = currentSessions.findIndex((session) => session.sessionId === sessionId)
  currentSessions.splice(index, 1)
  if (currentSessions.length > 0) {
    await Browser.storage.local.set({ sessions: currentSessions })
    return currentSessions
  }
  return await resetSessions()
}

export const getSession = async (sessionId) => {
  const currentSessions = await getSessions()
  return {
    session: currentSessions.find((session) => session.sessionId === sessionId),
    currentSessions,
  }
}

export const updateSession = async (newSession) => {
  const currentSessions = await getSessions()
  currentSessions[
    currentSessions.findIndex((session) => session.sessionId === newSession.sessionId)
  ] = newSession
  await Browser.storage.local.set({ sessions: currentSessions })
  return currentSessions
}

export const resetSessions = async () => {
  const currentSessions = [await initDefaultSession()]
  await Browser.storage.local.set({ sessions: currentSessions })
  return currentSessions
}

export const getSessions = async () => {
  const { sessions } = await Browser.storage.local.get('sessions')
  if (sessions && sessions.length > 0) return sessions
  return await resetSessions()
}
