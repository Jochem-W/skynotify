/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { updateToken } from "@/actions/updateToken"
import { AppBskyGraphGetFollows, AtpAgent } from "@atproto/api"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { parse, stringify } from "superjson"
import { create, StateCreator } from "zustand"
import { combine, persist, PersistStorage } from "zustand/middleware"
import { SubscriptionLimit } from "./env"

export type Profile = {
  handle: string
  displayName?: string
  description?: string
  avatar?: string
}

export function pickProfile({
  handle,
  displayName,
  description,
  avatar,
}: Pick<
  ProfileView,
  "handle" | "displayName" | "description" | "avatar"
>): Profile {
  return {
    handle,
    displayName,
    description,
    avatar: avatar?.replace("/avatar/", "/avatar_thumbnail/"),
  }
}

export function updateAllNotifyPosts() {
  useDataStore.setState(({ notifyPosts, selected }) => ({
    allNotifyPosts:
      notifyPosts.size >= selected.size &&
      selected.difference(notifyPosts).size === 0,
  }))
}

export function updateAllNotifyReposts() {
  useDataStore.setState(({ notifyReposts, selected }) => ({
    allNotifyReposts:
      notifyReposts.size >= selected.size &&
      selected.difference(notifyReposts).size === 0,
  }))
}

export function updateAllNotifyReplies() {
  useDataStore.setState(({ notifyReplies, selected }) => ({
    allNotifyReplies:
      notifyReplies.size >= selected.size &&
      selected.difference(notifyReplies).size === 0,
  }))
}
type Write<T, U> = Omit<T, keyof U> & U
type StateFromCombine<T> =
  T extends StateCreator<infer U>
    ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
      U extends Write<infer V, infer _>
      ? V
      : never
    : never

