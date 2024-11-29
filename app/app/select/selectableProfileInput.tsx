/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { SubscriptionLimit } from "@/util/env"
import { useDataStore } from "@/util/store"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { ChangeEvent } from "react"

export default function SelectableProfileInput({
  did,
}: Pick<ProfileView, "did">) {
  const selected = useDataStore((state) => state.selected)
  const setSelected = useDataStore((state) => state.setSelected)
  const setNotifyPosts = useDataStore((state) => state.setNotifyPosts)
  const isSelected = selected.has(did)

  function change(event: ChangeEvent<HTMLInputElement>) {
    setSelected(event.currentTarget.name, event.currentTarget.checked)
    if (event.currentTarget.checked) {
      setNotifyPosts(event.currentTarget.name, true)
    }
  }

  return (
    <input
      disabled={selected.size >= SubscriptionLimit && !isSelected}
      className="h-0 w-0"
      onChange={change}
      checked={isSelected}
      name={did}
      type="checkbox"
    ></input>
  )
}
