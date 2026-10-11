"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/Header/Header';
import EnquiryForm from '@/components/enquiry/EnquiryForm';

export default function EnquiryPage() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Trigger transition shortly after mount
    const timer = setTimeout(() => setIsOpen(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header tone="dark" currentHref="/enquiry" />
      <EnquiryForm isOpen={isOpen} />
    </>
  );
}
