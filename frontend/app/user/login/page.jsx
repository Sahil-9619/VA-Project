"use client";
import { GalleryVerticalEnd } from "lucide-react";
import { LoginForm } from "../../../components/login-form";
import { useSelector } from "react-redux";
import Link from "next/link";
import { brandName } from "@/app/contants";


export default function LoginPage() {
  const { settings } = useSelector((state) => state.appSettings);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">          
            <div className="bg-primary h-11 w-14 text-primary-foreground   flex items-center justify-center rounded-md overflow-hidden">
              <img 
              src="/images/logo.png" 
              alt="Logo" className="h-8 w-auto object-contain" />
            </div>
            <Link href="/" className="text-primary font-bold text-2xl"
            >{brandName}</Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