const combined = combine(
  {
    token: null as string | null,
    actor: null as string | null,
    followsCount: 0,
    fetching: false,
    fetchError: false,
    allNotifyPosts: false,
    allNotifyReposts: false,
    allNotifyReplies: false,
    profiles: new Map<string, Profile>(),
    selected: new Set<string>(),
    notifyPosts: new Set<string>(),
    notifyReposts: new Set<string>(),
    notifyReplies: new Set<string>(),
    savedConfiguration: new Map<
      string,
      { posts: boolean; replies: boolean; reposts: boolean }
    >(),
  },
  (set, get) => ({
    setToken: (token: string) =>
      set(({ token: previous }) => {
        if (token === previous) {
          return {}
        }

        if (previous === null) {
          return { token }
        }

        // TODO cursed, but seems to work
        updateToken(previous, token).catch(console.error)
        return { token }
      }),
    setActor: (actor: string) => set({ actor }),
    setFollowsCount: (followsCount: number) => set({ followsCount }),
    fetchProfiles: async (actor: string) => {
      if (get().fetching) {
        return
      }

      set({ fetching: true, profiles: new Map(), fetchError: false })

      const agent = new AtpAgent({
        service: "https://public.api.bsky.app/",
      })

      for (const splitActor of actor.split(",")) {
        let response: AppBskyGraphGetFollows.Response | undefined = undefined
        do {
          try {
            response = await agent.getFollows({
              actor: splitActor,
              limit: 100,
              cursor: response?.data.cursor,
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_) {
            set({ fetchError: true, fetching: false })
            return
          }

          set(({ profiles: oldProfiles }) => ({
            profiles: new Map([
              ...oldProfiles.entries(),
              ...response!.data.follows.map(
                (follow) => [follow.did, pickProfile(follow)] as const,
              ),
            ]),
          }))
        } while (response.data.cursor)
      }

      set(({ profiles, selected }) => ({
        fetching: false,
        selected: selected.intersection(new Set(profiles.keys())),
      }))
    },
    setSelected: (did: string, value?: boolean) =>
      set(({ selected }) => {
        const current = selected.has(did)
        if (value === current) {
          return {}
        }

        if (value === undefined) {
          value = !current
        }

        if (value) {
          const newSelected = new Set(selected).add(did)
          return { selected: newSelected }
        }

        selected.delete(did)
        return { selected: new Set(selected) }
      }),
    setNotifyPosts: (did: string, value?: boolean) =>
      set(({ notifyPosts }) => {
        const current = notifyPosts.has(did)
        if (value === current) {
          return {}
        }

        if (value === undefined) {
          value = !current
        }

        if (value) {
          return { notifyPosts: new Set(notifyPosts).add(did) }
        }

        notifyPosts.delete(did)
        return { notifyPosts: new Set(notifyPosts) }
      }),
    setNotifyReposts: (did: string, value?: boolean) =>
      set(({ notifyReposts }) => {
        const current = notifyReposts.has(did)
        if (value === current) {
          return {}
        }

        if (value === undefined) {
          value = !current
        }

        if (value) {
          return { notifyReposts: new Set(notifyReposts).add(did) }
        }

        notifyReposts.delete(did)
        return { notifyReposts: new Set(notifyReposts) }
      }),
    setNotifyReplies: (did: string, value?: boolean) =>
      set(({ notifyReplies }) => {
        const current = notifyReplies.has(did)
        if (value === current) {
          return {}
        }

        if (value === undefined) {
          value = !current
        }

        if (value) {
          return { notifyReplies: new Set(notifyReplies).add(did) }
        }

        notifyReplies.delete(did)
        return { notifyReplies: new Set(notifyReplies) }
      }),
    deselectAll: () => set(({}) => ({ selected: new Set() })),
    toggleNotifyPostsAll: () =>
      set(({ notifyPosts, selected }) => {
        if (selected.difference(notifyPosts).size === 0) {
          return { notifyPosts: new Set(), allnotifyPosts: false }
        }

        return { notifyPosts: new Set(selected), allnotifyPosts: true }
      }),
    toggleNotifyRepostsAll: () =>
      set(({ notifyReposts, selected }) => {
        if (selected.difference(notifyReposts).size === 0) {
          return { notifyReposts: new Set(), allnotifyReposts: false }
        }

        return { notifyReposts: new Set(selected), allnotifyReposts: true }
      }),
    toggleNotifyRepliesAll: () =>
      set(({ notifyReplies, selected }) => {
        if (selected.difference(notifyReplies).size === 0) {
          return { notifyReplies: new Set(), allnotifyReplies: false }
        }

        return { notifyReplies: new Set(selected), allnotifyReplies: true }
      }),
    saveCurrent: () =>
      set(({ notifyPosts, notifyReposts, notifyReplies, selected }) => ({
        savedConfiguration: new Map(
          [...selected.values()].slice(0, SubscriptionLimit).map((did) => [
            did,
            {
              posts: notifyPosts.has(did),
              reposts: notifyReposts.has(did),
              replies: notifyReplies.has(did),
            },
          ]),
        ),
      })),
    loadSaved: () =>
      set(({ savedConfiguration }) => ({
        selected: new Set(savedConfiguration.keys()),
        notifyPosts: new Set(
          [...savedConfiguration.entries()]
            .filter(([, { posts }]) => posts)
            .map(([did]) => did),
        ),
        notifyReplies: new Set(
          [...savedConfiguration.entries()]
            .filter(([, { replies }]) => replies)
            .map(([did]) => did),
        ),
        notifyReposts: new Set(
          [...savedConfiguration.entries()]
            .filter(([, { reposts }]) => reposts)
            .map(([did]) => did),
        ),
      })),
  }),
)

const storage: PersistStorage<StateFromCombine<typeof combined>> = {
  getItem: (name) => {
    const str = localStorage.getItem(name)
    if (!str) {
      return null
    }

    return parse(str)
  },
  setItem: (name, value) => {
    localStorage.setItem(name, stringify(value))
  },
  removeItem: (name) => localStorage.removeItem(name),
}

export const useDataStore = create(
  persist(combined, {
    name: "preferences",
    storage,
    partialize: (state) => ({
      actor: state.actor,
      savedConfiguration: state.savedConfiguration,
      token: state.token,
    }),
  }),
)
