import { whatsappUrl } from "@/lib/site";

export function WhatsAppButton({
  label = "Chat on WhatsApp",
  message,
  className = "",
}: {
  label?: string;
  message?: string;
  className?: string;
}) {
  const url = whatsappUrl(message);
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ||
        "inline-flex items-center gap-2 rounded-full border border-[#003118]/20 bg-white px-4 py-2 text-sm font-semibold text-[#003118] transition hover:border-[#003118]/40 hover:bg-[#fffdf0]"
      }
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4 text-[#25D366]"
        aria-hidden="true"
      >
        <path d="M12.04 2a9.9 9.9 0 0 0-8.4 15.15L2 22l4.99-1.6a9.9 9.9 0 1 0 5.05-18.4Zm0 1.8a8.1 8.1 0 1 1-4.13 15.07l-.3-.18-2.95.95.94-2.86-.2-.31A8.1 8.1 0 0 1 12.04 3.8Zm-3.4 4.02c-.18 0-.47.07-.71.34-.24.26-.94.9-.94 2.2 0 1.3.95 2.55 1.08 2.73.14.17 1.84 2.95 4.53 4.02 2.24.88 2.7.7 3.19.66.48-.04 1.57-.64 1.79-1.26.22-.62.22-1.15.15-1.26-.06-.11-.24-.17-.51-.3-.26-.13-1.57-.77-1.81-.86-.24-.08-.42-.13-.6.14-.17.26-.68.85-.83 1.02-.15.18-.3.2-.57.07a7.4 7.4 0 0 1-2.17-1.34 8.1 8.1 0 0 1-1.5-1.87c-.15-.26 0-.4.12-.53.12-.13.26-.3.4-.46.13-.15.17-.26.26-.43.09-.18.05-.33-.02-.46-.07-.13-.6-1.45-.82-1.98-.22-.53-.44-.45-.6-.46h-.51Z" />
      </svg>
      {label}
    </a>
  );
}
