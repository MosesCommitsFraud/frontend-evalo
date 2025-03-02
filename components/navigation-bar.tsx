import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { UserButton } from "@/components/user-button"

export function NavigationBar() {
  return (
    <nav className="relative z-50 border-b border-slate-800 bg-black/50 backdrop-blur-xl">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="flex items-center space-x-2">
          <Image
              src="/salamon-icon-white-1000.png"
              alt="Salamon"
              width={1000}
              height={1000}
              className="h-12 w-auto text-white"
          />
          <span className="text-2xl font-bold text-white">Salamon</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/collection">
            <Button variant="ghost" className="text-slate-300 hover:text-slate-100 hover:bg-slate-800/50">
              Collection
            </Button>
          </Link>
          <Link href="/universe">
            <Button variant="ghost" className="text-slate-300 hover:text-slate-100 hover:bg-slate-800/50">
              YGO-Universe
            </Button>
          </Link>
          <UserButton />
        </div>
      </div>
    </nav>
  )
}

