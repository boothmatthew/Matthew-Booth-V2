import {Button, Card, Flex, Stack, Text, TextInput} from '@sanity/ui'
import {useCallback, useState} from 'react'
import type {ObjectInputProps} from 'sanity'
import {set, useClient, useFormValue} from 'sanity'

// Hashes the password in the browser and stores only {hash, salt} — the
// dataset is publicly readable, so the plaintext must never be persisted.
// The hash format (sha-256 of `${salt}:${password}`) must match the
// verification in svelte/src/lib/server/auth.js.
//
// Logins are password only, so two users can't share a password: before
// saving, the new password is hashed with every other user's salt and
// rejected if it matches.

const randomHex = (bytes: number) =>
  Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

const sha256Hex = async (text: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const generatePassword = () => {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'
  const chars = crypto.getRandomValues(new Uint8Array(8))
  const token = Array.from(chars)
    .map((b) => alphabet[b % alphabet.length])
    .join('')
  return `${token.slice(0, 4)}-${token.slice(4)}`
}

export function PasswordInput(props: ObjectInputProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const isSet = Boolean((props.value as {hash?: string} | undefined)?.hash)
  const documentId = (useFormValue(['_id']) as string).replace(/^drafts\./, '')
  const client = useClient({apiVersion: '2025-01-12'})

  const handleSave = useCallback(async () => {
    if (!password) return
    const others: {auth?: {hash?: string; salt?: string}}[] = await client.fetch(
      `*[_type == "siteUser" && !(_id in [$id, "drafts." + $id])]{ auth }`,
      {id: documentId},
    )
    for (const {auth} of others) {
      if (auth?.hash && auth.salt && (await sha256Hex(`${auth.salt}:${password}`)) === auth.hash) {
        setError('Another site user already has this password. Choose a different one.')
        return
      }
    }
    const salt = randomHex(16)
    const hash = await sha256Hex(`${salt}:${password}`)
    props.onChange(set({hash, salt}))
    setPassword('')
    setError(null)
  }, [password, props, client, documentId])

  return (
    <Stack space={3}>
      <Text size={1} muted>
        {isSet
          ? 'A password is set. Enter a new one to replace it — the password itself is not stored, so copy it before saving.'
          : 'No password set yet. Type one or generate one, then press Save. Copy it before saving — it cannot be shown again.'}
      </Text>
      <Flex gap={2}>
        <TextInput
          value={password}
          placeholder="Password"
          onChange={(event) => {
            setPassword(event.currentTarget.value)
            setError(null)
          }}
        />
        <Button mode="ghost" text="Generate" onClick={() => setPassword(generatePassword())} />
        <Button tone="primary" text="Save" disabled={!password} onClick={handleSave} />
      </Flex>
      {error && (
        <Card tone="critical" padding={3} radius={2}>
          <Text size={1}>{error}</Text>
        </Card>
      )}
    </Stack>
  )
}
