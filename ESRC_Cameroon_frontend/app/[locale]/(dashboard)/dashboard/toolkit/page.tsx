import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { InteractiveToolkit } from './interactive'

export default function ToolkitPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <Sidebar />
        <main className="flex-1 section-padding">
          <div className="container-width space-y-8">
            <div>
              <h1 className="font-display text-4xl text-foreground mb-2">Entrepreneur Toolkit</h1>
              <p className="text-muted-foreground">Interactive tools to help you plan, calculate, and validate your business ideas</p>
            </div>
            <InteractiveToolkit />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
