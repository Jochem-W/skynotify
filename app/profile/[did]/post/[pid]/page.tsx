/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect } from "react"

export default function Page() {
  const params: { did: string; pid: string } = useParams()

  const url = new URL(
    `https://bsky.app/profile/${decodeURIComponent(
      params.did,
    )}/post/${decodeURIComponent(params.pid)}`,
  )

  useEffect(() => {
    window.location.href = navigator.userAgent.toLowerCase().includes("android")
      ? `intent:/${url.pathname}#Intent;scheme=bluesky;package=xyz.blueskyweb.app;S.browser_fallback_url=${url};end`
      : url.toString()
  })

  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center gap-2">
      <span className="text-4xl">Opening in Bluesky...</span>
      <span className="text-xl">
        <Link href={url} className="text-blue-500 underline">
          Not opening? Click here
        </Link>
      </span>
    </div>
  )
}