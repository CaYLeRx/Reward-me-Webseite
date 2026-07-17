import { useEffect, useMemo, useRef, useState } from "react";
import { pageMeta, routes, templates } from "./templates.js";
import { Starfield } from "./Starfield.jsx";

const localeByTitle = {
  Deutsch: "de",
  English: "en",
  "Français": "fr",
  Italiano: "it",
};

const ui = {
  de: {
    openMenu: "Menü öffnen",
    closeMenu: "Menü schliessen",
    darkMode: "Dunkelmodus aktivieren",
    lightMode: "Hellmodus aktivieren",
    sending: "Wird gesendet…",
    sent: "Danke! Deine Anfrage wurde erfolgreich gesendet.",
    invalid: "Bitte fülle alle Pflichtfelder korrekt aus.",
    failed: "Die Anfrage konnte nicht gesendet werden. Bitte versuche es nochmals.",
  },
  en: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    darkMode: "Enable dark mode",
    lightMode: "Enable light mode",
    sending: "Sending…",
    sent: "Thank you! Your request was sent successfully.",
    invalid: "Please complete all required fields correctly.",
    failed: "The request could not be sent. Please try again.",
  },
  fr: {
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    darkMode: "Activer le mode sombre",
    lightMode: "Activer le mode clair",
    sending: "Envoi…",
    sent: "Merci ! Votre demande a bien été envoyée.",
    invalid: "Veuillez remplir correctement tous les champs obligatoires.",
    failed: "La demande n’a pas pu être envoyée. Veuillez réessayer.",
  },
  it: {
    openMenu: "Apri menu",
    closeMenu: "Chiudi menu",
    darkMode: "Attiva modalità scura",
    lightMode: "Attiva modalità chiara",
    sending: "Invio…",
    sent: "Grazie! La richiesta è stata inviata.",
    invalid: "Compila correttamente tutti i campi obbligatori.",
    failed: "Impossibile inviare la richiesta. Riprova.",
  },
};

function getRouteKey() {
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  return routes.find((route) => route.path === pathname)?.key ?? "home";
}

function getInitialLocale() {
  const stored = window.localStorage.getItem("reward-me-locale");
  return ["de", "en", "fr", "it"].includes(stored) ? stored : "de";
}

function menuIcon(open) {
  return open
    ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
    : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
}

function setThemeButtonState(button, theme, labels) {
  const dark = theme === "dark";
  const spans = button.querySelectorAll(":scope > span");
  if (spans[0]) spans[0].style.opacity = dark ? "0" : "1";
  if (spans[1]) spans[1].style.opacity = dark ? "1" : "0";
  const label = dark ? labels.lightMode : labels.darkMode;
  button.setAttribute("aria-label", label);
  button.title = label;
}

function decorateSparkleFrames(root) {
  const decorated = [];
  const candidates = root.querySelectorAll(".surface, main [class*='rounded-']");

  candidates.forEach((element, index) => {
    const classes = [...element.classList];
    const isSurface = element.classList.contains("surface");
    const isRounded = classes.some((className) => className.includes("rounded-"));
    const isBordered = classes.some(
      (className) => className === "border" || className.startsWith("border-"),
    );
    const isStructuralBox = ["DIV", "FORM", "ARTICLE", "LI"].includes(element.tagName);

    if ((!isSurface && !(isRounded && isBordered)) || !isStructuralBox) return;
    if (element.closest("header") || element.getAttribute("role") === "group") return;

    element.classList.add("sparkle-frame");
    element.style.setProperty("--sparkle-delay", `${-(index % 9) * 0.41}s`);
    const sparks = Array.from({ length: 4 }, (_, sparkIndex) => {
      const spark = document.createElement("span");
      spark.className = "edge-spark";
      spark.setAttribute("aria-hidden", "true");
      spark.style.setProperty("--spark-index", sparkIndex);
      spark.style.setProperty("--spark-start", `${sparkIndex * 25}%`);
      spark.style.setProperty("--spark-speed", `${4.2 + (index % 5) * 0.38}s`);
      spark.style.setProperty(
        "--spark-offset",
        `${-(sparkIndex * 1.07 + (index % 7) * 0.19)}s`,
      );
      element.append(spark);
      return spark;
    });
    decorated.push({ element, sparks });
  });

  return () => {
    decorated.forEach(({ element, sparks }) => {
      sparks.forEach((spark) => spark.remove());
      element.classList.remove("sparkle-frame");
      element.style.removeProperty("--sparkle-delay");
    });
  };
}

