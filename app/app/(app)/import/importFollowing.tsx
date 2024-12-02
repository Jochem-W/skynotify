/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useDataStore } from "@/util/store"
import { AtpAgent } from "@atproto/api"
import { XRPCError } from "@atproto/xrpc"
import { useRouter, useSearchParams } from "next/navigation"
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react"

export default function ImportFollowing() {
  const fetchProfiles = useDataStore((state) => state.fetchProfiles)
  const setActor = useDataStore((state) => state.setActor)
  const setFollowsCount = useDataStore((state) => state.setFollowsCount)
  const actor = useDataStore((state) => state.actor)
  const fetching = useDataStore((state) => state.fetching)
  const [error, setError] = useState<string>("")
  const params = useSearchParams()
  const router = useRouter()
  const atpAgent = useRef<AtpAgent>(null)
  const ref = useRef<HTMLInputElement>(null)
  const trySkip = useRef(true)
  const removedParam = useRef(false)

  const getFollowing = useCallback(
    async (actor: string) => {
      if (!atpAgent.current) {
        atpAgent.current = new AtpAgent({
          service: "https://public.api.bsky.app/",
        })
      }

      let followCount = 0
      for (const splitActor of actor.split(",")) {
        let response
        try {
          response = await atpAgent.current.getProfile({ actor: splitActor })
        } catch (e) {
          if (!(e instanceof XRPCError)) {
            setError("An unknown error ocurred, please try again later")
            return
          }

          setError("The given handle appears to be invalid")
          return
        }

        if (!response.success) {
          setError("An unknown error ocurred, please try again later")
          return
        }

        if (!response.data.followsCount) {
          setError("This account doesn't follow anyone")
          return
        }

        followCount += response.data.followsCount
      }

      setError("")
      setFollowsCount(followCount)
      setActor(actor)
      fetchProfiles(actor)
      router.push("/import/select")
    },
    [fetchProfiles, router, setActor, setFollowsCount],
  )

  function click() {
    if (!ref.current) {
      return
    }

    getFollowing(ref.current.value)
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      getFollowing(event.currentTarget.value)
    }
  }

  useEffect(() => {
    if (actor && params.has("continue") && trySkip.current) {
      trySkip.current = false
      removedParam.current = true
      router.replace("/import")
    }

    if (actor && !params.has("continue") && removedParam.current) {
      getFollowing(actor)
      removedParam.current = false
    }
  }, [params, actor, router, getFollowing])

  return (
    <>
      <input
        ref={ref}
        defaultValue={actor ?? undefined}
        className="w-full rounded-lg bg-neutral-100 p-2 font-mono dark:bg-neutral-800"
        spellCheck={false}
        type="url"
        onKeyDown={keyDown}
        placeholder="handle.bsky.social"
      ></input>
      {error && <span className="text-center text-red-500">{error}</span>}
      <button
        className="rounded-lg bg-blue-400 p-4 text-center transition-opacity hover:opacity-75 disabled:cursor-wait disabled:opacity-50 dark:bg-blue-600"
        onClick={click}
        type="button"
        disabled={fetching}
      >
        Import following
      </button>
    </>
  )
}