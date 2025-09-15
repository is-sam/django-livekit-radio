"use client";

import RadioApp from "./RadioApp";
import { AuthProvider } from "./AuthProvider";

export default function Page() {
  return (
    <AuthProvider>
      <RadioApp />
    </AuthProvider>
  );
}
