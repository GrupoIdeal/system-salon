import { MessageSquare, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-4 border-t border-border/50 bg-transparent">
      <div className="max-w-7xl mx-auto text-center px-4">
        <div className="flex items-center justify-center gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
            <span>Desenvolvido por Ideal Soluções Tecnológicas</span>
            <span className="inline-flex items-center gap-2">
              <a
                href="https://www.linkedin.com/in/ronnysenna"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="p-1 rounded-full text-gray-900 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/5585991904540"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                title="WhatsApp"
                className="p-1 rounded-full text-gray-900 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
