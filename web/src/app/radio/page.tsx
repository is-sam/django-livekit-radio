"use client";

import RadioApp from "@/app/radio/RadioApp";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function RadioPage() {
  return (
    <ProtectedRoute>
      <RadioApp />
    </ProtectedRoute>
  );
}
