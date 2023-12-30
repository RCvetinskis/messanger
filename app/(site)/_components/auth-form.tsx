"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { BsGithub, BsGoogle } from "react-icons/bs";
import { AuthSocialButton } from "./auth-social-btn";
import toast from "react-hot-toast";
import axios from "axios";

import { signIn, useSession } from "next-auth/react";
import { Input } from "@/components/inputs/input";
import { Button } from "@/components/button";
import { useRouter } from "next/navigation";

type Variant = "LOGIN" | "REGISTER";

export const AuthForm = () => {
  const session = useSession();
  const router = useRouter();

  const [variant, setVariant] = useState<Variant>("LOGIN");

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/users");
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    if (variant === "LOGIN") {
      setVariant("REGISTER");
    } else {
      setVariant("LOGIN");
    }
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    try {
      if (variant === "REGISTER") {
        startTransition(async () => {
          const res = await axios.post("/api/register", data);
          if (res && res.status === 200) {
            await signIn("credentials", {
              ...data,
              redirect: false,
            });
          }
        });
      }

      if (variant === "LOGIN") {
        startTransition(async () => {
          const res = await signIn("credentials", {
            ...data,
            redirect: false,
          });

          if (res?.error) {
            toast.error("Invalid Credentials");
          }
          if (res?.ok && !res?.error) {
            router.push("/users");
          }
        });
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const socialAction = (action: string) => {
    startTransition(async () => {
      try {
        const res = await signIn(action, {
          redirect: false,
        });
        if (res?.error) {
          toast.error("Invalid Credentials");
        }
        if (res?.ok && !res?.error) {
          toast.success("Logged in!");
        }
      } catch (error) {
        toast.error("Something went wrong");
      }
    });
  };
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "REGISTER" && (
            <Input
              id="name"
              label="name"
              register={register}
              errors={errors}
              disabled={isPending}
            />
          )}

          <Input
            id="email"
            label="Email adress"
            type="email"
            register={register}
            errors={errors}
            disabled={isPending}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            register={register}
            errors={errors}
            disabled={isPending}
          />
          <div>
            <Button disabled={isPending} fullWidth type="submit">
              {variant === "LOGIN" ? "Sign in" : "Register"}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continiue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialAction("github")}
            />
            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialAction("google")}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <div>
            {variant === "LOGIN"
              ? "New to Messanger?"
              : "Already have an account?"}
          </div>
          <div onClick={toggleVariant} className="underline cursor-pointer">
            {variant === "LOGIN" ? "Create an account" : "Login"}
          </div>
        </div>
      </div>
    </div>
  );
};
