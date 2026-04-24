import { supabase } from './supabase'

const BASE = import.meta.env.VITE_API_URL || '/api'

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) return session.access_token

  // Wait briefly for session to hydrate then retry once
  await new Promise(r => setTimeout(r, 500))
  const { data: { session: retried } } = await supabase.auth.getSession()
  return retried?.access_token ?? null
}

async function request(method, path, body) {
  const token = await getToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (res.status === 204) return null

  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error?.formErrors?.[0] ?? data?.error ?? 'Request failed.'
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return data
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
}
