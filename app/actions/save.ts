/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
"use server"

import Drizzle from "@/util/db"
import { SubscriptionLimit } from "@/util/env"
import { subscriptionTable, tokenTable } from "@/util/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export async function save(
  token: string,
  subscriptions: Omit<typeof subscriptionTable.$inferInsert, "token">[],
) {
  try {
    await Drizzle.transaction(async (tx) => {
      const [user] = await tx
        .insert(tokenTable)
        .values({ token })
        .onConflictDoUpdate({
          target: [tokenTable.token],
          set: { unregistered: null },
        })
        .returning({ id: tokenTable.id })

      if (!user) {
        tx.rollback()
        return
      }

      await tx
        .delete(subscriptionTable)
        .where(eq(subscriptionTable.token, user.id))
      if (subscriptions.length === 0) {
        return
      }

      await tx
        .insert(subscriptionTable)
        .values(
          subscriptions
            .slice(0, SubscriptionLimit)
            .map((subscription) => ({ ...subscription, token: user.id })),
        )
        .onConflictDoNothing()
    })
  } catch (e) {
    console.error(e)
    return
  }

  redirect("/overview")
}
