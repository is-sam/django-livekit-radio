"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { User, Upload, X } from "lucide-react";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/app/(auth)/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormState {
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
}

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const [formState, setFormState] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    profileImageUrl: null,
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const firstNameFromAuth = (user as { first_name?: string })?.first_name ?? "";
    const lastNameFromAuth = (user as { last_name?: string })?.last_name ?? "";
    const avatarFromAuth =
      (user as { profile_image_url?: string | null })?.profile_image_url ??
      (user as { avatar_url?: string | null })?.avatar_url ??
      null;

    setFormState({
      firstName: firstNameFromAuth,
      lastName: lastNameFromAuth,
      profileImageUrl: avatarFromAuth,
    });
  }, [user]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const displayName = [formState.firstName, formState.lastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ")
    .trim();

  const fallbackLabel =
    displayName || user?.username || user?.email || "Unnamed user";

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setFormState((previous) => ({
      ...previous,
      profileImageUrl: objectUrl,
    }));
  };

  const handleRemoveImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setFormState((previous) => ({
      ...previous,
      profileImageUrl: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("Profile changes saved locally (backend integration pending).");
    window.setTimeout(() => setStatusMessage(null), 4000);
  };

  const handlePasswordInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus("New passwords do not match.");
      window.setTimeout(() => setPasswordStatus(null), 4000);
      return;
    }

    setPasswordStatus("Password update saved locally (backend integration pending).");
    window.setTimeout(() => setPasswordStatus(null), 4000);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10 sm:py-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">Profile</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Review your personal details and update your profile picture. Changes are stored locally until the backend is connected.
        </p>
      </header>

      <Card className="border-white/10 bg-slate-900/80 text-white shadow-xl backdrop-blur">
        <CardHeader className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Upload profile picture"
          >
            <Avatar className="h-24 w-24 border border-white/10 transition group-hover:border-cyan-400/70">
              {formState.profileImageUrl ? (
                <AvatarImage src={formState.profileImageUrl} alt={`${fallbackLabel} avatar`} />
              ) : null}
              <AvatarFallback className="bg-cyan-500/10 text-cyan-300">
                <User className="h-10 w-10" aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <span className="pointer-events-none absolute inset-0 hidden items-center justify-center rounded-full bg-slate-950/70 text-xs font-medium text-cyan-100 group-hover:flex group-focus-visible:flex">
              Change photo
            </span>
          </button>
          <div className="text-center sm:text-left">
            <CardTitle className="text-xl font-semibold text-white">
              {fallbackLabel}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {user?.email ? user.email : "No email on file"}
            </CardDescription>
            {user?.username && (
              <p className="mt-2 text-xs tracking-wide text-slate-400">
                Username: {user.username}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formState.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formState.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Profile picture</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-white/10 bg-slate-900 text-white hover:border-cyan-500/60 hover:bg-cyan-500/10"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Upload new picture
                </Button>
                {formState.profileImageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemoveImage}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  id="profileImage"
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                For now, the selected picture is only visible in this preview. Backend integration will make it permanent later on.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {statusMessage && (
                <span className="text-sm text-cyan-300">{statusMessage}</span>
              )}
              <div className="flex gap-2 sm:justify-end">
                <Button
                  type="submit"
                  className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  Save changes
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-slate-900/80 text-white shadow-xl backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Security</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Update your password. Changes are applied once the backend is connected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Enter a new password"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordInputChange}
                  placeholder="Re-enter the new password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {passwordStatus && (
                <span className="text-sm text-cyan-300">{passwordStatus}</span>
              )}
              <div className="flex gap-2 sm:justify-end">
                <Button
                  type="submit"
                  className="bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  Update password
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
