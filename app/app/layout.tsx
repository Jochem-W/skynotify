/**
 * Copyright (C) 2024  Jochem-W
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import "./globals.css"
import OpenBackgroundNotifications from "@/components/openBackgroundNotifications"
import { Viewport } from "next"
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google"

const font = Noto_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
})

const mono = Noto_Sans_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-mono",
})

// TODO re-evaluate
export const viewport: Viewport = { interactiveWidget: "resizes-content" }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${font.variable} ${mono.variable} snap-y snap-mandatory scroll-smooth font-sans`}
    >
      <body className="mx-auto flex min-h-[100svh] flex-col items-center p-4">
        <div className="container relative flex max-w-xl grow flex-col gap-4">
          {children}
        </div>
        <OpenBackgroundNotifications></OpenBackgroundNotifications>
      </body>
    </html>
  )
}