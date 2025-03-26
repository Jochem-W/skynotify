/**
 * Copyright (C) 2024-2025  Jochem Waqué
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto flex max-w-xl grow flex-col gap-4 p-4">
      {children}
    </div>
  )
}
