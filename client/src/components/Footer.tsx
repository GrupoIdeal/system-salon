import { useEffect, useState } from "react";
import { MessageSquare, Linkedin } from "lucide-react";

export default function Footer() {
  const [style, setStyle] = useState({ left: 0, width: window.innerWidth });

  useEffect(() => {
    const calculate = () => {
      // Tenta encontrar o container centralizador dentro do main
      const containerSelectors = [
        "main .max-w-7xl.mx-auto",
        "main .max-w-4xl.mx-auto",
        ".max-w-7xl.mx-auto",
        "main",
      ];

      let rect: DOMRect | null = null;

      for (const sel of containerSelectors) {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (el) {
          rect = el.getBoundingClientRect();
          break;
        }
      }

      if (!rect) {
        setStyle({ left: 0, width: window.innerWidth });
        return;
      }

      setStyle({
        left: Math.max(0, Math.round(rect.left)),
        width: Math.max(0, Math.round(rect.width)),
      });
    };

    calculate();

    const onResize = () => calculate();
    window.addEventListener("resize", onResize);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "sidebar-width") calculate();
    };
    window.addEventListener("storage", onStorage);

    const obs = new MutationObserver(() => calculate());
    obs.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("storage", onStorage);
      obs.disconnect();
    };
  }, []);

  return (
    <footer
      className="py-4 bg-transparent"
      style={{ marginLeft: `${style.left}px`, width: `${style.width}px` }}
    >
      <div className="max-w-7xl mx-auto text-center px-4">
        <div className="mt-2 flex items-center justify-center gap-3">
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