export function App() {
  const routeKey = useMemo(getRouteKey, []);
  const [locale, setLocale] = useState(getInitialLocale);
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const labels = ui[locale];
    const meta = pageMeta[routeKey][locale];
    document.documentElement.lang = meta.lang || locale;
    document.title = meta.title || "Reward Me. Belohnungen für bewusstes Verhalten.";
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta && meta.description) {
      descriptionMeta.setAttribute("content", meta.description);
    }
    document.body.className = "bg-night text-haze";
    window.localStorage.setItem("reward-me-locale", locale);

    let theme = window.localStorage.getItem("reward-me-theme") || "light";
    if (!['light', 'dark'].includes(theme)) theme = "light";
    document.documentElement.dataset.theme = theme;

    const cleanup = [];
    cleanup.push(decorateSparkleFrames(root));
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    root.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
    cleanup.push(() => revealObserver.disconnect());

    const header = root.querySelector("header");
    const updateHeader = () => {
      const scrolled = window.scrollY > 16;
      header?.classList.toggle("glass", scrolled);
      header?.classList.toggle("border-b", scrolled);
      header?.classList.toggle("border-edge/70", scrolled);
      header?.classList.toggle("bg-transparent", !scrolled);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    cleanup.push(() => window.removeEventListener("scroll", updateHeader));

    const themeButton = header?.querySelector("button[aria-label*='modus'], button[aria-label*='mode'], button[aria-label*='thème'], button[aria-label*='modalità']");
    if (themeButton) {
      setThemeButtonState(themeButton, theme, labels);
      const toggleTheme = () => {
        theme = theme === "light" ? "dark" : "light";
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem("reward-me-theme", theme);
        setThemeButtonState(themeButton, theme, labels);
      };
      themeButton.addEventListener("click", toggleTheme);
      cleanup.push(() => themeButton.removeEventListener("click", toggleTheme));
    }

    const menuButton = header?.querySelector("button[aria-expanded]");
    const menuPanel = header?.querySelector("div.max-h-0, div.max-h-\\[480px\\]");
    if (menuButton && menuPanel) {
      const setMenu = (open) => {
        menuButton.setAttribute("aria-expanded", String(open));
        menuButton.setAttribute("aria-label", open ? labels.closeMenu : labels.openMenu);
        menuButton.innerHTML = menuIcon(open);
        menuPanel.classList.toggle("max-h-0", !open);
        menuPanel.classList.toggle("max-h-[480px]", open);
      };
      const toggleMenu = () => setMenu(menuButton.getAttribute("aria-expanded") !== "true");
      menuButton.addEventListener("click", toggleMenu);
      menuPanel.querySelectorAll("a").forEach((link) => {
        const close = () => setMenu(false);
        link.addEventListener("click", close);
        cleanup.push(() => link.removeEventListener("click", close));
      });
      cleanup.push(() => menuButton.removeEventListener("click", toggleMenu));
    }

    root.querySelectorAll("button[title]").forEach((button) => {
      const nextLocale = localeByTitle[button.title];
      if (!nextLocale) return;
      const changeLocale = () => setLocale(nextLocale);
      button.addEventListener("click", changeLocale);
      cleanup.push(() => button.removeEventListener("click", changeLocale));
    });

    const form = root.querySelector("form");
    if (form) {
      const submitButton = form.querySelector("button[type='submit']");
      const originalButtonHtml = submitButton?.innerHTML || "";
      const feedback = document.createElement("p");
      feedback.className = "form-feedback";
      feedback.setAttribute("role", "status");
      form.append(feedback);

      const field = (id) => form.querySelector(`#${id}`);
      const setInvalid = (element, invalid) => {
        element?.setAttribute("aria-invalid", String(invalid));
        element?.classList.toggle("form-field-error", invalid);
      };

      const submit = async (event) => {
        event.preventDefault();
        const values = {
          company: field("company")?.value.trim() || "",
          industry: field("industry")?.value || "",
          name: field("name")?.value.trim() || "",
          email: field("email")?.value.trim() || "",
          package: field("package")?.value || "",
          message: field("message")?.value.trim() || "",
          locale,
        };
        const invalid = {
          company: values.company.length < 2,
          industry: !values.industry,
          name: values.name.length < 2,
          email: !/^\S+@\S+\.\S+$/.test(values.email),
          message: values.message.length < 10,
        };
        Object.entries(invalid).forEach(([id, bad]) => setInvalid(field(id), bad));
        if (Object.values(invalid).some(Boolean)) {
          feedback.dataset.state = "error";
          feedback.textContent = labels.invalid;
          field(Object.keys(invalid).find((id) => invalid[id]))?.focus();
          return;
        }

        feedback.textContent = "";
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = labels.sending;
        }
        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok || !result.ok) throw new Error(result.error || "Request failed");
          feedback.dataset.state = "success";
          feedback.textContent = labels.sent;
          form.reset();
        } catch {
          feedback.dataset.state = "error";
          feedback.textContent = labels.failed;
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonHtml;
          }
        }
      };
      form.addEventListener("submit", submit);
      cleanup.push(() => form.removeEventListener("submit", submit));
    }

    if (window.location.hash) {
      requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView());
    }

    return () => cleanup.forEach((fn) => fn());
  }, [locale, routeKey]);

  return (
    <>
      <Starfield />
      <div
        ref={rootRef}
        dangerouslySetInnerHTML={{ __html: templates[routeKey][locale] }}
      />
    </>
  );
}
