/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { save } from "@/actions/save"
import { useDataStore } from "@/util/store"
import { FirebaseError } from "firebase/app"
import { getToken } from "firebase/messaging"
import { useState } from "react"

export default function SaveChangesButton() {
  const exportMap = useDataStore((state) => state.exportMap)
  const setToken = useDataStore((state) => state.setToken)
  const getMessaging = useDataStore((state) => state.getMessaging)
  const setUnsaved = useDataStore((state) => state.setUnsaved)
  const pruneProfiles = useDataStore((state) => state.pruneProfiles)
  const unsaved = useDataStore((state) => state.unsaved)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function click() {
    setSaving(true)
    const token = await subscribeToPush()
    if (!token) {
      setSaving(false)
      return
    }

    await setToken(token)

    const saved = await save(token, exportMap())
    setSaving(false)
    if (saved) {
      setUnsaved(false)
      pruneProfiles()
      return
    }

    setError(
      "An unexpected error occurred while saving the configuration, please try again later.",
    )
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready

    const messaging = getMessaging()
    let token
    try {
      token = await getToken(messaging, {
        serviceWorkerRegistration: registration,
        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      })
    } catch (err) {
      if (
        !(err instanceof FirebaseError) ||
        err.code !== "messaging/permission-blocked"
      ) {
        setError(
          "An unexpected error occurred while requesting notification access.",
        )
        return null
      }

      setError(
        "Notification permission was denied. You might need to manually allow access to notifications.",
      )
      return null
    }

    setError("")
    return token
  }

  if (!unsaved) {
    return null
  }

  return (
    <>
      {error && <p className="z-10 text-red-500">{error}</p>}
      <button
        onClick={click}
        disabled={saving || !unsaved}
        type="button"
        className={`${saving ? "cursor-wait" : ""} bg-primary z-10 w-full rounded-lg p-4 text-center transition-opacity hover:opacity-75 disabled:opacity-50`}
      >
        Save changes
      </button>
    </>
  )
}
