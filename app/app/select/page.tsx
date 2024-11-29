/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import DeselectAll from "@/app/select/deselectAll"
import SearchableProfileList from "@/app/select/searchableProfileList"
import Footer from "@/components/footer"
import Header from "@/components/header"
import InstructionList from "@/components/instructionList"
import NoFollowing from "@/components/noFollowing"
import ProgressBar from "@/components/progressBar"
import { SubscriptionLimit } from "@/util/env"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Select profiles | SkyNotify",
  robots: "none",
}

export default function Page() {
  return (
    <>
      <NoFollowing></NoFollowing>
      <Header></Header>
      <main className="flex grow flex-col gap-4">
        <InstructionList step="select">
          <div className="flex flex-col gap-2">
            <p>
              Now, select up to {SubscriptionLimit} profiles you&apos;d like to
              receive notifications for. You&apos;ll be able to specify the
              kinds of notifications you&apos;d like to receive from each
              profile later.
            </p>
          </div>
          <DeselectAll></DeselectAll>
          <ProgressBar></ProgressBar>
          <SearchableProfileList></SearchableProfileList>
          <div className="sticky bottom-2 flex w-full after:absolute after:-bottom-2 after:z-0 after:h-[calc(100%+1rem)] after:w-full after:bg-white after:dark:bg-neutral-900">
            <Link
              href="specify"
              className="z-10 w-full rounded-lg bg-blue-400 p-4 text-center transition-opacity hover:opacity-75 dark:bg-blue-600"
            >
              Continue
            </Link>
          </div>
        </InstructionList>
      </main>
      <Footer></Footer>
    </>
  )
}
