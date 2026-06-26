"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authService } from "../services/user/auth.service";
import { adminServices } from "@/services/admin/admin.service";

export function RegisterForm({ className, ...props }) {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [errors, setErrors] = useState({});
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(undefined);


  useEffect(() => {
  const fetchClasses = async () => {
    try {
      const res = await adminServices.getAllClasses();
      const data = res?.data || [];

      // remove duplicates (same logic as your admin)
      const unique = [...new Map(data.map((i) => [i.className, i])).values()];

      setClasses(unique);
    } catch (err) {
      console.log(err);
    }
  };

  fetchClasses();
}, []);
  // 🔥 LIVE VALIDATION
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let error = "";

    if (!value) {
      error = "This field is required";
    }

    if (name === "email" && value) {
      if (!/\S+@\S+\.\S+/.test(value)) {
        error = "Invalid email format";
      }
    }
    // 🔥 block numbers in name, parent, city
if (["name", "parent", "city"].includes(name) && value) {
  if (/[0-9]/.test(value)) {
    error = "Numbers are not allowed";
  }
}

    if (name === "phone" && value) {
      if (!/^[0-9]*$/.test(value)) {
        error = "Only numbers allowed";
      } else if (value.length !== 10) {
        error = "Enter valid 10-digit number";
      }
    }

    if (name === "password" && value) {
      if (value.length < 6) {
        error = "Minimum 6 characters";
      } else if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
        error = "Must contain letter & number";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const name = formData.get("name");
    const phone = formData.get("phone");
    const parent = formData.get("parent");
    const city = formData.get("city");
    const userClass = selectedClass;

    const newErrors = {};
    

    if (!name) newErrors.name = "Name is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!phone) newErrors.phone = "Phone is required";
    if (!parent) newErrors.parent = "Parent name is required";
    if (!city) newErrors.city = "City is required";
    if (!userClass) newErrors.class = "Class is required";

    // 🔥 block numbers in name, parent, city
if (name && /[0-9]/.test(name)) {
  newErrors.name = "Numbers are not allowed";
}

if (parent && /[0-9]/.test(parent)) {
  newErrors.parent = "Numbers are not allowed";
}

if (city && /[0-9]/.test(city)) {
  newErrors.city = "Numbers are not allowed";
}
    // 🔥 extra validation
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = "Enter valid 10-digit number";
    }

    if (
      password &&
      (password.length < 6 ||
        !/[A-Za-z]/.test(password) ||
        !/[0-9]/.test(password))
    ) {
      newErrors.password =
        "Password must be 6+ chars with letter & number";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await authService.registerUser({
        name,
        email,
        password,
        phone,
        city,
        parent,
        class: userClass,
      });

      toast.success(response.message);
      setSignupEmail(email);
      setShowOtp(true);
    } catch (error) {
  const message = error.response?.data?.message;

  if (message === "Phone already registered") {
    setErrors((prev) => ({
      ...prev,
      phone: message,
    }));
  }

  if (message === "Email already registered") {
    setErrors((prev) => ({
      ...prev,
      email: message,
    }));
  }

  toast.error(message || "Signup failed");
}
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await authService.verifyEmail(signupEmail, otp);
      toast.success(response.message);
      router.push("/user/login");
    } catch (error) {
      setOtpError(true);
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
  };
return (
  <>
    {!showOtp ? (
      <form
        className={cn("flex flex-col gap-6", className)}
        {...props}
        onSubmit={handleSubmit}
      >
        {/* Heading */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">
            Register to your account
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your details below
          </p>
        </div>

        {/* Form */}
        <div className="grid gap-6 md:grid-cols-2">

          {[
            { label: "Full Name", name: "name", placeholder: "Enter full name" },
            { label: "Email", name: "email", type: "email", placeholder: "Enter email" },
            { label: "Password", name: "password", type: "password", placeholder: "Enter password" },
            { label: "Phone", name: "phone", placeholder: "Enter phone number" },
            { label: "Parent Name", name: "parent", placeholder: "Enter parent name" },
            { label: "City", name: "city", placeholder: "Enter city" },
            { label: "Class", name: "class", type: "select" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <Label htmlFor={field.name}>{field.label}</Label>

              {/* 🔥 SELECT FIELD */}
              {field.type === "select" ? (
                <>
<Select
  value={selectedClass ? String(selectedClass) : ""}
  onValueChange={(value) => {
    setSelectedClass(value);

    handleInputChange({
      target: { name: "class", value },
    });
  }}
>
  <SelectTrigger
    className={`w-full h-11 ${
      errors.class ? "border-red-500 focus:ring-red-500" : ""
    }`}
  >
    <SelectValue placeholder="Select Class" />
  </SelectTrigger>

  <SelectContent>
    {[...(classes || [])]
      .sort((a, b) =>
        String(a.className).localeCompare(
          String(b.className),
          undefined,
          { numeric: true }
        )
      )
      .map((cls) => (
        <SelectItem key={cls._id} value={String(cls.className)}>
          Class {cls.className}
        </SelectItem>
      ))}
  </SelectContent>
</Select>
                  {errors.class && (
                    <p className="text-red-500 text-sm">
                      {errors.class}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    onChange={handleInputChange}
                    inputMode={
                      field.name === "phone" ? "numeric" : undefined
                    }
                    className={
                      errors[field.name]
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />

                  {errors[field.name] && (
                    <p className="text-red-500 text-sm">
                      {errors[field.name]}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Hidden input (important for form submit) */}
          <input type="hidden" name="class" value={selectedClass} />

          {/* Button */}
          <div className="md:col-span-2">
            <Button type="submit" className="w-full">
              Register
            </Button>
          </div>
        </div>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/user/login" className="underline">
            Sign In
          </Link>
        </div>
      </form>
    ) : (
      <div className="flex flex-col gap-6 items-center">
        <h2 className="text-xl font-semibold">Verify OTP</h2>

        <InputOTP
          maxLength={5}
          value={otp}
          onChange={(value) => {
            setOtp(value);
            setOtpError(false);
          }}
        >
          <InputOTPGroup>
            {[0, 1, 2, 3, 4].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className={otpError ? "border-red-500" : ""}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <Button className="w-full" onClick={handleVerifyOtp}>
          Verify OTP
        </Button>
      </div>
    )}
  </>
);

}