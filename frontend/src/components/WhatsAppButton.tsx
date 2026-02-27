import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  className?: string;
  message?: string;
  label?: string;
}

export default function WhatsAppButton({
  className = '',
  message = 'Hi, I want to book a demo session.',
  label = 'Book a Demo on WhatsApp',
}: WhatsAppButtonProps) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/919424135055?text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95 ${className}`}
      style={{ backgroundColor: '#25D366' }}
    >
      <MessageCircle className="w-4 h-4" />
      <span>{label}</span>
    </a>
  );
}
