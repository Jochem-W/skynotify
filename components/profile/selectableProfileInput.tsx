/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import { useProfilesStore } from "../../util/profilesStore"
import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { ChangeEvent } from "react"

export default function SelectableProfileInput({
  did,
  defaultChecked,
}: Pick<ProfileView, "did"> & {
  defaultChecked: boolean
}) {
  const setSelected = useProfilesStore((state) => state.setSelected)

  function change(event: ChangeEvent<HTMLInputElement>) {
    setSelected(event.currentTarget.name, event.currentTarget.checked)
  }

  return (
    <input
      onChange={change}
      defaultChecked={defaultChecked}
      name={did}
      type="checkbox"
    ></input>
  )
}